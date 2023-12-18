import React, { FC, Suspense, memo, useState } from "react";
import styles from "./ActivityDetail.module.css";
import useRootStore from "@/store/useRootStore";
import useThemeStore from "@/store/useThemeStore";
import { ActivityTabHeader } from "./ActivityTabHeader/ActivityTabHeader";
import { ActivityFunctionHeader } from "./ActivityFunctionHeader/ActivityFunctionHeader";
import { ActivityMainContainer } from "./ActivityMainContainer/ActivityMainContainer";
import useDashboardStore from "@/store/useDashboardStore";
import { ActivityMainContainerOneThird } from "./ActivityMainContainer/ActivityMainContainerOneThird";

const ActivityDetailMemo: FC = () => {
  console.log("🔥 ActivityDetail レンダリング");
  const theme = useRootStore(useThemeStore, (state) => state.theme);
  const [activeTabDetail, setActiveTabDetail] = useState("Company");
  const [searchMode, setSearchMode] = useState(true);

  // ハーフとオールの時には全体を表示するためにoverflow: hiddenを削除
  const tableContainerSize = useDashboardStore((state) => state.tableContainerSize);
  const underDisplayFullScreen = useDashboardStore((state) => state.underDisplayFullScreen);
  return (
    // <div
    //   className={`${styles.detail_container} bg-red relative w-full  ${
    //     theme === "light" ? `${styles.theme_f_light}` : `${styles.theme_f_dark}`
    //   }`}
    // >
    <div
      className={`${styles.detail_container} bg-red relative w-full  ${
        theme === "light" ? `${styles.theme_f_light}` : `${styles.theme_f_dark}`
      } ${tableContainerSize === "half" && underDisplayFullScreen ? `${styles.height_all}` : ``} ${
        tableContainerSize === "all" && underDisplayFullScreen ? `${styles.height_all}` : ``
      }`}
    >
      {/* タブヘッダー h-30px w-full */}
      <ActivityTabHeader activeTabDetail={activeTabDetail} setActiveTabDetail={setActiveTabDetail} />
      {/* ファンクションヘッダー */}
      <ActivityFunctionHeader />
      {/* メインコンテナ 左と右 */}
      {/* <ActivityMainContainer /> */}
      <ActivityMainContainerOneThird />
    </div>
  );
};

export const ActivityDetail = memo(ActivityDetailMemo);

/**
 * <div
      className={`${styles.detail_container} bg-red relative w-full  ${
        theme === "light" ? `${styles.theme_f_light}` : `${styles.theme_f_dark}`
      } ${tableContainerSize === "half" ? `${styles.height_all}` : ``} ${
        tableContainerSize === "all" ? `${styles.height_all}` : ``
      }`}
    >
 */
