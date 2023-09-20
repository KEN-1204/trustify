import { DashboardActivityComponent } from "@/components/DashboardActivityComponent/DashboardActivityComponent";
import { DashboardCalendarComponent } from "@/components/DashboardCalendarComponent/DashboardCalendarComponent";
import { DashboardCompanyComponent } from "@/components/DashboardCompanyComponent/DashboardCompanyComponent";
import { DashboardContactComponent } from "@/components/DashboardContactComponent/DashboardContactComponent";
import { DashboardHomeComponent } from "@/components/DashboardHomeComponent/DashboardHomeComponent";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardMeetingComponent } from "@/components/DashboardMeetingComponent/DashboardMeetingComponent";
import { DashboardPropertyComponent } from "@/components/DashboardPropertyComponent/DashboardPropertyComponent";
import { ErrorFallback } from "@/components/ErrorFallback/ErrorFallback";
import { Fallback } from "@/components/Fallback/Fallback";
import { useQueryProducts } from "@/hooks/useQueryProducts";
import useStore from "@/store";
import useDashboardStore from "@/store/useDashboardStore";
import useThemeStore from "@/store/useThemeStore";
import { Profile, UserProfile, UserProfileCompanySubscription } from "@/types";
import { Session, User, createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
import React, { Suspense, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import Stripe from "stripe";

// type Plans = {
//   id: string;
//   name: string;
//   price: number;
//   interval: string;
//   currency: string;
// };

const DashboardHome = ({
  initialSession,
  user,
  userProfile,
}: // userProfile1,
// userProfile1,
{
  initialSession: Session;
  user: User;
  userProfile: UserProfileCompanySubscription;
  // userProfile: UserProfile;
  // userProfile1: UserProfile;
}) => {
  const language = useStore((state) => state.language);
  const setTheme = useThemeStore((state) => state.setTheme);
  const activeMenuTab = useDashboardStore((state) => state.activeMenuTab);
  const setActiveMenuTab = useDashboardStore((state) => state.setActiveMenuTab);
  const setUserProfileState = useDashboardStore((state) => state.setUserProfileState);
  const setProductsState = useDashboardStore((state) => state.setProductsState);
  console.log(
    "🔥Homeページ レンダリング",
    "activeMenuTab",
    activeMenuTab,
    "getSession()のsession.user",
    user,
    // "profilesテーブルから取得したユーザーデータuserProfile",
    // userProfile1,
    "profiles, companies, subscribed_accounts, subscriptionsテーブルを外部結合したデータ",
    userProfile
  );

  useEffect(() => {
    // setUserProfileState(userProfile as UserProfile);
    setUserProfileState(userProfile as UserProfileCompanySubscription);
  }, [userProfile, setUserProfileState]);

  // const setTheme = useStore((state) => state.setTheme);

  // 言語別タイトル
  let langTitle;
  if (activeMenuTab === "HOME") {
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
  }
  if (activeMenuTab === "Company") {
    switch (language) {
      case "Ja":
        langTitle = "会社 - TRUSTiFY";
        break;
      case "En":
        langTitle = "Company - TRUSTiFY";
        break;
      default:
        langTitle = "Company - TRUSTiFY";
        break;
    }
  }
  if (activeMenuTab === "Contacts") {
    switch (language) {
      case "Ja":
        langTitle = "担当者 - TRUSTiFY";
        break;
      case "En":
        langTitle = "Contacts - TRUSTiFY";
        break;
      default:
        langTitle = "Contacts - TRUSTiFY";
        break;
    }
  }
  if (activeMenuTab === "Activity") {
    switch (language) {
      case "Ja":
        langTitle = "活動 - TRUSTiFY";
        break;
      case "En":
        langTitle = "Activity - TRUSTiFY";
        break;
      default:
        langTitle = "Activity - TRUSTiFY";
        break;
    }
  }
  if (activeMenuTab === "Meeting") {
    switch (language) {
      case "Ja":
        langTitle = "面談 - TRUSTiFY";
        break;
      case "En":
        langTitle = "Meeting - TRUSTiFY";
        break;
      default:
        langTitle = "Meeting - TRUSTiFY";
        break;
    }
  }
  if (activeMenuTab === "Property") {
    switch (language) {
      case "Ja":
        langTitle = "案件 - TRUSTiFY";
        break;
      case "En":
        langTitle = "Case - TRUSTiFY";
        break;
      default:
        langTitle = "Case - TRUSTiFY";
        break;
    }
  }

  // /companyページにいて、アクティブメニュータブがCompanyでない場合にはCompanyに変更する
  useEffect(() => {
    setTheme("light");
    // if (window.history.state.url === "/home") {
    //   setActiveMenuTab("HOME");
    //   console.log("homeyページ アクティブタブをHOMEに変更");
    // }
  }, []);

  return (
    <DashboardLayout title={langTitle}>
      {activeMenuTab === "HOME" && <DashboardHomeComponent />}
      {/* {activeMenuTab === "HOME" && (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<Fallback className="min-h-[calc(100vh/3-var(--header-height)/3)]" />}>
            <DashboardHomeComponent />
          </Suspense>
        </ErrorBoundary>
      )} */}
      {activeMenuTab === "Company" && <DashboardCompanyComponent />}
      {activeMenuTab === "Contacts" && <DashboardContactComponent />}
      {activeMenuTab === "Activity" && <DashboardActivityComponent />}
      {activeMenuTab === "Meeting" && <DashboardMeetingComponent />}
      {activeMenuTab === "Property" && <DashboardPropertyComponent />}
      {activeMenuTab === "Calendar" && <DashboardCalendarComponent />}
      {/* {activeMenuTab === "Contacts" && <div className="flex-center w-screen h-screen bg-red-100">あい</div>} */}
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
  // const { data: userProfile1, error: error1 } = await supabase
  //   .from("profiles")
  //   .select("*")
  //   .eq("id", session.user.id)
  //   .single();
  // Postgres関数で作成したget_user_data関数でprofilesテーブル、companiesテーブル、subscribed_accountsテーブル、subscriptionsテーブルの4つを外部結合したSELECTクエリでデータを取得する
  const { data: userProfile, error: error } = await supabase
    .rpc("get_user_data", { _user_id: session.user.id })
    .single();

  if (userProfile) console.log("🌟/homeサーバーサイド userProfileあり");
  if (error) console.log("🌟/homeサーバーサイド errorあり", error);

  // ユーザーが存在するならそのままdashboardコンポーネントをマウント
  console.log("/homeサーバーサイド セッションが存在するためそのままリターン");
  return {
    props: {
      initialSession: session,
      user: session.user,
      // userProfile: userProfile ? userProfile[0] : {},
      // userProfile: userProfile ? userProfile[0] : null,
      userProfile: userProfile ? userProfile : null,
      // userProfile1: userProfile1 ? userProfile1 : null,
    },
  };
};

// ========================== 静的サイトジェネレーション ==========================
// export const getStaticProps = async () => {
//   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//     apiVersion: "2022-11-15",
//   });

//   const { data: prices } = await stripe.prices.list();

//   const plans = await Promise.all(
//     prices.map(async (price: any) => {
//       const product = await stripe.products.retrieve(price.product);
//       return {
//         id: price.id,
//         name: product.name,
//         price: price.unit_amount,
//         interval: price.recurring?.interval,
//         currency: price.currency,
//       };
//     })
//   );

//   const sortedPlans = plans.sort((a, b) => a.price - b.price);

//   console.log("🌟SSG plans", plans, "sortedPlans", sortedPlans);

//   return {
//     props: {
//       plans: sortedPlans,
//     },
//   };
// };
