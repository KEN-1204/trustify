import React, { CSSProperties, useEffect } from "react";
import styles from "./UnderRightActivityLogCustom.module.css";
import useStore from "@/store";
import useDashboardStore from "@/store/useDashboardStore";
import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import { SkeletonLoadingLineFull } from "@/components/Parts/SkeletonLoading/SkeletonLoadingLineFull";
import { SkeletonLoadingLineLong } from "@/components/Parts/SkeletonLoading/SkeletonLoadingLineLong";
import { SkeletonLoadingLineMedium } from "@/components/Parts/SkeletonLoading/SkeletonLoadingLineMedium";
import { SkeletonLoadingLineShort } from "@/components/Parts/SkeletonLoading/SkeletonLoadingLineShort";
import { FiRefreshCw } from "react-icons/fi";

type Props = {
  isLoading?: boolean;
};

export const FallbackUnderRightActivityLogCustom = ({ isLoading = true }: Props) => {
  const language = useStore((state) => state.language);
  const isOpenSidebar = useDashboardStore((state) => state.isOpenSidebar);
  const tableContainerSize = useDashboardStore((state) => state.tableContainerSize);
  // 活動タイプ、概要、日付、営業担当、事業部、営業所
  const columnHeaderList = [
    "activity_type",
    "summary",
    "activity_date",
    "our_member_name",
    "our_department",
    "our_office",
  ];

  const columnNameToJapanese = (columnName: string) => {
    switch (columnName) {
      case "activity_type":
        return "活動タイプ";
        break;
      case "summary":
        return "概要";
        break;
      case "activity_date":
        return "日付";
        break;
      case "our_member_name":
        return "営業担当";
        break;
      case "our_department":
        return "部署";
        break;
      case "our_office":
        return "事業所";
        break;

      default:
        break;
    }
  };

  // const summaryColumnWidth =
  //   window.innerWidth - 72 - 20 - 20 - 4 - (window.innerWidth / 2 - 72 - 10 - 2) - 90 * 5 - 2;

  const underLogTableAllWidth = window.innerWidth - 72 - 20 - 20 - 4 - (window.innerWidth / 2 - 72 - 10 - 2) - 2; // テーブル全体の横幅

  const getColumnHeaderWidth = (i: number) => {
    const underLogTableAllWidth = window.innerWidth - 72 - 20 - 20 - 4 - (window.innerWidth / 2 - 72 - 10 - 2) - 2; // テーブル全体の横幅
    const baseColumnWidth = underLogTableAllWidth / 8; // 他5個のカラムは1つ分 => 1/8
    const summaryColumnWidth = (underLogTableAllWidth / 8) * 3; // 概要カラムのみ3つ分 => 3/8

    switch (i) {
      case 1:
        return summaryColumnWidth;
        break;
      default:
        return baseColumnWidth;
        break;
    }
  };

  // 最後の事業所カラムは右ボーダーを付けない

  return (
    <>
      <div
        className={`${styles.right_activity_log_container}  w-full bg-[var(--color-bg-under-back)] ${
          isOpenSidebar ? `${styles.open} transition-base02` : `${styles.close} transition-base01`
        } ${tableContainerSize === "half" ? `${styles.company_table_screen_pr}` : ``} ${
          tableContainerSize === "all" ? `${styles.company_table_screen_pr}` : ``
        }`}
        style={{ ...(!isLoading && { minHeight: "74px", marginTop: `5px` }) }}
      >
        {/* ================== テーブルタブヘッダー ================== */}
        <div className={`${styles.right_table_tab_header}`}>
          <span>活動履歴</span>
          <div
            className={`flex-center transition-bg03 group ml-[22px] cursor-not-allowed space-x-[9px] px-[10px] py-[2px] text-[#999]`}
          >
            <FiRefreshCw className="text-[11px]" />
            <span className={``}>リフレッシュ</span>
          </div>
        </div>
        {/* ================== Gridスクロールコンテナ ================== */}
        <div
          //   ref={parentGridScrollContainer}
          role="grid"
          aria-multiselectable="true"
          style={{ width: "100%" }}
          // style={{ height: "100%", "--header-row-height": "35px" } as any}
          className={`${styles.under_grid_scroll_container_fallback}`}
        >
          {/* ======================== 🌟Grid列トラック Rowヘッダー🌟 ======================== */}
          <div
            role="row"
            tabIndex={-1}
            aria-rowindex={1}
            aria-selected={false}
            className={`${styles.grid_header_row_fallback}`}
            style={
              {
                display: "grid",
                // gridTemplateColumns: `1fr 3fr repeat(4, 1fr)`,
                // gridTemplateColumns: `1fr 2fr repeat(4, 1fr)`,
                gridTemplateColumns: `90px 1fr repeat(4, 90px)`,
                minHeight: "25px",
                // width: `100%`,
                minWidth: `660px`,
                width: `var(--row-width)`,
                "--row-width": "100%",
                // width: `var(--row-width)`,
                // "--row-width": "700px",
              } as CSSProperties
            }
          >
            {/* ======== ヘッダーセル 全てのプロパティ(フィールド)Column ここから  ======== */}
            {columnHeaderList.map((key, index) => (
              <div
                // key={index}
                key={key}
                // ref={(ref) => (colsRef.current[index] = ref)}
                role="columnheader"
                draggable={false}
                aria-colindex={index + 1}
                aria-selected={false}
                tabIndex={-1}
                className={`${styles.grid_column_header_all}`}
                // style={{ gridColumnStart: index + 1, width: `${getColumnHeaderWidth(index)}px` }}
                style={{
                  gridColumnStart: index + 1,
                  ...(columnHeaderList.length - 1 === index && { borderRightStyle: "none" }),
                }}
              >
                <div className={`draggable_column_header pointer-events-none w-full`}>
                  <div
                    className={`${styles.grid_column_header} ${
                      index === 0 && styles.grid_column_header_cursor
                    } pointer-events-none touch-none select-none`}
                  >
                    <div className={`${styles.grid_column_header_inner} pointer-events-none`}>
                      <span
                        className={`${styles.grid_column_header_inner_name} pointer-events-none`}
                        // ref={(ref) => (columnHeaderInnerTextRef.current[index] = ref)}
                      >
                        {language === "en" && key}
                        {language === "ja" && columnNameToJapanese(key)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* ======================== ✅Grid列トラック Rowヘッダー✅ ここまで ======================== */}

          {/* ======================== 🌟Grid列トラック Rowグループコンテナ🌟 ======================== */}
          {/* <div className={`flex h-[calc(100%-25px)] w-full flex-col space-y-[22px] px-[15px] py-[15px]`}> */}
          {isLoading && (
            <div className={`flex h-[90px] w-full flex-col space-y-[22px] px-[15px] py-[15px]`}>
              <>
                <div className="flex flex-col space-y-[10px]">
                  <SkeletonLoadingLineFull rounded="rounded-[6px]" />
                  <SkeletonLoadingLineFull rounded="rounded-[6px]" />
                  <SkeletonLoadingLineMedium rounded="rounded-[6px]" />
                </div>
                {/* <div className="flex flex-col space-y-[10px]">
                  <SkeletonLoadingLineLong rounded="rounded-[6px]" />
                  <SkeletonLoadingLineShort rounded="rounded-[6px]" />
                </div> */}
              </>
            </div>
          )}
          {!isLoading && (
            <div className={`flex h-[0px] w-full flex-col space-y-[22px] px-[15px] py-[0px]`}>
              <></>
            </div>
          )}
          {/* ======================== ✅Grid列トラック Rowグループコンテナ✅ ======================== */}
        </div>
        {/* ================== Gridスクロールコンテナ ここまで ================== */}
        {/* =============== Gridフッター ここから スクロールコンテナと同列で配置 =============== */}
        {/* <UnderRightGridTableFooter getItemCount={allRows.length} /> */}
        <div className={styles.grid_footer}>
          <div className={styles.grid_footer_inner}>
            <div className={`${styles.grid_pagination} space-x-3 px-[10px] `}>
              <button className=" focus:outline-scale-600 flex rounded bg-transparent p-0  outline-offset-1 transition-all focus:outline-4 ">
                <span className=" font-regular text-scale-1200 bordershadow-scale-600 hover:bordershadow-scale-700 dark:bordershadow-scale-800 hover:dark:bordershadow-scale-900 focus-visible:outline-scale-700 relative inline-flex cursor-pointer items-center space-x-2 rounded border border-[#777] bg-transparent px-[0px] text-center text-[12px] shadow-sm  duration-200 ease-out focus-visible:outline-4 focus-visible:outline-offset-1">
                  <span className="truncate text-[var(--color-text-title)]">- 件</span>
                </span>
              </button>
              <p className="space-x-2 text-[13px] font-medium text-[#bbb]">
                <span>/</span>
                <span>
                  {/* {language === "ja" && `0 件`}
                  {language === "en" && "0 records"} */}
                  {language === "ja" && `- 件`}
                  {language === "en" && "- records"}
                  {/* {language === "ja" && `/ -件`}
                  {language === "en" && "/ - records"} */}
                </span>
              </p>
            </div>
          </div>
        </div>
        {/* ================== Gridフッター ここまで ================== */}
      </div>
    </>
  );
};
