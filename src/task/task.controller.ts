import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Query,
  Delete,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.taskService.findOne(+id);
  }

  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.taskService.create(createTaskDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.taskService.update(+id, updateTaskDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.taskService.delete(+id);
  }

  @Put(':id/completion')
  async toggleTaskCompletion(
    @Param('id') id: string,
    @Body('completed') completed: boolean,
  ) {
    return this.taskService.updateTaskCompletionStatus(+id, completed);
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
}
