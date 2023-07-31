import React, { FC } from "react";
import styles from "./SpinnerIDS.module.css";

type Props = {
  scale?: string;
};

const SpinnerIDS: FC<Props> = ({ scale = "scale-[0.4]" }) => {
  return (
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
