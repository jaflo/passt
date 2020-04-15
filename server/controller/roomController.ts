import { Room, allCards, Card } from '../entity/room';
import { Player } from '../entity/player';
import { customAlphabet } from 'nanoid';
import { shuffle, isASet, findSetIn } from '../shared';
import { LessThan, LessThanOrEqual } from 'typeorm';
import { request } from 'http';

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';
const nanoid = customAlphabet(ALPHABET, 6);

export class RoomController {
	static INITIAL_BOARD_SIZE = 12;
	static NUM_TO_DRAW = 3;
	static FLUSH_INTERVAL_MILLIS = 10 * 60 * 1000; // 10 min

	/**
	 * Removes all of the rooms that have no players.
	 */
	static async flushEmptyRooms() {
		const flushCutoff = new Date(
			Date.now() - RoomController.FLUSH_INTERVAL_MILLIS
		);
		const allRooms = await Room.find({
			where: { lastActive: LessThan(flushCutoff) },
		});
		const emptyRooms = allRooms.filter(room => room.players.length === 0);
		await Room.remove(emptyRooms);
	}

	/**
	 * Remove all players that are inactive and disconnected.
	 */
	static async flushInactiveDisconnectedPlayers(): Promise<{
		[key: string]: string[];
	}> {
		const flushCutoff = new Date(
			Date.now() - RoomController.FLUSH_INTERVAL_MILLIS
		);
		const affectedRoomsAndDisconnectedPlayers: {
			[key: string]: string[];
		} = {};
		const inactiveDisconnectedPlayers = await Player.find({
			where: {
				lastActive: LessThanOrEqual(flushCutoff),
				connected: false,
			},
			relations: ['room'],
		});
		await Player.remove(inactiveDisconnectedPlayers);

		for (const player of inactiveDisconnectedPlayers) {
			if (
				!(player.room.roomCode in affectedRoomsAndDisconnectedPlayers)
			) {
				affectedRoomsAndDisconnectedPlayers[player.room.roomCode] = [];
			}
			affectedRoomsAndDisconnectedPlayers[player.room.roomCode].push(
				player.connectionId
			);
		}
		return affectedRoomsAndDisconnectedPlayers;
	}
	/**
	 * Creates a new {@link Room} and returns it.
	 */
	static async createRoom(open: boolean, roomCode?: string) {
		if (!roomCode) {
			roomCode = nanoid();
		}
		const newRoom = new Room();
		newRoom.open = open;
		newRoom.roomCode = roomCode;
		return newRoom.save();
	}

	private static async createNewPlayer(
		connectionId: string,
		name: string,
		room: Room
	): Promise<Player> {
		const player = new Player();
		player.connectionId = connectionId;
		player.name = name;
		player.room = room;
		return player.save();
	}

	/**
	 * Creates a new {@link Player} and adds them to the {@link Room} specified by "roomCode"
	 * @param roomCode The code of the room the {@link Player} wants to join
	 * @param newConnectionId The connectionId of the {@link Player}
	 * @param playerName The name of the {@link Player}
	 */
	static async joinRoom(
		roomCode: string,
		newConnectionId: string,
		playerName: string,
		oldConnectionId?: string
	) {
		const requestedRoom = await Room.findOneOrFail({ roomCode });
		const existingPlayer = requestedRoom.players.find(
			player => player.connectionId === oldConnectionId
		);
		if (existingPlayer) {
			if (existingPlayer.connected) {
				throw new Error(`You can't join a room you're already in!`);
			}
			existingPlayer.connectionId = newConnectionId;
			existingPlayer.name = playerName;
			existingPlayer.connected = true;
			await existingPlayer.save();
			await requestedRoom.reload();
			return { room: requestedRoom, player: existingPlayer };
		}

		const newPlayer = await RoomController.createNewPlayer(
			newConnectionId,
			playerName,
			requestedRoom
		);
		await requestedRoom.reload();
		return { room: requestedRoom, player: newPlayer };
	}

	/**
	 * Marks a player as disconnected, and returns the affected room.
	 * @param connectionId The connectionId of the {@link Player} that has left
	 */
	static async leaveRoom(connectionId: string): Promise<Room> {
		const player = await Player.findOneOrFail(
			{ connectionId },
			{ relations: ['room'] }
		);
		player.connected = false;
		player.room.votesToClear = player.room.votesToClear.filter(
			name => name !== player.name
		);
		await player.room.save();
		await player.save();
		await player.room.reload();
		return player.room;
	}

