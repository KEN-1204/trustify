import React from "react";
import styles from "./SkeletonLoading.module.css";

export const SkeletonLoadingLines = () => {
  return (
    <div
      className={`flex min-h-[64.5px] w-full cursor-pointer flex-col  items-center truncate rounded-[8px] py-[12px] pl-[24px] hover:bg-[var(--setting-side-bg-select)]`}
    >
      <div className={`flex h-full w-full flex-col space-y-[10px] pl-[5px] pt-[3px] text-[12px]`}>
        <div className={`h-[13px] w-[90%] rounded-full ${styles.skeleton_fast}`}></div>
        <div className={`h-[13px] w-[90%] rounded-full ${styles.skeleton_fast}`}></div>
        <div className={`h-[13px] w-[60%] rounded-full ${styles.skeleton_fast}`}></div>
      </div>
      <div className={`mt-[20px] flex h-full w-full flex-col space-y-[10px] pl-[5px] pt-[3px] text-[12px]`}>
        <div className={`h-[13px] w-[90%] rounded-full ${styles.skeleton}`}></div>
        <div className={`h-[13px] w-[60%] rounded-full ${styles.skeleton}`}></div>
      </div>
    </div>
  );
};
