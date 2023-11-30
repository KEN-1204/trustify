import React from "react";
import styles from "./SkeletonLoading.module.css";

export const SkeletonLoadingLineFull = () => {
  return <div className={`h-[13px] w-[100%] rounded-full ${styles.skeleton}`}></div>;
};
