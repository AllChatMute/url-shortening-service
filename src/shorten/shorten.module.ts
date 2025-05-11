import { Module } from "@nestjs/common";
import { ShortenService } from "./shorten.service";
import { ShortenController } from "./shorten.controller";
import { Url, UrlSchema } from "src/schemas/url.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { Statistic, StatisticSchema } from "src/schemas/statistic.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Url.name, schema: UrlSchema },
      { name: Statistic.name, schema: StatisticSchema },
    ]),
  ],
  controllers: [ShortenController],
  providers: [ShortenService],
})
export class ShortenModule {}
