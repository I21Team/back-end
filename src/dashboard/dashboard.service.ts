import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { LocationData, ProductDistribution, SalesPrediction, TopItemData } from '../common/interfaces';

@Injectable()
export class DashboardService {
  constructor(private supabaseService: SupabaseService) {}

  async getTotalSales(days: number = 7): Promise<{amount: number; change: number}> {
    const supabase = this.supabaseService.getClient();
    
    // First, get the most recent date from the database
    const { data: latestData, error: latestError } = await supabase
      .from('sales_record')
      .select('week')
      .order('week', { ascending: false })
      .limit(1);
      
    if (latestError || !latestData || latestData.length === 0) {
      throw new Error(`Error fetching latest date: ${latestError?.message || 'No data found'}`);
    }
    
    // Use the latest date as our reference point
    const latestDate = new Date(latestData[0].week);
    const endDate = new Date(latestDate);
    const startDate = new Date(latestDate);
    startDate.setDate(endDate.getDate() - days);
    
    // Format dates for database queries
    const endDateStr = endDate.toISOString().split('T')[0];
    const startDateStr = startDate.toISOString().split('T')[0];
    
    console.log(`Using reference date: ${latestDate.toISOString().split('T')[0]}`);
    console.log(`Fetching sales from ${startDateStr} to ${endDateStr}`);
    
    // Query for current period
    const { data, error } = await supabase
      .from('sales_record')
      .select('total_price')
      .gte('week', startDateStr)
      .lte('week', endDateStr);
      
    if (error) {
      throw new Error(`Error fetching total sales: ${error.message}`);
    }
    
    const totalSales = data.reduce((sum, record) => sum + record.total_price, 0);
    
    // Get previous period for comparison
    const prevEndDate = new Date(startDate);
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevEndDate.getDate() - days);
    
    const prevStartDateStr = prevStartDate.toISOString().split('T')[0];
    
    const { data: prevData, error: prevError } = await supabase
      .from('sales_record')
      .select('total_price')
      .gte('week', prevStartDateStr)
      .lt('week', startDateStr);
          
    if (prevError) {
      throw new Error(`Error fetching previous period sales: ${prevError.message}`);
    }
        
    const prevSales = prevData.reduce((sum, record) => sum + record.total_price, 0);
        
    // Calculate change percentage
    const change = prevSales ? ((totalSales - prevSales) / prevSales) * 100 : 0;
        
    return {
      amount: totalSales,
      change: parseFloat(change.toFixed(1))
    };
  }

  async getTopStores(limit: number = 5): Promise<TopItemData[]> {
    const supabase = this.supabaseService.getClient();
    
    // Add debug logging
    console.log(`Fetching top stores with limit ${limit} and weeks_ago 4`);
    
    // Get current top stores
    const rawResponse = await supabase.rpc('get_top_stores', { 
      limit_num: limit,
      weeks_ago: 4
    });
    
    // Log the raw response to see what we're getting
    console.log('Raw response:', JSON.stringify(rawResponse, null, 2));
    
    if (rawResponse.error) {
      throw new Error(`Error fetching top stores: ${rawResponse.error.message}`);
    }
    
    // Format the response
    return rawResponse.data.map(item => ({
      id: item.store_id,
      name: item.store_name,
      value: parseFloat(item.total_sales || '0'),
      change: parseFloat(item.change_percentage || '0')
    }));
  }

  async getTopProducts(limit: number = 5): Promise<TopItemData[]> {
    const supabase = this.supabaseService.getClient();
    
    // Get current top products
    const { data, error } = await supabase.rpc('get_top_products', { 
      limit_num: limit,
      weeks_ago: 4
    });
    
    if (error) {
      throw new Error(`Error fetching top products: ${error.message}`);
    }
    
    // Format the response
    return data.map(item => ({
      id: item.sku_id,
      name: item.product_name,
      value: parseFloat(item.total_sales),
      change: parseFloat(item.change_percentage)
    }));
  }

  async getStorePerformance(): Promise<{percentage: number; change: number}> {
    const supabase = this.supabaseService.getClient();
    
    // Calculate store performance
    const { data, error } = await supabase.rpc('get_store_performance');
    
    if (error) {
      throw new Error(`Error fetching store performance: ${error.message}`);
    }
    
    return {
      percentage: parseFloat(data[0].performance_percentage),
      change: parseFloat(data[0].change)
    };
  }

  async getSalesDistribution(): Promise<LocationData[]> {
    const supabase = this.supabaseService.getClient();
    
    // Get sales distribution by location
    const { data, error } = await supabase.rpc('get_sales_distribution');
    
    if (error) {
      throw new Error(`Error fetching sales distribution: ${error.message}`);
    }
    
    return data.map(item => ({
      lat: item.lat,
      lng: item.lng,
      value: parseFloat(item.total_sales),
      name: item.store_name
    }));
  }

  async getSalesPredictions(
    productId?: number,
    storeId?: number,
    weeks: number = 4
  ): Promise<SalesPrediction[]> {
    const supabase = this.supabaseService.getClient();
    
    // Get sales predictions
    const { data, error } = await supabase.rpc('get_sales_predictions', {
      product_id: productId || null,
      store_id: storeId || null,
      prediction_weeks: weeks
    });
    
    if (error) {
      throw new Error(`Error fetching sales predictions: ${error.message}`);
    }
    
    return data.map(item => ({
      date: item.week_date,
      predicted: parseFloat(item.predicted_sales),
      actual: item.actual_sales ? parseFloat(item.actual_sales) : undefined
    }));
  }

  async getProductDistribution(): Promise<ProductDistribution[]> {
    const supabase = this.supabaseService.getClient();
    
    // Get product sales distribution
    const { data, error } = await supabase.rpc('get_product_distribution');
    
    if (error) {
      throw new Error(`Error fetching product distribution: ${error.message}`);
    }
    
    return data.map(item => ({
      product_name: item.product_name,
      percentage: parseFloat(item.percentage)
    }));
  }

  async getTrendingMetrics(): Promise<{trending: number; period: string}> {
    const supabase = this.supabaseService.getClient();
    
    // Get trending metrics
    const { data, error } = await supabase.rpc('get_trending_metrics');
    
    if (error) {
      throw new Error(`Error fetching trending metrics: ${error.message}`);
    }
    
    return {
      trending: parseFloat(data[0].trending_percentage),
      period: data[0].period
    };
  }

  // Helper methods
  private getCurrentWeek(): number {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDays = (now.getTime() - startOfYear.getTime()) / 86400000;
    return Math.ceil((pastDays + startOfYear.getDay() + 1) / 7);
  }
}