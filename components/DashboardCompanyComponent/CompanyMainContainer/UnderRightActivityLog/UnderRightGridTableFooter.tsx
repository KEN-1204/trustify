import React, { FC, memo } from "react";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";
import styles from ".././UnderRightActivityLog/UnderRightActivityLog.module.css";
import useStore from "@/store";

type Props = {
  getItemCount: number;
  getTotalCount?: number | null;
};

const UnderRightGridTableFooterMemo: FC<Props> = ({ getItemCount, getTotalCount }) => {
  const language = useStore((state) => state.language);
  // console.log("右下フッター getItemCount", getItemCount, "getTotalCount", getTotalCount);
  return (
    <div className={styles.grid_footer}>
      <div className={styles.grid_footer_inner}>
        <div className={`${styles.grid_pagination} space-x-3 px-[10px] `}>
          {/* <button
            className={`font-regular text-scale-1200 hover:bordershadow-scale-700 dark:bordershadow-scale-800 hover:dark:bordershadow-scale-900 focus-visible:outline-scale-700 pointer-events-none relative inline-flex cursor-pointer items-center space-x-2 rounded border bg-transparent px-[10px]   py-[3px] text-center text-xs opacity-50 shadow-sm outline-none  outline-0 transition transition-all  duration-200 ease-out focus-visible:outline-4 focus-visible:outline-offset-1 `}
          >
            <AiOutlineArrowLeft />
          </button>
          <p className="text-[10px] font-medium text-[#bbb]">
            {language === "Ja" && "ページ"}
            {language === "En" && "Page"}
          </p>
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
          <p className="-ml-[5px] inline-block text-sm font-medium text-[#bbb]">/ 100</p>
          <button
            className={`font-regular text-scale-1200 hover:bordershadow-scale-700 dark:bordershadow-scale-800 hover:dark:bordershadow-scale-900 focus-visible:outline-scale-700 pointer-events-none relative inline-flex cursor-pointer items-center space-x-2 rounded border bg-transparent px-[10px]   py-[3px] text-center text-xs opacity-50 shadow-sm outline-none  outline-0 transition transition-all  duration-200 ease-out focus-visible:outline-4 focus-visible:outline-offset-1 `}
          >
            <AiOutlineArrowRight />
          </button> */}
          <div className=" focus:outline-scale-600 transition-bg05 pointer-events-none flex rounded  bg-transparent p-0 text-[var(--color-text-title)] outline-offset-1 focus:outline-4">
            <span className="font-regular text-scale-1200 bordershadow-scale-600 hover:bordershadow-scale-700 dark:bordershadow-scale-800 hover:dark:bordershadow-scale-900 focus-visible:outline-scale-700 relative inline-flex items-center space-x-2 rounded border border-[#777] bg-transparent px-[0px] text-center text-[12px] shadow-sm duration-200 ease-out focus-visible:outline-4 focus-visible:outline-offset-1">
              {/* <span className="truncate">
                {language === "ja" && `${getItemCount ? getItemCount : `-`} `}
                {language === "en" && "100 rows"}
              </span> */}
              <span className="truncate">
                {language === "ja" &&
                  `${getTotalCount !== null && getTotalCount !== undefined ? getItemCount : `-`} 件`}
                {language === "en" &&
                  `${getTotalCount !== null && getTotalCount !== undefined ? getItemCount : `-`} rows`}
              </span>
            </span>
          </div>
          <p className="pointer-events-none space-x-2 text-[13px] font-medium text-[#bbb]">
            <span>/</span>
            <span>
              {/* {language === "ja" && `/ 124件`}
            {language === "en" && "55 records"} */}
              {/* {language === "ja" && `/ ${getTotalCount === null ? "-" : getTotalCount}件`}
              {language === "en" && `/ ${getTotalCount === null ? "-" : getTotalCount} records`} */}
              {language === "ja" && `${getTotalCount === null ? "-" : getTotalCount} 件`}
              {language === "en" && `${getTotalCount === null ? "-" : getTotalCount} records`}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export const UnderRightGridTableFooter = memo(UnderRightGridTableFooterMemo);
