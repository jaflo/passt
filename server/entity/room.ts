import {
  Entity,
  Column,
  PrimaryColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  BaseEntity,
} from 'typeorm';
import { Player } from './player';
import { Card } from './card';
import shortid from "shortid";

@Entity()
export class Room extends BaseEntity {
  @PrimaryColumn({default: shortid.generate})
  roomCode!: string;

  @Column({ type: 'boolean', nullable: false, default: false })
  open!: boolean;

  @Column({ type: 'boolean', nullable: false, default: false })
  started!: boolean;

  @OneToMany(
    type => Player,
    player => player.room
  )
  players!: Player[];

  @ManyToMany(type => Card)
  @JoinTable()
  board!: Card[];

  @ManyToMany(type => Card)
  @JoinTable()
  availableCards!: Card[];

  @UpdateDateColumn({
    nullable: false,
  })
  lastActive!: Date;
}
