import React, { useEffect, useState } from "react";
import styles from "./UpdateMeetingModal.module.css";
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
import { BsChevronLeft } from "react-icons/bs";

export const UpdateMeetingModal = () => {
  //   const selectedRowDataContact = useDashboardStore((state) => state.selectedRowDataContact);
  const selectedRowDataMeeting = useDashboardStore((state) => state.selectedRowDataMeeting);
  const setIsOpenUpdateMeetingModal = useDashboardStore((state) => state.setIsOpenUpdateMeetingModal);
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
  const [meetingYearMonth, setMeetingYearMonth] = useState<number | null>(Number(meetingYearMonthInitialValue));

  const supabase = useSupabaseClient();
  const { updateMeetingMutation } = useMutateMeeting();

  function formatTime(timeStr: string) {
    const [hour, minute] = timeStr.split(":");
    return `${hour}:${minute}`;
  }

  // 初回マウント時に選択中の担当者&会社の列データの情報をStateに格納
  useEffect(() => {
    if (!selectedRowDataMeeting) return;
    const selectedInitialMeetingDate = selectedRowDataMeeting.planned_date
      ? new Date(selectedRowDataMeeting.planned_date)
      : null;
    const selectedYear = initialDate.getFullYear(); // 例: 2023
    const selectedMonth = initialDate.getMonth() + 1; // getMonth()は0から11で返されるため、+1して1から12に調整
    const selectedYearMonthInitialValue = `${year}${month < 10 ? "0" + month : month}`; // 月が1桁の場合は先頭に0を追加

    // let _activity_date = selectedRowDataActivity.activity_date ? new Date(selectedRowDataActivity.activity_date) : null;
    let _meeting_type = selectedRowDataMeeting.meeting_type ? selectedRowDataMeeting.meeting_type : "";
    let _web_tool = selectedRowDataMeeting.web_tool ? selectedRowDataMeeting.web_tool : "";
    let _planned_date = selectedInitialMeetingDate;
    let _planned_start_time = selectedRowDataMeeting.planned_start_time
      ? formatTime(selectedRowDataMeeting.planned_start_time)
      : "";
    let _planned_purpose = selectedRowDataMeeting.planned_purpose ? selectedRowDataMeeting.planned_purpose : "";
    let _planned_duration = selectedRowDataMeeting.planned_duration ? selectedRowDataMeeting.planned_duration : null;
    let _planned_appoint_check_flag = selectedRowDataMeeting.planned_appoint_check_flag
      ? selectedRowDataMeeting.planned_appoint_check_flag
      : false;
    let _planned_product1 = selectedRowDataMeeting.planned_product1 ? selectedRowDataMeeting.planned_product1 : "";
    let _planned_product2 = selectedRowDataMeeting.planned_product2 ? selectedRowDataMeeting.planned_product2 : "";
    let _planned_comment = selectedRowDataMeeting.planned_comment ? selectedRowDataMeeting.planned_comment : "";
    let _result_date = selectedRowDataMeeting.result_date ? new Date(selectedRowDataMeeting.result_date) : null;
    let _result_start_time = selectedRowDataMeeting.result_start_time
      ? formatTime(selectedRowDataMeeting.result_start_time)
      : "";
    let _result_end_time = selectedRowDataMeeting.result_end_time
      ? formatTime(selectedRowDataMeeting.result_end_time)
      : "";
    let _result_duration = selectedRowDataMeeting.result_duration ? selectedRowDataMeeting.result_duration : null;
    let _result_number_of_meeting_participants = selectedRowDataMeeting.result_number_of_meeting_participants
      ? selectedRowDataMeeting.result_number_of_meeting_participants
      : null;
    let _result_presentation_product1 = selectedRowDataMeeting.result_presentation_product1
      ? selectedRowDataMeeting.result_presentation_product1
      : "";
    let _result_presentation_product2 = selectedRowDataMeeting.result_presentation_product2
      ? selectedRowDataMeeting.result_presentation_product2
      : "";
    let _result_presentation_product3 = selectedRowDataMeeting.result_presentation_product3
      ? selectedRowDataMeeting.result_presentation_product3
      : "";
    let _result_presentation_product4 = selectedRowDataMeeting.result_presentation_product4
      ? selectedRowDataMeeting.result_presentation_product4
      : "";
    let _result_presentation_product5 = selectedRowDataMeeting.result_presentation_product5
      ? selectedRowDataMeeting.result_presentation_product5
      : "";
    let _result_category = selectedRowDataMeeting.result_category ? selectedRowDataMeeting.result_category : "";
    let _result_summary = selectedRowDataMeeting.result_summary ? selectedRowDataMeeting.result_summary : "";
    let _result_negotiate_decision_maker = selectedRowDataMeeting.result_negotiate_decision_maker
      ? selectedRowDataMeeting.result_negotiate_decision_maker
      : "";
    let _pre_meeting_participation_request = selectedRowDataMeeting.pre_meeting_participation_request
      ? selectedRowDataMeeting.pre_meeting_participation_request
      : "";
    let _meeting_participation_request = selectedRowDataMeeting.meeting_participation_request
      ? selectedRowDataMeeting.meeting_participation_request
      : "";
    let _meeting_business_office = selectedRowDataMeeting.meeting_business_office
      ? selectedRowDataMeeting.meeting_business_office
      : "";
    let _meeting_department = selectedRowDataMeeting.meeting_department
      ? selectedRowDataMeeting.meeting_department
      : "";
    let _meeting_member_name = selectedRowDataMeeting.meeting_member_name
      ? selectedRowDataMeeting.meeting_member_name
      : "";
    let _meeting_year_month = selectedRowDataMeeting.meeting_year_month
      ? selectedRowDataMeeting.meeting_year_month
      : Number(selectedYearMonthInitialValue);

    setMeetingType(_meeting_type);
    setWebTool(_web_tool);
    setPlannedDate(_planned_date);
    setPlannedStartTime(_planned_start_time);
    const [plannedStartHour, plannedStartMinute] = _planned_start_time ? _planned_start_time.split(":") : ["", ""];
    setPlannedStartTimeHour(plannedStartHour);
    setPlannedStartTimeMinute(plannedStartMinute);
    setPlannedPurpose(_planned_purpose);
    setPlannedDuration(_planned_duration);
    setPlannedAppointCheckFlag(_planned_appoint_check_flag);
    setPlannedProduct1(_planned_product1);
    setPlannedProduct2(_planned_product2);
    setPlannedComment(_planned_comment);
    setResultDate(_result_date);
    setResultStartTime(_result_start_time);
    const [resultStartHour, resultStartMinute] = _result_start_time ? _result_start_time.split(":") : ["", ""];
    setResultStartTimeHour(resultStartHour);
    setResultStartTimeMinute(resultStartMinute);
    setResultEndTime(_result_end_time);
    const [resultEndHour, resultEndMinute] = _result_end_time ? _result_end_time.split(":") : ["", ""];
    setResultEndTimeHour(resultEndHour);
    setResultEndTimeMinute(resultEndMinute);
    setResultDuration(_result_duration);
    setResultNumberOfMeetingParticipants(_result_number_of_meeting_participants);
    setResultPresentationProduct1(_result_presentation_product1);
    setResultPresentationProduct2(_result_presentation_product2);
    setResultPresentationProduct3(_result_presentation_product3);
    setResultPresentationProduct4(_result_presentation_product4);
    setResultPresentationProduct5(_result_presentation_product5);
    setResultCategory(_result_category);
    setResultSummary(_result_summary);
    setResultNegotiateDecisionMaker(_result_negotiate_decision_maker);
    setPreMeetingParticipationRequest(_pre_meeting_participation_request);
    setMeetingParticipationRequest(_meeting_participation_request);
    setMeetingBusinessOffice(_meeting_business_office);
    setMeetingDepartment(_meeting_department);
    setMeetingMemberName(_meeting_member_name);
    setMeetingYearMonth(_meeting_year_month);
  }, []);

  //   useEffect(() => {
  //     if (!userProfileState) return;
  //     setMeetingMemberName(userProfileState.profile_name ? userProfileState.profile_name : "");
  //     setMeetingBusinessOffice(userProfileState.office ? userProfileState.office : "");
  //     setMeetingDepartment(userProfileState.department ? userProfileState.department : "");
  //   }, []);

  // 面談開始から面談終了時間の間の面談時間を計算
  function isCompleteTime(timeStr: string) {
    const [hour, minute] = timeStr.split(":");
    return hour && minute;
  }
  const calculateDuration = (startTimeStr: string, endTimeStr: string) => {
    // startTimeStr および endTimeStr が完全に設定されているかチェック
    if (!isCompleteTime(startTimeStr) || !isCompleteTime(endTimeStr)) {
      return null;
    }

    // 両方の時間が完全に設定されている場合のみ計算を実行
    const [startHour, startMinute] = startTimeStr.split(":").map(Number);
    const [endHour, endMinute] = endTimeStr.split(":").map(Number);

    const startDate = new Date(0, 0, 0, startHour, startMinute);
    const endDate = new Date(0, 0, 0, endHour, endMinute);

    const diffMs = endDate.getTime() - startDate.getTime();

    // ミリ秒から分に変換
    const diffMinutes = diffMs / (1000 * 60);
    return diffMinutes;
  };

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
  // 面談時間計算用useEffect
  useEffect(() => {
    if (isCompleteTime(resultStartTime) && isCompleteTime(resultEndTime)) {
      const duration = calculateDuration(resultStartTime, resultEndTime);
      setResultDuration(duration);
    } else {
      setResultDuration(null);
    }
  }, [resultStartTime, resultEndTime]);

  // キャンセルでモーダルを閉じる
  const handleCancelAndReset = () => {
    if (loadingGlobalState) return;
    setIsOpenUpdateMeetingModal(false);
  };
  const handleSaveAndClose = async () => {
    // if (!summary) return alert("活動概要を入力してください");
    // if (!MeetingType) return alert("活動タイプを選択してください");
    if (!userProfileState?.id) return alert("ユーザー情報が存在しません");
    if (!selectedRowDataMeeting?.company_id) return alert("相手先の会社情報が存在しません");
    if (!selectedRowDataMeeting?.contact_id) return alert("担当者情報が存在しません");
    if (plannedPurpose === "") return alert("訪問目的を選択してください");
    if (plannedStartTimeHour === "") return alert("予定面談開始 時間を選択してください");
    if (plannedStartTimeMinute === "") return alert("予定面談開始 分を選択してください");
    // if (resultStartTimeHour === "") return alert("結果面談開始 時間を選択してください");
    // if (resultStartTimeMinute === "") return alert("結果面談開始 分を選択してください");
    // if (resultEndTimeHour === "") return alert("結果面談終了 時間を選択してください");
    // if (resultEndTimeMinute === "") return alert("結果面談終了 分を選択してください");
    if (!meetingYearMonth) return alert("面談年月度を入力してください");
    if (meetingMemberName === "") return alert("自社担当を入力してください");

    setLoadingGlobalState(true);

    // 新規作成するデータをオブジェクトにまとめる
    const newMeeting = {
      id: selectedRowDataMeeting.meeting_id,
      created_by_company_id: userProfileState?.company_id ? userProfileState.company_id : null,
      created_by_user_id: userProfileState?.id ? userProfileState.id : null,
      created_by_department_of_user: userProfileState.department ? userProfileState.department : null,
      created_by_unit_of_user: userProfileState?.unit ? userProfileState.unit : null,
      client_contact_id: selectedRowDataMeeting.contact_id,
      client_company_id: selectedRowDataMeeting.company_id,
      meeting_type: meetingType ? meetingType : null,
      web_tool: webTool ? webTool : null,
      planned_date: plannedDate ? plannedDate.toISOString() : null,
      // planned_start_time: plannedStartTime === ":" ? null : plannedStartTime,
      planned_start_time: plannedStartTime === "" ? null : plannedStartTime,
      planned_purpose: plannedPurpose ? plannedPurpose : null,
      planned_duration: plannedDuration ? plannedDuration : null,
      planned_appoint_check_flag: plannedAppointCheckFlag,
      planned_product1: plannedProduct1 ? plannedProduct1 : null,
      planned_product2: plannedProduct2 ? plannedProduct2 : null,
      planned_comment: plannedComment ? plannedComment : null,
      result_date: resultDate ? resultDate.toISOString() : null,
      result_start_time: resultStartTime === "" ? null : resultStartTime,
      result_end_time: resultEndTime === "" ? null : resultEndTime,
      // result_start_time: resultStartTime === ":" ? null : resultStartTime,
      // result_end_time: resultEndTime === ":" ? null : resultEndTime,
      result_duration: resultDuration ? resultDuration : null,
      result_number_of_meeting_participants: resultNumberOfMeetingParticipants
        ? resultNumberOfMeetingParticipants
        : null,
      result_presentation_product1: resultPresentationProduct1 ? resultPresentationProduct1 : null,
      result_presentation_product2: resultPresentationProduct2 ? resultPresentationProduct2 : null,
      result_presentation_product3: resultPresentationProduct3 ? resultPresentationProduct3 : null,
      result_presentation_product4: resultPresentationProduct4 ? resultPresentationProduct4 : null,
      result_presentation_product5: resultPresentationProduct5 ? resultPresentationProduct5 : null,
      result_category: resultCategory ? resultCategory : null,
      result_summary: resultSummary ? resultSummary : null,
      result_negotiate_decision_maker: resultNegotiateDecisionMaker ? resultNegotiateDecisionMaker : null,
      pre_meeting_participation_request: preMeetingParticipationRequest ? preMeetingParticipationRequest : null,
      meeting_participation_request: meetingParticipationRequest ? meetingParticipationRequest : null,
      meeting_business_office: meetingBusinessOffice ? meetingBusinessOffice : null,
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
    updateMeetingMutation.mutate(newMeeting);

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
    "面談予定作成モーダル ",
    "selectedRowDataMeeting",
    selectedRowDataMeeting,
    "plannedStartTime",
    plannedStartTime,
    "面談時間 result_duration",
    resultDuration
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
          <div className="min-w-[150px] select-none font-bold">面談 結果入力/編集</div>

          <div
            className={`min-w-[150px] cursor-pointer text-end font-bold text-[var(--color-text-brand-f)] hover:text-[var(--color-text-brand-f-hover)] ${styles.save_text} select-none`}
            onClick={handleSaveAndClose}
          >
            保存
          </div>
        </div>

        <div className="min-h-[2px] w-full bg-[var(--color-bg-brand-f)]"></div>

        {/* メインコンテンツ コンテナ */}
        <div className={`${styles.main_contents_container}`}>
          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* 予定 */}
            <div className={`${styles.row_area} flex w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.section_title}`}>予定</span>

                  {/* <span className={`${styles.value} ${styles.value_highlight}`}>
                      {selectedRowDataMeeting?.company_name ? selectedRowDataMeeting?.company_name : ""}
                    </span> */}
                </div>
                <div className={`${styles.section_underline}`}></div>
              </div>
            </div>
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}
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
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={preMeetingParticipationRequest}
                      onChange={(e) => {
                        // if (e.target.value === "") return alert("活動タイプを選択してください");
                        setPreMeetingParticipationRequest(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      <option value="同席依頼無し">同席依頼無し</option>
                      <option value="同席依頼済み 同席OK">同席依頼済み 同席OK</option>
                      <option value="同席依頼済み 同席NG">同席依頼済み 同席NG</option>
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
                    <span className={`${styles.title} !min-w-[140px] !text-[16px]`}>予定_面談時間(分)</span>
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
              {/* ●面談年月度 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px] ${styles.required_title}${styles.required_title}`}>
                      ●面談年月度
                    </span>
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

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* ==================================== 結果エリア ==================================== */}
            <div className={`${styles.row_area} flex w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.section_title}`}>結果</span>

                  {/* <span className={`${styles.value} ${styles.value_highlight}`}>
                      {selectedRowDataMeeting?.company_name ? selectedRowDataMeeting?.company_name : ""}
                    </span> */}
                </div>
                <div className={`${styles.section_underline}`}></div>
              </div>
            </div>
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

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
                      startDate={resultDate}
                      setStartDate={setResultDate}
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
                    {/* <span className={`${styles.title} !min-w-[140px]`}>●面談タイプ</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={meetingType}
                      onChange={(e) => {
                        setMeetingType(e.target.value);
                      }}
                    >
                      <option value="訪問">訪問</option>
                      <option value="WEB">WEB</option>
                    </select> */}
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
                    <span className={`${styles.title} !min-w-[140px]`}>面談開始</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      placeholder="時"
                      value={resultStartTimeHour}
                      onChange={(e) => setResultStartTimeHour(e.target.value === "" ? "" : e.target.value)}
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
                      value={resultStartTimeMinute}
                      onChange={(e) => setResultStartTimeMinute(e.target.value === "" ? "" : e.target.value)}
                    >
                      <option value=""></option>
                      {minutes.map((minute) => (
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
              {/* 面談終了 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>面談終了</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      placeholder="時"
                      value={resultEndTimeHour}
                      onChange={(e) => setResultEndTimeHour(e.target.value === "" ? "" : e.target.value)}
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
                      value={resultEndTimeMinute}
                      onChange={(e) => setResultEndTimeMinute(e.target.value === "" ? "" : e.target.value)}
                    >
                      <option value=""></option>
                      {minutes.map((minute) => (
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

              {/* 右ラッパーここまで */}
            </div>
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* 面談人数 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>面談人数</span>
                    <input
                      type="number"
                      min="0"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={resultNumberOfMeetingParticipants === null ? "" : resultNumberOfMeetingParticipants}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setResultNumberOfMeetingParticipants(null);
                        } else {
                          const numValue = Number(val);

                          // 入力値がマイナスかチェック
                          if (numValue < 0) {
                            setResultNumberOfMeetingParticipants(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                          } else {
                            setResultNumberOfMeetingParticipants(numValue);
                          }
                        }
                      }}
                    />
                    {/* バツボタン */}
                    {resultNumberOfMeetingParticipants !== null && resultNumberOfMeetingParticipants !== 0 && (
                      <div
                        className={`${styles.close_btn_number}`}
                        onClick={() => setResultNumberOfMeetingParticipants(null)}
                      >
                        <MdClose className="text-[20px] " />
                      </div>
                    )}
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
                      className={`${styles.input_box} pointer-events-none`}
                      placeholder=""
                      value={resultDuration === null ? "" : resultDuration}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setResultDuration(null);
                        } else {
                          const numValue = Number(val);

                          // 入力値がマイナスかチェック
                          if (numValue < 0) {
                            setResultDuration(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                          } else {
                            setResultDuration(numValue);
                          }
                        }
                      }}
                    />
                    {/* バツボタン */}
                    {resultDuration !== null && resultDuration !== 0 && (
                      <div className={`${styles.close_btn_number}`} onClick={() => setResultDuration(null)}>
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
              {/* 実施商品1 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} !min-w-[140px]`}>実施商品1</span>
                    <input
                      type="text"
                      placeholder="面談で紹介した商品を入力してください"
                      required
                      className={`${styles.input_box}`}
                      value={resultPresentationProduct1}
                      onChange={(e) => setResultPresentationProduct1(e.target.value)}
                      onBlur={() => setResultPresentationProduct1(toHalfWidth(resultPresentationProduct1.trim()))}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 実施商品2 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} !min-w-[140px]`}>実施商品2</span>
                    <input
                      type="text"
                      placeholder="2つ目に紹介した商品があれば入力してください"
                      required
                      className={`${styles.input_box}`}
                      value={resultPresentationProduct2}
                      onChange={(e) => setResultPresentationProduct2(e.target.value)}
                      onBlur={() => setResultPresentationProduct2(toHalfWidth(resultPresentationProduct2.trim()))}
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
              {/* 実施商品3 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} !min-w-[140px]`}>実施商品3</span>
                    <input
                      type="text"
                      placeholder="3つ目に紹介した商品があれば入力してください"
                      required
                      className={`${styles.input_box}`}
                      value={resultPresentationProduct3}
                      onChange={(e) => setResultPresentationProduct3(e.target.value)}
                      onBlur={() => setResultPresentationProduct3(toHalfWidth(resultPresentationProduct3.trim()))}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 実施商品4 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} !min-w-[140px]`}>実施商品4</span>
                    <input
                      type="text"
                      placeholder="4つ目に紹介した商品があれば入力してください"
                      required
                      className={`${styles.input_box}`}
                      value={resultPresentationProduct4}
                      onChange={(e) => setResultPresentationProduct4(e.target.value)}
                      onBlur={() => setResultPresentationProduct4(toHalfWidth(resultPresentationProduct4.trim()))}
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
              {/* 実施商品5 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} !min-w-[140px]`}>実施商品5</span>
                    <input
                      type="text"
                      placeholder="5つ目に紹介した商品があれば入力してください"
                      required
                      className={`${styles.input_box}`}
                      value={resultPresentationProduct5}
                      onChange={(e) => setResultPresentationProduct5(e.target.value)}
                      onBlur={() => setResultPresentationProduct5(toHalfWidth(resultPresentationProduct5.trim()))}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全部ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full flex-col`}>
            {/* 結果ｺﾒﾝﾄ */}
            <div className={`${styles.row_area} ${styles.text_area_xl} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full `}>
                  <span className={`${styles.title} !min-w-[140px]`}>結果ｺﾒﾝﾄ</span>
                  <textarea
                    cols={30}
                    // rows={10}
                    placeholder=""
                    className={`${styles.textarea_box}`}
                    value={resultSummary}
                    onChange={(e) => setResultSummary(e.target.value)}
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
            <div className={`flex h-full w-full flex-col`}>
              {/* 面談結果 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-[50%] flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} !min-w-[140px]`}>面談結果</span>
                    <select
                      className={`mr-auto h-full w-[100%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={resultCategory}
                      onChange={(e) => {
                        // if (e.target.value === "") return alert("訪問目的を選択してください");
                        setResultCategory(e.target.value);
                      }}
                    >
                      <option value="">面談結果を選択してください</option>
                      <option value="展開F(当期中に導入の可能性あり)">展開F(当期中に導入の可能性あり)</option>
                      <option value="展開N(来期導入の可能性あり)">展開N(来期導入の可能性あり)</option>
                      <option value="展開継続">展開継続</option>
                      <option value="時期尚早">時期尚早</option>
                      <option value="頻度低い(ニーズあるが頻度低く導入には及ばず)">
                        頻度低い(ニーズあるが頻度低く導入には及ばず)
                      </option>
                      <option value="結果出ず(再度面談や検証が必要)">結果出ず(再度面談や検証が必要)</option>
                      <option value="担当者の推進力無し(ニーズあり、上長・キーマンにあたる必要有り)">
                        担当者の推進力無し(ニーズあり、上長・キーマンにあたる必要有り)
                      </option>
                      <option value="用途・ニーズなし">用途・ニーズなし</option>
                      <option value="他(立ち上げ、サポート)">他(立ち上げ、サポート)</option>
                      <option value="その他">その他</option>
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* 面談時_決裁者商談有無 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <div className={`${styles.title} flex !min-w-[140px] flex-col !text-[16px]`}>
                      <span>面談時_</span>
                      <span>決裁者商談有無</span>
                    </div>
                    <select
                      className={`mr-auto h-full w-[100%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={resultNegotiateDecisionMaker}
                      onChange={(e) => {
                        // if (e.target.value === "") return alert("訪問目的を選択してください");
                        setResultNegotiateDecisionMaker(e.target.value);
                      }}
                    >
                      <option value="">選択してください</option>
                      <option value="決裁者と未商談">決裁者と未商談</option>
                      <option value="決裁者と商談済み">決裁者と商談済み</option>
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>
            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 面談時同席依頼 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px] !text-[16px]`}>面談時同席依頼</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={meetingParticipationRequest}
                      onChange={(e) => {
                        // if (e.target.value === "") return alert("活動タイプを選択してください");
                        setMeetingParticipationRequest(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      <option value="同席依頼無し">同席依頼無し</option>
                      <option value="同席依頼済み 同席OK">同席依頼済み 同席OK</option>
                      <option value="同席依頼済み 同席NG">同席依頼済み 同席NG</option>
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
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
