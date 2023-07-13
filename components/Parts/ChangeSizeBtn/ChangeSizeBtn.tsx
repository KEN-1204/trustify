import useStore from "@/store";
import useDashboardStore from "@/store/useDashboardStore";
import React, { FC, useRef } from "react";
import styles from "./ChangeSizeBtn.module.css";

type Props = {
  fontSize?: string;
  fontWeight?: number;
  textColor?: string;
  bgColor?: string;
  padding?: string;
  borderRadius?: string;
  minWidth?: string;
  minHeight?: string;
  classText?: string;
  clickEventHandler?: () => void;
};

export const ChangeSizeBtn: FC<Props> = ({
  fontSize = "12px",
  fontWeight = 500,
  textColor = "#fff",
  bgColor = "var(--color-bg-brand-gradient)",
  minWidth = "75px",
  minHeight = "26px",
  borderRadius = "4px",
  classText,
  clickEventHandler,
  //   padding = "14px 40px",
}) => {
  const language = useStore((state) => state.language);
  const isOpenChangeSizeMenu = useDashboardStore((state) => state.isOpenChangeSizeMenu);
  const setIsOpenChangeSizeMenu = useDashboardStore((state) => state.setIsOpenChangeSizeMenu);
  const setClickedItemPos = useStore((state) => state.setClickedItemPos);

  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    let overlay = document.createElement("span");
    overlay.classList.add(`${styles.overlay}`);

    let x = e.clientX - buttonRef.current?.getBoundingClientRect().x!;
    let y = e.clientY - buttonRef.current?.getBoundingClientRect().y!;

    overlay.style.left = x + "px";
    overlay.style.top = y + "px";

    // クリックした位置にoverlayクラスを持つspanをLinkタグの中に挿入
    // (overlayクラスはfixedなので、クリックした位置情報のe.clientXとYの位置を起点に)
    // top,left50%のtranslateX,Yを=50%でクリックした位置を中心に波エフェクトを発生させる
    e.currentTarget.appendChild(overlay);

    // overlay出現から0.5秒後にoverlayを削除
    setTimeout(() => {
      overlay.remove();
    }, 500);
  };
  return (
    <>
      <button
        // href="#"
        className={`${styles.button} transition-base03 px-[10px] py-[2px] ${classText}`}
        style={{
          fontSize: fontSize,
          fontWeight: fontWeight,
          color: textColor,
          // background: bgColor,
          minWidth: minWidth,
          minHeight: minHeight,
          borderRadius: borderRadius,
        }}
        data-text="Button"
        ref={buttonRef}
        onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
          handleClick(e);
          if (isOpenChangeSizeMenu) {
            setIsOpenChangeSizeMenu(false);
            setClickedItemPos(null);
            return;
          }
          setIsOpenChangeSizeMenu(true);
          // クリック位置をStateに格納
          const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
          console.log(x, y);
          setClickedItemPos({ x: x, y: y, itemWidth: width, itemHeight: height });
        }}
      >
        {language === "Ja" && "サイズ切り替え"}
        {language === "En" && "Change Size"}
      </button>
    </>
  );
};
