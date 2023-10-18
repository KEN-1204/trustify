import React, { FC } from "react";
import styles from "./SpinnerComet.module.css";

type Props = {
  width?: string;
  height?: string;
};

export const SpinnerComet: FC<Props> = ({ width, height }) => {
  return <div className={`${styles.spinner} ${width} ${height}`}></div>;
};
