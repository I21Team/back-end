import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSalesRecordDto } from './dto/create-sales-record.dto';
import { UpdateSalesRecordDto } from './dto/update-sales-record.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/interfaces';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { Role } from 'src/auth/role.enum';

@ApiTags('sales')
@Controller('sales')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all sales records with pagination' })
  @ApiResponse({ status: 200, description: 'Return all sales records' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.salesService.findAll(paginationDto);
  }

  @Get('store/:storeId')
  @ApiOperation({ summary: 'Get sales records by store ID' })
  @ApiResponse({ status: 200, description: 'Return sales records for a store' })
  findByStore(@Param('storeId', ParseIntPipe) storeId: number) {
    return this.salesService.findByStoreId(storeId);
  }

  @Get('product/:skuId')
  @ApiOperation({ summary: 'Get sales records by product SKU ID' })
  @ApiResponse({ status: 200, description: 'Return sales records for a product' })
  findByProduct(@Param('skuId', ParseIntPipe) skuId: number) {
    return this.salesService.findByProductId(skuId);
  }

  @Get('week/:week')
  @ApiOperation({ summary: 'Get sales records by week (date format)' })
  @ApiResponse({ status: 200, description: 'Return sales records for a week (YYYY-MM-DD)' })
  findByWeek(@Param('week') week: string) {
    return this.salesService.findByWeek(week);
  } 
  
  @Get(':id')
  @ApiOperation({ summary: 'Get sales record by ID' })
  @ApiResponse({ status: 200, description: 'Return a sales record' })
  @ApiResponse({ status: 404, description: 'Sales record not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.salesService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SALEMANAGER)
  @ApiOperation({ summary: 'Create a new sales record' })
  @ApiResponse({ status: 201, description: 'Sales record created' })
  create(@Body() createSalesRecordDto: CreateSalesRecordDto) {
    return this.salesService.create(createSalesRecordDto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SALEMANAGER)
  @ApiOperation({ summary: 'Update a sales record' })
  @ApiResponse({ status: 200, description: 'Sales record updated' })
  @ApiResponse({ status: 404, description: 'Sales record not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSalesRecordDto: UpdateSalesRecordDto,
  ) {
    return this.salesService.update(id, updateSalesRecordDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a sales record' })
  @ApiResponse({ status: 200, description: 'Sales record deleted' })
  @ApiResponse({ status: 404, description: 'Sales record not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.salesService.remove(id);
  }
}