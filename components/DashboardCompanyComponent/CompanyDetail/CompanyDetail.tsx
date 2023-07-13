import React, { FC, memo, useState } from "react";
import styles from "./CompanyDetail.module.css";
import useRootStore from "@/store/useRootStore";
import useThemeStore from "@/store/useThemeStore";
import { CompanyTabHeader } from "../CompanyTabHeader/CompanyTabHeader";
import { CompanyFunctionHeader } from "../CompanyFunctionHeader/CompanyFunctionHeader";

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
      {/* <div className="h-[40px] w-full bg-[var(--color-bg-under-function-header)]"></div> */}
      <CompanyFunctionHeader />
      {/* メインコンテナ 左と右 */}
      <div className={`${styles.main_container} w-full `}>
        {/* スクロールコンテナ */}
        <div className={`${styles.scroll_container} flex h-[300px] w-full overflow-y-auto pb-[20px]`}>
          {/* 左コンテナ */}
          <div className="h-full w-[calc(50vw-var(--sidebar-mini-width))] bg-[#000]/[0.2]">
            <div className="h-screen w-full bg-[#202020]/[0.3]"></div>
          </div>
          {/* 右コンテナ */}
          <div className="h-full grow bg-[aqua]/[0.2]">
            <div className="h-screen w-full bg-[#fff]/[0.3]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CompanyDetail = memo(CompanyDetailMemo);
