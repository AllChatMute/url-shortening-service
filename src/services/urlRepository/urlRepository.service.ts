import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { Url } from "../../schemas/url.schema";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class UrlRepositoryService {
  constructor(@InjectModel(Url.name) private urlModel: Model<Url>) {}

  async create(url: Url): Promise<Url> {
    return await this.urlModel.insertOne(url);
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
    return await this.urlModel.findOne({ shortCode }).exec();
  }

  async updateShortUrl(
    shortCode: string,
    updatedObj: { url: string; updatedAt: string }
  ): Promise<Url | "conflict" | null> {
    if (
      await this.urlModel
        .findOne({ url: updatedObj.url, shortCode: { $ne: shortCode } })
        .exec()
    ) {
      return "conflict";
    }

    const updatedUrl = await this.urlModel
      .findOneAndUpdate({ shortCode }, updatedObj, { new: true })
      .exec();

    return updatedUrl;
  }

  async deleteUrl(shortCode: string): Promise<undefined> {
    await this.urlModel.findOneAndDelete({ shortCode });
  }
}
