import {
  Dispatch,
  DragEvent,
  FormEvent,
  Fragment,
  SetStateAction,
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BurnBarrel } from "./BurnBarel";
import styles from "./DealBoard.module.css";
import { FiPlus } from "react-icons/fi";

type ColumnLane = {
  title: string;
  headingColor: string;
  cards: CardType[];
  setCards: Dispatch<SetStateAction<CardType[]>>;
};

type CardType = { id: string; taskTitle: string; contents: string | null; columnTitle: string };

const DEFAULT_CARDS = Array(11)
  .fill(null)
  .map((_, index) => {
    let columnName = "ToDo";
    if (4 < index && index < 8) columnName = "ToDo";
    if (8 <= index && index <= 9) columnName = "In Progress";
    if (10 <= index) columnName = "Done";
    return { taskTitle: `${index}`, id: index.toString(), columnTitle: columnName, contents: null };
  });

// 列のインデックスとタイトルのマッピング
const mappingColumnIndexToTitle: { [key: number]: string } = {
  0: "ToDo",
  1: "In Progress",
  2: "Done",
};

const DealBoardMemo = () => {
  // const [cards, setCards] = useState<CardType[]>([]);
  const [cards, setCards] = useState<CardType[]>(DEFAULT_CARDS);
  // const [hasChecked, setHasChecked] = useState(false);
  const hasCheckedRef = useRef(false);

  const dealColumnList: ColumnLane[] = [
    { title: "ToDo", headingColor: "text-yellow-200", cards: cards, setCards: setCards },
    { title: "In Progress", headingColor: "text-blue-200", cards: cards, setCards: setCards },
    { title: "Done", headingColor: "text-emerald-200", cards: cards, setCards: setCards },
  ];

  // useEffect(() => {
  //   hasCheckedRef.current && localStorage.setItem("cards", JSON.stringify(cards));
  // }, [cards]);

  // useEffect(() => {
  //   const cardData = localStorage.getItem("cards");

  //   setCards(cardData ? JSON.parse(cardData) : []);

  //   hasCheckedRef.current = true;
  // }, []);

  // ----------------------------- 🌟Column関連🌟

  // 各Columnレーン
  // const columnLaneRef = useRef<HTMLDivElement | null>(null);
  // const todoColumnRef = useRef<HTMLDivElement | null>(null);
  // const inProgressColumnRef = useRef<HTMLDivElement | null>(null);
  // const doneColumnRef = useRef<HTMLDivElement | null>(null);

  // 各ColumnレーンのDOMを各refをセットする関数
  const getColumnRef = (ref: HTMLDivElement | null, columnIndex: number) => {
    // if (columnIndex === 0) return (todoColumnRef.current = ref);
    // if (columnIndex === 1) return (inProgressColumnRef.current = ref);
    // if (columnIndex === 2) return (doneColumnRef.current = ref);
  };

  const isHighlightIndicatorRef = useRef(false);
  // --------------- 🔹ボード
  const columnLanesBoardRef = useRef<HTMLDivElement | null>(null);
  // --------------- 🔹Columnレーン
  const columnLanesRef = useRef<(HTMLDivElement | null)[]>([]);
  // カラムレーンホバー時のアクティブ状態
  const columnActiveRef = useRef(false);
  // column最後のインジケータ
  const lastIndicators = useRef<(HTMLDivElement | null)[]>([]);
  // --------------- 🔹カード
  // １列分の全てのカードのrefオブジェクトの配列
  const rowCardsRef = useRef<(HTMLDivElement | null)[]>([]);
  // ドラッグしているカードの情報
  const prevDraggingCardIndexRef = useRef<{ prevColumnIndex: number; prevRowIndex: number } | null>(null);
  const draggingCardIndexRef = useRef<{ currentColumnIndex: number; currentRowIndex: number } | null>(null);
  const draggingCardSizeY = useRef(0);
  // const [draggingCardSizeY, setDraggingCardSizeY] = useState(0);
  const draggingCardObjRef = useRef<CardType | null>(null);
  // カードホバー時のアクティブ状態
  const rowCardActiveRef = useRef(false);
  // ドラッグ中のカードのDOM
  const draggingCardDom = useRef<HTMLDivElement | null>(null);
  // ドラッグ中のカードを掴んだ位置からカード上部までの距離
  const offsetDragCardPositionRef = useRef({ x: 0, y: 0 });

  const [updateCardsMapTrigger, setUpdateCardsMapTrigger] = useState(Date.now());
  // カテゴライズしたカードリストMapオブジェクト
  const categorizedCardsMapObj = useMemo(() => {
    const categorizedCards: Map<string, CardType[]> = cards.reduce((map, card) => {
      // 既にそのtitleのキーがMapに存在するか確認
      if (!map.has(card.columnTitle)) {
        map.set(card.columnTitle, []); // 存在しなければ新しい配列と共にキーを追加
      }

      map.get(card.columnTitle).push(card); // カードを適切な配列に追加

      return map; // 更新されたMapを返す
    }, new Map());

    console.log(
      "✅✅✅✅✅✅✅✅✅✅✅✅✅再生成updateCardsMapTrigger",
      updateCardsMapTrigger,
      "cards",
      cards,
      "categorizedCards",
      categorizedCards
    );
    return categorizedCards;
  }, [cards, updateCardsMapTrigger]);

  // ----------------------- 🌟Columnレーン🌟 -----------------------

  // 前回のレーンDOM
  const prevActiveColumnDom = useRef<HTMLDivElement | null>(null);

  // ----------------------- 受Columnレーン Enter -----------------------
  const handleDragEnterColumnLane = ({
    e,
    columnIndex,
    columnTitle,
  }: {
    e: DragEvent<HTMLDivElement>;
    columnIndex: number;
    columnTitle: string;
  }) => {
    console.log("Columnレーン Enter🔹");
    // ドラッグ中のカード
    if (!draggingCardDom.current) return;

    // Columnレーンをアクティブにする前に前回のactiveなColumnと異なるColumnかチェック
    if (prevActiveColumnDom.current) {
      const isSameColumn = prevActiveColumnDom.current.dataset.columnTitle === columnTitle;
      if (
        !isSameColumn &&
        prevActiveColumnDom.current &&
        prevActiveColumnDom.current.classList.contains(styles.active)
      ) {
        prevActiveColumnDom.current.classList.remove(`${styles.active}`);
      }
    }

    // Columnレーンをアクティブ
    const hoveredColumn = columnLanesRef.current[columnIndex];
    if (!hoveredColumn) return;
    if (!hoveredColumn.classList.contains(styles.active)) {
      hoveredColumn.classList.add(`${styles.active}`);
      // activeにしたカラムを記憶
      prevActiveColumnDom.current = hoveredColumn as HTMLDivElement;
    }

    // 最下部以下にドラッグしている場合は末尾のインジケータをactiveに更新
    // 現在のポインターの位置からとカードのtopまで距離をオフセットtopの位置
    const draggingCardTop = e.clientY - offsetDragCardPositionRef.current.y;

    // 最後のカード
    const lastCardInCurrentColumn = lastIndicators.current[columnIndex];
    if (!lastCardInCurrentColumn) return;
    const lastCardBottomInCurrentColumn = lastCardInCurrentColumn.getBoundingClientRect().bottom;
    if (!lastCardBottomInCurrentColumn) return;
    // 末尾のカードの最下部よりドラッグ中のカードの上部が下の場合は末尾のインジケータをactiveにする

    if (lastCardBottomInCurrentColumn < draggingCardTop) {
      console.log("🔥🔥🔥🔥🔥🔥🔥🔥", lastCardBottomInCurrentColumn < draggingCardTop);
      // 前回のインジケータを非アクティブ化 同じカラムの末尾以外
      if (prevIndicatorRef.current) {
        const isSame =
          Number(prevIndicatorRef.current.dataset.columnIndex) === columnIndex &&
          Number(prevIndicatorRef.current.dataset.rowIndex) === -1;
        if (!isSame && prevIndicatorRef.current && prevIndicatorRef.current.classList.contains(styles.active)) {
          prevIndicatorRef.current.classList.remove(`${styles.active}`);
        }
      }
      const lastIndicator = hoveredColumn.querySelector(`.${styles.drop_indicator}:last-of-type`);
      if (lastIndicator && !lastIndicator.classList.contains(styles.active)) {
        lastIndicator.classList.add(`${styles.active}`);

        prevIndicatorRef.current = lastIndicator as HTMLDivElement;
      }
      // カラム下にホバーしている場合は、ドロップする際に、該当のカラムの末尾に追加する
      if (draggingCardIndexRef.current) {
        // 現在記録しているDOMの列と行
        const draggingColIndex = draggingCardIndexRef.current.currentColumnIndex;
        const draggingRowIndex = draggingCardIndexRef.current.currentRowIndex;

        // 現在ホバー中のカードと現在保持しているDOMの列と行が異なれば更新する
        if (draggingColIndex !== columnIndex || draggingRowIndex !== -1) {
          draggingCardIndexRef.current = {
            currentColumnIndex: columnIndex,
            currentRowIndex: -1,
          };
        }
      }
    }
  };
  // ----------------------- 受Columnレーン Enter -----------------------

  // ----------------------- 受Columnレーン Over -----------------------
  const handleDragOverColumnLane = ({ e, columnIndex }: { e: DragEvent<HTMLDivElement>; columnIndex: number }) => {
    e.preventDefault();
  };
  // ----------------------- 受Columnレーン Drop -----------------------
  // 🌟onDrop
  const handleDropColumnLane = ({
    e,
    columnTitle,
    columnIndex,
  }: {
    e: DragEvent<HTMLDivElement>;
    columnTitle: string;
    columnIndex: number;
  }) => {
    console.log("Columnレーン Drop🔹✅");
  };

  // ----------------------- 受Columnレーン onDragLeave -----------------------
  const handleDragLeaveColumnLane = (e: DragEvent<HTMLDivElement>, columnTitle: string) => {};

  // ----------------------- 🌟Columnレーン🌟 -----------------------

  // ------------------------------------ 🌟カード関連🌟 ------------------------------------

  // ---------------------------- 🌟カードドラッグスタート🌟 ----------------------------

  const handleDragStartCard = ({
    e,
    card,
    columnIndex,
    rowIndex,
  }: {
    e: DragEvent<HTMLDivElement>;
    card: CardType;
    columnIndex: number;
    rowIndex: number;
  }) => {
    // ドラッグ開始時の列と行を保存
    prevDraggingCardIndexRef.current = { prevColumnIndex: columnIndex, prevRowIndex: rowIndex };
    draggingCardIndexRef.current = { currentColumnIndex: columnIndex, currentRowIndex: rowIndex };
    draggingCardObjRef.current = card;
    draggingCardSizeY.current = e.currentTarget.getBoundingClientRect().height;
    // setDraggingCardSizeY(e.currentTarget.getBoundingClientRect().height);

    // is_draggingクラス付与
    e.currentTarget.classList.add(styles.is_dragging);

    draggingCardDom.current = e.currentTarget as HTMLDivElement;

    // 実際にドラッグしたマウスポインタの位置と、実際のカードの左端、上部の差分の距離を記憶しておく(ドラッグ後に使用)
    const cardRect = e.currentTarget.getBoundingClientRect();
    offsetDragCardPositionRef.current = {
      x: e.clientX - cardRect.left,
      y: e.clientY - cardRect.top,
    };

    // e.dataTransfer.setData("cardId", card.id);
    console.log("Rowカード Start🌠");

    // ドラッグ元のドラッグ中のDOMの残像を非表示
    // e.currentTarget.style.display =  'none'

    // // ドラッグ中のカスタムプレビューを設定
    // const draggingCard = document.createElement('div')
    // draggingCard.classList.add(
    //   `${styles.row_card} cursor-grab rounded border border-solid border-neutral-700 bg-neutral-800 p-3 active:cursor-grabbing`
    // );
    // // pタグ生成
    // const p = document.createElement("p");
    // p.textContent = card.taskTitle
    // draggingCard.appendChild(p)
  };
  // ---------------------------- ✅主カードドラッグスタート✅ ----------------------------

  // ---------------------------- 🌟受カード Enter🌟 ----------------------------
  const enterDirectionInSameColumn = useRef("");
  const prevIndicatorRef = useRef<HTMLDivElement | null>(null);
  const prevSpacerRef = useRef<HTMLDivElement | null>(null);
  const handleDragEnterCard = ({
    e,
    card,
    columnTitle,
    columnIndex,
    rowIndex,
  }: {
    e: DragEvent<HTMLDivElement>;
    card: CardType;
    columnTitle: string;
    columnIndex: number;
    rowIndex: number;
  }) => {
    // console.log("handleDragStartCard 🌟カードドラッグエンター hoveredAboveIndicator", hoveredAboveIndicator);

    if (!draggingCardObjRef.current) return;
    if (!draggingCardIndexRef.current) return;
    if (!columnLanesBoardRef.current) return;

    // ドラッグ中のカードより
    const currentColumn = columnLanesRef.current[columnIndex];
    if (!currentColumn) return;
    const draggingCard = columnLanesBoardRef.current.querySelector(`.${styles.row_card}.${styles.is_dragging}`);

    // const draggingCardTop = draggingCard?.getBoundingClientRect().top;
    // 現在のポインターの位置からとカードのtopまで距離をオフセットtopの位置
    const draggingCardTop = e.clientY - offsetDragCardPositionRef.current.y;
    if (!draggingCardTop) return;
    const hoveredCardBottom = e.currentTarget?.getBoundingClientRect().bottom;

    // 前回のactiveなインジケータを削除するかどうかチェック
    if (prevIndicatorRef.current) {
      const isSame =
        Number(prevIndicatorRef.current.dataset.columnIndex) === columnIndex &&
        Number(prevIndicatorRef.current.dataset.rowIndex) === rowIndex;
      if (!isSame && prevIndicatorRef.current && prevIndicatorRef.current.classList.contains(styles.active)) {
        prevIndicatorRef.current.classList.remove(`${styles.active}`);
      }
    }

    // インジケータをactiveに変更
    // カード上のインジケータをアクティブに
    const aboveIndicator = currentColumn.querySelector(
      `.${styles.drop_indicator}[data-column-index="${columnIndex}"][data-row-index="${rowIndex}"]`
    );
    if (aboveIndicator && !aboveIndicator.classList.contains(styles.active)) {
      aboveIndicator.classList.add(`${styles.active}`);
      // prevインジケータを現在のactiveインジケータに更新
      prevIndicatorRef.current = aboveIndicator as HTMLDivElement;
    }

    // 現在記録しているDOMの列と行
    const draggingColIndex = draggingCardIndexRef.current.currentColumnIndex;
    const draggingRowIndex = draggingCardIndexRef.current.currentRowIndex;

    // 現在ホバー中のカードと現在保持しているDOMの列と行が異なれば更新する
    if (draggingColIndex !== columnIndex || draggingRowIndex !== rowIndex) {
      draggingCardIndexRef.current = {
        currentColumnIndex: columnIndex,
        currentRowIndex: rowIndex,
      };

      // if (prevSpacerRef.current) {
      //   (prevSpacerRef.current as HTMLDivElement).style.height = `0px`;
      // }
      // // 前のスペーサーがあれば高さを0にしてから新たなスペーサーの高さを確保する
      // // 現在のドラッグ中のカードTopがエンターしたカードの下部の位置より上なら上のスペーサー、違うなら下のスペーサーを表示
      // const spacer = currentColumn.querySelector(
      //   `.${styles.spacer}[data-column-index="${columnIndex}"][data-row-index="${rowIndex}"]`
      // );
      // (spacer as HTMLDivElement).style.height = `${draggingCardSizeY.current}px`;
      // prevSpacerRef.current = spacer as HTMLDivElement;
    }

    console.log(
      "Rowカード Enter🔥",
      "ドラッグ先",
      "rowIndex",
      rowIndex,
      "columnIndex",
      columnIndex,
      "ドラッグ元",
      "draggingRowIndex",
      draggingRowIndex,
      "draggingColIndex",
      draggingColIndex,
      "hoveredCardBottom",
      hoveredCardBottom,
      "draggingCardTop",
      draggingCardTop
    );
  };
  // ---------------------------- ✅受カード Enter✅ ----------------------------
  // ---------------------------- 🌟受カード Over🌟 ----------------------------
  const handleDragOverCard = ({ e }: { e: DragEvent<HTMLDivElement> }) => {
    e.preventDefault();

    // if (rowCardActiveRef.current) return console.log("🔹 Overリターン");

    // const hoveredAboveIndicator = e.currentTarget.previousElementSibling;
    // if (hoveredAboveIndicator && !hoveredAboveIndicator.classList.contains(styles.active)) {
    //   hoveredAboveIndicator.classList.add(`${styles.active}`);
    // }

    // console.log("✅ Over インケータactive");

    // rowCardActiveRef.current = true;
  };
  // ---------------------------- ✅受カード Over✅ ----------------------------
  // ---------------------------- 🌟受カード Leaveホバー🌟 ----------------------------
  const handleDragLeaveCard = ({
    e,
    card,
    columnTitle,
    columnIndex,
    rowIndex,
  }: {
    e: DragEvent<HTMLDivElement>;
    card: CardType;
    columnTitle: string;
    columnIndex: number;
    rowIndex: number;
  }) => {
    console.log("Rowカード Leave🌟", "rowIndex", rowIndex);
  };
  // ---------------------------- ✅受カード Leaveホバー✅ ----------------------------
  // ---------------------------- 🌟主カード End🌟 ----------------------------
  const handleDragEndCard = ({
    e,
    card,
    columnTitle,
    columnIndex,
    rowIndex,
  }: {
    e: DragEvent<HTMLDivElement>;
    card: CardType;
    columnTitle: string;
    columnIndex: number;
    rowIndex: number;
  }) => {
    // is_draggingクラス付与
    e.currentTarget.classList.remove(styles.is_dragging);
    console.log(
      "Rowカード End✅",
      "最終ドロップ位置",
      draggingCardIndexRef.current,
      "初回スタート位置",
      prevDraggingCardIndexRef.current
    );

    // インジケータのactiveクラスを全て削除
    if (!columnLanesBoardRef.current) return;
    const activeIndicator = columnLanesBoardRef.current.querySelector(`.${styles.drop_indicator}.${styles.active}`);
    if (activeIndicator) {
      activeIndicator.classList.remove(styles.active);
    }

    // Columnレーンも非アクティブにリセット
    if (prevActiveColumnDom.current && prevActiveColumnDom.current.classList.contains(styles.active)) {
      prevActiveColumnDom.current.classList.remove(`${styles.active}`);
    }

    // スペーサーもリセット
    if (prevSpacerRef.current) {
      (prevSpacerRef.current as HTMLDivElement).style.height = `0px`;
    }

    // 🔹カード入れ替え

    // ドラッグ元のカードオブジェクト
    const draggingCardObj = draggingCardObjRef.current;
    if (!draggingCardObj) return;
    if (!draggingCardIndexRef.current) return;

    // ドロップ先のColumnインデックス
    const dropColumnIndex = draggingCardIndexRef.current.currentColumnIndex;
    const dropRowIndex = draggingCardIndexRef.current?.currentRowIndex;

    // ドロップ先のカラムタイトル
    const dropColumnTitle = mappingColumnIndexToTitle[draggingCardIndexRef.current.currentColumnIndex];
    // ドロップ先の列のカード配列
    const cardListInCurrentColumn = categorizedCardsMapObj.get(dropColumnTitle);
    if (!cardListInCurrentColumn) return;
    // ドロップ先のカードオブジェクト
    let dropCardObj: CardType | null;
    // columnIndexが最後の2で、rowIndexが-1だった場合、そのカラムの最後尾に挿入
    if (dropColumnIndex === -1) {
      // 列Indexが2以外は次の列の先頭を指定
      const nextColumnTitle = mappingColumnIndexToTitle[dropColumnIndex + 1];
      // 次のカラムのカードリスト
      const cardListInNextColumn = categorizedCardsMapObj.get(nextColumnTitle);
      const firstCardObjInNextColumn = !!cardListInNextColumn?.length ? cardListInNextColumn[0] : null;
      dropCardObj = firstCardObjInNextColumn;
    }
    // 最後尾以外
    else {
      dropCardObj = cardListInCurrentColumn[dropRowIndex];
    }

    setCards((prev) => {
      const newCards = [...prev];
      // ドラッグしてるカードを削除して、ドロップした位置に挿入
      const deleteAt = newCards.findIndex((card) => card.id === draggingCardObj.id);
      const deleteCard = newCards.splice(deleteAt, 1)[0];
      const newInsertCard = {
        id: deleteCard.id,
        taskTitle: deleteCard.taskTitle,
        contents: deleteCard.contents,
        columnTitle: dropColumnTitle,
      } as CardType;

      if (draggingCardIndexRef.current?.currentRowIndex === -1) {
        newCards.push(newInsertCard);
      } else {
        const insertAt = newCards.findIndex((card) => card.id === (dropCardObj as CardType).id);
        if (insertAt === -1) {
          // ドロップ先のカードが見つからない場合は末尾に追加
          newCards.push(newInsertCard);
        } else {
          newCards.splice(insertAt, 0, newInsertCard);
        }
      }

      return newCards;
    });
    setUpdateCardsMapTrigger(Date.now()); // メモ化したMapオブジェクトを再計算して生成
    /**
     *  console.log(
        "🌟🌟🌟🌟更新",
        "prev",
        prev,
        "newCards",
        newCards,
        "deleteAt",
        deleteAt,
        "deleteCard",
        deleteCard,
        "insertAt",
        insertAt,
        "dropCardObj",
        dropCardObj,
        "draggingCardObj",
        draggingCardObj
      );
     */
  };
  // ---------------------------- ✅主カード End✅ ----------------------------

  // ----------------------------- ✅Column関連✅

  /* ------------------- 🌟AddCard🌟 ------------------- */
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);

  const handleSubmit = ({ e, columnTitle }: { e: FormEvent; columnTitle: string }) => {
    e.preventDefault();

    if (!text.trim().length) return setAdding(false);

    const newCard = {
      id: Math.random().toString(),
      taskTitle: text.trim(),
      contents: null,
      columnTitle: columnTitle,
    };

    setCards((pv) => [...pv, newCard]);

    setText("");
    setAdding(false);
  };
  /* ------------------- ✅AddCard✅ ここまで ------------------- */

  // 変数関連
  // const filteredCards = cards.filter((c) => c.columnName === columnName);

  console.log("cards", cards, "categorizedCardsMapObj", categorizedCardsMapObj);

  return (
    <>
      {/* ------------------------ ボード ------------------------ */}
      <div ref={columnLanesBoardRef} className={`flex h-full w-full gap-3 overflow-scroll p-[48px]`}>
        {/* ------------ Columnレーングループ ------------ */}
        {dealColumnList.map((column: ColumnLane, columnIndex: number) => {
          const filteredCards = categorizedCardsMapObj.get(column.title);
          console.log("filteredCards", filteredCards, "column.title", column.title);
          if (!filteredCards) return;

          return (
            <div key={"column" + column.title} className={`${styles.column} w-56 shrink-0`}>
              {/* ------------ Columnタイトル ------------ */}
              <div className={`${styles.title_area} mb-3 flex items-center justify-between`}>
                <h3 className={`font-medium ${column.headingColor}`}>{column.title}</h3>
                <span className={`${styles.card_count} rounded text-sm text-neutral-400`}>{filteredCards.length}</span>
              </div>
              {/* ------------ Columnレーン ------------ */}
              <div
                ref={(ref) => (columnLanesRef.current[columnIndex] = ref)}
                data-column-title={column.title}
                onDrop={(e) => handleDropColumnLane({ e: e, columnTitle: column.title, columnIndex: columnIndex })}
                onDragEnter={(e) =>
                  handleDragEnterColumnLane({ e: e, columnIndex: columnIndex, columnTitle: column.title })
                }
                onDragOver={(e) => handleDragOverColumnLane({ e: e, columnIndex: columnIndex })}
                onDragLeave={(e) => handleDragLeaveColumnLane(e, column.title)}
                className={`${styles.column_lane} h-full w-full transition-colors`}
              >
                {/* ------------ Rowグループ ------------ */}
                {filteredCards.map((card: CardType, rowIndex: number) => {
                  return (
                    <Fragment key={"row_card" + card.taskTitle + card.id}>
                      {/* Row上インジケータ */}
                      <div
                        data-before={card.id}
                        data-indicator-id={card.id}
                        data-column={card.columnTitle}
                        data-column-index={columnIndex}
                        data-row-index={rowIndex}
                        className={`${styles.drop_indicator} my-0.5 h-0.5 min-h-[2px] w-full bg-violet-400 opacity-0`}
                      />
                      {/* Row上インジケータ ここまで */}
                      {/* スペーサーtop ドラッグ位置に空間を空ける用 */}
                      <div
                        data-column-index={columnIndex}
                        data-row-index={rowIndex}
                        className={`${styles.spacer} top h-0 w-full rounded`}
                      ></div>
                      {/* スペーサーtop */}
                      {/* Rowカード */}
                      <div
                        ref={(ref) => (rowCardsRef.current[rowIndex] = ref)}
                        draggable={true}
                        data-card-column-title={card.columnTitle}
                        data-card-row-index={rowIndex}
                        onDragStart={(e) =>
                          handleDragStartCard({ e: e, card: card, columnIndex: columnIndex, rowIndex: rowIndex })
                        }
                        onDragEnter={(e) =>
                          handleDragEnterCard({
                            e: e,
                            card: card,
                            columnTitle: card.columnTitle,
                            columnIndex: columnIndex,
                            rowIndex: rowIndex,
                          })
                        }
                        onDragOver={(e) =>
                          handleDragOverCard({
                            e: e,
                          })
                        }
                        onDragLeave={(e) =>
                          handleDragLeaveCard({
                            e: e,
                            card: card,
                            columnTitle: card.columnTitle,
                            columnIndex: columnIndex,
                            rowIndex: rowIndex,
                          })
                        }
                        onDragEnd={(e) =>
                          handleDragEndCard({
                            e: e,
                            card: card,
                            columnTitle: card.columnTitle,
                            columnIndex: columnIndex,
                            rowIndex: rowIndex,
                          })
                        }
                        className={`${styles.row_card} cursor-grab rounded border border-solid border-neutral-700 bg-neutral-800 p-3 active:cursor-grabbing`}
                      >
                        <p className={`whitespace-pre-wrap text-sm text-neutral-100`}>{card.taskTitle}</p>
                      </div>
                      {/* Rowカード ここまで */}
                    </Fragment>
                  );
                })}
                {/* ------------ Rowグループ ここまで ------------ */}
                {/* ------------ 末尾インジケータ ------------ */}
                <div
                  ref={(ref) => (lastIndicators.current[columnIndex] = ref)}
                  data-column={column.title + "_last"}
                  data-column-index={columnIndex}
                  data-row-index={-1}
                  className={`${styles.drop_indicator} last my-0.5 h-0.5 w-full bg-violet-400 opacity-0`}
                />
                {/* ------------ 末尾インジケータ ここまで ------------ */}
                {/* ------------------- Addカードボタン ------------------- */}
                {adding ? (
                  <form onSubmit={(e) => handleSubmit({ e: e, columnTitle: column.title })}>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      autoFocus
                      placeholder="Add new task..."
                      className={`w-full resize-none rounded border border-solid border-violet-400 bg-violet-400/20 p-3 text-sm text-neutral-50 placeholder-violet-300 focus:outline-0`}
                    />
                    <div className={`mt-1.5 flex items-center justify-end gap-1.5`}>
                      <button
                        onClick={() => {
                          setAdding(false);
                          setText("");
                        }}
                        className={`px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50`}
                      >
                        Close
                      </button>
                      <button
                        type="submit"
                        className={`flex items-center gap-1.5 rounded bg-neutral-50 px-3 py-1.5 text-xs text-neutral-950 transition-colors hover:bg-neutral-300`}
                      >
                        <span>Add</span>
                        <FiPlus />
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setAdding(true)}
                    className={`flex w-full items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50`}
                  >
                    <span>Add card</span>
                    <FiPlus />
                  </button>
                )}
                {/* ------------------- Addカードボタン ここまで ------------------- */}
              </div>
            </div>
          );
        })}
        {/* ------------ Columnレーングループ ------------ */}
        {/* ------------------- ゴミ箱レーン ------------------- */}
        <BurnBarrel setCards={setCards} />
        {/* ------------------- ゴミ箱レーン ここまで ------------------- */}
      </div>
      {/* ------------------------ ボード ここまで ------------------------ */}
    </>
  );
};

export const DealBoard = memo(DealBoardMemo);
