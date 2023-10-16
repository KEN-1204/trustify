import useStore from "@/store";
import Head from "next/head";
import React, { FC, ReactNode, Suspense, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { toast } from "react-toastify";
import styles from "@/styles/DashboardLayout.module.css";
import { Tooltip } from "./Parts/Tooltip/Tooltip";
import { DashboardHeader } from "./DashboardHeader/DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar/DashboardSidebar";

import { TooltipBlur } from "./Parts/Tooltip/TooltipBlur";
import useDashboardStore from "@/store/useDashboardStore";
import { EditModal } from "./EditModal/EditModal";

import useThemeStore from "@/store/useThemeStore";
import useRootStore from "@/store/useRootStore";
import { ChangeSizeMenu } from "./Parts/ChangeSizeMenu/ChangeSizeMenu";
import { MdOutlineDarkMode, MdOutlineLightMode } from "react-icons/md";
import { TooltipWrap } from "./Parts/Tooltip/TooltipWrap";
import { InsertNewContactModal } from "./DashboardCompanyComponent/Modal/InsertNewContactModal/InsertNewContactModal";
import { UpdateContactModal } from "./DashboardCompanyComponent/Modal/UpdateContactModal/UpdateContactModal";
import { InsertNewClientCompanyModal } from "./DashboardCompanyComponent/Modal/InsertNewClientCompnayModal/InsertNewClientCompanyModal";
import { UpdateClientCompanyModal } from "./DashboardCompanyComponent/Modal/UpdateClientCompanyModal/UpdateClientCompanyModal";
import { InsertNewActivityModal } from "./DashboardCompanyComponent/Modal/InsertNewActivityModal/InsertNewActivityModal";
import { SettingAccountModal } from "./DashboardCompanyComponent/Modal/SettingAccountModal/SettingAccountModal";
import { UpdateActivityModal } from "./DashboardCompanyComponent/Modal/UpdateActivityModal/UpdateActivityModal";
import { InsertNewMeetingModal } from "./DashboardCompanyComponent/Modal/InsertNewMeetingModal/InsertNewMeetingModal";
import { UpdateMeetingModal } from "./DashboardCompanyComponent/Modal/UpdateMeetingModal/UpdateMeetingModal";
import { InsertNewProductModal } from "./DashboardCompanyComponent/Modal/SettingAccountModal/InsertNewProductModal/InsertNewProductModal";
import { UpdateProductModal } from "./DashboardCompanyComponent/Modal/SettingAccountModal/UpdateProductModal/UpdateProductModal";
import { InsertNewPropertyModal } from "./DashboardCompanyComponent/Modal/InsertNewPropertyModal/InsertNewPropertyModal";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./ErrorFallback/ErrorFallback";
import { Fallback } from "./Fallback/Fallback";
import { UpdatePropertyModal } from "./DashboardCompanyComponent/Modal/UpdatePropertyModal/UpdatePropertyModal";
import { SubscriptionPlanModalForFreeUser } from "./Modal/SubscriptionPlanModalForFreeUser/SubscriptionPlanModalForFreeUser";
import { useSubscribeSubscription } from "@/hooks/useSubscribeSubscription";
import { FirstLoginSettingUserProfileCompanyModal } from "./Modal/FirstLoginSettingUserProfileCompanyModal/FirstLoginSettingUserProfileCompanyModal";
import { SettingInvitationModal } from "./DashboardCompanyComponent/Modal/SettingAccountModal/SettingInvitationModal/SettingInvitationModal";
import { FirstLoginSettingUserProfileAfterInvitationModal } from "./Modal/FirstLoginSettingUserProfileAfterInvitaionModal/FirstLoginSettingUserProfileAfterInvitaionModal";
import { Invitation } from "@/types";
import { InvitationForLoggedInUser } from "./Modal/InvitationForLoggedInUser/InvitationForLoggedInUser";

type Prop = {
  title?: string;
  children: ReactNode;
};

// 各ページをラップして、各ページ毎にCSSクラスやタイトル、ヘッダーなどを柔軟に設定する
// 各ページのJSXの一番外側に配置
export const DashboardLayout: FC<Prop> = ({ children, title = "TRUSTiFY" }) => {
  const router = useRouter();
  const supabase = useSupabaseClient();

  const theme = useRootStore(useThemeStore, (state) => state.theme);
  // const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  // const theme = useStore((state) => state.theme);
  // const setTheme = useStore((state) => state.setTheme);
  const activeMenuTab = useDashboardStore((state) => state.activeMenuTab);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const setProductsState = useDashboardStore((state) => state.setProductsState);
  // const [loading, setLoading] = useState(false)
  // ユーザープロフィール

  // サブスクリプションの契約状態を監視して変更があればリアルタイムにクライアントを自動更新
  // 未契約者はuserProfileState.subscription_idはnullのため、subscribed_accountsテーブルのINSERTイベントを監視
  // 契約者、契約後解約者はすでにuserProfileState.subscription_idを持っているため、subscriptionsテーブルのUPDATEイベントを監視
  // useSubscribeSubscription();

  // サブスクプランがnullなら初回プランモーダル表示
  const showSubscriptionPlan =
    !!userProfileState && (!userProfileState.subscription_plan || userProfileState.subscription_plan === "free_plan");
  // const showSubscriptionPlan = !!userProfileState && userProfileState.role === "free_user";

  // 初回サブスク登録後、契約者（is_subscriberがtrue）でかつ初回ログイン時（first_time_loginがtrue）の場合、
  // 名前、チーム名、利用用途などのプロフィール情報を入力、選択するモーダル表示
  const showFirstLoginSettingUserProfileCompanyModal =
    !!userProfileState &&
    userProfileState.is_subscriber &&
    userProfileState.first_time_login &&
    userProfileState.subscription_plan !== "free_plan";

  // 招待メールでログインした際に起動 新規登録ユーザー向け
  const showFirstLoginSettingUserProfileAfterInvitation =
    !!userProfileState &&
    !userProfileState.is_subscriber &&
    userProfileState.first_time_login &&
    userProfileState.subscription_plan !== "free_plan";

  // 招待メールでログインした際に起動 サインアップ済みユーザー向け invitationsテーブルに自身のユーザーidが存在し、かつresultがpendingの場合に起動
  // const [invitedState, setInvitedState] = useState(false);
  const [invitationData, setInvitationData] = useState<Invitation | null>(null);
  useEffect(() => {
    if (showSubscriptionPlan) {
      const getMyInvitation = async () => {
        console.log("getMyInvitation関数実行 DashboardLayout内のuseEffect");
        try {
          const { data, error: invitationError } = await supabase
            .from("invitations")
            .select()
            .eq("to_user_id", userProfileState.id)
            .eq("result", "pending")
            .single();

          if (invitationError) {
            console.log(`dashboardLayout invitationsテーブルのselectエラー`, invitationError);
            throw new Error(invitationError.message);
          }

          console.log("招待データを取得 data", data);
          // setInvitedState(true);
          setInvitationData(data);
        } catch (error: any) {
          console.error(error.message);
        }
      };

      getMyInvitation();
    }
  }, [showSubscriptionPlan]);
  // const showInvitationModalForLoggedInUser =
  //   !!userProfileState && !userProfileState.first_time_login && userProfileState.subscription_plan !== "free_plan" && ;

  console.log(
    "DashboardLayout ユーザープロフィール",
    userProfileState,
    "ファーストタイムログイン",
    userProfileState?.first_time_login,
    "サブスクプラン",
    userProfileState?.subscription_plan,
    "showFirstLoginSettingUserProfileCompanyModal",
    showFirstLoginSettingUserProfileCompanyModal,
    "showSubscriptionPlan",
    showSubscriptionPlan,
    "invitationData",
    invitationData
  );

  // テーマカラーチェンジ関数
  const changeTheme = () => {
    // console.log(`🔥ここ localStorage.getItem("theme-storage")`, localStorage.getItem("theme-storage"));
    // if (theme === "light") localStorage.setItem("theme", `dark`);
    // if (theme === "dark") localStorage.setItem("theme", `light`);

    if (theme === "light") setTheme("dark");
    if (theme === "dark") setTheme("light");
  };

  // モーダルが開いている時はbodyにoverflow: hiddenを設定する
  const isOpenEditModal = useDashboardStore((state) => state.isOpenEditModal);
  const openLangTab = useStore((state) => state.openLangTab);
  // useEffect(() => {
  //   if (isOpenEditModal || openLangTab) {
  //     // モーダルが開いているときに、bodyにoverflow: hiddenを設定
  //     document.body.style.overflow = "hidden";
  //   } else {
  //     // モーダルが閉じているときに、bodyのoverflowを初期状態に戻す
  //     document.body.style.overflow = "unset";
  //   }

  //   // useEffectのクリーンアップ関数で、コンポーネントのアンマウント時にも初期状態に戻す
  //   return () => {
  //     document.body.style.overflow = "unset";
  //   };
  // }, [isOpenEditModal, openLangTab]);

  // マウント時にbodyタグにoverflow: hiddenを設定して、ネイティブアプリケーションのようにする
  useEffect(() => {
    document.body.style.overflow = "hidden";
  }, []);

  // ログアウト関数
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("サインアウトに失敗しました", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: `${theme === "light" ? "light" : "dark"}`,
      });
    }
  };

  // リフレッシュ
  const handleRefresh = () => {
    router.reload();
  };

  // ツールチップ
  const hoveredItemPos = useStore((state) => state.hoveredItemPos);
  const hoveredItemPosHorizon = useStore((state) => state.hoveredItemPosHorizon);
  const hoveredItemPosWrap = useStore((state) => state.hoveredItemPosWrap);

  // テーブルカラム編集モーダル
  const isOpenEditColumns = useDashboardStore((state) => state.isOpenEditColumns);
  const setIsOpenEditColumns = useDashboardStore((state) => state.setIsOpenEditColumns);
  // サイズ切り替えメニュー
  const clickedItemPos = useStore((state) => state.clickedItemPos);
  // アカウント設定モーダル
  const isOpenSettingAccountModal = useDashboardStore((state) => state.isOpenSettingAccountModal);
  // 製品・サービス作成・編集モーダル
  const isOpenInsertNewProductModal = useDashboardStore((state) => state.isOpenInsertNewProductModal);
  const isOpenUpdateProductModal = useDashboardStore((state) => state.isOpenUpdateProductModal);
  // 招待メールモーダル
  const isOpenSettingInvitationModal = useDashboardStore((state) => state.isOpenSettingInvitationModal);
  // 会社作成モーダル 新規作成と編集モーダル
  const isOpenInsertNewClientCompanyModal = useDashboardStore((state) => state.isOpenInsertNewClientCompanyModal);
  const isOpenUpdateClientCompanyModal = useDashboardStore((state) => state.isOpenUpdateClientCompanyModal);
  // 担当者作成モーダル 新規作成と編集モーダル
  const isOpenInsertNewContactModal = useDashboardStore((state) => state.isOpenInsertNewContactModal);
  const isOpenUpdateContactModal = useDashboardStore((state) => state.isOpenUpdateContactModal);
  // 活動作成モーダル 新規作成と編集モーダル
  const isOpenInsertNewActivityModal = useDashboardStore((state) => state.isOpenInsertNewActivityModal);
  const isOpenUpdateActivityModal = useDashboardStore((state) => state.isOpenUpdateActivityModal);
  // 面談作成モーダル 新規作成と編集モーダル
  const isOpenInsertNewMeetingModal = useDashboardStore((state) => state.isOpenInsertNewMeetingModal);
  const isOpenUpdateMeetingModal = useDashboardStore((state) => state.isOpenUpdateMeetingModal);
  // 案件作成モーダル 新規作成と編集モーダル
  const isOpenInsertNewPropertyModal = useDashboardStore((state) => state.isOpenInsertNewPropertyModal);
  const isOpenUpdatePropertyModal = useDashboardStore((state) => state.isOpenUpdatePropertyModal);

  return (
    <div className={`${styles.trustify_app} relative`}>
      <Head>
        <title>{title}</title>
      </Head>

      {/* ============================ メインコンテンツ ============================ */}
      {/* ヘッダー */}
      <DashboardHeader />
      {/* サイドバー */}
      <DashboardSidebar />
      {/* メイン */}
      <main>{children}</main>
      {/* <main className="relative flex h-full min-h-screen flex-col items-center">{children}</main> */}
      {/* フッター */}
      {/* <footer></footer> */}
      {/* ============================ メインコンテンツ ============================ */}

      {/* ============================ 共通UIコンポーネント ============================ */}
      {/* カラム入れ替え編集モーダルボタン */}
      {/* {activeMenuTab !== "HOME" && (
        <div className="flex-center fixed bottom-[2%] right-[13%] z-[1000] h-[50px] w-[50px] cursor-pointer">
          <div
            className="h-[50px] w-[50px] rounded-full bg-[var(--color-bg-brand)]"
            onClick={() => setIsOpenEditColumns(true)}
          ></div>
        </div>
      )} */}
      {/*router.refreshボタン */}
      {/* <div className="flex-center fixed bottom-[2%] right-[10%] z-[1000] h-[35px] w-[35px] cursor-pointer">
        <div className="h-[35px] w-[35px] rounded-full bg-[#00d43690]" onClick={handleRefresh}></div>
      </div> */}
      {/* サインアウトボタン */}
      <div className="flex-center fixed bottom-[2%] right-[6%] z-[1000] h-[35px] w-[35px] cursor-pointer">
        <div className="h-[35px] w-[35px] rounded-full bg-[#00000030]" onClick={handleSignOut}></div>
      </div>
      {/* テーマ切り替えボタン */}
      <div
        className={`flex-center transition-base01 fixed bottom-[2%] right-[2%] z-[1000] h-[35px] w-[35px] cursor-pointer rounded-full ${
          theme === "dark"
            ? "bg-[--color-bg-brand05] hover:bg-[--color-bg-brand-f]"
            : "bg-[var(--color-bg-brand-fc0)] hover:bg-[var(--color-bg-brand-f)]"
        }`}
        onClick={changeTheme}
      >
        {theme === "light" && <MdOutlineLightMode className="text-[20px] text-[#fff]" />}
        {theme === "dark" && <MdOutlineDarkMode className="text-[20px] text-[#fff]" />}
      </div>

      {/* ============================ 初回サブスクプランモーダルコンポーネント 他チームからの招待無しの場合 ============================ */}
      {showSubscriptionPlan && !invitationData && <SubscriptionPlanModalForFreeUser />}
      {/* ============================ 初回サブスクプランモーダルコンポーネント 他チームからの招待有りの場合 ============================ */}
      {showSubscriptionPlan && invitationData && (
        <InvitationForLoggedInUser invitationData={invitationData} setInvitationData={setInvitationData} />
      )}

      {/* ============================ 初回サブスクプランモーダルコンポーネント ============================ */}
      {showFirstLoginSettingUserProfileCompanyModal && <FirstLoginSettingUserProfileCompanyModal />}
      {showFirstLoginSettingUserProfileAfterInvitation && <FirstLoginSettingUserProfileAfterInvitationModal />}

      {/* ============================ 共通UIコンポーネント ============================ */}
      {/* モーダル */}
      {isOpenEditModal && <EditModal />}

      {/* ツールチップ */}
      {hoveredItemPos && <Tooltip />}
      {hoveredItemPosHorizon && <TooltipBlur />}
      {hoveredItemPosWrap && <TooltipWrap />}

      {/* カラム編集モーダル */}
      {/* {isOpenEditColumns && <EditColumns />} */}

      {/* サイズ切り替えメニュー */}
      {clickedItemPos && <ChangeSizeMenu />}

      {/* アカウント設定モーダル */}
      {isOpenSettingAccountModal && <SettingAccountModal />}
      {/* 製品_追加・編集モーダル */}
      {isOpenInsertNewProductModal && <InsertNewProductModal />}
      {isOpenUpdateProductModal && <UpdateProductModal />}
      {/* 招待メールモーダル */}
      {isOpenSettingInvitationModal && <SettingInvitationModal />}

      {/* 会社_作成・編集モーダル */}
      {isOpenInsertNewClientCompanyModal && <InsertNewClientCompanyModal />}
      {isOpenUpdateClientCompanyModal && <UpdateClientCompanyModal />}

      {/* 担当者_作成・編集モーダル */}
      {isOpenInsertNewContactModal && <InsertNewContactModal />}
      {isOpenUpdateContactModal && <UpdateContactModal />}

      {/* 活動_作成・編集モーダル */}
      {isOpenInsertNewActivityModal && <InsertNewActivityModal />}
      {isOpenUpdateActivityModal && <UpdateActivityModal />}

      {/* 面談_作成・編集モーダル */}
      {isOpenInsertNewMeetingModal && <InsertNewMeetingModal />}
      {isOpenUpdateMeetingModal && <UpdateMeetingModal />}
      {/* 案件_作成・編集モーダル */}
      {/* {isOpenInsertNewPropertyModal && <InsertNewPropertyModal />} */}

      {isOpenInsertNewPropertyModal && (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<Fallback className="min-h-[calc(100vh/3-var(--header-height)/3)]" />}>
            <InsertNewPropertyModal />
          </Suspense>
        </ErrorBoundary>
      )}
      {isOpenUpdatePropertyModal && (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<Fallback className="min-h-[calc(100vh/3-var(--header-height)/3)]" />}>
            <UpdatePropertyModal />
          </Suspense>
        </ErrorBoundary>
      )}
      {/* {isOpenUpdatePropertyModal && <UpdateMeetingModal />} */}
    </div>
  );
};
