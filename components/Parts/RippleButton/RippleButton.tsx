import React, { FC, memo, useRef } from "react";
import styles from "./RippleButton.module.css";
import Link from "next/link";

type Props = {
  title: string;
  fontSize?: string;
  fontWeight?: number;
  textColor?: string;
  bgColor?: string;
  padding?: string;
  borderRadius?: string;
  minWidth?: string;
  minHeight?: string;
  classText?: string;
};

const RippleButtonMemo: FC<Props> = ({
  title,
  fontSize = "12px",
  fontWeight = 500,
  textColor = "#fff",
  bgColor = "var(--color-bg-brand-gradient)",
  minWidth = "75px",
  minHeight = "26px",
  borderRadius = "4px",
  classText,
  //   padding = "14px 40px",
}) => {
  //   linear-gradient(90deg, #6616d0, #ac34e7)

  const buttonRef = useRef<HTMLAnchorElement | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
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
      <Link
        href="#"
        className={`${styles.button} transition-base03 px-[10px] py-[4px] ${classText}`}
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
        onClick={handleClick}
      >
        {title}
      </Link>
    </>
  );
};

export const RippleButton = memo(RippleButtonMemo);
