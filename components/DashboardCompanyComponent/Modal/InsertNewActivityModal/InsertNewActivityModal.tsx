import React, { useEffect, useState } from "react";
import styles from "./InsertNewActivityModal.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import { toast } from "react-toastify";
import useThemeStore from "@/store/useThemeStore";
import { isNaN } from "lodash";
import { useMutateActivity } from "@/hooks/useMutateActivity";
import productCategoriesM from "@/utils/productCategoryM";
import { DatePickerCustomInput } from "@/utils/DatePicker/DatePickerCustomInput";
import { SpinnerComet } from "@/components/Parts/SpinnerComet/SpinnerComet";
import { BsChevronLeft } from "react-icons/bs";
import { useQueryClient } from "@tanstack/react-query";
import { Department, Office, Unit } from "@/types";

export const InsertNewActivityModal = () => {
  const selectedRowDataContact = useDashboardStore((state) => state.selectedRowDataContact);
  const selectedRowDataActivity = useDashboardStore((state) => state.selectedRowDataActivity);
  const selectedRowDataMeeting = useDashboardStore((state) => state.selectedRowDataMeeting);
  const selectedRowDataProperty = useDashboardStore((state) => state.selectedRowDataProperty);
  const setIsOpenInsertNewActivityModal = useDashboardStore((state) => state.setIsOpenInsertNewActivityModal);
  // const [isLoading, setIsLoading] = useState(false);
  const loadingGlobalState = useDashboardStore((state) => state.loadingGlobalState);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  // const theme = useThemeStore((state) => state.theme);
  // 上画面の選択中の列データ会社
  // const selectedRowDataCompany = useDashboardStore((state) => state.selectedRowDataCompany);
  const userProfileState = useDashboardStore((state) => state.userProfileState);

  const initialDate = new Date();
  initialDate.setHours(0, 0, 0, 0);
  const year = initialDate.getFullYear(); // 例: 2023
  const month = initialDate.getMonth() + 1; // getMonth()は0から11で返されるため、+1して1から12に調整
  const activityYearMonthInitialValue = `${year}${month < 10 ? "0" + month : month}`; // 月が1桁の場合は先頭に0を追加
  // const [activityDate, setActivityDate] = useState<Date | null>(new Date());
  const [activityDate, setActivityDate] = useState<Date | null>(initialDate);
  const [summary, setSummary] = useState("");
  const [scheduledFollowUpDate, setScheduledFollowUpDate] = useState<Date | null>(null);
  const [followUpFlag, setFollowUpFlag] = useState(false);
  const [documentURL, setDocumentURL] = useState("");
  const [activityType, setActivityType] = useState("");
  const [claimFlag, setClaimFlag] = useState(false);
  const [productIntroduction1, setProductIntroduction1] = useState(null); //面談、案件、見積用
  const [productIntroduction2, setProductIntroduction2] = useState(null); //面談、案件、見積用
  const [productIntroduction3, setProductIntroduction3] = useState(null); //面談、案件、見積用
  const [productIntroduction4, setProductIntroduction4] = useState(null); //面談、案件、見積用
  const [productIntroduction5, setProductIntroduction5] = useState(null); //面談、案件、見積用
  // const [departmentName, setDepartmentName] = useState(
  //   userProfileState?.department ? userProfileState?.department : ""
  // );
  // const [businessOffice, setBusinessOffice] = useState("");
  const [departmentId, setDepartmentId] = useState<Department["id"] | null>(
    userProfileState?.assigned_department_id ? userProfileState?.assigned_department_id : null
  );
  const [unitId, setUnitId] = useState<Unit["id"] | null>(
    userProfileState?.assigned_unit_id ? userProfileState?.assigned_unit_id : null
  );
  const [officeId, setOfficeId] = useState<Office["id"] | null>(
    userProfileState?.assigned_office_id ? userProfileState?.assigned_office_id : null
  );
  const [memberName, setMemberName] = useState(userProfileState?.profile_name ? userProfileState?.profile_name : "");
  const [priority, setPriority] = useState("");
  const [activityYearMonth, setActivityYearMonth] = useState<number | null>(Number(activityYearMonthInitialValue));

  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();
  const { createActivityMutation } = useMutateActivity();

  // ================================ 🌟事業部、係、事業所リスト取得useQuery🌟 ================================
  const departmentDataArray: Department[] | undefined = queryClient.getQueryData(["departments"]);
  const unitDataArray: Unit[] | undefined = queryClient.getQueryData(["units"]);
  const officeDataArray: Office[] | undefined = queryClient.getQueryData(["offices"]);
  // ================================ ✅事業部、係、事業所リスト取得useQuery✅ ================================

  // useEffect(() => {
  //   if (!userProfileState) return;
  //   setMemberName(userProfileState.profile_name ? userProfileState.profile_name : "");
  //   setBusinessOffice(userProfileState.office ? userProfileState.office : "");
  //   setDepartmentName(userProfileState.department ? userProfileState.department : "");
  // }, []);

  // キャンセルでモーダルを閉じる
  const handleCancelAndReset = () => {
    if (loadingGlobalState) return;
    setIsOpenInsertNewActivityModal(false);
  };

  // 🌟担当者画面から活動を作成 担当者画面で選択したRowデータを使用する
  const handleSaveAndCloseFromContact = async () => {
    if (!summary) return alert("活動概要を入力してください");
    if (!activityType) return alert("活動タイプを選択してください");
    if (!userProfileState?.id) return alert("ユーザー情報が存在しません");
    if (!selectedRowDataContact?.company_id) return alert("相手先の会社情報が存在しません");
    if (!selectedRowDataContact?.contact_id) return alert("担当者情報が存在しません");

    setLoadingGlobalState(true);

    const departmentName =
      departmentDataArray &&
      departmentId &&
      departmentDataArray.find((obj) => obj.id === departmentId)?.department_name;
    const officeName = officeDataArray && officeId && officeDataArray.find((obj) => obj.id === officeId)?.office_name;

    // 新規作成するデータをオブジェクトにまとめる
    const newActivity = {
      created_by_company_id: userProfileState?.company_id ? userProfileState.company_id : null,
      created_by_user_id: userProfileState?.id ? userProfileState.id : null,
      // created_by_department_of_user: userProfileState.department ? userProfileState.department : null,
      // created_by_unit_of_user: userProfileState?.unit ? userProfileState.unit : null,
      created_by_department_of_user: departmentId ? departmentId : null,
      created_by_unit_of_user: unitId ? unitId : null,
      created_by_office_of_user: officeId ? officeId : null,
      client_contact_id: selectedRowDataContact.contact_id,
      client_company_id: selectedRowDataContact.company_id,
      summary: summary,
      scheduled_follow_up_date: scheduledFollowUpDate ? scheduledFollowUpDate.toISOString() : null,
      // follow_up_flag: followUpFlag ? followUpFlag : null,
      follow_up_flag: followUpFlag,
      document_url: null,
      activity_type: activityType ? activityType : null,
      // claim_flag: claimFlag ? claimFlag : null,
      claim_flag: claimFlag,
      product_introduction1: productIntroduction1 ? productIntroduction1 : null,
      product_introduction2: productIntroduction2 ? productIntroduction2 : null,
      product_introduction3: productIntroduction3 ? productIntroduction3 : null,
      product_introduction4: productIntroduction4 ? productIntroduction4 : null,
      product_introduction5: productIntroduction5 ? productIntroduction5 : null,
      // department: departmentName ? departmentName : null,
      // business_office: businessOffice ? businessOffice : null,
      department: departmentName ? departmentName : null,
      business_office: officeName ? officeName : null,
      member_name: memberName ? memberName : null,
      priority: priority ? priority : null,
      activity_date: activityDate ? activityDate.toISOString() : null,
      activity_year_month: activityYearMonth ? activityYearMonth : null,
      meeting_id: null,
      property_id: null,
      quotation_id: null,
    };

    // supabaseにINSERT,ローディング終了, モーダルを閉じる
    createActivityMutation.mutate(newActivity);

    // setLoadingGlobalState(false);

    // モーダルを閉じる
    // setIsOpenInsertNewActivityModal(false);
  };

  // 🌟活動画面から活動を作成 活動画面で選択したRowデータを使用する
  const handleSaveAndCloseFromActivity = async () => {
    if (!summary) return alert("活動概要を入力してください");
    if (!activityType) return alert("活動タイプを選択してください");
    if (!userProfileState?.id) return alert("ユーザー情報が存在しません");
    if (!selectedRowDataActivity?.company_id) return alert("相手先の会社情報が存在しません");
    if (!selectedRowDataActivity?.contact_id) return alert("担当者情報が存在しません");

    setLoadingGlobalState(true);

    const departmentName =
      departmentDataArray &&
      departmentId &&
      departmentDataArray.find((obj) => obj.id === departmentId)?.department_name;
    const officeName = officeDataArray && officeId && officeDataArray.find((obj) => obj.id === officeId)?.office_name;

    // 新規作成するデータをオブジェクトにまとめる
    const newActivity = {
      created_by_company_id: userProfileState?.company_id ? userProfileState.company_id : null,
      created_by_user_id: userProfileState?.id ? userProfileState.id : null,
      // created_by_department_of_user: userProfileState.department ? userProfileState.department : null,
      // created_by_unit_of_user: userProfileState?.unit ? userProfileState.unit : null,
      created_by_department_of_user: departmentId ? departmentId : null,
      created_by_unit_of_user: unitId ? unitId : null,
      created_by_office_of_user: officeId ? officeId : null,
      client_contact_id: selectedRowDataActivity.contact_id,
      client_company_id: selectedRowDataActivity.company_id,
      summary: summary ? summary : null,
      scheduled_follow_up_date: scheduledFollowUpDate ? scheduledFollowUpDate.toISOString() : null,
      // follow_up_flag: followUpFlag ? followUpFlag : null,
      follow_up_flag: followUpFlag,
      document_url: null,
      activity_type: activityType ? activityType : null,
      // claim_flag: claimFlag ? claimFlag : null,
      claim_flag: claimFlag,
      product_introduction1: productIntroduction1 ? productIntroduction1 : null,
      product_introduction2: productIntroduction2 ? productIntroduction2 : null,
      product_introduction3: productIntroduction3 ? productIntroduction3 : null,
      product_introduction4: productIntroduction4 ? productIntroduction4 : null,
      product_introduction5: productIntroduction5 ? productIntroduction5 : null,
      department: departmentName ? departmentName : null,
      business_office: officeName ? officeName : null,
      member_name: memberName ? memberName : null,
      priority: priority ? priority : null,
      activity_date: activityDate ? activityDate.toISOString() : null,
      activity_year_month: activityYearMonth ? activityYearMonth : null,
      meeting_id: null, //面談作成時用
      property_id: null, //案件作成時用
      quotation_id: null, //見積作成時用
    };

    // supabaseにINSERT,ローディング終了, モーダルを閉じる
    createActivityMutation.mutate(newActivity);

    // setLoadingGlobalState(false);
  };

  // 🌟面談画面から活動を作成 面談画面で選択したRowデータを使用する
  const handleSaveAndCloseFromMeeting = async () => {
    if (!summary) return alert("活動概要を入力してください");
    if (!activityType) return alert("活動タイプを選択してください");
    if (!userProfileState?.id) return alert("ユーザー情報が存在しません");
    if (!selectedRowDataMeeting?.company_id) return alert("相手先の会社情報が存在しません");
    if (!selectedRowDataMeeting?.contact_id) return alert("担当者情報が存在しません");

    setLoadingGlobalState(true);

    const departmentName =
      departmentDataArray &&
      departmentId &&
      departmentDataArray.find((obj) => obj.id === departmentId)?.department_name;
    const officeName = officeDataArray && officeId && officeDataArray.find((obj) => obj.id === officeId)?.office_name;

    // 新規作成するデータをオブジェクトにまとめる
    const newActivity = {
      created_by_company_id: userProfileState?.company_id ? userProfileState.company_id : null,
      created_by_user_id: userProfileState?.id ? userProfileState.id : null,
      // created_by_department_of_user: userProfileState.department ? userProfileState.department : null,
      // created_by_unit_of_user: userProfileState?.unit ? userProfileState.unit : null,
      created_by_department_of_user: departmentId ? departmentId : null,
      created_by_unit_of_user: unitId ? unitId : null,
      created_by_office_of_user: officeId ? officeId : null,
      client_contact_id: selectedRowDataMeeting.contact_id,
      client_company_id: selectedRowDataMeeting.company_id,
      summary: summary ? summary : null,
      scheduled_follow_up_date: scheduledFollowUpDate ? scheduledFollowUpDate.toISOString() : null,
      // follow_up_flag: followUpFlag ? followUpFlag : null,
      follow_up_flag: followUpFlag,
      document_url: null,
      activity_type: activityType ? activityType : null,
      // claim_flag: claimFlag ? claimFlag : null,
      claim_flag: claimFlag,
      product_introduction1: productIntroduction1 ? productIntroduction1 : null,
      product_introduction2: productIntroduction2 ? productIntroduction2 : null,
      product_introduction3: productIntroduction3 ? productIntroduction3 : null,
      product_introduction4: productIntroduction4 ? productIntroduction4 : null,
      product_introduction5: productIntroduction5 ? productIntroduction5 : null,
      department: departmentName ? departmentName : null,
      business_office: officeName ? officeName : null,
      member_name: memberName ? memberName : null,
      priority: priority ? priority : null,
      activity_date: activityDate ? activityDate.toISOString() : null,
      activity_year_month: activityYearMonth ? activityYearMonth : null,
      meeting_id: null, //面談作成時用
      property_id: null, //案件作成時用
      quotation_id: null, //見積作成時用
    };

    // supabaseにINSERT,ローディング終了, モーダルを閉じる
    createActivityMutation.mutate(newActivity);

    // setLoadingGlobalState(false);
  };

  // 🌟案件画面から活動を作成 案件画面で選択したRowデータを使用する
  const handleSaveAndCloseFromProperty = async () => {
    if (!summary) return alert("活動概要を入力してください");
    if (!activityType) return alert("活動タイプを選択してください");
    if (!userProfileState?.id) return alert("ユーザー情報が存在しません");
    if (!selectedRowDataProperty?.company_id) return alert("相手先の会社情報が存在しません");
    if (!selectedRowDataProperty?.contact_id) return alert("担当者情報が存在しません");

    setLoadingGlobalState(true);

    const departmentName =
      departmentDataArray &&
      departmentId &&
      departmentDataArray.find((obj) => obj.id === departmentId)?.department_name;
    const officeName = officeDataArray && officeId && officeDataArray.find((obj) => obj.id === officeId)?.office_name;

    // 新規作成するデータをオブジェクトにまとめる
    const newActivity = {
      created_by_company_id: userProfileState?.company_id ? userProfileState.company_id : null,
      created_by_user_id: userProfileState?.id ? userProfileState.id : null,
      // created_by_department_of_user: userProfileState.department ? userProfileState.department : null,
      // created_by_unit_of_user: userProfileState?.unit ? userProfileState.unit : null,
      created_by_department_of_user: departmentId ? departmentId : null,
      created_by_unit_of_user: unitId ? unitId : null,
      created_by_office_of_user: officeId ? officeId : null,
      client_contact_id: selectedRowDataProperty.contact_id,
      client_company_id: selectedRowDataProperty.company_id,
      summary: summary ? summary : null,
      scheduled_follow_up_date: scheduledFollowUpDate ? scheduledFollowUpDate.toISOString() : null,
      // follow_up_flag: followUpFlag ? followUpFlag : null,
      follow_up_flag: followUpFlag,
      document_url: null,
      activity_type: activityType ? activityType : null,
      // claim_flag: claimFlag ? claimFlag : null,
      claim_flag: claimFlag,
      product_introduction1: productIntroduction1 ? productIntroduction1 : null,
      product_introduction2: productIntroduction2 ? productIntroduction2 : null,
      product_introduction3: productIntroduction3 ? productIntroduction3 : null,
      product_introduction4: productIntroduction4 ? productIntroduction4 : null,
      product_introduction5: productIntroduction5 ? productIntroduction5 : null,
      department: departmentName ? departmentName : null,
      business_office: officeName ? officeName : null,
      member_name: memberName ? memberName : null,
      priority: priority ? priority : null,
      activity_date: activityDate ? activityDate.toISOString() : null,
      activity_year_month: activityYearMonth ? activityYearMonth : null,
      meeting_id: null, //面談作成時用
      property_id: null, //案件作成時用
      quotation_id: null, //見積作成時用
    };

    // supabaseにINSERT,ローディング終了, モーダルを閉じる
    createActivityMutation.mutate(newActivity);

    // setLoadingGlobalState(false);
  };

  // 全角文字を半角に変換する関数
  const toHalfWidth = (strVal: string) => {
    // 全角文字コードの範囲は65281 - 65374、スペースの全角文字コードは12288
    return strVal.replace(/[！-～]/g, (match) => {
      return String.fromCharCode(match.charCodeAt(0) - 0xfee0);
    });
    // .replace(/　/g, " "); // 全角スペースを半角スペースに
  };
  const toHalfWidthAndSpace = (strVal: string) => {
    // 全角文字コードの範囲は65281 - 65374、スペースの全角文字コードは12288
    return strVal
      .replace(/[！-～]/g, (match) => {
        return String.fromCharCode(match.charCodeAt(0) - 0xfee0);
      })
      .replace(/　/g, " "); // 全角スペースを半角スペースに
  };

  // 昭和や平成、令和の元号を西暦に変換する
  // const convertJapaneseEraToWesternYear = (value: string) => {
  //   const eraPatterns = [
  //     { era: "昭和", startYear: 1925 },
  //     { era: "平成", startYear: 1988 },
  //     { era: "令和", startYear: 2018 },
  //   ];

  //   for (let pattern of eraPatterns) {
  //     if (value.includes(pattern.era)) {
  //       const year = parseInt(value.replace(pattern.era, ""), 10);
  //       if (!isNaN(year)) {
  //         return pattern.startYear + year;
  //       }
  //     }
  //   }
  //   return value;
  // };

  type Era = "昭和" | "平成" | "令和";
  const eras = {
    昭和: 1925, // 昭和の開始年 - 1
    平成: 1988, // 平成の開始年 - 1
    令和: 2018, // 令和の開始年 - 1
  };
  // 昭和や平成、令和の元号を西暦に変換する 例："平成4年12月" を "1992年12月" に変換
  function matchEraToYear(value: string): string {
    const pattern = /(?<era>昭和|平成|令和)(?<year>\d+)(?:年)?(?<month>\d+)?/;
    const match = pattern.exec(value);

    if (!match) return value; // 元号の形式でなければ元の文字列をそのまま返す

    const era: Era = match.groups?.era as Era;
    const year = eras[era] + parseInt(match.groups?.year || "0", 10);
    const month = match.groups?.month ? `${match.groups?.month}月` : "";

    return `${year}年${month}`;
  }

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

  console.log(
    "活動作成モーダル selectedRowDataContact",
    selectedRowDataContact,
    "selectedRowDataActivity",
    selectedRowDataActivity
  );

  return (
    <>
      <div className={`${styles.overlay} `} onClick={handleCancelAndReset} />
      {/* {loadingGlobalState && (
        <div className={`${styles.loading_overlay} `}>
          <SpinnerIDS scale={"scale-[0.5]"} />
        </div>
      )} */}
      <div className={`${styles.container} fade03`}>
        {loadingGlobalState && (
          <div className={`${styles.loading_overlay_modal} `}>
            {/* <SpinnerIDS scale={"scale-[0.5]"} /> */}
            <SpinnerComet w="48px" h="48px" />
            {/* <SpinnerX w="w-[42px]" h="h-[42px]" /> */}
          </div>
        )}
        {/* 保存・タイトル・キャンセルエリア */}
        <div className="flex w-full  items-center justify-between whitespace-nowrap py-[10px] pb-[20px] text-center text-[18px]">
          {/* <div
            className="min-w-[150px] cursor-pointer select-none text-start font-semibold hover:text-[#aaa]"
            onClick={handleCancelAndReset}
          >
            キャンセル
          </div> */}
          <div className="relative min-w-[150px] text-start font-semibold">
            <div
              className="flex max-w-max cursor-pointer select-none items-center hover:text-[#aaa]"
              onClick={handleCancelAndReset}
            >
              <div className="h-full min-w-[20px]"></div>
              <BsChevronLeft className="z-1 absolute  left-[-15px] top-[50%] translate-y-[-50%] text-[24px]" />
              <span>戻る</span>
            </div>
          </div>
          <div className="min-w-[150px] select-none font-bold">活動 新規作成</div>
          {selectedRowDataContact && (
            <div
              className={`min-w-[150px] cursor-pointer text-end font-bold text-[var(--color-text-brand-f)] hover:text-[var(--color-text-brand-f-hover)] ${styles.save_text} select-none`}
              onClick={handleSaveAndCloseFromContact}
            >
              保存
            </div>
          )}
          {selectedRowDataActivity && (
            <div
              className={`min-w-[150px] cursor-pointer text-end font-bold text-[var(--color-text-brand-f)] hover:text-[var(--color-text-brand-f-hover)]  ${styles.save_text} select-none`}
              onClick={handleSaveAndCloseFromActivity}
            >
              保存
            </div>
          )}
          {selectedRowDataMeeting && (
            <div
              className={`min-w-[150px] cursor-pointer text-end font-bold text-[var(--color-text-brand-f)] hover:text-[var(--color-text-brand-f-hover)] ${styles.save_text} select-none`}
              onClick={handleSaveAndCloseFromMeeting}
            >
              保存
            </div>
          )}
          {selectedRowDataProperty && (
            <div
              className={`min-w-[150px] cursor-pointer text-end font-bold text-[var(--color-text-brand-f)] hover:text-[var(--color-text-brand-f-hover)] ${styles.save_text} select-none`}
              onClick={handleSaveAndCloseFromProperty}
            >
              保存
            </div>
          )}
        </div>

        <div className="min-h-[2px] w-full bg-[var(--color-bg-brand-f)]"></div>

        {/* メインコンテンツ コンテナ */}
        <div className={`${styles.main_contents_container}`}>
          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* 活動日 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px] ${styles.required_title}`}>●活動日</span>
                    <DatePickerCustomInput
                      startDate={activityDate}
                      setStartDate={setActivityDate}
                      fontSize="text-[15px]"
                      placeholderText="placeholder:text-[15px]"
                      py="py-[6px]"
                      minHeight="min-h-[32px]"
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* クレーム */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} ${styles.check_title}`}>クレーム</span>

                    <div className={`${styles.grid_select_cell_header}`}>
                      <input
                        type="checkbox"
                        className={`${styles.grid_select_cell_header_input}`}
                        checked={claimFlag}
                        onChange={() => setClaimFlag(!claimFlag)}
                      />
                      <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 右ラッパーここまで */}
            </div>
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* 活動タイプ */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px] ${styles.required_title}`}>●活動タイプ</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box} ${
                        !activityType ? `text-[#9ca3af]` : ``
                      }`}
                      value={activityType}
                      onChange={(e) => {
                        if (e.target.value === "") return alert("活動タイプを選択してください");
                        setActivityType(e.target.value);
                      }}
                    >
                      <option value="">※選択必須　選択してください</option>
                      <option value="TEL発信(不在)">TEL発信(不在)</option>
                      <option value="TEL発信(能動)">TEL発信(能動)</option>
                      <option value="TEL発信(受動)">TEL発信(受動)</option>
                      <option value="TEL発信(売前ﾌｫﾛｰ)">TEL発信(売前ﾌｫﾛｰ)</option>
                      <option value="TEL発信(売後ﾌｫﾛｰ)">TEL発信(売後ﾌｫﾛｰ)</option>
                      <option value="TEL発信(ｱﾎﾟ組み)">TEL発信(ｱﾎﾟ組み)</option>
                      <option value="TEL発信(その他)">TEL発信(その他)</option>
                      <option value="TEL受信(受動)">TEL受信(受動)</option>
                      <option value="TEL受信(問合せ)">TEL受信(問合せ)</option>
                      <option value="Email受信">Email受信</option>
                      <option value="Email送信">Email送信</option>
                      <option value="その他">その他</option>
                      <option value="引継ぎ">引継ぎ</option>
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 優先度 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>優先度</span>
                    <select
                      className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                    >
                      <option value=""></option>
                      <option value="高">高</option>
                      <option value="中">中</option>
                      <option value="低">低</option>
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 右ラッパーここまで */}
            </div>
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* 次回フォロー予定日 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} !min-w-[172px]`}>次回フォロー予定日</span>
                    <DatePickerCustomInput
                      startDate={scheduledFollowUpDate}
                      setStartDate={setScheduledFollowUpDate}
                      fontSize="text-[15px]"
                      placeholderText="placeholder:text-[15px]"
                      py="py-[6px]"
                      minHeight="min-h-[32px]"
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* フォロー完了フラグ */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} ${styles.check_title}`}>フォロー完了フラグ</span>

                    {scheduledFollowUpDate && (
                      <div className={`${styles.grid_select_cell_header}`}>
                        <input
                          type="checkbox"
                          className={`${styles.grid_select_cell_header_input}`}
                          checked={followUpFlag}
                          onChange={() => setFollowUpFlag(!followUpFlag)}
                        />
                        <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
            </div>
            {/* 右ラッパーここまで */}
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全部ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full flex-col`}>
            {/* 活動概要 */}
            <div className={`${styles.row_area} ${styles.text_area_xl} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full `}>
                  <span className={`${styles.title} !min-w-[140px]`}>活動概要</span>
                  <textarea
                    name="summary"
                    id="summary"
                    cols={30}
                    rows={10}
                    placeholder=""
                    className={`${styles.textarea_box}`}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                  ></textarea>
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>
          </div>
          {/* --------- 横幅全部ラッパーここまで --------- */}

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* 事業部名 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>事業部名</span>
                    {/* <input
                      type="text"
                      placeholder=""
                      required
                      className={`${styles.input_box}`}
                      value={departmentName}
                      onChange={(e) => setDepartmentName(e.target.value)}
                      // onBlur={() => setDepartmentName(toHalfWidth(departmentName.trim()))}
                    /> */}
                    <select
                      className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={departmentId ? departmentId : ""}
                      onChange={(e) => setDepartmentId(e.target.value)}
                    >
                      <option value=""></option>
                      {departmentDataArray &&
                        departmentDataArray.length >= 1 &&
                        departmentDataArray.map((department) => (
                          <option key={department.id} value={department.id}>
                            {department.department_name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>
            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 係・チーム */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} `}>係・チーム</span>
                    <select
                      className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box} ${styles.min}`}
                      value={unitId ? unitId : ""}
                      onChange={(e) => setUnitId(e.target.value)}
                    >
                      <option value=""></option>
                      {unitDataArray &&
                        unitDataArray.length >= 1 &&
                        unitDataArray.map((unit) => (
                          <option key={unit.id} value={unit.id}>
                            {unit.unit_name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
            </div>

            {/* 右ラッパーここまで */}
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* 所属事業所 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>所属事業所</span>
                    {/* <input
                      type="text"
                      placeholder=""
                      required
                      className={`${styles.input_box}`}
                      value={businessOffice}
                      onChange={(e) => setBusinessOffice(e.target.value)}
                      // onBlur={() => setDepartmentName(toHalfWidth(departmentName.trim()))}
                    /> */}
                    <select
                      className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={officeId ? officeId : ""}
                      onChange={(e) => setOfficeId(e.target.value)}
                    >
                      <option value=""></option>
                      {officeDataArray &&
                        officeDataArray.length >= 1 &&
                        officeDataArray.map((office) => (
                          <option key={office.id} value={office.id}>
                            {office.office_name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 自社担当 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>自社担当</span>
                    <input
                      type="text"
                      placeholder="*入力必須"
                      required
                      className={`${styles.input_box}`}
                      value={memberName}
                      onChange={(e) => setMemberName(e.target.value)}
                      // onBlur={() => setDepartmentName(toHalfWidth(departmentName.trim()))}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 右ラッパーここまで */}
            </div>
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* 活動年月度 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>活動年月度</span>
                    <input
                      type="number"
                      min="0"
                      className={`${styles.input_box}`}
                      placeholder='"202109" や "202312" などを入力'
                      value={activityYearMonth === null ? "" : activityYearMonth}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setActivityYearMonth(null);
                        } else {
                          const numValue = Number(val);

                          // 入力値がマイナスかチェック
                          if (numValue < 0) {
                            setActivityYearMonth(0);
                          } else {
                            setActivityYearMonth(numValue);
                          }
                        }
                      }}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 自社担当 */}
              {/* <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>自社担当</span>
                    <input
                      type="text"
                      placeholder="*入力必須"
                      required
                      className={`${styles.input_box}`}
                      value={memberName}
                      onChange={(e) => setMemberName(e.target.value)}
                      // onBlur={() => setDepartmentName(toHalfWidth(departmentName.trim()))}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div> */}
            </div>
            {/* 右ラッパーここまで */}
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* メインコンテンツ コンテナ ここまで */}
        </div>
      </div>
    </>
  );
};
