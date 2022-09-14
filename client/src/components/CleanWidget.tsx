import React from "react";
import { Typography, Button } from "@mui/material";
import { Token, TokenBalance } from "../pages/DustPage";
import { TokenCardProps } from "./TokenCard";
import styles from "./CleanWidget.module.scss";
import { ArrowDownCircleIcon } from "@heroicons/react/24/outline";

const TokenListItem: React.FC<TokenCardProps> = ({ token, balance }) => {
  return (
    <>
      <div className="flex justify-between items-center ">
        <div className="flex justify-center items-center gap-2">
          <img
            src={token.logoURI}
            alt={token.symbol}
            height="32px"
            width="32px"
          />
          <Typography>{token.symbol}</Typography>
        </div>
        <Typography>{balance}</Typography>
      </div>
    </>
  );
};

const NearToken: Token = {
  symbol: "NEAR",
  address: "0x1fa4a73a3f0133f0025378af00236f3abdee5d63",
  decimals: 6,
  logoURI: "https://s2.coinmarketcap.com/static/img/coins/64x64/6535.png",
};

export interface CleanWidgetProps {
  selectedTokens: TokenBalance[];
}

export const CleanWidget: React.FC<CleanWidgetProps> = ({ selectedTokens }) => {
  const getTotalBalance = () => {
    const totalBalance = selectedTokens.reduce((acc, token) => {
      return acc + token.balance;
    }, 0);

    return parseFloat(totalBalance.toFixed(2));
  };

  return (
    <div
      className={[
        "flex flex-col fixed bg-slate-800 px-4 h-full z-10 pt-24",
        styles.cleanWidgetContainer,
      ].join(" ")}
    >
      <div
        className={[
          styles.cleanWidget,
          "bg-slate-600 p-12 w-full flex flex-col items-center",
        ].join(" ")}
      >
        <div className="flex gap-5 flex-col w-full mb-8">
          {selectedTokens.map((tokenBalance) => (
            <TokenListItem
              token={tokenBalance.token}
              balance={tokenBalance.balance}
            />
          ))}
        </div>
        <div className="w-8 h-8">
          <ArrowDownCircleIcon />
        </div>
        <div className="w-full">
          <Typography variant="h6">Receiving</Typography>
          <div className="w-full ">
            <TokenListItem token={NearToken} balance={getTotalBalance()} />
          </div>
        </div>
        <div className="w-full">
          <a
            href="/dustsweeper"
            className="mt-10 relative w-full group sm:w-auto"
          >
            {/* <span className="absolute top-0 left-0 w-full h-full text-transparent border-2 border-white rounded">Join Today</span> */}
            <span className="px-8 inline-block bg-gradient-to-br sm:w-auto w-full text-center from-green-500 font-semibold via-green-500 to-green-500 relative transition-all ease-linear duration-150 transform group-hover:-translate-y-1.5 group-hover:translate-x-1.5 -translate-y-2.5 text-lg rounded translate-x-2 py-4">
              Clean Wallet
            </span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default CleanWidget;
