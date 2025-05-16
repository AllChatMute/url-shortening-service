import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { UsersService } from "../../../modules/users/users.service";
import { HashService } from "../../../services/hash/hash.service";
import { AuthService } from "../auth.service";
import { Response } from "express";
import { BadRequestException, UnauthorizedException } from "@nestjs/common";

const token = { accessToken: "test_token" };
const user = { email: "email", password: "password" };
const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  cookie: jest.fn().mockReturnThis(),
} as unknown as Response;

describe("AuthController", () => {
  let authService: AuthService;
  let usersService: UsersService;
  let hashService: HashService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            signIn: jest.fn().mockResolvedValue(token),
            signUp: jest.fn().mockResolvedValue(token),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn().mockResolvedValue(user),
            isExists: jest.fn().mockResolvedValue(false),
          },
        },
        {
          provide: HashService,
          useValue: {
            compare: jest.fn().mockResolvedValue(true),
          },
        },
        JwtService,
        ConfigService,
        HashService,
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
    usersService = moduleRef.get(UsersService);
    hashService = moduleRef.get(HashService);
  });

  it("should be defined", () => {
    expect(authService).toBeDefined();
  });

  it("should return accessToken in signUp and signIn", async () => {
    expect(await authService.signIn(user, mockResponse)).toEqual(token);

    expect(await authService.signUp(user, mockResponse)).toEqual(token);
  });

  it("should throw 401 if user not found", async () => {
    jest.spyOn(usersService, "findOne").mockResolvedValue(null);
    jest
      .spyOn(authService, "signIn")
      .mockRejectedValue(new UnauthorizedException());

    await expect(
      authService.signIn(
        { email: "invalid", password: "invalid" },
        mockResponse
      )
    ).rejects.toThrow(UnauthorizedException);
  });

  it("should throw 401 if password doesn't compare", async () => {
    jest.spyOn(hashService, "compare").mockResolvedValue(false);
    jest
      .spyOn(authService, "signIn")
      .mockRejectedValue(new UnauthorizedException());

    await expect(
      authService.signIn({ email: "email", password: "invalid" }, mockResponse)
    ).rejects.toThrow(UnauthorizedException);
  });

  it("should throw 400 if user exists", async () => {
    jest.spyOn(usersService, "isExists").mockResolvedValue(true);
    jest
      .spyOn(authService, "signUp")
      .mockRejectedValue(new BadRequestException());

    await expect(authService.signUp(user, mockResponse)).rejects.toThrow(
      BadRequestException
    );
  });
});
