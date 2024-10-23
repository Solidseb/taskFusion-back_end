import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Capsule } from '../entities/capsule.entity';
import { Task } from '../entities/task.entity';
import { CapsuleService } from './capsule.service';
import { CapsuleController } from './capsule.controller';
import { OrganizationModule } from '../organization/organization.module'; // Import OrganizationModule
import { Organization } from 'src/entities/organization.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Capsule, Task, Organization]),
    OrganizationModule,
  ],
  providers: [CapsuleService],
  controllers: [CapsuleController],
})
export class CapsuleModule {}
