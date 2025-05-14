import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ShortenService } from "./shorten.service";
import { CreateUrlDto } from "./Dto/createUrlDto";
import { ValidateUrlPipe } from "src/pipes/validateUrl.pipe";
import { AuthGuard } from "src/guards/auth.guard";

@Controller("shorten")
export class ShortenController {
  constructor(private readonly shortenService: ShortenService) {}

  @Get(":shortCode")
  getUrl(@Param("shortCode") shortCode: string) {
    return this.shortenService.findByShortCode(shortCode);
  }

  @UseGuards(AuthGuard)
  @Get(":shortCode/stats")
  getUrlStatistics(@Param("shortCode") shortCode: string) {
    return this.shortenService.getUrlStatistics(shortCode);
  }

  @UseGuards(AuthGuard)
  @Post()
  createShortUrl(@Body(ValidateUrlPipe) createUrlDto: CreateUrlDto) {
    return this.shortenService.createUrl(createUrlDto);
  }

  @UseGuards(AuthGuard)
  @Patch(":shortCode")
  updateShortUrl(
    @Body(ValidateUrlPipe) createUrlDto: CreateUrlDto,
    @Param("shortCode") shortCode: string
  ) {
    return this.shortenService.updateShortUrl(createUrlDto, shortCode);
  }

  @UseGuards(AuthGuard)
  @HttpCode(204)
  @Delete(":shortCode")
  deleteShortUrl(@Param("shortCode") shortCode: string) {
    return this.shortenService.deleteShortUrl(shortCode);
  }
}
