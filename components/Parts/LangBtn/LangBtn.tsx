import useStore from "@/store";
import React, { FC, memo } from "react";
import styles from "./LangBtn.module.css";
import { MdOutlineLanguage } from "react-icons/md";
import Image from "next/image";
import { AiFillCaretDown } from "react-icons/ai";

// type Prop = {
//   openLangTab: boolean;
//   setOpenLangTab: (payload: boolean) => void;
// };

export const LangBtnMemo: FC = () => {
  console.log("クリック");
  const language = useStore((state) => state.language);
  // const setLanguage = useStore((state) => state.setLanguage);
  const openLangTab = useStore((state) => state.openLangTab);
  const setOpenLangTab = useStore((state) => state.setOpenLangTab);
  const setClickedItemPos = useStore((state) => state.setClickedItemPos);
  return (
    <>
      <button
        className={`${styles.language_btn} ${styles.btn_common}`}
        onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
          if (openLangTab) {
            setOpenLangTab(false);
            setClickedItemPos(null);
            return;
          }
          setOpenLangTab(true);
          // クリック位置をStateに格納
          const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
          console.log(x, y);
          setClickedItemPos({ x: x, y: y, itemWidth: width, itemHeight: height });
        }}
      >
        <MdOutlineLanguage className="mr-[5px] mt-[-1px] text-[20px]" />
        {language === "Ja" && "日本語"}
        {language === "En" && "English"}
        {/* <Image src={DownIcon} alt="" /> */}
        <AiFillCaretDown />
        {/* <div
          className={`${styles.dropdown_list}  ${
            openLangTab
              ? `absolute left-0 top-[38px] z-10 block min-h-fit w-[108px] rounded-[6px] bg-[#272727]/[0.7] `
              : "hidden"
          }`}
        >
          <div
            className={`flex-center ${styles.dropdown_item}`}
            onClick={() => {
              setLanguage("Ja");
              setOpenLangTab(false);
              setClickedItemPos(null);
            }}
          >
            日本語
          </div>
          <div
            className={`flex-center ${styles.dropdown_item}`}
            onClick={() => {
              setLanguage("En");
              setOpenLangTab(false);
              setClickedItemPos(null);
            }}
          >
            English
          </div>
        </div> */}
      </button>
    </>
  );
};

export const LangBtn = memo(LangBtnMemo);
