import { Service } from "typedi";
import { UserRepo } from "../repositories/UserRepo";
import bcrypt from "bcrypt";
import { LoginDto, RegisterDto } from "../dtos/UserDto";
import { BadRequestError, UnauthorizedError } from "routing-controllers";
import { generateUsername } from "../libs/utils";
import { JwtService } from "./JwtService";
import { Response } from "express";
import { AuthCodeError } from "../constants/code";

@Service()
export class UserService {
  constructor(
    private readonly userRepo: UserRepo,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: RegisterDto) {
    try {
      const existingUser = await this.userRepo.findByEmail(data.email);
      if (existingUser) {
        throw new BadRequestError(AuthCodeError.EMAIL_ALREADY_EXISTS);
      }

      const username = await generateUsername(data.fullName, this.userRepo);

      const hashedPassword = await bcrypt.hash(data.password, 10);

      const user = await this.userRepo.createUser({
        username,
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

  async login(data: LoginDto, res: Response) {
    try {
      const user = await this.userRepo.findByEmail(data.email);
      if (!user) {
        throw new UnauthorizedError(AuthCodeError.INVALID_CREDENTIALS);
      }

      const isMatch = await bcrypt.compare(data.password, user.password);
      if (!isMatch) {
        throw new UnauthorizedError(AuthCodeError.INVALID_CREDENTIALS);
      }

      if (!user.isActive) {
        throw new BadRequestError(AuthCodeError.ACCOUNT_DEACTIVATED);
      }

      const payload = { id: user.id, role: user.role };
      const accessToken = this.jwtService.signAccessToken(payload);
      const refreshToken = this.jwtService.signRefreshToken(payload);

      user.refreshToken = refreshToken;
      user.lastLogin = new Date();
      await this.userRepo.updateUser(user.id, {
        refreshToken: user.refreshToken,
        lastLogin: user.lastLogin,
      });

      const { password: _, refreshToken: __, ...userData } = user;

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
      });

      return { accessToken, user: userData };
    } catch (error: any) {
      throw new BadRequestError(error.message);
    }
  }
}
