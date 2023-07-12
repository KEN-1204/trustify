import useStore from "@/store";
import useDashboardStore from "@/store/useDashboardStore";
import React, { FC, useRef } from "react";
import styles from "./ChangeSizeMenu.module.css";

export const ChangeSizeMenu: FC = () => {
  const menuRef = useRef<HTMLDivElement | null>(null);
  //   const tableContainerSize = useDashboardStore((state) => state.tableContainerSize);
  const setTableContainerSize = useDashboardStore((state) => state.setTableContainerSize);
  const isOpenChangeSizeMenu = useDashboardStore((state) => state.isOpenChangeSizeMenu);
  const setIsOpenChangeSizeMenu = useDashboardStore((state) => state.setIsOpenChangeSizeMenu);
  const setClickedItemPos = useStore((state) => state.setClickedItemPos);
  const clickedItemPos = useStore((state) => state.clickedItemPos);

  const menuHeight = !!menuRef.current ? menuRef.current?.getBoundingClientRect().height : 0;
  console.log("LangMenu menuHeight", menuHeight, clickedItemPos);
  return (
    <div
      className={`${styles.dropdown_list}  ${
        isOpenChangeSizeMenu
          ? `absolute left-0 top-[38px] z-10 block min-h-fit w-[108px] rounded-[4px] bg-[#272727]/[0.7] text-[14px]`
          : "hidden"
      }`}
      style={{
        position: "absolute",
        zIndex: 1000,
        left: `${clickedItemPos?.x}px`,
        top: `${!!clickedItemPos ? `${clickedItemPos?.y + clickedItemPos?.itemHeight}px` : ``}`,
      }}
      ref={menuRef}
    >
      <div
        className={`flex-center ${styles.dropdown_item}`}
        onClick={() => {
          setTableContainerSize("all");
          setIsOpenChangeSizeMenu(false);
          setClickedItemPos(null);
        }}
      >
        ラージ
      </div>
      <div
        className={`flex-center ${styles.dropdown_item}`}
        onClick={() => {
          setTableContainerSize("half");
          setIsOpenChangeSizeMenu(false);
          setClickedItemPos(null);
        }}
      >
        ミディアム
      </div>
      <div
        className={`flex-center ${styles.dropdown_item}`}
        onClick={() => {
          setTableContainerSize("one_third");
          setIsOpenChangeSizeMenu(false);
          setClickedItemPos(null);
        }}
      >
        スモール
      </div>
    </div>
  );
};
