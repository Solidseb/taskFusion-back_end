import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { OrganizationService } from '../organization/organization.service'; // Import organization service

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private organizationService: OrganizationService,
  ) {}

  // Login Endpoint
  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    // Ensure the organization is included in the token payload
    const { organizationId } = user;
    return this.authService.login({ ...user, organizationId });
  }

  // Registration Endpoint with secret token validation
  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto & { secretToken: string },
  ) {
    const organization = await this.organizationService.findById(
      createUserDto.organizationId,
    );

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Validate the secret token
    const isValidToken = await this.organizationService.validateSecretToken(
      createUserDto.organizationId,
      createUserDto.secretToken,
    );

    if (!isValidToken) {
      throw new UnauthorizedException('Invalid secret token');
    }

    // Create the user and associate it with the organization
    const newUser = await this.userService.create({
      ...createUserDto,
      organizationId: organization.id,
    });

    return newUser;
  }
}
