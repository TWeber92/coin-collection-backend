import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  //   ListObjectsV2Command,
} from "@aws-sdk/client-s3";
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
    console.log(!!accessKey, !!secretKey, "in bucket:", this.bucket);
  }

  async putObject(key, dataObject) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: JSON.stringify(dataObject),
      ContentType: "application/json",
    });
    await this.client.send(command);
  }

  async getObject(key) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return await this.client.send(command);
  }

  async deleteObject(key) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    await this.client.send(command);
    return { success: true, key };
  }
}
