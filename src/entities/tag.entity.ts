// src/entities/tag.entity.ts

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
} from 'typeorm';
import { Organization } from './organization.entity';
import { Task } from './task.entity';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Organization, (organization) => organization.tags)
  organization: Organization;

  @ManyToMany(() => Task, (task) => task.tags)
  tasks: Task[];
}
