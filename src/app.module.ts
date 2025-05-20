import { Module } from "@nestjs/common";
import { UrlRepositoryService } from "./services/urlRepository/urlRepository.service";
import { StatisticRepositoryService } from "./services/statisticRepository/statisticRepository.service";
import { HelpersService } from "./services/helpers/helpers.service";
import { ConfigModule } from "@nestjs/config";
import { HashService } from "./services/hash/hash.service";
import { AuthModule } from "./modules/auth/auth.module";
import { ShortenModule } from "./modules/shorten/shorten.module";
import { UsersModule } from "./modules/users/users.module";
import { DatabaseConfigModule } from "./configs/databaseConfig.module";
import { CacheConfigModule } from "./configs/cacheConfig.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    DatabaseConfigModule,
    CacheConfigModule,
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
