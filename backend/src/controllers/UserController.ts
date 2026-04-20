import {
  JsonController,
  Post,
  Body,
  Res,
  Req,
  Get,
  CurrentUser,
  Param,
  Put,
  QueryParam,
  Delete,
  Authorized,
} from "routing-controllers";
import { Service } from "typedi";
import { UserService } from "../services/UserService";
import {
  LoginDto,
  LoginWithGoogleDto,
  RegisterDto,
  UpdateMediaDto,
  UpdateUserDto,
  VerifyEmailDto,
} from "../dtos/UserDto";
import { Request, Response } from "express";
import { Public } from "../decorators/public.route.decorator";
import { UserProps } from "../types/auth";
import { FollowType } from "../constants";
import { UserRole } from "../entities/User";

@Service()
@JsonController("/users")
export class UserController {
  constructor(private userService: UserService) {}

  @Public()
  @Post("/register")
  async register(@Body() body: RegisterDto) {
    await this.userService.register(body);
    return { success: true };
  }

  @Public()
  @Post("/login")
  async login(@Body() body: LoginDto, @Res() res: Response) {
    return await this.userService.login(body, res);
  }

  @Public()
  @Post("/verify-email")
  async verifyEmail(@Body() body: VerifyEmailDto) {
    return await this.userService.verifyEmail(body);
  }

  @Public()
  @Post("/google")
  async loginWithGoogle(
    @Body() body: LoginWithGoogleDto,
    @Res() res: Response,
  ) {
    return await this.userService.loginWithGoogle(body, res);
  }

  @Get("/current")
  async getCurrent(@CurrentUser() user: UserProps) {
    return user;
  }

  @Get("/search")
  async search(
    @QueryParam("q") q: string,
    @QueryParam("from") from: number = 0,
    @QueryParam("size") size: number = 20,
    @QueryParam("verified") verified?: string,
  ) {
    if (!q || !q.trim()) {
      return {
        hits: [],
        total: 0,
        took: 0,
      };
    }

    return this.userService.search(
      q,
      Number(from) || 0,
      Number(size) || 20,
      verified === undefined ? undefined : verified === "true",
    );
  }

  @Get("/suggest")
  async suggest(@CurrentUser() user: UserProps) {
    return await this.userService.suggest(user);
  }

  @Get("/:username")
  async findByUsername(
    @Param("username") username: string,
    @CurrentUser() user: UserProps,
  ) {
    return await this.userService.findByUsername(username, user);
  }

  @Public()
  @Get("/metadata/:username")
  async findMetadata(@Param("username") username: string) {
    return await this.userService.findMetadata(username);
  }

  @Get("/:username/posts")
  async findPostsByUsername(
    @Param("username") username: string,
    @CurrentUser() user: UserProps,
  ) {
    return await this.userService.findPostsByUsername(username, user);
  }

  @Post("/follow/:targetUserId")
  async follow(
    @Param("targetUserId") targetUserId: number,
    @CurrentUser() user: UserProps,
  ) {
    return await this.userService.toggleFollow(targetUserId, user);
  }

  @Get("/:id/follow/:followType")
  async getListFollow(
    @Param("id") id: number,
    @Param("followType") followType: FollowType,
    @CurrentUser() user: UserProps,
  ) {
    return await this.userService.getListFollow(id, followType, user);
  }

  @Get()
  async getAll(
    @QueryParam("page") page: number,
    @QueryParam("limit") limit: number,
    @QueryParam("search") search: string,
  ) {
    return this.userService.getAllUsers(+page, +limit, search);
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

  @Put("/:id")
  async update(
    @Param("id") id: number,
    @Body() body: UpdateUserDto,
    @CurrentUser() user: UserProps,
    @Res() res: Response,
  ) {
    return await this.userService.update(id, body, user, res);
  }

  @Put("/:id/media")
  async updateMedia(
    @Param("id") id: number,
    @Body() body: UpdateMediaDto,
    @CurrentUser() user: UserProps,
    @Res() res: Response,
  ) {
    return await this.userService.updateMedia(id, body, user, res);
  }

  @Authorized([UserRole.ADMIN])
  @Delete("/:id")
  async remove(@Param("id") id: number, @CurrentUser() user: UserProps) {
    return await this.userService.remove(id, user);
  }
}
