import { JsonController, Post, Body, Res } from "routing-controllers";
import { Service } from "typedi";
import { UserService } from "../services/UserService";
import { LoginDto, RegisterDto } from "../dtos/UserDto";
import { Response } from "express";

@Service()
@JsonController("/users")
export class UserController {
  constructor(private userService: UserService) {}

  @Post("/register")
  async register(@Body({ validate: true }) body: RegisterDto) {
    await this.userService.register(body);
    return { success: true };
  }

  @Post("/login")
  async login(@Body({ validate: true }) body: LoginDto, @Res() res: Response) {
    return await this.userService.login(body, res);
  }
}
