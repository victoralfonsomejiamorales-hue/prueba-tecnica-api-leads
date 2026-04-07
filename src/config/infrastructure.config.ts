import { ConfigModule } from '@nestjs/config';
import Configuration from './app.config';
import { envValidationSchema } from './env.validation';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { User, UserSchema } from 'src/common/models/user.model';
import { AiModule } from 'src/ai/ai.module';

export const InfrastructureConfig = [
  AiModule,
  ConfigModule.forRoot({
    load: [Configuration],
    isGlobal: true,
    envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    validationSchema: envValidationSchema,
  }),

  MongooseModule.forRootAsync({
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
      const logger = new Logger('MongooseModule');
      logger.log('Connecting to MongoDB...');
      return {
        uri: configService.get('mongodbUri'),
        onConnectionCreate: (connection) => {
          connection.on('connected', () => {
            logger.log('Connected to MongoDB');
          });
          connection.on('error', (error) =>
            logger.error('Database error', error),
          );
          return connection;
        },
      };
    },
  }),

  MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
];
