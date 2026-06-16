import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { FatecScraperService } from '../importer/fatec-scraper.service';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn', 'log'] });
  const importer = app.get(FatecScraperService);
  const result = await importer.importAll();
  console.log(JSON.stringify(result, null, 2));
  await app.close();
}

void run();
