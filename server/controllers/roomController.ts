import { Room, RoomClass } from "../db/room";
import { Player, PlayerClass } from "../db/player";
import { DocumentType } from "@typegoose/typegoose";

export class RoomController {
  public async joinRoom(
    roomId: string | undefined,
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
    const room: DocumentType<RoomClass> = await Room.findOneAndUpdate(
      { roomCode: roomId },
      { $push: { players: player } },
      { upsert: true, new: true }
    ).populate("players");
    return { player, room };
  }
}
