import { Room, RoomClass } from "../db/room";
import { Player, PlayerClass } from "../db/player";
import { DocumentType, isDocumentArray } from "@typegoose/typegoose";
import { Card, CardClass } from "../db/card";

function shuffle<T>(array: T[]): T[] {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

export class RoomController {
  static HAND_SIZE = 12;
  /**
   * Removes a {@link Player} from any {@link Room}s they are part of, given only their connectionId
   * @param connectionId The connectionId of the {@link Player} to remove.
   */
  async removePlayer(
    connectionId: string
  ): Promise<DocumentType<RoomClass>[] | undefined> {
    const player = await Player.findOne({ connectionId });
    if (!player) {
      console.error(
        `No player with connection ID ${connectionId} was found to remove from rooms.`
      );
      return;
    }
    // Get IDs of the rooms affected
    const affectedRooms = await Room.find({ players: { $all: [player._id] } });
    const affectedRoomIds = affectedRooms.map((room) => room._id);

    await Room.updateMany(
      { players: { $all: [player._id] } },
      { $pull: { players: player._id } }
    );

    await Player.deleteMany({ connectionId }).exec();

    return await Room.find({ _id: { $in: affectedRoomIds } }).populate(
      "players"
    );
  }
  /**
   * Creates and returns a new {@link Room}.
   * @param open Whether or not the {@link Room} should be accessible by the public
   */
  public async createRoom(open: boolean = false) {
    // Just in case there are collisions when generating the code, retry until no collisions.
    while (true) {
      try {
        return await Room.create({ open });
      } catch (err) {
        // Duplicate key error, ignore this and generate a new code.
        if (!(err.name === "MongoError" && err.code === 11000)) {
          throw err;
        }
      }
    }
  }

  /**
   * Joins a {@link Room} if it exists. Rejects if the {@link Room} does not exist.
   * @param roomCode The code of the {@link Room} to join
   * @param connectionId The ID of the connection the player is joining on
   * @param playerName The name of the player within the {@link Room}
   */
  public async joinRoom(
    roomCode: string,
    connectionId: string,
    playerName: string
  ): Promise<{
    player: DocumentType<PlayerClass>;
    room: DocumentType<RoomClass>;
  }> {
    const player = await Player.create({
      connectionId: connectionId,
      name: playerName,
    });

    const room = await Room.findOneAndUpdate(
      { roomCode },
      { $push: { players: player } },
      { new: true }
    )
      .populate("players")
      .populate("board");
    if (!room) {
      throw new Error(`Failed to find a Room with code ${roomCode} to join`);
    }
    return { player, room };
  }

  public async startGame(
    connectionId: string
  ): Promise<DocumentType<RoomClass>> {
    const player = await Player.findOne({ connectionId });
    if (!player) {
      throw new Error(
        `Failed to find a player with connectionId ${connectionId} to start game for.`
      );
    }
    const cards = await Card.find({});
    const shuffledCards = shuffle(cards);
    // Modifies shuffledCards in-place as a side effect.
    const initialHand = shuffledCards.splice(0, RoomController.HAND_SIZE);
    const room = await Room.findOneAndUpdate(
      {
        players: { $in: [player?._id] },
        started: false,
        "players.0": { $exists: true },
      },
      { board: initialHand, availableCards: shuffledCards, started: true },
      { new: true }
    )
      .populate("players")
      .populate("board");
    if (!room) {
      throw new Error(
        `Failed to find a Room for player with connectionId ${connectionId} that hasn't been started`
      );
    }
    return room;
  }

  public async playMove(connectionId: string, cardValues: CardClass[]) {
    if (cardValues.length !== 3) {
      throw new Error(
        `Expected to get 3 cards, was given ${cardValues.length} cards`
      );
    }
    const player = await Player.findOne({ connectionId });
    if (!player) {
      throw new Error(
        `Failed to find a player with connectionId ${connectionId} to play a move for.`
      );
    }
    const room = await Room.findOne({
      players: { $in: [player._id] },
      started: true,
    })
      .populate("availableCards")
      .populate("board");
    if (!room) {
      throw new Error(
        `Failed to find a started room for Player with connectionId ${connectionId}.`
      );
    }
    if (!isDocumentArray(room.availableCards)) {
      throw new Error(`availableCards was not populated.`);
    }
    if (!isDocumentArray(room.board)) {
      throw new Error(`board was not populated.`);
    }
    const cards: DocumentType<CardClass>[] = [];
    if (!room.cardsOnBoard(...cards)) {
      throw new Error(
        `Couldn't find cards with attributes ${JSON.stringify(cards)} in room ${
          room.roomCode
        }.`
      );
    }

    if (!Card.isASet(...cards)) {
      return undefined;
    }
    if (Card.isASet(...cards)) {
      const cardsToPull = shuffle(room.availableCards).slice(0, 3);
      const cardsToPullIds = cardsToPull.map((c) => c._id);

      const updatedRoom = await Room.findOneAndUpdate(
        {
          roomCode: room.roomCode,
        },
        {
          $push: {
            board: {
              $each: cardsToPullIds,
            },
          },
          $pullAll: {
            availableCards: cardsToPullIds,
          },
        },
        { new: true }
      );
      return updatedRoom!.board as Array<CardClass>;
    }
    return undefined;
  }
}
