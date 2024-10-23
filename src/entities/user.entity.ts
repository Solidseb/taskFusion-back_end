import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { Capsule } from './capsule.entity';
import { Task } from './task.entity';
import { Profile } from './profile.entity';
import { Organization } from './organization.entity';

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

  @ManyToOne(() => Organization, (organization) => organization.users)
  organization: Organization;

  @Column()
  organizationId: string; // Foreign key for direct reference

  @OneToMany(() => Profile, (profile) => profile.user, { cascade: true })
  profile: Profile[];
}
