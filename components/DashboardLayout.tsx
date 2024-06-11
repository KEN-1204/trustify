import React, { FC, ReactNode, Suspense, useEffect, useRef, useState } from "react";
import styles from "@/styles/DashboardLayout.module.css";

// データ型
import { Invitation } from "@/types";

// ライブラリ
import Head from "next/head";
import { useRouter } from "next/router";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { toast } from "react-toastify";
import { ErrorBoundary } from "react-error-boundary";

// Zusntand
import useStore from "@/store";
import useDashboardStore from "@/store/useDashboardStore";
import useThemeStore from "@/store/useThemeStore";
import useRootStore from "@/store/useRootStore";

// 共通コンポーネント
import { DashboardHeader } from "./DashboardHeader/DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar/DashboardSidebar";

// ツールチップ
import { Tooltip } from "./Parts/Tooltip/Tooltip";
import { TooltipBlur } from "./Parts/Tooltip/TooltipBlur";
import { TooltipWrap } from "./Parts/Tooltip/TooltipWrap";

// UIパーツコンポーネント
import { ChangeSizeMenu } from "./Parts/ChangeSizeMenu/ChangeSizeMenu";

// フォールバック
import { ErrorFallback } from "./ErrorFallback/ErrorFallback";
import { Fallback } from "./Fallback/Fallback";
import { FallbackModal } from "./DashboardCompanyComponent/Modal/FallbackModal/FallbackModal";
import { FallbackSideTableSearchSignatureStamp } from "./DashboardCompanyComponent/Modal/UpdateMeetingModal/SideTableSearchSignatureStamp/FallbackSideTableSearchSignatureStamp";
import { FallbackBusinessCalendarModal } from "./DashboardCompanyComponent/Modal/SettingAccountModal/SettingCompany/BusinessCalendarModal/FallbackBusinessCalendarModal";
import { FallbackIncreaseAccountCountsModal } from "./DashboardCompanyComponent/Modal/SettingAccountModal/SettingPaymentAndPlan/IncreaseAccountCountsModal/FallbackIncreaseAccountCountsModal";
import { FallbackDecreaseAccountCountsModal } from "./DashboardCompanyComponent/Modal/SettingAccountModal/SettingPaymentAndPlan/DecreaseAccountCountsModal/FallbackDecreaseAccountCountsModal";

// モーダル
import { EditModal } from "./EditModal/EditModal";
import { SubscriptionPlanModalForFreeUser } from "./Modal/SubscriptionPlanModalForFreeUser/SubscriptionPlanModalForFreeUser";
import { FirstLoginSettingUserProfileCompanyModal } from "./Modal/FirstLoginSettingUserProfileCompanyModal/FirstLoginSettingUserProfileCompanyModal";
import { SettingInvitationModal } from "./DashboardCompanyComponent/Modal/SettingAccountModal/SettingInvitationModal/SettingInvitationModal";
import { FirstLoginSettingUserProfileAfterInvitationModal } from "./Modal/FirstLoginSettingUserProfileAfterInvitaionModal/FirstLoginSettingUserProfileAfterInvitaionModal";
import { InvitationForLoggedInUser } from "./Modal/InvitationForLoggedInUser/InvitationForLoggedInUser";
import { ChangeTeamOwnerConfirmationModal } from "./DashboardCompanyComponent/Modal/Notifications/ChangeTeamOwnerConfirmationModal/ChangeTeamOwnerConfirmationModal";
import { IncreaseAccountCountsModal } from "./DashboardCompanyComponent/Modal/SettingAccountModal/SettingPaymentAndPlan/IncreaseAccountCountsModal/IncreaseAccountCountsModal";
import { DecreaseAccountCountsModal } from "./DashboardCompanyComponent/Modal/SettingAccountModal/SettingPaymentAndPlan/DecreaseAccountCountsModal/DecreaseAccountCountsModal";
import { BlockModal } from "./Modal/BlockModal/BlockModal";
import { QuotationPreviewForProfile } from "./DashboardQuotationComponent/QuotationDetail/QuotationPreviewModal/QuotationPreviewForProfile";
import { ContactDetailModal } from "./Modal/ContactDetailModal/ContactDetailModal";

// サイドテーブル
import { SideTableSearchSignatureStamp } from "./DashboardCompanyComponent/Modal/UpdateMeetingModal/SideTableSearchSignatureStamp/SideTableSearchSignatureStamp";

