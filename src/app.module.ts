import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InfrastructureConfig } from './config/infrastructure.config';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { LeadsController } from './modules/leads/controllers/leads.controller';
import { LeadsService } from './modules/leads/services/leads.service';
import { LeadsRepository } from './modules/leads/repositories/leads.repository';
import { AiService } from './ai/ai.service';

@Module({
  imports: [...InfrastructureConfig],
  controllers: [AppController, LeadsController],
  providers: [AppService, LeadsService, LeadsRepository, AiService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
