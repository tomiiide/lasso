import React from "react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { Typography, Card } from "@mui/material";
import { Token } from "../pages/DustPage";
import styles from "./TokenCard.module.scss";

export interface TokenCardProps {
  token: Token;
  balance: number;
  isSelected?: boolean;
  onClick?: () => void;
}

export const TokenCard: React.FC<TokenCardProps> = ({
  token,
  balance,
  isSelected,
  onClick,
}) => {
  return (
    <>
      <Card
        className={[
          "px-6",
          styles.tokenCard,
          isSelected ? styles.selected : "",
        ].join(" ")}
        onClick={onClick}
      >
        {isSelected && (
          <div className={styles.selectIcon}>
            <CheckCircleIcon />
          </div>
        )}

        <div className="card-body flex justify-center items-center">
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
      </Card>
    </>
  );
};

export default TokenCard;
