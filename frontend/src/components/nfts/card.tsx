import { NFT, TxStatus } from '@/types'
import { MintButton } from './mint-button';
import { CONTRACT_ADDRESS, NULL_ADDRESS } from '@/config';

export function Card({ item, status, handleMint }: { status: TxStatus, item: NFT, handleMint: any }) {
    return (
        <div>
            <div className="nft-image group">
                {
                    item.ownedBy !== NULL_ADDRESS ? (
                        <a href={`https://testnets.opensea.io/assets/mumbai/${CONTRACT_ADDRESS}/${item.id}`} target="_blank">
                            <img className="group-hover:rounded-lg" src={item.image} alt={item.name} />
                        </a>
                    ) : <img className="group-hover:rounded-lg" src={item.image} alt={item.name} />
                }
                <MintButton status={status} handleMint={handleMint} />
            </div>
            <div>
                <h2 className="font-semibold text-lg">{item.name}</h2>
                <p className="text-sm">{item.description}</p>
            </div>
        </div>
    )
}
