import { useEffect, useState } from 'preact/hooks';
import { NFT, TxStatus } from '@/types';
import { useMetamask } from '@/context/metamask';
import { request } from '@/helpers';
import { Card } from '@/components/nfts/card';
import { alchemy } from '@/services/nfts-service';
import { CONTRACT_ADDRESS } from '@/config';

export function NFTs() {
    const [lazyNFTs, setLazyNFTs] = useState<NFT[]>([]);
    const [NFTs, setNFTs] = useState<NFT[]>([]);
    const [txStatus, setTxStatus] = useState<Record<string, TxStatus>>({});
    const { contract, accounts } = useMetamask();

    useEffect(() => {
        const abortController = new AbortController();

        !async function () {
            const result = await request.send<NFT[]>('/', { signal: abortController.signal });
            setLazyNFTs(result);
        }();

        return () => abortController.abort();
    }, []);

    useEffect(() => {
        if (!accounts[0]) return;

        !async function () {
            const contractNfts = await alchemy.nft.getNftsForContract(CONTRACT_ADDRESS);

            const nfts = contractNfts.nfts.map(nft => ({
                ...nft.rawMetadata,
                id: nft.tokenId,
                tokenURI: nft.tokenUri?.raw
            })) as NFT[];

            if (accounts[0]?.address) {
                const { ownedNfts } = await alchemy.nft.getNftsForOwner(accounts[0].address, {
                    contractAddresses: [CONTRACT_ADDRESS]
                });

                for (const ownedNft of ownedNfts) {
                    const idx = nfts.findIndex(nft => nft.id === ownedNft.tokenId);
                    if (idx === -1) return;

                    nfts[idx].ownedBy = accounts[0].address;
                }
            }

            setNFTs(nfts);
        }();
    }, [accounts])

    const handleMint = async (id: string) => {
        console.log(contract);

        if (!contract) {
            alert('Please connect your wallet first.');
            return;
        }

        setTxStatus({ ...txStatus, [id]: TxStatus.Pending });
        try {
            const result = await request.send<{ url: string, name: string, id: string }>('/premint', {
                method: 'POST',
                body: JSON.stringify({ id }),
            });

            const tx = await contract.mint(result.url, result.name, result.id);
            const r = await tx.wait();

            if (r.status === 1) {
                // you can lock this before tx starts to prevent remints after page refresh, i don't care
                await request.send(`/${id}`, { method: 'DELETE' });
            }

            setTxStatus({
                ...txStatus,
                [id]: r.status === 1 ? TxStatus.Success : TxStatus.Fail
            });
        } catch (err: any) {
            if (err.reason === 'rejected') {
                setTxStatus({ ...txStatus, [id]: TxStatus.None });
            }
        }
    };

    const data = [...lazyNFTs, ...NFTs];

    return (
        <div className="container mx-auto mt-8">
            {
                data.length ? (
                    <div className="grid grid-cols-4 gap-8">
                        {
                            data.map(item => <Card
                                item={item}
                                status={item.ownedBy === accounts[0]?.address ? TxStatus.Success : (txStatus[item.id] || TxStatus.None)}
                                handleMint={() => handleMint(item.id)}
                            />)
                        }
                    </div>
                ) : <>Loading todo...</>
            }
        </div>
    );
};