import useStore from "@/store";
import React, { useRef } from "react";
import styles from "./TooltipBlur.module.css";

export const TooltipBlur = () => {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const hoveredItemPosHorizon = useStore((state) => state.hoveredItemPosHorizon);
  const setHoveredItemPosHorizon = useStore((state) => state.setHoveredItemPosHorizon);
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
  let hoveredItemHalfHeight = 0;
  let hoveredItemPositionX = 0;
  let hoveredItemPositionY = 0;
  let hoveredItemDisplay;
  if (hoveredItemPosHorizon) {
    hoveredItemHalfWidth = hoveredItemPosHorizon.itemWidth / 2;
    hoveredItemHalfHeight = hoveredItemPosHorizon.itemHeight / 2;
    hoveredItemWidth = hoveredItemPosHorizon.itemWidth;
    hoveredItemHeight = hoveredItemPosHorizon.itemHeight;
    hoveredItemPositionX = hoveredItemPosHorizon.x;
    hoveredItemPositionY = hoveredItemPosHorizon.y;
    hoveredItemDisplay = hoveredItemPosHorizon.display;
  }

  console.log("🌟Horizonレンダリング");
  return (
    <div
      className={`${styles.tooltip}  ${
        hoveredItemPosHorizon ? `block ${styles.fade}` : "transition-base hidden"
      } bg-[#272727]/[0.7]`}
      style={{
        position: "absolute",
        zIndex: 100,
        left: `${`${hoveredItemWidth + 10}px`}`,
        top: `${`${hoveredItemPositionY + hoveredItemHalfHeight}px`}`,
      }}
      ref={menuRef}
    >
      <div
        className={`flex-col-center ${styles.dropdown_item}`}
        onClick={() => {
          setHoveredItemPosHorizon(null);
        }}
      >
        <span>{hoveredItemPosHorizon?.content}</span>
        <span>{hoveredItemPosHorizon?.content2}</span>
      </div>
    </div>
  );
};
