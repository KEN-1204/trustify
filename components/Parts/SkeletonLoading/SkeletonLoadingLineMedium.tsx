import React from "react";
import styles from "./SkeletonLoading.module.css";

export const SkeletonLoadingLineMedium = () => {
  return <div className={`h-[13px] w-[75%] rounded-full ${styles.skeleton}`}></div>;
};
