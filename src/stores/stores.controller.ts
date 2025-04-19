import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { JwtAuthGuard  } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/interfaces';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { Role } from 'src/auth/role.enum';

@ApiTags('stores')
@Controller('stores')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get()
  @ApiOperation({ summary: 'Get all stores with pagination' })
  @ApiResponse({ status: 200, description: 'Return all stores' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.storesService.findAll(paginationDto);
  }

  

  @Get(':id')
  @ApiOperation({ summary: 'Get store by ID' })
  @ApiResponse({ status: 200, description: 'Return a store' })
  @ApiResponse({ status: 404, description: 'Store not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.storesService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new store' })
  @ApiResponse({ status: 201, description: 'Store created' })
  create(@Body() createStoreDto: CreateStoreDto) {
    return this.storesService.create(createStoreDto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.SALEMANAGER, Role.ADMIN)
  @ApiOperation({ summary: 'Update a store' })
  @ApiResponse({ status: 200, description: 'Store updated' })
  @ApiResponse({ status: 404, description: 'Store not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStoreDto: UpdateStoreDto,
    @Request() req,
  ) {
    
    if (req.user.role === UserRole.MANAGER) {
    }
    return this.storesService.update(id, updateStoreDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.SALEMANAGER)
  @ApiOperation({ summary: 'Delete a store' })
  @ApiResponse({ status: 200, description: 'Store deleted' })
  @ApiResponse({ status: 404, description: 'Store not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.storesService.remove(id);
  }
}