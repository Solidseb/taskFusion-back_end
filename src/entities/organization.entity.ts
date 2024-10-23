import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Capsule } from './capsule.entity';
import { Task } from './task.entity';
import { Setting } from './setting.entity';
import { Tag } from './tag.entity';

@Entity()
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  emailDomain: string;

  @Column({ nullable: true })
  secretToken: string;

  // Relationships
  @OneToMany(() => User, (user) => user.organization)
  users: User[];

  @OneToMany(() => Capsule, (capsule) => capsule.organization)
  capsules: Capsule[];

  @OneToMany(() => Task, (task) => task.organization)
  tasks: Task[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => Setting, (setting) => setting.organization)
  settings: Setting[];

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @OneToMany(() => Tag, (tag) => tag.organization)
  tags: Tag[];
}
