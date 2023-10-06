import React, { FC, useState } from "react";
import styles from "./SettingMemberAccounts.module.css";

export const TestRowData: FC = () => {
  // チェックボックス
  const [checked, setChecked] = useState(false);

  // 頭文字のみ抽出
  const getInitial = (name: string) => name[0];
  return (
    <div role="row" className={`${styles.grid_row}`}>
      <div role="gridcell" className={`${styles.grid_cell} flex items-center`}>
        <div
          className={`flex-center h-[40px] w-[40px] cursor-pointer rounded-full bg-[var(--color-bg-brand-sub)] text-[#fff] hover:bg-[var(--color-bg-brand-sub-hover)] ${styles.tooltip} mr-[15px]`}
        >
          <span className={`text-[20px]`}>{`${getInitial("NoName")}`}</span>
        </div>
        <span>伊藤 謙太</span>
      </div>
      <div role="gridcell" className={styles.grid_cell}>
        cieletoile.1204@gmail.com
      </div>
      <div role="gridcell" className={styles.grid_cell}>
        所有者
      </div>
      <div role="gridcell" className={styles.grid_cell}>
        <div className={`${styles.grid_select_cell_header}`}>
          <input
            type="checkbox"
            checked={checked}
            onChange={() => setChecked(!checked)}
            className={`${styles.grid_select_cell_header_input}`}
          />
          <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
          </svg>
        </div>
      </div>
    </div>
  );
};
