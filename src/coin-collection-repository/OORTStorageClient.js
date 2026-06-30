import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  // ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { OortError } from "../coin-collection-exception/CoinCollectionError";
export class OORTStorageClient {
  constructor(accessKey, secretKey, bucket) {
    this.client = new S3Client({
      endpoint: "https://s3-standard.oortech.com",
      region: "us-east-1",
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
      forcePathStyle: true,
    });
    this.bucket = bucket || "myapp-main";
  }
  async getObject(key) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return await this.OORT(command);
  }

  async putObject(key, dataObject) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: JSON.stringify(dataObject),
      ContentType: "application/json",
    });
    return await this.OORT(command);
  }

  async deleteObject(key) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    const result = await this.OORT(command);
    return { ...result, key };
  }
  // async getFolderContents(prefix){
  //   const command = new ListObjectsV2Command({
  //     Bucket: this.bucket,
  //     Prefix: prefix
  //   })
  //   return await this.OORT(command).Contents || {}
  // }
  async OORT(command) {
    try {
      const res = await this.client.send(command);
      return res;
    } catch (error) {
      const operation = command.constructor.name;
      const key = command.input?.Key || "Unknown";
      const message = this.#getFriendlyMessage(error, operation, key);
      throw new OortError(message, error);
    }
  }
  #getFriendlyMessage(error, operation, key) {
    const map = {
      NoSuchKey: `Resource "${key}" not found`,
      AccessDenied: `Permission denied for "${key}"`,
      NoSuchBucket: "Storage bucket not found",
      SlowDown: "Too many requests, please try again later",
    };
    return map[error.name] || `${operation} failed for "${key}"`;
  }
}
