// src/user/dto/create-user.dto.ts
export class CreateUserDto {
  name: string;
  email: string;
  password: string; // Will be hashed
  organizationId: string;
}
