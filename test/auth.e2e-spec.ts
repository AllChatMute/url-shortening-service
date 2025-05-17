import { ConfigModule, ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { App } from "supertest/types";
import { AppModule } from "./../src/app.module";
import * as cookieParser from "cookie-parser";
import { Model } from "mongoose";
import { User, UserSchema } from "../src/schemas/user.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { CreateUserDto } from "../src/modules/auth/dto/createUserDto";
import { Response } from "express";

const dto: CreateUserDto = {
  email: "email@mail.com",
  password: "password",
};

describe("Auth (e2e)", () => {
  let app: INestApplication<App>;

  let userModel: Model<User>;

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
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(new ValidationPipe());
    app.use(cookieParser());

    await app.init();

    userModel = moduleFixture.get<Model<User>>("UserModel");
  });

  afterAll(async () => {
    await userModel.deleteMany({});
    await app.close();
  });

  it("POST /auth/register - should create user and return accessToken", async () => {
    const response = (await request(app.getHttpServer())
      .post("/auth/register")
      .send(dto)
      .expect(201)) as unknown as Response & { body: { accessToken: string } };

    expect(response.body).toHaveProperty("accessToken");
    expect(response.body.accessToken).toMatch(/^eyJ/);
  });

  it("POST /auth/login - should return accessToken", async () => {
    await request(app.getHttpServer()).post("/auth/register").send(dto);
    const response = (await request(app.getHttpServer())
      .post("/auth/login")
      .send(dto)
      .expect(200)) as unknown as Response & { body: { accessToken: string } };

    expect(response.body).toHaveProperty("accessToken");
    expect(response.body.accessToken).toMatch(/^eyJ/);
  });

  it("POST /auth/login - should throw 401 if user not found or password doesn't compare", async () => {
    await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: "invalid@email.com", password: "invalid" })
      .expect(401);
  });

  it("POST /auth/register - should throw 400 if user exists or invalid email", async () => {
    await request(app.getHttpServer()).post("/auth/register").send(dto);

    await request(app.getHttpServer())
      .post("/auth/register")
      .send(dto)
      .expect(400);

    await request(app.getHttpServer())
      .post("/auth/register")
      .send({ email: "invalid", password: "password" })
      .expect(400);
  });
});
