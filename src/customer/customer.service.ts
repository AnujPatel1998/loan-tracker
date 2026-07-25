import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCustomerRemarksDto } from './dto/update-customer-remarks.dto';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  async getMyProfile(userId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { userId },
      include: {
        currentStatus: true,
        pendingDocuments: {
          orderBy: { requestedAt: 'desc' },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer profile not found');
    }

    return {
      fullName: customer.fullName,
      phoneNumber: customer.phoneNumber,
      dateOfBirth: customer.dateOfBirth,
      firmName: customer.firmName,
      loanAmount: customer.loanAmount,
      bankName: customer.bankName,
      caseHandlingExecutive: customer.caseHandlingExecutive,
      hod: customer.hod,
      currentStatus: customer.currentStatus.name,
      pendingDocuments: customer.pendingDocuments.map((doc) => ({
        documentName: doc.documentName,
        status: doc.status,
      })),
      customerDeadline: customer.customerDeadline,
      adminRemarks: customer.adminRemarks,
      customerRemarks: customer.customerRemarks,
    };
  }

  async updateMyRemarks(userId: string, dto: UpdateCustomerRemarksDto) {
    const customer = await this.prisma.customer.findUnique({ where: { userId } });
    if (!customer) {
      throw new NotFoundException('Customer profile not found');
    }

    await this.prisma.customer.update({
      where: { userId },
      data: { customerRemarks: dto.remarks },
    });

    return { success: true, customerRemarks: dto.remarks };
  }
}