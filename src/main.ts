import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // 1. Importar Swagger
import helmet from 'helmet';
import { HttpExceptionFilter } from './common/filters/http.exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port')!;
  const nodeEnv = configService.get<string>('nodeEnv')!;
  const logger = new Logger('Bootstrap');

  const config = new DocumentBuilder()
    .setTitle('API Leads & AI Analysis')
    .setDescription(
      'Servicio especializado en gestión de leads y análisis con Groq AI',
    )
    .setVersion('1.0')
    .addTag('Leads', 'Gestión y filtrado de prospectos')
    .addTag('Auth', 'Autenticación y seguridad')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(port);
  logger.log(`Server running on port ${port} in ${nodeEnv} mode`);
  logger.log(
    `Swagger documentation available at http://localhost:${port}/docs`,
  );
}
void bootstrap();
