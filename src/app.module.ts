import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ShortenModule } from "./shorten/shorten.module";

@Module({
  imports: [
    ShortenModule,
    MongooseModule.forRoot("mongodb://localhost:27017/url-shortening-service"),
  ],
})
export class AppModule {}
