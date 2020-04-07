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
		let existingPlayer = await Player.findOne(
			{
				connectionId: oldConnectionId,
			},
			{ relations: ['room'] }
		);
		if (existingPlayer) {
			existingPlayer.connectionId = newConnectionId;
			await existingPlayer.save();
		} else {
			existingPlayer = await RoomController.createNewPlayer(
				newConnectionId,
				playerName,
				requestedRoom
			);
		}
		await requestedRoom.reload();
		return { room: requestedRoom, player: existingPlayer };
	}

	/**
	 * Finds the room that a {@link Player} is a part of, and returns it
	 * @param connectionId The connectionId of the {@link Player}
	 */
	static async getRoom(connectionId: string): Promise<Room> {
		const player = await Player.findOneOrFail(
			{ connectionId },
			{ relations: ['room'] }
		);
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

		const cards = shuffle(allCards());

		if (initialBoard) {
			room.board = initialBoard;
		} else {
			room.board = cards.slice(0, initialBoardSize);
		}

		if (initialAvailbleCards) {
			room.availableCards = initialAvailbleCards;
		} else {
			room.availableCards = cards.slice(initialBoardSize);
		}
		for (const player of room.players) {
			player.points = 0;
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

		// Replace as many of the cards drawn as possible
		room.placeCardsOnBoard(numToDraw);

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
}
