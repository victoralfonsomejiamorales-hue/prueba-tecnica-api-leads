// src/seed/seed.ts
import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module';
import { SeedService } from './seed.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(SeedModule);
  const seedService = appContext.get(SeedService);
  const logger = new Logger('Seed');

  await seedService.runSeed();

  logger.log('Seed completado.');
  await appContext.close();
}
void bootstrap();
