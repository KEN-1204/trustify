import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardHomeComponent } from "@/components/DashboardHomeComponent/DashboardHomeComponent";
import { DashboardCompanyComponent } from "@/components/DashboardCompanyComponent/DashboardCompanyComponent";
import useBeforeUnload from "@/hooks/useBeforeUnload";
import { useQueryNotifications } from "@/hooks/useQueryNotifications";
import { useSubscribeNotifications } from "@/hooks/useSubscribeNotifications";
import { useSubscribeSubscribedAccount } from "@/hooks/useSubscribeSubscribedAccount";
import { useSubscribeSubscription } from "@/hooks/useSubscribeSubscription";
import useStore from "@/store";
import useDashboardStore from "@/store/useDashboardStore";
import useThemeStore from "@/store/useThemeStore";
import {  UserProfileCompanySubscription } from "@/types";
import { mappingTitle } from "@/utils/mappings";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import axios from "axios";
import { GetServerSidePropsContext } from "next";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FallbackDashboard } from "@/components/Fallback/FallbackDashboard";

// ------------------------------- 動的インポート -------------------------------
import dynamic from "next/dynamic";

// 担当者
// import { DashboardContactComponent } from "@/components/DashboardContactComponent/DashboardContactComponent";
const DashboardContactComponent = dynamic(
  () =>
    import("@/components/DashboardContactComponent/DashboardContactComponent").then(
      (mod) => mod.DashboardContactComponent
    ),
  {
    loading: (loadingProps) => <FallbackDashboard />,
    ssr: false,
  }
);
// 活動
// import { DashboardActivityComponent } from "@/components/DashboardActivityComponent/DashboardActivityComponent";
const DashboardActivityComponent = dynamic(
  () =>
    import("@/components/DashboardActivityComponent/DashboardActivityComponent").then(
      (mod) => mod.DashboardActivityComponent
    ),
  {
    loading: (loadingProps) => <FallbackDashboard />,
    ssr: false,
  }
);
// 面談
// import { DashboardMeetingComponent } from "@/components/DashboardMeetingComponent/DashboardMeetingComponent";
const DashboardMeetingComponent = dynamic(
  () =>
    import("@/components/DashboardMeetingComponent/DashboardMeetingComponent").then(
      (mod) => mod.DashboardMeetingComponent
    ),
  {
    loading: (loadingProps) => <FallbackDashboard />,
    ssr: false,
  }
);
// 案件
// import { DashboardPropertyComponent } from "@/components/DashboardPropertyComponent/DashboardPropertyComponent";
const DashboardPropertyComponent = dynamic(
  () =>
    import("@/components/DashboardPropertyComponent/DashboardPropertyComponent").then(
      (mod) => mod.DashboardPropertyComponent
    ),
  {
    loading: (loadingProps) => <FallbackDashboard />,
    ssr: false,
  }
);
// 見積
// import { DashboardQuotationComponent } from "@/components/DashboardQuotationComponent/DashboardQuotationComponent";
const DashboardQuotationComponent = dynamic(
  () =>
    import("@/components/DashboardQuotationComponent/DashboardQuotationComponent").then(
      (mod) => mod.DashboardQuotationComponent
    ),
  {
    loading: (loadingProps) => <FallbackDashboard />,
    ssr: false,
  }
);
// カレンダー
// import { DashboardCalendarComponent } from "@/components/DashboardCalendarComponent/DashboardCalendarComponent";
const DashboardCalendarComponent = dynamic(
  () =>
    import("@/components/DashboardCalendarComponent/DashboardCalendarComponent").then(
      (mod) => mod.DashboardCalendarComponent
    ),
  {
    loading: (loadingProps) => <FallbackDashboard />,
    ssr: false,
  }
);
// セールスダッシュボード
import { DashboardSDBComponent } from "@/components/DashboardSDBComponent/DashboardSDBComponent";
// const DashboardSDBComponent = dynamic(
//   () => import("@/components/DashboardSDBComponent/DashboardSDBComponent").then((mod) => mod.DashboardSDBComponent),
//   {
//     loading: (loadingProps) => <FallbackDashboard hiddenLeftSpacer={true} />,
//     ssr: false,
//   }
// );
// 売上目標
// import { DashboardSalesTargetComponent } from "@/components/DashboardSalesTargetComponent/DashboardSalesTargetComponent";
const DashboardSalesTargetComponent = dynamic(
  () =>
    import("@/components/DashboardSalesTargetComponent/DashboardSalesTargetComponent").then(
      (mod) => mod.DashboardSalesTargetComponent
    ),
  {
    loading: (loadingProps) => <FallbackDashboard />,
    ssr: false,
  }
);
// 稟議
import { DashboardPreApprovalComponent } from "@/components/DashboardPreApprovalComponent/DashboardPreApprovalComponent";
import { DashboardProviderComponent } from "@/components/DashboardProviderComponent/DashboardProviderComponent";
import Head from "next/head";
import { SkeletonLoadingLineCustom } from "@/components/Parts/SkeletonLoading/SkeletonLoadingLineCustom";
// ------------------------------- 動的インポート ここまで -------------------------------

