import { APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { NFT } from './types';
import { ALLOW_ORIGIN, NULL_ADDRESS, REGION } from './config';

const client = new S3Client({ region: REGION });

export const lambdaHandler = async (): Promise<APIGatewayProxyResult> => {
    try {
        const { Body } = await client.send(new GetObjectCommand({ Bucket: 'lazy-camp', Key: 'data.json' }));
        const body = await Body?.transformToString();
        const nfts = JSON.parse(body as string) as NFT[];

        const data = nfts.map(nft => ({ ...nft, ownedBy: NULL_ADDRESS }));

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": ALLOW_ORIGIN,
                "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
            },
            body: JSON.stringify(data)
        };
    } catch (err: any) {
        console.log(err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: err.message
            })
        };
    }
};
