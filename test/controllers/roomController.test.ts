import "mocha";
import assert from "assert";
import { RoomController } from "../../server/controllers/roomController";

import "../testSetup.test";
import { Room } from "../../server/db/room";

const DUMMY_PLAYER_NAME = "dummyPlayer";
const DUMMY_PLAYER_CONNECTION_ID = "dummyConnectionId";
const DUMMY_ROOM_ID = "dummyRoom";

describe("RoomController", () => {
  let roomController: RoomController;
  beforeEach(() => {
    roomController = new RoomController();
  });
  describe("joinRoom", async () => {
    it("should create a room if it doesn't exist", async () => {
      await roomController.joinRoom(
        DUMMY_ROOM_ID,
        DUMMY_PLAYER_CONNECTION_ID,
        DUMMY_PLAYER_NAME
      );
      const room = await Room.findOne({ roomCode: DUMMY_ROOM_ID });
      assert.notEqual(room, null);
    });

    it("should add the player to the room", async () => {
      await roomController.joinRoom(
        DUMMY_ROOM_ID,
        DUMMY_PLAYER_CONNECTION_ID,
        DUMMY_PLAYER_NAME
      );
      const room = await Room.findOne({ roomCode: DUMMY_ROOM_ID }).populate(
        "players"
      );
      assert.notEqual(room, null);
      assert.equal(room!.players.length, 1);
      assert.equal(room!.players[0].connectionId, DUMMY_PLAYER_CONNECTION_ID);
      assert.equal(room!.players[0].name, DUMMY_PLAYER_NAME);
    });

    it("should return the newly-created player and updated room", async () => {
      assert.equal(await Room.findOne({ roomCode: DUMMY_ROOM_ID }), null);
      const { player, room } = await roomController.joinRoom(
        DUMMY_ROOM_ID,
        DUMMY_PLAYER_CONNECTION_ID,
        DUMMY_PLAYER_NAME
      );
      assert.equal(player.connectionId, DUMMY_PLAYER_CONNECTION_ID);
      assert.equal(room.players.length, 1);
    });
  });
});
