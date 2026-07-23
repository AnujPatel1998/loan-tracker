import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.staffProfile.findMany({
      orderBy: { fullName: 'asc' },
    });
  }

  async create(data: { fullName: string; designation?: string; phoneNumber?: string; email?: string }) {
    return this.prisma.staffProfile.create({ data });
  }
}