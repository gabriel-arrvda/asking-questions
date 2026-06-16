import { Controller, Query, Sse } from '@nestjs/common';
import { ExplanationEventsService } from './explanation-events.service';

@Controller('explanations')
export class ExplanationsController {
  constructor(private readonly events: ExplanationEventsService) {}

  @Sse('stream')
  stream(@Query('attemptId') attemptId: string) {
    return this.events.stream(attemptId);
  }
}
