import { Service } from "typedi";
import { UserRepo } from "../repositories/UserRepo";
import bcrypt from "bcrypt";
import {
  LoginDto,
  RegisterDto,
  UpdateMediaDto,
  UpdateUserDto,
} from "../dtos/UserDto";
import { BadRequestError, UnauthorizedError } from "routing-controllers";
import { generateUsername } from "../libs/utils";
import { JwtService } from "./JwtService";
import { Request, Response } from "express";
import { AuthCodeError, UserCodeError } from "../constants/code";
import { UserProps } from "../types/auth";
import { PostRepo } from "../repositories/PostRepo";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";

@Service()
export class UserService {
  constructor(
    private readonly userRepo: UserRepo,
    private readonly postRepo: PostRepo,
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

  async update(
    id: number,
    data: UpdateUserDto,
    currentUser: UserProps,
    res: Response,
  ) {
    try {
      const user = await this.userRepo.findById(id);
      if (!user) throw new BadRequestError(UserCodeError.USER_NOT_FOUND);
      if (user.id !== currentUser.id)
        throw new BadRequestError(UserCodeError.NO_PERMISSION_TO_UPDATE);

      Object.assign(user, data);

      const updatedUser = await this.userRepo.save(user);

      const payload = {
        id: updatedUser.id,
        username: updatedUser.username,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        isVerified: updatedUser.isVerified,
      };
      const accessToken = this.jwtService.signAccessToken(payload);
      const refreshToken = this.jwtService.signRefreshToken(payload);

      updatedUser.refreshToken = refreshToken;
      await this.userRepo.update(updatedUser.id, { refreshToken });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return { user: updatedUser, accessToken };
    } catch (error: any) {
      throw new BadRequestError(error.message);
    }
  }

  async updateMedia(
    id: number,
    data: UpdateMediaDto,
    currentUser: UserProps,
    res: Response,
  ) {
    try {
      const user = await this.userRepo.findById(id);
      if (!user) throw new BadRequestError(UserCodeError.USER_NOT_FOUND);

      if (user.id !== currentUser.id)
        throw new BadRequestError(UserCodeError.NO_PERMISSION_TO_UPDATE);

      const updatedUser = await this.userRepo.save(Object.assign(user, data));

      const payload = {
        id: updatedUser.id,
        username: updatedUser.username,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        isVerified: updatedUser.isVerified,
      };
      const accessToken = this.jwtService.signAccessToken(payload);
      const refreshToken = this.jwtService.signRefreshToken(payload);

      updatedUser.refreshToken = refreshToken;
      await this.userRepo.update(updatedUser.id, { refreshToken });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return { user: updatedUser, accessToken };
    } catch (error: any) {
      throw new BadRequestError(error.message);
    }
  }

  async findByUsername(username: string, user: UserProps) {
    try {
      return this.userRepo.findByUsername(username, user.id);
    } catch (error: any) {
      throw new BadRequestError(error.message);
    }
  }

  async findPostsByUsername(username: string, user: UserProps) {
    try {
      return this.postRepo.findPostsByUsername(username, user.id);
    } catch (error: any) {
      throw new BadRequestError(error.message);
    }
  }

  async toggleFollow(targetUserId: number, currentUserId: number) {
    return await AppDataSource.transaction(async (manager) => {
      if (currentUserId === targetUserId) {
        throw new BadRequestError(UserCodeError.CANNOT_FOLLOW_YOURSELF);
      }

      const currentUser = await manager.findOne(User, {
        where: { id: currentUserId },
        relations: ["followings"],
      });
      const targetUser = await manager.findOne(User, {
        where: { id: targetUserId },
        relations: ["followers"],
      });

      if (!currentUser || !targetUser) {
        throw new BadRequestError(UserCodeError.USER_NOT_FOUND);
      }

      const isFollowing = currentUser.followings.some(
        (u) => u.id === targetUserId,
      );

      if (isFollowing) {
        currentUser.followings = currentUser.followings.filter(
          (u) => u.id !== targetUserId,
        );
        await manager.save(currentUser);

        const updatedTarget = await manager.decrement(
          User,
          { id: targetUserId },
          "followerCount",
          1,
        );
        await manager.decrement(
          User,
          { id: currentUserId },
          "followingCount",
          1,
        );

        return {
          following: false,
          followerCount:
            (updatedTarget.raw?.affectedRows ?? targetUser.followerCount) - 1,
        };
      } else {
        currentUser.followings.push(targetUser);
        await manager.save(currentUser);

        const updatedTarget = await manager.increment(
          User,
          { id: targetUserId },
          "followerCount",
          1,
        );
        await manager.increment(
          User,
          { id: currentUserId },
          "followingCount",
          1,
        );

        return {
          following: true,
          followerCount:
            (updatedTarget.raw?.affectedRows ?? targetUser.followerCount) + 1,
        };
      }
    });
  }
}
