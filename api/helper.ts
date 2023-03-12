import crypto from 'node:crypto';
import { NFT_METADATA_SECRET } from "./config";

export const createId = (...args: string[]) => {
    const hash = crypto.createHash('sha256').update(args.join('') + NFT_METADATA_SECRET).digest('hex');
    return '0x' + hash;
};