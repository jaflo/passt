import {
	Entity,
	Column,
	ManyToOne,
	BaseEntity,
	JoinColumn,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Room } from './room';

@Entity()
export class Player extends BaseEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ type: 'varchar', nullable: false, unique: true })
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
		() => Room,
		room => room.players
	)
	@JoinColumn({ name: 'roomCode' })
	room!: Room;

	@UpdateDateColumn({
		nullable: false,
	})
	lastActive!: Date;

	@Column({
		type: 'boolean',
		default: true,
		nullable: false,
	})
	connected!: boolean;
}
