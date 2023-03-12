import { APIGatewayProxyResult } from 'aws-lambda';
import { NFT } from './types';
import { ALLOW_ORIGIN, NULL_ADDRESS } from './config';
import { handleError } from './helpers';
import { getJSONFile } from './aws-services/s3';

export const lambdaHandler = async (): Promise<APIGatewayProxyResult> => {
    try {
        const nfts = await getJSONFile<NFT[]>('data.json');
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
        return handleError(err);
    }
};
