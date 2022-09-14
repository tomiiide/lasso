import React from "react";
import { Token } from "../pages/DustPage";
import styles from "./CleanWidget.module.scss";

export interface CleanWidgetProps {
  selectedTokens: Token[];
}

export const CleanWidget: React.FC<CleanWidgetProps> = ({ selectedTokens }) => {
  return (
    <div className={['flex flex-col fixed bg-slate-800 px-4 h-full z-10 pt-24', styles.cleanWidgetContainer].join(" ")}>
      {selectedTokens.map((token) => (
        <p key={token.address}> {token.symbol}</p>
      ))}
    </div>
  );
};

export default CleanWidget;
