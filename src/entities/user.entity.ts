import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { Capsule } from './capsule.entity';
import { Task } from './task.entity';
import { Profile } from './profile.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // Should be hashed

  @Column({ nullable: true }) // Allow null if no avatar is uploaded
  avatar: string;

  @OneToMany(() => Capsule, (capsule) => capsule.user)
  capsules: Capsule[];

  @ManyToMany(() => Task, (task) => task.assignedUsers)
  tasks: Task[];

  @OneToMany(() => Profile, (profile) => profile.user, { cascade: true })
  profile: Profile[];
}
