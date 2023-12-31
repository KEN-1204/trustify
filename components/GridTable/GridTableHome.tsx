// import React, { FC, memo, useCallback, useEffect, useRef, useState } from "react";
// import styles from "./GridTableHome.module.css";
// import { RippleButton } from "../Parts/RippleButton/RippleButton";
// import { summary, tableBodyDataArray } from "./data";
// import useStore from "@/store";
// import { GridTableFooter } from "./GridTableFooter/GridTableFooter";
// import { useInfiniteQuery } from "@tanstack/react-query";
// import { useVirtualizer } from "@tanstack/react-virtual";
// import useDashboardStore from "@/store/useDashboardStore";
// import { EditColumns } from "./EditColumns/EditColumns";
// import { EditColumnTest } from "./EditColumns/EditColumnTest";
// import { EditColumnsModal } from "./EditColumns/EditColumnsModal";
// import useThemeStore from "@/store/useThemeStore";
// import useRootStore from "@/store/useRootStore";

// type TableDataType = {
//   id: number;
//   // id: string;
//   rowIndex: string;
//   name: string;
//   gender: string;
//   dob: string;
//   country: string;
//   summary: string;
// };

// type ColumnHeaderItemList = {
//   columnId: number;
//   columnName: string;
//   columnIndex: number;
//   columnWidth: string;
//   isOverflow: boolean;
//   isFrozen: boolean;
// };

// type Props = {
//   title: string;
// };

// const GridTableHomeMemo: FC<Props> = ({ title }) => {
//   const theme = useRootStore(useThemeStore, (state) => state.theme);
//   // const theme = useThemeStore((state) => state.theme);
//   // const theme = useStore((state) => state.theme);
//   // カラム入れ替えモーダルで更新した内容を取得
//   const editedColumnHeaderItemList = useDashboardStore((state) => state.editedColumnHeaderItemList);
//   const setEditedColumnHeaderItemList = useDashboardStore((state) => state.setEditedColumnHeaderItemList);
//   console.log(
//     "🔥GridTableHomeコンポーネント 入れ替え後のカラム editedColumnHeaderItemList ",
//     editedColumnHeaderItemList
//   );
//   // const [colsWidth, setColsWidth] = useState(
//   //   new Array(Object.keys(tableBodyDataArray[0]).length + 1).fill("minmax(50px, 1fr)")
//   // );
//   // 初回マウント時にdataがフェッチできたらtrueにしてuseEffectでカラム生成を実行するstate
//   const [gotData, setGotData] = useState(false);
//   // 総アイテムのチェック有り無しを保持するstate
//   const [checkedRows, setCheckedRows] = useState<Record<string, boolean>>({});
//   // ヘッダーチェック有無state
//   const [checkedColumnHeader, setCheckedColumnHeader] = useState(false);
//   // =================== 列入れ替え ===================
//   // 列入れ替え用インデックス
//   const [dragColumnIndex, setDragColumnIndex] = useState<number | null>(null);
//   // 列アイテムリスト カラムidとカラム名、カラムインデックス、カラム横幅を格納する
//   const [columnHeaderItemList, setColumnHeaderItemList] = useState<ColumnHeaderItemList[]>([]);
//   // 各カラムの横幅を管理
//   const [colsWidth, setColsWidth] = useState<string[] | null>(null);
//   // 現在のカラムの横幅をrefで管理
//   const currentColsWidths = useRef<string[]>([]);

//   // カラム列全てにindex付きのrefを渡す
//   const colsRef = useRef<(HTMLDivElement | null)[]>([]);
//   // ドラッグ要素用divRef
//   const draggableColsRef = useRef<(HTMLDivElement | null)[]>([]);
//   // カラムのテキストの3点リーダー適用有無確認のためのテキストサイズ保持Ref
//   const columnHeaderInnerTextRef = useRef<(HTMLSpanElement | null)[]>([]);
//   // カラムのリサイズ用オーバーレイ
//   const draggableOverlaysRef = useRef<(HTMLDivElement | null)[]>([]);
//   // スクロールコンテナDOM
//   const parentGridScrollContainer = useRef<HTMLDivElement | null>(null);
//   // カラムヘッダーDOM
//   const rowHeaderRef = useRef<HTMLDivElement | null>(null);
//   // Rowグループコンテナ(Virtualize収納用インナー)
//   const gridRowGroupContainerRef = useRef<HTMLDivElement | null>(null);
//   // GridセルDOM
//   const gridRowTracksRefs = useRef<(HTMLDivElement | null)[]>([]);
//   // フォーカス中、選択中のセルを保持
//   const selectedGridCellRef = useRef<HTMLDivElement | null>(null);
//   // 前回のアクティブセル
//   const prevSelectedGridCellRef = useRef<HTMLDivElement | null>(null);
//   // カラム3点リーダー表示時のツールチップ表示State 各カラムでoverflowになったintIdかuuid(string)を格納する
//   // const [isOverflowColumnHeader, setIsOverflowColumnHeader] = useState<(string | null)[]>([]);

//   // ONとなったチェックボックスを保持する配列のstate
//   const [selectedCheckBox, setSelectedCheckBox] = useState<number[]>([]);
//   // 現在のアイテム取得件数
//   const [getItemCount, setGetItemCount] = useState(0);
//   // isFrozenがtrueの個数を取得 初回はidの列をisFrozen: trueでカラム生成するため初期値は1にする
//   const isFrozenCountRef = useRef<number>(1);
//   // それぞれのカラムのLeftの位置を保持 isFrozenがtrueになったときにindexから値を取得してleftに付与 id列の2列目から
//   const columnLeftPositions = useRef<number[]>([]);

//   // ============================== 🌟カラム編集モーダルで並び替え後🌟 ==============================
//   // テーブルカラム編集モーダル
//   const isOpenEditColumns = useDashboardStore((state) => state.isOpenEditColumns);
//   const setIsOpenEditColumns = useDashboardStore((state) => state.setIsOpenEditColumns);
//   // カラム順番リセット用State カラム編集モーダルを開いた時に保持
//   const resetColumnHeaderItemList = useDashboardStore((state) => state.resetColumnHeaderItemList);
//   const setResetColumnHeaderItemList = useDashboardStore((state) => state.setResetColumnHeaderItemList);
//   // カラム並び替えモーダルで編集後にカラムヘッダーリストを更新してZustandのStateを空にする
//   useEffect(() => {
//     if (!editedColumnHeaderItemList.length) return console.log("編集中のカラムリストが存在しないためリターン");
//     // ================ Zustandに格納した並び替え後のカラムリストをローカルのStateに格納する
//     setColumnHeaderItemList([...editedColumnHeaderItemList]);
//     // ================ ✅ローカルストレージにも更新後のカラムリストを保存 ================
//     const columnHeaderItemListJSON = JSON.stringify(editedColumnHeaderItemList);
//     localStorage.setItem("grid_columns_company", columnHeaderItemListJSON);
//     // ================ ✅ローカルストレージにも更新後のカラムリストを保存 ここまで ================
//     // colsWidthの配列内の各カラムのサイズも更新する
//     let newColsWidth: string[] = [];
//     if (colsWidth !== null) {
//       const copyColsWidth = [...colsWidth];
//       copyColsWidth.forEach((width, index) => {
//         if (index === 0) return newColsWidth.push(width);
//         width = editedColumnHeaderItemList[index - 1].columnWidth;
//         newColsWidth.push(width);
//       });
//     }

//     // =========== CSSカスタムプロパティに反映
//     // newColsWidthの各値のpxの文字を削除
//     // ['65px', '100px', '250px', '250px', '250px', '250px']から
//     // ['65', '100', '250', '250', '250', '250']へ置換 同時に数値型に変換もしておく
//     const newColsWidthNum = newColsWidth.map((col) => {
//       return +col.replace("px", "");
//     });

//     console.log("🔥ヘッダーカラム生成🌟 カラム編集モーダルで並び替え後 新たなnewColsWidthNum", newColsWidthNum);

//     // それぞれのカラムの合計値を取得 +aで文字列から数値型に変換して合計値を取得
//     let sumRowWidth = newColsWidthNum.reduce((a, b) => {
//       return a + b;
//     });
//     console.log("🔥ヘッダーカラム生成🌟 カラム編集モーダルで並び替え後 width合計値 sumRowWidth", sumRowWidth);
//     // それぞれのCSSカスタムプロパティをセット
//     // grid-template-columnsの値となるCSSカスタムプロパティをセット
//     if (!parentGridScrollContainer.current) return;
//     const GridScrollContainer = parentGridScrollContainer.current;
//     GridScrollContainer.style.setProperty("--template-columns", `${newColsWidth.join(" ")}`);
//     GridScrollContainer.style.setProperty("--row-width", `${sumRowWidth}px`);

//     console.log(
//       "カラム編集モーダルで並び替え後 更新後--template-columns",
//       GridScrollContainer.style.getPropertyValue("--template-columns")
//     );
//     console.log(
//       "カラム編集モーダルで並び替え後 更新後--row-width",
//       GridScrollContainer.style.getPropertyValue("--row-width")
//     );
//     console.log("🔥カラム編集モーダルで並び替え後 ここnewColsWidth", newColsWidth);
//     setColsWidth(newColsWidth);
//     currentColsWidths.current = newColsWidth;

//     // setColsWidth()
//     // 更新したらZustandのカラム編集リストを空にする
//     setEditedColumnHeaderItemList([]);

//     // =============== フローズン用 各カラムのLeft位置、レフトポジションを取得 ===============
//     // colsWidth ['65px', '100px', '250px', '250px', '250px', '250px', '250px', '250px']から
//     // accumulatedLeftPosition:  [65, 165, 415, 665, 915, 1165, 1415, 1665]
//     // if (!colsWidth) return;
//     // 現在のcolsWidthをコピー
//     const widthArray = JSON.parse(JSON.stringify(newColsWidth));

//     // 各要素の累積和を計算し、新しい配列を作る
//     const accumulatedArray = widthArray.reduce((acc: number[], value: string) => {
//       // parseIntを使って数値部分を抽出する
//       const number = parseInt(value, 10);
//       // 配列の最後の要素（現在の累積和）に数値を加える
//       const newSum = acc.length > 0 ? acc[acc.length - 1] + number : number;
//       // 新しい累積和を配列に追加する
//       acc.push(newSum);
//       return acc;
//     }, []);
//     // [65, 165, 415, 665, 915, 1165, 1415, 1665]
//     // refオブジェクトにレフトポジションを格納
//     columnLeftPositions.current = accumulatedArray;
//     // ===================================================== 🔥テスト フローズンカスタムプロパティ
//     const filteredIsFrozenList = editedColumnHeaderItemList.filter((item) => item.isFrozen === true);
//     filteredIsFrozenList.forEach((item, index) => {
//       parentGridScrollContainer.current!.style.setProperty(`--frozen-left-${index}`, `${accumulatedArray[index]}px`);
//     });
//     // ===================================================== 🔥テスト フローズンカスタムプロパティ
//     // =============== フローズン用 各カラムのLeft位置、レフトポジションを取得 ここまで ===============
//   }, [editedColumnHeaderItemList]);
//   // ============================== 🌟カラム編集モーダルで並び替え後🌟 ここまで ==============================

//   // ================== 🌟疑似的なサーバーデータフェッチ用の関数🌟 ==================
//   const fetchServerPage = async (
//     limit: number,
//     offset: number = 0
//   ): Promise<{ rows: TableDataType[]; nextOffset: number }> => {
//     // useInfiniteQueryのクエリ関数で渡すlimitの個数分でIndex番号を付けたRowの配列を生成
//     const rows = new Array(limit).fill(0).map((e, index) => {
//       const newData: TableDataType = {
//         // id: uuidv4(), // indexが0から始めるので+1でidを1から始める
//         id: index + offset * limit, // indexが0から始めるので+1でidを1から始める
//         rowIndex: `${index + 2 + offset * limit}st Line`,
//         name: "John",
//         gender: "Male",
//         dob: "15-Aug-1990",
//         country: "India",
//         summary: summary,
//       };
//       return newData;
//     });

//     // 0.5秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
//     await new Promise((resolve) => setTimeout(resolve, 1000));

//     // 取得したrowsを返す（nextOffsetは、queryFnのctx.pageParamsが初回フェッチはundefinedで2回目が1のため+1でページ数と合わせる）
//     return { rows, nextOffset: offset + 1 };
//   };

//   // ================== 🌟useInfiniteQueryフック🌟 ==================
//   const { status, data, error, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteQuery({
//     queryKey: ["companies"],
//     queryFn: async (ctx) => {
//       console.log("useInfiniteQuery queryFn関数内 引数ctx", ctx);

//       // return fetchServerPage(35, ctx.pageParam); // 35個ずつ取得
//       return fetchServerPage(50, ctx.pageParam); // 35個ずつ取得
//     },
//     getNextPageParam: (_lastGroup, groups) => groups.length,
//     staleTime: Infinity,
//   });
//   // ================== 🌟useInfiniteQueryフック🌟 ここまで ==================

//   // 現在取得している全ての行 data.pagesのネストした配列を一つの配列にフラット化
//   const allRows = data ? data.pages.flatMap((d) => d?.rows) : [];

//   // ============================= 🌟バーチャライザーのインスタンスを生成🌟 =============================
//   const rowVirtualizer = useVirtualizer({
//     count: hasNextPage ? allRows.length + 1 : allRows.length, // 次のページ有り lengthを１増やす
//     getScrollElement: () => parentGridScrollContainer.current, // スクロール用コンテナ
//     // estimateSize: () => 35, // 要素のサイズ
//     estimateSize: () => 30, // 要素のサイズ
//     overscan: 20, // ビューポート外にレンダリングさせる個数
//     // overscan: 10, // ビューポート外にレンダリングさせる個数
//   });
//   // ======================== 🌟バーチャライザーのインスタンスを生成🌟 ここまで ========================

//   console.log(
//     `allRows.length: ${allRows.length} !!allRows.length: ${!!allRows.length} virtualItems:${
//       rowVirtualizer.getVirtualItems().length
//     } colsWidth: ${colsWidth} columnHeaderItemList`,
//     columnHeaderItemList
//   );
//   // ============================= 🌟無限スクロールの処理 追加でフェッチ🌟 =============================
//   useEffect(() => {
//     if (!rowVirtualizer) return console.log("無限スクロール関数 rowVirtualizerインスタンス無し");
//     // 現在保持している配列内の最後のアイテムをreverseで先頭にしてから分割代入で取得
//     const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();
//     console.log("lastItem", lastItem);
//     if (!lastItem) {
//       return;
//     }

