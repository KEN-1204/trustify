import React, { useEffect, useState } from "react";
import styles from "./InsertNewMeetingModal.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import { toast } from "react-toastify";
import useThemeStore from "@/store/useThemeStore";
import { isNaN } from "lodash";
import { useMutateMeeting } from "@/hooks/useMutateMeeting";
import productCategoriesM from "@/utils/productCategoryM";
import { DatePickerCustomInput } from "@/utils/DatePicker/DatePickerCustomInput";
import { MdClose } from "react-icons/md";
import { SpinnerComet } from "@/components/Parts/SpinnerComet/SpinnerComet";

export const InsertNewMeetingModal = () => {
  const selectedRowDataContact = useDashboardStore((state) => state.selectedRowDataContact);
  const selectedRowDataActivity = useDashboardStore((state) => state.selectedRowDataActivity);
  const selectedRowDataMeeting = useDashboardStore((state) => state.selectedRowDataMeeting);
  const setIsOpenInsertNewMeetingModal = useDashboardStore((state) => state.setIsOpenInsertNewMeetingModal);
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
  const meetingYearMonthInitialValue = `${year}${month < 10 ? "0" + month : month}`; // 月が1桁の場合は先頭に0を追加
  // const [MeetingDate, setMeetingDate] = useState<Date | null>(new Date());
  const [meetingType, setMeetingType] = useState("訪問");
  const [webTool, setWebTool] = useState("");
  const [plannedDate, setPlannedDate] = useState<Date | null>(initialDate);
  const [plannedStartTime, setPlannedStartTime] = useState<string>("");
  const [plannedStartTimeHour, setPlannedStartTimeHour] = useState<string>("");
  const [plannedStartTimeMinute, setPlannedStartTimeMinute] = useState<string>("");
  const [plannedPurpose, setPlannedPurpose] = useState("");
  const [plannedDuration, setPlannedDuration] = useState<number | null>(null);
  const [plannedAppointCheckFlag, setPlannedAppointCheckFlag] = useState(false);
  const [plannedProduct1, setPlannedProduct1] = useState("");
  const [plannedProduct2, setPlannedProduct2] = useState("");
  const [plannedComment, setPlannedComment] = useState("");
  const [resultDate, setResultDate] = useState<Date | null>(null);
  const [resultStartTime, setResultStartTime] = useState<string>("");
  const [resultStartTimeHour, setResultStartTimeHour] = useState<string>("");
  const [resultStartTimeMinute, setResultStartTimeMinute] = useState<string>("");
  const [resultEndTime, setResultEndTime] = useState<string>("");
  const [resultEndTimeHour, setResultEndTimeHour] = useState<string>("");
  const [resultEndTimeMinute, setResultEndTimeMinute] = useState<string>("");
  const [resultDuration, setResultDuration] = useState<number | null>(null);
  const [resultNumberOfMeetingParticipants, setResultNumberOfMeetingParticipants] = useState<number | null>(null);
  const [resultPresentationProduct1, setResultPresentationProduct1] = useState("");
  const [resultPresentationProduct2, setResultPresentationProduct2] = useState("");
  const [resultPresentationProduct3, setResultPresentationProduct3] = useState("");
  const [resultPresentationProduct4, setResultPresentationProduct4] = useState("");
  const [resultPresentationProduct5, setResultPresentationProduct5] = useState("");
  const [resultCategory, setResultCategory] = useState("");
  const [resultSummary, setResultSummary] = useState("");
  const [resultNegotiateDecisionMaker, setResultNegotiateDecisionMaker] = useState("");
  const [preMeetingParticipationRequest, setPreMeetingParticipationRequest] = useState("");
  const [meetingParticipationRequest, setMeetingParticipationRequest] = useState("");
  const [meetingBusinessOffice, setMeetingBusinessOffice] = useState(
    userProfileState?.office ? userProfileState.office : ""
  );
  const [meetingDepartment, setMeetingDepartment] = useState(
    userProfileState?.department ? userProfileState?.department : ""
  );
  const [meetingMemberName, setMeetingMemberName] = useState(
    userProfileState?.profile_name ? userProfileState.profile_name : ""
  );
  const [departmentName, setDepartmentName] = useState(userProfileState?.department ? userProfileState.department : "");
  const [meetingYearMonth, setMeetingYearMonth] = useState<number | null>(Number(meetingYearMonthInitialValue));

  const supabase = useSupabaseClient();
  const { createMeetingMutation } = useMutateMeeting();

  //   useEffect(() => {
  //     if (!userProfileState) return;
  //     setMeetingMemberName(userProfileState.profile_name ? userProfileState.profile_name : "");
  //     setMeetingBusinessOffice(userProfileState.office ? userProfileState.office : "");
  //     setMeetingDepartment(userProfileState.department ? userProfileState.department : "");
  //   }, []);

  // 予定面談開始時間、時間、分、結合用useEffect
  useEffect(() => {
    // const formattedTime = `${plannedStartTimeHour}:${plannedStartTimeMinute}`;
    // setPlannedStartTime(formattedTime);
    if (plannedStartTimeHour && plannedStartTimeMinute) {
      const formattedTime = `${plannedStartTimeHour}:${plannedStartTimeMinute}`;
      setPlannedStartTime(formattedTime);
    } else {
      setPlannedStartTime(""); // or setResultStartTime('');
    }
  }, [plannedStartTimeHour, plannedStartTimeMinute]);
  // 結果面談開始時間、時間、分、結合用useEffect
  useEffect(() => {
    // const formattedTime = `${resultStartTimeHour}:${resultStartTimeMinute}`;
    // setResultStartTime(formattedTime);
    if (resultStartTimeHour && resultStartTimeMinute) {
      const formattedTime = `${resultStartTimeHour}:${resultStartTimeMinute}`;
      setResultStartTime(formattedTime);
    } else {
      setResultStartTime(""); // or setResultStartTime('');
    }
  }, [resultStartTimeHour, resultStartTimeMinute]);
  // 結果面談終了時間、時間、分、結合用useEffect
  useEffect(() => {
    // const formattedTime = `${resultEndTimeHour}:${resultEndTimeMinute}`;
    // setResultEndTime(formattedTime);
    if (resultEndTimeHour && resultEndTimeMinute) {
      const formattedTime = `${resultEndTimeHour}:${resultEndTimeMinute}`;
      setResultEndTime(formattedTime);
    } else {
      setResultEndTime(""); // or setResultStartTime('');
    }
  }, [resultEndTimeHour, resultEndTimeMinute]);

  // キャンセルでモーダルを閉じる
  const handleCancelAndReset = () => {
    if (loadingGlobalState) return;
    setIsOpenInsertNewMeetingModal(false);
  };
  const handleSaveAndClose = async () => {
    // if (!summary) return alert("活動概要を入力してください");
    // if (!MeetingType) return alert("活動タイプを選択してください");
    if (!userProfileState?.id) return alert("ユーザー情報が存在しません");
    if (!selectedRowDataActivity?.company_id) return alert("相手先の会社情報が存在しません");
    if (!selectedRowDataActivity?.contact_id) return alert("担当者情報が存在しません");
    if (plannedPurpose === "") return alert("訪問目的を選択してください");
    if (plannedStartTimeHour === "") return alert("面談開始 時間を選択してください");
    if (plannedStartTimeMinute === "") return alert("面談開始 分を選択してください");
    if (!meetingYearMonth) return alert("活動年月度を入力してください");
    if (meetingMemberName === "") return alert("自社担当を入力してください");

    setLoadingGlobalState(true);

    // 新規作成するデータをオブジェクトにまとめる
    const newMeeting = {
      created_by_company_id: userProfileState?.company_id ? userProfileState.company_id : null,
      created_by_user_id: userProfileState?.id ? userProfileState.id : null,
      created_by_department_of_user: userProfileState.department ? userProfileState.department : null,
      created_by_unit_of_user: userProfileState?.unit ? userProfileState.unit : null,
      client_contact_id: selectedRowDataActivity.contact_id,
      client_company_id: selectedRowDataActivity.company_id,
      meeting_type: meetingType,
      web_tool: webTool,
      planned_date: plannedDate ? plannedDate.toISOString() : null,
      // planned_start_time: plannedStartTime === ":" ? null : plannedStartTime,
      planned_start_time: plannedStartTime === "" ? null : plannedStartTime,
      planned_purpose: plannedPurpose,
      planned_duration: plannedDuration,
      planned_appoint_check_flag: plannedAppointCheckFlag,
      planned_product1: plannedProduct1,
      planned_product2: plannedProduct2,
      planned_comment: plannedComment,
      result_date: resultDate ? resultDate.toISOString() : null,
      result_start_time: resultStartTime === "" ? null : resultStartTime,
      result_end_time: resultEndTime === "" ? null : resultEndTime,
      // result_start_time: resultStartTime === ":" ? null : resultStartTime,
      // result_end_time: resultEndTime === ":" ? null : resultEndTime,
      result_duration: resultDuration,
      result_number_of_meeting_participants: resultNumberOfMeetingParticipants,
      result_presentation_product1: resultPresentationProduct1,
      result_presentation_product2: resultPresentationProduct2,
      result_presentation_product3: resultPresentationProduct3,
      result_presentation_product4: resultPresentationProduct4,
      result_presentation_product5: resultPresentationProduct5,
      result_category: resultCategory,
      result_summary: resultSummary,
      result_negotiate_decision_maker: resultNegotiateDecisionMaker,
      pre_meeting_participation_request: preMeetingParticipationRequest,
      meeting_participation_request: meetingParticipationRequest,
      meeting_business_office: meetingBusinessOffice,
      meeting_department: meetingDepartment ? meetingDepartment : null,
      meeting_member_name: meetingMemberName ? meetingMemberName : null,
      meeting_year_month: meetingYearMonth ? meetingYearMonth : null,
    };

    console.log("面談予定 新規作成 newMeeting", newMeeting);
    console.log("面談予定 新規作成 newMeeting.planned_start_time", newMeeting.planned_start_time);
    console.log(
      "面談予定 新規作成 newMeeting.planned_start_time 一致するか",
      newMeeting.planned_start_time === "08:30"
    );

    // supabaseにINSERT,ローディング終了, モーダルを閉じる
    createMeetingMutation.mutate(newMeeting);

    // setLoadingGlobalState(false);

    // モーダルを閉じる
    // setIsOpenInsertNewMeetingModal(false);
  };

  const handleSaveAndCloseFromMeeting = async () => {
    // if (!summary) return alert("活動概要を入力してください");
    // if (!MeetingType) return alert("活動タイプを選択してください");
    if (!userProfileState?.id) return alert("ユーザー情報が存在しません");
    if (!selectedRowDataMeeting?.company_id) return alert("相手先の会社情報が存在しません");
    if (!selectedRowDataMeeting?.contact_id) return alert("担当者情報が存在しません");
    if (plannedPurpose === "") return alert("訪問目的を選択してください");
    if (plannedStartTimeHour === "") return alert("面談開始 時間を選択してください");
    if (plannedStartTimeMinute === "") return alert("面談開始 分を選択してください");
    if (!meetingYearMonth) return alert("活動年月度を入力してください");
    if (meetingMemberName === "") return alert("自社担当を入力してください");

    setLoadingGlobalState(true);

    // 新規作成するデータをオブジェクトにまとめる
    const newMeeting = {
      created_by_company_id: userProfileState?.company_id ? userProfileState.company_id : null,
      created_by_user_id: userProfileState?.id ? userProfileState.id : null,
      created_by_department_of_user: userProfileState.department ? userProfileState.department : null,
      created_by_unit_of_user: userProfileState?.unit ? userProfileState.unit : null,
      client_contact_id: selectedRowDataMeeting.contact_id,
      client_company_id: selectedRowDataMeeting.company_id,
      meeting_type: meetingType,
      web_tool: webTool,
      planned_date: plannedDate ? plannedDate.toISOString() : null,
      // planned_start_time: plannedStartTime === ":" ? null : plannedStartTime,
      planned_start_time: plannedStartTime === "" ? null : plannedStartTime,
      planned_purpose: plannedPurpose,
      planned_duration: plannedDuration,
      planned_appoint_check_flag: plannedAppointCheckFlag,
      planned_product1: plannedProduct1,
      planned_product2: plannedProduct2,
      planned_comment: plannedComment,
      result_date: resultDate ? resultDate.toISOString() : null,
      result_start_time: resultStartTime === "" ? null : resultStartTime,
      result_end_time: resultEndTime === "" ? null : resultEndTime,
      // result_start_time: resultStartTime === ":" ? null : resultStartTime,
      // result_end_time: resultEndTime === ":" ? null : resultEndTime,
      result_duration: resultDuration,
      result_number_of_meeting_participants: resultNumberOfMeetingParticipants,
      result_presentation_product1: resultPresentationProduct1,
      result_presentation_product2: resultPresentationProduct2,
      result_presentation_product3: resultPresentationProduct3,
      result_presentation_product4: resultPresentationProduct4,
      result_presentation_product5: resultPresentationProduct5,
      result_category: resultCategory,
      result_summary: resultSummary,
      result_negotiate_decision_maker: resultNegotiateDecisionMaker,
      pre_meeting_participation_request: preMeetingParticipationRequest,
      meeting_participation_request: meetingParticipationRequest,
      meeting_business_office: meetingBusinessOffice,
      meeting_department: meetingDepartment ? meetingDepartment : null,
      meeting_member_name: meetingMemberName ? meetingMemberName : null,
      meeting_year_month: meetingYearMonth ? meetingYearMonth : null,
    };

    console.log("面談予定 新規作成 newMeeting", newMeeting);
    console.log("面談予定 新規作成 newMeeting.planned_start_time", newMeeting.planned_start_time);
    console.log(
      "面談予定 新規作成 newMeeting.planned_start_time 一致するか",
      newMeeting.planned_start_time === "08:30"
    );

    // supabaseにINSERT,ローディング終了, モーダルを閉じる
    createMeetingMutation.mutate(newMeeting);

    // setLoadingGlobalState(false);

    // モーダルを閉じる
    // setIsOpenInsertNewMeetingModal(false);
  };

  const handleSaveAndCloseFromContacts = async () => {
    // if (!summary) return alert("活動概要を入力してください");
    // if (!MeetingType) return alert("活動タイプを選択してください");
    if (!userProfileState?.id) return alert("ユーザー情報が存在しません");
    if (!selectedRowDataContact?.company_id) return alert("相手先の会社情報が存在しません");
    if (!selectedRowDataContact?.contact_id) return alert("担当者情報が存在しません");
    if (plannedPurpose === "") return alert("訪問目的を選択してください");
    if (plannedStartTimeHour === "") return alert("面談開始 時間を選択してください");
    if (plannedStartTimeMinute === "") return alert("面談開始 分を選択してください");
    if (!meetingYearMonth) return alert("活動年月度を入力してください");
    if (meetingMemberName === "") return alert("自社担当を入力してください");

    setLoadingGlobalState(true);

    // 新規作成するデータをオブジェクトにまとめる
    const newMeeting = {
      created_by_company_id: userProfileState?.company_id ? userProfileState.company_id : null,
      created_by_user_id: userProfileState?.id ? userProfileState.id : null,
      created_by_department_of_user: userProfileState.department ? userProfileState.department : null,
      created_by_unit_of_user: userProfileState?.unit ? userProfileState.unit : null,
      client_contact_id: selectedRowDataContact.contact_id,
      client_company_id: selectedRowDataContact.company_id,
      meeting_type: meetingType,
      web_tool: webTool,
      planned_date: plannedDate ? plannedDate.toISOString() : null,
      // planned_start_time: plannedStartTime === ":" ? null : plannedStartTime,
      planned_start_time: plannedStartTime === "" ? null : plannedStartTime,
      planned_purpose: plannedPurpose,
      planned_duration: plannedDuration,
      planned_appoint_check_flag: plannedAppointCheckFlag,
      planned_product1: plannedProduct1,
      planned_product2: plannedProduct2,
      planned_comment: plannedComment,
      result_date: resultDate ? resultDate.toISOString() : null,
      result_start_time: resultStartTime === "" ? null : resultStartTime,
      result_end_time: resultEndTime === "" ? null : resultEndTime,
      // result_start_time: resultStartTime === ":" ? null : resultStartTime,
      // result_end_time: resultEndTime === ":" ? null : resultEndTime,
      result_duration: resultDuration,
      result_number_of_meeting_participants: resultNumberOfMeetingParticipants,
      result_presentation_product1: resultPresentationProduct1,
      result_presentation_product2: resultPresentationProduct2,
      result_presentation_product3: resultPresentationProduct3,
      result_presentation_product4: resultPresentationProduct4,
      result_presentation_product5: resultPresentationProduct5,
      result_category: resultCategory,
      result_summary: resultSummary,
      result_negotiate_decision_maker: resultNegotiateDecisionMaker,
      pre_meeting_participation_request: preMeetingParticipationRequest,
      meeting_participation_request: meetingParticipationRequest,
      meeting_business_office: meetingBusinessOffice,
      meeting_department: meetingDepartment ? meetingDepartment : null,
      meeting_member_name: meetingMemberName ? meetingMemberName : null,
      meeting_year_month: meetingYearMonth ? meetingYearMonth : null,
    };

    console.log("面談予定 新規作成 newMeeting", newMeeting);
    console.log("面談予定 新規作成 newMeeting.planned_start_time", newMeeting.planned_start_time);
    console.log(
      "面談予定 新規作成 newMeeting.planned_start_time 一致するか",
      newMeeting.planned_start_time === "08:30"
    );

    // supabaseにINSERT,ローディング終了, モーダルを閉じる
    createMeetingMutation.mutate(newMeeting);

    // setLoadingGlobalState(false);

    // モーダルを閉じる
    // setIsOpenInsertNewMeetingModal(false);
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

  const hours = Array.from({ length: 24 }, (_, index) => (index < 10 ? "0" + index : "" + index));
  const minutes5 = Array.from({ length: 12 }, (_, index) => (index * 5 < 10 ? "0" + index * 5 : "" + index * 5));
  const minutes = Array.from({ length: 60 }, (_, i) => (i < 10 ? "0" + i : "" + i));

  console.log(
    "面談予定作成モーダル selectedRowDataActivity",
    selectedRowDataActivity,
    "selectedRowDataMeeting",
    selectedRowDataMeeting,
    "plannedStartTime",
    plannedStartTime
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
          <div
            className="min-w-[150px] cursor-pointer text-start font-semibold hover:text-[#aaa]"
            onClick={handleCancelAndReset}
          >
            キャンセル
          </div>
          <div className="min-w-[150px] font-bold">面談予定 新規作成</div>

          {selectedRowDataActivity && (
            <div
              className={`min-w-[150px] cursor-pointer text-end font-bold text-[var(--color-text-brand-f)] hover:text-[var(--color-text-brand-f-hover)] ${styles.save_text}`}
              onClick={handleSaveAndClose}
            >
              保存
            </div>
          )}
          {selectedRowDataMeeting && (
            <div
              className={`min-w-[150px] cursor-pointer text-end font-bold text-[var(--color-text-brand-f)] hover:text-[var(--color-text-brand-f-hover)] ${styles.save_text}`}
              onClick={handleSaveAndCloseFromMeeting}
            >
              保存
            </div>
          )}
          {selectedRowDataContact && (
            <div
              className={`min-w-[150px] cursor-pointer text-end font-bold text-[var(--color-text-brand-f)] hover:text-[var(--color-text-brand-f-hover)] ${styles.save_text}`}
              onClick={handleSaveAndCloseFromContacts}
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
              {/* ●面談日 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px] ${styles.required_title}`}>●面談日</span>
                    <DatePickerCustomInput
                      startDate={plannedDate}
                      setStartDate={setPlannedDate}
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
              {/* ●面談タイプ */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px] ${styles.required_title}`}>●面談タイプ</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={meetingType}
                      onChange={(e) => {
                        setMeetingType(e.target.value);
                      }}
                    >
                      {/* <option value=""></option> */}
                      <option value="訪問">訪問</option>
                      <option value="WEB">WEB</option>
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
              {/* 面談開始 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px] ${styles.required_title}`}>●面談開始</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      placeholder="時"
                      value={plannedStartTimeHour}
                      onChange={(e) => setPlannedStartTimeHour(e.target.value === "" ? "" : e.target.value)}
                    >
                      <option value=""></option>
                      {hours.map((hour) => (
                        <option key={hour} value={hour}>
                          {hour}
                        </option>
                      ))}
                    </select>

                    <span className="mx-[10px]">時</span>

                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      placeholder="分"
                      value={plannedStartTimeMinute}
                      onChange={(e) => setPlannedStartTimeMinute(e.target.value === "" ? "" : e.target.value)}
                    >
                      <option value=""></option>
                      {minutes5.map((minute) => (
                        <option key={minute} value={minute}>
                          {minute}
                        </option>
                      ))}
                    </select>
                    <span className="mx-[10px]">分</span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* WEBツール */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>WEBツール</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={webTool}
                      onChange={(e) => {
                        setWebTool(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      <option value="Zoom">Zoom</option>
                      <option value="Teams">Teams</option>
                      <option value="Google Meet">Google Meet</option>
                      <option value="Webex">Webex</option>
                      <option value="Skype">Skype</option>
                      <option value="bellFace">bellFace</option>
                      <option value="その他">その他</option>
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
              {/* 同席依頼 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>事前同席依頼</span>
                    <select
                      name="number_of_employees_class"
                      id="number_of_employees_class"
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={preMeetingParticipationRequest}
                      onChange={(e) => {
                        if (e.target.value === "") return alert("活動タイプを選択してください");
                        setPreMeetingParticipationRequest(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      <option value="同席依頼無し">同席依頼無し</option>
                      <option value="同席依頼済み 承諾無し">同席依頼済み 承諾無し</option>
                      <option value="同席依頼済み 承諾有り">同席依頼済み 承諾有り</option>
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 面談時間(分) */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>面談時間(分)</span>
                    <input
                      type="number"
                      min="0"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={plannedDuration === null ? "" : plannedDuration}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setPlannedDuration(null);
                        } else {
                          const numValue = Number(val);

                          // 入力値がマイナスかチェック
                          if (numValue < 0) {
                            setPlannedDuration(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                          } else {
                            setPlannedDuration(numValue);
                          }
                        }
                      }}
                    />
                    {/* バツボタン */}
                    {plannedDuration !== null && plannedDuration !== 0 && (
                      <div className={`${styles.close_btn_number}`} onClick={() => setPlannedDuration(null)}>
                        <MdClose className="text-[20px] " />
                      </div>
                    )}
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
              {/* ●訪問目的 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} !min-w-[140px] ${styles.required_title}`}>●訪問目的</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={plannedPurpose}
                      onChange={(e) => {
                        // if (e.target.value === "") return alert("訪問目的を選択してください");
                        setPlannedPurpose(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      <option value="新規会社(過去面談無し)/能動">新規会社(過去面談無し)/能動</option>
                      <option value="被り会社(過去面談有り)/能動">被り会社(過去面談有り)/能動</option>
                      <option value="社内ID/能動">社内ID/能動</option>
                      <option value="社外･客先ID/能動">社外･客先ID/能動</option>
                      <option value="営業メール/受動">営業メール/能動</option>
                      <option value="見･聞引合/受動">見･聞引合/受動</option>
                      <option value="DM/受動">DM/受動</option>
                      <option value="メール/受動">メール/受動</option>
                      <option value="ホームページ/受動">ホームページ/受動</option>
                      <option value="ウェビナー/受動">ウェビナー/受動</option>
                      <option value="展示会/受動">展示会/受動</option>
                      <option value="他(売前ﾌｫﾛｰ)">他(売前ﾌｫﾛｰ)</option>
                      <option value="他(納品説明)">他(納品説明)</option>
                      <option value="他(客先要望サポート)">他(客先要望サポート)</option>
                      <option value="その他">その他</option>
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* アポ有 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} ${styles.check_title} !min-w-[140px]`}>アポ有</span>
                    <div className={`${styles.grid_select_cell_header}`}>
                      <input
                        type="checkbox"
                        className={`${styles.grid_select_cell_header_input}`}
                        checked={plannedAppointCheckFlag}
                        onChange={() => setPlannedAppointCheckFlag(!plannedAppointCheckFlag)}
                      />
                      <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                      </svg>
                    </div>
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
              {/* 紹介商品ﾒｲﾝ */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} !min-w-[140px]`}>紹介商品ﾒｲﾝ</span>
                    <input
                      type="text"
                      placeholder=""
                      required
                      className={`${styles.input_box}`}
                      value={plannedProduct1}
                      onChange={(e) => setPlannedProduct1(e.target.value)}
                      onBlur={() => setPlannedProduct1(toHalfWidth(plannedProduct1.trim()))}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 紹介予定サブ */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>紹介予定サブ</span>
                    <input
                      type="text"
                      placeholder=""
                      required
                      className={`${styles.input_box}`}
                      value={plannedProduct2}
                      onChange={(e) => setPlannedProduct2(e.target.value)}
                      onBlur={() => setPlannedProduct2(toHalfWidth(plannedProduct2.trim()))}
                    />
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
            {/* 事前コメント */}
            <div className={`${styles.row_area} ${styles.text_area_xl} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full `}>
                  <span className={`${styles.title} !min-w-[140px]`}>事前コメント</span>
                  <textarea
                    cols={30}
                    rows={10}
                    placeholder=""
                    className={`${styles.textarea_box}`}
                    value={plannedComment}
                    onChange={(e) => setPlannedComment(e.target.value)}
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
                    <input
                      type="text"
                      placeholder=""
                      required
                      className={`${styles.input_box}`}
                      value={meetingDepartment}
                      onChange={(e) => setMeetingDepartment(e.target.value)}
                      // onBlur={() => setDepartmentName(toHalfWidth(departmentName.trim()))}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>
            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* ●活動年月度 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px] ${styles.required_title}`}>●活動年月度</span>
                    <input
                      type="number"
                      min="0"
                      className={`${styles.input_box}`}
                      placeholder='"202109" や "202312" などを入力'
                      value={meetingYearMonth === null ? "" : meetingYearMonth}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setMeetingYearMonth(null);
                        } else {
                          const numValue = Number(val);

                          // 入力値がマイナスかチェック
                          if (numValue < 0) {
                            setMeetingYearMonth(0);
                          } else {
                            setMeetingYearMonth(numValue);
                          }
                        }
                      }}
                    />
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
                    <input
                      type="text"
                      placeholder=""
                      required
                      className={`${styles.input_box}`}
                      value={meetingBusinessOffice}
                      onChange={(e) => setMeetingBusinessOffice(e.target.value)}
                      // onBlur={() => setDepartmentName(toHalfWidth(departmentName.trim()))}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* ●自社担当 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px] ${styles.required_title}`}>●自社担当</span>
                    <input
                      type="text"
                      placeholder="*入力必須"
                      required
                      className={`${styles.input_box}`}
                      value={meetingMemberName}
                      onChange={(e) => setMeetingMemberName(e.target.value)}
                      onBlur={() => setMeetingMemberName(toHalfWidth(meetingMemberName.trim()))}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 右ラッパーここまで */}
            </div>
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* メインコンテンツ コンテナ ここまで */}
        </div>
      </div>
    </>
  );
};
