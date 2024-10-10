import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';
import { Skill } from './skill.entity';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  bio: string;

  @ManyToOne(() => User, (user) => user.profile)
  user: User;

  @OneToMany(() => Skill, (skill) => skill.profile, { cascade: true })
  skills: Skill[];
}
