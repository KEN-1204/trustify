import useDashboardStore from "@/store/useDashboardStore";
import { StripeSchedule } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";

export const useQueryStripeSchedules = () => {
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const supabase = useSupabaseClient();

  const getStripeSchedules = async () => {
    if (!userProfileState) return null;
    console.log(
      "useQueryMemberAccountsカスタムフック getStripeSchedules関数 userProfileState.subscription_id",
      userProfileState.subscription_id
    );
    // const { data: stripeSchedulesData, error } = await supabase
    //   .rpc("get_member_accounts_data", {
    //     _subscription_id: userProfileState.subscription_id,
    //   })
    //   .order("profile_name", { ascending: true });
    const { data: stripeSchedulesData, error } = await supabase
      .from("stripe_schedules")
      .select()
      .eq("subscription_id", userProfileState.subscription_id)
      .eq("schedule_status", "active")
      // .order("created_at", { ascending: true });
      .order("created_at", { ascending: false });

    if (error) {
      console.log("getStripeSchedulesエラー発生", error.message);
      throw new Error(error.message);
    }

    // 0.8秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
    await new Promise((resolve) => setTimeout(resolve, 800));

    return stripeSchedulesData as StripeSchedule[];
  };

  return useQuery({
    queryKey: ["stripe_schedules"],
    queryFn: getStripeSchedules,
    staleTime: Infinity,
    onError: (error: any) => {
      alert(error.message);
      console.error("useQueryStripeSchedulesカスタムフック error:", error);
    },
  });
};
