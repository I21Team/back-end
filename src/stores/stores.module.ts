import { Module } from '@nestjs/common';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';
import { SupabaseModule } from 'src/supabase/supabase.module';

@Module({
  providers: [StoresService],
  controllers: [StoresController],
  exports: [StoresService],
  imports: [SupabaseModule],
})
export class StoresModule {}