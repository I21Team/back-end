import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStoreDto {
  @ApiProperty({ example: 'Downtown Store' })
  @IsString()
  @IsNotEmpty()
  store_name: string;

  @ApiProperty({ example: 'New York, NY' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsOptional()
  user_id?: number;
}