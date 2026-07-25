import { Body, Controller, Get, Post, Put, Patch, Delete, Param, Query, UseGuards, Req } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateRemarksDto } from './dto/update-remarks.dto';
import { AddDocumentDto } from './dto/add-document.dto';

@Controller('api/admin/customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Post()
  async create(@Body() dto: CreateCustomerDto) {
    return this.customersService.createCustomer(dto);
  }

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('statusId') statusId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.customersService.findAll({
      search,
      statusId: statusId ? parseInt(statusId, 10) : undefined,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customersService.updateProfile(id, dto);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto, @Req() req) {
    return this.customersService.updateStatus(id, dto, req.user.userId);
  }

  @Put(':id/remarks')
  async updateAdminRemarks(@Param('id') id: string, @Body() dto: UpdateRemarksDto) {
    return this.customersService.updateAdminRemarks(id, dto);
  }

  @Post(':id/documents')
  async addDocument(@Param('id') id: string, @Body() dto: AddDocumentDto) {
    return this.customersService.addPendingDocument(id, dto);
  }

  @Patch(':id/documents/:docId')
  async markDocumentReceived(@Param('id') id: string, @Param('docId') docId: string) {
    return this.customersService.markDocumentReceived(id, docId);
  }

  @Patch(':id/documents/:docId/unreceive')
  async markDocumentUnreceived(@Param('id') id: string, @Param('docId') docId: string) {
    return this.customersService.markDocumentUnreceived(id, docId);
  }

  @Delete(':id/documents/:docId')
  async deleteDocument(@Param('id') id: string, @Param('docId') docId: string) {
    return this.customersService.deleteDocument(id, docId);
  }

  @Get(':id/credentials')
  async getCredentials(@Param('id') id: string) {
    return this.customersService.getCredentials(id);
  }

  @Post(':id/reset-password')
  async resetPassword(@Param('id') id: string) {
    return this.customersService.resetPassword(id);
  }
}