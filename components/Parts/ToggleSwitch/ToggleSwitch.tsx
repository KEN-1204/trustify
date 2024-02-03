import { Dispatch, SetStateAction, memo } from "react";
import styles from "./ToggleSwitch.module.css";

type Props = { state: boolean; dispatch: Dispatch<SetStateAction<boolean>>; customFunction?: () => void };

const ToggleSwitchMemo = ({ state, dispatch, customFunction }: Props) => {
  return (
    // <label className={styles.toggle_switch} style={{ width: "56px", height: "28px" }}>
    <label className={styles.toggle_switch}>
      <input
        type="checkbox"
        checked={state}
        onChange={() => {
          dispatch(!state);
          if (customFunction) {
            customFunction();
          }
        }}
      />
      <div className={styles.toggle_switch_background}>
        <div className={styles.toggle_switch_handle}></div>
      </div>
    </label>
  );
};

export const ToggleSwitch = memo(ToggleSwitchMemo);
