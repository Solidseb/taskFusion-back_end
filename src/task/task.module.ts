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

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Capsule, User, Comment]), // Ensure Capsule is included here
  ],
  providers: [TaskService, CommentsService],
  controllers: [TaskController, CommentsController],
  exports: [TaskService, CommentsService],
})
export class TaskModule {}
