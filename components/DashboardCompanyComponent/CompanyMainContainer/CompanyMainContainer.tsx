import React, { FC, memo } from "react";
import styles from "../CompanyDetail/CompanyDetail.module.css";

const CompanyMainContainerMemo: FC = () => {
  return (
    <div className={`${styles.main_container} w-full `}>
      {/* ------------------------- スクロールコンテナ ------------------------- */}
      <div className={`${styles.scroll_container} flex h-[300px] w-full overflow-y-auto px-[10px] pb-[20px]`}>
        {/* ------------------------- 左コンテナ ------------------------- */}
        <div className={`${styles.left_container} h-full w-[calc(50vw-var(--sidebar-mini-width))] `}>
          <div className={`${styles.left_wrapper} flex h-screen w-full flex-col`}>
            {/* 法人番号・ID */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>○法人番号</span>
                  {/* <span>○法人番号</span> */}
                  <input type="text" className={`${styles.input_box}`} />
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center`}>
                  <span className={`${styles.title_min}`}>ID</span>
                  {/* <span>○法人番号</span> */}
                  <input type="text" placeholder="" className={`${styles.input_box}`} />
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>

            {/* 法人番号・ID */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>●会社名</span>
                  {/* <span>○法人番号</span> */}
                  <input type="text" autoFocus className={`${styles.input_box}`} />
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>
          </div>
        </div>
        {/* ------------------------- 右コンテナ ------------------------- */}
        <div className={`${styles.right_container} h-full grow bg-[aqua]/[0]`}>
          <div className="h-screen w-full bg-[#fff]/[0]"></div>
        </div>
      </div>
    </div>
  );
};

export const CompanyMainContainer = memo(CompanyMainContainerMemo);

/* Divider、区切り線 */
//  <div className="flex h-full w-1/2 flex-col pr-[15px]">
//    <div className="flex h-full items-center">○法人番号</div>
//    <div className={`${styles.underline}`}></div>
//  </div>;
