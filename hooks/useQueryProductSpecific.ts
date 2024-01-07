import { Product } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";

type Props = {
  company_id: string | null | undefined;
  productId: string | null;
  isReady?: boolean;
};

export const useQueryProductSpecific = ({ company_id, productId, isReady = true }: Props) => {
  // const userProfileState = useDashboardStore((state) => state.userProfileState);
  // const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  const supabase = useSupabaseClient();

  const getProducts = async () => {
    if (!company_id || !productId) return;

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
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
    // await new Promise((resolve) => setTimeout(resolve, 200));

    return data[0] as Product;
  };

  return useQuery({
    queryKey: ["specific_products", productId],
    queryFn: getProducts,
    staleTime: Infinity,
    onError: (error) => {
      console.error("useQueryProducts error:", error);
    },
    enabled: !!productId && !!company_id && isReady,
  });
};
