import { SalesTargetsHalfDetails } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";

type Props = {
  companyId: string;
  entityLevel: string;
  entityId: string;
  periodType: string;
  fiscalYear: number;
  fetchEnabled?: boolean;
};

// メンバーレベルの売上設定時に親エンティティであるメイン目標の「半期」の売上目標を取得するuseQuery
export const useQuerySalesTargetsMainHalfDetails = ({
  companyId,
  entityLevel,
  entityId,
  periodType, // 「first_half_details」「second_half_details」
  fiscalYear, // 現在選択中の会計年度(FUNCTION側で-1)
  fetchEnabled = false,
}: Props) => {
  const supabase = useSupabaseClient();

  const getSalesTargetsMainHalfDetails = async () => {
    let responseData = null;

    // 1. 「上半期・下半期」の売上目標
    const payload = {
      _entity_level: entityLevel, // エンティティタイプの割り当て
      _company_id: companyId, // 会社id
      _entity_id: entityId, // エンティティid
      _fiscal_year: fiscalYear, // 現在の会計年度
      _period_type: periodType, // 「first_half_details」「second_half_details」
    };

    console.log("🔥useQuerySalesTargetsMainHalfDetails rpc get_sales_target_main_half_details payload", payload);

    const { data, error } = await supabase.rpc("get_sales_target_main_half_details", payload);

    if (error) {
      console.error("❌getSalesTargetsMainHalfDetails", error);
      throw error;
    }

    responseData = data;

    // 0.5秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log("✅✅✅ useQuery getSalesTargetsMainHalfDetails responseData", responseData);

    return responseData as SalesTargetsHalfDetails | null;
  };

  return useQuery({
    queryKey: ["sales_target_main_half_details", entityLevel, entityId, periodType, fiscalYear],
    queryFn: getSalesTargetsMainHalfDetails,
    staleTime: Infinity,
    onError: (error) => {
      console.error("useQueryDepartments error:", error);
    },
    enabled: !!companyId && !!entityLevel && !!entityId && !!periodType && !!fiscalYear && fetchEnabled,
  });
};
