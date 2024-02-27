import styles from "./ScreenTaskBoards.module.css";
import { TaskBoard } from "./TaskBoard/TaskBoard";

export const ScreenTaskBoards = () => {
  return (
    <>
      <section className={`${styles.company_table_screen} w-full bg-neutral-900 text-neutral-50`}>
        <TaskBoard />
      </section>
    </>
  );
};
