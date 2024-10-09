import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { User } from '../entities/user.entity';
import { Capsule } from '../entities/capsule.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Capsule)
    private capsuleRepository: Repository<Capsule>,
  ) {}

  // Find task details by ID
  async findOne(id: number): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['assignedUsers', 'capsule'], // Load related entities
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  // Create a new task
  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const { assignedUserIds, capsuleId, ...taskData } = createTaskDto;

    // Find the associated capsule
    const capsule = await this.capsuleRepository.findOne({
      where: { id: capsuleId },
    });
    if (!capsule) {
      throw new NotFoundException(`Capsule with ID ${capsuleId} not found`);
    }

    // Initialize the task entity with the capsule relation
    const task = this.taskRepository.create({ ...taskData, capsule });

    // Assign users if `assignedUserIds` are provided
    if (assignedUserIds && assignedUserIds.length > 0) {
      const users = await this.userRepository.findBy({
        id: In(assignedUserIds),
      });
      task.assignedUsers = users;
    }

    // Save and return the created task with relations
    return this.taskRepository.save(task);
  }

  // Update an existing task
  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    // Find the existing task by ID
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    const { assignedUserIds, ...taskData } = updateTaskDto;

    // Update task properties
    Object.assign(task, taskData);

    // Handle user assignment
    if (assignedUserIds !== undefined) {
      const users = await this.userRepository.findBy({
        id: In(assignedUserIds),
      });
      task.assignedUsers = users;
    }

    // Save the updated task to the database
    return this.taskRepository.save(task);
  }

  // Find tasks by capsule
  async findByCapsule(capsuleId: number): Promise<Task[]> {
    return this.taskRepository.find({
      where: { capsule: { id: capsuleId } },
      relations: ['assignedUsers', 'capsule'],
    });
  }

  async updateTaskCompletionStatus(
    id: number,
    completed: boolean,
  ): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }

    task.isCompleted = completed;
    return this.taskRepository.save(task);
  }
}
