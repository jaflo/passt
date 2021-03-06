import '../testSetup.test';
import { RoomController } from '../../server/controller/roomController';
import assert from 'assert';
import { Player } from '../../server/entity/player';
import {
	Room,
	Card,
	Color,
	Shape,
	FillStyle,
	cardsAreEqual,
} from '../../server/entity/room';
import { getConnection } from 'typeorm';
import { findSetIn } from '../../server/shared';
import { customAlphabet } from 'nanoid';

const MOCK_CONNECTION_ID = 'MOCK_CONNECTION_ID';
const MOCK_PLAYER_NAME = 'MOCK_PLAYER_NAME';

describe('RoomController', () => {
	const setUpARoom = async (
		open: boolean,
		connectionIds: string[],
		playerNames: string[]
	) => {
		let room = await RoomController.createRoom(open);
		assert.strictEqual(
			connectionIds.length,
			playerNames.length,
			'Provided connectionIds and playerNames must be same length.'
		);
		const players: Player[] = [];
		for (let i = 0; i < connectionIds.length; ++i) {
			const {
				room: updatedRoom,
				player: newPlayer,
			} = await RoomController.joinRoom(
				room.roomCode,
				connectionIds[i],
				playerNames[i]
			);
			players.push(newPlayer);
			room = updatedRoom;
		}
		return { room, players };
	};

	describe('flushOldRooms', () => {
		const NUM_ROOMS_WITH_PLAYERS = 10;
		const NUM_PLAYERS = 1;
		const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';
		const nanoid = customAlphabet(ALPHABET, 23);
		beforeEach(async () => {
			for (let i = 0; i < NUM_ROOMS_WITH_PLAYERS; ++i) {
				const mockConnectionIds: string[] = [];
				const mockNames: string[] = [];
				for (let j = 0; j < NUM_PLAYERS; ++j) {
					mockConnectionIds.push(nanoid());
					mockNames.push(nanoid());
				}
				await setUpARoom(false, mockConnectionIds, mockNames);
			}
		});
		it('should flush all of the rooms that are empty', async () => {
			await getConnection()
				.createQueryBuilder()
				.insert()
				.into(Room)
				.values({
					roomCode: 'dead',
					lastActive: new Date(
						Date.now() - RoomController.FLUSH_INTERVAL_MILLIS
					),
				})
				.execute();

			await RoomController.flushEmptyRooms();

			assert.strictEqual(await Room.count({}), NUM_ROOMS_WITH_PLAYERS);
		});
	});

	describe('flushInactiveDisconnectedPlayers', () => {
		const DISCONNECTED_INACTIVE_PLAYER_ID = '1';
		const MOCK_PLAYER_VALUES = [
			{
				// Inactive AND disconnected
				connectionId: DISCONNECTED_INACTIVE_PLAYER_ID,
				name: 'A',
				lastActive: new Date(
					Date.now() - RoomController.FLUSH_INTERVAL_MILLIS
				),
				connected: false,
			},
			{
				// Active AND disconnected
				connectionId: '2',
				name: 'B',
				lastActive: new Date(
					Date.now() -
						Math.floor(RoomController.FLUSH_INTERVAL_MILLIS / 2)
				),
				connected: false,
			},
			{
				// Active and connected
				connectionId: '3',
				name: 'C',
				lastActive: new Date(
					Date.now() -
						Math.floor(RoomController.FLUSH_INTERVAL_MILLIS / 2)
				),
				connected: true,
			},
			{
				// Active and disconnected
				connectionId: '4',
				name: 'D',
				lastActive: new Date(
					Date.now() -
						Math.floor(RoomController.FLUSH_INTERVAL_MILLIS / 2)
				),
				connected: false,
			},
		];
		let room: Room;
		beforeEach(async () => {
			room = (await setUpARoom(false, [], [])).room;
			await getConnection()
				.createQueryBuilder()
				.insert()
				.into(Player)
				.values(MOCK_PLAYER_VALUES.map(v => ({ ...v, room })))
				.execute();
		});

		it('should remove all of the old players that are inactive and disconnected', async () => {
			await RoomController.flushInactiveDisconnectedPlayers();

			assert.strictEqual(await Player.count({}), 3);
		});

		it('should return the affected rooms and the affected player IDs', async () => {
			const affectedRooms = await RoomController.flushInactiveDisconnectedPlayers();

			assert.strictEqual(Object.keys(affectedRooms).length, 1);
			const affectedRoomCode = Object.keys(affectedRooms)[0];

			assert.strictEqual(affectedRoomCode, room.roomCode);
			const affectedPlayerIds = affectedRooms[affectedRoomCode];

			assert.strictEqual(affectedPlayerIds.length, 1);
			assert.strictEqual(
				affectedPlayerIds[0],
				DISCONNECTED_INACTIVE_PLAYER_ID
			);
		});
	});
	describe('createRoom', () => {
		it('should create a room and return it', async () => {
			const newRoom = await RoomController.createRoom(false);
			assert.notStrictEqual(newRoom, null);
		});
	});

	describe('joinRoom', () => {
		it('should add the player to the room', async () => {
			const newRoom = await RoomController.createRoom(false);

			const { room: updatedRoom } = await RoomController.joinRoom(
				newRoom.roomCode,
				MOCK_CONNECTION_ID,
				MOCK_PLAYER_NAME
			);

			assert.strictEqual(updatedRoom.players.length, 1);
		});

		it('should fail if the room does not exist', async () => {
			assert.rejects(
				RoomController.joinRoom(
					'bad',
					MOCK_CONNECTION_ID,
					MOCK_PLAYER_NAME
				)
			);
		});

		it('should allow a user to rejoin a room that they disconnected from', async () => {
			const newMockConnectionId = 'NEW_MOCK_CONNECTION_ID';
			const { roomCode } = await RoomController.createRoom(false);
			const { room: oldRoom } = await RoomController.joinRoom(
				roomCode,
				MOCK_CONNECTION_ID,
				MOCK_PLAYER_NAME
			);
			assert.strictEqual(
				oldRoom.players[0].connectionId,
				MOCK_CONNECTION_ID
			);

			const leftRoom = await RoomController.leaveRoom(MOCK_CONNECTION_ID);

			assert.strictEqual(leftRoom.players[0].connected, false);

			const {
				room: newRoom,
				player: newPlayer,
			} = await RoomController.joinRoom(
				oldRoom.roomCode,
				newMockConnectionId,
				MOCK_PLAYER_NAME,
				MOCK_CONNECTION_ID
			);

			assert.strictEqual(newPlayer.connectionId, newMockConnectionId);
			assert.strictEqual(newRoom.players.length, 1);
			assert.strictEqual(
				newRoom.players[0].connectionId,
				newMockConnectionId
			);
			assert.strictEqual(newRoom.players[0].connected, true);
		});
	});

	describe('leaveRoom', () => {
		it('should retrieve the room a player is a part of', async () => {
			const { room } = await setUpARoom(
				false,
				[MOCK_CONNECTION_ID],
				[MOCK_PLAYER_NAME]
			);

			const playerRoom = await RoomController.leaveRoom(
				MOCK_CONNECTION_ID
			);

			assert.strictEqual(room.roomCode, playerRoom?.roomCode);
			assert.strictEqual(playerRoom.players[0].connected, false);
		});

		it("should remove the player's vote from the votesToClear", async () => {
			await setUpARoom(
				false,
				[MOCK_CONNECTION_ID, 'DUMMY', 'DUMMY2'],
				[MOCK_PLAYER_NAME, 'B', 'C']
			);
			await RoomController.startRoom(MOCK_CONNECTION_ID);

			const { room } = (await RoomController.voteToClearBoard(
				MOCK_CONNECTION_ID
			))!;
			assert.strictEqual(room.votesToClear.length, 1);

			const playerRoom = await RoomController.leaveRoom(
				MOCK_CONNECTION_ID
			);
			assert.strictEqual(playerRoom.votesToClear.length, 0);
		});
	});

	describe('startRoom', () => {
		it('should start the room', async () => {
			await setUpARoom(false, [MOCK_CONNECTION_ID], [MOCK_PLAYER_NAME]);

			const updatedRoom = await RoomController.startRoom(
				MOCK_CONNECTION_ID
			);

			assert.strictEqual(updatedRoom.started, true);
			assert.strictEqual(
				updatedRoom.board.length,
				RoomController.INITIAL_BOARD_SIZE
			);
		});

		it('should fail if the room has already started', async () => {
			await setUpARoom(false, [MOCK_CONNECTION_ID], [MOCK_PLAYER_NAME]);

			await RoomController.startRoom(MOCK_CONNECTION_ID);
			assert.rejects(RoomController.startRoom(MOCK_CONNECTION_ID));
		});

		it('should fail if the room does not exist', async () => {
			assert.rejects(RoomController.startRoom(MOCK_CONNECTION_ID));
		});
	});

	describe('playMove', () => {
		const fakeSet: Card[] = [
			{
				color: Color.RED,
				shape: Shape.CIRCLE,
				fillStyle: FillStyle.EMPTY,
				number: 1,
			},
			{
				color: Color.BLUE,
				shape: Shape.SQUARE,
				fillStyle: FillStyle.FILLED,
				number: 2,
			},
			{
				color: Color.GREEN,
				shape: Shape.TRIANGLE,
				fillStyle: FillStyle.LINED,
				number: 3,
			},
		];

		it('should return the new board if successful', async () => {
			await setUpARoom(false, [MOCK_CONNECTION_ID], [MOCK_PLAYER_NAME]);
			// Mathematical proof indicating that a set must exist within 20 cards
			const { board } = await RoomController.startRoom(
				MOCK_CONNECTION_ID,
				20
			);
			const realSet = findSetIn(...board)!;

			const {
				board: updatedBoard,
				updated,
			} = await RoomController.playMove(MOCK_CONNECTION_ID, realSet);

			assert.strictEqual(updated, true);
			const playedCardsStillOnBoard = updatedBoard.filter(c =>
				realSet.includes(c)
			).length;
			assert.strictEqual(playedCardsStillOnBoard, 0);
		});

		it('should clear votesToClear', async () => {
			const {
				room: { roomCode },
			} = await setUpARoom(
				false,
				[MOCK_CONNECTION_ID, 'DUMMY', 'DUMMY2'],
				[MOCK_PLAYER_NAME, 'B', 'C']
			);
			const { board } = await RoomController.startRoom(
				MOCK_CONNECTION_ID,
				20
			);
			await RoomController.voteToClearBoard(MOCK_CONNECTION_ID);
			const room = await Room.findOneOrFail({ roomCode });
			assert.strictEqual(room.votesToClear.length, 1);
			const realSet = findSetIn(...board)!;

			await RoomController.playMove(MOCK_CONNECTION_ID, realSet);
			await room.reload();
			assert.strictEqual(room.votesToClear.length, 0);
		});

		it('should fail if the room has not started', async () => {
			await setUpARoom(false, [MOCK_CONNECTION_ID], [MOCK_PLAYER_NAME]);

			assert.rejects(
				RoomController.playMove(MOCK_CONNECTION_ID, fakeSet)
			);
		});

		it('should fail if the Player does not exist', async () => {
			await RoomController.createRoom(false);

			assert.rejects(
				RoomController.playMove(MOCK_CONNECTION_ID, fakeSet)
			);
		});

		it('should fail if an improper number of cards are provided', async () => {
			await setUpARoom(false, [MOCK_CONNECTION_ID], [MOCK_PLAYER_NAME]);
			await RoomController.startRoom(MOCK_CONNECTION_ID);

			assert.rejects(
				RoomController.playMove(MOCK_CONNECTION_ID, fakeSet.slice(0, 2))
			);
		});

		it('should indicate that the game is over', async () => {
			const initialBoard: Card[] = [
				{
					color: Color.RED,
					shape: Shape.CIRCLE,
					fillStyle: FillStyle.EMPTY,
					number: 1,
				},
				{
					color: Color.BLUE,
					shape: Shape.SQUARE,
					fillStyle: FillStyle.FILLED,
					number: 2,
				},
				{
					color: Color.GREEN,
					shape: Shape.TRIANGLE,
					fillStyle: FillStyle.LINED,
					number: 3,
				},
			];
			const initialAvailableCards = [];
			await setUpARoom(false, [MOCK_CONNECTION_ID], [MOCK_PLAYER_NAME]);
			await RoomController.startRoom(
				MOCK_CONNECTION_ID,
				3,
				initialBoard,
				initialAvailableCards
			);

			const result = await RoomController.playMove(
				MOCK_CONNECTION_ID,
				initialBoard
			);

			assert.strictEqual(result.isOver, true);
		});

		it('should clear the votesToClear if the game is over', async () => {
			const initialBoard: Card[] = [
				{
					color: Color.RED,
					shape: Shape.CIRCLE,
					fillStyle: FillStyle.EMPTY,
					number: 1,
				},
				{
					color: Color.BLUE,
					shape: Shape.SQUARE,
					fillStyle: FillStyle.FILLED,
					number: 2,
				},
				{
					color: Color.GREEN,
					shape: Shape.TRIANGLE,
					fillStyle: FillStyle.LINED,
					number: 3,
				},
			];
			const initialAvailableCards = [];
			const {
				room: { roomCode },
			} = await setUpARoom(
				false,
				[MOCK_CONNECTION_ID, '2', '3'],
				[MOCK_PLAYER_NAME, 'A', 'B']
			);
			await RoomController.startRoom(
				MOCK_CONNECTION_ID,
				3,
				initialBoard,
				initialAvailableCards
			);

			const { room } = (await RoomController.voteToClearBoard(
				MOCK_CONNECTION_ID
			))!;
			assert.strictEqual(room.votesToClear.length, 1);
			await RoomController.playMove(MOCK_CONNECTION_ID, initialBoard);

			const newRoom = await Room.findOneOrFail({ roomCode });
			assert.strictEqual(newRoom.votesToClear.length, 0);
		});

		it('should provide the final player scores if the game is over', async () => {
			const initialBoard: Card[] = [
				{
					color: Color.RED,
					shape: Shape.CIRCLE,
					fillStyle: FillStyle.EMPTY,
					number: 1,
				},
				{
					color: Color.BLUE,
					shape: Shape.SQUARE,
					fillStyle: FillStyle.FILLED,
					number: 2,
				},
				{
					color: Color.GREEN,
					shape: Shape.TRIANGLE,
					fillStyle: FillStyle.LINED,
					number: 3,
				},
			];
			const initialAvailableCards = [];
			await setUpARoom(false, [MOCK_CONNECTION_ID], [MOCK_PLAYER_NAME]);
			await RoomController.startRoom(
				MOCK_CONNECTION_ID,
				3,
				initialBoard,
				initialAvailableCards
			);

			const result = await RoomController.playMove(
				MOCK_CONNECTION_ID,
				initialBoard
			);

			assert.strictEqual(result.players![0].points, 1);
		});
	});

	describe('voteToClearBoard', () => {
		const MOCK_CONNECTION_IDS = [
			MOCK_CONNECTION_ID,
			'MOCK_CONNECTION_ID_2',
			'MOCK_CONNECTION_ID_3',
		];
		const MOCK_NAMES = [MOCK_PLAYER_NAME, 'B', 'C'];
		it("should add a player's vote to clear the room", async () => {
			await setUpARoom(false, MOCK_CONNECTION_IDS, MOCK_NAMES);
			const startedRoom = await RoomController.startRoom(
				MOCK_CONNECTION_ID
			);
			assert.strictEqual(startedRoom.votesToClear.length, 0);

			const { room } = (await RoomController.voteToClearBoard(
				MOCK_CONNECTION_ID
			))!;
			assert.strictEqual(room.votesToClear.length, 1);
			assert.strictEqual(room.votesToClear[0], MOCK_CONNECTION_ID);
		});

		it("should not add a player's vote twice", async () => {
			const {
				room: { roomCode },
			} = await setUpARoom(false, MOCK_CONNECTION_IDS, MOCK_NAMES);
			await RoomController.startRoom(MOCK_CONNECTION_ID);

			await RoomController.voteToClearBoard(MOCK_CONNECTION_ID);
			const result = await RoomController.voteToClearBoard(
				MOCK_CONNECTION_ID
			);

			assert.strictEqual(result, null);
			const room = await Room.findOneOrFail({ roomCode });
			assert.strictEqual(room.votesToClear.length, 1);
		});

		it('should not clear the board if a minority have voted', async () => {
			await setUpARoom(false, MOCK_CONNECTION_IDS, MOCK_NAMES);
			const startedRoom = await RoomController.startRoom(
				MOCK_CONNECTION_ID
			);
			assert.strictEqual(startedRoom.votesToClear.length, 0);

			const { room, cleared } = (await RoomController.voteToClearBoard(
				MOCK_CONNECTION_ID
			))!;

			assert.strictEqual(cleared, false);
			const expectedBoard = startedRoom.board;
			const actualBoard = room.board;
			const boardHasntChanged = expectedBoard
				.map(
					expectedCard =>
						actualBoard.filter(actualCard =>
							cardsAreEqual(expectedCard, actualCard)
						).length === 1
				)
				.every(b => b);
			assert.strictEqual(boardHasntChanged, true);
		});

		it('should not count disconnected players in the voting majority', async () => {
			await setUpARoom(false, MOCK_CONNECTION_IDS, MOCK_NAMES);
			await RoomController.startRoom(MOCK_CONNECTION_ID);
			await RoomController.leaveRoom(MOCK_CONNECTION_ID);

			const { cleared } = (await RoomController.voteToClearBoard(
				MOCK_CONNECTION_IDS[1]
			))!;
			assert.strictEqual(cleared, true);
		});

		it('should clear the room if a majority vote to clear', async () => {
			await setUpARoom(false, MOCK_CONNECTION_IDS, MOCK_NAMES);
			const startedRoom = await RoomController.startRoom(
				MOCK_CONNECTION_ID
			);
			assert.strictEqual(startedRoom.votesToClear.length, 0);

			await RoomController.voteToClearBoard(MOCK_CONNECTION_ID);
			const { room, cleared } = (await RoomController.voteToClearBoard(
				MOCK_CONNECTION_IDS[1]
			))!;

			assert.strictEqual(cleared, true);
			const expectedBoard = startedRoom.board;
			const actualBoard = room.board;
			const boardIsSame = expectedBoard
				.map(
					expectedCard =>
						actualBoard.filter(actualCard =>
							cardsAreEqual(expectedCard, actualCard)
						).length === 1
				)
				.every(b => b);
			assert.strictEqual(boardIsSame, false);
		});

		it('should fail if the room has not started', async () => {
			await setUpARoom(false, MOCK_CONNECTION_IDS, MOCK_NAMES);

			assert.rejects(RoomController.voteToClearBoard(MOCK_CONNECTION_ID));
		});
	});

	afterEach(async () => {
		await Player.delete({});
		await Room.delete({});
	});
});
