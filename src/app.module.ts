import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UrlRepositoryService } from "./services/urlRepository/urlRepository.service";
import { StatisticRepositoryService } from "./services/statisticRepository/statisticRepository.service";
import { HelpersService } from "./services/helpers/helpers.service";
import { Url, UrlSchema } from "./schemas/url.schema";
import { Statistic, StatisticSchema } from "./schemas/statistic.schema";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { User, UserSchema } from "./schemas/user.schema";
import { HashService } from "./services/hash/hash.service";
import { AuthModule } from "./modules/auth/auth.module";
import { ShortenModule } from "./modules/shorten/shorten.module";
import { UsersModule } from "./modules/users/users.module";

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
  providers: [
    UrlRepositoryService,
    StatisticRepositoryService,
    HelpersService,
    HashService,
  ],
})
export class AppModule {}
