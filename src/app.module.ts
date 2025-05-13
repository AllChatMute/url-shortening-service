import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ShortenModule } from "./shorten/shorten.module";
import { UrlRepositoryService } from "./services/urlRepository/urlRepository.service";
import { StatisticRepositoryService } from "./services/statisticRepository/statisticRepository.service";
import { HelpersService } from "./services/helpers/helpers.service";

import { Url, UrlSchema } from "src/schemas/url.schema";
import { Statistic, StatisticSchema } from "src/schemas/statistic.schema";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { User, UserSchema } from "./schemas/user.schema";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>("DATABASE_URL"),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Url.name, schema: UrlSchema },
      { name: Statistic.name, schema: StatisticSchema },
      { name: User.name, schema: UserSchema },
    ]),
    ShortenModule,
    AuthModule,
    UsersModule,
  ],
  providers: [UrlRepositoryService, StatisticRepositoryService, HelpersService],
})
export class AppModule {}
