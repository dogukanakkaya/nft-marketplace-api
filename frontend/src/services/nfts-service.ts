import { Alchemy, Network } from "alchemy-sdk"

const settings = {
    apiKey: "UcxjxVI9bNUK5Y6tcQHUFeWOsYTce9g3",
    network: Network.MATIC_MUMBAI,
};

export const alchemy = new Alchemy(settings);