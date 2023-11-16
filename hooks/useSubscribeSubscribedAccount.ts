// 【Subscriptionsテーブル監視用リアルタイムカスタムフック】
import useDashboardStore from "@/store/useDashboardStore";
import { UserProfileCompanySubscription } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import React, { useEffect, useRef } from "react";
import { toast } from "react-toastify";

// export const useSubscribeSubscribedAccount = () => {
export const useSubscribeSubscribedAccount = (userProfile: UserProfileCompanySubscription) => {
  const queryClient = useQueryClient();
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const setUserProfileState = useDashboardStore((state) => state.setUserProfileState);
  // お知らせ所有者変更
  const setNotificationDataState = useDashboardStore((state) => state.setNotificationDataState);
  const supabase = useSupabaseClient();
  const router = useRouter();

  useEffect(() => {
    if (!userProfile && !userProfileState)
      return console.log("リアルタイムsubscribed_accounts ユーザー情報無し userProfile", userProfile, userProfileState);

    // const userId = userProfileState?.id ? userProfileState.id : userProfile.id;
    const accountId = userProfileState?.subscribed_account_id
      ? userProfileState.subscribed_account_id
      : userProfile.subscribed_account_id;
    console.log(
      "🌟リアルタイムsubscribed_accountsのUPDATEイベントを監視 自身に紐づく契約アカウントをサブスクライブ useEffect実行",
      userProfile,
      userProfileState,
      // "userId",
      // userId,
      "accountId",
      accountId
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
          // filter: `user_id=eq.${userProfileState.id}`,
          // filter: `user_id=eq.${userId}`,
          filter: `id=eq.${accountId}`,
        },
        async (payload: any) => {
          // 自分のアカウントが更新された場合のみユーザー情報を更新する
          //   if (payload.old.id !== userProfileState.subscribed_account_id)
          //     return console.log("他メンバーのアカウントUPDATEイベント発火のためそのままリターン");
          // console.log("リアルタイムsubscribed_accounts UPDATE検知 🔥", payload, userProfileState.id);
          console.log("リアルタイムsubscribed_accounts UPDATE検知 🔥", payload, userProfile, userProfileState);

          // ================ 🌟チームから削除された場合のルート ================
          if (payload.new.user_id === null) {
            console.log(
              "リアルタイムsubscribed_accounts user_idがnullにUPDATEされたためチームから削除を検知🔥",
              payload.new
            );
            // リロード前にサブスク選択画面を表示する
            const newUserData = {
              ...userProfileState,
              ...{
                first_time_login: true,
                status: null,
                subscription_plan: "free_plan",
                subscribed_account_id: null,
                company_id: null,
                subscription_id: null,
                account_company_role: null,
                account_state: null,
              },
            };
            setUserProfileState(newUserData as UserProfileCompanySubscription);

            toast.info(`チーム管理者からチームを外されました🙇 再度リスタートします。`, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
            setTimeout(() => {
              router.reload();
            }, 800);
            return;
            //  const { data: userProfileCompanySubscriptionData, error } = await supabase
            //    // .rpc("get_user_data", { _user_id: userProfileState.id })
            //    .rpc("get_user_data", { _user_id: userProfileState?.id ? userProfileState.id : userProfile.id })
            //    .single();

            //  if (error) throw new Error(error.message);

            //  // ZustandのStateを更新
            //  setUserProfileState(userProfileCompanySubscriptionData as UserProfileCompanySubscription);
          }
          // ================ ✅チームから削除された場合のルート ================

          //   自身のuser_idに紐づくアカウントが更新されたタイミングで発火
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

          try {
            // ================ 🌟newとoldのみで更新するルート ================
            // get_user_data関数でフェッチせずにpayloadのnewとoldの比較のみで変更内容をZustandに反映させる方法
            // interface ChangedData {
            //   [key: string]: string | null | undefined;
            //   id?: string;
            //   created_at?: string;
            //   user_id?: string | null;
            //   company_id?: string | null;
            //   subscription_id?: string | null;
            //   company_role?: string | null;
            //   account_state?: string | null;
            //   invited_email?: string | null;
            // }
            // const changeColumnData: ChangedData = {};

            // for (const key in payload.new) {
            //   if (payload.new[key] !== payload.old[key]) {
            //     // payload.newから変更されたデータを取得し、それをchangeColumnDataオブジェクトの対応するキーに割り当てています。これにより、changeColumnDataオブジェクトはpayload.newの変更されたデータを反映するようになります。
            //     // changeColumnDataは空のオブジェクト{}のため、
            //     // changeColumnData['name'] = new['name']; により、changeColumnDataは {name: 'a'} となり、
            //     // changeColumnData['role'] = new['role']; により、changeColumnDataは {name: 'a', role: 'admin'} と更新されます。
            //     // つまり新しいキーをchangeColumnData[key]で生成し、そのキーにpayload.new[key]の値をセットしているということ
            //     changeColumnData[key] = payload.new[key];
            //   }
            // }

            // if (Object.keys(changeColumnData).length > 0) {
            //   const newData = { ...userProfileState, ...changeColumnData };
            //   console.log("更新する内容", changeColumnData, "新たなユーザーデータ", newData);
            //   setUserProfileState(newData as UserProfileCompanySubscription);
            // }
            // ================ ✅newとoldのみで更新するルート ================
            // ================ 🌟get_user_data関数で更新するルート ================
            const { data: userProfileCompanySubscriptionData, error } = await supabase
              // .rpc("get_user_data", { _user_id: userProfileState.id })
              .rpc("get_user_data", { _user_id: userProfileState?.id ? userProfileState.id : userProfile.id })
              .single();

            if (error) throw new Error(error.message);

            // ZustandのStateを更新
            setUserProfileState(userProfileCompanySubscriptionData as UserProfileCompanySubscription);
            // ================ ✅get_user_data関数で更新するルート ================

            // チームの役割が変更された場合は、React-Queryのキャッシュも同時に更新する
            if (payload.old.company_role !== payload.new.company_role) {
              console.log("リアルタイムsubscribed_accounts UPDATE検知 役割変更に伴いキャッシュを更新");
              // キャッシュを最新状態に反映
              await queryClient.invalidateQueries({ queryKey: ["change_team_owner_notifications"] });
              // await queryClient.invalidateQueries({ queryKey: ["my_notifications"] });
              await queryClient.invalidateQueries({ queryKey: ["member_accounts"] });
              if (payload.old.company_role === "company_owner" && payload.old.company_role === "company_admin") {
                console.log("リアルタイムsubscribed_accounts UPDATE検知 チーム所有権お知らせStateをnullに更新");
                setNotificationDataState(null);
              }
            }
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
    // }, [userProfileState, supabase, setUserProfileState]);
  }, [userProfile, userProfileState, supabase, setUserProfileState]);
};
