import React from "react";
import { Typography, Button } from "@mui/material";
import { Token, TokenBalance } from "../pages/DustPage";
import { TokenCardProps } from "./TokenCard";
import styles from "./CleanWidget.module.scss";
import { ArrowDownCircleIcon } from "@heroicons/react/24/outline";
import Loading from "react-loading";
import { useSignMessage } from "wagmi";
import { verifyMessage } from "ethers/lib/utils";
import JSConfetti from "js-confetti";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  symbol: "wNEAR",
  address: "0x1fa4a73a3f0133f0025378af00236f3abdee5d63",
  decimals: 6,
  logoURI: "https://s2.coinmarketcap.com/static/img/coins/64x64/6535.png",
};

export interface CleanWidgetProps {
  selectedTokens: TokenBalance[];
  onClean: () => void;
}

export const CleanWidget: React.FC<CleanWidgetProps> = ({
  selectedTokens,
  onClean,
}) => {
  const [isCleaning, setIsCleaning] = React.useState(false);

  const { signMessage } = useSignMessage({
    onSuccess(data, variables) {
      // Verify signature when sign message succeeds
      verifyMessage(variables.message, data);
      onCleanWalletSuccess();
    },
    onError(error) {
      onCleanWalletCancel();
      console.error(error)
    }
  });

  const getTotalBalance = () => {
    const totalBalance = selectedTokens.reduce((acc, token) => {
      return acc + token.balance;
    }, 0);

    return parseFloat(totalBalance.toFixed(2));
  };

  const onCleanWalletSuccess = () => {
    const jsConfetti = new JSConfetti();
    jsConfetti.addConfetti({
      emojis: ["🤠", "🧹", "✨", "🚀", "🔥"],
      confettiNumber: 100,
    });
    toast.success("Wallet cleaned successfully!");
    onClean && onClean();
    setIsCleaning(false);
  };

  const onCleanWalletCancel = () => {
    toast.error("Wallet cleaning cancelled!");
    setIsCleaning(false);
  }

  const handleCleanWallet = () => {
    setIsCleaning(true);
    signMessage({ message: "clean my wallet" });
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
          <Typography variant="subtitle1">Receiving</Typography>
          <div className="w-full ">
            <TokenListItem token={NearToken} balance={getTotalBalance()} />
          </div>
        </div>
        <div className="w-full m-8 flex items-center justify-center">
          <Button
            variant="contained"
            onClick={handleCleanWallet}
            disabled={isCleaning}
          >
            {isCleaning ? <Loading /> : "Clean Wallet"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CleanWidget;
