import React, { FC, FormEvent, Suspense, memo, useEffect, useState } from "react";
import styles from "../MeetingDetail.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import useStore from "@/store";
// import { UnderRightMeetingLog } from "./UnderRightMeetingLog/UnderRightMeetingLog";
import { Fallback } from "@/components/Fallback/Fallback";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/ErrorFallback/ErrorFallback";
import dynamic from "next/dynamic";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import productCategoriesM, { moduleCategoryM } from "@/utils/productCategoryM";
import { DatePickerCustomInput } from "@/utils/DatePicker/DatePickerCustomInput";
import { format } from "date-fns";

// https://nextjs-ja-translation-docs.vercel.app/docs/advanced-features/dynamic-import
// デフォルトエクスポートの場合のダイナミックインポート
// const DynamicComponent = dynamic(() => import('../components/hello'));
// 名前付きエクスポートの場合のダイナミックインポート
// const ContactUnderRightMeetingLog = dynamic(
//   () =>
//     import("./ContactUnderRightMeetingLog/ContactUnderRightMeetingLog").then(
//       (mod) => mod.ContactUnderRightMeetingLog
//     ),
//   {
//     ssr: false,
//   }
// );
/**カスタムローディングコンポーネント オプションの loading コンポーネントを追加して、動的コンポーネントの読み込み中に読み込み状態をレンダリングできます
 * const DynamicComponentWithCustomLoading = dynamic(() => import('../components/hello'), {
  loading: () => <p>...</p>
});
 */
// SSRを使用しない場合
// 常にサーバー側にモジュールを含める必要はありません。たとえば、ブラウザのみで動作するライブラリがモジュールに含まれている場合です。

