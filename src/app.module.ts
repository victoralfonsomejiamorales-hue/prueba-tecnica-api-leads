import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InfrastructureConfig } from './config/infrastructure.config';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { LeadsController } from './modules/leads/controllers/leads.controller';
import { LeadsService } from './modules/leads/services/leads.service';
import { LeadsRepository } from './modules/leads/repositories/leads.repository';
import { AiService } from './utils/ai/ai.service';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { JwtStrategy } from './modules/auth/strategy/jwt.strategy';
import { AuthService } from './modules/auth/services/auth.service';
import { BcryptService } from './utils/bcrypt.service';
import { AuthController } from './modules/auth/controllers/auth.controller';

@Module({
  imports: [...InfrastructureConfig],
  controllers: [AppController, LeadsController, AuthController],
  providers: [
    AppService,
    AuthService,
    LeadsService,
    LeadsRepository,
    AiService,
    BcryptService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    JwtStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
