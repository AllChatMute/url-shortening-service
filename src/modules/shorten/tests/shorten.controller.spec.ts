import { UrlRepositoryService } from "../../../services/urlRepository/urlRepository.service";
import { ShortenController } from "../shorten.controller";
import { ShortenService } from "../shorten.service";
import { Test } from "@nestjs/testing";
import { StatisticRepositoryService } from "../../../services/statisticRepository/statisticRepository.service";
import { HelpersService } from "../../../services/helpers/helpers.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { NotFoundException } from "@nestjs/common";

const url = {
  id: 1,
  url: "url",
  shortCode: "shortCode",
  createdAt: "23",
  updatedAt: "da",
};

describe("ShortenController", () => {
  let shortenController: ShortenController;
  let shortenService: ShortenService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ShortenController],
      providers: [
        {
          provide: ShortenService,
          useValue: {
            getAll: jest.fn().mockResolvedValue([url]),
            findByShortCode: jest.fn().mockResolvedValue(url),
            getUrlStatistics: jest.fn().mockResolvedValue({
              url: "url",
              shortCode: "shortCode",
              accessCount: 1,
            }),
            createUrl: jest.fn().mockResolvedValue(url),
            updateShortUrl: jest.fn().mockResolvedValue(url),
            deleteShortUrl: jest.fn().mockResolvedValue(url),
          },
        },
        HelpersService,
        JwtService,
        ConfigService,
        {
          provide: UrlRepositoryService,
          useValue: {
            find: jest.fn().mockResolvedValue([{ url: "test" }]), // пример мока
          },
        },
        {
          provide: StatisticRepositoryService,
          useValue: {
            find: jest.fn().mockResolvedValue([{ statistic: "test" }]), // пример мока
          },
        },
      ],
    }).compile();

    shortenController = moduleRef.get(ShortenController);
    shortenService = moduleRef.get(ShortenService);
  });

  it("should be defined", () => {
    expect(shortenController).toBeDefined();
  });

  it("should return an array of urls", async () => {
    expect(await shortenController.getAll()).toEqual([url]);
  });

  it("should return single url", async () => {
    expect(await shortenController.getUrl("code")).toEqual(url);
  });

  it("should return url statistic", async () => {
    expect(await shortenController.getUrlStatistics("code")).toEqual({
      url: "url",
      shortCode: "shortCode",
      accessCount: 1,
    });
  });

  it("should return created url", async () => {
    expect(
      await shortenController.createShortUrl({
        url: "url",
      })
    ).toEqual(url);
  });

  it("should return updated url", async () => {
    expect(
      await shortenController.updateShortUrl({ url: "url" }, "code")
    ).toEqual(url);
  });

  it("should return deleted url", async () => {
    expect(await shortenController.deleteShortUrl("code")).toEqual(url);
  });

  it("should return url with correct structure", async () => {
    const result = await shortenController.getUrl("code");
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

  it("should call service with correct shortCode", async () => {
    await shortenController.getUrl("test_code");
    expect(shortenService.findByShortCode).toHaveBeenCalledWith("test_code");
  });

  it("should throw 404 if url not found", async () => {
    jest
      .spyOn(shortenService, "findByShortCode")
      .mockRejectedValue(new NotFoundException());

    await expect(shortenController.getUrl("invalid")).rejects.toThrow(
      NotFoundException
    );
  });
});
