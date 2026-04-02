import {
  IsOptional,
  IsString,
  IsEnum,
  IsArray,
  ArrayNotEmpty,
  IsInt,
  Min,
} from "class-validator";
import { PostVisibility } from "../entities/Post";

export class CreatePostDto {
  @IsOptional()
  @IsString({ message: "Content must be a string" })
  content?: string;

  @IsOptional()
  @IsArray({ message: "Images must be an array of strings" })
  @ArrayNotEmpty({ message: "Images array cannot be empty" })
  @IsString({ each: true, message: "Each image must be a string URL" })
  images?: string[];

  @IsOptional()
  @IsEnum(PostVisibility, {
    message: "Visibility must be one of public, friends, private",
  })
  visibility?: PostVisibility;

  @IsOptional()
  @IsInt({ message: "Shared post ID must be an integer" })
  @Min(1, { message: "Shared post ID must be greater than 0" })
  sharedPostId?: number;
}

export class UpdatePostDto extends CreatePostDto {}
