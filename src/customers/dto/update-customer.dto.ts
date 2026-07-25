import { IsString, IsOptional, IsNumber, IsUUID, IsDateString } from 'class-validator';

export class UpdateCustomerDto {

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

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
  @IsString()
  caseHandlingExecutive?: string;

  @IsOptional()
  @IsString()
  hod?: string;

  @IsOptional()
  @IsDateString()
  customerDeadline?: string;

  @IsOptional()
  @IsDateString()
  internalDeadline?: string;
}