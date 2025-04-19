import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('total-sales')
  @ApiOperation({ summary: 'Get total sales for dashboard' })
  @ApiResponse({ status: 200, description: 'Return total sales with change percentage' })
  getTotalSales(@Query('days') days?: number) {
    return this.dashboardService.getTotalSales(days);
  }

  @Get('top-stores')
  @ApiOperation({ summary: 'Get top performing stores' })
  @ApiResponse({ status: 200, description: 'Return top stores with sales data' })
  getTopStores(@Query('limit') limit?: number) {
    return this.dashboardService.getTopStores(limit);
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Get top selling products' })
  @ApiResponse({ status: 200, description: 'Return top products with sales data' })
  getTopProducts(@Query('limit') limit?: number) {
    return this.dashboardService.getTopProducts(limit);
  }

  @Get('store-performance')
  @ApiOperation({ summary: 'Get overall store performance metrics' })
  @ApiResponse({ status: 200, description: 'Return store performance percentage' })
  getStorePerformance() {
    return this.dashboardService.getStorePerformance();
  }

  @Get('sales-distribution')
  @ApiOperation({ summary: 'Get sales distribution by location' })
  @ApiResponse({ status: 200, description: 'Return sales data with geo coordinates' })
  getSalesDistribution() {
    return this.dashboardService.getSalesDistribution();
  }

  @Get('sales-predictions')
  @ApiOperation({ summary: 'Get sales predictions' })
  @ApiResponse({ status: 200, description: 'Return sales predictions for upcoming periods' })
  getSalesPredictions(
    @Query('productId') productId?: number,
    @Query('storeId') storeId?: number,
    @Query('weeks') weeks?: number,
  ) {
    return this.dashboardService.getSalesPredictions(productId, storeId, weeks);
  }

  @Get('product-distribution')
  @ApiOperation({ summary: 'Get product sales distribution' })
  @ApiResponse({ status: 200, description: 'Return product distribution percentages' })
  getProductDistribution() {
    return this.dashboardService.getProductDistribution();
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending metrics' })
  @ApiResponse({ status: 200, description: 'Return trending percentage and period' })
  getTrendingMetrics() {
    return this.dashboardService.getTrendingMetrics();
  }
}