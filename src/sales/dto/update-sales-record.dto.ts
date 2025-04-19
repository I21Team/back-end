import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSalesRecordDto {
  @ApiProperty({ example: 24 })
  @IsInt()
  @IsOptional()
  week?: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @IsOptional()
  store_id?: number;

  @ApiProperty({ example: 102 })
  @IsInt()
  @IsOptional()
  sku_id?: number;

  @ApiProperty({ example: 599.99 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  total_price?: number;

  @ApiProperty({ example: 499.99 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  base_price?: number;

  @ApiProperty({ example: 6 })
  @IsInt()
  @Min(1)
  @IsOptional()
  units_sold?: number;
}