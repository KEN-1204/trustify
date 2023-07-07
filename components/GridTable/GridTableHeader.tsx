import React, { FC } from "react";
import styles from "./GridTableHome.module.css";

export const GridTableHeader: FC = () => {
  return (
    <div className={`${styles.grid_header}`}>
      <div className={`${styles.table_tab}`}>メッセージ</div>
    </div>
  );
};

{
  /* <div className="flex items-center space-x-2">
        <button className="focus:outline-scale-600 flex rounded border-none bg-transparent p-0 outline-none outline-offset-1 transition-all focus:outline-4">
          Button
        </button>
        <button className="focus:outline-scale-600 flex rounded border-none bg-transparent p-0 outline-none outline-offset-1 transition-all focus:outline-4">
          Button
        </button>
        <button className="focus:outline-scale-600 flex rounded border-none bg-transparent p-0 outline-none outline-offset-1 transition-all focus:outline-4">
          Button
        </button>
      </div> */
}
