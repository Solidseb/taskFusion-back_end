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

  // Find task details by ID (with subtasks)
  async findOne(id: number): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['assignedUsers', 'capsule', 'subtasks'], // Load related entities, including subtasks
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  // Fetch tasks by parentId (subtasks)
  async findByParentId(parentId: number): Promise<Task[]> {
    return this.taskRepository.find({
      where: { parent_id: parentId },
      relations: ['assignedUsers', 'capsule', 'subtasks'], // Include relations if needed
    });
  }

  async delete(id: number): Promise<void> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['subtasks'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // If the task has subtasks, delete them first
    if (task.subtasks && task.subtasks.length > 0) {
      await this.taskRepository.remove(task.subtasks);
    }

    // Delete the main task
    await this.taskRepository.remove(task);
  }

  // Create a new task (or subtask if parent_id is provided)
  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const { assignedUserIds, capsuleId, parent_id, ...taskData } =
      createTaskDto;

    // Find the associated capsule
    const capsule = await this.capsuleRepository.findOne({
      where: { id: capsuleId },
    });
    if (!capsule) {
      throw new NotFoundException(`Capsule with ID ${capsuleId} not found`);
    }

    // Initialize the task entity with the capsule relation
    const task = this.taskRepository.create({ ...taskData, capsule });

    // If creating a subtask, assign the parent task
    if (parent_id) {
      const parentTask = await this.taskRepository.findOne({
        where: { id: parent_id },
      });
      if (!parentTask) {
        throw new NotFoundException(
          `Parent task with ID ${parent_id} not found`,
        );
      }
      task.parent_id = parent_id;
    }

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

  // Update an existing task (or subtask)
  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    // Find the existing task by ID
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    const { assignedUserIds, parent_id, ...taskData } = updateTaskDto;

    // Update task properties
    Object.assign(task, taskData);

    // Handle user assignment
    if (assignedUserIds !== undefined) {
      const users = await this.userRepository.findBy({
        id: In(assignedUserIds),
      });
      task.assignedUsers = users;
    }

    // If updating subtask, update parent_id if necessary
    if (parent_id) {
      const parentTask = await this.taskRepository.findOne({
        where: { id: parent_id },
      });
      if (!parentTask) {
        throw new NotFoundException(
          `Parent task with ID ${parent_id} not found`,
        );
      }
      task.parent_id = parent_id;
    }

    // Save the updated task to the database
    return this.taskRepository.save(task);
  }

  // Find tasks by capsule, including subtasks
  async findByCapsule(capsuleId: number): Promise<Task[]> {
    const tasks = await this.taskRepository.find({
      where: {
        capsule: { id: capsuleId },
        parent_id: null,
      },
      relations: ['assignedUsers', 'capsule', 'subtasks'], // Relations to include
    });

    // Check that only tasks without parent_id are returned
    return tasks.filter((task) => task.parent_id === null); // Ensure filtering of tasks with parent_id
  }

  // Update task and subtask completion status
  async updateTaskCompletionStatus(
    id: number,
    completed: boolean,
  ): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['subtasks', 'parentTask'], // Load subtasks and parent task if any
    });
    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }

    // Update completion status for the task
    task.isCompleted = completed;
    task.status = completed ? 'Completed' : 'In Progress';
    task.completedDate = completed ? new Date().toISOString() : null;

    // If this task is a subtask and marked as not completed, update parent task to "In Progress"
    if (task.parent_id && !completed) {
      const parentTask = await this.taskRepository.findOne({
        where: { id: task.parent_id },
        relations: ['subtasks'],
      });

      if (parentTask) {
        parentTask.isCompleted = false;
        parentTask.status = 'In Progress';
        parentTask.completedDate = null;
        await this.taskRepository.save(parentTask); // Save parent task status change
      }
    }

    // If this is a parent task, check the subtasks
    if (task.subtasks && task.subtasks.length > 0) {
      if (completed) {
        // Mark parent task as complete only if all subtasks are completed
        const allSubtasksCompleted = task.subtasks.every(
          (subtask) => subtask.isCompleted,
        );
        if (!allSubtasksCompleted) {
          throw new Error(
            'Cannot complete the task because some subtasks are not completed',
          );
        }
      } else {
        // If parent task is marked as incomplete, update all subtasks as incomplete
        task.subtasks.forEach((subtask) => {
          subtask.isCompleted = false;
          subtask.status = 'In Progress';
          subtask.completedDate = null;
        });
        await this.taskRepository.save(task.subtasks);
      }
    }

    return this.taskRepository.save(task);
  }
}
