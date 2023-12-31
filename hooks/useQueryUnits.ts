import { Unit } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";

export const useQueryUnits = (company_id: string | null | undefined, isReady: boolean = true) => {
  const supabase = useSupabaseClient();

  const getOurUnits = async () => {
    if (!company_id) return [];
    // console.log("useQueryUnits getOurUnits関数実行 company_id", company_id);
    const { data, error } = await supabase
      .from("units")
      .select("*")
      .eq("created_by_company_id", company_id)
      .order("unit_name", { ascending: true });

    if (error) {
      console.log("❌getOurUnitsエラー発生", error.message);
      throw error;
    }
    // console.log("useQueryUnits getOurUnits関数実行取得結果 data", data);
    // 0.8秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
    await new Promise((resolve) => setTimeout(resolve, 500));

    return data as Unit[];
  };

  return useQuery({
    queryKey: ["units"],
    queryFn: getOurUnits,
    staleTime: Infinity,
    onError: (error) => {
      console.error("useQueryUnits error:", error);
    },
    // enabled: !!company_id,
    enabled: !!company_id && isReady,
  });
};
