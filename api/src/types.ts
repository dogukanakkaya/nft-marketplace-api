export interface Metadata {
    name: string;
    description: string;
    image: string;
    attributes?: MetadataAttributes[];
}

export interface MetadataAttributes {
    display_type?: string;
    trait_type: string;
    value: string | number;
}

export interface NFT extends Metadata {
    id: string;
    tokenURI?: string;
    ownedBy?: string;
}