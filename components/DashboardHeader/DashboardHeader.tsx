import useStore from "@/store";
import React, { FC, memo, useState } from "react";
import styles from "./DashboardHeader.module.css";
import { HiOutlineBars3 } from "react-icons/hi2";
import { FiSettings } from "react-icons/fi";
import { IoSettingsOutline } from "react-icons/io5";
import { SlSettings } from "react-icons/sl";
import { AiOutlineBell } from "react-icons/ai";
import { BsFillGearFill } from "react-icons/bs";
import Image from "next/image";
import Link from "next/link";

export const DashboardHeaderMemo: FC = () => {
  const theme = useStore((state) => state.theme);
  const language = useStore((state) => state.language);
  const hoveredItemPos = useStore((state) => state.hoveredItemPos);
  const setHoveredItemPos = useStore((state) => state.setHoveredItemPos);
  const [activeTab, setActiveTab] = useState("HOME");
  const logoSrc =
    theme === "light" ? "/assets/images/Trustify_logo_white1.png" : "/assets/images/Trustify_logo_black.png";

  const handleOpenTooltip = (e: React.MouseEvent<HTMLElement, MouseEvent>, display: string) => {
    // ホバーしたアイテムにツールチップを表示
    const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
    console.log("🌟ツールチップ", (e.target as HTMLDivElement).dataset);
    const content2 = ((e.target as HTMLDivElement).dataset.text2 as string)
      ? ((e.target as HTMLDivElement).dataset.text2 as string)
      : "";
    setHoveredItemPos({
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
    setHoveredItemPos(null);
  };

  // アクティブタブ変更
  const handleChangeActiveTab = () => {};

  return (
    <header className={`${styles.app_header} transition-base`}>
      {/* 左コンテンツ */}
      <div className="relative flex h-full  items-center justify-start ">
        <div
          data-text="メニューを縮小"
          className="flex-center  min-h-[40px] min-w-[40px] cursor-pointer rounded-full hover:bg-[--color-bg-sub]"
          onMouseEnter={(e) => handleOpenTooltip(e, "left")}
          onMouseLeave={handleCloseTooltip}
        >
          <HiOutlineBars3 className="text-[24px] text-[--color-text] " />
        </div>
        <div className="relative flex h-full w-[145px] cursor-pointer select-none items-center justify-center pl-[16px]">
          <Image
            src={logoSrc}
            alt=""
            className="h-full w-[90%] object-contain"
            fill
            priority={true}
            sizes="10vw"
            // placeholder="blur"
            // blurDataURL={theme === "dark" ? blurDataURLDark : blurDataURL}
            // className="!relative !h-[60px] !w-[200px] object-cover"
          />
        </div>
      </div>

      {/* 真ん中のコンテンツ */}
      <div className="flex h-full flex-1 pl-[39px]">
        <nav>
          <ul
            className={`hidden h-full w-full items-center justify-around text-[14px] font-[500] text-[--navColor] md:flex`}
          >
            <li className={`${styles.navList}`}>
              <Link
                href="/home"
                prefetch={false}
                className={`${styles.navbarItem} ${activeTab === "HOME" ? styles.active : ""} `}
                onClick={() => setActiveTab("HOME")}
              >
                <div
                  className={`${styles.navbarItemInner}`}
                  data-text="ホーム画面"
                  onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                  onMouseLeave={handleCloseTooltip}
                >
                  <span>
                    {language === "Ja" && "ホーム"}
                    {language === "En" && "HOME"}
                  </span>
                </div>
              </Link>
            </li>
            <li className={`${styles.navList}`}>
              <Link
                href="/home"
                prefetch={false}
                className={`${styles.navbarItem} ${activeTab === "Company" ? styles.active : ""} `}
                onClick={() => setActiveTab("Company")}
              >
                <div
                  className={`${styles.navbarItemInner}`}
                  data-text="営業先の会社リストを一覧で確認"
                  onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                  onMouseLeave={handleCloseTooltip}
                >
                  <span>
                    {language === "Ja" && "会社"}
                    {language === "En" && "Company"}
                  </span>
                </div>
              </Link>
            </li>
            <li className={`${styles.navList}`}>
              <Link
                href="/home"
                prefetch={false}
                className={`${styles.navbarItem} ${activeTab === "Contacts" ? styles.active : ""} `}
                onClick={() => setActiveTab("Contacts")}
              >
                <div
                  className={`${styles.navbarItemInner}`}
                  data-text="営業先の担当者リストと"
                  data-text2="担当者ごとに活動履歴を記録・一覧で確認"
                  onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                  onMouseLeave={handleCloseTooltip}
                >
                  <span>
                    {language === "Ja" && "担当者"}
                    {language === "En" && "Contacts"}
                  </span>
                </div>
              </Link>
            </li>
            <li className={`${styles.navList}`}>
              <Link
                href="/home"
                prefetch={false}
                className={`${styles.navbarItem} ${activeTab === "Activity" ? styles.active : ""} `}
                onClick={() => setActiveTab("Activity")}
              >
                <div
                  className={`${styles.navbarItemInner}`}
                  data-text="社内全体の「TEL・面談」の"
                  data-text2="活動履歴を一覧で確認"
                  onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                  onMouseLeave={handleCloseTooltip}
                >
                  <span>
                    {language === "Ja" && "活動"}
                    {language === "En" && "Activity"}
                  </span>
                </div>
              </Link>
            </li>
            <li className={`${styles.navList}`}>
              <Link
                href="/home"
                prefetch={false}
                className={`${styles.navbarItem} ${activeTab === "Meeting" ? styles.active : ""} `}
                onClick={() => setActiveTab("Meeting")}
              >
                <div
                  className={`${styles.navbarItemInner}`}
                  data-text="「訪問・WEB面談」履歴を記録・一覧で確認"
                  onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                  onMouseLeave={handleCloseTooltip}
                >
                  <span>
                    {language === "Ja" && "面談・訪問"}
                    {language === "En" && "Meeting"}
                  </span>
                </div>
              </Link>
            </li>
            <li className={`${styles.navList}`}>
              <Link
                href="/home"
                prefetch={false}
                className={`${styles.navbarItem} ${activeTab === "Calendar" ? styles.active : ""} `}
                onClick={() => setActiveTab("Calendar")}
              >
                <div
                  className={`${styles.navbarItemInner}`}
                  data-text="自分とメンバーの"
                  data-text2="アポイント状況を確認する"
                  onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                  onMouseLeave={handleCloseTooltip}
                >
                  <span>
                    {language === "Ja" && "カレンダー"}
                    {language === "En" && "Calendar"}
                  </span>
                </div>
              </Link>
            </li>
            <li className={`${styles.navList}`}>
              <Link
                href="/home"
                prefetch={false}
                className={`${styles.navbarItem} ${activeTab === "Property" ? styles.active : ""} `}
                onClick={() => setActiveTab("Property")}
              >
                <div
                  className={`${styles.navbarItemInner}`}
                  data-text="面談・訪問時に"
                  data-text2="「商談、申請、受注」に展開した物件を記録・一覧で確認"
                  onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                  onMouseLeave={handleCloseTooltip}
                >
                  <span>
                    {language === "Ja" && "物件"}
                    {language === "En" && "Property"}
                  </span>
                </div>
              </Link>
            </li>
            <li className={`${styles.navList}`}>
              <Link
                href="/home"
                prefetch={false}
                className={`${styles.navbarItem} ${activeTab === "Quotation" ? styles.active : ""} `}
                onClick={() => setActiveTab("Quotation")}
              >
                <div
                  className={`${styles.navbarItemInner}`}
                  data-text="見積もりを作成する"
                  onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                  onMouseLeave={handleCloseTooltip}
                >
                  <span>
                    {language === "Ja" && "見積"}
                    {language === "En" && "Quotation"}
                  </span>
                </div>
              </Link>
            </li>
            <li className={`${styles.navList}`}>
              <Link
                href="/home"
                prefetch={false}
                className={`${styles.navbarItem} ${activeTab === "Lead" ? styles.active : ""} `}
                onClick={() => setActiveTab("Lead")}
              >
                <div
                  className={`${styles.navbarItemInner}`}
                  data-text="開発・準備中..."
                  onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                  onMouseLeave={handleCloseTooltip}
                >
                  <span>
                    {language === "Ja" && "引合・リード"}
                    {language === "En" && "Lead"}
                  </span>
                </div>
              </Link>
            </li>
            <li className={`${styles.navList}`}>
              <Link
                href="/home"
                prefetch={false}
                className={`${styles.navbarItem} ${activeTab === "Alignment" ? styles.active : ""} `}
                onClick={() => setActiveTab("Alignment")}
              >
                <div
                  className={`${styles.navbarItemInner}`}
                  data-text="営業担当者同士で連携する"
                  onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                  onMouseLeave={handleCloseTooltip}
                >
                  <span>
                    {language === "Ja" && "連携"}
                    {language === "En" && "Alignment"}
                  </span>
                </div>
              </Link>
            </li>
            <li className={`${styles.navList}`}>
              <Link
                href="/home"
                prefetch={false}
                className={`${styles.navbarItem} ${activeTab === "SDB" ? styles.active : ""} `}
                onClick={() => setActiveTab("SDB")}
              >
                <div
                  className={`${styles.navbarItemInner}`}
                  data-text="セールスダッシュボード"
                  onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                  onMouseLeave={handleCloseTooltip}
                >
                  <span>
                    {language === "Ja" && "SDB"}
                    {language === "En" && "SDB"}
                  </span>
                </div>
              </Link>
            </li>
            <li className={`${styles.navList}`}>
              <Link
                href="/home"
                prefetch={false}
                className={`${styles.navbarItem} ${activeTab === "Admin" ? styles.active : ""} `}
                onClick={() => setActiveTab("VIP")}
              >
                <div
                  className={`${styles.navbarItemInner}`}
                  data-text="管理者専用スペース"
                  onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                  onMouseLeave={handleCloseTooltip}
                >
                  <span>
                    {language === "Ja" && "管理者"}
                    {language === "En" && "Admin"}
                  </span>
                </div>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* 右側のコンテンツ */}
      <div className="ml-[10px] flex h-[40px] w-[185px] flex-row-reverse items-center justify-start">
        {/* 一番右 プロフィールアイコン */}
        <div className="flex-center h-full  w-[52px] px-[6px] py-[1px]">
          <div
            data-text="ユーザー名"
            className={`flex-center h-[40px] w-[40px] cursor-pointer rounded-full bg-[var(--color-bg-brand-sub)] text-[#fff] hover:bg-[var(--color-bg-brand-sub-hover)] ${styles.tooltip}`}
            onMouseEnter={(e) => handleOpenTooltip(e, "center")}
            onMouseLeave={handleCloseTooltip}
          >
            <span>K</span>
          </div>
        </div>
        {/* 右から２番目 歯車 */}
        <div className="flex-center mr-[8px] h-full w-[40px]">
          <div
            data-text="アカウント設定"
            className="flex-center h-full w-full cursor-pointer rounded-full hover:bg-[var(--color-bg-sub)]"
            onMouseEnter={(e) => handleOpenTooltip(e, "center")}
            onMouseLeave={handleCloseTooltip}
          >
            <IoSettingsOutline className="text-[24px] text-[var(--color-icon)]" />
          </div>
        </div>
        {/* 右から３番目 ベル */}
        <div className="flex-center relative mr-[8px] h-full w-[40px]">
          <div
            data-text="お知らせ"
            className="flex-center h-full w-full cursor-pointer rounded-full hover:bg-[var(--color-bg-sub)]"
            onMouseEnter={(e) => handleOpenTooltip(e, "center")}
            onMouseLeave={handleCloseTooltip}
          >
            <AiOutlineBell className="text-[24px] text-[var(--color-icon)]" />
            {/* 通知アイコン */}
            <div className={`${styles.notice_outer} flex-center transition-base`}>
              <div className={`${styles.notice_inner} transition-base`}></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export const DashboardHeader = memo(DashboardHeaderMemo);
