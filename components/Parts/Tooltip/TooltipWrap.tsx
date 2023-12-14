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

  // useEffectフックを使ってツールチップのはばを取得
  useEffect(() => {
    if (menuRef.current) {
      const tooltipWidth = menuRef.current.offsetWidth;
      // const tooltipRectWidth = menuRef.current.getBoundingClientRect().width;
      console.log("tooltipOffsetWidth,", tooltipWidth);
      const tooltipHalfWidth = tooltipWidth / 2;
      const viewportWidth = window.innerWidth;
      const viewportRightOneThird = (viewportWidth / 3) * 2; // 画面3分の2の幅
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
      } else {
        // 画面右端を超えていないなら、画面左3分の2の位置よりも右の位置にある場合はnowrapにする
        if (adjustedLeft > viewportRightOneFifth) {
          const tooltipText = menuRef.current.querySelector(`.tooltip_text`);
          const tooltipTextWidth = tooltipText?.getBoundingClientRect().width;
          console.log("tooltipWidth", tooltipWidth, "tooltipTextWidth", tooltipTextWidth, "tooltipText", tooltipText);
          menuRef.current.style.whiteSpace = "nowrap";
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
      menuRef.current.style.left = `${adjustedLeft}px`;
    }
  }, [hoveredItemPositionX, hoveredItemPositionY, hoveredItemHalfWidth]);

  console.log("TooltipWrapコンポーネントレンダリング X Y", hoveredItemPositionX, hoveredItemPositionY, menuRef);

  // 右寄りのアイテムに対してのルート
  if (hoveredItemPosWrap?.display === "right") {
    // 上に表示するツールチップ
    // 下1/3でエンターしたなら上方向に表示 -40pxはRowのheight35px + margin-top5px = 40px分
    if (window.innerHeight - window.innerHeight / 3 < hoveredItemPositionY) {
      return (
        <div
          className={`${styles.tooltip_area} ${hoveredItemPosWrap ? `block ${styles.fade}` : "transition-base hidden"}`}
          style={{
            position: "absolute",
            zIndex: 100,
            // left: `${`${hoveredItemPositionX}px`}`,
            // right: `${`${-hoveredItemWidth}px`}`,
            // right: `${`${-hoveredItemHalfWidth}px`}`,
            // left: `${`${hoveredItemPositionX}px`}`,
            // right: `${`${0}px`}`,
            // left: `${`${hoveredItemPositionX}px`}`,
            // leftのスタイルはuseEffect内で動的に設定
            //   top: `${`${hoveredItemPositionY - hoveredItemHeight - 40}px`}`,
            bottom: `${`${hoveredItemPositionYOver + 10}px`}`,
          }}
          ref={menuRef}
        >
          <div className={`${styles.tooltip_over_right}`}>
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
          <div className={`${styles.tooltip_arrow_over_right}`}></div>
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
          // left: `${`${hoveredItemPositionX}px`}`,
          // leftのスタイルはuseEffect内で動的に設定
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
        className={`${styles.tooltip_area} ${hoveredItemPosWrap ? `block ${styles.fade}` : "transition-base hidden"}`}
        style={{
          position: "absolute",
          zIndex: 100,
          // left: `${`${hoveredItemPositionX + hoveredItemHalfWidth}px`}`,
          // leftのスタイルはuseEffect内で動的に設定
          bottom: `${`${hoveredItemPositionYOver + 10}px`}`,
        }}
        ref={menuRef}
      >
        <div className={`${styles.tooltip_over}`}>
          <div
            className={`flex-col-center ${styles.dropdown_item}`}
            onClick={() => {
              setHoveredItemPosWrap(null);
            }}
          >
            <div
              className={`tooltip_text`}
              dangerouslySetInnerHTML={{
                __html: hoveredItemPosWrap?.content ? hoveredItemPosWrap?.content.replace(/\n/g, "<br>") : "",
              }}
            ></div>
            {!!hoveredItemPosWrap?.content2 ? <span>{hoveredItemPosWrap?.content2}</span> : ``}
            {!!hoveredItemPosWrap?.content3 ? <span>{hoveredItemPosWrap?.content3}</span> : ``}
          </div>
        </div>
        {/* <div className={`${styles.tooltip_arrow_over}`}></div> */}
      </div>
    );
  }

  // 下で表示
  // 上2/3でエンターしたなら下方向に表示
  return (
    <div
      className={`${styles.tooltip_area}  ${hoveredItemPosWrap ? `block ${styles.fade}` : "transition-base hidden"}`}
      style={{
        position: "absolute",
        zIndex: 100,
        // left: `${`${hoveredItemPositionX + hoveredItemHalfWidth}px`}`,
        // leftのスタイルはuseEffect内で動的に設定
        top: `${`${hoveredItemPositionY + hoveredItemHeight + 10}px`}`,
      }}
      ref={menuRef}
    >
      <div className={`${styles.tooltip}`}>
        <div
          className={`flex-col-center ${styles.dropdown_item}`}
          onClick={() => {
            setHoveredItemPosWrap(null);
          }}
        >
          <div
            className={`tooltip_text`}
            dangerouslySetInnerHTML={{
              __html: hoveredItemPosWrap?.content ? hoveredItemPosWrap?.content.replace(/\n/g, "<br>") : "",
            }}
          ></div>
          <span>{hoveredItemPosWrap?.content2}</span>
          {hoveredItemPosWrap?.content3 && <span>{hoveredItemPosWrap?.content3}</span>}
        </div>
      </div>
      {/* <div className={`${styles.tooltip_arrow}`}></div> */}
    </div>
  );
};