//     // ================= lastItem.indexに到達 追加フェッチ =================
//     console.log(`lastItem.index:${lastItem.index} allRows.length:${allRows.length}`);
//     // 最後のアイテムindexが総数-1を超え、まだフェッチできるページがあり、フェッチ中でないなら
//     if (lastItem.index >= allRows.length - 1 && hasNextPage && !isFetchingNextPage) {
//       // queryFnで設定した関数 limitは10で10個ずつフェッチで設定
//       console.log(
//         `無限スクロール追加フェッチ実行 現在の状態 lastItem.index:${lastItem.index} allRows.length:${allRows.length}`
//       );
//       fetchNextPage(); // 追加でフェッチ
//     }
//     // ================= lastItem.indexに到達 追加フェッチ ここまで =================
//   }, [hasNextPage, fetchNextPage, allRows.length, isFetchingNextPage, rowVirtualizer.getVirtualItems()]);
//   // ======================= 🌟無限スクロールの処理 追加でフェッチ🌟 ここまで =======================

//   // ============================== 🌟無限スクロールの処理 追加でフェッチ ==============================
//   // ========== 🌟useEffect 取得データ総数が変わったタイミングで発火 チェック有無のStateの数を合わせる🌟 ==========
//   useEffect(() => {
//     // =========== チェック有無Stateの数を新たに取得したデータ数と一緒にする
//     console.log("🔥総数変化を検知 追加フェッチしたdata分 チェック有無Stateを追加 ====================");
//     if (!data) return console.log("data undefined or nullリターン", data);
//     const newDataArray = data?.pages.flatMap((d) => d.rows);
//     console.log(`lastIndexに到達しDBに追加フェッチ結果 newDataArray ${newDataArray.length}`, newDataArray);
//     console.log(`lastIndexに到達しDBに追加フェッチ結果 checkedRows ${Object.keys(checkedRows).length}`, checkedRows);
//     // DBから取得した配列をオブジェクトに変換 {id: boolean}にallRowsを変換
//     const allRowsBooleanObject = newDataArray.reduce((obj: { [key: number]: boolean }, item) => {
//       // obj[item.id.toString()] = false;
//       obj[item.id] = false;
//       return obj;
//     }, {});
//     console.log(
//       `配列をidとbooleanオブジェクトに変換 allRowsBooleanObject ${Object.keys(allRowsBooleanObject).length}`,
//       allRowsBooleanObject
//     );
//     // 配列同士を結合
//     const newObject = { ...allRowsBooleanObject, ...checkedRows };
//     console.log(`結合して既存チェックState数を総アイテム数と合わせる ${Object.keys(newObject).length}`, newObject);
//     setCheckedRows(newObject);

//     // 現在の取得件数をStateに格納
//     setGetItemCount(Object.keys(newObject).length);
//   }, [allRows.length]);

//   // ========== 🌟useEffect 取得データ総数が変わったタイミングで発火 チェック有無のStateの数を合わせる🌟 ここまで

//   // ========================= 🌟useEffect 初回DBからフェッチ完了を通知する🌟 =========================
//   useEffect(() => {
//     if (gotData) return;
//     // 初回マウント データ取得完了後Stateをtrueに変更通知して、カラム生成useEffectを実行
//     if (data) {
//       setGotData(true);
//       // 取得したアイテムの総数分idとbooleanでチェック有り無しをStateで管理 最初はチェック無しなので、全てfalse
//       let idObject = allRows.reduce((obj: { [key: string]: boolean } | undefined, item) => {
//         if (typeof item === "undefined" || typeof obj === "undefined") return;
//         obj[item.id.toString()] = false;
//         return obj;
//       }, {});
//       if (typeof idObject === "undefined") return;
//       setCheckedRows(idObject);
//       return;
//     }
//   }, [data]);
//   // ======================= 🌟useEffect 初回DBからフェッチ完了を通知する🌟 ここまで =======================

//   // =============================== 🌟useEffect ヘッダーカラム生成🌟 ===============================
//   // 取得したデータが変更された場合、プロパティ(フィールド)の数が変わる場合があるので、
//   // 変更があった場合には再度カラム列の数とサイズを現在取得しているデータでリセット
//   useEffect(() => {
//     if (!data?.pages[0]) return console.log("useEffect実行もまだdata無し リターン");
//     console.log("🌟ヘッダーカラム生成 gotData ===========================", gotData);

//     // ========================= 🔥テスト ローカルストレージ ルート =========================
//     const localStorageColumnHeaderItemListJSON = localStorage.getItem("grid_columns_company");
//     if (localStorageColumnHeaderItemListJSON) {
//       console.log("useEffect ローカルストレージルート🔥");
//       // まずはローカルストレージから取得したColumnHeaderItemListのJSONをJSオブジェクトにパース
//       const localStorageColumnHeaderItemList: ColumnHeaderItemList[] = JSON.parse(localStorageColumnHeaderItemListJSON);
//       // まずはローカルストレージから取得したColumnHeaderItemListをローカルStateに格納
//       setColumnHeaderItemList(localStorageColumnHeaderItemList);
//       // isFrozenがtrueの個数をRefに格納
//       isFrozenCountRef.current = localStorageColumnHeaderItemList.filter((obj) => obj.isFrozen === true).length;
//       console.log("ローカルストレージルート localStorageColumnHeaderItemList", localStorageColumnHeaderItemList);
//       // columnHeaderItemListからcolumnwidthのみを取得
//       const newColsWidths = localStorageColumnHeaderItemList.map((item) => item.columnWidth);
//       console.log("ローカルストレージルート tempColsWidth", newColsWidths);
//       // チェックボックスの65pxの文字列をnewColsWidthsの配列の手前に格納
//       newColsWidths.unshift("65px");
//       console.log("ローカルストレージルート unshift後のnewColsWidth Stateにカラムwidthを保存", newColsWidths);
//       // 全てのカラムWidthをローカルStateに格納
//       setColsWidth(newColsWidths);
//       currentColsWidths.current = newColsWidths;
//       // 全てのカラムWidthをRefオブジェクトに格納
//       currentColsWidths.current = newColsWidths;

//       // =============== フローズン用 各カラムのLeft位置、レフトポジションを取得 ===============
//       // colsWidth ['65px', '100px', '250px', '250px', '250px', '250px', '250px', '250px']から
//       // accumulatedLeftPosition:  [65, 165, 415, 665, 915, 1165, 1415, 1665]
//       // if (!colsWidth) return;
//       // 現在のcolsWidthをコピー
//       const widthArray = JSON.parse(JSON.stringify(newColsWidths));

//       // 各要素の累積和を計算し、新しい配列を作る
//       const accumulatedArray = widthArray.reduce((acc: number[], value: string) => {
//         // parseIntを使って数値部分を抽出する
//         const number = parseInt(value, 10);
//         // 配列の最後の要素（現在の累積和）に数値を加える
//         const newSum = acc.length > 0 ? acc[acc.length - 1] + number : number;
//         // 新しい累積和を配列に追加する
//         acc.push(newSum);
//         return acc;
//       }, []);
//       // [65, 165, 415, 665, 915, 1165, 1415, 1665]
//       // refオブジェクトにレフトポジションを格納
//       columnLeftPositions.current = accumulatedArray;
//       console.log("ローカルストレージルート レフトポジション accumulatedArray", accumulatedArray);
//       // ===================================================== 🔥テスト フローズンカスタムプロパティ
//       const filteredIsFrozenList = localStorageColumnHeaderItemList.filter((item) => item.isFrozen === true);
//       filteredIsFrozenList.forEach((item, index) => {
//         parentGridScrollContainer.current!.style.setProperty(`--frozen-left-${index}`, `${accumulatedArray[index]}px`);
//       });
//       // ===================================================== 🔥テスト フローズンカスタムプロパティ
//       // =============== フローズン用 各カラムのLeft位置、レフトポジションを取得 ここまで ===============

//       // ====================== CSSカスタムプロパティに反映 ======================
//       if (parentGridScrollContainer.current === null) return;
//       const newColsWidthNum = newColsWidths.map((col) => {
//         const newValue = col.replace("px", "");
//         return Number(newValue);
//       });
//       console.log("ローカルストレージルート ヘッダーカラム生成 newColsWidthNum", newColsWidthNum);
//       // それぞれのカラムの合計値を取得 +aで文字列から数値型に変換して合計値を取得
//       let sumRowWidth = newColsWidthNum.reduce((a, b) => {
//         return a + b;
//       });
//       console.log("ローカルストレージルート ヘッダーカラム生成 sumRowWidth", sumRowWidth);
//       // それぞれのCSSカスタムプロパティをセット
//       // grid-template-columnsの値となるCSSカスタムプロパティをセット
//       parentGridScrollContainer.current.style.setProperty("--template-columns", `${newColsWidths.join(" ")}`);
//       parentGridScrollContainer.current.style.setProperty("--header-row-height", "30px");
//       // parentGridScrollContainer.current.style.setProperty("--header-row-height", "35px");
//       parentGridScrollContainer.current.style.setProperty("--row-width", `${sumRowWidth}px`);
//       parentGridScrollContainer.current.style.setProperty("--summary-row-height", "30px");
//       // parentGridScrollContainer.current.style.setProperty("--summary-row-height", "35px");

//       console.log(
//         "ローカルストレージルート 更新後--template-columns",
//         parentGridScrollContainer.current.style.getPropertyValue("--template-columns")
//       );
//       console.log(
//         "ローカルストレージルート 更新後--row-width",
//         parentGridScrollContainer.current.style.getPropertyValue("--row-width")
//       );

//       return console.log("useEffectはここでリターン ローカルストレージルート");
//     }
//     // ========================= 🔥テスト ローカルストレージ ルート ここまで =========================
//     // ========================= 🔥初回ヘッダー生成ルート ルート ここまで =========================
//     console.log("useEffect ローカルストレージ無し 初回ヘッダー生成ルート🔥");

//     // マウント時に各フィールド分のカラムを生成 サイズはデフォルト値を65px, 100px, 3列目以降は250pxに設定
//     console.log(
//       "🌟useEffect Object.keys(data?.pages[0].rows[0] as object",
//       Object.keys(data?.pages[0].rows[0] as object)
//     );
//     const newColsWidths = new Array(Object.keys(data?.pages[0].rows[0] as object).length + 1).fill("250px");
//     newColsWidths.fill("65px", 0, 1); // 1列目を65pxに変更
//     newColsWidths.fill("100px", 1, 2); // 2列目を100pxに変更
//     console.log("Stateにカラムwidthを保存", newColsWidths);
//     // ['65px', '100px', '250px', '50px', '119px', '142px', '250px', '250px']
//     // stateに現在の全てのカラムのwidthを保存
//     setColsWidth(newColsWidths);
//     currentColsWidths.current = newColsWidths;
//     // refオブジェクトに保存
//     currentColsWidths.current = newColsWidths;
//     console.log("currentColsWidths.current", currentColsWidths.current);

//     // =============== フローズン用 各カラムのLeft位置、レフトポジションを取得 ===============
//     // colsWidth ['65px', '100px', '250px', '250px', '250px', '250px', '250px', '250px']から
//     // accumulatedLeftPosition:  [65, 165, 415, 665, 915, 1165, 1415, 1665]
//     // if (!colsWidth) return;
//     // 現在のcolsWidthをコピー
//     const widthArray = JSON.parse(JSON.stringify(newColsWidths));

//     // 各要素の累積和を計算し、新しい配列を作る
//     const accumulatedArray = widthArray.reduce((acc: number[], value: string) => {
//       // parseIntを使って数値部分を抽出する
//       const number = parseInt(value, 10);
//       // 配列の最後の要素（現在の累積和）に数値を加える
//       const newSum = acc.length > 0 ? acc[acc.length - 1] + number : number;
//       // 新しい累積和を配列に追加する
//       acc.push(newSum);
//       return acc;
//     }, []);
//     // [65, 165, 415, 665, 915, 1165, 1415, 1665]
//     // refオブジェクトにレフトポジションを格納
//     columnLeftPositions.current = accumulatedArray;
//     // =============== フローズン用 各カラムのLeft位置、レフトポジションを取得 ここまで ===============

//     if (parentGridScrollContainer.current === null) return;

//     // ====================== CSSカスタムプロパティに反映 ======================
//     // newColsWidthの各値のpxの文字を削除
//     // ['65px', '100px', '250px', '250px', '250px', '250px']から
//     // ['65', '100', '250', '250', '250', '250']へ置換
//     const newColsWidthNum = newColsWidths.map((col) => {
//       return col.replace("px", "");
//     });

//     console.log("初回ヘッダー生成 ヘッダーカラム生成 newColsWidthNum", newColsWidthNum);

//     // それぞれのカラムの合計値を取得 +aで文字列から数値型に変換して合計値を取得
//     let sumRowWidth = newColsWidthNum.reduce((a, b) => {
//       return +a + +b;
//     });
//     console.log("初回ヘッダー生成 ヘッダーカラム生成 sumRowWidth", sumRowWidth);

//     // それぞれのCSSカスタムプロパティをセット
//     // grid-template-columnsの値となるCSSカスタムプロパティをセット
//     parentGridScrollContainer.current.style.setProperty("--template-columns", `${newColsWidths.join(" ")}`);
//     parentGridScrollContainer.current.style.setProperty("--header-row-height", "30px");
//     // parentGridScrollContainer.current.style.setProperty("--header-row-height", "35px");
//     parentGridScrollContainer.current.style.setProperty("--row-width", `${sumRowWidth}px`);
//     parentGridScrollContainer.current.style.setProperty("--summary-row-height", "30px");
//     // parentGridScrollContainer.current.style.setProperty("--summary-row-height", "35px");

//     console.log(
//       "初回ヘッダー生成 更新後--template-columns",
//       parentGridScrollContainer.current.style.getPropertyValue("--template-columns")
//     );
//     console.log(
//       "初回ヘッダー生成 更新後--row-width",
//       parentGridScrollContainer.current.style.getPropertyValue("--row-width")
//     );

//     // ====================== カラム順番入れ替え用の列アイテムリストに格納 ======================
//     // colsWidthsの最初2つはcheckboxとidの列なので、最初から3つ目で入れ替え
//     const tempFirstColumnItemListArray = Object.keys(data?.pages[0].rows[0] as object);
//     const firstColumnItemListArray = tempFirstColumnItemListArray.map((item, index) => {
//       // 初回カラム生成は最初の列（現在はid列）はisFrozenとisLastDrozenをtrueにする
//       if (index === 0) {
//         return {
//           columnId: index,
//           columnName: item,
//           columnIndex: index + 2,
//           columnWidth: newColsWidths[index + 1],
//           isOverflow: false,
//           isFrozen: true,
//         };
//       }
//       // 0列目以外はisFrozenとisLastFrozenはfalseにする
//       return {
//         columnId: index,
//         columnName: item,
//         columnIndex: index + 2,
//         columnWidth: newColsWidths[index + 1],
//         isOverflow: false,
//         isFrozen: false,
//       };
//     });
//     console.log(`初回ヘッダー生成 初期カラム配列`, tempFirstColumnItemListArray);
//     console.log(`初回ヘッダー生成 整形後カラム配列`, firstColumnItemListArray);
//     setColumnHeaderItemList(firstColumnItemListArray);
//     // isFrozenがtrueの個数をRefに格納
//     isFrozenCountRef.current = firstColumnItemListArray.filter((obj) => obj.isFrozen === true).length;

