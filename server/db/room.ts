import {
  getModelForClass,
  arrayProp,
  prop,
  index,
  Ref,
  isDocumentArray,
  DocumentType,
} from "@typegoose/typegoose";
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
  @arrayProp({ required: true, ref: PlayerClass })
  public players!: Array<Ref<PlayerClass>>;

  @arrayProp({ required: true, ref: CardClass })
  public availableCards!: Array<Ref<CardClass>>;

  @arrayProp({ required: true, ref: CardClass })
  public board!: Array<Ref<CardClass>>;

  @prop({ required: true })
  public open!: boolean;

  @prop({ required: true, default: Date.now() })
  public lastActive!: Date;

  @prop({ required: true, unique: true, default: generateRoomCode })
  public roomCode!: string;

  @prop({ required: true, default: false })
  public started!: boolean;

  /**
   * Determines whether the provided cards are on the board. Requires "board" to be populated.
   * @param cards The cards to search for
   */
  public cardsOnBoard(this: DocumentType<RoomClass>, ...cards: CardClass[]) {
    if (!isDocumentArray(this.board)) {
      throw new Error(`cardsOnBoard was called but "board" was not populated`);
    }
    for (const card of cards) {
      const matchingCard = this.board.find(
        (c) =>
          c.color === card.color &&
          c.fillStyle === card.fillStyle &&
          c.shape === card.shape &&
          c.number === card.number
      );
      if (!matchingCard) {
        return false;
      }
    }
    return true;
  }

  /**
   * Determines whether the provided cards are in the available cards. Requires "availableCards" to be populated.
   * @param cards The cards to search for
   */
  public cardsInAvailableCards(
    this: DocumentType<RoomClass>,
    ...cards: CardClass[]
  ) {
    if (!isDocumentArray(this.availableCards)) {
      throw new Error(
        `cardsInAvailableCards was called but "availableCards" was not populated`
      );
    }
    for (const card of cards) {
      const matchingCard = this.availableCards.find(
        (c) =>
          c.color === card.color &&
          c.fillStyle === card.fillStyle &&
          c.shape === card.shape &&
          c.number === card.number
      );
      if (!matchingCard) {
        return false;
      }
    }
    return true;
  }
}

const Room = getModelForClass(RoomClass);

export { Room, RoomClass };
