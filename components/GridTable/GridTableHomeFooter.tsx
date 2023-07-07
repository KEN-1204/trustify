import React, { FC } from "react";
import styles from "./GridTableHome.module.css";
import { AiOutlineArrowLeft } from "react-icons/ai";

export const GridTableHomeFooter: FC = () => {
  return (
    <div className={styles.grid_footer}>
      <div className={styles.grid_footer_inner}>
        <div className={`${styles.grid_pagination} space-x-3`}>
          <button
            className={`font-regular text-scale-1200 hover:bordershadow-scale-700 dark:bordershadow-scale-800 hover:dark:bordershadow-scale-900 focus-visible:outline-scale-700 pointer-events-none relative inline-flex cursor-pointer items-center space-x-2 rounded border bg-transparent px-[10px]   py-[3px] text-center text-xs opacity-50 shadow-sm outline-none  outline-0 transition transition-all  duration-200 ease-out focus-visible:outline-4 focus-visible:outline-offset-1 `}
          >
            <AiOutlineArrowLeft />
          </button>
          <p className="text-sm font-medium text-[#bbb]">Page</p>
          <div className={`w-[3rem] space-x-3`}>
            <input
              type="number"
              className=" text-scale-1200 focus:border-scale-900 focus:ring-scale-400 placeholder-scale-800 bg-scaleA-200 border-scale-700 box-border block w-full appearance-none rounded-md border border-[#575757] bg-[#ffffff07] bg-none px-2.5 py-1   text-xs  shadow-sm  outline-none transition-all focus:shadow-md focus:ring-2 focus:ring-current"
              max={1}
              min={1}
              value={1}
              onChange={() => null}
            />
          </div>
          <p className="text-sm font-medium text-[#bbb]">of 1</p>
          <button className=" focus:outline-scale-600 flex rounded border-none bg-transparent p-0 outline-none outline-offset-1 transition-all focus:outline-4 ">
            <span className=" font-regular text-scale-1200 bordershadow-scale-600 hover:bordershadow-scale-700 dark:bordershadow-scale-800 hover:dark:bordershadow-scale-900 focus-visible:outline-scale-700 relative inline-flex cursor-pointer items-center space-x-2 rounded border border-[#777] bg-transparent   px-[10px] py-[3px] text-center text-xs shadow-sm outline-none outline-0  transition  transition-all duration-200 ease-out focus-visible:outline-4 focus-visible:outline-offset-1">
              <span className="truncate">100 rows</span>
            </span>
          </button>
          <p className="text-sm font-medium text-[#bbb]">55 records</p>
        </div>
      </div>
    </div>
  );
};
