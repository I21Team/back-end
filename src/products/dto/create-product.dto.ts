import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Premium Headphones' })
  @IsString()
  @IsNotEmpty()
  product_name: string;

  @ApiProperty({ example: 99.99 })
  @IsNumber()
  @IsNotEmpty()
  base_price: number;

 
}