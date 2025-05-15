import { HelpersService } from "./../../services/helpers/helpers.service";
import { Test } from "@nestjs/testing";
import { ShortenService } from "./shorten.service";
import { StatisticRepositoryService } from "../../services/statisticRepository/statisticRepository.service";
import { UrlRepositoryService } from "../../services/urlRepository/urlRepository.service";

const urlStats = {
  url: "url",
  shortCode: "shortCode",
  accessCount: 1,
};

const url = {
  id: 1,
  url: "url",
  shortCode: "shortCode",
  createdAt: "23",
  updatedAt: "da",
};

describe("ShortenService", () => {
  let shortenService: ShortenService;
  let urlRepositoryService: UrlRepositoryService;
  let helpersService: HelpersService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ShortenService,
        HelpersService,
        {
          provide: StatisticRepositoryService,
          useValue: {
            find: jest.fn().mockResolvedValue({ statistic: "test" }),
            create: jest.fn().mockResolvedValue(urlStats),
            updateAccessCount: jest.fn().mockResolvedValue(undefined),
            getUrlStatistics: jest.fn().mockResolvedValue(urlStats),
          },
        },
        {
          provide: UrlRepositoryService,
          useValue: {
            find: jest.fn().mockResolvedValue([]),
            create: jest.fn().mockResolvedValue(url),
            getUrls: jest.fn().mockResolvedValue([url]),
            findByShortCode: jest.fn().mockResolvedValue(url),
            updateShortUrl: jest.fn().mockResolvedValue(url),
            deleteUrl: jest.fn().mockResolvedValue(undefined),
            isExists: jest.fn().mockResolvedValue(false),
          },
        },
      ],
    }).compile();

    shortenService = moduleRef.get(ShortenService);
    urlRepositoryService = moduleRef.get(UrlRepositoryService);
    helpersService = moduleRef.get(HelpersService);
  });

  it("should be defined", () => {
    expect(shortenService).toBeDefined();
  });

  it("should return an array of urls", async () => {
    expect(await shortenService.getAll()).toEqual([url]);
  });

  it("should return created url", async () => {
    jest.spyOn(helpersService, "generateId").mockResolvedValue(1);
    jest.spyOn(urlRepositoryService, "isExists").mockResolvedValue(false);

    expect(await shortenService.createUrl({ url: "url" })).toEqual(url);
  });
});
