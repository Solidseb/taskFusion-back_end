import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  text: string;

  @IsString()
  author: number;

  @IsOptional()
  @IsNumber()
  parentCommentId?: number;
}
