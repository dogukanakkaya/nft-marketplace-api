import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { lambdaHandler } from '../../premint';
import { defaultEvent } from '../helpers';

describe('Unit test for create handler', function () {
    it('verifies successful response of create lambda', async () => {
        const requestBody = {
            id: 'fjh84psyxoilfrq12vjpts21'
        };

        const event: APIGatewayProxyEvent = {
            ...defaultEvent,
            httpMethod: 'post',
            body: JSON.stringify(requestBody),
            requestContext: {
                ...defaultEvent.requestContext,
                httpMethod: 'post'
            }
        };
        const result: APIGatewayProxyResult = await lambdaHandler(event);

        const body = JSON.parse(result.body);

        expect(result.statusCode).toEqual(200);
        expect(body).toHaveProperty('id');
        expect(body).toHaveProperty('url');
        expect(body).toHaveProperty('name');
    });
});