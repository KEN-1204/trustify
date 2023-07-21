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
    const {} = supabase.auth.onAuthStateChange(async (authChangeEvent, currentSession) => {
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
  }, []);

  useEffect(() => {
    const progress = new ProgressBar({
      size: 4,
      // color: "#2B7FFF",
      color: "#0066ff",
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
