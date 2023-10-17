// 【Subscriptionsテーブル監視用リアルタイムカスタムフック】
import useDashboardStore from "@/store/useDashboardStore";
import { UserProfileCompanySubscription } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { RealtimeChannel } from "@supabase/supabase-js";
import React, { useEffect, useRef } from "react";
import { toast } from "react-toastify";

export const useSubscribeSubscribedAccount = () => {
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const setUserProfileState = useDashboardStore((state) => state.setUserProfileState);
  const supabase = useSupabaseClient();

  useEffect(() => {
    if (!userProfileState)
      return console.log(
        "リアルタイムsubscribed_accounts useSubscribeSubscribedAccountリアルタイムフック ユーザー情報無し userProfileState",
        userProfileState
      );

    console.log(
      "🌟リアルタイムsubscribed_accounts 自身に紐づく契約アカウントをサブスクライブ useEffect実行",
      userProfileState
    );

    const channel = supabase
      .channel("subscribed_accounts_update_changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "subscribed_accounts",
          //   filter: `user_id=eq.67a2fb6e-6be6-47e6-a6eb-b94ad278698f`,
          filter: `user_id=eq.${userProfileState.id}`,
        },
        async (payload: any) => {
          // 自分のアカウントが更新された場合のみユーザー情報を更新する
          //   if (payload.old.id !== userProfileState.subscribed_account_id)
          //     return console.log("他メンバーのアカウントUPDATEイベント発火のためそのままリターン");
          console.log("リアルタイムsubscribed_accounts UPDATE検知 🔥", payload, userProfileState.id);
          //   自身のuser_idに紐づくアカウントが更新されたタイミングで発火
          try {
            const { data: userProfileCompanySubscriptionData, error } = await supabase
              .rpc("get_user_data", { _user_id: userProfileState.id })
              .single();

            if (error) throw new Error(error.message);

            // ZustandのStateを更新
            setUserProfileState(userProfileCompanySubscriptionData as UserProfileCompanySubscription);

            toast.success("アカウントが更新されました!", {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              // theme: `${theme === "light" ? "light" : "dark"}`,
            });
          } catch (error: any) {
            alert(`アカウント情報の変更を検知 リアルタイムでユーザー情報の取得に失敗しました: ${error.message}`);
            console.error(
              "リアルタイム subscribed_accountsテーブル UPDATEイベント get_user_data関数実行エラー",
              error.message
            );
          }
        }
      )
      .subscribe();

    return () => {
      console.log("リアルタイムsubscribed_accounts クリーンアップ channel", channel);
      supabase.removeChannel(channel);
    };
  }, [userProfileState, supabase, setUserProfileState]);
};
