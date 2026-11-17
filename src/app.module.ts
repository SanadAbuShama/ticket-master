import { Module } from '@nestjs/common';
import { DrizzleModule } from '@nestjs/drizzle';
import { AuthModule } from './auth/auth.module.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvironmentVariablesSchema } from './env.schema.js';
import { drizzle } from 'drizzle-orm/node-postgres';

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
    AuthModule,
  ],
})
export class AppModule { }
