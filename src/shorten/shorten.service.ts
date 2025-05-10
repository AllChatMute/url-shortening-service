import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Url } from "src/schemas/url.schema";
import { CreateUrlDto } from "./Dto/createUrlDto";

@Injectable()
export class ShortenService {
  constructor(@InjectModel(Url.name) private urlModel: Model<Url>) {}

  async createUrl(createUrlDto: CreateUrlDto): Promise<Url> {
    const createdUrl = new this.urlModel(createUrlDto);
    return createdUrl.save();
  }
}
