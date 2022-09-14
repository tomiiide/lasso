import '@rainbow-me/rainbowkit/styles.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Exchange from './pages/ExchangePage';
import DustPage from './pages/DustPage';
import MarketplacePage from './pages/MarketplacePage';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
  Chain,
  getDefaultWallets,
  midnightTheme,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import {
  configureChains,
  createClient,
  WagmiConfig,
} from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { ToastContainer } from 'react-toastify';
import theme from './theme'

const auroraChain: Chain = {
  id: 1313161554,
  name: 'Aurora',
  network: 'aurora',
  iconUrl: 'https://aurora.dev/static/favicon-32x32.png',
  iconBackground: '#000',
  nativeCurrency: {
    decimals: 18,
    name: 'Aurora Ether',
    symbol: 'aETH',
  },
  rpcUrls: {
    default: 'https://mainnet.aurora.dev',
  },
  blockExplorers: {
    default: { name: 'Aurora Mainnet Explorer', url: 'https://explorer.mainnet.aurora.dev' },
    etherscan: { name: 'Aurora Mainnet Explorer', url: 'https://explorer.mainnet.aurora.dev' },
  },
  testnet: false,
};

const { chains, provider } = configureChains(
  [auroraChain],
  [
    jsonRpcProvider({ rpc: chain => ({ http: chain.rpcUrls.default }) }),
    alchemyProvider({ apiKey: process.env.ALCHEMY_ID }),
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'Lasso',
  chains
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
})
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
      <ThemeProvider theme={theme}>
    {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
    <CssBaseline />
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains} theme={midnightTheme()} coolMode>
        <BrowserRouter>
        <Routes>
        <Route path="/" element={<App />} />
        <Route path="exchange" element={<Exchange />} />
        <Route path="dustsweeper" element={<DustPage />} />
        <Route path="marketplace" element={<MarketplacePage />} />
        </Routes>
        </BrowserRouter>
        <ToastContainer />
      </RainbowKitProvider>
    </WagmiConfig>
    </ThemeProvider>
</React.StrictMode>
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();