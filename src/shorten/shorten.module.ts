import { Module } from '@nestjs/common';
import { ShortenService } from './shorten.service';
import { ShortenController } from './shorten.controller';

@Module({
  controllers: [ShortenController],
  providers: [ShortenService],
})
export class ShortenModule {}
