import useDashboardStore from "@/store/useDashboardStore";
import Image from "next/image";
import React, { Suspense, memo, useEffect, useRef, useState } from "react";
import styles from "./SettingCompany.module.css";
import { useDownloadUrl } from "@/hooks/useDownloadUrl";
import { useUploadAvatarImg } from "@/hooks/useUploadAvatarImg";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { toast } from "react-toastify";
import { Department, Notification, UserProfileCompanySubscription } from "@/types";
import { MdClose } from "react-icons/md";
import { teamIllustration } from "@/components/assets";
import { ChangeTeamOwnerModal } from "./ChangeTeamOwnerModal/ChangeTeamOwnerModal";
import { ErrorBoundary } from "react-error-boundary";
import { Fallback } from "@/components/Fallback/Fallback";
import { ErrorFallback } from "@/components/ErrorFallback/ErrorFallback";
import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import { HiOutlineSearch } from "react-icons/hi";
import { SkeletonLoading } from "@/components/Parts/SkeletonLoading/SkeletonLoading";
import { FallbackChangeOwner } from "./FallbackChangeOwner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import SpinnerIDS2 from "@/components/Parts/SpinnerIDS/SpinnerIDS2";
import { FiRefreshCw } from "react-icons/fi";
import { DatePickerCustomInputForSettings } from "@/utils/DatePicker/DatePickerCustomInputForSettings";
import { useQueryDepartments } from "@/hooks/useQueryDepartments";
import { useMutateDepartment } from "@/hooks/useMutateDepartment";
import { departmentTagIcons, departmentTagIconsTest } from "./data";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import SpinnerIDS3 from "@/components/Parts/SpinnerIDS/SpinnerIDS3";
import useStore from "@/store";
import { invertFalsyExcludeZero } from "@/utils/Helpers/invertFalsyExcludeZero";

