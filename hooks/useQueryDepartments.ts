import { Department } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";

export const useQueryDepartments = (company_id: string | null | undefined, isReady: boolean = true) => {
  const supabase = useSupabaseClient();

  const getOurDepartments = async () => {
    if (!company_id) return [];
    // console.log("useQueryDepartments getOurDepartments関数実行 company_id", company_id);
    const { data, error } = await supabase
      .from("departments")
      .select("*")
      .eq("created_by_company_id", company_id)
      .order("department_name", { ascending: true });

    if (error) {
      console.log("❌getOurDepartmentsエラー発生", error.message);
      throw error;
    }
    // console.log("useQueryDepartments getOurDepartments関数実行取得結果 data", data);

    // 0.8秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
    await new Promise((resolve) => setTimeout(resolve, 500));

    return data as Department[];
  };

  return useQuery({
    queryKey: ["departments"],
    queryFn: getOurDepartments,
    staleTime: Infinity,
    onError: (error) => {
      console.error("useQueryDepartments error:", error);
    },
    // enabled: !!company_id,
    enabled: !!company_id && isReady,
  });
};
