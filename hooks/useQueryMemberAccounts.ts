import useDashboardStore from "@/store/useDashboardStore";
import { MemberAccounts, Product } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";

export const useQueryMemberAccounts = () => {
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const supabase = useSupabaseClient();

  const getMemberAccounts = async () => {
    // setLoadingGlobalState(true);
    if (!userProfileState) return null;
    console.log(
      "useQueryMemberAccountsカスタムフック getMemberAccounts関数 userProfileState.subscription_id",
      userProfileState.subscription_id
    );
    const { data: memberAccountsData, error } = await supabase
      .rpc("get_member_accounts_data", {
        _subscription_id: userProfileState.subscription_id,
      })
      .order("profile_name", { ascending: true });

    if (error) {
      console.log("getMemberAccountsエラー発生", error.message);
      throw new Error(error.message);
    }

    return memberAccountsData as MemberAccounts[] | [];
  };

  return useQuery({
    queryKey: ["member_accounts"],
    queryFn: getMemberAccounts,
    staleTime: Infinity,
    onError: (error: any) => {
      alert(error.message);
      console.error("useQueryMemberAccountsカスタムフック error:", error);
    },
  });
};