//     // ================ ✅ローカルストレージにも更新後のカラムリストを保存 ================
//     const columnHeaderItemListJSON = JSON.stringify(firstColumnItemListArray);
//     localStorage.setItem("grid_columns_company", columnHeaderItemListJSON);
//     // ================ ✅ローカルストレージにも更新後のカラムリストを保存 ここまで ================
//   }, [gotData]); // gotDataのstateがtrueになったら再度実行
//   // ========================== 🌟useEffect ヘッダーカラム生成🌟 ここまで ==========================

//   // ================================== 🌟マウスイベント 列サイズ変更🌟 ==================================
//   const handleMouseDown = (e: React.MouseEvent, index: number) => {
//     e.preventDefault();

//     if (!parentGridScrollContainer.current) return;
//     const gridContainer = parentGridScrollContainer.current;
//     // ドラッグ中の列と同じ列全てのborder-right-colorをハイライトする
//     const colsLine = gridContainer.querySelectorAll(`[role=row] [aria-colindex="${index + 2}"]`);
//     colsLine.forEach((col) => {
//       if (col instanceof HTMLDivElement) {
//         // col.style.borderRightColor = `#24b47e`;
//         col.classList.add(`${styles.is_dragging}`);
//       }
//     });

//     const startX = e.pageX;
//     const startWidth = colsRef.current[index + 1]?.getBoundingClientRect().width || 0;

//     console.log("handleMouseDown", startX, startWidth);

//     const handleMouseUp = () => {
//       const gridScrollContainer = parentGridScrollContainer.current;
//       if (!gridScrollContainer) return;
//       // ドラッグ中の列と同じ列全てのborder-right-colorをハイライトを元のボーダーカラーに戻す
//       const colsLine = gridScrollContainer.querySelectorAll(`[role=row] [aria-colindex="${index + 2}"]`);
//       colsLine.forEach((col) => {
//         if (col instanceof HTMLDivElement) {
//           // col.style.borderRightColor = `#444`;
//           col.classList.remove(`${styles.is_dragging}`);
//         }
//       });

//       console.log("マウスアップ✅ currentColsWidths.current", currentColsWidths.current);
//       setColsWidth(currentColsWidths.current);
//       window.removeEventListener("mouseup", handleMouseUp);
//       window.removeEventListener("mousemove", handleMouseMove);

//       // ================ columnHeaderItemListも合わせてサイズを更新 テスト ================
//       let newColumnHeaderItemList: any[] = [];
//       const copyColumnHeaderItemList = [...columnHeaderItemList];
//       copyColumnHeaderItemList.forEach((item) => {
//         item.columnWidth = currentColsWidths.current[item.columnIndex - 1];
//         newColumnHeaderItemList.push(item);
//         // return item;
//       });
//       console.log("🌟🔥 newColumnHeaderItemList", newColumnHeaderItemList);
//       setColumnHeaderItemList(newColumnHeaderItemList);
//       // ================ columnHeaderItemListも合わせてサイズを更新 テスト ================

//       // // =============== フローズン用 各カラムのLeft位置、レフトポジションを取得 ===============
//       // colsWidth ['65px', '100px', '250px', '250px', '250px', '250px', '250px', '250px']から
//       // accumulatedLeftPosition:  [65, 165, 415, 665, 915, 1165, 1415, 1665]
//       // if (!colsWidth) return;
//       // 現在のcolsWidthをコピー
//       const widthArray = JSON.parse(JSON.stringify(currentColsWidths.current));
//       // const widthArray = JSON.parse(JSON.stringify(colsWidth));

//       // 各要素の累積和を計算し、新しい配列を作る
//       const accumulatedArray = widthArray.reduce((acc: number[], value: string) => {
//         // parseIntを使って数値部分を抽出する
//         const number = parseInt(value, 10);
//         // 配列の最後の要素（現在の累積和）に数値を加える
//         const newSum = acc.length > 0 ? acc[acc.length - 1] + number : number;
//         // 新しい累積和を配列に追加する
//         acc.push(newSum);
//         return acc;
//       }, []);
//       // [65, 165, 415, 665, 915, 1165, 1415, 1665]
//       // refオブジェクトにレフトポジションを格納
//       columnLeftPositions.current = accumulatedArray;
//       console.log("列サイズ変更 レフトポジション accumulatedArray", accumulatedArray);
//       // ===================================================== 🔥テスト フローズンカスタムプロパティ
//       const filteredIsFrozenList = newColumnHeaderItemList.filter((item) => item.isFrozen === true);
//       filteredIsFrozenList.forEach((item, index) => {
//         parentGridScrollContainer.current!.style.setProperty(`--frozen-left-${index}`, `${accumulatedArray[index]}px`);
//       });
//       // ===================================================== 🔥テスト フローズンカスタムプロパティ
//       // // =============== フローズン用 各カラムのLeft位置、レフトポジションを取得 ここまで ===============

//       // 🌟3点リーダーがtrueになったらカラムホバー時にツールチップを表示
//       const targetText = columnHeaderInnerTextRef.current[index] as HTMLDivElement;
//       console.log(
//         "列サイズ変更 3点リーダーがtrueになったらカラムホバー時にツールチップを表示 カラムヘッダーインナーテキスト",
//         columnHeaderInnerTextRef.current[index]?.scrollWidth,
//         columnHeaderInnerTextRef.current[index]?.clientWidth,
//         targetText.scrollWidth > targetText.clientWidth,
//         targetText
//       );
//       if (targetText.scrollWidth > targetText.clientWidth) {
//         // if (isOverflowColumnHeader.includes(colsRef.current[index]!.ariaColIndex))
//         if ((newColumnHeaderItemList as ColumnHeaderItemList[])[index].isOverflow)
//           return console.log("既にオンのためリターン");
//         (newColumnHeaderItemList as ColumnHeaderItemList[])[index].isOverflow = true;

//         // if (isOverflowColumnHeader.includes(colsRef.current[index]!.dataset.columnId!.toString()))
//         //   return console.log("既にオンのためリターン");
//         // 3点リーダーがオンの時
//         // setIsOverflowColumnHeader((prevArray) => {
//         //   console.log("targetText", targetText);
//         //   const newArray = [...prevArray];
//         //   newArray.push(colsRef.current[index]!.dataset.columnId!.toString());
//         //   return newArray;
//         // });
//       } else {
//         // 3点リーダーがオフの時
//         (newColumnHeaderItemList as ColumnHeaderItemList[])[index].isOverflow = false;

//         // setIsOverflowColumnHeader((prevArray) => {
//         //   console.log("targetText", targetText);
//         //   const newArray = [...prevArray];
//         //   console.log("🌟ここ", newArray, colsRef.current[index]!.dataset.columnId!.toString());
//         //   const filteredArray = newArray.filter(
//         //     (item) => item !== colsRef.current[index]!.dataset.columnId!.toString()
//         //   );
//         //   return filteredArray;
//         // });
//       }
//       // ================ ✅ローカルストレージにも更新後のカラムリストを保存 ================
//       const columnHeaderItemListJSON = JSON.stringify(newColumnHeaderItemList);
//       localStorage.setItem("grid_columns_company", columnHeaderItemListJSON);
//       // ================ ✅ローカルストレージにも更新後のカラムリストを保存 ここまで ================
//     };

//     const handleMouseMove = (e: MouseEvent) => {
//       e.preventDefault();
//       const newWidth = e.pageX - colsRef.current[index]!.getBoundingClientRect().left;
//       console.log("newWidth", newWidth);
//       console.log("currentColsWidths.current", currentColsWidths.current);
//       if (colsWidth === null) return;
//       const newColsWidths = [...colsWidth];
//       // const newColsWidths = [...currentColsWidths.current];
//       newColsWidths[index + 1] = Math.max(newWidth, 50) + "px";
//       // gridコンテナのCSSカスタムプロパティに新たなwidthを設定したwidthsをセット
//       parentGridScrollContainer.current!.style.setProperty("--template-columns", `${newColsWidths.join(" ")}`);
//       // setColsWidth(newColsWidths);
//       currentColsWidths.current = newColsWidths;

//       console.log("newColsWidths", newColsWidths);
//       console.log(
//         "更新後--template-columns",
//         parentGridScrollContainer.current!.style.getPropertyValue("--template-columns")
//       );

//       // 列の合計値をセット
//       // newColsWidthの各値のpxの文字を削除
//       // ['65px', '100px', '250px', '250px', '250px', '250px']から
//       // ['65', '100', '250', '250', '250', '250']へ置換
//       const newColsWidthNum = newColsWidths.map((col) => {
//         return col.replace("px", "");
//       });

//       // それぞれのカラムの合計値を取得 +aで文字列から数値型に変換して合計値を取得
//       let sumRowWidth = newColsWidthNum.reduce((a, b) => {
//         return +a + +b;
//       }, 0);
//       parentGridScrollContainer.current!.style.setProperty("--row-width", `${sumRowWidth}px`);
//       console.log("更新後--row-width", parentGridScrollContainer.current!.style.getPropertyValue("--row-width"));

//       // // =============== フローズン用 各カラムのLeft位置、レフトポジションを取得 ===============
//       // colsWidth ['65px', '100px', '250px', '250px', '250px', '250px', '250px', '250px']から
//       // accumulatedLeftPosition:  [65, 165, 415, 665, 915, 1165, 1415, 1665]
//       // if (!colsWidth) return;
//       // 現在のcolsWidthをコピー
//       const widthArrayMove = JSON.parse(JSON.stringify(currentColsWidths.current));
//       // const widthArrayMove = JSON.parse(JSON.stringify(newColsWidths));

//       // 各要素の累積和を計算し、新しい配列を作る
//       const accumulatedArrayMove = widthArrayMove.reduce((acc: number[], value: string) => {
//         // parseIntを使って数値部分を抽出する
//         const number = parseInt(value, 10);
//         // 配列の最後の要素（現在の累積和）に数値を加える
//         const newSum = acc.length > 0 ? acc[acc.length - 1] + number : number;
//         // 新しい累積和を配列に追加する
//         acc.push(newSum);
//         return acc;
//       }, []);
//       // [65, 165, 415, 665, 915, 1165, 1415, 1665]
//       // refオブジェクトにレフトポジションを格納
//       columnLeftPositions.current = accumulatedArrayMove;
//       console.log("columnLeftPositions.current", columnLeftPositions.current);
//       // ===================================================== 🔥テスト フローズンカスタムプロパティ
//       const filteredIsFrozenList = columnHeaderItemList.filter((item) => item.isFrozen === true);
//       filteredIsFrozenList.forEach((item, index) => {
//         parentGridScrollContainer.current!.style.setProperty(
//           `--frozen-left-${index}`,
//           `${accumulatedArrayMove[index]}px`
//         );
//       });
//       // ===================================================== 🔥テスト フローズンカスタムプロパティ
//       // =============== フローズン用 各カラムのLeft位置、レフトポジションを取得 ここまで ===============
//     };

//     window.addEventListener("mouseup", handleMouseUp);
//     window.addEventListener("mousemove", handleMouseMove);
//   };
//   // ============================== 🌟マウスイベント 列サイズ変更🌟 ここまで ==============================

//   // ====================== 🌟１行目と２行目のインラインスタイルのleftに渡す用の関数 ======================
//   const columnHeaderLeft = (index: number) => {
//     // indexが0のid列は65pxでreturn
//     // if (index === 0) return 65;
//     // console.log("✅ フローズンの個数isFrozenCountRef.current", isFrozenCountRef.current);
//     // console.log("✅ レフトポジションcolumnLeftPositions.current", columnLeftPositions.current);
//     // isFrozenがtrueなら
//     if (columnHeaderItemList[index].isFrozen) {
//       return columnLeftPositions.current[index];
//     }

//     // console.log("レフト計算関数 widthArray", widthArray);
//     // // コピーした配列から現在isFrozenがtrueのwidthを先頭から個数分取得
//     // const isFrozenCountWidthArray = widthArray.slice(0, isFrozenCountRef.current);
//     // console.log("レフト計算関数 isFrozenCountWidthArray", isFrozenCountWidthArray);
//     // // 各要素を数値に変換し、それらの合計を計算して取得
//     // const TotalWidth = isFrozenCountWidthArray.reduce((sum: number, value: string) => {
//     //   // parseIntを使って数値部分のみを10進法の形で抽出して取得する
//     //   const number = parseInt(value, 10);
//     //   return sum + number;
//     // }, 0);

//     // switch (index) {
//     //   case 0:
//     //     return 65;
//     //   case 1:
//     //     return 65;
//     //   default:
//     //     // if ()
//     //     null;
//     //     break;
//     // }
//     // switch (index) {
//     //   case 0:
//     //     return 0;
//     //     break;
//     //   case 1:
//     //     return 65;
//     //   default:
//     //     // if ()
//     //     null;
//     //     break;
//     // }
//   };
//   // ========= 🌟１行目と２行目のインラインスタイルのleftに渡す用の関数🌟 ここまで =========

//   // ========= 🌟各Grid行トラックのtopからの位置を返す関数 インラインスタイル内で実行 =========
//   const gridRowTrackTopPosition = (index: number) => {
//     // const topPosition = ((index + 1) * 35).toString() + "px";
//     const topPosition = ((index + 1) * 30).toString() + "px";
//     console.log("topPosition", topPosition);
//     return topPosition;
//   };
//   // ================================================================

//   // ================== 🌟セル シングルクリック、ダブルクリックイベント ==================
//   // ================== 🌟GridCellクリックでセルを選択中アクティブセルstateに更新🌟 ==================
//   const setTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const setIsOpenEditModal = useDashboardStore((state) => state.setIsOpenEditModal);
//   const setTextareaInput = useDashboardStore((state) => state.setTextareaInput);
//   const [clickedActiveRow, setClickedActiveRow] = useState<number | null>(null);

//   const handleClickGridCell = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
//     if (setTimeoutRef.current !== null) return;

//     setTimeoutRef.current = setTimeout(() => {
//       setTimeoutRef.current = null;
//       // シングルクリック時に実行したい処理
//       // 0.2秒後に実行されてしまうためここには書かない
//     }, 200);

//     console.log("シングルクリック");
//     // すでにselectedセル(アクティブセル)のrefが存在するなら、一度aria-selectedをfalseに変更
//     if (selectedGridCellRef.current?.getAttribute("aria-selected") === "true") {
//       // 保持していたアクティブセルを前回のアクティブセルprevSelectedGridCellRefに格納
//       prevSelectedGridCellRef.current = selectedGridCellRef.current;

//       selectedGridCellRef.current.setAttribute("aria-selected", "false");
//       selectedGridCellRef.current.setAttribute("tabindex", "-1");
//     }
//     // クリックしたセルの属性setAttributeでクリックしたセルのaria-selectedをtrueに変更
//     e.currentTarget.setAttribute("aria-selected", "true");
//     e.currentTarget.setAttribute("tabindex", "0");

