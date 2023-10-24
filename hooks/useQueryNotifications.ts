import useDashboardStore from "@/store/useDashboardStore";
import { Notification } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";

export const useQueryNotifications = (user_id: string, isReady: boolean) => {
  const supabase = useSupabaseClient();
  console.log("useQueryNotificationsカスタムフック実行 user_id", user_id, "isReady", isReady);

  const getMyNotifications = async () => {
    // console.log("useQueryNotificationsカスタムフック実行🔥 user_id", userProfileState?.id, "isReady", isReady);
    // const { data: memberAccountsData, error: a } = await supabase
    //   .rpc("get_member_accounts_data", {
    //     _subscription_id: userProfileState.subscription_id,
    //   })
    //   .order("profile_name", { ascending: true });

    const { data: notificationData, error } = await supabase
      .from("notifications")
      .select()
      .eq("to_user_id", user_id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("getMyNotificationsエラー発生", error.message);
      // throw new Error(error.message);
      return [];
    }

    console.log(
      "useQueryNotifications getMyNotifications関数実行🔥 user_id",
      user_id,
      "isReady",
      isReady,
      "取得したnotificationData",
      notificationData
    );

    return notificationData as Notification[] | [];
  };

  return useQuery({
    queryKey: ["my_notifications"],
    queryFn: getMyNotifications,
    staleTime: Infinity,
    onError: (error: any) => {
      alert(error.message);
      console.error("useQueryNotificationsカスタムフック error:", error);
    },
    // enabled: isReady,
    enabled: isReady && !!user_id,
  });
};
