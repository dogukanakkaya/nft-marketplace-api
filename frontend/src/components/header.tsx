import { useMetamask } from "@/context/metamask";

export function Header() {
    const { isMetamaskLoading, isMetamaskConnected, accounts, connectToMetamask } = useMetamask();

    return (
        <div className="bg-gray-200">
            <div className="container mx-auto">
                <div className="h-20 flex items-center justify-between">
                    <h1 className="font-semibold text-3xl">LazyCamp</h1>
                    {
                        isMetamaskLoading ? (
                            <span className="bg-gray-600 shadow-gray-500 px-4 py-2 rounded text-white shadow">Loading...</span>
                        ) : (
                            isMetamaskConnected ? <span className="bg-gray-600 shadow-gray-500 px-4 py-2 rounded text-white shadow">Wallet Connected {accounts[0].address}</span> : (
                                <button onClick={connectToMetamask} className="bg-green-500 shadow-green-400 hover:bg-green-600 px-4 py-2 rounded text-white shadow transition">
                                    Connect Wallet
                                </button>
                            )
                        )
                    }
                </div>
            </div>
        </div>
    );
}