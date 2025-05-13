import { JwtService } from "@nestjs/jwt";
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import { ConfigService } from "@nestjs/config";
import { User } from "src/schemas/user.schema";

interface AuthRequest extends Request {
  cookies: {
    auth?: string;
  };
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: AuthRequest = context.switchToHttp().getRequest();
    const token = request.cookies["auth"];
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload: User = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get("SECRET_KEY"),
      });

      request["user"] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }
}
