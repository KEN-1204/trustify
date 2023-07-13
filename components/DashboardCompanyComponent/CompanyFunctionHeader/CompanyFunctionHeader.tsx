import React, { Dispatch, FC, SetStateAction, memo } from "react";
import styles from "../CompanyDetail/CompanyDetail.module.css";
import { RippleButton } from "@/components/Parts/RippleButton/RippleButton";
import useDashboardStore from "@/store/useDashboardStore";

const CompanyFunctionHeaderMemo: FC = () => {
  const searchMode = useDashboardStore((state) => state.searchMode);
  const setSearchMode = useDashboardStore((state) => state.setSearchMode);
  return (
    <div className={`${styles.grid_function_header} h-[40px] w-full bg-[var(--color-bg-under-function-header)]`}>
      <div className={`flex max-h-[26px] w-full items-center justify-start space-x-[6px]`}>
        <RippleButton
          title={`${searchMode ? `サーチ実行` : `新規サーチ`}`}
          bgColor="var(--color-btn-brand-f-re)"
          border="var(--color-btn-brand-f-re-hover)"
          borderRadius="2px"
          classText={`select-none`}
          clickEventHandler={() => {
            console.log("新規サーチ クリック");
            setSearchMode(!searchMode);
          }}
        />
        <RippleButton
          title={`${searchMode ? `サーチ中止` : `サーチ編集`}`}
          classText="select-none"
          borderRadius="2px"
          clickEventHandler={() => {
            console.log("サーチ編集 クリック");
            setSearchMode(false);
          }}
        />
      </div>
      <div className={`flex max-h-[26px] w-full  items-center justify-end space-x-[6px]`}>
        <button
          className={`flex-center transition-base03 h-[26px]  w-[70px] cursor-pointer  space-x-2 rounded-[4px] text-[12px]  text-[var(--color-bg-brand-f)] ${styles.fh_text_btn} `}
        >
          {/* <FiLock /> */}
          <span>HP検索</span>
        </button>
        <button
          className={`flex-center transition-base03 h-[26px]  w-[70px] cursor-pointer  space-x-2 rounded-[4px] text-[12px]  text-[var(--color-bg-brand-f)] ${styles.fh_text_btn} `}
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
