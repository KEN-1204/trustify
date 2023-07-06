import React, { FC, memo } from "react";
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
    <div className={`${styles.app_sidebar} transition-base`}>
      <div className={`${styles.wrapper}`}>
        <div className={styles.spacer} />
        <div className={styles.content_container}>
          <div className={`${styles.section}`}>
            <div className={`${styles.menu_container} space-y-2`}>
              {/* ======================== メニューアイテム ここから ======================== */}
              <div className={`${styles.menu_item} ${activeMenuTab === "HOME" ? styles.active : ""} `}>
                <div className={`${styles.menu_item_inner}`}>
                  <div className={styles.icon_wrapper}>
                    <GrHomeRounded className="scale-[0.8] text-[24px] text-[var(--color-text)]" />
                  </div>
                  <div className={styles.text_wrapper}>
                    <span>ホーム</span>
                  </div>
                </div>
              </div>
              <div className={`${styles.menu_item} ${activeMenuTab === "Company" ? styles.active : ""} `}>
                <div className={styles.menu_item_inner}>
                  <div className={styles.icon_wrapper}>
                    <HiOutlineBuildingOffice2 className="text-[24px] text-[var(--color-text)]" />
                  </div>
                  <div className={styles.text_wrapper}>
                    <span>会社</span>
                  </div>
                </div>
              </div>
              <div className={`${styles.menu_item} ${activeMenuTab === "Contacts" ? styles.active : ""} `}>
                <div className={styles.menu_item_inner}>
                  <div className={styles.icon_wrapper}>
                    {/* <HiOutlineChatBubbleLeftRight className="text-[24px] text-[var(--color-text)]" /> */}
                    {/* <FaUserTie className="scale-[0.9] text-[24px] text-[var(--color-text)]" /> */}
                    <GrUserManager className="scale-[0.9] text-[24px] text-[var(--color-text)]" />
                  </div>
                  <div className={styles.text_wrapper}>
                    <span>担当者</span>
                  </div>
                </div>
              </div>
              <div className={`${styles.menu_item} ${activeMenuTab === "Activity" ? styles.active : ""} `}>
                <div className={styles.menu_item_inner}>
                  <div className={styles.icon_wrapper}>
                    {/* <HiOutlineChatBubbleLeftRight className="text-[24px] text-[var(--color-text)]" /> */}
                    <BsTelephonePlus className="scale-[0.9] text-[24px] text-[var(--color-text)]" />
                  </div>
                  <div className={styles.text_wrapper}>
                    <span>活動</span>
                  </div>
                </div>
              </div>
              <div className={`${styles.menu_item} ${activeMenuTab === "Meeting" ? styles.active : ""} `}>
                <div className={styles.menu_item_inner}>
                  <div className={styles.icon_wrapper}>
                    {/* <BsTelephonePlus className="scale-[0.9] text-[24px] text-[var(--color-text)]" /> */}
                    <HiOutlineChatBubbleLeftRight className="scale-[1] text-[24px] text-[var(--color-text)]" />
                  </div>
                  <div className={styles.text_wrapper}>
                    <span>面談・訪問</span>
                  </div>
                </div>
              </div>
              <div className={`${styles.menu_item} ${activeMenuTab === "Calendar" ? styles.active : ""} `}>
                <div className={styles.menu_item_inner}>
                  <div className={styles.icon_wrapper}>
                    {/* <RiCalendar2Fill className="text-[24px] text-[var(--color-text)]" /> */}
                    <BsCalendarDate className="scale-[0.9] text-[24px] text-[var(--color-text)]" />
                  </div>
                  <div className={styles.text_wrapper}>
                    <span>カレンダー</span>
                  </div>
                </div>
              </div>
              <div className={`${styles.menu_item} ${activeMenuTab === "Property" ? styles.active : ""} `}>
                <div className={styles.menu_item_inner}>
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
                  <div className={styles.text_wrapper}>
                    <span>物件</span>
                  </div>
                </div>
              </div>
              <div className={`${styles.menu_item} ${activeMenuTab === "Quotation" ? styles.active : ""} `}>
                <div className={styles.menu_item_inner}>
                  <div className={styles.icon_wrapper}>
                    {/* <GrDocumentDownload className="scale-[0.9] text-[24px] text-[var(--color-text)]" /> */}
                    {/* <GrDocumentText className="scale-[0.9] text-[24px] text-[var(--color-text)]" /> */}
                    <GrDocumentVerified className="scale-[0.9] text-[24px]" />
                  </div>
                  <div className={styles.text_wrapper}>
                    <span>見積</span>
                  </div>
                </div>
              </div>
              <div className={`${styles.menu_item} ${activeMenuTab === "Lead" ? styles.active : ""} `}>
                <div className={styles.menu_item_inner}>
                  <div className={styles.icon_wrapper}>
                    <BsTelephoneInbound className="scale-[0.9] text-[24px] text-[var(--color-text)]" />
                  </div>
                  <div className={styles.text_wrapper}>
                    <span>引合・リード</span>
                  </div>
                </div>
              </div>
              <div className={`${styles.menu_item} ${activeMenuTab === "Alignment" ? styles.active : ""} `}>
                <div className={styles.menu_item_inner}>
                  <div className={styles.icon_wrapper}>
                    <FaLink className="scale-[0.9] text-[24px] text-[var(--color-text)]" />
                  </div>
                  <div className={styles.text_wrapper}>
                    <span>連携</span>
                  </div>
                </div>
              </div>
              <div className={`${styles.menu_item} ${activeMenuTab === "SDB" ? styles.active : ""} `}>
                <div
                  className={`${styles.menu_item_inner}`}
                  data-text="セールスダッシュボード"
                  onMouseEnter={(e) => handleOpenTooltip(e, "left")}
                  onMouseLeave={handleCloseTooltip}
                >
                  <div className={`${styles.icon_wrapper}`}>
                    <MdOutlineLeaderboard className="text-[24px] text-[var(--color-text)]" />
                  </div>
                  <div className={`${styles.text_wrapper}`}>
                    <span className="truncate">セールスダッシュボード</span>
                  </div>
                </div>
              </div>
              <div className={`${styles.menu_item} ${activeMenuTab === "Admin" ? styles.active : ""} `}>
                <div className={styles.menu_item_inner}>
                  <div className={styles.icon_wrapper}>
                    <MdOutlineAdminPanelSettings className="text-[24px] text-[var(--color-text)]" />
                  </div>
                  <div className={styles.text_wrapper}>
                    <span>管理者</span>
                  </div>
                </div>
              </div>
              {/* ======================== メニューアイテム ここまで ======================== */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DashboardSidebar = memo(DashboardSidebarMemo);
