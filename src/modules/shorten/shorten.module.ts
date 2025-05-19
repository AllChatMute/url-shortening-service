import { Module } from "@nestjs/common";
import { ShortenService } from "./shorten.service";
import { ShortenController } from "./shorten.controller";
import { Url, UrlSchema } from "../../schemas/url.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { Statistic, StatisticSchema } from "../../schemas/statistic.schema";
import { UrlRepositoryService } from "../../services/urlRepository/urlRepository.service";
import { StatisticRepositoryService } from "../../services/statisticRepository/statisticRepository.service";
import { HelpersService } from "../../services/helpers/helpers.service";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Url.name, schema: UrlSchema },
      { name: Statistic.name, schema: StatisticSchema },
    ]),
  ],
  controllers: [ShortenController],
  providers: [
    ShortenService,
    UrlRepositoryService,
    StatisticRepositoryService,
    HelpersService,
    ConfigService,
    JwtService,
  ],
})
export class ShortenModule {}
