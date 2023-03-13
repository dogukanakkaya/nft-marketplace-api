import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ALLOW_ORIGIN, NFT_TABLE_NAME } from './config';
import { z } from 'zod';
import { handleError } from './helpers';
import { dynamoDBClient } from './aws-services/dynamodb';
import { DeleteItemCommand } from '@aws-sdk/client-dynamodb';

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const id = z.string().parse(event.pathParameters?.id);

        await dynamoDBClient.send(new DeleteItemCommand({
            TableName: NFT_TABLE_NAME,
            Key: {
                id: { S: id }
            }
        }));

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": ALLOW_ORIGIN,
                "Access-Control-Allow-Methods": "DELETE,OPTIONS",
            },
            body: JSON.stringify({ id }),
        };
    } catch (err: any) {
        console.log(err);
        return handleError(err);
    }
};
