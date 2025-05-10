import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Url } from "src/schemas/url.schema";
import { CreateUrlDto } from "./Dto/createUrlDto";
import { UrlInfo } from "./types/urlInfo.interface";
import { generateRandomString } from "src/utils/generateRandomString";

@Injectable()
export class ShortenService {
  constructor(@InjectModel(Url.name) private urlModel: Model<Url>) {}

  private async generateUniqueShortCode(length: number = 5) {
    const maxAttempts = 10;

    for (let i = 0; i < maxAttempts; i++) {
      const shortCode = generateRandomString(length);
      const exists = await this.urlModel.exists({ shortCode }).exec();

      if (!exists) {
        return shortCode;
      }
    }

    throw new InternalServerErrorException(
      "Failed to generate unique short code"
    );
  }

  private async generateId(url: string) {
    const urls: UrlInfo[] = await this.urlModel.find().exec();

    if (urls.find((item) => item.url === url)) {
      throw new BadRequestException("Url shortCode already exists");
    }

    return urls.length > 0 ? Math.max(...urls.map((item) => item.id)) + 1 : 1;
  }

  async createUrl(createUrlDto: CreateUrlDto) {
    const { url } = createUrlDto;

    const date = new Date().toISOString();
    const shortCode = await this.generateUniqueShortCode();
    const id = await this.generateId(url);

    const newUrl = new this.urlModel({
      id,
      url,
      shortCode,
      createdAt: date,
      updatedAt: date,
    });

    try {
      return await this.urlModel.insertOne(newUrl);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException("Failed to create URL");
    }
  }

  async findAll(): Promise<Url[]> {
    return await this.urlModel.find().exec();
  }
}
