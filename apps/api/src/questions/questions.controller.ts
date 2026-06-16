import { Controller, Get, Param, Query } from '@nestjs/common';
import { QuestionsService } from './questions.service';

@Controller()
export class QuestionsController {
  constructor(private readonly questions: QuestionsService) {}

  @Get('categories')
  categories() {
    return this.questions.categories();
  }

  @Get('exams')
  exams() {
    return this.questions.exams();
  }

  @Get('questions/next')
  next(@Query('category') category?: string, @Query('examId') examId?: string) {
    return this.questions.next({ category, examId });
  }

  @Get('questions/:id')
  get(@Param('id') id: string) {
    return this.questions.get(id);
  }
}
