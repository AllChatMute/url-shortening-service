import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Statistic } from "src/schemas/statistic.schema";

@Injectable()
export class StatisticRepositoryService {
  constructor(
    @InjectModel(Statistic.name) private statisticModel: Model<Statistic>
  ) {}

  async create(statsObj: Statistic): Promise<Statistic> {
    try {
      return await this.statisticModel.insertOne(statsObj);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException("Failed to create URL statistic");
    }
  }

  async updateAccessCount(shortCode: string) {
    try {
      await this.statisticModel.findOneAndUpdate(
        { shortCode },
        { $inc: { accessCount: 1 } }
      );
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException("Failed to update access count");
    }
  }

  async getUrlStatistics(shortCode: string): Promise<Statistic> {
    const statistic = await this.statisticModel.findOne({ shortCode });

    if (!statistic) throw new NotFoundException("Url not Found");
    return statistic;
  }
}
