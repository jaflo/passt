import {
  Entity,
  Column,
  PrimaryColumn,
  UpdateDateColumn,
  ManyToOne,
  BaseEntity,
} from 'typeorm';
import { Room } from './room.entity';

@Entity()
export class Player extends BaseEntity {
  @PrimaryColumn()
  connectionId!: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  name!: string;

  @Column({
    type: 'int',
    default: 0,
    nullable: false,
  })
  points!: number;

  @ManyToOne(
    type => Room,
    room => room.players
  )
  room!: Room;

  @UpdateDateColumn({
    nullable: false,
  })
  lastActive!: Date;
}
