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
import { MdClose } from "react-icons/md";
import { toast } from "react-toastify";
import { Zoom } from "@/utils/Helpers/toastHelpers";
import { convertToJapaneseCurrencyFormat } from "@/utils/Helpers/convertToJapaneseCurrencyFormat";
import { convertToMillions } from "@/utils/Helpers/convertToMillions";
import { optionsOccupation } from "@/utils/selectOptions";
import { useQueryDepartments } from "@/hooks/useQueryDepartments";
import { useQueryUnits } from "@/hooks/useQueryUnits";
import { useQueryOffices } from "@/hooks/useQueryOffices";
import { Unit } from "@/types";

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
  const editSearchMode = useDashboardStore((state) => state.editSearchMode);
  const setEditSearchMode = useDashboardStore((state) => state.setEditSearchMode);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  const setHoveredItemPosWrap = useStore((state) => state.setHoveredItemPosWrap);
  const isOpenSidebar = useDashboardStore((state) => state.isOpenSidebar);
  const tableContainerSize = useDashboardStore((state) => state.tableContainerSize);
  const underDisplayFullScreen = useDashboardStore((state) => state.underDisplayFullScreen);
  // 上画面の選択中の列データ会社
  const selectedRowDataMeeting = useDashboardStore((state) => state.selectedRowDataMeeting);
  const setSelectedRowDataMeeting = useDashboardStore((state) => state.setSelectedRowDataMeeting);
  // 担当者編集モーダルオープン
  const setIsOpenUpdateMeetingModal = useDashboardStore((state) => state.setIsOpenUpdateMeetingModal);
  // rpc()サーチ用パラメータ
  const newSearchMeeting_Contact_CompanyParams = useDashboardStore(
    (state) => state.newSearchMeeting_Contact_CompanyParams
  );
  const setNewSearchMeeting_Contact_CompanyParams = useDashboardStore(
    (state) => state.setNewSearchMeeting_Contact_CompanyParams
  );
  // 各フィールドの編集モード => ダブルクリックで各フィールド名をstateに格納し、各フィールドをエディットモードへ
  const isEditModeField = useDashboardStore((state) => state.isEditModeField);
  const setIsEditModeField = useDashboardStore((state) => state.setIsEditModeField);
  const [isComposing, setIsComposing] = useState(false); // 日本語のように変換、確定が存在する言語入力の場合の日本語入力の変換中を保持するstate、日本語入力開始でtrue, エンターキーで変換確定した時にfalse

  const supabase = useSupabaseClient();

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
  const [inputMeetingCreatedByOfficeOfUser, setInputMeetingCreatedByOfficeOfUser] = useState("");
  const [inputMeetingType, setInputMeetingType] = useState("");
  const [inputWebTool, setInputWebTool] = useState("");
  const [inputPlannedDate, setInputPlannedDate] = useState<Date | null>(null);
  const [inputPlannedStartTime, setInputPlannedStartTime] = useState<string>("");
  const [inputPlannedStartTimeHour, setInputPlannedStartTimeHour] = useState<string>("");
  const [inputPlannedStartTimeMinute, setInputPlannedStartTimeMinute] = useState<string>("");
  const [inputPlannedPurpose, setInputPlannedPurpose] = useState("");
  const [inputPlannedDuration, setInputPlannedDuration] = useState<number | null>(null);
  const [inputPlannedAppointCheckFlag, setInputPlannedAppointCheckFlag] = useState<boolean | null>(null);
  const [inputPlannedProduct1, setInputPlannedProduct1] = useState("");
  const [inputPlannedProduct2, setInputPlannedProduct2] = useState("");
  const [inputPlannedComment, setInputPlannedComment] = useState("");
  const [inputResultDate, setInputResultDate] = useState<Date | null>(null);
  const [inputResultStartTime, setInputResultStartTime] = useState<string>("");
  const [inputResultStartTimeHour, setInputResultStartTimeHour] = useState<string>("");
  const [inputResultStartTimeMinute, setInputResultStartTimeMinute] = useState<string>("");
  const [inputResultEndTime, setInputResultEndTime] = useState<string>("");
  const [inputResultEndTimeHour, setInputResultEndTimeHour] = useState<string>("");
  const [inputResultEndTimeMinute, setInputResultEndTimeMinute] = useState<string>("");
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
  const [inputMeetingYearMonth, setInputMeetingYearMonth] = useState<number | null>(null);

  // ================================ 🌟useQuery初回マウント時のフェッチ遅延用🌟 ================================
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    setIsReady(true);
  }, []);
  // ================================ 🌟事業部リスト取得useQuery🌟 ================================
  const {
    data: departmentDataArray,
    isLoading: isLoadingQueryDepartment,
    refetch: refetchQUeryDepartments,
  } = useQueryDepartments(userProfileState?.company_id, isReady);

  // useMutation
  // const { createDepartmentMutation, updateDepartmentFieldMutation, deleteDepartmentMutation } = useMutateDepartment();
  // ================================ ✅事業部リスト取得useQuery✅ ================================
  // ================================ 🌟係・チームリスト取得useQuery🌟 ================================
  const {
    data: unitDataArray,
    isLoading: isLoadingQueryUnit,
    refetch: refetchQUeryUnits,
  } = useQueryUnits(userProfileState?.company_id, isReady);

  // useMutation
  // const { createUnitMutation, updateUnitFieldMutation, updateMultipleUnitFieldsMutation, deleteUnitMutation } =
  // useMutateUnit();
  // ================================ ✅係・チームリスト取得useQuery✅ ================================
  // ================================ 🌟事業所・営業所リスト取得useQuery🌟 ================================
  const {
    data: officeDataArray,
    isLoading: isLoadingQueryOffice,
    refetch: refetchQUeryOffices,
  } = useQueryOffices(userProfileState?.company_id, isReady);

  // useMutation
  // const { createOfficeMutation, updateOfficeFieldMutation, deleteOfficeMutation } = useMutateOffice();
  // ================================ ✅事業所・営業所リスト取得useQuery✅ ================================
  // ======================= 🌟現在の選択した事業部で係・チームを絞り込むuseEffect🌟 =======================
  const [filteredUnitBySelectedDepartment, setFilteredUnitBySelectedDepartment] = useState<Unit[]>([]);
  useEffect(() => {
    // unitが存在せず、stateに要素が1つ以上存在しているなら空にする
    if (!unitDataArray || unitDataArray?.length === 0 || !inputMeetingCreatedByDepartmentOfUser)
      return setFilteredUnitBySelectedDepartment([]);

    // 選択中の事業部が変化するか、unitDataArrayの内容に変更があったら新たに絞り込んで更新する
    if (unitDataArray && unitDataArray.length >= 1 && inputMeetingCreatedByDepartmentOfUser) {
      const filteredUnitArray = unitDataArray.filter(
        (unit) => unit.created_by_department_id === inputMeetingCreatedByDepartmentOfUser
      );
      setFilteredUnitBySelectedDepartment(filteredUnitArray);
    }
  }, [unitDataArray, inputMeetingCreatedByDepartmentOfUser]);
  // ======================= ✅現在の選択した事業部でチームを絞り込むuseEffect✅ =======================

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
  // 数値型のフィールド用
  function adjustFieldValueNumber(value: number | null) {
    if (value === null) return null; // 全てのデータ
    return value;
  }

  // 編集モードtrueの場合、サーチ条件をinputタグのvalueに格納
  // 新規サーチの場合には、サーチ条件を空にする
  useEffect(() => {
    // if (newSearchMeeting_Contact_CompanyParams === null) return;

    if (editSearchMode && searchMode) {
      if (newSearchMeeting_Contact_CompanyParams === null) return;
      console.log(
        "🔥Meetingメインコンテナー useEffect 編集モード inputにnewSearchMeeting_Contact_CompanyParamsを格納",
        newSearchMeeting_Contact_CompanyParams
      );
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
      setInputCapital(
        beforeAdjustFieldValue(
          newSearchMeeting_Contact_CompanyParams?.capital
            ? newSearchMeeting_Contact_CompanyParams?.capital.toString()
            : ""
        )
      );
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
      setInputApprovalAmount(
        beforeAdjustFieldValue(
          newSearchMeeting_Contact_CompanyParams.approval_amount
            ? newSearchMeeting_Contact_CompanyParams.approval_amount.toString()
            : ""
        )
      );
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
      setInputMeetingCreatedByUnitOfUser(
        beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams["meetings.created_by_office_of_user"])
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
        : ["", ""];
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
        : ["", ""];
      setInputResultStartTimeHour(resultStartHour);
      setInputResultStartTimeMinute(resultStartMinute);
      // 時間、分を分割してそれぞれのstateに格納
      setInputResultEndTime(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.result_end_time));
      const [resultEndHour, resultEndMinute] = newSearchMeeting_Contact_CompanyParams.result_end_time
        ? newSearchMeeting_Contact_CompanyParams.result_end_time.split(":")
        : ["", ""];
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
      setInputMeetingYearMonth(adjustFieldValueNumber(newSearchMeeting_Contact_CompanyParams.meeting_year_month));
    } else if (!editSearchMode && searchMode) {
      console.log(
        "🔥Meetingメインコンテナー useEffect 新規サーチモード inputを初期化",
        newSearchMeeting_Contact_CompanyParams
      );
      if (!!inputCompanyName) setInputCompanyName("");
      // if (!!input) setInputContactName("");
      if (!!inputDepartmentName) setInputDepartmentName(""); // 部署名(クライアント)
      if (!!inputTel) setInputTel("");
      if (!!inputFax) setInputFax("");
      if (!!inputZipcode) setInputZipcode("");
      if (!!inputEmployeesClass) setInputEmployeesClass("");
      if (!!inputAddress) setInputAddress("");
      if (!!inputCapital) setInputCapital("");
      if (!!inputFound) setInputFound("");
      if (!!inputContent) setInputContent("");
      if (!!inputHP) setInputHP("");
      if (!!inputCompanyEmail) setInputCompanyEmail("");
      if (!!inputIndustryType) setInputIndustryType("");
      if (!!inputProductL) setInputProductL("");
      if (!!inputProductM) setInputProductM("");
      if (!!inputProductS) setInputProductS("");
      if (!!inputFiscal) setInputFiscal("");
      if (!!inputBudgetRequestMonth1) setInputBudgetRequestMonth1("");
      if (!!inputBudgetRequestMonth2) setInputBudgetRequestMonth2("");
      if (!!inputClient) setInputClient("");
      if (!!inputSupplier) setInputSupplier("");
      if (!!inputFacility) setInputFacility("");
      if (!!inputBusinessSite) setInputBusinessSite("");
      if (!!inputOverseas) setInputOverseas("");
      if (!!inputGroup) setInputGroup("");
      if (!!inputCorporateNum) setInputCorporateNum("");

      // contactsテーブル
      if (!!inputContactName) setInputContactName("");
      if (!!inputDirectLine) setInputDirectLine("");
      if (!!inputDirectFax) setInputDirectFax("");
      if (!!inputExtension) setInputExtension("");
      if (!!inputCompanyCellPhone) setInputCompanyCellPhone("");
      if (!!inputPersonalCellPhone) setInputPersonalCellPhone("");
      if (!!inputContactEmail) setInputContactEmail("");
      if (!!inputPositionName) setInputPositionName("");
      if (!!inputPositionClass) setInputPositionClass("");
      if (!!inputOccupation) setInputOccupation("");
      if (!!inputApprovalAmount) setInputApprovalAmount("");
      if (!!inputContactCreatedByCompanyId) setInputContactCreatedByCompanyId("");
      if (!!inputContactCreatedByUserId) setInputContactCreatedByUserId("");

      // meetingsテーブル
      if (!!inputMeetingCreatedByCompanyId) setInputMeetingCreatedByCompanyId("");
      if (!!inputMeetingCreatedByUserId) setInputMeetingCreatedByUserId("");
      if (!!inputMeetingCreatedByDepartmentOfUser) setInputMeetingCreatedByDepartmentOfUser("");
      if (!!inputMeetingCreatedByUnitOfUser) setInputMeetingCreatedByUnitOfUser("");
      if (!!inputMeetingCreatedByOfficeOfUser) setInputMeetingCreatedByOfficeOfUser("");
      if (!!inputMeetingType) setInputMeetingType("");
      if (!!inputWebTool) setInputWebTool("");
      if (!!inputPlannedDate) setInputPlannedDate(null);
      if (!!inputPlannedStartTime) setInputPlannedStartTime("");
      if (!!inputPlannedStartTimeHour) setInputPlannedStartTimeHour("");
      if (!!inputPlannedStartTimeMinute) setInputPlannedStartTimeMinute("");
      if (!!inputPlannedPurpose) setInputPlannedPurpose("");
      if (!!inputPlannedAppointCheckFlag) setInputPlannedAppointCheckFlag(null);
      if (!!inputPlannedProduct1) setInputPlannedProduct1("");
      if (!!inputPlannedProduct2) setInputPlannedProduct2("");
      if (!!inputPlannedComment) setInputPlannedComment("");
      if (!!inputResultDate) setInputResultDate(null);
      if (!!inputResultStartTime) setInputResultStartTime("");
      if (!!inputResultStartTimeHour) setInputResultStartTimeHour("");
      if (!!inputResultStartTimeMinute) setInputResultStartTimeMinute("");
      if (!!inputResultEndTime) setInputResultEndTime("");
      if (!!inputResultEndTimeHour) setInputResultEndTimeHour("");
      if (!!inputResultEndTimeMinute) setInputResultEndTimeMinute("");
      if (!!inputResultPresentationProduct1) setInputResultPresentationProduct1("");
      if (!!inputResultPresentationProduct2) setInputResultPresentationProduct2("");
      if (!!inputResultPresentationProduct3) setInputResultPresentationProduct3("");
      if (!!inputResultPresentationProduct4) setInputResultPresentationProduct4("");
      if (!!inputResultPresentationProduct5) setInputResultPresentationProduct5("");
      if (!!inputResultCategory) setInputResultCategory("");
      if (!!inputResultSummary) setInputResultSummary("");
      if (!!inputResultNegotiateDecisionMaker) setInputResultNegotiateDecisionMaker("");
      if (!!inputPreMeetingParticipationRequest) setInputPreMeetingParticipationRequest("");
      if (!!inputMeetingParticipationRequest) setInputMeetingParticipationRequest("");
      if (!!inputMeetingBusinessOffice) setInputMeetingBusinessOffice("");
      if (!!inputMeetingDepartment) setInputMeetingDepartment("");
      if (!!inputMeetingMemberName) setInputMeetingMemberName("");
      if (!!inputMeetingYearMonth) setInputMeetingYearMonth(null);
    }
  }, [editSearchMode, searchMode]);

  // // 予定面談開始時間、時間、分、結合用useEffect
  // useEffect(() => {
  //   const formattedTime = `${inputPlannedStartTimeHour}:${inputPlannedStartTimeMinute}`;
  //   setInputPlannedStartTime(formattedTime);
  // }, [inputPlannedStartTimeHour, inputPlannedStartTimeMinute]);
  // // 結果面談開始時間、時間、分、結合用useEffect
  // useEffect(() => {
  //   const formattedTime = `${inputResultStartTimeHour}:${inputResultStartTimeMinute}`;
  //   setInputResultStartTime(formattedTime);
  // }, [inputResultStartTimeHour, inputResultStartTimeMinute]);
  // // 結果面談終了時間、時間、分、結合用useEffect
  // useEffect(() => {
  //   const formattedTime = `${inputResultEndTimeHour}:${inputResultEndTimeMinute}`;
  //   setInputResultEndTime(formattedTime);
  // }, [inputResultEndTimeHour, inputResultEndTimeMinute]);

  // 予定面談開始時間、時間、分、結合用useEffect
  useEffect(() => {
    if (inputPlannedStartTimeHour && inputPlannedStartTimeMinute) {
      const formattedTime = `${inputPlannedStartTimeHour}:${inputPlannedStartTimeMinute}`;
      setInputPlannedStartTime(formattedTime);
    } else {
      setInputPlannedStartTime(""); // or setResultStartTime("");
    }
  }, [inputPlannedStartTimeHour, inputPlannedStartTimeMinute]);
  // 結果面談開始時間、時間、分、結合用useEffect
  useEffect(() => {
    if (inputResultStartTimeHour && inputResultStartTimeMinute) {
      const formattedTime = `${inputResultStartTimeHour}:${inputResultStartTimeMinute}`;
      setInputResultStartTime(formattedTime);
    } else {
      setInputResultStartTime(""); // or setResultStartTime("");
    }
  }, [inputResultStartTimeHour, inputResultStartTimeMinute]);
  // 結果面談終了時間、時間、分、結合用useEffect
  useEffect(() => {
    if (inputResultEndTimeHour && inputResultEndTimeMinute) {
      const formattedTime = `${inputResultEndTimeHour}:${inputResultEndTimeMinute}`;
      setInputResultEndTime(formattedTime);
    } else {
      setInputResultEndTime(""); // or setResultStartTime("");
    }
  }, [inputResultEndTimeHour, inputResultEndTimeMinute]);

  // サーチ関数実行
  const handleSearchSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userProfileState || !userProfileState.company_id) return alert("エラー：ユーザー情報が見つかりませんでした。");

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
    setLoadingGlobalState(true);

    let _company_name = adjustFieldValue(inputCompanyName);
    let _department_name = adjustFieldValue(inputDepartmentName);
    let _main_phone_number = adjustFieldValue(inputTel);
    let _main_fax = adjustFieldValue(inputFax);
    let _zipcode = adjustFieldValue(inputZipcode);
    let _number_of_employees_class = adjustFieldValue(inputEmployeesClass);
    let _address = adjustFieldValue(inputAddress);
    let _capital = adjustFieldValue(inputCapital) ? parseInt(inputCapital, 10) : null;
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
    // let _approval_amount = adjustFieldValue(inputApprovalAmount);
    let _approval_amount = adjustFieldValue(inputApprovalAmount) ? parseInt(inputApprovalAmount, 10) : null;
    let _contact_created_by_company_id = adjustFieldValue(inputContactCreatedByCompanyId);
    let _contact_created_by_user_id = adjustFieldValue(inputContactCreatedByUserId);
    // meetingsテーブル
    let _meeting_created_by_company_id = adjustFieldValue(inputMeetingCreatedByCompanyId);
    let _meeting_created_by_user_id = adjustFieldValue(inputMeetingCreatedByUserId);
    let _meeting_created_by_department_of_user = adjustFieldValue(inputMeetingCreatedByDepartmentOfUser);
    let _meeting_created_by_unit_of_user = adjustFieldValue(inputMeetingCreatedByUnitOfUser);
    let _meeting_created_by_office_of_user = adjustFieldValue(inputMeetingCreatedByOfficeOfUser);
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
    let _meeting_year_month = adjustFieldValueNumber(inputMeetingYearMonth);

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
      // "meetings.created_by_company_id": _meeting_created_by_company_id,
      "meetings.created_by_company_id": userProfileState.company_id,
      "meetings.created_by_user_id": _meeting_created_by_user_id,
      "meetings.created_by_department_of_user": _meeting_created_by_department_of_user,
      "meetings.created_by_unit_of_user": _meeting_created_by_unit_of_user,
      "meetings.created_by_office_of_user": _meeting_created_by_office_of_user,
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
      meeting_year_month: _meeting_year_month,
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
    setInputMeetingCreatedByOfficeOfUser("");
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
    setInputMeetingYearMonth(null);

    // サーチモードオフ
    setSearchMode(false);
    setEditSearchMode(false);

    // Zustandに検索条件を格納
    setNewSearchMeeting_Contact_CompanyParams(params);

    // 選択中の列データをリセット
    setSelectedRowDataMeeting(null);

    console.log("✅ 条件 params", params);
    // const { data, error } = await supabase.rpc("search_companies", { params });
    // const { data, error } = await supabase.rpc("search_companies_and_contacts", { params });
    // const { data, error } = await supabase.rpc("search_activities_and_companies_and_contacts", { params });
    // const { data, error } = await supabase.rpc("search_meetings_and_companies_and_contacts", { params });

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

    // if (error) return alert(error.message);
    // console.log("✅ 検索結果データ取得 data", data);

    // setLoadingGlobalState(false);
  };

  // ==================================== 🌟ツールチップ🌟 ====================================
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
  // ==================================== 🌟ツールチップ🌟 ====================================

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
  const minutes5 = Array.from({ length: 12 }, (_, index) => (index * 5 < 10 ? "0" + index * 5 : "" + index * 5));
  const minutes = Array.from({ length: 60 }, (_, i) => (i < 10 ? "0" + i : "" + i));

  // time型のplanned_start_time、result_start_time、result_end_timeを時間と分のみに変換する関数
  function formatTime(timeStr: string) {
    const [hour, minute] = timeStr.split(":");
    return `${hour}:${minute}`;
  }

  console.log(
    "🔥MeetingMainContainerレンダリング",
    "selectedRowDataMeeting",
    selectedRowDataMeeting,
    "newSearchMeeting_Contact_CompanyParams",
    newSearchMeeting_Contact_CompanyParams
  );
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

                    {/* <span className={`${styles.value} ${styles.value_highlight}`}>
                      {selectedRowDataMeeting?.company_name ? selectedRowDataMeeting?.company_name : ""}
                    </span> */}
                  </div>
                  <div className={`${styles.section_underline}`}></div>
                </div>
              </div>

              {/* ●面談日・●面談ﾀｲﾌﾟ */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>●面談日</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.planned_date
                          ? format(new Date(selectedRowDataMeeting.planned_date), "yyyy/MM/dd")
                          : ""}
                      </span>
                    )}
                    {/* {searchMode && <input type="text" className={`${styles.input_box}`} />} */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>●面談ﾀｲﾌﾟ</span>
                    {!searchMode && (
                      <span className={`${styles.value} text-center`}>
                        {selectedRowDataMeeting?.meeting_type ? selectedRowDataMeeting?.meeting_type : ""}
                      </span>
                    )}
                    {/* {searchMode && <input type="text" className={`${styles.input_box}`} />} */}
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
                        {selectedRowDataMeeting?.planned_start_time
                          ? formatTime(selectedRowDataMeeting?.planned_start_time)
                          : ""}
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
                        // className={`${styles.value} !w-full text-center`}
                        className={`${styles.value} `}
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

              {/* 面談時間(分) */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    {/* <span className={`${styles.title} text-[12px]`}>面談時間(分)</span> */}
                    <div className={`${styles.title} flex flex-col ${styles.double_text}`}>
                      <span className={``}>面談時間</span>
                      <span className={``}>(分)</span>
                    </div>
                    {!searchMode && (
                      <span className={`${styles.value} `}>
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

              {/* 面談目的(訪問目的)・アポ有 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <div className={`${styles.title} !mr-[15px] flex flex-col`}>
                      <span className={``}>面談目的</span>
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
                    <span className={`${styles.title} text-[12px]`}>紹介予定ﾒｲﾝ</span>
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
                    <span className={`${styles.title} text-[12px]`}>紹介予定ｻﾌﾞ</span>
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

              {/* 事前コメント */}
              {/* <div className={`${styles.row_area} flex h-[90px] w-full items-center`}> */}
              <div className={`${styles.row_area_lg_box} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full `}>
                    <span className={`${styles.title}`}>事前ｺﾒﾝﾄ</span>
                    {!searchMode && (
                      <div
                        className={`${styles.textarea_box} ${styles.textarea_box_bg}`}
                        // className={`${styles.full_value} ${styles.textarea_box} ${styles.textarea_box_bg}`}
                        // className={`${styles.value} h-[85px] ${styles.textarea_box} ${styles.textarea_box_bg}`}
                        dangerouslySetInnerHTML={{
                          __html: selectedRowDataMeeting?.planned_comment
                            ? selectedRowDataMeeting?.planned_comment.replace(/\n/g, "<br>")
                            : "",
                        }}
                      ></div>
                    )}
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
                        {selectedRowDataMeeting?.assigned_department_name
                          ? selectedRowDataMeeting?.assigned_department_name
                          : ""}
                      </span>
                    )}
                    {/* {searchMode && <input type="text" className={`${styles.input_box}`} />} */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} ${styles.min}`}>係・ﾁｰﾑ</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        // data-text={`${
                        //   selectedRowDataActivity?.assigned_unit_name ? selectedRowDataActivity?.assigned_unit_name : ""
                        // }`}
                        // onMouseEnter={(e) => {
                        //   e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        //   if (!isDesktopGTE1600) handleOpenTooltip(e);
                        // }}
                        // onMouseLeave={(e) => {
                        //   e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        //   if (!isDesktopGTE1600 || hoveredItemPosWrap) handleCloseTooltip();
                        // }}
                      >
                        {selectedRowDataMeeting?.assigned_unit_name ? selectedRowDataMeeting?.assigned_unit_name : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
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
                        {selectedRowDataMeeting?.assigned_office_name
                          ? selectedRowDataMeeting?.assigned_office_name
                          : ""}
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
        {/* ---------------- 通常モード 左コンテナここまで ---------------- */}

        {/* ---------------- 通常モード 真ん中コンテナ 結果エリア ---------------- */}
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
                {/* 面談日・面談年月度 */}
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
                  {/* <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>面談年月度</span>
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
                          {selectedRowDataMeeting?.meeting_year_month
                            ? selectedRowDataMeeting?.meeting_year_month
                            : null}
                        </span>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div> */}
                </div>

                {/* 面談開始・面談終了 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title} `}>面談開始</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataMeeting?.result_start_time
                            ? formatTime(selectedRowDataMeeting?.result_start_time)
                            : ""}
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
                          className={`${styles.value}`}
                          // onMouseEnter={(e) => handleOpenTooltip(e)}
                          // onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataMeeting?.result_end_time
                            ? formatTime(selectedRowDataMeeting.result_end_time)
                            : ""}
                        </span>
                      )}
                      {/* {searchMode && <input type="text" className={`${styles.input_box}`} />} */}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 面談時間(分)・面談人数 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      {/* <div className={`${styles.title} flex flex-col`}>
                        <span className={`text-[12px]`}>面談時間(分)</span>
                      </div> */}
                      <div className={`${styles.title} flex flex-col ${styles.double_text}`}>
                        <span className={``}>面談時間</span>
                        <span className={``}>(分)</span>
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
                          {selectedRowDataMeeting?.result_duration ? selectedRowDataMeeting?.result_duration : null}
                          {/* {selectedRowDataMeeting?.result_duration
                            ? format(new Date(selectedRowDataMeeting.result_duration), "yyyy-MM-dd")
                            : ""} */}
                        </span>
                      )}
                      {/* {searchMode && <input type="text" className={`${styles.input_box}`} />} */}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>

                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} transition-base03 flex h-full items-center `}>
                      <span className={`${styles.title}`}>面談人数</span>

                      {!searchMode && (
                        <span
                          // data-text={`${
                          //   selectedRowDataMeeting?.managing_director ? selectedRowDataMeeting?.managing_director : ""
                          // }`}
                          className={`${styles.value}`}
                          // onMouseEnter={(e) => handleOpenTooltip(e)}
                          // onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataMeeting?.result_number_of_meeting_participants
                            ? selectedRowDataMeeting?.result_number_of_meeting_participants
                            : null}
                          {/* {selectedRowDataMeeting?.result_duration
                            ? format(new Date(selectedRowDataMeeting.result_duration), "yyyy-MM-dd")
                            : ""} */}
                        </span>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 実施1・実施2 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>実施商品1</span>
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
                      <span className={`${styles.title}`}>実施商品2</span>
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
                      <span className={`${styles.title}`}>実施商品3</span>
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
                      <span className={`${styles.title}`}>実施商品4</span>
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
                      <span className={`${styles.title}`}>実施商品5</span>
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

                {/* 結果ｺﾒﾝﾄ */}
                {/* <div className={`${styles.row_area} flex h-[90px] w-full items-center`}> */}
                <div className={`${styles.row_area_lg_box} flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full `}>
                      <span className={`${styles.title}`}>結果ｺﾒﾝﾄ</span>
                      {!searchMode && (
                        <div
                          className={`${styles.textarea_box} ${styles.textarea_box_bg}`}
                          // className={`${styles.full_value}  ${styles.textarea_box} ${styles.textarea_box_bg}`}
                          // className={`${styles.value} h-[85px] ${styles.textarea_box} ${styles.textarea_box_bg}`}
                          // onMouseEnter={(e) => handleOpenTooltip(e)}
                          // onMouseLeave={handleCloseTooltip}
                          dangerouslySetInnerHTML={{
                            __html: selectedRowDataMeeting?.result_summary
                              ? selectedRowDataMeeting?.result_summary.replace(/\n/g, "<br>")
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

                {/* 訪問結果 */}
                <div className={`${styles.row_area} flex h-[70px] w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full `}>
                      <span className={`${styles.title}`}>訪問結果</span>
                      {!searchMode && (
                        <div
                          // data-text={`${selectedRowDataMeeting?.ban_reason ? selectedRowDataMeeting?.ban_reason : ""}`}
                          className={`${styles.value} h-[65px]`}
                          // onMouseEnter={(e) => handleOpenTooltip(e)}
                          // onMouseLeave={handleCloseTooltip}
                          dangerouslySetInnerHTML={{
                            __html: selectedRowDataMeeting?.result_category
                              ? selectedRowDataMeeting?.result_category.replace(/\n/g, "<br>")
                              : "",
                          }}
                        ></div>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>
                {/* 結果エリアここまで */}
              </div>
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
              {/* 会社情報 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.section_title}`}>会社情報</span>

                    {/* <span className={`${styles.value} ${styles.value_highlight}`}>
                        {selectedRowDataMeeting?.company_name ? selectedRowDataMeeting?.company_name : ""}
                      </span> */}
                  </div>
                  <div className={`${styles.section_underline}`}></div>
                </div>
              </div>
              {/* 会社名 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>●会社名</span>
                    {!searchMode && (
                      <span className={`${styles.value} ${styles.value_highlight} ${styles.text_start}`}>
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
                      <span className={`${styles.value} ${styles.text_start}`}>
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

              {/* 担当者名・直通TEL */}
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
                      <span
                        className={`${styles.value}`}
                        data-text={`${selectedRowDataMeeting?.direct_line ? selectedRowDataMeeting?.direct_line : ""}`}
                        onMouseEnter={(e) => {
                          if (!isOpenSidebar) return;
                          handleOpenTooltip(e);
                        }}
                        onMouseLeave={() => {
                          if (!isOpenSidebar) return;
                          handleCloseTooltip();
                        }}
                      >
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
                      <span
                        className={`${styles.value}`}
                        data-text={`${
                          selectedRowDataMeeting?.main_phone_number ? selectedRowDataMeeting?.main_phone_number : ""
                        }`}
                        onMouseEnter={(e) => {
                          if (!isOpenSidebar) return;
                          handleOpenTooltip(e);
                        }}
                        onMouseLeave={() => {
                          if (!isOpenSidebar) return;
                          handleCloseTooltip();
                        }}
                      >
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
                      <span
                        className={`${styles.value}`}
                        data-text={`${selectedRowDataMeeting?.main_fax ? selectedRowDataMeeting?.main_fax : ""}`}
                        onMouseEnter={(e) => {
                          if (!isOpenSidebar) return;
                          handleOpenTooltip(e);
                        }}
                        onMouseLeave={() => {
                          if (!isOpenSidebar) return;
                          handleCloseTooltip();
                        }}
                      >
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
              <div className={`${styles.row_area_lg_box} flex h-[50px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px] ">
                  <div className={`${styles.title_box} flex h-full`}>
                    <span className={`${styles.title}`}>○住所</span>
                    {!searchMode && (
                      <span className={`${styles.full_value} h-[45px] !overflow-visible !whitespace-normal`}>
                        {selectedRowDataMeeting?.address ? selectedRowDataMeeting?.address : ""}
                      </span>
                    )}
                    {searchMode && (
                      <textarea
                        cols={30}
                        // rows={10}
                        placeholder="「神奈川県＊」や「＊大田区＊」など"
                        className={`${styles.textarea_box} ${styles.textarea_box_search_mode}`}
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
                        className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
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

              {/* 担当職種・決裁金額 通常 */}
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
                      <select
                        name="position_class"
                        id="position_class"
                        className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                        value={inputEmployeesClass}
                        onChange={(e) => setInputEmployeesClass(e.target.value)}
                      >
                        <option value=""></option>
                        {optionsOccupation.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <div className={`${styles.title} flex flex-col text-[12px]`}>
                      <span className={``}>決裁金額</span>
                      <span className={``}>(万円)</span>
                    </div>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.approval_amount ? selectedRowDataMeeting?.approval_amount : ""}
                      </span>
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
                        className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                        value={inputEmployeesClass}
                        onChange={(e) => setInputEmployeesClass(e.target.value)}
                      >
                        <option value=""></option>
                        <option value="A*">A 1000名以上</option>
                        <option value="B*">B 500~999名</option>
                        <option value="C*">C 300~499名</option>
                        <option value="D*">D 200~299名</option>
                        <option value="E*">E 100~199名</option>
                        <option value="F*">F 50~99名</option>
                        <option value="G*">G 1~49名</option>
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
                    <span className={`${styles.title} text-[12px]`}>予算申請月1</span>
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
                    <span className={`${styles.title} text-[12px]`}>予算申請月2</span>
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

              {/* 資本金・設立 通常モード テスト */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    {/* <span className={`${styles.title}`}>資本金(万円)</span> */}
                    <div className={`${styles.title} ${styles.double_text} flex flex-col`}>
                      <span>資本金</span>
                      <span>(万円)</span>
                    </div>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {/* {selectedRowDataCompany?.capital ? selectedRowDataCompany?.capital : ""} */}
                        {selectedRowDataMeeting?.capital
                          ? convertToJapaneseCurrencyFormat(selectedRowDataMeeting.capital)
                          : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={!!inputCapital ? inputCapital : ""}
                        onChange={(e) => setInputCapital(e.target.value)}
                        onBlur={() =>
                          setInputCapital(
                            !!inputCapital && inputCapital !== ""
                              ? (convertToMillions(inputCapital.trim()) as number).toString()
                              : ""
                          )
                        }
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>設立</span>
                    {!searchMode && (
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
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 事業内容 */}
              <div className={`${styles.row_area_lg_box} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px] ">
                  <div className={`${styles.title_box}  flex h-full`}>
                    <span className={`${styles.title}`}>事業内容</span>
                    {!searchMode && (
                      <>
                        <span
                          data-text={`${
                            selectedRowDataMeeting?.business_content ? selectedRowDataMeeting?.business_content : ""
                          }`}
                          // onMouseEnter={(e) => handleOpenTooltip(e)}
                          // onMouseLeave={handleCloseTooltip}
                          onMouseEnter={(e) => handleOpenTooltip(e)}
                          onMouseLeave={handleCloseTooltip}
                          className={`${styles.textarea_value} `}
                          dangerouslySetInnerHTML={{
                            __html: selectedRowDataMeeting?.business_content
                              ? selectedRowDataMeeting?.business_content.replace(/\n/g, "<br>")
                              : "",
                          }}
                        ></span>
                        {/* <div
                          className={`max-h-max min-h-[70px] ${styles.textarea_box} ${styles.textarea_box_bg}`}
                          // className={`${styles.value} h-[85px] ${styles.textarea_box} ${styles.textarea_box_bg}`}
                          // onMouseEnter={(e) => handleOpenTooltip(e)}
                          // onMouseLeave={handleCloseTooltip}
                          dangerouslySetInnerHTML={{
                            __html: selectedRowDataMeeting?.business_content
                              ? selectedRowDataMeeting?.business_content.replace(/\n/g, "<br>")
                              : "",
                          }}
                        ></div> */}
                      </>
                    )}
                    {searchMode && (
                      <textarea
                        name="address"
                        id="address"
                        cols={30}
                        // rows={10}
                        className={`${styles.textarea_box} ${styles.textarea_box_search_mode}`}
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
              <div className={`${styles.row_area_lg_box} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px] ">
                  <div className={`${styles.title_box}  flex h-full`}>
                    <span className={`${styles.title}`}>設備</span>
                    {!searchMode && (
                      <>
                        <span
                          data-text={`${selectedRowDataMeeting?.facility ? selectedRowDataMeeting?.facility : ""}`}
                          className={`${styles.textarea_value}`}
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
                        // rows={10}
                        className={`${styles.textarea_box} ${styles.textarea_box_search_mode}`}
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
                    <span className={`${styles.title}`}>ｸﾞﾙｰﾌﾟ会社</span>
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
                    {/* {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.website_url ? selectedRowDataMeeting?.website_url : ""}
                      </span>
                    )} */}
                    {!searchMode && !!selectedRowDataMeeting?.website_url ? (
                      <a
                        href={selectedRowDataMeeting.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${styles.value} ${styles.anchor}`}
                      >
                        {selectedRowDataMeeting.website_url}
                      </a>
                    ) : (
                      <span></span>
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
                      <span
                        className={`${styles.value} ${styles.email_value}`}
                        onClick={async () => {
                          if (!selectedRowDataMeeting?.company_email) return;
                          try {
                            await navigator.clipboard.writeText(selectedRowDataMeeting.company_email);
                            toast.success(`コピーしました!`, {
                              position: "bottom-center",
                              autoClose: 1000,
                              hideProgressBar: false,
                              closeOnClick: true,
                              pauseOnHover: true,
                              draggable: true,
                              progress: undefined,
                              transition: Zoom,
                            });
                          } catch (e: any) {
                            toast.error(`コピーできませんでした!`, {
                              position: "bottom-center",
                              autoClose: 1000,
                              hideProgressBar: false,
                              closeOnClick: true,
                              pauseOnHover: true,
                              draggable: true,
                              progress: undefined,
                              transition: Zoom,
                            });
                          }
                        }}
                      >
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
                        className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
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
                    <div className={`${styles.title} flex flex-col text-[12px]`}>
                      <span className={``}>製品分類</span>
                      <span className={``}>(大分類)</span>
                    </div>
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
                        className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
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
                    <div className={`${styles.title} flex flex-col text-[12px]`}>
                      <span className={``}>製品分類</span>
                      <span className={``}>(中分類)</span>
                    </div>
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
                        className={`${inputProductL ? "" : "hidden"} ml-auto h-full w-[80%] cursor-pointer  ${
                          styles.select_box
                        }`}
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
                  {/* <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title_min}`}>会社ID</span>
                    {!searchMode && (
                      <span className={`${styles.value} truncate`}>
                        {selectedRowDataMeeting?.company_id ? selectedRowDataMeeting?.company_id : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div> */}
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
            className={`${styles.left_container} h-full min-w-[calc(50vw-var(--sidebar-mini-width))] max-w-[calc(50vw-var(--sidebar-mini-width))] pb-[35px] pt-[0px]`}
          >
            {/* --------- ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full w-full flex-col`}>
              {/* ============= 予定エリアここから============= */}
              {/* 予定 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
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

              {/* ●訪問日・●訪問ﾀｲﾌﾟ サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>●訪問日</span>
                    <DatePickerCustomInput
                      startDate={inputPlannedDate}
                      setStartDate={setInputPlannedDate}
                      required={false}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title_search_mode}`}>●訪問ﾀｲﾌﾟ</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      value={inputMeetingType}
                      onChange={(e) => {
                        setInputMeetingType(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      <option value="訪問">訪問</option>
                      <option value="WEB">WEB</option>
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 面談開始・WEBツール サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>面談開始</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      placeholder="時"
                      value={inputPlannedStartTimeHour}
                      onChange={(e) => setInputPlannedStartTimeHour(e.target.value === "" ? "" : e.target.value)}
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
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      placeholder="分"
                      value={inputPlannedStartTimeMinute}
                      onChange={(e) => setInputPlannedStartTimeMinute(e.target.value === "" ? "" : e.target.value)}
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
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title_search_mode}`}>WEBﾂｰﾙ</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      value={inputMeetingType}
                      onChange={(e) => {
                        setInputMeetingType(e.target.value);
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

              {/* 面談時間(分) サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>面談時間(分)</span>
                    <input
                      type="number"
                      min="0"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={inputPlannedDuration === null ? "" : inputPlannedDuration}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setInputPlannedDuration(null);
                        } else {
                          const numValue = Number(val);

                          // 入力値がマイナスかチェック
                          if (numValue < 0) {
                            setInputPlannedDuration(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                          } else {
                            setInputPlannedDuration(numValue);
                          }
                        }
                      }}
                    />
                    {/* バツボタン */}
                    {!!inputPlannedDuration && (
                      <div className={`${styles.close_btn_number}`} onClick={() => setInputPlannedDuration(null)}>
                        <MdClose className="text-[20px] " />
                      </div>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}></div>
                </div>
              </div>

              {/* 訪問目的・アポ有 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <div className={`${styles.title_search_mode} flex flex-col`}>
                      <span className={``}>訪問目的</span>
                    </div>
                    <select
                      className={`ml-auto h-full w-[100%] cursor-pointer  ${styles.select_box}`}
                      value={inputPlannedPurpose}
                      onChange={(e) => {
                        setInputPlannedPurpose(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      <option value="新規会社/能動">新規会社/能動</option>
                      <option value="被り会社/能動">被り会社/能動</option>
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

                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} transition-base03 flex h-full items-center `}>
                    <span className={`${styles.check_title_search_mode} `}>アポ有</span>

                    <div className={`${styles.grid_select_cell_header} `}>
                      <select
                        className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                        // value={inputClaimFlag}
                        // onChange={(e) => setInputClaimFlag(e.target.value)}
                        value={
                          inputPlannedAppointCheckFlag === null
                            ? // ? "指定なし"
                              ""
                            : inputPlannedAppointCheckFlag
                            ? "チェック有り"
                            : "チェック無し"
                        }
                        onChange={handleAppointCheckChangeSelectTagValue}
                      >
                        {/* <option value="指定なし">指定なし</option> */}
                        <option value=""></option>
                        <option value="チェック無し">チェック無し</option>
                        <option value="チェック有り">チェック有り</option>
                      </select>
                    </div>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 紹介予定ﾒｲﾝ・紹介予定ｻﾌﾞ サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode} text-[12px]`}>紹介予定ﾒｲﾝ</span>
                    <input
                      type="text"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={inputPlannedProduct1}
                      onChange={(e) => setInputPlannedProduct1(e.target.value)}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title_search_mode}`}>紹介予定ｻﾌﾞ</span>
                    <input
                      type="text"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={inputPlannedProduct2}
                      onChange={(e) => setInputPlannedProduct2(e.target.value)}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 事前ｺﾒﾝﾄ サーチ */}
              {/* <div className={`${styles.row_area} ${styles.row_area_search_mode} flex h-[90px] w-full items-center`}> */}
              <div className={`${styles.row_area_lg_box}  flex max-h-max w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full `}>
                    <span className={`${styles.title_search_mode}`}>事前ｺﾒﾝﾄ</span>
                    {searchMode && (
                      <textarea
                        cols={30}
                        // rows={10}
                        className={`${styles.textarea_box} ${styles.textarea_box_search_mode}`}
                        value={inputPlannedComment}
                        onChange={(e) => setInputPlannedComment(e.target.value)}
                      ></textarea>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 事業部名 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>事業部名</span>
                    {/* <input
                      type="text"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={inputMeetingDepartment}
                      onChange={(e) => setInputMeetingDepartment(e.target.value)}
                    /> */}
                    {searchMode && (
                      <select
                        className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                        value={inputMeetingCreatedByDepartmentOfUser}
                        onChange={(e) => setInputMeetingCreatedByDepartmentOfUser(e.target.value)}
                      >
                        <option value=""></option>
                        {departmentDataArray &&
                          departmentDataArray.map((department, index) => (
                            <option key={department.id} value={department.id}>
                              {department.department_name}
                            </option>
                          ))}
                      </select>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>係・ﾁｰﾑ</span>
                    {searchMode && filteredUnitBySelectedDepartment && filteredUnitBySelectedDepartment.length >= 1 && (
                      <select
                        className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                        value={inputMeetingCreatedByUnitOfUser}
                        onChange={(e) => setInputMeetingCreatedByUnitOfUser(e.target.value)}
                      >
                        <option value=""></option>
                        {filteredUnitBySelectedDepartment &&
                          filteredUnitBySelectedDepartment.map((unit, index) => (
                            <option key={unit.id} value={unit.id}>
                              {unit.unit_name}
                            </option>
                          ))}
                      </select>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 事業所・自社担当 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>事業所</span>
                    {/* <input
                      type="text"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={inputMeetingBusinessOffice}
                      onChange={(e) => setInputMeetingBusinessOffice(e.target.value)}
                    /> */}
                    {searchMode && (
                      <select
                        className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                        value={inputMeetingCreatedByOfficeOfUser}
                        onChange={(e) => setInputMeetingCreatedByOfficeOfUser(e.target.value)}
                      >
                        <option value=""></option>
                        {officeDataArray &&
                          officeDataArray.map((office, index) => (
                            <option key={office.id} value={office.id}>
                              {office.office_name}
                            </option>
                          ))}
                      </select>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title_search_mode}`}>自社担当</span>
                    <input
                      type="text"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={inputMeetingMemberName}
                      onChange={(e) => setInputMeetingMemberName(e.target.value)}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* ============= 予定エリアここまで ============= */}

              {/* ============= 結果エリアここから ============= */}
              {/* 結果 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} !mt-[20px] flex w-full items-center`}>
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
              {/* 面談日・面談年月度 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>面談日</span>
                    <DatePickerCustomInput
                      startDate={inputResultDate}
                      setStartDate={setInputResultDate}
                      required={false}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title_search_mode}`}>面談年月度</span>
                    {searchMode && (
                      <input
                        type="number"
                        min="0"
                        className={`${styles.input_box}`}
                        placeholder='"202312" など年月を入力'
                        value={inputMeetingYearMonth === null ? "" : inputMeetingYearMonth}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            setInputMeetingYearMonth(null);
                          } else {
                            const numValue = Number(val);

                            // 入力値がマイナスかチェック
                            if (numValue < 0) {
                              setInputMeetingYearMonth(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                            } else {
                              setInputMeetingYearMonth(numValue);
                            }
                          }
                        }}
                      />
                    )}
                    {/* バツボタン */}
                    {!!inputMeetingYearMonth && (
                      <div className={`${styles.close_btn_number}`} onClick={() => setInputMeetingYearMonth(null)}>
                        <MdClose className="text-[20px] " />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 面談開始・面談終了 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>面談開始</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      placeholder="時"
                      value={inputResultStartTimeHour}
                      onChange={(e) => setInputResultStartTimeHour(e.target.value === "" ? "" : e.target.value)}
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
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      placeholder="分"
                      value={inputResultStartTimeMinute}
                      onChange={(e) => setInputResultStartTimeMinute(e.target.value === "" ? "" : e.target.value)}
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
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title_search_mode}`}>面談終了</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      placeholder="時"
                      value={inputResultEndTimeHour}
                      onChange={(e) => setInputResultEndTimeHour(e.target.value === "" ? "" : e.target.value)}
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
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      placeholder="分"
                      value={inputResultEndTimeMinute}
                      onChange={(e) => setInputResultEndTimeMinute(e.target.value === "" ? "" : e.target.value)}
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

              {/* 面談時間(分)・面談人数 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <div className={`${styles.title_search_mode} flex flex-col`}>
                      <span className={``}>面談時間</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={inputResultDuration === null ? "" : inputResultDuration}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setInputResultDuration(null);
                        } else {
                          const numValue = Number(val);

                          // 入力値がマイナスかチェック
                          if (numValue < 0) {
                            setInputResultDuration(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                          } else {
                            setInputResultDuration(numValue);
                          }
                        }
                      }}
                    />
                    {/* バツボタン */}
                    {!!inputResultDuration && (
                      <div className={`${styles.close_btn_number}`} onClick={() => setInputResultDuration(null)}>
                        <MdClose className="text-[20px] " />
                      </div>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>

                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} transition-base03 flex h-full items-center `}>
                    <span className={`${styles.check_title_search_mode}`}>面談人数</span>

                    <div className={`${styles.grid_select_cell_header} `}>
                      <input
                        type="number"
                        min="0"
                        className={`${styles.input_box}`}
                        placeholder=""
                        value={
                          inputResultNumberOfMeetingParticipants === null ? "" : inputResultNumberOfMeetingParticipants
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            setInputResultNumberOfMeetingParticipants(null);
                          } else {
                            const numValue = Number(val);

                            // 入力値がマイナスかチェック
                            if (numValue < 0) {
                              setInputResultNumberOfMeetingParticipants(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                            } else {
                              setInputResultNumberOfMeetingParticipants(numValue);
                            }
                          }
                        }}
                      />
                      {/* バツボタン */}
                      {!!inputResultNumberOfMeetingParticipants && (
                        <div
                          className={`${styles.close_btn_number}`}
                          onClick={() => setInputResultNumberOfMeetingParticipants(null)}
                        >
                          <MdClose className="text-[20px] " />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 実施1・実施2 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>実施商品1</span>
                    <input
                      type="text"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={inputResultPresentationProduct1}
                      onChange={(e) => setInputResultPresentationProduct1(e.target.value)}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title_search_mode}`}>実施商品2</span>
                    <input
                      type="text"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={inputResultPresentationProduct2}
                      onChange={(e) => setInputResultPresentationProduct2(e.target.value)}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 実施3・実施4 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>実施商品3</span>
                    <input
                      type="text"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={inputResultPresentationProduct3}
                      onChange={(e) => setInputResultPresentationProduct3(e.target.value)}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title_search_mode}`}>実施商品4</span>
                    <input
                      type="text"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={inputResultPresentationProduct4}
                      onChange={(e) => setInputResultPresentationProduct4(e.target.value)}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 実施5 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>実施商品5</span>
                    <input
                      type="text"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={inputResultPresentationProduct5}
                      onChange={(e) => setInputResultPresentationProduct5(e.target.value)}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}></div>
                </div>
              </div>

              {/* 結果ｺﾒﾝﾄ サーチ */}
              {/* <div className={`${styles.row_area} ${styles.row_area_search_mode} flex h-[90px] w-full items-center`}> */}
              <div className={`${styles.row_area_lg_box}  flex max-h-max w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full `}>
                    <span className={`${styles.title_search_mode}`}>結果ｺﾒﾝﾄ</span>
                    <textarea
                      name="Meeting_summary"
                      id="Meeting_summary"
                      cols={30}
                      // rows={10}
                      className={`${styles.textarea_box} ${styles.textarea_box_search_mode}`}
                      value={inputResultSummary}
                      onChange={(e) => setInputResultSummary(e.target.value)}
                    ></textarea>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 訪問結果 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex h-[70px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full `}>
                    <span className={`${styles.title_search_mode}`}>訪問結果</span>
                    <select
                      className={`ml-auto h-full w-[100%] cursor-pointer  ${styles.select_box}`}
                      value={inputResultCategory}
                      onChange={(e) => {
                        setInputResultCategory(e.target.value);
                      }}
                    >
                      <option value=""></option>
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
              {/* ============= 結果エリアここまで ============= */}

              {/* ============= 会社情報エリアここから ============= */}
              {/* 会社情報 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} !mt-[20px] flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.section_title}`}>会社情報</span>

                    {/* <span className={`${styles.value} ${styles.value_highlight}`}>
                        {selectedRowDataMeeting?.company_name ? selectedRowDataMeeting?.company_name : ""}
                      </span> */}
                  </div>
                  <div className={`${styles.section_underline}`}></div>
                </div>
              </div>
              {/* ●会社名 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>●会社名</span>
                    {searchMode && (
                      <input
                        type="text"
                        placeholder="株式会社○○"
                        // autoFocus
                        className={`${styles.input_box}`}
                        value={inputCompanyName}
                        onChange={(e) => setInputCompanyName(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 部署名 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>●部署名</span>
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

              {/* 担当者名 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>担当者名</span>
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
                    <span className={`${styles.title_search_mode}`}>直通TEL</span>
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

              {/* 内線TEL・代表TEL サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>内線TEL</span>
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
                    <span className={`${styles.title_search_mode}`}>代表TEL</span>
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

              {/* 直通FAX・代表FAX サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>直通FAX</span>
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
                    <span className={`${styles.title_search_mode}`}>代表FAX</span>
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

              {/* 社用携帯・私用携帯 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>社用携帯</span>
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
                    <span className={`${styles.title_search_mode}`}>私用携帯</span>
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

              {/* Email サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>E-mail</span>
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

              {/* 郵便番号 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>郵便番号</span>
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
                    <span className={`${styles.title_search_mode}`}></span>
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

              {/* 住所 サーチ */}
              <div className={`${styles.row_area_lg_box} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px] ">
                  <div className={`${styles.title_box} flex h-full `}>
                    <span className={`${styles.title_search_mode}`}>○住所</span>
                    {searchMode && (
                      <textarea
                        name="address"
                        id="address"
                        cols={30}
                        // rows={10}
                        placeholder="「神奈川県＊」や「＊大田区＊」など"
                        className={`${styles.textarea_box} ${styles.textarea_box_search_mode}`}
                        value={inputAddress}
                        onChange={(e) => setInputAddress(e.target.value)}
                      ></textarea>
                    )}
                  </div>
                  <div className={`${styles.underline} `}></div>
                </div>
              </div>

              {/* 役職名・職位 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>役職名</span>
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
                    <span className={`${styles.title_search_mode}`}>職位</span>
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
                        className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
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

              {/* 担当職種・決裁金額 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>担当職種</span>
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
                        className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                        value={inputEmployeesClass}
                        onChange={(e) => setInputEmployeesClass(e.target.value)}
                      >
                        <option value=""></option>
                        {optionsOccupation.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <div className={`${styles.title_search_mode} flex flex-col text-[12px]`}>
                      <span className={``}>決裁金額</span>
                      <span className={``}>(万円)</span>
                    </div>
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        // value={inputApprovalAmount}
                        // onChange={(e) => setInputApprovalAmount(e.target.value)}
                        value={!!inputApprovalAmount ? inputApprovalAmount : ""}
                        onChange={(e) => setInputApprovalAmount(e.target.value)}
                        onBlur={() =>
                          setInputApprovalAmount(
                            !!inputApprovalAmount && inputApprovalAmount !== ""
                              ? (convertToMillions(inputApprovalAmount.trim()) as number).toString()
                              : ""
                          )
                        }
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 規模（ランク）・決算月 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>規模(ﾗﾝｸ)</span>
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
                        className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                        value={inputEmployeesClass}
                        onChange={(e) => setInputEmployeesClass(e.target.value)}
                      >
                        <option value=""></option>
                        <option value="A*">A 1000名以上</option>
                        <option value="B*">B 500~999名</option>
                        <option value="C*">C 300~499名</option>
                        <option value="D*">D 200~299名</option>
                        <option value="E*">E 100~199名</option>
                        <option value="F*">F 50~99名</option>
                        <option value="G*">G 1~49名</option>
                      </select>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title_search_mode}`}>決算月</span>
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

              {/* 予算申請月1・予算申請月2 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode} text-[12px]`}>予算申請月1</span>
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
                    <span className={`${styles.title_search_mode} text-[12px]`}>予算申請月2</span>
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

              {/* 資本金・設立 サーチ テスト */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>資本金(万円)</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {/* {selectedRowDataCompany?.capital ? selectedRowDataCompany?.capital : ""} */}
                        {selectedRowDataMeeting?.capital
                          ? convertToJapaneseCurrencyFormat(selectedRowDataMeeting.capital)
                          : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={!!inputCapital ? inputCapital : ""}
                        onChange={(e) => setInputCapital(e.target.value)}
                        onBlur={() =>
                          setInputCapital(
                            !!inputCapital && inputCapital !== ""
                              ? (convertToMillions(inputCapital.trim()) as number).toString()
                              : ""
                          )
                        }
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title_search_mode}`}>設立</span>
                    {!searchMode && (
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
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 事業内容 サーチ */}
              <div className={`${styles.row_area_lg_box} flex  w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px] ">
                  <div className={`${styles.title_box}  flex h-full`}>
                    <span className={`${styles.title_search_mode}`}>事業内容</span>
                    {searchMode && (
                      <textarea
                        name="address"
                        id="address"
                        cols={30}
                        // rows={10}
                        className={`${styles.textarea_box} ${styles.textarea_box_search_mode}`}
                        value={inputContent}
                        onChange={(e) => setInputContent(e.target.value)}
                      ></textarea>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 主要取引先 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>主要取引先</span>
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

              {/* 主要仕入先 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>主要仕入先</span>
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

              {/* 設備 サーチ */}
              <div className={`${styles.row_area_lg_box} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px] ">
                  <div className={`${styles.title_box}  flex h-full`}>
                    <span className={`${styles.title_search_mode}`}>設備</span>
                    {searchMode && (
                      <textarea
                        name="address"
                        id="address"
                        cols={30}
                        // rows={10}
                        className={`${styles.textarea_box} ${styles.textarea_box_search_mode}`}
                        value={inputFacility}
                        onChange={(e) => setInputFacility(e.target.value)}
                      ></textarea>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 事業拠点・海外拠点 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>事業拠点</span>
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
                    <span className={`${styles.title_search_mode}`}>海外拠点</span>
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

              {/* グループ会社 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>ｸﾞﾙｰﾌﾟ会社</span>
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

              {/* HP サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>HP</span>
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

              {/* 会社Email サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>会社Email</span>
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        placeholder="「is not null」で会社Email有りのデータのみ抽出"
                        value={inputCompanyEmail}
                        onChange={(e) => setInputCompanyEmail(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 業種 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>○業種</span>
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
                        className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
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
              {/* 製品分類（大分類） サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <div className={`${styles.title_search_mode} flex flex-col text-[12px]`}>
                      <span className={``}>製品分類</span>
                      <span className={``}>(大分類)</span>
                    </div>
                    {searchMode && !inputIndustryType && (
                      // <input
                      //   type="text"
                      //   className={`${styles.input_box} ml-[20px]`}
                      //   value={inputProductL}
                      //   onChange={(e) => setInputProductL(e.target.value)}
                      // />
                      <select
                        className={`ml-auto h-full w-[100%] cursor-pointer  ${styles.select_box}`}
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
              {/* 製品分類（中分類） サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <div className={`${styles.title_search_mode} flex flex-col text-[12px]`}>
                      <span className={``}>製品分類</span>
                      <span className={``}>(中分類)</span>
                    </div>
                    {searchMode && !!inputProductL && (
                      // <input
                      //   type="text"
                      //   className={`${styles.input_box} ml-[20px]`}
                      //   value={inputProductM}
                      //   onChange={(e) => setInputProductM(e.target.value)}
                      // />
                      <select
                        value={inputProductM}
                        onChange={(e) => setInputProductM(e.target.value)}
                        className={`${inputProductL ? "" : "hidden"} ml-auto h-full w-[100%] cursor-pointer  ${
                          styles.select_box
                        }`}
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
              {/* 製品分類（小分類） サーチ */}
              {/* <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title_search_mode}`}>製品分類（小分類）</span>
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

              {/* 法人番号・ID サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>○法人番号</span>
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
                  {/* <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title_min}`}>会社ID</span>
                    {!searchMode && (
                      <span className={`${styles.value} truncate`}>
                        {selectedRowDataMeeting?.company_id ? selectedRowDataMeeting?.company_id : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div> */}
                </div>
              </div>

              {/* --------- ラッパーここまで --------- */}
            </div>
          </div>
        )}
        {/* ---------------- サーチモード 右コンテナ input時はstickyにしてnullやis nullなどのボタンや説明を配置 ---------------- */}
        {searchMode && (
          <div
            className={`${styles.right_sticky_container} sticky top-0 h-full grow bg-[aqua]/[0] pt-[10px] text-[var(--color-text)] `}
          >
            <div
              className={`${styles.right_sticky_contents_wrapper} flex h-[350px] w-full flex-col rounded-[8px] bg-[var(--color-bg-brand-f10)] px-[20px] `}
            >
              {/* <div className="flex h-[40px] w-full items-center justify-center text-[18px] font-semibold ">
                会社 条件検索
              </div> */}
              <div className={` text-[13px]`}>
                <div className="mt-[5px] flex  min-h-[30px] items-center">
                  ○検索したい条件を入力してください。（必要な項目のみ入力でOK）
                </div>
                <div className="flex  min-h-[30px] items-center">
                  <span className="h-full w-[15px]"></span>
                  例えば、「&quot;東京都大田区&quot;」の会社で「事業拠点」が存在する会社を検索する場合は、「●住所」に「東京都大田区※」と入力し、「事業拠点」に「is
                  not null」と入力し、検索ボタンを押してください。
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
                {/* <div className="mt-[10px] flex h-[30px] w-full items-center">
                  <button type="submit" className={`${styles.btn}`}>
                    検索
                  </button>
                </div> */}
                <div
                  className={`mt-[10px] flex ${
                    isOpenSidebar ? "min-h-[34px]" : `min-h-[42px]`
                  } w-full items-center justify-between space-x-[15px]`}
                >
                  <div
                    className={`transition-base02 flex-center ${
                      isOpenSidebar ? "max-h-[34px] text-[14px]" : `max-h-[38px] text-[15px]`
                    } w-[100%] min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--color-bg-sub-light)] px-[25px] py-[15px] text-[var(--color-text-title)] hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      setSearchMode(false);
                      // 編集モード中止
                      if (editSearchMode) setEditSearchMode(false);
                    }}
                  >
                    戻る
                  </div>
                  <button
                    type="submit"
                    className={`${styles.btn} transition-base02 ${
                      isOpenSidebar ? "min-h-[30px] text-[14px]" : `min-h-[38px] text-[15px]`
                    }`}
                  >
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
