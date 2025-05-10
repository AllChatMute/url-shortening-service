import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type UrlDocument = HydratedDocument<Url>;

const urlRegex =
  /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;

@Schema()
export class Url {
  @Prop({ required: true, unique: true })
  id: number;

  @Prop({
    required: true,
    match: urlRegex,
  })
  url: string;

  @Prop({ required: true, unique: true })
  shortCode: string;

  @Prop({ required: true })
  createdAt: string;

  @Prop({ required: true })
  updatedAt: string;
}

export const UrlSchema = SchemaFactory.createForClass(Url);
