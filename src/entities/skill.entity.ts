import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Profile } from './profile.entity';

@Entity()
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  skill: string;

  @Column()
  competencyLevel: string;

  @Column()
  experienceYears: number;

  @ManyToOne(() => Profile, (profile) => profile.skills)
  profile: Profile;
}
