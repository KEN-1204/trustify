import useDashboardStore from "@/store/useDashboardStore";
import useRootStore from "@/store/useRootStore";
import useThemeStore from "@/store/useThemeStore";
import React from "react";
import styles from "/components/GridTable/GridTableAll/GridTableAll.module.css";
import { RippleButton } from "@/components/Parts/RippleButton/RippleButton";
import { ChangeSizeBtn } from "@/components/Parts/ChangeSizeBtn/ChangeSizeBtn";
import { FiLock, FiRefreshCw, FiSearch } from "react-icons/fi";
import useStore from "@/store";
import stylesFooter from "/components/GridTable/GridTableFooter/GridTableFooter.module.css";
import { SkeletonLoadingLineFull } from "@/components/Parts/SkeletonLoading/SkeletonLoadingLineFull";
import { SkeletonLoadingLineLong } from "@/components/Parts/SkeletonLoading/SkeletonLoadingLineLong";
import { SkeletonLoadingLineMedium } from "@/components/Parts/SkeletonLoading/SkeletonLoadingLineMedium";
import { SkeletonLoadingLineShort } from "@/components/Parts/SkeletonLoading/SkeletonLoadingLineShort";
import { CiFilter } from "react-icons/ci";

export const FallbackGridTableAllAMPQ = ({ title }: { title: string }) => {
  const theme = useRootStore(useThemeStore, (state) => state.theme);
  const tableContainerSize = useDashboardStore((state) => state.tableContainerSize);
  const language = useStore((state) => state.language);
  return (
    <div
      className={`${styles.main_container_fallback}  ${
        theme === "light" ? `${styles.theme_f_light}` : `${styles.theme_f_dark}`
      }`}
    >
      {/* ================== Gridテーブルヘッダー ================== */}
      <div className={`${styles.grid_header}`}>
        {/* <div className={`${styles.table_tab} min-h-[22px]`}></div> */}
        <div className={`${styles.table_tab} min-h-[22px]`}>{title}</div>
      </div>

      {/* ================== Gridメインコンテナ ================== */}
      <div className={`${styles.grid_main_container}`}>
        {/* ================== Gridファンクションヘッダー ボタンでページ遷移 ================== */}
        <div className={`${styles.grid_function_header}`}>
          <div className={`flex max-h-[26px] w-full items-center justify-start space-x-[6px]`}>
            <RippleButton
              title={`新規サーチ`}
              // bgColor="var(--color-btn-brand-f-re)"
              classText={`select-none`}
            />
            <RippleButton title={`サーチ編集`} classText="select-none" />
            <button
              className={`flex-center transition-color03 relative  h-[26px] min-w-[118px]  cursor-pointer space-x-1  rounded-[4px] px-[15px] text-[12px] text-[var(--color-bg-brand-f)] ${styles.fh_text_btn}`}
            >
              <div className="flex-center mr-[2px]">
                <FiRefreshCw />
              </div>
              <span className="whitespace-nowrap">リフレッシュ</span>
            </button>
          </div>
          <div className={`flex max-h-[26px] w-full  items-center justify-end space-x-[6px]`}>
            <button
              className={`flex-center transition-base03 h-[26px]  cursor-pointer space-x-2  rounded-[2px] px-[12px]  text-[12px]  text-[#999] ${styles.fh_text_btn}`}
            >
              <FiLock />
              <span>固定</span>
            </button>
            {/* <button
              className={`flex-center transition-base03 h-[26px]  cursor-pointer space-x-2  rounded-[2px] px-[15px] text-[12px]  text-[var(--color-bg-brand-f)] ${styles.fh_text_btn} `}
            >
              <span>モード</span>
            </button> */}

            <button
              className={`flex-center transition-base03 space-x-[6px] rounded-[4px] px-[12px] text-[12px]  text-[var(--color-bg-brand-f)]  ${styles.fh_text_btn} relative cursor-default active:!bg-[var(--color-btn-brand-f)]`}
            >
              <FiSearch className="pointer-events-none text-[14px]" />
              <span>モード設定</span>
            </button>

            <button
              className={`flex-center transition-base03 space-x-[6px] rounded-[4px] px-[12px] text-[12px]  text-[var(--color-bg-brand-f)]  ${styles.fh_text_btn} relative cursor-default`}
            >
              {/* <FiSearch className="pointer-events-none text-[14px]" /> */}
              <CiFilter className="pointer-events-none stroke-[0.5] text-[17px]" />
              <span>フィルター</span>
            </button>
            <RippleButton title={`カラム編集`} classText="select-none" />
            <ChangeSizeBtn />
          </div>
        </div>
        {/* ================== Gridファンクションヘッダー ここまで ================== */}
        {/* ================== Gridスクロールコンテナ ================== */}
        <div
          role="grid"
          aria-multiselectable="true"
          style={{ width: "100%" }}
          // style={{ height: "100%", "--header-row-height": "35px" } as any}
          className={`${styles.grid_scroll_container_fallback} min-h-[calc(100vh/3-var(--header-height)/3-30px-40px)]`}
          // className={`${styles.grid_scroll_container} min-h-[203px] ${
          //   tableContainerSize === "one_third" ? `${styles.grid_scroll_container_one_third}` : ``
          // } ${tableContainerSize === "half" ? `${styles.grid_scroll_container_half}` : ``}`}
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
          {/* ======================== 🌟Grid列トラック Rowトラック🌟 ======================== */}
          <div
            className={`${styles.search_mode_container_one_third_fallback} flex max-h-[calc(100vh/3-var(--header-height)/3-30px-40px-30px-1px)] w-full flex-col `}
            // className={`${styles.search_mode_container_one_third} flex !min-h-[173px] w-full min-w-[96vw] max-w-[96vw] flex-col`}
          >
            {/* <div className="flex h-full max-h-[330px] min-h-[330px] w-full flex-col space-y-[18px] pb-[20px] pl-[20px] pr-[50px] pt-[18px]"> */}
            <div className="flex h-full max-h-[330px]  w-full flex-col space-y-[28px] pb-[20px] pl-[20px] pr-[50px] pt-[18px]">
              {/* <SkeletonLoadingLineFull />
              <SkeletonLoadingLineFull />
              <SkeletonLoadingLineMedium />
              <SkeletonLoadingLineShort /> */}

              {/* <div className="flex flex-col space-y-[12px]"> */}
              <div className="flex flex-col space-y-[12px]">
                <SkeletonLoadingLineFull rounded="rounded-[6px]" h="h-[15px]" />
                <SkeletonLoadingLineFull rounded="rounded-[6px]" h="h-[15px]" />
                <SkeletonLoadingLineMedium rounded="rounded-[6px]" h="h-[15px]" />
              </div>
              {/* <div className="flex flex-col space-y-[12px]"> */}
              <div className="flex flex-col space-y-[12px]">
                <SkeletonLoadingLineLong rounded="rounded-[6px]" h="h-[15px]" />
                <SkeletonLoadingLineShort rounded="rounded-[6px]" h="h-[15px]" />
              </div>
              {/* <div className="h-[5px] w-full"></div> */}
              <div className="min-h-[0px] w-full"></div>
            </div>

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
          {/* ======================== ✅Grid列トラック Rowトラック✅ ======================== */}

          {/* ================== Gridスクロールコンテナ ここまで ================== */}
          {/* =============== Gridフッター ここから スクロールコンテナと同列で配置 =============== */}
          <div
            className={`${stylesFooter.grid_footer} max-h-[30px] min-h-[30px] !min-w-[calc(100vw-var(--sidebar-width)-20px)]`}
          >
            <div className={stylesFooter.grid_footer_inner}>
              <div className={`${stylesFooter.grid_pagination} space-x-2`}>
                <button className=" focus:outline-scale-600 flex rounded bg-transparent p-0  outline-offset-1 transition-all focus:outline-4 ">
                  <span className=" font-regular text-scale-1200 bordershadow-scale-600 hover:bordershadow-scale-700 dark:bordershadow-scale-800 hover:dark:bordershadow-scale-900 focus-visible:outline-scale-700 relative inline-flex cursor-pointer items-center space-x-2 rounded border border-[#777] bg-transparent px-[10px] py-[3px] text-center text-xs shadow-sm transition transition-all duration-200 ease-out focus-visible:outline-4 focus-visible:outline-offset-1">
                    <span className="truncate ">
                      {language === "ja" && `- 件`}
                      {/* {language === "ja" && `1 件`} */}
                      {language === "en" && "- rows"}
                    </span>
                  </span>
                </button>
                <p className="space-x-2 text-sm font-medium text-[#bbb]">
                  <span>/</span>
                  <span>
                    {language === "ja" && `- 件`}
                    {/* {language === "ja" && `0件`} */}
                    {/* {language === "ja" && `1件`} */}
                    {language === "en" && `- records`}
                    {/* {language === "en" && `0 records`} */}
                  </span>
                  {/* {language === "ja" && `/ - 件`}
                  {language === "en" && `/ - records`} */}
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
