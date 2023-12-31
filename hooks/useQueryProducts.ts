import useDashboardStore from "@/store/useDashboardStore";
import { Product } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import React from "react";

export const useQueryProducts = (company_id: string | null | undefined, userId: string | null | undefined) => {
  // const userProfileState = useDashboardStore((state) => state.userProfileState);
  // const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  const supabase = useSupabaseClient();

  const getProducts = async () => {
    // setLoadingGlobalState(true);
    // console.log("useQueryProduct getProducts関数実行 company_id", company_id);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("created_by_company_id", company_id)
      .order("product_name", { ascending: true });

    if (error) {
      // alert(error.message);
      console.error("getProductsFreeエラー発生", error.message);
      // setLoadingGlobalState(false);
      throw new Error(error.message);
    }

    // setLoadingGlobalState(false);

    // 0.8秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
    await new Promise((resolve) => setTimeout(resolve, 800));

    return data as Product[];
  };

  return useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    staleTime: Infinity,
    onError: (error) => {
      console.error("useQueryProducts error:", error);
    },
  });
};
