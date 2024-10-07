import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { Task } from '../entities/task.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    @InjectRepository(Task) private readonly tasksRepository: Repository<Task>,
  ) {}

  async createComment(
    taskId: number,
    text: string,
    author: string,
  ): Promise<Comment> {
    const task = await this.tasksRepository.findOne({ where: { id: taskId } });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const comment = this.commentsRepository.create({ text, author, task });
    return this.commentsRepository.save(comment);
  }

  async getCommentsByTask(taskId: number): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { task: { id: taskId } },
      order: { createdAt: 'DESC' },
    });
  }
}
