import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Capsule } from '../entities/capsule.entity';
import { CreateCapsuleDto } from './dto/create-capsule.dto';

@Injectable()
export class CapsuleService {
  constructor(
    @InjectRepository(Capsule)
    private capsuleRepository: Repository<Capsule>,
  ) {}

  // Fetch all capsules with their tasks
  async findAll(): Promise<Capsule[]> {
    return this.capsuleRepository.find({ relations: ['tasks'] });
  }

  // Create a new capsule
  async create(createCapsuleDto: CreateCapsuleDto): Promise<Capsule> {
    const newCapsule = this.capsuleRepository.create(createCapsuleDto);
    return this.capsuleRepository.save(newCapsule);
  }

  // Update an existing capsule
  async update(
    id: number,
    createCapsuleDto: CreateCapsuleDto,
  ): Promise<Capsule> {
    const capsule = await this.capsuleRepository.findOne({ where: { id } });

    if (!capsule) {
      throw new NotFoundException(`Capsule with id ${id} not found`);
    }

    Object.assign(capsule, createCapsuleDto);

    return this.capsuleRepository.save(capsule);
  }

  // Get details of a specific capsule
  async findOne(id: number): Promise<Capsule> {
    const capsule = await this.capsuleRepository.findOne({
      where: { id },
      relations: ['tasks'],
    });
    if (!capsule) {
      throw new NotFoundException(`Capsule with id ${id} not found`);
    }
    return capsule;
  }

  async delete(capsuleId: number): Promise<boolean> {
    // Find the capsule and include its tasks in the query
    const capsule = await this.capsuleRepository.findOne({
      where: { id: capsuleId },
      relations: ['tasks'],
    });

    if (!capsule) {
      throw new NotFoundException(`Capsule with ID ${capsuleId} not found`);
    }

    // Delete the capsule (tasks will be deleted if cascade is enabled)
    await this.capsuleRepository.delete(capsuleId);
    return true;
  }
}
