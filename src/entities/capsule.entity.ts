// src/entities/capsule.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Task } from './task.entity';
import { User } from './user.entity';

@Entity()
export class Capsule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'date', nullable: true })
  dueDate: string; // Original due date of the capsule

  @Column({ type: 'date', nullable: true })
  newDueDate: string; // Updated due date (if changed)

  @ManyToOne(() => User, (user) => user.capsules)
  user: User; // Capsule owner

  @OneToMany(() => Task, (task) => task.capsule, { cascade: true })
  tasks: Task[];
}
