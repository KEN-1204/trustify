import React, { FC, memo, useCallback, useEffect, useRef, useState } from "react";
import styles from "./GridTableTest.module.css";
import { tableBodyDataArray } from "./data";
import { AiOutlineArrowLeft } from "react-icons/ai";

const GridTableTest: FC = () => {
  // ■まずいくつカラム列を作成する必要があるかフィールドの数を特定
  // テーブルデータを取得した後、配列から一つだけオブジェクトを取り出して、
  // Object.key()メソッドでプロパティ名(テーブルのフィールド名)の一覧を配列で取得してから
  // フィールドの数をArray.lengthで取得して、その数分のスロットを持つ新たな配列をnew Array()で生成して
  // Array.fill()メソッドで第一引数のvalueに渡した値で第二引数のstartの値と第三引数のendの値が
  // 省略されていれば、元の配列のスロット分全てをvalueの値で書き換える
  // これで、Gridテーブルの全てのカラム列の個数とサイズの初期値が決定する
  const [colsWidth, setColsWidth] = useState(
    new Array(Object.keys(tableBodyDataArray[0]).length + 1).fill("minmax(50px, 1fr)")
  );
  // カラム列全てにindex付きのrefを渡す
  const colsRef = useRef<(HTMLDivElement | null)[]>([]);
  const currentColsWidths = useRef<string[]>([]);
  const draggableOverlaysRef = useRef<(HTMLDivElement | null)[]>([]);
  const gridContainerRef = useRef<HTMLDivElement | null>(null);
  const rowHeaderRef = useRef<HTMLDivElement | null>(null);
  const gridRowTracksRefs = useRef<(HTMLDivElement | null)[]>([]);
  // フォーカス中、選択中のセルを保持
  const selectedGridCellRef = useRef<HTMLDivElement | null>(null);
  const prevSelectedGridCellRef = useRef<HTMLDivElement | null>(null);
  // ONとなったチェックボックスを保持する配列のstate
  const [selectedCheckBox, setSelectedCheckBox] = useState<number[]>([]);

  // ============================= useEffect ヘッダーカラム生成 ==================================
  // 取得したデータが変更された場合、プロパティ(フィールド)の数が変わる場合があるので、
  // 変更があった場合には再度カラム列の数とサイズを現在取得しているデータでリセット
  useEffect(() => {
    // setColsWidth(new Array(Object.keys(tableBodyDataArray[0]).length).fill("minmax(50px, 1fr)"));
    // const newColsWidths = new Array(Object.keys(tableBodyDataArray[0]).length + 1).fill("minmax(50px, 1fr)");
    const newColsWidths = new Array(Object.keys(tableBodyDataArray[0]).length + 1).fill("250px");
    newColsWidths.fill("65px", 0, 1);
    newColsWidths.fill("100px", 1, 2);
    console.log(newColsWidths);
    // stateに現在の
    setColsWidth(newColsWidths);
    // refオブジェクトに保存
    currentColsWidths.current = newColsWidths;
    console.log("currentColsWidths.current", currentColsWidths.current);

    if (gridContainerRef.current === null) return;

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
    gridContainerRef.current.style.setProperty("--template-columns", `${newColsWidths.join(" ")}`);
    gridContainerRef.current.style.setProperty("--header-row-height", "35px");
    gridContainerRef.current.style.setProperty("--row-width", `${sumRowWidth}px`);
    gridContainerRef.current.style.setProperty("--summary-row-height", "35px");

    console.log("更新後--template-columns", gridContainerRef.current.style.getPropertyValue("--template-columns"));
    console.log("更新後--row-width", gridContainerRef.current.style.getPropertyValue("--row-width"));
  }, [tableBodyDataArray]);
  // =====================================================================================

  // ============================= マウスイベント 列サイズ変更 ==================================
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
      // draggableOverlaysRef.current[index]!.addEventListener("mousemove", handleMouseMove);
    };
    // useStateバージョン
    // const handleMouseMove = (e: MouseEvent) => {
    //   e.preventDefault();
    //   const newWidths = [...colsWidth];
    //   newWidths[index] = Math.max(startWidth + e.pageX - startX, 50) + "px";
    //   setColsWidth(newWidths);
    // };

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      // const newWidths = [...colsWidth];
      // newWidths[index] = Math.max(startWidth + e.pageX - startX, 50) + "px";
      // setColsWidth(newWidths);

      // const newWidth = event.pageX - th.getBoundingClientRect().left;
      const newWidth = e.pageX - colsRef.current[index]!.getBoundingClientRect().left;
      console.log("newWidth", newWidth);
      console.log("currentColsWidths.current", currentColsWidths.current);
      const newColsWidths = [...colsWidth];
      // const newColsWidths = [...currentColsWidths.current];
      newColsWidths[index + 1] = Math.max(newWidth, 50) + "px";
      // gridコンテナのCSSカスタムプロパティに新たなwidthを設定したwidthsをセット
      gridContainerRef.current!.style.setProperty("--template-columns", `${newColsWidths.join(" ")}`);
      // setColsWidth(newColsWidths);
      currentColsWidths.current = newColsWidths;

      console.log("newColsWidths", newColsWidths);
      console.log("更新後--template-columns", gridContainerRef.current!.style.getPropertyValue("--template-columns"));

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
      });
      gridContainerRef.current!.style.setProperty("--row-width", `${sumRowWidth}px`);
      console.log("更新後--row-width", gridContainerRef.current!.style.getPropertyValue("--row-width"));
    };

    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);
    // draggableOverlaysRef.current[index]!.addEventListener("mousemove", handleMouseMove);
  };
  // =====================================================================================

  // １行目と２行目のインラインスタイルのleftに渡す用の関数
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

  // 各Grid行トラックのtopからの位置を返す関数 インラインスタイル内で実行
  const gridRowTrackTopPosition = (index: number) => {
    const topPosition = ((index + 1) * 35).toString() + "px";
    console.log("topPosition", topPosition);
    return topPosition;
  };

  // GridCellクリックでセルを選択中アクティブセルstateに更新
  const handleClickGridCell = (e: React.MouseEvent<HTMLDivElement>) => {
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
  };

  const handleClickAllGridCell = (e: React.MouseEvent<HTMLDivElement>) => {
    // 全てのrowのrole属性を持つDOMを取得
    const rowEls = document.querySelectorAll("[role=row]");
    console.log(rowEls);
  };

  // チェックボックスクリックでstateに選択したアイテムのidを追加
  const handleSelectedCheckBox = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    console.log(
      "前回のアクティブセル親列RowトラックのRowIndex",
      prevSelectedGridCellRef.current?.parentElement?.ariaRowIndex
    );
    console.log("今回のアクティブセル親列トラックのRowIndex", selectedGridCellRef.current?.parentElement?.ariaRowIndex);
    // PointerEventsを明示することでtypescriptのエラー回避
    if (e.nativeEvent instanceof PointerEvent) {
      // ルート１：そのままチェック (シフトキーがfalseの場合)
      if (e.nativeEvent.shiftKey === false) {
        console.log(e);
        let newSelectedCheckBoxArray = [...selectedCheckBox];
        // チェックした時
        if (e.target.checked === true) {
          newSelectedCheckBoxArray.push(id);
          newSelectedCheckBoxArray.sort((a, b) => a - b);
          setSelectedCheckBox(newSelectedCheckBoxArray);
        } else {
          // チェックが外れた時
          const filteredArray = newSelectedCheckBoxArray.filter((itemId) => itemId !== id);
          filteredArray.sort((a, b) => a - b);
          setSelectedCheckBox(filteredArray);
        }
      } else {
        // ルート２：シフトキーが押された状態でチェック
        // もし他のチェックボックスのセルがaria-selected=trueで選択中となっているならば
        // クリックしたチェックボックスと前回アクティブだったチェックボックスのセルとの間のチェックボックスを全てtrueにかえる
        // まずはgridcellのcolindexが1のセルを全て取得
        const checkBoxCells = document.querySelectorAll('[role=gridcell][aria-colindex="1"]');
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
        }
      }
    }
  };

  // チェックボックスヘッダーのON/OFFで全てのチェックボックスをtrue/false切り替え後、全てのidを選択中stateに反映
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
  console.log("selectedCheckBox", selectedCheckBox);

  return (
    <section className={styles.allBody}>
      <main className={styles.main_container}>
        <div className={`${styles.grid_header} flex h-12 max-h-12 items-center justify-between px-5 py-2`}>
          <div className="-ml-2 flex items-center text-sm">
            <button className="focus:outline-scale-600 flex rounded border-none bg-transparent p-0 outline-none outline-offset-1 transition-all focus:outline-4 ">
              KEN
            </button>
            <span className="text-[#282828]"> / </span>
            <button className="focus:outline-scale-600 flex rounded border-none bg-transparent p-0 outline-none outline-offset-1 transition-all focus:outline-4 ">
              Button
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button className="focus:outline-scale-600 flex rounded border-none bg-[#232323] bg-transparent p-0 px-2 outline-none outline-1 outline-offset-1 outline-gray-700 transition-all focus:outline-4">
              Button
            </button>
            <button className="focus:outline-scale-600 flex rounded border-none bg-[#232323] bg-transparent p-0 px-2 outline-none outline-1 outline-offset-1 outline-gray-700 transition-all focus:outline-4">
              Button
            </button>
            <button className="focus:outline-scale-600 flex rounded border-none bg-[#232323] bg-transparent p-0 px-2 outline-none outline-1 outline-offset-1 outline-gray-700 transition-all focus:outline-4">
              Button
            </button>
          </div>
        </div>
        <div className={`${styles.grid_container} flex h-full flex-col`}>
          <div className="flex h-10 items-center justify-between bg-[#232323] px-5 py-1.5 "></div>
          <div className="h-full w-full">
            {/* ======================== Gridコンテナ ======================== */}
            <div
              ref={gridContainerRef}
              role="grid"
              aria-multiselectable="true"
              style={{ height: "100%", "--header-row-height": "35px", "--row-width": "" } as any}
              className={`select-none overflow-x-auto overflow-y-scroll border border-[#2e2e2e] bg-transparent ${styles.grid_container}`}
            >
              {/* ======================== Grid列トラック Rowヘッダー ======================== */}
              <div
                role="row"
                tabIndex={-1}
                aria-rowindex={1}
                aria-selected={false}
                className={`${styles.grid_header_row}`}
                // style={{
                //   gridTemplateColumns: colsWidth.join(" "),
                // }}
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
                    {/* <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                    </svg> */}
                  </div>
                </div>
                {/* ======== ヘッダーセル 全てのプロパティ(フィールド)Column  ======== */}

                {Object.keys(tableBodyDataArray[0]).map((key, index) => (
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
                {/* ======== ヘッダーセル idを除く全てのプロパティ(フィールド)Column  ======== */}
              </div>
              {/* ======================== Grid列トラック Rowヘッダー ======================== */}
              {/* <div className="h-[1950px]"></div> */}
              {/* ======================== Grid列トラック Row ======================== */}
              {tableBodyDataArray.map((rowData, index) => (
                <div
                  key={index}
                  role="row"
                  tabIndex={-1}
                  aria-rowindex={index + 2} // ヘッダーの次からなのでindex0+2
                  aria-selected={false}
                  className={`${styles.grid_row}`}
                  style={{
                    // gridTemplateColumns: colsWidth.join(" "),
                    // top: gridRowTrackTopPosition(index),
                    top: ((index + 1) * 35).toString() + "px",
                  }}
                >
                  {/* ======== gridセル チェックボックスセル ======== */}
                  <div
                    ref={(ref) => (gridRowTracksRefs.current[index] = ref)}
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
                        value={rowData.id}
                        onChange={(e) => handleSelectedCheckBox(e, rowData.id)}
                        // className={`${styles.grid_select_cell_header_input}`}
                      />
                      {/* <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                      </svg> */}
                    </div>
                  </div>
                  {/* ======== gridセル 全てのプロパティ(フィールド)セル  ======== */}

                  {Object.values(rowData).map((value, index) => (
                    <div
                      key={index}
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
                      // style={{ gridColumnStart: index + 2, left: `${((index + 1) * 35).toString() + "px"}` }}
                      // onMouseDown={
                      //   index !== Object.keys(tableBodyDataArray[0]).length - 1
                      //     ? (e) => handleMouseDown(e, index)
                      //     : undefined
                      // }
                    >
                      {value}
                      {/* カラム順番入れ替えdraggable用ラッパー(padding 8px除く全体) */}
                      {/* <div className="w-full" draggable={true} data-handler-id="T1127" style={{ opacity: 1 }}>
                        <div
                          className={`${styles.grid_column_header} ${index === 0 && styles.grid_column_header_cursor}`}
                        >
                          <div className={`${styles.grid_column_header_inner}`}>
                            <span className={`${styles.grid_column_header_inner_name}`}>{key}</span>
                          </div>
                        </div>
                      </div> */}
                      {/* ドラッグ用overlay */}
                      {/* <div
                        ref={(ref) => (draggableOverlaysRef.current[index] = ref)}
                        role="draggable_overlay"
                        className={styles.draggable_overlay}
                        onMouseDown={(e) => handleMouseDown(e, index)}
                      ></div> */}
                    </div>
                  ))}
                  {/* ======== ヘッダーセル idを除く全てのプロパティ(フィールド)Column  ======== */}
                </div>
              ))}
              {/* ======================== Grid列トラック Row ======================== */}
            </div>
            {/* ======================== Gridコンテナ ======================== */}
          </div>
        </div>
        <div className={styles.grid_footer}>
          <div className={styles.grid_footer_inner}>
            <div className={`${styles.grid_pagination} space-x-3`}>
              <button
                className={`font-regular text-scale-1200 hover:bordershadow-scale-700 dark:bordershadow-scale-800 hover:dark:bordershadow-scale-900 focus-visible:outline-scale-700 pointer-events-none relative inline-flex cursor-pointer items-center space-x-2 rounded border bg-transparent px-[10px]   py-[3px] text-center text-xs opacity-50 shadow-sm outline-none  outline-0 transition transition-all  duration-200 ease-out focus-visible:outline-4 focus-visible:outline-offset-1 `}
              >
                <AiOutlineArrowLeft />
              </button>
              <p className="text-sm font-medium text-[#bbb]">Page</p>
              <div className={`w-[3rem] space-x-3`}>
                <input
                  type="number"
                  className=" text-scale-1200 focus:border-scale-900 focus:ring-scale-400 placeholder-scale-800 bg-scaleA-200 border-scale-700 box-border block w-full appearance-none rounded-md border border-[#575757] bg-[#ffffff07] bg-none px-2.5 py-1   text-xs  shadow-sm  outline-none transition-all focus:shadow-md focus:ring-2 focus:ring-current"
                  max={1}
                  min={1}
                  value={1}
                  onChange={() => null}
                />
              </div>
              <p className="text-sm font-medium text-[#bbb]">of 1</p>
              <button className=" focus:outline-scale-600 flex rounded border-none bg-transparent p-0 outline-none outline-offset-1 transition-all focus:outline-4 ">
                <span className=" font-regular text-scale-1200 bordershadow-scale-600 hover:bordershadow-scale-700 dark:bordershadow-scale-800 hover:dark:bordershadow-scale-900 focus-visible:outline-scale-700 relative inline-flex cursor-pointer items-center space-x-2 rounded border border-[#777] bg-transparent   px-[10px] py-[3px] text-center text-xs shadow-sm outline-none outline-0  transition  transition-all duration-200 ease-out focus-visible:outline-4 focus-visible:outline-offset-1">
                  <span className="truncate">100 rows</span>
                </span>
              </button>
              <p className="text-sm font-medium text-[#bbb]">55 records</p>
            </div>
          </div>
        </div>
      </main>
    </section>
  );
};
export default GridTableTest;
