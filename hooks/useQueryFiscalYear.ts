import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { FiscalYears } from "../types";

// 設定済みの売上目標の年度を取得するuseQuery
export const useQueryFiscalYear = (
  company_id: string | null | undefined,
  targetType: string | null | undefined,
  fiscalYear: number,
  isReady: boolean = true
) => {
  const supabase = useSupabaseClient();

  const getFiscalYear = async () => {
    // console.log("useQueryFiscalYear getFiscalYear関数実行 company_id", company_id);

    const { data, error } = await supabase
      .from("fiscal_years")
      .select("*")
      .eq("created_by_company_id", company_id)
      .eq("target_type", targetType)
      .eq("fiscal_year", fiscalYear)
      .order("fiscal_year", { ascending: false });

    if (error) {
      console.log("❌getFiscalYearエラー発生", error.message);
      throw error;
    }

    // console.log("useQueryFiscalYear getFiscalYear関数実行取得結果 data", data);

    // 0.8秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
    await new Promise((resolve) => setTimeout(resolve, 500));

    return !!data?.length ? (data[0] as FiscalYears) : null;
  };

  return useQuery({
    queryKey: ["fiscal_year", targetType, fiscalYear],
    queryFn: getFiscalYear,
    staleTime: Infinity,
    onError: (error) => {
      console.error("❌useQueryFiscalYear error:", error);
    },
    // enabled: !!company_id,
    enabled: !!company_id && !!targetType && !!fiscalYear && isReady,
  });
};
