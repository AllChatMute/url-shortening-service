import { Body, Controller, Get, Post } from "@nestjs/common";
import { ShortenService } from "./shorten.service";
import { CreateUrlDto } from "./Dto/createUrlDto";

@Controller("shorten")
export class ShortenController {
  constructor(private readonly shortenService: ShortenService) {}

  @Get()
  getAll() {
    return this.shortenService.findAll();
  }

  @Post()
  createShortUrl(@Body() createUrlDto: CreateUrlDto) {
    return this.shortenService.createUrl(createUrlDto);
  }
}
