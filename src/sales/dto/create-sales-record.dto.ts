import { IsInt, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSalesRecordDto {
  @ApiProperty({ example: 23 })
  @IsString()
  @IsNotEmpty()
  week: String;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  store_id: number;

  @ApiProperty({ example: 101 })
  @IsInt()
  @IsNotEmpty()
  sku_id: number;

  @ApiProperty({ example: 499.99 })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  total_price: number;

  // @ApiProperty({ example: 399.99 })
  // @IsNumber()
  // @Min(0)
  // @IsNotEmpty()
  // base_price: number;

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  units_sold: number;
}