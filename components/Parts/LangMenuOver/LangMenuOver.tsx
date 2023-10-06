import useStore from "@/store";
import React, { FC, useEffect, useRef, useState } from "react";
import styles from "../LangBtn/LangBtn.module.css";

export const LangMenuOver = () => {
  const setLanguage = useStore((state) => state.setLanguage);
  const openLangTab = useStore((state) => state.openLangTab);
  const setOpenLangTab = useStore((state) => state.setOpenLangTab);
  const clickedItemPosOver = useStore((state) => state.clickedItemPosOver);
  const setClickedItemPosOver = useStore((state) => state.setClickedItemPosOver);

  console.log("LangMenuOver menuHeight", 98, clickedItemPosOver);

  return (
    <div
      className={`${styles.dropdown_list}  ${
        openLangTab ? `absolute  block min-h-fit w-[108px] rounded-[6px] bg-[#272727]/[0.7] ` : "hidden"
      }`}
      style={{
        position: "absolute",
        zIndex: 100,
        // left: `${clickedItemPosOver?.x}px`,
        // top: `${!!clickedItemPosOver ? `${clickedItemPosOver?.y - 98}px` : ``}`,
        left: `${(119 - 108) / 2}px`,
        top: `-98px`,
        // left: `${clickedItemPosOver?.x}px`,
        // top: `${!!clickedItemPosOver ? `${clickedItemPosOver?.y + clickedItemPosOver?.itemHeight}px` : ``}`,
      }}
    >
      <div
        className={`flex-center ${styles.dropdown_item}`}
        onClick={() => {
          setLanguage("Ja");
          setOpenLangTab(false);
          setClickedItemPosOver(null);
        }}
      >
        日本語
      </div>
      <div
        className={`flex-center ${styles.dropdown_item}`}
        onClick={() => {
          setLanguage("En");
          setOpenLangTab(false);
          setClickedItemPosOver(null);
        }}
      >
        English
      </div>
    </div>
  );
};
