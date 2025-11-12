import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async findBoard(userId: string, projectId: string) {
    await this.ensureProjectAccess(userId, projectId);
    const tasks = await this.prisma.task.findMany({
      where: { projectId },
      orderBy: [{ status: 'asc' }, { position: 'asc' }],
    });

    return {
      TODO: tasks.filter((task) => task.status === TaskStatus.TODO),
      IN_PROGRESS: tasks.filter(
        (task) => task.status === TaskStatus.IN_PROGRESS,
      ),
      DONE: tasks.filter((task) => task.status === TaskStatus.DONE),
    };
  }

  async create(userId: string, projectId: string, dto: CreateTaskDto) {
    await this.ensureProjectAccess(userId, projectId);
    const status = dto.status ?? TaskStatus.TODO;
    const position = await this.prisma.task.count({
      where: { projectId, status },
    });

    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status,
        position,
        projectId,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateTaskDto) {
    const task = await this.getTaskForUser(userId, id);

    const { status, position, ...rest } = dto;
    if (status !== undefined || position !== undefined) {
      return this.move(userId, id, { status, position, ...rest });
    }

    return this.prisma.task.update({
      where: { id: task.id },
      data: rest,
    });
  }

  async move(
    userId: string,
    id: string,
    dto: {
      status?: TaskStatus;
      position?: number;
      title?: string;
      description?: string;
    },
  ) {
    const currentTask = await this.getTaskForUser(userId, id);
    const targetStatus = dto.status ?? currentTask.status;
    const targetPosition =
      dto.position !== undefined && dto.position >= 0
        ? Math.trunc(dto.position)
        : undefined;

    return this.prisma.$transaction(async (tx) => {
      const targetTasks = await tx.task.findMany({
        where: {
          projectId: currentTask.projectId,
          status: targetStatus,
          NOT: { id: currentTask.id },
        },
        orderBy: { position: 'asc' },
      });

      const order = targetTasks.map((task) => task.id);
      const insertIndex =
        targetPosition !== undefined
          ? Math.min(Math.max(targetPosition, 0), order.length)
          : order.length;
      order.splice(insertIndex, 0, currentTask.id);

      await tx.task.update({
        where: { id: currentTask.id },
        data: {
          status: targetStatus,
          title: dto.title ?? currentTask.title,
          description: dto.description ?? currentTask.description,
        },
      });

      await this.reindexColumn(tx, currentTask.projectId, targetStatus, order);

      if (targetStatus !== currentTask.status) {
        await this.reindexColumn(tx, currentTask.projectId, currentTask.status);
      }

      return tx.task.findUnique({ where: { id: currentTask.id } });
    });
  }

  async remove(userId: string, id: string) {
    const task = await this.getTaskForUser(userId, id);
    await this.prisma.$transaction(async (tx) => {
      await tx.task.delete({ where: { id: task.id } });
      await this.reindexColumn(tx, task.projectId, task.status);
    });
  }

  private async getTaskForUser(userId: string, id: string) {
    const task = await this.prisma.task.findFirst({
      where: {
        id,
        project: {
          ownerId: userId,
        },
      },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  private async ensureProjectAccess(userId: string, projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  private async reindexColumn(
    tx: Prisma.TransactionClient,
    projectId: string,
    status: TaskStatus,
    enforcedOrder?: string[],
  ) {
    if (enforcedOrder) {
      await Promise.all(
        enforcedOrder.map((taskId, index) =>
          tx.task.update({
            where: { id: taskId },
            data: { position: index },
          }),
        ),
      );
      return;
    }

    const tasks = await tx.task.findMany({
      where: { projectId, status },
      orderBy: { position: 'asc' },
    });

    await Promise.all(
      tasks.map((task, index) =>
        tx.task.update({
          where: { id: task.id },
          data: { position: index },
        }),
      ),
    );
  }
}
