import { Section } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";

export const useQuerySections = (company_id: string | null | undefined, isReady: boolean = true) => {
  const supabase = useSupabaseClient();

  const getOurSections = async () => {
    if (!company_id) return [];

    const { data, error } = await supabase
      .from("sections")
      .select("*")
      .eq("created_by_company_id", company_id)
      .order("section_name", { ascending: true });

    if (error) {
      console.log("❌getOurSectionsエラー発生", error.message);
      throw error;
    }
    console.log("useQuerySections getOurSections関数実行取得結果 data", data);
    // 0.8秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
    await new Promise((resolve) => setTimeout(resolve, 500));

    return data as Section[];
  };

  return useQuery({
    queryKey: ["sections"],
    queryFn: getOurSections,
    staleTime: Infinity,
    onError: (error) => {
      console.error("useQueryUnits error:", error);
    },
    // enabled: !!company_id,
    enabled: !!company_id && isReady,
  });
};
