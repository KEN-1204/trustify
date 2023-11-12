import React, { FC } from "react";
import styles from "./SkeletonLoading.module.css";

// Avatar○有り

type Props = {
  pl?: string | null;
};

export const SkeletonLoading: FC<Props> = ({ pl = `pl-[24px]` }) => {
  return (
    <div
      className={`flex min-h-[64.5px] w-full cursor-pointer items-center truncate rounded-[8px] py-[12px] ${pl} hover:bg-[var(--setting-side-bg-select)]`}
    >
      <div
        className={`flex-center min-h-[40px] min-w-[40px] cursor-pointer rounded-full text-[#fff] hover:bg-[var(--color-bg-brand-sub-hover)] ${styles.tooltip} mr-[15px] ${styles.skeleton}`}
      ></div>
      <div className={`flex h-full w-full flex-col space-y-[10px] pl-[5px] pt-[3px] text-[12px]`}>
        <div className={`h-[13px] w-[90%] rounded-full ${styles.skeleton_delay}`}>
          <span></span>
        </div>
        <div className={`h-[13px] w-[60%] rounded-full ${styles.skeleton_delay}`}></div>
      </div>
    </div>
  );
};
