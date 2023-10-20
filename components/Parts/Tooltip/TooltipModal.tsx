import useStore from "@/store";
import React, { FC, useEffect, useRef } from "react";
import styles from "./TooltipModal.module.css";

export const TooltipModal: FC = () => {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const hoveredItemPosModal = useStore((state) => state.hoveredItemPosModal);
  const setHoveredItemPosModal = useStore((state) => state.setHoveredItemPosModal);
  //   const rect = menuRef.current?.getBoundingClientRect();
  //   console.log("🌟Tooltip rect", rect);

  //   const tooltipHalfWidthRef = useRef(0);
  //   const tooltipWidthRef = useRef(0);

  //   useEffect(() => {
  //     if (rect) {
  //       console.log("🌟Tooltip rect", rect);
  //       tooltipHalfWidthRef.current = rect.width / 2;
  //       tooltipWidthRef.current = rect.width;
  //     }
  //   }, [rect]);

  let hoveredItemHalfWidth = 0;
  let hoveredItemWidth = 0;
  let hoveredItemHeight = 0;
  let hoveredItemPositionX = 0;
  let hoveredItemPositionY = 0;
  let hoveredItemDisplay;
  if (hoveredItemPosModal) {
    hoveredItemHalfWidth = hoveredItemPosModal.itemWidth / 2;
    hoveredItemWidth = hoveredItemPosModal.itemWidth;
    hoveredItemHeight = hoveredItemPosModal.itemHeight;
    hoveredItemPositionX = hoveredItemPosModal.x;
    hoveredItemPositionY = hoveredItemPosModal.y;
    hoveredItemDisplay = hoveredItemPosModal.display;
  }

  console.log("Tooltipコンポーネントレンダリング", hoveredItemPosModal);

  // console.log(window.innerWidth);
  // 左寄りのアイテムに対して右に表示するツールチップ
  if (hoveredItemDisplay === "top") {
    return (
      <div
        className={`${styles.tooltip_over} ${hoveredItemPosModal ? `block ${styles.fade}` : "transition-base hidden"}`}
        style={{
          position: "absolute",
          // zIndex: 100,
          zIndex: 10000,
          left: `${`${hoveredItemPositionX + hoveredItemHalfWidth}px`}`,
          top: `${`${hoveredItemPositionY - hoveredItemHeight - 8}px`}`,
        }}
        ref={menuRef}
      >
        <div
          className={`flex-col-center ${styles.dropdown_item}`}
          onClick={() => {
            setHoveredItemPosModal(null);
          }}
        >
          <span>{hoveredItemPosModal?.content}</span>
          <span>{hoveredItemPosModal?.content2}</span>
          {hoveredItemPosModal?.content3 && <span>{hoveredItemPosModal?.content3}</span>}
        </div>
      </div>
    );
  }

  // 左寄りのアイテムに対して右に表示するツールチップ
  if (hoveredItemDisplay === "left") {
    return (
      <div
        className={`${styles.tooltip_left}  ${hoveredItemPosModal ? `block ${styles.fade}` : "transition-base hidden"}`}
        style={{
          position: "absolute",
          // zIndex: 100,
          zIndex: 10000,
          left: `${`${hoveredItemPositionX}px`}`,
          top: `${`${hoveredItemPositionY + hoveredItemHeight + 10}px`}`,
        }}
        ref={menuRef}
      >
        <div
          className={`flex-center ${styles.dropdown_item}`}
          onClick={() => {
            setHoveredItemPosModal(null);
          }}
        >
          {hoveredItemPosModal?.content}
        </div>
      </div>
    );
  }

  // 真ん中で表示
  return (
    <div
      className={`${styles.tooltip}  ${hoveredItemPosModal ? `block ${styles.fade}` : "transition-base hidden"}`}
      style={{
        position: "absolute",
        // zIndex: 100,
        zIndex: 10000,
        left: `${`${hoveredItemPositionX + hoveredItemHalfWidth}px`}`,
        top: `${`${hoveredItemPositionY + hoveredItemHeight + 10}px`}`,
      }}
      ref={menuRef}
    >
      <div
        className={`flex-col-center ${styles.dropdown_item}`}
        onClick={() => {
          setHoveredItemPosModal(null);
        }}
      >
        <span>{hoveredItemPosModal?.content}</span>
        <span>{hoveredItemPosModal?.content2}</span>
        {hoveredItemPosModal?.content3 && <span>{hoveredItemPosModal?.content3}</span>}
      </div>
    </div>
  );
};
