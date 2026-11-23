
import { Injectable } from '@nestjs/common';
import { AuthenticationRegistry, SessionCookieProvider, type SessionRecord } from '@nestjs/authentication';
import type { InternalUser } from '../users/user.types.js';
import { UsersRepository } from '../users/users.repository.js';

@Injectable()
export class SessionAuth extends SessionCookieProvider<InternalUser> {
  constructor(
    private readonly usersRepository: UsersRepository,
    registry: AuthenticationRegistry,
  ) {
    super();
    registry.registerProvider(this);
  }

  validate(session: SessionRecord) {
    return this.usersRepository.findActiveById(session.userId);
  }
}
