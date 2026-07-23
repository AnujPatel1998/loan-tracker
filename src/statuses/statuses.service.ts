import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatusesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.applicationStatus.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }
}