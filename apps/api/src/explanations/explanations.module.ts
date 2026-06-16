import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { ExplanationsService } from './explanations.service';

@Module({
  imports: [AiModule],
  providers: [ExplanationsService],
  exports: [ExplanationsService],
})
export class ExplanationsModule {}
