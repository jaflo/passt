import '../testSetup.test';
import { RoomController } from '../../server/controller/roomController';
import assert from 'assert';
import { setupCardsForTest } from '../testSetup.test';
import { Player } from '../../server/entity/player.entity';
import { findSetIn } from '../../server/shared';

const MOCK_CONNECTION_ID = 'MOCK_CONNECTION_ID';
const MOCK_PLAYER_NAME = 'MOCK_NAME';
describe('RoomController', () => {
  let roomController: RoomController;
  beforeEach(() => {
    roomController = new RoomController();
  });
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
      const { roomCode } = await roomController.createRoom(false);
      await roomController.joinRoom(
        roomCode,
        MOCK_CONNECTION_ID,
        MOCK_PLAYER_NAME
      );
      const { room } = await roomController.joinRoom(
        roomCode,
        'MOCK_CONNECTION_ID_2',
        'MOCK_PLAYER_NAME_2'
      );
      assert.strictEqual(room.players.length, 2);

      const updatedRoom = (await roomController.leaveRoom(MOCK_CONNECTION_ID))!;

      assert.strictEqual(updatedRoom.players.length, 1);
    });

    it('should delete the player from the database', async () => {
      let room = await roomController.createRoom(false);
      room = (
        await roomController.joinRoom(
          room.roomCode,
          MOCK_CONNECTION_ID,
          MOCK_PLAYER_NAME
        )
      ).room;
      room = (
        await roomController.joinRoom(
          room.roomCode,
          'MOCK_CONNECTION_ID_2',
          'MOCK_PLAYER_NAME_2'
        )
      ).room;
      assert.strictEqual(room.players.length, 2);

      await roomController.leaveRoom(MOCK_CONNECTION_ID);

      const player = await Player.findOne({ connectionId: MOCK_CONNECTION_ID });
      assert.strictEqual(player, undefined);
    });

    it('should remove the room if there was only one player', async () => {
      let room = await roomController.createRoom(false);
      room = (
        await roomController.joinRoom(
          room.roomCode,
          MOCK_CONNECTION_ID,
          MOCK_PLAYER_NAME
        )
      ).room;
      assert.strictEqual(room.players.length, 1);

      const updatedRoom = await roomController.leaveRoom(MOCK_CONNECTION_ID);

      assert.strictEqual(updatedRoom, undefined);
    });
  });

  describe('startRoom', () => {
    beforeEach(async () => {
      await setupCardsForTest();
    });
    it('should start the room', async () => {
      let room = await roomController.createRoom(false);
      await roomController.joinRoom(
        room.roomCode,
        MOCK_CONNECTION_ID,
        MOCK_PLAYER_NAME
      );

      room = await roomController.startRoom(MOCK_CONNECTION_ID);

      assert.strictEqual(room.started, true);
      assert.strictEqual(room.board.length, RoomController.INITIAL_BOARD_SIZE);
    });

    it('should fail if the room does not exist', async () => {
      assert.rejects(roomController.startRoom(MOCK_CONNECTION_ID));
    });
  });

  describe('playMove', () => {
    beforeEach(async () => {
      await setupCardsForTest();
    });
    it('should return the new board if successful', async () => {
      const { roomCode } = await roomController.createRoom(false);
      await roomController.joinRoom(
        roomCode,
        MOCK_CONNECTION_ID,
        MOCK_PLAYER_NAME
      );
      // Mathematical proof indicating that a set must exist within 20 cards
      const { board } = await roomController.startRoom(MOCK_CONNECTION_ID, 20);
      const realSet = findSetIn(...board)!;
      const realSetIds = realSet.map(c => c.id);

      const { board: updatedBoard, updated } = await roomController.playMove(
        MOCK_CONNECTION_ID,
        realSetIds
      );

      assert.strictEqual(updated, true);
      const playedCardsStillOnBoard = updatedBoard
        .map(c => c.id)
        .filter(id => realSetIds.includes(id)).length;
      assert.strictEqual(playedCardsStillOnBoard, 0);
    });
  });
});
