import useDashboardStore from "@/store/useDashboardStore";
import styles from "./DashboardSDBComponent.module.css";
import { ScreenDealBoards } from "./ScreenDealBoards/ScreenDealBoards";

export const DashboardSDBComponent = () => {
  const isOpenSidebar = useDashboardStore((state) => state.isOpenSidebar);
  const activeTabSDB = useDashboardStore((state) => state.activeTabSDB);

  return (
    <>
      <div className={`flex-center ${styles.app_main_container} relative`}>
        {/* サイドバー表示時オーバーレイ */}
        {isOpenSidebar && <div className={`${styles.sidebar_overlay}`}></div>}
        <div className={`${styles.main_contents_wrapper} `}>
          {/* 上ヘッダーサイズ分のスペーサー */}
          <div className={`${styles.spacer_top}`}></div>
          {/* ===================== スクロールコンテナ ここから ===================== */}
          <div className={`${styles.main_contents_container}`}>
            {/* １画面目  */}
            {/* {activeTabSDB === "Deals" && <ScreenDealBoards />} */}
            <ScreenDealBoards />
          </div>
        </div>
      </div>
    </>
  );
};
