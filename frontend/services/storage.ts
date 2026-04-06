import instance from "@/lib/api";
import { PresignBody } from "@/types/storage";

class StorageService {
  async getPresignUrl(data: PresignBody) {
    return await instance.post(`/storage/presign`, data);
  }
}

const storageService = new StorageService();
export default storageService;
