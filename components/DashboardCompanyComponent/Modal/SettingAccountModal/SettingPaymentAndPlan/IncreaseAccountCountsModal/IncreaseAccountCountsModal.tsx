import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import useDashboardStore from "@/store/useDashboardStore";
import React, { FC, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./IncreaseAccountCountsModal.module.css";
import { BsCheck2, BsChevronDown } from "react-icons/bs";
import useStore from "@/store";
import Image from "next/image";
import { MdClose } from "react-icons/md";
import Vertical_SlideCards from "@/components/Parts/Vertical_SlideCards/Vertical_SlideCards";
import { HiOutlineLink, HiPlus } from "react-icons/hi2";
import { ImInfo, ImLink } from "react-icons/im";
import { AiOutlinePlus } from "react-icons/ai";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { toast } from "react-toastify";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { StripeSchedule, SubscribedAccount } from "@/types";
import { FaChevronLeft, FaChevronRight, FaPlus, FaRegCircle, FaRegFolderOpen } from "react-icons/fa";
import { useQueryMemberAccounts } from "@/hooks/useQueryMemberAccounts";
import { format } from "date-fns";
import Stripe from "stripe";
import { formatToJapaneseYen } from "@/utils/Helpers/formatToJapaneseYen";
import { getPlanName } from "@/utils/Helpers/getPlanName";
import { getPrice } from "@/utils/Helpers/getPrice";
import { FiPlus, FiPlusCircle } from "react-icons/fi";
import { IoPricetagOutline } from "react-icons/io5";
import { getDaysElapsedFromTimestampToNow } from "@/utils/Helpers/getDaysElapsedFromTimestampToNow";
import { getDaysElapsedFromTimestampToNowPeriodEndHours } from "@/utils/Helpers/getDaysElapsedFromTimestampToNowPeriodEndHours";
import { getRemainingDaysFromNowPeriodEndHourToTimestamp } from "@/utils/Helpers/getRemainingDaysFromNowPeriodEndHourToTimestamp";
import { getDaysFromTimestampToTimestamp } from "@/utils/Helpers/getDaysFromTimestampToTimestamp";
import { getPeriodInDays } from "@/utils/Helpers/getPeriodInDays";
import { useQueryUpcomingInvoiceChangeQuantity } from "@/hooks/useQueryUpcomingInvoiceChangeQuantity";
import { FallbackIncreaseAccountCountsModal } from "./FallbackIncreaseAccountCountsModal";
import { CheckInvoiceStripeLocalModal } from "./CheckInvoiceStripeLocalModal";
import { getProrationAmountAndDailyRate } from "@/utils/Helpers/getProrationAmountAndDailyRate";
// import { ProrationDetails } from "./ProrationDetails";

type NewProrationDetail = {
  _currentPeriod: number | null;
  _currentPeriodStart: number | null;
  _currentPeriodEnd: number | null;
  _invoicePeriodStart: number | null;
  _invoicePeriodEnd: number | null;
  _remainingDays: number | null;
  _planFeePerAccount: number | null;
  _newPlanAmount: number | null;
  _newDailyRateWithThreeDecimalPoints: number | null;
  _newUsageAmountForRemainingPeriodWithThreeDecimalPoints: number | null;
  _totalAccountQuantity: number | null;
};
type OldProrationDetail = {
  _currentPeriod: number | null;
  _currentPeriodStart: number | null;
  _currentPeriodEnd: number | null;
  _invoicePeriodStart: number | null;
  _invoicePeriodEnd: number | null;
  _remainingDays: number | null;
  _planFeePerAccount: number | null;
  _oldPlanAmount: number | null;
  _oldDailyRateWithThreeDecimalPoints: number | null;
  _oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints: number | null;
  _oldPlanAccountQuantity: number | null;
};

type LastInvoiceItem = {
  periodStart: number | null;
  periodEnd: number | null;
  planFeePerAccount: number | null;
  oldQuantity: number | null;
  newQuantity: number | null;
  oldPlanAmount: number | null;
  newPlanAmount: number | null;
  newDailyRateWithThreeDecimalPoints: number | null;
  newUsageAmountForRemainingPeriodWithThreeDecimalPoints: number | null;
  oldDailyRateWithThreeDecimalPoints: number | null;
  oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints: number | null;
};

const IncreaseAccountCountsModalMemo = () => {
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const sessionState = useStore((state) => state.sessionState);
  const setIsOpenChangeAccountCountsModal = useDashboardStore((state) => state.setIsOpenChangeAccountCountsModal);
  // ローディング
  const [loading, setLoading] = useState(false);
  const [isLoadingFirstFetch, setIsLoadingFirstFetch] = useState(true);
  // 新規で契約するアカウント個数
  const [accountQuantity, setAccountQuantity] = useState<number | null>(1);
  // 本日のお支払いが0円かどうか
  const [isFreeTodaysPayment, setIsFreeTodaysPayment] = useState(true);
  const [todaysPayment, setTodaysPayment] = useState(0);
  const [hoveredTodaysPayment, setHoveredTodaysPayment] = useState(false);
  // 今日が最終日かどうか
  const [isLastDay, setIsLastDay] = useState(false);
  // 変更後の次回支払い金額 Zustandバージョン
  const nextInvoice = useDashboardStore((state) => state.nextInvoice);
  const setNextInvoice = useDashboardStore((state) => state.setNextInvoice);
  // const [nextInvoice, setNextInvoice] = useState<Stripe.UpcomingInvoice | null>(null);
  // アカウント追加後の次回支払い料金の詳細モーダルを表示
  const [isOpenInvoiceDetail, setIsOpenInvoiceDetail] = useState(false);
  // 未使用分InvoiceItemの一覧表示するモーダル / 残り使用分InvoiceItemの一覧表示するモーダル
  const [isOpenUnusedListModal, setIsOpenUnusedListModal] = useState(false);
  const [isOpenRemainingUsageListModal, setIsOpenRemainingUsageListModal] = useState(false);
  // 日割り料金の詳細モーダル
  const [isOpenNewProrationDetail, setIsOpenNewProrationDetail] = useState(false);
  const [isOpenOldProrationDetail, setIsOpenOldProrationDetail] = useState(false);
  const [newProrationItem, setNewProrationItem] = useState<NewProrationDetail | null>(null);
  const [oldProrationItem, setOldProrationItem] = useState<OldProrationDetail | null>(null);
  // 最終確認モーダル
  const [isOpenLastConfirmationModal, setIsOpenLastConfirmationModal] = useState(false);
  // 支払い詳細モーダルがマウントされた時にtoggleFadeRefをtrue、アンマウントでfalseにしてfadeを初回ホバー時のみ適用する
  const nextPaymentDetailComponentRef = useRef<HTMLDivElement | null>(null);
  const toggleFadeRef = useRef(false);
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();

  // ============================= 🌟ローカルState 次回支払い情報を格納 =============================
  // 数量アップグレード初めてか２回目以上か
  const [isFirstUpgrade, setIsFirstUpgrade] = useState(true);
  // 数量アップグレード２回目以上ルートの今までの未使用分のインボイスアイテムを格納する配列
  const [unusedInvoiceItemArray, setUnusedInvoiceItemArray] = useState<Stripe.InvoiceLineItem[]>([]);
  const [stripeUnusedInvoiceItemArray, setStripeUnusedInvoiceItemArray] = useState<Stripe.InvoiceLineItem[]>([]);

  // 数量アップグレード２回目以上ルートの今までの残り使用分のインボイスアイテムを格納する配列
  const [remainingUsageInvoiceItemArray, setRemainingUsageInvoiceItemArray] = useState<Stripe.InvoiceLineItem[]>([]);
  const [stripeRemainingUsageInvoiceItemArray, setStripeRemainingUsageInvoiceItemArray] = useState<
    Stripe.InvoiceLineItem[]
  >([]);
  // 数量アップグレード２回目以上ルート 最後のinvoiceItem、ユーザーが選択している数量に変更する
  const [lastInvoiceItemState, setLastInvoiceItemState] = useState<LastInvoiceItem>({
    periodStart: null,
    periodEnd: null,
    planFeePerAccount: null,
    oldQuantity: null,
    newQuantity: null,
    oldPlanAmount: null,
    newPlanAmount: null,
    newDailyRateWithThreeDecimalPoints: null,
    newUsageAmountForRemainingPeriodWithThreeDecimalPoints: null,
    oldDailyRateWithThreeDecimalPoints: null,
    oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints: null,
  });
  // 請求期間(日数)State
  const [currentPeriodState, setCurrentPeriodState] = useState<number | null>(null);
  // プラン期間残り日数(今回の変更分)
  const [remainingDaysState, setRemainingDaysState] = useState<number | null>(null);
  // 新プランの月額料金の1日あたりの料金
  const [newDailyRateWithThreeDecimalPoints, setNewDailyRateWithThreeDecimalPoints] = useState<number | null>(null);
  // 旧プランの月額料金の1日あたりの料金
  const [oldDailyRateWithThreeDecimalPoints, setOldDailyRateWithThreeDecimalPoints] = useState<number | null>(null);
  // 新プランの残り期間までの利用分の金額
  const [
    newUsageAmountForRemainingPeriodWithThreeDecimalPoints,
    setNewUsageAmountForRemainingPeriodWithThreeDecimalPoints,
  ] = useState<number | null>(null);
  // 旧プランの残り期間までの利用分の金額
  const [
    oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints,
    setOldUnusedAmountForRemainingPeriodWithThreeDecimalPoints,
  ] = useState<number | null>(null);
  // 次回追加費用
  const [additionalCostState, setAdditionalCostState] = useState<number | null>(null);
  // 更新後の追加費用を上乗せした次回支払額
  const [nextInvoiceAmountState, setNextInvoiceAmountState] = useState<number | null>(null);

  // ================================ 🌟Stripe用ローカルState ================================
  const [stripeRetrieveInvoice, setStripeRetrieveInvoice] = useState<Stripe.UpcomingInvoice | null>(null);
  // ローカルとStripeのInvoiceが合っているか確認できるモーダル
  const [isOpenCheckInvoiceStripeLocalModal, setIsOpenCheckInvoiceStripeLocalModal] = useState(false);
  // 新プランの1日あたりの料金(Stripeから取得)
  const [stripeNewDailyRateWithThreeDecimalPoints, setStripeNewDailyRateWithThreeDecimalPoints] = useState<
    number | null
  >(null);
  // 新プランの残り使用分の料金(Stripeから取得)
  const [
    stripeNewUsageAmountForRemainingPeriodWithThreeDecimalPoints,
    setStripeNewUsageAmountForRemainingPeriodWithThreeDecimalPoints,
  ] = useState<number | null>(null);
  // 旧プランの1日当たりの料金(Stripeから取得)
  const [stripeOldDailyRateWithThreeDecimalPoints, setStripeOldDailyRateWithThreeDecimalPoints] = useState<
    number | null
  >(null);
  // 旧プランの残り未使用分の料金(Stripeから取得)
  const [
    stripeOldUnusedAmountForRemainingPeriodWithThreeDecimalPoints,
    setStripeOldUnusedAmountForRemainingPeriodWithThreeDecimalPoints,
  ] = useState<number | null>(null);
  // 追加費用(Stripeから取得)
  const [stripeAdditionalCostState, setStripeAdditionalCostState] = useState<number | null>(null);
  // 次回支払額(Stripeから取得)
  const [stripeNextInvoiceAmountState, setStripeNextInvoiceAmountState] = useState<number | null>(null);

  // useQueryで取得したStripeのInvoiceとローカルのInvoiceを比較して一致しているかチェック
  // const [isLoadingCalculation, setIsLoadingCalculation] = useState(false);

  // ============================= 🌟useQueryエリア =============================
  // 現在契約しているメンバーアカウント全てを取得して、契約アカウント数をlengthで取得
  const {
    data: memberAccountsDataArray,
    error: useQueryError,
    isLoading: useQueryIsLoading,
    refetch: refetchMemberAccounts,
  } = useQueryMemberAccounts();

  // スケジュールを取得
  // const [downgradePlanSchedule, setDowngradePlanSchedule] = useState<StripeSchedule | null>(null);
  const stripeSchedulesDataArray = queryClient.getQueryData<StripeSchedule[]>(["stripe_schedules"]);

  // const {
  //   data: upcomingInvoiceData,
  //   error: upcomingInvoiceError,
  //   isLoading: isLoadingUpcomingInvoice,
  // } = useQueryUpcomingInvoiceChangeQuantity(
  //   totalAccountQuantity,
  //   userProfileState?.stripe_customer_id,
  //   userProfileState?.stripe_subscription_id,
  //   sessionState
  // );
  // ============================= ✅useQueryエリア =============================

  // 請求期間開始日から経過した日数 今日の日付は現在で、時間、分、秒はperiod_endに合わせた今日までの経過時間
  const elapsedDays = useMemo(() => {
    if (!nextInvoice) return null;
    return getDaysElapsedFromTimestampToNowPeriodEndHours(nextInvoice.period_start, nextInvoice.period_end).elapsedDays;
  }, [nextInvoice?.period_start, nextInvoice?.period_end]);
  // const elapsedDays = getDaysElapsedFromTimestampToNow(nextInvoice.period_start).elapsedDays;
  const hours = useMemo(() => {
    if (!nextInvoice) return null;
    // return getDaysElapsedFromTimestampToNow(nextInvoice.period_start).hours;
    return getDaysElapsedFromTimestampToNowPeriodEndHours(nextInvoice.period_start, nextInvoice.period_end).hours;
  }, [nextInvoice?.period_start]);
  const minutes = useMemo(() => {
    if (!nextInvoice) return null;
    // return getDaysElapsedFromTimestampToNow(nextInvoice.period_start).minutes;
    return getDaysElapsedFromTimestampToNowPeriodEndHours(nextInvoice.period_start, nextInvoice.period_end).minutes;
  }, [nextInvoice?.period_start]);
  // const seconds = getDaysElapsedFromTimestampToNow(nextInvoice.period_start).seconds;

  // 終了日までの残り日数 今日の日付は現在で、時間、分、秒はperiod_endに合わせた今日から終了日まで残り日数
  const remainingDays = useMemo(() => {
    if (!nextInvoice) return null;
    return getRemainingDaysFromNowPeriodEndHourToTimestamp(nextInvoice.period_end).remainingDays;
  }, [nextInvoice?.period_end]);
  const remainingHours = useMemo(() => {
    if (!nextInvoice) return null;
    return getRemainingDaysFromNowPeriodEndHourToTimestamp(nextInvoice.period_end).hours;
  }, [nextInvoice?.period_end]);
  const remainingMinutes = useMemo(() => {
    if (!nextInvoice) return null;
    return getRemainingDaysFromNowPeriodEndHourToTimestamp(nextInvoice.period_end).minutes;
  }, [nextInvoice?.period_end]);

  // 請求期間日数
  const currentPeriod = useMemo(() => {
    if (!nextInvoice) return null;
    return getPeriodInDays(nextInvoice.period_start, nextInvoice.period_end);
  }, [nextInvoice?.period_start, nextInvoice?.period_end]);

  // 契約中のアカウント個数
  const currentAccountCounts = !!memberAccountsDataArray ? memberAccountsDataArray.length : 0;

  // Stripeのサブスクリプションのquantityを新たな数量に更新 現在のアカウント数と新たに追加するアカウント数を合算
  const totalAccountQuantity = currentAccountCounts + (accountQuantity ?? 0);

  // 追加費用 nextInvoice.lines.data[0].amountがマイナスの値のため引くためには加算でOK
  // const additionalCost =
  //   !!nextInvoice && !!nextInvoice?.lines?.data[1]?.amount
  //     ? nextInvoice.lines.data[1].amount + nextInvoice.lines.data[0].amount
  //     : null;

  // ===================== 🌟支払い詳細モーダルのfadeクラスをトグル useEffect =====================
  useEffect(() => {
    if (nextPaymentDetailComponentRef.current) {
      if (toggleFadeRef.current === true && isOpenInvoiceDetail) {
        setTimeout(() => {
          console.log("🚀fadeをfalseに");
          toggleFadeRef.current = false;
        }, 200);
        // toggleFadeRef.current = false;
      }
    }
    if (!isOpenInvoiceDetail && toggleFadeRef.current === false) {
      console.log("🚀fadeをtrueに");
      toggleFadeRef.current = true;
    }
  }, [isOpenInvoiceDetail, nextPaymentDetailComponentRef.current]);
  // ===================== ✅支払い詳細モーダルのfadeクラスをトグル useEffect =====================

  // ===================== 🌟初回マウントuseEffect UpcomingInvoiceを取得する関数 =====================
  const getUpcomingInvoice = useCallback(async () => {
    if (!userProfileState) return console.error("userProfileStateなしのためリターン");
    // if (!!nextInvoice) return console.error("🚨既にnextInvoice取得済みのためリターン");
    if (!memberAccountsDataArray) return console.error("memberAccountsDataArrayなしのためリターン");
    console.log(
      "🔥getUpcomingInvoice関数実行 /retrieve-upcoming-invoiceへaxios.post()🔥 totalAccountQuantity",
      totalAccountQuantity,
      "currentAccountCounts",
      currentAccountCounts,
      "accountQuantity",
      accountQuantity
    );

    setIsLoadingFirstFetch(true); // ローディング開始

    try {
      const payload = {
        stripeCustomerId: userProfileState.stripe_customer_id,
        stripeSubscriptionId: userProfileState.stripe_subscription_id,
        changeQuantity: totalAccountQuantity, // 数量変更後の合計アカウント数
        changePlanName: null, // プラン変更ではないので、nullをセット
        currentQuantity: null, // プラン変更用なのでnullをセット
      };

      const {
        data: { data: upcomingInvoiceData, error: upcomingInvoiceError },
      } = await axios.post(`/api/subscription/retrieve-upcoming-invoice`, payload, {
        headers: {
          Authorization: `Bearer ${sessionState.access_token}`,
        },
      });

      if (!!upcomingInvoiceError) {
        console.log(
          "🌟Stripe将来のインボイス取得ステップ7 /retrieve-upcoming-invoiceへのaxios.postエラー",
          upcomingInvoiceError
        );
        throw new Error(upcomingInvoiceError);
      }

      console.log(
        "🌟Stripe将来のインボイス取得ステップ7 /retrieve-upcoming-invoiceへのaxios.postで次回のインボオスの取得成功",
        upcomingInvoiceData
      );

      // StripeのInvoiceをローカルStateに格納
      setNextInvoice(upcomingInvoiceData);

      // ======================== StripeのInvoiceをローカルStateに格納 ========================

      // 🔹比例配分日が終了日と同じ場合にはinvoiceのlistオブジェクトのdata配列にinvoiceItemは存在せず、typeがsubscriptionのline_itemオブジェクトのみとなるため、まずはここで分岐させる
      // line_itemが一つのみかどうかチェック
      // 🔹本日が終了日のルート
      if ((upcomingInvoiceData as Stripe.UpcomingInvoice).lines.data.length === 1) {
        const subscriptionLineItem = (upcomingInvoiceData as Stripe.UpcomingInvoice).lines.data.filter(
          (item) => item.type === "subscription"
        )[0]; // [0]のインデックスで配列ではなくオブジェクトで取得
        // setNextInvoiceAmountState((upcomingInvoiceData as Stripe.UpcomingInvoice).amount_due);
        // ローディング終了
        setIsLoadingFirstFetch(false);
        console.log(
          "初回マウント時のInvoiceフェッチ invoiceのlistオブジェクトのdata配列が1つのみで「本日がお支払い」のためローカルStateに格納せずにリターン"
        );
        return;
      }
      // 🔹比例配分日が終了日と違う場合にはInvoiceItemList配列は2以上になる(基本は3つ以上: 未使用分、使用分、新プラン)
      else {
        // 変更後のサブスクリプション新プランを取り除いたinvoiceitemのみの配列を取得
        const invoiceItemList = (upcomingInvoiceData as Stripe.UpcomingInvoice).lines.data.filter(
          (item) => item.type === "invoiceitem"
        );
        console.log(
          "InvoiceLineItem[]から未使用、残り使用のみのinvoiceitemタイプのみを取得 invoiceItemList",
          invoiceItemList
        );
        // invoiceItemListが偶数の要素かチェック(偶数なら正確に未使用分と残り使用分を分けられているかチェック)
        if (invoiceItemList.length % 2 === 1) {
          // invoiceItemListが偶数の要素かチェック => 奇数のためこのままリターンしてモーダルを閉じる
          console.error("❌invoiceitemタイプの配列の要素が偶数でないためリターン");
          setIsOpenChangeAccountCountsModal(null);
          toast.error("問題が発生しました。問題をサポートに報告の上、しばらく経ってからやり直してください。", {
            position: "top-right",
            autoClose: 5000,
          });
          // ローディング終了
          setIsLoadingFirstFetch(false);
          return;
        }
        // =============== invoiceItem配列が2つでも4つ以上でも共通の値
        // 1. 現在に対する請求期間(日数)
        // 2. 現在に対する残り日数
        // 3. 現在に対するプランの1アカウントあたりの料金
        // 4. 新プラン(新数量)の月額費用

        // 1. 「請求期間（日数）」をローカルStateに格納
        const period = getPeriodInDays(upcomingInvoiceData.period_start, upcomingInvoiceData.period_end);
        setCurrentPeriodState(period);
        // 2. 「残り日数」をローカルStateに格納
        // const remaining = getDaysFromTimestampToTimestamp(
        //   upcomingInvoiceData.period_start,
        //   upcomingInvoiceData.period_end
        // ).period;
        const remaining = getRemainingDaysFromNowPeriodEndHourToTimestamp(upcomingInvoiceData.period_end).remainingDays;
        setRemainingDaysState(remaining);
        // setRemainingDaysState(remaining === 0 ? 1 : remaining);
        // 3. プランの月額費用/1アカウントあたり
        const monthlyFeePerAccount = getPrice(userProfileState.subscription_plan);
        // 4. 新プランの月額費用
        const newMonthlyFee = monthlyFeePerAccount * totalAccountQuantity;

        // 🔹🔹初めてのアップグレードルート
        // 配列のinvoiceアイテムが2つのみなら今まで通りの実装
        if (invoiceItemList.length === 2) {
          if (!isFirstUpgrade) setIsFirstUpgrade(true); // 今月初めてのアップグレード
          // 算出しておける項目 アップグレード1回目(変更アイテムは1セットのみ)
          // 3-0. 旧プランの未使用分総額の1日あたりの金額(1セットなのでそのまま総額として計算)
          // 3. 旧プランの未使用分日割り料金の総額
          // 4-0. 新プランの残り使用分総額の1日あたりの金額(1セットなのでそのまま総額として計算)
          // 4. 新プランの残り使用分日割り料金の総額
          // 5. 追加費用の総額
          // 6. 次回支払い総額

          // 3-0. 新数量プランの1日あたりの料金をローカルStateに格納 月額料金 / １ヶ月の日数
          const newDailyRate = newMonthlyFee / period;
          const newDailyRateWithThreeDecimalPoints = Math.round(newDailyRate * 1000) / 1000; // 小数点第3位までを取得
          setNewDailyRateWithThreeDecimalPoints(newDailyRateWithThreeDecimalPoints);
          // 3. 新プラン残り期間までの利用分の金額
          const newUsage = newDailyRateWithThreeDecimalPoints * remaining;
          const newUsageWithThreeDecimalPoints = Math.round(newUsage * 1000) / 1000;
          setNewUsageAmountForRemainingPeriodWithThreeDecimalPoints(newUsageWithThreeDecimalPoints);
          // 4-0. 旧プラン（現在のプラン）の1日あたりの料金をローカルStateに格納 月額料金 / １ヶ月の日数
          const oldMonthlyFee = monthlyFeePerAccount * memberAccountsDataArray.length; // 旧プランの月額費用
          const oldDailyRate = oldMonthlyFee / period;
          const oldDailyRateWithThreeDecimalPoints = Math.round(oldDailyRate * 1000) / 1000; // 小数点第3位までを取得
          setOldDailyRateWithThreeDecimalPoints(oldDailyRateWithThreeDecimalPoints);
          // 4. 旧プランの残り期間までの未使用分の金額
          const oldUnused = oldDailyRateWithThreeDecimalPoints * remaining;
          const oldUnusedWithThreeDecimalPoints = Math.round(oldUnused * 1000) / 1000;
          setOldUnusedAmountForRemainingPeriodWithThreeDecimalPoints(oldUnusedWithThreeDecimalPoints);
          // 5. 追加費用をローカルStateに格納
          const extraCharge = Math.round(newUsageWithThreeDecimalPoints) - Math.round(oldUnusedWithThreeDecimalPoints);
          setAdditionalCostState(extraCharge);
          // 6. 次回お支払い額（追加費用上乗せ済み） 🌟ダウングレードスケジュールが存在するなら次回請求日の初回支払いでは、プラン料金はビジネスプランの価格になるため、newMonthlyFeeを置き換える(残り使用分と未使用分は今月のプランに適用されるため置き換えは無しでOK)
          const downgradePlanScheduleArray = !!stripeSchedulesDataArray
            ? stripeSchedulesDataArray.filter(
                (schedule) =>
                  schedule.schedule_status === "active" &&
                  schedule.type === "change_plan" &&
                  schedule.current_plan === "premium_plan" &&
                  schedule.scheduled_plan === "business_plan"
              )
            : []; // プランダウングレードリクエストのスケジュール
          const totalPaymentDue =
            downgradePlanScheduleArray.length >= 1
              ? 980 * totalAccountQuantity + extraCharge
              : newMonthlyFee + extraCharge;
          setNextInvoiceAmountState(totalPaymentDue);
          console.log("未使用、残り使用1セットのみのinvoiceitemルート");
        }
        // 🔹🔹「アカウントを増やす」が２回目以上の場合 全ての未使用分と全ての使用分を合算して追加費用を算出する
        else if (invoiceItemList.length > 2) {
          if (isFirstUpgrade) setIsFirstUpgrade(false); // 今月2回目以上のアップグレード
          // 「今までの未使用分のインボイスアイテム配列invoiceItemList」を前半、後半で分割する
          // ======================= 配列分割テスト =======================
          // const middleIndex = invoiceItemList.length / 2; // 真ん中のインデックスを把握
          // const firstHalfInvoiceItemList = invoiceItemList.slice(0, middleIndex);
          // const secondHalfInvoiceItemList = invoiceItemList.slice(middleIndex);
          const firstHalfInvoiceItemList = invoiceItemList
            .filter((item) => item.description?.startsWith("Unused"))
            .sort((a, b) => (a.quantity ?? 0) - (b.quantity ?? 0));
          const secondHalfInvoiceItemList = invoiceItemList
            .filter((item) => item.description?.startsWith("Remaining"))
            .sort((a, b) => (a.quantity ?? 0) - (b.quantity ?? 0));
          // ======================= 配列分割テスト =======================
          // 前半部分を未使用分ローカルStateに格納する
          setUnusedInvoiceItemArray(firstHalfInvoiceItemList);
          // 後半部分を未使用分ローカルStateに格納する
          setRemainingUsageInvoiceItemArray(secondHalfInvoiceItemList);

          // 算出しておける項目 アップグレード２回目(変更アイテムも２セット以上)
          // 3. 旧プランの未使用分日割り料金の総額
          // 4. 新プランの残り使用分日割り料金の総額
          // 5. 追加費用の総額
          // 6. 次回支払い総額

          // 3. 旧プランの未使用分日割り料金の総額
          const sumOldUnused = firstHalfInvoiceItemList.reduce(
            (accumulator, currentValue) => accumulator + currentValue.amount,
            0
          );
          setOldUnusedAmountForRemainingPeriodWithThreeDecimalPoints(sumOldUnused);
          // 4. 新プランの残り使用分日割り料金の総額
          const sumNewUsage = secondHalfInvoiceItemList.reduce(
            (accumulator, currentValue) => accumulator + currentValue.amount,
            0
          );
          setNewUsageAmountForRemainingPeriodWithThreeDecimalPoints(sumNewUsage);
          // 5. 追加費用の総額 追加費用 = 残り使用分 + (-未使用分)
          const sumExtraCharge = sumNewUsage + sumOldUnused;
          setAdditionalCostState(sumExtraCharge);
          // 6. 次回支払い総額
          // 🌟ダウングレードスケジュールが存在するなら次回請求日の初回支払いでは、プラン料金はビジネスプランの価格になるため、newMonthlyFeeを置き換える(残り使用分と未使用分は今月のプランに適用されるため置き換えは無しでOK)
          const downgradePlanScheduleArray = !!stripeSchedulesDataArray
            ? stripeSchedulesDataArray.filter(
                (schedule) =>
                  schedule.schedule_status === "active" &&
                  schedule.type === "change_plan" &&
                  schedule.current_plan === "premium_plan" &&
                  schedule.scheduled_plan === "business_plan"
              )
            : []; // プランダウングレードリクエストのスケジュール
          // setDowngradePlanSchedule(downgradePlanScheduleArray.length >= 1 ? downgradePlanScheduleArray[0] : null);
          const totalPaymentDue =
            downgradePlanScheduleArray.length >= 1
              ? 980 * totalAccountQuantity + sumExtraCharge
              : newMonthlyFee + sumExtraCharge;
          // const totalPaymentDue = newMonthlyFee + sumExtraCharge;
          setNextInvoiceAmountState(totalPaymentDue);

          console.log(
            "未使用、残り使用2セット以上のinvoiceitemルート(つまり数量変更２回目以上)",
            "未使用分の配列",
            firstHalfInvoiceItemList,
            "残り使用分の配列",
            secondHalfInvoiceItemList,
            "未使用分の総額",
            sumOldUnused,
            "残り使用分の総額",
            sumNewUsage,
            "追加費用総額",
            sumExtraCharge,
            "次回支払い総額",
            totalPaymentDue,
            "downgradePlanScheduleArray",
            downgradePlanScheduleArray
          );

          // 今日が終了日でないなら、
          // 最後のinvoiceItemをlastInvoiceItemStateに格納する
          const currentDate = new Date("2025-11-20"); // テストクロック
          const periodEndDate = new Date(upcomingInvoiceData.period_end * 1000);
          if (
            currentDate.getFullYear() === periodEndDate.getFullYear() &&
            currentDate.getMonth() === periodEndDate.getMonth() &&
            currentDate.getDate() === periodEndDate.getDate()
          ) {
            console.log(
              "getUpcomingInvoice関数 今日が終了日と同じ日付のためlastInvoiceItemStateには最後のインボイスデータを格納せずにリターン(今日が終了日の場合、invoice_itemは生成されないため選択中のアカウント数での日割り計算は発生せず、最後のアイテムが選択中のインボイスデータではなく、今までの変更分のインボイスデータの日割り計算分となるため)"
            );
            // ローディング終了
            setIsLoadingFirstFetch(false);
            return;
          } else {
            const _oldDailyRateWithThreeDecimalPoints = -(
              Math.round(((monthlyFeePerAccount * memberAccountsDataArray.length) / period) * 1000) / 1000
            );
            const _newDailyRateWithThreeDecimalPoints = Math.round((newMonthlyFee / period) * 1000) / 1000;
            const _oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints =
              Math.round(_oldDailyRateWithThreeDecimalPoints * remaining * 1000) / 1000;
            const _newUsageAmountForRemainingPeriodWithThreeDecimalPoints =
              Math.round(_newDailyRateWithThreeDecimalPoints * remaining * 1000) / 1000;
            const lastItem: LastInvoiceItem = {
              periodStart: secondHalfInvoiceItemList[secondHalfInvoiceItemList.length - 1].period.start,
              periodEnd: secondHalfInvoiceItemList[secondHalfInvoiceItemList.length - 1].period.end,
              planFeePerAccount: secondHalfInvoiceItemList[secondHalfInvoiceItemList.length - 1].plan?.amount ?? null,
              oldQuantity: firstHalfInvoiceItemList[secondHalfInvoiceItemList.length - 1].quantity,
              newQuantity: secondHalfInvoiceItemList[secondHalfInvoiceItemList.length - 1].quantity,
              oldPlanAmount: firstHalfInvoiceItemList[secondHalfInvoiceItemList.length - 1].amount,
              // newPlanAmount: downgradePlanSchedule
              //   ? getPrice("business_plan") * totalAccountQuantity
              //   : getPrice(userProfileState.subscription_plan) * totalAccountQuantity,
              newPlanAmount: getPrice(userProfileState.subscription_plan) * totalAccountQuantity,
              // newPlanAmount: secondHalfInvoiceItemList[secondHalfInvoiceItemList.length - 1].amount,
              oldDailyRateWithThreeDecimalPoints: _oldDailyRateWithThreeDecimalPoints,
              newDailyRateWithThreeDecimalPoints: _newDailyRateWithThreeDecimalPoints,
              oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints:
                _oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints,
              newUsageAmountForRemainingPeriodWithThreeDecimalPoints:
                _newUsageAmountForRemainingPeriodWithThreeDecimalPoints,
            };
            setLastInvoiceItemState(lastItem);
            setIsLoadingFirstFetch(false); // ローディング終了
          }
        }
        setIsLoadingFirstFetch(false); // ローディング終了
      }

      // ======================== StripeのInvoiceをローカルStateに格納 ========================
    } catch (e: any) {
      console.error(`getUpcomingInvoice関数実行エラー: `, e);
      toast.error(`請求金額の取得に失敗しました...`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setIsLoadingFirstFetch(false);
    }
  }, [userProfileState, totalAccountQuantity, sessionState, memberAccountsDataArray]);
  // ===================== ✅次回支払い情報のUpcomingInvoiceを取得する関数 =====================

  // ===================== 🌟初回マウントuseEffect Invoiceをstripeから取得 =====================
  // 初回マウント時と「新たに増やすアカウント数」を変更して「料金計算」を押した時にStripeから比例配分のプレビューを取得
  useEffect(() => {
    if (!userProfileState) {
      setIsLoadingFirstFetch(false);
      return alert("🚨useEffect(初回マウントInvoice取得)エラー：ユーザー情報が見つかりませんでした");
    }
    if (!memberAccountsDataArray) {
      setIsLoadingFirstFetch(false);
      return alert("🚨useEffect(初回マウントInvoice取得)エラー：アカウント情報が見つかりませんでした");
    }

    // invoiceのline_itemの最後の新プランのインボイスアイテム
    const _nextInvoiceLastItem = !!nextInvoice ? nextInvoice.lines.data[nextInvoice.lines.data.length - 1] : null;

    // nextInvoiceが存在しないルート => 初回マウント時にInvoiceをフェッチ
    if (!nextInvoice) {
      console.log("🔥初回マウントuseEffect実行1 nextInvoice無しのためgetUpcomingInvoice関数を実行🔥");
      getUpcomingInvoice();
      return;
    }
    // nextInvoiceが存在するルート => アップデート直後に再度開いた時にnextInvoiceのquantityよりメンバーアカウントの数が多くなるので、再度フェッチする
    else if (
      !!nextInvoice &&
      _nextInvoiceLastItem !== null &&
      _nextInvoiceLastItem.quantity !== null &&
      _nextInvoiceLastItem.quantity < memberAccountsDataArray.length + 1
      // nextInvoice.lines.data[nextInvoice.lines.data.length - 1].quantity !== memberAccountsDataArray.length + 1
    ) {
      console.log(
        "🔥初回マウントuseEffect実行1 nextInvoiceの最新のquantityよりメンバーアカウントの数が多い場合には数量アップデート直後のため再度最新のinvoiceをフェッチ🔥",
        "nextInvoice.lines.data[nextInvoice.lines.data.length - 1].quantity",
        nextInvoice.lines.data[nextInvoice.lines.data.length - 1].quantity,
        "memberAccountsDataArray.length + 1",
        memberAccountsDataArray.length + 1
        // "memberAccountsDataArray.length + 1",
        // memberAccountsDataArray.length + 1,
      );
      getUpcomingInvoice();
      return;
    }
    // nextInvoiceが存在するルート => nextInvoiceを取得後に請求期間が更新された場合に再度フェッチする 現在の月とnextInvoiceの月が一致していて、nextInvoiceの月とcurrent_period_endの月が異なる場合は再度フェッチする
    else if (
      !!nextInvoice &&
      !!userProfileState.current_period_end &&
      new Date("2025-11-20").getMonth() === new Date(nextInvoice.period_end * 1000).getMonth() &&
      new Date(nextInvoice.period_end * 1000).getMonth() !== new Date(userProfileState.current_period_end).getMonth()
    ) {
      // テストクロック
      console.log(
        "🔥🔥初回マウントuseEffect実行1 nextInvoiceの終了月とcurrent_period_endが異なり、現在の日付とnextInvoiceの日付が同じ場合は、請求期間が過ぎてcurrent_period_endが更新されているため、再度フェッチする"
      );
      console.log("現在", format(new Date("2025-11-20"), "yyyy年MM月dd日 HH:mm:ss"));
      console.log("nextInvoiceの終了日", format(new Date(nextInvoice.period_end * 1000), "yyyy年MM月dd日 HH:mm:ss"));
      console.log(
        "userProfileStateの終了日",
        format(new Date(userProfileState.current_period_end), "yyyy年MM月dd日 HH:mm:ss")
      );
      getUpcomingInvoice();
      return;
    }
    // nextInvoiceが存在するルート => モーダルを開いた日付と同じか否かでリターン、フェッチを分岐させる
    else if (!!nextInvoice && !!nextInvoice.subscription_proration_date) {
      // モーダル開いた日付を取得(時刻情報なし) 💡テストクロックモードのため2025-11-20で現在の日付を作成
      const currentDateObj = new Date("2025-11-20"); // テストクロック
      const year = currentDateObj.getFullYear();
      const month = currentDateObj.getMonth();
      const day = currentDateObj.getDate();
      const currentDateOnly = new Date(year, month, day); // 現在の日付の時刻情報をリセット
      // nextInvoiceの比例配分の日付を取得(時刻情報なし)
      const nextInvoiceCreatedInMillisecond =
        nextInvoice.subscription_proration_date.toString().length === 10
          ? nextInvoice.subscription_proration_date * 1000
          : nextInvoice.subscription_proration_date;
      const nextInvoiceDateObj = new Date(nextInvoiceCreatedInMillisecond);
      const nextInvoiceYear = nextInvoiceDateObj.getFullYear();
      const nextInvoiceMonth = nextInvoiceDateObj.getMonth();
      const nextInvoiceDay = nextInvoiceDateObj.getDate();
      const nextInvoiceDateOnly = new Date(nextInvoiceYear, nextInvoiceMonth, nextInvoiceDay); // nextInvoiceの日付の時刻情報をリセット

      // nextInvoiceに格納したInvoiceオブジェクトの比例配分の日付がこのモーダルを開いた日付と異なる
      // => 再度フェッチしてInvoiceを取得
      if (currentDateOnly.getTime() !== nextInvoiceDateOnly.getTime()) {
        console.log(
          "🔥初回マウントuseEffect実行1 nextInvoiceが存在するルート nextInvoice有りだが現在の日付と作成日が異なるためgetUpcomingInvoice関数を実行🔥",
          "💡今日の日付",
          format(currentDateOnly, "yyyy/MM/dd HH:mm:ss"),
          "比例配分日",
          format(nextInvoiceDateOnly, "yyyy/MM/dd HH:mm:ss"),
          "今日の日付",
          currentDateOnly.getTime(),
          "比例配分日",
          nextInvoiceDateOnly.getTime(),
          "currentDateObj",
          currentDateObj,
          "nextInvoiceDateObj",
          nextInvoiceDateObj,
          "nextInvoice",
          nextInvoice
        );
        getUpcomingInvoice();
        return;
      }
      // nextInvoiceはすでに存在している。かつ、nextInvoiceの比例配分の日付がこのモーダルを開いた日付と同じ
      // => 現在保持しているnextInvoiceの各項目をローカルStateに格納してそのままリターン
      else {
        // 変更後のサブスクリプション新プランを取り除いたinvoiceitemのみの配列を取得
        const invoiceItemList = nextInvoice.lines.data.filter(
          (item: Stripe.InvoiceLineItem) => item.type === "invoiceitem"
        );
        // invoiceItemListが偶数であること(未使用、残り使用が1セットずつになっていること)をチェックする
        if (invoiceItemList.length % 2 === 1) {
          console.log("❌list.dataのインボイスアイテムが奇数のためエラー: リターンしてモーダルを閉じる");
          toast.error("問題が発生しました。問題をサポートに報告の上、しばらく経ってからやり直してください。", {
            position: "top-right",
            autoClose: 5000,
          });
          setIsOpenChangeAccountCountsModal(null);
          if (isLoadingFirstFetch) setIsLoadingFirstFetch(false);
          return;
        }
        // ======================== InvoiceをローカルStateに格納 ========================

        // =============== invoiceItem配列が2つでも4つ以上でも共通の値
        // 1. 現在に対する請求期間(日数)
        // 2. 現在に対する残り日数
        // 3. 現在に対するプランの1アカウントあたりの料金
        // 4. 新プラン(新数量)の月額費用

        // 1. 「請求期間（日数）」をローカルStateに格納
        const period = getPeriodInDays(nextInvoice.period_start, nextInvoice.period_end);
        setCurrentPeriodState(period);
        // 2. 「残り日数」をローカルStateに格納
        const remaining = getRemainingDaysFromNowPeriodEndHourToTimestamp(nextInvoice.period_end).remainingDays;
        // setRemainingDaysState(remaining);
        setRemainingDaysState(remaining);
        // setRemainingDaysState(remaining === 0 ? 1 : remaining);
        // 3. プランの月額費用/1アカウントあたり
        const monthlyFeePerAccount = getPrice(userProfileState.subscription_plan);
        // 4. 新プランの月額費用
        const newMonthlyFee = monthlyFeePerAccount * totalAccountQuantity;

        // 🔹初めてのアップグレード
        if (invoiceItemList.length === 2) {
          if (!isFirstUpgrade) setIsFirstUpgrade(true); // 今月初めてのアップグレード
          // 算出しておける項目 アップグレード1回目(変更アイテムは1セットのみ)
          // 3-0. 旧プランの未使用分総額の1日あたりの金額(1セットなのでそのまま総額として計算)
          // 3. 旧プランの未使用分日割り料金の総額
          // 4-0. 新プランの残り使用分総額の1日あたりの金額(1セットなのでそのまま総額として計算)
          // 4. 新プランの残り使用分日割り料金の総額
          // 5. 追加費用の総額
          // 6. 次回支払い総額

          // 3-0. 旧プラン（現在のプラン）の1日あたりの料金をローカルStateに格納 月額料金 / １ヶ月の日数
          const oldMonthlyFee = monthlyFeePerAccount * memberAccountsDataArray.length; // 旧プランの月額費用
          const oldDailyRate = oldMonthlyFee / period;
          const oldDailyRateWithThreeDecimalPoints = Math.round(oldDailyRate * 1000) / 1000; // 小数点第3位までを取得
          setOldDailyRateWithThreeDecimalPoints(oldDailyRateWithThreeDecimalPoints);
          // 3. 旧プランの残り期間までの未使用分の金額
          const oldUnused = oldDailyRateWithThreeDecimalPoints * remaining;
          const oldUnusedWithThreeDecimalPoints = Math.round(oldUnused * 1000) / 1000;
          setOldUnusedAmountForRemainingPeriodWithThreeDecimalPoints(oldUnusedWithThreeDecimalPoints);
          // 4-0. 新数量プランの1日あたりの料金をローカルStateに格納 月額料金 / １ヶ月の日数
          const newDailyRate = newMonthlyFee / period;
          const newDailyRateWithThreeDecimalPoints = Math.round(newDailyRate * 1000) / 1000; // 小数点第3位までを取得
          setNewDailyRateWithThreeDecimalPoints(newDailyRateWithThreeDecimalPoints);
          // 4. 新プラン残り期間までの利用分の金額
          const newUsage = newDailyRateWithThreeDecimalPoints * remaining;
          const newUsageWithThreeDecimalPoints = Math.round(newUsage * 1000) / 1000;
          setNewUsageAmountForRemainingPeriodWithThreeDecimalPoints(newUsageWithThreeDecimalPoints);
          // 5. 追加費用をローカルStateに格納
          const extraCharge = Math.round(newUsageWithThreeDecimalPoints) - Math.round(oldUnusedWithThreeDecimalPoints);
          setAdditionalCostState(extraCharge);
          // 6. 次回お支払い額（追加費用上乗せ済み）
          // 🌟ダウングレードスケジュールが存在するなら次回請求日の初回支払いでは、プラン料金はビジネスプランの価格になるため、newMonthlyFeeを置き換える(残り使用分と未使用分は今月のプランに適用されるため置き換えは無しでOK)
          const downgradePlanScheduleArray = !!stripeSchedulesDataArray
            ? stripeSchedulesDataArray.filter(
                (schedule) =>
                  schedule.schedule_status === "active" &&
                  schedule.type === "change_plan" &&
                  schedule.current_plan === "premium_plan" &&
                  schedule.scheduled_plan === "business_plan"
              )
            : []; // プランダウングレードリクエストのスケジュール
          // setDowngradePlanSchedule(downgradePlanScheduleArray.length >= 1 ? downgradePlanScheduleArray[0] : null);
          const totalPaymentDue =
            downgradePlanScheduleArray.length >= 1
              ? 980 * totalAccountQuantity + extraCharge
              : newMonthlyFee + extraCharge;
          // const totalPaymentDue = newMonthlyFee + extraCharge;
          setNextInvoiceAmountState(totalPaymentDue);
          // ======================== InvoiceをローカルStateに格納 ========================
          setIsLoadingFirstFetch(false); // ローディング終了
          console.log(
            "🔥初回マウントuseEffect実行1 nextInvoiceが存在するルート 既にnextInvoice取得済みで、かつnextInvoiceの比例配分の日付がこのモーダルを開いた日付と同じため 現在Zustandで保持しているInvoiceをローカルStateに格納してリターン モーダル開いた今日の日付",
            format(currentDateOnly, "yyyy/MM/dd HH:mm:ss"),
            currentDateOnly.getTime(),
            "nextInvoiceの比例配分日",
            format(nextInvoiceDateOnly, "yyyy/MM/dd HH:mm:ss"),
            nextInvoiceDateOnly.getTime()
          );
          return;
        }
        // 🔹２回目以上のアップグレード
        else if (invoiceItemList.length > 2) {
          if (isFirstUpgrade) setIsFirstUpgrade(false); // 今月初めてのアップグレード
          // ======================= 配列分割テスト =======================
          // 「今までの未使用分のインボイスアイテム配列invoiceItemList」を前半、後半で分割する
          // const middleIndex = invoiceItemList.length / 2; // 真ん中のインデックスを把握
          // const firstHalfInvoiceItemList = invoiceItemList.slice(0, middleIndex);
          // const secondHalfInvoiceItemList = invoiceItemList.slice(middleIndex);
          const firstHalfInvoiceItemList = invoiceItemList
            .filter((item) => item.description?.startsWith("Unused"))
            .sort((a, b) => (a.quantity ?? 0) - (b.quantity ?? 0));
          const secondHalfInvoiceItemList = invoiceItemList
            .filter((item) => item.description?.startsWith("Remaining"))
            .sort((a, b) => (a.quantity ?? 0) - (b.quantity ?? 0));
          // ======================= 配列分割テスト =======================
          // 前半部分を未使用分ローカルStateに格納する
          setUnusedInvoiceItemArray(firstHalfInvoiceItemList);
          // 後半部分を未使用分ローカルStateに格納する
          setRemainingUsageInvoiceItemArray(secondHalfInvoiceItemList);

          // 算出しておける項目 アップグレード２回目(変更アイテムも２セット以上)
          // 3. 旧プランの未使用分日割り料金の総額
          // 4. 新プランの残り使用分日割り料金の総額
          // 5. 追加費用の総額
          // 6. 次回支払い総額

          // 3. 旧プランの未使用分日割り料金の総額
          const sumOldUnused = firstHalfInvoiceItemList.reduce(
            (accumulator, currentValue) => accumulator + currentValue.amount,
            0
          );
          setOldUnusedAmountForRemainingPeriodWithThreeDecimalPoints(sumOldUnused);
          // 4. 新プランの残り使用分日割り料金の総額
          const sumNewUsage = secondHalfInvoiceItemList.reduce(
            (accumulator, currentValue) => accumulator + currentValue.amount,
            0
          );
          setNewUsageAmountForRemainingPeriodWithThreeDecimalPoints(sumNewUsage);
          // 5. 追加費用の総額 追加費用 = 残り使用分 + (-未使用分)
          const sumExtraCharge = sumNewUsage + sumOldUnused;
          setAdditionalCostState(sumExtraCharge);
          // 6. 次回支払い総額
          // 🌟ダウングレードスケジュールが存在するなら次回請求日の初回支払いでは、プラン料金はビジネスプランの価格になるため、newMonthlyFeeを置き換える(残り使用分と未使用分は今月のプランに適用されるため置き換えは無しでOK)
          const downgradePlanScheduleArray = !!stripeSchedulesDataArray
            ? stripeSchedulesDataArray.filter(
                (schedule) =>
                  schedule.schedule_status === "active" &&
                  schedule.type === "change_plan" &&
                  schedule.current_plan === "premium_plan" &&
                  schedule.scheduled_plan === "business_plan"
              )
            : []; // プランダウングレードリクエストのスケジュール
          // setDowngradePlanSchedule(downgradePlanScheduleArray.length >= 1 ? downgradePlanScheduleArray[0] : null);
          const totalPaymentDue =
            downgradePlanScheduleArray.length >= 1
              ? 980 * totalAccountQuantity + sumExtraCharge
              : newMonthlyFee + sumExtraCharge;
          // const totalPaymentDue = newMonthlyFee + sumExtraCharge;
          setNextInvoiceAmountState(totalPaymentDue);

          console.log(
            "🔥初回マウントuseEffect実行 nextInvoiceが存在するルート 未使用、残り使用2セット以上のinvoiceitemルート(つまり数量変更２回目以上)",
            "未使用分の配列",
            firstHalfInvoiceItemList,
            "残り使用分の配列",
            secondHalfInvoiceItemList,
            "未使用分の総額",
            sumOldUnused,
            "残り使用分の総額",
            sumNewUsage,
            "追加費用総額",
            sumExtraCharge,
            "次回支払い総額",
            totalPaymentDue,
            "downgradePlanScheduleArray",
            downgradePlanScheduleArray
          );
          // 今日が終了日でないなら、
          // 最後のinvoiceItemをlastInvoiceItemStateに格納する
          const currentDate = new Date("2025-11-20"); // テストクロック
          const periodEndDate = new Date(nextInvoice.period_end * 1000);
          if (
            currentDate.getFullYear() === periodEndDate.getFullYear() &&
            currentDate.getMonth() === periodEndDate.getMonth() &&
            currentDate.getDate() === periodEndDate.getDate()
          ) {
            console.log(
              "🔥初回マウントuseEffect nextInvoiceが存在するルート 2回目アップグレードルート 今日が終了日と同じ日付のためlastInvoiceItemStateには最後のインボイスデータを格納せずにリターン(今日が終了日の場合、invoice_itemは生成されないため選択中のアカウント数での日割り計算は発生せず、最後のアイテムが選択中のインボイスデータではなく、今までの変更分のインボイスデータの日割り計算分となるため)"
            );

            if (isLoadingFirstFetch) setIsLoadingFirstFetch(false);
            return;
          } else {
            console.log(
              "🔥初回マウントuseEffect nextInvoiceが存在するルート 2回目アップグレードルート 今日と期間終了日の日付は異なるため、lastInvoiceItemStateには最後のインボイスデータを格納してリターン"
            );
            // 最後のinvoiceItemをstateに格納する (invoiceItemの最後の要素が)
            const _oldDailyRateWithThreeDecimalPoints = -(
              Math.round(((monthlyFeePerAccount * memberAccountsDataArray.length) / period) * 1000) / 1000
            );
            const _newDailyRateWithThreeDecimalPoints = Math.round((newMonthlyFee / period) * 1000) / 1000;
            const _oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints =
              Math.round(_oldDailyRateWithThreeDecimalPoints * remaining * 1000) / 1000;
            const _newUsageAmountForRemainingPeriodWithThreeDecimalPoints =
              Math.round(_newDailyRateWithThreeDecimalPoints * remaining * 1000) / 1000;
            const lastItem: LastInvoiceItem = {
              periodStart: secondHalfInvoiceItemList[secondHalfInvoiceItemList.length - 1].period.start,
              periodEnd: secondHalfInvoiceItemList[secondHalfInvoiceItemList.length - 1].period.end,
              planFeePerAccount: secondHalfInvoiceItemList[secondHalfInvoiceItemList.length - 1].plan?.amount ?? null,
              oldQuantity: firstHalfInvoiceItemList[secondHalfInvoiceItemList.length - 1].quantity,
              newQuantity: secondHalfInvoiceItemList[secondHalfInvoiceItemList.length - 1].quantity,
              oldPlanAmount: firstHalfInvoiceItemList[secondHalfInvoiceItemList.length - 1].amount,
              // newPlanAmount: downgradePlanSchedule
              //   ? getPrice('business_plan') * totalAccountQuantity
              //   : getPrice(userProfileState.subscription_plan) * totalAccountQuantity,
              newPlanAmount: getPrice(userProfileState.subscription_plan) * totalAccountQuantity,
              // newPlanAmount: secondHalfInvoiceItemList[secondHalfInvoiceItemList.length - 1].amount,
              oldDailyRateWithThreeDecimalPoints: _oldDailyRateWithThreeDecimalPoints,
              newDailyRateWithThreeDecimalPoints: _newDailyRateWithThreeDecimalPoints,
              oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints:
                _oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints,
              newUsageAmountForRemainingPeriodWithThreeDecimalPoints:
                _newUsageAmountForRemainingPeriodWithThreeDecimalPoints,
            };
            setLastInvoiceItemState(lastItem);

            if (isLoadingFirstFetch) setIsLoadingFirstFetch(false);
          }
        }
      }
    }
  }, []);
  // ===================== ✅初回マウントuseEffect Invoiceをstripeから取得 =====================

  // ============================== 🌟「料金チェック」関数 ==============================
  const handleCheckInvoiceStripeAndLocalCalculate = async () => {
    if (!userProfileState) {
      console.error("エラー：ユーザー情報が見つかりませんでした。");
      return { checkResult: false, prorationDateTimeStamp: null };
    }
    if (!memberAccountsDataArray) {
      console.error(`エラー：アカウント情報が見つかりませんでした`);
      return { checkResult: false, prorationDateTimeStamp: null };
    }

    // ローディング開始
    // setIsLoadingCalculation(true);

    try {
      const payload = {
        stripeCustomerId: userProfileState.stripe_customer_id,
        stripeSubscriptionId: userProfileState.stripe_subscription_id,
        changeQuantity: totalAccountQuantity, // 数量変更後の合計アカウント数
        changePlanName: null, // プラン変更ではないので、nullをセット
        currentQuantity: null, // プラン変更用なのでnullをセット
      };
      console.log("料金チェック1 retrieve-upcoming-invoiceエンドポイントへリクエスト payload", payload);
      const {
        data: { data: upcomingInvoiceData, error: upcomingInvoiceError },
      } = await axios.post(`/api/subscription/retrieve-upcoming-invoice`, payload, {
        headers: {
          Authorization: `Bearer ${sessionState.access_token}`,
        },
      });
      if (upcomingInvoiceError) {
        console.log("❌料金チェック2 /retrieve-upcoming-invoiceへのaxios.postエラー", upcomingInvoiceError);
        throw new Error(upcomingInvoiceError);
      }
      console.log("🌟料金チェック2 次回インボイスデータの取得成功", upcomingInvoiceData);
      setStripeRetrieveInvoice(upcomingInvoiceData); // stripe用ローカル State
      // setNextInvoice(upcomingInvoiceData); // 初回フェッチ時のローカルState 最新状態に更新

      // Stripeから取得したInvoiceの金額とローカルで計算した金額が一致しているかチェック

      // 🔹本日の支払いルート 比例配分日が終了日と一緒 listオブジェクトのdata配列にはsubscriptionタイプのline_itemオブジェクトのみ(新プランのアイテムのみ)
      if ((upcomingInvoiceData as Stripe.UpcomingInvoice).lines.data.length === 1) {
        const subscriptionLineItem = (upcomingInvoiceData as Stripe.UpcomingInvoice).lines.data.filter(
          (item) => item.type === "subscription"
        )[0]; // [0]のインデックスで配列ではなくオブジェクトで取得
        if (todaysPayment === (upcomingInvoiceData as Stripe.UpcomingInvoice).amount_due) {
          console.log(
            "🌟料金チェック3 ✅チェック関数 次回請求額がローカルと一致 テスト成功✅",
            "支払額 stripeのnextInvoice subscriptionLineItem.amount(本日の支払いのため新プランの価格のまま追加費用なし)",
            subscriptionLineItem.amount,
            "ローカルtodaysPayment",
            todaysPayment,
            "upcomingInvoiceData",
            upcomingInvoiceData
          );
          // return true;
          return {
            checkResult: true,
            prorationDateTimeStamp: (upcomingInvoiceData as Stripe.UpcomingInvoice).subscription_proration_date,
          };
        } else {
          console.log(
            "🌟料金チェック3 ❌チェック関数 次回請求額がローカルと不一致 テスト失敗❌",
            "支払額 stripeのnextInvoice subscriptionLineItem.amount(本日の支払いのため新プランの価格のまま追加費用なし)",
            subscriptionLineItem.amount,
            "ローカルnextInvoiceAmountState",
            nextInvoiceAmountState
          );
          // return false;
          return { checkResult: false, prorationDateTimeStamp: null };
        }
      }

      if (!currentPeriodState) {
        console.error(`エラー：請求期間データを取得できませんでした`);
        return { checkResult: false, prorationDateTimeStamp: null };
      }
      if (remainingDaysState === null) {
        console.error(`エラー：残り期間データを取得できませんでした`);
        return { checkResult: false, prorationDateTimeStamp: null };
      }

      // 🔹listオブジェクトのdataの要素1セット以上ルート(本日の支払いではなく通常の次回請求ルート)
      const invoiceItemList = (upcomingInvoiceData as Stripe.UpcomingInvoice).lines.data.filter(
        (item) => item.type === "invoiceitem"
      );
      console.log(
        "InvoiceLineItem[]から未使用、残り使用のみのinvoiceitemタイプのみを取得 invoiceItemList",
        invoiceItemList
      );
      // invoiceItemListが偶数の要素かチェック(偶数なら正確に未使用分と残り使用分を分けられているかチェック)
      if (invoiceItemList.length % 2 === 1) {
        // 🔹🔹invoiceItemListが偶数の要素かチェック => 奇数のためこのままリターンしてモーダルを閉じる
        console.error("❌invoiceitemタイプの配列の要素が偶数でないためリターン");
        setIsOpenChangeAccountCountsModal(null);
        toast.error("問題が発生しました。問題をサポートに報告の上、しばらく経ってからやり直してください。", {
          position: "top-right",
          autoClose: 5000,
        });
        // return false;
        return { checkResult: false, prorationDateTimeStamp: null };
      }
      // =============== invoiceItem配列が2つでも4つ以上でも共通の値
      // 1. 現在に対する請求期間(日数)
      // 2. 現在に対する残り日数
      // 3. 現在に対するプランの1アカウントあたりの料金
      // 4. 新プラン(新数量)の月額費用

      // 1. 「請求期間（日数）」をローカルStateに格納
      // const period = getPeriodInDays(upcomingInvoiceData.period_start, upcomingInvoiceData.period_end);
      // setCurrentPeriodState(period);
      // 2. 「残り日数」をローカルStateに格納
      // const remaining = getRemainingDaysFromNowPeriodEndHourToTimestamp(upcomingInvoiceData.period_end).remainingDays;
      // setRemainingDaysState(remaining);
      // 3. 現在のプランの月額費用/1アカウントあたり
      const monthlyFeePerAccount = getPrice(userProfileState.subscription_plan);
      // 4. 新数量の月額費用
      const newMonthlyFee = monthlyFeePerAccount * totalAccountQuantity;

      // 🔹🔹数量アップグレード１回目ルート
      // 配列のinvoiceアイテムが2つのみなら今まで通りの実装
      if (invoiceItemList.length === 2) {
        // 算出しておける項目 アップグレード1回目(変更アイテムは1セットのみ)
        // 3-0. 旧プランの未使用分総額の1日あたりの金額(1セットなのでそのまま総額として計算)
        // 3. 旧プランの未使用分日割り料金の総額
        // 4-0. 新プランの残り使用分総額の1日あたりの金額(1セットなのでそのまま総額として計算)
        // 4. 新プランの残り使用分日割り料金の総額
        // 5. 追加費用の総額
        // 6. 次回支払い総額

        // 新数量の残り使用分の1日当たりの料金
        const tempNewDailyRate = newMonthlyFee / currentPeriodState;
        // const tempNewDailyRate =
        //   (upcomingInvoiceData as Stripe.UpcomingInvoice)?.lines?.data[2]?.amount / currentPeriodState;
        const tempNewDailyRateWithThreeDecimalPoints = Math.round(tempNewDailyRate * 1000) / 1000;
        setStripeNewDailyRateWithThreeDecimalPoints(tempNewDailyRateWithThreeDecimalPoints);
        // 新プランの残り使用分の料金
        const tempNewUsageAmount = tempNewDailyRateWithThreeDecimalPoints * remainingDaysState;
        const tempNewUsageAmountWithThreeDecimalPoints = Math.round(tempNewUsageAmount * 1000) / 1000;
        setStripeNewUsageAmountForRemainingPeriodWithThreeDecimalPoints(tempNewUsageAmountWithThreeDecimalPoints);
        // 旧数量未使用分の1日あたりの料金
        const _oldPlanAmount = getPrice(userProfileState.subscription_plan) * memberAccountsDataArray.length;
        const tempOldDailyRate = _oldPlanAmount / currentPeriodState;
        const tempOldDailyRateWithThreeDecimalPoints = Math.round(tempOldDailyRate * 1000) / 1000;
        setStripeOldDailyRateWithThreeDecimalPoints(tempOldDailyRateWithThreeDecimalPoints);
        // 旧プランの残り未使用分の料金
        const tempOldUnusedAmount = tempOldDailyRateWithThreeDecimalPoints * remainingDaysState;
        const tempOldUnusedAmountWithThreeDecimalPoints = Math.round(tempOldUnusedAmount * 1000) / 1000;
        setStripeOldUnusedAmountForRemainingPeriodWithThreeDecimalPoints(tempOldUnusedAmountWithThreeDecimalPoints);
        // 追加費用
        const tempAdditionalCost =
          Math.round(tempNewUsageAmountWithThreeDecimalPoints) - Math.round(tempOldUnusedAmountWithThreeDecimalPoints);
        setStripeAdditionalCostState(tempAdditionalCost);
        // 次回の支払額
        // 🌟ダウングレードスケジュールが存在するなら次回請求日の初回支払いでは、プラン料金はビジネスプランの価格になるため、newMonthlyFeeを置き換える(残り使用分と未使用分は今月のプランに適用されるため置き換えは無しでOK)
        const downgradePlanScheduleArray = !!stripeSchedulesDataArray
          ? stripeSchedulesDataArray.filter(
              (schedule) =>
                schedule.schedule_status === "active" &&
                schedule.type === "change_plan" &&
                schedule.current_plan === "premium_plan" &&
                schedule.scheduled_plan === "business_plan"
            )
          : []; // プランダウングレードリクエストのスケジュール
        const tempNextInvoiceAmount =
          downgradePlanScheduleArray.length >= 1
            ? 980 * totalAccountQuantity + tempAdditionalCost
            : (upcomingInvoiceData as Stripe.UpcomingInvoice)?.lines?.data[
                (upcomingInvoiceData as Stripe.UpcomingInvoice)?.lines?.data.length - 1
              ]?.amount + tempAdditionalCost;
        // const tempNextInvoiceAmount =
        //   (upcomingInvoiceData as Stripe.UpcomingInvoice)?.lines?.data[
        //     (upcomingInvoiceData as Stripe.UpcomingInvoice)?.lines?.data.length - 1
        //   ]?.amount + tempAdditionalCost;
        setStripeNextInvoiceAmountState((upcomingInvoiceData as Stripe.UpcomingInvoice).amount_due);
        // setStripeNextInvoiceAmountState(tempNextInvoiceAmount);

        if (
          !!(upcomingInvoiceData as Stripe.UpcomingInvoice).amount_due &&
          (upcomingInvoiceData as Stripe.UpcomingInvoice).amount_due === nextInvoiceAmountState
        ) {
          console.log(
            "🌟料金チェック3 ✅チェック関数 次回請求額がローカルと一致 テスト成功✅",
            "次回支払い総額(upcomingInvoiceData as Stripe.UpcomingInvoice).amount_due",
            (upcomingInvoiceData as Stripe.UpcomingInvoice).amount_due,
            "次回支払い総額stripe tempNextInvoiceAmount",
            tempNextInvoiceAmount,
            "次回支払い総額ローカル",
            nextInvoiceAmountState,
            "追加費用stripe",
            tempAdditionalCost,
            "追加費用ローカル",
            additionalCostState
          );
          // ローディング開始
          // setIsLoadingCalculation(false);
          // テストの結果を合格(true)で返す
          // return true;
          return {
            checkResult: true,
            prorationDateTimeStamp: (upcomingInvoiceData as Stripe.UpcomingInvoice).subscription_proration_date,
          };
        } else {
          console.log(
            "🌟料金チェック3 ❌チェック関数 次回請求額がローカルと一致せず テスト失敗❌",
            "次回支払い総額(upcomingInvoiceData as Stripe.UpcomingInvoice).amount_due",
            (upcomingInvoiceData as Stripe.UpcomingInvoice).amount_due,
            "次回支払い総額stripe",
            tempNextInvoiceAmount,
            "次回支払い総額ローカル",
            nextInvoiceAmountState,
            "追加費用stripe",
            tempAdditionalCost,
            "追加費用ローカル",
            additionalCostState
          );
          // ローディング開始
          // setIsLoadingCalculation(false);
          // テストの結果を不合格(false)で返す
          // return false;
          return { checkResult: false, prorationDateTimeStamp: null };
        }
      }
      // 🔹🔹数量アップグレード2回目以上ルート(InvoiceItemの未使用、残り使用が2セット以上)
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
        const firstHalfInvoiceItemList = invoiceItemList
          .filter((item) => item.description?.startsWith("Unused"))
          .sort((a, b) => (a.quantity ?? 0) - (b.quantity ?? 0));
        const secondHalfInvoiceItemList = invoiceItemList
          .filter((item) => item.description?.startsWith("Remaining"))
          .sort((a, b) => (a.quantity ?? 0) - (b.quantity ?? 0));
        // ======================= 配列分割テスト =======================
        // 前半部分を未使用分ローカルStateに格納する
        setStripeUnusedInvoiceItemArray(firstHalfInvoiceItemList);
        // 後半部分を未使用分ローカルStateに格納する
        setStripeRemainingUsageInvoiceItemArray(secondHalfInvoiceItemList);

        // 算出しておける項目 アップグレード２回目(変更アイテムも２セット以上)
        // 3. 旧プランの未使用分日割り料金の総額
        // 4. 新プランの残り使用分日割り料金の総額
        // 5. 追加費用の総額
        // 6. 次回支払い総額

        // 3. 旧プランの未使用分日割り料金の総額
        const sumOldUnused = firstHalfInvoiceItemList.reduce(
          (accumulator, currentValue) => accumulator + currentValue.amount,
          0
        );
        setStripeOldUnusedAmountForRemainingPeriodWithThreeDecimalPoints(sumOldUnused);
        // 4. 新プランの残り使用分日割り料金の総額
        const sumNewUsage = secondHalfInvoiceItemList.reduce(
          (accumulator, currentValue) => accumulator + currentValue.amount,
          0
        );
        setStripeNewUsageAmountForRemainingPeriodWithThreeDecimalPoints(sumNewUsage);
        // 5. 追加費用の総額 追加費用 = 残り使用分 + (-未使用分)
        const sumExtraCharge = sumNewUsage + sumOldUnused;
        setStripeAdditionalCostState(sumExtraCharge);
        // 6. 次回支払い総額
        // 🌟ダウングレードスケジュールが存在するなら次回請求日の初回支払いでは、プラン料金はビジネスプランの価格になるため、newMonthlyFeeを置き換える(残り使用分と未使用分は今月のプランに適用されるため置き換えは無しでOK)
        const downgradePlanScheduleArray = !!stripeSchedulesDataArray
          ? stripeSchedulesDataArray.filter(
              (schedule) =>
                schedule.schedule_status === "active" &&
                schedule.type === "change_plan" &&
                schedule.current_plan === "premium_plan" &&
                schedule.scheduled_plan === "business_plan"
            )
          : []; // プランダウングレードリクエストのスケジュール
        const totalPaymentDue =
          downgradePlanScheduleArray.length >= 1
            ? 980 * totalAccountQuantity + sumExtraCharge
            : newMonthlyFee + sumExtraCharge;
        // const totalPaymentDue = newMonthlyFee + sumExtraCharge;
        // setStripeNextInvoiceAmountState(totalPaymentDue);
        setStripeNextInvoiceAmountState((upcomingInvoiceData as Stripe.UpcomingInvoice).amount_due);

        if (
          !!(upcomingInvoiceData as Stripe.UpcomingInvoice).amount_due &&
          (upcomingInvoiceData as Stripe.UpcomingInvoice).amount_due === nextInvoiceAmountState
        ) {
          console.log(
            "✅料金チェック3 未使用、残り使用2セット以上のinvoiceitemルート(つまり数量変更２回目以上) ✅チェック関数 次回請求額がローカルと一致 テスト成功✅",
            "次回支払い総額(upcomingInvoiceData as Stripe.UpcomingInvoice).amount_due",
            (upcomingInvoiceData as Stripe.UpcomingInvoice).amount_due,
            "次回支払い総額stripe totalPaymentDue",
            totalPaymentDue,
            "次回支払い総額ローカル",
            nextInvoiceAmountState,
            "今までの追加費用の総額stripe",
            sumExtraCharge,
            "今までの追加費用の総額ローカル",
            additionalCostState,
            "未使用分の配列",
            firstHalfInvoiceItemList,
            "残り使用分の配列",
            secondHalfInvoiceItemList,
            "未使用分の総額",
            sumOldUnused,
            "残り使用分の総額",
            sumNewUsage
          );
          // ローディング開始
          // setIsLoadingCalculation(false);
          // テストの結果を合格(true)で返す
          // return true;
          return {
            checkResult: true,
            prorationDateTimeStamp: (upcomingInvoiceData as Stripe.UpcomingInvoice).subscription_proration_date,
          };
        } else {
          console.log(
            "❌料金チェック3 未使用、残り使用2セット以上のinvoiceitemルート(つまり数量変更２回目以上) ❌チェック関数 次回請求額がローカルと一致せず テスト失敗❌",
            "次回支払い総額(upcomingInvoiceData as Stripe.UpcomingInvoice).amount_due",
            (upcomingInvoiceData as Stripe.UpcomingInvoice).amount_due,
            "次回支払い総額stripe totalPaymentDue",
            totalPaymentDue,
            "次回支払い総額ローカル",
            nextInvoiceAmountState,
            "今までの追加費用の総額stripe",
            sumExtraCharge,
            "今までの追加費用の総額ローカル",
            additionalCostState,
            "未使用分の配列",
            firstHalfInvoiceItemList,
            "残り使用分の配列",
            secondHalfInvoiceItemList,
            "未使用分の総額",
            sumOldUnused,
            "残り使用分の総額",
            sumNewUsage
          );
          // ローディング開始
          // setIsLoadingCalculation(false);
          // テストの結果を不合格(false)で返す
          // return false;
          return { checkResult: false, prorationDateTimeStamp: null };
        }
      }
    } catch (e: any) {
      console.error(
        `❌料金チェック2 handleCheckInvoiceStripeAndLocalCalculate関数実行エラー: APIルートのエンドポイント/api/subscription/retrieve-upcoming-invoiceへのリクエストが完了できず`,
        e
      );
      // ローディング開始
      // setIsLoadingCalculation(false);
      // テストの結果を不合格(false)で返す
      // return false;
      return { checkResult: false, prorationDateTimeStamp: null };
    }
  };
  // ============================== ✅「料金チェック」関数 ==============================
  // ================== ✅StripeのInvoiceを取得してローカル計算が合っているか確認する関数 ==================

  // ====================== 🌟アカウント数変更の度に新料金を計算してローカルStateに格納 =====================
  useEffect(() => {
    // ローカルStateがnullならリターン
    if (!userProfileState)
      return console.log(
        "🚨useEffect(アカウント数変更の度に新料金を再計算してローカルStateに格納) ユーザーデータが無しのためリターン"
      );
    if (!userProfileState.current_period_end)
      return console.log(
        "🚨useEffect(アカウント数変更の度に新料金を再計算してローカルStateに格納) ユーザーデータが無しのためリターン"
      );
    if (!memberAccountsDataArray)
      return console.log(
        "🚨useEffect(アカウント数変更の度に新料金を再計算してローカルStateに格納) メンバーアカウンtpデータが無しのためリターン"
      );

    // ============= 共通
    // プラン１アカウント月額費用
    const monthlyFeePerAccount = getPrice(userProfileState.subscription_plan); // プランの月額費用/ID
    // 新プラン料金
    const _newPlanAmount = monthlyFeePerAccount * totalAccountQuantity;

    // 今日が「本日のお支払い」ルート
    if (!isFreeTodaysPayment) {
      // 🌟ダウングレードスケジュールが存在するなら次回請求日の初回支払いでは、プラン料金はビジネスプランの価格になるため、newMonthlyFeeを置き換える(残り使用分と未使用分は今月のプランに適用されるため置き換えは無しでOK)
      const downgradePlanScheduleArray = !!stripeSchedulesDataArray
        ? stripeSchedulesDataArray.filter(
            (schedule) =>
              schedule.schedule_status === "active" &&
              schedule.type === "change_plan" &&
              schedule.current_plan === "premium_plan" &&
              schedule.scheduled_plan === "business_plan"
          )
        : []; // プランダウングレードリクエストのスケジュール
      const _nextMonthlyFeeNewPlan =
        downgradePlanScheduleArray.length >= 1 ? 980 * totalAccountQuantity : _newPlanAmount;
      setTodaysPayment(_nextMonthlyFeeNewPlan); // ダウングレードスケジュール有りの場合にはビジネスプランの価格で合計を格納する
      // setTodaysPayment(_newPlanAmount);
      console.log("今日が本日のお支払いのためstateに新プラン料金を格納", _newPlanAmount);
      // return console.log("今日が本日のお支払いのためstateに新プラン料金を格納してリターン", _newPlanAmount);
    }

    if (!nextInvoiceAmountState)
      return console.log(
        "🚨useEffect(アカウント数変更の度に新料金を再計算してローカルStateに格納) ローカルStripeインボイスデータがローカルに無しのためリターン"
      );
    if (!currentPeriodState)
      return console.log(
        "🚨useEffect(アカウント数変更の度に新料金を再計算してローカルStateに格納) currentPeriodStateがローカルに無しのためリターン"
      );
    if (remainingDaysState === null)
      return console.log(
        "🚨useEffect(アカウント数変更の度に新料金を再計算してローカルStateに格納) remainingDaysStateがローカルに無しのためリターン"
      );

    // 🔹初めてのアップグレードルート
    if (isFirstUpgrade) {
      // 算出しておける項目 アップグレード1回目(変更アイテムは1セットのみ)
      // 3-0. 旧プランの未使用分総額の1日あたりの金額(1セットなのでそのまま総額として計算)
      // 3. 旧プランの未使用分日割り料金の総額
      // 4-0. 新プランの残り使用分総額の1日あたりの金額(1セットなのでそのまま総額として計算)
      // 4. 新プランの残り使用分日割り料金の総額
      // 5. 追加費用の総額
      // 6. 次回支払い総額

      // 3-0. 旧プランの1日あたりの料金
      const oldMonthlyFee = monthlyFeePerAccount * memberAccountsDataArray.length; // 旧プランの月額費用
      const _oldDailyRateThreeDecimalPoints = Math.round((oldMonthlyFee / currentPeriodState) * 1000) / 1000;
      setOldDailyRateWithThreeDecimalPoints(_oldDailyRateThreeDecimalPoints);
      // 3. 旧プランの残り期間までの未使用分の金額
      const _oldUnused = _oldDailyRateThreeDecimalPoints * remainingDaysState;
      const _oldUnusedThreeDecimalPoints = Math.round(_oldUnused * 1000) / 1000;
      setOldUnusedAmountForRemainingPeriodWithThreeDecimalPoints(_oldUnusedThreeDecimalPoints);
      // 4-0. 新プランの1日当たりの料金
      const _newDailyRateThreeDecimalPoints = Math.round((_newPlanAmount / currentPeriodState) * 1000) / 1000;
      setNewDailyRateWithThreeDecimalPoints(_newDailyRateThreeDecimalPoints);
      // 4. 新プランの残り期間までの使用量の金額
      const _newUsage = _newDailyRateThreeDecimalPoints * remainingDaysState;
      const _newUsageThreeDecimalPoints = Math.round(_newUsage * 1000) / 1000;
      setNewUsageAmountForRemainingPeriodWithThreeDecimalPoints(_newUsageThreeDecimalPoints);
      // 5. 追加費用をローカルStateに格納
      const _additionalCost = Math.round(_newUsageThreeDecimalPoints) - Math.round(_oldUnusedThreeDecimalPoints);
      setAdditionalCostState(_additionalCost);
      // 6. 次回お支払い額（追加費用上乗せ済み）
      // 🌟ダウングレードスケジュールが存在するなら次回請求日の初回支払いでは、プラン料金はビジネスプランの価格になるため、newMonthlyFeeを置き換える(残り使用分と未使用分は今月のプランに適用されるため置き換えは無しでOK)
      const downgradePlanScheduleArray = !!stripeSchedulesDataArray
        ? stripeSchedulesDataArray.filter(
            (schedule) =>
              schedule.schedule_status === "active" &&
              schedule.type === "change_plan" &&
              schedule.current_plan === "premium_plan" &&
              schedule.scheduled_plan === "business_plan"
          )
        : []; // プランダウングレードリクエストのスケジュール
      const _nextInvoiceAmount =
        downgradePlanScheduleArray.length >= 1
          ? getPrice("business_plan") * totalAccountQuantity + _additionalCost
          : _newPlanAmount + _additionalCost;
      // const _nextInvoiceAmount = _newPlanAmount + _additionalCost;
      setNextInvoiceAmountState(_nextInvoiceAmount);
      console.log(
        "🔥useEffect(新アカウント数変更に伴う請求データをローカルで算出)初めてのアップグレード🔥",
        "新たなアカウント数",
        totalAccountQuantity,
        "新数量の月額料金_newPlanAmount",
        _newPlanAmount,
        "次回支払額",
        _nextInvoiceAmount,
        "追加費用",
        _additionalCost,
        "新プラン1日当たり料金",
        _newDailyRateThreeDecimalPoints,
        "新プラン残り使用分の金額",
        _newUsageThreeDecimalPoints,
        "旧プラン1日当たり料金",
        _oldDailyRateThreeDecimalPoints,
        "旧プラン残り使用分の金額",
        _oldUnusedThreeDecimalPoints,
        "downgradePlanScheduleArray",
        downgradePlanScheduleArray
      );
    }
    // 🔹２回目以上のアップグレードルート
    else if (!isFirstUpgrade) {
      // 算出しておける項目 アップグレード２回目(変更アイテムも２セット以上)
      // 3. 旧プランの未使用分日割り料金の総額
      // 4-1. 新プランの残り使用分配列の最後を取り除き、残った今までのinvoiceItemのamountを合計して今までの残り使用分の総額を算出
      // 4-2. 今ユーザーが選択している数量新プランの1日当たりの金額を算出(最後の要素となる)
      // 4-3. 1日あたりの金額と残り日数を掛けて新プランの残り使用分の総額を算出
      // 4-4. 今までの残り使用分の合計と新たなプランの残り使用分の金額を合算して総額を算出
      // 5. 追加費用の総額を算出
      // 6. 次回支払い総額

      // 3. 旧プランの未使用分日割り料金の総額
      const sumOldUnused = unusedInvoiceItemArray.reduce(
        (accumulator, currentValue) => accumulator + currentValue.amount,
        0
      );
      setOldUnusedAmountForRemainingPeriodWithThreeDecimalPoints(sumOldUnused);

      let _newRemainingUsageSum;
      let previousRemainingUsageAmountSum;
      let _newDailyRateThreeDecimalPoints: number | null = null;
      let _newUsageThreeDecimalPoints: number | null = null;
      // 最終日ルート(今日が終了日のため今回の選択したアカウント数の未使用、残り使用のinvoice_itemがlines.dataに含まれないルート)
      if (isLastDay) {
        // 残り使用分の金額を合算する
        const sumRemainingUsageAmount = remainingUsageInvoiceItemArray.reduce(
          (accumulator, currentValue) => accumulator + currentValue.amount,
          0
        );
        // 残り使用分の合計をそのままセット
        _newRemainingUsageSum = sumRemainingUsageAmount;
        _newUsageThreeDecimalPoints = sumRemainingUsageAmount;
        _newDailyRateThreeDecimalPoints = Math.round((_newPlanAmount / currentPeriodState) * 1000) / 1000;
      }
      // 通常日ルート(今日が終了日でない、今回の選択分が使用分、未使用分invoice_itemに含まれているルート)
      else {
        // 4-1. 新プランの残り使用分配列の最後を取り除き、残った今までのinvoiceItemのamountを合計して今までの残り使用分の総額を算出
        const copiedRemainingUsageOmitLastInvoiceItemArray = [...remainingUsageInvoiceItemArray];
        // 新たな数量が変更されたため、今ユーザーが選択している数量と違う新プランのアイテムは取り除く(最後のアイテム)
        const lastRemainingUsageItem = copiedRemainingUsageOmitLastInvoiceItemArray.pop();
        // 残った今までアップグレードしてきた残り使用分の金額を合算する
        previousRemainingUsageAmountSum = copiedRemainingUsageOmitLastInvoiceItemArray.reduce(
          (accumulator, currentValue) => accumulator + currentValue.amount,
          0
        );
        // 4-2. 今ユーザーが選択している数量新プランの1日当たりの金額を算出(最後の要素となる)
        _newDailyRateThreeDecimalPoints = Math.round((_newPlanAmount / currentPeriodState) * 1000) / 1000;
        // 4-3. 1日あたりの金額と残り日数を掛けて今ユーザーが選択している数量新プランの残り使用分の総額を算出
        // 今ユーザーが選択している数量新プランの残り期間までの使用量の金額
        const _newUsage = _newDailyRateThreeDecimalPoints * remainingDaysState;
        _newUsageThreeDecimalPoints = Math.round(_newUsage * 1000) / 1000;
        // 4-4. 今までの残り使用分の合計と新たなプランの残り使用分の金額を合算して総額を算出
        _newRemainingUsageSum = previousRemainingUsageAmountSum + Math.round(_newUsageThreeDecimalPoints);
      }

      setNewUsageAmountForRemainingPeriodWithThreeDecimalPoints(_newRemainingUsageSum);

      // 5. 追加費用の総額 追加費用 = 残り使用分 + (-未使用分)
      const sumExtraCharge = _newRemainingUsageSum + sumOldUnused;
      setAdditionalCostState(sumExtraCharge);
      // 6. 次回支払い総額
      // 🌟ダウングレードスケジュールが存在するなら次回請求日の初回支払いでは、プラン料金はビジネスプランの価格になるため、newMonthlyFeeを置き換える(残り使用分と未使用分は今月のプランに適用されるため置き換えは無しでOK)
      const downgradePlanScheduleArray = !!stripeSchedulesDataArray
        ? stripeSchedulesDataArray.filter(
            (schedule) =>
              schedule.schedule_status === "active" &&
              schedule.type === "change_plan" &&
              schedule.current_plan === "premium_plan" &&
              schedule.scheduled_plan === "business_plan"
          )
        : []; // プランダウングレードリクエストのスケジュール
      const totalPaymentDue =
        downgradePlanScheduleArray.length >= 1
          ? getPrice("business_plan") * totalAccountQuantity + sumExtraCharge
          : _newPlanAmount + sumExtraCharge;
      // const totalPaymentDue = _newPlanAmount + sumExtraCharge;
      setNextInvoiceAmountState(totalPaymentDue);

      console.log(
        "🔥useEffect(新アカウント数変更に伴う請求データをローカルで算出)２回目以上のアップグレード🔥",
        "新たなアカウント数",
        totalAccountQuantity,
        "新数量の月額料金_newPlanAmount",
        _newPlanAmount,
        "旧プラン残り使用分の金額総額",
        sumOldUnused,
        "新プラン側の今までの残り使用分の総額",
        previousRemainingUsageAmountSum,
        "新プラン側の今回ユーザーが選択している新たな数量の残り使用分",
        _newUsageThreeDecimalPoints,
        "新プラン残り使用分の金額総額(今までと今回両方の残り使用分)",
        _newRemainingUsageSum,
        "今までの追加費用総額sumExtraCharge",
        sumExtraCharge,
        "次回支払総額totalPaymentDue",
        totalPaymentDue,
        "downgradePlanScheduleArray",
        downgradePlanScheduleArray,
        "downgradePlanScheduleArray.length >= 1",
        downgradePlanScheduleArray.length >= 1,
        "getPrice('business_plan') * totalAccountQuantity + sumExtraCharge",
        getPrice("business_plan") * totalAccountQuantity + sumExtraCharge,
        "980 * totalAccountQuantity",
        getPrice("business_plan") * totalAccountQuantity
      );

      // 今日が終了日でないなら、
      // 最後のinvoiceItemをlastInvoiceItemStateに格納する
      const currentDate = new Date("2025-11-20"); // テストクロック
      const periodEndDate = new Date(userProfileState.current_period_end);
      if (
        currentDate.getFullYear() === periodEndDate.getFullYear() &&
        currentDate.getMonth() === periodEndDate.getMonth() &&
        currentDate.getDate() === periodEndDate.getDate()
      ) {
        console.log(
          "useEffect（アカウント数変更の度に新料金を計算してローカルStateに格納ルート) 今日が終了日と同じ日付のためlastInvoiceItemStateには最後のインボイスデータを格納せずにリターン(今日が終了日の場合、invoice_itemは生成されないため選択中のアカウント数での日割り計算は発生せず、最後のアイテムが選択中のインボイスデータではなく、今までの変更分のインボイスデータの日割り計算分となるため)"
        );
        return;
      } else {
        // 最後のinvoiceItemをstateに格納する (invoiceItemの最後の要素が)
        setLastInvoiceItemState((prevState) => ({
          ...prevState,
          newQuantity: totalAccountQuantity,
          newPlanAmount: _newPlanAmount,
          // newPlanAmount:
          //   downgradePlanScheduleArray.length >= 1 ? getPrice("business_plan") * totalAccountQuantity : _newPlanAmount,
          newDailyRateWithThreeDecimalPoints: _newDailyRateThreeDecimalPoints,
          newUsageAmountForRemainingPeriodWithThreeDecimalPoints: _newUsageThreeDecimalPoints,
        }));
      }
    }
  }, [accountQuantity]);
  // ====================== ✅アカウント数変更の度に料金を計算 ======================

  // ====================== 🌟「本日のお支払い」があるか否か ======================
  // 初回マウント時のみユーザーが契約中のサブスクリプションの次回支払い期限が今日か否かと、
  // 今日の場合は支払い時刻を過ぎているかどうか確認して過ぎていなければ0円でなくする
  useEffect(() => {
    if (!userProfileState || !userProfileState.current_period_end)
      return console.log(
        "🚨useEffect(「本日のお支払い」期間終了日が今日か否かチェック) userProfileState無しのためリターン"
      );

    // まずは、現在の日付と時刻、およびcurrent_period_endの日付と時刻をUTCで取得します。
    const currentDate = new Date("2025-11-20"); // テストクロック用の日付
    const currentPeriodEndDate = new Date(userProfileState.current_period_end); // これはサンプルの値で、実際にはsupabaseから取得した値を使用します。

    const isSameDay =
      currentDate.getFullYear() === currentPeriodEndDate.getFullYear() &&
      currentDate.getMonth() === currentPeriodEndDate.getMonth() &&
      currentDate.getDate() === currentPeriodEndDate.getDate();

    if (isSameDay) {
      console.log(
        "🔥useEffect実行2(「本日のお支払い」があるか否か)🔥 今日が期間終了日で一致しているが、現在の時刻がcurrent_period_endの時刻を過ぎていないため isFreeTodayPaymentをfalse, todayPaymentを 現在の契約プラン * (現在の契約アカウント数 + 新たに契約するアカウント数)に更新 isSameDay",
        isSameDay,
        "currentPeriodEndDate",
        format(currentPeriodEndDate, "yyyy/MM/dd HH:mm:ss"),
        "現在の日付",
        format(currentDate, "yyyy/MM/dd HH:mm:ss")
      );
      // 今日が期間終了日と同じ日のため最終日Stateをtrueに
      setIsLastDay(true);
      // 現在の時刻がcurrent_period_endの時刻を過ぎていない場合の処理
      setIsFreeTodaysPayment(false);
      // 現在の契約プラン * (現在の契約アカウント数 + 新たに契約するアカウント数) = 本日のお支払い
      const paymentValue = getPrice(userProfileState.subscription_plan) * totalAccountQuantity;
      setTodaysPayment(paymentValue);
      // // 今日がcurrent_period_endの日付と一致している場合、次に時間の比較を行います。
      // if (
      //   currentDate.getHours() >= currentPeriodEndDate.getHours() &&
      //   currentDate.getMinutes() >= currentPeriodEndDate.getMinutes() &&
      //   currentDate.getSeconds() >= currentPeriodEndDate.getSeconds()
      // ) {
      //   console.log(
      //     "🔥useEffect実行2(「本日のお支払い」があるか否か)🔥 現在の時刻がcurrent_period_endの時刻を過ぎているため isFreeTodayPaymentをtrue, todayPaymentを0に更新 isSameDay",
      //     isSameDay
      //   );
      //   // 現在の時刻がcurrent_period_endの時刻を過ぎている場合の処理
      //   // 例: 「本日のお支払い」の値を0円にする
      //   setIsFreeTodaysPayment(true);
      //   setTodaysPayment(0);
      // } else {

      // }
    } else {
      console.log(
        "🔥useEffect実行(「本日のお支払い」があるか否か)🔥 今日がcurrent_period_endの日付と一致していないため isFreeTodayPaymentをtrue, todayPaymentを0に更新 isSameDay",
        isSameDay,
        "currentPeriodEndDate",
        format(currentPeriodEndDate, "yyyy/MM/dd HH:mm:ss"),
        "現在の日付",
        format(currentDate, "yyyy/MM/dd HH:mm:ss")
      );
      // 今日がcurrent_period_endの日付と一致していない場合の処理
      setIsFreeTodaysPayment(true);
      setTodaysPayment(0);
    }
  }, [userProfileState]);
  // ====================== ✅「本日のお支払い」があるか否か ======================

  // =========================== 🌟新たな数量をStripeに送信してUPDATE ===========================
  const handleChangeQuantity = async (_prorationDateTimestamp: number) => {
    console.log(
      "変更の確定クリック プランと増やす数量、合計",
      userProfileState?.subscription_plan,
      accountQuantity,
      totalAccountQuantity
    );
    if (!userProfileState) return console.error("エラー：ユーザー情報が確認できませんでした");
    if (!sessionState) return console.error("エラー：セッション情報が確認できませんでした");
    if (!accountQuantity) return console.error("エラー：追加するアカウント数が選択されていません");
    if (!nextInvoice) return console.error("エラー：インボイスデータが見つかりません");
    if (!_prorationDateTimestamp) return console.error("エラー：インボイスデータの比例配分日が見つかりません");
    if (_prorationDateTimestamp !== nextInvoice.subscription_proration_date)
      return console.error(
        "エラー：インボイスデータ取得時から日付が変更されました。再度やり直してください。",
        _prorationDateTimestamp,
        nextInvoice.subscription_proration_date
      );
    // setLoading(true);

    try {
      // プレビューで取得した比例配分日と同じsubscription_proration_dateをpayloadに載せる
      const payload = {
        stripeCustomerId: userProfileState.subscription_stripe_customer_id,
        newQuantity: totalAccountQuantity,
        changeType: "increase",
        companyId: userProfileState.company_id,
        subscriptionId: userProfileState.subscription_id,
        userProfileId: userProfileState.id,
        alreadyHaveSchedule: false, // decrease用の削除リクエストスケジュールがあるかどうか用
        deleteAccountRequestSchedule: null, // decrease用の削除リクエストスケジュール用
        // prorationDateForIncrease: nextInvoice.subscription_proration_date, // increase用比例配分UNIXタイムスタンプ
        prorationDateForIncrease: _prorationDateTimestamp, // increase用比例配分UNIXタイムスタンプ
      };
      console.log(`🌟/change-quantityへaxiosで数量アップグレード実行 合計個数 渡したpayload`, payload);
      const {
        data: { subscriptionItem, error: axiosStripeError },
      } = await axios.post(`/api/subscription/change-quantity`, payload, {
        headers: {
          Authorization: `Bearer ${sessionState.access_token}`,
        },
      });
      if (axiosStripeError) {
        console.log("❌change-quantityエンドポイントへのaxios.postでエラー", axiosStripeError);
        throw axiosStripeError;
      }
      console.log(`🔥axiosで数量アップグレード実行完了 data`, subscriptionItem);

      const insertSubscribedAccountsPayload = {
        new_account_quantity: accountQuantity, // 新たにアカウントを増やす個数をセット
        new_company_id: userProfileState.company_id,
        new_subscription_id: userProfileState.subscription_id,
      };
      console.log(
        `🌟rpc('insert_subscribed_accounts_all_at_once')実行 契約アカウントを実際にINSERTで作成 payload`,
        insertSubscribedAccountsPayload
      );
      // 新たに増やすアカウント数分、supabaseのsubscribed_accountsテーブルにINSERT
      const { error: insertSubscribedAccountsError } = await supabase.rpc(
        "insert_subscribed_accounts_all_at_once",
        insertSubscribedAccountsPayload
      );
      if (insertSubscribedAccountsError) {
        console.log(
          "❌新たに増やすアカウント数分、supabaseのsubscribed_accountsテーブルにINSERTでエラー",
          insertSubscribedAccountsError
        );
        throw insertSubscribedAccountsError;
      }
      console.log("🔥rpc()成功 supabaseの契約アカウントを指定個数分、新たに作成成功");

      // const promises = [...Array(accountQuantity)].map(() => {
      //   return null;
      // });
      // await Promise.all(promises);
      console.log("✅数量アップグレード 全て完了 キャッシュを更新");

      // キャッシュを最新状態に反映
      //   await queryClient.invalidateQueries({ queryKey: ["change_team_owner_notifications"] });
      //   await queryClient.invalidateQueries({ queryKey: ["my_notifications"] });
      await queryClient.invalidateQueries({ queryKey: ["member_accounts"] });
      await queryClient.invalidateQueries({ queryKey: ["stripe_schedules"] });

      toast.success(`アカウント数の変更が完了しました!`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      // アカウントを増やすモーダルを閉じる
      setIsOpenChangeAccountCountsModal(null);
      console.log("✅Stripe数量変更ステップ全て完了したためモーダルを閉じる");
    } catch (e: any) {
      console.error("handleChangeQuantityエラー", e);
      toast.error(`アカウント数の変更に失敗しました!`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
    // setLoading(false);
  };
  // =========================== ✅新たな数量をStripeに送信してUPDATE ===========================

  // =========================== 🌟ダウングレードスケジュールの次回フェーズの個数を変更(料金チェック前) ===========================
  const updateDowngradeScheduleQuantity = async () => {
    if (!userProfileState) {
      console.error("エラー：ユーザー情報が見つかりませんでした。");
      return { complete: false, error: true };
    }

    try {
      const payload = {
        stripeCustomerId: userProfileState.stripe_customer_id,
        stripeSubscriptionId: userProfileState.stripe_subscription_id,
        newQuantity: totalAccountQuantity, // 数量変更後の合計アカウント数
      };
      console.log(
        "🌟ダウングレードスケジュールが存在するためスケジュールの数量を変更するステップ1 retrieve-upcoming-invoiceエンドポイントへリクエスト payload",
        payload
      );
      const {
        data: { data: updatedScheduleData, error: upcomingInvoiceError },
      } = await axios.post(`/api/subscription/update-schedule-downgrade-plan`, payload, {
        headers: {
          Authorization: `Bearer ${sessionState.access_token}`,
        },
      });
      if (upcomingInvoiceError) {
        console.log(
          "❌ダウングレードスケジュールが存在するためスケジュールの数量を変更するステップ2 /update-schedule-downgrade-planへのaxios.postエラー",
          upcomingInvoiceError
        );
        throw new Error(upcomingInvoiceError);
      }
      console.log(
        "🔥ダウングレードスケジュールが存在するためスケジュールの数量を変更するステップ2 ダウングレードスケジュールの数量変更完了",
        updatedScheduleData,
        "スケジュール各項目 created",
        format(
          new Date((updatedScheduleData as Stripe.SubscriptionSchedule).created * 1000),
          "yyyy年MM月dd日 HH:mm:ss"
        ),
        "current_phase?.start_date",
        format(
          new Date(((updatedScheduleData as Stripe.SubscriptionSchedule).current_phase?.start_date as number) * 1000),
          "yyyy年MM月dd日 HH:mm:ss"
        ),
        "current_phase?.end_date",
        format(
          new Date(((updatedScheduleData as Stripe.SubscriptionSchedule).current_phase?.end_date as number) * 1000),
          "yyyy年MM月dd日 HH:mm:ss"
        ),
        "今月フェーズstart_date",
        format(
          new Date((updatedScheduleData as Stripe.SubscriptionSchedule).phases[0].start_date * 1000),
          "yyyy年MM月dd日 HH:mm:ss"
        ),
        "今月フェーズend_date",
        format(
          new Date((updatedScheduleData as Stripe.SubscriptionSchedule).phases[0].end_date * 1000),
          "yyyy年MM月dd日 HH:mm:ss"
        ),
        "今月フェーズ数量",
        (updatedScheduleData as Stripe.SubscriptionSchedule).phases[0].items[0].quantity,
        "来月フェーズstart_date",
        format(
          new Date((updatedScheduleData as Stripe.SubscriptionSchedule).phases[1].start_date * 1000),
          "yyyy年MM月dd日 HH:mm:ss"
        ),
        "来月フェーズend_date",
        format(
          new Date((updatedScheduleData as Stripe.SubscriptionSchedule).phases[1].end_date * 1000),
          "yyyy年MM月dd日 HH:mm:ss"
        ),
        "来月フェーズ数量",
        (updatedScheduleData as Stripe.SubscriptionSchedule).phases[1].items[0].quantity
      );

      return { complete: true, error: false };
    } catch (e: any) {
      console.error("❌ダウングレードスケジュールの数量変更エラー", e);
      return { complete: false, error: false };
    }
  };
  // =========================== ✅ダウングレードスケジュールの次回フェーズの個数を変更(料金チェック前) ===========================
  // ======================== 🌟ダウングレードスケジュールの次回フェーズの個数をチェック(料金チェック前) ========================
  const getDowngradeSchedule = async () => {
    if (!userProfileState) {
      console.error("エラー：ユーザー情報が見つかりませんでした。");
      return { requiredCheck: false, error: true };
    }

    try {
      const payload = {
        stripeSubscriptionId: userProfileState.stripe_subscription_id,
      };

      const {
        data: { data: downgradeScheduleData, error: downgradeScheduleError },
      } = await axios.post(`/api/subscription/get-schedule-downgrade-plan`, payload, {
        headers: {
          Authorization: `Bearer ${sessionState.access_token}`,
        },
      });
      if (downgradeScheduleError) {
        console.log("❌ダウングレードスケジュール取得エラー", downgradeScheduleError);
        throw new Error(downgradeScheduleError);
      }
      console.log(
        "🌟ダウングレードスケジュール取得完了",
        downgradeScheduleData,
        "スケジュール各項目 created",
        format(
          new Date((downgradeScheduleData as Stripe.SubscriptionSchedule).created * 1000),
          "yyyy年MM月dd日 HH:mm:ss"
        ),
        "current_phase?.start_date",
        format(
          new Date(((downgradeScheduleData as Stripe.SubscriptionSchedule).current_phase?.start_date as number) * 1000),
          "yyyy年MM月dd日 HH:mm:ss"
        ),
        "current_phase?.end_date",
        format(
          new Date(((downgradeScheduleData as Stripe.SubscriptionSchedule).current_phase?.end_date as number) * 1000),
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
        "今月フェーズ数量",
        (downgradeScheduleData as Stripe.SubscriptionSchedule).phases[0].items[0].quantity,
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
        "来月フェーズ数量",
        (downgradeScheduleData as Stripe.SubscriptionSchedule).phases[1].items[0].quantity
      );
      const nextPhaseQuantity = !!(downgradeScheduleData as Stripe.SubscriptionSchedule).phases[1]
        ? (downgradeScheduleData as Stripe.SubscriptionSchedule).phases[1].items[0].quantity
        : null;
      if (!!nextPhaseQuantity && nextPhaseQuantity === totalAccountQuantity) {
        console.log(
          "ダウングレードスケジュールの次回フェーズ数量と今回のアカウント合計一致🙆 nextPhaseQuantity",
          nextPhaseQuantity
        );
        return { requiredCheck: false, error: false };
      } else if (!!nextPhaseQuantity && nextPhaseQuantity !== totalAccountQuantity) {
        console.log(
          "ダウングレードスケジュールの次回フェーズ数量と今回のアカウント合計一致せずチェック必要 nextPhaseQuantity",
          nextPhaseQuantity,
          "totalAccountQuantity",
          totalAccountQuantity
        );
        return { requiredCheck: true, error: false };
      } else {
        throw new Error(`❌ダウングレードスケジュール取得チェック条件式にどれも合わず`);
      }
    } catch (e: any) {
      console.error("❌ダウングレードスケジュール取得チェックエラー", e);
      return { requiredCheck: false, error: true };
    }
  };
  // ======================== ✅ダウングレードスケジュールの次回フェーズの個数をチェック(料金チェック前) ========================

  // ================ 🌟変更の確定をクリック 1. 料金チェック 2. 合格後Stripeに送信 ================
  const handleChangeConfirm = async () => {
    // 流れ
    // 0-1. プランダウングレードスケジュールが存在する場合には、スケジュールを取得してからクライアントサイドで翌月フェーズの数量と今回の新数量の数が一致しているか確認 => 一致していなければ0-2へ 一致していればそのまま1へ
    // 0-2. プランダウングレードスケジュールが存在する場合には、stripeから取得するInvoiceのsubscriptionタイプのinvoiceItemには新たな個数が反映されないため、まずはプランダウングレードスケジュールの次回フェーズのquantityの個数を変更する
    // 1. ローカルで算出した請求額が正式なstripe.invoice.retrieveUpcoming()の料金と一致するかチェック
    // 2. 合格ルート：そのままhandleChangeQuantity()を実行してStripeのsubscription.update()を実行
    // 2. 不合格ルート：最終確認モーダルを表示して正式な請求額をstripe.invoice.retrieveUpcomingで取得したデータに置き換えてユーザーに表示し、「アップデート」か「キャンセル」を押下してもらう

    // ローディング開始
    setLoading(true);

    // プランダウングレードスケジュールが存在するか否かでルートを分岐
    const downgradePlanScheduleArray = !!stripeSchedulesDataArray
      ? stripeSchedulesDataArray.filter(
          (schedule) =>
            schedule.schedule_status === "active" &&
            schedule.type === "change_plan" &&
            schedule.current_plan === "premium_plan" &&
            schedule.scheduled_plan === "business_plan"
        )
      : []; // プランダウングレードリクエストのスケジュール
    // 🔹プランダウングレードスケジュール有りルート
    if (!!downgradePlanScheduleArray && downgradePlanScheduleArray.length >= 1) {
      // let updateScheduleResult = {complete: true, error: false};
      // 0-1. 【ダウングレードスケジュールを取得して数量を確認】
      const checkDowngradeScheduleQuantity = await getDowngradeSchedule();
      if (checkDowngradeScheduleQuantity.error) {
        setLoading(false);
        toast.error(`エラーが発生しました。サポートにご報告の上、しばらく経ってからやり直してください。`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        return;
      }
      // 🔹0-2. 【ダウングレードスケジュールの次回フェーズの個数を変更】
      if (!checkDowngradeScheduleQuantity.error && checkDowngradeScheduleQuantity.requiredCheck) {
        const updateScheduleResult = await updateDowngradeScheduleQuantity();
        if (updateScheduleResult.error || !updateScheduleResult.complete) {
          setLoading(false);
          toast.error(`エラーが発生しました。サポートにご報告の上、しばらく経ってからやり直してください。`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          return;
        }
        if (updateScheduleResult.complete) {
          // 1.【料金チェック】
          // 料金一致ならtrue、不一致かエラーならfalse
          const result = await handleCheckInvoiceStripeAndLocalCalculate();

          // チェック合格 => stripeにそのままUPDATEを実行
          // if (checkResult) {
          if (!!result && result.checkResult && result.prorationDateTimeStamp) {
            await handleChangeQuantity(result.prorationDateTimeStamp);
          }
          // チェック不合格 => retrieveUpcomingの料金をモーダルに表示
          else {
            // モーダル表示のstateをtrue
            setIsOpenLastConfirmationModal(true);
          }
        }
      }
      // 🔹ダウングレードスケジュールの次回フェーズの数量が今回のアカウント合計と一致しているためそのまま料金チェック
      else if (!checkDowngradeScheduleQuantity.error && !checkDowngradeScheduleQuantity.requiredCheck) {
        // 🔹プランダウングレードスケジュール無しルート
        // 1.【料金チェック】
        // 料金一致ならtrue、不一致かエラーならfalse
        const result = await handleCheckInvoiceStripeAndLocalCalculate();

        // チェック合格 => stripeにそのままUPDATEを実行
        // if (checkResult) {
        if (!!result && result.checkResult && result.prorationDateTimeStamp) {
          await handleChangeQuantity(result.prorationDateTimeStamp);
        }
        // チェック不合格 => retrieveUpcomingの料金をモーダルに表示
        else {
          // モーダル表示のstateをtrue
          setIsOpenLastConfirmationModal(true);
        }
      }
    } else {
      // 🔹プランダウングレードスケジュール無しルート
      // 1.【料金チェック】
      // 料金一致ならtrue、不一致かエラーならfalse
      const result = await handleCheckInvoiceStripeAndLocalCalculate();

      // チェック合格 => stripeにそのままUPDATEを実行
      // if (checkResult) {
      if (!!result && result.checkResult && result.prorationDateTimeStamp) {
        await handleChangeQuantity(result.prorationDateTimeStamp);
      }
      // チェック不合格 => retrieveUpcomingの料金をモーダルに表示
      else {
        // モーダル表示のstateをtrue
        setIsOpenLastConfirmationModal(true);
      }
    }
    // ローディング終了
    setLoading(false);
  };
  // ================ ✅変更の確定をクリック 1. 料金チェック 2. 合格後Stripeに送信 ================

  // ================================ ツールチップ ================================
  // const [hoveredNewProration, setHoveredNewProration] = useState(false);
  // const [hoveredOldProration, setHoveredOldProration] = useState(false);
  const hoveredNewProrationRef = useRef<HTMLDivElement | null>(null);
  const hoveredOldProrationRef = useRef<HTMLDivElement | null>(null);
  // ================================ ツールチップ ここまで ================================

  console.log(
    "🌟IncreaseAccountCountsModalコンポーネントレンダリング",

    "現在テストクロックnew Date('2025-11-20')",
    new Date("2025-11-20"),
    format(new Date("2025-11-20"), "yyyy/MM/dd HH:mm:ss"),
    "現在契約中のアカウント個数",
    currentAccountCounts,
    "現在契約中のアカウント個数",
    currentAccountCounts,
    "新たに追加するアカウント数",
    accountQuantity,
    "追加後のアカウント数合計",
    totalAccountQuantity,
    "useQueryメンバーアカウント",
    memberAccountsDataArray,
    "本日のお支払が0かどうかisFreeTodaysPayment",
    isFreeTodaysPayment,
    "本日の支払い額todaysPayment",
    todaysPayment,
    "💡変更後のアカウント合計の次回請求額プレビュー(比例配分あり)ローカルStateのnextInvoice",
    nextInvoice,
    "💡初回アップグレードかどうかisFirstUpgrade",
    isFirstUpgrade,
    "💡stripeSchedulesDataArray",
    stripeSchedulesDataArray,
    "💡stripeSchedulesDataArray.length",
    stripeSchedulesDataArray?.length,
    `===================== ２回目以降のアップグレード: =====================`,
    "💡２回目以降のアップグレード 未使用分のinvoiceItem配列unusedInvoiceItemArray",
    unusedInvoiceItemArray,
    "💡２回目以降のアップグレード 残り使用分のinvoiceItem配列remainingUsageInvoiceItemArray",
    remainingUsageInvoiceItemArray,
    "lastInvoiceItemState",
    lastInvoiceItemState,
    `===================== ローカルState: =====================`,
    "請求期間(日数)State",
    currentPeriodState,
    "プラン期間残り日数State",
    remainingDaysState,
    "新プランの月額料金の1日あたりの料金State",
    newDailyRateWithThreeDecimalPoints,
    "新プランの残り期間までの利用分の金額State",
    newUsageAmountForRemainingPeriodWithThreeDecimalPoints,
    "旧プランの月額料金の1日あたりの料金State",
    oldDailyRateWithThreeDecimalPoints,
    "旧プランの残り期間までの利用分の金額State",
    oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints,
    "追加費用State",
    additionalCostState,
    "次回お支払い額(追加費用上乗せ済み)State",
    nextInvoiceAmountState,
    "===================== Stripeから取得したInvoice: =====================",
    "stripeから取得したInvoice",
    stripeRetrieveInvoice,
    "新プランの月額料金の1日あたりの料金(Stripeから取得)",
    stripeNewDailyRateWithThreeDecimalPoints,
    "新プランの残り期間までの利用分の金額(Stripeから取得)",
    stripeNewUsageAmountForRemainingPeriodWithThreeDecimalPoints,
    "旧プランの月額料金の1日あたりの料金(Stripeから取得)",
    stripeOldDailyRateWithThreeDecimalPoints,
    "旧プランの残り期間までの未使用分の金額(Stripeから取得)",
    stripeOldUnusedAmountForRemainingPeriodWithThreeDecimalPoints,
    "追加費用(Stripeから取得)",
    stripeAdditionalCostState,
    "次回お支払い額(追加費用上乗せ済み)(Stripeから取得)",
    stripeNextInvoiceAmountState,
    "===============================新プランの料金",
    getPrice(userProfileState?.subscription_plan) * totalAccountQuantity,
    "テストクロックの現在",
    format(new Date("2025-11-20"), "yyyy年MM月dd日 HH時mm分ss秒"), // テストクロック
    "比例配分日 nextInvoice?.subscription_proration_date",
    nextInvoice?.subscription_proration_date &&
      format(new Date(nextInvoice?.subscription_proration_date * 1000), "yyyy年MM月dd日 HH時mm分ss秒"),
    nextInvoice?.subscription_proration_date
  );

  if (isLoadingFirstFetch)
    return (
      <>
        <FallbackIncreaseAccountCountsModal />
      </>
    );

  // ====================== 🌟本日のお支払いコンポーネント ======================
  const TodaysPaymentDetailComponent = () => {
    return (
      <div className="border-real fade02 absolute bottom-[100%] left-[50%] z-30 flex min-h-[50px] min-w-[100px] translate-x-[-50%] flex-col rounded-[8px] bg-[var(--color-edit-bg-solid)] px-[20px] py-[20px]">
        <div className="flex w-full items-center pb-[30px]">
          {!!userProfileState && userProfileState.current_period_end && (
            <p>
              本日{format(new Date(userProfileState.current_period_end), "yyyy年MM月dd日 HH時mm分")}
              がお客様のサブスクリプションの次回支払い期限のため、その前にアカウントを増やした場合は下記が本日のお支払額となります。
            </p>
          )}
        </div>
        <div className="item-center flex h-auto w-full space-x-4 truncate pb-[20px]">
          <div className="flex-col-center relative">
            <span className="text-[12px] font-normal">本日のお支払い</span>
            <span>￥{todaysPayment}</span>
            <div className="absolute bottom-[-5px] left-0 h-[2px] w-full bg-[var(--color-bg-brand-f)]" />
          </div>
          <div className="flex-col-center">
            <span>=</span>
          </div>
          <div className="flex-col-center relative">
            <span className="text-[12px] font-normal">現在の契約プラン</span>
            <span>
              {!!stripeSchedulesDataArray && !!stripeSchedulesDataArray.length
                ? getPrice("business_plan")
                : getPrice(userProfileState?.subscription_plan)}
            </span>
            <div className="absolute bottom-[-5px] left-0 h-[2px] w-full bg-[var(--color-bg-brand-f)]" />
          </div>
          <div className="flex-col-center">
            <span>×</span>
          </div>
          <div className="flex-col-center">
            <span>(</span>
          </div>
          <div className="flex-col-center relative">
            <span className="text-[12px] font-normal">現在の契約アカウント数</span>
            <span>{currentAccountCounts}</span>
            <div className="absolute bottom-[-5px] left-0 h-[2px] w-full bg-[var(--color-bg-brand-f)]" />
          </div>
          <div className="flex-col-center">
            <span>+</span>
          </div>
          <div className="flex-col-center relative">
            <span className="text-[12px] font-normal">新たに契約するアカウント数</span>
            <span>{accountQuantity}</span>
            <div className="absolute bottom-[-5px] left-0 h-[2px] w-full bg-[var(--color-bg-brand-f)]" />
          </div>
          <div className="flex-col-center">
            <span>)</span>
          </div>
        </div>
      </div>
    );
  };
  // ====================== ✅本日のお支払いの内訳コンポーネント ここまで ======================
  // ====================== 🌟増やした後の次回の請求金額コンポーネント ======================
  const NextPaymentDetailComponent = () => {
    if (!nextInvoice) return null;
    if (!nextInvoice.subscription_proration_date) return null;

    const testClockCurrentDate = new Date("2025-11-20"); // テストクロック

    return (
      <>
        {/* <div
          className={`border-real fade02 absolute bottom-[100%] left-[50%] z-30 flex min-h-[50px] min-w-[100px] translate-x-[-50%] cursor-default flex-col rounded-[8px] bg-[var(--color-edit-bg-solid)] px-[32px] py-[24px]`}
          ref={nextPaymentDetailComponentRef}
        > */}
        <div
          className={`border-real absolute bottom-[100%] left-[50%] z-30 flex min-h-[50px] min-w-[100px] translate-x-[-50%] cursor-default flex-col rounded-[8px] bg-[var(--color-edit-bg-solid)] px-[32px] py-[24px] ${
            toggleFadeRef.current ? `fade02` : ``
          }`}
          ref={nextPaymentDetailComponentRef}
        >
          {isOpenUnusedListModal && <InvoiceItemListModal planType="old" />}
          {isOpenRemainingUsageListModal && <InvoiceItemListModal planType="new" />}
          {/* {isOpenNewProrationDetail && (
            <ProrationDetails
              planType="new"
              currentPeriod={currentPeriod}
              nextInvoice={nextInvoice}
              remainingDays={remainingDays}
              setNewProrationItem(null)
              setNewProrationItem(null)
              setIsOpenNewProrationDetail={setIsOpenNewProrationDetail}
              setIsOpenOldProrationDetail={setIsOpenOldProrationDetail}
            />
          )}
          {isOpenOldProrationDetail && (
            <ProrationDetails
              planType="old"
              currentPeriod={currentPeriod}
              nextInvoice={nextInvoice}
              remainingDays={remainingDays}
              setNewProrationItem(null)
              setNewProrationItem(null)
              setIsOpenNewProrationDetail={setIsOpenNewProrationDetail}
              setIsOpenOldProrationDetail={setIsOpenOldProrationDetail}
            />
          )} */}
          {isOpenNewProrationDetail && (
            <ProrationDetails
              planType="new"
              _currentPeriod={newProrationItem?._currentPeriod}
              _currentPeriodStart={newProrationItem?._currentPeriodStart}
              _currentPeriodEnd={newProrationItem?._currentPeriodEnd}
              _invoicePeriodStart={newProrationItem?._invoicePeriodStart}
              _invoicePeriodEnd={newProrationItem?._invoicePeriodEnd}
              _remainingDays={newProrationItem?._remainingDays}
              _planFeePerAccount={newProrationItem?._planFeePerAccount}
              _newPlanAmount={newProrationItem?._newPlanAmount}
              _newDailyRateWithThreeDecimalPoints={newProrationItem?._newDailyRateWithThreeDecimalPoints}
              _newUsageAmountForRemainingPeriodWithThreeDecimalPoints={
                newProrationItem?._newUsageAmountForRemainingPeriodWithThreeDecimalPoints
              }
              _totalAccountQuantity={newProrationItem?._totalAccountQuantity}
            />
          )}
          {isOpenOldProrationDetail && (
            <ProrationDetails
              planType="old"
              _currentPeriod={oldProrationItem?._currentPeriod}
              _currentPeriodStart={oldProrationItem?._currentPeriodStart}
              _currentPeriodEnd={oldProrationItem?._currentPeriodEnd}
              _invoicePeriodStart={oldProrationItem?._invoicePeriodStart}
              _invoicePeriodEnd={oldProrationItem?._invoicePeriodEnd}
              _remainingDays={oldProrationItem?._remainingDays}
              _planFeePerAccount={oldProrationItem?._planFeePerAccount}
              _oldPlanAmount={oldProrationItem?._oldPlanAmount}
              _oldDailyRateWithThreeDecimalPoints={oldProrationItem?._oldDailyRateWithThreeDecimalPoints}
              _oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints={
                oldProrationItem?._oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints
              }
              _oldPlanAccountQuantity={oldProrationItem?._oldPlanAccountQuantity}
            />
          )}
          {/* {isOpenNewProrationDetail && (
            <ProrationDetails
              planType="new"
              _currentPeriod={currentPeriodState}
              _currentPeriodStart={nextInvoice.period_start}
              _currentPeriodEnd={nextInvoice.period_end}
              _remainingDays={remainingDaysState}
              _planFeePerAccount={getPrice(userProfileState?.subscription_plan) ?? null}
              _newPlanAmount={
                !!userProfileState?.subscription_plan && !!totalAccountQuantity
                  ? getPrice(userProfileState?.subscription_plan) * totalAccountQuantity
                  : null
              }
              _newDailyRateWithThreeDecimalPoints={newDailyRateWithThreeDecimalPoints}
              _newUsageAmountForRemainingPeriodWithThreeDecimalPoints={
                newUsageAmountForRemainingPeriodWithThreeDecimalPoints
              }
              _totalAccountQuantity={totalAccountQuantity}
            />
          )}
          {isOpenOldProrationDetail && (
            <ProrationDetails
              planType="old"
              _currentPeriod={currentPeriodState}
              _currentPeriodStart={nextInvoice.period_start}
              _currentPeriodEnd={nextInvoice.period_end}
              _remainingDays={remainingDaysState}
              _planFeePerAccount={getPrice(userProfileState?.subscription_plan) ?? null}
              _oldPlanAmount={
                !!userProfileState?.subscription_plan && !!memberAccountsDataArray
                  ? getPrice(userProfileState?.subscription_plan) * memberAccountsDataArray.length
                  : null
              }
              _oldDailyRateWithThreeDecimalPoints={oldDailyRateWithThreeDecimalPoints}
              _oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints={
                oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints
              }
              _oldPlanAccountQuantity={!!memberAccountsDataArray ? memberAccountsDataArray.length : null}
            />
          )} */}
          <div className="flex w-full flex-col pb-[25px]">
            <p className="text-[14px] font-normal">
              下記は本日、
              <span className="font-bold">
                {format(new Date(nextInvoice.subscription_proration_date * 1000), "yyyy年MM月dd日")}
                {isLastDay ? ` ${format(new Date(nextInvoice.subscription_proration_date * 1000), "HH:mm")}まで` : ``}
              </span>
              にアカウントを増やした場合のお支払額となります。
            </p>
            <p className="mt-[8px] font-normal text-[var(--color-text-sub)]">
              今月の期間（
              {format(new Date(nextInvoice.period_start * 1000), "MM月dd日")}〜
              {format(new Date(nextInvoice.period_end * 1000), "MM月dd日")}）
              {/* {elapsedDays === 0 ? `${hours}時間${minutes}分` : `から${elapsedDays}日が経過して`}、終了日まで */}
              {elapsedDays === 0 ? `` : `から${elapsedDays}日が経過して`}、終了日まで
              <span className="font-bold">
                残り
                {remainingDaysState !== null
                  ? remainingDaysState === 0
                    ? `${
                        getDaysFromTimestampToTimestamp(testClockCurrentDate.getTime(), nextInvoice.period_end).hours
                      }時間${
                        getDaysFromTimestampToTimestamp(testClockCurrentDate.getTime(), nextInvoice.period_end).minutes
                      }分`
                    : `${remainingDaysState}日`
                  : `-`}
                {/* {remainingDaysState !== null
                  ? remainingDaysState === 0
                    ? `${getDaysFromTimestampToTimestamp(Date.now(), nextInvoice.period_end).hours}時間${
                        getDaysFromTimestampToTimestamp(Date.now(), nextInvoice.period_end).minutes
                      }分`
                    : `${remainingDaysState}日`
                  : `-`} */}
                {/* {!!remainingDays && remainingDays === 0
                  ? `${remainingHours}時間${remainingMinutes}分`
                  : `${remainingDays}日`} */}
              </span>
              です。{" "}
              {!!stripeSchedulesDataArray && !!stripeSchedulesDataArray.length && (
                <span>
                  プレミアムプランからビジネスプランへのダウングレードを申込み済みです。次回請求期間(
                  {format(new Date(nextInvoice.period_end * 1000), "MM月dd日")}
                  )からビジネスプランに切り替わります。下記の「プラン価格」はダウングレード適用後の料金を表示しています。
                </span>
              )}
            </p>
            {/* {!!stripeSchedulesDataArray.length && (
              <p className="mt-[8px] font-normal text-[var(--color-text-sub)]">
                プレミアムプランからビジネスプランへのダウングレードの申込みを受け付けております。次回請求期間(
                {format(new Date(nextInvoice.period_end * 1000), "MM月dd日")})からビジネスプランの価格に切り替わります。
              </p>
            )} */}
          </div>

          {/* ２列目 新たなプラン・数量での計算式 */}
          {/* ２列目タイトル */}
          <div className="flex w-full items-center pb-[8px]">
            <h4 className="text-[14px] font-bold">
              ○更新後の新プラン料金
              {!!stripeSchedulesDataArray && !!stripeSchedulesDataArray.length && (
                <span className="text-[14px] font-normal text-[var(--color-text-sub)]">
                  （来月以降はビジネスプラン月額￥980で計算）
                </span>
              )}
            </h4>
          </div>
          {/* ２列目コンテンツ */}
          <div className="item-center flex h-auto w-full space-x-[24px] truncate pb-[20px]">
            <div className="flex-col-center relative">
              <div className="mb-[5px] flex min-h-[36px] min-w-[160px] items-center justify-center">
                <IoPricetagOutline className="ml-[-22px] mr-[10px] stroke-[3] text-[18px] text-[#1DA1F2]" />
                {/* <div className="flex-col-center mb-[5px] inline-flex min-h-[36px] min-w-[160px] text-[#FFD600]"> */}
                <div className="flex-col-center inline-flex">
                  <span className="text-[12px] font-normal">新プラン料金</span>
                  {!!stripeSchedulesDataArray && !!stripeSchedulesDataArray.length ? (
                    <span className="text-[12px] font-normal">(来月以降の請求額)</span>
                  ) : (
                    <span className="text-[12px] font-normal">(毎月の請求額)</span>
                  )}
                </div>
              </div>
              <span>
                {!!userProfileState?.subscription_plan
                  ? !!stripeSchedulesDataArray && !!stripeSchedulesDataArray.length
                    ? `${formatToJapaneseYen(getPrice("business_plan") * totalAccountQuantity, false)}円`
                    : `${formatToJapaneseYen(
                        getPrice(userProfileState.subscription_plan) * totalAccountQuantity,
                        false
                      )}円`
                  : `-`}
                {/* {!!nextInvoice?.lines?.data[2]?.amount
                  ? `${formatToJapaneseYen(nextInvoice.lines.data[2].amount, false)}円`
                  : `-`} */}
              </span>
              <div className="absolute bottom-[-5px] left-0 h-[2px] w-full bg-[#1DA1F2]" />
            </div>
            <div className="flex-col-center">
              <span className="text-[18px]">＝</span>
            </div>
            <div className="flex-col-center relative">
              <div className="flex-col-center mb-[5px] inline-flex min-h-[36px] min-w-[160px]">
                <span className="text-[12px] font-normal">プラン価格</span>
                <span className="text-[12px] font-normal">
                  (
                  {!!userProfileState?.subscription_plan
                    ? !!stripeSchedulesDataArray && !!stripeSchedulesDataArray.length
                      ? getPlanName("business_plan")
                      : getPlanName(userProfileState.subscription_plan)
                    : `-`}
                  )
                </span>
              </div>
              <span>
                {!!userProfileState?.subscription_plan
                  ? !!stripeSchedulesDataArray && !!stripeSchedulesDataArray.length
                    ? `${formatToJapaneseYen(getPrice("business_plan"), true)}/月`
                    : `${formatToJapaneseYen(getPrice(userProfileState.subscription_plan), true)}/月`
                  : `-`}
                {/* {nextInvoice?.lines?.data[2]?.plan?.amount
                  ? `${formatToJapaneseYen(nextInvoice.lines.data[2].plan.amount, true)}/月`
                  : `-`} */}
              </span>

              <div className="absolute bottom-[-5px] left-0 h-[2px] w-full bg-[var(--color-border-deep)]" />
            </div>
            <div className="flex-col-center">
              <span className="text-[20px]">×</span>
            </div>

            <div className="flex-col-center relative">
              <div className="flex-col-center mb-[5px] inline-flex min-h-[36px] min-w-[180px]">
                <span className="text-[12px] font-normal">新アカウント数</span>
                <span className="text-[12px] font-normal">(アカウント追加後)</span>
              </div>
              <span>{!!totalAccountQuantity ? `${totalAccountQuantity}個` : `-個`}</span>
              <div className="absolute bottom-[-5px] left-0 h-[2px] w-full bg-[var(--color-border-deep)]" />
            </div>
          </div>
          {/* ２列目ここまで */}
          <div className="my-[5px] h-px w-full bg-[var(--color-border-base)]" />
          {/* ３列目 追加金額の計算式 */}
          {/* ３列目タイトル */}

          <div className="mt-[12px] flex w-full items-center pb-[8px]">
            <h4 className="text-[14px] font-bold">
              ○次回請求時の追加費用
              {!!stripeSchedulesDataArray && !!stripeSchedulesDataArray.length && (
                <span className="text-[14px] font-normal text-[var(--color-text-sub)]">
                  （今月分の日割り料金は現在のプラン月額￥19,800で計算）
                </span>
              )}
            </h4>
          </div>
          {/* ３列目コンテンツ */}
          <div className="item-center flex h-auto w-full space-x-[24px] truncate pb-[20px]">
            <div className="flex-col-center relative">
              {/* <div className="flex-col-center mb-[5px] inline-flex min-h-[36px] min-w-[160px]">
              <span className="text-[12px] font-normal">アカウント追加後の</span>
              <span className="text-[12px] font-normal">次回追加費用</span>
            </div> */}
              <div className="mb-[5px] flex min-h-[36px] min-w-[160px] items-center justify-center">
                <HiPlus className="ml-[-22px] mr-[10px] stroke-[2] text-[18px] text-[#FF7A00]" />
                <div className="flex-col-center inline-flex">
                  <span className="text-[12px] font-normal">アカウント追加後の</span>
                  <span className="text-[12px] font-normal">次回追加費用</span>
                </div>
              </div>
              <span>{!!additionalCostState ? formatToJapaneseYen(additionalCostState, false) : `-`}円</span>
              {/* <span>{!!additionalCost ? formatToJapaneseYen(additionalCost, false) : `-`}円</span> */}
              <div className="absolute bottom-[-5px] left-0 h-[2px] w-full bg-[#FF7A00]" />
            </div>
            <div className="flex-col-center">
              <span className="text-[18px]">＝</span>
            </div>
            <div className="flex-col-center group relative">
              {/* ツールチップ */}
              <div
                ref={hoveredNewProrationRef}
                className={`${styles.tooltip_right_area} transition-base fade pointer-events-none`}
              >
                <div className={`${styles.tooltip_right} `}>
                  <div className={`flex-center ${styles.dropdown_item}`}>
                    {/* {theme === "light" ? "ダークモードに切り替え" : "ライトモードに切り替え"} */}
                    詳細を確認する
                  </div>
                </div>
                <div className={`${styles.tooltip_right_arrow}`}></div>
              </div>
              {/* {hoveredNewProration && (
                <div className={`${styles.tooltip_right_area} transition-base fade pointer-events-none`}>
                  <div className={`${styles.tooltip_right} `}>
                    <div className={`flex-center ${styles.dropdown_item}`}>
                      詳細を確認する
                    </div>
                  </div>
                  <div className={`${styles.tooltip_right_arrow}`}></div>
                </div>
              )} */}
              {/* ツールチップ ここまで */}
              <div className="flex-col-center mb-[5px] inline-flex min-h-[36px] min-w-[160px]">
                <span className="text-[12px] font-normal">プラン残り期間まで利用する</span>
                <span className="text-[12px] font-normal">新プランの日割り料金</span>
              </div>
              <div
                className={`flex-center relative cursor-pointer ${
                  isOpenNewProrationDetail && isFirstUpgrade
                    ? `text-[var(--color-text-brand-f)]`
                    : `peer group-hover:text-[var(--color-text-brand-f)]`
                }`}
                onClick={() => {
                  // setHoveredNewProration(false);
                  hoveredNewProrationRef.current?.classList.remove(`${styles.active}`);
                  if (isFirstUpgrade) {
                    const newDetailItem = {
                      _currentPeriod: currentPeriodState,
                      _currentPeriodStart: nextInvoice.period_start,
                      _currentPeriodEnd: nextInvoice.period_end,
                      _invoicePeriodStart: nextInvoice.lines.data[1].period.start,
                      _invoicePeriodEnd: nextInvoice.lines.data[1].period.end,
                      // _remainingDays: remainingDaysState,
                      _remainingDays: getDaysFromTimestampToTimestamp(
                        nextInvoice.lines.data[1].period.start,
                        nextInvoice.lines.data[1].period.end
                      ).period,
                      _planFeePerAccount: getPrice(userProfileState?.subscription_plan) ?? null,
                      _newPlanAmount:
                        !!userProfileState?.subscription_plan && !!totalAccountQuantity
                          ? getPrice(userProfileState?.subscription_plan) * totalAccountQuantity
                          : null,
                      _newDailyRateWithThreeDecimalPoints: newDailyRateWithThreeDecimalPoints,
                      _newUsageAmountForRemainingPeriodWithThreeDecimalPoints:
                        newUsageAmountForRemainingPeriodWithThreeDecimalPoints,
                      _totalAccountQuantity: totalAccountQuantity,
                    };
                    setNewProrationItem(newDetailItem);
                    // ProrationDetailコンポーネントを開く
                    setIsOpenNewProrationDetail(true);
                  } else {
                    // 🔹2回目以上アップデート
                    // InvoiceItem配列の一覧モーダルを表示して、InvoiceItemをクリックした後にProrationDetailコンポーネントを開く
                    setIsOpenRemainingUsageListModal(true);
                  }
                }}
                onMouseEnter={() => hoveredNewProrationRef.current?.classList.add(`${styles.active}`)}
                onMouseLeave={() => hoveredNewProrationRef.current?.classList.remove(`${styles.active}`)}
                // onMouseEnter={() => setHoveredNewProration(true)}
                // onMouseLeave={() => setHoveredNewProration(false)}
              >
                <ImInfo
                  className={`ml-[-10px] mr-[8px] ${
                    isOpenNewProrationDetail && isFirstUpgrade
                      ? `text-[var(--color-text-brand-f)]`
                      : `text-[var(--color-text-sub)] group-hover:text-[var(--color-text-brand-f)]`
                  }`}
                />
                <span>
                  {!!newUsageAmountForRemainingPeriodWithThreeDecimalPoints
                    ? `${formatToJapaneseYen(
                        Math.round(newUsageAmountForRemainingPeriodWithThreeDecimalPoints),
                        false
                      )}円`
                    : `-`}
                </span>
                {/* <span>
                  {!!nextInvoice?.lines?.data[1]?.amount
                    ? `${formatToJapaneseYen(nextInvoice.lines.data[1].amount, false)}円`
                    : `-`}
                </span> */}
              </div>
              {/* <span
                className={`relative group-hover:text-[var(--color-text-brand-f)] ${
                  isOpenNewProrationDetail ? `text-[var(--color-text-brand-f)]` : ``
                }`}
              >
                {!!nextInvoice?.lines?.data[1]?.amount
                  ? `${formatToJapaneseYen(nextInvoice.lines.data[1].amount, false)}円`
                  : `-`}
              </span> */}

              <div
                className={`pointer-events-none absolute bottom-[-5px] left-0 h-[2px] w-full ${
                  isOpenNewProrationDetail || isOpenRemainingUsageListModal
                    ? `bg-[var(--color-bg-brand-f)]`
                    : `bg-[var(--color-border-deep)] peer-hover:bg-[var(--color-bg-brand-f)]`
                }`}
              />
            </div>
            <div className="flex-col-center">
              <span className="text-[16px]">ー</span>
            </div>

            <div className="flex-col-center group relative">
              {/* ツールチップ */}
              <div
                ref={hoveredOldProrationRef}
                className={`${styles.tooltip_right_area} transition-base fade pointer-events-none`}
              >
                <div className={`${styles.tooltip_right} `}>
                  <div className={`flex-center ${styles.dropdown_item}`}>詳細を確認する</div>
                </div>
                <div className={`${styles.tooltip_right_arrow}`}></div>
              </div>
              {/* {hoveredOldProration && (
                <div className={`${styles.tooltip_right_area} transition-base fade pointer-events-none`}>
                  <div className={`${styles.tooltip_right} `}>
                    <div className={`flex-center ${styles.dropdown_item}`}>
                      詳細を確認する
                    </div>
                  </div>
                  <div className={`${styles.tooltip_right_arrow}`}></div>
                </div>
              )} */}
              {/* ツールチップ ここまで */}
              <div className="flex-col-center mb-[5px] inline-flex min-h-[36px] min-w-[180px]">
                <span className="text-[12px] font-normal">プラン残り期間まで未使用となる</span>
                <span className="text-[12px] font-normal">旧プランの日割り料金</span>
              </div>
              <div
                className={`flex-center relative cursor-pointer ${
                  isOpenOldProrationDetail
                    ? `text-[var(--color-text-brand-f)]`
                    : `peer group-hover:text-[var(--color-text-brand-f)]`
                }`}
                onClick={() => {
                  hoveredOldProrationRef.current?.classList.remove(`${styles.active}`);
                  // setHoveredOldProration(false);
                  if (isFirstUpgrade) {
                    const oldDetailItem = {
                      _currentPeriod: currentPeriodState,
                      _currentPeriodStart: nextInvoice.period_start,
                      _currentPeriodEnd: nextInvoice.period_end,
                      _invoicePeriodStart: nextInvoice.lines.data[0].period.start,
                      _invoicePeriodEnd: nextInvoice.lines.data[0].period.end,
                      // _remainingDays: remainingDaysState,
                      _remainingDays: getDaysFromTimestampToTimestamp(
                        nextInvoice.lines.data[0].period.start,
                        nextInvoice.lines.data[0].period.end
                      ).period,
                      _planFeePerAccount: getPrice(userProfileState?.subscription_plan) ?? null,
                      _oldPlanAmount:
                        !!userProfileState?.subscription_plan && !!memberAccountsDataArray
                          ? getPrice(userProfileState?.subscription_plan) * memberAccountsDataArray.length
                          : null,
                      _oldDailyRateWithThreeDecimalPoints: oldDailyRateWithThreeDecimalPoints,
                      _oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints:
                        oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints,
                      _oldPlanAccountQuantity: !!memberAccountsDataArray ? memberAccountsDataArray.length : null,
                    };
                    setOldProrationItem(oldDetailItem);
                    // ProrationDetailコンポーネントを開く
                    setIsOpenOldProrationDetail(true);
                  } else {
                    // 🔹2回目以上アップデート
                    // InvoiceItem配列の一覧モーダルを表示して、InvoiceItemをクリックした後にProrationDetailコンポーネントを開く
                    setIsOpenUnusedListModal(true);
                  }
                }}
                onMouseEnter={() => hoveredOldProrationRef.current?.classList.add(`${styles.active}`)}
                onMouseLeave={() => hoveredOldProrationRef.current?.classList.remove(`${styles.active}`)}
                // onMouseEnter={() => setHoveredOldProration(true)}
                // onMouseLeave={() => setHoveredOldProration(false)}
              >
                {/* <ImInfo
                  className={`ml-[-10px] mr-[8px] group-hover:text-[var(--color-text-brand-f)] ${
                    isOpenOldProrationDetail ? `text-[var(--bright-red)]` : `text-[var(--color-text-sub)]`
                  }]`}
                /> */}
                <ImInfo
                  className={`ml-[-10px] mr-[8px] ${
                    isOpenOldProrationDetail
                      ? `text-[var(--color-text-brand-f)]`
                      : `text-[var(--color-text-sub)] group-hover:text-[var(--color-text-brand-f)]`
                  }`}
                />
                <span className={`text-[var(--bright-red)] ${isOpenOldProrationDetail ? `` : ``}`}>
                  {!!oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints
                    ? `${formatToJapaneseYen(
                        Math.round(oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints),
                        false,
                        false
                      )}円`
                    : `-`}
                </span>
                {/* <span className={`text-[var(--bright-red)] ${isOpenOldProrationDetail ? `` : ``}`}>
                  {!!nextInvoice?.lines?.data[0]?.amount
                    ? `${formatToJapaneseYen(nextInvoice.lines.data[0].amount, false, true)}円`
                    : `-`}
                </span> */}
              </div>
              <div
                className={`pointer-events-none absolute bottom-[-5px] left-0 h-[2px] w-full ${
                  isOpenOldProrationDetail || isOpenUnusedListModal
                    ? `bg-[var(--color-text-brand-f)]`
                    : `bg-[var(--color-border-deep)] peer-hover:bg-[var(--color-bg-brand-f)]`
                }`}
              />
            </div>
          </div>
          {/* ３列目ここまで */}
          <div className="my-[5px] h-px w-full bg-[var(--color-border-base)]" />
          {/* ４列目 追加金額を加えた次回請求額の計算式 */}
          {/* ４列目タイトル */}
          <div className="mt-[12px] flex w-full items-center pb-[8px]">
            <h4 className="text-[14px] font-bold">○次回お支払い金額（次回のみ追加費用が発生）</h4>
          </div>
          {/* ４列目コンテンツ */}
          <div className="item-center flex h-auto w-full space-x-[24px] truncate pb-[20px]">
            <div className="flex-col-center relative">
              {/* <span className="flex-center mb-[5px] inline-flex min-h-[36px] min-w-[160px] text-[12px] font-normal">
              更新後の次回お支払額
            </span> */}
              <div className="mb-[5px] flex min-h-[36px] min-w-[160px] items-center justify-center">
                <BsCheck2 className="ml-[-12px] mr-[5px] stroke-1 text-[18px] text-[#00d436]" />
                <div className="flex-col-center inline-flex">
                  <span className="text-[12px] font-normal">更新後の次回お支払い額</span>
                </div>
              </div>
              {/* <BsCheck2 className="min-h-[24px] min-w-[24px] stroke-1 text-[24px] text-[#00d436]" /> */}
              <span className="">
                {nextInvoiceAmountState ? `${formatToJapaneseYen(nextInvoiceAmountState, false)}円` : `-`}
              </span>
              {/* <span className="">
                {nextInvoice?.amount_due ? `${formatToJapaneseYen(nextInvoice.amount_due, false)}円` : `-`}
              </span> */}
              <div className="absolute bottom-[-5px] left-0 h-[2px] w-full bg-[var(--vivid-green)]" />
            </div>
            <div className="flex-col-center">
              <span className="text-[18px]">＝</span>
            </div>
            <div className="flex-col-center relative">
              {/* <div className="flex-col-center mb-[5px] inline-flex min-h-[36px] min-w-[160px]">
              <span className="text-[12px] font-normal">新プラン料金</span>
            </div> */}
              <div className="mb-[5px] flex min-h-[36px] min-w-[160px] items-center justify-center">
                <IoPricetagOutline className="ml-[-22px] mr-[10px] stroke-[3] text-[18px] text-[#1DA1F2]" />
                <div className="flex-col-center inline-flex">
                  <span className="text-[12px] font-normal">新プラン料金</span>
                </div>
              </div>
              <span>
                {!!userProfileState?.subscription_plan
                  ? !!stripeSchedulesDataArray && !!stripeSchedulesDataArray.length
                    ? `${formatToJapaneseYen(getPrice("business_plan") * totalAccountQuantity, false)}円`
                    : `${formatToJapaneseYen(
                        getPrice(userProfileState.subscription_plan) * totalAccountQuantity,
                        false
                      )}円`
                  : `-`}
              </span>
              {/* <span>
                {!!nextInvoice?.lines?.data[2]?.amount
                  ? `${formatToJapaneseYen(nextInvoice.lines.data[2].amount, false)}円`
                  : `-`}
              </span> */}

              <div className="absolute bottom-[-5px] left-0 h-[2px] w-full bg-[#1DA1F2]" />
            </div>
            <div className="flex-col-center">
              <span className="text-[16px]">＋</span>
            </div>

            <div className="flex-col-center relative">
              {/* <div className="flex-col-center mb-[5px] inline-flex min-h-[36px] min-w-[180px]">
              <span className="text-[12px] font-normal">アカウント追加後の</span>
              <span className="text-[12px] font-normal">次回追加費用</span>
            </div> */}
              <div className="mb-[5px] flex min-h-[36px] min-w-[160px] items-center justify-center">
                <HiPlus className="ml-[-22px] mr-[10px] stroke-[2] text-[18px] text-[#FF7A00]" />
                <div className="flex-col-center inline-flex">
                  <span className="text-[12px] font-normal">アカウント追加後の</span>
                  <span className="text-[12px] font-normal">次回追加費用</span>
                </div>
              </div>
              <span>{!!additionalCostState ? `${formatToJapaneseYen(additionalCostState, false)}円` : `-`}</span>
              {/* <span>{!!additionalCost ? `${formatToJapaneseYen(additionalCost, false)}円` : `-`}</span> */}
              <div className="absolute bottom-[-5px] left-0 h-[2px] w-full bg-[#FF7A00]" />
            </div>
          </div>
          {/* ４列目ここまで */}
        </div>
      </>
    );
  };
  // ====================== ✅増やした後の次回の請求金額 ここまで ======================

  // ====================== 🌟2回目以上アップグレード用未使用、残り使用分一覧コンポーネント ======================
  type InvoiceProps = {
    invoiceItem: Stripe.InvoiceLineItem;
    anotherInvoiceQuantity: number | undefined | null;
    planType: "new" | "old";
    isLastItem: boolean;
    lastInvoiceItem: LastInvoiceItem | null;
  };
  const InvoiceItemListComponent: FC<InvoiceProps> = ({
    invoiceItem,
    anotherInvoiceQuantity,
    planType,
    isLastItem,
    lastInvoiceItem,
  }) => {
    if (!userProfileState) return null;
    if (!userProfileState.subscription_plan) return null;
    if (!currentPeriodState || remainingDaysState === null) return null;
    if (!invoiceItem) return null;
    if (!nextInvoice) return null;

    return (
      <li
        className="transition-base01 flex min-h-[50px] w-full cursor-pointer border-b border-solid border-[var(--color-border-deep)] pt-[5px] hover:bg-[var(--color-bg-sub)]"
        onClick={() => {
          if (isLastItem && planType === "new") {
            // 現在選択している数量のinvoiceItemなので、ローカルで計算したlastInvoiceItemの値を渡す
            const newProrationItem = {
              planType: "new",
              _currentPeriod: currentPeriodState,
              _currentPeriodStart: nextInvoice.period_start,
              _currentPeriodEnd: nextInvoice.period_end,
              _invoicePeriodStart: lastInvoiceItemState.periodStart,
              _invoicePeriodEnd: lastInvoiceItemState.periodEnd,
              // _remainingDays: remainingDaysState,
              _remainingDays: getDaysFromTimestampToTimestamp(
                lastInvoiceItemState.periodStart ? lastInvoiceItemState.periodStart : 0,
                lastInvoiceItemState.periodEnd ? lastInvoiceItemState.periodEnd : 0
              ).period,
              _planFeePerAccount: lastInvoiceItemState.planFeePerAccount,
              // _newPlanAmount: lastInvoiceItemState.newPlanAmount,
              _newPlanAmount: getPrice(userProfileState.subscription_plan) * totalAccountQuantity,
              // _newPlanAmount: !!stripeSchedulesDataArray && !!stripeSchedulesDataArray.length
              //   ? getPrice("business_plan") * totalAccountQuantity
              //   : getPrice(userProfileState.subscription_plan) * totalAccountQuantity,
              _newDailyRateWithThreeDecimalPoints: lastInvoiceItemState.newDailyRateWithThreeDecimalPoints,
              _newUsageAmountForRemainingPeriodWithThreeDecimalPoints:
                lastInvoiceItemState.newUsageAmountForRemainingPeriodWithThreeDecimalPoints,
              _totalAccountQuantity: lastInvoiceItemState.newQuantity,
            };
            console.log("ラストアイテムクリック", newProrationItem);
            setNewProrationItem(newProrationItem);
            setIsOpenNewProrationDetail(true);
          } else {
            if (planType === "new") {
              if (!invoiceItem.quantity) return console.log("invoice.quantity無しのためリターン");
              if (!invoiceItem.plan) return console.log("invoiceItem.plan無しのためリターン");
              if (!invoiceItem.plan.amount) return console.log("invoiceItem.plan.amount無しのためリターン");
              if (typeof invoiceItem.plan.amount !== "number")
                return console.log("invoiceItem.plan.amount numberではないのためリターン", invoiceItem.plan.amount);
              // クリックした新んプランのインボイスアイテムの日割り計算詳細モーダルを開く
              const newProrationItem = {
                planType: "new",
                _currentPeriod: currentPeriodState,
                _currentPeriodStart: nextInvoice.period_start,
                _currentPeriodEnd: nextInvoice.period_end,
                _invoicePeriodStart: invoiceItem.period.start,
                _invoicePeriodEnd: invoiceItem.period.end,
                // _remainingDays: remainingDaysState,
                _remainingDays: getDaysFromTimestampToTimestamp(invoiceItem.period.start, invoiceItem.period.end)
                  .period,
                _planFeePerAccount: invoiceItem.plan.amount,
                _newPlanAmount: invoiceItem.plan.amount * invoiceItem.quantity,
                _newDailyRateWithThreeDecimalPoints: getProrationAmountAndDailyRate(
                  currentPeriodState,
                  getDaysFromTimestampToTimestamp(invoiceItem.period.start, invoiceItem.period.end).period,
                  invoiceItem.plan.amount,
                  invoiceItem.quantity
                ).newDailyRateWithThreeDecimalPoints,
                // _newDailyRateWithThreeDecimalPoints: getProrationAmountAndDailyRate(
                //   currentPeriodState,
                //   remainingDaysState,
                //   invoiceItem.plan.amount,
                //   invoiceItem.quantity
                // ).newDailyRateWithThreeDecimalPoints,
                _newUsageAmountForRemainingPeriodWithThreeDecimalPoints: getProrationAmountAndDailyRate(
                  currentPeriodState,
                  getDaysFromTimestampToTimestamp(invoiceItem.period.start, invoiceItem.period.end).period,
                  invoiceItem.plan.amount,
                  invoiceItem.quantity
                ).amountForRemainingPeriodWithThreeDecimalPoints,
                // _newUsageAmountForRemainingPeriodWithThreeDecimalPoints: getProrationAmountAndDailyRate(
                //   currentPeriodState,
                //   remainingDaysState,
                //   invoiceItem.plan.amount,
                //   invoiceItem.quantity
                // ).amountForRemainingPeriodWithThreeDecimalPoints,
                _totalAccountQuantity: invoiceItem.quantity,
              };
              console.log("クリック", newProrationItem);
              setNewProrationItem(newProrationItem);
              setIsOpenNewProrationDetail(true);
            } else if (planType === "old") {
              if (!invoiceItem.quantity) return;
              if (!invoiceItem.plan) return;
              if (!invoiceItem.plan.amount) return;
              if (typeof invoiceItem.plan.amount !== "number") return;
              // クリックした新んプランのインボイスアイテムの日割り計算詳細モーダルを開く
              const oldProrationItem = {
                planType: "old",
                _currentPeriod: currentPeriodState,
                _currentPeriodStart: nextInvoice.period_start,
                _currentPeriodEnd: nextInvoice.period_end,
                _invoicePeriodStart: invoiceItem.period.start,
                _invoicePeriodEnd: invoiceItem.period.end,
                // _remainingDays: remainingDaysState,
                _remainingDays: getDaysFromTimestampToTimestamp(invoiceItem.period.start, invoiceItem.period.end)
                  .period,
                _planFeePerAccount: invoiceItem.plan.amount,
                _oldPlanAmount: invoiceItem.plan.amount * invoiceItem.quantity,
                _oldDailyRateWithThreeDecimalPoints: getProrationAmountAndDailyRate(
                  currentPeriodState,
                  getDaysFromTimestampToTimestamp(invoiceItem.period.start, invoiceItem.period.end).period,
                  invoiceItem.plan.amount,
                  invoiceItem.quantity
                ).newDailyRateWithThreeDecimalPoints,
                // _oldDailyRateWithThreeDecimalPoints: getProrationAmountAndDailyRate(
                //   currentPeriodState,
                //   remainingDaysState,
                //   invoiceItem.plan.amount,
                //   invoiceItem.quantity
                // ).newDailyRateWithThreeDecimalPoints,
                _oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints: getProrationAmountAndDailyRate(
                  currentPeriodState,
                  getDaysFromTimestampToTimestamp(invoiceItem.period.start, invoiceItem.period.end).period,
                  invoiceItem.plan.amount,
                  invoiceItem.quantity
                ).amountForRemainingPeriodWithThreeDecimalPoints,
                // _oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints: getProrationAmountAndDailyRate(
                //   currentPeriodState,
                //   remainingDaysState,
                //   invoiceItem.plan.amount,
                //   invoiceItem.quantity
                // ).amountForRemainingPeriodWithThreeDecimalPoints,
                _oldPlanAccountQuantity: invoiceItem.quantity,
              };
              console.log("クリック", oldProrationItem);
              setOldProrationItem(oldProrationItem);
              setIsOpenOldProrationDetail(true);
            }
          }
        }}
      >
        <div className="flex min-w-[110px] flex-col pl-[10px] text-[var(--color-text-brand-f)]">
          <span>
            {!!invoiceItem?.period?.start ? format(new Date(invoiceItem.period.start * 1000), "yyyy/MM/dd") : `-`}
          </span>
          {isLastItem && <span className="text-[11px] text-[var(--color-text-sub)]">(今回変更した場合)</span>}
          {invoiceItem?.quantity === anotherInvoiceQuantity && (
            <span className="text-[11px] text-[var(--color-text-sub)]">(プラン変更分)</span>
          )}
        </div>
        <div className="min-w-[100px] pl-[10px] text-[var(--color-text-title)]">
          {planType === "new" && (
            <>
              <span className="">{anotherInvoiceQuantity ?? `-`}個</span> →{" "}
              {!isLastItem && <span className="">{invoiceItem?.quantity ?? `-`}個</span>}
              {isLastItem && <span className="">{lastInvoiceItem?.newQuantity ?? `-`}個</span>}
            </>
          )}
          {planType === "old" && (
            <>
              <span className="">{invoiceItem?.quantity ?? `-`}個</span> →{" "}
              {!isLastItem && <span className="">{anotherInvoiceQuantity ?? `-`}個</span>}
              {isLastItem && <span className="">{lastInvoiceItem?.newQuantity ?? `-`}個</span>}
            </>
          )}
        </div>
        <div className="min-w-[150px] max-w-[150px] pl-[10px] text-[var(--color-text-title)]">
          <span className="">
            {!!invoiceItem?.period?.start ? format(new Date(invoiceItem.period.start * 1000), "yyyy/MM/dd") : `-`}
          </span>
          から
          <span className="">
            {!!invoiceItem?.period?.end ? format(new Date(invoiceItem.period.end * 1000), "yyyy/MM/dd") : `-`}
          </span>
          まで
        </div>
        <div className="min-w-[100px] pl-[10px] text-[var(--color-text-title)]">
          <span className="">{`${
            !!invoiceItem?.plan?.amount ? formatToJapaneseYen(Math.round(invoiceItem.plan.amount), true) : `-`
          }`}</span>
        </div>
        <div className="min-w-[80px] pl-[10px] text-[var(--color-text-title)]">
          {!isLastItem && <span className="">{invoiceItem?.quantity ?? `-`}個</span>}
          {isLastItem && planType === "new" && <span className="">{lastInvoiceItem?.newQuantity ?? `-`}個</span>}
          {isLastItem && planType === "old" && <span className="">{lastInvoiceItem?.oldQuantity ?? `-`}個</span>}
        </div>
        <div className="w-full pl-[10px] text-[var(--color-text-title)]">
          {!isLastItem &&
            `${!!invoiceItem?.amount ? formatToJapaneseYen(Math.round(invoiceItem.amount), false) : `-`}円`}
          {isLastItem &&
            planType === "new" &&
            `${
              !!lastInvoiceItem?.newUsageAmountForRemainingPeriodWithThreeDecimalPoints
                ? formatToJapaneseYen(
                    Math.round(lastInvoiceItem?.newUsageAmountForRemainingPeriodWithThreeDecimalPoints),
                    false
                  )
                : `-`
            }円`}
          {isLastItem &&
            planType === "old" &&
            `${
              !!lastInvoiceItem?.oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints
                ? formatToJapaneseYen(
                    Math.round(lastInvoiceItem?.oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints),
                    false,
                    true
                  )
                : `-`
            }円`}
        </div>
      </li>
    );
  };

  const InvoiceItemListModal = ({ planType }: { planType: "new" | "old" }) => {
    return (
      <>
        {/* オーバーレイ */}
        {planType === "new" && (
          <div
            className="absolute left-0 top-0 z-[70] h-full w-full cursor-pointer rounded-[8px]"
            onClick={() => {
              setNewProrationItem(null);
              setIsOpenRemainingUsageListModal(false);
            }}
          ></div>
        )}
        {planType === "old" && (
          <div
            className="absolute left-0 top-0 z-[70] h-full w-full cursor-pointer rounded-[8px]"
            onClick={() => {
              setOldProrationItem(null);
              setIsOpenUnusedListModal(false);
            }}
          ></div>
        )}
        {/* ハイライト */}
        {planType === "new" && (
          <>
            <div className="absolute left-0 top-0 z-[69] h-full w-[34%] rounded-l-[7px] bg-[#00000030] backdrop-blur-sm"></div>
            <div className="absolute bottom-0 left-[34%] right-[37%] z-[69] h-[31%] bg-[#00000030] backdrop-blur-sm"></div>
            <div className="absolute right-0 top-0 z-[69] h-full w-[37%] rounded-r-[7px] bg-[#00000030] backdrop-blur-sm"></div>
          </>
        )}
        {planType === "old" && (
          <div className="pointer-events-none absolute left-0 top-0 z-[69] h-full w-full">
            <div className="absolute left-0 top-0 z-[69] h-full w-[66%] rounded-l-[7px] bg-[#00000030] backdrop-blur-sm"></div>
            <div className="absolute bottom-0 right-0 z-[69] h-[31%] w-[34%] rounded-br-[7px] bg-[#00000030] backdrop-blur-sm"></div>
          </div>
        )}
        {/* ハイライト ここまで */}

        {/* モーダルエリア */}
        <div
          className={`shadow-all-md-center  absolute left-[50%] top-[0] z-[80] flex  min-w-[100%] translate-x-[-50%] flex-col overflow-hidden rounded-[8px] border border-solid border-[var(--color-bg-brand-f)] bg-[var(--color-edit-bg-solid)] pt-[16px] ${
            !!stripeSchedulesDataArray && !!stripeSchedulesDataArray.length
              ? `max-h-[55%] min-h-[55%]`
              : `max-h-[51%] min-h-[50%]`
          }`}
        >
          {/* クローズボタン */}
          {planType === "new" && (
            <button
              className={`flex-center group absolute right-[20px] top-[10px] z-50 h-[32px] w-[32px] rounded-full bg-[#00000000] hover:bg-[var(--color-bg-sub-re-hover)]`}
              onClick={() => {
                setNewProrationItem(null);
                setIsOpenRemainingUsageListModal(false);
              }}
            >
              <MdClose className="text-[20px] text-[var(--color-text-title)]" />
            </button>
          )}
          {planType === "old" && (
            <button
              className={`flex-center group absolute right-[20px] top-[10px] z-50 h-[32px] w-[32px] rounded-full bg-[#00000000] hover:bg-[var(--color-bg-sub-re-hover)]`}
              onClick={() => {
                setOldProrationItem(null);
                setIsOpenUnusedListModal(false);
              }}
            >
              <MdClose className="text-[20px] text-[var(--color-text-title)]" />
            </button>
          )}
          {/* クローズボタン ここまで */}
          {/* モーダルタイトルエリア */}
          <div className="fade03 flex w-full flex-col justify-center space-y-[10px] px-[24px]">
            <h4 className="text-[16px] font-bold text-[var(--color-text-title)]">
              {planType === "new"
                ? `新プランの期間残り使用分の日割り料金一覧`
                : `旧プランの期間終了日までの未使用分の日割り料金一覧`}
            </h4>
            <div className="flex w-full items-center space-x-[50px] text-[13px] font-normal text-[var(--color-text-title)]">
              <div className="-[5px] flex min-w-fit items-center space-x-[5px]">
                <span>変更回数(今月)</span>
                <span>：</span>
                <span className="underline underline-offset-2">{remainingUsageInvoiceItemArray.length}回</span>
              </div>
              <div className="flex min-w-fit items-center space-x-[5px]">
                <span>日割り料金合計</span>
                <span>：</span>
                {planType === "new" && (
                  <span className="font-bold underline underline-offset-2">
                    {!!newUsageAmountForRemainingPeriodWithThreeDecimalPoints
                      ? `${formatToJapaneseYen(
                          Math.round(newUsageAmountForRemainingPeriodWithThreeDecimalPoints),
                          false
                        )}円`
                      : `-`}
                  </span>
                )}
                {planType === "old" && (
                  <span className="font-bold text-[var(--bright-red)] underline underline-offset-2">
                    {!!oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints
                      ? `${formatToJapaneseYen(
                          Math.round(oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints),
                          false
                        )}円`
                      : `-`}
                  </span>
                )}
              </div>
              <div className="!ml-[0px] flex w-full justify-end text-[var(--color-text-sub)]">
                <span className="truncate">（クリックして個別に詳細を確認できます。）</span>
              </div>
            </div>
          </div>
          {/* モーダルコンテンツエリア */}
          <div className="fade03 mt-[12px] flex w-full flex-col overflow-hidden bg-[#00000000] font-normal">
            <div className="relative flex h-auto w-full flex-col overflow-y-scroll border-t border-solid border-[var(--color-border-deep)]">
              <div className="z-1 sticky left-0 top-0 flex min-h-[40px] w-full items-center border-b border-solid border-[var(--color-border-deep)] bg-[var(--color-edit-bg-solid)] text-[12px]">
                <div className="min-w-[110px] pl-[10px] text-[var(--color-text-sub)]">変更日</div>
                <div className="min-w-[100px] pl-[10px] text-[var(--color-text-sub)]">変更内容</div>
                <div className="min-w-[150px] max-w-[150px] pl-[10px] text-[var(--color-text-sub)]">
                  サービス使用期間
                </div>
                <div className="min-w-[100px] max-w-[150px] pl-[10px] text-[var(--color-text-sub)]">プラン価格</div>
                <div className="min-w-[80px] max-w-[150px] pl-[10px] text-[var(--color-text-sub)]">数量</div>
                <div className="w-full pl-[10px] text-[var(--color-text-sub)]">日割り料金</div>
              </div>
              <ul className="flex h-auto w-full flex-col text-[12px]">
                {planType === "new" &&
                  remainingUsageInvoiceItemArray
                    .slice()
                    .reverse()
                    .map((item, index) => (
                      <InvoiceItemListComponent
                        key={item.id}
                        invoiceItem={item}
                        // anotherInvoiceQuantity={unusedInvoiceItemArray[index]?.quantity}
                        anotherInvoiceQuantity={
                          unusedInvoiceItemArray[unusedInvoiceItemArray.length - 1 - index]?.quantity
                        }
                        planType={planType}
                        // isLastItem={index === remainingUsageInvoiceItemArray.length - 1}
                        isLastItem={index === 0 && !isLastDay}
                        lastInvoiceItem={index === 0 && !isLastDay ? lastInvoiceItemState : null}
                        // isLastItem={index === 0}
                        // lastInvoiceItem={index === 0 ? lastInvoiceItemState : null}
                      />
                    ))}
                {planType === "old" &&
                  unusedInvoiceItemArray
                    .slice()
                    .reverse()
                    .map((item, index) => (
                      <InvoiceItemListComponent
                        key={item.id}
                        invoiceItem={item}
                        // anotherInvoiceQuantity={remainingUsageInvoiceItemArray[index]?.quantity}
                        anotherInvoiceQuantity={
                          remainingUsageInvoiceItemArray[remainingUsageInvoiceItemArray.length - 1 - index]?.quantity
                        }
                        planType={planType}
                        isLastItem={index === 0 && !isLastDay}
                        // isLastItem={index === 0}
                        // isLastItem={index === unusedInvoiceItemArray.length - 1}
                        lastInvoiceItem={index === 0 && !isLastDay ? lastInvoiceItemState : null}
                        // lastInvoiceItem={index === 0 ? lastInvoiceItemState : null}
                      />
                    ))}
                {/* <div className="transition-base02 flex min-h-[50px] w-full cursor-pointer border-b border-solid border-[var(--color-border-deep)] pt-[5px] hover:bg-[var(--color-bg-sub)]">
                  <div className="min-w-[110px] pl-[10px] text-[var(--color-text-brand-f)]">
                    {format(new Date(remainingUsageInvoiceItemArray[0].period.start * 1000), "yyyy/MM/dd")}
                  </div>
                  <div className="min-w-[100px] pl-[10px] text-[var(--color-text-title)]">
                    <span className="">{unusedInvoiceItemArray[0].quantity}個</span> →{" "}
                    <span className="">{remainingUsageInvoiceItemArray[0].quantity}個</span>
                  </div>
                  <div className="min-w-[150px] max-w-[150px] pl-[10px] text-[var(--color-text-title)]">
                    <span className="">
                      {format(new Date(remainingUsageInvoiceItemArray[0].period.start * 1000), "yyyy/MM/dd")}
                    </span>
                    から
                    <span className="">
                      {format(new Date(remainingUsageInvoiceItemArray[0].period.end * 1000), "yyyy/MM/dd")}
                    </span>
                    まで
                  </div>
                  <div className="min-w-[100px] pl-[10px] text-[var(--color-text-title)]">
                    <span className="">{`${
                      !!remainingUsageInvoiceItemArray[0].plan?.amount
                        ? formatToJapaneseYen(Math.round(remainingUsageInvoiceItemArray[0].plan.amount), true)
                        : `-`
                    }`}</span>
                  </div>
                  <div className="min-w-[80px] pl-[10px] text-[var(--color-text-title)]">
                    <span className="">{remainingUsageInvoiceItemArray[0].quantity}個</span>
                  </div>
                  <div className="w-full pl-[10px] text-[var(--color-text-title)]">{`${formatToJapaneseYen(
                    Math.round(remainingUsageInvoiceItemArray[0].amount),
                    false
                  )}円`}</div>
                </div> */}
                {/* <div className="flex min-h-[50px] w-full items-center border-b border-solid border-[var(--color-border-deep)]"></div> */}
              </ul>
            </div>
          </div>
        </div>
      </>
    );
  };
  // ====================== ✅2回目以上アップグレード用未使用、残り使用分一覧コンポーネント ======================

  // ====================== 🌟日割り料金の詳細コンポーネント ======================
  const ProrationDetails = ({
    planType,
    _currentPeriodStart,
    _currentPeriodEnd,
    _currentPeriod,
    _invoicePeriodStart,
    _invoicePeriodEnd,
    _remainingDays,
    _newDailyRateWithThreeDecimalPoints,
    _oldDailyRateWithThreeDecimalPoints,
    _newUsageAmountForRemainingPeriodWithThreeDecimalPoints,
    _oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints,
    _newPlanAmount,
    _oldPlanAmount,
    _planFeePerAccount,
    _totalAccountQuantity,
    _oldPlanAccountQuantity,
  }: {
    planType: "new" | "old";
    _currentPeriodStart?: number | null;
    _currentPeriodEnd?: number | null;
    _currentPeriod?: number | null;
    _invoicePeriodStart?: number | null;
    _invoicePeriodEnd?: number | null;
    _remainingDays?: number | null;
    _newDailyRateWithThreeDecimalPoints?: number | null;
    _oldDailyRateWithThreeDecimalPoints?: number | null;
    _newUsageAmountForRemainingPeriodWithThreeDecimalPoints?: number | null;
    _oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints?: number | null;
    _newPlanAmount?: number | null;
    _oldPlanAmount?: number | null;
    _planFeePerAccount?: number | null;
    _totalAccountQuantity?: number | null;
    _oldPlanAccountQuantity?: number | null;
  }) => {
    // if (!userProfileState?.subscription_plan) return null;
    // if (!memberAccountsDataArray) return null;
    // if (!nextInvoice) return null;
    // if (!nextInvoice.subscription_proration_date) return null;

    // const planFeePerAccount = getPrice(userProfileState.subscription_plan) ?? null;
    // const newPlanAmount = planFeePerAccount * totalAccountQuantity ?? null;
    // const oldPlanAmount = planFeePerAccount * memberAccountsDataArray.length ?? null;

    return (
      <>
        {/* オーバーレイ */}
        {planType === "new" && (
          <div
            className="absolute left-0 top-0 z-[100] h-full w-full cursor-pointer rounded-[8px]"
            onClick={() => {
              setNewProrationItem(null);
              setIsOpenNewProrationDetail(false);
            }}
          ></div>
        )}
        {planType === "old" && (
          <div
            className="absolute left-0 top-0 z-[100] h-full w-full cursor-pointer rounded-[8px]"
            onClick={() => {
              setOldProrationItem(null);
              setIsOpenOldProrationDetail(false);
            }}
          ></div>
        )}
        {/* ハイライト */}
        {planType === "new" && (
          <>
            <div className="absolute left-0 top-0 z-[99] h-full w-[34%] rounded-l-[7px] bg-[#00000030] backdrop-blur-sm"></div>
            <div className="absolute bottom-0 left-[34%] right-[37%] z-[99] h-[31%] bg-[#00000030] backdrop-blur-sm"></div>
            <div className="absolute right-0 top-0 z-[99] h-full w-[37%] rounded-r-[7px] bg-[#00000030] backdrop-blur-sm"></div>
          </>
        )}
        {planType === "old" && (
          <div className="pointer-events-none absolute left-0 top-0 z-[99] h-full w-full">
            <div className="absolute left-0 top-0 z-[99] h-full w-[66%] rounded-l-[7px] bg-[#00000030] backdrop-blur-sm"></div>
            <div className="absolute bottom-0 right-0 z-[99] h-[31%] w-[34%] rounded-br-[7px] bg-[#00000030] backdrop-blur-sm"></div>
          </div>
        )}
        {/* ハイライト ここまで */}
        <div
          className={`shadow-all-md-center absolute left-[50%] top-[0] z-[150] flex  min-w-[100%] translate-x-[-50%] flex-col rounded-[8px] border border-solid border-[var(--color-bg-brand-f)] bg-[var(--color-edit-bg-solid)] px-[24px] py-[16px] ${
            !!stripeSchedulesDataArray && !!stripeSchedulesDataArray.length
              ? `max-h-[55%] min-h-[55%]`
              : `max-h-[51%] min-h-[252.95px]`
          }`}
          // className={`shadow-all-md-center absolute left-[50%] top-[0] z-[150] flex max-h-[51%] min-h-[50%] min-w-[100%] translate-x-[-50%] flex-col rounded-[8px] border border-solid border-[var(--color-bg-brand-f)] bg-[var(--color-edit-bg-solid)] px-[24px] py-[16px]`}
        >
          {/* クローズボタン */}
          {planType === "new" && (
            <button
              className={`flex-center group absolute right-[20px] top-[10px] z-50 h-[32px] w-[32px] rounded-full bg-[#00000000] hover:bg-[var(--color-bg-sub-re-hover)]`}
              onClick={() => {
                setNewProrationItem(null);
                setIsOpenNewProrationDetail(false);
              }}
            >
              <MdClose className="text-[20px] text-[var(--color-text-title)]" />
            </button>
          )}
          {planType === "old" && (
            <button
              className={`flex-center group absolute right-[20px] top-[10px] z-50 h-[32px] w-[32px] rounded-full bg-[#00000000] hover:bg-[var(--color-bg-sub-re-hover)]`}
              onClick={() => {
                setOldProrationItem(null);
                setIsOpenOldProrationDetail(false);
              }}
            >
              <MdClose className="text-[20px] text-[var(--color-text-title)]" />
            </button>
          )}
          {/* クローズボタン ここまで */}
          <div className="flex w-full items-center">
            <div className="text-[16px] font-bold text-[var(--color-text-title)]">
              {planType === "new" &&
                _newUsageAmountForRemainingPeriodWithThreeDecimalPoints !== null &&
                typeof _newUsageAmountForRemainingPeriodWithThreeDecimalPoints !== "undefined" && (
                  <h4>
                    新プランの残り期間使用分：
                    <span className="text-[var(--color-text-brand-f)]">
                      {formatToJapaneseYen(
                        Math.round(_newUsageAmountForRemainingPeriodWithThreeDecimalPoints),
                        false,
                        false
                      )}
                      円
                    </span>
                    の日割り料金の詳細
                  </h4>
                )}
              {planType === "old" &&
                _oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints !== null &&
                typeof _oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints !== "undefined" && (
                  <h4>
                    旧プランの未使用分：
                    <span className="text-[var(--bright-red)]">
                      {formatToJapaneseYen(
                        Math.round(_oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints),
                        false,
                        false
                      )}
                      円
                    </span>
                    の日割り料金の詳細
                  </h4>
                )}
            </div>
          </div>
          <div className="fade03 mt-[12px] flex w-full flex-col space-y-[12px] text-[14px] font-normal">
            <p className="flex items-center space-x-[8px]">
              <span className="text-[16px] font-bold">・</span>
              <span className="!ml-[4px]">今月の契約期間</span>
              <span>：</span>
              <span className="font-bold">
                {!!_currentPeriodStart ? format(new Date(_currentPeriodStart * 1000), "yyyy年MM月dd日") : `-`}〜
                {!!_currentPeriodEnd ? format(new Date(_currentPeriodEnd * 1000), "yyyy年MM月dd日") : `-`}
                {!!_currentPeriod ? `（${_currentPeriod}日間）` : ``}
              </span>
              {/* <span className="font-bold">
                {format(new Date(nextInvoice.period_start * 1000), "yyyy年MM月dd日")}〜
                {format(new Date(nextInvoice.period_end * 1000), "yyyy年MM月dd日")}
                {!!currentPeriodState ? `（${currentPeriodState}日間）` : ``}
              </span> */}
            </p>
            <div className="flex w-full items-center">
              {/* <p className="flex min-w-[50%] items-center space-x-[8px]">
              <span>契約期間の日数</span>
              <span>：</span>
              <span>{!!currentPeriod ? `${currentPeriod}日間` : `-`}</span>
            </p> */}
              <p className="flex min-w-[50%] items-center space-x-[8px]">
                <span className="text-[16px] font-bold">・</span>
                <span className="!ml-[4px]">終了日までの残り日数</span>
                <span>：</span>
                <span className="font-bold">
                  {_remainingDays !== null ? `${_remainingDays}日間` : `-`}
                  {/* {!!remainingDaysState ? `${remainingDaysState}日間` : `-`} */}
                  {/* {!!remainingDays ? `${remainingDays}日間` : `-`} */}
                  {/* {!!elapsedDays ? `（開始日から${elapsedDays}日経過）` : `-`} */}
                </span>
                {!!_invoicePeriodStart && !!_invoicePeriodEnd && (
                  <span className="text-[var(--color-text-title)]">
                    （{format(new Date(_invoicePeriodStart * 1000), "MM月dd日")}〜
                    {format(new Date(_invoicePeriodEnd * 1000), "MM月dd日")}）
                  </span>
                )}
              </p>
            </div>
            <p className="flex items-center space-x-[8px]">
              <span className="text-[16px] font-bold">・</span>
              <span className="!ml-[4px]">{planType === "new" ? `新プランの価格` : `旧プランの価格`}</span>
              <span>：</span>
              {planType === "new" && (
                <span className="font-bold">
                  {!!_newPlanAmount ? `${_newPlanAmount}円` : `-`}
                  {/* {!!newPlanAmount ? `${newPlanAmount}円` : `-`} */}
                  {/* {!!nextInvoice?.lines?.data[2]?.amount ? `${nextInvoice.lines.data[2].amount}円` : `-`} */}
                  {/* {!!nextInvoice?.lines?.data[2]?.amount
                    ? `${formatToJapaneseYen(nextInvoice.lines.data[2].amount, false)}円`
                    : `-`} */}
                </span>
              )}{" "}
              {planType === "old" && (
                <span className="font-bold">
                  {!!_oldPlanAmount ? `${_oldPlanAmount}円` : `-`}
                  {/* {!!oldPlanAmount ? `${oldPlanAmount}円` : `-`} */}
                  {/* {!!nextInvoice?.lines?.data[0]?.plan?.amount && !!nextInvoice?.lines?.data[0]?.quantity
                    ? `${nextInvoice?.lines?.data[0]?.plan?.amount * nextInvoice?.lines?.data[0]?.quantity}円`
                    : `-`} */}
                  {/* {!!nextInvoice?.lines?.data[0]?.plan?.amount && !!nextInvoice?.lines?.data[0]?.quantity
                    ? `${formatToJapaneseYen(
                        nextInvoice?.lines?.data[0]?.plan?.amount * nextInvoice?.lines?.data[0]?.quantity,
                        false
                      )}円`
                    : `-`} */}
                </span>
              )}
              <span>=</span>
              {planType === "new" && (
                <span>
                  {!!_planFeePerAccount ? `${_planFeePerAccount}/月` : `-`}
                  {/* {!!planFeePerAccount ? `${planFeePerAccount}/月` : `-`} */}
                  {/* {!!nextInvoice?.lines?.data[2]?.plan?.amount ? `${nextInvoice.lines.data[2].plan?.amount}/月` : `-`} */}
                  {/* {!!nextInvoice?.lines?.data[2]?.plan?.amount
                    ? `${formatToJapaneseYen(nextInvoice.lines.data[2].plan?.amount, true)}/月`
                    : `-`} */}
                </span>
              )}
              {planType === "old" && (
                <span>
                  {!!_planFeePerAccount ? `${_planFeePerAccount}/月` : `-`}
                  {/* {!!planFeePerAccount ? `${planFeePerAccount}/月` : `-`} */}
                  {/* {!!nextInvoice?.lines?.data[0]?.plan?.amount ? `${nextInvoice.lines.data[0].plan?.amount}/月` : `-`} */}
                  {/* {!!nextInvoice?.lines?.data[0]?.plan?.amount
                    ? `${formatToJapaneseYen(nextInvoice.lines.data[0].plan?.amount, true)}/月`
                    : `-`} */}
                </span>
              )}
              <span>×</span>
              {planType === "new" && (
                <span>
                  {!!_totalAccountQuantity ? `${_totalAccountQuantity}個` : `-`}
                  {/* {!!totalAccountQuantity ? `${totalAccountQuantity}個` : `-`} */}
                  {/* {!!nextInvoice?.lines?.data[2]?.quantity ? `${nextInvoice.lines.data[2].quantity}個` : `-`} */}
                  {/* {!!nextInvoice?.lines?.data[2]?.quantity
                    ? `${formatToJapaneseYen(nextInvoice.lines.data[2].quantity, false)}個`
                    : `-`} */}
                </span>
              )}
              {planType === "old" && (
                <span>
                  {!!_oldPlanAccountQuantity ? `${_oldPlanAccountQuantity}個` : `-`}
                  {/* {!!memberAccountsDataArray ? `${memberAccountsDataArray.length}個` : `-`} */}
                  {/* {!!nextInvoice?.lines?.data[0]?.quantity ? `${nextInvoice.lines.data[0].quantity}個` : `-`} */}
                  {/* {!!nextInvoice?.lines?.data[0]?.quantity
                    ? `${formatToJapaneseYen(nextInvoice.lines.data[0].quantity, false)}個`
                    : `-`} */}
                </span>
              )}
            </p>
            <p className="flex items-center space-x-[8px]">
              <span className="text-[16px] font-bold">・</span>
              <span className="!ml-[4px]">
                {planType === "new" ? `新プランの1日あたりの使用料` : `旧プランの1日あたりの使用料`}
              </span>
              <span>：</span>

              {planType === "new" && (
                <span className="font-bold">
                  {!!_newDailyRateWithThreeDecimalPoints ? `${_newDailyRateWithThreeDecimalPoints}円/日` : `-`}
                  {/* {!!newDailyRateWithThreeDecimalPoints ? `${newDailyRateWithThreeDecimalPoints}円/日` : `-`} */}
                  {/* {!!nextInvoice?.lines?.data[2]?.amount && !!currentPeriod
                    ? `${Math.round((nextInvoice.lines.data[2].amount / currentPeriod) * 1000) / 1000}円/日`
                    : `-`} */}
                  {/* {!!nextInvoice?.lines?.data[2]?.amount && !!currentPeriod
                    ? `${formatToJapaneseYen(
                        // Math.floor((nextInvoice.lines.data[2].amount / currentPeriod) * 1000) / 1000,
                        Math.round((nextInvoice.lines.data[2].amount / currentPeriod) * 1000) / 1000,
                        // nextInvoice.lines.data[2].amount / currentPeriod,
                        false
                      )}円/日`
                    : `-`} */}
                </span>
              )}
              {planType === "old" && (
                <span className="font-bold">
                  {_oldDailyRateWithThreeDecimalPoints ? `${_oldDailyRateWithThreeDecimalPoints}円/日` : `-`}
                  {/* {oldDailyRateWithThreeDecimalPoints ? `${oldDailyRateWithThreeDecimalPoints}円/日` : `-`} */}
                  {/* {!!nextInvoice?.lines?.data[0]?.plan?.amount &&
                  !!nextInvoice?.lines?.data[0]?.quantity &&
                  !!currentPeriod
                    ? `${
                        Math.round(
                          ((nextInvoice?.lines?.data[0]?.plan?.amount * nextInvoice?.lines?.data[0]?.quantity) /
                            currentPeriod) *
                            1000
                        ) / 1000
                      }円/日`
                    : `-`} */}
                  {/* {!!nextInvoice?.lines?.data[0]?.plan?.amount &&
                  !!nextInvoice?.lines?.data[0]?.quantity &&
                  !!currentPeriod
                    ? `${formatToJapaneseYen(
                        Math.round(
                          ((nextInvoice?.lines?.data[0]?.plan?.amount * nextInvoice?.lines?.data[0]?.quantity) /
                            currentPeriod) *
                            1000
                        ) / 1000,
                        false
                      )}円/日`
                    : `-`} */}
                </span>
              )}
              <span>=</span>
              {planType === "new" && (
                <span>
                  {!!_newPlanAmount ? `${_newPlanAmount}円` : `-`}
                  {/* {!!newPlanAmount ? `${newPlanAmount}円` : `-`} */}
                  {/* {!!nextInvoice?.lines?.data[2]?.amount ? `${nextInvoice.lines.data[2].amount}円` : `-`} */}
                  {/* {!!nextInvoice?.lines?.data[2]?.amount
                    ? `${formatToJapaneseYen(nextInvoice.lines.data[2].amount, false)}円`
                    : `-`} */}
                </span>
              )}
              {planType === "old" && (
                <span className="font-bold">
                  {!!_oldPlanAmount ? `${_oldPlanAmount}円` : `-`}
                  {/* {!!oldPlanAmount ? `${oldPlanAmount}円` : `-`} */}
                  {/* {!!nextInvoice?.lines?.data[0]?.plan?.amount && !!nextInvoice?.lines?.data[0]?.quantity
                    ? `${nextInvoice?.lines?.data[0]?.plan?.amount * nextInvoice?.lines?.data[0]?.quantity}円`
                    : `-`} */}
                  {/* {!!nextInvoice?.lines?.data[0]?.plan?.amount && !!nextInvoice?.lines?.data[0]?.quantity
                    ? `${formatToJapaneseYen(
                        nextInvoice?.lines?.data[0]?.plan?.amount * nextInvoice?.lines?.data[0]?.quantity,
                        false
                      )}円`
                    : `-`} */}
                </span>
              )}
              <span>÷</span>
              <span>{!!_currentPeriod ? `${_currentPeriod}日` : `-`}</span>
              {/* <span>{!!currentPeriod ? `${currentPeriod}日` : `-`}</span> */}
            </p>
            <p className="flex items-center space-x-[8px]">
              <span className="text-[16px] font-bold">・</span>
              <span className="!ml-[4px] min-w-[224px]">
                {planType === "new" ? `新プランの残り利用分の日割り料金` : `旧プランの未使用分の日割り料金`}
              </span>
              <span>：</span>
              {planType === "new" && (
                <span className="font-bold text-[var(--color-text-brand-f)] underline underline-offset-1">
                  {!!_newUsageAmountForRemainingPeriodWithThreeDecimalPoints
                    ? `${formatToJapaneseYen(
                        Math.round(_newUsageAmountForRemainingPeriodWithThreeDecimalPoints),
                        false
                      )}円`
                    : `-`}
                  {/* {!!newUsageAmountForRemainingPeriodWithThreeDecimalPoints
                    ? `${formatToJapaneseYen(
                        Math.round(newUsageAmountForRemainingPeriodWithThreeDecimalPoints),
                        false
                      )}円`
                    : `-`} */}
                  {/* {!!nextInvoice?.lines?.data[2]?.amount && !!currentPeriod && !!remainingDays
                    ? `${formatToJapaneseYen(
                        Math.round(
                          (Math.round((nextInvoice.lines.data[2].amount / currentPeriod) * 1000) / 1000) * remainingDays
                        ),
                        false
                      )}円`
                    : `-`} */}
                  {/* {!!nextInvoice?.lines?.data[2]?.amount && !!currentPeriod && !!remainingDays
                ? `${formatToJapaneseYen(
                    (Math.round((nextInvoice.lines.data[2].amount / currentPeriod) * 1000) / 1000) * remainingDays,
                    false
                  )}円`
                : `-`} */}
                </span>
              )}
              {planType === "old" && (
                <span className="font-bold text-[var(--bright-red)] underline underline-offset-1">
                  {!!_oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints
                    ? `${formatToJapaneseYen(
                        Math.round(_oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints),
                        false,
                        false
                      )}円`
                    : `-`}
                  {/* {!!oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints
                    ? `${formatToJapaneseYen(
                        Math.round(oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints),
                        false,
                        false
                      )}円`
                    : `-`} */}
                  {/* {!!nextInvoice?.lines?.data[0]?.plan?.amount &&
                  !!nextInvoice?.lines?.data[0]?.quantity &&
                  !!currentPeriod &&
                  !!remainingDays
                    ? `${formatToJapaneseYen(nextInvoice?.lines?.data[0].amount, false, false)}円`
                    : `-`} */}
                </span>
              )}
              <span>=</span>
              {planType === "new" && (
                <span>
                  {!!_newDailyRateWithThreeDecimalPoints ? `${_newDailyRateWithThreeDecimalPoints}円/日` : `-`}
                  {/* {!!newDailyRateWithThreeDecimalPoints ? `${newDailyRateWithThreeDecimalPoints}円/日` : `-`} */}
                  {/* {!!nextInvoice?.lines?.data[2]?.amount && !!currentPeriod
                    ? `${Math.round((nextInvoice.lines.data[2].amount / currentPeriod) * 1000) / 1000}円/日`
                    : `-`} */}
                  {/* {!!nextInvoice?.lines?.data[2]?.amount && !!currentPeriod
                    ? `${formatToJapaneseYen(
                        Math.round((nextInvoice.lines.data[2].amount / currentPeriod) * 1000) / 1000,
                        false
                      )}円/日`
                    : `-`} */}
                </span>
              )}
              {planType === "old" && (
                <span>
                  {!!_oldDailyRateWithThreeDecimalPoints ? `${_oldDailyRateWithThreeDecimalPoints}円/日` : `-`}
                  {/* {!!oldDailyRateWithThreeDecimalPoints ? `${oldDailyRateWithThreeDecimalPoints}円/日` : `-`} */}
                  {/* {!!nextInvoice?.lines?.data[0]?.plan?.amount &&
                  !!nextInvoice?.lines?.data[0]?.quantity &&
                  !!currentPeriod
                    ? `${
                        Math.round(
                          ((nextInvoice?.lines?.data[0]?.plan?.amount * nextInvoice?.lines?.data[0]?.quantity) /
                            currentPeriod) *
                            1000
                        ) / 1000
                      }円/日`
                    : `-`} */}
                  {/* {!!nextInvoice?.lines?.data[0]?.plan?.amount &&
                  !!nextInvoice?.lines?.data[0]?.quantity &&
                  !!currentPeriod
                    ? `${formatToJapaneseYen(
                        Math.round(
                          ((nextInvoice?.lines?.data[0]?.plan?.amount * nextInvoice?.lines?.data[0]?.quantity) /
                            currentPeriod) *
                            1000
                        ) / 1000,
                        false
                      )}円/日`
                    : `-`} */}
                </span>
              )}
              <span>×</span>

              {planType === "new" && <span>{_remainingDays !== null ? `残り${_remainingDays}日` : `-`}</span>}
              {/* {planType === "new" && <span>{!!remainingDaysState ? `残り${remainingDaysState}日` : `-`}</span>} */}
              {/* {planType === "new" && <span>{!!remainingDays ? `残り${remainingDays}日` : `-`}</span>} */}
              {planType === "old" && <span>{_remainingDays !== null ? `残り${_remainingDays}日` : `-`}</span>}
              {/* {planType === "old" && <span>{!!remainingDaysState ? `残り${remainingDaysState}日` : `-`}</span>} */}
              {/* {planType === "old" && <span>{!!remainingDays ? `残り${remainingDays}日` : `-`}</span>} */}
            </p>
            {planType === "new" &&
              !!_newUsageAmountForRemainingPeriodWithThreeDecimalPoints &&
              !Number.isInteger(_newUsageAmountForRemainingPeriodWithThreeDecimalPoints) && (
                <p className="!mt-[2px] flex items-center space-x-[8px]">
                  <span className="min-w-[210px]"></span>
                  <span className=""></span>
                  <span className="text-[13px] text-[var(--color-text-sub)]">
                    （
                    {planType === "new" &&
                      `${
                        !!_newUsageAmountForRemainingPeriodWithThreeDecimalPoints
                          ? `${_newUsageAmountForRemainingPeriodWithThreeDecimalPoints}円`
                          : `-`
                      }`}
                    を四捨五入）
                  </span>
                </p>
              )}
            {planType === "old" &&
              !!_oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints &&
              !Number.isInteger(_oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints) && (
                <p className="!mt-[2px] flex items-center space-x-[8px]">
                  <span className="min-w-[210px]"></span>
                  <span className=""></span>
                  <span className="text-[13px] text-[var(--color-text-sub)]">
                    （
                    {planType === "old" &&
                      `${
                        !!_oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints
                          ? `${_oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints}円`
                          : `-`
                      }`}
                    を四捨五入）
                  </span>
                </p>
              )}
          </div>
        </div>
      </>
    );
  };
  // ====================== ✅日割り料金の詳細コンポーネント ここまで ======================
  // ====================== 🌟最終確認モーダル ここまで ======================
  const LastConfirmationIncrease = () => {
    useEffect(() => {
      if (!stripeRetrieveInvoice || !stripeRetrieveInvoice.lines) {
        toast.error(`請求金額の取得に失敗しました... `, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        setIsOpenLastConfirmationModal(false);
      }
    }, []);
    if (!stripeRetrieveInvoice || !stripeRetrieveInvoice.lines) return null;
    return (
      <div className={`clear_overlay_absolute fade02 z-[2000] rounded-[7px] bg-[var(--color-overlay-black-md)]`}>
        <div className="absolute left-[50%] top-[50%] z-[100] min-w-[576px] translate-x-[-50%] translate-y-[-50%] rounded-[8px] bg-[var(--color-bg-notification-modal)] p-[32px] text-[var(--color-text-title)]">
          {/* クローズボタン */}
          <button
            className={`flex-center z-100 group absolute right-[-40px] top-0 h-[32px] w-[32px] rounded-full bg-[#00000090] hover:bg-[#000000c0]`}
            onClick={() => setIsOpenLastConfirmationModal(false)}
          >
            <MdClose className="text-[20px] text-[#fff]" />
          </button>
          <h3 className={`flex min-h-[32px] w-full items-center text-[22px] font-bold`}>
            この内容でアカウントを増やしてもよろしいですか？
          </h3>
          <section className={`flex h-auto w-full flex-col text-[14px]`}>
            <ul className="mt-[20px] flex w-full list-disc flex-col space-y-3 pl-[15px]">
              <li className="">アカウントの数量：{totalAccountQuantity ?? `-`}個</li>
              <li className="">
                更新後の月額料金：
                {stripeRetrieveInvoice.lines.data[stripeRetrieveInvoice.lines.data.length - 1]?.amount ?? `-`}円
              </li>
              <li className="">次回ご請求時のお支払額：{stripeRetrieveInvoice.amount_due ?? `-`}円</li>
            </ul>
            <p className="mt-[15px] text-[13px] text-[var(--color-text-sub)] ">
              「アカウントを増やす」をクリックすることで、あなたは
              <span className="font-bold">{userProfileState?.customer_name ?? `チーム`}</span>
              の所有者としてキャンセルするまで更新後の料金が請求されることに同意したものとみなされます。
            </p>
          </section>
          <section className="flex w-full items-start justify-end">
            <div className={`flex w-[100%] items-center justify-around space-x-5 pt-[24px]`}>
              <button
                className={`w-[50%] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[15px] py-[10px] text-[14px] font-bold text-[var(--color-text-title)] hover:bg-[var(--setting-side-bg-select-hover)]`}
                onClick={() => setIsOpenLastConfirmationModal(false)}
              >
                戻る
              </button>
              <button
                className="w-[50%] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[15px] py-[10px] text-[14px] font-bold text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]"
                onClick={async () => {
                  if (!stripeRetrieveInvoice.subscription_proration_date) {
                    toast.error(`エラーが発生しました。サポートにご報告の上、しばらく経ってからやり直してください。 `, {
                      position: "top-right",
                      autoClose: 5000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                      progress: undefined,
                    });
                    return;
                  }
                  // ローディング開始
                  setLoading(true);
                  await handleChangeQuantity(stripeRetrieveInvoice.subscription_proration_date);
                  setLoading(false);
                }}
              >
                アカウントを増やす
              </button>
            </div>
          </section>
        </div>
      </div>
    );
  };
  // ====================== ✅最終確認モーダル ここまで ======================

  return (
    <>
      {/* 外側オーバーレイ */}
      <div className={`${styles.overlay} `} onClick={() => setIsOpenChangeAccountCountsModal(null)} />

      <div className={`${styles.container} `}>
        {/* 次回請求期間のお支払いの詳細モーダルを開いた時のオーバーレイ */}
        {(isOpenInvoiceDetail || hoveredTodaysPayment) && (
          <div
            className={`clear_overlay_absolute fade03 pointer-events-none z-20 rounded-[8px] bg-[var(--color-overlay-light)]`}
          ></div>
        )}
        {/* ローディングオーバーレイ */}
        {loading && (
          <div className={`${styles.loading_overlay} `}>
            <SpinnerIDS scale={"scale-[0.5]"} />
          </div>
        )}
        {/* クローズボタン */}
        <button
          className={`flex-center group absolute right-[-40px] top-0 z-10 h-[32px] w-[32px] rounded-full bg-[#00000090] hover:bg-[#000000c0]`}
          onClick={() => setIsOpenChangeAccountCountsModal(null)}
        >
          <MdClose className="text-[20px] text-[#fff]" />
        </button>
        {/* Stripeから取得したInvoiceとローカルで計算したInvoice内容の確認モーダル開閉ボタン */}
        {/* <button
          className={`flex-center group absolute right-[-40px] top-[52px] z-10 h-[32px] w-[32px] rounded-full bg-[#00000070] hover:bg-[#000000c0]`}
          onClick={() => setIsOpenCheckInvoiceStripeLocalModal(!isOpenCheckInvoiceStripeLocalModal)}
        >
          {isOpenCheckInvoiceStripeLocalModal && <FaChevronRight className="text-[16px] text-[#fff]" />}
          {!isOpenCheckInvoiceStripeLocalModal && <FaChevronLeft className="text-[16px] text-[#fff]" />}
        </button> */}
        {/* メインコンテンツ コンテナ */}
        <div className={`${styles.main_contents_container}`}>
          {/* チェック不合格時の最終確認モーダル */}
          {isOpenLastConfirmationModal && <LastConfirmationIncrease />}
          {/* <LastConfirmationIncrease /> */}
          {/* 右側の料金チェックエリア */}
          {isOpenCheckInvoiceStripeLocalModal && (
            <CheckInvoiceStripeLocalModal
              additionalCostState={additionalCostState}
              currentPeriodState={currentPeriodState}
              newDailyRateWithThreeDecimalPoints={newDailyRateWithThreeDecimalPoints}
              newUsageAmountForRemainingPeriodWithThreeDecimalPoints={
                newUsageAmountForRemainingPeriodWithThreeDecimalPoints
              }
              nextInvoiceAmountState={nextInvoiceAmountState}
              oldDailyRateWithThreeDecimalPoints={oldDailyRateWithThreeDecimalPoints}
              oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints={
                oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints
              }
              remainingDaysState={remainingDaysState}
              stripeAdditionalCostState={stripeAdditionalCostState}
              stripeNewDailyRateWithThreeDecimalPoints={stripeNewDailyRateWithThreeDecimalPoints}
              stripeNewUsageAmountForRemainingPeriodWithThreeDecimalPoints={
                stripeNewUsageAmountForRemainingPeriodWithThreeDecimalPoints
              }
              stripeNextInvoiceAmountState={stripeNextInvoiceAmountState}
              stripeOldDailyRateWithThreeDecimalPoints={stripeOldDailyRateWithThreeDecimalPoints}
              stripeOldUnusedAmountForRemainingPeriodWithThreeDecimalPoints={
                stripeOldUnusedAmountForRemainingPeriodWithThreeDecimalPoints
              }
              subscription_plan={userProfileState?.subscription_plan}
              totalAccountQuantity={totalAccountQuantity}
            />
          )}
          <div className={`${styles.left_container} relative h-full w-5/12`}>
            <div className="relative w-full overflow-y-auto px-[40px] pb-[calc(116px+20px)] pt-[40px]">
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
              <h1 className={`mt-[10px] w-full text-[24px] font-bold`}>いくつアカウントを増やしますか？</h1>
              {/* <h1 className={`w-full text-[24px] font-bold`}>プランを選んで早速始めましょう！</h1> */}
              <div className={`flex w-full flex-col space-y-[2px] py-[20px] text-[15px] text-[var(--color-text-sub)]`}>
                {userProfileState?.subscription_plan === "business_plan" && (
                  <p>メンバー1人当たり月額￥980の追加料金のみで利用可能</p>
                )}
                <p>チーム全体で共同作業して、TRSUSTiFYの機能を最大限に活用しましょう。</p>
              </div>

              {/* <div className="mb-[10px] flex w-full flex-col">
                <div className="flex space-x-3 text-[14px] text-[var(--color-text-title)]">
                  <BsCheck2 className="min-h-[24px] min-w-[24px] stroke-1 text-[24px] text-[#00d436]" />
                  <p>メンバー1人当たり月額￥980の追加料金のみで利用可能</p>
                </div>
              </div> */}

              <div className="mt-[10px] flex max-h-[35px] min-h-[35px] w-full items-center justify-between text-[15px]">
                <h4 className="flex space-x-3">
                  {/* <BsCheck2 className="min-h-[24px] min-w-[24px] stroke-1 text-[24px] text-[var(--color-bg-brand-f)]" /> */}
                  <BsCheck2 className="min-h-[24px] min-w-[24px] stroke-1 text-[24px] text-[#00d436]" />
                  <span>
                    {!!userProfileState?.subscription_plan ? getPlanName(userProfileState?.subscription_plan) : `-`}：
                  </span>
                  {/* <span className="font-bold">{notSetAccounts.length}個</span> */}
                </h4>
                <div className="flex flex-col items-end text-[13px] font-bold">
                  <span className="">
                    月{!!userProfileState?.subscription_plan ? getPrice(userProfileState?.subscription_plan) : `-`}円
                  </span>
                  <span className="">/アカウント</span>
                </div>
              </div>
              <div className="mt-[20px] flex max-h-[35px] min-h-[35px] w-full items-center justify-between text-[15px]">
                <h4 className="flex space-x-3">
                  {/* <BsCheck2 className="min-h-[24px] min-w-[24px] stroke-1 text-[24px] text-[var(--color-bg-brand-f)]" /> */}
                  <BsCheck2 className="min-h-[24px] min-w-[24px] stroke-1 text-[24px] text-[#00d436]" />
                  <span>現在契約中のアカウント数：</span>
                  {/* <span className="font-bold">{notSetAccounts.length}個</span> */}
                </h4>
                {!useQueryIsLoading && (
                  <span className="font-bold">{!!currentAccountCounts ? currentAccountCounts : `-`}個</span>
                )}
                {useQueryIsLoading && <SpinnerIDS scale={"scale-[0.3]"} />}
              </div>
              {/* <div className="mt-[20px] flex min-h-[35px] w-full items-center justify-between text-[15px]">
                <h4>
                  メンバー未設定アカウント数：
                </h4>
                <span className="font-bold">個</span>
              </div> */}

              {/* メンバー人数選択エリア */}
              <div className="mt-[20px] flex w-full items-center justify-between text-[var(--color-text-title)]">
                <h4 className="relative flex min-w-max items-center space-x-3 text-[15px]">
                  {/* <HiPlus className="min-h-[24px] min-w-[24px] stroke-[1.5] text-[24px] text-[#00d436]" /> */}
                  <HiPlus className="min-h-[24px] min-w-[24px] stroke-[1.5] text-[24px] text-[var(--color-bg-brand-f)]" />
                  <span>新たに増やすアカウント数：</span>
                </h4>
                <div className="flex items-center justify-end space-x-2">
                  <input
                    type="number"
                    min="1"
                    className={`${styles.input_box}`}
                    placeholder=""
                    value={accountQuantity === null ? 1 : accountQuantity}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") {
                        setAccountQuantity(null);
                      } else {
                        const numValue = Number(val);
                        // 入力値がマイナスかチェック
                        if (numValue <= 0) {
                          setAccountQuantity(1);
                        } else {
                          setAccountQuantity(numValue);
                        }
                      }
                    }}
                  />
                  <div className="font-bold">個</div>
                </div>
              </div>
              {/* メンバー人数選択エリア ここまで */}
              {/* 変更後の合計アカウント数 */}
              <div className="mt-[20px] flex max-h-[35px] min-h-[35px] w-full items-center justify-between text-[15px]">
                <h4 className="flex space-x-3">
                  {/* <BsCheck2 className="min-h-[24px] min-w-[24px] stroke-1 text-[24px] text-[var(--color-bg-brand-f)]" /> */}
                  <BsCheck2 className="min-h-[24px] min-w-[24px] stroke-1 text-[24px] text-[#00d436]" />
                  <span>変更後の合計アカウント数：</span>
                  {/* <span className="font-bold">{notSetAccounts.length}個</span> */}
                </h4>
                {!useQueryIsLoading && (
                  <span className="font-bold">{!!totalAccountQuantity ? totalAccountQuantity : `-`}個</span>
                )}
                {useQueryIsLoading && <SpinnerIDS scale={"scale-[0.3]"} />}
              </div>
              {/* 変更後の合計アカウント数 ここまで */}
            </div>

            {/* 変更の確定を送信するボタンエリア */}
            <div className="shadow-top-md absolute bottom-0 left-0 w-full space-y-4  rounded-bl-[8px] bg-[var(--color-edit-bg-solid)] px-[32px] pb-[32px] pt-[18px]">
              <div className="flex w-full flex-col  text-[13px] text-[var(--color-text-title)]">
                {/* <h3 className="text-[14px] font-bold">アカウントを増やした後の契約プランと契約アカウント数</h3> */}
                <div className="mt-[10px] flex flex-col space-y-3">
                  {/* <div className="mt-[5px] flex w-full items-center justify-between">
                    <span>ビジネスプラン</span>
                    <span>月額980円/アカウント</span>
                  </div> */}
                  {/* <div className="flex w-full items-center justify-between">
                    <span>契約アカウント 合計</span>
                    <span className="font-bold underline underline-offset-1">10個</span>
                  </div> */}
                  <div className="flex w-full items-start justify-between">
                    <span className="max-w-[290px]">アカウントを増やした後に発生する毎月のプラン追加費用</span>
                    {/* <span className="">￥{(accountQuantity ? accountQuantity : 1) * 980}</span> */}
                    {!isFreeTodaysPayment && (
                      <span className="">
                        ￥
                        {(accountQuantity ?? 1) * getPrice(userProfileState?.subscription_plan) !== 0
                          ? (accountQuantity ?? 1) * getPrice(userProfileState?.subscription_plan)
                          : "エラー"}
                      </span>
                    )}
                    {isFreeTodaysPayment && (
                      <span className="">
                        ￥
                        {!!accountQuantity && !!userProfileState?.subscription_plan
                          ? formatToJapaneseYen(
                              (accountQuantity ?? 1) * getPrice(userProfileState?.subscription_plan),
                              false
                            )
                          : "-"}
                      </span>
                    )}
                    {/* {isFreeTodaysPayment && (
                      <span className="">
                        ￥{!!additionalCostState ? formatToJapaneseYen(additionalCostState, false) : "-"}
                      </span>
                    )} */}
                  </div>

                  {/* ローカルstateの計算結果を使って表示 */}
                  {!!nextInvoice && !!nextInvoiceAmountState && (
                    <div className="flex w-full items-start justify-between font-bold">
                      <span>次回請求期間のお支払い</span>
                      {/* <div className="flex items-center">
                        <span>次回請求期間のお支払い</span>
                        <span className="ml-[3px] font-normal">(詳細を確認できます)</span>
                      </div> */}
                      <div
                        className="relative flex cursor-pointer items-center space-x-2"
                        onMouseEnter={() => {
                          setIsOpenInvoiceDetail(true);
                        }}
                        onMouseLeave={() => {
                          if (isFirstUpgrade) {
                            if (isOpenNewProrationDetail) {
                              setIsOpenNewProrationDetail(false); // 個別日割り計算モーダルを閉じる
                            }
                            if (isOpenOldProrationDetail) {
                              setIsOpenOldProrationDetail(false); // 個別日割り計算モーダルを閉じる
                            }
                          } else {
                            // 2回目以上のアップグレード用 今までの新プランの残り使用分の料金の詳細を個々に確認するモーダル
                            if (isOpenRemainingUsageListModal) {
                              if (isOpenNewProrationDetail) setIsOpenNewProrationDetail(false); // 個別日割り計算モーダルを開いている場合には閉じる
                              if (newProrationItem) setNewProrationItem(null); // InvoiceItem個別確認用のStateをリセット
                              setIsOpenRemainingUsageListModal(false);
                            }
                            // 2回目以上のアップグレード用 今までの旧プランの未使用分の料金の詳細を個々に確認するモーダル
                            if (isOpenUnusedListModal) {
                              if (isOpenOldProrationDetail) setIsOpenOldProrationDetail(false); // 個別日割り計算モーダルを開いている場合には閉じる
                              if (oldProrationItem) setOldProrationItem(null); // InvoiceItem個別確認用のStateをリセット
                              setIsOpenUnusedListModal(false);
                            }
                          }
                          hoveredNewProrationRef.current?.classList.remove(`${styles.active}`); // ツールチップ
                          hoveredOldProrationRef.current?.classList.remove(`${styles.active}`); // ツールチップ
                          // if (hoveredNewProration) setHoveredNewProration(false); // ツールチップ
                          // if (hoveredOldProration) setHoveredOldProration(false); // ツールチップ
                          // 最後に閉じる
                          setIsOpenInvoiceDetail(false);
                        }}
                      >
                        {/* {!!nextInvoice?.amount_due && <BsChevronDown />} */}
                        {!!nextInvoiceAmountState && nextInvoiceAmountState > 0 && <BsChevronDown />}
                        <span>
                          {!!nextInvoiceAmountState && nextInvoiceAmountState > 0
                            ? `${formatToJapaneseYen(nextInvoiceAmountState)}`
                            : `-`}
                          {/* {!!nextInvoice?.amount_due ? `${formatToJapaneseYen(nextInvoice.amount_due)}` : `-`} */}
                        </span>
                        {isOpenInvoiceDetail && <NextPaymentDetailComponent />}
                        {/* <NextPaymentDetailComponent /> */}
                      </div>
                    </div>
                  )}
                  {/* nextInvoiceを使って表示 */}
                  {/* {!!nextInvoice && !!nextInvoice?.lines?.data && nextInvoice?.lines?.data.length > 1 && (
                    <div className="flex w-full items-start justify-between font-bold">
                      <span>次回請求期間のお支払い</span>
                      <div
                        className="relative flex cursor-pointer items-center space-x-2"
                        onMouseEnter={() => {
                          setIsOpenInvoiceDetail(true);
                        }}
                        onMouseLeave={() => {
                          setIsOpenInvoiceDetail(false);
                          if (isOpenNewProrationDetail) {
                            if (hoveredNewProration) setHoveredNewProration(false);
                            setNewProrationItem(null)
                            return setIsOpenNewProrationDetail(false);
                          }
                          if (isOpenOldProrationDetail) {
                            if (hoveredOldProration) setHoveredOldProration(false);
                            return setIsOpenOldProrationDetail(false);
                          }
                        }}
                      >
                        {!!nextInvoice?.amount_due && <BsChevronDown />}
                        <span>
                          {!!nextInvoice?.amount_due ? `${formatToJapaneseYen(nextInvoice.amount_due)}` : `-`}
                        </span>
                        {isOpenInvoiceDetail && <NextPaymentDetailComponent />}
                      </div>
                    </div>
                  )} */}

                  {!isLastDay && (
                    <div className="flex w-full items-start justify-between font-bold">
                      <span>本日のお支払い</span>
                      {todaysPayment !== 0 && (
                        <div
                          className="relative flex items-center space-x-2"
                          onMouseEnter={() => setHoveredTodaysPayment(true)}
                          onMouseLeave={() => setHoveredTodaysPayment(false)}
                        >
                          <BsChevronDown />
                          <span>￥{todaysPayment}</span>
                          {hoveredTodaysPayment && <TodaysPaymentDetailComponent />}
                          {/* <TodaysPaymentDetailComponent /> */}
                        </div>
                      )}
                      {todaysPayment === 0 && (
                        <div className="relative flex items-center space-x-2">
                          <span>￥0</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <button
                className={`flex-center h-[40px] w-full rounded-[6px] font-bold text-[#fff]  ${
                  !!userProfileState && !!userProfileState.subscription_plan
                    ? `cursor-pointer bg-[var(--color-bg-brand-f)] hover:bg-[var(--color-bg-brand-f-deep)]`
                    : `cursor-not-allowed bg-[var(--setting-side-bg-select)] text-[var(--setting-side-bg-select-hover)]`
                }`}
                disabled={!userProfileState || !userProfileState.subscription_plan}
                onClick={handleChangeConfirm}
                // onClick={handleCheckInvoiceStripeAndLocalCalculate}
              >
                {/* {!isLoadingCalculation && <span>料金チェック</span>}
                {isLoadingCalculation && <SpinnerIDS scale={"scale-[0.4]"} />} */}
                {!loading && <span>変更の確定</span>}
                {loading && <SpinnerIDS scale={"scale-[0.4]"} />}
              </button>
              <div className="flex w-full flex-col  text-[13px] text-[var(--color-text-sub)]">
                <p>
                  確定することにより、キャンセルするまで更新後の料金が請求されることに同意したものとみなされます。お好きな時にいつでもキャンセルでき、それ以降は請求されません。
                </p>
              </div>
            </div>
          </div>
          <div className={`${styles.right_container} flex-col-center h-full w-7/12`}>
            <Vertical_SlideCards />
            <div className={`mb-[-30px] flex max-w-[500px] flex-col justify-center space-y-5 py-[30px]`}>
              <div className="flex space-x-3">
                <BsCheck2 className="min-h-[24px] min-w-[24px] stroke-1 text-[24px] text-[#00d436]" />
                <p>全メンバーの活動データを１ヶ所に集約</p>
              </div>
              <div className="flex space-x-3">
                <BsCheck2 className="min-h-[24px] min-w-[24px] stroke-1 text-[24px] text-[#00d436]" />
                <p>データを分析・活用可能にして資産を構築</p>
              </div>
              <div className="flex space-x-3">
                <BsCheck2 className="min-h-[24px] min-w-[24px] stroke-1 text-[24px] text-[#00d436]" />
                <p>全メンバーがいつでもリアルタイムにデータにアクセス・追加・編集が可能に</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const IncreaseAccountCountsModal = memo(IncreaseAccountCountsModalMemo);
