import React from "react";
import styles from "./SkeletonLoading.module.css";

type Props = {
  rounded?: string;
  h?: string;
};

export const SkeletonLoadingLineShort = ({ rounded = "rounded-full", h = "h-[13px]" }: Props) => {
  return <div className={`w-[60%] ${h} ${rounded} ${styles.skeleton}`}></div>;
};
