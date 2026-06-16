import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';
import { AdminModule } from './admin/admin.module';
import { AttemptsModule } from './attempts/attempts.module';
import { PrismaModule } from './prisma/prisma.module';
import { QuestionsModule } from './questions/questions.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/assets',
    }),
    PrismaModule,
    QuestionsModule,
    AttemptsModule,
    AdminModule,
  ],
})
export class AppModule {}
