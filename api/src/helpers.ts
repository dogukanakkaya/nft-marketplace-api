import { APIGatewayProxyResult } from "aws-lambda";
import { z } from "zod";
import createKeccakHash from 'keccak';

export const handleError = (err: any): APIGatewayProxyResult => {
    if (err instanceof z.ZodError) {
        return {
            statusCode: 422,
            body: JSON.stringify(err.issues),
        };
    }

    return {
        statusCode: 500,
        body: JSON.stringify({ message: err.message }),
    };
}

export const createId = (...args: string[]) => {
    const hash = createKeccakHash('keccak256').update(args.join('') + 'NFT_METADATA_SECRET_TODO').digest('hex');
    return '0x' + hash;
};

export const createArweaveUrl = (id: string) => `https://arweave.net/${id}`;

