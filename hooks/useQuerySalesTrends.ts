import { formatRowNameShort } from "@/components/DashboardSalesTargetComponent/TargetContainer/UpsertTarget/UpsertTarget";
import useStore from "@/store";
import { FiscalYearMonthObjForTarget, SalesSummaryYearHalf, SparkChartObj } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";

type Props = {
  companyId: string;
  entityLevel: string;
  entityIdsArray: string[];
  periodType: string;
  fiscalYear: number;
  isFirstHalf?: boolean | undefined;
  annualFiscalMonths?: FiscalYearMonthObjForTarget | undefined | null;
  fetchEnabled?: boolean;
};

// 過去3年分の売上実績と前年度の伸び率実績を取得するuseQuery
export const useQuerySalesTrends = ({
  companyId,
  entityLevel,
  entityIdsArray,
  periodType, // 「year_half」と「half_monthly」
  fiscalYear, // 現在選択中の会計年度(FUNCTION側で-1)
  isFirstHalf,
  annualFiscalMonths,
  fetchEnabled = true,
}: Props) => {
  const language = useStore((state) => state.language);
  const supabase = useSupabaseClient();

  const getSalesTrends = async () => {
    // 下記3パターンを引数で振り分けてFUNCTIONを実行し、キャッシュに格納

    // 1. 「年度・上半期・下半期」の3年分の売上
    // 2. 「上半期・Q1, Q2・01~06」の3年分の売上
    // 3. 「下半期・Q3, Q4・07~12」の3年分の売上

    let responseData = null;

    // 1. 「年度・上半期・下半期」の3年分の売上
    if (periodType === "year_half") {
      const payload = {
        _entity_level: entityLevel, // エンティティタイプの割り当て
        _entity_ids: entityIdsArray, // エンティティid
        _fiscal_year: fiscalYear, // 現在の会計年度
      };

      console.log(
        "🔥useQuerySalesTrends rpc get_sales_summary_and_growth_year_and_half関数実行 payload",
        payload
      );

      const { data, error } = await supabase
        // .rpc("get_sales_summary_and_growth_year_and_half", { payload })
        .rpc("get_sales_summary_and_growth_year_and_half", payload);
      // .eq("created_by_company_id", companyId);

      if (error) {
        console.error("❌getSalesTrendsエラー発生", error);
        throw error;
      }

      responseData = data;
    }
    // 2.3. 「半期〜月度」
    else if (periodType === "half_monthly") {
      // if (!annualFiscalMonthsLastYear || !annualFiscalMonthsTwoYearsAgo || !annualFiscalMonthsThreeYearsAgo)
      //   return null;
      if (!annualFiscalMonths) return null;
      // 2. 「上半期・Q1, Q2・01~06」の3年分の売上
      if (isFirstHalf == true) {
        const payload = {
          _entity_level: entityLevel, // エンティティタイプの割り当て
          _entity_ids: entityIdsArray, // エンティティid
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
          "🔥useQuerySalesTrends rpc get_sales_summary_and_growth_first_half_monthly関数実行 payload",
          payload
        );

        const { data, error } = await supabase.rpc("get_sales_summary_and_growth_first_half_monthly", payload);
        // .eq("created_by_company_id", companyId);

        if (error) {
          console.error("❌getSalesTrendsエラー発生", error);
          throw error;
        }

        responseData = data;
      }
      // 3. 「下半期・Q3, Q4・07~12」の3年分の売上
      else {
        const payload = {
          _entity_level: entityLevel, // エンティティタイプの割り当て
          _entity_ids: entityIdsArray, // エンティティid
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
          "🔥useQuerySalesTrends rpc get_sales_summary_and_growth_second_half_monthly関数実行 payload",
          payload
        );

        const { data, error } = await supabase.rpc("get_sales_summary_and_growth_second_half_monthly", payload);
        // .eq("created_by_company_id", companyId);

        if (error) {
          console.error("❌getSalesTrendsエラー発生", error);
          throw error;
        }

        responseData = data;
      }
    }

    // 売上推移カラムを追加
    if (Array.isArray(responseData) && responseData.length > 0) {
      responseData = responseData.map((row: SalesSummaryYearHalf, rowIndex) => {
        return {
          ...row,
          sales_trend: 
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
        } as SalesSummaryYearHalf & { sales_trend: SparkChartObj };
      });
    }

    // 0.8秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log("✅✅✅ useQuery getSalesTrends関数成功 responseData", responseData);

    return responseData as (SalesSummaryYearHalf & { sales_trend: SparkChartObj })[] | null;
  };

  return useQuery({
    queryKey: ["sales_trends", entityLevel, entityIdsArray, periodType, fiscalYear, isFirstHalf],
    queryFn: getSalesTrends,
    staleTime: Infinity,
    onError: (error) => {
      console.error("useQueryDepartments error:", error);
    },
    enabled: !!companyId && !!entityLevel && !!entityIdsArray && !!periodType && !!fiscalYear && fetchEnabled,
  });
};
