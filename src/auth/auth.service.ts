import { Injectable } from '@nestjs/common';
import { SignInDto, SignUpDto } from './auth.dto.js';
import { CredentialsService } from './credentials.service.js';
import { InternalUser } from '../users/user.types.js';
import { SignInService } from '@nestjs/authentication';
import { AppError } from '../common/errors/app.error.js';
import { ErrorCode } from '../common/errors/error.codes.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly credentialsService: CredentialsService,
    private readonly signInService: SignInService
  ) { }

  async signUp({ email, name, password }: SignUpDto): Promise<InternalUser> {

    const createdUser = await this.credentialsService.register(name, email, password)
    await this.signInService.signIn(createdUser.id, { method: 'password' });

    return createdUser

  }

  async signIn({ email, password }: SignInDto): Promise<InternalUser> {

    const foundUser = await this.credentialsService.verify(email, password)

    if (!foundUser) {

      throw new AppError(ErrorCode.INVALID_CREDENTIALS);

    }

    await this.signInService.signIn(foundUser.id, { method: 'password' });

    return foundUser
  }

  async signOut(): Promise<void> {

    await this.signInService.signOut()
  }
}
