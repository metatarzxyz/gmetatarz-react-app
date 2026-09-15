import { RainbowKitProvider, getDefaultConfig, Chain } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { phantomWallet } from '@rainbow-me/rainbowkit/wallets';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { WagmiProvider, http } from "wagmi";
import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';
import '@rainbow-me/rainbowkit/styles.css'


const cantonTestnet = {
  id: 30_337,
  name: 'Canton Testnet',
  iconUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/37263.png',
  iconBackground: '#fff',
  nativeCurrency: { name: 'Canton', symbol: 'CC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://canton-testnet.rpc.wallet.metatarz.xyz'] },
  },
  blockExplorers: {
    default: { name: 'CCView', url: 'https://testnet.ccview.io' },
  },
} as const satisfies Chain;





const wagmiConfig = getDefaultConfig({
  appName: 'gMetatarz',
  projectId: 'gMetatarz', 
  chains: [cantonTestnet]
})


const queryClient = new QueryClient()

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
    <WagmiProvider config={wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider>
      <BrowserRouter>
        <App />
        </BrowserRouter>
      </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
