import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiProperty({ example: 'Premium Headphones v2' })
  @IsString()
  @IsOptional()
  product_name?: string;

  @ApiProperty({ example: 109.99 })
  @IsNumber()
  @IsOptional()
  base_price?: number;
}