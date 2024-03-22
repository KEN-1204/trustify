import useDashboardStore from "@/store/useDashboardStore";
import { Notification } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";

export const useQueryNotifications = (user_id: string, isReady: boolean) => {
  const supabase = useSupabaseClient();
  // console.log("useQueryNotificationsカスタムフック実行 user_id", user_id, "isReady", isReady);

  const getMyNotifications = async () => {
    // console.log("useQueryNotificationsカスタムフック実行🔥 user_id", userProfileState?.id, "isReady", isReady);
    // const { data: memberAccountsData, error: a } = await supabase
    //   .rpc("get_member_accounts_data", {
    //     _subscription_id: userProfileState.subscription_id,
    //   })
    //   .order("profile_name", { ascending: true });

    // // ===================== 時間まで指定して取得するパターン =====================
    // // 「2023年10月24日17:00」のDateオブジェクトを作成
    // const startDate = new Date(2023, 9, 24, 17, 0, 0); // 月は0ベースなので、10月は9となります
    // // 「2023年10月24日18:00」のDateオブジェクトを作成
    // const endDate = new Date(2023, 9, 24, 18, 0, 0);
    // const { data: notificationData, error } = await supabase
    //   .from("notifications")
    //   .select()
    //   .eq("to_user_id", user_id)
    //   .gte("created_at", startDate.toISOString())
    //   .lte("created_at", endDate.toISOString())
    //   .order("created_at", { ascending: false });

    // // ===================== 現在から１ヶ月間前のお知らせを取得するパターン =====================
    // 現在の日付を取得
    const now = new Date();
    // １ヶ月前の日付を取得
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);
    const { data: notificationData, error } = await supabase
      .from("notifications")
      .select()
      .eq("to_user_id", user_id)
      .gte("created_at", oneMonthAgo.toISOString())
      .lte("created_at", now.toISOString())
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
      // "startDate",
      // startDate.toISOString(),
      // "endDate",
      // endDate.toISOString()
      "oneMonthAgo.toISOString()",
      oneMonthAgo.toISOString(),
      "now.toISOString()",
      now.toISOString()
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
