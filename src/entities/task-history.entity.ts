// src/entities/task-history.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Task } from './task.entity';
import { Capsule } from './capsule.entity';
import { User } from './user.entity';

@Entity()
export class TaskHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Task, (task) => task.history, { onDelete: 'CASCADE' })
  task: Task;

  @ManyToOne(() => Capsule)
  capsule: Capsule;

  @ManyToOne(() => User)
  user: User;

  @Column()
  changeType: string;

  @Column()
  changeDescription: string;

  @Column()
  timestamp: Date;
}
