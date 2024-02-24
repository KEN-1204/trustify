import { CardType } from "@/types";
import { Dispatch, DragEvent, SetStateAction, memo, useRef, useState } from "react";
import { FaFire } from "react-icons/fa";
import { FiTrash } from "react-icons/fi";
import styles from "./DealBoard.module.css";

const BurnBarrelMemo = ({ setCards }: { setCards: Dispatch<SetStateAction<CardType[]>> }) => {
  // const [active, setActive] = useState(false);
  const trashAreaRef = useRef<HTMLDivElement | null>(null);
  const trashIconRef = useRef<HTMLDivElement | null>(null);
  const burnBarrelIconRef = useRef<HTMLDivElement | null>(null);
  const trashActiveRef = useRef(false);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    // if (active) return console.log("BurnBarrel onDragOverイベント 既にactiveのためリターン");
    if (trashActiveRef.current) return console.log("BurnBarrel onDragOverイベント 既にactiveのためリターン");
    // setActive(true);
    trashActiveRef.current = true;
    trashAreaRef.current?.classList.add(`${styles.active}`);
    if (trashIconRef.current && burnBarrelIconRef.current) {
      trashIconRef.current.style.display = "none";
      burnBarrelIconRef.current.style.display = "block";
    }
    // const iconDom = trashAreaRef.current?.querySelector(`${styles.}`)
    console.log("BurnBarrel onDragOverイベント activeに変更");
  };

  const handleDragLeave = () => {
    // setActive(false);
    trashActiveRef.current = false;
    trashAreaRef.current?.classList.remove(`${styles.active}`);
    if (trashIconRef.current && burnBarrelIconRef.current) {
      trashIconRef.current.style.display = "block";
      burnBarrelIconRef.current.style.display = "none";
    }
    console.log("BurnBarrel onDragLeaveイベント 非activeに変更");
  };

  // onDropイベントの関数
  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    const cardId = e.dataTransfer.getData("cardId");

    setCards((pv) => pv.filter((c) => c.id !== cardId));

    // setActive(false);
    trashActiveRef.current = false;
    trashAreaRef.current?.classList.remove(`${styles.active}`);
    if (trashIconRef.current && burnBarrelIconRef.current) {
      trashIconRef.current.style.display = "block";
      burnBarrelIconRef.current.style.display = "none";
    }
  };

  return (
    <div
      ref={trashAreaRef}
      onDrop={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      // className={`mt-10 grid h-56 w-56 shrink-0 place-content-center rounded border border-solid text-3xl ${
      //   active ? `border-red-800 bg-red-800/20 text-red-500` : `border-neutral-500 bg-neutral-500/20 text-neutral-500`
      // }`}
      className={`${styles.barrel} mt-10 grid h-56 w-56 shrink-0 place-content-center rounded border border-solid text-3xl`}
    >
      {/* {active ? (
        <FaFire className={`animate-bounce`} />
      ) : (
        <FiTrash />
      )} */}
      <div ref={trashIconRef} className={`${styles.trash_icon}`}>
        <FiTrash />
      </div>
      <div ref={burnBarrelIconRef} className={`${styles.fire_icon}`}>
        <FaFire className={`animate-bounce`} />
      </div>
    </div>
  );
};

export const BurnBarrel = memo(BurnBarrelMemo);
