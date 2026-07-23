import { Controller, Get, Put, UseGuards, Req, Body } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateCustomerRemarksDto } from './dto/update-customer-remarks.dto';

@Controller('api/customer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('customer')
export class CustomerController {
  constructor(private customerService: CustomerService) {}

  @Get('me')
  async getMe(@Req() req) {
    return this.customerService.getMyProfile(req.user.userId);
  }

  @Put('me/remarks')
  async updateMyRemarks(@Req() req, @Body() dto: UpdateCustomerRemarksDto) {
    return this.customerService.updateMyRemarks(req.user.userId, dto);
  }
}