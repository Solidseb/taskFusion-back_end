import {
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  completedDate?: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  assignedUserIds?: number[];

  @IsOptional()
  @IsInt()
  capsuleId?: number;

  @IsOptional()
  @IsInt()
  parent_id?: number;

  @IsOptional()
  @IsArray()
  blockers?: number[];
}
