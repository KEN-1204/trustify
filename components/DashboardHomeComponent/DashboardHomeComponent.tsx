import useStore from "@/store";
import React from "react";
import styles from "./DashboardHomeComponent.module.css";

export const DashboardHomeComponent = () => {
  const theme = useStore((state) => state.theme);
  return (
    <div className={`flex-center transition-base ${styles.app_main_container} relative `}>
      <div className={`${styles.screen1} bg-[--color-bg-base]`}></div>
      <div className={`${styles.screen1} bg-[--color-bg-secondary]`}></div>
      <div className={`${styles.screen1} bg-[--color-bg-base]`}></div>
      <div className={`${styles.screen1} bg-[--color-bg-secondary]`}></div>
      <div className={`${styles.screen1} bg-[--color-bg-base]`}></div>
      <div className={`${styles.screen1} bg-[--color-bg-secondary]`}></div>
    </div>
  );
};
