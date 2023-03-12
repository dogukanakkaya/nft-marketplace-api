import createKeccakHash from 'keccak';
import { NFT_METADATA_SECRET } from "./config";

export const createId = (...args: string[]) => {
    const hash = createKeccakHash('keccak256').update(args.join('') + NFT_METADATA_SECRET).digest('hex');
    return '0x' + hash;
};