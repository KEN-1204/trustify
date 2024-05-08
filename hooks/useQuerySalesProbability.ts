import { formatRowNameShort } from "@/components/DashboardSalesTargetComponent/TargetContainer/UpsertTarget/UpsertTarget";
import useStore from "@/store";
import {
  AreaChartObj,
  DonutChartObj,
  FiscalYearMonthObjForTarget,
  LabelDataSalesProbability,
  LabelValue,
  LabelValueGroupByPeriod,
  LegendNameId,
  SalesProbabilitiesChartData,
  SalesSummaryYearHalf,
  SalesTrendResponse,
  SalesTrendYearHalf,
  SparkChartObj,
} from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";

type Props = {
  companyId: string;
  entityLevel: string;
  entityId: string;
  // periodType: string;
  periodType: "fiscal_year" | "half_year" | "quarter" | "year_month";
  basePeriod: number;
  fetchEnabled?: boolean;
};

// 過去3年分の売上実績と前年度の伸び率実績を取得するuseQuery
export const useQuerySalesProbability = ({
  companyId,
  entityLevel,
  entityId,
  periodType, // 期間タイプ fiscal_year, half_year, quarter, year_month
  basePeriod, // 起点となる時点
  fetchEnabled = true,
}: Props) => {
  const supabase = useSupabaseClient();

  const getSalesProbability = async (): Promise<SalesProbabilitiesChartData | null> => {
    // FUNCTIONの返り値
    let responseData = null;

    // 指定した期間タイプ(年度、半期、四半期、月度)の、
    // 指定した各エンティティの、
    // 指定した年度から指定した年数分遡った期間の
    // 「現年度売上、前年度売上、成長率、エンティティid、エンティティ名」を渡したエンティティの数分取得する

    const payload = {
      _company_id: companyId, // 会社id
      _entity_id: entityId, // エンティティid
      _entity_level: entityLevel, // エンティティレベルの割り当て
      _base_period: basePeriod, // 取得する期間
      _period_type: periodType, // 期間タイプ
    };

    console.log("🔥useQuerySalesProbability rpc get_sales_probability_by_entity関数実行 payload", payload);

    const { data, error } = await supabase
      // .rpc("get_sales_probability_by_entity", { payload })
      .rpc("get_sales_probability_by_entity", payload);
    // .eq("created_by_company_id", companyId);

    if (error) {
      console.error("❌getSalesProbabilityエラー発生", error);
      throw error;
    }

    responseData = data as LabelDataSalesProbability[];

    // queryの返り値
    let salesProbabilitiesObj: SalesProbabilitiesChartData | null = null;

    if (Array.isArray(responseData) && responseData.length !== 0) {
      // 🔸ドーナツチャート用の配列を作成 {date: 期間, value: amount, ...}[]
      const donutChartData = responseData.map(
        (obj) => ({ name: obj.sales_probability_name, value: obj.amount } as DonutChartObj)
      );

      // ドーナツチャートツールチップ用のそれぞれの確度のamountの合計値を算出
      const totalAmount = responseData.reduce((acc: number, item: LabelDataSalesProbability) => {
        const newAmount = (acc += item.amount);
        return newAmount;
      }, 0);

      salesProbabilitiesObj = {
        total_amount: totalAmount,
        chartData: donutChartData,
        labelListSalesProbabilities: responseData,
      };
    }

    // 0.8秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log(
      "✅✅✅ useQuery getSalesProbability関数成功 salesProbabilitiesObj",
      salesProbabilitiesObj,
      "data",
      data
    );

    return salesProbabilitiesObj;
  };

  return useQuery({
    queryKey: ["sales_probability", entityLevel, entityId, periodType, basePeriod],
    queryFn: getSalesProbability,
    staleTime: Infinity,
    onError: (error) => {
      console.error("useQueryDepartments error:", error);
    },
    enabled: !!companyId && !!entityLevel && !!entityId && !!periodType && !!basePeriod && fetchEnabled,
  });
};
