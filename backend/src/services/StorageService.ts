import AWS from "aws-sdk";
import { Service } from "typedi";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  region: process.env.AWS_REGION!,
});

@Service()
export class StorageService {
  async getPresignedUrl(
    fileName: string,
    fileType: string,
    expires = 60, // 60 giây
  ): Promise<string> {
    if (!fileName || !fileType) {
      throw new Error("Missing fileName or fileType");
    }

    const params: AWS.S3.PutObjectRequest = {
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: `images/${fileName}`,
      ContentType: fileType,
    };

    try {
      return await s3.getSignedUrlPromise("putObject", params);
    } catch (error) {
      console.error("[S3_ERROR]", error);
      throw new Error("Failed to generate presigned URL");
    }
  }
}
