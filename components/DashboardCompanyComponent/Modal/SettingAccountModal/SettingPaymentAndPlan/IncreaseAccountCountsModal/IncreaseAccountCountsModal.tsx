import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import useDashboardStore from "@/store/useDashboardStore";
import React, { memo, useEffect, useMemo, useRef, useState } from "react";
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
import { SubscribedAccount } from "@/types";
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
// import { ProrationDetails } from "./ProrationDetails";

const IncreaseAccountCountsModalMemo = () => {
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const sessionState = useStore((state) => state.sessionState);
  const setIsOpenChangeAccountCountsModal = useDashboardStore((state) => state.setIsOpenChangeAccountCountsModal);
  // ローディング
  const [loading, setLoading] = useState(false);
  // 新規で契約するアカウント個数
  const [accountQuantity, setAccountQuantity] = useState<number | null>(1);
  // 本日のお支払いが0円かどうか
  const [isFreeTodaysPayment, setIsFreeTodaysPayment] = useState(true);
  const [todaysPayment, setTodaysPayment] = useState(0);
  const [hoveredTodaysPayment, setHoveredTodaysPayment] = useState(false);
  // 変更後の次回支払い金額
  const [nextInvoice, setNextInvoice] = useState<Stripe.UpcomingInvoice | null>(null);
  // アカウント追加後の次回支払い料金の詳細モーダルを表示
  const [isOpenInvoiceDetail, setIsOpenInvoiceDetail] = useState(false);
  // 日割り料金の詳細モーダル
  const [isOpenNewProrationDetail, setIsOpenNewProrationDetail] = useState(false);
  const [isOpenOldProrationDetail, setIsOpenOldProrationDetail] = useState(false);
  // 支払い詳細モーダルがマウントされた時にtoggleFadeRefをtrue、アンマウントでfalseにしてfadeを初回ホバー時のみ適用する
  const nextPaymentDetailComponentRef = useRef<HTMLDivElement | null>(null);
  const toggleFadeRef = useRef(false);
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();

  // 支払い詳細モーダルのfadeクラスをトグル
  useEffect(() => {
    if (nextPaymentDetailComponentRef.current) {
      if (toggleFadeRef.current === true && isOpenInvoiceDetail) {
        // setTimeout(() => {
        //   toggleFadeRef.current = false;
        // }, 200);
        toggleFadeRef.current = false;
      }
      if (!isOpenInvoiceDetail && toggleFadeRef.current === false) {
        toggleFadeRef.current = true;
      }
    }
  }, [isOpenInvoiceDetail]);

  // 現在契約しているメンバーアカウント全てを取得して、契約アカウント数をlengthで取得
  const {
    data: memberAccountsDataArray,
    error: useQueryError,
    isLoading: useQueryIsLoading,
    refetch: refetchMemberAccounts,
  } = useQueryMemberAccounts();

  // 契約中のアカウント個数
  const currentAccountCounts = !!memberAccountsDataArray ? memberAccountsDataArray.length : 0;

  // Stripeのサブスクリプションのquantityを新たな数量に更新 現在のアカウント数と新たに追加するアカウント数を合算
  const totalAccountQuantity = currentAccountCounts + (accountQuantity ?? 0);

  // ===================== 🌟次回支払い情報のUpcomingInvoiceを取得 useQuery =====================
  // アカウント数を変えるごとにuseQueryを実行させないためにuseStateのisReadyをenableオプションに渡して、
  // 初回マウント時とアカウント数の最終確定後にuseQueryを起動させる

  // NextPaymentComponentでローカルStateを使用して計算するか否かを保持するState
  const [isLocalCalculationMode, setIsLocalCalculationMode] = useState(false);
  // ZustandでuseQueryのisReadyをグローバルStateとして保持
  const isReadyQueryInvoice = useDashboardStore((state) => state.isReadyQueryInvoice);
  const setIsReadyQueryInvoice = useDashboardStore((state) => state.setIsReadyQueryInvoice);
  // 請求期間(日数)State
  const [currentPeriodState, setCurrentPeriodState] = useState<number | null>(null);
  // プラン期間残り日数
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

  // ===================== 🌟次回支払い情報のUpcomingInvoiceを取得 useEffect =====================
  // 初回マウント時と「新たに増やすアカウント数」を変更して「料金計算」を押した時にStripeから比例配分のプレビューを取得
  useEffect(() => {
    if (!userProfileState) return alert("エラー：ユーザー情報が見つかりませんでした");
    if (!!nextInvoice) return console.log("既にnextInvoice取得済みのためリターン");

    const getUpcomingInvoice = async () => {
      if (!!nextInvoice) return console.log("既にnextInvoice取得済みのためリターン");
      console.log("getUpcomingInvoice関数実行 /retrieve-upcoming-invoiceへaxios.post()");
      try {
        const payload = {
          stripeCustomerId: userProfileState.stripe_customer_id,
          stripeSubscriptionId: userProfileState.stripe_subscription_id,
          changeQuantity: totalAccountQuantity, // 数量変更後の合計アカウント数
          changePlanName: null, // プラン変更ではないので、nullをセット
        };
        // type UpcomingInvoiceResponse = {
        //   data: any;
        //   error: string
        // }
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

        setNextInvoice(upcomingInvoiceData);
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
      }
    };
    getUpcomingInvoice();
  }, []);
  // ===================== ✅次回支払い情報のUpcomingInvoiceを取得 useEffect =====================

  // 追加費用 nextInvoice.lines.data[0].amountがマイナスの値のため引くためには加算でOK
  // const additionalCost =
  //   !!nextInvoice && !!nextInvoice?.lines?.data[1]?.amount
  //     ? nextInvoice.lines.data[1].amount + nextInvoice.lines.data[0].amount
  //     : null;

  // ================== 🌟StripeのInvoiceを取得してローカル計算が合っているか確認する関数 ==================
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
  const [isLoadingCalculation, setIsLoadingCalculation] = useState(false);
  const checkInvoiceStripeAndLocalCalculate = (_upcomingInvoiceData: Stripe.UpcomingInvoice) => {
    if (!userProfileState) return alert("エラー：ユーザー情報が見つかりませんでした");
    if (!memberAccountsDataArray) return alert("エラー：アカウント情報が見つかりませんでした");
    if (!currentPeriodState) return alert("エラー：請求期間データを取得できませんでした");
    if (!remainingDaysState) return alert("エラー：残り期間データを取得できませんでした");

    // ローディング開始
    setIsLoadingCalculation(true);

    setStripeRetrieveInvoice(_upcomingInvoiceData);

    // Stripeから取得したInvoiceの金額とローカルで計算した金額が一致しているかチェック

    // 新プランの1日当たりの料金
    const tempNewDailyRate =
      (_upcomingInvoiceData as Stripe.UpcomingInvoice)?.lines?.data[2]?.amount / currentPeriodState;
    const tempNewDailyRateWithThreeDecimalPoints = Math.round(tempNewDailyRate * 1000) / 1000;
    setStripeNewDailyRateWithThreeDecimalPoints(tempNewDailyRateWithThreeDecimalPoints);
    // 新プランの残り使用分の料金
    const tempNewUsageAmountWithThreeDecimalPoints = tempNewDailyRateWithThreeDecimalPoints * remainingDaysState;
    setStripeNewUsageAmountForRemainingPeriodWithThreeDecimalPoints(tempNewUsageAmountWithThreeDecimalPoints);
    // 旧プランの1日あたりの料金
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
    const tempNextInvoiceAmount =
      (_upcomingInvoiceData as Stripe.UpcomingInvoice)?.lines?.data[
        (_upcomingInvoiceData as Stripe.UpcomingInvoice)?.lines?.data.length - 1
      ]?.amount + tempAdditionalCost;
    setStripeNextInvoiceAmountState(tempNextInvoiceAmount);

    if (!!tempNextInvoiceAmount && tempNextInvoiceAmount === nextInvoiceAmountState) {
      console.log("チェック関数 テスト成功");
      console.log(
        "支払額 stripeのtempNextInvoiceAmount",
        tempNextInvoiceAmount,
        "ローカルnextInvoiceAmountState",
        nextInvoiceAmountState
      );
      console.log("追加費用 stripeのadditionalCost", tempAdditionalCost, "ローカルadditionalCost", additionalCostState);
      toast.success(`次回請求額がローカルと一致しました！`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } else {
      console.log("チェック関数 テスト結果 stripeの結果と一致せず");
      console.log(
        "支払額 stripeのtempNextInvoiceAmount",
        tempNextInvoiceAmount,
        "ローカルnextInvoiceAmountState",
        nextInvoiceAmountState
      );
      console.log(
        "追加費用 stripeのadditionalCost",
        tempAdditionalCost,
        "ローカルadditionalCostState",
        additionalCostState
      );
      toast.error(`stripeの結果と一致せず...`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
    // ローディング終了
    setIsLoadingCalculation(false);
  };
  // ================== ✅StripeのInvoiceを取得してローカル計算が合っているか確認する関数 ==================

  // ====================== 🌟「料金チェック」をクリック ======================
  const handleCheckStripeInvoiceAndLocal = () => {
    if (accountQuantity === 1 && !!upcomingInvoiceData) {
      console.log("🔥料金チェックをクリック 増やすアカウント数が1つのため、そのままチェック関数を実行🔥");
      checkInvoiceStripeAndLocalCalculate(upcomingInvoiceData);
    } else {
      console.log("🔥料金チェックをクリック isReadyQueryInvoiceをtrueに変更🔥");
      // useQueryのisReadyQueryInvoiceをtrueに変更して新たにuseQueryでInvoiceを取得する
      setIsReadyQueryInvoice(true);
    }
  };
  // ====================== ✅「料金チェック」をクリック ======================

  // ====================== 🌟アカウント数変更の度に新料金を計算してローカルStateに格納 ======================
  // ローカルで計算終了を表す
  const [calculationCompleted, setCalculationCompleted] = useState(true);
  useEffect(() => {
    // ローカルStateがnullならリターン
    if (!userProfileState) return console.log("ユーザーデータが無しのためリターン");
    if (!memberAccountsDataArray) return console.log("メンバーアカウンtpデータが無しのためリターン");
    if (!nextInvoiceAmountState) return console.log("Stripeインボイスデータがローカルに無しのためリターン");
    if (!currentPeriodState) return console.log("currentPeriodStateがローカルに無しのためリターン");
    if (!remainingDaysState) return console.log("remainingDaysStateがローカルに無しのためリターン");

    // プラン１アカウント月額費用
    const monthlyFeePerAccount = getPrice(userProfileState.subscription_plan); // プランの月額費用/ID
    // 新プラン料金
    const _newPlanAmount = monthlyFeePerAccount * totalAccountQuantity;
    // 新プランの1日当たりの料金
    const _newDailyRateThreeDecimalPoints = Math.round((_newPlanAmount / currentPeriodState) * 1000) / 1000;
    setNewDailyRateWithThreeDecimalPoints(_newDailyRateThreeDecimalPoints);
    // 新プランの残り期間までの使用量の金額
    const _newUsage = _newDailyRateThreeDecimalPoints * remainingDaysState;
    const _newUsageThreeDecimalPoints = Math.round(_newUsage * 1000) / 1000;
    setNewUsageAmountForRemainingPeriodWithThreeDecimalPoints(_newUsageThreeDecimalPoints);
    // 旧プランの1日あたりの料金
    const oldMonthlyFee = monthlyFeePerAccount * memberAccountsDataArray.length; // 旧プランの月額費用
    const _oldDailyRateThreeDecimalPoints = Math.round((oldMonthlyFee / currentPeriodState) * 1000) / 1000;
    setOldDailyRateWithThreeDecimalPoints(_oldDailyRateThreeDecimalPoints);
    // 旧プランの残り期間までの未使用分の金額
    const _oldUnused = _oldDailyRateThreeDecimalPoints * remainingDaysState;
    const _oldUnusedThreeDecimalPoints = Math.round(_oldUnused * 1000) / 1000;
    setOldUnusedAmountForRemainingPeriodWithThreeDecimalPoints(_oldUnusedThreeDecimalPoints);
    // 追加費用をローカルStateに格納
    const _additionalCost = Math.round(_newUsageThreeDecimalPoints) - Math.round(_oldUnusedThreeDecimalPoints);
    setAdditionalCostState(_additionalCost);
    // 次回お支払い額（追加費用上乗せ済み）
    const _nextInvoiceAmount = _newPlanAmount + _additionalCost;
    setNextInvoiceAmountState(_nextInvoiceAmount);
    console.log(
      "🔥新アカウント数で請求データをローカルで算出🔥",
      "新たなアカウント数",
      totalAccountQuantity,
      "新数量の月額料金",
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
      _oldUnusedThreeDecimalPoints
    );
  }, [accountQuantity]);
  // ====================== ✅アカウント数変更の度に料金を計算 ======================

  // ====================== 🌟useEffectでStripeInvoiceをローカルStateに格納 ======================
  // 初回マウント時の1個増やしたアカウント数のuseQueryで取得したUpcomingInvoiceをローカルStateに格納する
  // ローカルStateに格納する理由は、数量変更ごとにフェッチしてinvoiceの計算をするのではなく、
  // 数量の変更をローカルStateで保持してその数量分のinvoiceをクライアントサイドで算出することで無駄なフェッチを防ぐ

  useEffect(() => {
    if (!upcomingInvoiceData) return;
    if (upcomingInvoiceError) return;
    if (!userProfileState) return;
    if (!memberAccountsDataArray) return;

    const insertInvoiceToLocalState = () => {
      // StripeのInvoiceをローカルStateに格納
      setNextInvoice(upcomingInvoiceData);

      // 「請求期間（日数）」をローカルStateに格納
      const period = getPeriodInDays(upcomingInvoiceData.period_start, upcomingInvoiceData.period_end);
      setCurrentPeriodState(period);
      // 「残り日数」をローカルStateに格納
      const remaining = getRemainingDaysFromNowPeriodEndHourToTimestamp(upcomingInvoiceData.period_end).remainingDays;
      setRemainingDaysState(remaining);
      // 新数量プランの1日あたりの料金をローカルStateに格納 月額料金 / １ヶ月の日数
      const monthlyFeePerAccount = getPrice(userProfileState.subscription_plan); // プランの月額費用/ID
      const newMonthlyFee = monthlyFeePerAccount * totalAccountQuantity; // 新プランの月額費用
      const newDailyR = newMonthlyFee / period;
      const newTruncateDailyR = Math.round(newDailyR * 1000) / 1000; // 小数点第3位までを取得
      setNewDailyRateWithThreeDecimalPoints(newTruncateDailyR);
      // 新数量プラン残り期間までの利用分の金額
      const newUsage = newTruncateDailyR * remaining;
      const newTruncateUsage = Math.round(newUsage * 1000) / 1000;
      setNewUsageAmountForRemainingPeriodWithThreeDecimalPoints(newTruncateUsage);
      // 旧プラン（現在のプラン）の1日あたりの料金をローカルStateに格納 月額料金 / １ヶ月の日数
      const oldMonthlyFee = monthlyFeePerAccount * memberAccountsDataArray.length; // 旧プランの月額費用
      const oldDailyR = oldMonthlyFee / period;
      const oldTruncateDailyR = Math.round(oldDailyR * 1000) / 1000; // 小数点第3位までを取得
      setOldDailyRateWithThreeDecimalPoints(oldTruncateDailyR);
      // 旧プランの残り期間までの未使用分の金額
      const oldUnused = oldTruncateDailyR * remaining;
      const oldTruncateUnused = Math.round(oldUnused * 1000) / 1000;
      setOldUnusedAmountForRemainingPeriodWithThreeDecimalPoints(oldTruncateUnused);
      // 追加費用をローカルStateに格納
      const extraCharge = Math.round(newTruncateUsage) - Math.round(oldTruncateUnused);
      setAdditionalCostState(extraCharge);
      // 次回お支払い額（追加費用上乗せ済み）
      const totalPaymentDue = newMonthlyFee + extraCharge;
      setNextInvoiceAmountState(totalPaymentDue);
    };
    // ローカルStateにまだInvoiceが無くnullならuseQueryで取得したStripeのInvoiceを格納
    if (!nextInvoice) {
      console.log("🔥初回フェッチのみuseQueryで取得したinvoiceをローカルStateに格納🔥");
      insertInvoiceToLocalState();
    }
    // ２回目以降でisReadyQueryInvoiceのStateが変更されて、isReadyQueryInvoiceがtrueからfalseにした時にはuseQueryのフェッチが完了していることを示すためfalseの場合で、かつ、現在保持しているローカルStateの請求総額とuseQueryで取得した請求総額が異なるなら、新たにuseQueryで別のアカウント数でstripeからInvoiceを取得しているため、最新のInvoiceをローカルStateに格納する
    else if (
      !!nextInvoice &&
      !isReadyQueryInvoice &&
      !!nextInvoiceAmountState &&
      nextInvoiceAmountState !== upcomingInvoiceData.amount_due
    ) {
      console.log("🔥useQueryで新たに取得したinvoiceとローカルのInvoiceを比較チェック🔥");
      // insertInvoiceToLocalState();
      checkInvoiceStripeAndLocalCalculate(upcomingInvoiceData);
    }
  }, [isReadyQueryInvoice]);
  // ====================== ✅useEffectでStripeInvoiceをローカルStateに格納 ======================

  // const handleCheckInvoiceStripeAndLocalCalculate = async () => {
  //   if (!userProfileState) return alert("エラー：ユーザー情報が見つかりませんでした");
  //   if (!memberAccountsDataArray) return alert("エラー：アカウント情報が見つかりませんでした");
  //   if (!currentPeriodState) return alert("エラー：請求期間データを取得できませんでした");
  //   if (!remainingDaysState) return alert("エラー：残り期間データを取得できませんでした");

  //   console.log("handleCheckInvoiceStripeAndLocalCalculate関数実行 /retrieve-upcoming-invoiceへaxios.post()");
  //   try {
  //     const payload = {
  //       stripeCustomerId: userProfileState.stripe_customer_id,
  //       stripeSubscriptionId: userProfileState.stripe_subscription_id,
  //       changeQuantity: totalAccountQuantity, // 数量変更後の合計アカウント数
  //       changePlanName: null, // プラン変更ではないので、nullをセット
  //     };
  //     const {
  //       data: { data: upcomingInvoiceData, error: upcomingInvoiceError },
  //     } = await axios.post(`/api/subscription/retrieve-upcoming-invoice`, payload, {
  //       headers: {
  //         Authorization: `Bearer ${sessionState.access_token}`,
  //       },
  //     });
  //     if (!!upcomingInvoiceError) {
  //       console.log(
  //         "🌟Stripe将来のインボイス取得ステップ7 /retrieve-upcoming-invoiceへのaxios.postエラー",
  //         upcomingInvoiceError
  //       );
  //       throw new Error(upcomingInvoiceError);
  //     }
  //     console.log(
  //       "🌟Stripe将来のインボイス取得ステップ7 /retrieve-upcoming-invoiceへのaxios.postで次回のインボオスの取得成功",
  //       upcomingInvoiceData
  //     );
  //     setStripeRetrieveInvoice(upcomingInvoiceData);

  //     // Stripeから取得したInvoiceの金額とローカルで計算した金額が一致しているかチェック

  //     // 新プランの1日当たりの料金
  //     const tempNewDailyRate =
  //       (upcomingInvoiceData as Stripe.UpcomingInvoice)?.lines?.data[2]?.amount / currentPeriodState;
  //     const tempNewDailyRateWithThreeDecimalPoints = Math.round(tempNewDailyRate * 1000) / 1000;
  //     setStripeNewDailyRateWithThreeDecimalPoints(tempNewDailyRateWithThreeDecimalPoints);
  //     // 新プランの残り使用分の料金
  //     const tempNewUsageAmountWithThreeDecimalPoints = tempNewDailyRateWithThreeDecimalPoints * remainingDaysState;
  //     setStripeNewUsageAmountForRemainingPeriodWithThreeDecimalPoints(tempNewUsageAmountWithThreeDecimalPoints);
  //     // 旧プランの1日あたりの料金
  //     const _oldPlanAmount = getPrice(userProfileState.subscription_plan) * memberAccountsDataArray.length;
  //     const tempOldDailyRate = _oldPlanAmount / currentPeriodState;
  //     const tempOldDailyRateWithThreeDecimalPoints = Math.round(tempOldDailyRate * 1000) / 1000;
  //     setStripeOldDailyRateWithThreeDecimalPoints(tempOldDailyRateWithThreeDecimalPoints);
  //     // 旧プランの残り未使用分の料金
  //     const tempOldUnusedAmount = tempOldDailyRateWithThreeDecimalPoints * remainingDaysState;
  //     const tempOldUnusedAmountWithThreeDecimalPoints = Math.round(tempOldUnusedAmount * 1000) / 1000;
  //     setStripeOldUnusedAmountForRemainingPeriodWithThreeDecimalPoints(tempOldUnusedAmountWithThreeDecimalPoints);
  //     // 追加費用
  //     const tempAdditionalCost =
  //       Math.round(tempNewUsageAmountWithThreeDecimalPoints) - Math.round(tempOldUnusedAmountWithThreeDecimalPoints);
  //     setStripeAdditionalCostState(tempAdditionalCost);
  //     // 次回の支払額
  //     const tempNextInvoice =
  //       (upcomingInvoiceData as Stripe.UpcomingInvoice)?.lines?.data[
  //         (upcomingInvoiceData as Stripe.UpcomingInvoice)?.lines?.data.length - 1
  //       ]?.amount + tempAdditionalCost;
  //     setStripeNextInvoiceAmountState(tempNextInvoice);

  //     if (!!tempNextInvoice && tempNextInvoice === nextInvoiceAmountState) {
  //       console.log("チェック関数 テスト成功");
  //       console.log(
  //         "支払額 stripeのnextInvoice",
  //         tempNextInvoice,
  //         "ローカルnextInvoiceAmountState",
  //         nextInvoiceAmountState
  //       );
  //       console.log(
  //         "追加費用 stripeのadditionalCost",
  //         tempAdditionalCost,
  //         "ローカルadditionalCost",
  //         additionalCostState
  //       );
  //       toast.success(`次回請求額がローカルと一致しました！`, {
  //         position: "top-right",
  //         autoClose: 5000,
  //         hideProgressBar: false,
  //         closeOnClick: true,
  //         pauseOnHover: true,
  //         draggable: true,
  //         progress: undefined,
  //       });
  //     } else {
  //       console.log("チェック関数 テスト成功");
  //       console.log(
  //         "支払額 stripe nextInvoice",
  //         tempNextInvoice,
  //         "ローカル nextInvoiceAmountState",
  //         nextInvoiceAmountState
  //       );
  //       console.log(
  //         "追加費用 stripe additionalCost",
  //         tempAdditionalCost,
  //         "ローカル additionalCost",
  //         additionalCostState
  //       );
  //       toast.error(`請求金額の取得に失敗しました...`, {
  //         position: "top-right",
  //         autoClose: 5000,
  //         hideProgressBar: false,
  //         closeOnClick: true,
  //         pauseOnHover: true,
  //         draggable: true,
  //         progress: undefined,
  //       });
  //     }
  //   } catch (e: any) {
  //     console.error(`getUpcomingInvoice関数実行エラー: `, e);
  //     toast.error(`請求金額の取得に失敗しました...`, {
  //       position: "top-right",
  //       autoClose: 5000,
  //       hideProgressBar: false,
  //       closeOnClick: true,
  //       pauseOnHover: true,
  //       draggable: true,
  //       progress: undefined,
  //     });
  //   }
  // };
  // ===================== ✅StripeのInvoiceを取得してローカル計算が合っているか確認 =====================

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

  // useEffect(() => {
  //   if (!upcomingInvoiceData) return;
  //   if (upcomingInvoiceError) return;

  //   if (!nextInvoice) {
  //     setNextInvoice(upcomingInvoiceData);
  //   } else if (
  //     !!nextInvoice &&
  //     nextInvoice.lines?.data[nextInvoice?.lines?.data.length - 1]?.quantity !==
  //       upcomingInvoiceData.lines?.data[upcomingInvoiceData.lines?.data.length - 1]?.quantity
  //   ) {
  //     setNextInvoice(upcomingInvoiceData);
  //   }
  // }, []);
  // ===================== ✅次回支払い情報のUpcomingInvoiceを取得 useQuery =====================

  // 初回マウント時のみユーザーが契約中のサブスクリプションの次回支払い期限が今日か否かと、
  // 今日の場合は支払い時刻を過ぎているかどうか確認して過ぎていなければ0円でなくする
  useEffect(() => {
    if (!userProfileState || !userProfileState.current_period_end) return;
    console.log("useEffect実行 期間終了日が今日か確認");
    // まずは、現在の日付と時刻、およびcurrent_period_endの日付と時刻をUTCで取得します。
    const currentDate = new Date();
    const currentPeriodEndDate = new Date(userProfileState.current_period_end); // これはサンプルの値で、実際にはsupabaseから取得した値を使用します。

    const isSameDay =
      currentDate.getUTCFullYear() === currentPeriodEndDate.getUTCFullYear() &&
      currentDate.getUTCMonth() === currentPeriodEndDate.getUTCMonth() &&
      currentDate.getUTCDate() === currentPeriodEndDate.getUTCDate();

    if (isSameDay) {
      // 今日がcurrent_period_endの日付と一致している場合、次に時間の比較を行います。
      if (
        currentDate.getUTCHours() >= currentPeriodEndDate.getUTCHours() &&
        currentDate.getUTCMinutes() >= currentPeriodEndDate.getUTCMinutes() &&
        currentDate.getUTCSeconds() >= currentPeriodEndDate.getUTCSeconds()
      ) {
        // 現在の時刻がcurrent_period_endの時刻を過ぎている場合の処理
        // 例: 「本日のお支払い」の値を0円にする
        setIsFreeTodaysPayment(true);
        setTodaysPayment(0);
      } else {
        // 現在の時刻がcurrent_period_endの時刻を過ぎていない場合の処理
        setIsFreeTodaysPayment(false);
        // 現在の契約プラン * (現在の契約アカウント数 + 新たに契約するアカウント数) = 本日のお支払い
        const paymentValue =
          getPrice(userProfileState.subscription_plan) * (currentAccountCounts + (accountQuantity ?? 0));
        setTodaysPayment(paymentValue);
      }
    } else {
      // 今日がcurrent_period_endの日付と一致していない場合の処理
      setIsFreeTodaysPayment(true);
      setTodaysPayment(0);
    }
  }, [userProfileState]);

  // =========================== 支払い詳細モーダルの表示後fade02をremove 非表示でadd ===========================
  // useEffect(() => {
  //   if (!nextPaymentDetailComponentRef.current) return;
  //   if (isOpenInvoiceDetail && !!nextPaymentDetailComponentRef.current) {
  //     nextPaymentDetailComponentRef.current?.classList.remove(`fade02`);
  //   } else if (!isOpenInvoiceDetail) {
  //     nextPaymentDetailComponentRef.current?.classList.add(`fade02`);
  //   }
  // }, [isOpenInvoiceDetail, nextPaymentDetailComponentRef]);
  // =========================== 支払い詳細モーダルの表示後fade02をremove 非表示でadd ===========================
  // =========================== 変更の確定をクリック Stripeに送信 ===========================
  const [progressRate, setProgressRate] = useState(0);
  const handleChangeQuantity = async () => {
    console.log("変更の確定クリック プランと数量", userProfileState?.subscription_plan, accountQuantity);
    if (!userProfileState) return alert("エラー：ユーザー情報が確認できませんでした");
    if (!sessionState) return alert("エラー：セッション情報が確認できませんでした");
    if (!accountQuantity) return alert("エラー：追加するアカウント数が選択されていません");
    setLoading(true);

    try {
      console.log("🌟axiosでAPIルートに送信 合計個数", totalAccountQuantity);
      const payload = {
        stripeCustomerId: userProfileState.subscription_stripe_customer_id,
        newQuantity: totalAccountQuantity,
        changeType: "increase",
        companyId: userProfileState.company_id,
        subscriptionId: userProfileState.subscription_id,
        userProfileId: userProfileState.id,
        alreadyHaveSchedule: false, // decrease用の削除リクエストスケジュールがあるかどうか用
        deleteAccountRequestSchedule: null, // decrease用の削除リクエストスケジュール用
      };
      const {
        data: { subscriptionItem, error: axiosStripeError },
      } = await axios.post(`/api/subscription/change-quantity`, payload, {
        headers: {
          Authorization: `Bearer ${sessionState.access_token}`,
        },
      });
      console.log(`🔥handleChangeQUantity Apiからのdata, axiosStripeError`, subscriptionItem, axiosStripeError);

      if (axiosStripeError) throw new Error(axiosStripeError);

      // 新たに増やすアカウント数分、supabaseのsubscribed_accountsテーブルにINSERT
      const { error: insertSubscribedAccountsError } = await supabase.rpc("insert_subscribed_accounts_all_at_once", {
        new_account_quantity: accountQuantity,
        new_company_id: userProfileState.company_id,
        new_subscription_id: userProfileState.subscription_id,
      });

      if (insertSubscribedAccountsError) throw new Error(insertSubscribedAccountsError.message);
      console.log("🌟Stripeステップ7 supabaseの契約アカウントを指定個数分、新たに作成成功");

      // const promises = [...Array(accountQuantity)].map(() => {
      //   return null;
      // });
      // await Promise.all(promises);
      console.log("全て完了 キャッシュを更新");

      // キャッシュを最新状態に反映
      //   await queryClient.invalidateQueries({ queryKey: ["change_team_owner_notifications"] });
      //   await queryClient.invalidateQueries({ queryKey: ["my_notifications"] });
      await queryClient.invalidateQueries({ queryKey: ["member_accounts"] });

      toast.success(`アカウント数の変更が完了しました!`, {
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
      toast.error(`アカウント数の変更に失敗しました!`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
    setLoading(false);
  };

  // ================================ ツールチップ ================================
  const [hoveredNewProration, setHoveredNewProration] = useState(false);
  const [hoveredOldProration, setHoveredOldProration] = useState(false);
  // ================================ ツールチップ ここまで ================================

  console.log(
    "🌟IncreaseAccountCountsModalコンポーネントレンダリング",

    "現在契約中のアカウント個数",
    currentAccountCounts,
    "新たに追加するアカウント数",
    accountQuantity,
    "追加後のアカウント数合計",
    totalAccountQuantity,
    "useQueryメンバーアカウント",
    memberAccountsDataArray,
    "本日のお支払が0かどうかと、本日の支払い額",
    isFreeTodaysPayment,
    todaysPayment,
    "💡useQueryエラー",
    upcomingInvoiceError,
    // "💡useQueryで取得 変更後のアカウント合計の次回請求額プレビュー(比例配分あり) nextInvoice",
    "💡変更後のアカウント合計の次回請求額プレビュー(比例配分あり)ローカルStateのnextInvoice",
    nextInvoice,
    // "アカウント追加後の次回追加費用",
    // additionalCost,
    "請求期間",
    currentPeriod,
    "isReadyQueryInvoice",
    isReadyQueryInvoice,
    "================================ ローカルState",
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
    "================================ Stripeから取得したInvoice",
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
    (stripeRetrieveInvoice as Stripe.UpcomingInvoice)?.lines?.data[
      (stripeRetrieveInvoice as Stripe.UpcomingInvoice)?.lines?.data.length - 1
    ]?.amount
  );

  // ====================== 🌟StripeのInvoiceとローカルのチェックコンポーネント ======================
  const CheckInvoiceStripeLocalModal = () => {
    return (
      <div className="absolute right-0 top-0 z-[29] flex min-h-[100%] w-7/12 flex-col rounded-r-[8px] border-l border-solid border-[var(--color-border-base)] bg-[var(--color-bg-base)]">
        <div className="relative flex w-full items-center border-b border-solid border-[--color-border-base] py-[20px] text-[13px] text-[var(--color-text-title)]">
          <div className="flex-center w-[50%] border-r border-solid border-[--color-border-base]">
            <span className="mr-[20px]">請求期間：{currentPeriodState}</span>
            <span>プラン期間残り日数：{remainingDaysState}</span>
          </div>
          <div className="flex-center w-[25%] border-x border-solid border-[--color-border-base]">ローカル算出結果</div>
          <div className="flex-center w-[25%]">StripeのInvoice</div>
        </div>
        <div className="relative flex w-full items-center border-b border-solid border-[--color-border-base] py-[20px] text-[13px] text-[var(--color-text-title)]">
          <div className="flex-center w-[50%] border-r border-solid border-[--color-border-base]">
            新プランの1日当たり料金
          </div>
          <div className="flex-center w-[25%] border-x border-solid border-[--color-border-base]">
            {newDailyRateWithThreeDecimalPoints}
          </div>
          <div className="flex-center w-[25%]">{stripeNewDailyRateWithThreeDecimalPoints ?? `-`}</div>
        </div>
        <div className="relative flex w-full items-center border-b border-solid border-[--color-border-base] py-[20px] text-[13px] text-[var(--color-text-title)]">
          <div className="flex-center w-[50%] border-r border-solid border-[--color-border-base]">
            新プランの残り期間までの利用分の金額
          </div>
          <div className="flex-center w-[25%] border-x border-solid border-[--color-border-base]">
            {newUsageAmountForRemainingPeriodWithThreeDecimalPoints}
          </div>
          <div className="flex-center w-[25%]">
            {stripeNewUsageAmountForRemainingPeriodWithThreeDecimalPoints ?? `-`}
          </div>
        </div>
        <div className="relative flex w-full items-center border-b border-solid border-[--color-border-base] py-[20px] text-[13px] text-[var(--color-text-title)]">
          <div className="flex-center w-[50%] border-r border-solid border-[--color-border-base]">
            旧プランの月額料金の1日あたりの料金
          </div>
          <div className="flex-center w-[25%] border-x border-solid border-[--color-border-base]">
            {oldDailyRateWithThreeDecimalPoints}
          </div>
          <div className="flex-center w-[25%]">{stripeOldDailyRateWithThreeDecimalPoints ?? `-`}</div>
        </div>
        <div className="relative flex w-full items-center border-b border-solid border-[--color-border-base] py-[20px] text-[13px] text-[var(--color-text-title)]">
          <div className="flex-center w-[50%] border-r border-solid border-[--color-border-base]">
            旧プランの残り期間までの未使用分の金額
          </div>
          <div className="flex-center w-[25%] border-x border-solid border-[--color-border-base]">
            {oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints}
          </div>
          <div className="flex-center w-[25%]">
            {stripeOldUnusedAmountForRemainingPeriodWithThreeDecimalPoints ?? `-`}
          </div>
        </div>
        <div className="relative flex w-full items-center border-b border-solid border-[--color-border-base] py-[20px] text-[13px] text-[var(--color-text-title)]">
          <div className="flex-center w-[50%] border-r border-solid border-[--color-border-base]">追加費用</div>
          <div className="flex-center w-[25%] border-x border-solid border-[--color-border-base]">
            {additionalCostState}
          </div>
          <div className="flex-center w-[25%]">{stripeAdditionalCostState ?? `-`}</div>
        </div>
        <div className="relative flex w-full items-center border-b border-solid border-[--color-border-base] py-[20px] text-[13px] text-[var(--color-text-title)]">
          <div className="flex-center w-[50%] border-r border-solid border-[--color-border-base]">
            次回の支払額(追加費用上乗せ済み)
          </div>
          <div className="flex-center w-[25%] border-x border-solid border-[--color-border-base]">
            {nextInvoiceAmountState}
          </div>
          <div className="flex-center w-[25%]">{stripeNextInvoiceAmountState ?? `-`}</div>
        </div>
      </div>
    );
  };

  // ====================== 🌟本日のお支払いコンポーネント ======================
  const TodaysPaymentDetailComponent = () => {
    return (
      <div className="border-real fade02 absolute bottom-[100%] left-[50%] z-10 flex min-h-[50px] min-w-[100px] translate-x-[-50%] flex-col rounded-[8px] bg-[var(--color-edit-bg-solid)] px-[20px] py-[20px]">
        <div className="flex w-full items-center pb-[30px]">
          {!!userProfileState && userProfileState.current_period_end && (
            <p>
              本日{format(new Date(userProfileState.current_period_end), "yyyy年MM月dd日 HH:mm")}
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
            <span>{getPrice(userProfileState?.subscription_plan)}</span>
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
          {/* {isOpenNewProrationDetail && (
            <ProrationDetails
              planType="new"
              currentPeriod={currentPeriod}
              nextInvoice={nextInvoice}
              remainingDays={remainingDays}
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
              setIsOpenNewProrationDetail={setIsOpenNewProrationDetail}
              setIsOpenOldProrationDetail={setIsOpenOldProrationDetail}
            />
          )} */}
          {isOpenNewProrationDetail && <ProrationDetails planType="new" />}
          {isOpenOldProrationDetail && <ProrationDetails planType="old" />}
          <div className="flex w-full flex-col pb-[25px]">
            <p className="text-[14px] font-normal">
              下記は本日、
              <span className="font-bold">
                {format(new Date(nextInvoice.subscription_proration_date * 1000), "yyyy年MM月dd日")}
              </span>
              にアカウントを増やした場合のお支払額となります。
            </p>
            <p className="mt-[8px] font-normal text-[var(--color-text-sub)]">
              今月の期間（
              {format(new Date(nextInvoice.period_start * 1000), "MM月dd日")}〜
              {format(new Date(nextInvoice.period_end * 1000), "MM月dd日")}）から
              {elapsedDays === 0 ? `${hours}時間${minutes}分` : `${elapsedDays}日`}が経過して、終了日まで
              <span className="font-bold">
                残り
                {!!remainingDays && remainingDays === 0
                  ? `${remainingHours}時間${remainingMinutes}分`
                  : `${remainingDays}日`}
              </span>
              です。
            </p>
          </div>

          {/* ２列目 新たなプラン・数量での計算式 */}
          {/* ２列目タイトル */}
          <div className="flex w-full items-center pb-[8px]">
            <h4 className="text-[14px] font-bold">○更新後の新プラン料金</h4>
          </div>
          {/* ２列目コンテンツ */}
          <div className="item-center flex h-auto w-full space-x-[24px] truncate pb-[20px]">
            <div className="flex-col-center relative">
              <div className="mb-[5px] flex min-h-[36px] min-w-[160px] items-center justify-center">
                <IoPricetagOutline className="ml-[-22px] mr-[10px] stroke-[3] text-[18px] text-[#1DA1F2]" />
                {/* <div className="flex-col-center mb-[5px] inline-flex min-h-[36px] min-w-[160px] text-[#FFD600]"> */}
                <div className="flex-col-center inline-flex">
                  <span className="text-[12px] font-normal">新プラン料金</span>
                  <span className="text-[12px] font-normal">(毎月の請求額)</span>
                </div>
              </div>
              <span>
                {!!userProfileState?.subscription_plan
                  ? `${formatToJapaneseYen(
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
                  ({!!userProfileState?.subscription_plan ? getPlanName(userProfileState.subscription_plan) : `-`})
                </span>
              </div>
              <span>
                {!!userProfileState?.subscription_plan
                  ? `${formatToJapaneseYen(getPrice(userProfileState.subscription_plan), true)}/月`
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
            <h4 className="text-[14px] font-bold">○次回請求時の追加費用</h4>
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
              {hoveredNewProration && (
                <div className={`${styles.tooltip_right_area} transition-base fade pointer-events-none`}>
                  <div className={`${styles.tooltip_right} `}>
                    <div className={`flex-center ${styles.dropdown_item}`}>
                      {/* {theme === "light" ? "ダークモードに切り替え" : "ライトモードに切り替え"} */}
                      詳細を確認する
                    </div>
                  </div>
                  <div className={`${styles.tooltip_right_arrow}`}></div>
                </div>
              )}
              {/* ツールチップ ここまで */}
              <div className="flex-col-center mb-[5px] inline-flex min-h-[36px] min-w-[160px]">
                <span className="text-[12px] font-normal">プラン残り期間まで利用する</span>
                <span className="text-[12px] font-normal">新プランの日割り料金</span>
              </div>
              <div
                className={`flex-center relative cursor-pointer ${
                  isOpenNewProrationDetail
                    ? `text-[var(--color-text-brand-f)]`
                    : `peer group-hover:text-[var(--color-text-brand-f)]`
                }`}
                onClick={() => {
                  setHoveredNewProration(false);
                  setIsOpenNewProrationDetail(true);
                }}
                onMouseEnter={() => setHoveredNewProration(true)}
                onMouseLeave={() => setHoveredNewProration(false)}
              >
                <ImInfo
                  className={`ml-[-10px] mr-[8px] ${
                    isOpenNewProrationDetail
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
                  isOpenNewProrationDetail
                    ? `bg-[var(--color-bg-brand-f)]`
                    : `bg-[var(--color-border-deep)] peer-hover:bg-[var(--color-bg-brand-f)]`
                }`}
              />
            </div>
            <div className="flex-col-center">
              <span className="text-[16px]">＋</span>
            </div>

            <div className="flex-col-center group relative">
              {/* ツールチップ */}
              {hoveredOldProration && (
                <div className={`${styles.tooltip_right_area} transition-base fade pointer-events-none`}>
                  <div className={`${styles.tooltip_right} `}>
                    <div className={`flex-center ${styles.dropdown_item}`}>
                      {/* {theme === "light" ? "ダークモードに切り替え" : "ライトモードに切り替え"} */}
                      詳細を確認する
                    </div>
                  </div>
                  <div className={`${styles.tooltip_right_arrow}`}></div>
                </div>
              )}
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
                  setHoveredOldProration(false);
                  setIsOpenOldProrationDetail(true);
                }}
                onMouseEnter={() => setHoveredOldProration(true)}
                onMouseLeave={() => setHoveredOldProration(false)}
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
                        true
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
                  isOpenOldProrationDetail
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
                  ? `${formatToJapaneseYen(
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
  // ====================== 🌟日割り料金の詳細コンポーネント ======================
  const ProrationDetails = ({ planType }: { planType: "new" | "old" }) => {
    if (!userProfileState?.subscription_plan) return null;
    if (!memberAccountsDataArray) return null;
    if (!nextInvoice) return null;
    if (!nextInvoice.subscription_proration_date) return null;

    const planFeePerAccount = getPrice(userProfileState.subscription_plan) ?? null;
    const newPlanAmount = planFeePerAccount * totalAccountQuantity ?? null;
    const oldPlanAmount = planFeePerAccount * memberAccountsDataArray.length ?? null;

    return (
      <>
        {/* オーバーレイ */}
        {planType === "new" && (
          <div
            className="absolute left-0 top-0 z-[100] h-full w-full cursor-pointer rounded-[8px]"
            onClick={() => setIsOpenNewProrationDetail(false)}
          ></div>
        )}
        {planType === "old" && (
          <div
            className="absolute left-0 top-0 z-[100] h-full w-full cursor-pointer rounded-[8px]"
            onClick={() => setIsOpenOldProrationDetail(false)}
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
          className={`shadow-all-md-center absolute left-[50%] top-[0] z-[150] flex max-h-[51%] min-h-[50%] min-w-[100%] translate-x-[-50%] flex-col rounded-[8px] border border-solid border-[var(--color-bg-brand-f)] bg-[var(--color-edit-bg-solid)] px-[24px] py-[16px]`}
        >
          {/* クローズボタン */}
          {planType === "new" && (
            <button
              className={`flex-center group absolute right-[20px] top-[10px] z-50 h-[32px] w-[32px] rounded-full bg-[#00000000] hover:bg-[var(--color-bg-sub-re-hover)]`}
              onClick={() => setIsOpenNewProrationDetail(false)}
            >
              <MdClose className="text-[20px] text-[var(--color-text-title)]" />
            </button>
          )}
          {planType === "old" && (
            <button
              className={`flex-center group absolute right-[20px] top-[10px] z-50 h-[32px] w-[32px] rounded-full bg-[#00000000] hover:bg-[var(--color-bg-sub-re-hover)]`}
              onClick={() => setIsOpenOldProrationDetail(false)}
            >
              <MdClose className="text-[20px] text-[var(--color-text-title)]" />
            </button>
          )}
          {/* クローズボタン ここまで */}
          <div className="flex w-full items-center">
            <h4 className="text-[16px] font-bold text-[var(--color-text-title)]">
              {planType === "new"
                ? `新プランの残り期間使用分の日割り料金の詳細`
                : `旧プランの未使用分の日割り料金の詳細`}
            </h4>
          </div>
          <div className="fade03 mt-[12px] flex w-full flex-col space-y-[12px] text-[14px] font-normal">
            <p className="flex items-center space-x-[8px]">
              <span className="text-[16px] font-bold">・</span>
              <span className="!ml-[4px]">今月の契約期間</span>
              <span>：</span>
              <span className="font-bold">
                {format(new Date(nextInvoice.period_start * 1000), "yyyy年MM月dd日")}〜
                {format(new Date(nextInvoice.period_end * 1000), "yyyy年MM月dd日")}
                {!!currentPeriodState ? `（${currentPeriodState}日間）` : ``}
                {/* {!!currentPeriod ? `（${currentPeriod}日間）` : ``} */}
              </span>
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
                  {!!remainingDaysState ? `${remainingDaysState}日間` : `-`}
                  {/* {!!remainingDays ? `${remainingDays}日間` : `-`} */}
                  {/* {!!elapsedDays ? `（開始日から${elapsedDays}日経過）` : `-`} */}
                </span>
              </p>
            </div>
            <p className="flex items-center space-x-[8px]">
              <span className="text-[16px] font-bold">・</span>
              <span className="!ml-[4px]">{planType === "new" ? `新プランの価格` : `旧プランの価格`}</span>
              <span>：</span>
              {planType === "new" && (
                <span className="font-bold">
                  {!!newPlanAmount ? `${newPlanAmount}円` : `-`}
                  {/* {!!nextInvoice?.lines?.data[2]?.amount ? `${nextInvoice.lines.data[2].amount}円` : `-`} */}
                  {/* {!!nextInvoice?.lines?.data[2]?.amount
                    ? `${formatToJapaneseYen(nextInvoice.lines.data[2].amount, false)}円`
                    : `-`} */}
                </span>
              )}{" "}
              {planType === "old" && (
                <span className="font-bold">
                  {!!oldPlanAmount ? `${oldPlanAmount}円` : `-`}
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
                  {!!planFeePerAccount ? `${planFeePerAccount}/月` : `-`}
                  {/* {!!nextInvoice?.lines?.data[2]?.plan?.amount ? `${nextInvoice.lines.data[2].plan?.amount}/月` : `-`} */}
                  {/* {!!nextInvoice?.lines?.data[2]?.plan?.amount
                    ? `${formatToJapaneseYen(nextInvoice.lines.data[2].plan?.amount, true)}/月`
                    : `-`} */}
                </span>
              )}
              {planType === "old" && (
                <span>
                  {!!planFeePerAccount ? `${planFeePerAccount}/月` : `-`}
                  {/* {!!nextInvoice?.lines?.data[0]?.plan?.amount ? `${nextInvoice.lines.data[0].plan?.amount}/月` : `-`} */}
                  {/* {!!nextInvoice?.lines?.data[0]?.plan?.amount
                    ? `${formatToJapaneseYen(nextInvoice.lines.data[0].plan?.amount, true)}/月`
                    : `-`} */}
                </span>
              )}
              <span>×</span>
              {planType === "new" && (
                <span>
                  {!!totalAccountQuantity ? `${totalAccountQuantity}個` : `-`}
                  {/* {!!nextInvoice?.lines?.data[2]?.quantity ? `${nextInvoice.lines.data[2].quantity}個` : `-`} */}
                  {/* {!!nextInvoice?.lines?.data[2]?.quantity
                    ? `${formatToJapaneseYen(nextInvoice.lines.data[2].quantity, false)}個`
                    : `-`} */}
                </span>
              )}
              {planType === "old" && (
                <span>
                  {!!memberAccountsDataArray ? `${memberAccountsDataArray.length}個` : `-`}
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
                  {!!newDailyRateWithThreeDecimalPoints ? `${newDailyRateWithThreeDecimalPoints}円/日` : `-`}
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
                  {oldDailyRateWithThreeDecimalPoints ? `${oldDailyRateWithThreeDecimalPoints}円/日` : `-`}
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
                  {!!newPlanAmount ? `${newPlanAmount}円` : `-`}
                  {/* {!!nextInvoice?.lines?.data[2]?.amount ? `${nextInvoice.lines.data[2].amount}円` : `-`} */}
                  {/* {!!nextInvoice?.lines?.data[2]?.amount
                    ? `${formatToJapaneseYen(nextInvoice.lines.data[2].amount, false)}円`
                    : `-`} */}
                </span>
              )}
              {planType === "old" && (
                <span className="font-bold">
                  {!!oldPlanAmount ? `${oldPlanAmount}円` : `-`}
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
              <span>{!!currentPeriod ? `${currentPeriod}日` : `-`}</span>
            </p>
            <p className="flex items-center space-x-[8px]">
              <span className="text-[16px] font-bold">・</span>
              <span className="!ml-[4px] min-w-[224px]">
                {planType === "new" ? `新プランの残り利用分の日割り料金` : `旧プランの未使用分の日割り料金`}
              </span>
              <span>：</span>
              {planType === "new" && (
                <span className="font-bold text-[var(--color-text-brand-f)] underline underline-offset-1">
                  {!!newUsageAmountForRemainingPeriodWithThreeDecimalPoints
                    ? `${formatToJapaneseYen(
                        Math.round(newUsageAmountForRemainingPeriodWithThreeDecimalPoints),
                        false
                      )}円`
                    : `-`}
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
                  {!!oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints
                    ? `${formatToJapaneseYen(
                        Math.round(oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints),
                        false,
                        false
                      )}円`
                    : `-`}
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
                  {!!newDailyRateWithThreeDecimalPoints ? `${newDailyRateWithThreeDecimalPoints}円/日` : `-`}
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
                  {!!oldDailyRateWithThreeDecimalPoints ? `${oldDailyRateWithThreeDecimalPoints}円/日` : `-`}
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

              {planType === "new" && <span>{!!remainingDaysState ? `残り${remainingDaysState}日` : `-`}</span>}
              {/* {planType === "new" && <span>{!!remainingDays ? `残り${remainingDays}日` : `-`}</span>} */}
              {planType === "old" && <span>{!!remainingDaysState ? `残り${remainingDaysState}日` : `-`}</span>}
              {/* {planType === "old" && <span>{!!remainingDays ? `残り${remainingDays}日` : `-`}</span>} */}
            </p>
            <p className="!mt-[2px] flex items-center space-x-[8px]">
              <span className="min-w-[210px]"></span>
              <span className=""></span>
              <span className="text-[13px] text-[var(--color-text-sub)]">
                （
                {planType === "new" &&
                  `${
                    !!newUsageAmountForRemainingPeriodWithThreeDecimalPoints
                      ? `${newUsageAmountForRemainingPeriodWithThreeDecimalPoints}円`
                      : `-`
                  }`}
                {/* {planType === "new" &&
                  `${
                    !!nextInvoice?.lines?.data[2]?.amount && !!currentPeriod && !!remainingDays
                      ? `${
                          (Math.round((nextInvoice.lines.data[2].amount / currentPeriod) * 1000) / 1000) * remainingDays
                        }円`
                      : `-`
                  }`} */}
                {/* {planType === "new" &&
                  `${
                    !!nextInvoice?.lines?.data[2]?.amount && !!currentPeriod && !!remainingDays
                      ? `${formatToJapaneseYen(
                          (Math.round((nextInvoice.lines.data[2].amount / currentPeriod) * 1000) / 1000) *
                            remainingDays,
                          false
                        )}円`
                      : `-`
                  }`} */}
                {planType === "old" &&
                  `${
                    !!oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints
                      ? `${oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints}円`
                      : `-`
                  }`}
                {/* {planType === "old" &&
                  `${
                    !!nextInvoice?.lines?.data[0]?.plan?.amount &&
                    !!nextInvoice?.lines?.data[0]?.quantity &&
                    !!currentPeriod &&
                    !!remainingDays
                      ? `${
                          Math.round(
                            (Math.round(
                              ((nextInvoice?.lines?.data[0]?.plan?.amount * nextInvoice?.lines?.data[0]?.quantity) /
                                currentPeriod) *
                                1000
                            ) /
                              1000) *
                              remainingDays *
                              1000
                          ) / 1000
                        }円`
                      : `-`
                  }`} */}
                {/* `${
                    !!nextInvoice?.lines?.data[0]?.plan?.amount &&
                    !!nextInvoice?.lines?.data[0]?.quantity &&
                    !!currentPeriod &&
                    !!remainingDays
                      ? `${formatToJapaneseYen(
                          Math.round(
                            (Math.round(
                              ((nextInvoice?.lines?.data[0]?.plan?.amount * nextInvoice?.lines?.data[0]?.quantity) /
                                currentPeriod) *
                                1000
                            ) /
                              1000) *
                              remainingDays *
                              1000
                          ) / 1000,
                          false
                        )}円`
                      : `-`
                  }`} */}
                を四捨五入）
              </span>
            </p>
          </div>
        </div>
      </>
    );
  };
  // ====================== ✅日割り料金の詳細コンポーネント ここまで ======================

  return (
    <>
      {/* <div className={`${styles.overlay} `} onClick={handleCancelAndReset} /> */}
      <div className={`${styles.overlay} `} onClick={() => setIsOpenChangeAccountCountsModal(null)} />

      <div className={`${styles.container} `}>
        {/* 次回請求期間のお支払いの詳細モーダルを開いた時のオーバーレイ */}
        {isOpenInvoiceDetail && (
          <div className={`clear_overlay_absolute fade03 pointer-events-none z-20 rounded-[8px] bg-[#00000033]`}></div>
        )}
        {/* <div className={`clear_overlay_absolute fade02 pointer-events-none z-20 rounded-[8px] bg-[#00000033]`}></div> */}
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
        <button
          className={`flex-center group absolute right-[-40px] top-[52px] z-10 h-[32px] w-[32px] rounded-full bg-[#00000070] hover:bg-[#000000c0]`}
          onClick={() => setIsOpenCheckInvoiceStripeLocalModal(!isOpenCheckInvoiceStripeLocalModal)}
        >
          {!isOpenCheckInvoiceStripeLocalModal && <FaChevronRight className="text-[16px] text-[#fff]" />}
          {isOpenCheckInvoiceStripeLocalModal && <FaChevronLeft className="text-[16px] text-[#fff]" />}
        </button>
        {/* メインコンテンツ コンテナ */}
        <div className={`${styles.main_contents_container}`}>
          {!isOpenCheckInvoiceStripeLocalModal && <CheckInvoiceStripeLocalModal />}
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
              {/* <div className="mt-[16px] w-full">
                <div
                  className="flex max-w-fit cursor-pointer items-center space-x-2 text-[var(--color-text-sub)] hover:text-[var(--color-text-brand-f)] hover:underline"
                >
                  <AiOutlinePlus className="h-[14px] w-[14px] stroke-2 text-[14px]" />
                  <span>他のメンバーを追加</span>
                </div>
              </div> */}
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
                    <span className="max-w-[290px]">アカウントを増やした場合に次回請求で発生する追加費用</span>
                    {/* <span className="">￥{(accountQuantity ? accountQuantity : 1) * 980}</span> */}
                    <span className="">
                      ￥
                      {(accountQuantity ?? 1) * getPrice(userProfileState?.subscription_plan) !== 0
                        ? (accountQuantity ?? 1) * getPrice(userProfileState?.subscription_plan)
                        : "エラー"}
                    </span>
                  </div>

                  {/* ローカルstateの計算結果を使って表示 */}
                  {!!nextInvoice && !!nextInvoiceAmountState && (
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
                            return setIsOpenNewProrationDetail(false);
                          }
                          if (isOpenOldProrationDetail) {
                            if (hoveredOldProration) setHoveredOldProration(false);
                            return setIsOpenOldProrationDetail(false);
                          }
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
                        {/* {hoveredTodaysPayment && <TodaysPaymentDetailComponent />} */}
                        {todaysPayment !== 0 && hoveredTodaysPayment && <TodaysPaymentDetailComponent />}
                        {/* <TodaysPaymentDetailComponent /> */}
                      </div>
                    )}
                    {todaysPayment === 0 && (
                      <div className="relative flex items-center space-x-2">
                        <span>￥0</span>
                      </div>
                    )}
                    {/* {todaysPayment === 0 && (
                      <div
                        className="relative flex items-center space-x-2"
                        onMouseEnter={() => setHoveredTodaysPayment(true)}
                        onMouseLeave={() => setHoveredTodaysPayment(false)}
                      >
                        <BsChevronDown />
                        <span>￥{todaysPayment}</span>
                        <NextPaymentDetailComponent />
                      </div>
                    )} */}
                  </div>
                </div>
              </div>
              <button
                className={`flex-center h-[40px] w-full rounded-[6px] font-bold text-[#fff]  ${
                  !!userProfileState && !!userProfileState.subscription_plan
                    ? `cursor-pointer bg-[var(--color-bg-brand-f)] hover:bg-[var(--color-bg-brand-f-deep)]`
                    : `cursor-not-allowed bg-[var(--setting-side-bg-select)] text-[var(--setting-side-bg-select-hover)]`
                }`}
                disabled={!userProfileState || !userProfileState.subscription_plan}
                // onClick={handleChangeQuantity}
                // onClick={handleCheckInvoiceStripeAndLocalCalculate}
                onClick={handleCheckStripeInvoiceAndLocal}
              >
                {/* {!loading && <span>変更の確定</span>} */}
                {!loading && <span>料金チェック</span>}
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