//     // クリックしたセルを新たなアクティブセルとしてrefに格納して更新
//     selectedGridCellRef.current = e.currentTarget;

//     console.log(
//       `前回アクティブセルの行と列: ${prevSelectedGridCellRef.current?.ariaColIndex}, ${prevSelectedGridCellRef.current?.parentElement?.ariaRowIndex}, 今回アクティブの行と列: ${selectedGridCellRef.current?.ariaColIndex}, ${selectedGridCellRef.current?.parentElement?.ariaRowIndex}`
//     );
//     // クリックした列を選択中の状態の色に変更する aria-selectedをtrueにする
//     if (typeof selectedGridCellRef.current?.parentElement?.ariaRowIndex === "undefined") return;
//     if (Number(selectedGridCellRef.current?.parentElement?.ariaRowIndex) === 1) {
//       setClickedActiveRow(null);
//       return;
//     }
//     setClickedActiveRow(Number(selectedGridCellRef.current?.parentElement?.ariaRowIndex));
//   }, []);

//   // セルダブルクリック
//   const handleDoubleClick = useCallback((e: React.MouseEvent<HTMLDivElement>, index: number, columnName: string) => {
//     console.log("ダブルクリック index", index);
//     if (columnName === "id") return console.log("ダブルクリック idのためリターン");
//     // if (index === 0) return console.log("リターン");
//     if (setTimeoutRef.current) {
//       clearTimeout(setTimeoutRef.current);

//       // console.log(e.detail);
//       setTimeoutRef.current = null;
//       // ダブルクリック時に実行したい処理
//       console.log("ダブルクリック", e.currentTarget);
//       // クリックした要素のテキストを格納
//       const text = e.currentTarget.innerText;
//       setTextareaInput(text);
//       setIsOpenEditModal(true);
//     }
//   }, []);
//   // ================== 🌟GridCellクリックでセルを選択中アクティブセルstateに更新🌟 ここまで ==================

//   // ==================== 🌟チェックボックスクリックでstateに選択したアイテムのidを追加🌟 ====================
//   const handleSelectedCheckBox = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
//     console.log(
//       "前回のアクティブセル親列RowトラックのRowIndex",
//       prevSelectedGridCellRef.current?.parentElement?.ariaRowIndex
//     );
//     console.log("今回のアクティブセル親列トラックのRowIndex", selectedGridCellRef.current?.parentElement?.ariaRowIndex);
//     const targetRowIndex = e.target.parentElement?.parentElement?.parentElement?.ariaRowIndex;
//     console.log("handleSelectedCheckBox targetRowIndex", targetRowIndex);

//     const gridScrollContainer = parentGridScrollContainer.current;
//     if (!gridScrollContainer) return;

//     // PointerEventsを明示することでtypescriptのエラー回避
//     if (e.nativeEvent instanceof PointerEvent) {
//       // ================ ルート１：そのままチェック (シフトキーがfalseの場合) ======================
//       if (e.nativeEvent.shiftKey === false) {
//         let newSelectedCheckBoxArray = [...selectedCheckBox];
//         // ======= ルート１ー１ チェックした時
//         if (e.target.checked === true) {
//           newSelectedCheckBoxArray.push(id);
//           newSelectedCheckBoxArray.sort((a, b) => a - b);
//           setSelectedCheckBox(newSelectedCheckBoxArray);
//           // チェックされた行をハイライト
//           // const selectedRow = document.querySelector(`[aria-rowindex="${id + 1}"]`);
//           const selectedRow = gridScrollContainer.querySelector(`[role=row][aria-rowindex="${targetRowIndex}"]`);
//           selectedRow?.setAttribute(`aria-selected`, "true");
//           // チェックした行要素Rowのチェック有無をStateに更新
//           setCheckedRows((prev) => ({
//             ...prev,
//             [id]: true, // プロパティ名に変数を指定するにはブラケット記法を使用する
//           }));
//         }
//         // ======= ルート１−２ チェックが外れた時
//         else {
//           const filteredArray = newSelectedCheckBoxArray.filter((itemId) => itemId !== id);
//           filteredArray.sort((a, b) => a - b);
//           setSelectedCheckBox(filteredArray);
//           // チェックでハイライトされた行を戻す
//           // const selectedRow = document.querySelector(`[aria-rowindex="${id + 1}"]`);
//           const selectedRow = gridScrollContainer.querySelector(`[role=row][aria-rowindex="${targetRowIndex}"]`);
//           selectedRow?.setAttribute(`aria-selected`, "false");
//           // チェックが外れた行要素Rowのチェック有無をStateに更新
//           setCheckedRows((prev) => ({
//             ...prev,
//             [id]: false, // プロパティ名に変数を指定するにはブラケット記法を使用する
//           }));
//         }
//       }

//       // ====================== ルート２：シフトキーが押された状態でチェック ======================
//       else {
//         // ルート２−１ シフトキーが押された状態で、かつチェックが入っておらず今回チェックを入れた場合のルート
//         if (e.target.checked === true) {
//           // もし他のチェックボックスのセルがaria-selected=trueで選択中となっているならば
//           // クリックしたチェックボックスと前回アクティブだったチェックボックスのセルとの間のチェックボックスを全てtrueにかえる
//           // まずはgridcellのcolindexが1のセルを全て取得
//           const checkBoxCells = gridScrollContainer.querySelectorAll('[role=gridcell][aria-colindex="1"]');
//           console.log("シフト有りクリック");
//           // 前回のアクティブセルがcheckboxのセルで、かつ、シフトキーを押された状態でチェックされたら
//           if (prevSelectedGridCellRef.current?.ariaColIndex === "1") {
//             // 前回のアクティブセルの親のRowIndexと今回チェックしたセルの親のRowIndexまでを全てtrueに変更
//             if (!prevSelectedGridCellRef.current?.parentElement?.ariaRowIndex)
//               return console.log("prevアクティブセル無し リターン");
//             if (!selectedGridCellRef.current?.parentElement?.ariaRowIndex)
//               return console.log("アクティブセル無し リターン");
//             // 前回と今回の行インデックスで小さい値を取得(セルの親要素をparentElementでアクセス)
//             const minNum = Math.min(
//               +prevSelectedGridCellRef.current?.parentElement?.ariaRowIndex,
//               +selectedGridCellRef.current?.parentElement?.ariaRowIndex
//             );
//             // 前回と今回の行インデックスのを小さい値を取得(セルの親要素をparentElementでアクセス)
//             const maxNum = Math.max(
//               +prevSelectedGridCellRef.current?.parentElement?.ariaRowIndex,
//               +selectedGridCellRef.current?.parentElement?.ariaRowIndex
//             );
//             console.log(`行インデックス最小値${minNum}, 最大値${maxNum}`);

//             // チェック列Stateを複数選択した列で更新
//             setCheckedRows((prevState) => {
//               const newState = Object.entries(prevState).reduce((acc: Record<string, boolean>, [key, value]) => {
//                 // checkedRowsは0から値が始まり、RowGroupのrowIndexは2行目からなのでstateに2を加算する
//                 const rowIndex = +key + 2;
//                 if (minNum <= rowIndex && rowIndex <= maxNum) {
//                   acc[key] = true; // チェックを入れたtrueのルートなのでtrueにする
//                   // acc[key] = !value;
//                 } else {
//                   acc[key] = value; // シフトキーで選択されていないキーはそのままのvalueで返す
//                 }
//                 return acc;
//               }, {});
//               console.log("🔥newState", newState);
//               return newState;
//             });

//             // SelectedCheckBoxを現在選択中のチェックボックスに反映
//             const currentCheckId = Object.entries(checkedRows).reduce((acc: Record<string, boolean>, [key, value]) => {
//               // checkedRowsは0から値が始まり、RowGroupのrowIndexは2行目からなのでstateに2を加算する
//               const rowIndex = +key + 2;
//               if (minNum <= rowIndex && rowIndex <= maxNum) {
//                 acc[key] = true; // チェックを入れたtrueのルートなのでtrueにする
//               }
//               // selectedCheckBoxは選択中のidのみなので、チェックしたkeyとvalueのみを返す
//               return acc;
//             }, {});
//             // {0: true, 1: true...}からキーのみを取得して配列を生成
//             const keys = Object.keys(currentCheckId);
//             // idが数値型の場合にはキーを数値型に変換
//             let newSelectedCheck: number[] = [];
//             keys.forEach((item) => newSelectedCheck.push(Number(item)));
//             // 選択中の行要素を保持するstateを更新
//             const copySelectedCheckBox = [...selectedCheckBox];
//             // 元々のチェックしているStateと新しくチェックした配列を結合
//             const combinedArray = [...newSelectedCheck, ...copySelectedCheckBox];
//             // 重複した値を一意にする
//             const uniqueArray = [...new Set(combinedArray)];
//             // idが数値の場合には順番をソートする
//             uniqueArray.sort((a, b) => a - b);
//             console.log("🔥ソート後 uniqueArray", uniqueArray);
//             setSelectedCheckBox(uniqueArray);
//           }
//         }
//         // ルート２−２ シフトキーが押された状態で、かつチェックが既に入っていて今回チェックをfalseにして複数チェックを外すルート
//         else {
//           const checkBoxCells = gridScrollContainer.querySelectorAll('[role=gridcell][aria-colindex="1"]');
//           console.log("シフト有りクリック");
//           // 前回のアクティブセルがcheckboxのセルで、シフトキーを押された状態でチェックが外されたら
//           if (prevSelectedGridCellRef.current?.ariaColIndex === "1") {
//             // 前回のアクティブセルの親のRowIndexと今回チェックしたセルの親のRowIndexまでを全てfalseに変更
//             if (!prevSelectedGridCellRef.current?.parentElement?.ariaRowIndex)
//               return console.log("prevアクティブセル無し リターン");
//             if (!selectedGridCellRef.current?.parentElement?.ariaRowIndex)
//               return console.log("アクティブセル無し リターン");
//             // 前回と今回の行インデックスで小さい値を取得(セルの親要素をparentElementでアクセス)
//             const minNum = Math.min(
//               +prevSelectedGridCellRef.current?.parentElement?.ariaRowIndex,
//               +selectedGridCellRef.current?.parentElement?.ariaRowIndex
//             );
//             // 前回と今回の行インデックスのを小さい値を取得(セルの親要素をparentElementでアクセス)
//             const maxNum = Math.max(
//               +prevSelectedGridCellRef.current?.parentElement?.ariaRowIndex,
//               +selectedGridCellRef.current?.parentElement?.ariaRowIndex
//             );
//             console.log(`行インデックス最小値${minNum}, 最大値${maxNum}`);
//             // ================ 🌟複数チェックを外す checkedRowsとselectedCheckBox ================
//             // チェック列Stateを複数選択した列で更新
//             setCheckedRows((prevState) => {
//               const newState = Object.entries(prevState).reduce((acc: Record<string, boolean>, [key, value]) => {
//                 // checkedRowsは0から値が始まり、RowGroupのrowIndexは2行目からなのでstateに2を加算する
//                 const rowIndex = +key + 2;
//                 if (minNum <= rowIndex && rowIndex <= maxNum) {
//                   acc[key] = false; // チェックを入れたtrueのルートなのでtrueにする
//                   // acc[key] = !value;
//                 } else {
//                   acc[key] = value; // シフトキーで選択されていないキーはそのままのvalueで返す
//                 }
//                 return acc;
//               }, {});
//               console.log("🔥setCheckedRows newState", newState);
//               return newState;
//             });

//             // SelectedCheckBoxを現在選択中のチェックボックスに反映
//             const unCheckId = Object.entries(checkedRows).reduce((acc: Record<string, boolean>, [key, value]) => {
//               // checkedRowsは0から値が始まり、RowGroupのrowIndexは2行目からなのでstateに2を加算する
//               const rowIndex = +key + 2;
//               if (minNum <= rowIndex && rowIndex <= maxNum) {
//                 acc[key] = false; // チェックを外したfalseのルートなのでfalseにする
//               }
//               // selectedCheckBoxは選択中のidのみなので、チェックしたkeyとvalueのみを返す
//               return acc;
//             }, {});
//             // {0: true, 1: true...}からキーのみを取得して配列を生成
//             const unCheckedKeys = Object.keys(unCheckId);
//             console.log("🔥 unCheckedKeys", unCheckedKeys);
//             // idが数値型の場合にはキーを数値型に変換
//             let newUnCheckedIdArray: number[] = [];
//             unCheckedKeys.forEach((item) => newUnCheckedIdArray.push(Number(item)));
//             // 選択中の行要素を保持するstateを更新
//             const copySelectedCheckBox = [...selectedCheckBox];
//             console.log("🔥 copySelectedCheckBox", copySelectedCheckBox);
//             // 範囲選択でチェックが外れたセルを全てフィルターで除外して新たな配列を生成してセレクトStateに格納
//             const filteredNewArray = copySelectedCheckBox.filter((item) => {
//               return !newUnCheckedIdArray.includes(item);
//             });
//             console.log("🔥 filteredNewArray 更新後", filteredNewArray);
//             console.log("🔥 newUnCheckedIdArray 更新後", newUnCheckedIdArray);
//             setSelectedCheckBox(filteredNewArray);
//             // ================ 🌟複数チェックを外す checkedRowsとselectedCheckBox ここまで ================
//           }
//         }
//       }
//     }
//   };
//   // ================= 🌟チェックボックスクリックでstateに選択したアイテムのidを追加🌟 ここまで =================

//   // ================================= 🌟チェックボックス全選択🌟 =================================
//   // チェックボックスヘッダーのON/OFFで全てのチェックボックスをtrue/false切り替え後、全てのidを選択中stateに反映
//   const handleAllSelectCheckBox = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const gridScrollContainer = parentGridScrollContainer.current;
//     if (!gridScrollContainer) return;

//     // ============================= 全チェックした時 =============================
//     if (e.target.checked === true) {
//       // カラムヘッダーのチェックボックスStateをtrueに変更
//       setCheckedColumnHeader(true);

//       // 現在取得している総アイテムを全てtrueに変更
//       setCheckedRows((prevState) => {
//         console.log("Object.entries(prevState)", Object.entries(prevState));
//         return Object.entries(prevState).reduce((acc: { [key: string]: boolean }, [key, value]) => {
//           acc[key] = true;
//           // acc[key] = !value;
//           return acc;
//         }, {});
//       });

//       // SelectedCheckBoxを全てのRowのIDを追加する
//       const allCheckedIdArray = Object.entries(checkedRows).reduce((acc: Record<string, boolean>, [key, value]) => {
//         acc[key] = true; // チェックを入れたtrueのルートなのでtrueにする
//         return acc;
//       }, {});
//       // {0: true, 1: true...}からキーのみを取得して配列を生成
//       const allKeys = Object.keys(allCheckedIdArray);
//       // idが数値型の場合にはキーを数値型に変換
//       let newAllSelectedCheckArray: number[] = [];
//       allKeys.forEach((item) => newAllSelectedCheckArray.push(Number(item)));
//       // idが数値の場合には順番をソートする
//       newAllSelectedCheckArray.sort((a, b) => a - b);
//       console.log("🔥ソート後 uniqueArray", newAllSelectedCheckArray);
//       setSelectedCheckBox(newAllSelectedCheckArray);
//     }
//     // ======================= 全チェックが外れた時 =======================
//     else {
//       // カラムヘッダーのチェックボックスStateをfalseに変更
//       setCheckedColumnHeader(false);

