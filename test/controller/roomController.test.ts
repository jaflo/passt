import '../testSetup.test';
import { RoomController } from '../../server/controller/roomController';
import assert from 'assert';
import { setupCardsForTest } from '../testSetup.test';

const MOCK_CONNECTION_ID = 'MOCK_CONNECTION_ID';
const MOCK_PLAYER_NAME = 'MOCK_NAME';
describe('RoomController', () => {
  let roomController: RoomController;
  beforeEach(() => {
    roomController = new RoomController();
  });
  describe('createRoom', () => {
    it('should create a room and return it', async () => {
      const newRoom = await roomController.createRoom();
      assert.notStrictEqual(newRoom, null);
    });
  });

  describe('joinRoom', () => {
    it('should add the player to the room', async () => {
      const newRoom = await roomController.createRoom();

      const updatedRoom = await roomController.joinRoom(
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

  describe('startRoom', () => {
    beforeEach(async () => {
      await setupCardsForTest();
    });
    it('should start the room', async () => {
      let room = await roomController.createRoom();
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
});
