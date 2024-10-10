// src/user/user.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from '../entities/user.entity';
import { Profile } from '../entities/profile.entity';
import { Skill } from 'src/entities/skill.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile, Skill])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
