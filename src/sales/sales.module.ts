import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { SupabaseModule } from 'src/supabase/supabase.module';

@Module({
  providers: [SalesService],
  controllers: [SalesController],
  exports: [SalesService],
  imports: [SupabaseModule],
})
export class SalesModule {}