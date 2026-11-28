
import { Injectable } from '@nestjs/common';
import { PasswordHasher } from '@nestjs/authentication';
import type { InternalUser, Role } from '../users/user.types.js';
import { UsersRepository } from '../users/users.repository.js';
import { userRole } from '../database/schema/users.js';

@Injectable()
export class CredentialsService {
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly passwordHasher: PasswordHasher,
    ) { }

    async register(name: string, email: string, password: string, roles: Role[]): Promise<InternalUser> {

        return this.usersRepository.create(email, { name, roles,  passwordHash: await this.passwordHasher.hash(password) });
    }

    async verify(email: string, password: string): Promise<InternalUser | null> {
        const found = await this.usersRepository.findCredentials(email);

        const valid = await this.passwordHasher.verify(password, found?.passwordHash);
        if (!valid || !found?.passwordHash) {
            return null;
        }

        if (this.passwordHasher.needsRehash(found.passwordHash)) {
            await this.usersRepository.updatePasswordHash(found.user.id, await this.passwordHasher.hash(password));
        }
        return found.user;
    }
}
