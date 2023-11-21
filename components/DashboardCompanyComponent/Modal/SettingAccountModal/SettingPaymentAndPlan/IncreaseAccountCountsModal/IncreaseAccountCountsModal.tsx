import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import useDashboardStore from "@/store/useDashboardStore";
import React, { memo, useEffect, useRef, useState } from "react";
import styles from "./IncreaseAccountCountsModal.module.css";
import { BsCheck2, BsChevronDown } from "react-icons/bs";
import useStore from "@/store";
import Image from "next/image";
import { MdClose } from "react-icons/md";
import Vertical_SlideCards from "@/components/Parts/Vertical_SlideCards/Vertical_SlideCards";
import { HiOutlineLink, HiPlus } from "react-icons/hi2";
import { ImLink } from "react-icons/im";
import { AiOutlinePlus } from "react-icons/ai";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { toast } from "react-toastify";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { SubscribedAccount } from "@/types";
import { FaPlus, FaRegCircle } from "react-icons/fa";
import { useQueryMemberAccounts } from "@/hooks/useQueryMemberAccounts";
import { format } from "date-fns";
import Stripe from "stripe";
import { formatToJapaneseYen } from "@/utils/Helpers/formatToJapaneseYen";
import { getPlanName } from "@/utils/Helpers/getPlanName";
import { getPrice } from "@/utils/Helpers/getPrice";
import { FiPlus, FiPlusCircle } from "react-icons/fi";
import { IoPricetagOutline } from "react-icons/io5";

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
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();

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

  // 追加費用 nextInvoice.lines.data[0].amountがマイナスの値のため引くためには加算でOK
  const additionalCost =
    !!nextInvoice && !!nextInvoice?.lines?.data[1]?.amount
      ? nextInvoice.lines.data[1].amount + nextInvoice.lines.data[0].amount
      : null;

  // 初回マウント時と「新たに増やすアカウント数」を変更して「料金計算」を押した時にStripeから比例配分のプレビューを取得
  useEffect(() => {
    if (!userProfileState) return alert("エラー：ユーザー情報が見つかりませんでした");
    if (!!nextInvoice) return console.log("既にnextInvoice取得済みのためリターン");

    const getUpcomingInvoice = async () => {
      if (!!nextInvoice) return console.log("既にnextInvoice取得済みのためリターン");
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

  // 初回マウント時のみユーザーが契約中のサブスクリプションの次回支払い期限が今日か否かと、
  // 今日の場合は支払い時刻を過ぎているかどうか確認して過ぎていなければ0円でなくする
  useEffect(() => {
    if (!userProfileState || !userProfileState.current_period_end) return;
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

  // =========================== 変更を確定をクリック Stripeに送信 ===========================
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
    "変更後のアカウント合計の次回請求額プレビュー(比例配分あり)",
    nextInvoice,
    "アカウント追加後の次回追加費用",
    additionalCost
  );

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
        <div className="border-real fade02 absolute bottom-[100%] left-[50%] z-30 flex min-h-[50px] min-w-[100px] translate-x-[-50%] cursor-default flex-col rounded-[8px] bg-[var(--color-edit-bg-solid)] px-[32px] py-[24px]">
          <div className="flex w-full items-center pb-[25px]">
            <p className="text-[14px] font-normal">
              下記は本日
              <span className="font-bold">
                {format(new Date(nextInvoice.subscription_proration_date * 1000), "yyyy年MM月dd日")}
              </span>
              にアカウントを増やした場合のお支払額となります。
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
                {!!nextInvoice?.lines?.data[2]?.amount
                  ? `${formatToJapaneseYen(nextInvoice.lines.data[2].amount, false)}円`
                  : `-`}
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
                {nextInvoice?.lines?.data[2]?.plan?.amount
                  ? `${formatToJapaneseYen(nextInvoice.lines.data[2].plan.amount, true)}/月`
                  : `-`}
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
              <span>{!!additionalCost ? formatToJapaneseYen(additionalCost, false) : `-`}円</span>
              <div className="absolute bottom-[-5px] left-0 h-[2px] w-full bg-[#FF7A00]" />
            </div>
            <div className="flex-col-center">
              <span className="text-[18px]">＝</span>
            </div>
            <div className="flex-col-center relative">
              <div className="flex-col-center mb-[5px] inline-flex min-h-[36px] min-w-[160px]">
                <span className="text-[12px] font-normal">プラン残り期間まで利用する</span>
                <span className="text-[12px] font-normal">新プランの日割り料金</span>
              </div>
              <span>
                {!!nextInvoice?.lines?.data[1]?.amount
                  ? `${formatToJapaneseYen(nextInvoice.lines.data[1].amount, false)}円`
                  : `-`}
              </span>

              <div className="absolute bottom-[-5px] left-0 h-[2px] w-full bg-[var(--color-border-deep)]" />
            </div>
            <div className="flex-col-center">
              <span className="text-[16px]">＋</span>
            </div>

            <div className="flex-col-center relative">
              <div className="flex-col-center mb-[5px] inline-flex min-h-[36px] min-w-[180px]">
                <span className="text-[12px] font-normal">プラン残り期間まで未使用となる</span>
                <span className="text-[12px] font-normal">旧プランの日割り料金</span>
              </div>
              <span className="text-[var(--bright-red)]">
                {!!nextInvoice?.lines?.data[0]?.amount
                  ? `${formatToJapaneseYen(nextInvoice.lines.data[0].amount, false, true)}円`
                  : `-`}
              </span>
              <div className="absolute bottom-[-5px] left-0 h-[2px] w-full bg-[var(--color-border-deep)]" />
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
                {nextInvoice?.amount_due ? `${formatToJapaneseYen(nextInvoice.amount_due, false)}円` : `-`}
              </span>
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
                {!!nextInvoice?.lines?.data[2]?.amount
                  ? `${formatToJapaneseYen(nextInvoice.lines.data[2].amount, false)}円`
                  : `-`}
              </span>

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
              <span>{!!additionalCost ? `${formatToJapaneseYen(additionalCost, false)}円` : `-`}</span>
              <div className="absolute bottom-[-5px] left-0 h-[2px] w-full bg-[#FF7A00]" />
            </div>
          </div>
          {/* ４列目ここまで */}
        </div>
      </>
    );
  };
  // ====================== ✅増やした後の次回の請求金額 ここまで ======================

  return (
    <>
      {/* <div className={`${styles.overlay} `} onClick={handleCancelAndReset} /> */}
      <div className={`${styles.overlay} `} onClick={() => setIsOpenChangeAccountCountsModal(null)} />

      <div className={`${styles.container} `}>
        {isOpenInvoiceDetail && (
          <div className={`clear_overlay_absolute fade02 pointer-events-none z-20 rounded-[8px] bg-[#00000033]`}></div>
        )}
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
        {/* メインコンテンツ コンテナ */}
        <div className={`${styles.main_contents_container}`}>
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
                  <span>{getPlanName(userProfileState?.subscription_plan)}：</span>
                  {/* <span className="font-bold">{notSetAccounts.length}個</span> */}
                </h4>
                <div className="flex flex-col items-end text-[13px] font-bold">
                  <span className="">月{getPrice(userProfileState?.subscription_plan)}円</span>
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
                {!useQueryIsLoading && <span className="font-bold">{currentAccountCounts}個</span>}
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
                  <div className="flex w-full items-start justify-between font-bold">
                    <span>本日のお支払い</span>
                    {/* {todaysPayment === 0 && <span>￥{todaysPayment}</span>} */}
                    {todaysPayment === 0 && (
                      <div
                        className="relative flex items-center space-x-2"
                        onMouseEnter={() => setHoveredTodaysPayment(true)}
                        onMouseLeave={() => setHoveredTodaysPayment(false)}
                      >
                        <BsChevronDown />
                        <span>￥{todaysPayment}</span>
                        {!hoveredTodaysPayment && <TodaysPaymentDetailComponent />}
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
                  {!!nextInvoice && !!nextInvoice?.lines?.data && nextInvoice?.lines?.data.length > 1 && (
                    <div className="flex w-full items-start justify-between font-bold">
                      <span>次回請求期間のお支払い</span>
                      <div
                        className="relative flex cursor-pointer items-center space-x-2"
                        onMouseEnter={() => setIsOpenInvoiceDetail(true)}
                        onMouseLeave={() => setIsOpenInvoiceDetail(false)}
                      >
                        {!!nextInvoice?.amount_due && <BsChevronDown />}
                        <span>
                          {!!nextInvoice?.amount_due ? `${formatToJapaneseYen(nextInvoice.amount_due)}` : `-`}
                        </span>
                        {!isOpenInvoiceDetail && <NextPaymentDetailComponent />}
                      </div>
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
                onClick={handleChangeQuantity}
              >
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
