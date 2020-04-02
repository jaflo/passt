import { Room } from '../entity/room.entity';
import shortid from 'shortid';
import { Player } from '../entity/player.entity';
import { Card } from '../entity/card.entity';
import { getConnection } from 'typeorm';
import { shuffle } from '../shared';
export class RoomController {
  static INITIAL_BOARD_SIZE = 12;
  /**
   * Creates a new {@link Room} and returns it.
   */
  async createRoom(roomCode?: string) {
    if (!roomCode) {
      roomCode = shortid.generate();
    }
    const newRoom = new Room();
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
    return room.save();
  }

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
}
