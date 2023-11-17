import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import { TooltipModal } from "@/components/Parts/Tooltip/TooltipModal";
import useStore from "@/store";
import useDashboardStore from "@/store/useDashboardStore";
import useRootStore from "@/store/useRootStore";
import useThemeStore from "@/store/useThemeStore";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { memo, useEffect, useRef, useState } from "react";
import { IoLogOutOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import styles from "./ResumeMembershipAfterCancel.module.css";
import { BsCheck2 } from "react-icons/bs";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { FiArrowLeft } from "react-icons/fi";
import { loadStripe } from "@stripe/stripe-js";
import Stripe from "stripe";
import { FallbackResumeMembershipAfterCancel } from "./FallbackResumeMembershipAfterCancel";
import { runFireworks } from "@/utils/confetti";
import { MemberAccounts, UserProfileCompanySubscription } from "@/types";
import { useQueryMemberAccounts } from "@/hooks/useQueryMemberAccounts";
import { compareAccounts } from "@/utils/Helpers/getRoleRank";
import { HiOutlineSearch } from "react-icons/hi";
import { MdClose } from "react-icons/md";
import { MemberCard } from "./MemberCard";
import { normalizeDeleteSpace } from "@/utils/Helpers/normalizeDeleteSpace";
import { teamIllustration } from "@/components/assets";
import { isValidUUIDv4 } from "@/utils/Helpers/uuidHelpers";

type Plans = {
  id: string;
  name: string;
  price: number;
  interval: string;
  currency: string;
};

const ResumeMembershipAfterCancelMemo = () => {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const sessionState = useStore((state) => state.sessionState);
  const theme = useRootStore(useThemeStore, (state) => state.theme);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const setUserProfileState = useDashboardStore((state) => state.setUserProfileState);
  // ローディング
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  // ステップ 再開するか、チーム削除して新しく作るか
  const [resumeStep, setResumeStep] = useState("");
  // プラン選択、決済手段選択ステップ
  const [stepContents, setStepContents] = useState("");
  // 契約メンバーアカウント数、メンバー人数
  const [accountQuantity, setAccountQuantity] = useState<number | null>(1);
  const [selectedRadioButton, setSelectedRadioButton] = useState("business_plan");
  const [planBusiness, setPlanBusiness] = useState<Plans | null>(null);
  const [planPremium, setPlanPremium] = useState<Plans | null>(null);
  // ユーザーのデフォルトの支払い方法
  // const [defaultPaymentMethod, setDefaultPaymentMethod] = useState(null);
  const defaultPaymentMethodState = useDashboardStore((state) => state.defaultPaymentMethodState);
  const setDefaultPaymentMethodState = useDashboardStore((state) => state.setDefaultPaymentMethodState);
  // メンバー検索入力値
  const [input, setInput] = useState("");
  // メンバー削除が必要かどうかを保持するState
  const [requiredDeletionMemberAccounts, setRequiredDeletionMemberAccounts] = useState(true);
  // 未設定アカウントの削除が必要かどうかを保持するState(メンバーアカウントより先に未設定アカウントを削除する)
  // const [isRequiredDeletion, setIsRequiredDeletion] = useState(true);

  // ================================ ツールチップ ================================
  const modalContainerRef = useRef<HTMLDivElement | null>(null);
  const hoveredItemPosModal = useStore((state) => state.hoveredItemPosModal);
  const setHoveredItemPosModal = useStore((state) => state.setHoveredItemPosModal);
  const handleOpenTooltip = (e: React.MouseEvent<HTMLElement, MouseEvent>, display: string) => {
    // モーダルコンテナのleftを取得する
    if (!modalContainerRef.current) return;
    const containerLeft = modalContainerRef.current?.getBoundingClientRect().left;
    const containerTop = modalContainerRef.current?.getBoundingClientRect().top;
    // ホバーしたアイテムにツールチップを表示
    const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
    // console.log("ツールチップx, y width , height", x, y, width, height);
    const content2 = ((e.target as HTMLDivElement).dataset.text2 as string)
      ? ((e.target as HTMLDivElement).dataset.text2 as string)
      : "";
    const content3 = ((e.target as HTMLDivElement).dataset.text3 as string)
      ? ((e.target as HTMLDivElement).dataset.text3 as string)
      : "";
    setHoveredItemPosModal({
      x: x - containerLeft,
      y: y - containerTop,
      itemWidth: width,
      itemHeight: height,
      content: (e.target as HTMLDivElement).dataset.text as string,
      content2: content2,
      content3: content3,
      display: display,
    });
  };
  // ============================================================================================
  // ================================ ツールチップを非表示 ================================
  const handleCloseTooltip = () => {
    setHoveredItemPosModal(null);
  };
  // ============================================================================================

  // ============================ メンバーアカウントを全て取得 ============================
  // 未設定アカウントを保持するグローバルState
  // const notSetAccounts = useDashboardStore((state) => state.notSetAccounts);
  // const setNotSetAccounts = useDashboardStore((state) => state.setNotSetAccounts);
  const {
    data: AccountsDataArray,
    error: useQueryError,
    isLoading: useQueryIsLoading,
    refetch: refetchMemberAccounts,
  } = useQueryMemberAccounts();

  // メンバー数分チェックするStateの配列
  // const [checkedMembersArray, setCheckedMembersArray] = useState(
  //   AccountsDataArray
  //     ? Array(!!AccountsDataArray.length ? AccountsDataArray.length : 1).fill(false)
  //     : []
  // );
  // 選択される削除メンバーの配列Zustand
  const selectedMembersArrayForDeletion = useDashboardStore((state) => state.selectedMembersArrayForDeletion);
  const setSelectedMembersArrayForDeletion = useDashboardStore((state) => state.setSelectedMembersArrayForDeletion);
  // チェックされたメンバーを保持する配列のState
  // const [selectedMemberArray, setSelectedMemberArray] = useState<MemberAccounts[]>([]);
  // 並び替え後
  const [sortedAccountsState, setSortedAccountsState] = useState<MemberAccounts[]>([]);
  // 未設定
  const [notSetAccountsState, setNotSetAccountsState] = useState<MemberAccounts[]>([]);
  // 設定済みでアクティブ
  const [memberAccountsState, setMemberAccountsState] = useState<MemberAccounts[]>([]);

  useEffect(() => {
    if (typeof AccountsDataArray === "undefined") return;
    if (!AccountsDataArray) {
      setNotSetAccountsState([]);
      setMemberAccountsState([]);
      return;
    }
    // アカウントの配列からprofilesのidがnull、かつ、invited_emailがnullで招待中でないアカウントのみをフィルタリング
    const nullIdAccounts = AccountsDataArray.filter((account) => account.id === null);
    // // アカウントの配列からprofilesテーブルのidがnullでないアカウントのみをフィルタリング つまりメンバーアカウント
    const notNullIdAccounts = AccountsDataArray.filter((account) => account.id !== null);

    // メンバーアカウントを並び替え 全てのセクションであいうえお順
    // 1番上が所有者: account_company_role
    // 次が管理者: account_company_role
    // マネージャー: account_company_role
    // メンバー: account_company_role
    // ゲスト: account_company_role
    // 招待済み: id有りだが、profile_name無し
    // 未設定: id有りだが、profile_name無し

    const sortedAccountsArray = AccountsDataArray.sort(compareAccounts);
    setNotSetAccountsState(sortedAccountsArray);

    console.log(
      "sortedAccountsArray",
      sortedAccountsArray,
      "未設定のアカウント配列",
      nullIdAccounts,
      "アクティブアカウント配列",
      notNullIdAccounts,
      "未設定のアクティブアカウント数",
      nullIdAccounts.length,
      "未設定のアクティブアカウント数",
      notNullIdAccounts.length
    );

    // 未設定アカウントローカルState
    setNotSetAccountsState(nullIdAccounts);
    // アクティブアカウントローカルState
    setMemberAccountsState(notNullIdAccounts);
  }, [AccountsDataArray]);

  // メンバーの削除が必要かどうかの紐付け
  // 契約メンバーアカウント数が設定済みアカウント数より低い場合にはメンバー削除ページを表示する
  useEffect(() => {
    if (memberAccountsState.length === 0 || accountQuantity === null) return;
    // 前回の紐付け済みメンバーアカウントが、今回の契約数+未設定アカウント数の合計より多いなら
    if (memberAccountsState.length > accountQuantity) {
      if (requiredDeletionMemberAccounts) return;
      console.log(
        "メンバー削除必要に切り替え 前回アクティブアカウント数と契約数",
        memberAccountsState.length,
        accountQuantity
      );
      setRequiredDeletionMemberAccounts(true);
    } else {
      if (!requiredDeletionMemberAccounts) return;
      console.log(
        "メンバー削除不要に切り替え 前回アクティブアカウント数と契約数",
        memberAccountsState.length,
        accountQuantity
      );
      setRequiredDeletionMemberAccounts(false);
      setSelectedMembersArrayForDeletion([]);
      console.log("メンバー削除不要のため、選択中の削除対象メンバーの配列を空でリセット");
    }
  }, [accountQuantity, memberAccountsState.length]);

  // ============================ ログアウト関数 ============================
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
        // theme: `${theme === "light" ? "light" : "dark"}`,
      });
    }
  };

  // 🌟初回マウント時にStripeのプラン2つのpriceIdを取得する
  useEffect(() => {
    if (!sessionState) return console.log("sessionStateなしのためリターン", sessionState);
    if (!!planBusiness && !!planPremium) return console.log("既にStripeプラン取得済みのためリターン");
    const getPlansFromStripe = async () => {
      console.log("getPlansFromStripe実行");
      const {
        data: { plans, error },
      } = await axios.get("/api/get-stripe-plans", {
        headers: {
          Authorization: `Bearer ${sessionState.access_token}`,
        },
      });
      console.log(
        "SubscriptionPlanModalForFreeUserコンポーネント初回マウント useEffectでgetPlansFromStripe実行 取得したplans",
        plans,
        error
      );
      setPlanBusiness(plans[0]);
      setPlanPremium(plans[1]);
    };

    getPlansFromStripe();
  }, [sessionState]);

  // 🌟初回マウント時にStripeの現在のデフォルト支払い方法を取得する
  useEffect(() => {
    if (!sessionState) return console.log("sessionStateなしのためリターン", sessionState);
    if (!userProfileState) return console.log("ユーザー情報なしのためリターン");
    if (!!defaultPaymentMethodState) return console.log("既にデフォルト支払い方法を取得済み");

    const getPaymentMethodFromStripe = async () => {
      if (!userProfileState) return console.log("ユーザー情報なしのためリターン");
      console.log("getPlansFromStripe実行");

      try {
        const payload = {
          stripeCustomerId: userProfileState.subscription_stripe_customer_id,
          stripeSubscriptionId: userProfileState.stripe_subscription_id,
        };
        console.log("axios.post()でAPIルートretrieve-payment-methodへリクエスト 引数のpayload", payload);
        const {
          data: { data: paymentMethod, error: paymentMethodError },
        } = await axios.post(`/api/retrieve-payment-method`, payload, {
          headers: {
            Authorization: `Bearer ${sessionState.access_token}`,
          },
        });
        if (paymentMethodError) {
          console.error("支払い方法の取得に失敗 エラーオブジェクト", paymentMethodError);
          throw new Error(paymentMethodError.message);
        }
        console.log("支払い方法の取得に成功 paymentMethod", paymentMethod);
        setDefaultPaymentMethodState(paymentMethod);
      } catch (e: any) {
        console.error("支払い方法の取得に失敗 エラーオブジェクト", e);
      }
    };

    getPaymentMethodFromStripe();
  }, [sessionState]);

  // ラジオボタン切り替え用state
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedRadioButton(e.target.value);
  };

  // =============== 🌟「再開する」クリック メンバーシップを再開 ===============
  // 🔹チームからメンバー削除も実行するパターン(requiredDeletionMemberAccountsがtrueの場合)
  // 🔹チームからメンバー削除は不要なパターン(requiredDeletionMemberAccountsがfalseの場合)
  // 新たなstripeサブスクリプションオブジェクトを作成
  // そのサブスクリプションidを既存のsubscriptionsテーブルのstripe_subscription_idにセットする
  // これで、他メンバーに紐付けいているアカウントをそのまま引き継げる
  // const [isLoadingResume, setIsLoadingResume] = useState(false);
  const handleResume = async (planId: string | undefined, quantity: number | null) => {
    if (!planId) return alert("エラー：プランデータが見つかりませんでした");
    if (!userProfileState) return alert("エラー：ユーザー情報が確認できませんでした");
    if (!sessionState) return alert("エラー：セッション情報が確認できませんでした");
    if (!accountQuantity) return alert("メンバーの人数を入力してください");
    if (!AccountsDataArray) return alert("エラー：メンバー情報が見つかりませんでした");
    setIsLoadingSubmit(true);

    try {
      // requiredDeletionMemberAccountsとselectedMembersForDeletionも渡して、APIルート側でrequiredDeletionMemberAccountsのbool値によってメンバー削除の可否をハンドリングする
      let deletedMemberProfileIds_SubscribedAccountIdsArray;
      if (requiredDeletionMemberAccounts) {
        deletedMemberProfileIds_SubscribedAccountIdsArray = selectedMembersArrayForDeletion.map((member) => ({
          id: member.id,
          subscribed_account_id: member.subscribed_account_id ? member.subscribed_account_id : "",
        }));
        // every()で全てUUIDかチェックし、trueでOKならnot演算子でfalseにし、チェックがNGなら!でtrueにしリターンさせる
        if (
          !deletedMemberProfileIds_SubscribedAccountIdsArray.every(
            (obj) =>
              obj.id && isValidUUIDv4(obj.id) && obj.subscribed_account_id && isValidUUIDv4(obj.subscribed_account_id)
          )
        ) {
          setIsLoadingSubmit(false);
          return console.error("UUIDのチェック結果 UUIDではない値が含まれているためリターン");
        }
        console.log(
          "🌟Stripeメンバーシップ再開ステップ0 削除するメンバーのアカウントIDの配列を全てUUIDチェック完了",
          deletedMemberProfileIds_SubscribedAccountIdsArray
        );
      }

      const payload = {
        stripeCustomerId: userProfileState.stripe_customer_id,
        planId: planId,
        quantity: quantity,
        companyId: userProfileState.company_id,
        dbSubscriptionId: userProfileState.subscription_id,
        paymentMethodId: defaultPaymentMethodState.id,
        isRequiredDeletionMemberAccounts: requiredDeletionMemberAccounts, // APIルートでメンバー削除が必要かどうか
        deletedMemberProfileIds_SubscribedAccountIdsArray: deletedMemberProfileIds_SubscribedAccountIdsArray, // APIルートでメンバー削除が必要かどうか
        deletedNotSetAccountQuantity: deletedNotSetAccountQuantity, // 削除が必要な余分な未設定アカウント数量
        isRequiredCreate: isRequiredCreate, // 新たにアカウント作成が必要かどうか
        requiredNewCountToCreate: requiredNewCountToCreate, // 新たに作成が必要なアカウント数
      };
      console.log("axios.postに渡すpayload", payload);
      const {
        data: { data: newSubscription, error: axiosStripeError },
      } = await axios.post(`/api/subscription/resume-subscription`, payload, {
        headers: {
          Authorization: `Bearer ${sessionState.access_token}`,
        },
      });
      console.log(
        `🌟Stripeサブスク再開ステップ9 Apiからのdata newSubscription`,
        newSubscription,
        "axiosStripeError",
        axiosStripeError
      );
      if (axiosStripeError) throw new Error(axiosStripeError.message);
      setTimeout(() => {
        // toast.success(`メンバーシップの登録が完了しました！ おかえりなさい。TRUSTiFYへようこそ！`, {
        //   position: "top-right",
        //   autoClose: 5000,
        //   hideProgressBar: false,
        //   closeOnClick: true,
        //   pauseOnHover: true,
        //   draggable: true,
        //   progress: undefined,
        // });
        runFireworks();
        // router.reload();
      }, 300);
    } catch (e: any) {
      console.error("サブスク再開エラー", e);
      alert(`エラーが発生しました: ${e.message}`);
      setIsLoadingSubmit(false);
    }
  };

  // Stripeポータルへ移行させるためのURLをAPIルートにGETリクエスト
  // APIルートからurlを取得したらrouter.push()でStipeカスタマーポータルへページ遷移
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const loadPortal = async () => {
    setIsLoadingPortal(true);
    try {
      const { data } = await axios.get("/api/portal", {
        headers: {
          Authorization: `Bearer ${sessionState.access_token}`,
        },
      });
      console.log("stripe billingPortalのurlを取得成功", data);
      router.push(data.url);
      //   setIsLoadingPortal(false);
    } catch (e: any) {
      setIsLoadingPortal(false);
      alert(`エラーが発生しました: ${e.message}`);
    }
  };

  // =============== 🌟「チームを削除して新しく始める」ボタン ===============
  //  サブスク、会社、アカウントの紐付けを解除、profilesの情報もリセットして新たに始める
  const [isLoadingReset, setIsLoadingReset] = useState(false);
  const handleResetStart = async () => {
    if (isLoadingReset) return;
    if (!userProfileState) return;
    setIsLoadingReset(true);

    // 1. subscribed_accountsテーブルのデータをdeleted_customersテーブルに移して、
    //    後から事業者側が確認できる状態にする
    // 2. subscribed_accountsテーブルを削除する
    // 3. profilesテーブルの情報をメールアドレス以外nullに更新し、first_time_loginをtrueに更新して最初プラン選択画面が表示されるようにする 残すのはidとemailとstripe_customer_idとprofile_nameのみ、is_subscriber: false, first_time_login: true
    // archive_and_reset_user_profileプロシージャを実行して、1,2,3の一連の処理をトランザクションとして実行
    try {
      // archive_and_reset_user_profileプロシージャに渡すパラメータ
      const payload = {
        _deleted_user_id: userProfileState.id,
        _company_id: userProfileState.company_id,
        _subscription_id: userProfileState.subscription_id,
        _profile_name: userProfileState.profile_name,
        _email: userProfileState.email,
        _department: userProfileState.department,
        _position_name: userProfileState.position_name,
        _company_cell_phone: userProfileState.company_cell_phone,
        _personal_cell_phone: userProfileState.personal_cell_phone,
        _occupation: userProfileState.occupation,
        _office: userProfileState.office,
        _unit: userProfileState.unit,
        _position_class: userProfileState.position_class,
      };
      console.log("archive_and_reset_user_profileプロシージャを実行 rpcに渡すpayload", payload);
      // PROCEDUREはデータをリターンしないため、成功した場合にはdataとerror共にnullになり、
      // エラーが発生した場合には、errorにエラーオブジェクトが入る
      const { data: newUserData, error } = await supabase.rpc("archive_and_reset_user_profile", payload);

      if (error) {
        // エラーオブジェクト全体を再スローする throw new Error(error.message)はメッセージのみ引き継ぐ
        throw error;
      }
      console.log("archive_and_reset_user_profile関数成功 リセット後のユーザーデータ", newUserData[0]);

      // ZustandのStateを更新
      setUserProfileState(newUserData[0] as UserProfileCompanySubscription);

      toast.success(`チームの削除とデータのリセットが完了しました! リスタートを始めます。`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      if (
        (newUserData[0] as UserProfileCompanySubscription).subscription_plan === null ||
        (newUserData[0] as UserProfileCompanySubscription).subscription_plan === "free_plan"
      ) {
        setTimeout(() => {
          router.reload();
        }, 200);
      }

      // const { data: userProfile, error: getUserDataError } = await supabase
      //   .rpc("get_user_data", { _user_id: userProfileState.id })
      //   .single();

      // if (userProfile) console.log("🌟/homeサーバーサイド userProfileあり");
      // if (getUserDataError) console.log("🌟/homeサーバーサイド errorあり", error);
    } catch (e: any) {
      console.error(`archive_and_reset_user_profileプロシージャエラー`, e);
      toast.error(`チームの削除とデータのリセットに失敗しました!`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
    setIsLoadingReset(false);
  };

  // カードブランドURL
  const cardBrandURL = () => {
    switch (defaultPaymentMethodState.card.brand) {
      case "visa":
        return "/assets/images/icons/cards/icons8-visa-60.png";

      case "amex":
        return "/assets/images/icons/cards/icons8-american-express-48.png";
      // return "/assets/images/icons/cards/AXP_BlueBoxLogo_Alternate_SMALLscale_RGB_DIGITAL_80x80.png";

      case "diners":
        return "/assets/images/icons/cards/icons8-diners-club-48.png";

      case "discover":
        return "/assets/images/icons/cards/icons8-discover-card.png";

      case "jcb":
        return "/assets/images/icons/cards/icons8-jcb-48.png";

      case "mastercard":
        return "/assets/images/icons/cards/icons8-mastercard-incorporated-an-american-multinational-financial-services-corporation-48.png";

      case "unionpay":
        return "/assets/images/icons/cards/icons8-unionpay-48.png";

      default:
        return "/assets/images/icons/cards/icons8-credit-card-48.png";
        break;
    }
  };

  const rightImage = () => {
    switch (stepContents) {
      case "":
        return `/assets/images/beautiful/balloon1.jpg`;
        break;
      case "resume_2":
        // return `/assets/images/beautiful/road-sun1.jpg`;
        return `/assets/images/beautiful/ocean2.jpg`;
        // return `/assets/images/beautiful/balloon1.jpg`;
        break;
      case "resume_3":
        return `/assets/images/beautiful/firework6.jpg`;
        break;

      default:
        return `/assets/images/beautiful/balloon1.jpg`;
        break;
    }
  };
  const rightImagePlaceholder = () => {
    switch (stepContents) {
      case "":
        return `/assets/images/beautiful/placeholders/balloon1_placeholder.jpg`;
        break;
      case "resume_2":
        // return `/assets/images/beautiful/placeholders/road-sun1_placeholder.jpg`;
        return `/assets/images/beautiful/placeholders/ocean2_placeholder.jpg`;
        // return `/assets/images/beautiful/placeholders/balloon1_placeholder.jpg`;
        break;
      case "resume_3":
        return `/assets/images/beautiful/placeholders/firework6_placeholder.jpg`;
        break;

      default:
        return `/assets/images/beautiful/placeholders/balloon1_placeholder.jpg`;
        break;
    }
  };

  // 削除が必要かどうか（先に未設定アカウントを削除するため、未設定アカウントの削除が必要かどうか）
  // const isRequiredDeletion = memberAccountsState.length > accountQuantity;
  // 残り削除が必要な人数(メンバーシップ再開にあたり)
  const lackAccountCount =
    !!memberAccountsState.length && !!accountQuantity ? memberAccountsState.length - accountQuantity : 0;
  // 削除する未設定アカウント数(余分な数) = 前回の契約アカウント数 - メンバーアカウント削除数 - 今回の契約数(メンバーシップ再開にあたり)
  const deletedNotSetAccountQuantity =
    !!AccountsDataArray && !!accountQuantity
      ? AccountsDataArray.length - selectedMembersArrayForDeletion.length - accountQuantity
      : null;
  // 新たにアカウント作成が必要かどうか
  const isRequiredCreate =
    !!accountQuantity &&
    !!AccountsDataArray &&
    !!AccountsDataArray.length &&
    accountQuantity - AccountsDataArray?.length > 0;
  // 新たに作成が必要な個数(メンバーシップ再開にあたり)
  const requiredNewCountToCreate =
    !!AccountsDataArray && !!AccountsDataArray.length && !!accountQuantity
      ? accountQuantity - AccountsDataArray.length
      : null;
  // 新たに何個作成が必要か
  // const requiredCreateCount =
  //   !!accountQuantity &&
  //   !!AccountsDataArray &&
  //   !!AccountsDataArray.length &&
  //   accountQuantity - AccountsDataArray?.length > 0
  //     ? `${accountQuantity - AccountsDataArray?.length}個`
  //     : "必要なし";

  console.log(
    "ResumeMembershipAfterCancelレンダリング",
    "✅selectedRadioButton",
    selectedRadioButton,
    "✅planBusiness",
    planBusiness,
    "✅planPremium",
    planPremium,
    "✅userProfileState",
    userProfileState,
    "✅defaultPaymentMethodState",
    defaultPaymentMethodState,
    "✅stepContents",
    stepContents,
    "✅並び替え前アカウント配列(前回の契約数)",
    AccountsDataArray,
    "✅並び替え済みアカウント配列(前回の契約数)",
    sortedAccountsState,
    "✅設定済みメンバーアカウント配列",
    memberAccountsState,
    "✅未設定アカウント配列",
    notSetAccountsState,
    "✅今回の契約数(必要アカウント数)",
    accountQuantity,
    "✅前回の契約数(アカウント数)",
    AccountsDataArray?.length,
    "✅新たにアカウント作成が必要かどうか",
    isRequiredCreate,
    // accountQuantity - AccountsDataArray?.length > 0,
    "✅新たに何個作成が必要か",
    requiredNewCountToCreate,
    "✅メンバーの削除が必要かどうか",
    requiredDeletionMemberAccounts,
    // memberAccountsState.length > accountQuantity,
    "✅削除対象メンバー数",
    selectedMembersArrayForDeletion.length,
    "✅削除が必要な未設定アカウント数",
    deletedNotSetAccountQuantity,
    // AccountsDataArray.length - selectedMembersArrayForDeletion.length - accountQuantity, // (前回の契約数 - 削除するメンバーアカウントの数) -
    "✅選択される削除対象メンバー",
    selectedMembersArrayForDeletion
  );

  if (!userProfileState || useQueryIsLoading) return <FallbackResumeMembershipAfterCancel />;

  return (
    <div className={`fixed inset-0 z-[2000] ${styles.bg_image}`} ref={modalContainerRef}>
      {(isLoadingReset || isLoadingSubmit) && (
        <div className={`${styles.loading_overlay} `}>
          <SpinnerIDS scale={"scale-[0.5]"} />
        </div>
      )}
      {hoveredItemPosModal && <TooltipModal />}
      <button
        className={`flex-center shadow-all-md transition-base03 fixed bottom-[2%] right-[6%] z-[3000] h-[35px] w-[35px] rounded-full bg-[#555] hover:bg-[#999]`}
        // className={`flex-center z-100 group absolute right-[-45px] top-[5px] h-[35px] w-[35px] rounded-full bg-[#00000090] hover:bg-[#000000c0]`}
        data-text="ログアウトする"
        onMouseEnter={(e) => handleOpenTooltip(e, "top")}
        onMouseLeave={handleCloseTooltip}
        onClick={handleSignOut}
      >
        <IoLogOutOutline className="mr-[-3px] text-[20px] text-[#fff]" />
      </button>
      {/* <Image
        src={bgImageUrl}
        alt=""
        blurDataURL={blurBgImageUrl}
        placeholder="blur"
        fill
        sizes="100vw"
        className="z-[-1] h-full w-full object-cover"
      /> */}
      <Image
        src={`/assets/images/hero/bg_slide_black1x_compressed.png`}
        alt=""
        blurDataURL={`/assets/images/hero/placeholder/bg_slide_black1x_placeholder.png`}
        placeholder="blur"
        fill
        sizes="100vw"
        className={`transition-base z-[0] h-full w-full select-none object-cover`}
        onContextMenu={(e) => e.preventDefault()}
      />
      {/* <Image
        src={`/assets/images/hero/bg_slide_white1x_compressed.png`}
        alt=""
        blurDataURL={`/assets/images/hero/placeholder/bg_slide_white1x_resize_compressed.png`}
        placeholder="blur"
        fill
        sizes="100vw"
        className={`z-[1] h-full w-full object-cover`}
        // className={`transition-base z-[2] h-full w-full object-cover ${
        //   theme === "light" ? `opacity-0` : `opacity-100`
        // }`}
      /> */}
      {/* シャドウグラデーション */}
      <div className="shadow-gradient-tb-md pointer-events-none absolute z-10 h-full w-full select-none"></div>
      {/* <div className="pointer-events-none absolute z-10 h-full w-full"></div> */}

      {/* モーダル */}
      <div
        className={`shadow-all-md transition-base03 absolute z-20 ${
          resumeStep === ""
            ? `left-[50%] top-[45%] flex h-auto w-[380px] translate-x-[-50%] translate-y-[-50%] flex-col rounded-[8px] bg-[var(--color-bg-light)] px-[32px] py-[24px] text-[#37352f]`
            : ``
        } ${resumeStep === "resume" ? `${styles.resume_container}` : ``}`}
      >
        {resumeStep === "" && (
          <>
            <h2 className="h-auto w-full text-[26px] font-bold">おかえりなさい。</h2>

            <div className={`mt-[15px] w-full space-y-[5px] text-[15px] text-[#19171199]`}>
              <p>
                <span className="font-bold text-[#37352f]">{userProfileState?.customer_name ?? ""}</span>
                のメンバーシップを再開しますか？
              </p>
              <p>もしくはチームを削除して新しく始めますか？</p>
            </div>

            {/* ボタンエリア */}
            <div className={`mt-[20px] flex w-full flex-col space-y-[15px]`}>
              <button
                className={`transition-base02 flex-center relative max-h-[41px] w-full cursor-pointer rounded-[8px] bg-[#0d99ff] px-[25px] py-[10px] text-[14px] font-bold  text-[#fff]  hover:bg-[var(--color-bg-brand-f-hover)] hover:text-[#fff]`}
                onClick={() => setResumeStep("resume")}
              >
                <span>再開する</span>
              </button>
              <button
                className={`transition-base02 flex-center relative max-h-[41px] w-full rounded-[8px] bg-[#40576d12] px-[25px] py-[10px] text-[14px] font-bold  hover:bg-[var(--bright-green)] hover:text-[#fff] ${
                  isLoadingReset ? `cursor-wait` : `cursor-pointer`
                }`}
                onClick={handleResetStart}
              >
                {!isLoadingReset && <span>チームを削除して新しく始める</span>}
                {isLoadingReset && <SpinnerIDS scale={"scale-[0.4]"} />}
              </button>
            </div>

            {/* 注意書きエリア */}
            <div className={`mt-[20px] w-full space-y-[5px] text-[12px] text-[#19171199]`}>
              <p>
                「チームを削除して新しく始める」をクリックすることで、以前に保存したデータに一切アクセスが不可となり、現在のユーザー情報もリセットして新たに始めます。
              </p>
            </div>
          </>
        )}
        {/* ================================= 再開ステップ ================================= */}
        {resumeStep === "resume" && (
          <>
            {/* メインコンテンツ コンテナ */}
            <div className={`${styles.main_contents_container} fade1`}>
              <div className={`${styles.left_container} relative  h-full w-6/12`}>
                {/* 戻るボタン */}
                <div
                  className="flex-center absolute left-[20px] top-[20px] z-50 h-[35px] w-[35px] cursor-pointer rounded-full hover:bg-[var(--color-bg-sub-icon)]"
                  data-text="戻る"
                  onMouseEnter={(e) => handleOpenTooltip(e, "top")}
                  onMouseLeave={handleCloseTooltip}
                  onClick={() => {
                    if (stepContents === "resume_3") {
                      setStepContents("resume_2");
                    } else if (stepContents === "resume_2") {
                      setStepContents("");
                    } else if (stepContents === "") {
                      setResumeStep("");
                    }
                    handleCloseTooltip();
                  }}
                >
                  <FiArrowLeft className="pointer-events-none text-[26px]" />
                </div>

                {/* ロゴからチェックエリアまで */}
                <div className="flex flex-col px-[40px] pt-[40px]">
                  <div className={`flex-center h-[40px] w-full`}>
                    <div className="relative flex h-[60px] w-[145px] select-none items-center justify-center">
                      <Image
                        src={`/assets/images/Trustify_Logo_icon_bg-black@3x.png`}
                        alt=""
                        className="h-full w-[90%] object-contain"
                        fill
                        priority={true}
                        sizes="10vw"
                      />
                    </div>
                  </div>
                  <h1 className={`mt-[10px] w-full text-center text-[24px] font-bold text-[var(--color-text-title)]`}>
                    {stepContents === "" && `プランを選んで再び始めましょう！`}
                    {stepContents === "resume_2" && `一緒に始めるメンバーを決めましょう！`}
                    {stepContents === "resume_3" && `メンバーシップを始めましょう！`}
                  </h1>
                  <div className={`w-full space-y-2 py-[20px]`}>
                    <div className="flex space-x-3">
                      <BsCheck2 className="stroke-1 text-[24px] text-[#00d436]" />
                      {stepContents === "" && <p>全てのコンテンツを使い放題。</p>}
                      {stepContents === "resume_2" && (
                        <p
                          className={`cursor-pointer hover:text-[var(--color-text-brand-f)]`}
                          onClick={() => setStepContents("")}
                        >
                          メンバーアカウントが足りないため、アカウントを増やす。
                        </p>
                      )}
                      {stepContents === "resume_3" && <p>最後は支払い方法を確認しましょう！</p>}
                    </div>
                    <div className="flex space-x-3">
                      <BsCheck2 className="stroke-1 text-[24px] text-[#00d436]" />
                      {stepContents === "" && <p>簡単登録、いつでもキャンセルできます。</p>}
                      {stepContents === "resume_2" && <p>契約アカウント数までメンバーをチームから削除する。</p>}
                      {stepContents === "resume_3" && <p>これで準備完了です！早速メンバーシップを始めましょう！</p>}
                    </div>
                  </div>
                </div>
                {/* ロゴからチェックエリアまで */}

                {/* 左スライドスクロールコンテナ */}
                <div
                  className={`relative h-full w-full min-w-[40vw] max-w-[40vw] ${
                    styles.left_slide_scroll_container
                  } transition-base03 ${stepContents === "resume_2" ? `ml-[-100%]` : ``} ${
                    stepContents === "resume_3" ? `${requiredDeletionMemberAccounts ? `ml-[-200%]` : `ml-[-100%]`}` : ``
                  }`}
                >
                  {/* 左スライドコンテンツラッパー 1ページ目 */}
                  <div className={`${styles.left_slide_scroll_left}`}>
                    {/* <div className={`flex-center h-[40px] w-full`}>
                      <div className="relative flex h-[60px] w-[145px] select-none items-center justify-center">
                        <Image
                          src={`/assets/images/Trustify_Logo_icon_bg-black@3x.png`}
                          alt=""
                          className="h-full w-[90%] object-contain"
                          fill
                          priority={true}
                          sizes="10vw"
                        />
                      </div>
                    </div>
                    <h1 className={`mt-[10px] w-full text-center text-[24px] font-bold`}>
                      プランを選んで再び始めましょう！
                    </h1>
                    <div className={`w-full space-y-2 py-[20px]`}>
                      <div className="flex space-x-3">
                        <BsCheck2 className="stroke-1 text-[24px] text-[#00d436]" />
                        <p>全てのコンテンツを使い放題。</p>
                      </div>
                      <div className="flex space-x-3">
                        <BsCheck2 className="stroke-1 text-[24px] text-[#00d436]" />
                        <p>簡単登録、いつでもキャンセルできます。</p>
                      </div>
                    </div> */}

                    {/* ラジオボタンエリア */}
                    <div className="flex w-full flex-col items-center justify-start space-y-[20px] pb-[20px] pt-[10px]">
                      {/* ビジネスプランラジオボタン */}
                      <div className="flex h-full w-full flex-col">
                        <div className="group/item relative flex h-full w-full  items-center justify-between whitespace-nowrap ">
                          <input
                            id="business_plan"
                            type="radio"
                            value="business_plan"
                            onChange={handleRadioChange}
                            checked={selectedRadioButton === "business_plan"}
                            className="peer/business_plan invisible absolute"
                          />
                          <label
                            htmlFor="business_plan"
                            className="relative cursor-pointer pl-[40px] text-[20px] font-bold text-[var(--color-text-title)]"
                            //   className="relative cursor-pointer pl-[40px] text-[20px] font-bold text-[var(--color-text)]  peer-checked/business_plan:text-[var(--color-bg-brand-f)]"
                          >
                            ビジネスプラン
                            {selectedRadioButton === "business_plan" ? (
                              <div className="absolute left-[0px] top-[0px] flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[var(--color-bg-brand-f)] transition-all duration-200">
                                <div className="absolute m-auto flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[var(--color-edit-bg)]">
                                  <div className="absolute m-auto flex h-[12px] w-[12px] items-center justify-center rounded-full bg-[var(--color-bg-brand-f)] transition-all duration-500"></div>
                                </div>
                              </div>
                            ) : (
                              <div className="group/item absolute left-[0px] top-[0px] flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[#ccc] ">
                                <div className="absolute m-auto flex h-[20px]  w-[20px] items-center justify-center rounded-full bg-[var(--color-edit-bg)]">
                                  <div className="absolute m-auto flex h-[12px] w-[12px] items-center justify-center rounded-full bg-[var(--color-edit-bg)]"></div>
                                </div>
                              </div>
                            )}
                          </label>

                          <div className="font-semibold">￥980/月/メンバー</div>
                        </div>

                        <div className={`w-full space-y-2 pl-[40px] pt-[15px]`}>
                          <div className="flex space-x-3">
                            <BsCheck2 className="text-[24px] text-[var(--color-bg-brand-f)]" />
                            <p>低価格で思う存分使いこなせる。</p>
                          </div>
                          <div className="flex space-x-3">
                            <BsCheck2 className="text-[24px] text-[var(--color-bg-brand-f)]" />
                            <p>いつでもプランの変更やキャンセルが可能です。</p>
                          </div>
                        </div>
                      </div>
                      {/* プレミアムプランボタン */}
                      <div className="flex h-full w-full flex-col pt-[20px]">
                        <div className="group/item relative flex h-full w-full  items-center justify-between whitespace-nowrap">
                          <input
                            id="premium_plan"
                            type="radio"
                            value="premium_plan"
                            onChange={handleRadioChange}
                            checked={selectedRadioButton === "premium_plan"}
                            className="peer/premium_plan invisible absolute"
                          />
                          <label
                            htmlFor="premium_plan"
                            className="relative cursor-pointer pl-[40px] text-[20px] font-bold text-[var(--color-text-title)]"
                          >
                            プレミアムプラン
                            {selectedRadioButton === "premium_plan" ? (
                              <div className="absolute left-[0px] top-[0px] flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[var(--color-bg-brand-f)] transition-all duration-200">
                                <div className="absolute m-auto flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[var(--color-edit-bg)]">
                                  <div className="absolute m-auto flex h-[12px] w-[12px] items-center justify-center rounded-full bg-[var(--color-bg-brand-f)] transition-all duration-500"></div>
                                </div>
                              </div>
                            ) : (
                              <div className="group/item absolute left-[0px] top-[0px] flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[#ccc] ">
                                <div className="absolute m-auto flex h-[20px]  w-[20px] items-center justify-center rounded-full bg-[var(--color-edit-bg)]">
                                  <div className="absolute m-auto flex h-[12px] w-[12px] items-center justify-center rounded-full bg-[var(--color-edit-bg)]"></div>
                                </div>
                              </div>
                            )}
                          </label>

                          <div className="font-semibold">￥19,800/月/メンバー</div>
                        </div>

                        <div className={`w-full space-y-2 pl-[40px] pt-[15px]`}>
                          <div className="flex space-x-3">
                            <BsCheck2 className="text-[24px] text-[var(--color-bg-brand-f)]" />
                            <p>電話・オンライン会議によるサポート。</p>
                          </div>
                          <div className="flex space-x-3">
                            <BsCheck2 className="text-[24px] text-[var(--color-bg-brand-f)]" />
                            <p>要望を開発チームに伝えて欲しい機能を優先的に開発。</p>
                          </div>
                          <div className="flex space-x-3">
                            <BsCheck2 className="text-[24px] text-[var(--color-bg-brand-f)]" />
                            <p>いつでもプランの変更やキャンセルが可能です。</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 前回契約していたメンバーアカウント数 */}
                    <div className="flex w-full flex-col pt-[10px]">
                      <p className="relative text-[15px] text-[var(--color-text-title)]">
                        前回のメンバーアカウント数は
                        <span className={`font-bold text-[var(--color-text-brand-f)]`}>
                          {userProfileState.accounts_to_create}個
                        </span>
                        でした。今回は何人で始めますか？
                      </p>
                    </div>

                    {/* メンバー人数選択 */}
                    <div className="flex w-full items-center justify-between pt-[15px]">
                      <div className="relative cursor-pointer text-[20px] font-bold text-[var(--color-text-title)]">
                        メンバー人数
                      </div>
                      <div className="flex items-center justify-end space-x-2 font-semibold">
                        <input
                          type="number"
                          min="1"
                          className={`${styles.input_box} !w-[50%]`}
                          placeholder="人数を入力"
                          value={accountQuantity === null ? "" : accountQuantity}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") {
                              setAccountQuantity(null);
                            } else {
                              const numValue = Number(val);

                              if (numValue <= 0) {
                                setAccountQuantity(1); // 入力値がマイナスかチェック
                              } else {
                                setAccountQuantity(numValue);
                              }
                            }
                          }}
                        />

                        <div className="">人</div>
                      </div>
                    </div>

                    {/* 続けるボタン */}
                    <div className="w-full pt-[25px]">
                      <button
                        className={`flex-center h-[40px] w-full cursor-pointer rounded-[6px] bg-[var(--color-bg-brand-f)] font-bold text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`}
                        // onClick={() => {
                        //   if (selectedRadioButton === "business_plan" && !!planBusiness)
                        //     handleResume(planBusiness.id, accountQuantity);
                        //   if (selectedRadioButton === "premium_plan" && !!planPremium)
                        //     handleResume(planPremium.id, accountQuantity);
                        // }}
                        onClick={() => {
                          if (requiredDeletionMemberAccounts) {
                            setStepContents("resume_2");
                          } else {
                            setStepContents("resume_3");
                          }
                        }}
                      >
                        {/* {!isLoading && <span>メンバーシップを開始する</span>} */}
                        {!isLoadingSubmit && <span>続ける</span>}
                        {isLoadingSubmit && <SpinnerIDS scale={"scale-[0.4]"} />}
                      </button>
                    </div>
                  </div>
                  {/* ============== 左スライドコンテンツラッパー 1ページ目 ここまで ============== */}
                  {/* ============== 左スライドコンテンツラッパー 2ページ目 ============== */}
                  {/* 前回の設定済みメンバーアカウント数が今回の契約数よりも多い場合(削除必要な場合) */}
                  {requiredDeletionMemberAccounts && (
                    <div className={`${styles.left_slide_scroll_right} relative`}>
                      <div className="mt-[10px] flex h-auto w-full items-center justify-between text-[20px] font-bold text-[var(--color-text-title)]">
                        <h2 className="mr-[20px] min-w-fit">メンバーの設定</h2>
                        {/* ======= 入力、検索エリア ====== */}
                        <div className={`relative flex w-full max-w-[230px] items-center`}>
                          <HiOutlineSearch className="absolute left-[8px] top-[50%] translate-y-[-50%] text-[20px] text-[var(--color-text-sub)]" />
                          <input
                            type="text"
                            placeholder={`チームメンバーの検索`}
                            className={`${styles.input_box2} !pl-[36px] !pr-[36px]`}
                            value={input}
                            onChange={(e) => {
                              setInput(e.target.value);
                              // if (e.target.value === "" && !emptyInput) return setEmptyInput(true);
                              // if (emptyInput) return setEmptyInput(false);
                            }}
                            //   onBlur={() => setEditedName(toHalfWidth(editedName.trim()))}
                            // onBlur={() => setEditedCompanyName(toHalfWidthAndSpace(editedCompanyName.trim()))}
                          />
                          {/* バツボタン */}
                          {input !== "" && (
                            <div
                              className={`${styles.close_btn_number}`}
                              onClick={() => {
                                setInput("");
                                // if (!emptyInput) return setEmptyInput(true);
                              }}
                            >
                              <MdClose className="text-[20px] " />
                            </div>
                          )}
                          {/* 検索ボタン */}
                          {/* {input !== "" && selectedMember === null && (
                        <div
                          className="flex-center transition-base03 shadow-all-md group absolute right-[10px] top-[50%] min-h-[32px] min-w-[32px] translate-y-[-50%] cursor-pointer rounded-full border border-solid border-[var(--color-bg-brand-f)] bg-[var(--color-modal-bg-side-c-second)] hover:bg-[var(--color-bg-brand-f90)]"
                          onClick={handleSearchMemberName}
                        >
                          <HiOutlineSearch className="text-[20px] text-[var(--color-text-title)] group-hover:text-[#fff]" />
                        </div>
                      )} */}
                        </div>
                        {/* ======= 入力、検索エリア ここまで ====== */}
                      </div>

                      {/* ======= メンバー一覧エリア ======= */}
                      <div
                        className={`relative mt-[10px] flex h-full max-h-[290px] min-h-[290px] w-full flex-col overflow-y-scroll`}
                      >
                        <div className={`relative flex w-full flex-col `}>
                          {/* inputが名前とemailに含まれているメンバーを抽出 */}
                          {memberAccountsState
                            ?.filter(
                              (account) =>
                                normalizeDeleteSpace(account.profile_name ? account.profile_name : ``).includes(
                                  input
                                ) || (account.email ? account.email : ``).includes(input)
                            )
                            .map((member, index) => {
                              if (member.id === userProfileState?.id) return;
                              return <MemberCard member={member} key={member.id} />;
                            })}
                          {Array(10)
                            .fill("")
                            .map((_, index) => (
                              <div
                                key={index}
                                className={`flex min-h-[44px] w-full cursor-pointer items-center truncate rounded-[8px] py-[12px] pl-[24px] hover:bg-[var(--setting-side-bg-select)]`}
                              >
                                <div
                                  className={`flex-center mr-[15px] h-[40px] w-[40px] cursor-pointer rounded-full bg-[var(--color-bg-brand-sub)] text-[#fff] hover:bg-[var(--color-bg-brand-sub-hover)]`}
                                >
                                  <span className={`text-[20px]`}>X</span>
                                </div>

                                <div className={`flex h-full flex-col space-y-[3px] pl-[5px] text-[12px]`}>
                                  <div className={`text-[13px]`}>
                                    <span>test1</span>
                                  </div>
                                  <div className={`text-[var(--color-text-sub)]`}>test@test.com</div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                      {/* ======= メンバー一覧エリア ここまで ======= */}

                      {/* ボタンエリア */}
                      <div className="shadow-top-md absolute bottom-0 left-0 flex h-auto w-full flex-col px-[32px] pb-[12px] pt-[0px]">
                        {/* 選択した人数と、残り選択が必要な人数を表示するエリア */}
                        <div className="flex w-full items-center py-[15px] text-[14px]">
                          <div className="flex w-6/12 items-center">
                            <span>削除する人数：</span>
                            <span>{selectedMembersArrayForDeletion.length}</span>
                          </div>
                          <div className="flex min-h-[24px] w-6/12 items-center">
                            <span>残り削除が必要な人数：</span>
                            {selectedMembersArrayForDeletion.length >= lackAccountCount ? (
                              <BsCheck2 className="stroke-[0.5] text-[24px] text-[var(--vivid-green)]" />
                            ) : (
                              <span>{lackAccountCount}</span>
                            )}
                          </div>
                        </div>
                        {/* メンバーシップを開始するボタン */}
                        <div className="w-full">
                          <button
                            className={`flex-center h-[40px] w-full rounded-[6px] font-bold ${
                              selectedMembersArrayForDeletion.length >= lackAccountCount
                                ? `cursor-pointer bg-[var(--color-bg-brand-f)] text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`
                                : `cursor-not-allowed bg-[var(--color-bg-brand-f-disabled)] text-[var(--color-btn-brand-text-disabled)]`
                            }`}
                            onClick={() => {
                              if (selectedMembersArrayForDeletion.length < lackAccountCount) return;
                              setStepContents("resume_3");
                            }}
                          >
                            {/* {!isLoading && <span>メンバーシップを開始する</span>} */}
                            {!isLoadingSubmit && <span>続ける</span>}
                            {isLoadingSubmit && <SpinnerIDS scale={"scale-[0.4]"} />}
                          </button>
                        </div>
                        {/* メンバーシップを開始するボタン ここまで */}
                        <div className="w-full pt-[10px]">
                          <div className={`flex-center h-[40px] w-full`}>
                            <span
                              className={`cursor-pointer text-[var(--color-text-sub)] hover:text-[var(--color-text-sub-deep)]`}
                              onClick={() => setStepContents("")}
                            >
                              戻る
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* 左スライドコンテンツラッパー 2ページ目 ここまで */}
                  {/* 左スライドコンテンツラッパー 3ページ目 */}
                  <div className={`${styles.left_slide_scroll_right}`}>
                    <div className="mt-[10px] h-auto w-full text-[20px] font-bold text-[var(--color-text-title)]">
                      <h2>お支払い方法の設定</h2>
                    </div>

                    {/* 説明エリア */}
                    {defaultPaymentMethodState && (
                      <div className={`mt-[20px] w-full text-[14px] leading-[24px] text-[var(--color-text-sub)]`}>
                        <p>現在設定されているお支払い方法は下記の通りです。</p>
                        <p className="">
                          有効期限は
                          <span className="font-bold">
                            {defaultPaymentMethodState.card.exp_year}年{defaultPaymentMethodState.card.exp_month}月
                          </span>
                          です。変更する場合は「お支払い方法を変更する」から変更してください。
                        </p>
                      </div>
                    )}
                    {!defaultPaymentMethodState && (
                      <div className={`mt-[20px] w-full text-[14px] leading-[24px] text-[var(--color-text-sub)]`}>
                        <p>
                          お客様のお支払い方法が設定されていません。下記の「お支払い方法を設定する」からお支払い方法を設定してください。
                        </p>
                      </div>
                    )}

                    {/* 支払い設定エリア */}
                    <div className="flex w-full items-center justify-between pt-[30px]">
                      {/* カード情報 */}
                      {defaultPaymentMethodState && (
                        <div className="flex h-[30px] items-center">
                          <div
                            className={`relative mb-[-5px] ${
                              defaultPaymentMethodState === "amex" ? `h-[28px] w-[28px]` : `h-[28px] w-[28px]`
                            }`}
                          >
                            <Image
                              src={cardBrandURL()}
                              alt="card-brand"
                              fill
                              sizes="64px"
                              className="z-[0] h-full w-full object-contain object-center"
                            />
                          </div>
                          <div className="ml-[10px] flex min-h-[24px] items-center space-x-[8px]">
                            <span className="text-[24px] font-bold tracking-[-2px]">••••</span>
                            <span className="text-[24px] font-bold tracking-[-2px]">••••</span>
                            <span className="text-[24px] font-bold tracking-[-2px]">••••</span>
                            <span className="mb-[-3px] text-[14px] font-bold tracking-[1px]">
                              {defaultPaymentMethodState.card.last4}
                            </span>
                          </div>
                        </div>
                      )}
                      {/* カード情報 ここまで */}
                      {/* 支払い方法変更テキスト */}
                      <div className="flex-center max-h-[32px] rounded-[8px] px-[12px] py-[8px]">
                        {!isLoadingPortal && (
                          <span
                            className={`transition-base03 cursor-pointer text-[14px] text-[var(--color-text-sub)] hover:text-[var(--color-text-brand-f)] hover:underline`}
                            onClick={loadPortal}
                          >
                            {defaultPaymentMethodState ? "お支払い方法を変更する" : "お支払い方法を設定する"}
                          </span>
                        )}
                        {isLoadingPortal && (
                          <div className="flex-center max-h-[30px] max-w-[30px]">
                            <SpinnerIDS scale={"scale-[0.4]"} />
                          </div>
                        )}
                      </div>
                      {/* 支払い方法変更テキスト ここまで */}
                    </div>
                    {/* 支払い設定エリア ここまで */}
                    {/* メンバーシップを開始するボタン */}
                    <div className="mt-[45px] w-full">
                      <button
                        className={`flex-center h-[40px] w-full cursor-pointer rounded-[6px] bg-[var(--color-bg-brand-f)] font-bold text-[#fff] ${
                          isLoadingPortal ? `` : `hover:bg-[var(--color-bg-brand-f-deep)]`
                        }`}
                        onClick={() => handleResume(planBusiness?.id, accountQuantity)}
                        // onClick={() => {
                        //   if (selectedRadioButton === "business_plan" && !!planBusiness)
                        //     handleResume(planBusiness.id, accountQuantity);
                        //   if (selectedRadioButton === "premium_plan" && !!planPremium)
                        //     handleResume(planPremium.id, accountQuantity);
                        // }}
                      >
                        {/* {!isLoading && <span>メンバーシップを開始する</span>} */}
                        {!isLoadingSubmit && <span>メンバーシップを始める</span>}
                        {isLoadingSubmit && <SpinnerIDS scale={"scale-[0.4]"} />}
                      </button>
                    </div>
                    {/* メンバーシップを開始するボタン ここまで */}
                    <div className="mb-[30px] w-full pt-[15px]">
                      <div className={`flex-center h-[40px] w-full`}>
                        <span
                          className={`cursor-pointer text-[var(--color-text-sub)] hover:text-[var(--color-text-sub-deep)]`}
                          onClick={() => {
                            if (requiredDeletionMemberAccounts) {
                              setStepContents("resume_2");
                            } else {
                              setStepContents("");
                            }
                          }}
                        >
                          戻る
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* 左スライドコンテンツラッパー 3ページ目 ここまで */}
                </div>
                {/* 左スライドスクロールコンテナ 2ページ目 ここまで */}
              </div>
              {/* 左コンテナ ここまで */}
              {/* 右コンテナ */}
              <div className={`${styles.right_container} relative z-10 flex h-full w-6/12`}>
                <div
                  className={`transition-base03 z-[20] ${
                    stepContents === "resume_3" ? `${styles.right_bg_image3} ` : ``
                  } ${stepContents === "resume_2" ? `${styles.right_bg_image2} ` : ``} ${
                    stepContents === "" ? `${styles.right_bg_image1} ` : ``
                  }`}
                />
                <Image
                  src={rightImage()}
                  alt=""
                  blurDataURL={rightImagePlaceholder()}
                  placeholder="blur"
                  className={`transition-base03 absolute left-0 top-0 z-[-1] h-full w-full object-cover object-center`}
                  fill
                  sizes="10vw"
                />

                {/* ２ページ目 */}
                <div
                  className={`transition-base03 absolute left-0 top-0 z-[21] flex h-full w-[100%] flex-col items-center justify-center bg-[var(--color-modal-bg-side-c0)] ${
                    stepContents === "resume_2" ? `opacity-100` : `opacity-0`
                  }`}
                >
                  <div className="z-10 mb-[-30px]">{teamIllustration}</div>
                  <div className="z-0 flex min-h-[57%] w-[70%] flex-col rounded-[8px] bg-[var(--color-modal-bg-side-c-secondc0)] px-[24px] pb-[8px] pt-[58px] text-[var(--color-text-title)]">
                    <p className={`text-[14px] font-bold`}>現在のアカウント状況は以下の通りです。</p>
                    <div className="mt-[12px] flex h-auto w-full text-[14px]">
                      {/* <p className="mr-[4px]">1.</p> */}
                      <p>
                        前回参加していたメンバーの人数は
                        <span className={`font-bold text-[var(--color-text-brand-f)]`}>
                          {memberAccountsState.length}人
                        </span>
                        です。
                      </p>
                    </div>
                    <div className="mt-[4px] flex h-auto w-full text-[14px]">
                      {/* <p className="mr-[4px]">2.</p> */}
                      <div className="flex w-full flex-col">
                        <p>
                          今回選択した契約アカウント数は
                          <span className={`font-bold text-[var(--color-text-brand-f)]`}>{accountQuantity}つ</span>
                          のため、前回のメンバーが参加するには
                          <span className={`font-bold text-[var(--bright-red)]`}>{lackAccountCount}つ</span>
                          足りません。
                        </p>

                        {/* <p className="mt-[4px] text-[12px] text-[var(--color-text-sub)]">
                          任命された人は、このチーム、チームメンバー、チームコンテンツの新しい管理者権限を持つことになります。
                        </p> */}
                      </div>
                    </div>

                    <p className={`mt-[16px] text-[14px]`}>以下のどちらかの手順で始めましょう。</p>

                    <div className="mt-[16px] flex h-auto w-full text-[14px]">
                      <p className="mr-[4px] font-bold">○</p>
                      <div className="flex w-full flex-col">
                        <p
                          className="cursor-pointer font-bold hover:text-[var(--color-text-brand-f)] hover:underline"
                          onClick={() => setStepContents("")}
                        >
                          前回のメンバー全員が参加できるようメンバーアカウントを増やして始める。
                        </p>
                        <p className="mt-[4px] text-[12px] text-[var(--color-text-sub)]">
                          メンバーアカウントを増やすことで、メンバーをチームから削除せずに始められます。
                        </p>
                      </div>
                    </div>
                    <div className="mt-[16px] flex h-auto w-full text-[14px]">
                      <p className="mr-[4px] font-bold">○</p>
                      <div className="flex w-full flex-col">
                        <p className="font-bold">前回のメンバーをチームから削除して始める。</p>
                        <p className="mt-[4px] text-[12px] text-[var(--color-text-sub)]">
                          始めるにはチームからあと
                          <span className="font-bold text-[var(--bright-red)]">{lackAccountCount}人</span>
                          削除が必要です。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* ２ページ目 */}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export const ResumeMembershipAfterCancel = memo(ResumeMembershipAfterCancelMemo);
