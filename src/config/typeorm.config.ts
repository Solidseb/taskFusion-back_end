// src/config/typeorm.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Capsule } from '../entities/capsule.entity';
import { Task } from '../entities/task.entity';
import { User } from '../entities/user.entity';
import { Comment } from '../entities/comment.entity';
import { Profile } from 'src/entities/profile.entity';
import { Skill } from 'src/entities/skill.entity';
import { TaskHistory } from 'src/entities/task-history.entity';
import { Organization } from 'src/entities/organization.entity';

export const typeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DATABASE_HOST'),
  port: configService.get<number>('DATABASE_PORT'),
  username: configService.get<string>('DATABASE_USER'),
  password: configService.get<string>('DATABASE_PASSWORD'),
  database: configService.get<string>('DATABASE_NAME'),
  entities: [
    Capsule,
    Task,
    User,
    Comment,
    Profile,
    Skill,
    TaskHistory,
    Organization,
  ],
  synchronize: true, // Disable in production
});
