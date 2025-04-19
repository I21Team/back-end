// Database table interfaces that match the Supabase schema

export interface User {
    id: number;
    name: string;
    email: string;
    password: string;  // Hashed password
    role: UserRole;
  }
  
  export enum UserRole {
    ADMIN = 'admin',
    MANAGER = 'manager',
    USER = 'user'
  }
  
  export interface Product {
    sku_id: number;
    product_name: string;
    base_price: number;
  }
  
  export interface Store {
    store_id: number;
    store_name: string;
    location: string;
    user_id: number;
  }
  
  export interface Inventory {
    inventory_id: number;
    store_id: number;
    sku_id: number;
    quantity_in_stock: number;
  }
  
  export interface SalesRecord {
    record_id: number;
    week: number;
    store_id: number;
    sku_id: number;
    total_price: number;
    base_price: number;
    units_sold: number;
    is_featured_sku: boolean;
    is_display_sku: boolean;
  }
  
  export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
  
  export interface LocationData {
    lat: number;
    lng: number;
    value: number;
    name: string;
  }
  
  export interface TopItemData {
    id: number;
    name: string;
    value: number;
    change: number;
  }
  
  export interface SalesPrediction {
    date: string;
    predicted: number;
    actual?: number;
  }
  
  export interface ProductDistribution {
    product_name: string;
    percentage: number;
  }