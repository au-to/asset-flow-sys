import './env';
import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor(app.get(Reflector)));
  const corsOrigins = process.env.WEB_ORIGIN
    ? process.env.WEB_ORIGIN.split(',').map((origin) => origin.trim())
    : true;
  app.enableCors({ origin: corsOrigins, credentials: true });
  const port = Number(process.env.PORT) || 3001;
  // Railway/Docker 健康检查从容器外探测，必须监听 0.0.0.0
  await app.listen(port, '0.0.0.0');
  console.log(`API running on http://0.0.0.0:${port}`);
}

bootstrap().catch((err) => {
  console.error('Startup failed:', err);
  process.exit(1);
});
