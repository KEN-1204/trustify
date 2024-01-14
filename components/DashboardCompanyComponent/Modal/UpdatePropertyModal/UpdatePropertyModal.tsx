import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import styles from "./UpdatePropertyModal.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import { toast } from "react-toastify";
import useThemeStore from "@/store/useThemeStore";
import { isNaN } from "lodash";
import { useMutateProperty } from "@/hooks/useMutateProperty";
import productCategoriesM from "@/utils/productCategoryM";
import { DatePickerCustomInput } from "@/utils/DatePicker/DatePickerCustomInput";
import { MdClose } from "react-icons/md";
import { useQueryProducts } from "@/hooks/useQueryProducts";
import { SpinnerComet } from "@/components/Parts/SpinnerComet/SpinnerComet";
import { BsChevronLeft } from "react-icons/bs";
import useStore from "@/store";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import { ImInfo } from "react-icons/im";
import { TooltipModal } from "@/components/Parts/Tooltip/TooltipModal";
import { format } from "date-fns";
import { calculateDateToYearMonth } from "@/utils/Helpers/calculateDateToYearMonth";
import { getFiscalQuarterTest } from "@/utils/Helpers/getFiscalQuarterTest";
import { Department, Office, Unit } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { convertToYen } from "@/utils/Helpers/convertToYen";
import Decimal from "decimal.js";
import { ConfirmationModal } from "../SettingAccountModal/SettingCompany/ConfirmationModal/ConfirmationModal";
import { ErrorBoundary } from "react-error-boundary";
import { FallbackSideTableSearchMember } from "../UpdateMeetingModal/SideTableSearchMember/FallbackSideTableSearchMember";
import { SideTableSearchMember } from "../UpdateMeetingModal/SideTableSearchMember/SideTableSearchMember";
import { ErrorFallback } from "@/components/ErrorFallback/ErrorFallback";

type ModalProperties = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

