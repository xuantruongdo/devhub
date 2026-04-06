import {
  IsDate,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from "class-validator";
import { MediaType } from "../constants";

export class RegisterDto {
  @IsNotEmpty({ message: "Full name is required" })
  fullName!: string;

  @IsEmail({}, { message: "Invalid email format" })
  email!: string;

  @MinLength(6, { message: "Password must be at least 6 characters" })
  password!: string;
}

export class LoginDto {
  @IsEmail({}, { message: "Invalid email format" })
  email!: string;

  @MinLength(6, { message: "Password must be at least 6 characters" })
  password!: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: "Full name must be a string" })
  fullName?: string;

  @IsOptional()
  @IsString({ message: "Avatar must be a string" })
  avatar?: string;

  @IsOptional()
  @IsString({ message: "Bio must be a string" })
  bio?: string;

  @IsOptional()
  @IsUrl({}, { message: "Website must be a valid URL" })
  website?: string;

  @IsOptional()
  @IsString({ message: "Location must be a string" })
  location?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: "Birthday must be a valid ISO date string (YYYY-MM-DD)" },
  )
  birthday?: string;
}

export class UpdateMediaDto {
  @IsOptional()
  @IsString({ message: "Avatar must be a string URL" })
  avatar?: string;

  @IsOptional()
  @IsString({ message: "Cover must be a string URL" })
  cover?: string;
}
