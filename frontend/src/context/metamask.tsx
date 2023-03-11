import { useContext, useState, useEffect } from "preact/hooks";
import { ethers } from "ethers";
import { ComponentChildren, createContext } from "preact";

const MetamaskContext = createContext<{
    isMetamaskInstalled: boolean,
    isMetamaskLoading: boolean,
    isMetamaskConnected: boolean,
    accounts: ethers.JsonRpcSigner[],
    provider?: ethers.BrowserProvider,
    connectToMetamask: () => Promise<void>
}>({
    isMetamaskInstalled: false,
    isMetamaskLoading: false,
    isMetamaskConnected: false,
    accounts: [] as ethers.JsonRpcSigner[],
    provider: undefined,
    connectToMetamask: async () => { }
});

export function useMetamask() {
    return useContext(MetamaskContext);
}

export function MetamaskProvider({ children }: { children: ComponentChildren }) {
    const [isMetamaskLoading, setIsMetamaskLoading] = useState(false);
    const [isMetamaskInstalled, setIsMetamaskInstalled] = useState(false);
    const [isMetamaskConnected, setIsMetamaskConnected] = useState(false);
    const [accounts, setAccounts] = useState<ethers.JsonRpcSigner[]>([]);
    const [provider, setProvider] = useState<ethers.BrowserProvider>();

    // Check if Metamask is installed on component mount
    useEffect(() => {
        !async function () {
            if (window.ethereum) {
                setIsMetamaskLoading(true);
                setIsMetamaskInstalled(true);
                const provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await provider.listAccounts();
                setProvider(provider);
                setAccounts(accounts);
                setIsMetamaskConnected(accounts.length > 0);
                setIsMetamaskLoading(false);
            }
        }();
    }, []);

    async function connectToMetamask() {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
                setAccounts(accounts.map((account: string) => ({ address: account })));
                setIsMetamaskConnected(true);
            } catch (error) {
                console.error(error);
            }
        } else {
            console.error("Metamask not detected");
        }
    }

    const value = {
        isMetamaskInstalled,
        isMetamaskLoading,
        isMetamaskConnected,
        accounts,
        provider,
        connectToMetamask
    };

    return (
        <MetamaskContext.Provider value={value}>
            {children}
        </MetamaskContext.Provider>
    );
}
