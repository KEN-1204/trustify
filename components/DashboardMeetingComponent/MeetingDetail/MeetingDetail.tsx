import React, { FC, Suspense, memo, useState } from "react";
import styles from "./MeetingDetail.module.css";
import useRootStore from "@/store/useRootStore";
import useThemeStore from "@/store/useThemeStore";
import { MeetingTabHeader } from "./MeetingTabHeader/MeetingTabHeader";
import { MeetingFunctionHeader } from "./MeetingFunctionHeader/MeetingFunctionHeader";
import { MeetingMainContainer } from "./MeetingMainContainer/MeetingMainContainer";
import useDashboardStore from "@/store/useDashboardStore";
import { MeetingMainContainerOneThird } from "./MeetingMainContainer/MeetingMainContainerOneThird";

const MeetingDetailMemo: FC = () => {
  console.log("🔥 MeetingDetail レンダリング");
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
      <MeetingTabHeader activeTabDetail={activeTabDetail} setActiveTabDetail={setActiveTabDetail} />
      {/* ファンクションヘッダー */}
      <MeetingFunctionHeader />
      {/* メインコンテナ 左と右 */}
      {/* <MeetingMainContainer /> */}
      <MeetingMainContainerOneThird />
    </div>
  );
};

export const MeetingDetail = memo(MeetingDetailMemo);

/**
 * <div
      className={`${styles.detail_container} bg-red relative w-full  ${
        theme === "light" ? `${styles.theme_f_light}` : `${styles.theme_f_dark}`
      } ${tableContainerSize === "half" ? `${styles.height_all}` : ``} ${
        tableContainerSize === "all" ? `${styles.height_all}` : ``
      }`}
    >
 */
