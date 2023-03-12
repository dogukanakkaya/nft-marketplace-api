import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import fs from 'node:fs/promises';
import cors from 'cors';
import Bundlr from "@bundlr-network/client";
import { Metadata } from './types';
import { JWKInterface } from 'arweave/node/lib/wallet';
import { createId } from './helper';

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('static'));
app.use(async (_, __, next) => {
    const nfts = JSON.parse(await fs.readFile('data.json', 'utf8')) as Metadata[];
    const jwk = JSON.parse(await fs.readFile('jwk.json', 'utf8')) as JWKInterface;
    app.locals = { nfts, jwk };
    next();
});

app
    .get('/nfts', async (req, res) => {
        const url = `${req.protocol}://${req.get('host')}`;
        const { nfts } = app.locals as Locals;

        const data = nfts.map(nft => {
            const image = `${url}/${nft.image}`

            // create the hash to validate if this is a valid NFT belongs to this project
            const id = createId(nft.name);

            return { ...nft, image, id };
        });

        return res.json(data);
    })
    .post('/premint', async (req, res) => {
        const { id } = req.body;
        const { nfts, jwk } = app.locals as Locals;

        const nft = nfts.find(nft => createId(nft.name) === id);

        const bundlr = new Bundlr("http://node2.bundlr.network", "arweave", jwk);

        const path = `./static/${nft.image}`;

        const { size } = await fs.stat(path);
        const price = await bundlr.getPrice(size);
        await bundlr.fund(price);

        const response = await bundlr.uploadFile(path);
        console.log(response);

        return res.json({ id: response.id, url: `https://arweave.net/${response.id}` });
    });

app.listen(process.env.PORT || 8000);

interface Locals {
    nfts: Metadata[];
    jwk: JWKInterface;
}