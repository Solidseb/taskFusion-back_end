import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestWithUser } from '../auth/request-with-user.interface';
import { Skill } from 'src/entities/skill.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Register a new user linked to an organization
  @Post('register')
  async create(
    @Req() req: RequestWithUser,
    @Body() createUserDto: CreateUserDto,
  ) {
    const { organizationId } = req.user; // Get organization from the logged-in user
    const organization =
      await this.userService.findOrganizationById(organizationId);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    return this.userService.create(createUserDto);
  }

  // Fetch the user's profile (bio, skills) using JWT
  @Get('profile')
  getProfile(@Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.userService.getProfile(userId);
  }

  // Fetch the current user's info (name, email) using JWT
  @Get('info')
  getUserInfo(@Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.userService.findOne(userId);
  }

  @Put('profile')
  updateProfile(
    @Req() req: RequestWithUser,
    @Body()
    body: {
      profile: { bio: string; name: string; email: string; avatar?: string };
      skills: Skill[];
      password?: string;
    },
  ) {
    const userId = req.user.id;
    const { profile, skills, password } = body;
    return this.userService.updateProfile(userId, profile, skills, password);
  }

  // Get all users within the organization
  @Get()
  findAll(@Req() req: RequestWithUser) {
    const organizationId = req.user.organizationId;
    return this.userService.findAllByOrganization(organizationId);
  }
}
