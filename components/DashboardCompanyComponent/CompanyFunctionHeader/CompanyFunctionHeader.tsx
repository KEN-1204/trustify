import React, { FC, memo } from "react";
import styles from "../CompanyDetail/CompanyDetail.module.css";
import { RippleButton } from "@/components/Parts/RippleButton/RippleButton";

const CompanyFunctionHeaderMemo: FC = () => {
  return (
    <div className={`${styles.grid_function_header} h-[40px] w-full bg-[var(--color-bg-under-function-header)]`}>
      <div className={`flex max-h-[26px] w-full items-center justify-start space-x-[6px]`}>
        <RippleButton
          title={`新規サーチ`}
          bgColor="var(--color-btn-brand-f-re)"
          border="var(--color-btn-brand-f-re-hover)"
          borderRadius="2px"
          classText={`select-none`}
          clickEventHandler={() => {
            //   if (tableContainerSize === "all") return;
            //   console.log("クリック コンテナ高さ変更 All");
            //   setTableContainerSize("all");
            console.log("新規サーチ クリック");
          }}
        />
        <RippleButton
          title={`サーチ編集`}
          classText="select-none"
          borderRadius="2px"
          clickEventHandler={() => {
            //   if (tableContainerSize === "half") return;
            //   console.log("クリック コンテナ高さ変更 ハーフ");
            //   setTableContainerSize("half");
            console.log("サーチ編集 クリック");
          }}
        />
      </div>
      <div className={`flex max-h-[26px] w-full  items-center justify-end space-x-[6px]`}>
        <button
          className={`flex-center transition-base03 h-[28px]  w-[70px] cursor-pointer  space-x-2 rounded-[4px] text-[12px]  text-[var(--color-bg-brand-f)] ${styles.fh_text_btn} `}
        >
          {/* <FiLock /> */}
          <span>HP検索</span>
        </button>
        <button
          className={`flex-center transition-base03 h-[28px]  w-[70px] cursor-pointer  space-x-2 rounded-[4px] text-[12px]  text-[var(--color-bg-brand-f)] ${styles.fh_text_btn} `}
        >
          {/* <FiLock /> */}
          <span>MAP</span>
        </button>
        {/* <RippleButton
          title={`HP検索`}
          borderRadius="2px"
          classText="select-none"
          clickEventHandler={() => console.log("ホバーモード クリック")}
        /> */}
      </div>
    </div>
  );
};

export const CompanyFunctionHeader = memo(CompanyFunctionHeaderMemo);

/*

*/
