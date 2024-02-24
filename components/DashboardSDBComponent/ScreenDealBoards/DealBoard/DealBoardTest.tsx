import { CardType } from "@/types";
import { memo, useEffect, useState } from "react";
import { ColumnTest } from "./ColumnTest";
import { BurnBarrel } from "./BurnBarel";
import { Column } from "./Column";

const DealBoardTestMemo = () => {
  // const [cards, setCards] = useState<CardType[]>(DEFAULT_CARDS);
  const [cards, setCards] = useState<CardType[]>([]);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    hasChecked && localStorage.setItem("cards", JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    const cardData = localStorage.getItem("cards");

    setCards(cardData ? JSON.parse(cardData) : []);

    setHasChecked(true);
  }, []);

  return (
    <>
      <div className={`flex h-full w-full gap-3 overflow-scroll p-[48px]`}>
        {/* <ColumnTest
          title="Backlog"
          columnName="backlog"
          headingColor="text-neutral-500"
          cards={cards}
          setCards={setCards}
        /> */}
        {/* <Column title="ToDo" columnName="todo" headingColor="text-yellow-200" cards={cards} setCards={setCards} /> */}
        {/* <ColumnTest title="ToDo" column="todo" headingColor="text-yellow-200" cards={cards} setCards={setCards} /> */}
        {/* <ColumnTest title="In progress" columnName="doing" headingColor="text-blue-200" cards={cards} setCards={setCards} /> */}
        {/* <ColumnTest title="Done" columnName="done" headingColor="text-emerald-200" cards={cards} setCards={setCards} /> */}
        <BurnBarrel setCards={setCards} />
      </div>
    </>
  );
};

export const DealBoardTest = memo(DealBoardTestMemo);
