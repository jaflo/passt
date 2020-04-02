import { Room } from '../entity/room';
export class RoomController {
  /**
   * Creates a new {@link Room} and returns it.
   */
  async createRoom() {
    return await new Room().save();
  }
}
