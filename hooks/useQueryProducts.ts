import useDashboardStore from "@/store/useDashboardStore";
import { Product } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import React from "react";

export const useQueryProducts = (company_id: string | null | undefined, userId: string | null | undefined) => {
  // const userProfileState = useDashboardStore((state) => state.userProfileState);
  // const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  const supabase = useSupabaseClient();

  const getProductsFree = async () => {
    // setLoadingGlobalState(true);
    console.log("useQueryProduct無料ユーザー会社id無し getProductsFree userId", userId);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("created_by_user_id", userId)
      .order("product_name", { ascending: true });

    if (error) {
      alert(error.message);
      console.log("getProductsFreeエラー発生", error.message);
      // setLoadingGlobalState(false);
      throw new Error(error.message);
    }

    // setLoadingGlobalState(false);

    return data as Product[];
  };

  return useQuery({
    queryKey: ["products"],
    queryFn: getProductsFree,
    staleTime: Infinity,
    onError: (error) => {
      console.error("useQueryProducts error:", error);
    },
  });
};
