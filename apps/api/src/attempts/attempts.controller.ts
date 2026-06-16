import { Body, Controller, Post } from '@nestjs/common';
import { AttemptsService } from './attempts.service';

@Controller('attempts')
export class AttemptsController {
  constructor(private readonly attempts: AttemptsService) {}

  @Post()
  create(@Body() body: { questionId: string; answerMode: 'ALTERNATIVE' | 'WRITTEN'; selectedAlternative?: string; writtenAnswer?: string }) {
    return this.attempts.create(body);
  }
}
