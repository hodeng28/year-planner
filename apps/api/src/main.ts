import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS 활성화 (프론트엔드와의 통신을 위해)
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });
  
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 NestJS API 서버가 http://localhost:${port}에서 실행 중입니다.`);
}
bootstrap();