//       // 現在取得している総アイテムを全てfalseに変更
//       setCheckedRows((prevState) => {
//         // console.log("Object.entries(prevState)", Object.entries(prevState));
//         return Object.entries(prevState).reduce((acc: { [key: string]: boolean }, [key, value]) => {
//           acc[key] = false;
//           // acc[key] = !value;
//           return acc;
//         }, {});
//       });

//       // 全てのチェックボックスの値をfalseに変更後、stateの中身を空の配列に更新
//       setSelectedCheckBox([]);
//     }
//   };
//   // ================================= 🌟チェックボックス全選択🌟 =================================

//   // ================================== 🌟カラム順番入れ替え🌟 ==================================
//   const [leftBorderLine, setLeftBorderLine] = useState<number | null>(null);
//   const [rightBorderLine, setRightBorderLine] = useState<number | null>(null);
//   const [rightDropElement, setRightDropElement] = useState<Element | null>(null);
//   const [leftDropElement, setLeftDropElement] = useState<Element | null>(null);

//   // ============ ✅onDragStartイベント ドラッグ可能なターゲット上で発生するイベント✅ ============
//   const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
//     console.log("dragstart🔥 index", index);
//     setDragColumnIndex(index);

//     // 順番入れ替え中はリサイズオーバーレイのpointer-eventsはnoneにする
//     draggableOverlaysRef.current.forEach((div) => {
//       div?.classList.add(`pointer-events-none`);
//     });
//     // const gridCells = document.querySelectorAll(`[role="gridcell"]`);
//     // console.log("gridCells", gridCells);
//     // gridCells.forEach((div) => {
//     //   div?.classList.add(`pointer-events-none`);
//     // });

//     // ドラッグ要素を半透明にして色を付ける
//     e.currentTarget.classList.add(`${styles.dragging_change_order}`);

//     // テスト 🌟 onDragOverイベント
//     // 右の要素
//     console.log("🔥右", e.currentTarget.nextElementSibling?.role);

//     const rightItem: Element | null =
//       !e.currentTarget.nextElementSibling || e.currentTarget.nextElementSibling?.role === null
//         ? null
//         : e.currentTarget.nextElementSibling;
//     const rightItemLeft = rightItem?.getBoundingClientRect().left;
//     const rightItemWidth = rightItem?.getBoundingClientRect().width;
//     // 左の要素
//     console.log("🔥左", e.currentTarget.previousElementSibling?.role);
//     const leftItem: Element | null =
//       !e.currentTarget.previousElementSibling || e.currentTarget.previousElementSibling?.role === null
//         ? null
//         : e.currentTarget.previousElementSibling;
//     const leftItemLeft = leftItem?.getBoundingClientRect().left;
//     const leftItemWidth = leftItem?.getBoundingClientRect().width;

//     // if (!rightItemLeft || !rightItemWidth) return;
//     const rightBorderLine = rightItemLeft! + rightItemWidth! / 2; // 右要素ボーダーライン

//     // if (!leftItemLeft || !leftItemWidth) return;
//     const leftBorderLine = leftItemLeft! + leftItemWidth! / 2; // 左要素ボーダーライン
//     const newBorderLine = {
//       leftBorderLine: leftBorderLine ? leftBorderLine : null,
//       rightBorderLine: rightBorderLine ? rightBorderLine : null,
//     };
//     console.log("rightBorderLine, e.clientX, leftBorderLine", leftBorderLine, e.clientX, rightBorderLine);

//     setLeftBorderLine(leftBorderLine);
//     setRightBorderLine(rightBorderLine);
//     setRightDropElement(rightItem);
//     setLeftDropElement(leftItem);
//   };
//   // ============ ✅onDragStartイベント ドラッグ可能なターゲット上で発生するイベント✅ ここまで ============

//   //  ============ ✅onDragEnterイベント ドロップ対象に発生するイベント✅ ============
//   const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
//     // console.log("handleDragEnterドラッグエンター e.target🔥", e.target);
//     // console.log("colsRef.current[index]🔥", colsRef.current[index]);
//   };
//   // ============== ✅onDragEnterイベント ドロップ対象に発生するイベント✅ ここまで ==============

//   // ============== ✅onDragOverイベント ドロップ対象に発生するイベント✅ ==============
//   // ドラッグ対象がドロップ対象の半分を超えたらonDragEnterイベントを発火させる制御関数
//   const [isReadyDragEnter, setIsReadyDragEnter] = useState("");
//   let lastHalf: string | null = null;
//   const [dropIndex, setDropIndex] = useState<number>();
//   const [targetElement, setTargetElement] = useState<Element | null>(null);

//   const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
//     // if (isReadyDragEnter) return;
//     if (columnHeaderItemList[index].isFrozen)
//       return console.log("isFrozen リターン", columnHeaderItemList[index].isFrozen);
//     // console.log("🌟handleDragOver index, e", index, e);

//     // const dragItem: HTMLDivElement = e.target as HTMLDivElement; // ドラッグしている要素

//     // const targetEl = colsRef.current[index];

//     // 左要素のロジック ドラッグ位置が左隣の要素の中心を超えたら
//     if (leftBorderLine) {
//       if (e.clientX < leftBorderLine) {
//         // if (isReadyDragEnterRef.current !== "left")
//         if (isReadyDragEnter !== "left") {
//           console.log("ドラッグ要素が左半分に入った！！！🌟");
//           console.log("左隣要素の中央を突破🔥, ドロップ要素targetElement", colsRef.current[index]?.dataset.columnId);
//           setIsReadyDragEnter("left");
//           // isReadyDragEnterRef.current = "left";
//           setDropIndex(index);

//           setTargetElement(colsRef.current[index]); // 本番
//           // setTargetElement() // テスト
//         }
//       }
//     }

//     // 右要素のロジック ドラッグ位置が右隣の要素の中心を超えたら
//     if (rightBorderLine) {
//       if (e.clientX > rightBorderLine) {
//         // if (isReadyDragEnterRef.current !== "right")
//         if (isReadyDragEnter !== "right") {
//           console.log("ドラッグ要素が右半分に入った！！！🌟");
//           console.log("右隣要素の中央を突破🔥, ドロップ要素targetElement", colsRef.current[index]?.dataset.columnId);
//           setIsReadyDragEnter("right");
//           // isReadyDragEnterRef.current = "right";
//           setDropIndex(index);
//           setTargetElement(colsRef.current[index]);
//         }
//       }
//     }
//   };
//   // ============== ✅onDragOverイベント ドロップ対象に発生するイベント ここまで ==============

//   // ================== ✅useEffect onDragEnterイベントの役割✅ ==================
//   useEffect(() => {
//     console.log("dragEnter ドラッグIndex, ドロップIndex", dragColumnIndex, dropIndex);
//     if (!dragColumnIndex) return;
//     if (dropIndex === dragColumnIndex) return;
//     if (!targetElement) return;

//     console.log("(targetElement as HTMLDivElement).draggable", (targetElement as HTMLDivElement).draggable);
//     if ((targetElement as HTMLDivElement).draggable === false)
//       return console.log(
//         "idカラムには入れ替え不可リターン (e.target as HTMLDivElement).draggable",
//         (targetElement as HTMLDivElement).draggable
//       );

//     // 各要素の取得と要素のcolumnIdをdata属性から取得
//     const draggingElement = colsRef.current[dragColumnIndex];
//     const dropElement = targetElement as HTMLDivElement;
//     const draggingElementColumnId = draggingElement?.dataset.columnId;
//     const dropElementColumnId = dropElement?.dataset.columnId;

//     if (!draggingElementColumnId || !dropElementColumnId) return;

//     // ドラッグ、ドロップ2つの要素のcolIndexとwidthを取得
//     const draggingElementColIndex = columnHeaderItemList[dragColumnIndex].columnIndex;
//     const dropElementColIndex = columnHeaderItemList[dropIndex!].columnIndex;
//     const draggingElementColWidth = columnHeaderItemList[dragColumnIndex].columnWidth;
//     const dropElementColWidth = columnHeaderItemList[dropIndex!].columnWidth;
//     const draggingElementName = draggingElement.dataset.handlerId;
//     const dropElementColName = dropElement.dataset.handlerId;

//     console.log(
//       `🌟ドラッグ元name: ${draggingElementName} id: ${draggingElementColumnId}, colIndex: ${draggingElementColIndex}, width: ${draggingElementColWidth}`
//     );
//     console.log(
//       `🌟ドロップ先のName: ${dropElementColName} id: ${dropElementColumnId}, colIndex: ${dropElementColIndex}, width: ${dropElementColWidth}`
//     );

//     console.log("🌟更新前 columnHeaderItemList全体", columnHeaderItemList);
//     //  🌟順番を入れ替える columnHeaderItemList
//     const copyListItems: ColumnHeaderItemList[] = JSON.parse(JSON.stringify(columnHeaderItemList)); // 一意性を守るため新たなカラムリストを生成
//     // 入れ替え前にwidthを更新する CSSカスタムプロパティに反映 grid-template-columnsの場所も入れ替える
//     const copyTemplateColumnsWidth: string[] = JSON.parse(JSON.stringify(colsWidth));
//     console.log("🔥copyTemplateColumnsWidth, colsWidth", copyTemplateColumnsWidth, colsWidth);
//     const columnWidthsOmitCheckbox = copyTemplateColumnsWidth.slice(1); // checkboxを除いたwidthを取得

//     console.log("🔥columnWidthsOmitCheckbox", columnWidthsOmitCheckbox);
//     const newWidthListItems = copyListItems.map((item, index) => {
//       // console.log("item.columnWidth, columnWidthsOmitCheckbox[index]", item.columnWidth, columnWidthsOmitCheckbox[index]);
//       console.log(
//         "index, id, column名, columnIndex, columnWidth",
//         index,
//         item.columnId,
//         item.columnName,
//         item.columnIndex,
//         item.columnWidth,
//         columnWidthsOmitCheckbox[index]
//       );
//       return { ...item, columnWidth: columnWidthsOmitCheckbox[index] };
//     });
//     // columnIndexを入れ替え
//     console.log("🌟移動前のカラムリスト width更新後", newWidthListItems);
//     let prevListItemArray = JSON.parse(JSON.stringify(newWidthListItems));
//     // // ドラッグ要素をドロップ先の要素のインデックスに変更
//     // newListItemArray[dragColumnIndex].columnIndex = dropElementColIndex;
//     // // ドラッグ先のカラムのcolumnIndexをドラッグ元のカラムのインデックスに変更
//     // newListItemArray[dropIndex!].columnIndex = draggingElementColIndex;
//     // colIndexの順番を現在の配列のindexの順番に入れ替える
//     // const deleteElement = newListItemArray.splice(dragColumnIndex, 1)[0];
//     // newListItemArray.splice(dropIndex!, 0, deleteElement);

//     const transferredItem = prevListItemArray.splice(dragColumnIndex, 1)[0];
//     console.log("transferredItem, dropElementColIndex", transferredItem, dropElementColIndex);
//     prevListItemArray.splice(dropElementColIndex - 2, 0, transferredItem); // colindexとindexの差が2あるので-2引いた位置に挿入する
//     const newListItemArray = prevListItemArray.map((item: ColumnHeaderItemList, index: number) => {
//       const newItem = { ...item, columnIndex: index + 2 };
//       console.log("🌟ここ", newItem);
//       return newItem;
//     });
//     // const newListItemArray = JSON.parse(JSON.stringify(prevListItemArray));
//     // const newListItemArray = [...prevListItemArray];
//     console.log("移動前のカラムリスト", prevListItemArray);
//     console.log("移動前のカラムリスト", newListItemArray);

//     // let transferredElement = newListItemArray.splice()
//     setColumnHeaderItemList((prevArray) => {
//       console.log("ここprevArray", prevArray);
//       console.log("ここnewListItemArray", newListItemArray);
//       return [...newListItemArray];
//     });
//     // ================ ✅ローカルストレージにも更新後のカラムリストを保存 ================
//     // const columnHeaderItemListJSON = JSON.stringify(newListItemArray);
//     // localStorage.setItem("grid_columns_company", columnHeaderItemListJSON);
//     // ================ ✅ローカルストレージにも更新後のカラムリストを保存 ここまで ================

//     // --template-columnsも更新
//     console.log("copyTemplateColumnsWidth", copyTemplateColumnsWidth);
//     // const newTemplateColumnsWidth = copyTemplateColumnsWidth.map((item, index) => {
//     //   return index === 0 ? item : newListItemArray[index - 1].columnWidth;
//     // });
//     const transferredWidth = copyTemplateColumnsWidth.splice(dragColumnIndex + 1, 1)[0]; // checkbox分で1増やす
//     copyTemplateColumnsWidth.splice(dropElementColIndex - 1, 0, transferredWidth);
//     console.log("transferredWidth", transferredWidth);
//     const newTemplateColumnsWidth = JSON.parse(JSON.stringify(copyTemplateColumnsWidth));
//     console.log("copyTemplateColumnsWidth, newTemplateColumns", copyTemplateColumnsWidth, newTemplateColumnsWidth);

//     // grid-template-columnsの値となるCSSカスタムプロパティをセット
//     if (!parentGridScrollContainer.current) return;
//     parentGridScrollContainer.current.style.setProperty("--template-columns", `${newTemplateColumnsWidth.join(" ")}`);
//     console.log(
//       "更新後--template-columns",
//       parentGridScrollContainer.current.style.getPropertyValue("--template-columns")
//     );

//     // =========== 🌟colsWidthを更新
//     setColsWidth(newTemplateColumnsWidth);
//     currentColsWidths.current = newTemplateColumnsWidth;

//     setDragColumnIndex(dropIndex!);

//     // =========== 🌟isReadyDragEnterをfalseにして再度両隣を中央超えた場合に発火を許可する

//     // =============================== 右にドラッグで入ってくるルート ===============================
//     if (isReadyDragEnter === "right") {
//       // 右の要素
//       const rightItem: Element | null = colsRef.current[dropIndex!]!.nextElementSibling!
//         ? colsRef.current[dropIndex!]!.nextElementSibling!
//         : null;
//       const rightItemLeft = rightItem?.getBoundingClientRect().left;
//       const rightItemWidth = rightItem?.getBoundingClientRect().width;
//       // if (!rightItemLeft || !rightItemWidth) return;
//       const rightBorderLine = rightItemLeft! + rightItemWidth! / 2; // 右要素ボーダーライン

//       // 新たなドラッグアイテム
//       const newDraggingItem = draggingElement ? draggingElement : null;

