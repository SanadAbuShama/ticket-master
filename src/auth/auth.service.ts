import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '../env.schema.js';

@Injectable()
export class AuthService {
  constructor(private readonly config: ConfigService<EnvironmentVariables, true>) { }

  getHello(): string {
    return this.config.get('DATABASE_URL', { infer: true });
  }
}
