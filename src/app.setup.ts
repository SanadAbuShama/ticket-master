import type { INestApplication, NestApplicationOptions } from '@nestjs/common';

export const appOptions: NestApplicationOptions = {
  routeConflictPolicy: { duplicate: 'error', shadow: 'warn' },
  routeResolutionStrategy: 'specificity',
};

export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('api/v1');
  app.enableShutdownHooks();
}