import React, { FC, memo, useState } from "react";
import styles from "./CompanyDetail.module.css";
import useRootStore from "@/store/useRootStore";
import useThemeStore from "@/store/useThemeStore";
import { CompanyTabHeader } from "../CompanyTabHeader/CompanyTabHeader";
import { CompanyFunctionHeader } from "../CompanyFunctionHeader/CompanyFunctionHeader";
import { CompanyMainContainer } from "../CompanyMainContainer/CompanyMainContainer";

const CompanyDetailMemo: FC = () => {
  console.log("🔥 CompanyDetail レンダリング");
  const theme = useRootStore(useThemeStore, (state) => state.theme);
  const [activeTabDetail, setActiveTabDetail] = useState("Company");
  return (
    <div
      className={`${styles.detail_container} bg-red relative w-full  ${
        theme === "light" ? `${styles.theme_f_light}` : `${styles.theme_f_dark}`
      }`}
    >
      {/* タブヘッダー h-30px w-full */}
      <CompanyTabHeader activeTabDetail={activeTabDetail} setActiveTabDetail={setActiveTabDetail} />
      {/* ファンクションヘッダー */}
      <CompanyFunctionHeader />
      {/* メインコンテナ 左と右 */}
      <CompanyMainContainer />
    </div>
  );
};

export const CompanyDetail = memo(CompanyDetailMemo);
