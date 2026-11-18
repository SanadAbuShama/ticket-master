import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    routeConflictPolicy: { duplicate: 'error', shadow: 'warn' },
    routeResolutionStrategy: 'specificity',
  });

  const config = new DocumentBuilder()
    .setTitle('TicketMaster API')
    .setVersion('1.0')
    .addCookieAuth('__Host-sid')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, documentFactory);

  app.enableShutdownHooks()

  await app.setGlobalPrefix('api/v1').listen(process.env.PORT ?? 3000);
}

await bootstrap();