//       // 左の要素
//       const leftItem: Element | null = colsRef.current[dropIndex!]!.previousElementSibling
//         ? colsRef.current[dropIndex!]!.previousElementSibling
//         : null;
//       const leftItemLeft = leftItem?.getBoundingClientRect().left;
//       const leftItemWidth = leftItem?.getBoundingClientRect().width;
//       // if (!leftItemLeft || !leftItemWidth) return;
//       const leftBorderLine = leftItemLeft! + leftItemWidth! / 2; // 左要素ボーダーライン
//       const newBorderLine = {
//         leftBorderLine: leftBorderLine,
//         rightBorderLine: rightBorderLine,
//       };
//       // setBorderLine(newBorderLine);
//       setLeftBorderLine(leftBorderLine); // 入れ替え後の次の左のボーダーラインをStateに格納
//       setRightBorderLine(rightBorderLine); // 入れ替え後の次の右のボーダーラインをStateに格納
//       setRightDropElement(rightItem); // 入れ替え後の次の左の要素をStateに格納
//       setLeftDropElement(leftItem); // 入れ替え後の次の左の要素をStateに格納
//     }
//     // =============================== 左にドラッグで入ってくるルート ===============================
//     if (isReadyDragEnter === "left") {
//       // 右の要素
//       const rightItem: Element | null = colsRef.current[dropIndex!]!.nextElementSibling
//         ? colsRef.current[dropIndex!]!.nextElementSibling
//         : null;
//       const rightItemLeft = rightItem?.getBoundingClientRect().left;
//       const rightItemWidth = rightItem?.getBoundingClientRect().width;
//       // if (!rightItemLeft || !rightItemWidth) return;
//       const rightBorderLine = rightItemLeft! + rightItemWidth! / 2; // 右要素ボーダーライン

//       // 新たなドラッグアイテム
//       const newDraggingItem = draggingElement ? draggingElement : null;

//       // 左の要素
//       const leftItem: Element | null = colsRef.current[dropIndex!]!.previousElementSibling!
//         ? colsRef.current[dropIndex!]!.previousElementSibling!
//         : null;
//       const leftItemLeft = leftItem?.getBoundingClientRect().left;
//       const leftItemWidth = leftItem?.getBoundingClientRect().width;
//       // if (!leftItemLeft || !leftItemWidth) return;
//       const leftBorderLine = leftItemLeft! + leftItemWidth! / 2; // 左要素ボーダーライン
//       const newBorderLine = {
//         leftBorderLine: leftBorderLine,
//         rightBorderLine: rightBorderLine,
//       };
//       console.log("🔥 leftItem", leftItem);
//       console.log("🔥 newDraggingItem", newDraggingItem);
//       console.log("🔥 rightItem", rightItem);
//       // setBorderLine(newBorderLine);
//       setLeftBorderLine(leftBorderLine);
//       setRightBorderLine(rightBorderLine);
//       setRightDropElement(rightItem);
//       setLeftDropElement(leftItem);
//     }

//     setTargetElement(null);
//     setIsReadyDragEnter("");
//   }, [targetElement]);
//   // ================== ✅useEffect onDragEnterの役割✅ ここまで ==================
//   // ============== ✅onDragEndイベント ドラッグ可能なターゲット上で発生するイベント✅ ==============
//   const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
//     console.log("Drop✅");
//     // ================ ✅ローカルストレージにも更新後のカラムリストを保存 ================
//     const columnHeaderItemListJSON = JSON.stringify(columnHeaderItemList);
//     localStorage.setItem("grid_columns_company", columnHeaderItemListJSON);
//     // ================ ✅ローカルストレージにも更新後のカラムリストを保存 ここまで ================
//     // =============== フローズン用 各カラムのLeft位置、レフトポジションを取得 ===============
//     // colsWidth ['65px', '100px', '250px', '250px', '250px', '250px', '250px', '250px']から
//     // accumulatedLeftPosition:  [65, 165, 415, 665, 915, 1165, 1415, 1665]
//     if (!colsWidth) return;
//     // 現在のcolsWidthをコピー
//     const widthArray = JSON.parse(JSON.stringify(colsWidth));

//     // 各要素の累積和を計算し、新しい配列を作る
//     const accumulatedArray = widthArray.reduce((acc: number[], value: string) => {
//       // parseIntを使って数値部分を抽出する
//       const number = parseInt(value, 10);
//       // 配列の最後の要素（現在の累積和）に数値を加える
//       const newSum = acc.length > 0 ? acc[acc.length - 1] + number : number;
//       // 新しい累積和を配列に追加する
//       acc.push(newSum);
//       return acc;
//     }, []);
//     // [65, 165, 415, 665, 915, 1165, 1415, 1665]
//     // refオブジェクトにレフトポジションを格納
//     columnLeftPositions.current = accumulatedArray;
//     console.log("カラム入れ替えonDragEndイベント レフトポジション accumulatedArray", accumulatedArray);
//     // ===================================================== 🔥テスト フローズンカスタムプロパティ
//     const filteredIsFrozenList = columnHeaderItemList.filter((item) => item.isFrozen === true);
//     filteredIsFrozenList.forEach((item, index) => {
//       parentGridScrollContainer.current!.style.setProperty(`--frozen-left-${index}`, `${accumulatedArray[index]}px`);
//     });
//     // ===================================================== 🔥テスト フローズンカスタムプロパティ
//     // =============== フローズン用 各カラムのLeft位置、レフトポジションを取得 ここまで ===============
//     // 順番入れ替え中はリサイズオーバーレイのpointer-eventsはnoneにする
//     draggableOverlaysRef.current.forEach((div) => {
//       div?.classList.remove(`pointer-events-none`);
//     });
//     // ドラッグ要素をスタイルを戻す
//     e.currentTarget.classList.remove(`${styles.dragging_change_order}`);
//     // ドラッグインデックスを空にする
//     setDragColumnIndex(null);
//   };
//   // ============== ✅onDragEndイベント ドラッグ可能なターゲット上で発生するイベント✅ ここまで ==============
//   // ================================== 🌟カラム順番入れ替え🌟 ここまで ==================================

//   // ============== 🌟フローズンイベント leftとstickyとz-indexを加えて、columnIndexを変更する🌟 ==============
//   const handleFrozen = (e: React.MouseEvent<HTMLElement, MouseEvent>, index: number) => {
//     console.log("🌟カラムヘッダー ダブルクリック フローズンイベント ========================");
//     console.log(e);
//     console.log(index);
//     console.log("✅ フローズンの個数isFrozenCountRef.current", isFrozenCountRef.current);
//     console.log("✅ レフトポジションcolumnLeftPositions.current", columnLeftPositions.current);

//     // 🔥フローズンを付与するルート =================================
//     if (columnHeaderItemList[index].isFrozen === false) {
//       console.log("🔥フローズンを付与するルート ============================");
//       // ✅順番を入れ替え処理 一意性を守るため新たなカラムリストを生成
//       const copyColumnHeaderListItems: ColumnHeaderItemList[] = JSON.parse(JSON.stringify(columnHeaderItemList));
//       // クリックされたカラムヘッダーをリストから取り出す 配列内に一つのみ取得されるので、[0]をつけてオブジェクトで取得
//       const targetFrozenColumn = copyColumnHeaderListItems.splice(index, 1)[0]; // 破壊的
//       console.log("フローズンイベント 今回取り出したフローズンをつけるカラム", targetFrozenColumn);
//       // ターゲットカラムのisFrozenプロパティをtrueに変更する
//       targetFrozenColumn.isFrozen = true;
//       // 残りのリストから現在のisFrozenが付いているリストと付いていないリストに分ける
//       const filteredIsFrozenColumnList = copyColumnHeaderListItems.filter((item) => item.isFrozen === true);
//       const filteredNotFrozenColumnList = copyColumnHeaderListItems.filter((item) => item.isFrozen === false);
//       console.log(
//         "フローズンイベント フローズンが付いているカラムリスト filteredIsFrozenColumnList",
//         filteredIsFrozenColumnList
//       );
//       console.log(
//         "フローズンイベント フローズンが付いていないカラムリスト filteredNotFrozenColumnList",
//         filteredNotFrozenColumnList
//       );
//       // 順番入れ替え
//       // フローズンが付いているリストの後に今回フローズンがついたターゲットカラムを配置し、その後に残りのカラムリストを展開する
//       const newColumnHeaderItemList = [
//         ...filteredIsFrozenColumnList,
//         targetFrozenColumn,
//         ...filteredNotFrozenColumnList,
//       ];
//       // 順番入れ替え後のカラムリストのcolumnIndexを現在の順番に揃える
//       newColumnHeaderItemList.forEach((item, index) => (item.columnIndex = index + 2));
//       console.log("フローズンイベント 順番入れ替えとcolumnIndex整形後のカラムリスト", newColumnHeaderItemList);
//       // カラムリストのStateを更新
//       setColumnHeaderItemList(newColumnHeaderItemList);

//       // ================ ✅ローカルストレージにも更新後のカラムリストを保存 ================
//       const columnHeaderItemListJSON = JSON.stringify(newColumnHeaderItemList);
//       localStorage.setItem("grid_columns_company", columnHeaderItemListJSON);
//       // ================ ✅ローカルストレージにも更新後のカラムリストを保存 ここまで ================

//       // 現在のフローズンの総個数を更新する filteredIsFrozenColumnListの+1
//       isFrozenCountRef.current = isFrozenCountRef.current + 1;
//       // isFrozenCountRef.current = filteredIsFrozenColumnList.length + 1;

//       // ✅--template-columnsも更新する [65px, 100px, 250px,...]の配列を作成してjoinで' 'を付けて結合する
//       const newColumnWidthList = newColumnHeaderItemList.map((item) => item.columnWidth);
//       // カラムWidthListにチェックボックスカラムの65pxを配列に追加する
//       newColumnWidthList.unshift("65px");
//       console.log("チェックボックス65pxを追加したColumnWidthリスト", newColumnWidthList);
//       console.log('ColumnWidthリストのjoin(" ")後', newColumnWidthList.join(" "));

//       if (!parentGridScrollContainer.current) return;
//       parentGridScrollContainer.current.style.setProperty("--template-columns", `${newColumnWidthList.join(" ")}`);
//       console.log(
//         "フローズンイベント 更新後--template-columns",
//         parentGridScrollContainer.current.style.getPropertyValue("--template-columns")
//       );
//       // colsWidthのStateを更新
//       setColsWidth(newColumnWidthList);
//       currentColsWidths.current = newColumnWidthList;

//       // =============== フローズン用 各カラムのLeft位置、レフトポジションを取得 ===============
//       // colsWidth ['65px', '100px', '250px', '250px', '250px', '250px', '250px', '250px']から
//       // accumulatedLeftPosition:  [65, 165, 415, 665, 915, 1165, 1415, 1665]
//       // if (!colsWidth) return;
//       // 現在のcolsWidthをコピー
//       const widthArray = JSON.parse(JSON.stringify(newColumnWidthList));

//       // 各要素の累積和を計算し、新しい配列を作る
//       const accumulatedArray = widthArray.reduce((acc: number[], value: string) => {
//         // parseIntを使って数値部分を抽出する
//         const number = parseInt(value, 10);
//         // 配列の最後の要素（現在の累積和）に数値を加える
//         const newSum = acc.length > 0 ? acc[acc.length - 1] + number : number;
//         // 新しい累積和を配列に追加する
//         acc.push(newSum);
//         return acc;
//       }, []);
//       // [65, 165, 415, 665, 915, 1165, 1415, 1665]
//       // refオブジェクトにレフトポジションを格納
//       columnLeftPositions.current = accumulatedArray;
//       // ===================================================== 🔥テスト フローズンカスタムプロパティ
//       const filteredIsFrozenList = newColumnHeaderItemList.filter((item) => item.isFrozen === true);
//       filteredIsFrozenList.forEach((item, index) => {
//         parentGridScrollContainer.current!.style.setProperty(`--frozen-left-${index}`, `${accumulatedArray[index]}px`);
//       });
//       // ===================================================== 🔥テスト フローズンカスタムプロパティ

//       // レフトポジションをカスタムプロパティに追加 =============================== テスト 🔥
//       // parentGridScrollContainer.current.style.setProperty(
//       //   `--frozen-left-${isFrozenCountRef.current - 1}`,
//       //   columnLeftPositions.current[isFrozenCountRef.current - 1].toString() + "px"
//       // );
//       // console.log(
//       //   `フローズンイベント カスタムプロパティ作成--frozen-left-${isFrozenCountRef.current - 1}`,
//       //   parentGridScrollContainer.current.style.getPropertyValue(`--frozen-left-${isFrozenCountRef.current - 1}`)
//       // );
//       // レフトポジションをカスタムプロパティに追加 =============================== テスト 🔥
//       // =============== フローズン用 各カラムのLeft位置、レフトポジションを取得 ここまで ===============
//     }
//     // 🔥フローズンを外すルート ====================
//     else {
//       console.log("🔥フローズンを外すルート ============================");
//       // ✅順番を入れ替え処理 一意性を守るため新たなカラムリストを生成
//       const copyColumnHeaderListItems: ColumnHeaderItemList[] = JSON.parse(JSON.stringify(columnHeaderItemList));
//       // クリックされたカラムヘッダーをリストから取り出す 配列内に一つのみ取得されるので、[0]をつけてオブジェクトで取得
//       const targetNotFrozenColumn = copyColumnHeaderListItems.splice(index, 1)[0]; // 破壊的
//       console.log("フローズンイベント 今回取り出したフローズンを外すカラム", targetNotFrozenColumn);
//       // ターゲットカラムのisFrozenプロパティをtrueに変更する
//       targetNotFrozenColumn.isFrozen = false;
//       // 残りのリストから現在のisFrozenが付いているリストと付いていないリストに分ける
//       const filteredIsFrozenColumnList = copyColumnHeaderListItems.filter((item) => item.isFrozen === true);
//       const filteredNotFrozenColumnList = copyColumnHeaderListItems.filter((item) => item.isFrozen === false);
//       console.log(
//         "フローズンイベント フローズンが付いているカラムリスト filteredIsFrozenColumnList",
//         filteredIsFrozenColumnList
//       );
//       console.log(
//         "フローズンイベント フローズンが付いていないカラムリスト filteredNotFrozenColumnList",
//         filteredNotFrozenColumnList
//       );
//       // 順番入れ替え
//       // フローズンが付いているリストの後に今回フローズンがついたターゲットカラムを配置し、その後に残りのカラムリストを展開する
//       const newColumnHeaderItemList = [
//         ...filteredIsFrozenColumnList,
//         targetNotFrozenColumn,
//         ...filteredNotFrozenColumnList,
//       ];
//       // 順番入れ替え後のカラムリストのcolumnIndexを現在の順番に揃える
//       newColumnHeaderItemList.forEach((item, index) => (item.columnIndex = index + 2));
//       console.log("フローズンイベント 順番入れ替えとcolumnIndex整形後のカラムリスト", newColumnHeaderItemList);
//       // カラムリストのStateを更新
//       setColumnHeaderItemList(newColumnHeaderItemList);

