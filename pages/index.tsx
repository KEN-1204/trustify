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
import { AboutComponent } from "@/components/About/About";
import { AboutImageFlowComponent } from "@/components/About/AboutImageFlow";

// { initialSession, user }: { initialSession: Session; user: User | null }

// initialLangはサーバーサイドでリクエストヘッダーからAccept-Languageから優先言語の言語コードを取得してクライアントで受け取りja以外ならZustandの表示言語を更新する
export default function Home({ initialLang }: { initialLang: string }) {
  const language = useStore((state) => state.language);
  const setTheme = useThemeStore((state) => state.setTheme);
  const setLanguage = useStore((state) => state.setLanguage);
  const activePage = useStore((state) => state.activePage);
  // const setTheme = useStore((state) => state.setTheme);

  // 言語別タイトル
  let langTitle;
  switch (language) {
    case "ja":
      langTitle = "TRUSTiFY | 売上を上げ続けた実績に裏付けされたデータベース";
      if (activePage === "About") langTitle = "会社概要 | TRUSTiFY";
      break;
    case "en":
      langTitle = "TRUSTiFY | Get the best";
      if (activePage === "About") langTitle = "About | TRUSTiFY";
      break;
    default:
      langTitle = "TRUSTiFY";
      break;
  }

  // 言語ドロップダウンメニュー
  const clickedItemPos = useStore((state) => state.clickedItemPos);
  const clickedItemPosOver = useStore((state) => state.clickedItemPosOver);

  // サーバーサイドで取得した言語コードからja以外なら英語に更新する
  useEffectOnce(() => {
    if (initialLang === "ja")
      return console.log("サーバーサイドで取得した言語コード jaのため更新せずにリターン", initialLang);
    console.log("サーバーサイドで取得した言語コードで更新", initialLang);
    setLanguage(initialLang);
  });

  // ログイン時にテーマをライトに設定する
  useEffectOnce(() => {
    setTheme("dark");
    // setTheme("light");
  });

  return (
    <Layout title={langTitle}>
      {activePage !== "About" && (
        <Header
          logoSrc="/assets/images/Trustify_logo_white1.png"
          blurDataURL="/assets/images/Trustify_logo_white1_blur.png"
          logoSrcDark="/assets/images/Trustify_logo_black.png"
          blurDataURLDark="/assets/images/Trustify_logo_black_blur.png"
        />
      )}
      {/* {activePage === "Root" && <Root />} */}
      {activePage === "Root" && (
        <Root
          logoSrc="/assets/images/Trustify_logo_white1.png"
          blurDataURL="/assets/images/Trustify_logo_white1_blur.png"
          logoSrcDark="/assets/images/Trustify_logo_black.png"
          blurDataURLDark="/assets/images/Trustify_logo_black_blur.png"
        />
      )}
      {/* {activePage === "About" && <AboutComponent />} */}
      {activePage === "About" && <AboutImageFlowComponent />}
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
  // const {
  //   data: { session },
  // } = await supabase.auth.getSession();

  // // セッションが存在するなら/homeにリダイレクト
  // if (session) {
  //   console.log("/ルートサーバーサイド セッションが存在するなら/homeにリダイレクト");
  //   return {
  //     redirect: {
  //       destination: "/home",
  //       permanent: false,
  //     },
  //     props: {},
  //   };
  // }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // セッションが存在するなら/homeにリダイレクト
  if (user) {
    console.log("/ルートサーバーサイド セッションが存在するため/homeにリダイレクト");
    return {
      redirect: {
        destination: "/home",
        permanent: false,
      },
      props: {},
    };
  }

  console.log("/ルートサーバーサイド セッションが存在しないため、そのままリターン");
  // ユーザーのブラウザの優先言語を取得
  const defaultLang = "ja";
  let initialLang = defaultLang;
  const acceptLang = ctx.req.headers["accept-language"];
  if (acceptLang) {
    const langCode = acceptLang.split(",")[0].split("-")[0];
    console.log("取得した言語コード", langCode);
    switch (langCode) {
      case "ja":
        initialLang = "ja";
        break;
      case "en":
        initialLang = "en";
        break;

      default:
        initialLang = "en";
        break;
    }
  }

  // サーバーのsupabaseクライアントを使用して、行レベルセキュリティの認証済みクエリーをサーバーサイドで実行することができます
  // const { data: userProfile, error } = await supabase.from("profile").select("*").eq("id", session.user.id);

  // ユーザーが存在するならそのままdashboardコンポーネントをマウント
  return {
    props: { initialLang },
  };
};
