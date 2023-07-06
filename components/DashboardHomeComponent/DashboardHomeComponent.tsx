import useStore from "@/store";
import React from "react";
import styles from "./DashboardHomeComponent.module.css";
import useDashboardStore from "@/store/useDashboardStore";

export const DashboardHomeComponent = () => {
  const theme = useStore((state) => state.theme);
  const isOpenSidebar = useDashboardStore((state) => state.isOpenSidebar);
  return (
    <div
      className={`flex-center transition-base ${styles.app_main_container} relative ${
        isOpenSidebar ? `${styles.open}` : `${styles.close}`
      }`}
    >
      <div className={`${styles.spacer_left} ${isOpenSidebar ? `transition-base02` : `transition-base01`}`}></div>
      <div className={`${styles.main_contents_wrapper}`}>
        <div className={`${styles.spacer_top}`}></div>
        <div className={`${styles.main_contents_container}`}>
          <div className={`${styles.screen1} flex-center bg-[--color-bg-base]`}>Home</div>
          <div className={`${styles.screen1} bg-[--color-bg-secondary]`}></div>
          <div className={`${styles.screen1} bg-[--color-bg-base]`}></div>
          <div className={`${styles.screen1} bg-[--color-bg-secondary]`}></div>
          <div className={`${styles.screen1} bg-[--color-bg-base]`}></div>
          <div className={`${styles.screen1} bg-[--color-bg-secondary]`}></div>
        </div>
      </div>
    </div>
  );
};
