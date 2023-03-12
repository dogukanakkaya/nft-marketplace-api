import { APIGatewayProxyResult } from "aws-lambda";
import { z } from "zod";
import createKeccakHash from 'keccak';
import { getSecret } from "./aws-services/secret-manager";

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

export const createId = async (...args: string[]) => {
    const { METADATA_SECRET } = await getSecret('metadata-secret');

    const hash = createKeccakHash('keccak256').update(args.join('') + METADATA_SECRET).digest('hex');
    return '0x' + hash;
};

export const createArweaveUrl = (id: string) => `https://arweave.net/${id}`;

