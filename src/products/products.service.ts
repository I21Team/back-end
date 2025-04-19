import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationParams, Product } from '../common/interfaces';

@Injectable()
export class ProductsService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll(params?: PaginationParams): Promise<{ data: Product[], total: number }> {
    const { page = 1, limit = 10, sortBy = 'sku_id', sortOrder = 'asc' } = params || {};
    const supabase = this.supabaseService.getClient();
    
    // Count total
    const { count, error: countError } = await supabase
      .from('product')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      throw new Error(`Error counting products: ${countError.message}`);
    }

    // Get paginated data
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    const { data, error } = await supabase
      .from('product')
      .select('*')
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to);

    if (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }

    return { data, total: count ?? 0 };
  }

  async findOne(id: number): Promise<Product> {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('product')
      .select('*')
      .eq('sku_id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Product with SKU ${id} not found`);
    }

    return data;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('product')
      .insert([createProductDto])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating product: ${error.message}`);
    }

    return data;
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('product')
      .update(updateProductDto)
      .eq('sku_id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating product: ${error.message}`);
    }

    return data;
  }

  async remove(id: number): Promise<void> {
    const supabase = this.supabaseService.getClient();
    
    const { error } = await supabase
      .from('product')
      .delete()
      .eq('sku_id', id);

    if (error) {
      throw new Error(`Error deleting product: ${error.message}`);
    }
  }

  async findFeaturedProducts(): Promise<Product[]> {
    const supabase = this.supabaseService.getClient();
  
    const { data, error } = await supabase
      .from('sales_record')
      .select('product(*)') 
      .eq('is_featured_sku', true);
  
    if (error) {
      throw new Error(`Error fetching featured products: ${error.message}`);
    }
  
  
    const products = data.map((record: any) => record.product);
  
    return products;
  }
  
}