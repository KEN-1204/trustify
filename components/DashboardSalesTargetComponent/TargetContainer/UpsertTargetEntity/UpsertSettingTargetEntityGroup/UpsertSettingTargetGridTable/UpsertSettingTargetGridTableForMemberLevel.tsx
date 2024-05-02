import {
  CSSProperties,
  Dispatch,
  SetStateAction,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "../../../../DashboardSalesTargetComponent.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import {
  columnHeaderListTarget,
  formatColumnName,
  formatRowName,
  formatRowNameShort,
  rowHeaderListTarget,
} from "../UpsertSettingTargetEntityGroup";
import { ProgressCircle } from "@/components/Parts/Charts/ProgressCircle/ProgressCircle";
import { ProgressNumber } from "@/components/Parts/Charts/ProgressNumber/ProgressNumber";
import { SparkChart } from "@/components/Parts/Charts/SparkChart/SparkChart";
import useStore from "@/store";
import { formatDisplayPrice } from "@/utils/Helpers/formatDisplayPrice";
import { isValidNumber } from "@/utils/Helpers/isValidNumber";
import { checkNotFalsyExcludeZero } from "@/utils/Helpers/checkNotFalsyExcludeZero";
import { convertToYen } from "@/utils/Helpers/convertToYen";
import { calculateYearOverYear } from "@/utils/Helpers/PercentHelpers/calculateYearOverYear";
import { TbSnowflake, TbSnowflakeOff } from "react-icons/tb";
import {
  Department,
  EntityInputSalesTargetObj,
  FiscalYearMonthObjForTarget,
  InputSalesTargets,
  MemberAccounts,
  Office,
  SalesSummaryHalfDetails,
  SalesSummaryYearHalf,
  SalesTargetUpsertColumns,
  SalesTargetsHalfDetails,
  Section,
  SparkChartObj,
  TotalSalesTargetsHalfDetailsObj,
  Unit,
  inputSalesData,
} from "@/types";
import { useQuerySalesSummaryAndGrowth } from "@/hooks/useQuerySalesSummaryAndGrowth";
import { toast } from "react-toastify";
import Decimal from "decimal.js";
import { cloneDeep } from "lodash";
import { HiOutlineSwitchHorizontal } from "react-icons/hi";
import { useQueryClient } from "@tanstack/react-query";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { SpinnerX } from "@/components/Parts/SpinnerX/SpinnerX";
import { FallbackScrollContainer } from "../../../SalesTargetsContainer/SalesTargetGridTable/FallbackScrollContainer";
import { generateMonthHeaders } from "@/utils/Helpers/CalendarHelpers/generateMonthHeaders";
import { mappingMonthEnToJa, mappingMonthToAbbreviation } from "@/utils/mappings";
import { zenkakuToHankaku } from "@/utils/Helpers/zenkakuToHankaku";
import { ImInfo } from "react-icons/im";
import { useQuerySalesSummaryAndGrowthHalfDetails } from "@/hooks/useQuerySalesSummaryAndGrowthHalfDetails";
import { parseDecimal } from "@/utils/Helpers/Currency/parseDecimal";
import { BsCheck2 } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import { formatToJapaneseYen } from "@/utils/Helpers/formatToJapaneseYen";

/**
 *   "period_type",
  "sales_target",
  "share",
  "yoy_growth",
  "yo2y_growth",
  "last_year_sales",
  "two_years_ago_sales",
  "three_years_ago_sales",
  "sales_trend",
 */

type Props = {
  entityLevel: string;
  entityNameTitle: string;
  entityId: string;
  parentEntityLevel?: string;
  parentEntityId?: string;
  parentEntityNameTitle?: string;
  stickyRow: string | null;
  setStickyRow: Dispatch<SetStateAction<string | null>>;
  annualFiscalMonths: FiscalYearMonthObjForTarget | null;
  fetchEnabled?: boolean; // メイン目標でない場合はfetchEnabledがtrueに変更されたらフェッチを許可する
  onFetchComplete?: () => void;
  saveEnabled?: boolean;
  onSaveComplete?: () => void;
  allSaved: boolean;
  // subTargetList?: Department[] | Section[] | Unit[] | Office[] | MemberAccounts[];
  // setSubTargetList?: Dispatch<SetStateAction<Department[] | Section[] | Unit[] | Office[] | MemberAccounts[]>>;
};