const MeetingMainContainerOneThirdMemo: FC = () => {
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const searchMode = useDashboardStore((state) => state.searchMode);
  const setSearchMode = useDashboardStore((state) => state.setSearchMode);
  console.log("🔥 MeetingMainContainerレンダリング searchMode", searchMode);
  const setHoveredItemPosWrap = useStore((state) => state.setHoveredItemPosWrap);
  const isOpenSidebar = useDashboardStore((state) => state.isOpenSidebar);
  // 上画面の選択中の列データ会社
  const selectedRowDataMeeting = useDashboardStore((state) => state.selectedRowDataMeeting);
  const setSelectedRowDataMeeting = useDashboardStore((state) => state.setSelectedRowDataMeeting);
  // 担当者編集モーダルオープン
  const setIsOpenUpdateMeetingModal = useDashboardStore((state) => state.setIsOpenUpdateMeetingModal);

  const handleOpenTooltip = (e: React.MouseEvent<HTMLElement, MouseEvent>, display: string = "center") => {
    // ホバーしたアイテムにツールチップを表示
    const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
    // console.log("ツールチップx, y width , height", x, y, width, height);
    const content2 = ((e.target as HTMLDivElement).dataset.text2 as string)
      ? ((e.target as HTMLDivElement).dataset.text2 as string)
      : "";
    const content3 = ((e.target as HTMLDivElement).dataset.text3 as string)
      ? ((e.target as HTMLDivElement).dataset.text3 as string)
      : "";
    setHoveredItemPosWrap({
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
    setHoveredItemPosWrap(null);
  };

  // セルダブルクリック モーダル表示
  // const handleDoubleClick = useCallback((e: React.MouseEvent<HTMLDivElement>, index: number, columnName: string) => {
  //   console.log("ダブルクリック index", index);
  //   if (columnName === "id") return console.log("ダブルクリック idのためリターン");
  //   // if (index === 0) return console.log("リターン");
  //   if (setTimeoutRef.current) {
  //     clearTimeout(setTimeoutRef.current);

  //     // console.log(e.detail);
  //     setTimeoutRef.current = null;
  //     // ダブルクリック時に実行したい処理
  //     console.log("ダブルクリック", e.currentTarget);
  //     // クリックした要素のテキストを格納
  //     const text = e.currentTarget.innerText;
  //     setTextareaInput(text);
  //     setIsOpenEditModal(true);
  //   }
  // }, []);

  const tableContainerSize = useDashboardStore((state) => state.tableContainerSize);
  const underDisplayFullScreen = useDashboardStore((state) => state.underDisplayFullScreen);

  // 🌟サブミット
  const [inputCompanyName, setInputCompanyName] = useState("");
  const [inputDepartmentName, setInputDepartmentName] = useState("");
  const [inputTel, setInputTel] = useState("");
  const [inputFax, setInputFax] = useState("");
  const [inputZipcode, setInputZipcode] = useState("");
  const [inputAddress, setInputAddress] = useState("");
  const [inputEmployeesClass, setInputEmployeesClass] = useState("");
  const [inputCapital, setInputCapital] = useState("");
  const [inputFound, setInputFound] = useState("");
  const [inputContent, setInputContent] = useState("");
  const [inputHP, setInputHP] = useState("");
  const [inputCompanyEmail, setInputCompanyEmail] = useState("");
  const [inputIndustryType, setInputIndustryType] = useState("");
  const [inputProductL, setInputProductL] = useState("");
  const [inputProductM, setInputProductM] = useState("");
  const [inputProductS, setInputProductS] = useState("");
  const [inputFiscal, setInputFiscal] = useState("");
  const [inputBudgetRequestMonth1, setInputBudgetRequestMonth1] = useState("");
  const [inputBudgetRequestMonth2, setInputBudgetRequestMonth2] = useState("");
  const [inputClient, setInputClient] = useState("");
  const [inputSupplier, setInputSupplier] = useState("");
  const [inputFacility, setInputFacility] = useState("");
  const [inputBusinessSite, setInputBusinessSite] = useState("");
  const [inputOverseas, setInputOverseas] = useState("");
  const [inputGroup, setInputGroup] = useState("");
  const [inputCorporateNum, setInputCorporateNum] = useState("");
  // contactsテーブル
  const [inputContactName, setInputContactName] = useState("");
  const [inputDirectLine, setInputDirectLine] = useState("");
  const [inputDirectFax, setInputDirectFax] = useState("");
  const [inputExtension, setInputExtension] = useState("");
  const [inputCompanyCellPhone, setInputCompanyCellPhone] = useState("");
  const [inputPersonalCellPhone, setInputPersonalCellPhone] = useState("");
  const [inputContactEmail, setInputContactEmail] = useState("");
  const [inputPositionName, setInputPositionName] = useState("");
  const [inputPositionClass, setInputPositionClass] = useState("");
  const [inputOccupation, setInputOccupation] = useState("");
  const [inputApprovalAmount, setInputApprovalAmount] = useState("");
  const [inputContactCreatedByCompanyId, setInputContactCreatedByCompanyId] = useState("");
  const [inputContactCreatedByUserId, setInputContactCreatedByUserId] = useState("");
  // Meetingテーブル
  const [inputMeetingCreatedByCompanyId, setInputMeetingCreatedByCompanyId] = useState("");
  const [inputMeetingCreatedByUserId, setInputMeetingCreatedByUserId] = useState("");
  const [inputMeetingCreatedByDepartmentOfUser, setInputMeetingCreatedByDepartmentOfUser] = useState("");
  const [inputMeetingCreatedByUnitOfUser, setInputMeetingCreatedByUnitOfUser] = useState("");
  const [inputMeetingType, setInputMeetingType] = useState("");
  const [inputWebTool, setInputWebTool] = useState("");
  const [inputPlannedDate, setInputPlannedDate] = useState<Date | null>(null);
  const [inputPlannedStartTime, setInputPlannedStartTime] = useState<string | null>(null);
  const [inputPlannedStartTimeHour, setInputPlannedStartTimeHour] = useState<string | null>(null);
  const [inputPlannedStartTimeMinute, setInputPlannedStartTimeMinute] = useState<string | null>(null);
  const [inputPlannedPurpose, setInputPlannedPurpose] = useState("");
  const [inputPlannedDuration, setInputPlannedDuration] = useState<number | null>(null);
  const [inputPlannedAppointCheckFlag, setInputPlannedAppointCheckFlag] = useState<boolean | null>(null);
  const [inputPlannedProduct1, setInputPlannedProduct1] = useState("");
  const [inputPlannedProduct2, setInputPlannedProduct2] = useState("");
  const [inputPlannedComment, setInputPlannedComment] = useState("");
  const [inputResultDate, setInputResultDate] = useState<Date | null>(null);
  const [inputResultStartTime, setInputResultStartTime] = useState<string | null>(null);
  const [inputResultStartTimeHour, setInputResultStartTimeHour] = useState<string | null>(null);
  const [inputResultStartTimeMinute, setInputResultStartTimeMinute] = useState<string | null>(null);
  const [inputResultEndTime, setInputResultEndTime] = useState<string | null>(null);
  const [inputResultEndTimeHour, setInputResultEndTimeHour] = useState<string | null>(null);
  const [inputResultEndTimeMinute, setInputResultEndTimeMinute] = useState<string | null>(null);
  const [inputResultDuration, setInputResultDuration] = useState<number | null>(null);
  const [inputResultNumberOfMeetingParticipants, setInputResultNumberOfMeetingParticipants] = useState<number | null>(
    null
  );
  const [inputResultPresentationProduct1, setInputResultPresentationProduct1] = useState("");
  const [inputResultPresentationProduct2, setInputResultPresentationProduct2] = useState("");
  const [inputResultPresentationProduct3, setInputResultPresentationProduct3] = useState("");
  const [inputResultPresentationProduct4, setInputResultPresentationProduct4] = useState("");
  const [inputResultPresentationProduct5, setInputResultPresentationProduct5] = useState("");
  const [inputResultCategory, setInputResultCategory] = useState("");
  const [inputResultSummary, setInputResultSummary] = useState("");
  const [inputResultNegotiateDecisionMaker, setInputResultNegotiateDecisionMaker] = useState("");
  const [inputPreMeetingParticipationRequest, setInputPreMeetingParticipationRequest] = useState("");
  const [inputMeetingParticipationRequest, setInputMeetingParticipationRequest] = useState("");
  const [inputMeetingBusinessOffice, setInputMeetingBusinessOffice] = useState("");
  const [inputMeetingDepartment, setInputMeetingDepartment] = useState("");
  const [inputMeetingMemberName, setInputMeetingMemberName] = useState("");

  const supabase = useSupabaseClient();
  const newSearchMeeting_Contact_CompanyParams = useDashboardStore(
    (state) => state.newSearchMeeting_Contact_CompanyParams
  );
  const setNewSearchMeeting_Contact_CompanyParams = useDashboardStore(
    (state) => state.setNewSearchMeeting_Contact_CompanyParams
  );
  const editSearchMode = useDashboardStore((state) => state.editSearchMode);
  const setEditSearchMode = useDashboardStore((state) => state.setEditSearchMode);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);

  // サーチ編集モードでリプレイス前の値に復元する関数
  function beforeAdjustFieldValue(value: string | null) {
    if (typeof value === "boolean") return value; // Booleanの場合、そのままの値を返す
    if (value === "") return ""; // 全てのデータ
    if (value === null) return ""; // 全てのデータ
    if (value.includes("%")) value = value.replace(/\%/g, "＊");
    if (value === "ISNULL") return "is null"; // ISNULLパラメータを送信
    if (value === "ISNOTNULL") return "is not null"; // ISNOTNULLパラメータを送信
    return value;
  }
  console.log("🔥メインコンテナーnewSearchMeeting_Contact_CompanyParams", newSearchMeeting_Contact_CompanyParams);

  // 編集モードtrueの場合、サーチ条件をinputタグのvalueに格納
  // 新規サーチの場合には、サーチ条件を空にする
  useEffect(() => {
    if (newSearchMeeting_Contact_CompanyParams === null) return;
    console.log(
      "🔥メインコンテナーnewSearchMeeting_Contact_CompanyParams編集モード",
      newSearchMeeting_Contact_CompanyParams
    );
    if (editSearchMode) {
      //   setInputCompanyName(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.company_name));
      setInputCompanyName(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams["client_companies.name"]));
      setInputDepartmentName(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.department_name));
      //   setInputContactName(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.contact_name));
      setInputContactName(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams["contacts.name"]));
      setInputTel(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams?.main_phone_number));
      setInputFax(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams?.main_fax));
      setInputZipcode(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams?.zipcode));
      setInputEmployeesClass(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams?.number_of_employees_class));
      setInputAddress(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams?.address));
      setInputCapital(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams?.capital));
      setInputFound(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams?.established_in));
      setInputContent(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams?.business_content));
      setInputHP(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.website_url));
      //   setInputCompanyEmail(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.company_email));
      setInputCompanyEmail(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams["client_companies.email"]));
      setInputIndustryType(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.industry_type));
      setInputProductL(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.product_category_large));
      setInputProductM(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.product_category_medium));
      setInputProductS(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.product_category_small));
      setInputFiscal(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.fiscal_end_month));
      setInputBudgetRequestMonth1(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.budget_request_month1));
      setInputBudgetRequestMonth2(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.budget_request_month2));
      setInputClient(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.clients));
      setInputSupplier(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.supplier));
      setInputFacility(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.facility));
      setInputBusinessSite(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.business_sites));
      setInputOverseas(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.overseas_bases));
      setInputGroup(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.group_company));
      setInputCorporateNum(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.corporate_number));

      // contactsテーブル
      //   setInputContactName(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.contact_name));
      setInputContactName(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams["contacts.name"]));
      setInputDirectLine(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.direct_line));
      setInputDirectFax(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.direct_fax));
      setInputExtension(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.extension));
      setInputCompanyCellPhone(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.company_cell_phone));
      setInputPersonalCellPhone(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.personal_cell_phone));
      //   setInputContactEmail(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.contact_email));
      setInputContactEmail(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams["contacts.email"]));
      setInputPositionName(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.position_name));
      setInputPositionClass(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.position_class));
      setInputOccupation(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.occupation));
      setInputApprovalAmount(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.approval_amount));
      setInputContactCreatedByCompanyId(
        beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams["contacts.created_by_company_id"])
      );
      setInputContactCreatedByUserId(
        beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams["contacts.created_by_user_id"])
      );

      // meetingsテーブル
      setInputMeetingCreatedByCompanyId(
        beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams["meetings.created_by_company_id"])
      );
      setInputMeetingCreatedByUserId(
        beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams["meetings.created_by_user_id"])
      );
      setInputMeetingCreatedByDepartmentOfUser(
        beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams["meetings.created_by_department_of_user"])
      );
      setInputMeetingCreatedByUnitOfUser(
        beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams["meetings.created_by_unit_of_user"])
      );
      setInputMeetingType(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.meeting_type));
      // setInputScheduledFollowUpDate(
      //   beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.scheduled_follow_up_date)
      // );
      // setInputScheduledFollowUpDate(newSearchMeeting_Contact_CompanyParams.scheduled_follow_up_date);
      setInputWebTool("");
      setInputPlannedDate(
        newSearchMeeting_Contact_CompanyParams.planned_date
          ? new Date(newSearchMeeting_Contact_CompanyParams.planned_date)
          : null
      );
      // 時間、秒を分割して格納
      setInputPlannedStartTime(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.planned_start_time));
      const [plannedStartHour, plannedStartMinute] = newSearchMeeting_Contact_CompanyParams.planned_start_time
        ? newSearchMeeting_Contact_CompanyParams.planned_start_time.split(":")
        : [null, null];
      setInputPlannedStartTimeHour(plannedStartHour);
      setInputPlannedStartTimeMinute(plannedStartMinute);
      setInputPlannedPurpose(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.planned_purpose));
      setInputPlannedAppointCheckFlag(newSearchMeeting_Contact_CompanyParams.planned_appoint_check_flag);
      setInputPlannedProduct1(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.planned_product1));
      setInputPlannedProduct2(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.planned_product2));
      setInputPlannedComment(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.planned_comment));
      setInputResultDate(
        newSearchMeeting_Contact_CompanyParams.result_date
          ? new Date(newSearchMeeting_Contact_CompanyParams.result_date)
          : null
      );
      // 時間、分を分割してそれぞれのstateに格納
      setInputResultStartTime(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.result_start_time));
      const [resultStartHour, resultStartMinute] = newSearchMeeting_Contact_CompanyParams.result_start_time
        ? newSearchMeeting_Contact_CompanyParams.result_start_time.split(":")
        : [null, null];
      setInputResultStartTimeHour(resultStartHour);
      setInputResultStartTimeMinute(resultStartMinute);
      // 時間、分を分割してそれぞれのstateに格納
      setInputResultEndTime(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.result_end_time));
      const [resultEndHour, resultEndMinute] = newSearchMeeting_Contact_CompanyParams.result_end_time
        ? newSearchMeeting_Contact_CompanyParams.result_end_time.split(":")
        : [null, null];
      setInputResultEndTimeHour(resultEndHour);
      setInputResultEndTimeMinute(resultEndMinute);
      setInputResultPresentationProduct1(
        beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.result_presentation_product1)
      );
      setInputResultPresentationProduct2(
        beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.result_presentation_product2)
      );
      setInputResultPresentationProduct3(
        beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.result_presentation_product3)
      );
      setInputResultPresentationProduct4(
        beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.result_presentation_product4)
      );
      setInputResultPresentationProduct5(
        beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.result_presentation_product5)
      );
      setInputResultCategory(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.result_category));
      setInputResultSummary(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.result_summary));
      setInputResultNegotiateDecisionMaker(
        beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.result_negotiate_decision_maker)
      );
      setInputPreMeetingParticipationRequest(
        beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.pre_meeting_participation_request)
      );
      setInputMeetingParticipationRequest(
        beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.meeting_participation_request)
      );
      setInputMeetingBusinessOffice(
        beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.meeting_business_office)
      );
      setInputMeetingDepartment(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.meeting_department));
      setInputMeetingMemberName(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.meeting_member_name));
    } else {
      setInputCompanyName("");
      setInputContactName("");
      setInputDepartmentName("");
      setInputContactName("");
      setInputTel("");
      setInputFax("");
      setInputZipcode("");
      setInputEmployeesClass("");
      setInputAddress("");
      setInputCapital("");
      setInputFound("");
      setInputContent("");
      setInputHP("");
      setInputCompanyEmail("");
      setInputIndustryType("");
      setInputProductL("");
      setInputProductM("");
      setInputProductS("");
      setInputFiscal("");
      setInputBudgetRequestMonth1("");
      setInputBudgetRequestMonth2("");
      setInputClient("");
      setInputSupplier("");
      setInputFacility("");
      setInputBusinessSite("");
      setInputOverseas("");
      setInputGroup("");
      setInputCorporateNum("");

      // contactsテーブル
      setInputContactName("");
      setInputDirectLine("");
      setInputDirectFax("");
      setInputExtension("");
      setInputCompanyCellPhone("");
      setInputPersonalCellPhone("");
      setInputContactEmail("");
      setInputPositionName("");
      setInputPositionClass("");
      setInputOccupation("");
      setInputApprovalAmount("");
      setInputContactCreatedByCompanyId("");
      setInputContactCreatedByUserId("");

      // meetingsテーブル
      setInputMeetingCreatedByCompanyId("");
      setInputMeetingCreatedByUserId("");
      setInputMeetingCreatedByDepartmentOfUser("");
      setInputMeetingCreatedByUnitOfUser("");
      setInputMeetingType("");
      setInputWebTool("");
      setInputPlannedDate(null);
      setInputPlannedStartTime(null);
      setInputPlannedStartTimeHour(null);
      setInputPlannedStartTimeMinute(null);
      setInputPlannedPurpose("");
      setInputPlannedAppointCheckFlag(null);
      setInputPlannedProduct1("");
      setInputPlannedProduct2("");
      setInputPlannedComment("");
      setInputResultDate(null);
      setInputResultStartTime(null);
      setInputResultStartTimeHour(null);
      setInputResultStartTimeMinute(null);
      setInputResultEndTime(null);
      setInputResultEndTimeHour(null);
      setInputResultEndTimeMinute(null);
      setInputResultPresentationProduct1("");
      setInputResultPresentationProduct2("");
      setInputResultPresentationProduct3("");
      setInputResultPresentationProduct4("");
      setInputResultPresentationProduct5("");
      setInputResultCategory("");
      setInputResultSummary("");
      setInputResultNegotiateDecisionMaker("");
      setInputPreMeetingParticipationRequest("");
      setInputMeetingParticipationRequest("");
      setInputMeetingBusinessOffice("");
      setInputMeetingDepartment("");
      setInputMeetingMemberName("");
    }
  }, [editSearchMode]);

  // 予定面談開始時間、時間、分、結合用useEffect
  useEffect(() => {
    const formattedTime = `${inputPlannedStartTimeHour}:${inputPlannedStartTimeMinute}`;
    setInputPlannedStartTime(formattedTime);
  }, [inputPlannedStartTimeHour, inputPlannedStartTimeMinute]);
  // 結果面談開始時間、時間、分、結合用useEffect
  useEffect(() => {
    const formattedTime = `${inputResultStartTimeHour}:${inputResultStartTimeMinute}`;
    setInputResultStartTime(formattedTime);
  }, [inputResultStartTimeHour, inputResultStartTimeMinute]);
  // 結果面談終了時間、時間、分、結合用useEffect
  useEffect(() => {
    const formattedTime = `${inputResultEndTimeHour}:${inputResultEndTimeMinute}`;
    setInputResultEndTime(formattedTime);
  }, [inputResultEndTimeHour, inputResultEndTimeMinute]);

  // サーチ関数実行
  const handleSearchSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // // Asterisks to percent signs for PostgreSQL's LIKE operator
    function adjustFieldValue(value: string | null) {
      // if (typeof value === "boolean") return value; // Booleanの場合、そのままの値を返す
      if (value === "") return null; // 全てのデータ
      if (value === null) return null; // 全てのデータ
      if (value.includes("*")) value = value.replace(/\*/g, "%");
      if (value.includes("＊")) value = value.replace(/\＊/g, "%");
      if (value === "is null") return "ISNULL"; // ISNULLパラメータを送信
      // if (value === "is not null") return "%%";
      if (value === "is not null") return "ISNOTNULL"; // ISNOTNULLパラメータを送信
      return value;
    }
    // 数値型のフィールド用
    function adjustFieldValueNumber(value: number | null) {
      if (value === null) return null; // 全てのデータ
      return value;
    }
    setLoadingGlobalState(true);

    let _company_name = adjustFieldValue(inputCompanyName);
    let _department_name = adjustFieldValue(inputDepartmentName);
    let _main_phone_number = adjustFieldValue(inputTel);
    let _main_fax = adjustFieldValue(inputFax);
    let _zipcode = adjustFieldValue(inputZipcode);
    let _number_of_employees_class = adjustFieldValue(inputEmployeesClass);
    let _address = adjustFieldValue(inputAddress);
    let _capital = adjustFieldValue(inputCapital);
    let _established_in = adjustFieldValue(inputFound);
    let _business_content = adjustFieldValue(inputContent);
    let _website_url = adjustFieldValue(inputHP);
    let _company_email = adjustFieldValue(inputCompanyEmail);
    let _industry_type = adjustFieldValue(inputIndustryType);
    let _product_category_large = adjustFieldValue(inputProductL);
    let _product_category_medium = adjustFieldValue(inputProductM);
    let _product_category_small = adjustFieldValue(inputProductS);
    let _fiscal_end_month = adjustFieldValue(inputFiscal);
    let _budget_request_month1 = adjustFieldValue(inputBudgetRequestMonth1);
    let _budget_request_month2 = adjustFieldValue(inputBudgetRequestMonth2);
    let _clients = adjustFieldValue(inputClient);
    let _supplier = adjustFieldValue(inputSupplier);
    let _facility = adjustFieldValue(inputFacility);
    let _business_sites = adjustFieldValue(inputBusinessSite);
    let _overseas_bases = adjustFieldValue(inputOverseas);
    let _group_company = adjustFieldValue(inputGroup);
    let _corporate_number = adjustFieldValue(inputCorporateNum);
    // contactsテーブル
    let _contact_name = adjustFieldValue(inputContactName);
    let _direct_line = adjustFieldValue(inputDirectLine);
    let _direct_fax = adjustFieldValue(inputDirectFax);
    let _extension = adjustFieldValue(inputExtension);
    let _company_cell_phone = adjustFieldValue(inputCompanyCellPhone);
    let _personal_cell_phone = adjustFieldValue(inputPersonalCellPhone);
    let _contact_email = adjustFieldValue(inputContactEmail);
    let _position_name = adjustFieldValue(inputPositionName);
    let _position_class = adjustFieldValue(inputPositionClass);
    let _occupation = adjustFieldValue(inputOccupation);
    let _approval_amount = adjustFieldValue(inputApprovalAmount);
    let _contact_created_by_company_id = adjustFieldValue(inputContactCreatedByCompanyId);
    let _contact_created_by_user_id = adjustFieldValue(inputContactCreatedByUserId);
    // meetingsテーブル
    let _meeting_created_by_company_id = adjustFieldValue(inputMeetingCreatedByCompanyId);
    let _meeting_created_by_user_id = adjustFieldValue(inputMeetingCreatedByUserId);
    let _meeting_created_by_department_of_user = adjustFieldValue(inputMeetingCreatedByDepartmentOfUser);
    let _meeting_created_by_unit_of_user = adjustFieldValue(inputMeetingCreatedByUnitOfUser);
    let _meeting_type = adjustFieldValue(inputMeetingType);
    let _web_tool = adjustFieldValue(inputWebTool);
    let _planned_date = inputPlannedDate ? inputPlannedDate.toISOString() : null;
    let _planned_start_time = adjustFieldValue(inputPlannedStartTime);
    let _planned_purpose = adjustFieldValue(inputPlannedPurpose);
    let _planned_duration = adjustFieldValueNumber(inputPlannedDuration);
    let _planned_appoint_check_flag = inputPlannedAppointCheckFlag;
    let _planned_product1 = adjustFieldValue(inputPlannedProduct1);
    let _planned_product2 = adjustFieldValue(inputPlannedProduct2);
    let _planned_comment = adjustFieldValue(inputPlannedComment);
    let _result_date = inputResultDate ? inputResultDate.toISOString() : null;
    let _result_start_time = adjustFieldValue(inputResultStartTime);
    let _result_end_time = adjustFieldValue(inputResultEndTime);
    let _result_duration = adjustFieldValueNumber(inputResultDuration);
    let _result_number_of_meeting_participants = adjustFieldValueNumber(inputResultNumberOfMeetingParticipants);
    let _result_presentation_product1 = adjustFieldValue(inputResultPresentationProduct1);
    let _result_presentation_product2 = adjustFieldValue(inputResultPresentationProduct2);
    let _result_presentation_product3 = adjustFieldValue(inputResultPresentationProduct3);
    let _result_presentation_product4 = adjustFieldValue(inputResultPresentationProduct4);
    let _result_presentation_product5 = adjustFieldValue(inputResultPresentationProduct5);
    let _result_category = adjustFieldValue(inputResultCategory);
    let _result_summary = adjustFieldValue(inputResultSummary);
    let _result_negotiate_decision_maker = adjustFieldValue(inputResultNegotiateDecisionMaker);
    let _pre_meeting_participation_request = adjustFieldValue(inputPreMeetingParticipationRequest);
    let _meeting_participation_request = adjustFieldValue(inputMeetingParticipationRequest);
    let _meeting_business_office = adjustFieldValue(inputMeetingBusinessOffice);
    let _meeting_department = adjustFieldValue(inputMeetingDepartment);
    let _meeting_member_name = adjustFieldValue(inputMeetingMemberName);

    const params = {
      "client_companies.name": _company_name,
      //   company_name: _company_name,
      department_name: _department_name,
      main_phone_number: _main_phone_number,
      main_fax: _main_fax,
      zipcode: _zipcode,
      address: _address,
      number_of_employees_class: _number_of_employees_class,
      capital: _capital,
      established_in: _established_in,
      business_content: _business_content,
      website_url: _website_url,
      //   company_email: _company_email,
      "client_companies.email": _company_email,
      industry_type: _industry_type,
      product_category_large: _product_category_large,
      product_category_medium: _product_category_medium,
      product_category_small: _product_category_small,
      fiscal_end_month: _fiscal_end_month,
      budget_request_month1: _budget_request_month1,
      budget_request_month2: _budget_request_month2,
      clients: _clients,
      supplier: _supplier,
      facility: _facility,
      business_sites: _business_sites,
      overseas_bases: _overseas_bases,
      group_company: _group_company,
      corporate_number: _corporate_number,
      // contactsテーブル
      //   contact_name: _contact_name,
      "contacts.name": _contact_name,
      direct_line: _direct_line,
      direct_fax: _direct_fax,
      extension: _extension,
      company_cell_phone: _company_cell_phone,
      personal_cell_phone: _personal_cell_phone,
      //   contact_email: _contact_email,
      "contacts.email": _contact_email,
      position_name: _position_name,
      position_class: _position_class,
      occupation: _occupation,
      approval_amount: _approval_amount,
      "contacts.created_by_company_id": _contact_created_by_company_id,
      "contacts.created_by_user_id": _contact_created_by_user_id,
      // activitiesテーブル
      "meetings.created_by_company_id": _meeting_created_by_company_id,
      "meetings.created_by_user_id": _meeting_created_by_user_id,
      "meetings.created_by_department_of_user": _meeting_created_by_department_of_user,
      "meetings.created_by_unit_of_user": _meeting_created_by_unit_of_user,
      meeting_type: _meeting_type,
      web_tool: _web_tool,
      planned_date: _planned_date,
      planned_start_time: _planned_start_time,
      planned_purpose: _planned_purpose,
      planned_duration: _planned_duration,
      planned_appoint_check_flag: _planned_appoint_check_flag,
      planned_product1: _planned_product1,
      planned_product2: _planned_product2,
      planned_comment: _planned_comment,
      result_date: _result_date,
      result_start_time: _result_start_time,
      result_end_time: _result_end_time,
      result_duration: _result_duration,
      result_number_of_meeting_participants: _result_number_of_meeting_participants,
      result_presentation_product1: _result_presentation_product1,
      result_presentation_product2: _result_presentation_product2,
      result_presentation_product3: _result_presentation_product3,
      result_presentation_product4: _result_presentation_product4,
      result_presentation_product5: _result_presentation_product5,
      result_category: _result_category,
      result_summary: _result_summary,
      result_negotiate_decision_maker: _result_negotiate_decision_maker,
      pre_meeting_participation_request: _pre_meeting_participation_request,
      meeting_participation_request: _meeting_participation_request,
      meeting_business_office: _meeting_business_office,
      meeting_department: _meeting_department,
      meeting_member_name: _meeting_member_name,
    };

    // console.log("✅ 条件 params", params);

    // const { data, error } = await supabase.rpc("search_companies_and_contacts", { params });
    // const { data, error } = await supabase.rpc("search_companies", { params });

    setInputCompanyName("");
    setInputDepartmentName("");
    setInputTel("");
    setInputFax("");
    setInputZipcode("");
    setInputEmployeesClass("");
    setInputAddress("");
    setInputCapital("");
    setInputFound("");
    setInputContent("");
    setInputHP("");
    setInputCompanyEmail("");
    setInputIndustryType("");
    setInputProductL("");
    setInputProductM("");
    setInputProductS("");
    setInputFiscal("");
    setInputBudgetRequestMonth1("");
    setInputBudgetRequestMonth2("");
    setInputClient("");
    setInputSupplier("");
    setInputFacility("");
    setInputBusinessSite("");
    setInputOverseas("");
    setInputGroup("");
    setInputCorporateNum("");
    // contactsテーブル
    setInputContactName("");
    setInputDirectLine("");
    setInputDirectFax("");
    setInputExtension("");
    setInputCompanyCellPhone("");
    setInputPersonalCellPhone("");
    setInputContactEmail("");
    setInputPositionName("");
    setInputPositionClass("");
    setInputOccupation("");
    setInputApprovalAmount("");
    setInputContactCreatedByCompanyId("");
    setInputContactCreatedByUserId("");
    // meetingsテーブル
    setInputMeetingCreatedByCompanyId("");
    setInputMeetingCreatedByUserId("");
    setInputMeetingCreatedByDepartmentOfUser("");
    setInputMeetingCreatedByUnitOfUser("");
    setInputMeetingType("");
    setInputWebTool("");
    setInputPlannedDate(null);
    setInputPlannedStartTime("");
    setInputPlannedPurpose("");
    setInputPlannedAppointCheckFlag(null);
    setInputPlannedProduct1("");
    setInputPlannedProduct2("");
    setInputPlannedComment("");
    setInputResultDate(null);
    setInputResultStartTime("");
    setInputResultEndTime("");
    setInputResultPresentationProduct1("");
    setInputResultPresentationProduct2("");
    setInputResultPresentationProduct3("");
    setInputResultPresentationProduct4("");
    setInputResultPresentationProduct5("");
    setInputResultCategory("");
    setInputResultSummary("");
    setInputResultNegotiateDecisionMaker("");
    setInputPreMeetingParticipationRequest("");
    setInputMeetingParticipationRequest("");
    setInputMeetingBusinessOffice("");
    setInputMeetingDepartment("");
    setInputMeetingMemberName("");

    // サーチモードオフ
    setSearchMode(false);
    setEditSearchMode(false);

    // Zustandに検索条件を格納
    // setNewSearchMeeting_Contact_CompanyParams(params);

    // 選択中の列データをリセット
    // setSelectedRowDataMeeting(null);

    console.log("✅ 条件 params", params);
    // const { data, error } = await supabase.rpc("search_companies", { params });
    // const { data, error } = await supabase.rpc("search_companies_and_contacts", { params });
    // const { data, error } = await supabase.rpc("search_activities_and_companies_and_contacts", { params });
    const { data, error } = await supabase.rpc("search_activities_and_companies_and_contacts", { params });

    // 会社IDがnull、つまりまだ有料アカウントを持っていないユーザー
    // const { data, error } = await supabase
    //   .rpc("search_companies_and_contacts", { params })
    //   .is("created_by_company_id", null)
    //   .range(0, 20);

    // ユーザーIDが自身のIDと一致するデータのみ 成功
    // const { data, error } = await supabase
    //   .rpc("search_companies_and_contacts", { params })
    //   .eq("created_by_user_id", `${userProfileState?.id}`)
    //   .range(0, 20);

    if (error) return alert(error.message);
    console.log("✅ 検索結果データ取得 data", data);

    setLoadingGlobalState(false);
  };

  const handleAppointCheckChangeSelectTagValue = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;

    switch (value) {
      case "チェック有り":
        setInputPlannedAppointCheckFlag(true);
        break;
      case "チェック無し":
        setInputPlannedAppointCheckFlag(false);
        break;
      default:
        setInputPlannedAppointCheckFlag(null);
    }
  };

  const hours = Array.from({ length: 24 }, (_, index) => (index < 10 ? "0" + index : "" + index));
  const minutes = Array.from({ length: 12 }, (_, index) => (index * 5 < 10 ? "0" + index * 5 : "" + index * 5));

  // const tableContainerSize = useRootStore(useDashboardStore, (state) => state.tableContainerSize);
  return (
    <form className={`${styles.main_container} w-full `} onSubmit={handleSearchSubmit}>
      {/* ------------------------- スクロールコンテナ ------------------------- */}
      {/* <div className={`${styles.scroll_container} relative flex w-full overflow-y-auto pl-[10px] `}> */}
      <div
        className={`${styles.scroll_container} relative flex w-full overflow-y-auto pl-[10px] ${
          tableContainerSize === "half" && underDisplayFullScreen ? `${styles.height_all}` : ``
        } ${tableContainerSize === "all" && underDisplayFullScreen ? `${styles.height_all}` : ``}`}
      >
        {/* ---------------- 通常モード 左コンテナ ---------------- */}
        {!searchMode && (
          <div
            // className={`${styles.left_container1 h-full min-w-[calc((100vw-var(--sidebar-width))/3)1 pb-[35px] pt-[10px]`}
            className={`${styles.left_container} ${
              isOpenSidebar ? `transition-base02` : `transition-base01`
            } h-full min-w-[calc((100vw-var(--sidebar-width))/3-11px)] max-w-[calc((100vw-var(--sidebar-width))/3-11px)] pb-[35px] pt-[0px]`}
          >
            {/* --------- ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full w-full flex-col`}>
              {/* 予定 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.section_title}`}>予定</span>

                    <span className={`${styles.value} ${styles.value_highlight}`}>
                      {selectedRowDataMeeting?.company_name ? selectedRowDataMeeting?.company_name : ""}
                    </span>
                  </div>
                  <div className={`${styles.section_underline}`}></div>
                </div>
              </div>

              {/* ●訪問日・●訪問ﾀｲﾌﾟ */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>●訪問日</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.planned_date
                          ? format(new Date(selectedRowDataMeeting.planned_date), "yyyy/MM/dd")
                          : ""}
                      </span>
                    )}
                    {searchMode && <input type="text" className={`${styles.input_box}`} />}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>●訪問ﾀｲﾌﾟ</span>
                    {/* {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataMeeting?.claim_flag ? selectedRowDataMeeting?.claim_flag : ""}
                        </span>
                      )} */}
                    {searchMode && <input type="text" className={`${styles.input_box}`} />}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 面談開始・WEBツール */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>面談開始</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.planned_start_time ? selectedRowDataMeeting?.planned_start_time : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>WEBﾂｰﾙ</span>
                    {!searchMode && (
                      <span
                        // data-text={`${
                        //   selectedRowDataMeeting?.priority
                        //     ? selectedRowDataMeeting?.priority
                        //     : ""
                        // }`}
                        className={`${styles.value} !w-full text-center`}
                        // onMouseEnter={(e) => handleOpenTooltip(e)}
                        // onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataMeeting?.web_tool ? selectedRowDataMeeting?.web_tool : ""}
                      </span>
                    )}
                    {searchMode && <input type="text" className={`${styles.input_box}`} />}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 面談時間 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>面談時間</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.planned_duration ? selectedRowDataMeeting?.planned_duration : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}></div>
                </div>
              </div>

              {/* 訪問目的・アポ有 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <div className={`${styles.title} !mr-[15px] flex flex-col`}>
                      <span className={``}>訪問目的</span>
                    </div>
                    {!searchMode && (
                      <span
                        // data-text={`${
                        //   selectedRowDataMeeting?.managing_director ? selectedRowDataMeeting?.managing_director : ""
                        // }`}
                        className={`${styles.value}`}
                        // onMouseEnter={(e) => handleOpenTooltip(e)}
                        // onMouseLeave={handleCloseTooltip}
                      >
                        {/* {selectedRowDataMeeting?.scheduled_follow_up_date
                          ? format(new Date(selectedRowDataMeeting.scheduled_follow_up_date), "yyyy-MM-dd")
                          : ""} */}
                      </span>
                    )}
                    {searchMode && <input type="text" className={`${styles.input_box}`} />}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>

                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} transition-base03 flex h-full items-center `}>
                    <span className={`${styles.check_title}`}>アポ有</span>

                    <div className={`${styles.grid_select_cell_header} `}>
                      <input
                        type="checkbox"
                        checked={!!selectedRowDataMeeting?.planned_appoint_check_flag}
                        onChange={() => {
                          setLoadingGlobalState(false);
                          setIsOpenUpdateMeetingModal(true);
                        }}
                        className={`${styles.grid_select_cell_header_input}`}
                      />
                      <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 紹介予定ﾒｲﾝ・紹介予定ｻﾌﾞ */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>紹介予定ﾒｲﾝ</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.planned_product1 ? selectedRowDataMeeting?.planned_product1 : ""}
                      </span>
                    )}
                    {searchMode && <input type="text" className={`${styles.input_box}`} />}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>紹介予定ｻﾌﾞ</span>
                    {!searchMode && (
                      <span
                        // data-text={`${
                        //   selectedRowDataMeeting?.member_name
                        //     ? selectedRowDataMeeting?.member_name
                        //     : ""
                        // }`}
                        className={`${styles.value}`}
                        // onMouseEnter={(e) => handleOpenTooltip(e)}
                        // onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataMeeting?.planned_product2 ? selectedRowDataMeeting?.planned_product2 : ""}
                      </span>
                    )}
                    {searchMode && <input type="text" className={`${styles.input_box}`} />}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 事前ｺﾒﾝﾄ */}
              {/* <div className={`${styles.row_area} flex h-[90px] w-full items-center`}> */}
              <div className={`${styles.row_area} flex max-h-max min-h-[75px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full `}>
                    <span className={`${styles.title}`}>事前ｺﾒﾝﾄ</span>
                    {!searchMode && (
                      <div
                        className={`${styles.value} max-h-max min-h-[70px] ${styles.textarea_box} ${styles.textarea_box_bg}`}
                        // className={`${styles.value} h-[85px] ${styles.textarea_box} ${styles.textarea_box_bg}`}
                        // onMouseEnter={(e) => handleOpenTooltip(e)}
                        // onMouseLeave={handleCloseTooltip}
                        dangerouslySetInnerHTML={{
                          __html: selectedRowDataMeeting?.planned_comment
                            ? selectedRowDataMeeting?.planned_comment.replace(/\n/g, "<br>")
                            : "",
                        }}
                      ></div>
                    )}
                    {/* {searchMode && (
                        <textarea
                          name="Meeting_summary"
                          id="Meeting_summary"
                          cols={30}
                          rows={10}
                          className={`${styles.textarea_box} `}
                          value={inputSummary}
                          onChange={(e) => setInputSummary(e.target.value)}
                        ></textarea>
                      )} */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 事業部名 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>事業部名</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.meeting_department ? selectedRowDataMeeting?.meeting_department : ""}
                      </span>
                    )}
                    {searchMode && <input type="text" className={`${styles.input_box}`} />}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    {/* <span className={`${styles.title}`}>実施4</span>
                      {!searchMode && (
                        <span
                          data-text={`${
                            selectedRowDataMeeting?.senior_managing_director
                              ? selectedRowDataMeeting?.senior_managing_director
                              : ""
                          }`}
                          className={`${styles.value}`}
                          onMouseEnter={(e) => handleOpenTooltip(e)}
                          onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataMeeting?.senior_managing_director
                            ? selectedRowDataMeeting?.senior_managing_director
                            : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />} */}
                  </div>
                  {/* <div className={`${styles.underline}`}></div> */}
                </div>
              </div>

              {/* 事業所・自社担当 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>事業所</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.meeting_business_office
                          ? selectedRowDataMeeting?.meeting_business_office
                          : ""}
                      </span>
                    )}
                    {searchMode && <input type="text" className={`${styles.input_box}`} />}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>自社担当</span>
                    {!searchMode && (
                      <span
                        // data-text={`${
                        //   selectedRowDataMeeting?.member_name
                        //     ? selectedRowDataMeeting?.member_name
                        //     : ""
                        // }`}
                        className={`${styles.value}`}
                        // onMouseEnter={(e) => handleOpenTooltip(e)}
                        // onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataMeeting?.meeting_member_name ? selectedRowDataMeeting?.meeting_member_name : ""}
                      </span>
                    )}
                    {searchMode && <input type="text" className={`${styles.input_box}`} />}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* --------- ラッパーここまで --------- */}
            </div>
          </div>
        )}
        {/* ---------------- 通常モード 左コンテナここまで ---------------- */}

        {/* ---------------- 通常モード 真ん中コンテナ ---------------- */}
        {!searchMode && (
          <div
            className={`${styles.right_container} ${
              isOpenSidebar ? `transition-base02` : `transition-base01`
            } h-full min-w-[calc((100vw-var(--sidebar-width))/3-11px)] max-w-[calc((100vw-var(--sidebar-width))/3-11px)] grow bg-[aqua]/[0] pb-[35px] pt-[0px]`}
          >
            <div className={`${styles.right_contents_wrapper} flex h-full w-full flex-col bg-[#000]/[0]`}>
              {/* 下エリア 禁止フラグなど */}
              <div
                className={`${styles.right_under_container} h-screen w-full  bg-[#f0f0f0]/[0] ${
                  isOpenSidebar ? `transition-base02` : `transition-base01`
                }`}
              >
                {/* 結果 */}
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
                {/* 面談日 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>面談日</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataMeeting?.result_date
                            ? format(new Date(selectedRowDataMeeting.result_date), "yyyy/MM/dd")
                            : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}></div>
                  </div>
                </div>

                {/* 面談開始・面談終了 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>面談開始</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataMeeting?.result_start_time ? selectedRowDataMeeting?.result_start_time : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>面談終了</span>
                      {!searchMode && (
                        <span
                          // data-text={`${
                          //   selectedRowDataMeeting?.priority
                          //     ? selectedRowDataMeeting?.priority
                          //     : ""
                          // }`}
                          className={`${styles.value} !w-full text-center`}
                          // onMouseEnter={(e) => handleOpenTooltip(e)}
                          // onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataMeeting?.result_end_time ? selectedRowDataMeeting?.result_end_time : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 面談時間・面談人数 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <div className={`${styles.title} !mr-[15px] flex flex-col`}>
                        <span className={``}>面談時間</span>
                      </div>
                      {!searchMode && (
                        <span
                          // data-text={`${
                          //   selectedRowDataMeeting?.managing_director ? selectedRowDataMeeting?.managing_director : ""
                          // }`}
                          className={`${styles.value}`}
                          // onMouseEnter={(e) => handleOpenTooltip(e)}
                          // onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataMeeting?.result_duration
                            ? format(new Date(selectedRowDataMeeting.result_duration), "yyyy-MM-dd")
                            : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>

                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} transition-base03 flex h-full items-center `}>
                      <span className={`${styles.check_title}`}>面談人数</span>

                      <div className={`${styles.grid_select_cell_header} `}>
                        <input
                          type="checkbox"
                          checked={!!selectedRowDataMeeting?.result_number_of_meeting_participants}
                          onChange={() => {
                            setLoadingGlobalState(false);
                            setIsOpenUpdateMeetingModal(true);
                          }}
                          className={`${styles.grid_select_cell_header_input}`}
                        />
                        <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 実施1・実施2 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>実施1</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataMeeting?.result_presentation_product1
                            ? selectedRowDataMeeting?.result_presentation_product1
                            : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>実施2</span>
                      {!searchMode && (
                        <span
                          // data-text={`${
                          //   selectedRowDataMeeting?.senior_managing_director
                          //     ? selectedRowDataMeeting?.senior_managing_director
                          //     : ""
                          // }`}
                          className={`${styles.value}`}
                          // onMouseEnter={(e) => handleOpenTooltip(e)}
                          // onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataMeeting?.result_presentation_product2
                            ? selectedRowDataMeeting?.result_presentation_product2
                            : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 実施3・実施4 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>実施3</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataMeeting?.result_presentation_product3
                            ? selectedRowDataMeeting?.result_presentation_product3
                            : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>実施4</span>
                      {!searchMode && (
                        <span
                          // data-text={`${
                          //   selectedRowDataMeeting?.senior_managing_director
                          //     ? selectedRowDataMeeting?.senior_managing_director
                          //     : ""
                          // }`}
                          className={`${styles.value}`}
                          // onMouseEnter={(e) => handleOpenTooltip(e)}
                          // onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataMeeting?.result_presentation_product4
                            ? selectedRowDataMeeting?.result_presentation_product4
                            : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 実施5 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>実施5</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataMeeting?.result_presentation_product5
                            ? selectedRowDataMeeting?.result_presentation_product5
                            : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}></div>
                  </div>
                </div>

                {/* 概要 */}
                {/* <div className={`${styles.row_area} flex h-[90px] w-full items-center`}> */}
                <div className={`${styles.row_area} flex max-h-max min-h-[75px] w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full `}>
                      <span className={`${styles.title}`}>概要</span>
                      {!searchMode && (
                        <div
                          className={`${styles.value} max-h-max min-h-[70px] ${styles.textarea_box} ${styles.textarea_box_bg}`}
                          // className={`${styles.value} h-[85px] ${styles.textarea_box} ${styles.textarea_box_bg}`}
                          // onMouseEnter={(e) => handleOpenTooltip(e)}
                          // onMouseLeave={handleCloseTooltip}
                          dangerouslySetInnerHTML={{
                            __html: selectedRowDataMeeting?.summary
                              ? selectedRowDataMeeting?.summary.replace(/\n/g, "<br>")
                              : "",
                          }}
                        ></div>
                      )}
                      {/* {searchMode && (
                        <textarea
                          name="Meeting_summary"
                          id="Meeting_summary"
                          cols={30}
                          rows={10}
                          className={`${styles.textarea_box} `}
                          value={inputSummary}
                          onChange={(e) => setInputSummary(e.target.value)}
                        ></textarea>
                      )} */}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 事業部名 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>事業部名</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataMeeting?.department ? selectedRowDataMeeting?.department : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      {/* <span className={`${styles.title}`}>実施4</span>
                      {!searchMode && (
                        <span
                          data-text={`${
                            selectedRowDataMeeting?.senior_managing_director
                              ? selectedRowDataMeeting?.senior_managing_director
                              : ""
                          }`}
                          className={`${styles.value}`}
                          onMouseEnter={(e) => handleOpenTooltip(e)}
                          onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataMeeting?.senior_managing_director
                            ? selectedRowDataMeeting?.senior_managing_director
                            : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />} */}
                    </div>
                    {/* <div className={`${styles.underline}`}></div> */}
                  </div>
                </div>

                {/* 事業所・自社担当 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>事業所</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataMeeting?.business_office ? selectedRowDataMeeting?.business_office : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>自社担当</span>
                      {!searchMode && (
                        <span
                          // data-text={`${
                          //   selectedRowDataMeeting?.member_name
                          //     ? selectedRowDataMeeting?.member_name
                          //     : ""
                          // }`}
                          className={`${styles.value}`}
                          // onMouseEnter={(e) => handleOpenTooltip(e)}
                          // onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataMeeting?.member_name ? selectedRowDataMeeting?.member_name : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 実施1・実施2 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>実施1</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataMeeting?.product_introduction1
                            ? selectedRowDataMeeting?.product_introduction1
                            : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>実施2</span>
                      {!searchMode && (
                        <span
                          // data-text={`${
                          //   selectedRowDataMeeting?.senior_managing_director
                          //     ? selectedRowDataMeeting?.senior_managing_director
                          //     : ""
                          // }`}
                          className={`${styles.value}`}
                          // onMouseEnter={(e) => handleOpenTooltip(e)}
                          // onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataMeeting?.product_introduction2
                            ? selectedRowDataMeeting?.product_introduction2
                            : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 実施3・実施4 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>実施3</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataMeeting?.product_introduction3
                            ? selectedRowDataMeeting?.product_introduction3
                            : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>実施4</span>
                      {!searchMode && (
                        <span
                          // data-text={`${
                          //   selectedRowDataMeeting?.senior_managing_director
                          //     ? selectedRowDataMeeting?.senior_managing_director
                          //     : ""
                          // }`}
                          className={`${styles.value}`}
                          // onMouseEnter={(e) => handleOpenTooltip(e)}
                          // onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataMeeting?.product_introduction4
                            ? selectedRowDataMeeting?.product_introduction4
                            : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 実施5 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>実施5</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataMeeting?.product_introduction5
                            ? selectedRowDataMeeting?.product_introduction5
                            : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      {/* <span className={`${styles.title}`}>実施4</span>
                      {!searchMode && (
                        <span
                          data-text={`${
                            selectedRowDataMeeting?.senior_managing_director
                              ? selectedRowDataMeeting?.senior_managing_director
                              : ""
                          }`}
                          className={`${styles.value}`}
                          onMouseEnter={(e) => handleOpenTooltip(e)}
                          onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataMeeting?.senior_managing_director
                            ? selectedRowDataMeeting?.senior_managing_director
                            : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />} */}
                    </div>
                    {/* <div className={`${styles.underline}`}></div> */}
                  </div>
                </div>

                {/* TEL要注意・TEL要注意理由 */}
                <div className={`${styles.right_row_area}  mt-[10px] flex h-[35px] w-full grow items-center`}>
                  <div className="transition-base03 flex h-full w-1/2  flex-col pr-[20px]">
                    <div className={`${styles.title_box} transition-base03 flex h-full items-center `}>
                      <span className={`${styles.check_title}`}>TEL要注意</span>

                      <div className={`${styles.grid_select_cell_header} `}>
                        <input
                          type="checkbox"
                          // checked={!!checkedColumnHeader} // 初期値
                          checked={!!selectedRowDataMeeting?.call_careful_flag}
                          onChange={() => {
                            setLoadingGlobalState(false);
                            setIsOpenUpdateMeetingModal(true);
                          }}
                          className={`${styles.grid_select_cell_header_input}`}
                        />
                        <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.right_under_title}`}>注意理由</span>
                      {!searchMode && (
                        <span
                          data-text={`${
                            selectedRowDataMeeting?.call_careful_reason
                              ? selectedRowDataMeeting?.call_careful_reason
                              : ""
                          }`}
                          className={`${styles.value}`}
                          onMouseEnter={(e) => handleOpenTooltip(e, "right")}
                          onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataMeeting?.call_careful_reason
                            ? selectedRowDataMeeting?.call_careful_reason
                            : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* メール禁止・資料禁止 */}
                <div className={`${styles.right_row_area}  mt-[10px] flex h-[35px] w-full grow items-center`}>
                  <div className="transition-base03 flex h-full w-1/2  flex-col pr-[20px]">
                    <div className={`${styles.title_box} transition-base03 flex h-full items-center `}>
                      <span className={`${styles.check_title}`}>メール禁止</span>

                      <div className={`${styles.grid_select_cell_header} `}>
                        <input
                          type="checkbox"
                          checked={!!selectedRowDataMeeting?.email_ban_flag}
                          onChange={() => {
                            setLoadingGlobalState(false);
                            setIsOpenUpdateMeetingModal(true);
                          }}
                          className={`${styles.grid_select_cell_header_input}`}
                        />
                        <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="transition-base03 flex h-full w-1/2  flex-col pr-[20px]">
                    <div className={`${styles.title_box} transition-base03 flex h-full items-center `}>
                      <span className={`${styles.check_title}`}>資料禁止</span>

                      <div className={`${styles.grid_select_cell_header} `}>
                        <input
                          type="checkbox"
                          checked={!!selectedRowDataMeeting?.sending_materials_ban_flag}
                          onChange={() => {
                            setLoadingGlobalState(false);
                            setIsOpenUpdateMeetingModal(true);
                          }}
                          className={`${styles.grid_select_cell_header_input}`}
                        />
                        <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* FAX・DM禁止 */}
                <div className={`${styles.right_row_area}  mt-[10px] flex h-[35px] w-full grow items-center`}>
                  <div className="transition-base03 flex h-full w-1/2  flex-col pr-[20px]">
                    <div className={`${styles.title_box} transition-base03 flex h-full items-center `}>
                      <span className={`${styles.check_title}`}>FAX・DM禁止</span>

                      <div className={`${styles.grid_select_cell_header} `}>
                        <input
                          type="checkbox"
                          checked={!!selectedRowDataMeeting?.fax_dm_ban_flag}
                          onChange={() => {
                            setLoadingGlobalState(false);
                            setIsOpenUpdateMeetingModal(true);
                          }}
                          className={`${styles.grid_select_cell_header_input}`}
                        />
                        <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="transition-base03 flex h-full w-1/2  flex-col pr-[20px]">
                    <div className={`${styles.title_box} transition-base03 flex h-full items-center `}></div>
                  </div>
                </div>

                {/* 禁止理由 */}
                <div className={`${styles.row_area} flex h-[70px] w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full `}>
                      <span className={`${styles.title}`}>禁止理由</span>
                      {!searchMode && (
                        <div
                          data-text={`${selectedRowDataMeeting?.ban_reason ? selectedRowDataMeeting?.ban_reason : ""}`}
                          className={`${styles.value} h-[65px]`}
                          onMouseEnter={(e) => handleOpenTooltip(e)}
                          onMouseLeave={handleCloseTooltip}
                          dangerouslySetInnerHTML={{
                            __html: selectedRowDataMeeting?.ban_reason
                              ? selectedRowDataMeeting?.ban_reason.replace(/\n/g, "<br>")
                              : "",
                          }}
                        ></div>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>
                {/* クレーム */}
                <div className={`${styles.row_area} flex h-[70px] w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full  `}>
                      <span className={`${styles.title}`}>クレーム</span>
                      {!searchMode && (
                        <div
                          data-text={`${selectedRowDataMeeting?.claim ? selectedRowDataMeeting?.claim : ""}`}
                          className={`${styles.value} h-[65px]`}
                          onMouseEnter={(e) => handleOpenTooltip(e)}
                          onMouseLeave={handleCloseTooltip}
                          dangerouslySetInnerHTML={{
                            __html: selectedRowDataMeeting?.claim
                              ? selectedRowDataMeeting?.claim.replace(/\n/g, "<br>")
                              : "",
                          }}
                        ></div>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/*  */}
              </div>

              {/*  */}
            </div>
          </div>
        )}
        {/* ---------------- 通常モード 真ん中コンテナここまで ---------------- */}

        {/* ---------------- 通常モード 右コンテナ ---------------- */}
        {!searchMode && (
          <div
            // className={`${styles.left_container1 h-full min-w-[calc((100vw-var(--sidebar-width))/3)1 pb-[35px] pt-[10px]`}
            className={`${styles.left_container} ${
              isOpenSidebar ? `transition-base02` : `transition-base01`
            } h-full min-w-[calc((100vw-var(--sidebar-width))/3-11px)] max-w-[calc((100vw-var(--sidebar-width))/3-11px)] pb-[35px] pt-[0px]`}
          >
            {/* --------- ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full w-full flex-col`}>
              {/* 会社名 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>●会社名</span>
                    {!searchMode && (
                      <span className={`${styles.value} ${styles.value_highlight}`}>
                        {selectedRowDataMeeting?.company_name ? selectedRowDataMeeting?.company_name : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        placeholder="株式会社○○"
                        autoFocus
                        className={`${styles.input_box}`}
                        value={inputCompanyName}
                        onChange={(e) => setInputCompanyName(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 部署名 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>●部署名</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.department_name ? selectedRowDataMeeting?.department_name : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        placeholder="「代表取締役＊」や「＊製造部＊」「＊品質＊」など"
                        className={`${styles.input_box}`}
                        value={inputDepartmentName}
                        onChange={(e) => setInputDepartmentName(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 担当者名 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>担当者名</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.contact_name ? selectedRowDataMeeting?.contact_name : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="tel"
                        placeholder=""
                        className={`${styles.input_box}`}
                        value={inputContactName}
                        onChange={(e) => setInputContactName(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>直通TEL</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.direct_line ? selectedRowDataMeeting?.direct_line : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="tel"
                        className={`${styles.input_box}`}
                        value={inputDirectLine}
                        onChange={(e) => setInputDirectLine(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 内線TEL・代表TEL */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>内線TEL</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.extension ? selectedRowDataMeeting?.extension : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="tel"
                        placeholder=""
                        className={`${styles.input_box}`}
                        value={inputExtension}
                        onChange={(e) => setInputExtension(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>代表TEL</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.main_phone_number ? selectedRowDataMeeting?.main_phone_number : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="tel"
                        className={`${styles.input_box}`}
                        value={inputTel}
                        onChange={(e) => setInputTel(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 直通FAX・代表FAX */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>直通FAX</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.direct_fax ? selectedRowDataMeeting?.direct_fax : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputDirectFax}
                        onChange={(e) => setInputDirectFax(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className={`flex h-full w-1/2 flex-col pr-[20px]`}>
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>代表FAX</span>
                    {/* <span className={`${styles.title}`}>会員専用</span> */}
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.main_fax ? selectedRowDataMeeting?.main_fax : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputFax}
                        onChange={(e) => setInputFax(e.target.value)}
                      />
                    )}
                    {/* {!searchMode && <span className={`${styles.value}`}>有料会員様専用のフィールドです</span>} */}
                    {/* {searchMode && <input type="text" className={`${styles.input_box}`} />} */}
                    {/* サブスク未加入者にはブラーを表示 */}
                    {/* <div className={`${styles.limited_lock_cover_half} flex-center`}>
                    <FaLock />
                  </div> */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 社用携帯・私用携帯 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>社用携帯</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.company_cell_phone ? selectedRowDataMeeting?.company_cell_phone : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputCompanyCellPhone}
                        onChange={(e) => setInputCompanyCellPhone(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>私用携帯</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.personal_cell_phone ? selectedRowDataMeeting?.personal_cell_phone : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputPersonalCellPhone}
                        onChange={(e) => setInputPersonalCellPhone(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* Email */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>E-mail</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.contact_email ? selectedRowDataMeeting?.contact_email : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputContactEmail}
                        onChange={(e) => setInputContactEmail(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 郵便番号・ */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>郵便番号</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.zipcode ? selectedRowDataMeeting?.zipcode : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputZipcode}
                        onChange={(e) => setInputZipcode(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}></span>
                    {/* {!searchMode && (
                    <span className={`${styles.value}`}>
                      {selectedRowDataMeeting?.established_in ? selectedRowDataMeeting?.established_in : ""}
                    </span>
                  )}
                  {searchMode && (
                    <input
                      type="text"
                      className={`${styles.input_box}`}
                      value={inputFound}
                      onChange={(e) => setInputFound(e.target.value)}
                    />
                  )} */}
                  </div>
                  {/* <div className={`${styles.underline}`}></div> */}
                </div>
              </div>

              {/* 住所 */}
              <div className={`${styles.row_area} flex h-[50px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px] ">
                  <div className={`${styles.title_box} flex h-full `}>
                    <span className={`${styles.title}`}>○住所</span>
                    {!searchMode && (
                      <span className={`${styles.textarea_value} h-[45px]`}>
                        {selectedRowDataMeeting?.address ? selectedRowDataMeeting?.address : ""}
                      </span>
                    )}
                    {searchMode && (
                      <textarea
                        name="address"
                        id="address"
                        cols={30}
                        rows={10}
                        placeholder="「神奈川県＊」や「＊大田区＊」など"
                        className={`${styles.textarea_box} `}
                        value={inputAddress}
                        onChange={(e) => setInputAddress(e.target.value)}
                      ></textarea>
                    )}
                  </div>
                  <div className={`${styles.underline} `}></div>
                </div>
              </div>

              {/* 役職名・職位 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>役職名</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.position_name ? selectedRowDataMeeting?.position_name : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputPositionName}
                        onChange={(e) => setInputPositionName(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>職位</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.position_class ? selectedRowDataMeeting?.position_class : ""}
                      </span>
                    )}
                    {searchMode && (
                      // <input
                      //   type="text"
                      //   className={`${styles.input_box} ml-[20px]`}
                      //   value={inputProductL}
                      //   onChange={(e) => setInputProductL(e.target.value)}
                      // />
                      <select
                        name="position_class"
                        id="position_class"
                        className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                        value={inputPositionClass}
                        onChange={(e) => setInputPositionClass(e.target.value)}
                      >
                        <option value=""></option>
                        <option value="1 代表者">1 代表者</option>
                        <option value="2 取締役/役員">2 取締役/役員</option>
                        <option value="3 部長">3 部長</option>
                        <option value="4 課長">4 課長</option>
                        <option value="5 課長未満">5 課長未満</option>
                        <option value="6 所長・工場長">6 所長・工場長</option>
                        <option value="7 不明">7 不明</option>
                      </select>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 担当職種・決裁金額 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>担当職種</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.occupation ? selectedRowDataMeeting?.occupation : ""}
                      </span>
                    )}
                    {searchMode && (
                      // <input
                      //   type="text"
                      //   className={`${styles.input_box} ml-[20px]`}
                      //   value={inputProductL}
                      //   onChange={(e) => setInputProductL(e.target.value)}
                      // />
                      <select
                        name="position_class"
                        id="position_class"
                        className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                        value={inputEmployeesClass}
                        onChange={(e) => setInputEmployeesClass(e.target.value)}
                      >
                        <option value=""></option>
                        <option value="1 社長・専務">1 社長・専務</option>
                        <option value="2 取締役・役員">2 取締役・役員</option>
                        <option value="3 開発・設計">3 開発・設計</option>
                        <option value="4 生産技術">4 生産技術</option>
                        <option value="5 製造">5 製造</option>
                        <option value="6 品質管理・品質保証">6 品質管理・品質保証</option>
                        <option value="7 人事">7 人事</option>
                        <option value="8 経理">8 経理</option>
                        <option value="9 総務">9 総務</option>
                        <option value="10 法務">10 法務</option>
                        <option value="11 財務">11 財務</option>
                        <option value="12 情報システム">12 情報システム</option>
                        <option value="13 マーケティング">13 マーケティング</option>
                        <option value="14 購買">14 購買</option>
                        <option value="15 営業">15 営業</option>
                        <option value="16 企画">16 企画</option>
                        <option value="17 CS">17 CS</option>
                        <option value="18 その他">18 その他</option>
                      </select>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} !mr-[15px]`}>決裁金額(万円)</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.approval_amount ? selectedRowDataMeeting?.approval_amount : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputApprovalAmount}
                        onChange={(e) => setInputApprovalAmount(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 規模（ランク）・決算月 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>規模(ﾗﾝｸ)</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.number_of_employees_class
                          ? selectedRowDataMeeting?.number_of_employees_class
                          : ""}
                      </span>
                    )}
                    {searchMode && (
                      // <input
                      //   type="text"
                      //   className={`${styles.input_box} ml-[20px]`}
                      //   value={inputProductL}
                      //   onChange={(e) => setInputProductL(e.target.value)}
                      // />
                      <select
                        name="position_class"
                        id="position_class"
                        className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                        value={inputEmployeesClass}
                        onChange={(e) => setInputEmployeesClass(e.target.value)}
                      >
                        <option value=""></option>
                        <option value="A 1000名以上">A 1000名以上</option>
                        <option value="B 500-999名">B 500-999名</option>
                        <option value="C 300-499名">C 300-499名</option>
                        <option value="D 200-299名">D 200-299名</option>
                        <option value="E 100-199名">E 100-199名</option>
                        <option value="F 50-99名">F 50-99名</option>
                        <option value="G 50名未満">G 50名未満</option>
                      </select>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>決算月</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.fiscal_end_month ? selectedRowDataMeeting?.fiscal_end_month : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputFiscal}
                        onChange={(e) => setInputFiscal(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 予算申請月1・予算申請月2 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>予算申請月1</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.budget_request_month1
                          ? selectedRowDataMeeting?.budget_request_month1
                          : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputBudgetRequestMonth1}
                        onChange={(e) => setInputBudgetRequestMonth1(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>予算申請月2</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.budget_request_month2
                          ? selectedRowDataMeeting?.budget_request_month2
                          : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputBudgetRequestMonth2}
                        onChange={(e) => setInputBudgetRequestMonth2(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 事業内容 */}
              <div className={`${styles.row_area} flex h-[50px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px] ">
                  <div className={`${styles.title_box}  flex h-full`}>
                    <span className={`${styles.title}`}>事業内容</span>
                    {!searchMode && (
                      <>
                        {/* <span className={`${styles.textarea_value} h-[45px]`}>
                        東京都港区芝浦4-20-2
                        芝浦アイランドブルームタワー602号室あああああああああああああああああああああああああああああ芝浦アイランドブルームタワー602号室222あああああああああああああああああああああああああああああ
                      </span> */}
                        <span
                          data-text={`${
                            selectedRowDataMeeting?.business_content ? selectedRowDataMeeting?.business_content : ""
                          }`}
                          className={`${styles.textarea_value} h-[45px]`}
                          onMouseEnter={(e) => handleOpenTooltip(e)}
                          onMouseLeave={handleCloseTooltip}
                          dangerouslySetInnerHTML={{
                            __html: selectedRowDataMeeting?.business_content
                              ? selectedRowDataMeeting?.business_content.replace(/\n/g, "<br>")
                              : "",
                          }}
                        >
                          {/* {selectedRowDataMeeting?.business_content ? selectedRowDataMeeting?.business_content : ""} */}
                        </span>
                      </>
                    )}
                    {searchMode && (
                      <textarea
                        name="address"
                        id="address"
                        cols={30}
                        rows={10}
                        className={`${styles.textarea_box} `}
                        value={inputContent}
                        onChange={(e) => setInputContent(e.target.value)}
                      ></textarea>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 主要取引先 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>主要取引先</span>
                    {!searchMode && (
                      <span
                        data-text={`${selectedRowDataMeeting?.clients ? selectedRowDataMeeting?.clients : ""}`}
                        className={`${styles.value}`}
                        onMouseEnter={(e) => handleOpenTooltip(e)}
                        onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataMeeting?.clients ? selectedRowDataMeeting?.clients : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputClient}
                        onChange={(e) => setInputClient(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 主要仕入先 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>主要仕入先</span>
                    {!searchMode && (
                      <span
                        data-text={`${selectedRowDataMeeting?.supplier ? selectedRowDataMeeting?.supplier : ""}`}
                        className={`${styles.value}`}
                        onMouseEnter={(e) => handleOpenTooltip(e)}
                        onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataMeeting?.supplier ? selectedRowDataMeeting?.supplier : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputSupplier}
                        onChange={(e) => setInputSupplier(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 設備 */}
              <div className={`${styles.row_area} flex h-[50px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px] ">
                  <div className={`${styles.title_box}  flex h-full`}>
                    <span className={`${styles.title}`}>設備</span>
                    {!searchMode && (
                      <>
                        <span
                          data-text={`${selectedRowDataMeeting?.facility ? selectedRowDataMeeting?.facility : ""}`}
                          className={`${styles.textarea_value} h-[45px]`}
                          onMouseEnter={(e) => handleOpenTooltip(e)}
                          onMouseLeave={handleCloseTooltip}
                          dangerouslySetInnerHTML={{
                            __html: selectedRowDataMeeting?.facility
                              ? selectedRowDataMeeting?.facility.replace(/\n/g, "<br>")
                              : "",
                          }}
                        >
                          {/* {selectedRowDataMeeting?.facility ? selectedRowDataMeeting?.facility : ""} */}
                        </span>
                      </>
                    )}
                    {searchMode && (
                      <textarea
                        name="address"
                        id="address"
                        cols={30}
                        rows={10}
                        className={`${styles.textarea_box} `}
                        value={inputFacility}
                        onChange={(e) => setInputFacility(e.target.value)}
                      ></textarea>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 事業拠点・海外拠点 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>事業拠点</span>
                    {!searchMode && (
                      <span
                        data-text={`${
                          selectedRowDataMeeting?.business_sites ? selectedRowDataMeeting?.business_sites : ""
                        }`}
                        className={`${styles.value}`}
                        onMouseEnter={(e) => handleOpenTooltip(e)}
                        onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataMeeting?.business_sites ? selectedRowDataMeeting?.business_sites : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputBusinessSite}
                        onChange={(e) => setInputBusinessSite(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>海外拠点</span>
                    {!searchMode && (
                      <span
                        data-text={`${
                          selectedRowDataMeeting?.overseas_bases ? selectedRowDataMeeting?.overseas_bases : ""
                        }`}
                        className={`${styles.value}`}
                        onMouseEnter={(e) => handleOpenTooltip(e)}
                        onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataMeeting?.overseas_bases ? selectedRowDataMeeting?.overseas_bases : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputOverseas}
                        onChange={(e) => setInputOverseas(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* グループ会社 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>グループ会社</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        data-text={`${
                          selectedRowDataMeeting?.group_company ? selectedRowDataMeeting?.group_company : ""
                        }`}
                        onMouseEnter={(e) => handleOpenTooltip(e)}
                        onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataMeeting?.group_company ? selectedRowDataMeeting?.group_company : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputGroup}
                        onChange={(e) => setInputGroup(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* HP */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>HP</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.website_url ? selectedRowDataMeeting?.website_url : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        placeholder="「is not null」でHP有りのデータのみ抽出"
                        value={inputHP}
                        onChange={(e) => setInputHP(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 会社Email */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>会社Email</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.company_email ? selectedRowDataMeeting?.company_email : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        placeholder="「is not null」でHP有りのデータのみ抽出"
                        value={inputCompanyEmail}
                        onChange={(e) => setInputCompanyEmail(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 業種 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>○業種</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.industry_type ? selectedRowDataMeeting?.industry_type : ""}
                      </span>
                    )}
                    {searchMode && !inputProductL && (
                      // <input
                      //   type="text"
                      //   className={`${styles.input_box}`}
                      //   value={inputIndustryType}
                      //   onChange={(e) => setInputIndustryType(e.target.value)}
                      // />
                      <select
                        name="position_class"
                        id="position_class"
                        className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                        value={inputIndustryType}
                        onChange={(e) => setInputIndustryType(e.target.value)}
                      >
                        <option value=""></option>
                        <option value="機械要素・部品">機械要素・部品</option>
                        <option value="自動車・輸送機器">自動車・輸送機器</option>
                        <option value="電子部品・半導体">電子部品・半導体</option>
                        <option value="製造・加工受託">製造・加工受託</option>
                        <option value="産業用機械">産業用機械</option>
                        <option value="産業用電気機器">産業用電気機器</option>
                        <option value="IT・情報通信">IT・情報通信</option>
                        <option value="ソフトウェア">ソフトウェア</option>
                        <option value="医薬品・バイオ">医薬品・バイオ</option>
                        <option value="樹脂・プラスチック">樹脂・プラスチック</option>
                        <option value="ゴム製品">ゴム製品</option>
                        <option value="鉄/非鉄金属">鉄/非鉄金属</option>
                        <option value="民生用電気機器">民生用電気機器</option>
                        <option value="航空・宇宙">航空・宇宙</option>
                        <option value="CAD/CAM">CAD/CAM</option>
                        <option value="建材・資材・什器">建材・資材・什器</option>
                        <option value="小売">小売</option>
                        <option value="飲食料品">飲食料品</option>
                        <option value="飲食店・宿泊業">飲食店・宿泊業</option>
                        <option value="公益・特殊・独立行政法人">公益・特殊・独立行政法人</option>
                        <option value="水産・農林業">水産・農林業</option>
                        <option value="繊維">繊維</option>
                        <option value="ガラス・土石製品">ガラス・土石製品</option>
                        <option value="造船・重機">造船・重機</option>
                        <option value="環境">環境</option>
                        <option value="印刷業">印刷業</option>
                        <option value="運輸業">運輸業</option>
                        <option value="金融・証券・保険業">金融・証券・保険業</option>
                        <option value="警察・消防・自衛隊">警察・消防・自衛隊</option>
                        <option value="鉱業">鉱業</option>
                        <option value="紙・バルブ">紙・バルブ</option>
                        <option value="木材">木材</option>
                        <option value="ロボット">ロボット</option>
                        <option value="試験・分析・測定">試験・分析・測定</option>
                        <option value="エネルギー">エネルギー</option>
                        <option value="電気・ガス・水道業">電気・ガス・水道業</option>
                        <option value="医療・福祉">医療・福祉</option>
                        <option value="サービス業">サービス業</option>
                        <option value="その他">その他</option>
                        <option value="化学">化学</option>
                        <option value="セラミックス">セラミックス</option>
                        <option value="食品機械">食品機械</option>
                        <option value="光学機器">光学機器</option>
                        <option value="医療機器">医療機器</option>
                        <option value="その他製造">その他製造</option>
                        <option value="倉庫・運輸関連業">倉庫・運輸関連業</option>
                        <option value="教育・研究機関">教育・研究機関</option>
                        <option value="石油・石炭製品">石油・石炭製品</option>
                        <option value="商社・卸売">商社・卸売</option>
                        <option value="官公庁">官公庁</option>
                        <option value="個人">個人</option>
                        <option value="不明">不明</option>
                      </select>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* 製品分類（大分類） */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !mr-[15px]`}>製品分類（大分類）</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        data-text={`${
                          selectedRowDataMeeting?.product_category_large
                            ? selectedRowDataMeeting?.product_category_large
                            : ""
                        }`}
                        onMouseEnter={(e) => handleOpenTooltip(e)}
                        onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataMeeting?.product_category_large
                          ? selectedRowDataMeeting?.product_category_large
                          : ""}
                      </span>
                    )}
                    {searchMode && !inputIndustryType && (
                      // <input
                      //   type="text"
                      //   className={`${styles.input_box} ml-[20px]`}
                      //   value={inputProductL}
                      //   onChange={(e) => setInputProductL(e.target.value)}
                      // />
                      <select
                        name="position_class"
                        id="position_class"
                        className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                        value={inputProductL}
                        onChange={(e) => setInputProductL(e.target.value)}
                      >
                        <option value=""></option>
                        <option value="電子部品・モジュール">電子部品・モジュール</option>
                        <option value="機械部品">機械部品</option>
                        <option value="製造・加工機械">製造・加工機械</option>
                        <option value="科学・理化学機器">科学・理化学機器</option>
                        <option value="素材・材料">素材・材料</option>
                        <option value="測定・分析">測定・分析</option>
                        <option value="画像処理">画像処理</option>
                        <option value="制御・電機機器">制御・電機機器</option>
                        <option value="工具・消耗品・備品">工具・消耗品・備品</option>
                        <option value="設計・生産支援">設計・生産支援</option>
                        <option value="IT・ネットワーク">IT・ネットワーク</option>
                        <option value="オフィス">オフィス</option>
                        <option value="業務支援サービス">業務支援サービス</option>
                        <option value="セミナー・スキルアップ">セミナー・スキルアップ</option>
                        <option value="その他">その他</option>
                      </select>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* 製品分類（中分類） */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !mr-[15px]`}>製品分類（中分類）</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        data-text={`${
                          selectedRowDataMeeting?.product_category_medium
                            ? selectedRowDataMeeting?.product_category_medium
                            : ""
                        }`}
                        onMouseEnter={(e) => handleOpenTooltip(e)}
                        onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataMeeting?.product_category_medium
                          ? selectedRowDataMeeting?.product_category_medium
                          : ""}
                      </span>
                    )}
                    {searchMode && !!inputProductL && (
                      // <input
                      //   type="text"
                      //   className={`${styles.input_box} ml-[20px]`}
                      //   value={inputProductM}
                      //   onChange={(e) => setInputProductM(e.target.value)}
                      // />
                      <select
                        name="position_class"
                        id="position_class"
                        value={inputProductM}
                        onChange={(e) => setInputProductM(e.target.value)}
                        className={`${
                          inputProductL ? "" : "hidden"
                        } ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      >
                        {inputProductL === "電子部品・モジュール" &&
                          productCategoriesM.moduleCategoryM.map((option) => option)}
                        {inputProductL === "機械部品" &&
                          productCategoriesM.machinePartsCategoryM.map((option) => option)}
                        {inputProductL === "製造・加工機械" &&
                          productCategoriesM.processingMachineryCategoryM.map((option) => option)}
                        {inputProductL === "科学・理化学機器" &&
                          productCategoriesM.scienceCategoryM.map((option) => option)}
                        {inputProductL === "素材・材料" && productCategoriesM.materialCategoryM.map((option) => option)}
                        {inputProductL === "測定・分析" && productCategoriesM.analysisCategoryM.map((option) => option)}
                        {inputProductL === "画像処理" &&
                          productCategoriesM.imageProcessingCategoryM.map((option) => option)}
                        {inputProductL === "制御・電機機器" &&
                          productCategoriesM.controlEquipmentCategoryM.map((option) => option)}
                        {inputProductL === "工具・消耗品・備品" &&
                          productCategoriesM.toolCategoryM.map((option) => option)}
                        {inputProductL === "設計・生産支援" &&
                          productCategoriesM.designCategoryM.map((option) => option)}
                        {inputProductL === "IT・ネットワーク" && productCategoriesM.ITCategoryM.map((option) => option)}
                        {inputProductL === "オフィス" && productCategoriesM.OfficeCategoryM.map((option) => option)}
                        {inputProductL === "業務支援サービス" &&
                          productCategoriesM.businessSupportCategoryM.map((option) => option)}
                        {inputProductL === "セミナー・スキルアップ" &&
                          productCategoriesM.skillUpCategoryM.map((option) => option)}
                        {inputProductL === "その他" && productCategoriesM.othersCategoryM.map((option) => option)}
                      </select>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* 製品分類（小分類） */}
              {/* <div className={`${styles.row_area} flex w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>製品分類（小分類）</span>
                  {!searchMode && (
                    <span
                      className={`${styles.value}`}
                      data-text={`${
                        selectedRowDataMeeting?.product_category_small
                          ? selectedRowDataMeeting?.product_category_small
                          : ""
                      }`}
                      onMouseEnter={(e) => handleOpenTooltip(e)}
                      onMouseLeave={handleCloseTooltip}
                    >
                      {selectedRowDataMeeting?.product_category_small
                        ? selectedRowDataMeeting?.product_category_small
                        : ""}
                    </span>
                  )}
                  {searchMode && (
                    <input
                      type="text"
                      className={`${styles.input_box} ml-[20px]`}
                      value={inputProductS}
                      onChange={(e) => setInputProductS(e.target.value)}
                    />
                  )}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div> */}

              {/* 法人番号・ID */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>○法人番号</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.corporate_number ? selectedRowDataMeeting?.corporate_number : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputCorporateNum}
                        onChange={(e) => setInputCorporateNum(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title_min}`}>会社ID</span>
                    {!searchMode && (
                      <span className={`${styles.value} truncate`}>
                        {selectedRowDataMeeting?.company_id ? selectedRowDataMeeting?.company_id : ""}
                      </span>
                    )}
                    {/* {searchMode && <input type="text" className={`${styles.input_box}`} />} */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* --------- ラッパーここまで --------- */}
            </div>
          </div>
        )}
        {/* ---------------- 通常モード 右コンテナここまで ---------------- */}

        {/* ---------------- サーチモード 左コンテナ input時はstickyにしてnullやis nullなどのボタンや説明を配置 ---------------- */}
        {searchMode && (
          <div
            // className={`${styles.left_container} h-full min-w-[calc((100vw-var(--sidebar-width))/3)] pb-[35px] pt-[10px]`}
            className={`${styles.left_container} h-full min-w-[calc(50vw-var(--sidebar-mini-width))] max-w-[calc(50vw-var(--sidebar-mini-width))] pb-[35px] pt-[10px]`}
          >
            {/* --------- ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full w-full flex-col`}>
              {/* ● */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>●会社名</span>
                    {!searchMode && (
                      <span className={`${styles.value} ${styles.value_highlight}`}>
                        {selectedRowDataMeeting?.company_name ? selectedRowDataMeeting?.company_name : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        placeholder="株式会社○○"
                        autoFocus
                        className={`${styles.input_box}`}
                        value={inputCompanyName}
                        onChange={(e) => setInputCompanyName(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 部署名 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>●部署名</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.department_name ? selectedRowDataMeeting?.department_name : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        placeholder="「代表取締役＊」や「＊製造部＊」「＊品質＊」など"
                        className={`${styles.input_box}`}
                        value={inputDepartmentName}
                        onChange={(e) => setInputDepartmentName(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 担当者名 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>担当者名</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.contact_name ? selectedRowDataMeeting?.contact_name : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="tel"
                        placeholder=""
                        className={`${styles.input_box}`}
                        value={inputContactName}
                        onChange={(e) => setInputContactName(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>直通TEL</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.direct_line ? selectedRowDataMeeting?.direct_line : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="tel"
                        className={`${styles.input_box}`}
                        value={inputDirectLine}
                        onChange={(e) => setInputDirectLine(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 内線TEL・代表TEL */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>内線TEL</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.extension ? selectedRowDataMeeting?.extension : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="tel"
                        placeholder=""
                        className={`${styles.input_box}`}
                        value={inputExtension}
                        onChange={(e) => setInputExtension(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>代表TEL</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.main_phone_number ? selectedRowDataMeeting?.main_phone_number : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="tel"
                        className={`${styles.input_box}`}
                        value={inputTel}
                        onChange={(e) => setInputTel(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 直通FAX・代表FAX */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>直通FAX</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.direct_fax ? selectedRowDataMeeting?.direct_fax : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputDirectFax}
                        onChange={(e) => setInputDirectFax(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className={`flex h-full w-1/2 flex-col pr-[20px]`}>
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>代表FAX</span>
                    {/* <span className={`${styles.title}`}>会員専用</span> */}
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.main_fax ? selectedRowDataMeeting?.main_fax : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputFax}
                        onChange={(e) => setInputFax(e.target.value)}
                      />
                    )}
                    {/* {!searchMode && <span className={`${styles.value}`}>有料会員様専用のフィールドです</span>} */}
                    {/* {searchMode && <input type="text" className={`${styles.input_box}`} />} */}
                    {/* サブスク未加入者にはブラーを表示 */}
                    {/* <div className={`${styles.limited_lock_cover_half} flex-center`}>
                    <FaLock />
                  </div> */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 社用携帯・私用携帯 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>社用携帯</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.company_cell_phone ? selectedRowDataMeeting?.company_cell_phone : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputCompanyCellPhone}
                        onChange={(e) => setInputCompanyCellPhone(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>私用携帯</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.personal_cell_phone ? selectedRowDataMeeting?.personal_cell_phone : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputPersonalCellPhone}
                        onChange={(e) => setInputPersonalCellPhone(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* Email */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>E-mail</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.contact_email ? selectedRowDataMeeting?.contact_email : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputContactEmail}
                        onChange={(e) => setInputContactEmail(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 郵便番号・ */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>郵便番号</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.zipcode ? selectedRowDataMeeting?.zipcode : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputZipcode}
                        onChange={(e) => setInputZipcode(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}></span>
                    {/* {!searchMode && (
                    <span className={`${styles.value}`}>
                      {selectedRowDataMeeting?.established_in ? selectedRowDataMeeting?.established_in : ""}
                    </span>
                  )}
                  {searchMode && (
                    <input
                      type="text"
                      className={`${styles.input_box}`}
                      value={inputFound}
                      onChange={(e) => setInputFound(e.target.value)}
                    />
                  )} */}
                  </div>
                  {/* <div className={`${styles.underline}`}></div> */}
                </div>
              </div>

              {/* 住所 */}
              <div className={`${styles.row_area} flex h-[50px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px] ">
                  <div className={`${styles.title_box} flex h-full `}>
                    <span className={`${styles.title}`}>○住所</span>
                    {!searchMode && (
                      <span className={`${styles.textarea_value} h-[45px]`}>
                        {selectedRowDataMeeting?.address ? selectedRowDataMeeting?.address : ""}
                      </span>
                    )}
                    {searchMode && (
                      <textarea
                        name="address"
                        id="address"
                        cols={30}
                        rows={10}
                        placeholder="「神奈川県＊」や「＊大田区＊」など"
                        className={`${styles.textarea_box} `}
                        value={inputAddress}
                        onChange={(e) => setInputAddress(e.target.value)}
                      ></textarea>
                    )}
                  </div>
                  <div className={`${styles.underline} `}></div>
                </div>
              </div>

              {/* 役職名・職位 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>役職名</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.position_name ? selectedRowDataMeeting?.position_name : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputPositionName}
                        onChange={(e) => setInputPositionName(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>職位</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.position_class ? selectedRowDataMeeting?.position_class : ""}
                      </span>
                    )}
                    {searchMode && (
                      // <input
                      //   type="text"
                      //   className={`${styles.input_box} ml-[20px]`}
                      //   value={inputProductL}
                      //   onChange={(e) => setInputProductL(e.target.value)}
                      // />
                      <select
                        name="position_class"
                        id="position_class"
                        className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                        value={inputPositionClass}
                        onChange={(e) => setInputPositionClass(e.target.value)}
                      >
                        <option value=""></option>
                        <option value="1 代表者">1 代表者</option>
                        <option value="2 取締役/役員">2 取締役/役員</option>
                        <option value="3 部長">3 部長</option>
                        <option value="4 課長">4 課長</option>
                        <option value="5 課長未満">5 課長未満</option>
                        <option value="6 所長・工場長">6 所長・工場長</option>
                        <option value="7 不明">7 不明</option>
                      </select>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 担当職種・決裁金額 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>担当職種</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.occupation ? selectedRowDataMeeting?.occupation : ""}
                      </span>
                    )}
                    {searchMode && (
                      // <input
                      //   type="text"
                      //   className={`${styles.input_box} ml-[20px]`}
                      //   value={inputProductL}
                      //   onChange={(e) => setInputProductL(e.target.value)}
                      // />
                      <select
                        name="position_class"
                        id="position_class"
                        className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                        value={inputEmployeesClass}
                        onChange={(e) => setInputEmployeesClass(e.target.value)}
                      >
                        <option value=""></option>
                        <option value="1 社長・専務">1 社長・専務</option>
                        <option value="2 取締役・役員">2 取締役・役員</option>
                        <option value="3 開発・設計">3 開発・設計</option>
                        <option value="4 生産技術">4 生産技術</option>
                        <option value="5 製造">5 製造</option>
                        <option value="6 品質管理・品質保証">6 品質管理・品質保証</option>
                        <option value="7 人事">7 人事</option>
                        <option value="8 経理">8 経理</option>
                        <option value="9 総務">9 総務</option>
                        <option value="10 法務">10 法務</option>
                        <option value="11 財務">11 財務</option>
                        <option value="12 情報システム">12 情報システム</option>
                        <option value="13 マーケティング">13 マーケティング</option>
                        <option value="14 購買">14 購買</option>
                        <option value="15 営業">15 営業</option>
                        <option value="16 企画">16 企画</option>
                        <option value="17 CS">17 CS</option>
                        <option value="18 その他">18 その他</option>
                      </select>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} !mr-[15px]`}>決裁金額(万円)</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.approval_amount ? selectedRowDataMeeting?.approval_amount : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputApprovalAmount}
                        onChange={(e) => setInputApprovalAmount(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 規模（ランク）・決算月 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>規模(ﾗﾝｸ)</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.number_of_employees_class
                          ? selectedRowDataMeeting?.number_of_employees_class
                          : ""}
                      </span>
                    )}
                    {searchMode && (
                      // <input
                      //   type="text"
                      //   className={`${styles.input_box} ml-[20px]`}
                      //   value={inputProductL}
                      //   onChange={(e) => setInputProductL(e.target.value)}
                      // />
                      <select
                        name="position_class"
                        id="position_class"
                        className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                        value={inputEmployeesClass}
                        onChange={(e) => setInputEmployeesClass(e.target.value)}
                      >
                        <option value=""></option>
                        <option value="A 1000名以上">A 1000名以上</option>
                        <option value="B 500-999名">B 500-999名</option>
                        <option value="C 300-499名">C 300-499名</option>
                        <option value="D 200-299名">D 200-299名</option>
                        <option value="E 100-199名">E 100-199名</option>
                        <option value="F 50-99名">F 50-99名</option>
                        <option value="G 50名未満">G 50名未満</option>
                      </select>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>決算月</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.fiscal_end_month ? selectedRowDataMeeting?.fiscal_end_month : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputFiscal}
                        onChange={(e) => setInputFiscal(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 予算申請月1・予算申請月2 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>予算申請月1</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.budget_request_month1
                          ? selectedRowDataMeeting?.budget_request_month1
                          : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputBudgetRequestMonth1}
                        onChange={(e) => setInputBudgetRequestMonth1(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>予算申請月2</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.budget_request_month2
                          ? selectedRowDataMeeting?.budget_request_month2
                          : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputBudgetRequestMonth2}
                        onChange={(e) => setInputBudgetRequestMonth2(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 事業内容 */}
              <div className={`${styles.row_area} flex h-[50px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px] ">
                  <div className={`${styles.title_box}  flex h-full`}>
                    <span className={`${styles.title}`}>事業内容</span>
                    {!searchMode && (
                      <>
                        {/* <span className={`${styles.textarea_value} h-[45px]`}>
                        東京都港区芝浦4-20-2
                        芝浦アイランドブルームタワー602号室あああああああああああああああああああああああああああああ芝浦アイランドブルームタワー602号室222あああああああああああああああああああああああああああああ
                      </span> */}
                        <span
                          data-text={`${
                            selectedRowDataMeeting?.business_content ? selectedRowDataMeeting?.business_content : ""
                          }`}
                          className={`${styles.textarea_value} h-[45px]`}
                          onMouseEnter={(e) => handleOpenTooltip(e)}
                          onMouseLeave={handleCloseTooltip}
                          dangerouslySetInnerHTML={{
                            __html: selectedRowDataMeeting?.business_content
                              ? selectedRowDataMeeting?.business_content.replace(/\n/g, "<br>")
                              : "",
                          }}
                        >
                          {/* {selectedRowDataMeeting?.business_content ? selectedRowDataMeeting?.business_content : ""} */}
                        </span>
                      </>
                    )}
                    {searchMode && (
                      <textarea
                        name="address"
                        id="address"
                        cols={30}
                        rows={10}
                        className={`${styles.textarea_box} `}
                        value={inputContent}
                        onChange={(e) => setInputContent(e.target.value)}
                      ></textarea>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 主要取引先 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>主要取引先</span>
                    {!searchMode && (
                      <span
                        data-text={`${selectedRowDataMeeting?.clients ? selectedRowDataMeeting?.clients : ""}`}
                        className={`${styles.value}`}
                        onMouseEnter={(e) => handleOpenTooltip(e)}
                        onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataMeeting?.clients ? selectedRowDataMeeting?.clients : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputClient}
                        onChange={(e) => setInputClient(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 主要仕入先 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>主要仕入先</span>
                    {!searchMode && (
                      <span
                        data-text={`${selectedRowDataMeeting?.supplier ? selectedRowDataMeeting?.supplier : ""}`}
                        className={`${styles.value}`}
                        onMouseEnter={(e) => handleOpenTooltip(e)}
                        onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataMeeting?.supplier ? selectedRowDataMeeting?.supplier : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputSupplier}
                        onChange={(e) => setInputSupplier(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 設備 */}
              <div className={`${styles.row_area} flex h-[50px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px] ">
                  <div className={`${styles.title_box}  flex h-full`}>
                    <span className={`${styles.title}`}>設備</span>
                    {!searchMode && (
                      <>
                        <span
                          data-text={`${selectedRowDataMeeting?.facility ? selectedRowDataMeeting?.facility : ""}`}
                          className={`${styles.textarea_value} h-[45px]`}
                          onMouseEnter={(e) => handleOpenTooltip(e)}
                          onMouseLeave={handleCloseTooltip}
                          dangerouslySetInnerHTML={{
                            __html: selectedRowDataMeeting?.facility
                              ? selectedRowDataMeeting?.facility.replace(/\n/g, "<br>")
                              : "",
                          }}
                        >
                          {/* {selectedRowDataMeeting?.facility ? selectedRowDataMeeting?.facility : ""} */}
                        </span>
                      </>
                    )}
                    {searchMode && (
                      <textarea
                        name="address"
                        id="address"
                        cols={30}
                        rows={10}
                        className={`${styles.textarea_box} `}
                        value={inputFacility}
                        onChange={(e) => setInputFacility(e.target.value)}
                      ></textarea>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 事業拠点・海外拠点 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>事業拠点</span>
                    {!searchMode && (
                      <span
                        data-text={`${
                          selectedRowDataMeeting?.business_sites ? selectedRowDataMeeting?.business_sites : ""
                        }`}
                        className={`${styles.value}`}
                        onMouseEnter={(e) => handleOpenTooltip(e)}
                        onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataMeeting?.business_sites ? selectedRowDataMeeting?.business_sites : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputBusinessSite}
                        onChange={(e) => setInputBusinessSite(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>海外拠点</span>
                    {!searchMode && (
                      <span
                        data-text={`${
                          selectedRowDataMeeting?.overseas_bases ? selectedRowDataMeeting?.overseas_bases : ""
                        }`}
                        className={`${styles.value}`}
                        onMouseEnter={(e) => handleOpenTooltip(e)}
                        onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataMeeting?.overseas_bases ? selectedRowDataMeeting?.overseas_bases : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputOverseas}
                        onChange={(e) => setInputOverseas(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* グループ会社 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>グループ会社</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        data-text={`${
                          selectedRowDataMeeting?.group_company ? selectedRowDataMeeting?.group_company : ""
                        }`}
                        onMouseEnter={(e) => handleOpenTooltip(e)}
                        onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataMeeting?.group_company ? selectedRowDataMeeting?.group_company : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputGroup}
                        onChange={(e) => setInputGroup(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* HP */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>HP</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.website_url ? selectedRowDataMeeting?.website_url : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        placeholder="「is not null」でHP有りのデータのみ抽出"
                        value={inputHP}
                        onChange={(e) => setInputHP(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 会社Email */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>会社Email</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.company_email ? selectedRowDataMeeting?.company_email : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        placeholder="「is not null」でHP有りのデータのみ抽出"
                        value={inputCompanyEmail}
                        onChange={(e) => setInputCompanyEmail(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 業種 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>○業種</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.industry_type ? selectedRowDataMeeting?.industry_type : ""}
                      </span>
                    )}
                    {searchMode && !inputProductL && (
                      // <input
                      //   type="text"
                      //   className={`${styles.input_box}`}
                      //   value={inputIndustryType}
                      //   onChange={(e) => setInputIndustryType(e.target.value)}
                      // />
                      <select
                        name="position_class"
                        id="position_class"
                        className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                        value={inputIndustryType}
                        onChange={(e) => setInputIndustryType(e.target.value)}
                      >
                        <option value=""></option>
                        <option value="機械要素・部品">機械要素・部品</option>
                        <option value="自動車・輸送機器">自動車・輸送機器</option>
                        <option value="電子部品・半導体">電子部品・半導体</option>
                        <option value="製造・加工受託">製造・加工受託</option>
                        <option value="産業用機械">産業用機械</option>
                        <option value="産業用電気機器">産業用電気機器</option>
                        <option value="IT・情報通信">IT・情報通信</option>
                        <option value="ソフトウェア">ソフトウェア</option>
                        <option value="医薬品・バイオ">医薬品・バイオ</option>
                        <option value="樹脂・プラスチック">樹脂・プラスチック</option>
                        <option value="ゴム製品">ゴム製品</option>
                        <option value="鉄/非鉄金属">鉄/非鉄金属</option>
                        <option value="民生用電気機器">民生用電気機器</option>
                        <option value="航空・宇宙">航空・宇宙</option>
                        <option value="CAD/CAM">CAD/CAM</option>
                        <option value="建材・資材・什器">建材・資材・什器</option>
                        <option value="小売">小売</option>
                        <option value="飲食料品">飲食料品</option>
                        <option value="飲食店・宿泊業">飲食店・宿泊業</option>
                        <option value="公益・特殊・独立行政法人">公益・特殊・独立行政法人</option>
                        <option value="水産・農林業">水産・農林業</option>
                        <option value="繊維">繊維</option>
                        <option value="ガラス・土石製品">ガラス・土石製品</option>
                        <option value="造船・重機">造船・重機</option>
                        <option value="環境">環境</option>
                        <option value="印刷業">印刷業</option>
                        <option value="運輸業">運輸業</option>
                        <option value="金融・証券・保険業">金融・証券・保険業</option>
                        <option value="警察・消防・自衛隊">警察・消防・自衛隊</option>
                        <option value="鉱業">鉱業</option>
                        <option value="紙・バルブ">紙・バルブ</option>
                        <option value="木材">木材</option>
                        <option value="ロボット">ロボット</option>
                        <option value="試験・分析・測定">試験・分析・測定</option>
                        <option value="エネルギー">エネルギー</option>
                        <option value="電気・ガス・水道業">電気・ガス・水道業</option>
                        <option value="医療・福祉">医療・福祉</option>
                        <option value="サービス業">サービス業</option>
                        <option value="その他">その他</option>
                        <option value="化学">化学</option>
                        <option value="セラミックス">セラミックス</option>
                        <option value="食品機械">食品機械</option>
                        <option value="光学機器">光学機器</option>
                        <option value="医療機器">医療機器</option>
                        <option value="その他製造">その他製造</option>
                        <option value="倉庫・運輸関連業">倉庫・運輸関連業</option>
                        <option value="教育・研究機関">教育・研究機関</option>
                        <option value="石油・石炭製品">石油・石炭製品</option>
                        <option value="商社・卸売">商社・卸売</option>
                        <option value="官公庁">官公庁</option>
                        <option value="個人">個人</option>
                        <option value="不明">不明</option>
                      </select>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* 製品分類（大分類） */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !mr-[15px]`}>製品分類（大分類）</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        data-text={`${
                          selectedRowDataMeeting?.product_category_large
                            ? selectedRowDataMeeting?.product_category_large
                            : ""
                        }`}
                        onMouseEnter={(e) => handleOpenTooltip(e)}
                        onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataMeeting?.product_category_large
                          ? selectedRowDataMeeting?.product_category_large
                          : ""}
                      </span>
                    )}
                    {searchMode && !inputIndustryType && (
                      // <input
                      //   type="text"
                      //   className={`${styles.input_box} ml-[20px]`}
                      //   value={inputProductL}
                      //   onChange={(e) => setInputProductL(e.target.value)}
                      // />
                      <select
                        name="position_class"
                        id="position_class"
                        className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                        value={inputProductL}
                        onChange={(e) => setInputProductL(e.target.value)}
                      >
                        <option value=""></option>
                        <option value="電子部品・モジュール">電子部品・モジュール</option>
                        <option value="機械部品">機械部品</option>
                        <option value="製造・加工機械">製造・加工機械</option>
                        <option value="科学・理化学機器">科学・理化学機器</option>
                        <option value="素材・材料">素材・材料</option>
                        <option value="測定・分析">測定・分析</option>
                        <option value="画像処理">画像処理</option>
                        <option value="制御・電機機器">制御・電機機器</option>
                        <option value="工具・消耗品・備品">工具・消耗品・備品</option>
                        <option value="設計・生産支援">設計・生産支援</option>
                        <option value="IT・ネットワーク">IT・ネットワーク</option>
                        <option value="オフィス">オフィス</option>
                        <option value="業務支援サービス">業務支援サービス</option>
                        <option value="セミナー・スキルアップ">セミナー・スキルアップ</option>
                        <option value="その他">その他</option>
                      </select>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* 製品分類（中分類） */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !mr-[15px]`}>製品分類（中分類）</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        data-text={`${
                          selectedRowDataMeeting?.product_category_medium
                            ? selectedRowDataMeeting?.product_category_medium
                            : ""
                        }`}
                        onMouseEnter={(e) => handleOpenTooltip(e)}
                        onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataMeeting?.product_category_medium
                          ? selectedRowDataMeeting?.product_category_medium
                          : ""}
                      </span>
                    )}
                    {searchMode && !!inputProductL && (
                      // <input
                      //   type="text"
                      //   className={`${styles.input_box} ml-[20px]`}
                      //   value={inputProductM}
                      //   onChange={(e) => setInputProductM(e.target.value)}
                      // />
                      <select
                        name="position_class"
                        id="position_class"
                        value={inputProductM}
                        onChange={(e) => setInputProductM(e.target.value)}
                        className={`${
                          inputProductL ? "" : "hidden"
                        } ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      >
                        {inputProductL === "電子部品・モジュール" &&
                          productCategoriesM.moduleCategoryM.map((option) => option)}
                        {inputProductL === "機械部品" &&
                          productCategoriesM.machinePartsCategoryM.map((option) => option)}
                        {inputProductL === "製造・加工機械" &&
                          productCategoriesM.processingMachineryCategoryM.map((option) => option)}
                        {inputProductL === "科学・理化学機器" &&
                          productCategoriesM.scienceCategoryM.map((option) => option)}
                        {inputProductL === "素材・材料" && productCategoriesM.materialCategoryM.map((option) => option)}
                        {inputProductL === "測定・分析" && productCategoriesM.analysisCategoryM.map((option) => option)}
                        {inputProductL === "画像処理" &&
                          productCategoriesM.imageProcessingCategoryM.map((option) => option)}
                        {inputProductL === "制御・電機機器" &&
                          productCategoriesM.controlEquipmentCategoryM.map((option) => option)}
                        {inputProductL === "工具・消耗品・備品" &&
                          productCategoriesM.toolCategoryM.map((option) => option)}
                        {inputProductL === "設計・生産支援" &&
                          productCategoriesM.designCategoryM.map((option) => option)}
                        {inputProductL === "IT・ネットワーク" && productCategoriesM.ITCategoryM.map((option) => option)}
                        {inputProductL === "オフィス" && productCategoriesM.OfficeCategoryM.map((option) => option)}
                        {inputProductL === "業務支援サービス" &&
                          productCategoriesM.businessSupportCategoryM.map((option) => option)}
                        {inputProductL === "セミナー・スキルアップ" &&
                          productCategoriesM.skillUpCategoryM.map((option) => option)}
                        {inputProductL === "その他" && productCategoriesM.othersCategoryM.map((option) => option)}
                      </select>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* 製品分類（小分類） */}
              {/* <div className={`${styles.row_area} flex w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>製品分類（小分類）</span>
                  {!searchMode && (
                    <span
                      className={`${styles.value}`}
                      data-text={`${
                        selectedRowDataMeeting?.product_category_small
                          ? selectedRowDataMeeting?.product_category_small
                          : ""
                      }`}
                      onMouseEnter={(e) => handleOpenTooltip(e)}
                      onMouseLeave={handleCloseTooltip}
                    >
                      {selectedRowDataMeeting?.product_category_small
                        ? selectedRowDataMeeting?.product_category_small
                        : ""}
                    </span>
                  )}
                  {searchMode && (
                    <input
                      type="text"
                      className={`${styles.input_box} ml-[20px]`}
                      value={inputProductS}
                      onChange={(e) => setInputProductS(e.target.value)}
                    />
                  )}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div> */}

              {/* 法人番号・ID */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>○法人番号</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.corporate_number ? selectedRowDataMeeting?.corporate_number : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputCorporateNum}
                        onChange={(e) => setInputCorporateNum(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title_min}`}>会社ID</span>
                    {!searchMode && (
                      <span className={`${styles.value} truncate`}>
                        {selectedRowDataMeeting?.company_id ? selectedRowDataMeeting?.company_id : ""}
                      </span>
                    )}
                    {/* {searchMode && <input type="text" className={`${styles.input_box}`} />} */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* サーチモード時は左側の下に表示 */}
              {searchMode && (
                <>
                  {/* 活動日・クレーム サーチモード */}
                  <div className={`${styles.row_area} flex w-full items-center`}>
                    <div className="flex h-full w-1/2 flex-col pr-[20px]">
                      <div className={`${styles.title_box} flex h-full items-center `}>
                        <span className={`${styles.title}`}>活動日</span>
                        {/* {searchMode && <input type="text" className={`${styles.input_box}`} />} */}
                        <DatePickerCustomInput
                          startDate={inputMeetingDate}
                          setStartDate={setInputMeetingDate}
                          required={false}
                        />
                      </div>
                      <div className={`${styles.underline}`}></div>
                    </div>
                    <div className="flex h-full w-1/2 flex-col pr-[20px]">
                      <div className={`${styles.title_box} flex h-full items-center`}>
                        <span className={`${styles.title}`}>クレーム</span>
                        {!searchMode && (
                          <span className={`${styles.value}`}>
                            {selectedRowDataMeeting?.claim_flag ? selectedRowDataMeeting?.claim_flag : ""}
                          </span>
                        )}
                        {/* <div className={`${styles.grid_select_cell_header}`}>
                        <input
                          type="checkbox"
                          className={`${styles.grid_select_cell_header_input}`}
                          checked={inputClaimFlag ? inputClaimFlag : false}
                          onChange={() => setInputClaimFlag(!inputClaimFlag)}
                        />
                        <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                        </svg>
                      </div> */}
                        <select
                          name="claim_flag"
                          id="claim_flag"
                          className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                          // value={inputClaimFlag}
                          // onChange={(e) => setInputClaimFlag(e.target.value)}
                          value={inputClaimFlag === null ? "すべて" : inputClaimFlag ? "チェック有り" : "チェック無し"}
                          onChange={handleClaimChangeSelectTagValue}
                        >
                          <option value="すべて">すべて</option>
                          <option value="チェック無し">チェック無し</option>
                          <option value="チェック有り">チェック有り</option>
                        </select>
                      </div>
                      <div className={`${styles.underline}`}></div>
                    </div>
                  </div>

                  {/* 活動タイプ・優先度 サーチモード */}
                  <div className={`${styles.row_area} flex w-full items-center`}>
                    <div className="flex h-full w-1/2 flex-col pr-[20px]">
                      <div className={`${styles.title_box} flex h-full items-center `}>
                        <span className={`${styles.title}`}>活動タイプ</span>
                        {searchMode && (
                          <select
                            name="Meeting_type"
                            id="Meeting_type"
                            className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                            value={inputMeetingType}
                            onChange={(e) => {
                              setInputMeetingType(e.target.value);
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
                        )}
                      </div>
                      <div className={`${styles.underline}`}></div>
                    </div>
                    <div className="flex h-full w-1/2 flex-col pr-[20px]">
                      <div className={`${styles.title_box} flex h-full items-center`}>
                        <span className={`${styles.title}`}>優先度</span>
                        {searchMode && (
                          <select
                            name="priority"
                            id="priority"
                            className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                            value={inputPriority}
                            onChange={(e) => setInputPriority(e.target.value)}
                          >
                            <option value=""></option>
                            <option value="高">高</option>
                            <option value="中">中</option>
                            <option value="低">低</option>
                          </select>
                        )}
                      </div>
                      <div className={`${styles.underline}`}></div>
                    </div>
                  </div>

                  {/* 次回ﾌｫﾛｰ予定日・フォロー完了 サーチモード */}
                  <div className={`${styles.row_area} flex w-full items-center`}>
                    <div className="flex h-full w-1/2 flex-col pr-[20px]">
                      <div className={`${styles.title_box} flex h-full items-center `}>
                        <span className={`${styles.title} !mr-[15px]`}>次回ﾌｫﾛｰ予定日</span>
                        <DatePickerCustomInput
                          startDate={inputScheduledFollowUpDate}
                          setStartDate={setInputScheduledFollowUpDate}
                          required={false}
                        />
                      </div>
                      <div className={`${styles.underline}`}></div>
                    </div>

                    <div className="flex h-full w-1/2 flex-col pr-[20px]">
                      <div className={`${styles.title_box} transition-base03 flex h-full items-center `}>
                        <span className={`${styles.check_title}`}>フォロー完了</span>

                        {/* <div className={`${styles.grid_select_cell_header} `}>
                          <input
                            type="checkbox"
                            checked={!!selectedRowDataMeeting?.follow_up_flag}
                            onChange={() => {
                              setLoadingGlobalState(false);
                              setIsOpenUpdateMeetingModal(true);
                            }}
                            className={`${styles.grid_select_cell_header_input}`}
                          />
                          <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                          </svg>
                        </div> */}
                        <select
                          name="follow_up_flag"
                          id="follow_up_flag"
                          className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                          // value={inputClaimFlag}
                          // onChange={(e) => setInputClaimFlag(e.target.value)}
                          value={
                            inputFollowUpFlag === null ? "すべて" : inputFollowUpFlag ? "チェック有り" : "チェック無し"
                          }
                          onChange={handleFollowUpFlagChangeSelectTagValue}
                        >
                          <option value="すべて">すべて</option>
                          <option value="チェック無し">チェック無し</option>
                          <option value="チェック有り">チェック有り</option>
                        </select>
                      </div>
                      <div className={`${styles.underline}`}></div>
                    </div>
                  </div>

                  {/* 概要 サーチモード */}
                  <div className={`${styles.row_area} flex h-[90px] w-full items-center`}>
                    <div className="flex h-full w-full flex-col pr-[20px]">
                      <div className={`${styles.title_box} flex h-full `}>
                        <span className={`${styles.title}`}>概要</span>
                        {searchMode && (
                          <textarea
                            name="Meeting_summary"
                            id="Meeting_summary"
                            cols={30}
                            rows={10}
                            className={`${styles.textarea_box} `}
                            value={inputSummary}
                            onChange={(e) => setInputSummary(e.target.value)}
                          ></textarea>
                        )}
                      </div>
                      <div className={`${styles.underline}`}></div>
                    </div>
                  </div>

                  {/* 事業部名 サーチモード */}
                  <div className={`${styles.row_area} flex w-full items-center`}>
                    <div className="flex h-full w-1/2 flex-col pr-[20px]">
                      <div className={`${styles.title_box} flex h-full items-center `}>
                        <span className={`${styles.title}`}>事業部名</span>
                        {searchMode && (
                          <input
                            type="text"
                            className={`${styles.input_box}`}
                            placeholder=""
                            value={inputDepartment}
                            onChange={(e) => setInputDepartment(e.target.value)}
                          />
                        )}
                      </div>
                      <div className={`${styles.underline}`}></div>
                    </div>
                    <div className="flex h-full w-1/2 flex-col pr-[20px]">
                      <div className={`${styles.title_box} flex h-full items-center`}>
                        {/* <span className={`${styles.title}`}>実施4</span>
                      {!searchMode && (
                        <span
                          data-text={`${
                            selectedRowDataMeeting?.senior_managing_director
                              ? selectedRowDataMeeting?.senior_managing_director
                              : ""
                          }`}
                          className={`${styles.value}`}
                          onMouseEnter={(e) => handleOpenTooltip(e)}
                          onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataMeeting?.senior_managing_director
                            ? selectedRowDataMeeting?.senior_managing_director
                            : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />} */}
                      </div>
                      {/* <div className={`${styles.underline}`}></div> */}
                    </div>
                  </div>

                  {/* 事業所・自社担当 サーチモード */}
                  <div className={`${styles.row_area} flex w-full items-center`}>
                    <div className="flex h-full w-1/2 flex-col pr-[20px]">
                      <div className={`${styles.title_box} flex h-full items-center `}>
                        <span className={`${styles.title}`}>事業所</span>
                        {searchMode && (
                          <input
                            type="text"
                            className={`${styles.input_box}`}
                            placeholder=""
                            value={inputBusinessOffice}
                            onChange={(e) => setInputBusinessOffice(e.target.value)}
                          />
                        )}
                      </div>
                      <div className={`${styles.underline}`}></div>
                    </div>
                    <div className="flex h-full w-1/2 flex-col pr-[20px]">
                      <div className={`${styles.title_box} flex h-full items-center`}>
                        <span className={`${styles.title}`}>自社担当</span>
                        {searchMode && (
                          <input
                            type="text"
                            className={`${styles.input_box}`}
                            placeholder=""
                            value={inputMemberName}
                            onChange={(e) => setInputMemberName(e.target.value)}
                          />
                        )}
                      </div>
                      <div className={`${styles.underline}`}></div>
                    </div>
                  </div>

                  {/* 実施1・実施2 サーチモード */}
                  <div className={`${styles.row_area} flex w-full items-center`}>
                    <div className="flex h-full w-1/2 flex-col pr-[20px]">
                      <div className={`${styles.title_box} flex h-full items-center `}>
                        <span className={`${styles.title}`}>実施1</span>
                        {searchMode && (
                          <input
                            type="text"
                            className={`${styles.input_box}`}
                            placeholder=""
                            value={inputProductIntroduction1}
                            onChange={(e) => setInputProductIntroduction1(e.target.value)}
                          />
                        )}
                      </div>
                      <div className={`${styles.underline}`}></div>
                    </div>
                    <div className="flex h-full w-1/2 flex-col pr-[20px]">
                      <div className={`${styles.title_box} flex h-full items-center`}>
                        <span className={`${styles.title}`}>実施2</span>
                        {searchMode && (
                          <input
                            type="text"
                            className={`${styles.input_box}`}
                            placeholder=""
                            value={inputProductIntroduction2}
                            onChange={(e) => setInputProductIntroduction2(e.target.value)}
                          />
                        )}
                      </div>
                      <div className={`${styles.underline}`}></div>
                    </div>
                  </div>

                  {/* 実施3・実施4 サーチモード */}
                  <div className={`${styles.row_area} flex w-full items-center`}>
                    <div className="flex h-full w-1/2 flex-col pr-[20px]">
                      <div className={`${styles.title_box} flex h-full items-center `}>
                        <span className={`${styles.title}`}>実施3</span>
                        {searchMode && (
                          <input
                            type="text"
                            className={`${styles.input_box}`}
                            placeholder=""
                            value={inputProductIntroduction3}
                            onChange={(e) => setInputProductIntroduction3(e.target.value)}
                          />
                        )}
                      </div>
                      <div className={`${styles.underline}`}></div>
                    </div>
                    <div className="flex h-full w-1/2 flex-col pr-[20px]">
                      <div className={`${styles.title_box} flex h-full items-center`}>
                        <span className={`${styles.title}`}>実施4</span>
                        {searchMode && (
                          <input
                            type="text"
                            className={`${styles.input_box}`}
                            placeholder=""
                            value={inputProductIntroduction4}
                            onChange={(e) => setInputProductIntroduction4(e.target.value)}
                          />
                        )}
                      </div>
                      <div className={`${styles.underline}`}></div>
                    </div>
                  </div>

                  {/* 実施5 サーチモード */}
                  <div className={`${styles.row_area} flex w-full items-center`}>
                    <div className="flex h-full w-1/2 flex-col pr-[20px]">
                      <div className={`${styles.title_box} flex h-full items-center `}>
                        <span className={`${styles.title}`}>実施5</span>
                        {searchMode && (
                          <input
                            type="text"
                            className={`${styles.input_box}`}
                            placeholder=""
                            value={inputProductIntroduction5}
                            onChange={(e) => setInputProductIntroduction5(e.target.value)}
                          />
                        )}
                      </div>
                      <div className={`${styles.underline}`}></div>
                    </div>
                    <div className="flex h-full w-1/2 flex-col pr-[20px]">
                      <div className={`${styles.title_box} flex h-full items-center`}>
                        {/* <span className={`${styles.title}`}>実施4</span>
                      {!searchMode && (
                        <span
                          data-text={`${
                            selectedRowDataMeeting?.senior_managing_director
                              ? selectedRowDataMeeting?.senior_managing_director
                              : ""
                          }`}
                          className={`${styles.value}`}
                          onMouseEnter={(e) => handleOpenTooltip(e)}
                          onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataMeeting?.senior_managing_director
                            ? selectedRowDataMeeting?.senior_managing_director
                            : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />} */}
                      </div>
                      {/* <div className={`${styles.underline}`}></div> */}
                    </div>
                  </div>
                </>
              )}

              {/* --------- ラッパーここまで --------- */}
            </div>
          </div>
        )}
        {/* ---------------- サーチモード 右コンテナ input時はstickyにしてnullやis nullなどのボタンや説明を配置 ---------------- */}
        {searchMode && (
          <div
            className={`${styles.right_sticky_container} sticky top-0 h-full grow bg-[aqua]/[0] pt-[20px] text-[var(--color-text)] `}
          >
            <div
              className={`${styles.right_sticky_contents_wrapper} flex h-[350px] w-full flex-col rounded-[8px] bg-[var(--color-bg-brand-f10)] px-[20px] `}
            >
              {/* <div className="flex h-[40px] w-full items-center justify-center text-[18px] font-semibold ">
                会社 条件検索
              </div> */}
              <div className={` text-[13px]`}>
                <div className="mt-[5px] flex  min-h-[30px] items-center">○検索したい条件を入力してください。</div>
                <div className="flex  min-h-[30px] items-center">
                  <span className="h-full w-[15px]"></span>
                  例えば、「&quot;東京都大田区&quot;」の会社で「事業拠点」が存在する会社を検索する場合は、「●住所」に「東京都大田区※」と入力し、「事業拠点」に「is
                  not null」と入力してください。
                </div>
                <div className="mt-[5px] flex  min-h-[30px] items-center">
                  ○「※ アスタリスク」は、「前方一致・後方一致・部分一致」を表します
                </div>
                <div className="flex items-center">
                  <span className="h-full w-[15px]"></span>
                  例えば、会社名に「&quot;工業&quot;」と付く会社を検索したい場合に、「※工業※」、「&quot;製作所&quot;」と付く会社は「※製作所※」と検索することで、指定した文字が付くデータを検索可能です
                </div>
                <div className="mt-[5px] flex  min-h-[30px] items-center">
                  ○「is not null」は「&quot;空欄でない&quot;データ」を抽出します
                </div>
                <div className="mt-[5px] flex  min-h-[30px] items-center">
                  ○「is null」は「&quot;空欄の&quot;データ」を抽出します
                </div>
                <div className="mt-[5px] flex  min-h-[30px] items-center">
                  ○項目を空欄のまま検索した場合は、その項目の「全てのデータ」を抽出します
                </div>
                <div className="mt-[10px] flex h-[30px] w-full items-center">
                  <button type="submit" className={`${styles.btn}`}>
                    検索
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </form>
  );
};

export const MeetingMainContainerOneThird = memo(MeetingMainContainerOneThirdMemo);

/* Divider、区切り線 */
//  <div className="flex h-full w-1/2 flex-col pr-[15px]">
//    <div className="flex h-full items-center">○法人番号</div>
//    <div className={`${styles.underline}`}></div>
//  </div>;

/**
 * 
 * <div
        className={`${styles.scroll_container} relative flex w-full overflow-y-auto pl-[10px] ${
          tableContainerSize === "half" ? `${styles.height_all}` : ``
        } ${tableContainerSize === "all" ? `${styles.height_all}` : ``}`}
      >
*/
