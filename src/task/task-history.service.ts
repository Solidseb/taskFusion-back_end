// src/task/task-history.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskHistory } from '../entities/task-history.entity';
import { Task } from '../entities/task.entity';
import { Capsule } from '../entities/capsule.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class TaskHistoryService {
  constructor(
    @InjectRepository(TaskHistory)
    private taskHistoryRepository: Repository<TaskHistory>,

    @InjectRepository(Task)
    private taskRepository: Repository<Task>,

    @InjectRepository(Capsule)
    private capsuleRepository: Repository<Capsule>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async logTaskHistory(
    taskId: number,
    capsuleId: number,
    userId: string,
    changeType: string,
    changeDescription: string,
  ): Promise<TaskHistory> {
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    const capsule = await this.capsuleRepository.findOne({
      where: { id: capsuleId },
    });
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!task || !capsule || !user) {
      throw new NotFoundException('Task, Capsule, or User not found');
    }

    const historyEntry = this.taskHistoryRepository.create({
      task,
      capsule,
      user,
      changeType,
      changeDescription,
      timestamp: new Date(),
    });

    return this.taskHistoryRepository.save(historyEntry);
  }

  async getTaskHistory(taskId: number): Promise<TaskHistory[]> {
    const task = await this.taskRepository.findOne({ where: { id: taskId } });

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    return this.taskHistoryRepository.find({
      where: { task: { id: taskId } },
      relations: ['user'],
      order: { timestamp: 'DESC' },
    });
  }
}
