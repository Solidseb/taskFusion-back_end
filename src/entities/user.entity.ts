// src/entities/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { Capsule } from './capsule.entity';
import { Task } from './task.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // Should be hashed

  @OneToMany(() => Capsule, (capsule) => capsule.user)
  capsules: Capsule[];

  @ManyToMany(() => Task, (task) => task.assignedUsers)
  tasks: Task[];
}
