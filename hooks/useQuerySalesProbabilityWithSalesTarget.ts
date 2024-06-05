import { DonutChartObj, FiscalYearAllKeys, LabelDataSalesProbability, SalesForecastChartData } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";

type Props = {
  companyId: string;
  entityLevel: string;
  entityId: string;
  // periodType: string;
  periodTypeForProperty: "fiscal_year" | "half_year" | "quarter" | "year_month";
  periodTypeForTarget: FiscalYearAllKeys | null;
  period: number;
  fetchEnabled?: boolean;
  fiscalYearId: string | null;
  entityLevelId: string | null;
  entityStructureId: string | null;
};

// 下記を取得するuseQuery
// ・確度別の「平均単価・件数・受注確度・合計(確率込み)」
// ・引数で渡されたエンティティの現在の「売上実績・売上目標・達成率」

export const useQuerySalesProbabilityWithSalesTarget = ({
  companyId,
  entityLevel,
  entityId,
  periodTypeForProperty, // 期間タイプ fiscal_year, half_year, quarter, year_month
  periodTypeForTarget, // 売上目標用期間タイプ FiscalYearAllKeys
  period, // 起点となる時点
  fetchEnabled = true,
  fiscalYearId,
  entityLevelId,
  entityStructureId,
}: Props) => {
  const supabase = useSupabaseClient();

  const getSalesProbabilityWithSalesTarget = async (): Promise<SalesForecastChartData | null> => {
    if (!periodTypeForTarget) return null;
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
      _period: period, // 取得する期間
      //   _period_type: periodType, // 期間タイプ
      _period_type: periodTypeForProperty,
      _period_type_for_target: periodTypeForTarget,
      _fiscal_year_id: fiscalYearId, // オプショナル 売上目標が設定されていて3つのidがNULLでない場合には売上目標と達成率を取得
      _entity_level_id: entityLevelId, // オプショナル エンティティテーブルid
      _entity_structure_id: entityStructureId, // オプショナル エンティティテーブルid
    };

    console.log("🔥useQuerySalesProbability rpc get_sales_forecast_with_sales_target関数実行 payload", payload);

    const { data, error } = await supabase.rpc("get_sales_forecast_with_sales_target", payload);

    if (error) {
      console.error("❌getSalesProbabilityWithSalesTargetエラー発生", error);
      throw error;
    }

    let responseObj = data as {
      current_sales_amount: number;
      current_sales_target: number | null;
      current_achievement_rate: number | null;
      sales_forecast_data: LabelDataSalesProbability[];
    };

    responseData = responseObj.sales_forecast_data;

    // queryの返り値
    let salesForecastObj: SalesForecastChartData | null = null;

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

      salesForecastObj = {
        current_sales_amount: responseObj.current_sales_amount,
        current_sales_target: responseObj.current_sales_target,
        current_achievement_rate: responseObj.current_achievement_rate,
        total_amount: totalAmount,
        chartData: donutChartData,
        labelListSalesProbabilities: responseData,
      };
    }

    // 0.8秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log(
      "✅✅✅useQuery getSalesProbabilityWithSalesTarget関数成功 salesForecastObj",
      salesForecastObj,
      "data",
      data
    );

    return salesForecastObj;
  };

  return useQuery({
    queryKey: ["sales_probability_with_sales_target", entityLevel, entityId, period, period],
    queryFn: getSalesProbabilityWithSalesTarget,
    staleTime: Infinity,
    onError: (error) => {
      console.error("getSalesProbabilityWithSalesTarget error:", error);
    },
    enabled:
      !!companyId &&
      !!entityLevel &&
      !!entityId &&
      !!periodTypeForProperty &&
      !!periodTypeForTarget &&
      !!period &&
      fetchEnabled,
  });
};
