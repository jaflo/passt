import "mocha";
import assert from "assert";
import { RoomController } from "../../server/controllers/roomController";

import "../testSetup.test";
import { seedCardsForTest } from "../testSetup.test";
import { Player } from "../../server/db/player";
// import mongoose from "mongoose";
import { Card, CardClass } from "../../server/db/card";
import { seedCards } from "../../server/seedCards";
import { isDocumentArray } from "@typegoose/typegoose";

const DUMMY_PLAYER_NAME = "dummyPlayer";
const DUMMY_PLAYER_CONNECTION_ID = "dummyConnectionId";

describe("RoomController", () => {
  let roomController: RoomController;
  beforeEach(() => {
    roomController = new RoomController();
  });

  describe("createRoom", () => {
    it("should create a closed room by default", async () => {
      const room = await roomController.createRoom();

      assert.equal(room.open, false);
    });

    it("should be able to create an open room", async () => {
      const room = await roomController.createRoom(true);

      assert.equal(room.open, true);
    });
  });

  describe("joinRoom", () => {
    it("should add the player to the room", async () => {
      const newRoom = await roomController.createRoom();

      const { room } = await roomController.joinRoom(
        newRoom.roomCode,
        DUMMY_PLAYER_CONNECTION_ID,
        DUMMY_PLAYER_NAME
      );
      if (!room) {
        assert.fail("Room was null");
      }
      if (!isDocumentArray(room.players)) {
        assert.fail("Room players were not populated.");
      }
      assert.equal(room!.players.length, 1);
      assert.equal(room!.players[0].connectionId, DUMMY_PLAYER_CONNECTION_ID);
      assert.equal(room!.players[0].name, DUMMY_PLAYER_NAME);
    });

    it("should return the newly-created player and updated room", async () => {
      const newRoom = await roomController.createRoom();

      const { player, room } = await roomController.joinRoom(
        newRoom.roomCode,
        DUMMY_PLAYER_CONNECTION_ID,
        DUMMY_PLAYER_NAME
      );

      assert.equal(player.connectionId, DUMMY_PLAYER_CONNECTION_ID);
      assert.equal(room.players.length, 1);
    });

    it("should return the populated board", async () => {
      const newRoom = await roomController.createRoom();

      const { room } = await roomController.joinRoom(
        newRoom.roomCode,
        DUMMY_PLAYER_CONNECTION_ID,
        DUMMY_PLAYER_NAME
      );
      assert.notEqual(room, null);
      assert.equal(isDocumentArray(room!.board), true);
    });

    it("should fail to join if the room does not exist", async () => {
      assert.rejects(
        roomController.joinRoom(
          "NONEXISTENT_ID",
          DUMMY_PLAYER_CONNECTION_ID,
          DUMMY_PLAYER_NAME
        )
      );
    });
  });

  describe("removePlayer", () => {
    it("should remove the player from the database", async () => {
      const roomCode = (await roomController.createRoom()).roomCode;
      const { player } = await roomController.joinRoom(
        roomCode,
        DUMMY_PLAYER_CONNECTION_ID,
        DUMMY_PLAYER_NAME
      );
      assert.notEqual(await Player.findOne({ _id: player._id }), null);

      await roomController.removePlayer(player.connectionId);

      assert.equal(await Player.findOne({ _id: player._id }), null);
    });

    it("should return all rooms affected by player removal", async () => {
      const roomCode = (await roomController.createRoom()).roomCode;
      const { player } = await roomController.joinRoom(
        roomCode,
        DUMMY_PLAYER_CONNECTION_ID,
        DUMMY_PLAYER_NAME
      );

      const rooms = await roomController.removePlayer(player.connectionId);

      assert.notEqual(rooms, undefined);
      assert.equal(rooms!.length, 1);
      assert.equal(rooms![0].roomCode, roomCode);
    });

    it("should return undefined if the player doesn't exist", async () => {
      const rooms = await roomController.removePlayer(
        DUMMY_PLAYER_CONNECTION_ID
      );

      assert.equal(rooms, undefined);
    });
  });

  describe("startGame", () => {
    beforeEach(async () => {
      await seedCardsForTest();
    });
    it("should start the game", async () => {
      const { roomCode } = await roomController.createRoom();
      const { player } = await roomController.joinRoom(
        roomCode,
        DUMMY_PLAYER_CONNECTION_ID,
        DUMMY_PLAYER_NAME
      );

      const room = await roomController.startGame(DUMMY_PLAYER_CONNECTION_ID);

      assert.equal(room.started, true);
    });

    it("should initially populate the board with a hand of Cards that exist", async () => {
      const { roomCode } = await roomController.createRoom();
      await roomController.joinRoom(
        roomCode,
        DUMMY_PLAYER_CONNECTION_ID,
        DUMMY_PLAYER_NAME
      );

      const room = await roomController.startGame(DUMMY_PLAYER_CONNECTION_ID);
      if (!isDocumentArray(room.board)) {
        assert.fail("Board was not populated.");
      }

      assert.equal(room.board.length, RoomController.HAND_SIZE);
      for (const card of room.board) {
        const matchingCard = await Card.findOne({
          shape: card.shape,
          color: card.color,
          fillStyle: card.fillStyle,
          number: card.number,
        });
        assert.notEqual(matchingCard, null);
      }
    });

    it("should populate the available cards with cards not on the board", async () => {
      const { roomCode } = await roomController.createRoom();
      await roomController.joinRoom(
        roomCode,
        DUMMY_PLAYER_CONNECTION_ID,
        DUMMY_PLAYER_NAME
      );

      const room = await roomController.startGame(DUMMY_PLAYER_CONNECTION_ID);

      assert.equal(
        room.availableCards.length,
        (await Card.countDocuments()) - RoomController.HAND_SIZE
      );

      if (!isDocumentArray(room.board)) {
        assert.fail("board was not populated");
      }

      for (const card of room.board) {
        const matchingCard = await Card.findOne({
          shape: card.shape,
          color: card.color,
          fillStyle: card.fillStyle,
          number: card.number,
        });
        assert.notEqual(matchingCard, null);
        assert.notEqual(
          room.availableCards.find((c) => c.toString() === card._id.toString()),
          true
        );
      }
    });

    it("should not start if no players are present", async () => {
      const { roomCode } = await roomController.createRoom();

      assert.rejects(roomController.startGame(DUMMY_PLAYER_CONNECTION_ID));
    });
    it("should not start if no room exists for the provided player", async () => {
      assert.rejects(roomController.startGame("INVALID_PLAYER_ID"));
    });
    it("should not start if the room has already started", async () => {
      const { roomCode } = await roomController.createRoom();
      await roomController.joinRoom(
        roomCode,
        DUMMY_PLAYER_CONNECTION_ID,
        DUMMY_PLAYER_NAME
      );

      await roomController.startGame(DUMMY_PLAYER_CONNECTION_ID);

      assert.rejects(roomController.startGame(DUMMY_PLAYER_CONNECTION_ID));
    });
  });

  describe("playMove", () => {
    beforeEach(async () => {
      await seedCardsForTest();
    });

    it("should update the board when the move is successful", async () => {
      const { roomCode } = await roomController.createRoom();
      await roomController.joinRoom(
        roomCode,
        DUMMY_PLAYER_CONNECTION_ID,
        DUMMY_PLAYER_NAME
      );

      // Mathematical proof that a set must exist in 20 cards
      const room = await roomController.startGame(
        DUMMY_PLAYER_CONNECTION_ID,
        20
      );
      if (!isDocumentArray(room.board)) {
        assert.fail("Room board was not populated.");
      }
      const set = Card.findSetIn(...room.board);
      if (!set) {
        assert.fail("No set was found.");
      }
      const { room: updatedRoom } = await roomController.playMove(
        DUMMY_PLAYER_CONNECTION_ID,
        set
      );
      if (!isDocumentArray(updatedRoom.board)) {
        assert.fail("Room board was not populated.");
      }
      for (const card of set) {
        if (
          updatedRoom.board.find(
            (c) =>
              c.color === card.color &&
              c.shape === card.shape &&
              c.fillStyle === card.fillStyle &&
              c.number === card.number
          )
        ) {
          assert.fail("Card that was played was still on the board.");
        }
      }
    });

    it("should increment the player's score when the move is successful", async () => {
      const { roomCode } = await roomController.createRoom();
      await roomController.joinRoom(
        roomCode,
        DUMMY_PLAYER_CONNECTION_ID,
        DUMMY_PLAYER_NAME
      );

      // Mathematical proof that a set must exist in 20 cards
      const room = await roomController.startGame(
        DUMMY_PLAYER_CONNECTION_ID,
        20
      );
      if (!isDocumentArray(room.board)) {
        assert.fail("Room board was not populated.");
      }
      const set = Card.findSetIn(...room.board);
      if (!set) {
        assert.fail("No set was found.");
      }
      const { room: updatedRoom } = await roomController.playMove(
        DUMMY_PLAYER_CONNECTION_ID,
        set
      );

      if (!isDocumentArray(updatedRoom.players)) {
        assert.fail("Players was not populated");
      }

      const updatedPlayer = updatedRoom.players.find(
        (p) => p.connectionId === DUMMY_PLAYER_CONNECTION_ID
      );
      assert.equal(updatedPlayer?.points, 1);
    });

    it("should fail when the board does not contain one of the cards in the move", async () => {
      const { roomCode } = await roomController.createRoom();
      await roomController.joinRoom(
        roomCode,
        DUMMY_PLAYER_CONNECTION_ID,
        DUMMY_PLAYER_NAME
      );

      // No cards in initial hand. Won't happen, but it's fine.
      await roomController.startGame(DUMMY_PLAYER_CONNECTION_ID, 0);
      const cards = await Card.find({}).limit(3);
      assert.rejects(
        roomController.playMove(DUMMY_PLAYER_CONNECTION_ID, cards)
      );
    });

    it("should fail when the room does not exist", async () => {
      const cards = await Card.find({}).limit(3);
      assert.rejects(
        roomController.playMove(DUMMY_PLAYER_CONNECTION_ID, cards)
      );
    });
  });
});
