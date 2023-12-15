import React, { CSSProperties, FC } from "react";
import styles from "./SpinnerComet.module.css";

type Props = {
  width?: string;
  height?: string;
  w?: string;
  h?: string;
  s?: string;
};

export const SpinnerComet: FC<Props> = ({ width, height, s = "3.8px", w = "42px", h = "42px" }) => {
  return (
    <div
      className={`${styles.spinner} ${width} ${height}`}
      style={
        {
          "--spinner-width": `${w}`,
          "--spinner-height": `${h}`,
          "--spinner-stroke": `${s}`,
        } as CSSProperties
      }
    ></div>
  );
};
