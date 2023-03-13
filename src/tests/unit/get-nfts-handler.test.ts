import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { lambdaHandler } from '../../get-nfts';
import { defaultEvent } from '../helpers';

describe('Unit test for get-nfts handler', function () {
    it('verifies successful response of get-nfts lambda', async () => {
        const event: APIGatewayProxyEvent = {
            ...defaultEvent
        };
        const result: APIGatewayProxyResult = await lambdaHandler(event);

        const body = JSON.parse(result.body);

        expect(result.statusCode).toEqual(200);
        expect(Array.isArray(body)).toBe(true);
        expect(body[0]).toHaveProperty('id');
        expect(body[0]).toHaveProperty('name');
        expect(body[0]).toHaveProperty('description');
        expect(body[0]).toHaveProperty('image');
        expect(body[0]).toHaveProperty('ownedBy');
    });
});