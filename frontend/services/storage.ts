import instance from "@/lib/api";
import { BaseService } from "./base";
import { PresignBody } from "@/types/storage";

class StorageService extends BaseService {
  constructor() {
    super("/storage");
  }

  async getPresignUrl(data: PresignBody) {
    return await instance.post(`/storage/presign`, data);
  }
}

const storageService = new StorageService();
export default storageService;
