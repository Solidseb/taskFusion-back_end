// src/organization/dto/create-organization.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  emailDomain: string;
}
