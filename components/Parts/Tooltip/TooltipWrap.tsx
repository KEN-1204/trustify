import useStore from "@/store";
import React, { useEffect, useRef } from "react";
import styles from "./TooltipWrap.module.css";

export const TooltipWrap = () => {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const hoveredItemPosWrap = useStore((state) => state.hoveredItemPosWrap);
  const setHoveredItemPosWrap = useStore((state) => state.setHoveredItemPosWrap);

  let hoveredItemHalfWidth = 0;
  let hoveredItemWidth = 0;
  let hoveredItemHeight = 0;
  let hoveredItemPositionX = 0;
  let hoveredItemPositionY = 0;
  let hoveredItemPositionYOver = 0;
  let hoveredItemDisplay;
  if (hoveredItemPosWrap) {
    hoveredItemHalfWidth = hoveredItemPosWrap.itemWidth / 2;
    hoveredItemWidth = hoveredItemPosWrap.itemWidth;
    hoveredItemHeight = hoveredItemPosWrap.itemHeight;
    hoveredItemPositionX = hoveredItemPosWrap.x;
    hoveredItemPositionY = hoveredItemPosWrap.y;

    hoveredItemPositionYOver = window.innerHeight - hoveredItemPosWrap.y;
  }

  console.log("TooltipWrapコンポーネントレンダリング X Y", hoveredItemPositionX, hoveredItemPositionY);

  // 右寄りのアイテムに対してのルート
  if (hoveredItemPosWrap?.display === "right") {
    // 上に表示するツールチップ
    // 下1/3でエンターしたなら上方向に表示 -40pxはRowのheight35px + margin-top5px = 40px分
    if (window.innerHeight - window.innerHeight / 3 < hoveredItemPositionY) {
      return (
        <div
          className={`${styles.tooltip_over_right} ${
            hoveredItemPosWrap ? `block ${styles.fade}` : "transition-base hidden"
          }`}
          style={{
            position: "absolute",
            zIndex: 100,
            // left: `${`${hoveredItemPositionX}px`}`,
            // right: `${`${-hoveredItemWidth}px`}`,
            // right: `${`${-hoveredItemHalfWidth}px`}`,
            left: `${`${hoveredItemPositionX}px`}`,
            right: `${`${0}px`}`,
            //   top: `${`${hoveredItemPositionY - hoveredItemHeight - 40}px`}`,
            bottom: `${`${hoveredItemPositionYOver + 10}px`}`,
          }}
          ref={menuRef}
        >
          <div
            className={`flex-col-center ${styles.dropdown_item}`}
            onClick={() => {
              setHoveredItemPosWrap(null);
            }}
          >
            {/* <span >{hoveredItemPosWrap?.content}</span> */}
            <div
              dangerouslySetInnerHTML={{
                __html: hoveredItemPosWrap?.content ? hoveredItemPosWrap?.content.replace(/\n/g, "<br>") : "",
              }}
            ></div>
            <span>{hoveredItemPosWrap?.content2}</span>
            {hoveredItemPosWrap?.content3 && <span>{hoveredItemPosWrap?.content3}</span>}
          </div>
        </div>
      );
    }

    // // 右寄り
    // 下で表示
    // 上2/3でエンターしたなら下方向に表示
    return (
      <div
        className={`${styles.tooltip_right}  ${hoveredItemPosWrap ? `block ${styles.fade}` : "transition-base hidden"}`}
        style={{
          position: "absolute",
          zIndex: 100,
          left: `${`${hoveredItemPositionX}px`}`,
          top: `${`${hoveredItemPositionY + hoveredItemHeight + 10}px`}`,
        }}
        ref={menuRef}
      >
        <div
          className={`flex-col-center ${styles.dropdown_item}`}
          onClick={() => {
            setHoveredItemPosWrap(null);
          }}
        >
          {/* <span>{hoveredItemPosWrap?.content}</span> */}
          <div
            dangerouslySetInnerHTML={{
              __html: hoveredItemPosWrap?.content ? hoveredItemPosWrap?.content.replace(/\n/g, "<br>") : "",
            }}
          ></div>
          <span>{hoveredItemPosWrap?.content2}</span>
          {hoveredItemPosWrap?.content3 && <span>{hoveredItemPosWrap?.content3}</span>}
        </div>
      </div>
    );
  }
  // 右寄りここまで

  // center
  // 上に表示するツールチップ
  // 下1/3でエンターしたなら上方向に表示 -40pxはRowのheight35px + margin-top5px = 40px分
  if (window.innerHeight - window.innerHeight / 3 < hoveredItemPositionY) {
    return (
      <div
        className={`${styles.tooltip_over} ${hoveredItemPosWrap ? `block ${styles.fade}` : "transition-base hidden"}`}
        style={{
          position: "absolute",
          zIndex: 100,
          left: `${`${hoveredItemPositionX + hoveredItemHalfWidth}px`}`,
          //   top: `${`${hoveredItemPositionY - hoveredItemHeight - 40}px`}`,
          bottom: `${`${hoveredItemPositionYOver + 10}px`}`,
        }}
        ref={menuRef}
      >
        <div
          className={`flex-col-center ${styles.dropdown_item}`}
          onClick={() => {
            setHoveredItemPosWrap(null);
          }}
        >
          {/* <span>{hoveredItemPosWrap?.content}</span> */}
          <div
            dangerouslySetInnerHTML={{
              __html: hoveredItemPosWrap?.content ? hoveredItemPosWrap?.content.replace(/\n/g, "<br>") : "",
            }}
          ></div>
          <span>{hoveredItemPosWrap?.content2}</span>
          {hoveredItemPosWrap?.content3 && <span>{hoveredItemPosWrap?.content3}</span>}
        </div>
      </div>
    );
  }

  // 下で表示
  // 上2/3でエンターしたなら下方向に表示
  return (
    <div
      className={`${styles.tooltip}  ${hoveredItemPosWrap ? `block ${styles.fade}` : "transition-base hidden"}`}
      style={{
        position: "absolute",
        zIndex: 100,
        left: `${`${hoveredItemPositionX + hoveredItemHalfWidth}px`}`,
        top: `${`${hoveredItemPositionY + hoveredItemHeight + 10}px`}`,
      }}
      ref={menuRef}
    >
      <div
        className={`flex-col-center ${styles.dropdown_item}`}
        onClick={() => {
          setHoveredItemPosWrap(null);
        }}
      >
        {/* <span>{hoveredItemPosWrap?.content}</span> */}
        <div
          dangerouslySetInnerHTML={{
            __html: hoveredItemPosWrap?.content ? hoveredItemPosWrap?.content.replace(/\n/g, "<br>") : "",
          }}
        ></div>
        <span>{hoveredItemPosWrap?.content2}</span>
        {hoveredItemPosWrap?.content3 && <span>{hoveredItemPosWrap?.content3}</span>}
      </div>
    </div>
  );
};
