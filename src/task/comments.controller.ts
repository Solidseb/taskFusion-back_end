import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('tasks/:taskId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  async createComment(
    @Param('taskId') taskId: number,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.createComment(
      taskId,
      createCommentDto.text,
      createCommentDto.author,
      createCommentDto.parentCommentId,
    );
  }

  @Get()
  async getComments(@Param('taskId') taskId: number) {
    return this.commentsService.getCommentsByTask(taskId);
  }
}
