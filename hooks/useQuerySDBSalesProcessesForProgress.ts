import { FiscalYearAllKeys, PropertiesPeriodKey, SalesProcessesForSDB } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";

type Props = {
  fiscalYear: number;
  fiscalYearId: string;
  entityLevelId: string;
  entityStructureId: string;
  companyId: string;
  entityId: string;
  entityLevel: string;
  periodTypeForTarget: FiscalYearAllKeys | null;
  periodTypeForProperty: PropertiesPeriodKey;
  basePeriod: number;
  halfYearPeriod: number | null;
  halfYearPeriodTypeForTarget: "first_half" | "second_half";
  fetchEnabled?: boolean;
};

// 過去3年分の売上実績と前年度の伸び率実績を取得するuseQuery
export const useQuerySDBSalesProcessesForProgress = ({
  fiscalYear,
  fiscalYearId,
  entityLevelId,
  entityStructureId,
  companyId,
  entityId,
  entityLevel,
  periodTypeForTarget,
  periodTypeForProperty,
  basePeriod,
  halfYearPeriod,
  halfYearPeriodTypeForTarget,
  fetchEnabled = true,
}: Props) => {
  const supabase = useSupabaseClient();

  const getSalesProcesses = async (): Promise<SalesProcessesForSDB[] | null> => {
    if (!halfYearPeriod) return null;
    if (!periodTypeForTarget) return null;
    // FUNCTIONの返り値
    let responseData = null;

    // 指定したエンティティ
    // プロセス：指定した期間 (配列でstartとendを渡して一定期間のプロセスを取得できるようにする)
    // プロセス：
    // TELPR・TEL発信All
    // 新規面談・面談All
    // 展開・展開率
    // 展開F・展開F率
    // A数(今月度)
    // 展開F(今期)・F獲得(今期)・F獲得率
    //
    //
    // 売上：指定した期間と半期
    //

    const payload = {
      _fiscal_year_id: fiscalYearId,
      _entity_level_id: entityLevelId, // エンティティテーブルid
      _entity_structure_id: entityStructureId, // エンティティテーブルid
      _company_id: companyId, // 会社id
      _entity_id: entityId, // エンティティid
      _entity_level: entityLevel, // エンティティレベルの割り当て
      _period_type_for_target: periodTypeForTarget, // 期間タイプ(sales_targetsテーブル用)
      _period_type_for_sales: periodTypeForProperty, // 期間タイプ(propertiesテーブル用)
      _period: basePeriod, // 期間
      _half_year_period: halfYearPeriod,
      _half_year_period_type_for_target: halfYearPeriodTypeForTarget,
    };

    console.log("🔥useQuerySDBSalesProcessesForProgress rpc get_sales_processes_for_progress関数実行 payload", payload);

    const { data, error } = await supabase.rpc("get_sales_processes_for_progress", payload);

    if (error) {
      console.error("❌getSalesProcessesエラー発生", error);
      throw error;
    }

    responseData = data as SalesProcessesForSDB[];

    // 0.8秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log("✅✅✅ useQuery getSalesProcesses関数成功 responseData", responseData, "data", data);

    return responseData;
  };

  return useQuery({
    queryKey: ["sales_processes_for_progress", fiscalYear, periodTypeForProperty, basePeriod, entityId],
    queryFn: getSalesProcesses,
    staleTime: Infinity,
    onError: (error) => {
      console.error("useQueryDepartments error:", error);
    },
    enabled: fetchEnabled && !!halfYearPeriod && !!periodTypeForTarget,
  });
};
