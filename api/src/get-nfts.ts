import { APIGatewayProxyResult } from 'aws-lambda';
import { ScanCommand } from "@aws-sdk/client-dynamodb";
import { ALLOW_ORIGIN, NFT_TABLE_NAME, NULL_ADDRESS } from './config';
import { handleError } from './helpers';
import { dynamoDBClient } from './aws-services/dynamodb';

export const lambdaHandler = async (): Promise<APIGatewayProxyResult> => {
    try {
        const { Items } = await dynamoDBClient.send(new ScanCommand({ TableName: NFT_TABLE_NAME }));

        const data = Items?.map((item) => ({
            id: item.id.S,
            name: item.name.S,
            description: item.description.S,
            image: item.image.S,
            ...(item.attributes ? { attributes: JSON.parse(item.attributes.S) } : {}),
            ownedBy: NULL_ADDRESS
        }));

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
