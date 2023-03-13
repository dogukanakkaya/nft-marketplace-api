import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ALLOW_ORIGIN, BUCKET, NFT_TABLE_NAME } from './config';
import { z } from 'zod';
import { createArweaveUrl, createId, handleError } from './helpers';
import Bundlr from "@bundlr-network/client";
import { Readable } from 'stream';
import { getSecret } from './aws-services/secret-manager';
import { s3Client } from './aws-services/s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { dynamoDBClient } from './aws-services/dynamodb';
import { GetItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

export const Validator = z.object({
    id: z.string()
});

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        if (!event.body) throw Error();
        const { id } = await Validator.parseAsync(JSON.parse(event.body));

        const { Item } = await dynamoDBClient.send(new GetItemCommand({
            TableName: NFT_TABLE_NAME,
            Key: {
                id: { S: id }
            }
        }));
        const nft = {
            id: Item.id.S,
            name: Item.name.S,
            description: Item.description.S,
            image: Item.image.S,
            ...(Item.attributes ? { attributes: JSON.parse(Item.attributes.S) } : {}),
            ...(Item.tokenURI ? { tokenURI: Item.tokenURI.S } : {}),
        };

        if (!nft) throw Error(`${id} is not found.`); // handle and return 404 if u care

        let response;
        if (nft.tokenURI) {
            response = {
                id: await createId(nft.tokenURI, nft.name),
                url: nft.tokenURI,
                name: nft.name
            };
        } else {
            const { jwk: jwkString } = await getSecret('jwk');
            const bundlr = new Bundlr('http://node2.bundlr.network', 'arweave', JSON.parse(jwkString));

            // upload image
            const { pathname } = new URL(nft.image);
            const [, ...key] = pathname.split('/');
            const { Body, ContentType, ContentLength } = await s3Client.send(new GetObjectCommand({ Bucket: BUCKET, Key: key.join('/') }));

            const { id: imageId } = await bundlr.upload(Body as Readable, {
                tags: [{ name: 'Content-Type', value: ContentType }]
            });
            nft.image = createArweaveUrl(imageId);

            // upload metadata json
            const { id: _, ...nftMetadata } = nft;
            const metadata = JSON.stringify(nftMetadata);

            const { id: metadataId } = await bundlr.upload(metadata, {
                tags: [{ name: 'Content-Type', value: 'application/json' }]
            });
            nft.tokenURI = createArweaveUrl(metadataId);

            // update the nft data so if user abandon transaction after files uploaded, reuse them and prevent reupload
            await dynamoDBClient.send(new UpdateItemCommand({
                TableName: NFT_TABLE_NAME,
                Key: {
                    id: { S: id }
                },
                UpdateExpression: 'set image = :image, tokenURI = :tokenURI',
                ExpressionAttributeValues: {
                    ':image': { S: nft.image },
                    ':tokenURI': { S: nft.tokenURI }
                }
            }));

            response = {
                // create the hash to validate if this is a valid NFT belongs to this project, add description too to the hash
                // also edit the Contract if description is added. Unnecessary for test app
                id: await createId(nft.tokenURI, nft.name),
                url: nft.tokenURI,
                name: nft.name
            };

            // // fund the bundlr with the price used for files so it doesn't run out
            const price = await bundlr.getPrice(ContentLength + metadata.length);
            await bundlr.fund(price);
        }

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": ALLOW_ORIGIN,
                "Access-Control-Allow-Methods": "POST,OPTIONS",
            },
            body: JSON.stringify(response)
        };
    } catch (err: any) {
        console.log(err);
        return handleError(err);
    }
};
