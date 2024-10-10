import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { Profile } from './profile.entity';
import { Capsule } from './capsule.entity';
import { Task } from './task.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Capsule, (capsule) => capsule.user)
  capsules: Capsule[];

  @ManyToMany(() => Task, (task) => task.assignedUsers)
  tasks: Task[];

  @Column({ nullable: true }) // Allow null if no avatar is uploaded
  avatar: string;

  @OneToOne(() => Profile, { cascade: true }) // One-to-one relationship with profile
  @JoinColumn() // This marks the ownership of the relation
  profile: Profile;
}
