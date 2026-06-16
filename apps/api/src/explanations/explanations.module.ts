import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { ExplanationEventsService } from './explanation-events.service';
import { ExplanationsController } from './explanations.controller';
import { ExplanationsService } from './explanations.service';

@Module({
  imports: [AiModule],
  controllers: [ExplanationsController],
  providers: [ExplanationsService, ExplanationEventsService],
  exports: [ExplanationsService, ExplanationEventsService],
})
export class ExplanationsModule {}
