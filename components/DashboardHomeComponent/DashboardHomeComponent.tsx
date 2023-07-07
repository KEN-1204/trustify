import useStore from "@/store";
import React, { Suspense } from "react";
import styles from "./DashboardHomeComponent.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { GridTableHome } from "../GridTable/GridTableHome";
import SpinnerD from "../Parts/SpinnerD/SpinnerD";
import { ErrorBoundary } from "react-error-boundary";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import GridTableTest from "../GridTable/GridTableTest";

export const DashboardHomeComponent = () => {
  const theme = useStore((state) => state.theme);
  const isOpenSidebar = useDashboardStore((state) => state.isOpenSidebar);
  return (
    <div
      className={`flex-center transition-base ${styles.app_main_container} relative ${
        isOpenSidebar ? `${styles.open}` : `${styles.close}`
      }`}
    >
      {/* 左サイドバーサイズ分のスペーサー */}
      <div className={`${styles.spacer_left} ${isOpenSidebar ? `transition-base02` : `transition-base01`}`}></div>
      <div className={`${styles.main_contents_wrapper}`}>
        {/* 上ヘッダーサイズ分のスペーサー */}
        <div className={`${styles.spacer_top}`}></div>
        {/* ===================== スクロールコンテナ ここから ===================== */}
        <div className={`${styles.main_contents_container}`}>
          {/* １画面目 */}
          {/* メッセージコンテナ */}
          {/* <ErrorBoundary fallback={<AiOutlineExclamationCircle className=" text-twitter-color h-10  w-10" />}>
            <Suspense fallback={<SpinnerD />}>
              <TableHome />
            </Suspense>
          </ErrorBoundary> */}
          <section className={`${styles.home_screen} space-y-[15px]`}>
            {/* <GridTableTest /> */}
            <GridTableHome title="メッセージ" />
            {/* <GridTableHome title="メッセージ" />
            <GridTableHome title="活動" />
            <GridTableHome title="物件" /> */}
          </section>
          {/* ２画面目 */}

          {/* <div className={`${styles.screen1} flex-center bg-[--color-bg-base]`}>Home</div> */}
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
