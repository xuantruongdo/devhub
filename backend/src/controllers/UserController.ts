import {
  JsonController,
  Post,
  Body,
  Res,
  Req,
  Get,
  CurrentUser,
  Param,
} from "routing-controllers";
import { Service } from "typedi";
import { UserService } from "../services/UserService";
import { LoginDto, RegisterDto } from "../dtos/UserDto";
import { Request, Response } from "express";
import { Public } from "../decorators/public.route.decorator";
import { UserProps } from "../types/auth";

@Service()
@JsonController("/users")
export class UserController {
  constructor(private userService: UserService) {}

  @Public()
  @Post("/register")
  async register(@Body({ validate: true }) body: RegisterDto) {
    await this.userService.register(body);
    return { success: true };
  }

  @Public()
  @Post("/login")
  async login(@Body({ validate: true }) body: LoginDto, @Res() res: Response) {
    return await this.userService.login(body, res);
  }

  @Get("/current")
  async getCurrent(@CurrentUser() user: UserProps) {
    return user;
  }

  @Get("/:username")
  async findByUsername(
    @Param("username") username: string,
    @CurrentUser() user: UserProps,
  ) {
    return await this.userService.findByUsername(username, user);
  }

  @Public()
  @Post("/refresh")
  async refresh(@Req() req: Request, @Res() res: Response) {
    return await this.userService.refresh(req, res);
  }

  @Post("/logout")
  async logout(@Req() req: Request, @Res() res: Response) {
    return await this.userService.logout(req, res);
  }
}
