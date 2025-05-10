import { Module } from "@nestjs/common";
import { ShortenService } from "./shorten.service";
import { ShortenController } from "./shorten.controller";
import { Url, UrlSchema } from "src/schemas/url.schema";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
  imports: [MongooseModule.forFeature([{ name: Url.name, schema: UrlSchema }])],
  controllers: [ShortenController],
  providers: [ShortenService],
})
export class ShortenModule {}
