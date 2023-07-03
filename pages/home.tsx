import { DashboardLayout } from "@/components/DashboardLayout";
import { Profile } from "@/types";
import { Session, User, createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
import React, { FC } from "react";

const DashboardHome = ({
  initialSession,
  user,
  userProfile,
}: {
  initialSession: Session;
  user: User;
  userProfile: Profile;
}) => {
  console.log("🔥Homeページ", initialSession, user, userProfile);
  return (
    <DashboardLayout>
      <div className="flex-center h-screen w-full text-white">Home</div>;
    </DashboardLayout>
  );
};

export default DashboardHome;

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
  const { data: userProfile, error } = await supabase.from("profile").select("*").eq("id", session.user.id);

  // ユーザーが存在するならそのままdashboardコンポーネントをマウント
  console.log("/homeサーバーサイド セッションが存在するためそのままリターン");
  return {
    props: {
      initialSession: session,
      user: session.user,
      // userProfile: userProfile ? userProfile[0] : {},
      userProfile: userProfile ? userProfile[0] : null,
    },
  };
};
