import { Dispatch, DragEvent, FormEvent, MouseEvent, SetStateAction, memo, useEffect, useRef, useState } from "react";
import styles from "./SalesProgressScreen.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { IoCaretDownOutline } from "react-icons/io5";
import { MdOutlineDataSaverOff } from "react-icons/md";
import { BsCheck2 } from "react-icons/bs";
import useStore from "@/store";
import { mappingSdbTabName, periodList, sdbTabsList, sectionList } from "@/utils/selectOptions";
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
  const activeSectionSDB = useDashboardStore((state) => state.activeSectionSDB);
  const setActiveSectionSDB = useDashboardStore((state) => state.setActiveSectionSDB);
  const activePeriodSDB = useDashboardStore((state) => state.activePeriodSDB);
  const setActivePeriodSDB = useDashboardStore((state) => state.setActivePeriodSDB);

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

  const sectionMenuRef = useRef<HTMLDivElement | null>(null);

  // -------------------------- 🌟セクションメニュー🌟 --------------------------
  const handleOpenSectionMenu = ({ e, title, displayX, maxWidth, fadeType }: SectionMenuParams) => {
    if (!displayX || displayX === "center") {
      const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
      const positionY = y + height + 6;
      let positionX = x;
      if (displayX === "center") positionX = x + width / 2;
      console.log("クリック", y, x, positionX);
      setOpenSectionMenu({
        y: positionY,
        x: positionX,
        title: title,
        displayX: displayX,
        fadeType: fadeType,
        maxWidth: maxWidth,
      });
    } else {
      const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
      let positionX = 0;
      positionX = displayX === "right" ? -18 - 50 - (maxWidth ?? 400) : 0;
      positionX = displayX === "left" ? window.innerWidth - x : 0;
      //   positionX = displayX === "center" ? x + width / 2 : 0;
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

  useEffect(() => {
    if (!openSectionMenu?.displayX || openSectionMenu?.displayX !== "center") return;
    if (openSectionMenu?.displayX === "center" && sectionMenuRef.current && openSectionMenu.x) {
      const menuWith = sectionMenuRef.current.getBoundingClientRect().width;
      const newX = openSectionMenu.x - menuWith / 2;
      console.log("🔥newX", newX, menuWith, openSectionMenu.x);
      setOpenSectionMenu({ ...openSectionMenu, x: newX });
    }
  }, [openSectionMenu?.displayX]);

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

  // ==================================== 🌟ツールチップ🌟 ====================================
  const hoveredItemPosWrap = useStore((state) => state.hoveredItemPosWrap);
  const setHoveredItemPosWrap = useStore((state) => state.setHoveredItemPosWrap);
  type TooltipParams = {
    e: React.MouseEvent<HTMLElement, MouseEvent | globalThis.MouseEvent>;
    display?: "top" | "right" | "bottom" | "left" | "";
    marginTop?: number;
    itemsPosition?: string;
    whiteSpace?: "normal" | "pre" | "nowrap" | "pre-wrap" | "pre-line" | "break-spaces" | undefined;
    content?: string;
    content2?: string;
    content3?: string;
    content4?: string;
  };
  const handleOpenTooltip = ({
    e,
    display = "",
    marginTop,
    itemsPosition,
    whiteSpace,
    content,
    content2,
    content3,
    content4,
  }: TooltipParams) => {
    // ホバーしたアイテムにツールチップを表示
    const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
    // console.log("ツールチップx, y width , height", x, y, width, height);
    const dataText2 = ((e.target as HTMLDivElement).dataset.text2 as string)
      ? ((e.target as HTMLDivElement).dataset.text2 as string)
      : "";
    const dataText3 = ((e.target as HTMLDivElement).dataset.text3 as string)
      ? ((e.target as HTMLDivElement).dataset.text3 as string)
      : "";
    const dataText4 = ((e.target as HTMLDivElement).dataset.text4 as string)
      ? ((e.target as HTMLDivElement).dataset.text4 as string)
      : "";
    setHoveredItemPosWrap({
      x: x,
      y: y,
      itemWidth: width,
      itemHeight: height,
      content: ((e.target as HTMLDivElement).dataset.text as string) || (content ?? ""),
      content2: dataText2 || content2 || "",
      content3: dataText3 || content3 || "",
      content4: dataText4 || content4 || "",
      display: display,
      marginTop: marginTop,
      itemsPosition: itemsPosition,
      whiteSpace: whiteSpace,
    });
  };
  // ツールチップを非表示
  const handleCloseTooltip = () => {
    if (hoveredItemPosWrap) setHoveredItemPosWrap(null);
  };
  // ==================================== ✅ツールチップ✅ ====================================

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
            <div className={`${styles.left_wrapper} flex items-end`}>
              <div
                className={`${styles.section_title}`}
                onClick={(e) => {
                  handleOpenSectionMenu({ e, title: "dashboard", fadeType: "fade_down", maxWidth: 310 });
                  handleCloseTooltip();
                }}
                onMouseEnter={(e) => {
                  handleOpenTooltip({
                    e: e,
                    display: "top",
                    content: `売上進捗・営業指数・プロセス・期間ごとの案件一覧・エリア毎の売上マップなど`,
                    content2: `各用途毎のダッシュボードの表示切り替えが可能です。`,
                    marginTop: 28,
                    itemsPosition: "left",
                  });
                }}
                onMouseLeave={handleCloseTooltip}
              >
                <div className={`${styles.div_wrapper} flex-center gap-[6px]`}>
                  <span className={``}>{mappingSdbTabName[activeTabSDB][language]}</span>
                  <div className={`${styles.down_icon} flex-center`}>
                    <IoCaretDownOutline className={``} />
                  </div>
                </div>
              </div>

              <div className={`${styles.entity_type} ${openSectionMenu?.title === "entity" ? `${styles.active}` : ``}`}>
                <div
                  className={`underline_area mb-[-1px] flex cursor-pointer flex-col hover:text-[var(--color-bg-brand-f)]`}
                  onClick={(e) => {
                    handleOpenSectionMenu({
                      e,
                      title: "entity",
                      displayX: "center",
                      fadeType: "fade_down",
                      maxWidth: 310,
                    });
                    handleCloseTooltip();
                  }}
                  onMouseEnter={(e) => {
                    handleOpenTooltip({
                      e: e,
                      display: "top",
                      content: `「全社・事業部・係/チーム・メンバー個人」を変更することで`,
                      content2: `各セクション毎にダッシュボードを確認が可能です。`,
                      marginTop: 28,
                      itemsPosition: "left",
                    });
                  }}
                  onMouseLeave={handleCloseTooltip}
                >
                  <span>IMTK2</span>
                  <div className={`flow_underline brand_light one_px w-full`} />
                </div>
              </div>
              <div className={`${styles.period_type} ${openSectionMenu?.title === "period" ? `${styles.active}` : ``}`}>
                <div
                  className={`underline_area mb-[-1px] flex cursor-pointer flex-col hover:text-[var(--color-bg-brand-f)]`}
                  onClick={(e) => {
                    handleOpenSectionMenu({
                      e,
                      title: "period",
                      displayX: "center",
                      fadeType: "fade_down",
                      maxWidth: 310,
                    });
                    handleCloseTooltip();
                  }}
                  onMouseEnter={(e) => {
                    handleOpenTooltip({
                      e: e,
                      display: "top",
                      content: `期間を「月次・四半期・半期・年度」のタイプと期間を選択することで`,
                      content2: `その期間内でフィルターしたデータをダッシュボードに反映します。`,
                      marginTop: 28,
                      itemsPosition: "left",
                    });
                  }}
                  onMouseLeave={handleCloseTooltip}
                >
                  <span>2024 - 3月度</span>
                  <div className={`flow_underline brand_light one_px w-full`} />
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
          ref={sectionMenuRef}
          className={`${styles.settings_menu} fixed z-[3000] h-auto rounded-[6px] ${
            openSectionMenu.fadeType ? getFadeTypeClass(openSectionMenu.fadeType) : ``
          }`}
          style={{
            top: `${openSectionMenu.y}px`,
            ...((openSectionMenu.displayX === "center" || !openSectionMenu.displayX) && {
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
          {openSectionMenu.title === "dashboard" && (
            <>
              <h3 className={`w-full px-[20px] pt-[20px] text-[15px] font-bold`}>ダッシュボードメニュー</h3>

              <p className={`w-full px-[20px] pb-[12px] pt-[10px] text-[11px]`}>
                下記メニューから選択したダッシュボードを表示します。
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
                        // onMouseEnter={(e) => {
                        //   handleOpenPopupMenu({ e, title: "deals_status", displayX: "right", maxWidth: 360 });
                        // }}
                        // onMouseLeave={handleClosePopupMenu}
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

          {/* ------------------------ エンティティ選択メニュー ------------------------ */}
          {openSectionMenu.title === "entity" && (
            <>
              <h3 className={`w-full px-[20px] pt-[20px] text-[15px] font-bold`}>セクションメニュー</h3>

              <p className={`w-full px-[20px] pb-[12px] pt-[10px] text-[11px]`}>
                下記メニューから「全社・事業部・係/チーム・メンバー個人」を変更することで、各セクションに応じたデータを反映します。
              </p>

              <hr className="min-h-[1px] w-full bg-[#999]" />

              {/* -------- メニューコンテンツエリア -------- */}
              <div className={`${styles.scroll_container} flex max-h-[240px] w-full flex-col overflow-y-auto`}>
                <ul className={`flex h-full w-full flex-col`}>
                  {/* ------------------------------------ */}
                  {sectionList.map((obj, index) => {
                    const isActive = obj.title === activeSectionSDB;
                    return (
                      <li
                        key={obj.title}
                        className={`${styles.list} ${styles.select_list} ${isActive ? styles.active : ``}`}
                        onClick={(e) => {
                          if (isActive) return;
                          setActiveSectionSDB(obj.title);
                          handleClosePopupMenu();
                        }}
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
          {/* ------------------------ エンティティ選択メニュー ------------------------ */}

          {/* ------------------------ 期間選択メニュー ------------------------ */}
          {openSectionMenu.title === "period" && (
            <>
              <h3 className={`w-full px-[20px] pt-[20px] text-[15px] font-bold`}>
                <div className="flex max-w-max flex-col">
                  <span>期間選択メニュー</span>
                  <div className={`${styles.underline} w-full`} />
                </div>
              </h3>

              <p className={`w-full px-[20px] pb-[12px] pt-[10px] text-[11px]`}>
                下記メニューの期間から「月次・四半期・半期・年度」のいずれかを選択してから、後に表示される各期間ごとの選択肢を選択することで、各期間に応じたデータをダッシュボードに反映します。
              </p>

              <hr className="min-h-[1px] w-full bg-[#999]" />

              {/* -------- メニューコンテンツエリア -------- */}
              <div className={`${styles.scroll_container} flex max-h-[240px] w-full flex-col overflow-y-auto`}>
                <ul className={`flex h-full w-full flex-col`}>
                  {/* ------------------------------------ */}
                  <li className={`${styles.section_title} min-h-max w-full font-bold`}>
                    <div className="flex max-w-max flex-col">
                      <span>会計年度</span>
                      <div className={`${styles.underline} w-full`} />
                    </div>
                  </li>
                  <li
                    className={`${styles.list}`}
                    // onMouseEnter={(e) => {
                    //   handleOpenPopupMenu({ e, title: "displayFiscalYear", displayX: "right" });
                    // }}
                    // onMouseLeave={() => {
                    //   if (openPopupMenu) handleClosePopupMenu();
                    // }}
                  >
                    <div className="pointer-events-none flex min-w-[130px] items-center">
                      <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                      <div className="flex select-none items-center space-x-[2px]">
                        <span className={`${styles.list_title}`}>期間</span>
                        <span className={``}>：</span>
                      </div>
                    </div>
                    <select
                      className={`${styles.select_box} truncate`}
                      value={activePeriodSDB.period}
                      onChange={(e) => {
                        setActivePeriodSDB({ ...activePeriodSDB, period: e.target.value });
                        // if (openPopupMenu) handleClosePopupMenu();
                      }}
                    >
                      {periodList.map((option) => (
                        <option key={option.title} value={option.title}>
                          {option.name[language]}
                        </option>
                      ))}
                    </select>
                  </li>
                  {/* ------------------------------------ */}
                </ul>
              </div>
            </>
          )}
          {/* ------------------------ 期間選択メニュー ------------------------ */}
        </div>
      )}
      {/* ---------------------------- セッティングメニュー ここまで ---------------------------- */}
    </>
  );
};

export const SalesProgressScreen = memo(SalesProgressScreenMemo);
