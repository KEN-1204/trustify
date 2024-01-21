import React, { useState, useRef, useEffect, Dispatch, SetStateAction } from "react";
import styles from "./CustomSelectInput.module.css";
import { HiChevronDown } from "react-icons/hi2";

type Props = {
  state: any;
  dispatch: Dispatch<SetStateAction<any>>;
  changeEventHandler?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  blurEventHandler?: (e: React.FocusEvent<HTMLInputElement, Element>) => void;
  options: any[];
  defaultValue?: any;
  inputStyle?: any;
  displayX?: string;
  autoFucus?: boolean;
};

export const CustomSelectInput = ({
  state,
  dispatch,
  options,
  defaultValue = "",
  inputStyle,
  displayX = "center",
  autoFucus = false,
  changeEventHandler,
  blurEventHandler,
}: Props) => {
  // const [value, setValue] = useState(defaultValue ? defaultValue : "");
  const [showOptions, setShowOptions] = useState(false);
  const [optionsPosition, setOptionsPosition] = useState("bottom");
  // const [firstMount, setFirstMount] = useState(true);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const selectRef = useRef<HTMLDivElement | null>(null);
  const optionsRef = useRef<HTMLUListElement | null>(null);

  //   const options = ["Option 1", "Option 2", "Option 3"]; // 選択肢

  // デフォルトバリュー
  useEffect(() => {
    if (!defaultValue) return;

    dispatch(defaultValue);
  }, []);

  const handleSelect = (option: any) => {
    // setValue(option);
    dispatch(option);
    setShowOptions(false);
    inputRef.current?.focus();
  };

  // const handleArrowClick = () => {
  //   setShowOptions(!showOptions);
  // };

  // オプションがレンダリングした時にオプションの最大高さを取得して、画面下をはみ出していれば上側に表示
  useEffect(() => {
    // if (!firstMount) return;
    if (showOptions && optionsRef.current && inputRef.current) {
      // setFirstMount(false);
      // ウィンドウの高さとオプションリストの位置を計算
      const optionsRect = optionsRef.current.getBoundingClientRect();
      const inputRect = inputRef.current.getBoundingClientRect();
      // const spaceBelow = window.innerHeight - optionsRect.bottom;
      const spaceBelow = window.innerHeight - inputRect.bottom;
      const spaceAbove = optionsRect.top;

      // 下に十分なスペースがない場合は上に表示
      if (spaceBelow < optionsRect.height && spaceAbove > optionsRect.height) {
        setOptionsPosition("top");
      } else {
        setOptionsPosition("bottom");
      }
    }
  }, [showOptions]); // showOptionsが変更された時に実行

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
        ref={inputRef}
        type="text"
        autoFocus={autoFucus}
        // value={value}
        // onChange={(e) => setValue(e.target.value)}
        value={state}
        // onChange={(e) => dispatch(e.target.value)}
        // onChange={changeEventHandler ? changeEventHandler : undefined}
        onChange={changeEventHandler ? changeEventHandler : (e) => dispatch(e.target.value)}
        onBlur={blurEventHandler ? blurEventHandler : undefined}
        placeholder=""
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
          ref={optionsRef}
          className={`${styles.options} ${
            optionsPosition === "top" ? `${styles.display_top}` : ``
          } border-real-with-shadow-dark`}
          style={{
            ...(displayX === "left" && { left: "0" }),
            ...(displayX === "center" && { left: "50%", transform: "translateX(-50%)" }),
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
