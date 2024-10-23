// src/capsules/capsule.controller.ts

import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Delete,
  NotFoundException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CapsuleService } from './capsule.service';
import { Capsule } from '../entities/capsule.entity';
import { CreateCapsuleDto } from './dto/create-capsule.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestWithUser } from '../auth/request-with-user.interface';

@Controller('capsules')
@UseGuards(JwtAuthGuard) // Ensure all endpoints are protected
export class CapsuleController {
  constructor(private readonly capsuleService: CapsuleService) {}

  // Fetch all capsules for the user's organization
  @Get()
  findAll(@Req() req: RequestWithUser): Promise<any[]> {
    const organizationId = req.user.organizationId;
    return this.capsuleService.findAllByOrganization(organizationId);
  }

  // Create a capsule in the user's organization
  @Post()
  create(
    @Body() createCapsuleDto: CreateCapsuleDto,
    @Req() req: RequestWithUser,
  ): Promise<Capsule> {
    const organizationId = req.user.organizationId;
    return this.capsuleService.create(createCapsuleDto, organizationId);
  }

  // Update a capsule in the user's organization
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() createCapsuleDto: CreateCapsuleDto,
    @Req() req: RequestWithUser,
  ): Promise<Capsule> {
    const organizationId = req.user.organizationId;
    return this.capsuleService.update(+id, createCapsuleDto, organizationId);
  }

  // Fetch a specific capsule within the user's organization
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser): Promise<any> {
    const organizationId = req.user.organizationId;
    return this.capsuleService.findOne(+id, organizationId);
  }

  // Delete a capsule in the user's organization
  @Delete(':id')
  async deleteCapsule(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<{ message: string }> {
    const organizationId = req.user.organizationId;
    const deleted = await this.capsuleService.delete(+id, organizationId);

    if (!deleted) {
      throw new NotFoundException(`Capsule with ID ${id} not found`);
    }

    return { message: 'Capsule deleted successfully' };
  }
}
