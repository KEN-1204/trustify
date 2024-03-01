import { Dispatch, DragEvent, FormEvent, MouseEvent, SetStateAction, memo, useEffect, useState } from "react";
import styles from "./SalesProgressScreen.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { IoCaretDownOutline } from "react-icons/io5";
import { MdOutlineDataSaverOff } from "react-icons/md";
import { BsCheck2 } from "react-icons/bs";
import useStore from "@/store";
import { mappingSdbTabName, sdbTabsList } from "@/utils/selectOptions";
import { ScreenDealBoards } from "../ScreenDealBoards/ScreenDealBoards";

type SectionMenuParams = {
  // e: React.MouseEvent<HTMLElement, MouseEvent>;
  e: React.MouseEvent<HTMLElement, globalThis.MouseEvent | MouseEvent>;
  title: string;
  displayX?: string;
  maxWidth?: number;
  fadeType?: string;
};
type PopupDescMenuParams = {
  // e: React.MouseEvent<HTMLElement, MouseEvent>;
  e: React.MouseEvent<HTMLElement, globalThis.MouseEvent | MouseEvent>;
  title: string;
  displayX?: string;
  maxWidth?: number;
  fadeType?: string;
  isHoverable?: boolean;
};

const SalesProgressScreenMemo = () => {
  const language = useStore((state) => state.language);
  const activeTabSDB = useDashboardStore((state) => state.activeTabSDB);
  const setActiveTabSDB = useDashboardStore((state) => state.setActiveTabSDB);

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

  // -------------------------- 🌟セクションメニュー🌟 --------------------------
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
        maxWidth: maxWidth,
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
  // -------------------------- ✅セクションメニュー✅ --------------------------
  // -------------------------- 🌟説明ポップアップメニュー🌟 --------------------------
  const handleOpenPopupMenu = ({ e, title, displayX, maxWidth, fadeType, isHoverable }: PopupDescMenuParams) => {
    if (!displayX) {
      const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
      const positionY = y + height + 6;
      const positionCenter = x;
      console.log("クリック", y);
      setOpenPopupMenu({
        y: positionY,
        x: positionCenter,
        title: title,
        fadeType: fadeType,
        isHoverable: isHoverable,
      });
    } else {
      const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
      let positionX = 0;
      positionX = displayX === "right" ? -18 - 50 - (maxWidth ?? 400) : 0;
      positionX = displayX === "left" ? window.innerWidth - x : 0;
      console.log("クリック", displayX, e, x, y, width, height);

      setOpenPopupMenu({
        x: positionX,
        y: y,
        title: title,
        displayX: displayX,
        maxWidth: maxWidth,
        fadeType: fadeType,
        isHoverable: isHoverable,
      });
    }
  };

  // メニューを閉じる
  const handleClosePopupMenu = () => {
    setOpenPopupMenu(null);
  };
  // -------------------------- ✅説明ポップアップメニュー✅ --------------------------

  const getFadeTypeClass = (fadeType: string) => {
    if (fadeType === "fade_down") return styles.fade_down;
    if (fadeType === "fade_up") return styles.fade_up;
    if (fadeType === "fade") return styles.fade;
  };

  console.log("activeTabSDB", activeTabSDB, "language", language, "mappingSdbTabName", mappingSdbTabName);
  return (
    <>
      {/* -------------------------------- 売上進捗スクリーン -------------------------------- */}
      <div className={`${styles.sales_progress_screen}`}>
        {/* ------------------- セクションタイトル ------------------- */}

        <div className={`${styles.section_container} bg-[green]/[0]`}>
          <div className={`${styles.section_wrapper}`}>
            <div
              className={`${styles.section_title}`}
              onClick={(e) => handleOpenSectionMenu({ e, title: "sections", fadeType: "fade_down", maxWidth: 310 })}
            >
              <div className={`${styles.div_wrapper} flex-center gap-[6px]`}>
                <span className={``}>{mappingSdbTabName[activeTabSDB][language]}</span>
                <div className={`${styles.down_icon} flex-center`}>
                  <IoCaretDownOutline className={``} />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* ------------------- セクションタイトル ここまで ------------------- */}

        {/* ------------------- 売上目標+現売実績ホワイトボード ------------------- */}

        {/* ------------------- 売上目標+現売実績ホワイトボード ここまで ------------------- */}

        {/* ------------------- ネタ表ボードスクリーン ------------------- */}
        <ScreenDealBoards />
        {/* ------------------- ネタ表ボードスクリーン ここまで ------------------- */}
      </div>
      {/* -------------------------------- 売上進捗スクリーン ここまで -------------------------------- */}

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
          className={`${styles.settings_menu} fixed z-[3000] h-auto rounded-[6px] ${
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
          {openSectionMenu.title === "sections" && (
            <>
              <h3 className={`w-full px-[20px] pt-[20px] text-[15px] font-bold`}>セクションメニュー</h3>

              <p className={`w-full px-[20px] pb-[12px] pt-[10px] text-[11px]`}>
                下記メニューからセクションを選択することでダッシュボードの表示・変更が可能です。
              </p>

              <hr className="min-h-[1px] w-full bg-[#999]" />

              {/* -------- メニューコンテンツエリア -------- */}
              <div className={`${styles.scroll_container} flex max-h-[240px] w-full flex-col overflow-y-auto`}>
                <ul className={`flex h-full w-full flex-col`}>
                  {/* ------------------------------------ */}
                  {sdbTabsList.map((obj, index) => {
                    const isActive = obj.title === activeTabSDB;
                    return (
                      <li
                        key={obj.title}
                        className={`${styles.list} ${styles.select_list} ${isActive ? styles.active : ``}`}
                        onClick={(e) => {
                          if (isActive) return;
                          setActiveTabSDB(obj.title);
                          handleClosePopupMenu();
                        }}
                        onMouseEnter={(e) => {
                          handleOpenPopupMenu({ e, title: "deals_status", displayX: "right", maxWidth: 360 });
                        }}
                        onMouseLeave={handleClosePopupMenu}
                      >
                        <div className="pointer-events-none flex min-w-[110px] items-center">
                          <MdOutlineDataSaverOff
                            className={`${styles.list_icon} mr-[16px] min-h-[20px] min-w-[20px] text-[20px]`}
                          />
                          <div className="flex select-none items-center space-x-[2px]">
                            <span className={`${styles.select_item}`}>{obj.name[language]}</span>
                            {/* <span className={``}>：</span> */}
                          </div>
                        </div>
                        {isActive && (
                          <div className={`${styles.icon_container}`}>
                            <BsCheck2 className="pointer-events-none min-h-[22px] min-w-[22px] stroke-1 text-[22px] text-[#00d436]" />
                          </div>
                        )}
                      </li>
                    );
                  })}
                  {/* ------------------------------------ */}
                </ul>
              </div>
            </>
          )}
        </div>
      )}
      {/* ---------------------------- セッティングメニュー ここまで ---------------------------- */}
    </>
  );
};

export const SalesProgressScreen = memo(SalesProgressScreenMemo);
