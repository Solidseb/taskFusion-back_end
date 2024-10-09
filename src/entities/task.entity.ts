// src/entities/task.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Capsule } from './capsule.entity';
import { User } from './user.entity';
import { Comment } from './comment.entity'; // Ensure this is imported

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 'To Do' })
  status: string;

  @Column({ default: 'Medium' })
  priority: string;

  // New field to track if the task is completed
  @Column({ default: false })
  isCompleted: boolean;

  @OneToMany(() => Comment, (comment) => comment.task, { cascade: true })
  comments: Comment[];

  @ManyToMany(() => User, (user) => user.tasks, { eager: true })
  @JoinTable()
  assignedUsers: User[];

  @Column({ type: 'date', nullable: true })
  dueDate: string;

  @ManyToOne(() => Capsule, (capsule) => capsule.tasks, { onDelete: 'CASCADE' })
  capsule: Capsule;
}
