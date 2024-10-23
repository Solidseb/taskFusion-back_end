import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Query,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestWithUser } from 'src/auth/request-with-user.interface';
import { TaskHistoryService } from './task-history.service';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    private readonly taskHistoryService: TaskHistoryService,
  ) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.taskService.findOne(+id);
  }

  @Post()
  create(@Req() req: RequestWithUser, @Body() createTaskDto: CreateTaskDto) {
    const userId = req.user.id;
    const organizationId = req.user.organizationId;
    return this.taskService.create(createTaskDto, userId, organizationId);
  }

  @Put(':id')
  update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    const userId = req.user.id;
    return this.taskService.update(+id, updateTaskDto, userId);
  }

  @Delete(':id')
  delete(@Req() req: RequestWithUser, @Param('id') id: string) {
    const userId = req.user.id;
    return this.taskService.delete(+id, userId);
  }

  @Put(':id/completion')
  async toggleTaskCompletion(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body('completed') completed: boolean,
  ) {
    const userId = req.user.id;
    return this.taskService.updateTaskCompletionStatus(+id, completed, userId);
  }

  @Get('capsule/:capsuleId')
  findByCapsule(@Param('capsuleId') capsuleId: string) {
    return this.taskService.findByCapsule(+capsuleId);
  }

  // New route to fetch subtasks by parentId
  @Get()
  findTasks(@Query('parentId') parentId: string) {
    if (parentId) {
      return this.taskService.findByParentId(+parentId);
    }
    return [];
  }

  @Get(':id/history')
  getTaskHistory(@Param('id') id: string) {
    return this.taskHistoryService.getTaskHistory(+id);
  }

  @Get(':id/dependencies')
  getTaskDependencies(@Param('id') id: string) {
    return this.taskService.getTaskDependencies(+id);
  }
}
