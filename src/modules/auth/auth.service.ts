import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { CreateUserDto } from "./dto/createUserDto";
import { Response } from "express";

import { JwtService } from "@nestjs/jwt";
import { User } from "src/schemas/user.schema";
import { HashService } from "src/services/hash/hash.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly hashService: HashService
  ) {}

  async signIn(
    createUserDto: CreateUserDto,
    response: Response
  ): Promise<{ accessToken: string }> {
    const user = await this.usersService.findOne(createUserDto.email);

    if (
      !user ||
      !(await this.hashService.compare(createUserDto.password, user?.password))
    ) {
      throw new UnauthorizedException();
    }
    return await this.generateAuthCookie(user, response);
  }

  async signUp(user: CreateUserDto, response: Response) {
    if (await this.usersService.isExists(user.email)) {
      throw new BadRequestException("User already exists");
    }
    const userToCreate = {
      email: user.email,
      password: await this.hashService.hash(user.password),
    };

    try {
      await this.usersService.create(userToCreate);
      return this.generateAuthCookie(user, response);
    } catch {
      throw new InternalServerErrorException("Failed to register");
    }
  }

  private async generateAuthCookie(
    user: User,
    response: Response
  ): Promise<{ accessToken: string }> {
    const accessToken = await this.jwtService.signAsync(user);

    response.cookie("auth", accessToken, {
      maxAge: 1000 * 60 * 15,
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return { accessToken };
  }
}