	/**
	 * Starts the room for a given player.
	 * @param connectionId The connectionId of the {@link Player}
	 * @param initialBoardSize The initial size of the board (by default, {@see RoomController.INITIAL_BOARD_SIZE})
	 * @param initialBoard The initial board state (overrides default generation behavior)
	 * @param initialAvailbleCards The initial availableCards state (overrides default generation behavior)
	 */
	static async startRoom(
		connectionId: string,
		initialBoardSize = RoomController.INITIAL_BOARD_SIZE,
		initialBoard?: Card[],
		initialAvailbleCards?: Card[]
	) {
		const player = await Player.findOneOrFail(
			{ connectionId },
			{ relations: ['room'] }
		);
		const { room } = player;

		if (room.board.length !== 0) {
			throw Error(`Cannot start a game that is already in progress!`);
		}

		let cards = shuffle(allCards());

		if (initialBoard) {
			room.board = initialBoard;
		} else {
			room.board = cards.slice(0, initialBoardSize);
			while (!findSetIn(...cards.slice(0, initialBoardSize))) {
				cards = shuffle(allCards());
				room.board = cards.slice(0, initialBoardSize);
			}
		}

		if (initialAvailbleCards) {
			room.availableCards = initialAvailbleCards;
		} else {
			room.availableCards = cards.slice(initialBoardSize);
		}
		for (const player of room.players) {
			player.points = 0;
			player.save();
		}
		room.started = true;

		return room.save();
	}

	/**
	 * Attempts to make a set from the provided {@link Card}s. If successful, draws 3 cards from the {@link Room}'s availableCards and places them on the boards, and updates the {@link Player}'s points.
	 * @param connectionId The connectionId of the {@link Player}
	 * @param cardIds The IDs of the {@link Card}s being played.
	 * @param numToDraw The number of {@link Card}s to draw. Default: {@see RoomController.NUM_TO_DRAW}
	 */
	static async playMove(
		connectionId: string,
		cards: Card[],
		numToDraw = RoomController.NUM_TO_DRAW
	): Promise<{
		player: Player;
		cards: Card[];
		updated: boolean;
		board: Card[];
		roomCode: string;
		isOver: boolean;
		players?: Player[];
	}> {
		if (cards.length !== numToDraw) {
			throw new Error(
				`Expected ${numToDraw} cards to be played, got ${cards.length} cards.`
			);
		}
		const player = await Player.findOneOrFail(
			{ connectionId },
			{ relations: ['room'] }
		);
		const room = await Room.findOneOrFail({
			roomCode: player.room.roomCode,
		});

		if (!room.started) {
			throw new Error(
				`A move was attempted for Room ${room.roomCode}, but it has not started yet.`
			);
		}

		// Find the matching cards on the board (or error if they don't exist).
		if (!room.cardsAreAllOnBoard(cards) || !isASet(...cards)) {
			return {
				player,
				cards,
				updated: false,
				board: room.board,
				isOver: false,
				roomCode: room.roomCode,
			};
		}

		// It's a set, update board and points
		player.points += 1;
		await player.save();

		room.votesToClear = [];
		room.removeCardsFromBoard(cards);

		// If no moves can be played, the game is over.
		if (room.cantPlayAnotherMove()) {
			await room.reload();
			room.board = [];
			room.availableCards = [];
			await room.save();
			return {
				player,
				cards,
				updated: true,
				board: room.board,
				roomCode: room.roomCode,
				isOver: true,
				players: room.players,
			};
		}

		// Replace cards if there aren't enough.
		if (room.board.length < RoomController.INITIAL_BOARD_SIZE) {
			room.placeCardsOnBoard(numToDraw);
		}

		// If a set isn't on the board, draw numToDraw more cards until one exists. (Shouldn't exceed 20).
		while (!findSetIn(...room.board)) {
			room.placeCardsOnBoard(numToDraw);
		}

		// Update database records
		await room.save();

		return {
			player,
			cards,
			board: room.board,
			updated: true,
			isOver: false,
			roomCode: room.roomCode,
		};
	}

	/**
	 * Adds the player's vote to clear the board. If the players who voted to clear the board constitute a majority,
	 * clears the board and redraws INITIAL_BOARD_SIZE cards.
	 * @param connectionId The connection ID of the player who is voting to clear the board
	 */
	static async voteToClearBoard(
		connectionId: string
	): Promise<{ room: Room; cleared: boolean } | null> {
		const player = await Player.findOneOrFail(
			{ connectionId },
			{ relations: ['room'] }
		);
		const room = await Room.findOneOrFail({
			roomCode: player.room.roomCode,
		});

		if (!room.started) {
			throw new Error(
				`A vote was cast to clear the board for room ${room.roomCode}, but it has not started yet.`
			);
		}

		if (room.votesToClear.includes(player.name)) {
			return null;
		}
		room.votesToClear.push(player.name);

		// This vote makes a majority, flush the board
		const needToClear =
			room.votesToClear.length >= Math.round(room.players.length / 2);
		if (needToClear) {
			room.clearBoard();
			room.votesToClear = [];
			room.placeCardsOnBoard(RoomController.INITIAL_BOARD_SIZE);
		}
		await room.save();
		return { room, cleared: needToClear };
	}
}
