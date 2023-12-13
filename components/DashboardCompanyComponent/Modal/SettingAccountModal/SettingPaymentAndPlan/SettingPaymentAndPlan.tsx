import { SpinnerComet } from "@/components/Parts/SpinnerComet/SpinnerComet";
import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import { useQueryMemberAccounts } from "@/hooks/useQueryMemberAccounts";
import { useQueryStripeSchedules } from "@/hooks/useQueryStripeSchedules";
import useStore from "@/store";
import useDashboardStore from "@/store/useDashboardStore";
import useThemeStore from "@/store/useThemeStore";
import { dateJST } from "@/utils/Helpers/dateJST";
import { isValidUUIDv4 } from "@/utils/Helpers/uuidHelpers";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { FC, memo, useCallback, useEffect, useRef, useState } from "react";
import { AiFillExclamationCircle, AiFillInfoCircle, AiOutlineMinusCircle, AiOutlinePlusCircle } from "react-icons/ai";
import { BsCheck2, BsChevronDown } from "react-icons/bs";
import { MdBubbleChart, MdClose, MdOutlineBubbleChart } from "react-icons/md";
import { toast } from "react-toastify";
import styles from "./SettingPaymentAndPlan.module.css";
import { GiLaurelCrown } from "react-icons/gi";
import { FaChartLine, FaChartPie, FaRegHeart } from "react-icons/fa";
import { GrLineChart } from "react-icons/gr";
import { SkeletonLoadingLineLong } from "@/components/Parts/SkeletonLoading/SkeletonLoadingLineLong";
import { getPeriodInDaysFromIsoDateString } from "@/utils/Helpers/getPeriodInDaysFromIsoDateString";
import { getRemainingDaysFromNowPeriodEndHourToTimestamp } from "@/utils/Helpers/getRemainingDaysFromNowPeriodEndHourToTimestamp";
import { getPrice } from "@/utils/Helpers/getPrice";
import { SkeletonLoadingLineFull } from "@/components/Parts/SkeletonLoading/SkeletonLoadingLineFull";
import { SkeletonLoadingLineMedium } from "@/components/Parts/SkeletonLoading/SkeletonLoadingLineMedium";
import { HiPlus } from "react-icons/hi2";
import { formatToJapaneseYen } from "@/utils/Helpers/formatToJapaneseYen";
import Stripe from "stripe";
import { StripeSchedule } from "@/types";
import Decimal from "decimal.js";
import { getStripeSchedule } from "@/utils/Helpers/getStripeSchedule";
import { releaseStripeSchedule } from "@/utils/Helpers/releaseStripeSchedule";

