import { DashboardHeader } from "@/components/DashboardHeader/DashboardHeader";
import { DashboardHomeComponent } from "@/components/DashboardHomeComponent/DashboardHomeComponent";
import { DashboardLayout } from "@/components/DashboardLayout";
import useStore from "@/store";
import { Profile } from "@/types";
import { Session, User, createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
import React from "react";
import { useEffectOnce } from "react-use";

const DashboardHome = ({
  initialSession,
  user,
  userProfile,
}: {
  initialSession: Session;
  user: User;
  userProfile: Profile;
}) => {
  console.log("🔥Homeページ レンダリング initialSession, user, userProfile", initialSession, user, userProfile);
  const language = useStore((state) => state.language);
  const setTheme = useStore((state) => state.setTheme);

  // 言語別タイトル
  let langTitle;
  switch (language) {
    case "Ja":
      langTitle = "ホーム - TRUSTiFY";
      break;
    case "En":
      langTitle = "Home - TRUSTiFY";
      break;
    default:
      langTitle = "Home - TRUSTiFY";
      break;
  }

  // ログイン時にテーマをライトに設定する
  useEffectOnce(() => {
    setTheme("light");
  });

  return (
    <DashboardLayout title={langTitle}>
      {/* <Header
        logoSrc="/assets/images/Trustify_logo_white1.png"
        blurDataURL="/assets/images/Trustify_logo_white1_blur.png"
        logoSrcDark="/assets/images/Trustify_logo_black.png"
        blurDataURLDark="/assets/images/Trustify_logo_black_blur.png"
      /> */}
      <DashboardHeader />
      <DashboardHomeComponent />
    </DashboardLayout>
  );
};

export default DashboardHome;
// ====================== DashboardHomeコンポーネントここまで ======================

// ========================== サーバーサイドレンダリング ==========================

// Dashboardコンポーネントがマウントする前にサーバーにアクセスして、
// ユーザーのセッションの取得、認証、DBへデータを取得、
// ユーザー情報が見つからない場合にはマウントする前にログインページにリダイレクト
export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  // 認証済みSupabaseクライアントの作成 Create authenticated Supabase Client
  const supabase = createServerSupabaseClient(ctx);
  //  セッションがあるかどうかを確認する Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // セッションが存在しないなら/にリダイレクト
  if (!session) {
    console.log("/homeサーバーサイド セッションが存在しないなら/にリダイレクト");
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
      props: {},
    };
  }

  // サーバーのsupabaseクライアントを使用して、行レベルセキュリティの認証済みクエリーをサーバーサイドで実行することができます
  const { data: userProfile, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();

  if (userProfile) console.log("🌟userProfile", userProfile);
  if (error) console.log("🌟error", error);

  // ユーザーが存在するならそのままdashboardコンポーネントをマウント
  console.log("/homeサーバーサイド セッションが存在するためそのままリターン");
  return {
    props: {
      initialSession: session,
      user: session.user,
      // userProfile: userProfile ? userProfile[0] : {},
      // userProfile: userProfile ? userProfile[0] : null,
      userProfile: userProfile ? userProfile : null,
    },
  };
};
