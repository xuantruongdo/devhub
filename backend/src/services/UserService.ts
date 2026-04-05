import { Service } from "typedi";
import { UserRepo } from "../repositories/UserRepo";
import bcrypt from "bcrypt";
import { LoginDto, RegisterDto } from "../dtos/UserDto";
import { BadRequestError, UnauthorizedError } from "routing-controllers";
import { generateUsername } from "../libs/utils";
import { JwtService } from "./JwtService";
import { Request, Response } from "express";
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

      const user = await this.userRepo.create({
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

      const payload = {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified,
      };
      const accessToken = this.jwtService.signAccessToken(payload);
      const refreshToken = this.jwtService.signRefreshToken(payload);

      user.refreshToken = refreshToken;
      user.lastLogin = new Date();
      await this.userRepo.update(user.id, {
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

  async refresh(req: Request, res: Response) {
    try {
      const token = req.cookies.refreshToken;
      if (!token) {
        throw new UnauthorizedError(AuthCodeError.MISSING_REFRESH_TOKEN);
      }

      const payload = this.jwtService.verifyRefreshToken(token);

      const user = await this.userRepo.findById(payload.id, {
        includeRefreshToken: true,
      });

      if (!user || user.refreshToken !== token) {
        throw new UnauthorizedError(AuthCodeError.INVALID_REFRESH_TOKEN);
      }

      if (!user.isActive) {
        throw new BadRequestError(AuthCodeError.ACCOUNT_DEACTIVATED);
      }

      // Rotate refresh token — cấp token mới mỗi lần refresh
      const newPayload = {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified,
      };
      const newAccessToken = this.jwtService.signAccessToken(newPayload);
      const newRefreshToken = this.jwtService.signRefreshToken(newPayload);

      await this.userRepo.update(user.id, {
        refreshToken: newRefreshToken,
      });

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
      });

      return { accessToken: newAccessToken };
    } catch (error: any) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      throw new UnauthorizedError(error.message);
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const token = req.cookies.refreshToken;

      if (token) {
        // Xóa refreshToken trong DB — vô hiệu hóa token ngay lập tức
        const payload = this.jwtService.verifyRefreshToken(token);
        await this.userRepo.update(payload.id, { refreshToken: undefined });
      }

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return { success: true };
    } catch (error: any) {
      throw new BadRequestError(error.message);
    }
  }
}
