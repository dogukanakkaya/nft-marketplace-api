import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import fs from 'node:fs/promises';
import cors from 'cors';
import Bundlr from "@bundlr-network/client";
import { NFT } from './types';
import { JWKInterface } from 'arweave/node/lib/wallet';
import { createId } from './helper';
import { DATA_FILE } from './config';

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('static'));
app.use(async (_, __, next) => {
    const nfts = JSON.parse(await fs.readFile(DATA_FILE, 'utf8')) as NFT[];
    const jwk = JSON.parse(await fs.readFile('jwk.json', 'utf8')) as JWKInterface;
    app.locals = { nfts, jwk };
    next();
});

app
    .get('/', async (req, res) => {
        const url = `${req.protocol}://${req.get('host')}`;
        const { nfts } = app.locals as Locals;

        const data = nfts.map(nft => {
            const image = nft.tokenURI ? nft.image : `${url}/${nft.image}`

            return { ...nft, image, ownedBy: "0x0000000000000000000000000000000000000000" };
        });

        return res.json(data);
    })
    .post('/premint', async (req, res) => {
        const { id } = req.body;
        const { nfts, jwk } = app.locals as Locals;
        const bundlr = new Bundlr("http://node2.bundlr.network", "arweave", jwk);

        const idx = nfts.findIndex(nft => nft.id === id);
        if (idx === -1) return res.json({ status: false });

        if (nfts[idx].tokenURI) {
            return res.json({
                url: nfts[idx].tokenURI,
                name: nfts[idx].name,
                id: createId(nfts[idx].tokenURI, nfts[idx].name)
            });
        }

        const imagePath = `./static/${nfts[idx].image}`;

        // fund the bundlr with the price needed for file
        const { size } = await fs.stat(imagePath);
        const price = await bundlr.getPrice(size);
        await bundlr.fund(price);

        // upload image
        const { id: imageId } = await bundlr.uploadFile(imagePath);

        // upload metadata json
        const metadata = { ...nfts[idx], image: `https://arweave.net/${imageId}` };
        const { id: metadataId } = await bundlr.upload(JSON.stringify(metadata), {
            tags: [{ name: "Content-Type", value: "application/json" }]
        });

        // update the nft data and write to file again
        nfts[idx].image = metadata.image;
        nfts[idx].tokenURI = `https://arweave.net/${metadataId}`;
        await fs.writeFile(DATA_FILE, JSON.stringify(nfts));

        return res.json({
            url: nfts[idx].tokenURI,
            name: nfts[idx].name,
            // create the hash to validate if this is a valid NFT belongs to this project, add description too to the hash
            // also edit the Contract if description is added. Unnecessary for test app
            id: createId(nfts[idx].tokenURI, nfts[idx].name)
        });
    })
    .delete('/', async (req, res) => {
        const { id } = req.body;
        const { nfts } = app.locals as Locals;

        const data = nfts.filter(nft => nft.id !== id);
        await fs.writeFile(DATA_FILE, JSON.stringify(data));

        return res.json({ status: true });
    });

app.listen(process.env.PORT || 8000);

interface Locals {
    nfts: NFT[];
    jwk: JWKInterface;
}