import React, { FC, Suspense, memo, useState } from "react";
import styles from "./PropertyDetail.module.css";
import useRootStore from "@/store/useRootStore";
import useThemeStore from "@/store/useThemeStore";
import { PropertyTabHeader } from "./PropertyTabHeader/PropertyTabHeader";
import { PropertyFunctionHeader } from "./PropertyFunctionHeader/PropertyFunctionHeader";
// import { PropertyMainContainer } from "./PropertyMainContainer/PropertyMainContainer";
import useDashboardStore from "@/store/useDashboardStore";
import { PropertyMainContainerOneThird } from "./PropertyMainContainer/PropertyMainContainerOneThird";

const PropertyDetailMemo: FC = () => {
  console.log("🔥 PropertyDetail レンダリング");
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
      <PropertyTabHeader activeTabDetail={activeTabDetail} setActiveTabDetail={setActiveTabDetail} />
      {/* ファンクションヘッダー */}
      <PropertyFunctionHeader />
      {/* メインコンテナ 左と右 */}
      {/* <PropertyMainContainer /> */}
      <PropertyMainContainerOneThird />
    </div>
  );
};

export const PropertyDetail = memo(PropertyDetailMemo);

/**
 * <div
      className={`${styles.detail_container} bg-red relative w-full  ${
        theme === "light" ? `${styles.theme_f_light}` : `${styles.theme_f_dark}`
      } ${tableContainerSize === "half" ? `${styles.height_all}` : ``} ${
        tableContainerSize === "all" ? `${styles.height_all}` : ``
      }`}
    >
 */
