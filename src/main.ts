import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { appOptions, configureApp } from './app.setup.js';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, appOptions);
  configureApp(app);

  const config = new DocumentBuilder()
    .setTitle('TicketMaster API')
    .setVersion('1.0')
    .addCookieAuth('__Host-sid')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, documentFactory);

  const appConfig = app.get(ConfigService);

  await app.listen(appConfig.getOrThrow('PORT'));
}

await bootstrap();
