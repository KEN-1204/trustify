import { ChangeEvent, FC, FormEvent, Suspense, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "../PropertyDetail.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import useStore from "@/store";
// import { UnderRightPropertyLog } from "./UnderRightPropertyLog/UnderRightPropertyLog";
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
import { convertToMillions } from "@/utils/Helpers/convertToMillions";
import { convertToJapaneseCurrencyFormat } from "@/utils/Helpers/convertToJapaneseCurrencyFormat";
import {
  getCompetitionState,
  getCurrentStatus,
  getDecisionMakerNegotiation,
  getLeaseDivision,
  getNumberOfEmployeesClass,
  getOccupationName,
  getOrderCertaintyStartOfMonth,
  getPositionClassName,
  getReasonClass,
  getSalesClass,
  getSalesContributionCategory,
  getSubscriptionInterval,
  getTermDivision,
  mappingIndustryType,
  optionsCompetitionState,
  optionsCurrentStatus,
  optionsDecisionMakerNegotiation,
  optionsIndustryType,
  optionsLeaseDivision,
  optionsMonth,
  optionsNumberOfEmployeesClass,
  optionsOccupation,
  optionsOrderCertaintyStartOfMonth,
  optionsPositionsClass,
  optionsProductL,
  optionsReasonClass,
  optionsSalesClass,
  optionsSalesContributionCategory,
  optionsSubscriptionInterval,
  optionsTermDivision,
} from "@/utils/selectOptions";
import { generateYearQuarters } from "@/utils/Helpers/generateYearQuarters";
import { Department, EditedDealCard, Office, Property, Property_row_data, Unit } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { useMedia } from "react-use";
import { mappingOccupation, mappingPositionClass } from "@/utils/mappings";
import { useQueryDepartments } from "@/hooks/useQueryDepartments";
import { useQueryUnits } from "@/hooks/useQueryUnits";
import { useQueryOffices } from "@/hooks/useQueryOffices";
import { SpinnerComet } from "@/components/Parts/SpinnerComet/SpinnerComet";
import { useMutateProperty } from "@/hooks/useMutateProperty";
import { calculateDateToYearMonth } from "@/utils/Helpers/calculateDateToYearMonth";
import { isSameDateLocal } from "@/utils/Helpers/isSameDateLocal";
import { getFiscalYear } from "@/utils/Helpers/getFiscalYear";
import { getFiscalQuarterTest } from "@/utils/Helpers/getFiscalQuarterTest";
import { InputSendAndCloseBtn } from "@/components/DashboardCompanyComponent/CompanyMainContainer/InputSendAndCloseBtn/InputSendAndCloseBtn";
import { convertToYen } from "@/utils/Helpers/convertToYen";
import { normalizeDiscountRate } from "@/utils/Helpers/normalizeDiscountRate";
import { checkNotFalsyExcludeZero } from "@/utils/Helpers/checkNotFalsyExcludeZero";
import { calculateDiscountRate } from "@/utils/Helpers/calculateDiscountRate";
import { isValidNumber } from "@/utils/Helpers/isValidNumber";
import { UnderRightActivityLogCustom } from "./UnderRightActivityLogCustom/UnderRightActivityLogCustom";
import { FallbackUnderRightActivityLogCustom } from "./UnderRightActivityLogCustom/FallbackUnderRightActivityLogCustom";

const DetailPropertyModalMemo = () => {
  const language = useStore((state) => state.language);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const hoveredItemPosWrap = useStore((state) => state.hoveredItemPosWrap);
  const setHoveredItemPosWrap = useStore((state) => state.setHoveredItemPosWrap);
  const isOpenSidebar = useDashboardStore((state) => state.isOpenSidebar);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  const tableContainerSize = useDashboardStore((state) => state.tableContainerSize);
  const underDisplayFullScreen = useDashboardStore((state) => state.underDisplayFullScreen);
  // 選択中の列データ会社
  const editedDealCard = useDashboardStore((state) => state.editedDealCard);
  let selectedRowDataProperty: EditedDealCard = editedDealCard;
  // const selectedRowDataProperty = useDashboardStore((state) => state.selectedRowDataProperty);
  // モーダルを閉じる
  const setIsOpenPropertyDetailModal = useDashboardStore((state) => state.setIsOpenPropertyDetailModal);
  // チェックボックスクリックで案件編集モーダルオープン
  const setIsOpenUpdatePropertyModal = useDashboardStore((state) => state.setIsOpenUpdatePropertyModal);

  // 各フィールドの編集モード => ダブルクリックで各フィールド名をstateに格納し、各フィールドをエディットモードへ
  const isEditModeField = useDashboardStore((state) => state.isEditModeField);
  const setIsEditModeField = useDashboardStore((state) => state.setIsEditModeField);
  const [isComposing, setIsComposing] = useState(false); // 日本語のように変換、確定が存在する言語入力の場合の日本語入力の変換中を保持するstate、日本語入力開始でtrue, エンターキーで変換確定した時にfalse

  // 会社詳細モーダル
  const setIsOpenClientCompanyDetailModal = useDashboardStore((state) => state.setIsOpenClientCompanyDetailModal);
  // 担当者詳細モーダル
  const setIsOpenContactDetailModal = useDashboardStore((state) => state.setIsOpenContactDetailModal);

  const queryClient = useQueryClient();

  const { updatePropertyFieldMutation } = useMutateProperty();

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
  // Propertyテーブル
  const [inputPropertyCreatedByCompanyId, setInputPropertyCreatedByCompanyId] = useState("");
  const [inputPropertyCreatedByUserId, setInputPropertyCreatedByUserId] = useState("");
  const [inputPropertyCreatedByDepartmentOfUser, setInputPropertyCreatedByDepartmentOfUser] = useState("");
  const [inputPropertyCreatedByUnitOfUser, setInputPropertyCreatedByUnitOfUser] = useState("");
  const [inputPropertyCreatedByOfficeOfUser, setInputPropertyCreatedByOfficeOfUser] = useState("");
  const [inputCurrentStatus, setInputCurrentStatus] = useState("");
  const [inputPropertyName, setInputPropertyName] = useState("");
  const [inputPropertySummary, setInputPropertySummary] = useState("");
  const [inputPendingFlag, setInputPendingFlag] = useState<boolean | null>(null);
  const [inputRejectedFlag, setInputRejectedFlag] = useState<boolean | null>(null);
  const [inputProductName, setInputProductName] = useState(""); // 商品
  const [inputProductSales, setInputProductSales] = useState<number | null>(null); // 予定売上台数
  const [inputExpectedOrderDate, setInputExpectedOrderDate] = useState<Date | null>(null); // 獲得予定時期
  // const [inputExpectedSalesPrice, setInputExpectedSalesPrice] = useState<number | null>(null); // 予定売上価格
  const [inputExpectedSalesPrice, setInputExpectedSalesPrice] = useState<string>(""); // 予定売上価格
  const [inputTermDivision, setInputTermDivision] = useState(""); // 今・来期
  const [inputSoldProductName, setInputSoldProductName] = useState(""); // 売上商品
  const [inputUnitSales, setInputUnitSales] = useState<number | null>(null); // 売上台数
  const [inputSalesContributionCategory, setInputSalesContributionCategory] = useState(""); // 売上貢献区分
  // const [inputSalesPrice, setInputSalesPrice] = useState<number | null>(null); // 売上価格
  // const [inputDiscountedPrice, setInputDiscountedPrice] = useState<number | null>(null); // 値引価格
  // const [inputDiscountRate, setInputDiscountRate] = useState<number | null>(null);
  const [inputSalesPrice, setInputSalesPrice] = useState<string>(""); // 売上価格
  const [inputDiscountedPrice, setInputDiscountedPrice] = useState<string>(""); // 値引価格
  const [inputDiscountRate, setInputDiscountRate] = useState<string>(""); // 値引率
  const [inputSalesClass, setInputSalesClass] = useState("");
  const [inputExpansionDate, setInputExpansionDate] = useState<Date | null>(null);
  const [inputSalesDate, setInputSalesDate] = useState<Date | null>(null);
  // const [inputExpansionQuarter, setInputExpansionQuarter] = useState("");
  // const [inputSalesQuarter, setInputSalesQuarter] = useState("");
  const [inputExpansionQuarter, setInputExpansionQuarter] = useState<number | null>(null);
  const [inputSalesQuarter, setInputSalesQuarter] = useState<number | null>(null);
  const [inputSubscriptionStartDate, setInputSubscriptionStartDate] = useState<Date | null>(null);
  const [inputSubscriptionCanceledAt, setInputSubscriptionCanceledAt] = useState<Date | null>(null);
  const [inputLeasingCompany, setInputLeasingCompany] = useState("");
  const [inputLeaseDivision, setInputLeaseDivision] = useState("");
  const [inputLeaseExpirationDate, setInputLeaseExpirationDate] = useState<Date | null>(null);
  const [inputStepInFlag, setInputStepInFlag] = useState<boolean | null>(null);
  const [inputRepeatFlag, setInputRepeatFlag] = useState<boolean | null>(null);
  const [inputOrderCertaintyStartOfMonth, setInputOrderCertaintyStartOfMonth] = useState("");
  const [inputReviewOrderCertainty, setInputReviewOrderCertainty] = useState("");
  const [inputCompetitorAppearanceDate, setInputCompetitorAppearanceDate] = useState<Date | null>(null);
  const [inputCompetitor, setInputCompetitor] = useState("");
  const [inputCompetitorProduct, setInputCompetitorProduct] = useState("");
  const [inputReasonClass, setInputReasonClass] = useState("");
  const [inputReasonDetail, setInputReasonDetail] = useState("");
  // const [inputCustomerBudget, setInputCustomerBudget] = useState<number | null>(null);
  const [inputCustomerBudget, setInputCustomerBudget] = useState<string>("");
  const [inputDecisionMakerNegotiation, setInputDecisionMakerNegotiation] = useState("");
  const [inputExpansionYearMonth, setInputExpansionYearMonth] = useState<number | null>(null);
  const [inputSalesYearMonth, setInputSalesYearMonth] = useState<number | null>(null);
  const [inputSubscriptionInterval, setInputSubscriptionInterval] = useState("");
  const [inputCompetitionState, setInputCompetitionState] = useState("");
  const [inputPropertyYearMonth, setInputPropertyYearMonth] = useState<number | null>(null);
  const [inputPropertyDepartment, setInputPropertyDepartment] = useState("");
  const [inputPropertyBusinessOffice, setInputPropertyBusinessOffice] = useState("");
  const [inputPropertyMemberName, setInputPropertyMemberName] = useState("");
  const [inputPropertyDate, setInputPropertyDate] = useState<Date | null>(null);

  // ================================ 🌟フィールドエディットモード関連state🌟 ================================
  const [inputExpectedOrderDateForFieldEditMode, setInputExpectedOrderDateForFieldEditMode] = useState<Date | null>(
    null
  );
  // フラグ関連 フィールドエディット用 初期はfalseにしておき、useEffectでselectedRowDataのフラグを反映する
  const [checkRepeatFlagForFieldEdit, setCheckRepeatFlagForFieldEdit] = useState(false);
  const [checkStepInFlagForFieldEdit, setCheckStepInFlagForFieldEdit] = useState(false);
  const [checkPendingFlagForFieldEdit, setCheckPendingFlagForFieldEdit] = useState(false);
  const [checkRejectedFlagForFieldEdit, setCheckRejectedFlagForFieldEdit] = useState(false);
  // const [checkboxPlannedAppointCheckFlagForFieldEdit, setCheckboxPlannedAppointCheckFlagForFieldEdit] = useState(false); // アポ有りフラグ フィールドエディット用

  // フラグの初期値を更新 リピート
  useEffect(() => {
    setCheckRepeatFlagForFieldEdit(selectedRowDataProperty?.repeat_flag ? selectedRowDataProperty?.repeat_flag : false);
  }, [selectedRowDataProperty?.repeat_flag]);
  // フラグの初期値を更新 案件介入
  useEffect(() => {
    setCheckStepInFlagForFieldEdit(
      selectedRowDataProperty?.step_in_flag ? selectedRowDataProperty?.step_in_flag : false
    );
  }, [selectedRowDataProperty?.step_in_flag]);
  // フラグの初期値を更新 ペンディング
  useEffect(() => {
    setCheckPendingFlagForFieldEdit(
      selectedRowDataProperty?.pending_flag ? selectedRowDataProperty?.pending_flag : false
    );
  }, [selectedRowDataProperty?.pending_flag]);
  // フラグの初期値を更新 案件没
  useEffect(() => {
    setCheckRejectedFlagForFieldEdit(
      selectedRowDataProperty?.rejected_flag ? selectedRowDataProperty?.rejected_flag : false
    );
  }, [selectedRowDataProperty?.rejected_flag]);
  // ================================ ✅フィールドエディットモード関連state✅ ================================

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

  // ==================================== 🌟ツールチップ🌟 ====================================
  type TooltipParams = {
    e: React.MouseEvent<HTMLElement, MouseEvent>;
    display?: "top" | "right" | "bottom" | "left" | "";
    marginTop?: number;
    itemsPosition?: string;
    whiteSpace?: "normal" | "pre" | "nowrap" | "pre-wrap" | "pre-line" | "break-spaces" | undefined;
  };
  const handleOpenTooltip = ({ e, display = "", marginTop, itemsPosition, whiteSpace }: TooltipParams) => {
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

  // ================== 🌟シングルクリック、ダブルクリックイベント🌟 ==================
  // ダブルクリックで各フィールドごとに個別で編集
  const setTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // 選択行データが自社専用の会社データかどうか
  const isMatchDepartment =
    !!userProfileState?.assigned_department_id &&
    !!selectedRowDataProperty?.property_created_by_department_of_user &&
    selectedRowDataProperty.property_created_by_department_of_user === userProfileState?.assigned_department_id;

  // シングルクリック => 何もアクションなし
  const handleSingleClickField = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      if (!selectedRowDataProperty) return;
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
    [selectedRowDataProperty]
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
      if (!selectedRowDataProperty) return;
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

        // if (["planned_start_time", "result_start_time", "result_end_time"].includes(field)) {
        //   const formattedTime = formatTime(text);
        //   originalValueFieldEdit.current = formattedTime;
        //   const timeParts = splitTime(text);
        //   console.log("formattedTime", formattedTime);
        //   if (field === "planned_start_time") {
        //     setInputPlannedStartTimeHour(timeParts?.hours ?? "");
        //     setInputPlannedStartTimeMinute(timeParts?.minutes ?? "");
        //   } else if (field === "result_start_time") {
        //     setInputResultStartTimeHour(timeParts?.hours ?? "");
        //     setInputResultStartTimeMinute(timeParts?.minutes ?? "");
        //   } else if (field === "result_end_time") {
        //     setInputResultEndTimeHour(timeParts?.hours ?? "");
        //     setInputResultEndTimeMinute(timeParts?.minutes ?? "");
        //   }
        //   dispatch(formattedTime); // 編集モードでinputStateをクリックした要素のテキストを初期値に設定
        //   setIsEditModeField(field); // クリックされたフィールドの編集モードを開く
        //   return;
        // }
        // 🔹価格の区切り文字を編集時は取り除く
        if (["expected_sales_price", "sales_price", "discounted_price", "customer_budget"].includes(field)) {
          // text = text.replace(/,円/g, "");
          text = text.replace(/[,円]/g, "");
          console.log("text", text);
        }
        if (field === "fiscal_end_month") {
          text = text.replace(/月/g, ""); // 決算月の場合は、1月の月を削除してstateに格納 optionタグのvalueと一致させるため
        }
        // // 🔹「活動日付」「次回フォロー予定日」はinnerHTMLではなく元々の値を格納
        if (
          [
            "expected_order_date",
            "expansion_date",
            "sales_date",
            "property_date",
            "subscription_start_date",
            "subscription_canceled_at",
            "lease_expiration_date",
            "competitor_appearance_date",
          ].includes(field)
        ) {
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
        //
        if (["order_certainty_start_of_month", "review_order_certainty"].includes(field)) {
          // const numValue = getInvertOrderCertaintyStartOfMonth(selectedRowDataValue);
          originalValueFieldEdit.current = selectedRowDataValue;
          dispatch(selectedRowDataValue);
          setIsEditModeField(field);
          return;
        }
        originalValueFieldEdit.current = text;
        dispatch(text); // 編集モードでinputStateをクリックした要素のテキストを初期値に設定
        setIsEditModeField(field); // クリックされたフィールドの編集モードを開く
        // if (isSelectChangeEvent) originalOptionRef.current = e.currentTarget.innerText; // selectタグ同じ選択肢選択時の編集モード終了用
      }
    },
    [setIsEditModeField, selectedRowDataProperty]
    // [isOurActivity, setIsEditModeField]
  );
  // ================== ✅シングルクリック、ダブルクリックイベント✅ ==================

  // プロパティ名のユニオン型の作成
  // Property_row_data型の全てのプロパティ名をリテラル型のユニオンとして展開
  // type ActivityFieldNames = keyof Property_row_data;
  type PropertyFieldNames = keyof Property;
  type ExcludeKeys = "company_id" | "contact_id" | "property_id"; // 除外するキー
  type PropertyFieldNamesForSelectedRowData = Exclude<keyof Property_row_data, ExcludeKeys>; // Property_row_dataタイプのプロパティ名のみのデータ型を取得
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
    fieldName: PropertyFieldNames;
    fieldNameForSelectedRowData: PropertyFieldNamesForSelectedRowData;
    originalValue: any;
    newValue: any;
    id: string | undefined;
    required: boolean;
  }) => {
    // 日本語入力変換中はtrueで変換確定のエンターキーではUPDATEクエリが実行されないようにする
    // 英語などの入力変換が存在しない言語ではisCompositionStartは発火しないため常にfalse
    if (e.key === "Enter" && !isComposing) {
      if (required && (newValue === "" || newValue === null)) return toast.info(`この項目は入力が必須です。`);

      // if (fieldName === "customer_budget") {
      //   console.log("newValue", newValue);
      //   return;
      // }

      // 先にアンダーラインが残らないようにremoveしておく
      e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove

      if (!id || !selectedRowDataProperty) {
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

      // 売上台数unit_sales, 売上価格sales_price, 値引価格discount_priceを変更する場合で
      // かつ値引率も同時に変更する
      if (
        ["unit_sales", "sales_price", "discounted_price"].includes(fieldName) &&
        selectedRowDataProperty &&
        checkNotFalsyExcludeZero(selectedRowDataProperty.sales_price) &&
        checkNotFalsyExcludeZero(selectedRowDataProperty.unit_sales) &&
        checkNotFalsyExcludeZero(selectedRowDataProperty.discounted_price)
      ) {
        // 売上台数、売上価格、値引価格のどれかがnullなら値引率をnullにする
        if (newValue === null) {
          const updatePayload = {
            fieldName: fieldName,
            fieldNameForSelectedRowData: fieldNameForSelectedRowData,
            newValue: newValue,
            id: id,
            discountRate: null,
          };
          // 入力変換確定状態でエンターキーが押された場合の処理
          console.log(
            "onKeyDownイベント エンターキーが入力確定状態でクリック UPDATE実行 null 値引率もnullで更新 updatePayload",
            updatePayload
          );

          await updatePropertyFieldMutation.mutateAsync(updatePayload);
        }
        // 売上台数、売上価格が0円の場合
        else if (["unit_sales", "sales_price"].includes(fieldName) && ["0", "０", 0].includes(newValue)) {
          const updatePayload = {
            fieldName: fieldName,
            fieldNameForSelectedRowData: fieldNameForSelectedRowData,
            newValue: newValue,
            id: id,
            discountRate: null,
          };
          // 入力変換確定状態でエンターキーが押された場合の処理
          console.log(
            "onKeyDownイベント エンターキーが入力確定状態でクリック UPDATE実行 0 値引率nullで更新 updatePayload",
            updatePayload
          );

          await updatePropertyFieldMutation.mutateAsync(updatePayload);
        }
        // それ以外
        else if (checkNotFalsyExcludeZero(newValue)) {
          // 値引率を再計算
          const _salesPriceStr =
            fieldName === "sales_price" ? newValue : selectedRowDataProperty.sales_price!.toString().replace(/,/g, "");
          const _discountPriceStr =
            fieldName === "discounted_price"
              ? newValue
              : selectedRowDataProperty.discounted_price!.toString().replace(/,/g, "");
          const _salesQuantityStr =
            fieldName === "unit_sales" ? newValue.toString() : selectedRowDataProperty.unit_sales!.toString();

          const payload = {
            salesPriceStr: _salesPriceStr,
            discountPriceStr: _discountPriceStr,
            // salesQuantityStr: unitSales.toString(),
            salesQuantityStr: _salesQuantityStr,
          };

          console.log("値引率のpayload", payload);
          const result = calculateDiscountRate(payload);
          const _discountRate = result.discountRate;
          if (!_discountRate || result.error) return console.log("値引率取得エラー リターン：", result.error);

          const updatePayload = {
            fieldName: fieldName,
            fieldNameForSelectedRowData: fieldNameForSelectedRowData,
            newValue: newValue,
            id: id,
            discountRate: _discountRate.replace(/%/g, ""),
          };
          // 入力変換確定状態でエンターキーが押された場合の処理
          console.log(
            "onKeyDownイベント エンターキーが入力確定状態でクリック UPDATE実行 値引率も同時更新 updatePayload",
            updatePayload,
            "selectedRowDataProperty.sales_price",
            selectedRowDataProperty.sales_price,
            "selectedRowDataProperty.unit_sales",
            selectedRowDataProperty.unit_sales,
            "selectedRowDataProperty.discounted_price",
            selectedRowDataProperty.discounted_price
          );
          await updatePropertyFieldMutation.mutateAsync(updatePayload);
        }

        originalValueFieldEdit.current = ""; // 元フィールドデータを空にする
        setIsEditModeField(null); // エディットモードを終了
        return;
      }

      // 通常ルート

      const updatePayload = {
        fieldName: fieldName,
        fieldNameForSelectedRowData: fieldNameForSelectedRowData,
        newValue: newValue,
        id: id,
      };
      // 入力変換確定状態でエンターキーが押された場合の処理
      console.log("onKeyDownイベント エンターキーが入力確定状態でクリック UPDATE実行 updatePayload", updatePayload);
      await updatePropertyFieldMutation.mutateAsync(updatePayload);
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
    newDateObj,
  }: {
    e: React.MouseEvent<HTMLDivElement, MouseEvent>;
    // fieldName: string;
    fieldName: PropertyFieldNames;
    fieldNameForSelectedRowData: PropertyFieldNamesForSelectedRowData;
    originalValue: any;
    newValue: any;
    id: string | undefined;
    required: boolean;
    newDateObj?: Date;
  }) => {
    if (required && (newValue === "" || newValue === null)) return toast.info(`この項目は入力が必須です。`);

    // if (["planned_comment"].includes(fieldName)) {
    //   console.log("e.currentTarget.parentElement", e.currentTarget.parentElement);
    //   console.log("e.currentTarget.parentElement?.parentElement", e.currentTarget.parentElement?.parentElement);
    //   return;
    // }
    if (["planned_start_time", "result_start_time", "result_end_time", "planned_comment"].includes(fieldName)) {
      e.currentTarget.parentElement?.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
      // console.log("originalValue === newValue", originalValue === newValue);
      // return;
    } else {
      e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
    }

    if (!id || !selectedRowDataProperty) {
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

    // 🔹日付関連
    if (
      [
        "expected_order_date",
        "expansion_date",
        "sales_date",
        "property_date",
        "lease_expiration_date",
        "subscription_start_date",
        "subscription_canceled_at",
        "competitor_appearance_date",
      ].includes(fieldName)
    ) {
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
      }
      // 日付変化しているかチェックOK 異なる日付のためUPDATE
      else {
        console.log("日付チェック 新たな日付のためこのまま更新 newValue", newValue);
        // フィールドがproperty_date（案件日）は年月度も, expansion_date, sales_dateの場合は四半期と年月度も同時に更新
        if (fieldName === "property_date" || fieldName === "expansion_date" || fieldName === "sales_date") {
          if (!(newDateObj instanceof Date)) return console.log("Dateオブジェクトでないためリターン");
          if (!closingDayRef.current)
            return toast.error("決算日データが確認できないため、活動を更新できませんでした...🙇‍♀️");
          // if (!(newValue instanceof Date)) return toast.error("エラー：無効な日付です。");
          type ExcludeKeys = "company_id" | "contact_id" | "property_id"; // 除外するキー idはUPDATEすることは無いため
          type PropertyFieldNamesForSelectedRowData = Exclude<keyof Property_row_data, ExcludeKeys>;
          type UpdateObject = {
            fieldName: string;
            fieldNameForSelectedRowData: PropertyFieldNamesForSelectedRowData;
            newValue: any;
            id: string;
            yearMonth?: number | null;
            yearQuarter?: number | null;
          };

          // const fiscalYearMonth = calculateDateToYearMonth(new Date(newValue), closingDayRef.current);
          const fiscalYearMonth = calculateDateToYearMonth(newDateObj, closingDayRef.current);
          console.log("新たに生成された年月度", fiscalYearMonth, "fiedName", fieldName, "newValue", newValue);

          if (!fiscalYearMonth) return toast.error("日付の更新に失敗しました。");

          if (fieldName === "property_date") {
            const updatePayload: UpdateObject = {
              fieldName: fieldName,
              fieldNameForSelectedRowData: fieldNameForSelectedRowData,
              newValue: !!newValue ? newValue : null,
              id: id,
              yearMonth: fiscalYearMonth,
            };
            // 入力変換確定状態でエンターキーが押された場合の処理
            console.log("selectタグでUPDATE実行 updatePayload", updatePayload);
            await updatePropertyFieldMutation.mutateAsync(updatePayload);
          }
          // 展開日付と売上日付は四半期と年月度も同時にUPDATEする
          else if (fieldName === "expansion_date" || fieldName === "sales_date") {
            if (!(newDateObj instanceof Date)) return console.log("Dateオブジェクトでないためリターン");
            const fiscalEndDateObj = fiscalEndMonthObjRef.current;
            if (!fiscalEndDateObj) return alert("エラー：決算日データが見つかりませんでした。");
            const fiscalBasis = userProfileState?.customer_fiscal_year_basis
              ? userProfileState?.customer_fiscal_year_basis
              : "firstDayBasis";
            const fiscalYear = getFiscalYear(
              // newValue,
              newDateObj,
              fiscalEndDateObj.getMonth() + 1,
              fiscalEndDateObj.getDate(),
              fiscalBasis
            );
            // const fiscalQuarter = getFiscalQuarterTest(fiscalEndDateObj, newValue);
            const fiscalQuarter = getFiscalQuarterTest(fiscalEndDateObj, newDateObj);
            const fiscalYearQuarter = fiscalYear * 10 + fiscalQuarter;
            const updatePayload: UpdateObject = {
              fieldName: fieldName,
              fieldNameForSelectedRowData: fieldNameForSelectedRowData,
              newValue: !!newValue ? newValue : null,
              id: id,
              yearMonth: fiscalYearMonth,
              yearQuarter: fiscalYearQuarter,
            };
            // 入力変換確定状態でエンターキーが押された場合の処理
            console.log(
              "selectタグでUPDATE実行 updatePayload",
              updatePayload,
              "fiscalQuarter",
              fiscalQuarter,
              "fiscalYear",
              fiscalYear
            );
            await updatePropertyFieldMutation.mutateAsync(updatePayload);
          }
          originalValueFieldEdit.current = ""; // 元フィールドデータを空にする
          setIsEditModeField(null); // エディットモードを終了
          return;
        }
      }
    }
    // 🔹日付以外
    // 入力値が現在のvalueと同じであれば更新は不要なため閉じてリターン null = null ''とnullもリターン textareaはnullの場合表示は空文字で表示されているため
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

    // 🔹売上台数、売上価格、値引価格の値引率同時更新ルート
    if (
      ["unit_sales", "sales_price", "discounted_price"].includes(fieldName) &&
      selectedRowDataProperty &&
      checkNotFalsyExcludeZero(selectedRowDataProperty.sales_price) &&
      checkNotFalsyExcludeZero(selectedRowDataProperty.unit_sales) &&
      checkNotFalsyExcludeZero(selectedRowDataProperty.discounted_price)
    ) {
      // 売上台数、売上価格、値引価格のどれかがnullなら値引率をnullにする
      if (newValue === null) {
        const updatePayload = {
          fieldName: fieldName,
          fieldNameForSelectedRowData: fieldNameForSelectedRowData,
          newValue: newValue,
          id: id,
          discountRate: null,
        };
        // 入力変換確定状態でエンターキーが押された場合の処理
        console.log(
          "onKeyDownイベント エンターキーが入力確定状態でクリック UPDATE実行 null 値引率もnullで更新 updatePayload",
          updatePayload
        );

        await updatePropertyFieldMutation.mutateAsync(updatePayload);
      }
      // 売上台数、売上価格が0円の場合
      else if (["unit_sales", "sales_price"].includes(fieldName) && ["0", "０", 0].includes(newValue)) {
        const updatePayload = {
          fieldName: fieldName,
          fieldNameForSelectedRowData: fieldNameForSelectedRowData,
          newValue: newValue,
          id: id,
          discountRate: null,
        };
        // 入力変換確定状態でエンターキーが押された場合の処理
        console.log(
          "onKeyDownイベント エンターキーが入力確定状態でクリック UPDATE実行 0 値引率nullで更新 updatePayload",
          updatePayload
        );

        await updatePropertyFieldMutation.mutateAsync(updatePayload);
      }
      // それ以外
      else if (checkNotFalsyExcludeZero(newValue)) {
        // 値引率を再計算
        const _salesPriceStr =
          fieldName === "sales_price" ? newValue : selectedRowDataProperty.sales_price!.toString().replace(/,/g, "");
        const _discountPriceStr =
          fieldName === "discounted_price"
            ? newValue
            : selectedRowDataProperty.discounted_price!.toString().replace(/,/g, "");
        const _salesQuantityStr =
          fieldName === "unit_sales" ? newValue.toString() : selectedRowDataProperty.unit_sales!.toString();

        const payload = {
          salesPriceStr: _salesPriceStr,
          discountPriceStr: _discountPriceStr,
          // salesQuantityStr: unitSales.toString(),
          salesQuantityStr: _salesQuantityStr,
        };

        console.log("値引率のpayload", payload);
        const result = calculateDiscountRate(payload);
        const _discountRate = result.discountRate;
        if (!_discountRate || result.error) return console.log("値引率取得エラー リターン：", result.error);

        const updatePayload = {
          fieldName: fieldName,
          fieldNameForSelectedRowData: fieldNameForSelectedRowData,
          newValue: newValue,
          id: id,
          discountRate: _discountRate.replace(/%/g, ""),
        };
        // 入力変換確定状態でエンターキーが押された場合の処理
        console.log(
          "onKeyDownイベント エンターキーが入力確定状態でクリック UPDATE実行 値引率も同時更新 updatePayload",
          updatePayload,
          "selectedRowDataProperty.sales_price",
          selectedRowDataProperty.sales_price,
          "selectedRowDataProperty.unit_sales",
          selectedRowDataProperty.unit_sales,
          "selectedRowDataProperty.discounted_price",
          selectedRowDataProperty.discounted_price
        );
        await updatePropertyFieldMutation.mutateAsync(updatePayload);
      }

      originalValueFieldEdit.current = ""; // 元フィールドデータを空にする
      setIsEditModeField(null); // エディットモードを終了
      return;
    }

    // 通常ルート

    // requiredがfalseで入力必須ではないので、newValueがnullや空文字、0は許容(空文字や0をnullにするかどうかは各フィールドごとに個別で管理する)

    const updatePayload = {
      fieldName: fieldName,
      fieldNameForSelectedRowData: fieldNameForSelectedRowData,
      newValue: newValue,
      id: id,
    };
    // 入力変換確定状態でエンターキーが押された場合の処理
    console.log("sendアイコンクリックでUPDATE実行 updatePayload", updatePayload);
    await updatePropertyFieldMutation.mutateAsync(updatePayload);
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
    fieldName: PropertyFieldNames;
    fieldNameForSelectedRowData: PropertyFieldNamesForSelectedRowData;
    originalValue: any;
    newValue: any;
    id: string | undefined;
  }) => {
    e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove

    if (!id || !selectedRowDataProperty) {
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
    await updatePropertyFieldMutation.mutateAsync(updatePayload);
    originalValueFieldEdit.current = ""; // 元フィールドデータを空にする
    setIsEditModeField(null); // エディットモードを終了
  };
  // ================== ✅セレクトボックスで個別フィールドをアップデート ==================

  // 四半期のselectタグの選択肢 20211, 20214
  const optionsYearQuarter = useMemo((): number[] => {
    const startYear = 2010;
    const endYear = new Date().getFullYear();

    let yearQuarters: number[] = [];

    for (let year = startYear; year <= endYear; year++) {
      for (let i = 1; i <= 4; i++) {
        const yearQuarter = parseInt(`${year}${i}`, 10); // 20201, 20203
        yearQuarters.push(yearQuarter);
      }
    }
    const sortedYearQuarters = yearQuarters.reverse();
    return sortedYearQuarters;
  }, []);

  // モーダルを閉じる
  const handleCloseDetailModalProperty = () => {
    setIsOpenPropertyDetailModal(false);
  };

  console.log("DetailPropertyModalコンポーネントレンダリング");

  return (
    <>
      {/* オーバーレイ */}
      <div
        className={` fixed inset-0 z-[3900] h-[100vh] w-[100vw] bg-[#00000033] backdrop-blur-[6px]`}
        onClick={handleCloseDetailModalProperty}
      ></div>
      <div className={`${styles.main_container} ${styles.detail_modal} border-real-with-shadow fade05 w-full`}>
        {/* ------------------------- スクロールコンテナ ------------------------- */}
        <div
          className={`${styles.scroll_container} ${styles.detail_modal} relative flex w-full overflow-y-auto pl-[10px]`}
          //   className={`${styles.scroll_container} relative flex w-full overflow-y-auto pl-[10px] ${styles.height_all}`}
        >
          <div className="h-full min-w-[20px]"></div>
          {/* ---------------- 通常モード 左コンテナ ---------------- */}
          <div
            // className={`${styles.left_container1 h-full min-w-[calc((100vw-var(--sidebar-width))/3)1 pb-[35px] pt-[10px]`}
            className={`${styles.left_container} ${styles.detail_modal} ${
              isOpenSidebar ? `transition-base02` : `transition-base01`
            } max-w-[calc((100vw-var(--sidebar-mini-width))/3-11px)]}  h-full min-w-[calc((100vw-var(--sidebar-mini-width))/3-11px)] pb-[35px] pt-[0px]`} // ラージ、ミディアムは右paddingに10px追加されるため10pxを３等分で割り振る(右のみ+1)
          >
            {/* --------- ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full w-full flex-col`}>
              {/* 予定 通常 */}
              {/* 現ステータス */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.section_title}`}>現ｽﾃｰﾀｽ</span>
                    {isEditModeField !== "current_status" && (
                      <span
                        className={`${styles.value} ${styles.editable_field} ${styles.value_highlight} ${styles.text_start} !pl-[0px]`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          handleDoubleClickField({
                            e,
                            field: "current_status",
                            dispatch: setInputCurrentStatus,
                            dateValue: selectedRowDataProperty?.current_status
                              ? selectedRowDataProperty.current_status
                              : null,
                          });
                        }}
                      >
                        {selectedRowDataProperty?.current_status
                          ? getCurrentStatus(selectedRowDataProperty?.current_status)
                          : ""}
                      </span>
                    )}

                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード selectタグ  */}
                    {isEditModeField === "current_status" && (
                      <>
                        <select
                          className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                          value={inputCurrentStatus}
                          onChange={(e) => {
                            handleChangeSelectUpdateField({
                              e,
                              fieldName: "current_status",
                              fieldNameForSelectedRowData: "current_status",
                              newValue: e.target.value,
                              originalValue: originalValueFieldEdit.current,
                              id: selectedRowDataProperty?.property_id,
                            });
                          }}
                        >
                          {optionsCurrentStatus.map((option) => (
                            <option key={option} value={option}>
                              {getCurrentStatus(option)}
                            </option>
                          ))}
                        </select>
                        {/* エディットフィールド送信中ローディングスピナー */}
                        {updatePropertyFieldMutation.isLoading && (
                          <div
                            className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                          >
                            <SpinnerComet w="22px" h="22px" s="3px" />
                          </div>
                        )}
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {isEditModeField === "current_status" && (
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
                  <div className={`${styles.section_underline}`}></div>
                </div>
              </div>

              {/* 案件名 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>●案件名</span>
                    {isEditModeField !== "property_name" && (
                      <span
                        className={`${styles.value} ${styles.value_highlight} ${styles.text_start} ${styles.editable_field}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          if (!selectedRowDataProperty?.property_name) return;
                          // if (isNotActivityTypeArray.includes(selectedRowDataProperty.property_name))
                          //   return alert(returnMessageNotActivity(selectedRowDataProperty.property_name));
                          handleDoubleClickField({
                            e,
                            field: "property_name",
                            dispatch: setInputPropertyName,
                          });
                          if (hoveredItemPosWrap) handleCloseTooltip();
                        }}
                        data-text={`${
                          selectedRowDataProperty?.property_name ? selectedRowDataProperty?.property_name : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          if (hoveredItemPosWrap) handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.property_name ? selectedRowDataProperty?.property_name : ""}
                      </span>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード selectタグ  */}
                    {isEditModeField === "property_name" && (
                      <>
                        <input
                          type="text"
                          placeholder=""
                          autoFocus
                          className={`${styles.input_box} ${styles.field_edit_mode_input_box_with_close}`}
                          value={inputPropertyName}
                          // value={selectedRowDataCompany?.name ? selectedRowDataCompany?.name : ""}
                          onChange={(e) => setInputPropertyName(e.target.value)}
                          // onBlur={() => setInputName(toHalfWidthAndSpace(inputName.trim()))}
                          onCompositionStart={() => setIsComposing(true)}
                          onCompositionEnd={() => setIsComposing(false)}
                          onKeyDown={async (e) => {
                            handleKeyDownUpdateField({
                              e,
                              fieldName: "property_name",
                              fieldNameForSelectedRowData: "property_name",
                              newValue: inputPropertyName.trim(),
                              originalValue: originalValueFieldEdit.current,
                              id: selectedRowDataProperty?.property_id,
                              required: true,
                            });
                          }}
                        />
                        {/* 送信ボタンとクローズボタン */}
                        {!updatePropertyFieldMutation.isLoading && (
                          <InputSendAndCloseBtn
                            inputState={inputPropertyName}
                            setInputState={setInputPropertyName}
                            onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                              handleClickSendUpdateField({
                                e,
                                fieldName: "property_name",
                                fieldNameForSelectedRowData: "property_name",
                                newValue: inputPropertyName.trim(),
                                originalValue: originalValueFieldEdit.current,
                                id: selectedRowDataProperty?.property_id,
                                required: true,
                              })
                            }
                            required={true}
                          />
                        )}
                        {/* エディットフィールド送信中ローディングスピナー */}
                        {updatePropertyFieldMutation.isLoading && (
                          <div className={`${styles.field_edit_mode_loading_area}`}>
                            <SpinnerComet w="22px" h="22px" s="3px" />
                          </div>
                        )}
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {isEditModeField === "property_name" && (
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

              {/* 案件概要 通常 */}
              <div className={`${styles.row_area_lg_box} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full `}>
                    <span className={`${styles.title} ${styles.title_sm}`}>案件概要</span>
                    {isEditModeField !== "property_summary" && (
                      <div
                        className={`${styles.textarea_box} ${styles.editable_field}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          // if (!selectedRowDataProperty?.activity_type) return;
                          // if (isNotActivityTypeArray.includes(selectedRowDataProperty.activity_type))
                          //   return alert(returnMessageNotActivity(selectedRowDataProperty.activity_type));
                          handleCloseTooltip();
                          handleDoubleClickField({
                            e,
                            field: "property_summary",
                            dispatch: setInputPropertySummary,
                            selectedRowDataValue: selectedRowDataProperty?.property_summary
                              ? selectedRowDataProperty?.property_summary
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
                          __html: selectedRowDataProperty?.property_summary
                            ? selectedRowDataProperty?.property_summary.replace(/\n/g, "<br>")
                            : "",
                        }}
                      ></div>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード inputタグ */}
                    {isEditModeField === "property_summary" && (
                      <>
                        <textarea
                          cols={30}
                          // rows={10}
                          placeholder=""
                          style={{ whiteSpace: "pre-wrap" }}
                          className={`${styles.textarea_box} ${styles.textarea_box_search_mode} ${styles.field_edit_mode_textarea} ${styles.xl}`}
                          value={inputPropertySummary}
                          onChange={(e) => setInputPropertySummary(e.target.value)}
                        ></textarea>
                        {/* 送信ボタンとクローズボタン */}
                        <InputSendAndCloseBtn
                          inputState={inputPropertySummary}
                          setInputState={setInputPropertySummary}
                          onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                            handleClickSendUpdateField({
                              e,
                              fieldName: "property_summary",
                              fieldNameForSelectedRowData: "property_summary",
                              originalValue: originalValueFieldEdit.current,
                              newValue: inputPropertySummary ? inputPropertySummary.trim() : null,
                              id: selectedRowDataProperty?.property_id,
                              required: false,
                            })
                          }
                          required={false}
                          // isDisplayClose={true}
                          // btnPositionY="bottom-[8px]"
                          isOutside={true}
                          outsidePosition="under_right"
                          isLoadingSendEvent={updatePropertyFieldMutation.isLoading}
                        />
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {isEditModeField === "property_summary" && (
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

              {/* 商品・予定台数 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} text-[12px]`}>商品</span>
                    <span
                      className={`${styles.value}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {/* {selectedRowDataProperty?.product_name ? selectedRowDataProperty?.product_name : ""} */}
                      {selectedRowDataProperty?.expected_product ? selectedRowDataProperty?.expected_product : ""}
                    </span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} text-[12px]`}>予定台数</span>
                    {isEditModeField !== "product_sales" && (
                      <span
                        className={`${styles.value} ${styles.editable_field}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          if (!selectedRowDataProperty?.product_sales) return;
                          // if (isNotActivityTypeArray.includes(selectedRowDataProperty.product_sales))
                          //   return alert(returnMessageNotActivity(selectedRowDataProperty.product_sales));
                          handleDoubleClickField({
                            e,
                            field: "product_sales",
                            dispatch: setInputProductSales,
                          });
                          if (hoveredItemPosWrap) handleCloseTooltip();
                        }}
                        data-text={`${
                          selectedRowDataProperty?.product_sales ? selectedRowDataProperty?.product_sales : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        {selectedRowDataProperty?.product_sales ? selectedRowDataProperty?.product_sales : ""}
                      </span>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード selectタグ  */}
                    {isEditModeField === "product_sales" && (
                      <>
                        <input
                          type="number"
                          min="0"
                          autoFocus
                          className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                          placeholder=""
                          value={inputProductSales === null ? "" : inputProductSales}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") {
                              setInputProductSales(null);
                            } else {
                              const numValue = Number(val);

                              // 入力値がマイナスかチェック
                              if (numValue < 0) {
                                setInputProductSales(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                              } else {
                                setInputProductSales(numValue);
                              }
                            }
                          }}
                          onCompositionStart={() => setIsComposing(true)}
                          onCompositionEnd={() => setIsComposing(false)}
                          onKeyDown={(e) =>
                            handleKeyDownUpdateField({
                              e,
                              fieldName: "product_sales",
                              fieldNameForSelectedRowData: "product_sales",
                              originalValue: originalValueFieldEdit.current,
                              newValue: inputProductSales,
                              id: selectedRowDataProperty?.property_id,
                              required: false,
                            })
                          }
                        />
                        {/* 送信ボタンとクローズボタン */}
                        {!updatePropertyFieldMutation.isLoading && (
                          <InputSendAndCloseBtn<number | null>
                            inputState={inputProductSales}
                            setInputState={setInputProductSales}
                            onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                              handleClickSendUpdateField({
                                e,
                                fieldName: "product_sales",
                                fieldNameForSelectedRowData: "product_sales",
                                originalValue: originalValueFieldEdit.current,
                                newValue: inputProductSales,
                                id: selectedRowDataProperty?.property_id,
                                required: false,
                              })
                            }
                            required={true}
                            isDisplayClose={false}
                          />
                        )}
                        {/* エディットフィールド送信中ローディングスピナー */}
                        {updatePropertyFieldMutation.isLoading && (
                          <div
                            className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                          >
                            <SpinnerComet w="22px" h="22px" s="3px" />
                          </div>
                        )}
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {isEditModeField === "product_sales" && (
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

              {/* 獲得予定時期・予定売上 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    {/* <span className={`${styles.title}`}>予定時期</span> */}
                    <div className={`${styles.title} flex flex-col ${styles.double_text}`}>
                      <span>獲得予定</span>
                      <span>時期</span>
                    </div>
                    {isEditModeField !== "expected_order_date" && (
                      <span
                        className={`${styles.value} ${styles.editable_field}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          // if (!selectedRowDataProperty?.activity_type) return;
                          // if (isNotActivityTypeArray.includes(selectedRowDataProperty.activity_type)) {
                          //   return alert(returnMessageNotActivity(selectedRowDataProperty.activity_type));
                          // }
                          handleDoubleClickField({
                            e,
                            field: "expected_order_date",
                            dispatch: setInputExpectedOrderDateForFieldEditMode,
                            dateValue: selectedRowDataProperty?.expected_order_date
                              ? selectedRowDataProperty.expected_order_date
                              : null,
                          });
                        }}
                        data-text={`${
                          selectedRowDataProperty?.expected_order_date
                            ? format(new Date(selectedRowDataProperty.expected_order_date), "yyyy/MM/dd")
                            : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth)
                            handleOpenTooltip({
                              e: e,
                              display: "top",
                              // marginTop: 57,
                              // marginTop: 38,
                              // marginTop: 12,
                              // itemsPosition: "center",
                              // whiteSpace: "nowrap",
                            });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          if (hoveredItemPosWrap) handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.expected_order_date
                          ? format(new Date(selectedRowDataProperty.expected_order_date), "yyyy/MM/dd")
                          : ""}
                      </span>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード Date-picker  */}
                    {isEditModeField === "expected_order_date" && (
                      <>
                        <div className="z-[2000] w-full">
                          <DatePickerCustomInput
                            startDate={inputExpectedOrderDateForFieldEditMode}
                            setStartDate={setInputExpectedOrderDateForFieldEditMode}
                            required={true}
                            isFieldEditMode={true}
                            fieldEditModeBtnAreaPosition="right"
                            isLoadingSendEvent={updatePropertyFieldMutation.isLoading}
                            onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                              if (!inputExpectedOrderDateForFieldEditMode) return alert("このデータは入力が必須です。");
                              const originalDateUTCString = selectedRowDataProperty?.expected_order_date
                                ? selectedRowDataProperty.expected_order_date
                                : null; // ISOString UTC時間 2023-12-26T15:00:00+00:00
                              const newDateUTCString = inputExpectedOrderDateForFieldEditMode
                                ? inputExpectedOrderDateForFieldEditMode.toISOString()
                                : null; // Dateオブジェクト ローカルタイムゾーンに自動で変換済み Thu Dec 28 2023 00:00:00 GMT+0900 (日本標準時)
                              // const result = isSameDateLocal(originalDateString, newDateString);
                              console.log(
                                "日付送信クリック",
                                "オリジナル(UTC)",
                                originalDateUTCString,
                                "新たな値(Dateオブジェクト)",
                                inputExpectedOrderDateForFieldEditMode,
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
                                fieldName: "expected_order_date",
                                fieldNameForSelectedRowData: "expected_order_date",
                                // originalValue: originalValueFieldEdit.current,
                                originalValue: originalDateUTCString,
                                newValue: newDateUTCString,
                                id: selectedRowDataProperty?.property_id,
                                required: true,
                              });
                            }}
                          />
                        </div>
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {isEditModeField === "expected_order_date" && (
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
                    <span className={`${styles.title}`}>予定売上</span>
                    {isEditModeField !== "expected_sales_price" && (
                      <span
                        className={`${styles.value} ${styles.editable_field}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          if (!selectedRowDataProperty?.expected_sales_price) return;
                          // if (isNotActivityTypeArray.includes(selectedRowDataProperty.expected_sales_price))
                          //   return alert(returnMessageNotActivity(selectedRowDataProperty.expected_sales_price));
                          handleDoubleClickField({
                            e,
                            field: "expected_sales_price",
                            dispatch: setInputExpectedSalesPrice,
                          });
                          if (hoveredItemPosWrap) handleCloseTooltip();
                        }}
                        data-text={`${
                          selectedRowDataProperty?.expected_sales_price
                            ? selectedRowDataProperty?.expected_sales_price
                            : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        {selectedRowDataProperty?.expected_sales_price
                          ? Number(selectedRowDataProperty?.expected_sales_price).toLocaleString() + "円"
                          : ""}
                      </span>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード selectタグ  */}
                    {isEditModeField === "expected_sales_price" && (
                      <>
                        <input
                          type="text"
                          autoFocus
                          // placeholder="例：600万円 → 6000000　※半角で入力"
                          className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                          onCompositionStart={() => setIsComposing(true)}
                          onCompositionEnd={() => setIsComposing(false)}
                          value={!!inputExpectedSalesPrice ? inputExpectedSalesPrice : ""}
                          onChange={(e) => setInputExpectedSalesPrice(e.target.value)}
                          // onBlur={() => {
                          //   setInputExpectedSalesPrice(
                          //     !!inputExpectedSalesPrice &&
                          //       inputExpectedSalesPrice !== "" &&
                          //       convertToYen(inputExpectedSalesPrice.trim()) !== null
                          //       ? (convertToYen(inputExpectedSalesPrice.trim()) as number).toLocaleString()
                          //       : ""
                          //   );
                          // }}
                          onKeyDown={(e) =>
                            handleKeyDownUpdateField({
                              e,
                              fieldName: "expected_sales_price",
                              fieldNameForSelectedRowData: "expected_sales_price",
                              originalValue: originalValueFieldEdit.current,
                              newValue: inputExpectedSalesPrice
                                ? (convertToYen(inputExpectedSalesPrice.trim()) as number).toString()
                                : null,
                              id: selectedRowDataProperty?.property_id,
                              required: false,
                            })
                          }
                        />
                        {/* 送信ボタンとクローズボタン */}
                        {!updatePropertyFieldMutation.isLoading && (
                          <InputSendAndCloseBtn<string>
                            inputState={inputExpectedSalesPrice}
                            setInputState={setInputExpectedSalesPrice}
                            onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                              handleClickSendUpdateField({
                                e,
                                fieldName: "expected_sales_price",
                                fieldNameForSelectedRowData: "expected_sales_price",
                                originalValue: originalValueFieldEdit.current,
                                newValue: inputExpectedSalesPrice
                                  ? (convertToYen(inputExpectedSalesPrice.trim()) as number).toString()
                                  : null,
                                id: selectedRowDataProperty?.property_id,
                                required: false,
                              })
                            }
                            required={false}
                            isDisplayClose={false}
                          />
                        )}

                        {/* エディットフィールド送信中ローディングスピナー */}
                        {updatePropertyFieldMutation.isLoading && (
                          <div
                            className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                          >
                            <SpinnerComet w="22px" h="22px" s="3px" />
                          </div>
                        )}
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {isEditModeField === "expected_sales_price" && (
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

              {/* 今期・来期 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} text-[12px]`}>今・来期</span>
                    {isEditModeField !== "term_division" && (
                      <span
                        className={`${styles.value} ${styles.editable_field}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          if (!selectedRowDataProperty?.term_division) return;
                          // if (isNotActivityTypeArray.includes(selectedRowDataProperty.term_division))
                          //   return alert(returnMessageNotActivity(selectedRowDataProperty.term_division));
                          handleDoubleClickField({
                            e,
                            field: "term_division",
                            dispatch: setInputTermDivision,
                          });
                          if (hoveredItemPosWrap) handleCloseTooltip();
                        }}
                        data-text={`${
                          selectedRowDataProperty?.term_division
                            ? getTermDivision(selectedRowDataProperty?.term_division)
                            : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        {selectedRowDataProperty?.term_division
                          ? getTermDivision(selectedRowDataProperty?.term_division)
                          : ""}
                      </span>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード selectタグ  */}
                    {isEditModeField === "term_division" && (
                      <>
                        <select
                          className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                          value={inputTermDivision}
                          onChange={(e) => {
                            handleChangeSelectUpdateField({
                              e,
                              fieldName: "term_division",
                              fieldNameForSelectedRowData: "term_division",
                              newValue: e.target.value,
                              originalValue: originalValueFieldEdit.current,
                              id: selectedRowDataProperty?.property_id,
                            });
                          }}
                          // onChange={(e) => {
                          //   setInputActivityType(e.target.value);
                          // }}
                        >
                          {/* <option value=""></option> */}
                          {optionsTermDivision.map((option) => (
                            <option key={option} value={option}>
                              {getTermDivision(option)}
                              {/* {option === "今期" && `今期 (今期に獲得予定)`}
                              {option === "来期" && `来期 (来期に獲得予定)`} */}
                            </option>
                          ))}
                          {/* <option value="今期">今期</option>
                          <option value="来期">来期</option> */}
                        </select>
                        {/* エディットフィールド送信中ローディングスピナー */}
                        {updatePropertyFieldMutation.isLoading && (
                          <div
                            className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                          >
                            <SpinnerComet w="22px" h="22px" s="3px" />
                          </div>
                        )}
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {isEditModeField === "term_division" && (
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
                  {/* <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} text-[12px]`}></span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                      >
                        {selectedRowDataProperty?.product_sales ? selectedRowDataProperty?.product_sales : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div> */}
                </div>
              </div>

              {/* 売上商品・売上台数 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} text-[12px]`}>売上商品</span>
                    <span
                      className={`${styles.value}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {/* {selectedRowDataProperty?.sold_product_name ? selectedRowDataProperty?.sold_product_name : ""} */}
                      {selectedRowDataProperty?.sold_product ? selectedRowDataProperty?.sold_product : ""}
                    </span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} text-[12px]`}>売上台数</span>
                    {isEditModeField !== "unit_sales" && (
                      <span
                        className={`${styles.value} ${styles.editable_field}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          if (!selectedRowDataProperty?.unit_sales) return;
                          // if (isNotActivityTypeArray.includes(selectedRowDataProperty.unit_sales))
                          //   return alert(returnMessageNotActivity(selectedRowDataProperty.unit_sales));
                          handleDoubleClickField({
                            e,
                            field: "unit_sales",
                            dispatch: setInputUnitSales,
                          });
                          if (hoveredItemPosWrap) handleCloseTooltip();
                        }}
                        data-text={`${selectedRowDataProperty?.unit_sales ? selectedRowDataProperty?.unit_sales : ""}`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        {selectedRowDataProperty?.unit_sales ? selectedRowDataProperty?.unit_sales : ""}
                      </span>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード selectタグ  */}
                    {isEditModeField === "unit_sales" && (
                      <>
                        <input
                          type="number"
                          min="0"
                          autoFocus
                          className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                          placeholder=""
                          value={inputUnitSales === null ? "" : inputUnitSales}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "" || val === "0" || val === "０") {
                              setInputUnitSales(null);
                            } else {
                              const numValue = Number(val);

                              // 入力値がマイナスかチェック
                              if (numValue < 0) {
                                setInputUnitSales(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                              } else {
                                setInputUnitSales(numValue);
                              }
                            }
                          }}
                          onCompositionStart={() => setIsComposing(true)}
                          onCompositionEnd={() => setIsComposing(false)}
                          onKeyDown={(e) =>
                            handleKeyDownUpdateField({
                              e,
                              fieldName: "unit_sales",
                              fieldNameForSelectedRowData: "unit_sales",
                              originalValue: originalValueFieldEdit.current,
                              newValue:
                                inputUnitSales && inputUnitSales.toString().trim()
                                  ? inputUnitSales.toString().trim()
                                  : null,
                              id: selectedRowDataProperty?.property_id,
                              required: false,
                            })
                          }
                        />
                        {/* 送信ボタンとクローズボタン */}
                        {!updatePropertyFieldMutation.isLoading && (
                          <InputSendAndCloseBtn<number | null>
                            inputState={inputUnitSales}
                            setInputState={setInputUnitSales}
                            onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                              handleClickSendUpdateField({
                                e,
                                fieldName: "unit_sales",
                                fieldNameForSelectedRowData: "unit_sales",
                                originalValue: originalValueFieldEdit.current,
                                newValue: inputUnitSales ? inputUnitSales.toString() : null,
                                id: selectedRowDataProperty?.property_id,
                                required: false,
                              })
                            }
                            required={true}
                            isDisplayClose={false}
                          />
                        )}
                        {/* エディットフィールド送信中ローディングスピナー */}
                        {updatePropertyFieldMutation.isLoading && (
                          <div
                            className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                          >
                            <SpinnerComet w="22px" h="22px" s="3px" />
                          </div>
                        )}
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {isEditModeField === "unit_sales" && (
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

              {/* 売上貢献区分・売上価格 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <div className={`${styles.title} flex flex-col ${styles.double_text}`}>
                      <span>売上貢献</span>
                      <span>区分</span>
                    </div>
                    {isEditModeField !== "sales_contribution_category" && (
                      <span
                        className={`${styles.value} ${styles.editable_field}`}
                        // onMouseEnter={(e) => handleOpenTooltip({ e, display: "top" })}
                        // onMouseLeave={handleCloseTooltip}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          if (!selectedRowDataProperty?.sales_contribution_category) return;
                          // if (isNotActivityTypeArray.includes(selectedRowDataProperty.sales_contribution_category))
                          //   return alert(returnMessageNotActivity(selectedRowDataProperty.sales_contribution_category));
                          handleDoubleClickField({
                            e,
                            field: "sales_contribution_category",
                            dispatch: setInputSalesContributionCategory,
                          });
                          if (hoveredItemPosWrap) handleCloseTooltip();
                        }}
                        data-text={
                          selectedRowDataProperty?.sales_contribution_category
                            ? getSalesContributionCategory(selectedRowDataProperty?.sales_contribution_category)
                            : ""
                        }
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);

                          handleOpenTooltip({ e, display: "top" });
                          // handleOpenTooltip({ e });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);

                          if (hoveredItemPosWrap) handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.sales_contribution_category
                          ? getSalesContributionCategory(selectedRowDataProperty?.sales_contribution_category)
                          : ""}
                      </span>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード selectタグ  */}
                    {isEditModeField === "sales_contribution_category" && (
                      <>
                        <select
                          className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                          value={inputSalesContributionCategory}
                          onChange={(e) => {
                            handleChangeSelectUpdateField({
                              e,
                              fieldName: "sales_contribution_category",
                              fieldNameForSelectedRowData: "sales_contribution_category",
                              newValue: e.target.value,
                              originalValue: originalValueFieldEdit.current,
                              id: selectedRowDataProperty?.property_id,
                            });
                          }}
                        >
                          {optionsSalesContributionCategory.map((option) => (
                            <option key={option} value={option}>
                              {getSalesContributionCategory(option)}
                            </option>
                          ))}
                        </select>
                        {/* エディットフィールド送信中ローディングスピナー */}
                        {updatePropertyFieldMutation.isLoading && (
                          <div
                            className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                          >
                            <SpinnerComet w="22px" h="22px" s="3px" />
                          </div>
                        )}
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {isEditModeField === "sales_contribution_category" && (
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
                    <span className={`${styles.title} text-[12px]`}>売上価格</span>
                    {isEditModeField !== "sales_price" && (
                      <span
                        className={`${styles.value} ${styles.editable_field}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          if (!checkNotFalsyExcludeZero(selectedRowDataProperty?.sales_price)) return;
                          // if (isNotActivityTypeArray.includes(selectedRowDataProperty.sales_price))
                          //   return alert(returnMessageNotActivity(selectedRowDataProperty.sales_price));
                          handleDoubleClickField({
                            e,
                            field: "sales_price",
                            dispatch: setInputSalesPrice,
                          });
                          if (hoveredItemPosWrap) handleCloseTooltip();
                        }}
                        data-text={`${
                          selectedRowDataProperty?.sales_price ? selectedRowDataProperty?.sales_price : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        {checkNotFalsyExcludeZero(selectedRowDataProperty?.sales_price)
                          ? Number(selectedRowDataProperty?.sales_price).toLocaleString() + "円"
                          : ""}
                      </span>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード selectタグ  */}
                    {isEditModeField === "sales_price" && (
                      <>
                        <input
                          type="text"
                          autoFocus
                          // placeholder="例：600万円 → 6000000　※半角で入力"
                          className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                          onCompositionStart={() => setIsComposing(true)}
                          onCompositionEnd={() => setIsComposing(false)}
                          value={checkNotFalsyExcludeZero(inputSalesPrice) ? inputSalesPrice : ""}
                          onChange={(e) => {
                            if (e.target.value === "0" || e.target.value === "０") {
                              setInputSalesPrice("0");
                            }
                            setInputSalesPrice(e.target.value);
                          }}
                          // onBlur={() => {
                          //   setInputSalesPrice(
                          //     !!inputSalesPrice &&
                          //       inputSalesPrice !== "" &&
                          //       convertToYen(inputSalesPrice.trim()) !== null
                          //       ? (convertToYen(inputSalesPrice.trim()) as number).toLocaleString()
                          //       : ""
                          //   );
                          // }}
                          onKeyDown={(e) => {
                            handleKeyDownUpdateField({
                              e,
                              fieldName: "sales_price",
                              fieldNameForSelectedRowData: "sales_price",
                              originalValue: originalValueFieldEdit.current,
                              newValue: !!inputSalesPrice
                                ? (convertToYen(inputSalesPrice.trim()) as number).toString()
                                : null,
                              id: selectedRowDataProperty?.property_id,
                              required: false,
                            });
                          }}
                        />
                        {/* 送信ボタンとクローズボタン */}
                        {!updatePropertyFieldMutation.isLoading && (
                          <InputSendAndCloseBtn<string>
                            inputState={inputSalesPrice}
                            setInputState={setInputSalesPrice}
                            onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                              handleClickSendUpdateField({
                                e,
                                fieldName: "sales_price",
                                fieldNameForSelectedRowData: "sales_price",
                                originalValue: originalValueFieldEdit.current,
                                newValue: inputSalesPrice
                                  ? (convertToYen(inputSalesPrice.trim()) as number).toString()
                                  : null,
                                id: selectedRowDataProperty?.property_id,
                                required: false,
                              })
                            }
                            required={false}
                            isDisplayClose={false}
                          />
                        )}

                        {/* エディットフィールド送信中ローディングスピナー */}
                        {updatePropertyFieldMutation.isLoading && (
                          <div
                            className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                          >
                            <SpinnerComet w="22px" h="22px" s="3px" />
                          </div>
                        )}
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {isEditModeField === "sales_price" && (
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

              {/* 値引価格・値引率 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} text-[12px]`}>値引価格</span>
                    {isEditModeField !== "discounted_price" && (
                      <span
                        className={`${styles.value} ${styles.editable_field}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          if (!checkNotFalsyExcludeZero(selectedRowDataProperty?.discounted_price)) return;
                          // if (isNotActivityTypeArray.includes(selectedRowDataProperty.discounted_price))
                          //   return alert(returnMessageNotActivity(selectedRowDataProperty.discounted_price));
                          handleDoubleClickField({
                            e,
                            field: "discounted_price",
                            dispatch: setInputDiscountedPrice,
                          });
                          if (hoveredItemPosWrap) handleCloseTooltip();
                        }}
                        data-text={`${
                          selectedRowDataProperty?.discounted_price ? selectedRowDataProperty?.discounted_price : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        {checkNotFalsyExcludeZero(selectedRowDataProperty?.discounted_price)
                          ? Number(selectedRowDataProperty?.discounted_price).toLocaleString() + "円"
                          : ""}
                      </span>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード selectタグ  */}
                    {isEditModeField === "discounted_price" && (
                      <>
                        <input
                          type="text"
                          autoFocus
                          // placeholder="例：600万円 → 6000000　※半角で入力"
                          className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                          onCompositionStart={() => setIsComposing(true)}
                          onCompositionEnd={() => setIsComposing(false)}
                          value={checkNotFalsyExcludeZero(inputDiscountedPrice) ? inputDiscountedPrice : ""}
                          onChange={(e) => setInputDiscountedPrice(e.target.value)}
                          // onBlur={() => {
                          //   setInputDiscountedPrice(
                          //     !!inputDiscountedPrice &&
                          //       inputDiscountedPrice !== "" &&
                          //       convertToYen(inputDiscountedPrice.trim()) !== null
                          //       ? (convertToYen(inputDiscountedPrice.trim()) as number).toLocaleString()
                          //       : ""
                          //   );
                          // }}
                          onKeyDown={(e) => {
                            handleKeyDownUpdateField({
                              e,
                              fieldName: "discounted_price",
                              fieldNameForSelectedRowData: "discounted_price",
                              originalValue: originalValueFieldEdit.current,
                              newValue: !!inputDiscountedPrice
                                ? (convertToYen(inputDiscountedPrice.trim()) as number).toString()
                                : null,
                              id: selectedRowDataProperty?.property_id,
                              required: false,
                            });
                          }}
                        />
                        {/* 送信ボタンとクローズボタン */}
                        {!updatePropertyFieldMutation.isLoading && (
                          <InputSendAndCloseBtn<string>
                            inputState={inputDiscountedPrice}
                            setInputState={setInputDiscountedPrice}
                            onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                              handleClickSendUpdateField({
                                e,
                                fieldName: "discounted_price",
                                fieldNameForSelectedRowData: "discounted_price",
                                originalValue: originalValueFieldEdit.current,
                                newValue: inputDiscountedPrice
                                  ? (convertToYen(inputDiscountedPrice.trim()) as number).toString()
                                  : null,
                                id: selectedRowDataProperty?.property_id,
                                required: false,
                              })
                            }
                            required={false}
                            isDisplayClose={false}
                          />
                        )}

                        {/* エディットフィールド送信中ローディングスピナー */}
                        {updatePropertyFieldMutation.isLoading && (
                          <div
                            className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                          >
                            <SpinnerComet w="22px" h="22px" s="3px" />
                          </div>
                        )}
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {isEditModeField === "discounted_price" && (
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
                    <span
                      className={`${styles.value}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {checkNotFalsyExcludeZero(selectedRowDataProperty?.discount_rate)
                        ? normalizeDiscountRate(selectedRowDataProperty!.discount_rate!.toString())
                        : ""}
                    </span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 導入分類 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} text-[12px]`}>導入分類</span>
                    {isEditModeField !== "sales_class" && (
                      <span
                        className={`${styles.value} ${styles.editable_field}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          if (!selectedRowDataProperty?.sales_class) return;
                          // if (isNotActivityTypeArray.includes(selectedRowDataProperty.sales_class))
                          //   return alert(returnMessageNotActivity(selectedRowDataProperty.sales_class));
                          handleDoubleClickField({
                            e,
                            field: "sales_class",
                            dispatch: setInputSalesClass,
                          });
                          if (hoveredItemPosWrap) handleCloseTooltip();
                        }}
                        data-text={`${
                          selectedRowDataProperty?.sales_class
                            ? getSalesClass(selectedRowDataProperty?.sales_class)
                            : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        {selectedRowDataProperty?.sales_class
                          ? getSalesClass(selectedRowDataProperty?.sales_class)
                          : ""}
                      </span>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード selectタグ  */}
                    {isEditModeField === "sales_class" && (
                      <>
                        <select
                          className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                          value={inputSalesClass}
                          onChange={(e) => {
                            handleChangeSelectUpdateField({
                              e,
                              fieldName: "sales_class",
                              fieldNameForSelectedRowData: "sales_class",
                              newValue: e.target.value,
                              originalValue: originalValueFieldEdit.current,
                              id: selectedRowDataProperty?.property_id,
                            });
                          }}
                          // onChange={(e) => {
                          //   setInputActivityType(e.target.value);
                          // }}
                        >
                          {/* <option value=""></option> */}
                          {optionsSalesClass.map((option) => (
                            <option key={option} value={option}>
                              {getSalesClass(option)}
                            </option>
                          ))}
                        </select>
                        {/* エディットフィールド送信中ローディングスピナー */}
                        {updatePropertyFieldMutation.isLoading && (
                          <div
                            className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                          >
                            <SpinnerComet w="22px" h="22px" s="3px" />
                          </div>
                        )}
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {isEditModeField === "sales_class" && (
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
                  {/* <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} text-[12px]`}></span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataProperty?.sales_price ? selectedRowDataProperty?.sales_price : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div> */}
                </div>
              </div>

              {/* サブスク分類 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    {/* <span className={`${styles.title} text-[12px]`}>サブスク分類</span> */}
                    <div className={`${styles.title} flex flex-col ${styles.double_text}`}>
                      <span>サブスク</span>
                      <span>分類</span>
                    </div>
                    {isEditModeField !== "subscription_interval" && (
                      <span
                        className={`${styles.value} ${styles.editable_field}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          if (!selectedRowDataProperty?.subscription_interval) return;
                          // if (isNotActivityTypeArray.includes(selectedRowDataProperty.subscription_interval))
                          //   return alert(returnMessageNotActivity(selectedRowDataProperty.subscription_interval));
                          handleDoubleClickField({
                            e,
                            field: "subscription_interval",
                            dispatch: setInputSubscriptionInterval,
                          });
                          if (hoveredItemPosWrap) handleCloseTooltip();
                        }}
                        data-text={`${
                          selectedRowDataProperty?.subscription_interval
                            ? getSubscriptionInterval(selectedRowDataProperty?.subscription_interval)
                            : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        {selectedRowDataProperty?.subscription_interval
                          ? getSubscriptionInterval(selectedRowDataProperty?.subscription_interval)
                          : ""}
                      </span>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード selectタグ  */}
                    {isEditModeField === "subscription_interval" && (
                      <>
                        <select
                          className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                          value={inputSubscriptionInterval}
                          onChange={(e) => {
                            handleChangeSelectUpdateField({
                              e,
                              fieldName: "subscription_interval",
                              fieldNameForSelectedRowData: "subscription_interval",
                              newValue: e.target.value,
                              originalValue: originalValueFieldEdit.current,
                              id: selectedRowDataProperty?.property_id,
                            });
                          }}
                          // onChange={(e) => {
                          //   setInputActivityType(e.target.value);
                          // }}
                        >
                          <option value=""></option>
                          {optionsSubscriptionInterval.map((option) => (
                            <option key={option} value={option}>
                              {getSubscriptionInterval(option)}
                            </option>
                          ))}
                        </select>
                        {/* エディットフィールド送信中ローディングスピナー */}
                        {updatePropertyFieldMutation.isLoading && (
                          <div
                            className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                          >
                            <SpinnerComet w="22px" h="22px" s="3px" />
                          </div>
                        )}
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {isEditModeField === "subscription_interval" && (
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
                  {/* <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} text-[12px]`}></span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataProperty?.discount_rate ? selectedRowDataProperty?.discount_rate : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div> */}
                </div>
              </div>

              {/* サブスク開始日・サブスク解約日 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <div className={`${styles.title} flex flex-col ${styles.double_text}`}>
                      <span>サブスク</span>
                      <span>開始日</span>
                    </div>
                    {isEditModeField !== "subscription_start_date" && (
                      <span
                        className={`${styles.value} ${styles.editable_field}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          // if (!selectedRowDataProperty?.activity_type) return;
                          // if (isNotActivityTypeArray.includes(selectedRowDataProperty.activity_type)) {
                          //   return alert(returnMessageNotActivity(selectedRowDataProperty.activity_type));
                          // }
                          handleDoubleClickField({
                            e,
                            field: "subscription_start_date",
                            dispatch: setInputSubscriptionStartDate,
                            dateValue: selectedRowDataProperty?.subscription_start_date
                              ? selectedRowDataProperty.subscription_start_date
                              : null,
                          });
                        }}
                        data-text={`${
                          selectedRowDataProperty?.subscription_start_date
                            ? format(new Date(selectedRowDataProperty.subscription_start_date), "yyyy/MM/dd")
                            : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth)
                            handleOpenTooltip({
                              e: e,
                              display: "top",
                              // marginTop: 57,
                              // marginTop: 38,
                              // marginTop: 12,
                              // itemsPosition: "center",
                              // whiteSpace: "nowrap",
                            });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          if (hoveredItemPosWrap) handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.subscription_start_date
                          ? format(new Date(selectedRowDataProperty.subscription_start_date), "yyyy/MM/dd")
                          : ""}
                      </span>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード Date-picker  */}
                    {isEditModeField === "subscription_start_date" && (
                      <>
                        <div className="z-[2000] w-full">
                          <DatePickerCustomInput
                            startDate={inputSubscriptionStartDate}
                            setStartDate={setInputSubscriptionStartDate}
                            required={false}
                            isFieldEditMode={true}
                            fieldEditModeBtnAreaPosition="right"
                            isLoadingSendEvent={updatePropertyFieldMutation.isLoading}
                            onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                              if (!inputSubscriptionStartDate) return alert("このデータは入力が必須です。");
                              const originalDateUTCString = selectedRowDataProperty?.subscription_start_date
                                ? selectedRowDataProperty.subscription_start_date
                                : null; // ISOString UTC時間 2023-12-26T15:00:00+00:00
                              const newDateUTCString = inputSubscriptionStartDate
                                ? inputSubscriptionStartDate.toISOString()
                                : null; // Dateオブジェクト ローカルタイムゾーンに自動で変換済み Thu Dec 28 2023 00:00:00 GMT+0900 (日本標準時)
                              // const result = isSameDateLocal(originalDateString, newDateString);
                              console.log(
                                "日付送信クリック",
                                "オリジナル(UTC)",
                                originalDateUTCString,
                                "新たな値(Dateオブジェクト)",
                                inputSubscriptionStartDate,
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
                                fieldName: "subscription_start_date",
                                fieldNameForSelectedRowData: "subscription_start_date",
                                // originalValue: originalValueFieldEdit.current,
                                originalValue: originalDateUTCString,
                                newValue: newDateUTCString,
                                id: selectedRowDataProperty?.property_id,
                                required: false,
                              });
                            }}
                          />
                        </div>
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {isEditModeField === "subscription_start_date" && (
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
                    <div className={`${styles.title} flex flex-col ${styles.double_text}`}>
                      <span>サブスク</span>
                      <span>解約日</span>
                    </div>
                    {isEditModeField !== "subscription_canceled_at" && (
                      <span
                        className={`${styles.value} ${styles.editable_field}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          // if (!selectedRowDataProperty?.activity_type) return;
                          // if (isNotActivityTypeArray.includes(selectedRowDataProperty.activity_type)) {
                          //   return alert(returnMessageNotActivity(selectedRowDataProperty.activity_type));
                          // }
                          handleDoubleClickField({
                            e,
                            field: "subscription_canceled_at",
                            dispatch: setInputSubscriptionCanceledAt,
                            dateValue: selectedRowDataProperty?.subscription_canceled_at
                              ? selectedRowDataProperty.subscription_canceled_at
                              : null,
                          });
                        }}
                        data-text={`${
                          selectedRowDataProperty?.subscription_canceled_at
                            ? format(new Date(selectedRowDataProperty.subscription_canceled_at), "yyyy/MM/dd")
                            : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth)
                            handleOpenTooltip({
                              e: e,
                              display: "top",
                              // marginTop: 57,
                              // marginTop: 38,
                              // marginTop: 12,
                              // itemsPosition: "center",
                              // whiteSpace: "nowrap",
                            });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          if (hoveredItemPosWrap) handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.subscription_canceled_at
                          ? format(new Date(selectedRowDataProperty.subscription_canceled_at), "yyyy/MM/dd")
                          : ""}
                      </span>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード Date-picker  */}
                    {isEditModeField === "subscription_canceled_at" && (
                      <>
                        <div className="z-[2000] w-full">
                          <DatePickerCustomInput
                            startDate={inputSubscriptionCanceledAt}
                            setStartDate={setInputSubscriptionCanceledAt}
                            required={true}
                            isFieldEditMode={true}
                            fieldEditModeBtnAreaPosition="right"
                            isLoadingSendEvent={updatePropertyFieldMutation.isLoading}
                            onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                              if (!inputSubscriptionCanceledAt) return alert("このデータは入力が必須です。");
                              const originalDateUTCString = selectedRowDataProperty?.subscription_canceled_at
                                ? selectedRowDataProperty.subscription_canceled_at
                                : null; // ISOString UTC時間 2023-12-26T15:00:00+00:00
                              const newDateUTCString = inputSubscriptionCanceledAt
                                ? inputSubscriptionCanceledAt.toISOString()
                                : null; // Dateオブジェクト ローカルタイムゾーンに自動で変換済み Thu Dec 28 2023 00:00:00 GMT+0900 (日本標準時)
                              // const result = isSameDateLocal(originalDateString, newDateString);
                              console.log(
                                "日付送信クリック",
                                "オリジナル(UTC)",
                                originalDateUTCString,
                                "新たな値(Dateオブジェクト)",
                                inputSubscriptionCanceledAt,
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
                                fieldName: "subscription_canceled_at",
                                fieldNameForSelectedRowData: "subscription_canceled_at",
                                // originalValue: originalValueFieldEdit.current,
                                originalValue: originalDateUTCString,
                                newValue: newDateUTCString,
                                id: selectedRowDataProperty?.property_id,
                                required: true,
                              });
                            }}
                          />
                        </div>
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {isEditModeField === "subscription_canceled_at" && (
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

              {/* リース分類 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} text-[12px]`}>ﾘｰｽ分類</span>
                    {isEditModeField !== "lease_division" && (
                      <span
                        className={`${styles.value} ${styles.editable_field}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          if (!selectedRowDataProperty?.lease_division) return;
                          // if (isNotActivityTypeArray.includes(selectedRowDataProperty.lease_division))
                          //   return alert(returnMessageNotActivity(selectedRowDataProperty.lease_division));
                          handleDoubleClickField({
                            e,
                            field: "lease_division",
                            dispatch: setInputLeaseDivision,
                          });
                          if (hoveredItemPosWrap) handleCloseTooltip();
                        }}
                        data-text={
                          selectedRowDataProperty?.lease_division
                            ? getLeaseDivision(selectedRowDataProperty?.lease_division)
                            : ""
                        }
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);

                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          if (hoveredItemPosWrap) handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.lease_division
                          ? getLeaseDivision(selectedRowDataProperty?.lease_division)
                          : ""}
                      </span>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード selectタグ  */}
                    {isEditModeField === "lease_division" && (
                      <>
                        <select
                          className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                          value={inputLeaseDivision}
                          onChange={(e) => {
                            handleChangeSelectUpdateField({
                              e,
                              fieldName: "lease_division",
                              fieldNameForSelectedRowData: "lease_division",
                              newValue: e.target.value,
                              originalValue: originalValueFieldEdit.current,
                              id: selectedRowDataProperty?.property_id,
                            });
                          }}
                        >
                          <option value=""></option>
                          {optionsLeaseDivision.map((option) => (
                            <option key={option} value={option}>
                              {getLeaseDivision(option)}
                            </option>
                          ))}
                        </select>
                        {/* エディットフィールド送信中ローディングスピナー */}
                        {updatePropertyFieldMutation.isLoading && (
                          <div
                            className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                          >
                            <SpinnerComet w="22px" h="22px" s="3px" />
                          </div>
                        )}
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {isEditModeField === "lease_division" && (
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
                  {/* <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} text-[12px]`}></span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataProperty?.discount_rate ? selectedRowDataProperty?.discount_rate : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div> */}
                </div>
              </div>

              {/* リース会社・リース完了予定日 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} text-[12px]`}>ﾘｰｽ会社</span>
                    {isEditModeField !== "leasing_company" && (
                      <span
                        className={`${styles.value} ${styles.editable_field}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          if (!selectedRowDataProperty?.leasing_company) return;
                          // if (isNotActivityTypeArray.includes(selectedRowDataProperty.leasing_company))
                          //   return alert(returnMessageNotActivity(selectedRowDataProperty.leasing_company));
                          handleDoubleClickField({
                            e,
                            field: "leasing_company",
                            dispatch: setInputLeasingCompany,
                          });
                          if (hoveredItemPosWrap) handleCloseTooltip();
                        }}
                        data-text={`${
                          selectedRowDataProperty?.leasing_company ? selectedRowDataProperty?.leasing_company : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);

                          handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);

                          if (hoveredItemPosWrap) handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.leasing_company ? selectedRowDataProperty.leasing_company : ""}
                      </span>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード selectタグ  */}
                    {isEditModeField === "leasing_company" && (
                      <>
                        <input
                          type="text"
                          placeholder=""
                          autoFocus
                          className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                          value={inputLeasingCompany}
                          // value={selectedRowDataCompany?.name ? selectedRowDataCompany?.name : ""}
                          onChange={(e) => setInputLeasingCompany(e.target.value)}
                          // onBlur={() => setInputName(toHalfWidthAndSpace(inputName.trim()))}
                          onCompositionStart={() => setIsComposing(true)}
                          onCompositionEnd={() => setIsComposing(false)}
                          onKeyDown={async (e) => {
                            handleKeyDownUpdateField({
                              e,
                              fieldName: "leasing_company",
                              fieldNameForSelectedRowData: "leasing_company",
                              newValue: inputLeasingCompany.trim(),
                              originalValue: originalValueFieldEdit.current,
                              id: selectedRowDataProperty?.property_id,
                              required: true,
                            });
                          }}
                        />
                        {/* 送信ボタンとクローズボタン */}
                        {!updatePropertyFieldMutation.isLoading && (
                          <InputSendAndCloseBtn<string>
                            inputState={inputLeasingCompany}
                            setInputState={setInputLeasingCompany}
                            onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                              handleClickSendUpdateField({
                                e,
                                fieldName: "leasing_company",
                                fieldNameForSelectedRowData: "leasing_company",
                                originalValue: originalValueFieldEdit.current,
                                newValue: inputLeasingCompany,
                                id: selectedRowDataProperty?.property_id,
                                required: false,
                              })
                            }
                            required={true}
                            isDisplayClose={false}
                          />
                        )}
                        {/* エディットフィールド送信中ローディングスピナー */}
                        {updatePropertyFieldMutation.isLoading && (
                          <div className={`${styles.field_edit_mode_loading_area}`}>
                            <SpinnerComet w="22px" h="22px" s="3px" />
                          </div>
                        )}
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {isEditModeField === "leasing_company" && (
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
                    <div className={`${styles.title} flex flex-col ${styles.double_text}`}>
                      <span>ﾘｰｽ完了</span>
                      <span>予定日</span>
                    </div>
                    {isEditModeField !== "lease_expiration_date" && (
                      <span
                        className={`${styles.value} ${styles.editable_field}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          // if (!selectedRowDataProperty?.activity_type) return;
                          // if (isNotActivityTypeArray.includes(selectedRowDataProperty.activity_type)) {
                          //   return alert(returnMessageNotActivity(selectedRowDataProperty.activity_type));
                          // }
                          handleDoubleClickField({
                            e,
                            field: "lease_expiration_date",
                            dispatch: setInputLeaseExpirationDate,
                            dateValue: selectedRowDataProperty?.lease_expiration_date
                              ? selectedRowDataProperty.lease_expiration_date
                              : null,
                          });
                        }}
                        data-text={`${
                          selectedRowDataProperty?.lease_expiration_date
                            ? format(new Date(selectedRowDataProperty.lease_expiration_date), "yyyy/MM/dd")
                            : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth)
                            handleOpenTooltip({
                              e: e,
                              display: "top",
                              // marginTop: 57,
                              // marginTop: 38,
                              // marginTop: 12,
                              // itemsPosition: "center",
                              // whiteSpace: "nowrap",
                            });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          if (hoveredItemPosWrap) handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.lease_expiration_date
                          ? format(new Date(selectedRowDataProperty.lease_expiration_date), "yyyy/MM/dd")
                          : ""}
                      </span>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード Date-picker  */}
                    {isEditModeField === "lease_expiration_date" && (
                      <>
                        <div className="z-[2000] w-full">
                          <DatePickerCustomInput
                            startDate={inputLeaseExpirationDate}
                            setStartDate={setInputLeaseExpirationDate}
                            required={false}
                            isFieldEditMode={true}
                            fieldEditModeBtnAreaPosition="right"
                            isLoadingSendEvent={updatePropertyFieldMutation.isLoading}
                            onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                              if (!inputLeaseExpirationDate) return alert("このデータは入力が必須です。");
                              const originalDateUTCString = selectedRowDataProperty?.lease_expiration_date
                                ? selectedRowDataProperty.lease_expiration_date
                                : null; // ISOString UTC時間 2023-12-26T15:00:00+00:00
                              const newDateUTCString = inputLeaseExpirationDate
                                ? inputLeaseExpirationDate.toISOString()
                                : null; // Dateオブジェクト ローカルタイムゾーンに自動で変換済み Thu Dec 28 2023 00:00:00 GMT+0900 (日本標準時)
                              // const result = isSameDateLocal(originalDateString, newDateString);
                              console.log(
                                "日付送信クリック",
                                "オリジナル(UTC)",
                                originalDateUTCString,
                                "新たな値(Dateオブジェクト)",
                                inputLeaseExpirationDate,
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
                                fieldName: "lease_expiration_date",
                                fieldNameForSelectedRowData: "lease_expiration_date",
                                // originalValue: originalValueFieldEdit.current,
                                originalValue: originalDateUTCString,
                                newValue: newDateUTCString,
                                id: selectedRowDataProperty?.property_id,
                                required: false,
                              });
                            }}
                          />
                        </div>
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {isEditModeField === "lease_expiration_date" && (
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

              {/* 展開日付・売上日付 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} text-[12px]`}>展開日付</span>
                    {isEditModeField !== "expansion_date" && (
                      <span
                        className={`${styles.value} ${styles.editable_field}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          // if (!selectedRowDataProperty?.activity_type) return;
                          // if (isNotActivityTypeArray.includes(selectedRowDataProperty.activity_type)) {
                          //   return alert(returnMessageNotActivity(selectedRowDataProperty.activity_type));
                          // }
                          handleDoubleClickField({
                            e,
                            field: "expansion_date",
                            dispatch: setInputExpansionDate,
                            dateValue: selectedRowDataProperty?.expansion_date
                              ? selectedRowDataProperty.expansion_date
                              : null,
                          });
                        }}
                        data-text={`${
                          selectedRowDataProperty?.expansion_date
                            ? format(new Date(selectedRowDataProperty.expansion_date), "yyyy/MM/dd")
                            : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth)
                            handleOpenTooltip({
                              e: e,
                              display: "top",
                              // marginTop: 57,
                              // marginTop: 38,
                              // marginTop: 12,
                              // itemsPosition: "center",
                              // whiteSpace: "nowrap",
                            });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          if (hoveredItemPosWrap) handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.expansion_date
                          ? format(new Date(selectedRowDataProperty.expansion_date), "yyyy/MM/dd")
                          : ""}
                      </span>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード Date-picker  */}
                    {isEditModeField === "expansion_date" && (
                      <>
                        <div className="z-[2000] w-full">
                          <DatePickerCustomInput
                            startDate={inputExpansionDate}
                            setStartDate={setInputExpansionDate}
                            required={false}
                            isFieldEditMode={true}
                            fieldEditModeBtnAreaPosition="right"
                            isLoadingSendEvent={updatePropertyFieldMutation.isLoading}
                            onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                              if (!inputExpansionDate) return alert("このデータは入力が必須です。");
                              const originalDateUTCString = selectedRowDataProperty?.expansion_date
                                ? selectedRowDataProperty.expansion_date
                                : null; // ISOString UTC時間 2023-12-26T15:00:00+00:00
                              const newDateUTCString = inputExpansionDate ? inputExpansionDate.toISOString() : null; // Dateオブジェクト ローカルタイムゾーンに自動で変換済み Thu Dec 28 2023 00:00:00 GMT+0900 (日本標準時)
                              // const result = isSameDateLocal(originalDateString, newDateString);
                              console.log(
                                "日付送信クリック",
                                "オリジナル(UTC)",
                                originalDateUTCString,
                                "新たな値(Dateオブジェクト)",
                                inputExpansionDate,
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
                                fieldName: "expansion_date",
                                fieldNameForSelectedRowData: "expansion_date",
                                // originalValue: originalValueFieldEdit.current,
                                originalValue: originalDateUTCString,
                                newValue: newDateUTCString,
                                id: selectedRowDataProperty?.property_id,
                                required: false,
                                newDateObj: inputExpansionDate,
                              });
                            }}
                          />
                        </div>
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {isEditModeField === "expansion_date" && (
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
                    <span className={`${styles.title} text-[12px]`}>売上日付</span>
                    {isEditModeField !== "sales_date" && (
                      <span
                        className={`${styles.value} ${styles.editable_field}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          // if (!selectedRowDataProperty?.activity_type) return;
                          // if (isNotActivityTypeArray.includes(selectedRowDataProperty.activity_type)) {
                          //   return alert(returnMessageNotActivity(selectedRowDataProperty.activity_type));
                          // }
                          handleDoubleClickField({
                            e,
                            field: "sales_date",
                            dispatch: setInputSalesDate,
                            dateValue: selectedRowDataProperty?.sales_date ? selectedRowDataProperty.sales_date : null,
                          });
                        }}
                        data-text={`${
                          selectedRowDataProperty?.sales_date
                            ? format(new Date(selectedRowDataProperty.sales_date), "yyyy/MM/dd")
                            : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth)
                            handleOpenTooltip({
                              e: e,
                              display: "top",
                              // marginTop: 57,
                              // marginTop: 38,
                              // marginTop: 12,
                              // itemsPosition: "center",
                              // whiteSpace: "nowrap",
                            });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          if (hoveredItemPosWrap) handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.sales_date
                          ? format(new Date(selectedRowDataProperty.sales_date), "yyyy/MM/dd")
                          : ""}
                      </span>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード Date-picker  */}
                    {isEditModeField === "sales_date" && (
                      <>
                        <div className="z-[2000] w-full">
                          <DatePickerCustomInput
                            startDate={inputSalesDate}
                            setStartDate={setInputSalesDate}
                            required={false}
                            isFieldEditMode={true}
                            fieldEditModeBtnAreaPosition="right"
                            isLoadingSendEvent={updatePropertyFieldMutation.isLoading}
                            onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                              if (!inputSalesDate) return alert("このデータは入力が必須です。");
                              const originalDateUTCString = selectedRowDataProperty?.sales_date
                                ? selectedRowDataProperty.sales_date
                                : null; // ISOString UTC時間 2023-12-26T15:00:00+00:00
                              const newDateUTCString = inputSalesDate ? inputSalesDate.toISOString() : null; // Dateオブジェクト ローカルタイムゾーンに自動で変換済み Thu Dec 28 2023 00:00:00 GMT+0900 (日本標準時)
                              // const result = isSameDateLocal(originalDateString, newDateString);
                              console.log(
                                "日付送信クリック",
                                "オリジナル(UTC)",
                                originalDateUTCString,
                                "新たな値(Dateオブジェクト)",
                                inputSalesDate,
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
                                fieldName: "sales_date",
                                fieldNameForSelectedRowData: "sales_date",
                                // originalValue: originalValueFieldEdit.current,
                                originalValue: originalDateUTCString,
                                newValue: newDateUTCString,
                                id: selectedRowDataProperty?.property_id,
                                required: false,
                                newDateObj: inputSalesDate,
                              });
                            }}
                          />
                        </div>
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {isEditModeField === "sales_date" && (
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
              {/* 展開年月度・売上年月度 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} text-[12px]`}>展開年月度</span>
                    <span
                      className={`${styles.value}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataProperty?.expansion_year_month
                        ? selectedRowDataProperty?.expansion_year_month
                        : ""}
                    </span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} text-[12px]`}>売上年月度</span>
                    <span
                      className={`${styles.value}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataProperty?.sales_year_month ? selectedRowDataProperty?.sales_year_month : ""}
                    </span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* 展開四半期・売上四半期 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} text-[12px]`}>展開四半期</span>
                    <span
                      className={`${styles.value}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {/* {selectedRowDataProperty?.expansion_quarter ? selectedRowDataProperty?.expansion_quarter : ""} */}
                      {selectedRowDataProperty?.expansion_quarter
                        ? `${selectedRowDataProperty.expansion_quarter.toString()}Q`
                        : null}
                    </span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} text-[12px]`}>売上四半期</span>
                    <span
                      className={`${styles.value}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {/* {selectedRowDataProperty?.sales_quarter ? selectedRowDataProperty?.sales_quarter : ""} */}
                      {selectedRowDataProperty?.sales_quarter ? `${selectedRowDataProperty.sales_quarter}Q` : null}
                    </span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 案件発生日付・案件年月度 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    {/* <span className={`${styles.title} text-[12px]`}>案件発生日付</span> */}
                    <div className={`${styles.title} flex flex-col ${styles.double_text}`}>
                      <span>案件</span>
                      <span>発生日付</span>
                    </div>
                    {isEditModeField !== "property_date" && (
                      <span
                        className={`${styles.value} ${styles.editable_field}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          // if (!selectedRowDataProperty?.activity_type) return;
                          // if (isNotActivityTypeArray.includes(selectedRowDataProperty.activity_type)) {
                          //   return alert(returnMessageNotActivity(selectedRowDataProperty.activity_type));
                          // }
                          handleDoubleClickField({
                            e,
                            field: "property_date",
                            dispatch: setInputPropertyDate,
                            dateValue: selectedRowDataProperty?.property_date
                              ? selectedRowDataProperty.property_date
                              : null,
                          });
                        }}
                        data-text={`${
                          selectedRowDataProperty?.property_date
                            ? format(new Date(selectedRowDataProperty.property_date), "yyyy/MM/dd")
                            : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth)
                            handleOpenTooltip({
                              e: e,
                              display: "top",
                              // marginTop: 57,
                              // marginTop: 38,
                              // marginTop: 12,
                              // itemsPosition: "center",
                              // whiteSpace: "nowrap",
                            });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          if (hoveredItemPosWrap) handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.property_date
                          ? format(new Date(selectedRowDataProperty.property_date), "yyyy/MM/dd")
                          : ""}
                      </span>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード Date-picker  */}
                    {isEditModeField === "property_date" && (
                      <>
                        <div className="z-[2000] w-full">
                          <DatePickerCustomInput
                            startDate={inputPropertyDate}
                            setStartDate={setInputPropertyDate}
                            required={false}
                            isFieldEditMode={true}
                            fieldEditModeBtnAreaPosition="right"
                            isLoadingSendEvent={updatePropertyFieldMutation.isLoading}
                            onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                              if (!inputPropertyDate) return alert("このデータは入力が必須です。");
                              const originalDateUTCString = selectedRowDataProperty?.property_date
                                ? selectedRowDataProperty.property_date
                                : null; // ISOString UTC時間 2023-12-26T15:00:00+00:00
                              const newDateUTCString = inputPropertyDate ? inputPropertyDate.toISOString() : null; // Dateオブジェクト ローカルタイムゾーンに自動で変換済み Thu Dec 28 2023 00:00:00 GMT+0900 (日本標準時)
                              // const result = isSameDateLocal(originalDateString, newDateString);
                              console.log(
                                "日付送信クリック",
                                "オリジナル(UTC)",
                                originalDateUTCString,
                                "新たな値(Dateオブジェクト)",
                                inputPropertyDate,
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
                                fieldName: "property_date",
                                fieldNameForSelectedRowData: "property_date",
                                // originalValue: originalValueFieldEdit.current,
                                originalValue: originalDateUTCString,
                                newValue: newDateUTCString,
                                id: selectedRowDataProperty?.property_id,
                                required: false,
                                newDateObj: inputPropertyDate,
                              });
                            }}
                          />
                        </div>
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {isEditModeField === "property_date" && (
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
                    <span className={`${styles.title} text-[12px]`}>案件年月度</span>
                    <span
                      className={`${styles.value}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataProperty?.property_year_month ? selectedRowDataProperty?.property_year_month : ""}
                    </span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* --------- ラッパーここまで --------- */}
            </div>
          </div>
          {/* ---------------- 通常モード 左コンテナここまで ---------------- */}

          {/* ---------------- 通常モード 真ん中コンテナ 結果エリア ---------------- */}
          <div
            className={`${styles.right_container} ${styles.detail_modal} ${
              isOpenSidebar ? `transition-base02` : `transition-base01`
            } h-full min-w-[calc((100vw-var(--sidebar-mini-width))/3-11px)] max-w-[calc((100vw-var(--sidebar-mini-width))/3-11px)] grow bg-[aqua]/[0] pb-[35px] pt-[0px]`}
          >
            <div className={`${styles.right_contents_wrapper} flex h-full w-full flex-col bg-[#000]/[0]`}>
              {/* 下エリア 禁止フラグなど */}
              <div
                className={`${styles.right_under_container} h-screen w-full  bg-[#f0f0f0]/[0] ${
                  isOpenSidebar ? `transition-base02` : `transition-base01`
                }`}
              >
                {/* 月初確度・中間見直確度 通常 */}
                <div className={`${styles.row_area} flex max-h-[26px] w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.section_title}`}>月初確度</span>
                      {isEditModeField !== "order_certainty_start_of_month" && (
                        <span
                          className={`${styles.value} ${styles.value_highlight} ${styles.editable_field}`}
                          data-text={
                            selectedRowDataProperty?.order_certainty_start_of_month
                              ? getOrderCertaintyStartOfMonth(selectedRowDataProperty?.order_certainty_start_of_month)
                              : ""
                          }
                          onMouseEnter={(e) => handleOpenTooltip({ e, display: "top" })}
                          onMouseLeave={handleCloseTooltip}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            // if (!selectedRowDataMeeting?.activity_type) return;
                            // if (isNotActivityTypeArray.includes(selectedRowDataMeeting.activity_type)) {
                            //   return alert(returnMessageNotActivity(selectedRowDataMeeting.activity_type));
                            // }
                            handleDoubleClickField({
                              e,
                              field: "order_certainty_start_of_month",
                              dispatch: setInputOrderCertaintyStartOfMonth,
                              selectedRowDataValue: selectedRowDataProperty?.order_certainty_start_of_month ?? "",
                            });
                            handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataProperty?.order_certainty_start_of_month
                            ? getOrderCertaintyStartOfMonth(selectedRowDataProperty?.order_certainty_start_of_month)
                            : ""}
                        </span>
                      )}
                      {/* ============= フィールドエディットモード関連 ============= */}
                      {/* フィールドエディットモード selectタグ  */}
                      {isEditModeField === "order_certainty_start_of_month" && (
                        <>
                          <select
                            className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                            value={inputOrderCertaintyStartOfMonth}
                            onChange={(e) => {
                              handleChangeSelectUpdateField({
                                e,
                                fieldName: "order_certainty_start_of_month",
                                fieldNameForSelectedRowData: "order_certainty_start_of_month",
                                newValue: e.target.value,
                                originalValue: originalValueFieldEdit.current,
                                id: selectedRowDataProperty?.property_id,
                              });
                            }}
                            // onChange={(e) => {
                            //   setInputActivityType(e.target.value);
                            // }}
                          >
                            <option value=""></option>
                            {optionsOrderCertaintyStartOfMonth.map((option) => (
                              <option key={option} value={option}>
                                {getOrderCertaintyStartOfMonth(option)}
                              </option>
                            ))}
                          </select>
                          {/* エディットフィールド送信中ローディングスピナー */}
                          {updatePropertyFieldMutation.isLoading && (
                            <div
                              className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                            >
                              <SpinnerComet w="22px" h="22px" s="3px" />
                            </div>
                          )}
                        </>
                      )}
                      {/* フィールドエディットモードオーバーレイ */}
                      {isEditModeField === "order_certainty_start_of_month" && (
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
                      <div className={`${styles.section_title} flex flex-col !text-[13px]`}>
                        <span>中間見直</span>
                        <span>確度</span>
                      </div>

                      {isEditModeField !== "review_order_certainty" && (
                        <span
                          className={`${styles.value} ${styles.value_highlight} ${styles.editable_field}`}
                          data-text={
                            selectedRowDataProperty?.review_order_certainty
                              ? getOrderCertaintyStartOfMonth(selectedRowDataProperty?.review_order_certainty)
                              : ""
                          }
                          onMouseEnter={(e) => handleOpenTooltip({ e, display: "top" })}
                          onMouseLeave={handleCloseTooltip}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            // if (!selectedRowDataMeeting?.activity_type) return;
                            // if (isNotActivityTypeArray.includes(selectedRowDataMeeting.activity_type)) {
                            //   return alert(returnMessageNotActivity(selectedRowDataMeeting.activity_type));
                            // }
                            handleDoubleClickField({
                              e,
                              field: "review_order_certainty",
                              dispatch: setInputReviewOrderCertainty,
                              selectedRowDataValue: selectedRowDataProperty?.review_order_certainty ?? "",
                            });
                            handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataProperty?.review_order_certainty
                            ? getOrderCertaintyStartOfMonth(selectedRowDataProperty?.review_order_certainty)
                            : ""}
                        </span>
                      )}
                      {/* ============= フィールドエディットモード関連 ============= */}
                      {/* フィールドエディットモード selectタグ  */}
                      {isEditModeField === "review_order_certainty" && (
                        <>
                          <select
                            className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                            value={inputReviewOrderCertainty}
                            onChange={(e) => {
                              handleChangeSelectUpdateField({
                                e,
                                fieldName: "review_order_certainty",
                                fieldNameForSelectedRowData: "review_order_certainty",
                                newValue: e.target.value,
                                originalValue: originalValueFieldEdit.current,
                                id: selectedRowDataProperty?.property_id,
                              });
                            }}
                            // onChange={(e) => {
                            //   setInputActivityType(e.target.value);
                            // }}
                          >
                            <option value=""></option>
                            {optionsOrderCertaintyStartOfMonth.map((option) => (
                              <option key={option} value={option}>
                                {getOrderCertaintyStartOfMonth(option)}
                              </option>
                            ))}
                          </select>
                          {/* エディットフィールド送信中ローディングスピナー */}
                          {updatePropertyFieldMutation.isLoading && (
                            <div
                              className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                            >
                              <SpinnerComet w="22px" h="22px" s="3px" />
                            </div>
                          )}
                        </>
                      )}
                      {/* フィールドエディットモードオーバーレイ */}
                      {isEditModeField === "review_order_certainty" && (
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

                {/* リピート・案件介入(責任者) 通常 通常 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      {/* <div className={`${styles.title} !mr-[15px] flex flex-col`}>
                        <span className={``}>リピート</span>
                      </div> */}
                      <span className={`${styles.check_title}`}>リピート</span>
                      <div
                        className={`${styles.grid_select_cell_header} `}
                        onMouseEnter={(e) => {
                          if (!selectedRowDataProperty) return;
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedRowDataProperty) return;
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        <input
                          type="checkbox"
                          // checked={!!selectedRowDataProperty?.repeat_flag}
                          // onChange={() => {
                          //   setLoadingGlobalState(false);
                          //   setIsOpenUpdatePropertyModal(true);
                          // }}
                          className={`${styles.grid_select_cell_header_input} ${
                            !selectedRowDataProperty ? `pointer-events-none cursor-not-allowed` : ``
                          }`}
                          checked={checkRepeatFlagForFieldEdit}
                          onChange={async (e) => {
                            if (!selectedRowDataProperty) return;
                            // 個別にチェックボックスを更新するルート
                            if (!selectedRowDataProperty?.property_id)
                              return toast.error(`データが見つかりませんでした🙇‍♀️`);

                            console.log(
                              "チェック 新しい値",
                              !checkRepeatFlagForFieldEdit,
                              "オリジナル",
                              selectedRowDataProperty?.repeat_flag
                            );
                            if (!checkRepeatFlagForFieldEdit === selectedRowDataProperty?.repeat_flag) {
                              toast.error(`アップデートに失敗しました🤦‍♀️`);
                              return;
                            }
                            const updatePayload = {
                              fieldName: "repeat_flag",
                              fieldNameForSelectedRowData: "repeat_flag" as "repeat_flag",
                              newValue: !checkRepeatFlagForFieldEdit,
                              id: selectedRowDataProperty.property_id,
                            };
                            // 直感的にするためにmutateにして非同期処理のまま後続のローカルのチェックボックスを更新する
                            updatePropertyFieldMutation.mutate(updatePayload);
                            setCheckRepeatFlagForFieldEdit(!checkRepeatFlagForFieldEdit);
                          }}
                        />
                        <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>

                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} transition-base03 flex h-full items-center `}>
                      {/* <div className={`${styles.title} flex flex-col ${styles.double_text}`}> */}
                      <div className={`${styles.check_title} flex flex-col ${styles.double_text}`}>
                        <span>案件介入</span>
                        <span>(責任者)</span>
                      </div>

                      <div
                        className={`${styles.grid_select_cell_header} `}
                        onMouseEnter={(e) => {
                          if (!selectedRowDataProperty) return;
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedRowDataProperty) return;
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        <input
                          type="checkbox"
                          // checked={!!selectedRowDataProperty?.step_in_flag}
                          // onChange={() => {
                          //   setLoadingGlobalState(false);
                          //   setIsOpenUpdatePropertyModal(true);
                          // }}
                          className={`${styles.grid_select_cell_header_input} ${
                            !selectedRowDataProperty ? `pointer-events-none cursor-not-allowed` : ``
                          }`}
                          checked={checkStepInFlagForFieldEdit}
                          onChange={async (e) => {
                            if (!selectedRowDataProperty) return;
                            // 個別にチェックボックスを更新するルート
                            if (!selectedRowDataProperty?.property_id)
                              return toast.error(`データが見つかりませんでした🙇‍♀️`);

                            console.log(
                              "チェック 新しい値",
                              !checkStepInFlagForFieldEdit,
                              "オリジナル",
                              selectedRowDataProperty?.step_in_flag
                            );
                            if (!checkStepInFlagForFieldEdit === selectedRowDataProperty?.step_in_flag) {
                              toast.error(`アップデートに失敗しました🤦‍♀️`);
                              return;
                            }
                            const updatePayload = {
                              fieldName: "step_in_flag",
                              fieldNameForSelectedRowData: "step_in_flag" as "step_in_flag",
                              newValue: !checkStepInFlagForFieldEdit,
                              id: selectedRowDataProperty.property_id,
                            };
                            // 直感的にするためにmutateにして非同期処理のまま後続のローカルのチェックボックスを更新する
                            updatePropertyFieldMutation.mutate(updatePayload);
                            setCheckStepInFlagForFieldEdit(!checkStepInFlagForFieldEdit);
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
                {/* ペンディング・案件没 通常 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      {/* <div className={`${styles.title} !mr-[15px] flex flex-col`}>
                        <span className={``}>ペンディング</span>
                      </div> */}
                      <span className={`${styles.check_title}`}>ペンディング</span>
                      <div
                        className={`${styles.grid_select_cell_header} `}
                        onMouseEnter={(e) => {
                          if (!selectedRowDataProperty) return;
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedRowDataProperty) return;
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        <input
                          type="checkbox"
                          // checked={!!selectedRowDataProperty?.pending_flag}
                          // onChange={() => {
                          //   setLoadingGlobalState(false);
                          //   setIsOpenUpdatePropertyModal(true);
                          // }}
                          className={`${styles.grid_select_cell_header_input} ${
                            !selectedRowDataProperty ? `pointer-events-none cursor-not-allowed` : ``
                          }`}
                          checked={checkPendingFlagForFieldEdit}
                          onChange={async (e) => {
                            if (!selectedRowDataProperty) return;
                            // 個別にチェックボックスを更新するルート
                            if (!selectedRowDataProperty?.property_id)
                              return toast.error(`データが見つかりませんでした🙇‍♀️`);

                            console.log(
                              "チェック 新しい値",
                              !checkPendingFlagForFieldEdit,
                              "オリジナル",
                              selectedRowDataProperty?.pending_flag
                            );
                            if (!checkPendingFlagForFieldEdit === selectedRowDataProperty?.pending_flag) {
                              toast.error(`アップデートに失敗しました🤦‍♀️`);
                              return;
                            }
                            const updatePayload = {
                              fieldName: "pending_flag",
                              fieldNameForSelectedRowData: "pending_flag" as "pending_flag",
                              newValue: !checkPendingFlagForFieldEdit,
                              id: selectedRowDataProperty.property_id,
                            };
                            // 直感的にするためにmutateにして非同期処理のまま後続のローカルのチェックボックスを更新する
                            updatePropertyFieldMutation.mutate(updatePayload);
                            setCheckPendingFlagForFieldEdit(!checkPendingFlagForFieldEdit);
                          }}
                        />
                        <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>

                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} transition-base03 flex h-full items-center `}>
                      <span className={`${styles.check_title}`}>案件没</span>

                      <div
                        className={`${styles.grid_select_cell_header} `}
                        onMouseEnter={(e) => {
                          if (!selectedRowDataProperty) return;
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedRowDataProperty) return;
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        <input
                          type="checkbox"
                          // checked={!!selectedRowDataProperty?.rejected_flag}
                          // onChange={() => {
                          //   setLoadingGlobalState(false);
                          //   setIsOpenUpdatePropertyModal(true);
                          // }}
                          className={`${styles.grid_select_cell_header_input} ${
                            !selectedRowDataProperty ? `pointer-events-none cursor-not-allowed` : ``
                          }`}
                          checked={checkRejectedFlagForFieldEdit}
                          onChange={async (e) => {
                            if (!selectedRowDataProperty) return;
                            // 個別にチェックボックスを更新するルート
                            if (!selectedRowDataProperty?.property_id)
                              return toast.error(`データが見つかりませんでした🙇‍♀️`);

                            console.log(
                              "チェック 新しい値",
                              !checkRejectedFlagForFieldEdit,
                              "オリジナル",
                              selectedRowDataProperty?.rejected_flag
                            );
                            if (!checkRejectedFlagForFieldEdit === selectedRowDataProperty?.rejected_flag) {
                              toast.error(`アップデートに失敗しました🙇‍♀️`);
                              return;
                            }
                            const updatePayload = {
                              fieldName: "rejected_flag",
                              fieldNameForSelectedRowData: "rejected_flag" as "rejected_flag",
                              newValue: !checkRejectedFlagForFieldEdit,
                              id: selectedRowDataProperty.property_id,
                            };
                            // 直感的にするためにmutateにして非同期処理のまま後続のローカルのチェックボックスを更新する
                            updatePropertyFieldMutation.mutate(updatePayload);
                            setCheckRejectedFlagForFieldEdit(!checkRejectedFlagForFieldEdit);
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

                {/* 競合発生日・競合状況 通常 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>競合発生日</span>
                      {isEditModeField !== "competitor_appearance_date" && (
                        <span
                          className={`${styles.value} ${styles.editable_field}`}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            // if (!selectedRowDataProperty?.activity_type) return;
                            // if (isNotActivityTypeArray.includes(selectedRowDataProperty.activity_type)) {
                            //   return alert(returnMessageNotActivity(selectedRowDataProperty.activity_type));
                            // }
                            handleDoubleClickField({
                              e,
                              field: "competitor_appearance_date",
                              dispatch: setInputCompetitorAppearanceDate,
                              dateValue: selectedRowDataProperty?.competitor_appearance_date
                                ? selectedRowDataProperty.competitor_appearance_date
                                : null,
                            });
                          }}
                          data-text={`${
                            selectedRowDataProperty?.competitor_appearance_date
                              ? format(new Date(selectedRowDataProperty.competitor_appearance_date), "yyyy/MM/dd")
                              : ""
                          }`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            const el = e.currentTarget;
                            if (el.scrollWidth > el.offsetWidth)
                              handleOpenTooltip({
                                e: e,
                                display: "top",
                                // marginTop: 57,
                                // marginTop: 38,
                                // marginTop: 12,
                                // itemsPosition: "center",
                                // whiteSpace: "nowrap",
                              });
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            if (hoveredItemPosWrap) handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataProperty?.competitor_appearance_date
                            ? format(new Date(selectedRowDataProperty.competitor_appearance_date), "yyyy/MM/dd")
                            : ""}
                        </span>
                      )}
                      {/* ============= フィールドエディットモード関連 ============= */}
                      {/* フィールドエディットモード Date-picker  */}
                      {isEditModeField === "competitor_appearance_date" && (
                        <>
                          <div className="z-[2000] w-full">
                            <DatePickerCustomInput
                              startDate={inputCompetitorAppearanceDate}
                              setStartDate={setInputCompetitorAppearanceDate}
                              required={false}
                              isFieldEditMode={true}
                              fieldEditModeBtnAreaPosition="right"
                              isLoadingSendEvent={updatePropertyFieldMutation.isLoading}
                              onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                                if (!inputCompetitorAppearanceDate) return alert("このデータは入力が必須です。");
                                const originalDateUTCString = selectedRowDataProperty?.competitor_appearance_date
                                  ? selectedRowDataProperty.competitor_appearance_date
                                  : null; // ISOString UTC時間 2023-12-26T15:00:00+00:00
                                const newDateUTCString = inputCompetitorAppearanceDate
                                  ? inputCompetitorAppearanceDate.toISOString()
                                  : null; // Dateオブジェクト ローカルタイムゾーンに自動で変換済み Thu Dec 28 2023 00:00:00 GMT+0900 (日本標準時)
                                // const result = isSameDateLocal(originalDateString, newDateString);
                                console.log(
                                  "日付送信クリック",
                                  "オリジナル(UTC)",
                                  originalDateUTCString,
                                  "新たな値(Dateオブジェクト)",
                                  inputCompetitorAppearanceDate,
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
                                  fieldName: "competitor_appearance_date",
                                  fieldNameForSelectedRowData: "competitor_appearance_date",
                                  // originalValue: originalValueFieldEdit.current,
                                  originalValue: originalDateUTCString,
                                  newValue: newDateUTCString,
                                  id: selectedRowDataProperty?.property_id,
                                  required: false,
                                });
                              }}
                            />
                          </div>
                        </>
                      )}
                      {/* フィールドエディットモードオーバーレイ */}
                      {isEditModeField === "competitor_appearance_date" && (
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
                      <span className={`${styles.title}`}>競合状況</span>
                      {isEditModeField !== "competition_state" && (
                        <span
                          className={`${styles.value} ${styles.editable_field}`}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            if (!selectedRowDataProperty?.competition_state) return;
                            // if (isNotActivityTypeArray.includes(selectedRowDataProperty.competition_state))
                            //   return alert(returnMessageNotActivity(selectedRowDataProperty.competition_state));
                            handleDoubleClickField({
                              e,
                              field: "competition_state",
                              dispatch: setInputCompetitionState,
                            });
                            if (hoveredItemPosWrap) handleCloseTooltip();
                          }}
                          data-text={`${
                            selectedRowDataProperty?.competition_state
                              ? getCompetitionState(selectedRowDataProperty?.competition_state)
                              : ""
                          }`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);

                            const el = e.currentTarget;
                            if (el.scrollWidth > el.offsetWidth)
                              handleOpenTooltip({
                                e: e,
                                display: "top",
                                // marginTop: 57,
                                // marginTop: 38,
                                // marginTop: 12,
                                // itemsPosition: "center",
                                // whiteSpace: "nowrap",
                              });
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);

                            if (hoveredItemPosWrap) handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataProperty?.competition_state
                            ? getCompetitionState(selectedRowDataProperty?.competition_state)
                            : null}
                        </span>
                      )}
                      {/* ============= フィールドエディットモード関連 ============= */}
                      {/* フィールドエディットモード selectタグ  */}
                      {isEditModeField === "competition_state" && (
                        <>
                          <select
                            className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                            value={inputCompetitionState}
                            onChange={(e) => {
                              handleChangeSelectUpdateField({
                                e,
                                fieldName: "competition_state",
                                fieldNameForSelectedRowData: "competition_state",
                                newValue: e.target.value,
                                originalValue: originalValueFieldEdit.current,
                                id: selectedRowDataProperty?.property_id,
                              });
                            }}
                            // onChange={(e) => {
                            //   setInputActivityType(e.target.value);
                            // }}
                          >
                            <option value=""></option>
                            {optionsCompetitionState.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                            {/* <option value="今期">今期</option>
                          <option value="来期">来期</option> */}
                          </select>
                          {/* エディットフィールド送信中ローディングスピナー */}
                          {updatePropertyFieldMutation.isLoading && (
                            <div
                              className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                            >
                              <SpinnerComet w="22px" h="22px" s="3px" />
                            </div>
                          )}
                        </>
                      )}
                      {/* フィールドエディットモードオーバーレイ */}
                      {isEditModeField === "competition_state" && (
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

                {/* 競合会社 通常 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>競合会社</span>
                      {isEditModeField !== "competitor" && (
                        <div
                          className={`${styles.value} ${styles.editable_field}`}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            if (!selectedRowDataProperty?.competitor) return;
                            // if (isNotActivityTypeArray.includes(selectedRowDataProperty.competitor))
                            //   return alert(returnMessageNotActivity(selectedRowDataProperty.competitor));
                            handleDoubleClickField({
                              e,
                              field: "competitor",
                              dispatch: setInputCompetitor,
                            });
                            if (hoveredItemPosWrap) handleCloseTooltip();
                          }}
                          data-text={`${
                            selectedRowDataProperty?.competitor ? selectedRowDataProperty?.competitor : ""
                          }`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);

                            handleOpenTooltip({ e, display: "top" });
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);

                            if (hoveredItemPosWrap) handleCloseTooltip();
                          }}
                          dangerouslySetInnerHTML={{
                            __html: selectedRowDataProperty?.competitor
                              ? selectedRowDataProperty?.competitor.replace(/\n/g, "<br>")
                              : "",
                          }}
                        ></div>
                      )}
                      {/* ============= フィールドエディットモード関連 ============= */}
                      {/* フィールドエディットモード selectタグ  */}
                      {isEditModeField === "competitor" && (
                        <>
                          <input
                            type="text"
                            placeholder=""
                            autoFocus
                            className={`${styles.input_box} ${styles.field_edit_mode_input_box_with_close}`}
                            value={inputCompetitor}
                            // value={selectedRowDataCompany?.name ? selectedRowDataCompany?.name : ""}
                            onChange={(e) => setInputCompetitor(e.target.value)}
                            // onBlur={() => setInputName(toHalfWidthAndSpace(inputName.trim()))}
                            onCompositionStart={() => setIsComposing(true)}
                            onCompositionEnd={() => setIsComposing(false)}
                            onKeyDown={async (e) => {
                              handleKeyDownUpdateField({
                                e,
                                fieldName: "competitor",
                                fieldNameForSelectedRowData: "competitor",
                                newValue: inputCompetitor.trim(),
                                originalValue: originalValueFieldEdit.current,
                                id: selectedRowDataProperty?.property_id,
                                required: true,
                              });
                            }}
                          />
                          {/* 送信ボタンとクローズボタン */}
                          {!updatePropertyFieldMutation.isLoading && (
                            <InputSendAndCloseBtn
                              inputState={inputCompetitor}
                              setInputState={setInputCompetitor}
                              onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                                handleClickSendUpdateField({
                                  e,
                                  fieldName: "competitor",
                                  fieldNameForSelectedRowData: "competitor",
                                  newValue: inputPropertyName.trim(),
                                  originalValue: originalValueFieldEdit.current,
                                  id: selectedRowDataProperty?.property_id,
                                  required: true,
                                })
                              }
                              required={true}
                            />
                          )}
                          {/* エディットフィールド送信中ローディングスピナー */}
                          {updatePropertyFieldMutation.isLoading && (
                            <div className={`${styles.field_edit_mode_loading_area}`}>
                              <SpinnerComet w="22px" h="22px" s="3px" />
                            </div>
                          )}
                        </>
                      )}
                      {/* フィールドエディットモードオーバーレイ */}
                      {isEditModeField === "competitor" && (
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

                {/* 競合商品 通常 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>競合商品</span>
                      {isEditModeField !== "competitor_product" && (
                        <div
                          className={`${styles.value} ${styles.editable_field}`}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            if (!selectedRowDataProperty?.competitor_product) return;
                            // if (isNotActivityTypeArray.includes(selectedRowDataProperty.competitor_product))
                            //   return alert(returnMessageNotActivity(selectedRowDataProperty.competitor_product));
                            handleDoubleClickField({
                              e,
                              field: "competitor_product",
                              dispatch: setInputCompetitorProduct,
                            });
                            if (hoveredItemPosWrap) handleCloseTooltip();
                          }}
                          data-text={`${
                            selectedRowDataProperty?.competitor_product
                              ? selectedRowDataProperty?.competitor_product
                              : ""
                          }`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);

                            handleOpenTooltip({ e, display: "top" });
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);

                            if (hoveredItemPosWrap) handleCloseTooltip();
                          }}
                          dangerouslySetInnerHTML={{
                            __html: selectedRowDataProperty?.competitor_product
                              ? selectedRowDataProperty?.competitor_product.replace(/\n/g, "<br>")
                              : "",
                          }}
                        ></div>
                      )}
                      {/* ============= フィールドエディットモード関連 ============= */}
                      {/* フィールドエディットモード selectタグ  */}
                      {isEditModeField === "competitor_product" && (
                        <>
                          <input
                            type="text"
                            placeholder=""
                            autoFocus
                            className={`${styles.input_box} ${styles.field_edit_mode_input_box_with_close}`}
                            value={inputCompetitorProduct}
                            // value={selectedRowDataCompany?.name ? selectedRowDataCompany?.name : ""}
                            onChange={(e) => setInputCompetitorProduct(e.target.value)}
                            // onBlur={() => setInputName(toHalfWidthAndSpace(inputName.trim()))}
                            onCompositionStart={() => setIsComposing(true)}
                            onCompositionEnd={() => setIsComposing(false)}
                            onKeyDown={async (e) => {
                              handleKeyDownUpdateField({
                                e,
                                fieldName: "competitor_product",
                                fieldNameForSelectedRowData: "competitor_product",
                                newValue: inputCompetitorProduct.trim(),
                                originalValue: originalValueFieldEdit.current,
                                id: selectedRowDataProperty?.property_id,
                                required: true,
                              });
                            }}
                          />
                          {/* 送信ボタンとクローズボタン */}
                          {!updatePropertyFieldMutation.isLoading && (
                            <InputSendAndCloseBtn
                              inputState={inputCompetitorProduct}
                              setInputState={setInputCompetitorProduct}
                              onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                                handleClickSendUpdateField({
                                  e,
                                  fieldName: "competitor_product",
                                  fieldNameForSelectedRowData: "competitor_product",
                                  newValue: inputCompetitorProduct.trim(),
                                  originalValue: originalValueFieldEdit.current,
                                  id: selectedRowDataProperty?.property_id,
                                  required: true,
                                })
                              }
                              required={true}
                            />
                          )}
                          {/* エディットフィールド送信中ローディングスピナー */}
                          {updatePropertyFieldMutation.isLoading && (
                            <div className={`${styles.field_edit_mode_loading_area}`}>
                              <SpinnerComet w="22px" h="22px" s="3px" />
                            </div>
                          )}
                        </>
                      )}
                      {/* フィールドエディットモードオーバーレイ */}
                      {isEditModeField === "competitor_product" && (
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

                {/* 案件発生動機・動機詳細 通常 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <div className={`${styles.title} flex flex-col ${styles.double_text}`}>
                        <span>案件発生</span>
                        <span>動機</span>
                      </div>
                      {isEditModeField !== "reason_class" && (
                        <span
                          className={`${styles.value} ${styles.editable_field}`}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            if (!selectedRowDataProperty?.reason_class) return;
                            // if (isNotActivityTypeArray.includes(selectedRowDataProperty.reason_class))
                            //   return alert(returnMessageNotActivity(selectedRowDataProperty.reason_class));
                            handleDoubleClickField({
                              e,
                              field: "reason_class",
                              dispatch: setInputReasonClass,
                            });
                            if (hoveredItemPosWrap) handleCloseTooltip();
                          }}
                          data-text={`${
                            selectedRowDataProperty?.reason_class
                              ? getReasonClass(selectedRowDataProperty?.reason_class)
                              : ""
                          }`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);

                            const el = e.currentTarget;
                            if (el.scrollWidth > el.offsetWidth)
                              handleOpenTooltip({
                                e: e,
                                display: "top",
                                // marginTop: 57,
                                // marginTop: 38,
                                // marginTop: 12,
                                // itemsPosition: "center",
                                // whiteSpace: "nowrap",
                              });
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);

                            if (hoveredItemPosWrap) handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataProperty?.reason_class
                            ? getReasonClass(selectedRowDataProperty?.reason_class)
                            : ""}
                        </span>
                      )}
                      {/* ============= フィールドエディットモード関連 ============= */}
                      {/* フィールドエディットモード selectタグ  */}
                      {isEditModeField === "reason_class" && (
                        <>
                          <select
                            className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                            value={inputReasonClass}
                            onChange={(e) => {
                              handleChangeSelectUpdateField({
                                e,
                                fieldName: "reason_class",
                                fieldNameForSelectedRowData: "reason_class",
                                newValue: e.target.value,
                                originalValue: originalValueFieldEdit.current,
                                id: selectedRowDataProperty?.property_id,
                              });
                            }}
                            // onChange={(e) => {
                            //   setInputActivityType(e.target.value);
                            // }}
                          >
                            <option value=""></option>
                            {optionsReasonClass.map((option) => (
                              <option key={option} value={option}>
                                {getReasonClass(option)}
                              </option>
                            ))}
                            {/* <option value="今期">今期</option>
                          <option value="来期">来期</option> */}
                          </select>
                          {/* エディットフィールド送信中ローディングスピナー */}
                          {updatePropertyFieldMutation.isLoading && (
                            <div
                              className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                            >
                              <SpinnerComet w="22px" h="22px" s="3px" />
                            </div>
                          )}
                        </>
                      )}
                      {/* フィールドエディットモードオーバーレイ */}
                      {isEditModeField === "reason_class" && (
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
                      <span className={`${styles.title}`}>動機詳細</span>
                      {isEditModeField !== "reason_detail" && (
                        <span
                          className={`${styles.value} ${styles.editable_field}`}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            if (!selectedRowDataProperty?.reason_detail) return;
                            // if (isNotActivityTypeArray.includes(selectedRowDataProperty.reason_detail))
                            //   return alert(returnMessageNotActivity(selectedRowDataProperty.reason_detail));
                            handleDoubleClickField({
                              e,
                              field: "reason_detail",
                              dispatch: setInputReasonDetail,
                            });
                            if (hoveredItemPosWrap) handleCloseTooltip();
                          }}
                          data-text={`${
                            selectedRowDataProperty?.reason_detail ? selectedRowDataProperty?.reason_detail : ""
                          }`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);

                            handleOpenTooltip({ e, display: "top" });
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);

                            if (hoveredItemPosWrap) handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataProperty?.reason_detail ? selectedRowDataProperty?.reason_detail : ""}
                        </span>
                      )}
                      {/* ============= フィールドエディットモード関連 ============= */}
                      {/* フィールドエディットモード selectタグ  */}
                      {isEditModeField === "reason_detail" && (
                        <>
                          <input
                            type="text"
                            placeholder=""
                            autoFocus
                            className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                            value={inputReasonDetail}
                            // value={selectedRowDataCompany?.name ? selectedRowDataCompany?.name : ""}
                            onChange={(e) => setInputReasonDetail(e.target.value)}
                            // onBlur={() => setInputName(toHalfWidthAndSpace(inputName.trim()))}
                            onCompositionStart={() => setIsComposing(true)}
                            onCompositionEnd={() => setIsComposing(false)}
                            onKeyDown={async (e) => {
                              handleKeyDownUpdateField({
                                e,
                                fieldName: "reason_detail",
                                fieldNameForSelectedRowData: "reason_detail",
                                newValue: inputReasonDetail.trim(),
                                originalValue: originalValueFieldEdit.current,
                                id: selectedRowDataProperty?.property_id,
                                required: true,
                              });
                            }}
                          />
                          {/* 送信ボタンとクローズボタン */}
                          {!updatePropertyFieldMutation.isLoading && (
                            <InputSendAndCloseBtn
                              inputState={inputReasonDetail}
                              setInputState={setInputReasonDetail}
                              onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                                handleClickSendUpdateField({
                                  e,
                                  fieldName: "reason_detail",
                                  fieldNameForSelectedRowData: "reason_detail",
                                  newValue: inputPropertyName.trim(),
                                  originalValue: originalValueFieldEdit.current,
                                  id: selectedRowDataProperty?.property_id,
                                  required: true,
                                })
                              }
                              required={true}
                              isDisplayClose={false}
                            />
                          )}
                          {/* エディットフィールド送信中ローディングスピナー */}
                          {updatePropertyFieldMutation.isLoading && (
                            <div className={`${styles.field_edit_mode_loading_area}`}>
                              <SpinnerComet w="22px" h="22px" s="3px" />
                            </div>
                          )}
                        </>
                      )}
                      {/* フィールドエディットモードオーバーレイ */}
                      {isEditModeField === "reason_detail" && (
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

                {/* 客先予算・決裁者商談有無 通常 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>客先予算</span>
                      {isEditModeField !== "customer_budget" && (
                        <span
                          className={`${styles.value} ${styles.editable_field}`}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            // if (!selectedRowDataProperty?.customer_budget) return;
                            if (!checkNotFalsyExcludeZero(selectedRowDataProperty?.customer_budget)) return;
                            // if (isNotActivityTypeArray.includes(selectedRowDataProperty.customer_budget))
                            //   return alert(returnMessageNotActivity(selectedRowDataProperty.customer_budget));
                            handleDoubleClickField({
                              e,
                              field: "customer_budget",
                              dispatch: setInputCustomerBudget,
                            });
                            if (hoveredItemPosWrap) handleCloseTooltip();
                          }}
                          data-text={`${
                            selectedRowDataProperty?.customer_budget ? selectedRowDataProperty?.customer_budget : ""
                          }`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          }}
                        >
                          {checkNotFalsyExcludeZero(selectedRowDataProperty?.customer_budget)
                            ? Number(selectedRowDataProperty?.customer_budget).toLocaleString()
                            : ""}
                        </span>
                      )}
                      {/* ============= フィールドエディットモード関連 ============= */}
                      {/* フィールドエディットモード selectタグ  */}
                      {isEditModeField === "customer_budget" && (
                        <>
                          <input
                            type="text"
                            autoFocus
                            // placeholder="例：600万円 → 6000000　※半角で入力"
                            className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                            onCompositionStart={() => setIsComposing(true)}
                            onCompositionEnd={() => setIsComposing(false)}
                            value={checkNotFalsyExcludeZero(inputCustomerBudget) ? inputCustomerBudget : ""}
                            onChange={(e) => setInputCustomerBudget(e.target.value)}
                            onKeyDown={(e) => {
                              const _convertValue = convertToYen(inputCustomerBudget.trim());
                              handleKeyDownUpdateField({
                                e,
                                fieldName: "customer_budget",
                                fieldNameForSelectedRowData: "customer_budget",
                                originalValue: originalValueFieldEdit.current,
                                newValue:
                                  checkNotFalsyExcludeZero(inputCustomerBudget) &&
                                  checkNotFalsyExcludeZero(convertToYen(inputCustomerBudget.trim()))
                                    ? (convertToYen(inputCustomerBudget.trim()) as number).toString()
                                    : null,
                                id: selectedRowDataProperty?.property_id,
                                required: false,
                              });
                            }}
                          />
                          {/* 送信ボタンとクローズボタン */}
                          {!updatePropertyFieldMutation.isLoading && (
                            <InputSendAndCloseBtn<string>
                              inputState={inputCustomerBudget}
                              setInputState={setInputCustomerBudget}
                              onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                                const convertedValue = convertToYen(inputCustomerBudget.trim());
                                handleClickSendUpdateField({
                                  e,
                                  fieldName: "customer_budget",
                                  fieldNameForSelectedRowData: "customer_budget",
                                  originalValue: originalValueFieldEdit.current,
                                  newValue:
                                    inputCustomerBudget && checkNotFalsyExcludeZero(convertedValue)
                                      ? (convertedValue as number).toString()
                                      : null,
                                  id: selectedRowDataProperty?.property_id,
                                  required: false,
                                });
                              }}
                              required={false}
                              isDisplayClose={false}
                            />
                          )}
                          {/* エディットフィールド送信中ローディングスピナー */}
                          {updatePropertyFieldMutation.isLoading && (
                            <div
                              className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                            >
                              <SpinnerComet w="22px" h="22px" s="3px" />
                            </div>
                          )}
                        </>
                      )}
                      {/* フィールドエディットモードオーバーレイ */}
                      {isEditModeField === "customer_budget" && (
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
                      <div className={`${styles.title} flex flex-col ${styles.double_text}`}>
                        <span>決裁者</span>
                        <span>商談有無</span>
                      </div>
                      {isEditModeField !== "decision_maker_negotiation" && (
                        <span
                          className={`${styles.value} ${styles.editable_field}`}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            if (!selectedRowDataProperty?.decision_maker_negotiation) return;
                            // if (isNotActivityTypeArray.includes(selectedRowDataProperty.decision_maker_negotiation))
                            //   return alert(returnMessageNotActivity(selectedRowDataProperty.decision_maker_negotiation));
                            handleDoubleClickField({
                              e,
                              field: "decision_maker_negotiation",
                              dispatch: setInputDecisionMakerNegotiation,
                            });
                            if (hoveredItemPosWrap) handleCloseTooltip();
                          }}
                          data-text={
                            selectedRowDataProperty?.decision_maker_negotiation
                              ? getDecisionMakerNegotiation(selectedRowDataProperty?.decision_maker_negotiation)
                              : ""
                          }
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            const el = e.currentTarget;
                            if (el.scrollWidth > el.offsetWidth)
                              handleOpenTooltip({
                                e: e,
                                display: "top",
                                // marginTop: 57,
                                // marginTop: 38,
                                // marginTop: 12,
                                // itemsPosition: "center",
                                // whiteSpace: "nowrap",
                              });
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);

                            if (hoveredItemPosWrap) handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataProperty?.decision_maker_negotiation
                            ? getDecisionMakerNegotiation(selectedRowDataProperty?.decision_maker_negotiation)
                            : ""}
                        </span>
                      )}
                      {/* ============= フィールドエディットモード関連 ============= */}
                      {/* フィールドエディットモード selectタグ  */}
                      {isEditModeField === "decision_maker_negotiation" && (
                        <>
                          <select
                            className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                            value={inputDecisionMakerNegotiation}
                            onChange={(e) => {
                              handleChangeSelectUpdateField({
                                e,
                                fieldName: "decision_maker_negotiation",
                                fieldNameForSelectedRowData: "decision_maker_negotiation",
                                newValue: e.target.value,
                                originalValue: originalValueFieldEdit.current,
                                id: selectedRowDataProperty?.property_id,
                              });
                            }}
                            // onChange={(e) => {
                            //   setInputActivityType(e.target.value);
                            // }}
                          >
                            <option value=""></option>
                            {optionsDecisionMakerNegotiation.map((option) => (
                              <option key={option} value={option}>
                                {getDecisionMakerNegotiation(option)}
                              </option>
                            ))}
                            {/* <option value="今期">今期</option>
                          <option value="来期">来期</option> */}
                          </select>
                          {/* エディットフィールド送信中ローディングスピナー */}
                          {updatePropertyFieldMutation.isLoading && (
                            <div
                              className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                            >
                              <SpinnerComet w="22px" h="22px" s="3px" />
                            </div>
                          )}
                        </>
                      )}
                      {/* フィールドエディットモードオーバーレイ */}
                      {isEditModeField === "decision_maker_negotiation" && (
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

                {/* 事業部名 通常 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>事業部名</span>
                      <span
                        className={`${styles.value}`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        {selectedRowDataProperty?.assigned_department_name
                          ? selectedRowDataProperty?.assigned_department_name
                          : ""}
                      </span>
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title} ${styles.min}`}>係・ﾁｰﾑ</span>
                      <span
                        className={`${styles.value}`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        {selectedRowDataProperty?.assigned_unit_name ? selectedRowDataProperty?.assigned_unit_name : ""}
                      </span>
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 事業所・自社担当 通常 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>事業所</span>
                      <span
                        className={`${styles.value}`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        {selectedRowDataProperty?.assigned_office_name
                          ? selectedRowDataProperty?.assigned_office_name
                          : ""}
                      </span>
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>自社担当</span>
                      <span
                        className={`${styles.value}`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        {selectedRowDataProperty?.property_member_name
                          ? selectedRowDataProperty?.property_member_name
                          : ""}
                      </span>
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 結果エリアここまで */}
              </div>
            </div>
          </div>
          {/* ---------------- 通常モード 真ん中コンテナここまで ---------------- */}

          {/* ---------------- 通常モード 右コンテナ ---------------- */}
          <div
            // className={`${styles.left_container1 h-full min-w-[calc((100vw-var(--sidebar-width))/3)1 pb-[35px] pt-[10px]`}
            className={`${styles.left_container} ${styles.detail_modal} ${
              isOpenSidebar ? `transition-base02` : `transition-base01`
            } h-full min-w-[calc((100vw-var(--sidebar-mini-width))/3-11px)] max-w-[calc((100vw-var(--sidebar-mini-width))/3-11px)] pb-[35px] pt-[0px]`}
          >
            {/* --------- ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full w-full flex-col`}>
              {/* アクティビティ セクションタイトル 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.section_title}`}>活動</span>
                  </div>
                  <div className={`${styles.section_underline}`}></div>
                </div>
              </div>

              <div className={`${styles.spacer} min-h-[5px] w-full`}></div>

              {/* 活動履歴 */}
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Suspense fallback={<FallbackUnderRightActivityLogCustom />}>
                  <UnderRightActivityLogCustom isHoverableBorder={true} />
                </Suspense>
              </ErrorBoundary>
              {/* <FallbackUnderRightActivityLogCustom /> */}

              {/* 会社情報 セクションタイトル 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.section_title} !text-[15px]`}>会社情報</span>

                    {/* <span className={`${styles.value} ${styles.value_highlight}`}>
                        {selectedRowDataProperty?.company_name ? selectedRowDataProperty?.company_name : ""}
                      </span> */}
                  </div>
                  <div className={`${styles.section_underline}`}></div>
                </div>
              </div>

              {/* 会社名 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>●会社名</span>
                    <span
                      className={`${styles.value} ${styles.value_highlight} ${styles.text_start} ${styles.editable_field} hover:text-[var(--color-bg-brand-f)]`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                      // onClick={() => setIsOpenClientCompanyDetailModal(true)}
                    >
                      {selectedRowDataProperty?.company_name ? selectedRowDataProperty?.company_name : ""}
                    </span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 部署名 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>●部署名</span>
                    <span
                      className={`${styles.value} ${styles.text_start}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {/* {selectedRowDataProperty?.department_name ? selectedRowDataProperty?.department_name : ""} */}
                      {selectedRowDataProperty?.company_department_name
                        ? selectedRowDataProperty?.company_department_name
                        : ""}
                    </span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 担当者名・直通TEL 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>担当者名</span>
                    <span
                      className={`${styles.value} ${styles.editable_field} hover:text-[var(--color-bg-brand-f)]`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                      onClick={() => setIsOpenContactDetailModal(true)}
                    >
                      {selectedRowDataProperty?.contact_name ? selectedRowDataProperty?.contact_name : ""}
                    </span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>直通TEL</span>
                    <span
                      className={`${styles.value}`}
                      data-text={selectedRowDataProperty?.direct_line ? selectedRowDataProperty?.direct_line : ""}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        const el = e.currentTarget;
                        if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                        // handleOpenTooltip(e);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        if (hoveredItemPosWrap) handleCloseTooltip();
                      }}
                    >
                      {selectedRowDataProperty?.direct_line ? selectedRowDataProperty?.direct_line : ""}
                    </span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 内線TEL・代表TEL 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>内線TEL</span>
                    <span
                      className={`${styles.value}`}
                      data-text={selectedRowDataProperty?.extension ? selectedRowDataProperty?.extension : ""}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        const el = e.currentTarget;
                        if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                        // handleOpenTooltip(e);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        if (hoveredItemPosWrap) handleCloseTooltip();
                      }}
                    >
                      {selectedRowDataProperty?.extension ? selectedRowDataProperty?.extension : ""}
                    </span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>代表TEL</span>
                    <span
                      className={`${styles.value}`}
                      data-text={
                        selectedRowDataProperty?.main_phone_number ? selectedRowDataProperty?.main_phone_number : ""
                      }
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        const el = e.currentTarget;
                        if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                        // handleOpenTooltip(e);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        if (hoveredItemPosWrap) handleCloseTooltip();
                      }}
                    >
                      {selectedRowDataProperty?.main_phone_number ? selectedRowDataProperty?.main_phone_number : ""}
                    </span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 直通FAX・代表FAX 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>直通FAX</span>
                    <span
                      className={`${styles.value}`}
                      data-text={selectedRowDataProperty?.direct_fax ? selectedRowDataProperty?.direct_fax : ""}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        const el = e.currentTarget;
                        if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                        // handleOpenTooltip(e);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        if (hoveredItemPosWrap) handleCloseTooltip();
                      }}
                    >
                      {selectedRowDataProperty?.direct_fax ? selectedRowDataProperty?.direct_fax : ""}
                    </span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className={`flex h-full w-1/2 flex-col pr-[20px]`}>
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>代表FAX</span>
                    <span
                      className={`${styles.value}`}
                      data-text={selectedRowDataProperty?.main_fax ? selectedRowDataProperty?.main_fax : ""}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        const el = e.currentTarget;
                        if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                        // handleOpenTooltip(e);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        if (hoveredItemPosWrap) handleCloseTooltip();
                      }}
                    >
                      {selectedRowDataProperty?.main_fax ? selectedRowDataProperty?.main_fax : ""}
                    </span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 社用携帯・私用携帯 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>社用携帯</span>
                    <span
                      className={`${styles.value}`}
                      data-text={
                        selectedRowDataProperty?.company_cell_phone ? selectedRowDataProperty?.company_cell_phone : ""
                      }
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        const el = e.currentTarget;
                        if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                        // handleOpenTooltip(e);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        if (hoveredItemPosWrap) handleCloseTooltip();
                      }}
                    >
                      {selectedRowDataProperty?.company_cell_phone ? selectedRowDataProperty?.company_cell_phone : ""}
                    </span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>私用携帯</span>
                    <span
                      className={`${styles.value}`}
                      data-text={
                        selectedRowDataProperty?.personal_cell_phone ? selectedRowDataProperty?.personal_cell_phone : ""
                      }
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        const el = e.currentTarget;
                        if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                        // handleOpenTooltip(e);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        if (hoveredItemPosWrap) handleCloseTooltip();
                      }}
                    >
                      {selectedRowDataProperty?.personal_cell_phone ? selectedRowDataProperty?.personal_cell_phone : ""}
                    </span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* Email 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>E-mail</span>
                    <span
                      className={`${styles.value}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataProperty?.contact_email ? selectedRowDataProperty?.contact_email : ""}
                    </span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 郵便番号・ 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>郵便番号</span>
                    <span
                      className={`${styles.value}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataProperty?.zipcode ? selectedRowDataProperty?.zipcode : ""}
                    </span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}></span>
                    {/* {!searchMode && (
                    <span className={`${styles.value}`}>
                      {selectedRowDataProperty?.established_in ? selectedRowDataProperty?.established_in : ""}
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

              {/* 住所 通常 */}
              <div className={`${styles.row_area_lg_box} flex h-[50px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px] ">
                  <div className={`${styles.title_box} flex h-full`}>
                    <span className={`${styles.title}`}>○住所</span>
                    <span
                      className={`${styles.full_value} h-[45px] !overflow-visible !whitespace-normal`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataProperty?.address ? selectedRowDataProperty?.address : ""}
                    </span>
                  </div>
                  <div className={`${styles.underline} `}></div>
                </div>
              </div>

              {/* 役職名・職位 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>役職名</span>
                    <span
                      className={`${styles.value}`}
                      data-text={selectedRowDataProperty?.position_name ? selectedRowDataProperty?.position_name : ""}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        handleOpenTooltip({ e, display: "top" });
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        if (hoveredItemPosWrap) handleCloseTooltip();
                      }}
                    >
                      {selectedRowDataProperty?.position_name ? selectedRowDataProperty?.position_name : ""}
                    </span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>職位</span>
                    <span
                      className={`${styles.value}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {/* {selectedRowDataProperty?.position_class ? selectedRowDataProperty?.position_class : ""} */}
                      {selectedRowDataProperty &&
                      selectedRowDataProperty?.position_class &&
                      mappingPositionClass[selectedRowDataProperty.position_class]?.[language]
                        ? mappingPositionClass[selectedRowDataProperty.position_class]?.[language]
                        : ""}
                    </span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 担当職種・決裁金額 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>担当職種</span>
                    <span
                      className={`${styles.value}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {/* {selectedRowDataProperty?.occupation ? selectedRowDataProperty?.occupation : ""} */}
                      {selectedRowDataProperty &&
                      selectedRowDataProperty?.occupation &&
                      mappingOccupation[selectedRowDataProperty.occupation]?.[language]
                        ? mappingOccupation[selectedRowDataProperty.occupation]?.[language]
                        : ""}
                    </span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <div className={`${styles.title} !mr-[15px] flex flex-col ${styles.double_text}`}>
                      <span className={``}>決裁金額</span>
                      <span className={``}>(万円)</span>
                    </div>
                    <span
                      className={`${styles.value}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataProperty?.approval_amount ? selectedRowDataProperty?.approval_amount : ""}
                    </span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 規模（ランク）・決算月 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>規模(ﾗﾝｸ)</span>
                    <span
                      className={`${styles.value}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataProperty?.number_of_employees_class
                        ? getNumberOfEmployeesClass(selectedRowDataProperty?.number_of_employees_class)
                        : ""}
                    </span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>決算月</span>
                    <span
                      className={`${styles.value}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataProperty?.fiscal_end_month ? selectedRowDataProperty?.fiscal_end_month : ""}
                    </span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 予算申請月1・予算申請月2 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} text-[12px]`}>予算申請月1</span>
                    <span
                      className={`${styles.value}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataProperty?.budget_request_month1
                        ? selectedRowDataProperty?.budget_request_month1
                        : ""}
                    </span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} text-[12px]`}>予算申請月2</span>
                    <span
                      className={`${styles.value}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataProperty?.budget_request_month2
                        ? selectedRowDataProperty?.budget_request_month2
                        : ""}
                    </span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 資本金・設立 通常モード テスト 通常 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    {/* <span className={`${styles.title}`}>資本金(万円)</span> */}
                    <div className={`${styles.title} ${styles.double_text} flex flex-col`}>
                      <span>資本金</span>
                      <span>(万円)</span>
                    </div>
                    <span
                      className={`${styles.value}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {/* {selectedRowDataCompany?.capital ? selectedRowDataCompany?.capital : ""} */}
                      {selectedRowDataProperty?.capital
                        ? convertToJapaneseCurrencyFormat(selectedRowDataProperty.capital)
                        : ""}
                    </span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>設立</span>
                    <span
                      className={`${styles.value}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataProperty?.established_in ? selectedRowDataProperty?.established_in : ""}
                    </span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 事業内容 通常 */}
              <div className={`${styles.row_area_lg_box} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px] ">
                  <div className={`${styles.title_box}  flex h-full`}>
                    <span className={`${styles.title}`}>事業内容</span>
                    <span
                      className={`${styles.textarea_value} `}
                      data-text={`${
                        selectedRowDataProperty?.business_content ? selectedRowDataProperty?.business_content : ""
                      }`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        handleOpenTooltip({ e, display: "top" });
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        if (hoveredItemPosWrap) handleCloseTooltip();
                      }}
                      dangerouslySetInnerHTML={{
                        __html: selectedRowDataProperty?.business_content
                          ? selectedRowDataProperty?.business_content.replace(/\n/g, "<br>")
                          : "",
                      }}
                    ></span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 主要取引先 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>主要取引先</span>
                    <span
                      className={`${styles.value}`}
                      data-text={selectedRowDataProperty?.clients ? selectedRowDataProperty?.clients : ""}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        handleOpenTooltip({ e, display: "top" });
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        if (hoveredItemPosWrap) handleCloseTooltip();
                      }}
                    >
                      {selectedRowDataProperty?.clients ? selectedRowDataProperty?.clients : ""}
                    </span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 主要仕入先 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>主要仕入先</span>
                    <span
                      className={`${styles.value}`}
                      data-text={`${selectedRowDataProperty?.supplier ? selectedRowDataProperty?.supplier : ""}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        handleOpenTooltip({ e, display: "top" });
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        if (hoveredItemPosWrap) handleCloseTooltip();
                      }}
                    >
                      {selectedRowDataProperty?.supplier ? selectedRowDataProperty?.supplier : ""}
                    </span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 設備 通常 */}
              <div className={`${styles.row_area_lg_box} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px] ">
                  <div className={`${styles.title_box}  flex h-full`}>
                    <span className={`${styles.title}`}>設備</span>
                    <span
                      className={`${styles.textarea_value}`}
                      data-text={`${selectedRowDataProperty?.facility ? selectedRowDataProperty?.facility : ""}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        handleOpenTooltip({ e, display: "top" });
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        if (hoveredItemPosWrap) handleCloseTooltip();
                      }}
                      dangerouslySetInnerHTML={{
                        __html: selectedRowDataProperty?.facility
                          ? selectedRowDataProperty?.facility.replace(/\n/g, "<br>")
                          : "",
                      }}
                    >
                      {/* {selectedRowDataProperty?.facility ? selectedRowDataProperty?.facility : ""} */}
                    </span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 事業拠点・海外拠点 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>事業拠点</span>
                    <span
                      className={`${styles.value}`}
                      data-text={`${
                        selectedRowDataProperty?.business_sites ? selectedRowDataProperty?.business_sites : ""
                      }`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        handleOpenTooltip({ e, display: "top" });
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        if (hoveredItemPosWrap) handleCloseTooltip();
                      }}
                    >
                      {selectedRowDataProperty?.business_sites ? selectedRowDataProperty?.business_sites : ""}
                    </span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>海外拠点</span>
                    <span
                      className={`${styles.value}`}
                      data-text={`${
                        selectedRowDataProperty?.overseas_bases ? selectedRowDataProperty?.overseas_bases : ""
                      }`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        handleOpenTooltip({ e, display: "top" });
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        if (hoveredItemPosWrap) handleCloseTooltip();
                      }}
                    >
                      {selectedRowDataProperty?.overseas_bases ? selectedRowDataProperty?.overseas_bases : ""}
                    </span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* グループ会社 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>ｸﾞﾙｰﾌﾟ会社</span>
                    <span
                      className={`${styles.value}`}
                      data-text={`${
                        selectedRowDataProperty?.group_company ? selectedRowDataProperty?.group_company : ""
                      }`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        handleOpenTooltip({ e, display: "top" });
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        if (hoveredItemPosWrap) handleCloseTooltip();
                      }}
                    >
                      {selectedRowDataProperty?.group_company ? selectedRowDataProperty?.group_company : ""}
                    </span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* HP 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>HP</span>
                    {!!selectedRowDataProperty?.website_url ? (
                      <a
                        href={selectedRowDataProperty.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${styles.value} ${styles.anchor}`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        {selectedRowDataProperty.website_url}
                      </a>
                    ) : (
                      <span></span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 会社Email 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>会社Email</span>
                    <span
                      className={`${styles.value} ${styles.email_value}`}
                      onClick={async () => {
                        if (!selectedRowDataProperty?.company_email) return;
                        try {
                          await navigator.clipboard.writeText(selectedRowDataProperty.company_email);
                          toast.success(`コピーしました!`, {
                            autoClose: 1000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                          });
                        } catch (e: any) {
                          toast.error(`コピーできませんでした!`, {
                            autoClose: 1000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                          });
                        }
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataProperty?.company_email ? selectedRowDataProperty?.company_email : ""}
                    </span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 業種 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>○業種</span>
                    <span
                      className={`${styles.value}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataProperty?.industry_type_id
                        ? mappingIndustryType[selectedRowDataProperty?.industry_type_id][language]
                        : ""}
                    </span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* 製品分類（大分類） 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <div className={`${styles.title} flex flex-col ${styles.double_text}`}>
                      <span className={``}>製品分類</span>
                      <span className={``}>(大分類)</span>
                    </div>
                    <span
                      className={`${styles.value}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataProperty?.product_category_large
                        ? selectedRowDataProperty?.product_category_large
                        : ""}
                    </span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* 製品分類（中分類） 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <div className={`${styles.title} flex flex-col ${styles.double_text}`}>
                      <span className={``}>製品分類</span>
                      <span className={``}>(中分類)</span>
                    </div>
                    <span
                      className={`${styles.value}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataProperty?.product_category_medium
                        ? selectedRowDataProperty?.product_category_medium
                        : ""}
                    </span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 法人番号・ID 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>○法人番号</span>
                    <span
                      className={`${styles.value}`}
                      data-text={
                        selectedRowDataProperty?.corporate_number ? selectedRowDataProperty?.corporate_number : ""
                      }
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        const el = e.currentTarget;
                        if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        if (hoveredItemPosWrap) handleCloseTooltip();
                      }}
                    >
                      {selectedRowDataProperty?.corporate_number ? selectedRowDataProperty?.corporate_number : ""}
                    </span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  {/* <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title_min}`}>会社ID</span>
                    {!searchMode && (
                      <span className={`${styles.value} truncate`}>
                        {selectedRowDataProperty?.company_id ? selectedRowDataProperty?.company_id : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div> */}
                </div>
              </div>

              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    {/* <span className={`${styles.title}`}>○法人番号</span> */}
                  </div>
                </div>
              </div>

              {/* --------- ラッパーここまで --------- */}
            </div>
          </div>
          {/* ---------------- 通常モード 右コンテナここまで ---------------- */}
          <div className="h-full min-w-[20px]"></div>
        </div>
      </div>
    </>
  );
};

export const DetailPropertyModal = memo(DetailPropertyModalMemo);
