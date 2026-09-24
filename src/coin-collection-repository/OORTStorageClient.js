import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  // ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { XMLParser } from "fast-xml-parser";
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
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    const res = await this.OORT(command);
    const text = await res.Body.transformToString();
    return JSON.parse(text);
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
  async putObjectIfAbsent(key, dataObject) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: JSON.stringify(dataObject),
      ContentType: "application/json",
      IfNoneMatch: "*",
    });
    return await this.OORT(command);
  }
  async OORT(command) {
    try {
      const res = await this.client.send(command);
      return res;
    } catch (error) {
      const operation = command.constructor.name;
      const code = error.Code;
      const key = error.Key;
      const status = error.$metadata?.httpStatusCode;
      if (code) {
        const message = this.#getFriendlyMessage(code, operation, key);
        console.log(message);
        
        throw new OortError(message, error, code, status);
      }
      if (error.$responseBodyText) {
        const parser = new XMLParser();
        const parsed = parser.parse(error.$responseBodyText);
        const parsedCode = parsed?.Error?.Code;
        const parsedKey = parsed?.Error?.Key;
        const message = this.#getFriendlyMessage(
          parsedCode,
          operation,
          parsedKey,
        );
        throw new OortError(message, parsed.Error, parsedCode, status);
      }
      throw new OortError(`${operation} failed: ${error.message}`, error, status);
    }
  }
  #getFriendlyMessage(code, operation, key) {
    const map = {
      NoSuchKey: `Resource "${key}" not found`,
      AccessDenied: `Permission denied for "${key}"`,
      NoSuchBucket: "Storage bucket not found",
      SlowDown: "Too many requests, please try again later",
      NoSuchObjectStat: `Object path: ${key} does not exist`,
      PreconditionFailed: `Resource "${key}" already exists`,
    };
    return `${operation}: ${map[code] || `failed for "${key}"`}`;
  }
}
