import "@/styles/globals.css";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { Session, SessionContextProvider, useSession } from "@supabase/auth-helpers-react";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RootLayout } from "@/components/RootLayout";
// プログレスバー
import ProgressBar from "@badrap/bar-of-progress";
import Router from "next/router";
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
const progress = new ProgressBar({
  size: 4,
  color: "#0066ff",
  className: "z-50",
  delay: 100,
});
Router.events.on("routeChangeStart", progress.start);
Router.events.on("routeChangeComplete", progress.finish);
Router.events.on("routeChangeError", progress.finish);

export default function App({
  Component,
  pageProps,
}: AppProps<{
  initialSession: Session;
}>) {
  const sessionState = useStore((state) => state.sessionState);
  const setSessionState = useStore((state) => state.setSessionState);
  const session = useSession();

  // Create a new supabase browser client on every first render.
  // 初回レンダリングごとに、新しいsupabaseブラウザークライアントを作成します。
  const [supabaseClient] = useState(() => createPagesBrowserClient());

  // ユーザーのセッション情報を取得と監視
  useEffect(() => {
    const getUserProfile = async () => {
      const { data } = await supabaseClient.auth.getSession();
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
    console.log("useSession()の実行結果で取得したsession", session);
  }, []);

  // ユーザーのプロフィール情報のリアルタイム変更を監視

  return (
    <SessionContextProvider supabaseClient={supabaseClient} initialSession={pageProps.initialSession}>
      <QueryClientProvider client={queryClient}>
        <RootLayout>
          <Component {...pageProps} />
        </RootLayout>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SessionContextProvider>
  );
}
