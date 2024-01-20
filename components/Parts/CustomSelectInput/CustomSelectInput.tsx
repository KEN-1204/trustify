import React, { useState, useRef, useEffect } from "react";
import styles from "./CustomSelectInput.module.css";
import { HiChevronDown } from "react-icons/hi2";

type Props = { options: any[]; inputStyle?: any; displayX?: string };

export const CustomSelectInput = ({ options, inputStyle, displayX = "left" }: Props) => {
  const [value, setValue] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const selectRef = useRef<HTMLDivElement | null>(null);

  //   const options = ["Option 1", "Option 2", "Option 3"]; // 選択肢

  const handleSelect = (option: any) => {
    setValue(option);
    setShowOptions(false);
  };

  // クリックイベントを監視し、selectタグの外側がクリックされた場合は選択肢を非表示にする
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectRef]);

  return (
    <div className={`${inputStyle} ${styles.input_box}`} ref={selectRef} onMouseDown={(e) => console.log(e)}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Select an option"
        className={``}
      />
      {/* <div className={`${styles.select_arrow}`} onClick={() => setShowOptions(!showOptions)}>
        ▼
      </div> */}
      <div
        className={`flex-center min-h-[20px] min-w-[20px] cursor-pointer rounded-full hover:bg-[var(--color-bg-sub-icon)]`}
        onClick={() => setShowOptions(!showOptions)}
      >
        <HiChevronDown className="stroke-[1] text-[13px] text-[var(--color-text-brand-f)]" />
      </div>
      {showOptions && (
        <ul
          className={`${styles.options}`}
          style={{
            ...(displayX === "left" && { left: "0" }),
            ...(displayX === "center" && { left: "-50%" }),
            ...(displayX === "right" && { right: "0" }),
          }}
        >
          {options.map((option, index) => (
            <li key={index} onClick={() => handleSelect(option)} className="min-w-max truncate">
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
