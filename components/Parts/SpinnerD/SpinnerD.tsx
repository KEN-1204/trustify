import React, { CSSProperties, FC } from "react";
import styles from "./SpinnerD.module.css";

type Props = {
  w?: string;
  h?: string;
  s?: string;
};

const SpinnerD: FC<Props> = ({ w = "28px", h = "28px", s = "3px" }) => {
  return (
    <span
      className={`${styles.loader}`}
      style={
        {
          "--spinner-width": `${w}`,
          "--spinner-height": `${h}`,
          "--spinner-size": `${s}`,
        } as CSSProperties
      }
    >
      <span className={styles.loader1}></span>
    </span>
  );
};

export default SpinnerD;
