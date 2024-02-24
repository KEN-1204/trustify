import { CardType } from "@/types";
import { Dispatch, DragEvent, SetStateAction, memo, useRef, useState } from "react";
import { DropIndicator } from "./DropIndicator";
import { Card } from "./Card";
import { AddCard } from "./AddCardTest";

type ColumnProps = {
  title: string;
  headingColor: string;
  columnName: string;
  cards: CardType[];
  setCards: Dispatch<SetStateAction<CardType[]>>;
};

const ColumnTestMemo = ({ title, headingColor, columnName, cards, setCards }: ColumnProps) => {
  // const [active, setActive] = useState(false);
  const activeRef = useRef(false);
  const isHighlightRef = useRef(false);
  // Columnレーン
  const columnLaneRef = useRef<HTMLDivElement | null>(null);

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
    isHighlightRef.current = false;
    console.log("Column ハイライトOFF クリア", isHighlightRef.current);
  };

  // ハイライト関数
  const highlightIndicator = (e: DragEvent<HTMLDivElement>) => {
    if (isHighlightRef.current) return console.log("Column highlightIndicator関数 ハイライト済みなのでリターン");
    const indicators = getIndicators();

    clearHighlight();

    const el = getNearestIndicator(e, indicators);
    el.element.style.opacity = "1";
    isHighlightRef.current = true;
    console.log("Column ハイライトON el", el, isHighlightRef.current);
  };

  // ドラッグスタート cardのidをセット
  const handleDragStart = (e: DragEvent<HTMLDivElement>, card: CardType) => {
    e.dataTransfer.setData("cardId", card.id);
  };

  // ドラッグオーバー
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (activeRef.current) return console.log("Column onDragOverイベント activeのためリターン");

    console.log("Column onDragOverイベント アクティブに変更 インジケータをハイライト");
    highlightIndicator(e);
    activeRef.current = true;
    columnLaneRef.current?.classList.remove(`bg-neutral-800/0`);
    columnLaneRef.current?.classList.add(`bg-neutral-800/50`);

    // setActive(true);
  };

  // onDropイベントの関数
  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    const cardId = e.dataTransfer.getData("cardId");

    console.log("Column onDropイベント 非アクティブに変更");

    // setActive(false);
    activeRef.current = false;
    columnLaneRef.current?.classList.remove(`bg-neutral-800/50`);
    columnLaneRef.current?.classList.add(`bg-neutral-800/0`);
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

  // onDragLeaveイベントの関数
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    console.log("Column onDragLeaveイベント 非アクティブに変更 ハイライトをオフ");
    clearHighlight();
    activeRef.current = false;
    columnLaneRef.current?.classList.remove(`bg-neutral-800/50`);
    columnLaneRef.current?.classList.add(`bg-neutral-800/0`);
    // setActive(false);
  };

  const filteredCards = cards.filter((c) => c.columnName === column);

  return (
    <>
      <div className={`w-56 shrink-0`}>
        <div className={`mb-3 flex items-center justify-between`}>
          <h3 className={`font-medium ${headingColor}`}>{title}</h3>
          <span className={`rounded text-sm text-neutral-400`}>{filteredCards.length}</span>
        </div>
        <div
          ref={columnLaneRef}
          onDrop={handleDragEnd}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          // className={`h-full w-full transition-colors ${active ? `bg-neutral-800/50` : `bg-neutral-800/0`}`}
          className={`h-full w-full bg-neutral-800/0 transition-colors`}
        >
          {filteredCards.map((c) => {
            return <Card key={c.id} card={c} handleDragStart={handleDragStart} />;
          })}
          <DropIndicator beforeId={null} column={column} />
          <AddCard column={column} setCards={setCards} />
        </div>
      </div>
    </>
  );
};

export const ColumnTest = memo(ColumnTestMemo);
