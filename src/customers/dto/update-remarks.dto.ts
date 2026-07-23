import { IsString } from 'class-validator';

export class UpdateRemarksDto {
  @IsString()
  remarks!: string;
}