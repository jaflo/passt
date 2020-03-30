import { getModelForClass, arrayProp, prop, index } from "@typegoose/typegoose";
import { PlayerClass } from "./player";
import { CardClass } from "./card";

/**
 * Generates a 6-character code for a room (including letters and numbers)
 * @param length The length of the code to generate
 */
const generateRoomCode = (length: number = 6): string => {
  const characters = "abcdefghijklmnopqrstuvwxyz1234567890";
  const codeChars: string[] = [];
  for (let i = 0; i < length; ++i) {
    codeChars.push(
      characters.charAt(Math.floor(Math.random() * characters.length))
    );
  }
  return codeChars.join("");
};

class RoomClass {
  @arrayProp({ required: true, items: PlayerClass, ref: PlayerClass })
  public players!: Array<PlayerClass>;

  @arrayProp({ required: true, items: CardClass, ref: CardClass })
  public availableCards!: Array<CardClass>;

  @arrayProp({ required: true, items: CardClass, ref: CardClass })
  public board!: Array<CardClass>;

  @prop({ required: true })
  public open!: boolean;

  @prop({ required: true, default: Date.now() })
  public lastActive!: Date;

  @prop({ required: true, unique: true, default: generateRoomCode })
  public roomCode!: string;

  @prop({ required: true, default: false })
  public started!: boolean;
}

const Room = getModelForClass(RoomClass);

export { Room, RoomClass };
