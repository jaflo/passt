import '../testSetup.test';
import { RoomController } from '../../server/controller/roomController';
import assert from 'assert';
import { Player } from '../../server/entity/player.entity';
import { findSetIn } from '../../server/shared';
import {
  Color,
  Shape,
  Card,
  FillStyle,
  Room,
} from '../../server/entity/room.entity';

const MOCK_CONNECTION_ID = 'MOCK_CONNECTION_ID';
const MOCK_PLAYER_NAME = 'MOCK_NAME';
describe('RoomController', () => {
  let roomController: RoomController;
  beforeEach(() => {
    roomController = new RoomController();
  });

  const setUpARoom = async (
    open: boolean,
    connectionIds: string[],
    playerNames: string[]
  ) => {
    let room = await roomController.createRoom(open);
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
      } = await roomController.joinRoom(
        room.roomCode,
        connectionIds[i],
        playerNames[i]
      );
      players.push(newPlayer);
      room = updatedRoom;
    }
    return { room, players };
  };
  describe('createRoom', () => {
    it('should create a room and return it', async () => {
      const newRoom = await roomController.createRoom(false);
      assert.notStrictEqual(newRoom, null);
    });
  });

  describe('joinRoom', () => {
    it('should add the player to the room', async () => {
      const newRoom = await roomController.createRoom(false);

      const { room: updatedRoom } = await roomController.joinRoom(
        newRoom.roomCode,
        MOCK_CONNECTION_ID,
        MOCK_PLAYER_NAME
      );

      assert.strictEqual(updatedRoom.players.length, 1);
    });

    it('should fail if the room does not exist', async () => {
      assert.rejects(
        roomController.joinRoom('bad', MOCK_CONNECTION_ID, MOCK_PLAYER_NAME)
      );
    });
  });

  describe('leaveRoom', () => {
    it('should remove the player from the room', async () => {
      const { room } = await setUpARoom(
        false,
        [MOCK_CONNECTION_ID, 'MOCK_CONNECTION_ID_2'],
        [MOCK_PLAYER_NAME, 'MOCK_PLAYER_NAME_2']
      );
      assert.strictEqual(room.players.length, 2);

      const updatedRoom = (await roomController.leaveRoom(MOCK_CONNECTION_ID))!;

      assert.strictEqual(updatedRoom.players.length, 1);
    });

    it('should delete the player from the database', async () => {
      const { room } = await setUpARoom(
        false,
        [MOCK_CONNECTION_ID, 'MOCK_CONNECTION_ID_2'],
        [MOCK_PLAYER_NAME, 'MOCK_PLAYER_NAME_2']
      );
      assert.strictEqual(room.players.length, 2);

      await roomController.leaveRoom(MOCK_CONNECTION_ID);

      const player = await Player.findOne({ connectionId: MOCK_CONNECTION_ID });
      assert.strictEqual(player, undefined);
    });

    it('should remove the room if there was only one player', async () => {
      const { room } = await setUpARoom(
        false,
        [MOCK_CONNECTION_ID],
        [MOCK_PLAYER_NAME]
      );

      const updatedRoom = await roomController.leaveRoom(MOCK_CONNECTION_ID);

      assert.strictEqual(updatedRoom, undefined);
    });
  });

  describe('startRoom', () => {
    it('should start the room', async () => {
      await setUpARoom(false, [MOCK_CONNECTION_ID], [MOCK_PLAYER_NAME]);

      const updatedRoom = await roomController.startRoom(MOCK_CONNECTION_ID);

      assert.strictEqual(updatedRoom.started, true);
      assert.strictEqual(
        updatedRoom.board.length,
        RoomController.INITIAL_BOARD_SIZE
      );
    });

    it('should fail if the room does not exist', async () => {
      assert.rejects(roomController.startRoom(MOCK_CONNECTION_ID));
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
      const { board } = await roomController.startRoom(MOCK_CONNECTION_ID, 20);
      const realSet = findSetIn(...board)!;

      const { board: updatedBoard, updated } = await roomController.playMove(
        MOCK_CONNECTION_ID,
        realSet
      );

      assert.strictEqual(updated, true);
      const playedCardsStillOnBoard = updatedBoard.filter(c =>
        realSet.includes(c)
      ).length;
      assert.strictEqual(playedCardsStillOnBoard, 0);
    });

    it('should fail if the room has not started', async () => {
      await setUpARoom(false, [MOCK_CONNECTION_ID], [MOCK_PLAYER_NAME]);

      assert.rejects(roomController.playMove(MOCK_CONNECTION_ID, fakeSet));
    });

    it('should fail if the Player does not exist', async () => {
      await roomController.createRoom(false);

      assert.rejects(roomController.playMove(MOCK_CONNECTION_ID, fakeSet));
    });

    it('should fail if an improper number of cards are provided', async () => {
      await setUpARoom(false, [MOCK_CONNECTION_ID], [MOCK_PLAYER_NAME]);
      await roomController.startRoom(MOCK_CONNECTION_ID);

      assert.rejects(
        roomController.playMove(MOCK_CONNECTION_ID, fakeSet.slice(0, 2))
      );
    });
  });
});
