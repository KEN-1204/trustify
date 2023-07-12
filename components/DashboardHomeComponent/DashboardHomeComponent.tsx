import useStore from "@/store";
import React, { FC, Suspense } from "react";
import styles from "./DashboardHomeComponent.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { GridTableHome } from "../GridTable/GridTableHome";
import SpinnerD from "../Parts/SpinnerD/SpinnerD";
import { ErrorBoundary } from "react-error-boundary";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { GridTableHomeSuccess } from "../GridTable/GridTableHomeSuccess/GridTableHomeSuccess";
import { ErrorFallback } from "../ErrorFallback/ErrorFallback";
import Spinner from "../Parts/Spinner/Spinner";
import { Fallback } from "../Fallback/Fallback";
import { SpinnerComet } from "../Parts/SpinnerComet/SpinnerComet";
import { GridTableSmallAll } from "../GridTable/GridTableSmallAll/GridTableSmallAll";
import { GridTableSmallHalf } from "../GridTable/GridTableSmallHalf/GridTableSmallHalf";
import { GridTableAll } from "../GridTable/GridTableAll/GridTableAll";
import useThemeStore from "@/store/useThemeStore";
import { GridTableHalf } from "../GridTable/GridTableHalf/GridTableHalf";

export const DashboardHomeComponent = () => {
  // const theme = useThemeStore((state) => state.theme);
  // const theme = useStore((state) => state.theme);
  const isOpenSidebar = useDashboardStore((state) => state.isOpenSidebar);
  const activeMenuTab = useDashboardStore((state) => state.activeMenuTab);

  // フォールバックコンポーネント
  // const ErrorFallback = (
  //   <div className="flex-center fixed inset-0 z-50 bg-red-100 text-[#fff]">
  //     <div>
  //       <AiOutlineExclamationCircle />
  //     </div>
  //     <p>エラーが発生しました。</p>
  //   </div>
  // );
  return (
    <div
      className={`flex-center ${styles.app_main_container} relative ${
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

          <section
            // className={`${styles.home_screen} space-y-[20px] ${
            className={`${styles.home_screen}  ${
              activeMenuTab === "Contacts" || activeMenuTab === "Activity" || activeMenuTab === "Meeting"
                ? `${styles.all_container} space-y-0 !px-0 !py-0`
                : ""
            }`}
          >
            {/* <GridTableTest /> */}
            {/* <div className="h-[20vh] w-full"></div> */}
            {/* {activeMenuTab === "Company" && <GridTableHome title="メッセージ" />} */}
            {/* <ErrorBoundary FallbackComponent={ErrorFallback}> */}
            {activeMenuTab === "Company" && (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Suspense fallback={<Fallback />}>
                  {/* <GridTableHomeSuccess title="メッセージ" /> */}
                  <GridTableHome title="メッセージ" />
                </Suspense>
              </ErrorBoundary>
            )}
            {activeMenuTab === "Contacts" && (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Suspense fallback={<Fallback />}>
                  {/* <GridTableHomeSuccess title="メッセージ" /> */}
                  <GridTableAll title="GridTableAll" />
                  {/* <GridTableAll title="GridTableAll2" /> */}
                </Suspense>
              </ErrorBoundary>
            )}
            {activeMenuTab === "Activity" && (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Suspense fallback={<Fallback />}>
                  <GridTableHalf title="GridTableHalf" />
                  {/* <GridTableHalf title="GridTableHalf" /> */}
                </Suspense>
              </ErrorBoundary>
            )}
            {activeMenuTab === "Meeting" && (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Suspense fallback={<Fallback />}>
                  <GridTableSmallAll title="GridTableSmallAll" />
                  {/* <GridTableHalf title="GridTableHalf" /> */}
                </Suspense>
              </ErrorBoundary>
            )}
            {/* </ErrorBoundary> */}
            {/* <GridTableHome title="メッセージ" />
            <GridTableHome title="活動" />
            <GridTableHome title="物件" /> */}
          </section>
          {/* <section className={`${styles.home_screen} space-y-[15px]`}>
            <GridTableHome title="メッセージ" />
          </section> */}
          {/* <div className={`${styles.screen1} bg-[--color-bg-base]`}></div> */}
          {/* ２画面目 */}

          {/* <div className={`${styles.screen1} flex-center bg-[--color-bg-base]`}>
            <SpinnerComet />
          </div> */}
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
