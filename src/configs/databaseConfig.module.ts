import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { Statistic, StatisticSchema } from "../schemas/statistic.schema";
import { Url, UrlSchema } from "../schemas/url.schema";
import { User, UserSchema } from "../schemas/user.schema";

@Module({
  imports: [
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
  ],
  exports: [MongooseModule],
})
export class DatabaseConfigModule {}
