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
} from '@nestjs/common';
import { CapsuleService } from './capsule.service';
import { Capsule } from '../entities/capsule.entity';
import { CreateCapsuleDto } from './dto/create-capsule.dto';

@Controller('capsules')
export class CapsuleController {
  constructor(private readonly capsuleService: CapsuleService) {}

  @Get()
  findAll(): Promise<Capsule[]> {
    return this.capsuleService.findAll();
  }

  @Post()
  create(@Body() createCapsuleDto: CreateCapsuleDto): Promise<Capsule> {
    return this.capsuleService.create(createCapsuleDto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() createCapsuleDto: CreateCapsuleDto,
  ): Promise<Capsule> {
    return this.capsuleService.update(+id, createCapsuleDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Capsule> {
    return this.capsuleService.findOne(+id);
  }

  @Delete(':id')
  async deleteCapsule(@Param('id') id: string): Promise<{ message: string }> {
    const deleted = await this.capsuleService.delete(parseInt(id));
    if (!deleted) {
      throw new NotFoundException(`Capsule with ID ${id} not found`);
    }
    return { message: 'Capsule deleted successfully' };
  }
}
