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

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Capsule, User, Comment, TaskHistory]), // Ensure Capsule is included here
  ],
  providers: [TaskService, CommentsService, TaskHistoryService],
  controllers: [TaskController, CommentsController],
  exports: [TaskService, CommentsService, TaskHistoryService],
})
export class TaskModule {}
