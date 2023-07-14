import React, { FC, memo, useEffect, useRef, useState } from "react";
import styles from "./UnderRightActivityLog.module.css";
import useStore from "@/store";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import useDashboardStore from "@/store/useDashboardStore";
import useRootStore from "@/store/useRootStore";
import { GridTableFooter } from "@/components/GridTable/GridTableFooter/GridTableFooter";
import { UnderRightGridTableFooter } from "./UnderRightGridTableFooter";

type TableDataType = {
  activityType: string;
  summary: string;
  date: string;
  sales: string;
  department: string;
  office: string;
};

type ColumnHeaderList = {
  activityType: string;
  summary: string;
  date: string;
  sales: string;
  department: string;
  office: string;
};

const UnderRightActivityLogMemo: FC = () => {
  const language = useStore((state) => state.language);
  //   const language = useRootStore(useStore, (state) => state.language);
  // const isOpenSidebar = useRootStore(useDashboardStore, (state) => state.isOpenSidebar);
  const isOpenSidebar = useDashboardStore((state) => state.isOpenSidebar);
  // コンテナのサイズを全体と半分で更新するためのState
  //   const tableContainerSize = useRootStore(useDashboardStore, (state) => state.tableContainerSize);
  const tableContainerSize = useDashboardStore((state) => state.tableContainerSize);
  // const [containerSize, setcontainerSize] = useState("all");
  // 初回マウント時にdataがフェッチできたらtrueにしてuseEffectでカラム生成を実行するstate
  const [gotData, setGotData] = useState(false);
  // 各カラムの横幅を管理
  const [colsWidth, setColsWidth] = useState<string[] | null>(null);
  // 現在のカラムの横幅をrefで管理
  const currentColsWidths = useRef<string[]>([]);

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

  const columnNameToJapanese = (columnName: string) => {
    switch (columnName) {
      case "activityType":
        return "活動タイプ";
        break;
      case "summary":
        return "概要";
        break;
      case "date":
        return "日付";
        break;
      case "sales":
        return "営業担当";
        break;
      case "department":
        return "部署";
        break;
      case "office":
        return "事業所";
        break;

      default:
        break;
    }
  };

  // 活動タイプ、概要、日付、営業担当、事業部、営業所
  const columnHeaderList = ["activityType", "summary", "date", "sales", "department", "office"];

  // ================== 🌟疑似的なサーバーデータフェッチ用の関数🌟 ==================
  const fetchServerPage = async (
    limit: number,
    offset: number = 0
  ): Promise<{ rows: TableDataType[]; nextOffset: number }> => {
    // useInfiniteQueryのクエリ関数で渡すlimitの個数分でIndex番号を付けたRowの配列を生成
    const rows = new Array(limit).fill(0).map((e, index) => {
      const newData: TableDataType = {
        activityType: `TEL発信`,
        summary: "50ミクロンで測定したい",
        date: "2021/06/01",
        sales: "伊藤謙太",
        department: "メトロロジ",
        office: "東京営業所",
      };
      return newData;
    });

    // 0.5秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 取得したrowsを返す（nextOffsetは、queryFnのctx.pageParamsが初回フェッチはundefinedで2回目が1のため+1でページ数と合わせる）
    return { rows, nextOffset: offset + 1 };
  };

  // ================== 🌟useInfiniteQueryフック🌟 ==================
  const { status, data, error, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["activities", "株式会社キーエンスのid"],
    queryFn: async (ctx) => {
      return fetchServerPage(50, ctx.pageParam); // 50個ずつ取得
    },
    getNextPageParam: (_lastGroup, groups) => groups.length,
    staleTime: Infinity,
  });
  // ================== 🌟useInfiniteQueryフック🌟 ここまで ==================

  // ------------------------ useInfiniteQueryカスタムフック ------------------------
  //   const { status, data, error, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteQueryData();

  // 現在取得している全ての行 data.pagesのネストした配列を一つの配列にフラット化
  const allRows = data ? data.pages.flatMap((d) => d?.rows) : [];

  // ============================= 🌟バーチャライザーのインスタンスを生成🌟 =============================
  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? allRows.length + 1 : allRows.length, // 次のページ有り lengthを１増やす
    getScrollElement: () => parentGridScrollContainer.current, // スクロール用コンテナ
    // estimateSize: () => 35, // 要素のサイズ
    estimateSize: () => 25, // 要素のサイズ
    overscan: 20, // ビューポート外にレンダリングさせる個数
  });
  // 🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟 高さ 🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟
  // ======================== 🌟バーチャライザーのインスタンスを生成🌟 ここまで ========================

  // ============================= 🌟無限スクロールの処理 追加でフェッチ🌟 =============================
  useEffect(() => {
    if (!rowVirtualizer) return;
    // 現在保持している配列内の最後のアイテムをreverseで先頭にしてから分割代入で取得
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();
    if (!lastItem) {
      return;
    }

    // ================= lastItem.indexに到達 追加フェッチ =================
    // 最後のアイテムindexが総数-1を超え、まだフェッチできるページがあり、フェッチ中でないなら
    if (lastItem.index >= allRows.length - 1 && hasNextPage && !isFetchingNextPage) {
      // queryFnで設定した関数 limitは10で10個ずつフェッチで設定
      fetchNextPage(); // 追加でフェッチ
    }
    // ================= lastItem.indexに到達 追加フェッチ ここまで =================
  }, [hasNextPage, fetchNextPage, allRows.length, isFetchingNextPage, rowVirtualizer.getVirtualItems()]);
  // ======================= 🌟無限スクロールの処理 追加でフェッチ🌟 ここまで =======================

  // ============================== 🌟無限スクロールの処理 追加でフェッチ ==============================

  // ========================= 🌟useEffect 初回DBからフェッチ完了を通知する🌟 =========================
  useEffect(() => {
    if (gotData) return;
    // 初回マウント データ取得完了後Stateをtrueに変更通知して、カラム生成useEffectを実行
    if (data) {
      setGotData(true);
      return;
    }
  }, [data]);
  // ======================= 🌟useEffect 初回DBからフェッチ完了を通知する🌟 ここまで =======================

  // =============================== 🌟useEffect ヘッダーカラム生成🌟 ===============================
  // 取得したデータが変更された場合、プロパティ(フィールド)の数が変わる場合があるので、
  // 変更があった場合には再度カラム列の数とサイズを現在取得しているデータでリセット
  useEffect(() => {
    if (!data?.pages[0]) return;
    console.log("🌟ヘッダーカラム生成 gotData ===========================", gotData);

    // ========================= 🔥初回ヘッダー生成ルート ルート =========================

    // マウント時に各フィールド分のカラムを生成 サイズはデフォルト値を65px, 100px, 3列目以降は250pxに設定 チェックボックスは無いため + 1は不要
    // const newColsWidths = new Array(Object.keys(data?.pages[0].rows[0] as object).length + 1).fill("90px");
    const newColsWidths = new Array(Object.keys(data?.pages[0].rows[0] as object).length).fill("90px");
    // newColsWidths.fill("90px", 0, 1); // 1列目を65pxに変更
    newColsWidths.fill("250px", 1, 2); // 2列目を100pxに変更
    newColsWidths.fill("90px", 2, 3); // 3列目を100pxに変更
    newColsWidths.fill("80px", 3, 4); // 3列目を100pxに変更
    console.log("Stateにカラムwidthを保存", newColsWidths);
    // ['65px', '100px', '250px', '50px', '119px', '142px', '250px', '250px']
    // stateに現在の全てのカラムのwidthを保存
    setColsWidth(newColsWidths);
    currentColsWidths.current = newColsWidths;
    // refオブジェクトに保存
    currentColsWidths.current = newColsWidths;

    if (parentGridScrollContainer.current === null) return;

    // ====================== CSSカスタムプロパティに反映 ======================
    // newColsWidthの各値のpxの文字を削除
    // ['65px', '100px', '250px', '250px', '250px', '250px']から
    // ['65', '100', '250', '250', '250', '250']へ置換
    const newColsWidthNum = newColsWidths.map((col) => {
      return col.replace("px", "");
    });

    // それぞれのカラムの合計値を取得 +aで文字列から数値型に変換して合計値を取得
    let sumRowWidth = newColsWidthNum.reduce((a, b) => {
      return +a + +b;
    });

    // それぞれのCSSカスタムプロパティをセット
    // grid-template-columnsの値となるCSSカスタムプロパティをセット
    parentGridScrollContainer.current.style.setProperty("--template-columns", `${newColsWidths.join(" ")}`);
    // 🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟 高さ 🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟
    parentGridScrollContainer.current.style.setProperty("--header-row-height", "25px");
    parentGridScrollContainer.current.style.setProperty("--row-width", `${sumRowWidth}px`);
    // 🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟 高さ 🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟
    parentGridScrollContainer.current.style.setProperty("--summary-row-height", "25px");
  }, [gotData]); // gotDataのstateがtrueになったら再度実行
  // ========================== 🌟useEffect ヘッダーカラム生成🌟 ここまで ==========================

  // 🌟現在のカラム.map((obj) => Object.values(row)[obj.columnId])で展開してGridセルを表示する
  // カラムNameの値のみ配列バージョンで順番入れ替え
  const columnOrder = [...columnHeaderList].map((columnName, index) => columnName as keyof TableDataType); // columnNameのみの配列を取得

  return (
    <>
      <div
        className={`${styles.right_activity_log_container}  w-full bg-[var(--color-bg-under-back)] ${
          isOpenSidebar ? `${styles.open} transition-base02` : `${styles.close} transition-base01`
        } ${tableContainerSize === "half" ? `${styles.company_table_screen_pr}` : ``} ${
          tableContainerSize === "all" ? `${styles.company_table_screen_pr}` : ``
        }`}
      >
        {/* ================== テーブルタブヘッダー ================== */}
        <div className={`${styles.right_table_tab_header}`}>活動履歴</div>
        {/* ================== Gridスクロールコンテナ ================== */}
        <div
          ref={parentGridScrollContainer}
          role="grid"
          aria-multiselectable="true"
          style={{ width: "100%" }}
          // style={{ height: "100%", "--header-row-height": "35px" } as any}
          className={`${styles.grid_scroll_container}`}
        >
          {/* ======================== 🌟Grid列トラック Rowヘッダー🌟 ======================== */}
          <div role="row" tabIndex={-1} aria-rowindex={1} aria-selected={false} className={`${styles.grid_header_row}`}>
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
                style={{ gridColumnStart: index + 1 }}
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
                        {language === "En" && key}
                        {language === "Ja" && columnNameToJapanese(key)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ======================== 🌟Grid列トラック Rowグループコンテナ🌟 ======================== */}
          {/* Rowアイテム収納のためのインナー要素 */}
          <div
            ref={gridRowGroupContainerRef}
            role="rowgroup"
            style={
              {
                height: `${rowVirtualizer.getTotalSize()}px`,
                // width: "100%",
                width: `var(--row-width)`,
                position: "relative",
                // "--header-row-height": "35px",
                "--header-row-height": "25px",
                "--row-width": "",
              } as any
            }
            className={`${styles.grid_rowgroup_virtualized_container}`}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const isLoaderRow = virtualRow.index > allRows.length - 1;
              const rowData = allRows[virtualRow.index];

              // console.log(`rowData`, rowData);
              // console.log(`rowData.name`, rowData.name);
              // console.log(
              //   `${columnOrder.map((obj) => Object.values(rowData)[obj.columnId])}`,
              //   columnOrder.map((obj) => Object.values(rowData)[obj.columnId])
              // );

              // ========= 🌟ローディング中の行トラック =========
              // if (isLoaderRow) return hasNextPage ? "Loading more" : "Nothing more to load";
              if (isLoaderRow) {
                return (
                  <div
                    key={virtualRow.index.toString() + "Loading"}
                    role="row"
                    tabIndex={-1}
                    // aria-rowindex={virtualRow.index + 1} // ヘッダーの次からなのでindex0+2
                    aria-selected={false}
                    className={`${styles.loading_reflection} flex-center mx-auto h-[25px] w-full text-center font-bold`}
                    // className={`${styles.loading_reflection} flex-center mx-auto h-[35px] w-full text-center font-bold`}
                  >
                    <span className={`${styles.reflection}`}></span>
                    <div className={styles.spinner78}></div>
                  </div>
                );
              }
              // ========= 🌟ローディング中の行トラック ここまで =========
              /* ======================== Grid列トラック Row ======================== */
              return (
                <div
                  key={"row" + virtualRow.index.toString()}
                  role="row"
                  tabIndex={-1}
                  aria-rowindex={virtualRow.index + 2} // ヘッダーの次からで+1、indexは0からなので+1で、index0に+2
                  aria-selected={false}
                  className={`${styles.grid_row}`}
                  style={{
                    // gridTemplateColumns: colsWidth.join(" "),
                    // top: gridRowTrackTopPosition(index),
                    // top: ((virtualRow.index + 0) * 35).toString() + "px", // +1か0か
                    top: ((virtualRow.index + 0) * 25).toString() + "px", // +1か0か
                  }}
                >
                  {/* ======== gridセル 全てのプロパティ(フィールド)セル  ======== */}

                  {rowData ? (
                    // カラム順番が変更されているなら順番を合わせてからmap()で展開 上はcolumnNameで呼び出し
                    columnOrder
                      .map((columnName) => rowData[columnName])
                      .map((value, index) => (
                        <div
                          key={"row" + virtualRow.index.toString() + index.toString()}
                          role="gridcell"
                          aria-colindex={index + 1} // カラムヘッダーの列StateのcolumnIndexと一致させる
                          aria-selected={false}
                          tabIndex={-1}
                          className={`${styles.grid_cell} ${styles.grid_cell_resizable}`}
                          style={{
                            gridColumnStart: index + 1,
                          }}
                        >
                          {value}
                        </div>
                      ))
                  ) : (
                    // カラム順番が変更されていない場合には、初期のallRows[0]のrowからmap()で展開
                    <div
                      key={virtualRow.index.toString() + "Loading..."}
                      role="row"
                      tabIndex={-1}
                      // aria-rowindex={virtualRow.index + 1} // ヘッダーの次からなのでindex0+2
                      aria-selected={false}
                      className={`${styles.grid_row} z-index absolute w-full bg-slate-300 text-center font-bold text-[red]`}
                      style={{
                        // gridTemplateColumns: colsWidth.join(" "),
                        // top: gridRowTrackTopPosition(index),
                        // top: (virtualRow.index * 35).toString() + "px",
                        bottom: "2.5rem",
                      }}
                    >
                      Loading...
                    </div>
                  )}

                  {/* ======== ヘッダーセル idを除く全てのプロパティ(フィールド)Column  ======== */}
                </div>
              );
            })}
          </div>
          {/* ======================== Grid列トラック Row ======================== */}
        </div>
        {/* ================== Gridスクロールコンテナ ここまで ================== */}
        {/* =============== Gridフッター ここから スクロールコンテナと同列で配置 =============== */}
        <UnderRightGridTableFooter getItemCount={allRows.length} />
        {/* ================== Gridフッター ここまで ================== */}
      </div>
    </>
  );
};

export const UnderRightActivityLog = memo(UnderRightActivityLogMemo);

/**
 * 
 * <div
      className={`${styles.right_activity_log_container}  w-full bg-[var(--color-bg-under-back)] ${
        isOpenSidebar ? `${styles.open} transition-base02` : `${styles.close} transition-base01`
      } ${tableContainerSize === "half" ? `${styles.company_table_screen_pr}` : ``} ${
        tableContainerSize === "all" ? `${styles.company_table_screen_pr}` : ``
      }`}
    >
 */

/**
 *
 *  {/* <div className={`${styles.right_activity_log_container}  w-full bg-[var(--color-bg-under-back)] `}> */