// ページ
import { ResumeMembershipAfterCancel } from "./Modal/ResumeMembershipAfterCancel/ResumeMembershipAfterCancel";
import { FallbackResumeMembershipAfterCancel } from "./Modal/ResumeMembershipAfterCancel/FallbackResumeMembershipAfterCancel";
import { RestartAfterCancelForMember } from "./Modal/RestartAfterCancelForMember/RestartAfterCancelForMember";

// アイコン
import { MdOutlineDarkMode, MdOutlineLightMode } from "react-icons/md";

// ------------------------------- 動的インポート -------------------------------
import dynamic from "next/dynamic";

// 🔸案件詳細モーダル(SDB用)
// import { DetailPropertyModal } from "./DashboardPropertyComponent/PropertyDetail/PropertyMainContainer/DetailPropertyModal";
const DetailPropertyModal = dynamic(
  () =>
    import("./DashboardPropertyComponent/PropertyDetail/PropertyMainContainer/DetailPropertyModal").then(
      (mod) => mod.DetailPropertyModal
    ),
  {
    loading: (loadingProps) => <FallbackModal />,
    ssr: false,
  }
);
// 🔸営業カレンダー(編集用)
// import { BusinessCalendarModal } from "./DashboardCompanyComponent/Modal/SettingAccountModal/SettingCompany/BusinessCalendarModal/BusinessCalendarModal";
const BusinessCalendarModal = dynamic(
  () =>
    import(
      "./DashboardCompanyComponent/Modal/SettingAccountModal/SettingCompany/BusinessCalendarModal/BusinessCalendarModal"
    ).then((mod) => mod.BusinessCalendarModal),
  {
    loading: (loadingProps) => <FallbackBusinessCalendarModal />,
    ssr: false,
  }
);
// 🔸営業カレンダー(閲覧用)
// import { BusinessCalendarModalDisplayOnly } from "./DashboardCompanyComponent/Modal/SettingAccountModal/SettingCompany/BusinessCalendarModal/BusinessCalendarModalDisplayOnly";
const BusinessCalendarModalDisplayOnly = dynamic(
  () =>
    import(
      "./DashboardCompanyComponent/Modal/SettingAccountModal/SettingCompany/BusinessCalendarModal/BusinessCalendarModalDisplayOnly"
    ).then((mod) => mod.BusinessCalendarModalDisplayOnly),
  {
    loading: (loadingProps) => <FallbackBusinessCalendarModal />,
    ssr: false, // サーバーサイドレンダリングを無効にする
  }
);
// import { ImportModal } from "./Modal/ImportModal/ImportModal";
const ImportModal = dynamic(() => import("./Modal/ImportModal/ImportModal").then((mod) => mod.ImportModal), {
  loading: (loadingProps) => <FallbackModal />,
  ssr: false, // サーバーサイドレンダリングを無効にする
});

// 🔸モーダル関連
// INSERT関連
// 🔸INSERT会社
// import { InsertNewClientCompanyModal } from "./DashboardCompanyComponent/Modal/InsertNewClientCompnayModal/InsertNewClientCompanyModal";
const InsertNewClientCompanyModal = dynamic(
  () =>
    import("./DashboardCompanyComponent/Modal/InsertNewClientCompnayModal/InsertNewClientCompanyModal").then(
      (mod) => mod.InsertNewClientCompanyModal
    ),
  {
    loading: (loadingProps) => <FallbackModal />,
    ssr: false,
  }
);
// 🔸INSERT担当者
// import { InsertNewContactModal } from "./DashboardCompanyComponent/Modal/InsertNewContactModal/InsertNewContactModal";
const InsertNewContactModal = dynamic(
  () =>
    import("./DashboardCompanyComponent/Modal/InsertNewContactModal/InsertNewContactModal").then(
      (mod) => mod.InsertNewContactModal
    ),
  {
    loading: (loadingProps) => <FallbackModal />,
    ssr: false,
  }
);
// 🔸INSERT活動
// import { InsertNewActivityModal } from "./DashboardCompanyComponent/Modal/InsertNewActivityModal/InsertNewActivityModal";
const InsertNewActivityModal = dynamic(
  () =>
    import("./DashboardCompanyComponent/Modal/InsertNewActivityModal/InsertNewActivityModal").then(
      (mod) => mod.InsertNewActivityModal
    ),
  {
    loading: (loadingProps) => <FallbackModal />,
    ssr: false,
  }
);
// 🔸INSERT面談
// import { InsertNewMeetingModal } from "./DashboardCompanyComponent/Modal/InsertNewMeetingModal/InsertNewMeetingModal";
const InsertNewMeetingModal = dynamic(
  () =>
    import("./DashboardCompanyComponent/Modal/InsertNewMeetingModal/InsertNewMeetingModal").then(
      (mod) => mod.InsertNewMeetingModal
    ),
  {
    loading: (loadingProps) => <FallbackModal />,
    ssr: false,
  }
);
// 🔸INSERT案件
// import { InsertNewPropertyModal } from "./DashboardCompanyComponent/Modal/InsertNewPropertyModal/InsertNewPropertyModal";
const InsertNewPropertyModal = dynamic(
  () =>
    import("./DashboardCompanyComponent/Modal/InsertNewPropertyModal/InsertNewPropertyModal").then(
      (mod) => mod.InsertNewPropertyModal
    ),
  {
    loading: (loadingProps) => <FallbackModal />,
    ssr: false,
  }
);
// 🔸INSERT商品
// import { InsertNewProductModal } from "./DashboardCompanyComponent/Modal/SettingAccountModal/InsertNewProductModal/InsertNewProductModal";
const InsertNewProductModal = dynamic(
  () =>
    import("./DashboardCompanyComponent/Modal/SettingAccountModal/InsertNewProductModal/InsertNewProductModal").then(
      (mod) => mod.InsertNewProductModal
    ),
  {
    loading: (loadingProps) => <FallbackModal />,
    ssr: false,
  }
);