//       // ================ ✅ローカルストレージにも更新後のカラムリストを保存 ================
//       const columnHeaderItemListJSON = JSON.stringify(newColumnHeaderItemList);
//       localStorage.setItem("grid_columns_company", columnHeaderItemListJSON);
//       // ================ ✅ローカルストレージにも更新後のカラムリストを保存 ここまで ================

//       // 現在のフローズンの総個数を更新する filteredIsFrozenColumnListの-1
//       isFrozenCountRef.current = isFrozenCountRef.current - 1;
//       // isFrozenCountRef.current = filteredIsFrozenColumnList.length - 1;

//       // ✅--template-columnsも更新する [65px, 100px, 250px,...]の配列を作成してjoinで' 'を付けて結合する
//       const newColumnWidthList = newColumnHeaderItemList.map((item) => item.columnWidth);
//       // カラムWidthListにチェックボックスカラムの65pxを配列に追加する
//       newColumnWidthList.unshift("65px");
//       console.log("チェックボックス65pxを追加したColumnWidthリスト", newColumnWidthList);
//       console.log('ColumnWidthリストのjoin(" ")後', newColumnWidthList.join(" "));

//       if (!parentGridScrollContainer.current) return;
//       parentGridScrollContainer.current.style.setProperty("--template-columns", `${newColumnWidthList.join(" ")}`);
//       console.log(
//         "フローズンイベント 更新後--template-columns",
//         parentGridScrollContainer.current.style.getPropertyValue("--template-columns")
//       );
//       // colsWidthのStateを更新
//       setColsWidth(newColumnWidthList);
//       currentColsWidths.current = newColumnWidthList;

//       // =============== フローズン用 各カラムのLeft位置、レフトポジションを取得 ===============
//       // colsWidth ['65px', '100px', '250px', '250px', '250px', '250px', '250px', '250px']から
//       // accumulatedLeftPosition:  [65, 165, 415, 665, 915, 1165, 1415, 1665]
//       // if (!colsWidth) return;
//       // 現在のcolsWidthをコピー
//       const widthArray = JSON.parse(JSON.stringify(newColumnWidthList));

//       // 各要素の累積和を計算し、新しい配列を作る
//       const accumulatedArray = widthArray.reduce((acc: number[], value: string) => {
//         // parseIntを使って数値部分を抽出する
//         const number = parseInt(value, 10);
//         // 配列の最後の要素（現在の累積和）に数値を加える
//         const newSum = acc.length > 0 ? acc[acc.length - 1] + number : number;
//         // 新しい累積和を配列に追加する
//         acc.push(newSum);
//         return acc;
//       }, []);
//       // [65, 165, 415, 665, 915, 1165, 1415, 1665]
//       // refオブジェクトにレフトポジションを格納
//       columnLeftPositions.current = accumulatedArray;

//       // レフトポジションをカスタムプロパティから削除 -1された状態なので、そのままの個数で指定 =========== テスト🔥
//       parentGridScrollContainer.current.style.removeProperty(`--frozen-left-${isFrozenCountRef.current}`);
//       // // 位置が入れ替わってLeftポジションが再計算された状態でセットし直す
//       // parentGridScrollContainer.current.style.setProperty(
//       //   `--frozen-left-${isFrozenCountRef.current - 1}`,
//       //   columnLeftPositions.current[isFrozenCountRef.current - 1].toString() + "px"
//       // );
//       // レフトポジションをカスタムプロパティから削除 -1された状態なので、そのままの個数で指定 =========== テスト🔥
//       // ===================================================== 🔥テスト フローズンカスタムプロパティ
//       const filteredIsFrozenList = newColumnHeaderItemList.filter((item) => item.isFrozen === true);
//       filteredIsFrozenList.forEach((item, index) => {
//         parentGridScrollContainer.current!.style.setProperty(`--frozen-left-${index}`, `${accumulatedArray[index]}px`);
//       });
//       // ===================================================== 🔥テスト フローズンカスタムプロパティ
//       // =============== フローズン用 各カラムのLeft位置、レフトポジションを取得 ここまで ===============
//     }
//   };
//   // ============== 🌟フローズンイベント ドラッグ可能なターゲット上で発生するイベント🌟 ここまで ==============

//   // ===================== 🌟ツールチップ 3点リーダーの時にツールチップ表示🌟 =====================
//   const setHoveredItemPos = useStore((state) => state.setHoveredItemPos);
//   const handleOpenTooltip = (e: React.MouseEvent<HTMLElement, MouseEvent>, display: string, columnName: string) => {
//     // ホバーしたアイテムにツールチップを表示
//     const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
//     // console.log("ツールチップx, y width , height", x, y, width, height);

//     setHoveredItemPos({
//       x: x,
//       y: y,
//       itemWidth: width,
//       itemHeight: height,
//       content: columnName,
//       display: display,
//     });
//   };
//   // ツールチップを非表示
//   const handleCloseTooltip = () => {
//     setHoveredItemPos(null);
//   };
//   // ==================================================================================

//   console.log("✅ clickedActiveRow", clickedActiveRow);
//   console.log("✅ checkedRows", checkedRows);
//   console.log("✅ selectedCheckBox", selectedCheckBox);
//   console.log("✅ allRows", allRows);

//   // 🌟現在のカラム順、.map((obj) => Object.values(row)[obj.columnId])で展開してGridセルを表示する
//   const columnOrder = [...columnHeaderItemList].map((item, index) => ({ columnId: item.columnId })); // columnIdのみの配列を取得
//   // 🌟現在のisFrozenの数を取得 isFrozenの個数の総数と同じindex+1のアイテムにborder-right: 4pxを付与する
//   // const currentIsFrozenCount = columnHeaderItemList.filter(obj => obj.isFrozen === true).length
//   console.log("✅ columnHeaderItemList, columnOrder", columnHeaderItemList, columnOrder);
//   console.log("✅ colsWidth                ", colsWidth);
//   console.log("✅ currentColsWidths.current", currentColsWidths.current);
//   console.log("✅ フローズンの個数isFrozenCountRef.current", isFrozenCountRef.current);
//   console.log("✅ レフトポジションcolumnLeftPositions.current", columnLeftPositions.current);

//   // 🌟カラム3点リーダー表示中はホバー時にツールチップを有効化
//   // console.log("✅isOverflowColumnHeader", isOverflowColumnHeader);

//   return (
//     <>
//       {/* ================== メインコンテナ ================== */}
//       <div
//         className={`${styles.main_container} ${
//           theme === "light" ? `${styles.theme_f_light}` : `${styles.theme_f_dark}`
//         }`}
//       >
//         {/* ================== Gridテーブルヘッダー ================== */}
//         {/* <GridTableHeader /> */}
//         <div className={`${styles.grid_header}`}>
//           <div className={`${styles.table_tab}`}>{title}</div>
//         </div>
//         {/* ================== Gridメインコンテナ ================== */}
//         <div className={`${styles.grid_main_container}`}>
//           {/* ================== Gridファンクションヘッダー ボタンでページ遷移 ================== */}
//           {/* <div className={`${styles.grid_function_header}`}>
//             <RippleButton title={`${title}へ`} fontSize="12px" padding="5px 15px" borderRadius="4px" />
//           </div> */}
//           {/* ================== Gridスクロールコンテナ ================== */}
//           <div
//             ref={parentGridScrollContainer}
//             role="grid"
//             aria-multiselectable="true"
//             style={{ width: "100%" }}
//             // style={{ height: "100%", "--header-row-height": "35px" } as any}
//             className={`${styles.grid_scroll_container}`}
//           >
//             {/* ======================== 🌟Grid列トラック Rowヘッダー🌟 ======================== */}
//             <div
//               role="row"
//               tabIndex={-1}
//               aria-rowindex={1}
//               aria-selected={false}
//               className={`${styles.grid_header_row}`}
//             >
//               {/* ======== ヘッダーセル チェックボックスColumn ======== */}
//               <div
//                 ref={rowHeaderRef}
//                 role="columnheader"
//                 aria-colindex={1}
//                 aria-selected={false}
//                 tabIndex={-1}
//                 className={`${styles.grid_column_header_all} ${styles.grid_column_frozen} ${styles.grid_column_header_checkbox_column}`}
//                 // style={{ gridColumnStart: 1, left: columnHeaderLeft(0), position: "sticky" }}
//                 style={{ gridColumnStart: 1, left: "0px", position: "sticky" }}
//                 onClick={(e) => handleClickGridCell(e)}
//               >
//                 <div className={styles.grid_select_cell_header}>
//                   <input
//                     type="checkbox"
//                     aria-label="Select All"
//                     checked={!!checkedColumnHeader} // 初期値
//                     onChange={(e) => handleAllSelectCheckBox(e)}
//                     className={`${styles.grid_select_cell_header_input}`}
//                   />
//                   <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
//                     <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
//                   </svg>
//                 </div>
//               </div>
//               {/* ======== ヘッダーセル 全てのプロパティ(フィールド)Column ここから  ======== */}

//               {
//                 // allRows[0] &&
//                 //   Object.keys(allRows[0]).map((key, index) => (
//                 !!columnHeaderItemList.length &&
//                   columnHeaderItemList
//                     .sort((a, b) => a.columnIndex - b.columnIndex) // columnIndexで並び替え
//                     .map((key, index) => (
//                       <div
//                         // key={index}
//                         key={key.columnId}
//                         ref={(ref) => (colsRef.current[index] = ref)}
//                         role="columnheader"
//                         draggable={!key.isFrozen} // テスト
//                         // draggable={index === 0 ? false : true} // テスト
//                         data-column-id={`${key.columnId}`}
//                         data-handler-id={`T${key.columnId}${key.columnName}`}
//                         data-text={`${key.columnName}`}
//                         aria-colindex={key.columnIndex}
//                         // aria-colindex={index + 2}
//                         aria-selected={false}
//                         tabIndex={-1}
//                         className={`${styles.grid_column_header_all} ${
//                           key.isFrozen ? `${styles.grid_column_frozen} cursor-default` : "cursor-grab"
//                         } ${isFrozenCountRef.current === 1 && index === 0 ? styles.grid_cell_frozen_last : ""} ${
//                           isFrozenCountRef.current === index + 1 ? styles.grid_cell_frozen_last : ""
//                         } ${styles.grid_cell_resizable} dropzone ${key.isOverflow ? `${styles.is_overflow}` : ""}`}
//                         // className={`${styles.grid_column_header_all} ${index === 0 && styles.grid_column_frozen} ${
//                         //   index === 0 && styles.grid_cell_frozen_last
//                         // } ${styles.grid_cell_resizable} dropzone cursor-grab ${
//                         //   key.isOverflow ? `${styles.is_overflow}` : ""
//                         // }`}
//                         style={
//                           key.isFrozen
//                             ? { gridColumnStart: index + 2, left: `var(--frozen-left-${index})` }
//                             : { gridColumnStart: index + 2 }
//                         }
//                         // style={
//                         //   key.isFrozen
//                         //     ? { gridColumnStart: index + 2, left: columnLeftPositions.current[index] }
//                         //     : { gridColumnStart: index + 2 }
//                         // }
//                         // style={
//                         //   key.isFrozen
//                         //     ? { gridColumnStart: index + 2, left: columnHeaderLeft(index) }
//                         //     : { gridColumnStart: index + 2 }
//                         // }
//                         // style={{ gridColumnStart: index + 2, left: columnHeaderLeft(index + 1) }}
//                         onClick={(e) => handleClickGridCell(e)}
//                         onDoubleClick={(e) => {
//                           handleFrozen(e, index);
//                           // handleDoubleClick(e, index);
//                         }}
//                         onMouseEnter={(e) => {
//                           // if (isOverflowColumnHeader.includes(key.columnId.toString())) {
//                           if (key.isOverflow) {
//                             handleOpenTooltip(e, "top", key.columnName);
//                             console.log("マウスエンター key.columnId.toString()");
//                             console.log("マウスエンター ツールチップオープン カラムID", key.columnId.toString());
//                           }
//                           // handleOpenTooltip(e, "left");
//                         }}
//                         onMouseLeave={() => {
//                           // if (isOverflowColumnHeader.includes(key.columnId.toString())) {
//                           if (key.isOverflow) {
//                             console.log("マウスリーブ ツールチップクローズ");
//                             handleCloseTooltip();
//                           }
//                           // handleCloseTooltip();
//                         }}
//                         onDragStart={(e) => handleDragStart(e, index)} // テスト
//                         onDragEnd={(e) => handleDragEnd(e)} // テスト
//                         onDragOver={(e) => {
//                           e.preventDefault(); // テスト
//                           handleDragOver(e, index);
//                         }}
//                         // onDragEnter={debounce((e) => {
//                         //   handleDragEnter(e, index); // デバウンス
//                         // }, 300)}
//                         onDragEnter={(e) => {
//                           handleDragEnter(e, index);
//                         }}
//                       >
//                         {/* カラム順番入れ替えdraggable用ラッパー(padding 8px除く全体) */}
//                         <div
//                           ref={(ref) => (draggableColsRef.current[index] = ref)}
//                           // draggable={true}
//                           className={`draggable_column_header pointer-events-none w-full`}
//                           data-handler-id={`T${key.columnId}${key.columnName}`}
//                           // className="w-full"
//                           // data-handler-id="T1127"
//                           // style={{ opacity: 1, cursor: "grab" }}
//                         >
//                           <div
//                             className={`${styles.grid_column_header} ${
//                               index === 0 && styles.grid_column_header_cursor
//                             } pointer-events-none touch-none select-none`}
//                           >
//                             <div className={`${styles.grid_column_header_inner} pointer-events-none`}>
//                               <span
//                                 className={`${styles.grid_column_header_inner_name} pointer-events-none`}
//                                 ref={(ref) => (columnHeaderInnerTextRef.current[index] = ref)}
//                               >
//                                 {key.columnName}
//                               </span>
//                             </div>
//                           </div>
//                         </div>
//                         {/* ドラッグ用overlay */}
//                         <div
//                           ref={(ref) => (draggableOverlaysRef.current[index] = ref)}
//                           role="draggable_overlay"
//                           className={styles.draggable_overlay}
//                           onMouseDown={(e) => handleMouseDown(e, index)}
//                           onMouseEnter={() => {
//                             const gridScrollContainer = parentGridScrollContainer.current;
//                             if (!gridScrollContainer) return;
//                             const colsLines = gridScrollContainer.querySelectorAll(`[aria-colindex="${index + 2}"]`);
//                             colsLines.forEach((col) => {
//                               if (col instanceof HTMLDivElement) {
//                                 // col.style.borderRightColor = `#24b47e`;
//                                 col.classList.add(`${styles.is_dragging_hover}`);
//                               }
//                             });
//                           }}
//                           onMouseLeave={() => {
//                             const gridScrollContainer = parentGridScrollContainer.current;
//                             if (!gridScrollContainer) return;
//                             const colsLines = gridScrollContainer.querySelectorAll(`[aria-colindex="${index + 2}"]`);
//                             colsLines.forEach((col) => {
//                               if (col instanceof HTMLDivElement) {
//                                 // col.style.borderRightColor = `#444`;
//                                 col.classList.remove(`${styles.is_dragging_hover}`);
//                               }
//                             });
//                           }}
//                         ></div>
//                       </div>
//                     ))
//               }
//               {/* ======== ヘッダーセル idを除く全てのプロパティ(フィールド)Column ここまで  ======== */}
//             </div>
//             {/* ======================== 🌟Grid列トラック Rowヘッダー🌟 ======================== */}

