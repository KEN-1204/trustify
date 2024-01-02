import React, { CSSProperties, FC } from "react";
import styles from "./SpinnerIDS2.module.css";

type Props = {
  fontSize?: number;
  width?: number;
  height?: number;
  scale?: string;
  top?: string;
  left?: string;
  transform?: string;
  color?: string;
};

const SpinnerIDS3: FC<Props> = ({
  fontSize = 26,
  width = 26,
  height = 26,
  scale = "scale-[0.8]",
  top = "50%",
  left = "50%",
  transform = "translate(-50%, -50%)",
  // color = "#ccc",
  color = "var(--color-spinner-ids)",
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
          left: left,
          transform: transform,
          "--spinner-color": `${color}`,
          position: "absolute",
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

export default SpinnerIDS3;
