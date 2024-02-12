import { DashboardActivityComponent } from "@/components/DashboardActivityComponent/DashboardActivityComponent";
import { DashboardCalendarComponent } from "@/components/DashboardCalendarComponent/DashboardCalendarComponent";
import { DashboardCompanyComponent } from "@/components/DashboardCompanyComponent/DashboardCompanyComponent";
import { DashboardContactComponent } from "@/components/DashboardContactComponent/DashboardContactComponent";
import { DashboardHomeComponent } from "@/components/DashboardHomeComponent/DashboardHomeComponent";
import { FallbackDashboardHomeComponent } from "@/components/DashboardHomeComponent/FallbackDashboardHomeComponent";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardMeetingComponent } from "@/components/DashboardMeetingComponent/DashboardMeetingComponent";
import { DashboardPropertyComponent } from "@/components/DashboardPropertyComponent/DashboardPropertyComponent";
import { DashboardQuotationComponent } from "@/components/DashboardQuotationComponent/DashboardQuotationComponent";
import { DashboardSDBComponent } from "@/components/DashboardSDBComponent/DashboardSDBComponent";
import { ErrorFallback } from "@/components/ErrorFallback/ErrorFallback";
import { Fallback } from "@/components/Fallback/Fallback";
import useBeforeUnload from "@/hooks/useBeforeUnload";
import { useQueryDepartments } from "@/hooks/useQueryDepartments";
import { useQueryNotifications } from "@/hooks/useQueryNotifications";
import { useQueryOffices } from "@/hooks/useQueryOffices";
import { useQueryProducts } from "@/hooks/useQueryProducts";
import { useQueryUnits } from "@/hooks/useQueryUnits";
import { useSubscribeNotifications } from "@/hooks/useSubscribeNotifications";
import { useSubscribeSubscribedAccount } from "@/hooks/useSubscribeSubscribedAccount";
import { useSubscribeSubscription } from "@/hooks/useSubscribeSubscription";
import useStore from "@/store";
import useDashboardStore from "@/store/useDashboardStore";
import useThemeStore from "@/store/useThemeStore";
import { Profile, UserProfile, UserProfileCompanySubscription } from "@/types";
import { Session, User, createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { GetServerSidePropsContext } from "next";
import React, { Suspense, useEffect, useRef, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "react-toastify";
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
  const supabase = useSupabaseClient();
  const language = useStore((state) => state.language);
  const setTheme = useThemeStore((state) => state.setTheme);
  const activeMenuTab = useDashboardStore((state) => state.activeMenuTab);
  const setActiveMenuTab = useDashboardStore((state) => state.setActiveMenuTab);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const setUserProfileState = useDashboardStore((state) => state.setUserProfileState);
  // セッション email変更時の最新user.email確認用
  const sessionState = useStore((state) => state.sessionState);
  const setProductsState = useDashboardStore((state) => state.setProductsState);

  // // お知らせ notificationsテーブルから自分のidに一致するお知らせデータを全て取得
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    setIsReady(true);
  }, []);
  const {
    data: notificationData,
    error: notificationError,
    status,
    isLoading,
  } = useQueryNotifications(userProfile?.id, isReady); // 自分宛のお知らせ一覧を取得してキャッシュに格納
  useSubscribeNotifications(userProfile?.id); // 自分宛のnotificationsテーブルをリアルタイム監視を開始
  // 新規サブスク登録とサブスク内容の変更を監視
  useSubscribeSubscription(userProfile);
  // メンバーが自身のアカウントの紐付け、解除の変更やチームでの役割の変更を監視 うまくいかず
  useSubscribeSubscribedAccount(userProfile);

  // ブラウザバックでのページ遷移に対して確認画面を表示
  useBeforeUnload("サイトを離れてもよろしいですか？");

  // ================================ 🌟事業部リスト取得useQuery🌟 ================================
  // const { data: departmentDataArray, isLoading: isLoadingQueryDepartment } = useQueryDepartments(
  //   userProfileState?.company_id ? userProfileState?.company_id : userProfile?.company_id,
  //   isReady
  // );
  // ================================ ✅事業部リスト取得useQuery✅ ================================
  // ================================ 🌟係・チームリスト取得useQuery🌟 ================================
  // const { data: unitDataArray, isLoading: isLoadingQueryUnit } = useQueryUnits(
  //   userProfileState?.company_id ? userProfileState?.company_id : userProfile?.company_id,
  //   isReady
  // );
  // ================================ ✅係・チームリスト取得useQuery✅ ================================
  // ================================ 🌟事業所・営業所リスト取得useQuery🌟 ================================
  // const { data: officeDataArray, isLoading: isLoadingQueryOffice } = useQueryOffices(
  //   userProfileState?.company_id ? userProfileState?.company_id : userProfile?.company_id,
  //   isReady
  // );
  // const { createOfficeMutation, updateOfficeFieldMutation, deleteOfficeMutation } = useMutateOffice();
  // ================================ ✅事業所・営業所リスト取得useQuery✅ ================================
  // ================================ 🌟自事業部商品リスト取得useQuery🌟 ================================
  // const { data: ProductDataArray, isLoading: isLoadingQueryProduct } = useQueryProducts({
  //   company_id: userProfileState?.company_id ? userProfileState?.company_id : userProfile?.company_id,
  //   departmentId: userProfileState?.assigned_department_id
  //     ? userProfileState?.assigned_department_id
  //     : userProfile?.assigned_department_id,
  //   isReady: isReady,
  // });
  // const { createOfficeMutation, updateOfficeFieldMutation, deleteOfficeMutation } = useMutateOffice();
  // ================================ ✅自事業部商品リスト取得useQuery✅ ================================

  console.log(
    "🔥Homeページ レンダリング",
    "activeMenuTab",
    activeMenuTab,
    "SSRで取得したセッション",
    initialSession,
    "SSRで取得したセッションのユーザー",
    user,
    // "profilesテーブルから取得したユーザーデータuserProfile",
    // userProfile1,
    "SSRで取得したユーザーデータ",
    userProfile,
    "notificationData",
    notificationData,
    "notificationError",
    notificationError,
    "status",
    status,
    "isLoading",
    isLoading
  );

  // SSRで取得したユーザーデータをZustandに格納 ユーザーデータが無ければ強制的にログアウトさせる
  useEffect(() => {
    // サインアウト関数(非同期処理)
    const handleSignOut = async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("ユーザーデータなしのためサインアウトするもエラー", error);
      }
    };

    // profilesテーブルとstripe customerのメール変更関数(非同期処理)
    const handleChangeEmail = async (_session: any) => {
      try {
        if (!_session?.access_token) return console.log("❌handleChangeEmail アクセストークンなし");
        const updateEmailPayload = {
          newEmail: _session?.user?.email,
          profileId: userProfile.id,
          stripeCustomerId: userProfile.stripe_customer_id,
        };

        console.log("🌟handleChangeEmailでメールアドレス変更ルートにリクエスト updateEmailPayload", updateEmailPayload);
        const {
          data: { new_email: newEmail, error: axiosError },
        } = await axios.post(`/api/update-stripe-email`, updateEmailPayload, {
          headers: {
            Authorization: `Bearer ${_session.access_token}`,
          },
        });

        if (axiosError) {
          console.error(`🌟メール変更エラー axiosError`, axiosError);
          throw axiosError;
        }

        console.log(`🌟profilesテーブル, stripeともにメール変更完了 newEmail`, newEmail);

        const newProfileObj = { ...userProfile, email: newEmail };

        if (!userProfileState) setUserProfileState(newProfileObj as UserProfileCompanySubscription);

        toast.success(`メールアドレスが新たに更新されました🌟`);
        console.log("✅メールアドレス変更完了", sessionState.user.email, newEmail);
      } catch (error: any) {
        console.error("メールアドレスの変更に失敗", error);
        toast.error(`メールアドレスの更新に失敗しました🙇‍♀️`);
        // Zustandにまだユーザーデータが存在しない場合にはセット
        if (!userProfileState) setUserProfileState(userProfile as UserProfileCompanySubscription);
      }
    };

    // SSEでユーザーデータが取得できなかった場合にはリターン(必ずサインアップ時にprofilesにidとemailが作成されるため)
    if (!userProfile) {
      console.log("SSRで取得したユーザーデータが存在しないため強制的にサインアウトさせる");
      handleSignOut();
      return;
    }

    // SSRでユーザーデータを取得したルート
    else {
      console.log(
        "🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟 ",
        "🌟initialSession?.user?.email",
        initialSession?.user?.email,
        "🌟userProfile.email",
        userProfile.email,
        "🌟sessionState?.user?.email",
        sessionState?.user?.email,
        "🌟userProfileState?.email",
        userProfileState?.email
      );
      const isEmailUpdateNeeded =
        !!userProfileState?.email && sessionState?.user?.email
          ? sessionState?.user?.email !== userProfileState.email
          : initialSession?.user?.email !== userProfile.email;

      // セッションのemailとprofilesテーブルのemailが一致しているかチェック(メール変更がされていないかチェック)
      // if (sessionState.user.email !== userProfile.email) {
      // メールが変更されてるルート => profilesとstripeのemailを更新
      if (isEmailUpdateNeeded) {
        console.log(
          "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥 メールアドレスの変更を検知しました isEmailUpdateNeeded",
          isEmailUpdateNeeded
        );

        handleChangeEmail(sessionState ? sessionState : initialSession);
      }
      // メールが変更されていないルート
      else {
        console.log("✅メールアドレス変更無しそのままSSRのユーザーデータをZustandにセット");
        // Zustandにまだユーザーデータが存在しない場合にはセット
        if (!userProfileState) setUserProfileState(userProfile as UserProfileCompanySubscription);
      }
    }
  }, [userProfile, setUserProfileState]);

  // const setTheme = useStore((state) => state.setTheme);

  // 言語別タイトル
  let langTitle;
  if (activeMenuTab === "HOME") {
    switch (language) {
      case "ja":
        langTitle = "ホーム - TRUSTiFY";
        break;
      case "en":
        langTitle = "Home - TRUSTiFY";
        break;
      default:
        langTitle = "Home - TRUSTiFY";
        break;
    }
  }
  if (activeMenuTab === "Company") {
    switch (language) {
      case "ja":
        langTitle = "会社 - TRUSTiFY";
        break;
      case "en":
        langTitle = "Company - TRUSTiFY";
        break;
      default:
        langTitle = "Company - TRUSTiFY";
        break;
    }
  }
  if (activeMenuTab === "Contacts") {
    switch (language) {
      case "ja":
        langTitle = "担当者 - TRUSTiFY";
        break;
      case "en":
        langTitle = "Contacts - TRUSTiFY";
        break;
      default:
        langTitle = "Contacts - TRUSTiFY";
        break;
    }
  }
  if (activeMenuTab === "Activity") {
    switch (language) {
      case "ja":
        langTitle = "活動 - TRUSTiFY";
        break;
      case "en":
        langTitle = "Activity - TRUSTiFY";
        break;
      default:
        langTitle = "Activity - TRUSTiFY";
        break;
    }
  }
  if (activeMenuTab === "Meeting") {
    switch (language) {
      case "ja":
        langTitle = "面談 - TRUSTiFY";
        break;
      case "en":
        langTitle = "Meeting - TRUSTiFY";
        break;
      default:
        langTitle = "Meeting - TRUSTiFY";
        break;
    }
  }
  if (activeMenuTab === "Property") {
    switch (language) {
      case "ja":
        langTitle = "案件 - TRUSTiFY";
        break;
      case "en":
        langTitle = "Case - TRUSTiFY";
        break;
      default:
        langTitle = "Case - TRUSTiFY";
        break;
    }
  }
  if (activeMenuTab === "Calendar") {
    switch (language) {
      case "ja":
        langTitle = "カレンダー - TRUSTiFY";
        break;
      case "en":
        langTitle = "Calendar - TRUSTiFY";
        break;
      default:
        langTitle = "Calendar - TRUSTiFY";
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
      {/* {activeMenuTab === "HOME" && status !== "loading" && <DashboardHomeComponent />}
      {activeMenuTab === "HOME" && status === "loading" && <FallbackDashboardHomeComponent />} */}
      {/* {activeMenuTab === "HOME" && (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<FallbackDashboardHomeComponent />}>
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
      {activeMenuTab === "Quotation" && <DashboardQuotationComponent />}
      {activeMenuTab === "SDB" && <DashboardSDBComponent />}
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
  // const { data: userProfile, error: error } = await supabase
  //   .rpc("get_user_data", { _user_id: session.user.id })
  //   .single();
  const { data: userProfile, error: error } = await supabase.rpc("get_user_data", { _user_id: session.user.id });

  if (userProfile) console.log("🌟/homeサーバーサイド userProfileあり");
  if (error) console.log("🌟/homeサーバーサイド get_user_data関数でerror発生 error: ", error);

  // エラーが発生したら/にリダイレクト
  // if (error) {
  //   console.log("/homeサーバーサイド get_user_data関数でエラー発生 /にリダイレクト");
  //   return {
  //     redirect: {
  //       destination: "/",
  //       permanent: false,
  //     },
  //     props: {},
  //   };
  // }

  // notificationsテーブルのデータを取得
  // const {data: notificationData, error: notificationError} = await supabase.from('notifications').select().eq('to_user_id', )

  // ユーザーが存在するならそのままdashboardコンポーネントをマウント
  console.log("/homeサーバーサイド セッションが存在するためそのままリターン");
  return {
    props: {
      initialSession: session,
      user: session.user,
      // userProfile: userProfile ? userProfile[0] : {},
      // userProfile: userProfile ? userProfile[0] : null,
      userProfile: userProfile ? userProfile[0] : null,
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
