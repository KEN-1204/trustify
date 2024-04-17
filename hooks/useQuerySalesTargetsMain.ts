import { formatRowNameShort } from "@/components/DashboardSalesTargetComponent/TargetContainer/UpsertTarget/UpsertTarget";
import useStore from "@/store";
import { FiscalYearMonthObjForTarget, SalesSummaryYearHalf, SalesTargetsYearHalf, SparkChartObj } from "@/types";
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
export const useQuerySalesTargetsMain = ({
  companyId,
  entityLevel,
  entityId,
  periodType, // 「year_half」「first_half_details」「second_half_details」
  fiscalYear, // 現在選択中の会計年度(FUNCTION側で-1)
  fetchEnabled = true,
}: Props) => {
  const supabase = useSupabaseClient();

  const getSalesTargetsMain = async () => {
    let responseData = null;

    // 1. 「年度・上半期・下半期」の売上目標
    const payload = {
      _entity_level: entityLevel, // エンティティタイプの割り当て
      _company_id: companyId, // 会社id
      _entity_id: entityId, // エンティティid
      _fiscal_year: fiscalYear, // 現在の会計年度
      // _period_type: periodType, // 「year_half」「first_half_details」「second_half_details」
    };

    console.log("🔥useQuerySalesTargetsMain rpc get_sales_target_main_year_half payload", payload);

    const { data, error } = await supabase.rpc("get_sales_target_main_year_half", payload);

    if (error) {
      console.error("❌getSalesTargetsMain", error);
      throw error;
    }

    responseData = data;

    // 0.5秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log("✅✅✅ useQuery getSalesTargetsMain responseData", responseData);

    return responseData as SalesTargetsYearHalf | null;
  };

  return useQuery({
    queryKey: ["sales_target_main_year_half", entityLevel, entityId, periodType, fiscalYear],
    queryFn: getSalesTargetsMain,
    staleTime: Infinity,
    onError: (error) => {
      console.error("useQueryDepartments error:", error);
    },
    enabled: !!companyId && !!entityLevel && !!entityId && !!periodType && !!fiscalYear && fetchEnabled,
  });
};
