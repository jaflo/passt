import { Room } from '../entity/room.entity';
import shortid from 'shortid';
import { Player } from '../entity/player.entity';
import { Card, FillStyle, Color, Shape } from '../entity/card.entity';
import { getConnection } from 'typeorm';
import { shuffle, isASet } from '../shared';
export class RoomController {
  static INITIAL_BOARD_SIZE = 12;
  static NUM_TO_DRAW = 3;
  /**
   * Creates a new {@link Room} and returns it.
   */
  async createRoom(open: boolean, roomCode?: string) {
    if (!roomCode) {
      roomCode = shortid.generate();
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

    room.players.push(player);
    await room.save();
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
   */
  async startRoom(
    connectionId: string,
    initialBoardSize = RoomController.INITIAL_BOARD_SIZE
  ) {
    const player = await Player.findOneOrFail(
      { connectionId },
      { relations: ['room'] }
    );
    const { room } = player;

    const cards = shuffle(await Card.find({}));
    const initialBoard = cards.splice(0, initialBoardSize);
    const availableCards = cards;

    room.board = initialBoard;
    room.availableCards = availableCards;
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
    cardIds: number[],
    numToDraw = RoomController.NUM_TO_DRAW
  ): Promise<{
    name: string;
    cards: Card[];
    updated: boolean;
    board: Card[];
    roomCode: string;
  }> {
    if (cardIds.length !== numToDraw) {
      throw new Error(
        `Expected ${numToDraw} cards to be played, got ${cardIds.length} cards.`
      );
    }
    // Get the Player
    const player = await Player.findOneOrFail(
      { connectionId },
      { relations: ['room'] }
    );

    // Get the Room
    const room = await Room.findOneOrFail(
      { roomCode: player.room.roomCode },
      { relations: ['board', 'availableCards'] }
    );

    // Find the matching cards on the board (or error if they don't exist).
    const matchingCards = room.board.filter(c => cardIds.includes(c.id));
    if (matchingCards.length !== cardIds.length) {
      throw new Error(
        `Not all of the provided cards for Room ${room.roomCode} were found on the board.`
      );
    }
    const matchingCardIds = matchingCards.map(c => c.id);
    if (!isASet(...matchingCards)) {
      return {
        name: player.name,
        cards: matchingCards,
        updated: false,
        board: room.board,
        roomCode: room.roomCode,
      };
    }

    // It's a set, update board and points
    // Step 1: Remove the played cards from the board.
    room.board = room.board.filter(c => !matchingCardIds.includes(c.id));

    // Step 2: Draw cards
    const { availableCards } = room;
    numToDraw = Math.min(numToDraw, availableCards.length);
    const drawnCards = availableCards.splice(0, numToDraw);

    // Step 3: Put the drawn cards on the board.
    room.board.push(...drawnCards);
    room.availableCards = availableCards;

    // Step 4: Update the player's points.
    player.points += 1;

    // Update database records
    await room.save();
    await player.save();

    return {
      name: player.name,
      cards: matchingCards,
      board: room.board,
      updated: true,
      roomCode: room.roomCode,
    };
  }
}
