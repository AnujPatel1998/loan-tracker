import { IsString, IsNotEmpty, IsOptional, IsNumber, IsUUID, IsDateString } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber!: string;

  @IsOptional()
  @IsString()
  firmName?: string;

  @IsOptional()
  @IsNumber()
  loanAmount?: number;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsUUID()
  caseHandlingExecutiveId?: string;

  @IsOptional()
  @IsUUID()
  hodId?: string;

  @IsOptional()
  @IsDateString()
  customerDeadline?: string;

  @IsOptional()
  @IsDateString()
  internalDeadline?: string;
}