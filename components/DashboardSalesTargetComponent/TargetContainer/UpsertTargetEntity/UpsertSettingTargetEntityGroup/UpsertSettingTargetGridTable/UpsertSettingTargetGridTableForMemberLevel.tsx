import { CSSProperties, Dispatch, SetStateAction, memo, useCallback, useEffect, useMemo, useState } from "react";
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
  SalesSummaryYearHalf,
  SalesTargetUpsertColumns,
  Section,
  SparkChartObj,
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
  stickyRow: string | null;
  setStickyRow: Dispatch<SetStateAction<string | null>>;
  annualFiscalMonths: FiscalYearMonthObjForTarget | null;
  isMainTarget: boolean; // メイン目標かどうか
  fetchEnabled?: boolean; // メイン目標でない場合はfetchEnabledがtrueに変更されたらフェッチを許可する
  onFetchComplete?: () => void;
  subTargetList?: Department[] | Section[] | Unit[] | Office[] | MemberAccounts[];
  setSubTargetList?: Dispatch<SetStateAction<Department[] | Section[] | Unit[] | Office[] | MemberAccounts[]>>;
};

const UpsertSettingTargetGridTableForMemberLevelMemo = ({
  entityLevel,
  entityNameTitle,
  entityId,
  stickyRow,
  setStickyRow,
  // fiscalYearMonthsForThreeYear,
  annualFiscalMonths,
  isMainTarget = false,
  fetchEnabled,
  onFetchComplete,
  subTargetList,
  setSubTargetList,
}: // startYearMonth,
// endYearMonth,
Props) => {
  const queryClient = useQueryClient();
  const supabase = useSupabaseClient();
  const language = useStore((state) => state.language);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  // const upsertTargetObj = useDashboardStore((state) => state.upsertTargetObj);
  const upsertSettingEntitiesObj = useDashboardStore((state) => state.upsertSettingEntitiesObj);

  // 🔸ユーザーの年度初めから12ヶ月分の年月度の配列
  // const annualFiscalMonths = useDashboardStore((state) => state.annualFiscalMonths);
  // 🔹現在の顧客の会計年月度 202303
  const currentFiscalStartYearMonth = useDashboardStore((state) => state.currentFiscalStartYearMonth);

  // メンバーレベル設定時の上期詳細か下期詳細
  const settingPeriodTypeForMemberLevel = useDashboardStore((state) => state.settingPeriodTypeForMemberLevel);

  const [isLoading, setIsLoading] = useState(false);

  // if (!upsertTargetObj || !userProfileState || !userProfileState.company_id) return;
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

  // --------------------- 🌟過去3年分の売上と前年度の前年伸び率実績を取得するuseQuery🌟 ---------------------
  const {
    data: salesSummaryRowData,
    error: salesSummaryError,
    isLoading: isLoadingQuery,
    isSuccess: isSuccessQuery,
    isError: isErrorQuery,
  } = useQuerySalesSummaryAndGrowth({
    companyId: userProfileState.company_id,
    entityLevel: entityLevel,
    entityId: entityId,
    periodType: settingPeriodTypeForMemberLevel, // first_half_details or second_half_details
    fiscalYear: upsertSettingEntitiesObj.fiscalYear,
    annualFiscalMonths: annualFiscalMonths,
    fetchEnabled: isMainTarget ? true : fetchEnabled, // メイン目標はtrue, でなければfetchEnabledに従う
  });
  // --------------------- 🌟過去3年分の売上と前年度の前年伸び率実績を取得するuseQuery🌟 ここまで ---------------------

  // ---------------- useQueryでフェッチが完了したら ----------------
  useEffect(() => {
    if (isSuccessQuery || isErrorQuery) {
      if (onFetchComplete) onFetchComplete();
    }
  }, [isSuccessQuery, isErrorQuery]);

  // ---------------- ローカルstate ----------------
  // 売上目標input 「年度・上半期・下半期」
  //   const [inputSalesTargetYear, setInputSalesTargetYear] = useState("");
  //   const [inputSalesTargetHalf, setInputSalesTargetHalf] = useState("");
  //   const [inputSalesTargetSecondHalf, setInputSalesTargetSecondHalf] = useState("");

  // 「上期、Q1, Q2」を「年度・上半期・下半期」のシェアの関係と一致させる 入力値も上半期とQ1でQ2は自動計算にする
  // 「Q1, month01~month03」「Q2, month04~month06」も同様にグループで入力値を連携させる

  // 「上期・Q1, Q2・month_01~month_06」
  const [inputSalesTargetHalf, setInputSalesTargetHalf] = useState("");
  const [inputSalesTargetFirstQuarter, setInputSalesTargetFirstQuarter] = useState("");
  const [inputSalesTargetSecondQuarter, setInputSalesTargetSecondQuarter] = useState("");
  const [inputSalesTargetMonth01, setInputSalesTargetMonth01] = useState("");
  const [inputSalesTargetMonth02, setInputSalesTargetMonth02] = useState("");
  const [inputSalesTargetMonth03, setInputSalesTargetMonth03] = useState("");
  const [inputSalesTargetMonth04, setInputSalesTargetMonth04] = useState("");
  const [inputSalesTargetMonth05, setInputSalesTargetMonth05] = useState("");
  const [inputSalesTargetMonth06, setInputSalesTargetMonth06] = useState("");
  // 前年比input 「上期・Q1, Q2・month_01~month_06」
  const [inputYoYGrowthHalf, setInputYoYGrowthHalf] = useState<string>("");
  const [inputYoYGrowthFirstQuarter, setInputYoYGrowthFirstQuarter] = useState("");
  const [inputYoYGrowthSecondQuarter, setInputYoYGrowthSecondQuarter] = useState("");
  const [inputYoYGrowthMonth01, setInputYoYGrowthMonth01] = useState("");
  const [inputYoYGrowthMonth02, setInputYoYGrowthMonth02] = useState("");
  const [inputYoYGrowthMonth03, setInputYoYGrowthMonth03] = useState("");
  const [inputYoYGrowthMonth04, setInputYoYGrowthMonth04] = useState("");
  const [inputYoYGrowthMonth05, setInputYoYGrowthMonth05] = useState("");
  const [inputYoYGrowthMonth06, setInputYoYGrowthMonth06] = useState("");
  // 上期：Q1~Q2のシェア(上期は100%のため不要)
  const [shareFirstQuarter, setShareFirstQuarter] = useState<number>(0);
  const [shareSecondQuarter, setShareSecondQuarter] = useState<number>(0);
  // 上期：month01~month06のシェア
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

  // 上期詳細と下期詳細でperiodTypeの値を動的に変更する
  const periodTypeNames = {
    half: settingPeriodTypeForMemberLevel === "first_half_details" ? "first_half" : "second_half",
    quarter1: settingPeriodTypeForMemberLevel === "first_half_details" ? "first_quarter" : "third_quarter",
    quarter2: settingPeriodTypeForMemberLevel === "first_half_details" ? "second_quarter" : "fourth_quarter",
    month01: settingPeriodTypeForMemberLevel === "first_half_details" ? "month_01" : "month_07",
    month02: settingPeriodTypeForMemberLevel === "first_half_details" ? "month_02" : "month_08",
    month03: settingPeriodTypeForMemberLevel === "first_half_details" ? "month_03" : "month_09",
    month04: settingPeriodTypeForMemberLevel === "first_half_details" ? "month_04" : "month_10",
    month05: settingPeriodTypeForMemberLevel === "first_half_details" ? "month_05" : "month_11",
    month06: settingPeriodTypeForMemberLevel === "first_half_details" ? "month_06" : "month_12",
  };

  // 売上推移(「上期・Q1, Q2・month_01~month_06」)
  // H1
  const [salesTrendsHalf, setSalesTrendsHalf] = useState<(SparkChartObj & { updateAt: number }) | null>(() => {
    if (!salesSummaryRowData) return null;
    const initialData =
      salesSummaryRowData.find((obj) => obj.period_type === periodTypeNames.half)?.sales_trend ?? null;
    return initialData ? { ...initialData, updateAt: Date.now() } : null;
  });
  // Q1
  const [salesTrendsFirstQuarter, setSalesTrendsFirstQuarter] = useState<(SparkChartObj & { updateAt: number }) | null>(
    () => {
      if (!salesSummaryRowData) return null;
      const initialData =
        salesSummaryRowData.find((obj) => obj.period_type === periodTypeNames.quarter1)?.sales_trend ?? null;
      return initialData ? { ...initialData, updateAt: Date.now() } : null;
    }
  );
  // Q2
  const [salesTrendsSecondQuarter, setSalesTrendsSecondQuarter] = useState<
    (SparkChartObj & { updateAt: number }) | null
  >(() => {
    if (!salesSummaryRowData) return null;
    const initialData =
      salesSummaryRowData.find((obj) => obj.period_type === periodTypeNames.quarter2)?.sales_trend ?? null;
    return initialData ? { ...initialData, updateAt: Date.now() } : null;
  });
  // month_01
  const [salesTrendsMonth01, setSalesTrendsMonth01] = useState<(SparkChartObj & { updateAt: number }) | null>(() => {
    if (!salesSummaryRowData) return null;
    const initialData =
      salesSummaryRowData.find((obj) => obj.period_type === periodTypeNames.month01)?.sales_trend ?? null;
    return initialData ? { ...initialData, updateAt: Date.now() } : null;
  });
  // month_02
  const [salesTrendsMonth02, setSalesTrendsMonth02] = useState<(SparkChartObj & { updateAt: number }) | null>(() => {
    if (!salesSummaryRowData) return null;
    const initialData =
      salesSummaryRowData.find((obj) => obj.period_type === periodTypeNames.month02)?.sales_trend ?? null;
    return initialData ? { ...initialData, updateAt: Date.now() } : null;
  });
  // month_03
  const [salesTrendsMonth03, setSalesTrendsMonth03] = useState<(SparkChartObj & { updateAt: number }) | null>(() => {
    if (!salesSummaryRowData) return null;
    const initialData =
      salesSummaryRowData.find((obj) => obj.period_type === periodTypeNames.month03)?.sales_trend ?? null;
    return initialData ? { ...initialData, updateAt: Date.now() } : null;
  });
  // month_04
  const [salesTrendsMonth04, setSalesTrendsMonth04] = useState<(SparkChartObj & { updateAt: number }) | null>(() => {
    if (!salesSummaryRowData) return null;
    const initialData =
      salesSummaryRowData.find((obj) => obj.period_type === periodTypeNames.month04)?.sales_trend ?? null;
    return initialData ? { ...initialData, updateAt: Date.now() } : null;
  });
  // month_05
  const [salesTrendsMonth05, setSalesTrendsMonth05] = useState<(SparkChartObj & { updateAt: number }) | null>(() => {
    if (!salesSummaryRowData) return null;
    const initialData =
      salesSummaryRowData.find((obj) => obj.period_type === periodTypeNames.month05)?.sales_trend ?? null;
    return initialData ? { ...initialData, updateAt: Date.now() } : null;
  });
  // month_06
  const [salesTrendsMonth06, setSalesTrendsMonth06] = useState<(SparkChartObj & { updateAt: number }) | null>(() => {
    if (!salesSummaryRowData) return null;
    const initialData =
      salesSummaryRowData.find((obj) => obj.period_type === periodTypeNames.month06)?.sales_trend ?? null;
    return initialData ? { ...initialData, updateAt: Date.now() } : null;
  });

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
      const newSalesTrendsHalf =
        salesSummaryRowData.find((obj) => obj.period_type === periodTypeNames.half)?.sales_trend ?? null;
      setSalesTrendsHalf(newSalesTrendsHalf ? { ...newSalesTrendsHalf, updateAt: Date.now() } : null);
      // Q1
      const newSalesTrendsFirstQuarter =
        salesSummaryRowData.find((obj) => obj.period_type === periodTypeNames.quarter1)?.sales_trend ?? null;
      setSalesTrendsFirstQuarter(
        newSalesTrendsFirstQuarter ? { ...newSalesTrendsFirstQuarter, updateAt: Date.now() } : null
      );
      // Q2
      const newSalesTrendsSecondQuarter =
        salesSummaryRowData.find((obj) => obj.period_type === periodTypeNames.quarter2)?.sales_trend ?? null;
      setSalesTrendsSecondQuarter(
        newSalesTrendsSecondQuarter ? { ...newSalesTrendsSecondQuarter, updateAt: Date.now() } : null
      );
      // month_01
      const newSalesTrendsMonth01 =
        salesSummaryRowData.find((obj) => obj.period_type === periodTypeNames.month01)?.sales_trend ?? null;
      setSalesTrendsMonth01(newSalesTrendsMonth01 ? { ...newSalesTrendsMonth01, updateAt: Date.now() } : null);
      // month_02
      const newSalesTrendsMonth02 =
        salesSummaryRowData.find((obj) => obj.period_type === periodTypeNames.month02)?.sales_trend ?? null;
      setSalesTrendsMonth02(newSalesTrendsMonth02 ? { ...newSalesTrendsMonth02, updateAt: Date.now() } : null);
      // month_03
      const newSalesTrendsMonth03 =
        salesSummaryRowData.find((obj) => obj.period_type === periodTypeNames.month03)?.sales_trend ?? null;
      setSalesTrendsMonth03(newSalesTrendsMonth03 ? { ...newSalesTrendsMonth03, updateAt: Date.now() } : null);
      // month_04
      const newSalesTrendsMonth04 =
        salesSummaryRowData.find((obj) => obj.period_type === periodTypeNames.month04)?.sales_trend ?? null;
      setSalesTrendsMonth04(newSalesTrendsMonth04 ? { ...newSalesTrendsMonth04, updateAt: Date.now() } : null);
      // month_05
      const newSalesTrendsMonth05 =
        salesSummaryRowData.find((obj) => obj.period_type === periodTypeNames.month05)?.sales_trend ?? null;
      setSalesTrendsMonth05(newSalesTrendsMonth05 ? { ...newSalesTrendsMonth05, updateAt: Date.now() } : null);
      // month_06
      const newSalesTrendsMonth06 =
        salesSummaryRowData.find((obj) => obj.period_type === periodTypeNames.month06)?.sales_trend ?? null;
      setSalesTrendsMonth06(newSalesTrendsMonth06 ? { ...newSalesTrendsMonth06, updateAt: Date.now() } : null);
    }
  }, [salesSummaryRowData]);

  // ヘッダーに表示する会計月度の12ヶ月分の配列 ユーザーの年度初めが開始月度
  const fiscalStartMonthsArray = useMemo(
    () => generateMonthHeaders(Number(annualFiscalMonths.month_01.toString().slice(-2))),
    // () => generateMonthHeaders(Number(currentFiscalStartYearMonth.toString().slice(-2))),
    [annualFiscalMonths]
    // [currentFiscalStartYearMonth]
  );

  const getTitle = useCallback(
    (
      period: "half" | "quarter1" | "quarter2" | "month01" | "month02" | "month03" | "month04" | "month05" | "month06"
    ) => {
      const isFirstHalf = settingPeriodTypeForMemberLevel === "first_half_details";
      switch (period) {
        case "half":
          return isFirstHalf ? { ja: "上半期", en: "H1" } : { ja: "下半期", en: "H2" };
          break;
        case "quarter1":
          return isFirstHalf ? { ja: "Q1", en: "Q1" } : { ja: "Q3", en: "Q3" };
          break;
        case "quarter2":
          return isFirstHalf ? { ja: "Q2", en: "Q2" } : { ja: "Q4", en: "Q4" };
          break;
        case "month01":
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
        case "month02":
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
        case "month03":
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
        case "month04":
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
        case "month05":
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
        case "month06":
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
    [settingPeriodTypeForMemberLevel, fiscalStartMonthsArray]
  );

  const inputSalesTargetsList = [
    {
      key: periodTypeNames.half,
      title: getTitle("half"), // { ja: "上半期", en: "H1" } or { ja: "下半期", en: "H2" }
      inputTarget: inputSalesTargetHalf,
      setInputTarget: setInputSalesTargetHalf,
      inputYoYGrowth: inputYoYGrowthHalf,
      setInputYoYGrowth: setInputYoYGrowthHalf,
      salesTrends: salesTrendsHalf,
      setSalesTrends: setSalesTrendsHalf,
    },
    {
      key: periodTypeNames.quarter1,
      title: getTitle("quarter1"), // { ja: "Q1", en: "Q1" } or { ja: "Q3", en: "Q3" }
      inputTarget: inputSalesTargetFirstQuarter,
      setInputTarget: setInputSalesTargetFirstQuarter,
      inputYoYGrowth: inputYoYGrowthFirstQuarter,
      setInputYoYGrowth: setInputYoYGrowthFirstQuarter,
      salesTrends: salesTrendsFirstQuarter,
      setSalesTrends: setSalesTrendsFirstQuarter,
    },
    {
      key: periodTypeNames.quarter2,
      title: getTitle("quarter2"),
      inputTarget: inputSalesTargetSecondQuarter,
      setInputTarget: setInputSalesTargetSecondQuarter,
      inputYoYGrowth: inputYoYGrowthSecondQuarter,
      setInputYoYGrowth: setInputYoYGrowthSecondQuarter,
      salesTrends: salesTrendsSecondQuarter,
      setSalesTrends: setSalesTrendsSecondQuarter,
    },
    {
      key: periodTypeNames.month01,
      title: getTitle("month01"),
      inputTarget: inputSalesTargetMonth01,
      setInputTarget: setInputSalesTargetMonth01,
      inputYoYGrowth: inputYoYGrowthMonth01,
      setInputYoYGrowth: setInputYoYGrowthMonth01,
      salesTrends: salesTrendsMonth01,
      setSalesTrends: setSalesTrendsMonth01,
    },
    {
      key: periodTypeNames.month02,
      title: getTitle("month02"),
      inputTarget: inputSalesTargetMonth02,
      setInputTarget: setInputSalesTargetMonth02,
      inputYoYGrowth: inputYoYGrowthMonth02,
      setInputYoYGrowth: setInputYoYGrowthMonth02,
      salesTrends: salesTrendsMonth02,
      setSalesTrends: setSalesTrendsMonth02,
    },
    {
      key: periodTypeNames.month03,
      title: getTitle("month03"),
      inputTarget: inputSalesTargetMonth03,
      setInputTarget: setInputSalesTargetMonth03,
      inputYoYGrowth: inputYoYGrowthMonth03,
      setInputYoYGrowth: setInputYoYGrowthMonth03,
      salesTrends: salesTrendsMonth03,
      setSalesTrends: setSalesTrendsMonth03,
    },
    {
      key: periodTypeNames.month04,
      title: getTitle("month04"),
      inputTarget: inputSalesTargetMonth04,
      setInputTarget: setInputSalesTargetMonth04,
      inputYoYGrowth: inputYoYGrowthMonth04,
      setInputYoYGrowth: setInputYoYGrowthMonth04,
      salesTrends: salesTrendsMonth04,
      setSalesTrends: setSalesTrendsMonth04,
    },
    {
      key: periodTypeNames.month05,
      title: getTitle("month05"),
      inputTarget: inputSalesTargetMonth05,
      setInputTarget: setInputSalesTargetMonth05,
      inputYoYGrowth: inputYoYGrowthMonth05,
      setInputYoYGrowth: setInputYoYGrowthMonth05,
      salesTrends: salesTrendsMonth05,
      setSalesTrends: setSalesTrendsMonth05,
    },
    {
      key: periodTypeNames.month06,
      title: getTitle("month06"),
      inputTarget: inputSalesTargetMonth06,
      setInputTarget: setInputSalesTargetMonth06,
      inputYoYGrowth: inputYoYGrowthMonth06,
      setInputYoYGrowth: setInputYoYGrowthMonth06,
      salesTrends: salesTrendsMonth06,
      setSalesTrends: setSalesTrendsMonth06,
    },
  ];

  // type RowHeaderNameYearHalf = "fiscal_year" | "first_half" | "second_half";

  // 🌠保存クリックでデータを収集
  const saveTriggerSalesTarget = useDashboardStore((state) => state.saveTriggerSalesTarget);
  const inputSalesTargetsIdToDataMap = useDashboardStore((state) => state.inputSalesTargetsIdToDataMap);
  const setInputSalesTargetsIdToDataMap = useDashboardStore((state) => state.setInputSalesTargetsIdToDataMap);

  const validateInputSalesTargets = useCallback((salesTargetArray: string[]) => {
    return salesTargetArray.every((target) => isValidNumber(target.replace(/[^\d.]/g, "")));
  }, []);

  // 🌠「保存クリック」データ収集
  useEffect(() => {
    // トリガーがtrueの場合か、isCollectedでない(もしくは存在しない)場合のみ目標stateの収集を実行
    if (!saveTriggerSalesTarget) return;
    if ((inputSalesTargetsIdToDataMap[entityId] as EntityInputSalesTargetObj)?.isCollected) return;

    const getPeriod = (key: string) => {
      if (key === "fiscal_year") return upsertSettingEntitiesObj.fiscalYear;
      if (key === "first_half") return upsertSettingEntitiesObj.fiscalYear * 10 + 1;
      if (key === "second_half") return upsertSettingEntitiesObj.fiscalYear * 10 + 2;
      if (key === "first_quarter") return upsertSettingEntitiesObj.fiscalYear * 10 + 1;
      if (key === "second_quarter") return upsertSettingEntitiesObj.fiscalYear * 10 + 2;
      if (key === "third_quarter") return upsertSettingEntitiesObj.fiscalYear * 10 + 3;
      if (key === "fourth_quarter") return upsertSettingEntitiesObj.fiscalYear * 10 + 4;
      if (key === "month_01") return upsertSettingEntitiesObj.fiscalYear * 100 + 1;
      if (key === "month_02") return upsertSettingEntitiesObj.fiscalYear * 100 + 2;
      if (key === "month_03") return upsertSettingEntitiesObj.fiscalYear * 100 + 3;
      if (key === "month_04") return upsertSettingEntitiesObj.fiscalYear * 100 + 4;
      if (key === "month_05") return upsertSettingEntitiesObj.fiscalYear * 100 + 5;
      if (key === "month_06") return upsertSettingEntitiesObj.fiscalYear * 100 + 6;
      if (key === "month_07") return upsertSettingEntitiesObj.fiscalYear * 100 + 7;
      if (key === "month_08") return upsertSettingEntitiesObj.fiscalYear * 100 + 8;
      if (key === "month_09") return upsertSettingEntitiesObj.fiscalYear * 100 + 9;
      if (key === "month_10") return upsertSettingEntitiesObj.fiscalYear * 100 + 10;
      if (key === "month_11") return upsertSettingEntitiesObj.fiscalYear * 100 + 11;
      if (key === "month_12") return upsertSettingEntitiesObj.fiscalYear * 100 + 12;
      return upsertSettingEntitiesObj.fiscalYear;
    };

    let salesTargets: inputSalesData[] = [];

    salesTargets = inputSalesTargetsList.map((obj, index) => {
      return {
        period_type: obj.key,
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

    console.log("🔥🔥🔥✅✅✅✅✅✅✅✅✅✅ 子コンポーネント isAllValid", isAllValid, copyInputMap);

    // Zustandを更新
    setInputSalesTargetsIdToDataMap(copyInputMap);
  }, [saveTriggerSalesTarget]);

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
  // rowの値に応じて適切なシェアを返す関数
  const getShare = (row: string) => {
    switch (row) {
      // case "fiscal_year":
      case periodTypeNames.half:
        return 100;
      // case "first_half":
      case periodTypeNames.quarter1:
        return shareFirstQuarter;
      // case "second_half":
      case periodTypeNames.quarter2:
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

  // 行ヘッダーの値(期間タイプ)とと列ヘッダーの値に応じて表示する値をフォーマットする
  const formatDisplayValue = (row: SalesSummaryYearHalf, column: string) => {
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
  const handleRemoveFromTargetList = async () => {
    if (!subTargetList) return;
    if (!setSubTargetList) return;
    // エンティティタイプからupdateするテーブルを確定
    let updatedTable = "";
    if (entityLevel === "department") updatedTable = "departments";
    if (entityLevel === "section") updatedTable = "sections";
    if (entityLevel === "unit") updatedTable = "units";
    if (entityLevel === "office") updatedTable = "offices";
    if (entityLevel === "member") updatedTable = "profiles";
    if (entityLevel === "") return alert("部門データが見つかりませんでした。");

    const updatedPayload = { target_type: null };

    setIsLoading(true); // ローディング開始

    try {
      console.log("削除実行🔥 updatedTable", updatedTable, entityId);
      const { error } = await supabase.from(updatedTable).update(updatedPayload).eq("id", entityId);

      if (error) throw error;

      // キャッシュのサブ目標リストから部門を削除
      // const periodType = isMemberLevelSetting ? `first_half_details` : `year_half`;
      // const fiscalYear = upsertTargetObj.fiscalYear;
      // const queryKey = ["sales_summary_and_growth", entityLevel, entityId, periodType, fiscalYear, isFirstHalf];

      // キャッシュの部門からsales_targetをnullに更新する
      let queryKey = "departments";
      if (entityLevel === "department") queryKey = "departments";
      if (entityLevel === "section") queryKey = "sections";
      if (entityLevel === "unit") queryKey = "units";
      if (entityLevel === "office") queryKey = "offices";
      if (entityLevel === "member") queryKey = "member_accounts";
      const prevCache = queryClient.getQueryData([queryKey]) as
        | Department[]
        | Section[]
        | Unit[]
        | Office[]
        | MemberAccounts[];
      const newCache = [...prevCache]; // キャッシュのシャローコピーを作成
      // 更新対象のオブジェクトのtarget_typeをnullに変更
      const updateIndex = newCache.findIndex((obj) => obj.id === entityId);
      if (updateIndex !== -1) {
        // 更新対象の配列内のインデックスを変えずに対象のプロパティのみ変更
        newCache.splice(updateIndex, 1, { ...prevCache[updateIndex], target_type: null });
        queryClient.setQueryData([queryKey], newCache); // キャッシュを更新
      }

      // 固定していた場合は固定を解除
      if (stickyRow === entityId) {
        setStickyRow(null);
      }

      setIsLoading(false); // ローディング終了

      // サブ目標リストから削除
      const newList = [...subTargetList].filter((obj) => obj.id !== entityId) as
        | Department[]
        | Section[]
        | Unit[]
        | Office[]
        | MemberAccounts[];
      setSubTargetList(newList);

      toast.success(`${entityNameTitle}を目標リストから削除しました🌟`);
    } catch (error: any) {
      console.error("エラー：", error);
      toast.error("目標リストからの削除に失敗しました...🙇‍♀️");
    }
  };

  // チャート マウントを0.6s遅らせる
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    if (isMounted) return;
    setTimeout(() => {
      setIsMounted(true);
    }, 600);
  }, []);

  console.log(
    "UpsertSettingTargetGridTableForMemberLevelコンポーネントレンダリング",
    "entityNameTitle",
    entityNameTitle
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
            <div className={`${styles.card_title}`}>
              <span>{entityNameTitle}</span>
            </div>

            <div className={`${styles.btn_area} flex items-center space-x-[12px]`}>
              {!isMainTarget && (
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
              )}
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
                    // const rowHeaderName = formatRowName(row, upsertTargetObj.fiscalYear)[language];
                    const rowHeaderName = formatRowName(row.period_type, upsertSettingEntitiesObj.fiscalYear)[language];
                    return (
                      <div key={`grid_row_${rowIndex}`} role="row" className={`${styles.row}`}>
                        {columnHeaderListTarget.map((column, colIndex) => {
                          // let displayValue = formatRowCell(column, upsertTargetObj.fiscalYear)[language];
                          // 売上目標
                          const inputSalesTarget = inputSalesTargetsList[rowIndex].inputTarget;
                          const setInputSalesTarget = inputSalesTargetsList[rowIndex].setInputTarget;
                          // 前年比
                          const inputYoYGrowth = inputSalesTargetsList[rowIndex].inputYoYGrowth;
                          const setInputYoYGrowth = inputSalesTargetsList[rowIndex].setInputYoYGrowth;
                          // 売上推移
                          const salesTrends = inputSalesTargetsList[rowIndex].salesTrends;
                          const setSalesTrends = inputSalesTargetsList[rowIndex].setSalesTrends;

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
                              {column === "period_type" && <span>{rowHeaderName}</span>}
                              {column === "sales_target" && row.period_type !== "second_half" && (
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
                                    console.log("こここinputSalesTarget", inputSalesTarget);
                                    // フォーカス時は数字と小数点以外除去
                                    setInputSalesTarget(replacedPrice);
                                    // setInputSalesTarget(inputSalesTarget.replace(/[^\d.]/g, ""));
                                  }}
                                  onBlur={(e) => {
                                    // 現在の売上目標金額
                                    const replacedPrice = zenkakuToHankaku(inputSalesTarget).replace(/[^\d.]/g, "");
                                    // const replacedPrice = inputSalesTarget.replace(/[^\d.]/g, "");

                                    // 売上目標が空文字の場合は売上推移から目標を取り除いてリターンする
                                    if (!checkNotFalsyExcludeZero(replacedPrice)) {
                                      console.log("売上推移をリセット", replacedPrice);
                                      // 売上推移をリセット
                                      setSalesTrends({
                                        ...salesSummaryRowData[rowIndex].sales_trend,
                                        updateAt: Date.now(),
                                      });
                                      // 年度の売上目標が空文字になった場合には、上期と下期のシェアと売上推移をリセット
                                      // 下期の売上目標をリセット
                                      setInputSalesTargetSecondQuarter("");
                                      // 下期の売上推移をリセット
                                      setSalesTrendsSecondQuarter({
                                        ...salesSummaryRowData[2].sales_trend,
                                        updateAt: Date.now(),
                                      });
                                      // 下期の前年比をリセット
                                      setInputYoYGrowthSecondQuarter("");
                                      // 上期下期のシェアをリセット
                                      setShareFirstQuarter(0);
                                      setShareSecondQuarter(0);
                                      return;
                                    }
                                    // フォーマット後の目標金額
                                    // const convertedDiscountPrice = checkNotFalsyExcludeZero(inputSalesTarget)
                                    //   ? convertToYen(inputSalesTarget.trim())
                                    //   : null;
                                    const convertedSalesTarget = checkNotFalsyExcludeZero(inputSalesTarget)
                                      ? convertToYen(inputSalesTarget)
                                      : null;
                                    const newFormatDiscountAmount = formatDisplayPrice(convertedSalesTarget || 0);
                                    setInputSalesTarget(newFormatDiscountAmount);

                                    // 前年比の計算
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
                                    } else if (yearOverYear) {
                                      setInputYoYGrowth(yearOverYear);
                                    }

                                    // 売上推移に追加
                                    if (salesTrends) {
                                      // ディープコピー
                                      let newTrend = cloneDeep(salesTrends) as SparkChartObj;
                                      let newDataArray = [...newTrend.data];
                                      const newDate =
                                        row.period_type === "fiscal_year"
                                          ? upsertSettingEntitiesObj.fiscalYear
                                          : row.period_type === "first_half"
                                          ? upsertSettingEntitiesObj.fiscalYear * 10 + 1
                                          : upsertSettingEntitiesObj.fiscalYear * 10 + 2;
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
                                        row.period_type === "fiscal_year"
                                          ? `FY${upsertSettingEntitiesObj.fiscalYear}`
                                          : row.period_type === "first_half"
                                          ? `${upsertSettingEntitiesObj.fiscalYear}H1`
                                          : `${upsertSettingEntitiesObj.fiscalYear}H2`;
                                      newTrend = {
                                        ...newTrend,
                                        title: newTitle,
                                        mainValue: convertedSalesTarget,
                                        growthRate: yearOverYear ? parseFloat(yearOverYear.replace(/%/g, "")) : null,
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
                                    if (
                                      row.period_type === periodTypeNames.quarter1 ||
                                      row.period_type === periodTypeNames.half
                                    ) {
                                      const convertedTotalTargetHalf = inputSalesTargetHalf.replace(/[^\d.]/g, "");
                                      const convertedFirstQuarterTarget = inputSalesTargetFirstQuarter.replace(
                                        /[^\d.]/g,
                                        ""
                                      );
                                      if (
                                        (row.period_type === periodTypeNames.quarter1 &&
                                          isValidNumber(convertedTotalTargetHalf) &&
                                          isValidNumber(convertedSalesTarget) &&
                                          inputSalesTargetHalf !== "0") ||
                                        (row.period_type === periodTypeNames.half &&
                                          isValidNumber(convertedSalesTarget) &&
                                          isValidNumber(convertedFirstQuarterTarget) &&
                                          convertedFirstQuarterTarget !== "0")
                                      ) {
                                        try {
                                          // 年度と上期の売上目標 Decimalオブジェクトの生成
                                          const totalTargetDecimal = new Decimal(
                                            row.period_type === periodTypeNames.quarter1
                                              ? convertedTotalTargetHalf
                                              : convertedSalesTarget!
                                          );
                                          const firstQuarterTargetDecimal = new Decimal(
                                            row.period_type === periodTypeNames.quarter1
                                              ? convertedSalesTarget!
                                              : convertedFirstQuarterTarget
                                          );
                                          // 🔸上半期が年度を上回っていた場合は、他方をリセット
                                          // 年度入力で年度が上半期を下回った場合は上半期をリセット
                                          if (
                                            row.period_type === periodTypeNames.half &&
                                            totalTargetDecimal.lessThan(firstQuarterTargetDecimal)
                                          ) {
                                            // 上期・下期 売上目標をリセット
                                            setInputSalesTargetFirstQuarter("");
                                            setInputSalesTargetSecondQuarter("");
                                            // 上期・下期 シェアをリセット
                                            setShareFirstQuarter(0);
                                            setShareSecondQuarter(0);
                                            // 上期・下期 前年比をリセット
                                            setInputYoYGrowthFirstQuarter("");
                                            setInputYoYGrowthSecondQuarter("");
                                            // 上期・下期 売上推移をリセット
                                            setSalesTrendsFirstQuarter({
                                              ...salesSummaryRowData[1].sales_trend,
                                              updateAt: Date.now(),
                                            });
                                            setSalesTrendsSecondQuarter({
                                              ...salesSummaryRowData[2].sales_trend,
                                              updateAt: Date.now(),
                                            });
                                            // 年度が上期を下回った場合にはここでリターン
                                            return;
                                          }
                                          // 上期入力で上期が年度を上回っていた場合は年度をリセット
                                          else if (
                                            row.period_type === periodTypeNames.quarter1 &&
                                            totalTargetDecimal.lessThan(firstQuarterTargetDecimal)
                                          ) {
                                            // 年度・下期 売上目標をリセット
                                            setInputSalesTargetHalf("");
                                            setInputSalesTargetSecondQuarter("");
                                            // 上期・下期 シェアをリセット(上期は年度売上目標がリセットされるためシェアもリセット)
                                            setShareFirstQuarter(0);
                                            setShareSecondQuarter(0);
                                            // 年度・下期 前年比をリセット
                                            setInputYoYGrowthHalf("");
                                            setInputYoYGrowthSecondQuarter("");
                                            // 年度・下期 売上推移をリセット
                                            setSalesTrendsHalf({
                                              ...salesSummaryRowData[0].sales_trend,
                                              updateAt: Date.now(),
                                            });
                                            setSalesTrendsSecondQuarter({
                                              ...salesSummaryRowData[2].sales_trend,
                                              updateAt: Date.now(),
                                            });
                                            // 年度が上期を下回った場合にはここでリターン
                                            return;
                                          }

                                          // 上期シェアを計算し、整数に丸める
                                          const firstQuarterShare = firstQuarterTargetDecimal
                                            .dividedBy(totalTargetDecimal)
                                            .times(100)
                                            .toFixed(0, Decimal.ROUND_HALF_UP);
                                          setShareFirstQuarter(Number(firstQuarterShare));
                                          // 下期シェアを計算する（100から上期シェアを引く）
                                          const secondQuarterShare = 100 - Number(firstQuarterShare);
                                          setShareSecondQuarter(secondQuarterShare);
                                          // 下期売上目標を計算して更新
                                          const newSecondQuarterTarget = totalTargetDecimal
                                            .minus(firstQuarterTargetDecimal)
                                            .toNumber();
                                          const formattedSecondQuarterTarget =
                                            formatDisplayPrice(newSecondQuarterTarget);
                                          setInputSalesTargetSecondQuarter(formattedSecondQuarterTarget);
                                          // 下期前年比を算出
                                          // 前年比
                                          const secondQuarterResult = calculateYearOverYear(
                                            newSecondQuarterTarget,
                                            salesSummaryRowData[salesSummaryRowData.length - 1].last_year_sales,
                                            1,
                                            true,
                                            false
                                          );
                                          if (secondQuarterResult.error) {
                                            // toast.error(`エラー：${secondQuarterResult.error}🙇‍♀️`);
                                            console.log(
                                              `❌${
                                                salesSummaryRowData[salesSummaryRowData.length - 1].period_type
                                              } 値引率の取得に失敗`,
                                              secondQuarterResult.error
                                            );
                                            setInputYoYGrowthSecondQuarter("");
                                          } else if (secondQuarterResult.yearOverYear) {
                                            setInputYoYGrowthSecondQuarter(secondQuarterResult.yearOverYear);
                                          }

                                          // 下期の売上推移に追加
                                          if (salesTrendsSecondQuarter && isValidNumber(newSecondQuarterTarget)) {
                                            // ディープコピー
                                            let newTrend = cloneDeep(salesTrendsSecondQuarter) as SparkChartObj;
                                            let newDataArray = [...newTrend.data];
                                            const newDate = upsertSettingEntitiesObj.fiscalYear * 10 + 2; // 下期
                                            const newData = {
                                              date: newDate,
                                              value: newSecondQuarterTarget,
                                            };
                                            if (newDataArray.length === 3) {
                                              newDataArray.push(newData);
                                            } else if (newDataArray.length === 4) {
                                              newDataArray.splice(-1, 1, newData);
                                            }
                                            const newTitle = `${upsertSettingEntitiesObj.fiscalYear}H2`;
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
                                        } catch (error: any) {
                                          toast.error("エラー：シェアの算出に失敗しました...🙇‍♀️");
                                          console.log(`❌入力値"${inputSalesTargetFirstQuarter}"が無効です。`, error);
                                        }
                                      }
                                    }
                                  }}
                                />
                              )}
                              {column === "sales_target" && row.period_type === "second_quarter" && (
                                <span className={`px-[8px] text-[15px]`}>{inputSalesTargetSecondQuarter ?? ""}</span>
                              )}
                              {column === "share" && (
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
                              {["yoy_growth", "yo2y_growth"].includes(column) && (
                                <div className="flex h-full w-full items-center whitespace-pre-wrap">
                                  {/* <span>{displayCellValue}</span> */}
                                  {/* <span>{inputYoYGrowth}</span> */}
                                  {column === "yoy_growth" && <span>{inputYoYGrowth || "- %"}</span>}
                                  {column === "yo2y_growth" && <span>{displayCellValue}</span>}
                                </div>
                              )}
                              {["last_year_sales", "two_years_ago_sales", "three_years_ago_sales"].includes(column) && (
                                <div className="flex h-full w-full items-center whitespace-pre-wrap">
                                  {/* 10兆5256億2430万2100円 */}
                                  {displayCellValue}
                                </div>
                              )}
                              {column === "sales_trend" && salesTrends && (
                                <SparkChart
                                  key={`${row.period_type}_${salesTrends?.title}_${salesTrends?.mainValue}_${salesTrends?.data?.length}_${salesTrends.updateAt}`}
                                  id={`${row.period_type}_${salesTrends?.title}_${salesTrends?.mainValue}_${salesTrends?.data?.length}_${salesTrends.updateAt}`}
                                  title={salesTrends.title}
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
