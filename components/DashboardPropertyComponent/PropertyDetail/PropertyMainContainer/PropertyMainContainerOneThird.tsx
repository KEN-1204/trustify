import React, { FC, FormEvent, Suspense, memo, useEffect, useMemo, useState } from "react";
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
import { optionsOccupation } from "@/utils/selectOptions";
import { generateYearQuarters } from "@/utils/Helpers/generateYearQuarters";

// https://nextjs-ja-translation-docs.vercel.app/docs/advanced-features/dynamic-import
// デフォルトエクスポートの場合のダイナミックインポート
// const DynamicComponent = dynamic(() => import('../components/hello'));
// 名前付きエクスポートの場合のダイナミックインポート
// const ContactUnderRightPropertyLog = dynamic(
//   () =>
//     import("./ContactUnderRightPropertyLog/ContactUnderRightPropertyLog").then(
//       (mod) => mod.ContactUnderRightPropertyLog
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

const PropertyMainContainerOneThirdMemo: FC = () => {
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const searchMode = useDashboardStore((state) => state.searchMode);
  const setSearchMode = useDashboardStore((state) => state.setSearchMode);
  console.log("🔥 PropertyMainContainerレンダリング searchMode", searchMode);
  const setHoveredItemPosWrap = useStore((state) => state.setHoveredItemPosWrap);
  const isOpenSidebar = useDashboardStore((state) => state.isOpenSidebar);
  // 上画面の選択中の列データ会社
  const selectedRowDataProperty = useDashboardStore((state) => state.selectedRowDataProperty);
  const setSelectedRowDataProperty = useDashboardStore((state) => state.setSelectedRowDataProperty);
  // チェックボックスクリックで案件編集モーダルオープン
  const setIsOpenUpdatePropertyModal = useDashboardStore((state) => state.setIsOpenUpdatePropertyModal);

  type TooltipParams = {
    e: React.MouseEvent<HTMLElement, MouseEvent>;
    display?: "top" | "right" | "bottom" | "left" | "";
  };
  const handleOpenTooltip = ({ e, display = "" }: TooltipParams) => {
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
  // Propertyテーブル
  const [inputPropertyCreatedByCompanyId, setInputPropertyCreatedByCompanyId] = useState("");
  const [inputPropertyCreatedByUserId, setInputPropertyCreatedByUserId] = useState("");
  const [inputPropertyCreatedByDepartmentOfUser, setInputPropertyCreatedByDepartmentOfUser] = useState("");
  const [inputPropertyCreatedByUnitOfUser, setInputPropertyCreatedByUnitOfUser] = useState("");
  const [inputCurrentStatus, setInputCurrentStatus] = useState("");
  const [inputPropertyName, setInputPropertyName] = useState("");
  const [inputPropertySummary, setInputPropertySummary] = useState("");
  const [inputPendingFlag, setInputPendingFlag] = useState<boolean | null>(null);
  const [inputRejectedFlag, setInputRejectedFlag] = useState<boolean | null>(null);
  const [inputProductName, setInputProductName] = useState(""); // 商品
  const [inputProductSales, setInputProductSales] = useState<number | null>(null); // 予定売上台数
  const [inputExpectedOrderDate, setInputExpectedOrderDate] = useState<Date | null>(null); // 獲得予定時期
  const [inputExpectedSalesPrice, setInputExpectedSalesPrice] = useState<number | null>(null); // 予定売上価格
  const [inputTermDivision, setInputTermDivision] = useState(""); // 今・来期
  const [inputSoldProductName, setInputSoldProductName] = useState(""); // 売上商品
  const [inputUnitSales, setInputUnitSales] = useState<number | null>(null); // 売上台数
  const [inputSalesContributionCategory, setInputSalesContributionCategory] = useState(""); // 売上貢献区分
  const [inputSalesPrice, setInputSalesPrice] = useState<number | null>(null); // 売上価格
  const [inputDiscountedPrice, setInputDiscountedPrice] = useState<number | null>(null); // 値引価格
  const [inputDiscountRate, setInputDiscountRate] = useState<number | null>(null);
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
  const [inputCustomerBudget, setInputCustomerBudget] = useState<number | null>(null);
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

  const supabase = useSupabaseClient();
  const newSearchProperty_Contact_CompanyParams = useDashboardStore(
    (state) => state.newSearchProperty_Contact_CompanyParams
  );
  const setNewSearchProperty_Contact_CompanyParams = useDashboardStore(
    (state) => state.setNewSearchProperty_Contact_CompanyParams
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
  // 数値型のフィールド用
  function adjustFieldValueNumber(value: number | null) {
    if (value === null) return null; // 全てのデータ
    return value;
  }

  // 編集モードtrueの場合、サーチ条件をinputタグのvalueに格納
  // 新規サーチの場合には、サーチ条件を空にする
  useEffect(() => {
    // if (newSearchProperty_Contact_CompanyParams === null) return;

    if (editSearchMode && searchMode) {
      if (newSearchProperty_Contact_CompanyParams === null) return;
      console.log(
        "🔥Propertyメインコンテナー useEffect 編集モード inputにnewSearchActivity_Contact_CompanyParamsを格納",
        newSearchProperty_Contact_CompanyParams
      );
      //   setInputCompanyName(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.company_name));
      setInputCompanyName(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams["client_companies.name"]));
      setInputDepartmentName(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.department_name));
      //   setInputContactName(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.contact_name));
      setInputContactName(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams["contacts.name"]));
      setInputTel(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams?.main_phone_number));
      setInputFax(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams?.main_fax));
      setInputZipcode(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams?.zipcode));
      setInputEmployeesClass(
        beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams?.number_of_employees_class)
      );
      setInputAddress(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams?.address));
      setInputCapital(
        beforeAdjustFieldValue(
          newSearchProperty_Contact_CompanyParams?.capital
            ? newSearchProperty_Contact_CompanyParams?.capital.toString()
            : ""
        )
      );
      setInputFound(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams?.established_in));
      setInputContent(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams?.business_content));
      setInputHP(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.website_url));
      //   setInputCompanyEmail(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.company_email));
      setInputCompanyEmail(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams["client_companies.email"]));
      setInputIndustryType(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.industry_type));
      setInputProductL(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.product_category_large));
      setInputProductM(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.product_category_medium));
      setInputProductS(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.product_category_small));
      setInputFiscal(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.fiscal_end_month));
      setInputBudgetRequestMonth1(
        beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.budget_request_month1)
      );
      setInputBudgetRequestMonth2(
        beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.budget_request_month2)
      );
      setInputClient(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.clients));
      setInputSupplier(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.supplier));
      setInputFacility(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.facility));
      setInputBusinessSite(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.business_sites));
      setInputOverseas(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.overseas_bases));
      setInputGroup(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.group_company));
      setInputCorporateNum(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.corporate_number));

      // contactsテーブル
      //   setInputContactName(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.contact_name));
      setInputContactName(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams["contacts.name"]));
      setInputDirectLine(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.direct_line));
      setInputDirectFax(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.direct_fax));
      setInputExtension(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.extension));
      setInputCompanyCellPhone(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.company_cell_phone));
      setInputPersonalCellPhone(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.personal_cell_phone));
      //   setInputContactEmail(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.contact_email));
      setInputContactEmail(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams["contacts.email"]));
      setInputPositionName(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.position_name));
      setInputPositionClass(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.position_class));
      setInputOccupation(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.occupation));
      setInputApprovalAmount(
        beforeAdjustFieldValue(
          newSearchProperty_Contact_CompanyParams.approval_amount
            ? newSearchProperty_Contact_CompanyParams.approval_amount.toString()
            : ""
        )
      );
      setInputContactCreatedByCompanyId(
        beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams["contacts.created_by_company_id"])
      );
      setInputContactCreatedByUserId(
        beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams["contacts.created_by_user_id"])
      );

      // Propertiesテーブル
      setInputPropertyCreatedByCompanyId(
        beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams["properties.created_by_company_id"])
      );
      setInputPropertyCreatedByUserId(
        beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams["properties.created_by_user_id"])
      );
      setInputPropertyCreatedByDepartmentOfUser(
        beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams["properties.created_by_department_of_user"])
      );
      setInputPropertyCreatedByUnitOfUser(
        beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams["properties.created_by_unit_of_user"])
      );
      setInputCurrentStatus(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.current_status));
      // setInputScheduledFollowUpDate(
      //   beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.scheduled_follow_up_date)
      // );
      // setInputScheduledFollowUpDate(newSearchProperty_Contact_CompanyParams.scheduled_follow_up_date);
      setInputPropertyName(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.property_name));
      setInputPropertySummary(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.property_summary));
      setInputPendingFlag(newSearchProperty_Contact_CompanyParams.pending_flag);
      setInputRejectedFlag(newSearchProperty_Contact_CompanyParams.rejected_flag);
      setInputProductName(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.product_name));
      setInputProductSales(newSearchProperty_Contact_CompanyParams.product_sales);
      setInputExpectedOrderDate(
        newSearchProperty_Contact_CompanyParams.expected_order_date
          ? new Date(newSearchProperty_Contact_CompanyParams.expected_order_date)
          : null
      );
      setInputExpectedSalesPrice(newSearchProperty_Contact_CompanyParams.expected_sales_price);
      setInputTermDivision(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.term_division));
      setInputSoldProductName(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.sold_product_name));
      setInputUnitSales(newSearchProperty_Contact_CompanyParams.unit_sales);
      setInputSalesContributionCategory(
        beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.sales_contribution_category)
      );
      setInputSalesPrice(newSearchProperty_Contact_CompanyParams.sales_price);
      setInputDiscountedPrice(newSearchProperty_Contact_CompanyParams.discounted_price);
      setInputDiscountRate(newSearchProperty_Contact_CompanyParams.discount_rate);
      setInputSalesClass(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.sales_class));
      setInputExpansionDate(
        newSearchProperty_Contact_CompanyParams.expansion_date
          ? new Date(newSearchProperty_Contact_CompanyParams.expansion_date)
          : null
      );
      setInputSalesDate(
        newSearchProperty_Contact_CompanyParams.sales_date
          ? new Date(newSearchProperty_Contact_CompanyParams.sales_date)
          : null
      );
      // setInputExpansionQuarter(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.expansion_quarter));
      // setInputSalesQuarter(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.sales_quarter));
      setInputExpansionQuarter(adjustFieldValueNumber(newSearchProperty_Contact_CompanyParams.expansion_quarter));
      setInputSalesQuarter(adjustFieldValueNumber(newSearchProperty_Contact_CompanyParams.sales_quarter));
      setInputSubscriptionStartDate(
        newSearchProperty_Contact_CompanyParams.subscription_start_date
          ? new Date(newSearchProperty_Contact_CompanyParams.subscription_start_date)
          : null
      );
      setInputSubscriptionCanceledAt(
        newSearchProperty_Contact_CompanyParams.subscription_canceled_at
          ? new Date(newSearchProperty_Contact_CompanyParams.subscription_canceled_at)
          : null
      );
      setInputLeasingCompany(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.leasing_company));
      setInputLeaseDivision(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.lease_division));
      setInputLeaseExpirationDate(
        newSearchProperty_Contact_CompanyParams.lease_expiration_date
          ? new Date(newSearchProperty_Contact_CompanyParams.lease_expiration_date)
          : null
      );
      setInputStepInFlag(newSearchProperty_Contact_CompanyParams.step_in_flag);
      setInputRepeatFlag(newSearchProperty_Contact_CompanyParams.repeat_flag);
      setInputOrderCertaintyStartOfMonth(
        beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.order_certainty_start_of_month)
      );
      setInputReviewOrderCertainty(
        beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.review_order_certainty)
      );
      setInputCompetitorAppearanceDate(
        newSearchProperty_Contact_CompanyParams.competitor_appearance_date
          ? new Date(newSearchProperty_Contact_CompanyParams.competitor_appearance_date)
          : null
      );
      setInputCompetitor(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.competitor));
      setInputCompetitorProduct(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.competitor_product));
      setInputReasonClass(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.reason_class));
      setInputReasonDetail(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.reason_detail));
      setInputCustomerBudget(newSearchProperty_Contact_CompanyParams.customer_budget);
      setInputDecisionMakerNegotiation(
        beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.decision_maker_negotiation)
      );
      setInputExpansionYearMonth(newSearchProperty_Contact_CompanyParams.expansion_year_month);
      setInputSalesYearMonth(newSearchProperty_Contact_CompanyParams.sales_year_month);
      setInputSubscriptionInterval(
        beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.subscription_interval)
      );
      setInputCompetitionState(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.competition_state));
      setInputPropertyBusinessOffice(
        beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.property_business_office)
      );
      setInputPropertyDepartment(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.property_department));
      setInputPropertyMemberName(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.property_member_name));
      setInputPropertyYearMonth(adjustFieldValueNumber(newSearchProperty_Contact_CompanyParams.property_year_month));
      setInputPropertyDate(
        newSearchProperty_Contact_CompanyParams.property_date
          ? new Date(newSearchProperty_Contact_CompanyParams.property_date)
          : null
      );
    } else if (!editSearchMode && searchMode) {
      console.log(
        "🔥Meetingメインコンテナー useEffect 新規サーチモード inputを初期化",
        newSearchProperty_Contact_CompanyParams
      );
      if (!!inputCompanyName) setInputCompanyName("");
      // if (!!inputContactName) setInputContactName("");
      if (!!inputDepartmentName) setInputDepartmentName("");
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

      // Propertysテーブル
      if (!!inputPropertyCreatedByCompanyId) setInputPropertyCreatedByCompanyId("");
      if (!!inputPropertyCreatedByUserId) setInputPropertyCreatedByUserId("");
      if (!!inputPropertyCreatedByDepartmentOfUser) setInputPropertyCreatedByDepartmentOfUser("");
      if (!!inputPropertyCreatedByUnitOfUser) setInputPropertyCreatedByUnitOfUser("");
      if (!!inputCurrentStatus) setInputCurrentStatus("");
      if (!!inputPropertyName) setInputPropertyName("");
      if (!!inputPropertySummary) setInputPropertySummary("");
      if (!!inputPendingFlag) setInputPendingFlag(null);
      if (!!inputRejectedFlag) setInputRejectedFlag(null);
      if (!!inputProductName) setInputProductName("");
      if (!!inputProductSales) setInputProductSales(null);
      if (!!inputExpectedOrderDate) setInputExpectedOrderDate(null);
      if (!!inputExpectedSalesPrice) setInputExpectedSalesPrice(null);
      if (!!inputTermDivision) setInputTermDivision("");
      if (!!inputSoldProductName) setInputSoldProductName("");
      if (!!inputUnitSales) setInputUnitSales(null);
      if (!!inputSalesContributionCategory) setInputSalesContributionCategory("");
      if (!!inputSalesPrice) setInputSalesPrice(null);
      if (!!inputDiscountedPrice) setInputDiscountedPrice(null);
      if (!!inputDiscountRate) setInputDiscountRate(null);
      if (!!inputSalesClass) setInputSalesClass("");
      if (!!inputExpansionDate) setInputExpansionDate(null);
      if (!!inputSalesDate) setInputSalesDate(null);
      // if (!!inputExpansionQuarter) setInputExpansionQuarter("");
      // if (!!inputSalesQuarter) setInputSalesQuarter("");
      if (!!inputExpansionQuarter) setInputExpansionQuarter(null);
      if (!!inputSalesQuarter) setInputSalesQuarter(null);
      if (!!inputSubscriptionStartDate) setInputSubscriptionStartDate(null);
      if (!!inputSubscriptionCanceledAt) setInputSubscriptionCanceledAt(null);
      if (!!inputLeasingCompany) setInputLeasingCompany("");
      if (!!inputLeaseDivision) setInputLeaseDivision("");
      if (!!inputLeaseExpirationDate) setInputLeaseExpirationDate(null);
      if (!!inputStepInFlag) setInputStepInFlag(null);
      if (!!inputRepeatFlag) setInputRepeatFlag(null);
      if (!!inputOrderCertaintyStartOfMonth) setInputOrderCertaintyStartOfMonth("");
      if (!!inputReviewOrderCertainty) setInputReviewOrderCertainty("");
      if (!!inputCompetitorAppearanceDate) setInputCompetitorAppearanceDate(null);
      if (!!inputCompetitor) setInputCompetitor("");
      if (!!inputCompetitorProduct) setInputCompetitorProduct("");
      if (!!inputReasonClass) setInputReasonClass("");
      if (!!inputReasonDetail) setInputReasonDetail("");
      if (!!inputCustomerBudget) setInputCustomerBudget(null);
      if (!!inputDecisionMakerNegotiation) setInputDecisionMakerNegotiation("");
      if (!!inputExpansionYearMonth) setInputExpansionYearMonth(null);
      if (!!inputSalesYearMonth) setInputSalesYearMonth(null);
      if (!!inputSubscriptionInterval) setInputSubscriptionInterval("");
      if (!!inputCompetitionState) setInputCompetitionState("");
      if (!!inputPropertyYearMonth) setInputPropertyYearMonth(null);
      if (!!inputPropertyDepartment) setInputPropertyDepartment("");
      if (!!inputPropertyBusinessOffice) setInputPropertyBusinessOffice("");
      if (!!inputPropertyMemberName) setInputPropertyMemberName("");
      if (!!inputPropertyDate) setInputPropertyDate(null);
    }
  }, [editSearchMode, searchMode]);

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
    // Propertiesテーブル
    let _property_created_by_company_id = adjustFieldValue(inputPropertyCreatedByCompanyId);
    let _property_created_by_user_id = adjustFieldValue(inputPropertyCreatedByUserId);
    let _property_created_by_department_of_user = adjustFieldValue(inputPropertyCreatedByDepartmentOfUser);
    let _property_created_by_unit_of_user = adjustFieldValue(inputPropertyCreatedByUnitOfUser);
    let _current_status = adjustFieldValue(inputCurrentStatus);
    let _property_name = adjustFieldValue(inputPropertyName);
    let _property_summary = adjustFieldValue(inputPropertySummary);
    let _pending_flag = inputPendingFlag;
    let _rejected_flag = inputRejectedFlag;
    let _product_name = adjustFieldValue(inputProductName);
    let _product_sales = adjustFieldValueNumber(inputProductSales);
    let _expected_order_date = inputExpectedOrderDate ? inputExpectedOrderDate.toISOString() : null;
    let _expected_sales_price = adjustFieldValueNumber(inputExpectedSalesPrice);
    let _term_division = adjustFieldValue(inputTermDivision);
    let _sold_product_name = adjustFieldValue(inputSoldProductName);
    let _unit_sales = adjustFieldValueNumber(inputUnitSales);
    let _sales_contribution_category = adjustFieldValue(inputSalesContributionCategory);
    let _sales_price = adjustFieldValueNumber(inputSalesPrice);
    let _discounted_price = adjustFieldValueNumber(inputDiscountedPrice);
    let _discount_rate = adjustFieldValueNumber(inputDiscountRate);
    let _sales_class = adjustFieldValue(inputSalesClass);
    let _expansion_date = inputExpansionDate ? inputExpansionDate.toISOString() : null;
    let _sales_date = inputSalesDate ? inputSalesDate.toISOString() : null;
    // let _expansion_quarter = adjustFieldValue(inputExpansionQuarter);
    // let _sales_quarter = adjustFieldValue(inputSalesQuarter);
    let _expansion_quarter = adjustFieldValueNumber(inputExpansionQuarter);
    let _sales_quarter = adjustFieldValueNumber(inputSalesQuarter);
    let _subscription_start_date = inputSubscriptionStartDate ? inputSubscriptionStartDate.toISOString() : null;
    let _subscription_canceled_at = inputSubscriptionCanceledAt ? inputSubscriptionCanceledAt.toISOString() : null;
    let _leasing_company = adjustFieldValue(inputLeasingCompany);
    let _lease_division = adjustFieldValue(inputLeaseDivision);
    let _lease_expiration_date = inputLeaseExpirationDate ? inputLeaseExpirationDate.toISOString() : null;
    let _step_in_flag = inputStepInFlag;
    let _repeat_flag = inputRepeatFlag;
    let _order_certainty_start_of_month = adjustFieldValue(inputOrderCertaintyStartOfMonth);
    let _review_order_certainty = adjustFieldValue(inputReviewOrderCertainty);
    let _competitor_appearance_date = inputCompetitorAppearanceDate
      ? inputCompetitorAppearanceDate.toISOString()
      : null;
    let _competitor = adjustFieldValue(inputCompetitor);
    let _competitor_product = adjustFieldValue(inputCompetitorProduct);
    let _reason_class = adjustFieldValue(inputReasonClass);
    let _reason_detail = adjustFieldValue(inputReasonDetail);
    let _customer_budget = adjustFieldValueNumber(inputCustomerBudget);
    let _decision_maker_negotiation = adjustFieldValue(inputDecisionMakerNegotiation);
    let _expansion_year_month = adjustFieldValueNumber(inputExpansionYearMonth);
    let _sales_year_month = adjustFieldValueNumber(inputSalesYearMonth);
    let _subscription_interval = adjustFieldValue(inputSubscriptionInterval);
    let _competition_state = adjustFieldValue(inputCompetitionState);
    let _property_year_month = adjustFieldValueNumber(inputPropertyYearMonth);
    let _property_department = adjustFieldValue(inputPropertyDepartment);
    let _property_business_office = adjustFieldValue(inputPropertyBusinessOffice);
    let _property_member_name = adjustFieldValue(inputPropertyMemberName);
    let _property_date = inputPropertyDate ? inputPropertyDate.toISOString() : null;

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
      // propertiesテーブル
      // "properties.created_by_company_id": _property_created_by_company_id,
      "properties.created_by_company_id": userProfileState.company_id,
      "properties.created_by_user_id": _property_created_by_user_id,
      "properties.created_by_department_of_user": _property_created_by_department_of_user,
      "properties.created_by_unit_of_user": _property_created_by_unit_of_user,
      current_status: _current_status,
      property_name: _property_name,
      property_summary: _property_summary,
      pending_flag: _pending_flag,
      rejected_flag: _rejected_flag,
      product_name: _product_name,
      product_sales: _product_sales,
      expected_order_date: _expected_order_date,
      expected_sales_price: _expected_sales_price,
      term_division: _term_division,
      sold_product_name: _sold_product_name,
      unit_sales: _unit_sales,
      sales_contribution_category: _sales_contribution_category,
      sales_price: _sales_price,
      discounted_price: _discounted_price,
      discount_rate: _discount_rate,
      sales_class: _sales_class,
      expansion_date: _expansion_date,
      sales_date: _sales_date,
      expansion_quarter: _expansion_quarter,
      sales_quarter: _sales_quarter,
      subscription_start_date: _subscription_start_date,
      subscription_canceled_at: _subscription_canceled_at,
      leasing_company: _leasing_company,
      lease_division: _lease_division,
      lease_expiration_date: _lease_expiration_date,
      step_in_flag: _step_in_flag,
      repeat_flag: _repeat_flag,
      order_certainty_start_of_month: _order_certainty_start_of_month,
      review_order_certainty: _review_order_certainty,
      competitor_appearance_date: _competitor_appearance_date,
      competitor: _competitor,
      competitor_product: _competitor_product,
      reason_class: _reason_class,
      reason_detail: _reason_detail,
      customer_budget: _customer_budget,
      decision_maker_negotiation: _decision_maker_negotiation,
      expansion_year_month: _expansion_year_month,
      sales_year_month: _sales_year_month,
      subscription_interval: _subscription_interval,
      competition_state: _competition_state,
      property_year_month: _property_year_month,
      property_department: _property_department,
      property_business_office: _property_business_office,
      property_member_name: _property_member_name,
      property_date: _property_date,
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
    // Propertysテーブル
    setInputPropertyCreatedByCompanyId("");
    setInputPropertyCreatedByUserId("");
    setInputPropertyCreatedByDepartmentOfUser("");
    setInputPropertyCreatedByUnitOfUser("");
    setInputCurrentStatus("");
    setInputPropertyName("");
    setInputPropertySummary("");
    setInputPendingFlag(null);
    setInputRejectedFlag(null);
    setInputProductName("");
    setInputProductSales(null);
    setInputExpectedOrderDate(null);
    setInputExpectedSalesPrice(null);
    setInputTermDivision("");
    setInputSoldProductName("");
    setInputUnitSales(null);
    setInputSalesContributionCategory("");
    setInputSalesPrice(null);
    setInputDiscountedPrice(null);
    setInputDiscountRate(null);
    setInputSalesClass("");
    setInputExpansionDate(null);
    setInputSalesDate(null);
    // setInputExpansionQuarter("");
    // setInputSalesQuarter("");
    setInputExpansionQuarter(null);
    setInputSalesQuarter(null);
    setInputSubscriptionStartDate(null);
    setInputSubscriptionCanceledAt(null);
    setInputLeasingCompany("");
    setInputLeaseDivision("");
    setInputLeaseExpirationDate(null);
    setInputStepInFlag(null);
    setInputRepeatFlag(null);
    setInputOrderCertaintyStartOfMonth("");
    setInputReviewOrderCertainty("");
    setInputCompetitorAppearanceDate(null);
    setInputCompetitor("");
    setInputCompetitorProduct("");
    setInputReasonClass("");
    setInputReasonDetail("");
    setInputCustomerBudget(null);
    setInputDecisionMakerNegotiation("");
    setInputExpansionYearMonth(null);
    setInputSalesYearMonth(null);
    setInputSubscriptionInterval("");
    setInputCompetitionState("");
    setInputPropertyYearMonth(null);
    setInputPropertyDepartment("");
    setInputPropertyBusinessOffice("");
    setInputPropertyMemberName("");
    setInputPropertyDate(null);

    // サーチモードオフ
    setSearchMode(false);
    setEditSearchMode(false);

    // Zustandに検索条件を格納
    setNewSearchProperty_Contact_CompanyParams(params);

    // 選択中の列データをリセット
    setSelectedRowDataProperty(null);

    console.log("✅ 条件 params", params);
    // const { data, error } = await supabase.rpc("search_companies", { params });
    // const { data, error } = await supabase.rpc("search_companies_and_contacts", { params });
    // const { data, error } = await supabase.rpc("search_activities_and_companies_and_contacts", { params });
    // const { data, error } = await supabase.rpc("search_properties_and_companies_and_contacts", { params });

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

  const handlePendingCheckChangeSelectTagValue = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;

    switch (value) {
      case "チェック有り":
        setInputPendingFlag(true);
        break;
      case "チェック無し":
        setInputPendingFlag(false);
        break;
      default:
        setInputPendingFlag(null);
    }
  };
  const handleRejectedCheckChangeSelectTagValue = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;

    switch (value) {
      case "チェック有り":
        setInputRejectedFlag(true);
        break;
      case "チェック無し":
        setInputRejectedFlag(false);
        break;
      default:
        setInputRejectedFlag(null);
    }
  };
  const handleStepInCheckChangeSelectTagValue = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;

    switch (value) {
      case "チェック有り":
        setInputStepInFlag(true);
        break;
      case "チェック無し":
        setInputStepInFlag(false);
        break;
      default:
        setInputStepInFlag(null);
    }
  };
  const handleRepeatCheckChangeSelectTagValue = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;

    switch (value) {
      case "チェック有り":
        setInputRepeatFlag(true);
        break;
      case "チェック無し":
        setInputRepeatFlag(false);
        break;
      default:
        setInputRepeatFlag(null);
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
              {/* 予定 サーチ */}
              {/* 現ｽﾃｰﾀｽ */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.section_title}`}>現ｽﾃｰﾀｽ</span>

                    <span className={`${styles.value} ${styles.value_highlight} ${styles.text_start} !pl-[0px]`}>
                      {selectedRowDataProperty?.current_status ? selectedRowDataProperty?.current_status : ""}
                    </span>
                  </div>
                  <div className={`${styles.section_underline}`}></div>
                </div>
              </div>

              {/* 案件名 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>●案件名</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value} ${styles.value_highlight} ${styles.text_start}`}
                        data-text={selectedRowDataProperty?.property_name ? selectedRowDataProperty?.property_name : ""}
                        onMouseEnter={(e) => handleOpenTooltip({ e, display: "top" })}
                        onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataProperty?.property_name ? selectedRowDataProperty?.property_name : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 案件概要 */}
              <div className={`${styles.row_area_lg_box} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full `}>
                    <span className={`${styles.title}`}>案件概要</span>
                    {!searchMode && (
                      <div
                        className={`${styles.textarea_box} ${styles.textarea_box_bg}`}
                        // className={`${styles.full_value} ${styles.textarea_box} ${styles.textarea_box_bg}`}
                        // className={`${styles.value} h-[85px] ${styles.textarea_box} ${styles.textarea_box_bg}`}
                        dangerouslySetInnerHTML={{
                          __html: selectedRowDataProperty?.property_summary
                            ? selectedRowDataProperty?.property_summary.replace(/\n/g, "<br>")
                            : "",
                        }}
                      ></div>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 商品・予定台数 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} text-[12px]`}>商品</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataProperty?.product_name ? selectedRowDataProperty?.product_name : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} text-[12px]`}>予定台数</span>
                    {!searchMode && (
                      <span
                        // data-text={`${
                        //   selectedRowDataProperty?.member_name
                        //     ? selectedRowDataProperty?.member_name
                        //     : ""
                        // }`}
                        className={`${styles.value}`}
                        // onMouseEnter={(e) => handleOpenTooltip(e)}
                        // onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataProperty?.product_sales ? selectedRowDataProperty?.product_sales : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 予定時期・予定売上 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>予定時期</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataProperty?.expected_order_date
                          ? format(new Date(selectedRowDataProperty.expected_order_date), "yyyy/MM/dd")
                          : ""}
                      </span>
                    )}
                    {/* {searchMode && <input type="text" className={`${styles.input_box}`} />} */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>予定売上</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataProperty?.expected_sales_price
                          ? selectedRowDataProperty?.expected_sales_price
                          : ""}
                      </span>
                    )}
                    {/* {searchMode && <input type="text" className={`${styles.input_box}`} />} */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 今・来期・ */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} text-[12px]`}>今・来期</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataProperty?.term_division ? selectedRowDataProperty?.term_division : ""}
                      </span>
                    )}
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

              {/* 売上商品・売上台数 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} text-[12px]`}>売上商品</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataProperty?.sold_product_name ? selectedRowDataProperty?.sold_product_name : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} text-[12px]`}>売上台数</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataProperty?.unit_sales ? selectedRowDataProperty?.unit_sales : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 売上貢献区分・売上価格 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <div className={`${styles.title} flex flex-col ${styles.double_text}`}>
                      <span>売上貢献</span>
                      <span>区分</span>
                    </div>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        data-text={
                          selectedRowDataProperty?.sales_contribution_category
                            ? selectedRowDataProperty?.sales_contribution_category
                            : ""
                        }
                        onMouseEnter={(e) => handleOpenTooltip({ e, display: "top" })}
                        onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataProperty?.sales_contribution_category
                          ? selectedRowDataProperty?.sales_contribution_category
                          : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} text-[12px]`}>売上価格</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataProperty?.sales_price ? selectedRowDataProperty?.sales_price : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 値引価格・値引率 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} text-[12px]`}>値引価格</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataProperty?.discounted_price ? selectedRowDataProperty?.discounted_price : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} text-[12px]`}>値引率</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataProperty?.discount_rate ? selectedRowDataProperty?.discount_rate : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 導入分類 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} text-[12px]`}>導入分類</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataProperty?.sales_class ? selectedRowDataProperty?.sales_class : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  {/* <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} text-[12px]`}>売上価格</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataProperty?.sales_price ? selectedRowDataProperty?.sales_price : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div> */}
                </div>
              </div>

              {/* サブスク分類・ */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    {/* <span className={`${styles.title} text-[12px]`}>サブスク分類</span> */}
                    <div className={`${styles.title} flex flex-col ${styles.double_text}`}>
                      <span>サブスク</span>
                      <span>分類</span>
                    </div>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataProperty?.subscription_interval
                          ? selectedRowDataProperty?.subscription_interval
                          : ""}
                      </span>
                    )}
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

              {/* サブスク開始日・サブスク解約日 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <div className={`${styles.title} flex flex-col ${styles.double_text}`}>
                      <span>サブスク</span>
                      <span>開始日</span>
                    </div>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataProperty?.subscription_start_date
                          ? format(new Date(selectedRowDataProperty.subscription_start_date), "yyyy/MM/dd")
                          : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <div className={`${styles.title} flex flex-col ${styles.double_text}`}>
                      <span>サブスク</span>
                      <span>解約日</span>
                    </div>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataProperty?.subscription_canceled_at
                          ? format(new Date(selectedRowDataProperty.subscription_canceled_at), "yyyy/MM/dd")
                          : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* リース分類・ */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} text-[12px]`}>リース分類</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataProperty?.lease_division ? selectedRowDataProperty?.lease_division : ""}
                      </span>
                    )}
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

              {/* リース会社・リース完了予定日 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} text-[12px]`}>リース会社</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataProperty?.leasing_company
                          ? format(new Date(selectedRowDataProperty.leasing_company), "yyyy/MM/dd")
                          : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <div className={`${styles.title} flex flex-col ${styles.double_text}`}>
                      <span>リース完了</span>
                      <span>予定日</span>
                    </div>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataProperty?.lease_expiration_date
                          ? format(new Date(selectedRowDataProperty.lease_expiration_date), "yyyy/MM/dd")
                          : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 展開日付・売上日付 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} text-[12px]`}>展開日付</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataProperty?.expansion_date
                          ? format(new Date(selectedRowDataProperty.expansion_date), "yyyy/MM/dd")
                          : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} text-[12px]`}>売上日付</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataProperty?.sales_date
                          ? format(new Date(selectedRowDataProperty.sales_date), "yyyy/MM/dd")
                          : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* 展開年月度・売上年月度 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} text-[12px]`}>展開年月度</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataProperty?.expansion_year_month
                          ? selectedRowDataProperty?.expansion_year_month
                          : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} text-[12px]`}>売上年月度</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataProperty?.sales_year_month ? selectedRowDataProperty?.sales_year_month : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* 展開四半期・売上四半期 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} text-[12px]`}>展開四半期</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {/* {selectedRowDataProperty?.expansion_quarter ? selectedRowDataProperty?.expansion_quarter : ""} */}
                        {selectedRowDataProperty?.expansion_quarter
                          ? `${selectedRowDataProperty.expansion_quarter.toString()}Q`
                          : null}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} text-[12px]`}>売上四半期</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {/* {selectedRowDataProperty?.sales_quarter ? selectedRowDataProperty?.sales_quarter : ""} */}
                        {selectedRowDataProperty?.sales_quarter ? `${selectedRowDataProperty.sales_quarter}Q` : null}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 案件発生日付・案件年月度 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    {/* <span className={`${styles.title} text-[12px]`}>案件発生日付</span> */}
                    <div className={`${styles.title} flex flex-col ${styles.double_text}`}>
                      <span>案件</span>
                      <span>発生日付</span>
                    </div>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataProperty?.property_date
                          ? format(new Date(selectedRowDataProperty.property_date), "yyyy/MM/dd")
                          : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} text-[12px]`}>案件年月度</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataProperty?.property_year_month
                          ? selectedRowDataProperty?.property_year_month
                          : ""}
                      </span>
                    )}
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
                {/* 月初確度・中間見直確度 */}
                <div className={`${styles.row_area} flex max-h-[26px] w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.section_title}`}>月初確度</span>

                      <span
                        className={`${styles.value} ${styles.value_highlight}`}
                        data-text={
                          selectedRowDataProperty?.order_certainty_start_of_month
                            ? selectedRowDataProperty?.order_certainty_start_of_month
                            : ""
                        }
                        onMouseEnter={(e) => handleOpenTooltip({ e, display: "top" })}
                        onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataProperty?.order_certainty_start_of_month
                          ? selectedRowDataProperty?.order_certainty_start_of_month
                          : ""}
                      </span>
                    </div>
                    {/* <div className={`${styles.section_underline}`}></div> */}
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <div className={`${styles.section_title} flex flex-col !text-[13px]`}>
                        <span>中間見直</span>
                        <span>確度</span>
                      </div>

                      <span
                        className={`${styles.value} ${styles.value_highlight}`}
                        data-text={
                          selectedRowDataProperty?.review_order_certainty
                            ? selectedRowDataProperty?.review_order_certainty
                            : ""
                        }
                        onMouseEnter={(e) => handleOpenTooltip({ e, display: "top" })}
                        onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataProperty?.review_order_certainty
                          ? selectedRowDataProperty?.review_order_certainty
                          : ""}
                      </span>
                    </div>
                    {/* <div className={`${styles.section_underline}`}></div> */}
                  </div>
                </div>
                <div className={`${styles.section_underline2} `}></div>

                {/* リピート・案件介入(責任者) */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      {/* <div className={`${styles.title} !mr-[15px] flex flex-col`}>
                        <span className={``}>リピート</span>
                      </div> */}
                      <span className={`${styles.check_title}`}>リピート</span>
                      <div className={`${styles.grid_select_cell_header} `}>
                        <input
                          type="checkbox"
                          checked={!!selectedRowDataProperty?.repeat_flag}
                          onChange={() => {
                            setLoadingGlobalState(false);
                            setIsOpenUpdatePropertyModal(true);
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
                    <div className={`${styles.title_box} transition-base03 flex h-full items-center `}>
                      {/* <div className={`${styles.title} flex flex-col ${styles.double_text}`}> */}
                      <div className={`${styles.check_title} flex flex-col ${styles.double_text}`}>
                        <span>案件介入</span>
                        <span>(責任者)</span>
                      </div>

                      <div className={`${styles.grid_select_cell_header} `}>
                        <input
                          type="checkbox"
                          checked={!!selectedRowDataProperty?.step_in_flag}
                          onChange={() => {
                            setLoadingGlobalState(false);
                            setIsOpenUpdatePropertyModal(true);
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
                {/* ペンディング・案件没 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      {/* <div className={`${styles.title} !mr-[15px] flex flex-col`}>
                        <span className={``}>ペンディング</span>
                      </div> */}
                      <span className={`${styles.check_title}`}>ペンディング</span>
                      <div className={`${styles.grid_select_cell_header} `}>
                        <input
                          type="checkbox"
                          checked={!!selectedRowDataProperty?.pending_flag}
                          onChange={() => {
                            setLoadingGlobalState(false);
                            setIsOpenUpdatePropertyModal(true);
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
                    <div className={`${styles.title_box} transition-base03 flex h-full items-center `}>
                      <span className={`${styles.check_title}`}>案件没</span>

                      <div className={`${styles.grid_select_cell_header} `}>
                        <input
                          type="checkbox"
                          checked={!!selectedRowDataProperty?.rejected_flag}
                          onChange={() => {
                            setLoadingGlobalState(false);
                            setIsOpenUpdatePropertyModal(true);
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

                {/* 競合発生日・競合状況 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>競合発生日</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataProperty?.competitor_appearance_date
                            ? format(new Date(selectedRowDataProperty.competitor_appearance_date), "yyyy/MM/dd")
                            : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>競合状況</span>
                      {!searchMode && (
                        <span
                          // data-text={`${
                          //   selectedRowDataActivity?.senior_managing_director
                          //     ? selectedRowDataActivity?.senior_managing_director
                          //     : ""
                          // }`}
                          className={`${styles.value}`}
                          // onMouseEnter={(e) => handleOpenTooltip(e)}
                          // onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataProperty?.competition_state
                            ? selectedRowDataProperty?.competition_state
                            : null}
                        </span>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 競合会社 */}
                <div className={`${styles.row_area} flex h-[70px] w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full `}>
                      <span className={`${styles.title}`}>競合会社</span>
                      {!searchMode && (
                        <div
                          // data-text={`${selectedRowDataProperty?.ban_reason ? selectedRowDataProperty?.ban_reason : ""}`}
                          className={`${styles.value} h-[65px]`}
                          // onMouseEnter={(e) => handleOpenTooltip(e)}
                          // onMouseLeave={handleCloseTooltip}
                          dangerouslySetInnerHTML={{
                            __html: selectedRowDataProperty?.competitor
                              ? selectedRowDataProperty?.competitor.replace(/\n/g, "<br>")
                              : "",
                          }}
                        ></div>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 競合商品 */}
                <div className={`${styles.row_area} flex h-[70px] w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full `}>
                      <span className={`${styles.title}`}>競合商品</span>
                      {!searchMode && (
                        <div
                          // data-text={`${selectedRowDataProperty?.ban_reason ? selectedRowDataProperty?.ban_reason : ""}`}
                          className={`${styles.value} h-[65px]`}
                          // onMouseEnter={(e) => handleOpenTooltip(e)}
                          // onMouseLeave={handleCloseTooltip}
                          dangerouslySetInnerHTML={{
                            __html: selectedRowDataProperty?.competitor_product
                              ? selectedRowDataProperty?.competitor_product.replace(/\n/g, "<br>")
                              : "",
                          }}
                        ></div>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 案件発生動機・動機詳細 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <div className={`${styles.title} flex flex-col ${styles.double_text}`}>
                        <span>案件発生</span>
                        <span>動機</span>
                      </div>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          data-text={selectedRowDataProperty?.reason_class ? selectedRowDataProperty?.reason_class : ""}
                          onMouseEnter={(e) => handleOpenTooltip({ e, display: "top" })}
                          onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataProperty?.reason_class ? selectedRowDataProperty?.reason_class : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>動機詳細</span>
                      {!searchMode && (
                        <span
                          // data-text={`${
                          //   selectedRowDataProperty?.senior_managing_director
                          //     ? selectedRowDataProperty?.senior_managing_director
                          //     : ""
                          // }`}
                          className={`${styles.value}`}
                          // onMouseEnter={(e) => handleOpenTooltip(e)}
                          // onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataProperty?.reason_detail ? selectedRowDataProperty?.reason_detail : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 客先予算・決裁者商談有無 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>客先予算</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataProperty?.customer_budget ? selectedRowDataProperty?.customer_budget : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <div className={`${styles.title} flex flex-col ${styles.double_text}`}>
                        <span>決裁者</span>
                        <span>商談有無</span>
                      </div>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          data-text={
                            selectedRowDataProperty?.decision_maker_negotiation
                              ? selectedRowDataProperty?.decision_maker_negotiation
                              : ""
                          }
                          onMouseEnter={(e) => handleOpenTooltip({ e, display: "top" })}
                          onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataProperty?.decision_maker_negotiation
                            ? selectedRowDataProperty?.decision_maker_negotiation
                            : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
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
                          {selectedRowDataProperty?.property_department
                            ? selectedRowDataProperty?.property_department
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
                            selectedRowDataProperty?.senior_managing_director
                              ? selectedRowDataProperty?.senior_managing_director
                              : ""
                          }`}
                          className={`${styles.value}`}
                          onMouseEnter={(e) => handleOpenTooltip(e)}
                          onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataProperty?.senior_managing_director
                            ? selectedRowDataProperty?.senior_managing_director
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
                          {selectedRowDataProperty?.property_business_office
                            ? selectedRowDataProperty?.property_business_office
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
                          //   selectedRowDataProperty?.member_name
                          //     ? selectedRowDataProperty?.member_name
                          //     : ""
                          // }`}
                          className={`${styles.value}`}
                          // onMouseEnter={(e) => handleOpenTooltip(e)}
                          // onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataProperty?.property_member_name
                            ? selectedRowDataProperty?.property_member_name
                            : ""}
                        </span>
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
                    <span className={`${styles.section_title} !text-[17px]`}>会社情報</span>

                    {/* <span className={`${styles.value} ${styles.value_highlight}`}>
                        {selectedRowDataProperty?.company_name ? selectedRowDataProperty?.company_name : ""}
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
                        {selectedRowDataProperty?.company_name ? selectedRowDataProperty?.company_name : ""}
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
                        {selectedRowDataProperty?.department_name ? selectedRowDataProperty?.department_name : ""}
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
                        {selectedRowDataProperty?.contact_name ? selectedRowDataProperty?.contact_name : ""}
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
                        // data-text={`${
                        //   selectedRowDataProperty?.direct_line ? selectedRowDataProperty?.direct_line : ""
                        // }`}
                        // onMouseEnter={(e) => {
                        //   if (!isOpenSidebar) return;
                        //   handleOpenTooltip(e);
                        // }}
                        // onMouseLeave={() => {
                        //   if (!isOpenSidebar) return;
                        //   handleCloseTooltip();
                        // }}
                        data-text={selectedRowDataProperty?.direct_line ? selectedRowDataProperty?.direct_line : ""}
                        onMouseEnter={(e) => handleOpenTooltip({ e, display: "top" })}
                        onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataProperty?.direct_line ? selectedRowDataProperty?.direct_line : ""}
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
                      <span
                        className={`${styles.value}`}
                        data-text={selectedRowDataProperty?.extension ? selectedRowDataProperty?.extension : ""}
                        onMouseEnter={(e) => handleOpenTooltip({ e, display: "top" })}
                        onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataProperty?.extension ? selectedRowDataProperty?.extension : ""}
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
                        // data-text={`${
                        //   selectedRowDataProperty?.main_phone_number ? selectedRowDataProperty?.main_phone_number : ""
                        // }`}
                        // onMouseEnter={(e) => {
                        //   if (!isOpenSidebar) return;
                        //   handleOpenTooltip(e);
                        // }}
                        // onMouseLeave={() => {
                        //   if (!isOpenSidebar) return;
                        //   handleCloseTooltip();
                        // }}
                        data-text={
                          selectedRowDataProperty?.main_phone_number ? selectedRowDataProperty?.main_phone_number : ""
                        }
                        onMouseEnter={(e) => handleOpenTooltip({ e, display: "top" })}
                        onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataProperty?.main_phone_number ? selectedRowDataProperty?.main_phone_number : ""}
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
                      <span
                        className={`${styles.value}`}
                        data-text={selectedRowDataProperty?.direct_fax ? selectedRowDataProperty?.direct_fax : ""}
                        onMouseEnter={(e) => handleOpenTooltip({ e, display: "top" })}
                        onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataProperty?.direct_fax ? selectedRowDataProperty?.direct_fax : ""}
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
                        // data-text={`${selectedRowDataProperty?.main_fax ? selectedRowDataProperty?.main_fax : ""}`}
                        // onMouseEnter={(e) => {
                        //   if (!isOpenSidebar) return;
                        //   handleOpenTooltip(e);
                        // }}
                        // onMouseLeave={() => {
                        //   if (!isOpenSidebar) return;
                        //   handleCloseTooltip();
                        // }}
                        data-text={selectedRowDataProperty?.main_fax ? selectedRowDataProperty?.main_fax : ""}
                        onMouseEnter={(e) => handleOpenTooltip({ e, display: "top" })}
                        onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataProperty?.main_fax ? selectedRowDataProperty?.main_fax : ""}
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
                      <span
                        className={`${styles.value}`}
                        data-text={
                          selectedRowDataProperty?.company_cell_phone ? selectedRowDataProperty?.company_cell_phone : ""
                        }
                        onMouseEnter={(e) => handleOpenTooltip({ e, display: "top" })}
                        onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataProperty?.company_cell_phone ? selectedRowDataProperty?.company_cell_phone : ""}
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
                      <span
                        className={`${styles.value}`}
                        data-text={
                          selectedRowDataProperty?.personal_cell_phone
                            ? selectedRowDataProperty?.personal_cell_phone
                            : ""
                        }
                        onMouseEnter={(e) => handleOpenTooltip({ e, display: "top" })}
                        onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataProperty?.personal_cell_phone
                          ? selectedRowDataProperty?.personal_cell_phone
                          : ""}
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
                        {selectedRowDataProperty?.contact_email ? selectedRowDataProperty?.contact_email : ""}
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
                        {selectedRowDataProperty?.zipcode ? selectedRowDataProperty?.zipcode : ""}
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

              {/* 住所 */}
              <div className={`${styles.row_area_lg_box} flex h-[50px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px] ">
                  <div className={`${styles.title_box} flex h-full`}>
                    <span className={`${styles.title}`}>○住所</span>
                    {!searchMode && (
                      <span className={`${styles.full_value} h-[45px] !overflow-visible !whitespace-normal`}>
                        {selectedRowDataProperty?.address ? selectedRowDataProperty?.address : ""}
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
                      <span
                        className={`${styles.value}`}
                        data-text={selectedRowDataProperty?.position_name ? selectedRowDataProperty?.position_name : ""}
                        onMouseEnter={(e) => handleOpenTooltip({ e, display: "top" })}
                        onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataProperty?.position_name ? selectedRowDataProperty?.position_name : ""}
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
                        {selectedRowDataProperty?.position_class ? selectedRowDataProperty?.position_class : ""}
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
                        className={`ml-auto h-full w-full cursor-pointer ${styles.select_box}`}
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
                        {selectedRowDataProperty?.occupation ? selectedRowDataProperty?.occupation : ""}
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
                    <div className={`${styles.title} !mr-[15px] flex flex-col ${styles.double_text}`}>
                      <span className={``}>決裁金額</span>
                      <span className={``}>(万円)</span>
                    </div>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataProperty?.approval_amount ? selectedRowDataProperty?.approval_amount : ""}
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
                        {selectedRowDataProperty?.number_of_employees_class
                          ? selectedRowDataProperty?.number_of_employees_class
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
                        {selectedRowDataProperty?.fiscal_end_month ? selectedRowDataProperty?.fiscal_end_month : ""}
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
                        {selectedRowDataProperty?.budget_request_month1
                          ? selectedRowDataProperty?.budget_request_month1
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
                        {selectedRowDataProperty?.budget_request_month2
                          ? selectedRowDataProperty?.budget_request_month2
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
                        {selectedRowDataProperty?.capital
                          ? convertToJapaneseCurrencyFormat(selectedRowDataProperty.capital)
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
                      <span
                        data-text={`${
                          selectedRowDataProperty?.business_content ? selectedRowDataProperty?.business_content : ""
                        }`}
                        // onMouseEnter={(e) => handleOpenTooltip(e)}
                        onMouseEnter={(e) => handleOpenTooltip({ e })}
                        onMouseLeave={handleCloseTooltip}
                        // className={`${styles.textarea_box} `}
                        className={`${styles.textarea_value} `}
                        dangerouslySetInnerHTML={{
                          __html: selectedRowDataProperty?.business_content
                            ? selectedRowDataProperty?.business_content.replace(/\n/g, "<br>")
                            : "",
                        }}
                      ></span>
                    )}
                    {searchMode && (
                      <textarea
                        name="address"
                        id="address"
                        cols={30}
                        rows={10}
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
                        className={`${styles.value}`}
                        data-text={selectedRowDataProperty?.clients ? selectedRowDataProperty?.clients : ""}
                        onMouseEnter={(e) => handleOpenTooltip({ e, display: "top" })}
                        onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataProperty?.clients ? selectedRowDataProperty?.clients : ""}
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
                        className={`${styles.value}`}
                        data-text={`${selectedRowDataProperty?.supplier ? selectedRowDataProperty?.supplier : ""}`}
                        onMouseEnter={(e) => handleOpenTooltip({ e, display: "top" })}
                        onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataProperty?.supplier ? selectedRowDataProperty?.supplier : ""}
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
                          className={`${styles.textarea_value}`}
                          data-text={`${selectedRowDataProperty?.facility ? selectedRowDataProperty?.facility : ""}`}
                          onMouseEnter={(e) => handleOpenTooltip({ e, display: "top" })}
                          onMouseLeave={handleCloseTooltip}
                          dangerouslySetInnerHTML={{
                            __html: selectedRowDataProperty?.facility
                              ? selectedRowDataProperty?.facility.replace(/\n/g, "<br>")
                              : "",
                          }}
                        >
                          {/* {selectedRowDataProperty?.facility ? selectedRowDataProperty?.facility : ""} */}
                        </span>
                      </>
                    )}
                    {searchMode && (
                      <textarea
                        name="address"
                        id="address"
                        cols={30}
                        rows={10}
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
                        className={`${styles.value}`}
                        data-text={`${
                          selectedRowDataProperty?.business_sites ? selectedRowDataProperty?.business_sites : ""
                        }`}
                        onMouseEnter={(e) => handleOpenTooltip({ e, display: "top" })}
                        onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataProperty?.business_sites ? selectedRowDataProperty?.business_sites : ""}
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
                        className={`${styles.value}`}
                        data-text={`${
                          selectedRowDataProperty?.overseas_bases ? selectedRowDataProperty?.overseas_bases : ""
                        }`}
                        onMouseEnter={(e) => handleOpenTooltip({ e, display: "top" })}
                        onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataProperty?.overseas_bases ? selectedRowDataProperty?.overseas_bases : ""}
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
                          selectedRowDataProperty?.group_company ? selectedRowDataProperty?.group_company : ""
                        }`}
                        onMouseEnter={(e) => handleOpenTooltip({ e, display: "top" })}
                        onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataProperty?.group_company ? selectedRowDataProperty?.group_company : ""}
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
                        {selectedRowDataProperty?.website_url ? selectedRowDataProperty?.website_url : ""}
                      </span>
                    )} */}
                    {!searchMode && !!selectedRowDataProperty?.website_url ? (
                      <a
                        href={selectedRowDataProperty.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${styles.value} ${styles.anchor}`}
                      >
                        {selectedRowDataProperty.website_url}
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
                          if (!selectedRowDataProperty?.company_email) return;
                          try {
                            await navigator.clipboard.writeText(selectedRowDataProperty.company_email);
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
                        {selectedRowDataProperty?.company_email ? selectedRowDataProperty?.company_email : ""}
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
                        {selectedRowDataProperty?.industry_type ? selectedRowDataProperty?.industry_type : ""}
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
                    <div className={`${styles.title} flex flex-col ${styles.double_text}`}>
                      <span className={``}>製品分類</span>
                      <span className={``}>(大分類)</span>
                    </div>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        data-text={`${
                          selectedRowDataProperty?.product_category_large
                            ? selectedRowDataProperty?.product_category_large
                            : ""
                        }`}
                        onMouseEnter={(e) => handleOpenTooltip({ e, display: "top" })}
                        onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataProperty?.product_category_large
                          ? selectedRowDataProperty?.product_category_large
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
                    <div className={`${styles.title} flex flex-col ${styles.double_text}`}>
                      <span className={``}>製品分類</span>
                      <span className={``}>(中分類)</span>
                    </div>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        data-text={`${
                          selectedRowDataProperty?.product_category_medium
                            ? selectedRowDataProperty?.product_category_medium
                            : ""
                        }`}
                        onMouseEnter={(e) => handleOpenTooltip({ e, display: "top" })}
                        onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataProperty?.product_category_medium
                          ? selectedRowDataProperty?.product_category_medium
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
                        selectedRowDataProperty?.product_category_small
                          ? selectedRowDataProperty?.product_category_small
                          : ""
                      }`}
                      onMouseEnter={(e) => handleOpenTooltip(e)}
                      onMouseLeave={handleCloseTooltip}
                    >
                      {selectedRowDataProperty?.product_category_small
                        ? selectedRowDataProperty?.product_category_small
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
                      <span
                        className={`${styles.value}`}
                        data-text={
                          selectedRowDataProperty?.corporate_number ? selectedRowDataProperty?.corporate_number : ""
                        }
                        onMouseEnter={(e) => handleOpenTooltip({ e, display: "top" })}
                        onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataProperty?.corporate_number ? selectedRowDataProperty?.corporate_number : ""}
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
                        {selectedRowDataProperty?.company_id ? selectedRowDataProperty?.company_id : ""}
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
              {/* 現ｽﾃｰﾀｽ サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box}  flex h-full items-center `}>
                    <span className={`${styles.section_title_search_mode}`}>現ｽﾃｰﾀｽ</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      value={inputCurrentStatus}
                      onChange={(e) => {
                        setInputCurrentStatus(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      <option value="展開">展開 (案件発生)</option>
                      <option value="申請">申請 (予算申請案件)</option>
                      <option value="受注">受注</option>
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 案件名 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>●案件名</span>
                    <input
                      type="text"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={inputPropertyName}
                      onChange={(e) => setInputPropertyName(e.target.value)}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 案件概要 サーチ */}
              <div className={`${styles.row_area_lg_box} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full `}>
                    <span className={`${styles.title_search_mode} `}>案件概要</span>
                    {searchMode && (
                      <textarea
                        cols={30}
                        // rows={10}
                        className={`${styles.textarea_box} ${styles.textarea_box_search_mode}`}
                        value={inputPropertySummary}
                        onChange={(e) => setInputPropertySummary(e.target.value)}
                      ></textarea>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 商品・予定台数 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode} text-[12px]`}>商品</span>
                    <input
                      type="text"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={inputProductName}
                      onChange={(e) => setInputProductName(e.target.value)}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title_search_mode} text-[12px]`}>予定台数</span>
                    <input
                      type="number"
                      min="0"
                      className={`${styles.input_box}`}
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
                    />
                    {/* バツボタン */}
                    {inputProductSales !== null && inputProductSales !== 0 && (
                      <div className={`${styles.close_btn_number}`} onClick={() => setInputProductSales(null)}>
                        <MdClose className="text-[20px] " />
                      </div>
                    )}
                    {/* {inputProductSales && (
                      <div className={`${styles.close_btn_number}`} onClick={() => setInputProductSales(null)}>
                        <MdClose className="text-[20px] " />
                      </div>
                    )} */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 獲得予定時期・予定売上価格 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>獲得予定時期</span>
                    <DatePickerCustomInput
                      startDate={inputExpectedOrderDate}
                      setStartDate={setInputExpectedOrderDate}
                      required={false}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title_search_mode}`}>予定売上価格</span>
                    <input
                      type="number"
                      min="0"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={inputExpectedSalesPrice === null ? "" : inputExpectedSalesPrice}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setInputExpectedSalesPrice(null);
                        } else {
                          const numValue = Number(val);

                          // 入力値がマイナスかチェック
                          if (numValue < 0) {
                            setInputExpectedSalesPrice(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                          } else {
                            setInputExpectedSalesPrice(numValue);
                          }
                        }
                      }}
                    />
                    {/* バツボタン */}
                    {inputExpectedSalesPrice !== null && inputExpectedSalesPrice !== 0 && (
                      <div className={`${styles.close_btn_number}`} onClick={() => setInputExpectedSalesPrice(null)}>
                        <MdClose className="text-[20px] " />
                      </div>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/*  */}
              {/*  */}

              {/* 今・来期 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode} text-[12px]`}>今・来期</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      value={inputTermDivision}
                      onChange={(e) => {
                        setInputTermDivision(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      <option value="今期">今期</option>
                      <option value="来期">来期</option>
                    </select>
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

              {/* 売上商品・売上台数 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode} text-[12px]`}>売上商品</span>
                    <input
                      type="text"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={inputSoldProductName}
                      onChange={(e) => setInputSoldProductName(e.target.value)}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title_search_mode} text-[12px]`}>売上台数</span>
                    <input
                      type="number"
                      min="0"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={inputUnitSales === null ? "" : inputUnitSales}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
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
                    />
                    {/* バツボタン */}
                    {!!inputUnitSales && (
                      <div className={`${styles.close_btn_number}`} onClick={() => setInputUnitSales(null)}>
                        <MdClose className="text-[20px] " />
                      </div>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 売上貢献区分・売上価格 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <div className={`${styles.title_search_mode} flex flex-col ${styles.double_text}`}>
                      <span>売上貢献</span>
                      <span>区分</span>
                    </div>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      value={inputSalesContributionCategory}
                      onChange={(e) => {
                        setInputSalesContributionCategory(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      <option value="自己売上(自身で発生、自身で売上)">自己売上(自身で発生、自身で売上)</option>
                      <option value="引継ぎ売上(他担当が発生、引継ぎで売上)">
                        引継ぎ売上(他担当が発生、引継ぎで売上)
                      </option>
                      <option value="リピート売上">リピート売上</option>
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title_search_mode} text-[12px]`}>売上価格</span>
                    <input
                      type="number"
                      min="0"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={inputSalesPrice === null ? "" : inputSalesPrice}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setInputSalesPrice(null);
                        } else {
                          const numValue = Number(val);

                          // 入力値がマイナスかチェック
                          if (numValue < 0) {
                            setInputSalesPrice(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                          } else {
                            setInputSalesPrice(numValue);
                          }
                        }
                      }}
                    />
                    {/* バツボタン */}
                    {!!inputSalesPrice && (
                      <div className={`${styles.close_btn_number}`} onClick={() => setInputSalesPrice(null)}>
                        <MdClose className="text-[20px] " />
                      </div>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 値引価格・値引率 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode} text-[12px]`}>値引価格</span>
                    <input
                      type="number"
                      min="0"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={inputDiscountedPrice === null ? "" : inputDiscountedPrice}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setInputDiscountedPrice(null);
                        } else {
                          const numValue = Number(val);

                          // 入力値がマイナスかチェック
                          if (numValue < 0) {
                            setInputDiscountedPrice(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                          } else {
                            setInputDiscountedPrice(numValue);
                          }
                        }
                      }}
                    />
                    {/* バツボタン */}
                    {!!inputDiscountedPrice && (
                      <div className={`${styles.close_btn_number}`} onClick={() => setInputDiscountedPrice(null)}>
                        <MdClose className="text-[20px] " />
                      </div>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title_search_mode} text-[12px]`}>値引率</span>
                    <input
                      type="number"
                      min="0"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={inputDiscountRate === null ? "" : inputDiscountRate}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setInputDiscountRate(null);
                        } else {
                          const numValue = Number(val);

                          // 入力値がマイナスかチェック
                          if (numValue < 0) {
                            setInputDiscountRate(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                          } else {
                            setInputDiscountRate(numValue);
                          }
                        }
                      }}
                    />
                    {/* バツボタン */}
                    {!!inputDiscountRate && (
                      <div className={`${styles.close_btn_number}`} onClick={() => setInputDiscountRate(null)}>
                        <MdClose className="text-[20px] " />
                      </div>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 導入分類 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode} text-[12px]`}>導入分類</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      value={inputSalesClass}
                      onChange={(e) => {
                        setInputSalesClass(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      <option value="新規">新規</option>
                      <option value="増設">増設</option>
                      <option value="更新">更新</option>
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  {/* <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} text-[12px]`}>売上価格</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataProperty?.sales_price ? selectedRowDataProperty?.sales_price : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div> */}
                </div>
              </div>

              {/* サブスク分類 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    {/* <span className={`${styles.title_search_mode} text-[12px]`}>サブスク分類</span> */}
                    <div className={`${styles.title_search_mode} flex flex-col ${styles.double_text}`}>
                      <span>サブスク</span>
                      <span>分類</span>
                    </div>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      value={inputSubscriptionInterval}
                      onChange={(e) => {
                        setInputSubscriptionInterval(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      <option value="月額">月額</option>
                      <option value="年額">年額</option>
                    </select>
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

              {/* サブスク開始日・サブスク解約日 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <div className={`${styles.title_search_mode} flex flex-col ${styles.double_text}`}>
                      <span>サブスク</span>
                      <span>開始日</span>
                    </div>
                    <DatePickerCustomInput
                      startDate={inputSubscriptionStartDate}
                      setStartDate={setInputSubscriptionStartDate}
                      required={false}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    {/* <span className={`${styles.title_search_mode} text-[12px]`}>サブスク解約日</span> */}
                    <div className={`${styles.title_search_mode} flex flex-col ${styles.double_text}`}>
                      <span>サブスク</span>
                      <span>解約日</span>
                    </div>
                    <DatePickerCustomInput
                      startDate={inputSubscriptionCanceledAt}
                      setStartDate={setInputSubscriptionCanceledAt}
                      required={false}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* リース分類 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode} text-[12px]`}>リース分類</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      value={inputLeaseDivision}
                      onChange={(e) => {
                        setInputLeaseDivision(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      <option value="ファイナンスリース">ファイナンスリース</option>
                      <option value="オペレーティングリース">オペレーティングリース</option>
                    </select>
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

              {/* リース会社・リース完了予定日 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode} text-[12px]`}>リース会社</span>
                    <input
                      type="text"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={inputLeasingCompany}
                      onChange={(e) => setInputLeasingCompany(e.target.value)}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <div className={`${styles.title_search_mode} flex flex-col ${styles.double_text}`}>
                      <span>リース完了</span>
                      <span>予定日</span>
                    </div>
                    <DatePickerCustomInput
                      startDate={inputLeaseExpirationDate}
                      setStartDate={setInputLeaseExpirationDate}
                      required={false}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 展開日付・売上日付 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode} text-[12px]`}>展開日付</span>
                    <DatePickerCustomInput
                      startDate={inputExpansionDate}
                      setStartDate={setInputExpansionDate}
                      required={false}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title_search_mode} text-[12px]`}>売上日付</span>
                    <DatePickerCustomInput
                      startDate={inputSalesDate}
                      setStartDate={setInputSalesDate}
                      required={false}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* 展開年月度・売上年月度 */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode} text-[12px]`}>展開年月度</span>
                    <input
                      type="number"
                      min="0"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={inputExpansionYearMonth === null ? "" : inputExpansionYearMonth}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setInputExpansionYearMonth(null);
                        } else {
                          const numValue = Number(val);

                          // 入力値がマイナスかチェック
                          if (numValue < 0) {
                            setInputExpansionYearMonth(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                          } else {
                            setInputExpansionYearMonth(numValue);
                          }
                        }
                      }}
                    />
                    {/* バツボタン */}
                    {!!inputExpansionYearMonth && (
                      <div className={`${styles.close_btn_number}`} onClick={() => setInputExpansionYearMonth(null)}>
                        <MdClose className="text-[20px] " />
                      </div>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title_search_mode} text-[12px]`}>売上年月度</span>
                    <input
                      type="number"
                      min="0"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={inputSalesYearMonth === null ? "" : inputSalesYearMonth}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setInputSalesYearMonth(null);
                        } else {
                          const numValue = Number(val);

                          // 入力値がマイナスかチェック
                          if (numValue < 0) {
                            setInputSalesYearMonth(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                          } else {
                            setInputSalesYearMonth(numValue);
                          }
                        }
                      }}
                    />
                    {/* バツボタン */}
                    {!!inputSalesYearMonth && (
                      <div className={`${styles.close_btn_number}`} onClick={() => setInputSalesYearMonth(null)}>
                        <MdClose className="text-[20px] " />
                      </div>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* 展開四半期・売上四半期 */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode} text-[12px]`}>展開四半期</span>
                    {/* <input
                      type="text"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={inputExpansionQuarter}
                      onChange={(e) => setInputExpansionQuarter(e.target.value)}
                    /> */}
                    <select
                      className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                      value={inputExpansionQuarter === null ? "" : inputExpansionQuarter.toString()}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setInputExpansionQuarter(null);
                        } else {
                          setInputExpansionQuarter(Number(val));
                        }
                      }}
                    >
                      {/* <option value=""></option>
                      <option value="1 代表者">1 代表者</option>
                      <option value="2 取締役/役員">2 取締役/役員</option>
                      <option value="3 部長">3 部長</option>
                      <option value="4 課長">4 課長</option>
                      <option value="5 課長未満">5 課長未満</option>
                      <option value="6 所長・工場長">6 所長・工場長</option>
                      <option value="7 不明">7 不明</option> */}
                      <option value=""></option>
                      {optionsYearQuarter.map((option) => (
                        <option key={option} value={option.toString()}>
                          {option}Q
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title_search_mode} text-[12px]`}>売上四半期</span>
                    {/* <input
                      type="text"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={inputSalesQuarter}
                      onChange={(e) => setInputSalesQuarter(e.target.value)}
                    /> */}
                    <select
                      className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                      value={inputSalesQuarter === null ? "" : inputSalesQuarter.toString()}
                      // onChange={(e) => setInputSalesQuarter(Number(e.target.value))}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setInputSalesQuarter(null);
                        } else {
                          setInputSalesQuarter(Number(val));
                        }
                      }}
                    >
                      {/* <option value=""></option>
                      <option value="1 代表者">1 代表者</option>
                      <option value="2 取締役/役員">2 取締役/役員</option>
                      <option value="3 部長">3 部長</option>
                      <option value="4 課長">4 課長</option>
                      <option value="5 課長未満">5 課長未満</option>
                      <option value="6 所長・工場長">6 所長・工場長</option>
                      <option value="7 不明">7 不明</option> */}
                      <option value=""></option>
                      {optionsYearQuarter.map((option) => (
                        <option key={option} value={option.toString()}>
                          {option}Q
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 事業部名 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>事業部名</span>
                    <input
                      type="text"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={inputPropertyDepartment}
                      onChange={(e) => setInputPropertyDepartment(e.target.value)}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    {/* <span className={`${styles.title}`}>実施4</span>
                      {!searchMode && (
                        <span
                          data-text={`${
                            selectedRowDataProperty?.senior_managing_director
                              ? selectedRowDataProperty?.senior_managing_director
                              : ""
                          }`}
                          className={`${styles.value}`}
                          onMouseEnter={(e) => handleOpenTooltip(e)}
                          onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataProperty?.senior_managing_director
                            ? selectedRowDataProperty?.senior_managing_director
                            : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />} */}
                  </div>
                  {/* <div className={`${styles.underline}`}></div> */}
                </div>
              </div>

              {/* 事業所・自社担当 */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>事業所</span>
                    <input
                      type="text"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={inputPropertyBusinessOffice}
                      onChange={(e) => setInputPropertyBusinessOffice(e.target.value)}
                    />
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
                      value={inputPropertyMemberName}
                      onChange={(e) => setInputPropertyMemberName(e.target.value)}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* ============= 予定エリアここまで ============= */}

              {/* ============= 結果エリアここから ============= */}

              {/* 月初確度・中間見直確度 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} !mt-[20px] flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.section_title_search_mode}`}>月初確度</span>

                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      value={inputOrderCertaintyStartOfMonth}
                      onChange={(e) => {
                        setInputOrderCertaintyStartOfMonth(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      <option value="○ (80%以上の確率で受注)">○ (80%以上の確率で受注)</option>
                      <option value="△ (50%以上の確率で受注)">△ (50%以上の確率で受注)</option>
                      <option value="▲ (30%以上の確率で受注)">▲ (30%以上の確率で受注)</option>
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.section_title_search_mode}`}>中間見直確度</span>

                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      value={inputReviewOrderCertainty}
                      onChange={(e) => {
                        setInputReviewOrderCertainty(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      <option value="○ (80%以上の確率で受注)">○ (80%以上の確率で受注)</option>
                      <option value="△ (50%以上の確率で受注)">△ (50%以上の確率で受注)</option>
                      <option value="▲ (30%以上の確率で受注)">▲ (30%以上の確率で受注)</option>
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* リピート・案件介入(責任者) サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <div className={`${styles.title_search_mode}`}>
                      <span className={``}>リピート</span>
                    </div>
                    <select
                      className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                      // value={inputClaimFlag}
                      // onChange={(e) => setInputClaimFlag(e.target.value)}
                      value={
                        inputRepeatFlag === null
                          ? // ? "指定なし"
                            ""
                          : inputRepeatFlag
                          ? "チェック有り"
                          : "チェック無し"
                      }
                      onChange={handleRepeatCheckChangeSelectTagValue}
                    >
                      {/* <option value="指定なし">指定なし</option> */}
                      <option value=""></option>
                      <option value="チェック無し">チェック無し</option>
                      <option value="チェック有り">チェック有り</option>
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>

                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} transition-base03 flex h-full items-center `}>
                    <div className={`${styles.title_search_mode} flex flex-col ${styles.double_text}`}>
                      <span>案件介入</span>
                      <span>(責任者)</span>
                    </div>

                    <select
                      className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                      // value={inputClaimFlag}
                      // onChange={(e) => setInputClaimFlag(e.target.value)}
                      value={
                        inputStepInFlag === null
                          ? // ? "指定なし"
                            ""
                          : inputStepInFlag
                          ? "チェック有り"
                          : "チェック無し"
                      }
                      onChange={handleStepInCheckChangeSelectTagValue}
                    >
                      {/* <option value="指定なし">指定なし</option> */}
                      <option value=""></option>
                      <option value="チェック無し">チェック無し</option>
                      <option value="チェック有り">チェック有り</option>
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* ペンディング・案件没 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <div className={`${styles.title_search_mode}`}>
                      <span className={``}>ペンディング</span>
                    </div>
                    <select
                      className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                      // value={inputClaimFlag}
                      // onChange={(e) => setInputClaimFlag(e.target.value)}
                      value={
                        inputPendingFlag === null
                          ? // ? "指定なし"
                            ""
                          : inputPendingFlag
                          ? "チェック有り"
                          : "チェック無し"
                      }
                      onChange={handlePendingCheckChangeSelectTagValue}
                    >
                      {/* <option value="指定なし">指定なし</option> */}
                      <option value=""></option>
                      <option value="チェック無し">チェック無し</option>
                      <option value="チェック有り">チェック有り</option>
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>

                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} transition-base03 flex h-full items-center `}>
                    <span className={`${styles.check_title_search_mode}`}>案件没</span>

                    <select
                      className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                      // value={inputClaimFlag}
                      // onChange={(e) => setInputClaimFlag(e.target.value)}
                      value={
                        inputRejectedFlag === null
                          ? // ? "指定なし"
                            ""
                          : inputRejectedFlag
                          ? "チェック有り"
                          : "チェック無し"
                      }
                      onChange={handleRejectedCheckChangeSelectTagValue}
                    >
                      {/* <option value="指定なし">指定なし</option> */}
                      <option value=""></option>
                      <option value="チェック無し">チェック無し</option>
                      <option value="チェック有り">チェック有り</option>
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 競合発生日・競合状況 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>競合発生日</span>
                    <DatePickerCustomInput
                      startDate={inputCompetitorAppearanceDate}
                      setStartDate={setInputCompetitorAppearanceDate}
                      required={false}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title_search_mode}`}>競合状況</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      value={inputCompetitionState}
                      onChange={(e) => {
                        setInputCompetitionState(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      <option value="競合無し">競合無し</option>
                      <option value="競合有り ○優勢">競合有り ○優勢</option>
                      <option value="競合有り △">競合有り △</option>
                      <option value="競合有り ▲劣勢">競合有り ▲劣勢</option>
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 競合会社 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex h-[70px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full `}>
                    <span className={`${styles.title_search_mode}`}>競合会社</span>
                    <input
                      type="text"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={inputCompetitor}
                      onChange={(e) => setInputCompetitor(e.target.value)}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 競合商品 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex h-[70px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full `}>
                    <span className={`${styles.title_search_mode}`}>競合商品</span>
                    <input
                      type="text"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={inputCompetitorProduct}
                      onChange={(e) => setInputCompetitorProduct(e.target.value)}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 案件発生動機・動機詳細 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <div className={`${styles.title_search_mode} flex flex-col ${styles.double_text}`}>
                      <span>案件発生</span>
                      <span>動機</span>
                    </div>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      value={inputReasonClass}
                      onChange={(e) => {
                        // if (e.target.value === "") return alert("訪問目的を選択してください");
                        setInputReasonClass(e.target.value);
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
                      <option value="その他">その他</option>
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title_search_mode}`}>動機詳細</span>
                    <input
                      type="text"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={inputReasonDetail}
                      onChange={(e) => setInputReasonDetail(e.target.value)}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 客先予算・決裁者商談有無 */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>客先予算</span>
                    <input
                      type="number"
                      min="0"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={inputCustomerBudget === null ? "" : inputCustomerBudget}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setInputCustomerBudget(null);
                        } else {
                          const numValue = Number(val);

                          // 入力値がマイナスかチェック
                          if (numValue < 0) {
                            setInputCustomerBudget(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                          } else {
                            setInputCustomerBudget(numValue);
                          }
                        }
                      }}
                    />
                    {/* バツボタン */}
                    {!!inputCustomerBudget && (
                      <div className={`${styles.close_btn_number}`} onClick={() => setInputCustomerBudget(null)}>
                        <MdClose className="text-[20px] " />
                      </div>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <div className={`${styles.title_search_mode} ${styles.double_text} flex flex-col`}>
                      <span>決裁者</span>
                      <span>商談有無</span>
                    </div>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      value={inputDecisionMakerNegotiation}
                      onChange={(e) => {
                        // if (e.target.value === "") return alert("活動タイプを選択してください");
                        setInputDecisionMakerNegotiation(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      <option value="決裁者と会えず">決裁者と会えず</option>
                      <option value="決裁者と会うも、商談できず">決裁者と会うも、商談できず</option>
                      <option value="決裁者と商談済み">決裁者と商談済み</option>
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
                        {selectedRowDataProperty?.company_name ? selectedRowDataProperty?.company_name : ""}
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
                    {/* <span className={`${styles.title_search_mode}`}>資本金(万円)</span> */}
                    <div className={`${styles.title_search_mode} flex flex-col ${styles.double_text}`}>
                      <span className={``}>資本金</span>
                      <span className={``}>(万円)</span>
                    </div>
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
                    <div className={`${styles.title_search_mode} flex flex-col ${styles.double_text}`}>
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
                    <div className={`${styles.title_search_mode} flex flex-col ${styles.double_text}`}>
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
                        selectedRowDataProperty?.product_category_small
                          ? selectedRowDataProperty?.product_category_small
                          : ""
                      }`}
                      onMouseEnter={(e) => handleOpenTooltip(e)}
                      onMouseLeave={handleCloseTooltip}
                    >
                      {selectedRowDataProperty?.product_category_small
                        ? selectedRowDataProperty?.product_category_small
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
                        {selectedRowDataProperty?.company_id ? selectedRowDataProperty?.company_id : ""}
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

export const PropertyMainContainerOneThird = memo(PropertyMainContainerOneThirdMemo);

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
