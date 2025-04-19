import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { SalesModule } from '../sales/sales.module';
import { ProductsModule } from '../products/products.module';
import { StoresModule } from '../stores/stores.module';
import { SupabaseModule } from 'src/supabase/supabase.module';


@Module({
  imports: [SalesModule, ProductsModule, StoresModule,SupabaseModule],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}