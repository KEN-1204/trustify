import useStore from "@/store";
import React, { FC, useRef } from "react";
import styles from "../LangBtn/LangBtn.module.css";

export const LangMenu: FC = () => {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const language = useStore((state) => state.language);
  const setLanguage = useStore((state) => state.setLanguage);
  const openLangTab = useStore((state) => state.openLangTab);
  const setOpenLangTab = useStore((state) => state.setOpenLangTab);
  const setClickedItemPos = useStore((state) => state.setClickedItemPos);
  const clickedItemPos = useStore((state) => state.clickedItemPos);

  const menuHeight = !!menuRef.current ? menuRef.current?.getBoundingClientRect().height : 0;
  console.log("LangMenu menuHeight", menuHeight, clickedItemPos);
  return (
    <div
      className={`${styles.dropdown_list}  ${
        openLangTab
          ? `absolute left-0 top-[38px] z-10 block min-h-fit w-[108px] rounded-[6px] bg-[#272727]/[0.7] `
          : "hidden"
      }`}
      style={{
        position: "absolute",
        zIndex: 100,
        left: `${clickedItemPos?.x}px`,
        top: `${!!clickedItemPos ? `${clickedItemPos?.y + clickedItemPos?.itemHeight}px` : ``}`,
      }}
      ref={menuRef}
    >
      <div
        className={`flex-center ${styles.dropdown_item}`}
        onClick={() => {
          setLanguage("ja");
          setOpenLangTab(false);
          setClickedItemPos(null);
        }}
      >
        日本語
      </div>
      <div
        className={`flex-center ${styles.dropdown_item}`}
        onClick={() => {
          setLanguage("en");
          setOpenLangTab(false);
          setClickedItemPos(null);
        }}
      >
        English
      </div>
    </div>
  );
};
