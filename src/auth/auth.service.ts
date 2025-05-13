import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { UsersService } from "src/users/users.service";
import { CreateUserDto } from "./dto/createUserDto";
import { Response } from "express";

import { JwtService } from "@nestjs/jwt";
import { User } from "src/schemas/user.schema";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async signIn(
    createUserDto: CreateUserDto,
    response: Response
  ): Promise<{ accessToken: string }> {
    const user = await this.usersService.findOne(createUserDto.email);

    if (user?.password !== createUserDto.password) {
      throw new UnauthorizedException();
    }

    return await this.generateAuthCookie(user, response);
  }

  async signUp(user: CreateUserDto, response: Response) {
    if (await this.usersService.isExists(user.email)) {
      throw new BadRequestException("User already exists");
    }

    try {
      await this.usersService.create(user);
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
