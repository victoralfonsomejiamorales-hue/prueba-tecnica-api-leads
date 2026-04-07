import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { InfrastructureConfig } from 'src/config/infrastructure.config';

@Module({
  imports: [...InfrastructureConfig],
  providers: [SeedService],
})
export class SeedModule {}
