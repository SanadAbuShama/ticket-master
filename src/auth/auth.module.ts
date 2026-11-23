import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { UsersModule } from '../users/users.module.js';
import { SessionAuth } from './session.auth.provider.js';
import { CredentialsService } from './credentials.service.js';
import { DrizzleAuthenticationStore } from './drizzle.authentication.store.js';

@Module({
  imports:[UsersModule],
  controllers: [AuthController],
  providers: [AuthService, SessionAuth, CredentialsService, DrizzleAuthenticationStore],
})
export class AuthModule {}
