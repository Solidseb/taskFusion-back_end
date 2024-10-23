// src/capsules/capsule.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Capsule } from '../entities/capsule.entity';
import { CreateCapsuleDto } from './dto/create-capsule.dto';
import { Task } from '../entities/task.entity';
import { User } from '../entities/user.entity';
import { Organization } from '../entities/organization.entity';

@Injectable()
export class CapsuleService {
  constructor(
    @InjectRepository(Capsule)
    private capsuleRepository: Repository<Capsule>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>, // Injecting organization repository
  ) {}

  // Fetch all capsules with their tasks and calculated status, due dates, and assigned users
  async findAllByOrganization(organizationId: string): Promise<any[]> {
    const capsules = await this.capsuleRepository.find({
      where: { organization: { id: organizationId } }, // Fetch only capsules within the organization
      relations: ['tasks'],
    });

    return capsules.map((capsule) => {
      const completedTasks = capsule.tasks.filter(
        (task) => task.status === 'Completed',
      ).length;
      const totalTasks = capsule.tasks.length;
      const assignedUsers = this.extractAssignedUsers(capsule.tasks);

      // Determine status based on tasks
      let status = 'Pending';
      if (completedTasks === totalTasks) {
        status = 'Completed';
      } else if (completedTasks > 0 && completedTasks < totalTasks) {
        status = 'In Progress';
      }

      return {
        ...capsule,
        status,
        completedTasks,
        totalTasks,
        assignedUsers,
      };
    });
  }

  // Create a new capsule linked to an organization
  async create(
    createCapsuleDto: CreateCapsuleDto,
    organizationId: string,
  ): Promise<Capsule> {
    const organization = await this.organizationRepository.findOne({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException(
        `Organization with id ${organizationId} not found`,
      );
    }

    const newCapsule = this.capsuleRepository.create({
      ...createCapsuleDto,
      organization, // Associate the capsule with an organization
    });

    return this.capsuleRepository.save(newCapsule);
  }

  // Update an existing capsule
  async update(
    id: number,
    createCapsuleDto: CreateCapsuleDto,
    organizationId: string,
  ): Promise<Capsule> {
    const capsule = await this.capsuleRepository.findOne({
      where: { id, organization: { id: organizationId } }, // Ensure capsule belongs to the organization
    });

    if (!capsule) {
      throw new NotFoundException(`Capsule with id ${id} not found`);
    }

    Object.assign(capsule, createCapsuleDto);

    return this.capsuleRepository.save(capsule);
  }

  // Get details of a specific capsule with task completion data
  async findOne(id: number, organizationId: string): Promise<any> {
    const capsule = await this.capsuleRepository.findOne({
      where: { id, organization: { id: organizationId } }, // Ensure capsule belongs to the organization
      relations: ['tasks'],
    });

    if (!capsule) {
      throw new NotFoundException(`Capsule with id ${id} not found`);
    }

    const completedTasks = capsule.tasks.filter(
      (task) => task.status === 'Completed',
    ).length;
    const totalTasks = capsule.tasks.length;
    const assignedUsers = this.extractAssignedUsers(capsule.tasks);

    // Determine status based on tasks
    let status = 'Pending';
    if (completedTasks === totalTasks) {
      status = 'Completed';
    } else if (completedTasks > 0 && completedTasks < totalTasks) {
      status = 'In Progress';
    }

    return {
      ...capsule,
      status,
      completedTasks,
      totalTasks,
      assignedUsers,
    };
  }

  // Delete a capsule
  async delete(capsuleId: number, organizationId: string): Promise<boolean> {
    const capsule = await this.capsuleRepository.findOne({
      where: { id: capsuleId, organization: { id: organizationId } }, // Ensure capsule belongs to the organization
      relations: ['tasks'],
    });

    if (!capsule) {
      throw new NotFoundException(`Capsule with ID ${capsuleId} not found`);
    }

    await this.capsuleRepository.delete(capsuleId);
    return true;
  }

  // Helper function to extract assigned users from tasks
  private extractAssignedUsers(tasks: Task[]): User[] {
    const assignedUsersMap = new Map<string, User>();
    tasks.forEach((task) => {
      task.assignedUsers.forEach((user) => {
        if (!assignedUsersMap.has(user.id)) {
          assignedUsersMap.set(user.id, user);
        }
      });
    });
    return Array.from(assignedUsersMap.values());
  }
}
