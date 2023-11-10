// 【Subscriptionsテーブル監視用リアルタイムカスタムフック】
import useDashboardStore from "@/store/useDashboardStore";
import { Subscription, UserProfileCompanySubscription } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { RealtimeChannel } from "@supabase/supabase-js";
import React, { useEffect, useRef } from "react";

// export const useSubscribeSubscription = () => {
export const useSubscribeSubscription = (userProfile: UserProfileCompanySubscription) => {
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const setUserProfileState = useDashboardStore((state) => state.setUserProfileState);
  const supabase = useSupabaseClient();

  const subscriptionRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    // if (!userProfileState)
    //   return console.log(
    //     "リアルタイム useSubscribeSubscriptionリアルタイムフック ユーザー情報無し userProfileState",
    //     userProfileState
    //   );

    // console.log("リアルタイム サブスクリプション契約状況をサブスクライブ useEffect実行", userProfileState);
    if (!userProfile && !userProfileState)
      return console.log(
        "リアルタイム useSubscribeSubscriptionリアルタイムフック ユーザー情報無し userProfile",
        userProfile,
        userProfileState
      );

    console.log(
      "リアルタイム useSubscribeSubscriptionサブスクリプション契約状況をサブスクライブ useEffect実行  userProfile",
      userProfile,
      userProfileState
    );

    let channel;

    // テーブルのイベント監視の購読を解除
    const stopSubscription = () => {
      if (subscriptionRef.current) {
        console.log(
          "🌟リアルタイム サブスクライブを解除 useSubscribeSubscription subscriptionRef.current",
          subscriptionRef.current,
          "userProfile",
          userProfile
          // "userProfileState",
          // userProfileState
        );
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };

    // if (userProfileState.subscription_id) {
    if (userProfile.subscription_id || userProfileState?.subscription_id) {
      // subscriber_idが非nullの場合はsubscriptionsテーブルの監視を開始
      console.log(
        "🌟リアルタイム subscriptions UPDATEイベント監視を開始 useSubscribeSubscription",
        userProfile.subscription_id,
        userProfileState?.subscription_id
      );

      const subscriptionId = userProfile.subscription_id
        ? userProfile.subscription_id
        : userProfileState?.subscription_id;

      channel = supabase
        .channel("table-db-changes:subscriptions")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "subscriptions",
            // filter: `id=eq.${userProfileState.subscription_id}`,
            filter: `id=eq.${subscriptionId}`,
          },
          async (payload: any) => {
            console.log("🌟🔥リアルタイム subscriptions UPDATE検知発火🔥", payload);
            // subscriptionsテーブルの変更を検知したら現在のuserProfileStateのsubscriptionsテーブルの内容のみ更新する
            const previousUserProfile = userProfile.subscription_id ? { ...userProfile } : { ...userProfileState };
            const newUserData = {
              // ...userProfileState,
              // ...userProfile,
              ...previousUserProfile,
              ...{
                subscription_id: (payload.new as Subscription).id,
                subscription_created_at: (payload.new as Subscription).created_at,
                subscription_subscriber_id: (payload.new as Subscription).subscriber_id,
                subscription_stripe_subscription_id: (payload.new as Subscription).stripe_subscription_id,
                subscription_stripe_customer_id: (payload.new as Subscription).stripe_customer_id,
                status: (payload.new as Subscription).status,
                subscription_interval: (payload.new as Subscription).subscription_interval,
                current_period_start: (payload.new as Subscription).current_period_start,
                current_period_end: (payload.new as Subscription).current_period_end,
                subscription_plan: (payload.new as Subscription).subscription_plan,
                subscription_stage: (payload.new as Subscription).subscription_stage,
                accounts_to_create: (payload.new as Subscription).accounts_to_create,
                number_of_active_subscribed_accounts: (payload.new as Subscription)
                  .number_of_active_subscribed_accounts,
                cancel_at_period_end: (payload.new as Subscription).cancel_at_period_end,
              },
            };
            // payloadに基づいてZustandのStateを更新
            setUserProfileState(newUserData as UserProfileCompanySubscription);
          }
        )
        .subscribe();

      subscriptionRef.current = channel;
    } else {
      // console.log("リアルタイム profiles UPDATE 監視を開始");

      // channel = supabase
      //   .channel("table-db-changes:profiles")
      //   .on(
      //     "postgres_changes",
      //     {
      //       event: "UPDATE",
      //       scheme: "public",
      //       table: "subscribed_accounts",
      //       filter: `id=eq.${userProfileState.id}`,
      //     },
      //     async (payload: any) => {
      //       console.log("リアルタイム profiles UPDATEイベント発火", payload);
      //       // 新たにユーザーのsubscribed_accountsのデータが追加されたタイミングで
      //       // profiles, subscriptions, companies, subscribed_accountsの4つのテーブルを外部結合したデータをrpc()メソッドを使って、ストアドプロシージャのget_user_data関数を実行してユーザー情報を取得
      //       try {
      //         const { data: userProfileCompanySubscriptionData, error } = await supabase
      //           .rpc("get_user_data", { _user_id: userProfileState.id })
      //           .single();

      //         if (error) throw error;

      //         // ZustandのStateを更新
      //         setUserProfileState(userProfileCompanySubscriptionData as UserProfileCompanySubscription);

      //         // 初回サブスクリプション契約が完了したら、subscribed_accountsテーブルの監視を停止する
      //         stopSubscription();
      //       } catch (error: any) {
      //         alert(
      //           `リアルタイム subscribed_accountsテーブル INSERTイベント リアルタイム get_user_data関数実行エラー: ${error.message}`
      //         );
      //         console.error("リアルタイム get_user_data関数実行エラー", error.message);
      //       }
      //     }
      //   )
      //   .subscribe();
      // subscriber_idがnullの場合はsubscribed_accountsテーブルの監視を開始

      console.log(
        "🌟リアルタイム subscribed_accounts INSERTイベント監視を開始 useSubscribeSubscription",
        userProfile,
        userProfileState
      );

      const userId = userProfile.id ? userProfile.id : userProfileState?.id;

      channel = supabase
        .channel("table-db-changes:subscribed_accounts")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "subscribed_accounts",
            // filter: `user_id=eq.${userProfileState.id}`,
            filter: `user_id=eq.${userId}`,
          },
          async (payload: any) => {
            console.log("🌟🔥リアルタイム subscribed_accounts INSERTイベント発火🔥", payload);
            // 新たにユーザーのsubscribed_accountsのデータが追加されたタイミングで
            // profiles, subscriptions, companies, subscribed_accountsの4つのテーブルを外部結合したデータをrpc()メソッドを使って、ストアドプロシージャのget_user_data関数を実行してユーザー情報を取得
            try {
              const { data: userProfileCompanySubscriptionData, error } = await supabase
                // .rpc("get_user_data", { _user_id: userProfileState.id })
                .rpc("get_user_data", { _user_id: userProfile.id })
                .single();

              // if (error) throw error;
              if (error) throw new Error(error.message);

              // ZustandのStateを更新
              setUserProfileState(userProfileCompanySubscriptionData as UserProfileCompanySubscription);

              // 初回サブスクリプション契約が完了したら、subscribed_accountsテーブルの監視を停止する
              stopSubscription();
            } catch (error: any) {
              alert(
                `リアルタイム subscribed_accountsテーブル INSERTイベント リアルタイム get_user_data関数実行エラー: ${error.message}`
              );
              console.error("リアルタイム get_user_data関数実行エラー", error.message);
            }
          }
        )
        .subscribe();

      subscriptionRef.current = channel;
    }

    return () => {
      // supabase.removeChannel(channel);
      console.log(
        `リアルタイム  クリーンアップ useSubscribeSubscriptionの subscriptionRef.current`,
        subscriptionRef.current
      );
      stopSubscription(); // useEffectがアンマウントされたときに購読を解除
    };
    // }, [supabase, userProfileState, setUserProfileState]);
  }, [supabase, userProfile, setUserProfileState, userProfileState]);
};
