import useStore from "@/store";
import React, { FC, Suspense } from "react";
import styles from "./DashboardCompanyComponent.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "../ErrorFallback/ErrorFallback";
import { Fallback } from "../Fallback/Fallback";
import { GridTableAll } from "../GridTable/GridTableAll/GridTableAll";
import { CompanyDetail } from "./CompanyDetail/CompanyDetail";

export const DashboardCompanyComponent: FC = () => {
  console.log("🔥 DashboardCompanyComponentレンダリング レンダリング");
  const isOpenSidebar = useDashboardStore((state) => state.isOpenSidebar);
  const activeMenuTab = useDashboardStore((state) => state.activeMenuTab);
  const isOpenChangeSizeMenu = useDashboardStore((state) => state.isOpenChangeSizeMenu);
  const setIsOpenChangeSizeMenu = useDashboardStore((state) => state.setIsOpenChangeSizeMenu);
  const tableContainerSize = useDashboardStore((state) => state.tableContainerSize);
  const setClickedItemPos = useStore((state) => state.setClickedItemPos);

  return (
    <div
      className={`flex-center ${styles.app_main_container} relative ${
        isOpenSidebar ? `${styles.open}` : `${styles.close}`
      }`}
    >
      {/* 言語切り替えタブ表示時中のオーバーレイ */}
      {isOpenChangeSizeMenu && (
        <div
          className={styles.overlay}
          onClick={() => {
            console.log("DashboardHomeComponent オーバーレイクリック");
            setClickedItemPos(null);
            // setClickedItemPosOver(null);
            setIsOpenChangeSizeMenu(false);
          }}
        />
      )}
      {/* 左サイドバーサイズ分のスペーサー */}
      <div className={`${styles.spacer_left} ${isOpenSidebar ? `transition-base02` : `transition-base01`}`}></div>
      <div className={`${styles.main_contents_wrapper}`}>
        {/* 上ヘッダーサイズ分のスペーサー */}
        <div className={`${styles.spacer_top}`}></div>
        {/* ===================== スクロールコンテナ ここから ===================== */}
        <div className={`${styles.main_contents_container}`}>
          {/* １画面目 上画面 */}
          <section
            // className={`${styles.company_screen} space-y-[20px] ${
            className={`${styles.company_table_screen} ${
              tableContainerSize === "half" ? `${styles.company_table_screen_pr}` : ``
            } ${tableContainerSize === "all" ? `${styles.company_table_screen_pr}` : ``} ${
              activeMenuTab === "HOME" ||
              activeMenuTab == "Contacts000" ||
              activeMenuTab === "Activity" ||
              activeMenuTab === "Meeting0000"
                ? `${styles.all_container} space-y-0 !px-0 !py-0`
                : "py-[20px] pl-[20px]"
            }`}
          >
            {activeMenuTab === "Company" && (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Suspense fallback={<Fallback />}>
                  {/* <GridTableHomeSuccess title="メッセージ" /> */}
                  <GridTableAll title="会社 GridTableAll" />
                  {/* <GridTableAll title="GridTableAll2" /> */}
                </Suspense>
              </ErrorBoundary>
            )}
            {/* {activeMenuTab === "Meeting" && (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Suspense fallback={<Fallback />}>
                  <GridTableSmallAll title="GridTableSmallAll" />
                </Suspense>
              </ErrorBoundary>
            )} */}
          </section>

          {/* ２画面目 下画面 */}
          <section
            className={`${tableContainerSize === "all" ? `${styles.company_screen_under_all}` : ``}  ${
              tableContainerSize === "half" ? `${styles.company_screen_under_half}` : ``
            } ${tableContainerSize === "one_third" ? `${styles.company_screen_under_one_third}` : ``}`}
          >
            <CompanyDetail />
          </section>

          {/* <div className={`${styles.screen1} bg-[--color-bg-secondary]`}></div>
          <div className={`${styles.screen1} bg-[--color-bg-base]`}></div>
          <div className={`${styles.screen1} bg-[--color-bg-secondary]`}></div>
          <div className={`${styles.screen1} bg-[--color-bg-base]`}></div>
          <div className={`${styles.screen1} bg-[--color-bg-secondary]`}></div> */}
        </div>
        {/* ===================== スクロールコンテナ ここまで ===================== */}
      </div>
    </div>
  );
};
