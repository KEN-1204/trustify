import React, { CSSProperties, FC, memo, useCallback, useEffect, useRef, useState } from "react";
import styles from "./AttendeesListTable.module.css";
import useStore from "@/store";
import useDashboardStore from "@/store/useDashboardStore";
import { AttendeeInfo } from "@/types";
import { mappingPositionClass } from "@/utils/mappings";
// import { rightRowData } from "./data";

type Props = {
  attendeesArray: AttendeeInfo[];
  isSelected: boolean;
};

const AttendeesListTableMemo: FC<Props> = ({ attendeesArray, isSelected }) => {
  const language = useStore((state) => state.language);
  const isOpenSidebar = useDashboardStore((state) => state.isOpenSidebar);
  const tableContainerSize = useDashboardStore((state) => state.tableContainerSize);
  const underDisplayFullScreen = useDashboardStore((state) => state.underDisplayFullScreen);
  // --------------- 🔹モード設定 ---------------
  const evenRowColorChange = useDashboardStore((state) => state.evenRowColorChange);
  // --------------- 🔹モード設定ここまで ---------------

  // ダブルクリックでセルの詳細を確認
  const setIsOpenEditModal = useDashboardStore((state) => state.setIsOpenEditModal);
  const setTextareaInput = useDashboardStore((state) => state.setTextareaInput);

  // カラム列全てにindex付きのrefを渡す
  const colsRef = useRef<(HTMLDivElement | null)[]>([]);
  // カラムのテキストの3点リーダー適用有無確認のためのテキストサイズ保持Ref
  const columnHeaderInnerTextRef = useRef<(HTMLSpanElement | null)[]>([]);
  // カラムのリサイズ用オーバーレイ
  const draggableOverlaysRef = useRef<(HTMLDivElement | null)[]>([]);
  // スクロールコンテナDOM
  const parentGridScrollContainer = useRef<HTMLDivElement | null>(null);
  // Rowグループコンテナ(Virtualize収納用インナー)
  const gridRowGroupContainerRef = useRef<HTMLDivElement | null>(null);

  // ===================== 🌟ツールチップ 3点リーダーの時にツールチップ表示🌟 =====================
  const setHoveredItemPos = useStore((state) => state.setHoveredItemPos);
  type TooltipParams = {
    e: React.MouseEvent<HTMLElement, MouseEvent>;
    display: string;
    content: string;
    content2?: string | undefined | null;
    marginTop?: number;
    itemsPosition?: string;
  };
  const handleOpenTooltip = ({
    e,
    display,
    content,
    content2,
    marginTop = 0,
    itemsPosition = "start",
  }: TooltipParams) => {
    // ホバーしたアイテムにツールチップを表示
    const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
    // console.log("ツールチップx, y width , height", x, y, width, height);

    setHoveredItemPos({
      x: x,
      y: y,
      itemWidth: width,
      itemHeight: height,
      content: content,
      content2: content2,
      display: display,
      marginTop: marginTop,
      itemsPosition: itemsPosition,
    });
  };
  // ツールチップを非表示
  const handleCloseTooltip = () => {
    setHoveredItemPos(null);
  };
  // ===================== ✅ツールチップ 3点リーダーの時にツールチップ表示✅ =====================

  // ================== 🌟セル シングルクリック、ダブルクリックイベント ==================
  // クリックで概要の詳細を確認
  const setTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSingleClickGridCell = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (setTimeoutRef.current !== null) return;

    setTimeoutRef.current = setTimeout(() => {
      setTimeoutRef.current = null;
      // シングルクリック時に実行したい処理
      // 0.2秒後に実行されてしまうためここには書かない
    }, 200);

    console.log("シングルクリック");
  }, []);

  // セルダブルクリック
  const handleDoubleClickGridCell = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, index: number, columnName: string) => {
      console.log("ダブルクリック", e.currentTarget, "index", index);
      //   if (columnName !== "summary") return console.log("ダブルクリック summaryでないためリターン");

      if (setTimeoutRef.current) {
        clearTimeout(setTimeoutRef.current);

        // console.log(e.detail);
        setTimeoutRef.current = null;
        // ダブルクリック時に実行したい処理

        // クリックした要素のテキストを格納
        // const text = e.currentTarget.innerText;
        const text = e.currentTarget.innerHTML;
        setTextareaInput(text);
        setIsOpenEditModal(true);
      }
    },
    [setTextareaInput, setIsOpenEditModal]
  );
  // ================== 🌟セル シングルクリック、ダブルクリックイベント ここまで ==================

  const columnNameToJapanese = (columnName: string) => {
    switch (columnName) {
      case "attendee_company":
        return "会社";
        break;
      case "attendee_department_name":
        return "部署";
        break;
      case "attendee_name":
        return "同席者";
        break;
      case "attendee_position_name":
        return "役職名";
        break;
      case "attendee_direct_line":
        return "直通TEL";
        break;
      case "attendee_email":
        return "Email";
        break;
      case "attendee_position_class":
        return "職位";
        break;

      default:
        break;
    }
  };

  // 活動タイプ、概要、日付、営業担当、事業部、営業所
  const columnHeaderList = [
    "attendee_company",
    "attendee_department_name",
    "attendee_name",
    "attendee_position_name",
    "attendee_direct_line",
    "attendee_email",
    "attendee_position_class",
  ];

  // 🌟現在のカラム.map((obj) => Object.values(row)[obj.columnId])で展開してGridセルを表示する
  // カラムNameの値のみ配列バージョンで順番入れ替え
  const columnOrder = [...columnHeaderList].map((columnName, index) => columnName as keyof AttendeeInfo); // columnNameのみの配列を取得

  // 「日付」カラムのセルはformat()関数を通してブラウザに表示する
  //   const formatMapping: {
  //     activity_date: string;
  //     [key: string]: string;
  //   } = {
  //     activity_date: "yyyy/MM/dd",
  //   };

  console.log("同席者テーブルレンダリング", "attendeesArray", attendeesArray);

  return (
    <>
      <div
        className={`${styles.right_activity_log_container} ${
          underDisplayFullScreen && `${styles.full_screen}`
        }  w-full bg-[var(--color-bg-under-back)] ${
          isOpenSidebar ? `${styles.open} transition-base02` : `${styles.close} transition-base01`
        } ${tableContainerSize === "half" ? `${styles.company_table_screen_pr}` : ``} ${
          tableContainerSize === "all" ? `${styles.company_table_screen_pr}` : ``
        }`}
      >
        {/* ================== テーブルタブヘッダー ================== */}
        <div className={`${styles.right_table_tab_header}`}>
          <span>同席者リスト</span>
        </div>
        {/* ================== Gridスクロールコンテナ ================== */}
        <div
          ref={parentGridScrollContainer}
          role="grid"
          aria-multiselectable="true"
          style={{ width: "100%" }}
          // style={{ height: "100%", "--header-row-height": "35px" } as any}
          className={`${styles.under_grid_scroll_container}`}
        >
          {/* ======================== 🌟Grid列トラック Rowヘッダー🌟 ======================== */}
          <div
            role="row"
            tabIndex={-1}
            aria-rowindex={1}
            aria-selected={false}
            className={`${styles.grid_header_row}`}
            style={
              {
                display: "grid",
                // gridTemplateColumns: `2fr 1fr repeat(5, 1fr)`,
                gridTemplateColumns: `180px 1fr repeat(5, 1fr)`,
                minHeight: "25px",
                //   width: `100%`,
                minWidth: `800px`,
                width: `var(--row-width)`,
                "--row-width": "100%",
                // width: `var(--row-width)`,
                // "--row-width": "800px",
              } as CSSProperties
            }
          >
            {/* ======== ヘッダーセル 全てのプロパティ(フィールド)Column ここから  ======== */}
            {columnHeaderList.map((key, index) => (
              <div
                // key={index}
                key={key}
                ref={(ref) => (colsRef.current[index] = ref)}
                role="columnheader"
                draggable={false}
                aria-colindex={index + 1}
                aria-selected={false}
                tabIndex={-1}
                className={`${styles.grid_column_header_all}`}
                // style={{ gridColumnStart: index + 1 }}
                style={{
                  gridColumnStart: index + 1,
                  //   ...(columnHeaderList.length - 1 === index && { borderRightStyle: "none" }),
                  // ...(index === columnHeaderList.length - 1 && { borderRight: "none" }),
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
                        ref={(ref) => (columnHeaderInnerTextRef.current[index] = ref)}
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

          {/* {rowVirtualizer.getVirtualItems().length === 0 && !!selectedRowDataContact && !isLoading && (
            <div className={`flex-col-center h-[calc(100%-25px)] w-full`}>
              <span className={`text-[var(--color-text-sub)]`}>この客先への活動履歴はまだありません。</span>
            </div>
          )} */}
          {/* {!(allRows.length > 0) && !!selectedRowDataContact && isLoading && (
            <div className={`flex h-[calc(100%-25px)] w-full flex-col space-y-[22px] px-[15px] py-[15px]`}>
              <div className="flex flex-col space-y-[10px]">
                <SkeletonLoadingLineFull rounded="rounded-[6px]" />
                <SkeletonLoadingLineFull rounded="rounded-[6px]" />
                <SkeletonLoadingLineMedium rounded="rounded-[6px]" />
              </div>
              <div className="flex flex-col space-y-[10px]">
                <SkeletonLoadingLineLong rounded="rounded-[6px]" />
                <SkeletonLoadingLineShort rounded="rounded-[6px]" />
              </div>
            </div>
          )} */}

          {/* ======================== 🌟Grid列トラック Rowグループコンテナ🌟 ======================== */}
          {/* Rowアイテム収納のためのインナー要素 */}
          {attendeesArray.length > 0 && (
            <div
              ref={gridRowGroupContainerRef}
              role="rowgroup"
              style={
                {
                  height: `${attendeesArray.length * 25}px`,
                  //   height: `${10 * 25}px`,
                  position: "relative",
                  "--header-row-height": "25px",
                  minWidth: `800px`,
                  width: `var(--row-width)`,
                  "--row-width": "100%",
                  // width: `var(--row-width)`,
                  // "--row-width": "",
                } as any
              }
              className={`${styles.grid_rowgroup_virtualized_container}`}
            >
              {attendeesArray.map((attendee: { [key: string]: string | number | null }, index: number) => {
                return (
                  <div
                    key={attendee.attendee_id}
                    role="row"
                    tabIndex={-1}
                    aria-rowindex={index + 2} // ヘッダーの次からで+1、indexは0からなので+1で、index0に+2
                    aria-selected={false}
                    className={`${styles.grid_row} ${evenRowColorChange ? `${styles.even_color_change}` : ``}`}
                    style={{
                      display: "grid",
                      // gridTemplateColumns: `2fr 1fr repeat(5, 1fr)`,
                      gridTemplateColumns: `180px 1fr repeat(5, 1fr)`,
                      minHeight: "25px",
                      width: `100%`,
                      top: ((index + 0) * 25).toString() + "px", // +1か0か
                    }}
                  >
                    {columnOrder.map((value, index) => {
                      const columnName = columnHeaderList[index];
                      //   let displayValue = value;
                      //   // 「日付」のカラムのセルには、formatして表示する
                      //   if (columnName in formatMapping && !!value) {
                      //     displayValue = format(new Date(value), formatMapping[columnName]);
                      //   }
                      let displayValue = attendee[columnName];
                      if (columnName === "attendee_position_class" && typeof displayValue === "number") {
                        displayValue = mappingPositionClass[displayValue]?.[language]
                          ? mappingPositionClass[displayValue]?.[language]
                          : "";
                      }
                      return (
                        <div
                          key={"row" + attendee.attendee_id + index.toString()}
                          role="gridcell"
                          aria-colindex={index + 1} // カラムヘッダーの列StateのcolumnIndexと一致させる
                          aria-selected={false}
                          tabIndex={-1}
                          className={`${styles.grid_cell} ${styles.grid_cell_resizable}`}
                          style={{
                            gridColumnStart: index + 1,
                            ...(columnHeaderList[index] === "summary" && { cursor: "pointer" }),
                            // ...(columnHeaderList.length - 1 === index && { borderRight: "none" }),
                            // ...(index === columnHeaderList.length - 1 && { borderRight: "none" }),
                          }}
                          onClick={handleSingleClickGridCell}
                          onDoubleClick={(e) => handleDoubleClickGridCell(e, index, columnHeaderList[index])}
                        >
                          {displayValue}
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* {Array(10)
                .fill(null)
                .map((item, index) => (
                  <div
                    key={"temp" + index.toString()}
                    role="row"
                    tabIndex={-1}
                    aria-rowindex={index + 0 + 2} // ヘッダーの次からで+1、indexは0からなので+1で、index0に+2
                    aria-selected={false}
                    className={`${styles.grid_row}`}
                    style={{
                      display: "grid",
                      // gridTemplateColumns: `2fr 1fr repeat(5, 1fr)`,
                      gridTemplateColumns: `180px 1fr repeat(5, 1fr)`,
                      minHeight: "25px",
                      width: `100%`,
                      top: ((index + 0 + 0) * 25).toString() + "px", // +1か0か
                    }}
                  >
                    {columnOrder.map((value, index) => {
                      return (
                        <div
                          key={"tempRow" + index.toString()}
                          role="gridcell"
                          aria-colindex={index + 1} // カラムヘッダーの列StateのcolumnIndexと一致させる
                          aria-selected={false}
                          tabIndex={-1}
                          className={`${styles.grid_cell} ${styles.grid_cell_resizable}`}
                          style={{
                            gridColumnStart: index + 1,
                            ...(columnHeaderList[index] === "summary" && { cursor: "pointer" }),
                            ...(columnHeaderList.length - 1 === index && { borderRight: "none" }),
                          }}
                          onClick={handleSingleClickGridCell}
                          onDoubleClick={(e) => handleDoubleClickGridCell(e, index, columnHeaderList[index])}
                        >
                          佐藤
                        </div>
                      );
                    })}
                  </div>
                ))} */}
            </div>
          )}
          {/* ======================== Grid列トラック Row ======================== */}
        </div>
        {/* <div ref={shadowRef} className={`${styles.show}`}></div> */}
        {/* ================== Gridスクロールコンテナ ここまで ================== */}
        {/* =============== Gridフッター ここから スクロールコンテナと同列で配置 =============== */}
        {/* <ContactUnderRightGridTableFooter getItemCount={allRows.length} /> */}
        {/* <UnderRightGridTableFooter getItemCount={allRows.length} getTotalCount={data ? data.pages[0].count : 0} /> */}
        <div className={styles.grid_footer}>
          <div className={styles.grid_footer_inner}>
            <div className={`${styles.grid_pagination} space-x-3 px-[10px] `}>
              <div className=" focus:outline-scale-600 pointer-events-none flex rounded bg-transparent  p-0 outline-offset-1 transition-all focus:outline-4">
                <span className=" font-regular text-scale-1200 bordershadow-scale-600 hover:bordershadow-scale-700 dark:bordershadow-scale-800 hover:dark:bordershadow-scale-900 focus-visible:outline-scale-700 relative inline-flex items-center space-x-2 rounded border border-[#777] bg-transparent px-[0px] text-center text-[12px] shadow-sm  duration-200 ease-out focus-visible:outline-4 focus-visible:outline-offset-1">
                  <span className="truncate ">
                    {language === "ja" &&
                      `${
                        isSelected && attendeesArray.length !== null && attendeesArray.length !== undefined
                          ? attendeesArray.length
                          : `-`
                      } 人`}
                    {language === "en" &&
                      `${
                        isSelected && attendeesArray.length !== null && attendeesArray.length !== undefined
                          ? attendeesArray.length
                          : `-`
                      } rows`}
                  </span>
                </span>
              </div>
              {/* <p className="pointer-events-none space-x-2 text-[13px] font-medium text-[#bbb]">
                <span>/</span>
                <span>
                  {language === "ja" && `${attendeesArray.length === null ? "-" : attendeesArray.length} 件`}
                  {language === "en" && `${attendeesArray.length === null ? "-" : attendeesArray.length} records`}
                </span>
              </p> */}
            </div>
          </div>
        </div>
        {/* ================== Gridフッター ここまで ================== */}
      </div>
    </>
  );
};

export const AttendeesListTable = memo(AttendeesListTableMemo);
