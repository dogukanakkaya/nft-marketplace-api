import { TxStatus } from "@/types";

export function MintButton({ status, handleMint }: { status: TxStatus, handleMint: any }) {
    const componentMap = {
        [TxStatus.None]: (
            <button onClick={handleMint} className="absolute w-30 right-2 top-2 text-white px-4 py-1 rounded bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 transition">
                Mint
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" class="bi bi-check-all inline-block" viewBox="0 0 16 16">
                    <path d="M8.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L2.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093L8.95 4.992a.252.252 0 0 1 .02-.022zm-.92 5.14.92.92a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 1 0-1.091-1.028L9.477 9.417l-.485-.486-.943 1.179z" />
                </svg>
            </button>
        ),
        [TxStatus.Pending]: (
            <button disabled className="absolute w-30 right-2 top-2 text-white px-4 py-1 rounded bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 transition">
                Minting
                <span className="animate-spin inline-block align-middle">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-arrow-repeat" viewBox="0 0 16 16">
                        <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z" />
                        <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z" />
                    </svg>
                </span>
            </button>
        ),
        [TxStatus.Success]: (
            <button disabled className="absolute w-30 right-2 top-2 text-white px-4 py-1 rounded bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-400 hover:to-green-400 transition">
                Owned by you
            </button>
        ),
        [TxStatus.Fail]: (
            <button onClick={handleMint} className="absolute w-30 right-2 top-2 text-white px-4 py-1 rounded bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 transition">
                Failed to Mint
            </button>
        )
    }
    return (
        <>
            {componentMap[status]}
        </>
    )
}
