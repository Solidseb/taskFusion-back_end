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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: typeOrmConfig,
    }),

    TypeOrmModule.forFeature([Comment, Task, Profile, Skill]),

    AuthModule,
    CapsuleModule,
    TaskModule,
    UserModule,
  ],
})
export class AppModule {}
