import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { User } from '../entities/user.entity';
import { Capsule } from '../entities/capsule.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskHistoryService } from './task-history.service';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Capsule)
    private capsuleRepository: Repository<Capsule>,

    private taskHistoryService: TaskHistoryService,
  ) {}

  // Find task details by ID (with subtasks)
  async findOne(id: number): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['assignedUsers', 'capsule', 'subtasks'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  // Create a new task (or subtask if parent_id is provided)
  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    const { assignedUserIds, capsuleId, parent_id, ...taskData } =
      createTaskDto;

    const capsule = await this.capsuleRepository.findOne({
      where: { id: capsuleId },
    });
    if (!capsule) {
      throw new NotFoundException(`Capsule with ID ${capsuleId} not found`);
    }

    const task = this.taskRepository.create({ ...taskData, capsule });

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

    if (assignedUserIds && assignedUserIds.length > 0) {
      const users = await this.userRepository.findBy({
        id: In(assignedUserIds),
      });
      task.assignedUsers = users;
    }

    const savedTask = await this.taskRepository.save(task);

    // Log the task creation for the subtask and parent task (if applicable)
    await this.taskHistoryService.logTaskHistory(
      savedTask.id,
      capsuleId,
      userId,
      'taskCreated',
      JSON.stringify(taskData),
    );

    if (parent_id) {
      await this.taskHistoryService.logTaskHistory(
        parent_id,
        capsuleId,
        userId,
        'subtaskCreated',
        JSON.stringify({ subtaskId: savedTask.id, ...taskData }),
      );
    }

    return savedTask;
  }

  // Update an existing task (or subtask)
  async update(
    id: number,
    updateTaskDto: UpdateTaskDto,
    userId: string,
  ): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    const { assignedUserIds, parent_id, ...taskData } = updateTaskDto;
    const changes: Record<string, any> = {};

    // Function to dynamically detect changes
    const detectChanges = (oldData: any, newData: any, field: string) => {
      if (
        oldData !== newData &&
        field !== 'capsuleId' &&
        field !== 'capsule' &&
        field !== 'subtasks' &&
        field !== 'assignedUsers'
      ) {
        changes[field] = { old: oldData, new: newData };
      }
    };

    // Iterate over the taskData fields dynamically
    Object.keys(taskData).forEach((key) => {
      detectChanges(task[key], taskData[key], key);
      task[key] = taskData[key]; // Apply the new data to the task
    });

    if (assignedUserIds !== undefined) {
      // Fetch new users by their IDs
      const newUsers = await this.userRepository.findBy({
        id: In(assignedUserIds),
      });

      const oldUserIds = task.assignedUsers.map((user) => user.id);
      const newUserIds = newUsers.map((user) => user.id);

      if (JSON.stringify(oldUserIds) !== JSON.stringify(newUserIds)) {
        changes.assignedUsers = {
          old: oldUserIds,
          new: newUserIds,
        };

        task.assignedUsers = newUsers;
      }
    }

    // Handle parent task change (subtask reassignment)
    if (parent_id && task.parent_id !== parent_id) {
      const parentTask = await this.taskRepository.findOne({
        where: { id: parent_id },
      });
      if (!parentTask) {
        throw new NotFoundException(
          `Parent task with ID ${parent_id} not found`,
        );
      }
      changes.parentTask = { old: task.parent_id, new: parent_id };
      task.parent_id = parent_id;
    }

    const updatedTask = await this.taskRepository.save(task);

    // Log the task update
    if (Object.keys(changes).length > 0) {
      await this.taskHistoryService.logTaskHistory(
        updatedTask.id,
        task.capsule.id,
        userId,
        'taskUpdated',
        JSON.stringify(changes),
      );

      // If this is a subtask, log the update for the parent task as well
      if (task.parent_id) {
        await this.taskHistoryService.logTaskHistory(
          task.parent_id,
          task.capsule.id,
          userId,
          'subtaskUpdated',
          JSON.stringify({ subtaskId: updatedTask.id, changes }),
        );
      }
    }

    return updatedTask;
  }

  // Delete a task and its subtasks
  async delete(id: number, userId: string): Promise<void> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['subtasks', 'capsule'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    if (task.subtasks && task.subtasks.length > 0) {
      await this.taskRepository.remove(task.subtasks);
    }

    await this.taskHistoryService.logTaskHistory(
      id,
      task.capsule.id,
      userId,
      'taskDeleted',
      JSON.stringify(task),
    );

    // If this is a subtask, log the deletion for the parent task
    if (task.parent_id) {
      await this.taskHistoryService.logTaskHistory(
        task.parent_id,
        task.capsule.id,
        userId,
        'subtaskDeleted',
        JSON.stringify({ subtaskId: task.id }),
      );
    }

    await this.taskRepository.remove(task);
  }

  // Update task and subtask completion status
  async updateTaskCompletionStatus(
    id: number,
    completed: boolean,
    userId: string,
  ): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['subtasks', 'parentTask', 'capsule'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    task.isCompleted = completed;
    task.status = completed ? 'Completed' : 'In Progress';
    task.completedDate = completed ? new Date().toISOString() : null;

    if (task.parent_id && !completed) {
      const parentTask = await this.taskRepository.findOne({
        where: { id: task.parent_id },
        relations: ['subtasks'],
      });

      if (parentTask) {
        parentTask.isCompleted = false;
        parentTask.status = 'In Progress';
        parentTask.completedDate = null;
        await this.taskRepository.save(parentTask);
      }
    }

    if (task.subtasks && task.subtasks.length > 0) {
      if (completed) {
        const allSubtasksCompleted = task.subtasks.every(
          (subtask) => subtask.isCompleted,
        );
        if (!allSubtasksCompleted) {
          throw new Error(
            'Cannot complete the task because some subtasks are not completed',
          );
        }
      } else {
        task.subtasks.forEach((subtask) => {
          subtask.isCompleted = false;
          subtask.status = 'In Progress';
          subtask.completedDate = null;
        });
        await this.taskRepository.save(task.subtasks);
      }
    }

    const updatedTask = await this.taskRepository.save(task);

    // Log task completion status change as a JSON object
    const changes = {
      status: completed ? 'Completed' : 'In Progress',
      completedDate: task.completedDate,
    };

    await this.taskHistoryService.logTaskHistory(
      id,
      task.capsule.id,
      userId,
      completed ? 'taskCompleted' : 'taskInProgress',
      JSON.stringify(changes),
    );

    // If it's a subtask, log the completion status in the parent task as well
    if (task.parent_id) {
      await this.taskHistoryService.logTaskHistory(
        task.parent_id,
        task.capsule.id,
        userId,
        completed ? 'subtaskCompleted' : 'subtaskInProgress',
        JSON.stringify({ subtaskId: task.id, status: changes.status }),
      );
    }

    return updatedTask;
  }

  async findByCapsule(capsuleId: number): Promise<Task[]> {
    const tasks = await this.taskRepository.find({
      where: {
        capsule: { id: capsuleId },
        parent_id: null,
      },
      relations: ['assignedUsers', 'capsule', 'subtasks'],
    });

    return tasks.filter((task) => task.parent_id === null);
  }

  // Fetch tasks by parentId (subtasks)
  async findByParentId(parentId: number): Promise<Task[]> {
    return this.taskRepository.find({
      where: { parent_id: parentId },
      relations: ['assignedUsers', 'capsule', 'subtasks'],
    });
  }
}
