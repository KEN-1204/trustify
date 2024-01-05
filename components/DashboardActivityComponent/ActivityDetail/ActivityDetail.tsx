import React, { FC, Suspense, memo, useState } from "react";
import styles from "./ActivityDetail.module.css";
import useRootStore from "@/store/useRootStore";
import useThemeStore from "@/store/useThemeStore";
import { ActivityTabHeader } from "./ActivityTabHeader/ActivityTabHeader";
import { ActivityFunctionHeader } from "./ActivityFunctionHeader/ActivityFunctionHeader";
// import { ActivityMainContainer } from "./ActivityMainContainer/ActivityMainContainer";
import useDashboardStore from "@/store/useDashboardStore";
import { ActivityMainContainerOneThird } from "./ActivityMainContainer/ActivityMainContainerOneThird";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/ErrorFallback/ErrorFallback";
import { Fallback } from "@/components/Fallback/Fallback";

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
      {/* <ActivityMainContainerOneThird /> */}
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense
          fallback={
            <Fallback className="h-full max-h-[calc(100vh-var(--header-height)-calc(100vh/3-var(--header-height)/3)-20px-20px-20px-22px-40px-2px)] min-h-[calc(100vh-var(--header-height)-calc(100vh/3-var(--header-height)/3)-20px-20px-20px-22px-40px-2px)]" />
          }
        >
          <ActivityMainContainerOneThird />
        </Suspense>
      </ErrorBoundary>
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
