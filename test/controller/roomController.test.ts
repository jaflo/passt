import '../testSetup.test';
import { RoomController } from '../../server/controller/roomController';
import assert from 'assert';

describe('RoomController', () => {
  let roomController: RoomController;
  beforeEach(() => {
    roomController = new RoomController();
  });
  describe('createRoom', () => {
    it('should create a room and return it', async () => {
      const newRoom = await roomController.createRoom();
      assert.notEqual(newRoom, null);
    });
  });
});
