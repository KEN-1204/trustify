import useDashboardStore from "@/store/useDashboardStore";
import styles from "./DashboardSDBComponent.module.css";
import { ScreenDealBoards } from "./ScreenDealBoards/ScreenDealBoards";
import { ScreenTaskBoards } from "./TaskBoard/ScreenTaskBoards";
import useThemeStore from "@/store/useThemeStore";
import { useEffect } from "react";
import { DotsGradient } from "../Parts/DotsGradient/DotsGradient";
import { EditModalDealCard } from "./ScreenDealBoards/EditModalDealCard/EditModalDealCard";
import { SalesProgressScreen } from "./SalesProgressScreen/SalesProgressScreen";

export const DashboardSDBComponent = () => {
  const setTheme = useThemeStore((state) => state.setTheme);
  const isOpenSidebar = useDashboardStore((state) => state.isOpenSidebar);
  const setIsOpenSidebar = useDashboardStore((state) => state.setIsOpenSidebar);
  const activeTabSDB = useDashboardStore((state) => state.activeTabSDB);
  const activeThemeColor = useDashboardStore((state) => state.activeThemeColor);
  const setActiveThemeColor = useDashboardStore((state) => state.setActiveThemeColor);

  useEffect(() => {
    // テーマカラーをローカルストレージから取得して反映
    const themeColor = localStorage.getItem("theme_color");
    console.log("DashboardSDBComponentコンポーネントローカルストレージから取得 themeColor", themeColor);
    if (!!themeColor && activeThemeColor !== themeColor) {
      setActiveThemeColor(themeColor); // 既に存在する場合のみ反映
    }
    if (themeColor === null) {
      // テーマをdarkに変更
      setTheme("dark");
    }
  }, []);

  const getThemeBG = () => {
    switch (activeThemeColor) {
      case "theme-brand-f":
        return styles.brand_f;
      case "theme-brand-f-gradient":
        return styles.brand_f;
      case "theme-black-gradient":
        return styles.black_gradient;
      case "theme-simple12":
        return styles.simple12;
      case "theme-simple17":
        return styles.simple17;
      default:
        return styles.brand_f;
        break;
    }
  };

  console.log("DashboardSDBComponentレンダリング activeThemeColor", activeThemeColor);

  return (
    <>
      <div className={`flex-center ${styles.app_main_container} transition-bg05 relative ${getThemeBG()}`}>
        {["theme-brand-f", "theme-brand-f-gradient"].includes(activeThemeColor) && <DotsGradient />}
        {/* サイドバー表示時オーバーレイ */}
        {isOpenSidebar && <div className={`${styles.sidebar_overlay}`} onClick={() => setIsOpenSidebar(false)}></div>}
        <div className={`${styles.main_contents_wrapper} `}>
          {/* 上ヘッダーサイズ分のスペーサー */}
          <div className={`${styles.spacer_top}`}></div>
          {/* ===================== スクロールコンテナ ここから ===================== */}
          <div className={`${styles.main_contents_container}`}>
            {/* １画面目  */}
            {/* {activeTabSDB === "Deals" && <ScreenDealBoards />} */}
            {/* {activeTabSDB === "SalesProgress" && <ScreenDealBoards />} */}
            {activeTabSDB === "salesProgress" && <SalesProgressScreen />}
            {/* <ScreenTaskBoards /> */}
          </div>
        </div>
      </div>
    </>
  );
};
