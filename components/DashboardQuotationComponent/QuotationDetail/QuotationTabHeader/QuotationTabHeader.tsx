import React, { Dispatch, FC, SetStateAction, memo } from "react";
import styles from "../QuotationDetail.module.css";

type Props = {
  activeTabDetail: string;
  setActiveTabDetail: Dispatch<SetStateAction<string>>;
};

const QuotationTabHeaderMemo: FC<Props> = ({ activeTabDetail, setActiveTabDetail }) => {
  return (
    <ul className={`${styles.tab_header} flex h-[22px] w-full items-center `}>
      <li
        className={`${
          styles.navbarItem
        } flex-col-center relative h-full w-[60px] cursor-pointer  text-[12px] text-[var(--color-text)] ${
          activeTabDetail === "Company" ? `${styles.active}` : ``
        }`}
        onClick={() => {
          if (activeTabDetail === "Company") return;
          setActiveTabDetail("Company");
        }}
      >
        <div>見積</div>
        <div className={`${styles.active_underline}`} />
      </li>
    </ul>
  );
};

export const QuotationTabHeader = memo(QuotationTabHeaderMemo);
