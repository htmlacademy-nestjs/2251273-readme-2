import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GATEWAY_SERVICE_PORT } from '@readme/shared-types';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  const config = new DocumentBuilder()
    .setTitle('Readme — API Gateway')
    .setDescription('Точка входа для фронтенда. Прокси + агрегация.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, config));

  const port = process.env.PORT ? Number(process.env.PORT) : GATEWAY_SERVICE_PORT;
  await app.listen(port);
  Logger.log(`🚪 Gateway on http://localhost:${port}/api`);
}

bootstrap();
