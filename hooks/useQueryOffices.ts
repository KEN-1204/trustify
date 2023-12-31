import { Office } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";

export const useQueryOffices = (company_id: string | null | undefined) => {
  const supabase = useSupabaseClient();

  const getOurOffices = async () => {
    if (!company_id) return [];
    // console.log("useQueryOffices getOurOffices関数実行 company_id", company_id);
    const { data, error } = await supabase
      .from("offices")
      .select("*")
      .eq("created_by_company_id", company_id)
      .order("office_name", { ascending: true });

    if (error) {
      console.log("❌useQueryOfficesエラー発生", error.message);
      throw error;
    }
    // console.log("useQueryOffices getOurOffices関数実行取得結果 data", data);

    // 0.8秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
    await new Promise((resolve) => setTimeout(resolve, 500));

    return data as Office[];
  };

  return useQuery({
    queryKey: ["offices"],
    queryFn: getOurOffices,
    staleTime: Infinity,
    onError: (error) => {
      console.error("useQueryOffices error:", error);
    },
    enabled: !!company_id,
  });
};
