import useStore from "@/store";
import React, { FC, memo, useEffect, useRef, useState } from "react";
import styles from "./DashboardHeader.module.css";
import { HiOutlineBars3, HiOutlineCamera } from "react-icons/hi2";
import { IoLogOutOutline, IoSettingsOutline } from "react-icons/io5";

import { AiOutlineBell, AiOutlinePicture } from "react-icons/ai";
import { CgDarkMode } from "react-icons/cg";
import { GiSettingsKnobs } from "react-icons/gi";
import { BsCheck2, BsChevronLeft, BsChevronRight, BsFillGearFill } from "react-icons/bs";
import Image from "next/image";
import Link from "next/link";
import useDashboardStore from "@/store/useDashboardStore";
import useThemeStore from "@/store/useThemeStore";
import useRootStore from "@/store/useRootStore";
import { useDownloadUrl } from "@/hooks/useDownloadUrl";
import { useQueryNotifications } from "@/hooks/useQueryNotifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TooltipModal } from "../Parts/Tooltip/TooltipModal";
import { MdOutlineModeEditOutline } from "react-icons/md";
import { VscSettings } from "react-icons/vsc";
import { toast } from "react-toastify";

export const DashboardHeaderMemo: FC = () => {
  const supabase = useSupabaseClient();
  // const theme = useThemeStore((state) => state.theme);
  const theme = useRootStore(useThemeStore, (state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  // const theme = useStore((state) => state.theme);
  const language = useStore((state) => state.language);
  const setHoveredItemPos = useStore((state) => state.setHoveredItemPos);
  const activeMenuTab = useDashboardStore((state) => state.activeMenuTab);
  const setActiveMenuTab = useDashboardStore((state) => state.setActiveMenuTab);
  const isOpenSidebar = useDashboardStore((state) => state.isOpenSidebar);
  const setIsOpenSidebar = useDashboardStore((state) => state.setIsOpenSidebar);
  // アカウント設定モーダル
  const setIsOpenSettingAccountModal = useDashboardStore((state) => state.setIsOpenSettingAccountModal);
  const setSelectedSettingAccountMenu = useDashboardStore((state) => state.setSelectedSettingAccountMenu);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  const [tabPage, setTabPage] = useState(1);
  const logoSrc =
    theme === "light" ? "/assets/images/Trustify_logo_white1.png" : "/assets/images/Trustify_logo_black.png";

  const { fullUrl: avatarUrl, isLoading } = useDownloadUrl(userProfileState?.avatar_url, "avatars");

  // テーマホバー有無
  const [hoveredThemeMenu, setHoveredThemeMenu] = useState(false);
  // プロフィールアイコンホバー
  const [hoveredIcon, setHoveredIcon] = useState(false);

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

  // 頭文字のみ抽出
  const getInitial = (name: string) => name[0];

  // 【プロフィールメニュー開閉状態】
  const [openProfileMenu, setOpenProfileMenu] = useState(false);

  // =============== お知らせ notificationsを取得 ===============
  const [openNotificationModal, setOpenNotificationModal] = useState(false); // お知らせ開閉
  const [activeNotificationTab, setActiveNotificationTab] = useState("ToDo"); // お知らせアクティブタブ ToDo/完了
  // const myAllNotifications = useDashboardStore((state) => state.myAllNotifications)
  const queryClient = useQueryClient();
  const notificationData = queryClient.getQueryData<Notification[]>(["my_notifications"]);

  console.log("notificationキャッシュのdata", notificationData, "notificationData?.length", notificationData?.length);

  // ================================ ツールチップ ================================
  const modalContainerRef = useRef<HTMLDivElement | null>(null);
  const hoveredItemPosModal = useStore((state) => state.hoveredItemPosModal);
  const setHoveredItemPosModal = useStore((state) => state.setHoveredItemPosModal);
  const handleOpenTooltipModal = (e: React.MouseEvent<HTMLElement, MouseEvent>, display: string) => {
    // モーダルコンテナのleftを取得する
    if (!modalContainerRef.current) return;
    const containerLeft = modalContainerRef.current?.getBoundingClientRect().left;
    const containerTop = modalContainerRef.current?.getBoundingClientRect().top;
    // ホバーしたアイテムにツールチップを表示
    const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
    // console.log("ツールチップx, y width , height", x, y, width, height);
    const content2 = ((e.target as HTMLDivElement).dataset.text2 as string)
      ? ((e.target as HTMLDivElement).dataset.text2 as string)
      : "";
    const content3 = ((e.target as HTMLDivElement).dataset.text3 as string)
      ? ((e.target as HTMLDivElement).dataset.text3 as string)
      : "";
    setHoveredItemPosModal({
      x: x - containerLeft,
      y: y - containerTop,
      itemWidth: width,
      itemHeight: height,
      content: (e.target as HTMLDivElement).dataset.text as string,
      content2: content2,
      content3: content3,
      display: display,
    });
  };
  // ============================================================================================
  // ================================ ツールチップを非表示 ================================
  const handleCloseTooltipModal = () => {
    setHoveredItemPosModal(null);
  };
  // ============================================================================================

  // ログアウト関数
  const handleSignOut = async () => {
    setOpenProfileMenu(false);
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("ログアウトに失敗しました", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: `${theme === "light" ? "light" : "dark"}`,
      });
    }
  };

  // アカウント設定画面オープン
  const openSettingAccounts = () => {
    setOpenProfileMenu(false);
    setLoadingGlobalState(false);
    setIsOpenSettingAccountModal(true);
    setSelectedSettingAccountMenu("Profile");
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
              <div
                // href="/home"
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
              </div>
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
                  data-text3="有効な情報を短時間で取得し、組織全体で最高の結果が出せるようにしましょう"
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
              <div
                // href="/home"
                // prefetch={false}
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
              </div>
            </li>
            <li className={`${styles.navList}`}>
              <div
                // href="/home"
                // prefetch={false}
                className={`${styles.navbarItem} ${activeMenuTab === "Property" ? styles.active : ""} `}
                onClick={() => setActiveMenuTab("Property")}
              >
                <div
                  className={`${styles.navbarItemInner}`}
                  data-text="面談・訪問時に「商談、申請、受注」に展開した案件を記録しましょう。"
                  data-text2="このデータが顧客に刺さる商品開発へと繋がり、将来の財産となります。"
                  onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                  onMouseLeave={handleCloseTooltip}
                >
                  <span>
                    {language === "Ja" && "案件"}
                    {language === "En" && "Property"}
                  </span>
                </div>
                <div className={`${styles.active_underline}`} />
              </div>
            </li>
            <li className={`${styles.navList}`}>
              <div
                // href="/home"
                // prefetch={false}
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
              </div>
            </li>

            <li className={`${styles.navList}`}>
              <div
                // href="/home"
                // prefetch={false}
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
              </div>
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

      {/* ============================= 右側のコンテンツ ============================= */}
      <div className="flex h-[40px] w-[165px]  flex-row-reverse items-center justify-start">
        {/* ヘッダータブ左スクロール時に連続でツールチップが表示されないようにするためのオーバーレイ */}
        <div className="transition-base03 absolute right-[185px] top-0 z-30 h-full w-[39px] bg-[var(--color-bg-base)]"></div>
        {/* 一番右 プロフィールアイコン */}
        <div className="flex-center relative  h-full w-[52px] px-[6px] py-[1px]">
          {/* <div
            data-text="ユーザー名"
            className={`flex-center h-[40px] w-[40px] cursor-pointer rounded-full bg-[var(--color-bg-brand-sub)] text-[#fff] hover:bg-[var(--color-bg-brand-sub-hover)] ${styles.tooltip}`}
            onMouseEnter={(e) => handleOpenTooltip(e, "center")}
            onMouseLeave={handleCloseTooltip}
          >
            <span>K</span>
          </div> */}
          {!avatarUrl && (
            <div
              data-text={`${userProfileState?.profile_name}`}
              className={`flex-center h-[38px] w-[38px] cursor-pointer rounded-full bg-[var(--color-bg-brand-sub)] text-[#fff] hover:bg-[var(--color-bg-brand-sub-hover)] ${styles.tooltip}`}
              onMouseEnter={(e) => handleOpenTooltip(e, "center")}
              onMouseLeave={handleCloseTooltip}
              onClick={() => setOpenProfileMenu(true)}
            >
              {/* <span>K</span> */}
              <span className={`pointer-events-none text-[18px]`}>
                {userProfileState?.profile_name ? getInitial(userProfileState.profile_name) : `${getInitial("NoName")}`}
              </span>
            </div>
          )}
          {avatarUrl && (
            <div
              data-text={`${userProfileState?.profile_name}`}
              className={`flex-center h-[37px] w-[37px] cursor-pointer overflow-hidden rounded-full hover:bg-[#00000020]`}
              onMouseEnter={(e) => handleOpenTooltip(e, "center")}
              onMouseLeave={handleCloseTooltip}
            >
              <Image
                src={avatarUrl}
                alt="Avatar"
                className={`pointer-events-none h-full w-full object-cover text-[#fff]`}
                width={75}
                height={75}
              />
            </div>
          )}

          {/* ドロップダウンサイドメニュー */}
          {/* {openProfileMenu && (
            <div className="pointer-events-none absolute right-[0px] top-[50px] z-[1000] flex h-auto min-w-[276px] max-w-[276px] flex-col rounded-[8px]">
              <div className="min-h-[90px] w-full"></div>
              <div className="min-h-[1px] w-full"></div>
              <div className="relative min-h-[40px] w-full ">
                {hoveredThemeMenu && (
                  <div className={`absolute -left-[276px] top-0 min-h-[40px] min-w-[276px] bg-red-100`}></div>
                )}
              </div>
              <div className="min-h-[40px] w-full"></div>
              <div className="min-h-[1px] w-full"></div>
              <div className="min-h-[40px] w-full"></div>
            </div>
          )} */}

          {/* プロフィールドロップダウンメニュー */}
          {openProfileMenu && (
            <>
              {/* オーバーレイ */}
              <div
                className="fixed left-[-50%] top-[-50%] z-[50] h-[200vh] w-[200vw] "
                onClick={() => setOpenProfileMenu(false)}
              ></div>

              {/* モーダル */}
              <div
                className={`shadow-all-md border-real absolute right-[0px] top-[50px] z-[100] flex h-auto min-w-[276px] max-w-[276px] flex-col rounded-[4px] bg-[var(--color-edit-bg-solid)]`}
              >
                {/* プロフィール情報エリア */}
                <div className={`flex h-auto w-full px-[24px] py-[16px]`}>
                  {/* アバター画像エリア */}
                  <div className="flex-center relative h-[58px] w-[58px]">
                    {!avatarUrl && (
                      <div
                        // data-text={`${userProfileState?.profile_name}`}
                        className={`flex-center min-h-[58px] min-w-[58px] cursor-pointer rounded-full bg-[var(--color-bg-brand-sub)] text-[#fff] hover:bg-[var(--color-bg-brand-sub-hover)] ${styles.tooltip} z-0`}
                        onMouseEnter={() => {
                          setHoveredIcon(true);
                        }}
                        onMouseLeave={() => {
                          setHoveredIcon(false);
                        }}
                        onClick={() => {
                          setHoveredIcon(false);
                          openSettingAccounts();
                        }}
                      >
                        {/* <span>K</span> */}
                        <span className={`pointer-events-none text-[18px]`}>
                          {userProfileState?.profile_name
                            ? getInitial(userProfileState.profile_name)
                            : `${getInitial("NoName")}`}
                        </span>
                      </div>
                    )}
                    {avatarUrl && (
                      <div
                        data-text={`${userProfileState?.profile_name}`}
                        className={`flex-center z-0 min-h-[58px] min-w-[58px] cursor-pointer overflow-hidden rounded-full hover:bg-[#00000020]`}
                        onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                        onMouseLeave={handleCloseTooltip}
                        onClick={() => {
                          setHoveredIcon(false);
                          openSettingAccounts();
                        }}
                      >
                        <Image
                          src={avatarUrl}
                          alt="Avatar"
                          className={`pointer-events-none h-full w-full object-cover text-[#fff]`}
                          width={58}
                          height={58}
                        />
                      </div>
                    )}
                    {/* 編集アイコン */}
                    <div
                      className={`shadow-all-md flex-center transition-base03  pointer-events-none absolute z-10 min-h-[24px] min-w-[24px] rounded-full bg-[var(--color-edit-bg-solid)] ${
                        hoveredIcon
                          ? `bottom-[50%] right-[50%] translate-x-[50%] translate-y-[50%] scale-[1.5] opacity-0`
                          : `bottom-[-4px] right-[-4px] scale-[1] opacity-100`
                      }`}
                    >
                      <MdOutlineModeEditOutline className="text-[var(--color-text)]" />
                      {/* <HiOutlineCamera className="text-[var(--color-text)]" /> */}
                    </div>
                    {hoveredIcon && (
                      <div
                        className={`flex-center pointer-events-none absolute left-0 top-0 z-10 h-full w-full rounded-full bg-[#00000090]`}
                      >
                        <MdOutlineModeEditOutline className="text-[24px] text-[#fff]" />
                      </div>
                    )}
                  </div>

                  {/* 名前・メールエリア */}
                  <div
                    className={`ml-[16px] mr-[8px] flex w-full cursor-pointer select-none flex-col justify-center text-[14px] text-[var(--color-text-title)] hover:underline`}
                    onMouseEnter={() => {
                      setHoveredIcon(true);
                    }}
                    onMouseLeave={() => {
                      setHoveredIcon(false);
                    }}
                    onClick={() => {
                      setHoveredIcon(false);
                      openSettingAccounts();
                    }}
                  >
                    <span className="font-bold">{userProfileState?.profile_name}</span>
                    <span className="text-[13px] text-[var(--color-text-sub)]">{userProfileState?.email}</span>
                  </div>
                </div>

                <hr className="min-h-[1px] w-full bg-[var(--color-border-base)]" />

                {/* テーマ・アカウント設定エリア */}
                <div className="flex w-full flex-col">
                  <ul className={`flex flex-col pb-[8px] text-[13px] text-[var(--color-text-title)]`}>
                    <li
                      className={`relative flex h-[40px] w-full items-center px-[18px] py-[6px] pr-[18px] hover:bg-[var(--color-dropdown-list-hover)] hover:text-[var(--color-dropdown-list-hover-text)]`}
                      // onClick={() => {
                      //   if (memberAccount.account_company_role === "company_admin") {
                      //     setIsOpenRoleMenu(false);
                      //   }
                      //   handleChangeRole("company_admin");
                      //   setIsOpenRoleMenu(false);
                      // }}
                      onMouseEnter={() => setHoveredThemeMenu(true)}
                      onMouseLeave={() => setHoveredThemeMenu(false)}
                    >
                      <CgDarkMode className="mr-[16px] min-h-[20px] min-w-[20px]  text-[20px]" />
                      <span className="select-none">テーマ</span>
                      {/* ドロップダウンサイドメニュー ここから */}
                      {hoveredThemeMenu && (
                        <ul
                          className={`shadow-all-md absolute -left-[150px] top-0 flex min-h-[40px] min-w-[150px] flex-col overflow-hidden rounded-bl-[4px] rounded-tl-[4px] bg-[var(--color-edit-bg-solid)]`}
                        >
                          <li
                            className="flex min-h-[40px] w-full cursor-pointer items-center justify-between px-[18px] hover:bg-[var(--color-dropdown-list-hover)] hover:text-[var(--color-dropdown-list-hover-text)]"
                            onClick={() => setTheme("light")}
                          >
                            <span className="select-none">ライト</span>
                            {theme === "light" && (
                              <BsCheck2 className="min-h-[16px] min-w-[16px] stroke-[0.5] text-[16px]" />
                            )}
                          </li>
                          <li
                            className="flex min-h-[40px] w-full cursor-pointer items-center justify-between px-[18px] hover:bg-[var(--color-dropdown-list-hover)] hover:text-[var(--color-dropdown-list-hover-text)]"
                            onClick={() => setTheme("dark")}
                          >
                            <span className="select-none">ダーク</span>
                            {theme === "dark" && (
                              <BsCheck2 className="min-h-[16px] min-w-[16px] stroke-[0.5] text-[16px]" />
                            )}
                          </li>
                          {/* <li className="flex min-h-[40px] w-full items-center justify-between px-[18px] hover:bg-[var(--color-dropdown-list-hover)] hover:text-[var(--color-dropdown-list-hover-text)]" >
                            <span className="select-none">システム</span>
                          </li> */}
                        </ul>
                      )}
                      {/* ドロップダウンサイドメニュー ここまで */}
                    </li>
                    <li
                      className={`flex h-[40px] w-full cursor-pointer items-center px-[18px] py-[6px] pr-[18px] hover:bg-[var(--color-dropdown-list-hover)] hover:text-[var(--color-dropdown-list-hover-text)]`}
                      onClick={openSettingAccounts}
                    >
                      <VscSettings className="mr-[18px] min-h-[18px] min-w-[18px] stroke-[0.3] text-[18px]" />
                      <span className="select-none">アカウント設定</span>
                    </li>

                    <li className="flex-center w-full">
                      <hr className="w-full border-t border-solid border-[var(--color-border-base)]" />
                    </li>
                    {/* {!memberAccount.account_invited_email && ( */}
                    {/* <li
                      className={`flex h-[40px] w-full cursor-pointer items-center justify-between px-[18px] py-[6px] pr-[18px] hover:bg-[var(--color-dropdown-list-hover)] hover:text-[var(--color-dropdown-list-hover-text)]`}
                      >
                      <span className="select-none">友達に紹介する</span>
                    </li> */}
                    <li
                      className={`flex h-[40px] w-full cursor-pointer items-center px-[18px] py-[6px] hover:bg-[var(--color-dropdown-list-hover)] hover:text-[var(--color-dropdown-list-hover-text)]`}
                      onClick={handleSignOut}
                    >
                      <IoLogOutOutline className="mr-[14px] min-h-[22px] min-w-[22px] text-[22px]" />
                      <span className="select-none">ログアウト</span>
                    </li>
                    {/* )} */}
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
        {/* 右から２番目 歯車 */}
        <div className="flex-center mr-[8px] h-full w-[40px]">
          <div
            data-text="アカウント設定"
            className="flex-center h-full w-full cursor-pointer rounded-full hover:bg-[var(--color-bg-sub)]"
            onMouseEnter={(e) => handleOpenTooltip(e, "center")}
            onMouseLeave={handleCloseTooltip}
            onClick={() => {
              setLoadingGlobalState(false);
              setIsOpenSettingAccountModal(true);
              setSelectedSettingAccountMenu("Profile");
            }}
          >
            <IoSettingsOutline className="text-[24px] text-[var(--color-icon)]" />
          </div>
        </div>
        {/* 右から３番目 ベル */}
        <div className="flex-center relative mr-[8px] h-full w-[40px]">
          <div
            data-text="お知らせ"
            className="flex-center h-full w-full cursor-pointer rounded-full hover:bg-[var(--color-bg-sub)]"
            onClick={() => setOpenNotificationModal(true)}
            onMouseEnter={(e) => handleOpenTooltip(e, "center")}
            onMouseLeave={handleCloseTooltip}
          >
            <AiOutlineBell className="text-[24px] text-[var(--color-icon)]" />
            {/* 通知アイコン */}
            {!!notificationData?.length && (
              <div className={`${styles.notice_outer} flex-center transition-base`}>
                <div className={`${styles.notice_inner} transition-base`}></div>
              </div>
            )}
          </div>

          {/* お知らせモーダルにはoverflow: hiddenが適用されていて、ツールチップが見切れてしまうため、
              ツールチップ用にモーダルと同じサイズのコンテナを作成しrefオブジェクトを渡して、pointer-events: noneをすることで
              ツールチップを見切れることなく、下のモーダルにもポインターを正常に当てることができる */}
          {openNotificationModal && (
            <div
              className="pointer-events-none absolute right-[0px] top-[50px] z-[1000] flex min-h-[560px] min-w-[400px] max-w-[400px]"
              ref={modalContainerRef}
            >
              {hoveredItemPosModal && <TooltipModal />}
            </div>
          )}
          {/* ==================== お知らせドロップダウンメニュー ==================== */}
          {openNotificationModal && (
            <>
              {/* オーバーレイ */}
              <div
                className="fixed left-[-50%] top-[-50%] z-[50] h-[200vh] w-[200vw] "
                onClick={() => setOpenNotificationModal(false)}
              ></div>

              {/* モーダル */}
              <div
                className="shadow-all-md absolute right-[0px] top-[50px] z-[100] flex min-h-[560px] min-w-[400px] max-w-[400px] flex-col overflow-hidden rounded-[8px] bg-[var(--color-edit-bg-solid)]"
                // ref={modalContainerRef}
              >
                {/* {hoveredItemPosModal && <TooltipModal />} */}
                <div
                  className={`flex min-h-[72px] items-center justify-between p-[16px] text-[var(--color-text-title)]`}
                >
                  <h4 className="select-none text-[18px] font-bold">アクティビティ</h4>
                  {activeNotificationTab === "ToDo" && (
                    <button
                      className={`transition-base01 min-h-[40px] rounded-[6px] px-[12px] text-[13px] font-bold hover:bg-[var(--color-bg-sub-re)] `}
                    >
                      <span>すべて完了済みとしてマーク</span>
                    </button>
                  )}
                </div>

                <hr className="min-h-[1px] w-full bg-[var(--color-border-base)]" />

                {/* お知らせコンテンツエリア */}
                <div className={`flex flex-col`}>
                  {/* ToDo 完了 アンダーライン エリア */}
                  <div className={`flex flex-col px-[16px] pt-[4px]`}>
                    {/* ToDo・完了ボックス */}
                    <div className={`flex min-h-[40px] text-[15px] font-semibold`}>
                      <div
                        className={`flex-center transition-base-color02 min-h-full w-[50%] cursor-pointer hover:text-[var(--color-text-brand-f)] ${
                          activeNotificationTab === "ToDo"
                            ? `text-[var(--color-text-title)]`
                            : `text-[var(--color-text-sub)]`
                        } text-[16px]`}
                        onClick={() => setActiveNotificationTab("ToDo")}
                      >
                        <span>ToDo</span>
                      </div>
                      <div
                        className={`flex-center transition-base-color02 min-h-full w-[50%] cursor-pointer hover:text-[var(--color-text-brand-f)] ${
                          activeNotificationTab === "Completed"
                            ? `text-[var(--color-text-title)]`
                            : `text-[var(--color-text-sub)]`
                        }`}
                        onClick={() => setActiveNotificationTab("Completed")}
                      >
                        <span>完了</span>
                      </div>
                    </div>
                    {/* アンダーラインボックス */}
                    <div className={`relative min-h-[2px] w-full`}>
                      {/* アンダーライン */}
                      <div
                        className={`transition-base03 absolute top-0 h-full w-[50%] bg-[var(--color-bg-brand-f)] ${
                          activeNotificationTab === "ToDo" ? `left-0` : `left-[50%]`
                        }`}
                      ></div>
                    </div>
                  </div>
                  {/* お知らせコンテンツ エリア ToDo */}
                  <div
                    className={`transition-base flex h-auto w-[800px] flex-col ${
                      activeNotificationTab === "ToDo" ? `ml-0 opacity-100` : `-ml-[400px] opacity-100`
                    }`}
                    onClick={() => {
                      console.log("カードクリック");
                    }}
                  >
                    {/* カード */}
                    <div
                      className={`flex min-h-[96px] max-w-[400px] cursor-pointer ${
                        activeNotificationTab === "ToDo"
                          ? `transition-base-opacity1 opacity-100`
                          : `transition-base-opacity04 opacity-0`
                      }`}
                    >
                      <div
                        className={`transition-base-color03 flex h-full w-full py-[16px] hover:bg-[var(--color-bg-sub-re)]`}
                      >
                        {/* チェックボックス */}
                        <div className="flex-center relative mx-[10px] my-[16px] max-h-[24px] max-w-[24px]">
                          <div role="gridcell" className={styles.grid_cell}>
                            <div
                              className={`${styles.grid_select_cell_header}`}
                              data-text="完了済みとしてマーク"
                              onMouseEnter={(e) => handleOpenTooltipModal(e, "top")}
                              onMouseLeave={handleCloseTooltipModal}
                            >
                              <input
                                type="checkbox"
                                // checked={checkedMembersArray[index]}
                                // onChange={() => {
                                //   const newCheckedArray = [...checkedMembersArray];
                                //   newCheckedArray[index] = !checkedMembersArray[index];
                                //   setCheckedMembersArray(newCheckedArray);
                                // }}
                                // checked={checked}
                                // onChange={() => setChecked(!checked)}
                                onClick={() => {
                                  console.log("チェックボックスクリック");
                                  console.log("チェックボックスクリック2");
                                  console.log("チェックボックスクリック3");
                                }}
                                className={`${styles.grid_select_cell_header_input}`}
                              />
                              <svg viewBox="0 0 18 18" fill="white" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        {/* アバター画像エリア */}
                        <div className={`mr-[16px] mt-[2px] flex min-h-[48px] min-w-[48px] justify-center`}>
                          {!avatarUrl && (
                            <div
                              data-text={`${userProfileState?.profile_name}`}
                              className={`flex-center h-[48px] w-[48px] cursor-pointer rounded-full bg-[var(--color-bg-brand-sub)] text-[#fff] hover:bg-[var(--color-bg-brand-sub-hover)] ${styles.tooltip}`}
                            >
                              {/* <span>K</span> */}
                              <span className={`pointer-events-none text-[22px]`}>
                                {userProfileState?.profile_name
                                  ? getInitial(userProfileState.profile_name)
                                  : `${getInitial("NoName")}`}
                              </span>
                            </div>
                          )}
                          {avatarUrl && (
                            <div
                              data-text={`${userProfileState?.profile_name}`}
                              className={`flex-center h-[48px] w-[48px] cursor-pointer overflow-hidden rounded-full hover:bg-[#00000020]`}
                            >
                              <Image
                                src={avatarUrl}
                                alt="Avatar"
                                className={`pointer-events-none h-full w-full object-cover text-[#fff]`}
                                width={75}
                                height={75}
                              />
                            </div>
                          )}
                        </div>
                        {/* コンテンツエリア */}
                        <div className={`mr-[16px] flex h-auto w-full flex-col text-[var(--color-text-title)]`}>
                          {/* テキストコンテンツ */}
                          <div className={`text-[13px]`}>
                            <p>
                              <span className="font-bold">Ken</span>さんが
                              <span className="font-bold">Kenta Itoさんのチーム</span>
                              の所有者として代わりにあなたを任命しました。確認してください。
                            </p>
                          </div>
                          {/* 時間とNewマーク */}
                          <div className="flex items-center text-[12px]">
                            <span className="pl-[0px] pt-[4px]">昨日、15:26</span>
                            <div className="pl-[8px] pt-[4px]">
                              <div className="min-h-[20px] rounded-full bg-[var(--color-red-tk)] px-[10px] text-[#fff]">
                                <span>New</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          {/* ==================== お知らせポップアップ ここまで ==================== */}
        </div>
      </div>
    </header>
  );
};

export const DashboardHeader = memo(DashboardHeaderMemo);
