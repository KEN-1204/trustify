import { Layout } from "@/components/Layout";
import { Root } from "@/components/Root/Root";
import { Header } from "@/components/Header/Header";
import useStore from "@/store";
import { LangMenu } from "@/components/Parts/LangMenu/LangMenu";
import { LangMenuOver } from "@/components/Parts/LangMenuOver/LangMenuOver";
import { Session, User, createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
import { useEffectOnce } from "react-use";
import useThemeStore from "@/store/useThemeStore";

// { initialSession, user }: { initialSession: Session; user: User | null }

export default function Home() {
  const language = useStore((state) => state.language);
  const setTheme = useThemeStore((state) => state.setTheme);
  // const setTheme = useStore((state) => state.setTheme);

  // 言語別タイトル
  let langTitle;
  switch (language) {
    case "Ja":
      langTitle = "TRUSTiFY | 売上を上げ続けた実績に裏付けされたデータベース";
      break;
    case "En":
      langTitle = "TRUSTiFY | Get the best";
      break;
    default:
      langTitle = "TRUSTiFY";
      break;
  }

  // 言語ドロップダウンメニュー
  const clickedItemPos = useStore((state) => state.clickedItemPos);
  const clickedItemPosOver = useStore((state) => state.clickedItemPosOver);

  // ログイン時にテーマをライトに設定する
  useEffectOnce(() => {
    setTheme("dark");
    // setTheme("light");
  });

  return (
    <Layout title={langTitle}>
      <Header
        logoSrc="/assets/images/Trustify_logo_white1.png"
        blurDataURL="/assets/images/Trustify_logo_white1_blur.png"
        logoSrcDark="/assets/images/Trustify_logo_black.png"
        blurDataURLDark="/assets/images/Trustify_logo_black_blur.png"
      />
      <Root />
      {/* {clickedItemPos && <LangMenu />} */}
      {/* {clickedItemPosOver && <LangMenuOver />} */}
    </Layout>
  );
}

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

  // セッションが存在するなら/homeにリダイレクト
  if (session) {
    console.log("/ルートサーバーサイド セッションが存在するなら/homeにリダイレクト");
    return {
      redirect: {
        destination: "/home",
        permanent: false,
      },
      props: {},
    };
  }

  // サーバーのsupabaseクライアントを使用して、行レベルセキュリティの認証済みクエリーをサーバーサイドで実行することができます
  // const { data: userProfile, error } = await supabase.from("profile").select("*").eq("id", session.user.id);

  // ユーザーが存在するならそのままdashboardコンポーネントをマウント
  console.log("/ルートサーバーサイド セッションが存在しないため、そのままリターン");
  return {
    props: {},
  };
};
