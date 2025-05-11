import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type StatisticDocument = HydratedDocument<Statistic>;

@Schema()
export class Statistic {
  @Prop({ required: true, unique: true })
  url: string;

  @Prop({ required: true, unique: true })
  shortCode: string;

  @Prop({ required: true })
  accessCount: number;
}

export const StatisticSchema = SchemaFactory.createForClass(Statistic);
