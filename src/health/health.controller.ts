import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { HealthService } from './health.service.js';
import { HealthResponse } from './database.health.dto.js';
import { Public } from '@nestjs/authentication';

@Public()
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) { }

  @Get()
  async checkHealth(): Promise<HealthResponse> {
    const databaseCheck = await this.healthService.checkDatabase();

    if (databaseCheck === 'ok') {
      return {
        status: 'ok',
        database: 'ok'
      }
    }

    throw new ServiceUnavailableException();
  }
}