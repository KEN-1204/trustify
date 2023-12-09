import React, { CSSProperties } from "react";
import styles from "./Spinner78.module.css";

export const Spinner78 = ({ c = "#02e7f5", s = "28px" }: { c?: string; s?: string }) => {
  return (
    <div
      className={styles.spinner78}
      style={
        {
          "--spinner-color": `${c}`,
          "--spinner-size": `${s}`,
        } as CSSProperties
      }
    ></div>
  );
};
