import useStore from "@/store";
import React, { FC, Suspense } from "react";
import styles from "./DashboardQuotationComponent.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "../ErrorFallback/ErrorFallback";
import { QuotationGridTableAll } from "./QuotationGridTableAll/QuotationGridTableAll";
import { QuotationDetail } from "./QuotationDetail/QuotationDetail";
import { SpinnerComet } from "../Parts/SpinnerComet/SpinnerComet";
import { FallbackGridTableAllAMPQ } from "../Fallback/FallbackGridTableAllAMPQ/FallbackGridTableAllAMPQ";
import { SpinnerBrand } from "../Parts/SpinnerBrand/SpinnerBrand";

export const DashboardQuotationComponent: FC = () => {
  const isOpenSidebar = useDashboardStore((state) => state.isOpenSidebar);
  const activeMenuTab = useDashboardStore((state) => state.activeMenuTab);
  const isOpenChangeSizeMenu = useDashboardStore((state) => state.isOpenChangeSizeMenu);
  const setIsOpenChangeSizeMenu = useDashboardStore((state) => state.setIsOpenChangeSizeMenu);
  const setClickedItemPos = useStore((state) => state.setClickedItemPos);
  // Upsert用ローディング
  const isLoadingUpsertGlobal = useDashboardStore((state) => state.isLoadingUpsertGlobal);
  console.log("DashboardQuotationComponentレンダリング");

  // ハーフとallの時はheight指定を無しにして、コンテンツ全体を表示できるようにする
  // const tableContainerSize = useRootStore(useDashboardStore, (state) => state.tableContainerSize);
  const tableContainerSize = useDashboardStore((state) => state.tableContainerSize);

  // サーチモード時MeetingGridTableAllとpadding上下を無くしてMainContainerを全画面にする
  const searchMode = useDashboardStore((state) => state.searchMode);

  return (
    <div
      className={`flex-center ${styles.app_main_container} relative ${
        isOpenSidebar ? `${styles.open}` : `${styles.close}`
      }`}
    >
      {/* 見積Upsert用ローディング */}
      {isLoadingUpsertGlobal && (
        <div className="flex-center fixed left-0 top-0 z-[10000] h-full w-full bg-[var(--overlay-loading-modal-inside)]">
          {/* <SpinnerComet w="50px" h="50px" s="5px" /> */}
          <SpinnerBrand withBorder withShadow />
        </div>
      )}
      {/* サイズメニュー切り替えタブ表示時中のオーバーレイ */}
      {isOpenChangeSizeMenu && (
        <div
          className={styles.overlay}
          onClick={() => {
            console.log("DashboardQuotationComponent オーバーレイクリック");
            setClickedItemPos(null);
            // setClickedItemPosOver(null);
            setIsOpenChangeSizeMenu(false);
          }}
        />
      )}
      {/* 左サイドバーサイズ分のスペーサー */}
      <div className={`${styles.spacer_left} ${isOpenSidebar ? `transition-base02` : `transition-base01`}`}></div>
      <div className={`${styles.main_contents_wrapper} `}>
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
              activeMenuTab === "HOME" ? `${styles.all_container} space-y-0 !px-0 !py-0` : "py-[20px] pl-[20px]"
            } ${searchMode ? `${styles.is_search_mode}` : ``}`}
          >
            {activeMenuTab === "Quotation" && (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Suspense fallback={<FallbackGridTableAllAMPQ title="見積" />}>
                  <QuotationGridTableAll title="見積" />
                </Suspense>
              </ErrorBoundary>
            )}
            {/* {activeMenuTab === "Quotation" && <FallbackGridTableAll />} */}
          </section>

          {/* ２画面目 下画面 */}
          <section
            className={`${tableContainerSize === "all" ? `${styles.company_screen_under_all}` : ``}  ${
              tableContainerSize === "half" ? `${styles.company_screen_under_half}` : ``
            } ${tableContainerSize === "one_third" ? `${styles.company_screen_under_one_third}` : ``}`}
          >
            <QuotationDetail />
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
