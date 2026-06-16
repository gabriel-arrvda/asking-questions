import { Module } from '@nestjs/common';
import { ExplanationsModule } from '../explanations/explanations.module';
import { ImporterModule } from '../importer/importer.module';
import { AdminController } from './admin.controller';

@Module({
  imports: [ImporterModule, ExplanationsModule],
  controllers: [AdminController],
})
export class AdminModule {}
