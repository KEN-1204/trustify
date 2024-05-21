import useStore from "@/store";
import React, { memo, useEffect, useRef } from "react";
import styles from "./Tooltip.module.css";

const TooltipMemo = () => {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const arrowRef = useRef<HTMLDivElement | null>(null);
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
  let hoveredItemDisplay: string | undefined;
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
      // console.log("tooltipOffsetWidth,", tooltipWidth);
      const tooltipHalfWidth = tooltipWidth / 2;
      const viewportWidth = window.innerWidth;
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
          // console.log("tooltipWidth", tooltipWidth, "tooltipTextWidth", tooltipTextWidth, "tooltipText", tooltipText);
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

      // // 画面左端を超えている場合、位置を右に調整
      if (hoveredItemPositionX + hoveredItemHalfWidth - tooltipHalfWidth < 0) {
        adjustedLeft = 10; // 10pxの余白を残す
        // スタイルを更新
        menuRef.current.style.left = `${adjustedLeft}px`;
        // 超えている場合は矢印を消去
        if (arrowRef.current) arrowRef.current.style.opacity = "0";
        if (arrowRef.current) arrowRef.current.style.display = "hidden";
      } else {
        // スタイルを更新
        adjustedLeft = adjustedLeft - tooltipHalfWidth;
        menuRef.current.style.left = `${adjustedLeft}px`;
      }

      // // 画面左端を超えている場合、位置を右に調整
      // if (leftPosition < 0) {
      //   adjustedLeft = 10; // 10pxの余白を残す
      // }
      // // スタイルを更新
      // adjustedLeft = adjustedLeft - tooltipHalfWidth;
      // menuRef.current.style.left = `${adjustedLeft}px`;
    }
  }, [hoveredItemPositionX, hoveredItemPositionY, hoveredItemHalfWidth, hoveredItemDisplay]);

  console.log("Tooltipコンポーネントレンダリング");

  // 0は許容し、それ以外のfalsyはリターン
  if (
    hoveredItemPos?.content === "" ||
    hoveredItemPos?.content === null ||
    typeof hoveredItemPos?.content === "undefined"
  ) {
    return;
  }

  if (hoveredItemDisplay === "top") {
    return (
      <div
        className={`${styles.tooltip_area} ${styles.fade} ${hoveredItemPos ? `block` : "hidden"}`}
        style={{
          position: "absolute",
          zIndex: 20000,
          // left: `${`${hoveredItemPositionX + hoveredItemHalfWidth}px`}`,
          // leftのスタイルはuseEffect内で動的に設定
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
        <div ref={arrowRef} className={`${styles.tooltip_arrow_over}`}></div>
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
        className={`${styles.tooltip_area} ${styles.fade} ${hoveredItemPos ? `block` : "hidden"}`}
        style={{
          position: "absolute",
          zIndex: 20000,
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
        <div ref={arrowRef} className={`${styles.tooltip_arrow_left}`}></div>
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
        className={`${styles.tooltip_area} ${styles.fade} ${hoveredItemPos ? `block` : "hidden"}`}
        style={{
          position: "absolute",
          zIndex: 20000,
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
        <div ref={arrowRef} className={`${styles.tooltip_arrow_right}`}></div>
      </div>
    );
  }
  // 右端に配置されてるアイテムに対して上側に表示
  if (hoveredItemDisplay === "right-top") {
    return (
      <div
        // className={`${styles.tooltip_right}  ${hoveredItemPos ? `block ${styles.fade}` : "transition-base hidden"}`}
        className={`${styles.tooltip_area} ${styles.fade} ${hoveredItemPos ? `block` : "hidden"}`}
        style={{
          position: "absolute",
          zIndex: 20000,
          left: `${`${hoveredItemPositionX - 12 * textLengthNum + 10 * 2 - 10}px`}`,
          top: `${`${hoveredItemPositionY - hoveredItemHeight - 10}px`}`,
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
        <div ref={arrowRef} className={`${styles.tooltip_arrow_right_top}`}></div>
      </div>
    );
  }

  // 真ん中で表示
  return (
    <div
      className={`${styles.tooltip_area} ${styles.fade} ${hoveredItemPos ? `block` : "hidden"}`}
      // className={`${styles.tooltip}  ${hoveredItemPos ? `block ${styles.fade}` : "transition-base hidden"}`}
      style={{
        position: "absolute",
        zIndex: 20000,
        // left: `${`${hoveredItemPositionX + hoveredItemHalfWidth}px`}`,
        // // leftのスタイルはuseEffect内で動的に設定
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
      <div ref={arrowRef} className={`${styles.tooltip_arrow}`}></div>
    </div>
  );
};

export const Tooltip = memo(TooltipMemo);
