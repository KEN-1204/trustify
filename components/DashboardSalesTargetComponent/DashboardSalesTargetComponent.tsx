import { FC, Suspense } from "react";
import styles from "./DashboardSalesTargetComponent.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "../ErrorFallback/ErrorFallback";
import { TargetContainer } from "./TargetContainer/TargetContainer";
import { FallbackTargetContainer } from "./TargetContainer/FallbackTargetContainer";

export const DashboardSalesTargetComponent: FC = () => {
  const isOpenSidebar = useDashboardStore((state) => state.isOpenSidebar);
  const setIsOpenSidebar = useDashboardStore((state) => state.setIsOpenSidebar);
  const activeMenuTab = useDashboardStore((state) => state.activeMenuTab);
  // const isOpenChangeSizeMenu = useDashboardStore((state) => state.isOpenChangeSizeMenu);
  // const setIsOpenChangeSizeMenu = useDashboardStore((state) => state.setIsOpenChangeSizeMenu);
  // const setClickedItemPos = useStore((state) => state.setClickedItemPos);

  // Upsert用ローディング
  console.log("🔥 DashboardSalesTargetComponentレンダリング レンダリング activeMenuTab", activeMenuTab);

  return (
    <>
      <div
        className={`flex-center ${styles.app_main_container} relative ${
          isOpenSidebar ? `${styles.open}` : `${styles.close}`
        }`}
      >
        {/* サイドバー表示時オーバーレイ */}
        {isOpenSidebar && <div className={`${styles.sidebar_overlay}`} onClick={() => setIsOpenSidebar(false)}></div>}
        {/* 見積Upsert用ローディング */}
        {/* {isLoadingUpsertGlobal && (
        <div className="flex-center fixed left-0 top-0 z-[10000] h-full w-full bg-[var(--overlay-loading-modal-inside)]">
          <SpinnerBrand withBorder withShadow />
        </div>
      )} */}
        {/* サイズメニュー切り替えタブ表示時中のオーバーレイ */}
        {/* {isOpenChangeSizeMenu && (
          <div
            className={styles.overlay}
            onClick={() => {
              console.log("DashboardSalesTargetComponent オーバーレイクリック");
              setClickedItemPos(null);
              // setClickedItemPosOver(null);
              setIsOpenChangeSizeMenu(false);
            }}
          />
        )} */}

        {/* 左サイドバーサイズ分のスペーサー */}
        <div className={`${styles.spacer_left} ${isOpenSidebar ? `transition-base02` : `transition-base01`}`}></div>
        <div className={`${styles.main_contents_wrapper} `}>
          {/* 上ヘッダーサイズ分のスペーサー */}
          <div className={`${styles.spacer_top}`}></div>
          {/* ===================== スクロールコンテナ ここから ===================== */}
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense fallback={<FallbackTargetContainer />}>
              <TargetContainer />
            </Suspense>
          </ErrorBoundary>
          {/* <FallbackTargetContainer /> */}
          {/* ===================== スクロールコンテナ ここまで ===================== */}
        </div>
      </div>
    </>
  );
};
