import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { generateUsername, generatePassword } from '../common/utils/credentials.util';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateRemarksDto } from './dto/update-remarks.dto';
import { AddDocumentDto } from './dto/add-document.dto';
import { encryptPassword, decryptPassword } from '../common/utils/credentials-encryption.util';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async createCustomer(dto: CreateCustomerDto) {
    let username = generateUsername(dto.fullName);
    let attempts = 0;
    while (await this.prisma.user.findUnique({ where: { username } })) {
      username = generateUsername(dto.fullName);
      attempts++;
      if (attempts > 5) throw new Error('Could not generate a unique username, try again');
    }

    const plainPassword = generatePassword();
    const passwordHash = await bcrypt.hash(plainPassword, 10);
    const passwordEncrypted = encryptPassword(plainPassword);

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { username, passwordHash, passwordEncrypted, role: 'customer' },
      });

      const customer = await tx.customer.create({
        data: {
          userId: user.id,
          fullName: dto.fullName,
          phoneNumber: dto.phoneNumber,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
          firmName: dto.firmName,
          loanAmount: dto.loanAmount,
          bankName: dto.bankName,
          caseHandlingExecutive: dto.caseHandlingExecutive,
          hod: dto.hod,
          customerDeadline: dto.customerDeadline ? new Date(dto.customerDeadline) : undefined,
          internalDeadline: dto.internalDeadline ? new Date(dto.internalDeadline) : undefined,
          currentStatusId: 1,
        },
      });

      return customer;
    });

    return {
      customer: result,
      credentials: { username, password: plainPassword },
    };
  }

  async findAll(params: { search?: string; statusId?: number; page?: number; limit?: number }) {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.search) {
      where.OR = [
        { fullName: { contains: params.search, mode: 'insensitive' } },
        { firmName: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    if (params.statusId) {
      where.currentStatusId = params.statusId;
    }

    const [customers, total] = await this.prisma.$transaction([
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          currentStatus: true,
        },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      data: customers,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        currentStatus: true,
        pendingDocuments: true,
        user: { select: { username: true, isActive: true, lastLoginAt: true } },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async updateProfile(id: string, dto: UpdateCustomerDto) {
    const existing = await this.prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Customer not found');
    }

    return this.prisma.customer.update({
      where: { id },
      data: {
        fullName: dto.fullName,
        phoneNumber: dto.phoneNumber,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        firmName: dto.firmName,
        loanAmount: dto.loanAmount,
        bankName: dto.bankName,
        caseHandlingExecutive: dto.caseHandlingExecutive,
        hod: dto.hod,
        customerDeadline: dto.customerDeadline ? new Date(dto.customerDeadline) : undefined,
        internalDeadline: dto.internalDeadline ? new Date(dto.internalDeadline) : undefined,
      },
      include: {
        currentStatus: true,
      },
    });
  }

  async updateStatus(id: string, dto: UpdateStatusDto, changedByUserId: string) {
    const existing = await this.prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Customer not found');
    }

    const status = await this.prisma.applicationStatus.findUnique({ where: { id: dto.statusId } });
    if (!status) {
      throw new NotFoundException('Status not found');
    }

    const [updatedCustomer] = await this.prisma.$transaction([
      this.prisma.customer.update({
        where: { id },
        data: { currentStatusId: dto.statusId },
        include: { currentStatus: true },
      }),
      this.prisma.statusHistory.create({
        data: {
          customerId: id,
          statusId: dto.statusId,
          changedById: changedByUserId,
          note: dto.note,
        },
      }),
    ]);

    return updatedCustomer;
  }

  async updateAdminRemarks(id: string, dto: UpdateRemarksDto) {
    const existing = await this.prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Customer not found');
    }

    return this.prisma.customer.update({
      where: { id },
      data: { adminRemarks: dto.remarks },
    });
  }

  async addPendingDocument(customerId: string, dto: AddDocumentDto) {
    const existing = await this.prisma.customer.findUnique({ where: { id: customerId } });
    if (!existing) {
      throw new NotFoundException('Customer not found');
    }

    return this.prisma.pendingDocument.create({
      data: {
        customerId,
        documentName: dto.documentName,
      },
    });
  }

  async markDocumentReceived(customerId: string, docId: string) {
    const doc = await this.prisma.pendingDocument.findUnique({ where: { id: docId } });
    if (!doc || doc.customerId !== customerId) {
      throw new NotFoundException('Document not found for this customer');
    }

    return this.prisma.pendingDocument.update({
      where: { id: docId },
      data: { status: 'received', receivedAt: new Date() },
    });
  }

  async markDocumentUnreceived(customerId: string, docId: string) {
    const doc = await this.prisma.pendingDocument.findUnique({ where: { id: docId } });
    if (!doc || doc.customerId !== customerId) {
      throw new NotFoundException('Document not found for this customer');
    }

    return this.prisma.pendingDocument.update({
      where: { id: docId },
      data: { status: 'pending', receivedAt: null },
    });
  }

  async deleteDocument(customerId: string, docId: string) {
    const doc = await this.prisma.pendingDocument.findUnique({ where: { id: docId } });
    if (!doc || doc.customerId !== customerId) {
      throw new NotFoundException('Document not found for this customer');
    }

    await this.prisma.pendingDocument.delete({ where: { id: docId } });
    return { success: true };
  }

  async getCredentials(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return {
      fullName: customer.fullName,
      username: customer.user.username,
      password: customer.user.passwordEncrypted ? decryptPassword(customer.user.passwordEncrypted) : null,
      isActive: customer.user.isActive,
    };
  }

  async resetPassword(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const plainPassword = generatePassword();
    const passwordHash = await bcrypt.hash(plainPassword, 10);
    const passwordEncrypted = encryptPassword(plainPassword);

    await this.prisma.user.update({
      where: { id: customer.userId },
      data: { passwordHash, passwordEncrypted },
    });

    return {
      fullName: customer.fullName,
      username: customer.user.username,
      password: plainPassword,
    };
  }
}