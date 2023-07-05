import React, { FC, memo } from "react";
import styles from "./DashboardSidebar.module.css";

export const DashboardSidebarMemo: FC = () => {
  return <div className={`${styles.app_sidebar} transition-base`}></div>;
};

export const DashboardSidebar = memo(DashboardSidebarMemo);
