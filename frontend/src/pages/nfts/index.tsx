import { API_URL } from "@/config";
import { useEffect, useState } from "preact/hooks";
import check from '@/assets/check-lg.svg';

export function NFTs() {
    const [data, setData] = useState([]);
    useEffect(() => {
        const abortController = new AbortController();

        !async function () {
            const response = await fetch(`${API_URL}/nfts`, { signal: abortController.signal });
            const result = await response.json();
            setData(result);
        }();

        return () => abortController.abort();
    }, []);

    return (
        <div className="container mx-auto mt-8">
            {
                data.length ? (
                    <div className="grid grid-cols-4 gap-8">
                        {
                            data.map(item => (
                                <div className="relative">
                                    <div>
                                        <img src={item.image} alt="" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-lg">{item.name}</h2>
                                        <p className="text-sm">{item.description}</p>
                                    </div>
                                    <button className="absolute w-24 right-2 top-2 text-white px-4 py-1 rounded bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 transition">
                                        Mint
                                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" class="bi bi-check-all inline-block" viewBox="0 0 16 16">
                                            <path d="M8.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L2.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093L8.95 4.992a.252.252 0 0 1 .02-.022zm-.92 5.14.92.92a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 1 0-1.091-1.028L9.477 9.417l-.485-.486-.943 1.179z" />
                                        </svg>
                                    </button>
                                </div>
                            ))
                        }
                    </div>
                ) : <>Loading todo...</>
            }
        </div>
    );
};