import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../entities/task.entity';
import { Capsule } from '../entities/capsule.entity';
import { User } from '../entities/user.entity';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { CommentsService } from './comments.service';
import { Comment } from '../entities/comment.entity';
import { CommentsController } from './comments.controller';
import { TaskHistoryService } from './task-history.service';
import { TaskHistory } from '../entities/task-history.entity';
import { Organization } from 'src/entities/organization.entity';
import { OrganizationService } from 'src/organization/organization.service';
import { OrganizationController } from 'src/organization/organization.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Task,
      Capsule,
      User,
      Comment,
      TaskHistory,
      Organization,
    ]), // Ensure Capsule is included here
  ],
  providers: [
    TaskService,
    CommentsService,
    TaskHistoryService,
    OrganizationService,
  ],
  controllers: [TaskController, CommentsController, OrganizationController],
  exports: [
    TaskService,
    CommentsService,
    TaskHistoryService,
    OrganizationService,
  ],
})
export class TaskModule {}
