import { Dispatch, DragEvent, FormEvent, MouseEvent, SetStateAction, useEffect, useState } from "react";
import styles from "./ScreenDealBoards.module.css";
import { DealBoard } from "./DealBoard/DealBoard";
import { AvatarIcon } from "@/components/Parts/AvatarIcon/AvatarIcon";
import useDashboardStore from "@/store/useDashboardStore";
import { IoCaretDownOutline } from "react-icons/io5";

type SectionMenuParams = {
  // e: React.MouseEvent<HTMLElement, MouseEvent>;
  e: React.MouseEvent<HTMLElement, globalThis.MouseEvent | MouseEvent>;
  title: string;
  displayX?: string;
  maxWidth?: number;
  fadeType?: string;
};

export const ScreenDealBoards = () => {
  // // Deal Status

  const [openSectionMenu, setOpenSectionMenu] = useState<{
    x?: number;
    y: number;
    title?: string;
    displayX?: string;
    maxWidth?: number;
    fadeType?: string;
  } | null>(null);

  // 説明メニュー(onClickイベントで開いてホバー可能な状態はisHoverableをtrueにする)
  const [openPopupMenu, setOpenPopupMenu] = useState<{
    x?: number;
    y: number;
    title: string;
    displayX?: string;
    maxWidth?: number;
    fadeType?: string;
    isHoverable?: boolean;
  } | null>(null);

  // セクションメニューの表示
  const handleOpenSectionMenu = ({ e, title, displayX, maxWidth, fadeType }: SectionMenuParams) => {
    if (!displayX) {
      const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
      const positionY = y + height + 6;
      const positionCenter = x;
      console.log("クリック", y);
      setOpenSectionMenu({
        y: positionY,
        x: positionCenter,
        title: title,
        fadeType: fadeType,
      });
    } else {
      const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
      let positionX = 0;
      positionX = displayX === "right" ? -18 - 50 - (maxWidth ?? 400) : 0;
      positionX = displayX === "left" ? window.innerWidth - x : 0;
      console.log("クリック", displayX, e, x, y, width, height);

      setOpenSectionMenu({
        x: positionX,
        y: y,
        title: title,
        displayX: displayX,
        maxWidth: maxWidth,
        fadeType: fadeType,
      });
    }
  };

  // メニューを閉じる
  const handleCloseSettings = () => {
    setOpenSectionMenu(null);
  };

  const getFadeTypeClass = (fadeType: string) => {
    if (fadeType === "fade_down") return styles.fade_down;
    if (fadeType === "fade_up") return styles.fade_up;
    if (fadeType === "fade") return styles.fade;
  };

  return (
    <>
      {/* <section className={`${styles.company_table_screen} h-screen w-full bg-neutral-900 text-neutral-50`}> */}
      <section className={`${styles.sdb_table_screen} transition-bg05 w-full`}>
        {/* ------------------- タイトル・追加ボタン ------------------- */}
        <div className={`${styles.section_container} bg-[green]/[0]`}>
          <div className={`${styles.section_wrapper}`}>
            <div
              className={`${styles.section_title}`}
              onClick={(e) => handleOpenSectionMenu({ e, title: "section", fadeType: "fade_down" })}
            >
              <div className={`${styles.div_wrapper} flex-center gap-[6px]`}>
                <span className={``}>案件ステータス</span>
                <div className={`${styles.down_icon} flex-center`}>
                  <IoCaretDownOutline className={``} />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* ------------------- タイトル・追加ボタンここまで ------------------- */}

        {/* ------------------- ネタ表ボード ------------------- */}
        {Array(3)
          .fill(null)
          .map((_, index) => (
            <div key={`${index}_board`} className={`${styles.entity_board_container} bg-[red]/[0]`}>
              <div className={`${styles.entity_detail_container} bg-[green]/[0]`}>
                <div className={`${styles.entity_detail_wrapper}`}>
                  <div className={`${styles.entity_detail} space-x-[12px] text-[12px]`}>
                    <AvatarIcon size={33} name="伊藤謙太" withCircle={false} hoverEffect={false} />
                    <div className={`${styles.entity_name} text-[19px] font-bold`}>
                      <span>伊藤 謙太</span>
                    </div>
                    <div className={`${styles.sub_info} pt-[6px]`}>代表取締役</div>
                    <div className={`${styles.sub_info} pt-[6px]`}>216088</div>
                  </div>
                </div>
              </div>
              <DealBoard />
            </div>
          ))}
        {/* <DealBoard /> */}
        {/* <DealBoard /> */}
        {/* ------------------- ネタ表ボードここまで ------------------- */}
      </section>
      {/* ---------------------------- セッティングメニュー ---------------------------- */}
      {/* エディット時のメニュー上オーバーレイ */}
      {/* {isOpenPopupOverlay && (
        <div
        className={`${styles.menu_overlay} ${styles.above_setting_menu} bg-[#ffffff00]`}
        onClick={handleCloseClickPopup}
        ></div>
        )} */}
      {/* クリック時のオーバーレイ */}
      {openSectionMenu && <div className={`${styles.menu_overlay}`} onClick={handleCloseSettings}></div>}
      {openSectionMenu && (
        <div
          className={`${styles.settings_menu} fixed z-[3000] h-auto w-[330px] rounded-[6px] ${
            openSectionMenu.fadeType ? getFadeTypeClass(openSectionMenu.fadeType) : ``
          }`}
          style={{
            top: `${openSectionMenu.y}px`,
            ...(!openSectionMenu.displayX && {
              left: `${openSectionMenu.x}px`,
              maxWidth: `${openSectionMenu.maxWidth}px`,
            }),
            ...(openSectionMenu.displayX === "right" && {
              right: `${openSectionMenu.x}px`,
              maxWidth: `${openSectionMenu.maxWidth}px`,
            }),
            ...(openSectionMenu.displayX === "left" && {
              right: `${openSectionMenu.x}px`,
              maxWidth: `${openSectionMenu.maxWidth}px`,
            }),
          }}
        >
          <h3 className={`w-full px-[20px] pt-[20px] text-[15px] font-bold`}>セクションメニュー</h3>

          <p className={`w-full px-[20px] pb-[12px] pt-[10px] text-[11px]`}>
            下記メニューから各セクションごとのダッシュボードの表示・変更が可能です。
          </p>

          <hr className="min-h-[1px] w-full bg-[#999]" />
        </div>
      )}
    </>
  );
};
