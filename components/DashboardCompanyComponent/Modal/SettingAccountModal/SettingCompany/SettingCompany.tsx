import useDashboardStore from "@/store/useDashboardStore";
import Image from "next/image";
import React, { Suspense, memo, useCallback, useEffect, useRef, useState } from "react";
import styles from "./SettingCompany.module.css";
import { useDownloadUrl } from "@/hooks/useDownloadUrl";
import { useUploadAvatarImg } from "@/hooks/useUploadAvatarImg";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { toast } from "react-toastify";
import { Department, Notification, Office, Unit, UserProfileCompanySubscription } from "@/types";
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
import { departmentTagIcons, departmentTagIconsTest, officeTagIcons, unitTagIcons } from "./data";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import SpinnerIDS3 from "@/components/Parts/SpinnerIDS/SpinnerIDS3";
import useStore from "@/store";
import { invertFalsyExcludeZero } from "@/utils/Helpers/invertFalsyExcludeZero";
import { ConfirmationModal } from "./ConfirmationModal/ConfirmationModal";
import { useQueryUnits } from "@/hooks/useQueryUnits";
import { useMutateUnit } from "@/hooks/useMutateUnit";
import { AiFillCaretDown } from "react-icons/ai";
import { useMutateOffice } from "@/hooks/useMutateOffice";
import { useQueryOffices } from "@/hooks/useQueryOffices";

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
  // const [activeDepartmentTagIndex, setActiveDepartmentTagIndex] = useState<number | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  // 係ユニット 追加・編集
  const [insertUnitMode, setInsertUnitMode] = useState(false);
  const [inputUnitName, setInputUnitName] = useState("");
  const [editUnitMode, setEditUnitMode] = useState(false);
  const [editedUnit, setEditedUnit] = useState<Omit<Unit, "created_at"> | null>(null);
  const originalUnitNameRef = useRef<Unit | null>(null);
  // const originalUnitNameRef = useRef<string | null>(null);
  // const [activeUnitTagIndex, setActiveUnitTagIndex] = useState<number | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedDepartmentForUnit, setSelectedDepartmentForUnit] = useState<Department | null>(null);
  // 事業所・営業所 追加・編集
  const [insertOfficeMode, setInsertOfficeMode] = useState(false);
  const [inputOfficeName, setInputOfficeName] = useState("");
  const [editOfficeMode, setEditOfficeMode] = useState(false);
  const [editedOffice, setEditedOffice] = useState<Omit<Office, "created_at"> | null>(null);
  const originalOfficeNameRef = useRef<string | null>(null);
  // const [activeOfficeTagIndex, setActiveOfficeTagIndex] = useState<number | null>(null);
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);
  // ローディング
  const [refetchLoading, setRefetchLoading] = useState(false);
  // 削除確認モーダル
  const [showConfirmCancelModal, setShowConfirmCancelModal] = useState(false);

  const { useMutateUploadAvatarImg, useMutateDeleteAvatarImg } = useUploadAvatarImg();
  const { fullUrl: logoUrl, isLoading } = useDownloadUrl(userProfileState?.logo_url, "customer_company_logos");

  // キャッシュからお知らせを取得
  // const queryClient = useQueryClient();
  // const notificationsCacheData = queryClient.getQueryData<Notification[]>(["my_notifications"]);
  // const [changeOwnerNotificationState, setChangeOwnerNotificationState] = useState<Notification | null>(null);

  // ================================ 🌟事業部、係、事業所リスト取得useQuery🌟 ================================
  // const departmentDataArray: Department[] | undefined = queryClient.getQueryData(["departments"]);
  // const unitDataArray: Unit[] | undefined = queryClient.getQueryData(["units"]);
  // const officeDataArray: Office[] | undefined = queryClient.getQueryData(["offices"]);
  // ================================ ✅事業部、係、事業所リスト取得useQuery✅ ================================
  // ================================ 🌟事業部リスト取得useQuery🌟 ================================
  const {
    data: departmentDataArray,
    isLoading: isLoadingQueryDepartment,
    refetch: refetchQUeryDepartments,
  } = useQueryDepartments(userProfileState?.company_id, true);
  // } = useQueryDepartments(userProfileState?.company_id);
  console.log("departmentDataArray", departmentDataArray);

  // useMutation
  const { createDepartmentMutation, updateDepartmentFieldMutation, deleteDepartmentMutation } = useMutateDepartment();
  // ================================ ✅事業部リスト取得useQuery✅ ================================
  // ================================ 🌟係・チームリスト取得useQuery🌟 ================================
  const {
    data: unitDataArray,
    isLoading: isLoadingQueryUnit,
    refetch: refetchQUeryUnits,
  } = useQueryUnits(userProfileState?.company_id, true);
  // } = useQueryUnits(userProfileState?.company_id);

  // useMutation
  const { createUnitMutation, updateUnitFieldMutation, updateMultipleUnitFieldsMutation, deleteUnitMutation } =
    useMutateUnit();
  // ================================ ✅係・チームリスト取得useQuery✅ ================================
  // ================================ 🌟事業所・営業所リスト取得useQuery🌟 ================================
  const {
    data: officeDataArray,
    isLoading: isLoadingQueryOffice,
    refetch: refetchQUeryOffices,
  } = useQueryOffices(userProfileState?.company_id, true);
  // } = useQueryOffices(userProfileState?.company_id);

  // useMutation
  const { createOfficeMutation, updateOfficeFieldMutation, deleteOfficeMutation } = useMutateOffice();
  // ================================ ✅事業所・営業所リスト取得useQuery✅ ================================

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
    if (isMoved) return;
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
          // arrowIconAreaLeft.current.style.display = scrollLeftAfterEnd > 0 ? "flex" : "none";
          arrowIconAreaLeft.current.style.opacity = scrollLeftAfterEnd > 0 ? "1" : "0";
          arrowIconAreaLeft.current.style.pointerEvents = scrollLeftAfterEnd > 0 ? "auto" : "none";
          // 右アイコンエリア
          let maxScrollableWidth = rowRef.current.scrollWidth - rowRef.current.clientWidth;
          // arrowIconAreaRight.current.style.display = maxScrollableWidth > scrollLeftAfterEnd + 0 ? "flex" : "none";
          arrowIconAreaRight.current.style.opacity =
            Math.round(maxScrollableWidth) > Math.round(scrollLeftAfterEnd) ? "1" : "0";
          arrowIconAreaRight.current.style.pointerEvents =
            Math.round(maxScrollableWidth) > Math.round(scrollLeftAfterEnd) ? "auto" : "none";
          console.log(
            "scrollLeftAfterEnd",
            scrollLeftAfterEnd,
            "maxScrollableWidth",
            maxScrollableWidth,
            "maxScrollableWidth > scrollLeftAfterEnd ",
            maxScrollableWidth > scrollLeftAfterEnd
          );
          setIsMoved(false);
        }
        // }, 500);
      }, 680);
    }
  };
  // ====================== ✅事業部タグをボタンクリックで左右にスクロールする関数✅ ======================

  // ====================== 🌟選択した事業部でユニットを絞り込む関数🌟 ======================
  const [filteredUnitBySelectedDepartment, setFilteredUnitBySelectedDepartment] = useState<Unit[]>([]);

  useEffect(() => {
    // unitが存在せず、stateに要素が1つ以上存在しているなら空にする
    if (!unitDataArray && filteredUnitBySelectedDepartment.length >= 1) return setFilteredUnitBySelectedDepartment([]);
    // selectの選択中の事業部が空(全て)でunitDataArrayが存在しているならunitDataArrayをそのまま更新する
    if (!selectedDepartmentForUnit && unitDataArray) {
      setFilteredUnitBySelectedDepartment(unitDataArray);
      return;
    }
    // 選択中の事業部が変化するか、unitDataArrayの内容に変更があったら新たに絞り込んで更新する
    if (unitDataArray && selectedDepartmentForUnit) {
      const filteredUnitArray = unitDataArray.filter(
        (unit) => unit.created_by_department_id === selectedDepartmentForUnit.id
      );
      setFilteredUnitBySelectedDepartment(filteredUnitArray);
    }
  }, [selectedDepartmentForUnit, unitDataArray]);
  // ====================== ✅選択した事業部でユニットを絞り込む関数✅ ======================

  // ====================== 🌟係・チームタグをボタンクリックで左右にスクロールする関数🌟 ======================
  const rowUnitContainer = useRef<HTMLDivElement | null>(null);
  const rowUnitRef = useRef<HTMLDivElement | null>(null);
  const arrowIconUnitAreaLeft = useRef<HTMLDivElement | null>(null);
  const arrowIconUnitAreaRight = useRef<HTMLDivElement | null>(null);
  const [isMovedUnit, setIsMovedUnit] = useState(false);

  // rowグループが親コンテナの横幅を超えてなければ、矢印エリアは非表示にする
  useEffect(() => {
    if (
      !rowUnitContainer.current ||
      !rowUnitRef.current ||
      !arrowIconUnitAreaLeft.current ||
      !arrowIconUnitAreaRight.current
    )
      return;
    console.log(
      "横幅",
      // rowUnitRef.current.clientWidth,
      rowUnitRef.current.scrollWidth,
      rowUnitContainer.current.clientWidth,
      // rowUnitContainer.current.scrollWidth,
      rowUnitRef.current.scrollWidth < rowUnitContainer.current.clientWidth
      // rowUnitRef.current.getBoundingClientRect().width,
      // rowUnitContainer.current.getBoundingClientRect().width
    );
    console.log("left", rowUnitRef.current.scrollLeft);
    if (rowUnitRef.current.scrollWidth <= rowUnitContainer.current.clientWidth) {
      console.log("🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥Unit");
      rowUnitContainer.current.classList.add(`${styles.inactive}`);
      arrowIconUnitAreaLeft.current.style.opacity = "0";
      arrowIconUnitAreaLeft.current.style.pointerEvents = "none";
      arrowIconUnitAreaRight.current.style.opacity = "0";
      arrowIconUnitAreaRight.current.style.pointerEvents = "none";
    } else if (rowUnitRef.current.scrollWidth > rowUnitContainer.current.clientWidth) {
      console.log("✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅Unit");
      rowUnitContainer.current.classList.remove(`${styles.inactive}`);
      let maxScrollableWidth = rowUnitRef.current.scrollWidth - rowUnitRef.current.clientWidth;
      if (rowUnitRef.current.scrollLeft === 0) {
        console.log("✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅左端ならUnit");
        // 左端なら
        arrowIconUnitAreaRight.current.style.opacity = "1";
        arrowIconUnitAreaRight.current.style.pointerEvents = "auto";
      } else if (rowUnitRef.current.scrollLeft === maxScrollableWidth) {
        console.log("✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅右端ならUnit");
        // 右端なら
        arrowIconUnitAreaLeft.current.style.opacity = "1";
        arrowIconUnitAreaLeft.current.style.pointerEvents = "auto";
      } else {
        console.log("✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅右端ならUnit");
        // 真ん中なら
        arrowIconUnitAreaRight.current.style.opacity = "1";
        arrowIconUnitAreaRight.current.style.pointerEvents = "auto";
        arrowIconUnitAreaLeft.current.style.opacity = "1";
        arrowIconUnitAreaLeft.current.style.pointerEvents = "auto";
      }
    }
  }, [unitDataArray, editUnitMode, insertUnitMode, filteredUnitBySelectedDepartment]);

  const handleClickScrollUnit = (direction: string) => {
    if (isMovedUnit) return;
    if (rowUnitRef.current) {
      setIsMovedUnit(true);
      const { scrollLeft, clientWidth } = rowUnitRef.current;
      console.log("scrollLeft", scrollLeft);
      let scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      rowUnitRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });

      if (direction === "right" && arrowIconUnitAreaLeft?.current) {
        arrowIconUnitAreaLeft.current.style.opacity = "1";
        arrowIconUnitAreaLeft.current.style.pointerEvents = "auto";
      }
      if (direction === "left" && arrowIconUnitAreaRight?.current) {
        arrowIconUnitAreaRight.current.style.opacity = "1";
        arrowIconUnitAreaRight.current.style.pointerEvents = "auto";
      }
      setTimeout(() => {
        if (arrowIconUnitAreaLeft.current && rowUnitRef?.current && arrowIconUnitAreaRight.current) {
          const { scrollLeft: scrollLeftAfterEnd } = rowUnitRef.current;
          // 左アイコンエリア
          // arrowIconUnitAreaLeft.current.style.display = scrollLeftAfterEnd > 0 ? "flex" : "none";
          arrowIconUnitAreaLeft.current.style.opacity = scrollLeftAfterEnd > 0 ? "1" : "0";
          arrowIconUnitAreaLeft.current.style.pointerEvents = scrollLeftAfterEnd > 0 ? "auto" : "none";
          // 右アイコンエリア
          let maxScrollableWidth = rowUnitRef.current.scrollWidth - rowUnitRef.current.clientWidth;
          // arrowIconUnitAreaRight.current.style.display = maxScrollableWidth > scrollLeftAfterEnd + 0 ? "flex" : "none";
          arrowIconUnitAreaRight.current.style.opacity =
            Math.round(maxScrollableWidth) > Math.round(scrollLeftAfterEnd) ? "1" : "0";
          arrowIconUnitAreaRight.current.style.pointerEvents =
            Math.round(maxScrollableWidth) > Math.round(scrollLeftAfterEnd) ? "auto" : "none";
          console.log(
            "scrollLeftAfterEnd",
            scrollLeftAfterEnd,
            "maxScrollableWidth",
            maxScrollableWidth,
            "maxScrollableWidth > scrollLeftAfterEnd ",
            maxScrollableWidth > scrollLeftAfterEnd
          );
          setIsMovedUnit(false);
        }
        // }, 500);
      }, 680);
    }
  };
  // ====================== ✅事業部タグをボタンクリックで左右にスクロールする関数✅ ======================

  // ====================== 🌟事業所・営業所タグをボタンクリックで左右にスクロールする関数🌟 ======================
  const rowOfficeContainer = useRef<HTMLDivElement | null>(null);
  const rowOfficeRef = useRef<HTMLDivElement | null>(null);
  const arrowIconOfficeAreaLeft = useRef<HTMLDivElement | null>(null);
  const arrowIconOfficeAreaRight = useRef<HTMLDivElement | null>(null);
  const [isMovedOffice, setIsMovedOffice] = useState(false);

  // rowグループが親コンテナの横幅を超えてなければ、矢印エリアは非表示にする
  useEffect(() => {
    if (
      !rowOfficeContainer.current ||
      !rowOfficeRef.current ||
      !arrowIconOfficeAreaLeft.current ||
      !arrowIconOfficeAreaRight.current
    )
      return;
    console.log(
      "横幅",
      // rowOfficeRef.current.clientWidth,
      rowOfficeRef.current.scrollWidth,
      rowOfficeContainer.current.clientWidth,
      // rowOfficeContainer.current.scrollWidth,
      rowOfficeRef.current.scrollWidth < rowOfficeContainer.current.clientWidth
      // rowOfficeRef.current.getBoundingClientRect().width,
      // rowOfficeContainer.current.getBoundingClientRect().width
    );
    console.log("left", rowOfficeRef.current.scrollLeft);
    if (rowOfficeRef.current.scrollWidth <= rowOfficeContainer.current.clientWidth) {
      console.log("🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥");
      rowOfficeContainer.current.classList.add(`${styles.inactive}`);
      arrowIconOfficeAreaLeft.current.style.opacity = "0";
      arrowIconOfficeAreaLeft.current.style.pointerEvents = "none";
      arrowIconOfficeAreaRight.current.style.opacity = "0";
      arrowIconOfficeAreaRight.current.style.pointerEvents = "none";
    } else if (rowOfficeRef.current.scrollWidth > rowOfficeContainer.current.clientWidth) {
      console.log("✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅Office");
      rowOfficeContainer.current.classList.remove(`${styles.inactive}`);
      let maxScrollableWidth = rowOfficeRef.current.scrollWidth - rowOfficeRef.current.clientWidth;
      if (rowOfficeRef.current.scrollLeft === 0) {
        console.log("✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅左端ならOffice");
        // 左端なら
        arrowIconOfficeAreaRight.current.style.opacity = "1";
        arrowIconOfficeAreaRight.current.style.pointerEvents = "auto";
      } else if (rowOfficeRef.current.scrollLeft === maxScrollableWidth) {
        console.log("✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅右端ならOffice");
        // 右端なら
        arrowIconOfficeAreaLeft.current.style.opacity = "1";
        arrowIconOfficeAreaLeft.current.style.pointerEvents = "auto";
      } else {
        console.log("✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅右端ならOffice");
        // 真ん中なら
        arrowIconOfficeAreaRight.current.style.opacity = "1";
        arrowIconOfficeAreaRight.current.style.pointerEvents = "auto";
        arrowIconOfficeAreaLeft.current.style.opacity = "1";
        arrowIconOfficeAreaLeft.current.style.pointerEvents = "auto";
      }
    }
  }, [officeDataArray, editOfficeMode, insertOfficeMode]);

  const handleClickScrollOffice = (direction: string) => {
    if (isMovedOffice) return;
    if (rowOfficeRef.current) {
      setIsMovedOffice(true);
      const { scrollLeft, clientWidth } = rowOfficeRef.current;
      console.log("scrollLeft", scrollLeft);
      let scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      rowOfficeRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });

      if (direction === "right" && arrowIconOfficeAreaLeft?.current) {
        arrowIconOfficeAreaLeft.current.style.opacity = "1";
        arrowIconOfficeAreaLeft.current.style.pointerEvents = "auto";
      }
      if (direction === "left" && arrowIconOfficeAreaRight?.current) {
        arrowIconOfficeAreaRight.current.style.opacity = "1";
        arrowIconOfficeAreaRight.current.style.pointerEvents = "auto";
      }
      setTimeout(() => {
        if (arrowIconOfficeAreaLeft.current && rowOfficeRef?.current && arrowIconOfficeAreaRight.current) {
          const { scrollLeft: scrollLeftAfterEnd } = rowOfficeRef.current;
          // 左アイコンエリア
          // arrowIconOfficeAreaLeft.current.style.display = scrollLeftAfterEnd > 0 ? "flex" : "none";
          arrowIconOfficeAreaLeft.current.style.opacity = scrollLeftAfterEnd > 0 ? "1" : "0";
          arrowIconOfficeAreaLeft.current.style.pointerEvents = scrollLeftAfterEnd > 0 ? "auto" : "none";
          // 右アイコンエリア
          let maxScrollableWidth = rowOfficeRef.current.scrollWidth - rowOfficeRef.current.clientWidth;
          // arrowIconOfficeAreaRight.current.style.display = maxScrollableWidth > scrollLeftAfterEnd + 0 ? "flex" : "none";
          arrowIconOfficeAreaRight.current.style.opacity =
            Math.round(maxScrollableWidth) > Math.round(scrollLeftAfterEnd) ? "1" : "0";
          arrowIconOfficeAreaRight.current.style.pointerEvents =
            Math.round(maxScrollableWidth) > Math.round(scrollLeftAfterEnd) ? "auto" : "none";
          console.log(
            "scrollLeftAfterEnd",
            scrollLeftAfterEnd,
            "maxScrollableWidth",
            maxScrollableWidth,
            "maxScrollableWidth > scrollLeftAfterEnd ",
            maxScrollableWidth > scrollLeftAfterEnd
          );
          setIsMovedOffice(false);
        }
        // }, 500);
      }, 680);
    }
  };
  // ====================== ✅事業所・営業所タグをボタンクリックで左右にスクロールする関数✅ ======================

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
              !!departmentDataArray && departmentDataArray.length >= 1 ? `min-h-[115px]` : `min-h-[95px]`
            }`}
            // className={`mt-[20px] flex w-full flex-col ${true ? `min-h-[105px]` : `min-h-[95px]`}`}
          >
            {/* <div className={`${styles.section_title}`}>事業部</div> */}
            <div className="flex items-start space-x-4">
              <div className={`${styles.section_title}`}>事業部</div>
              {/* <div className={`flex flex-col text-[13px] text-[var(--color-text-brand-f)]`}> */}
              <div className={`flex flex-col text-[13px] text-[var(--color-text-sub)]`}>
                <p>※事業部を作成することで事業部ごとに商品、営業、売上データを管理できます。</p>
                {/* <p className="text-[var(--color-text-sub)]">
                  　(決算日(締め日含む)が未設定の場合は、デフォルトで期末が3月31日、期首が4月1日に設定されます。)
                </p> */}
              </div>
            </div>

            {/* 通常 */}
            {!editDepartmentMode && !insertDepartmentMode && (
              <div
                className={`flex h-full w-full items-center justify-between ${
                  !!departmentDataArray && departmentDataArray.length >= 1 ? `mt-[15px] min-h-[84px]` : `min-h-[74px]`
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
                      className={`${styles.row_group} scrollbar-hide mr-[50px] flex items-center space-x-[12px] overflow-x-scroll`}
                    >
                      {[...departmentDataArray]
                        .sort((a, b) => {
                          if (a.department_name === null) return 1; // null値をリストの最後に移動
                          if (b.department_name === null) return -1;
                          return a.department_name.localeCompare(b.department_name, language === "ja" ? "ja" : "en");
                        })
                        .map((departmentData, index) => (
                          <div
                            key={index}
                            className={`transition-bg03 flex h-[35px] min-h-[35px] min-w-max max-w-[150px] cursor-pointer select-none items-center justify-center space-x-2 rounded-full border border-solid border-[#d6dbe0] px-[18px] text-[14px] hover:border-[var(--color-bg-brand-f)] ${
                              selectedDepartment?.id === departmentData.id
                                ? `border-[var(--color-bg-brand-f)] bg-[var(--color-bg-brand-f)] text-[#fff]`
                                : `text-[var(--color-text-title)]`
                            }`}
                            onClick={() => {
                              if (selectedDepartment?.id === departmentData.id) return setSelectedDepartment(null);
                              setSelectedDepartment(departmentData);
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
                  {selectedDepartment !== null && !!departmentDataArray && (
                    <>
                      <div
                        className={`${styles.section_title} ${styles.delete} ${styles.delete_btn}`}
                        onClick={async () => {
                          setShowConfirmCancelModal(true);
                          // if (deleteDepartmentMutation.isLoading) return;
                          // if (invertFalsyExcludeZero(activeDepartmentTagIndex)) return;
                          // if (!departmentDataArray[activeDepartmentTagIndex]) return;
                          // if (!departmentDataArray[activeDepartmentTagIndex].id) return;

                          // await deleteDepartmentMutation.mutateAsync(departmentDataArray[activeDepartmentTagIndex].id);
                          // setSelectedDepartment(null);
                        }}
                      >
                        <span>削除</span>
                        {/* {!deleteDepartmentMutation.isLoading && <span>削除</span>} */}
                        {/* {deleteDepartmentMutation.isLoading && (
                          <div className="h-full w-full">
                            <SpinnerIDS3 fontSize={20} width={20} height={20} />
                          </div>
                        )} */}
                      </div>
                      <div
                        className={`transition-base01 min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] ${styles.section_title} ${styles.active} hover:bg-[var(--setting-side-bg-select-hover)]`}
                        onClick={() => {
                          if (deleteDepartmentMutation.isLoading) return;
                          // if (invertFalsyExcludeZero(activeDepartmentTagIndex)) return;
                          if (!selectedDepartment) return;
                          // if (!departmentDataArray[activeDepartmentTagIndex]) return;
                          const departmentPayload = {
                            id: selectedDepartment.id,
                            created_by_company_id: selectedDepartment.created_by_company_id,
                            department_name: selectedDepartment.department_name,
                          };
                          originalDepartmentNameRef.current = selectedDepartment.department_name;
                          console.log("departmentPayload", departmentPayload);
                          setEditedDepartment(departmentPayload);
                          setEditDepartmentMode(true);
                        }}
                      >
                        編集
                      </div>
                    </>
                  )}
                  {selectedDepartment === null && (
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
                      // const insertFieldPayload = {
                      //   _company_id_arg: userProfileState.company_id,
                      //   _department_name_arg: inputDepartmentName,
                      // };
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
                    if (!editedDepartment.department_name) return;
                    const newName = toHalfWidthAndSpace(editedDepartment.department_name.trim());
                    setEditedDepartment({ ...editedDepartment, department_name: newName });
                  }}
                />
                <div className="flex">
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer whitespace-nowrap rounded-[8px] bg-[var(--setting-side-bg-select)] px-[20px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      if (updateDepartmentFieldMutation.isLoading) return;
                      setEditedDepartment(null);
                      setEditDepartmentMode(false);
                      originalDepartmentNameRef.current = null;
                      setSelectedDepartment(null);
                    }}
                  >
                    キャンセル
                  </div>
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[20px] py-[10px] text-center ${
                      styles.save_section_title
                    } text-[#fff]  ${
                      updateDepartmentFieldMutation.isLoading ? `` : `hover:bg-[var(--color-bg-brand-f-deep)]`
                    }`}
                    onClick={async () => {
                      if (updateDepartmentFieldMutation.isLoading) return;
                      // 事業部の編集
                      if (!editedDepartment || editedDepartment.department_name === originalDepartmentNameRef.current) {
                        setEditedDepartment(null);
                        setEditDepartmentMode(false);
                        setSelectedDepartment(null);
                        return;
                      }

                      if (editedDepartment.department_name === "") return alert("事業部名を入力してください。");

                      const updateFieldPayload = {
                        fieldName: "department_name",
                        value: editedDepartment.department_name,
                        id: editedDepartment.id,
                      };

                      await updateDepartmentFieldMutation.mutateAsync(updateFieldPayload);

                      setEditedDepartment(null);
                      setEditDepartmentMode(false);
                      setSelectedDepartment(null);
                    }}
                  >
                    {!updateDepartmentFieldMutation.isLoading && <span>保存</span>}
                    {updateDepartmentFieldMutation.isLoading && (
                      <div className="relative h-full w-full">
                        <SpinnerIDS3 fontSize={20} width={20} height={20} color="#fff" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* 事業部ここまで */}

          <div className={`min-h-[1px] w-full bg-[var(--color-border-deep)]`}></div>

          {/* 係・チームリスト */}
          {/* <div className={`mt-[20px] flex min-h-[95px] w-full flex-col`}> */}
          <div
            className={`mt-[15px] flex w-full flex-col ${
              !!unitDataArray && unitDataArray.length >= 1 ? `min-h-[135px]` : `min-h-115px]`
              // !!unitDataArray && unitDataArray.length >= 1 ? `min-h-[105px]` : `min-h-[95px]`
            }`}
            // className={`mt-[20px] flex w-full flex-col ${true ? `min-h-[105px]` : `min-h-[95px]`}`}
          >
            {/* セクションタイトルエリア */}
            <div className="flex items-center space-x-4">
              <div className={`${styles.section_title} min-w-max`}>係・チーム</div>
              <div className={`flex space-x-[6px] text-[13px] text-[var(--color-text-brand-f)]`}>
                <select
                  className={`${styles.language_btn} ${styles.btn_common} transition-bg02`}
                  value={!!selectedDepartmentForUnit ? selectedDepartmentForUnit.id : ""}
                  onChange={(e) => {
                    if (!departmentDataArray) return;
                    // すべての事業部を閃t無くしてらnullで更新する
                    if (e.target.value === "") {
                      // if (!!originalUnitNameRef.current) {
                      //   originalUnitNameRef.current = {
                      //     ...originalUnitNameRef.current,
                      //     created_by_department_id: "",
                      //   };
                      // }
                      setSelectedDepartmentForUnit(null);
                      return;
                    }
                    const selectedDepartmentObj = departmentDataArray.find((obj) => obj.id === e.target.value);
                    console.log("e.target.value", e.target.value, "selectedDepartmentObj", selectedDepartmentObj);
                    if (selectedDepartmentObj === undefined)
                      return alert("エラー：事業部データの取得にエラーが発生しました。");
                    setSelectedDepartmentForUnit(selectedDepartmentObj);
                  }}
                >
                  {/* <option value="1">すべての事業部すべての事業部すべての事業部すべての事業部</option> */}
                  <option value="">すべての事業部</option>
                  {!!departmentDataArray &&
                    departmentDataArray.length >= 1 &&
                    [...departmentDataArray]
                      .sort((a, b) => {
                        if (a.department_name === null) return 1; // null値をリストの最後に移動
                        if (b.department_name === null) return -1;
                        return a.department_name.localeCompare(b.department_name, language === "ja" ? "ja" : "en");
                      })
                      .map((department, index) => (
                        <option key={department.id} value={department.id}>
                          {department.department_name}
                        </option>
                      ))}
                </select>
              </div>
              {/* <div className={`flex flex-col text-[13px] text-[var(--color-text-sub)]`}> */}
              {/* <div className={`flex flex-col text-[13px] text-[var(--color-text-brand-f)]`}>
                <p>※事業部内に係・チームを作成することで係単位で商品、営業、売上データを管理できます。</p>
              </div> */}
            </div>

            {/* 説明エリア */}
            {!insertUnitMode && !editUnitMode && (
              <div className="mt-[5px] flex items-start space-x-4 pl-[100px] text-[13px] text-[var(--color-text-sub)]">
                <p>※事業部内に係・チームを作成することで係単位で商品、営業、売上データを管理できます。</p>
              </div>
            )}
            {(insertUnitMode || editUnitMode) && (
              <div className="mt-[15px] flex items-start space-x-4 text-[13px] text-[var(--color-text-brand-f)]">
                <p>係・チームが属する事業部を選択してから係・チームを保存してください。</p>
              </div>
            )}

            {/* コンテンツエリア通常 */}
            {!editUnitMode && !insertUnitMode && (
              <div
                className={`flex h-full min-h-[59px] w-full items-start justify-between ${
                  !!unitDataArray && unitDataArray.length >= 1 ? `mb-[0px] mt-[24px]` : `mt-[15px] `
                }`}
                // className={`flex h-full min-h-[59px] w-full items-start justify-between ${
                //   true ? `mb-[0px] mt-[20px]` : `mt-[15px] `
                // }`}
                // className={`flex h-full min-h-[74px] w-full items-center justify-between ${
                //   !!unitDataArray && unitDataArray.length >= 1 && `mt-[20px]`
                // }`}
                // className={`flex h-full min-h-[74px] w-full items-center justify-between ${true && `mt-[10px]`}`}
              >
                {(!unitDataArray || unitDataArray.length === 0) && (
                  <div className={`${styles.section_value}`}>未設定</div>
                )}
                {/* mapメソッドで事業部タグリストを展開 */}
                {/* {true && ( */}
                {!!unitDataArray && unitDataArray.length >= 1 && (
                  <div
                    ref={rowUnitContainer}
                    className={`relative min-w-[calc(761px-78px-20px)] max-w-[calc(761px-78px-20px)] overflow-x-hidden ${styles.unit_tag_container}`}
                  >
                    {/* 左矢印エリア(シャドウあり) */}
                    <div
                      ref={arrowIconUnitAreaLeft}
                      className={`${styles.scroll_icon_area}`}
                      // style={{ ...(isMoved && { display: "none" }) }}
                    >
                      <div
                        className={`flex-center ${styles.scroll_icon}`}
                        onClick={() => !isMovedUnit && handleClickScrollUnit("left")}
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
                      ref={rowUnitRef}
                      className={`${styles.row_group} scrollbar-hide mr-[50px] flex items-center space-x-[12px] overflow-x-scroll `}
                    >
                      {
                        // [...unitDataArray]
                        [...filteredUnitBySelectedDepartment]
                          .sort((a, b) => {
                            if (a.unit_name === null) return 1; // null値をリストの最後に移動
                            if (b.unit_name === null) return -1;
                            return a.unit_name.localeCompare(b.unit_name, language === "ja" ? "ja" : "en");
                          })
                          .map((unitData, index) => (
                            <div
                              key={index}
                              className={`transition-bg03 flex h-[35px] min-h-[35px] min-w-max max-w-[150px] cursor-pointer select-none items-center justify-center space-x-2 rounded-full border border-solid border-[#d6dbe0] px-[18px] text-[14px] hover:border-[var(--color-bg-brand-f)] ${
                                selectedUnit?.id === unitData.id
                                  ? `border-[var(--color-bg-brand-f)] bg-[var(--color-bg-brand-f)] text-[#fff]`
                                  : `text-[var(--color-text-title)]`
                              }`}
                              onClick={() => {
                                if (selectedUnit?.id === unitData.id) return setSelectedUnit(null);
                                setSelectedUnit(unitData);
                              }}
                            >
                              <Image
                                // src="/assets/images/icons/business/icons8-businesswoman-94.png"
                                src={unitTagIcons[index % unitTagIcons.length].iconURL}
                                alt="tag"
                                className="ml-[-4px] w-[22px]"
                                width={22}
                                height={22}
                              />
                              <span className="truncate text-[13px]">{unitData.unit_name}</span>
                            </div>
                          ))
                      }
                      {/* テストデータ */}
                      {/* {Array(12)
                        .fill(null)
                        .map((_, index) => (
                          <div
                            key={index}
                            className="transition-bg03 flex h-[35px] min-h-[35px] min-w-max max-w-[150px] cursor-pointer select-none items-center justify-center space-x-2 rounded-full border border-solid border-[#d6dbe0] px-[18px] text-[14px] text-[var(--color-text-title)] hover:border-[var(--color-bg-brand-f)]"
                          >
                            <Image
                              src={unitTagIcons[index % unitTagIcons.length].iconURL}
                              alt="tag"
                              className="ml-[-4px] w-[22px]"
                              width={22}
                              height={22}
                            />
                            <span className="truncate text-[13px]">
                              {unitTagIcons[index % unitTagIcons.length].name}
                            </span>
                          </div>
                        ))} */}
                    </div>

                    {/* 右矢印エリア(シャドウあり) */}
                    <div ref={arrowIconUnitAreaRight} className={`${styles.scroll_icon_area}`}>
                      <div
                        className={`flex-center ${styles.scroll_icon} ${isMovedUnit && "opacity-0"}`}
                        onClick={() => !isMovedUnit && handleClickScrollUnit("right")}
                      >
                        <BsChevronRight className="text-[var(--color-text-title)]" />
                      </div>
                    </div>
                  </div>
                )}
                <div className={`relative`}>
                  {selectedUnit !== null && !!unitDataArray && (
                    <>
                      <div
                        className={`${styles.section_title} ${styles.delete} ${styles.delete_btn}`}
                        onClick={async () => {
                          // setShowConfirmCancelModal(true);
                          if (deleteUnitMutation.isLoading) return;
                          // if (invertFalsyExcludeZero(activeUnitTagIndex)) return;
                          if (!selectedUnit) return;
                          // if (!unitDataArray[activeUnitTagIndex]) return;
                          if (!selectedUnit.id) return;

                          await deleteUnitMutation.mutateAsync(selectedUnit.id);
                          setSelectedUnit(null);
                        }}
                      >
                        {!deleteUnitMutation.isLoading && <span>削除</span>}
                        {deleteUnitMutation.isLoading && (
                          <div className="h-full w-full">
                            <SpinnerIDS3 fontSize={20} width={20} height={20} />
                          </div>
                        )}
                      </div>
                      <div
                        className={`transition-base01 min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] ${styles.section_title} ${styles.active} hover:bg-[var(--setting-side-bg-select-hover)]`}
                        onClick={() => {
                          if (deleteUnitMutation.isLoading) return;
                          // if (invertFalsyExcludeZero(activeUnitTagIndex)) return;
                          if (!selectedUnit) return;
                          // if (!unitDataArray[activeUnitTagIndex]) return;
                          const unitPayload = {
                            id: selectedUnit.id,
                            created_by_company_id: selectedUnit.created_by_company_id,
                            created_by_department_id: selectedUnit.created_by_department_id,
                            unit_name: selectedUnit.unit_name,
                          };
                          // originalUnitNameRef.current = selectedUnit.unit_name;
                          originalUnitNameRef.current = selectedUnit;
                          console.log("unitPayload", unitPayload);
                          setEditedUnit(unitPayload);
                          setEditUnitMode(true);
                        }}
                      >
                        編集
                      </div>
                    </>
                  )}
                  {selectedUnit === null && (
                    <div
                      className={`transition-base01 min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                      onClick={() => {
                        setInsertUnitMode(true);
                      }}
                    >
                      追加
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* INSERT 新たに係・チームを作成するinputエリア */}
            {insertUnitMode && (
              <div className={`mt-[5px] flex h-full min-h-[59px] w-full items-start justify-between`}>
                <input
                  type="text"
                  placeholder="係・チーム名を入力してください"
                  required
                  autoFocus
                  className={`${styles.input_box}`}
                  value={inputUnitName}
                  onChange={(e) => setInputUnitName(e.target.value)}
                  onBlur={() => setInputUnitName(toHalfWidthAndSpace(inputUnitName.trim()))}
                />
                <div className="flex">
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer whitespace-nowrap rounded-[8px] bg-[var(--setting-side-bg-select)] px-[20px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      if (createUnitMutation.isLoading) return;
                      setInputUnitName("");
                      setInsertUnitMode(false);
                    }}
                  >
                    キャンセル
                  </div>
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[20px] py-[10px] text-center ${styles.save_section_title} text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`}
                    onClick={async () => {
                      if (createUnitMutation.isLoading) return;
                      // 事業部の編集
                      if (inputUnitName === "") {
                        setInputUnitName("");
                        setInsertUnitMode(false);
                        return;
                      }
                      if (!userProfileState?.company_id) {
                        alert("エラー：データが見つかりませんでした。");
                        setInputUnitName("");
                        setInsertUnitMode(false);
                        return;
                      }
                      if (!selectedDepartmentForUnit || !selectedDepartmentForUnit?.id) {
                        alert("係・チームが属する事業部を選択してください。");
                        return;
                      }

                      const insertFieldPayload = {
                        created_by_company_id: userProfileState.company_id,
                        created_by_department_id: selectedDepartmentForUnit.id,
                        unit_name: inputUnitName,
                      };
                      console.log("insertFieldPayload", insertFieldPayload);

                      await createUnitMutation.mutateAsync(insertFieldPayload);

                      setInputUnitName("");
                      setInsertUnitMode(false);
                      setSelectedDepartmentForUnit(null);
                    }}
                  >
                    {!createUnitMutation.isLoading && <span>保存</span>}
                    {createUnitMutation.isLoading && (
                      <div className="relative h-full w-full">
                        <SpinnerIDS3 fontSize={20} width={20} height={20} color="#fff" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* UPDATE/DELETE 既存の係・チームを編集、更新するinputエリア */}
            {editUnitMode && !!editedUnit && (
              <div className={`mt-[5px] flex h-full min-h-[59px] w-full items-start justify-between`}>
                <input
                  type="text"
                  placeholder="係・チーム名を入力してください"
                  required
                  autoFocus
                  className={`${styles.input_box}`}
                  value={editedUnit?.unit_name ? editedUnit.unit_name : ""}
                  onChange={(e) => setEditedUnit({ ...editedUnit, unit_name: e.target.value })}
                  onBlur={() => {
                    if (!editedUnit.unit_name) return;
                    const newName = toHalfWidthAndSpace(editedUnit.unit_name.trim());
                    setEditedUnit({ ...editedUnit, unit_name: newName });
                  }}
                />
                <div className="flex">
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer whitespace-nowrap rounded-[8px] bg-[var(--setting-side-bg-select)] px-[20px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      if (updateMultipleUnitFieldsMutation.isLoading) return;
                      setEditedUnit(null);
                      setEditUnitMode(false);
                      originalUnitNameRef.current = null;
                      setSelectedUnit(null);
                    }}
                  >
                    キャンセル
                  </div>
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[20px] py-[10px] text-center ${
                      styles.save_section_title
                    } text-[#fff]  ${
                      updateMultipleUnitFieldsMutation.isLoading ? `` : `hover:bg-[var(--color-bg-brand-f-deep)]`
                    }`}
                    onClick={async () => {
                      if (updateMultipleUnitFieldsMutation.isLoading) return;
                      // 事業部の編集
                      // if (!editedUnit || editedUnit.unit_name === originalUnitNameRef.current) {
                      if (
                        !editedUnit ||
                        (editedUnit.unit_name === originalUnitNameRef.current?.unit_name &&
                          editedUnit.created_by_department_id === selectedDepartmentForUnit?.id)
                      ) {
                        setEditedUnit(null);
                        setEditUnitMode(false);
                        setSelectedUnit(null);
                        return;
                      }
                      if (editedUnit.unit_name === "") return alert(`係・チーム名を入力してください。`);
                      if (
                        !selectedDepartmentForUnit ||
                        !selectedDepartmentForUnit?.id ||
                        (editedUnit.unit_name === originalUnitNameRef.current?.unit_name &&
                          selectedDepartmentForUnit === null)
                      )
                        return alert(`係・チームが属する事業部を選択してください。`);

                      // const updateFieldPayload = {
                      //   fieldName: "unit_name",
                      //   value: editedUnit.unit_name,
                      //   id: editedUnit.id,
                      // };
                      const updateObject = {
                        unit_name: editedUnit.unit_name,
                        created_by_department_id: selectedDepartmentForUnit.id,
                      };
                      const updateProductCategoryLargePayload = {
                        updateObject: updateObject,
                        id: editedUnit.id,
                      };

                      await updateMultipleUnitFieldsMutation.mutateAsync(updateProductCategoryLargePayload);

                      if (!!originalUnitNameRef.current?.id) {
                        originalUnitNameRef.current = {
                          ...originalUnitNameRef.current,
                          unit_name: editedUnit.unit_name,
                          created_by_department_id: selectedDepartmentForUnit.id,
                        };
                      }

                      setEditedUnit(null);
                      setEditUnitMode(false);
                      setSelectedUnit(null);
                    }}
                  >
                    {!updateMultipleUnitFieldsMutation.isLoading && <span>保存</span>}
                    {updateMultipleUnitFieldsMutation.isLoading && (
                      <div className="relative h-full w-full">
                        <SpinnerIDS3 fontSize={20} width={20} height={20} color="#fff" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* 係・チームここまで */}

          <div className={`min-h-[1px] w-full bg-[var(--color-border-deep)]`}></div>

          {/* 事業所・営業所リスト */}
          {/* <div className={`mt-[20px] flex min-h-[95px] w-full flex-col`}> */}
          <div
            // className={`mt-[20px] flex w-full flex-col ${
            //   !!officeDataArray && officeDataArray.length >= 1 ? `min-h-[105px]` : `min-h-[95px]`
            // }`}
            className={`mt-[20px] flex w-full flex-col ${
              !!officeDataArray && officeDataArray.length >= 1 ? `min-h-[115px]` : `min-h-[95px]`
            }`}
            // className={`mt-[20px] flex w-full flex-col ${true ? `min-h-[105px]` : `min-h-[95px]`}`}
          >
            {/* <div className={`${styles.section_title}`}>事業所・営業所</div> */}
            <div className="flex items-start space-x-4">
              <div className={`${styles.section_title}`}>事業所・営業所</div>
              {/* <div className={`flex flex-col text-[13px] text-[var(--color-text-brand-f)]`}> */}
              <div className={`flex flex-col text-[13px] text-[var(--color-text-sub)]`}>
                <p>※事業所・営業所を作成することで事業所ごとに商品、営業、売上データを管理できます。</p>
                {/* <p className="text-[var(--color-text-sub)]">
                  　(決算日(締め日含む)が未設定の場合は、デフォルトで期末が3月31日、期首が4月1日に設定されます。)
                </p> */}
              </div>
            </div>

            {/* 通常 */}
            {!editOfficeMode && !insertOfficeMode && (
              <div
                className={`flex h-full w-full items-center justify-between ${
                  !!officeDataArray && officeDataArray.length >= 1 ? `mt-[15px] min-h-[84px]` : `min-h-[74px]`
                }`}
                // className={`flex h-full min-h-[74px] w-full items-center justify-between ${
                //   !!officeDataArray && officeDataArray.length >= 1 ? `mt-[10px]` : ``
                // }`}
                // className={`flex h-full min-h-[74px] w-full items-center justify-between ${true && `mt-[10px]`}`}
              >
                {(!officeDataArray || officeDataArray.length === 0) && (
                  <div className={`${styles.section_value}`}>未設定</div>
                )}
                {/* mapメソッドで事業所・営業所タグリストを展開 */}
                {/* {true && ( */}
                {!!officeDataArray && officeDataArray.length >= 1 && (
                  <div
                    ref={rowOfficeContainer}
                    className={`relative min-w-[calc(761px-78px-20px)] max-w-[calc(761px-78px-20px)] overflow-x-hidden ${styles.office_tag_container}`}
                  >
                    {/* 左矢印エリア(シャドウあり) */}
                    <div
                      ref={arrowIconOfficeAreaLeft}
                      className={`${styles.scroll_icon_area}`}
                      // style={{ ...(isMovedOffice && { display: "none" }) }}
                    >
                      <div
                        className={`flex-center ${styles.scroll_icon}`}
                        onClick={() => !isMovedOffice && handleClickScrollOffice("left")}
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
                      ref={rowOfficeRef}
                      className={`${styles.row_group} scrollbar-hide mr-[50px] flex items-center space-x-[12px] overflow-x-scroll `}
                    >
                      {[...officeDataArray]
                        .sort((a, b) => {
                          if (a.office_name === null) return 1; // null値をリストの最後に移動
                          if (b.office_name === null) return -1;
                          return a.office_name.localeCompare(b.office_name, language === "ja" ? "ja" : "en");
                        })
                        .map((officeData, index) => (
                          <div
                            key={index}
                            className={`transition-bg03 flex h-[35px] min-h-[35px] min-w-max max-w-[150px] cursor-pointer select-none items-center justify-center space-x-2 rounded-full border border-solid border-[#d6dbe0] px-[18px] text-[14px] hover:border-[var(--color-bg-brand-f)] ${
                              selectedOffice?.id === officeData.id
                                ? `border-[var(--color-bg-brand-f)] bg-[var(--color-bg-brand-f)] text-[#fff]`
                                : `text-[var(--color-text-title)]`
                            }`}
                            onClick={() => {
                              if (selectedOffice?.id === officeData.id) return setSelectedOffice(null);
                              setSelectedOffice(officeData);
                            }}
                          >
                            <Image
                              // src="/assets/images/icons/business/icons8-businesswoman-94.png"
                              src={officeTagIcons[index % officeTagIcons.length].iconURL}
                              alt="tag"
                              className="ml-[-4px] w-[22px]"
                              width={22}
                              height={22}
                            />
                            <span className="truncate text-[13px]">{officeData.office_name}</span>
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
                              src={officeTagIcons[index % officeTagIcons.length].iconURL}
                              alt="tag"
                              className="ml-[-4px] w-[22px]"
                              width={22}
                              height={22}
                            />
                            <span className="truncate text-[13px]">
                              {officeTagIcons[index % officeTagIcons.length].name}
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
                                src={officeTagIcons[index % officeTagIcons.length].iconURL}
                                alt="tag"
                                className="ml-[-4px] w-[22px]"
                                width={22}
                                height={22}
                              />
                              <span className="truncate text-[13px]">
                                {officeTagIcons[index % officeTagIcons.length].name}
                              </span>
                            </div>
                          </div>
                        ))} */}
                    </div>

                    {/* 右矢印エリア(シャドウあり) */}
                    <div ref={arrowIconOfficeAreaRight} className={`${styles.scroll_icon_area}`}>
                      <div
                        className={`flex-center ${styles.scroll_icon} ${isMovedOffice && "opacity-0"}`}
                        onClick={() => !isMovedOffice && handleClickScrollOffice("right")}
                      >
                        <BsChevronRight className="text-[var(--color-text-title)]" />
                      </div>
                    </div>
                  </div>
                )}
                {/* {!!officeDataArray && officeDataArray.length >= 1 && (
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
                  {selectedOffice !== null && !!officeDataArray && (
                    <>
                      <div
                        className={`${styles.section_title} ${styles.delete} ${styles.delete_btn}`}
                        onClick={async () => {
                          if (deleteOfficeMutation.isLoading) return;
                          if (!selectedOffice) return;
                          if (!selectedOffice.id) return;

                          await deleteOfficeMutation.mutateAsync(selectedOffice.id);
                          setSelectedOffice(null);
                        }}
                      >
                        {!deleteOfficeMutation.isLoading && <span>削除</span>}
                        {deleteOfficeMutation.isLoading && (
                          <div className="h-full w-full">
                            <SpinnerIDS3 fontSize={20} width={20} height={20} />
                          </div>
                        )}
                      </div>
                      <div
                        className={`transition-base01 min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] ${styles.section_title} ${styles.active} hover:bg-[var(--setting-side-bg-select-hover)]`}
                        onClick={() => {
                          if (deleteOfficeMutation.isLoading) return;
                          // if (invertFalsyExcludeZero(activeOfficeTagIndex)) return;
                          if (!selectedOffice) return;
                          // if (!officeDataArray[activeOfficeTagIndex]) return;
                          const officePayload = {
                            id: selectedOffice.id,
                            created_by_company_id: selectedOffice.created_by_company_id,
                            office_name: selectedOffice.office_name,
                          };
                          originalOfficeNameRef.current = selectedOffice.office_name;
                          console.log("officePayload", officePayload);
                          setEditedOffice(officePayload);
                          setEditOfficeMode(true);
                        }}
                      >
                        編集
                      </div>
                    </>
                  )}
                  {selectedOffice === null && (
                    <div
                      className={`transition-base01 min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                      onClick={() => {
                        setInsertOfficeMode(true);
                      }}
                    >
                      追加
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* INSERT 新たに事業所・営業所を作成するinputエリア */}
            {insertOfficeMode && (
              <div className={`flex h-full min-h-[74px] w-full items-center justify-between`}>
                <input
                  type="text"
                  placeholder="事業所・営業所名を入力してください"
                  required
                  autoFocus
                  className={`${styles.input_box}`}
                  value={inputOfficeName}
                  onChange={(e) => setInputOfficeName(e.target.value)}
                  onBlur={() => setInputOfficeName(toHalfWidthAndSpace(inputOfficeName.trim()))}
                />
                <div className="flex">
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer whitespace-nowrap rounded-[8px] bg-[var(--setting-side-bg-select)] px-[20px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      if (createOfficeMutation.isLoading) return;
                      setInputOfficeName("");
                      setInsertOfficeMode(false);
                    }}
                  >
                    キャンセル
                  </div>
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[20px] py-[10px] text-center ${styles.save_section_title} text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`}
                    onClick={async () => {
                      if (createOfficeMutation.isLoading) return;
                      // 事業所・営業所の編集
                      if (inputOfficeName === "") {
                        setInputOfficeName("");
                        setInsertOfficeMode(false);
                        return;
                      }
                      if (!userProfileState?.company_id) {
                        alert("エラー：会社データが見つかりませんでした。");
                        setInputOfficeName("");
                        setInsertOfficeMode(false);
                        return;
                      }

                      const insertFieldPayload = {
                        created_by_company_id: userProfileState.company_id,
                        office_name: inputOfficeName,
                      };
                      console.log("insertFieldPayload", insertFieldPayload);

                      await createOfficeMutation.mutateAsync(insertFieldPayload);

                      setInputOfficeName("");
                      setInsertOfficeMode(false);
                    }}
                  >
                    {!createOfficeMutation.isLoading && <span>保存</span>}
                    {createOfficeMutation.isLoading && (
                      <div className="relative h-full w-full">
                        <SpinnerIDS3 fontSize={20} width={20} height={20} color="#fff" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* UPDATE/DELETE 既存の事業所・営業所を編集、更新するinputエリア */}
            {editOfficeMode && !!editedOffice && (
              <div className={`flex h-full min-h-[74px] w-full items-center justify-between`}>
                <input
                  type="text"
                  placeholder="事業所・営業所名を入力してください"
                  required
                  autoFocus
                  className={`${styles.input_box}`}
                  value={editedOffice?.office_name ? editedOffice.office_name : ""}
                  onChange={(e) => setEditedOffice({ ...editedOffice, office_name: e.target.value })}
                  onBlur={() => {
                    if (!editedOffice.office_name) return;
                    const newName = toHalfWidthAndSpace(editedOffice.office_name.trim());
                    setEditedOffice({ ...editedOffice, office_name: newName });
                  }}
                />
                <div className="flex">
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer whitespace-nowrap rounded-[8px] bg-[var(--setting-side-bg-select)] px-[20px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      if (updateOfficeFieldMutation.isLoading) return;
                      setEditedOffice(null);
                      setEditOfficeMode(false);
                      originalOfficeNameRef.current = null;
                      setSelectedOffice(null);
                    }}
                  >
                    キャンセル
                  </div>
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[20px] py-[10px] text-center ${
                      styles.save_section_title
                    } text-[#fff]  ${
                      updateOfficeFieldMutation.isLoading ? `` : `hover:bg-[var(--color-bg-brand-f-deep)]`
                    }`}
                    onClick={async () => {
                      if (updateOfficeFieldMutation.isLoading) return;
                      // 事業所・営業所の編集
                      if (!editedOffice || editedOffice.office_name === originalOfficeNameRef.current) {
                        setEditedOffice(null);
                        setEditOfficeMode(false);
                        setSelectedOffice(null);
                        return;
                      }

                      if (editedOffice.office_name === "") return alert("事業所・営業所名を入力してください。");

                      const updateFieldPayload = {
                        fieldName: "office_name",
                        value: editedOffice.office_name,
                        id: editedOffice.id,
                      };

                      await updateOfficeFieldMutation.mutateAsync(updateFieldPayload);

                      setEditedOffice(null);
                      setEditOfficeMode(false);
                      setSelectedOffice(null);
                    }}
                  >
                    {!updateOfficeFieldMutation.isLoading && <span>保存</span>}
                    {updateOfficeFieldMutation.isLoading && (
                      <div className="relative h-full w-full">
                        <SpinnerIDS3 fontSize={20} width={20} height={20} color="#fff" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* 事業所・拠点ここまで */}

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
      {/* ============================== チームから削除の確認モーダル ============================== */}
      {showConfirmCancelModal && selectedDepartment !== null && (
        <ConfirmationModal
          titleText="削除してもよろしいですか？"
          sectionP1="この操作を実行した後にキャンセルすることはできません。"
          sectionP2="注：この操作により、事業部に紐づく課・セクションや係・チーム・データも同時に削除されます。"
          cancelText="戻る"
          submitText="削除する"
          clickEventClose={() => {
            if (deleteDepartmentMutation.isLoading) return;
            setSelectedDepartment(null);
            setShowConfirmCancelModal(false);
          }}
          clickEventSubmit={async () => {
            if (selectedDepartment === null) return;
            if (!departmentDataArray) return;
            if (deleteDepartmentMutation.isLoading) return;
            // if (invertFalsyExcludeZero(activeDepartmentTagIndex)) return;
            if (!selectedDepartment) return;
            // if (!departmentDataArray[activeDepartmentTagIndex]) return;
            if (!selectedDepartment.id) return;

            await deleteDepartmentMutation.mutateAsync(selectedDepartment.id);
            setSelectedDepartment(null);
            setShowConfirmCancelModal(false);
          }}
          isLoadingState={deleteDepartmentMutation.isLoading}
        />
      )}
      {/* ============================== チームから削除の確認モーダルここまで ============================== */}
      {/* 右側メインエリア 会社・チーム ここまで */}
    </>
  );
};

export const SettingCompany = memo(SettingCompanyMemo);
