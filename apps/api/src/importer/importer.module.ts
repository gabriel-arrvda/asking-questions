import { Module } from '@nestjs/common';
import { FatecScraperService } from './fatec-scraper.service';

@Module({
  providers: [FatecScraperService],
  exports: [FatecScraperService],
})
export class ImporterModule {}
