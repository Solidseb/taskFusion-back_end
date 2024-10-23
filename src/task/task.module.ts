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
import { Setting } from 'src/entities/setting.entity';
import { SettingController } from 'src/settings/setgings.controller';
import { SettingService } from 'src/settings/settings.service';
import { Tag } from 'src/entities/tag.entity';
import { TagService } from 'src/tag/tag.service';
import { TagController } from 'src/tag/tag.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Task,
      Capsule,
      User,
      Comment,
      TaskHistory,
      Organization,
      Setting,
      Tag,
    ]), // Ensure Capsule is included here
  ],
  providers: [
    TaskService,
    CommentsService,
    TaskHistoryService,
    OrganizationService,
    SettingService,
    TagService,
  ],
  controllers: [
    TaskController,
    CommentsController,
    OrganizationController,
    SettingController,
    TagController,
  ],
  exports: [
    TaskService,
    CommentsService,
    TaskHistoryService,
    OrganizationService,
    SettingService,
    TagService,
  ],
})
export class TaskModule {}
