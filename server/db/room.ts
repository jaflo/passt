import { getModelForClass, arrayProp, prop, index } from '@typegoose/typegoose';
import { PlayerClass } from './player';
import { CardClass } from './card';

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
}

const Room = getModelForClass(RoomClass);

export { Room, RoomClass };