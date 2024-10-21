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

  // Find task details by ID (with subtasks and blockers)
  async findOne(id: number): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['assignedUsers', 'capsule', 'subtasks', 'blockers'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  // Fetch dependencies of a task
  async getTaskDependencies(id: number): Promise<Task[]> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['blockers', 'dependentTasks'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task.blockers;
  }

  // Create a new task (or subtask if parent_id is provided)
  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    const { assignedUserIds, capsuleId, parent_id, blockers, ...taskData } =
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

    if (blockers && blockers.length > 0) {
      const blockerTasks = await this.taskRepository.findBy({
        id: In(blockers),
      });
      task.blockers = blockerTasks;
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
      relations: ['blockers'],
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    const { assignedUserIds, parent_id, blockers, ...taskData } = updateTaskDto;
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

    const oldUserIds = task.assignedUsers.map((user) => user.id);
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

      const newUserIds = newUsers.map((user) => user.id);
      oldUserIds.sort();
      newUserIds.sort();
      if (JSON.stringify(oldUserIds) !== JSON.stringify(newUserIds)) {
        changes.assignedUsers = {
          old: oldUserIds,
          new: newUserIds,
        };

        task.assignedUsers = newUsers;
      }
    }

    try {
      if (blockers) {
        const blockerTasks = await this.taskRepository.findBy({
          id: In(blockers),
        });
        blockerTasks.sort();
        const oldBlockers = task.blockers.sort();
        if (JSON.stringify(oldBlockers) !== JSON.stringify(blockerTasks)) {
          changes.blockers = {
            old: oldBlockers.map((task) => task.id),
            new: blockers,
          };
          task.blockers = blockerTasks;
        }
      }
    } catch (e) {
      console.log(e);
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
        updateTaskDto.capsuleId,
        userId,
        'taskUpdated',
        JSON.stringify(changes),
      );

      // If this is a subtask, log the update for the parent task as well
      if (task.parent_id) {
        await this.taskHistoryService.logTaskHistory(
          task.parent_id,
          updateTaskDto.capsuleId,
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
      relations: ['subtasks', 'capsule', 'blockers'],
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
  ): Promise<{
    success: boolean;
    message?: string;
    blockers?: any[];
    subtasks?: any[];
    task?: Task;
  }> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: [
        'subtasks',
        'parentTask',
        'capsule',
        'blockers',
        'dependentTasks',
      ], // Added 'dependentTasks' relation
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // Check if there are incomplete blockers
    const incompleteBlockers = task.blockers.filter(
      (blocker) => blocker.status !== 'Completed',
    );
    if (incompleteBlockers.length > 0) {
      return {
        success: false,
        message: 'Task is blocked by incomplete tasks',
        blockers: incompleteBlockers.map((blocker) => ({
          id: blocker.id,
          title: blocker.title,
          status: blocker.status,
        })),
      };
    }

    // Check if all subtasks are completed
    if (completed && task.subtasks && task.subtasks.length > 0) {
      const incompleteSubtasks = task.subtasks.filter(
        (subtask) => !subtask.isCompleted,
      );
      if (incompleteSubtasks.length > 0) {
        return {
          success: false,
          message:
            'Task cannot be completed because some subtasks are not completed',
          subtasks: incompleteSubtasks.map((subtask) => ({
            id: subtask.id,
            title: subtask.title,
            status: subtask.status,
          })),
        };
      }
    }

    // Update task completion status
    task.isCompleted = completed;
    task.status = completed ? 'Completed' : 'In Progress';
    task.completedDate = completed ? new Date().toISOString() : null;

    // If the task is a subtask and it's being marked incomplete, update the parent task
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

    // Update the status of subtasks if the task is being marked incomplete
    /*if (task.subtasks && task.subtasks.length > 0 && !completed) {
      task.subtasks.forEach((subtask) => {
        subtask.isCompleted = false;
        subtask.status = 'In Progress';
        subtask.completedDate = null;
      });
      await this.taskRepository.save(task.subtasks);
    }*/

    // If the task has dependent tasks (tasks blocked by this one), mark them as "In Progress" if this task is marked incomplete
    if (!completed && task.dependentTasks && task.dependentTasks.length > 0) {
      for (const dependentTask of task.dependentTasks) {
        dependentTask.isCompleted = false;
        dependentTask.status = 'In Progress';
        dependentTask.completedDate = null;

        await this.taskRepository.save(dependentTask);

        // Log the change for each dependent task
        await this.taskHistoryService.logTaskHistory(
          dependentTask.id,
          task.capsule.id,
          userId,
          'taskInProgress',
          JSON.stringify({
            message: `Task was unblocked due to change in task ${task.id}`,
          }),
        );
      }
    }

    // Save the updated task
    const updatedTask = await this.taskRepository.save(task);

    // Log task completion status change
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

    // If it's a subtask, log the completion status in the parent task
    if (task.parent_id) {
      await this.taskHistoryService.logTaskHistory(
        task.parent_id,
        task.capsule.id,
        userId,
        completed ? 'subtaskCompleted' : 'subtaskInProgress',
        JSON.stringify({ subtaskId: task.id, status: changes.status }),
      );
    }

    return {
      success: true,
      task: updatedTask,
    };
  }

  async findByCapsule(capsuleId: number): Promise<Task[]> {
    const tasks = await this.taskRepository.find({
      where: {
        capsule: { id: capsuleId },
        parent_id: null,
      },
      relations: ['assignedUsers', 'capsule', 'subtasks', 'blockers'],
    });

    return tasks.filter((task) => task.parent_id === null);
  }

  // Fetch tasks by parentId (subtasks) or dependencies (blockers)
  async findByParentId(parentId: number): Promise<Task[]> {
    return this.taskRepository.find({
      where: { parent_id: parentId },
      relations: ['assignedUsers', 'capsule', 'subtasks', 'blockers'],
    });
  }
}
