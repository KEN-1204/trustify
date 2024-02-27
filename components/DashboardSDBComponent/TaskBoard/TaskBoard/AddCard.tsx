import { Dispatch, FormEvent, SetStateAction, memo, useState } from "react";
import { FiPlus } from "react-icons/fi";
import styles from "./TaskBoard.module.css";

type CardType = { id: string; taskTitle: string; contents: string | null; columnTitle: string };

type Props = {
  setCards: Dispatch<SetStateAction<CardType[]>>;
  columnTitle: string;
};

const AddCardMemo = ({ setCards, columnTitle }: Props) => {
  const [taskTitle, setTaskTitle] = useState("");
  const [adding, setAdding] = useState(false);

  const handleSubmit = ({ e, columnTitle }: { e: FormEvent; columnTitle: string }) => {
    e.preventDefault();

    if (!taskTitle.trim().length) return setAdding(false);

    const newCard = {
      id: Math.random().toString(),
      taskTitle: taskTitle.trim(),
      contents: null,
      columnTitle: columnTitle,
    };

    setCards((pv) => [...pv, newCard]);

    setTaskTitle("");
    setAdding(false);
  };

  return (
    <>
      {adding ? (
        <form onSubmit={(e) => handleSubmit({ e: e, columnTitle: columnTitle })}>
          <textarea
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            autoFocus
            placeholder="Add new task..."
            className={`${styles.add_textarea}`}
          />
          <div className={`mt-1.5 flex items-center justify-end gap-1.5`}>
            <button
              onClick={() => {
                setAdding(false);
                setTaskTitle("");
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
          className={`${styles.add_btn} flex w-full items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50`}
        >
          <span>Add card</span>
          <FiPlus />
        </button>
      )}
    </>
  );
};

export const AddCard = memo(AddCardMemo);
