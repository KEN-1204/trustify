import React, { FC } from "react";
import styles from "./CheckBtn.module.css";
import useStore from "@/store";

type Props = {
  htmlFor: string;
  checkBtnColor: string;
};

export const CheckBtn: FC<Props> = ({ htmlFor, checkBtnColor = "var(--color-btn-brand)" }) => {
  const isChecked = useStore((state) => state.isChecked);
  const setIsChecked = useStore((state) => state.setIsChecked);
  console.log("isChecked", isChecked);
  return (
    <label className={styles.container}>
      <input
        id={htmlFor}
        // defaultChecked
        checked={isChecked}
        type="checkbox"
        onChange={() => setIsChecked(!isChecked)}
      />
      <div className={styles.checkmark} style={{ backgroundColor: checkBtnColor }}></div>
    </label>
  );
};
