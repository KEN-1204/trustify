import React, { ChangeEvent, FC, FormEvent, Suspense, memo, useCallback, useEffect, useRef, useState } from "react";
import styles from "../QuotationDetail.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import useStore from "@/store";
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

import { useQueryDepartments } from "@/hooks/useQueryDepartments";
import { useQueryUnits } from "@/hooks/useQueryUnits";
import { useQueryOffices } from "@/hooks/useQueryOffices";
import {
  AttendeeInfo,
  Department,
  IntroducedProductsNames,
  Quotation,
  Quotation_row_data,
  Office,
  Unit,
  QuotationProductsDetail,
} from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { mappingOccupation, mappingPositionClass } from "@/utils/mappings";
import { getProductName } from "@/utils/Helpers/getProductName";
import { useMedia } from "react-use";
import { useMutateQuotation } from "@/hooks/useMutateQuotation";
import { isSameDateLocal } from "@/utils/Helpers/isSameDateLocal";
import { calculateDateToYearMonth } from "@/utils/Helpers/calculateDateToYearMonth";
import { SpinnerComet } from "@/components/Parts/SpinnerComet/SpinnerComet";
import { formatTime } from "@/utils/Helpers/formatTime";
import { splitTime } from "@/utils/Helpers/splitTime";
import { IoIosSend } from "react-icons/io";
import { InputSendAndCloseBtn } from "@/components/DashboardCompanyComponent/CompanyMainContainer/InputSendAndCloseBtn/InputSendAndCloseBtn";
import { checkNotFalsyExcludeZero } from "@/utils/Helpers/checkNotFalsyExcludeZero";
import { convertToYen } from "@/utils/Helpers/convertToYen";
import { normalizeDiscountRate } from "@/utils/Helpers/normalizeDiscountRate";
import { CiEdit } from "react-icons/ci";
import { RippleButton } from "@/components/Parts/RippleButton/RippleButton";
import { ProductListTable } from "./ProductListTable/ProductListTable";

// https://nextjs-ja-translation-docs.vercel.app/docs/advanced-features/dynamic-import
// デフォルトエクスポートの場合のダイナミックインポート
// const DynamicComponent = dynamic(() => import('../components/hello'));
// 名前付きエクスポートの場合のダイナミックインポート
// const ContactUnderRightQuotationLog = dynamic(
//   () =>
//     import("./ContactUnderRightQuotationLog/ContactUnderRightQuotationLog").then(
//       (mod) => mod.ContactUnderRightQuotationLog
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

