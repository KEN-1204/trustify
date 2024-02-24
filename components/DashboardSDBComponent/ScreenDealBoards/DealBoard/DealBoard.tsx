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

type CardType = { title: string; id: string; columnName: string };

const DealBoardMemo = () => {
  const [cards, setCards] = useState<CardType[]>([]);
  // const [hasChecked, setHasChecked] = useState(false);
  const hasCheckedRef = useRef(false);

  const columnLanesBoardRef = useRef<HTMLDivElement | null>(null);

  const dealColumnList: ColumnLane[] = [
    { title: "ToDo", headingColor: "text-yellow-200", cards: cards, setCards: setCards },
    { title: "In Progress", headingColor: "text-blue-200", cards: cards, setCards: setCards },
    { title: "Done", headingColor: "text-emerald-200", cards: cards, setCards: setCards },
  ];

  useEffect(() => {
    // hasChecked && localStorage.setItem("cards", JSON.stringify(cards));
    hasCheckedRef.current && localStorage.setItem("cards", JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    const cardData = localStorage.getItem("cards");

    setCards(cardData ? JSON.parse(cardData) : []);

    // setHasChecked(true);
    hasCheckedRef.current = true;
  }, []);

  // ----------------------------- 🌟Column関連🌟

  // 各Columnレーン
  const todoColumnRef = useRef<HTMLDivElement | null>(null);
  const inProgressColumnRef = useRef<HTMLDivElement | null>(null);
  const doneColumnRef = useRef<HTMLDivElement | null>(null);

  // 各ColumnレーンのDOMを各refをセットする関数
  const getColumnRef = (ref: HTMLDivElement | null, columnIndex: number) => {
    if (columnIndex === 0) return (todoColumnRef.current = ref);
    if (columnIndex === 1) return (inProgressColumnRef.current = ref);
    if (columnIndex === 2) return (doneColumnRef.current = ref);
  };

  // カラムホバー時のアクティブ状態
  const columnActiveRef = useRef(false);
  const isHighlightIndicatorRef = useRef(false);
  // Columnレーン
  const columnLanesRef = useRef<(HTMLDivElement | null)[]>([]);
  // １列分の全てのカードのrefオブジェクトの配列
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  // column最後のインジケータ
  const lastIndicators = useRef<(HTMLDivElement | null)[]>([]);

  // 全てのインジケータを取得
  const getIndicators = (): HTMLDivElement[] => {
    return Array.from(document.querySelectorAll(`[data-column="${columnName}"]`));
  };

  // 一番近いCardのインジケータを取得
  const getNearestIndicator = (
    e: DragEvent<HTMLDivElement>,
    indicators: HTMLDivElement[]
  ): { offset: number; element: HTMLDivElement } => {
    const DISTANCE_OFFSET = 50;
    const el = indicators.reduce(
      (closest: { offset: number; element: HTMLDivElement }, child: HTMLDivElement) => {
        const box = child.getBoundingClientRect();
        const offset = e.clientX - (box.top + DISTANCE_OFFSET);

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      {
        offset: Number.NEGATIVE_INFINITY,
        element: indicators[indicators.length - 1],
      }
    );

    return el;
  };

  // ハイライトクリア関数
  const clearHighlight = (els?: HTMLDivElement[]) => {
    const indicators = els || getIndicators();

    indicators.forEach((i) => {
      i.style.opacity = "0";
    });
    isHighlightIndicatorRef.current = false;
    console.log("Column ハイライトOFF クリア", isHighlightIndicatorRef.current);
  };

  // ハイライト関数
  const highlightIndicator = (e: DragEvent<HTMLDivElement>) => {
    if (isHighlightIndicatorRef.current)
      return console.log("Column highlightIndicator関数 ハイライト済みなのでリターン");
    const indicators = getIndicators();

    clearHighlight();

    const el = getNearestIndicator(e, indicators);
    el.element.style.opacity = "1";
    isHighlightIndicatorRef.current = true;
    console.log("Column ハイライトON el", el, isHighlightIndicatorRef.current);
  };

  // 🌟ドラッグオーバー
  const handleDragOverColumnLane = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (columnActiveRef.current) return console.log("Column onDragOverイベント 既にアクティブのためリターン");

    console.log("Column onDragOverイベント 🔥アクティブに変更 インジケータをハイライト");
    highlightIndicator(e);
    // アクティブ化
    columnActiveRef.current = true;
    // 列レーンを非アクティブ化
    columnLaneRef.current?.classList.remove(`${styles.active}`);
    columnLaneRef.current?.classList.add(`${styles.active}`);

    // setActive(true);
  };

  // 🌟onDropイベントの関数
  const handleDragEndColumnLane = (e: DragEvent<HTMLDivElement>) => {
    const cardId = e.dataTransfer.getData("cardId");

    console.log("Column onDropイベント ✅非アクティブに変更");

    // インジケータのactiveを削除
    const indicator = e.currentTarget.previousElementSibling;
    console.log("handleDragEndColumnLane エンド indicator", indicator);
    if (indicator) {
      (indicator as HTMLDivElement).classList.remove(`${styles.active}`);
    }

    columnActiveRef.current = false;
    columnLaneRef.current?.classList.remove(`${styles.active}`);
    columnLaneRef.current?.classList.add(`${styles.active}`);
    clearHighlight();

    const indicators = getIndicators();
    const { element } = getNearestIndicator(e, indicators);

    const before = element.dataset.before || "-1";

    if (before !== cardId) {
      let copy = [...cards];

      let cardToTransfer = copy.find((c) => c.id === cardId);
      if (!cardToTransfer) return;
      cardToTransfer = { ...cardToTransfer, columnName };

      copy = copy.filter((c) => c.id !== cardId);

      const moveToBack = before === "-1";

      if (moveToBack) {
        copy.push(cardToTransfer);
      } else {
        const insertAtIndex = copy.findIndex((el) => el.id === before);
        if (insertAtIndex === undefined) return;

        copy.splice(insertAtIndex, 0, cardToTransfer);
      }

      setCards(copy);
    }
  };

  // 🌟onDragLeaveイベントの関数
  const handleDragLeaveColumnLane = (e: DragEvent<HTMLDivElement>) => {
    console.log("Column onDragLeaveイベント ✅非アクティブに変更 ハイライトをオフ");
    clearHighlight();
    // 非アクティブ化
    columnActiveRef.current = false;
    // 列レーンを非アクティブ化
    columnLaneRef.current?.classList.remove(`${styles.active}`);
    columnLaneRef.current?.classList.add(`${styles.active}`);
  };

  const filteredCards = useMemo(() => {
    return cards.filter((c) => c.columnName === columnName);
  }, [cards]);

  // 🌟カードドラッグスタート cardのidをセット
  const handleDragStartCard = (e: DragEvent<HTMLDivElement>, card: CardType) => {
    e.dataTransfer.setData("cardId", card.id);
    // インジケータをactiveに変更
    const indicator = e.currentTarget.previousElementSibling;
    console.log("handleDragStartCard 🌟カードドラッグスタート indicator", indicator);
    if (indicator) {
      (indicator as HTMLDivElement).classList.add(`${styles.active}`);
    }
  };

  type CardHoverProps = { e: DragEvent<HTMLDivElement>; card: CardType; hoveredColumnIndex: number };
  // 🌟カードホバー
  const handleDragOverCard = ({ e, card, hoveredColumnIndex }: CardHoverProps) => {
    // columnIndexが現在のカラムと異なる場合は全て不透明に変更
    if (hoveredColumnIndex !== columnIndex) {
    }
    const hoveredAboveIndicator = e.currentTarget.previousElementSibling;
    if (hoveredAboveIndicator) {
      hoveredAboveIndicator.classList.add(`${styles.active}`);
    }
  };

  // ----------------------------- ✅Column関連✅

  /* ------------------- 🌟AddCard🌟 ------------------- */
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!text.trim().length) return setAdding(false);

    const newCard = {
      column,
      title: text.trim(),
      id: Math.random().toString(),
    };

    setCards((pv) => [...pv, newCard]);

    setText("");
    setAdding(false);
  };
  /* ------------------- ✅AddCard✅ ここまで ------------------- */

  return (
    <>
      <div ref={columnLanesBoardRef} className={`flex h-full w-full gap-3 overflow-scroll p-[48px]`}>
        {dealColumnList.map((column: ColumnLane, columnIndex: number) => (
          <div
            key={"column" + column.title}
            ref={(ref) => getColumnRef(ref, columnIndex)}
            className={`${styles.column} w-56 shrink-0`}
          >
            <div className={`${styles.title_area} mb-3 flex items-center justify-between`}>
              <h3 className={`font-medium ${column.headingColor}`}>{column.title}</h3>
              <span className={`${styles.card_count} rounded text-sm text-neutral-400`}>{filteredCards.length}</span>
            </div>
            <div
              ref={(ref) => (columnLanesRef.current[columnIndex] = ref)}
              onDrop={handleDragEndColumnLane}
              onDragOver={handleDragOverColumnLane}
              onDragLeave={handleDragLeaveColumnLane}
              //   className={`h-full w-full transition-colors ${active ? `bg-neutral-800/50` : `bg-neutral-800/0`}`}
              className={`${styles.column_lane} h-full w-full transition-colors`}
            >
              {filteredCards.map((card: CardType, index: number) => {
                return (
                  <Fragment key={"row_card" + card.title + card.id}>
                    <div
                      data-before={card.id}
                      data-indicator-id={card.id}
                      data-column={card.columnName}
                      className={`${styles.drop_indicator} my-0.5 h-0.5 w-full bg-violet-400 opacity-0`}
                    />
                    <div
                      ref={(ref) => (cardsRef.current[index] = ref)}
                      draggable={true}
                      onDragStart={(e) => handleDragStartCard(e, card)}
                      onDragOver={(e) => handleDragOverCard({ e: e, card: card, hoveredColumnIndex: columnIndex })}
                      className={`cursor-grab rounded border border-solid border-neutral-700 bg-neutral-800 p-3 active:cursor-grabbing`}
                    >
                      <p className={`whitespace-pre-wrap text-sm text-neutral-100`}>{card.title}</p>
                    </div>
                  </Fragment>
                );
              })}
              <div
                ref={(ref) => (lastIndicators.current[columnIndex] = ref)}
                data-column={column.title + "_last"}
                className={`${styles.drop_indicator} my-0.5 h-0.5 w-full bg-violet-400 opacity-0`}
              />
              {/* <AddCard column={columnName} setCards={setCards} /> */}
              {/* ------------------- 🌟AddCard🌟 ------------------- */}
              {adding ? (
                <form onSubmit={handleSubmit}>
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
              {/* ------------------- ✅AddCard✅ ここまで ------------------- */}
            </div>
          </div>
        ))}
        <BurnBarrel setCards={setCards} />
      </div>
    </>
  );
};

export const DealBoard = memo(DealBoardMemo);
