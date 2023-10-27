import React from "react";
import styles from "./SkeletonLoading.module.css";

export const SkeletonLoadingLineShort = () => {
  return <div className={`h-[13px] w-[60%] rounded-full ${styles.skeleton}`}></div>;
};
