import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { PaginationParams, Store } from '../common/interfaces';

@Injectable()
export class StoresService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll(params?: PaginationParams): Promise<{ data: Store[], total: number }> {
    const { page = 1, limit = 10, sortBy = 'store_id', sortOrder = 'asc' } = params || {};
    const supabase = this.supabaseService.getClient();
    
    // Count total
    const { count, error: countError } = await supabase
      .from('store')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      throw new Error(`Error counting stores: ${countError.message}`);
    }

    // Get paginated data
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    const { data, error } = await supabase
      .from('store')
      .select('*')
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to);

    if (error) {
      throw new Error(`Error fetching stores: ${error.message}`);
    }

    return { data, total: count ?? 0 };
  }

  async findOne(id: number): Promise<Store> {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('store')
      .select('*')
      .eq('store_id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }

    return data;
  }

  async create(createStoreDto: CreateStoreDto): Promise<Store> {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('store')
      .insert([createStoreDto])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating store: ${error.message}`);
    }

    return data;
  }

  async update(id: number, updateStoreDto: UpdateStoreDto): Promise<Store> {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('store')
      .update(updateStoreDto)
      .eq('store_id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating store: ${error.message}`);
    }

    return data;
  }

  async remove(id: number): Promise<void> {
    const supabase = this.supabaseService.getClient();
    
    const { error } = await supabase
      .from('store')
      .delete()
      .eq('store_id', id);

    if (error) {
      throw new Error(`Error deleting store: ${error.message}`);
    }
  }

  async findByManager(userId: number): Promise<Store[]> {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('store')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Error fetching stores by manager: ${error.message}`);
    }

    return data;
  }
}