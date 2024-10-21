import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsInt()
  capsuleId: number;

  @IsOptional()
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  priority: string;

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
  parent_id?: number;

  @IsOptional()
  @IsArray()
  blockers?: number[];
}
