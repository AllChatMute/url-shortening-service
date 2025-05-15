import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { Url } from "../../schemas/url.schema";
import { CreateUrlDto } from "./Dto/createUrlDto";
import { HelpersService } from "../../services/helpers/helpers.service";
import { StatisticRepositoryService } from "../../services/statisticRepository/statisticRepository.service";
import { UrlRepositoryService } from "../../services/urlRepository/urlRepository.service";

@Injectable()
export class ShortenService {
  constructor(
    private readonly urlRepositoryService: UrlRepositoryService,
    private readonly statisticRepositoryService: StatisticRepositoryService,
    private readonly helpersService: HelpersService
  ) {}

  async getAll(): Promise<Url[]> {
    return await this.urlRepositoryService.getUrls();
  }

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

    try {
      await this.statisticRepositoryService.create({
        url,
        shortCode,
        accessCount: 0,
      });
      return await this.urlRepositoryService.create(newUrl);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException("Failed to create URL");
    }
  }

  async findByShortCode(shortCode: string): Promise<Url | null> {
    const foundedUrl =
      await this.urlRepositoryService.findByShortCode(shortCode);
    if (!foundedUrl) throw new NotFoundException();

    try {
      await this.statisticRepositoryService.updateAccessCount(shortCode);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException("Failed to update access count");
    }

    return foundedUrl;
  }

  async getUrlStatistics(shortCode: string) {
    try {
      return this.statisticRepositoryService.getUrlStatistics(shortCode);
    } catch (error) {
      console.log(error);
      throw new NotFoundException("Url not Found");
    }
  }

  async updateShortUrl(
    createUrlDto: CreateUrlDto,
    shortCode: string
  ): Promise<Url> {
    const updatedUrl = await this.urlRepositoryService.updateShortUrl(
      shortCode,
      { ...createUrlDto, updatedAt: new Date().toISOString() }
    );

    if (!updatedUrl) throw new NotFoundException("Url not Found");
    if (updatedUrl === "conflict") throw new ConflictException("Url is busy");

    return updatedUrl;
  }

  async deleteShortUrl(shortCode: string) {
    try {
      return this.urlRepositoryService.deleteUrl(shortCode);
    } catch (error) {
      console.log(error);
      throw new NotFoundException("Url not Found");
    }
  }
}
