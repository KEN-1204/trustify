import {
  DonutChartShareObj,
  EntityLevelNames,
  EntityObjForChart,
  FiscalYearAllKeys,
  LabelDataSalesTargetsShare,
  SalesTargetsShareChartData,
} from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";

type Props = {
  companyId: string;
  parentEntityId: string; // queryKey用
  parentEntityTotalMainTarget: number;
  entityLevel: EntityLevelNames;
  entityLevelId: string;
  fiscalYearId: string;
  entities: EntityObjForChart[];
  //   periodType: string;
  // periodType: "fiscal_year" | "half_year" | "quarter" | "year_month";
  periodType: FiscalYearAllKeys; // 売上目標はsales_targetsテーブルから取得のため、期間詳細を全て区切って取得可能(売上実績のpropertiesテーブルから取得の場合は「"fiscal_year" | "half_year" | "quarter" | "year_month"」の4種類のみ)
  basePeriod: number;
  fetchEnabled?: boolean;
};

// 過去3年分の売上実績と前年度の伸び率実績を取得するuseQuery
export const useQuerySalesTargetsShare = ({
  companyId,
  parentEntityId,
  parentEntityTotalMainTarget,
  entityLevel,
  entityLevelId,
  fiscalYearId,
  entities,
  periodType, // 期間タイプ fiscal_year, half_year, quarter, year_month
  basePeriod, // 起点となる時点
  fetchEnabled = true,
}: Props) => {
  const supabase = useSupabaseClient();

  const getSalesTargetsShare = async (): Promise<SalesTargetsShareChartData | null> => {
    // FUNCTIONの返り値
    let responseData = null;

    // 指定した期間タイプ(年度、半期、四半期、月度)の、
    // 指定した各エンティティの、
    // 指定した年度から指定した年数分遡った期間の
    // 「現年度売上、前年度売上、成長率、エンティティid、エンティティ名」を渡したエンティティの数分取得する

    const payload = {
      _company_id: companyId, // 会社id
      _total_main_target: parentEntityTotalMainTarget, // 上位エンティティ総合売上目標(シェア計算用)
      _entities: entities, // エンティティid配列
      _entity_level: entityLevel, // エンティティレベルの割り当て
      _base_period: basePeriod, // 取得する期間
      _period_type: periodType, // 期間タイプ
      _fiscal_year_id: fiscalYearId,
      _entity_level_id: entityLevelId,
    };

    console.log("🔥useQuerySalesTargetsShare rpc get_sales_targets_share関数実行 payload", payload);

    const { data, error } = await supabase.rpc("get_sales_targets_share", payload);

    if (error) {
      console.error("❌getSalesTargetsShareエラー発生", error);
      throw error;
    }

    responseData = data as LabelDataSalesTargetsShare[];

    // queryの返り値
    let salesTargetShareObj: SalesTargetsShareChartData | null = null;

    if (Array.isArray(responseData) && responseData.length !== 0) {
      // 🔸ドーナツチャート用の配列を作成 {date: 期間, value: amount, ...}[]
      const donutChartData = responseData.map(
        (obj) => ({ name: obj.entity_name, value: obj.amount } as DonutChartShareObj)
      );

      //   // ドーナツチャートツールチップ用のそれぞれの確度のamountの合計値を算出
      //   const totalAmount = responseData.reduce((acc: number, item: LabelDataSalesTargetsShare) => {
      //     const newAmount = (acc += item.amount);
      //     return newAmount;
      //   }, 0);

      salesTargetShareObj = {
        total_amount: parentEntityTotalMainTarget,
        chartData: donutChartData,
        labelListShareSalesTargets: responseData,
      };
    }

    // 0.8秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log("✅✅✅ useQuery getSalesTargetsShare関数成功 salesTargetShareObj", salesTargetShareObj, "data", data);

    return salesTargetShareObj;
  };

  return useQuery({
    queryKey: ["sales_targets_share", parentEntityId, entityLevel, periodType, basePeriod],
    queryFn: getSalesTargetsShare,
    staleTime: Infinity,
    onError: (error) => {
      console.error("useQueryDepartments error:", error);
    },
    enabled: !!companyId && !!parentEntityId && !!entityLevel && !!periodType && !!basePeriod && fetchEnabled,
  });
};
