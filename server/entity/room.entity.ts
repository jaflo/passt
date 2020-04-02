import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  BaseEntity,
  PrimaryColumn,
} from 'typeorm';
import { Player } from './player.entity';
import { Card } from './card.entity';
import shortid from 'shortid';

@Entity()
export class Room extends BaseEntity {
  @PrimaryColumn({type: "varchar"})
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
