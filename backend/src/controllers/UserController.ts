import { JsonController, Post, Body } from "routing-controllers";
import { Service } from "typedi";
import { UserService } from "../services/UserService";
import { RegisterDto } from "../dtos/UserDto";

@Service()
@JsonController("/users")
export class UserController {
  constructor(private userService: UserService) {}

  @Post("/register")
  async register(@Body({ validate: true }) body: RegisterDto) {
    await this.userService.register(body);

    return { success: true };
  }
}