// ----------------------------------- テストコード -----------------------------------

// const DashboardHome = ({
//   initialSession,
//   user,
//   userProfile,
// }: {
//   initialSession: Session;
//   user: User;
//   userProfile: UserProfileCompanySubscription;
// }) => {
const DashboardHome = () => {
  const supabase = useSupabaseClient();
  const language = useStore((state) => state.language);
  const setTheme = useThemeStore((state) => state.setTheme);
  const activeMenuTab = useDashboardStore((state) => state.activeMenuTab);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const setUserProfileState = useDashboardStore((state) => state.setUserProfileState);
  // セッション email変更時の最新user.email確認用
  const sessionState = useStore((state) => state.sessionState);
  const setSessionState = useStore((state) => state.setSessionState);

  // サインアウト関数(非同期処理)
  const handleSignOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("ユーザーデータなしのためサインアウトするもエラー", error);
    }
  }, [supabase]);

  // SSRからpropsでユーザーデータの受け渡しは公開情報となりできないため、初回マウント後にsupabase.rpcメソッドでユーザーデータを取得する
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    const getUserData = async () => {
      console.log("Homeページ /home初回マウント useEffect userProfileStateなし sessionState:", sessionState);
      try {
        let user = null;
        // ZustandのsessionStateにセッションが存在しない場合は、直接/homeへリクエストしてきているので、クライアントサイドでgetSession()を使用してローカルセッションからセッションを取得してくる SSR側でgetUser()でSupabase Authデータベースで認証済みのためローカルストレージからの取得でOK
        if (!sessionState) {
          // const {
          //   data: { _user },
          // } = await supabase.auth.getUser();

          console.log(
            "Homeページ /home初回マウント useEffect sessionStateなしのためauthのgetSessionでセッションを取得"
          );
          const { data } = await supabase.auth.getSession();

          if (!data || !data.session) {
            console.log("セッション取得エラー: H00 data: ", data);
            throw new Error("ユーザー認証に失敗しました。");
          }

          console.log(
            "Homeページ /home初回マウント useEffect sessionStateなしのためauthのgetSessionでセッションを取得成功 data: ",
            data
          );

          setSessionState(data.session);

          user = data.session.user;
        } else {
          console.log(
            "Homeページ /home初回マウント useEffect sessionStateあり userに格納 sessionState: ",
            sessionState
          );
          const { user: _user } = sessionState;
          user = _user;
        }

        // SSRのgetUserで認証済みのためログイン画面で認証した後_appのgetSession()の結果を格納したsessionStateを使用してuserを取得
        if (!user) {
          console.log("ユーザーデータ取得エラー: H01");
          throw new Error("ユーザー認証に失敗しました。");
        }

        console.log("Homeページ /home初回マウント useEffect セッションのuserデータを確認 get_user_data関数を実行🔥");
        // 取得したユーザーidに一致するユーザー詳細データを取得
        const { data: userProfile, error: errorUser } = await supabase.rpc("get_user_data", { _user_id: user.id });

        if (errorUser) {
          console.log("ユーザー詳細データ取得エラー: H02", errorUser);
          throw errorUser;
        }

        console.log(
          "Homeページ /home初回マウント useEffect get_user_data関数を実行成功✅ 取得したuserProfileデータをZustandに格納 userProfile: ",
          userProfile
        );

        await new Promise((resolve, reject) => setTimeout(resolve, 2000));

        // stateに保存
        setUserProfileState(userProfile[0]);

        setTimeout(() => {
          setIsReady(true);
        }, 500);
      } catch (error: any) {
        console.error("ユーザーデータの取得に失敗しました。", error);
        toast.error(`ユーザーデータの取得に失敗しました...🙇‍♀️\nログインページに戻ります。`);
        handleSignOut();
      }
    };

    getUserData();
  }, []);

  // Hooksはコンポーネントの最上位で呼び出される必要があり、条件分岐内でHookの呼び出しはできないため、if分岐の前に記述
  // // お知らせ notificationsテーブルから自分のidに一致するお知らせデータを全て取得
  // const [isReady, setIsReady] = useState(false);
  // useEffect(() => {
  //   setIsReady(true);
  // }, []);
  const {
    data: notificationData,
    error: notificationError,
    status: notificationStatus,
    isLoading: notificationIsLoading,
  } = useQueryNotifications(userProfileState?.id, isReady); // 自分宛のお知らせ一覧を取得してキャッシュに格納
  useSubscribeNotifications(userProfileState?.id); // 自分宛のnotificationsテーブルをリアルタイム監視を開始
  // 新規サブスク登録とサブスク内容の変更を監視
  useSubscribeSubscription();
  // メンバーが自身のアカウントの紐付け、解除の変更やチームでの役割の変更を監視 うまくいかず
  useSubscribeSubscribedAccount();

  // ブラウザバックでのページ遷移に対して確認画面を表示
  useBeforeUnload("サイトを離れてもよろしいですか？");

  console.log(
    "🔥Homeページ レンダリング2",
    "userProfileState",
    userProfileState
    // "notificationData",
    // notificationData,
    // "notificationStatus",
    // notificationStatus
    // "notificationError",
    // notificationError,
    // "notificationIsLoading",
    // notificationIsLoading,
    // "activeMenuTab",
    // activeMenuTab
  );

  // ユーザーデータのメールとセッションのメールが一致しているかチェック
  useEffect(() => {
    if (!userProfileState) return console.log("❌userProfileStateなし");
    // profilesテーブルとstripe customerのメール変更関数(非同期処理)
    const handleChangeEmail = async (_session: any) => {
      try {
        if (!_session?.access_token) {
          console.log("❌handleChangeEmail アクセストークンなし");
          throw new Error("❌handleChangeEmail アクセストークンなし");
        }
        const updateEmailPayload = {
          newEmail: _session?.user?.email,
          profileId: userProfileState.id,
          stripeCustomerId: userProfileState.stripe_customer_id,
        };

        console.log("handleChangeEmailでメールアドレス変更ルートにリクエスト🔥 updateEmailPayload", updateEmailPayload);
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

        const newProfileObj = { ...userProfileState, email: newEmail };

        if (!userProfileState) setUserProfileState(newProfileObj as UserProfileCompanySubscription);

        toast.success(`メールアドレスが新たに更新されました🌟`);
        console.log("✅メールアドレス変更完了", sessionState.user.email, newEmail);
      } catch (error: any) {
        console.error("メールアドレスの変更に失敗", error);
        toast.error(`メールアドレスの更新に失敗しました🙇‍♀️`);
        // Zustandにまだユーザーデータが存在しない場合にはセット
        if (!userProfileState) {
          console.log("Zustandにユーザーデータが存在しないためサインアウト");
          handleSignOut();
        }
        // if (!userProfileState) setUserProfileState(userProfile as UserProfileCompanySubscription);
      }
    };

    // ユーザーデータが取得できなかった場合にはリターン(必ずサインアップ時にprofilesにidとemailが作成されるため)
    if (!userProfileState || !sessionState?.user?.email) {
      console.log(
        "homeページコンポーネントuseEffect userProfileStateの変更を検出🔥 ユーザーデータ、または、sessionState?.user?.emailが存在しないため強制的にサインアウトさせる userProfileState: ",
        userProfileState,
        ", sessionState?.user?.email: ",
        sessionState?.user?.email
      );
      handleSignOut();
      return;
    }

    // SSRでユーザーデータを取得したルート
    else {
      console.log(
        "homeページコンポーネントuseEffect userProfileStateの変更を検出🔥 sessionStateのemailとuserProfileStateのemailが一致しているかチェック",
        "sessionState?.user?.email",
        sessionState?.user?.email,
        "userProfileState.email",
        userProfileState.email
      );
      const isEmailUpdateNeeded = sessionState?.user?.email !== userProfileState.email;

      // セッションのemailとprofilesテーブルのemailが一致しているかチェック(メール変更がされていないかチェック)
      // if (sessionState.user.email !== userProfile.email) {
      // メールが変更されてるルート => profilesとstripeのemailを更新
      if (isEmailUpdateNeeded) {
        console.log(
          "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥 メールアドレスの変更を検知しました isEmailUpdateNeeded",
          isEmailUpdateNeeded
        );

        handleChangeEmail(sessionState);
      }
      // メールが変更されていないルート
      else {
        console.log("✅メールアドレス変更無し 何もせずリターン");
        // Zustandにまだユーザーデータが存在しない場合にはセット
        // if (!userProfileState) setUserProfileState(userProfile as UserProfileCompanySubscription);
      }
    }
  }, [userProfileState, setUserProfileState]);

  // const setTheme = useStore((state) => state.setTheme);

  // 言語別タイトル
  let langTitle = "";
  if (activeMenuTab && language) {
    langTitle = mappingTitle[activeMenuTab][language];
  }
  if (!langTitle) {
    langTitle = "TRUSTiFY";
  }

  // /companyページにいて、アクティブメニュータブがCompanyでない場合にはCompanyに変更する
  useEffect(() => {
    setTheme("light");
    // if (window.history.state.url === "/home") {
    //   setActiveMenuTab("HOME");
    //   console.log("homeyページ アクティブタブをHOMEに変更");
    // }
  }, []);

  // ユーザー詳細データを取得するまではロゴアニメーションを表示
  // if (!userProfileState) {
  if (!isReady) {
    console.log("Homeページ /homeレンダリング userProfileStateなし ユーザーデータ取得までロゴアニメーションを表示");
    //  return null
    return (
      <>
        <Head>
          <title>TRUSTiFY</title>
        </Head>
        <main
          className={`flex-center fixed left-0 top-0 z-[100] h-[100dvh] w-[100dvw] bg-[#121212] ${
            userProfileState ? `fadeout08_forward` : ``
          }`}
        >
          <img
            height="66"
            width="66"
            alt="logo"
            src="https://pmmazevauhmntblygzcx.supabase.co/storage/v1/object/public/company_logos/Trustify_Logo_icon%20bg-white@0.5x.png"
            style={{ margin: "auto" }}
            className={`first_mount_logo_anime`}
            // className={`animate-pulse`}
          />
        </main>
        <div className="flex-center h-[100dvh] w-[100dvw] font-sans">
          {/* ヘッダー */}
          <div className={`absolute left-[72px] top-0 z-10 flex h-[56px] min-h-[56px] w-[100vw] items-center`}>
            <SkeletonLoadingLineCustom h="56px" w="100%" rounded="0px" />
          </div>
          {/* メイン */}
          <div className={`flex-center h-full w-full`}>
            <div className={`h-full w-[72px] min-w-[72px]`}>
              <SkeletonLoadingLineCustom h="100%" w="72px" rounded="0px" />
            </div>
            <div className={`flex-col-center h-full w-full`}>
              <div className={`h-[56px] w-full`}></div>
              <div className={`flex-center h-[calc(100vh-56px)] w-full`}>
                <div className={`flex h-[70dvh] w-[40%] flex-col items-center rounded-[4px]`}>
                  <div className={`flex-col-center w-full`}>
                    <div
                      className={`flex-center text_brand_f_gradient text_brand_shadow relative h-[70px] w-full max-w-[400px] select-none text-[32px] font-bold`}
                    >
                      TRUSTiFYへようこそ
                    </div>
                    <div
                      className={`h-[54px] w-full max-w-[400px] select-none text-[14px] text-[var(--color-text-third)]`}
                    >
                      ここはあなたのデータベースです。ご紹介するステップで、最初の一歩を踏み出しましょう！
                    </div>
                  </div>
                  <div className={`h-full w-full max-w-[400px]`}>
                    {Array(5)
                      .fill(null)
                      .map((_, index) => (
                        <div
                          key={`home_fallback_${index}`}
                          className={`mt-[10px] flex h-[72px] min-h-[72px] w-full max-w-[400px] items-center rounded-[8px] bg-[var(--color-bg-base-sub)] text-[14px] font-bold text-[var(--color-text-title)]`}
                        >
                          <SkeletonLoadingLineCustom h="72px" w="100%" rounded="9px" />
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <DashboardLayout title={langTitle}>
      {/* {!isReady && (
        <div
          className={`flex-center pointer-events-none relative z-0 h-[100dvh] w-[100dvw] bg-[#121212] ${
            isReady ? `fadeout10_forward` : ``
          }`}
        ></div>
      )} */}
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
      {/* {activeMenuTab === "Contacts" && <FallbackDashboard />} */}
      {activeMenuTab === "Activity" && <DashboardActivityComponent />}
      {activeMenuTab === "Meeting" && <DashboardMeetingComponent />}
      {activeMenuTab === "Property" && <DashboardPropertyComponent />}
      {activeMenuTab === "Calendar" && <DashboardCalendarComponent />}
      {activeMenuTab === "Quotation" && <DashboardQuotationComponent />}
      {activeMenuTab === "SDB" && <DashboardSDBComponent />}
      {activeMenuTab === "SalesTarget" && <DashboardSalesTargetComponent />}
      {activeMenuTab === "PreApproval" && <DashboardPreApprovalComponent />}
      {/* {activeMenuTab === "Import" && <div />} */}
      {activeMenuTab === "Provider" && <DashboardProviderComponent />}
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

  // getSession()はセッションデータをローカルストレージから取得するので、改竄可能性もあるためサーバーサイドでは使用しない。
  // サーバーサイドではgetUser()を使用：getUserはSupabase Authサーバでユーザーのaccess_token JWTを検証しユーザー認証を行うのでこちらを使用する
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // セッションが存在しないなら/にリダイレクト
  if (!user) {
    console.log("/homeサーバーサイド セッションが存在しないため/にリダイレクト");
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
      props: {},
    };
  }

  // ユーザーが存在するならそのままdashboardコンポーネントをマウント
  console.log("/homeサーバーサイド セッションが存在するためそのままリターン");
  // getServerSidePropsでリターンしたpropsの情報はブラウザDOMのidが「__NEXT_DATA__」のscriptタグのJSON内に全てセットされ公開されてしまうため、idやemailなどのセンシティブな情報は受け渡ししない
  // 詳細データを取得する場合はクライアントサイドのuseEffect内で行う
  return {
    props: {},
  };
};
// ----------------------------------- テストコード -----------------------------------ここまで

// ----------------------------------- 元コード -----------------------------------

// const DashboardHome = ({
//   initialSession,
//   user,
//   userProfile,
// }: {
//   initialSession: Session;
//   user: User;
//   userProfile: UserProfileCompanySubscription;
// }) => {
//   const supabase = useSupabaseClient();
//   const language = useStore((state) => state.language);
//   const setTheme = useThemeStore((state) => state.setTheme);
//   const activeMenuTab = useDashboardStore((state) => state.activeMenuTab);
//   const setActiveMenuTab = useDashboardStore((state) => state.setActiveMenuTab);
//   const userProfileState = useDashboardStore((state) => state.userProfileState);
//   const setUserProfileState = useDashboardStore((state) => state.setUserProfileState);
//   // セッション email変更時の最新user.email確認用
//   const sessionState = useStore((state) => state.sessionState);
//   const setProductsState = useDashboardStore((state) => state.setProductsState);

//   // // お知らせ notificationsテーブルから自分のidに一致するお知らせデータを全て取得
//   const [isReady, setIsReady] = useState(false);
//   useEffect(() => {
//     setIsReady(true);
//   }, []);
//   const {
//     data: notificationData,
//     error: notificationError,
//     status,
//     isLoading,
//   } = useQueryNotifications(userProfile?.id, isReady); // 自分宛のお知らせ一覧を取得してキャッシュに格納
//   useSubscribeNotifications(userProfile?.id); // 自分宛のnotificationsテーブルをリアルタイム監視を開始
//   // 新規サブスク登録とサブスク内容の変更を監視
//   useSubscribeSubscription(userProfile);
//   // メンバーが自身のアカウントの紐付け、解除の変更やチームでの役割の変更を監視 うまくいかず
//   useSubscribeSubscribedAccount(userProfile);

//   // ブラウザバックでのページ遷移に対して確認画面を表示
//   useBeforeUnload("サイトを離れてもよろしいですか？");

//   console.log(
//     "🔥Homeページ レンダリング",
//     "activeMenuTab",
//     activeMenuTab,
//     "SSRで取得したセッション",
//     initialSession,
//     "SSRで取得したセッションのユーザー",
//     user,
//     // "profilesテーブルから取得したユーザーデータuserProfile",
//     // userProfile1,
//     "SSRで取得したユーザーデータ",
//     userProfile,
//     "notificationData",
//     notificationData,
//     "notificationError",
//     notificationError,
//     "status",
//     status,
//     "isLoading",
//     isLoading
//   );

//   // SSRで取得したユーザーデータをZustandに格納 ユーザーデータが無ければ強制的にログアウトさせる
//   useEffect(() => {
//     // サインアウト関数(非同期処理)
//     const handleSignOut = async () => {
//       const { error } = await supabase.auth.signOut();
//       if (error) {
//         console.error("ユーザーデータなしのためサインアウトするもエラー", error);
//       }
//     };

//     // profilesテーブルとstripe customerのメール変更関数(非同期処理)
//     const handleChangeEmail = async (_session: any) => {
//       try {
//         if (!_session?.access_token) return console.log("❌handleChangeEmail アクセストークンなし");
//         const updateEmailPayload = {
//           newEmail: _session?.user?.email,
//           profileId: userProfile.id,
//           stripeCustomerId: userProfile.stripe_customer_id,
//         };

//         console.log("🌟handleChangeEmailでメールアドレス変更ルートにリクエスト updateEmailPayload", updateEmailPayload);
//         const {
//           data: { new_email: newEmail, error: axiosError },
//         } = await axios.post(`/api/update-stripe-email`, updateEmailPayload, {
//           headers: {
//             Authorization: `Bearer ${_session.access_token}`,
//           },
//         });

//         if (axiosError) {
//           console.error(`🌟メール変更エラー axiosError`, axiosError);
//           throw axiosError;
//         }

//         console.log(`🌟profilesテーブル, stripeともにメール変更完了 newEmail`, newEmail);

//         const newProfileObj = { ...userProfile, email: newEmail };

//         if (!userProfileState) setUserProfileState(newProfileObj as UserProfileCompanySubscription);

//         toast.success(`メールアドレスが新たに更新されました🌟`);
//         console.log("✅メールアドレス変更完了", sessionState.user.email, newEmail);
//       } catch (error: any) {
//         console.error("メールアドレスの変更に失敗", error);
//         toast.error(`メールアドレスの更新に失敗しました🙇‍♀️`);
//         // Zustandにまだユーザーデータが存在しない場合にはセット
//         if (!userProfileState) setUserProfileState(userProfile as UserProfileCompanySubscription);
//       }
//     };

//     // SSEでユーザーデータが取得できなかった場合にはリターン(必ずサインアップ時にprofilesにidとemailが作成されるため)
//     if (!userProfile) {
//       console.log("SSRで取得したユーザーデータが存在しないため強制的にサインアウトさせる");
//       handleSignOut();
//       return;
//     }

//     // SSRでユーザーデータを取得したルート
//     else {
//       console.log(
//         "🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟 ",
//         "🌟initialSession?.user?.email",
//         initialSession?.user?.email,
//         "🌟userProfile.email",
//         userProfile.email,
//         "🌟sessionState?.user?.email",
//         sessionState?.user?.email,
//         "🌟userProfileState?.email",
//         userProfileState?.email
//       );
//       const isEmailUpdateNeeded =
//         !!userProfileState?.email && sessionState?.user?.email
//           ? sessionState?.user?.email !== userProfileState.email
//           : initialSession?.user?.email !== userProfile.email;

//       // セッションのemailとprofilesテーブルのemailが一致しているかチェック(メール変更がされていないかチェック)
//       // if (sessionState.user.email !== userProfile.email) {
//       // メールが変更されてるルート => profilesとstripeのemailを更新
//       if (isEmailUpdateNeeded) {
//         console.log(
//           "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥 メールアドレスの変更を検知しました isEmailUpdateNeeded",
//           isEmailUpdateNeeded
//         );

//         handleChangeEmail(sessionState ? sessionState : initialSession);
//       }
//       // メールが変更されていないルート
//       else {
//         console.log("✅メールアドレス変更無しそのままSSRのユーザーデータをZustandにセット");
//         // Zustandにまだユーザーデータが存在しない場合にはセット
//         if (!userProfileState) setUserProfileState(userProfile as UserProfileCompanySubscription);
//       }
//     }
//   }, [userProfile, setUserProfileState]);

//   // const setTheme = useStore((state) => state.setTheme);

//   // 言語別タイトル
//   let langTitle = "";
//   if (activeMenuTab && language) {
//     langTitle = mappingTitle[activeMenuTab][language];
//   }
//   if (!langTitle) {
//     langTitle = "TRUSTiFY";
//   }

//   // /companyページにいて、アクティブメニュータブがCompanyでない場合にはCompanyに変更する
//   useEffect(() => {
//     setTheme("light");
//     // if (window.history.state.url === "/home") {
//     //   setActiveMenuTab("HOME");
//     //   console.log("homeyページ アクティブタブをHOMEに変更");
//     // }
//   }, []);

//   return (
//     <DashboardLayout title={langTitle}>
//       {activeMenuTab === "HOME" && <DashboardHomeComponent />}
//       {/* {activeMenuTab === "HOME" && status !== "loading" && <DashboardHomeComponent />}
//       {activeMenuTab === "HOME" && status === "loading" && <FallbackDashboardHomeComponent />} */}
//       {/* {activeMenuTab === "HOME" && (
//         <ErrorBoundary FallbackComponent={ErrorFallback}>
//           <Suspense fallback={<FallbackDashboardHomeComponent />}>
//             <DashboardHomeComponent />
//           </Suspense>
//         </ErrorBoundary>
//       )} */}
//       {activeMenuTab === "Company" && <DashboardCompanyComponent />}
//       {activeMenuTab === "Contacts" && <DashboardContactComponent />}
//       {/* {activeMenuTab === "Contacts" && <FallbackDashboard />} */}
//       {activeMenuTab === "Activity" && <DashboardActivityComponent />}
//       {activeMenuTab === "Meeting" && <DashboardMeetingComponent />}
//       {activeMenuTab === "Property" && <DashboardPropertyComponent />}
//       {activeMenuTab === "Calendar" && <DashboardCalendarComponent />}
//       {activeMenuTab === "Quotation" && <DashboardQuotationComponent />}
//       {activeMenuTab === "SDB" && <DashboardSDBComponent />}
//       {activeMenuTab === "SalesTarget" && <DashboardSalesTargetComponent />}
//       {activeMenuTab === "PreApproval" && <DashboardPreApprovalComponent />}
//       {/* {activeMenuTab === "Import" && <div />} */}
//       {activeMenuTab === "Provider" && <DashboardProviderComponent />}
//       {/* {activeMenuTab === "Contacts" && <div className="flex-center w-screen h-screen bg-red-100">あい</div>} */}
//     </DashboardLayout>
//   );
// };

// export default DashboardHome;
// // ====================== DashboardHomeコンポーネントここまで ======================

// // ========================== サーバーサイドレンダリング ==========================

// // Dashboardコンポーネントがマウントする前にサーバーにアクセスして、
// // ユーザーのセッションの取得、認証、DBへデータを取得、
// // ユーザー情報が見つからない場合にはマウントする前にログインページにリダイレクト
// export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
//   // 認証済みSupabaseクライアントの作成 Create authenticated Supabase Client
//   const supabase = createServerSupabaseClient(ctx);
//   //  セッションがあるかどうかを確認する Check if we have a session
//   const {
//     data: { session },
//   } = await supabase.auth.getSession();

//   // セッションが存在しないなら/にリダイレクト
//   if (!session) {
//     console.log("/homeサーバーサイド セッションが存在しないなら/にリダイレクト");
//     return {
//       redirect: {
//         destination: "/",
//         permanent: false,
//       },
//       props: {},
//     };
//   }

//   // サーバーのsupabaseクライアントを使用して、行レベルセキュリティの認証済みクエリーをサーバーサイドで実行することができます
//   // const { data: userProfile1, error: error1 } = await supabase
//   //   .from("profiles")
//   //   .select("*")
//   //   .eq("id", session.user.id)
//   //   .single();
//   // Postgres関数で作成したget_user_data関数でprofilesテーブル、companiesテーブル、subscribed_accountsテーブル、subscriptionsテーブルの4つを外部結合したSELECTクエリでデータを取得する
//   // const { data: userProfile, error: error } = await supabase
//   //   .rpc("get_user_data", { _user_id: session.user.id })
//   //   .single();
//   const { data: userProfile, error: error } = await supabase.rpc("get_user_data", { _user_id: session.user.id });

//   if (userProfile) console.log("🌟/homeサーバーサイド userProfileあり");
//   if (error) console.log("🌟/homeサーバーサイド get_user_data関数でerror発生 error: ", error);

//   // エラーが発生したら/にリダイレクト
//   // if (error) {
//   //   console.log("/homeサーバーサイド get_user_data関数でエラー発生 /にリダイレクト");
//   //   return {
//   //     redirect: {
//   //       destination: "/",
//   //       permanent: false,
//   //     },
//   //     props: {},
//   //   };
//   // }

//   // notificationsテーブルのデータを取得
//   // const {data: notificationData, error: notificationError} = await supabase.from('notifications').select().eq('to_user_id', )

//   // ユーザーが存在するならそのままdashboardコンポーネントをマウント
//   console.log("/homeサーバーサイド セッションが存在するためそのままリターン");
//   return {
//     props: {
//       initialSession: session,
//       user: session.user,
//       // userProfile: userProfile ? userProfile[0] : {},
//       // userProfile: userProfile ? userProfile[0] : null,
//       userProfile: userProfile ? userProfile[0] : null,
//       // userProfile1: userProfile1 ? userProfile1 : null,
//     },
//   };
// };

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
// ----------------------------------- 元コード -----------------------------------ここまで
