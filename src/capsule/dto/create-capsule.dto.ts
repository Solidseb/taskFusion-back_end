// src/capsules/dto/create-capsule.dto.ts

import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateCapsuleDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string; // Original due date

  @IsDateString()
  @IsOptional()
  newDueDate?: string; // Updated due date
}
