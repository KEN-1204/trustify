import useStore from "@/store";
import React, { FC, Fragment, memo, useEffect, useRef, useState } from "react";
import styles from "./DashboardHeader.module.css";
import { HiOutlineBars3 } from "react-icons/hi2";
import { IoLogOutOutline, IoSettingsOutline } from "react-icons/io5";

import { AiOutlineBell, AiOutlineMoneyCollect, AiOutlinePicture } from "react-icons/ai";
import { CgDarkMode } from "react-icons/cg";
import { GiSettingsKnobs } from "react-icons/gi";
import { BsCheck2, BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Image from "next/image";
import ImageLegacy from "next/legacy/image";
import Link from "next/link";
import useDashboardStore from "@/store/useDashboardStore";
import useThemeStore from "@/store/useThemeStore";
import useRootStore from "@/store/useRootStore";
import { useDownloadUrl } from "@/hooks/useDownloadUrl";
import { useQueryNotifications } from "@/hooks/useQueryNotifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TooltipModal } from "../Parts/Tooltip/TooltipModal";
import {
  MdClose,
  MdOutlineAdminPanelSettings,
  MdOutlineDataSaverOff,
  MdOutlineLeaderboard,
  MdOutlineModeEditOutline,
} from "react-icons/md";
import { VscSettings } from "react-icons/vsc";
import { toast } from "react-toastify";
import { Notification } from "@/types";
import { NotificationTextChangeTeamOwner } from "./NotificationCardText/NotificationTextChangeTeamOwner";
import { format } from "date-fns";
import { NotificationCardTest } from "./NotificationCard/NotificationCardTest";
import { runFireworks } from "@/utils/confetti";
import SpinnerIDS2 from "../Parts/SpinnerIDS/SpinnerIDS2";
import { FiRefreshCw } from "react-icons/fi";
import { coffeeWithFriendsIllustration, completedTasks, neonIconsSettingsGear, reminderIllustration } from "../assets";
import { useMedia } from "react-use";
import { GrDocumentVerified, GrHomeRounded, GrUserManager } from "react-icons/gr";
import { BiMoneyWithdraw } from "react-icons/bi";
import { FaLink, FaTelegramPlane } from "react-icons/fa";
import { LuSettings2 } from "react-icons/lu";
import { RxDot } from "react-icons/rx";
import { optionsColorPalette } from "@/utils/selectOptions";

export const DashboardHeaderMemo: FC = () => {
  const supabase = useSupabaseClient();
  // const theme = useThemeStore((state) => state.theme);
  const theme = useRootStore(useThemeStore, (state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  // const theme = useStore((state) => state.theme);
  const language = useStore((state) => state.language);
  const hoveredItemPos = useStore((state) => state.hoveredItemPos);
  const setHoveredItemPos = useStore((state) => state.setHoveredItemPos);
  const activeMenuTab = useDashboardStore((state) => state.activeMenuTab);
  const setActiveMenuTab = useDashboardStore((state) => state.setActiveMenuTab);
  const isOpenSidebar = useDashboardStore((state) => state.isOpenSidebar);
  const setIsOpenSidebar = useDashboardStore((state) => state.setIsOpenSidebar);
  // アカウント設定モーダル
  const setIsOpenSettingAccountModal = useDashboardStore((state) => state.setIsOpenSettingAccountModal);
  const setSelectedSettingAccountMenu = useDashboardStore((state) => state.setSelectedSettingAccountMenu);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const loadingGlobalState = useDashboardStore((state) => state.loadingGlobalState);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  const [tabPage, setTabPage] = useState(1);
  // リフェッチローディング
  const [refetchLoading, setRefetchLoading] = useState(false);
  // 各タブの選択しているRowデータをタブ移動ごとにリセットする
  const selectedRowDataCompany = useDashboardStore((state) => state.selectedRowDataCompany);
  const selectedRowDataContact = useDashboardStore((state) => state.selectedRowDataContact);
  const selectedRowDataActivity = useDashboardStore((state) => state.selectedRowDataActivity);
  const selectedRowDataMeeting = useDashboardStore((state) => state.selectedRowDataMeeting);
  const selectedRowDataProperty = useDashboardStore((state) => state.selectedRowDataProperty);
  const selectedRowDataQuotation = useDashboardStore((state) => state.selectedRowDataQuotation);
  const setSelectedRowDataCompany = useDashboardStore((state) => state.setSelectedRowDataCompany);
  const setSelectedRowDataContact = useDashboardStore((state) => state.setSelectedRowDataContact);
  const setSelectedRowDataActivity = useDashboardStore((state) => state.setSelectedRowDataActivity);
  const setSelectedRowDataMeeting = useDashboardStore((state) => state.setSelectedRowDataMeeting);
  const setSelectedRowDataProperty = useDashboardStore((state) => state.setSelectedRowDataProperty);
  const setSelectedRowDataQuotation = useDashboardStore((state) => state.setSelectedRowDataQuotation);
  // テーマ別ロゴ
  // const logoSrc =
  //   theme === "light" && activeMenuTab !== "SDB"
  //     ? "/assets/images/Trustify_logo_white1.png"
  //     : "/assets/images/Trustify_logo_black.png";
  const logoSrc =
    theme === "light" ? "/assets/images/Trustify_logo_white1.png" : "/assets/images/Trustify_logo_black.png";

  // const { fullUrl: avatarUrl, isLoading } = useDownloadUrl(userProfileState?.avatar_url, "avatars");
  const avatarUrl = useDashboardStore((state) => state.avatarImgURL);
  const { isLoading } = useDownloadUrl(userProfileState?.avatar_url, "avatars");

  // テーマホバー有無
  const [hoveredThemeMenu, setHoveredThemeMenu] = useState(false);
  // プロフィールアイコンホバー
  const [hoveredIcon, setHoveredIcon] = useState(false);
  //
  const infoIconNoticeRef = useRef<HTMLDivElement | null>(null);

  const handleOpenTooltip = (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    display: string,
    itemsPosition?: string,
    whiteSpace?: "normal" | "pre" | "nowrap" | "pre-wrap" | "pre-line" | "break-spaces"
  ) => {
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
      itemsPosition: itemsPosition,
      whiteSpace: whiteSpace,
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

  // ================================ お知らせ所有権変更関連 ================================
  // 【お知らせの所有者変更モーダル開閉状態】
  // const [openNotificationChangeTeamOwnerModal, setOpenNotificationChangeTeamOwnerModal] = useState(false);
  // const openNotificationChangeTeamOwnerModal = useDashboardStore((state) => state.openNotificationChangeTeamOwnerModal);
  const setOpenNotificationChangeTeamOwnerModal = useDashboardStore(
    (state) => state.setOpenNotificationChangeTeamOwnerModal
  );
  // 【お知らせの所有者変更モーダルをクリック時にお知らせの情報を保持するState】
  // const [notificationDataState, setNotificationDataState] = useState<Notification | null>(null);
  // const notificationDataState = useDashboardStore((state) => state.notificationDataState);
  const setNotificationDataState = useDashboardStore((state) => state.setNotificationDataState);

  // =============== お知らせ notificationsを取得 ===============
  const [openNotificationModal, setOpenNotificationModal] = useState(false); // お知らせ開閉
  const [activeNotificationTab, setActiveNotificationTab] = useState("ToDo"); // お知らせアクティブタブ ToDo/完了
  // const myAllNotifications = useDashboardStore((state) => state.myAllNotifications);
  // const setMyAllNotifications = useDashboardStore((state) => state.setMyAllNotifications);
  const incompleteNotifications = useDashboardStore((state) => state.incompleteNotifications);
  const setIncompleteNotifications = useDashboardStore((state) => state.setIncompleteNotifications);
  const completedNotifications = useDashboardStore((state) => state.completedNotifications);
  const setCompletedNotifications = useDashboardStore((state) => state.setCompletedNotifications);
  // タブ切り替え時にサーチモードと編集モードがtrueならfalseにしてタブ切り替えする
  const searchMode = useDashboardStore((state) => state.searchMode);
  const setSearchMode = useDashboardStore((state) => state.setSearchMode);
  const editSearchMode = useDashboardStore((state) => state.editSearchMode);
  const setEditSearchMode = useDashboardStore((state) => state.setEditSearchMode);

  // ------------ SDB関連 ------------
  // セッティングメニュー
  const [isOpenSettingsSDB, setIsOpenSettingsSDB] = useState(false);

  const mappingDescriptionsSDB: { [key: string]: { [key: string]: string }[] } = {
    // guide: descriptionGuide,
    // step: descriptionSteps,
    // compressionRatio: descriptionCompressionRatio,
    // printTips: descriptionPrintTips,
  };
  // テーマカラーパレット
  const activeThemeColor = useDashboardStore((state) => state.activeThemeColor);
  const setActiveThemeColor = useDashboardStore((state) => state.setActiveThemeColor);
  const mappingPaletteStyle: { [key: string]: string } = {
    "theme-brand-f": "var(--color-palette-brand-f)",
    "theme-brand-f-gradient": "var(--color-palette-brand-f-gradient)",
    "theme-black-gradient": "var(--color-palette-black-gradient)",
    "theme-simple12": "var(--color-palette-simple12)",
    "theme-simple17": "var(--color-palette-simple17)",
  };

  // テーマカラー変更
  const handleSwitchThemeColor = (color: string) => {
    if (color === activeThemeColor) return;
    setActiveThemeColor(
      color as "theme-brand-f" | "theme-brand-f-gradient" | "theme-black-gradient" | "theme-simple12" | "theme-simple17"
    );
    // ローカルストレージにセット 文字列のためparseは不要
    localStorage.setItem("theme_color", color);
  };

  // -------------------------- 🌟ポップアップメニュー🌟 --------------------------
  const [isOpenPopupOverlay, setIsOpenPopupOverlay] = useState(false);
  const [openPopupMenu, setOpenPopupMenu] = useState<{
    x?: number;
    y: number;
    title: string;
    displayX?: string;
    maxWidth?: number;
  } | null>(null);
  const mappingPopupTitle: { [key: string]: { [key: string]: string } } = {
    compressionRatio: { en: "Compression Ratio", ja: "解像度" },
    footnotes: { en: "Footnotes", ja: "脚注" },
    print: { en: "Print Tips", ja: "印刷Tips" },
    pdf: { en: "PDF Download", ja: "PDFダウンロード" },
    settings: { en: "Settings", ja: "各種設定メニュー" },
    edit: { en: "Edit Mode", ja: "編集モード" },
    change_theme: { en: "Change theme", ja: "テーマカラー変更" },
  };
  type PopupMenuParams = {
    e: React.MouseEvent<HTMLElement, MouseEvent>;
    title: string;
    displayX?: string;
    maxWidth?: number;
  };
  const handleOpenPopupMenu = ({ e, title, displayX, maxWidth }: PopupMenuParams) => {
    if (!displayX) {
      const { y, height } = e.currentTarget.getBoundingClientRect();
      setOpenPopupMenu({
        y: y - height / 2,
        title: title,
      });
    } else {
      const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
      // right: 見積書の右端から-18px, アイコンサイズ35px, ポップアップメニュー400px
      let positionX = 0;
      positionX = displayX === "right" ? -18 - 50 - (maxWidth ?? 400) : 0;
      positionX = displayX === "left" ? window.innerWidth - x : 0;
      console.log("クリック", displayX, e, x, y, width, height);

      setOpenPopupMenu({
        x: positionX,
        // y: y - height / 2,
        y: y,
        title: title,
        displayX: displayX,
        maxWidth: maxWidth,
      });
    }
  };
  const handleClosePopupMenu = () => {
    setOpenPopupMenu(null);
  };
  const handleCloseSettings = () => {
    setIsOpenSettingsSDB(false);
  };
  const handleCloseClickPopup = () => {
    if (!!openPopupMenu && isOpenPopupOverlay) {
      handleClosePopupMenu();
      setIsOpenPopupOverlay(false);
    }
  };

  // -------------------------- ✅ポップアップメニュー✅ --------------------------

  const queryClient = useQueryClient();
  const notificationsCacheData = queryClient.getQueryData<Notification[]>(["my_notifications"]);

  console.log(
    "DashboardHeaderレンダリング",
    "notificationData?.length",
    notificationsCacheData?.length,
    "notificationキャッシュのdata",
    notificationsCacheData,
    "incompleteNotifications",
    incompleteNotifications,
    "completedNotifications",
    completedNotifications,
    "activeMenuTab",
    activeMenuTab,
    "activeThemeColor",
    activeThemeColor
  );

  // ================================ お知らせ キャッシュから取得したnotificationsを、未読、既読、完了済みに振り分ける
  useEffect(() => {
    if (!notificationsCacheData || notificationsCacheData.length === 0)
      return console.log("ヘッダー useEffect実行 notificationsCacheDataなしでリターン", notificationsCacheData);
    console.log("ヘッダー useEffect実行 notificationsキャッシュかZustandのお知らせが変化", notificationsCacheData);

    // 未完了のお知らせを取得
    const incompleteNotificationsData = notificationsCacheData.filter((data) => data.completed === false);
    // 未読が0になったら紙吹雪
    // 全て完了済みになったらFireworksアニメーションを起動
    if (incompleteNotificationsData.length === 0 && incompleteNotifications.length !== 0) {
      setTimeout(() => {
        console.log("全てのタスクを完了済みにマーク🌟");
        toast.success("全てのタスクが完了済みとしてマークされました！", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          // theme: `${theme === "light" ? "light" : "dark"}`,
        });
        runFireworks();
      }, 1000);
    }
    setIncompleteNotifications(incompleteNotificationsData);
    // 完了済みのお知らせを取得
    const completedNotificationsData = notificationsCacheData.filter((data) => data.completed === true);
    setCompletedNotifications(completedNotificationsData);
  }, [notificationsCacheData, incompleteNotifications.length, setCompletedNotifications, setIncompleteNotifications]);

  // ================================ お知らせ カードクリック
  const handleClickedNotificationCard = async (notification: Notification, i: number) => {
    console.log("カードクリック type", notification.type);
    // お知らせ お知らせモーダルが開かれたら未読を既読に変更する
    if (notification.already_read === false) {
      const { data, error } = await supabase
        .from("notifications")
        .update({
          already_read: true,
          already_read_at: new Date().toISOString(),
        })
        .eq("id", notification.id)
        .select();

      if (error) {
        console.error("notificationのUPDATE失敗 error:", error);
        return toast.error("お知らせ情報の取得に失敗しました！", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: `${theme === "light" ? "light" : "dark"}`,
        });
      }

      const updatedNotice: Notification = data[0];
      console.log("UPDATEしたお知らせ", updatedNotice);

      // エラーが出なければ、incompleteNotificationを既読に変更
      const newReadNotice = {
        ...incompleteNotifications[i],
        already_read: updatedNotice.already_read,
        already_read_at: updatedNotice.already_read_at,
      };
      const newIncompleteNotices = incompleteNotifications.map((notice, index) => {
        if (index === i) return newReadNotice;
        return notice;
      });
      setIncompleteNotifications(newIncompleteNotices);
      console.log("newReadNotice", newReadNotice, "newIncompleteNotices", newIncompleteNotices);
      // await queryClient.invalidateQueries({ queryKey: ["my_notifications"] });
      // let previousNotificationCacheData = queryClient.getQueryData<Notification[]>(["my_notifications"]);
      // if (typeof previousNotificationCacheData === "undefined") {
      //   previousNotificationCacheData = [];
      // }

      // queryClient.setQueryData(
      //   ["my_notifications"],
      //   previousNotificationCacheData?.map((notice, index) =>
      //     notice.id === notification.id
      //       ? {
      //           ...(previousNotificationCacheData as Notification[] | [])[index],
      //           already_read: true,
      //           already_read_at: updatedNotice.already_read_at,
      //         }
      //       : notice
      //   )
      // );
    }

    if (notification.type === "change_team_owner") {
      console.log("所有者変更モーダル オープン");
      setOpenNotificationChangeTeamOwnerModal(true);
      setNotificationDataState(notification);
    }
  };

  // ================================ お知らせ ToDoカードをチェックして完了済みに変更
  const handleCheckToDoCard = async (notification: Notification) => {
    console.log("チェックボックスクリック");

    // already_readの値に応じて更新データを設定
    const updateData = notification.already_read
      ? {
          completed: true,
          completed_at: new Date().toISOString(),
        }
      : {
          already_read: true,
          already_read_at: new Date().toISOString(),
          completed: true,
          completed_at: new Date().toISOString(),
        };

    // 完了済みに変更
    const { data, error } = await supabase.from("notifications").update(updateData).eq("id", notification.id).select();
    if (error) {
      console.error("お知らせを完了済み処理でエラー発生", error);
      toast.error("タスクの完了処理でエラーが発生しました！", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: `${theme === "light" ? "light" : "dark"}`,
      });
      return;
    }

    const updatedNotification = data[0];

    console.log("UPDATEしたお知らせ", updatedNotification);

    // エラーが出なければ、React-Queryのキャッシュも最新状態に更新
    const newNotificationCacheArray = notificationsCacheData?.map((notice, index) =>
      notice.id === notification.id
        ? {
            ...notificationsCacheData[index],
            already_read: true,
            already_read_at: updatedNotification.already_read_at,
            completed: true,
            completed_at: updatedNotification.completed_at,
          }
        : notice
    );
    queryClient.setQueryData(["my_notifications"], newNotificationCacheArray);

    toast.success("完了済みとしてマークしました！", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: `${theme === "light" ? "light" : "dark"}`,
    });
  };

  // ================================ お知らせ 完了済みのカードのチェックを外す関数
  const handleUncheckCompletedCard = async (notification: Notification) => {
    console.log("完了済みチェックボックスクリック");

    // 完了済みに変更
    const { data, error } = await supabase
      .from("notifications")
      .update({
        already_read: true,
        already_read_at: null,
        completed: false,
        completed_at: null,
      })
      .eq("id", notification.id)
      .select();
    if (error) {
      console.error("完了済みのお知らせをタスクへ変更処理でエラー発生", error);
      toast.error("完了済みのタスクをToDoへの変更処理でエラーが発生しました！", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: `${theme === "light" ? "light" : "dark"}`,
      });
      return;
    }

    const updatedNotification = data[0];

    console.log("UPDATEしたお知らせ", updatedNotification);

    // エラーが出なければ、React-Queryのキャッシュも最新状態に更新
    const newNotificationCacheArray = notificationsCacheData?.map((notice, index) =>
      notice.id === notification.id
        ? {
            ...notificationsCacheData[index],
            already_read: true,
            already_read_at: updatedNotification.already_read_at,
            completed: false,
            completed_at: updatedNotification.completed_at,
          }
        : notice
    );
    queryClient.setQueryData(["my_notifications"], newNotificationCacheArray);

    toast.success("完了済みタスクをToDoへ変更しました！", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: `${theme === "light" ? "light" : "dark"}`,
    });
  };

  // ================================ お知らせ 全てのToDoカードチェックして完了済みに変更
  // 一つ一つのToDoカードにチェックを入れる関数
  const checkToDoCard = async (notification: Notification, i: number) => {
    console.log(`${i}番目のカードをチェックする処理`);

    // 完了済みに変更
    const { data, error } = await supabase
      .from("notifications")
      .update({
        already_read: true,
        already_read_at: new Date().toDateString(),
        completed: true,
        completed_at: new Date().toDateString(),
      })
      .eq("id", notification.id)
      .select();
    if (error) {
      console.error("お知らせを完了済み処理でエラー発生", error);
      throw new Error(error.message);
    }

    const updatedNotification = data[0];

    console.log("UPDATEしたお知らせ", updatedNotification);

    // エラーが出なければ、React-Queryのキャッシュも最新状態に更新
    const newNotificationCacheArray = notificationsCacheData?.map((notice, index) =>
      notice.id === notification.id
        ? {
            ...notificationsCacheData[index],
            already_read: true,
            already_read_at: updatedNotification.already_read_at,
            completed: true,
            completed_at: updatedNotification.completed_at,
          }
        : notice
    );
    queryClient.setQueryData(["my_notifications"], newNotificationCacheArray);
  };
  // 全てのToDoカードをチェック
  const handleAllCheckToDoCard = async () => {
    if (incompleteNotifications.length === 0) return console.log("無し");
    try {
      incompleteNotifications.forEach((notification, index) => {
        checkToDoCard(notification, index);
      });
      setIncompleteNotifications([]);
      setTimeout(() => {
        toast.success("全てのタスクを完了済みにマークしました！", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: `${theme === "light" ? "light" : "dark"}`,
        });
        runFireworks();
      }, 500);
    } catch (error: any) {
      console.error(error.message);
      toast.error("タスクの完了処理でエラーが発生しました！", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: `${theme === "light" ? "light" : "dark"}`,
      });
    }
  };

  // ================================ お知らせ 「所有者を受け入れる」クリック時の関数
  const handleAcceptChangeTeamOwner = async () => {};

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
  // 管理者クリック 会社管理画面オープン
  const openSalesTarget = () => {
    if (activeMenuTab === "SalesTarget") return;
    // if (userProfileState?.account_company_role !== ("company_owner" || "company_admin"))
    //   return alert("管理者権限が必要です。");
    // setIsOpenSettingAccountModal(true);
    // setSelectedSettingAccountMenu("Company");
    if (loadingGlobalState) setLoadingGlobalState(false);
    setIsOpenSidebar(false);
    setActiveMenuTab("SalesTarget");
    handleCloseTooltip();
  };

  // タブ名によって選択中のRowデータをリセットする関数
  const resetSelectedRowData = (newTabName: string, currentTabName: string) => {
    // 現在のタブと違うタブに移動する場合には全てのselectedRowDataをリセット
    if (newTabName !== currentTabName) {
      if (!!selectedRowDataCompany) setSelectedRowDataCompany(null);
      if (!!selectedRowDataContact) setSelectedRowDataContact(null);
      if (!!selectedRowDataActivity) setSelectedRowDataActivity(null);
      if (!!selectedRowDataMeeting) setSelectedRowDataMeeting(null);
      if (!!selectedRowDataProperty) setSelectedRowDataProperty(null);
      if (!!selectedRowDataQuotation) setSelectedRowDataQuotation(null);
    }
    // 現在のタブと一緒なら選択中のRowデータはリセットしない
  };

  // タブ切り替えでサーチモードをfalseに
  const switchActiveTab = (tabName: string) => {
    if (activeMenuTab === tabName) return;
    if (searchMode) setSearchMode(false);
    if (editSearchMode) setEditSearchMode(false);
    if (loadingGlobalState) setLoadingGlobalState(false);
    resetSelectedRowData(tabName, activeMenuTab);
    setActiveMenuTab(tabName);
  };

  // メディアクエリState Macbook 13インチ 1440px未満はtrue
  const isLT1440Media = useMedia("(max-width: 1439px)", false);
  const [isLT1440, setIsLT1440] = useState(isLT1440Media);
  useEffect(() => {
    setIsLT1440(isLT1440Media);
  }, [isLT1440Media]);

  // テストファンクション
  const handleTestFn = () => {
    // console.log("テスト クリック");
    toast.success("Thanks! by TRUSTiFY🌠");
  };

  return (
    <header
      className={`${styles.app_header} ${
        activeMenuTab !== "HOME" && activeMenuTab !== "SDB" ? `transition-bg01` : `transition-bg05`
      } ${activeMenuTab === "SDB" ? `${styles.sdb}` : ``}`}
    >
      {/* 左コンテンツ */}
      <div className="relative flex h-full  items-center justify-start ">
        <div
          data-text={`${
            activeMenuTab !== "SDB"
              ? isOpenSidebar
                ? "メニューを縮小"
                : "メニューを拡大"
              : isOpenSidebar
              ? "メニューを非表示"
              : "メニューを表示"
          }`}
          className={`${
            styles.icon_btn
          } flex-center  min-h-[40px] min-w-[40px] cursor-pointer rounded-full hover:bg-[--color-bg-sub] ${
            activeMenuTab === "SDB" ? `${styles.sdb}` : ``
          }`}
          onMouseEnter={(e) => handleOpenTooltip(e, "left")}
          onMouseLeave={handleCloseTooltip}
          onClick={() => setIsOpenSidebar(!isOpenSidebar)}
        >
          <HiOutlineBars3 className={`pointer-events-none text-[24px] text-[--color-text]`} />
        </div>
        <div
          className="relative flex h-full w-[145px] select-none items-center justify-center pl-[16px]"
          onClick={handleTestFn}
        >
          <Image
            src={logoSrc}
            alt=""
            className="h-full w-[90%] object-contain"
            fill
            // priority={true}
            sizes="10vw"
            // placeholder="blur"
            // blurDataURL={theme === "dark" ? blurDataURLDark : blurDataURL}
            // className="!relative !h-[60px] !w-[200px] object-cover"
            // onClick={() => setActiveMenuTab("HOME")}
          />
        </div>
        {/* ヘッダータブ左スクロール時に連続でツールチップが表示されないようにするためのオーバーレイ */}

        {activeMenuTab !== "SDB" && (
          <div
            className={`${
              activeMenuTab !== "HOME" && activeMenuTab !== "SDB" ? `transition-bg01` : `transition-bg05`
            } absolute left-[185px] top-0 z-30 h-full w-[39px] ${styles.arrow_overlay} ${
              activeMenuTab !== "SDB" ? `bg-[var(--color-bg-base)]` : ``
            }`}
          ></div>
        )}
      </div>

      {/* 左矢印 */}
      {tabPage !== 1 && activeMenuTab !== "SDB" && (
        <div
          className={`flex-center absolute left-[calc(16px+185px)]  z-50 h-[35px] w-[35px] cursor-pointer rounded-full hover:bg-[var(--color-btn-brand-f05)]`}
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
      {/* {tabPage !== 1 && (
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
      )} */}

      {/* 真ん中のコンテンツ */}
      {/* <div className="bg-blue-0 relative flex h-full flex-1 justify-start pl-[39px] md:overflow-x-hidden"> */}
      {activeMenuTab !== "SDB" && (
        <div className="bg-blue-0 relative flex h-full flex-1 justify-start pl-[39px] md:overflow-x-hidden">
          {/* ============================= 1列目ナビゲーションタブ ここから ============================= */}
          {/* <nav className={`${tabPage === 2 ? "-ml-[calc(100%+39px)]" : ""} transition-base `}> */}
          <nav
            // className={`${
            //   tabPage === 2 ? "-ml-[calc(100%+39px)]" : ""
            // } transition-base flex-center w-full max-w-[calc(100vw-185px-35px-165px-48px-39px)]`}
            // className={`${
            //   tabPage === 2 ? "-ml-[calc(100%+39px)]" : ""
            // } transition-base flex-center w-full min-w-[calc(100vw-16px-185px-39px-165px-32px)]`}
            className={`${
              tabPage === 2 ? "-ml-[calc(100%+39px)]" : ""
            } transition-base flex-center min-w-[calc(100vw-185px-35px-165px-48px-39px)]`}
          >
            <ul
              className={`hidden h-full w-full items-center justify-around text-[14px] font-[500] text-[--navColor] md:flex`}
            >
              <li className={`${styles.navList} ${isLT1440 ? `${styles.normal}` : ``}`}>
                <div
                  // href="/home"
                  className={`${styles.navbarItem} ${activeMenuTab === "HOME" ? styles.active : ""} `}
                  // onClick={() => setActiveMenuTab("HOME")}
                  onClick={() => switchActiveTab("HOME")}
                >
                  <div
                    className={`${styles.navbarItemInner}`}
                    data-text="ホーム画面"
                    onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                    onMouseLeave={handleCloseTooltip}
                  >
                    <span>
                      {language === "ja" && "ホーム"}
                      {language === "en" && "HOME"}
                    </span>
                    {/* {!isLT1440 && (
                    <span>
                      {language === "ja" && "ホーム"}
                      {language === "en" && "HOME"}
                    </span>
                  )}
                  {isLT1440 && (
                    <span>
                      <GrHomeRounded className={`text-[16px]`} />
                    </span>
                  )} */}
                  </div>
                  <div className={`${styles.active_underline}`} />
                </div>
              </li>
              <li className={`${styles.navList} ${isLT1440 ? `${styles.normal}` : ``}`}>
                <div
                  // href="/company"
                  className={`${styles.navbarItem} ${activeMenuTab === "Company" ? styles.active : ""} `}
                  // onClick={() => setActiveMenuTab("Company")}
                  onClick={() => switchActiveTab("Company")}
                >
                  <div
                    className={`${styles.navbarItemInner}`}
                    data-text="営業先の会社リストを一覧で確認する"
                    onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                    onMouseLeave={handleCloseTooltip}
                  >
                    <span>
                      {language === "ja" && "会社"}
                      {language === "en" && "Company"}
                    </span>
                    {/* {!isLT1440 && (
                    <span>
                      {language === "ja" && "会社"}
                      {language === "en" && "Company"}
                    </span>
                  )}
                  {isLT1440 && (
                    <span>
                      <HiOutlineBuildingOffice2 className={`text-[20px]`} />
                    </span>
                  )} */}
                  </div>
                  <div className={`${styles.active_underline}`} />
                </div>
              </li>
              <li className={`${styles.navList} ${isLT1440 ? `${styles.normal}` : ``}`}>
                <div
                  // href="/home"
                  // prefetch={false}
                  className={`${styles.navbarItem} ${activeMenuTab === "Contacts" ? styles.active : ""} `}
                  // onClick={() => setActiveMenuTab("Contacts")}
                  onClick={() => switchActiveTab("Contacts")}
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
                      {language === "ja" && "担当者"}
                      {language === "en" && "Contacts"}
                    </span>
                    {/* {!isLT1440 && (
                    <span>
                      {language === "ja" && "担当者"}
                      {language === "en" && "Contacts"}
                    </span>
                  )}
                  {isLT1440 && (
                    <span>
                      <GrUserManager className={`text-[18px]`} />
                    </span>
                  )} */}
                  </div>
                  <div className={`${styles.active_underline}`} />
                </div>
              </li>
              <li className={`${styles.navList} ${isLT1440 ? `${styles.normal}` : ``}`}>
                <div
                  // href="/home"
                  // prefetch={false}
                  className={`${styles.navbarItem} ${activeMenuTab === "Activity" ? styles.active : ""} `}
                  // onClick={() => setActiveMenuTab("Activity")}
                  onClick={() => switchActiveTab("Activity")}
                >
                  <div
                    className={`${styles.navbarItemInner}`}
                    data-text="架電内容、次回フォロー予定日、面談結果など顧客に関する"
                    // data-text2={`全ての情報をきちんと記録することで、リスト作成、架電、面談、フォロー時に\n有効な情報を短時間で取得し、組織全体で最高の結果が出せるようにしましょう`}
                    data-text2="全ての情報をきちんと記録することで、リスト作成、架電、面談、フォロー時に"
                    data-text3="有効な情報を短時間で取得し、組織全体で最高の結果が出せるようにしましょう"
                    onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                    onMouseLeave={handleCloseTooltip}
                  >
                    <span>
                      {language === "ja" && "活動"}
                      {language === "en" && "Activity"}
                    </span>
                    {/* {!isLT1440 && (
                    <span>
                      {language === "ja" && "活動"}
                      {language === "en" && "Activity"}
                    </span>
                  )}
                  {isLT1440 && (
                    <span>
                      <BsTelephonePlus className={`text-[18px]`} />
                    </span>
                  )} */}
                  </div>
                  <div className={`${styles.active_underline}`} />
                </div>
              </li>
              <li className={`${styles.navList} ${isLT1440 ? `${styles.normal}` : ``}`}>
                <div
                  // href="/home"
                  // prefetch={false}
                  className={`${styles.navbarItem} ${activeMenuTab === "Meeting" ? styles.active : ""} `}
                  // onClick={() => setActiveMenuTab("Meeting")}
                  onClick={() => switchActiveTab("Meeting")}
                >
                  <div
                    className={`${styles.navbarItemInner}`}
                    data-text="「訪問・WEB面談」の内容を記録しましょう。"
                    data-text2="お客様から頂いた情報が売れる商品開発に繋がり、将来の顧客となります。"
                    data-text3={`過去の面談内容を活用して今売れる営業先を見つけたり、\n売れる営業マンの良い情報を社内に共有しましょう。`}
                    onMouseEnter={(e) => handleOpenTooltip(e, "center", "center")}
                    onMouseLeave={handleCloseTooltip}
                  >
                    <span>
                      {language === "ja" && "面談・訪問"}
                      {language === "en" && "Meeting"}
                    </span>
                    {/* {!isLT1440 && (
                    <span>
                      {language === "ja" && "面談・訪問"}
                      {language === "en" && "Meeting"}
                    </span>
                  )}
                  {isLT1440 && (
                    <span>
                      <HiOutlineChatBubbleLeftRight className={`text-[20px]`} />
                    </span>
                  )} */}
                  </div>
                  <div className={`${styles.active_underline}`} />
                </div>
              </li>
              <li className={`${styles.navList} ${isLT1440 ? `${styles.normal}` : ``}`}>
                <div
                  // href="/home"
                  // prefetch={false}
                  className={`${styles.navbarItem} ${activeMenuTab === "Property" ? styles.active : ""} `}
                  // onClick={() => setActiveMenuTab("Property")}
                  onClick={() => switchActiveTab("Property")}
                >
                  <div
                    className={`${styles.navbarItemInner}`}
                    data-text="面談・訪問時に「商談、申請、受注」に展開した案件を記録しましょう。"
                    data-text2="このデータが顧客に刺さる商品開発へと繋がり、将来の財産となります。"
                    onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                    onMouseLeave={handleCloseTooltip}
                  >
                    <span>
                      {language === "ja" && "案件"}
                      {language === "en" && "Property"}
                    </span>
                    {/* {!isLT1440 && (
                    <span>
                      {language === "ja" && "案件"}
                      {language === "en" && "Property"}
                    </span>
                  )}
                  {isLT1440 && language === "ja" && (
                    <span>
                      <AiOutlineMoneyCollect className={`text-[22px]`} />
                    </span>
                  )} */}
                    {isLT1440 && language === "en" && (
                      <span>
                        <BiMoneyWithdraw className={`text-[22px]`} />
                      </span>
                    )}
                  </div>
                  <div className={`${styles.active_underline}`} />
                </div>
              </li>
              <li className={`${styles.navList} ${isLT1440 ? `${styles.normal}` : ``}`}>
                <div
                  // href="/home"
                  // prefetch={false}
                  className={`${styles.navbarItem} ${activeMenuTab === "Calendar" ? styles.active : ""} `}
                  // onClick={() => setActiveMenuTab("Calendar")}
                  onClick={() => switchActiveTab("Calendar")}
                >
                  <div
                    className={`${styles.navbarItemInner}`}
                    data-text="自分とメンバーのアポイント状況を確認する"
                    data-text2="もう一件面談を入れる余地が無いか、効率は良いか確認してみましょう。"
                    onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                    onMouseLeave={handleCloseTooltip}
                  >
                    <span>
                      {language === "ja" && "カレンダー"}
                      {language === "en" && "Calendar"}
                    </span>
                    {/* {!isLT1440 && (
                    <span>
                      {language === "ja" && "カレンダー"}
                      {language === "en" && "Calendar"}
                    </span>
                  )}
                  {isLT1440 && (
                    <span>
                      <BsCalendarDate className={`text-[18px]`} />
                    </span>
                  )} */}
                  </div>
                  <div className={`${styles.active_underline}`} />
                </div>
              </li>

              <li className={`${styles.navList} ${isLT1440 ? `${styles.normal}` : ``}`}>
                <div
                  // href="/home"
                  // prefetch={false}
                  className={`${styles.navbarItem} ${activeMenuTab === "Quotation" ? styles.active : ""} `}
                  // onClick={() => setActiveMenuTab("Quotation")}
                  onClick={() => switchActiveTab("Quotation")}
                >
                  <div
                    className={`${styles.navbarItemInner}`}
                    data-text="見積もりを作成する"
                    data-text2="いつでもお客様と商談ができる状態を維持しましょう。"
                    onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                    onMouseLeave={handleCloseTooltip}
                  >
                    <span>
                      {language === "ja" && "見積"}
                      {language === "en" && "Quotation"}
                    </span>
                    {/* {!isLT1440 && (
                    <span>
                      {language === "ja" && "見積"}
                      {language === "en" && "Quotation"}
                    </span>
                  )}
                  {isLT1440 && (
                    <span>
                      <GrDocumentVerified className={`text-[18px]`} />
                    </span>
                  )} */}
                  </div>
                  <div className={`${styles.active_underline}`} />
                </div>
              </li>

              <li className={`${styles.navList} ${isLT1440 ? `${styles.normal}` : ``}`}>
                <div
                  // href="/home"
                  // prefetch={false}
                  className={`${styles.navbarItem} ${activeMenuTab === "SDB" ? styles.active : ""} `}
                  onClick={() => {
                    setIsOpenSidebar(false);
                    setActiveMenuTab("SDB");
                    handleCloseTooltip();
                  }}
                >
                  <div
                    className={`${styles.navbarItemInner}`}
                    data-text="セールスダッシュボード"
                    onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                    onMouseLeave={handleCloseTooltip}
                  >
                    <span>
                      {language === "ja" && "SDB"}
                      {language === "en" && "SDB"}
                    </span>
                    {/* {!isLT1440 && (
                    <span>
                      {language === "ja" && "SDB"}
                      {language === "en" && "SDB"}
                    </span>
                  )}
                  {isLT1440 && (
                    <span>
                      <MdOutlineLeaderboard className={`text-[18px]`} />
                    </span>
                  )} */}
                  </div>
                  <div className={`${styles.active_underline}`} />
                </div>
              </li>

              <li className={`${styles.navList} ${isLT1440 ? `${styles.normal}` : ``}`}>
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
                      {language === "ja" && "引合・リード"}
                      {language === "en" && "Lead"}
                    </span>
                    {/* {!isLT1440 && (
                    <span>
                      {language === "ja" && "引合・リード"}
                      {language === "en" && "Lead"}
                    </span>
                  )}
                  {isLT1440 && (
                    <span>
                      <BsTelephoneInbound className={`text-[18px]`} />
                    </span>
                  )} */}
                  </div>
                  <div className={`${styles.active_underline}`} />
                </div>
              </li>
              <li className={`${styles.navList} ${isLT1440 ? `${styles.normal}` : ``}`}>
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
                      {language === "ja" && "連携"}
                      {language === "en" && "Alignment"}
                    </span>
                    {/* {!isLT1440 && (
                    <span>
                      {language === "ja" && "連携"}
                      {language === "en" && "Alignment"}
                    </span>
                  )}
                  {isLT1440 && (
                    <span>
                      <FaLink className={`text-[18px]`} />
                    </span>
                  )} */}
                  </div>
                  <div className={`${styles.active_underline}`} />
                </div>
              </li>
              <li className={`${styles.navList} ${isLT1440 ? `${styles.normal}` : ``}`}>
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
                      {language === "ja" && "メッセージ"}
                      {language === "en" && "Message"}
                    </span>
                    {/* {!isLT1440 && (
                    <span>
                      {language === "ja" && "メッセージ"}
                      {language === "en" && "Message"}
                    </span>
                  )}
                  {isLT1440 && (
                    <span>
                      <FaTelegramPlane className={`text-[18px]`} />
                    </span>
                  )} */}
                  </div>
                  <div className={`${styles.active_underline}`} />
                </div>
              </li>

              <li className={`${styles.navList} ${isLT1440 ? `${styles.normal}` : ``}`}>
                <div
                  // href="/home"
                  // prefetch={false}
                  // className={`${styles.navbarItem} ${activeMenuTab === "Admin" ? styles.active : ""} `}
                  className={`${styles.navbarItem} ${activeMenuTab === "SalesTarget" ? styles.active : ""} `}
                  onClick={openSalesTarget}
                >
                  <div
                    className={`${styles.navbarItemInner}`}
                    // data-text="管理者専用スペース"
                    data-text="売上・プロセス目標"
                    onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                    onMouseLeave={handleCloseTooltip}
                  >
                    <span>
                      {/* {language === "ja" && "管理者"}
                      {language === "en" && "Admin"} */}
                      {language === "ja" && "目標"}
                      {language === "en" && "Target"}
                    </span>
                    {/* {!isLT1440 && (
                    <span>
                      {language === "ja" && "管理者"}
                      {language === "en" && "Admin"}
                    </span>
                  )}
                  {isLT1440 && (
                    <span>
                      <MdOutlineAdminPanelSettings className={`text-[20px]`} />
                    </span>
                  )} */}
                  </div>
                  <div className={`${styles.active_underline}`} />
                </div>
              </li>
            </ul>
          </nav>
          {/* ============================= 1列目ナビゲーションタブ ここまで ============================= */}
          {/* ============================= ２列目ナビゲーションタブ ここから ============================= */}
          {/* <nav className="h-full min-w-[970px] pl-[69px]"> */}
          <nav className="flex-center h-full min-w-[calc(100vw-185px-35px-165px-48px-39px)] pl-[69px]">
            <ul
              className={`hidden h-full w-full items-center justify-start text-[14px] font-[500] text-[--navColor] md:flex`}
            >
              <li className={`${styles.navList2}`}>
                <div
                  // href="/home"
                  // prefetch={false}
                  className={`${styles.navbarItem} ${activeMenuTab === "PreApproval" ? styles.active : ""} `}
                  onClick={() => setActiveMenuTab("PreApproval")}
                >
                  <div
                    className={`${styles.navbarItemInner} cursor-not-allowed`}
                    data-text="開発・準備中..."
                    onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                    onMouseLeave={handleCloseTooltip}
                  >
                    <span>
                      {language === "ja" && "事前承認"}
                      {language === "en" && "PreApproval"}
                    </span>
                    {/* {!isLT1440 && (
                    <span>
                      {language === "ja" && "事前承認"}
                      {language === "en" && "PreApproval"}
                    </span>
                  )}
                  {isLT1440 && (
                    <span>
                      <BsCheck2Circle className={`text-[18px]`} />
                    </span>
                  )} */}
                  </div>
                  <div className={`${styles.active_underline}`} />
                </div>
              </li>
              <li className={`${styles.navList2}`}>
                <div
                  // href="/home"
                  // prefetch={false}
                  className={`${styles.navbarItem} ${activeMenuTab === "Supporter" ? styles.active : ""} `}
                  // onClick={() => setActiveMenuTab("Supporter")}
                >
                  <div
                    className={`${styles.navbarItemInner} cursor-not-allowed`}
                    data-text="プレミアム専用スペースです"
                    onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                    onMouseLeave={handleCloseTooltip}
                  >
                    <span>
                      {language === "ja" && "プレミアム"}
                      {language === "en" && "Premium"}
                    </span>
                    {/* {!isLT1440 && (
                    <span>
                      {language === "ja" && "プレミアム"}
                      {language === "en" && "Premium"}
                    </span>
                  )}
                  {isLT1440 && (
                    <span>
                      <GrHomeRounded className={`text-[16px]`} />
                    </span>
                  )} */}
                  </div>
                  <div className={`${styles.active_underline}`} />
                </div>
              </li>
            </ul>
          </nav>
          {/* ============================= ２列目ナビゲーションタブ ここまで ============================= */}
        </div>
      )}

      {/* 右矢印 */}
      {tabPage !== 2 && activeMenuTab !== "SDB" && (
        <div
          className={`flex-center absolute right-[calc(32px+165px-8px)] z-50 h-[35px] w-[35px] cursor-pointer rounded-full hover:bg-[var(--color-btn-brand-f05)] `}
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
      {/* {tabPage !== 2 && (
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
      )} */}

      {/* ============================= 右側のコンテンツ ============================= */}
      <div
        className={`flex h-[40px] flex-row-reverse items-center justify-start ${
          activeMenuTab !== "SDB" ? `w-[165px]` : ``
        }`}
      >
        {/* ヘッダータブ左スクロール時に連続でツールチップが表示されないようにするためのオーバーレイ */}

        {activeMenuTab !== "SDB" && (
          <div
            className={`${
              activeMenuTab !== "HOME" && activeMenuTab !== "SDB" ? `transition-bg01` : `transition-bg05`
            } absolute right-[185px] top-0 z-30 h-full w-[39px]  ${styles.arrow_overlay} ${
              activeMenuTab !== "SDB" ? `bg-[var(--color-bg-base)]` : ``
            }`}
          ></div>
        )}

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
              // className={`flex-center h-[38px] w-[38px] cursor-pointer rounded-full bg-[var(--color-bg-brand-sub)] text-[#fff] hover:bg-[var(--color-bg-brand-sub-hover)] ${styles.tooltip}`}
              className={`flex-center bg-brand-gradient-light h-[38px] w-[38px] cursor-pointer rounded-full text-[#fff] hover:bg-[var(--color-bg-brand-sub-hover)] ${styles.tooltip}`}
              onMouseEnter={(e) => handleOpenTooltip(e, "center", "center", "nowrap")}
              onMouseLeave={handleCloseTooltip}
              onClick={() => setOpenProfileMenu(true)}
            >
              <div className="flex-center h-[34px] w-[34px] rounded-full bg-[var(--color-bg-base)]">
                <div className="flex-center relative h-[31px] w-[31px] rounded-full bg-[var(--color-bg-brand-sub)]">
                  <div className="absolute left-0 top-0 z-[10] h-full w-full rounded-full hover:bg-[#00000020]" />
                  <span className={`pointer-events-none text-[16px]`}>
                    {userProfileState?.profile_name
                      ? getInitial(userProfileState.profile_name)
                      : `${getInitial("NoName")}`}
                  </span>
                </div>
              </div>
            </div>
          )}
          {avatarUrl && (
            <div
              data-text={`${userProfileState?.profile_name}`}
              // className={`flex-center h-[37px] w-[37px] cursor-pointer overflow-hidden rounded-full hover:bg-[#00000020]`}
              // className={`flex-center h-[38px] w-[38px] cursor-pointer rounded-full bg-[var(--color-bg-brand-sub)] `}
              className={`flex-center bg-brand-gradient-light h-[38px] w-[38px] cursor-pointer rounded-full `}
              onMouseEnter={(e) => handleOpenTooltip(e, "center", "center", "nowrap")}
              onMouseLeave={handleCloseTooltip}
              onClick={() => setOpenProfileMenu(true)}
            >
              <div className="flex-center h-[34px] w-[34px] rounded-full bg-[var(--color-bg-base)]">
                <div className="flex-center relative h-[31px] w-[31px] overflow-hidden rounded-full">
                  <div className="absolute left-0 top-0 z-[10] h-full w-full rounded-full hover:bg-[#00000020]" />
                  <Image
                    src={avatarUrl}
                    alt="Avatar"
                    className={`pointer-events-none h-full w-full object-cover text-[#fff]`}
                    width={75}
                    height={75}
                  />
                </div>
              </div>
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
                className={`shadow-all-md border-real-with-shadow absolute right-[0px] top-[50px] z-[100] flex h-auto min-w-[276px] max-w-[276px] flex-col rounded-[4px] bg-[var(--color-edit-bg-solid)]`}
              >
                {/* プロフィール情報エリア */}
                <div className={`relative flex h-auto w-full px-[24px] py-[16px]`}>
                  {/* 背景色 */}
                  {/* <div className="absolute left-0 top-0 z-[-1] h-[100%] w-full bg-[#0066ff80]"></div> */}
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
                        <span className={`pointer-events-none text-[24px]`}>
                          {userProfileState?.profile_name
                            ? getInitial(userProfileState.profile_name)
                            : `${getInitial("NoName")}`}
                        </span>
                      </div>
                    )}
                    {avatarUrl && (
                      <div
                        data-text={`${userProfileState?.profile_name}`}
                        className={`flex-center relative z-0 h-[58px] min-h-[58px] w-[58px] min-w-[58px] cursor-pointer overflow-hidden rounded-full hover:bg-[#00000020]`}
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
                        <Image
                          src={avatarUrl}
                          alt="Avatar"
                          className={`pointer-events-none h-full w-full object-cover text-[#fff]`}
                          width={58}
                          height={58}
                        />
                        {/* <ImageLegacy
                          src={avatarUrl}
                          alt="Avatar"
                          className={`pointer-events-none h-full w-full object-cover text-[#fff]`}
                          layout="fill"
                          objectFit="cover"
                        /> */}
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
                    <span className="truncate text-[13px] text-[var(--color-text-sub)]">{userProfileState?.email}</span>
                  </div>
                </div>

                <hr className="min-h-[1px] w-full bg-[var(--color-border-base)]" />

                {/* テーマ・アカウント設定エリア */}
                <div className="flex w-full flex-col">
                  <ul className={`flex flex-col pb-[8px] text-[13px] text-[var(--color-text-title)]`}>
                    <li
                      className={`relative flex h-[40px] w-full items-center px-[18px] py-[6px] pr-[18px] hover:bg-[var(--color-dropdown-list-hover)] hover:text-[var(--color-dropdown-list-hover-text)] hover:underline`}
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
                      <CgDarkMode className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                      <span className="select-none">テーマ</span>
                      {/* ドロップダウンサイドメニュー ここから */}
                      {hoveredThemeMenu && (
                        <ul
                          className={`shadow-all-md border-real absolute -left-[calc(150px)] top-0 flex min-h-[40px] min-w-[150px] flex-col overflow-hidden rounded-bl-[4px] rounded-tl-[4px] bg-[var(--color-edit-bg-solid)]`}
                        >
                          <li
                            className="flex min-h-[40px] w-full cursor-pointer items-center justify-between px-[18px] hover:bg-[var(--color-dropdown-list-hover)]  hover:text-[var(--color-dropdown-list-hover-text)] hover:underline"
                            onClick={() => setTheme("light")}
                          >
                            <span className="select-none">ライト</span>
                            {theme === "light" && (
                              <BsCheck2 className="min-h-[16px] min-w-[16px] stroke-[0.5] text-[16px]" />
                            )}
                          </li>
                          <li
                            className="flex min-h-[40px] w-full cursor-pointer items-center justify-between px-[18px] hover:bg-[var(--color-dropdown-list-hover)] hover:text-[var(--color-dropdown-list-hover-text)] hover:underline"
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
                      className={`flex h-[40px] w-full cursor-pointer items-center px-[18px] py-[6px] pr-[18px] hover:bg-[var(--color-dropdown-list-hover)] hover:text-[var(--color-dropdown-list-hover-text)] hover:underline`}
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
                      className={`flex h-[40px] w-full cursor-pointer items-center px-[18px] py-[6px] hover:bg-[var(--color-dropdown-list-hover)] hover:text-[var(--color-dropdown-list-hover-text)] hover:underline`}
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
            className={`flex-center h-full w-full cursor-pointer rounded-full hover:bg-[var(--color-bg-sub-re)] ${
              styles.icon_btn
            } ${activeMenuTab === "SDB" ? `${styles.sdb}` : ``}`}
            onMouseEnter={(e) => handleOpenTooltip(e, "center")}
            onMouseLeave={handleCloseTooltip}
            onClick={() => {
              setLoadingGlobalState(false);
              setIsOpenSettingAccountModal(true);
              setSelectedSettingAccountMenu("Profile");
            }}
          >
            <IoSettingsOutline className={`text-[24px] text-[var(--color-icon-header)] ${styles.sdb_icon}`} />
            {/* <div>{neonIconsSettingsGear("32")}</div> */}
          </div>
        </div>
        {/* 右から３番目 ベル */}
        <div className="flex-center relative mr-[8px] h-full w-[40px]">
          <div
            data-text="お知らせ"
            className={`flex-center h-full w-full cursor-pointer rounded-full hover:bg-[var(--color-bg-sub-re)] ${
              styles.icon_btn
            } ${activeMenuTab === "SDB" ? `${styles.sdb}` : ``} ${
              openNotificationModal ? `bg-[var(--color-bg-sub-re)]` : ``
            }`}
            onClick={() => setOpenNotificationModal(true)}
            onMouseEnter={(e) => {
              if (infoIconNoticeRef.current && infoIconNoticeRef.current.classList.contains("animate_ping")) {
                infoIconNoticeRef.current.classList.remove("animate_ping");
              }
              handleOpenTooltip(e, "center");
            }}
            onMouseLeave={(e) => {
              handleCloseTooltip();
            }}
          >
            <AiOutlineBell
              // className={`text-[24px] text-[var(--color-icon)] ${styles.sdb_icon}`}
              className={`text-[24px] text-[var(--color-icon-header)] ${styles.sdb_icon}`}
            />
            {/* 通知アイコン */}
            {/* {!!notificationsCacheData?.length && */}
            {/* {!!incompleteNotifications?.length &&
              incompleteNotifications.some((notice) => notice.already_read === false) && (
                <div className={`${styles.notice_outer} flex-center transition-base`}>
                  <div className={`${styles.notice_inner} transition-base`}></div>
                </div>
              )} */}

            {!!incompleteNotifications?.length &&
              incompleteNotifications.some((notice) => notice.already_read === false) && (
                <div className={`${styles.notice_outer} flex-center transition-base`}>
                  <div
                    ref={infoIconNoticeRef}
                    className={`flex-center animate_ping absolute left-[2px] top-[2px] h-[8px] w-[8px] rounded-full border-[1px] border-solid border-[var(--color-red-tk)]`}
                  ></div>
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
                className="shadow-all-md-dark  absolute right-[0px] top-[50px] z-[100] flex min-h-[560px] min-w-[400px] max-w-[400px] flex-col overflow-hidden rounded-[8px] bg-[var(--color-edit-bg-solid)]"
                // ref={modalContainerRef}
              >
                {/* {hoveredItemPosModal && <TooltipModal />} */}
                <div
                  className={`flex min-h-[72px] items-center justify-between p-[16px] text-[var(--color-text-title)]`}
                >
                  <h4 className="select-none text-[18px] font-bold">アクティビティ</h4>
                  {/* {activeNotificationTab === "ToDo" && (
                    <button
                      className={`transition-base01 min-h-[40px] rounded-[6px] px-[12px] text-[13px] font-bold hover:bg-[var(--color-bg-sub-re)] `}
                      onClick={handleAllCheckToDoCard}
                    >
                      <span>すべて完了済みとしてマーク</span>
                    </button>
                  )} */}
                  {activeNotificationTab === "ToDo" && (
                    <button
                      className={`transition-base03 flex min-h-[40px] items-center space-x-1 rounded-[6px] border border-solid border-transparent px-[12px] text-[13px] font-bold text-[var(--color-text-brand-f)] hover:border-[var(--color-bg-brand-f)] hover:bg-[var(--color-bg-sub-re)]`}
                      onClick={async () => {
                        console.log("リフレッシュ クリック");
                        setRefetchLoading(true);
                        await queryClient.invalidateQueries({ queryKey: ["my_notifications"] });
                        setRefetchLoading(false);
                      }}
                    >
                      {refetchLoading && (
                        <div className="relative">
                          <div className="mr-[2px] h-[12px] w-[12px]"></div>
                          <SpinnerIDS2 fontSize={20} width={20} height={20} />
                        </div>
                      )}
                      {!refetchLoading && (
                        <div className="flex-center mr-[2px]">
                          <FiRefreshCw />
                        </div>
                      )}
                      <span className="whitespace-nowrap">リフレッシュ</span>
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
                    className={`transition-base flex h-auto w-[800px] ${
                      activeNotificationTab === "ToDo" ? `ml-0 opacity-100` : `-ml-[400px] opacity-100`
                    }`}
                  >
                    {/* お知らせコンテンツエリア 左側ToDo */}
                    <div className="flex h-auto max-h-[450px] w-[400px] flex-col overflow-y-scroll">
                      {/* お知らせカード ToDo */}
                      {!!incompleteNotifications.length &&
                        incompleteNotifications.map((notification, index) => (
                          <div
                            key={notification.id}
                            // className={`flex min-h-[96px] max-w-[400px] ${
                            className={`flex min-h-[112px] max-w-[400px] ${
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
                                        handleCheckToDoCard(notification);
                                      }}
                                      className={`${styles.grid_select_cell_header_input}`}
                                    />
                                    <svg viewBox="0 0 18 18" fill="white" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                              {/* アバター画像・コンテンツテキストエリア クリックエリア */}
                              <div
                                className="group flex h-auto w-full cursor-pointer"
                                onClick={() => handleClickedNotificationCard(notification, index)}
                              >
                                {/* アバター画像エリア */}
                                <div className={`mr-[16px] mt-[2px] flex min-h-[48px] min-w-[48px] justify-center`}>
                                  {!notification.from_user_avatar_url && (
                                    <div
                                      data-text={`${userProfileState?.profile_name}`}
                                      className={`flex-center h-[48px] w-[48px] cursor-pointer rounded-full bg-[var(--color-bg-brand-sub)] text-[#fff] hover:bg-[var(--color-bg-brand-sub-hover)] ${styles.tooltip}`}
                                    >
                                      {/* <span>K</span> */}
                                      <span className={`pointer-events-none text-[22px]`}>
                                        {notification?.from_user_name
                                          ? getInitial(notification.from_user_name)
                                          : `${getInitial("未設定")}`}
                                      </span>
                                    </div>
                                  )}
                                  {notification.from_user_avatar_url && (
                                    <div
                                      // data-text={`${userProfileState?.profile_name}`}
                                      className={`flex-center h-[48px] w-[48px] cursor-pointer overflow-hidden rounded-full hover:bg-[#00000020]`}
                                    >
                                      <Image
                                        src={notification.from_user_avatar_url}
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
                                  <div className={`text-[13px] group-hover:underline`}>
                                    {notification.type === "change_team_owner" && (
                                      <NotificationTextChangeTeamOwner
                                        from_user_name={notification.from_user_name}
                                        from_user_email={notification.from_user_email}
                                        team_name={notification.from_company_name}
                                      />
                                    )}
                                  </div>
                                  {/* 時間とNewマーク */}
                                  <div className="flex items-center text-[12px]">
                                    <span className="pl-[0px] pt-[4px]">
                                      {/* {format(new Date(notification.created_at), "yyyy-MM-dd HH:mm")} */}
                                      {format(new Date(notification.created_at), "yyyy年MM月dd日 HH:mm")}
                                    </span>
                                    {/* <span className="pl-[0px] pt-[4px]">昨日、15:26</span> */}
                                    <div className="pl-[8px] pt-[4px]">
                                      {notification.already_read === false && (
                                        <div className="min-h-[20px] rounded-full bg-[var(--color-red-tk)] px-[10px] text-[#fff]">
                                          <span className="">New</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      {/* <NotificationCardTest
                        activeNotificationTab={activeNotificationTab}
                        avatarUrl={avatarUrl}
                        getInitial={getInitial}
                        handleCloseTooltipModal={handleCloseTooltipModal}
                        handleOpenTooltipModal={handleOpenTooltipModal}
                      /> */}
                      {/* お知らせカード ここまで */}
                      {/* お知らせカード無しの場合のイラスト画像を表示 */}
                      {incompleteNotifications.length === 0 && completedNotifications.length !== 0 && (
                        <div
                          className={`relative flex h-full min-h-[450px] max-w-[400px] flex-col items-center justify-center ${
                            activeNotificationTab === "ToDo"
                              ? `transition-base-opacity1 opacity-100`
                              : `transition-base-opacity04 opacity-0`
                          }`}
                        >
                          <div className="absolute left-[50%] top-[35%] -z-10 h-[250px] w-[250px] translate-x-[-50%] translate-y-[-50%] rounded-full bg-[var(--color-bg-brand-f90)]"></div>
                          <div className="z-10 mb-[10px] mt-[-60px]">{coffeeWithFriendsIllustration}</div>
                          <div className={`flex-center z-0 max-w-[300px] text-[14px] text-[var(--color-text-title)]`}>
                            <p className="w-full text-center">
                              すべて完了しました。空き時間をお楽しみください。おつかれさまでした！
                            </p>
                          </div>
                        </div>
                      )}
                      {incompleteNotifications.length === 0 && completedNotifications.length === 0 && (
                        <div
                          className={`relative flex h-full min-h-[450px] max-w-[400px] flex-col items-center justify-center ${
                            activeNotificationTab === "ToDo"
                              ? `transition-base-opacity1 opacity-100`
                              : `transition-base-opacity04 opacity-0`
                          }`}
                        >
                          <div className="absolute left-[50%] top-[39%] -z-10 h-[250px] w-[250px] translate-x-[-50%] translate-y-[-50%] rounded-full bg-[var(--color-bg-brand-f90)]"></div>
                          <div className="z-10 mb-[20px] mt-[-50px]">{completedTasks}</div>
                          <div className={`flex-center z-0 max-w-[300px] text-[14px] text-[var(--color-text-title)]`}>
                            <p className="w-full text-center">ここには、通知やタスクが表示されます。</p>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* お知らせコンテンツエリア 右側完了済み */}
                    <div className="flex h-auto max-h-[450px] w-[400px] flex-col overflow-y-scroll">
                      {/* 完了済みお知らせカード */}
                      {!!completedNotifications.length &&
                        completedNotifications.map((notification) => (
                          <div
                            key={notification.id}
                            // className={`flex min-h-[96px] max-w-[400px]  ${
                            className={`flex min-h-[112px] max-w-[400px]  ${
                              activeNotificationTab === "Completed"
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
                                    data-text="ToDoに戻す"
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
                                      checked={notification.completed ?? false}
                                      readOnly
                                      // defaultChecked
                                      // onChange={() => setChecked(!checked)}
                                      onClick={() => {
                                        if (notification.result !== "pending")
                                          return alert("タスクの処理が完了しているため、ToDoに戻せません");
                                        handleUncheckCompletedCard(notification);
                                      }}
                                      className={`${styles.grid_select_cell_header_input}`}
                                    />
                                    <svg viewBox="0 0 18 18" fill="white" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                              {/* アバター画像・コンテンツテキストエリア クリックエリア */}
                              <div
                                className="group flex h-auto w-full cursor-pointer"
                                onClick={() => console.log("コンテンツクリック")}
                              >
                                {/* アバター画像エリア */}
                                <div
                                  className={`mr-[16px] mt-[2px] flex min-h-[48px] min-w-[48px] cursor-pointer justify-center`}
                                >
                                  {!notification.from_user_avatar_url && (
                                    <div
                                      data-text={`${userProfileState?.profile_name}`}
                                      className={`flex-center h-[48px] w-[48px] cursor-pointer rounded-full bg-[var(--color-bg-brand-sub)] text-[#fff] hover:bg-[var(--color-bg-brand-sub-hover)] ${styles.tooltip}`}
                                    >
                                      {/* <span>K</span> */}
                                      <span className={`pointer-events-none text-[22px]`}>
                                        {notification?.from_user_name
                                          ? getInitial(notification.from_user_name)
                                          : `${getInitial("未設定")}`}
                                      </span>
                                    </div>
                                  )}
                                  {notification.from_user_avatar_url && (
                                    <div
                                      // data-text={`${userProfileState?.profile_name}`}
                                      className={`flex-center h-[48px] w-[48px] overflow-hidden rounded-full hover:bg-[#00000020]`}
                                    >
                                      <Image
                                        src={notification.from_user_avatar_url}
                                        alt="Avatar"
                                        className={`pointer-events-none h-full w-full object-cover text-[#fff]`}
                                        width={75}
                                        height={75}
                                      />
                                    </div>
                                  )}
                                </div>
                                {/* コンテンツエリア */}
                                <div className={`mr-[16px] flex h-auto w-full flex-col text-[var(--color-text-sub)]`}>
                                  {/* テキストコンテンツ */}
                                  <div
                                    className={`text-[13px] ${notification.result !== "pending" ? `line-through` : ``}`}
                                  >
                                    {notification.type === "change_team_owner" && (
                                      <NotificationTextChangeTeamOwner
                                        from_user_name={notification.from_user_name}
                                        from_user_email={notification.from_user_email}
                                        team_name={notification.from_company_name}
                                      />
                                    )}
                                  </div>
                                  {/* 時間とNewマーク */}
                                  <div className="flex items-center text-[12px]">
                                    <span className="pl-[0px] pt-[4px]">
                                      {format(new Date(notification.created_at), "yyyy年MM月dd日 HH:mm")}
                                    </span>
                                    <div className="pl-[8px] pt-[4px]">
                                      {/* {notification.already_read === false && (
                                      <div className="min-h-[20px] rounded-full bg-[var(--color-red-tk)] px-[10px] text-[#fff]">
                                        <span>New</span>
                                      </div>
                                    )} */}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      {/* <NotificationCardTest
                        activeNotificationTab={activeNotificationTab}
                        avatarUrl={avatarUrl}
                        getInitial={getInitial}
                        handleCloseTooltipModal={handleCloseTooltipModal}
                        handleOpenTooltipModal={handleOpenTooltipModal}
                      />
                      <NotificationCardTest
                        activeNotificationTab={activeNotificationTab}
                        avatarUrl={avatarUrl}
                        getInitial={getInitial}
                        handleCloseTooltipModal={handleCloseTooltipModal}
                        handleOpenTooltipModal={handleOpenTooltipModal}
                      /> */}
                      {/* お知らせカード無しの場合のイラスト画像を表示 */}
                      {completedNotifications.length === 0 && (
                        <div
                          className={`relative flex h-full min-h-[450px] max-w-[400px] flex-col items-center justify-center ${
                            activeNotificationTab === "Completed"
                              ? `transition-base-opacity1 opacity-100`
                              : `transition-base-opacity04 opacity-0`
                          }`}
                        >
                          <div className="absolute left-[50%] top-[38%] -z-10 h-[250px] w-[250px] translate-x-[-50%] translate-y-[-50%] rounded-full bg-[var(--color-bg-brand-f90)]"></div>
                          <div className="z-10 mb-[40px] mt-[-50px]">{reminderIllustration}</div>
                          <div className={`flex-center z-0 max-w-[300px] text-[14px] text-[var(--color-text-title)]`}>
                            <p className="w-full text-center">完了したタスクはこちらに表示されます。</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          {/* ==================== お知らせポップアップ ここまで ==================== */}
        </div>
        {/* SDB時のみ表示アイコン */}
        {activeMenuTab === "SDB" && (
          <div className="flex-center mr-[8px] h-full w-[40px]">
            <div
              data-text="各種設定メニュー"
              className={`flex-center h-full w-full cursor-pointer rounded-full hover:bg-[var(--color-bg-sub-re)] ${
                styles.icon_btn
              } ${activeMenuTab === "SDB" ? `${styles.sdb}` : ``}`}
              onMouseEnter={(e) => handleOpenTooltip(e, "center")}
              onMouseLeave={handleCloseTooltip}
              onClick={() => {
                setIsOpenSettingsSDB(true);
                if (hoveredItemPos) handleCloseTooltip();
                if (openPopupMenu) handleClosePopupMenu();
              }}
              // onClick={() => {
              //   setLoadingGlobalState(false);
              //   setIsOpenSettingAccountModal(true);
              //   setSelectedSettingAccountMenu("Profile");
              // }}
            >
              <LuSettings2 className={`text-[23px] text-[var(--color-icon-header)] ${styles.sdb_icon}`} />
            </div>
          </div>
        )}
        {/* SDB時のみ表示アイコン ここまで */}
      </div>
      {/* ============================= 右側のコンテンツ ここまで ============================= */}
      {/* ---------------------- SDBセッティングメニュー ---------------------- */}
      {isOpenSettingsSDB && <div className={`${styles.menu_overlay}`} onClick={handleCloseSettings}></div>}
      {isOpenSettingsSDB && (
        <div className={`${styles.settings_menu} fixed right-[185px] top-[56px] h-auto w-[330px] rounded-[6px]`}>
          <h3 className={`w-full px-[20px] pt-[20px] text-[15px] font-bold`}>
            <div className="flex max-w-max flex-col">
              <span>各種設定メニュー</span>
              <div className={`${styles.section_underline} w-full`} />
            </div>
          </h3>

          <p className={`w-full px-[20px] pb-[12px] pt-[10px] text-[11px]`}>
            背景色などのテーマカラーの変更が可能です。
          </p>

          <hr className="min-h-[1px] w-full bg-[#999]" />

          {/* -------- メニューコンテンツエリア -------- */}
          <div className={`${styles.scroll_container} flex max-h-[240px] w-full flex-col overflow-y-auto`}>
            <ul className={`flex h-full w-full flex-col`}>
              {/* ------------------------------------ */}
              <li
                className={`${styles.list}`}
                onClick={(e) => {
                  if (isOpenPopupOverlay) return;
                  if (!openPopupMenu) {
                    handleOpenPopupMenu({ e, title: "change_theme", displayX: "left", maxWidth: 360 });
                    setIsOpenPopupOverlay(true);
                  } else {
                    handleClosePopupMenu();
                    setIsOpenPopupOverlay(false);
                  }
                }}
                // onMouseEnter={(e) => {}}
                // onMouseLeave={handleClosePopupMenu}
              >
                <div className="pointer-events-none flex min-w-[110px] items-center">
                  <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                  <div className="flex select-none items-center space-x-[2px]">
                    <span className={`${styles.list_title}`}>テーマカラー</span>
                    <span className={``}>：</span>
                  </div>
                </div>
                <div className={`transition-bg02 rounded-[8px] ${styles.edit_btn} ${styles.brand}`}>
                  <span>変更</span>
                </div>
              </li>
              {/* ------------------------------------ */}
            </ul>
          </div>
        </div>
      )}
      {/* ---------------------- SDBセッティングメニュー ここまで ---------------------- */}
      {/* ---------------------- 説明ポップアップ ---------------------- */}
      {/* クリック時のオーバーレイ */}
      {isOpenPopupOverlay && (
        <div
          className={`${styles.menu_overlay} ${styles.above_setting_menu} bg-[#ffffff00]`}
          onClick={handleCloseClickPopup}
        ></div>
      )}
      {/* 説明ポップアップ */}
      {openPopupMenu && (
        <div
          // className={`${styles.description_menu} shadow-all-md border-real-with-shadow fixed right-[-18px] z-[3500] flex min-h-max flex-col rounded-[6px]`}
          className={`${styles.description_menu} shadow-all-md border-real-with-shadow ${
            isOpenPopupOverlay ? `` : `pointer-events-none`
          } fixed z-[3500] flex min-h-max flex-col rounded-[6px]`}
          style={{
            top: `${openPopupMenu.y}px`,
            ...(openPopupMenu?.displayX === "right" && {
              left: `${openPopupMenu.x}px`,
              maxWidth: `${openPopupMenu.maxWidth}px`,
            }),
            ...(openPopupMenu?.displayX === "left" && {
              right: `${openPopupMenu.x}px`,
              maxWidth: `${openPopupMenu.maxWidth}px`,
            }),
          }}
        >
          <div className={`min-h-max w-full font-bold ${styles.title}`}>
            <div className="flex max-w-max flex-col">
              <span>{mappingPopupTitle[openPopupMenu.title][language]}</span>
              <div className={`${styles.underline} w-full`} />
            </div>
          </div>

          {openPopupMenu.title !== "change_theme" && (
            <ul className={`flex flex-col rounded-[6px] ${styles.u_list}`}>
              {["guide"].includes(openPopupMenu.title) &&
                mappingDescriptionsSDB[openPopupMenu.title].map((item, index) => (
                  <li
                    key={item.title + index.toString()}
                    className={`${styles.dropdown_list_item} flex  w-full cursor-pointer flex-col space-y-1 `}
                    style={{ ...(openPopupMenu.title === "printTips" && { padding: "3px 14px" }) }}
                  >
                    <div className="flex min-w-max items-center space-x-[3px]">
                      <RxDot className={`min-h-[16px] min-w-[16px] text-[var(--color-bg-brand-f)]`} />
                      <span className={`${styles.dropdown_list_item_title} select-none text-[14px] font-bold`}>
                        {item.title}
                      </span>
                    </div>
                    <p className="select-none text-[12px]" style={{ whiteSpace: "pre-wrap" }}>
                      {item.content}
                    </p>
                  </li>
                ))}
              {!["guide"].includes(openPopupMenu.title) && (
                <li className={`${styles.dropdown_list_item} flex  w-full cursor-pointer flex-col space-y-1 `}>
                  <p className="select-none whitespace-pre-wrap text-[12px]">
                    {openPopupMenu.title === "edit_mode" &&
                      "定休日を適用後、個別に日付を「営業日から休日へ」または「休日から営業日へ」変更が可能です。"}
                    {openPopupMenu.title === "print" &&
                      "印刷ボタンクリック後に印刷ダイアログが開かれた後、「詳細設定」の「余白」を「なし」に切り替えることで綺麗に印刷ができます。また、「用紙サイズ」のそれぞれの選択肢については下記の通りです。"}
                  </p>
                </li>
              )}
            </ul>
          )}
          {openPopupMenu.title === "change_theme" && (
            <div className={`${styles.change_menu} flex w-full max-w-[280px] flex-col`}>
              <div className={`${styles.description_area} w-full px-[20px] pt-[12px] text-[12px]`}>
                <p>下記のカラーパレットからお好きなカラーを選択することでテーマカラーの変更が可能です。</p>
              </div>
              <div role="grid" className={`${styles.grid}`}>
                {optionsColorPalette.map((value, index) => {
                  const isActive = value === activeThemeColor;
                  return (
                    <Fragment key={value + "palette"}>
                      <div role="gridcell" className={`${styles.palette_cell} flex-center h-[66px]`}>
                        {isActive && (
                          <div
                            className={`${styles.active_color} flex-center h-[39px] w-[39px] rounded-full bg-[var(--main-color-tk)]`}
                          >
                            <div className={`${styles.space} flex-center h-[35px] w-[35px] rounded-full`}>
                              <div
                                className={`${styles.color_option} flex-center relative h-[31px] w-[31px] rounded-full bg-[var(--color-bg-brand-sub)]`}
                                style={{ background: `${mappingPaletteStyle[value]}` }}
                              >
                                {!isActive && (
                                  <div className="absolute left-0 top-0 z-[10] h-full w-full rounded-full hover:bg-[#00000020]" />
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        {!isActive && (
                          <div
                            className={`${styles.space_inactive} flex-center h-[39px] w-[39px] rounded-full`}
                            onClick={() => {
                              console.log("value", value, "activeThemeColor", activeThemeColor);
                              handleSwitchThemeColor(value);
                            }}
                          >
                            <div
                              className={`${styles.color_option} flex-center bg-brand-gradient-light h-[35px] w-[35px] rounded-full`}
                              style={{ background: `${mappingPaletteStyle[value]}` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </Fragment>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
      {/* ---------------------- 説明ポップアップ ここまで ---------------------- */}
    </header>
  );
};

export const DashboardHeader = memo(DashboardHeaderMemo);
