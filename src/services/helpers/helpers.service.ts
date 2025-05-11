import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { generateRandomString } from "src/utils/generateRandomString";
import { UrlRepositoryService } from "../urlRepository/urlRepository.service";
import { Url } from "src/schemas/url.schema";

@Injectable()
export class HelpersService {
  constructor(private readonly urlRepositoryService: UrlRepositoryService) {}

  async generateUniqueShortCode(length: number = 5): Promise<string> {
    const maxAttempts = 10;

    for (let i = 0; i < maxAttempts; i++) {
      const shortCode = generateRandomString(length);
      const exists = await this.urlRepositoryService.isExists(shortCode);

      if (!exists) {
        return shortCode;
      }
    }

    throw new InternalServerErrorException(
      "Failed to generate unique short code"
    );
  }

  async generateId(url: string): Promise<number> {
    const urls: Url[] = await this.urlRepositoryService.getUrls();

    if (urls.find((item) => item.url === url)) {
      throw new BadRequestException("Url shortCode already exists");
    }

    return urls.length > 0 ? Math.max(...urls.map((item) => item.id)) + 1 : 1;
  }
}
