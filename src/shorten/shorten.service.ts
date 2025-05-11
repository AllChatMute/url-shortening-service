import { Injectable } from "@nestjs/common";
import { Url } from "src/schemas/url.schema";
import { CreateUrlDto } from "./Dto/createUrlDto";
import { UrlRepositoryService } from "src/services/urlRepository/urlRepository.service";
import { StatisticRepositoryService } from "src/services/statisticRepository/statisticRepository.service";
import { HelpersService } from "./../services/helpers/helpers.service";

@Injectable()
export class ShortenService {
  constructor(
    private readonly urlRepositoryService: UrlRepositoryService,
    private readonly statisticRepositoryService: StatisticRepositoryService,
    private readonly helpersService: HelpersService
  ) {}

  async createUrl(createUrlDto: CreateUrlDto): Promise<Url> {
    const { url } = createUrlDto;

    const date = new Date().toISOString();
    const shortCode = await this.helpersService.generateUniqueShortCode();
    const id = await this.helpersService.generateId(url);

    const newUrl = {
      id,
      url,
      shortCode,
      createdAt: date,
      updatedAt: date,
    };

    await this.statisticRepositoryService.create({
      url,
      shortCode,
      accessCount: 0,
    });

    return await this.urlRepositoryService.create(newUrl);
  }

  async findByShortCode(shortCode: string): Promise<Url> {
    const foundedUrl = this.urlRepositoryService.findByShortCode(shortCode);
    await this.statisticRepositoryService.updateAccessCount(shortCode);

    return foundedUrl;
  }

  async getUrlStatistics(shortCode: string) {
    return this.statisticRepositoryService.getUrlStatistics(shortCode);
  }

  async updateShortUrl(
    createUrlDto: CreateUrlDto,
    shortCode: string
  ): Promise<Url> {
    const updatedUrl = await this.urlRepositoryService.updateShortUrl(
      shortCode,
      { ...createUrlDto, updatedAt: new Date().toISOString() }
    );

    return updatedUrl;
  }

  async deleteShortUrl(shortCode: string) {
    return this.urlRepositoryService.deleteUrl(shortCode);
  }
}
