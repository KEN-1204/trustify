import useStore from "@/store";
import React, { useEffect, useRef } from "react";
import styles from "./Tooltip.module.css";

export const Tooltip = () => {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const hoveredItemPos = useStore((state) => state.hoveredItemPos);
  const setHoveredItemPos = useStore((state) => state.setHoveredItemPos);
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
  let textLengthNum = 0;
  if (hoveredItemPos) {
    hoveredItemHalfWidth = hoveredItemPos.itemWidth / 2;
    hoveredItemWidth = hoveredItemPos.itemWidth;
    hoveredItemHeight = hoveredItemPos.itemHeight;
    hoveredItemPositionX = hoveredItemPos.x;
    hoveredItemPositionY = hoveredItemPos.y;
    hoveredItemDisplay = hoveredItemPos.display;
    textLengthNum = hoveredItemPos.textLength ? hoveredItemPos.textLength : 0;
  }

  console.log("Tooltipコンポーネントレンダリング", hoveredItemPos?.content2, hoveredItemPos?.itemsPosition);

  if (hoveredItemDisplay === "top") {
    return (
      <div
        className={`${styles.tooltip_area} ${hoveredItemPos ? `block ${styles.fade}` : "transition-base hidden"}`}
        style={{
          position: "absolute",
          zIndex: 100,
          left: `${`${hoveredItemPositionX + hoveredItemHalfWidth}px`}`,
          top: `${`${hoveredItemPositionY - hoveredItemHeight - 8 - (hoveredItemPos?.marginTop ?? 0)}px`}`,
          ...(!!hoveredItemPos?.maxWidth && { maxWidth: hoveredItemPos.maxWidth }),
        }}
        ref={menuRef}
      >
        <div className={`${styles.tooltip_over}`}>
          <div
            className={`flex flex-col ${
              hoveredItemPos?.itemsPosition === "center" ? `items-center` : "items-start"
            } justify-center ${styles.dropdown_item}`}
            onClick={() => {
              setHoveredItemPos(null);
            }}
          >
            <span>{hoveredItemPos?.content}</span>
            {!!hoveredItemPos?.content2 && <span>{hoveredItemPos.content2}</span>}
            {hoveredItemPos?.content3 && <span>{hoveredItemPos?.content3}</span>}
          </div>
        </div>
        <div className={`${styles.tooltip_arrow_over}`}></div>
      </div>
    );
    // return (
    //   <div
    //     className={`${styles.tooltip_over} ${hoveredItemPos ? `block ${styles.fade}` : "transition-base hidden"}`}
    //     style={{
    //       position: "absolute",
    //       zIndex: 100,
    //       left: `${`${hoveredItemPositionX + hoveredItemHalfWidth}px`}`,
    //       top: `${`${hoveredItemPositionY - hoveredItemHeight - 8}px`}`,
    //     }}
    //     ref={menuRef}
    //   >
    //     <div
    //       className={`flex-col-center ${styles.dropdown_item}`}
    //       onClick={() => {
    //         setHoveredItemPos(null);
    //       }}
    //     >
    //       <span>{hoveredItemPos?.content}</span>
    //       <span>{hoveredItemPos?.content2}</span>
    //       {hoveredItemPos?.content3 && <span>{hoveredItemPos?.content3}</span>}
    //     </div>
    //   </div>
    // );
  }

  // 左寄りのアイテムに対して右に表示するツールチップ
  if (hoveredItemDisplay === "left") {
    return (
      <div
        className={`${styles.tooltip_area}  ${hoveredItemPos ? `block ${styles.fade}` : "transition-base hidden"}`}
        style={{
          position: "absolute",
          zIndex: 100,
          left: `${`${hoveredItemPositionX}px`}`,
          top: `${`${hoveredItemPositionY + hoveredItemHeight + 10}px`}`,
        }}
        ref={menuRef}
      >
        <div className={`${styles.tooltip_left}`}>
          <div
            className={`flex-center ${styles.dropdown_item}`}
            onClick={() => {
              setHoveredItemPos(null);
            }}
          >
            {hoveredItemPos?.content}
          </div>
        </div>
        <div className={`${styles.tooltip_arrow_left}`}></div>
      </div>
    );
    // return (
    //   <div
    //     className={`${styles.tooltip_left}  ${hoveredItemPos ? `block ${styles.fade}` : "transition-base hidden"}`}
    //     style={{
    //       position: "absolute",
    //       zIndex: 100,
    //       left: `${`${hoveredItemPositionX}px`}`,
    //       top: `${`${hoveredItemPositionY + hoveredItemHeight + 10}px`}`,
    //     }}
    //     ref={menuRef}
    //   >
    //     <div
    //       className={`flex-center ${styles.dropdown_item}`}
    //       onClick={() => {
    //         setHoveredItemPos(null);
    //       }}
    //     >
    //       {hoveredItemPos?.content}
    //     </div>
    //   </div>
    // );
  }
  // 右寄りのアイテムに対して左に表示するツールチップ 12はfont-size * 文字数 + padding10 * 2左右
  if (hoveredItemDisplay === "right") {
    return (
      <div
        // className={`${styles.tooltip_right}  ${hoveredItemPos ? `block ${styles.fade}` : "transition-base hidden"}`}
        className={`${styles.tooltip_area}  ${hoveredItemPos ? `block ${styles.fade}` : "transition-base hidden"}`}
        style={{
          position: "absolute",
          zIndex: 100,
          left: `${`${hoveredItemPositionX - 12 * textLengthNum + 10 * 2}px`}`,
          top: `${`${hoveredItemPositionY + hoveredItemHeight + 10}px`}`,
        }}
        ref={menuRef}
      >
        <div className={`${styles.tooltip_right}`}>
          <div
            className={`flex-center ${styles.dropdown_item}`}
            onClick={() => {
              setHoveredItemPos(null);
            }}
          >
            {hoveredItemPos?.content}
          </div>
        </div>
        <div className={`${styles.tooltip_arrow_right}`}></div>
      </div>
    );
  }

  // 真ん中で表示
  return (
    <div
      className={`${styles.tooltip_area}  ${hoveredItemPos ? `block ${styles.fade}` : "transition-base hidden"}`}
      // className={`${styles.tooltip}  ${hoveredItemPos ? `block ${styles.fade}` : "transition-base hidden"}`}
      style={{
        position: "absolute",
        zIndex: 100,
        left: `${`${hoveredItemPositionX + hoveredItemHalfWidth}px`}`,
        top: `${`${hoveredItemPositionY + hoveredItemHeight + 10}px`}`,
      }}
      ref={menuRef}
    >
      <div className={`${styles.tooltip}`}>
        <div
          className={`flex flex-col ${
            hoveredItemPos?.itemsPosition === "start" ? `items-start` : "items-center"
          } justify-center ${styles.dropdown_item}`}
          onClick={() => {
            setHoveredItemPos(null);
          }}
          style={{ ...(!!hoveredItemPos?.maxWidth && { maxWidth: hoveredItemPos.maxWidth }) }}
        >
          <span style={{ ...(!!hoveredItemPos?.whiteSpace && { whiteSpace: hoveredItemPos.whiteSpace }) }}>
            {hoveredItemPos?.content}
          </span>
          <span>{hoveredItemPos?.content2}</span>
          {hoveredItemPos?.content3 && <span>{hoveredItemPos?.content3}</span>}
        </div>
      </div>
      <div className={`${styles.tooltip_arrow}`}></div>
    </div>
  );
};
