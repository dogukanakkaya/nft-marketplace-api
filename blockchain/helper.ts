import { ContractReceipt, BigNumber } from 'ethers';

export const getTokenIdFromReceipt = (r: ContractReceipt) => (r.events?.at(0)?.args?.tokenId as BigNumber).toNumber();