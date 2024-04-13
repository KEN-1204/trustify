import { formatRowNameShort } from "@/components/DashboardSalesTargetComponent/TargetContainer/UpsertTarget/UpsertTarget";
import useStore from "@/store";
import { FiscalYearMonthObjForTarget, SalesSummaryYearHalf, SparkChartObj } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";

type Props = {
  companyId: string;
  entityLevel: string;
  entityId: string;
  periodType: string;
  fiscalYear: number;
  annualFiscalMonths?: FiscalYearMonthObjForTarget | undefined | null;
  fetchEnabled?: boolean;
};

// 過去3年分の売上実績と前年度の伸び率実績を取得するuseQuery
export const useQuerySalesSummaryAndGrowth = ({
  companyId,
  entityLevel,
  entityId,
  periodType, // 「year_half」「first_half_details」「second_half_details」
  fiscalYear, // 現在選択中の会計年度(FUNCTION側で-1)
  annualFiscalMonths,
  fetchEnabled = true,
}: Props) => {
  const language = useStore((state) => state.language);
  const supabase = useSupabaseClient();

  const getSalesSummaryAndGrowth = async () => {
    // 下記3パターンを引数で振り分けてFUNCTIONを実行し、キャッシュに格納

    // 1. 「年度・上半期・下半期」の3年分の売上
    // 2. 「上半期・Q1, Q2・01~06」の3年分の売上
    // 3. 「下半期・Q3, Q4・07~12」の3年分の売上

    let responseData = null;

    // 1. 「年度・上半期・下半期」の3年分の売上
    if (periodType === "year_half") {
      const payload = {
        _entity_level: entityLevel, // エンティティタイプの割り当て
        _entity_id: entityId, // エンティティid
        _fiscal_year: fiscalYear, // 現在の会計年度
      };

      console.log(
        "🔥useQuerySalesSummaryAndGrowth rpc get_sales_summary_and_growth_year_and_half関数実行 payload",
        payload
      );

      const { data, error } = await supabase
        // .rpc("get_sales_summary_and_growth_year_and_half", { payload })
        .rpc("get_sales_summary_and_growth_year_and_half", payload);
      // .eq("created_by_company_id", companyId);

      if (error) {
        console.error("❌getSalesSummaryAndGrowthエラー発生", error);
        throw error;
      }

      responseData = data;
    }
    // 2.3. 「半期〜月度」
    else if (periodType === "first_half_details") {
      // if (!annualFiscalMonthsLastYear || !annualFiscalMonthsTwoYearsAgo || !annualFiscalMonthsThreeYearsAgo)
      //   return null;
      if (!annualFiscalMonths) return null;
      // 2. 「上半期・Q1, Q2・01~06」の3年分の売上
      const payload = {
        _entity_level: entityLevel, // エンティティタイプの割り当て
        _entity_id: entityId, // エンティティid
        _fiscal_year: fiscalYear, // 現在の会計年度
        _start_year_month: annualFiscalMonths.month_01,
        _end_year_month: annualFiscalMonths.month_06,
        _month_01: annualFiscalMonths.month_01,
        _month_02: annualFiscalMonths.month_02,
        _month_03: annualFiscalMonths.month_03,
        _month_04: annualFiscalMonths.month_04,
        _month_05: annualFiscalMonths.month_05,
        _month_06: annualFiscalMonths.month_06,
      };
      console.log(
        "🔥useQuerySalesSummaryAndGrowth rpc get_sales_summary_and_growth_first_half_monthly関数実行 payload",
        payload
      );

      const { data, error } = await supabase.rpc("get_sales_summary_and_growth_first_half_monthly", payload);
      // .eq("created_by_company_id", companyId);

      if (error) {
        console.error("❌getSalesSummaryAndGrowthエラー発生", error);
        throw error;
      }

      responseData = data;
    } else if (periodType === "second_half_details") {
      if (!annualFiscalMonths) return null;
      // 3. 「下半期・Q3, Q4・07~12」の3年分の売上
      const payload = {
        _entity_level: entityLevel, // エンティティタイプの割り当て
        _entity_id: entityId, // エンティティid
        _fiscal_year: fiscalYear, // 現在の会計年度
        _start_year_month: annualFiscalMonths.month_07,
        _end_year_month: annualFiscalMonths.month_12,
        _month_07: annualFiscalMonths.month_07,
        _month_08: annualFiscalMonths.month_08,
        _month_09: annualFiscalMonths.month_09,
        _month_10: annualFiscalMonths.month_10,
        _month_11: annualFiscalMonths.month_11,
        _month_12: annualFiscalMonths.month_12,
      };
      console.log(
        "🔥useQuerySalesSummaryAndGrowth rpc get_sales_summary_and_growth_second_half_monthly関数実行 payload",
        payload
      );

      const { data, error } = await supabase.rpc("get_sales_summary_and_growth_second_half_monthly", payload);
      // .eq("created_by_company_id", companyId);

      if (error) {
        console.error("❌getSalesSummaryAndGrowthエラー発生", error);
        throw error;
      }

      responseData = data;
    }

    // 売上推移カラムを追加
    if (Array.isArray(responseData) && responseData.length > 0) {
      responseData = responseData.map((row: SalesSummaryYearHalf, rowIndex) => {
        return {
          ...row,
          sales_trend: {
            title: formatRowNameShort(row.period_type, fiscalYear - 1)[language],
            subTitle: "前年度伸び率",
            mainValue: row.last_year_sales ?? null,
            growthRate: row.yo2y_growth ? row.yo2y_growth : null,
            data: Array(3)
              .fill(null)
              .map((_, index) => {
                let _date = fiscalYear - 3 + index;
                if (row.period_type === "fiscal_year") _date = fiscalYear - 3 + index;
                if (row.period_type === "first_half") _date = (fiscalYear - 3 + index) * 10 + 1;
                if (row.period_type === "second_half") _date = (fiscalYear - 3 + index) * 10 + 2;
                let salesValue = row.three_years_ago_sales;
                if (index === 1) salesValue = row.two_years_ago_sales;
                if (index === 2) salesValue = row.last_year_sales;
                return {
                  date: _date,
                  value: salesValue,
                };
              }),
          },
        } as SalesSummaryYearHalf & { sales_trend: SparkChartObj };
      });
    }

    // 0.8秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log("✅✅✅ useQuery getSalesSummaryAndGrowth関数成功 responseData", responseData);

    return responseData as (SalesSummaryYearHalf & { sales_trend: SparkChartObj })[] | null;
  };

  return useQuery({
    queryKey: ["sales_summary_and_growth", entityLevel, entityId, periodType, fiscalYear],
    queryFn: getSalesSummaryAndGrowth,
    staleTime: Infinity,
    onError: (error) => {
      console.error("useQueryDepartments error:", error);
    },
    enabled: !!companyId && !!entityLevel && !!entityId && !!periodType && !!fiscalYear && fetchEnabled,
  });
};
