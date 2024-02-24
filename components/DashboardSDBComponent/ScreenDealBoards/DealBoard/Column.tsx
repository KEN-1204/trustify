import { CardType } from "@/types";
import { Dispatch, DragEvent, Fragment, SetStateAction, memo, useMemo, useRef, useState } from "react";
import { Card } from "./Card";
import { AddCard } from "./AddCardTest";
import styles from "./DealBoard.module.css";

type ColumnProps = {
  title: string;
  headingColor: string;
  columnName: string;
  cards: CardType[];
  setCards: Dispatch<SetStateAction<CardType[]>>;
  columnIndex: number;
};

const ColumnMemo = ({ title, headingColor, columnName, cards, setCards, columnIndex }: ColumnProps) => {
  // const [active, setActive] = useState(false);
  const columnActiveRef = useRef(false);
  const isHighlightIndicatorRef = useRef(false);
  // Columnレーン
  const columnLaneRef = useRef<HTMLDivElement | null>(null);
  // １列分の全てのカードのrefオブジェクトの配列
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

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

  return (
    <>
      <div className={`w-56 shrink-0`}>
        <div className={`${styles.title_area} mb-3 flex items-center justify-between`}>
          <h3 className={`font-medium ${headingColor}`}>{title}</h3>
          <span className={`${styles.card_count} rounded text-sm text-neutral-400`}>{filteredCards.length}</span>
        </div>
        <div
          ref={columnLaneRef}
          onDrop={handleDragEndColumnLane}
          onDragOver={handleDragOverColumnLane}
          onDragLeave={handleDragLeaveColumnLane}
          //   className={`h-full w-full transition-colors ${active ? `bg-neutral-800/50` : `bg-neutral-800/0`}`}
          className={`${styles.column_lane} h-full w-full transition-colors`}
        >
          {filteredCards.map((card: CardType, index: number) => {
            return (
              <Fragment key={card.id}>
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
            data-before={"-1"}
            data-column={columnName}
            className={`${styles.drop_indicator} my-0.5 h-0.5 w-full bg-violet-400 opacity-0`}
          />
          <AddCard column={columnName} setCards={setCards} />
        </div>
      </div>
    </>
  );
};

export const Column = memo(ColumnMemo);
