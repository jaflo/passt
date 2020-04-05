import { Room, allCards, Card, cardsAreEqual } from '../entity/room';
import { Player } from '../entity/player';
import { customAlphabet } from 'nanoid';
import { shuffle, isASet, findSetIn } from '../shared';

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';
const nanoid = customAlphabet(ALPHABET, 6);

interface MovePlayed {
	player: Player;
	cards: Card[];
	updated: boolean;
	board: Card[];
	roomCode: string;
}

interface GameOver {
	isOver: boolean;
	players?: Player[];
}

export class RoomController {
	static INITIAL_BOARD_SIZE = 12;
	static NUM_TO_DRAW = 3;
	/**
	 * Creates a new {@link Room} and returns it.
	 */
	async createRoom(open: boolean, roomCode?: string) {
		if (!roomCode) {
			roomCode = nanoid();
		}
		const newRoom = new Room();
		newRoom.open = open;
		newRoom.roomCode = roomCode;
		return newRoom.save();
	}

	/**
	 * Creates a new {@link Player} and adds them to the {@link Room} specified by "roomCode"
	 * @param roomCode The code of the room the {@link Player} wants to join
	 * @param connectionId The connectionId of the {@link Player}
	 * @param playerName The name of the {@link Player}
	 */
	async joinRoom(roomCode: string, connectionId: string, playerName: string) {
		const room = await Room.findOneOrFail({ roomCode });
		const player = new Player();
		player.connectionId = connectionId;
		player.name = playerName;
		player.room = room;
		await player.save();

		await room.reload();
		return { room, player };
	}

	/**
	 * Removes a {@link Player} from an {@link Room}. If the room is empty after removing the Player, removes the Room.
	 * @param connectionId The connectionId of the {@link Player} that is leaving
	 */
	async leaveRoom(connectionId: string): Promise<Room | undefined> {
		const player = await Player.findOne(
			{ connectionId },
			{ relations: ['room'] }
		);
		if (!player) {
			console.error("Player not found. Can't notify rooms.");
			return undefined;
		}
		const { roomCode } = player.room;

		await player.remove();
		if (player.room.players.length - 1 === 0) {
			console.log('No players remaining.');
			await Room.delete({ roomCode });
			return undefined;
		}
		const room = await Room.findOne({ roomCode });
		return room;
	}

	/**
	 * Starts the room for a given player.
	 * @param connectionId The connectionId of the {@link Player}
	 * @param initialBoardSize The initial size of the board (by default, {@see RoomController.INITIAL_BOARD_SIZE})
	 * @param initialBoard The initial board state (overrides default generation behavior)
	 * @param initialAvailbleCards The initial availableCards state (overrides default generation behavior)
	 */
	async startRoom(
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
		room.started = true;

		return room.save();
	}

	/**
	 * Attempts to make a set from the provided {@link Card}s. If successful, draws 3 cards from the {@link Room}'s availableCards and places them on the boards, and updates the {@link Player}'s points.
	 * @param connectionId The connectionId of the {@link Player}
	 * @param cardIds The IDs of the {@link Card}s being played.
	 * @param numToDraw The number of {@link Card}s to draw. Default: {@see RoomController.NUM_TO_DRAW}
	 */
	async playMove(
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
