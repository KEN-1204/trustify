import "@/styles/globals.css";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { Session, SessionContextProvider, useSession } from "@supabase/auth-helpers-react";
import type { AppProps } from "next/app";
import { useEffect, useRef, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RootLayout } from "@/components/RootLayout";
// プログレスバー
import ProgressBar from "@badrap/bar-of-progress";
import Router, { useRouter } from "next/router";
import useStore from "@/store";
import { useSubscribeSubscription } from "@/hooks/useSubscribeSubscription";
import useDashboardStore from "@/store/useDashboardStore";
import { RealtimeChannel } from "@supabase/supabase-js";
import { Subscription, UserProfileCompanySubscription } from "@/types";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      suspense: true,
    },
  },
});

// プログレスバー
// const progress = new ProgressBar({
//   size: 4,
//   color: "#0066ff",
//   className: "z-50",
//   delay: 100,
// });
// Router.events.on("routeChangeStart", progress.start);
// Router.events.on("routeChangeComplete", progress.finish);
// Router.events.on("routeChangeError", progress.finish);

export default function App({
  Component,
  pageProps,
}: AppProps<{
  initialSession: Session;
}>) {
  const sessionState = useStore((state) => state.sessionState);
  const setSessionState = useStore((state) => state.setSessionState);
  const currentPathRef = useRef("/");
  const router = useRouter();

  // Create a new supabase browser client on every first render.
  // 初回レンダリングごとに、新しいsupabaseブラウザークライアントを作成します。
  const [supabase] = useState(() => createBrowserSupabaseClient());

  // ユーザーのセッション情報を取得と監視
  useEffect(() => {
    const getUserProfile = async () => {
      const { data } = await supabase.auth.getSession();
      // if (data.session) {
      //   const { data: profile, error } = await supabaseClient
      //     .from("profiles")
      //     .select("*")
      //     .eq("id", data.session.user.id)
      //     .single();

      //   setSessionState(data.session);
      //   console.log("supabaseClientでprofilesテーブルからdataを取得 data, error", data, error);
      // }
      setSessionState(data.session);
      console.log("getSession()の実行結果で取得したsession", data);
    };
    getUserProfile();

    // ページ遷移が完了した時のURLを取得 =================================
    // const handleRouteChange = (url: string) => {
    //   console.log("App is changing to: ", url);
    //   currentPathRef.current = url;
    // };
    // router.events.on("routeChangeComplete", handleRouteChange);
    // ==============================================================

    // ユーザーのプロフィール情報のリアルタイム変更を監視
    const { data } = supabase.auth.onAuthStateChange(async (authChangeEvent: any, currentSession: any) => {
      console.log("🌟_app onAuthStateChange実行🔥 authChangeEventとcurrentSession", authChangeEvent, currentSession);
      // 認証に成功し、セッションが存在する場合のルート
      if (currentSession) {
        // ZustandのセッションStateに現在のセッションを格納
        console.log("onAuthStateChange 取得したセッションをZustandに格納");
        setSessionState(currentSession);

        /**認証成功後にブラウザバックでGoogleの認証ページに戻ることが無いように
         * 一度現在の'/'から同じ'/'ルートパスにreplaceで置き換えて
         * 認証成功しセッションが付与されたら'/home'パスへ自動的に遷移 */
        // try {
        //   console.log('🌟router.replace 同じルートに書き換え')
        //   await router.replace(router.pathname)
        // } catch(error) {
        //   console.log('❌_app onAuthStateChange router.replace失敗')
        // }
        if (window.history.state.url === "/") {
          console.log(
            "onAuthStateChange セッション有りで/ルートにいるため/homeにプッシュ 現在のセッションとパス",
            currentSession,
            router.pathname,
            // currentPathRef.current,
            window.history.state.url
          );
          await router.push("/home");
        }
        console.log(
          "onAuthStateChange セッション有り /ルート以外なのでそのまま 現在のセッションとパス",
          currentSession,
          router.pathname,
          // currentPathRef.current,
          window.history.state.url
        );
      }
      // ログアウトされセッションが削除されたルート
      else {
        // ZustandのセッションStateをnullでリセット
        console.log("onAuthStateChange ログアウトしたためセッションをnullに");
        setSessionState(null);

        // ログアウト後セッションが削除されたら、自動的に'/'ルートパスに遷移
        if (window.history.state.url !== "/") {
          console.log(
            "onAuthStateChange セッション無しで/ルートでは無いため/ルートへプッシュ 現在のセッションとパス",
            currentSession,
            router.pathname,
            // currentPathRef.current,
            window.history.state.url
          );
          await router.push("/");
        }
        console.log(
          "onAuthStateChange セッション有り /のためそのまま 現在のセッションとパス pathname, currentPathRef, window.history.state",
          currentSession,
          router.pathname,
          // currentPathRef.current,
          window.history.state.url
        );
      }
    });

    // クリーンアップ関数 アンサブスクライブ
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const progress = new ProgressBar({
      size: 4,
      // color: "#2B7FFF",
      color: "#0066ff",
      // color: "#0d99ff",
      // color: "#0066ff",
      className: "z-50",
      delay: 100,
    });

    const handleRouteChangeStart = () => progress.start();
    const handleRouteChangeComplete = () => progress.finish();
    const handleRouteChangeError = () => progress.finish();

    router.events.on("routeChangeStart", handleRouteChangeStart);
    router.events.on("routeChangeComplete", handleRouteChangeComplete);
    router.events.on("routeChangeError", handleRouteChangeError);

    // Appコンポーネントがアンマウントされたときにイベントリスナーをクリーンアップします
    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
      router.events.off("routeChangeError", handleRouteChangeError);
    };
  }, []); // 空の依存配列を指定することで、このuseEffectは一度だけ実行されます

  // ==================================================================================================
  // サブスクリプションの契約状態を監視して変更があればリアルタイムにクライアントを自動更新
  // 未契約者はuserProfileState.subscription_idはnullのため、subscribed_accountsテーブルのINSERTイベントを監視
  // 契約者、契約後解約者はすでにuserProfileState.subscription_idを持っているため、subscriptionsテーブルのUPDATEイベントを監視
  // useSubscribeSubscription();
  // const userProfileState = useDashboardStore((state) => state.userProfileState);
  // const setUserProfileState = useDashboardStore((state) => state.setUserProfileState);
  // const subscriptionRef = useRef<RealtimeChannel | null>(null);

  // console.log("🌟リアルタイム サブスクリプション契約状況をサブスクライブ", userProfileState);

  // useEffect(() => {
  //   if (!userProfileState)
  //     return console.log(
  //       "リアルタイム useSubscribeSubscriptionリアルタイムフック ユーザー情報無し userProfileState",
  //       userProfileState
  //     );

  //   console.log("🌟リアルタイム サブスクリプション契約状況をサブスクライブ useEffect実行", userProfileState);

  //   let channel;

  //   // テーブルのイベント監視の購読を解除
  //   const stopSubscription = () => {
  //     if (subscriptionRef.current) {
  //       console.log(
  //         "🌟リアルタイム サブスクライブを解除 subscriptionRef.current",

  //         subscriptionRef.current,
  //         "userProfileState",
  //         userProfileState
  //       );
  //       supabase.removeChannel(subscriptionRef.current);
  //       subscriptionRef.current = null;
  //     }
  //   };

  //   if (userProfileState.subscription_id) {
  //     // subscriber_idが非nullの場合はsubscriptionsテーブルの監視を開始
  //     console.log("リアルタイム subscriptions UPDATE 監視を開始");
  //     channel = supabase
  //       .channel("table-db-changes:subscriptions")
  //       .on(
  //         "postgres_changes",
  //         {
  //           event: "UPDATE",
  //           scheme: "public",
  //           table: "subscriptions",
  //           filter: `id=eq.${userProfileState.subscription_id}`,
  //         },
  //         async (payload: any) => {
  //           console.log("リアルタイム subscriptions UPDATEイベント発火", payload);
  //           // subscriptionsテーブルの変更を検知したら現在のuserProfileStateのsubscriptionsテーブルの内容のみ更新する
  //           const newUserData = {
  //             ...userProfileState,
  //             ...{
  //               subscription_id: (payload.new as Subscription).id,
  //               subscription_created_at: (payload.new as Subscription).created_at,
  //               subscription_subscriber_id: (payload.new as Subscription).subscriber_id,
  //               subscription_stripe_customer_id: (payload.new as Subscription).stripe_customer_id,
  //               status: (payload.new as Subscription).status,
  //               subscription_interval: (payload.new as Subscription).subscription_interval,
  //               current_period_start: (payload.new as Subscription).current_period_start,
  //               current_period_end: (payload.new as Subscription).current_period_end,
  //               subscription_plan: (payload.new as Subscription).subscription_plan,
  //               subscription_stage: (payload.new as Subscription).subscription_stage,
  //               accounts_to_create: (payload.new as Subscription).accounts_to_create,
  //             },
  //           };
  //           // payloadに基づいてZustandのStateを更新
  //           setUserProfileState(newUserData as UserProfileCompanySubscription);
  //         }
  //       )
  //       .subscribe();

  //     subscriptionRef.current = channel;
  //   } else {
  //     // subscriber_idがnullの場合はsubscribed_accountsテーブルの監視を開始
  //     console.log("リアルタイム profiles UPDATE 監視を開始");

  //     channel = supabase
  //       .channel("table-db-changes:profiles")
  //       .on(
  //         "postgres_changes",
  //         {
  //           event: "UPDATE",
  //           scheme: "public",
  //           table: "subscribed_accounts",
  //           filter: `id=eq.${userProfileState.id}`,
  //         },
  //         async (payload: any) => {
  //           console.log("リアルタイム profiles UPDATEイベント発火", payload);
  //           // 新たにユーザーのsubscribed_accountsのデータが追加されたタイミングで
  //           // profiles, subscriptions, companies, subscribed_accountsの4つのテーブルを外部結合したデータをrpc()メソッドを使って、ストアドプロシージャのget_user_data関数を実行してユーザー情報を取得
  //           try {
  //             const { data: userProfileCompanySubscriptionData, error } = await supabase
  //               .rpc("get_user_data", { _user_id: userProfileState.id })
  //               .single();

  //             if (error) throw error;

  //             // ZustandのStateを更新
  //             setUserProfileState(userProfileCompanySubscriptionData as UserProfileCompanySubscription);

  //             // 初回サブスクリプション契約が完了したら、subscribed_accountsテーブルの監視を停止する
  //             stopSubscription();
  //           } catch (error: any) {
  //             alert(
  //               `リアルタイム subscribed_accountsテーブル INSERTイベント リアルタイム get_user_data関数実行エラー: ${error.message}`
  //             );
  //             console.error("リアルタイム get_user_data関数実行エラー", error.message);
  //           }
  //         }
  //       )
  //       .subscribe();
  //     // console.log("リアルタイム subscribed_accounts INSERT 監視を開始");
  //     // channel = supabase
  //     //   .channel("table-db-changes:subscribed_accounts")
  //     //   .on(
  //     //     "postgres_changes",
  //     //     {
  //     //       event: "INSERT",
  //     //       scheme: "public",
  //     //       table: "subscribed_accounts",
  //     //       filter: `user_id=eq.${userProfileState.id}`,
  //     //     },
  //     //     async (payload: any) => {
  //     //       console.log("リアルタイム subscribed_accounts INSERTイベント発火", payload);
  //     //       // 新たにユーザーのsubscribed_accountsのデータが追加されたタイミングで
  //     //       // profiles, subscriptions, companies, subscribed_accountsの4つのテーブルを外部結合したデータをrpc()メソッドを使って、ストアドプロシージャのget_user_data関数を実行してユーザー情報を取得
  //     //       try {
  //     //         const { data: userProfileCompanySubscriptionData, error } = await supabase
  //     //           .rpc("get_user_data", { _user_id: userProfileState.id })
  //     //           .single();

  //     //         if (error) throw error;

  //     //         // ZustandのStateを更新
  //     //         setUserProfileState(userProfileCompanySubscriptionData as UserProfileCompanySubscription);

  //     //         // 初回サブスクリプション契約が完了したら、subscribed_accountsテーブルの監視を停止する
  //     //         stopSubscription();
  //     //       } catch (error: any) {
  //     //         alert(
  //     //           `リアルタイム subscribed_accountsテーブル INSERTイベント リアルタイム get_user_data関数実行エラー: ${error.message}`
  //     //         );
  //     //         console.error("リアルタイム get_user_data関数実行エラー", error.message);
  //     //       }
  //     //     }
  //     //   )
  //     //   .subscribe();

  //     subscriptionRef.current = channel;
  //   }

  //   return () => {
  //     // supabase.removeChannel(channel);
  //     console.log("リアルタイム クリーンアップ subscriptionRef.current", subscriptionRef.current);
  //     stopSubscription(); // useEffectがアンマウントされたときに購読を解除
  //   };
  // }, [supabase, userProfileState]);
  // // ==================================================================================================

  return (
    <SessionContextProvider supabaseClient={supabase} initialSession={pageProps.initialSession}>
      <QueryClientProvider client={queryClient}>
        <RootLayout>
          <Component {...pageProps} />
        </RootLayout>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SessionContextProvider>
  );
}
