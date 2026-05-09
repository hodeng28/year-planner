import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { OptionsModule } from './options/options.module';

@Module({
  imports: [PrismaModule, OptionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
