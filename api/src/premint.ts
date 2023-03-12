import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { NFT } from './types';
import { ALLOW_ORIGIN } from './config';
import { z } from 'zod';
import { createArweaveUrl, createId, handleError } from './helpers';
import Bundlr from "@bundlr-network/client";
import { Readable } from 'stream';
import { getSecret } from './aws-services/secret-manager';
import { getFile, getJSONFile } from './aws-services/s3';

export const Validator = z.object({
    id: z.string()
});

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        if (!event.body) throw Error();
        const { id } = await Validator.parseAsync(JSON.parse(event.body));

        const nfts = await getJSONFile<NFT[]>('data.json');

        const idx = nfts.findIndex(nft => nft.id === id);
        if (idx === -1) throw Error(`${id} is not found.`); // handle and return 404 if u care
        const nft = nfts[idx];

        let response;
        if (nft.tokenURI) {
            response = {
                url: nft.tokenURI,
                name: nft.name,
                id: createId(nft.tokenURI, nft.name)
            };
        } else {
            const { jwk: jwkString } = await getSecret('jwk');
            const bundlr = new Bundlr('http://node2.bundlr.network', 'arweave', JSON.parse(jwkString));

            // upload image
            const { pathname } = new URL(nft.image);
            const [, ...key] = pathname.split('/');
            const { Body, ContentType, ContentLength } = await getFile(key.join('/'));

            const { id: imageId } = await bundlr.upload(Body as Readable, {
                tags: [{ name: 'Content-Type', value: ContentType }]
            });
            nfts[idx].image = createArweaveUrl(imageId);

            // upload metadata json
            const { id: _, ...nftMetadata } = nft;
            const metadata = JSON.stringify({ ...nftMetadata, image: nfts[idx].image });

            const { id: metadataId } = await bundlr.upload(metadata, {
                tags: [{ name: 'Content-Type', value: 'application/json' }]
            });
            nfts[idx].tokenURI = createArweaveUrl(metadataId);

            // update the nft data and write to file again
            // await fs.writeFile(DATA_FILE, JSON.stringify(nfts));

            response = {
                url: nfts[idx].tokenURI,
                name: nfts[idx].name,
                // create the hash to validate if this is a valid NFT belongs to this project, add description too to the hash
                // also edit the Contract if description is added. Unnecessary for test app
                id: createId(nfts[idx].tokenURI, nfts[idx].name)
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
                "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
            },
            body: JSON.stringify(response)
        };
    } catch (err: any) {
        console.log(err);
        return handleError(err);
    }
};
