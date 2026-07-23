import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { StaffService } from './staff.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/admin/staff')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class StaffController {
  constructor(private staffService: StaffService) {}

  @Get()
  async findAll() {
    return this.staffService.findAll();
  }

  @Post()
  async create(@Body() body: { fullName: string; designation?: string; phoneNumber?: string; email?: string }) {
    return this.staffService.create(body);
  }
}