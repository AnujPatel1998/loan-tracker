import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateStatusDto {
  @IsInt()
  statusId!: number;

  @IsOptional()
  @IsString()
  note?: string;
}