import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { BUCKET, REGION } from "../config";

const s3Client = new S3Client({ region: REGION });

export const getJSONFile = async <T>(key: string): Promise<T> => {
    const { Body } = await s3Client.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
    const body = await Body?.transformToString();
    return JSON.parse(body as string) as T;
};

export const getFile = async (key: string) => s3Client.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));