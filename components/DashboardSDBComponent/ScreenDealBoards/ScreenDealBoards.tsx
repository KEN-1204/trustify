import { Dispatch, DragEvent, FormEvent, SetStateAction, useEffect, useState } from "react";
import styles from "./ScreenDealBoards.module.css";
import { FaFire } from "react-icons/fa";
import { FiPlus, FiTrash } from "react-icons/fi";
import { DealBoardTest } from "./DealBoard/DealBoardTest";
import { DealBoard } from "./DealBoard/DealBoard";

const DEFAULT_CARDS = Array(11)
  .fill(null)
  .map((_, index) => {
    let columnName = "backlog";
    if (4 < index && index < 8) columnName = "todo";
    if (8 <= index && index <= 9) columnName = "doing";
    if (10 <= index) columnName = "done";
    return { title: `Look into render bug in dashboard ${index}`, id: index.toString(), column: columnName };
  });

export const ScreenDealBoards = () => {
  return (
    <>
      {/* <section className={`${styles.company_table_screen} h-screen w-full bg-neutral-900 text-neutral-50`}> */}
      <section className={`${styles.company_table_screen} transition-bg05 w-full `}>
        {/* <DealBoardTest /> */}
        <DealBoard />
        <DealBoard />
        <DealBoard />
      </section>
    </>
  );
};
