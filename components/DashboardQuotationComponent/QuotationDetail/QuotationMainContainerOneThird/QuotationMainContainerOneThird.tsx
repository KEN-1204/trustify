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
  Destination,
  QuotationProducts,
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
import { convertHalfWidthRoundNumOnly } from "@/utils/Helpers/convertHalfWidthRoundNumOnly";
import { CustomSelectInput } from "@/components/Parts/CustomSelectInput/CustomSelectInput";
import {
  getQuotationDivision,
  getSalesTaxClass,
  getSendingMethod,
  getSubmissionClass,
  optionsDeadline,
  optionsDeliveryPlace,
  optionsPaymentTerms,
  optionsQuotationDivision,
  optionsSalesTaxClass,
  optionsSalesTaxRate,
  optionsSendingMethod,
  optionsSubmissionClass,
  optionsTimeZoneEn,
  optionsTimeZoneJa,
  timezoneList,
} from "@/utils/selectOptions";
import { ConfirmationModal } from "@/components/DashboardCompanyComponent/Modal/SettingAccountModal/SettingCompany/ConfirmationModal/ConfirmationModal";
import { toHalfWidthAndSpace } from "@/utils/Helpers/toHalfWidthAndSpace";
import { FallbackSideTableSearchMember } from "@/components/DashboardCompanyComponent/Modal/UpdateMeetingModal/SideTableSearchMember/FallbackSideTableSearchMember";
import { SideTableSearchMember } from "@/components/DashboardCompanyComponent/Modal/UpdateMeetingModal/SideTableSearchMember/SideTableSearchMember";
import { GrPowerReset } from "react-icons/gr";
import { SideTableSearchProduct } from "@/components/DashboardCompanyComponent/Modal/UpdateMeetingModal/SideTableSearchProduct/SideTableSearchProduct";
import { FallbackSideTableSearchProduct } from "@/components/DashboardCompanyComponent/Modal/UpdateMeetingModal/SideTableSearchProduct/FallbackSideTableSearchProduct";
import { calculateTotalPriceProducts } from "@/utils/Helpers/calculateTotalPriceProducts";
import { calculateTotalAmount } from "@/utils/Helpers/calculateTotalAmount";
import { formatToJapaneseYen } from "@/utils/Helpers/formatToJapaneseYen";
import { InputSendAndCloseBtnGlobal } from "@/components/DashboardCompanyComponent/CompanyMainContainer/InputSendAndCloseBtnGlobal/InputSendAndCloseBtnGlobal";
import { calculateDiscountRate } from "@/utils/Helpers/calculateDiscountRate";
import { ImInfo } from "react-icons/im";
import { SideTableSearchContact } from "@/components/DashboardCompanyComponent/Modal/UpdateMeetingModal/SideTableSearchContact/SideTableSearchContact";
import { FallbackSideTableSearchContact } from "@/components/DashboardCompanyComponent/Modal/UpdateMeetingModal/SideTableSearchContact/FallbackSideTableSearchContact";
import { calculateLeaseMonthlyFee } from "@/utils/Helpers/calculateLeaseMonthlyFee";
import { isValidNumber } from "@/utils/Helpers/isValidNumber";

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
  const setIsLoadingUpsertGlobal = useDashboardStore((state) => state.setIsLoadingUpsertGlobal);
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
  // 確認モーダル(自社担当名、データ所有者変更確認)
  const [isOpenConfirmationModal, setIsOpenConfirmationModal] = useState<string | null>(null);
  // 自社担当検索サイドテーブル開閉
  const [isOpenSearchMemberSideTableBefore, setIsOpenSearchMemberSideTableBefore] = useState(false);
  const [isOpenSearchMemberSideTable, setIsOpenSearchMemberSideTable] = useState(false);
  // 商品検索サイドテーブル開閉
  const [isOpenSearchProductSideTableBefore, setIsOpenSearchProductSideTableBefore] = useState(false);
  const [isOpenSearchProductSideTable, setIsOpenSearchProductSideTable] = useState(false);
  // 商品検索サイドテーブル開閉
  const [isOpenSearchDestinationSideTableBefore, setIsOpenSearchDestinationSideTableBefore] = useState(false);
  const [isOpenSearchDestinationSideTable, setIsOpenSearchDestinationSideTable] = useState(false);

  // 選択中の商品データ
  const selectedRowDataQuotationProduct = useDashboardStore((state) => state.selectedRowDataQuotationProduct);
  const setSelectedRowDataQuotationProduct = useDashboardStore((state) => state.setSelectedRowDataQuotationProduct);
  // 商品リストのセルのポジション
  const editPosition = useDashboardStore((state) => state.editPosition);
  const isEditingCell = useDashboardStore((state) => state.isEditingCell);
  const setIsEditingCell = useDashboardStore((state) => state.setIsEditingCell);
  // 値引金額説明アイコン 既読ならクラスを外す
  const infoIconDiscountRef = useRef<HTMLDivElement | null>(null);
  const infoIconTotalPriceRef = useRef<HTMLDivElement | null>(null);
  const infoIconDiscountRateRef = useRef<HTMLDivElement | null>(null);
  const infoIconQuotationNoRef = useRef<HTMLDivElement | null>(null);
  const infoIconQuotationProductList = useRef<HTMLDivElement | null>(null);

  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();

  const { createQuotationMutation, updateQuotationFieldMutation } = useMutateQuotation();

  // メディアクエリState デスクトップモニター
  const isDesktopGTE1600Media = useMedia("(min-width: 1600px)", false);
  const [isDesktopGTE1600, setIsDesktopGTE1600] = useState(isDesktopGTE1600Media);
  useEffect(() => {
    setIsDesktopGTE1600(isDesktopGTE1600Media);
  }, [isDesktopGTE1600Media]);

  // 🌟サブミット
  // 🔹client_companiesテーブル
  const [inputCompanyId, setInputCompanyId] = useState("");
  const [inputCompanyName, setInputCompanyName] = useState("");
  const [inputDepartmentName, setInputDepartmentName] = useState("");
  const [inputTel, setInputTel] = useState("");
  const [inputFax, setInputFax] = useState("");
  const [inputZipcode, setInputZipcode] = useState("");
  const [inputAddress, setInputAddress] = useState("");
  // 🔹contactsテーブル
  const [inputContactId, setInputContactId] = useState("");
  const [inputContactName, setInputContactName] = useState("");
  const [inputDirectLine, setInputDirectLine] = useState("");
  const [inputDirectFax, setInputDirectFax] = useState("");
  const [inputExtension, setInputExtension] = useState("");
  const [inputCompanyCellPhone, setInputCompanyCellPhone] = useState("");
  const [inputContactEmail, setInputContactEmail] = useState("");
  // 🔹送付先cc_destinationテーブル
  const [inputCompanyIdDest, setInputCompanyIdDest] = useState("");
  const [inputCompanyNameDest, setInputCompanyNameDest] = useState("");
  const [inputDepartmentNameDest, setInputDepartmentNameDest] = useState("");
  const [inputZipcodeDest, setInputZipcodeDest] = useState("");
  const [inputAddressDest, setInputAddressDest] = useState("");
  // 🔹送付先c_destinationテーブル
  const [inputContactIdDest, setInputContactIdDest] = useState("");
  const [inputContactNameDest, setInputContactNameDest] = useState("");
  const [inputDirectLineDest, setInputDirectLineDest] = useState("");
  const [inputDirectFaxDest, setInputDirectFaxDest] = useState("");
  const [inputContactEmailDest, setInputContactEmailDest] = useState("");
  // 🔹送付先 UPSERT用
  const initialDestinationObj = {
    // 送付先会社
    destination_company_id: null,
    destination_company_name: null,
    destination_company_department_name: null,
    destination_company_zipcode: null,
    destination_company_address: null,
    // 送付先担当者
    destination_contact_id: null,
    destination_contact_name: null,
    destination_contact_direct_line: null,
    destination_contact_direct_fax: null,
    destination_contact_email: null,
  };
  const [selectedDestination, setSelectedDestination] = useState<Destination>(initialDestinationObj);
  // 送付先ここまで
  // const [inputPositionName, setInputPositionName] = useState("");
  // const [inputPositionClass, setInputPositionClass] = useState("");
  // サーチ用
  const [inputContactCreatedByCompanyId, setInputContactCreatedByCompanyId] = useState("");
  const [inputContactCreatedByUserId, setInputContactCreatedByUserId] = useState("");
  // 🔹Quotationテーブル
  const [inputQuotationCreatedByCompanyId, setInputQuotationCreatedByCompanyId] = useState("");
  const [inputQuotationCreatedByUserId, setInputQuotationCreatedByUserId] = useState("");
  const [inputQuotationCreatedByDepartmentOfUser, setInputQuotationCreatedByDepartmentOfUser] = useState("");
  const [inputQuotationCreatedByUnitOfUser, setInputQuotationCreatedByUnitOfUser] = useState("");
  const [inputQuotationCreatedByOfficeOfUser, setInputQuotationCreatedByOfficeOfUser] = useState("");

  // =========営業担当データ
  type MemberDetail = {
    memberId: string | null;
    memberName: string | null;
    departmentId: string | null;
    unitId: string | null;
    officeId: string | null;
  };
  // 作成したユーザーのidと名前が初期値
  const initialMemberObj = {
    memberId: userProfileState?.id ? userProfileState?.id : null,
    memberName: userProfileState?.profile_name ? userProfileState?.profile_name : null,
    departmentId: userProfileState?.assigned_department_id ? userProfileState?.assigned_department_id : null,
    unitId: userProfileState?.assigned_unit_id ? userProfileState?.assigned_unit_id : null,
    officeId: userProfileState?.assigned_office_id ? userProfileState?.assigned_office_id : null,
  };
  const [prevMemberObj, setPrevMemberObj] = useState<MemberDetail>(initialMemberObj);
  const [memberObj, setMemberObj] = useState<MemberDetail>(initialMemberObj);
  // =========営業担当データここまで
  const [inputQuotationDate, setInputQuotationDate] = useState<Date | null>(null);
  const [inputExpirationDate, setInputExpirationDate] = useState<Date | null>(null);
  const [inputQuotationNotes, setInputQuotationNotes] = useState("");
  const [inputQuotationRemarks, setInputQuotationRemarks] = useState("");
  // サーチ用
  // const [inputQuotationNoCustomSearch, setInputQuotationNoCustomSearch] = useState("");
  // const [inputQuotationNoSystemSearch, setInputQuotationNoSystemSearch] = useState("");
  // upsert編集用
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
  // const [inputQuotationDateEdit, setInputQuotationDateEdit] = useState<Date | null>(null);
  // const [inputExpirationDateEdit, setInputExpirationDateEdit] = useState<Date | null>(null);
  // 依頼元フィールドエディット
  const [inputClientCompanyIdEdit, setInputClientCompanyIdEdit] = useState(null);
  const [inputContactIdEdit, setInputContactIdEdit] = useState(null);
  // 送付先フィールドエディット
  const [inputCompanyIdDestEdit, setInputCompanyIdDestEdit] = useState(null);
  const [inputContactIdDestEdit, setInputContactIdDestEdit] = useState(null);
  // 見積関連フィールドエディット
  // const [inputQuotationNoCustomEdit, setInputQuotationNoCustomEdit] = useState("");
  // const [inputQuotationNoSystemEdit, setInputQuotationNoSystemEdit] = useState("");
  const [inputSubmissionClassEdit, setInputSubmissionClassEdit] = useState("");
  const [inputDeadlineEdit, setInputDeadlineEdit] = useState("");
  const [inputDeliveryPlaceEdit, setInputDeliveryPlaceEdit] = useState("");
  const [inputPaymentTermsEdit, setInputPaymentTermsEdit] = useState("");
  const [inputQuotationDivisionEdit, setInputQuotationDivisionEdit] = useState("standard");
  const [inputSendingMethodEdit, setInputSendingMethodEdit] = useState("");
  const [inputUseCorporateSealEdit, setInputUseCorporateSealEdit] = useState(false);
  const [inputSalesTaxClassEdit, setInputSalesTaxClassEdit] = useState("");
  const [inputSalesTaxRateEdit, setInputSalesTaxRateEdit] = useState("10");
  // const [inputTotalPriceEdit, setInputTotalPriceEdit] = useState("");
  // const [inputDiscountAmountEdit, setInputDiscountAmountEdit] = useState("");
  // const [inputDiscountRateEdit, setInputDiscountRateEdit] = useState("");
  // const [inputTotalAmountEdit, setInputTotalAmountEdit] = useState("");
  // 見積価格関連 価格合計・値引金額・値引率・合計金額の4つの計算が必要なグローバルstate
  const inputTotalPriceEdit = useDashboardStore((state) => state.inputTotalPriceEdit);
  const setInputTotalPriceEdit = useDashboardStore((state) => state.setInputTotalPriceEdit);
  const inputDiscountAmountEdit = useDashboardStore((state) => state.inputDiscountAmountEdit);
  const setInputDiscountAmountEdit = useDashboardStore((state) => state.setInputDiscountAmountEdit);
  const inputDiscountRateEdit = useDashboardStore((state) => state.inputDiscountRateEdit);
  const setInputDiscountRateEdit = useDashboardStore((state) => state.setInputDiscountRateEdit);
  const inputTotalAmountEdit = useDashboardStore((state) => state.inputTotalAmountEdit);
  const setInputTotalAmountEdit = useDashboardStore((state) => state.setInputTotalAmountEdit);
  // 見積価格関連ここまで
  const [inputDiscountTitleEdit, setInputDiscountTitleEdit] = useState("出精値引");
  const [inputSetItemCountEdit, setInputSetItemCountEdit] = useState<number | null>(null);
  // const [inputSetItemCountEdit, setInputSetItemCountEdit] = useState<string>("");
  const [inputSetUnitNameEdit, setInputSetUnitNameEdit] = useState(language === "ja" ? "式" : "Set");
  const [inputSetPriceEdit, setInputSetPriceEdit] = useState("");
  const [inputLeasePeriodEdit, setInputLeasePeriodEdit] = useState<number | null>(null);
  // const [inputLeaseRateEdit, setInputLeaseRateEdit] = useState<number | null>(null);
  // const [inputLeasePeriodEdit, setInputLeasePeriodEdit] = useState<string>("");
  const [inputLeaseRateEdit, setInputLeaseRateEdit] = useState<string>("");
  const [inputLeaseMonthlyFeeEdit, setInputLeaseMonthlyFeeEdit] = useState("");

  //  印鑑フィールドエディット
  // const [inputInChargeStampIdEdit, setInputInChargeStampIdEdit] = useState("");
  // const [inputInChargeNameIdEdit, setInputInChargeNameIdEdit] = useState("");
  // const [inputSupervisor1StampIdEdit, setInputSupervisor1StampIdEdit] = useState("");
  // const [inputSupervisor1NameIdEdit, setInputSupervisor1NameIdEdit] = useState("");
  // const [inputSupervisor2StampIdEdit, setInputSupervisor2StampIdEdit] = useState("");
  // const [inputSupervisor2NameIdEdit, setInputSupervisor2NameIdEdit] = useState("");
  type MemberWithStamp = {
    memberId: string | null;
    memberName: string | null;
    departmentId: string | null;
    unitId: string | null;
    officeId: string | null;
    signature_stamp_id?: string | null | undefined;
    signature_stamp_url?: string | null | undefined;
  };
  // 担当印
  const initialMemberNullObj = {
    memberId: null,
    memberName: null,
    departmentId: null,
    unitId: null,
    officeId: null,
    signature_stamp_id: null,
    signature_stamp_url: null,
  };
  const [prevMemberObjInCharge, setPrevMemberObjInCharge] = useState<MemberWithStamp>(initialMemberNullObj);
  const [memberObjInCharge, setMemberObjInCharge] = useState<MemberWithStamp>(initialMemberNullObj);
  const [prevMemberObjSupervisor1, setPrevMemberObjSupervisor1] = useState<MemberWithStamp>(initialMemberNullObj);
  const [memberObjSupervisor1, setMemberObjSupervisor1] = useState<MemberWithStamp>(initialMemberNullObj);
  const [prevMemberObjSupervisor2, setPrevMemberObjSupervisor2] = useState<MemberWithStamp>(initialMemberNullObj);
  const [memberObjSupervisor2, setMemberObjSupervisor2] = useState<MemberWithStamp>(initialMemberNullObj);

  // 見積に追加された商品リスト
  const [selectedProductsArray, setSelectedProductsArray] = useState<QuotationProductsDetail[]>([]);

  // 担当印、上長印の削除、変更メニュー開閉
  const [isOpenInChargeMenu, setIsOpenInChargeMenu] = useState(false);
  const [isOpenSupervisor1Menu, setIsOpenSupervisor1Menu] = useState(false);
  const [isOpenSupervisor2Menu, setIsOpenSupervisor2Menu] = useState(false);

  // 担当者検索サイドテーブルに渡すオブジェクトを切り替える関数
  const [sideTableState, setSideTableState] = useState("author");
  const getMemberObj = (title: string) => {
    switch (title) {
      case "author":
        return {
          memberObj: memberObj,
          setMemberObj: setMemberObj,
          prevMemberObj: prevMemberObj,
          setPrevMemberObj: setPrevMemberObj,
        };
        break;
      case "inCharge":
        return {
          memberObj: memberObjInCharge,
          setMemberObj: setMemberObjInCharge,
          prevMemberObj: prevMemberObjInCharge,
          setPrevMemberObj: setPrevMemberObjInCharge,
        };
        break;
      case "supervisor1":
        return {
          memberObj: memberObjSupervisor1,
          setMemberObj: setMemberObjSupervisor1,
          prevMemberObj: prevMemberObjSupervisor1,
          setPrevMemberObj: setPrevMemberObjSupervisor1,
        };
        break;
      case "supervisor2":
        return {
          memberObj: memberObjSupervisor2,
          setMemberObj: setMemberObjSupervisor2,
          prevMemberObj: prevMemberObjSupervisor2,
          setPrevMemberObj: setPrevMemberObjSupervisor2,
        };
        break;

      default:
        return {
          memberObj: memberObj,
          setMemberObj: setMemberObj,
          prevMemberObj: prevMemberObj,
          setPrevMemberObj: setPrevMemberObj,
        };
        break;
    }
  };

  // フラグ関連 フィールドエディット用 初期はfalseにしておき、useEffectでselectedRowDataのフラグを反映する
  // 角印印刷フラグ、担当印、上長印１、上長印２ フィールドエディット用
  const [checkboxUseCorporateSealFlag, setCheckboxUseCorporateSealFlag] = useState(false);
  const [checkboxInChargeFlag, setCheckboxInChargeFlag] = useState(false);
  const [checkboxSupervisor1Flag, setCheckboxSupervisor1Flag] = useState(false);
  const [checkboxSupervisor2Flag, setCheckboxSupervisor2Flag] = useState(false);
  // Insert用フラグ
  const [checkboxUseCorporateSealFlagEdit, setCheckboxUseCorporateSealFlagEdit] = useState(false);
  const [checkboxInChargeFlagEdit, setCheckboxInChargeFlagEdit] = useState(false);
  const [checkboxSupervisor1FlagEdit, setCheckboxSupervisor1FlagEdit] = useState(false);
  const [checkboxSupervisor2FlagEdit, setCheckboxSupervisor2FlagEdit] = useState(false);

  // フラグの初期値を更新
  // 角印印刷
  useEffect(() => {
    setCheckboxUseCorporateSealFlag(
      selectedRowDataQuotation?.use_corporate_seal ? selectedRowDataQuotation?.use_corporate_seal : false
    );
  }, [selectedRowDataQuotation?.use_corporate_seal]);
  // 担当者印
  useEffect(() => {
    setCheckboxInChargeFlag(
      selectedRowDataQuotation?.in_charge_stamp_flag ? selectedRowDataQuotation?.in_charge_stamp_flag : false
    );
  }, [selectedRowDataQuotation?.in_charge_stamp_flag]);
  // 上長印1
  useEffect(() => {
    setCheckboxSupervisor1Flag(
      selectedRowDataQuotation?.supervisor1_stamp_flag ? selectedRowDataQuotation?.supervisor1_stamp_flag : false
    );
  }, [selectedRowDataQuotation?.supervisor1_stamp_flag]);
  // 上長印2
  useEffect(() => {
    setCheckboxSupervisor2Flag(
      selectedRowDataQuotation?.supervisor2_stamp_flag ? selectedRowDataQuotation?.supervisor2_stamp_flag : false
    );
  }, [selectedRowDataQuotation?.supervisor2_stamp_flag]);

  // ================================ ✅フィールドエディットモード関連state✅ ================================

  // ------------------ 🌟INSERT見積作成のマウント時 選択中の担当者&会社の列データの情報をStateに格納🌟 ------------------
  useEffect(() => {
    if (!isInsertModeQuotation) return;

    let selectedData;

    if (selectedRowDataContact) selectedData = selectedRowDataContact;
    if (selectedRowDataActivity) selectedData = selectedRowDataActivity;
    if (selectedRowDataMeeting) selectedData = selectedRowDataMeeting;
    if (selectedRowDataProperty) selectedData = selectedRowDataProperty;

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear(); // 例: 2023
    const currentMonth = currentDate.getMonth() + 1; // getMonth()は0から11で返されるため、+1して1から12に調整
    const selectedYearMonthInitialValue = `${currentYear}${currentMonth < 10 ? "0" + currentMonth : currentMonth}`; // 月が1桁の場合は先頭に0を追加

    // 依頼元
    let _company_id = selectedData?.company_id ? selectedData?.company_id : "";
    let _contact_id = selectedData?.contact_id ? selectedData?.contact_id : "";
    let _company_name = selectedData?.company_name ? selectedData?.company_name : "";
    // let _department_name = selectedData?.department_name ? selectedData?.department_name : "";
    let _department_name = selectedData?.company_department_name ? selectedData?.company_department_name : "";
    let _contact_name = selectedData?.contact_name ? selectedData?.contact_name : "";
    let _direct_line = selectedData?.direct_line ? selectedData?.direct_line : "";
    let _main_phone_number = selectedData?.main_phone_number ? selectedData?.main_phone_number : "";
    let _extension = selectedData?.extension ? selectedData?.extension : "";
    let _company_cell_phone = selectedData?.company_cell_phone ? selectedData?.company_cell_phone : "";
    let _direct_fax = selectedData?.direct_fax ? selectedData?.direct_fax : "";
    let _main_fax = selectedData?.main_fax ? selectedData?.main_fax : "";
    let _contact_email = selectedData?.contact_email ? selectedData?.contact_email : "";
    let _zipcode = selectedData?.zipcode ? selectedData?.zipcode : "";
    let _address = selectedData?.address ? selectedData?.address : "";
    // 送付先
    let _dest_company_id = selectedData?.company_id ? selectedData?.company_id : "";
    let _dest_contact_id = selectedData?.contact_id ? selectedData?.contact_id : "";
    let _dest_company_name = selectedData?.company_name ? selectedData?.company_name : "";
    // let _dest_department_name = selectedData?.department_name ? selectedData?.department_name : "";
    let _dest_department_name = selectedData?.company_department_name ? selectedData?.company_department_name : "";
    let _dest_contact_name = selectedData?.contact_name ? selectedData?.contact_name : "";
    let _dest_direct_line = selectedData?.direct_line ? selectedData?.direct_line : "";
    let _dest_direct_fax = selectedData?.direct_fax ? selectedData?.direct_fax : "";
    let _dest_contact_email = selectedData?.contact_email ? selectedData?.contact_email : "";
    let _dest_zipcode = selectedData?.zipcode ? selectedData?.zipcode : "";
    let _dest_address = selectedData?.address ? selectedData?.address : "";
    // 見積関連
    let _quotation_no_custom = "";
    let _quotation_no_system = "";
    let _submission_class = "A submission";
    let _quotation_date = new Date();
    let _expiration_date = null;
    let _deadline = "当日出荷";
    let _delivery_place = "お打ち合わせにより決定";
    let _payment_terms = "従来通り";
    let _quotation_division = "A standard";
    // let _sending_method = "送付状なし";
    let _sending_method = "With Cover Letter";
    let _use_corporate_seal = false;
    let _quotation_notes = "";
    let _sales_tax_class = "A With Tax Notation";
    let _sales_tax_rate = "10";
    let _total_price = "";
    let _discount_amount = "";
    let _discount_rate = "";
    let _discount_title = "出精値引";
    let _total_amount = "";
    let _quotation_remarks = "";
    // let _set_item_count = "";
    let _set_item_count = null;
    let _set_unit_name = "式";
    let _set_price = "";
    // let _lease_period = "";
    let _lease_period = null;
    let _lease_rate = "";
    let _lease_monthly_fee = "";

    let _initialMemberObj = {
      memberId: userProfileState?.id ? userProfileState?.id : null,
      memberName: userProfileState?.profile_name ? userProfileState?.profile_name : null,
      departmentId: userProfileState?.assigned_department_id ? userProfileState?.assigned_department_id : null,
      unitId: userProfileState?.assigned_unit_id ? userProfileState?.assigned_unit_id : null,
      officeId: userProfileState?.assigned_office_id ? userProfileState?.assigned_office_id : null,
    };

    setInputCompanyId(_company_id);
    setInputContactId(_contact_id);
    setInputCompanyName(_company_name);
    setInputDepartmentName(_department_name);
    setInputContactName(_contact_name);
    setInputDirectLine(_direct_line);
    setInputTel(_main_phone_number);
    setInputExtension(_extension);
    setInputCompanyCellPhone(_company_cell_phone);
    setInputDirectFax(_direct_fax);
    setInputFax(_main_fax);
    setInputContactEmail(_contact_email);
    setInputZipcode(_zipcode);
    setInputAddress(_address);
    // 送付先
    // setInputCompanyIdDest(_dest_company_id);
    // setInputContactIdDest(_dest_contact_id);
    // setInputCompanyNameDest(_dest_company_name);
    // setInputDepartmentNameDest(_dest_department_name);
    // setInputContactNameDest(_dest_contact_name);
    // setInputDirectLineDest(_dest_direct_line);
    // setInputDirectFaxDest(_dest_direct_fax);
    // setInputContactEmailDest(_dest_contact_email);
    // setInputZipcodeDest(_dest_zipcode);
    // setInputAddressDest(_dest_address);
    setSelectedDestination({
      destination_company_id: _dest_company_id,
      destination_contact_id: _dest_contact_id,
      destination_company_name: _dest_company_name,
      destination_company_department_name: _dest_department_name,
      destination_contact_name: _dest_contact_name,
      destination_contact_direct_line: _dest_direct_line,
      destination_contact_direct_fax: _dest_direct_fax,
      destination_contact_email: _dest_contact_email,
      destination_company_zipcode: _dest_zipcode,
      destination_company_address: _dest_address,
    });
    // 見積関連
    setInputQuotationNoCustom(_quotation_no_custom);
    setInputQuotationNoSystem(_quotation_no_system);
    setInputSubmissionClassEdit(_submission_class);
    setInputQuotationDate(_quotation_date);
    setInputExpirationDate(_expiration_date);
    setInputDeadlineEdit(_deadline);
    setInputDeliveryPlaceEdit(_delivery_place);
    setInputPaymentTermsEdit(_payment_terms);
    setInputQuotationDivisionEdit(_quotation_division);
    setInputSendingMethodEdit(_sending_method);
    setInputUseCorporateSealEdit(_use_corporate_seal);
    setInputQuotationNotes(_quotation_notes);
    setInputSalesTaxClassEdit(_sales_tax_class);
    setInputSalesTaxRateEdit(_sales_tax_rate);
    setInputTotalPriceEdit(_total_price);
    setInputDiscountAmountEdit(_discount_amount);
    setInputDiscountRateEdit(_discount_rate);
    setInputTotalAmountEdit(_total_amount);
    setInputDiscountTitleEdit(_discount_title);
    setInputQuotationRemarks(_quotation_remarks);
    setInputSetItemCountEdit(_set_item_count);
    setInputSetUnitNameEdit(_set_unit_name);
    setInputSetPriceEdit(_set_price);
    setInputLeasePeriodEdit(_lease_period);
    setInputLeaseRateEdit(_lease_rate);
    setInputLeaseMonthlyFeeEdit(_lease_monthly_fee);

    // 作成者
    setPrevMemberObj(_initialMemberObj);
    setMemberObj(_initialMemberObj);
  }, [isInsertModeQuotation]);
  // ------------------ ✅見積作成のマウント時に選択中の担当者&会社の列データの情報をStateに格納✅ ------------------

  // ================================ 🌟useQuery依頼元・送付先の会社、担当者フェッチ🌟 ================================

  // ================================ ✅useQuery依頼元・送付先の会社、担当者フェッチ✅ ================================

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
  // }, [unitDataArray, memberObj.departmentId]);
  // ======================= ✅現在の選択した事業部でチームを絞り込むuseEffect✅ =======================

  // ----------------------- 🌟見積Noカスタム/自動をローカルストレージから取得🌟 -----------------------
  // カスタム/オート
  const [useQuotationNoCustom, setUseQuotationNoCustom] = useState(
    localStorage.getItem("use_quotation_no_custom") === "true" ? true : false
  );
  // ユーザーのタイムゾーン
  const [userTimeZone, setUserTimeZone] = useState(
    localStorage.getItem("timezone")
      ? localStorage.getItem("timezone")
      : Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  useEffect(() => {
    // 見積Noのカスタム/オート
    let _useQuotationNoCustom = false;
    const result = localStorage.getItem("use_quotation_no_custom");
    // まだセットされていない場合は初期値にfalse(自動採番)をセット
    if (!result) {
      localStorage.setItem("use_quotation_no_custom", JSON.stringify(false));
    } else {
      _useQuotationNoCustom = JSON.parse(result);
    }
    // stateに格納
    setUseQuotationNoCustom(_useQuotationNoCustom);

    // ユーザーのローカルタイムゾーン
    const resultTimezone = localStorage.getItem("timezone");
    // まだセットされていない場合
    if (!resultTimezone) {
      // タイムゾーンは既に文字列形式なので、直接 localStorage.setItem に渡すことができる
      localStorage.setItem("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);
    }
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

  // ----------------------- 🌟新規サーチ・サーチ編集🌟 -----------------------
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
      // ----------------------------- 依頼元
      // 🔹client_companyテーブル
      setInputCompanyName(beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams["client_companies.name"]));
      setInputDepartmentName(
        beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams["client_companies.department_name"])
      );
      setInputContactName(beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams["contacts.name"]));
      setInputTel(beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams?.main_phone_number));
      setInputFax(beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams?.main_fax));
      setInputZipcode(beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams["client_companies.zipcode"]));
      setInputAddress(beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams["client_companies.address"]));
      // 🔹contactsテーブル
      setInputContactName(beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams["contacts.name"]));
      setInputDirectLine(beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams["contacts.direct_line"]));
      setInputDirectFax(beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams["contacts.direct_fax"]));
      setInputExtension(beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams.extension));
      setInputCompanyCellPhone(beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams.company_cell_phone));
      setInputContactEmail(beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams["contacts.email"]));

      // ----------------------------- 送付先
      // 🔹cc_destinationテーブル
      setInputCompanyNameDest(beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams["cc_destination.name"]));
      setInputDepartmentNameDest(
        beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams["cc_destination.department_name"])
      );
      setInputContactNameDest(beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams["contacts.name"]));
      setInputZipcodeDest(beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams["cc_destination.zipcode"]));
      setInputAddressDest(beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams["cc_destination.address"]));
      // 🔹c_destinationテーブル
      setInputContactNameDest(beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams["c_destination.name"]));
      setInputDirectLineDest(
        beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams["c_destination.direct_line"])
      );
      setInputDirectFaxDest(
        beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams["c_destination.direct_fax"])
      );
      setInputContactEmailDest(beforeAdjustFieldValue(newSearchQuotation_Contact_CompanyParams["c_destination.email"]));
      // c_destinationここまで

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
      // client_companiesテーブル
      if (!!inputCompanyName) setInputCompanyName("");
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
      if (!!inputContactCreatedByCompanyId) setInputContactCreatedByCompanyId("");
      if (!!inputContactCreatedByUserId) setInputContactCreatedByUserId("");

      // c_destinationテーブル
      if (!!inputCompanyNameDest) setInputCompanyNameDest("");
      if (!!inputDepartmentNameDest) setInputDepartmentNameDest("");
      if (!!inputZipcodeDest) setInputZipcodeDest("");
      if (!!inputAddressDest) setInputAddressDest("");

      // c_destinationテーブル
      if (!!inputContactNameDest) setInputContactNameDest("");
      if (!!inputDirectLineDest) setInputDirectLineDest("");
      if (!!inputDirectFaxDest) setInputDirectFaxDest("");
      if (!!inputContactEmailDest) setInputContactEmailDest("");

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

  // ----------------------- ✅新規サーチ・サーチ編集✅ -----------------------

  // サーチ関数実行
  const handleSearchSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // upsertモードがtrueならサブミットせずにリターン
    if (isInsertModeQuotation) return console.log("サブミット INSERTモードのためリターン");
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
      // 依頼元
      // 会社
      "client_companies.name": _company_name,
      "client_companies.department_name": _department_name,
      main_phone_number: _main_phone_number,
      main_fax: _main_fax,
      "client_companies.zipcode": _zipcode,
      "client_companies.address": _address,
      // 担当者
      "contacts.name": _contact_name,
      "contacts.direct_line": _direct_line,
      "contacts.direct_fax": _direct_fax,
      extension: _extension,
      company_cell_phone: _company_cell_phone,
      "contacts.email": _contact_email,
      // 送付先
      // 会社
      "cc_destination.name": _company_name,
      "cc_destination.department_name": _department_name,
      "cc_destination.zipcode": _zipcode,
      "cc_destination.address": _address,
      // 担当者
      "c_destination.name": _contact_name,
      "c_destination.direct_line": _direct_line,
      "c_destination.direct_fax": _direct_fax,
      "c_destination.email": _contact_email,

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

    // const { data, error } = await supabase.rpc("", { params });
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
    content4?: string;
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
    content4,
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
    const dataText4 = ((e.target as HTMLDivElement).dataset.text4 as string)
      ? ((e.target as HTMLDivElement).dataset.text4 as string)
      : "";
    setHoveredItemPosWrap({
      x: x,
      y: y,
      itemWidth: width,
      itemHeight: height,
      content: ((e.target as HTMLDivElement).dataset.text as string) || (content ?? ""),
      content2: dataText2 || content2 || "",
      content3: dataText3 || content3 || "",
      content4: dataText4 || content4 || "",
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
  const handleSingleClickField = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
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
    },
    [selectedRowDataQuotation]
  );

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
        if (["set_item_count", "lease_period"].includes(field)) {
          // 数字と小数点以外は全て除去
          text = Number(e.currentTarget.innerText.replace(/[^\d.]/g, ""));
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
    [setIsEditModeField, selectedRowDataQuotation]
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
        return "";
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

  const formatDisplayPrice = (price: number | string): string => {
    switch (language) {
      case "ja":
        const priceNum = typeof price === "number" ? price : Number(price);
        return formatToJapaneseYen(priceNum, true, false);
        break;
      default:
        return typeof price === "number" ? price.toString() : price;
        break;
    }
  };

  // ---------------- 🌟useEffect 見積商品リストに商品が追加、削除された時に価格合計を再計算🌟 ----------------
  useEffect(() => {
    // 商品数が0なら、価格合計が空文字に変更
    if (selectedProductsArray.length === 0) {
      if (inputTotalPriceEdit !== "") setInputTotalPriceEdit("");
      if (inputTotalAmountEdit !== "") setInputTotalAmountEdit("");
      if (inputDiscountAmountEdit !== "") setInputDiscountAmountEdit("");
      if (inputDiscountRateEdit !== "") setInputDiscountRateEdit("");

      // 見積区分がリースの場合
      if (inputQuotationDivisionEdit === "lease") {
        if (inputLeasePeriodEdit) setInputLeasePeriodEdit(null);
        if (inputLeaseRateEdit) setInputLeaseRateEdit("");
      }
    }
    // 商品数が1個以上なら合計額を算出してstateを更新
    else if (selectedProductsArray.length > 0) {
      // 価格合計
      const newTotalPrice = calculateTotalPriceProducts(selectedProductsArray, language === "ja" ? 0 : 2);
      setInputTotalPriceEdit(newTotalPrice);
      // 合計金額 = 価格合計 - 値引金額
      // 値引価格の数字と小数点以外は除去
      const replacedDiscountAmount = inputDiscountAmountEdit.replace(/[^\d.]/g, "");
      const newTotalAmount = calculateTotalAmount(
        Number(newTotalPrice),
        Number(replacedDiscountAmount) || 0,
        language === "ja" ? 0 : 2
      );
      setInputTotalAmountEdit(newTotalAmount);
      // 商品リストが1以上で値引額がまだ未入力の場合は、値引額と値引率を0に更新
      const zeroStr = formatDisplayPrice(0);
      if (replacedDiscountAmount === "") {
        setInputDiscountAmountEdit(zeroStr);
        setInputDiscountRateEdit("0");
      }
      if (replacedDiscountAmount === "0" && inputDiscountRateEdit !== "0") {
        setInputDiscountRateEdit("0");
      }
      // 🔹値引率 合計金額と値引金額が共に0以上なら値引率を再計算
      if (Number(newTotalPrice) > 0 && Number(replacedDiscountAmount) > 0) {
        // 値引価格の数字と小数点以外は除去
        const result = calculateDiscountRate({
          salesPriceStr: newTotalPrice,
          discountPriceStr: replacedDiscountAmount.replace(/[^\d.]/g, "") || "0",
          salesQuantityStr: "1",
          showPercentSign: false,
          decimalPlace: 2,
        });
        if (result.error) {
          toast.error(`エラー：${result.error}🙇‍♀️`);
          console.error("エラー：値引率の取得に失敗", result.error);
          setInputDiscountRateEdit("");
        } else if (result.discountRate) {
          const newDiscountRate = result.discountRate;
          setInputDiscountRateEdit(newDiscountRate);
        }
      }

      // 🔹見積区分がリースの場合
      if (inputQuotationDivisionEdit === "lease") {
        // 数字と小数点以外は全て除去
        const replacedAmount = newTotalAmount.replace(/[^\d.]/g, "");
        const replacedRate = inputLeaseRateEdit.replace(/[^\d.]/g, "");
        console.log(
          "newTotalAmount",
          newTotalAmount,
          "replacedAmount",
          replacedAmount,
          "inputLeaseRateEdit",
          inputLeaseRateEdit,
          "replacedRate",
          replacedRate
        );
        if (isValidNumber(replacedAmount) && isValidNumber(replacedRate)) {
          // 🔹リース料の算出
          // 月額リース料
          const result = calculateLeaseMonthlyFee(replacedAmount, replacedRate, 0);
          console.log(
            "result.monthlyFee",
            result.monthlyFee,
            "replacedAmount",
            replacedAmount,
            "replacedRate",
            replacedRate
          );
          if (result.error || !result.monthlyFee) {
            console.error(result.error);
            toast.error(result.error);
            return;
          }
          setInputLeaseMonthlyFeeEdit(result.monthlyFee);
        }
      }
    }
  }, [selectedProductsArray.length]);
  // ---------------- ✅useEffect 見積商品リストに商品が追加、削除された時に価格合計を再計算✅ ----------------

  // ---------------- 🌟オート見積Noをデータベースから取得する関数🌟 ----------------
  const [isLoadingQuotationNo, setIsLoadingQuotationNo] = useState(false); // ローディング
  const handleGetQuotationNo = async () => {
    if (!userProfileState?.company_id) return alert("エラー：会社・チームのデータが見つかりません");

    // 既にシステム見積Noが採番されている場合はリターンさせる
    if (inputQuotationNoSystem)
      return alert(
        "既にオート見積Noは採番済みです。別の見積Noが必要な場合は、「戻る」を押して再度見積もりを作成してください。"
      );

    // ローディング開始
    setIsLoadingQuotationNo(true);

    try {
      // タイムゾーンがリスト内の値かをチェック
      const isValidTimeZone = userTimeZone && timezoneList.includes(userTimeZone);

      if (!isValidTimeZone) throw new Error("有効なタイムゾーンではありません");

      // FUNCTIONを実行
      const { data: newQuotationNo, error } = await supabase.rpc("get_next_quotation_no", {
        _customer_id_arg: userProfileState.company_id,
        _user_timezone_arg: userTimeZone,
      });

      // 0.3秒ローディング
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (error) throw error;

      setInputQuotationNoSystem(newQuotationNo);
    } catch (error: any) {
      console.error(`オート見積Noの取得に失敗しました`, error);
      toast.error(`見積Noの採番に失敗しました...🙇‍♀️`);
    }

    // ローディング終了
    setIsLoadingQuotationNo(false);
  };
  // ---------------- ✅オート見積Noをデータベースから取得する関数✅ ----------------

  // -------------------------------- 🌟保存ボタン🌟 --------------------------------
  const [isLoadingUpsert, setIsLoadingUpsert] = useState(false);
  const handleSaveInsert = async () => {
    // カスタムとオートの両方の見積Noが空文字ならリターン
    if (!inputQuotationNoCustom && !inputQuotationNoSystem)
      return alert(
        "見積Noは必須です。「見積No区分」からカスタムかオートを選択し、見積Noを設定してから保存してください。"
      );
    if (!userProfileState?.id) return alert("ユーザー情報が存在しません");
    if (!userProfileState?.company_id) return alert("ユーザー情報が存在しません");
    if (!inputCompanyId) return alert("依頼元の会社データの取得に失敗しました。");
    if (!inputContactId) return alert("依頼元の担当者データの取得に失敗しました。");
    if (!inputQuotationDate) return alert("見積日を入力してください。");
    if (!inputDeadlineEdit) return alert("納期を入力してください。");
    if (!inputPaymentTermsEdit) return alert("取引方法を入力してください。");
    if (memberObj.memberName === "") return alert("自社担当を入力してください");
    if (!memberObj.memberId) return alert("自社担当を入力してください");
    if (!inputCompanyId) return alert("依頼元の会社が無効なデータです。");
    if (!inputContactId) return alert("依頼元の担当者が無効なデータです。");

    // ローディング開始
    setIsLoadingUpsertGlobal(true);

    // 見積年月度の作成
    const quotationFiscalYearMonth = calculateDateToYearMonth(
      inputQuotationDate,
      closingDayRef.current ?? new Date(new Date().getFullYear(), 2, 31).getDate()
    );

    // 部署名
    const departmentName =
      departmentDataArray &&
      memberObj.departmentId &&
      departmentDataArray.find((obj) => obj.id === memberObj.departmentId)?.department_name;
    // 事業所名
    const officeName =
      officeDataArray &&
      memberObj.officeId &&
      officeDataArray.find((obj) => obj.id === memberObj.officeId)?.office_name;

    // 価格合計
    const replacedTotalPrice = inputTotalPriceEdit.replace(/[^\d.]/g, "");
    // 値引合計
    const replacedDiscountAmount = inputDiscountAmountEdit.replace(/[^\d.]/g, "");
    // 値引率
    const replacedDiscountRate = inputDiscountRateEdit.replace(/[^\d.]/g, "");
    // 合計金額
    const replacedTotalAmount = inputTotalAmountEdit.replace(/[^\d.]/g, "");
    // セット価格
    const replacedSetPrice = inputSetPriceEdit.replace(/[^\d.]/g, "");
    // リース料率
    const replacedLeaseRate = inputLeaseRateEdit.replace(/[^\d.]/g, "");
    // 月額リース料
    const replacedLeaseMonthlyFee = inputLeaseMonthlyFeeEdit.replace(/[^\d.]/g, "");

    // 商品リストの全てのidが有効化をチェック
    const result = selectedProductsArray.some(
      (product) =>
        product?.quotation_product_id === null ||
        product?.quotation_product_id === undefined ||
        product?.quotation_product_id === ""
    );

    if (result) return alert("エラー：無効な商品が含まれています。");

    // 見積商品リストテーブルのデータ型に合わせた配列を作成
    type QuotationProductInsertPayload = Omit<QuotationProducts, "id" | "created_at" | "updated_at">[];
    const insertProductsList: QuotationProductInsertPayload = selectedProductsArray.map((product) => {
      // if (!product.quotation_product_id) return;
      return {
        quotation_product_name: product.quotation_product_name ?? null,
        quotation_product_inside_short_name: product.quotation_inside_short_name ?? null,
        quotation_outside_short_name: product.quotation_outside_short_name ?? null,
        quotation_product_unit_price: isValidNumber(product.quotation_unit_price) ? product.quotation_unit_price : null,
        quotation_product_quantity: isValidNumber(product.quotation_product_quantity)
          ? product.quotation_product_quantity
          : null,
        priority: isValidNumber(product.quotation_product_priority) ? product.quotation_product_priority : null,
        quotation_id: null, // 見積データ作成後のidを使用
        product_id: product.quotation_product_id,
      };
    });

    try {
      // 見積テーブルと見積商品リストテーブルにINSERT
      const insertPayload = {
        //       id: string;
        // created_at: string;
        // updated_at: null,
        submission_class: inputSubmissionClassEdit || null,
        quotation_date: inputQuotationDate ? inputQuotationDate.toISOString() : null,
        expiration_date: inputExpirationDate ? inputExpirationDate.toISOString() : null,
        deadline: inputDeadlineEdit || null,
        delivery_place: inputDeliveryPlaceEdit || null,
        payment_terms: inputPaymentTermsEdit || null,
        quotation_division: inputQuotationDivisionEdit || null,
        sending_method: inputSendingMethodEdit || null,
        use_corporate_seal: inputUseCorporateSealEdit,
        quotation_notes: inputQuotationNotes || null,
        sales_tax_class: inputSalesTaxClassEdit || null,
        sales_tax_rate: inputSalesTaxRateEdit ?? null,
        total_price: isValidNumber(replacedTotalPrice) ? replacedTotalPrice : null,
        discount_amount: isValidNumber(replacedDiscountAmount) ? replacedDiscountAmount : null,
        discount_rate: isValidNumber(replacedDiscountRate) ? replacedDiscountRate : null,
        discount_title: inputDiscountTitleEdit || null,
        total_amount: isValidNumber(replacedTotalAmount) ? replacedTotalAmount : null,
        quotation_remarks: inputQuotationRemarks || null,
        set_item_count: isValidNumber(inputSetItemCountEdit) ? inputSetItemCountEdit : null,
        set_unit_name: inputSetUnitNameEdit || null,
        set_price: isValidNumber(replacedSetPrice) ? replacedSetPrice : null,
        lease_period: isValidNumber(inputLeasePeriodEdit) ? inputLeasePeriodEdit : null,
        lease_rate: isValidNumber(replacedLeaseRate) ? replacedLeaseRate : null,
        lease_monthly_fee: isValidNumber(replacedLeaseMonthlyFee) ? replacedLeaseMonthlyFee : null,
        created_by_company_id: userProfileState.company_id,
        created_by_user_id: memberObj.memberId,
        created_by_department_of_user: memberObj.departmentId || null,
        created_by_unit_of_user: memberObj.unitId || null,
        created_by_office_of_user: memberObj.officeId || null,
        client_company_id: inputCompanyId,
        client_contact_id: inputContactId,
        destination_company_id: selectedDestination.destination_company_id || null,
        destination_contact_id: selectedDestination.destination_contact_id || null,
        in_charge_stamp_id: memberObjInCharge.signature_stamp_id || null,
        in_charge_user_id: memberObjInCharge.memberId || null,
        supervisor1_stamp_id: memberObjSupervisor1.signature_stamp_id || null,
        supervisor1_user_id: memberObjSupervisor1.memberId || null,
        supervisor2_stamp_id: memberObjSupervisor2.signature_stamp_id || null,
        supervisor2_user_id: memberObjSupervisor2.memberId || null,
        quotation_no_custom: inputQuotationNoCustom ?? null,
        quotation_no_system: inputQuotationNoSystem ?? null,
        quotation_member_name: memberObj.memberName,
        quotation_business_office: officeName ?? null,
        quotation_department: departmentName ?? null,
        quotation_year_month: quotationFiscalYearMonth || null,
        quotation_title: inputQuotationTitle ?? null,
        in_charge_stamp_flag: checkboxInChargeFlagEdit,
        supervisor1_stamp_flag: checkboxSupervisor1FlagEdit,
        supervisor2_stamp_flag: checkboxSupervisor2FlagEdit,
        in_charge_stamp_name: memberObjInCharge.memberName,
        supervisor1_stamp_name: memberObjSupervisor1.memberName,
        supervisor2_stamp_name: memberObjSupervisor2.memberName,
        quotation_products_array: insertProductsList ?? [],
      };

      console.log("見積 新規作成 insertPayload", insertPayload);

      // supabaseにINSERT
      // createQuotationMutation.mutate({ newQuotation: insertPayload, isLoadingUpsert, setIsLoadingUpsert });
      createQuotationMutation.mutate(insertPayload);
    } catch (error: any) {
      console.error("見積INSERTに失敗", error);
      toast.error(`見積の作成に失敗しました...🙇‍♀️`);
    }
  };
  // -------------------------------- ✅保存ボタン✅ --------------------------------

  console.log(
    "🔥MeetingMainContainerレンダリング",
    "selectedRowDataQuotation",
    selectedRowDataQuotation,
    "newSearchQuotation_Contact_CompanyParams",
    newSearchQuotation_Contact_CompanyParams,
    "価格合計inputTotalPriceEdit",
    inputTotalPriceEdit,
    "値引金額inputDiscountAmountEdit",
    inputDiscountAmountEdit,
    "合計金額inputTotalAmountEdit",
    inputTotalAmountEdit,
    "値引率inputDiscountRateEdit",
    inputDiscountRateEdit
  );

  // const tableContainerSize = useRootStore(useDashboardStore, (state) => state.tableContainerSize);
  return (
    <>
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
                    type="button"
                    className={`${styles.upsert_btn} transition-bg02 max-h-[28px] min-h-[28px] min-w-[90px] max-w-[90px] text-[13px]`}
                    onClick={handleSaveInsert}
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
                  {/* <div
                    className={`${styles.upsert_btn} transition-bg02 max-h-[28px] min-h-[28px] min-w-[100px] max-w-[100px] text-[12px]`}
                    onMouseEnter={(e) =>
                      handleOpenTooltip({
                        e: e,
                        display: "top",
                        content: `独自に設定できるカスタム見積Noと自動で採番されるシステム見積Noの切り替えが可能です`,
                        content2: `○カスタム見積No： 会社、チーム内で独自の見積Noを管理している場合はカスタム見積Noを使用します`,
                        content3: `○自動見積No： 自動採番の見積Noは12桁の番号が自動で割り当てられ、1日に99万9999件まで採番が可能です`,
                        marginTop: 28,
                        itemsPosition: "left",
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
                  </div> */}
                  <div className="flex flex-col">
                    <div className="flex items-end space-x-[9px]">
                      <div
                        className={`flex min-h-max min-w-max items-center text-[13px] font-bold`}
                        onMouseEnter={(e) => {
                          if (
                            infoIconQuotationNoRef.current &&
                            infoIconQuotationNoRef.current.classList.contains(styles.animate_ping)
                          ) {
                            infoIconQuotationNoRef.current.classList.remove(styles.animate_ping);
                          }
                          handleOpenTooltip({
                            e: e,
                            display: "top",
                            content: `独自に設定できるカスタム見積Noと自動で採番されるオート見積Noの切り替えが可能です。`,
                            content2: `○カスタム見積No： 会社、チーム内で独自の見積Noを管理している場合はカスタム見積Noを使用します。`,
                            content3: `○オート見積No：「見積No採番」をクリックすると自動で12桁の見積Noが採番されます。`,
                            content4: `1日に99万9999件まで一意のNoを採番可能です。`,
                            marginTop: 28,
                            itemsPosition: "left",
                          });
                        }}
                        onMouseLeave={handleCloseTooltip}
                      >
                        <div className="flex-center relative h-[15px] w-[15px] rounded-full">
                          <div
                            ref={infoIconQuotationNoRef}
                            className={`flex-center absolute left-0 top-0 h-[15px] w-[15px] rounded-full border border-solid border-[var(--color-bg-brand-f)] ${styles.animate_ping}`}
                          ></div>
                          <ImInfo className={`min-h-[15px] min-w-[15px] text-[var(--color-bg-brand-f)]`} />
                        </div>
                        <span className={`ml-[6px]`}>見積No区分</span>
                      </div>
                      <select
                        className={`h-full min-w-max cursor-pointer ${styles.select_box} ${styles.upsert}`}
                        value={useQuotationNoCustom ? `custom` : `auto`}
                        onChange={(e) => {
                          const newValue = e.target.value === "custom" ? true : false;
                          setUseQuotationNoCustom(newValue);
                          localStorage.setItem("use_quotation_no_custom", JSON.stringify(newValue));
                        }}
                      >
                        <option value="custom">カスタム</option>
                        <option value="auto">オート</option>
                      </select>
                    </div>
                    <div className={`${styles.underline} mb-[-3px] mt-[3px]`}></div>
                  </div>
                  {!useQuotationNoCustom && (
                    <div
                      className={`${styles.upsert_btn} transition-bg02 max-h-[28px] min-h-[28px] min-w-[100px] max-w-[100px] text-[12px]`}
                      onClick={handleGetQuotationNo}
                    >
                      見積No採番
                    </div>
                  )}
                  {!useQuotationNoCustom && (
                    <div className="flex flex-col">
                      <div className="flex items-end space-x-[9px]">
                        <div
                          className={`flex min-h-max min-w-max items-center text-[13px] font-bold`}
                          onMouseEnter={(e) => {
                            handleOpenTooltip({
                              e: e,
                              display: "top",
                              content: `オート見積Noで採番される番号は、現在の西暦の下2桁と月日の4桁、6桁の連番を組み合わせたものです。`,
                              content2: `地域により日付が異なるため、自チームにあったタイムゾーンを選択してください。`,
                              marginTop: 28,
                              itemsPosition: "left",
                            });
                          }}
                          onMouseLeave={handleCloseTooltip}
                        >
                          <div className="flex-center relative h-[15px] w-[15px] rounded-full">
                            <div
                              // ref={infoIconQuotationNoRef}
                              className={`flex-center absolute left-0 top-0 h-[15px] w-[15px] rounded-full border border-solid border-[var(--color-bg-brand-f)]`}
                            ></div>
                            <ImInfo className={`min-h-[15px] min-w-[15px] text-[var(--color-bg-brand-f)]`} />
                          </div>
                          <span className={`ml-[6px]`}>タイムゾーン</span>
                        </div>
                        <select
                          className={`h-full min-w-max cursor-pointer ${styles.select_box} ${styles.upsert}`}
                          value={userTimeZone ?? optionsTimeZoneJa[0].timeZone}
                          onChange={(e) => {
                            setUserTimeZone(e.target.value);
                            localStorage.setItem("timezone", e.target.value);
                          }}
                        >
                          {language === "ja" &&
                            optionsTimeZoneJa.map((option) => (
                              <option key={option.timeZone} value={option.timeZone}>
                                {option.areaName}
                              </option>
                            ))}
                          {language === "en" &&
                            optionsTimeZoneEn.map((option) => (
                              <option key={option.timeZone} value={option.timeZone}>
                                {option.areaName}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className={`${styles.underline} mb-[-3px] mt-[3px]`}></div>
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
            className={`${styles.scroll_container} ${
              isInsertModeQuotation ? `${styles.insert_mode}` : ``
            } relative flex w-full overflow-y-auto pb-[60px] pl-[10px] ${
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
                        {!searchMode && !isInsertModeQuotation && (
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

                        {/* ----------------- upsert ----------------- */}
                        {!searchMode && isInsertModeQuotation && (
                          <span className={`${styles.value} ${styles.value_highlight} ${styles.text_start}`}>
                            {inputCompanyName ? inputCompanyName : ""}
                          </span>
                        )}
                        {/* ----------------- upsert ----------------- */}

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
                        {!searchMode && !isInsertModeQuotation && (
                          <span
                            className={`${styles.value} ${styles.text_start}`}
                            onMouseEnter={(e) => {
                              e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            }}
                          >
                            {selectedRowDataQuotation?.company_department_name
                              ? selectedRowDataQuotation?.company_department_name
                              : ""}
                          </span>
                        )}

                        {/* ----------------- upsert ----------------- */}
                        {!searchMode && isInsertModeQuotation && (
                          <span className={`${styles.value} ${styles.text_start}`}>
                            {inputDepartmentName ? inputDepartmentName : ""}
                          </span>
                        )}
                        {/* ----------------- upsert ----------------- */}

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
                        {!searchMode && !isInsertModeQuotation && (
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

                        {/* ----------------- upsert ----------------- */}
                        {!searchMode && isInsertModeQuotation && (
                          <span className={`${styles.value} ${styles.text_start}`}>
                            {inputContactName ? inputContactName : ""}
                          </span>
                        )}
                        {/* ----------------- upsert ----------------- */}

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
                        {!searchMode && !isInsertModeQuotation && (
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

                        {/* ----------------- upsert ----------------- */}
                        {!searchMode && isInsertModeQuotation && (
                          <span className={`${styles.value} ${styles.text_start}`}>
                            {inputDirectLine ? inputDirectLine : ""}
                          </span>
                        )}
                        {/* ----------------- upsert ----------------- */}

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
                        {!searchMode && !isInsertModeQuotation && (
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

                        {/* ----------------- upsert ----------------- */}
                        {!searchMode && isInsertModeQuotation && (
                          <span className={`${styles.value} ${styles.text_start}`}>{inputTel ? inputTel : ""}</span>
                        )}
                        {/* ----------------- upsert ----------------- */}

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
                        {!searchMode && !isInsertModeQuotation && (
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

                        {/* ----------------- upsert ----------------- */}
                        {!searchMode && isInsertModeQuotation && (
                          <span className={`${styles.value} ${styles.text_start}`}>
                            {inputExtension ? inputExtension : ""}
                          </span>
                        )}
                        {/* ----------------- upsert ----------------- */}

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
                        {!searchMode && !isInsertModeQuotation && (
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

                        {/* ----------------- upsert ----------------- */}
                        {!searchMode && isInsertModeQuotation && (
                          <span className={`${styles.value} ${styles.text_start} ${styles.upsert}`}>
                            {inputCompanyCellPhone ? inputCompanyCellPhone : ""}
                          </span>
                        )}
                        {/* ----------------- upsert ----------------- */}

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
                        {!searchMode && !isInsertModeQuotation && (
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

                        {/* ----------------- upsert ----------------- */}
                        {!searchMode && isInsertModeQuotation && (
                          <span className={`${styles.value} ${styles.text_start}`}>
                            {inputDirectFax ? inputDirectFax : ""}
                          </span>
                        )}
                        {/* ----------------- upsert ----------------- */}

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
                        {!searchMode && !isInsertModeQuotation && (
                          <span
                            className={`${styles.value}`}
                            data-text={`${
                              selectedRowDataQuotation?.main_fax ? selectedRowDataQuotation?.main_fax : ""
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
                            {selectedRowDataQuotation?.main_fax ? selectedRowDataQuotation?.main_fax : ""}
                          </span>
                        )}

                        {/* ----------------- upsert ----------------- */}
                        {!searchMode && isInsertModeQuotation && (
                          <span className={`${styles.value} ${styles.text_start} ${styles.upsert}`}>
                            {inputFax ? inputFax : ""}
                          </span>
                        )}
                        {/* ----------------- upsert ----------------- */}

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
                        {!searchMode && !isInsertModeQuotation && (
                          <span className={`${styles.value}`}>
                            {selectedRowDataQuotation?.contact_email ? selectedRowDataQuotation?.contact_email : ""}
                          </span>
                        )}

                        {/* ----------------- upsert ----------------- */}
                        {!searchMode && isInsertModeQuotation && (
                          <span className={`${styles.value} ${styles.text_start}`}>
                            {inputContactEmail ? inputContactEmail : ""}
                          </span>
                        )}
                        {/* ----------------- upsert ----------------- */}

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
                        {!searchMode && !isInsertModeQuotation && (
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

                        {/* ----------------- upsert ----------------- */}
                        {!searchMode && isInsertModeQuotation && (
                          <span className={`${styles.value} ${styles.text_start}`}>
                            {inputZipcode ? inputZipcode : ""}
                          </span>
                        )}
                        {/* ----------------- upsert ----------------- */}

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
                        {!searchMode && !isInsertModeQuotation && (
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

                        {/* ----------------- upsert ----------------- */}
                        {!searchMode && isInsertModeQuotation && (
                          <span className={`${styles.value} ${styles.text_start}`}>
                            {inputAddress ? inputAddress : ""}
                          </span>
                        )}
                        {/* ----------------- upsert ----------------- */}

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
                        {isInsertModeQuotation && (
                          <div
                            className={`${styles.upsert_btn} transition-bg02 ml-auto min-h-[26px] min-w-[90px] max-w-[90px] !rounded-[6px] text-[12px]`}
                            onClick={() => {
                              setIsOpenSearchDestinationSideTableBefore(true);
                              setTimeout(() => {
                                setIsOpenSearchDestinationSideTable(true);
                              }, 100);
                            }}
                          >
                            送付先変更
                          </div>
                        )}
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
                        {!searchMode && !isInsertModeQuotation && (
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

                        {/* ----------------- upsert ----------------- */}
                        {!searchMode && isInsertModeQuotation && (
                          <span className={`${styles.value} ${styles.text_start}`}>
                            {selectedDestination?.destination_company_name
                              ? selectedDestination?.destination_company_name
                              : ""}
                          </span>
                        )}
                        {/* ----------------- upsert ----------------- */}
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
                        {!searchMode && !isInsertModeQuotation && (
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

                        {/* ----------------- upsert ----------------- */}
                        {!searchMode && isInsertModeQuotation && (
                          <span className={`${styles.value} ${styles.text_start}`}>
                            {selectedDestination?.destination_company_department_name
                              ? selectedDestination?.destination_company_department_name
                              : ""}
                          </span>
                        )}
                        {/* ----------------- upsert ----------------- */}
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
                        {!searchMode && !isInsertModeQuotation && (
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

                        {/* ----------------- upsert ----------------- */}
                        {!searchMode && isInsertModeQuotation && (
                          <span className={`${styles.value} ${styles.text_start}`}>
                            {selectedDestination?.destination_contact_name
                              ? selectedDestination?.destination_contact_name
                              : ""}
                          </span>
                        )}
                        {/* ----------------- upsert ----------------- */}
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
                        {!searchMode && !isInsertModeQuotation && (
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

                        {/* ----------------- upsert ----------------- */}
                        {!searchMode && isInsertModeQuotation && (
                          <span className={`${styles.value} ${styles.text_start}`}>
                            {selectedDestination?.destination_contact_direct_line
                              ? selectedDestination?.destination_contact_direct_line
                              : ""}
                          </span>
                        )}
                        {/* ----------------- upsert ----------------- */}
                      </div>
                      <div className={`${styles.underline}`}></div>
                    </div>
                    <div className="flex h-full w-1/2 flex-col pr-[20px]">
                      <div className={`${styles.title_box} flex h-full items-center`}>
                        <span className={`${styles.title}`}>直通FAX</span>
                        {!searchMode && !isInsertModeQuotation && (
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

                        {/* ----------------- upsert ----------------- */}
                        {!searchMode && isInsertModeQuotation && (
                          <span className={`${styles.value} ${styles.text_start}`}>
                            {selectedDestination?.destination_contact_direct_fax
                              ? selectedDestination?.destination_contact_direct_fax
                              : ""}
                          </span>
                        )}
                        {/* ----------------- upsert ----------------- */}
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
                        {!searchMode && !isInsertModeQuotation && (
                          <span className={`${styles.value}`}>
                            {selectedRowDataQuotation?.destination_contact_email
                              ? selectedRowDataQuotation?.destination_contact_email
                              : ""}
                          </span>
                        )}

                        {/* ----------------- upsert ----------------- */}
                        {!searchMode && isInsertModeQuotation && (
                          <span className={`${styles.value} ${styles.text_start}`}>
                            {selectedDestination?.destination_contact_email
                              ? selectedDestination?.destination_contact_email
                              : ""}
                          </span>
                        )}
                        {/* ----------------- upsert ----------------- */}
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
                        {!searchMode && !isInsertModeQuotation && (
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

                        {/* ----------------- upsert ----------------- */}
                        {!searchMode && isInsertModeQuotation && (
                          <span className={`${styles.value} ${styles.text_start}`}>
                            {selectedDestination?.destination_company_zipcode
                              ? selectedDestination?.destination_company_zipcode
                              : ""}
                          </span>
                        )}
                        {/* ----------------- upsert ----------------- */}
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
                        {!searchMode && !isInsertModeQuotation && (
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

                        {/* ----------------- upsert ----------------- */}
                        {!searchMode && isInsertModeQuotation && (
                          <span className={`${styles.value} ${styles.text_start}`}>
                            {selectedDestination?.destination_company_address
                              ? selectedDestination?.destination_company_address
                              : ""}
                          </span>
                        )}
                        {/* ----------------- upsert ----------------- */}
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
                            <span
                              className={`${styles.section_title} ${styles.min_text} ${
                                useQuotationNoCustom && isInsertModeQuotation ? `` : `!min-w-[88px]`
                              }`}
                            >
                              ●見積No
                            </span>
                            {/* ローカルストレージに真偽値で独自かシステムどちらを使うかを保持して表示を切り替える */}
                            {!searchMode &&
                              isEditModeField !== "quotation_no_system" &&
                              isEditModeField !== "quotation_no_custom" &&
                              !isInsertModeQuotation && (
                                <span
                                  className={`${styles.value} ${styles.value_highlight} ${styles.editable_field}`}
                                  data-text={
                                    selectedRowDataQuotation?.quotation_no_system
                                      ? selectedRowDataQuotation?.quotation_no_system
                                      : selectedRowDataQuotation?.quotation_no_custom
                                      ? selectedRowDataQuotation?.quotation_no_custom
                                      : ""
                                  }
                                  onMouseEnter={(e) => handleOpenTooltip({ e, display: "top" })}
                                  onMouseLeave={handleCloseTooltip}
                                  onClick={handleSingleClickField}
                                  onDoubleClick={(e) => {
                                    if (
                                      !selectedRowDataQuotation?.quotation_no_system &&
                                      !selectedRowDataQuotation?.quotation_no_custom
                                    ) {
                                      return;
                                    }
                                    handleDoubleClickField({
                                      e,
                                      // field: "quotation_no_system",
                                      field: selectedRowDataQuotation?.quotation_no_system
                                        ? "quotation_no_system"
                                        : selectedRowDataQuotation?.quotation_no_custom
                                        ? "quotation_no_custom"
                                        : "",
                                      dispatch: setInputQuotationNoSystem,
                                      selectedRowDataValue: selectedRowDataQuotation?.quotation_no_system ?? "",
                                    });
                                    handleCloseTooltip();
                                  }}
                                >
                                  {/* {selectedRowDataQuotation?.quotation_no_system
                                    ? selectedRowDataQuotation?.quotation_no_system
                                    : ""} */}
                                  {/* カスタム見積Noが存在する場合はカスタム見積Noを優先で取得 */}
                                  {selectedRowDataQuotation?.quotation_no_custom
                                    ? selectedRowDataQuotation?.quotation_no_custom
                                    : selectedRowDataQuotation?.quotation_no_system
                                    ? selectedRowDataQuotation?.quotation_no_system
                                    : ""}
                                </span>
                              )}

                            {/* ----------------- upsert ----------------- */}
                            {!searchMode && isInsertModeQuotation && (
                              <>
                                {useQuotationNoCustom && !isLoadingQuotationNo && (
                                  <input
                                    type="text"
                                    placeholder="見積Noを入力"
                                    // autoFocus
                                    className={`${styles.input_box} ${styles.upsert}`}
                                    value={inputQuotationNoCustom}
                                    onChange={(e) => setInputQuotationNoCustom(e.target.value)}
                                    onBlur={(e) => setInputQuotationNoCustom(inputQuotationNoCustom.trim())}
                                  />
                                )}
                                {!useQuotationNoCustom && !isLoadingQuotationNo && (
                                  <span
                                    className={`${styles.value}`}
                                    onMouseEnter={(e) => {
                                      if (inputQuotationNoSystem) {
                                        handleOpenTooltip({
                                          e: e,
                                          display: "top",
                                          content: `オート見積Noで採番された番号の編集はできません`,
                                          content2: `${
                                            !isDesktopGTE1600 && isOpenSidebar ? `${inputQuotationNoSystem}` : ``
                                          }`,
                                          marginTop: 28,
                                          itemsPosition: "center",
                                        });
                                      }
                                    }}
                                    onMouseLeave={() => {
                                      if (hoveredItemPosWrap) handleCloseTooltip();
                                    }}
                                  >
                                    {inputQuotationNoSystem ? inputQuotationNoSystem : ""}
                                  </span>
                                )}
                                {/* ローディング オート見積No取得時 */}
                                {isLoadingQuotationNo && (
                                  <div className="">
                                    <SpinnerComet w="24px" h="24px" s="3px" />
                                  </div>
                                )}
                              </>
                            )}
                            {/* ----------------- upsert ----------------- */}

                            {/* ============= フィールドエディットモード関連 ============= */}
                            {/* フィールドエディットモード selectタグ  */}
                            {!searchMode &&
                              (isEditModeField === "quotation_no_system" ||
                                isEditModeField === "quotation_no_custom") && (
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
                                    onKeyDown={(e) => {
                                      handleKeyDownUpdateField({
                                        e,
                                        // fieldName: "quotation_no_system",
                                        // fieldNameForSelectedRowData: "quotation_no_system",
                                        fieldName: isEditModeField,
                                        fieldNameForSelectedRowData: isEditModeField,
                                        originalValue: originalValueFieldEdit.current,
                                        newValue: inputQuotationNoSystem.trim(),
                                        id: selectedRowDataQuotation?.quotation_id,
                                        required: true,
                                      });
                                    }}
                                  />
                                  {/* 送信ボタンとクローズボタン */}
                                  {!updateQuotationFieldMutation.isLoading && (
                                    <InputSendAndCloseBtn
                                      inputState={inputQuotationNoSystem}
                                      setInputState={setInputQuotationNoSystem}
                                      onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                                        handleClickSendUpdateField({
                                          e,
                                          // fieldName: "quotation_no_system",
                                          // fieldNameForSelectedRowData: "quotation_no_system",
                                          fieldName: isEditModeField,
                                          fieldNameForSelectedRowData: isEditModeField,
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
                            <div className={`${styles.title} flex flex-col`}>
                              <span>●提出区分</span>
                            </div>
                            {!searchMode && isEditModeField !== "submission_class" && !isInsertModeQuotation && (
                              <span
                                className={`${styles.value} ${styles.value_highlight} ${styles.editable_field}`}
                                data-text={
                                  selectedRowDataQuotation?.submission_class
                                    ? getSubmissionClass(selectedRowDataQuotation?.submission_class)
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
                                    dispatch: setInputSubmissionClassEdit,
                                    selectedRowDataValue: selectedRowDataQuotation?.submission_class ?? "",
                                  });
                                  handleCloseTooltip();
                                }}
                              >
                                {selectedRowDataQuotation?.submission_class
                                  ? getSubmissionClass(selectedRowDataQuotation?.submission_class)
                                  : ""}
                              </span>
                            )}
                            {/* ----------------- upsert ----------------- */}
                            {!searchMode && isInsertModeQuotation && (
                              <>
                                <select
                                  className={`ml-auto h-full w-full cursor-pointer ${styles.select_box} ${styles.upsert}`}
                                  value={inputSubmissionClassEdit}
                                  onChange={(e) => {
                                    setInputSubmissionClassEdit(e.target.value);
                                  }}
                                >
                                  {/* <option value=""></option> */}
                                  {optionsSubmissionClass.map((option) => (
                                    <option key={option} value={option}>
                                      {getSubmissionClass(option)}
                                    </option>
                                  ))}
                                  {/* <option value="提出用">提出用</option>
                                <option value="社内用">社内用</option> */}
                                </select>
                              </>
                            )}
                            {/* ----------------- upsert ----------------- */}
                            {/* ============= フィールドエディットモード関連 ============= */}
                            {/* フィールドエディットモード selectタグ  */}
                            {!searchMode && isEditModeField === "submission_class" && (
                              <>
                                <select
                                  className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                                  value={inputSubmissionClassEdit}
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
                                  {optionsSubmissionClass.map((option) => (
                                    <option key={option} value={option}>
                                      {getSubmissionClass(option)}
                                    </option>
                                  ))}
                                  {/* <option value="提出用">提出用</option>
                                <option value="社内用">社内用</option> */}
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
                            {!searchMode && isEditModeField !== "deadline" && !isInsertModeQuotation && (
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
                                    dispatch: setInputDeadlineEdit,
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

                            {/* <CustomSelectInput options={Array(12).fill("新規会社(過去面談無し)")} displayX="center" /> */}

                            {/* ----------------- upsert ----------------- */}
                            {!searchMode && isInsertModeQuotation && (
                              <CustomSelectInput
                                options={optionsDeadline}
                                defaultValue={"当日出荷"}
                                displayX="center"
                                state={inputDeadlineEdit}
                                dispatch={setInputDeadlineEdit}
                              />
                            )}
                            {/* ----------------- upsert ----------------- */}

                            {/* ============= フィールドエディットモード関連 ============= */}
                            {/* フィールドエディットモード selectタグ  */}
                            {!searchMode && isEditModeField === "deadline" && (
                              <>
                                <select
                                  className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                                  value={inputDeadlineEdit}
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
                            {!searchMode && isEditModeField !== "quotation_date" && !isInsertModeQuotation && (
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
                                    dispatch: setInputQuotationDate,
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

                            {/* ----------------- upsert ----------------- */}
                            {!searchMode && isInsertModeQuotation && (
                              <DatePickerCustomInput
                                startDate={inputQuotationDate}
                                setStartDate={setInputQuotationDate}
                                required={true}
                                isShownCloseBtn={false}
                                sizeMin={true}
                              />
                            )}
                            {/* ----------------- upsert ----------------- */}

                            {/* ============= フィールドエディットモード関連 ============= */}
                            {/* フィールドエディットモード Date-picker  */}
                            {!searchMode && isEditModeField === "quotation_date" && (
                              <>
                                <div className="z-[2000] w-full">
                                  <DatePickerCustomInput
                                    startDate={inputQuotationDate}
                                    setStartDate={setInputQuotationDate}
                                    required={true}
                                    isFieldEditMode={true}
                                    fieldEditModeBtnAreaPosition="right"
                                    isLoadingSendEvent={updateQuotationFieldMutation.isLoading}
                                    onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                                      if (!inputQuotationDate) return alert("このデータは入力が必須です。");
                                      const originalDateUTCString = selectedRowDataQuotation?.quotation_date
                                        ? selectedRowDataQuotation.quotation_date
                                        : null; // ISOString UTC時間 2023-12-26T15:00:00+00:00
                                      const newDateUTCString = inputQuotationDate
                                        ? inputQuotationDate.toISOString()
                                        : null; // Dateオブジェクト ローカルタイムゾーンに自動で変換済み Thu Dec 28 2023 00:00:00 GMT+0900 (日本標準時)
                                      // const result = isSameDateLocal(originalDateString, newDateString);
                                      console.log(
                                        "日付送信クリック",
                                        "オリジナル(UTC)",
                                        originalDateUTCString,
                                        "新たな値(Dateオブジェクト)",
                                        inputQuotationDate,
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

                      {/* ●有効期限・納入場所 */}
                      <div className={`${styles.row_area} flex w-full items-center`}>
                        <div className="flex h-full w-1/2 flex-col pr-[20px]">
                          <div className={`${styles.title_box} flex h-full items-center `}>
                            <span className={`${styles.title}`}>納入場所</span>
                            {!searchMode && isEditModeField !== "delivery_place" && !isInsertModeQuotation && (
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
                                    dispatch: setInputDeliveryPlaceEdit,
                                  });
                                  if (hoveredItemPosWrap) handleCloseTooltip();
                                }}
                                data-text={`${
                                  selectedRowDataQuotation?.delivery_place
                                    ? selectedRowDataQuotation?.delivery_place
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
                                {selectedRowDataQuotation?.delivery_place
                                  ? selectedRowDataQuotation?.delivery_place
                                  : ""}
                              </span>
                            )}

                            {/* ----------------- upsert ----------------- */}
                            {!searchMode && isInsertModeQuotation && (
                              <CustomSelectInput
                                options={optionsDeliveryPlace}
                                defaultValue={"お打ち合わせにより決定"}
                                displayX="center"
                                state={inputDeliveryPlaceEdit}
                                dispatch={setInputDeliveryPlaceEdit}
                              />
                            )}
                            {/* ----------------- upsert ----------------- */}

                            {/* ============= フィールドエディットモード関連 ============= */}
                            {/* フィールドエディットモード selectタグ  */}
                            {!searchMode && isEditModeField === "delivery_place" && (
                              <>
                                <select
                                  className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                                  value={inputDeliveryPlaceEdit}
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
                            {!searchMode && isEditModeField !== "expiration_date" && !isInsertModeQuotation && (
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
                                    dispatch: setInputExpirationDate,
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

                            {/* ----------------- upsert ----------------- */}
                            {!searchMode && isInsertModeQuotation && (
                              <DatePickerCustomInput
                                startDate={inputExpirationDate}
                                setStartDate={setInputExpirationDate}
                                required={true}
                                isShownCloseBtn={false}
                                sizeMin={true}
                              />
                            )}
                            {/* ----------------- upsert ----------------- */}

                            {/* ============= フィールドエディットモード関連 ============= */}
                            {/* フィールドエディットモード Date-picker  */}
                            {!searchMode && isEditModeField === "expiration_date" && (
                              <>
                                <div className="z-[2000] w-full">
                                  <DatePickerCustomInput
                                    startDate={inputExpirationDate}
                                    setStartDate={setInputExpirationDate}
                                    required={true}
                                    isFieldEditMode={true}
                                    fieldEditModeBtnAreaPosition="right"
                                    isLoadingSendEvent={updateQuotationFieldMutation.isLoading}
                                    onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                                      if (!inputExpirationDate) return alert("このデータは入力が必須です。");
                                      const originalDateUTCString = selectedRowDataQuotation?.expiration_date
                                        ? selectedRowDataQuotation.expiration_date
                                        : null; // ISOString UTC時間 2023-12-26T15:00:00+00:00
                                      const newDateUTCString = inputExpirationDate
                                        ? inputExpirationDate.toISOString()
                                        : null; // Dateオブジェクト ローカルタイムゾーンに自動で変換済み Thu Dec 28 2023 00:00:00 GMT+0900 (日本標準時)
                                      // const result = isSameDateLocal(originalDateString, newDateString);
                                      console.log(
                                        "日付送信クリック",
                                        "オリジナル(UTC)",
                                        originalDateUTCString,
                                        "新たな値(Dateオブジェクト)",
                                        inputExpirationDate,
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
                            {!searchMode && isEditModeField !== "payment_terms" && !isInsertModeQuotation && (
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
                                    dispatch: setInputPaymentTermsEdit,
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

                            {/* ----------------- upsert ----------------- */}
                            {!searchMode && isInsertModeQuotation && (
                              <CustomSelectInput
                                options={optionsPaymentTerms}
                                defaultValue={"従来通り"}
                                displayX="center"
                                state={inputPaymentTermsEdit}
                                dispatch={setInputPaymentTermsEdit}
                              />
                            )}
                            {/* ----------------- upsert ----------------- */}

                            {/* ============= フィールドエディットモード関連 ============= */}
                            {/* フィールドエディットモード selectタグ  */}
                            {!searchMode && isEditModeField === "payment_terms" && (
                              <>
                                <select
                                  className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                                  value={inputPaymentTermsEdit}
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

                            {!isInsertModeQuotation && (
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
                                  checked={checkboxUseCorporateSealFlagEdit}
                                  onChange={async (e) => {
                                    if (!selectedRowDataQuotation) return;
                                    // 個別にチェックボックスを更新するルート
                                    if (!selectedRowDataQuotation?.quotation_id)
                                      return toast.error(`データが見つかりませんでした🙇‍♀️`);

                                    console.log(
                                      "チェック 新しい値",
                                      !checkboxUseCorporateSealFlagEdit,
                                      "オリジナル",
                                      selectedRowDataQuotation?.use_corporate_seal
                                    );
                                    if (
                                      !checkboxUseCorporateSealFlagEdit === selectedRowDataQuotation?.use_corporate_seal
                                    ) {
                                      toast.error(`アップデートに失敗しました🤦‍♀️`);
                                      return;
                                    }
                                    const updatePayload = {
                                      fieldName: "use_corporate_seal",
                                      fieldNameForSelectedRowData: "use_corporate_seal" as "use_corporate_seal",
                                      newValue: !checkboxUseCorporateSealFlagEdit,
                                      id: selectedRowDataQuotation.quotation_id,
                                    };
                                    // 直感的にするためにmutateにして非同期処理のまま後続のローカルのチェックボックスを更新する
                                    updateQuotationFieldMutation.mutate(updatePayload);
                                    setCheckboxUseCorporateSealFlagEdit(!checkboxUseCorporateSealFlagEdit);
                                  }}
                                />
                                <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                                </svg>
                              </div>
                            )}
                            {/* ----------------- upsert ----------------- */}
                            {isInsertModeQuotation && (
                              <div
                                className={`${styles.grid_select_cell_header} `}
                                onMouseEnter={(e) => {
                                  e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                                }}
                              >
                                <input
                                  type="checkbox"
                                  className={`${styles.grid_select_cell_header_input}`}
                                  checked={checkboxUseCorporateSealFlagEdit}
                                  onChange={async (e) => {
                                    setCheckboxUseCorporateSealFlagEdit(!checkboxUseCorporateSealFlagEdit);
                                  }}
                                />
                                <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                                </svg>
                              </div>
                            )}
                            {/* ----------------- upsert ----------------- */}
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
                            {!searchMode && isEditModeField !== "quotation_division" && !isInsertModeQuotation && (
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
                                    dispatch: setInputQuotationDivisionEdit,
                                  });
                                  if (hoveredItemPosWrap) handleCloseTooltip();
                                }}
                                data-text={`${
                                  selectedRowDataQuotation?.quotation_division
                                    ? getQuotationDivision(selectedRowDataQuotation?.quotation_division)
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
                                  ? getQuotationDivision(selectedRowDataQuotation?.quotation_division)
                                  : ""}
                              </span>
                            )}

                            {/* ----------------- upsert ----------------- */}
                            {!searchMode && isInsertModeQuotation && (
                              <>
                                <select
                                  className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.upsert}`}
                                  value={inputQuotationDivisionEdit}
                                  onChange={(e) => {
                                    setInputQuotationDivisionEdit(e.target.value);
                                  }}
                                >
                                  {/* <option value=""></option> */}
                                  {optionsQuotationDivision.map((option) => (
                                    <option key={option} value={option}>
                                      {getQuotationDivision(option)}
                                    </option>
                                  ))}
                                </select>
                              </>
                            )}
                            {/* ----------------- upsert ----------------- */}

                            {/* ============= フィールドエディットモード関連 ============= */}
                            {/* フィールドエディットモード selectタグ  */}
                            {!searchMode && isEditModeField === "quotation_division" && (
                              <>
                                <select
                                  className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                                  value={inputQuotationDivisionEdit}
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
                            {!searchMode && isEditModeField !== "sending_method" && !isInsertModeQuotation && (
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
                                    dispatch: setInputSendingMethodEdit,
                                  });
                                  if (hoveredItemPosWrap) handleCloseTooltip();
                                }}
                                data-text={`${
                                  selectedRowDataQuotation?.sending_method
                                    ? getSendingMethod(selectedRowDataQuotation?.sending_method)
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
                                {selectedRowDataQuotation?.sending_method
                                  ? getSendingMethod(selectedRowDataQuotation?.sending_method)
                                  : ""}
                              </span>
                            )}

                            {/* ----------------- upsert ----------------- */}
                            {!searchMode && isInsertModeQuotation && (
                              <>
                                <select
                                  className={`ml-auto h-full w-full cursor-pointer ${styles.select_box} ${styles.upsert}`}
                                  value={inputSendingMethodEdit}
                                  onChange={(e) => {
                                    setInputSendingMethodEdit(e.target.value);
                                  }}
                                >
                                  {/* <option value=""></option> */}
                                  {optionsSendingMethod.map((option) => (
                                    <option key={option} value={option}>
                                      {getSendingMethod(option)}
                                    </option>
                                  ))}
                                </select>
                              </>
                            )}
                            {/* ----------------- upsert ----------------- */}

                            {/* ============= フィールドエディットモード関連 ============= */}
                            {/* フィールドエディットモード selectタグ  */}
                            {!searchMode && isEditModeField === "sending_method" && (
                              <>
                                <select
                                  className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                                  value={inputSendingMethodEdit}
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
                            <span className={`${styles.title} ${isInsertModeQuotation ? `` : `${styles.title_sm}`}`}>
                              見積備考
                            </span>
                            {!searchMode && isEditModeField !== "quotation_notes" && !isInsertModeQuotation && (
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

                            {/* ----------------- upsert ----------------- */}
                            {!searchMode && isInsertModeQuotation && (
                              <>
                                <textarea
                                  cols={30}
                                  // rows={10}
                                  placeholder=""
                                  style={{ whiteSpace: "pre-wrap" }}
                                  className={`${styles.textarea_box} ${styles.md} ${styles.upsert}`}
                                  value={inputQuotationNotes}
                                  onChange={(e) => setInputQuotationNotes(e.target.value)}
                                ></textarea>
                              </>
                            )}

                            {/* ----------------- upsert ----------------- */}

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
                            {/* <span className={`${styles.title}`}>●消費税区分</span> */}
                            <div className={`${styles.title} flex flex-col ${styles.double_text} !text-[12px]`}>
                              <span>●消費税区分</span>
                              <span>見積記載有無</span>
                            </div>
                            {!searchMode && isEditModeField !== "sales_tax_class" && !isInsertModeQuotation && (
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
                                    dispatch: setInputSalesTaxClassEdit,
                                  });
                                  if (hoveredItemPosWrap) handleCloseTooltip();
                                }}
                                data-text={`${
                                  selectedRowDataQuotation?.sales_tax_class
                                    ? getSalesTaxClass(selectedRowDataQuotation?.sales_tax_class)
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
                                  ? getSalesTaxClass(selectedRowDataQuotation?.sales_tax_class)
                                  : ""}
                              </span>
                            )}

                            {/* ----------------- upsert ----------------- */}
                            {!searchMode && isInsertModeQuotation && (
                              <>
                                <select
                                  className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.upsert}`}
                                  value={inputSalesTaxClassEdit}
                                  onChange={(e) => {
                                    setInputSalesTaxClassEdit(e.target.value);
                                  }}
                                >
                                  {/* <option value=""></option> */}
                                  {optionsSalesTaxClass.map((option) => (
                                    <option key={option} value={option}>
                                      {getSalesTaxClass(option)}
                                    </option>
                                  ))}
                                </select>
                              </>
                            )}
                            {/* ----------------- upsert ----------------- */}

                            {/* ============= フィールドエディットモード関連 ============= */}
                            {/* フィールドエディットモード selectタグ  */}
                            {!searchMode && isEditModeField === "sales_tax_class" && (
                              <>
                                <select
                                  className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                                  value={inputSalesTaxClassEdit}
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
                            {!searchMode && isEditModeField !== "sales_tax_rate" && !isInsertModeQuotation && (
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
                                    dispatch: setInputSalesTaxRateEdit,
                                  });
                                  if (hoveredItemPosWrap) handleCloseTooltip();
                                }}
                                data-text={`${
                                  selectedRowDataQuotation?.sales_tax_rate
                                    ? selectedRowDataQuotation?.sales_tax_rate
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
                                {selectedRowDataQuotation?.sales_tax_rate
                                  ? selectedRowDataQuotation?.sales_tax_rate
                                  : ""}
                              </span>
                            )}

                            {/* ----------------- upsert ----------------- */}
                            {!searchMode && isInsertModeQuotation && (
                              <>
                                <select
                                  className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.upsert}`}
                                  value={inputSalesTaxRateEdit}
                                  onChange={(e) => {
                                    setInputSalesTaxRateEdit(e.target.value);
                                  }}
                                >
                                  {/* <option value=""></option> */}
                                  {optionsSalesTaxRate.map((option) => (
                                    <option key={option} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </select>
                              </>
                            )}
                            {/* ----------------- upsert ----------------- */}

                            {/* ============= フィールドエディットモード関連 ============= */}
                            {/* フィールドエディットモード selectタグ  */}
                            {!searchMode && isEditModeField === "sales_tax_rate" && (
                              <>
                                <select
                                  className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                                  value={inputSalesTaxRateEdit}
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
                            {/* <span className={`${styles.title} text-[12px]`}>価格合計</span> */}
                            <div
                              className={`${styles.title} flex items-center`}
                              onMouseEnter={(e) => {
                                if (
                                  infoIconTotalPriceRef.current &&
                                  infoIconTotalPriceRef.current.classList.contains(styles.animate_ping)
                                ) {
                                  infoIconTotalPriceRef.current.classList.remove(styles.animate_ping);
                                }
                                handleOpenTooltip({
                                  e: e,
                                  display: "top",
                                  content: `価格合計は見積商品リストに商品を追加することで自動で計算されます`,
                                  content2: `以下の「見積商品リスト」の追加ボタンから商品の追加が可能です`,
                                  // content3: `ex) 入力: 20万円 -> 出力: 200000`,
                                  marginTop: 28,
                                  itemsPosition: "center",
                                });
                              }}
                              onMouseLeave={handleCloseTooltip}
                            >
                              <span className={`mr-[6px]`}>価格合計</span>
                              {isInsertModeQuotation && (
                                <div className="flex-center relative h-[15px] w-[15px] rounded-full">
                                  <div
                                    ref={infoIconTotalPriceRef}
                                    className={`flex-center absolute left-0 top-0 h-[15px] w-[15px] rounded-full border border-solid border-[var(--color-bg-brand-f)] ${styles.animate_ping}`}
                                  ></div>
                                  <ImInfo className={`min-h-[15px] min-w-[15px] text-[var(--color-bg-brand-f)]`} />
                                </div>
                              )}
                            </div>

                            {!searchMode && isEditModeField !== "total_price" && !isInsertModeQuotation && (
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
                                    dispatch: setInputTotalPriceEdit,
                                  });
                                  if (hoveredItemPosWrap) handleCloseTooltip();
                                }}
                                data-text={`${
                                  selectedRowDataQuotation?.total_price ? selectedRowDataQuotation?.total_price : ""
                                }`}
                                onMouseEnter={(e) => {
                                  e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                                  // scrollWidthがoffsetWidthを超えていればツールチップを表示
                                  const el = e.currentTarget;
                                  if (el.scrollWidth > el.offsetWidth) {
                                    handleOpenTooltip({
                                      e: e,
                                      display: "top",
                                      content: checkNotFalsyExcludeZero(selectedRowDataQuotation?.total_price)
                                        ? Number(selectedRowDataQuotation?.total_price).toLocaleString() + "円"
                                        : "",
                                      // marginTop: 28,
                                      itemsPosition: "center",
                                    });
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                                  if (hoveredItemPosWrap) handleCloseTooltip();
                                }}
                              >
                                {checkNotFalsyExcludeZero(selectedRowDataQuotation?.total_price)
                                  ? Number(selectedRowDataQuotation?.total_price).toLocaleString() + "円"
                                  : ""}
                              </span>
                            )}

                            {/* ----------------- upsert ----------------- */}
                            {!searchMode && isInsertModeQuotation && (
                              <span
                                className={`${styles.value}`}
                                onMouseEnter={(e) => {
                                  // scrollWidthがoffsetWidthを超えていればツールチップを表示
                                  const el = e.currentTarget;
                                  if (el.scrollWidth > el.offsetWidth) {
                                    handleOpenTooltip({
                                      e: e,
                                      display: "top",
                                      content: inputTotalPriceEdit ? formatDisplayPrice(inputTotalPriceEdit) : "",
                                      // marginTop: 28,
                                      itemsPosition: "center",
                                    });
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (hoveredItemPosWrap) handleCloseTooltip();
                                }}
                              >
                                {inputTotalPriceEdit ? formatDisplayPrice(inputTotalPriceEdit) : ""}
                              </span>
                            )}
                            {/* ----------------- upsert ----------------- */}

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
                                  value={checkNotFalsyExcludeZero(inputTotalPriceEdit) ? inputTotalPriceEdit : ""}
                                  onChange={(e) => {
                                    if (e.target.value === "0" || e.target.value === "０") {
                                      setInputTotalPriceEdit("0");
                                    }
                                    setInputTotalPriceEdit(e.target.value);
                                  }}
                                  // onBlur={() => {
                                  //   setInputTotalPriceEdit(
                                  //     !!inputTotalPriceEdit &&
                                  //       inputTotalPriceEdit !== "" &&
                                  //       convertToYen(inputTotalPriceEdit.trim()) !== null
                                  //       ? (convertToYen(inputTotalPriceEdit.trim()) as number).toLocaleString()
                                  //       : ""
                                  //   );
                                  // }}
                                  onKeyDown={(e) => {
                                    handleKeyDownUpdateField({
                                      e,
                                      fieldName: "total_price",
                                      fieldNameForSelectedRowData: "total_price",
                                      originalValue: originalValueFieldEdit.current,
                                      newValue: !!inputTotalPriceEdit
                                        ? (convertToYen(inputTotalPriceEdit.trim()) as number).toString()
                                        : null,
                                      id: selectedRowDataQuotation?.quotation_id,
                                      required: false,
                                    });
                                  }}
                                  onMouseEnter={(e) => {
                                    // scrollWidthがoffsetWidthを超えていればツールチップを表示
                                    const el = e.currentTarget;
                                    if (el.scrollWidth > el.offsetWidth) {
                                      handleOpenTooltip({ e });
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (hoveredItemPosWrap) handleCloseTooltip();
                                  }}
                                />
                                {/* 送信ボタンとクローズボタン */}
                                {!updateQuotationFieldMutation.isLoading && (
                                  <InputSendAndCloseBtnGlobal<string>
                                    inputState={inputTotalPriceEdit}
                                    setInputState={setInputTotalPriceEdit}
                                    onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                                      handleClickSendUpdateField({
                                        e,
                                        fieldName: "total_price",
                                        fieldNameForSelectedRowData: "total_price",
                                        originalValue: originalValueFieldEdit.current,
                                        newValue: inputTotalPriceEdit
                                          ? (convertToYen(inputTotalPriceEdit.trim()) as number).toString()
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
                            {!searchMode && isEditModeField !== "discount_title" && !isInsertModeQuotation && (
                              <span
                                className={`${styles.value} ${styles.editable_field}`}
                                data-text={
                                  selectedRowDataQuotation?.discount_title
                                    ? selectedRowDataQuotation?.discount_title
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
                                    field: "discount_title",
                                    dispatch: setInputDiscountTitleEdit,
                                    selectedRowDataValue: selectedRowDataQuotation?.discount_title ?? "",
                                  });
                                  handleCloseTooltip();
                                }}
                              >
                                {selectedRowDataQuotation?.discount_title
                                  ? selectedRowDataQuotation?.discount_title
                                  : ""}
                              </span>
                            )}

                            {/* ----------------- upsert ----------------- */}
                            {!searchMode && isInsertModeQuotation && (
                              <>
                                <input
                                  type="text"
                                  // placeholder="見積Noを入力"
                                  // autoFocus
                                  className={`${styles.input_box} ${styles.upsert}`}
                                  value={inputDiscountTitleEdit}
                                  onChange={(e) => setInputDiscountTitleEdit(e.target.value)}
                                  onBlur={(e) => setInputDiscountTitleEdit(inputDiscountTitleEdit.trim())}
                                />
                              </>
                            )}
                            {/* ----------------- upsert ----------------- */}

                            {/* ============= フィールドエディットモード関連 ============= */}
                            {/* フィールドエディットモード selectタグ  */}
                            {!searchMode && isEditModeField === "discount_title" && (
                              <>
                                <input
                                  type="text"
                                  placeholder=""
                                  autoFocus
                                  className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                                  value={inputDiscountTitleEdit}
                                  onChange={(e) => setInputDiscountTitleEdit(e.target.value)}
                                  onCompositionStart={() => setIsComposing(true)}
                                  onCompositionEnd={() => setIsComposing(false)}
                                  onKeyDown={(e) =>
                                    handleKeyDownUpdateField({
                                      e,
                                      fieldName: "discount_title",
                                      fieldNameForSelectedRowData: "discount_title",
                                      originalValue: originalValueFieldEdit.current,
                                      newValue: inputDiscountTitleEdit.trim(),
                                      id: selectedRowDataQuotation?.quotation_id,
                                      required: true,
                                    })
                                  }
                                />
                                {/* 送信ボタンとクローズボタン */}
                                {!updateQuotationFieldMutation.isLoading && (
                                  <InputSendAndCloseBtn
                                    inputState={inputDiscountTitleEdit}
                                    setInputState={setInputDiscountTitleEdit}
                                    onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                                      handleClickSendUpdateField({
                                        e,
                                        fieldName: "discount_title",
                                        fieldNameForSelectedRowData: "discount_title",
                                        originalValue: originalValueFieldEdit.current,
                                        newValue: inputDiscountTitleEdit.trim(),
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

                      {/* 値引金額・値引率 */}
                      <div className={`${styles.row_area} flex w-full items-center`}>
                        <div className="flex h-full w-1/2 flex-col pr-[20px]">
                          <div className={`${styles.title_box} flex h-full items-center `}>
                            {/* <span className={`${styles.title} text-[12px]`}>値引金額</span> */}
                            <div
                              className={`${styles.title} flex items-center`}
                              onMouseEnter={(e) => {
                                if (
                                  infoIconDiscountRef.current &&
                                  infoIconDiscountRef.current.classList.contains(styles.animate_ping)
                                ) {
                                  infoIconDiscountRef.current.classList.remove(styles.animate_ping);
                                }
                                handleOpenTooltip({
                                  e: e,
                                  display: "top",
                                  content: `円単位で値引金額を入力します`,
                                  content2: `万円単位で入力しても自動で円単位に補完されます`,
                                  content3: `ex) 入力: 20万円 -> 出力: 200000`,
                                  marginTop: 28,
                                  itemsPosition: "center",
                                });
                              }}
                              onMouseLeave={() => {
                                if (hoveredItemPosWrap) handleCloseTooltip();
                              }}
                            >
                              <span className={`mr-[6px]`}>値引金額</span>
                              {isInsertModeQuotation && (
                                <div className="flex-center relative h-[15px] w-[15px] rounded-full">
                                  <div
                                    ref={infoIconDiscountRef}
                                    className={`flex-center absolute left-0 top-0 h-[15px] w-[15px] rounded-full border border-solid border-[var(--color-bg-brand-f)] ${styles.animate_ping}`}
                                  ></div>
                                  <ImInfo className={`min-h-[15px] min-w-[15px] text-[var(--color-bg-brand-f)]`} />
                                </div>
                              )}
                            </div>

                            {!searchMode && isEditModeField !== "discount_amount" && !isInsertModeQuotation && (
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
                                    dispatch: setInputDiscountAmountEdit,
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

                            {/* ----------------- upsert ----------------- */}
                            {!searchMode && isInsertModeQuotation && (
                              <>
                                <input
                                  type="text"
                                  // placeholder="例：600万円 → 6000000　※半角で入力"
                                  className={`${styles.input_box} ${styles.upsert} ${
                                    selectedProductsArray?.length === 0 ? `${styles.uneditable_field}` : ``
                                  }`}
                                  // onCompositionStart={() => setIsComposing(true)}
                                  // onCompositionEnd={() => setIsComposing(false)}
                                  value={
                                    checkNotFalsyExcludeZero(inputDiscountAmountEdit) ? inputDiscountAmountEdit : ""
                                  }
                                  onChange={(e) => {
                                    // 商品リストが0の場合は先に商品を追加するように案内
                                    if (selectedProductsArray?.length === 0) {
                                      return alert("先に見積商品を追加してください。");
                                    }
                                    setInputDiscountAmountEdit(e.target.value);
                                  }}
                                  onFocus={() => {
                                    // 商品リストが存在しない、または、値引金額が0以外のfalsyならリターン
                                    if (
                                      selectedProductsArray?.length === 0 ||
                                      !checkNotFalsyExcludeZero(inputDiscountAmountEdit)
                                    ) {
                                      return;
                                    }
                                    // フォーカス時は数字と小数点以外除去
                                    setInputDiscountAmountEdit(inputDiscountAmountEdit.replace(/[^\d.]/g, ""));
                                  }}
                                  // onBlur={() => {
                                  //   setInputDiscountAmountEdit(
                                  //     !!inputDiscountAmountEdit &&
                                  //       inputDiscountAmountEdit !== "" &&
                                  //       convertToYen(inputDiscountAmountEdit.trim()) !== null
                                  //       ? (convertToYen(inputDiscountAmountEdit.trim()) as number).toLocaleString()
                                  //       : ""
                                  //   );
                                  // }}
                                  onBlur={() => {
                                    // 現在の価格合計
                                    const replacedTotalPrice = inputTotalPriceEdit.replace(/[^\d.]/g, "");
                                    // 商品リストが存在しない場合、価格合計が空文字の場合はリターンする
                                    if (
                                      selectedProductsArray?.length === 0 ||
                                      !checkNotFalsyExcludeZero(replacedTotalPrice)
                                    ) {
                                      return;
                                    }
                                    // 新たな値引金額
                                    const convertedDiscountPrice = checkNotFalsyExcludeZero(inputDiscountAmountEdit)
                                      ? convertToYen(inputDiscountAmountEdit.trim())
                                      : null;
                                    // 値引金額が合計金額を超えてたら値引金額と値引率を0にして合計金額を価格合計に合わせる
                                    if (Number(replacedTotalPrice || 0) < Number(convertedDiscountPrice || 0)) {
                                      setInputTotalAmountEdit(inputTotalPriceEdit);
                                      setInputDiscountAmountEdit("0");
                                      setInputDiscountRateEdit("0");
                                      return;
                                    }
                                    const newFormatDiscountAmount = formatDisplayPrice(convertedDiscountPrice || 0);
                                    setInputDiscountAmountEdit(newFormatDiscountAmount);

                                    // 合計金額を算出して更新
                                    const newTotalAmount = calculateTotalAmount(
                                      Number(replacedTotalPrice),
                                      Number(convertedDiscountPrice) || 0,
                                      language === "ja" ? 0 : 2
                                    );
                                    setInputTotalAmountEdit(newTotalAmount);

                                    // 値引率も同時に計算して更新する
                                    const result = calculateDiscountRate({
                                      salesPriceStr: inputTotalPriceEdit,
                                      discountPriceStr: (convertedDiscountPrice || 0).toString(),
                                      salesQuantityStr: "1",
                                      showPercentSign: false,
                                      decimalPlace: 2,
                                    });
                                    if (result.error) {
                                      toast.error(`エラー：${result.error}🙇‍♀️`);
                                      console.error("エラー：値引率の取得に失敗", result.error);
                                      setInputDiscountRateEdit("");
                                    } else if (result.discountRate) {
                                      const newDiscountRate = result.discountRate;
                                      setInputDiscountRateEdit(newDiscountRate);
                                    }
                                  }}
                                  onMouseEnter={(e) => {
                                    // scrollWidthがoffsetWidthを超えていればツールチップを表示
                                    const el = e.currentTarget;
                                    if (el.scrollWidth > el.offsetWidth) {
                                      handleOpenTooltip({
                                        e: e,
                                        display: "top",
                                        content: inputDiscountAmountEdit,
                                        // marginTop: 28,
                                        itemsPosition: "center",
                                      });
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (hoveredItemPosWrap) handleCloseTooltip();
                                  }}
                                />
                              </>
                            )}
                            {/* ----------------- upsert ----------------- */}

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
                                    checkNotFalsyExcludeZero(inputDiscountAmountEdit) ? inputDiscountAmountEdit : ""
                                  }
                                  onChange={(e) => setInputDiscountAmountEdit(e.target.value)}
                                  // onBlur={() => {
                                  //   setInputDiscountAmountEdit(
                                  //     !!inputDiscountAmountEdit &&
                                  //       inputDiscountAmountEdit !== "" &&
                                  //       convertToYen(inputDiscountAmountEdit.trim()) !== null
                                  //       ? (convertToYen(inputDiscountAmountEdit.trim()) as number).toLocaleString()
                                  //       : ""
                                  //   );
                                  // }}
                                  onKeyDown={(e) => {
                                    handleKeyDownUpdateField({
                                      e,
                                      fieldName: "discount_amount",
                                      fieldNameForSelectedRowData: "discount_amount",
                                      originalValue: originalValueFieldEdit.current,
                                      newValue: !!inputDiscountAmountEdit
                                        ? (convertToYen(inputDiscountAmountEdit.trim()) as number).toString()
                                        : null,
                                      id: selectedRowDataQuotation?.quotation_id,
                                      required: false,
                                    });
                                  }}
                                />
                                {/* 送信ボタンとクローズボタン */}
                                {!updateQuotationFieldMutation.isLoading && (
                                  <InputSendAndCloseBtnGlobal<string>
                                    inputState={inputDiscountAmountEdit}
                                    setInputState={setInputDiscountAmountEdit}
                                    onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                                      handleClickSendUpdateField({
                                        e,
                                        fieldName: "discount_amount",
                                        fieldNameForSelectedRowData: "discount_amount",
                                        originalValue: originalValueFieldEdit.current,
                                        newValue: inputDiscountAmountEdit
                                          ? (convertToYen(inputDiscountAmountEdit.trim()) as number).toString()
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
                            {/* <span className={`${styles.title} text-[12px]`}>値引率</span> */}
                            <div
                              className={`${styles.title} flex items-center`}
                              onMouseEnter={(e) => {
                                if (
                                  infoIconDiscountRateRef.current &&
                                  infoIconDiscountRateRef.current.classList.contains(styles.animate_ping)
                                ) {
                                  infoIconDiscountRateRef.current.classList.remove(styles.animate_ping);
                                }
                                handleOpenTooltip({
                                  e: e,
                                  display: "top",
                                  content: `価格合計と値引金額を入力することで`,
                                  content2: `値引率は自動で算出されます`,
                                  // content3: `ex) 入力: 20万円 -> 出力: 200000`,
                                  marginTop: 28,
                                  itemsPosition: "center",
                                });
                              }}
                              onMouseLeave={handleCloseTooltip}
                            >
                              <span className={`mr-[6px]`}>値引率</span>
                              {isInsertModeQuotation && (
                                <div className="flex-center relative h-[15px] w-[15px] rounded-full">
                                  <div
                                    ref={infoIconDiscountRateRef}
                                    className={`flex-center absolute left-0 top-0 h-[15px] w-[15px] rounded-full border border-solid border-[var(--color-bg-brand-f)] ${styles.animate_ping}`}
                                  ></div>
                                  <ImInfo className={`min-h-[15px] min-w-[15px] text-[var(--color-bg-brand-f)]`} />
                                </div>
                              )}
                            </div>

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

                            {/* ----------------- upsert ----------------- */}
                            {!searchMode && isInsertModeQuotation && (
                              <span className={`${styles.value}`}>
                                {inputDiscountRateEdit
                                  ? convertHalfWidthRoundNumOnly(inputDiscountRateEdit, 2) + "%"
                                  : ""}
                              </span>
                            )}
                            {/* ----------------- upsert ----------------- */}
                          </div>
                          <div className={`${styles.underline}`}></div>
                        </div>
                      </div>
                      {/*  */}

                      {/* 合計金額 */}
                      <div className={`${styles.row_area} flex w-full items-center`}>
                        <div className="flex h-full w-1/2 flex-col pr-[20px]">
                          <div className={`${styles.title_box} flex h-full items-center `}>
                            <span className={`${styles.title} text-[12px]`}>合計金額</span>
                            {!searchMode && isEditModeField !== "total_amount" && !isInsertModeQuotation && (
                              <span
                                className={`${styles.value} ${styles.editable_field}`}
                                onClick={handleSingleClickField}
                                onDoubleClick={(e) => {
                                  if (!checkNotFalsyExcludeZero(selectedRowDataQuotation?.total_amount)) return;
                                  // if (isNotActivityTypeArray.includes(selectedRowDataQuotation.total_amount))
                                  //   return alert(returnMessageNotActivity(selectedRowDataQuotation.total_amount));
                                  handleDoubleClickField({
                                    e,
                                    field: "total_amount",
                                    dispatch: setInputTotalAmountEdit,
                                  });
                                  if (hoveredItemPosWrap) handleCloseTooltip();
                                }}
                                data-text={`${
                                  selectedRowDataQuotation?.total_amount ? selectedRowDataQuotation?.total_amount : ""
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
                                {checkNotFalsyExcludeZero(selectedRowDataQuotation?.total_amount)
                                  ? Number(selectedRowDataQuotation?.total_amount).toLocaleString() + "円"
                                  : ""}
                              </span>
                            )}

                            {/* ----------------- upsert ----------------- */}
                            {!searchMode && isInsertModeQuotation && (
                              <span className={`${styles.value}`}>
                                {inputTotalAmountEdit ? formatDisplayPrice(inputTotalAmountEdit) : ""}
                              </span>
                            )}
                            {/* ----------------- upsert ----------------- */}

                            {/* ============= フィールドエディットモード関連 ============= */}
                            {/* フィールドエディットモード selectタグ  */}
                            {!searchMode && isEditModeField === "total_amount" && (
                              <>
                                <input
                                  type="text"
                                  autoFocus
                                  // placeholder="例：600万円 → 6000000　※半角で入力"
                                  className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                                  onCompositionStart={() => setIsComposing(true)}
                                  onCompositionEnd={() => setIsComposing(false)}
                                  value={checkNotFalsyExcludeZero(inputTotalAmountEdit) ? inputTotalAmountEdit : ""}
                                  onChange={(e) => {
                                    if (e.target.value === "0" || e.target.value === "０") {
                                      setInputTotalAmountEdit("0");
                                    }
                                    setInputTotalAmountEdit(e.target.value);
                                  }}
                                  // onBlur={() => {
                                  //   setInputTotalAmountEdit(
                                  //     !!inputTotalAmountEdit &&
                                  //       inputTotalAmountEdit !== "" &&
                                  //       convertToYen(inputTotalAmountEdit.trim()) !== null
                                  //       ? (convertToYen(inputTotalAmountEdit.trim()) as number).toLocaleString()
                                  //       : ""
                                  //   );
                                  // }}
                                  onKeyDown={(e) => {
                                    handleKeyDownUpdateField({
                                      e,
                                      fieldName: "total_amount",
                                      fieldNameForSelectedRowData: "total_amount",
                                      originalValue: originalValueFieldEdit.current,
                                      newValue: !!inputTotalAmountEdit
                                        ? (convertToYen(inputTotalAmountEdit.trim()) as number).toString()
                                        : null,
                                      id: selectedRowDataQuotation?.quotation_id,
                                      required: false,
                                    });
                                  }}
                                />
                                {/* 送信ボタンとクローズボタン */}
                                {!updateQuotationFieldMutation.isLoading && (
                                  <InputSendAndCloseBtnGlobal<string>
                                    inputState={inputTotalAmountEdit}
                                    setInputState={setInputTotalAmountEdit}
                                    onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                                      handleClickSendUpdateField({
                                        e,
                                        fieldName: "total_amount",
                                        fieldNameForSelectedRowData: "total_amount",
                                        originalValue: originalValueFieldEdit.current,
                                        newValue: inputTotalAmountEdit
                                          ? (convertToYen(inputTotalAmountEdit.trim()) as number).toString()
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
                            {!searchMode && isEditModeField === "total_amount" && (
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
                          <div className={`${styles.title_box} flex h-full items-center`}></div>
                          {/* <div className={`${styles.underline}`}></div> */}
                        </div>
                      </div>
                      {/*  */}

                      {/* 見積タイトル */}
                      <div className={`${styles.row_area} flex w-full items-center`}>
                        <div className="flex h-full w-full flex-col pr-[20px]">
                          <div className={`${styles.title_box} flex h-full items-center `}>
                            <span className={`${styles.title}`}>見積ﾀｲﾄﾙ</span>
                            {!searchMode && isEditModeField !== "quotation_title" && !isInsertModeQuotation && (
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

                            {/* ----------------- upsert ----------------- */}
                            {!searchMode && isInsertModeQuotation && (
                              <>
                                <input
                                  type="text"
                                  // placeholder=""
                                  // autoFocus
                                  className={`${styles.input_box} ${styles.upsert}`}
                                  value={inputQuotationTitle}
                                  onChange={(e) => setInputQuotationTitle(e.target.value)}
                                  onBlur={(e) => setInputQuotationTitle(inputQuotationTitle.trim())}
                                />
                              </>
                            )}
                            {/* ----------------- upsert ----------------- */}

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
                          {/* <div className={`${styles.underline}`}></div> */}
                          <div className={`${styles.section_underline}`}></div>
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

                            {/* ----------------- upsert ----------------- */}
                            {!searchMode && isInsertModeQuotation && (
                              <>
                                {selectedProductsArray?.length > 0 && (
                                  <span
                                    className={`${styles.value} truncate`}
                                    onMouseEnter={(e) => {
                                      // scrollWidthがoffsetWidthを超えていればツールチップを表示
                                      const el = e.currentTarget;
                                      if (el.scrollWidth > el.offsetWidth) {
                                        handleOpenTooltip({
                                          e: e,
                                          display: "top",
                                          content: getProductNamesAll(selectedProductsArray),
                                          // marginTop: 28,
                                          itemsPosition: "center",
                                        });
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (hoveredItemPosWrap) handleCloseTooltip();
                                    }}
                                  >
                                    {getProductNamesAll(selectedProductsArray)}
                                  </span>
                                )}
                              </>
                            )}
                            {/* ----------------- upsert ----------------- */}
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
                            {!searchMode && !isInsertModeQuotation && (
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

                            {/* ----------------- upsert ----------------- */}
                            {!searchMode && isInsertModeQuotation && (
                              <>
                                <select
                                  className={`ml-auto h-full w-full cursor-pointer ${styles.select_box} ${styles.upsert}`}
                                  value={memberObj.departmentId ? memberObj.departmentId : ""}
                                  onChange={(e) => {
                                    setMemberObj({ ...memberObj, departmentId: e.target.value });
                                    setIsOpenConfirmationModal("change_member");
                                  }}
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
                              </>
                            )}
                            {/* ----------------- upsert ----------------- */}
                          </div>
                          <div className={`${styles.underline}`}></div>
                        </div>
                        <div className="flex h-full w-1/2 flex-col pr-[20px]">
                          <div className={`${styles.title_box} flex h-full items-center`}>
                            <span className={`${styles.title} ${styles.min}`}>係・ﾁｰﾑ</span>
                            {!searchMode && !isInsertModeQuotation && (
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

                            {/* ----------------- upsert ----------------- */}
                            {!searchMode && isInsertModeQuotation && (
                              <>
                                <select
                                  className={`ml-auto h-full w-full cursor-pointer ${styles.select_box} ${styles.upsert}`}
                                  value={memberObj.unitId ? memberObj.unitId : ""}
                                  onChange={(e) => {
                                    setMemberObj({ ...memberObj, unitId: e.target.value });
                                    setIsOpenConfirmationModal("change_member");
                                  }}
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
                              </>
                            )}
                            {/* ----------------- upsert ----------------- */}
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
                            {!searchMode && !isInsertModeQuotation && (
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

                            {/* ----------------- upsert ----------------- */}
                            {!searchMode && isInsertModeQuotation && (
                              <>
                                <select
                                  className={`ml-auto h-full w-full cursor-pointer ${styles.select_box} ${styles.upsert}`}
                                  value={memberObj.officeId ? memberObj.officeId : ""}
                                  onChange={(e) => {
                                    setMemberObj({ ...memberObj, officeId: e.target.value });
                                    setIsOpenConfirmationModal("change_member");
                                  }}
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
                              </>
                            )}
                            {/* ----------------- upsert ----------------- */}
                          </div>
                          <div className={`${styles.underline}`}></div>
                        </div>
                        <div className="flex h-full w-1/2 flex-col pr-[20px]">
                          <div className={`${styles.title_box} flex h-full items-center`}>
                            <span className={`${styles.title}`}>自社担当</span>
                            {!searchMode && !isInsertModeQuotation && (
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

                            {/* ----------------- upsert ----------------- */}
                            {!searchMode && isInsertModeQuotation && (
                              <>
                                <input
                                  type="text"
                                  placeholder="*入力必須"
                                  required
                                  className={`${styles.input_box} ${styles.upsert}`}
                                  value={memberObj.memberName ? memberObj.memberName : ""}
                                  onChange={(e) => {
                                    setMemberObj({ ...memberObj, memberName: e.target.value });
                                  }}
                                  onKeyUp={() => {
                                    if (prevMemberObj.memberName !== memberObj.memberName) {
                                      setIsOpenConfirmationModal("change_member");
                                      return;
                                    }
                                  }}
                                  onBlur={() => {
                                    if (!memberObj.memberName) return;
                                    setMemberObj({
                                      ...memberObj,
                                      memberName: toHalfWidthAndSpace(memberObj.memberName.trim()),
                                    });
                                  }}
                                />
                              </>
                            )}
                            {/* ----------------- upsert ----------------- */}
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
                            {!searchMode && !isInsertModeQuotation && (
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

                            {/* ----------------- upsert ----------------- */}
                            {!searchMode && isInsertModeQuotation && !memberObjInCharge.signature_stamp_id && (
                              <>
                                <div className="flex-center w-full">
                                  <RippleButton
                                    title={`追加`}
                                    classText="select-none"
                                    borderRadius="6px"
                                    clickEventHandler={() => {
                                      setIsOpenSearchMemberSideTableBefore(true);
                                      setTimeout(() => {
                                        setIsOpenSearchMemberSideTable(true);
                                      }, 100);
                                      setSideTableState("inCharge");
                                    }}
                                    onMouseEnterHandler={(e) =>
                                      handleOpenTooltip({
                                        e: e,
                                        display: "top",
                                        content: `担当印を追加`,
                                        // content2: `直近売れ先の仕入れ先や、売れ先と同じ取引先を持つ同業他社で導入実績が響く会社など`,
                                        // marginTop: 48,
                                        // marginTop: 28,
                                        marginTop: 9,
                                      })
                                    }
                                    onMouseLeaveHandler={handleCloseTooltip}
                                  />
                                </div>
                              </>
                            )}
                            {!searchMode && isInsertModeQuotation && memberObjInCharge.signature_stamp_id && (
                              <div className="flex w-full items-center">
                                <span className={`${styles.value} truncate`}>
                                  {memberObjInCharge.memberName &&
                                  memberObjInCharge.signature_stamp_id &&
                                  memberObjInCharge.signature_stamp_url
                                    ? memberObjInCharge.memberName
                                    : `未設定`}
                                </span>

                                <div
                                  className={`${styles.icon_path_stroke} ${
                                    styles.icon_btn
                                  } flex-center transition-bg03 ml-auto ${
                                    isOpenInChargeMenu ? `pointer-events-none` : ``
                                  }`}
                                  onMouseEnter={(e) => {
                                    if (isOpenInChargeMenu) return;
                                    handleOpenTooltip({
                                      e: e,
                                      display: "top",
                                      content: "データ印を変更",
                                      // content2: "フィルターの切り替えが可能です。",
                                      // marginTop: 57,
                                      // marginTop: 38,
                                      marginTop: 6,
                                      itemsPosition: "center",
                                      whiteSpace: "nowrap",
                                    });
                                  }}
                                  onMouseLeave={() => {
                                    if (hoveredItemPosWrap) handleCloseTooltip();
                                  }}
                                  onClick={() => {
                                    if (!memberObjInCharge) return;
                                    if (isOpenInChargeMenu) return;
                                    setIsOpenInChargeMenu(true);
                                    if (hoveredItemPosWrap) handleCloseTooltip();
                                  }}
                                >
                                  <GrPowerReset />
                                </div>
                                {isOpenInChargeMenu && (
                                  <>
                                    <div
                                      className="fixed left-0 top-0 z-[2000] h-full w-full bg-[#00000000]"
                                      onClick={() => setIsOpenInChargeMenu(false)}
                                    ></div>
                                    <div
                                      className={`border-real-with-shadow-dark fade03 space-x-[20px] ${styles.update_stamp_menu}`}
                                    >
                                      <div
                                        className={`${styles.menu_btn} transition-bg01 flex-center bg-[var(--setting-side-bg-select)]  text-[var(--color-text-title)]  hover:bg-[var(--setting-side-bg-select-hover)]`}
                                        onClick={() => {
                                          setPrevMemberObjInCharge(initialMemberNullObj);
                                          setMemberObjInCharge(initialMemberNullObj);
                                          setIsOpenInChargeMenu(false);
                                          if (checkboxInChargeFlagEdit) setCheckboxInChargeFlagEdit(false);
                                        }}
                                      >
                                        <span>削除</span>
                                      </div>
                                      <div
                                        className={`${styles.menu_btn} transition-bg01 flex-center bg-[var(--color-bg-brand-f)] text-[#fff] hover:bg-[var(--color-bg-brand-f-hover)]`}
                                        onClick={() => {
                                          // setIsOpenSearchMemberSideTable(true);
                                          setIsOpenSearchMemberSideTableBefore(true);
                                          setTimeout(() => {
                                            setIsOpenSearchMemberSideTable(true);
                                          }, 100);
                                          setSideTableState("inCharge");
                                          const currentMemberObj = {
                                            memberId: memberObjInCharge.memberId,
                                            memberName: memberObjInCharge?.memberName ?? null,
                                            departmentId: memberObjInCharge?.departmentId ?? null,
                                            unitId: memberObjInCharge?.unitId ?? null,
                                            officeId: memberObjInCharge?.officeId ?? null,
                                            signature_stamp_id: memberObjInCharge?.signature_stamp_id ?? null,
                                            signature_stamp_url: memberObjInCharge?.signature_stamp_url ?? null,
                                          };
                                          setMemberObj(currentMemberObj);
                                          setPrevMemberObj(currentMemberObj);
                                          setIsOpenInChargeMenu(false);
                                        }}
                                      >
                                        <span>変更</span>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                            {/* ----------------- upsert ----------------- */}
                          </div>
                          <div className={`${styles.underline}`}></div>
                        </div>
                        <div className="flex h-full w-1/2 flex-col pr-[20px]">
                          <div className={`${styles.title_box} flex h-full items-center`}>
                            <span className={`${styles.check_title} ${styles.single_text}`}>印字</span>

                            {!searchMode && !isInsertModeQuotation && (
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
                                  checked={checkboxInChargeFlag}
                                  onChange={async (e) => {
                                    if (!selectedRowDataQuotation) return;
                                    // 個別にチェックボックスを更新するルート
                                    if (!selectedRowDataQuotation?.quotation_id)
                                      return toast.error(`データが見つかりませんでした🙇‍♀️`);

                                    console.log(
                                      "チェック 新しい値",
                                      !checkboxInChargeFlag,
                                      "オリジナル",
                                      selectedRowDataQuotation?.in_charge_stamp_flag
                                    );
                                    if (!checkboxInChargeFlag === selectedRowDataQuotation?.in_charge_stamp_flag) {
                                      toast.error(`アップデートに失敗しました🤦‍♀️`);
                                      return;
                                    }
                                    const updatePayload = {
                                      fieldName: "in_charge_stamp_flag",
                                      fieldNameForSelectedRowData: "in_charge_stamp_flag" as "in_charge_stamp_flag",
                                      newValue: !checkboxInChargeFlag,
                                      id: selectedRowDataQuotation.quotation_id,
                                    };
                                    // 直感的にするためにmutateにして非同期処理のまま後続のローカルのチェックボックスを更新する
                                    updateQuotationFieldMutation.mutate(updatePayload);
                                    setCheckboxInChargeFlag(!checkboxInChargeFlag);
                                  }}
                                />
                                <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                                </svg>
                              </div>
                            )}

                            {/* ----------------- upsert ----------------- */}
                            {!searchMode && isInsertModeQuotation && (
                              <div className={`${styles.grid_select_cell_header} `}>
                                <input
                                  type="checkbox"
                                  className={`${styles.grid_select_cell_header_input} ${
                                    !memberObjInCharge.signature_stamp_id
                                      ? `pointer-events-none cursor-not-allowed`
                                      : ``
                                  }`}
                                  checked={checkboxInChargeFlagEdit}
                                  onChange={async (e) => {
                                    if (!memberObjInCharge.signature_stamp_id) return;
                                    setCheckboxInChargeFlagEdit(!checkboxInChargeFlagEdit);
                                  }}
                                />
                                <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                                </svg>
                              </div>
                            )}
                            {/* ----------------- upsert ----------------- */}
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

                            {/* ----------------- upsert ----------------- */}
                            {!searchMode && isInsertModeQuotation && !memberObjSupervisor1.signature_stamp_id && (
                              <>
                                <div className="flex-center w-full">
                                  <RippleButton
                                    title={`追加`}
                                    classText="select-none"
                                    borderRadius="6px"
                                    clickEventHandler={() => {
                                      // setIsOpenSearchMemberSideTable(true);
                                      setIsOpenSearchMemberSideTableBefore(true);
                                      setTimeout(() => {
                                        setIsOpenSearchMemberSideTable(true);
                                      }, 100);
                                      setSideTableState("supervisor1");
                                    }}
                                    onMouseEnterHandler={(e) =>
                                      handleOpenTooltip({
                                        e: e,
                                        display: "top",
                                        content: `上長印を追加`,
                                        // content2: `直近売れ先の仕入れ先や、売れ先と同じ取引先を持つ同業他社で導入実績が響く会社など`,
                                        // marginTop: 48,
                                        // marginTop: 28,
                                        marginTop: 9,
                                      })
                                    }
                                    onMouseLeaveHandler={handleCloseTooltip}
                                  />
                                </div>
                              </>
                            )}

                            {!searchMode && isInsertModeQuotation && memberObjSupervisor1.signature_stamp_id && (
                              <div className="flex w-full items-center">
                                <span className={`${styles.value} truncate`}>
                                  {memberObjSupervisor1.memberName &&
                                  memberObjSupervisor1.signature_stamp_id &&
                                  memberObjSupervisor1.signature_stamp_url
                                    ? memberObjSupervisor1.memberName
                                    : `未設定`}
                                </span>

                                <div
                                  className={`${styles.icon_path_stroke} ${
                                    styles.icon_btn
                                  } flex-center transition-bg03 ml-auto ${
                                    isOpenSupervisor1Menu ? `pointer-events-none` : ``
                                  }`}
                                  onMouseEnter={(e) => {
                                    if (isOpenSupervisor1Menu) return;
                                    handleOpenTooltip({
                                      e: e,
                                      display: "top",
                                      content: "データ印を変更",
                                      // content2: "フィルターの切り替えが可能です。",
                                      // marginTop: 57,
                                      // marginTop: 38,
                                      marginTop: 6,
                                      itemsPosition: "center",
                                      whiteSpace: "nowrap",
                                    });
                                  }}
                                  onMouseLeave={() => {
                                    if (hoveredItemPosWrap) handleCloseTooltip();
                                  }}
                                  onClick={() => {
                                    if (!memberObjSupervisor1) return;
                                    if (isOpenSupervisor1Menu) return;
                                    setIsOpenSupervisor1Menu(true);
                                    if (hoveredItemPosWrap) handleCloseTooltip();
                                  }}
                                >
                                  <GrPowerReset />
                                </div>
                                {isOpenSupervisor1Menu && (
                                  <>
                                    <div
                                      className="fixed left-0 top-0 z-[2000] h-full w-full bg-[#00000000]"
                                      onClick={() => setIsOpenSupervisor1Menu(false)}
                                    ></div>
                                    <div
                                      className={`border-real-with-shadow-dark fade03 space-x-[20px] ${styles.update_stamp_menu}`}
                                    >
                                      <div
                                        className={`${styles.menu_btn} transition-bg01 flex-center bg-[var(--setting-side-bg-select)]  text-[var(--color-text-title)]  hover:bg-[var(--setting-side-bg-select-hover)]`}
                                        onClick={() => {
                                          setPrevMemberObjSupervisor1(initialMemberNullObj);
                                          setMemberObjSupervisor1(initialMemberNullObj);
                                          setIsOpenSupervisor1Menu(false);
                                          if (checkboxSupervisor1FlagEdit) setCheckboxSupervisor1FlagEdit(false);
                                        }}
                                      >
                                        <span>削除</span>
                                      </div>
                                      <div
                                        className={`${styles.menu_btn} transition-bg01 flex-center bg-[var(--color-bg-brand-f)] text-[#fff] hover:bg-[var(--color-bg-brand-f-hover)]`}
                                        onClick={() => {
                                          // setIsOpenSearchMemberSideTable(true);
                                          setIsOpenSearchMemberSideTableBefore(true);
                                          setTimeout(() => {
                                            setIsOpenSearchMemberSideTable(true);
                                          }, 100);
                                          setSideTableState("supervisor1");
                                          const currentMemberObj = {
                                            memberId: memberObjSupervisor1.memberId,
                                            memberName: memberObjSupervisor1?.memberName ?? null,
                                            departmentId: memberObjSupervisor1?.departmentId ?? null,
                                            unitId: memberObjSupervisor1?.unitId ?? null,
                                            officeId: memberObjSupervisor1?.officeId ?? null,
                                            signature_stamp_id: memberObjSupervisor1?.signature_stamp_id ?? null,
                                            signature_stamp_url: memberObjSupervisor1?.signature_stamp_url ?? null,
                                          };
                                          setMemberObj(currentMemberObj);
                                          setPrevMemberObj(currentMemberObj);
                                          setIsOpenSupervisor1Menu(false);
                                        }}
                                      >
                                        <span>変更</span>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                            {/* ----------------- upsert ----------------- */}
                          </div>
                          <div className={`${styles.underline}`}></div>
                        </div>
                        <div className="flex h-full w-1/2 flex-col pr-[20px]">
                          <div className={`${styles.title_box} flex h-full items-center`}>
                            <span className={`${styles.check_title} ${styles.single_text}`}>印字</span>

                            {!searchMode && !isInsertModeQuotation && (
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
                                    !selectedRowDataQuotation || !memberObjSupervisor1.departmentId
                                      ? `pointer-events-none cursor-not-allowed`
                                      : ``
                                  }`}
                                  checked={checkboxSupervisor1Flag}
                                  onChange={async (e) => {
                                    if (!selectedRowDataQuotation) return;
                                    // 個別にチェックボックスを更新するルート
                                    if (!selectedRowDataQuotation?.quotation_id)
                                      return toast.error(`データが見つかりませんでした🙇‍♀️`);

                                    console.log(
                                      "チェック 新しい値",
                                      !checkboxSupervisor1Flag,
                                      "オリジナル",
                                      selectedRowDataQuotation?.supervisor1_stamp_flag
                                    );
                                    if (!checkboxSupervisor1Flag === selectedRowDataQuotation?.supervisor1_stamp_flag) {
                                      toast.error(`アップデートに失敗しました🤦‍♀️`);
                                      return;
                                    }
                                    const updatePayload = {
                                      fieldName: "supervisor1_stamp_flag",
                                      fieldNameForSelectedRowData: "supervisor1_stamp_flag" as "supervisor1_stamp_flag",
                                      newValue: !checkboxSupervisor1Flag,
                                      id: selectedRowDataQuotation.quotation_id,
                                    };
                                    // 直感的にするためにmutateにして非同期処理のまま後続のローカルのチェックボックスを更新する
                                    updateQuotationFieldMutation.mutate(updatePayload);
                                    setCheckboxSupervisor1Flag(!checkboxSupervisor1Flag);
                                  }}
                                />
                                <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                                </svg>
                              </div>
                            )}

                            {/* ----------------- upsert ----------------- */}
                            {!searchMode && isInsertModeQuotation && (
                              <div className={`${styles.grid_select_cell_header} `}>
                                <input
                                  type="checkbox"
                                  className={`${styles.grid_select_cell_header_input} ${
                                    !memberObjSupervisor1.signature_stamp_id
                                      ? `pointer-events-none cursor-not-allowed`
                                      : ``
                                  }`}
                                  checked={checkboxSupervisor1FlagEdit}
                                  onChange={async (e) => {
                                    if (!memberObjSupervisor1.signature_stamp_id) return;
                                    setCheckboxSupervisor1FlagEdit(!checkboxSupervisor1FlagEdit);
                                  }}
                                />
                                <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                                </svg>
                              </div>
                            )}
                            {/* ----------------- upsert ----------------- */}
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

                            {/* ----------------- upsert ----------------- */}
                            {!searchMode && isInsertModeQuotation && !memberObjSupervisor2.signature_stamp_id && (
                              <>
                                <div className="flex-center w-full">
                                  <RippleButton
                                    title={`追加`}
                                    classText="select-none"
                                    borderRadius="6px"
                                    clickEventHandler={() => {
                                      // setIsOpenSearchMemberSideTable(true);
                                      setIsOpenSearchMemberSideTableBefore(true);
                                      setTimeout(() => {
                                        setIsOpenSearchMemberSideTable(true);
                                      }, 100);
                                      setSideTableState("supervisor2");
                                    }}
                                    onMouseEnterHandler={(e) =>
                                      handleOpenTooltip({
                                        e: e,
                                        display: "top",
                                        content: `上長印を追加`,
                                        // content2: `直近売れ先の仕入れ先や、売れ先と同じ取引先を持つ同業他社で導入実績が響く会社など`,
                                        // marginTop: 48,
                                        // marginTop: 28,
                                        marginTop: 9,
                                      })
                                    }
                                    onMouseLeaveHandler={handleCloseTooltip}
                                  />
                                </div>
                              </>
                            )}

                            {!searchMode && isInsertModeQuotation && memberObjSupervisor2.signature_stamp_id && (
                              <div className="flex w-full items-center">
                                <span className={`${styles.value} truncate`}>
                                  {memberObjSupervisor2.memberName &&
                                  memberObjSupervisor2.signature_stamp_id &&
                                  memberObjSupervisor2.signature_stamp_url
                                    ? memberObjSupervisor2.memberName
                                    : `未設定`}
                                </span>

                                <div
                                  className={`${styles.icon_path_stroke} ${
                                    styles.icon_btn
                                  } flex-center transition-bg03 ml-auto ${
                                    isOpenSupervisor2Menu ? `pointer-events-none` : ``
                                  }`}
                                  onMouseEnter={(e) => {
                                    if (isOpenSupervisor2Menu) return;
                                    handleOpenTooltip({
                                      e: e,
                                      display: "top",
                                      content: "データ印を変更",
                                      // content2: "フィルターの切り替えが可能です。",
                                      // marginTop: 57,
                                      // marginTop: 38,
                                      marginTop: 6,
                                      itemsPosition: "center",
                                      whiteSpace: "nowrap",
                                    });
                                  }}
                                  onMouseLeave={() => {
                                    if (hoveredItemPosWrap) handleCloseTooltip();
                                  }}
                                  onClick={() => {
                                    if (!memberObjSupervisor2) return;
                                    if (isOpenSupervisor2Menu) return;
                                    setIsOpenSupervisor2Menu(true);
                                    if (hoveredItemPosWrap) handleCloseTooltip();
                                  }}
                                >
                                  <GrPowerReset />
                                </div>
                                {isOpenSupervisor2Menu && (
                                  <>
                                    <div
                                      className="fixed left-0 top-0 z-[2000] h-full w-full bg-[#00000000]"
                                      onClick={() => setIsOpenSupervisor2Menu(false)}
                                    ></div>
                                    <div
                                      className={`border-real-with-shadow-dark fade03 space-x-[20px] ${styles.update_stamp_menu}`}
                                    >
                                      <div
                                        className={`${styles.menu_btn} transition-bg01 flex-center bg-[var(--setting-side-bg-select)]  text-[var(--color-text-title)]  hover:bg-[var(--setting-side-bg-select-hover)]`}
                                        onClick={() => {
                                          setPrevMemberObjSupervisor2(initialMemberNullObj);
                                          setMemberObjSupervisor2(initialMemberNullObj);
                                          setIsOpenSupervisor2Menu(false);
                                          if (checkboxSupervisor2FlagEdit) setCheckboxSupervisor2FlagEdit(false);
                                        }}
                                      >
                                        <span>削除</span>
                                      </div>
                                      <div
                                        className={`${styles.menu_btn} transition-bg01 flex-center bg-[var(--color-bg-brand-f)] text-[#fff] hover:bg-[var(--color-bg-brand-f-hover)]`}
                                        onClick={() => {
                                          // setIsOpenSearchMemberSideTable(true);
                                          setIsOpenSearchMemberSideTableBefore(true);
                                          setTimeout(() => {
                                            setIsOpenSearchMemberSideTable(true);
                                          }, 100);
                                          setSideTableState("supervisor2");
                                          const currentMemberObj = {
                                            memberId: memberObjSupervisor2.memberId,
                                            memberName: memberObjSupervisor2?.memberName ?? null,
                                            departmentId: memberObjSupervisor2?.departmentId ?? null,
                                            unitId: memberObjSupervisor2?.unitId ?? null,
                                            officeId: memberObjSupervisor2?.officeId ?? null,
                                            signature_stamp_id: memberObjSupervisor2?.signature_stamp_id ?? null,
                                            signature_stamp_url: memberObjSupervisor2?.signature_stamp_url ?? null,
                                          };
                                          setMemberObj(currentMemberObj);
                                          setPrevMemberObj(currentMemberObj);
                                          setIsOpenSupervisor2Menu(false);
                                        }}
                                      >
                                        <span>変更</span>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                            {/* ----------------- upsert ----------------- */}
                          </div>
                          <div className={`${styles.underline}`}></div>
                        </div>
                        <div className="flex h-full w-1/2 flex-col pr-[20px]">
                          <div className={`${styles.title_box} flex h-full items-center`}>
                            <span className={`${styles.check_title} ${styles.single_text}`}>印字</span>

                            {!searchMode && !isInsertModeQuotation && (
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
                                    !selectedRowDataQuotation || !memberObjSupervisor2.signature_stamp_id
                                      ? `pointer-events-none cursor-not-allowed`
                                      : ``
                                  }`}
                                  checked={checkboxSupervisor2Flag}
                                  onChange={async (e) => {
                                    if (!selectedRowDataQuotation) return;
                                    // 個別にチェックボックスを更新するルート
                                    if (!selectedRowDataQuotation?.quotation_id)
                                      return toast.error(`データが見つかりませんでした🙇‍♀️`);

                                    console.log(
                                      "チェック 新しい値",
                                      !checkboxSupervisor2Flag,
                                      "オリジナル",
                                      selectedRowDataQuotation?.supervisor1_stamp_flag
                                    );
                                    if (!checkboxSupervisor2Flag === selectedRowDataQuotation?.supervisor1_stamp_flag) {
                                      toast.error(`アップデートに失敗しました🤦‍♀️`);
                                      return;
                                    }
                                    const updatePayload = {
                                      fieldName: "supervisor1_stamp_flag",
                                      fieldNameForSelectedRowData: "supervisor1_stamp_flag" as "supervisor1_stamp_flag",
                                      newValue: !checkboxSupervisor2Flag,
                                      id: selectedRowDataQuotation.quotation_id,
                                    };
                                    // 直感的にするためにmutateにして非同期処理のまま後続のローカルのチェックボックスを更新する
                                    updateQuotationFieldMutation.mutate(updatePayload);
                                    setCheckboxSupervisor2Flag(!checkboxSupervisor2Flag);
                                  }}
                                />
                                <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                                </svg>
                              </div>
                            )}

                            {/* ----------------- upsert ----------------- */}
                            {!searchMode && isInsertModeQuotation && (
                              <div className={`${styles.grid_select_cell_header} `}>
                                <input
                                  type="checkbox"
                                  className={`${styles.grid_select_cell_header_input} ${
                                    !memberObjSupervisor2.signature_stamp_id
                                      ? `pointer-events-none cursor-not-allowed`
                                      : ``
                                  }`}
                                  checked={checkboxSupervisor2FlagEdit}
                                  onChange={async (e) => {
                                    if (!memberObjSupervisor2.signature_stamp_id) return;
                                    setCheckboxSupervisor2FlagEdit(!checkboxSupervisor2FlagEdit);
                                  }}
                                />
                                <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                                </svg>
                              </div>
                            )}
                            {/* ----------------- upsert ----------------- */}
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
                            {!searchMode && isEditModeField !== "quotation_remarks" && !isInsertModeQuotation && (
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

                            {/* ----------------- upsert ----------------- */}
                            {!searchMode && isInsertModeQuotation && (
                              <>
                                <textarea
                                  cols={30}
                                  // rows={10}
                                  placeholder=""
                                  style={{ whiteSpace: "pre-wrap" }}
                                  className={`${styles.textarea_box} ${styles.md} ${styles.upsert}`}
                                  value={inputQuotationRemarks}
                                  onChange={(e) => setInputQuotationRemarks(e.target.value)}
                                ></textarea>
                              </>
                            )}

                            {/* ----------------- upsert ----------------- */}

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

                      {/* セット見積り・リース見積り */}
                      <div className={`${styles.row_area} flex w-full items-center`}>
                        <div className="flex h-full w-1/2 flex-col pr-[20px]">
                          <div className={`${styles.title_box} flex h-full items-center `}>
                            <span className={`${styles.title}`}>セット見積り</span>
                          </div>
                          {/* <div className={`${styles.underline}`}></div> */}
                          <div className={`${styles.section_underline}`}></div>
                        </div>
                        {/* リース見積り */}
                        <div className="flex h-full w-1/2 flex-col pr-[20px]">
                          <div className={`${styles.title_box} flex h-full items-center`}>
                            <span className={`${styles.title}`}>リース見積り</span>
                          </div>
                          {/* <div className={`${styles.underline}`}></div> */}
                          <div className={`${styles.section_underline}`}></div>
                        </div>
                      </div>
                      {/*  */}

                      {/* セット数・期間 */}
                      <div className={`${styles.row_area} flex w-full items-center`}>
                        <div className="flex h-full w-1/2 flex-col pr-[20px]">
                          <div className={`${styles.title_box} flex h-full items-center `}>
                            <span className={`${styles.title}`}>セット数</span>
                            {!searchMode && isEditModeField !== "set_item_count" && !isInsertModeQuotation && (
                              <span
                                className={`${styles.value} ${styles.editable_field}`}
                                onClick={handleSingleClickField}
                                onDoubleClick={(e) => {
                                  if (!selectedRowDataQuotation?.set_item_count) return;
                                  handleDoubleClickField({
                                    e,
                                    field: "set_item_count",
                                    dispatch: setInputSetItemCountEdit,
                                  });
                                  if (hoveredItemPosWrap) handleCloseTooltip();
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                                  // if (!isDesktopGTE1600) handleOpenTooltip(e);
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                                  // if (!isDesktopGTE1600 || hoveredItemPosWrap) handleCloseTooltip();
                                }}
                              >
                                {selectedRowDataQuotation?.quotation_division === "set" &&
                                selectedRowDataQuotation?.set_item_count
                                  ? selectedRowDataQuotation?.set_item_count
                                  : ""}
                              </span>
                            )}

                            {/* ----------------- upsert ----------------- */}
                            {!searchMode && isInsertModeQuotation && inputQuotationDivisionEdit === "set" && (
                              <>
                                <input
                                  type="number"
                                  min="1"
                                  className={`${styles.input_box} ${styles.upsert}`}
                                  // onCompositionStart={() => setIsComposing(true)}
                                  // onCompositionEnd={() => setIsComposing(false)}
                                  value={inputSetItemCountEdit ? inputSetItemCountEdit : ""}
                                  // onChange={(e) => setInputSetItemCountEdit(e.target.value)}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "" || val === "0" || val === "０") {
                                      setInputSetItemCountEdit(null);
                                    } else {
                                      const numValue = Number(val);

                                      // 入力値がマイナスかチェック
                                      if (numValue < 1) {
                                        setInputSetItemCountEdit(1); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                                      } else {
                                        setInputSetItemCountEdit(numValue);
                                      }
                                    }
                                  }}
                                />
                                {/* <input
                                  type="text"
                                  // placeholder="例：600万円 → 6000000　※半角で入力"
                                  className={`${styles.input_box} ${styles.upsert}`}
                                  onCompositionStart={() => setIsComposing(true)}
                                  onCompositionEnd={() => setIsComposing(false)}
                                  value={inputSetItemCountEdit ? inputSetItemCountEdit : ""}
                                  // onChange={(e) => setInputSetItemCountEdit(e.target.value)}
                                  onChange={(e) => {
                                    if (e.target.value === "0" || e.target.value === "０") {
                                      if (inputSetItemCountEdit === "0" || inputSetItemCountEdit === "０")
                                        setInputSetItemCountEdit("");
                                      return;
                                    }
                                    setInputSetItemCountEdit(e.target.value);
                                  }}
                                  onBlur={(e) => {
                                    if (
                                      !inputSetItemCountEdit ||
                                      inputSetItemCountEdit === "" ||
                                      inputSetItemCountEdit === "0" ||
                                      e.target.value === "０"
                                    )
                                      return setInputSetItemCountEdit("");
                                    const converted = convertHalfWidthRoundNumOnly(inputSetItemCountEdit.trim());
                                    if (converted === null) return setInputSetItemCountEdit("");
                                    setInputSetItemCountEdit(converted);
                                  }}
                                /> */}
                              </>
                            )}
                            {/* ----------------- upsert ----------------- */}

                            {/* ============= フィールドエディットモード関連 ============= */}
                            {/* フィールドエディットモード selectタグ  */}
                            {!searchMode && isEditModeField === "set_item_count" && (
                              <>
                                <input
                                  // type="text"
                                  // placeholder=""
                                  type="number"
                                  min="1"
                                  className={`${styles.input_box}`}
                                  onCompositionStart={() => setIsComposing(true)}
                                  onCompositionEnd={() => setIsComposing(false)}
                                  value={!!inputSetItemCountEdit ? inputSetItemCountEdit : ""}
                                  // onChange={(e) => {
                                  //   if (e.target.value === "0" || e.target.value === "０") {
                                  //     if (inputSetItemCountEdit === "0" || inputSetItemCountEdit === "０")
                                  //       setInputSetItemCountEdit("");
                                  //     return;
                                  //   }
                                  //   setInputSetItemCountEdit(e.target.value);
                                  // }}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "" || val === "0" || val === "０") {
                                      setInputSetItemCountEdit(null);
                                    } else {
                                      const numValue = Number(val);

                                      // 入力値がマイナスかチェック
                                      if (numValue < 1) {
                                        setInputSetItemCountEdit(1); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                                      } else {
                                        setInputSetItemCountEdit(numValue);
                                      }
                                    }
                                  }}
                                  // onBlur={(e) => {
                                  //   if (
                                  //     !inputSetItemCountEdit ||
                                  //     inputSetItemCountEdit === "" ||
                                  //     inputSetItemCountEdit === "0" ||
                                  //     e.target.value === "０"
                                  //   )
                                  //     return setInputSetItemCountEdit("");
                                  //   const converted = convertHalfWidthRoundNumOnly(inputSetItemCountEdit.trim());
                                  //   if (converted === null) return setInputSetItemCountEdit("");
                                  //   setInputSetItemCountEdit(converted);
                                  // }}
                                  onKeyDown={(e) => {
                                    if (!inputSetItemCountEdit) {
                                      return setInputSetItemCountEdit(null);
                                    }
                                    const converted = inputSetItemCountEdit
                                      ? convertHalfWidthRoundNumOnly(inputSetItemCountEdit.toString().trim())
                                      : null;
                                    if (converted === null) return setInputSetItemCountEdit(null);
                                    setInputSetItemCountEdit(Number(converted));
                                    handleKeyDownUpdateField({
                                      e,
                                      fieldName: "set_item_count",
                                      fieldNameForSelectedRowData: "set_item_count",
                                      originalValue: originalValueFieldEdit.current,
                                      // newValue: inputSetItemCountEdit,
                                      newValue: converted,
                                      id: selectedRowDataQuotation?.quotation_id,
                                      required: false,
                                    });
                                  }}
                                  // onKeyDown={(e) => {
                                  //   if (
                                  //     !inputSetItemCountEdit ||
                                  //     inputSetItemCountEdit === "" ||
                                  //     inputSetItemCountEdit === "0" ||
                                  //     inputSetItemCountEdit === "０"
                                  //   ) {
                                  //     return setInputSetItemCountEdit("");
                                  //   }
                                  //   const converted = convertHalfWidthRoundNumOnly(inputSetItemCountEdit.trim());
                                  //   if (converted === null) return setInputSetItemCountEdit("");
                                  //   setInputSetItemCountEdit(converted);
                                  //   handleKeyDownUpdateField({
                                  //     e,
                                  //     fieldName: "set_item_count",
                                  //     fieldNameForSelectedRowData: "set_item_count",
                                  //     originalValue: originalValueFieldEdit.current,
                                  //     // newValue: inputSetItemCountEdit,
                                  //     newValue: converted,
                                  //     id: selectedRowDataQuotation?.quotation_id,
                                  //     required: false,
                                  //   });
                                  // }}
                                />
                                {/* 送信ボタンとクローズボタン */}
                                {!updateQuotationFieldMutation.isLoading && (
                                  <InputSendAndCloseBtn<number | null>
                                    inputState={inputSetItemCountEdit}
                                    setInputState={setInputSetItemCountEdit}
                                    onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                                      if (!inputSetItemCountEdit) {
                                        return setInputSetItemCountEdit(null);
                                      }
                                      const converted = inputSetItemCountEdit
                                        ? convertHalfWidthRoundNumOnly(inputSetItemCountEdit.toString().trim())
                                        : null;
                                      if (converted === null) return setInputSetItemCountEdit(null);
                                      setInputSetItemCountEdit(Number(converted));
                                      handleClickSendUpdateField({
                                        e,
                                        fieldName: "set_item_count",
                                        fieldNameForSelectedRowData: "set_item_count",
                                        originalValue: originalValueFieldEdit.current,
                                        // newValue: inputSetItemCountEdit,
                                        newValue: converted,
                                        id: selectedRowDataQuotation?.quotation_id,
                                        required: false,
                                      });
                                    }}
                                    required={false}
                                    isDisplayClose={false}
                                  />
                                )}
                                {/* onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                                      if (
                                        !inputSetItemCountEdit ||
                                        inputSetItemCountEdit === "" ||
                                        inputSetItemCountEdit === "0" ||
                                        inputSetItemCountEdit === "０"
                                      ) {
                                        return setInputSetItemCountEdit("");
                                      }
                                      const converted = convertHalfWidthRoundNumOnly(inputSetItemCountEdit.trim());
                                      if (converted === null) return setInputSetItemCountEdit("");
                                      setInputSetItemCountEdit(converted);
                                      handleClickSendUpdateField({
                                        e,
                                        fieldName: "set_item_count",
                                        fieldNameForSelectedRowData: "set_item_count",
                                        originalValue: originalValueFieldEdit.current,
                                        // newValue: inputSetItemCountEdit,
                                        newValue: converted,
                                        id: selectedRowDataQuotation?.quotation_id,
                                        required: false,
                                      });
                                    }}
                                    required={false}
                                    isDisplayClose={false}
                                  />
                                )} */}
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
                            {!searchMode && isEditModeField === "set_item_count" && (
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
                        {/* 期間 */}
                        <div className="flex h-full w-1/2 flex-col pr-[20px]">
                          <div className={`${styles.title_box} flex h-full items-center`}>
                            <span className={`${styles.title}`}>期間(年)</span>
                            {!searchMode && isEditModeField !== "lease_period" && !isInsertModeQuotation && (
                              <span
                                className={`${styles.value} ${styles.editable_field}`}
                                onClick={handleSingleClickField}
                                onDoubleClick={(e) => {
                                  if (!selectedRowDataQuotation?.lease_period) return;
                                  // if (isNotActivityTypeArray.includes(selectedRowDataQuotation.lease_period))
                                  //   return alert(returnMessageNotActivity(selectedRowDataQuotation.lease_period));
                                  handleDoubleClickField({
                                    e,
                                    field: "lease_period",
                                    dispatch: setInputLeasePeriodEdit,
                                  });
                                  if (hoveredItemPosWrap) handleCloseTooltip();
                                }}
                                data-text={`${
                                  selectedRowDataQuotation?.lease_period ? selectedRowDataQuotation?.lease_period : ""
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
                                {selectedRowDataQuotation?.quotation_division === "lease" &&
                                selectedRowDataQuotation?.lease_period
                                  ? selectedRowDataQuotation?.lease_period
                                  : ""}
                              </span>
                            )}

                            {/* ----------------- upsert ----------------- */}
                            {!searchMode && isInsertModeQuotation && inputQuotationDivisionEdit === "lease" && (
                              <>
                                <input
                                  type="number"
                                  min="1"
                                  className={`${styles.input_box} ${styles.upsert}`}
                                  // onCompositionStart={() => setIsComposing(true)}
                                  // onCompositionEnd={() => setIsComposing(false)}
                                  value={inputLeasePeriodEdit ? inputLeasePeriodEdit : ""}
                                  onChange={(e) => {
                                    if (!isValidNumber(inputTotalAmountEdit))
                                      return alert("先に商品を追加して合計金額を算出してください。");
                                    // if (e.target.value === "0" || e.target.value === "０") {
                                    //   if (inputLeasePeriodEdit === "0" || inputLeasePeriodEdit === "０")
                                    //     setInputLeasePeriodEdit("");
                                    //   return;
                                    // }
                                    // setInputLeasePeriodEdit(e.target.value);

                                    const val = e.target.value;
                                    if (val === "" || val === "0" || val === "０") {
                                      setInputLeasePeriodEdit(null);
                                    } else {
                                      const numValue = Number(val);

                                      // 入力値がマイナスかチェック
                                      if (numValue < 1) {
                                        setInputLeasePeriodEdit(1); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                                      } else {
                                        setInputLeasePeriodEdit(numValue);
                                      }
                                    }
                                  }}
                                  // onBlur={(e) => {
                                  //   if (
                                  //     !inputLeasePeriodEdit ||
                                  //     inputLeasePeriodEdit === "" ||
                                  //     inputLeasePeriodEdit === "0" ||
                                  //     e.target.value === "０"
                                  //   )
                                  //     return setInputLeasePeriodEdit("");
                                  //   const converted = convertHalfWidthRoundNumOnly(inputLeasePeriodEdit.trim());
                                  //   if (converted === null) return setInputLeasePeriodEdit("");
                                  //   setInputLeasePeriodEdit(converted);
                                  // }}
                                />
                              </>
                            )}
                            {/* ----------------- upsert ----------------- */}

                            {/* ============= フィールドエディットモード関連 ============= */}
                            {/* フィールドエディットモード selectタグ  */}
                            {/* フィールドエディットモード selectタグ  */}
                            {!searchMode && isEditModeField === "lease_period" && (
                              <>
                                <input
                                  // type="text"
                                  // placeholder=""
                                  type="number"
                                  min="1"
                                  className={`${styles.input_box}`}
                                  onCompositionStart={() => setIsComposing(true)}
                                  onCompositionEnd={() => setIsComposing(false)}
                                  value={!!inputLeasePeriodEdit ? inputLeasePeriodEdit : ""}
                                  onChange={(e) => {
                                    // if (e.target.value === "0" || e.target.value === "０") {
                                    //   if (inputLeasePeriodEdit === "0" || inputLeasePeriodEdit === "０")
                                    //     setInputLeasePeriodEdit("");
                                    //   return;
                                    // }
                                    // setInputLeasePeriodEdit(e.target.value);
                                    const val = e.target.value;
                                    if (val === "" || val === "0" || val === "０") {
                                      setInputLeasePeriodEdit(null);
                                    } else {
                                      const numValue = Number(val);

                                      // 入力値がマイナスかチェック
                                      if (numValue < 1) {
                                        setInputLeasePeriodEdit(1); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                                      } else {
                                        setInputLeasePeriodEdit(numValue);
                                      }
                                    }
                                  }}
                                  // onBlur={(e) => {
                                  //   if (
                                  //     !inputLeasePeriodEdit ||
                                  //     inputLeasePeriodEdit === "" ||
                                  //     inputLeasePeriodEdit === "0" ||
                                  //     e.target.value === "０"
                                  //   )
                                  //     return setInputLeasePeriodEdit("");
                                  //   const converted = convertHalfWidthRoundNumOnly(inputLeasePeriodEdit.trim());
                                  //   if (converted === null) return setInputLeasePeriodEdit("");
                                  //   setInputLeasePeriodEdit(converted);
                                  // }}
                                  onKeyDown={(e) => {
                                    if (!inputLeasePeriodEdit) {
                                      return setInputLeasePeriodEdit(null);
                                    }
                                    const converted = inputLeasePeriodEdit
                                      ? convertHalfWidthRoundNumOnly(inputLeasePeriodEdit.toString().trim())
                                      : null;
                                    if (converted === null) return setInputLeasePeriodEdit(null);
                                    setInputLeasePeriodEdit(Number(converted));
                                    handleKeyDownUpdateField({
                                      e,
                                      fieldName: "set_item_count",
                                      fieldNameForSelectedRowData: "set_item_count",
                                      originalValue: originalValueFieldEdit.current,
                                      // newValue: inputLeasePeriodEdit,
                                      newValue: converted,
                                      id: selectedRowDataQuotation?.quotation_id,
                                      required: false,
                                    });
                                    // if (
                                    //   !inputLeasePeriodEdit ||
                                    //   inputLeasePeriodEdit === "" ||
                                    //   inputLeasePeriodEdit === "0" ||
                                    //   inputLeasePeriodEdit === "０"
                                    // ) {
                                    //   return setInputLeasePeriodEdit("");
                                    // }
                                    // const converted = convertHalfWidthRoundNumOnly(inputLeasePeriodEdit.trim());
                                    // if (converted === null) return setInputLeasePeriodEdit("");
                                    // setInputLeasePeriodEdit(converted);
                                    // handleKeyDownUpdateField({
                                    //   e,
                                    //   fieldName: "lease_period",
                                    //   fieldNameForSelectedRowData: "lease_period",
                                    //   originalValue: originalValueFieldEdit.current,
                                    //   // newValue: inputLeasePeriodEdit,
                                    //   newValue: converted,
                                    //   id: selectedRowDataQuotation?.quotation_id,
                                    //   required: false,
                                    // });
                                  }}
                                />
                                {/* 送信ボタンとクローズボタン */}
                                {!updateQuotationFieldMutation.isLoading && (
                                  <InputSendAndCloseBtn<number | null>
                                    inputState={inputLeasePeriodEdit}
                                    setInputState={setInputLeasePeriodEdit}
                                    onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                                      // if (
                                      //   !inputLeasePeriodEdit ||
                                      //   inputLeasePeriodEdit === "" ||
                                      //   inputLeasePeriodEdit === "0" ||
                                      //   inputLeasePeriodEdit === "０"
                                      // ) {
                                      //   return setInputLeasePeriodEdit("");
                                      // }
                                      // const converted = convertHalfWidthRoundNumOnly(inputLeasePeriodEdit.trim());
                                      // if (converted === null) return setInputLeasePeriodEdit("");
                                      // setInputLeasePeriodEdit(converted);
                                      if (!inputLeasePeriodEdit) {
                                        return setInputLeasePeriodEdit(null);
                                      }
                                      const converted = inputLeasePeriodEdit
                                        ? convertHalfWidthRoundNumOnly(inputLeasePeriodEdit.toString().trim())
                                        : null;
                                      if (converted === null) return setInputLeasePeriodEdit(null);
                                      setInputLeasePeriodEdit(Number(converted));
                                      handleClickSendUpdateField({
                                        e,
                                        fieldName: "lease_period",
                                        fieldNameForSelectedRowData: "lease_period",
                                        originalValue: originalValueFieldEdit.current,
                                        // newValue: inputLeasePeriodEdit,
                                        newValue: converted,
                                        id: selectedRowDataQuotation?.quotation_id,
                                        required: false,
                                      });
                                    }}
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
                            {!searchMode && isEditModeField === "lease_period" && (
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

                      {/* セット単位・料率(%) */}
                      <div className={`${styles.row_area} flex w-full items-center`}>
                        <div className="flex h-full w-1/2 flex-col pr-[20px]">
                          <div className={`${styles.title_box} flex h-full items-center `}>
                            <span className={`${styles.title}`}>セット単位</span>
                            {!searchMode && isEditModeField !== "set_unit_name" && (
                              <span
                                className={`${styles.value} ${styles.editable_field}`}
                                data-text={
                                  selectedRowDataQuotation?.set_unit_name ? selectedRowDataQuotation?.set_unit_name : ""
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
                                    field: "set_unit_name",
                                    dispatch: setInputSetUnitNameEdit,
                                    selectedRowDataValue: selectedRowDataQuotation?.set_unit_name ?? "",
                                  });
                                  handleCloseTooltip();
                                }}
                              >
                                {selectedRowDataQuotation?.quotation_division === "set" &&
                                selectedRowDataQuotation?.set_unit_name
                                  ? selectedRowDataQuotation?.set_unit_name
                                  : ""}
                              </span>
                            )}

                            {/* ----------------- upsert ----------------- */}
                            {!searchMode && isInsertModeQuotation && inputQuotationDivisionEdit === "set" && (
                              <>
                                <input
                                  type="text"
                                  // placeholder=""
                                  // autoFocus
                                  className={`${styles.input_box} ${styles.upsert}`}
                                  value={inputSetUnitNameEdit}
                                  onChange={(e) => setInputSetUnitNameEdit(e.target.value)}
                                  onBlur={(e) => setInputSetUnitNameEdit(inputSetUnitNameEdit.trim())}
                                />
                              </>
                            )}
                            {/* ----------------- upsert ----------------- */}

                            {/* ============= フィールドエディットモード関連 ============= */}
                            {/* フィールドエディットモード selectタグ  */}
                            {!searchMode && isEditModeField === "set_unit_name" && (
                              <>
                                <input
                                  type="text"
                                  placeholder=""
                                  autoFocus
                                  className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                                  value={inputSetUnitNameEdit}
                                  onChange={(e) => setInputSetUnitNameEdit(e.target.value)}
                                  onCompositionStart={() => setIsComposing(true)}
                                  onCompositionEnd={() => setIsComposing(false)}
                                  onKeyDown={(e) =>
                                    handleKeyDownUpdateField({
                                      e,
                                      fieldName: "set_unit_name",
                                      fieldNameForSelectedRowData: "set_unit_name",
                                      originalValue: originalValueFieldEdit.current,
                                      newValue: inputSetUnitNameEdit.trim(),
                                      id: selectedRowDataQuotation?.quotation_id,
                                      required: true,
                                    })
                                  }
                                />
                                {/* 送信ボタンとクローズボタン */}
                                {!updateQuotationFieldMutation.isLoading && (
                                  <InputSendAndCloseBtn
                                    inputState={inputSetUnitNameEdit}
                                    setInputState={setInputSetUnitNameEdit}
                                    onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                                      handleClickSendUpdateField({
                                        e,
                                        fieldName: "set_unit_name",
                                        fieldNameForSelectedRowData: "set_unit_name",
                                        originalValue: originalValueFieldEdit.current,
                                        newValue: inputSetUnitNameEdit.trim(),
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
                            {!searchMode && isEditModeField === "set_unit_name" && (
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
                            <span className={`${styles.title} text-[12px]`}>料率(%)</span>
                            {!searchMode && isEditModeField !== "lease_rate" && (
                              <span
                                className={`${styles.value} ${styles.editable_field}`}
                                onClick={handleSingleClickField}
                                onDoubleClick={(e) => {
                                  if (!selectedRowDataQuotation?.lease_rate) return;
                                  // if (isNotActivityTypeArray.includes(selectedRowDataQuotation.lease_rate))
                                  //   return alert(returnMessageNotActivity(selectedRowDataQuotation.lease_rate));
                                  handleDoubleClickField({
                                    e,
                                    field: "lease_rate",
                                    dispatch: setInputLeaseRateEdit,
                                  });
                                  if (hoveredItemPosWrap) handleCloseTooltip();
                                }}
                                data-text={`${
                                  selectedRowDataQuotation?.lease_rate ? selectedRowDataQuotation?.lease_rate : ""
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
                                {selectedRowDataQuotation?.quotation_division === "lease" &&
                                checkNotFalsyExcludeZero(selectedRowDataQuotation?.lease_rate)
                                  ? normalizeDiscountRate(selectedRowDataQuotation.lease_rate!.toString(), true)
                                  : ""}
                              </span>
                            )}

                            {/* ----------------- upsert ----------------- */}
                            {!searchMode && isInsertModeQuotation && inputQuotationDivisionEdit === "lease" && (
                              <>
                                <input
                                  type="text"
                                  placeholder="1.8%→1.8　※半角で入力"
                                  className={`${styles.input_box} ${styles.upsert}`}
                                  onCompositionStart={() => setIsComposing(true)}
                                  onCompositionEnd={() => setIsComposing(false)}
                                  value={inputLeaseRateEdit ? inputLeaseRateEdit : ""}
                                  // onChange={(e) => setInputLeaseRateEdit(e.target.value)}
                                  onChange={(e) => {
                                    if (!isValidNumber(inputTotalAmountEdit))
                                      return alert("先に商品を追加して合計金額を算出してください。");
                                    if (e.target.value === "0" || e.target.value === "０") {
                                      if (inputLeaseRateEdit) setInputLeaseRateEdit("");
                                      return;
                                    }
                                    setInputLeaseRateEdit(e.target.value);
                                  }}
                                  onBlur={(e) => {
                                    if (
                                      !inputLeaseRateEdit ||
                                      inputLeaseRateEdit === "" ||
                                      inputLeaseRateEdit === "0" ||
                                      inputLeaseRateEdit === "０"
                                    )
                                      return setInputLeaseRateEdit("");
                                    // 小数点第二まで算出
                                    const convertedRate = convertHalfWidthRoundNumOnly(inputLeaseRateEdit.trim(), 2);
                                    if (convertedRate === null) return setInputLeaseRateEdit("");
                                    setInputLeaseRateEdit(convertedRate);

                                    // 🔹リース料の算出
                                    // 数字と小数点以外は全て除去
                                    const replacedAmount = inputTotalAmountEdit.replace(/[^\d.]/g, "");
                                    if (!isValidNumber(inputTotalAmountEdit)) return;
                                    // 月額リース料
                                    const result = calculateLeaseMonthlyFee(replacedAmount, convertedRate, 0);
                                    console.log(
                                      "result.monthlyFee",
                                      result.monthlyFee,
                                      "replacedAmount",
                                      replacedAmount,
                                      "convertedRate",
                                      convertedRate
                                    );
                                    if (result.error || !result.monthlyFee) {
                                      console.error(result.error);
                                      toast.error(result.error);
                                      return;
                                    }
                                    setInputLeaseMonthlyFeeEdit(result.monthlyFee);
                                  }}
                                />
                              </>
                            )}
                            {/* ----------------- upsert ----------------- */}

                            {/* ============= フィールドエディットモード関連 ============= */}
                            {/* フィールドエディットモード selectタグ  */}
                            {!searchMode && isEditModeField === "lease_rate" && (
                              <>
                                <input
                                  type="text"
                                  placeholder=""
                                  className={`${styles.input_box}`}
                                  onCompositionStart={() => setIsComposing(true)}
                                  onCompositionEnd={() => setIsComposing(false)}
                                  value={!!inputLeaseRateEdit ? inputLeaseRateEdit : ""}
                                  onChange={(e) => {
                                    if (e.target.value === "0" || e.target.value === "０") {
                                      if (inputLeaseRateEdit === "0" || inputLeaseRateEdit === "０")
                                        setInputLeaseRateEdit("");
                                      return;
                                    }
                                    setInputLeaseRateEdit(e.target.value);
                                  }}
                                  // onBlur={(e) => {
                                  //   if (
                                  //     !inputLeaseRateEdit ||
                                  //     inputLeaseRateEdit === "" ||
                                  //     inputLeaseRateEdit === "0" ||
                                  //     e.target.value === "０"
                                  //   )
                                  //     return setInputLeaseRateEdit("");
                                  //   const converted = convertHalfWidthRoundNumOnly(inputLeaseRateEdit.trim());
                                  //   if (converted === null) return setInputLeaseRateEdit("");
                                  //   setInputLeaseRateEdit(converted);
                                  // }}
                                  onKeyDown={(e) => {
                                    if (
                                      !inputLeaseRateEdit ||
                                      inputLeaseRateEdit === "" ||
                                      inputLeaseRateEdit === "0" ||
                                      inputLeaseRateEdit === "０"
                                    ) {
                                      return setInputLeaseRateEdit("");
                                    }
                                    // 小数点第二まで算出
                                    const converted = convertHalfWidthRoundNumOnly(inputLeaseRateEdit.trim(), 2);
                                    if (converted === null) return setInputLeaseRateEdit("");
                                    setInputLeaseRateEdit(converted);
                                    handleKeyDownUpdateField({
                                      e,
                                      fieldName: "lease_rate",
                                      fieldNameForSelectedRowData: "lease_rate",
                                      originalValue: originalValueFieldEdit.current,
                                      // newValue: inputLeaseRateEdit,
                                      newValue: converted,
                                      id: selectedRowDataQuotation?.quotation_id,
                                      required: false,
                                    });
                                  }}
                                />
                                {/* 送信ボタンとクローズボタン */}
                                {!updateQuotationFieldMutation.isLoading && (
                                  <InputSendAndCloseBtn<string>
                                    inputState={inputLeaseRateEdit}
                                    setInputState={setInputLeaseRateEdit}
                                    onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                                      if (
                                        !inputLeaseRateEdit ||
                                        inputLeaseRateEdit === "" ||
                                        inputLeaseRateEdit === "0" ||
                                        inputLeaseRateEdit === "０"
                                      ) {
                                        return setInputLeaseRateEdit("");
                                      }
                                      // 小数点第二まで算出
                                      const converted = convertHalfWidthRoundNumOnly(inputLeaseRateEdit.trim(), 2);
                                      if (converted === null) return setInputLeaseRateEdit("");
                                      setInputLeaseRateEdit(converted);
                                      handleClickSendUpdateField({
                                        e,
                                        fieldName: "lease_rate",
                                        fieldNameForSelectedRowData: "lease_rate",
                                        originalValue: originalValueFieldEdit.current,
                                        // newValue: inputLeaseRateEdit,
                                        newValue: converted,
                                        id: selectedRowDataQuotation?.quotation_id,
                                        required: false,
                                      });
                                    }}
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
                            {!searchMode && isEditModeField === "lease_rate" && (
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

                      {/* セット価格・月額リース料 */}
                      <div className={`${styles.row_area} flex w-full items-center`}>
                        <div className="flex h-full w-1/2 flex-col pr-[20px]">
                          <div className={`${styles.title_box} flex h-full items-center `}>
                            <span className={`${styles.title} text-[12px]`}>セット価格</span>
                            {!searchMode && isEditModeField !== "set_price" && (
                              <span
                                className={`${styles.value} ${styles.editable_field}`}
                                onClick={handleSingleClickField}
                                onDoubleClick={(e) => {
                                  if (!checkNotFalsyExcludeZero(selectedRowDataQuotation?.set_price)) return;
                                  // if (isNotActivityTypeArray.includes(selectedRowDataQuotation.set_price))
                                  //   return alert(returnMessageNotActivity(selectedRowDataQuotation.set_price));
                                  handleDoubleClickField({
                                    e,
                                    field: "set_price",
                                    dispatch: setInputSetPriceEdit,
                                  });
                                  if (hoveredItemPosWrap) handleCloseTooltip();
                                }}
                                data-text={`${
                                  selectedRowDataQuotation?.set_price ? selectedRowDataQuotation?.set_price : ""
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
                                {checkNotFalsyExcludeZero(selectedRowDataQuotation?.set_price)
                                  ? Number(selectedRowDataQuotation?.set_price).toLocaleString() + "円"
                                  : ""}
                              </span>
                            )}

                            {/* ----------------- upsert ----------------- */}
                            {!searchMode && isInsertModeQuotation && inputQuotationDivisionEdit === "set" && (
                              <>
                                <input
                                  type="text"
                                  // placeholder="例：600万円 → 6000000　※半角で入力"
                                  className={`${styles.input_box} ${styles.upsert} truncate`}
                                  // onCompositionStart={() => setIsComposing(true)}
                                  // onCompositionEnd={() => setIsComposing(false)}
                                  value={checkNotFalsyExcludeZero(inputSetPriceEdit) ? inputSetPriceEdit : ""}
                                  onChange={(e) => setInputSetPriceEdit(e.target.value)}
                                  onFocus={() => {
                                    setInputSetPriceEdit(inputSetPriceEdit.replace(/[^\d.]/g, ""));
                                  }}
                                  onBlur={() => {
                                    // 日本語の場合は円に変換、それ以外は小数点第二位までの数字と小数点か空文字に変換し、空文字の場合はNumberで0に変換
                                    const convertedPrice =
                                      language === "ja"
                                        ? convertToYen(inputSetPriceEdit.trim())
                                        : Number(convertHalfWidthRoundNumOnly(inputSetPriceEdit.trim(), 2));
                                    // 数値を日本語はIntl.NumberFormatで￥と区切り文字をつけ、0以外のfalsyは空文字を格納
                                    const newPrice = checkNotFalsyExcludeZero(convertedPrice)
                                      ? formatDisplayPrice(convertedPrice as number)
                                      : "";
                                    setInputSetPriceEdit(newPrice);
                                  }}
                                  onMouseEnter={(e) => {
                                    const el = e.currentTarget;
                                    // スクロールwidthがoffsetWidthを超えていればツールチップを表示
                                    if (el.scrollWidth > el.offsetWidth) {
                                      handleOpenTooltip({
                                        e: e,
                                        display: "top",
                                        content: inputSetPriceEdit,
                                        marginTop: 28,
                                        itemsPosition: "center",
                                      });
                                    }
                                  }}
                                  onMouseLeave={() => {
                                    if (hoveredItemPosWrap) handleCloseTooltip();
                                  }}
                                />
                              </>
                            )}
                            {/* ----------------- upsert ----------------- */}

                            {/* ============= フィールドエディットモード関連 ============= */}
                            {/* フィールドエディットモード selectタグ  */}
                            {!searchMode && isEditModeField === "set_price" && (
                              <>
                                <input
                                  type="text"
                                  autoFocus
                                  // placeholder="例：600万円 → 6000000　※半角で入力"
                                  className={`${styles.input_box} ${styles.field_edit_mode_input_box} truncate`}
                                  onCompositionStart={() => setIsComposing(true)}
                                  onCompositionEnd={() => setIsComposing(false)}
                                  value={checkNotFalsyExcludeZero(inputSetPriceEdit) ? inputSetPriceEdit : ""}
                                  onChange={(e) => {
                                    if (e.target.value === "0" || e.target.value === "０") {
                                      setInputSetPriceEdit("0");
                                    }
                                    setInputSetPriceEdit(e.target.value);
                                  }}
                                  // onBlur={() => {
                                  //   setInputSetPriceEdit(
                                  //     !!inputSetPriceEdit &&
                                  //       inputSetPriceEdit !== "" &&
                                  //       convertToYen(inputSetPriceEdit.trim()) !== null
                                  //       ? (convertToYen(inputSetPriceEdit.trim()) as number).toLocaleString()
                                  //       : ""
                                  //   );
                                  // }}
                                  onKeyDown={(e) => {
                                    handleKeyDownUpdateField({
                                      e,
                                      fieldName: "set_price",
                                      fieldNameForSelectedRowData: "set_price",
                                      originalValue: originalValueFieldEdit.current,
                                      newValue: !!inputSetPriceEdit
                                        ? (convertToYen(inputSetPriceEdit.trim()) as number).toString()
                                        : null,
                                      id: selectedRowDataQuotation?.quotation_id,
                                      required: false,
                                    });
                                  }}
                                />
                                {/* 送信ボタンとクローズボタン */}
                                {!updateQuotationFieldMutation.isLoading && (
                                  <InputSendAndCloseBtn<string>
                                    inputState={inputSetPriceEdit}
                                    setInputState={setInputSetPriceEdit}
                                    onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                                      handleClickSendUpdateField({
                                        e,
                                        fieldName: "set_price",
                                        fieldNameForSelectedRowData: "set_price",
                                        originalValue: originalValueFieldEdit.current,
                                        newValue: inputSetPriceEdit
                                          ? (convertToYen(inputSetPriceEdit.trim()) as number).toString()
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
                            {!searchMode && isEditModeField === "set_price" && (
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
                        {/* 月額リース料 */}
                        <div className="flex h-full w-1/2 flex-col pr-[20px]">
                          <div className={`${styles.title_box} flex h-full items-center`}>
                            <span className={`${styles.title} text-[12px]`}>月額ﾘｰｽ料</span>
                            {!searchMode && isEditModeField !== "lease_monthly_fee" && (
                              <span
                                className={`${styles.value} ${styles.editable_field}`}
                                data-text={
                                  selectedRowDataQuotation?.lease_monthly_fee
                                    ? selectedRowDataQuotation?.lease_monthly_fee
                                    : ""
                                }
                                onMouseEnter={(e) => handleOpenTooltip({ e, display: "top" })}
                                onMouseLeave={handleCloseTooltip}
                              >
                                {checkNotFalsyExcludeZero(selectedRowDataQuotation?.lease_monthly_fee)
                                  ? Number(selectedRowDataQuotation?.lease_monthly_fee).toLocaleString() + "円"
                                  : ""}
                              </span>
                            )}

                            {/* ----------------- upsert ----------------- */}
                            {!searchMode && isInsertModeQuotation && inputQuotationDivisionEdit === "lease" && (
                              <span className={`${styles.value}`}>
                                {/* {inputLeaseMonthlyFeeEdit ? inputLeaseMonthlyFeeEdit.toLocaleString() : ""} */}
                                {inputLeaseMonthlyFeeEdit ? formatDisplayPrice(inputLeaseMonthlyFeeEdit) : ""}
                              </span>
                            )}
                            {/* ----------------- upsert ----------------- */}
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
                      {/* <span className={`${styles.section_title} mr-[20px] !min-w-max`}>見積商品リスト</span> */}
                      <div
                        className={`${styles.section_title} mr-[20px] flex !min-w-max items-center space-x-[6px]`}
                        onMouseEnter={(e) => {
                          if (!isInsertModeQuotation) return;
                          if (
                            infoIconQuotationProductList.current &&
                            infoIconQuotationProductList.current.classList.contains(styles.animate_ping)
                          ) {
                            infoIconQuotationProductList.current.classList.remove(styles.animate_ping);
                          }
                          handleOpenTooltip({
                            e: e,
                            display: "top",
                            content: `見積商品リストに追加した商品の「見積記載」が付いた項目は編集が可能です。`,
                            content2: `上記の価格合計、合計金額は、リストの見積記載が付いた価格と数量に基づいて算出されます。`,
                            // content3: `ex) 入力: 20万円 -> 出力: 200000`,
                            marginTop: 28,
                            itemsPosition: "center",
                          });
                        }}
                        onMouseLeave={() => {
                          if (hoveredItemPosWrap) handleCloseTooltip();
                        }}
                      >
                        <span>見積商品リスト</span>

                        {isInsertModeQuotation && (
                          <div className="flex-center relative h-[15px] w-[15px] rounded-full">
                            <div
                              ref={infoIconQuotationProductList}
                              className={`flex-center absolute left-0 top-0 h-[15px] w-[15px] rounded-full border border-solid border-[var(--color-bg-brand-f)] ${styles.animate_ping}`}
                            ></div>
                            <ImInfo className={`min-h-[15px] min-w-[15px] text-[var(--color-bg-brand-f)]`} />
                          </div>
                        )}
                      </div>
                      {isInsertModeQuotation && (
                        <div className="flex w-full items-center space-x-[10px]">
                          <RippleButton
                            title={`追加`}
                            classText="select-none"
                            borderRadius="6px"
                            clickEventHandler={() => {
                              if (isEditingCell) return;
                              setIsOpenSearchProductSideTableBefore(true);
                              setTimeout(() => {
                                setIsOpenSearchProductSideTable(true);
                              }, 100);
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
                          {selectedRowDataQuotationProduct && (
                            <>
                              <RippleButton
                                title={`削除`}
                                classText="select-none"
                                borderRadius="6px"
                                clickEventHandler={() => {
                                  if (isEditingCell) return;
                                  const newArray = selectedProductsArray.filter(
                                    (obj) =>
                                      obj.quotation_product_id !== selectedRowDataQuotationProduct.quotation_product_id
                                  );
                                  // 削除後のpriorityを現在の順番に変更する
                                  const sortedNewArray = newArray.map((obj, index) => {
                                    const newObj: QuotationProductsDetail = {
                                      ...obj,
                                      quotation_product_priority: index + 1,
                                    };
                                    return newObj;
                                  });
                                  setSelectedProductsArray(sortedNewArray);
                                  setSelectedRowDataQuotationProduct(null);
                                  handleCloseTooltip();
                                }}
                                onMouseEnterHandler={(e) => {
                                  handleOpenTooltip({
                                    e: e,
                                    display: "top",
                                    content: `選択中の商品をリストから削除`,
                                    // content2: `直近売れ先の仕入れ先や、売れ先と同じ取引先を持つ同業他社で導入実績が響く会社など`,
                                    // marginTop: 48,
                                    // marginTop: 28,
                                    marginTop: 9,
                                  });
                                }}
                                onMouseLeaveHandler={handleCloseTooltip}
                              />
                              {Object.values(editPosition).every((value) => value !== null) && (
                                <RippleButton
                                  title={`編集`}
                                  classText={`select-none ${isEditingCell ? ` cursor-not-allowed` : ``}`}
                                  borderRadius="6px"
                                  clickEventHandler={() => {
                                    if (isEditingCell) return;
                                    setIsEditingCell(true);
                                    handleCloseTooltip();
                                  }}
                                  onMouseEnterHandler={(e) => {
                                    if (isEditingCell) return;
                                    handleOpenTooltip({
                                      e: e,
                                      display: "top",
                                      content: `選択中の項目を編集する`,
                                      content2: `見積記載の項目は自由に編集が可能です`,
                                      content3: `セルをダブルクリックしても編集が可能です`,
                                      marginTop: 48,
                                      // marginTop: 27,
                                      // marginTop: 9,
                                    });
                                  }}
                                  onMouseLeaveHandler={handleCloseTooltip}
                                />
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* <div className={`${styles.underline}`}></div> */}
                    <div className={`${styles.section_underline}`}></div>
                  </div>
                </div>
                {/*  */}

                {/* 商品リストエリア */}
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
                      isInsertModeQuotation
                        ? selectedProductsArray
                        : selectedRowDataQuotation && selectedRowDataQuotation.quotation_products_details?.length > 0
                        ? selectedRowDataQuotation.quotation_products_details
                        : []
                    }
                    setSelectedProductsArray={setSelectedProductsArray}
                    isInsertMode={isInsertModeQuotation}
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

      {/* 「自社担当」変更確認モーダル */}
      {isOpenConfirmationModal === "change_member" && (
        <ConfirmationModal
          clickEventClose={() => {
            // setMeetingMemberName(selectedRowDataMeeting?.meeting_member_name ?? "");
            setMemberObj(prevMemberObj);
            setIsOpenConfirmationModal(null);
            if (sideTableState !== "author") setSideTableState("author");
          }}
          // titleText="面談データの自社担当を変更してもよろしいですか？"
          titleText={`データの所有者を変更してもよろしいですか？`}
          // titleText2={`データの所有者を変更しますか？`}
          sectionP1="「自社担当」「事業部」「係・チーム」「事業所」を変更すると見積データの所有者が変更されます。"
          sectionP2="注：データの所有者を変更すると、この見積結果は変更先のメンバーの集計結果に移行され、分析結果が変更されます。"
          cancelText="戻る"
          submitText="変更する"
          clickEventSubmit={() => {
            // setMemberObj(prevMemberObj);
            setIsOpenConfirmationModal(null);
            // setIsOpenSearchMemberSideTable(true);
            setIsOpenSearchMemberSideTableBefore(true);
            setTimeout(() => {
              setIsOpenSearchMemberSideTable(true);
            }, 100);
            setSideTableState("author");
          }}
        />
      )}

      {/* 「自社担当」「印鑑データ」変更サイドテーブル */}
      {isOpenSearchMemberSideTableBefore && (
        <div
          className={`fixed inset-0 z-[10000] bg-[#ffffff00] ${
            isOpenSearchMemberSideTable ? `` : `pointer-events-none`
          }`}
        >
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense
              fallback={
                <div className={`pointer-events-none fixed inset-0 z-[10000] bg-[#00000039]`}>
                  <FallbackSideTableSearchMember
                    isOpenSearchMemberSideTable={isOpenSearchMemberSideTable}
                    searchSignatureStamp={sideTableState !== "author" ? true : false}
                  />
                </div>
              }
            >
              <SideTableSearchMember
                isOpenSearchMemberSideTable={isOpenSearchMemberSideTable}
                setIsOpenSearchMemberSideTable={setIsOpenSearchMemberSideTable}
                isOpenSearchMemberSideTableBefore={isOpenSearchMemberSideTableBefore}
                setIsOpenSearchMemberSideTableBefore={setIsOpenSearchMemberSideTableBefore}
                prevMemberObj={getMemberObj(sideTableState).prevMemberObj}
                setPrevMemberObj={getMemberObj(sideTableState).setPrevMemberObj}
                memberObj={getMemberObj(sideTableState).memberObj}
                setMemberObj={getMemberObj(sideTableState).setMemberObj}
                searchSignatureStamp={sideTableState !== "author" ? true : false}
                // prevMemberObj={prevMemberObj}
                // setPrevMemberObj={setPrevMemberObj}
                // memberObj={memberObj}
                // setMemberObj={setMemberObj}
              />
            </Suspense>
          </ErrorBoundary>
        </div>
      )}

      {/* 送付先 変更サイドテーブル */}
      {isOpenSearchDestinationSideTableBefore && (
        <div
          className={`fixed inset-0 z-[10000] bg-[#ffffff00] ${
            isOpenSearchDestinationSideTable ? `` : `pointer-events-none`
          }`}
        >
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense
              fallback={
                <div className={`pointer-events-none fixed inset-0 z-[10000] bg-[#00000039]`}>
                  <FallbackSideTableSearchContact
                    isOpenSearchSideTable={isOpenSearchDestinationSideTable}
                    searchTitle="destination"
                  />
                </div>
              }
            >
              <SideTableSearchContact
                isOpenSearchSideTable={isOpenSearchDestinationSideTable}
                setIsOpenSearchSideTable={setIsOpenSearchDestinationSideTable}
                isOpenSearchSideTableBefore={isOpenSearchDestinationSideTableBefore}
                setIsOpenSearchSideTableBefore={setIsOpenSearchDestinationSideTableBefore}
                selectedContactObj={selectedDestination}
                setSelectedContactObj={setSelectedDestination}
                searchTitle="destination"
              />
            </Suspense>
          </ErrorBoundary>
        </div>
      )}

      {/* 商品リスト追加サイドテーブル */}
      {isOpenSearchProductSideTableBefore && (
        <div
          className={`fixed inset-0 z-[10010] bg-[#ffffff00] ${
            isOpenSearchProductSideTable ? `` : `pointer-events-none`
          }`}
        >
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense
              fallback={
                <div className={`pointer-events-none fixed inset-0 z-[10000] bg-[#00000039]`}>
                  <FallbackSideTableSearchProduct isOpenSearchProductSideTable={isOpenSearchProductSideTable} />
                </div>
              }
            >
              <SideTableSearchProduct
                isOpenSearchProductSideTable={isOpenSearchProductSideTable}
                setIsOpenSearchProductSideTable={setIsOpenSearchProductSideTable}
                isOpenSearchProductSideTableBefore={isOpenSearchProductSideTableBefore}
                setIsOpenSearchProductSideTableBefore={setIsOpenSearchProductSideTableBefore}
                selectedProductsArray={selectedProductsArray}
                setSelectedProductsArray={setSelectedProductsArray}
              />
            </Suspense>
          </ErrorBoundary>
        </div>
      )}
    </>
  );
};

export const QuotationMainContainerOneThird = memo(QuotationMainContainerOneThirdMemo);
