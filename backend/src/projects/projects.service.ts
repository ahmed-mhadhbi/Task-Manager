import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        ...dto,
        ownerId: userId,
      },
    });
  }

  findAll(userId: string) {
    return this.prisma.project.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: [{ status: 'asc' }, { position: 'asc' }],
        },
      },
    });

    if (!project || project.ownerId !== userId) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async update(userId: string, id: string, dto: UpdateProjectDto) {
    const project = await this.ensureOwnership(userId, id);
    return this.prisma.project.update({
      where: { id: project.id },
      data: dto,
    });
  }

  async remove(userId: string, id: string) {
    const project = await this.ensureOwnership(userId, id);
    await this.prisma.project.delete({ where: { id: project.id } });
  }

  private async ensureOwnership(userId: string, id: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (project.ownerId !== userId) {
      throw new ForbiddenException();
    }
    return project;
  }
}
