import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ShortenModule } from "./shorten/shorten.module";
import { UrlRepositoryService } from "./services/urlRepository/urlRepository.service";
import { StatisticRepositoryService } from "./services/statisticRepository/statisticRepository.service";
import { HelpersService } from "./services/helpers/helpers.service";

import { Url, UrlSchema } from "src/schemas/url.schema";
import { Statistic, StatisticSchema } from "src/schemas/statistic.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Url.name, schema: UrlSchema },
      { name: Statistic.name, schema: StatisticSchema },
    ]),
    ShortenModule,
    MongooseModule.forRoot("mongodb://localhost:27017/url-shortening-service"),
  ],
  providers: [UrlRepositoryService, StatisticRepositoryService, HelpersService],
})
export class AppModule {}