const SettingPaymentAndPlanMemo: FC = () => {
  const theme = useThemeStore((state) => state.theme);
  const selectedSettingAccountMenu = useDashboardStore((state) => state.selectedSettingAccountMenu);
  // 上画面の選択中の列データ会社
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  // セッション情報
  const sessionState = useStore((state) => state.sessionState);
  // router
  const router = useRouter();
  // ローディング
  const [isLoading, setIsLoading] = useState(false);
  // ポータルローディング
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  // プラン変更ローディング
  const [isLoadingSubmitChangePlan, setIsLoadingSubmitChangePlan] = useState(false);
  // アカウントを増やす・減らすモーダル開閉状態
  const isOpenChangeAccountCountsModal = useDashboardStore((state) => state.isOpenChangeAccountCountsModal);
  const setIsOpenChangeAccountCountsModal = useDashboardStore((state) => state.setIsOpenChangeAccountCountsModal);
  // 未設定アカウントを保持するグローバルState
  const notSetAccounts = useDashboardStore((state) => state.notSetAccounts);
  const setNotSetAccounts = useDashboardStore((state) => state.setNotSetAccounts);
  // 未設定かつ削除予定アカウントを保持するグローバルState
  const notSetAndDeleteRequestedAccounts = useDashboardStore((state) => state.notSetAndDeleteRequestedAccounts);
  const setNotSetAndDeleteRequestedAccounts = useDashboardStore((state) => state.setNotSetAndDeleteRequestedAccounts);
  // アカウント削除リクエストのスケジュール
  const deleteAccountRequestSchedule = useDashboardStore((state) => state.deleteAccountRequestSchedule);
  const setDeleteAccountRequestSchedule = useDashboardStore((state) => state.setDeleteAccountRequestSchedule);
  // プランダウングレードリクエストのスケジュール
  const downgradePlanSchedule = useDashboardStore((state) => state.downgradePlanSchedule);
  const setDowngradePlanSchedule = useDashboardStore((state) => state.setDowngradePlanSchedule);
  // 削除リクエストをキャンセル確認モーダル プランダウングレードと数量ダウン両方で使用する
  const [showConfirmCancelModal, setShowConfirmCancelModal] = useState<string | null>(null);
  // プランを変更確認モーダル
  const [isOpenChangePlanModal, setIsOpenChangePlanModal] = useState(false);
  // プラン変更モーダルの中の追加費用詳細モーダル
  const [isOpenAdditionalCostModal, setIsOpenAdditionalCostModal] = useState(false);
  // プラン変更時のアップグレードかダウングレード
  const [isUpgradePlan, setIsUpgradePlan] = useState(false);
  // プラン変更を確定・確認モーダル
  const [isOpenConfirmChangePlanModal, setIsOpenConfirmChangePlanModal] = useState(false);
  // プラン変更時に取得する日割り計算済みのstripeインボイス保持用State
  const nextInvoiceForChangePlan = useDashboardStore((state) => state.nextInvoiceForChangePlan);
  const setNextInvoiceForChangePlan = useDashboardStore((state) => state.setNextInvoiceForChangePlan);
  // プラン変更時のstripeのインボイスと料金が一致しなかった場合
  const [notMatchInvoiceChangePlan, setNotMatchInvoiceChangePlan] = useState(false);
  const [isLoadingFetchInvoice, setIsLoadingFetchInvoice] = useState(false);
  // 今日が最終日かどうか
  const [isLastDay, setIsLastDay] = useState(false);
  // テスト確認用
  const [getStripeScheduleState, setGetStripeSchedule] = useState<Stripe.SubscriptionSchedule | null>(null);
  // テスト確認用 ここまで
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();

  // =================== 🌟プラン変更インボイス用state ===================
  const currentPeriodRef = useRef<number | null>(null);
  const remainingDaysRef = useRef<number | null>(null);
  const businessPlanFeePerAccountRef = useRef<number | null>(null);
  const premiumPlanFeePerAccountRef = useRef<number | null>(null);
  const newPlanRemainingAmountPerAccountWithThreeDecimalPointsRef = useRef<number | null>(null);
  const oldPlanUnusedAmountPerAccountWithThreeDecimalPointsRef = useRef<number | null>(null);
  // const [newPlanAmount, setNewPlanAmount] = useState<number | null>(null);
  const [todayIsPeriodEnd, setTodayIsPeriodEnd] = useState(false);
  useEffect(() => {
    if (!userProfileState?.current_period_end) return;
    if (!userProfileState?.current_period_start) return;
    const period = getPeriodInDaysFromIsoDateString(
      userProfileState.current_period_start,
      userProfileState.current_period_end
    );
    const periodEndDate = new Date(userProfileState.current_period_end);
    const remaining = getRemainingDaysFromNowPeriodEndHourToTimestamp(periodEndDate.getTime()).remainingDays;

    // refに格納
    currentPeriodRef.current = period; // 請求期間
    remainingDaysRef.current = remaining; // 残り日数
    businessPlanFeePerAccountRef.current = getPrice("business_plan"); //ビジネスプラン価格
    premiumPlanFeePerAccountRef.current = getPrice("premium_plan"); // プレミアムプラン価格

    // 今日が終了日かどうか
    const currentDateObj = new Date("2028-11-20"); // テストクロック
    const year = currentDateObj.getFullYear();
    const month = currentDateObj.getMonth();
    const day = currentDateObj.getDate();
    const currentDateOnly = new Date(year, month, day); // 現在の日付の時刻情報をリセット
    const endYear = periodEndDate.getFullYear();
    const endMonth = periodEndDate.getMonth();
    const endDay = periodEndDate.getDate();
    const periodEndDateOnly = new Date(endYear, endMonth, endDay); // 現在の日付の時刻情報をリセット
    const isSameDay = currentDateOnly.getTime() === periodEndDateOnly.getTime();
    if (isSameDay) setTodayIsPeriodEnd(true);
  }, [userProfileState?.current_period_end, userProfileState?.current_period_start]);
  // =================== ✅プラン変更インボイス用state ===================

  const {
    data: stripeSchedulesDataArray,
    error: useQueryError,
    isLoading: useQueryIsLoading,
    refetch: refetchStripeSchedules,
  } = useQueryStripeSchedules();

  // 現在契約しているメンバーアカウント全てを取得して、契約アカウント数をlengthで取得
  const {
    data: memberAccountsDataArray,
    error: useQuerMemberAccountsError,
    isLoading: useQueryMemberAccountsIsLoading,
    refetch: refetchMemberAccounts,
  } = useQueryMemberAccounts();

  // スケジュールをアカウント削除、プランダウングレードに振り分けてZustandに格納
  useEffect(() => {
    if (!stripeSchedulesDataArray || stripeSchedulesDataArray.length === 0) {
      setDeleteAccountRequestSchedule(null);
      setDowngradePlanSchedule(null);
      return;
    }
    // 削除リクエストのスケジュール
    const deleteAccountRequestScheduleArray = stripeSchedulesDataArray.filter(
      (schedule) => schedule.schedule_status === "active" && schedule.type === "change_quantity"
    );
    // プランダウングレードリクエストのスケジュール
    const downgradePlanScheduleArray = stripeSchedulesDataArray.filter(
      (schedule) => schedule.schedule_status === "active" && schedule.type === "change_plan"
    );
    // Zustandに格納 Arrayなのでひとつしかないが0番目のオブジェクトを格納
    setDeleteAccountRequestSchedule(deleteAccountRequestScheduleArray[0] ?? null);
    setDowngradePlanSchedule(downgradePlanScheduleArray[0] ?? null);
  }, [stripeSchedulesDataArray, setDeleteAccountRequestSchedule, setDowngradePlanSchedule]);

  // 未設定アカウントを算出
  useEffect(() => {
    if (typeof memberAccountsDataArray === "undefined") return;
    if (!memberAccountsDataArray) {
      setNotSetAccounts([]);
      // setNotSetAccountsCount(null);
      return;
    }
    // // 全メンバーアカウントの数
    // アカウントの配列からprofilesのidがnull、かつ、invited_emailがnullで招待中でないアカウント、かつ、アカウントステータスがactiveのアカウントのみをフィルタリング
    const nullIdAccounts = memberAccountsDataArray.filter(
      (account) => account.id === null && account.account_invited_email === null && account.account_state === "active"
    );
    // 削除予定のアカウントを取得してグローバルStateに格納
    const deleteRequestedAccounts = memberAccountsDataArray.filter(
      (account) =>
        account.id === null && account.account_invited_email === null && account.account_state === "delete_requested"
    );
    // idがnullのアカウントの数をカウント
    const nullIdCount = nullIdAccounts ? nullIdAccounts.length : 0;
    // // アカウントの配列からidがnullでないアカウントのみをフィルタリング
    // const notNullIdAccounts = memberAccountsDataArray?.filter((account) => account.id !== null);
    // // idがnullでないアカウントの数をカウント
    // const notNullIdCount = notNullIdAccounts ? notNullIdAccounts.length : 0;
    // // 全アカウント数からnullでないアカウントを引いた数
    // const nullIdCount2 = Math.abs(allAccountsCount - notNullIdCount);
    // console.log(
    //   "nullIdAccounts",
    //   nullIdAccounts,
    //   "未設定のアクティブアカウント数",
    //   nullIdCount,
    //   "削除リクエスト済みアカウント数",
    //   deleteRequestedAccounts,
    //   "memberAccountsDataArray",
    //   memberAccountsDataArray
    // );
    // グローバルStateに格納
    // setNotSetAccountsCount(nullIdCount);
    setNotSetAccounts(nullIdAccounts);
    setNotSetAndDeleteRequestedAccounts(deleteRequestedAccounts);
  }, [memberAccountsDataArray, setNotSetAccounts]);

  // useQueryPaymentAndPlanで製品テーブルからデータ一覧を取得
  console.log(
    "SettingPaymentAndPlanコンポーネントレンダリング",
    "userProfileState",
    userProfileState,
    "Stripeのサブスクスケジュール stripeSchedulesDataArray",
    stripeSchedulesDataArray,
    "削除リクエストスケジュール deleteAccountRequestSchedule",
    deleteAccountRequestSchedule,
    "プランダウングレードリクエストスケジュール downgradePlanSchedule",
    downgradePlanSchedule,
    "全メンバーアカウント",
    memberAccountsDataArray,
    "未設定アクティブアカウント notSetAccounts",
    notSetAccounts,
    "削除リクエスト済みアカウント notSetAndDeleteRequestedAccounts",
    notSetAndDeleteRequestedAccounts,
    "プラン変更将来のインボイス nextInvoiceForChangePlan",
    nextInvoiceForChangePlan,
    "currentPeriodRef.current",
    currentPeriodRef.current,
    "remainingDaysRef.current",
    remainingDaysRef.current,
    "premiumPlanFeePerAccountRef.current",
    premiumPlanFeePerAccountRef.current,
    "businessPlanFeePerAccountRef.current",
    businessPlanFeePerAccountRef.current,
    "newPlanRemainingAmountPerAccountWithThreeDecimalPointsRef.current",
    newPlanRemainingAmountPerAccountWithThreeDecimalPointsRef.current,
    "oldPlanUnusedAmountPerAccountWithThreeDecimalPointsRef.current",
    oldPlanUnusedAmountPerAccountWithThreeDecimalPointsRef.current,
    "isUpgradePlan",
    isUpgradePlan,
    "インボイスの比例配分日",
    !!nextInvoiceForChangePlan?.subscription_proration_date &&
      format(new Date(nextInvoiceForChangePlan.subscription_proration_date * 1000), "yyyy年MM月dd日 HH:mm:ss")
  );

  // Stripeポータルへ移行させるためのURLをAPIルートにGETリクエスト
  // APIルートからurlを取得したらrouter.push()でStipeカスタマーポータルへページ遷移
  const loadPortal = async () => {
    if (!userProfileState) return alert("エラー：ユーザーデータが見つかりませんでした");
    if (!userProfileState.stripe_customer_id) return alert("エラー：ユーザーデータが見つかりませんでした");
    setIsLoadingPortal(true);
    try {
      // postメソッドでチェックアウト
      const portalPayload = {
        stripeCustomerId: userProfileState.stripe_customer_id,
      };
      console.log("axios.post実行 portalPayload", portalPayload);
      const { data } = await axios.post(`/api/portal`, portalPayload, {
        headers: {
          Authorization: `Bearer ${sessionState.access_token}`,
        },
      });
      // getメソッドでポータル
      // const { data } = await axios.get("/api/portal", {
      //   headers: {
      //     Authorization: `Bearer ${sessionState.access_token}`,
      //   },
      // });
      console.log("stripe billingPortalのurlを取得成功", data);
      router.push(data.url);
      //   setIsLoadingPortal(false);
    } catch (e: any) {
      setIsLoadingPortal(false);
      alert(`エラーが発生しました: ${e.message}`);
    }
  };

  const columnNameToJapanese = (name: string | null | undefined) => {
    switch (name) {
      case "free_plan":
        return "フリープラン";
        break;
      case "business_plan":
        return "ビジネスプラン";
        break;
      case "premium_plan":
        return "プレミアムプラン";
        break;
      default:
        return "";
        break;
    }
  };
  const planToPrice = (name: string | null | undefined) => {
    switch (name) {
      case "free_plan":
        return "0";
        break;
      case "business_plan":
        return "980";
        break;
      case "premium_plan":
        return "19,800";
        break;
      default:
        return "";
        break;
    }
  };

  // ===================== 🌟アカウントの削除リクエストをキャンセルする関数 =====================
  const [loadingCancelDeleteRequest, setLoadingCancelDeleteRequest] = useState(false);
  const handleCancelDeleteAccountRequestSchedule = async () => {
    if (!userProfileState) return alert("エラー：ユーザー情報が確認できませんでした");
    if (!sessionState) return alert("エラー：セッション情報が確認できませんでした");
    setLoadingCancelDeleteRequest(true);

    try {
      console.log("🌟Stripe数量ダウンキャンセルステップ0-1 axiosでAPIルートに送信");

      // 選択された個数分、未設定のアカウントの配列からidのみ取り出して指定個数の未設定idの配列を作り引数に渡す。
      const idsToDeleteRequestedArray = notSetAndDeleteRequestedAccounts
        .filter((account, index) => account && notSetAndDeleteRequestedAccounts.length >= index + 1)
        .map((account) => account.subscribed_account_id);
      // 削除リクエストのid群の配列が全てUUIDかをチェックする uuid以外が含まれていればリターン
      if (idsToDeleteRequestedArray.every((id) => id && isValidUUIDv4(id)) === false) return;
      console.log("🌟Stripeアカウント変更ステップ0-2 削除リクエストの配列UUIDチェック完了", idsToDeleteRequestedArray);

      const payload = {
        stripeCustomerId: userProfileState.subscription_stripe_customer_id,
        cancelDeleteRequestQuantity: notSetAndDeleteRequestedAccounts.length, // 削除リクエストをキャンセルする数
        // cancelDeleteRequestedAccountIds: idsToDeleteRequestedArray, // 削除リクエスト済みをキャンセルするアカウントのidを持つ配列
        subscriptionId: userProfileState.subscription_id,
      };
      console.log(
        "🌟Stripe数量ダウンキャンセルステップ0-2 axios.post()でAPIルートcancel-change-quantityへリクエスト 引数のpayload",
        payload
      );
      const {
        data: { subscriptionItem, error: axiosStripeError },
      } = await axios.post(`/api/subscription/cancel-change-quantity`, payload, {
        headers: {
          Authorization: `Bearer ${sessionState.access_token}`,
        },
      });

      if (axiosStripeError) {
        console.error(
          `🌟Stripeアカウント変更ステップ7 Stripeアカウント数変更エラー axiosStripeError`,
          axiosStripeError
        );
        throw new Error(axiosStripeError);
      }
      console.log(`🌟Stripeアカウント変更ステップ7 Stripeアカウント数変更完了 subscriptionItem`, subscriptionItem);

      // =========== subscribed_accountsのstateを削除リクエスト済み（delete_requested）をactiveに変更 ===========
      console.log(
        `🌟Stripeアカウント変更ステップ8 supabaseのsubscribed_accountsテーブルから${notSetAndDeleteRequestedAccounts.length}個のアカウントの削除リクエストをactiveに変更するストアドプロシージャを実行 削除リクエストのidを持つ配列 idsToDeleteRequestedArray`,
        idsToDeleteRequestedArray
      );
      // 新たに削除するアカウント数分、supabaseのsubscribed_accountsテーブルからDELETE
      const { error: cancelDeleteRequestedSubscribedAccountsError } = await supabase.rpc(
        "cancel_delete_requested_subscribed_accounts_all_at_once",
        {
          _cancel_delete_requested_account_quantity: notSetAndDeleteRequestedAccounts.length,
          _ids_to_delete_requested: idsToDeleteRequestedArray,
          _subscription_id: userProfileState.subscription_id,
        }
      );

      if (cancelDeleteRequestedSubscribedAccountsError) {
        console.log("🌟Stripeステップ9 supabaseの未設定アカウントを指定個数分、削除リクエストキャンセルエラー");
        throw new Error(cancelDeleteRequestedSubscribedAccountsError.message);
      }
      console.log(
        "🌟Stripeステップ9 supabaseの未設定アカウントを指定個数分、削除リクエストとsubscriptionsテーブルのアクティブアカウント数の更新成功"
      );

      // const promises = [...Array(accountQuantity)].map(() => {
      //   return null;
      // });
      // await Promise.all(promises);
      console.log("✅全て完了 キャッシュを更新");

      // キャッシュを最新状態に反映
      // サブスクリプションスケジュールを取得して新たなダウングレードの適用時期を明示する
      await queryClient.invalidateQueries({ queryKey: ["member_accounts"] });
      await queryClient.invalidateQueries({ queryKey: ["stripe_schedules"] });

      // ======== subscribed_accountsのstateを削除リクエスト済み（delete_requested）に変更 ここまで ========

      // ======================= スケジュールの適用日に実行 =======================
      toast.success(`削除リクエストのキャンセルが成功しました！`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (e: any) {
      console.error("handleChangeQuantityエラー", e);
      toast.error(`削除リクエストのキャンセルに失敗しました。`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }

    setShowConfirmCancelModal(null); // 確認モーダルを閉じる
    setLoadingCancelDeleteRequest(false);
  };
  // ===================== ✅アカウントの削除リクエストをキャンセルする関数 =====================
  // ===================== 🌟プランのダウングレードリクエストをキャンセルする関数 =====================
  // const [loadingCancelDowngradeRequest, setLoadingCancelDowngradeRequest] = useState(false);
  const handleCancelDowngradePlanRequestSchedule = async () => {
    if (!userProfileState) return alert("エラー：ユーザー情報が確認できませんでした");
    if (!sessionState) return alert("エラー：セッション情報が確認できませんでした");
    setLoadingCancelDeleteRequest(true);

    try {
      console.log("🌟Stripeプランダウングレードリクエストキャンセルステップ0-1 axiosでAPIルートに送信");

      const payload = {
        stripeCustomerId: userProfileState.subscription_stripe_customer_id,
        subscriptionId: userProfileState.subscription_id,
        stripeSubscriptionId: userProfileState.stripe_subscription_id,
      };
      console.log(
        "🌟Stripeプランダウングレードリクエストキャンセルステップ0-2 axios.post()でAPIルートcancel-change-planへリクエスト 引数のpayload",
        payload
      );
      const {
        data: { subscriptionItem, error: axiosStripeError },
      } = await axios.post(`/api/subscription/cancel-change-plan`, payload, {
        headers: {
          Authorization: `Bearer ${sessionState.access_token}`,
        },
      });

      if (axiosStripeError) {
        console.error(
          `🌟Stripeプランダウングレードリクエストキャンセルステップ7 Stripeアカウント数変更エラー axiosStripeError`,
          axiosStripeError
        );
        throw new Error(axiosStripeError);
      }
      console.log(
        `🌟Stripeプランダウングレードリクエストキャンセルステップ7 Stripeアカウント数変更完了 subscriptionItem`,
        subscriptionItem
      );

      // =========== subscribed_accountsのstateを削除リクエスト済み（delete_requested）をactiveに変更 ===========
      console.log(`🌟Stripeプランダウングレードリクエストキャンセルステップ8 `);

      console.log("✅全て完了 キャッシュを更新");

      // キャッシュを最新状態に反映
      // サブスクリプションスケジュールを取得して新たなダウングレードの適用時期を明示する
      await queryClient.invalidateQueries({ queryKey: ["stripe_schedules"] });

      // ======== subscribed_accountsのstateを削除リクエスト済み（delete_requested）に変更 ここまで ========

      // ======================= スケジュールの適用日に実行 =======================
      toast.success(`プランダウングレードのキャンセルが成功しました！`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (e: any) {
      console.error("handleChangePlanエラー", e);
      toast.error(`プランダウングレードのキャンセルに失敗しました。`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }

    setShowConfirmCancelModal(null); // 確認モーダルを閉じる
    setLoadingCancelDeleteRequest(false);
  };
  // ===================== ✅プランのダウングレードリクエストをキャンセルする関数 =====================
  // ===================== 🌟プラン変更のインボイスを取得する関数 料金チェック =====================
  const [isLoadingFetchStripeInvoice, setIsLoadingFetchStripeInvoice] = useState(false);
  // stripeのInvoiceデータを保持するRef
  type StripeInvoiceData = {
    newDailyRateWithThreeDecimalPoints: null | number;
    newUsageAmountWithThreeDecimalPoints: null | number;
    remainingUsageInvoiceItemArray: Stripe.InvoiceLineItem[];
    oldDailyRateWithThreeDecimalPoints: null | number;
    oldUnusedAmountWithThreeDecimalPoints: null | number;
    unusedInvoiceItemArray: Stripe.InvoiceLineItem[];
    nextMonthlyPlanFee: null | number;
    additionalCost: null | number;
    nextInvoiceAmount: null | number;
    upgradePlanInvoiceItemAdditionalCost: null | number;
  };
  const stripeInvoiceFeeRef = useRef<StripeInvoiceData>({
    newDailyRateWithThreeDecimalPoints: null,
    newUsageAmountWithThreeDecimalPoints: null,
    remainingUsageInvoiceItemArray: [],
    oldDailyRateWithThreeDecimalPoints: null,
    oldUnusedAmountWithThreeDecimalPoints: null,
    unusedInvoiceItemArray: [],
    nextMonthlyPlanFee: null,
    additionalCost: null,
    nextInvoiceAmount: null,
    upgradePlanInvoiceItemAdditionalCost: null,
  });
  // stripeにプラン変更の将来のインボイスデータを取得する関数
  const getUpcomingInvoiceChangePlan = useCallback(
    async (newPlanName: string) => {
      try {
        if (!userProfileState) throw new Error("エラー：ユーザー情報が見つかりませんでした。");
        if (!userProfileState?.accounts_to_create) throw new Error("エラー：ユーザー情報が見つかりませんでした。");
        if (!memberAccountsDataArray) throw new Error(`エラー：アカウント情報が見つかりませんでした`);
        if (!premiumPlanFeePerAccountRef.current)
          throw new Error("エラー：プレミアムプランのプランデータが見つかりませんでした。");
        if (!businessPlanFeePerAccountRef.current)
          throw new Error("エラー：ビジネスプランの価格データが見つかりませんでした。");

        setIsLoadingFetchStripeInvoice(true); // ローディング開始

        const payload = {
          stripeCustomerId: userProfileState.stripe_customer_id,
          stripeSubscriptionId: userProfileState.stripe_subscription_id,
          changeQuantity: null, // 数量変更後の合計アカウント数
          changePlanName: newPlanName, // 新たな変更先プラン名
          currentQuantity: userProfileState.accounts_to_create, // プラン変更時の現在の契約アカウント数
        };
        console.log("🌟/retrieve-upcoming-invoiceへaxios.post実行 payload", payload);
        const {
          data: { data: upcomingInvoiceData, error: upcomingInvoiceError },
        } = await axios.post(`/api/subscription/retrieve-upcoming-invoice`, payload, {
          headers: {
            Authorization: `Bearer ${sessionState.access_token}`,
          },
        });

        if (!!upcomingInvoiceError) {
          console.log(
            "❌Stripe将来のインボイス取得ステップ2 /retrieve-upcoming-invoiceへのaxios.postエラー",
            upcomingInvoiceError
          );
          throw new Error(upcomingInvoiceError);
        }

        console.log(
          "🔥/retrieve-upcoming-invoiceへaxios.post成功 次回のインボイスの取得 upcomingInvoiceData",
          upcomingInvoiceData
        );

        // StripeのInvoiceをローカルStateに格納
        setNextInvoiceForChangePlan(upcomingInvoiceData);

        // 来月のアカウント数は数量ダウンスケジュールがあるかどうかで現在の数量かスケジュールの数量を使い分ける
        const nextMonthAccountQuantity =
          deleteAccountRequestSchedule !== null && !!deleteAccountRequestSchedule?.scheduled_quantity
            ? deleteAccountRequestSchedule.scheduled_quantity
            : userProfileState.accounts_to_create;

        // 🔹本日の支払いルート 比例配分日が終了日と一緒 listオブジェクトのdata配列にはsubscriptionタイプのline_itemオブジェクトのみ(新プランのアイテムのみ)
        if (isLastDay && (upcomingInvoiceData as Stripe.UpcomingInvoice).lines.data.length === 1) {
          // 数量ダウンスケジュールが存在する場合には来月分がプレミアムプランではなくスケジュールの次回フェーズのビジネスに置き換わってインボイスが生成されてしまうため、来月プラン価格を除く今月分の追加料金のみチェックするため、本日支払いルートではチェックは無し
          console.log("🌟本日支払いルート 日割り計算必要はなし✅");
          return {
            checkResult: true,
            prorationDateTimeStamp: (upcomingInvoiceData as Stripe.UpcomingInvoice).subscription_proration_date,
          };
        }

        // 🔹ダウングレードルート
        if (!isUpgradePlan) {
          // Decimal
          const nextInvoiceAmountForDowngrade = new Decimal(businessPlanFeePerAccountRef.current)
            .times(nextMonthAccountQuantity)
            .toFixed(0);
          // // 浮動小数点数
          // const nextInvoiceAmountForDowngrade = businessPlanFeePerAccountRef.current * nextMonthAccountQuantity;
          const nextPhaseMonthlyFee =
            !!deleteAccountRequestSchedule &&
            (upcomingInvoiceData as Stripe.UpcomingInvoice).lines.data[
              (upcomingInvoiceData as Stripe.UpcomingInvoice).lines.data.length - 1
            ].quantity !== null
              ? new Decimal(businessPlanFeePerAccountRef.current)
                  .times(
                    new Decimal(
                      (upcomingInvoiceData as Stripe.UpcomingInvoice).lines.data[
                        (upcomingInvoiceData as Stripe.UpcomingInvoice).lines.data.length - 1
                      ].quantity!
                    )
                  )
                  .toFixed(0)
              : (upcomingInvoiceData as Stripe.UpcomingInvoice).lines.data[
                  (upcomingInvoiceData as Stripe.UpcomingInvoice).lines.data.length - 1
                ].amount;
          console.log(
            "🌟ダウングレードルート 日割り計算必要はなしstripeのamount_dueと来月の数量を動的に変更した総額をチェック",
            "来月の支払額stripe (upcomingInvoiceData as Stripe.UpcomingInvoice).amount_due",
            (upcomingInvoiceData as Stripe.UpcomingInvoice).amount_due,
            "来月の支払額ローカル nextInvoiceAmountForDowngrade",
            nextInvoiceAmountForDowngrade,
            "来月のプラン価格(stripe) (upcomingInvoiceData as Stripe.UpcomingInvoice).lines.data[(upcomingInvoiceData as Stripe.UpcomingInvoice).lines.data.length - 1].amount",
            (upcomingInvoiceData as Stripe.UpcomingInvoice).lines.data[
              (upcomingInvoiceData as Stripe.UpcomingInvoice).lines.data.length - 1
            ].amount,
            "来月のプラン ビジネスプラン",
            businessPlanFeePerAccountRef.current,
            "来月の数量 nextMonthAccountQuantity",
            nextMonthAccountQuantity
          );
          // if ((upcomingInvoiceData as Stripe.UpcomingInvoice).amount_due === Number(nextInvoiceAmountForDowngrade)) {
          // if (
          //   (upcomingInvoiceData as Stripe.UpcomingInvoice).lines.data[
          //     (upcomingInvoiceData as Stripe.UpcomingInvoice).lines.data.length - 1
          //   ].amount === Number(nextInvoiceAmountForDowngrade)
          // ) {
          if (Number(nextPhaseMonthlyFee) === Number(nextInvoiceAmountForDowngrade)) {
            console.log("🌟ダウングレードルート ✅料金チェック合格 ");
            return {
              checkResult: true,
              prorationDateTimeStamp: (upcomingInvoiceData as Stripe.UpcomingInvoice).subscription_proration_date,
            };
          } else {
            console.log("🌟ダウングレードルート ❌料金チェック不合格 ");
            return {
              checkResult: false,
              prorationDateTimeStamp: null,
            };
          }
        }
        // StripeのInvoiceの追加費用を計算 ----------------------------------------------------
        // ローカルStateで料金を計算 ----------------------------------------------------
        if (!currentPeriodRef.current) throw new Error(`エラー：請求期間データを取得できませんでした`);
        if (remainingDaysRef.current === null) throw new Error(`エラー：残り期間データを取得できませんでした`);

        // 🔹listオブジェクトのdataの要素1セット以上ルート(本日の支払いではなく通常の次回請求ルート)
        const invoiceItemList = (upcomingInvoiceData as Stripe.UpcomingInvoice).lines.data.filter(
          (item) => item.type === "invoiceitem"
        );
        console.log(
          "InvoiceLineItem[]から未使用、残り使用のみのinvoiceitemタイプのみを取得 invoiceItemList",
          invoiceItemList
        );

        // invoiceItemListが偶数の要素かチェック(偶数なら正確に未使用分と残り使用分を分けられているかチェック)
        // invoiceItemListが偶数の要素かチェック => 奇数のためこのままリターンしてモーダルを閉じる
        if (invoiceItemList.length % 2 === 1) throw new Error(`invoiceItemList配列の要素数が偶数ではないためエラー`);
        // =============== invoiceItem配列が2つでも4つ以上でも共通の値
        // 1. 現在に対する請求期間(日数)
        // 2. 現在に対する残り日数
        // 3. 現在に対するプランの1アカウントあたりの料金
        // 4. 新プラン(新数量)の月額費用

        // 1. 「請求期間（日数）」をローカルStateに格納
        const currentPeriodDays = currentPeriodRef.current;
        // 2. 「残り日数」をローカルStateに格納
        const remainingDays = remainingDaysRef.current;
        // 3. 現在のプランの月額費用/1アカウントあたり
        // const monthlyFeePerAccount = getPrice(userProfileState.subscription_plan);
        // 4. 新プランの月額費用
        // const newMonthlyFee = monthlyFeePerAccount * totalAccountQuantity;

        // 🔹invoiceItemListが1セットのみ => 初回アップグレードルート  配列のinvoiceアイテムが2つのみなら今まで通りの実装
        if (invoiceItemList.length === 2) {
          // 算出しておける項目 アップグレード1回目(変更アイテムは1セットのみ)
          // 3-0. 旧プランの未使用分総額の1日あたりの金額(1セットなのでそのまま総額として計算)
          // 3. 旧プランの未使用分日割り料金の総額
          // 4-0. 新プランの残り使用分総額の1日あたりの金額(1セットなのでそのまま総額として計算)
          // 4. 新プランの残り使用分日割り料金の総額
          // 5. 追加費用の総額
          // 6. 次回支払い総額

          // 未使用、残り使用分のインボイスアイテム
          const unusedInvoiceItem = invoiceItemList.filter((item) => item.description?.startsWith("Unused"))[0];
          const remainingInvoiceItem = invoiceItemList.filter((item) => item.description?.startsWith("Remaining"))[0];
          stripeInvoiceFeeRef.current.newUsageAmountWithThreeDecimalPoints = unusedInvoiceItem.amount;
          stripeInvoiceFeeRef.current.oldUnusedAmountWithThreeDecimalPoints = remainingInvoiceItem.amount;

          // 追加費用(stripe) Decimal
          const stripeAdditionalCost = new Decimal(remainingInvoiceItem.amount)
            .minus(new Decimal(Math.abs(unusedInvoiceItem.amount)))
            .toNumber();
          stripeInvoiceFeeRef.current.additionalCost = stripeAdditionalCost;
          // // 追加費用(stripe) 浮動小数点数
          // const stripeAdditionalCost = remainingInvoiceItem.amount - Math.abs(unusedInvoiceItem.amount);
          // stripeInvoiceFeeRef.current.additionalCost = stripeAdditionalCost;

          // １アカウント当たり追加費用(stripe) Decimal
          const stripeAdditionalCostPerAccount = new Decimal(stripeAdditionalCost)
            .dividedBy(new Decimal(userProfileState.accounts_to_create))
            .toNumber();
          stripeInvoiceFeeRef.current.upgradePlanInvoiceItemAdditionalCost = stripeAdditionalCost;
          // // １アカウント当たり追加費用(stripe) 浮動小数点数
          // const stripeAdditionalCostPerAccount = stripeAdditionalCost / userProfileState.accounts_to_create;
          // stripeInvoiceFeeRef.current.upgradePlanInvoiceItemAdditionalCost = stripeAdditionalCost;

          // 次回の支払額(stripe)
          // 🌟ダウングレードスケジュールが存在するなら次回請求日の初回支払いでは、プラン料金はビジネスプランの価格になるため、newMonthlyFeeを置き換える(残り使用分と未使用分は今月のプランに適用されるため置き換えは無しでOK)
          // const totalPaymentDue =
          //   (upcomingInvoiceData as Stripe.UpcomingInvoice)?.lines?.data[
          //     (upcomingInvoiceData as Stripe.UpcomingInvoice)?.lines?.data.length - 1
          //   ]?.amount + stripeAdditionalCost;
          stripeInvoiceFeeRef.current.nextInvoiceAmount = (upcomingInvoiceData as Stripe.UpcomingInvoice).amount_due;

          // stripeInvoiceFeeRef.current.nextInvoiceAmount = (upcomingInvoiceData as Stripe.UpcomingInvoice).amount_due;

          // ローカルStateで料金を計算 ----------------------------------------------------
          if (!newPlanRemainingAmountPerAccountWithThreeDecimalPointsRef.current)
            throw new Error("エラー：新プランの残り期間の日割り料金データが見つかりませんでした。");
          if (!oldPlanUnusedAmountPerAccountWithThreeDecimalPointsRef.current)
            throw new Error("エラー：旧プランの残り期間の日割り料金データが見つかりませんでした。");
          // １アカウント当たり追加費用(ローカル) Decimal
          const sumExtraChargePerAccountLocal = new Decimal(
            newPlanRemainingAmountPerAccountWithThreeDecimalPointsRef.current
          )
            .minus(new Decimal(Math.abs(oldPlanUnusedAmountPerAccountWithThreeDecimalPointsRef.current)))
            .toNumber();
          // // １アカウント当たり追加費用(ローカル) 浮動小数点数
          // const sumExtraChargePerAccountLocal =
          //   newPlanRemainingAmountPerAccountWithThreeDecimalPointsRef.current -
          //   Math.abs(oldPlanUnusedAmountPerAccountWithThreeDecimalPointsRef.current);

          // 次回請求総額(ローカル)
          const totalPaymentDueLocal =
            premiumPlanFeePerAccountRef.current * nextMonthAccountQuantity +
            Math.round(sumExtraChargePerAccountLocal) * userProfileState.accounts_to_create;

          // ローカルStateで料金を計算 ここまで ----------------------------------------------------

          // 最終チェック用 toFixed()
          const fixedStripeAdditionalCostPerAccount = new Decimal(stripeAdditionalCostPerAccount).toFixed(0);
          const fixedSumExtraChargePerAccountLocal = new Decimal(sumExtraChargePerAccountLocal).toFixed(0);

          // 数量ダウンスケジュールが存在する場合には来月分がプレミアムプランではなくスケジュールの次回フェーズのビジネスに置き換わってインボイスが生成されてしまうため、来月プラン価格を除く今月分の追加料金のみチェックする
          console.log(
            "getUpcomingInvoiceChangePlan関数 料金チェック 🔹invoiceItemListが1セットのみ => 初回アップグレードルート"
          );
          // if (stripeAdditionalCostPerAccount === Math.round(sumExtraChargePerAccountLocal)) {
          if (fixedStripeAdditionalCostPerAccount === fixedSumExtraChargePerAccountLocal) {
            console.log(
              "🌟料金チェック 🔹invoiceItemListが1セットのみ => 初回アップグレードルート ✅チェック関数 次回請求額がローカルと一致 テスト成功✅"
            );
            console.log("✅次回支払い総額", (upcomingInvoiceData as Stripe.UpcomingInvoice).amount_due);
            console.log("✅次回支払い総額(ローカル)", totalPaymentDueLocal);
            console.log(
              "✅追加費用(1アカウントあたり) stripe, ローカル",
              stripeAdditionalCostPerAccount,
              sumExtraChargePerAccountLocal
            );
            console.log(
              "✅追加費用(1アカウントあたり) toFixed stripe, ローカル",
              fixedStripeAdditionalCostPerAccount,
              fixedSumExtraChargePerAccountLocal
            );
            console.log("✅来月アカウント数", nextMonthAccountQuantity);
            console.log("✅現在アカウント数", userProfileState.accounts_to_create);
            console.log(
              "✅来月プラン料金(stripe)",
              (upcomingInvoiceData as Stripe.UpcomingInvoice)?.lines?.data[
                (upcomingInvoiceData as Stripe.UpcomingInvoice)?.lines?.data.length - 1
              ]?.amount
            );
            console.log("✅来月プラン料金(ローカル)", premiumPlanFeePerAccountRef.current * nextMonthAccountQuantity);
            console.log("✅追加費用総額(stripe)", stripeAdditionalCost);
            console.log("✅未使用分の料金", unusedInvoiceItem.amount);
            console.log("✅残り使用分の料金", remainingInvoiceItem.amount);
            return {
              checkResult: true,
              prorationDateTimeStamp: (upcomingInvoiceData as Stripe.UpcomingInvoice).subscription_proration_date,
            };
          } else {
            console.log("🌟料金チェック3 ❌チェック関数 次回請求額がローカルと一致せず テスト失敗❌");
            console.log("❌次回支払い総額", (upcomingInvoiceData as Stripe.UpcomingInvoice).amount_due);
            console.log("❌次回支払い総額(ローカル)", totalPaymentDueLocal);
            console.log(
              "❌追加費用(1アカウントあたり) stripe, ローカル",
              stripeAdditionalCostPerAccount,
              sumExtraChargePerAccountLocal
            );
            console.log(
              "❌追加費用(1アカウントあたり) toFixed stripe, ローカル",
              fixedStripeAdditionalCostPerAccount,
              fixedSumExtraChargePerAccountLocal
            );
            console.log("❌来月アカウント数", nextMonthAccountQuantity);
            console.log("❌現在アカウント数", userProfileState.accounts_to_create);
            console.log(
              "❌来月プラン料金(stripe)",
              (upcomingInvoiceData as Stripe.UpcomingInvoice)?.lines?.data[
                (upcomingInvoiceData as Stripe.UpcomingInvoice)?.lines?.data.length - 1
              ]?.amount
            );
            console.log("❌来月プラン料金(ローカル)", premiumPlanFeePerAccountRef.current * nextMonthAccountQuantity);
            console.log("❌追加費用総額(stripe)", stripeAdditionalCost);
            console.log("❌未使用分の料金", unusedInvoiceItem.amount);
            console.log("❌残り使用分の料金", remainingInvoiceItem.amount);
            return { checkResult: false, prorationDateTimeStamp: null };
          }
        }
        // 🔹🔹アップグレード2回目以上ルート(InvoiceItemの未使用、残り使用が2セット以上)
        // 「アカウントを増やす」が２回目以上の場合 全ての未使用分と全ての使用分を合算して追加費用を算出する
        else if (invoiceItemList.length > 2) {
          // // 「今までの未使用分のインボイスアイテム配列invoiceItemList」を前半、後半で分割する
          // const middleIndex = invoiceItemList.length / 2; // 真ん中のインデックスを把握
          // const firstHalfInvoiceItemList = invoiceItemList.slice(0, middleIndex);
          // const secondHalfInvoiceItemList = invoiceItemList.slice(middleIndex);
          // ======================= 配列分割テスト =======================
          // 「今までの未使用分のインボイスアイテム配列invoiceItemList」を前半、後半で分割する
          // const middleIndex = invoiceItemList.length / 2; // 真ん中のインデックスを把握
          // const firstHalfInvoiceItemList = invoiceItemList.slice(0, middleIndex);
          // const secondHalfInvoiceItemList = invoiceItemList.slice(middleIndex);
          const unusedInvoiceItemList = invoiceItemList
            .filter((item) => item.description?.startsWith("Unused"))
            .sort((a, b) => (a.quantity ?? 0) - (b.quantity ?? 0));
          const remainingHalfInvoiceItemList = invoiceItemList
            .filter((item) => item.description?.startsWith("Remaining"))
            .sort((a, b) => (a.quantity ?? 0) - (b.quantity ?? 0));
          // ======================= 配列分割テスト =======================
          // 未使用部分を未使用分ローカルStateに格納する
          stripeInvoiceFeeRef.current.unusedInvoiceItemArray = unusedInvoiceItemList;
          // 残り使用分をローカルStateに格納する
          stripeInvoiceFeeRef.current.remainingUsageInvoiceItemArray = remainingHalfInvoiceItemList;

          // 算出しておける項目 アップグレード２回目(変更アイテムも２セット以上)
          // 3. 旧プランの未使用分日割り料金の総額
          // 4. 新プランの残り使用分日割り料金の総額
          // 5. 追加費用の総額
          // 6. 次回支払い総額

          // 3. 旧プランの未使用分日割り料金の総額 小数点はないためDecimal不要
          const sumOldUnused = unusedInvoiceItemList.reduce(
            (accumulator, currentValue) => accumulator + currentValue.amount,
            0
          );
          stripeInvoiceFeeRef.current.oldUnusedAmountWithThreeDecimalPoints = sumOldUnused;
          // 💡【旧プランの未使用分の配列から、今回のプランアップグレード用のインボイスアイテムを取り出す】
          // 1. 直近で数量ダウンスケジュール(アカウント削除リクエスト)を作成していても、まだサブスクリプションの更新がされずstripeの「次回のインボイス」には記録されないため、retrieveUpcoming()でstripeから取得したinvoiceのinvoiceItemには数量ダウンは含まれない
          // 2. つまり、数量アップのみフォーカスすれば良い。数量アップした場合必ず毎回Unused、Remainingの両方がquantityが増えるため、最新のインボイスアイテムが一番quantityが大きい。そして、プランアップグレードを行う場合、仮に直近で5個から6個に数量を増やしていた場合、今回のプランアップグレードではquantityは6個から６個とquantityは変化せず、取得されるinvoiceのinvoiceItemのUnusedには一つ前の数量アップのUnusedの5個で、今回のプランアップグレード分は6個になるため、quantityでソートして一番大きな数のアイテムを取得すればプランアップグレード分のインボイスアイテムが取得できる
          // reduceは第二引数の初期値を省略した場合に元の配列が空の場合、TypeErrorを投げコードが止まるのでtry/catchを使用する 初期値を省略しなければエラーは起こらない
          let maxQuantityInvoice: Stripe.InvoiceLineItem | null;
          try {
            maxQuantityInvoice = unusedInvoiceItemList.reduce((max, current) => {
              if (max.quantity === null || current.quantity === null) throw new Error("❌quantityがnull");
              return max.quantity > current.quantity ? max : current;
            });
          } catch (e: any) {
            throw new Error(`エラー：旧プランの残り期間の日割り料金データが見つかりませんでした。${e}`);
          }
          if (maxQuantityInvoice === null)
            throw new Error(`エラー：プランアップグレードの未使用分のインボイスアイテムが見つかりませんでした。`);
          const unusedInvoiceItemUpgradePlan = maxQuantityInvoice;
          console.log(
            "🌟getUpcomingInvoiceChangePlan関数 🔹インボイスアイテムが２セット以上 旧プランの未使用分の配列から、今回のプランアップグレード用のインボイスアイテムを取得 unusedInvoiceItemUpgradePlan",
            unusedInvoiceItemUpgradePlan
          );

          // 4. 新プランの残り使用分日割り料金の総額 小数点はないためDecimal不要
          const sumNewUsage = remainingHalfInvoiceItemList.reduce(
            (accumulator, currentValue) => accumulator + currentValue.amount,
            0
          );
          stripeInvoiceFeeRef.current.newUsageAmountWithThreeDecimalPoints = sumNewUsage;
          // 💡【新プランの残り使用分の配列から、今回のプランアップグレード用のインボイスアイテムを取り出す】
          // 1. プランアップグレードなので、Remainingの中で唯一プランアップグレードのinvoiceItemのみplan.amountがプレミアムプランの19800の価格になるため、これで抽出すれば良い
          const remainingInvoiceItemUpgradePlan = remainingHalfInvoiceItemList.find(
            (item) => item.plan?.amount === premiumPlanFeePerAccountRef.current
          );
          if (!remainingInvoiceItemUpgradePlan)
            throw new Error(`エラー：プランアップグレードの残り使用分のインボイスアイテムが見つかりませんでした。`);
          console.log(
            "🌟getUpcomingInvoiceChangePlan関数 🔹インボイスアイテムが２セット以上 新プランの残り使用分の配列から、今回のプランアップグレード用のインボイスアイテムを取得 remainingInvoiceItemUpgradePlan",
            remainingInvoiceItemUpgradePlan
          );

          // setStripeNewUsageAmountForRemainingPeriodWithThreeDecimalPoints(sumNewUsage);
          // 5. 追加費用の総額 追加費用 = 残り使用分 + (-未使用分)
          const sumExtraCharge = sumNewUsage + sumOldUnused;
          stripeInvoiceFeeRef.current.additionalCost = sumExtraCharge;
          // setStripeAdditionalCostState(sumExtraCharge);
          // 6. 次回支払い総額
          // 🌟ダウングレードスケジュールが存在するなら次回請求日の初回支払いでは、プラン料金はビジネスプランの価格になるため、newMonthlyFeeを置き換える(残り使用分と未使用分は今月のプランに適用されるため置き換えは無しでOK)
          stripeInvoiceFeeRef.current.nextInvoiceAmount = (upcomingInvoiceData as Stripe.UpcomingInvoice).amount_due;
          // setStripeNextInvoiceAmountState((upcomingInvoiceData as Stripe.UpcomingInvoice).amount_due);

          // 💡インボイスアイテムからプランアップグレード分の日割り料金のみを取り出して、
          // 1アカウントごとの料金と、追加費用、追加費用の合計を算出し一致しているか確認
          // (stripe)プランアップグレードインボイスアイテムの追加費用(現在の契約アカウント数全て)
          // const sumExtraChargeUpgradePlan =
          //   remainingInvoiceItemUpgradePlan.amount - Math.abs(unusedInvoiceItemUpgradePlan.amount);
          // Decimal
          const sumExtraChargeUpgradePlan = new Decimal(remainingInvoiceItemUpgradePlan.amount)
            .dividedBy(new Decimal(userProfileState.accounts_to_create))
            .minus(
              new Decimal(Math.abs(unusedInvoiceItemUpgradePlan.amount)).dividedBy(
                new Decimal(userProfileState.accounts_to_create)
              )
            )
            .toNumber();
          // // 浮動小数点数
          // const sumExtraChargeUpgradePlan =
          //   remainingInvoiceItemUpgradePlan.amount / userProfileState.accounts_to_create -
          //   Math.abs(unusedInvoiceItemUpgradePlan.amount / userProfileState.accounts_to_create);
          stripeInvoiceFeeRef.current.upgradePlanInvoiceItemAdditionalCost = sumExtraChargeUpgradePlan;

          // (stripe)次回請求総額 => ❌数量ダウンスケジュールが存在する場合には来月分がプレミアムプランではなくスケジュールの次回フェーズのビジネスに置き換わってインボイスが生成されてしまうため、来月プラン価格を除く今月分の追加料金のみチェックする

          // (stripe)プランアップグレードインボイスアイテムの未使用分(1アカウント当たりの料金)
          // Decimal
          const unusedAmountUpgradePlanPerAccount = new Decimal(unusedInvoiceItemUpgradePlan.amount)
            .dividedBy(new Decimal(userProfileState.accounts_to_create))
            .toNumber();
          // // 浮動小数点数
          // const unusedAmountUpgradePlanPerAccount =
          //   Math.round((unusedInvoiceItemUpgradePlan.amount / userProfileState.accounts_to_create) * 1000) / 1000;

          // (stripe)プランアップグレードインボイスアイテムの残り使用分(1アカウント当たりの料金)
          // Decimal
          const remainingAmountUpgradePlanPerAccount = new Decimal(remainingInvoiceItemUpgradePlan.amount)
            .dividedBy(userProfileState.accounts_to_create)
            .toNumber();
          // // 浮動小数点数
          // const remainingAmountUpgradePlanPerAccount =
          //   Math.round((remainingInvoiceItemUpgradePlan.amount / userProfileState.accounts_to_create) * 1000) / 1000;

          // ローカルStateで料金を計算 ----------------------------------------------------
          if (!newPlanRemainingAmountPerAccountWithThreeDecimalPointsRef.current)
            throw new Error("エラー：新プランの残り期間の日割り料金データが見つかりませんでした。");
          if (!oldPlanUnusedAmountPerAccountWithThreeDecimalPointsRef.current)
            throw new Error("エラー：旧プランの残り期間の日割り料金データが見つかりませんでした。");
          // アカウント1つあたりの料金を算出してローカルの算出結果と比較する
          // (ローカル)プランアップグレードインボイスアイテムの追加費用(現在の契約アカウント数全て)
          // Decimal
          const sumExtraChargeUpgradePlanLocal = new Decimal(
            newPlanRemainingAmountPerAccountWithThreeDecimalPointsRef.current
          )
            .minus(Math.abs(oldPlanUnusedAmountPerAccountWithThreeDecimalPointsRef.current))
            .toNumber();
          // // 浮動小数点数
          // const sumExtraChargeUpgradePlanLocal =
          //   newPlanRemainingAmountPerAccountWithThreeDecimalPointsRef.current -
          //   Math.abs(oldPlanUnusedAmountPerAccountWithThreeDecimalPointsRef.current);

          // (ローカル)プランアップグレードインボイスアイテムの追加費用(1アカウント当たりの料金)

          // ダウングレードには日割り計算はないため、今回ローカルで計算して表示しているのは１アカウントあたりの日割り計算した追加費用なので、追加費用が合っていればOK
          // ローカルStateで料金を計算 ここまで ----------------------------------------------------

          // 💡比較するのはプランアップグレードInvoiceItemに関わる分だけ stripe側は全て新プラン料金とプランアップグレード分の追加費用(未使用分、残り使用分含む)とローカルで算出した新プラン料金にアップグレードプランのインボイスアイテムのみを加算した合計が一致しているか確認
          // if (
          //   !!(upcomingInvoiceData as Stripe.UpcomingInvoice).amount_due &&
          //   (upcomingInvoiceData as Stripe.UpcomingInvoice).amount_due === Math.round(totalPaymentDueLocal) &&
          //   Math.round(sumExtraChargePerAccount) === Math.round(sumExtraChargeUpgradePlanLocal)
          // ) {

          // 最終チェック用 toFixed()
          const fixedSumExtraChargeUpgradePlan = new Decimal(sumExtraChargeUpgradePlan).toFixed(0);
          const fixedSumExtraChargeUpgradePlanLocal = new Decimal(sumExtraChargeUpgradePlanLocal).toFixed(0);
          const fixedRemainingAmountUpgradePlanPerAccount = new Decimal(remainingAmountUpgradePlanPerAccount).toFixed(
            0
          );
          const fixedRemainingAmountUpgradePlanPerAccountLocal = new Decimal(
            newPlanRemainingAmountPerAccountWithThreeDecimalPointsRef.current
          ).toFixed(0);
          const fixedUnusedAmountUpgradePlanPerAccount = new Decimal(
            Math.abs(unusedAmountUpgradePlanPerAccount)
          ).toFixed(0);
          const fixedUnusedAmountUpgradePlanPerAccountLocal = new Decimal(
            oldPlanUnusedAmountPerAccountWithThreeDecimalPointsRef.current
          ).toFixed(0);

          // 数量ダウンスケジュールが存在する場合には来月分がプレミアムプランではなくスケジュールの次回フェーズのビジネスに置き換わってインボイスが生成されてしまうため、来月プラン価格を除く今月分の追加料金のみチェックするため、本日支払いルートではチェックは無し
          console.log(
            "getUpcomingInvoiceChangePlan関数 料金チェック 🔹invoiceItemListが2セット以上 => アップグレード２回目以降ルート"
          );
          // if (
          //   Math.round(sumExtraChargeUpgradePlan) === Math.round(sumExtraChargeUpgradePlanLocal) &&
          //   Math.round(remainingAmountUpgradePlanPerAccount) ===
          //     Math.round(newPlanRemainingAmountPerAccountWithThreeDecimalPointsRef.current) &&
          //   Math.round(Math.abs(unusedAmountUpgradePlanPerAccount)) ===
          //     Math.round(oldPlanUnusedAmountPerAccountWithThreeDecimalPointsRef.current)
          // ) {
          // if (
          //   fixedSumExtraChargeUpgradePlan === fixedSumExtraChargeUpgradePlanLocal &&
          //   fixedRemainingAmountUpgradePlanPerAccount === fixedRemainingAmountUpgradePlanPerAccountLocal &&
          //   fixedUnusedAmountUpgradePlanPerAccount === fixedUnusedAmountUpgradePlanPerAccountLocal
          // ) {
          if (fixedSumExtraChargeUpgradePlan === fixedSumExtraChargeUpgradePlanLocal) {
            console.log(
              "✅料金チェック 🔹インボイスアイテム2セット以上ルート => プラン、数量変更２回目以上 ✅チェック関数 次回請求額がローカルと一致 テスト成功✅ getUpcomingInvoiceChangePlan関数"
            );
            console.log(
              "✅アップグレードアイテムの追加費用(1アカウントあたり) stripe, ローカル",
              sumExtraChargeUpgradePlan,
              sumExtraChargeUpgradePlanLocal,
              "toFixed stripe, ローカル",
              fixedSumExtraChargeUpgradePlan,
              fixedSumExtraChargeUpgradePlanLocal
            );
            console.log(
              "✅残り使用分料金アップグレードアイテムのみ(1アカウントあたり) stripe, ローカル",
              remainingAmountUpgradePlanPerAccount,
              newPlanRemainingAmountPerAccountWithThreeDecimalPointsRef.current,
              "toFixed stripe, ローカル",
              fixedRemainingAmountUpgradePlanPerAccount,
              fixedRemainingAmountUpgradePlanPerAccountLocal
            );
            console.log(
              "✅未使用分料金アップグレードアイテムのみ(1アカウントあたり) stripe, ローカル",
              Math.abs(unusedAmountUpgradePlanPerAccount),
              oldPlanUnusedAmountPerAccountWithThreeDecimalPointsRef.current,
              "toFixed stripe, ローカル",
              fixedUnusedAmountUpgradePlanPerAccount,
              fixedUnusedAmountUpgradePlanPerAccountLocal
            );
            console.log(
              "✅来月アカウント数",
              nextMonthAccountQuantity,
              "✅現在アカウント数",
              userProfileState.accounts_to_create
            );
            console.log(
              "✅来月プラン料金 stripe, ローカル",
              (upcomingInvoiceData as Stripe.UpcomingInvoice)?.lines?.data[
                (upcomingInvoiceData as Stripe.UpcomingInvoice)?.lines?.data.length - 1
              ]?.amount,
              premiumPlanFeePerAccountRef.current * nextMonthAccountQuantity
            );
            return {
              checkResult: true,
              prorationDateTimeStamp: (upcomingInvoiceData as Stripe.UpcomingInvoice).subscription_proration_date,
            };
          } else {
            console.log(
              "❌料金チェック 🔹インボイスアイテム2セット以上ルート => プラン、数量変更２回目以上 ❌チェック関数 次回請求額がローカルと一致せず テスト失敗❌"
            );
            console.log(
              "❌アップグレードアイテムの追加費用(1アカウントあたり) stripe, ローカル",
              sumExtraChargeUpgradePlan,
              sumExtraChargeUpgradePlanLocal,
              "toFixed stripe, ローカル",
              fixedSumExtraChargeUpgradePlan,
              fixedSumExtraChargeUpgradePlanLocal
            );
            console.log(
              "❌残り使用分料金アップグレードアイテムのみ(1アカウントあたり) stripe, ローカル",
              remainingAmountUpgradePlanPerAccount,
              newPlanRemainingAmountPerAccountWithThreeDecimalPointsRef.current,
              "toFixed stripe, ローカル",
              fixedRemainingAmountUpgradePlanPerAccount,
              fixedRemainingAmountUpgradePlanPerAccountLocal
            );
            console.log(
              "❌未使用分料金アップグレードアイテムのみ(1アカウントあたり) stripe, ローカル",
              Math.abs(unusedAmountUpgradePlanPerAccount),
              oldPlanUnusedAmountPerAccountWithThreeDecimalPointsRef.current,
              "toFixed stripe, ローカル",
              fixedUnusedAmountUpgradePlanPerAccount,
              fixedUnusedAmountUpgradePlanPerAccountLocal
            );
            console.log(
              "❌来月アカウント数",
              nextMonthAccountQuantity,
              "❌現在アカウント数",
              userProfileState.accounts_to_create
            );
            console.log(
              "❌来月プラン料金 stripe, ローカル",
              (upcomingInvoiceData as Stripe.UpcomingInvoice)?.lines?.data[
                (upcomingInvoiceData as Stripe.UpcomingInvoice)?.lines?.data.length - 1
              ]?.amount,
              premiumPlanFeePerAccountRef.current * nextMonthAccountQuantity
            );
            return { checkResult: false, prorationDateTimeStamp: null };
          }
        }
        // StripeのInvoiceの追加費用を計算 ここまで ----------------------------------------------------
        // stripeのインボイスのamountと、ローカル計算結果が一致しているかテスト
        // if ((upcomingInvoiceData as Stripe.UpcomingInvoice).amount_due === Math.round(nextInvoiceAmountLocal)) {
        //   setIsLoadingFetchStripeInvoice(false); // ローディング終了
        //   if (notMatchInvoiceChangePlan) setNotMatchInvoiceChangePlan(false);
        // } else {
        //   setIsLoadingFetchStripeInvoice(false); // ローディング終了
        //   setNotMatchInvoiceChangePlan(true);
        // }
        return { checkResult: false, prorationDateTimeStamp: null };
      } catch (e: any) {
        console.error(`エラー: `, e);
        alert(`問題が発生しました。サポートに報告の上、しばらく経ってからやり直してください。`);
        return { checkResult: false, prorationDateTimeStamp: null };
      }
    },
    [
      sessionState.access_token,
      userProfileState,
      setNextInvoiceForChangePlan,
      isUpgradePlan,
      deleteAccountRequestSchedule,
      memberAccountsDataArray,
      isLastDay,
    ]
  );

  // ===================== 🌟プラン変更モーダルを開く際のイベントハンドラ =====================

  const handleOpenChangePlanModal = async () => {
    if (!userProfileState?.subscription_plan) return alert(`エラー：ユーザー情報が見つかりませんでした。`);
    if (!userProfileState?.current_period_end) return alert(`エラー：ユーザー情報が見つかりませんでした。`);

    // プランダウングレードスケジュールが存在するなら、スケジュールキャンセルモーダルを開く
    if (!!downgradePlanSchedule && downgradePlanSchedule.type === "change_plan") {
      setShowConfirmCancelModal("downgrade_request");
      return;
    }

    // ダウングレードの場合は比例配分は行わないため、そのまま開く
    if (userProfileState.subscription_plan === "premium_plan") {
      setIsOpenChangePlanModal(true);
      if (isUpgradePlan) setIsUpgradePlan(false);
      return;
    }

    // 🔹ビジネスプランからアップグレードルート (アップグレードは日割り計算が必要)
    // モーダル開いた日付を取得して今日が期間終了日と一致するかを確認する
    // モーダル開いた日付を取得(時刻情報なし) 💡テストクロックモードのため2028-11-20で現在の日付を作成
    const currentDateObj = new Date("2028-11-20"); // テストクロック
    const year = currentDateObj.getFullYear();
    const month = currentDateObj.getMonth();
    const day = currentDateObj.getDate();
    const currentDateOnly = new Date(year, month, day); // 現在の日付の時刻情報をリセット
    // 期間終了日を取得(時刻情報なし) UNIXタイムスタンプ(10桁)なら1000倍してミリ秒に変換
    const currentPeriodEndDateObj = new Date(userProfileState.current_period_end);
    const currentPeriodEndYear = currentPeriodEndDateObj.getFullYear();
    const currentPeriodEndMonth = currentPeriodEndDateObj.getMonth();
    const currentPeriodEndDay = currentPeriodEndDateObj.getDate();
    const currentPeriodEndDateOnly = new Date(currentPeriodEndYear, currentPeriodEndMonth, currentPeriodEndDay); // currentPeriodEndの日付の時刻情報をリセット
    // isLastDayをtrueに
    if (currentDateOnly === currentPeriodEndDateOnly) setIsLastDay(true);

    // アップグレード用日割り計算 現在のプランがビジネスプラン => プレミアムプランへ
    const periodEndDate = new Date(userProfileState.current_period_end);
    const remaining = getRemainingDaysFromNowPeriodEndHourToTimestamp(periodEndDate.getTime()).remainingDays;
    remainingDaysRef.current = remaining;
    // 💡新プランの1日当たりの料金 (全て1アカウントあたりで計算) Decimal.js refへの保持は小数点数が多くても計算精度が担保されるためそのまま渡す。そして、最後にJSXでユーザーに表示する時にdecimalPlaces(3).toString()で小数点第三位にして表示
    const newPlanDailyRateWithThreeDecimalPoints =
      !!premiumPlanFeePerAccountRef.current && !!currentPeriodRef.current
        ? new Decimal(premiumPlanFeePerAccountRef.current)
            .dividedBy(new Decimal(currentPeriodRef.current)) // 除算
            // .toDecimalPlaces(3) // 小数点以下第三位で四捨五入 => 最後の詳細画面で第三位に四捨五入する
            .toNumber() // 結果を通常の数値形式に変換(文字列)、これを数値型に変換する場合には、Number()に渡す
        : null;
    // 新プランの1日当たりの料金 (全て1アカウントあたりで計算) 浮動小数点数で計算
    // const newPlanDailyRateWithThreeDecimalPoints =
    //   !!premiumPlanFeePerAccountRef.current && !!currentPeriodRef.current
    //     ? Math.round((premiumPlanFeePerAccountRef.current / currentPeriodRef.current) * 1000) / 1000
    //     : null;
    // 💡新プランの残り利用分の日割り料金 Decimal.js
    const remainingAmount =
      !!newPlanDailyRateWithThreeDecimalPoints && !!remaining
        ? new Decimal(newPlanDailyRateWithThreeDecimalPoints).times(new Decimal(remaining)).toNumber() // 乗算
        : null;
    newPlanRemainingAmountPerAccountWithThreeDecimalPointsRef.current = remainingAmount;
    // 新プランの残り利用分の日割り料金 浮動小数点数
    // const remainingAmount =
    //   !!newPlanDailyRateWithThreeDecimalPoints && !!remaining
    //     ? Math.round(newPlanDailyRateWithThreeDecimalPoints * remaining * 1000) / 1000
    //     : null;
    // newPlanRemainingAmountPerAccountWithThreeDecimalPointsRef.current = remainingAmount;
    // 💡旧プランの1日当たりの料金 Decimal
    const oldPlanDailyRateWithThreeDecimalPoints =
      !!businessPlanFeePerAccountRef.current && !!currentPeriodRef.current
        ? new Decimal(businessPlanFeePerAccountRef.current).dividedBy(new Decimal(currentPeriodRef.current)).toNumber() // 除算
        : null;
    // // 旧プランの1日当たりの料金 浮動小数点数
    // const oldPlanDailyRateWithThreeDecimalPoints =
    //   !!businessPlanFeePerAccountRef.current && !!currentPeriodRef.current
    //     ? Math.round((businessPlanFeePerAccountRef.current / currentPeriodRef.current) * 1000) / 1000
    //     : null;
    // 💡新プランの残り利用分の日割り料金 Decimal
    const unusedAmount =
      !!oldPlanDailyRateWithThreeDecimalPoints && !!remaining
        ? new Decimal(oldPlanDailyRateWithThreeDecimalPoints).times(new Decimal(remaining)).toNumber()
        : null;
    oldPlanUnusedAmountPerAccountWithThreeDecimalPointsRef.current = unusedAmount;
    // // 新プランの残り利用分の日割り料金 浮動小数点数
    // const unusedAmount =
    //   !!oldPlanDailyRateWithThreeDecimalPoints && !!remaining
    //     ? Math.round(oldPlanDailyRateWithThreeDecimalPoints * remaining * 1000) / 1000
    //     : null;
    // oldPlanUnusedAmountPerAccountWithThreeDecimalPointsRef.current = unusedAmount;

    // アップグレードプランのインボイスアイテムの日割り計算を終えたらモーダルを開く
    setIsOpenChangePlanModal(true);
    setIsUpgradePlan(true); // アップグレードモードをtrueに
  };
  // ===================== ✅プラン変更モーダルを開く際のイベントハンドラ ここまで =====================

  // ===================== 🌟今すぐアップグレード/今すぐダウングレード 「変更を確定」モーダルを開く =====================
  const handleOpenConfirmChangePlanModal = async () => {
    if (isLoadingFetchStripeInvoice) return;
    if (!premiumPlanFeePerAccountRef.current)
      return console.log("エラー：プレミアムプランの料金を取得できませんでした。");
    if (!businessPlanFeePerAccountRef.current)
      return console.log("エラー：ビジネスプランの料金を取得できませんでした。");
    if (!userProfileState?.accounts_to_create)
      return console.log("エラー：現在のアカウント契約数を取得できませんでした。");

    console.log("🌟今すぐアップグレード/ダウングレードクリック");

    // ビジネスプランからアップグレードルート
    // 🔹インボイスデータが存在しないルート
    if (!nextInvoiceForChangePlan) {
      // フェッチはアップグレードのみでOK
      if (isUpgradePlan) {
        console.log("🌟インボイスデータが存在しない初回フェッチルート");
        // stripeにインボイスデータを取得する
        const result = await getUpcomingInvoiceChangePlan(isUpgradePlan ? `premium_plan` : `business_plan`);
        setIsLoadingFetchStripeInvoice(false); // ローディング終了
        if (!result.checkResult) setNotMatchInvoiceChangePlan(true); // 料金チェックが不合格なので3つ目のセクションを表示
      }
      setIsOpenConfirmChangePlanModal(true); // 確定モーダルを開く
    }
    // 🔹インボイスデータが存在するルート
    else if (!!nextInvoiceForChangePlan?.subscription_proration_date) {
      console.log(
        "🌟インボイスデータが存在するフェッチ無しルート nextInvoiceForChangePlan.lines.data.length",
        nextInvoiceForChangePlan.lines.data.length
      );

      setIsLoadingFetchStripeInvoice(true); // ローディング開始

      try {
        // 既にプラン変更インボイスが存在するなら、次は現在とインボイスの比例配分の日付が同じかどうかを確認する
        // モーダル開いた日付を取得(時刻情報なし) 💡テストクロックモードのため2028-11-20で現在の日付を作成
        const currentDateObj = new Date("2028-11-20"); // テストクロック
        const year = currentDateObj.getFullYear();
        const month = currentDateObj.getMonth();
        const day = currentDateObj.getDate();
        const currentDateOnly = new Date(year, month, day); // 現在の日付の時刻情報をリセット
        // nextInvoiceの比例配分の日付を取得(時刻情報なし) UNIXタイムスタンプ(10桁)なら1000倍してミリ秒に変換
        const nextInvoiceCreatedInMillisecond =
          nextInvoiceForChangePlan.subscription_proration_date.toString().length === 10
            ? nextInvoiceForChangePlan.subscription_proration_date * 1000
            : nextInvoiceForChangePlan.subscription_proration_date;
        const nextInvoiceDateObj = new Date(nextInvoiceCreatedInMillisecond);
        const nextInvoiceYear = nextInvoiceDateObj.getFullYear();
        const nextInvoiceMonth = nextInvoiceDateObj.getMonth();
        const nextInvoiceDay = nextInvoiceDateObj.getDate();
        const nextInvoiceSubscriptionProrationDateOnly = new Date(nextInvoiceYear, nextInvoiceMonth, nextInvoiceDay); // nextInvoiceの日付の時刻情報をリセット

        if (currentDateOnly.getTime() !== nextInvoiceSubscriptionProrationDateOnly.getTime()) {
          console.log(
            "❌現在の日時とインボイスの比例配分日の日付が一致せず stripeのインボイスをフェッチする",
            "現在の日付",
            currentDateOnly.getTime(),
            format(currentDateOnly, "yyyy年MM月dd日 HH:mm:ss"),
            "インボイスState比例配分の日付",
            nextInvoiceSubscriptionProrationDateOnly.getTime(),
            format(nextInvoiceSubscriptionProrationDateOnly, "yyyy年MM月dd日 HH:mm:ss")
          );
          throw new Error("❌現在の日時とインボイスの比例配分日の日付が一致せず stripeのインボイスをフェッチする");
        }

        // 来月のアカウント数は数量ダウンスケジュールがあるかどうかで現在の数量かスケジュールの数量を使い分ける
        const nextMonthAccountQuantity =
          deleteAccountRequestSchedule !== null && !!deleteAccountRequestSchedule?.scheduled_quantity
            ? deleteAccountRequestSchedule.scheduled_quantity
            : userProfileState.accounts_to_create;

        // 🔹ダウングレードルート 日割り料金なし
        if (!isUpgradePlan) {
          console.log(
            "🌟料金チェックなし インボイスデータが存在するフェッチ無しルート 🔹ダウングレードルート 日割り料金なし"
          );

          setIsLoadingFetchStripeInvoice(false); // ローディング終了
          setIsOpenConfirmChangePlanModal(true); // 確定モーダルを開く
          return;
        }

        // 🔹アップグレードルート

        if (!newPlanRemainingAmountPerAccountWithThreeDecimalPointsRef.current) {
          throw new Error("エラー：新プラン残り日割り料金が取得できませんでした。");
        }
        if (!oldPlanUnusedAmountPerAccountWithThreeDecimalPointsRef.current)
          throw new Error("エラー：旧プラン残り日割り料金が取得できませんでした");
        if (!currentPeriodRef.current) throw new Error("エラー：請求期間の日数が取得できませんでした");
        if (!remainingDaysRef.current) throw new Error("エラー：請求期間までの残り日数が取得できませんでした");

        // 🔹今日が期間終了日ルート 日割り料金なし
        if (isLastDay && nextInvoiceForChangePlan.lines.data.length === 1) {
          console.log(
            "🌟料金チェック無し インボイスデータが存在するフェッチ無しルート 🔹今日が期間終了日ルート 日割り料金なし"
          );
          setIsOpenConfirmChangePlanModal(true);
          return;
        }

        // 🔹listオブジェクトのdataの要素1セット以上ルート(本日の支払いではなく通常の次回請求ルート)
        const invoiceItemList = nextInvoiceForChangePlan.lines.data.filter((item) => item.type === "invoiceitem");
        console.log(
          "InvoiceLineItem[]から未使用、残り使用のみのinvoiceitemタイプのみを取得 invoiceItemList",
          invoiceItemList
        );

        // インボイスアイテムが奇数の場合はあり得ないためエラーをスロー
        if (invoiceItemList.length % 2 === 1)
          throw new Error("ローカルインボイスlines.data.lengthが奇数のためエラー stripeインボイスをフェッチ");

        // 1. 「請求期間（日数）」をローカルStateに格納
        const currentPeriodDays = currentPeriodRef.current;
        // 2. 「残り日数」をローカルStateに格納
        const remainingDays = remainingDaysRef.current;

        // 🔹インボイスアイテムが１セットのみ => 今回が初回アップデート(数量アップもなし)
        if (invoiceItemList.length === 2) {
          console.log(
            "🌟インボイスデータが存在するフェッチ無しルート invoiceItemList.lengthが1セットのみ初回アップデートルート"
          );
          const unusedInvoiceItem = invoiceItemList.filter((item) => item.description?.startsWith("Unused"))[0];
          const remainingInvoiceItem = invoiceItemList.filter((item) => item.description?.startsWith("Remaining"))[0];

          //
          // 旧プランの残り未使用分の料金(stripe)
          stripeInvoiceFeeRef.current.newUsageAmountWithThreeDecimalPoints = unusedInvoiceItem.amount;
          // 新プランの残り使用分の料金(stripe)
          stripeInvoiceFeeRef.current.oldUnusedAmountWithThreeDecimalPoints = remainingInvoiceItem.amount;
          // 追加費用(stripe)
          // Decimal
          const stripeAdditionalCost = new Decimal(remainingInvoiceItem.amount)
            .minus(new Decimal(Math.abs(unusedInvoiceItem.amount)))
            .toNumber();
          // // 浮動少数点数
          // const stripeAdditionalCost = remainingInvoiceItem.amount - Math.abs(unusedInvoiceItem.amount);
          stripeInvoiceFeeRef.current.additionalCost = stripeAdditionalCost;
          // 次回の支払額
          // 🌟ダウングレードスケジュールが存在するなら次回請求日の初回支払いでは、プラン料金はビジネスプランの価格になるため、newMonthlyFeeを置き換える(残り使用分と未使用分は今月のプランに適用されるため置き換えは無しでOK)
          // 次回請求総額(stripe)
          stripeInvoiceFeeRef.current.nextInvoiceAmount = (
            nextInvoiceForChangePlan as Stripe.UpcomingInvoice
          ).amount_due;
          // 1アカウントあたりの追加費用(stripe)
          // 浮動小数点数
          const stripeAdditionalCostPerAccount = new Decimal(stripeAdditionalCost)
            .dividedBy(new Decimal(userProfileState.accounts_to_create))
            .toNumber();
          // // 浮動小数点数
          // const stripeAdditionalCostPerAccount = stripeAdditionalCost / userProfileState.accounts_to_create;
          // 💡チェック失敗用に格納 🔹インボイスアイテムが１セットのみ => つまりアップグレードプランアイテムのみ
          stripeInvoiceFeeRef.current.upgradePlanInvoiceItemAdditionalCost = stripeAdditionalCostPerAccount;

          // ローカルStateで料金を計算 ----------------------------------------------------
          if (!newPlanRemainingAmountPerAccountWithThreeDecimalPointsRef.current)
            throw new Error("エラー：新プランの残り期間の日割り料金データが見つかりませんでした。");
          if (!oldPlanUnusedAmountPerAccountWithThreeDecimalPointsRef.current)
            throw new Error("エラー：旧プランの残り期間の日割り料金データが見つかりませんでした。");
          // 1アカウントあたりで計算
          // アップグレードインボイスアイテムの追加費用(ローカル)
          const sumExtraChargePerAccountLocal =
            newPlanRemainingAmountPerAccountWithThreeDecimalPointsRef.current -
            Math.abs(oldPlanUnusedAmountPerAccountWithThreeDecimalPointsRef.current);
          // ローカルStateで料金を計算 ここまで ----------------------------------------------------

          // 最終チェック用 toFixed()
          const fixedStripeAdditionalCostPerAccount = new Decimal(stripeAdditionalCostPerAccount).toFixed(0);
          const fixedSumExtraChargePerAccountLocal = new Decimal(sumExtraChargePerAccountLocal).toFixed(0);

          console.log(
            "🌟料金チェック インボイスデータが存在するフェッチ無しルート 🔹インボイスアイテムが１セットのみ 初回アップデート"
          );
          // if (stripeAdditionalCostPerAccount === Math.round(sumExtraChargePerAccountLocal)) {
          if (fixedStripeAdditionalCostPerAccount === fixedSumExtraChargePerAccountLocal) {
            console.log(
              "🌟料金チェック インボイスデータが存在するフェッチ無しルート 🔹インボイスアイテムが１セットのみ => 初回アップデート ✅チェック関数 次回請求額がローカルと一致 テスト成功✅"
            );
            console.log(
              "✅アップグレードアイテムの追加費用(1アカウントあたり) stripe, ローカル",
              stripeAdditionalCostPerAccount,
              sumExtraChargePerAccountLocal
            );
            console.log(
              "✅アップグレードアイテムの追加費用(1アカウントあたり) toFixed stripe, ローカル",
              fixedStripeAdditionalCostPerAccount,
              fixedSumExtraChargePerAccountLocal
            );
            console.log("✅来月アカウント数", nextMonthAccountQuantity);
            console.log("✅現在アカウント数", userProfileState.accounts_to_create);
            console.log(
              "✅来月プラン料金(stripe)",
              (nextInvoiceForChangePlan as Stripe.UpcomingInvoice)?.lines?.data[
                (nextInvoiceForChangePlan as Stripe.UpcomingInvoice)?.lines?.data.length - 1
              ]?.amount
            );
            console.log(
              "✅来月プラン料金(ローカル)",
              new Decimal(premiumPlanFeePerAccountRef.current).times(new Decimal(nextMonthAccountQuantity)).toNumber()
            );
            console.log(
              "✅残り使用分料金アップグレードアイテムのみ(1アカウント当たり) stripe, ローカル",
              new Decimal(remainingInvoiceItem.amount)
                .dividedBy(new Decimal(userProfileState.accounts_to_create))
                .toNumber(),
              newPlanRemainingAmountPerAccountWithThreeDecimalPointsRef.current
            );
            console.log(
              "✅未使用分料金アップグレードアイテムのみ(1アカウント当たり) stripe, ローカル",
              new Decimal(Math.abs(unusedInvoiceItem.amount))
                .dividedBy(new Decimal(userProfileState.accounts_to_create))
                .toNumber(),
              oldPlanUnusedAmountPerAccountWithThreeDecimalPointsRef.current
            );
            setIsLoadingFetchStripeInvoice(false); // ローディング終了
            setIsOpenConfirmChangePlanModal(true); // 確定モーダルを開く
            if (notMatchInvoiceChangePlan) setNotMatchInvoiceChangePlan(false); // trueならfalseに戻す
          } else {
            console.log(
              "🌟料金チェック インボイスデータが存在するフェッチ無しルート 🔹インボイスアイテムが１セットのみ => 初回アップデート ❌チェック関数 次回請求額がローカルと不一致 テスト失敗❌"
            );
            console.log(
              "❌アップグレードアイテムの追加費用(1アカウントあたり) stripe, ローカル",
              stripeAdditionalCostPerAccount,
              sumExtraChargePerAccountLocal
            );
            console.log(
              "❌アップグレードアイテムの追加費用(1アカウントあたり) toFixed stripe, ローカル",
              fixedStripeAdditionalCostPerAccount,
              fixedSumExtraChargePerAccountLocal
            );
            console.log("❌来月アカウント数", nextMonthAccountQuantity);
            console.log("❌現在アカウント数", userProfileState.accounts_to_create);
            console.log(
              "❌来月プラン料金(stripe)",
              (nextInvoiceForChangePlan as Stripe.UpcomingInvoice)?.lines?.data[
                (nextInvoiceForChangePlan as Stripe.UpcomingInvoice)?.lines?.data.length - 1
              ]?.amount
            );
            console.log(
              "❌来月プラン料金(ローカル)",
              new Decimal(premiumPlanFeePerAccountRef.current).times(new Decimal(nextMonthAccountQuantity)).toNumber()
            );
            console.log(
              "❌残り使用分料金アップグレードアイテムのみ(1アカウント当たり) stripe, ローカル",
              new Decimal(remainingInvoiceItem.amount)
                .dividedBy(new Decimal(userProfileState.accounts_to_create))
                .toNumber(),
              newPlanRemainingAmountPerAccountWithThreeDecimalPointsRef.current
            );
            console.log(
              "❌未使用分料金アップグレードアイテムのみ(1アカウント当たり) stripe, ローカル",
              new Decimal(Math.abs(unusedInvoiceItem.amount))
                .dividedBy(new Decimal(userProfileState.accounts_to_create))
                .toNumber(),
              oldPlanUnusedAmountPerAccountWithThreeDecimalPointsRef.current
            );
            throw new Error("料金チェック不合格❎ stripeインボイスをフェッチ");
          }

          //
        }
        // 🔹インボイスアイテムが２セット以上 => 今回のアップデートが２回目以上(数量アップも含む)
        else if (invoiceItemList.length > 2) {
          console.log(
            "🌟インボイスデータが存在するフェッチ無しルート 🔹インボイスアイテムが２セット以上 invoiceItemList.lengthが1セット以上２回目以降アップデート",
            invoiceItemList.length
          );
          // 未使用分インボイスアイテム配列(stripe)
          const unusedInvoiceItemList = invoiceItemList
            .filter((item) => item.description?.startsWith("Unused"))
            .sort((a, b) => (a.quantity ?? 0) - (b.quantity ?? 0));
          // 残り使用分インボイスアイテム配列(stripe)
          const remainingHalfInvoiceItemList = invoiceItemList
            .filter((item) => item.description?.startsWith("Remaining"))
            .sort((a, b) => (a.quantity ?? 0) - (b.quantity ?? 0));
          // ======================= 配列分割テスト =======================
          // 未使用部分を未使用分ローカルStateに格納する
          stripeInvoiceFeeRef.current.unusedInvoiceItemArray = unusedInvoiceItemList;
          // 残り使用分をローカルStateに格納する
          stripeInvoiceFeeRef.current.remainingUsageInvoiceItemArray = remainingHalfInvoiceItemList;

          // 3. 旧プランの未使用分日割り料金の総額(stripe)
          const sumOldUnused = unusedInvoiceItemList.reduce(
            (accumulator, currentValue) => accumulator + currentValue.amount,
            0
          );
          stripeInvoiceFeeRef.current.oldUnusedAmountWithThreeDecimalPoints = sumOldUnused;
          // 💡【旧プランの未使用分の配列から、今回のプランアップグレード用のインボイスアイテムを取り出す】
          let maxQuantityInvoice: Stripe.InvoiceLineItem | null;
          try {
            maxQuantityInvoice = unusedInvoiceItemList.reduce((max, current) => {
              if (max.quantity === null || current.quantity === null) throw new Error("❌quantityがnull");
              return max.quantity > current.quantity ? max : current;
            });
          } catch (e: any) {
            throw new Error(`エラー：旧プランの残り期間の日割り料金データが見つかりませんでした。${e}`);
          }
          if (maxQuantityInvoice === null)
            throw new Error(`エラー：プランアップグレードの未使用分のインボイスアイテムが見つかりませんでした。`);
          const unusedInvoiceItemUpgradePlan = maxQuantityInvoice;
          console.log(
            "🌟インボイスデータが存在するフェッチ無しルート 🔹インボイスアイテムが２セット以上 旧プランの未使用分の配列から、今回のプランアップグレード用のインボイスアイテムを取得 unusedInvoiceItemUpgradePlan",
            unusedInvoiceItemUpgradePlan
          );

          // 4. 新プランの残り使用分日割り料金の総額(stripe)
          const sumNewUsage = remainingHalfInvoiceItemList.reduce(
            (accumulator, currentValue) => accumulator + currentValue.amount,
            0
          );
          stripeInvoiceFeeRef.current.newUsageAmountWithThreeDecimalPoints = sumNewUsage;
          // 💡【新プランの残り使用分の配列から、今回のプランアップグレード用のインボイスアイテムを取り出す】
          const remainingInvoiceItemUpgradePlan = remainingHalfInvoiceItemList.find(
            (item) => item.plan?.amount === premiumPlanFeePerAccountRef.current
          );
          if (!remainingInvoiceItemUpgradePlan)
            throw new Error(`エラー：プランアップグレードの残り使用分のインボイスアイテムが見つかりませんでした。`);
          console.log(
            "🌟インボイスデータが存在するフェッチ無しルート 🔹インボイスアイテムが２セット以上 新プランの残り使用分の配列から、今回のプランアップグレード用のインボイスアイテムを取得 remainingInvoiceItemUpgradePlan",
            remainingInvoiceItemUpgradePlan
          );

          // 5. 追加費用の総額 追加費用 = 残り使用分 + (-未使用分) (stripe)整数なのでDecimal不要
          const sumExtraCharge = sumNewUsage + sumOldUnused;
          stripeInvoiceFeeRef.current.additionalCost = sumExtraCharge;
          // setStripeAdditionalCostState(sumExtraCharge);
          // 6. 次回支払い総額(stripe)
          // 🌟ダウングレードスケジュールが存在するなら次回請求日の初回支払いでは、プラン料金はビジネスプランの価格になるため、newMonthlyFeeを置き換える(残り使用分と未使用分は今月のプランに適用されるため置き換えは無しでOK)
          stripeInvoiceFeeRef.current.nextInvoiceAmount = (
            nextInvoiceForChangePlan as Stripe.UpcomingInvoice
          ).amount_due;

          // 💡インボイスアイテムからプランアップグレード分の日割り料金のみを取り出して、
          // 追加費用(１アカウントごと)(stripe)
          // Decimal
          const sumExtraChargeUpgradePlanPerAccount = new Decimal(remainingInvoiceItemUpgradePlan.amount)
            .dividedBy(new Decimal(userProfileState.accounts_to_create))
            .minus(
              new Decimal(Math.abs(unusedInvoiceItemUpgradePlan.amount)).dividedBy(
                new Decimal(userProfileState.accounts_to_create)
              )
            )
            .toNumber();
          // // 浮動小数点数
          // const sumExtraChargeUpgradePlanPerAccount =
          //   remainingInvoiceItemUpgradePlan.amount / userProfileState.accounts_to_create -
          //   Math.abs(unusedInvoiceItemUpgradePlan.amount / userProfileState.accounts_to_create);
          stripeInvoiceFeeRef.current.upgradePlanInvoiceItemAdditionalCost = sumExtraChargeUpgradePlanPerAccount;

          // 未使用分、残り使用分(1アカウントごと)(stripe)
          // Decimal
          const unusedAmountUpgradePlanPerAccount = new Decimal(unusedInvoiceItemUpgradePlan.amount)
            .dividedBy(new Decimal(userProfileState.accounts_to_create))
            .toNumber();
          const remainingAmountUpgradePlanPerAccount = new Decimal(remainingInvoiceItemUpgradePlan.amount)
            .dividedBy(new Decimal(userProfileState.accounts_to_create))
            .toNumber();
          // // 浮動小数点数
          // const unusedAmountUpgradePlanPerAccount =
          //   Math.round((unusedInvoiceItemUpgradePlan.amount / userProfileState.accounts_to_create) * 1000) / 1000;
          // const remainingAmountUpgradePlanPerAccount =
          //   Math.round((remainingInvoiceItemUpgradePlan.amount / userProfileState.accounts_to_create) * 1000) / 1000;

          // ローカルStateで料金を計算 ----------------------------------------------------
          if (!newPlanRemainingAmountPerAccountWithThreeDecimalPointsRef.current)
            throw new Error("エラー：新プランの残り期間の日割り料金データが見つかりませんでした。");
          if (!oldPlanUnusedAmountPerAccountWithThreeDecimalPointsRef.current)
            throw new Error("エラー：旧プランの残り期間の日割り料金データが見つかりませんでした。");
          // アカウント1つあたりの料金を算出してローカルの算出結果と比較する
          // アップグレードプランのみの日割り追加費用(ローカル)
          // Decimal
          const sumExtraChargeUpgradePlanPerAccountLocal = new Decimal(
            newPlanRemainingAmountPerAccountWithThreeDecimalPointsRef.current
          )
            .minus(new Decimal(Math.abs(oldPlanUnusedAmountPerAccountWithThreeDecimalPointsRef.current)))
            .toNumber();
          // // 浮動小数点数
          // const sumExtraChargeUpgradePlanPerAccountLocal =
          // newPlanRemainingAmountPerAccountWithThreeDecimalPointsRef.current - Math.abs(oldPlanUnusedAmountPerAccountWithThreeDecimalPointsRef.current)

          // 最終チェック用 toFixed()
          const fixedSumExtraChargeUpgradePlanPerAccount = new Decimal(sumExtraChargeUpgradePlanPerAccount).toFixed(0);
          const fixedSumExtraChargeUpgradePlanPerAccountLocal = new Decimal(
            sumExtraChargeUpgradePlanPerAccountLocal
          ).toFixed(0);
          const fixedUnusedAmountUpgradePlanPerAccount = new Decimal(
            Math.abs(unusedAmountUpgradePlanPerAccount)
          ).toFixed(0);
          const fixedUnusedAmountUpgradePlanPerAccountLocal = new Decimal(
            Math.abs(oldPlanUnusedAmountPerAccountWithThreeDecimalPointsRef.current)
          ).toFixed(0);
          const fixedRemainingAmountUpgradePlanPerAccount = new Decimal(
            Math.abs(remainingAmountUpgradePlanPerAccount)
          ).toFixed(0);
          const fixedRemainingAmountUpgradePlanPerAccountLocal = new Decimal(
            newPlanRemainingAmountPerAccountWithThreeDecimalPointsRef.current
          ).toFixed(0);

          console.log(
            "🌟料金チェック インボイスデータが存在するフェッチ無しルート 🔹インボイスアイテムが２セット以上 => 今回のアップデートが２回目以上"
          );
          // if (
          //   Math.round(sumExtraChargeUpgradePlanPerAccount) === Math.round(sumExtraChargeUpgradePlanPerAccountLocal) &&
          //   Math.round(Math.abs(unusedAmountUpgradePlanPerAccount)) ===
          //     Math.round(oldPlanUnusedAmountPerAccountWithThreeDecimalPointsRef.current) &&
          //   Math.round(remainingAmountUpgradePlanPerAccount) ===
          //     Math.round(newPlanRemainingAmountPerAccountWithThreeDecimalPointsRef.current)
          // ) {
          // if (
          //   fixedSumExtraChargeUpgradePlanPerAccount === fixedSumExtraChargeUpgradePlanPerAccountLocal &&
          //   fixedRemainingAmountUpgradePlanPerAccount === fixedRemainingAmountUpgradePlanPerAccountLocal &&
          //   fixedUnusedAmountUpgradePlanPerAccount === fixedUnusedAmountUpgradePlanPerAccountLocal
          // ) {
          if (fixedSumExtraChargeUpgradePlanPerAccount === fixedSumExtraChargeUpgradePlanPerAccountLocal) {
            console.log(
              "🌟料金チェック インボイスデータが存在するフェッチ無しルート 🔹インボイスアイテムが2セット以上 => アップデート２回目以上 ✅チェック関数 次回請求額がローカルと一致 テスト成功✅"
            );
            console.log(
              "✅アップグレードアイテムの追加費用(1アカウントあたり) stripe, ローカル",
              sumExtraChargeUpgradePlanPerAccount,
              sumExtraChargeUpgradePlanPerAccountLocal,
              "toFixed(0) stripe, ローカル",
              fixedSumExtraChargeUpgradePlanPerAccount,
              fixedSumExtraChargeUpgradePlanPerAccountLocal
            );
            console.log(
              "✅残り使用分料金アップグレードアイテムのみ(1アカウントあたり) stripe, ローカル",
              remainingAmountUpgradePlanPerAccount,
              newPlanRemainingAmountPerAccountWithThreeDecimalPointsRef.current,
              "toFixed(0) stripe, ローカル",
              fixedRemainingAmountUpgradePlanPerAccount,
              fixedRemainingAmountUpgradePlanPerAccountLocal
            );
            console.log(
              "✅未使用分料金アップグレードアイテムのみ(1アカウントあたり) stripe, ローカル",
              Math.abs(unusedAmountUpgradePlanPerAccount),
              oldPlanUnusedAmountPerAccountWithThreeDecimalPointsRef.current,
              "toFixed(0) stripe, ローカル",
              fixedUnusedAmountUpgradePlanPerAccount,
              fixedUnusedAmountUpgradePlanPerAccountLocal
            );
            console.log(
              "✅来月アカウント数",
              nextMonthAccountQuantity,
              "✅現在アカウント数",
              userProfileState.accounts_to_create
            );
            console.log(
              "✅来月プラン料金 stripe, ローカル",
              (nextInvoiceForChangePlan as Stripe.UpcomingInvoice)?.lines?.data[
                (nextInvoiceForChangePlan as Stripe.UpcomingInvoice)?.lines?.data.length - 1
              ]?.amount,
              premiumPlanFeePerAccountRef.current * nextMonthAccountQuantity
            );
            setIsLoadingFetchStripeInvoice(false); // ローディング終了
            setIsOpenConfirmChangePlanModal(true); // 確定モーダルを開く
            if (notMatchInvoiceChangePlan) setNotMatchInvoiceChangePlan(false); // trueならfalseに戻す
          } else {
            console.log(
              "❌料金チェック インボイスデータが存在するフェッチ無しルート 🔹インボイスアイテムが2セット以上 => アップデート２回目以上 チェック関数 次回請求額がローカルと一致せず テスト失敗❌"
            );
            console.log(
              "❌アップグレードアイテムの追加費用(1アカウントあたり) stripe, ローカル",
              sumExtraChargeUpgradePlanPerAccount,
              sumExtraChargeUpgradePlanPerAccountLocal,
              "toFixed(0) stripe, ローカル",
              fixedSumExtraChargeUpgradePlanPerAccount,
              fixedSumExtraChargeUpgradePlanPerAccountLocal
            );
            console.log(
              "❌残り使用分料金アップグレードアイテムのみ(1アカウントあたり) stripe, ローカル",
              remainingAmountUpgradePlanPerAccount,
              newPlanRemainingAmountPerAccountWithThreeDecimalPointsRef.current,
              "toFixed(0) stripe, ローカル",
              fixedRemainingAmountUpgradePlanPerAccount,
              fixedRemainingAmountUpgradePlanPerAccountLocal
            );
            console.log(
              "❌未使用分料金アップグレードアイテムのみ(1アカウントあたり) stripe, ローカル",
              Math.abs(unusedAmountUpgradePlanPerAccount),
              oldPlanUnusedAmountPerAccountWithThreeDecimalPointsRef.current,
              "toFixed(0) stripe, ローカル",
              fixedUnusedAmountUpgradePlanPerAccount,
              fixedUnusedAmountUpgradePlanPerAccountLocal
            );
            console.log(
              "❌来月アカウント数",
              nextMonthAccountQuantity,
              "❌現在アカウント数",
              userProfileState.accounts_to_create
            );
            console.log(
              "❌来月プラン料金 stripe, ローカル",
              (nextInvoiceForChangePlan as Stripe.UpcomingInvoice)?.lines?.data[
                (nextInvoiceForChangePlan as Stripe.UpcomingInvoice)?.lines?.data.length - 1
              ]?.amount,
              premiumPlanFeePerAccountRef.current * nextMonthAccountQuantity
            );
            throw new Error("料金チェック不合格❎ stripeインボイスをフェッチ");
          }
        } else {
          throw new Error("予期せぬエラー stripeインボイスをフェッチ");
        }
      } catch (e: any) {
        console.log(`❌catchブロック エラーキャッチ：`, e);
        // stripeにインボイスデータを取得する
        const result = await getUpcomingInvoiceChangePlan(isUpgradePlan ? `premium_plan` : `business_plan`);
        setIsLoadingFetchStripeInvoice(false); // ローディング終了
        if (!result.checkResult) setNotMatchInvoiceChangePlan(true); // 料金チェックが不合格なので3つ目のセクションを表示
        setIsOpenConfirmChangePlanModal(true); // 確定モーダルを開く
      }
    }
  };
  // ===================== ✅今すぐアップグレード/今すぐダウングレード 「変更を確定」モーダルを開く =====================
  // ===================== 🌟プランを変更する関数 =====================
  const handleSubmitChangePlan = async (
    _prorationDateTimestamp: number | null,
    changePlanType: string,
    _newPlanName: string,
    _alreadyHaveSchedule: boolean,
    deleteAccountRequestSchedule: StripeSchedule | null
  ) => {
    try {
      if (!userProfileState) throw new Error("エラー：ユーザー情報が確認できませんでした");
      if (!sessionState) throw new Error("セッション情報が見つかりませんでした");
      if (isUpgradePlan && !_prorationDateTimestamp) throw new Error("比例配分日の情報が見つかりませんでした");
      if (!userProfileState?.accounts_to_create) throw new Error("アカウント数が取得できませんでした。");

      const payload = {
        stripeCustomerId: userProfileState.subscription_stripe_customer_id,
        changePlanType: changePlanType, // upgrade, downgrade
        newPlanName: _newPlanName, // business_plan, premium_plan
        companyId: userProfileState.company_id,
        subscriptionId: userProfileState.subscription_id,
        stripeSubscriptionId: userProfileState.stripe_subscription_id,
        userProfileId: userProfileState.id,
        alreadyHaveSchedule: _alreadyHaveSchedule, // true, false
        deleteAccountRequestSchedule: deleteAccountRequestSchedule, // stripe_schedulesテーブルデータ
        prorationDate: _prorationDateTimestamp, // アップグレードプランのみ
        currentQuantity: userProfileState.accounts_to_create,
      };

      console.log(
        "🌟Stripeプラン変更ステップ axios.post実行 payload",
        payload,
        "比例配分日",
        format(new Date(_prorationDateTimestamp! * 1000), "yyyy年MM月dd日 HH:mm:ss")
      );

      const {
        data: { data: updatedItem, error: axiosStripeError },
      } = await axios.post(`/api/subscription/change-plan`, payload, {
        headers: {
          Authorization: `Bearer ${sessionState.access_token}`,
        },
      });

      if (axiosStripeError) {
        console.log("❌change-quantityエンドポイントへのaxios.postでエラー", axiosStripeError);
        throw axiosStripeError;
      }

      console.log(`🔥Stripeプラン変更ステップ2 axios.post成功 結果 updatedItem`, updatedItem);

      // キャッシュを最新状態に更新
      // プラン変更のサブスクリプションスケジュールを取得して適用時期を明示する
      await queryClient.invalidateQueries({ queryKey: ["stripe_schedules"] });

      if (isUpgradePlan) {
        toast.success(`プランの変更が完了しました!`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        toast.success(`プランのダウングレードを受け付けました。`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }

      // ローディング完了
      setIsLoadingSubmitChangePlan(false);

      // アカウントを増やすモーダルを閉じる
      setIsOpenConfirmChangePlanModal(false);
      setIsOpenChangePlanModal(false);
    } catch (e: any) {
      console.error("プラン変更を確定エラー", e);
      toast.error(`プランの変更に失敗しました!`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      // ローディング完了
      setIsLoadingSubmitChangePlan(false);
      // アカウントを増やすモーダルを閉じる
      setIsOpenConfirmChangePlanModal(false);
      setIsOpenChangePlanModal(false);
    }
  };
  // ===================== ✅プランを変更する関数 ここまで =====================
  // ===================== 🌟プラン変更前に数量ダウンスケジュールの次回フェーズのプランを確認チェックする関数 =====================
  const checkNextPhasePlanOfScheduleDecreaseQuantity = async () => {
    if (!userProfileState) {
      console.error("エラー：ユーザー情報が見つかりませんでした。");
      return { requiredChangeNextPhasePlan: false, error: true };
    }

    try {
      const payload = {
        stripeSubscriptionId: userProfileState.stripe_subscription_id,
      };

      const {
        data: { data: downgradeScheduleData, error: downgradeScheduleError, nextPhasePlanName: _nextPhasePlanName },
      } = await axios.post(`/api/subscription/get-schedule-decrease-quantity`, payload, {
        headers: {
          Authorization: `Bearer ${sessionState.access_token}`,
        },
      });
      if (downgradeScheduleError) {
        console.log("❌数量ダウンスケジュール取得エラー", downgradeScheduleError);
        throw new Error(downgradeScheduleError);
      }
      console.log(
        "🌟数量ダウンスケジュール取得完了",
        downgradeScheduleData,
        "スケジュール各項目 created",
        format(
          new Date((downgradeScheduleData as Stripe.SubscriptionSchedule).created * 1000),
          "yyyy年MM月dd日 HH:mm:ss"
        ),
        "今月フェーズstart_date",
        format(
          new Date((downgradeScheduleData as Stripe.SubscriptionSchedule).phases[0].start_date * 1000),
          "yyyy年MM月dd日 HH:mm:ss"
        ),
        "今月フェーズend_date",
        format(
          new Date((downgradeScheduleData as Stripe.SubscriptionSchedule).phases[0].end_date * 1000),
          "yyyy年MM月dd日 HH:mm:ss"
        ),
        "今月フェーズのプランid",
        (downgradeScheduleData as Stripe.SubscriptionSchedule).phases[0].items[0].price,
        "来月フェーズstart_date",
        format(
          new Date((downgradeScheduleData as Stripe.SubscriptionSchedule).phases[1].start_date * 1000),
          "yyyy年MM月dd日 HH:mm:ss"
        ),
        "来月フェーズend_date",
        format(
          new Date((downgradeScheduleData as Stripe.SubscriptionSchedule).phases[1].end_date * 1000),
          "yyyy年MM月dd日 HH:mm:ss"
        ),
        "来月フェーズプランid",
        (downgradeScheduleData as Stripe.SubscriptionSchedule).phases[1].items[0].price
      );
      // const nextPhasePlanId = !!(downgradeScheduleData as Stripe.SubscriptionSchedule).phases[1]
      //   ? (downgradeScheduleData as Stripe.SubscriptionSchedule).phases[1].items[0].plan
      //   : null;
      if (!!_nextPhasePlanName && _nextPhasePlanName === "premium_plan") {
        console.log(
          "数量ダウンスケジュールの次回フェーズ数量と今回のプランが一致🙆 _nextPhasePlanName",
          _nextPhasePlanName
        );
        return { requiredChangeNextPhasePlan: false, error: false };
      } else if (!!_nextPhasePlanName && _nextPhasePlanName !== "premium_plan") {
        console.log(
          "数量ダウンスケジュールの次回フェーズ数量と今回のプラン一致せずチェック必要 アップグレードするプランはpremium_planだが _nextPhasePlanNameは",
          _nextPhasePlanName
        );
        return { requiredChangeNextPhasePlan: true, error: false };
      } else {
        throw new Error(`❌数量ダウンスケジュール取得チェック条件式にどれも合わず`);
      }
    } catch (e: any) {
      console.error("❌数量ダウンスケジュール取得チェックエラー：", e);
      return { requiredChangeNextPhasePlan: false, error: true };
    }
  };
  // ===================== ✅プラン変更前に数量ダウンスケジュールの次回フェーズのプランを確認チェックする関数 =====================
  // ===================== 🌟プラン変更前に数量ダウンスケジュールの次回フェーズのプランを変更する関数 =====================
  const updateNextPhasePlanOfScheduleDecreaseQuantity = async () => {
    if (!userProfileState) {
      console.error("エラー：ユーザー情報が見つかりませんでした。");
      return { complete: false, error: true };
    }

    try {
      const payload = {
        stripeCustomerId: userProfileState.stripe_customer_id,
        stripeSubscriptionId: userProfileState.stripe_subscription_id,
        newPlanName: "premium_plan", // 数量変更後の合計アカウント数
      };
      console.log(
        "🌟数量ダウンスケジュールが存在するためスケジュールのプランを変更するステップ1 update-schedule-decrease-quantityエンドポイントへリクエスト payload",
        payload
      );
      const {
        data: { data: updatedScheduleData, error: updatedScheduleError },
      } = await axios.post(`/api/subscription/update-schedule-decrease-quantity`, payload, {
        headers: {
          Authorization: `Bearer ${sessionState.access_token}`,
        },
      });
      if (updatedScheduleError) {
        console.error(
          "❌数量ダウンスケジュールが存在するためスケジュールのプランを変更するステップ2 update-schedule-decrease-quantityへのaxios.postエラー"
        );
        throw updatedScheduleError;
      }

      console.log(
        "🔥数量ダウンスケジュールが存在するためスケジュールのプランを変更するステップ2 axios.post()結果 updatedScheduleData",
        updatedScheduleData
      );

      return { complete: true, error: false };
    } catch (e: any) {
      console.error("❌数量ダウンスケジュールのプラン変更エラー", e);
      return { complete: false, error: true };
    }
  };
  // ===================== ✅プラン変更前に数量ダウンスケジュールの次回フェーズのプランを変更する関数 =====================
  // ===================== 🌟「変更を確定」クリックで実行する関数 =====================
  const handleConfirmChange = async () => {
    // ローディング開始
    setIsLoadingSubmitChangePlan(true);

    console.log("🌟「変更を確定」クリック");
    // 🔹アップグレード
    if (isUpgradePlan) {
      // 比例配分日が存在しない場合にはエラーでそのままモーダルを閉じる
      if (!nextInvoiceForChangePlan?.subscription_proration_date) {
        console.error(`エラー：nextInvoiceForChangePlan?.subscription_proration_dateが見つかりませんでした`);
        toast.error(
          `プランアップグレードに失敗しました。サポートにご報告の上、しばらく経ってからやり直してください。`,
          {
            position: "top-right",
            autoClose: 5000,
          }
        );
        // ローディング終了
        setIsLoadingSubmitChangePlan(false);
        // アカウントを増やすモーダルを閉じる
        setIsOpenConfirmChangePlanModal(false);
        setIsOpenChangePlanModal(false);
        return;
      }
      // 変更を確定時に取得していたInvoiceのsubscription_proration_dateの日付から日付が変わっていないか確認 => 日付が変わったら一度モーダルを閉じて再度開いてもらう(再度stripeにフェッチしてもらう)
      const prorationDateObj = new Date(nextInvoiceForChangePlan.subscription_proration_date * 1000);
      const pYear = prorationDateObj.getFullYear();
      const pMonth = prorationDateObj.getMonth();
      const pDay = prorationDateObj.getDate();
      const prorationDateOnly = new Date(pYear, pMonth, pDay);
      const currentDateObj = new Date("2028-11-20"); // テストクロック
      const cYear = currentDateObj.getFullYear();
      const cMonth = currentDateObj.getMonth();
      const cDay = currentDateObj.getDate();
      const currentDateOnly = new Date(cYear, cMonth, cDay);
      console.log("比例配分日", format(prorationDateOnly, "yyyy年MM月dd日 HH:mm:ss"));
      console.log("現在の日付", format(currentDateOnly, "yyyy年MM月dd日 HH:mm:ss"));
      if (prorationDateOnly.getTime() !== currentDateOnly.getTime()) {
        console.log("invoiceを取得した日付から日付が変わりました。モーダルを開き直す");
        // ローディング終了
        setIsLoadingSubmitChangePlan(false);
        toast.error("日付が変わりました！再度開き直してください🙇‍♀️", {
          position: "top-right",
          autoClose: 5000,
        });
        // アカウントを増やすモーダルを閉じる
        setIsOpenConfirmChangePlanModal(false);
        setIsOpenChangePlanModal(false);
        return;
      }
      // 🔹数量ダウンスケジュールが存在するルート => プランダウンは料金チェックでretrieveUpcoming()の来月プラン価格を入れた合計料金ではテストしないため、サブスクリプション更新前にスケジュールの来月フェーズのプランを先に更新しておく必要はない。
      // あくまで、更新前にスケジュール来月フェーズを更新するのは将来のインボイス取得時に来月価格を更新後の価格をスケジュールの影響を受けずに取得して次回請求総額同士で料金チェックをするため
      // => 上記では❌。次回プランを変更しておかないと今月のサブスクプラン変更しても次回フェーズがビジネスのままになってしまう
      // => 最初からスケジュールのみで今月フェーズのプランをプレミアムにすればスケジュール有りルートでもいける　ただ、スケジュールでの現在プラン更新は比例配分日の設定ができないので、正しく日割り料金が設定される前提で実装しないといけない
      // => 💡先に次回フェーズのプランをプレミアムにしておかないとstripe.subscriptions.update()で次回フェーズのプランが変更されないので、やはりこの作業は必要

      // if (!!deleteAccountRequestSchedule) {
      //   try {
      //     // 1. まずは、ダウングレードスケジュールがある場合には、先にスケジュールの次回フェーズのプランを確認、チェックする
      //     const checkResult = await checkNextPhasePlanOfScheduleDecreaseQuantity();
      //     // スケジュール次回フェーズのプランチェックエラー
      //     if (checkResult.error)
      //       throw new Error(`プランアップグレード失敗 数量ダウンスケジュール次回フェーズプランチェックエラー`);
      //     // スケジュール次回フェーズのプランチェック 次回フェーズのプラン変更必要
      //     if (checkResult.requiredChangeNextPhasePlan) {
      //       // 2. スケジュールの次回フェーズのプランをアップグレード先のプレミアムプランに変更する
      //       const updateScheduleResult = await updateNextPhasePlanOfScheduleDecreaseQuantity();
      //       // スケジュール次回フェーズのプラン変更エラー
      //       if (updateScheduleResult.error)
      //         throw new Error(`プランアップグレード失敗 数量ダウンスケジュール次回フェーズプラン変更エラー`);
      //     }
      //   } catch (e: any) {
      //     console.error(`エラー：`, e);
      //     toast.error(
      //       `プランアップグレードに失敗しました。サポートにご報告の上、しばらく経ってからやり直してください。`,
      //       {
      //         position: "top-right",
      //         autoClose: 5000,
      //       }
      //     );
      //     // ローディング完了
      //     setIsLoadingSubmitChangePlan(false);
      //     // アカウントを増やすモーダルを閉じる
      //     setIsOpenConfirmChangePlanModal(false);
      //     setIsOpenChangePlanModal(false);
      //     return;
      //   }
      // }
      // 3. アップグレード実行
      handleSubmitChangePlan(
        nextInvoiceForChangePlan.subscription_proration_date,
        "upgrade",
        "premium_plan",
        false,
        null
      );
    } else {
      // 🔹ダウングレード
      handleSubmitChangePlan(null, "downgrade", "business_plan", false, null);
    }
  };
  // ===================== ✅「変更を確定」クリック後に実行する関数 ここまで =====================

  const [openAccountCountsMenu, setOpenAccountCountsMenu] = useState(false);
  const AccountCountsDropDownMenu = () => {
    return (
      <>
        {/* ==================== チームでの役割メニューポップアップ ==================== */}

        {/* 通常時 h-[152px] 招待中時 */}
        <div className="shadow-all-md border-real absolute left-[50%] top-[50px] z-[100] h-auto translate-x-[-50%] overflow-hidden rounded-[8px] bg-[var(--color-bg-dropdown-menu)] p-[1px] text-[14px] font-bold !text-[var(--color-text-title)]">
          <ul className={`flex w-full flex-col`}>
            <li
              className={`flex w-full cursor-pointer items-center justify-between space-x-[12px] truncate rounded-tl-[8px] rounded-tr-[8px] px-[18px] py-[15px] hover:bg-[var(--color-bg-sub)] hover:text-[var(--color-bg-brand-f)] `}
              onClick={() => {
                // handleChangeRole("company_admin");
                console.log("増やすクリック");
                setOpenAccountCountsMenu(false);
              }}
            >
              <AiOutlinePlusCircle className="min-h-[18px] min-w-[18px] text-[18px]" />
              <span className="select-none">アカウント数を増やす</span>
            </li>

            <hr className={`min-h-[1px] w-full bg-[var(--color-border-base)]`} />

            <li
              className={`flex w-full cursor-pointer items-center justify-between space-x-[12px] truncate rounded-bl-[8px] rounded-br-[8px] px-[18px] py-[15px] hover:bg-[var(--color-bg-sub)] hover:text-[var(--bright-red)] `}
              onClick={() => {
                // handleChangeRole("company_manager");
                console.log("減らすクリック");
                setOpenAccountCountsMenu(false);
              }}
            >
              <AiOutlineMinusCircle className="min-h-[18px] min-w-[18px] text-[18px]" />
              <span className="select-none">アカウント数を減らす</span>
            </li>
          </ul>
        </div>
        {/* ==================== チームでの役割メニューポップアップ ここまで ==================== */}
      </>
    );
  };

  // ==================== 今すぐアップグレード/今すぐダウングレード確定モーダル ====================
  const ConfirmChangePlanModal = () => {
    return (
      <>
        {/* オーバーレイ */}
        <div
          className="fixed left-[-100vw] top-[-100vh] z-[5000] h-[200vh] w-[200vw] bg-[#00000040]"
          onClick={() => {
            setIsOpenConfirmChangePlanModal(false);
          }}
        ></div>
        <div className="fade02 fixed left-[50%] top-[50%] z-[6000] h-auto w-[40vw] max-w-[580px] translate-x-[-50%] translate-y-[-50%] rounded-[8px] bg-[var(--color-bg-notification-modal)] py-[32px] text-[var(--color-text-title)]">
          {isLoadingSubmitChangePlan && (
            <div
              className={`flex-center absolute left-0 top-0 z-[3000] h-[100%] w-[100%] rounded-[8px] bg-[#00000090]`}
            >
              <SpinnerIDS scale={"scale-[0.5]"} />
            </div>
          )}
          {/* クローズボタン */}
          <button
            className={`flex-center z-100 group absolute right-[-40px] top-0 h-[32px] w-[32px] rounded-full bg-[#00000090] hover:bg-[#000000c0]`}
            onClick={() => {
              setIsOpenConfirmChangePlanModal(false);
            }}
          >
            <MdClose className="text-[20px] text-[#fff]" />
          </button>
          <h2 className={`flex min-h-[32px] w-full items-center px-[28px] text-[22px] font-bold`}>
            プランをご確認ください。
          </h2>
          {/* <section className={`mt-[20px] flex h-auto w-full flex-col px-[28px] text-[14px]`}>
            <p className="font-bold">プランをご確認ください。</p>
            <p className="font-bold">
              注：この操作により、該当ユーザーのデータは、他のチームメンバーと共有されていないものを含めて全てアクセスできなくなります。
            </p>
          </section> */}
          <ul className="mt-[20px] flex h-auto w-full flex-col text-[14px]">
            <li className="flex w-full flex-col border-b border-solid border-[var(--color-border-deep)] bg-[var(--color-bg-sub)] px-[28px] py-[20px] text-[var(--color-text-sub)]">
              <h3 className="">現在のプラン：</h3>
              {isUpgradePlan && (
                <p className="mb-[5px] mt-[10px] flex items-center space-x-3">
                  <span>ビジネスプラン</span>
                  <span>月額￥980/アカウント</span>
                </p>
              )}
              {!isUpgradePlan && (
                <p className="mb-[5px] mt-[10px] flex items-center space-x-3">
                  <span>プレミアムプラン</span>
                  <span>月額￥19,800/アカウント</span>
                </p>
              )}
            </li>
            <li className="flex w-full flex-col bg-[var(--color-bg-sub)] px-[28px] py-[20px] text-[var(--color-text-sub)]">
              <h3 className="">新しいプラン：</h3>
              {isUpgradePlan && (
                <p className="mb-[5px] mt-[10px] flex items-center space-x-3">
                  <span>プレミアムプラン</span>
                  <span>月額￥19,800/アカウント</span>
                </p>
              )}
              {!isUpgradePlan && (
                <p className="mb-[5px] mt-[10px] flex items-center space-x-3">
                  <span>ビジネスプラン</span>
                  <span>月額￥980/アカウント</span>
                </p>
              )}
            </li>
            {/* stripeのinvoiceと料金が一致しなかった場合 */}
            {notMatchInvoiceChangePlan && isUpgradePlan && !isLastDay && (
              <li className="flex w-full flex-col border-t border-solid border-[var(--color-border-deep)] bg-[var(--color-bg-sub)] px-[28px] py-[20px] text-[var(--color-text-sub)]">
                <h3 className="">次回請求期間の追加費用：</h3>
                <p className="mb-[5px] mt-[10px] flex items-center space-x-3">
                  <span>日割り料金</span>
                  <span>
                    {" "}
                    {!!stripeInvoiceFeeRef.current.upgradePlanInvoiceItemAdditionalCost &&
                    !!userProfileState?.accounts_to_create
                      ? `${formatToJapaneseYen(
                          Math.round(stripeInvoiceFeeRef.current.upgradePlanInvoiceItemAdditionalCost),
                          true
                        )}/アカウント`
                      : `-`}
                  </span>
                  {/* <span>
                    {" "}
                    {!!newPlanRemainingAmountPerAccountWithThreeDecimalPointsRef.current &&
                    !!oldPlanUnusedAmountPerAccountWithThreeDecimalPointsRef.current
                      ? formatToJapaneseYen(
                          Math.round(
                            newPlanRemainingAmountPerAccountWithThreeDecimalPointsRef.current -
                              oldPlanUnusedAmountPerAccountWithThreeDecimalPointsRef.current
                          ),
                          true
                        )
                      : `-`}
                  </span> */}
                </p>
                <p className="mt-[5px] flex items-center space-x-3 text-[12px]">
                  {`(上記は本日アップデートにより発生する今月分のビジネスプランの未使用分の日割り料金と、\nプレミアムプランの期間終了日までの利用料金を差し引いた追加費用です。)`}
                </p>
              </li>
            )}
          </ul>
          {/* <section className={`mt-[20px] flex h-auto w-full flex-col space-y-3 text-[14px]`}>
            <p>プランをご確認ください。</p>
            <p className="font-bold">
              注：この操作により、該当ユーザーのデータは、他のチームメンバーと共有されていないものを含めて全てアクセスできなくなります。
            </p>
          </section> */}
          <section className="flex w-full flex-col items-start px-[28px]">
            <div className={`flex w-[100%] items-center justify-around space-x-5 pt-[30px]`}>
              <button
                className={`transition-base01 w-[50%] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[15px] py-[10px] text-[14px] font-bold text-[var(--color-text-title)] hover:bg-[var(--setting-side-bg-select-hover)]`}
                onClick={() => {
                  setIsOpenConfirmChangePlanModal(false);
                }}
              >
                キャンセル
              </button>
              <button
                className={`transition-base01 w-[50%] cursor-pointer rounded-[8px] px-[15px] py-[10px] text-[14px] font-bold text-[#fff] ${
                  isUpgradePlan
                    ? `bg-[var(--color-bg-brand-f)] hover:bg-[var(--color-bg-brand-f-deep)]`
                    : `bg-[var(--color-red-tk)] hover:bg-[var(--color-red-tk-hover)]`
                }`}
                onClick={handleConfirmChange}
                /**
                 *  _prorationDateTimestamp: number,
    changePlanType: string,
    _newPlanName: string,
    _alreadyHaveSchedule: boolean,
    deleteAccountRequestSchedule: StripeSchedule | null
                 */
              >
                変更を確定
              </button>
            </div>
            <div className="mt-[20px] flex w-full flex-col text-[12px] text-[var(--color-text-sub-light)]">
              {isUpgradePlan && (
                <>
                  <p className="leading-[18px]">
                    新しいプランは、本日から適用となります。
                    {!!userProfileState?.current_period_end
                      ? format(new Date(userProfileState.current_period_end), "yyyy年MM月dd日")
                      : `-`}
                    より、日割り料金と月額
                    {!!premiumPlanFeePerAccountRef.current
                      ? formatToJapaneseYen(premiumPlanFeePerAccountRef.current, true)
                      : `-`}
                    の料金が適用されます。確定することにより、キャンセルするまで更新後の料金が請求されることに同意したものとみなされます。お好きなときにキャンセルでき、それ以降は料金を請求されません。いつでもキャンセルできます。
                  </p>
                </>
              )}
              {!isUpgradePlan && (
                <>
                  <p className="leading-[18px]">
                    新しいプランは、お客様の次のご請求期間の開始日（
                    {!!userProfileState?.current_period_end
                      ? format(new Date(userProfileState.current_period_end), "yyyy年MM月dd日")
                      : `-`}
                    ）から適用されます。確定することにより、キャンセルするまで更新後の料金が請求されることに同意したものとみなされます。お好きなときにキャンセルでき、それ以降は料金を請求されません。いつでもキャンセルできます。
                  </p>
                </>
              )}
            </div>
          </section>
        </div>
      </>
    );
  };
  // ==================== 今すぐアップグレード/今すぐダウングレード確定モーダル ここまで ====================

  // 日割り料金詳細モーダル
  const AdditionalCostModal = () => {
    return (
      <div
        className={`border-real fade03 absolute bottom-[100%] left-[50%] z-30 flex min-h-[50px] min-w-[100px] max-w-[690px] translate-x-[-50%] cursor-default flex-col rounded-[8px] bg-[var(--color-edit-bg-solid)] px-[30px] py-[20px]`}
      >
        {/* 日割り料金詳細エリア */}
        {/* タイトルエリア */}
        <div className="flex w-full items-center">
          <div className="text-[16px] font-bold text-[var(--color-text-title)]">
            <h4>
              今月の残り期間の日割り料金：
              <span className="text-[var(--color-text-brand-f)]">
                {!!newPlanRemainingAmountPerAccountWithThreeDecimalPointsRef.current &&
                !!oldPlanUnusedAmountPerAccountWithThreeDecimalPointsRef.current
                  ? formatToJapaneseYen(
                      Math.round(
                        newPlanRemainingAmountPerAccountWithThreeDecimalPointsRef.current -
                          oldPlanUnusedAmountPerAccountWithThreeDecimalPointsRef.current
                      ),
                      true,
                      false
                    )
                  : `-`}
                円
              </span>
              の詳細(1アカウントあたりで算出)
            </h4>
            {/* <h4>新プランアップグレード 日割り料金の詳細</h4> */}
          </div>
        </div>
        {/* タイトルエリア ここまで */}
        {/* コンテンツエリア */}
        <div className="mt-[12px] flex w-full flex-col space-y-[12px] text-[14px]">
          <p className="flex w-full items-center space-x-[8px]">
            <span className="text-[16px] font-bold">・</span>
            <span className="!ml-[4px]">今月の契約期間</span>
            <span>：</span>
            <span className="font-bold">
              {!!userProfileState?.current_period_start
                ? format(new Date(userProfileState.current_period_start), "yyyy年MM月dd日")
                : `-`}
              〜
              {!!userProfileState?.current_period_end
                ? format(new Date(userProfileState.current_period_end), "yyyy年MM月dd日")
                : `-`}
              {!!currentPeriodRef.current ? `（${currentPeriodRef.current}日間）` : ``}
            </span>
          </p>
          <div className="flex w-full items-center">
            <p className="flex min-w-[50%] items-center space-x-[8px]">
              <span className="text-[16px] font-bold">・</span>
              <span className="!ml-[4px]">終了日までの残り日数</span>
              <span>：</span>
              <span className="font-bold">
                {!!remainingDaysRef.current ? `${remainingDaysRef.current}日間` : `-`}
                {/* {!!remainingDaysState ? `${remainingDaysState}日間` : `-`} */}
                {/* {!!remainingDays ? `${remainingDays}日間` : `-`} */}
                {/* {!!elapsedDays ? `（開始日から${elapsedDays}日経過）` : `-`} */}
              </span>
              {!!userProfileState?.current_period_end && (
                <span className="text-[var(--color-text-title)]">
                  （{format(new Date("2028-11-20"), "MM月dd日")}〜
                  {format(new Date(userProfileState.current_period_end), "MM月dd日")}）
                </span>
              )}
            </p>
          </div>
          <div className="flex w-full items-center">
            <p className="flex items-center space-x-[8px]">
              <span className="text-[16px] font-bold">・</span>
              <span className="!ml-[4px]">新プランの1日あたりの使用料</span>
              <span>：</span>

              <span className="font-bold">
                {!!premiumPlanFeePerAccountRef.current && !!currentPeriodRef.current
                  ? `${Math.round((premiumPlanFeePerAccountRef.current / currentPeriodRef.current) * 1000) / 1000}円/日`
                  : `-`}
              </span>
              <span>=</span>
              <span>{!!premiumPlanFeePerAccountRef.current ? `${premiumPlanFeePerAccountRef.current}円` : `-`}</span>
              <span>÷</span>
              <span>{!!currentPeriodRef.current ? `${currentPeriodRef.current}日` : `-`}</span>
            </p>
          </div>
          <div className="flex w-full items-center">
            <p className="flex items-center space-x-[8px]">
              <span className="text-[16px] font-bold">・</span>
              <span className="!ml-[4px] min-w-[224px]">新プランの今月残り利用分の日割り料金</span>
              <span>：</span>
              <span className="font-bold text-[#00d436] underline underline-offset-1">
                {!!premiumPlanFeePerAccountRef.current && !!currentPeriodRef.current && !!remainingDaysRef.current
                  ? `${formatToJapaneseYen(
                      Math.round(
                        (Math.round((premiumPlanFeePerAccountRef.current / currentPeriodRef.current) * 1000) / 1000) *
                          remainingDaysRef.current
                      ),
                      false
                    )}円`
                  : `-`}
              </span>
              <span>=</span>
              <span>
                {!!premiumPlanFeePerAccountRef.current && !!currentPeriodRef.current
                  ? `${Math.round((premiumPlanFeePerAccountRef.current / currentPeriodRef.current) * 1000) / 1000}円/日`
                  : `-`}
              </span>
              <span>×</span>

              <span>{!!remainingDaysRef.current ? `残り${remainingDaysRef.current}日` : `-`}</span>
            </p>
          </div>
          {!!newPlanRemainingAmountPerAccountWithThreeDecimalPointsRef.current &&
            !Number.isInteger(newPlanRemainingAmountPerAccountWithThreeDecimalPointsRef.current) && (
              <div className="!mt-[0px] flex w-full items-center">
                <p className="flex items-center space-x-[8px]">
                  <span className="min-w-[230px]"></span>
                  <span className=""></span>
                  <span className="text-[13px] text-[var(--color-text-sub)]">
                    （
                    {Number.isInteger(newPlanRemainingAmountPerAccountWithThreeDecimalPointsRef.current)
                      ? newPlanRemainingAmountPerAccountWithThreeDecimalPointsRef.current
                      : new Decimal(newPlanRemainingAmountPerAccountWithThreeDecimalPointsRef.current).toFixed(3)}
                    を四捨五入）
                  </span>
                </p>
              </div>
            )}
          <div className="flex w-full items-center">
            <p className="flex items-center space-x-[8px]">
              <span className="text-[16px] font-bold">・</span>
              <span className="!ml-[4px]">旧プランの1日あたりの使用料</span>
              <span>：</span>

              <span className="font-bold">
                {!!businessPlanFeePerAccountRef.current && !!currentPeriodRef.current
                  ? `${
                      Math.round((businessPlanFeePerAccountRef.current / currentPeriodRef.current) * 1000) / 1000
                    }円/日`
                  : `-`}
              </span>
              <span>=</span>
              <span>{!!businessPlanFeePerAccountRef.current ? `${businessPlanFeePerAccountRef.current}円` : `-`}</span>
              <span>÷</span>
              <span>{!!currentPeriodRef.current ? `${currentPeriodRef.current}日` : `-`}</span>
            </p>
          </div>
          <div className="flex w-full items-center">
            <p className="flex items-center space-x-[8px]">
              <span className="text-[16px] font-bold">・</span>
              <span className="!ml-[4px] min-w-[224px]">旧プランの終了日までの未使用分の日割り料金</span>
              <span>：</span>
              <span className="font-bold text-[var(--bright-red)] underline underline-offset-1">
                {!!businessPlanFeePerAccountRef.current && !!currentPeriodRef.current && !!remainingDaysRef.current
                  ? `${formatToJapaneseYen(
                      Math.round(
                        (Math.round((businessPlanFeePerAccountRef.current / currentPeriodRef.current) * 1000) / 1000) *
                          remainingDaysRef.current
                      ),
                      false
                    )}円`
                  : `-`}
              </span>
              <span>=</span>
              <span>
                {!!businessPlanFeePerAccountRef.current && !!currentPeriodRef.current
                  ? `${
                      Math.round((businessPlanFeePerAccountRef.current / currentPeriodRef.current) * 1000) / 1000
                    }円/日`
                  : `-`}
              </span>
              <span>×</span>

              <span>{!!remainingDaysRef.current ? `残り${remainingDaysRef.current}日` : `-`}</span>
            </p>
          </div>
          {!!oldPlanUnusedAmountPerAccountWithThreeDecimalPointsRef.current &&
            !Number.isInteger(oldPlanUnusedAmountPerAccountWithThreeDecimalPointsRef.current) && (
              <div className="!mt-[0px] flex w-full items-center">
                <p className="flex items-center space-x-[8px]">
                  <span className="min-w-[280px]"></span>
                  <span className=""></span>
                  <span className="text-[13px] text-[var(--color-text-sub)]">
                    （
                    {Number.isInteger(oldPlanUnusedAmountPerAccountWithThreeDecimalPointsRef.current)
                      ? oldPlanUnusedAmountPerAccountWithThreeDecimalPointsRef.current
                      : new Decimal(oldPlanUnusedAmountPerAccountWithThreeDecimalPointsRef.current).toFixed(3)}
                    を四捨五入）
                  </span>
                </p>
              </div>
            )}
        </div>
        {/* コンテンツエリア ここまで */}
        {/* 日割り料金詳細エリア ここまで */}
        {/* 追加費用タイトルエリア */}
        <div className="mt-[12px] flex w-full flex-col justify-center pb-[8px]">
          <h4 className="text-[15px] font-bold">次回請求時の追加費用（1アカウントあたり）</h4>
          <p className="mt-[5px] text-[13px] text-[var(--color-text-sub)]">
            今月分のご請求は期間開始日に既にお支払い済みです。ビジネスプランからプレミアムプランへアップグレードした際の今月分の差額日割り料金が次回請求時に追加で発生いたします。
          </p>
        </div>
        {/* 追加費用タイトルエリア ここまで */}
        {/* コンテンツエリア */}
        <div className="item-center flex h-auto w-full space-x-[24px] truncate pb-[20px]">
          <div className="flex-col-center relative">
            <div className="mb-[5px] flex min-h-[36px] min-w-[160px] items-center justify-center">
              {/* <HiPlus className="ml-[-22px] mr-[10px] stroke-[2] text-[18px] text-[var(--color-text-brand-f)]" /> */}
              {/* <HiPlus className="absolute left-[-12px] top-[20%] stroke-[2] text-[18px] text-[var(--color-text-brand-f)]" /> */}
              <div className="flex-col-center inline-flex">
                <span className="text-[12px] font-normal">アップグレード後の</span>
                <span className="text-[12px] font-normal">次回請求時の追加費用</span>
              </div>
            </div>

            {/* <span>-円</span> */}
            <span className={`relative font-bold text-[var(--color-text-brand-f)]`}>
              <HiPlus className="absolute left-[-22px] top-[50%] translate-y-[-50%] stroke-[1.5] text-[16px] text-[var(--color-text-brand-f)]" />
              {!!newPlanRemainingAmountPerAccountWithThreeDecimalPointsRef.current &&
              !!oldPlanUnusedAmountPerAccountWithThreeDecimalPointsRef.current
                ? formatToJapaneseYen(
                    Math.round(
                      newPlanRemainingAmountPerAccountWithThreeDecimalPointsRef.current -
                        oldPlanUnusedAmountPerAccountWithThreeDecimalPointsRef.current
                    ),
                    false
                  )
                : `-`}
              円
            </span>
            <div className="absolute bottom-[-5px] left-0 h-[2px] w-full bg-[var(--color-text-brand-f)]" />
            {/* <div className="absolute bottom-[-5px] left-0 h-[2px] w-full bg-[#FF7A00]" /> */}
          </div>
          <div className="flex-col-center">
            <span className="text-[18px]">＝</span>
          </div>
          <div className="flex-col-center group relative">
            {/* ツールチップ */}
            {/* <div
              ref={hoveredNewProrationRef}
              className={`${styles.tooltip_right_area} transition-base fade pointer-events-none`}
            >
              <div className={`${styles.tooltip_right} `}>
                <div className={`flex-center ${styles.dropdown_item}`}>
                  詳細を確認する
                </div>
              </div>
              <div className={`${styles.tooltip_right_arrow}`}></div>
            </div> */}
            {/* ツールチップ ここまで */}
            <div className="flex-col-center mb-[5px] inline-flex min-h-[36px] min-w-[160px]">
              <span className="text-[12px] font-normal">プラン残り期間まで利用する</span>
              <span className="text-[12px] font-normal">新プランの日割り料金</span>
            </div>
            <div
              className={`flex-center peer relative cursor-pointer group-hover:text-[var(--color-text-brand-f)]`}
              // className={`flex-center relative cursor-pointer ${
              //   isOpenNewProrationDetail && isFirstUpgrade
              //     ? `text-[var(--color-text-brand-f)]`
              //     : `peer group-hover:text-[var(--color-text-brand-f)]`
              // }`}
              // onClick={() => {
              //   // setHoveredNewProration(false);
              //   hoveredNewProrationRef.current?.classList.remove(`${styles.active}`);
              //   if (isFirstUpgrade) {
              //     const newDetailItem = {
              //       _currentPeriod: currentPeriodState,
              //       _currentPeriodStart: nextInvoice.period_start,
              //       _currentPeriodEnd: nextInvoice.period_end,
              //       _invoicePeriodStart: nextInvoice.lines.data[1].period.start,
              //       _invoicePeriodEnd: nextInvoice.lines.data[1].period.end,
              //       _remainingDays: remainingDaysState,
              //       _planFeePerAccount: getPrice(userProfileState?.subscription_plan) ?? null,
              //       _newPlanAmount:
              //         !!userProfileState?.subscription_plan && !!totalAccountQuantity
              //           ? getPrice(userProfileState?.subscription_plan) * totalAccountQuantity
              //           : null,
              //       _newDailyRateWithThreeDecimalPoints: newDailyRateWithThreeDecimalPoints,
              //       _newUsageAmountForRemainingPeriodWithThreeDecimalPoints:
              //         newUsageAmountForRemainingPeriodWithThreeDecimalPoints,
              //       _totalAccountQuantity: totalAccountQuantity,
              //     };
              //     setNewProrationItem(newDetailItem);
              //     // ProrationDetailコンポーネントを開く
              //     setIsOpenNewProrationDetail(true);
              //   } else {
              //     // 🔹2回目以上アップデート
              //     // InvoiceItem配列の一覧モーダルを表示して、InvoiceItemをクリックした後にProrationDetailコンポーネントを開く
              //     setIsOpenRemainingUsageListModal(true);
              //   }
              // }}
              // onMouseEnter={() => hoveredNewProrationRef.current?.classList.add(`${styles.active}`)}
              // onMouseLeave={() => hoveredNewProrationRef.current?.classList.remove(`${styles.active}`)}
            >
              {/* <ImInfo
                className={`ml-[-10px] mr-[8px] ${
                  isOpenNewProrationDetail && isFirstUpgrade
                    ? `text-[var(--color-text-brand-f)]`
                    : `text-[var(--color-text-sub)] group-hover:text-[var(--color-text-brand-f)]`
                }`}
              /> */}
              <span className="font-bold text-[#00d436]">
                {!!newPlanRemainingAmountPerAccountWithThreeDecimalPointsRef.current
                  ? `${formatToJapaneseYen(
                      Math.round(newPlanRemainingAmountPerAccountWithThreeDecimalPointsRef.current),
                      false
                    )}円`
                  : `-`}
              </span>
            </div>

            <div
              className={`pointer-events-none absolute bottom-[-5px] left-0 h-[2px] w-full bg-[#00d436] `}
              // className={`pointer-events-none absolute bottom-[-5px] left-0 h-[2px] w-full ${
              //   isOpenNewProrationDetail || isOpenRemainingUsageListModal
              //     ? `bg-[var(--color-bg-brand-f)]`
              //     : `bg-[var(--color-border-deep)] peer-hover:bg-[var(--color-bg-brand-f)]`
              // }`}
            />
          </div>
          <div className="flex-col-center">
            <span className="text-[16px]">ー</span>
          </div>

          <div className="flex-col-center group relative">
            {/* ツールチップ */}
            {/* <div
              ref={hoveredOldProrationRef}
              className={`${styles.tooltip_right_area} transition-base fade pointer-events-none`}
            >
              <div className={`${styles.tooltip_right} `}>
                <div className={`flex-center ${styles.dropdown_item}`}>詳細を確認する</div>
              </div>
              <div className={`${styles.tooltip_right_arrow}`}></div>
            </div> */}
            {/* ツールチップ ここまで */}
            <div className="flex-col-center mb-[5px] inline-flex min-h-[36px] min-w-[180px]">
              <span className="text-[12px] font-normal">プラン残り期間まで未使用となる</span>
              <span className="text-[12px] font-normal">旧プランの日割り料金</span>
            </div>
            <div
              className={`flex-center peer relative cursor-pointer group-hover:text-[var(--color-text-brand-f)]`}
              // className={`flex-center relative cursor-pointer ${
              //   isOpenOldProrationDetail
              //     ? `text-[var(--color-text-brand-f)]`
              //     : `peer group-hover:text-[var(--color-text-brand-f)]`
              // }`}
              // onClick={() => {
              //   hoveredOldProrationRef.current?.classList.remove(`${styles.active}`);
              //   // setHoveredOldProration(false);
              //   if (isFirstUpgrade) {
              //     const oldDetailItem = {
              //       _currentPeriod: currentPeriodState,
              //       _currentPeriodStart: nextInvoice.period_start,
              //       _currentPeriodEnd: nextInvoice.period_end,
              //       _invoicePeriodStart: nextInvoice.lines.data[0].period.start,
              //       _invoicePeriodEnd: nextInvoice.lines.data[0].period.end,
              //       _remainingDays: remainingDaysState,
              //       _planFeePerAccount: getPrice(userProfileState?.subscription_plan) ?? null,
              //       _oldPlanAmount:
              //         !!userProfileState?.subscription_plan && !!memberAccountsDataArray
              //           ? getPrice(userProfileState?.subscription_plan) * memberAccountsDataArray.length
              //           : null,
              //       _oldDailyRateWithThreeDecimalPoints: oldDailyRateWithThreeDecimalPoints,
              //       _oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints:
              //         oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints,
              //       _oldPlanAccountQuantity: !!memberAccountsDataArray ? memberAccountsDataArray.length : null,
              //     };
              //     setOldProrationItem(oldDetailItem);
              //     // ProrationDetailコンポーネントを開く
              //     setIsOpenOldProrationDetail(true);
              //   } else {
              //     // 🔹2回目以上アップデート
              //     // InvoiceItem配列の一覧モーダルを表示して、InvoiceItemをクリックした後にProrationDetailコンポーネントを開く
              //     setIsOpenUnusedListModal(true);
              //   }
              // }}
              // onMouseEnter={() => hoveredOldProrationRef.current?.classList.add(`${styles.active}`)}
              // onMouseLeave={() => hoveredOldProrationRef.current?.classList.remove(`${styles.active}`)}
            >
              {/* <ImInfo
                className={`ml-[-10px] mr-[8px] ${
                  isOpenOldProrationDetail
                    ? `text-[var(--color-text-brand-f)]`
                    : `text-[var(--color-text-sub)] group-hover:text-[var(--color-text-brand-f)]`
                }`}
              /> */}
              {/* <span className={`text-[var(--bright-red)]`}>-円</span> */}
              <span className={`font-bold text-[var(--bright-red)]`}>
                {!!oldPlanUnusedAmountPerAccountWithThreeDecimalPointsRef.current
                  ? `${formatToJapaneseYen(
                      Math.round(oldPlanUnusedAmountPerAccountWithThreeDecimalPointsRef.current),
                      false,
                      false
                    )}円`
                  : `-`}
              </span>
            </div>
            <div
              className={`pointer-events-none absolute bottom-[-5px] left-0 h-[2px] w-full bg-[var(--bright-red)]`}
              // className={`pointer-events-none absolute bottom-[-5px] left-0 h-[2px] w-full ${
              //   isOpenOldProrationDetail || isOpenUnusedListModal
              //     ? `bg-[var(--color-text-brand-f)]`
              //     : `bg-[var(--color-border-deep)] peer-hover:bg-[var(--color-bg-brand-f)]`
              // }`}
            />
          </div>
        </div>
        {/* コンテンツエリア ここまで */}
      </div>
    );
  };

  return (
    <>
      {/* 右側メインエリア プロフィール */}
      {selectedSettingAccountMenu === "PaymentAndPlan" && (
        <div className={`flex h-full w-full flex-col overflow-y-scroll py-[20px] pl-[20px] pr-[80px]`}>
          {/* {loading && (
            <div className={`flex-center fixed inset-0 z-[2000] rounded-[8px] bg-[#00000090]`}>
              <SpinnerIDS scale={"scale-[0.5]"} />
            </div>
          )} */}
          {isLoadingPortal && (
            <div className={`flex-center fixed inset-0 z-[2000] rounded-[8px] bg-[var(--overlay-modal-bg)]`}>
              {/* <SpinnerIDS scale={"scale-[0.5]"} /> */}
              <SpinnerComet width="min-w-[50px]" height="min-h-[50px]" />
              {/* <SpinnerX w="w-[56px]" h="h-[56px]" fill="fill-[var(--color-bg-brand-f)]" /> */}
            </div>
          )}
          <h2 className={`text-[18px] font-bold !text-[var(--color-text-title)]`}>支払いとプラン</h2>

          <div className="mb-[10px] mt-[20px] min-h-[55px] w-full">
            <h4 className="text-[18px] font-bold !text-[var(--color-text-title)]">
              会社・チームのサブスクリプション：<span>{userProfileState?.customer_name}</span>
            </h4>
            {/* メンバーシップキャンセルリクエスト後 */}
            {!!userProfileState && userProfileState.cancel_at_period_end === true && (
              <div className="mt-[10px] flex min-h-[55px] w-full items-center rounded-[4px] bg-[#FF3B5B] px-[20px]">
                {/* <AiFillExclamationCircle className="mr-[12px] text-[28px] text-[#000]" /> */}
                <AiFillInfoCircle className="mr-[12px] text-[28px] text-[#000]" />
                <p>メンバーシップは現在の請求期間の最終日にキャンセルされます。</p>
              </div>
            )}
            {/* メンバーシップキャンセルリクエスト後 ここまで */}
            {/* アカウントを減らした後 */}
            {!!stripeSchedulesDataArray &&
              !!deleteAccountRequestSchedule &&
              deleteAccountRequestSchedule.current_end_date &&
              deleteAccountRequestSchedule.type === "change_quantity" && (
                <div className="mt-[10px] flex min-h-[55px] w-full items-center rounded-[4px] bg-[#25ce6b] px-[20px] text-[#37352f]">
                  {/* <AiFillInfoCircle className="mr-[12px] text-[28px] text-[#000]" /> */}
                  <div className="flex-center mr-[12px] min-h-[26px] min-w-[26px] rounded-full bg-[#37352f] ">
                    <BsCheck2 className="stroke-1 text-[16px] text-[#25ce6b]" />
                  </div>
                  <p>アカウントの削減リクエストを受け付けました。次回請求期間の開始日に適用されます。</p>
                </div>
              )}
            {/* アカウントを減らした後 ここまで */}
            {/* プランダウングレードのスケジュールした後 */}
            {!!downgradePlanSchedule && downgradePlanSchedule.type === "change_plan" && (
              <div className="mt-[10px] flex min-h-[55px] w-full items-center rounded-[4px] bg-[var(--bright-red)] px-[20px] text-[#37352f]">
                {/* <AiFillInfoCircle className="mr-[12px] text-[28px] text-[#000]" /> */}
                <div className="flex-center mr-[12px] min-h-[26px] min-w-[26px] rounded-full bg-[#37352f] ">
                  <BsCheck2 className="stroke-1 text-[16px] text-[var(--bright-red)]" />
                </div>
                <p>プランのダウングレードを受け付けました。次回請求期間の開始日に適用されます。</p>
              </div>
            )}
            {/* プランダウングレードのスケジュールした後 ここまで */}
            <div
              className={`mt-[14px] flex w-full flex-col rounded-[4px] border border-solid border-[var(--color-border-deep)] p-[16px]`}
            >
              <div className="flex w-full">
                {userProfileState?.subscription_plan !== "free_plan" && (
                  <div className="flex-center min-h-[56px] min-w-[56px] rounded-[4px] border border-solid border-[var(--color-border-deep)]">
                    <Image width="35" height="35" src="/assets/images/icons/icons8-crown-48.png" alt="crown" />
                  </div>
                )}
                <div
                  className={`${
                    userProfileState?.subscription_plan === "free_plan" ? `` : `ml-[16px]`
                  } flex h-[56px] w-full items-center text-[18px] font-bold !text-[var(--color-text-title)]`}
                >
                  <h4>{columnNameToJapanese(userProfileState?.subscription_plan)}</h4>
                </div>
              </div>
              {userProfileState?.subscription_plan !== "free_plan" && (
                <div>
                  <div className="mt-[16px] flex w-full space-x-2 text-[15px] text-[var(--color-text-sub)]">
                    {!!userProfileState && userProfileState.cancel_at_period_end === false && (
                      <p>
                        次回請求予定日：
                        <span>
                          {userProfileState?.current_period_end
                            ? format(new Date(userProfileState.current_period_end), "yyyy年MM月dd日")
                            : ""}
                        </span>
                      </p>
                    )}
                    {!!userProfileState && userProfileState.cancel_at_period_end === true && (
                      <p>
                        お客様のメンバーシップは
                        <span>
                          {userProfileState?.current_period_end
                            ? format(new Date(userProfileState.current_period_end), "yyyy年MM月dd日")
                            : ""}
                        </span>
                        に終了します。
                      </p>
                    )}
                    {!!stripeSchedulesDataArray &&
                      !!deleteAccountRequestSchedule &&
                      deleteAccountRequestSchedule.current_end_date &&
                      deleteAccountRequestSchedule.type === "change_quantity" && (
                        <p className="text-[14px]">
                          （
                          <span className="font-bold ">
                            {format(new Date(deleteAccountRequestSchedule.current_end_date), "yyyy/MM/dd")}
                          </span>
                          に、ご利用のアカウント数は{deleteAccountRequestSchedule.scheduled_quantity}
                          個に変更されます。）
                        </p>
                      )}
                  </div>

                  <div className="mt-[8px] flex w-full space-x-2 text-[15px] text-[var(--color-text-sub)]">
                    <p>
                      ￥<span>{planToPrice(userProfileState?.subscription_plan)}</span>/月　×　メンバーアカウント：
                      <span>{userProfileState?.accounts_to_create}</span>
                      {/* {!!downgradePlanSchedule && downgradePlanSchedule.type === "change_plan" && (
                        <span>（次回請求期間に新たなプランが適用されます。）</span>
                      )} */}
                    </p>
                    {!!notSetAndDeleteRequestedAccounts.length && (
                      <p>（削除リクエスト済みアカウント：{notSetAndDeleteRequestedAccounts.length}）</p>
                    )}
                  </div>
                </div>
              )}
              {userProfileState?.subscription_plan === "free_plan" && (
                <div className="mt-[16px] flex w-full text-[15px] text-[var(--color-text-sub)]">
                  <p>ずっと無料</p>
                </div>
              )}
              <div className="mt-[16px] flex w-full">
                <button
                  className={`transition-base01 flex-center max-h-[41px] w-full min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] text-[14px] font-bold !text-[var(--color-text-title)] ${
                    isLoading ? `` : `hover:bg-[var(--setting-side-bg-select-hover)]`
                  }`}
                  // onClick={loadPortal}
                  onClick={handleOpenChangePlanModal}
                >
                  {userProfileState?.subscription_plan === "free_plan" && !isLoading && (
                    <p className="flex space-x-2">
                      <span>
                        <Image width="20" height="20" src="/assets/images/icons/icons8-crown-48.png" alt="crown" />
                      </span>
                      <span>プランをアップグレード</span>
                    </p>
                  )}
                  {userProfileState?.subscription_plan === "business_plan" && <span>プランをアップグレード</span>}
                  {userProfileState?.subscription_plan !== "business_plan" && <span>プランを変更</span>}
                  {/* {userProfileState?.subscription_plan !== "free_plan" && !isLoading && <span>プランを変更</span>}
                  {isLoading && <SpinnerIDS scale={"scale-[0.4]"} />} */}
                </button>
              </div>
              <div className="mt-[16px] flex w-full space-x-8">
                <div className="relative w-[50%] min-w-[78px]">
                  {openAccountCountsMenu && <AccountCountsDropDownMenu />}
                  <button
                    className={`transition-base02 flex-center relative max-h-[41px] w-full cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[25px] py-[10px] text-[14px] font-bold !text-[#fff] ${
                      isLoading ? `` : `hover:bg-[var(--color-bg-brand-f-hover)]`
                    }`}
                    onClick={() => {
                      if (!userProfileState?.current_period_end) return alert(`ユーザー情報が見つかりませんでした。`);
                      if (!!deleteAccountRequestSchedule)
                        return alert(
                          "アカウントの削減リクエストを受付済みです。アカウントを増やすには削減リクエストをキャンセルしてください。"
                        );
                      // if (!userProfileState) return alert("エラー：ユーザー情報が見つかりませんでした。");
                      // if (!userProfileState.current_period_end)
                      //   return alert("エラー：ユーザー情報が見つかりませんでした。");
                      // const currentDate = new Date();
                      // const currentPeriodEndDate = new Date(userProfileState.current_period_end);
                      // const isSameDay =
                      //   currentDate.getFullYear() === currentPeriodEndDate.getFullYear() &&
                      //   currentDate.getMonth() === currentPeriodEndDate.getMonth() &&
                      //   currentDate.getDate() === currentPeriodEndDate.getDate();
                      // if (isSameDay && currentDate.getTime() > currentPeriodEndDate.getTime()) {
                      //   return alert(
                      //     `本日は期間終了日を過ぎているため、アカウントを増やすお手続きは明日日付が変わってから行ってください。`
                      //   );
                      // }
                      // 🔹ビジネスプランからアップグレードルート (アップグレードは日割り計算が必要)
                      // モーダル開いた日付を取得して今日が期間終了日と一致するかを確認する
                      // モーダル開いた日付を取得(時刻情報なし) 💡テストクロックモードのため2028-11-20で現在の日付を作成
                      // const currentDateObj = new Date("2028-11-20"); // テストクロック
                      // const year = currentDateObj.getFullYear();
                      // const month = currentDateObj.getMonth();
                      // const day = currentDateObj.getDate();
                      // const currentDateOnly = new Date(year, month, day); // 現在の日付の時刻情報をリセット
                      // // 期間終了日を取得(時刻情報なし) ISOStringのためそのままでOK UNIXタイムスタンプの1000倍してミリ秒に変換不要
                      // const currentPeriodEndDateObj = new Date(userProfileState.current_period_end);
                      // const currentPeriodEndYear = currentPeriodEndDateObj.getFullYear();
                      // const currentPeriodEndMonth = currentPeriodEndDateObj.getMonth();
                      // const currentPeriodEndDay = currentPeriodEndDateObj.getDate();
                      // const currentPeriodEndDateOnly = new Date(
                      //   currentPeriodEndYear,
                      //   currentPeriodEndMonth,
                      //   currentPeriodEndDay
                      // ); // currentPeriodEndの日付の時刻情報をリセット
                      // console.log(
                      //   "currentDateOnly",
                      //   currentDateOnly.getTime(),
                      //   format(currentDateOnly, "yyyy年MM月dd日 HH時mm分ss秒")
                      // );
                      // console.log(
                      //   "currentPeriodEndDateOnly",
                      //   currentPeriodEndDateOnly.getTime(),
                      //   format(currentPeriodEndDateOnly, "yyyy年MM月dd日 HH時mm分ss秒")
                      // );
                      // if (currentDateOnly.getTime() === currentPeriodEndDateOnly.getTime()) {
                      //   alert(
                      //     `本日は期間終了日のため、アカウントを増やすお手続きは明日の${format(
                      //       new Date(userProfileState.current_period_end),
                      //       "HH時mm分ss秒"
                      //     )}以降でのお手続きをお願い申し上げます🙇‍♀️`
                      //   );
                      //   return;
                      // }
                      console.log("アカウント数を増やすクリック");
                      setIsOpenChangeAccountCountsModal("increase");
                    }}
                  >
                    {userProfileState?.subscription_plan !== "free_plan" && !isLoading && (
                      <span>アカウントを増やす</span>
                    )}
                    {isLoading && <SpinnerIDS scale={"scale-[0.4]"} />}
                  </button>
                </div>
                <button
                  className={`transition-base02 flex-center max-h-[41px] w-[50%] min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--color-bg-sub-light)] px-[25px] py-[10px] text-[14px] font-bold !text-[var(--color-text-title)] ${
                    isLoading ? `` : `hover:bg-[var(--bright-red)] hover:!text-[#fff]`
                  }`}
                  onClick={() => {
                    // 今日が請求期間終了日と一致していて、かつ終了日の時間を過ぎている場合には開けないようにする
                    console.log("アカウント数を減らすクリック");
                    setIsOpenChangeAccountCountsModal("decrease");
                  }}
                >
                  {userProfileState?.subscription_plan !== "free_plan" && !isLoading && <span>アカウントを減らす</span>}
                  {isLoading && <SpinnerIDS scale={"scale-[0.4]"} />}
                </button>
              </div>
            </div>

            <div className={`mt-[12px] flex w-full flex-col space-y-2 text-[15px] text-[var(--color-text-sub)]`}>
              {!!deleteAccountRequestSchedule && (
                <div className="flex w-full items-center justify-end">
                  <span
                    className="ml-auto cursor-pointer hover:text-[#25ce6b] hover:underline"
                    // onClick={handleCancelDeleteAccountRequestSchedule}
                    onClick={() => setShowConfirmCancelModal("delete_request")}
                  >
                    アカウントの削減リクエストをキャンセル
                  </span>
                </div>
              )}
              {!!downgradePlanSchedule && (
                <div className="flex w-full items-center justify-end">
                  <span
                    className="ml-auto cursor-pointer hover:text-[var(--color-text-brand-f)] hover:underline"
                    onClick={() => setShowConfirmCancelModal("downgrade_request")}
                  >
                    プランのダウングレードをキャンセル
                  </span>
                </div>
              )}
              <div className="flex w-full items-center justify-end">
                <span
                  className="ml-auto cursor-pointer hover:text-[var(--color-text-brand-f)] hover:underline"
                  onClick={loadPortal}
                >
                  お支払い方法の設定
                </span>
              </div>
              <div className="flex w-full items-center justify-end">
                <span
                  className="ml-auto cursor-pointer hover:text-[var(--color-text-brand-f)] hover:underline"
                  onClick={loadPortal}
                >
                  お支払いに関する詳細
                </span>
              </div>
              <div className="flex w-full items-center justify-end">
                {!!userProfileState && userProfileState.cancel_at_period_end === false && (
                  <span
                    className="ml-auto cursor-pointer hover:text-[var(--color-text-brand-f)] hover:underline"
                    onClick={() => {
                      if (!!deleteAccountRequestSchedule)
                        return alert(
                          "アカウントの削減リクエストを受付済みです。メンバーシップをキャンセルするには削減リクエストをキャンセルしてください。"
                        );
                      loadPortal();
                    }}
                  >
                    メンバーシップのキャンセル
                  </span>
                )}
                {!!userProfileState && userProfileState.cancel_at_period_end === true && (
                  <span
                    className="ml-auto cursor-pointer text-[var(--vivid-green)]  hover:text-[var(--color-text-brand-f)] hover:underline"
                    onClick={loadPortal}
                  >
                    メンバーシップの再開
                  </span>
                )}
              </div>
              <div className="flex w-full items-center justify-end">
                <span
                  className="ml-auto cursor-pointer text-[var(--color-text-brand-f)] hover:underline"
                  onClick={async () => {
                    const data = await getStripeSchedule(userProfileState, sessionState);
                    if (!!data) setGetStripeSchedule(data);
                  }}
                >
                  テスト スケジュール取得
                </span>
              </div>
              <div className="flex w-full items-center justify-end">
                <span
                  className="ml-auto cursor-pointer text-[var(--color-text-brand-f)] hover:underline"
                  onClick={async () => {
                    if (!getStripeScheduleState) return alert("スケジュールが現在ありません。");
                    await releaseStripeSchedule(getStripeScheduleState.id, sessionState);
                    if (deleteAccountRequestSchedule) {
                      const { error } = await supabase
                        .from("stripe_schedules")
                        .update({
                          schedule_status: "canceled",
                          canceled_at: new Date().toISOString(),
                        })
                        .eq("id", deleteAccountRequestSchedule.id);
                      if (error) console.error("削除リクエストスケジュールキャンセル失敗");
                    }
                    if (downgradePlanSchedule) {
                      const { error } = await supabase
                        .from("stripe_schedules")
                        .update({
                          schedule_status: "canceled",
                          canceled_at: new Date().toISOString(),
                        })
                        .eq("id", downgradePlanSchedule.id);
                      if (error) console.error("プランダウングレードリクエストスケジュールキャンセル失敗");
                    }
                  }}
                >
                  テスト スケジュール削除
                </span>
              </div>
              <div className="flex w-full items-center justify-end">
                <span
                  className="ml-auto cursor-pointer text-[var(--color-text-brand-f)] hover:underline"
                  onClick={async () => {
                    if (!deleteAccountRequestSchedule && !downgradePlanSchedule) {
                      toast.success(`削除リクエスト、ダウングレードリクエストどちらもありませんでした`, {
                        position: "top-right",
                      });
                      return console.log("削除リクエスト、ダウングレードリクエストどちらもありませんでした");
                    }
                    if (deleteAccountRequestSchedule) {
                      const { error } = await supabase
                        .from("stripe_schedules")
                        .update({
                          schedule_status: "canceled",
                          canceled_at: new Date().toISOString(),
                        })
                        .eq("id", deleteAccountRequestSchedule.id);
                      if (error) console.error("削除リクエストスケジュールキャンセル失敗");
                      toast.success(`削除リクエスト成功`, { position: "top-right" });
                      if (!downgradePlanSchedule)
                        await queryClient.invalidateQueries({ queryKey: ["stripe_schedules"] });
                    }
                    if (downgradePlanSchedule) {
                      try {
                        const { error } = await supabase
                          .from("stripe_schedules")
                          .update({
                            schedule_status: "canceled",
                            canceled_at: new Date().toISOString(),
                          })
                          .eq("id", downgradePlanSchedule.id);
                        if (error)
                          throw new Error("プランダウングレードリクエストスケジュールキャンセルに失敗しました");
                        const { error: secondError } = await supabase
                          .from("subscribed_accounts")
                          .update({
                            account_state: "active",
                          })
                          .eq("subscription_id", userProfileState?.subscription_id)
                          .eq("account_state", "delete_requested")
                          .is("company_role", null);
                        if (secondError) throw new Error("アカウントの削除リクエストの取り消しに失敗しました");
                        toast.success(`ダウングレードリクエスト成功`, { position: "top-right" });
                      } catch (e: any) {
                        console.error(e);
                        toast.error(`${e}`, { position: "top-right" });
                      }
                      await queryClient.invalidateQueries({ queryKey: ["stripe_schedules"] });
                      await queryClient.invalidateQueries({ queryKey: ["member_accounts"] });
                    }
                  }}
                >
                  テスト stripe_schedule削除
                </span>
              </div>
              <div className="flex w-full items-center justify-end">
                <span
                  className="ml-auto cursor-pointer text-[var(--color-text-brand-f)] hover:underline"
                  onClick={async () => {
                    try {
                      const { error: secondError } = await supabase
                        .from("subscribed_accounts")
                        .update({
                          account_state: "active",
                        })
                        .eq("subscription_id", userProfileState?.subscription_id)
                        .eq("account_state", "delete_requested")
                        .is("company_role", null);

                      if (secondError) throw new Error("アカウントの削除リクエストの取り消しに失敗しました");
                      await queryClient.invalidateQueries({ queryKey: ["member_accounts"] });
                      toast.success(`アカウント削除リクエスト取り消し成功`, { position: "top-right" });
                    } catch (e: any) {
                      console.error(e);
                      toast.error(`${e}`, { position: "top-right" });
                    }
                  }}
                >
                  テスト アカウント削除リクエスト取り消し
                </span>
              </div>
            </div>
          </div>
          {/* <div className={`flex-center mt-[20px] min-h-[55px] w-full bg-red-100`}>
            <div
              className={`transition-base01 flex-center min-w-[78px] cursor-pointer space-x-1 rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] text-[14px] font-bold  hover:text-[var(--color-bg-brand-f)]`}
              onClick={() => setIsOpenInsertNewProductModal(true)}
            >
              <span>＋</span>
              <span>製品追加</span>
            </div>
          </div> */}
        </div>
      )}
      {/* 右側メインエリア プロフィール ここまで */}
      {openAccountCountsMenu && (
        <div
          className="fixed left-[-50%] top-[-50%] z-[50] h-[200vh] w-[200vw]"
          onClick={() => {
            console.log("オーバーレイクリック");
            setOpenAccountCountsMenu(false);
          }}
        ></div>
      )}

      {/* ============================== チームから削除の確認モーダル ============================== */}
      {showConfirmCancelModal !== null && (
        <>
          {/* オーバーレイ */}
          <div
            className="fixed left-[-100vw] top-[-100vh] z-[1000] h-[200vh] w-[200vw] bg-[var(--color-overlay)] backdrop-blur-sm"
            onClick={() => {
              console.log("オーバーレイ クリック");
              setShowConfirmCancelModal(null);
            }}
          ></div>
          <div className="fade02 fixed left-[50%] top-[50%] z-[2000] h-auto max-h-[300px] w-[40vw] max-w-[580px] translate-x-[-50%] translate-y-[-50%] rounded-[8px] bg-[var(--color-bg-notification-modal)] p-[32px] text-[var(--color-text-title)] ">
            {loadingCancelDeleteRequest && (
              <div
                className={`flex-center absolute left-0 top-0 z-[3000] h-[100%] w-[100%] rounded-[8px] bg-[#00000090]`}
              >
                <SpinnerIDS scale={"scale-[0.5]"} />
              </div>
            )}
            {/* クローズボタン */}
            <button
              className={`flex-center z-100 group absolute right-[-40px] top-0 h-[32px] w-[32px] rounded-full bg-[#00000090] hover:bg-[#000000c0]`}
              onClick={() => {
                setShowConfirmCancelModal(null);
              }}
            >
              <MdClose className="text-[20px] text-[#fff]" />
            </button>
            <h3 className={`flex min-h-[32px] w-full items-center text-[22px] font-bold`}>
              {showConfirmCancelModal === "delete_request" && "削除リクエストをキャンセルしますか？"}
              {showConfirmCancelModal === "downgrade_request" && "プランダウングレードをキャンセルしますか？"}
            </h3>
            {/* <section className={`mt-[20px] flex h-auto w-full flex-col space-y-3 text-[14px]`}>
              <p>この操作を実行した後にキャンセルすることはできません。</p>
              <p className="font-bold">
                注：この操作により、該当ユーザーのデータは、他のチームメンバーと共有されていないものを含めて全てアクセスできなくなります。
              </p>
            </section> */}
            <section className="flex w-full items-start justify-end">
              <div className={`flex w-[100%] items-center justify-around space-x-5 pt-[30px]`}>
                <button
                  className={`w-[50%] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[15px] py-[10px] text-[14px] font-bold text-[var(--color-text-title)] hover:bg-[var(--setting-side-bg-select-hover)]`}
                  onClick={() => {
                    setShowConfirmCancelModal(null);
                  }}
                >
                  キャンセル
                </button>
                {showConfirmCancelModal === "delete_request" && (
                  <button
                    className="w-[50%] cursor-pointer rounded-[8px] bg-[var(--color-red-tk)] px-[15px] py-[10px] text-[14px] font-bold text-[#fff] hover:bg-[var(--color-red-tk-hover)]"
                    onClick={handleCancelDeleteAccountRequestSchedule}
                  >
                    削除リクエストをキャンセルする
                  </button>
                )}
                {showConfirmCancelModal === "downgrade_request" && (
                  <button
                    className="w-[50%] cursor-pointer rounded-[8px] bg-[var(--color-red-tk)] px-[15px] py-[10px] text-[14px] font-bold text-[#fff] hover:bg-[var(--color-red-tk-hover)]"
                    onClick={handleCancelDowngradePlanRequestSchedule}
                  >
                    ダウングレードをキャンセルする
                  </button>
                )}
              </div>
            </section>
          </div>
        </>
      )}
      {/* ============================== チームから削除の確認モーダル ここまで ============================== */}
      {/* ============================== 🌟プランを変更モーダル ============================== */}
      {isOpenChangePlanModal && (
        <>
          {/* オーバーレイ */}
          <div
            className="fixed left-[-100vw] top-[-100vh] z-[1000] h-[200vh] w-[200vw] bg-[var(--color-overlay)] backdrop-blur-sm"
            onClick={() => {
              console.log("オーバーレイ クリック");
              setIsOpenChangePlanModal(false);
              setIsUpgradePlan(false);
            }}
          ></div>
          <div className="fade02 shadow-all-md fixed left-[50%] top-[50%] z-[2000] flex h-[75vh] max-h-[600px] w-[68vw] max-w-[940px] translate-x-[-50%] translate-y-[-50%] rounded-[8px] bg-[var(--color-bg-notification-modal)] text-[var(--color-text-title)]">
            {/* オーバーレイ */}
            {isLoadingSubmitChangePlan && (
              <div
                className={`flex-center absolute left-0 top-0 z-[3000] h-[100%] w-[100%] rounded-[8px] bg-[#00000090]`}
              >
                <SpinnerIDS scale={"scale-[0.5]"} />
              </div>
            )}
            {/* クローズボタン */}
            <button
              className={`flex-center z-100 group absolute right-[-40px] top-0 h-[32px] w-[32px] rounded-full bg-[#00000090] hover:bg-[#000000c0]`}
              onClick={() => {
                setIsOpenChangePlanModal(false);
                setIsUpgradePlan(false);
              }}
            >
              <MdClose className="text-[20px] text-[#fff]" />
            </button>
            {/* メイン */}
            {/* 左エリア */}
            <div className={`relative flex h-full w-[42%] flex-col pb-[20px] pt-[30px]`}>
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
              </div> */}
              {isUpgradePlan && (
                <h1 className={`w-full px-[30px] text-[22px] font-bold`}>データをさらに活用して付加価値を最大化する</h1>
              )}
              {!isUpgradePlan && (
                <h1 className={`w-full px-[30px] text-[22px] font-bold`}>コストを抑えてデータを活用する</h1>
              )}
              <div className={`w-full px-[30px] pb-[20px] pt-[15px]`}>
                {isUpgradePlan && (
                  <p className="text-[13px] leading-[22px]">
                    <span className="font-bold">プレミアムプラン</span>
                    にアップグレードして、TRUSTiFYを余すことなく活用することで売上アップ、コスト削減をさらに加速させましょう。次の機能を利用できます。
                  </p>
                )}
                {!isUpgradePlan && (
                  <p className="text-[13px] leading-[22px]">
                    <span className="font-bold">ビジネスプラン</span>
                    にダウングレードしてもコンテンツは使い放題のため、安心してご利用いただけます。ダウングレードの前に以下をご確認ください。
                  </p>
                )}
              </div>
              <div className={`mt-[5px] w-full space-y-3 px-[30px]`}>
                {isUpgradePlan && (
                  <div className="flex space-x-3">
                    {/* <BsCheck2 className="stroke-1 text-[24px] text-[#00d436]" /> */}
                    <div className="flex min-h-[24px] min-w-[24px] justify-center">
                      <GiLaurelCrown className="stroke-1 text-[24px] text-[#00d436]" />
                    </div>
                    <div className="flex flex-col">
                      <p className="text-[13px] font-bold">電話・オンラインWebツールによるサポート。</p>
                      <p className="mt-[4px] text-[13px] leading-[22px]">
                        実際にお客様の画面を見ながら使い方やデータ活用方法のレクチャーを受けられます。
                      </p>
                    </div>
                  </div>
                )}
                {!isUpgradePlan && (
                  <div className="flex space-x-3">
                    {/* <BsCheck2 className="stroke-1 text-[24px] text-[#00d436]" /> */}
                    <div className="flex min-h-[24px] min-w-[24px] justify-center">
                      <GiLaurelCrown className="stroke-1 text-[24px] text-[#00d436]" />
                    </div>
                    <div className="flex flex-col">
                      <p className="text-[13px] font-bold">全てのコンテンツが使い放題。</p>
                      <p className="mt-[4px] text-[13px] leading-[22px]">
                        ビジネスプランでも全てのコンテンツが使い放題。最小のコストで最大の経済効果を上げましょう。
                      </p>
                    </div>
                  </div>
                )}
                {isUpgradePlan && (
                  <div className="flex space-x-3">
                    {/* <MdOutlineBubbleChart className="text-[22px] text-[#00d436]" /> */}
                    <div className="flex min-h-[24px] min-w-[24px] justify-center">
                      <FaChartPie className="ml-[3px] mr-[1px] text-[19px] text-[#00d436]" />
                    </div>
                    {/* <MdOutlineBubbleChart className="text-[24px] text-[#00d436]" /> */}
                    {/* <GrLineChart className="stroke-1 text-[24px] text-[#00d436]" /> */}
                    {/* <FaChartLine className=" text-[20px] text-[#00d436]" /> */}
                    <div className="flex flex-col">
                      <p className="text-[13px] font-bold">欲しい機能を優先的に開発。</p>
                      <p className="mt-[4px] text-[13px] leading-[22px]">
                        チームに欲しい機能を伝えて、プレミアムプランのメンバーから優先的に実装を行います。
                      </p>
                    </div>
                  </div>
                )}
                {isUpgradePlan && (
                  <div className="flex space-x-3">
                    <div className="flex min-h-[24px] min-w-[24px] justify-center">
                      <FaChartLine className="ml-[2px] mr-[1px] text-[20px] text-[#00d436]" />
                    </div>
                    <div className="flex flex-col">
                      <p className="text-[13px] font-bold">いつでもプランの変更やキャンセルが可能です。</p>
                    </div>
                  </div>
                )}
                {!isUpgradePlan && (
                  <div className="flex space-x-3">
                    <div className="flex min-h-[24px] min-w-[24px] justify-center">
                      <FaRegHeart className="text-[20px] text-[var(--bright-red)]" />
                      {/* <GiLaurelCrown className="stroke-1 text-[24px] text-[var(--bright-red)]" /> */}
                    </div>
                    <div className="flex flex-col">
                      <p className="text-[13px] font-bold">サポートはプレミアムプランが充実。</p>
                      <p className="mt-[4px] text-[13px] leading-[22px]">
                        プレミアムプランなら迅速なサポートを受けることが可能なため、付加価値を最大化につながります。
                      </p>
                    </div>
                  </div>
                )}
                {!isUpgradePlan && (
                  <div className="flex space-x-3">
                    <div className="flex min-h-[24px] min-w-[24px] justify-center">
                      <FaChartLine className="text-[20px] text-[var(--bright-red)]" />
                    </div>
                    <div className="flex flex-col">
                      <p className="text-[13px] font-bold">プレミアムプランで自社にフィットしたデータベースを実現。</p>
                      <p className="mt-[4px] text-[13px] leading-[22px]">
                        プレミアムプランなら自社に合った機能や要望を優先的に開発が可能なため、経済効果の最大化を実現可能です。
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {/* 価格 */}
              {!isLoadingFetchInvoice && (
                <div className={`mt-[20px] flex w-full items-center justify-between px-[30px]`}>
                  <p className="text-[13px]">プラン価格(/月/アカウント)</p>
                  <div className="space-x-3">
                    {isUpgradePlan && <span className="text-[13px]">￥980</span>}
                    {!isUpgradePlan && <span className="text-[13px]">￥19,800</span>}
                    <span className="text-[13px]">→</span>
                    {!isUpgradePlan && <span className="text-[13px]">￥980</span>}
                    {isUpgradePlan && <span className="text-[13px]">￥19,800</span>}
                  </div>
                </div>
              )}
              {isLoadingFetchInvoice && (
                <div className="mt-[15px] flex w-full flex-col space-y-3 px-[30px]">
                  <SkeletonLoadingLineFull />
                  <SkeletonLoadingLineLong />
                  <SkeletonLoadingLineMedium />
                </div>
              )}
              {!isLoadingFetchInvoice && isUpgradePlan && !isLastDay && (
                <div className={`mt-[15px] flex w-full flex-col px-[30px]`}>
                  {!todayIsPeriodEnd && (
                    <div className="flex w-full items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[13px] ">今月残り期間の日割り費用</span>
                        <span className="text-[13px] ">(/アカウント)</span>
                      </div>
                      <div
                        className="relative flex items-center space-x-2 text-[13px]"
                        onMouseEnter={() => setIsOpenAdditionalCostModal(true)}
                        onMouseLeave={() => setIsOpenAdditionalCostModal(false)}
                      >
                        <BsChevronDown />
                        {/* <span>￥1,200</span> */}
                        <span className="cursor-pointer">
                          {!!newPlanRemainingAmountPerAccountWithThreeDecimalPointsRef.current &&
                          !!oldPlanUnusedAmountPerAccountWithThreeDecimalPointsRef.current
                            ? formatToJapaneseYen(
                                Math.round(
                                  newPlanRemainingAmountPerAccountWithThreeDecimalPointsRef.current -
                                    oldPlanUnusedAmountPerAccountWithThreeDecimalPointsRef.current
                                ),
                                true
                              )
                            : `-`}
                        </span>
                        {isOpenAdditionalCostModal && <AdditionalCostModal />}
                        {/* <AdditionalCostModal /> */}
                      </div>
                    </div>
                  )}
                  <div className="mt-[15px] flex w-full items-center justify-between">
                    <span className="text-[13px] font-bold">本日のお支払い</span>
                    {!todayIsPeriodEnd && <span className="text-[13px] font-bold">￥0</span>}
                    {todayIsPeriodEnd && (
                      <div className="flex items-center space-x-2 text-[13px] font-bold">
                        <BsChevronDown />
                        {isUpgradePlan && (
                          <span>
                            {!!premiumPlanFeePerAccountRef.current && !!userProfileState?.accounts_to_create
                              ? formatToJapaneseYen(
                                  premiumPlanFeePerAccountRef.current * userProfileState.accounts_to_create,
                                  true
                                )
                              : `-`}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* アップグレード/ダウングレードボタンエリア */}
              <div className="mt-[20px] w-full px-[30px]">
                <button
                  className={`flex-center h-[40px] w-full rounded-[6px] text-[14px] font-semibold text-[#fff] ${
                    isUpgradePlan
                      ? `bg-[var(--color-bg-brand-f)] hover:bg-[var(--color-bg-brand-f-deep)]`
                      : `bg-[var(--bright-red)] hover:bg-[var(--bright-red-hover)]`
                  } ${isLoadingFetchStripeInvoice ? `cursor-wait` : `cursor-pointer`}`}
                  // className={`flex-center h-[40px] w-full rounded-[6px] bg-[var(--color-bg-brand-f)] font-bold text-[#fff]  ${
                  //   loading ? `cursor-wait` : `cursor-pointer hover:bg-[var(--color-bg-brand-f-deep)]`
                  // }`}
                  // onClick={() => {
                  //   if (selectedRadioButton === "business_plan" && !!planBusiness)
                  //     processSubscription(planBusiness.id, accountQuantity);
                  //   if (selectedRadioButton === "premium_plan" && !!planPremium)
                  //     processSubscription(planPremium.id, accountQuantity);
                  // }}
                  onClick={handleOpenConfirmChangePlanModal}
                >
                  {isUpgradePlan && !isLoadingFetchStripeInvoice && <span>今すぐアップグレード</span>}
                  {!isUpgradePlan && !isLoadingFetchStripeInvoice && <span>今すぐダウングレード</span>}
                  {isLoadingFetchStripeInvoice && <SpinnerIDS scale={"scale-[0.4]"} />}
                  {/* {!isLoadingSubmitChangePlan && isUpgradePlan && <span>今すぐアップグレード</span>}
                  {!isLoadingSubmitChangePlan && !isUpgradePlan && <span>今すぐダウングレード</span>}
                  {isLoadingSubmitChangePlan && <SpinnerIDS scale={"scale-[0.4]"} />} */}
                </button>
              </div>
            </div>
            {/* 左エリア */}
            {/* 右エリア */}
            <div
              className={`relative flex h-full w-[58%] flex-col items-center justify-center ${styles.modal_right_container}`}
            >
              <Image
                src={`/assets/images/team/pexels-fauxels_900_600.jpg`}
                alt=""
                placeholder="blur"
                blurDataURL="/assets/images/team/pexels-fauxels_900_600_placeholder.jpg"
                fill
                className={`${styles.modal_right_image}`}
              />
            </div>
            {/* <div
              className={`relative flex h-full w-[58%] flex-col items-center justify-center ${styles.modal_right_container}`}
            >
              <div className="z-10 mb-[-30px]">{winnersIllustration}</div>
              <div className="z-0 flex min-h-[57%] w-[70%] flex-col rounded-[8px] bg-[var(--color-modal-bg-side-c-second)] px-[24px] pb-[8px] pt-[58px] text-[var(--color-text-title)]">
                <p className={`text-[14px] font-bold`}>方法は以下の通りです。</p>
                <div className="mt-[12px] flex h-auto w-full text-[14px]">
                  <p className="mr-[4px]">1.</p>
                  <p>あなたの代わりとして、チームの誰かを所有者に任命します。</p>
                </div>
                <div className="mt-[16px] flex h-auto w-full text-[14px]">
                  <p className="mr-[4px]">2.</p>
                  <div className="flex w-full flex-col">
                    <p>任命されたメンバーが承諾するのを待ちます。</p>
                    <p className="mt-[4px] text-[12px] text-[var(--color-text-sub)]">
                      任命された人は、このチーム、チームメンバー、チームコンテンツの新しい管理者権限を持つことになります。
                    </p>
                  </div>
                </div>
                <div className="mt-[16px] flex h-auto w-full text-[14px]">
                  <p className="mr-[4px]">3.</p>
                  <div className="flex w-full flex-col">
                    <p>任命されたメンバーが承諾すると、あなたの役割は所有者から管理者に切り替わります。</p>
                    <p className="mt-[4px] text-[12px] text-[var(--color-text-sub)]">
                      新しい所有者が承諾すると、この操作を元に戻すことはできません。
                    </p>
                  </div>
                </div>
              </div>
            </div> */}
            {/* 右エリア */}
          </div>
        </>
      )}
      {/* ============================== ✅プランを変更モーダル ここまで ============================== */}
      {/* ============================== 🌟プランを変更確定・確認モーダル ============================== */}
      {isOpenConfirmChangePlanModal && <ConfirmChangePlanModal />}
      {/* ============================== ✅プランを変更確定・確認モーダル ここまで ============================== */}
    </>
  );
};

export const SettingPaymentAndPlan = memo(SettingPaymentAndPlanMemo);
