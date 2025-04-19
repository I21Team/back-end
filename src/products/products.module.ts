import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { SupabaseModule } from 'src/supabase/supabase.module';

@Module({
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService],
  imports: [SupabaseModule],
})
export class ProductsModule {}