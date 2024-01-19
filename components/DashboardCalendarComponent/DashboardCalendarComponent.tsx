import useStore from "@/store";
import React, { FC, Suspense } from "react";
import styles from "./DashboardCalendarComponent.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "../ErrorFallback/ErrorFallback";
import { Fallback } from "../Fallback/Fallback";
import { Calendar } from "./Calendar/Calendar";
// import { CalendarGridTableAll } from "./CalendarGridTableAll/CalendarGridTableAll";
// import { CalendarDetail } from "./CalendarDetail/CalendarDetail";
// import { ContactDetail } from "./ContactDetail/ContactDetail";

export const DashboardCalendarComponent: FC = () => {
  const isOpenSidebar = useDashboardStore((state) => state.isOpenSidebar);
  const activeMenuTab = useDashboardStore((state) => state.activeMenuTab);
  const isOpenChangeSizeMenu = useDashboardStore((state) => state.isOpenChangeSizeMenu);
  const setIsOpenChangeSizeMenu = useDashboardStore((state) => state.setIsOpenChangeSizeMenu);
  const setClickedItemPos = useStore((state) => state.setClickedItemPos);
  console.log("🔥 DashboardCalendarComponentレンダリング レンダリング activeMenuTab", activeMenuTab);

  // ハーフとallの時はheight指定を無しにして、コンテンツ全体を表示できるようにする
  // const tableContainerSize = useRootStore(useDashboardStore, (state) => state.tableContainerSize);
  const tableContainerSize = useDashboardStore((state) => state.tableContainerSize);

  return (
    <div
      className={`flex-center ${styles.app_main_container} relative ${
        isOpenSidebar ? `${styles.open}` : `${styles.close}`
      }`}
    >
      {/* サイズメニュー切り替えタブ表示時中のオーバーレイ */}
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

      <div className={`${styles.main_contents_wrapper} `}>
        {/* 上ヘッダーサイズ分のスペーサー */}
        <div className={`${styles.spacer_top}`}></div>
        {/* ===================== スクロールコンテナ ここから ===================== */}
        <div className={`${styles.main_contents_container}`}>
          {/* 水玉グラデーション */}
          <div className="pointer-events-none absolute inset-0 z-[10] overflow-hidden">
            {/* <div className="bg-gradient-brand1 z-1 absolute bottom-[-300px] left-[-300px] h-[300px] w-[300px] rounded-full"></div> */}
            {/* <div className="bg-gradient-brand2 z-1 absolute left-[14%] top-[-300px] h-[300px] w-[300px] rounded-full"></div> */}
            {/* <div className="bg-gradient-brand1 z-1 absolute right-[5%] top-[-300px] h-[300px] w-[300px] rounded-full"></div> */}
            {/* <div className="polka_dot_border3"></div> */}
            {/* <div className="bg-gradient-brand1 z-1 absolute left-[-300px] top-[-200px] h-[300px] w-[300px] rounded-full"></div> */}
          </div>
          <section className={`${styles.company_table_screen} py-[20px] pl-[20px]`}>
            {activeMenuTab === "Calendar" && (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Suspense fallback={<Fallback className="min-h-[calc(100vh/3-var(--header-height)/3)]" />}>
                  <Calendar />
                </Suspense>
              </ErrorBoundary>
            )}
          </section>
          {/* １画面目 上画面 */}
          {/* <section
            className={`${styles.company_table_screen} ${
              tableContainerSize === "half" ? `${styles.company_table_screen_pr}` : ``
            } ${tableContainerSize === "all" ? `${styles.company_table_screen_pr}` : ``} ${
              activeMenuTab === "HOME" ||
              activeMenuTab == "Contacts000" ||
              activeMenuTab === "Calendar0" ||
              activeMenuTab === "Calendar0000"
                ? `${styles.all_container} space-y-0 !px-0 !py-0`
                : "py-[20px] pl-[20px]"
            }`}
          >
            {activeMenuTab === "Calendar" && (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Suspense fallback={<Fallback className="min-h-[calc(100vh/3-var(--header-height)/3)]" />}>
                  <CalendarGridTableAll title="面談" />
                </Suspense>
              </ErrorBoundary>
            )}
          </section> */}

          {/* ２画面目 下画面 */}
          {/* <section
            className={`${tableContainerSize === "all" ? `${styles.company_screen_under_all}` : ``}  ${
              tableContainerSize === "half" ? `${styles.company_screen_under_half}` : ``
            } ${tableContainerSize === "one_third" ? `${styles.company_screen_under_one_third}` : ``}`}
          >
            <CalendarDetail />
          </section> */}
        </div>
        {/* ===================== スクロールコンテナ ここまで ===================== */}
      </div>
    </div>
  );
};
