import useStore from "@/store";
import React, { FC, memo, useEffect, useRef } from "react";
import styles from "./TooltipSideTable.module.css";

const TooltipSideTableMemo = () => {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const arrowRef = useRef<HTMLDivElement | null>(null);
  const tooltipItemRef = useRef<HTMLDivElement | null>(null);
  const hoveredItemPosSideTable = useStore((state) => state.hoveredItemPosSideTable);
  const setHoveredItemPosSideTable = useStore((state) => state.setHoveredItemPosSideTable);
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
  let hoveredItemDisplay: string | undefined;
  if (hoveredItemPosSideTable) {
    hoveredItemHalfWidth = hoveredItemPosSideTable.itemWidth / 2;
    hoveredItemWidth = hoveredItemPosSideTable.itemWidth;
    hoveredItemHeight = hoveredItemPosSideTable.itemHeight;
    hoveredItemPositionX = hoveredItemPosSideTable.x;
    hoveredItemPositionY = hoveredItemPosSideTable.y;
    hoveredItemDisplay = hoveredItemPosSideTable.display;
  }

  // useEffectフックを使ってツールチップの幅を取得して、画面端20pxの位置に表示
  useEffect(() => {
    // 最初から左か右に矢印を配置する場合は計算不要
    if (
      (!!hoveredItemDisplay && hoveredItemDisplay === "left") ||
      hoveredItemDisplay === "right" ||
      hoveredItemDisplay === "right-top"
    )
      return;

    if (menuRef.current) {
      const tooltipWidth = menuRef.current.offsetWidth;
      // const tooltipRectWidth = menuRef.current.getBoundingClientRect().width;
      console.log("tooltipOffsetWidth,", tooltipWidth);
      const tooltipHalfWidth = tooltipWidth / 2;
      const viewportWidth = hoveredItemPosSideTable?.containerWidth
        ? hoveredItemPosSideTable.containerWidth
        : window.innerWidth;
      const viewportRightOneThird = (viewportWidth / 3) * 2; // 画面3分の2の幅
      const viewportRightHalf = viewportWidth / 2; // 画面2分の1の幅
      const viewportRightOneFifth = (viewportWidth / 5) * 4; // 画面5分の4の幅
      const leftPosition = hoveredItemPositionX + hoveredItemHalfWidth;
      // const leftPosition = hoveredItemPositionX + tooltipWidth;
      let adjustedLeft = leftPosition;

      // 画面右端を超えている場合、位置を左に調整 右に10px余白を設けた位置にツールチップを表示
      if (leftPosition + tooltipHalfWidth > viewportWidth - 10) {
        adjustedLeft = viewportWidth - tooltipHalfWidth - 10 - 10; // 20pxの余白を残す
        const addWidth = viewportWidth - 10 - adjustedLeft - tooltipHalfWidth;

        menuRef.current.style.width = `${tooltipWidth + addWidth}px`;
        menuRef.current.style.overflowWrap = "normal";
        // 超えている場合は矢印を消去
        if (arrowRef.current) arrowRef.current.style.opacity = "0";
        if (arrowRef.current) arrowRef.current.style.display = "hidden";
      } else {
        // 画面右端を超えていないなら、画面左3分の2の位置よりも右の位置にある場合はnowrapにする
        if (adjustedLeft > viewportRightHalf) {
          const tooltipText = menuRef.current.querySelector(`.tooltip_text`);
          const tooltipTextWidth = tooltipText?.getBoundingClientRect().width;
          console.log("tooltipWidth", tooltipWidth, "tooltipTextWidth", tooltipTextWidth, "tooltipText", tooltipText);
          // menuRef.current.style.minWidth = `${tooltipWidth}px`;
          menuRef.current.style.minWidth = `max-content`;
          // テスト
          // menuRef.current.style.whiteSpace = "nowrap";
          // if (tooltipWidth + hoveredItemPositionX > viewportWidth) {
          // }
          // if (!!tooltipTextWidth && tooltipTextWidth - 20 >= tooltipWidth) {
          //   console.log("こっち１");
          //   menuRef.current.style.whiteSpace = "nowrap";
          // } else {
          //   menuRef.current.style.whiteSpace = "nowrap";
          //   console.log("こっち２");
          // }
        }
      }

      // 画面左端を超えている場合、位置を右に調整
      if (leftPosition < 0) {
        adjustedLeft = 10; // 10pxの余白を残す
      }

      // スタイルを更新
      adjustedLeft = adjustedLeft - tooltipHalfWidth;
      menuRef.current.style.left = `${adjustedLeft}px`;

      if (hoveredItemPosSideTable?.maxWidth && tooltipItemRef.current) {
        tooltipItemRef.current.style.width = `${hoveredItemPosSideTable.maxWidth}px`;
        tooltipItemRef.current.style.maxWidth = `${hoveredItemPosSideTable.maxWidth}px`;
      }
    }
  }, [hoveredItemPositionX, hoveredItemPositionY, hoveredItemHalfWidth, hoveredItemDisplay]);

  // 0は許容し、それ以外のfalsyはリターン
  if (
    hoveredItemPosSideTable?.content === "" ||
    hoveredItemPosSideTable?.content === null ||
    typeof hoveredItemPosSideTable?.content === "undefined"
  ) {
    return;
  }

  console.log("🌟hoveredItemPosSideTable?.maxWidth", hoveredItemPosSideTable?.maxWidth);

  // console.log(hoveredItemPosSideTable?.containerWidth);
  // 左寄りのアイテムに対して右に表示するツールチップ
  if (hoveredItemDisplay === "top") {
    return (
      <div
        className={`${styles.tooltip_area} ${styles.fade} ${hoveredItemPosSideTable ? `block ` : "hidden"}`}
        style={{
          position: "absolute",
          // backgroundColor: "#fff",
          // position: "fixed",
          zIndex: 20000,
          // left: `${`${hoveredItemPositionX + hoveredItemHalfWidth}px`}`,
          top: `${`${hoveredItemPositionY - hoveredItemHeight - 8 - (hoveredItemPosSideTable?.marginTop ?? 0)}px`}`,
        }}
        ref={menuRef}
      >
        <div className={`${styles.tooltip_over}`}>
          <div
            style={{
              ...(!!hoveredItemPosSideTable?.maxWidth && {
                maxWidth: `${hoveredItemPosSideTable.maxWidth}px`,
              }),
            }}
            className={`flex flex-col ${
              hoveredItemPosSideTable?.itemsPosition === "center" ? `items-center` : "items-start"
            } justify-center ${styles.dropdown_item}`}
            // style={{ ...(hoveredItemPosSideTable?.whiteSpace && { whiteSpace: hoveredItemPosSideTable?.whiteSpace }) }}
            onClick={() => {
              setHoveredItemPosSideTable(null);
            }}
          >
            <span>{hoveredItemPosSideTable?.content}</span>
            <span>{hoveredItemPosSideTable?.content2}</span>
            {hoveredItemPosSideTable?.content3 && <span>{hoveredItemPosSideTable?.content3}</span>}
            {hoveredItemPosSideTable?.content4 && <span>{hoveredItemPosSideTable?.content4}</span>}
          </div>
        </div>
        <div ref={arrowRef} className={`${styles.tooltip_arrow_over}`}></div>
      </div>
    );
    // return (
    //   <div
    //     className={`${styles.tooltip_over} ${hoveredItemPosSideTable ? `block ${styles.fade}` : "transition-base hidden"}`}
    //     style={{
    //       position: "absolute",

    //       zIndex: 10000,
    //       left: `${`${hoveredItemPositionX + hoveredItemHalfWidth}px`}`,
    //       top: `${`${hoveredItemPositionY - hoveredItemHeight - 8}px`}`,
    //     }}
    //     ref={menuRef}
    //   >
    //     <div
    //       className={`flex-col-center ${styles.dropdown_item}`}
    //       onClick={() => {
    //         setHoveredItemPosSideTable(null);
    //       }}
    //     >
    //       <span>{hoveredItemPosSideTable?.content}</span>
    //       <span>{hoveredItemPosSideTable?.content2}</span>
    //       {hoveredItemPosSideTable?.content3 && <span>{hoveredItemPosSideTable?.content3}</span>}
    //     </div>
    //   </div>
    // );
  }

  // 左寄りのアイテムに対して右に表示するツールチップ
  if (hoveredItemDisplay === "left") {
    return (
      <div
        className={`${styles.tooltip_left}  ${
          hoveredItemPosSideTable ? `block ${styles.fade}` : "transition-base hidden"
        }`}
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
            setHoveredItemPosSideTable(null);
          }}
        >
          {hoveredItemPosSideTable?.content}
        </div>
      </div>
    );
  }

  // 真ん中で表示
  // return (
  //   <div
  //     className={`${styles.tooltip_area}  ${hoveredItemPosSideTable ? `block ${styles.fade}` : "transition-base hidden"}`}
  //     // className={`${styles.tooltip}  ${hoveredItemPos ? `block ${styles.fade}` : "transition-base hidden"}`}
  //     style={{
  //       position: "absolute",
  //       zIndex: 10000,
  //       left: `${`${hoveredItemPositionX + hoveredItemHalfWidth}px`}`,
  //       top: `${`${hoveredItemPositionY + hoveredItemHeight + 10}px`}`,
  //     }}
  //     ref={menuRef}
  //   >
  //     <div className={`${styles.tooltip}`}>
  //       <div
  //         className={`flex-col-center ${styles.dropdown_item}`}
  //         onClick={() => {
  //           setHoveredItemPosSideTable(null);
  //         }}
  //       >
  //         <span>{hoveredItemPosSideTable?.content}</span>
  //         <span>{hoveredItemPosSideTable?.content2}</span>
  //         {hoveredItemPosSideTable?.content3 && <span>{hoveredItemPosSideTable?.content3}</span>}
  //       </div>
  //     </div>
  //     <div className={`${styles.tooltip_arrow}`}></div>
  //   </div>
  // );
  return (
    <div
      className={`${styles.tooltip_area} ${styles.fade} ${hoveredItemPosSideTable ? `block` : "hidden"}`}
      style={{
        position: "absolute",
        backgroundColor: "#fff",
        zIndex: 20000,
        // left: `${`${hoveredItemPositionX + hoveredItemHalfWidth}px`}`,
        top: `${`${hoveredItemPositionY + hoveredItemHeight + 10}px`}`,
        // ...(!!hoveredItemPosSideTable?.maxWidth && { maxWidth: `${hoveredItemPosSideTable.maxWidth}px` }),
      }}
      ref={menuRef}
    >
      <div className={`${styles.tooltip}`}>
        <div
          ref={tooltipItemRef}
          style={{
            ...(!!hoveredItemPosSideTable?.maxWidth && {
              maxWidth: `${hoveredItemPosSideTable.maxWidth}px`,
            }),
          }}
          className={`flex-col-center ${styles.dropdown_item}`}
          onClick={() => {
            setHoveredItemPosSideTable(null);
          }}
        >
          <span>{hoveredItemPosSideTable?.content}</span>
          <span>{hoveredItemPosSideTable?.content2}</span>
          {hoveredItemPosSideTable?.content3 && <span>{hoveredItemPosSideTable?.content3}</span>}
          {hoveredItemPosSideTable?.content4 && <span>{hoveredItemPosSideTable?.content4}</span>}
        </div>
      </div>
      <div ref={arrowRef} className={`${styles.tooltip_arrow}`}></div>
    </div>
  );
};

export const TooltipSideTable = memo(TooltipSideTableMemo);
