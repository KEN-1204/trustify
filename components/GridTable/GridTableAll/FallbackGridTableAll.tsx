import useDashboardStore from "@/store/useDashboardStore";
import useRootStore from "@/store/useRootStore";
import useThemeStore from "@/store/useThemeStore";
import React from "react";
import styles from "./GridTableAll.module.css";
import { RippleButton } from "@/components/Parts/RippleButton/RippleButton";
import { ChangeSizeBtn } from "@/components/Parts/ChangeSizeBtn/ChangeSizeBtn";
import { FiLock } from "react-icons/fi";
import useStore from "@/store";
import stylesFooter from "../GridTableFooter/GridTableFooter.module.css";
import { SkeletonLoadingLines } from "@/components/Parts/SkeletonLoading/SkeletonLoadingLines";

export const FallbackGridTableAll = () => {
  const theme = useRootStore(useThemeStore, (state) => state.theme);
  const tableContainerSize = useDashboardStore((state) => state.tableContainerSize);
  const language = useStore((state) => state.language);
  return (
    <div
      className={`${styles.main_container} ${
        tableContainerSize === "one_third" ? `${styles.main_container_one_third}` : ``
      } ${tableContainerSize === "half" ? `${styles.main_container_half}` : ``} ${
        theme === "light" ? `${styles.theme_f_light}` : `${styles.theme_f_dark}`
      }`}
    >
      {/* ================== Gridテーブルヘッダー ================== */}
      <div className={`${styles.grid_header}`}>
        {/* <div className={`${styles.table_tab} min-h-[22px]`}></div> */}
        <div className={`${styles.table_tab} min-h-[22px]`}>会社</div>
      </div>

      {/* ================== Gridメインコンテナ ================== */}
      <div className={`${styles.grid_main_container}`}>
        {/* ================== Gridファンクションヘッダー ボタンでページ遷移 ================== */}
        <div className={`${styles.grid_function_header}`}>
          <div className={`flex max-h-[26px] w-full items-center justify-start space-x-[6px]`}>
            <RippleButton
              title={`新規サーチ`}
              // bgColor="var(--color-btn-brand-f-re)"
              border="var(--color-btn-brand-f-re-hover)"
              borderRadius="2px"
              classText={`select-none`}
            />
            <RippleButton title={`サーチ編集`} classText="select-none" borderRadius="2px" />
            <button
              className={`flex-center transition-base03 relative  h-[26px] min-w-[118px]  cursor-pointer space-x-1  rounded-[4px] px-[15px] text-[12px] text-[var(--color-bg-brand-f)] ${styles.fh_text_btn}`}
            >
              <span className="whitespace-nowrap">リフレッシュ</span>
            </button>
          </div>
          <div className={`flex max-h-[26px] w-full  items-center justify-end space-x-[6px]`}>
            <button
              className={`flex-center transition-base03 h-[26px]  cursor-pointer space-x-2  rounded-[2px] px-[15px]  text-[12px]  text-[var(--color-bg-brand-f)] ${styles.fh_text_btn}`}
            >
              <FiLock />
              <span>固定</span>
            </button>
            <button
              className={`flex-center transition-base03 h-[26px]  cursor-pointer space-x-2  rounded-[2px] px-[15px] text-[12px]  text-[var(--color-bg-brand-f)] ${styles.fh_text_btn} `}
            >
              {/* <FiLock /> */}
              <span>モード</span>
            </button>
            <RippleButton title={`カラム編集`} borderRadius="2px" classText="select-none" />
            <ChangeSizeBtn borderRadius="2px" />
          </div>
        </div>
        {/* ================== Gridファンクションヘッダー ここまで ================== */}
        {/* ================== Gridスクロールコンテナ ================== */}
        <div
          role="grid"
          aria-multiselectable="true"
          style={{ width: "100%" }}
          // style={{ height: "100%", "--header-row-height": "35px" } as any}
          className={`${styles.grid_scroll_container} min-h-[203px] ${
            tableContainerSize === "one_third" ? `${styles.grid_scroll_container_one_third}` : ``
          } ${tableContainerSize === "half" ? `${styles.grid_scroll_container_half}` : ``}`}
        >
          {/* ======================== 🌟Grid列トラック Rowヘッダー🌟 ======================== */}
          <div
            role="row"
            tabIndex={-1}
            aria-rowindex={1}
            aria-selected={false}
            className={`${styles.grid_header_row}`}
          ></div>
          {/* ======================== 🌟Grid列トラック Rowヘッダー🌟 ======================== */}
          <div
            className={`${tableContainerSize === "one_third" ? `${styles.search_mode_container_one_third}` : ``} ${
              tableContainerSize === "half" ? `${styles.search_mode_container_half}` : ``
            } ${
              tableContainerSize === "all" ? `${styles.search_mode_container_all}` : ``
            } flex !min-h-[173px] w-[100vw] flex-col`}
          >
            <SkeletonLoadingLines />

            {/* {Array(5)
              .fill(null)
              .map((_, index) => (
                <div
                  style={
                    {
                      height: `31px`,
                      //   top: `${35 * (index + 1)}px`,
                      position: "relative",
                    } as any
                  }
                  className={`${styles.grid_rowgroup_virtualized_container} relative !min-w-[calc(100vw-var(--sidebar-width)-20px)] border-b border-solid border-[var(--color-border-base)] ${styles.skeleton_delay} !mb-[4px] last-of-type:!mb-[0px]`}
                  key={index}
                ></div>
              ))} */}
          </div>

          {/* ================== Gridスクロールコンテナ ここまで ================== */}
          {/* =============== Gridフッター ここから スクロールコンテナと同列で配置 =============== */}
          <div className={`${stylesFooter.grid_footer} !min-w-[calc(100vw-var(--sidebar-width)-20px)]`}>
            <div className={stylesFooter.grid_footer_inner}>
              <div className={`${stylesFooter.grid_pagination} space-x-3`}>
                <button className=" focus:outline-scale-600 flex rounded bg-transparent p-0  outline-offset-1 transition-all focus:outline-4 ">
                  <span className=" font-regular text-scale-1200 bordershadow-scale-600 hover:bordershadow-scale-700 dark:bordershadow-scale-800 hover:dark:bordershadow-scale-900 focus-visible:outline-scale-700 relative inline-flex cursor-pointer items-center space-x-2 rounded border border-[#777] bg-transparent px-[10px] py-[3px] text-center text-xs shadow-sm transition transition-all duration-200 ease-out focus-visible:outline-4 focus-visible:outline-offset-1">
                    <span className="truncate ">
                      {language === "ja" && `- 件`}
                      {language === "en" && "100 rows"}
                    </span>
                  </span>
                </button>
                <p className="text-sm font-medium text-[#bbb]">
                  {language === "ja" && `/ - 件`}
                  {language === "en" && `/ - records`}
                </p>
              </div>
            </div>
          </div>
          {/* ================== Gridフッター ここまで ================== */}
        </div>
      </div>
    </div>
  );
};