export const UpdatePropertyModal = () => {
  const language = useStore((state) => state.language);
  const selectedRowDataContact = useDashboardStore((state) => state.selectedRowDataContact);
  const selectedRowDataActivity = useDashboardStore((state) => state.selectedRowDataActivity);
  const selectedRowDataProperty = useDashboardStore((state) => state.selectedRowDataProperty);
  const setIsOpenUpdatePropertyModal = useDashboardStore((state) => state.setIsOpenUpdatePropertyModal);
  // const [isLoading, setIsLoading] = useState(false);
  const loadingGlobalState = useDashboardStore((state) => state.loadingGlobalState);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  // const theme = useThemeStore((state) => state.theme);
  // 上画面の選択中の列データ会社
  // const selectedRowDataCompany = useDashboardStore((state) => state.selectedRowDataCompany);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  // 確認モーダル(自社担当名、データ所有者変更確認)
  const [isOpenConfirmationModal, setIsOpenConfirmationModal] = useState<string | null>(null);
  // 自社担当検索サイドテーブル開閉
  const [isOpenSearchMemberSideTable, setIsOpenSearchMemberSideTable] = useState(false);
  // 紹介予定商品、実施商品選択時のドロップダウンメニュー用
  const [modalProperties, setModalProperties] = useState<ModalProperties>();
  // 事業部別製品編集ドロップダウンメニュー
  const [isOpenDropdownMenuFilterProducts, setIsOpenDropdownMenuFilterProducts] = useState(false);
  const [isOpenDropdownMenuFilterProductsArray, setIsOpenDropdownMenuFilterProductsArray] = useState(
    Array(1).fill(false)
  );
  // ドロップダウンメニューの表示位置
  type ClickedItemPos = { displayPos: "up" | "center" | "down"; clickedItemWidth: number | null };
  const [clickedItemPosition, setClickedItemPosition] = useState<ClickedItemPos>({
    displayPos: "down",
    clickedItemWidth: null,
  });

  // モーダルの動的に変化する画面からのx, yとモーダルのwidth, heightを取得
  useEffect(() => {
    if (modalContainerRef.current === null) return console.log("❌無し");
    const rect = modalContainerRef.current.getBoundingClientRect();
    // if (modalProperties !== null && modalProperties?.left === rect.left)
    //   return console.log("✅モーダル位置サイズ格納済み", modalProperties);

    const left = rect.left;
    const top = rect.top;
    const right = rect.right;
    const bottom = rect.bottom;
    const width = rect.width;
    const height = rect.height;

    const payload = { left: left, top: top, right: right, bottom: bottom, width: width, height: height };
    console.log("🔥モーダル位置サイズ格納", payload);
    setModalProperties(payload);
  }, []);

  const initialDate = new Date();
  initialDate.setHours(0, 0, 0, 0);
  const year = initialDate.getFullYear(); // 例: 2023
  const month = initialDate.getMonth() + 1; // getMonth()は0から11で返されるため、+1して1から12に調整
  const PropertyYearMonthInitialValue = `${year}${month < 10 ? "0" + month : month}`; // 月が1桁の場合は先頭に0を追加
  const [currentStatus, setCurrentStatus] = useState("");
  const [propertyName, setPropertyName] = useState("");
  const [propertySummary, setPropertySummary] = useState("");
  const [pendingFlag, setPendingFlag] = useState(false);
  const [rejectedFlag, setRejectedFlag] = useState(false);
  const [productName, setProductName] = useState("");
  const [productSales, setProductSales] = useState<number | null>(null);
  const [expectedOrderDate, setExpectedOrderDate] = useState<Date | null>(null);
  // const [expectedSalesPrice, setExpectedSalesPrice] = useState<number | null>(null);
  const [expectedSalesPrice, setExpectedSalesPrice] = useState<string>(""); //予定売上価格
  const [termDivision, setTermDivision] = useState("");
  const [soldProductName, setSoldProductName] = useState("");
  const [unitSales, setUnitSales] = useState<number | null>(null);
  const [salesContributionCategory, setSalesContributionCategory] = useState("");
  // const [salesPrice, setSalesPrice] = useState<number | null>(null); // 売上価格
  const [salesPrice, setSalesPrice] = useState<string>(""); // 売上価格
  const [discountedPrice, setDiscountedPrice] = useState<number | null>(null);
  // const [discountedRate, setDiscountedRate] = useState<number | null>(null);
  const [discountedRate, setDiscountedRate] = useState<Decimal | null>(null);
  const [salesClass, setSalesClass] = useState("");
  const [expansionDate, setExpansionDate] = useState<Date | null>(null);
  const [expansionQuarterSelectedYear, setExpansionQuarterSelectedYear] = useState<number | null>(null);
  const [expansionQuarterSelectedQuarter, setExpansionQuarterSelectedQuarter] = useState<number | null>(null);
  const [expansionQuarter, setExpansionQuarter] = useState<number | null>(null);
  const [expansionYearMonth, setExpansionYearMonth] = useState<number | null>(null);
  const [salesDate, setSalesDate] = useState<Date | null>(null);
  const [salesQuarterSelectedYear, setSalesQuarterSelectedYear] = useState<number | null>(null);
  const [salesQuarterSelectedQuarter, setSalesQuarterSelectedQuarter] = useState<number | null>(null);
  const [salesQuarter, setSalesQuarter] = useState<number | null>(null);
  const [salesYearMonth, setSalesYearMonth] = useState<number | null>(null);
  const [subscriptionStartDate, setSubscriptionStartDate] = useState<Date | null>(null);
  const [subscriptionCanceledAt, setSubscriptionCanceledAt] = useState<Date | null>(null);
  const [leasingCompany, setLeasingCompany] = useState("");
  const [leaseDivision, setLeaseDivision] = useState("");
  const [leaseExpirationDate, setLeaseExpirationDate] = useState<Date | null>(null);
  const [stepInFlag, setStepInFlag] = useState(false);
  const [repeatFlag, setRepeatFlag] = useState(false);
  const [orderCertaintyStartOfMonth, setOrderCertaintyStartOfMonth] = useState("");
  const [reviewOrderCertainty, setReviewOrderCertainty] = useState("");
  const [competitorAppearanceDate, setCompetitorAppearanceDate] = useState<Date | null>(null);
  const [competitor, setCompetitor] = useState("");
  const [competitorProduct, setCompetitorProduct] = useState("");
  const [reasonClass, setReasonClass] = useState("");
  const [reasonDetail, setReasonDetail] = useState("");
  const [customerBudget, setCustomerBudget] = useState<number | null>(null);
  const [decisionMakerNegotiation, setDecisionMakerNegotiation] = useState("");
  const [PropertyYearMonth, setPropertyYearMonth] = useState<number | null>(Number(PropertyYearMonthInitialValue));
  const [subscriptionInterval, setSubscriptionInterval] = useState("");
  const [competitionState, setCompetitionState] = useState("");
  // const [PropertyDepartment, setPropertyDepartment] = useState(
  //   userProfileState?.department ? userProfileState?.department : ""
  // );
  // const [PropertyBusinessOffice, setPropertyBusinessOffice] = useState(
  //   userProfileState?.office ? userProfileState.office : ""
  // );
  // // 事業部
  // const [departmentId, setDepartmentId] = useState<Department["id"] | null>(
  //   selectedRowDataProperty?.property_created_by_department_of_user
  //     ? selectedRowDataProperty?.property_created_by_department_of_user
  //     : null
  // );
  // // 係
  // const [unitId, setUnitId] = useState<Unit["id"] | null>(
  //   selectedRowDataProperty?.property_created_by_unit_of_user
  //     ? selectedRowDataProperty?.property_created_by_unit_of_user
  //     : null
  // );
  // // 事業所
  // const [officeId, setOfficeId] = useState<Office["id"] | null>(
  //   selectedRowDataProperty?.property_created_by_office_of_user
  //     ? selectedRowDataProperty?.property_created_by_office_of_user
  //     : null
  // );
  // const [PropertyMemberName, setPropertyMemberName] = useState(
  //   userProfileState?.profile_name ? userProfileState.profile_name : ""
  // );
  // =======営業担当データ
  type MemberDetail = {
    memberId: string | null;
    memberName: string | null;
    departmentId: string | null;
    unitId: string | null;
    officeId: string | null;
  };
  // 作成したユーザーのidと名前が初期値
  const initialMemberObj = {
    memberName: selectedRowDataProperty?.property_member_name ? selectedRowDataProperty?.property_member_name : null,
    memberId: selectedRowDataProperty?.property_created_by_user_id
      ? selectedRowDataProperty?.property_created_by_user_id
      : null,
    departmentId: selectedRowDataProperty?.property_created_by_department_of_user
      ? selectedRowDataProperty?.property_created_by_department_of_user
      : null,
    unitId: selectedRowDataProperty?.property_created_by_unit_of_user
      ? selectedRowDataProperty?.property_created_by_unit_of_user
      : null,
    officeId: selectedRowDataProperty?.property_created_by_office_of_user
      ? selectedRowDataProperty?.property_created_by_office_of_user
      : null,
  };
  const [prevMemberObj, setPrevMemberObj] = useState<MemberDetail>(initialMemberObj);
  const [memberObj, setMemberObj] = useState<MemberDetail>(initialMemberObj);
  // =======営業担当データここまで
  // const [propertyDate, setPropertyDate] = useState<Date | null>(initialDate);
  const [propertyDate, setPropertyDate] = useState<Date | null>(
    selectedRowDataProperty && selectedRowDataProperty.property_date
      ? new Date(selectedRowDataProperty.property_date)
      : null
  );

  // ユーザーの決算月と締め日を取得
  const fiscalEndMonthObjRef = useRef<Date | null>(null);
  const closingDayRef = useRef<number | null>(null);

  const queryClient = useQueryClient();
  const { updatePropertyMutation } = useMutateProperty();

  // ============================ 🌟事業部、係、事業所リスト取得useQuery🌟 ============================
  const departmentDataArray: Department[] | undefined = queryClient.getQueryData(["departments"]);
  const unitDataArray: Unit[] | undefined = queryClient.getQueryData(["units"]);
  const officeDataArray: Office[] | undefined = queryClient.getQueryData(["offices"]);
  // ============================ ✅事業部、係、事業所リスト取得useQuery✅ ============================

  // 四半期のselectタグの選択肢 20211, 20214
  const optionsYear = useMemo((): number[] => {
    const startYear = 2010;
    const endYear = new Date().getFullYear() + 1;

    let yearQuarters: number[] = [];

    for (let year = startYear; year <= endYear; year++) {
      // for (let i = 1; i <= 4; i++) {
      //   // const yearQuarter = parseInt(`${year}${i}`, 10); // 20201, 20203
      //   const yearQuarter = parseInt(`${year}`, 10); // 2020, 2020
      //   yearQuarters.push(yearQuarter);
      // }
      const yearQuarter = parseInt(`${year}`, 10); // 2020, 2020
      yearQuarters.push(yearQuarter);
    }
    const sortedYearQuarters = yearQuarters.reverse();
    return sortedYearQuarters;
  }, []);

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

  // 🌟案件発生日付から案件年月度を自動で計算、入力するuseEffect
  useEffect(() => {
    if (!propertyDate || !closingDayRef.current || !fiscalEndMonthObjRef.current) {
      setPropertyYearMonth(null);
      return;
    }
    // 案件発生日付からユーザーの財務サイクルに応じた面談年月度を取得
    const fiscalYearMonth = calculateDateToYearMonth(propertyDate, closingDayRef.current);
    setPropertyYearMonth(fiscalYearMonth);
  }, [propertyDate]);

  // 🌟展開日付から展開年月度、展開四半期を自動で計算、入力するuseEffect
  useEffect(() => {
    // initialDate.setHours(0, 0, 0, 0);
    if (!expansionDate || !closingDayRef.current || !fiscalEndMonthObjRef.current) {
      setExpansionYearMonth(null);
      setExpansionQuarterSelectedYear(null);
      setExpansionQuarterSelectedQuarter(null);
      return;
    }
    // const year = expansionDate.getFullYear(); // 例: 2023
    // const month = expansionDate.getMonth() + 1; // getMonth()は0から11で返されるため、+1して1から12に調整
    // const expansionYearMonthInitialValue = `${year}${month < 10 ? "0" + month : month}`; // 月が1桁の場合は先頭に0を追加
    // console.log("年月日expansionYearMonthInitialValue", expansionYearMonthInitialValue, "expansionDate", expansionDate);
    // if (expansionYearMonthInitialValue) {
    //   setExpansionYearMonth(Number(expansionYearMonthInitialValue));
    // } else {
    //   setExpansionYearMonth(null); // or setResultStartTime('');
    // }
    // 展開日付からユーザーの財務サイクルに応じた展開年月度を取得
    const fiscalYearMonth = calculateDateToYearMonth(expansionDate, closingDayRef.current);
    setExpansionYearMonth(fiscalYearMonth);

    // 四半期を自動で入力
    // 四半期の年部分をセット 日本の場合、年度表示には期初が属す年をあて、米国では、FY表示に期末が属す年をあてる
    // 日本：［2021年4月～2022年3月］を期間とする場合は2021年度
    // アメリカ：［2021年4月～2022年3月］の期間であれば "FY 2022"
    let newExpansionQuarterSelectedYear: number | null;
    if (language === "ja") {
      newExpansionQuarterSelectedYear = initialDate.getFullYear() ?? null;
      setExpansionQuarterSelectedYear(newExpansionQuarterSelectedYear);
    } else {
      newExpansionQuarterSelectedYear = expansionDate.getFullYear() ?? null;
      setExpansionQuarterSelectedYear(newExpansionQuarterSelectedYear);
    }
    // 四半期のQ部分をセット
    // const _expansionFiscalQuarter = getFiscalQuarter(fiscalEndMonthObjRef.current, expansionDate);
    const _expansionFiscalQuarter = getFiscalQuarterTest(fiscalEndMonthObjRef.current, expansionDate);
    console.log("四半期", _expansionFiscalQuarter);
    setExpansionQuarterSelectedQuarter(_expansionFiscalQuarter);
    // 四半期を5桁の数値でセット
    if (!newExpansionQuarterSelectedYear) return;
    const newExpansionQuarter = newExpansionQuarterSelectedYear * 10 + _expansionFiscalQuarter;
    setExpansionQuarter(newExpansionQuarter);
  }, [expansionDate]);

  // 🌟売上日付から売上年月度、売上四半期を自動で計算、入力するuseEffect
  useEffect(() => {
    // initialDate.setHours(0, 0, 0, 0);
    if (!salesDate || !closingDayRef.current || !fiscalEndMonthObjRef.current) {
      setSalesYearMonth(null);
      setSalesQuarterSelectedYear(null);
      setSalesQuarterSelectedQuarter(null);
      return;
    }
    // const year = salesDate.getFullYear(); // 例: 2023
    // const month = salesDate.getMonth() + 1; // getMonth()は0から11で返されるため、+1して1から12に調整
    // const salesYearMonthInitialValue = `${year}${month < 10 ? "0" + month : month}`; // 月が1桁の場合は先頭に0を追加
    // console.log("年月日salesYearMonthInitialValue", salesYearMonthInitialValue, "salesDate", salesDate);
    // if (salesYearMonthInitialValue) {
    //   setSalesYearMonth(Number(salesYearMonthInitialValue));
    // } else {
    //   setSalesYearMonth(null); // or setResultStartTime('');
    // }
    // 面談日付からユーザーの財務サイクルに応じた面談年月度を取得
    const fiscalYearMonth = calculateDateToYearMonth(salesDate, closingDayRef.current);
    setSalesYearMonth(fiscalYearMonth);

    // 四半期を自動で入力
    let newSalesQuarterSelectedYear: number | null;
    if (language === "ja") {
      newSalesQuarterSelectedYear = initialDate.getFullYear() ?? null;
      setSalesQuarterSelectedYear(newSalesQuarterSelectedYear);
    } else {
      newSalesQuarterSelectedYear = salesDate.getFullYear() ?? null;
      setSalesQuarterSelectedYear(newSalesQuarterSelectedYear);
    }
    const _salesFiscalQuarter = getFiscalQuarterTest(fiscalEndMonthObjRef.current, salesDate);
    setSalesQuarterSelectedQuarter(_salesFiscalQuarter);
    // 四半期を5桁の数値でセット
    if (!newSalesQuarterSelectedYear) return;
    const newSalesQuarter = newSalesQuarterSelectedYear * 10 + _salesFiscalQuarter;
    setSalesQuarter(newSalesQuarter);
  }, [salesDate]);
  console.log("展開四半期 年度", expansionQuarterSelectedYear);
  console.log("展開四半期 Q", expansionQuarterSelectedQuarter);
  console.log("展開四半期 ", expansionQuarter);
  console.log("売上四半期 年度", salesQuarterSelectedYear);
  console.log("売上四半期 Q", salesQuarterSelectedQuarter);
  console.log("売上四半期 ", salesQuarter);

  // 初回マウント時に選択中の担当者&会社の列データの情報をStateに格納
  useEffect(() => {
    if (!selectedRowDataProperty) return;

    const selectedInitialPropertyDate = selectedRowDataProperty.property_date
      ? new Date(selectedRowDataProperty.property_date)
      : initialDate;
    const selectedYear = selectedInitialPropertyDate.getFullYear(); // 例: 2023
    const selectedMonth = selectedInitialPropertyDate.getMonth() + 1; // getMonth()は0から11で返されるため、+1して1から12に調整
    const selectedYearMonthInitialValue = `${selectedYear}${selectedMonth < 10 ? "0" + selectedMonth : selectedMonth}`; // 月が1桁の場合は先頭に0を追加

    let _property_created_by_user_id = selectedRowDataProperty.property_created_by_user_id
      ? selectedRowDataProperty.property_created_by_user_id
      : null;
    let _property_created_by_department_of_user = selectedRowDataProperty.property_created_by_department_of_user
      ? selectedRowDataProperty.property_created_by_department_of_user
      : null;
    let _property_created_by_unit_of_user = selectedRowDataProperty.property_created_by_unit_of_user
      ? selectedRowDataProperty.property_created_by_unit_of_user
      : null;
    let _property_created_by_office_of_user = selectedRowDataProperty.property_created_by_office_of_user
      ? selectedRowDataProperty.property_created_by_office_of_user
      : null;
    // let _activity_date = selectedRowDataActivity.activity_date ? new Date(selectedRowDataActivity.activity_date) : null;
    let _current_status = selectedRowDataProperty.current_status ? selectedRowDataProperty.current_status : "";
    let _property_name = selectedRowDataProperty.property_name ? selectedRowDataProperty.property_name : "";
    let _property_summary = selectedRowDataProperty.property_summary ? selectedRowDataProperty.property_summary : "";
    let _pending_flag = selectedRowDataProperty.pending_flag ? selectedRowDataProperty.pending_flag : false;
    let _rejected_flag = selectedRowDataProperty.rejected_flag ? selectedRowDataProperty.rejected_flag : false;
    let _product_name = selectedRowDataProperty.product_name ? selectedRowDataProperty.product_name : "";
    let _product_sales = selectedRowDataProperty.product_sales ? selectedRowDataProperty.product_sales : null;
    let _expected_order_date = selectedRowDataProperty.expected_order_date
      ? new Date(selectedRowDataProperty.expected_order_date)
      : null;
    let _expected_sales_price = selectedRowDataProperty.expected_sales_price
      ? selectedRowDataProperty.expected_sales_price.toLocaleString()
      : null;
    let _term_division = selectedRowDataProperty.term_division ? selectedRowDataProperty.term_division : "";
    let _sold_product_name = selectedRowDataProperty.sold_product_name ? selectedRowDataProperty.sold_product_name : "";
    let _unit_sales = selectedRowDataProperty.unit_sales ? selectedRowDataProperty.unit_sales : null;
    let _sales_contribution_category = selectedRowDataProperty.sales_contribution_category
      ? selectedRowDataProperty.sales_contribution_category
      : "";
    let _sales_price = selectedRowDataProperty.sales_price
      ? selectedRowDataProperty.sales_price.toLocaleString()
      : null;
    let _discounted_price = selectedRowDataProperty.discounted_price ? selectedRowDataProperty.discounted_price : null;
    let _discount_rate = selectedRowDataProperty.discount_rate
      ? new Decimal(selectedRowDataProperty.discount_rate)
      : null;
    let _sales_class = selectedRowDataProperty.sales_class ? selectedRowDataProperty.sales_class : "";
    let _expansion_date = selectedRowDataProperty.expansion_date
      ? new Date(selectedRowDataProperty.expansion_date)
      : null;
    let _sales_date = selectedRowDataProperty.sales_date ? new Date(selectedRowDataProperty.sales_date) : null;
    let _expansion_quarter = selectedRowDataProperty.expansion_quarter
      ? selectedRowDataProperty.expansion_quarter
      : null;
    let _sales_quarter = selectedRowDataProperty.sales_quarter ? selectedRowDataProperty.sales_quarter : null;
    let _subscription_start_date = selectedRowDataProperty.subscription_start_date
      ? new Date(selectedRowDataProperty.subscription_start_date)
      : null;
    let _subscription_canceled_at = selectedRowDataProperty.subscription_canceled_at
      ? new Date(selectedRowDataProperty.subscription_canceled_at)
      : null;
    let _leasing_company = selectedRowDataProperty.leasing_company ? selectedRowDataProperty.leasing_company : "";
    let _lease_division = selectedRowDataProperty.lease_division ? selectedRowDataProperty.lease_division : "";
    let _lease_expiration_date = selectedRowDataProperty.lease_expiration_date
      ? new Date(selectedRowDataProperty.lease_expiration_date)
      : null;
    let _step_in_flag = selectedRowDataProperty.step_in_flag ? selectedRowDataProperty.step_in_flag : false;
    let _repeat_flag = selectedRowDataProperty.repeat_flag ? selectedRowDataProperty.repeat_flag : false;
    let _order_certainty_start_of_month = selectedRowDataProperty.order_certainty_start_of_month
      ? selectedRowDataProperty.order_certainty_start_of_month
      : "";
    let _review_order_certainty = selectedRowDataProperty.review_order_certainty
      ? selectedRowDataProperty.review_order_certainty
      : "";
    let _competitor_appearance_date = selectedRowDataProperty.competitor_appearance_date
      ? new Date(selectedRowDataProperty.competitor_appearance_date)
      : null;
    let _competitor = selectedRowDataProperty.competitor ? selectedRowDataProperty.competitor : "";
    let _competitor_product = selectedRowDataProperty.competitor_product
      ? selectedRowDataProperty.competitor_product
      : "";
    let _reason_class = selectedRowDataProperty.reason_class ? selectedRowDataProperty.reason_class : "";
    let _reason_detail = selectedRowDataProperty.reason_detail ? selectedRowDataProperty.reason_detail : "";
    let _customer_budget = selectedRowDataProperty.customer_budget ? selectedRowDataProperty.customer_budget : null;
    let _decision_maker_negotiation = selectedRowDataProperty.decision_maker_negotiation
      ? selectedRowDataProperty.decision_maker_negotiation
      : "";
    let _expansion_year_month = selectedRowDataProperty.expansion_year_month
      ? selectedRowDataProperty.expansion_year_month
      : null;
    let _sales_year_month = selectedRowDataProperty.sales_year_month ? selectedRowDataProperty.sales_year_month : null;
    let _subscription_interval = selectedRowDataProperty.subscription_interval
      ? selectedRowDataProperty.subscription_interval
      : "";
    let _competition_state = selectedRowDataProperty.competition_state ? selectedRowDataProperty.competition_state : "";
    let _property_year_month = selectedRowDataProperty.property_year_month
      ? selectedRowDataProperty.property_year_month
      : Number(selectedYearMonthInitialValue);
    let _property_department = selectedRowDataProperty.property_created_by_department_of_user
      ? selectedRowDataProperty.property_created_by_department_of_user
      : "";
    let _unit = selectedRowDataProperty.property_created_by_unit_of_user
      ? selectedRowDataProperty.property_created_by_unit_of_user
      : "";
    let _property_business_office = selectedRowDataProperty.property_created_by_office_of_user
      ? selectedRowDataProperty.property_created_by_office_of_user
      : "";
    let _property_member_name = selectedRowDataProperty.property_member_name
      ? selectedRowDataProperty.property_member_name
      : "";
    let _property_date = selectedRowDataProperty.property_date ? new Date(selectedRowDataProperty.property_date) : null;

    setCurrentStatus(_current_status);
    setPropertyName(_property_name);
    setPropertySummary(_property_summary);
    setPendingFlag(_pending_flag);
    setRejectedFlag(_rejected_flag);
    setProductName(_product_name);
    setProductSales(_product_sales);
    setExpectedOrderDate(_expected_order_date);
    setExpectedSalesPrice(_expected_sales_price);
    setTermDivision(_term_division);
    setSoldProductName(_sold_product_name);
    setUnitSales(_unit_sales);
    setSalesContributionCategory(_sales_contribution_category);
    setSalesPrice(_sales_price);
    setDiscountedPrice(_discounted_price);
    setDiscountedRate(_discount_rate);
    setSalesClass(_sales_class);
    setExpansionDate(_expansion_date);
    setSalesDate(_sales_date);
    setExpansionQuarter(_expansion_quarter);
    setSalesQuarter(_sales_quarter);
    setSubscriptionStartDate(_subscription_start_date);
    setSubscriptionCanceledAt(_subscription_canceled_at);
    setLeasingCompany(_leasing_company);
    setLeaseDivision(_lease_division);
    setLeaseExpirationDate(_lease_expiration_date);
    setStepInFlag(_step_in_flag);
    setRepeatFlag(_repeat_flag);
    setOrderCertaintyStartOfMonth(_order_certainty_start_of_month);
    setReviewOrderCertainty(_review_order_certainty);
    setCompetitorAppearanceDate(_competitor_appearance_date);
    setCompetitor(_competitor);
    setCompetitorProduct(_competitor_product);
    setReasonClass(_reason_class);
    setReasonDetail(_reason_detail);
    setCustomerBudget(_customer_budget);
    setDecisionMakerNegotiation(_decision_maker_negotiation);
    setExpansionYearMonth(_expansion_year_month);
    setSalesYearMonth(_sales_year_month);
    setSubscriptionInterval(_subscription_interval);
    setCompetitionState(_competition_state);
    setPropertyYearMonth(_property_year_month);
    // setPropertyDepartment(_property_department);
    // setPropertyBusinessOffice(_property_business_office);
    // setDepartmentId(_property_department);
    // setUnitId(_unit);
    // setOfficeId(_property_business_office);
    // setPropertyMemberName(_property_member_name);
    const memberDetail = {
      memberId: _property_created_by_user_id,
      memberName: _property_member_name,
      departmentId: _property_created_by_department_of_user,
      unitId: _property_created_by_unit_of_user,
      officeId: _property_created_by_office_of_user,
    };
    setMemberObj(memberDetail);
    setPrevMemberObj(memberDetail);
    setPropertyDate(_property_date);
  }, []);

  //   useEffect(() => {
  //     if (!userProfileState) return;
  //     setPropertyMemberName(userProfileState.profile_name ? userProfileState.profile_name : "");
  //     setPropertyBusinessOffice(userProfileState.office ? userProfileState.office : "");
  //     setPropertyDepartment(userProfileState.department ? userProfileState.department : "");
  //   }, []);

  // キャンセルでモーダルを閉じる
  const handleCancelAndReset = () => {
    if (loadingGlobalState) return;
    setIsOpenUpdatePropertyModal(false);
  };
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
    // if (PropertyMemberName === "") return alert("自社担当を入力してください");
    if (memberObj.memberName === "") return alert("自社担当を入力してください");

    setLoadingGlobalState(true);

    // 部署名と事業所名を取得
    const departmentName =
      departmentDataArray &&
      memberObj.memberId &&
      departmentDataArray.find((obj) => obj.id === memberObj.memberId)?.department_name;
    const officeName =
      officeDataArray && memberObj.unitId && officeDataArray.find((obj) => obj.id === memberObj.unitId)?.office_name;

    // 新規作成するデータをオブジェクトにまとめる
    const newProperty = {
      id: selectedRowDataProperty.property_id,
      created_by_company_id: userProfileState?.company_id ? userProfileState.company_id : null,
      // created_by_department_of_user: userProfileState.department ? userProfileState.department : null,
      // created_by_unit_of_user: userProfileState?.unit ? userProfileState.unit : null,
      created_by_user_id: memberObj.memberId ? memberObj.memberId : null,
      created_by_department_of_user: memberObj.departmentId ? memberObj.departmentId : null,
      created_by_unit_of_user: memberObj.unitId ? memberObj.unitId : null,
      created_by_office_of_user: memberObj.officeId ? memberObj.officeId : null,
      // created_by_user_id: userProfileState?.id ? userProfileState.id : null,
      // created_by_department_of_user: departmentId ? departmentId : null,
      // created_by_unit_of_user: unitId ? unitId : null,
      // created_by_office_of_user: officeId ? officeId : null,
      client_contact_id: selectedRowDataProperty.contact_id,
      client_company_id: selectedRowDataProperty.company_id,
      current_status: currentStatus ? currentStatus : null,
      property_name: propertyName ? propertyName : null,
      property_summary: propertySummary ? propertySummary : null,
      pending_flag: pendingFlag,
      rejected_flag: rejectedFlag,
      product_name: productName ? productName : null,
      product_sales: productSales ? productSales : null,
      expected_order_date: expectedOrderDate ? expectedOrderDate.toISOString() : null,
      expected_sales_price: expectedSalesPrice ? parseInt(expectedSalesPrice.replace(/,/g, ""), 10) : null,
      term_division: termDivision ? termDivision : null,
      sold_product_name: soldProductName ? soldProductName : null,
      unit_sales: unitSales ? unitSales : null,
      sales_contribution_category: salesContributionCategory ? salesContributionCategory : null,
      sales_price: salesPrice ? parseInt(salesPrice.replace(/,/g, ""), 10) : null,
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
      property_department: departmentName ? departmentName : null,
      property_business_office: officeName ? officeName : null,
      property_member_name: memberObj?.memberName ? memberObj?.memberName : null,
      property_date: propertyDate ? propertyDate.toISOString() : null,
    };

    console.log("案件 新規作成 newProperty", newProperty);

    // supabaseにINSERT,ローディング終了, モーダルを閉じる
    updatePropertyMutation.mutate(newProperty);

    // setIsLoading(false);

    // モーダルを閉じる
    // setIsOpenUpdatePropertyModal(false);
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

  console.log(
    "面談予定作成モーダル selectedRowDataContact",
    selectedRowDataContact,
    "selectedRowDataActivity",
    selectedRowDataActivity,
    "selectedRowDataProperty",
    selectedRowDataProperty
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
          <div className="min-w-[150px] select-none font-bold">案件 編集</div>

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
                      {/* <option value="">ステータスを選択してください</option> */}
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
                    <AiOutlineQuestionCircle className={`pointer-events-none text-[var(--color-text-brand-f)]`} />
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
                    <AiOutlineQuestionCircle className={`pointer-events-none text-[var(--color-text-brand-f)]`} />
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
                    <AiOutlineQuestionCircle className={`pointer-events-none text-[var(--color-text-brand-f)]`} />
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
                    <AiOutlineQuestionCircle className={`pointer-events-none text-[var(--color-text-brand-f)]`} />
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
                  <span className={`${styles.title} !min-w-[140px] ${styles.required_title}`}>●案件名</span>
                  <input
                    type="text"
                    placeholder="案件名を入力してください"
                    required
                    className={`${styles.input_box} ${styles.full_width}`}
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
              {/* 台数 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>台数</span>
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
                    <span className={`${styles.title} !min-w-[140px] ${styles.required_title}`}>●獲得予定時期</span>
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
                    {/* <span className={`${styles.title} !min-w-[140px]`}>予定売上価格</span> */}
                    <div
                      className={`relative flex !min-w-[140px] items-center ${styles.title} hover:text-[var(--color-text-brand-f)]`}
                      onMouseEnter={(e) =>
                        handleOpenTooltip({
                          e: e,
                          display: "top",
                          content: "円単位でデータを管理します。",
                          content2: "600万円と入力しても円単位に自動補完されます。",
                          // marginTop: 57,
                          // marginTop: 39,
                          marginTop: 10,
                          itemsPosition: "center",
                          whiteSpace: "nowrap",
                        })
                      }
                      onMouseLeave={handleCloseTooltip}
                    >
                      <div className={`mr-[8px] flex flex-col text-[15px]`}>
                        <span className={``}>予定</span>
                        <span className={``}>売上価格(円)</span>
                      </div>
                      <ImInfo className={`min-h-[16px] min-w-[16px] text-[var(--color-text-brand-f)]`} />
                    </div>
                    {/* <input
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
                    {expectedSalesPrice !== null && expectedSalesPrice !== 0 && (
                      <div className={`${styles.close_btn_number}`} onClick={() => setExpectedSalesPrice(null)}>
                        <MdClose className="text-[20px] " />
                      </div>
                    )} */}
                    <input
                      type="text"
                      placeholder="例：600万円 → 6000000　※半角で入力"
                      className={`${styles.input_box}`}
                      value={!!expectedSalesPrice ? expectedSalesPrice : ""}
                      onChange={(e) => setExpectedSalesPrice(e.target.value)}
                      onBlur={() =>
                        setExpectedSalesPrice(
                          !!expectedSalesPrice && expectedSalesPrice !== ""
                            ? (convertToYen(expectedSalesPrice.trim()) as number).toLocaleString()
                            : ""
                        )
                      }
                    />
                    {/* バツボタン */}
                    {expectedSalesPrice !== "" && (
                      <div className={`${styles.close_btn_number}`} onClick={() => setExpectedSalesPrice("")}>
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
                    {/* <span className={`${styles.title} !min-w-[140px]`}>売上価格</span> */}
                    <div
                      className={`relative flex !min-w-[140px] items-center ${styles.title} hover:text-[var(--color-text-brand-f)]`}
                      onMouseEnter={(e) =>
                        handleOpenTooltip({
                          e: e,
                          display: "top",
                          content: "円単位でデータを管理します。",
                          content2: "600万円と入力しても円単位に自動補完されます。",
                          // marginTop: 57,
                          marginTop: 39,
                          // marginTop: 10,
                          itemsPosition: "center",
                          whiteSpace: "nowrap",
                        })
                      }
                      onMouseLeave={handleCloseTooltip}
                    >
                      <span className={`mr-[8px] `}>売上価格(円)</span>
                      <ImInfo className={`min-h-[16px] min-w-[16px] text-[var(--color-text-brand-f)]`} />
                    </div>
                    <input
                      type="text"
                      placeholder="例：600万円 → 6000000　※半角で入力"
                      className={`${styles.input_box}`}
                      value={!!salesPrice ? salesPrice : ""}
                      onChange={(e) => setSalesPrice(e.target.value)}
                      onBlur={() =>
                        setSalesPrice(
                          !!salesPrice && salesPrice !== ""
                            ? (convertToYen(salesPrice.trim()) as number).toLocaleString()
                            : ""
                        )
                      }
                    />
                    {/* バツボタン */}
                    {salesPrice !== "" && (
                      <div className={`${styles.close_btn_number}`} onClick={() => setSalesPrice("")}>
                        <MdClose className="text-[20px] " />
                      </div>
                    )}
                    {/* <input
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
                    {salesPrice !== null && salesPrice !== 0 && (
                      <div className={`${styles.close_btn_number}`} onClick={() => setSalesPrice(null)}>
                        <MdClose className="text-[20px] " />
                      </div>
                    )} */}
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
                    <span className={`${styles.title} !min-w-[140px]`}>値引率(%)</span>
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
                          content: "展開四半期は決算日の翌日(期首)から1ヶ月間を財務サイクルとして計算しています。",
                          content2: fiscalEndMonthObjRef.current
                            ? `お客様の決算日は、現在${format(
                                fiscalEndMonthObjRef.current,
                                "M月d日"
                              )}に設定されています。`
                            : `決算月が未設定の場合は、デフォルトで3月31日が決算日として設定されます。`,
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
                      // onBlur={() => setDepartmentName(toHalfWidth(departmentName.trim()))}
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
                      {optionsYear.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                      {/* {selectOptionsYear.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))} */}
                    </select>

                    <span className="mx-[10px] min-w-max">年度</span>

                    <select
                      className={`ml-auto h-full w-[60%] cursor-pointer rounded-[4px] ${styles.select_box}`}
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

                    <span className="mx-[10px]">Q</span>
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
                          content: "売上四半期は決算日の翌日(期首)から1ヶ月間を財務サイクルとして計算しています。",
                          content2: fiscalEndMonthObjRef.current
                            ? `お客様の決算日は、現在${format(
                                fiscalEndMonthObjRef.current,
                                "M月d日"
                              )}に設定されています。`
                            : `決算月が未設定の場合は、デフォルトで3月31日が決算日として設定されます。`,
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
                    {/* <input
                      type="text"
                      placeholder="20231Q、20232Q、20233Q、20234Qなど"
                      required
                      className={`${styles.input_box}`}
                      value={salesQuarter}
                      onChange={(e) => setSalesQuarter(e.target.value)}
                      // onBlur={() => setDepartmentName(toHalfWidth(departmentName.trim()))}
                    /> */}
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      placeholder="時"
                      value={salesQuarterSelectedYear ? salesQuarterSelectedYear : ""}
                      onChange={(e) =>
                        setSalesQuarterSelectedYear(e.target.value === "" ? null : Number(e.target.value))
                      }
                    >
                      <option value=""></option>
                      {optionsYear.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>

                    <span className="mx-[10px] min-w-max">年度</span>

                    <select
                      className={`ml-auto h-full w-[60%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      placeholder="分"
                      value={salesQuarterSelectedQuarter ? salesQuarterSelectedQuarter : ""}
                      onChange={(e) =>
                        setSalesQuarterSelectedQuarter(e.target.value === "" ? null : Number(e.target.value))
                      }
                    >
                      <option value=""></option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>

                    <span className="mx-[10px]">Q</span>
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
                          content: "展開年月度は決算日の翌日(期首)から1ヶ月間を財務サイクルとして計算しています。",
                          content2: !!fiscalEndMonthObjRef.current
                            ? `展開日を選択することで展開年月度は自動計算されるため入力は不要です。`
                            : `決算日が未設定の場合は、デフォルトで3月31日が決算日として設定されます。`,
                          content3:
                            "決算日の変更はダッシュボード右上のアカウント設定の「会社・チーム」から変更可能です。",
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
                      className={`${styles.input_box} pointer-events-none`}
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
                    {/* {expansionYearMonth !== null && expansionYearMonth !== 0 && (
                      <div className={`${styles.close_btn_number}`} onClick={() => setExpansionYearMonth(null)}>
                        <MdClose className="text-[20px] " />
                      </div>
                    )} */}
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
                          content: "展開年月度は決算日の翌日(期首)から1ヶ月間を財務サイクルとして計算しています。",
                          content2: !!fiscalEndMonthObjRef.current
                            ? `展開日を選択することで展開年月度は自動計算されるため入力は不要です。`
                            : `決算日が未設定の場合は、デフォルトで3月31日が決算日として設定されます。`,
                          content3:
                            "決算日の変更はダッシュボード右上のアカウント設定の「会社・チーム」から変更可能です。",
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
                      className={`${styles.input_box} pointer-events-none`}
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
                    {/* {salesYearMonth !== null && salesYearMonth !== 0 && (
                      <div className={`${styles.close_btn_number}`} onClick={() => setSalesYearMonth(null)}>
                        <MdClose className="text-[20px] " />
                      </div>
                    )} */}
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
                    <div className={`${styles.grid_select_cell_header}`}>
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
                    {/* <span className={`${styles.title} !min-w-[140px] ${styles.required_title}`}>●案件年月度</span> */}
                    <div
                      className={`relative flex !min-w-[140px] items-center ${styles.title}  ${styles.required_title} hover:text-[var(--color-text-brand-f)]`}
                      onMouseEnter={(e) =>
                        handleOpenTooltip({
                          e: e,
                          display: "top",
                          content: "案件年月度は決算日の翌日(期首)から1ヶ月間を財務サイクルとして計算しています。",
                          content2: !!fiscalEndMonthObjRef.current
                            ? `案件日を選択することで案件年月度は自動計算されるため入力は不要です。`
                            : `決算日が未設定の場合は、デフォルトで3月31日が決算日として設定されます。`,
                          content3:
                            "決算日の変更はダッシュボード右上のアカウント設定の「会社・チーム」から変更可能です。",
                          marginTop: 57,
                          itemsPosition: "center",
                          whiteSpace: "nowrap",
                        })
                      }
                      onMouseLeave={handleCloseTooltip}
                    >
                      <span className={`mr-[9px]`}>●案件年月度</span>
                      <ImInfo className={`min-h-[16px] min-w-[16px] text-[var(--color-text-brand-f)]`} />
                    </div>
                    <input
                      type="number"
                      min="0"
                      className={`${styles.input_box} pointer-events-none`}
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
                    {/* {PropertyYearMonth !== null && PropertyYearMonth !== 0 && (
                      <div className={`${styles.close_btn_number}`} onClick={() => setPropertyYearMonth(null)}>
                        <MdClose className="text-[20px] " />
                      </div>
                    )} */}
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
                    <select
                      className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                      // value={departmentId ? departmentId : ""}
                      // onChange={(e) => setDepartmentId(e.target.value)}
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
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>
            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 係・チーム */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} `}>係・チーム</span>
                    <select
                      className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                      // value={unitId ? unitId : ""}
                      // onChange={(e) => setUnitId(e.target.value)}
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
                    <select
                      className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                      // value={officeId ? officeId : ""}
                      // onChange={(e) => setOfficeId(e.target.value)}
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
                      // value={PropertyMemberName}
                      // onChange={(e) => setPropertyMemberName(e.target.value)}
                      // onBlur={() => setPropertyMemberName(toHalfWidth(PropertyMemberName.trim()))}
                      value={memberObj.memberName ? memberObj.memberName : ""}
                      onChange={(e) => {
                        setMemberObj({ ...memberObj, memberName: e.target.value });
                      }}
                      onKeyUp={() => {
                        if (prevMemberObj.memberName !== memberObj.memberName) {
                          // alert("自社担当名が元のデータと異なります。データの所有者を変更しますか？");
                          // setMeetingMemberName(selectedRowDataMeeting.meeting_member_name);
                          setIsOpenConfirmationModal("change_member");
                          return;
                        }
                      }}
                      onBlur={() => {
                        if (!memberObj.memberName) return;
                        // setMeetingMemberName(toHalfWidthAndSpace(meetingMemberName.trim()));
                        setMemberObj({ ...memberObj, memberName: toHalfWidthAndSpace(memberObj.memberName.trim()) });
                      }}
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

      {/* 「自社担当」変更確認モーダル */}
      {isOpenConfirmationModal === "change_member" && (
        <ConfirmationModal
          clickEventClose={() => {
            // setMeetingMemberName(selectedRowDataMeeting?.meeting_member_name ?? "");
            setMemberObj(prevMemberObj);
            setIsOpenConfirmationModal(null);
          }}
          // titleText="面談データの自社担当を変更してもよろしいですか？"
          titleText={`データの所有者を変更してもよろしいですか？`}
          // titleText2={`データの所有者を変更しますか？`}
          sectionP1="「自社担当」「事業部」「係・チーム」「事業所」を変更すると案件データの所有者が変更されます。"
          sectionP2="注：データの所有者を変更すると、この案件結果は変更先のメンバーの集計結果に移行され、分析結果が変更されます。"
          cancelText="戻る"
          submitText="変更する"
          clickEventSubmit={() => {
            // setMemberObj(prevMemberObj);
            setIsOpenConfirmationModal(null);
            setIsOpenSearchMemberSideTable(true);
          }}
        />
      )}

      {/* 「自社担当」変更サイドテーブル */}
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense
          fallback={<FallbackSideTableSearchMember isOpenSearchMemberSideTable={isOpenSearchMemberSideTable} />}
        >
          <SideTableSearchMember
            isOpenSearchMemberSideTable={isOpenSearchMemberSideTable}
            setIsOpenSearchMemberSideTable={setIsOpenSearchMemberSideTable}
            // currentMemberId={selectedRowDataMeeting?.meeting_created_by_user_id ?? ""}
            // currentMemberName={selectedRowDataMeeting?.meeting_member_name ?? ""}
            // currentMemberDepartmentId={selectedRowDataMeeting?.meeting_created_by_department_of_user ?? null}
            // setChangedMemberObj={setChangedMemberObj}
            // currentMemberId={memberObj.memberId ?? ""}
            // currentMemberName={memberObj.memberName ?? ""}
            // currentMemberDepartmentId={memberObj.departmentId ?? null}
            prevMemberObj={prevMemberObj}
            setPrevMemberObj={setPrevMemberObj}
            memberObj={memberObj}
            setMemberObj={setMemberObj}
            // setMeetingMemberName={setMeetingMemberName}
          />
        </Suspense>
      </ErrorBoundary>
    </>
  );
};