const QuotationMainContainerOneThirdMemo: FC = () => {
  const language = useStore((state) => state.language);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const searchMode = useDashboardStore((state) => state.searchMode);
  const setSearchMode = useDashboardStore((state) => state.setSearchMode);
  const editSearchMode = useDashboardStore((state) => state.editSearchMode);
  const setEditSearchMode = useDashboardStore((state) => state.setEditSearchMode);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  const hoveredItemPosWrap = useStore((state) => state.hoveredItemPosWrap);
  const setHoveredItemPosWrap = useStore((state) => state.setHoveredItemPosWrap);
  const isOpenSidebar = useDashboardStore((state) => state.isOpenSidebar);
  const tableContainerSize = useDashboardStore((state) => state.tableContainerSize);
  const underDisplayFullScreen = useDashboardStore((state) => state.underDisplayFullScreen);
  // 上画面の選択中の列データ会社
  const selectedRowDataQuotation = useDashboardStore((state) => state.selectedRowDataQuotation);
  const setSelectedRowDataQuotation = useDashboardStore((state) => state.setSelectedRowDataQuotation);
  // 上画面の選択中の見積画面以外の列データでInsert用で受け取る
  const selectedRowDataContact = useDashboardStore((state) => state.selectedRowDataContact);
  const setSelectedRowDataContact = useDashboardStore((state) => state.setSelectedRowDataContact);
  const selectedRowDataActivity = useDashboardStore((state) => state.selectedRowDataActivity);
  const setSelectedRowDataActivity = useDashboardStore((state) => state.setSelectedRowDataActivity);
  const selectedRowDataMeeting = useDashboardStore((state) => state.selectedRowDataMeeting);
  const setSelectedRowDataMeeting = useDashboardStore((state) => state.setSelectedRowDataMeeting);
  const selectedRowDataProperty = useDashboardStore((state) => state.selectedRowDataProperty);
  const setSelectedRowDataProperty = useDashboardStore((state) => state.setSelectedRowDataProperty);
  // 担当者編集モーダルオープン
  const setIsOpenUpdateQuotationModal = useDashboardStore((state) => state.setIsOpenUpdateQuotationModal);
  // rpc()サーチ用パラメータ
  const newSearchQuotation_Contact_CompanyParams = useDashboardStore(
    (state) => state.newSearchQuotation_Contact_CompanyParams
  );
  const setNewSearchQuotation_Contact_CompanyParams = useDashboardStore(
    (state) => state.setNewSearchQuotation_Contact_CompanyParams
  );
  // 各フィールドの編集モード => ダブルクリックで各フィールド名をstateに格納し、各フィールドをエディットモードへ
  const isEditModeField = useDashboardStore((state) => state.isEditModeField);
  const setIsEditModeField = useDashboardStore((state) => state.setIsEditModeField);
  const [isComposing, setIsComposing] = useState(false); // 日本語のように変換、確定が存在する言語入力の場合の日本語入力の変換中を保持するstate、日本語入力開始でtrue, エンターキーで変換確定した時にfalse
  // 見積作成State
  const isInsertModeQuotation = useDashboardStore((state) => state.isInsertModeQuotation);
  const setIsInsertModeQuotation = useDashboardStore((state) => state.setIsInsertModeQuotation);
  // アクティブタブstate
  // const activeMenuTab = useDashboardStore((state) => state.activeMenuTab);

  // useEffect(() => {
  //   return () => {
  //     if (isInsertModeQuotation) {
  //       console.log("クリーンアップ setIsInsertModeQuotationでfalseに", activeMenuTab);
  //       setIsInsertModeQuotation(false);
  //     }
  //   };
  // }, []);

  // const supabase = useSupabaseClient();
  const queryClient = useQueryClient();

  const { updateQuotationFieldMutation } = useMutateQuotation();

  // メディアクエリState デスクトップモニター
  const isDesktopGTE1600Media = useMedia("(min-width: 1600px)", false);
  const [isDesktopGTE1600, setIsDesktopGTE1600] = useState(isDesktopGTE1600Media);
  useEffect(() => {
    setIsDesktopGTE1600(isDesktopGTE1600Media);
  }, [isDesktopGTE1600Media]);

  // 🌟サブミット
  // 🔹client_companiesテーブル
  const [inputCompanyName, setInputCompanyName] = useState("");
  const [inputDepartmentName, setInputDepartmentName] = useState("");
  const [inputTel, setInputTel] = useState("");
  const [inputFax, setInputFax] = useState("");
  const [inputZipcode, setInputZipcode] = useState("");
  const [inputAddress, setInputAddress] = useState("");
  // 🔹contactsテーブル
  const [inputContactName, setInputContactName] = useState("");
  const [inputDirectLine, setInputDirectLine] = useState("");
  const [inputDirectFax, setInputDirectFax] = useState("");
  const [inputExtension, setInputExtension] = useState("");
  const [inputCompanyCellPhone, setInputCompanyCellPhone] = useState("");
  const [inputContactEmail, setInputContactEmail] = useState("");
  // const [inputPositionName, setInputPositionName] = useState("");
  // const [inputPositionClass, setInputPositionClass] = useState("");
  const [inputContactCreatedByCompanyId, setInputContactCreatedByCompanyId] = useState("");
  const [inputContactCreatedByUserId, setInputContactCreatedByUserId] = useState("");
  // 🔹Quotationテーブル
  // const [inputSubmissionClass, setInputSubmissionClass] = useState("");
  const [inputQuotationCreatedByCompanyId, setInputQuotationCreatedByCompanyId] = useState("");
  const [inputQuotationCreatedByUserId, setInputQuotationCreatedByUserId] = useState("");
  const [inputQuotationCreatedByDepartmentOfUser, setInputQuotationCreatedByDepartmentOfUser] = useState("");
  const [inputQuotationCreatedByUnitOfUser, setInputQuotationCreatedByUnitOfUser] = useState("");
  const [inputQuotationCreatedByOfficeOfUser, setInputQuotationCreatedByOfficeOfUser] = useState("");
  const [inputQuotationDate, setInputQuotationDate] = useState<Date | null>(null);
  const [inputExpirationDate, setInputExpirationDate] = useState<Date | null>(null);
  const [inputQuotationNotes, setInputQuotationNotes] = useState("");
  const [inputQuotationRemarks, setInputQuotationRemarks] = useState("");
  const [inputQuotationNoCustom, setInputQuotationNoCustom] = useState("");
  const [inputQuotationNoSystem, setInputQuotationNoSystem] = useState("");
  const [inputQuotationTitle, setInputQuotationTitle] = useState("");
  // 社員番号
  const [inputEmployeeIdName, setInputEmployeeIdName] = useState("");

  const [inputQuotationBusinessOffice, setInputQuotationBusinessOffice] = useState("");
  const [inputQuotationDepartment, setInputQuotationDepartment] = useState("");
  const [inputQuotationMemberName, setInputQuotationMemberName] = useState("");
  const [inputQuotationYearMonth, setInputQuotationYearMonth] = useState<number | null>(null);

  // ================================ 🌟フィールドエディットモード関連state🌟 ================================
  const [inputQuotationDateForFieldEdit, setInputQuotationDateForFieldEdit] = useState<Date | null>(null);
  const [inputExpirationDateForFieldEdit, setInputExpirationDateForFieldEdit] = useState<Date | null>(null);
  // 送付先フィールドエディット
  const [inputCompanyIdDestForFieldEdit, setInputCompanyIdDestForFieldEdit] = useState("");
  const [inputContactIdDestForFieldEdit, setInputContactIdDestForFieldEdit] = useState("");
  // const [inputDepartmentNameDestForFieldEdit, setInputDepartmentNameDestForFieldEdit] = useState("");
  // const [inputContactNameDestForFieldEdit, setInputContactNameDestForFieldEdit] = useState("");
  // const [inputDirectLineDestForFieldEdit, setInputDirectLineDestForFieldEdit] = useState("");
  // const [inputDirectFaxDestForFieldEdit, setInputDirectFaxDestForFieldEdit] = useState("");
  // const [inputContactEmailDestForFieldEdit, setInputContactEmailDestForFieldEdit] = useState("");
  // const [inputZipcodeDestForFieldEdit, setInputZipcodeDestForFieldEdit] = useState("");
  // const [inputAddressDestForFieldEdit, setInputAddressDestForFieldEdit] = useState("");
  // 見積関連フィールドエディット
  const [inputSubmissionClassForFieldEdit, setInputSubmissionClassForFieldEdit] = useState("");
  const [inputDeadlineForFieldEdit, setInputDeadlineForFieldEdit] = useState("");
  const [inputDeliveryPlaceForFieldEdit, setInputDeliveryPlaceForFieldEdit] = useState("");
  const [inputPaymentTermsForFieldEdit, setInputPaymentTermsForFieldEdit] = useState("");
  const [inputQuotationDivisionForFieldEdit, setInputQuotationDivisionForFieldEdit] = useState("");
  const [inputSendingMethodForFieldEdit, setInputSendingMethodForFieldEdit] = useState("");
  const [inputUseCorporateSealForFieldEdit, setInputUseCorporateSealForFieldEdit] = useState("");
  // const [inputQuotationNotesForFieldEdit, setInputQuotationNotesForFieldEdit] = useState("");
  const [inputSalesTaxClassForFieldEdit, setInputSalesTaxClassForFieldEdit] = useState("");
  const [inputSalesTaxRateForFieldEdit, setInputSalesTaxRateForFieldEdit] = useState("");
  const [inputTotalPriceForFieldEdit, setInputTotalPriceForFieldEdit] = useState("");
  const [inputDiscountAmountForFieldEdit, setInputDiscountAmountForFieldEdit] = useState("");
  const [inputDiscountRateForFieldEdit, setInputDiscountRateForFieldEdit] = useState("");
  const [inputDiscountTitleForFieldEdit, setInputDiscountTitleForFieldEdit] = useState("");
  const [inputTotalAmountForFieldEdit, setInputTotalAmountForFieldEdit] = useState("");
  // const [inputQuotationRemarksForFieldEdit, setInputQuotationRemarksForFieldEdit] = useState("");
  const [inputSetItemCountForFieldEdit, setInputSetItemCountForFieldEdit] = useState("");
  const [inputSetUnitNameForFieldEdit, setInputSetUnitNameForFieldEdit] = useState("");
  const [inputSetPriceForFieldEdit, setInputSetPriceForFieldEdit] = useState("");
  const [inputLeasePeriodForFieldEdit, setInputLeasePeriodForFieldEdit] = useState("");
  const [inputLeaseRateForFieldEdit, setInputLeaseRateForFieldEdit] = useState("");
  const [inputLeaseMonthlyFeeForFieldEdit, setInputLeaseMonthlyFeeForFieldEdit] = useState("");
  //  印鑑フィールドエディット
  const [inputInChargeStampIdForFieldEdit, setInputInChargeStampIdForFieldEdit] = useState("");
  const [inputInChargeNameIdForFieldEdit, setInputInChargeNameIdForFieldEdit] = useState("");
  const [inputSupervisor1StampIdForFieldEdit, setInputSupervisor1StampIdForFieldEdit] = useState("");
  const [inputSupervisor1NameIdForFieldEdit, setInputSupervisor1NameIdForFieldEdit] = useState("");
  const [inputSupervisor2StampIdForFieldEdit, setInputSupervisor2StampIdForFieldEdit] = useState("");
  const [inputSupervisor2NameIdForFieldEdit, setInputSupervisor2NameIdForFieldEdit] = useState("");

  // フラグ関連 フィールドエディット用 初期はfalseにしておき、useEffectでselectedRowDataのフラグを反映する
  // 角印印刷フラグ、担当印、上長印１、上長印２ フィールドエディット用
  const [checkboxUseCorporateSealFlagForFieldEdit, setCheckboxUseCorporateSealFlagForFieldEdit] = useState(false);
  const [checkboxInChargeFlagForFieldEdit, setCheckboxInChargeFlagForFieldEdit] = useState(false);
  const [checkboxSupervisor1FlagForFieldEdit, setCheckboxSupervisor1FlagForFieldEdit] = useState(false);
  const [checkboxSupervisor2FlagForFieldEdit, setCheckboxSupervisor2FlagForFieldEdit] = useState(false);

  // フラグの初期値を更新
  // 角印印刷
  useEffect(() => {
    setCheckboxUseCorporateSealFlagForFieldEdit(
      selectedRowDataQuotation?.use_corporate_seal ? selectedRowDataQuotation?.use_corporate_seal : false
    );
  }, [selectedRowDataQuotation?.use_corporate_seal]);
  // 担当者印
  useEffect(() => {
    setCheckboxInChargeFlagForFieldEdit(
      selectedRowDataQuotation?.in_charge_stamp_flag ? selectedRowDataQuotation?.in_charge_stamp_flag : false
    );
  }, [selectedRowDataQuotation?.in_charge_stamp_flag]);
  // 上長印1
  useEffect(() => {
    setCheckboxSupervisor1FlagForFieldEdit(
      selectedRowDataQuotation?.supervisor1_stamp_flag ? selectedRowDataQuotation?.supervisor1_stamp_flag : false
    );
  }, [selectedRowDataQuotation?.supervisor1_stamp_flag]);
  // 上長印2
  useEffect(() => {
    setCheckboxSupervisor2FlagForFieldEdit(
      selectedRowDataQuotation?.supervisor2_stamp_flag ? selectedRowDataQuotation?.supervisor2_stamp_flag : false
    );
  }, [selectedRowDataQuotation?.supervisor2_stamp_flag]);

  // ================================ ✅フィールドエディットモード関連state✅ ================================

  // ================================ 🌟useQuery初回マウント時のフェッチ遅延用🌟 ================================
  // const [isReady, setIsReady] = useState(false);
  // useEffect(() => {
  //   setIsReady(true);
  // }, []);
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

  // useMutation
  // const { createDepartmentMutation, updateDepartmentFieldMutation, deleteDepartmentMutation } = useMutateDepartment();
  // ================================ ✅事業部リスト取得useQuery✅ ================================
  // ================================ 🌟係・チームリスト取得useQuery🌟 ================================
  const {
    data: unitDataArray,
    isLoading: isLoadingQueryUnit,
    refetch: refetchQUeryUnits,
  } = useQueryUnits(userProfileState?.company_id, true);

  // useMutation
  // const { createUnitMutation, updateUnitFieldMutation, updateMultipleUnitFieldsMutation, deleteUnitMutation } =
  // useMutateUnit();
  // ================================ ✅係・チームリスト取得useQuery✅ ================================
  // ================================ 🌟事業所・営業所リスト取得useQuery🌟 ================================
  const {
    data: officeDataArray,
    isLoading: isLoadingQueryOffice,
    refetch: refetchQUeryOffices,
  } = useQueryOffices(userProfileState?.company_id, true);

  // useMutation
  // const { createOfficeMutation, updateOfficeFieldMutation, deleteOfficeMutation } = useMutateOffice();
  // ================================ ✅事業所・営業所リスト取得useQuery✅ ================================
  // ======================= 🌟現在の選択した事業部で係・チームを絞り込むuseEffect🌟 =======================
  const [filteredUnitBySelectedDepartment, setFilteredUnitBySelectedDepartment] = useState<Unit[]>([]);
  useEffect(() => {
    // unitが存在せず、stateに要素が1つ以上存在しているなら空にする
    if (!unitDataArray || unitDataArray?.length === 0 || !inputQuotationCreatedByDepartmentOfUser)
      return setFilteredUnitBySelectedDepartment([]);

    // 選択中の事業部が変化するか、unitDataArrayの内容に変更があったら新たに絞り込んで更新する
    if (unitDataArray && unitDataArray.length >= 1 && inputQuotationCreatedByDepartmentOfUser) {
      const filteredUnitArray = unitDataArray.filter(
        (unit) => unit.created_by_department_id === inputQuotationCreatedByDepartmentOfUser
      );
      setFilteredUnitBySelectedDepartment(filteredUnitArray);
    }
  }, [unitDataArray, inputQuotationCreatedByDepartmentOfUser]);
  // ======================= ✅現在の選択した事業部でチームを絞り込むuseEffect✅ =======================

  // ----------------------- 🌟見積Noカスタム/自動をローカルストレージから取得🌟 -----------------------
  const [useQuotationNoCustom, setUseQuotationNoCustom] = useState(false);
  useEffect(() => {
    let _useQuotationNoCustom = false;
    const result = localStorage.getItem("use_quotation_no_custom");
    // まだセットされていない場合はfalseをセット
    if (!result) {
      localStorage.setItem("use_quotation_no_custom", JSON.stringify(false));
    } else {
      _useQuotationNoCustom = JSON.parse(result);
    }
    // stateに格納
    setUseQuotationNoCustom(_useQuotationNoCustom);
  }, []);
  // ----------------------- ✅見積Noカスタム/自動をローカルストレージから取得✅ -----------------------

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
    // if (newSearchQuotation_Contact_CompanyParams === null) return;

    // 編集モード
    if (editSearchMode && searchMode) {
      if (newSearchQuotation_Contact_CompanyParams === null) return;
      console.log(
        "🔥Meetingメインコンテナー useEffect 編集モード inputにnewSearchQuotation_Contact_CompanyParamsを格納",
        newSearchQuotation_Contact_CompanyParams
      );
      //   setInputCompanyName(beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams.company_name));
      setInputCompanyName(beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams["client_companies.name"]));
      setInputDepartmentName(beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams.department_name));
      //   setInputContactName(beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams.contact_name));
      setInputContactName(beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams["contacts.name"]));
      setInputTel(beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams?.main_phone_number));
      setInputFax(beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams?.main_fax));
      setInputZipcode(beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams?.zipcode));
      setInputAddress(beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams?.address));

      // contactsテーブル
      //   setInputContactName(beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams.contact_name));
      setInputContactName(beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams["contacts.name"]));
      setInputDirectLine(beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams.direct_line));
      setInputDirectFax(beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams.direct_fax));
      setInputExtension(beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams.extension));
      setInputCompanyCellPhone(beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams.company_cell_phone));
      setInputContactEmail(beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams["contacts.email"]));
      // setInputPositionName(beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams.position_name));
      // setInputPositionClass(
      //   newSearchQuotation_Contact_CompanyParams.position_class
      //     ? newSearchQuotation_Contact_CompanyParams.position_class.toString()
      //     : ""
      // );
      setInputContactCreatedByCompanyId(
        beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams["contacts.created_by_company_id"])
      );
      setInputContactCreatedByUserId(
        beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams["contacts.created_by_user_id"])
      );

      // quotationsテーブル
      setInputQuotationCreatedByCompanyId(
        beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams["quotations.created_by_company_id"])
      );
      setInputQuotationCreatedByUserId(
        beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams["quotations.created_by_user_id"])
      );
      setInputQuotationCreatedByDepartmentOfUser(
        beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams["quotations.created_by_department_of_user"])
      );
      setInputQuotationCreatedByUnitOfUser(
        beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams["quotations.created_by_unit_of_user"])
      );
      setInputQuotationCreatedByUnitOfUser(
        beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams["quotations.created_by_office_of_user"])
      );
      setInputQuotationDate(
        newSearchQuotation_Contact_CompanyParams.quotation_date
          ? new Date(newSearchQuotation_Contact_CompanyParams.quotation_date)
          : null
      );
      setInputExpirationDate(
        newSearchQuotation_Contact_CompanyParams.expiration_date
          ? new Date(newSearchQuotation_Contact_CompanyParams.expiration_date)
          : null
      );
      //
      setInputQuotationNotes(beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams.quotation_notes));
      setInputQuotationRemarks(beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams.quotation_remarks));
      setInputQuotationNoCustom(beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams.quotation_no_custom));
      setInputQuotationNoSystem(beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams.quotation_no_system));
      //
      setInputQuotationBusinessOffice(
        beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams.quotation_business_office)
      );
      setInputQuotationDepartment(
        beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams.quotation_department)
      );
      setInputQuotationMemberName(
        beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams.quotation_member_name)
      );
    } else if (!editSearchMode && searchMode) {
      console.log(
        "🔥Quotationメインコンテナー useEffect 新規サーチモード inputを初期化",
        newSearchQuotation_Contact_CompanyParams
      );
      if (!!inputCompanyName) setInputCompanyName("");
      // if (!!input) setInputContactName("");
      if (!!inputDepartmentName) setInputDepartmentName(""); // 部署名(クライアント)
      if (!!inputTel) setInputTel("");
      if (!!inputFax) setInputFax("");
      if (!!inputZipcode) setInputZipcode("");
      if (!!inputAddress) setInputAddress("");

      // contactsテーブル
      if (!!inputContactName) setInputContactName("");
      if (!!inputDirectLine) setInputDirectLine("");
      if (!!inputDirectFax) setInputDirectFax("");
      if (!!inputExtension) setInputExtension("");
      if (!!inputCompanyCellPhone) setInputCompanyCellPhone("");
      if (!!inputContactEmail) setInputContactEmail("");
      // if (!!inputPositionName) setInputPositionName("");
      // if (!!inputPositionClass) setInputPositionClass("");
      if (!!inputContactCreatedByCompanyId) setInputContactCreatedByCompanyId("");
      if (!!inputContactCreatedByUserId) setInputContactCreatedByUserId("");

      // quotationsテーブル
      if (!!inputQuotationCreatedByCompanyId) setInputQuotationCreatedByCompanyId("");
      if (!!inputQuotationCreatedByUserId) setInputQuotationCreatedByUserId("");
      if (!!inputQuotationCreatedByDepartmentOfUser) setInputQuotationCreatedByDepartmentOfUser("");
      if (!!inputQuotationCreatedByUnitOfUser) setInputQuotationCreatedByUnitOfUser("");
      if (!!inputQuotationCreatedByOfficeOfUser) setInputQuotationCreatedByOfficeOfUser("");
      if (!!inputQuotationDate) setInputQuotationDate(null);
      if (!!inputExpirationDate) setInputExpirationDate(null);
      if (!!inputQuotationNotes) setInputQuotationNotes("");
      if (!!inputQuotationRemarks) setInputQuotationRemarks("");
      if (!!inputQuotationNoCustom) setInputQuotationNoCustom("");
      if (!!inputQuotationNoSystem) setInputQuotationNoSystem("");
      if (!!inputQuotationTitle) setInputQuotationTitle("");
      if (!!inputQuotationBusinessOffice) setInputQuotationBusinessOffice("");
      if (!!inputQuotationDepartment) setInputQuotationDepartment("");
      if (!!inputQuotationMemberName) setInputQuotationMemberName("");
      if (!!inputQuotationYearMonth) setInputQuotationYearMonth(null);
      if (!!inputEmployeeIdName) setInputEmployeeIdName("");
    }
  }, [editSearchMode, searchMode]);

  // サーチ関数実行
  const handleSearchSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // フィールド編集モードがtrueならサブミットせずにリターン
    if (isEditModeField) return console.log("サブミット フィールドエディットモードのためリターン");

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
    let _address = adjustFieldValue(inputAddress);
    // contactsテーブル
    let _contact_name = adjustFieldValue(inputContactName);
    let _direct_line = adjustFieldValue(inputDirectLine);
    let _direct_fax = adjustFieldValue(inputDirectFax);
    let _extension = adjustFieldValue(inputExtension);
    let _company_cell_phone = adjustFieldValue(inputCompanyCellPhone);
    let _contact_email = adjustFieldValue(inputContactEmail);
    // let _position_name = adjustFieldValue(inputPositionName);
    // let _position_class = adjustFieldValue(inputPositionClass) ? parseInt(inputPositionClass, 10) : null;
    let _contact_created_by_company_id = adjustFieldValue(inputContactCreatedByCompanyId);
    let _contact_created_by_user_id = adjustFieldValue(inputContactCreatedByUserId);
    // quotationsテーブル
    // let _quotation_created_by_company_id = adjustFieldValue(inputQuotationCreatedByCompanyId);
    let _quotation_created_by_user_id = adjustFieldValue(inputQuotationCreatedByUserId);
    let _quotation_created_by_department_of_user = adjustFieldValue(inputQuotationCreatedByDepartmentOfUser);
    let _quotation_created_by_unit_of_user = adjustFieldValue(inputQuotationCreatedByUnitOfUser);
    let _quotation_created_by_office_of_user = adjustFieldValue(inputQuotationCreatedByOfficeOfUser);
    let _quotation_date = inputQuotationDate ? inputQuotationDate.toISOString() : null;
    let _expiration_date = inputExpirationDate ? inputExpirationDate.toISOString() : null;
    let _quotation_notes = adjustFieldValue(inputQuotationNotes);
    let _quotation_remarks = adjustFieldValue(inputQuotationRemarks);
    let _quotation_no_custom = adjustFieldValue(inputQuotationNoCustom);
    let _quotation_no_system = adjustFieldValue(inputQuotationNoSystem);
    let _quotation_title = adjustFieldValue(inputQuotationTitle);
    let _quotation_business_office = adjustFieldValue(inputQuotationBusinessOffice);
    let _quotation_department = adjustFieldValue(inputQuotationDepartment);
    let _quotation_member_name = adjustFieldValue(inputQuotationMemberName);
    let _quotation_year_month = adjustFieldValueNumber(inputQuotationYearMonth);
    let _employee_id_name = adjustFieldValue(inputEmployeeIdName);

    const params = {
      "client_companies.name": _company_name,
      department_name: _department_name,
      main_phone_number: _main_phone_number,
      main_fax: _main_fax,
      zipcode: _zipcode,
      address: _address,
      // contactsテーブル
      "contacts.name": _contact_name,
      direct_line: _direct_line,
      direct_fax: _direct_fax,
      extension: _extension,
      company_cell_phone: _company_cell_phone,
      "contacts.email": _contact_email,
      // position_name: _position_name,
      // position_class: _position_class,
      "contacts.created_by_company_id": _contact_created_by_company_id,
      "contacts.created_by_user_id": _contact_created_by_user_id,
      // quotationsテーブル
      "quotations.created_by_company_id": userProfileState.company_id,
      "quotations.created_by_user_id": _quotation_created_by_user_id,
      "quotations.created_by_department_of_user": _quotation_created_by_department_of_user,
      "quotations.created_by_unit_of_user": _quotation_created_by_unit_of_user,
      "quotations.created_by_office_of_user": _quotation_created_by_office_of_user,
      quotation_date: _quotation_date,
      expiration_date: _expiration_date,
      quotation_notes: _quotation_notes,
      quotation_remarks: _quotation_remarks,
      quotation_no_custom: _quotation_no_custom,
      quotation_no_system: _quotation_no_system,
      quotation_business_office: _quotation_business_office,
      quotation_department: _quotation_department,
      quotation_member_name: _quotation_member_name,
      quotation_year_month: _quotation_year_month,
      quotation_title: _quotation_title,
      employee_id_name: _employee_id_name,
    };

    // console.log("✅ 条件 params", params);

    // const { data, error } = await supabase.rpc("search_companies_and_contacts", { params });
    // const { data, error } = await supabase.rpc("search_companies", { params });

    setInputCompanyName("");
    setInputDepartmentName("");
    setInputTel("");
    setInputFax("");
    setInputZipcode("");
    setInputAddress("");
    // contactsテーブル
    setInputContactName("");
    setInputDirectLine("");
    setInputDirectFax("");
    setInputExtension("");
    setInputCompanyCellPhone("");
    setInputContactEmail("");
    // setInputPositionName("");
    // setInputPositionClass("");
    setInputContactCreatedByCompanyId("");
    setInputContactCreatedByUserId("");
    // quotationsテーブル
    setInputQuotationCreatedByCompanyId("");
    setInputQuotationCreatedByUserId("");
    setInputQuotationCreatedByDepartmentOfUser("");
    setInputQuotationCreatedByUnitOfUser("");
    setInputQuotationCreatedByOfficeOfUser("");
    setInputQuotationDate(null);
    setInputExpirationDate(null);
    setInputQuotationNotes("");
    setInputQuotationRemarks("");
    setInputQuotationNoCustom("");
    setInputQuotationNoSystem("");
    setInputQuotationTitle("");
    setInputQuotationBusinessOffice("");
    setInputQuotationDepartment("");
    setInputQuotationMemberName("");
    setInputQuotationYearMonth(null);
    setInputEmployeeIdName("");

    // サーチモードオフ
    setSearchMode(false);
    setEditSearchMode(false);

    // Zustandに検索条件を格納
    setNewSearchQuotation_Contact_CompanyParams(params);

    // 選択中の列データをリセット
    setSelectedRowDataQuotation(null);

    console.log("✅ 条件 params", params);
  };

  // ==================================== 🌟ツールチップ🌟 ====================================
  type TooltipParams = {
    e: React.MouseEvent<HTMLElement, MouseEvent>;
    display?: "top" | "right" | "bottom" | "left" | "";
    marginTop?: number;
    itemsPosition?: string;
    whiteSpace?: "normal" | "pre" | "nowrap" | "pre-wrap" | "pre-line" | "break-spaces" | undefined;
    content?: string;
    content2?: string;
    content3?: string;
  };
  const handleOpenTooltip = ({
    e,
    display = "",
    marginTop,
    itemsPosition,
    whiteSpace,
    content,
    content2,
    content3,
  }: TooltipParams) => {
    // ホバーしたアイテムにツールチップを表示
    const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
    // console.log("ツールチップx, y width , height", x, y, width, height);
    const dataText2 = ((e.target as HTMLDivElement).dataset.text2 as string)
      ? ((e.target as HTMLDivElement).dataset.text2 as string)
      : "";
    const dataText3 = ((e.target as HTMLDivElement).dataset.text3 as string)
      ? ((e.target as HTMLDivElement).dataset.text3 as string)
      : "";
    setHoveredItemPosWrap({
      x: x,
      y: y,
      itemWidth: width,
      itemHeight: height,
      content: ((e.target as HTMLDivElement).dataset.text as string) || (content ?? ""),
      content2: dataText2 || content2 || "",
      content3: dataText3 || content3 || "",
      display: display,
      marginTop: marginTop,
      itemsPosition: itemsPosition,
      whiteSpace: whiteSpace,
    });
  };
  // ツールチップを非表示
  const handleCloseTooltip = () => {
    setHoveredItemPosWrap(null);
  };
  // ==================================== ✅ツールチップ✅ ====================================

  // ================== 🌟ユーザーの決算月の締め日を初回マウント時に取得🌟 ==================
  const fiscalEndMonthObjRef = useRef<Date | null>(null);
  const closingDayRef = useRef<number | null>(null);
  useEffect(() => {
    // ユーザーの決算月から締め日を取得、決算つきが未設定の場合は現在の年と3月31日を設定
    const fiscalEndMonth = userProfileState?.customer_fiscal_end_month
      ? new Date(userProfileState.customer_fiscal_end_month)
      : new Date(new Date().getFullYear(), 2, 31); // 決算日が未設定なら3月31日に自動設定
    const closingDay = fiscalEndMonth.getDate(); //ユーザーの締め日
    fiscalEndMonthObjRef.current = fiscalEndMonth; //refに格納
    closingDayRef.current = closingDay; //refに格納
  }, []);
  // ================== ✅ユーザーの決算月の締め日を初回マウント時に取得✅ ==================

  // ================== 🌟シングルクリック、ダブルクリックイベント🌟 ==================
  // ダブルクリックで各フィールドごとに個別で編集
  const setTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // 選択行データが自社専用の会社データかどうか
  const isMatchDepartment =
    !!userProfileState?.assigned_department_id &&
    !!selectedRowDataQuotation?.quotation_created_by_department_of_user &&
    selectedRowDataQuotation.quotation_created_by_department_of_user === userProfileState?.assigned_department_id;

  // シングルクリック => 何もアクションなし
  const handleSingleClickField = useCallback((e: React.MouseEvent<HTMLSpanElement>) => {
    if (!selectedRowDataQuotation) return;
    // 自社で作成した会社でない場合はそのままリターン
    // if (!isMatchDepartment) return;
    if (setTimeoutRef.current !== null) return;

    setTimeoutRef.current = setTimeout(() => {
      setTimeoutRef.current = null;
      // シングルクリック時に実行したい処理
      // 0.2秒後に実行されてしまうためここには書かない
    }, 200);
    console.log("シングルクリック");
  }, []);

  // const originalOptionRef = useRef(""); // 同じ選択肢選択時にエディットモード終了用
  // 編集前のダブルクリック時の値を保持 => 変更されたかどうかを確認
  const originalValueFieldEdit = useRef<string | null>("");
  type DoubleClickProps = {
    e: React.MouseEvent<HTMLSpanElement>;
    field: string;
    dispatch: React.Dispatch<React.SetStateAction<any>>;
    // isSelectChangeEvent?: boolean;
    dateValue?: string | null;
    selectedRowDataValue?: any;
  };
  // ダブルクリック => ダブルクリックしたフィールドを編集モードに変更
  const handleDoubleClickField = useCallback(
    ({ e, field, dispatch, dateValue, selectedRowDataValue }: DoubleClickProps) => {
      if (!selectedRowDataQuotation) return;
      // 自社で作成した会社でない場合はそのままリターン
      // if (!isOurActivity) return;

      console.log(
        "ダブルクリック",
        "field",
        field,
        "e.currentTarget.innerText",
        e.currentTarget.innerText,
        "e.currentTarget.innerHTML",
        e.currentTarget.innerHTML,
        "selectedRowDataValue",
        selectedRowDataValue && selectedRowDataValue
      );
      if (setTimeoutRef.current) {
        clearTimeout(setTimeoutRef.current);

        // console.log(e.detail);
        setTimeoutRef.current = null;
        // ダブルクリック時に実行したい処理
        // クリックした要素のテキストを格納
        // const text = e.currentTarget.innerText;
        let text;
        text = e.currentTarget.innerHTML;
        if (!!selectedRowDataValue) {
          text = selectedRowDataValue;
        }

        if (field === "fiscal_end_month") {
          text = text.replace(/月/g, ""); // 決算月の場合は、1月の月を削除してstateに格納 optionタグのvalueと一致させるため
        }
        // // 「活動日付」「次回フォロー予定日」はinnerHTMLではなく元々の値を格納
        if (["quotation_date", "result_date"].includes(field)) {
          const originalDate = dateValue ? new Date(dateValue) : null;
          console.log("ダブルクリック 日付格納", dateValue);
          // originalValueFieldEdit.current = originalDate;
          dispatch(originalDate); // 編集モードでinputStateをクリックした要素のテキストを初期値に設定
          setIsEditModeField(field); // クリックされたフィールドの編集モードを開く
          return;
        }
        if (field === "result_top_position_class") {
          dispatch(selectedRowDataValue); // 編集モードでinputStateをクリックした要素のテキストを初期値に設定
          setIsEditModeField(field); // クリックされたフィールドの編集モードを開く
          return;
        }
        originalValueFieldEdit.current = text;
        dispatch(text); // 編集モードでinputStateをクリックした要素のテキストを初期値に設定
        setIsEditModeField(field); // クリックされたフィールドの編集モードを開く
        // if (isSelectChangeEvent) originalOptionRef.current = e.currentTarget.innerText; // selectタグ同じ選択肢選択時の編集モード終了用
      }
    },
    [setIsEditModeField]
    // [isOurActivity, setIsEditModeField]
  );
  // ================== ✅シングルクリック、ダブルクリックイベント✅ ==================

  // プロパティ名のユニオン型の作成
  // Quotation_row_data型の全てのプロパティ名をリテラル型のユニオンとして展開
  // type ActivityFieldNames = keyof Quotation_row_data;
  type QuotationFieldNames = keyof Quotation;
  type ExcludeKeys = "company_id" | "contact_id" | "quotation_id"; // 除外するキー
  type QuotationFieldNamesForSelectedRowData = Exclude<keyof Quotation_row_data, ExcludeKeys>; // Quotation_row_dataタイプのプロパティ名のみのデータ型を取得
  // ================== 🌟エンターキーで個別フィールドをアップデート inputタグ ==================
  const handleKeyDownUpdateField = async ({
    e,
    fieldName,
    fieldNameForSelectedRowData,
    originalValue,
    newValue,
    id,
    required,
  }: {
    e: React.KeyboardEvent<HTMLInputElement>;
    // fieldName: string;
    fieldName: QuotationFieldNames;
    fieldNameForSelectedRowData: QuotationFieldNamesForSelectedRowData;
    originalValue: any;
    newValue: any;
    id: string | undefined;
    required: boolean;
  }) => {
    // 日本語入力変換中はtrueで変換確定のエンターキーではUPDATEクエリが実行されないようにする
    // 英語などの入力変換が存在しない言語ではisCompositionStartは発火しないため常にfalse
    if (e.key === "Enter" && !isComposing) {
      if (required && (newValue === "" || newValue === null)) return toast.info(`この項目は入力が必須です。`);

      // 先にアンダーラインが残らないようにremoveしておく
      e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove

      if (!id || !selectedRowDataQuotation) {
        toast.error(`エラー：データが見つかりませんでした。`);
        return;
      }
      console.log(
        "フィールドアップデート エンターキー",
        " ・フィールド名:",
        fieldName,
        " ・結合フィールド名:",
        fieldNameForSelectedRowData,
        " ・元の値:",
        originalValue,
        " ・新たな値:",
        newValue
      );
      // 入力値が現在のvalueと同じであれば更新は不要なため閉じてリターン
      if (originalValue === newValue) {
        console.log("同じためリターン");
        setIsEditModeField(null); // エディットモードを終了
        return;
      }

      const updatePayload = {
        fieldName: fieldName,
        fieldNameForSelectedRowData: fieldNameForSelectedRowData,
        newValue: newValue,
        id: id,
      };
      // 入力変換確定状態でエンターキーが押された場合の処理
      console.log("onKeyDownイベント エンターキーが入力確定状態でクリック UPDATE実行 updatePayload", updatePayload);
      await updateQuotationFieldMutation.mutateAsync(updatePayload);
      originalValueFieldEdit.current = ""; // 元フィールドデータを空にする
      setIsEditModeField(null); // エディットモードを終了
    }
  };
  // ================== ✅エンターキーで個別フィールドをアップデート inputタグ✅ ==================
  // ================== 🌟Sendキーで個別フィールドをアップデート ==================
  const handleClickSendUpdateField = async ({
    e,
    fieldName,
    fieldNameForSelectedRowData,
    originalValue,
    newValue,
    id,
    required,
  }: {
    e: React.MouseEvent<HTMLDivElement, MouseEvent>;
    // fieldName: string;
    fieldName: QuotationFieldNames;
    fieldNameForSelectedRowData: QuotationFieldNamesForSelectedRowData;
    originalValue: any;
    newValue: any;
    id: string | undefined;
    required: boolean;
  }) => {
    if (required && (newValue === "" || newValue === null)) return toast.info(`この項目は入力が必須です。`);

    if (["planned_start_time", "result_start_time", "result_end_time", "planned_comment"].includes(fieldName)) {
      e.currentTarget.parentElement?.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
      // console.log("originalValue === newValue", originalValue === newValue);
      // return;
    } else {
      e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
    }

    if (!id || !selectedRowDataQuotation) {
      toast.error(`エラー：データが見つかりませんでした。`);
      return;
    }

    console.log(
      "フィールドアップデート Sendキー",
      "フィールド名: ",
      fieldName,
      "結合フィールド名: ",
      fieldNameForSelectedRowData,
      "元の値: ",
      originalValue,
      "新たな値: ",
      newValue
    );

    if (["quotation_date", "expiration_date"].includes(fieldName)) {
      console.log("フィールドアップデート 日付チェック オリジナル", originalValue, "変換前 新たな値", newValue);
      // 前回と今回も両方nullの場合はアップデート無しなので、リターンする
      if (originalValue === null && newValue === null) {
        console.log("日付チェック 前回も今回もnullのためリターン");
        setIsEditModeField(null); // エディットモードを終了
        return;
      }
      // 年月日のみで同じ日付か比較
      const result = isSameDateLocal(originalValue, newValue);
      if (result) {
        console.log("日付チェック 同じためリターン");
        setIsEditModeField(null); // エディットモードを終了
        return;
      } else {
        console.log("日付チェック 新たな日付のためこのまま更新 newValue", newValue);
        // フィールドがactivity_date（活動日）の場合は活動年月度も同時に更新
        if (fieldName === "quotation_date" || fieldName === "expiration_date") {
          if (!closingDayRef.current)
            return toast.error("決算日データが確認できないため、活動を更新できませんでした...🙇‍♀️");
          // if (!(newValue instanceof Date)) return toast.error("エラー：無効な日付です。");
          type ExcludeKeys = "company_id" | "contact_id" | "quotation_id"; // 除外するキー idはUPDATEすることは無いため
          type QuotationFieldNamesForSelectedRowData = Exclude<keyof Quotation_row_data, ExcludeKeys>;
          type UpdateObject = {
            fieldName: string;
            fieldNameForSelectedRowData: QuotationFieldNamesForSelectedRowData;
            newValue: any;
            id: string;
            meetingYearMonth?: number | null;
          };

          const fiscalYearMonth = calculateDateToYearMonth(new Date(newValue), closingDayRef.current);
          console.log("新たに生成された年月度", fiscalYearMonth);

          if (!fiscalYearMonth) return toast.error("日付の更新に失敗しました。");

          // 面談予定日付のみ存在している場合
          if (selectedRowDataQuotation.quotation_date && !selectedRowDataQuotation.expiration_date) {
            const updatePayload: UpdateObject = {
              fieldName: fieldName,
              fieldNameForSelectedRowData: fieldNameForSelectedRowData,
              newValue: !!newValue ? newValue : null,
              id: id,
            };

            // 入力変換確定状態でエンターキーが押された場合の処理
            console.log("selectタグでUPDATE実行 updatePayload", updatePayload);
            await updateQuotationFieldMutation.mutateAsync(updatePayload);
          } else if (selectedRowDataQuotation.quotation_date && selectedRowDataQuotation.expiration_date) {
            const updatePayload: UpdateObject = {
              fieldName: fieldName,
              fieldNameForSelectedRowData: fieldNameForSelectedRowData,
              newValue: !!newValue ? newValue : null,
              id: id,
              meetingYearMonth: fiscalYearMonth,
            };
            // 入力変換確定状態でエンターキーが押された場合の処理
            console.log("selectタグでUPDATE実行 updatePayload", updatePayload);
            await updateQuotationFieldMutation.mutateAsync(updatePayload);
          }
          originalValueFieldEdit.current = ""; // 元フィールドデータを空にする
          setIsEditModeField(null); // エディットモードを終了
          return;
        }
      }
    }
    // 入力値が現在のvalueと同じであれば更新は不要なため閉じてリターン null = null ''とnullもリターン textareaはnullの場合表示は空文字でされているため
    else if ((!required && originalValue === newValue) || (!originalValue && !newValue)) {
      console.log(
        "決裁金額、日付以外でチェック 同じためリターン",
        "originalValue",
        originalValue,
        "newValue",
        newValue
      );
      setIsEditModeField(null); // エディットモードを終了
      return;
    }

    // requiredがfalseで入力必須ではないので、newValueがnullや空文字、0は許容(空文字や0をnullにするかどうかは各フィールドごとに個別で管理する)

    const updatePayload = {
      fieldName: fieldName,
      fieldNameForSelectedRowData: fieldNameForSelectedRowData,
      newValue: newValue,
      id: id,
    };
    // 入力変換確定状態でエンターキーが押された場合の処理
    console.log("sendアイコンクリックでUPDATE実行 updatePayload", updatePayload);
    await updateQuotationFieldMutation.mutateAsync(updatePayload);
    originalValueFieldEdit.current = ""; // 元フィールドデータを空にする
    setIsEditModeField(null); // エディットモードを終了
  };
  // ================== ✅Sendキーで個別フィールドをアップデート ==================

  // ================== 🌟セレクトボックスで個別フィールドをアップデート ==================

  const handleChangeSelectUpdateField = async ({
    e,
    fieldName,
    fieldNameForSelectedRowData,
    originalValue,
    newValue,
    id,
  }: {
    e: ChangeEvent<HTMLSelectElement>;
    // fieldName: string;
    fieldName: QuotationFieldNames;
    fieldNameForSelectedRowData: QuotationFieldNamesForSelectedRowData;
    originalValue: any;
    newValue: any;
    id: string | undefined;
  }) => {
    e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove

    if (!id || !selectedRowDataQuotation) {
      toast.error(`エラー：データが見つかりませんでした。`, { autoClose: 3000 });
      return;
    }
    // 入力値が現在のvalueと同じであれば更新は不要なため閉じてリターン
    if (originalValue === newValue) {
      console.log("同じためリターン");
      setIsEditModeField(null); // エディットモードを終了
      return;
    }

    console.log(
      "フィールドアップデート セレクトボックス",
      " ・フィールド名:",
      fieldName,
      " ・結合フィールド名:",
      fieldNameForSelectedRowData,
      " ・元の値:",
      originalValue,
      " ・新たな値:",
      newValue
    );

    const updatePayload = {
      fieldName: fieldName,
      fieldNameForSelectedRowData: fieldNameForSelectedRowData,
      newValue: newValue !== "" ? newValue : null,
      id: id,
    };
    // 入力変換確定状態でエンターキーが押された場合の処理
    console.log("selectタグでUPDATE実行 updatePayload", updatePayload);
    await updateQuotationFieldMutation.mutateAsync(updatePayload);
    originalValueFieldEdit.current = ""; // 元フィールドデータを空にする
    setIsEditModeField(null); // エディットモードを終了
  };
  // ================== ✅セレクトボックスで個別フィールドをアップデート ==================

  // 商品名を取得する関数
  const getCustomProductName = (
    productNamesArray: QuotationProductsDetail[] | null,
    index: number,
    alternativeName: string | null
  ) => {
    if (!productNamesArray) {
      return "";
    } else {
      if (
        productNamesArray.length > index + 1 &&
        !!getProductName(
          productNamesArray[index].quotation_product_name,
          productNamesArray[index].quotation_inside_short_name,
          productNamesArray[index].quotation_outside_short_name
        )
      ) {
        return getProductName(
          productNamesArray[index].quotation_product_name,
          productNamesArray[index].quotation_inside_short_name,
          productNamesArray[index].quotation_outside_short_name
        );
      } else {
        return alternativeName ? alternativeName : "";
      }
    }
  };
  // 実施商品ALLを構築する関数
  const getProductNamesAll = (productNamesArray: QuotationProductsDetail[] | null) => {
    if (!productNamesArray || productNamesArray?.length === 0) return "";
    const productNames = productNamesArray.map((product, index) => {
      if (
        !!getProductName(
          product.quotation_product_name,
          product.quotation_inside_short_name,
          product.quotation_outside_short_name
        )
      ) {
        return getProductName(
          product.quotation_product_name,
          product.quotation_inside_short_name,
          product.quotation_outside_short_name
        );
      } else {
        return;
      }
    });
    // const productNamesObj = { ...productNames };
    console.log("productNames", productNames, productNamesArray);
    return productNames.join(" / ");
  };

  //   const handleAppointCheckChangeSelectTagValue = (event: React.ChangeEvent<HTMLSelectElement>) => {
  //     const value = event.target.value;

  //     switch (value) {
  //       case "チェック有り":
  //         setInputPlannedAppointCheckFlag(true);
  //         break;
  //       case "チェック無し":
  //         setInputPlannedAppointCheckFlag(false);
  //         break;
  //       default:
  //         setInputPlannedAppointCheckFlag(null);
  //     }
  //   };

  const hours = Array.from({ length: 24 }, (_, index) => (index < 10 ? "0" + index : "" + index));
  const minutes5 = Array.from({ length: 12 }, (_, index) => (index * 5 < 10 ? "0" + index * 5 : "" + index * 5));
  const minutes = Array.from({ length: 60 }, (_, i) => (i < 10 ? "0" + i : "" + i));

  // 同席者リストから各同席者を「 / \n」で区切った一つの文字列に変換する関数
  // 形式は「佐藤(株式会社X・営業部・部長) / \n ...」
  const formatAttendees = (attendees: AttendeeInfo[] | undefined | null) => {
    if (!attendees || attendees?.length === 0) return "";
    const _formatAttendees = attendees
      .map((attendee) => {
        return `${attendee.attendee_name ?? ""}(${
          attendee.attendee_company ? attendee.attendee_company + (attendee.attendee_department_name && `・`) : ""
        }${
          attendee.attendee_department_name
            ? attendee.attendee_department_name + (attendee.attendee_position_name && `・`)
            : ""
        }${attendee.attendee_position_name ?? ""})`;
      })
      .join(` / \n`);

    return _formatAttendees;
  };

  console.log(
    "🔥MeetingMainContainerレンダリング",
    "selectedRowDataQuotation",
    selectedRowDataQuotation,
    "newSearchQuotation_Contact_CompanyParams",
    newSearchQuotation_Contact_CompanyParams
  );
  // const tableContainerSize = useRootStore(useDashboardStore, (state) => state.tableContainerSize);
  return (
    <form className={`${styles.main_container} w-full`} onSubmit={handleSearchSubmit}>
      <div className={`flex h-full flex-col`}>
        {/* 🌟新規作成 保存ボタンエリア🌟 */}
        {isInsertModeQuotation && (
          <div
            // className={`sticky top-0 z-[10] flex max-h-[38px] min-h-[38px] w-full items-center border-b border-solid border-[var(--color-bg-brand-f)] bg-[var(--color-bg-base30)] px-[25px] py-[10px] backdrop-blur-xl`}
            className={`sticky top-0 z-[10] flex max-h-[48px] min-h-[38px] w-full items-center border-b-[2px] border-solid border-[var(--color-bg-brand-f)] bg-transparent px-[25px] py-[10px]`}
            // className={`sticky top-0 z-[10] min-h-[76px] w-full rounded-bl-[6px] border-b border-l border-solid border-[var(--color-bg-brand-f)] bg-[var(--color-bg-brand-f10)] backdrop-blur-xl`}
          >
            <div className={`mr-[20px] flex min-w-max items-center text-[18px] font-bold`}>
              <h3>見積作成</h3>
            </div>
            <div className={`flex h-full items-center space-x-[15px]`}>
              <div className={`mr-[30px] flex h-full w-full items-center space-x-[15px]`}>
                <button
                  type="submit"
                  className={`${styles.upsert_btn} transition-bg02 max-h-[28px] min-h-[28px] min-w-[90px] max-w-[90px] text-[13px]`}
                >
                  保存
                </button>
                <div
                  className={`transition-bg02 flex-center max-h-[28px] min-h-[28px] w-[100%] min-w-[90px] max-w-[90px] cursor-pointer rounded-[6px] bg-[var(--color-bg-sub-light)] text-[13px] text-[var(--color-text-title)] hover:bg-[var(--setting-side-bg-select-hover)]`}
                  onClick={() => {
                    setIsInsertModeQuotation(false);
                    // setSearchMode(false);
                    // // 編集モード中止
                    // if (editSearchMode) setEditSearchMode(false);
                  }}
                >
                  戻る
                </div>
              </div>
              <div className={`flex h-full items-center space-x-[15px]`}>
                <div
                  className={`${styles.upsert_btn} transition-bg02 max-h-[28px] min-h-[28px] min-w-[100px] max-w-[100px] text-[12px]`}
                  onMouseEnter={(e) =>
                    handleOpenTooltip({
                      e: e,
                      display: "top",
                      content: `独自に設定できるカスタム見積Noと自動で採番される見積Noの切り替えが可能です。`,
                      content2: `自動採番の見積Noは12桁の一意な見積Noが自動で割り当てられ、`,
                      content3: `1日に99万9999件まで採番が可能です。`,
                      marginTop: 28,
                      itemsPosition: "center",
                    })
                  }
                  onMouseLeave={handleCloseTooltip}
                  onClick={() => {
                    if (useQuotationNoCustom) {
                      setUseQuotationNoCustom(false);
                      localStorage.setItem("use_quotation_no_custom", JSON.stringify(false));
                    } else {
                      setUseQuotationNoCustom(true);
                      localStorage.setItem("use_quotation_no_custom", JSON.stringify(true));
                    }
                  }}
                >
                  見積No切替
                </div>
                {!useQuotationNoCustom && (
                  <div
                    className={`${styles.upsert_btn} transition-bg02 max-h-[28px] min-h-[28px] min-w-[100px] max-w-[100px] text-[12px]`}
                  >
                    見積No採番
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* 🌟新規作成 保存ボタンエリア🌟 */}
        {/* ------------------------- スクロールコンテナ ------------------------- */}
        {/* <div className={`${styles.scroll_container} relative flex w-full overflow-y-auto pl-[10px] `}> */}
        <div
          className={`${styles.scroll_container} relative flex w-full overflow-y-auto pb-[60px] pl-[10px] ${
            tableContainerSize === "half" && underDisplayFullScreen ? `${styles.height_all}` : ``
          } ${tableContainerSize === "all" && underDisplayFullScreen ? `${styles.height_all}` : ``}`}
        >
          {/* ---------------- 🌟通常モード 左コンテナ🌟 ---------------- */}
          {!searchMode && (
            <div
              // className={`${styles.left_container1 h-full min-w-[calc((100vw-var(--sidebar-width))/3)1 pb-[35px] pt-[10px]`}
              className={`${styles.left_container} ${
                isOpenSidebar ? `transition-base02` : `transition-base01`
              } h-full min-w-[calc((100vw-var(--sidebar-width))/3-11px)] max-w-[calc((100vw-var(--sidebar-width))/3-11px)] pb-[35px] pt-[0px]`}
            >
              {/* --------- ラッパー --------- */}
              <div className={`${styles.left_contents_wrapper} flex h-full w-full flex-col`}>
                {/* 依頼元 セクションタイトル */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.section_title}`}>依頼元</span>
                    </div>
                    <div className={`${styles.section_underline}`}></div>
                  </div>
                </div>
                {/*  */}

                {/* 会社名 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>会社名</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value} ${styles.value_highlight} ${styles.text_start}`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          }}
                        >
                          {selectedRowDataQuotation?.company_name ? selectedRowDataQuotation?.company_name : ""}
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
                {/*  */}

                {/* 部署名 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>部署名</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value} ${styles.text_start}`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          }}
                        >
                          {selectedRowDataQuotation?.department_name ? selectedRowDataQuotation?.department_name : ""}
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
                {/*  */}

                {/* 担当者名・直通TEL */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>担当者名</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          }}
                        >
                          {selectedRowDataQuotation?.contact_name ? selectedRowDataQuotation?.contact_name : ""}
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
                    <div className={`${styles.title_box} flex h-full items-center`}></div>
                    {/* <div className={`${styles.underline}`}></div> */}
                  </div>
                </div>
                {/*  */}

                {/* 内線TEL・代表TEL */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>直通TEL</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          data-text={`${
                            selectedRowDataQuotation?.direct_line ? selectedRowDataQuotation?.direct_line : ""
                          }`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            if (!isDesktopGTE1600) handleOpenTooltip({ e });
                            // handleOpenTooltip({e});
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            if (!isDesktopGTE1600 || hoveredItemPosWrap) handleCloseTooltip();
                            // if (hoveredItemPosWrap) handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataQuotation?.direct_line ? selectedRowDataQuotation?.direct_line : ""}
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
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>代表TEL</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          data-text={`${
                            selectedRowDataQuotation?.main_phone_number
                              ? selectedRowDataQuotation?.main_phone_number
                              : ""
                          }`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            if (!isDesktopGTE1600) handleOpenTooltip({ e });
                            // handleOpenTooltip({e});
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            if (!isDesktopGTE1600 || hoveredItemPosWrap) handleCloseTooltip();
                            // if (hoveredItemPosWrap) handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataQuotation?.main_phone_number
                            ? selectedRowDataQuotation?.main_phone_number
                            : ""}
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
                {/*  */}

                {/* 内線TEL・代表TEL */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>内線TEL</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          data-text={`${
                            selectedRowDataQuotation?.extension ? selectedRowDataQuotation?.extension : ""
                          }`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            if (!isDesktopGTE1600) handleOpenTooltip({ e });
                            // handleOpenTooltip({e});
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            if (!isDesktopGTE1600 || hoveredItemPosWrap) handleCloseTooltip();
                            // if (hoveredItemPosWrap) handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataQuotation?.extension ? selectedRowDataQuotation?.extension : ""}
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
                      <span className={`${styles.title}`}>社用携帯</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          data-text={`${
                            selectedRowDataQuotation?.company_cell_phone
                              ? selectedRowDataQuotation?.company_cell_phone
                              : ""
                          }`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            if (!isDesktopGTE1600) handleOpenTooltip({ e });
                            // handleOpenTooltip({e});
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            if (!isDesktopGTE1600 || hoveredItemPosWrap) handleCloseTooltip();
                            // if (hoveredItemPosWrap) handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataQuotation?.company_cell_phone
                            ? selectedRowDataQuotation?.company_cell_phone
                            : ""}
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
                </div>

                {/* 直通FAX・代表FAX */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>直通FAX</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          data-text={`${
                            selectedRowDataQuotation?.direct_fax ? selectedRowDataQuotation?.direct_fax : ""
                          }`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            if (!isDesktopGTE1600) handleOpenTooltip({ e });
                            // handleOpenTooltip({e});
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            if (!isDesktopGTE1600 || hoveredItemPosWrap) handleCloseTooltip();
                            // if (hoveredItemPosWrap) handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataQuotation?.direct_fax ? selectedRowDataQuotation?.direct_fax : ""}
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
                          data-text={`${selectedRowDataQuotation?.main_fax ? selectedRowDataQuotation?.main_fax : ""}`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            if (!isDesktopGTE1600) handleOpenTooltip({ e });
                            // handleOpenTooltip({e});
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            if (!isDesktopGTE1600 || hoveredItemPosWrap) handleCloseTooltip();
                            // if (hoveredItemPosWrap) handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataQuotation?.main_fax ? selectedRowDataQuotation?.main_fax : ""}
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
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>
                {/*  */}

                {/* Email */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span
                        className={`${styles.title}`} // data-text={`${selectedRowDataQuotation?.occupation ? selectedRowDataQuotation?.occupation : ""}`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          // if (!isDesktopGTE1600 && isOpenSidebar) {
                          //   handleOpenTooltip({e});
                          // }
                          // handleOpenTooltip({e});
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          // if ((!isDesktopGTE1600 && isOpenSidebar) || hoveredItemPosWrap) {
                          //   handleCloseTooltip();
                          // }
                          // if (hoveredItemPosWrap) handleCloseTooltip();
                        }}
                      >
                        E-mail
                      </span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataQuotation?.contact_email ? selectedRowDataQuotation?.contact_email : ""}
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
                {/*  */}

                {/* 郵便番号・ */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>郵便番号</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          // data-text={`${
                          //   selectedRowDataQuotation?.personal_cell_phone ? selectedRowDataQuotation?.personal_cell_phone : ""
                          // }`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            // if (!isDesktopGTE1600 && isOpenSidebar) {
                            //   handleOpenTooltip({e});
                            // }
                            // handleOpenTooltip({e});
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            // if ((!isDesktopGTE1600 && isOpenSidebar) || hoveredItemPosWrap) {
                            //   handleCloseTooltip();
                            // }
                            // if (hoveredItemPosWrap) handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataQuotation?.zipcode ? selectedRowDataQuotation?.zipcode : ""}
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
                    </div>
                    {/* <div className={`${styles.underline}`}></div> */}
                  </div>
                </div>

                {/* 住所 */}
                <div className={`${styles.row_area_lg_box}  flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px] ">
                    <div className={`${styles.title_box} ${styles.xl} flex h-full`}>
                      <span className={`${styles.title}`}>○住所</span>
                      {!searchMode && (
                        <span
                          className={`${styles.full_value} h-[45px] !overflow-visible !whitespace-normal`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          }}
                        >
                          {selectedRowDataQuotation?.address ? selectedRowDataQuotation?.address : ""}
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
                {/*  */}

                {/* 送付先 セクションタイトル */}
                <div className={`${styles.row_area} !mt-[22px] flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full min-h-[26px] !items-end `}>
                      <span className={`${styles.section_title} mb-[2px] mr-[5px] !min-w-max`}>送付先</span>
                      <span className={`text-[12px]`}>（送付先が依頼元と違う場合は変更する）</span>
                      <div
                        className={`${styles.upsert_btn} transition-bg02 ml-auto min-h-[26px] min-w-[90px] max-w-[90px] !rounded-[6px] text-[12px]`}
                      >
                        送付先変更
                      </div>
                    </div>
                    <div className={`${styles.section_underline}`}></div>
                  </div>
                </div>
                {/*  */}

                {/* 送付先 会社名 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>会社名</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value} ${styles.value_highlight} ${styles.text_start}`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          }}
                        >
                          {selectedRowDataQuotation?.destination_company_name
                            ? selectedRowDataQuotation?.destination_company_name
                            : ""}
                        </span>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>
                {/*  */}

                {/* 送付先 部署名 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>部署名</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value} ${styles.text_start}`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          }}
                        >
                          {selectedRowDataQuotation?.destination_company_department_name
                            ? selectedRowDataQuotation?.destination_company_department_name
                            : ""}
                        </span>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>
                {/*  */}

                {/* 送付先 担当者名 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>担当者名</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          }}
                        >
                          {selectedRowDataQuotation?.destination_contact_name
                            ? selectedRowDataQuotation?.destination_contact_name
                            : ""}
                        </span>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}></div>
                    {/* <div className={`${styles.underline}`}></div> */}
                  </div>
                </div>
                {/*  */}

                {/* 送付先 直通TEL・直通FAX */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>直通TEL</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          data-text={`${
                            selectedRowDataQuotation?.direct_line ? selectedRowDataQuotation?.direct_line : ""
                          }`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            if (!isDesktopGTE1600) handleOpenTooltip({ e });
                            // handleOpenTooltip({e});
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            if (!isDesktopGTE1600 || hoveredItemPosWrap) handleCloseTooltip();
                            // if (hoveredItemPosWrap) handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataQuotation?.destination_contact_direct_line
                            ? selectedRowDataQuotation?.destination_contact_direct_line
                            : ""}
                        </span>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>直通FAX</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          data-text={`${
                            selectedRowDataQuotation?.main_phone_number
                              ? selectedRowDataQuotation?.main_phone_number
                              : ""
                          }`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            if (!isDesktopGTE1600) handleOpenTooltip({ e });
                            // handleOpenTooltip({e});
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            if (!isDesktopGTE1600 || hoveredItemPosWrap) handleCloseTooltip();
                            // if (hoveredItemPosWrap) handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataQuotation?.destination_contact_direct_fax
                            ? selectedRowDataQuotation?.destination_contact_direct_fax
                            : ""}
                        </span>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>
                {/*  */}

                {/* 送付先 Email */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span
                        className={`${styles.title}`} // data-text={`${selectedRowDataQuotation?.occupation ? selectedRowDataQuotation?.occupation : ""}`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          // if (!isDesktopGTE1600 && isOpenSidebar) {
                          //   handleOpenTooltip({e});
                          // }
                          // handleOpenTooltip({e});
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          // if ((!isDesktopGTE1600 && isOpenSidebar) || hoveredItemPosWrap) {
                          //   handleCloseTooltip();
                          // }
                          // if (hoveredItemPosWrap) handleCloseTooltip();
                        }}
                      >
                        E-mail
                      </span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataQuotation?.destination_contact_email
                            ? selectedRowDataQuotation?.destination_contact_email
                            : ""}
                        </span>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>
                {/*  */}

                {/* 送付先 郵便番号・ */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>郵便番号</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          // data-text={`${
                          //   selectedRowDataQuotation?.personal_cell_phone ? selectedRowDataQuotation?.personal_cell_phone : ""
                          // }`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            // if (!isDesktopGTE1600 && isOpenSidebar) {
                            //   handleOpenTooltip({e});
                            // }
                            // handleOpenTooltip({e});
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            // if ((!isDesktopGTE1600 && isOpenSidebar) || hoveredItemPosWrap) {
                            //   handleCloseTooltip();
                            // }
                            // if (hoveredItemPosWrap) handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataQuotation?.destination_company_zipcode
                            ? selectedRowDataQuotation?.destination_company_zipcode
                            : ""}
                        </span>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}></span>
                    </div>
                    {/* <div className={`${styles.underline}`}></div> */}
                  </div>
                </div>

                {/* 送付先 住所 */}
                <div className={`${styles.row_area_lg_box} flex h-[50px] w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px] ">
                    <div className={`${styles.title_box} flex h-full`}>
                      <span className={`${styles.title}`}>○住所</span>
                      {!searchMode && (
                        <span
                          className={`${styles.full_value} h-[45px] !overflow-visible !whitespace-normal`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          }}
                        >
                          {selectedRowDataQuotation?.destination_company_address
                            ? selectedRowDataQuotation?.destination_company_address
                            : ""}
                        </span>
                      )}
                    </div>
                    <div className={`${styles.underline} `}></div>
                  </div>
                </div>
                {/*  */}
              </div>
              {/* --------- ラッパー --------- */}
            </div>
          )}
          {/* ---------------- ✅通常モード 左コンテナここまで✅ ---------------- */}

          {/* ------------------------ 🌟通常モード 真ん中と右コンテナ 上下全体🌟 ------------------------ */}
          <div className={`flex h-full flex-col`}>
            {/* ------------------------ 🌟通常モード 上 真ん中と右コンテナ🌟 ------------------------ */}
            <div className={`flex h-full`}>
              {/* ---------------- 🌟通常モード 真ん中コンテナ🌟 ---------------- */}
              {!searchMode && (
                <div
                  className={`${styles.right_container} ${
                    isOpenSidebar ? `transition-base02` : `transition-base01`
                  } h-full min-w-[calc((100vw-var(--sidebar-width))/3-11px)] max-w-[calc((100vw-var(--sidebar-width))/3-11px)] grow bg-[aqua]/[0] pb-[0px] pt-[0px]`}
                >
                  {/* <div
                className={`${styles.right_container} ${
                  isOpenSidebar ? `transition-base02` : `transition-base01`
                } h-full min-w-[calc((100vw-var(--sidebar-width))/3-11px)] max-w-[calc((100vw-var(--sidebar-width))/3-11px)] grow bg-[aqua]/[0] pb-[35px] pt-[0px]`}
              > */}
                  <div className={`${styles.right_contents_wrapper} flex h-full w-full flex-col bg-[#000]/[0]`}>
                    {/* 下エリア 禁止フラグなど */}
                    {/* 見積No・提出区分 通常 */}
                    <div className={`${styles.row_area} flex max-h-[26px] w-full items-center`}>
                      <div className="flex h-full w-1/2 flex-col pr-[20px]">
                        <div className={`${styles.title_box} flex h-full items-center `}>
                          <span className={`${styles.section_title} ${styles.min_text}`}>●見積No</span>
                          {/* ローカルストレージに真偽値で独自かシステムどちらを使うかを保持して表示を切り替える */}
                          {!searchMode && isEditModeField !== "quotation_no_system" && (
                            <span
                              className={`${styles.value} ${styles.value_highlight} ${styles.editable_field}`}
                              data-text={
                                selectedRowDataQuotation?.quotation_no_system
                                  ? selectedRowDataQuotation?.quotation_no_system
                                  : ""
                              }
                              onMouseEnter={(e) => handleOpenTooltip({ e, display: "top" })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={handleSingleClickField}
                              onDoubleClick={(e) => {
                                // if (!selectedRowDataQuotation?.activity_type) return;
                                // if (isNotActivityTypeArray.includes(selectedRowDataQuotation.activity_type)) {
                                //   return alert(returnMessageNotActivity(selectedRowDataQuotation.activity_type));
                                // }
                                handleDoubleClickField({
                                  e,
                                  field: "quotation_no_system",
                                  dispatch: setInputQuotationNoSystem,
                                  selectedRowDataValue: selectedRowDataQuotation?.quotation_no_system ?? "",
                                });
                                handleCloseTooltip();
                              }}
                            >
                              {selectedRowDataQuotation?.quotation_no_system
                                ? selectedRowDataQuotation?.quotation_no_system
                                : ""}
                            </span>
                          )}
                          {/* ============= フィールドエディットモード関連 ============= */}
                          {/* フィールドエディットモード selectタグ  */}
                          {!searchMode && isEditModeField === "quotation_no_system" && (
                            <>
                              <input
                                type="text"
                                placeholder=""
                                autoFocus
                                className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                                value={inputQuotationNoSystem}
                                onChange={(e) => setInputQuotationNoSystem(e.target.value)}
                                onCompositionStart={() => setIsComposing(true)}
                                onCompositionEnd={() => setIsComposing(false)}
                                onKeyDown={(e) =>
                                  handleKeyDownUpdateField({
                                    e,
                                    fieldName: "quotation_no_system",
                                    fieldNameForSelectedRowData: "quotation_no_system",
                                    originalValue: originalValueFieldEdit.current,
                                    newValue: inputQuotationNoSystem.trim(),
                                    id: selectedRowDataQuotation?.quotation_id,
                                    required: true,
                                  })
                                }
                              />
                              {/* 送信ボタンとクローズボタン */}
                              {!updateQuotationFieldMutation.isLoading && (
                                <InputSendAndCloseBtn
                                  inputState={inputQuotationNoSystem}
                                  setInputState={setInputQuotationNoSystem}
                                  onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                                    handleClickSendUpdateField({
                                      e,
                                      fieldName: "quotation_no_system",
                                      fieldNameForSelectedRowData: "quotation_no_system",
                                      originalValue: originalValueFieldEdit.current,
                                      newValue: inputQuotationNoSystem.trim(),
                                      id: selectedRowDataQuotation?.quotation_id,
                                      required: true,
                                    })
                                  }
                                  required={true}
                                  isDisplayClose={false}
                                />
                              )}
                              {/* エディットフィールド送信中ローディングスピナー */}
                              {updateQuotationFieldMutation.isLoading && (
                                <div className={`${styles.field_edit_mode_loading_area}`}>
                                  <SpinnerComet w="22px" h="22px" s="3px" />
                                </div>
                              )}
                            </>
                          )}
                          {/* フィールドエディットモードオーバーレイ */}
                          {!searchMode && isEditModeField === "quotation_no_system" && (
                            <div
                              className={`${styles.edit_mode_overlay}`}
                              onClick={(e) => {
                                e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
                                setIsEditModeField(null); // エディットモードを終了
                              }}
                            />
                          )}
                          {/* ============= フィールドエディットモード関連ここまで ============= */}
                        </div>
                        {/* <div className={`${styles.section_underline}`}></div> */}
                      </div>
                      <div className="flex h-full w-1/2 flex-col pr-[20px]">
                        <div className={`${styles.title_box} flex h-full items-center `}>
                          <div className={`${styles.section_title} ${styles.min_text} flex flex-col`}>
                            <span>●提出区分</span>
                          </div>

                          {!searchMode && isEditModeField !== "submission_class" && (
                            <span
                              className={`${styles.value} ${styles.value_highlight} ${styles.editable_field}`}
                              data-text={
                                selectedRowDataQuotation?.submission_class
                                  ? selectedRowDataQuotation?.submission_class
                                  : ""
                              }
                              onMouseEnter={(e) => handleOpenTooltip({ e, display: "top" })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={handleSingleClickField}
                              onDoubleClick={(e) => {
                                // if (!selectedRowDataQuotation?.activity_type) return;
                                // if (isNotActivityTypeArray.includes(selectedRowDataQuotation.activity_type)) {
                                //   return alert(returnMessageNotActivity(selectedRowDataQuotation.activity_type));
                                // }
                                handleDoubleClickField({
                                  e,
                                  field: "submission_class",
                                  dispatch: setInputSubmissionClassForFieldEdit,
                                  selectedRowDataValue: selectedRowDataQuotation?.submission_class ?? "",
                                });
                                handleCloseTooltip();
                              }}
                            >
                              {selectedRowDataQuotation?.submission_class
                                ? selectedRowDataQuotation?.submission_class
                                : ""}
                            </span>
                          )}
                          {/* ============= フィールドエディットモード関連 ============= */}
                          {/* フィールドエディットモード selectタグ  */}
                          {!searchMode && isEditModeField === "submission_class" && (
                            <>
                              <select
                                className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                                value={inputSubmissionClassForFieldEdit}
                                onChange={(e) => {
                                  handleChangeSelectUpdateField({
                                    e,
                                    fieldName: "submission_class",
                                    fieldNameForSelectedRowData: "submission_class",
                                    newValue: e.target.value,
                                    originalValue: originalValueFieldEdit.current,
                                    id: selectedRowDataQuotation?.quotation_id,
                                  });
                                }}
                                // onChange={(e) => {
                                //   setInputActivityType(e.target.value);
                                // }}
                              >
                                {/* <option value=""></option> */}
                                <option value="提出用">提出用</option>
                                <option value="社内用">社内用</option>
                              </select>
                              {/* エディットフィールド送信中ローディングスピナー */}
                              {updateQuotationFieldMutation.isLoading && (
                                <div
                                  className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                                >
                                  <SpinnerComet w="22px" h="22px" s="3px" />
                                </div>
                              )}
                            </>
                          )}
                          {/* フィールドエディットモードオーバーレイ */}
                          {!searchMode && isEditModeField === "submission_class" && (
                            <div
                              className={`${styles.edit_mode_overlay}`}
                              onClick={(e) => {
                                e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
                                setIsEditModeField(null); // エディットモードを終了
                              }}
                            />
                          )}
                          {/* ============= フィールドエディットモード関連ここまで ============= */}
                        </div>
                        {/* <div className={`${styles.section_underline}`}></div> */}
                      </div>
                    </div>
                    <div className={`${styles.section_underline2} `}></div>
                    {/*  */}

                    {/* ●見積日・●納期 */}
                    <div className={`${styles.row_area} flex w-full items-center`}>
                      <div className="flex h-full w-1/2 flex-col pr-[20px]">
                        <div className={`${styles.title_box} flex h-full items-center `}>
                          <span className={`${styles.title}`}>●納期</span>
                          {!searchMode && isEditModeField !== "deadline" && (
                            <span
                              className={`${styles.value} ${styles.editable_field}`}
                              onClick={handleSingleClickField}
                              onDoubleClick={(e) => {
                                if (!selectedRowDataQuotation?.deadline) return;
                                // if (isNotActivityTypeArray.includes(selectedRowDataQuotation.deadline))
                                //   return alert(returnMessageNotActivity(selectedRowDataQuotation.deadline));
                                handleDoubleClickField({
                                  e,
                                  field: "deadline",
                                  dispatch: setInputDeadlineForFieldEdit,
                                });
                                if (hoveredItemPosWrap) handleCloseTooltip();
                              }}
                              data-text={`${
                                selectedRowDataQuotation?.deadline ? selectedRowDataQuotation?.deadline : ""
                              }`}
                              onMouseEnter={(e) => {
                                e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                                // if (!isDesktopGTE1600) handleOpenTooltip(e);
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                                // if (!isDesktopGTE1600 || hoveredItemPosWrap) handleCloseTooltip();
                              }}
                            >
                              {selectedRowDataQuotation?.deadline ? selectedRowDataQuotation?.deadline : ""}
                            </span>
                          )}
                          {/* ============= フィールドエディットモード関連 ============= */}
                          {/* フィールドエディットモード selectタグ  */}
                          {!searchMode && isEditModeField === "deadline" && (
                            <>
                              <select
                                className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                                value={inputDeadlineForFieldEdit}
                                onChange={(e) => {
                                  handleChangeSelectUpdateField({
                                    e,
                                    fieldName: "deadline",
                                    fieldNameForSelectedRowData: "deadline",
                                    newValue: e.target.value,
                                    originalValue: originalValueFieldEdit.current,
                                    id: selectedRowDataQuotation?.quotation_id,
                                  });
                                }}
                                // onChange={(e) => {
                                //   setInputActivityType(e.target.value);
                                // }}
                              >
                                {/* <option value=""></option> */}
                                {/* {optionsMeetingType.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))} */}
                              </select>
                              {/* エディットフィールド送信中ローディングスピナー */}
                              {updateQuotationFieldMutation.isLoading && (
                                <div
                                  className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                                >
                                  <SpinnerComet w="22px" h="22px" s="3px" />
                                </div>
                              )}
                            </>
                          )}
                          {/* フィールドエディットモードオーバーレイ */}
                          {!searchMode && isEditModeField === "deadline" && (
                            <div
                              className={`${styles.edit_mode_overlay}`}
                              onClick={(e) => {
                                e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
                                setIsEditModeField(null); // エディットモードを終了
                              }}
                            />
                          )}
                          {/* ============= フィールドエディットモード関連ここまで ============= */}
                        </div>
                        <div className={`${styles.underline}`}></div>
                      </div>
                      {/* 見積日 */}
                      <div className="flex h-full w-1/2 flex-col pr-[20px]">
                        <div className={`${styles.title_box} flex h-full items-center`}>
                          <span className={`${styles.title}`}>●見積日</span>
                          {!searchMode && isEditModeField !== "quotation_date" && (
                            <span
                              className={`${styles.value} ${styles.editable_field}`}
                              onClick={handleSingleClickField}
                              onDoubleClick={(e) => {
                                // if (!selectedRowDataQuotation?.activity_type) return;
                                // if (isNotActivityTypeArray.includes(selectedRowDataQuotation.activity_type)) {
                                //   return alert(returnMessageNotActivity(selectedRowDataQuotation.activity_type));
                                // }
                                handleDoubleClickField({
                                  e,
                                  field: "quotation_date",
                                  dispatch: setInputQuotationDateForFieldEdit,
                                  dateValue: selectedRowDataQuotation?.quotation_date
                                    ? selectedRowDataQuotation.quotation_date
                                    : null,
                                });
                              }}
                              data-text={`${
                                selectedRowDataQuotation?.quotation_date
                                  ? format(new Date(selectedRowDataQuotation.quotation_date), "yyyy/MM/dd")
                                  : ""
                              }`}
                              onMouseEnter={(e) => {
                                e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                                if (!isDesktopGTE1600 && isOpenSidebar) handleOpenTooltip({ e });
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                                if ((!isDesktopGTE1600 && isOpenSidebar) || hoveredItemPosWrap) handleCloseTooltip();
                              }}
                            >
                              {selectedRowDataQuotation?.quotation_date
                                ? format(new Date(selectedRowDataQuotation.quotation_date), "yyyy/MM/dd")
                                : ""}
                            </span>
                          )}
                          {/* ============= フィールドエディットモード関連 ============= */}
                          {/* フィールドエディットモード Date-picker  */}
                          {!searchMode && isEditModeField === "quotation_date" && (
                            <>
                              <div className="z-[2000] w-full">
                                <DatePickerCustomInput
                                  startDate={inputQuotationDateForFieldEdit}
                                  setStartDate={setInputQuotationDateForFieldEdit}
                                  required={true}
                                  isFieldEditMode={true}
                                  fieldEditModeBtnAreaPosition="right"
                                  isLoadingSendEvent={updateQuotationFieldMutation.isLoading}
                                  onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                                    if (!inputQuotationDateForFieldEdit) return alert("このデータは入力が必須です。");
                                    const originalDateUTCString = selectedRowDataQuotation?.quotation_date
                                      ? selectedRowDataQuotation.quotation_date
                                      : null; // ISOString UTC時間 2023-12-26T15:00:00+00:00
                                    const newDateUTCString = inputQuotationDateForFieldEdit
                                      ? inputQuotationDateForFieldEdit.toISOString()
                                      : null; // Dateオブジェクト ローカルタイムゾーンに自動で変換済み Thu Dec 28 2023 00:00:00 GMT+0900 (日本標準時)
                                    // const result = isSameDateLocal(originalDateString, newDateString);
                                    console.log(
                                      "日付送信クリック",
                                      "オリジナル(UTC)",
                                      originalDateUTCString,
                                      "新たな値(Dateオブジェクト)",
                                      inputQuotationDateForFieldEdit,
                                      "新たな値.toISO(UTC)",
                                      newDateUTCString
                                      // "同じかチェック結果",
                                      // result
                                    );
                                    if (e.currentTarget.parentElement?.parentElement?.parentElement)
                                      e.currentTarget.parentElement.parentElement.parentElement.classList.remove(
                                        `${styles.active}`
                                      );
                                    // オリジナルはUTC、新たな値はDateオブジェクト(ローカルタイムゾーン)なのでISOString()でUTCに変換
                                    handleClickSendUpdateField({
                                      e,
                                      fieldName: "quotation_date",
                                      fieldNameForSelectedRowData: "quotation_date",
                                      // originalValue: originalValueFieldEdit.current,
                                      originalValue: originalDateUTCString,
                                      newValue: newDateUTCString,
                                      id: selectedRowDataQuotation?.quotation_id,
                                      required: true,
                                    });
                                  }}
                                />
                              </div>
                            </>
                          )}
                          {/* フィールドエディットモードオーバーレイ */}
                          {!searchMode && isEditModeField === "quotation_date" && (
                            <div
                              className={`${styles.edit_mode_overlay}`}
                              onClick={(e) => {
                                e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
                                setIsEditModeField(null); // エディットモードを終了
                              }}
                            />
                          )}
                          {/* ============= フィールドエディットモード関連ここまで ============= */}
                        </div>
                        <div className={`${styles.underline}`}></div>
                      </div>
                    </div>
                    {/*  */}

                    {/* ●有効期限・●納入場所 */}
                    <div className={`${styles.row_area} flex w-full items-center`}>
                      <div className="flex h-full w-1/2 flex-col pr-[20px]">
                        <div className={`${styles.title_box} flex h-full items-center `}>
                          <span className={`${styles.title}`}>●納入場所</span>
                          {!searchMode && isEditModeField !== "delivery_place" && (
                            <span
                              className={`${styles.value} ${styles.editable_field}`}
                              onClick={handleSingleClickField}
                              onDoubleClick={(e) => {
                                if (!selectedRowDataQuotation?.delivery_place) return;
                                // if (isNotActivityTypeArray.includes(selectedRowDataQuotation.delivery_place))
                                //   return alert(returnMessageNotActivity(selectedRowDataQuotation.delivery_place));
                                handleDoubleClickField({
                                  e,
                                  field: "delivery_place",
                                  dispatch: setInputDeliveryPlaceForFieldEdit,
                                });
                                if (hoveredItemPosWrap) handleCloseTooltip();
                              }}
                              data-text={`${
                                selectedRowDataQuotation?.delivery_place ? selectedRowDataQuotation?.delivery_place : ""
                              }`}
                              onMouseEnter={(e) => {
                                e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                                // if (!isDesktopGTE1600) handleOpenTooltip(e);
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                                // if (!isDesktopGTE1600 || hoveredItemPosWrap) handleCloseTooltip();
                              }}
                            >
                              {selectedRowDataQuotation?.delivery_place ? selectedRowDataQuotation?.delivery_place : ""}
                            </span>
                          )}
                          {/* ============= フィールドエディットモード関連 ============= */}
                          {/* フィールドエディットモード selectタグ  */}
                          {!searchMode && isEditModeField === "delivery_place" && (
                            <>
                              <select
                                className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                                value={inputDeliveryPlaceForFieldEdit}
                                onChange={(e) => {
                                  handleChangeSelectUpdateField({
                                    e,
                                    fieldName: "delivery_place",
                                    fieldNameForSelectedRowData: "delivery_place",
                                    newValue: e.target.value,
                                    originalValue: originalValueFieldEdit.current,
                                    id: selectedRowDataQuotation?.quotation_id,
                                  });
                                }}
                                // onChange={(e) => {
                                //   setInputActivityType(e.target.value);
                                // }}
                              >
                                {/* <option value=""></option> */}
                                {/* {optionsMeetingType.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))} */}
                              </select>
                              {/* エディットフィールド送信中ローディングスピナー */}
                              {updateQuotationFieldMutation.isLoading && (
                                <div
                                  className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                                >
                                  <SpinnerComet w="22px" h="22px" s="3px" />
                                </div>
                              )}
                            </>
                          )}
                          {/* フィールドエディットモードオーバーレイ */}
                          {!searchMode && isEditModeField === "delivery_place" && (
                            <div
                              className={`${styles.edit_mode_overlay}`}
                              onClick={(e) => {
                                e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
                                setIsEditModeField(null); // エディットモードを終了
                              }}
                            />
                          )}
                          {/* ============= フィールドエディットモード関連ここまで ============= */}
                        </div>
                        <div className={`${styles.underline}`}></div>
                      </div>
                      {/* 有効期限 */}
                      <div className="flex h-full w-1/2 flex-col pr-[20px]">
                        <div className={`${styles.title_box} flex h-full items-center`}>
                          <span className={`${styles.title}`}>○有効期限</span>
                          {!searchMode && isEditModeField !== "expiration_date" && (
                            <span
                              className={`${styles.value} ${styles.editable_field}`}
                              onClick={handleSingleClickField}
                              onDoubleClick={(e) => {
                                // if (!selectedRowDataQuotation?.activity_type) return;
                                // if (isNotActivityTypeArray.includes(selectedRowDataQuotation.activity_type)) {
                                //   return alert(returnMessageNotActivity(selectedRowDataQuotation.activity_type));
                                // }
                                handleDoubleClickField({
                                  e,
                                  field: "expiration_date",
                                  dispatch: setInputExpirationDateForFieldEdit,
                                  dateValue: selectedRowDataQuotation?.expiration_date
                                    ? selectedRowDataQuotation.expiration_date
                                    : null,
                                });
                              }}
                              data-text={`${
                                selectedRowDataQuotation?.expiration_date
                                  ? format(new Date(selectedRowDataQuotation.expiration_date), "yyyy/MM/dd")
                                  : ""
                              }`}
                              onMouseEnter={(e) => {
                                e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                                if (!isDesktopGTE1600 && isOpenSidebar) handleOpenTooltip({ e });
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                                if ((!isDesktopGTE1600 && isOpenSidebar) || hoveredItemPosWrap) handleCloseTooltip();
                              }}
                            >
                              {selectedRowDataQuotation?.expiration_date
                                ? format(new Date(selectedRowDataQuotation.expiration_date), "yyyy/MM/dd")
                                : ""}
                            </span>
                          )}
                          {/* ============= フィールドエディットモード関連 ============= */}
                          {/* フィールドエディットモード Date-picker  */}
                          {!searchMode && isEditModeField === "expiration_date" && (
                            <>
                              <div className="z-[2000] w-full">
                                <DatePickerCustomInput
                                  startDate={inputExpirationDateForFieldEdit}
                                  setStartDate={setInputExpirationDateForFieldEdit}
                                  required={true}
                                  isFieldEditMode={true}
                                  fieldEditModeBtnAreaPosition="right"
                                  isLoadingSendEvent={updateQuotationFieldMutation.isLoading}
                                  onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                                    if (!inputExpirationDateForFieldEdit) return alert("このデータは入力が必須です。");
                                    const originalDateUTCString = selectedRowDataQuotation?.expiration_date
                                      ? selectedRowDataQuotation.expiration_date
                                      : null; // ISOString UTC時間 2023-12-26T15:00:00+00:00
                                    const newDateUTCString = inputExpirationDateForFieldEdit
                                      ? inputExpirationDateForFieldEdit.toISOString()
                                      : null; // Dateオブジェクト ローカルタイムゾーンに自動で変換済み Thu Dec 28 2023 00:00:00 GMT+0900 (日本標準時)
                                    // const result = isSameDateLocal(originalDateString, newDateString);
                                    console.log(
                                      "日付送信クリック",
                                      "オリジナル(UTC)",
                                      originalDateUTCString,
                                      "新たな値(Dateオブジェクト)",
                                      inputQuotationDateForFieldEdit,
                                      "新たな値.toISO(UTC)",
                                      newDateUTCString
                                      // "同じかチェック結果",
                                      // result
                                    );
                                    if (e.currentTarget.parentElement?.parentElement?.parentElement)
                                      e.currentTarget.parentElement.parentElement.parentElement.classList.remove(
                                        `${styles.active}`
                                      );
                                    // オリジナルはUTC、新たな値はDateオブジェクト(ローカルタイムゾーン)なのでISOString()でUTCに変換
                                    handleClickSendUpdateField({
                                      e,
                                      fieldName: "expiration_date",
                                      fieldNameForSelectedRowData: "expiration_date",
                                      // originalValue: originalValueFieldEdit.current,
                                      originalValue: originalDateUTCString,
                                      newValue: newDateUTCString,
                                      id: selectedRowDataQuotation?.quotation_id,
                                      required: true,
                                    });
                                  }}
                                />
                              </div>
                            </>
                          )}
                          {/* フィールドエディットモードオーバーレイ */}
                          {!searchMode && isEditModeField === "expiration_date" && (
                            <div
                              className={`${styles.edit_mode_overlay}`}
                              onClick={(e) => {
                                e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
                                setIsEditModeField(null); // エディットモードを終了
                              }}
                            />
                          )}
                          {/* ============= フィールドエディットモード関連ここまで ============= */}
                        </div>
                        <div className={`${styles.underline}`}></div>
                      </div>
                    </div>
                    {/*  */}

                    {/* ●取引方法・角印印刷 */}
                    <div className={`${styles.row_area} flex w-full items-center`}>
                      <div className="flex h-full w-1/2 flex-col pr-[20px]">
                        <div className={`${styles.title_box} flex h-full items-center `}>
                          <span className={`${styles.title}`}>●取引方法</span>
                          {!searchMode && isEditModeField !== "payment_terms" && (
                            <span
                              className={`${styles.value} ${styles.editable_field}`}
                              onClick={handleSingleClickField}
                              onDoubleClick={(e) => {
                                if (!selectedRowDataQuotation?.payment_terms) return;
                                // if (isNotActivityTypeArray.includes(selectedRowDataQuotation.payment_terms))
                                //   return alert(returnMessageNotActivity(selectedRowDataQuotation.payment_terms));
                                handleDoubleClickField({
                                  e,
                                  field: "payment_terms",
                                  dispatch: setInputPaymentTermsForFieldEdit,
                                });
                                if (hoveredItemPosWrap) handleCloseTooltip();
                              }}
                              data-text={`${
                                selectedRowDataQuotation?.payment_terms ? selectedRowDataQuotation?.payment_terms : ""
                              }`}
                              onMouseEnter={(e) => {
                                e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                                // if (!isDesktopGTE1600) handleOpenTooltip(e);
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                                // if (!isDesktopGTE1600 || hoveredItemPosWrap) handleCloseTooltip();
                              }}
                            >
                              {selectedRowDataQuotation?.payment_terms ? selectedRowDataQuotation?.payment_terms : ""}
                            </span>
                          )}
                          {/* ============= フィールドエディットモード関連 ============= */}
                          {/* フィールドエディットモード selectタグ  */}
                          {!searchMode && isEditModeField === "payment_terms" && (
                            <>
                              <select
                                className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                                value={inputPaymentTermsForFieldEdit}
                                onChange={(e) => {
                                  handleChangeSelectUpdateField({
                                    e,
                                    fieldName: "payment_terms",
                                    fieldNameForSelectedRowData: "payment_terms",
                                    newValue: e.target.value,
                                    originalValue: originalValueFieldEdit.current,
                                    id: selectedRowDataQuotation?.quotation_id,
                                  });
                                }}
                                // onChange={(e) => {
                                //   setInputActivityType(e.target.value);
                                // }}
                              >
                                {/* <option value=""></option> */}
                                {/* {optionsMeetingType.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))} */}
                              </select>
                              {/* エディットフィールド送信中ローディングスピナー */}
                              {updateQuotationFieldMutation.isLoading && (
                                <div
                                  className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                                >
                                  <SpinnerComet w="22px" h="22px" s="3px" />
                                </div>
                              )}
                            </>
                          )}
                          {/* フィールドエディットモードオーバーレイ */}
                          {!searchMode && isEditModeField === "payment_terms" && (
                            <div
                              className={`${styles.edit_mode_overlay}`}
                              onClick={(e) => {
                                e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
                                setIsEditModeField(null); // エディットモードを終了
                              }}
                            />
                          )}
                          {/* ============= フィールドエディットモード関連ここまで ============= */}
                        </div>
                        <div className={`${styles.underline}`}></div>
                      </div>
                      <div className="flex h-full w-1/2 flex-col pr-[20px]">
                        <div className={`${styles.title_box} flex h-full items-center`}>
                          <span className={`${styles.check_title} ${styles.single_text}`}>角印印刷</span>

                          <div
                            className={`${styles.grid_select_cell_header} `}
                            onMouseEnter={(e) => {
                              if (!selectedRowDataQuotation) return;
                              e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            }}
                            onMouseLeave={(e) => {
                              if (!selectedRowDataQuotation) return;
                              e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            }}
                          >
                            <input
                              type="checkbox"
                              // checked={!!selectedRowDataQuotation?.use_corporate_seal}
                              // onChange={() => {
                              //   setLoadingGlobalState(false);
                              //   setIsOpenUpdateQuotationModal(true);
                              // }}
                              className={`${styles.grid_select_cell_header_input} ${
                                !selectedRowDataQuotation ? `pointer-events-none cursor-not-allowed` : ``
                              }`}
                              checked={checkboxUseCorporateSealFlagForFieldEdit}
                              onChange={async (e) => {
                                if (!selectedRowDataQuotation) return;
                                // 個別にチェックボックスを更新するルート
                                if (!selectedRowDataQuotation?.quotation_id)
                                  return toast.error(`データが見つかりませんでした🙇‍♀️`);

                                console.log(
                                  "チェック 新しい値",
                                  !checkboxUseCorporateSealFlagForFieldEdit,
                                  "オリジナル",
                                  selectedRowDataQuotation?.use_corporate_seal
                                );
                                if (
                                  !checkboxUseCorporateSealFlagForFieldEdit ===
                                  selectedRowDataQuotation?.use_corporate_seal
                                ) {
                                  toast.error(`アップデートに失敗しました🤦‍♀️`);
                                  return;
                                }
                                const updatePayload = {
                                  fieldName: "use_corporate_seal",
                                  fieldNameForSelectedRowData: "use_corporate_seal" as "use_corporate_seal",
                                  newValue: !checkboxUseCorporateSealFlagForFieldEdit,
                                  id: selectedRowDataQuotation.quotation_id,
                                };
                                // 直感的にするためにmutateにして非同期処理のまま後続のローカルのチェックボックスを更新する
                                updateQuotationFieldMutation.mutate(updatePayload);
                                setCheckboxUseCorporateSealFlagForFieldEdit(!checkboxUseCorporateSealFlagForFieldEdit);
                              }}
                            />
                            <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                            </svg>
                          </div>
                        </div>
                        <div className={`${styles.underline}`}></div>
                      </div>
                    </div>
                    {/*  */}

                    {/* ●見積区分・●送付方法 */}
                    <div className={`${styles.row_area} flex w-full items-center`}>
                      <div className="flex h-full w-1/2 flex-col pr-[20px]">
                        <div className={`${styles.title_box} flex h-full items-center `}>
                          <span className={`${styles.title}`}>●見積区分</span>
                          {!searchMode && isEditModeField !== "quotation_division" && (
                            <span
                              className={`${styles.value} ${styles.editable_field}`}
                              onClick={handleSingleClickField}
                              onDoubleClick={(e) => {
                                if (!selectedRowDataQuotation?.quotation_division) return;
                                // if (isNotActivityTypeArray.includes(selectedRowDataQuotation.quotation_division))
                                //   return alert(returnMessageNotActivity(selectedRowDataQuotation.quotation_division));
                                handleDoubleClickField({
                                  e,
                                  field: "quotation_division",
                                  dispatch: setInputQuotationDivisionForFieldEdit,
                                });
                                if (hoveredItemPosWrap) handleCloseTooltip();
                              }}
                              data-text={`${
                                selectedRowDataQuotation?.quotation_division
                                  ? selectedRowDataQuotation?.quotation_division
                                  : ""
                              }`}
                              onMouseEnter={(e) => {
                                e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                                // if (!isDesktopGTE1600) handleOpenTooltip(e);
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                                // if (!isDesktopGTE1600 || hoveredItemPosWrap) handleCloseTooltip();
                              }}
                            >
                              {selectedRowDataQuotation?.quotation_division
                                ? selectedRowDataQuotation?.quotation_division
                                : ""}
                            </span>
                          )}
                          {/* ============= フィールドエディットモード関連 ============= */}
                          {/* フィールドエディットモード selectタグ  */}
                          {!searchMode && isEditModeField === "quotation_division" && (
                            <>
                              <select
                                className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                                value={inputQuotationDivisionForFieldEdit}
                                onChange={(e) => {
                                  handleChangeSelectUpdateField({
                                    e,
                                    fieldName: "quotation_division",
                                    fieldNameForSelectedRowData: "quotation_division",
                                    newValue: e.target.value,
                                    originalValue: originalValueFieldEdit.current,
                                    id: selectedRowDataQuotation?.quotation_id,
                                  });
                                }}
                                // onChange={(e) => {
                                //   setInputActivityType(e.target.value);
                                // }}
                              >
                                {/* <option value=""></option> */}
                                {/* {optionsMeetingType.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))} */}
                              </select>
                              {/* エディットフィールド送信中ローディングスピナー */}
                              {updateQuotationFieldMutation.isLoading && (
                                <div
                                  className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                                >
                                  <SpinnerComet w="22px" h="22px" s="3px" />
                                </div>
                              )}
                            </>
                          )}
                          {/* フィールドエディットモードオーバーレイ */}
                          {!searchMode && isEditModeField === "quotation_division" && (
                            <div
                              className={`${styles.edit_mode_overlay}`}
                              onClick={(e) => {
                                e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
                                setIsEditModeField(null); // エディットモードを終了
                              }}
                            />
                          )}
                          {/* ============= フィールドエディットモード関連ここまで ============= */}
                        </div>
                        <div className={`${styles.underline}`}></div>
                      </div>
                      <div className="flex h-full w-1/2 flex-col pr-[20px]">
                        <div className={`${styles.title_box} flex h-full items-center`}>
                          <span className={`${styles.title}`}>○送付方法</span>
                          {!searchMode && isEditModeField !== "sending_method" && (
                            <span
                              className={`${styles.value} ${styles.editable_field}`}
                              onClick={handleSingleClickField}
                              onDoubleClick={(e) => {
                                if (!selectedRowDataQuotation?.sending_method) return;
                                // if (isNotActivityTypeArray.includes(selectedRowDataQuotation.sending_method))
                                //   return alert(returnMessageNotActivity(selectedRowDataQuotation.sending_method));
                                handleDoubleClickField({
                                  e,
                                  field: "sending_method",
                                  dispatch: setInputSendingMethodForFieldEdit,
                                });
                                if (hoveredItemPosWrap) handleCloseTooltip();
                              }}
                              data-text={`${
                                selectedRowDataQuotation?.sending_method ? selectedRowDataQuotation?.sending_method : ""
                              }`}
                              onMouseEnter={(e) => {
                                e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                                // if (!isDesktopGTE1600) handleOpenTooltip(e);
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                                // if (!isDesktopGTE1600 || hoveredItemPosWrap) handleCloseTooltip();
                              }}
                            >
                              {selectedRowDataQuotation?.sending_method ? selectedRowDataQuotation?.sending_method : ""}
                            </span>
                          )}
                          {/* ============= フィールドエディットモード関連 ============= */}
                          {/* フィールドエディットモード selectタグ  */}
                          {!searchMode && isEditModeField === "sending_method" && (
                            <>
                              <select
                                className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                                value={inputSendingMethodForFieldEdit}
                                onChange={(e) => {
                                  handleChangeSelectUpdateField({
                                    e,
                                    fieldName: "sending_method",
                                    fieldNameForSelectedRowData: "sending_method",
                                    newValue: e.target.value,
                                    originalValue: originalValueFieldEdit.current,
                                    id: selectedRowDataQuotation?.quotation_id,
                                  });
                                }}
                                // onChange={(e) => {
                                //   setInputActivityType(e.target.value);
                                // }}
                              >
                                {/* <option value=""></option> */}
                                {/* {optionsMeetingType.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))} */}
                              </select>
                              {/* エディットフィールド送信中ローディングスピナー */}
                              {updateQuotationFieldMutation.isLoading && (
                                <div
                                  className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                                >
                                  <SpinnerComet w="22px" h="22px" s="3px" />
                                </div>
                              )}
                            </>
                          )}
                          {/* フィールドエディットモードオーバーレイ */}
                          {!searchMode && isEditModeField === "sending_method" && (
                            <div
                              className={`${styles.edit_mode_overlay}`}
                              onClick={(e) => {
                                e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
                                setIsEditModeField(null); // エディットモードを終了
                              }}
                            />
                          )}
                          {/* ============= フィールドエディットモード関連ここまで ============= */}
                        </div>
                        <div className={`${styles.underline}`}></div>
                      </div>
                    </div>
                    {/*  */}

                    {/* 見積備考 */}
                    <div className={`${styles.row_area_lg_box} flex w-full items-center`}>
                      <div className="flex h-full w-full flex-col pr-[20px]">
                        <div className={`${styles.title_box} flex h-full `}>
                          <span className={`${styles.title} ${styles.title_sm}`}>見積備考</span>
                          {!searchMode && isEditModeField !== "quotation_notes" && (
                            <div
                              className={`${styles.textarea_box} ${styles.md} ${
                                selectedRowDataQuotation ? `${styles.editable_field}` : `${styles.uneditable_field}`
                              }`}
                              onClick={handleSingleClickField}
                              onDoubleClick={(e) => {
                                if (!selectedRowDataQuotation) return;
                                // if (isNotActivityTypeArray.includes(selectedRowDataQuotation.activity_type))
                                //   return alert(returnMessageNotActivity(selectedRowDataQuotation.activity_type));
                                handleCloseTooltip();
                                handleDoubleClickField({
                                  e,
                                  field: "quotation_notes",
                                  dispatch: setInputQuotationNotes,
                                  selectedRowDataValue: selectedRowDataQuotation?.quotation_notes
                                    ? selectedRowDataQuotation?.quotation_notes
                                    : null,
                                });
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                              }}
                              dangerouslySetInnerHTML={{
                                __html: selectedRowDataQuotation?.quotation_notes
                                  ? selectedRowDataQuotation?.quotation_notes.replace(/\n/g, "<br>")
                                  : "",
                              }}
                            ></div>
                          )}
                          {/* ============= フィールドエディットモード関連 ============= */}
                          {/* フィールドエディットモード inputタグ */}
                          {!searchMode && isEditModeField === "quotation_notes" && (
                            <>
                              <textarea
                                cols={30}
                                // rows={10}
                                placeholder=""
                                style={{ whiteSpace: "pre-wrap" }}
                                className={`${styles.textarea_box} ${styles.textarea_box_search_mode} ${styles.field_edit_mode_textarea} ${styles.xl}`}
                                value={inputQuotationNotes}
                                onChange={(e) => setInputQuotationNotes(e.target.value)}
                              ></textarea>
                              {/* 送信ボタンとクローズボタン */}
                              <InputSendAndCloseBtn
                                inputState={inputQuotationNotes}
                                setInputState={setInputQuotationNotes}
                                onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                                  handleClickSendUpdateField({
                                    e,
                                    fieldName: "quotation_notes",
                                    fieldNameForSelectedRowData: "quotation_notes",
                                    originalValue: originalValueFieldEdit.current,
                                    newValue: inputQuotationNotes ? inputQuotationNotes.trim() : null,
                                    id: selectedRowDataQuotation?.quotation_id,
                                    required: false,
                                  })
                                }
                                required={false}
                                // isDisplayClose={true}
                                // btnPositionY="bottom-[8px]"
                                isOutside={true}
                                outsidePosition="under_right"
                                isLoadingSendEvent={updateQuotationFieldMutation.isLoading}
                              />
                            </>
                          )}
                          {/* フィールドエディットモードオーバーレイ */}
                          {!searchMode && isEditModeField === "quotation_notes" && (
                            <div
                              className={`${styles.edit_mode_overlay}`}
                              onClick={(e) => {
                                e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
                                setIsEditModeField(null); // エディットモードを終了
                              }}
                            />
                          )}
                          {/* ============= フィールドエディットモード関連ここまで ============= */}
                        </div>
                        <div className={`${styles.underline}`}></div>
                      </div>
                    </div>
                    {/*  */}

                    {/* ●消費税区分・●消費税率 */}
                    <div className={`${styles.row_area} flex w-full items-center`}>
                      <div className="flex h-full w-1/2 flex-col pr-[20px]">
                        <div className={`${styles.title_box} flex h-full items-center `}>
                          <span className={`${styles.title}`}>●消費税区分</span>
                          {!searchMode && isEditModeField !== "sales_tax_class" && (
                            <span
                              className={`${styles.value} ${styles.editable_field}`}
                              onClick={handleSingleClickField}
                              onDoubleClick={(e) => {
                                if (!selectedRowDataQuotation?.sales_tax_class) return;
                                // if (isNotActivityTypeArray.includes(selectedRowDataQuotation.sales_tax_class))
                                //   return alert(returnMessageNotActivity(selectedRowDataQuotation.sales_tax_class));
                                handleDoubleClickField({
                                  e,
                                  field: "sales_tax_class",
                                  dispatch: setInputSalesTaxClassForFieldEdit,
                                });
                                if (hoveredItemPosWrap) handleCloseTooltip();
                              }}
                              data-text={`${
                                selectedRowDataQuotation?.sales_tax_class
                                  ? selectedRowDataQuotation?.sales_tax_class
                                  : ""
                              }`}
                              onMouseEnter={(e) => {
                                e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                                // if (!isDesktopGTE1600) handleOpenTooltip(e);
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                                // if (!isDesktopGTE1600 || hoveredItemPosWrap) handleCloseTooltip();
                              }}
                            >
                              {selectedRowDataQuotation?.sales_tax_class
                                ? selectedRowDataQuotation?.sales_tax_class
                                : ""}
                            </span>
                          )}
                          {/* ============= フィールドエディットモード関連 ============= */}
                          {/* フィールドエディットモード selectタグ  */}
                          {!searchMode && isEditModeField === "sales_tax_class" && (
                            <>
                              <select
                                className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                                value={inputSalesTaxClassForFieldEdit}
                                onChange={(e) => {
                                  handleChangeSelectUpdateField({
                                    e,
                                    fieldName: "sales_tax_class",
                                    fieldNameForSelectedRowData: "sales_tax_class",
                                    newValue: e.target.value,
                                    originalValue: originalValueFieldEdit.current,
                                    id: selectedRowDataQuotation?.quotation_id,
                                  });
                                }}
                                // onChange={(e) => {
                                //   setInputActivityType(e.target.value);
                                // }}
                              >
                                {/* <option value=""></option> */}
                                {/* {optionsMeetingType.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))} */}
                              </select>
                              {/* エディットフィールド送信中ローディングスピナー */}
                              {updateQuotationFieldMutation.isLoading && (
                                <div
                                  className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                                >
                                  <SpinnerComet w="22px" h="22px" s="3px" />
                                </div>
                              )}
                            </>
                          )}
                          {/* フィールドエディットモードオーバーレイ */}
                          {!searchMode && isEditModeField === "sales_tax_class" && (
                            <div
                              className={`${styles.edit_mode_overlay}`}
                              onClick={(e) => {
                                e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
                                setIsEditModeField(null); // エディットモードを終了
                              }}
                            />
                          )}
                          {/* ============= フィールドエディットモード関連ここまで ============= */}
                        </div>
                        <div className={`${styles.underline}`}></div>
                      </div>
                      <div className="flex h-full w-1/2 flex-col pr-[20px]">
                        <div className={`${styles.title_box} flex h-full items-center`}>
                          <span className={`${styles.title}`}>●消費税率</span>
                          {!searchMode && isEditModeField !== "sales_tax_rate" && (
                            <span
                              className={`${styles.value} ${styles.editable_field}`}
                              onClick={handleSingleClickField}
                              onDoubleClick={(e) => {
                                if (!selectedRowDataQuotation?.sales_tax_rate) return;
                                // if (isNotActivityTypeArray.includes(selectedRowDataQuotation.sales_tax_rate))
                                //   return alert(returnMessageNotActivity(selectedRowDataQuotation.sales_tax_rate));
                                handleDoubleClickField({
                                  e,
                                  field: "sales_tax_rate",
                                  dispatch: setInputSalesTaxRateForFieldEdit,
                                });
                                if (hoveredItemPosWrap) handleCloseTooltip();
                              }}
                              data-text={`${
                                selectedRowDataQuotation?.sales_tax_rate ? selectedRowDataQuotation?.sales_tax_rate : ""
                              }`}
                              onMouseEnter={(e) => {
                                e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                                // if (!isDesktopGTE1600) handleOpenTooltip(e);
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                                // if (!isDesktopGTE1600 || hoveredItemPosWrap) handleCloseTooltip();
                              }}
                            >
                              {selectedRowDataQuotation?.sales_tax_rate ? selectedRowDataQuotation?.sales_tax_rate : ""}
                            </span>
                          )}
                          {/* ============= フィールドエディットモード関連 ============= */}
                          {/* フィールドエディットモード selectタグ  */}
                          {!searchMode && isEditModeField === "sales_tax_rate" && (
                            <>
                              <select
                                className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                                value={inputSalesTaxRateForFieldEdit}
                                onChange={(e) => {
                                  handleChangeSelectUpdateField({
                                    e,
                                    fieldName: "sales_tax_rate",
                                    fieldNameForSelectedRowData: "sales_tax_rate",
                                    newValue: e.target.value,
                                    originalValue: originalValueFieldEdit.current,
                                    id: selectedRowDataQuotation?.quotation_id,
                                  });
                                }}
                                // onChange={(e) => {
                                //   setInputActivityType(e.target.value);
                                // }}
                              >
                                {/* <option value=""></option> */}
                                {/* {optionsMeetingType.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))} */}
                              </select>
                              {/* エディットフィールド送信中ローディングスピナー */}
                              {updateQuotationFieldMutation.isLoading && (
                                <div
                                  className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                                >
                                  <SpinnerComet w="22px" h="22px" s="3px" />
                                </div>
                              )}
                            </>
                          )}
                          {/* フィールドエディットモードオーバーレイ */}
                          {!searchMode && isEditModeField === "sales_tax_rate" && (
                            <div
                              className={`${styles.edit_mode_overlay}`}
                              onClick={(e) => {
                                e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
                                setIsEditModeField(null); // エディットモードを終了
                              }}
                            />
                          )}
                          {/* ============= フィールドエディットモード関連ここまで ============= */}
                        </div>
                        <div className={`${styles.underline}`}></div>
                      </div>
                    </div>
                    {/*  */}

                    {/* 価格合計・値引タイトル */}
                    <div className={`${styles.row_area} flex w-full items-center`}>
                      <div className="flex h-full w-1/2 flex-col pr-[20px]">
                        <div className={`${styles.title_box} flex h-full items-center `}>
                          <span className={`${styles.title} text-[12px]`}>売上価格</span>
                          {!searchMode && isEditModeField !== "total_price" && (
                            <span
                              className={`${styles.value} ${styles.editable_field}`}
                              onClick={handleSingleClickField}
                              onDoubleClick={(e) => {
                                if (!checkNotFalsyExcludeZero(selectedRowDataQuotation?.total_price)) return;
                                // if (isNotActivityTypeArray.includes(selectedRowDataQuotation.total_price))
                                //   return alert(returnMessageNotActivity(selectedRowDataQuotation.total_price));
                                handleDoubleClickField({
                                  e,
                                  field: "total_price",
                                  dispatch: setInputTotalPriceForFieldEdit,
                                });
                                if (hoveredItemPosWrap) handleCloseTooltip();
                              }}
                              data-text={`${
                                selectedRowDataQuotation?.total_price ? selectedRowDataQuotation?.total_price : ""
                              }`}
                              onMouseEnter={(e) => {
                                e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                                // if (!isDesktopGTE1600) handleOpenTooltip(e);
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                                // if (!isDesktopGTE1600 || hoveredItemPosWrap) handleCloseTooltip();
                              }}
                            >
                              {checkNotFalsyExcludeZero(selectedRowDataQuotation?.total_price)
                                ? Number(selectedRowDataQuotation?.total_price).toLocaleString() + "円"
                                : ""}
                            </span>
                          )}
                          {/* ============= フィールドエディットモード関連 ============= */}
                          {/* フィールドエディットモード selectタグ  */}
                          {!searchMode && isEditModeField === "total_price" && (
                            <>
                              <input
                                type="text"
                                autoFocus
                                // placeholder="例：600万円 → 6000000　※半角で入力"
                                className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                                onCompositionStart={() => setIsComposing(true)}
                                onCompositionEnd={() => setIsComposing(false)}
                                value={
                                  checkNotFalsyExcludeZero(inputTotalPriceForFieldEdit)
                                    ? inputTotalPriceForFieldEdit
                                    : ""
                                }
                                onChange={(e) => {
                                  if (e.target.value === "0" || e.target.value === "０") {
                                    setInputTotalPriceForFieldEdit("0");
                                  }
                                  setInputTotalPriceForFieldEdit(e.target.value);
                                }}
                                // onBlur={() => {
                                //   setInputTotalPriceForFieldEdit(
                                //     !!inputTotalPriceForFieldEdit &&
                                //       inputTotalPriceForFieldEdit !== "" &&
                                //       convertToYen(inputTotalPriceForFieldEdit.trim()) !== null
                                //       ? (convertToYen(inputTotalPriceForFieldEdit.trim()) as number).toLocaleString()
                                //       : ""
                                //   );
                                // }}
                                onKeyDown={(e) => {
                                  handleKeyDownUpdateField({
                                    e,
                                    fieldName: "total_price",
                                    fieldNameForSelectedRowData: "total_price",
                                    originalValue: originalValueFieldEdit.current,
                                    newValue: !!inputTotalPriceForFieldEdit
                                      ? (convertToYen(inputTotalPriceForFieldEdit.trim()) as number).toString()
                                      : null,
                                    id: selectedRowDataQuotation?.quotation_id,
                                    required: false,
                                  });
                                }}
                              />
                              {/* 送信ボタンとクローズボタン */}
                              {!updateQuotationFieldMutation.isLoading && (
                                <InputSendAndCloseBtn<string>
                                  inputState={inputTotalPriceForFieldEdit}
                                  setInputState={setInputTotalPriceForFieldEdit}
                                  onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                                    handleClickSendUpdateField({
                                      e,
                                      fieldName: "total_price",
                                      fieldNameForSelectedRowData: "total_price",
                                      originalValue: originalValueFieldEdit.current,
                                      newValue: inputTotalPriceForFieldEdit
                                        ? (convertToYen(inputTotalPriceForFieldEdit.trim()) as number).toString()
                                        : null,
                                      id: selectedRowDataQuotation?.quotation_id,
                                      required: false,
                                    })
                                  }
                                  required={false}
                                  isDisplayClose={false}
                                />
                              )}

                              {/* エディットフィールド送信中ローディングスピナー */}
                              {updateQuotationFieldMutation.isLoading && (
                                <div
                                  className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                                >
                                  <SpinnerComet w="22px" h="22px" s="3px" />
                                </div>
                              )}
                            </>
                          )}
                          {/* フィールドエディットモードオーバーレイ */}
                          {!searchMode && isEditModeField === "total_price" && (
                            <div
                              className={`${styles.edit_mode_overlay}`}
                              onClick={(e) => {
                                e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
                                setIsEditModeField(null); // エディットモードを終了
                              }}
                            />
                          )}
                          {/* ============= フィールドエディットモード関連ここまで ============= */}
                        </div>
                        <div className={`${styles.underline}`}></div>
                      </div>
                      {/* 値引タイトル */}
                      <div className="flex h-full w-1/2 flex-col pr-[20px]">
                        <div className={`${styles.title_box} flex h-full items-center`}>
                          <span className={`${styles.title} text-[12px]`}>値引ﾀｲﾄﾙ</span>
                          {!searchMode && isEditModeField !== "discount_title" && (
                            <span
                              className={`${styles.value} ${styles.editable_field}`}
                              data-text={
                                selectedRowDataQuotation?.discount_title ? selectedRowDataQuotation?.discount_title : ""
                              }
                              onMouseEnter={(e) => handleOpenTooltip({ e, display: "top" })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={handleSingleClickField}
                              onDoubleClick={(e) => {
                                // if (!selectedRowDataQuotation?.activity_type) return;
                                // if (isNotActivityTypeArray.includes(selectedRowDataQuotation.activity_type)) {
                                //   return alert(returnMessageNotActivity(selectedRowDataQuotation.activity_type));
                                // }
                                handleDoubleClickField({
                                  e,
                                  field: "discount_title",
                                  dispatch: setInputDiscountTitleForFieldEdit,
                                  selectedRowDataValue: selectedRowDataQuotation?.discount_title ?? "",
                                });
                                handleCloseTooltip();
                              }}
                            >
                              {selectedRowDataQuotation?.discount_title ? selectedRowDataQuotation?.discount_title : ""}
                            </span>
                          )}
                          {/* ============= フィールドエディットモード関連 ============= */}
                          {/* フィールドエディットモード selectタグ  */}
                          {!searchMode && isEditModeField === "discount_title" && (
                            <>
                              <input
                                type="text"
                                placeholder=""
                                autoFocus
                                className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                                value={inputDiscountTitleForFieldEdit}
                                onChange={(e) => setInputDiscountTitleForFieldEdit(e.target.value)}
                                onCompositionStart={() => setIsComposing(true)}
                                onCompositionEnd={() => setIsComposing(false)}
                                onKeyDown={(e) =>
                                  handleKeyDownUpdateField({
                                    e,
                                    fieldName: "discount_title",
                                    fieldNameForSelectedRowData: "discount_title",
                                    originalValue: originalValueFieldEdit.current,
                                    newValue: inputDiscountTitleForFieldEdit.trim(),
                                    id: selectedRowDataQuotation?.quotation_id,
                                    required: true,
                                  })
                                }
                              />
                              {/* 送信ボタンとクローズボタン */}
                              {!updateQuotationFieldMutation.isLoading && (
                                <InputSendAndCloseBtn
                                  inputState={inputDiscountTitleForFieldEdit}
                                  setInputState={setInputDiscountTitleForFieldEdit}
                                  onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                                    handleClickSendUpdateField({
                                      e,
                                      fieldName: "discount_title",
                                      fieldNameForSelectedRowData: "discount_title",
                                      originalValue: originalValueFieldEdit.current,
                                      newValue: inputDiscountTitleForFieldEdit.trim(),
                                      id: selectedRowDataQuotation?.quotation_id,
                                      required: true,
                                    })
                                  }
                                  required={true}
                                  isDisplayClose={false}
                                />
                              )}
                              {/* エディットフィールド送信中ローディングスピナー */}
                              {updateQuotationFieldMutation.isLoading && (
                                <div className={`${styles.field_edit_mode_loading_area}`}>
                                  <SpinnerComet w="22px" h="22px" s="3px" />
                                </div>
                              )}
                            </>
                          )}
                          {/* フィールドエディットモードオーバーレイ */}
                          {!searchMode && isEditModeField === "discount_title" && (
                            <div
                              className={`${styles.edit_mode_overlay}`}
                              onClick={(e) => {
                                e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
                                setIsEditModeField(null); // エディットモードを終了
                              }}
                            />
                          )}
                          {/* ============= フィールドエディットモード関連ここまで ============= */}
                        </div>
                        <div className={`${styles.underline}`}></div>
                      </div>
                    </div>
                    {/*  */}

                    {/* 値引価格・値引率 */}
                    <div className={`${styles.row_area} flex w-full items-center`}>
                      <div className="flex h-full w-1/2 flex-col pr-[20px]">
                        <div className={`${styles.title_box} flex h-full items-center `}>
                          <span className={`${styles.title} text-[12px]`}>値引価格</span>
                          {!searchMode && isEditModeField !== "discount_amount" && (
                            <span
                              className={`${styles.value} ${styles.editable_field}`}
                              onClick={handleSingleClickField}
                              onDoubleClick={(e) => {
                                if (!checkNotFalsyExcludeZero(selectedRowDataQuotation?.discount_amount)) return;
                                // if (isNotActivityTypeArray.includes(selectedRowDataQuotation.discount_amount))
                                //   return alert(returnMessageNotActivity(selectedRowDataQuotation.discount_amount));
                                handleDoubleClickField({
                                  e,
                                  field: "discount_amount",
                                  dispatch: setInputDiscountAmountForFieldEdit,
                                });
                                if (hoveredItemPosWrap) handleCloseTooltip();
                              }}
                              data-text={`${
                                selectedRowDataQuotation?.discount_amount
                                  ? selectedRowDataQuotation?.discount_amount
                                  : ""
                              }`}
                              onMouseEnter={(e) => {
                                e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                                // if (!isDesktopGTE1600) handleOpenTooltip(e);
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                                // if (!isDesktopGTE1600 || hoveredItemPosWrap) handleCloseTooltip();
                              }}
                            >
                              {checkNotFalsyExcludeZero(selectedRowDataQuotation?.discount_amount)
                                ? Number(selectedRowDataQuotation?.discount_amount).toLocaleString() + "円"
                                : ""}
                            </span>
                          )}
                          {/* ============= フィールドエディットモード関連 ============= */}
                          {/* フィールドエディットモード selectタグ  */}
                          {!searchMode && isEditModeField === "discount_amount" && (
                            <>
                              <input
                                type="text"
                                autoFocus
                                // placeholder="例：600万円 → 6000000　※半角で入力"
                                className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                                onCompositionStart={() => setIsComposing(true)}
                                onCompositionEnd={() => setIsComposing(false)}
                                value={
                                  checkNotFalsyExcludeZero(inputDiscountAmountForFieldEdit)
                                    ? inputDiscountAmountForFieldEdit
                                    : ""
                                }
                                onChange={(e) => setInputDiscountAmountForFieldEdit(e.target.value)}
                                // onBlur={() => {
                                //   setInputDiscountAmountForFieldEdit(
                                //     !!inputDiscountAmountForFieldEdit &&
                                //       inputDiscountAmountForFieldEdit !== "" &&
                                //       convertToYen(inputDiscountAmountForFieldEdit.trim()) !== null
                                //       ? (convertToYen(inputDiscountAmountForFieldEdit.trim()) as number).toLocaleString()
                                //       : ""
                                //   );
                                // }}
                                onKeyDown={(e) => {
                                  handleKeyDownUpdateField({
                                    e,
                                    fieldName: "discount_amount",
                                    fieldNameForSelectedRowData: "discount_amount",
                                    originalValue: originalValueFieldEdit.current,
                                    newValue: !!inputDiscountAmountForFieldEdit
                                      ? (convertToYen(inputDiscountAmountForFieldEdit.trim()) as number).toString()
                                      : null,
                                    id: selectedRowDataQuotation?.quotation_id,
                                    required: false,
                                  });
                                }}
                              />
                              {/* 送信ボタンとクローズボタン */}
                              {!updateQuotationFieldMutation.isLoading && (
                                <InputSendAndCloseBtn<string>
                                  inputState={inputDiscountAmountForFieldEdit}
                                  setInputState={setInputDiscountAmountForFieldEdit}
                                  onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                                    handleClickSendUpdateField({
                                      e,
                                      fieldName: "discount_amount",
                                      fieldNameForSelectedRowData: "discount_amount",
                                      originalValue: originalValueFieldEdit.current,
                                      newValue: inputDiscountAmountForFieldEdit
                                        ? (convertToYen(inputDiscountAmountForFieldEdit.trim()) as number).toString()
                                        : null,
                                      id: selectedRowDataQuotation?.quotation_id,
                                      required: false,
                                    })
                                  }
                                  required={false}
                                  isDisplayClose={false}
                                />
                              )}

                              {/* エディットフィールド送信中ローディングスピナー */}
                              {updateQuotationFieldMutation.isLoading && (
                                <div
                                  className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                                >
                                  <SpinnerComet w="22px" h="22px" s="3px" />
                                </div>
                              )}
                            </>
                          )}
                          {/* フィールドエディットモードオーバーレイ */}
                          {!searchMode && isEditModeField === "discount_amount" && (
                            <div
                              className={`${styles.edit_mode_overlay}`}
                              onClick={(e) => {
                                e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
                                setIsEditModeField(null); // エディットモードを終了
                              }}
                            />
                          )}
                          {/* ============= フィールドエディットモード関連ここまで ============= */}
                        </div>
                        <div className={`${styles.underline}`}></div>
                      </div>
                      <div className="flex h-full w-1/2 flex-col pr-[20px]">
                        <div className={`${styles.title_box} flex h-full items-center`}>
                          <span className={`${styles.title} text-[12px]`}>値引率</span>
                          {!searchMode && (
                            <span
                              className={`${styles.value}`}
                              onMouseEnter={(e) => {
                                e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                              }}
                            >
                              {checkNotFalsyExcludeZero(selectedRowDataQuotation?.discount_rate)
                                ? normalizeDiscountRate(selectedRowDataQuotation!.discount_rate!.toString())
                                : ""}
                            </span>
                          )}
                        </div>
                        <div className={`${styles.underline}`}></div>
                      </div>
                    </div>
                    {/*  */}

                    {/* 見積タイトル */}
                    <div className={`${styles.row_area} flex w-full items-center`}>
                      <div className="flex h-full w-full flex-col pr-[20px]">
                        <div className={`${styles.title_box} flex h-full items-center `}>
                          <span className={`${styles.title}`}>見積ﾀｲﾄﾙ</span>
                          {!searchMode && isEditModeField !== "quotation_title" && (
                            <span
                              className={`${styles.value} ${styles.editable_field}`}
                              data-text={
                                selectedRowDataQuotation?.quotation_title
                                  ? selectedRowDataQuotation?.quotation_title
                                  : ""
                              }
                              onMouseEnter={(e) => handleOpenTooltip({ e, display: "top" })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={handleSingleClickField}
                              onDoubleClick={(e) => {
                                // if (!selectedRowDataQuotation?.activity_type) return;
                                // if (isNotActivityTypeArray.includes(selectedRowDataQuotation.activity_type)) {
                                //   return alert(returnMessageNotActivity(selectedRowDataQuotation.activity_type));
                                // }
                                handleDoubleClickField({
                                  e,
                                  field: "quotation_title",
                                  dispatch: setInputQuotationTitle,
                                  selectedRowDataValue: selectedRowDataQuotation?.quotation_title ?? "",
                                });
                                handleCloseTooltip();
                              }}
                            >
                              {selectedRowDataQuotation?.quotation_title
                                ? selectedRowDataQuotation?.quotation_title
                                : ""}
                            </span>
                          )}
                          {/* ============= フィールドエディットモード関連 ============= */}
                          {/* フィールドエディットモード selectタグ  */}
                          {!searchMode && isEditModeField === "quotation_title" && (
                            <>
                              <input
                                type="text"
                                placeholder=""
                                autoFocus
                                className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                                value={inputQuotationTitle}
                                onChange={(e) => setInputQuotationTitle(e.target.value)}
                                onCompositionStart={() => setIsComposing(true)}
                                onCompositionEnd={() => setIsComposing(false)}
                                onKeyDown={(e) =>
                                  handleKeyDownUpdateField({
                                    e,
                                    fieldName: "quotation_title",
                                    fieldNameForSelectedRowData: "quotation_title",
                                    originalValue: originalValueFieldEdit.current,
                                    newValue: inputQuotationTitle.trim(),
                                    id: selectedRowDataQuotation?.quotation_id,
                                    required: true,
                                  })
                                }
                              />
                              {/* 送信ボタンとクローズボタン */}
                              {!updateQuotationFieldMutation.isLoading && (
                                <InputSendAndCloseBtn
                                  inputState={inputQuotationTitle}
                                  setInputState={setInputQuotationTitle}
                                  onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                                    handleClickSendUpdateField({
                                      e,
                                      fieldName: "quotation_title",
                                      fieldNameForSelectedRowData: "quotation_title",
                                      originalValue: originalValueFieldEdit.current,
                                      newValue: inputQuotationTitle.trim(),
                                      id: selectedRowDataQuotation?.quotation_id,
                                      required: true,
                                    })
                                  }
                                  required={true}
                                  isDisplayClose={false}
                                />
                              )}
                              {/* エディットフィールド送信中ローディングスピナー */}
                              {updateQuotationFieldMutation.isLoading && (
                                <div className={`${styles.field_edit_mode_loading_area}`}>
                                  <SpinnerComet w="22px" h="22px" s="3px" />
                                </div>
                              )}
                            </>
                          )}
                          {/* フィールドエディットモードオーバーレイ */}
                          {!searchMode && isEditModeField === "quotation_title" && (
                            <div
                              className={`${styles.edit_mode_overlay}`}
                              onClick={(e) => {
                                e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
                                setIsEditModeField(null); // エディットモードを終了
                              }}
                            />
                          )}
                          {/* ============= フィールドエディットモード関連ここまで ============= */}
                        </div>
                        <div className={`${styles.underline}`}></div>
                      </div>
                    </div>
                    {/*  */}
                  </div>
                </div>
              )}
              {/* ---------------- ✅通常モード 真ん中コンテナここまで✅ ---------------- */}

              {/* ---------------- 🌟通常モード 右コンテナ🌟 ---------------- */}
              {!searchMode && (
                <div
                  className={`${styles.left_container} ${
                    isOpenSidebar ? `transition-base02` : `transition-base01`
                  } h-full min-w-[calc((100vw-var(--sidebar-width))/3-11px)] max-w-[calc((100vw-var(--sidebar-width))/3-11px)] pb-[0px] pt-[0px]`}
                >
                  {/* <div
                className={`${styles.left_container} ${
                  isOpenSidebar ? `transition-base02` : `transition-base01`
                } h-full min-w-[calc((100vw-var(--sidebar-width))/3-11px)] max-w-[calc((100vw-var(--sidebar-width))/3-11px)] pb-[35px] pt-[0px]`}
              > */}
                  {/* --------- ラッパー --------- */}
                  <div className={`${styles.left_contents_wrapper} flex h-full w-full flex-col`}>
                    {/* 🌟新規作成 保存ボタンエリア🌟 */}
                    {/* {isInsertModeQuotation && (
                    <div
                      className={`sticky top-0 z-[10] flex max-h-[76px] min-h-[76px] w-full items-center rounded-bl-[6px] border-b border-l border-solid border-[var(--color-bg-brand-f)] bg-[var(--color-bg-base30)] px-[25px] py-[10px] backdrop-blur-xl`}
                      // className={`sticky top-0 z-[10] min-h-[76px] w-full rounded-bl-[6px] border-b border-l border-solid border-[var(--color-bg-brand-f)] bg-[var(--color-bg-brand-f10)] backdrop-blur-xl`}
                    >
                      <div className={`flex w-full items-center text-[18px] font-bold`}>
                        <h3>見積作成</h3>
                      </div>
                      <div
                        className={`mt-[10px] flex ${
                          isOpenSidebar ? "min-h-[34px]" : `min-h-[24px]`
                        } w-full items-center justify-between space-x-[15px]`}
                      >
                        <div
                          className={`transition-base02 flex-center ${
                            isOpenSidebar ? "max-h-[34px] text-[14px]" : `max-h-[33px] text-[14px]`
                          } w-[100%] min-w-[120px] cursor-pointer rounded-[8px] bg-[var(--color-bg-sub-light)] px-[15px] py-[15px] text-[var(--color-text-title)] hover:bg-[var(--setting-side-bg-select-hover)]`}
                          onClick={() => {
                            setIsInsertModeQuotation(false);
                            // setSearchMode(false);
                            // // 編集モード中止
                            // if (editSearchMode) setEditSearchMode(false);
                          }}
                        >
                          戻る
                        </div>
                        <button
                          type="submit"
                          className={`${styles.btn} transition-base02 min-w-[120px] ${
                            isOpenSidebar ? "min-h-[30px] text-[14px]" : `min-h-[24px] text-[14px]`
                          }`}
                        >
                          保存
                        </button>
                      </div>
                    </div>
                  )} */}
                    {/* 🌟新規作成 保存ボタンエリア🌟 */}
                    {/* 見積ルール */}
                    <div className={`${styles.row_area} flex w-full items-center`}>
                      <div className="flex h-full w-full flex-col pr-[20px]">
                        <div className={`${styles.title_box} flex h-full items-center `}>
                          <span className={`${styles.title}`}>見積ルール</span>
                          {!searchMode && (
                            <div className="flex items-center space-x-[9px]">
                              <span
                                className={`${styles.value} ${styles.text_start}`}
                                onMouseEnter={(e) => {
                                  e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                                }}
                              >
                                {selectedRowDataQuotation?.quotation_rule
                                  ? selectedRowDataQuotation?.quotation_rule
                                  : ""}
                              </span>
                              {/* 見積ルールが存在しないなら編集マークを表示 */}
                              {!!selectedRowDataQuotation && !selectedRowDataQuotation?.quotation_rule && (
                                <div
                                  className={`relative !ml-[4px] h-[22px] w-[22px] ${styles.editable_icon}`}
                                  data-text={`表示されている各データをダブルクリックすることで個別に編集可能です。`}
                                  data-text2={`編集できるのは自社で作成した自社専用データのみです。`}
                                  onMouseEnter={(e) => {
                                    handleOpenTooltip({ e, display: "top" });
                                  }}
                                  onMouseLeave={handleCloseTooltip}
                                >
                                  {/* <MdOutlineEdit
                            className={`pointer-events-none min-h-[20px] min-w-[20px] text-[20px] text-[var(--color-text-sub-light)]`}
                          /> */}
                                  <CiEdit
                                    className={`pointer-events-none min-h-[22px] min-w-[22px] text-[22px] text-[var(--color-text-sub)]`}
                                  />
                                </div>
                              )}
                            </div>
                          )}
                          {searchMode && (
                            <input
                              type="text"
                              // placeholder="株式会社○○"
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
                    {/*  */}

                    {/* 商品All */}
                    <div className={`${styles.row_area} flex w-full items-center`}>
                      <div className="flex h-full w-full flex-col pr-[20px]">
                        <div className={`${styles.title_box} flex h-full items-center `}>
                          <span className={`${styles.title}`}>商品All</span>
                          {!searchMode && (
                            <span
                              className={`${styles.value}`}
                              onMouseEnter={(e) => {
                                e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                              }}
                            >
                              {/* {selectedRowDataMeeting?.result_presentation_product5
                            ? selectedRowDataMeeting?.result_presentation_product5
                            : ""} */}
                              {selectedRowDataQuotation &&
                                getProductNamesAll(selectedRowDataQuotation.quotation_products_details)}
                            </span>
                          )}
                        </div>
                        <div className={`${styles.underline}`}></div>
                      </div>
                    </div>
                    {/*  */}

                    {/* 事業部名 */}
                    <div className={`${styles.row_area} flex w-full items-center`}>
                      <div className="flex h-full w-1/2 flex-col pr-[20px]">
                        <div className={`${styles.title_box} flex h-full items-center `}>
                          <span className={`${styles.title}`}>事業部名</span>
                          {!searchMode && (
                            <span
                              className={`${styles.value}`}
                              onMouseEnter={(e) => {
                                e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                              }}
                            >
                              {selectedRowDataQuotation?.assigned_department_name
                                ? selectedRowDataQuotation?.assigned_department_name
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
                              onMouseEnter={(e) => {
                                e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                              }}
                            >
                              {selectedRowDataQuotation?.assigned_unit_name
                                ? selectedRowDataQuotation?.assigned_unit_name
                                : ""}
                            </span>
                          )}
                        </div>
                        <div className={`${styles.underline}`}></div>
                      </div>
                    </div>
                    {/*  */}

                    {/* 事業所・自社担当 */}
                    <div className={`${styles.row_area} flex w-full items-center`}>
                      <div className="flex h-full w-1/2 flex-col pr-[20px]">
                        <div className={`${styles.title_box} flex h-full items-center `}>
                          <span className={`${styles.title}`}>事業所</span>
                          {!searchMode && (
                            <span
                              className={`${styles.value}`}
                              onMouseEnter={(e) => {
                                e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                              }}
                            >
                              {selectedRowDataQuotation?.assigned_department_name
                                ? selectedRowDataQuotation?.assigned_department_name
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
                              className={`${styles.value}`}
                              onMouseEnter={(e) => {
                                e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                              }}
                            >
                              {selectedRowDataQuotation?.quotation_member_name
                                ? selectedRowDataQuotation?.quotation_member_name
                                : ""}
                            </span>
                          )}
                          {/* {searchMode && <input type="text" className={`${styles.input_box}`} />} */}
                        </div>
                        <div className={`${styles.underline}`}></div>
                      </div>
                    </div>
                    {/*  */}

                    {/* 担当印 */}
                    <div className={`${styles.row_area} flex w-full items-center`}>
                      <div className="flex h-full w-1/2 flex-col pr-[20px]">
                        <div className={`${styles.title_box} flex h-full items-center `}>
                          <span className={`${styles.title}`}>担当印</span>
                          {!searchMode && (
                            <span
                              className={`${styles.value}`}
                              onMouseEnter={(e) => {
                                e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                              }}
                            >
                              {selectedRowDataQuotation?.in_charge_user_name
                                ? selectedRowDataQuotation?.in_charge_user_name
                                : ""}
                            </span>
                          )}
                          {searchMode && <input type="text" className={`${styles.input_box}`} />}
                        </div>
                        <div className={`${styles.underline}`}></div>
                      </div>
                      <div className="flex h-full w-1/2 flex-col pr-[20px]">
                        <div className={`${styles.title_box} flex h-full items-center`}>
                          <span className={`${styles.check_title} ${styles.single_text}`}>印字</span>
                          {/* <div className={`${styles.check_title} flex flex-col ${styles.double_text}`}>
                      <span>見積</span>
                      <span>印字ﾌﾗｸﾞ</span>
                    </div> */}

                          <div
                            className={`${styles.grid_select_cell_header} `}
                            onMouseEnter={(e) => {
                              if (!selectedRowDataQuotation) return;
                              e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            }}
                            onMouseLeave={(e) => {
                              if (!selectedRowDataQuotation) return;
                              e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            }}
                          >
                            <input
                              type="checkbox"
                              // checked={!!selectedRowDataQuotation?.in_charge_stamp_flag}
                              // onChange={() => {
                              //   setLoadingGlobalState(false);
                              //   setIsOpenUpdateQuotationModal(true);
                              // }}
                              className={`${styles.grid_select_cell_header_input} ${
                                !selectedRowDataQuotation ? `pointer-events-none cursor-not-allowed` : ``
                              }`}
                              checked={checkboxInChargeFlagForFieldEdit}
                              onChange={async (e) => {
                                if (!selectedRowDataQuotation) return;
                                // 個別にチェックボックスを更新するルート
                                if (!selectedRowDataQuotation?.quotation_id)
                                  return toast.error(`データが見つかりませんでした🙇‍♀️`);

                                console.log(
                                  "チェック 新しい値",
                                  !checkboxInChargeFlagForFieldEdit,
                                  "オリジナル",
                                  selectedRowDataQuotation?.in_charge_stamp_flag
                                );
                                if (
                                  !checkboxInChargeFlagForFieldEdit === selectedRowDataQuotation?.in_charge_stamp_flag
                                ) {
                                  toast.error(`アップデートに失敗しました🤦‍♀️`);
                                  return;
                                }
                                const updatePayload = {
                                  fieldName: "in_charge_stamp_flag",
                                  fieldNameForSelectedRowData: "in_charge_stamp_flag" as "in_charge_stamp_flag",
                                  newValue: !checkboxInChargeFlagForFieldEdit,
                                  id: selectedRowDataQuotation.quotation_id,
                                };
                                // 直感的にするためにmutateにして非同期処理のまま後続のローカルのチェックボックスを更新する
                                updateQuotationFieldMutation.mutate(updatePayload);
                                setCheckboxInChargeFlagForFieldEdit(!checkboxInChargeFlagForFieldEdit);
                              }}
                            />
                            <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                            </svg>
                          </div>
                        </div>
                        <div className={`${styles.underline}`}></div>
                      </div>
                    </div>
                    {/*  */}

                    {/* 上長印1 */}
                    <div className={`${styles.row_area} flex w-full items-center`}>
                      <div className="flex h-full w-1/2 flex-col pr-[20px]">
                        <div className={`${styles.title_box} flex h-full items-center `}>
                          <span className={`${styles.title}`}>上長印1</span>
                          {!searchMode && (
                            <span
                              className={`${styles.value}`}
                              onMouseEnter={(e) => {
                                e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                              }}
                            >
                              {selectedRowDataQuotation?.supervisor1_user_name
                                ? selectedRowDataQuotation?.supervisor1_user_name
                                : ""}
                            </span>
                          )}
                          {searchMode && <input type="text" className={`${styles.input_box}`} />}
                        </div>
                        <div className={`${styles.underline}`}></div>
                      </div>
                      <div className="flex h-full w-1/2 flex-col pr-[20px]">
                        <div className={`${styles.title_box} flex h-full items-center`}>
                          <span className={`${styles.check_title} ${styles.single_text}`}>印字</span>
                          {/* <div className={`${styles.check_title} flex flex-col ${styles.double_text}`}>
                      <span>見積</span>
                      <span>印字ﾌﾗｸﾞ</span>
                    </div> */}

                          <div
                            className={`${styles.grid_select_cell_header} `}
                            onMouseEnter={(e) => {
                              if (!selectedRowDataQuotation) return;
                              e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            }}
                            onMouseLeave={(e) => {
                              if (!selectedRowDataQuotation) return;
                              e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            }}
                          >
                            <input
                              type="checkbox"
                              // checked={!!selectedRowDataQuotation?.supervisor1_stamp_flag}
                              // onChange={() => {
                              //   setLoadingGlobalState(false);
                              //   setIsOpenUpdateQuotationModal(true);
                              // }}
                              className={`${styles.grid_select_cell_header_input} ${
                                !selectedRowDataQuotation ? `pointer-events-none cursor-not-allowed` : ``
                              }`}
                              checked={checkboxSupervisor1FlagForFieldEdit}
                              onChange={async (e) => {
                                if (!selectedRowDataQuotation) return;
                                // 個別にチェックボックスを更新するルート
                                if (!selectedRowDataQuotation?.quotation_id)
                                  return toast.error(`データが見つかりませんでした🙇‍♀️`);

                                console.log(
                                  "チェック 新しい値",
                                  !checkboxSupervisor1FlagForFieldEdit,
                                  "オリジナル",
                                  selectedRowDataQuotation?.supervisor1_stamp_flag
                                );
                                if (
                                  !checkboxSupervisor1FlagForFieldEdit ===
                                  selectedRowDataQuotation?.supervisor1_stamp_flag
                                ) {
                                  toast.error(`アップデートに失敗しました🤦‍♀️`);
                                  return;
                                }
                                const updatePayload = {
                                  fieldName: "supervisor1_stamp_flag",
                                  fieldNameForSelectedRowData: "supervisor1_stamp_flag" as "supervisor1_stamp_flag",
                                  newValue: !checkboxSupervisor1FlagForFieldEdit,
                                  id: selectedRowDataQuotation.quotation_id,
                                };
                                // 直感的にするためにmutateにして非同期処理のまま後続のローカルのチェックボックスを更新する
                                updateQuotationFieldMutation.mutate(updatePayload);
                                setCheckboxSupervisor1FlagForFieldEdit(!checkboxSupervisor1FlagForFieldEdit);
                              }}
                            />
                            <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                            </svg>
                          </div>
                        </div>
                        <div className={`${styles.underline}`}></div>
                      </div>
                    </div>
                    {/*  */}

                    {/* 上長印2 */}
                    <div className={`${styles.row_area} flex w-full items-center`}>
                      <div className="flex h-full w-1/2 flex-col pr-[20px]">
                        <div className={`${styles.title_box} flex h-full items-center `}>
                          <span className={`${styles.title}`}>上長印2</span>
                          {!searchMode && (
                            <span
                              className={`${styles.value}`}
                              onMouseEnter={(e) => {
                                e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                              }}
                            >
                              {selectedRowDataQuotation?.supervisor2_user_name
                                ? selectedRowDataQuotation?.supervisor2_user_name
                                : ""}
                            </span>
                          )}
                          {searchMode && <input type="text" className={`${styles.input_box}`} />}
                        </div>
                        <div className={`${styles.underline}`}></div>
                      </div>
                      <div className="flex h-full w-1/2 flex-col pr-[20px]">
                        <div className={`${styles.title_box} flex h-full items-center`}>
                          <span className={`${styles.check_title} ${styles.single_text}`}>印字</span>
                          {/* <div className={`${styles.check_title} flex flex-col ${styles.double_text}`}>
                      <span>見積</span>
                      <span>印字ﾌﾗｸﾞ</span>
                    </div> */}

                          <div
                            className={`${styles.grid_select_cell_header} `}
                            onMouseEnter={(e) => {
                              if (!selectedRowDataQuotation) return;
                              e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            }}
                            onMouseLeave={(e) => {
                              if (!selectedRowDataQuotation) return;
                              e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            }}
                          >
                            <input
                              type="checkbox"
                              // checked={!!selectedRowDataQuotation?.supervisor1_stamp_flag}
                              // onChange={() => {
                              //   setLoadingGlobalState(false);
                              //   setIsOpenUpdateQuotationModal(true);
                              // }}
                              className={`${styles.grid_select_cell_header_input} ${
                                !selectedRowDataQuotation ? `pointer-events-none cursor-not-allowed` : ``
                              }`}
                              checked={checkboxSupervisor2FlagForFieldEdit}
                              onChange={async (e) => {
                                if (!selectedRowDataQuotation) return;
                                // 個別にチェックボックスを更新するルート
                                if (!selectedRowDataQuotation?.quotation_id)
                                  return toast.error(`データが見つかりませんでした🙇‍♀️`);

                                console.log(
                                  "チェック 新しい値",
                                  !checkboxSupervisor2FlagForFieldEdit,
                                  "オリジナル",
                                  selectedRowDataQuotation?.supervisor1_stamp_flag
                                );
                                if (
                                  !checkboxSupervisor2FlagForFieldEdit ===
                                  selectedRowDataQuotation?.supervisor1_stamp_flag
                                ) {
                                  toast.error(`アップデートに失敗しました🤦‍♀️`);
                                  return;
                                }
                                const updatePayload = {
                                  fieldName: "supervisor1_stamp_flag",
                                  fieldNameForSelectedRowData: "supervisor1_stamp_flag" as "supervisor1_stamp_flag",
                                  newValue: !checkboxSupervisor2FlagForFieldEdit,
                                  id: selectedRowDataQuotation.quotation_id,
                                };
                                // 直感的にするためにmutateにして非同期処理のまま後続のローカルのチェックボックスを更新する
                                updateQuotationFieldMutation.mutate(updatePayload);
                                setCheckboxSupervisor2FlagForFieldEdit(!checkboxSupervisor2FlagForFieldEdit);
                              }}
                            />
                            <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                            </svg>
                          </div>
                        </div>
                        <div className={`${styles.underline}`}></div>
                      </div>
                    </div>
                    {/*  */}

                    {/* 特記備考 */}
                    <div className={`${styles.row_area_lg_box} flex w-full items-center`}>
                      <div className="flex h-full w-full flex-col pr-[20px]">
                        <div className={`${styles.title_box} flex h-full `}>
                          {/* <span className={`${styles.title} ${styles.title_sm}`}>特記備考</span> */}
                          <div className={`${styles.check_title} flex flex-col ${styles.double_text}`}>
                            <span>特記事項</span>
                            <span>(社内ﾒﾓ)</span>
                          </div>
                          {!searchMode && isEditModeField !== "quotation_remarks" && (
                            <div
                              className={`${styles.textarea_box} ${styles.md} ${
                                selectedRowDataQuotation ? `${styles.editable_field}` : `${styles.uneditable_field}`
                              }`}
                              onClick={handleSingleClickField}
                              onDoubleClick={(e) => {
                                if (!selectedRowDataQuotation) return;
                                // if (isNotActivityTypeArray.includes(selectedRowDataQuotation.activity_type))
                                //   return alert(returnMessageNotActivity(selectedRowDataQuotation.activity_type));
                                handleCloseTooltip();
                                handleDoubleClickField({
                                  e,
                                  field: "quotation_remarks",
                                  dispatch: setInputQuotationRemarks,
                                  selectedRowDataValue: selectedRowDataQuotation?.quotation_remarks
                                    ? selectedRowDataQuotation?.quotation_remarks
                                    : null,
                                });
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                              }}
                              dangerouslySetInnerHTML={{
                                __html: selectedRowDataQuotation?.quotation_remarks
                                  ? selectedRowDataQuotation?.quotation_remarks.replace(/\n/g, "<br>")
                                  : "",
                              }}
                            ></div>
                          )}
                          {/* ============= フィールドエディットモード関連 ============= */}
                          {/* フィールドエディットモード inputタグ */}
                          {!searchMode && isEditModeField === "quotation_remarks" && (
                            <>
                              <textarea
                                cols={30}
                                // rows={10}
                                placeholder=""
                                style={{ whiteSpace: "pre-wrap" }}
                                className={`${styles.textarea_box} ${styles.textarea_box_search_mode} ${styles.field_edit_mode_textarea} ${styles.xl}`}
                                value={inputQuotationRemarks}
                                onChange={(e) => setInputQuotationRemarks(e.target.value)}
                              ></textarea>
                              {/* 送信ボタンとクローズボタン */}
                              <InputSendAndCloseBtn
                                inputState={inputQuotationRemarks}
                                setInputState={setInputQuotationRemarks}
                                onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                                  handleClickSendUpdateField({
                                    e,
                                    fieldName: "quotation_remarks",
                                    fieldNameForSelectedRowData: "quotation_remarks",
                                    originalValue: originalValueFieldEdit.current,
                                    newValue: inputQuotationNotes ? inputQuotationNotes.trim() : null,
                                    id: selectedRowDataQuotation?.quotation_id,
                                    required: false,
                                  })
                                }
                                required={false}
                                // isDisplayClose={true}
                                // btnPositionY="bottom-[8px]"
                                isOutside={true}
                                outsidePosition="under_right"
                                isLoadingSendEvent={updateQuotationFieldMutation.isLoading}
                              />
                            </>
                          )}
                          {/* フィールドエディットモードオーバーレイ */}
                          {!searchMode && isEditModeField === "quotation_remarks" && (
                            <div
                              className={`${styles.edit_mode_overlay}`}
                              onClick={(e) => {
                                e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
                                setIsEditModeField(null); // エディットモードを終了
                              }}
                            />
                          )}
                          {/* ============= フィールドエディットモード関連ここまで ============= */}
                        </div>
                        <div className={`${styles.underline}`}></div>
                      </div>
                    </div>
                    {/*  */}

                    {/* 商品追加ボタンエリア */}
                    {/* <div className={`${styles.row_area} flex w-full items-center`}>
                    <div className="flex h-full w-full flex-col pr-[20px]">
                      <div className={`${styles.title_box} flex h-full items-center`}>
                        <span className={`${styles.section_title} mr-[20px]`}>見積商品</span>
                        <RippleButton
                          title={`追加`}
                          classText="select-none"
                          clickEventHandler={() => {
                            // const newResetColumnHeaderItemList = JSON.parse(JSON.stringify(columnHeaderItemList));
                            // console.log(
                            //   "🔥🔥🔥モーダル開いた ZustandのリセットStateにパースして格納newResetColumnHeaderItemList",
                            //   newResetColumnHeaderItemList
                            // );
                            // setResetColumnHeaderItemList(newResetColumnHeaderItemList);
                            // setIsOpenEditColumns(true);
                          }}
                          onMouseEnterHandler={(e) =>
                            handleOpenTooltip({
                              e: e,
                              display: "top",
                              content: `見積に商品を追加`,
                              // content2: `直近売れ先の仕入れ先や、売れ先と同じ取引先を持つ同業他社で導入実績が響く会社など`,
                              // marginTop: 48,
                              // marginTop: 28,
                              marginTop: 9,
                            })
                          }
                          onMouseLeaveHandler={handleCloseTooltip}
                        />
                      </div>

                      <div className={`${styles.section_underline}`}></div>
                    </div>
                  </div> */}
                    {/*  */}
                  </div>
                </div>
              )}
              {/* ---------------- ✅通常モード 右コンテナここまで✅ ---------------- */}
            </div>
            {/* ---------------- ✅通常モード 上コンテナ 真ん中と右コンテナここまで✅ ---------------- */}
            {/* ---------------- 🌟通常モード 下コンテナ 真ん中と右コンテナ🌟 ---------------- */}
            <div className="mt-[10px] flex h-full w-full flex-col">
              {/* 商品追加ボタンエリア */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.section_title} mr-[20px]`}>見積商品</span>
                    <RippleButton
                      title={`追加`}
                      classText="select-none"
                      borderRadius="6px"
                      clickEventHandler={() => {
                        // const newResetColumnHeaderItemList = JSON.parse(JSON.stringify(columnHeaderItemList));
                        // console.log(
                        //   "🔥🔥🔥モーダル開いた ZustandのリセットStateにパースして格納newResetColumnHeaderItemList",
                        //   newResetColumnHeaderItemList
                        // );
                        // setResetColumnHeaderItemList(newResetColumnHeaderItemList);
                        // setIsOpenEditColumns(true);
                      }}
                      onMouseEnterHandler={(e) =>
                        handleOpenTooltip({
                          e: e,
                          display: "top",
                          content: `見積に商品を追加`,
                          // content2: `直近売れ先の仕入れ先や、売れ先と同じ取引先を持つ同業他社で導入実績が響く会社など`,
                          // marginTop: 48,
                          // marginTop: 28,
                          marginTop: 9,
                        })
                      }
                      onMouseLeaveHandler={handleCloseTooltip}
                    />
                  </div>

                  {/* <div className={`${styles.underline}`}></div> */}
                  <div className={`${styles.section_underline}`}></div>
                </div>
              </div>
              {/*  */}

              {/* 商品エリア */}
              {/* {selectedRowDataQuotation &&
              selectedRowDataQuotation.quotation_products_details &&
              selectedRowDataQuotation.quotation_products_details.length > 0 && (
                <div className={`mt-[10px]`}>
                  <ProductListTable productsArray={selectedRowDataQuotation.quotation_products_details} />
                </div>
              )} */}
              <div className={`mt-[15px]`}>
                <ProductListTable
                  productsArray={
                    selectedRowDataQuotation && selectedRowDataQuotation.quotation_products_details?.length > 0
                      ? selectedRowDataQuotation.quotation_products_details
                      : []
                  }
                />
              </div>
              {/* 商品エリアここまで */}
            </div>
            {/* ---------------- ✅通常モード 下コンテナ 真ん中と右コンテナここまで✅ ---------------- */}
          </div>
          {/* ---------------- ✅通常モード 上下コンテナ 真ん中と右コンテナここまで✅ ---------------- */}

          {/* ---------------- 🌟サーチモード 左コンテナ🌟 input時はstickyにしてnullやis nullなどのボタンや説明を配置 ---------------- */}
          {searchMode && (
            <div
              // className={`${styles.left_container} h-full min-w-[calc((100vw-var(--sidebar-width))/3)] pb-[35px] pt-[10px]`}
              className={`${styles.left_container} h-full min-w-[calc(50vw-var(--sidebar-mini-width))] max-w-[calc(50vw-var(--sidebar-mini-width))] pb-[35px] pt-[0px]`}
            >
              {/* --------- ラッパー --------- */}
              <div className={`${styles.left_contents_wrapper} flex h-full w-full flex-col`}></div>
            </div>
          )}
          {/* ---------------- ✅サーチモード 左コンテナここまで✅ ---------------- */}
          {/* ---------------- 🌟サーチモード 右コンテナ🌟 input時はstickyにしてnullやis nullなどのボタンや説明を配置 ---------------- */}
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
          {/* ---------------- ✅サーチモード 右コンテナ✅ ---------------- */}
        </div>
      </div>
    </form>
  );
};

export const QuotationMainContainerOneThird = memo(QuotationMainContainerOneThirdMemo);
