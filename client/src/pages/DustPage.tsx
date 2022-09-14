import React from "react";
import NavBar from "../components/NavBar";
import { TokenCard } from "../components/TokenCard";
import { Typography, Grid, Button } from "@mui/material";
import Loading from "react-loading";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";

export type Token = {
  symbol: string;
  decimals: number;
  address: string;
  logoURI: string;
};

export type TokenBalance = {
  token: Token;
  balance: number;
};

const sampleTokenBalances = [
  {
    token: {
      symbol: "USDC",
      address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
      decimals: 6,
      logoURI: "https://cryptoicons.org/api/icon/usdc/200",
    },
    balance: 1.234567,
  },
  {
    token: {
      symbol: "USDT",
      address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
      decimals: 6,
      logoURI: "https://cryptoicons.org/api/icon/usdt/200",
    },
    balance: 1.345673,
  },
  {
    token: {
      symbol: "AURORA",
      address: "0xaaaaaa20d9e0e2461697782ef11675f668207961",
      decimals: 6,
      logoURI: "https://s2.coinmarketcap.com/static/img/coins/64x64/14803.png",
    },
    balance: 1.345673,
  },
  {
    token: {
      symbol: "NEAR",
      address: "0x1fa4a73a3f0133f0025378af00236f3abdee5d63",
      decimals: 6,
      logoURI: "https://s2.coinmarketcap.com/static/img/coins/64x64/6535.png",
    },
    balance: 1.345673,
  },
];

function DustPage() {
  // wallet hooks
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  // state hooks
  const [isloading, setIsLoading] = React.useState(true);
  const [selectedTokens, setSelectedTokens] = React.useState<Token[]>([]);
  const [tokenBalances, setTokenBalances] = React.useState<TokenBalance[]>([]);

  // effect hooks
  const tokenIsSelected = (token: Token) => {
    return selectedTokens.some((t) => t.address === token.address);
  };

  const toggleToken = (token: Token) => {
    if (tokenIsSelected(token)) {
      setSelectedTokens(
        selectedTokens.filter((t) => t.address !== token.address)
      );
    } else {
      setSelectedTokens([...selectedTokens, token]);
    }
  };

  const loadBalances = () => {
    setTimeout(() => {
      setTokenBalances(sampleTokenBalances);
      setIsLoading(false);
    }, 2000);
  };

  React.useEffect(() => {
    loadBalances();
  }, []);

  React.useEffect(() => {
    if (isConnected) {
      setIsLoading(true);
      loadBalances();
    }
  }, [isConnected]);

  if (!isConnected) {
    return (
      <>
        <div className="h-screen w-screen flex bg-black">
          <div className="relative w-full h-full bg-black">
            <NavBar></NavBar>
            <section className="container mx-auto ">
              <div className="w-100 flex flex-col justify-center items-center mt-6 gap-4">
                <Typography variant="h6">
                  Your wallet is not connected, please connect your wallet to
                  continue
                </Typography>
                <div>
                  <Button
                    onClick={() => {
                      openConnectModal && openConnectModal();
                    }}
                    variant="contained"
                  >
                    Connect your wallet
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="h-screen w-screen flex bg-black">
        <div className="relative w-full h-full bg-black">
          <NavBar></NavBar>
          <section className="container mx-auto">
            <div>
              <Typography variant="h4" className="pt-6 pb-2">
                Your Wallet Dust
              </Typography>
              <Typography variant="body1">
                Dust is any token balance in your wallet less than $10.
              </Typography>
            </div>

            {!isloading ? (
              <>
                <div className="mt-12 mb-6">
                  <Typography>
                    Select all the tokens you want to clean
                  </Typography>
                </div>
                <div>
                  <Grid container spacing={4}>
                    {tokenBalances.map((tokenBalance) => (
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        md={3}
                        key={tokenBalance.token.address}
                      >
                        <TokenCard
                          token={tokenBalance.token}
                          balance={tokenBalance.balance}
                          isSelected={tokenIsSelected(tokenBalance.token)}
                          onClick={() => toggleToken(tokenBalance.token)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </div>
              </>
            ) : (
              <div className="w-100 flex flex-col items-center my-6">
                <Loading />
                <Typography variant="body1"> Loading your wallet</Typography>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

export default DustPage;
