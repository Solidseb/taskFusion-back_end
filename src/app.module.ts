// src/app.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CapsuleModule } from './capsule/capsule.module';
import { TaskModule } from './task/task.module';
import { UserModule } from './user/user.module';
import { typeOrmConfig } from './config/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { Comment } from './entities/comment.entity';
import { Task } from './entities/task.entity';
import { Profile } from './entities/profile.entity';
import { Skill } from './entities/skill.entity';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TaskHistory } from './entities/task-history.entity';
import { Organization } from './entities/organization.entity';
import { OrganizationModule } from './organization/organization.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: typeOrmConfig,
    }),

    TypeOrmModule.forFeature([
      Comment,
      Task,
      Profile,
      Skill,
      TaskHistory,
      Organization,
    ]),

    AuthModule,
    CapsuleModule,
    TaskModule,
    UserModule,
    OrganizationModule,
  ],
})
export class AppModule {}
