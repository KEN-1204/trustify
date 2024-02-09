import { Client_company, Department } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";

export const useQueryClientCompanyOnly = (company_id: string | null | undefined, isReady: boolean = true) => {
  const supabase = useSupabaseClient();

  const getClientCompany = async () => {
    // console.log("useQueryDepartments getOurDepartments関数実行 company_id", company_id);
    const { data, error } = await supabase.from("client_companies").select("*").eq("id", company_id);

    if (error) {
      console.log("❌getOurDepartmentsエラー発生", error.message);
      throw error;
    }
    // console.log("useQueryDepartments getOurDepartments関数実行取得結果 data", data);

    // 0.8秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
    await new Promise((resolve) => setTimeout(resolve, 500));

    return data[0] as Client_company | null;
  };

  return useQuery({
    queryKey: ["client_company_detail", company_id],
    queryFn: getClientCompany,
    staleTime: Infinity,
    onError: (error) => {
      console.error("useQueryDepartments error:", error);
    },
    // enabled: !!company_id,
    enabled: !!company_id,
  });
};
