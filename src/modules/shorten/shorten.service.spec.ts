import { HelpersService } from "./../../services/helpers/helpers.service";
import { Test } from "@nestjs/testing";
import { ShortenService } from "./shorten.service";
import { StatisticRepositoryService } from "../../services/statisticRepository/statisticRepository.service";
import { UrlRepositoryService } from "../../services/urlRepository/urlRepository.service";
import { NotFoundException } from "@nestjs/common";

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
            create: jest.fn().mockResolvedValue(urlStats),
            updateAccessCount: jest.fn().mockResolvedValue(undefined),
            getUrlStatistics: jest.fn().mockResolvedValue(urlStats),
          },
        },
        {
          provide: UrlRepositoryService,
          useValue: {
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

  it("should return url by shortCode", async () => {
    expect(await shortenService.findByShortCode("code")).toEqual(url);
  });

  it("should return url statistics", async () => {
    expect(await shortenService.getUrlStatistics("code")).toEqual(urlStats);
  });

  it("should return updated url", async () => {
    expect(await shortenService.updateShortUrl({ url: "url" }, "code")).toEqual(
      url
    );
  });

  it("should return url with correct structure", async () => {
    const result = await shortenService.findByShortCode("code");
    expect(result).toEqual(
      expect.objectContaining({
        id: expect.any(Number) as number,
        url: expect.any(String) as string,
        shortCode: expect.any(String) as string,
        createdAt: expect.any(String) as string,
        updatedAt: expect.any(String) as string,
      })
    );
  });

  it("should return stats with correct structure", async () => {
    const result = await shortenService.getUrlStatistics("code");
    expect(result).toEqual(
      expect.objectContaining({
        url: expect.any(String) as string,
        shortCode: expect.any(String) as string,
        accessCount: expect.any(Number) as string,
      })
    );
  });

  it("should return 404 if url not found", async () => {
    jest.spyOn(urlRepositoryService, "findByShortCode").mockResolvedValue(null);

    await expect(shortenService.findByShortCode("invalid")).rejects.toThrow(
      NotFoundException
    );
  });
});
