import useStore from "@/store";
import React, { FC, memo, useState } from "react";
import styles from "./DashboardHeader.module.css";
import { HiOutlineBars3 } from "react-icons/hi2";
import { IoSettingsOutline } from "react-icons/io5";

import { AiOutlineBell } from "react-icons/ai";
import { BsChevronLeft, BsChevronRight, BsFillGearFill } from "react-icons/bs";
import Image from "next/image";
import Link from "next/link";
import useDashboardStore from "@/store/useDashboardStore";
import useThemeStore from "@/store/useThemeStore";
import useRootStore from "@/store/useRootStore";

export const DashboardHeaderMemo: FC = () => {
  // const theme = useThemeStore((state) => state.theme);
  const theme = useRootStore(useThemeStore, (state) => state.theme);
  // const theme = useStore((state) => state.theme);
  const language = useStore((state) => state.language);
  const setHoveredItemPos = useStore((state) => state.setHoveredItemPos);
  const activeMenuTab = useDashboardStore((state) => state.activeMenuTab);
  const setActiveMenuTab = useDashboardStore((state) => state.setActiveMenuTab);
  const isOpenSidebar = useDashboardStore((state) => state.isOpenSidebar);
  const setIsOpenSidebar = useDashboardStore((state) => state.setIsOpenSidebar);
  // アカウント設定モーダル
  const setIsOpenSettingAccountModal = useDashboardStore((state) => state.setIsOpenSettingAccountModal);
  const [tabPage, setTabPage] = useState(1);
  const logoSrc =
    theme === "light" ? "/assets/images/Trustify_logo_white1.png" : "/assets/images/Trustify_logo_black.png";

  const handleOpenTooltip = (e: React.MouseEvent<HTMLElement, MouseEvent>, display: string) => {
    // ホバーしたアイテムにツールチップを表示
    const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
    // console.log("ツールチップx, y width , height", x, y, width, height);
    const content2 = ((e.target as HTMLDivElement).dataset.text2 as string)
      ? ((e.target as HTMLDivElement).dataset.text2 as string)
      : "";
    const content3 = ((e.target as HTMLDivElement).dataset.text3 as string)
      ? ((e.target as HTMLDivElement).dataset.text3 as string)
      : "";
    setHoveredItemPos({
      x: x,
      y: y,
      itemWidth: width,
      itemHeight: height,
      content: (e.target as HTMLDivElement).dataset.text as string,
      content2: content2,
      content3: content3,
      display: display,
    });
  };
  // ツールチップを非表示
  const handleCloseTooltip = () => {
    setHoveredItemPos(null);
  };

  return (
    <header className={`${styles.app_header} transition-base03`}>
      {/* 左コンテンツ */}
      <div className="relative flex h-full  items-center justify-start ">
        <div
          data-text={`${isOpenSidebar ? "メニューを縮小" : "メニューを拡大"}`}
          className="flex-center  min-h-[40px] min-w-[40px] cursor-pointer rounded-full hover:bg-[--color-bg-sub]"
          onMouseEnter={(e) => handleOpenTooltip(e, "left")}
          onMouseLeave={handleCloseTooltip}
          onClick={() => setIsOpenSidebar(!isOpenSidebar)}
        >
          <HiOutlineBars3 className="pointer-events-none text-[24px] text-[--color-text]" />
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
        {/* ヘッダータブ左スクロール時に連続でツールチップが表示されないようにするためのオーバーレイ */}
        <div className="transition-base03 absolute left-[185px] top-0 z-30 h-full w-[39px] bg-[var(--color-bg-base)]"></div>
      </div>

      {/* 左矢印 */}
      {tabPage !== 1 && (
        <div
          className={`flex-center absolute left-[14.5%]  z-50 h-[35px] w-[35px] cursor-pointer rounded-full hover:bg-[var(--color-btn-brand-f05)]`}
          onClick={() => {
            if (tabPage === 1) return;
            setTabPage((prev) => {
              const newPage = prev - 1;
              return newPage;
            });
          }}
        >
          <BsChevronLeft className="text-[var(--color-text)]" />
        </div>
      )}

      {/* 真ん中のコンテンツ */}
      <div className="bg-blue-0 relative flex h-full flex-1 justify-start pl-[39px] md:overflow-x-hidden">
        {/* ============================= 1列目ナビゲーションタブ ここから ============================= */}
        <nav className={`${tabPage === 2 ? "-ml-[calc(100%+39px)]" : ""} transition-base`}>
          <ul
            className={`hidden h-full w-full items-center justify-around text-[14px] font-[500] text-[--navColor] md:flex`}
          >
            <li className={`${styles.navList}`}>
              <Link
                href="/home"
                className={`${styles.navbarItem} ${activeMenuTab === "HOME" ? styles.active : ""} `}
                onClick={() => setActiveMenuTab("HOME")}
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
                <div className={`${styles.active_underline}`} />
              </Link>
            </li>
            <li className={`${styles.navList}`}>
              <div
                // href="/company"
                className={`${styles.navbarItem} ${activeMenuTab === "Company" ? styles.active : ""} `}
                onClick={() => setActiveMenuTab("Company")}
              >
                <div
                  className={`${styles.navbarItemInner}`}
                  data-text="営業先の会社リストを一覧で確認する"
                  onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                  onMouseLeave={handleCloseTooltip}
                >
                  <span>
                    {language === "Ja" && "会社"}
                    {language === "En" && "Company"}
                  </span>
                </div>
                <div className={`${styles.active_underline}`} />
              </div>
            </li>
            <li className={`${styles.navList}`}>
              <div
                // href="/home"
                // prefetch={false}
                className={`${styles.navbarItem} ${activeMenuTab === "Contacts" ? styles.active : ""} `}
                onClick={() => setActiveMenuTab("Contacts")}
              >
                <div
                  className={`${styles.navbarItemInner}`}
                  data-text="日々の営業活動内容を担当者別に確認し、"
                  data-text2="今行くべき営業リストの作成や、架電時に過去の活動内容をフックにアポに繋げたり、"
                  data-text3="面談前の上長や他部署の担当者の同席依頼などに活用しましょう。"
                  onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                  onMouseLeave={handleCloseTooltip}
                >
                  <span>
                    {language === "Ja" && "担当者"}
                    {language === "En" && "Contacts"}
                  </span>
                </div>
                <div className={`${styles.active_underline}`} />
              </div>
            </li>
            <li className={`${styles.navList}`}>
              <div
                // href="/home"
                // prefetch={false}
                className={`${styles.navbarItem} ${activeMenuTab === "Activity" ? styles.active : ""} `}
                onClick={() => setActiveMenuTab("Activity")}
              >
                <div
                  className={`${styles.navbarItemInner}`}
                  data-text="架電内容、次回フォロー予定日、面談結果など顧客に関する"
                  data-text2="全ての情報をきちんと記録することで、リスト作成、架電、面談、フォロー時に"
                  data-text3="有効な情報を短時間で取得し、最高の結果が出せるようにしましょう"
                  onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                  onMouseLeave={handleCloseTooltip}
                >
                  <span>
                    {language === "Ja" && "活動"}
                    {language === "En" && "Activity"}
                  </span>
                </div>
                <div className={`${styles.active_underline}`} />
              </div>
            </li>
            <li className={`${styles.navList}`}>
              <Link
                href="/home"
                prefetch={false}
                className={`${styles.navbarItem} ${activeMenuTab === "Meeting" ? styles.active : ""} `}
                onClick={() => setActiveMenuTab("Meeting")}
              >
                <div
                  className={`${styles.navbarItemInner}`}
                  data-text="「訪問・WEB面談」の内容を記録しましょう。"
                  data-text2="お客様から頂いた情報が売れる商品開発に繋がり、将来の顧客となります。"
                  data-text3="過去の面談内容を活用して今売れる営業先を見つけたり、売れる営業マンの良い情報を社内に共有しましょう。"
                  onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                  onMouseLeave={handleCloseTooltip}
                >
                  <span>
                    {language === "Ja" && "面談・訪問"}
                    {language === "En" && "Meeting"}
                  </span>
                </div>
                <div className={`${styles.active_underline}`} />
              </Link>
            </li>
            <li className={`${styles.navList}`}>
              <Link
                href="/home"
                prefetch={false}
                className={`${styles.navbarItem} ${activeMenuTab === "Calendar" ? styles.active : ""} `}
                onClick={() => setActiveMenuTab("Calendar")}
              >
                <div
                  className={`${styles.navbarItemInner}`}
                  data-text="自分とメンバーのアポイント状況を確認する"
                  data-text2="もう一件面談を入れる余地が無いか、効率は良いか確認してみましょう。"
                  onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                  onMouseLeave={handleCloseTooltip}
                >
                  <span>
                    {language === "Ja" && "カレンダー"}
                    {language === "En" && "Calendar"}
                  </span>
                </div>
                <div className={`${styles.active_underline}`} />
              </Link>
            </li>
            <li className={`${styles.navList}`}>
              <Link
                href="/home"
                prefetch={false}
                className={`${styles.navbarItem} ${activeMenuTab === "Property" ? styles.active : ""} `}
                onClick={() => setActiveMenuTab("Property")}
              >
                <div
                  className={`${styles.navbarItemInner}`}
                  data-text="面談・訪問時に「商談、申請、受注」に展開した物件を記録しましょう。"
                  data-text2="このデータが顧客に刺さる商品開発へと繋がり、将来の財産となります。"
                  onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                  onMouseLeave={handleCloseTooltip}
                >
                  <span>
                    {language === "Ja" && "物件"}
                    {language === "En" && "Property"}
                  </span>
                </div>
                <div className={`${styles.active_underline}`} />
              </Link>
            </li>
            <li className={`${styles.navList}`}>
              <Link
                href="/home"
                prefetch={false}
                className={`${styles.navbarItem} ${activeMenuTab === "Quotation" ? styles.active : ""} `}
                onClick={() => setActiveMenuTab("Quotation")}
              >
                <div
                  className={`${styles.navbarItemInner}`}
                  data-text="見積もりを作成する"
                  data-text2="いつでもお客様と商談ができる状態を維持しましょう。"
                  onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                  onMouseLeave={handleCloseTooltip}
                >
                  <span>
                    {language === "Ja" && "見積"}
                    {language === "En" && "Quotation"}
                  </span>
                </div>
                <div className={`${styles.active_underline}`} />
              </Link>
            </li>
            <li className={`${styles.navList}`}>
              <div
                // href="/home"
                // prefetch={false}
                className={`${styles.navbarItem} ${activeMenuTab === "Lead" ? styles.active : ""} `}
                // onClick={() => setActiveMenuTab("Lead")}
              >
                <div
                  className={`${styles.navbarItemInner} cursor-not-allowed`}
                  data-text="開発・準備中..."
                  onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                  onMouseLeave={handleCloseTooltip}
                >
                  <span>
                    {language === "Ja" && "引合・リード"}
                    {language === "En" && "Lead"}
                  </span>
                </div>
                <div className={`${styles.active_underline}`} />
              </div>
            </li>
            <li className={`${styles.navList}`}>
              <div
                // href="/home"
                // prefetch={false}
                className={`${styles.navbarItem} ${activeMenuTab === "Alignment" ? styles.active : ""} `}
                // onClick={() => setActiveMenuTab("Alignment")}
              >
                <div
                  className={`${styles.navbarItemInner} cursor-not-allowed`}
                  data-text="開発・準備中..."
                  onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                  onMouseLeave={handleCloseTooltip}
                >
                  <span>
                    {language === "Ja" && "連携"}
                    {language === "En" && "Alignment"}
                  </span>
                </div>
                <div className={`${styles.active_underline}`} />
              </div>
            </li>
            <li className={`${styles.navList}`}>
              <div
                // href="/home"
                // prefetch={false}
                className={`${styles.navbarItem} ${activeMenuTab === "Message" ? styles.active : ""} `}
                // onClick={() => setActiveMenuTab("Message")}
              >
                <div
                  className={`${styles.navbarItemInner} cursor-not-allowed`}
                  // data-text="顧客からの伝言や顧客への送付物、書類作成など"
                  // data-text2="依頼ごとお願いしましょう"
                  data-text="開発・準備中..."
                  onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                  onMouseLeave={handleCloseTooltip}
                >
                  <span>
                    {language === "Ja" && "メッセージ"}
                    {language === "En" && "Message"}
                  </span>
                </div>
                <div className={`${styles.active_underline}`} />
              </div>
            </li>
            <li className={`${styles.navList}`}>
              <div
                // href="/home"
                // prefetch={false}
                className={`${styles.navbarItem} ${activeMenuTab === "SDB" ? styles.active : ""} `}
                onClick={() => setActiveMenuTab("SDB")}
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
                <div className={`${styles.active_underline}`} />
              </div>
            </li>
            <li className={`${styles.navList}`}>
              <div
                // href="/home"
                // prefetch={false}
                className={`${styles.navbarItem} ${activeMenuTab === "Admin" ? styles.active : ""} `}
                onClick={() => setActiveMenuTab("Admin")}
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
                <div className={`${styles.active_underline}`} />
              </div>
            </li>
          </ul>
        </nav>
        {/* ============================= 1列目ナビゲーションタブ ここまで ============================= */}
        {/* ============================= ２列目ナビゲーションタブ ここから ============================= */}
        <nav className="h-full min-w-[970px] pl-[69px]">
          <ul
            className={`hidden h-full w-full items-center justify-start text-[14px] font-[500] text-[--navColor] md:flex`}
          >
            <li className={`${styles.navList} max-w-[81px]`}>
              <div
                // href="/home"
                // prefetch={false}
                className={`${styles.navbarItem} ${activeMenuTab === "Pre-approval" ? styles.active : ""} `}
                // onClick={() => setActiveMenuTab("Pre-approval")}
              >
                <div
                  className={`${styles.navbarItemInner} cursor-not-allowed`}
                  data-text="開発・準備中..."
                  onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                  onMouseLeave={handleCloseTooltip}
                >
                  <span>
                    {language === "Ja" && "事前承認"}
                    {language === "En" && "Pre-approval"}
                  </span>
                </div>
                <div className={`${styles.active_underline}`} />
              </div>
            </li>
            <li className={`${styles.navList} max-w-[81px]`}>
              <div
                // href="/home"
                // prefetch={false}
                className={`${styles.navbarItem} ${activeMenuTab === "Supporter" ? styles.active : ""} `}
                // onClick={() => setActiveMenuTab("Supporter")}
              >
                <div
                  className={`${styles.navbarItemInner} cursor-not-allowed`}
                  data-text="サポーター専用スペースです"
                  onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                  onMouseLeave={handleCloseTooltip}
                >
                  <span>
                    {language === "Ja" && "サポーター"}
                    {language === "En" && "サポーター"}
                  </span>
                </div>
                <div className={`${styles.active_underline}`} />
              </div>
            </li>
          </ul>
        </nav>
        {/* ============================= ２列目ナビゲーションタブ ここまで ============================= */}
      </div>

      {/* 右矢印 */}
      {tabPage !== 2 && (
        <div
          className="flex-center absolute right-[13%] z-50 h-[35px] w-[35px] cursor-pointer rounded-full hover:bg-[var(--color-btn-brand-f05)]"
          onClick={() => {
            if (tabPage !== 2) {
              setTabPage((prev) => {
                const newPage = prev + 1;
                return newPage;
              });
            }
          }}
        >
          <BsChevronRight className="text-[var(--color-text)]" />
        </div>
      )}

      {/* 右側のコンテンツ */}
      <div className="flex h-[40px] w-[165px]  flex-row-reverse items-center justify-start">
        {/* ヘッダータブ左スクロール時に連続でツールチップが表示されないようにするためのオーバーレイ */}
        <div className="transition-base03 absolute right-[185px] top-0 z-30 h-full w-[39px] bg-[var(--color-bg-base)]"></div>
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
            onClick={() => setIsOpenSettingAccountModal(true)}
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
