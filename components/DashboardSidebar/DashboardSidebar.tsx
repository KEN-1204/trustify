import React, { FC, memo, useState } from "react";
import styles from "./DashboardSidebar.module.css";
import Link from "next/link";
import { GrHomeRounded, GrDocumentVerified, GrUserManager } from "react-icons/gr";
import { MdOutlineLeaderboard, MdOutlineAdminPanelSettings } from "react-icons/md";
import { HiOutlineBuildingOffice2, HiOutlineChatBubbleLeftRight, HiOutlineInboxArrowDown } from "react-icons/hi2";
import { FaLink, FaTelegramPlane } from "react-icons/fa";
import { AiOutlineMoneyCollect } from "react-icons/ai";
import { BiMoneyWithdraw } from "react-icons/bi";
import {
  BsTelephonePlus,
  BsCalendarDate,
  BsTelephoneInbound,
  BsChevronDown,
  BsCheckCircle,
  BsCheck2Circle,
} from "react-icons/bs";
import useStore from "@/store";
import useDashboardStore from "@/store/useDashboardStore";

export const DashboardSidebarMemo: FC = () => {
  const language = useStore((state) => state.language);
  const setHoveredItemPosHorizon = useStore((state) => state.setHoveredItemPosHorizon);
  const activeMenuTab = useDashboardStore((state) => state.activeMenuTab);
  const setActiveMenuTab = useDashboardStore((state) => state.setActiveMenuTab);
  const isOpenSideBarMenu = useDashboardStore((state) => state.isOpenSideBarMenu);
  const setIsOpenSideBarMenu = useDashboardStore((state) => state.setIsOpenSideBarMenu);
  const isOpenSideBarPickBox = useDashboardStore((state) => state.isOpenSideBarPickBox);
  const setIsOpenSideBarPickBox = useDashboardStore((state) => state.setIsOpenSideBarPickBox);
  const isOpenSidebar = useDashboardStore((state) => state.isOpenSidebar);
  //   const setIsOpenSidebar = useDashboardStore((state) => state.setIsOpenSidebar);

  // ツールチップ表示
  const handleOpenTooltip = (e: React.MouseEvent<HTMLElement, MouseEvent>, display: string) => {
    // ホバーしたアイテムにツールチップを表示
    const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
    // console.log(
    //   "マウスエンター ツールチップx, y width , height",
    //   x,
    //   y,
    //   width,
    //   height,
    //   (e.target as HTMLDivElement).dataset.text as string
    // );
    const content2 = ((e.target as HTMLDivElement).dataset.text2 as string)
      ? ((e.target as HTMLDivElement).dataset.text2 as string)
      : "";
    setHoveredItemPosHorizon({
      x: x,
      y: y,
      itemWidth: width,
      itemHeight: height,
      content: (e.target as HTMLDivElement).dataset.text as string,
      content2: content2,
      display: display,
    });
  };
  // ツールチップを非表示
  const handleCloseTooltip = () => {
    setHoveredItemPosHorizon(null);
  };
  return (
    <div
      className={`${styles.app_sidebar}  ${isOpenSidebar ? `transition-base02` : `${styles.mini} transition-base01`}`}
    >
      <div className={`${styles.wrapper}`}>
        <div className={styles.spacer} />
        <div className={styles.content_container}>
          <div className={`${styles.section}`}>
            {/* ========================= メニュータイトル ========================= */}
            <div
              className={`flex min-h-[46px] w-full items-center justify-start font-bold ${styles.section_title_area} ${
                isOpenSidebar ? "pl-[24px]" : "pl-[0px]"
              }`}
              //   style={{ borderBottom: "1px solid var(--color-border-deep)" }}
            >
              <div
                className={`cursor-pointer text-[var(--color-text)] hover:text-[var(--color-text-brand-f)] ${
                  styles.section_title
                } ${isOpenSidebar ? "w-[84px] " : "w-full "}`}
                data-text={`${
                  isOpenSidebar
                    ? `${isOpenSideBarMenu ? `クリックしてセクションを非表示` : `クリックしてセクションを表示`}`
                    : `${isOpenSideBarMenu ? `メニュー` : `メニュー`}`
                }`}
                data-text2={`${
                  isOpenSidebar
                    ? ``
                    : `${isOpenSideBarMenu ? `クリックしてセクションを非表示` : `クリックしてセクションを表示`}`
                }`}
                onClick={() => setIsOpenSideBarMenu(!isOpenSideBarMenu)}
                onMouseEnter={(e) => handleOpenTooltip(e, "left")}
                onMouseLeave={handleCloseTooltip}
              >
                {isOpenSidebar && (
                  <span
                    className={`pointer-events-none select-none whitespace-nowrap  ${
                      isOpenSidebar ? "" : "transition-base  text-[12px]"
                    }`}
                  >
                    メニュー
                  </span>
                )}

                {!isOpenSidebar && (
                  <div className="flex-col-center pointer-events-none w-full">
                    <span className="transition-base03 pointer-events-none scale-90 select-none whitespace-nowrap text-[10px] text-[var(--color-text)]">
                      メニュー
                    </span>
                    <BsChevronDown
                      className={`transition-base03 pointer-events-none stroke-[0.5] text-[24px] text-[var(--color-text)] ${
                        isOpenSideBarMenu ? "rotate-0" : "-rotate-180"
                      }`}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ディバイダー */}
            {!isOpenSidebar && <div className={`min-h-[2px] w-full bg-[var(--color-border)]`}></div>}

            {/* ========================= menu_container ここから ========================= */}
            <div
              className={`${styles.menu_container} transition-base01 space-y-2 ${
                isOpenSideBarMenu ? `${styles.open_menu}` : ""
              }`}
            >
              {/* ======================== メニューアイテム ここから ======================== */}
              <Link
                href="/home"
                prefetch={false}
                className={`${styles.menu_item} ${activeMenuTab === "HOME" ? styles.active : ""} `}
                onClick={() => setActiveMenuTab("HOME")}
              >
                <div
                  className={`${styles.menu_item_inner}`}
                  data-text="ホーム"
                  onMouseEnter={(e) => {
                    if (isOpenSidebar) return;
                    handleOpenTooltip(e, "left");
                  }}
                  onMouseLeave={() => {
                    if (isOpenSidebar) return;
                    handleCloseTooltip();
                  }}
                >
                  <div className={styles.icon_wrapper}>
                    <GrHomeRounded
                      className={`scale-[0.8] text-[24px] text-[var(--color-text)] ${styles.sidebar_icon}`}
                    />
                  </div>
                  <div
                    className={`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 opacity-0`
                    }`}
                  >
                    <span>ホーム</span>
                  </div>
                </div>
              </Link>
              <div
                // href="/home"
                // prefetch={false}
                className={`${styles.menu_item} ${activeMenuTab === "Company" ? styles.active : ""} `}
                onClick={() => setActiveMenuTab("Company")}
              >
                <div
                  className={styles.menu_item_inner}
                  data-text="会社"
                  onMouseEnter={(e) => {
                    if (isOpenSidebar) return;
                    handleOpenTooltip(e, "left");
                  }}
                  onMouseLeave={() => {
                    if (isOpenSidebar) return;
                    handleCloseTooltip();
                  }}
                >
                  <div className={styles.icon_wrapper}>
                    <HiOutlineBuildingOffice2
                      className={`${styles.sidebar_icon} text-[24px] text-[var(--color-text)]`}
                    />
                  </div>
                  <div
                    className={`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 opacity-0`
                    }`}
                  >
                    <span>会社</span>
                  </div>
                </div>
              </div>
              <div
                // href="/home"
                // prefetch={false}
                className={`${styles.menu_item} ${activeMenuTab === "Contacts" ? styles.active : ""} `}
                onClick={() => setActiveMenuTab("Contacts")}
              >
                <div
                  className={styles.menu_item_inner}
                  data-text="担当者"
                  onMouseEnter={(e) => {
                    if (isOpenSidebar) return;
                    handleOpenTooltip(e, "left");
                  }}
                  onMouseLeave={() => {
                    if (isOpenSidebar) return;
                    handleCloseTooltip();
                  }}
                >
                  <div className={styles.icon_wrapper}>
                    {/* <HiOutlineChatBubbleLeftRight className="text-[24px] text-[var(--color-text)]" /> */}
                    {/* <FaUserTie className="scale-[0.9] text-[24px] text-[var(--color-text)]" /> */}
                    <GrUserManager
                      className={`${styles.sidebar_icon} scale-[0.9] text-[24px] text-[var(--color-text)]`}
                    />
                  </div>
                  <div
                    className={`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 opacity-0`
                    }`}
                  >
                    <span>担当者</span>
                  </div>
                </div>
              </div>
              <div
                // href="/home"
                // prefetch={false}
                className={`${styles.menu_item} ${activeMenuTab === "Activity" ? styles.active : ""} `}
                onClick={() => setActiveMenuTab("Activity")}
              >
                <div
                  className={styles.menu_item_inner}
                  data-text="活動"
                  onMouseEnter={(e) => {
                    if (isOpenSidebar) return;
                    handleOpenTooltip(e, "left");
                  }}
                  onMouseLeave={() => {
                    if (isOpenSidebar) return;
                    handleCloseTooltip();
                  }}
                >
                  <div className={styles.icon_wrapper}>
                    {/* <HiOutlineChatBubbleLeftRight className="text-[24px] text-[var(--color-text)]" /> */}
                    <BsTelephonePlus
                      className={`${styles.sidebar_icon} scale-[0.9] text-[24px] text-[var(--color-text)]`}
                    />
                  </div>
                  <div
                    className={`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 opacity-0`
                    }`}
                  >
                    <span>活動</span>
                  </div>
                </div>
              </div>
              <div
                // href="/home"
                // prefetch={false}
                className={`${styles.menu_item} ${activeMenuTab === "Meeting" ? styles.active : ""} `}
                onClick={() => setActiveMenuTab("Meeting")}
              >
                <div
                  className={styles.menu_item_inner}
                  data-text="面談・訪問"
                  onMouseEnter={(e) => {
                    if (isOpenSidebar) return;
                    handleOpenTooltip(e, "left");
                  }}
                  onMouseLeave={() => {
                    if (isOpenSidebar) return;
                    handleCloseTooltip();
                  }}
                >
                  <div className={styles.icon_wrapper}>
                    {/* <BsTelephonePlus className="scale-[0.9] text-[24px] text-[var(--color-text)]" /> */}
                    <HiOutlineChatBubbleLeftRight
                      className={`${styles.sidebar_icon} scale-[1] text-[24px] text-[var(--color-text)]`}
                    />
                  </div>
                  <div
                    className={`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 opacity-0`
                    }`}
                  >
                    <span>面談・訪問</span>
                  </div>
                </div>
              </div>
              <div
                // href="/home"
                // prefetch={false}
                className={`${styles.menu_item} ${activeMenuTab === "Property" ? styles.active : ""} `}
                onClick={() => setActiveMenuTab("Property")}
              >
                <div
                  className={styles.menu_item_inner}
                  data-text="案件"
                  onMouseEnter={(e) => {
                    if (isOpenSidebar) return;
                    handleOpenTooltip(e, "left");
                  }}
                  onMouseLeave={() => {
                    if (isOpenSidebar) return;
                    handleCloseTooltip();
                  }}
                >
                  <div className={styles.icon_wrapper}>
                    {language === "Ja" && (
                      <>
                        {/* <RiMoneyCnyCircleLine className="scale-[1.05] text-[24px] text-[var(--color-text)]" /> */}
                        <AiOutlineMoneyCollect
                          className={`${styles.sidebar_icon} scale-[1.05] text-[24px] text-[var(--color-text)]`}
                        />
                      </>
                    )}
                    {language === "En" && (
                      <>
                        {/* <RiMoneyDollarCircleLine className="scale-[1.05] text-[24px] text-[var(--color-text)]" /> */}
                        <BiMoneyWithdraw
                          className={`${styles.sidebar_icon} scale-[1.05] text-[24px] text-[var(--color-text)]`}
                        />
                      </>
                    )}
                  </div>
                  <div
                    className={`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 opacity-0`
                    }`}
                  >
                    <span>案件</span>
                  </div>
                </div>
              </div>
              <div
                // href="/home"
                // prefetch={false}
                className={`${styles.menu_item} ${activeMenuTab === "Calendar" ? styles.active : ""} `}
                onClick={() => setActiveMenuTab("Calendar")}
              >
                <div
                  className={styles.menu_item_inner}
                  data-text="カレンダー"
                  onMouseEnter={(e) => {
                    if (isOpenSidebar) return;
                    handleOpenTooltip(e, "left");
                  }}
                  onMouseLeave={() => {
                    if (isOpenSidebar) return;
                    handleCloseTooltip();
                  }}
                >
                  <div className={styles.icon_wrapper}>
                    {/* <RiCalendar2Fill className="text-[24px] text-[var(--color-text)]" /> */}
                    <BsCalendarDate
                      className={`${styles.sidebar_icon} scale-[0.9] text-[24px] text-[var(--color-text)]`}
                    />
                  </div>
                  <div
                    className={`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 opacity-0`
                    }`}
                  >
                    <span>カレンダー</span>
                  </div>
                </div>
              </div>

              <div
                // href="/home"
                // prefetch={false}
                className={`${styles.menu_item} ${activeMenuTab === "Quotation" ? styles.active : ""} `}
                onClick={() => setActiveMenuTab("Quotation")}
              >
                <div
                  className={styles.menu_item_inner}
                  data-text="見積"
                  onMouseEnter={(e) => {
                    if (isOpenSidebar) return;
                    handleOpenTooltip(e, "left");
                  }}
                  onMouseLeave={() => {
                    if (isOpenSidebar) return;
                    handleCloseTooltip();
                  }}
                >
                  <div className={styles.icon_wrapper}>
                    {/* <GrDocumentDownload className="scale-[0.9] text-[24px]" /> */}
                    {/* <GrDocumentText className="scale-[0.9] text-[24px]" /> */}
                    <GrDocumentVerified className={`${styles.sidebar_icon} scale-[0.9] text-[24px]`} />
                  </div>
                  <div
                    className={`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 opacity-0`
                    }`}
                  >
                    <span>見積</span>
                  </div>
                </div>
              </div>
              <div
                className={`${styles.menu_item} ${activeMenuTab === "Lead" ? styles.active : ""} `}
                // href="/home"
                // prefetch={false}
                // onClick={() => setActiveMenuTab("Lead")}
              >
                <div
                  className={styles.menu_item_inner}
                  data-text="開発・準備中..."
                  onMouseEnter={(e) => {
                    if (isOpenSidebar) return;
                    handleOpenTooltip(e, "left");
                  }}
                  onMouseLeave={() => {
                    if (isOpenSidebar) return;
                    handleCloseTooltip();
                  }}
                >
                  <div className={styles.icon_wrapper}>
                    <BsTelephoneInbound
                      className={`${styles.sidebar_icon} scale-[0.85] text-[24px] text-[var(--color-text)]`}
                    />
                  </div>
                  <div
                    className={`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 opacity-0`
                    }`}
                  >
                    <span>引合・リード</span>
                  </div>
                </div>
              </div>
              <div
                // href="/home"
                // prefetch={false}
                className={`${styles.menu_item} ${activeMenuTab === "Alignment" ? styles.active : ""} `}
                onClick={() => setActiveMenuTab("Alignment")}
              >
                <div
                  className={styles.menu_item_inner}
                  data-text="連携"
                  onMouseEnter={(e) => {
                    if (isOpenSidebar) return;
                    handleOpenTooltip(e, "left");
                  }}
                  onMouseLeave={() => {
                    if (isOpenSidebar) return;
                    handleCloseTooltip();
                  }}
                >
                  <div className={styles.icon_wrapper}>
                    <FaLink className={`${styles.sidebar_icon} scale-[0.85] text-[24px] text-[var(--color-text)]`} />
                  </div>
                  <div
                    className={`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 opacity-0`
                    }`}
                  >
                    <span className="truncate">連携</span>
                  </div>
                </div>
              </div>
              <div
                // href="/home"
                // prefetch={false}
                className={`${styles.menu_item} ${activeMenuTab === "Message" ? styles.active : ""} `}
                onClick={() => setActiveMenuTab("Message")}
              >
                <div
                  className={styles.menu_item_inner}
                  data-text="メッセージ"
                  onMouseEnter={(e) => {
                    if (isOpenSidebar) return;
                    handleOpenTooltip(e, "left");
                  }}
                  onMouseLeave={() => {
                    if (isOpenSidebar) return;
                    handleCloseTooltip();
                  }}
                >
                  <div className={styles.icon_wrapper}>
                    <FaTelegramPlane className={`${styles.sidebar_icon} text-[24px] text-[var(--color-text)]`} />
                  </div>
                  <div
                    className={`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 opacity-0`
                    }`}
                  >
                    <span className="truncate">メッセージ</span>
                  </div>
                </div>
              </div>
              <div
                // href="/home"
                // prefetch={false}
                className={`${styles.menu_item} ${activeMenuTab === "SDB" ? styles.active : ""} `}
                onClick={() => setActiveMenuTab("SDB")}
              >
                <div
                  className={`${styles.menu_item_inner}`}
                  data-text="セールスダッシュボード"
                  onMouseEnter={(e) => handleOpenTooltip(e, "left")}
                  onMouseLeave={handleCloseTooltip}
                >
                  <div className={`${styles.icon_wrapper}`}>
                    <MdOutlineLeaderboard className={`${styles.sidebar_icon} text-[24px] text-[var(--color-text)]`} />
                  </div>
                  <div
                    className={`${`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 opacity-0`
                    }`}`}
                  >
                    <span className="truncate">セールスダッシュボード</span>
                  </div>
                </div>
              </div>
              <div
                // href="/home"
                // prefetch={false}
                className={`${styles.menu_item} ${activeMenuTab === "Admin" ? styles.active : ""} `}
                onClick={() => setActiveMenuTab("Admin")}
              >
                <div
                  className={styles.menu_item_inner}
                  data-text="管理者"
                  onMouseEnter={(e) => {
                    if (isOpenSidebar) return;
                    handleOpenTooltip(e, "left");
                  }}
                  onMouseLeave={() => {
                    if (isOpenSidebar) return;
                    handleCloseTooltip();
                  }}
                >
                  <div className={styles.icon_wrapper}>
                    <MdOutlineAdminPanelSettings
                      className={`${styles.sidebar_icon} text-[24px] text-[var(--color-text)]`}
                    />
                  </div>
                  <div
                    className={`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 opacity-0`
                    }`}
                  >
                    <span>管理者</span>
                  </div>
                </div>
              </div>
              <div
                // href="/home"
                // prefetch={false}
                className={`${styles.menu_item} ${activeMenuTab === "Pre-approval" ? styles.active : ""} `}
                onClick={() => setActiveMenuTab("Pre-approval")}
              >
                <div
                  className={styles.menu_item_inner}
                  // data-text="事前承認・稟議"
                  data-text="開発・準備中..."
                  onMouseEnter={(e) => {
                    if (isOpenSidebar) return;
                    handleOpenTooltip(e, "left");
                  }}
                  onMouseLeave={() => {
                    if (isOpenSidebar) return;
                    handleCloseTooltip();
                  }}
                >
                  <div className={styles.icon_wrapper}>
                    {/* <BsCheckCircle className="text-[24px] text-[var(--color-text)]" /> */}
                    <BsCheck2Circle className={`${styles.sidebar_icon} text-[24px] text-[var(--color-text)]`} />
                  </div>
                  <div
                    className={`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 opacity-0`
                    }`}
                  >
                    <span>事前承認・稟議</span>
                  </div>
                </div>
              </div>
              {/* ======================== メニューアイテム ここまで ======================== */}
            </div>
            {/* ========================= menu_container ここまで ========================= */}
            {/* ========================= 🌟メニュー ここまで ========================= */}

            {/* ========================= 🌟ピックボックス ここから ========================= */}
            {/* ========================= ピックボックスタイトル ========================= */}
            <div
              className={`flex min-h-[46px] w-full items-center justify-start font-bold ${styles.section_title_area}  ${
                isOpenSidebar ? "pl-[24px]" : "pl-[0px]"
              } border border-b-black`}
            >
              <div
                className={`flex min-w-fit cursor-pointer items-center text-[var(--color-text)] hover:text-[var(--color-text-brand-f)] ${
                  styles.section_title
                }  ${isOpenSidebar ? "w-[84px] pr-[20px]" : "flex-center w-full"}`}
                data-text={`${
                  isOpenSidebar
                    ? `${isOpenSideBarPickBox ? `クリックしてセクションを非表示` : `クリックしてセクションを表示`}`
                    : `${isOpenSideBarPickBox ? `ピックボックス` : `ピックボックス`}`
                }`}
                data-text2={`${
                  isOpenSidebar
                    ? ``
                    : `${isOpenSideBarPickBox ? `クリックしてセクションを非表示` : `クリックしてセクションを表示`}`
                }`}
                onClick={() => setIsOpenSideBarPickBox(!isOpenSideBarPickBox)}
                onMouseEnter={(e) => handleOpenTooltip(e, "left")}
                onMouseLeave={handleCloseTooltip}
              >
                {isOpenSidebar && (
                  <span className={`pointer-events-none select-none whitespace-nowrap`}>ピックボックス</span>
                )}
                {!isOpenSidebar && (
                  <div className="flex-col-center pointer-events-none w-full">
                    <span className="transition-base03 pointer-events-none scale-75 select-none whitespace-nowrap text-[8px] text-[var(--color-text)]">
                      ピックボックス
                    </span>
                    <BsChevronDown
                      className={`transition-base03 pointer-events-none stroke-[0.5] text-[24px] text-[var(--color-text)] hover:stroke-[var(--color-text-brand-f)] ${
                        isOpenSideBarPickBox ? "rotate-0" : "-rotate-180"
                      } `}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ディバイダー */}
            {!isOpenSidebar && <div className={`min-h-[2px] w-full bg-[var(--color-border)]`}></div>}

            {/* ========================= pickbox_container ここから ========================= */}
            <div
              className={`${styles.menu_container} transition-base01 space-y-2 ${
                isOpenSideBarPickBox ? `${styles.open_menu}` : ""
              }`}
            >
              {/* ======================== メニューアイテム ここから ======================== */}
              <Link
                href="/home"
                prefetch={false}
                className={`${styles.menu_item} ${activeMenuTab === "PickBox1" ? styles.active : ""} `}
                onClick={() => setActiveMenuTab("PickBox1")}
              >
                <div
                  className={`${styles.menu_item_inner} ${isOpenSidebar ? "" : `${styles.pickbox_mini}`}`}
                  data-text="ピックボックス１"
                  onMouseEnter={(e) => {
                    if (isOpenSidebar) return;
                    handleOpenTooltip(e, "left");
                  }}
                  onMouseLeave={() => {
                    if (isOpenSidebar) return;
                    handleCloseTooltip();
                  }}
                >
                  <div className={`${styles.icon_wrapper}`} style={!isOpenSidebar ? { flexDirection: "column" } : {}}>
                    <HiOutlineInboxArrowDown className="text-[24px] text-[var(--color-text)]" />
                    {!isOpenSidebar && (
                      <span className="pointer-events-none scale-[0.8] select-none truncate text-[10px]">
                        ピックボックス１
                      </span>
                    )}
                  </div>
                  <div
                    className={`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 hidden opacity-0`
                    }`}
                  >
                    <span>ピックボックス１</span>
                  </div>
                </div>
              </Link>
              <Link
                href="/home"
                prefetch={false}
                className={`${styles.menu_item} ${activeMenuTab === "PickBox2" ? styles.active : ""} `}
                onClick={() => setActiveMenuTab("PickBox2")}
              >
                <div
                  className={`${styles.menu_item_inner} ${isOpenSidebar ? "" : `${styles.pickbox_mini}`}`}
                  data-text="ピックボックス２"
                  onMouseEnter={(e) => {
                    if (isOpenSidebar) return;
                    handleOpenTooltip(e, "left");
                  }}
                  onMouseLeave={() => {
                    if (isOpenSidebar) return;
                    handleCloseTooltip();
                  }}
                >
                  <div className={`${styles.icon_wrapper}`} style={!isOpenSidebar ? { flexDirection: "column" } : {}}>
                    <HiOutlineInboxArrowDown className="text-[24px] text-[var(--color-text)]" />
                    {!isOpenSidebar && (
                      <span className="pointer-events-none scale-[0.8] select-none truncate text-[10px]">
                        ピックボックス２
                      </span>
                    )}
                  </div>
                  <div
                    className={`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 hidden opacity-0`
                    }`}
                  >
                    <span>ピックボックス２</span>
                  </div>
                </div>
              </Link>
              <Link
                href="/home"
                prefetch={false}
                className={`${styles.menu_item} ${activeMenuTab === "PickBox3" ? styles.active : ""} `}
                onClick={() => setActiveMenuTab("PickBox3")}
              >
                <div
                  className={`${styles.menu_item_inner} ${isOpenSidebar ? "" : `${styles.pickbox_mini}`}`}
                  data-text="ピックボックス３"
                  onMouseEnter={(e) => {
                    if (isOpenSidebar) return;
                    handleOpenTooltip(e, "left");
                  }}
                  onMouseLeave={() => {
                    if (isOpenSidebar) return;
                    handleCloseTooltip();
                  }}
                >
                  <div className={`${styles.icon_wrapper}`} style={!isOpenSidebar ? { flexDirection: "column" } : {}}>
                    <HiOutlineInboxArrowDown className="text-[24px] text-[var(--color-text)]" />
                    {!isOpenSidebar && (
                      <span className="pointer-events-none scale-[0.8] select-none truncate text-[10px]">
                        ピックボックス３
                      </span>
                    )}
                  </div>
                  <div
                    className={`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 hidden opacity-0`
                    }`}
                  >
                    <span>ピックボックス３</span>
                  </div>
                </div>
              </Link>
              <Link
                href="/home"
                prefetch={false}
                className={`${styles.menu_item} ${activeMenuTab === "PickBox4" ? styles.active : ""} `}
                onClick={() => setActiveMenuTab("PickBox4")}
              >
                <div
                  className={`${styles.menu_item_inner} ${isOpenSidebar ? "" : `${styles.pickbox_mini}`}`}
                  data-text="ピックボックス４"
                  onMouseEnter={(e) => {
                    if (isOpenSidebar) return;
                    handleOpenTooltip(e, "left");
                  }}
                  onMouseLeave={() => {
                    if (isOpenSidebar) return;
                    handleCloseTooltip();
                  }}
                >
                  <div className={`${styles.icon_wrapper}`} style={!isOpenSidebar ? { flexDirection: "column" } : {}}>
                    <HiOutlineInboxArrowDown className="text-[24px] text-[var(--color-text)]" />
                    {!isOpenSidebar && (
                      <span className="pointer-events-none scale-[0.8] select-none truncate text-[10px]">
                        ピックボックス４
                      </span>
                    )}
                  </div>
                  <div
                    className={`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 hidden opacity-0`
                    }`}
                  >
                    <span>ピックボックス４</span>
                  </div>
                </div>
              </Link>
              <Link
                href="/home"
                prefetch={false}
                className={`${styles.menu_item} ${activeMenuTab === "PickBox5" ? styles.active : ""} `}
                onClick={() => setActiveMenuTab("PickBox5")}
              >
                <div
                  className={`${styles.menu_item_inner} ${isOpenSidebar ? "" : `${styles.pickbox_mini}`}`}
                  data-text="ピックボックス５"
                  onMouseEnter={(e) => {
                    if (isOpenSidebar) return;
                    handleOpenTooltip(e, "left");
                  }}
                  onMouseLeave={() => {
                    if (isOpenSidebar) return;
                    handleCloseTooltip();
                  }}
                >
                  <div className={`${styles.icon_wrapper}`} style={!isOpenSidebar ? { flexDirection: "column" } : {}}>
                    <HiOutlineInboxArrowDown className="text-[24px] text-[var(--color-text)]" />
                    {!isOpenSidebar && (
                      <span className="pointer-events-none scale-[0.8] select-none truncate text-[10px]">
                        ピックボックス５
                      </span>
                    )}
                  </div>
                  <div
                    className={`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 hidden opacity-0`
                    }`}
                  >
                    <span>ピックボックス５</span>
                  </div>
                </div>
              </Link>
              <Link
                href="/home"
                prefetch={false}
                className={`${styles.menu_item} ${activeMenuTab === "PickBox6" ? styles.active : ""} `}
                onClick={() => setActiveMenuTab("PickBox6")}
              >
                <div
                  className={`${styles.menu_item_inner} ${isOpenSidebar ? "" : `${styles.pickbox_mini}`}`}
                  data-text="ピックボックス６"
                  onMouseEnter={(e) => {
                    if (isOpenSidebar) return;
                    handleOpenTooltip(e, "left");
                  }}
                  onMouseLeave={() => {
                    if (isOpenSidebar) return;
                    handleCloseTooltip();
                  }}
                >
                  <div className={`${styles.icon_wrapper}`} style={!isOpenSidebar ? { flexDirection: "column" } : {}}>
                    <HiOutlineInboxArrowDown className="text-[24px] text-[var(--color-text)]" />
                    {!isOpenSidebar && (
                      <span className="pointer-events-none scale-[0.8] select-none truncate text-[10px]">
                        ピックボックス６
                      </span>
                    )}
                  </div>
                  <div
                    className={`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 hidden opacity-0`
                    }`}
                  >
                    <span>ピックボックス６</span>
                  </div>
                </div>
              </Link>
              <Link
                href="/home"
                prefetch={false}
                className={`${styles.menu_item} ${activeMenuTab === "PickBox7" ? styles.active : ""} `}
                onClick={() => setActiveMenuTab("PickBox7")}
              >
                <div
                  className={`${styles.menu_item_inner} ${isOpenSidebar ? "" : `${styles.pickbox_mini}`}`}
                  data-text="ピックボックス７"
                  onMouseEnter={(e) => {
                    if (isOpenSidebar) return;
                    handleOpenTooltip(e, "left");
                  }}
                  onMouseLeave={() => {
                    if (isOpenSidebar) return;
                    handleCloseTooltip();
                  }}
                >
                  <div className={`${styles.icon_wrapper}`} style={!isOpenSidebar ? { flexDirection: "column" } : {}}>
                    <HiOutlineInboxArrowDown className="text-[24px] text-[var(--color-text)]" />
                    {!isOpenSidebar && (
                      <span className="pointer-events-none scale-[0.8] select-none truncate text-[10px]">
                        ピックボックス７
                      </span>
                    )}
                  </div>
                  <div
                    className={`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 hidden opacity-0`
                    }`}
                  >
                    <span>ピックボックス７</span>
                  </div>
                </div>
              </Link>
              <Link
                href="/home"
                prefetch={false}
                className={`${styles.menu_item} ${activeMenuTab === "PickBox8" ? styles.active : ""} `}
                onClick={() => setActiveMenuTab("PickBox8")}
              >
                <div
                  className={`${styles.menu_item_inner} ${isOpenSidebar ? "" : `${styles.pickbox_mini}`}`}
                  data-text="ピックボックス８"
                  onMouseEnter={(e) => {
                    if (isOpenSidebar) return;
                    handleOpenTooltip(e, "left");
                  }}
                  onMouseLeave={() => {
                    if (isOpenSidebar) return;
                    handleCloseTooltip();
                  }}
                >
                  <div className={`${styles.icon_wrapper}`} style={!isOpenSidebar ? { flexDirection: "column" } : {}}>
                    <HiOutlineInboxArrowDown className="text-[24px] text-[var(--color-text)]" />
                    {!isOpenSidebar && (
                      <span className="pointer-events-none scale-[0.8] select-none truncate text-[10px]">
                        ピックボックス８
                      </span>
                    )}
                  </div>
                  <div
                    className={`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 hidden opacity-0`
                    }`}
                  >
                    <span>ピックボックス８</span>
                  </div>
                </div>
              </Link>
              <div
                className={`${styles.menu_item} ${activeMenuTab === "PickBox9" ? styles.active : ""} `}
                // href="/home"
                // prefetch={false}
                // onClick={() => setActiveMenuTab("PickBox9")}
              >
                <div
                  className={`${styles.menu_item_inner} ${isOpenSidebar ? "" : `${styles.pickbox_mini}`}`}
                  data-text="ピックボックス９"
                  onMouseEnter={(e) => {
                    if (isOpenSidebar) return;
                    handleOpenTooltip(e, "left");
                  }}
                  onMouseLeave={() => {
                    if (isOpenSidebar) return;
                    handleCloseTooltip();
                  }}
                >
                  <div className={`${styles.icon_wrapper}`} style={!isOpenSidebar ? { flexDirection: "column" } : {}}>
                    <HiOutlineInboxArrowDown className="text-[24px] text-[var(--color-text)]" />
                    {!isOpenSidebar && (
                      <span className="pointer-events-none scale-[0.8] select-none truncate text-[10px]">
                        ピックボックス９
                      </span>
                    )}
                  </div>
                  <div
                    className={`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 hidden opacity-0`
                    }`}
                  >
                    <span>ピックボックス９</span>
                  </div>
                </div>
              </div>
              <Link
                href="/home"
                prefetch={false}
                className={`${styles.menu_item} ${activeMenuTab === "PickBox10" ? styles.active : ""} `}
                onClick={() => setActiveMenuTab("PickBox10")}
              >
                <div
                  className={`${styles.menu_item_inner} ${isOpenSidebar ? "" : `${styles.pickbox_mini}`}`}
                  data-text="ピックボックス１０"
                  onMouseEnter={(e) => {
                    if (isOpenSidebar) return;
                    handleOpenTooltip(e, "left");
                  }}
                  onMouseLeave={() => {
                    if (isOpenSidebar) return;
                    handleCloseTooltip();
                  }}
                >
                  <div
                    className={`${styles.icon_wrapper} !max-w-[40px]`}
                    style={!isOpenSidebar ? { flexDirection: "column" } : {}}
                  >
                    <HiOutlineInboxArrowDown className="text-[24px] text-[var(--color-text)]" />
                    {!isOpenSidebar && (
                      <span className="pointer-events-none scale-[0.8] select-none truncate text-[10px]">
                        ピックボックスピック
                      </span>
                    )}
                  </div>
                  <div
                    className={`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 hidden opacity-0`
                    }`}
                  >
                    <span>ピックボックス１０</span>
                  </div>
                </div>
              </Link>
              {/* ======================== メニューアイテム ここまで ======================== */}
            </div>
            {/* ========================= menu_container ここまで ========================= */}
          </div>
        </div>
      </div>
    </div>
  );
};

export const DashboardSidebar = memo(DashboardSidebarMemo);