const UpsertSettingTargetGridTableForMemberLevelMemo = ({
  entityLevel,
  entityNameTitle,
  entityId,
  parentEntityLevel,
  parentEntityId,
  parentEntityNameTitle,
  stickyRow,
  setStickyRow,
  // fiscalYearMonthsForThreeYear,
  annualFiscalMonths,
  fetchEnabled,
  onFetchComplete,
  saveEnabled,
  onSaveComplete,
  allSaved,
}: // subTargetList,
// setSubTargetList,
// startYearMonth,
// endYearMonth,
Props) => {
  const queryClient = useQueryClient();
  // const supabase = useSupabaseClient();
  const language = useStore((state) => state.language);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  // const upsertTargetObj = useDashboardStore((state) => state.upsertTargetObj);
  const upsertSettingEntitiesObj = useDashboardStore((state) => state.upsertSettingEntitiesObj);

  // 部門別の「半期」の目標金額の合計値
  const totalInputSalesTargetsHalfDetails = useDashboardStore((state) => state.totalInputSalesTargetsHalfDetails);
  const setTotalInputSalesTargetsHalfDetails = useDashboardStore((state) => state.setTotalInputSalesTargetsHalfDetails);

  // 全てのメンバーの月次目標の入力完了状態と月次合計とQ1, Q2の総合目標が一致しているかを保持するstate
  const monthTargetStatusMapForAllMembers = useDashboardStore((state) => state.monthTargetStatusMapForAllMembers);
  const setMonthTargetStatusMapForAllMembers = useDashboardStore((state) => state.setMonthTargetStatusMapForAllMembers);

  // 🔸ユーザーの年度初めから12ヶ月分の年月度の配列
  // const annualFiscalMonths = useDashboardStore((state) => state.annualFiscalMonths);
  // 🔹現在の顧客の会計年月度 202303
  const currentFiscalStartYearMonth = useDashboardStore((state) => state.currentFiscalStartYearMonth);

  // メンバーレベル設定時の上期詳細か下期詳細
  const selectedPeriodTypeForMemberLevel = useDashboardStore((state) => state.selectedPeriodTypeForMemberLevel);

  const [isLoading, setIsLoading] = useState(false);

  if (
    !upsertSettingEntitiesObj ||
    !userProfileState ||
    !userProfileState.company_id ||
    !currentFiscalStartYearMonth ||
    !annualFiscalMonths
  ) {
    alert("予期せぬエラーが発生しました。エラー: UST100");
    return;
  }

  // 親エンティティレベルとIdが取得できているかを確認する
  if (!parentEntityLevel || !parentEntityId) {
    return;
  }

  // 🔸ヘッダーに表示する会計月度の12ヶ月分の配列 ユーザーの年度初めが開始月度
  const fiscalStartMonthsArray = useMemo(
    () => generateMonthHeaders(Number(annualFiscalMonths.month_01.toString().slice(-2))),
    // () => generateMonthHeaders(Number(currentFiscalStartYearMonth.toString().slice(-2))),
    [annualFiscalMonths]
    // [currentFiscalStartYearMonth]
  );

  // --------------------- 🌟メイン目標の「半期」売上目標をキャッシュから取得🌟 ---------------------
  const salesTargetsHalfDetails: SalesTargetsHalfDetails | null | undefined = queryClient.getQueryData([
    "sales_target_main_half_details",
    parentEntityLevel,
    parentEntityId,
    selectedPeriodTypeForMemberLevel, // "first_half_details" | "second_half_details"
    upsertSettingEntitiesObj.fiscalYear,
  ]);
  // --------------------- 🌟メイン目標の「半期」売上目標をキャッシュから取得🌟 ---------------------

  // --------------------- 🌟過去3年分の売上と前年度の前年伸び率実績を取得するuseQuery🌟 ---------------------
  const {
    data: salesSummaryRowData,
    error: salesSummaryError,
    isLoading: isLoadingQuery,
    isSuccess: isSuccessQuery,
    isError: isErrorQuery,
  } = useQuerySalesSummaryAndGrowthHalfDetails({
    companyId: userProfileState.company_id,
    entityLevel: entityLevel,
    entityId: entityId,
    periodType: selectedPeriodTypeForMemberLevel, // first_half_details or second_half_details
    fiscalYear: upsertSettingEntitiesObj.fiscalYear,
    annualFiscalMonths: annualFiscalMonths,
    fetchEnabled: fetchEnabled && !!salesTargetsHalfDetails, // fetchEnabledがtrue、かつ、メインの「半期」売上目標が取得できてからフェッチを行う
    fiscalStartMonthsArray: fiscalStartMonthsArray,
  });

  // period_typeをキーとしてsalesSummaryRowDataの値にアクセスするMapオブジェクト
  const mapSalesSummaryRowPeriodTypeToObj = useMemo(() => {
    if (!salesSummaryRowData) return null;
    const newMap = new Map(salesSummaryRowData.map((row) => [row.period_type, row]));
    return newMap;
  }, [salesSummaryRowData]);
  // --------------------- 🌟過去3年分の売上と前年度の前年伸び率実績を取得するuseQuery🌟 ここまで ---------------------

  // -------------- 🌠useQueryでフェッチが完了後、完了通知で次のテーブルのuseQueryフェッチを許可🌠 --------------
  useEffect(() => {
    if (isSuccessQuery || isErrorQuery) {
      if (onFetchComplete) onFetchComplete();
    }
  }, [isSuccessQuery, isErrorQuery]);
  // -------------- 🌠useQueryでフェッチが完了後、完了通知で次のテーブルのuseQueryフェッチを許可🌠 --------------

  // ---------------- ローカルstate ----------------
  // 売上目標input 「年度・上半期・下半期」
  //   const [inputSalesTargetYear, setInputSalesTargetYear] = useState("");
  //   const [inputSalesTargetHalf, setInputSalesTargetHalf] = useState("");
  //   const [inputSalesTargetSecondHalf, setInputSalesTargetSecondHalf] = useState("");

  // 「上期、Q1, Q2」を「年度・上半期・下半期」のシェアの関係と一致させる 入力値も上半期とQ1でQ2は自動計算にする
  // 「Q1, month01~month03」「Q2, month04~month06」も同様にグループで入力値を連携させる

  // 🔸「上期・Q1, Q2・month_01~month_06」
  const [inputSalesTargetHalf, setInputSalesTargetHalf] = useState("");
  const [inputSalesTargetFirstQuarter, setInputSalesTargetFirstQuarter] = useState("");
  const [inputSalesTargetSecondQuarter, setInputSalesTargetSecondQuarter] = useState("");
  const [inputSalesTargetMonth01, setInputSalesTargetMonth01] = useState("");
  const [inputSalesTargetMonth02, setInputSalesTargetMonth02] = useState("");
  const [inputSalesTargetMonth03, setInputSalesTargetMonth03] = useState("");
  const [inputSalesTargetMonth04, setInputSalesTargetMonth04] = useState("");
  const [inputSalesTargetMonth05, setInputSalesTargetMonth05] = useState("");
  const [inputSalesTargetMonth06, setInputSalesTargetMonth06] = useState("");
  // 🔸前年比input 「上期・Q1, Q2・month_01~month_06」
  const [inputYoYGrowthHalf, setInputYoYGrowthHalf] = useState<string>("");
  const [inputYoYGrowthFirstQuarter, setInputYoYGrowthFirstQuarter] = useState("");
  const [inputYoYGrowthSecondQuarter, setInputYoYGrowthSecondQuarter] = useState("");
  const [inputYoYGrowthMonth01, setInputYoYGrowthMonth01] = useState("");
  const [inputYoYGrowthMonth02, setInputYoYGrowthMonth02] = useState("");
  const [inputYoYGrowthMonth03, setInputYoYGrowthMonth03] = useState("");
  const [inputYoYGrowthMonth04, setInputYoYGrowthMonth04] = useState("");
  const [inputYoYGrowthMonth05, setInputYoYGrowthMonth05] = useState("");
  const [inputYoYGrowthMonth06, setInputYoYGrowthMonth06] = useState("");
  // 🔸上期のシェア
  const [shareHalfYear, setShareHalfYear] = useState<number>(0);
  // 🔸上期：Q1~Q2のシェア(上期は100%のため不要)
  const [shareFirstQuarter, setShareFirstQuarter] = useState<number>(0);
  const [shareSecondQuarter, setShareSecondQuarter] = useState<number>(0);
  // 🔸上期：month01~month06のシェア
  const [shareMonth01, setShareMonth01] = useState<number>(0);
  const [shareMonth02, setShareMonth02] = useState<number>(0);
  const [shareMonth03, setShareMonth03] = useState<number>(0);
  const [shareMonth04, setShareMonth04] = useState<number>(0);
  const [shareMonth05, setShareMonth05] = useState<number>(0);
  const [shareMonth06, setShareMonth06] = useState<number>(0);

  // ------------------------------------------------------------------------------------
  // // 「下期・Q3, Q4・month_07~month_12」
  // const [inputSalesTargetSecondHalf, setInputSalesTargetSecondHalf] = useState("");
  // const [inputSalesTargetThirdQuarter, setInputSalesTargetThirdQuarter] = useState("");
  // const [inputSalesTargetFourthQuarter, setInputSalesTargetFourthQuarter] = useState("");
  // const [inputSalesTargetMonth07, setInputSalesTargetMonth07] = useState("");
  // const [inputSalesTargetMonth08, setInputSalesTargetMonth08] = useState("");
  // const [inputSalesTargetMonth09, setInputSalesTargetMonth09] = useState("");
  // const [inputSalesTargetMonth10, setInputSalesTargetMonth10] = useState("");
  // const [inputSalesTargetMonth11, setInputSalesTargetMonth11] = useState("");
  // const [inputSalesTargetMonth12, setInputSalesTargetMonth12] = useState("");
  // // 前年比input 「下期・Q3, Q4・month_07~month_12」
  // const [inputYoYGrowthSecondHalf, setInputYoYGrowthSecondHalf] = useState<string>("");
  // const [inputYoYGrowthThirdQuarter, setInputYoYGrowthThirdQuarter] = useState("");
  // const [inputYoYGrowthFourthQuarter, setInputYoYGrowthFourthQuarter] = useState("");
  // const [inputYoYGrowthMonth07, setInputYoYGrowthMonth07] = useState("");
  // const [inputYoYGrowthMonth08, setInputYoYGrowthMonth08] = useState("");
  // const [inputYoYGrowthMonth09, setInputYoYGrowthMonth09] = useState("");
  // const [inputYoYGrowthMonth10, setInputYoYGrowthMonth10] = useState("");
  // const [inputYoYGrowthMonth11, setInputYoYGrowthMonth11] = useState("");
  // const [inputYoYGrowthMonth12, setInputYoYGrowthMonth12] = useState("");
  // // 下期：Q3~Q4のシェア(下期は100%のため不要)
  // const [shareThirdQuarter, setShareThirdQuarter] = useState<number>(0);
  // const [shareFourthQuarter, setShareFourthQuarter] = useState<number>(0);
  // // Q3：month07~month09のシェア(Q3は100%のため不要)
  // const [shareMonth07, setShareMonth07] = useState<number>(0);
  // const [shareMonth08, setShareMonth08] = useState<number>(0);
  // const [shareMonth09, setShareMonth09] = useState<number>(0);
  // // Q4：month10~month12のシェア(Q4は100%のため不要)
  // const [shareMonth10, setShareMonth10] = useState<number>(0);
  // const [shareMonth11, setShareMonth11] = useState<number>(0);
  // const [shareMonth12, setShareMonth12] = useState<number>(0);

  // 🔸上期詳細と下期詳細でperiodTypeの値を動的に変更する
  const periodTypeNames = {
    half_year: selectedPeriodTypeForMemberLevel === "first_half_details" ? "half_year" : "half_year",
    first_quarter: selectedPeriodTypeForMemberLevel === "first_half_details" ? "first_quarter" : "first_quarter",
    second_quarter: selectedPeriodTypeForMemberLevel === "first_half_details" ? "second_quarter" : "second_quarter",
    month_01: selectedPeriodTypeForMemberLevel === "first_half_details" ? "month_01" : "month_01",
    month_02: selectedPeriodTypeForMemberLevel === "first_half_details" ? "month_02" : "month_02",
    month_03: selectedPeriodTypeForMemberLevel === "first_half_details" ? "month_03" : "month_03",
    month_04: selectedPeriodTypeForMemberLevel === "first_half_details" ? "month_04" : "month_04",
    month_05: selectedPeriodTypeForMemberLevel === "first_half_details" ? "month_05" : "month_05",
    month_06: selectedPeriodTypeForMemberLevel === "first_half_details" ? "month_06" : "month_06",
    // half: selectedPeriodTypeForMemberLevel === "first_half_details" ? "first_half" : "second_half",
    // quarter1: selectedPeriodTypeForMemberLevel === "first_half_details" ? "first_quarter" : "third_quarter",
    // quarter2: selectedPeriodTypeForMemberLevel === "first_half_details" ? "second_quarter" : "fourth_quarter",
    // month01: selectedPeriodTypeForMemberLevel === "first_half_details" ? "month_01" : "month_07",
    // month02: selectedPeriodTypeForMemberLevel === "first_half_details" ? "month_02" : "month_08",
    // month03: selectedPeriodTypeForMemberLevel === "first_half_details" ? "month_03" : "month_09",
    // month04: selectedPeriodTypeForMemberLevel === "first_half_details" ? "month_04" : "month_10",
    // month05: selectedPeriodTypeForMemberLevel === "first_half_details" ? "month_05" : "month_11",
    // month06: selectedPeriodTypeForMemberLevel === "first_half_details" ? "month_06" : "month_12",
  };

  // 🔸売上推移(「上期・Q1, Q2・month_01~month_06」)
  // 🔸H1
  const [salesTrendsHalf, setSalesTrendsHalf] = useState<(SparkChartObj & { updateAt: number }) | null>(() => {
    if (!salesSummaryRowData) return null;
    const initialData = mapSalesSummaryRowPeriodTypeToObj?.get("half_year")?.sales_trend ?? null;
    // salesSummaryRowData.find((obj) => obj.period_type === periodTypeNames.half_year)?.sales_trend ?? null;
    return initialData ? { ...initialData, updateAt: Date.now() } : null;
  });
  // 🔸Q1
  const [salesTrendsFirstQuarter, setSalesTrendsFirstQuarter] = useState<(SparkChartObj & { updateAt: number }) | null>(
    () => {
      if (!salesSummaryRowData) return null;
      const initialData = mapSalesSummaryRowPeriodTypeToObj?.get("first_quarter")?.sales_trend ?? null;
      // salesSummaryRowData.find((obj) => obj.period_type === periodTypeNames.first_quarter)?.sales_trend ?? null;
      return initialData ? { ...initialData, updateAt: Date.now() } : null;
    }
  );
  // 🔸Q2
  const [salesTrendsSecondQuarter, setSalesTrendsSecondQuarter] = useState<
    (SparkChartObj & { updateAt: number }) | null
  >(() => {
    if (!salesSummaryRowData) return null;
    const initialData = mapSalesSummaryRowPeriodTypeToObj?.get("second_quarter")?.sales_trend ?? null;
    // salesSummaryRowData.find((obj) => obj.period_type === periodTypeNames.second_quarter)?.sales_trend ?? null;
    return initialData ? { ...initialData, updateAt: Date.now() } : null;
  });
  // 🔸month_01
  const [salesTrendsMonth01, setSalesTrendsMonth01] = useState<(SparkChartObj & { updateAt: number }) | null>(() => {
    if (!salesSummaryRowData) return null;
    const initialData = mapSalesSummaryRowPeriodTypeToObj?.get("month_01")?.sales_trend ?? null;
    // salesSummaryRowData.find((obj) => obj.period_type === periodTypeNames.month_01)?.sales_trend ?? null;
    return initialData ? { ...initialData, updateAt: Date.now() } : null;
  });
  // 🔸month_02
  const [salesTrendsMonth02, setSalesTrendsMonth02] = useState<(SparkChartObj & { updateAt: number }) | null>(() => {
    if (!salesSummaryRowData) return null;
    const initialData = mapSalesSummaryRowPeriodTypeToObj?.get("month_02")?.sales_trend ?? null;
    // salesSummaryRowData.find((obj) => obj.period_type === periodTypeNames.month_02)?.sales_trend ?? null;
    return initialData ? { ...initialData, updateAt: Date.now() } : null;
  });
  // 🔸month_03
  const [salesTrendsMonth03, setSalesTrendsMonth03] = useState<(SparkChartObj & { updateAt: number }) | null>(() => {
    if (!salesSummaryRowData) return null;
    const initialData = mapSalesSummaryRowPeriodTypeToObj?.get("month_03")?.sales_trend ?? null;
    // salesSummaryRowData.find((obj) => obj.period_type === periodTypeNames.month_03)?.sales_trend ?? null;
    return initialData ? { ...initialData, updateAt: Date.now() } : null;
  });
  // 🔸month_04
  const [salesTrendsMonth04, setSalesTrendsMonth04] = useState<(SparkChartObj & { updateAt: number }) | null>(() => {
    if (!salesSummaryRowData) return null;
    const initialData = mapSalesSummaryRowPeriodTypeToObj?.get("month_04")?.sales_trend ?? null;
    // salesSummaryRowData.find((obj) => obj.period_type === periodTypeNames.month_04)?.sales_trend ?? null;
    return initialData ? { ...initialData, updateAt: Date.now() } : null;
  });
  // 🔸month_05
  const [salesTrendsMonth05, setSalesTrendsMonth05] = useState<(SparkChartObj & { updateAt: number }) | null>(() => {
    if (!salesSummaryRowData) return null;
    const initialData = mapSalesSummaryRowPeriodTypeToObj?.get("month_05")?.sales_trend ?? null;
    // salesSummaryRowData.find((obj) => obj.period_type === periodTypeNames.month_05)?.sales_trend ?? null;
    return initialData ? { ...initialData, updateAt: Date.now() } : null;
  });
  // 🔸month_06
  const [salesTrendsMonth06, setSalesTrendsMonth06] = useState<(SparkChartObj & { updateAt: number }) | null>(() => {
    if (!salesSummaryRowData) return null;
    const initialData = mapSalesSummaryRowPeriodTypeToObj?.get("month_06")?.sales_trend ?? null;
    // salesSummaryRowData.find((obj) => obj.period_type === periodTypeNames.month_06)?.sales_trend ?? null;
    return initialData ? { ...initialData, updateAt: Date.now() } : null;
  });

  // ------------------------------ ✅初回マウント時✅ ------------------------------
  // 過去3年分の「上期・Q1, Q2・month_01~month_06」の売上実績が取得できたら、売上推移チャート用のローカルstateに初期値をセットする
  useEffect(() => {
    if (salesSummaryRowData) {
      if (
        salesTrendsHalf &&
        salesTrendsFirstQuarter &&
        salesTrendsSecondQuarter &&
        salesTrendsMonth01 &&
        salesTrendsMonth02 &&
        salesTrendsMonth03 &&
        salesTrendsMonth04 &&
        salesTrendsMonth05 &&
        salesTrendsMonth06
      )
        return;
      // 売上推移(「上期・Q1, Q2・month_01~month_06」)
      // H1
      const newSalesTrendsHalf = mapSalesSummaryRowPeriodTypeToObj?.get("half_year")?.sales_trend ?? null;
      // salesSummaryRowData.find((obj) => obj.period_type === periodTypeNames.half_year)?.sales_trend ?? null;
      setSalesTrendsHalf(newSalesTrendsHalf ? { ...newSalesTrendsHalf, updateAt: Date.now() } : null);
      // Q1
      const newSalesTrendsFirstQuarter = mapSalesSummaryRowPeriodTypeToObj?.get("first_quarter")?.sales_trend ?? null;
      // salesSummaryRowData.find((obj) => obj.period_type === periodTypeNames.first_quarter)?.sales_trend ?? null;
      setSalesTrendsFirstQuarter(
        newSalesTrendsFirstQuarter ? { ...newSalesTrendsFirstQuarter, updateAt: Date.now() } : null
      );
      // Q2
      const newSalesTrendsSecondQuarter = mapSalesSummaryRowPeriodTypeToObj?.get("second_quarter")?.sales_trend ?? null;
      // salesSummaryRowData.find((obj) => obj.period_type === periodTypeNames.second_quarter)?.sales_trend ?? null;
      setSalesTrendsSecondQuarter(
        newSalesTrendsSecondQuarter ? { ...newSalesTrendsSecondQuarter, updateAt: Date.now() } : null
      );
      // month_01
      const newSalesTrendsMonth01 = mapSalesSummaryRowPeriodTypeToObj?.get("month_01")?.sales_trend ?? null;
      // salesSummaryRowData.find((obj) => obj.period_type === periodTypeNames.month_01)?.sales_trend ?? null;
      setSalesTrendsMonth01(newSalesTrendsMonth01 ? { ...newSalesTrendsMonth01, updateAt: Date.now() } : null);
      // month_02
      const newSalesTrendsMonth02 = mapSalesSummaryRowPeriodTypeToObj?.get("month_02")?.sales_trend ?? null;
      // salesSummaryRowData.find((obj) => obj.period_type === periodTypeNames.month_02)?.sales_trend ?? null;
      setSalesTrendsMonth02(newSalesTrendsMonth02 ? { ...newSalesTrendsMonth02, updateAt: Date.now() } : null);
      // month_03
      const newSalesTrendsMonth03 = mapSalesSummaryRowPeriodTypeToObj?.get("month_03")?.sales_trend ?? null;
      // salesSummaryRowData.find((obj) => obj.period_type === periodTypeNames.month_03)?.sales_trend ?? null;
      setSalesTrendsMonth03(newSalesTrendsMonth03 ? { ...newSalesTrendsMonth03, updateAt: Date.now() } : null);
      // month_04
      const newSalesTrendsMonth04 = mapSalesSummaryRowPeriodTypeToObj?.get("month_04")?.sales_trend ?? null;
      // salesSummaryRowData.find((obj) => obj.period_type === periodTypeNames.month_04)?.sales_trend ?? null;
      setSalesTrendsMonth04(newSalesTrendsMonth04 ? { ...newSalesTrendsMonth04, updateAt: Date.now() } : null);
      // month_05
      const newSalesTrendsMonth05 = mapSalesSummaryRowPeriodTypeToObj?.get("month_05")?.sales_trend ?? null;
      // salesSummaryRowData.find((obj) => obj.period_type === periodTypeNames.month_05)?.sales_trend ?? null;
      setSalesTrendsMonth05(newSalesTrendsMonth05 ? { ...newSalesTrendsMonth05, updateAt: Date.now() } : null);
      // month_06
      const newSalesTrendsMonth06 = mapSalesSummaryRowPeriodTypeToObj?.get("month_06")?.sales_trend ?? null;
      // salesSummaryRowData.find((obj) => obj.period_type === periodTypeNames.month_06)?.sales_trend ?? null;
      setSalesTrendsMonth06(newSalesTrendsMonth06 ? { ...newSalesTrendsMonth06, updateAt: Date.now() } : null);
    }
  }, [salesSummaryRowData]);
  // ------------------------------ ✅初回マウント時✅ ------------------------------

  // 🔸売上推移のdateの値をrow.period_typeの値に応じた値を返す関数
  const getDateByPeriodType = useCallback(
    (
      periodType:
        | "half_year"
        | "first_quarter"
        | "second_quarter"
        | "month_01"
        | "month_02"
        | "month_03"
        | "month_04"
        | "month_05"
        | "month_06"
    ) => {
      const isFirstHalf = selectedPeriodTypeForMemberLevel === "first_half_details";
      const fiscalYear = upsertSettingEntitiesObj.fiscalYear;
      if (periodType === "half_year") return isFirstHalf ? fiscalYear * 10 + 1 : fiscalYear * 10 + 2;
      if (periodType === "first_quarter") return isFirstHalf ? fiscalYear * 10 + 1 : fiscalYear * 10 + 3;
      if (periodType === "second_quarter") return isFirstHalf ? fiscalYear * 10 + 2 : fiscalYear * 10 + 4;
      if (periodType === "month_01") return isFirstHalf ? annualFiscalMonths.month_01 : annualFiscalMonths.month_07;
      if (periodType === "month_02") return isFirstHalf ? annualFiscalMonths.month_02 : annualFiscalMonths.month_08;
      if (periodType === "month_03") return isFirstHalf ? annualFiscalMonths.month_03 : annualFiscalMonths.month_09;
      if (periodType === "month_04") return isFirstHalf ? annualFiscalMonths.month_04 : annualFiscalMonths.month_10;
      if (periodType === "month_05") return isFirstHalf ? annualFiscalMonths.month_05 : annualFiscalMonths.month_11;
      if (periodType === "month_06") return isFirstHalf ? annualFiscalMonths.month_06 : annualFiscalMonths.month_12;
      return fiscalYear;
    },
    []
  );

  // 🔸JSXmap展開用Arrayのtitle用
  const getTitle = useCallback(
    (
      period:
        | "half_year"
        | "first_quarter"
        | "second_quarter"
        | "month_01"
        | "month_02"
        | "month_03"
        | "month_04"
        | "month_05"
        | "month_06"
        | undefined
    ): { [key: "ja" | "en" | string]: string } => {
      const isFirstHalf = selectedPeriodTypeForMemberLevel === "first_half_details";
      switch (period) {
        case "half_year":
          return isFirstHalf ? { ja: "上半期", en: "H1" } : { ja: "下半期", en: "H2" };
          break;
        case "first_quarter":
          return isFirstHalf ? { ja: "Q1", en: "Q1" } : { ja: "Q3", en: "Q3" };
          break;
        case "second_quarter":
          return isFirstHalf ? { ja: "Q2", en: "Q2" } : { ja: "Q4", en: "Q4" };
          break;
        case "month_01":
          return isFirstHalf
            ? {
                ja: `${mappingMonthEnToJa[fiscalStartMonthsArray[0]]}月度`,
                en: `${mappingMonthToAbbreviation[fiscalStartMonthsArray[0]]}`,
              }
            : {
                ja: `${mappingMonthEnToJa[fiscalStartMonthsArray[6]]}月度`,
                en: `${mappingMonthToAbbreviation[fiscalStartMonthsArray[6]]}`,
              };
          break;
        case "month_02":
          return isFirstHalf
            ? {
                ja: `${mappingMonthEnToJa[fiscalStartMonthsArray[1]]}月度`,
                en: `${mappingMonthToAbbreviation[fiscalStartMonthsArray[1]]}`,
              }
            : {
                ja: `${mappingMonthEnToJa[fiscalStartMonthsArray[7]]}月度`,
                en: `${mappingMonthToAbbreviation[fiscalStartMonthsArray[7]]}`,
              };
          break;
        case "month_03":
          return isFirstHalf
            ? {
                ja: `${mappingMonthEnToJa[fiscalStartMonthsArray[2]]}月度`,
                en: `${mappingMonthToAbbreviation[fiscalStartMonthsArray[2]]}`,
              }
            : {
                ja: `${mappingMonthEnToJa[fiscalStartMonthsArray[8]]}月度`,
                en: `${mappingMonthToAbbreviation[fiscalStartMonthsArray[8]]}`,
              };
          break;
        case "month_04":
          return isFirstHalf
            ? {
                ja: `${mappingMonthEnToJa[fiscalStartMonthsArray[3]]}月度`,
                en: `${mappingMonthToAbbreviation[fiscalStartMonthsArray[3]]}`,
              }
            : {
                ja: `${mappingMonthEnToJa[fiscalStartMonthsArray[9]]}月度`,
                en: `${mappingMonthToAbbreviation[fiscalStartMonthsArray[9]]}`,
              };
          break;
        case "month_05":
          return isFirstHalf
            ? {
                ja: `${mappingMonthEnToJa[fiscalStartMonthsArray[4]]}月度`,
                en: `${mappingMonthToAbbreviation[fiscalStartMonthsArray[4]]}`,
              }
            : {
                ja: `${mappingMonthEnToJa[fiscalStartMonthsArray[10]]}月度`,
                en: `${mappingMonthToAbbreviation[fiscalStartMonthsArray[10]]}`,
              };
          break;
        case "month_06":
          return isFirstHalf
            ? {
                ja: `${mappingMonthEnToJa[fiscalStartMonthsArray[5]]}月度`,
                en: `${mappingMonthToAbbreviation[fiscalStartMonthsArray[5]]}`,
              }
            : {
                ja: `${mappingMonthEnToJa[fiscalStartMonthsArray[11]]}月度`,
                en: `${mappingMonthToAbbreviation[fiscalStartMonthsArray[11]]}`,
              };
          break;

        default:
          return isFirstHalf ? { ja: "-", en: "-" } : { ja: "-", en: "-" };
          break;
      }
    },
    [selectedPeriodTypeForMemberLevel, fiscalStartMonthsArray]
  );

  // ------------------------- 🌠JSXmap展開用Arrayにローカルstateをまとめる🌠 -------------------------
  type KeyPeriodTypeHalfDetails =
    | "half_year"
    | "first_quarter"
    | "second_quarter"
    | "month_01"
    | "month_02"
    | "month_03"
    | "month_04"
    | "month_05"
    | "month_06";
  const inputSalesTargetsList = [
    {
      // key: periodTypeNames.half_year,
      key: "half_year" as KeyPeriodTypeHalfDetails,
      title: getTitle("half_year"), // { ja: "上半期", en: "H1" } or { ja: "下半期", en: "H2" }
      inputTarget: inputSalesTargetHalf,
      setInputTarget: setInputSalesTargetHalf,
      inputYoYGrowth: inputYoYGrowthHalf,
      setInputYoYGrowth: setInputYoYGrowthHalf,
      salesTrends: salesTrendsHalf,
      setSalesTrends: setSalesTrendsHalf,
    },
    {
      // key: periodTypeNames.first_quarter,
      key: "first_quarter" as KeyPeriodTypeHalfDetails,
      title: getTitle("first_quarter"), // { ja: "Q1", en: "Q1" } or { ja: "Q3", en: "Q3" }
      inputTarget: inputSalesTargetFirstQuarter,
      setInputTarget: setInputSalesTargetFirstQuarter,
      inputYoYGrowth: inputYoYGrowthFirstQuarter,
      setInputYoYGrowth: setInputYoYGrowthFirstQuarter,
      salesTrends: salesTrendsFirstQuarter,
      setSalesTrends: setSalesTrendsFirstQuarter,
    },
    {
      // key: periodTypeNames.second_quarter,
      key: "second_quarter" as KeyPeriodTypeHalfDetails,
      title: getTitle("second_quarter"),
      inputTarget: inputSalesTargetSecondQuarter,
      setInputTarget: setInputSalesTargetSecondQuarter,
      inputYoYGrowth: inputYoYGrowthSecondQuarter,
      setInputYoYGrowth: setInputYoYGrowthSecondQuarter,
      salesTrends: salesTrendsSecondQuarter,
      setSalesTrends: setSalesTrendsSecondQuarter,
    },
    {
      // key: periodTypeNames.month_01,
      key: "month_01" as KeyPeriodTypeHalfDetails,
      title: getTitle("month_01"),
      inputTarget: inputSalesTargetMonth01,
      setInputTarget: setInputSalesTargetMonth01,
      inputYoYGrowth: inputYoYGrowthMonth01,
      setInputYoYGrowth: setInputYoYGrowthMonth01,
      salesTrends: salesTrendsMonth01,
      setSalesTrends: setSalesTrendsMonth01,
    },
    {
      // key: periodTypeNames.month_02,
      key: "month_02" as KeyPeriodTypeHalfDetails,
      title: getTitle("month_02"),
      inputTarget: inputSalesTargetMonth02,
      setInputTarget: setInputSalesTargetMonth02,
      inputYoYGrowth: inputYoYGrowthMonth02,
      setInputYoYGrowth: setInputYoYGrowthMonth02,
      salesTrends: salesTrendsMonth02,
      setSalesTrends: setSalesTrendsMonth02,
    },
    {
      // key: periodTypeNames.month_03,
      key: "month_03" as KeyPeriodTypeHalfDetails,
      title: getTitle("month_03"),
      inputTarget: inputSalesTargetMonth03,
      setInputTarget: setInputSalesTargetMonth03,
      inputYoYGrowth: inputYoYGrowthMonth03,
      setInputYoYGrowth: setInputYoYGrowthMonth03,
      salesTrends: salesTrendsMonth03,
      setSalesTrends: setSalesTrendsMonth03,
    },
    {
      // key: periodTypeNames.month_04,
      key: "month_04" as KeyPeriodTypeHalfDetails,
      title: getTitle("month_04"),
      inputTarget: inputSalesTargetMonth04,
      setInputTarget: setInputSalesTargetMonth04,
      inputYoYGrowth: inputYoYGrowthMonth04,
      setInputYoYGrowth: setInputYoYGrowthMonth04,
      salesTrends: salesTrendsMonth04,
      setSalesTrends: setSalesTrendsMonth04,
    },
    {
      // key: periodTypeNames.month_05,
      key: "month_05" as KeyPeriodTypeHalfDetails,
      title: getTitle("month_05"),
      inputTarget: inputSalesTargetMonth05,
      setInputTarget: setInputSalesTargetMonth05,
      inputYoYGrowth: inputYoYGrowthMonth05,
      setInputYoYGrowth: setInputYoYGrowthMonth05,
      salesTrends: salesTrendsMonth05,
      setSalesTrends: setSalesTrendsMonth05,
    },
    {
      // key: periodTypeNames.month_06,
      key: "month_06" as KeyPeriodTypeHalfDetails,
      title: getTitle("month_06"),
      inputTarget: inputSalesTargetMonth06,
      setInputTarget: setInputSalesTargetMonth06,
      inputYoYGrowth: inputYoYGrowthMonth06,
      setInputYoYGrowth: setInputYoYGrowthMonth06,
      salesTrends: salesTrendsMonth06,
      setSalesTrends: setSalesTrendsMonth06,
    },
  ];
  // ------------------------- 🌠JSXmap展開用Arrayにローカルstateをまとめる🌠 -------------------------

  // ------------------------------ 🌠month_xxの売上目標入力許可🌠 ------------------------------
  const isEnableInputMonthTarget = useMemo(() => {
    // 半期・Q1・Q2の売上目標が全て入力され、かつ、半期とQ1, Q2の合計値が一致している場合にmonth_xxの売上目標の入力を許可する

    // 全ての入力値が入力済みかどうかチェック
    const isCompleteAllInput =
      inputSalesTargetHalf !== "" && inputSalesTargetFirstQuarter !== "" && inputSalesTargetSecondQuarter !== "";

    // 全て入力が完了していない場合はfalse
    if (!isCompleteAllInput) return false;

    // Decimalを作成 new Decimal()使用時に無効な入力が渡された場合にエラーを投げるのでtry/catch文でエラーハンドリングする
    try {
      // const halfYearDecimal = new Decimal(zenkakuToHankaku(inputSalesTargetHalf).replace(/[^\d.]/g, ""));
      const halfYearDecimal = parseDecimal(inputSalesTargetHalf);
      const firstQuarterDecimal = parseDecimal(inputSalesTargetFirstQuarter);
      const secondQuarterDecimal = parseDecimal(inputSalesTargetSecondQuarter);

      // Q1, Q2の合計値
      const totalQuarterDecimal = firstQuarterDecimal.plus(secondQuarterDecimal);

      // 半期とQ1, Q2の合計値が一致しているかどうか
      const isMatchHalfAndQuarter = halfYearDecimal.equals(totalQuarterDecimal);

      return isMatchHalfAndQuarter;
    } catch (error: any) {
      console.log("❌エラー：無効な売上目標の入力値です", error);
      return false;
    }
  }, [inputSalesTargetHalf, inputSalesTargetFirstQuarter, inputSalesTargetSecondQuarter]);

  // ------------------------------ 🌠month_xxの売上目標入力許可🌠 ------------------------------

  // 渡された配列内の値が全て数値として扱えるかチェックする関数
  const validateInputSalesTargets = useCallback((salesTargetArray: string[]) => {
    return salesTargetArray.every((target) => isValidNumber(target.replace(/[^\d.]/g, "")));
  }, []);

  // --------------------- 🌟残りQ/半期🌟 ---------------------
  // const salesTargetHalfYearStatus = useMemo(() => {
  //   if () return
  // }, [inputSalesTargetHalf, inputSalesTargetFirstQuarter])
  // --------------------- 🌟残りQ/半期🌟 ---------------------

  // 🔹メイン目標に対して各月度の合計値の差額をチェックする関数
  const validateMonthlyTargetsAgainstMain = (
    key: "sales_target_first_quarter" | "sales_target_second_quarter",
    mainTarget: string,
    inputMonths: string[]
  ): QuarterStatus | null => {
    try {
      // 6,000,000,000 => 6000000000 => Decimalオブジェクト
      //  const inputMonths = [inputSalesTargetMonth01, inputSalesTargetMonth02, inputSalesTargetMonth03];
      console.log(
        "validateMonthlyTargetsAgainstMain関数",
        "key",
        key,
        "mainTarget",
        mainTarget,
        "inputMonths",
        inputMonths
      );
      if (!validateInputSalesTargets(inputMonths)) throw new Error("Q1の月次に無効な入力値が含まれています。");

      let totalInputDecimal = new Decimal(0);
      // Q1内の各月度合計値をDecimalで算出
      inputMonths
        .map((monthInputStr) => parseDecimal(monthInputStr || 0)) // まだ未入力で空文字の場合は0をDecimalに渡す
        .forEach((monthDecimal) => {
          // plus()で各月度の目標金額を加算した結果をtotalInputDecimalに再代入
          totalInputDecimal = totalInputDecimal.plus(monthDecimal);
        });
      //  const mainTargetDecimal = parseDecimal(inputSalesTargetFirstQuarter);
      const mainTargetDecimal = parseDecimal(mainTarget);

      // 残り目標額
      const restSalesTargetDecimal = mainTargetDecimal.minus(totalInputDecimal); // 総合目標に対する各月度の合計値の差額(残り金額)
      const isNegative = restSalesTargetDecimal.isNegative(); // 総合目標を各月度の合計値が超えているならtrue
      const isComplete = restSalesTargetDecimal.isZero(); // 総合目標と各月度の合計値の差額が0ならtrue
      const restTarget = restSalesTargetDecimal.toNumber();
      // 現在の3ヶ月分の月度目標合計額(Decimal => number)
      const totalInputNum = totalInputDecimal.toNumber();

      let title = key === "sales_target_first_quarter" ? { ja: `Q1`, en: `Q1` } : { ja: `Q2`, en: `Q2` };
      if (selectedPeriodTypeForMemberLevel === "first_half_details")
        title = key === "sales_target_first_quarter" ? { ja: `Q3`, en: `Q3` } : { ja: `Q4`, en: `Q4` };
      // const _mainTarget = key === "sales_target_first_quarter" ? inputSalesTargetFirstQuarter : inputSalesTargetSecondQuarter
      return {
        key: key, // "sales_target_first_half", "sales_target_second_half"
        total_sales_target: formatToJapaneseYen(totalInputNum),
        // sales_target: value,
        title: title,
        // restTarget: formatToJapaneseYen(restSalesTarget, true, true),
        mainTarget: mainTarget,
        restTarget: restTarget,
        isNegative: isNegative,
        isComplete: isComplete,
      };
    } catch (error: any) {
      console.log("❌エラー：🔹残り月次/Q1目標 用データ ", error);
      return null;
    }
  };

  type QuarterStatus = {
    key: "sales_target_first_quarter" | "sales_target_second_quarter";
    total_sales_target: string;
    title: {
      ja: string;
      en: string;
      [key: string]: string;
    };
    mainTarget: string;
    restTarget: number;
    isNegative: boolean;
    isComplete: boolean;
  };

  // --------------------- 🌟残り/Q1🌟 ---------------------
  const [salesTargetFirstQuarterStatus, setSalesTargetFirstQuarterStatus] = useState<QuarterStatus | null>(null);
  // --------------------- 🌟残り/Q1🌟 ---------------------

  // --------------------- 🌟残り/Q2🌟 ---------------------
  const [salesTargetSecondQuarterStatus, setSalesTargetSecondQuarterStatus] = useState<QuarterStatus | null>(null);
  // --------------------- 🌟残り/Q2🌟 ---------------------

  // map展開用の配列
  const salesTargetStatusArray = [salesTargetFirstQuarterStatus, salesTargetSecondQuarterStatus];

  // month_xxに空文字が入力された時にQ1 or Q2の期間内の全てのmonth_xxと残り月次stateをリセットする関数
  type HalfQuarterMonthsKey = "month_01" | "month_02" | "month_03" | "month_04" | "month_05" | "month_06";
  type FirstQuarterMonthsKey = "month_01" | "month_02" | "month_03";
  type SecondQuarterMonthsKey = "month_04" | "month_05" | "month_06";

  // type RowHeaderNameYearHalf = "fiscal_year" | "first_half" | "second_half";

  // ------------------------------ 🌠保存トリガー発火で各入力値をデータ収集🌠 ------------------------------
  // 🌠保存クリックでデータを収集
  const saveTriggerSalesTarget = useDashboardStore((state) => state.saveTriggerSalesTarget);
  const inputSalesTargetsIdToDataMap = useDashboardStore((state) => state.inputSalesTargetsIdToDataMap);
  const setInputSalesTargetsIdToDataMap = useDashboardStore((state) => state.setInputSalesTargetsIdToDataMap);

  // 🌠「保存クリック」データ収集
  useEffect(() => {
    if (!saveTriggerSalesTarget)
      return console.log(`❌${entityNameTitle}テーブル リターン トリガーがfalse`, saveTriggerSalesTarget);
    if (!saveEnabled) return console.log(`❌${entityNameTitle}テーブル saveEnabledがfalseのためリターン`, saveEnabled);
    if (allSaved) return console.log(`${entityNameTitle}テーブル ✅全てデータ収集ずみリターン`, allSaved);

    // トリガーがtrueの場合か、isCollectedでない(もしくは存在しない)場合のみ目標stateの収集を実行
    console.log(
      `🔥🔥🔥🔥🔥${entityNameTitle}テーブル データ収集トリガー検知`,
      saveTriggerSalesTarget,
      "isCollected",
      (inputSalesTargetsIdToDataMap[entityId] as EntityInputSalesTargetObj)?.isCollected,
      "saveEnabled",
      saveEnabled
    );
    if ((inputSalesTargetsIdToDataMap[entityId] as EntityInputSalesTargetObj)?.isCollected)
      return console.log(
        `✅${entityNameTitle}テーブル リターン isCollected`,
        (inputSalesTargetsIdToDataMap[entityId] as EntityInputSalesTargetObj)?.isCollected
      );

    // const getPeriod = (key: string) => {
    //   if (key === "fiscal_year") return upsertSettingEntitiesObj.fiscalYear;
    //   if (key === "first_half") return upsertSettingEntitiesObj.fiscalYear * 10 + 1;
    //   if (key === "second_half") return upsertSettingEntitiesObj.fiscalYear * 10 + 2;
    //   if (key === "first_quarter") return upsertSettingEntitiesObj.fiscalYear * 10 + 1;
    //   if (key === "second_quarter") return upsertSettingEntitiesObj.fiscalYear * 10 + 2;
    //   if (key === "third_quarter") return upsertSettingEntitiesObj.fiscalYear * 10 + 3;
    //   if (key === "fourth_quarter") return upsertSettingEntitiesObj.fiscalYear * 10 + 4;
    //   if (key === "month_01") return upsertSettingEntitiesObj.fiscalYear * 100 + 1;
    //   if (key === "month_02") return upsertSettingEntitiesObj.fiscalYear * 100 + 2;
    //   if (key === "month_03") return upsertSettingEntitiesObj.fiscalYear * 100 + 3;
    //   if (key === "month_04") return upsertSettingEntitiesObj.fiscalYear * 100 + 4;
    //   if (key === "month_05") return upsertSettingEntitiesObj.fiscalYear * 100 + 5;
    //   if (key === "month_06") return upsertSettingEntitiesObj.fiscalYear * 100 + 6;
    //   if (key === "month_07") return upsertSettingEntitiesObj.fiscalYear * 100 + 7;
    //   if (key === "month_08") return upsertSettingEntitiesObj.fiscalYear * 100 + 8;
    //   if (key === "month_09") return upsertSettingEntitiesObj.fiscalYear * 100 + 9;
    //   if (key === "month_10") return upsertSettingEntitiesObj.fiscalYear * 100 + 10;
    //   if (key === "month_11") return upsertSettingEntitiesObj.fiscalYear * 100 + 11;
    //   if (key === "month_12") return upsertSettingEntitiesObj.fiscalYear * 100 + 12;
    //   return upsertSettingEntitiesObj.fiscalYear;
    // };
    const getPeriod = (key: KeyPeriodTypeHalfDetails) => {
      const isFirstHalf = selectedPeriodTypeForMemberLevel === "first_half_details";
      const fiscalYear = upsertSettingEntitiesObj.fiscalYear;
      if (key === "half_year") return isFirstHalf ? fiscalYear * 10 + 1 : fiscalYear * 10 + 2;
      if (key === "first_quarter") return isFirstHalf ? fiscalYear * 10 + 1 : fiscalYear * 10 + 3;
      if (key === "second_quarter") return isFirstHalf ? fiscalYear * 10 + 2 : fiscalYear * 10 + 4;
      if (key === "month_01") return isFirstHalf ? annualFiscalMonths.month_01 : annualFiscalMonths.month_07;
      if (key === "month_02") return isFirstHalf ? annualFiscalMonths.month_02 : annualFiscalMonths.month_08;
      if (key === "month_03") return isFirstHalf ? annualFiscalMonths.month_03 : annualFiscalMonths.month_09;
      if (key === "month_04") return isFirstHalf ? annualFiscalMonths.month_04 : annualFiscalMonths.month_10;
      if (key === "month_05") return isFirstHalf ? annualFiscalMonths.month_05 : annualFiscalMonths.month_11;
      if (key === "month_06") return isFirstHalf ? annualFiscalMonths.month_06 : annualFiscalMonths.month_12;
      return upsertSettingEntitiesObj.fiscalYear;
    };

    let salesTargets: inputSalesData[] = [];

    //
    // const getPeriodType = (key: string) => {
    //   // fiscal_year, half_year, quarter, year_month
    //   if (key === "fiscal_year") return "fiscal_year";
    //   if (["first_half", "second_half"].includes(key)) return "half_year";
    //   if (["first_quarter", "second_quarter"].includes(key)) return "quarter";
    //   if (
    //     [
    //       "month_01",
    //       "month_02",
    //       "month_03",
    //       "month_04",
    //       "month_05",
    //       "month_06",
    //     ].includes(key)
    //   )
    //     return key; //
    //     // return "year_month";
    // };

    // 期間タイプをhalf_yearではなく、first_half, second_half、quarterではなく、first_quarter, second_quarter, third_quarter, fourth_quarterで、詳細に分けるパターンで実装する、month_xxのみ詳細に分けずに全て詳細で統一
    const getPeriodType = (key: string) => {
      const isFirstHalf = selectedPeriodTypeForMemberLevel === "first_half_details";
      // fiscal_year, half_year, quarter, year_month
      if (key === "fiscal_year") return "fiscal_year";
      // if (["half_year", "first_half", "second_half"].includes(key)) return key;
      if (key === "half_year") {
        return isFirstHalf ? "first_half" : "second_half";
      }
      if (["first_quarter", "second_quarter"].includes(key)) {
        if (key === "first_quarter") return isFirstHalf ? "first_quarter" : "third_quarter";
        return isFirstHalf ? "second_quarter" : "fourth_quarter";
      }
      if (["month_01", "month_02", "month_03", "month_04", "month_05", "month_06"].includes(key)) {
        let month = key;
        if (key === "month_01") month = isFirstHalf ? "month_01" : "month_07";
        if (key === "month_02") month = isFirstHalf ? "month_02" : "month_08";
        if (key === "month_03") month = isFirstHalf ? "month_03" : "month_09";
        if (key === "month_04") month = isFirstHalf ? "month_04" : "month_10";
        if (key === "month_05") month = isFirstHalf ? "month_05" : "month_11";
        if (key === "month_06") month = isFirstHalf ? "month_06" : "month_12";
        return month;
      }
    };

    salesTargets = inputSalesTargetsList.map((obj, index) => {
      return {
        period_type: getPeriodType(obj.key), // "half_year" | "quarter" | "year_month"
        period: getPeriod(obj.key),
        sales_target: Number(obj.inputTarget.replace(/[^\d.]/g, "")),
      } as inputSalesData;
    });

    // Zustandのオブジェクトのstateの不変性を保つためcloneDeepでオブジェクトをコピー
    const copyInputMap = cloneDeep(inputSalesTargetsIdToDataMap);
    const newTarget = {
      entity_id: entityId,
      entity_name: entityNameTitle,
      sales_targets: salesTargets,
    } as InputSalesTargets;

    const isAllValid = validateInputSalesTargets(inputSalesTargetsList.map((obj) => obj.inputTarget));

    if (!isAllValid) {
      copyInputMap[entityId] = { data: newTarget, isCollected: false, error: "データが有効ではありません" };
    } else {
      copyInputMap[entityId] = { data: newTarget, isCollected: true, error: null };
    }

    console.log(
      `🔥🔥🔥✅✅✅✅✅✅✅✅✅✅${entityNameTitle}テーブル 子コンポーネント Zustandを更新`,
      "isAllValid",
      isAllValid,
      "copyInputMap",
      copyInputMap
    );

    // Zustandを更新
    setInputSalesTargetsIdToDataMap(copyInputMap);
    if (onSaveComplete) onSaveComplete(); // 次のテーブルの保存を許可
  }, [saveTriggerSalesTarget, saveEnabled]);
  // ------------------------------ 🌠保存トリガー発火で各入力値をデータ収集🌠 ------------------------------

  // ===================== 🌟ツールチップ 3点リーダーの時にツールチップ表示🌟 =====================
  const hoveredItemPos = useStore((state) => state.hoveredItemPos);
  const setHoveredItemPos = useStore((state) => state.setHoveredItemPos);
  type TooltipParams = {
    e: React.MouseEvent<HTMLElement, MouseEvent>;
    display: string;
    content: string;
    content2?: string | undefined | null;
    marginTop?: number;
    itemsPosition?: string;
  };
  const handleOpenTooltip = ({
    e,
    display,
    content,
    content2,
    marginTop = 0,
    itemsPosition = "center",
  }: TooltipParams) => {
    // ホバーしたアイテムにツールチップを表示
    const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
    // console.log("ツールチップx, y width , height", x, y, width, height);

    setHoveredItemPos({
      x: x,
      y: y,
      itemWidth: width,
      itemHeight: height,
      content: content,
      content2: content2,
      display: display,
      marginTop: marginTop,
      itemsPosition: itemsPosition,
    });
  };
  // ツールチップを非表示
  const handleCloseTooltip = () => {
    if (hoveredItemPos) setHoveredItemPos(null);
  };
  // ==================================================================================

  // ---------------- 関数 ----------------
  // 🔸rowの値に応じて適切なシェアを返す関数
  const getShare = (row: string) => {
    switch (row) {
      // case "fiscal_year":
      case periodTypeNames.half_year:
        return shareHalfYear;
      // return 100;
      // case "first_half":
      case periodTypeNames.first_quarter:
        return shareFirstQuarter;
      // case "second_half":
      case periodTypeNames.second_quarter:
        return shareSecondQuarter;
      // case periodTypeNames.month01:
      //   return shareMonth01;
      // case periodTypeNames.month02:
      //   return shareMonth02;
      // case periodTypeNames.month03:
      //   return shareMonth03;
      // case periodTypeNames.month04:
      //   return shareMonth04;
      // case periodTypeNames.month05:
      //   return shareMonth05;
      // case periodTypeNames.month06:
      //   return shareMonth06;
      default:
        return 0;
        break;
    }
  };

  // 🔸行ヘッダーの値(期間タイプ)とと列ヘッダーの値に応じて表示する値をフォーマットする
  const formatDisplayValue = (row: SalesSummaryHalfDetails, column: string) => {
    switch (column) {
      case "last_year_sales":
      case "two_years_ago_sales":
      case "three_years_ago_sales":
        return formatDisplayPrice(row[column]);
        break;
      //   // 売上目標
      // case 'sales_target':
      //   if (isRowHeaderNameYearHalf(row.period_type)) return;

      // case "yoy_growth":
      //   if (isRowHeaderNameYearHalf(row.period_type)) return mappingInputSalesTargets[row.period_type].inputYoYGrowth;
      //   break
      case "yo2y_growth":
        if (row.yo2y_growth === null || !isValidNumber(row.yo2y_growth)) return `- %`;
        return `${row.yo2y_growth.toFixed(1)}%`;
        break;

      default:
        break;
    }
  };

  // サブ目標リストから部門エンティティを削除(target_typeをnullに変更)
  // const handleRemoveFromTargetList = async () => {
  //   if (!subTargetList) return;
  //   if (!setSubTargetList) return;
  //   // エンティティタイプからupdateするテーブルを確定
  //   let updatedTable = "";
  //   if (entityLevel === "department") updatedTable = "departments";
  //   if (entityLevel === "section") updatedTable = "sections";
  //   if (entityLevel === "unit") updatedTable = "units";
  //   if (entityLevel === "office") updatedTable = "offices";
  //   if (entityLevel === "member") updatedTable = "profiles";
  //   if (entityLevel === "") return alert("部門データが見つかりませんでした。");

  //   const updatedPayload = { target_type: null };

  //   setIsLoading(true); // ローディング開始

  //   try {
  //     console.log("削除実行🔥 updatedTable", updatedTable, entityId);
  //     const { error } = await supabase.from(updatedTable).update(updatedPayload).eq("id", entityId);

  //     if (error) throw error;

  //     // キャッシュのサブ目標リストから部門を削除
  //     // const periodType = isMemberLevelSetting ? `first_half_details` : `year_half`;
  //     // const fiscalYear = upsertTargetObj.fiscalYear;
  //     // const queryKey = ["sales_summary_and_growth", entityLevel, entityId, periodType, fiscalYear, isFirstHalf];

  //     // キャッシュの部門からsales_targetをnullに更新する
  //     let queryKey = "departments";
  //     if (entityLevel === "department") queryKey = "departments";
  //     if (entityLevel === "section") queryKey = "sections";
  //     if (entityLevel === "unit") queryKey = "units";
  //     if (entityLevel === "office") queryKey = "offices";
  //     if (entityLevel === "member") queryKey = "member_accounts";
  //     const prevCache = queryClient.getQueryData([queryKey]) as
  //       | Department[]
  //       | Section[]
  //       | Unit[]
  //       | Office[]
  //       | MemberAccounts[];
  //     const newCache = [...prevCache]; // キャッシュのシャローコピーを作成
  //     // 更新対象のオブジェクトのtarget_typeをnullに変更
  //     const updateIndex = newCache.findIndex((obj) => obj.id === entityId);
  //     if (updateIndex !== -1) {
  //       // 更新対象の配列内のインデックスを変えずに対象のプロパティのみ変更
  //       newCache.splice(updateIndex, 1, { ...prevCache[updateIndex], target_type: null });
  //       queryClient.setQueryData([queryKey], newCache); // キャッシュを更新
  //     }

  //     // 固定していた場合は固定を解除
  //     if (stickyRow === entityId) {
  //       setStickyRow(null);
  //     }

  //     setIsLoading(false); // ローディング終了

  //     // サブ目標リストから削除
  //     const newList = [...subTargetList].filter((obj) => obj.id !== entityId) as
  //       | Department[]
  //       | Section[]
  //       | Unit[]
  //       | Office[]
  //       | MemberAccounts[];
  //     setSubTargetList(newList);

  //     toast.success(`${entityNameTitle}を目標リストから削除しました🌟`);
  //   } catch (error: any) {
  //     console.error("エラー：", error);
  //     toast.error("目標リストからの削除に失敗しました...🙇‍♀️");
  //   }
  // };

  // 🔸チャート マウントを0.6s遅らせる
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    if (isMounted) return;
    setTimeout(() => {
      setIsMounted(true);
    }, 600);
  }, []);

  console.log(
    "🔹UpsertSettingTargetGridTableForMemberLevelコンポーネントレンダリング",
    "entityNameTitle",
    entityNameTitle,
    "salesTargetsHalfDetails",
    salesTargetsHalfDetails,
    "annualFiscalMonths",
    annualFiscalMonths
    // "inputSalesTargetsList",
    // inputSalesTargetsList,
    // "shareHalfYear",
    // shareHalfYear,
    // "entityLevel",
    // entityLevel,
    // "annualFiscalMonths",
    // annualFiscalMonths,
    // "isFirstHalf",
    // isFirstHalf,
    // "salesSummaryRowData",
    // salesSummaryRowData,
    // "inputSalesTargetsList",
    // inputSalesTargetsList,
    // "salesSummaryError",
    // salesSummaryError,
    // "isLoadingQuery",
    // isLoadingQuery
  );

  const infoIconStepRef = useRef<HTMLDivElement | null>(null);

  // 過去3年分の実績の取得中、または、メイン目標の売上目標をキャッシュから未取得の場合にはローディングを表示する
  if (isLoadingQuery) return <FallbackScrollContainer title={entityNameTitle} />;

  return (
    <>
      <div className={`${styles.grid_row} ${styles.col1} fade08_forward`}>
        <div className={`${styles.grid_content_card} relative`}>
          {isLoading && (
            <div className={`flex-center absolute left-0 top-0 z-[50] h-full w-full rounded-[12px] bg-[#00000090]`}>
              <SpinnerX />
            </div>
          )}
          <div className={`${styles.card_title_area}`}>
            {/* <div className={`${styles.card_title_wrapper} space-x-[24px]`}>
                <div className={`${styles.card_title}`}>
                  <span>総合目標</span>
                </div>
                <div className={`${styles.card_title} pb-[1px]`}>
                  <span>{upsertTargetObj.entityName}</span>
                  <div className={`absolute bottom-0 left-0 min-h-[2px] w-full bg-[var(--color-bg-brand-f)]`} />
                </div>
              </div> */}
            <div className={`${styles.card_title} flex items-center`}>
              <span>{entityNameTitle}</span>
              <div className={`ml-[12px] flex h-full items-center`}>
                <div
                  className="flex-center relative h-[16px] w-[16px] rounded-full"
                  onMouseEnter={(e) => {
                    const icon = infoIconStepRef.current;
                    if (icon && icon.classList.contains(styles.animate_ping)) {
                      icon.classList.remove(styles.animate_ping);
                    }
                    const parentName = parentEntityLevel === "company" ? `全社` : `${parentEntityNameTitle}`;
                    const subContent1 = parentEntityNameTitle
                      ? `メンバーのシェアは総合目標となる${parentName}の`
                      : `メンバーのシェアは総合目標の`;
                    const subContent2 = `それぞれ期間の売上目標を100%とした場合のシェアを表しています。`;
                    // handleOpenPopupMenu({ e, title: "step", displayX: "right", maxWidth: 360 });
                    handleOpenTooltip({
                      e: e,
                      display: "top",
                      content: subContent1,
                      content2: subContent2,
                      marginTop: 39,
                      itemsPosition: `left`,
                    });
                  }}
                  onMouseLeave={handleCloseTooltip}
                  // onMouseLeave={handleClosePopupMenu}
                >
                  <div
                    ref={infoIconStepRef}
                    className={`flex-center absolute left-0 top-0 h-[16px] w-[16px] rounded-full border border-solid border-[var(--color-bg-brand-f)] ${styles.animate_ping}`}
                  ></div>
                  <ImInfo className={`min-h-[16px] min-w-[16px] text-[var(--color-bg-brand-f)]`} />
                </div>

                {isEnableInputMonthTarget &&
                  salesTargetFirstQuarterStatus?.isComplete &&
                  salesTargetSecondQuarterStatus?.isComplete && (
                    <div className={`ml-[0px] flex items-center justify-start`}>
                      <div
                        // className={`flex-center ml-[18px] rounded-full border border-solid border-[var(--color-bg-brand-f)] bg-[var(--color-bg-brand-f)] px-[12px] py-[3px] text-[12px] text-[#fff]`}
                        className={`flex-center ml-[18px] rounded-full border border-solid border-[var(--bright-green)] bg-[var(--bright-green)] px-[12px] py-[3px] text-[12px] text-[#fff]`}
                        // onMouseEnter={(e) => {
                        //   handleOpenTooltip({
                        //     e: e,
                        //     display: "top",
                        //     content: `全ての${getDivName()}の売上目標の設定が完了しました！\n保存ボタンをクリックして売上目標を確定・保存してください。`,
                        //     marginTop: 30,
                        //     itemsPosition: `left`,
                        //   });
                        // }}
                        // onMouseLeave={handleCloseTooltip}
                      >
                        <span className="ml-[2px]">設定完了</span>
                        <BsCheck2 className="pointer-events-none ml-[6px] min-h-[18px] min-w-[18px] stroke-1 text-[18px] text-[#fff]" />
                      </div>
                    </div>
                  )}

                {!(
                  isEnableInputMonthTarget &&
                  salesTargetFirstQuarterStatus?.isComplete &&
                  salesTargetSecondQuarterStatus?.isComplete
                ) && (
                  <div className={`flex items-center justify-start`}>
                    <div className={`ml-[24px] flex items-center justify-start`}>
                      <div className={` mr-[15px] flex items-center`}>
                        <div
                          className={`flex-center min-w-max space-x-[6px] whitespace-nowrap rounded-full border border-solid border-[var(--color-border-light)] px-[12px] py-[3px] text-[12px] font-normal text-[var(--color-text-title)]`}
                        >
                          {/* <span>{obj.title[language]}</span> */}
                          <span>Q / 上半期</span>
                        </div>
                      </div>
                      <div className={`flex-center h-full pb-[2px] text-[13px] font-normal`}>
                        {!isEnableInputMonthTarget && <span className="text-[var(--main-color-tk)]">未完了</span>}
                        {isEnableInputMonthTarget && (
                          <>
                            {/* <span className="text-[var(--main-color-f)] mr-[12px] ">設定完了</span> */}
                            <BsCheck2 className="pointer-events-none min-h-[22px] min-w-[22px] stroke-1 text-[22px] text-[#00d436]" />
                          </>
                        )}
                      </div>
                    </div>
                    {isEnableInputMonthTarget &&
                      salesTargetStatusArray.map((obj, index) => {
                        if (obj === null) return;
                        return (
                          <div
                            key={`sales_target_status_${entityId}_${obj.key}_${index}`}
                            className={`fade08_forward ml-[24px] flex items-center justify-start`}
                          >
                            {/* <div className={` flex items-center ${obj.isComplete ? `mr-[12px]` : `mr-[15px]`}`}> */}
                            <div className={` mr-[15px] flex items-center`}>
                              <div
                                className={`flex-center min-w-max space-x-[6px] whitespace-nowrap rounded-full border border-solid border-[var(--color-border-light)] px-[12px] py-[3px] text-[12px] font-normal text-[var(--color-text-title)]`}
                              >
                                <span>月次</span>
                                <span>/</span>
                                <span>{obj.title[language]}</span>
                              </div>
                              {obj.isComplete && (
                                <BsCheck2 className="pointer-events-none ml-[12px] min-h-[22px] min-w-[22px] stroke-1 text-[22px] text-[#00d436]" />
                              )}
                            </div>

                            <div className={`flex flex-wrap items-end space-x-[12px]`}>
                              <div
                                className={`flex items-end text-[19px] font-bold ${
                                  obj.isNegative
                                    ? `text-[var(--main-color-tk)]`
                                    : obj.isComplete
                                    ? `text-[var(--color-text-title)]`
                                    : `text-[var(--color-text-title)]`
                                }`}
                              >
                                <div className="mr-[6px] flex items-end pb-[3px]">
                                  <span className={`text-[11px] font-normal`}>残り</span>
                                </div>
                                {/* <span>{obj.restTarget}</span> */}
                                <ProgressNumber
                                  // targetNumber={12320000000}
                                  targetNumber={obj.restTarget}
                                  // startNumber={Math.round(68000 / 2)}
                                  // startNumber={Number((68000 * 0.1).toFixed(0))}
                                  startNumber={0}
                                  duration={3000}
                                  easeFn="Quintic"
                                  fontSize={19}
                                  // margin="0 0 -3px 0"
                                  margin="0 0 0 0"
                                  isReady={true}
                                  fade={`fade08_forward`}
                                  isPrice={true}
                                  isPercent={false}
                                  includeCurrencySymbol={obj.isComplete ? false : true}
                                  showNegativeSign={true}
                                  textColor={`${
                                    obj.isNegative
                                      ? `var(--main-color-tk)`
                                      : obj.isComplete
                                      ? `var(--bright-green)`
                                      : `var(--color-text-title)`
                                  }`}
                                />
                              </div>
                              <div className={`flex items-center space-x-[6px] font-normal`}>
                                <div className={``}>
                                  <span>/</span>
                                </div>
                                <div className={`text-[14px]`}>
                                  <span>{obj.mainTarget}</span>
                                  {/* <span>¥ 12,320,000,000</span> */}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>

            <div className={`${styles.btn_area} flex items-center space-x-[12px]`}>
              {/* {!isMainTarget && (
                <div
                  className={`${styles.btn} ${styles.basic} space-x-[4px]`}
                  onMouseEnter={(e) => {
                    handleOpenTooltip({
                      e: e,
                      display: "top",
                      content: `目標リストから削除`,
                      marginTop: 9,
                    });
                  }}
                  onMouseLeave={handleCloseTooltip}
                  onClick={handleRemoveFromTargetList}
                >
                  <HiOutlineSwitchHorizontal />
                  <span>削除</span>
                </div>
              )} */}
              <div
                className={`${styles.btn} ${styles.basic} space-x-[4px]`}
                onMouseEnter={(e) => {
                  handleOpenTooltip({
                    e: e,
                    display: "top",
                    content: stickyRow === entityId ? `固定を解除` : `画面内に固定`,
                    marginTop: 9,
                  });
                }}
                onMouseLeave={handleCloseTooltip}
                onClick={() => {
                  if (entityId === stickyRow) {
                    setStickyRow(null);
                  } else {
                    setStickyRow(entityId);
                  }
                  handleCloseTooltip();
                }}
              >
                {stickyRow === entityId && <TbSnowflakeOff />}
                {stickyRow !== entityId && <TbSnowflake />}
                {stickyRow === entityId && <span>解除</span>}
                {stickyRow !== entityId && <span>固定</span>}
              </div>
            </div>
          </div>
          {/* ------------------ メインコンテナ ------------------ */}
          <div className={`${styles.main_container}`}>
            {/* ------------------ Gridコンテナ ------------------ */}
            <div
              role="grid"
              className={`${styles.grid_scroll_container}`}
              style={
                {
                  "--template-columns": `80px 240px 48px repeat(2, 100px) repeat(3, 150px) minmax(180px, 1fr)`,
                  "--header-row-height": `35px`,
                  "--grid-row-height": `56px`,
                  "--row-width": `100%`,
                } as CSSProperties
              }
            >
              {/* ----------- ヘッダー ----------- */}
              <div
                role="row"
                tabIndex={-1}
                aria-rowindex={1}
                aria-selected={false}
                className={`${styles.grid_header_row}`}
              >
                {columnHeaderListTarget.map((column, colIndex) => {
                  let displayValue = formatColumnName(column, upsertSettingEntitiesObj.fiscalYear)[language];
                  return (
                    <div
                      key={colIndex}
                      role="columnheader"
                      aria-colindex={colIndex + 1}
                      aria-selected={false}
                      tabIndex={-1}
                      className={`${styles.grid_column_header_all}`}
                      style={{ gridColumnStart: colIndex + 1, ...(column === "share" && { padding: `0px` }) }}
                    >
                      <div className={`${styles.grid_column_header_inner} pointer-events-none`}>
                        {!(column === "yo2y_growth" && language === "ja") && (
                          <span
                            className={`${styles.grid_column_header_inner_name} pointer-events-none ${
                              column === "sales_target" && `${styles.sales_target}`
                            }`}
                          >
                            {displayValue}
                          </span>
                        )}
                        {column === "yo2y_growth" && language === "ja" && (
                          <>
                            <span className={`${styles.grid_column_header_inner_name} pointer-events-none`}>
                              前年度
                            </span>
                            <span className={`${styles.grid_column_header_inner_name} pointer-events-none`}>
                              前年伸び率実績
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* ----------- ヘッダー ここまで ----------- */}
              {/* ----------- rowgroup ----------- */}
              <div role="rowgroup">
                {/* ----------- Row 年度・半期リスト ----------- */}
                {/* {rowHeaderListTarget.map((row, rowIndex) => { */}
                {salesSummaryRowData &&
                  salesSummaryRowData.map((row, rowIndex) => {
                    // rowヘッダー 期間名
                    // const rowHeaderName = formatRowName(row.period_type, upsertSettingEntitiesObj.fiscalYear)[language];
                    const rowHeaderName = inputSalesTargetsList[rowIndex].title[language];

                    // 売上目標
                    const inputSalesTarget = inputSalesTargetsList[rowIndex].inputTarget;
                    const setInputSalesTarget = inputSalesTargetsList[rowIndex].setInputTarget;
                    // 前年比
                    const inputYoYGrowth = inputSalesTargetsList[rowIndex].inputYoYGrowth;
                    const setInputYoYGrowth = inputSalesTargetsList[rowIndex].setInputYoYGrowth;
                    // 売上推移
                    const salesTrends = inputSalesTargetsList[rowIndex].salesTrends;
                    const setSalesTrends = inputSalesTargetsList[rowIndex].setSalesTrends;

                    // 売上推移タイトル
                    // const salesTrendTitle = getTitle(salesTrends?.title ?? undefined);

                    return (
                      <div key={`grid_row_${rowIndex}`} role="row" className={`${styles.row}`}>
                        {columnHeaderListTarget.map((column, colIndex) => {
                          // let displayValue = formatRowCell(column, upsertTargetObj.fiscalYear)[language];

                          // 行の期間タイプとカラムの値に応じて表示するデータをフォーマット
                          const displayCellValue = formatDisplayValue(row, column);
                          return (
                            <div
                              key={colIndex}
                              role="gridcell"
                              aria-colindex={colIndex + 1}
                              aria-selected={false}
                              tabIndex={-1}
                              className={`${styles.grid_cell}`}
                              style={{
                                gridColumnStart: colIndex + 1,
                                ...(column === "share" && { padding: `0px` }),
                              }}
                            >
                              {/* {column === "period_type" && <span>{rowHeaderName}</span>} */}
                              {column === "period_type" && (
                                <div className={`flex items-center`}>
                                  <span>{rowHeaderName}</span>
                                  {((row.period_type === "half_year" && isEnableInputMonthTarget) ||
                                    (row.period_type === "first_quarter" &&
                                      salesTargetFirstQuarterStatus &&
                                      salesTargetFirstQuarterStatus.isComplete) ||
                                    (row.period_type === "second_quarter" &&
                                      salesTargetSecondQuarterStatus &&
                                      salesTargetSecondQuarterStatus.isComplete)) && (
                                    <>
                                      <BsCheck2 className="pointer-events-none ml-[6px] min-h-[18px] min-w-[18px] stroke-1 text-[18px] text-[#00d436]" />
                                      {/* <IoClose className="pointer-events-none ml-[6px] min-h-[18px] min-w-[18px] stroke-1 text-[18px] text-[var(--main-color-tk)]" /> */}
                                    </>
                                  )}
                                </div>
                              )}

                              {/* -------------------- 🌟半期、Q1🌟 -------------------- */}
                              {column === "sales_target" &&
                                ["half_year", "first_quarter"].includes(row.period_type) && (
                                  <input
                                    type="text"
                                    // placeholder="例：600万円 → 6000000　※半角で入力"
                                    className={`${styles.input_box} ${styles.upsert}`}
                                    // value={inputDiscountAmountEdit ? inputDiscountAmountEdit : ""}
                                    value={inputSalesTarget ? inputSalesTarget : ""}
                                    onChange={(e) => {
                                      setInputSalesTarget(e.target.value);
                                    }}
                                    onFocus={() => {
                                      // 売上目標が0以外のfalsyならリターン
                                      const replacedPrice = zenkakuToHankaku(inputSalesTarget).replace(/[^\d.]/g, "");
                                      if (!isValidNumber(replacedPrice)) {
                                        console.log(
                                          "リターンreplacedPrice",
                                          replacedPrice,
                                          !isValidNumber(replacedPrice)
                                        );
                                        return;
                                      }
                                      // console.log(
                                      //   "こここinputSalesTarget",
                                      //   inputSalesTarget,
                                      //   "replacedPrice",
                                      //   replacedPrice
                                      // );
                                      // フォーカス時は数字と小数点以外除去
                                      setInputSalesTarget(replacedPrice);
                                      // setInputSalesTarget(inputSalesTarget.replace(/[^\d.]/g, ""));
                                    }}
                                    onBlur={(e) => {
                                      // if (e.target.value === "" && inputSalesTarget === "") {
                                      //   console.log(
                                      //     "現在の入力値とstateがともに空文字のため何もせずリターン",
                                      //     e.target.value
                                      //   );
                                      //   return;
                                      // }
                                      // ---------------- 🔸半期、Q1の売上目標に対する処理🔸 ----------------
                                      // 現在の売上目標金額
                                      const replacedPrice = zenkakuToHankaku(inputSalesTarget).replace(/[^\d.]/g, "");
                                      // const replacedPrice = inputSalesTarget.replace(/[^\d.]/g, "");

                                      // 🔸空文字入力の場合のリセットルート --------------------
                                      // 売上目標が空文字の場合は売上推移から目標を取り除いてリターンする
                                      if (!checkNotFalsyExcludeZero(replacedPrice)) {
                                        console.log(
                                          "空文字のため売上目標、前年比、売上推移、シェアをリセット",
                                          replacedPrice,
                                          row.period_type
                                        );
                                        // ------------------ 🔹入力行リセット ------------------
                                        // 売上目標をリセット
                                        setInputSalesTarget("");
                                        // 売上推移をリセット
                                        setSalesTrends({
                                          ...salesSummaryRowData[rowIndex].sales_trend,
                                          updateAt: Date.now(),
                                        });
                                        // 前年比をリセット
                                        setInputYoYGrowth("");
                                        // シェアをリセット シェアは半期のみ表示するため行のperiod_typeがhalf_yearの時にのみシェアをリセット
                                        if (row.period_type === "half_year") {
                                          setShareHalfYear(0);
                                        }
                                        // ------------------ 🔹入力行リセット ------------------

                                        // ------------------ 🔹Q2リセット ------------------
                                        // 半期の売上目標が空文字になった場合には、Q1とQ2のシェアと売上推移をリセット
                                        // Q2の売上目標をリセット
                                        setInputSalesTargetSecondQuarter("");
                                        // Q2の売上推移をリセット
                                        setSalesTrendsSecondQuarter({
                                          ...salesSummaryRowData[2].sales_trend,
                                          updateAt: Date.now(),
                                        });
                                        // Q2の前年比をリセット
                                        setInputYoYGrowthSecondQuarter("");
                                        // // Q1, Q2のシェアをリセット
                                        // setShareFirstQuarter(0);
                                        // setShareSecondQuarter(0);
                                        // ------------------ 🔹Q2リセット ------------------

                                        // ------------------ 🔹month_xxリセット ------------------
                                        // 半期、Q1が空文字で入力されリセット時に
                                        // month_xxが一つでも入力済み状態ならmonth_xxを全てリセットする
                                        const isAlreadyInputMonth = [
                                          inputSalesTargetMonth01,
                                          inputSalesTargetMonth02,
                                          inputSalesTargetMonth03,
                                          inputSalesTargetMonth04,
                                          inputSalesTargetMonth05,
                                          inputSalesTargetMonth06,
                                        ].some((month) => month !== "");

                                        if (isAlreadyInputMonth) {
                                          // month_xx 月次売上目標を全てリセット
                                          inputSalesTargetsList.forEach((target) => {
                                            // 売上目標が入力済みの月次のみリセット
                                            if (
                                              [
                                                "month_01",
                                                "month_02",
                                                "month_03",
                                                "month_04",
                                                "month_05",
                                                "month_06",
                                              ].includes(target.key) &&
                                              target.inputTarget !== ""
                                            ) {
                                              // 売上目標リセット
                                              target.setInputTarget("");
                                              // 前年比リセット
                                              if (target.inputYoYGrowth !== "") target.setInputYoYGrowth("");
                                              // 売上推移リセット lengthが4で売上目標が追加されてる場合のみリセット
                                              const trendData = target.salesTrends?.data;
                                              if (
                                                trendData &&
                                                trendData.length === 4 &&
                                                mapSalesSummaryRowPeriodTypeToObj
                                              ) {
                                                const initialTrend = mapSalesSummaryRowPeriodTypeToObj.get(target.key);
                                                target.setSalesTrends(
                                                  initialTrend
                                                    ? {
                                                        ...initialTrend.sales_trend,
                                                        updateAt: Date.now(),
                                                      }
                                                    : null
                                                );
                                              }
                                              // month_xxはシェアがなしのため3つリセットでOK
                                            }
                                          });
                                          // 🔹「月次残り目標」をリセット
                                          if (salesTargetFirstQuarterStatus) setSalesTargetFirstQuarterStatus(null);
                                          if (salesTargetSecondQuarterStatus) setSalesTargetSecondQuarterStatus(null);
                                        }
                                        // ------------------ 🔹month_xxリセット ------------------

                                        // 🔹半期が空文字になった場合には、総合目標に対する半期残り目標金額を再計算して更新する
                                        if (row.period_type === "half_year" && salesTargetsHalfDetails) {
                                          // 🔹残り合計を更新
                                          const copiedTotalInputSalesTargetsHalfDetails = cloneDeep(
                                            totalInputSalesTargetsHalfDetails
                                          );
                                          // 空文字を入力したエンティティと同じidのオブジェクトを取り出し0をセット
                                          const newTotalTargetObj =
                                            copiedTotalInputSalesTargetsHalfDetails.input_targets_array.find(
                                              (obj) => obj.entity_id === entityId
                                            );

                                          if (!newTotalTargetObj) {
                                            return alert("売上目標合計データが取得できませんでした。");
                                          }

                                          // 半期を更新
                                          newTotalTargetObj.input_targets["sales_target_half"] = 0;

                                          // 全エンティティの配列を更新
                                          const newTotalInputSalesTargetsHalfDetailsArray =
                                            copiedTotalInputSalesTargetsHalfDetails.input_targets_array.map(
                                              (entityTargetObj) =>
                                                entityTargetObj.entity_id === entityId
                                                  ? newTotalTargetObj
                                                  : entityTargetObj
                                            );

                                          // 🔸全てのエンティティの売上目標合計を再計算
                                          let newSalesTargetHalf = 0;
                                          newTotalInputSalesTargetsHalfDetailsArray.forEach((obj) => {
                                            newSalesTargetHalf += obj.input_targets.sales_target_half;
                                          });

                                          const newTotalTargetsHalfDetailsObj = {
                                            total_targets: {
                                              sales_target_half: newSalesTargetHalf,
                                            },
                                            input_targets_array: newTotalInputSalesTargetsHalfDetailsArray,
                                          } as TotalSalesTargetsHalfDetailsObj;

                                          setTotalInputSalesTargetsHalfDetails(newTotalTargetsHalfDetailsObj);
                                        }

                                        // 🔸month_xxの全入力完了状態が未完了となるため、このメンバーのisCompleteAllMonthTargetsがtrueだった場合にはfalseにする
                                        if (monthTargetStatusMapForAllMembers) {
                                          // 新いMapオブジェクトを作成し、既存のエントリをコピー
                                          const newMap = new Map(monthTargetStatusMapForAllMembers);

                                          if (newMap.has(entityId)) {
                                            const targetMemberObj = newMap.get(entityId);

                                            // 全て完了しておらず、今回の入力で全て完了になったらZustandを更新
                                            if (targetMemberObj && targetMemberObj.isCompleteAllMonthTargets) {
                                              // このメンバーのisCompleteAllMonthTargetsをfalseに更新してMapオブジェクトのstateを更新
                                              const updatedMemberObj = {
                                                ...targetMemberObj,
                                                isCompleteAllMonthTargets: false,
                                              };
                                              newMap.set(entityId, updatedMemberObj); // 更新したオブジェクトでMapを更新

                                              // Zustandステートを新しいMapで更新
                                              setMonthTargetStatusMapForAllMembers(newMap);
                                            }
                                          }
                                        }

                                        // 空文字入力の場合にはここでリターン
                                        return;
                                      }
                                      // 🔸空文字入力の場合のリセットルート ここまで --------------------

                                      // 🔸売上目標金額を更新(フォーマット後)【半期・Q1】
                                      const convertedSalesTarget = checkNotFalsyExcludeZero(inputSalesTarget)
                                        ? convertToYen(inputSalesTarget)
                                        : null;
                                      const newFormatSalesTarget = formatDisplayPrice(convertedSalesTarget || 0);
                                      setInputSalesTarget(newFormatSalesTarget);

                                      // 🔸前年比の計算【半期・Q1】
                                      const {
                                        yearOverYear,
                                        error: yoyError,
                                        isPositive,
                                      } = calculateYearOverYear(
                                        convertedSalesTarget,
                                        row.last_year_sales,
                                        1,
                                        true,
                                        false
                                      );
                                      if (yoyError) {
                                        console.log(`❌${row.period_type} 値引率の取得に失敗`, yoyError);
                                        setInputYoYGrowth("");
                                      } else if (yearOverYear !== null) {
                                        setInputYoYGrowth(yearOverYear);
                                      }

                                      // 🔸各期間ごとのDate【半期・Q1】
                                      const halfYear =
                                        selectedPeriodTypeForMemberLevel === "first_half_details"
                                          ? upsertSettingEntitiesObj.fiscalYear * 10 + 1
                                          : upsertSettingEntitiesObj.fiscalYear * 10 + 2;
                                      const firstQuarter =
                                        selectedPeriodTypeForMemberLevel === "first_half_details"
                                          ? upsertSettingEntitiesObj.fiscalYear * 10 + 1
                                          : upsertSettingEntitiesObj.fiscalYear * 10 + 3;
                                      const secondQuarter =
                                        selectedPeriodTypeForMemberLevel === "first_half_details"
                                          ? upsertSettingEntitiesObj.fiscalYear * 10 + 2
                                          : upsertSettingEntitiesObj.fiscalYear * 10 + 4;

                                      // 🔸売上推移に追加【半期・Q1】
                                      if (salesTrends) {
                                        // ディープコピー
                                        let newTrend = cloneDeep(salesTrends) as SparkChartObj;
                                        let newDataArray = [...newTrend.data];
                                        const newDate =
                                          row.period_type === "half_year"
                                            ? halfYear
                                            : row.period_type === "first_quarter"
                                            ? firstQuarter
                                            : secondQuarter;
                                        const newData = {
                                          date: newDate,
                                          value: convertedSalesTarget,
                                        };
                                        if (newDataArray.length === 3) {
                                          newDataArray.push(newData);
                                        } else if (newDataArray.length === 4) {
                                          newDataArray.splice(-1, 1, newData);
                                        }
                                        const newTitle =
                                          row.period_type === "half_year"
                                            ? `${upsertSettingEntitiesObj.fiscalYear}${getTitle("half_year").en}`
                                            : row.period_type === "first_quarter"
                                            ? `${upsertSettingEntitiesObj.fiscalYear}${getTitle("first_quarter").en}`
                                            : `${upsertSettingEntitiesObj.fiscalYear}${getTitle("second_quarter").en}`;
                                        newTrend = {
                                          ...newTrend,
                                          title: newTitle,
                                          mainValue: convertedSalesTarget,
                                          growthRate:
                                            yearOverYear !== null ? parseFloat(yearOverYear.replace(/%/g, "")) : null,
                                          data: newDataArray,
                                        };
                                        console.log(
                                          "ここ🔥🔥🔥🔥🔥🔥 newTrend",
                                          newTrend,
                                          "row.period_type ",
                                          row.period_type
                                        );
                                        setSalesTrends({ ...newTrend, updateAt: Date.now() });
                                      }

                                      // 同時にシェア、下半期も計算して更新する
                                      // if (row.period_type === "first_half" || row.period_type === "fiscal_year") {
                                      if (row.period_type === "first_quarter" || row.period_type === "half_year") {
                                        const convertedTotalTargetHalf = zenkakuToHankaku(inputSalesTargetHalf).replace(
                                          /[^\d.]/g,
                                          ""
                                        );
                                        const convertedFirstQuarterTarget = zenkakuToHankaku(
                                          inputSalesTargetFirstQuarter
                                        ).replace(/[^\d.]/g, "");

                                        // 🔸半期・Q1がどちらも入力済みで、かつ、数値として扱える「Q/半期」入力完了ルート
                                        if (
                                          (row.period_type === "first_quarter" &&
                                            isValidNumber(convertedTotalTargetHalf) &&
                                            isValidNumber(convertedSalesTarget) &&
                                            inputSalesTargetHalf !== "0") ||
                                          (row.period_type === "half_year" &&
                                            isValidNumber(convertedSalesTarget) &&
                                            isValidNumber(convertedFirstQuarterTarget) &&
                                            convertedFirstQuarterTarget !== "0")
                                        ) {
                                          try {
                                            // 🔹半期とQ1の売上目標 Decimalオブジェクトの生成
                                            // 入力がQ1なら半期を渡し、入力が半期なら入力値をそのまま渡すことで半期のDecimalを作成
                                            const totalTargetDecimal = new Decimal(
                                              row.period_type === "first_quarter"
                                                ? convertedTotalTargetHalf
                                                : convertedSalesTarget!
                                            );
                                            const firstQuarterTargetDecimal = new Decimal(
                                              row.period_type === "first_quarter"
                                                ? convertedSalesTarget!
                                                : convertedFirstQuarterTarget
                                            );
                                            // 🔸Q1が半期を上回っていた場合は、他方をリセット
                                            // 半期入力で半期がQ1を下回った場合はQ1をリセット
                                            if (
                                              row.period_type === "half_year" &&
                                              totalTargetDecimal.lessThan(firstQuarterTargetDecimal)
                                            ) {
                                              // Q1・Q2 売上目標をリセット
                                              setInputSalesTargetFirstQuarter("");
                                              setInputSalesTargetSecondQuarter("");
                                              // // Q1・Q2 シェアをリセット
                                              // setShareFirstQuarter(0);
                                              // setShareSecondQuarter(0);
                                              // Q1・Q2 前年比をリセット
                                              setInputYoYGrowthFirstQuarter("");
                                              setInputYoYGrowthSecondQuarter("");
                                              // Q1・Q2 売上推移をリセット
                                              setSalesTrendsFirstQuarter({
                                                ...salesSummaryRowData[1].sales_trend,
                                                updateAt: Date.now(),
                                              });
                                              setSalesTrendsSecondQuarter({
                                                ...salesSummaryRowData[2].sales_trend,
                                                updateAt: Date.now(),
                                              });
                                              // 🔹メイン目標の半期売上目標Decimalオブジェクトの生成
                                              if (salesTargetsHalfDetails) {
                                                const mainTotalTargetDecimal = new Decimal(
                                                  salesTargetsHalfDetails.sales_target_half
                                                );
                                                // 🔹メイン半期目標から半期シェアを計算し、整数に丸める
                                                const fiscalYearShare = totalTargetDecimal
                                                  .dividedBy(mainTotalTargetDecimal)
                                                  .times(100)
                                                  .toFixed(0, Decimal.ROUND_HALF_UP);
                                                setShareHalfYear(Number(fiscalYearShare));

                                                console.log(
                                                  "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥halfYearShare 半期がQ1を下回った場合にはここでリターン",
                                                  fiscalYearShare
                                                );
                                              }
                                              // 半期がQ1を下回った場合にはここでリターン
                                              return;
                                            }
                                            // Q1入力でQ1が半期を上回っていた場合は半期をリセット
                                            else if (
                                              row.period_type === periodTypeNames.first_quarter &&
                                              totalTargetDecimal.lessThan(firstQuarterTargetDecimal)
                                            ) {
                                              // 半期・Q2 売上目標をリセット
                                              setInputSalesTargetHalf("");
                                              setInputSalesTargetSecondQuarter("");
                                              // Q1・Q2 シェアをリセット(Q1は半期売上目標がリセットされるためシェアもリセット)
                                              // setShareFirstQuarter(0);
                                              // setShareSecondQuarter(0);
                                              // 半期・Q2 前年比をリセット
                                              setInputYoYGrowthHalf("");
                                              setInputYoYGrowthSecondQuarter("");
                                              // 半期・Q2 売上推移をリセット
                                              setSalesTrendsHalf({
                                                ...salesSummaryRowData[0].sales_trend,
                                                updateAt: Date.now(),
                                              });
                                              setSalesTrendsSecondQuarter({
                                                ...salesSummaryRowData[2].sales_trend,
                                                updateAt: Date.now(),
                                              });
                                              // // 🔹メイン目標のQ1売上目標Decimalオブジェクトの生成
                                              // if (salesTargetsHalfDetails) {
                                              //   const mainFirstQuarterTargetDecimal = new Decimal(
                                              //     salesTargetsHalfDetails.sales_target_half
                                              //   );
                                              //   // 🔹メインQ1目標からQ1シェアを計算し、整数に丸める
                                              //   const firstQuarterShare = firstQuarterTargetDecimal
                                              //     .dividedBy(mainFirstQuarterTargetDecimal)
                                              //     .times(100)
                                              //     .toFixed(0, Decimal.ROUND_HALF_UP);
                                              //   setShareFirstQuarter(Number(firstQuarterShare));
                                              // }
                                              // 半期がQ1を下回った場合にはここでリターン
                                              return;
                                            }

                                            // 🔸Q2売上目標を計算して更新
                                            const newSecondQuarterTarget = totalTargetDecimal
                                              .minus(firstQuarterTargetDecimal)
                                              .toNumber();
                                            const formattedSecondQuarterTarget =
                                              formatDisplayPrice(newSecondQuarterTarget);
                                            setInputSalesTargetSecondQuarter(formattedSecondQuarterTarget);
                                            // シェア算出時に使用するために下期目標の入力値のDecimalオブジェクトしておく
                                            const secondQuarterTargetDecimal = new Decimal(newSecondQuarterTarget);

                                            const copiedTotalInputSalesTargetsHalfYear = cloneDeep(
                                              totalInputSalesTargetsHalfDetails
                                            );

                                            const newTotalTargetObj =
                                              copiedTotalInputSalesTargetsHalfYear.input_targets_array.find(
                                                (obj) => obj.entity_id === entityId
                                              );

                                            if (!salesTargetsHalfDetails)
                                              return alert("総合目標データが取得できませんでした。");
                                            if (!newTotalTargetObj)
                                              return alert("売上目標合計データが取得できませんでした。");

                                            // 🔸シェア算出ここから --------------------------------------
                                            // メイン目標に対してシェア割を算出
                                            // メンバーレベルでは、総合目標に対するシェアの算出は「半期」のみ
                                            if (row.period_type === "half_year") {
                                              // 全メンバーの半期各入力値に今回算出した半期目標金額をセット
                                              newTotalTargetObj.input_targets["sales_target_half"] =
                                                totalTargetDecimal.toNumber();

                                              // 全メンバーの半期目標配列を更新
                                              const newTotalInputSalesTargetsHalfDetailsArray =
                                                copiedTotalInputSalesTargetsHalfYear.input_targets_array.map(
                                                  (entityTargetObj) =>
                                                    entityTargetObj.entity_id === entityId
                                                      ? newTotalTargetObj
                                                      : entityTargetObj
                                                );

                                              // 全てのメンバーの半期売上目標合計を再計算
                                              let newTotalSalesTargetHalfYear = 0;
                                              newTotalInputSalesTargetsHalfDetailsArray.forEach((obj) => {
                                                newTotalSalesTargetHalfYear += obj.input_targets.sales_target_half;
                                              });

                                              const newTotalTargetsHalfDetailsObj = {
                                                total_targets: {
                                                  sales_target_half: newTotalSalesTargetHalfYear,
                                                },
                                                input_targets_array: newTotalInputSalesTargetsHalfDetailsArray,
                                              } as TotalSalesTargetsHalfDetailsObj;

                                              setTotalInputSalesTargetsHalfDetails(newTotalTargetsHalfDetailsObj);

                                              // 🔹メイン目標の半期の売上目標Decimalオブジェクトの生成
                                              const mainTotalTargetDecimal = new Decimal(
                                                salesTargetsHalfDetails.sales_target_half
                                              );
                                              // 🔹メイン半期目標からメンバーの半期シェアを計算し、整数に丸める
                                              const halfYearShare = totalTargetDecimal
                                                .dividedBy(mainTotalTargetDecimal)
                                                .times(100)
                                                .toFixed(0, Decimal.ROUND_HALF_UP);
                                              console.log("🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥halfYearShare", halfYearShare);
                                              setShareHalfYear(Number(halfYearShare));
                                            }

                                            // メンバーレベルではシェア算出は半期のみ
                                            // // Q1シェアを計算し、整数に丸める
                                            // const firstQuarterShare = firstQuarterTargetDecimal
                                            //   .dividedBy(totalTargetDecimal)
                                            //   .times(100)
                                            //   .toFixed(0, Decimal.ROUND_HALF_UP);
                                            // setShareFirstQuarter(Number(firstQuarterShare));
                                            // // 下期シェアを計算する（100からQ1シェアを引く）
                                            // const secondQuarterShare = 100 - Number(firstQuarterShare);
                                            // setShareSecondQuarter(secondQuarterShare);
                                            // // 下期売上目標を計算して更新
                                            // const newSecondQuarterTarget = totalTargetDecimal
                                            //   .minus(firstQuarterTargetDecimal)
                                            //   .toNumber();
                                            // const formattedSecondQuarterTarget =
                                            //   formatDisplayPrice(newSecondQuarterTarget);
                                            // setInputSalesTargetSecondQuarter(formattedSecondQuarterTarget);
                                            // 🔸シェア算出ここまで --------------------------------------

                                            // 🔸Q2前年比を算出 --------------------------------------
                                            // 前年比
                                            // Q2の行を取り出して引数として渡す
                                            const rowQ2 = salesSummaryRowData.find(
                                              (obj) => obj.period_type === "second_quarter"
                                            );
                                            const secondQuarterResult = calculateYearOverYear(
                                              newSecondQuarterTarget,
                                              rowQ2?.last_year_sales ?? null,
                                              1,
                                              true,
                                              false
                                            );
                                            if (secondQuarterResult.error) {
                                              // toast.error(`エラー：${secondQuarterResult.error}🙇‍♀️`);
                                              console.log(
                                                `❌${rowQ2?.period_type} 値引率の取得に失敗`,
                                                secondQuarterResult.error
                                              );
                                              setInputYoYGrowthSecondQuarter("");
                                            } else if (secondQuarterResult.yearOverYear !== null) {
                                              setInputYoYGrowthSecondQuarter(secondQuarterResult.yearOverYear);
                                            }

                                            // 🔹Q2の売上推移に追加【半期・Q1ルート】
                                            if (salesTrendsSecondQuarter && isValidNumber(newSecondQuarterTarget)) {
                                              // ディープコピー
                                              let newTrend = cloneDeep(salesTrendsSecondQuarter) as SparkChartObj;
                                              let newDataArray = [...newTrend.data];
                                              const newDate = upsertSettingEntitiesObj.fiscalYear * 10 + secondQuarter; // Q2
                                              const newData = {
                                                date: newDate,
                                                value: newSecondQuarterTarget,
                                              };
                                              // まだ売上推移チャートに売上目標が入っていない場合にはpushで末尾に追加し、既に追加ずみの場合は新たな目標金額にspliceで入れ替え
                                              if (newDataArray.length === 3) {
                                                newDataArray.push(newData);
                                              } else if (newDataArray.length === 4) {
                                                newDataArray.splice(-1, 1, newData);
                                              }
                                              const newTitle = `${upsertSettingEntitiesObj.fiscalYear}${
                                                getTitle("second_quarter").en
                                              }`;
                                              newTrend = {
                                                ...newTrend,
                                                title: newTitle,
                                                mainValue: newSecondQuarterTarget,
                                                growthRate: secondQuarterResult.yearOverYear
                                                  ? parseFloat(secondQuarterResult.yearOverYear.replace(/%/g, ""))
                                                  : null,
                                                data: newDataArray,
                                              };
                                              console.log(
                                                "ここ🔥🔥🔥🔥🔥🔥 newTrend",
                                                newTrend,
                                                "row.period_type ",
                                                row.period_type
                                              );
                                              setSalesTrendsSecondQuarter({ ...newTrend, updateAt: Date.now() });
                                            }

                                            // 🔹月次残り目標のQ1, Q2に入力ずみの目標をセットし、残り金額はそのままQの値をセット(まだmonth_xxが何も入力されていない状態のため)
                                            // 🔸月次残り目標/Q1
                                            const newRestTargetFirstQuarter = firstQuarterTargetDecimal.toNumber();
                                            setSalesTargetFirstQuarterStatus({
                                              key: "sales_target_first_quarter",
                                              total_sales_target: formatToJapaneseYen(0),
                                              title:
                                                selectedPeriodTypeForMemberLevel === "first_half_details"
                                                  ? { ja: "Q1", en: `Q1` }
                                                  : { ja: `Q3`, en: `Q3` },
                                              mainTarget:
                                                row.period_type === "first_quarter"
                                                  ? newFormatSalesTarget
                                                  : inputSalesTargetFirstQuarter,
                                              restTarget: newRestTargetFirstQuarter,
                                              isNegative: false,
                                              isComplete: false,
                                            });
                                            // 🔸月次残り目標/Q2
                                            setSalesTargetSecondQuarterStatus({
                                              key: "sales_target_second_quarter",
                                              total_sales_target: formatToJapaneseYen(0),
                                              title:
                                                selectedPeriodTypeForMemberLevel === "first_half_details"
                                                  ? { ja: "Q2", en: `Q2` }
                                                  : { ja: `Q4`, en: `Q4` },
                                              mainTarget: formattedSecondQuarterTarget,
                                              restTarget: newSecondQuarterTarget,
                                              isNegative: false,
                                              isComplete: false,
                                            });
                                          } catch (error: any) {
                                            // toast.error("エラー：シェアの算出に失敗しました...🙇‍♀️");
                                            console.log(`❌無効な入力値です。`, error);
                                          }
                                        }
                                        // 半期かQ1が未入力のルート 半期の入力でかつ、半期・Q1のどちらかが未入力の場合、入力した期間のシェアと前年比を算出
                                        else {
                                          if (row.period_type === "half_year") {
                                            console.log(
                                              "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥halfYearShare 半期かQ1が未入力のルート",
                                              "row.period_type",
                                              row.period_type,
                                              "row",
                                              row
                                            );
                                            // convertedSalesTarget
                                            if (!isValidNumber(convertedSalesTarget)) return;
                                            // 🔸半期のシェアの算出
                                            // 🔹総合目標の年度売上目標Decimalオブジェクトの生成
                                            if (salesTargetsHalfDetails) {
                                              const mainTargetDecimal = new Decimal(
                                                salesTargetsHalfDetails.sales_target_half
                                              );
                                              const inputTargetDecimal = new Decimal(convertedSalesTarget!);
                                              // 🔹メイン年度目標から半期シェアを計算し、整数に丸める
                                              const newShare = inputTargetDecimal
                                                .dividedBy(mainTargetDecimal)
                                                .times(100)
                                                .toFixed(0, Decimal.ROUND_HALF_UP);
                                              setShareHalfYear(Number(newShare));

                                              // 🔹残り合計を更新
                                              const copiedTotalInputSalesTargetsHalfDetails = cloneDeep(
                                                totalInputSalesTargetsHalfDetails
                                              );

                                              const newTotalTargetObj =
                                                copiedTotalInputSalesTargetsHalfDetails.input_targets_array.find(
                                                  (obj) => obj.entity_id === entityId
                                                );

                                              if (!newTotalTargetObj) {
                                                return alert("売上目標合計データが取得できませんでした。");
                                              }

                                              // 半期を更新
                                              newTotalTargetObj.input_targets["sales_target_half"] =
                                                convertedSalesTarget!;

                                              // 全エンティティの配列を更新
                                              const newTotalInputSalesTargetsHalfDetailsArray =
                                                copiedTotalInputSalesTargetsHalfDetails.input_targets_array.map(
                                                  (entityTargetObj) =>
                                                    entityTargetObj.entity_id === entityId
                                                      ? newTotalTargetObj
                                                      : entityTargetObj
                                                );

                                              // 🔸全てのエンティティの売上目標合計を再計算
                                              let newSalesTargetHalf = 0;
                                              newTotalInputSalesTargetsHalfDetailsArray.forEach((obj) => {
                                                newSalesTargetHalf += obj.input_targets.sales_target_half;
                                              });

                                              const newTotalTargetsHalfDetailsObj = {
                                                total_targets: {
                                                  sales_target_half: newSalesTargetHalf,
                                                },
                                                input_targets_array: newTotalInputSalesTargetsHalfDetailsArray,
                                              } as TotalSalesTargetsHalfDetailsObj;

                                              setTotalInputSalesTargetsHalfDetails(newTotalTargetsHalfDetailsObj);
                                            }
                                          }
                                        }
                                      }
                                    }}
                                  />
                                )}
                              {/* // ---------------- 🌟半期、Q1🌟 ここまで ---------------- */}

                              {/* // ---------------- 🌟month01~06🌟 ---------------- */}
                              {/* 半期、Q1, Q2が全て入力完了していて、かつ、半期目標とQ1, Q2の合計値が一致している場合にのみ月次目標の入力を許可する */}
                              {isEnableInputMonthTarget &&
                                column === "sales_target" &&
                                ["month_01", "month_02", "month_03", "month_04", "month_05", "month_06"].includes(
                                  row.period_type
                                ) && (
                                  <input
                                    type="text"
                                    // placeholder="例：600万円 → 6000000　※半角で入力"
                                    className={`${styles.input_box} ${styles.upsert}`}
                                    // value={inputDiscountAmountEdit ? inputDiscountAmountEdit : ""}
                                    value={inputSalesTarget ? inputSalesTarget : ""}
                                    onChange={(e) => {
                                      setInputSalesTarget(e.target.value);
                                    }}
                                    onFocus={() => {
                                      // 売上目標が0以外のfalsyならリターン
                                      const replacedPrice = zenkakuToHankaku(inputSalesTarget).replace(/[^\d.]/g, "");
                                      if (!isValidNumber(replacedPrice)) {
                                        console.log(
                                          "リターンreplacedPrice",
                                          replacedPrice,
                                          !isValidNumber(replacedPrice)
                                        );
                                        return;
                                      }
                                      // console.log(
                                      //   "こここinputSalesTarget",
                                      //   inputSalesTarget,
                                      //   "replacedPrice",
                                      //   replacedPrice
                                      // );
                                      // フォーカス時は数字と小数点以外除去
                                      setInputSalesTarget(replacedPrice);
                                      // setInputSalesTarget(inputSalesTarget.replace(/[^\d.]/g, ""));
                                    }}
                                    onBlur={(e) => {
                                      // if (e.target.value === "" && inputSalesTarget === "") {
                                      //   console.log("空文字のため何もせずリターン", e.target.value);
                                      //   return;
                                      // }
                                      // ---------------- 🔸month01~06🔸 ----------------
                                      // 現在の売上目標金額【month01~06】
                                      const replacedPrice = zenkakuToHankaku(inputSalesTarget).replace(/[^\d.]/g, "");
                                      // const replacedPrice = inputSalesTarget.replace(/[^\d.]/g, "");

                                      // 🔸空文字入力の場合のリセットルート --------------------
                                      // 売上目標が空文字の場合は売上推移から目標を取り除いてリターンする
                                      if (!checkNotFalsyExcludeZero(replacedPrice)) {
                                        console.log(
                                          "空文字のため売上目標、前年比、売上推移、シェアをリセット",
                                          replacedPrice,
                                          row.period_type
                                        );
                                        // ------------ 🔹入力行リセット ------------
                                        // 売上目標をリセット【month01~06】
                                        setInputSalesTarget("");
                                        // 売上推移をリセット【month01~06】
                                        setSalesTrends({
                                          ...salesSummaryRowData[rowIndex].sales_trend,
                                          updateAt: Date.now(),
                                        });
                                        // 前年比をリセット【month01~06】
                                        setInputYoYGrowth("");
                                        // month_xxはシェアを表示しないためシェアリセットなし
                                        // ------------ 🔹入力行リセット ------------

                                        // 🔹「月次残り目標/Q」を入力したmonth_xxが0にした状態で再計算
                                        // ---------------- リセット関数 Q1/Q2両方に適用 ----------------
                                        // 🔸Q期間内の全てのmonth_xxの売上目標、前年比、売上推移をリセット
                                        // 🔸Q期間内の月次目標合計値+残り金額stateをリセット
                                        const resetMonthsAndTotalTarget = ({
                                          quarterMonths,
                                          periodType,
                                          periodKey,
                                          inputMainTargetQuarter,
                                          monthsStrArray,
                                          setSalesTargetQuarterStatus,
                                        }: {
                                          quarterMonths: {
                                            periodType: FirstQuarterMonthsKey | SecondQuarterMonthsKey;
                                            inputTarget: string;
                                          }[];
                                          periodType: HalfQuarterMonthsKey;
                                          periodKey: "sales_target_first_quarter" | "sales_target_second_quarter";
                                          inputMainTargetQuarter: string;
                                          monthsStrArray: (FirstQuarterMonthsKey | SecondQuarterMonthsKey | string)[];
                                          setSalesTargetQuarterStatus: Dispatch<SetStateAction<QuarterStatus | null>>;
                                        }) => {
                                          // const firstQuarterMonths = [
                                          //   { periodType: "month_01", inputTarget: inputSalesTargetMonth01 },
                                          //   { periodType: "month_02", inputTarget: inputSalesTargetMonth02 },
                                          //   { periodType: "month_03", inputTarget: inputSalesTargetMonth03 },
                                          // ];
                                          // 空文字に更新した期間のmonth_xxに0を配列にセット
                                          // const newQuarterMonths = firstQuarterMonths.map((obj) => {
                                          const newQuarterMonths = quarterMonths.map((obj) => {
                                            // if (obj.periodType === row.period_type) {
                                            if (obj.periodType === periodType) {
                                              return {
                                                periodType: obj.periodType,
                                                inputTarget: "0",
                                              };
                                            } else {
                                              return obj;
                                            }
                                          });

                                          // Q1内の各月次目標の合計値を再計算して残り金額を算出してstate更新
                                          // 入力値のみの配列を作成して関数の引数に渡す
                                          const inputMonths = newQuarterMonths.map((obj) => obj.inputTarget);

                                          // const result = validateMonthlyTargetsAgainstMain(
                                          //   "sales_target_first_quarter",
                                          //   inputSalesTargetFirstQuarter,
                                          //   inputMonths
                                          // );
                                          const result = validateMonthlyTargetsAgainstMain(
                                            periodKey,
                                            inputMainTargetQuarter,
                                            inputMonths
                                          );

                                          // resultがエラーのルート Q1の期間内のmonth_xxを全てリセット
                                          if (result === null) {
                                            inputSalesTargetsList.forEach((target) => {
                                              // Q1期間内のみリセット
                                              // if (["month_01", "month_02", "month_03"].includes(target.key)) {
                                              if (monthsStrArray.includes(target.key)) {
                                                // 既に空文字のinputはスルー
                                                if (target.inputTarget !== "") {
                                                  // 売上目標をリセット
                                                  target.setInputTarget("");
                                                  // 前年比をリセット
                                                  target.setInputYoYGrowth("");
                                                  // 売上推移リセット lengthが4で売上目標が追加されてる場合のみリセット
                                                  const trendData = target.salesTrends?.data;
                                                  if (
                                                    trendData &&
                                                    trendData.length === 4 &&
                                                    mapSalesSummaryRowPeriodTypeToObj
                                                  ) {
                                                    const initialTrend = mapSalesSummaryRowPeriodTypeToObj.get(
                                                      target.key
                                                    );
                                                    target.setSalesTrends(
                                                      initialTrend
                                                        ? {
                                                            ...initialTrend.sales_trend,
                                                            updateAt: Date.now(),
                                                          }
                                                        : null
                                                    );
                                                  }
                                                }
                                                // シェアはmonth_xxはなし
                                              }
                                            });

                                            const _mainTarget =
                                              periodKey === "sales_target_first_quarter"
                                                ? inputSalesTargetFirstQuarter
                                                : inputSalesTargetSecondQuarter;
                                            // 残り目標stateも初期状態にリセット
                                            // setSalesTargetFirstQuarterStatus({
                                            setSalesTargetQuarterStatus({
                                              key: "sales_target_first_quarter",
                                              total_sales_target: formatToJapaneseYen(0),
                                              title:
                                                selectedPeriodTypeForMemberLevel === "first_half_details"
                                                  ? { ja: "Q1", en: `Q1` }
                                                  : { ja: `Q3`, en: `Q3` },
                                              // mainTarget: inputSalesTargetFirstQuarter,
                                              mainTarget: _mainTarget,
                                              // restTarget: Number(zenkakuToHankaku(inputSalesTargetFirstQuarter).replace(/[^\d.]/g, "")),
                                              restTarget: Number(zenkakuToHankaku(_mainTarget).replace(/[^\d.]/g, "")),
                                              isNegative: false,
                                              isComplete: false,
                                            });
                                          }
                                          // 無事にresultが取得できたルート
                                          else {
                                            // setSalesTargetFirstQuarterStatus(result);
                                            setSalesTargetQuarterStatus(result);
                                          }
                                        };
                                        // ---------------- リセット関数 Q1/Q2両方に適用 ここまで ----------------

                                        // 🔸入力した空文字のmonthがQ1の期間に含まれるルート month_01~03のinputと残り金額stateを全てリセット
                                        if (["month_01", "month_02", "month_03"].includes(row.period_type)) {
                                          const firstQuarterMonths: {
                                            periodType: FirstQuarterMonthsKey;
                                            inputTarget: string;
                                          }[] = [
                                            { periodType: "month_01", inputTarget: inputSalesTargetMonth01 },
                                            { periodType: "month_02", inputTarget: inputSalesTargetMonth02 },
                                            { periodType: "month_03", inputTarget: inputSalesTargetMonth03 },
                                          ];

                                          resetMonthsAndTotalTarget({
                                            quarterMonths: firstQuarterMonths,
                                            periodType: row.period_type as HalfQuarterMonthsKey, // このブロックはmonth_xxの列のみなのでHalfQuarterMonthsKeyを型アサーション
                                            periodKey: "sales_target_first_quarter",
                                            inputMainTargetQuarter: inputSalesTargetFirstQuarter,
                                            monthsStrArray: ["month_01", "month_02", "month_03"],
                                            setSalesTargetQuarterStatus: setSalesTargetFirstQuarterStatus,
                                          });

                                          // // 空文字に更新した期間のmonth_xxに0を配列にセット
                                          // const newQuarterMonths = firstQuarterMonths.map((obj) => {
                                          //   if (obj.periodType === row.period_type) {
                                          //     return {
                                          //       periodType: obj.periodType,
                                          //       inputTarget: "0",
                                          //     };
                                          //   } else {
                                          //     return obj;
                                          //   }
                                          // });

                                          // // Q1内の各月次目標の合計値を再計算して残り金額を算出してstate更新
                                          // // 入力値のみの配列を作成して関数の引数に渡す
                                          // const inputMonths = newQuarterMonths.map((obj) => obj.inputTarget);

                                          // const result = validateMonthlyTargetsAgainstMain(
                                          //   "sales_target_first_quarter",
                                          //   inputSalesTargetFirstQuarter,
                                          //   inputMonths
                                          // );

                                          // // resultがエラーのルート Q1の期間内のmonth_xxを全てリセット
                                          // if (result === null) {
                                          //   inputSalesTargetsList.forEach((target) => {
                                          //     // Q1期間内のみリセット
                                          //     if (["month_01", "month_02", "month_03"].includes(target.key)) {
                                          //       // 既に空文字のinputはスルー
                                          //       if (target.inputTarget !== "") {
                                          //         // 売上目標をリセット
                                          //         target.setInputTarget("");
                                          //         // 前年比をリセット
                                          //         target.setInputYoYGrowth("");
                                          //         // 売上推移リセット lengthが4で売上目標が追加されてる場合のみリセット
                                          //         const trendData = target.salesTrends?.data;
                                          //         if (
                                          //           trendData &&
                                          //           trendData.length === 4 &&
                                          //           mapSalesSummaryRowPeriodTypeToObj
                                          //         ) {
                                          //           const initialTrend = mapSalesSummaryRowPeriodTypeToObj.get(
                                          //             target.key
                                          //           );
                                          //           target.setSalesTrends(
                                          //             initialTrend
                                          //               ? {
                                          //                   ...initialTrend.sales_trend,
                                          //                   updateAt: Date.now(),
                                          //                 }
                                          //               : null
                                          //           );
                                          //         }
                                          //       }
                                          //       // シェアはmonth_xxはなし
                                          //     }
                                          //   });
                                          //   // 残り目標stateも初期状態にリセット
                                          //   setSalesTargetFirstQuarterStatus({
                                          //     key: "sales_target_first_quarter",
                                          //     total_sales_target: formatToJapaneseYen(0),
                                          //     title:
                                          //       selectedPeriodTypeForMemberLevel === "first_half_details"
                                          //         ? { ja: "Q1", en: `Q1` }
                                          //         : { ja: `Q3`, en: `Q3` },
                                          //     mainTarget: inputSalesTargetFirstQuarter,
                                          //     restTarget: Number(
                                          //       zenkakuToHankaku(inputSalesTargetFirstQuarter).replace(/[^\d.]/g, "")
                                          //     ),
                                          //     isNegative: false,
                                          //     isComplete: false,
                                          //   });
                                          // }
                                          // // 無事にresultが取得できたルート
                                          // else {
                                          //   setSalesTargetFirstQuarterStatus(result);
                                          // }
                                        }
                                        // 🔸入力した空文字のmonthがQ2の期間に含まれるルート month_04~06のinputと残り金額stateを全てリセット
                                        else if (["month_04", "month_05", "month_06"].includes(row.period_type)) {
                                          const secondQuarterMonths: {
                                            periodType: SecondQuarterMonthsKey;
                                            inputTarget: string;
                                          }[] = [
                                            { periodType: "month_04", inputTarget: inputSalesTargetMonth04 },
                                            { periodType: "month_05", inputTarget: inputSalesTargetMonth05 },
                                            { periodType: "month_06", inputTarget: inputSalesTargetMonth06 },
                                          ];

                                          resetMonthsAndTotalTarget({
                                            quarterMonths: secondQuarterMonths,
                                            periodType: row.period_type as HalfQuarterMonthsKey, // このブロックはmonth_xxの列のみなのでHalfQuarterMonthsKeyを型アサーション
                                            periodKey: "sales_target_second_quarter",
                                            inputMainTargetQuarter: inputSalesTargetSecondQuarter,
                                            monthsStrArray: ["month_04", "month_05", "month_06"],
                                            setSalesTargetQuarterStatus: setSalesTargetSecondQuarterStatus,
                                          });
                                        }

                                        // 🔸month_xxの全入力完了状態が未完了となるため、このメンバーのisCompleteAllMonthTargetsがtrueだった場合にはfalseにする
                                        if (monthTargetStatusMapForAllMembers) {
                                          // 新いMapオブジェクトを作成し、既存のエントリをコピー
                                          const newMap = new Map(monthTargetStatusMapForAllMembers);

                                          if (newMap.has(entityId)) {
                                            const targetMemberObj = newMap.get(entityId);

                                            // 全て完了しておらず、今回の入力で全て完了になったらZustandを更新
                                            if (targetMemberObj && targetMemberObj.isCompleteAllMonthTargets) {
                                              // このメンバーのisCompleteAllMonthTargetsをfalseに更新してMapオブジェクトのstateを更新
                                              const updatedMemberObj = {
                                                ...targetMemberObj,
                                                isCompleteAllMonthTargets: false,
                                              };
                                              newMap.set(entityId, updatedMemberObj); // 更新したオブジェクトでMapを更新

                                              // Zustandステートを新しいMapで更新
                                              setMonthTargetStatusMapForAllMembers(newMap);
                                            }
                                          }
                                        }

                                        // リセット完了した段階でリターン
                                        return;
                                      }

                                      // 🔹ここからは正確な数値がinputに入力された場合の各種stateを更新するルート

                                      // 🔸売上目標を更新(フォーマット後)【month01~06】
                                      const convertedSalesTarget = checkNotFalsyExcludeZero(inputSalesTarget)
                                        ? convertToYen(inputSalesTarget)
                                        : null;
                                      const newFormatSalesTarget = formatDisplayPrice(convertedSalesTarget || 0);
                                      setInputSalesTarget(newFormatSalesTarget);

                                      // 🔸前年比の計算【month01~06】
                                      const {
                                        yearOverYear,
                                        error: yoyError,
                                        isPositive,
                                      } = calculateYearOverYear(
                                        convertedSalesTarget,
                                        row.last_year_sales,
                                        1,
                                        true,
                                        false
                                      );
                                      if (yoyError) {
                                        console.log(`❌${row.period_type} 値引率の取得に失敗`, yoyError);
                                        setInputYoYGrowth("");
                                      } else if (yearOverYear !== null) {
                                        setInputYoYGrowth(yearOverYear);
                                      }

                                      // 🔸売上推移に追加【month01~06】
                                      if (salesTrends) {
                                        // ディープコピー
                                        let newTrend = cloneDeep(salesTrends) as SparkChartObj;
                                        let newDataArray = [...newTrend.data];
                                        const newDate = getDateByPeriodType(row.period_type);
                                        const newData = {
                                          date: newDate,
                                          value: convertedSalesTarget,
                                        };
                                        // まだ売上推移チャートに売上目標が入っていない場合にはpushで末尾に追加し、既に追加ずみの場合は新たな目標金額にspliceで入れ替え
                                        if (newDataArray.length === 3) {
                                          newDataArray.push(newData);
                                        } else if (newDataArray.length === 4) {
                                          newDataArray.splice(-1, 1, newData);
                                        }
                                        const newTitle = `${upsertSettingEntitiesObj.fiscalYear}年${
                                          getTitle(row.period_type).ja
                                        }`;
                                        newTrend = {
                                          ...newTrend,
                                          title: newTitle,
                                          mainValue: convertedSalesTarget,
                                          growthRate:
                                            yearOverYear !== null ? parseFloat(yearOverYear.replace(/%/g, "")) : null,
                                          data: newDataArray,
                                        };
                                        console.log(
                                          "ここ🔥🔥🔥🔥🔥🔥 newTrend",
                                          newTrend,
                                          "row.period_type ",
                                          row.period_type
                                        );
                                        setSalesTrends({ ...newTrend, updateAt: Date.now() });
                                      }

                                      // 🔸month_xxはシェアの算出なし

                                      // 🔹月次残り目標金額stateを更新【month01~06】
                                      // --------------- Q1, Q2の両方で適用する関数 ---------------
                                      const updateTotalMonthTarget = ({
                                        quarterMonths,
                                        periodType,
                                        periodKey,
                                        inputMainTargetQuarter,
                                        monthsStrArray,
                                        setSalesTargetQuarterStatus,
                                      }: {
                                        quarterMonths: {
                                          periodType: FirstQuarterMonthsKey | SecondQuarterMonthsKey;
                                          inputTarget: string;
                                        }[];
                                        periodType: HalfQuarterMonthsKey;
                                        periodKey: "sales_target_first_quarter" | "sales_target_second_quarter";
                                        inputMainTargetQuarter: string;
                                        monthsStrArray: (FirstQuarterMonthsKey | SecondQuarterMonthsKey | string)[];
                                        setSalesTargetQuarterStatus: Dispatch<SetStateAction<QuarterStatus | null>>;
                                      }) => {
                                        // 今回入力したmonthに新たな目標金額をセットした3ヶ月分の配列を作成
                                        const newQuarterMonths = quarterMonths.map((obj) => {
                                          if (obj.periodType === periodType) {
                                            return {
                                              periodType: obj.periodType,
                                              inputTarget: newFormatSalesTarget,
                                            };
                                          } else {
                                            // return obj;
                                            return {
                                              periodType: obj.periodType,
                                              inputTarget: obj.inputTarget || "0",
                                            };
                                          }
                                        });

                                        // Q1内の各月次目標の合計値を再計算して残り金額を算出してstate更新
                                        // 入力値のみの配列を作成して関数の引数に渡す 空文字は0の文字列を渡す
                                        const inputMonths = newQuarterMonths.map((obj) => obj.inputTarget);
                                        // const inputMonths = newQuarterMonths.map((obj) => obj.inputTarget || "0");

                                        const result = validateMonthlyTargetsAgainstMain(
                                          periodKey,
                                          inputMainTargetQuarter,
                                          inputMonths
                                        );

                                        // resultがエラーのルート Q1の期間内のmonth_xxを全てリセット
                                        if (result === null) {
                                          inputSalesTargetsList.forEach((target) => {
                                            // Q1期間内のみリセット
                                            // if (["month_01", "month_02", "month_03"].includes(target.key)) {
                                            if (monthsStrArray.includes(target.key)) {
                                              // 既に空文字のinputはスルー
                                              if (target.inputTarget !== "") {
                                                // 売上目標をリセット
                                                target.setInputTarget("");
                                                // 前年比をリセット
                                                target.setInputYoYGrowth("");
                                                // 売上推移リセット lengthが4で売上目標が追加されてる場合のみリセット
                                                const trendData = target.salesTrends?.data;
                                                if (
                                                  trendData &&
                                                  trendData.length === 4 &&
                                                  mapSalesSummaryRowPeriodTypeToObj
                                                ) {
                                                  const initialTrend = mapSalesSummaryRowPeriodTypeToObj.get(
                                                    target.key
                                                  );
                                                  target.setSalesTrends(
                                                    initialTrend
                                                      ? {
                                                          ...initialTrend.sales_trend,
                                                          updateAt: Date.now(),
                                                        }
                                                      : null
                                                  );
                                                }
                                              }
                                              // シェアはmonth_xxはなし
                                            }
                                          });

                                          const _mainTarget =
                                            periodKey === "sales_target_first_quarter"
                                              ? inputSalesTargetFirstQuarter
                                              : inputSalesTargetSecondQuarter;
                                          // 残り目標stateも初期状態にリセット
                                          // setSalesTargetFirstQuarterStatus({
                                          setSalesTargetQuarterStatus({
                                            key: "sales_target_first_quarter",
                                            total_sales_target: formatToJapaneseYen(0),
                                            title:
                                              selectedPeriodTypeForMemberLevel === "first_half_details"
                                                ? { ja: "Q1", en: `Q1` }
                                                : { ja: `Q3`, en: `Q3` },
                                            // mainTarget: inputSalesTargetFirstQuarter,
                                            mainTarget: _mainTarget,
                                            // restTarget: Number(zenkakuToHankaku(inputSalesTargetFirstQuarter).replace(/[^\d.]/g, "")),
                                            restTarget: Number(zenkakuToHankaku(_mainTarget).replace(/[^\d.]/g, "")),
                                            isNegative: false,
                                            isComplete: false,
                                          });

                                          return { isComplete: false };
                                        }
                                        // 無事にresultが取得できたルート
                                        else {
                                          // setSalesTargetFirstQuarterStatus(result);
                                          setSalesTargetQuarterStatus(result);
                                          return { isComplete: result.isComplete };
                                        }
                                      };
                                      // --------------- Q1, Q2の両方で適用する関数 ここまで ---------------

                                      // 🔸入力したmonthがQ1の期間に含まれるルート month_01~03のinputと残り金額stateを更新
                                      let isCompleteCurrentQuarter = false;
                                      if (["month_01", "month_02", "month_03"].includes(row.period_type)) {
                                        const firstQuarterMonths: {
                                          periodType: FirstQuarterMonthsKey;
                                          inputTarget: string;
                                        }[] = [
                                          { periodType: "month_01", inputTarget: inputSalesTargetMonth01 },
                                          { periodType: "month_02", inputTarget: inputSalesTargetMonth02 },
                                          { periodType: "month_03", inputTarget: inputSalesTargetMonth03 },
                                        ];

                                        const { isComplete } = updateTotalMonthTarget({
                                          quarterMonths: firstQuarterMonths,
                                          periodType: row.period_type as HalfQuarterMonthsKey, // このブロックはmonth_xxの列のみなのでHalfQuarterMonthsKeyを型アサーション
                                          periodKey: "sales_target_first_quarter",
                                          inputMainTargetQuarter: inputSalesTargetFirstQuarter,
                                          monthsStrArray: ["month_01", "month_02", "month_03"],
                                          setSalesTargetQuarterStatus: setSalesTargetFirstQuarterStatus,
                                        });
                                        isCompleteCurrentQuarter = isComplete;
                                      }
                                      // 🔸入力したmonthがQ2の期間に含まれるルート month_04~06のinputと残り金額stateを更新
                                      else if (["month_04", "month_05", "month_06"].includes(row.period_type)) {
                                        const secondQuarterMonths: {
                                          periodType: SecondQuarterMonthsKey;
                                          inputTarget: string;
                                        }[] = [
                                          { periodType: "month_04", inputTarget: inputSalesTargetMonth04 },
                                          { periodType: "month_05", inputTarget: inputSalesTargetMonth05 },
                                          { periodType: "month_06", inputTarget: inputSalesTargetMonth06 },
                                        ];

                                        const { isComplete } = updateTotalMonthTarget({
                                          quarterMonths: secondQuarterMonths,
                                          periodType: row.period_type as HalfQuarterMonthsKey, // このブロックはmonth_xxの列のみなのでHalfQuarterMonthsKeyを型アサーション
                                          periodKey: "sales_target_second_quarter",
                                          inputMainTargetQuarter: inputSalesTargetSecondQuarter,
                                          monthsStrArray: ["month_04", "month_05", "month_06"],
                                          setSalesTargetQuarterStatus: setSalesTargetSecondQuarterStatus,
                                        });
                                        isCompleteCurrentQuarter = isComplete;
                                      }

                                      // month_xxの全て入力が完了しているかをチェック
                                      if (monthTargetStatusMapForAllMembers) {
                                        // 新いMapオブジェクトを作成し、既存のエントリをコピー
                                        const newMap = new Map(monthTargetStatusMapForAllMembers);

                                        if (newMap.has(entityId)) {
                                          const targetMemberObj = newMap.get(entityId);

                                          // 全て完了しておらず、今回の入力で全て完了になったらZustandを更新
                                          if (
                                            (["month_01", "month_02", "month_03"].includes(row.period_type) &&
                                              targetMemberObj &&
                                              !targetMemberObj.isCompleteAllMonthTargets &&
                                              isCompleteCurrentQuarter &&
                                              salesTargetSecondQuarterStatus?.isComplete) ||
                                            (["month_04", "month_05", "month_06"].includes(row.period_type) &&
                                              targetMemberObj &&
                                              !targetMemberObj.isCompleteAllMonthTargets &&
                                              isCompleteCurrentQuarter &&
                                              salesTargetFirstQuarterStatus?.isComplete)
                                          ) {
                                            // このメンバーのisCompleteAllMonthTargetsをtrueに更新してMapオブジェクトのstateを更新
                                            const updatedMemberObj = {
                                              ...targetMemberObj,
                                              isCompleteAllMonthTargets: true,
                                            };
                                            newMap.set(entityId, updatedMemberObj); // 更新したオブジェクトでMapを更新

                                            // Zustandステートを新しいMapで更新
                                            setMonthTargetStatusMapForAllMembers(newMap);
                                          }
                                        }
                                      }
                                    }}
                                  />
                                )}
                              {/* // ---------------- 🌟month01~06🌟 ここまで ---------------- */}

                              {/* // ---------------- 🌟Q2🌟 ---------------- */}
                              {column === "sales_target" && row.period_type === "second_quarter" && (
                                <span className={`px-[8px] text-[15px]`}>{inputSalesTargetSecondQuarter ?? ""}</span>
                              )}
                              {/* // ---------------- 🌟Q2🌟 ここまで ---------------- */}

                              {/* // ---------------- 🌟シェア 半期のみ表示🌟 ---------------- */}
                              {column === "share" && row.period_type === "half_year" && (
                                <>
                                  <div
                                    className={`${styles.grid_header_cell_share} flex-center relative h-full w-full pb-[12px]`}
                                  >
                                    {isMounted && (
                                      <>
                                        <ProgressCircle
                                          circleId="3"
                                          textId="3"
                                          progress={getShare(row.period_type)}
                                          // progress={0}
                                          duration={5000}
                                          easeFn="Quartic"
                                          size={24}
                                          strokeWidth={3}
                                          hiddenCenterText={true}
                                          oneColor="var(--main-color-f)"
                                          notGrad={true}
                                          isReady={true}
                                          withShadow={false}
                                          fade={`fade03_forward`}
                                        />
                                        <ProgressNumber
                                          targetNumber={getShare(row.period_type)}
                                          // startNumber={Math.round(68000 / 2)}
                                          // startNumber={Number((68000 * 0.1).toFixed(0))}
                                          startNumber={0}
                                          duration={5000}
                                          // easeFn="Quartic"
                                          easeFn="Quartic"
                                          fontSize={9}
                                          margin="0 0 0 0"
                                          isReady={true}
                                          isPrice={false}
                                          isPercent={true}
                                          fade={`fade03_forward`}
                                          customClass={`absolute bottom-[7px] left-[50%] translate-x-[-50%] text-[5px]`}
                                          textColor={`var(--color-text-sub)`}
                                        />
                                      </>
                                    )}
                                  </div>
                                </>
                              )}
                              {/* // ---------------- 🌟シェア 半期のみ表示🌟 ここまで ---------------- */}

                              {/* // ---------------- 🌟前年比🌟 ---------------- */}
                              {["yoy_growth", "yo2y_growth"].includes(column) && (
                                <div className="flex h-full w-full items-center whitespace-pre-wrap">
                                  {/* <span>{displayCellValue}</span> */}
                                  {/* <span>{inputYoYGrowth}</span> */}
                                  {column === "yoy_growth" && <span>{inputYoYGrowth || "- %"}</span>}
                                  {column === "yo2y_growth" && <span>{displayCellValue}</span>}
                                </div>
                              )}
                              {/* // ---------------- 🌟前年比🌟 ここまで ---------------- */}

                              {/* // ---------------- 🌟前年前年伸び率実績🌟 ---------------- */}
                              {["last_year_sales", "two_years_ago_sales", "three_years_ago_sales"].includes(column) && (
                                <div className="flex h-full w-full items-center whitespace-pre-wrap">
                                  {/* 10兆5256億2430万2100円 */}
                                  {displayCellValue}
                                </div>
                              )}
                              {/* // ---------------- 🌟前年前年伸び率実績🌟 ここまで ---------------- */}

                              {/* // ---------------- 🌟売上推移🌟 ---------------- */}
                              {column === "sales_trend" && salesTrends && (
                                <SparkChart
                                  key={`${row.period_type}_${salesTrends?.title}_${salesTrends?.mainValue}_${salesTrends?.data?.length}_${salesTrends.updateAt}`}
                                  id={`${row.period_type}_${salesTrends?.title}_${salesTrends?.mainValue}_${salesTrends?.data?.length}_${salesTrends.updateAt}`}
                                  title={salesTrends.title}
                                  // title={salesTrendTitle}
                                  subTitle={salesTrends.subTitle}
                                  mainValue={salesTrends.mainValue} // COALESCE関数で売上がなくても0が入るためnumber型になる
                                  growthRate={salesTrends.growthRate}
                                  data={salesTrends.data}
                                  dataUpdateAt={salesTrends.updateAt}
                                  // title={row.sales_trend.title}
                                  // subTitle={row.sales_trend.subTitle}
                                  // mainValue={row.sales_trend.mainValue} // COALESCE関数で売上がなくても0が入るためnumber型になる
                                  // growthRate={row.sales_trend.growthRate}
                                  // data={row.sales_trend.data}
                                  // title={`${upsertTargetObj.fiscalYear - rowIndex}年度`}
                                  height={48}
                                  width={270}
                                  delay={600}
                                />
                              )}
                              {/* // ---------------- 🌟売上推移🌟 ここまで ---------------- */}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                {/* ----------- Row 年度・半期リスト ここまで ----------- */}
              </div>
              {/* ----------- rowgroup ここまで ----------- */}
            </div>
            {/* ------------------ Gridコンテナ ここまで ------------------ */}
          </div>
          {/* ------------------ メインコンテナ ここまで ------------------ */}
        </div>
      </div>
    </>
  );
};

export const UpsertSettingTargetGridTableForMemberLevel = memo(UpsertSettingTargetGridTableForMemberLevelMemo);
