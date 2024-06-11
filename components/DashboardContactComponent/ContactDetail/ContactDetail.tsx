import React, { FC, Suspense, memo, useState } from "react";
import styles from "./ContactDetail.module.css";
import useRootStore from "@/store/useRootStore";
import useThemeStore from "@/store/useThemeStore";
import { ContactTabHeader } from "./ContactTabHeader/ContactTabHeader";
import { ContactFunctionHeader } from "./ContactFunctionHeader/ContactFunctionHeader";
import { ContactMainContainer } from "./ContactMainContainer/ContactMainContainer";
import useDashboardStore from "@/store/useDashboardStore";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/ErrorFallback/ErrorFallback";
import { Fallback } from "@/components/Fallback/Fallback";

const ContactDetailMemo: FC = () => {
  console.log("🔥 ContactDetail レンダリング");
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
      <ContactTabHeader activeTabDetail={activeTabDetail} setActiveTabDetail={setActiveTabDetail} />
      {/* ファンクションヘッダー */}
      <ContactFunctionHeader />
      {/* メインコンテナ 左と右 */}
      {/* <ContactMainContainer /> */}
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense
          fallback={
            <Fallback className="h-full max-h-[calc(100vh-var(--header-height)-calc(100vh/3-var(--header-height)/3)-20px-20px-20px-22px-40px-2px)] min-h-[calc(100vh-var(--header-height)-calc(100vh/3-var(--header-height)/3)-20px-20px-20px-22px-40px-2px)]" />
          }
        >
          <ContactMainContainer />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

export const ContactDetail = memo(ContactDetailMemo);

/**
 * <div
      className={`${styles.detail_container} bg-red relative w-full  ${
        theme === "light" ? `${styles.theme_f_light}` : `${styles.theme_f_dark}`
      } ${tableContainerSize === "half" ? `${styles.height_all}` : ``} ${
        tableContainerSize === "all" ? `${styles.height_all}` : ``
      }`}
    >
 */
