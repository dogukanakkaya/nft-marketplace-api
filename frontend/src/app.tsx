import { MetamaskProvider } from "@/context/metamask";
import { NFTs } from "./pages/nfts";
import { Header } from "./components/header";

export function App() {
  return (
    <MetamaskProvider>
      <Header />
      <NFTs />
    </MetamaskProvider>
  );
}