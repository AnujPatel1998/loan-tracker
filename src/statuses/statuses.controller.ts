import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatusesService } from './statuses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/admin/statuses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class StatusesController {
  constructor(private statusesService: StatusesService) {}

  @Get()
  async findAll() {
    return this.statusesService.findAll();
  }
}