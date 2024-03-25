import useDashboardStore from "@/store/useDashboardStore";
import { MemberAccounts, Product } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";

export const useQueryMemberAccounts = () => {
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const supabase = useSupabaseClient();

  const getMemberAccounts = async () => {
    // setLoadingGlobalState(true);
    if (!userProfileState) return [];
    console.log(
      "useQueryMemberAccountsカスタムフック getMemberAccounts関数 userProfileState.subscription_id",
      userProfileState.subscription_id
    );
    // メンバーのプロフィールとアカウントのみ
    // const { data: memberAccountsData, error } = await supabase
    //   .rpc("get_member_accounts_data", {
    //     _subscription_id: userProfileState.subscription_id,
    //   })
    //   .order("profile_name", { ascending: true });

    // メンバーのプロフィールとアカウントと事業部、係、事業所、社員番号も同時に取得
    // const { data: memberAccountsData, error } = await supabase
    const { data: memberAccountsData, error } = await supabase
      .rpc("get_member_accounts_all_data", {
        _subscription_id: userProfileState.subscription_id,
        _company_id: userProfileState.company_id,
      })
      .order("profile_name", { ascending: true });
    if (error) {
      console.log("getMemberAccountsエラー発生", error.message);
      throw new Error(error.message);
    }

    // 0.8秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
    await new Promise((resolve) => setTimeout(resolve, 800));

    return memberAccountsData as MemberAccounts[] | [];
  };

  return useQuery({
    queryKey: ["member_accounts"],
    queryFn: getMemberAccounts,
    staleTime: Infinity,
    onError: (error: any) => {
      alert(error.message);
      console.error("useQueryMemberAccountsカスタムフック error:", error);
      return [];
    },
  });
};
