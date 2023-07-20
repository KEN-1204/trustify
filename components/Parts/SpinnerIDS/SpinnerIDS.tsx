import React from "react";
import styles from "./SpinnerIDS.module.css";

const SpinnerIDS = () => {
  return (
    <div className={`${styles.lds_spinner}`}>
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
