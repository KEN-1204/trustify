import React, { FC, Suspense, memo, useState } from "react";
import styles from "./QuotationDetail.module.css";
import useRootStore from "@/store/useRootStore";
import useThemeStore from "@/store/useThemeStore";
import { QuotationTabHeader } from "./QuotationTabHeader/QuotationTabHeader";
import { QuotationFunctionHeader } from "./QuotationFunctionHeader/QuotationFunctionHeader";
import useDashboardStore from "@/store/useDashboardStore";
import { QuotationMainContainerOneThird } from "./QuotationMainContainerOneThird/QuotationMainContainerOneThird";
import { ErrorBoundary } from "react-error-boundary";
import { Fallback } from "@/components/Fallback/Fallback";
import { ErrorFallback } from "@/components/ErrorFallback/ErrorFallback";

const QuotationDetailMemo: FC = () => {
  console.log("🔥 QuotationDetail レンダリング");
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
      <QuotationTabHeader activeTabDetail={activeTabDetail} setActiveTabDetail={setActiveTabDetail} />
      {/* ファンクションヘッダー */}
      <QuotationFunctionHeader />
      {/* メインコンテナ 左と右 */}
      {/* <QuotationMainContainerOneThird /> */}

      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense
          fallback={
            <Fallback className="h-full max-h-[calc(100vh-var(--header-height)-calc(100vh/3-var(--header-height)/3)-20px-20px-20px-22px-40px-2px)] min-h-[calc(100vh-var(--header-height)-calc(100vh/3-var(--header-height)/3)-20px-20px-20px-22px-40px-2px)]" />
          }
        >
          <QuotationMainContainerOneThird />
        </Suspense>
      </ErrorBoundary>
      {/* <Fallback className="h-full max-h-[calc(100vh-var(--header-height)-calc(100vh/3-var(--header-height)/3)-20px-20px-20px-22px-40px-2px)] min-h-[calc(100vh-var(--header-height)-calc(100vh/3-var(--header-height)/3)-20px-20px-20px-22px-40px-2px)]" /> */}
    </div>
  );
};

export const QuotationDetail = memo(QuotationDetailMemo);

/**
 * <div
      className={`${styles.detail_container} bg-red relative w-full  ${
        theme === "light" ? `${styles.theme_f_light}` : `${styles.theme_f_dark}`
      } ${tableContainerSize === "half" ? `${styles.height_all}` : ``} ${
        tableContainerSize === "all" ? `${styles.height_all}` : ``
      }`}
    >
 */
