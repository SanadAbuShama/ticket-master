import { Module } from '@nestjs/common';
import { DrizzleModule } from '@nestjs/drizzle';
import { AuthModule } from './auth/auth.module.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvironmentVariablesSchema } from './env.schema.js';
import { drizzle } from 'drizzle-orm/node-postgres';
import { HealthModule } from './health/health.module.js';
import { AuthenticationModule } from '@nestjs/authentication';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { SchemaValidationPipe } from './common/pipes/zod-validation.pipe.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => EnvironmentVariablesSchema.parse(config)
    }),
    DrizzleModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        drizzle,
        connection: config.getOrThrow('DATABASE_URL'),
      }),
    }),
    AuthenticationModule.forRoot({
      session: {
        absoluteTtl: '14d',
        idleTtl: '3d',
      },
    }),
    AuthModule,
    HealthModule
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_PIPE, useClass: SchemaValidationPipe }
  ]
})
export class AppModule { }
