import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { ShortenService } from "./shorten.service";
import { CreateUrlDto } from "./Dto/createUrlDto";
import { ValidateUrlPipe } from "src/pipes/validateUrl.pipe";

@Controller("shorten")
export class ShortenController {
  constructor(private readonly shortenService: ShortenService) {}

  @Get(":shortCode")
  getAll(@Param("shortCode") shortCode: string) {
    return this.shortenService.findByShortCode(shortCode);
  }

  @Post()
  createShortUrl(@Body(ValidateUrlPipe) createUrlDto: CreateUrlDto) {
    return this.shortenService.createUrl(createUrlDto);
  }

  @Patch(":shortCode")
  updateShortUrl(
    @Body(ValidateUrlPipe) createUrlDto: CreateUrlDto,
    @Param("shortCode") shortCode: string
  ) {
    return this.shortenService.updateShortUrl(createUrlDto, shortCode);
  }
}
