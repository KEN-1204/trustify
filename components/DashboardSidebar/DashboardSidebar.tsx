import React, { FC, memo, useState } from "react";
import styles from "./DashboardSidebar.module.css";
import Link from "next/link";
import { GrHomeRounded, GrDocumentDownload, GrDocumentText, GrDocumentVerified, GrUserManager } from "react-icons/gr";
import { MdHomeFilled, MdOutlineLeaderboard, MdOutlineAdminPanelSettings } from "react-icons/md";
import { HiOutlineBuildingOffice2, HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import { RiContactsLine, RiCalendar2Fill, RiMoneyCnyCircleLine, RiMoneyDollarCircleLine } from "react-icons/ri";
import { RxActivityLog } from "react-icons/rx";
import { FaLink, FaUserTie } from "react-icons/fa";
import { AiOutlineMoneyCollect } from "react-icons/ai";
import { BiMoneyWithdraw } from "react-icons/bi";
import { BsTelephonePlus, BsCalendarDate, BsTelephoneInbound } from "react-icons/bs";
import useStore from "@/store";
import useDashboardStore from "@/store/useDashboardStore";

export const DashboardSidebarMemo: FC = () => {
  const language = useStore((state) => state.language);
  const setHoveredItemPosHorizon = useStore((state) => state.setHoveredItemPosHorizon);
  const activeMenuTab = useDashboardStore((state) => state.activeMenuTab);
  const setActiveMenuTab = useDashboardStore((state) => state.setActiveMenuTab);
  const isOpenSideBarMenu = useDashboardStore((state) => state.isOpenSideBarMenu);
  const setIsOpenSideBarMenu = useDashboardStore((state) => state.setIsOpenSideBarMenu);
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
              className={`my-[8px] flex min-h-[30px] w-full items-center  justify-start font-bold ${
                isOpenSidebar ? "pl-[24px]" : "pl-[12px]"
              }`}
            >
              <div
                className={`cursor-pointer text-[var(--color-text)] hover:text-[var(--color-text-brand-f)] ${
                  isOpenSidebar ? "w-[84px] " : "w-full "
                }`}
                data-text={`${isOpenSideBarMenu ? `クリックしてセクションを非表示` : `クリックしてセクションを表示`}`}
                onClick={() => setIsOpenSideBarMenu(!isOpenSideBarMenu)}
                onMouseEnter={(e) => handleOpenTooltip(e, "left")}
                onMouseLeave={handleCloseTooltip}
              >
                <span
                  className={`pointer-events-none select-none whitespace-nowrap  ${
                    isOpenSidebar ? "" : "transition-base  text-[12px]"
                  }`}
                >
                  メニュー
                </span>
              </div>
            </div>
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
                    <GrHomeRounded className="scale-[0.8] text-[24px] text-[var(--color-text)]" />
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
              <Link
                href="/home"
                prefetch={false}
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
                    <HiOutlineBuildingOffice2 className="text-[24px] text-[var(--color-text)]" />
                  </div>
                  <div
                    className={`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 opacity-0`
                    }`}
                  >
                    <span>会社</span>
                  </div>
                </div>
              </Link>
              <Link
                href="/home"
                prefetch={false}
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
                    <GrUserManager className="scale-[0.9] text-[24px] text-[var(--color-text)]" />
                  </div>
                  <div
                    className={`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 opacity-0`
                    }`}
                  >
                    <span>担当者</span>
                  </div>
                </div>
              </Link>
              <Link
                href="/home"
                prefetch={false}
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
                    <BsTelephonePlus className="scale-[0.9] text-[24px] text-[var(--color-text)]" />
                  </div>
                  <div
                    className={`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 opacity-0`
                    }`}
                  >
                    <span>活動</span>
                  </div>
                </div>
              </Link>
              <Link
                href="/home"
                prefetch={false}
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
                    <HiOutlineChatBubbleLeftRight className="scale-[1] text-[24px] text-[var(--color-text)]" />
                  </div>
                  <div
                    className={`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 opacity-0`
                    }`}
                  >
                    <span>面談・訪問</span>
                  </div>
                </div>
              </Link>
              <Link
                href="/home"
                prefetch={false}
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
                    <BsCalendarDate className="scale-[0.9] text-[24px] text-[var(--color-text)]" />
                  </div>
                  <div
                    className={`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 opacity-0`
                    }`}
                  >
                    <span>カレンダー</span>
                  </div>
                </div>
              </Link>
              <Link
                href="/home"
                prefetch={false}
                className={`${styles.menu_item} ${activeMenuTab === "Property" ? styles.active : ""} `}
                onClick={() => setActiveMenuTab("Property")}
              >
                <div
                  className={styles.menu_item_inner}
                  data-text="物件"
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
                        <AiOutlineMoneyCollect className="scale-[1.05] text-[24px] text-[var(--color-text)]" />
                      </>
                    )}
                    {language === "En" && (
                      <>
                        {/* <RiMoneyDollarCircleLine className="scale-[1.05] text-[24px] text-[var(--color-text)]" /> */}
                        <BiMoneyWithdraw className="scale-[1.05] text-[24px] text-[var(--color-text)]" />
                      </>
                    )}
                  </div>
                  <div
                    className={`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 opacity-0`
                    }`}
                  >
                    <span>物件</span>
                  </div>
                </div>
              </Link>
              <Link
                href="/home"
                prefetch={false}
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
                    <GrDocumentVerified className="scale-[0.9] text-[24px]" />
                  </div>
                  <div
                    className={`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 opacity-0`
                    }`}
                  >
                    <span>見積</span>
                  </div>
                </div>
              </Link>
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
                    <BsTelephoneInbound className="scale-[0.9] text-[24px] text-[var(--color-text)]" />
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
              <Link
                href="/home"
                prefetch={false}
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
                    <FaLink className="scale-[0.9] text-[24px] text-[var(--color-text)]" />
                  </div>
                  <div
                    className={`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 opacity-0`
                    }`}
                  >
                    <span className="truncate">連携</span>
                  </div>
                </div>
              </Link>
              <Link
                href="/home"
                prefetch={false}
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
                    <MdOutlineLeaderboard className="text-[24px] text-[var(--color-text)]" />
                  </div>
                  <div
                    className={`${`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 opacity-0`
                    }`}`}
                  >
                    <span className="truncate">セールスダッシュボード</span>
                  </div>
                </div>
              </Link>
              <Link
                href="/home"
                prefetch={false}
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
                    <MdOutlineAdminPanelSettings className="text-[24px] text-[var(--color-text)]" />
                  </div>
                  <div
                    className={`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 opacity-0`
                    }`}
                  >
                    <span>管理者</span>
                  </div>
                </div>
              </Link>
              {/* ======================== メニューアイテム ここまで ======================== */}
            </div>
            {/* ========================= menu_container ここまで ========================= */}

            {/* ========================= pickbox_container ここから ========================= */}
            {/* ========================= ピックボックスタイトル ========================= */}
            <div
              className={`my-[8px] flex min-h-[30px] w-full items-center  justify-start font-bold ${
                isOpenSidebar ? "pl-[24px]" : "pl-[12px]"
              }`}
            >
              <div
                className={`cursor-pointer text-[var(--color-text)] hover:text-[var(--color-text-brand-f)] ${
                  isOpenSidebar ? "w-[84px] " : "w-full "
                }`}
                data-text={`${isOpenSideBarMenu ? `クリックしてセクションを非表示` : `クリックしてセクションを表示`}`}
                onClick={() => setIsOpenSideBarMenu(!isOpenSideBarMenu)}
                onMouseEnter={(e) => handleOpenTooltip(e, "left")}
                onMouseLeave={handleCloseTooltip}
              >
                <span
                  className={`pointer-events-none select-none whitespace-nowrap  ${
                    isOpenSidebar ? "" : "transition-base  text-[12px]"
                  }`}
                >
                  ピックボックス
                </span>
              </div>
            </div>
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
                    <GrHomeRounded className="scale-[0.8] text-[24px] text-[var(--color-text)]" />
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
              <Link
                href="/home"
                prefetch={false}
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
                    <HiOutlineBuildingOffice2 className="text-[24px] text-[var(--color-text)]" />
                  </div>
                  <div
                    className={`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 opacity-0`
                    }`}
                  >
                    <span>会社</span>
                  </div>
                </div>
              </Link>
              <Link
                href="/home"
                prefetch={false}
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
                    <GrUserManager className="scale-[0.9] text-[24px] text-[var(--color-text)]" />
                  </div>
                  <div
                    className={`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 opacity-0`
                    }`}
                  >
                    <span>担当者</span>
                  </div>
                </div>
              </Link>
              <Link
                href="/home"
                prefetch={false}
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
                    <BsTelephonePlus className="scale-[0.9] text-[24px] text-[var(--color-text)]" />
                  </div>
                  <div
                    className={`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 opacity-0`
                    }`}
                  >
                    <span>活動</span>
                  </div>
                </div>
              </Link>
              <Link
                href="/home"
                prefetch={false}
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
                    <HiOutlineChatBubbleLeftRight className="scale-[1] text-[24px] text-[var(--color-text)]" />
                  </div>
                  <div
                    className={`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 opacity-0`
                    }`}
                  >
                    <span>面談・訪問</span>
                  </div>
                </div>
              </Link>
              <Link
                href="/home"
                prefetch={false}
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
                    <BsCalendarDate className="scale-[0.9] text-[24px] text-[var(--color-text)]" />
                  </div>
                  <div
                    className={`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 opacity-0`
                    }`}
                  >
                    <span>カレンダー</span>
                  </div>
                </div>
              </Link>
              <Link
                href="/home"
                prefetch={false}
                className={`${styles.menu_item} ${activeMenuTab === "Property" ? styles.active : ""} `}
                onClick={() => setActiveMenuTab("Property")}
              >
                <div
                  className={styles.menu_item_inner}
                  data-text="物件"
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
                        <AiOutlineMoneyCollect className="scale-[1.05] text-[24px] text-[var(--color-text)]" />
                      </>
                    )}
                    {language === "En" && (
                      <>
                        {/* <RiMoneyDollarCircleLine className="scale-[1.05] text-[24px] text-[var(--color-text)]" /> */}
                        <BiMoneyWithdraw className="scale-[1.05] text-[24px] text-[var(--color-text)]" />
                      </>
                    )}
                  </div>
                  <div
                    className={`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 opacity-0`
                    }`}
                  >
                    <span>物件</span>
                  </div>
                </div>
              </Link>
              <Link
                href="/home"
                prefetch={false}
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
                    {/* <GrDocumentDownload className="scale-[0.9] text-[24px] text-[var(--color-text)]" /> */}
                    {/* <GrDocumentText className="scale-[0.9] text-[24px] text-[var(--color-text)]" /> */}
                    <GrDocumentVerified className="scale-[0.9] text-[24px]" />
                  </div>
                  <div
                    className={`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 opacity-0`
                    }`}
                  >
                    <span>見積</span>
                  </div>
                </div>
              </Link>
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
                    <BsTelephoneInbound className="scale-[0.9] text-[24px] text-[var(--color-text)]" />
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
              <Link
                href="/home"
                prefetch={false}
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
                    <FaLink className="scale-[0.9] text-[24px] text-[var(--color-text)]" />
                  </div>
                  <div
                    className={`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 opacity-0`
                    }`}
                  >
                    <span className="truncate">連携</span>
                  </div>
                </div>
              </Link>
              <Link
                href="/home"
                prefetch={false}
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
                    <MdOutlineLeaderboard className="text-[24px] text-[var(--color-text)]" />
                  </div>
                  <div
                    className={`${`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 opacity-0`
                    }`}`}
                  >
                    <span className="truncate">セールスダッシュボード</span>
                  </div>
                </div>
              </Link>
              <Link
                href="/home"
                prefetch={false}
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
                    <MdOutlineAdminPanelSettings className="text-[24px] text-[var(--color-text)]" />
                  </div>
                  <div
                    className={`${styles.text_wrapper} ${
                      isOpenSidebar ? `opacity-1 transition-base-delay01` : `transition-base01 opacity-0`
                    }`}
                  >
                    <span>管理者</span>
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
