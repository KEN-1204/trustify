import useDashboardStore from "@/store/useDashboardStore";
import { Contact_row_data } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";

type Props = {
  companyId: string;
  entityType: string;
  entityId: string;
  periodType: string; // 「year_half」と「half_monthly」
  lastFiscalYear: number;
  startYearMonth?: number; // 2, 3の「half_monthly」の場合にのみセット
  endYearMonth?: number;
  isReady?: boolean;
};

export const useQueryLastYearSales = ({
  companyId,
  entityType,
  entityId,
  periodType,
  lastFiscalYear,
  startYearMonth,
  endYearMonth,
  isReady = true,
}: Props) => {
  const supabase = useSupabaseClient();

  const getLastYearSales = async () => {
    // 下記3パターンを引数で振り分けてFUNCTIONを実行し、キャッシュに格納

    // 1. 「年度・上半期・下半期」の3年分の売上
    // 2. 「上半期・Q1, Q2・01~06」の3年分の売上
    // 3. 「下半期・Q3, Q4・07~12」の3年分の売上

    let params: { [key: string]: string | number } = {
      _company_id: companyId,
      _entity_id: entityId, // エンティティid
      _entity_type: entityType, // エンティティタイプの割り当て
    };

    let responseData = null;

    // 期間の割り当てとrpcの実行
    if (periodType === "year_half") {
      params = {
        _company_id: companyId,
        _entity_id: entityId, // エンティティid
        _entity_type: entityType, // エンティティタイプの割り当て
        _last_fiscal_year: lastFiscalYear,
      };

      const { data, error } = await supabase
        .rpc("get_sales_summary_and_growth", { params })
        .eq("created_by_company_id", companyId);

      if (error) {
        console.log("❌getLastYearSalesエラー発生", error.message);
        throw error;
      }

      responseData = data[0];
    } else if (periodType === "year_half") {
    }

    // 0.8秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
    await new Promise((resolve) => setTimeout(resolve, 500));

    return data[0] as Contact_row_data | null;
  };

  return useQuery({
    queryKey: ["contact_detail", contact_id],
    queryFn: getLastYearSales,
    staleTime: Infinity,
    onError: (error) => {
      console.error("useQueryDepartments error:", error);
    },
    // enabled: !!contact_id,
    enabled: !!contact_id && !!userProfileState?.company_id,
  });
};
