import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStoreDto {
  @ApiProperty({ example: 'Downtown Store Updated' })
  @IsString()
  @IsOptional()
  store_name?: string;

  @ApiProperty({ example: 'Boston, MA' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @IsOptional()
  user_id?: number;
}