import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from '../entities/user.entity';
import { Profile } from '../entities/profile.entity';
import { Skill } from '../entities/skill.entity';
import { OrganizationModule } from '../organization/organization.module'; // Import OrganizationModule
import { Organization } from 'src/entities/organization.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile, Skill, Organization]), // User related entities
    OrganizationModule, // Import the OrganizationModule here
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
