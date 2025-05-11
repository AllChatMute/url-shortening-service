import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { Model } from "mongoose";
import { Url } from "src/schemas/url.schema";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class UrlRepositoryService {
  constructor(@InjectModel(Url.name) private urlModel: Model<Url>) {}

  async create(url: Url): Promise<Url> {
    try {
      return await this.urlModel.insertOne(url);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException("Failed to create URL");
    }
  }

  async isExists(shortCode: string): Promise<boolean> {
    const exists = await this.urlModel.exists({ shortCode }).exec();

    if (exists) return true;
    return false;
  }

  async getUrls(): Promise<Url[]> {
    return await this.urlModel.find().exec();
  }

  async findByShortCode(shortCode: string) {
    const foundedUrl = await this.urlModel.findOne({ shortCode }).exec();
    if (!foundedUrl) throw new NotFoundException("Url not Found");

    return foundedUrl;
  }

  async updateShortUrl(
    shortCode: string,
    updatedObj: { url: string; updatedAt: string }
  ) {
    if (
      await this.urlModel
        .findOne({ url: updatedObj.url, shortCode: { $ne: shortCode } })
        .exec()
    ) {
      throw new ConflictException("Url already in use");
    }

    const updatedUrl = await this.urlModel
      .findOneAndUpdate({ shortCode }, updatedObj, { new: true })
      .exec();

    if (!updatedUrl) throw new NotFoundException("Url not Found");

    return updatedUrl;
  }

  async deleteUrl(shortCode: string) {
    const deletedUrl = await this.urlModel.findOneAndDelete({ shortCode });
    if (!deletedUrl) throw new NotFoundException("Url not Found");
  }
}
