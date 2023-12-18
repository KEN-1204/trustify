import React, { FC } from "react";
import styles from "./SpinnerIDS.module.css";

type Props = {
  scale?: string;
  width?: number;
  height?: number;
};

const SpinnerIDS: FC<Props> = ({ scale = "scale-[0.4]", width = 80, height = 80 }) => {
  // const SpinnerIDS: FC<Props> = ({ scale = "scale-[0.4]" }) => {
  return (
    // <div className={`${styles.lds_spinner} ${scale}`} style={{ minWidth: `${width}px`, minHeight: `${height}px` }}>
    <div className={`${styles.lds_spinner} ${scale}`}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};

export default SpinnerIDS;
