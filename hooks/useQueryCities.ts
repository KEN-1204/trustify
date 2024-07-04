import { Cities } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";

export const useQueryCities = (
  region_id: number | null | undefined,
  isReady: boolean = true,
  language: string = "ja"
) => {
  const supabase = useSupabaseClient();

  const getCities = async () => {
    console.log("useQueryCities getCities実行");

    // let fields;
    // if (language === "ja") fields = "city_id, city_name_ja";
    // if (language === "en") fields = "city_id, city_name_en";
    const { data, error } = await supabase.from("cities").select("*").eq("region_id", region_id);
    // const { data, error } = await supabase.from("cities").select(fields).eq("region_id", region_id);

    // const params = {
    //   "contacts.id": contact_id,
    // };
    // const { data, error } = await supabase
    //   .rpc("search_companies_and_contacts", { params })
    //   .eq("created_by_company_id", userProfileState.company_id);

    if (error) {
      console.log("❌getCitiesエラー発生", error.message);
      throw error;
    }

    console.log("useQueryCities getCities成功 市区町村取得✅", data);

    // 0.8秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
    // await new Promise((resolve) => setTimeout(resolve, 500));

    return data as Cities[] | [];
  };

  return useQuery({
    queryKey: ["cities", region_id],
    queryFn: getCities,
    staleTime: Infinity,
    onError: (error) => {
      console.error("useQueryDepartments error:", error);
    },
    // enabled: !!contact_id,
    enabled: !!region_id,
  });
};
