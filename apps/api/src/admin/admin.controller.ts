import { Controller, ForbiddenException, Headers, Param, Post } from '@nestjs/common';
import { ExplanationsService } from '../explanations/explanations.service';
import { FatecScraperService } from '../importer/fatec-scraper.service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly importer: FatecScraperService,
    private readonly explanations: ExplanationsService,
  ) {}

  @Post('import/fatec')
  importFatec(@Headers('x-admin-token') token?: string) {
    this.assertAdmin(token);
    return this.importer.importAll();
  }

  @Post('questions/:id/explanation')
  regenerate(@Param('id') id: string, @Headers('x-admin-token') token?: string) {
    this.assertAdmin(token);
    return this.explanations.regenerate(id);
  }

  private assertAdmin(token?: string) {
    const expected = process.env.ADMIN_TOKEN;
    if (expected && token !== expected) {
      throw new ForbiddenException('Invalid admin token');
    }
  }
}
