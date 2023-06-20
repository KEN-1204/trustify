import React, { CSSProperties, FC } from "react";
import styles from "./Spinner.module.css";

type Props = {
  w: string;
  h: string;
  s: string;
};

const Spinner: FC<Props> = ({ w = "28px", h = "28px", s = "3px" }) => {
  return (
    <span
      className={`${styles.loader1}`}
      style={
        {
          "--spinner-width": `${w}`,
          "--spinner-height": `${h}`,
          "--spinner-size": `${s}`,
        } as CSSProperties
      }
    ></span>
  );
};

export default Spinner;