// UPDATE関連
// 🔸UPDATE会社
// import { UpdateClientCompanyModal } from "./DashboardCompanyComponent/Modal/UpdateClientCompanyModal/UpdateClientCompanyModal";
const UpdateClientCompanyModal = dynamic(
  () =>
    import("./DashboardCompanyComponent/Modal/UpdateClientCompanyModal/UpdateClientCompanyModal").then(
      (mod) => mod.UpdateClientCompanyModal
    ),
  {
    loading: (loadingProps) => <FallbackModal />,
    ssr: false,
  }
);
// 🔸UPDATE担当者
// import { UpdateContactModal } from "./DashboardCompanyComponent/Modal/UpdateContactModal/UpdateContactModal";
const UpdateContactModal = dynamic(
  () =>
    import("./DashboardCompanyComponent/Modal/UpdateContactModal/UpdateContactModal").then(
      (mod) => mod.UpdateContactModal
    ),
  {
    loading: (loadingProps) => <FallbackModal />,
    ssr: false,
  }
);
// 🔸UPDATE活動
// import { UpdateActivityModal } from "./DashboardCompanyComponent/Modal/UpdateActivityModal/UpdateActivityModal";
const UpdateActivityModal = dynamic(
  () =>
    import("./DashboardCompanyComponent/Modal/UpdateActivityModal/UpdateActivityModal").then(
      (mod) => mod.UpdateActivityModal
    ),
  {
    loading: (loadingProps) => <FallbackModal />,
    ssr: false,
  }
);
// 🔸UPDATE面談
// import { UpdateMeetingModal } from "./DashboardCompanyComponent/Modal/UpdateMeetingModal/UpdateMeetingModal";
const UpdateMeetingModal = dynamic(
  () =>
    import("./DashboardCompanyComponent/Modal/UpdateMeetingModal/UpdateMeetingModal").then(
      (mod) => mod.UpdateMeetingModal
    ),
  {
    loading: (loadingProps) => <FallbackModal />,
    ssr: false,
  }
);
// 🔸UPDATE案件
// import { UpdatePropertyModal } from "./DashboardCompanyComponent/Modal/UpdatePropertyModal/UpdatePropertyModal";
const UpdatePropertyModal = dynamic(
  () =>
    import("./DashboardCompanyComponent/Modal/UpdatePropertyModal/UpdatePropertyModal").then(
      (mod) => mod.UpdatePropertyModal
    ),
  {
    loading: (loadingProps) => <FallbackModal />,
    ssr: false,
  }
);
// 🔸UPDATE商品
// import { UpdateProductModal } from "./DashboardCompanyComponent/Modal/SettingAccountModal/UpdateProductModal/UpdateProductModal";
const UpdateProductModal = dynamic(
  () =>
    import("./DashboardCompanyComponent/Modal/SettingAccountModal/UpdateProductModal/UpdateProductModal").then(
      (mod) => mod.UpdateProductModal
    ),
  {
    loading: (loadingProps) => <FallbackModal />,
    ssr: false,
  }
);

// 他モーダル
// 🔸アカウント設定モーダル
import { SettingAccountModal } from "./DashboardCompanyComponent/Modal/SettingAccountModal/SettingAccountModal";
// const SettingAccountModal = dynamic(
//   () =>
//     import("./DashboardCompanyComponent/Modal/SettingAccountModal/SettingAccountModal").then(
//       (mod) => mod.SettingAccountModal
//     ),
//   {
//     loading: (loadingProps) => <div />,
//     ssr: false,
//   }
// );

