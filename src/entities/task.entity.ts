// src/entities/task.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Capsule } from './capsule.entity';
import { User } from './user.entity';
import { Comment } from './comment.entity'; // Ensure this is imported
import { TaskHistory } from './task-history.entity';
import { Organization } from './organization.entity';
import { Tag } from './tag.entity';

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

  @Column({ type: 'date', nullable: true })
  startDate: string;

  @Column({ type: 'date', nullable: true })
  completedDate: string;

  @ManyToOne(() => Capsule, (capsule) => capsule.tasks, { onDelete: 'CASCADE' })
  capsule: Capsule;

  @Column({ nullable: true })
  parent_id?: number; // Nullable for main tasks

  @ManyToOne(() => Task, (task) => task.subtasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })
  parentTask?: Task;

  @OneToMany(() => Task, (task) => task.parentTask)
  subtasks: Task[];

  @ManyToOne(() => User)
  createdBy: User;

  @OneToMany(() => TaskHistory, (history) => history.task)
  history: TaskHistory[];

  @ManyToMany(() => Task, (task) => task.dependentTasks, { cascade: true })
  @JoinTable({
    name: 'task_blockers',
    joinColumn: { name: 'taskId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'blockerId', referencedColumnName: 'id' },
  })
  blockers: Task[];

  @ManyToMany(() => Task, (task) => task.blockers)
  dependentTasks: Task[];

  @ManyToOne(() => Organization, (organization) => organization.tasks)
  organization: Organization;

  @Column()
  organizationId: string;

  @ManyToMany(() => Tag, (tag) => tag.tasks)
  @JoinTable() // To define the relationship table for Many-to-Many
  tags: Tag[];
}
