import { Module } from '@nestjs/common';
import { ExplanationsModule } from '../explanations/explanations.module';
import { AttemptsController } from './attempts.controller';
import { AttemptsService } from './attempts.service';

@Module({
  imports: [ExplanationsModule],
  controllers: [AttemptsController],
  providers: [AttemptsService],
})
export class AttemptsModule {}