// 🔸見積モーダル
import { QuotationPreviewModal } from "./DashboardQuotationComponent/QuotationDetail/QuotationPreviewModal/QuotationPreviewModal";

// 🔸会社詳細モーダル
// import { ClientCompanyDetailModal } from "./Modal/ClientCompanyDetailModal/ClientCompanyDetailModal";
const ClientCompanyDetailModal = dynamic(
  () => import("./Modal/ClientCompanyDetailModal/ClientCompanyDetailModal").then((mod) => mod.ClientCompanyDetailModal),
  {
    loading: (loadingProps) => <FallbackModal />,
    ssr: false,
  }
);

// ------------------------------- 動的インポート ここまで -------------------------------

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

  // ブロック対象のユーザーはprofilesテーブルのis_activeをfalseにしてブロックする
  const showBlockModalForBannedUser = !!userProfileState && userProfileState?.is_active === false;

  // サブスクプランがnullかfree_planなら初回プランモーダル表示
  const showSubscriptionPlan =
    !!userProfileState &&
    (userProfileState.subscription_plan === null || userProfileState.subscription_plan === "free_plan") &&
    userProfileState.status !== "canceled";

  // サブスク解約後のチーム所有者に表示する「メンバーシップ再開」モーダル
  const showResumeMembershipAfterCancel =
    !!userProfileState &&
    userProfileState.subscription_plan === "free_plan" &&
    userProfileState.status === "canceled" &&
    userProfileState.account_company_role === "company_owner";
  // サブスク解約後のチーム所有者以外に表示する「チームを抜けて新しく始める」モーダル
  const showRestartAfterCancelForMember =
    !!userProfileState &&
    userProfileState.subscription_plan === "free_plan" &&
    userProfileState.status === "canceled" &&
    userProfileState.account_company_role !== "company_owner";

  // 初回サブスク登録後、契約者（is_subscriberがtrue）でかつ初回ログイン時（first_time_loginがtrue）の場合、
  // 名前、チーム名、利用用途などのプロフィール情報を入力、選択するモーダル表示
  const showFirstLoginSettingUserProfileCompanyModal =
    !!userProfileState &&
    userProfileState.is_subscriber &&
    userProfileState.first_time_login &&
    userProfileState.subscription_plan !== "free_plan" &&
    !showSubscriptionPlan;

  // 招待メールでログインした際に起動 新規登録ユーザー向け
  const showFirstLoginSettingUserProfileAfterInvitation =
    !!userProfileState &&
    !userProfileState.is_subscriber &&
    userProfileState.first_time_login &&
    userProfileState.subscription_plan !== "free_plan" &&
    !showSubscriptionPlan;

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
            .eq("result", "pending");

          if (invitationError) {
            console.log(`dashboardLayout invitationsテーブルのselectエラー`, invitationError);
            throw new Error(invitationError.message);
          }

          if (data.length === 1) {
            console.log("招待データを取得 data[0]", data[0]);
            // setInvitedState(true);
            setInvitationData(data[0]);
          } else if (data.length === 0) {
            console.log("invitationsテーブルからデータ無し", data);
          } else {
            console.error("invitationsテーブルからデータ取得 1つ以上のpendingの招待有り", data);
          }
        } catch (error: any) {
          console.error(error.message);
        }
      };

      getMyInvitation();
    }
  }, [showSubscriptionPlan]);

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
    invitationData,
    "キャンセル後所有者 showResumeMembershipAfterCancel",
    showResumeMembershipAfterCancel
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
  const isOpenSidebar = useDashboardStore((state) => state.isOpenSidebar);
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
  // アカウントを増やす・減らすモーダル
  const isOpenChangeAccountCountsModal = useDashboardStore((state) => state.isOpenChangeAccountCountsModal);
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
  // 見積作成モーダル 新規作成と編集モーダル
  const isOpenInsertNewQuotationModal = useDashboardStore((state) => state.isOpenInsertNewQuotationModal);
  const isOpenUpdateQuotationModal = useDashboardStore((state) => state.isOpenUpdateQuotationModal);
  // 見積新規作成、編集モード
  const isInsertModeQuotation = useDashboardStore((state) => state.isInsertModeQuotation);
  const setIsInsertModeQuotation = useDashboardStore((state) => state.setIsInsertModeQuotation);
  const isUpdateModeQuotation = useDashboardStore((state) => state.isUpdateModeQuotation);
  const setIsUpdateModeQuotation = useDashboardStore((state) => state.setIsUpdateModeQuotation);
  const tableContainerSize = useDashboardStore((state) => state.tableContainerSize);
  // 見積書プレビューモーダル
  const isOpenQuotationPreviewModal = useDashboardStore((state) => state.isOpenQuotationPreviewModal);
  const isOpenQuotationPreviewForProfile = useDashboardStore((state) => state.isOpenQuotationPreviewForProfile);
  // 営業カレンダー編集プレビューモーダル
  const isOpenBusinessCalendarSettingModal = useDashboardStore((state) => state.isOpenBusinessCalendarSettingModal);
  const isOpenBusinessCalendarModalDisplayOnly = useDashboardStore(
    (state) => state.isOpenBusinessCalendarModalDisplayOnly
  );
  // CSVインポートモーダル
  const isOpenImportModal = useDashboardStore((state) => state.isOpenImportModal);

  // 印鑑データ設定サイドテーブル
  const isOpenSearchStampSideTable = useDashboardStore((state) => state.isOpenSearchStampSideTable);
  const isOpenSearchStampSideTableBefore = useDashboardStore((state) => state.isOpenSearchStampSideTableBefore);

  // 【お知らせの所有者変更モーダル開閉状態】
  const openNotificationChangeTeamOwnerModal = useDashboardStore((state) => state.openNotificationChangeTeamOwnerModal);
  // 【お知らせの所有者変更モーダルをクリック時にお知らせの情報を保持するState】
  const notificationDataState = useDashboardStore((state) => state.notificationDataState);

  // -------------------------------- 各画面詳細モーダル --------------------------------
  // 会社詳細画面モーダル
  const isOpenClientCompanyDetailModal = useDashboardStore((state) => state.isOpenClientCompanyDetailModal);
  // 担当者詳細画面モーダル
  const isOpenContactDetailModal = useDashboardStore((state) => state.isOpenContactDetailModal);
  // 担当者詳細画面モーダル
  const isOpenPropertyDetailModal = useDashboardStore((state) => state.isOpenPropertyDetailModal);

  // -------------------------------- SDB関連 --------------------------------

  const [hoveredThemeIcon, setHoveredThemeIcon] = useState(false);
  const hoveredThemeIconRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className={`${styles.trustify_app} relative`}>
      {/* <div className={`${styles.trustify_app} relative`} ref={layoutContainerRef}> */}
      <Head>
        <title>{title}</title>
      </Head>

      {/* <div className={`flex-center fixed inset-0 z-[5000]`}>
        <SpinnerBrand bgColor="#090909" />
      </div> */}

      {/* ============================ メインコンテンツ ============================ */}
      {/* ヘッダー */}
      <DashboardHeader />
      {/* サイドバー */}
      {/* {activeMenuTab !== "SDB" && <DashboardSidebar />} */}
      {<DashboardSidebar />}
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
      {/* {showSubscriptionPlan && (
        <div className="flex-center fixed bottom-[2%] right-[6%] z-[10000] h-[35px] w-[35px] cursor-pointer">
          <div
            className="flex-center h-[35px] w-[35px] rounded-full bg-[var(--color-sign-out-bg)] hover:bg-[var(--color-sign-out-bg-hover)]"
            onClick={handleSignOut}
            data-text="ログアウトする"
            onMouseEnter={(e) => handleOpenTooltip(e, "top")}
            onMouseLeave={handleCloseTooltip}
          >
            <IoLogOutOutline className="mr-[-3px] text-[20px] text-[#fff]" />
          </div>
        </div>
      )} */}
      {/* {showSubscriptionPlan && (
        <div className="flex-center fixed bottom-[2%] right-[6%] z-[10000] h-[35px] w-[35px] cursor-pointer">
          <div className="h-[35px] w-[35px] rounded-full bg-[#00000030]" onClick={handleSignOut}></div>
        </div>
      )} */}
      {/* テーマ切り替えボタン */}
      <div
        // className={`flex-center transition-base01 fixed bottom-[2%] right-[2%] z-[10000] h-[35px] w-[35px] cursor-pointer rounded-full ${
        //   theme === "dark"
        //     ? "bg-[--color-bg-brand05] hover:bg-[--color-bg-brand-f]"
        //     : "bg-[var(--color-bg-brand-fc0)] hover:bg-[var(--color-bg-brand-f)]"
        // }`}
        className={`flex-center transition-base01 theme_icon_bg_dashboard fixed bottom-[2%] right-[2%] z-[10000] h-[35px] w-[35px] cursor-pointer rounded-full`}
        onClick={changeTheme}
        onMouseEnter={() => hoveredThemeIconRef.current?.classList.add(`${styles.active}`)}
        onMouseLeave={() => hoveredThemeIconRef.current?.classList.remove(`${styles.active}`)}
      >
        <div className="theme_icon_bg_hover"></div>
        {theme === "light" && <MdOutlineLightMode className="pointer-events-none z-10 text-[20px] text-[#fff]" />}
        {theme === "dark" && <MdOutlineDarkMode className="pointer-events-none z-10 text-[20px] text-[#fff]" />}
        {/* ツールチップ */}
        {/* {hoveredThemeIcon && (
          <div className={`${styles.tooltip_right_area} fade`}>
            <div className={`${styles.tooltip_right} `}>
              <div className={`flex-center ${styles.dropdown_item}`}>
                {theme === "light" ? "ダークモードに切り替え" : "ライトモードに切り替え"}
              </div>
            </div>
            <div className={`${styles.tooltip_right_arrow}`}></div>
          </div>
        )} */}
        <div ref={hoveredThemeIconRef} className={`${styles.tooltip_right_area} fade`}>
          <div className={`${styles.tooltip_right} `}>
            <div className={`flex-center ${styles.dropdown_item}`}>
              {theme === "light" ? "ダークモードに切り替え" : "ライトモードに切り替え"}
            </div>
          </div>
          <div className={`${styles.tooltip_right_arrow}`}></div>
        </div>
        {/* ツールチップ ここまで */}
      </div>

      {/* ==================== BANにしたユーザー向けブロックモーダル ==================== */}
      {/* !!userProfileState && userProfileState?.is_active === false */}
      {showBlockModalForBannedUser && <BlockModal />}
      {/* ============== 初回サブスクプランモーダルコンポーネント 他チームからの招待無しの場合 ============== */}
      {/* 初回ログイン 招待無し */}
      {showSubscriptionPlan && !invitationData && <SubscriptionPlanModalForFreeUser />}
      {/* <SubscriptionPlanModalForFreeUser /> */}
      {/* ============== 既にログイン済みで他チームからの招待有りの場合の初回サブスクプランモーダルコンポーネント ============== */}
      {/* 初回ログイン 招待有り */}
      {showSubscriptionPlan && invitationData && (
        <InvitationForLoggedInUser invitationData={invitationData} setInvitationData={setInvitationData} />
      )}

      {/* ============================ 契約者用初回モーダルコンポーネント ============================ */}
      {/* 契約者用 初回契約した後のユーザー、会社情報入力用 */}
      {showFirstLoginSettingUserProfileCompanyModal && <FirstLoginSettingUserProfileCompanyModal />}
      {/* <FirstLoginSettingUserProfileCompanyModal /> */}
      {/* ============================ 招待者用初回モーダルコンポーネント ============================ */}
      {/* 招待によって既に契約ずみアカウントに紐付けされていて招待メールで初めてログインした用 */}
      {showFirstLoginSettingUserProfileAfterInvitation && <FirstLoginSettingUserProfileAfterInvitationModal />}
      {/* <FirstLoginSettingUserProfileAfterInvitationModal /> */}

      {/* ============================ サブスク解約後に表示するコンポーネント ============================ */}
      {/* チーム所有者、契約者に表示する「メンバーシップを再開しますか？」モーダル */}
      {/* {showResumeMembershipAfterCancel && <ResumeMembershipAfterCancel />} */}
      {showResumeMembershipAfterCancel && (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<FallbackResumeMembershipAfterCancel />}>
            <ResumeMembershipAfterCancel />
          </Suspense>
        </ErrorBoundary>
      )}
      {/* 解約後のメンバーに表示するモーダル */}
      {/* {showResumeMembershipAfterCancel && <FallbackResumeMembershipAfterCancel />} */}
      {showRestartAfterCancelForMember && (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<FallbackResumeMembershipAfterCancel />}>
            <RestartAfterCancelForMember />
          </Suspense>
        </ErrorBoundary>
      )}
      {/* {showRestartAfterCancelForMember && <FallbackResumeMembershipAfterCancel />} */}

      {/* ============================ 共通UIコンポーネント ============================ */}
      {/* モーダル */}
      {isOpenEditModal && <EditModal />}

      {/* ツールチップ */}
      {hoveredItemPos && <Tooltip />}
      {hoveredItemPosHorizon && <TooltipBlur />}
      {hoveredItemPosWrap && <TooltipWrap />}
      {/* {hoveredItemPosModal && <TooltipModal />} */}

      {/* カラム編集モーダル */}
      {/* {isOpenEditColumns && <EditColumns />} */}

      {/* サイズ切り替えメニュー */}
      {clickedItemPos && <ChangeSizeMenu />}

      {/* アカウント設定モーダル */}
      {isOpenSettingAccountModal && <SettingAccountModal />}

      {/* サイドテーブル 印鑑データ */}
      {/* 「自社担当」変更サイドテーブル */}
      {isOpenSearchStampSideTableBefore && (
        <div
          className={`fixed inset-0 z-[5000] bg-[#ffffff00] ${isOpenSearchStampSideTable ? `` : `pointer-events-none`}`}
        >
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense
              fallback={
                <FallbackSideTableSearchSignatureStamp isOpenSearchStampSideTable={isOpenSearchStampSideTable} />
              }
            >
              <SideTableSearchSignatureStamp
                isOpenSearchStampSideTable={isOpenSearchStampSideTable}
                // setIsOpenSearchStampSideTable={setIsOpenSearchStampSideTable}
                isOpenSearchStampSideTableBefore={isOpenSearchStampSideTableBefore}
                // setIsOpenSearchStampSideTableBefore={setIsOpenSearchStampSideTableBefore}
                // prevStampObj={prevStampObj}
                // setPrevStampObj={setPrevStampObj}
                // stampObj={stampObj}
                // setStampObj={setStampObj}
                // searchSignatureStamp={sideTableState !== "author" ? true : false}
              />
            </Suspense>
          </ErrorBoundary>
        </div>
      )}
      {/* <FallbackSideTableSearchSignatureStamp isOpenSearchStampSideTable={isOpenSearchStampSideTable} /> */}

      {/* 製品_追加・編集モーダル */}
      {isOpenInsertNewProductModal && <InsertNewProductModal />}
      {isOpenUpdateProductModal && <UpdateProductModal />}
      {/* 招待メールモーダル */}
      {isOpenSettingInvitationModal && <SettingInvitationModal />}
      {/* アカウントを増やすモーダル */}
      {isOpenChangeAccountCountsModal === "increase" && (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<FallbackIncreaseAccountCountsModal />}>
            <IncreaseAccountCountsModal />
          </Suspense>
        </ErrorBoundary>
      )}
      {/* {isOpenChangeAccountCountsModal === "increase" && <FallbackIncreaseAccountCountsModal />} */}
      {/* アカウントを減らすモーダル */}
      {isOpenChangeAccountCountsModal === "decrease" && (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<FallbackDecreaseAccountCountsModal />}>
            <DecreaseAccountCountsModal />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* 会社_作成・編集モーダル */}
      {isOpenInsertNewClientCompanyModal && (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<FallbackModal />}>
            <InsertNewClientCompanyModal />
          </Suspense>
        </ErrorBoundary>
      )}
      {isOpenUpdateClientCompanyModal && (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<FallbackModal />}>
            <UpdateClientCompanyModal />
          </Suspense>
        </ErrorBoundary>
      )}
      {/* {isOpenUpdateClientCompanyModal && <UpdateClientCompanyModal />} */}

      {/* 担当者_作成・編集モーダル */}
      {/* {isOpenInsertNewContactModal && <InsertNewContactModal />}
      {isOpenUpdateContactModal && <UpdateContactModal />} */}
      {isOpenInsertNewContactModal && (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<FallbackModal />}>
            <InsertNewContactModal />
          </Suspense>
        </ErrorBoundary>
      )}
      {isOpenUpdateContactModal && (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<FallbackModal />}>
            <UpdateContactModal />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* 活動_作成・編集モーダル */}
      {/* {isOpenInsertNewActivityModal && <InsertNewActivityModal />}
      {isOpenUpdateActivityModal && <UpdateActivityModal />} */}
      {isOpenInsertNewActivityModal && (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<FallbackModal />}>
            <InsertNewActivityModal />
          </Suspense>
        </ErrorBoundary>
      )}
      {isOpenUpdateActivityModal && (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<FallbackModal />}>
            <UpdateActivityModal />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* 面談_作成・編集モーダル */}
      {/* {isOpenInsertNewMeetingModal && <InsertNewMeetingModal />} */}
      {/* {isOpenInsertNewMeetingModal && <FallbackModal />} */}
      {isOpenInsertNewMeetingModal && (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<FallbackModal />}>
            <InsertNewMeetingModal />
          </Suspense>
        </ErrorBoundary>
      )}
      {isOpenUpdateMeetingModal && (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<FallbackModal />}>
            <UpdateMeetingModal />
          </Suspense>
        </ErrorBoundary>
      )}
      {/* {isOpenUpdateMeetingModal && <UpdateMeetingModal />} */}
      {/* {isOpenInsertNewMeetingModal && <FallbackModal />} */}
      {/* 案件_作成・編集モーダル */}
      {/* {isOpenInsertNewPropertyModal && <InsertNewPropertyModal />} */}

      {isOpenInsertNewPropertyModal && (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<FallbackModal />}>
            <InsertNewPropertyModal />
          </Suspense>
        </ErrorBoundary>
      )}
      {isOpenUpdatePropertyModal && (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<FallbackModal />}>
            <UpdatePropertyModal />
          </Suspense>
        </ErrorBoundary>
      )}
      {/* <Fallback className="min-h-[calc(100vh/3-var(--header-height)/3)]" /> */}

      {/* 見積_作成・編集モーダル */}
      {/* {isOpenInsertNewQuotationModal && (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<FallbackModal />}>
            <InsertNewQuotationModal />
          </Suspense>
        </ErrorBoundary>
      )} */}
      {/* {isOpenUpdateQuotationModal && (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<FallbackModal />}>
            <UpdateQuotationModal />
          </Suspense>
        </ErrorBoundary>
      )} */}
      {/* 見積_作成・編集モード中のオーバーレイ */}
      {(isInsertModeQuotation || isUpdateModeQuotation) && (
        <>
          <div
            // className={`is_upsert_overlay_top ${tableContainerSize === "half" && `medium`} ${
            //   tableContainerSize === "all" && `large`
            // }`}
            className={`is_upsert_overlay_top`}
            onClick={() => {
              if (isInsertModeQuotation) setIsInsertModeQuotation(false);
              if (isUpdateModeQuotation) setIsUpdateModeQuotation(false);
            }}
          ></div>
          <div
            className={`is_upsert_overlay_left ${isOpenSidebar ? `open` : `mini`}`}
            onClick={() => {
              if (isInsertModeQuotation) setIsInsertModeQuotation(false);
              if (isUpdateModeQuotation) setIsUpdateModeQuotation(false);
            }}
          ></div>
        </>
      )}
      {/* <Fallback className="min-h-[calc(100vh/3-var(--header-height)/3)]" /> */}

      {/* 見積書プレビューモーダル */}
      {isOpenQuotationPreviewModal && (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<Fallback className="min-h-[calc(100vh/3-var(--header-height)/3)]" />}>
            <QuotationPreviewModal />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* プロフィール反映確認用見積書プレビューモーダル */}
      {isOpenQuotationPreviewForProfile && <QuotationPreviewForProfile />}

      {/* 営業カレンダー編集プレビューモーダル */}
      {isOpenBusinessCalendarSettingModal && (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<FallbackBusinessCalendarModal />}>
            <BusinessCalendarModal />
          </Suspense>
        </ErrorBoundary>
      )}
      {/* <FallbackBusinessCalendarModal /> */}

      {/* 営業カレンダーディスプレイ用プレビューモーダル */}
      {isOpenBusinessCalendarModalDisplayOnly && (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<FallbackBusinessCalendarModal />}>
            <BusinessCalendarModalDisplayOnly />
          </Suspense>
        </ErrorBoundary>
      )}
      {/* {isOpenBusinessCalendarSettingModal && <FallbackBusinessCalendarModal />} */}

      {/* CSVインポートモーダル */}
      {isOpenImportModal && (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<div />}>
            <ImportModal />
          </Suspense>
        </ErrorBoundary>
      )}
      {/* {isOpenBusinessCalendarSettingModal && <FallbackBusinessCalendarModal />} */}

      {/* --------------------------- 各画面詳細モーダル --------------------------- */}
      {/* 会社 詳細モーダル */}
      {isOpenClientCompanyDetailModal && (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<FallbackModal />}>
            <ClientCompanyDetailModal />
          </Suspense>
        </ErrorBoundary>
      )}
      {/* 担当者 詳細モーダル */}
      {isOpenContactDetailModal && (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<FallbackModal />}>
            <ContactDetailModal />
          </Suspense>
        </ErrorBoundary>
      )}
      {/* 案件 詳細モーダル ネタ表から */}
      {isOpenPropertyDetailModal && (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<FallbackModal />}>
            <DetailPropertyModal />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* --------------------------- SDB関連 --------------------------- */}

      {/* ==================== お知らせ所有者変更モーダル ==================== */}
      {openNotificationChangeTeamOwnerModal && notificationDataState !== null && <ChangeTeamOwnerConfirmationModal />}
      {/* {isOpenUpdatePropertyModal && <UpdateMeetingModal />} */}
    </div>
  );
};
