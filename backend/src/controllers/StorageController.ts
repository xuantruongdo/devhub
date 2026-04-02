import { Body, JsonController, Post } from "routing-controllers";
import { Service } from "typedi";
import { StorageService } from "../services/StorageService";
import { PresignBody } from "../types/storage";

@Service()
@JsonController("/storage")
export class StorageController {
  constructor(private storageService: StorageService) {}

  @Post("/presign")
  async getPresignedUrl(@Body() body: PresignBody) {
    const { fileName, fileType } = body;
    return await this.storageService.getPresignedUrl(fileName, fileType);
  }
}
