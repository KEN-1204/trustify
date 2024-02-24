import { CardType } from "@/types";
import { DragEvent, memo } from "react";
import { DropIndicator } from "./DropIndicator";
import styles from "./DealBoard.module.css";

const CardMemo = ({
  card,
  handleDragStart,
}: {
  card: CardType;
  handleDragStart: (e: DragEvent<HTMLDivElement>, card: CardType) => void;
}) => {
  const { id, title, column } = card;
  return (
    <>
      {/* <DropIndicator beforeId={id} column={column} /> */}
      <div
        data-before={id}
        data-column={column}
        className={`${styles.drop_indicator} my-0.5 h-0.5 w-full bg-violet-400 opacity-0`}
      />
      <div
        draggable="true"
        onDragStart={(e) => handleDragStart(e, { title, id, column })}
        className={`cursor-grab rounded border border-solid border-neutral-700 bg-neutral-800 p-3 active:cursor-grabbing`}
      >
        <p className={`whitespace-pre-wrap text-sm text-neutral-100`}>{title}</p>
      </div>
      {/* <motion.div
      layout
      layoutId={id}
        draggable="true"
        onDragStart={(e) => handleDragStart(e, card)}
        className={`cursor-grab rounded border border-solid border-neutral-700 bg-neutral-800 p-3 active:cursor-grabbing`}
      >
        <p className={`text-sm text-neutral-100`}>{title}</p>
      </motion.div> */}
    </>
  );
};

export const Card = memo(CardMemo);