//             {/* ======================== 🌟Grid列トラック Rowグループコンテナ🌟 ======================== */}
//             {/* Rowアイテム収納のためのインナー要素 */}
//             <div
//               ref={gridRowGroupContainerRef}
//               role="rowgroup"
//               style={
//                 {
//                   height: `${rowVirtualizer.getTotalSize()}px`,
//                   // width: "100%",
//                   width: `var(--row-width)`,
//                   position: "relative",
//                   // "--header-row-height": "35px",
//                   "--header-row-height": "30px",
//                   "--row-width": "",
//                 } as any
//               }
//               className={`${styles.grid_rowgroup_virtualized_container}`}
//             >
//               {rowVirtualizer.getVirtualItems().map((virtualRow) => {
//                 const isLoaderRow = virtualRow.index > allRows.length - 1;
//                 const rowData = allRows[virtualRow.index];

//                 // ========= 🌟ローディング中の行トラック =========
//                 // if (isLoaderRow) return hasNextPage ? "Loading more" : "Nothing more to load";
//                 if (isLoaderRow) {
//                   return (
//                     <div
//                       key={virtualRow.index.toString() + "Loading"}
//                       role="row"
//                       tabIndex={-1}
//                       // aria-rowindex={virtualRow.index + 1} // ヘッダーの次からなのでindex0+2
//                       aria-selected={false}
//                       className={`${styles.loading_reflection} flex-center mx-auto h-[30px] w-full text-center font-bold`}
//                       // className={`${styles.loading_reflection} flex-center mx-auto h-[35px] w-full text-center font-bold`}
//                     >
//                       <span className={`${styles.reflection}`}></span>
//                       <div className={styles.spinner78}></div>
//                     </div>
//                   );
//                 }
//                 // ========= 🌟ローディング中の行トラック ここまで =========
//                 /* ======================== Grid列トラック Row ======================== */
//                 return (
//                   <div
//                     key={"row" + virtualRow.index.toString()}
//                     role="row"
//                     tabIndex={-1}
//                     aria-rowindex={virtualRow.index + 2} // ヘッダーの次からで+1、indexは0からなので+1で、index0に+2
//                     // aria-selected={false}
//                     // チェックが入っているか、もしくは列内のセルがクリックされアクティブになっていた場合には該当のrowのaria-selectedをtrueにする
//                     aria-selected={
//                       checkedRows[virtualRow.index.toString()] || clickedActiveRow === virtualRow.index + 2
//                     }
//                     className={`${styles.grid_row} ${rowData.id === 1 ? "first" : ""}`}
//                     style={{
//                       // gridTemplateColumns: colsWidth.join(" "),
//                       // top: gridRowTrackTopPosition(index),
//                       // top: ((virtualRow.index + 0) * 35).toString() + "px", // +1か0か
//                       top: ((virtualRow.index + 0) * 30).toString() + "px", // +1か0か
//                     }}
//                   >
//                     {/* ======== gridセル チェックボックスセル ======== */}
//                     <div
//                       ref={(ref) => (gridRowTracksRefs.current[virtualRow.index] = ref)}
//                       role="gridcell"
//                       aria-colindex={1}
//                       aria-selected={false}
//                       aria-readonly={true}
//                       tabIndex={-1}
//                       className={`${styles.grid_cell} ${styles.grid_column_frozen}`}
//                       // style={{ gridColumnStart: 1, left: columnHeaderLeft(0) }}
//                       style={{ gridColumnStart: 1, left: "0px" }}
//                       onClick={(e) => handleClickGridCell(e)}
//                     >
//                       <div className={styles.grid_select_cell_header}>
//                         <input
//                           id="checkbox"
//                           type="checkbox"
//                           aria-label="Select"
//                           value={rowData?.id}
//                           checked={!!checkedRows[virtualRow.index.toString()]} // !!で初期状態でstateがundefinedでもfalseになるようにして、初期エラーを回避する
//                           onChange={(e) => {
//                             if (typeof rowData?.id === "undefined") return;
//                             console.log(`クリック VirtualRow.index: ${virtualRow.index} row.id${rowData.id}`);
//                             handleSelectedCheckBox(e, rowData?.id);
//                           }}
//                           // className={`${styles.grid_select_cell_header_input}`}
//                         />
//                         <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
//                           <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
//                         </svg>
//                       </div>
//                     </div>
//                     {/* ======== gridセル 全てのプロパティ(フィールド)セル  ======== */}

//                     {rowData ? (
//                       // カラム順番が変更されているなら順番を合わせてからmap()で展開
//                       columnOrder ? (
//                         columnOrder
//                           .map((obj) => Object.values(rowData)[obj.columnId])
//                           .map((value, index) => (
//                             <div
//                               key={"row" + virtualRow.index.toString() + index.toString()}
//                               role="gridcell"
//                               // ref={(ref) => (colsRef.current[index] = ref)}
//                               // aria-colindex={index + 2}
//                               aria-colindex={
//                                 columnHeaderItemList[index] ? columnHeaderItemList[index]?.columnIndex : index + 2
//                               } // カラムヘッダーの列StateのcolumnIndexと一致させる
//                               aria-selected={false}
//                               // variant="contained"
//                               tabIndex={-1}
//                               className={`${styles.grid_cell} ${
//                                 columnHeaderItemList[index].isFrozen ? styles.grid_column_frozen : ""
//                               } ${isFrozenCountRef.current === 1 && index === 0 ? styles.grid_cell_frozen_last : ""} ${
//                                 isFrozenCountRef.current === index + 1 ? styles.grid_cell_frozen_last : ""
//                               }  ${styles.grid_cell_resizable}`}
//                               // className={`${styles.grid_cell} ${index === 0 ? styles.grid_column_frozen : ""}  ${index === 0 ? styles.grid_cell_frozen_last : ""} ${styles.grid_cell_resizable}`}
//                               // style={{ gridColumnStart: index + 2, left: columnHeaderLeft(index + 1) }}
//                               style={
//                                 columnHeaderItemList[index].isFrozen
//                                   ? {
//                                       gridColumnStart: columnHeaderItemList[index]
//                                         ? columnHeaderItemList[index]?.columnIndex
//                                         : index + 2,
//                                       left: `var(--frozen-left-${index})`,
//                                     }
//                                   : {
//                                       gridColumnStart: columnHeaderItemList[index]
//                                         ? columnHeaderItemList[index]?.columnIndex
//                                         : index + 2,
//                                     }
//                               }
//                               // style={
//                               //   columnHeaderItemList[index].isFrozen
//                               //     ? {
//                               //         gridColumnStart: columnHeaderItemList[index]
//                               //           ? columnHeaderItemList[index]?.columnIndex
//                               //           : index + 2,
//                               //         left: columnLeftPositions.current[index],
//                               //       }
//                               //     : {
//                               //         gridColumnStart: columnHeaderItemList[index]
//                               //           ? columnHeaderItemList[index]?.columnIndex
//                               //           : index + 2,
//                               //       }
//                               // }
//                               // style={
//                               //   columnHeaderItemList[index].isFrozen
//                               //     ? {
//                               //         gridColumnStart: columnHeaderItemList[index]
//                               //           ? columnHeaderItemList[index]?.columnIndex
//                               //           : index + 2,
//                               //         left: columnHeaderLeft(index),
//                               //       }
//                               //     : {
//                               //         gridColumnStart: columnHeaderItemList[index]
//                               //           ? columnHeaderItemList[index]?.columnIndex
//                               //           : index + 2,
//                               //       }
//                               // }
//                               // style={{
//                               //   gridColumnStart: columnHeaderItemList[index]
//                               //     ? columnHeaderItemList[index]?.columnIndex
//                               //     : index + 2,
//                               //   left: columnHeaderLeft(index + 1),
//                               // }}
//                               onClick={handleClickGridCell}
//                               onDoubleClick={(e) => handleDoubleClick(e, index, columnHeaderItemList[index].columnName)}
//                               // onClick={handleSingleOrDoubleClick}
//                             >
//                               {value}
//                             </div>
//                           ))
//                       ) : (
//                         // カラム順番が変更されていない場合には、初期のallRows[0]のrowからmap()で展開
//                         Object.values(rowData).map((value, index) => (
//                           <div
//                             key={"row" + virtualRow.index.toString() + index.toString()}
//                             // ref={(ref) => (colsRef.current[index] = ref)}
//                             role="gridcell"
//                             // aria-colindex={index + 2}
//                             aria-colindex={
//                               columnHeaderItemList[index] ? columnHeaderItemList[index]?.columnIndex : index + 2
//                             } // カラムヘッダーの列StateのcolumnIndexと一致させる
//                             aria-selected={false}
//                             tabIndex={-1}
//                             className={`${styles.grid_cell} ${index === 0 ? styles.grid_column_frozen : ""} ${
//                               index === 0 ? styles.grid_cell_frozen_last : ""
//                             } ${styles.grid_cell_resizable}`}
//                             // style={{ gridColumnStart: index + 2, left: columnHeaderLeft(index + 1) }}
//                             style={
//                               columnHeaderItemList[index].isFrozen
//                                 ? {
//                                     gridColumnStart: columnHeaderItemList[index]
//                                       ? columnHeaderItemList[index]?.columnIndex
//                                       : index + 2,
//                                     left: columnLeftPositions.current[index],
//                                   }
//                                 : {
//                                     gridColumnStart: columnHeaderItemList[index]
//                                       ? columnHeaderItemList[index]?.columnIndex
//                                       : index + 2,
//                                   }
//                             }
//                             // style={
//                             //   columnHeaderItemList[index].isFrozen
//                             //     ? {
//                             //         gridColumnStart: columnHeaderItemList[index]
//                             //           ? columnHeaderItemList[index]?.columnIndex
//                             //           : index + 2,
//                             //         left: columnHeaderLeft(index),
//                             //       }
//                             //     : {
//                             //         gridColumnStart: columnHeaderItemList[index]
//                             //           ? columnHeaderItemList[index]?.columnIndex
//                             //           : index + 2,
//                             //       }
//                             // }
//                             // style={{
//                             //   gridColumnStart: columnHeaderItemList[index]
//                             //     ? columnHeaderItemList[index]?.columnIndex
//                             //     : index + 2,
//                             //   left: columnHeaderLeft(index + 1),
//                             // }}
//                             onClick={handleClickGridCell}
//                             onDoubleClick={(e) => handleDoubleClick(e, index, columnHeaderItemList[index].columnName)}
//                             // onClick={handleSingleOrDoubleClick}
//                           >
//                             {value}
//                           </div>
//                         ))
//                       )
//                     ) : (
//                       <div
//                         key={virtualRow.index.toString() + "Loading..."}
//                         role="row"
//                         tabIndex={-1}
//                         // aria-rowindex={virtualRow.index + 1} // ヘッダーの次からなのでindex0+2
//                         aria-selected={false}
//                         className={`${styles.grid_row} z-index absolute w-full bg-slate-300 text-center font-bold text-[red]`}
//                         style={{
//                           // gridTemplateColumns: colsWidth.join(" "),
//                           // top: gridRowTrackTopPosition(index),
//                           // top: (virtualRow.index * 35).toString() + "px",
//                           bottom: "2.5rem",
//                         }}
//                       >
//                         Loading...
//                       </div>
//                     )}

//                     {/* {rowData &&
//                       Object.values(rowData).map((value, index) => (
//                         <div
//                           key={"row" + virtualRow.index.toString() + index.toString()}
//                           role="gridcell"
//                           // aria-colindex={index + 2}
//                           aria-colindex={
//                             columnHeaderItemList[index] ? columnHeaderItemList[index]?.columnIndex : index + 2
//                           } // カラムヘッダーの列StateのcolumnIndexと一致させる
//                           aria-selected={false}
//                           tabIndex={-1}
//                           className={`${styles.grid_cell} ${index === 0 ? styles.grid_column_frozen : ""} ${
//                             index === 0 ? styles.grid_cell_frozen_last : ""
//                           } ${styles.grid_cell_resizable}`}
//                           // style={{ gridColumnStart: index + 2, left: columnHeaderLeft(index + 1) }}
//                           style={{
//                             gridColumnStart: columnHeaderItemList[index]
//                               ? columnHeaderItemList[index]?.columnIndex
//                               : index + 2,
//                             left: columnHeaderLeft(index + 1),
//                           }}
//                           onClick={(e) => handleClickGridCell(e)}
//                           onDoubleClick={(e) => handleDoubleClick(e, index)}
//                         >
//                           {value}
//                         </div>
//                       ))} */}
//                     {/* ======== ヘッダーセル idを除く全てのプロパティ(フィールド)Column  ======== */}
//                   </div>
//                 );
//               })}
//             </div>
//             {/* ======================== Grid列トラック Row ======================== */}
//           </div>
//           {/* ================== Gridスクロールコンテナ ここまで ================== */}
//           {/* =============== Gridフッター ここから スクロールコンテナと同列で配置 =============== */}
//           <GridTableFooter getItemCount={getItemCount} />
//           {/* ================== Gridフッター ここまで ================== */}
//         </div>
//         {/* ================== Gridメインコンテナ ここまで ================== */}
//       </div>
//       {/* ================== 🌟カラム編集モーダル🌟 ================== */}
//       {/* カラム入れ替え編集モーダルボタン */}
//       <div className="flex-center fixed bottom-[2%] right-[13%] z-[1000] h-[50px] w-[50px] cursor-pointer">
//         <div
//           className="h-[50px] w-[50px] rounded-full bg-[var(--color-bg-brand)]"
//           onClick={() => {
//             const newResetColumnHeaderItemList = JSON.parse(JSON.stringify(columnHeaderItemList));
//             console.log(
//               "🔥🔥🔥モーダル開いた ZustandのリセットStateにパースして格納newResetColumnHeaderItemList",
//               newResetColumnHeaderItemList
//             );
//             setResetColumnHeaderItemList(newResetColumnHeaderItemList);
//             setIsOpenEditColumns(true);
//           }}
//         ></div>
//       </div>
//       {/* カラム編集モーダル */}
//       {isOpenEditColumns && <EditColumnsModal columnHeaderItemList={columnHeaderItemList} />}
//       {/* ================== 🌟カラム編集モーダル🌟 ここまで ================== */}
//       {/* ================== メインコンテナ ここまで ================== */}
//     </>
//   );
// };

// export const GridTableHome = memo(GridTableHomeMemo);
