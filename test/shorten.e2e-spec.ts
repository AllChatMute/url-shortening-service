import { ConfigModule, ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { App } from "supertest/types";
import { Model } from "mongoose";
import { MongooseModule } from "@nestjs/mongoose";
import { Response } from "express";
import { Url, UrlSchema } from "../src/schemas/url.schema";
import { Statistic, StatisticSchema } from "../src/schemas/statistic.schema";
import { AppModule } from "../src/app.module";
import { AuthGuard } from "../src/guards/auth.guard";

const dto = {
  url: "https://someUrl.com",
};

const mockAuthGuard = {
  canActivate: jest.fn().mockImplementation(() => true),
};

describe("Shorten (e2e)", () => {
  let app: INestApplication<App>;

  let urlModel: Model<Url>;
  let statisticModel: Model<Statistic>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            uri: configService.get<string>("DATABASE_URL"),
          }),
          inject: [ConfigService],
        }),
        MongooseModule.forFeature([
          { name: Url.name, schema: UrlSchema },
          { name: Statistic.name, schema: StatisticSchema },
        ]),
        AppModule,
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(new ValidationPipe());

    await app.init();

    urlModel = moduleFixture.get<Model<Url>>("UrlModel");
    statisticModel = moduleFixture.get<Model<Statistic>>("StatisticModel");
  });

  beforeEach(async () => {
    await urlModel.deleteMany({});
    await statisticModel.deleteMany({});
  });

  afterAll(async () => {
    await urlModel.deleteMany({});
    await statisticModel.deleteMany({});
    await app.close();
  });

  it("POST /shorten - should return created url", async () => {
    const response = (await request(app.getHttpServer())
      .post("/shorten")
      .set("Cookie", ["auth=test-token"])
      .send(dto)
      .expect(201)) as unknown as Response & { body: Url };

    expect(response.body).toMatchObject({
      id: expect.any(Number) as number,
      url: expect.any(String) as string,
      shortCode: expect.any(String) as string,
      createdAt: expect.any(String) as string,
      updatedAt: expect.any(String) as string,
    });
  });

  it("GET /shorten/:shortCode - should return founded url", async () => {
    const POSTresponse = (await request(app.getHttpServer())
      .post("/shorten")
      .set("Cookie", ["auth=test-token"])
      .send(dto)
      .expect(201)) as unknown as Response & { body: Url };

    const GETresponse = (await request(app.getHttpServer())
      .get(`/shorten/${POSTresponse.body.shortCode}`)
      .set("Cookie", ["auth=test-token"])
      .expect(200)) as unknown as Response & { body: Url };

    expect(GETresponse.body).toMatchObject({
      id: expect.any(Number) as number,
      url: expect.any(String) as string,
      shortCode: expect.any(String) as string,
      createdAt: expect.any(String) as string,
      updatedAt: expect.any(String) as string,
    });
  });

  it("PATCH /shorten/:shortCode - should return updated url", async () => {
    const POSTresponse = (await request(app.getHttpServer())
      .post("/shorten")
      .set("Cookie", ["auth=test-token"])
      .send(dto)
      .expect(201)) as unknown as Response & { body: Url };

    const PATCHresponse = (await request(app.getHttpServer())
      .patch(`/shorten/${POSTresponse.body.shortCode}`)
      .send({ url: "https://someUpdatedUrl.com" })
      .set("Cookie", ["auth=test-token"])
      .expect(200)) as unknown as Response & { body: Url };

    expect(PATCHresponse.body).toMatchObject({
      id: expect.any(Number) as number,
      url: expect.any(String) as string,
      shortCode: expect.any(String) as string,
      createdAt: expect.any(String) as string,
      updatedAt: expect.any(String) as string,
    });
  });

  it("DELETE /shorten/:shortCode - should delete url", async () => {
    const POSTresponse = (await request(app.getHttpServer())
      .post("/shorten")
      .set("Cookie", ["auth=test-token"])
      .send(dto)
      .expect(201)) as unknown as Response & { body: Url };

    await request(app.getHttpServer())
      .delete(`/shorten/${POSTresponse.body.shortCode}`)
      .set("Cookie", ["auth=test-token"])
      .expect(204);
  });

  it("GET /shorten/:shortCode/stats - should return url statistic", async () => {
    const POSTresponse = (await request(app.getHttpServer())
      .post("/shorten")
      .set("Cookie", ["auth=test-token"])
      .send(dto)
      .expect(201)) as unknown as Response & { body: Url };

    const GETresponse = (await request(app.getHttpServer())
      .get(`/shorten/${POSTresponse.body.shortCode}/stats`)
      .set("Cookie", ["auth=test-token"])
      .expect(200)) as unknown as Response & { body: Statistic };

    expect(GETresponse.body).toMatchObject({
      url: expect.any(String) as string,
      shortCode: expect.any(String) as string,
      accessCount: expect.any(Number) as number,
    });
  });

  it("POST /shorten - should throw 400 if url exists", async () => {
    await request(app.getHttpServer())
      .post("/shorten")
      .set("Cookie", ["auth=test-token"])
      .send(dto)
      .expect(201);

    await request(app.getHttpServer())
      .post("/shorten")
      .set("Cookie", ["auth=test-token"])
      .send(dto)
      .expect(400);
  });
});
