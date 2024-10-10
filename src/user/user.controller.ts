import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  UseGuards,
  Req,
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

  // Register a new user
  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
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
      profile: { bio: string; name: string; email: string };
      skills: Skill[];
      password?: string;
    },
  ) {
    const userId = req.user.id;
    const { profile, skills, password } = body;

    // Pass bio, name, and email alongside the skills and password to the service
    return this.userService.updateProfile(userId, profile, skills, password);
  }

  // Get all users (for admin access)
  @Get()
  findAll() {
    return this.userService.findAll();
  }
}
