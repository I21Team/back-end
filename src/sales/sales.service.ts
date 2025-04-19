import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateSalesRecordDto } from './dto/create-sales-record.dto';
import { UpdateSalesRecordDto } from './dto/update-sales-record.dto';
import { PaginationParams, SalesRecord } from '../common/interfaces';

@Injectable()
export class SalesService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll(params?: PaginationParams): Promise<{ data: SalesRecord[], total: number }> {
    const { page = 1, limit = 10, sortBy = 'record_ID', sortOrder = 'asc' } = params || {};
    const supabase = this.supabaseService.getClient();
    
    // Count total
    const { count, error: countError } = await supabase
      .from('sales_record')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      throw new Error(`Error counting sales records: ${countError.message}`);
    }

    // Get paginated data
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    const { data, error } = await supabase
      .from('sales_record')
      .select('*')
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to);

    if (error) {
      throw new Error(`Error fetching sales records: ${error.message}`);
    }

    return { data, total: count ?? 0 };
  }

  async findOne(id: number): Promise<SalesRecord> {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('sales_record')
      .select('*')
      .eq('record_ID', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Sales record with ID ${id} not found`);
    }

    return data;
  }

  async create(createSalesRecordDto: CreateSalesRecordDto): Promise<SalesRecord> {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('sales_record')
      .insert([createSalesRecordDto])
      .select()
      .single();
      await supabase
      .from('sales_record')
     
    
    if (error) {
      throw new Error(`Error creating sales record: ${error.message}`);
    }

    return data;
  }


  async update(id: number, updateSalesRecordDto: UpdateSalesRecordDto): Promise<SalesRecord> {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('sales_record')
      .update(updateSalesRecordDto)
      .eq('record_ID', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating sales record: ${error.message}`);
    }

    return data;
  }

  async remove(id: number): Promise<void> {
    const supabase = this.supabaseService.getClient();
    
    const { error } = await supabase
      .from('sales_record')
      .delete()
      .eq('record_ID', id);

    if (error) {
      throw new Error(`Error deleting sales record: ${error.message}`);
    }
  }

  async findByStoreId(storeId: number): Promise<SalesRecord[]> {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('sales_record')
      .select('*')
      .eq('store_id', storeId);

    if (error) {
      throw new Error(`Error fetching sales by store: ${error.message}`);
    }

    return data;
  }

  async findByProductId(skuId: number): Promise<SalesRecord[]> {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('sales_record')
      .select('*')
      .eq('sku_id', skuId);

    if (error) {
      throw new Error(`Error fetching sales by product: ${error.message}`);
    }

    return data;
  }

  async findByWeek(week: string): Promise<SalesRecord[]> {
    const supabase = this.supabaseService.getClient();
  
    const { data, error } = await supabase
      .from('sales_record')
      .select('*')
      .eq('week', week); // Exact match with a full date string
  
    if (error) {
      throw new Error(`Error fetching sales by week: ${error.message}`);
    }
  
    return data;
  }
  
}