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

export const InsertNewMeetingModal = () => {
  const selectedRowDataContact = useDashboardStore((state) => state.selectedRowDataContact);
  const selectedRowDataMeeting = useDashboardStore((state) => state.selectedRowDataMeeting);
  const setIsOpenInsertNewMeetingModal = useDashboardStore((state) => state.setIsOpenInsertNewMeetingModal);
  const loadingGlobalState = useDashboardStore((state) => state.loadingGlobalState);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  // const theme = useThemeStore((state) => state.theme);
  // 上画面の選択中の列データ会社
  // const selectedRowDataCompany = useDashboardStore((state) => state.selectedRowDataCompany);
  const userProfileState = useDashboardStore((state) => state.userProfileState);

  const initialDate = new Date();
  initialDate.setHours(0, 0, 0, 0);
  // const [MeetingDate, setMeetingDate] = useState<Date | null>(new Date());
  const [meetingType, setMeetingType] = useState("");
  const [webTool, setWebTool] = useState("");
  const [plannedDate, setPlannedDate] = useState<Date | null>(initialDate);
  const [plannedStartTime, setPlannedStartTime] = useState("");
  const [plannedPurpose, setPlannedPurpose] = useState("");
  const [plannedDuration, setPlannedDuration] = useState<number | null>(null);
  const [plannedAppointCheckFlag, setPlannedAppointCheckFlag] = useState(false);
  const [plannedProduct1, setPlannedProduct1] = useState("");
  const [plannedProduct2, setPlannedProduct2] = useState("");
  const [plannedComment, setPlannedComment] = useState("");
  const [resultDate, setResultDate] = useState<Date | null>(null);
  const [resultStartTime, setResultStartTime] = useState("");
  const [resultEndTime, setResultEndTime] = useState("");
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

  const supabase = useSupabaseClient();
  const { createMeetingMutation } = useMutateMeeting();

  //   useEffect(() => {
  //     if (!userProfileState) return;
  //     setMeetingMemberName(userProfileState.profile_name ? userProfileState.profile_name : "");
  //     setMeetingBusinessOffice(userProfileState.office ? userProfileState.office : "");
  //     setMeetingDepartment(userProfileState.department ? userProfileState.department : "");
  //   }, []);

  // キャンセルでモーダルを閉じる
  const handleCancelAndReset = () => {
    setIsOpenInsertNewMeetingModal(false);
  };
  const handleSaveAndClose = async () => {
    // if (!summary) return alert("活動概要を入力してください");
    // if (!MeetingType) return alert("活動タイプを選択してください");
    if (!userProfileState?.id) return alert("ユーザー情報が存在しません");
    if (!selectedRowDataContact?.company_id) return alert("相手先の会社情報が存在しません");
    if (!selectedRowDataContact?.contact_id) return alert("担当者情報が存在しません");

    setLoadingGlobalState(true);

    // 新規作成するデータをオブジェクトにまとめる
    const newMeeting = {
      created_by_company_id: userProfileState?.company_id ? userProfileState.company_id : null,
      created_by_user_id: userProfileState?.id ? userProfileState.id : null,
      created_by_department_of_user: departmentName ? departmentName : null,
      created_by_unit_of_user: userProfileState?.unit ? userProfileState.unit : null,
      client_contact_id: selectedRowDataContact.contact_id,
      client_company_id: selectedRowDataContact.company_id,
      meeting_type: meetingType,
      web_tool: webTool,
      planned_date: plannedDate ? plannedDate.toISOString() : null,
      planned_start_time: plannedStartTime,
      planned_purpose: plannedPurpose,
      planned_duration: plannedDuration,
      planned_appoint_check_flag: plannedAppointCheckFlag,
      planned_product1: plannedProduct1,
      planned_product2: plannedProduct2,
      planned_comment: plannedComment,
      result_date: resultDate ? resultDate.toISOString() : null,
      result_start_time: resultStartTime,
      result_end_time: resultEndTime,
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
    };

    // supabaseにINSERT
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

  console.log(
    "活動作成モーダル selectedRowDataContact",
    selectedRowDataContact,
    "selectedRowDataMeeting",
    selectedRowDataMeeting
  );

  return (
    <>
      <div className={`${styles.overlay} `} onClick={handleCancelAndReset} />
      {loadingGlobalState && (
        <div className={`${styles.loading_overlay} `}>
          <SpinnerIDS scale={"scale-[0.5]"} />
        </div>
      )}
      <div className={`${styles.container} `}>
        {/* 保存・タイトル・キャンセルエリア */}
        <div className="flex w-full  items-center justify-between whitespace-nowrap py-[10px] pb-[20px] text-center text-[18px]">
          <div className="font-samibold cursor-pointer hover:text-[#aaa]" onClick={handleCancelAndReset}>
            キャンセル
          </div>
          <div className="-translate-x-[25px] font-bold">面談 新規作成</div>

          <div
            className={`cursor-pointer font-bold text-[var(--color-text-brand-f)] hover:text-[var(--color-text-brand-f-hover)] ${styles.save_text}`}
            onClick={handleSaveAndClose}
          >
            保存
          </div>
        </div>
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
                    <span className={`${styles.title} !min-w-[140px]`}>●面談日</span>
                    <DatePickerCustomInput startDate={plannedDate} setStartDate={setPlannedDate} />
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
                    <span className={`${styles.title} ${styles.check_title}`}>●面談タイプ</span>

                    {/* <div className={`${styles.grid_select_cell_header}`}>
                      <input
                        type="checkbox"
                        className={`${styles.grid_select_cell_header_input}`}
                        checked={claimFlag}
                        onChange={() => setClaimFlag(!claimFlag)}
                      />
                      <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                      </svg>
                    </div> */}
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
                    <span className={`${styles.title} !min-w-[140px]`}>●面談開始</span>
                    <select
                      name="number_of_employees_class"
                      id="number_of_employees_class"
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={plannedStartTime}
                      onChange={(e) => {
                        if (e.target.value === "") return alert("活動タイプを選択してください");
                        setPlannedStartTime(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      <option value="TEL発信(不在)">TEL発信(不在)</option>
                      <option value="TEL発信(能動)">TEL発信(能動)</option>
                      <option value="TEL発信(受動)">TEL発信(受動)</option>
                      <option value="TEL発信(売前ﾌｫﾛｰ)">TEL発信(売前ﾌｫﾛｰ)</option>
                      <option value="TEL発信(売後ﾌｫﾛｰ)">TEL発信(売後ﾌｫﾛｰ)</option>
                      <option value="TEL発信(ｱﾎﾟ組み)">TEL発信(ｱﾎﾟ組み)</option>
                      <option value="TEL発信(その他)">TEL発信(その他)</option>
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
              {/* WEBツール */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>WEBツール</span>
                    <select
                      name="number_of_employees_class"
                      id="number_of_employees_class"
                      className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={webTool}
                      onChange={(e) => setWebTool(e.target.value)}
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
              {/* 同席依頼 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>同席依頼</span>
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
                      <option value="TEL発信(不在)">TEL発信(不在)</option>
                      <option value="TEL発信(能動)">TEL発信(能動)</option>
                      <option value="TEL発信(受動)">TEL発信(受動)</option>
                      <option value="TEL発信(売前ﾌｫﾛｰ)">TEL発信(売前ﾌｫﾛｰ)</option>
                      <option value="TEL発信(売後ﾌｫﾛｰ)">TEL発信(売後ﾌｫﾛｰ)</option>
                      <option value="TEL発信(ｱﾎﾟ組み)">TEL発信(ｱﾎﾟ組み)</option>
                      <option value="TEL発信(その他)">TEL発信(その他)</option>
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
              {/* 面談時間 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>面談時間</span>
                    <select
                      name="number_of_employees_class"
                      id="number_of_employees_class"
                      className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={plannedDuration ? plannedDuration?.toString() : ""}
                      onChange={(e) => setPlannedDuration(Number(e.target.value))}
                    >
                      <option value=""></option>
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="15">15</option>
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
              {/* ●訪問目的 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} !min-w-[172px]`}>●訪問目的</span>
                    {/* <DatePickerCustomInput startDate={plannedPurpose} setStartDate={setScheduledFollowUpDate} /> */}
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
                    <span className={`${styles.title} ${styles.check_title}`}>アポ有</span>
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
                      value={plannedProduct2}
                      onChange={(e) => setPlannedProduct2(e.target.value)}
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
                      // onBlur={() => setDepartmentName(toHalfWidth(departmentName.trim()))}
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
            {/* 紹介商品ﾒｲﾝ */}
            <div className={`${styles.row_area} ${styles.text_area_xl} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full `}>
                  <span className={`${styles.title} !min-w-[140px]`}>紹介商品ﾒｲﾝ</span>
                  <textarea
                    name="summary"
                    id="summary"
                    cols={30}
                    rows={10}
                    placeholder=""
                    className={`${styles.textarea_box}`}
                    value={plannedProduct1}
                    onChange={(e) => setPlannedProduct2(e.target.value)}
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
                      // onBlur={() => setDepartmentName(toHalfWidth(departmentName.trim()))}
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
            {/* 事前コメント */}
            <div className={`${styles.row_area} ${styles.text_area_xl} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full `}>
                  <span className={`${styles.title} !min-w-[140px]`}>事前コメント</span>
                  <textarea
                    name="summary"
                    id="summary"
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
                    {/* <select
                      name="number_of_employees_class"
                      id="number_of_employees_class"
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      //   value={numberOfEmployeesClass}
                      //   onChange={(e) => setNumberOfEmployeesClass(e.target.value)}
                    >
                      <option value=""></option>
                      <option value="A 1000名以上">A 1000名以上</option>
                      <option value="B 500-999名">B 500-999名</option>
                      <option value="C 300-499名">C 300-499名</option>
                      <option value="D 200-299名">D 200-299名</option>
                      <option value="E 100-199名">E 100-199名</option>
                      <option value="F 50-99名">F 50-99名</option>
                      <option value="G 50名未満">G 50名未満</option>
                    </select> */}
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
                      value={meetingMemberName}
                      onChange={(e) => setMeetingMemberName(e.target.value)}
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

          {/* メインコンテンツ コンテナ ここまで */}
        </div>
      </div>
    </>
  );
};
