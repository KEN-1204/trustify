import useDashboardStore from "@/store/useDashboardStore";
import { Contact_row_data } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";

export const useQueryContactOnly = (contact_id: string | null | undefined, isReady: boolean = true) => {
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const supabase = useSupabaseClient();

  const getContact = async () => {
    if (!userProfileState) return null;
    // const { data, error } = await supabase.from("contacts").select("*").eq("id", contact_id);
    const params = {
      "contacts.id": contact_id,
      // "contacts.created_by_company_id": userProfileState.company_id,
    };
    const { data, error } = await supabase
      .rpc("search_companies_and_contacts", { params })
      .eq("created_by_company_id", userProfileState.company_id);

    if (error) {
      console.log("❌getContactエラー発生", error.message);
      throw error;
    }

    // 0.8秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
    await new Promise((resolve) => setTimeout(resolve, 500));

    return data[0] as Contact_row_data | null;
  };

  return useQuery({
    queryKey: ["contact_detail", contact_id],
    queryFn: getContact,
    staleTime: Infinity,
    onError: (error) => {
      console.error("useQueryDepartments error:", error);
    },
    // enabled: !!contact_id,
    enabled: !!contact_id && !!userProfileState?.company_id,
  });
};
