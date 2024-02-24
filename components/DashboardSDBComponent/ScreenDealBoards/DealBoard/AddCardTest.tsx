import { CardType } from "@/types";
import { Dispatch, FormEvent, SetStateAction, memo, useState } from "react";
import { FiPlus } from "react-icons/fi";

const AddCardTestMemo = ({ column, setCards }: { column: string; setCards: Dispatch<SetStateAction<CardType[]>> }) => {
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

  return (
    <>
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
      {/* {adding ? (
        <motion.form layout onSubmit={handleSubmit}>
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
        </motion.form>
      ) : (
        <motion.button
        layout
          onClick={() => setAdding(true)}
          className={`flex w-full items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50`}
        >
          <span>Add card</span>
          <FiPlus />
        </motion.button>
      )} */}
    </>
  );
};

export const AddCardTest = memo(AddCardTestMemo);
