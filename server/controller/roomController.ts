import { Room } from '../entity/room.entity';
import shortid from 'shortid';
export class RoomController {
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
}
