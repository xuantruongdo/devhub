import { Service } from "typedi";
import { UserRepo } from "../repositories/UserRepo";
import bcrypt from "bcrypt";
import { RegisterDto } from "../dtos/UserDto";
import { BadRequestError } from "routing-controllers";

@Service()
export class UserService {
  constructor(private readonly userRepo: UserRepo) {}

  async register(data: RegisterDto) {
    try {
      const existingUser = await this.userRepo.findByEmail(data.email);
      if (existingUser) {
        throw new BadRequestError("Email already exists");
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);

      const user = await this.userRepo.createUser({
        fullName: data.fullName,
        email: data.email,
        password: hashedPassword,
      });

      const { password, ...rest } = user;
      return rest;
    } catch (error: any) {
      throw new BadRequestError(error.message);
    }
  }
}
