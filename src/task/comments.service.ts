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

  // Create comment or reply
  async createComment(
    taskId: number,
    text: string,
    author: string,
    parentCommentId?: number,
  ): Promise<Comment> {
    const task = await this.tasksRepository.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');

    // Fetch parent comment if provided
    let parentComment: Comment | null = null;
    if (parentCommentId) {
      parentComment = await this.commentsRepository.findOne({
        where: { id: parentCommentId },
      });
      if (!parentComment)
        throw new NotFoundException('Parent comment not found');
    }

    // Create new comment or reply
    const comment = this.commentsRepository.create({
      text,
      author,
      task,
      parentComment,
    });

    return this.commentsRepository.save(comment);
  }

  // Fetch and structure nested comments
  async getCommentsByTask(taskId: number): Promise<Comment[]> {
    // Find all comments for the task
    const allComments = await this.commentsRepository.find({
      where: { task: { id: taskId } },
      relations: ['parentComment'], // Fetch the parentComment relation
      order: { createdAt: 'ASC' },
    });

    // Map `parentCommentId` from `parentComment`
    return allComments.map((comment) => ({
      ...comment,
      parentCommentId: comment.parentComment?.id || null,
    }));
  }
}
