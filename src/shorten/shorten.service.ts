import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
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

  private async generateUniqueShortCode(length: number = 5): Promise<string> {
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

  private async generateId(url: string): Promise<number> {
    const urls: UrlInfo[] = await this.urlModel.find().exec();

    if (urls.find((item) => item.url === url)) {
      throw new BadRequestException("Url shortCode already exists");
    }

    return urls.length > 0 ? Math.max(...urls.map((item) => item.id)) + 1 : 1;
  }

  async createUrl(createUrlDto: CreateUrlDto): Promise<Url> {
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
      return await newUrl.save();
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException("Failed to create URL");
    }
  }

  async findByShortCode(shortCode: string): Promise<Url> {
    const foundedUrl = await this.urlModel.findOne({ shortCode }).exec();

    if (!foundedUrl) throw new NotFoundException("Url not Found");
    return foundedUrl;
  }

  async updateShortUrl(
    createUrlDto: CreateUrlDto,
    shortCode: string
  ): Promise<Url> {
    if (
      await this.urlModel
        .findOne({ url: createUrlDto.url, shortCode: { $ne: shortCode } })
        .exec()
    ) {
      throw new ConflictException("Url already in use");
    }

    const updatedUrl = await this.urlModel
      .findOneAndUpdate(
        { shortCode },
        { ...createUrlDto, updatedAt: new Date().toISOString() },
        { new: true }
      )
      .exec();

    if (!updatedUrl) throw new NotFoundException("Url not Found");

    return updatedUrl;
  }

  async deleteShortUrl(shortCode: string) {
    try {
      const deletedUrl = await this.urlModel.findOneAndDelete({ shortCode });
      if (!deletedUrl) throw Error("Url not Found");
    } catch (error) {
      console.log(error);
      throw new NotFoundException("Url not Found");
    }
  }
}
