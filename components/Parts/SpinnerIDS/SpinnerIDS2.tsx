import React, { CSSProperties, FC } from "react";
import styles from "./SpinnerIDS2.module.css";

type Props = {
  fontSize?: number;
  width?: number;
  height?: number;
  scale?: string;
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  color?: string;
};

const SpinnerIDS2: FC<Props> = ({
  fontSize = 26,
  width = 26,
  height = 26,
  scale = "scale-[0.8]",
  top = 0,
  right = 0,
  bottom = 0,
  left = 0,
  // color = "#ccc",
  color = "#aaa",
}) => {
  // const SpinnerIDS: FC<Props> = ({ scale = "scale-[0.4]" }) => {
  return (
    <div
      className={`${styles.spinner} ${styles.center}`}
      style={
        {
          fontSize: fontSize,
          width: width,
          height: height,
          top: top,
          right: right,
          bottom: bottom,
          left: left,
          "--spinner-color": `${color}`,
        } as CSSProperties
      }
    >
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
