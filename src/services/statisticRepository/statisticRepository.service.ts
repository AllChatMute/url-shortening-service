import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Statistic } from "../../schemas/statistic.schema";

@Injectable()
export class StatisticRepositoryService {
  constructor(
    @InjectModel(Statistic.name) private statisticModel: Model<Statistic>
  ) {}

  async create(statsObj: Statistic): Promise<Statistic> {
    return await this.statisticModel.insertOne(statsObj);
  }

  async updateAccessCount(shortCode: string): Promise<undefined> {
    await this.statisticModel.findOneAndUpdate(
      { shortCode },
      { $inc: { accessCount: 1 } }
    );
  }

  async getUrlStatistics(shortCode: string): Promise<Statistic | null> {
    return await this.statisticModel.findOne({ shortCode });
  }
}
