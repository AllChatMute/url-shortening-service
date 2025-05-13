import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateUserDto } from "src/auth/dto/createUserDto";
import { User } from "src/schemas/user.schema";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>
  ) {}

  async findOne(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).lean();
  }

  async create(user: CreateUserDto): Promise<User> {
    return this.userModel.insertOne(user);
  }

  async isExists(email: string): Promise<boolean> {
    if (await this.userModel.findOne({ email })) return true;
    return false;
  }
}
