import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { lambdaHandler } from '../../delete';
import { defaultEvent } from '../helpers';
import { dynamoDBClient } from '../../aws-services/dynamodb';
import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { NFT_TABLE_NAME } from '../../config';

describe('Unit test for delete handler', function () {
    const id = '1';
    it('create todo for delete test', async () => {
        const body = {
            id,
            name: 'Something',
            description: 'something great',
            image: 'https://'
        };

        const output = await dynamoDBClient.send(new PutItemCommand({
            TableName: NFT_TABLE_NAME,
            Item: {
                id: { S: id },
                title: { S: body.name },
                description: { S: body.description },
                image: { S: body.image }
            }
        }));

        expect(output.$metadata.httpStatusCode).toEqual(200);
    });

    it('verifies successful response of delete lambda', async () => {
        const event: APIGatewayProxyEvent = {
            ...defaultEvent,
            httpMethod: 'delete',
            pathParameters: { id },
            requestContext: {
                ...defaultEvent.requestContext,
                httpMethod: 'delete'
            }
        };
        const result: APIGatewayProxyResult = await lambdaHandler(event);

        expect(result.statusCode).toEqual(200);
        expect(JSON.parse(result.body)).toMatchObject({ id });
    });

    it('verifies unsuccessful response of delete lambda', async () => {
        const event: APIGatewayProxyEvent = {
            ...defaultEvent,
            httpMethod: 'delete',
            requestContext: {
                ...defaultEvent.requestContext,
                httpMethod: 'delete'
            }
        };
        const result: APIGatewayProxyResult = await lambdaHandler(event);

        expect(result.statusCode).toEqual(422);
        expect(JSON.parse(result.body)).toMatchObject([{
            code: 'invalid_type',
            expected: 'string',
            received: 'undefined',
            message: 'Required'
        }]);
    });
});