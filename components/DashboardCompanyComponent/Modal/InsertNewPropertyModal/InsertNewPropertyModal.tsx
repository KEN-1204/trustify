import React, { useEffect, useRef, useState } from "react";
import styles from "./InsertNewPropertyModal.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import { toast } from "react-toastify";
import useThemeStore from "@/store/useThemeStore";
import { isNaN, set } from "lodash";
import { useMutateProperty } from "@/hooks/useMutateProperty";
import productCategoriesM from "@/utils/productCategoryM";
import { DatePickerCustomInput } from "@/utils/DatePicker/DatePickerCustomInput";
import { MdClose } from "react-icons/md";
import { useQueryProducts } from "@/hooks/useQueryProducts";
import { SpinnerComet } from "@/components/Parts/SpinnerComet/SpinnerComet";
import { BsChevronLeft } from "react-icons/bs";
import { ImInfo } from "react-icons/im";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import useStore from "@/store";
import { TooltipModal } from "@/components/Parts/Tooltip/TooltipModal";
import { calculateDateToYearMonth } from "@/utils/Helpers/calculateDateToYearMonth";
import { format } from "date-fns";
import { getFiscalQuarter } from "@/utils/Helpers/getFiscalQuarter";
import { getFiscalQuarterTest } from "@/utils/Helpers/getFiscalQuarterTest";

