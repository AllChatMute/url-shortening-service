import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { CreateUrlDto } from "src/shorten/Dto/createUrlDto";

@Injectable()
export class ValidateUrlPipe implements PipeTransform {
  transform(value: CreateUrlDto) {
    const { url } = value;
    if (!this.isUrlValid(url)) throw new BadRequestException("Invalid url");

    return value;
  }

  private isUrlValid(url: string) {
    const urlRegex =
      /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;

    return urlRegex.test(url);
  }
}
