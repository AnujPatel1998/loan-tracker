import { IsString, IsNotEmpty } from 'class-validator';

export class AddDocumentDto {
  @IsString()
  @IsNotEmpty()
  documentName!: string;
}