const SettingCompanyMemo = () => {
  const language = useStore((state) => state.language);
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const setUserProfileState = useDashboardStore((state) => state.setUserProfileState);
  const selectedSettingAccountMenu = useDashboardStore((state) => state.selectedSettingAccountMenu);
  const setSelectedSettingAccountMenu = useDashboardStore((state) => state.setSelectedSettingAccountMenu);
  const loadingGlobalState = useDashboardStore((state) => state.loadingGlobalState);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  // Zustand会社所有者名
  const companyOwnerName = useDashboardStore((state) => state.companyOwnerName);
  const setCompanyOwnerName = useDashboardStore((state) => state.setCompanyOwnerName);
  //
  // チームの所有者の変更モーダル ページ数
  const [changeTeamOwnerStep, setChangeTeamOwnerStep] = useState<number | null>(null);

  // 名前編集モード
  const [editCompanyNameMode, setEditCompanyNameMode] = useState(false);
  const [editedCompanyName, setEditedCompanyName] = useState("");
  // 決算月
  const [editFiscalEndMonthMode, setEditFiscalEndMonthMode] = useState(false);
  // const [editedFiscalEndMonth, setEditedFiscalEndMonth] = useState("");
  const [editedFiscalEndMonth, setEditedFiscalEndMonth] = useState<Date | null>(null);
  const prevFiscalEndMonthRef = useRef<Date | null>(null);
  // 規模
  const [editNumberOfEmployeeClassMode, setEditNumberOfEmployeeClassMode] = useState(false);
  const [editedNumberOfEmployeeClass, setEditedNumberOfEmployeeClass] = useState("");
  // 事業部 追加・編集
  const [insertDepartmentMode, setInsertDepartmentMode] = useState(false);
  const [inputDepartmentName, setInputDepartmentName] = useState("");
  const [editDepartmentMode, setEditDepartmentMode] = useState(false);
  const [editedDepartment, setEditedDepartment] = useState<Omit<Department, "created_at"> | null>(null);
  const originalDepartmentNameRef = useRef<string | null>(null);
  const [activeDepartmentTagIndex, setActiveDepartmentTagIndex] = useState<number | null>(null);
  // ローディング
  const [refetchLoading, setRefetchLoading] = useState(false);

  const { useMutateUploadAvatarImg, useMutateDeleteAvatarImg } = useUploadAvatarImg();
  const { fullUrl: logoUrl, isLoading } = useDownloadUrl(userProfileState?.logo_url, "customer_company_logos");

  // キャッシュからお知らせを取得
  // const queryClient = useQueryClient();
  // const notificationsCacheData = queryClient.getQueryData<Notification[]>(["my_notifications"]);
  // const [changeOwnerNotificationState, setChangeOwnerNotificationState] = useState<Notification | null>(null);

  // ================================ 🌟事業部リスト取得useQuery🌟 ================================
  const {
    data: departmentDataArray,
    isLoading: isLoadingQueryDepartment,
    refetch,
  } = useQueryDepartments(userProfileState?.company_id);

  // useMutation
  const { createDepartmentMutation, updateDepartmentFieldMutation, deleteDepartmentMutation } = useMutateDepartment();
  // ================================ ✅事業部リスト取得useQuery✅ ================================

  // ================================ 🌟お知らせ所有権変更関連🌟 ================================
  // 【お知らせの所有者変更モーダル開閉状態】
  const setOpenNotificationChangeTeamOwnerModal = useDashboardStore(
    (state) => state.setOpenNotificationChangeTeamOwnerModal
  );
  // 所有者変更キャンセルモーダル開閉状態
  const [openCancelChangeTeamOwnerModal, setOpenCancelChangeTeamOwnerModal] = useState(false);
  const notificationDataState = useDashboardStore((state) => state.notificationDataState);
  const setNotificationDataState = useDashboardStore((state) => state.setNotificationDataState);

  // チーム所有者変更関連のお知らせを取得 useQuery用
  const getChangeTeamOwnerNotifications = async () => {
    if (userProfileState === null) return;
    try {
      const { data: notificationData, error } = await supabase
        .from("notifications")
        .select()
        .or(`to_user_id.eq.${userProfileState.id},from_user_id.eq.${userProfileState.id}`)
        .eq("result", "pending")
        .eq("type", "change_team_owner")
        // .order("created_at", { ascending: true });
        .order("created_at", { ascending: false });

      if (error) {
        console.log("getMyNotificationsエラー発生", error.message);
        throw new Error(error.message);
      }

      return notificationData as Notification[] | [];
    } catch (error: any) {
      console.error(`notificationsテーブルのデータ取得に失敗しました。error${error.message}`);
      return [];
    }
  };

  const {
    data: changeTeamOwnerData,
    error: changeTeamOwnerError,
    isLoading: changeTeamOwnerIsLoading,
  } = useQuery({
    queryKey: ["change_team_owner_notifications"],
    queryFn: getChangeTeamOwnerNotifications,
    staleTime: Infinity,
    onError: (error: any) => {
      alert(error.message);
      console.error("useQueryNotificationsカスタムフック error:", error);
    },
    enabled: !!userProfileState?.id,
  });

  console.log(
    "チーム所有権関連useQuery",
    "changeTeamOwnerData",
    changeTeamOwnerData,
    "changeTeamOwnerIsLoading",
    changeTeamOwnerIsLoading,
    "notificationDataState",
    notificationDataState
  );

  // 会社所有者を取得 + 所有権変更の通知を取得
  useEffect(() => {
    if (!userProfileState || companyOwnerName) return;
    const getCompanyOwner = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("profile_name")
          .eq("id", userProfileState.subscription_subscriber_id)
          .single();
        if (error) throw new Error(error.message);
        console.log("会社所有者データ", data);
        setCompanyOwnerName(data.profile_name);
      } catch (e: any) {
        console.error(`会社所有者データ取得エラー: ${e.message}`);
      }
    };

    getCompanyOwner();
  }, [userProfileState]);

  useEffect(() => {
    // お知らせから所有者変更のお知らせが自分宛、もしくは所有権を自分からメンバーへ移行している物があればStateに格納
    const checkNoticeRelatedToMe = () => {
      if (typeof changeTeamOwnerData === "undefined" || changeTeamOwnerData.length === 0) {
        setNotificationDataState(null);
        return console.log("自分のお知らせ無し");
      }
      if (!userProfileState) return console.log("自身のプロフィールデータなし");

      const onHoldIndex = changeTeamOwnerData.findIndex(
        (value) => value.from_user_id === userProfileState.id && value.completed === false && value.result === "pending"
      );
      const needConfirmationIndex = changeTeamOwnerData.findIndex(
        (value) => value.to_user_id === userProfileState.id && value.completed === false && value.result === "pending"
      );

      if (onHoldIndex !== -1 && needConfirmationIndex === -1) {
        const onHoldData = changeTeamOwnerData[onHoldIndex];
        console.log("保留中のお知らせデータを格納 onHoldData", onHoldData);
        // setChangeOwnerNotificationState(onHoldData);
        setNotificationDataState(onHoldData);
      } else if (onHoldIndex === -1 && needConfirmationIndex !== -1) {
        const needConfirmedData = changeTeamOwnerData[needConfirmationIndex];
        console.log("要確認のお知らせデータを格納 needConfirmData", needConfirmedData);
        // setChangeOwnerNotificationState(needConfirmedData);
        setNotificationDataState(needConfirmedData);
      } else {
        // setChangeOwnerNotificationState(null);
        setNotificationDataState(null);
      }
    };

    checkNoticeRelatedToMe();
  }, [changeTeamOwnerData]);

  const toHalfWidthAndSpace = (strVal: string) => {
    // 全角文字コードの範囲は65281 - 65374、スペースの全角文字コードは12288
    return strVal
      .replace(/[！-～]/g, (match) => {
        return String.fromCharCode(match.charCodeAt(0) - 0xfee0);
      })
      .replace(/　/g, " "); // 全角スペースを半角スペースに
  };

  // 全角を半角に変換する関数
  function zenkakuToHankaku(str: string) {
    const zen = ["０", "１", "２", "３", "４", "５", "６", "７", "８", "９"];
    const han = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

    for (let i = 0; i < zen.length; i++) {
      const regex = new RegExp(zen[i], "g");
      str = str.replace(regex, han[i]);
    }

    return str;
  }

  // 資本金 100万円の場合は100、18億9,190万円は189190、12,500,000円は1250、のように変換する方法
  function convertToNumber(inputString: string) {
    // 全角数字を半角に変換
    inputString = zenkakuToHankaku(inputString);

    // 「億」「万」「円」がすべて含まれていなければ変換をスキップ
    if (
      !inputString.includes("億") &&
      !inputString.includes("万") &&
      !inputString.includes("円") &&
      !inputString.includes(",")
    ) {
      return inputString;
    }

    // 億、万、円で分けてそれぞれの数値を取得
    const billion = (inputString.includes("億") ? parseInt(inputString.split("億")[0].replace(/,/g, ""), 10) : 0) || 0;
    const million =
      (inputString.includes("万") && !inputString.includes("億")
        ? parseInt(inputString.split("万")[0].replace(/,/g, ""), 10)
        : inputString.includes("億") && inputString.includes("万")
        ? parseInt(inputString.split("億")[1].split("万")[0].replace(/,/g, ""), 10)
        : 0) || 0;
    const thousand =
      (!inputString.includes("万") && !inputString.includes("億")
        ? Math.floor(parseInt(inputString.replace(/,/g, "").replace("円", ""), 10) / 10000)
        : 0) || 0;

    // 最終的な数値を計算
    const total = billion * 10000 + million + thousand;

    return total;
  }

  // 頭文字のみ抽出
  const getCompanyInitial = (companyName: string) => {
    // 特定の文字列を削除
    const cleanedName = companyName.replace("株式会社", "").replace("合同会社", "").replace("有限会社", "").trim(); // 余分な空白を削除

    return cleanedName[0]; // 頭文字を返す
  };

  // ================================ お知らせ チーム所有権 確認クリック
  const handleClickedChangeTeamOwnerConfirmation = async (notification: Notification) => {
    console.log(
      "確認クリック type",
      notification.type,
      "toユーザー名",
      notification.to_user_name,
      "fromユーザー名",
      notification.from_user_name,
      "既読",
      notification.already_read,
      "result",
      notification.result
    );
    // お知らせ お知らせモーダルが開かれたら未読を既読に変更する
    if (notification.already_read === false || notification.already_read_at === null) {
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
          // theme: `${theme === "light" ? "light" : "dark"}`,
        });
      }

      const updatedNotice: Notification = data[0];
      console.log("UPDATEしたお知らせ", updatedNotice);

      let previousNotificationsCacheData = queryClient.getQueryData<Notification[]>(["my_notifications"]);
      if (!previousNotificationsCacheData || typeof previousNotificationsCacheData === "undefined") {
        previousNotificationsCacheData = [];
      }

      // エラーが出なければ、React-Queryのキャッシュも最新状態に更新
      queryClient.setQueryData(
        ["my_notifications"],
        previousNotificationsCacheData.map((notice, index) =>
          notice.id === notification.id
            ? {
                ...(previousNotificationsCacheData as Notification[])[index],
                already_read: true,
                already_read_at: updatedNotice.already_read_at,
              }
            : notice
        )
      );
    }

    console.log("所有者変更モーダル オープン");
    setOpenNotificationChangeTeamOwnerModal(true);
    setNotificationDataState(notification);
  };

  const [loading, setLoading] = useState(false);
  // 任命を取り消す関数
  const handleCancelChangeTeamOwner = async (notification: Notification) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("notifications")
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          result: "canceled",
        })
        .eq("id", notification.id)
        .select();

      if (error) throw new Error(error.message);

      const updatedNotice: Notification = data[0];

      console.log("任命の取り消しに成功 updatedNotice", updatedNotice);
      // キャッシュを最新状態に反映
      await queryClient.invalidateQueries({ queryKey: ["change_team_owner_notifications"] });
      // await queryClient.invalidateQueries({ queryKey: ["my_notifications"] });

      // ZustandのnotificationDataStateをnullに更新する
      setNotificationDataState(null);

      toast.success("任命の取り消しに成功しました！", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        //   theme: `${theme === "light" ? "light" : "dark"}`,
      });
    } catch (error: any) {
      console.error("任命の取り消しに失敗 エラー発生", error.message);
      toast.error("任命の取り消しに失敗しました！", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        //   theme: `${theme === "light" ? "light" : "dark"}`,
      });
    }
    setLoading(false);
    setOpenCancelChangeTeamOwnerModal(false);
  };

  // ====================== 🌟事業部タグをボタンクリックで左右にスクロールする関数🌟 ======================
  const rowContainer = useRef<HTMLDivElement | null>(null);
  const rowRef = useRef<HTMLDivElement | null>(null);
  const arrowIconAreaLeft = useRef<HTMLDivElement | null>(null);
  const arrowIconAreaRight = useRef<HTMLDivElement | null>(null);
  const [isMoved, setIsMoved] = useState(false);

  // rowグループが親コンテナの横幅を超えてなければ、矢印エリアは非表示にする
  useEffect(() => {
    if (!rowContainer.current || !rowRef.current || !arrowIconAreaLeft.current || !arrowIconAreaRight.current) return;
    console.log(
      "横幅",
      // rowRef.current.clientWidth,
      rowRef.current.scrollWidth,
      rowContainer.current.clientWidth,
      // rowContainer.current.scrollWidth,
      rowRef.current.scrollWidth < rowContainer.current.clientWidth
      // rowRef.current.getBoundingClientRect().width,
      // rowContainer.current.getBoundingClientRect().width
    );
    console.log("left", rowRef.current.scrollLeft);
    if (rowRef.current.scrollWidth <= rowContainer.current.clientWidth) {
      console.log("🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥");
      rowContainer.current.classList.add(`${styles.inactive}`);
      arrowIconAreaLeft.current.style.opacity = "0";
      arrowIconAreaLeft.current.style.pointerEvents = "none";
      arrowIconAreaRight.current.style.opacity = "0";
      arrowIconAreaRight.current.style.pointerEvents = "none";
    } else if (rowRef.current.scrollWidth > rowContainer.current.clientWidth) {
      console.log("✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅");
      rowContainer.current.classList.remove(`${styles.inactive}`);
      let maxScrollableWidth = rowRef.current.scrollWidth - rowRef.current.clientWidth;
      if (rowRef.current.scrollLeft === 0) {
        console.log("✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅左端なら");
        // 左端なら
        arrowIconAreaRight.current.style.opacity = "1";
        arrowIconAreaRight.current.style.pointerEvents = "auto";
      } else if (rowRef.current.scrollLeft === maxScrollableWidth) {
        console.log("✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅右端なら");
        // 右端なら
        arrowIconAreaLeft.current.style.opacity = "1";
        arrowIconAreaLeft.current.style.pointerEvents = "auto";
      } else {
        console.log("✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅右端なら");
        // 真ん中なら
        arrowIconAreaRight.current.style.opacity = "1";
        arrowIconAreaRight.current.style.pointerEvents = "auto";
        arrowIconAreaLeft.current.style.opacity = "1";
        arrowIconAreaLeft.current.style.pointerEvents = "auto";
      }
    }
  }, [departmentDataArray, editDepartmentMode, insertDepartmentMode]);

  const handleClickScroll = (direction: string) => {
    if (rowRef.current) {
      setIsMoved(true);
      const { scrollLeft, clientWidth } = rowRef.current;
      console.log("scrollLeft", scrollLeft);
      let scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      rowRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });

      if (direction === "right" && arrowIconAreaLeft?.current) {
        arrowIconAreaLeft.current.style.opacity = "1";
        arrowIconAreaLeft.current.style.pointerEvents = "auto";
      }
      if (direction === "left" && arrowIconAreaRight?.current) {
        arrowIconAreaRight.current.style.opacity = "1";
        arrowIconAreaRight.current.style.pointerEvents = "auto";
      }
      setTimeout(() => {
        if (arrowIconAreaLeft.current && rowRef?.current && arrowIconAreaRight.current) {
          const { scrollLeft: scrollLeftAfterEnd } = rowRef.current;
          // 左アイコンエリア
          console.log("scrollLeftAfterEnd", scrollLeftAfterEnd);
          // arrowIconAreaLeft.current.style.display = scrollLeftAfterEnd > 0 ? "flex" : "none";
          arrowIconAreaLeft.current.style.opacity = scrollLeftAfterEnd > 0 ? "1" : "0";
          arrowIconAreaLeft.current.style.pointerEvents = scrollLeftAfterEnd > 0 ? "auto" : "none";
          // 右アイコンエリア
          let maxScrollableWidth = rowRef.current.scrollWidth - rowRef.current.clientWidth;
          // arrowIconAreaRight.current.style.display = maxScrollableWidth > scrollLeftAfterEnd + 0 ? "flex" : "none";
          arrowIconAreaRight.current.style.opacity = maxScrollableWidth > scrollLeftAfterEnd ? "1" : "0";
          arrowIconAreaRight.current.style.pointerEvents = maxScrollableWidth > scrollLeftAfterEnd ? "auto" : "none";
          setIsMoved(false);
        }
        // }, 500);
      }, 680);
    }
  };

  // console.log("left", rowRef?.current?.scrollLeft);
  // console.log("left", rowRef?.current?.scrollWidth - rowRef?.current?.clientWidth);
  // ====================== ✅事業部タグをボタンクリックで左右にスクロールする関数✅ ======================

  return (
    <>
      {/* 右側メインエリア 会社・チーム */}
      {selectedSettingAccountMenu === "Company" && (
        <div className={`flex h-full w-full flex-col overflow-y-scroll px-[20px] py-[20px] pr-[80px]`}>
          <div className={`text-[18px] font-bold text-[var(--color-text-title)]`}>会社・チーム</div>

          <div className={`mt-[30px] flex min-h-[120px] w-full flex-col `}>
            <div className={`${styles.section_title}`}>会社・チーム ロゴ</div>
            <div className={`flex h-full w-full items-center justify-between`}>
              <div className="">
                {!logoUrl && (
                  <label
                    data-text="ユーザー名"
                    htmlFor="avatar"
                    className={`flex-center h-[75px] w-[75px] cursor-pointer rounded-full bg-[var(--color-bg-brand-sub)] text-[#fff] hover:bg-[var(--color-bg-brand-sub-hover)] ${styles.tooltip} mr-[15px]`}
                    // onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                    // onMouseLeave={handleCloseTooltip}
                  >
                    {/* <span>K</span> */}
                    <span className={`text-[30px]`}>
                      {userProfileState?.customer_name
                        ? getCompanyInitial(userProfileState.customer_name)
                        : `${getCompanyInitial("NoName")}`}
                    </span>
                  </label>
                )}
                {logoUrl && (
                  <label
                    htmlFor="avatar"
                    className={`flex-center group relative h-[75px] w-[75px] cursor-pointer overflow-hidden rounded-full`}
                  >
                    <Image
                      src={logoUrl}
                      alt="Avatar"
                      className={`h-full w-full object-cover text-[#fff]`}
                      width={75}
                      height={75}
                    />
                    <div className={`transition-base01 absolute inset-0 z-10 group-hover:bg-[#00000060]`}></div>
                  </label>
                )}
              </div>
              <div className="flex">
                {logoUrl && (
                  <div
                    className={`transition-base01 mr-[10px] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    // onClick={async () => {
                    //   if (!userProfileState?.id) return alert("ユーザーIDが見つかりません");
                    //   if (!userProfileState?.avatar_url) return alert("プロフィール画像が見つかりません");
                    //   useMutateDeleteAvatarImg.mutate(userProfileState.avatar_url);
                    // }}
                  >
                    画像を削除
                  </div>
                )}

                <label htmlFor="avatar">
                  <div
                    className={`transition-base01 flex-center max-h-[41px] max-w-[120px] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      // setLoading(true);
                    }}
                  >
                    <span>画像を変更</span>
                    {/* {!loading && <span>画像を変更</span>}
                          {loading && <SpinnerIDS scale={"scale-[0.3]"} />} */}
                  </div>
                </label>
              </div>
              <input
                type="file"
                id="avatar"
                accept="image/*"
                className="hidden"
                // onChange={(e) => {
                //   useMutateUploadAvatarImg.mutate(e);
                // }}
              />
            </div>
          </div>

          <div className={`min-h-[1px] w-full bg-[var(--color-border-deep)]`}></div>

          {/* 会社名・チーム名 */}
          <div className={`mt-[20px] flex min-h-[95px] w-full flex-col`}>
            <div className={`${styles.section_title}`}>会社名・チーム名</div>
            {!editCompanyNameMode && (
              <div className={`flex h-full w-full items-center justify-between`}>
                <div className={`${styles.section_value}`}>
                  {userProfileState?.customer_name ? userProfileState.customer_name : "未設定"}
                </div>
                <div>
                  <div
                    className={`transition-base01 min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      setEditedCompanyName(userProfileState?.customer_name ? userProfileState.customer_name : "");
                      setEditCompanyNameMode(true);
                    }}
                  >
                    編集
                  </div>
                </div>
              </div>
            )}
            {editCompanyNameMode && (
              <div className={`flex h-full w-full items-center justify-between`}>
                <input
                  type="text"
                  placeholder="名前を入力してください"
                  required
                  autoFocus
                  className={`${styles.input_box}`}
                  value={editedCompanyName}
                  onChange={(e) => setEditedCompanyName(e.target.value)}
                  //   onBlur={() => setEditedName(toHalfWidth(editedName.trim()))}
                  onBlur={() => setEditedCompanyName(toHalfWidthAndSpace(editedCompanyName.trim()))}
                />
                <div className="flex">
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer whitespace-nowrap rounded-[8px] bg-[var(--setting-side-bg-select)] px-[20px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      setEditedCompanyName("");
                      setEditCompanyNameMode(false);
                    }}
                  >
                    キャンセル
                  </div>
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[20px] py-[10px] text-center ${styles.save_section_title} text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`}
                    onClick={async () => {
                      if (editedCompanyName === userProfileState?.customer_name) {
                        console.log("editedCompanyName", editedCompanyName, userProfileState?.customer_name);
                        setEditCompanyNameMode(false);
                        return;
                      }
                      if (editedCompanyName === "") {
                        alert("有効な会社名を入力してください");
                        return;
                      }
                      if (!userProfileState?.company_id) return alert("会社IDが見つかりません");
                      setLoadingGlobalState(true);
                      const { data: companyData, error } = await supabase
                        .from("companies")
                        .update({ customer_name: editedCompanyName })
                        .eq("id", userProfileState.company_id)
                        .select("customer_name")
                        .single();

                      if (error) {
                        setLoadingGlobalState(false);
                        setEditCompanyNameMode(false);
                        alert(error.message);
                        console.log("会社名UPDATEエラー", error.message);
                        toast.error("会社名・チーム名の更新に失敗しました!");
                        return;
                      }

                      console.log("会社名UPDATE成功 companyData", companyData);
                      console.log("会社名UPDATE成功 companyData.customer_name", companyData.customer_name);
                      setUserProfileState({
                        // ...(companyData as UserProfile),
                        ...(userProfileState as UserProfileCompanySubscription),
                        customer_name: companyData.customer_name ? companyData.customer_name : null,
                      });
                      setLoadingGlobalState(false);
                      setEditCompanyNameMode(false);
                      toast.success("会社名・チーム名の更新が完了しました!");
                    }}
                  >
                    保存
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* 会社名・チーム名ここまで */}

          <div className={`min-h-[1px] w-full bg-[var(--color-border-deep)]`}></div>

          {/* 決算日 */}
          <div className={`mt-[20px] flex min-h-[115px] w-full flex-col `}>
            <div className="flex items-start space-x-4">
              <div className={`${styles.section_title}`}>決算日</div>
              {/* <div className={`text-[13px] text-[var(--color-text-brand-f)]`}>
                ※決算月を入力すると、期首から期末まで上期下期、四半期ごとに正確なデータ分析が可能となります。
              </div> */}
              <div className={`flex flex-col text-[13px] text-[var(--color-text-brand-f)]`}>
                <p>※決算日を入力すると、期首から期末まで上期下期、四半期ごとに正確なデータ分析が可能となります。</p>
                <p className="text-[var(--color-text-sub)]">
                  　(決算日(締め日含む)が未設定の場合は、デフォルトで期末が3月31日、期首が4月1日に設定されます。)
                </p>
              </div>
            </div>
            {!editFiscalEndMonthMode && (
              <div className={`flex h-full min-h-[74px] w-full items-center justify-between`}>
                <div className={`${styles.section_value}`}>
                  {userProfileState?.customer_fiscal_end_month
                    ? format(new Date(userProfileState.customer_fiscal_end_month), "M月d日")
                    : "未設定"}
                </div>
                <div>
                  <div
                    className={`transition-base01 min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      let fiscalEndDate: Date;
                      if (userProfileState?.customer_fiscal_end_month) {
                        fiscalEndDate = new Date(userProfileState.customer_fiscal_end_month);
                        fiscalEndDate.setHours(23, 59, 59, 999);
                      } else {
                        // customer_fiscal_end_monthが未設定の場合は3月31日を決算月に設定する
                        const currentYear = new Date().getFullYear(); //現在の年を取得
                        // 3月31日の日付オブジェクトを作成(月は０から始まるので、3月は2)
                        fiscalEndDate = new Date(currentYear, 2, 31);
                        // 期末のため時刻情報を日の終わりに設定(999はミリ秒、これで空白の時間がなくなる)
                        fiscalEndDate.setHours(23, 59, 59, 999);
                        // 必要に応じてISO文字列に変換
                        // const fiscalEndDateString = fiscalEndDate.toISOString()
                      }
                      setEditedFiscalEndMonth(fiscalEndDate);
                      setEditFiscalEndMonthMode(true);
                      prevFiscalEndMonthRef.current = fiscalEndDate;
                    }}
                  >
                    編集
                  </div>
                </div>
              </div>
            )}
            {editFiscalEndMonthMode && (
              <div className={`relative flex h-full min-h-[74px] w-full items-center justify-between`}>
                {/* DatePicker ver */}
                <div className="relative">
                  <DatePickerCustomInputForSettings
                    startDate={editedFiscalEndMonth}
                    setStartDate={setEditedFiscalEndMonth}
                    required={true}
                    minHeight="min-h-[40px]"
                  />
                </div>
                {/* DatePicker ver */}
                <div className="flex">
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer whitespace-nowrap rounded-[8px] bg-[var(--setting-side-bg-select)] px-[20px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      // setEditedFiscalEndMonth("");
                      setEditedFiscalEndMonth(null);
                      setEditFiscalEndMonthMode(false);
                    }}
                  >
                    キャンセル
                  </div>
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[20px] py-[10px] text-center ${styles.save_section_title} text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`}
                    onClick={async () => {
                      if (prevFiscalEndMonthRef.current?.getTime() === editedFiscalEndMonth?.getTime()) {
                        setEditFiscalEndMonthMode(false);
                        return;
                      }
                      if (editedFiscalEndMonth === null) {
                        alert("有効な決算日を入力してください");
                        return;
                      }
                      if (!userProfileState?.company_id)
                        return alert("エラー：お客様のユーザー情報が見つかりませんでした。");
                      // ローディング開始
                      setLoadingGlobalState(true);

                      const { data: companyData, error } = await supabase
                        .from("companies")
                        .update({ customer_fiscal_end_month: editedFiscalEndMonth.toISOString() })
                        .eq("id", userProfileState.company_id)
                        .select("customer_fiscal_end_month")
                        .single();

                      if (error) {
                        setLoadingGlobalState(false);
                        setEditFiscalEndMonthMode(false);
                        alert(error.message);
                        console.log("決算日UPDATEエラー", error.message);
                        toast.error("決算日の更新に失敗しました!");
                        return;
                      }
                      console.log(
                        "決算日UPDATE成功 更新後決算日 companyData.customer_fiscal_end_month",
                        companyData.customer_fiscal_end_month,
                        "editedFiscalEndMonth",
                        editedFiscalEndMonth
                      );
                      setUserProfileState({
                        // ...(companyData as UserProfile),
                        ...(userProfileState as UserProfileCompanySubscription),
                        customer_fiscal_end_month: companyData.customer_fiscal_end_month
                          ? companyData.customer_fiscal_end_month
                          : null,
                      });
                      setLoadingGlobalState(false);
                      setEditFiscalEndMonthMode(false);
                      toast.success("決算日の更新が完了しました!");
                    }}
                  >
                    保存
                  </div>
                  {/* <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[20px] py-[10px] text-center ${styles.save_section_title} text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`}
                    onClick={async () => {
                      if (editedFiscalEndMonth === "") {
                        alert("有効な決算月を入力してください");
                        return;
                      }
                      if (!userProfileState?.company_id) return alert("会社IDが見つかりません");
                      setLoadingGlobalState(true);
                      const { data: companyData, error } = await supabase
                        .from("companies")
                        .update({ customer_fiscal_end_month: editedFiscalEndMonth })
                        .eq("id", userProfileState.company_id)
                        .select("customer_fiscal_end_month")
                        .single();

                      if (error) {
                        setTimeout(() => {
                          setLoadingGlobalState(false);
                          setEditFiscalEndMonthMode(false);
                          alert(error.message);
                          console.log("決算月UPDATEエラー", error.message);
                          toast.error("決算月の更新に失敗しました!");
                        }, 500);
                        return;
                      }
                      setTimeout(() => {
                        console.log("決算月UPDATE成功 companyData", companyData);
                        console.log(
                          "決算月UPDATE成功 companyData.customer_fiscal_end_month",
                          companyData.customer_fiscal_end_month
                        );
                        setUserProfileState({
                          // ...(companyData as UserProfile),
                          ...(userProfileState as UserProfileCompanySubscription),
                          customer_fiscal_end_month: companyData.customer_fiscal_end_month
                            ? companyData.customer_fiscal_end_month
                            : null,
                        });
                        setLoadingGlobalState(false);
                        setEditFiscalEndMonthMode(false);
                        toast.success("決算月の更新が完了しました!", {
                          position: "top-right",
                          autoClose: 3000,
                          hideProgressBar: false,
                          closeOnClick: true,
                          pauseOnHover: true,
                          draggable: true,
                          progress: undefined,
                          // theme: `${theme === "light" ? "light" : "dark"}`,
                        });
                      }, 500);
                    }}
                  >
                    保存
                  </div> */}
                </div>
              </div>
            )}
          </div>
          {/* 決算月ここまで */}

          <div className={`min-h-[1px] w-full bg-[var(--color-border-deep)]`}></div>

          {/* 事業部リスト */}
          {/* <div className={`mt-[20px] flex min-h-[95px] w-full flex-col`}> */}
          <div
            className={`mt-[20px] flex w-full flex-col ${
              !!departmentDataArray && departmentDataArray.length >= 1 ? `min-h-[105px]` : `min-h-[95px]`
            }`}
            // className={`mt-[20px] flex w-full flex-col ${true ? `min-h-[105px]` : `min-h-[95px]`}`}
          >
            {/* <div className={`${styles.section_title}`}>事業部</div> */}
            <div className="flex items-start space-x-4">
              <div className={`${styles.section_title}`}>事業部</div>
              <div className={`flex flex-col text-[13px] text-[var(--color-text-brand-f)]`}>
                <p>※事業部を作成することで事業部ごとに商品、営業、売上データを管理できます。</p>
                {/* <p className="text-[var(--color-text-sub)]">
                  　(決算日(締め日含む)が未設定の場合は、デフォルトで期末が3月31日、期首が4月1日に設定されます。)
                </p> */}
              </div>
            </div>

            {/* 通常 */}
            {!editDepartmentMode && !insertDepartmentMode && (
              <div
                className={`flex h-full min-h-[74px] w-full items-center justify-between ${
                  !!departmentDataArray && departmentDataArray.length >= 1 && `mt-[10px]`
                }`}
                // className={`flex h-full min-h-[74px] w-full items-center justify-between ${true && `mt-[10px]`}`}
              >
                {(!departmentDataArray || departmentDataArray.length === 0) && (
                  <div className={`${styles.section_value}`}>未設定</div>
                )}
                {/* mapメソッドで事業部タグリストを展開 */}
                {/* {true && ( */}
                {!!departmentDataArray && departmentDataArray.length >= 1 && (
                  <div
                    ref={rowContainer}
                    className={`relative min-w-[calc(761px-78px-20px)] max-w-[calc(761px-78px-20px)] overflow-x-hidden ${styles.department_tag_container}`}
                  >
                    {/* 左矢印エリア(シャドウあり) */}
                    <div
                      ref={arrowIconAreaLeft}
                      className={`${styles.scroll_icon_area}`}
                      // style={{ ...(isMoved && { display: "none" }) }}
                    >
                      <div
                        className={`flex-center ${styles.scroll_icon}`}
                        onClick={() => !isMoved && handleClickScroll("left")}
                        // onClick={() => {
                        //   if (tabPage === 1) return;
                        //   setTabPage((prev) => {
                        //     const newPage = prev - 1;
                        //     return newPage;
                        //   });
                        // }}
                      >
                        <BsChevronLeft className="text-[var(--color-text-title)]" />
                      </div>
                    </div>
                    {/* Rowグループ */}
                    <div
                      ref={rowRef}
                      className={`${styles.row_group} scrollbar-hide flex items-center space-x-[12px] overflow-x-scroll`}
                    >
                      {departmentDataArray
                        .sort((a, b) =>
                          a.department_name.localeCompare(b.department_name, language === "ja" ? "ja" : "en")
                        )
                        .map((departmentData, index) => (
                          <div
                            key={index}
                            className={`transition-bg03 flex h-[35px] min-h-[35px] min-w-max max-w-[150px] cursor-pointer select-none items-center justify-center space-x-2 rounded-full border border-solid border-[#d6dbe0] px-[18px] text-[14px] hover:border-[var(--color-bg-brand-f)] ${
                              activeDepartmentTagIndex === index
                                ? `border-[var(--color-bg-brand-f)] bg-[var(--color-bg-brand-f)] text-[#fff]`
                                : `text-[var(--color-text-title)]`
                            }`}
                            onClick={() => {
                              if (activeDepartmentTagIndex === index) return setActiveDepartmentTagIndex(null);
                              setActiveDepartmentTagIndex(index);
                            }}
                          >
                            <Image
                              // src="/assets/images/icons/business/icons8-businesswoman-94.png"
                              src={departmentTagIconsTest[index % departmentTagIconsTest.length].iconURL}
                              alt="tag"
                              className="ml-[-4px] w-[22px]"
                              width={22}
                              height={22}
                            />
                            <span className="truncate text-[13px]">{departmentData.department_name}</span>
                          </div>
                        ))}
                      {/* テストデータ */}
                      {/* {Array(12)
                        .fill(null)
                        .map((_, index) => (
                          <div
                            key={index}
                            className="transition-bg03 flex h-[35px] min-h-[35px] min-w-max max-w-[150px] cursor-pointer select-none items-center justify-center space-x-2 rounded-full border border-solid border-[#d6dbe0] px-[18px] text-[14px] text-[var(--color-text-title)] hover:border-[var(--color-bg-brand-f)]"
                          >
                            <Image
                              // src="/assets/images/icons/business/icons8-businesswoman-94.png"
                              src={departmentTagIconsTest[index % departmentTagIconsTest.length].iconURL}
                              alt="tag"
                              className="ml-[-4px] w-[22px]"
                              width={22}
                              height={22}
                            />
                            <span className="truncate text-[13px]">
                              {departmentTagIconsTest[index % departmentTagIconsTest.length].name}
                            </span>
                          </div>
                        ))} */}
                      {/* {Array(12)
                        .fill(null)
                        .map((_, index) => (
                          <div
                            key={index}
                            className={`flex h-[45px] min-h-[45px] items-center space-x-[6px] text-[14px] text-[var(--color-text-title)]`}
                          >
                            <div className="transition-bg03 flex h-[35px] min-w-max max-w-[150px] cursor-pointer select-none items-center justify-center space-x-2 rounded-full border border-solid border-[#d6dbe0] px-[18px] hover:border-[var(--color-bg-brand-f)]">
                              <Image
                                // src="/assets/images/icons/business/icons8-businesswoman-94.png"
                                src={departmentTagIconsTest[index % departmentTagIconsTest.length].iconURL}
                                alt="tag"
                                className="ml-[-4px] w-[22px]"
                                width={22}
                                height={22}
                              />
                              <span className="truncate text-[13px]">
                                {departmentTagIconsTest[index % departmentTagIconsTest.length].name}
                              </span>
                            </div>
                          </div>
                        ))} */}
                    </div>

                    {/* 右矢印エリア(シャドウあり) */}
                    <div ref={arrowIconAreaRight} className={`${styles.scroll_icon_area}`}>
                      <div
                        className={`flex-center ${styles.scroll_icon} ${isMoved && "opacity-0"}`}
                        onClick={() => !isMoved && handleClickScroll("right")}
                      >
                        <BsChevronRight className="text-[var(--color-text-title)]" />
                      </div>
                    </div>
                  </div>
                )}
                {/* {!!departmentDataArray && departmentDataArray.length >= 1 && (
                  <>
                    {Array(4)
                      .fill(null)
                      .map((_, index) => (
                        <div
                          key={index}
                          className={`flex h-[45px] min-h-[45px] items-center space-x-3 text-[14px] text-[var(--color-text-title)]`}
                        >
                          <div className="flex h-[40px] items-center space-x-2  rounded-full border  border-[#d6dbe0] px-[15px]">
                            <Image
                              src="/assets/images/icons/business/icons8-businesswoman-94 (1).png"
                              alt=""
                              className="ml-[-4px] w-[24px] rounded-[4px]"
                            />
                            <span>事業部</span>
                          </div>
                        </div>
                      ))}
                  </>
                )} */}
                <div className={`relative`}>
                  {activeDepartmentTagIndex !== null && !!departmentDataArray && (
                    <>
                      <div
                        className={`transition-base01 ${styles.section_title} ${styles.active} ${styles.delete_btn}`}
                      >
                        削除
                      </div>
                      <div
                        className={`transition-base01 min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] ${styles.section_title} ${styles.active} hover:bg-[var(--setting-side-bg-select-hover)]`}
                        onClick={() => {
                          console.log("activeDepartmentTagIndex", activeDepartmentTagIndex);
                          console.log(
                            "departmentDataArray[activeDepartmentTagIndex]",
                            departmentDataArray[activeDepartmentTagIndex]
                          );
                          console.log("departmentDataArray", departmentDataArray);
                          console.log(
                            "invertFalsyExcludeZero(activeDepartmentTagIndex)",
                            invertFalsyExcludeZero(activeDepartmentTagIndex)
                          );
                          if (invertFalsyExcludeZero(activeDepartmentTagIndex)) return;
                          if (!departmentDataArray[activeDepartmentTagIndex]) return;
                          const departmentPayload = {
                            id: departmentDataArray[activeDepartmentTagIndex].id,
                            created_by_company_id: departmentDataArray[activeDepartmentTagIndex].created_by_company_id,
                            department_name: departmentDataArray[activeDepartmentTagIndex].department_name,
                          };
                          originalDepartmentNameRef.current =
                            departmentDataArray[activeDepartmentTagIndex].department_name;
                          console.log("departmentPayload", departmentPayload);
                          setEditedDepartment(departmentPayload);
                          setEditDepartmentMode(true);
                        }}
                      >
                        編集
                      </div>
                    </>
                  )}
                  {activeDepartmentTagIndex === null && (
                    <div
                      className={`transition-base01 min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                      onClick={() => {
                        setInsertDepartmentMode(true);
                      }}
                    >
                      追加
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* INSERT 新たに事業部を作成するinputエリア */}
            {insertDepartmentMode && (
              <div className={`flex h-full min-h-[74px] w-full items-center justify-between`}>
                <input
                  type="text"
                  placeholder="事業部名を入力してください"
                  required
                  autoFocus
                  className={`${styles.input_box}`}
                  value={inputDepartmentName}
                  onChange={(e) => setInputDepartmentName(e.target.value)}
                  onBlur={() => setInputDepartmentName(toHalfWidthAndSpace(inputDepartmentName.trim()))}
                />
                <div className="flex">
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer whitespace-nowrap rounded-[8px] bg-[var(--setting-side-bg-select)] px-[20px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      if (createDepartmentMutation.isLoading) return;
                      setInputDepartmentName("");
                      setInsertDepartmentMode(false);
                    }}
                  >
                    キャンセル
                  </div>
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[20px] py-[10px] text-center ${styles.save_section_title} text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`}
                    onClick={async () => {
                      if (createDepartmentMutation.isLoading) return;
                      // 事業部の編集
                      if (inputDepartmentName === "") {
                        setInputDepartmentName("");
                        setInsertDepartmentMode(false);
                        return;
                      }
                      if (!userProfileState?.company_id) {
                        alert("エラー：会社データが見つかりませんでした。");
                        setInputDepartmentName("");
                        setInsertDepartmentMode(false);
                        return;
                      }

                      const insertFieldPayload = {
                        created_by_company_id: userProfileState.company_id,
                        department_name: inputDepartmentName,
                      };
                      console.log("insertFieldPayload", insertFieldPayload);

                      await createDepartmentMutation.mutateAsync(insertFieldPayload);

                      setInputDepartmentName("");
                      setInsertDepartmentMode(false);
                    }}
                  >
                    {!createDepartmentMutation.isLoading && <span>保存</span>}
                    {createDepartmentMutation.isLoading && (
                      <div className="relative h-full w-full">
                        <SpinnerIDS3 fontSize={20} width={20} height={20} color="#fff" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* UPDATE/DELETE 既存の事業部を編集、更新するinputエリア */}
            {editDepartmentMode && !!editedDepartment && (
              <div className={`flex h-full min-h-[74px] w-full items-center justify-between`}>
                <input
                  type="text"
                  placeholder="事業部名を入力してください"
                  required
                  autoFocus
                  className={`${styles.input_box}`}
                  value={editedDepartment?.department_name ? editedDepartment.department_name : ""}
                  onChange={(e) => setEditedDepartment({ ...editedDepartment, department_name: e.target.value })}
                  onBlur={() => {
                    const newName = toHalfWidthAndSpace(editedDepartment.department_name.trim());
                    setEditedDepartment({ ...editedDepartment, department_name: newName });
                  }}
                />
                <div className="flex">
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer whitespace-nowrap rounded-[8px] bg-[var(--setting-side-bg-select)] px-[20px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      setEditedDepartment(null);
                      setEditDepartmentMode(false);
                      originalDepartmentNameRef.current = null;
                      setActiveDepartmentTagIndex(null);
                    }}
                  >
                    キャンセル
                  </div>
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[20px] py-[10px] text-center ${styles.save_section_title} text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`}
                    onClick={async () => {
                      // 事業部の編集
                      if (!editedDepartment || editedDepartment.department_name === originalDepartmentNameRef.current) {
                        setEditedDepartment(null);
                        setEditDepartmentMode(false);
                        return;
                      }
                      // try {
                      //   setLoadingGlobalState(true);
                      //   const { error } = await supabase
                      //     .from("departments")
                      //     .update({ department_name: editedDepartment })
                      //     .eq("created_by_company_id", userProfileState.company_id)

                      //   if (error) throw error

                      //   setLoadingGlobalState(false);
                      //   setEditedDepartment("");
                      //   setEditDepartmentMode(false);
                      //   toast.success("事業部名の更新が完了しました🌟");
                      //   return
                      // } catch (e: any) {
                      //   setLoadingGlobalState(false);
                      //   setEditedDepartment("");
                      //   setEditDepartmentMode(false);
                      //   console.log("❌事業部名UPDATEエラー", e);
                      //   toast.error("事業部名の更新に失敗しました🙇‍♀️");
                      //   return;
                      // }

                      const updateFieldPayload = {
                        fieldName: "department_name",
                        value: editedDepartment.department_name,
                        id: editedDepartment.id,
                      };

                      await updateDepartmentFieldMutation.mutateAsync(updateFieldPayload);

                      setEditedDepartment(null);
                      setEditDepartmentMode(false);
                    }}
                  >
                    保存
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* 部署ここまで */}

          <div className={`min-h-[1px] w-full bg-[var(--color-border-deep)]`}></div>

          {/* 規模 */}
          <div className={`mt-[20px] flex min-h-[95px] w-full flex-col`}>
            <div className={`${styles.section_title}`}>規模</div>

            {!editNumberOfEmployeeClassMode && (
              <div className={`flex h-full min-h-[74px] w-full items-center justify-between`}>
                <div className={`${styles.section_value}`}>
                  {userProfileState?.customer_number_of_employees_class
                    ? userProfileState.customer_number_of_employees_class
                    : "未設定"}
                </div>
                <div>
                  <div
                    className={`transition-base01 min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      setEditedNumberOfEmployeeClass(
                        userProfileState?.customer_number_of_employees_class
                          ? userProfileState.customer_number_of_employees_class
                          : ""
                      );
                      setEditNumberOfEmployeeClassMode(true);
                    }}
                  >
                    編集
                  </div>
                </div>
              </div>
            )}
            {editNumberOfEmployeeClassMode && (
              <div className={`flex h-full min-h-[74px] w-full items-center justify-between`}>
                <select
                  name="profile_occupation"
                  id="profile_occupation"
                  className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                  value={editedNumberOfEmployeeClass}
                  onChange={(e) => setEditedNumberOfEmployeeClass(e.target.value)}
                >
                  <option value="">回答を選択してください</option>
                  <option value="G 1〜49名">1〜49名</option>
                  <option value="F 50〜99名">50〜99名</option>
                  <option value="E 100〜199名">100〜199名</option>
                  <option value="D 200〜299名">200〜299名</option>
                  <option value="C 300〜499名">300〜499名</option>
                  <option value="B 500〜999名">500〜999名</option>
                  <option value="A 1000名以上">1000名以上</option>
                </select>
                <div className="flex">
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer whitespace-nowrap rounded-[8px] bg-[var(--setting-side-bg-select)] px-[20px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      setEditedNumberOfEmployeeClass("");
                      setEditNumberOfEmployeeClassMode(false);
                    }}
                  >
                    キャンセル
                  </div>
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[20px] py-[10px] text-center ${styles.save_section_title} text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`}
                    onClick={async () => {
                      if (!userProfileState) return;
                      if (userProfileState.customer_number_of_employees_class === editedNumberOfEmployeeClass) {
                        setEditNumberOfEmployeeClassMode(false);
                        return;
                      }
                      if (editedNumberOfEmployeeClass === "") {
                        alert("有効な規模を入力してください");
                        return;
                      }
                      if (!userProfileState?.company_id) return alert("会社IDが見つかりません");
                      setLoadingGlobalState(true);
                      const { data: companyData, error } = await supabase
                        .from("companies")
                        .update({ customer_number_of_employees_class: editedNumberOfEmployeeClass })
                        .eq("id", userProfileState.company_id)
                        .select("customer_number_of_employees_class")
                        .single();

                      if (error) {
                        setLoadingGlobalState(false);
                        setEditNumberOfEmployeeClassMode(false);
                        alert(error.message);
                        console.log("規模UPDATEエラー", error.message);
                        toast.error("規模の更新に失敗しました!");
                        return;
                      }
                      console.log(
                        "規模UPDATE成功 companyData.customer_number_of_employees_class",
                        companyData.customer_number_of_employees_class
                      );
                      setUserProfileState({
                        // ...(companyData as UserProfile),
                        ...(userProfileState as UserProfileCompanySubscription),
                        customer_number_of_employees_class: companyData.customer_number_of_employees_class
                          ? companyData.customer_number_of_employees_class
                          : null,
                      });
                      setLoadingGlobalState(false);
                      setEditNumberOfEmployeeClassMode(false);
                      toast.success("規模の更新が完了しました!");
                    }}
                  >
                    保存
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* 規模ここまで */}

          <div className={`min-h-[1px] w-full bg-[var(--color-border-deep)]`}></div>

          {/* チームの所有者 */}
          {/* {changeOwnerNotificationState === null && ( */}
          {notificationDataState === null && (
            <div className={`mt-[20px] flex min-h-[95px] w-full flex-col`}>
              {userProfileState?.account_company_role === "company_owner" && (
                <div className={`${styles.section_title}`}>チームの所有者の変更</div>
              )}
              {userProfileState?.account_company_role !== "company_owner" && (
                <div className={`${styles.section_title}`}>チームの所有者</div>
              )}

              {userProfileState?.account_company_role === "company_owner" && (
                <div className={`flex h-full min-h-[74px] w-full items-center justify-between`}>
                  <div className="text-[14px] text-[var(--color-text-title)]">
                    現在の所有者である自分を削除し、代わりに別のメンバーを任命します。注：1つのチームに任命できる所有者は1人だけです。
                  </div>
                  <div>
                    <div
                      className={`transition-base01 ml-[30px] min-w-[78px] cursor-pointer truncate rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                      onClick={() => setChangeTeamOwnerStep(1)}
                    >
                      所有者の変更
                    </div>
                  </div>
                </div>
              )}
              {userProfileState?.account_company_role !== "company_owner" && (
                <div className={`flex h-full min-h-[74px] w-full items-center justify-between`}>
                  <div className={`${styles.section_value}`}>{companyOwnerName}</div>
                  <div></div>
                </div>
              )}
            </div>
          )}
          {/* チームの所有者 要確認 needConfirmation */}
          {/* {!!changeOwnerNotificationState &&
            changeOwnerNotificationState.to_user_id === userProfileState?.id &&
            changeOwnerNotificationState.from_user_id !== userProfileState?.id && ( */}
          {!!notificationDataState &&
            notificationDataState.to_user_id === userProfileState?.id &&
            notificationDataState.from_user_id !== userProfileState?.id && (
              <div className={`mt-[20px] flex min-h-[95px] w-full flex-col`}>
                {/* {userProfileState?.is_subscriber && <div className={`${styles.section_title}`}>チームの所有者の変更</div>} */}
                {userProfileState?.account_company_role !== "company_owner" && (
                  <div className={`${styles.section_title} flex min-h-[74px] items-center`}>
                    <span className="mr-[5px]">チームの所有権の任命を受け入れる</span>
                    <div className="flex-center max-h-[18px] rounded-full bg-[var(--color-red-tk)] px-[10px] py-[2px] text-[10px] text-[#fff]">
                      <span className="">確認が必要</span>
                    </div>
                  </div>
                )}

                {userProfileState?.account_company_role !== "company_owner" && (
                  <div className={`flex h-full min-h-[74px] w-full items-center justify-between`}>
                    <div className="text-[14px] text-[var(--color-text-title)]">
                      {/* <span className="font-bold">{changeOwnerNotificationState?.from_user_name}</span>さん（
                      <span className="font-bold">{changeOwnerNotificationState?.from_user_email}</span>）が
                      <span className="font-bold">{changeOwnerNotificationState?.from_company_name}</span> */}
                      <span className="font-bold">{notificationDataState?.from_user_name}</span>さん（
                      <span className="font-bold">{notificationDataState?.from_user_email}</span>）が
                      <span className="font-bold">{notificationDataState?.from_company_name}</span>
                      の所有者として代わりにあなたを任命しました。受け入れるか拒否するかを伝えてください。
                    </div>
                    <div>
                      <div
                        className={`transition-base01 ml-[30px] min-w-[78px] cursor-pointer truncate rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                        onClick={async () => {
                          // await queryClient.invalidateQueries({ queryKey: ["change_team_owner_notifications"] });
                          // await new Promise((resolve) =>
                          //   setTimeout(async () => {
                          //     try {
                          //       const { data, error } = await supabase
                          //         .from("notifications")
                          //         .select("completed")
                          //         .eq("id", notificationDataState?.id);
                          //       if (error) throw new Error(error.message);

                          //       console.log("確認クリック SELECT", "data[0]", data[0], "error", error);
                          //       if (data[0].completed === true) {
                          //         console.log("完了済みのためリターン");
                          //         toast.warn("変更依頼がキャンセルされていたため確認できませんでした！", {
                          //           position: "top-right",
                          //           autoClose: 3000,
                          //           hideProgressBar: false,
                          //           closeOnClick: true,
                          //           pauseOnHover: true,
                          //           draggable: true,
                          //           progress: undefined,
                          //           // theme: `${theme === "light" ? "light" : "dark"}`,
                          //         });
                          //         await queryClient.invalidateQueries({ queryKey: ["my_notifications"] });
                          //         await queryClient.invalidateQueries({
                          //           queryKey: ["change_team_owner_notifications"],
                          //         });

                          //         return;
                          //       }

                          //       console.log(
                          //         "確認クリック",
                          //         "キャッシュchangeTeamOwnerData",
                          //         changeTeamOwnerData,
                          //         "Zustand notificationDataState",
                          //         notificationDataState
                          //       );

                          //       if (
                          //         notificationDataState?.type === "change_team_owner" &&
                          //         notificationDataState?.completed === false &&
                          //         changeTeamOwnerData?.length !== 0
                          //       ) {
                          //         handleClickedChangeTeamOwnerConfirmation(notificationDataState);
                          //       }
                          //     } catch (error) {
                          //       console.error("notificationsテーブルのselect失敗");
                          //     }
                          //     resolve;
                          //   }, 100)
                          // );
                          // await queryClient.invalidateQueries({ queryKey: ["my_notifications"] });
                          // if (notificationDataState?.completed === true || changeTeamOwnerData?.length === 0) {
                          //       console.log("完了済みのためリターン");
                          //       toast.error("変更依頼がキャンセルされていたため確認できませんでした！", {
                          //         position: "top-right",
                          //         autoClose: 3000,
                          //         hideProgressBar: false,
                          //         closeOnClick: true,
                          //         pauseOnHover: true,
                          //         draggable: true,
                          //         progress: undefined,
                          //         // theme: `${theme === "light" ? "light" : "dark"}`,
                          //       });
                          //       return;
                          //     }
                          try {
                            const { data, error } = await supabase
                              .from("notifications")
                              .select("completed")
                              .eq("id", notificationDataState?.id);
                            if (error) throw new Error(error.message);

                            console.log("確認クリック SELECT", "data[0]", data[0], "error", error);
                            if (data[0].completed === true) {
                              console.log("完了済みのためリターン");
                              toast.warn("変更依頼がキャンセルされていたため確認できませんでした！", {
                                position: "top-right",
                                autoClose: 3000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                // theme: `${theme === "light" ? "light" : "dark"}`,
                              });
                              await queryClient.invalidateQueries({ queryKey: ["my_notifications"] });
                              await queryClient.invalidateQueries({
                                queryKey: ["change_team_owner_notifications"],
                              });

                              return;
                            }

                            console.log(
                              "確認クリック",
                              "キャッシュchangeTeamOwnerData",
                              changeTeamOwnerData,
                              "Zustand notificationDataState",
                              notificationDataState
                            );

                            if (
                              notificationDataState?.type === "change_team_owner" &&
                              notificationDataState?.completed === false &&
                              changeTeamOwnerData?.length !== 0
                            ) {
                              handleClickedChangeTeamOwnerConfirmation(notificationDataState);
                            }
                          } catch (error) {
                            console.error("notificationsテーブルのselect失敗");
                          }
                        }}
                      >
                        確認
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          {/* チームの所有者 保留中 onHold */}
          {/* {!!changeOwnerNotificationState &&
            changeOwnerNotificationState.to_user_id !== userProfileState?.id &&
            changeOwnerNotificationState.from_user_id === userProfileState?.id && ( */}
          {!!notificationDataState &&
            notificationDataState.to_user_id !== userProfileState?.id &&
            notificationDataState.from_user_id === userProfileState?.id && (
              <div className={`mt-[20px] flex min-h-[95px] w-full flex-col`}>
                {/* {userProfileState?.is_subscriber && <div className={`${styles.section_title}`}>チームの所有者の変更</div>} */}
                {userProfileState?.account_company_role === "company_owner" && (
                  <div className={`${styles.section_title} flex items-center`}>
                    <span className="mr-[5px]">チームの所有者の変更</span>
                    <div className="flex-center max-h-[18px] rounded-full bg-[var(--color-bg-brand-f)] px-[10px] py-[2px] text-[10px] text-[#fff]">
                      <span className="">保留中</span>
                    </div>
                    {/* <button
                      className={`flex-center transition-base03 relative  h-[26px] min-w-[118px]  cursor-pointer space-x-1  rounded-[4px] px-[15px] text-[12px] text-[var(--color-bg-brand-f)] hover:bg-[var(--color-bg-brand-f)] hover:text-[#fff] active:bg-[var(--color-function-header-text-btn-active)]`}
                      onClick={async () => {
                        console.log("リフレッシュ クリック");
                        setRefetchLoading(true);
                        await queryClient.invalidateQueries({ queryKey: ["change_team_owner_notifications"] });
                        // await refetch();
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
                    </button> */}
                  </div>
                )}

                {userProfileState?.account_company_role === "company_owner" && (
                  <div className={`flex h-full w-full items-center justify-between`}>
                    <div className="text-[14px] text-[var(--color-text-title)]">
                      <span className="font-bold">
                        {/* {format(new Date(changeOwnerNotificationState?.created_at), "yyyy年MM月dd日")} */}
                        {format(new Date(notificationDataState?.created_at), "yyyy年MM月dd日")}
                      </span>
                      に、
                      <span className="font-bold">{notificationDataState?.to_user_name}</span>さん（
                      <span className="font-bold">{notificationDataState?.to_user_email}</span>）
                      {/* <span className="font-bold">{changeOwnerNotificationState?.to_user_name}</span>さん（
                      <span className="font-bold">{changeOwnerNotificationState?.to_user_email}</span>） */}
                      をチームの新しい所有者に任命しました。新しい所有者による承諾はまだ行われていません。
                      <span
                        className={`cursor-pointer text-[var(--color-text-brand-f)] underline hover:font-bold`}
                        onClick={() => {
                          setOpenCancelChangeTeamOwnerModal(true);
                        }}
                      >
                        任命を取り消す
                      </span>
                    </div>
                    {/* <div>
                      <div
                        className={`transition-base01 ml-[30px] min-w-[78px] cursor-pointer truncate rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                      >
                        確認
                      </div>
                    </div> */}
                    <button
                      className={`ml-[30px] min-w-[158px] cursor-pointer truncate rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] ${styles.section_title} flex items-center space-x-2 hover:bg-[var(--setting-side-bg-select-hover)]`}
                      onClick={async () => {
                        console.log("リフレッシュ クリック");
                        setRefetchLoading(true);
                        await queryClient.invalidateQueries({ queryKey: ["change_team_owner_notifications"] });
                        // await refetch();
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
                  </div>
                )}
              </div>
            )}
          {/* チームの所有者 ここまで */}

          <div className={`min-h-[1px] w-full bg-[var(--color-border-deep)]`}></div>

          {/* ============================== チームの所有者の変更モーダル ============================== */}
          {/* {changeTeamOwnerStep && (
            <ChangeTeamOwnerModal
              changeTeamOwnerStep={changeTeamOwnerStep}
              setChangeTeamOwnerStep={setChangeTeamOwnerStep}
              logoUrl={logoUrl}
              getCompanyInitial={getCompanyInitial}
            />
          )} */}
          {changeTeamOwnerStep && (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <Suspense
                fallback={
                  <FallbackChangeOwner
                    changeTeamOwnerStep={changeTeamOwnerStep}
                    getCompanyInitial={getCompanyInitial}
                    logoUrl={logoUrl}
                  />
                }
              >
                <ChangeTeamOwnerModal
                  changeTeamOwnerStep={changeTeamOwnerStep}
                  setChangeTeamOwnerStep={setChangeTeamOwnerStep}
                  logoUrl={logoUrl}
                  getCompanyInitial={getCompanyInitial}
                />
              </Suspense>
            </ErrorBoundary>
          )}
          {/* ============================== チームの所有者の変更モーダル ここまで ============================== */}
          {/* ============================== チームの所有者の変更キャンセルモーダル ============================== */}
          {openCancelChangeTeamOwnerModal && notificationDataState !== null && (
            <>
              {/* オーバーレイ */}
              <div
                className="fixed left-[-100vw] top-[-100vh] z-[1000] h-[200vh] w-[200vw] bg-[var(--color-overlay)] backdrop-blur-sm"
                onClick={() => {
                  console.log("オーバーレイ クリック");
                  setOpenCancelChangeTeamOwnerModal(false);
                  //   setNotificationDataState(null);
                }}
              ></div>
              <div className="fixed left-[50%] top-[50%] z-[2000] h-auto w-[40vw] translate-x-[-50%] translate-y-[-50%] rounded-[8px] bg-[var(--color-bg-notification-modal)] p-[32px] text-[var(--color-text-title)]">
                {loading && (
                  <div
                    className={`flex-center fixed left-0 top-0 z-[3000] h-[100%] w-[100%] rounded-[8px] bg-[#00000090]`}
                  >
                    <SpinnerIDS scale={"scale-[0.5]"} />
                  </div>
                )}
                {/* クローズボタン */}
                <button
                  className={`flex-center z-100 group absolute right-[-40px] top-0 h-[32px] w-[32px] rounded-full bg-[#00000090] hover:bg-[#000000c0]`}
                  onClick={() => {
                    setOpenCancelChangeTeamOwnerModal(false);
                    // setNotificationDataState(null);
                  }}
                >
                  <MdClose className="text-[20px] text-[#fff]" />
                </button>
                <h3 className={`flex min-h-[32px] w-full items-center text-[22px] font-bold`}>
                  任命を取り消しますか？
                </h3>
                <section className={`mt-[20px] flex h-auto w-full flex-col text-[14px]`}>
                  <p>
                    <span className="font-bold">{notificationDataState?.from_user_name}</span>（
                    <span className="font-bold">{notificationDataState?.from_user_email}</span>
                    ）が承諾する前に取り消した場合、引き続きあなたが
                    <span className="font-bold">{notificationDataState?.from_company_name}</span>
                    の所有者になります。
                  </p>
                </section>
                <section className="flex w-full items-start justify-end">
                  <div className={`flex w-[100%] items-center justify-around space-x-5 pt-[30px]`}>
                    <button
                      className={`w-[50%] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[15px] py-[10px] text-[14px] font-bold text-[var(--color-text-title)] hover:bg-[var(--setting-side-bg-select-hover)]`}
                      onClick={() => setOpenCancelChangeTeamOwnerModal(false)}
                    >
                      保持する
                    </button>
                    <button
                      className="w-[50%] cursor-pointer rounded-[8px] bg-[var(--color-red-tk)] px-[15px] py-[10px] text-[14px] font-bold text-[#fff] hover:bg-[var(--color-red-tk-hover)]"
                      onClick={() => handleCancelChangeTeamOwner(notificationDataState)}
                    >
                      取り消す
                    </button>
                  </div>
                </section>
              </div>
            </>
          )}
          {/* ============================== チームの所有者の変更キャンセルモーダル ここまで ============================== */}
        </div>
      )}
      {/* 右側メインエリア 会社・チーム ここまで */}
    </>
  );
};

export const SettingCompany = memo(SettingCompanyMemo);
