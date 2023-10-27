import React from "react";
import styles from "./SkeletonLoading.module.css";

export const SkeletonLoadingLineLong = () => {
  return <div className={`h-[13px] w-[90%] rounded-full ${styles.skeleton}`}></div>;
};
