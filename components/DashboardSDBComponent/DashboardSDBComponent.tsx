import useDashboardStore from "@/store/useDashboardStore";
import styles from "./DashboardSDBComponent.module.css";
import { ScreenDealBoards } from "./ScreenDealBoards/ScreenDealBoards";
import { ScreenTaskBoards } from "./TaskBoard/ScreenTaskBoards";
import useThemeStore from "@/store/useThemeStore";
import { useEffect } from "react";

export const DashboardSDBComponent = () => {
  const setTheme = useThemeStore((state) => state.setTheme);
  const isOpenSidebar = useDashboardStore((state) => state.isOpenSidebar);
  const setIsOpenSidebar = useDashboardStore((state) => state.setIsOpenSidebar);
  const activeTabSDB = useDashboardStore((state) => state.activeTabSDB);

  useEffect(() => {
    setTheme("dark");
  }, []);

  return (
    <>
      <div className={`flex-center ${styles.app_main_container} relative`}>
        {/* サイドバー表示時オーバーレイ */}
        {isOpenSidebar && <div className={`${styles.sidebar_overlay}`} onClick={() => setIsOpenSidebar(false)}></div>}
        <div className={`${styles.main_contents_wrapper} `}>
          {/* 上ヘッダーサイズ分のスペーサー */}
          <div className={`${styles.spacer_top}`}></div>
          {/* ===================== スクロールコンテナ ここから ===================== */}
          <div className={`${styles.main_contents_container}`}>
            {/* １画面目  */}
            {/* {activeTabSDB === "Deals" && <ScreenDealBoards />} */}
            <ScreenDealBoards />
            {/* <ScreenTaskBoards /> */}
          </div>
        </div>
      </div>
    </>
  );
};
