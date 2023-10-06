import React, { FC } from "react";
import styles from "./SpinnerIDS2.module.css";

type Props = {
  fontSize?: number;
  width?: number;
  height?: number;
  scale?: string;
};

const SpinnerIDS2: FC<Props> = ({ fontSize = 26, width = 26, height = 26, scale = "scale-[0.8]" }) => {
  // const SpinnerIDS: FC<Props> = ({ scale = "scale-[0.4]" }) => {
  return (
    <div className={`${styles.spinner} ${styles.center}`} style={{ fontSize: fontSize, width: width, height: height }}>
      <div className={`${styles.spinner_blade}`}></div>
      <div className={`${styles.spinner_blade}`}></div>
      <div className={`${styles.spinner_blade}`}></div>
      <div className={`${styles.spinner_blade}`}></div>
      <div className={`${styles.spinner_blade}`}></div>
      <div className={`${styles.spinner_blade}`}></div>
      <div className={`${styles.spinner_blade}`}></div>
      <div className={`${styles.spinner_blade}`}></div>
      <div className={`${styles.spinner_blade}`}></div>
      <div className={`${styles.spinner_blade}`}></div>
      <div className={`${styles.spinner_blade}`}></div>
      <div className={`${styles.spinner_blade}`}></div>
    </div>
  );
};

export default SpinnerIDS2;
