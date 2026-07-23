import { IsString } from 'class-validator';

export class UpdateCustomerRemarksDto {
  @IsString()
  remarks!: string;
}