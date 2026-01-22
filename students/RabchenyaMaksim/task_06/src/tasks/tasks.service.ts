import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto, userId: number) {
    return this.prisma.task.create({
      data: { ...createTaskDto, ownerId: userId },
    });
  }

  async findAll(userId: number) {
    return this.prisma.task.findMany({ where: { ownerId: userId } });
  }

  async findOne(id: number, userId: number) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    if (task.ownerId !== userId) throw new ForbiddenException('Access denied');
    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, userId: number) {
    const task = await this.findOne(id, userId);  // Проверяет владение
    return this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
    });
  }

  async remove(id: number, userId: number) {
    const task = await this.findOne(id, userId);  // Проверяет владение
    return this.prisma.task.delete({ where: { id } });
  }
}