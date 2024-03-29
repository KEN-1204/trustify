import React, { Dispatch, FC, SetStateAction, memo } from "react";
import styles from "../ContactDetail.module.css";

type Props = {
  activeTabDetail: string;
  setActiveTabDetail: Dispatch<SetStateAction<string>>;
};

const ContactTabHeaderMemo: FC<Props> = ({ activeTabDetail, setActiveTabDetail }) => {
  return (
    <ul className={`${styles.tab_header} flex h-[22px] w-full items-center `}>
      <li
        className={`${
          styles.navbarItem
        } flex-col-center relative h-full w-[60px] cursor-pointer  text-[12px] text-[var(--color-text)] ${
          activeTabDetail === "Company" ? `${styles.active}` : ``
        }`}
        // className={`${
        //   styles.navbarItem
        // } flex-col-center bg-brand-gradient-light relative h-full w-[60px] cursor-pointer text-[12px] text-[var(--color-text)] ${
        //   activeTabDetail === "Company" ? `` : ``
        // }`}
        onClick={() => {
          if (activeTabDetail === "Company") return;
          setActiveTabDetail("Company");
        }}
      >
        <div>担当者</div>
        <div className={`${styles.active_underline}`} />
      </li>
      {/* <li
        className={`${
          styles.navbarItem
        } flex-col-center relative h-full w-[60px] cursor-pointer  text-[12px] text-[var(--color-text)] ${
          activeTabDetail === "Activity" ? `${styles.active}` : ``
        }`}
        onClick={() => {
          if (activeTabDetail === "Activity") return;
          setActiveTabDetail("Activity");
        }}
      >
        <div>活動</div>
        <div className={`${styles.active_underline}`} />
      </li>
      <li
        className={`${
          styles.navbarItem
        } flex-col-center relative h-full w-[60px] cursor-pointer  text-[12px] text-[var(--color-text)] ${
          activeTabDetail === "Detail" ? `${styles.active}` : ``
        }`}
        onClick={() => {
          if (activeTabDetail === "Detail") return;
          setActiveTabDetail("Detail");
        }}
      >
        <div>詳細</div>
        <div className={`${styles.active_underline}`} />
      </li> */}
    </ul>
  );
};

export const ContactTabHeader = memo(ContactTabHeaderMemo);
