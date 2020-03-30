import { getModelForClass, prop } from "@typegoose/typegoose";

/**
 * The player class, from which the Player schema is defined by Typegoose.
 */
class PlayerClass {
  @prop({ required: true, unique: true })
  public connectionId!: string;

  @prop({ required: true })
  public name!: string;

  @prop({ required: true, default: 0 })
  public points!: number;

  @prop({ required: true, default: Date.now() })
  public lastActive!: Date;
}

const Player = getModelForClass(PlayerClass);

export { Player, PlayerClass };
