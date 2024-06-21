import useStore from "@/store";
import React, { FC, memo, useEffect, useRef } from "react";
import styles from "./TooltipModal.module.css";

const TooltipModalMemo: FC = () => {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const arrowRef = useRef<HTMLDivElement | null>(null);
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
  let hoveredItemDisplay: string | undefined;

  let hoveredItemPositionYOver = 0;
  if (hoveredItemPosModal) {
    hoveredItemHalfWidth = hoveredItemPosModal.itemWidth / 2;
    hoveredItemWidth = hoveredItemPosModal.itemWidth;
    hoveredItemHeight = hoveredItemPosModal.itemHeight;
    hoveredItemPositionX = hoveredItemPosModal.x;
    hoveredItemPositionY = hoveredItemPosModal.y;
    hoveredItemDisplay = hoveredItemPosModal.display;

    // hoveredItemPositionYOver = window.innerHeight  - hoveredItemPosModal.y;
    const difference = Math.round(window.innerHeight - (hoveredItemPosModal.containerHeight ?? 0));
    hoveredItemPositionYOver = window.innerHeight - difference - hoveredItemPosModal.y;
  }

  // --------------------------------- テスト ---------------------------------
  // useEffectフックを使ってツールチップの幅を取得して、画面端20pxの位置に表示
  useEffect(() => {
    if (!hoveredItemPosModal?.containerHeight) return;
    if (menuRef.current) {
      const tooltipWidth = menuRef.current.offsetWidth;
      const tooltipHalfWidth = tooltipWidth / 2;
      const viewportWidth = window.innerWidth;
      const viewportRightOneThird = (viewportWidth / 3) * 2; // 画面3分の2の幅
      const viewportRightOneFifth = (viewportWidth / 5) * 4; // 画面5分の4の幅
      const viewportRightHalf = viewportWidth / 2; // 画面2分の1の幅
      const leftPosition = hoveredItemPositionX + hoveredItemHalfWidth;
      let adjustedLeft = leftPosition;

      // 画面右端を超えている場合、位置を左に調整 右に10px余白を設けた位置にツールチップを表示
      if (leftPosition + tooltipHalfWidth > viewportWidth - 10) {
        adjustedLeft = viewportWidth - tooltipHalfWidth - 10 - 10; // 20pxの余白を残す
        const addWidth = viewportWidth - 10 - adjustedLeft - tooltipHalfWidth;

        menuRef.current.style.width = `${tooltipWidth + addWidth}px`;
        menuRef.current.style.overflowWrap = "normal";
      } else {
        // 画面右端を超えていないなら、画面左3分の2の位置よりも右の位置にある場合はnowrapにする
        if (adjustedLeft > viewportRightOneFifth) {
          const tooltipText = menuRef.current.querySelector(`.tooltip_text`);
          const tooltipTextWidth = tooltipText?.getBoundingClientRect().width;
          menuRef.current.style.minWidth = `max-content`;
        }
      }

      // 画面左端を超えている場合、位置を右に調整
      if (hoveredItemPositionX + hoveredItemHalfWidth - tooltipHalfWidth < 0) {
        adjustedLeft = 10; // 10pxの余白を残す
        // スタイルを更新
        menuRef.current.style.left = `${adjustedLeft}px`;
      } else {
        // スタイルを更新
        adjustedLeft = adjustedLeft - tooltipHalfWidth;
        menuRef.current.style.left = `${adjustedLeft}px`;
      }
    }
  }, [hoveredItemPositionX, hoveredItemPositionY, hoveredItemHalfWidth]);
  // --------------------------------- テスト ここまで ---------------------------------
  // --------------------------------- 元々 ---------------------------------
  // useEffectフックを使ってツールチップの幅を取得して、画面端20pxの位置に表示
  useEffect(() => {
    if (!!hoveredItemPosModal?.containerHeight) return;

    // 最初から左か右に矢印を配置する場合は計算不要
    if (
      (!!hoveredItemDisplay && hoveredItemDisplay === "left") ||
      hoveredItemDisplay === "right" ||
      hoveredItemDisplay === "right-top"
    )
      return;

    if (menuRef.current) {
      // if (hoveredItemPosModal?.maxWidth) {
      //   menuRef.current.style.maxWidth = `${hoveredItemPosModal?.maxWidth}px`;
      // }

      const tooltipWidth = menuRef.current.offsetWidth;
      const tooltipHeight = menuRef.current.offsetHeight;
      // const tooltipRectWidth = menuRef.current.getBoundingClientRect().width;
      console.log("tooltipOffsetWidth,", tooltipWidth);
      const tooltipHalfWidth = tooltipWidth / 2;
      const viewportWidth = window.innerWidth;
      const viewportRightOneThird = (viewportWidth / 3) * 2; // 画面3分の2の幅
      const viewportRightHalf = viewportWidth / 2; // 画面2分の1の幅
      const viewportRightOneFifth = (viewportWidth / 5) * 4; // 画面5分の4の幅
      const leftPosition = hoveredItemPositionX + hoveredItemHalfWidth;
      // const leftPosition = hoveredItemPositionX + tooltipWidth;
      let adjustedLeft = leftPosition;
      let tooltipLeftPosition = leftPosition - tooltipHalfWidth;

      // 画面右端を超えている場合、位置を左に調整 右に10px余白を設けた位置にツールチップを表示
      if (leftPosition + tooltipHalfWidth > viewportWidth - 10) {
        console.log("みぎ！！！！！！！！！！！！！！！！炎");
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
          console.log("右半分！！！！！！！！！！！！！！！！炎", leftPosition);
          const tooltipText = menuRef.current.querySelector(`.tooltip_text`);
          const tooltipTextWidth = tooltipText?.getBoundingClientRect().width;
          console.log("tooltipWidth", tooltipWidth, "tooltipTextWidth", tooltipTextWidth, "tooltipText", tooltipText);
          // menuRef.current.style.minWidth = `${tooltipWidth}px`;
          // menuRef.current.style.minWidth = `max-content`;
        }
        // 画面左を超えているか モーダルLeft位置と、そのLeft位置からツールチップの中心点までの距離を合算した距離よりもツールチップの半分の長さが超えている場合
        // if ((hoveredItemPosModal?.containerLeft ?? 0) + leftPosition < tooltipHalfWidth) {
        //   console.log(
        //     "ビューポートより左🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥！！！！！！！！！！！！！！！！炎",
        //     tooltipLeftPosition,
        //     leftPosition,
        //     (hoveredItemPosModal?.containerLeft ?? 0) + leftPosition,
        //     tooltipHalfWidth,
        //     (hoveredItemPosModal?.containerLeft ?? 0) + leftPosition - tooltipHalfWidth
        //   );

        //   const addWidth = Math.abs((hoveredItemPosModal?.containerLeft ?? 0) + leftPosition - tooltipHalfWidth) + 20;
        //   // adjustedLeft = 0 - (hoveredItemPosModal?.containerLeft ?? 0);
        //   adjustedLeft += addWidth;
        //   // 超えている場合は矢印を消去
        //   if (arrowRef.current) arrowRef.current.style.opacity = "0";
        //   if (arrowRef.current) arrowRef.current.style.display = "hidden";
        // }
      }

      // // 画面左端を超えている場合、位置を右に調整
      // if (leftPosition < 0) {
      //   console.log("🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥！！！！！！！！！！！！！！！！炎");
      //   adjustedLeft = 10; // 10pxの余白を残す
      // }
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

      // スタイルを更新
      // adjustedLeft = adjustedLeft - tooltipHalfWidth;
      // menuRef.current.style.left = `${adjustedLeft}px`;
      //

      menuRef.current.style.top = `${
        (hoveredItemPosModal?.y ?? 0) - tooltipHeight - (hoveredItemPosModal?.marginTop ?? 0)
      }px`;
      if (arrowRef.current) arrowRef.current.style.bottom = `${-4}px`;
    }
  }, [hoveredItemPositionX, hoveredItemPositionY, hoveredItemHalfWidth, hoveredItemDisplay]);

  // --------------------------------- 元々 ここまで ---------------------------------

  // 0は許容し、それ以外のfalsyはリターン
  if (
    hoveredItemPosModal?.content === "" ||
    hoveredItemPosModal?.content === null ||
    typeof hoveredItemPosModal?.content === "undefined"
  ) {
    return;
  }

  // console.log(window.innerWidth);
  // 左寄りのアイテムに対して右に表示するツールチップ
  if (hoveredItemDisplay === "top") {
    return (
      <div
        className={`${styles.tooltip_area} ${styles.fade} ${hoveredItemPosModal ? `block` : "hidden"}`}
        style={{
          position: "absolute",
          // position: "fixed",
          // backgroundColor: "red",
          zIndex: 20000,
          // left: `${`${hoveredItemPositionX + hoveredItemHalfWidth}px`}`,
          // bottom: `${`${hoveredItemPositionY + hoveredItemHeight}px`}`,
          // 元々----------------
          top: !!hoveredItemPosModal.containerHeight
            ? `unset`
            : `${`${hoveredItemPositionY - hoveredItemHeight - 8 - (hoveredItemPosModal?.marginTop ?? 0)}px`}`,
          // 元々----------------
          // テスト----------------
          bottom: !!hoveredItemPosModal.containerHeight ? `${`${hoveredItemPositionYOver + 10}px`}` : `unset`,
          // テスト----------------
          ...(!!hoveredItemPosModal?.maxWidth && { maxWidth: hoveredItemPosModal.maxWidth }),
        }}
        ref={menuRef}
      >
        <div className={`${styles.tooltip_over}`}>
          <div
            className={`flex flex-col ${
              hoveredItemPosModal?.itemsPosition === "center" ? `items-center` : "items-start"
            } justify-center ${styles.dropdown_item}`}
            style={{ ...(hoveredItemPosModal?.whiteSpace && { whiteSpace: hoveredItemPosModal?.whiteSpace }) }}
            onClick={() => {
              setHoveredItemPosModal(null);
            }}
          >
            {/* <span>{hoveredItemPosModal?.content}</span> */}
            {/* <span>{hoveredItemPosModal?.content2}</span> */}
            <div
              className={`tooltip_text`}
              dangerouslySetInnerHTML={{
                __html: hoveredItemPosModal?.content ? hoveredItemPosModal?.content.replace(/\n/g, "<br>") : "",
              }}
            ></div>
            {hoveredItemPosModal?.content2 && <span>{hoveredItemPosModal?.content2}</span>}
            {hoveredItemPosModal?.content3 && <span>{hoveredItemPosModal?.content3}</span>}
            {hoveredItemPosModal?.content4 && <span>{hoveredItemPosModal?.content4}</span>}
          </div>
        </div>
        <div ref={arrowRef} className={`${styles.tooltip_arrow_over}`}></div>
      </div>
    );
    // return (
    //   <div
    //     className={`${styles.tooltip_over} ${hoveredItemPosModal ? `block ${styles.fade}` : "transition-base hidden"}`}
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
    //         setHoveredItemPosModal(null);
    //       }}
    //     >
    //       <span>{hoveredItemPosModal?.content}</span>
    //       <span>{hoveredItemPosModal?.content2}</span>
    //       {hoveredItemPosModal?.content3 && <span>{hoveredItemPosModal?.content3}</span>}
    //     </div>
    //   </div>
    // );
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
  // return (
  //   <div
  //     className={`${styles.tooltip_area}  ${hoveredItemPosModal ? `block ${styles.fade}` : "transition-base hidden"}`}
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
  //           setHoveredItemPosModal(null);
  //         }}
  //       >
  //         <span>{hoveredItemPosModal?.content}</span>
  //         <span>{hoveredItemPosModal?.content2}</span>
  //         {hoveredItemPosModal?.content3 && <span>{hoveredItemPosModal?.content3}</span>}
  //       </div>
  //     </div>
  //     <div className={`${styles.tooltip_arrow}`}></div>
  //   </div>
  // );
  return (
    <div
      className={`${styles.tooltip} ${styles.fade} ${hoveredItemPosModal ? `block` : "hidden"}`}
      style={{
        position: "absolute",

        zIndex: 20000,
        // left: `${`${hoveredItemPositionX + hoveredItemHalfWidth}px`}`,
        top: `${`${hoveredItemPositionY + hoveredItemHeight + 10}px`}`,
        ...(!!hoveredItemPosModal?.maxWidth && { maxWidth: hoveredItemPosModal.maxWidth }),
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
        {hoveredItemPosModal?.content4 && <span>{hoveredItemPosModal?.content4}</span>}
      </div>
    </div>
  );
};

export const TooltipModal = memo(TooltipModalMemo);
