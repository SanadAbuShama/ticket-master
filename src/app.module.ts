import { Module } from '@nestjs/common';
import { DrizzleModule } from '@nestjs/drizzle';
import { AuthModule } from './auth/auth.module.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvironmentVariablesSchema } from './env.schema.js';
import { drizzle } from 'drizzle-orm/node-postgres';
import { HealthModule } from './health/health.module.js';
import { AuthenticationModule } from '@nestjs/authentication';

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
    HealthModule
  ],
})
export class AppModule { }
