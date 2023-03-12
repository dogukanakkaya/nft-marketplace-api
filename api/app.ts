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
    .get('/nfts', async (req, res) => {
        const url = `${req.protocol}://${req.get('host')}`;
        const { nfts } = app.locals as Locals;

        const data = nfts.map(nft => {
            const image = nft.url ? nft.image : `${url}/${nft.image}`

            // create the hash to validate if this is a valid NFT belongs to this project
            const id = createId(nft.name);

            return { ...nft, image, id };
        });

        return res.json(data);
    })
    .post('/premint', async (req, res) => {
        const { id } = req.body;
        const { nfts, jwk } = app.locals as Locals;
        const bundlr = new Bundlr("http://node2.bundlr.network", "arweave", jwk);

        const idx = nfts.findIndex(nft => createId(nft.name) === id);

        if (nfts[idx].url) {
            return res.json({ url: nfts[idx].url });
        }

        const imagePath = `./static/${nfts[idx].image}`;

        const { size } = await fs.stat(imagePath);
        const price = await bundlr.getPrice(size);
        await bundlr.fund(price);

        const { id: imageId } = await bundlr.uploadFile(imagePath);

        const metadata = { ...nfts[idx], image: `https://arweave.net/${imageId}` };
        const { id: metadataId } = await bundlr.upload(JSON.stringify(metadata), {
            tags: [{ name: "Content-Type", value: "application/json" }]
        });

        nfts[idx].image = metadata.image;
        nfts[idx].url = `https://arweave.net/${metadataId}`;

        await fs.writeFile(DATA_FILE, JSON.stringify(nfts));

        return res.json({ url: nfts[idx].url });
    });

app.listen(process.env.PORT || 8000);

interface Locals {
    nfts: NFT[];
    jwk: JWKInterface;
}