export const InsertNewPropertyModal = () => {
  const selectedRowDataContact = useDashboardStore((state) => state.selectedRowDataContact);
  const selectedRowDataActivity = useDashboardStore((state) => state.selectedRowDataActivity);
  const selectedRowDataMeeting = useDashboardStore((state) => state.selectedRowDataMeeting);
  const selectedRowDataProperty = useDashboardStore((state) => state.selectedRowDataProperty);
  // const setSelectedRowDataContact = useDashboardStore((state) => state.setSelectedRowDataContact);
  // const setSelectedRowDataActivity = useDashboardStore((state) => state.setSelectedRowDataActivity);
  // const setSelectedRowDataMeeting = useDashboardStore((state) => state.setSelectedRowDataMeeting);
  // const setSelectedRowDataProperty = useDashboardStore((state) => state.setSelectedRowDataProperty);
  const setIsOpenInsertNewPropertyModal = useDashboardStore((state) => state.setIsOpenInsertNewPropertyModal);
  // const [isLoading, setIsLoading] = useState(false);
  const loadingGlobalState = useDashboardStore((state) => state.loadingGlobalState);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  // const theme = useThemeStore((state) => state.theme);
  // 上画面の選択中の列データ会社
  // const selectedRowDataCompany = useDashboardStore((state) => state.selectedRowDataCompany);
  const userProfileState = useDashboardStore((state) => state.userProfileState);

  // 製品情報を取得
  // const {
  //   data: products,
  //   error,
  //   isError,
  //   isLoading,
  // } = useQueryProducts(userProfileState?.company_id, userProfileState?.id);

  const [currentStatus, setCurrentStatus] = useState(""); //現ステータス
  const [propertyName, setPropertyName] = useState(""); //案件名
  const [propertySummary, setPropertySummary] = useState(""); //案件概要
  const [pendingFlag, setPendingFlag] = useState(false); //ペンディングフラグ
  const [rejectedFlag, setRejectedFlag] = useState(false); //物件没フラグ
  const [productName, setProductName] = useState(""); //商品(予定)
  const [productSales, setProductSales] = useState<number | null>(null); //予定売上台数
  const [expectedOrderDate, setExpectedOrderDate] = useState<Date | null>(null); //予定売上台数
  const [expectedSalesPrice, setExpectedSalesPrice] = useState<number | null>(null); //予定売上価格
  const [termDivision, setTermDivision] = useState(""); //今期・来期
  const [soldProductName, setSoldProductName] = useState(""); //売上商品
  const [unitSales, setUnitSales] = useState<number | null>(null); //売上台数
  const [salesContributionCategory, setSalesContributionCategory] = useState(""); //売上貢献区分
  const [salesPrice, setSalesPrice] = useState<number | null>(null); //売上価格
  const [discountedPrice, setDiscountedPrice] = useState<number | null>(null); //値引き価格
  const [discountedRate, setDiscountedRate] = useState<number | null>(null); //値引率
  const [salesClass, setSalesClass] = useState(""); //導入分類
  const [subscriptionStartDate, setSubscriptionStartDate] = useState<Date | null>(null); //サブスク開始日
  const [subscriptionCanceledAt, setSubscriptionCanceledAt] = useState<Date | null>(null); //サブスク解約日
  const [leasingCompany, setLeasingCompany] = useState(""); //リース会社
  const [leaseDivision, setLeaseDivision] = useState(""); //リース分類
  const [leaseExpirationDate, setLeaseExpirationDate] = useState<Date | null>(null); //リース完了予定日
  const [stepInFlag, setStepInFlag] = useState(false); //案件介入(責任者)
  const [repeatFlag, setRepeatFlag] = useState(false); //リピートフラグ
  const [orderCertaintyStartOfMonth, setOrderCertaintyStartOfMonth] = useState(""); //月初確度
  const [reviewOrderCertainty, setReviewOrderCertainty] = useState(""); //中間見直確度
  const [competitorAppearanceDate, setCompetitorAppearanceDate] = useState<Date | null>(null); //競合発生日
  const [competitor, setCompetitor] = useState(""); //競合会社
  const [competitorProduct, setCompetitorProduct] = useState(""); //競合商品
  const [reasonClass, setReasonClass] = useState(""); //案件発生動機
  const [reasonDetail, setReasonDetail] = useState(""); //動機詳細
  const [customerBudget, setCustomerBudget] = useState<number | null>(null); //客先予算
  const [decisionMakerNegotiation, setDecisionMakerNegotiation] = useState(""); //決裁者商談有無
  // ============================== 日付。年月、四半期関連
  const initialDate = new Date();
  initialDate.setHours(0, 0, 0, 0);
  const year = initialDate.getFullYear(); // 例: 2023
  const month = initialDate.getMonth() + 1; // getMonth()は0から11で返されるため、+1して1から12に調整
  const PropertyYearMonthInitialValue = `${year}${month < 10 ? "0" + month : month}`; // 月が1桁の場合は先頭に0を追加

  const [expansionDate, setExpansionDate] = useState<Date | null>(null); //展開日付
  const [expansionQuarterSelectedYear, setExpansionQuarterSelectedYear] = useState<number | null>(null); //展開四半期
  const [expansionQuarterSelectedQuarter, setExpansionQuarterSelectedQuarter] = useState<number | null>(null); //展開四半期
  const [expansionQuarter, setExpansionQuarter] = useState(""); //展開四半期
  const [expansionYearMonth, setExpansionYearMonth] = useState<number | null>(null); //展開年月度
  const [salesDate, setSalesDate] = useState<Date | null>(null); //売上日付
  const [salesQuarter, setSalesQuarter] = useState(""); //売上四半期
  const [salesYearMonth, setSalesYearMonth] = useState<number | null>(null); //売上年月度
  const [propertyDate, setPropertyDate] = useState<Date | null>(initialDate); //案件発生日付
  const [PropertyYearMonth, setPropertyYearMonth] = useState<number | null>(Number(PropertyYearMonthInitialValue)); //案件年月度
  // ============================== 日付。年月、四半期関連 ここまで
  const [subscriptionInterval, setSubscriptionInterval] = useState(""); //サブスク分類
  const [competitionState, setCompetitionState] = useState(""); //競合状況
  const [PropertyDepartment, setPropertyDepartment] = useState(
    userProfileState?.department ? userProfileState?.department : ""
  ); //事業部名
  const [PropertyBusinessOffice, setPropertyBusinessOffice] = useState(
    userProfileState?.office ? userProfileState.office : ""
  ); //所属事業所
  const [PropertyMemberName, setPropertyMemberName] = useState(
    userProfileState?.profile_name ? userProfileState.profile_name : ""
  ); //自社担当

  // ユーザーの決算月と締め日を取得
  const fiscalEndMonthObjRef = useRef<Date | null>(null);
  const closingDayRef = useRef<number | null>(null);

  const { createPropertyMutation } = useMutateProperty();

  // 🌟ユーザーの決算月の締め日を初回マウント時に取得
  useEffect(() => {
    // ユーザーの決算月から締め日を取得、決算つきが未設定の場合は現在の年と3月31日を設定
    const fiscalEndMonth = userProfileState?.customer_fiscal_end_month
      ? new Date(userProfileState.customer_fiscal_end_month)
      : new Date(new Date().getFullYear(), 2, 31);
    const closingDay = fiscalEndMonth.getDate(); //ユーザーの締め日
    fiscalEndMonthObjRef.current = fiscalEndMonth; //決算月Dateオブジェクトをrefに格納
    closingDayRef.current = closingDay; //refに格納
    console.log("ユーザー決算月", userProfileState?.customer_fiscal_end_month);
    console.log("ユーザー決算月", format(fiscalEndMonth, "yyyy年MM月dd日 HH:mm:ss"));
    console.log("ユーザー決算月", fiscalEndMonthObjRef.current);
    console.log("ユーザー決算月", format(fiscalEndMonthObjRef.current, "yyyy年MM月dd日 HH:mm:ss"));
  }, []);

  // 🌟展開日付から展開年月度、展開四半期を自動で計算、入力するuseEffect
  useEffect(() => {
    // initialDate.setHours(0, 0, 0, 0);
    if (!expansionDate || !closingDayRef.current || !fiscalEndMonthObjRef.current) {
      setExpansionYearMonth(null);
      return;
    }
    // 面談日付からユーザーの財務サイクルに応じた面談年月度を取得
    const fiscalYearMonth = calculateDateToYearMonth(expansionDate, closingDayRef.current);
    setExpansionYearMonth(fiscalYearMonth);

    // 四半期を自動で入力
    // 四半期の年部分をセット
    setExpansionQuarterSelectedYear(expansionDate.getFullYear() ?? null);
    // 四半期のQ部分をセット
    // const _expansionFiscalQuarter = getFiscalQuarter(fiscalEndMonthObjRef.current, expansionDate);
    const _expansionFiscalQuarter = getFiscalQuarterTest(fiscalEndMonthObjRef.current, expansionDate);
    console.log("四半期", _expansionFiscalQuarter);
    setExpansionQuarterSelectedQuarter(_expansionFiscalQuarter);
  }, [expansionDate]);

  // 🌟売上日付から売上年月度、売上四半期を自動で計算、入力するuseEffect
  useEffect(() => {
    // initialDate.setHours(0, 0, 0, 0);
    if (!salesDate) return;
    const year = salesDate.getFullYear(); // 例: 2023
    const month = salesDate.getMonth() + 1; // getMonth()は0から11で返されるため、+1して1から12に調整
    const salesYearMonthInitialValue = `${year}${month < 10 ? "0" + month : month}`; // 月が1桁の場合は先頭に0を追加
    console.log("年月日salesYearMonthInitialValue", salesYearMonthInitialValue, "salesDate", salesDate);
    if (salesYearMonthInitialValue) {
      setSalesYearMonth(Number(salesYearMonthInitialValue));
    } else {
      setSalesYearMonth(null); // or setResultStartTime('');
    }
  }, [salesDate]);

  // キャンセルでモーダルを閉じる
  const handleCancelAndReset = () => {
    if (loadingGlobalState) return;
    setIsOpenInsertNewPropertyModal(false);
  };
  // 🌟面談・訪問画面から案件を作成 面談・訪問画面で選択したRowデータを使用する
  const handleSaveAndCloseFromMeeting = async () => {
    // if (!summary) return alert("活動概要を入力してください");
    // if (!PropertyType) return alert("活動タイプを選択してください");
    if (!userProfileState?.id) return alert("ユーザー情報が存在しません");
    if (!selectedRowDataMeeting?.company_id) return alert("相手先の会社情報が存在しません");
    if (!selectedRowDataMeeting?.contact_id) return alert("担当者情報が存在しません");
    if (currentStatus === "") return alert("ステータスを選択してください");
    // if (!expectedOrderDate) return alert("獲得予定時期を入力してください");
    if (!propertyDate) return alert("案件発生日付を入力してください");
    if (!PropertyYearMonth) return alert("案件年月度を入力してください");
    if (PropertyMemberName === "") return alert("自社担当を入力してください");

    setLoadingGlobalState(true);

    // 新規作成するデータをオブジェクトにまとめる
    const newProperty = {
      created_by_company_id: userProfileState?.company_id ? userProfileState.company_id : null,
      created_by_user_id: userProfileState?.id ? userProfileState.id : null,
      created_by_department_of_user: userProfileState.department ? userProfileState.department : null,
      created_by_unit_of_user: userProfileState?.unit ? userProfileState.unit : null,
      client_contact_id: selectedRowDataMeeting.contact_id,
      client_company_id: selectedRowDataMeeting.company_id,
      current_status: currentStatus ? currentStatus : null,
      property_name: propertyName ? propertyName : null,
      property_summary: propertySummary ? propertySummary : null,
      pending_flag: pendingFlag,
      rejected_flag: rejectedFlag,
      product_name: productName ? productName : null,
      product_sales: productSales ? productSales : null,
      expected_order_date: expectedOrderDate ? expectedOrderDate.toISOString() : null,
      expected_sales_price: expectedSalesPrice ? expectedSalesPrice : null,
      term_division: termDivision ? termDivision : null,
      sold_product_name: soldProductName ? soldProductName : null,
      unit_sales: unitSales ? unitSales : null,
      sales_contribution_category: salesContributionCategory ? salesContributionCategory : null,
      sales_price: salesPrice ? salesPrice : null,
      discounted_price: discountedPrice ? discountedPrice : null,
      discount_rate: discountedRate ? discountedRate : null,
      sales_class: salesClass ? salesClass : null,
      expansion_date: expansionDate ? expansionDate.toISOString() : null,
      sales_date: salesDate ? salesDate.toISOString() : null,
      expansion_quarter: expansionQuarter ? expansionQuarter : null,
      sales_quarter: salesQuarter ? salesQuarter : null,
      subscription_start_date: subscriptionStartDate ? subscriptionStartDate.toISOString() : null,
      subscription_canceled_at: subscriptionCanceledAt ? subscriptionCanceledAt.toISOString() : null,
      leasing_company: leasingCompany ? leasingCompany : null,
      lease_division: leaseDivision ? leaseDivision : null,
      lease_expiration_date: leaseExpirationDate ? leaseExpirationDate.toISOString() : null,
      step_in_flag: stepInFlag,
      repeat_flag: repeatFlag,
      order_certainty_start_of_month: orderCertaintyStartOfMonth ? orderCertaintyStartOfMonth : null,
      review_order_certainty: reviewOrderCertainty ? reviewOrderCertainty : null,
      competitor_appearance_date: competitorAppearanceDate ? competitorAppearanceDate.toISOString() : null,
      competitor: competitor ? competitor : null,
      competitor_product: competitorProduct ? competitorProduct : null,
      reason_class: reasonClass ? reasonClass : null,
      reason_detail: reasonDetail ? reasonDetail : null,
      customer_budget: customerBudget ? customerBudget : null,
      decision_maker_negotiation: decisionMakerNegotiation ? decisionMakerNegotiation : null,
      expansion_year_month: expansionYearMonth ? expansionYearMonth : null,
      sales_year_month: salesYearMonth ? salesYearMonth : null,
      subscription_interval: subscriptionInterval ? subscriptionInterval : null,
      competition_state: competitionState ? competitionState : null,
      property_year_month: PropertyYearMonth ? PropertyYearMonth : null,
      property_department: PropertyDepartment ? PropertyDepartment : null,
      property_business_office: PropertyBusinessOffice ? PropertyBusinessOffice : null,
      property_member_name: PropertyMemberName ? PropertyMemberName : null,
      property_date: propertyDate ? propertyDate.toISOString() : null,
    };

    console.log("案件 新規作成 newProperty", newProperty);

    // supabaseにINSERT,ローディング終了, モーダルを閉じる
    createPropertyMutation.mutate(newProperty);

    // setLoadingGlobalState(false);

    // モーダルを閉じる
    // setIsOpenInsertNewPropertyModal(false);
  };
  // 🌟活動画面から案件を作成 活動画面で選択したRowデータを使用する
  const handleSaveAndCloseFromActivity = async () => {
    // if (!summary) return alert("活動概要を入力してください");
    // if (!PropertyType) return alert("活動タイプを選択してください");
    if (!userProfileState?.id) return alert("ユーザー情報が存在しません");
    if (!selectedRowDataActivity?.company_id) return alert("相手先の会社情報が存在しません");
    if (!selectedRowDataActivity?.contact_id) return alert("担当者情報が存在しません");
    if (currentStatus === "") return alert("ステータスを選択してください");
    // if (!expectedOrderDate) return alert("獲得予定時期を入力してください");
    if (!propertyDate) return alert("案件発生日付を入力してください");
    if (!PropertyYearMonth) return alert("案件年月度を入力してください");
    if (PropertyMemberName === "") return alert("自社担当を入力してください");

    setLoadingGlobalState(true);

    // 新規作成するデータをオブジェクトにまとめる
    const newProperty = {
      created_by_company_id: userProfileState?.company_id ? userProfileState.company_id : null,
      created_by_user_id: userProfileState?.id ? userProfileState.id : null,
      created_by_department_of_user: userProfileState.department ? userProfileState.department : null,
      created_by_unit_of_user: userProfileState?.unit ? userProfileState.unit : null,
      client_contact_id: selectedRowDataActivity.contact_id,
      client_company_id: selectedRowDataActivity.company_id,
      current_status: currentStatus,
      property_name: propertyName,
      property_summary: propertySummary,
      pending_flag: pendingFlag,
      rejected_flag: rejectedFlag,
      product_name: productName,
      product_sales: productSales,
      expected_order_date: expectedOrderDate ? expectedOrderDate.toISOString() : null,
      expected_sales_price: expectedSalesPrice,
      term_division: termDivision,
      sold_product_name: soldProductName,
      unit_sales: unitSales,
      sales_contribution_category: salesContributionCategory,
      sales_price: salesPrice,
      discounted_price: discountedPrice,
      discount_rate: discountedRate,
      sales_class: salesClass,
      expansion_date: expansionDate ? expansionDate.toISOString() : null,
      sales_date: salesDate ? salesDate.toISOString() : null,
      expansion_quarter: expansionQuarter,
      sales_quarter: salesQuarter,
      subscription_start_date: subscriptionStartDate ? subscriptionStartDate.toISOString() : null,
      subscription_canceled_at: subscriptionCanceledAt ? subscriptionCanceledAt.toISOString() : null,
      leasing_company: leasingCompany,
      lease_division: leaseDivision,
      lease_expiration_date: leaseExpirationDate ? leaseExpirationDate.toISOString() : null,
      step_in_flag: stepInFlag,
      repeat_flag: repeatFlag,
      order_certainty_start_of_month: orderCertaintyStartOfMonth,
      review_order_certainty: reviewOrderCertainty,
      competitor_appearance_date: competitorAppearanceDate ? competitorAppearanceDate.toISOString() : null,
      competitor: competitor,
      competitor_product: competitorProduct,
      reason_class: reasonClass,
      reason_detail: reasonDetail,
      customer_budget: customerBudget,
      decision_maker_negotiation: decisionMakerNegotiation,
      expansion_year_month: expansionYearMonth,
      sales_year_month: salesYearMonth,
      subscription_interval: subscriptionInterval,
      competition_state: competitionState,
      property_year_month: PropertyYearMonth,
      property_department: PropertyDepartment ? PropertyDepartment : null,
      property_business_office: PropertyBusinessOffice ? PropertyBusinessOffice : null,
      property_member_name: PropertyMemberName ? PropertyMemberName : null,
      property_date: propertyDate ? propertyDate.toISOString() : null,
    };

    console.log("案件 新規作成 newProperty", newProperty);

    // supabaseにINSERT,ローディング終了, モーダルを閉じる
    createPropertyMutation.mutate(newProperty);

    // setLoadingGlobalState(false);

    // モーダルを閉じる
    // setIsOpenInsertNewPropertyModal(false);
  };
  // 🌟案件画面から案件を作成 案件画面で選択したRowデータを使用する
  const handleSaveAndCloseFromProperty = async () => {
    // if (!summary) return alert("活動概要を入力してください");
    // if (!PropertyType) return alert("活動タイプを選択してください");
    if (!userProfileState?.id) return alert("ユーザー情報が存在しません");
    if (!selectedRowDataProperty?.company_id) return alert("相手先の会社情報が存在しません");
    if (!selectedRowDataProperty?.contact_id) return alert("担当者情報が存在しません");
    if (currentStatus === "") return alert("ステータスを選択してください");
    // if (!expectedOrderDate) return alert("獲得予定時期を入力してください");
    if (!propertyDate) return alert("案件発生日付を入力してください");
    if (!PropertyYearMonth) return alert("案件年月度を入力してください");
    if (PropertyMemberName === "") return alert("自社担当を入力してください");

    setLoadingGlobalState(true);

    // 新規作成するデータをオブジェクトにまとめる
    const newProperty = {
      created_by_company_id: userProfileState?.company_id ? userProfileState.company_id : null,
      created_by_user_id: userProfileState?.id ? userProfileState.id : null,
      created_by_department_of_user: userProfileState.department ? userProfileState.department : null,
      created_by_unit_of_user: userProfileState?.unit ? userProfileState.unit : null,
      client_contact_id: selectedRowDataProperty.contact_id,
      client_company_id: selectedRowDataProperty.company_id,
      current_status: currentStatus,
      property_name: propertyName,
      property_summary: propertySummary,
      pending_flag: pendingFlag,
      rejected_flag: rejectedFlag,
      product_name: productName,
      product_sales: productSales,
      expected_order_date: expectedOrderDate ? expectedOrderDate.toISOString() : null,
      expected_sales_price: expectedSalesPrice,
      term_division: termDivision,
      sold_product_name: soldProductName,
      unit_sales: unitSales,
      sales_contribution_category: salesContributionCategory,
      sales_price: salesPrice,
      discounted_price: discountedPrice,
      discount_rate: discountedRate,
      sales_class: salesClass,
      expansion_date: expansionDate ? expansionDate.toISOString() : null,
      sales_date: salesDate ? salesDate.toISOString() : null,
      expansion_quarter: expansionQuarter,
      sales_quarter: salesQuarter,
      subscription_start_date: subscriptionStartDate ? subscriptionStartDate.toISOString() : null,
      subscription_canceled_at: subscriptionCanceledAt ? subscriptionCanceledAt.toISOString() : null,
      leasing_company: leasingCompany,
      lease_division: leaseDivision,
      lease_expiration_date: leaseExpirationDate ? leaseExpirationDate.toISOString() : null,
      step_in_flag: stepInFlag,
      repeat_flag: repeatFlag,
      order_certainty_start_of_month: orderCertaintyStartOfMonth,
      review_order_certainty: reviewOrderCertainty,
      competitor_appearance_date: competitorAppearanceDate ? competitorAppearanceDate.toISOString() : null,
      competitor: competitor,
      competitor_product: competitorProduct,
      reason_class: reasonClass,
      reason_detail: reasonDetail,
      customer_budget: customerBudget,
      decision_maker_negotiation: decisionMakerNegotiation,
      expansion_year_month: expansionYearMonth,
      sales_year_month: salesYearMonth,
      subscription_interval: subscriptionInterval,
      competition_state: competitionState,
      property_year_month: PropertyYearMonth,
      property_department: PropertyDepartment ? PropertyDepartment : null,
      property_business_office: PropertyBusinessOffice ? PropertyBusinessOffice : null,
      property_member_name: PropertyMemberName ? PropertyMemberName : null,
      property_date: propertyDate ? propertyDate.toISOString() : null,
    };

    console.log("案件 新規作成 newProperty", newProperty);

    // supabaseにINSERT,ローディング終了, モーダルを閉じる
    createPropertyMutation.mutate(newProperty);

    // setLoadingGlobalState(false);

    // モーダルを閉じる
    // setIsOpenInsertNewPropertyModal(false);
  };
  // 🌟担当者画面から案件を作成 担当者画面で選択したRowデータを使用する
  const handleSaveAndCloseFromContact = async () => {
    // if (!summary) return alert("活動概要を入力してください");
    // if (!PropertyType) return alert("活動タイプを選択してください");
    if (!userProfileState?.id) return alert("ユーザー情報が存在しません");
    if (!selectedRowDataContact?.company_id) return alert("相手先の会社情報が存在しません");
    if (!selectedRowDataContact?.contact_id) return alert("担当者情報が存在しません");
    if (currentStatus === "") return alert("ステータスを選択してください");
    // if (!expectedOrderDate) return alert("獲得予定時期を入力してください");
    if (!propertyDate) return alert("案件発生日付を入力してください");
    if (!PropertyYearMonth) return alert("案件年月度を入力してください");
    if (PropertyMemberName === "") return alert("自社担当を入力してください");

    setLoadingGlobalState(true);

    // 新規作成するデータをオブジェクトにまとめる
    const newProperty = {
      created_by_company_id: userProfileState?.company_id ? userProfileState.company_id : null,
      created_by_user_id: userProfileState?.id ? userProfileState.id : null,
      created_by_department_of_user: userProfileState.department ? userProfileState.department : null,
      created_by_unit_of_user: userProfileState?.unit ? userProfileState.unit : null,
      client_contact_id: selectedRowDataContact.contact_id,
      client_company_id: selectedRowDataContact.company_id,
      current_status: currentStatus,
      property_name: propertyName,
      property_summary: propertySummary,
      pending_flag: pendingFlag,
      rejected_flag: rejectedFlag,
      product_name: productName,
      product_sales: productSales,
      expected_order_date: expectedOrderDate ? expectedOrderDate.toISOString() : null,
      expected_sales_price: expectedSalesPrice,
      term_division: termDivision,
      sold_product_name: soldProductName,
      unit_sales: unitSales,
      sales_contribution_category: salesContributionCategory,
      sales_price: salesPrice,
      discounted_price: discountedPrice,
      discount_rate: discountedRate,
      sales_class: salesClass,
      expansion_date: expansionDate ? expansionDate.toISOString() : null,
      sales_date: salesDate ? salesDate.toISOString() : null,
      expansion_quarter: expansionQuarter,
      sales_quarter: salesQuarter,
      subscription_start_date: subscriptionStartDate ? subscriptionStartDate.toISOString() : null,
      subscription_canceled_at: subscriptionCanceledAt ? subscriptionCanceledAt.toISOString() : null,
      leasing_company: leasingCompany,
      lease_division: leaseDivision,
      lease_expiration_date: leaseExpirationDate ? leaseExpirationDate.toISOString() : null,
      step_in_flag: stepInFlag,
      repeat_flag: repeatFlag,
      order_certainty_start_of_month: orderCertaintyStartOfMonth,
      review_order_certainty: reviewOrderCertainty,
      competitor_appearance_date: competitorAppearanceDate ? competitorAppearanceDate.toISOString() : null,
      competitor: competitor,
      competitor_product: competitorProduct,
      reason_class: reasonClass,
      reason_detail: reasonDetail,
      customer_budget: customerBudget,
      decision_maker_negotiation: decisionMakerNegotiation,
      expansion_year_month: expansionYearMonth,
      sales_year_month: salesYearMonth,
      subscription_interval: subscriptionInterval,
      competition_state: competitionState,
      property_year_month: PropertyYearMonth,
      property_department: PropertyDepartment ? PropertyDepartment : null,
      property_business_office: PropertyBusinessOffice ? PropertyBusinessOffice : null,
      property_member_name: PropertyMemberName ? PropertyMemberName : null,
      property_date: propertyDate ? propertyDate.toISOString() : null,
    };

    console.log("案件 新規作成 newProperty", newProperty);

    // supabaseにINSERT,ローディング終了, モーダルを閉じる
    createPropertyMutation.mutate(newProperty);

    // setLoadingGlobalState(false);

    // モーダルを閉じる
    // setIsOpenInsertNewPropertyModal(false);
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

  // ================================ ツールチップ ================================
  type TooltipParams = {
    e: React.MouseEvent<HTMLElement, MouseEvent>;
    display: string;
    content: string;
    content2?: string | undefined | null;
    content3?: string | undefined | null;
    marginTop?: number;
    itemsPosition?: string;
    whiteSpace?: "normal" | "pre" | "nowrap" | "pre-wrap" | "pre-line" | "break-spaces" | undefined;
  };
  const modalContainerRef = useRef<HTMLDivElement | null>(null);
  const hoveredItemPosModal = useStore((state) => state.hoveredItemPosModal);
  const setHoveredItemPosModal = useStore((state) => state.setHoveredItemPosModal);
  // const handleOpenTooltip = (e: React.MouseEvent<HTMLElement, MouseEvent>, display: string) => {
  const handleOpenTooltip = ({
    e,
    display,
    content,
    content2,
    content3,
    marginTop,
    itemsPosition = "center",
    whiteSpace,
  }: TooltipParams) => {
    // モーダルコンテナのleftを取得する
    if (!modalContainerRef.current) return;
    const containerLeft = modalContainerRef.current?.getBoundingClientRect().left;
    const containerTop = modalContainerRef.current?.getBoundingClientRect().top;
    const containerWidth = modalContainerRef.current?.getBoundingClientRect().width;
    const containerHeight = modalContainerRef.current?.getBoundingClientRect().height;
    // ホバーしたアイテムにツールチップを表示
    const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
    // const content2 = ((e.target as HTMLDivElement).dataset.text2 as string)
    //   ? ((e.target as HTMLDivElement).dataset.text2 as string)
    //   : "";
    // const content3 = ((e.target as HTMLDivElement).dataset.text3 as string)
    //   ? ((e.target as HTMLDivElement).dataset.text3 as string)
    //   : "";
    setHoveredItemPosModal({
      x: x - containerLeft,
      y: y - containerTop,
      itemWidth: width,
      itemHeight: height,
      containerLeft: containerLeft,
      containerTop: containerTop,
      containerWidth: containerWidth,
      containerHeight: containerHeight,
      content: content,
      content2: content2,
      content3: content3,
      display: display,
      marginTop: marginTop,
      itemsPosition: itemsPosition,
      whiteSpace: whiteSpace,
    });
  };
  // ============================================================================================
  // ================================ ツールチップを非表示 ================================
  const handleCloseTooltip = () => {
    setHoveredItemPosModal(null);
  };
  // ============================================================================================

  const selectOptionsYear = Array.from({ length: 2 }, (_, index) => new Date().getFullYear() - index);

  console.log(
    "面談予定作成モーダル selectedRowDataContact",
    selectedRowDataContact,
    "selectedRowDataActivity",
    selectedRowDataActivity,
    "selectedRowDataMeeting",
    selectedRowDataMeeting
  );

  return (
    <>
      <div className={`${styles.overlay} `} onClick={handleCancelAndReset} />
      {/* {loadingGlobalState && (
        <div className={`${styles.loading_overlay} `}>
          <SpinnerIDS scale={"scale-[0.5]"} />
        </div>
      )} */}
      <div className={`${styles.container} fade03`} ref={modalContainerRef}>
        {/* ツールチップ */}
        {hoveredItemPosModal && <TooltipModal />}
        {/* ローディングオーバーレイ */}
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
          <div className="min-w-[150px] select-none font-bold">案件 新規作成</div>

          {selectedRowDataMeeting && (
            <div
              className={`min-w-[150px] cursor-pointer text-end font-bold text-[var(--color-text-brand-f)] hover:text-[var(--color-text-brand-f-hover)] ${styles.save_text} select-none`}
              onClick={handleSaveAndCloseFromMeeting}
            >
              保存
            </div>
          )}
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
              className={`min-w-[150px] cursor-pointer text-end font-bold text-[var(--color-text-brand-f)] hover:text-[var(--color-text-brand-f-hover)] ${styles.save_text} select-none`}
              onClick={handleSaveAndCloseFromActivity}
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
              {/* 現ステータス */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px] ${styles.required_title}`}>●現ステータス</span>
                    {/* <span className={`${styles.title} !min-w-[140px]`}>●現ステータス</span> */}
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box} ${
                        !currentStatus ? `text-[#9ca3af]` : ``
                      }`}
                      value={currentStatus}
                      onChange={(e) => {
                        // if (e.target.value === "") return alert("訪問目的を選択してください");
                        setCurrentStatus(e.target.value);
                      }}
                    >
                      {/* <option value="">※選択必/須　ステータスを選択してください</option> */}
                      {/* <option value="展開">展開 (案件発生)</option> */}
                      <option value="">ステータスを選択してください</option>
                      <option value="リード">リード</option>
                      <option value="展開">展開</option>
                      <option value="申請">申請 (予算申請案件)</option>
                      <option value="受注">受注</option>
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>
            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 案件発生日付 */}
              {/* <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>案件発生日付</span>
                    <DatePickerCustomInput startDate={propertyDate} setStartDate={setPropertyDate} />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div> */}
              {/* 現ステータス解説 */}
              <div className={`mt-[18px] flex h-[35px] w-full items-center`}>
                <div className="mr-[20px] flex items-center space-x-[4px] text-[15px] font-bold">
                  <ImInfo className={`text-[var(--color-text-brand-f)]`} />
                  <span>現ステータス解説：</span>
                </div>
                <div className="flex items-center space-x-[20px] text-[15px]">
                  <div
                    className={`flex cursor-pointer items-center space-x-[4px] text-[var(--color-text-sub)] hover:text-[var(--color-text-brand-f)] hover:underline`}
                    // data-text="マーケティングが獲得した引合・リードを管理することで、"
                    // data-text2="獲得したリードから営業のフォロー状況を確認することができます。"
                    // onMouseEnter={(e) => {
                    //   handleOpenTooltip(e, "top");
                    // }}
                    onMouseEnter={(e) =>
                      handleOpenTooltip({
                        e: e,
                        display: "top",
                        content: "マーケティングが引合・リードを獲得した際に使用します。",
                        content2: "リード獲得後の営業のフォロー状況やリード発生での受注状況を把握することで",
                        content3: "マーケティングの成果を正確に管理することが可能です。",
                        marginTop: 57,
                        itemsPosition: "center",
                        whiteSpace: "nowrap",
                      })
                    }
                    onMouseLeave={handleCloseTooltip}
                  >
                    <span className="pointer-events-none">リード</span>
                    <AiOutlineQuestionCircle className={`pointer-events-none`} />
                  </div>
                  <div
                    className={`flex cursor-pointer items-center space-x-[4px] text-[var(--color-text-sub)] hover:text-[var(--color-text-brand-f)] hover:underline`}
                    onMouseEnter={(e) =>
                      handleOpenTooltip({
                        e: e,
                        display: "top",
                        content:
                          "営業担当の訪問・Web面談から客先が今期、または来期に導入の可能性がある際に使用します。",
                        content2: "面談から展開率(どれだけ受注可能性のある案件に展開したか)を把握することが可能です。",
                        content3:
                          "受注率、展開率、アポ率を把握することで目標達成に必要なプロセスと改善点が明確になります。",
                        marginTop: 57,
                        itemsPosition: "center",
                        whiteSpace: "nowrap",
                      })
                    }
                    onMouseLeave={handleCloseTooltip}
                  >
                    <span className="pointer-events-none">展開</span>
                    <AiOutlineQuestionCircle className={`pointer-events-none`} />
                  </div>
                  <div
                    className={`flex cursor-pointer items-center space-x-[4px] text-[var(--color-text-sub)] hover:text-[var(--color-text-brand-f)] hover:underline`}
                    onMouseEnter={(e) =>
                      handleOpenTooltip({
                        e: e,
                        display: "top",
                        content: "お客様が予算申請に上げていただいた際に使用します。",
                        content2: "長期的な案件も予定通り取り切るために管理することができます。",
                        marginTop: 36,
                        itemsPosition: "center",
                        whiteSpace: "nowrap",
                      })
                    }
                    onMouseLeave={handleCloseTooltip}
                  >
                    <span className="pointer-events-none">申請</span>
                    <AiOutlineQuestionCircle className={`pointer-events-none`} />
                  </div>
                  <div
                    className={`flex cursor-pointer items-center space-x-[4px] text-[var(--color-text-sub)] hover:text-[var(--color-text-brand-f)] hover:underline`}
                    onMouseEnter={(e) =>
                      handleOpenTooltip({
                        e: e,
                        display: "top",
                        content: "案件を受注した際に使用します。",
                        content2:
                          "受注率、展開率、アポ率を把握することで目標達成に必要なプロセスと改善点が明確になります。",
                        marginTop: 36,
                        itemsPosition: "center",
                        whiteSpace: "nowrap",
                      })
                    }
                    onMouseLeave={handleCloseTooltip}
                  >
                    <span className="pointer-events-none">受注</span>
                    <AiOutlineQuestionCircle className={`pointer-events-none`} />
                  </div>
                </div>
              </div>

              {/* 右ラッパーここまで */}
            </div>
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* 案件名 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  {/* <span className={`${styles.title} !min-w-[140px] ${styles.required_title}`}>●案件名</span> */}
                  <span className={`${styles.title} !min-w-[140px] `}>●案件名</span>
                  <input
                    type="text"
                    // placeholder="※入力必須　案件名を入力してください"
                    placeholder="案件名を入力してください"
                    required
                    className={`${styles.input_box}`}
                    value={propertyName}
                    onChange={(e) => setPropertyName(e.target.value)}
                    onBlur={() => setPropertyName(toHalfWidth(propertyName.trim()))}
                  />
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全部ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full flex-col`}>
            {/* 案件概要 */}
            <div className={`${styles.row_area} ${styles.text_area_xl} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full `}>
                  <span className={`${styles.title} !min-w-[140px]`}>案件概要</span>
                  <textarea
                    cols={30}
                    // rows={10}
                    placeholder="案件概要を入力してください"
                    className={`${styles.textarea_box}`}
                    value={propertySummary}
                    onChange={(e) => setPropertySummary(e.target.value)}
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
              {/* 商品 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>商品</span>
                    <input
                      type="text"
                      placeholder=""
                      required
                      className={`${styles.input_box}`}
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      // onBlur={() => setDepartmentName(toHalfWidth(departmentName.trim()))}
                    />
                    {/* <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={productName}
                      onChange={(e) => {
                        // if (e.target.value === "") return alert("訪問目的を選択してください");
                        setProductName(e.target.value);
                      }}
                    >
                      <>
                        <option value="">商品を選択してください</option>
                        {products?.map((item, index) => (
                          <option key={item.id} value={`${item.inside_short_name}`}>
                            {item.inside_short_name}
                          </option>
                        ))}
                      </>
                    </select> */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 予定売上台数 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>台数(予定)</span>
                    <input
                      type="number"
                      min="0"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={productSales === null ? "" : productSales}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setProductSales(null);
                        } else {
                          const numValue = Number(val);

                          // 入力値がマイナスかチェック
                          if (numValue < 0) {
                            setProductSales(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                          } else {
                            setProductSales(numValue);
                          }
                        }
                      }}
                    />
                    {/* バツボタン */}
                    {productSales !== null && productSales !== 0 && (
                      <div className={`${styles.close_btn_number}`} onClick={() => setProductSales(null)}>
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
              {/* 獲得予定時期 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>獲得予定時期</span>
                    <DatePickerCustomInput
                      startDate={expectedOrderDate}
                      setStartDate={setExpectedOrderDate}
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
              {/* 予定売上価格 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>売上価格(予定)</span>
                    <input
                      type="number"
                      min="0"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={expectedSalesPrice === null ? "" : expectedSalesPrice}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setExpectedSalesPrice(null);
                        } else {
                          const numValue = Number(val);

                          // 入力値がマイナスかチェック
                          if (numValue < 0) {
                            setExpectedSalesPrice(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                          } else {
                            setExpectedSalesPrice(numValue);
                          }
                        }
                      }}
                    />
                    {/* バツボタン */}
                    {expectedSalesPrice !== null && expectedSalesPrice !== 0 && (
                      <div className={`${styles.close_btn_number}`} onClick={() => setExpectedSalesPrice(null)}>
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
              {/* 今期・来期 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>今期・来期</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={termDivision}
                      onChange={(e) => {
                        setTermDivision(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      <option value="今期">今期 (今期に獲得予定)</option>
                      <option value="来期">来期 (来期に獲得予定)</option>
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
              {/* 月初確度 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>月初確度</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={orderCertaintyStartOfMonth}
                      onChange={(e) => {
                        setOrderCertaintyStartOfMonth(e.target.value);
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

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 中間見直確度 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>中間見直確度</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={reviewOrderCertainty}
                      onChange={(e) => {
                        setReviewOrderCertainty(e.target.value);
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

              {/* 右ラッパーここまで */}
            </div>
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* ペンディング */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>ペンディング</span>
                    <div className={`${styles.grid_select_cell_header}`}>
                      <input
                        type="checkbox"
                        className={`${styles.grid_select_cell_header_input}`}
                        checked={pendingFlag}
                        onChange={() => setPendingFlag(!pendingFlag)}
                      />
                      <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 案件没 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} `}>案件没</span>
                    <div className={`${styles.grid_select_cell_header}`}>
                      <input
                        type="checkbox"
                        className={`${styles.grid_select_cell_header_input}`}
                        checked={rejectedFlag}
                        onChange={() => setRejectedFlag(!rejectedFlag)}
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
              {/* 売上商品 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>売上商品</span>
                    <input
                      type="text"
                      placeholder=""
                      required
                      className={`${styles.input_box}`}
                      value={soldProductName}
                      onChange={(e) => setSoldProductName(e.target.value)}
                      // onBlur={() => setDepartmentName(toHalfWidth(departmentName.trim()))}
                    />
                    {/* <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={productName}
                      onChange={(e) => {
                        // if (e.target.value === "") return alert("訪問目的を選択してください");
                        setProductName(e.target.value);
                      }}
                    >
                      <>
                        <option value="">商品を選択してください</option>
                        {products?.map((item, index) => (
                          <option key={item.id} value={`${item.inside_short_name}`}>
                            {item.inside_short_name}
                          </option>
                        ))}
                      </>
                    </select> */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 売上台数 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>売上台数</span>
                    <input
                      type="number"
                      min="0"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={unitSales === null ? "" : unitSales}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setUnitSales(null);
                        } else {
                          const numValue = Number(val);

                          // 入力値がマイナスかチェック
                          if (numValue < 0) {
                            setUnitSales(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                          } else {
                            setUnitSales(numValue);
                          }
                        }
                      }}
                    />
                    {/* バツボタン */}
                    {unitSales !== null && unitSales !== 0 && (
                      <div className={`${styles.close_btn_number}`} onClick={() => setUnitSales(null)}>
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
              {/* 売上貢献区分 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>売上貢献区分</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={salesContributionCategory}
                      onChange={(e) => {
                        setSalesContributionCategory(e.target.value);
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
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 売上価格 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>売上価格</span>
                    <input
                      type="number"
                      min="0"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={salesPrice === null ? "" : salesPrice}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setSalesPrice(null);
                        } else {
                          const numValue = Number(val);

                          // 入力値がマイナスかチェック
                          if (numValue < 0) {
                            setSalesPrice(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                          } else {
                            setSalesPrice(numValue);
                          }
                        }
                      }}
                    />
                    {/* バツボタン */}
                    {salesPrice !== null && salesPrice !== 0 && (
                      <div className={`${styles.close_btn_number}`} onClick={() => setSalesPrice(null)}>
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
              {/* 導入分類 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>導入分類</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={salesClass}
                      onChange={(e) => {
                        setSalesClass(e.target.value);
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
              </div>

              {/* 左ラッパーここまで */}
            </div>
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* 値引価格 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>値引価格</span>
                    <input
                      type="number"
                      min="0"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={discountedPrice === null ? "" : discountedPrice}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setDiscountedPrice(null);
                        } else {
                          const numValue = Number(val);

                          // 入力値がマイナスかチェック
                          if (numValue < 0) {
                            setDiscountedPrice(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                          } else {
                            setDiscountedPrice(numValue);
                          }
                        }
                      }}
                    />
                    {/* バツボタン */}
                    {discountedPrice !== null && discountedPrice !== 0 && (
                      <div className={`${styles.close_btn_number}`} onClick={() => setDiscountedPrice(null)}>
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
              {/* 値引率 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>値引率</span>
                    <input
                      type="number"
                      min="0"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={discountedRate === null ? "" : discountedRate}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setDiscountedRate(null);
                        } else {
                          const numValue = Number(val);

                          // 入力値がマイナスかチェック
                          if (numValue < 0) {
                            setDiscountedRate(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                          } else {
                            setDiscountedRate(numValue);
                          }
                        }
                      }}
                    />
                    {/* バツボタン */}
                    {discountedRate !== null && discountedRate !== 0 && (
                      <div className={`${styles.close_btn_number}`} onClick={() => setDiscountedRate(null)}>
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
              {/* 展開日付 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>展開日付</span>
                    <DatePickerCustomInput
                      startDate={expansionDate}
                      setStartDate={setExpansionDate}
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
              {/* 売上日付 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>売上日付</span>
                    <DatePickerCustomInput
                      startDate={salesDate}
                      setStartDate={setSalesDate}
                      fontSize="text-[15px]"
                      placeholderText="placeholder:text-[15px]"
                      py="py-[6px]"
                      minHeight="min-h-[32px]"
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
              {/* 展開四半期 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    {/* <span className={`${styles.title} !min-w-[140px]`}>展開四半期</span> */}
                    <div
                      className={`relative flex !min-w-[140px] items-center ${styles.title} hover:text-[var(--color-text-brand-f)]`}
                      onMouseEnter={(e) =>
                        handleOpenTooltip({
                          e: e,
                          display: "top",
                          content:
                            "展開四半期は決算月の期末日の翌日(期首)から1ヶ月間を財務サイクルとして計算しています。",
                          content2: "決算月が未設定の場合は、デフォルトで3月31日が決算月日として設定されます。",
                          content3: "変更はダッシュボード右上のアカウント設定の「会社・チーム」から変更可能です。",
                          marginTop: 57,
                          itemsPosition: "center",
                          whiteSpace: "nowrap",
                        })
                      }
                      onMouseLeave={handleCloseTooltip}
                    >
                      <span className={`mr-[6px]`}>展開四半期</span>
                      <ImInfo className={`min-h-[16px] min-w-[16px] text-[var(--color-text-brand-f)]`} />
                    </div>
                    {/* <input
                      type="text"
                      placeholder="20201Q、20202Q、20203Q、20204Qなど"
                      required
                      className={`${styles.input_box}`}
                      value={expansionQuarter}
                      onChange={(e) => setExpansionQuarter(e.target.value)}
                    /> */}
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      placeholder="時"
                      value={expansionQuarterSelectedYear ? expansionQuarterSelectedYear : ""}
                      onChange={(e) =>
                        setExpansionQuarterSelectedYear(e.target.value === "" ? null : Number(e.target.value))
                      }
                    >
                      <option value=""></option>
                      {selectOptionsYear.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>

                    <span className="mx-[10px]">年</span>

                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      placeholder="分"
                      value={expansionQuarterSelectedQuarter ? expansionQuarterSelectedQuarter : ""}
                      onChange={(e) =>
                        setExpansionQuarterSelectedQuarter(e.target.value === "" ? null : Number(e.target.value))
                      }
                    >
                      <option value=""></option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 売上四半期 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    {/* <span className={`${styles.title} !min-w-[140px]`}>売上四半期</span> */}
                    <div
                      className={`relative flex !min-w-[140px] items-center ${styles.title} hover:text-[var(--color-text-brand-f)]`}
                      onMouseEnter={(e) =>
                        handleOpenTooltip({
                          e: e,
                          display: "top",
                          content:
                            "売上四半期は決算月の期末日の翌日(期首)から1ヶ月間を財務サイクルとして計算しています。",
                          content2: "決算月が未設定の場合は、デフォルトで3月31日が決算月日として設定されます。",
                          content3: "変更はダッシュボード右上のアカウント設定の「会社・チーム」から変更可能です。",
                          marginTop: 57,
                          itemsPosition: "center",
                          whiteSpace: "nowrap",
                        })
                      }
                      onMouseLeave={handleCloseTooltip}
                    >
                      <span className={`mr-[6px]`}>売上四半期</span>
                      <ImInfo className={`min-h-[16px] min-w-[16px] text-[var(--color-text-brand-f)]`} />
                    </div>
                    <input
                      type="text"
                      placeholder=""
                      required
                      className={`${styles.input_box}`}
                      value={salesQuarter}
                      onChange={(e) => setSalesQuarter(e.target.value)}
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
              {/* 展開年月度 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    {/* <span className={`${styles.title} !min-w-[140px]`}>展開年月度</span> */}
                    <div
                      className={`relative flex !min-w-[140px] items-center ${styles.title} hover:text-[var(--color-text-brand-f)]`}
                      onMouseEnter={(e) =>
                        handleOpenTooltip({
                          e: e,
                          display: "top",
                          content:
                            "展開年月度は決算月の期末日の翌日(期首)から1ヶ月間を財務サイクルとして計算しています。",
                          content2: "決算月が未設定の場合は、デフォルトで3月31日が決算月日として設定されます。",
                          content3: "変更はダッシュボード右上のアカウント設定の「会社・チーム」から変更可能です。",
                          marginTop: 57,
                          itemsPosition: "center",
                          whiteSpace: "nowrap",
                        })
                      }
                      onMouseLeave={handleCloseTooltip}
                    >
                      <span className={`mr-[6px]`}>展開年月度</span>
                      <ImInfo className={`min-h-[16px] min-w-[16px] text-[var(--color-text-brand-f)]`} />
                    </div>
                    <input
                      type="number"
                      min="0"
                      className={`${styles.input_box}`}
                      placeholder="展開日付を選択してください。"
                      value={expansionYearMonth === null ? "" : expansionYearMonth}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setExpansionYearMonth(null);
                        } else {
                          const numValue = Number(val);

                          // 入力値がマイナスかチェック
                          if (numValue < 0) {
                            setExpansionYearMonth(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                          } else {
                            setExpansionYearMonth(numValue);
                          }
                        }
                      }}
                    />
                    {/* バツボタン */}
                    {expansionYearMonth !== null && expansionYearMonth !== 0 && (
                      <div className={`${styles.close_btn_number}`} onClick={() => setExpansionYearMonth(null)}>
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
              {/* 売上年月度 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    {/* <span className={`${styles.title} !min-w-[140px]`}>売上年月度</span> */}
                    <div
                      className={`relative flex !min-w-[140px] items-center ${styles.title} hover:text-[var(--color-text-brand-f)]`}
                      onMouseEnter={(e) =>
                        handleOpenTooltip({
                          e: e,
                          display: "top",
                          content:
                            "売上年月度は決算月の期末日の翌日(期首)から1ヶ月間を財務サイクルとして計算しています。",
                          content2: "決算月が未設定の場合は、デフォルトで3月31日が決算月日として設定されます。",
                          content3: "変更はダッシュボード右上のアカウント設定の「会社・チーム」から変更可能です。",
                          marginTop: 57,
                          itemsPosition: "center",
                          whiteSpace: "nowrap",
                        })
                      }
                      onMouseLeave={handleCloseTooltip}
                    >
                      <span className={`mr-[6px]`}>売上年月度</span>
                      <ImInfo className={`min-h-[16px] min-w-[16px] text-[var(--color-text-brand-f)]`} />
                    </div>
                    <input
                      type="number"
                      min="0"
                      className={`${styles.input_box}`}
                      placeholder="売上日付を選択してください。"
                      value={salesYearMonth === null ? "" : salesYearMonth}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setSalesYearMonth(null);
                        } else {
                          const numValue = Number(val);

                          // 入力値がマイナスかチェック
                          if (numValue < 0) {
                            setSalesYearMonth(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                          } else {
                            setSalesYearMonth(numValue);
                          }
                        }
                      }}
                    />
                    {/* バツボタン */}
                    {salesYearMonth !== null && salesYearMonth !== 0 && (
                      <div className={`${styles.close_btn_number}`} onClick={() => setSalesYearMonth(null)}>
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
              {/* サブスク分類 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>サブスク分類</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={subscriptionInterval}
                      onChange={(e) => {
                        setSubscriptionInterval(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      <option value="月額">月額</option>
                      <option value="年額">年額</option>
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
              {/* サブスク開始日 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>サブスク開始日</span>
                    <DatePickerCustomInput
                      startDate={subscriptionStartDate}
                      setStartDate={setSubscriptionStartDate}
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
              {/* サブスク解約日 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>サブスク解約日</span>
                    <DatePickerCustomInput
                      startDate={subscriptionCanceledAt}
                      setStartDate={setSubscriptionCanceledAt}
                      fontSize="text-[15px]"
                      placeholderText="placeholder:text-[15px]"
                      py="py-[6px]"
                      minHeight="min-h-[32px]"
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
              {/* リース会社 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>リース会社</span>
                    <input
                      type="text"
                      placeholder=""
                      required
                      className={`${styles.input_box}`}
                      value={leasingCompany}
                      onChange={(e) => setLeasingCompany(e.target.value)}
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
              {/* リース分類 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>リース分類</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={leaseDivision}
                      onChange={(e) => {
                        setLeaseDivision(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      <option value="ファイナンスリース">ファイナンスリース</option>
                      <option value="オペレーティングリース">オペレーティングリース</option>
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
              {/* リース完了予定日 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>リース完了予定日</span>
                    <DatePickerCustomInput
                      startDate={leaseExpirationDate}
                      setStartDate={setLeaseExpirationDate}
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
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* リピート */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>リピート</span>
                    <div className={`${styles.grid_select_cell_header}`}>
                      <input
                        type="checkbox"
                        className={`${styles.grid_select_cell_header_input}`}
                        checked={repeatFlag}
                        onChange={() => setRepeatFlag(!repeatFlag)}
                      />
                      <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 案件介入(責任者) */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} `}>案件介入(責任者)</span>
                    <div
                      className={`${styles.grid_select_cell_header}`}
                      onMouseEnter={(e) =>
                        handleOpenTooltip({
                          e: e,
                          display: "top",
                          content: "自係・自チームのメンバーへの案件に責任者が介入した際にはチェックを入れます。",
                          // marginTop: 57,
                          marginTop: 12,
                          itemsPosition: "center",
                          whiteSpace: "nowrap",
                        })
                      }
                      onMouseLeave={handleCloseTooltip}
                    >
                      <input
                        type="checkbox"
                        className={`${styles.grid_select_cell_header_input}`}
                        checked={stepInFlag}
                        onChange={() => setStepInFlag(!stepInFlag)}
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
              {/* 競合発生日 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>競合発生日</span>
                    <DatePickerCustomInput
                      startDate={competitorAppearanceDate}
                      setStartDate={setCompetitorAppearanceDate}
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
              {/* 競合状況 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>競合状況</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={competitionState}
                      onChange={(e) => {
                        setCompetitionState(e.target.value);
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

              {/* 右ラッパーここまで */}
            </div>
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* 競合会社 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>競合会社</span>
                    <input
                      type="text"
                      placeholder=""
                      required
                      className={`${styles.input_box}`}
                      value={competitor}
                      onChange={(e) => setCompetitor(e.target.value)}
                      onBlur={() => setCompetitor(toHalfWidth(competitor.trim()))}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 競合商品 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>競合商品</span>
                    <input
                      type="text"
                      placeholder=""
                      required
                      className={`${styles.input_box}`}
                      value={competitorProduct}
                      onChange={(e) => setCompetitorProduct(e.target.value)}
                      onBlur={() => setCompetitorProduct(toHalfWidth(competitorProduct.trim()))}
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
              {/* 案件発生動機 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>案件発生動機</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={reasonClass}
                      onChange={(e) => {
                        // if (e.target.value === "") return alert("訪問目的を選択してください");
                        setReasonClass(e.target.value);
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
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 動機詳細 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>動機詳細</span>
                    <input
                      type="text"
                      placeholder=""
                      required
                      className={`${styles.input_box}`}
                      value={reasonDetail}
                      onChange={(e) => setReasonDetail(e.target.value)}
                      onBlur={() => setReasonDetail(toHalfWidth(reasonDetail.trim()))}
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
              {/* 客先予算 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>客先予算</span>
                    <input
                      type="number"
                      min="0"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={customerBudget === null ? "" : customerBudget}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setCustomerBudget(null);
                        } else {
                          const numValue = Number(val);

                          // 入力値がマイナスかチェック
                          if (numValue < 0) {
                            setCustomerBudget(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                          } else {
                            setCustomerBudget(numValue);
                          }
                        }
                      }}
                    />
                    {/* バツボタン */}
                    {customerBudget !== null && customerBudget !== 0 && (
                      <div className={`${styles.close_btn_number}`} onClick={() => setCustomerBudget(null)}>
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
              {/* 決裁者との商談有無 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !mr-[15px]`}>決裁者商談有無</span>
                    <select
                      name="number_of_employees_class"
                      id="number_of_employees_class"
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={decisionMakerNegotiation}
                      onChange={(e) => {
                        // if (e.target.value === "") return alert("活動タイプを選択してください");
                        setDecisionMakerNegotiation(e.target.value);
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

              {/* 右ラッパーここまで */}
            </div>
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* 案件発生日付 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px] ${styles.required_title}`}>●案件発生日付</span>
                    <DatePickerCustomInput
                      startDate={propertyDate}
                      setStartDate={setPropertyDate}
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
              {/* 案件年月度 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px] ${styles.required_title}`}>●案件年月度</span>
                    <input
                      type="number"
                      min="0"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={PropertyYearMonth === null ? "" : PropertyYearMonth}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setPropertyYearMonth(null);
                        } else {
                          const numValue = Number(val);

                          // 入力値がマイナスかチェック
                          if (numValue < 0) {
                            setPropertyYearMonth(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                          } else {
                            setPropertyYearMonth(numValue);
                          }
                        }
                      }}
                    />
                    {/* バツボタン */}
                    {PropertyYearMonth !== null && PropertyYearMonth !== 0 && (
                      <div className={`${styles.close_btn_number}`} onClick={() => setPropertyYearMonth(null)}>
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
                      value={PropertyDepartment}
                      onChange={(e) => setPropertyDepartment(e.target.value)}
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
              {/* <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>●活動年月度</span>
                    <input
                      type="number"
                      min="0"
                      className={`${styles.input_box}`}
                      placeholder='"202109" や "202312" などを入力'
                      value={PropertyYearMonth === null ? "" : PropertyYearMonth}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setPropertyYearMonth(null);
                        } else {
                          const numValue = Number(val);

                          // 入力値がマイナスかチェック
                          if (numValue < 0) {
                            setPropertyYearMonth(0);
                          } else {
                            setPropertyYearMonth(numValue);
                          }
                        }
                      }}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div> */}
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
                      value={PropertyBusinessOffice}
                      onChange={(e) => setPropertyBusinessOffice(e.target.value)}
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
                      value={PropertyMemberName}
                      onChange={(e) => setPropertyMemberName(e.target.value)}
                      onBlur={() => setPropertyMemberName(toHalfWidth(PropertyMemberName.trim()))}
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
