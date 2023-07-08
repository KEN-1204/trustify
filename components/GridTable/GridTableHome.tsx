import React, { FC, memo, useCallback, useEffect, useRef, useState } from "react";
import styles from "./GridTableHome.module.css";
import { RippleButton } from "../Parts/RippleButton/RippleButton";
import { summary, tableBodyDataArray } from "./data";
import useStore from "@/store";
import { GridTableFooter } from "./GridTableFooter/GridTableFooter";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import useDashboardStore from "@/store/useDashboardStore";

type TableDataType = {
  id: number;
  // id: string;
  rowIndex: string;
  name: string;
  gender: string;
  dob: string;
  country: string;
  summary: string;
};

type ColumnHeaderItemList = {
  columnId: number;
  columnName: string;
  columnIndex: number;
  columnWidth: string;
};

type Props = {
  title: string;
};

const GridTableHomeMemo: FC<Props> = ({ title }) => {
  const theme = useStore((state) => state.theme);
  // const [colsWidth, setColsWidth] = useState(
  //   new Array(Object.keys(tableBodyDataArray[0]).length + 1).fill("minmax(50px, 1fr)")
  // );
  // 初回マウント時にdataがフェッチできたらtrueにしてuseEffectでカラム生成を実行するstate
  const [gotData, setGotData] = useState(false);
  // 総アイテムのチェック有り無しを保持するstate
  const [checkedRows, setCheckedRows] = useState<Record<string, boolean>>({});
  // =================== 列入れ替え ===================
  // 列入れ替え用インデックス
  const [dragColumnIndex, setDragColumnIndex] = useState<number | null>(null);
  // 列アイテムリスト カラムidとカラム名、カラムインデックス、カラム横幅を格納する
  const [columnHeaderItemList, setColumnHeaderItemList] = useState<ColumnHeaderItemList[]>([]);
  // 各カラムの横幅を管理
  const [colsWidth, setColsWidth] = useState<string[] | null>(null);
  // 現在のカラムの横幅をrefで管理
  const currentColsWidths = useRef<string[]>([]);

  // カラム列全てにindex付きのrefを渡す
  const colsRef = useRef<(HTMLDivElement | null)[]>([]);

  const draggableOverlaysRef = useRef<(HTMLDivElement | null)[]>([]);
  // スクロールコンテナ
  const parentGridScrollContainer = useRef<HTMLDivElement | null>(null);
  // Rowヘッダー
  const rowHeaderRef = useRef<HTMLDivElement | null>(null);
  // Rowグループコンテナ(Virtualize収納用インナー)
  const gridRowGroupContainerRef = useRef<HTMLDivElement | null>(null);
  const gridRowTracksRefs = useRef<(HTMLDivElement | null)[]>([]);
  // フォーカス中、選択中のセルを保持
  const selectedGridCellRef = useRef<HTMLDivElement | null>(null);
  const prevSelectedGridCellRef = useRef<HTMLDivElement | null>(null);
  // ONとなったチェックボックスを保持する配列のstate
  const [selectedCheckBox, setSelectedCheckBox] = useState<number[]>([]);

  // ================== 🌟疑似的なサーバーデータフェッチ用の関数🌟 ==================
  const fetchServerPage = async (
    limit: number,
    offset: number = 0
  ): Promise<{ rows: TableDataType[]; nextOffset: number }> => {
    // useInfiniteQueryのクエリ関数で渡すlimitの個数分でIndex番号を付けたRowの配列を生成
    const rows = new Array(limit).fill(0).map((e, index) => {
      const newData: TableDataType = {
        // id: uuidv4(), // indexが0から始めるので+1でidを1から始める
        id: index + offset * limit, // indexが0から始めるので+1でidを1から始める
        rowIndex: `${index + 2 + offset * limit}st Line`,
        name: "John",
        gender: "Male",
        dob: "15-Aug-1990",
        country: "India",
        summary: summary,
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
    queryKey: ["projects"],
    queryFn: async (ctx) => {
      console.log("useInfiniteQuery queryFn関数内 引数ctx", ctx);

      return fetchServerPage(35, ctx.pageParam); // 35個ずつ取得
    },
    getNextPageParam: (_lastGroup, groups) => groups.length,
    staleTime: Infinity,
  });

  // 現在取得している全ての行 data.pagesのネストした配列を一つの配列にフラット化
  const allRows = data ? data.pages.flatMap((d) => d?.rows) : [];

  // ============================= 🌟バーチャライザーのインスタンスを生成🌟 =============================
  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? allRows.length + 1 : allRows.length, // 次のページ有り lengthを１増やす
    getScrollElement: () => parentGridScrollContainer.current, // スクロール用コンテナ
    // estimateSize: () => 35, // 要素のサイズ
    estimateSize: () => 30, // 要素のサイズ
    // overscan: 20, // ビューポート外にレンダリングさせる個数
    overscan: 10, // ビューポート外にレンダリングさせる個数
  });
  // =====================================================================================

  console.log(
    `allRows.length: ${allRows.length} !!allRows.length: ${!!allRows.length} virtualItems:${
      rowVirtualizer.getVirtualItems().length
    } colsWidth: ${colsWidth}`
  );
  // ============================= 🌟無限スクロールの処理 =============================
  useEffect(() => {
    if (!rowVirtualizer) return console.log("無限スクロール関数 rowVirtualizerインスタンス無し");
    // 現在保持している配列内の最後のアイテムをreverseで先頭にしてから分割代入で取得
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();
    console.log("lastItem", lastItem);
    if (!lastItem) {
      return;
    }

    // ================= lastItem.indexに到達 追加フェッチ =================
    console.log(`lastItem.index:${lastItem.index} allRows.length:${allRows.length}`);
    // 最後のアイテムindexが総数-1を超え、まだフェッチできるページがあり、フェッチ中でないなら
    if (lastItem.index >= allRows.length - 1 && hasNextPage && !isFetchingNextPage) {
      // queryFnで設定した関数 limitは10で10個ずつフェッチで設定
      console.log(`🔥追加フェッチ 現在の状態 lastItem.index:${lastItem.index} allRows.length:${allRows.length}`);
      fetchNextPage(); // 追加でフェッチ
    }
    // ================= lastItem.indexに到達 追加フェッチ ここまで =================
  }, [hasNextPage, fetchNextPage, allRows.length, isFetchingNextPage, rowVirtualizer.getVirtualItems()]);

  // =====================================================================================
  // ========== 🌟useEffect 取得データ総数が変わったタイミングで発火 チェック有無のStateの数を合わせる ==========

  // =====================================================================================

  // ============================= 🌟useEffect 初回DBからフェッチ完了を通知する =============================
  useEffect(() => {
    if (gotData) return;
    // 初回マウント データ取得完了後Stateをtrueに変更通知して、カラム生成useEffectを実行
    if (data) {
      setGotData(true);
      // 取得したアイテムの総数分idとbooleanでチェック有り無しをStateで管理 最初はチェック無しなので、全てfalse
      let idObject = allRows.reduce((obj: { [key: string]: boolean } | undefined, item) => {
        if (typeof item === "undefined" || typeof obj === "undefined") return;
        obj[item.id.toString()] = false;
        return obj;
      }, {});
      if (typeof idObject === "undefined") return;
      setCheckedRows(idObject);
      return;
    }
  }, [data]);
  // =====================================================================================

  // ================== 🌟useEffect ヘッダーカラム生成🌟 ===================
  // 取得したデータが変更された場合、プロパティ(フィールド)の数が変わる場合があるので、
  // 変更があった場合には再度カラム列の数とサイズを現在取得しているデータでリセット
  useEffect(() => {
    console.log("🔥ここ");
    if (!data?.pages[0]) return console.log("useEffect実行もまだdata無し リターン");
    console.log("🌟ヘッダーカラム生成 gotData", gotData);

    // マウント時に各フィールド分のカラムを生成 サイズはデフォルト値を65px, 100px, 3列目以降は250pxに設定
    console.log(
      "🌟useEffect Object.keys(data?.pages[0].rows[0] as object",
      Object.keys(data?.pages[0].rows[0] as object)
    );
    const newColsWidths = new Array(Object.keys(data?.pages[0].rows[0] as object).length + 1).fill("250px");
    newColsWidths.fill("65px", 0, 1); // 1列目を65pxに変更
    newColsWidths.fill("100px", 1, 2); // 2列目を100pxに変更
    console.log("Stateにカラムwidthを保存", newColsWidths);
    // stateに現在の全てのカラムのwidthを保存
    setColsWidth(newColsWidths);
    // refオブジェクトに保存
    currentColsWidths.current = newColsWidths;
    console.log("currentColsWidths.current", currentColsWidths.current);

    if (parentGridScrollContainer.current === null) return;

    // ===========　CSSカスタムプロパティに反映
    // newColsWidthの各値のpxの文字を削除
    // ['65px', '100px', '250px', '250px', '250px', '250px']から
    // ['65', '100', '250', '250', '250', '250']へ置換
    const newColsWidthNum = newColsWidths.map((col) => {
      return col.replace("px", "");
    });

    console.log("🔥ヘッダーカラム生成🌟 newColsWidthNum", newColsWidthNum);

    // それぞれのカラムの合計値を取得 +aで文字列から数値型に変換して合計値を取得
    let sumRowWidth = newColsWidthNum.reduce((a, b) => {
      return +a + +b;
    });
    console.log("🔥ヘッダーカラム生成🌟 sumRowWidth", sumRowWidth);

    // それぞれのCSSカスタムプロパティをセット
    // grid-template-columnsの値となるCSSカスタムプロパティをセット
    parentGridScrollContainer.current.style.setProperty("--template-columns", `${newColsWidths.join(" ")}`);
    parentGridScrollContainer.current.style.setProperty("--header-row-height", "30px");
    // parentGridScrollContainer.current.style.setProperty("--header-row-height", "35px");
    parentGridScrollContainer.current.style.setProperty("--row-width", `${sumRowWidth}px`);
    parentGridScrollContainer.current.style.setProperty("--summary-row-height", "30px");
    // parentGridScrollContainer.current.style.setProperty("--summary-row-height", "35px");

    console.log(
      "更新後--template-columns",
      parentGridScrollContainer.current.style.getPropertyValue("--template-columns")
    );
    console.log("更新後--row-width", parentGridScrollContainer.current.style.getPropertyValue("--row-width"));

    // =========== カラム順番入れ替え用の列アイテムリストに格納
    // colsWidthsの最初2つはcheckboxとidの列なので、最初から3つ目で入れ替え
    const tempFirstColumnItemListArray = Object.keys(data?.pages[0].rows[0] as object);
    const firstColumnItemListArray = tempFirstColumnItemListArray.map((item, index) => ({
      columnId: index,
      columnName: item,
      columnIndex: index + 2,
      columnWidth: newColsWidths[index + 1],
    }));
    console.log(`初期カラム配列`, tempFirstColumnItemListArray);
    console.log(`整形後カラム配列`, firstColumnItemListArray);
    setColumnHeaderItemList(firstColumnItemListArray);
  }, [gotData]); // gotDataのstateがtrueになったら再度実行
  // ================================================================

  // =================== 🌟マウスイベント 列サイズ変更 ===================
  const handleMouseDown = (e: React.MouseEvent, index: number) => {
    e.preventDefault();

    // ドラッグ中の列と同じ列全てのborder-right-colorをハイライトする
    const colsLine = document.querySelectorAll(`[role=row] [aria-colindex="${index + 2}"]`);
    colsLine.forEach((col) => {
      if (col instanceof HTMLDivElement) {
        // col.style.borderRightColor = `#24b47e`;
        col.classList.add(`${styles.is_dragging}`);
      }
    });

    const startX = e.pageX;
    const startWidth = colsRef.current[index + 1]?.getBoundingClientRect().width || 0;

    console.log("handleMouseDown", startX, startWidth);

    const handleMouseUp = () => {
      // ドラッグ中の列と同じ列全てのborder-right-colorをハイライトを元のボーダーカラーに戻す
      const colsLine = document.querySelectorAll(`[role=row] [aria-colindex="${index + 2}"]`);
      colsLine.forEach((col) => {
        if (col instanceof HTMLDivElement) {
          // col.style.borderRightColor = `#444`;
          col.classList.remove(`${styles.is_dragging}`);
        }
      });

      console.log("マウスアップ✅", currentColsWidths.current);
      setColsWidth(currentColsWidths.current);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
    };

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const newWidth = e.pageX - colsRef.current[index]!.getBoundingClientRect().left;
      console.log("newWidth", newWidth);
      console.log("currentColsWidths.current", currentColsWidths.current);
      if (colsWidth === null) return;
      const newColsWidths = [...colsWidth];
      // const newColsWidths = [...currentColsWidths.current];
      newColsWidths[index + 1] = Math.max(newWidth, 50) + "px";
      // gridコンテナのCSSカスタムプロパティに新たなwidthを設定したwidthsをセット
      parentGridScrollContainer.current!.style.setProperty("--template-columns", `${newColsWidths.join(" ")}`);
      // setColsWidth(newColsWidths);
      currentColsWidths.current = newColsWidths;

      console.log("newColsWidths", newColsWidths);
      console.log(
        "更新後--template-columns",
        parentGridScrollContainer.current!.style.getPropertyValue("--template-columns")
      );

      // 列の合計値をセット
      // newColsWidthの各値のpxの文字を削除
      // ['65px', '100px', '250px', '250px', '250px', '250px']から
      // ['65', '100', '250', '250', '250', '250']へ置換
      const newColsWidthNum = newColsWidths.map((col) => {
        return col.replace("px", "");
      });

      // それぞれのカラムの合計値を取得 +aで文字列から数値型に変換して合計値を取得
      let sumRowWidth = newColsWidthNum.reduce((a, b) => {
        return +a + +b;
      }, 0);
      parentGridScrollContainer.current!.style.setProperty("--row-width", `${sumRowWidth}px`);
      console.log("更新後--row-width", parentGridScrollContainer.current!.style.getPropertyValue("--row-width"));
    };

    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);
  };
  // ================================================================

  // ========= 🌟１行目と２行目のインラインスタイルのleftに渡す用の関数 =========
  const columnHeaderLeft = (index: number) => {
    switch (index) {
      case 0:
        return 0;
        break;
      case 1:
        return 65;
      default:
        null;
        break;
    }
  };
  // ================================================================

  // ========= 🌟各Grid行トラックのtopからの位置を返す関数 インラインスタイル内で実行
  const gridRowTrackTopPosition = (index: number) => {
    // const topPosition = ((index + 1) * 35).toString() + "px";
    const topPosition = ((index + 1) * 30).toString() + "px";
    console.log("topPosition", topPosition);
    return topPosition;
  };
  // ================================================================

  // ================== 🌟セル シングルクリック、ダブルクリックイベント ==================
  const setTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const setIsOpenEditModal = useDashboardStore((state) => state.setIsOpenEditModal);
  const setTextareaInput = useDashboardStore((state) => state.setTextareaInput);

  // ================== 🌟GridCellクリックでセルを選択中アクティブセルstateに更新🌟 ==================
  const handleClickGridCell = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (setTimeoutRef.current !== null) return;

    setTimeoutRef.current = setTimeout(() => {
      setTimeoutRef.current = null;
      // シングルクリック時に実行したい処理
      // 0.2秒後に実行されてしまうためここには書かない
    }, 200);

    console.log("シングルクリック");
    // すでにselectedセル(アクティブセル)のrefが存在するなら、一度aria-selectedをfalseに変更
    if (selectedGridCellRef.current?.getAttribute("aria-selected") === "true") {
      // 保持していたアクティブセルを前回のアクティブセルprevSelectedGridCellRefに格納
      prevSelectedGridCellRef.current = selectedGridCellRef.current;

      selectedGridCellRef.current.setAttribute("aria-selected", "false");
      selectedGridCellRef.current.setAttribute("tabindex", "-1");
    }
    // クリックしたセルの属性setAttributeでクリックしたセルのaria-selectedをtrueに変更
    e.currentTarget.setAttribute("aria-selected", "true");
    e.currentTarget.setAttribute("tabindex", "0");

    // クリックしたセルを新たなアクティブセルとしてrefに格納して更新
    selectedGridCellRef.current = e.currentTarget;

    console.log(
      `前回アクティブセルの行と列: ${prevSelectedGridCellRef.current?.ariaColIndex}, ${prevSelectedGridCellRef.current?.parentElement?.ariaRowIndex}, 今回アクティブの行と列: ${selectedGridCellRef.current?.ariaColIndex}, ${selectedGridCellRef.current?.parentElement?.ariaRowIndex}`
    );
  }, []);

  // セルダブルクリック
  const handleDoubleClick = useCallback((e: React.MouseEvent<HTMLDivElement>, index: number) => {
    console.log("index", index);
    if (index === 0) return console.log("リターン");
    if (setTimeoutRef.current) {
      clearTimeout(setTimeoutRef.current);

      // console.log(e.detail);
      setTimeoutRef.current = null;
      // ダブルクリック時に実行したい処理
      console.log("ダブルクリック", e.currentTarget);
      // クリックした要素のテキストを格納
      const text = e.currentTarget.innerText;
      setTextareaInput(text);
      setIsOpenEditModal(true);
    }
  }, []);
  // ================================================================

  // ========= 🌟チェックボックスクリックでstateに選択したアイテムのidを追加
  const handleSelectedCheckBox = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    console.log(
      "前回のアクティブセル親列RowトラックのRowIndex",
      prevSelectedGridCellRef.current?.parentElement?.ariaRowIndex
    );
    console.log("今回のアクティブセル親列トラックのRowIndex", selectedGridCellRef.current?.parentElement?.ariaRowIndex);
    const targetRowIndex = e.target.parentElement?.parentElement?.parentElement?.ariaRowIndex;
    console.log("handleSelectedCheckBox targetRowIndex", targetRowIndex);

    const gridScrollContainer = parentGridScrollContainer.current;
    if (!gridScrollContainer) return;

    // PointerEventsを明示することでtypescriptのエラー回避
    if (e.nativeEvent instanceof PointerEvent) {
      // ================ ルート１：そのままチェック (シフトキーがfalseの場合) ======================
      if (e.nativeEvent.shiftKey === false) {
        console.log("PointerEvent", e);
        console.log("🌟e.target.checked", e.target.checked);
        let newSelectedCheckBoxArray = [...selectedCheckBox];
        console.log("newSelectedCheckBoxArray 前", newSelectedCheckBoxArray);
        // チェックした時
        if (e.target.checked === true) {
          newSelectedCheckBoxArray.push(id);
          newSelectedCheckBoxArray.sort((a, b) => a - b);
          setSelectedCheckBox(newSelectedCheckBoxArray);
          console.log("newSelectedCheckBoxArray 後", newSelectedCheckBoxArray);
          // チェックされた行をハイライト
          // const selectedRow = document.querySelector(`[aria-rowindex="${id + 1}"]`);
          const selectedRow = gridScrollContainer.querySelector(`[role=row][aria-rowindex="${targetRowIndex}"]`);
          selectedRow?.setAttribute(`aria-selected`, "true");
          // チェックした行要素Rowのチェック有無をStateに更新
          setCheckedRows((prev) => ({
            ...prev,
            [id]: true, // プロパティ名に変数を指定するにはブラケット記法を使用する
          }));
        } else {
          // チェックが外れた時
          const filteredArray = newSelectedCheckBoxArray.filter((itemId) => itemId !== id);
          filteredArray.sort((a, b) => a - b);
          setSelectedCheckBox(filteredArray);
          // チェックでハイライトされた行を戻す
          // const selectedRow = document.querySelector(`[aria-rowindex="${id + 1}"]`);
          const selectedRow = gridScrollContainer.querySelector(`[role=row][aria-rowindex="${targetRowIndex}"]`);
          selectedRow?.setAttribute(`aria-selected`, "false");
          // チェックが外れた行要素Rowのチェック有無をStateに更新
          setCheckedRows((prev) => ({
            ...prev,
            [id]: false, // プロパティ名に変数を指定するにはブラケット記法を使用する
          }));
        }
      }

      // ====================== ルート２：シフトキーが押された状態でチェック ======================
      else {
        // シフトキーが押された状態で、かつチェックが入っておらず今回チェックを入れた場合のルート
        if (e.target.checked === true) {
          // もし他のチェックボックスのセルがaria-selected=trueで選択中となっているならば
          // クリックしたチェックボックスと前回アクティブだったチェックボックスのセルとの間のチェックボックスを全てtrueにかえる
          // まずはgridcellのcolindexが1のセルを全て取得
          const checkBoxCells = gridScrollContainer.querySelectorAll('[role=gridcell][aria-colindex="1"]');
          console.log("シフト有りクリック");
          // 前回のアクティブセルがcheckboxのセルで、シフトキーを押された状態でチェックされたら
          if (prevSelectedGridCellRef.current?.ariaColIndex === "1") {
            // 前回のアクティブセルの親のRowIndexと今回チェックしたセルの親のRowIndexまでを全てtrueに変更
            if (!prevSelectedGridCellRef.current?.parentElement?.ariaRowIndex)
              return console.log("prevアクティブセル無し リターン");
            if (!selectedGridCellRef.current?.parentElement?.ariaRowIndex)
              return console.log("アクティブセル無し リターン");
            // 前回と今回の行インデックスで小さい値を取得(セルの親要素をparentElementでアクセス)
            const minNum = Math.min(
              +prevSelectedGridCellRef.current?.parentElement?.ariaRowIndex,
              +selectedGridCellRef.current?.parentElement?.ariaRowIndex
            );
            // 前回と今回の行インデックスのを小さい値を取得(セルの親要素をparentElementでアクセス)
            const maxNum = Math.max(
              +prevSelectedGridCellRef.current?.parentElement?.ariaRowIndex,
              +selectedGridCellRef.current?.parentElement?.ariaRowIndex
            );
            console.log(`行インデックス最小値${minNum}, 最大値${maxNum}`);
            // １列目のセルの親の行RowIndexと前回と今回のアクティブセルのRowIndexの間の値を持つチェックボックスを全てチェックtrueにする
            let checkedCellArray: number[] = [];
            checkBoxCells.forEach((cell) => {
              if (!cell.parentElement?.ariaRowIndex) return console.log("セル無し リターン");
              // 前回と今回のRowIndexの間のセルなら、チェックを入れる
              if (minNum <= +cell.parentElement?.ariaRowIndex && +cell.parentElement?.ariaRowIndex <= maxNum) {
                const checkbox = cell.querySelector('[aria-label="Select"]');
                if (checkbox instanceof HTMLInputElement) {
                  checkbox.checked = true; // チェックボックスにチェックを入れる

                  // チェックされた行を全てハイライト
                  if (checkbox.checked) {
                    cell.parentElement.setAttribute(`aria-selected`, "true");
                  } else {
                    cell.parentElement.setAttribute(`aria-selected`, "false");
                  }

                  // １列目のセルの隣のidカラムのセル(兄弟要素)をnextSiblingで取得
                  if (cell.nextElementSibling instanceof HTMLDivElement) {
                    // ２列目のidフィールドの値となるidを取得
                    const idCell = cell.nextElementSibling.innerText;
                    // 数値型に変換してpush
                    checkedCellArray.push(+idCell);
                  }
                }
              }
            });
            // 選択中の行要素を保持するstateを更新
            const newSelectedCheckBox = [...selectedCheckBox];
            checkedCellArray.forEach((item) => {
              // すでに含まれているidは無視してリターン
              if (newSelectedCheckBox.includes(item)) return;
              newSelectedCheckBox.push(item);
            });
            // ソートしてから選択中のstateを更新
            newSelectedCheckBox.sort((a, b) => a - b);
            setSelectedCheckBox(newSelectedCheckBox);
            console.log("newSelectedCheckBoxArray 後", newSelectedCheckBox);

            // 全てのチェック有無を保持するStateも更新
            const newArray = newSelectedCheckBox.reduce((acc: { [key: number]: boolean }, cur) => {
              acc[cur] = true;
              return acc;
            }, {});
            setCheckedRows((prev) => ({
              ...prev,
              ...newArray,
            }));
          }
        }
        // シフトキーが押された状態で、かつチェックが既に入っていて今回チェックをfalseにして複数チェックを外すルート
        else {
          const checkBoxCells = gridScrollContainer.querySelectorAll('[role=gridcell][aria-colindex="1"]');
          console.log("シフト有りクリック");
          // 前回のアクティブセルがcheckboxのセルで、シフトキーを押された状態でチェックが外されたら
          if (prevSelectedGridCellRef.current?.ariaColIndex === "1") {
            // 前回のアクティブセルの親のRowIndexと今回チェックしたセルの親のRowIndexまでを全てfalseに変更
            if (!prevSelectedGridCellRef.current?.parentElement?.ariaRowIndex)
              return console.log("prevアクティブセル無し リターン");
            if (!selectedGridCellRef.current?.parentElement?.ariaRowIndex)
              return console.log("アクティブセル無し リターン");
            // 前回と今回の行インデックスで小さい値を取得(セルの親要素をparentElementでアクセス)
            const minNum = Math.min(
              +prevSelectedGridCellRef.current?.parentElement?.ariaRowIndex,
              +selectedGridCellRef.current?.parentElement?.ariaRowIndex
            );
            // 前回と今回の行インデックスのを小さい値を取得(セルの親要素をparentElementでアクセス)
            const maxNum = Math.max(
              +prevSelectedGridCellRef.current?.parentElement?.ariaRowIndex,
              +selectedGridCellRef.current?.parentElement?.ariaRowIndex
            );
            console.log(`行インデックス最小値${minNum}, 最大値${maxNum}`);
            // １列目のセルの親の行RowIndexと前回と今回のアクティブセルのRowIndexの間の値を持つチェックボックスを全てチェックfalseにする
            let uncheckedCellArray: number[] = [];
            checkBoxCells.forEach((cell) => {
              if (!cell.parentElement?.ariaRowIndex) return console.log("セル無し リターン");
              // 前回と今回のRowIndexの間のセルなら、チェックを外す
              if (minNum <= +cell.parentElement?.ariaRowIndex && +cell.parentElement?.ariaRowIndex <= maxNum) {
                const checkbox = cell.querySelector('[aria-label="Select"]');
                if (checkbox instanceof HTMLInputElement) {
                  checkbox.checked = false; // チェックボックスにチェックを入れる

                  // チェックが外れた行を全てハイライトは取り消す
                  cell.parentElement.setAttribute(`aria-selected`, "false");

                  // １列目のセルの隣のidカラムのセル(兄弟要素)をnextSiblingで取得
                  if (cell.nextElementSibling instanceof HTMLDivElement) {
                    // ２列目のidフィールドの値となるidを取得
                    const idCell = cell.nextElementSibling.innerText;
                    // 数値型に変換してpush
                    uncheckedCellArray.push(+idCell);
                  }
                }
              }
            });
            // 選択中の行要素を保持するstateを更新 selectedCheckBox: number[]
            const newSelectedCheckBox = [...selectedCheckBox];
            // チェックを外したセルのindexがプロパティで値がfalseのオブジェクトを持つ配列を生成
            const newUncheckedArray = uncheckedCellArray.reduce((acc: { [key: number]: boolean }, cur) => {
              acc[cur] = false;
              return acc;
            }, {});
            console.log("newUncheckedArray", newUncheckedArray);

            // チェックでハイライトされた行を戻す
            // const selectedRow = document.querySelector(`[aria-rowindex="${id + 1}"]`);
            const selectedRow = gridScrollContainer.querySelector(`[role=row][aria-rowindex="${targetRowIndex}"]`);
            selectedRow?.setAttribute(`aria-selected`, "false");
            // チェックが外れた行要素Rowのチェック有無をStateに更新
            setCheckedRows((prev) => ({
              ...prev,
              ...newUncheckedArray, // falseに更新した値で上書き
            }));

            // 範囲選択でチェックが外れたセルを全てフィルターで除外して新たな配列を生成してセレクトStateに格納
            const filteredNewArray = uncheckedCellArray.filter((item) => {
              !newSelectedCheckBox.includes(item);
            });
            console.log("filteredNewArray 更新後", filteredNewArray);
            setSelectedCheckBox(filteredNewArray);
          }
        }
      }
    }
  };
  console.log("✅checkedRows", checkedRows);
  console.log("✅selectedCheckBox", selectedCheckBox);

  // ================================================================
  // ======== 🌟チェックボックスヘッダーのON/OFFで全てのチェックボックスをtrue/false切り替え後、全てのidを選択中stateに反映
  const handleAllSelectCheckBox = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 全てのgridセルのinputタグを取得
    const allCheckBox = document.querySelectorAll('[role=row] input[aria-label="Select"]');

    // 全てのgrid_rowクラスの行トラックの中の全てのidセルをquerySelector()で取得
    const allGridIdCells = document.querySelectorAll(`[role=grid] .${styles.grid_row} [aria-colindex="2"]`);

    let newSelectedCheckBoxArray = [...selectedCheckBox];
    // チェックした時
    if (e.target.checked === true) {
      // 全てのGridセルのチェックボックスのcheckedの値をtrueに変更
      allCheckBox.forEach((item: Element) => {
        // querySelectorAllメソッドが返すNodeList内の要素が基本的にはElement型であるため
        // 対象の要素が本当にHTMLInputElement型であることを保証することでitem.checkedのエラーを回避
        if (item instanceof HTMLInputElement) {
          item.checked = true;
        }
      });
      // 全てのチェックボックスの値をtrueに変更後、全てのアイテムのidをstateに格納
      let idCellsArray: number[] = [];
      allGridIdCells.forEach((div: Element) => {
        if (div instanceof HTMLDivElement) {
          // innerTextで取得したstring型の+でidを数値型にしてからpush
          idCellsArray.push(+div.innerText);
        }
      });

      setSelectedCheckBox(idCellsArray);
    } else {
      // チェックが外れた時
      allCheckBox.forEach((item: Element) => {
        if (item instanceof HTMLInputElement) {
          item.checked = false;
        }
      });
      // 全てのチェックボックスの値をfalseに変更後、stateの中身を空の配列に更新
      setSelectedCheckBox([]);
    }
  };

  return (
    <>
      {/* ================== メインコンテナ ================== */}
      <div
        className={`${styles.main_container} ${
          theme === "light" ? `${styles.theme_f_light}` : `${styles.theme_f_dark}`
        }`}
      >
        {/* ================== Gridテーブルヘッダー ================== */}
        {/* <GridTableHeader /> */}
        <div className={`${styles.grid_header}`}>
          <div className={`${styles.table_tab}`}>{title}</div>
        </div>
        {/* ================== Gridメインコンテナ ================== */}
        <div className={`${styles.grid_main_container}`}>
          {/* ================== Gridファンクションヘッダー ボタンでページ遷移 ================== */}
          {/* <div className={`${styles.grid_function_header}`}>
            <RippleButton title={`${title}へ`} fontSize="12px" padding="5px 15px" borderRadius="4px" />
          </div> */}
          {/* ================== Gridスクロールコンテナ ================== */}
          <div
            ref={parentGridScrollContainer}
            role="grid"
            aria-multiselectable="true"
            style={{ width: "100%" }}
            // style={{ height: "100%", "--header-row-height": "35px" } as any}
            className={`${styles.grid_scroll_container}`}
          >
            {/* ======================== Grid列トラック Rowヘッダー ======================== */}
            <div
              role="row"
              tabIndex={-1}
              aria-rowindex={1}
              aria-selected={false}
              className={`${styles.grid_header_row}`}
            >
              {/* ======== ヘッダーセル チェックボックスColumn ======== */}
              <div
                ref={rowHeaderRef}
                role="columnheader"
                aria-colindex={1}
                aria-selected={false}
                tabIndex={-1}
                className={`${styles.grid_column_header_all} ${styles.grid_column_frozen}`}
                style={{ gridColumnStart: 1, left: columnHeaderLeft(0) }}
                onClick={(e) => handleClickGridCell(e)}
              >
                <div className={styles.grid_select_cell_header}>
                  <input
                    type="checkbox"
                    aria-label="Select All"
                    onChange={(e) => handleAllSelectCheckBox(e)}
                    className={`${styles.grid_select_cell_header_input}`}
                  />
                  <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                  </svg>
                </div>
              </div>
              {/* ======== ヘッダーセル 全てのプロパティ(フィールド)Column ここから  ======== */}

              {allRows[0] &&
                Object.keys(allRows[0]).map((key, index) => (
                  <div
                    key={index}
                    ref={(ref) => (colsRef.current[index] = ref)}
                    role="columnheader"
                    aria-colindex={index + 2}
                    aria-selected={false}
                    tabIndex={-1}
                    className={`${styles.grid_column_header_all} ${index === 0 && styles.grid_column_frozen} ${
                      index === 0 && styles.grid_cell_frozen_last
                    } ${styles.grid_cell_resizable}`}
                    style={{ gridColumnStart: index + 2, left: columnHeaderLeft(index + 1) }}
                    onClick={(e) => handleClickGridCell(e)}
                    onDoubleClick={(e) => handleDoubleClick(e, index)}
                    // onMouseDown={
                    //   index !== Object.keys(tableBodyDataArray[0]).length - 1
                    //     ? (e) => handleMouseDown(e, index)
                    //     : undefined
                    // }
                  >
                    {/* カラム順番入れ替えdraggable用ラッパー(padding 8px除く全体) */}
                    <div
                      className="w-full"
                      draggable={true}
                      data-handler-id="T1127"
                      style={{ opacity: 1, cursor: "grab" }}
                    >
                      <div
                        className={`${styles.grid_column_header} ${index === 0 && styles.grid_column_header_cursor}`}
                      >
                        <div className={`${styles.grid_column_header_inner}`}>
                          <span className={`${styles.grid_column_header_inner_name}`}>{key}</span>
                        </div>
                      </div>
                    </div>
                    {/* ドラッグ用overlay */}
                    <div
                      ref={(ref) => (draggableOverlaysRef.current[index] = ref)}
                      role="draggable_overlay"
                      className={styles.draggable_overlay}
                      onMouseDown={(e) => handleMouseDown(e, index)}
                      onMouseEnter={() => {
                        const colsLines = document.querySelectorAll(`[aria-colindex="${index + 2}"]`);
                        colsLines.forEach((col) => {
                          if (col instanceof HTMLDivElement) {
                            // col.style.borderRightColor = `#24b47e`;
                            col.classList.add(`${styles.is_dragging_hover}`);
                          }
                        });
                      }}
                      onMouseLeave={() => {
                        const colsLines = document.querySelectorAll(`[aria-colindex="${index + 2}"]`);
                        colsLines.forEach((col) => {
                          if (col instanceof HTMLDivElement) {
                            // col.style.borderRightColor = `#444`;
                            col.classList.remove(`${styles.is_dragging_hover}`);
                          }
                        });
                      }}
                    ></div>
                  </div>
                ))}
              {/* ======== ヘッダーセル idを除く全てのプロパティ(フィールド)Column ここまで  ======== */}
            </div>
            {/* ======================== Grid列トラック Rowヘッダー ======================== */}

            {/* ======================== Grid列トラック Rowグループコンテナ ======================== */}
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
                  "--header-row-height": "30px",
                  "--row-width": "",
                } as any
              }
              className={`${styles.grid_rowgroup_virtualized_container}`}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const isLoaderRow = virtualRow.index > allRows.length - 1;
                const rowData = allRows[virtualRow.index];

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
                      className={`${styles.loading_reflection} flex-center mx-auto h-[30px] w-full text-center font-bold`}
                      // className={`${styles.loading_reflection} flex-center mx-auto h-[35px] w-full text-center font-bold`}
                    >
                      <span className={`${styles.reflection}`}></span>
                      <div className={styles.spinner78}></div>
                    </div>
                  );
                }
                // ========= 🌟ローディング中の行トラック ここまで =========

                return (
                  <div
                    key={"row" + virtualRow.index.toString()}
                    role="row"
                    tabIndex={-1}
                    aria-rowindex={virtualRow.index + 2} // ヘッダーの次からなのでindex0+2
                    aria-selected={false}
                    className={`${styles.grid_row}`}
                    style={{
                      // gridTemplateColumns: colsWidth.join(" "),
                      // top: gridRowTrackTopPosition(index),
                      // top: ((virtualRow.index + 0) * 35).toString() + "px", // +1か0か
                      top: ((virtualRow.index + 0) * 30).toString() + "px", // +1か0か
                    }}
                  >
                    {/* ======== gridセル チェックボックスセル ======== */}
                    <div
                      ref={(ref) => (gridRowTracksRefs.current[virtualRow.index] = ref)}
                      role="gridcell"
                      aria-colindex={1}
                      aria-selected={false}
                      aria-readonly={true}
                      tabIndex={-1}
                      className={`${styles.grid_cell} ${styles.grid_column_frozen}`}
                      style={{ gridColumnStart: 1, left: columnHeaderLeft(0) }}
                      onClick={(e) => handleClickGridCell(e)}
                    >
                      <div className={styles.grid_select_cell_header}>
                        <input
                          id="checkbox"
                          type="checkbox"
                          aria-label="Select"
                          value={rowData?.id}
                          onChange={(e) => {
                            if (typeof rowData?.id === "undefined") return;
                            handleSelectedCheckBox(e, rowData?.id);
                          }}
                          // className={`${styles.grid_select_cell_header_input}`}
                        />
                        <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                        </svg>
                      </div>
                    </div>
                    {/* ======== gridセル 全てのプロパティ(フィールド)セル  ======== */}

                    {rowData &&
                      Object.values(rowData).map((value, index) => (
                        <div
                          key={"row" + virtualRow.index.toString() + index.toString()}
                          ref={(ref) => (colsRef.current[index] = ref)}
                          role="gridcell"
                          aria-colindex={index + 2}
                          aria-selected={false}
                          tabIndex={-1}
                          className={`${styles.grid_cell} ${index === 0 ? styles.grid_column_frozen : ""} ${
                            index === 0 ? styles.grid_cell_frozen_last : ""
                          } ${styles.grid_cell_resizable}`}
                          style={{ gridColumnStart: index + 2, left: columnHeaderLeft(index + 1) }}
                          onClick={(e) => handleClickGridCell(e)}
                          onDoubleClick={(e) => handleDoubleClick(e, index)}
                        >
                          {value}
                        </div>
                      ))}
                    {/* ======== ヘッダーセル idを除く全てのプロパティ(フィールド)Column  ======== */}
                  </div>
                );
              })}
            </div>
            {/* ======================== Grid列トラック Row ======================== */}
          </div>
          {/* ================== Gridスクロールコンテナ ここまで ================== */}
          {/* =============== Gridフッター ここから スクロールコンテナと同列で配置 =============== */}
          <GridTableFooter />
          {/* ================== Gridフッター ここまで ================== */}
        </div>
        {/* ================== Gridメインコンテナ ここまで ================== */}
      </div>
      {/* ================== メインコンテナ ここまで ================== */}
    </>
  );
};

export const GridTableHome = memo(GridTableHomeMemo);
