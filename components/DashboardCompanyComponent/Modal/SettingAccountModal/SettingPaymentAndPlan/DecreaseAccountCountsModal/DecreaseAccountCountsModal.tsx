import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import useDashboardStore from "@/store/useDashboardStore";
import React, { memo, useEffect, useRef, useState } from "react";
import styles from "./DecreaseAccountCountsModal.module.css";
import { BsCheck2, BsChevronDown } from "react-icons/bs";
import useStore from "@/store";
import Image from "next/image";
import { MdClose } from "react-icons/md";
import Vertical_SlideCards from "@/components/Parts/Vertical_SlideCards/Vertical_SlideCards";
import { HiMinus, HiOutlineLink, HiPlus } from "react-icons/hi2";
import { ImLink } from "react-icons/im";
import { AiOutlinePlus, AiOutlineUserAdd, AiOutlineUserDelete } from "react-icons/ai";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { toast } from "react-toastify";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { MemberAccounts, StripeSchedule, SubscribedAccount } from "@/types";
import { FaPlus } from "react-icons/fa";
import { useQueryMemberAccounts } from "@/hooks/useQueryMemberAccounts";
import { format } from "date-fns";
import { teamIllustration, windyDayIllustration } from "@/components/assets";
import { isValidUUIDv4 } from "@/utils/Helpers/uuidHelpers";

const DecreaseAccountCountsModalMemo = () => {
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const sessionState = useStore((state) => state.sessionState);
  const setIsOpenChangeAccountCountsModal = useDashboardStore((state) => state.setIsOpenChangeAccountCountsModal);
  // サイドメニューZustand
  const setSelectedSettingAccountMenu = useDashboardStore((state) => state.setSelectedSettingAccountMenu);
  // ローディング
  const [loading, setLoading] = useState(false);
  // 新規で契約するアカウント個数
  const [decreaseAccountQuantity, setDecreaseAccountQuantity] = useState<number | null>(1);
  // 本日のお支払いが0円かどうか
  const [isFreeTodaysPayment, setIsFreeTodaysPayment] = useState(true);
  const [todaysPayment, setTodaysPayment] = useState(0);
  // ホバーで本日の支払い表示
  const [hoveredTodaysPayment, setHoveredTodaysPayment] = useState(false);
  // 未設定アカウントを保持するグローバルState
  const notSetAccounts = useDashboardStore((state) => state.notSetAccounts);
  const setNotSetAccounts = useDashboardStore((state) => state.setNotSetAccounts);
  // 未設定かつ削除予定アカウントを保持するグローバルState
  const notSetAndDeleteRequestedAccounts = useDashboardStore((state) => state.notSetAndDeleteRequestedAccounts);
  const setNotSetAndDeleteRequestedAccounts = useDashboardStore((state) => state.setNotSetAndDeleteRequestedAccounts);
  // 未設定アカウントが足りない状態
  const [notEnoughAccount, setNotEnoughAccount] = useState(false);
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();

  const memberAccountsDataArray = queryClient.getQueryData<MemberAccounts[]>(["member_accounts"]);
  const stripeSchedulesDataArray = queryClient.getQueryData<StripeSchedule[]>(["stripe_schedules"]);
  // 削除リクエストのスケジュールがあるかどうか
  const [alreadyHaveSchedule, setAlreadyHaveSchedule] = useState(false);
  const [deleteAccountRequestSchedule, setDeleteAccountRequestSchedule] = useState<StripeSchedule | null>(null);

  // アカウントを減らすスケジュールが既に存在するかを確認して取得
  useEffect(() => {
    if (!stripeSchedulesDataArray || stripeSchedulesDataArray.length === 0) {
      setDeleteAccountRequestSchedule(null);
      return;
    }
    // 削除リクエストのスケジュール
    const deleteAccountRequestScheduleArray = stripeSchedulesDataArray.filter(
      (schedule) => schedule.schedule_status === "active" && schedule.type === "change_quantity"
    );
    if (!!deleteAccountRequestScheduleArray && deleteAccountRequestScheduleArray.length > 0) {
      setAlreadyHaveSchedule(true);
      // Zustandに格納 Arrayなのでひとつしかないが0番目のオブジェクトを格納
      setDeleteAccountRequestSchedule(deleteAccountRequestScheduleArray[0] ?? null);
    }
  }, [stripeSchedulesDataArray, setDeleteAccountRequestSchedule]);

  // 現在契約しているメンバーアカウント全てを取得して、契約アカウント数をlengthで取得
  // const {
  //   data: memberAccountsDataArray,
  //   error: useQueryError,
  //   isLoading: useQueryIsLoading,
  //   refetch: refetchMemberAccounts,
  // } = useQueryMemberAccounts();

  // // 未設定アカウントを算出
  // useEffect(() => {
  //   if (typeof memberAccountsDataArray === "undefined") return;
  //   if (!memberAccountsDataArray) {
  //     setNotSetAccounts([]);
  //     // setNotSetAccountsCount(null);
  //     return;
  //   }
  //   // // 全メンバーアカウントの数
  //   // アカウントの配列からprofilesのidがnull、かつ、invited_emailがnullで招待中でないアカウント、かつ、アカウントステータスがactiveのアカウントのみをフィルタリング
  //   const nullIdAccounts = memberAccountsDataArray.filter(
  //     (account) => account.id === null && account.account_invited_email === null && account.account_state === "active"
  //   );
  //   // 削除予定のアカウントを取得してグローバルStateに格納
  //   const deleteRequestedAccounts = memberAccountsDataArray.filter(
  //     (account) =>
  //       account.id === null && account.account_invited_email === null && account.account_state === "delete_requested"
  //   );
  //   // idがnullのアカウントの数をカウント
  //   const nullIdCount = nullIdAccounts ? nullIdAccounts.length : 0;
  //   // // アカウントの配列からidがnullでないアカウントのみをフィルタリング
  //   // const notNullIdAccounts = memberAccountsDataArray?.filter((account) => account.id !== null);
  //   // // idがnullでないアカウントの数をカウント
  //   // const notNullIdCount = notNullIdAccounts ? notNullIdAccounts.length : 0;
  //   // // 全アカウント数からnullでないアカウントを引いた数
  //   // const nullIdCount2 = Math.abs(allAccountsCount - notNullIdCount);
  //   console.log(
  //     "nullIdAccounts",
  //     nullIdAccounts,
  //     "未設定のアクティブアカウント数",
  //     nullIdCount,
  //     "削除リクエスト済みアカウント数",
  //     deleteRequestedAccounts,
  //     "memberAccountsDataArray",
  //     memberAccountsDataArray
  //   );
  //   // グローバルStateに格納
  //   // setNotSetAccountsCount(nullIdCount);
  //   setNotSetAccounts(nullIdAccounts);
  //   setNotSetAndDeleteRequestedAccounts(deleteRequestedAccounts);
  // }, [memberAccountsDataArray, setNotSetAccounts]);

  const getPrice = (subscription: string | null | undefined) => {
    if (!subscription) return 0;
    switch (subscription) {
      case "business_plan":
        return 980;
        break;
      case "premium_plan":
        return 19800;
        break;
      default:
        return 0;
        break;
    }
  };
  const getPlanName = (subscription: string | null | undefined) => {
    if (!subscription) return 0;
    switch (subscription) {
      case "business_plan":
        return "ビジネスプラン";
        break;
      case "premium_plan":
        return "プレミアムプラン";
        break;
      default:
        return "プラン無し";
        break;
    }
  };

  // const [idsToDeleteArray, setIdsToDeleteArray] = useState<string[]>([]);
  // useEffect(() => {
  //   if (!decreaseAccountQuantity) return;
  //   // 選択された個数分、未設定のアカウントの配列からidのみ取り出して指定個数の未設定idの配列を作り引数に渡す。
  //   const idsToDeleteArrayTemp = notSetAccounts
  //     .filter(
  //       (account, index) =>
  //         account && typeof account.subscribed_account_id === "string" && decreaseAccountQuantity >= index + 1
  //     )
  //     .map((account) => account.subscribed_account_id as string);

  //   setIdsToDeleteArray(idsToDeleteArrayTemp);
  // }, [decreaseAccountQuantity]);

  // 契約中のアカウント個数
  const currentAccountCounts = !!memberAccountsDataArray ? memberAccountsDataArray.length : 0;

  // Stripeのサブスクリプションのquantityを新たな数量に更新
  // 現在のアカウント数 - 削除する未設定アカウント数 = 更新後の合計アカウント数
  const totalAccountQuantity = currentAccountCounts - (decreaseAccountQuantity ?? 0);

  // =========================== 🌟変更を確定をクリック Stripeに送信 ===========================

  // 数量を減らす関数 減らすのは未設定アカウントのみ
  const handleChangeQuantity = async () => {
    // 未設定アカウント数が0の場合には、「アカウント数足りないモーダル」を表示して関数はリターン
    if (notSetAccounts.length === 0) return setNotEnoughAccount(true);
    console.log(
      "🌟Stripeアカウント数量減らすステップ0 変更の確定クリック 現在のサブスクプランと数量",
      userProfileState?.subscription_plan,
      decreaseAccountQuantity
    );
    if (!userProfileState) return alert("エラー：ユーザー情報が確認できませんでした");
    if (!sessionState) return alert("エラー：セッション情報が確認できませんでした");
    if (!decreaseAccountQuantity) return alert("エラー：追加するアカウント数が選択されていません");
    setLoading(true);

    try {
      console.log("🌟Stripeアカウント数量減らすステップ0-1 axiosでAPIルートに送信 合計個数", totalAccountQuantity);

      // 🔹削除対象の未設定アカウントのidを配列に格納
      // 選択された個数分、未設定のアカウントの配列からidのみ取り出して指定個数の未設定idの配列を作り引数に渡す。
      const idsToDeleteArray = notSetAccounts
        .filter((account, index) => account && decreaseAccountQuantity >= index + 1)
        .map((account) => account.subscribed_account_id);
      // 削除対象のid群の配列が全てUUIDかをチェックする uuid以外が含まれていればリターン
      if (idsToDeleteArray.every((id) => id && isValidUUIDv4(id)) === false) return;
      console.log("🌟Stripeアカウント変更ステップ0-2 削除対象の配列UUIDチェック完了", idsToDeleteArray);
      const payload = {
        stripeCustomerId: userProfileState.subscription_stripe_customer_id,
        newQuantity: totalAccountQuantity, // 数量減らした後の合計個数
        changeType: "decrease",
        companyId: userProfileState.company_id,
        subscriptionId: userProfileState.subscription_id,
        userProfileId: userProfileState.id,
        alreadyHaveSchedule: alreadyHaveSchedule, // decrease用の削除リクエストスケジュールがあるかどうか用
        deleteAccountRequestSchedule: deleteAccountRequestSchedule, // decrease用の削除リクエストスケジュール用
      };
      console.log(
        "🌟Stripeアカウント数量減らすステップ0-3 axios.post()でAPIルートchange-quantityへリクエスト 引数のpayload",
        payload
      );
      const {
        data: { subscriptionItem, error: axiosStripeError },
      } = await axios.post(`/api/subscription/change-quantity`, payload, {
        headers: {
          Authorization: `Bearer ${sessionState.access_token}`,
        },
      });

      if (axiosStripeError) {
        console.error(
          `🌟Stripeアカウント数量減らすステップ7 Stripeアカウント数減少エラー axiosStripeError`,
          axiosStripeError
        );
        throw new Error(axiosStripeError);
      }
      console.log(
        `🌟Stripeアカウント数量減らすステップ7 Stripeアカウント数減少完了 subscriptionItem`,
        subscriptionItem
      );

      // ======================== 🌟スケジュール適用日に数量を減らすルート ========================
      // subscribed_accountsのstateを削除リクエスト済み（delete_requested）に変更
      console.log(
        `🌟Stripeアカウント数量減らすステップ8 supabaseのsubscribed_accountsテーブルから${decreaseAccountQuantity}個のアカウントを削除予定に変更するストアドプロシージャを実行 削除対象のidを持つ配列idsToDeleteArray`,
        idsToDeleteArray
      );
      // 新たに削除するアカウント数分、supabaseのsubscribed_accountsテーブルからDELETE
      const { error: deleteRequestedSubscribedAccountsError } = await supabase.rpc(
        "update_delete_requested_subscribed_accounts_all_at_once",
        {
          delete_requested_account_quantity: decreaseAccountQuantity,
          ids_to_delete: idsToDeleteArray,
          _subscription_id: userProfileState.subscription_id,
        }
      );

      if (deleteRequestedSubscribedAccountsError) {
        console.log("🌟Stripeアカウント数量減らすステップ9 supabaseの未設定アカウントを指定個数分、削除エラー");
        throw new Error(deleteRequestedSubscribedAccountsError.message);
      }
      console.log(
        "🌟Stripeアカウント数量減らすステップ9 supabaseの未設定アカウントを指定個数分、削除リクエストとsubscriptionsテーブルのアクティブアカウント数の更新成功"
      );

      // const currentActiveAccountCounts = currentAccountCounts - decreaseAccountQuantity;
      // console.log("🌟Stripeステップ10 削除リクエストが無事成功したら、指定した個数を現在の作成済みアカウント数から削除リクエスト済みアカウント数を引いた数量をnumber_of_active_subscribed_accountsのアクティブなアカウントの数にセット位sてUPDATEする");

      // const promises = [...Array(accountQuantity)].map(() => {
      //   return null;
      // });
      // await Promise.all(promises);
      console.log("🌟Stripeアカウント数量減らすステップ 全て完了 キャッシュを更新");

      // キャッシュを最新状態に反映
      // サブスクリプションスケジュールを取得して新たなダウングレードの適用時期を明示する
      //   await queryClient.invalidateQueries({ queryKey: ["change_team_owner_notifications"] });
      //   await queryClient.invalidateQueries({ queryKey: ["my_notifications"] });
      await queryClient.invalidateQueries({ queryKey: ["member_accounts"] });
      await queryClient.invalidateQueries({ queryKey: ["stripe_schedules"] });
      // subscribed_accountsのstateを削除リクエスト済み（delete_requested）に変更
      // ======================== 🌟スケジュール適用日に数量を減らすルート ここまで ========================

      // ======================= 🌟即時に実際に一括でアカウントを削除するルート =======================
      // console.log(
      //   `🌟Stripeアカウント変更ステップ8 supabaseのsubscribed_accountsテーブルから${decreaseAccountQuantity}個のアカウントを削除するストアドプロシージャを実行 削除対象のidを持つ配列idsToDeleteArray`,
      //   idsToDeleteArray
      // );
      // // 新たに削除するアカウント数分、supabaseのsubscribed_accountsテーブルからDELETE
      // const { error: deleteSubscribedAccountsError } = await supabase.rpc("delete_subscribed_accounts_all_at_once", {
      //   decrease_account_quantity: decreaseAccountQuantity, // 削除行数チェック用
      //   ids_to_delete: idsToDeleteArray, // 削除対象の未設定アカウントのid配列
      // });

      // if (deleteSubscribedAccountsError) {
      //   console.log("🌟Stripeステップ9 supabaseの未設定アカウントを指定個数分、削除エラー");
      //   throw new Error(deleteSubscribedAccountsError.message);
      // }
      // console.log("🌟Stripeステップ9 supabaseの未設定アカウントを指定個数分、削除成功");

      // // const promises = [...Array(accountQuantity)].map(() => {
      // //   return null;
      // // });
      // // await Promise.all(promises);
      // console.log("全て完了 キャッシュを更新");

      // // キャッシュを最新状態に反映
      // // サブスクリプションスケジュールを取得して新たなダウングレードの適用時期を明示する
      // //   await queryClient.invalidateQueries({ queryKey: ["change_team_owner_notifications"] });
      // //   await queryClient.invalidateQueries({ queryKey: ["my_notifications"] });
      // await queryClient.invalidateQueries({ queryKey: ["member_accounts"] });
      // await queryClient.invalidateQueries({ queryKey: ["stripe_schedules"] });
      // ======================= 🌟即時に実際に一括でアカウントを削除するルート ここまで =======================

      toast.success(`数量変更を受け付けました。現在の請求期間の最終日に新たなアカウント数が適用されます。`, {
        position: "top-right",
        autoClose: 5000,
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
  // =========================== ✅変更を確定をクリック Stripeに送信 ここまで ===========================

  console.log(
    "🌟decreaseAccountCountsModalコンポーネントレンダリング",

    "現在契約中のアカウント個数",
    currentAccountCounts,
    "useQueryメンバーアカウント",
    memberAccountsDataArray,
    "未設定アカウント個数",
    notSetAccounts,
    "今回削除するアカウント数",
    decreaseAccountQuantity,
    "削除後のアカウント数合計",
    totalAccountQuantity,
    "スケジュールテーブル",
    stripeSchedulesDataArray,
    "削除リクエストスケジュールの有無",
    alreadyHaveSchedule,
    "削除リクエストスケジュール",
    deleteAccountRequestSchedule
    // "削除対象のid配列",
    // idsToDeleteArray,
    // "削除対象のid配列が全てUUIDかどうかテスト",
    // idsToDeleteArray.every((id) => id && isValidUUIDv4(id))
  );

  return (
    <>
      {/* <div className={`${styles.overlay} `} onClick={handleCancelAndReset} /> */}
      <div className={`${styles.overlay} `} onClick={() => setIsOpenChangeAccountCountsModal(null)} />

      <div className={`${styles.container} `}>
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
              <h1 className={`mt-[10px] w-full text-[24px] font-bold`}>いくつアカウントを減らしますか？</h1>
              {/* <h1 className={`w-full text-[24px] font-bold`}>プランを選んで早速始めましょう！</h1> */}
              <div className={`flex w-full flex-col space-y-[2px] py-[20px] text-[15px] text-[var(--color-text-sub)]`}>
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
                  <span>契約中のアカウント数：</span>
                  {/* <span className="font-bold">{notSetAccounts.length}個</span> */}
                </h4>
                <span className="font-bold">{currentAccountCounts}個</span>
                {/* {!useQueryIsLoading && <span className="font-bold">{currentAccountCounts}個</span>}
                {useQueryIsLoading && <SpinnerIDS scale={"scale-[0.3]"} />} */}
              </div>

              <div className="mt-[20px] flex max-h-[35px] min-h-[35px] w-full items-center justify-between text-[15px]">
                <h4 className="flex space-x-3">
                  {/* <BsCheck2 className="min-h-[24px] min-w-[24px] stroke-1 text-[24px] text-[var(--color-bg-brand-f)]" /> */}
                  {/* <BsCheck2 className="min-h-[24px] min-w-[24px] stroke-1 text-[24px] text-[#00d436]" /> */}
                  <AiOutlineUserAdd className="min-h-[24px] min-w-[24px] stroke-1 text-[24px] text-[#00d436]" />
                  <span>未設定のアクティブアカウント数：</span>
                  {/* <span className="font-bold">{notSetAccounts.length}個</span> */}
                </h4>
                {/* {!useQueryIsLoading && <span className="font-bold">{notSetAccounts.length ?? "-"}個</span>}
                {useQueryIsLoading && <SpinnerIDS scale={"scale-[0.3]"} />} */}
                <span className="font-bold">{notSetAccounts.length ?? "-"}個</span>
              </div>

              <div className="mt-[20px] flex max-h-[35px] min-h-[35px] w-full items-center justify-between text-[15px]">
                <h4 className="flex space-x-3">
                  {/* <BsCheck2 className="min-h-[24px] min-w-[24px] stroke-1 text-[24px] text-[var(--color-bg-brand-f)]" /> */}
                  {/* <BsCheck2 className="min-h-[24px] min-w-[24px] stroke-1 text-[24px] text-[#00d436]" /> */}
                  <AiOutlineUserDelete className="min-h-[24px] min-w-[24px] stroke-1 text-[24px] text-[var(--bright-red)]" />
                  <span>削除リクエスト済みのアカウント数：</span>
                  {/* <span className="font-bold">{notSetAccounts.length}個</span> */}
                </h4>
                {/* {!useQueryIsLoading && (
                  <span className="font-bold">{notSetAndDeleteRequestedAccounts.length ?? "-"}個</span>
                )}
                {useQueryIsLoading && <SpinnerIDS scale={"scale-[0.3]"} />} */}
                <span className="font-bold">{notSetAndDeleteRequestedAccounts.length ?? "-"}個</span>
              </div>

              {/* メンバー人数選択エリア */}
              <div className="mt-[20px] flex w-full items-center justify-between text-[var(--color-text-title)]">
                <h4 className="relative flex min-w-max items-center space-x-3 text-[15px]">
                  {/* <HiPlus className="min-h-[24px] min-w-[24px] stroke-[1.5] text-[24px] text-[#00d436]" /> */}
                  <HiMinus className="min-h-[24px] min-w-[24px] stroke-[1.5] text-[24px] text-[var(--bright-red)]" />
                  <span>削除するアカウント数：</span>
                </h4>
                {notSetAccounts.length !== 0 && (
                  <div className="flex items-center justify-end space-x-2">
                    <input
                      type="number"
                      min="1"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={decreaseAccountQuantity === null ? 1 : decreaseAccountQuantity}
                      onChange={(e) => {
                        const val = e.target.value;
                        const numValue = Number(val);
                        if (val === "") {
                          setDecreaseAccountQuantity(null);
                        } else if (numValue > notSetAccounts.length) {
                          // const stayNumValue = numValue - 1;
                          // setDecreaseAccountQuantity(stayNumValue);
                          return alert("未設定のアカウント数以上減らすことはできません。");
                        } else {
                          // 入力値がマイナスかチェック
                          if (numValue <= 0) {
                            setDecreaseAccountQuantity(1);
                          } else {
                            setDecreaseAccountQuantity(numValue);
                          }
                        }
                      }}
                    />
                    <div className="font-bold">個</div>
                  </div>
                )}
                {notSetAccounts.length === 0 && (
                  <div className="flex items-center justify-end">
                    <span className="text-[14px] font-bold">削除対象アカウント無し</span>
                  </div>
                )}
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
                <div className="flex flex-col space-y-3">
                  {/* <div className="flex w-full items-start justify-between">
                    <span className="max-w-[290px]">アカウントを増やした場合に次回請求で発生する追加費用</span>
                    <span className="">
                      ￥
                      {(accountQuantity ?? 1) * getPrice(userProfileState?.subscription_plan) !== 0
                        ? (accountQuantity ?? 1) * getPrice(userProfileState?.subscription_plan)
                        : "エラー"}
                    </span>
                  </div> */}
                  <div className="flex w-full items-start justify-between font-bold">
                    <span>変更後の合計アカウント数</span>
                    {todaysPayment === 0 && notSetAccounts.length !== 0 && <span>{totalAccountQuantity}個</span>}
                    {todaysPayment === 0 && notSetAccounts.length === 0 && <span>- 個</span>}
                    {/* {todaysPayment !== 0 && (
                      <div
                        className="relative flex items-center space-x-2"
                        onMouseEnter={() => setHoveredTodaysPayment(true)}
                        onMouseLeave={() => setHoveredTodaysPayment(false)}
                      >
                        <BsChevronDown />
                        <span>￥{todaysPayment}</span>
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
                onClick={handleChangeQuantity}
              >
                {!loading && notSetAccounts.length !== 0 && <span>変更の確定</span>}
                {!loading && notSetAccounts.length === 0 && <span>メンバーを削除</span>}
                {loading && <SpinnerIDS scale={"scale-[0.4]"} />}
              </button>
              {/* <div className="flex w-full flex-col  text-[13px] text-[var(--color-text-sub)]">
                <p>
                  確定することにより、キャンセルするまで更新後の料金が請求されることに同意したものとみなされます。お好きな時にいつでもキャンセルでき、それ以降は請求されません。
                </p>
              </div> */}
            </div>
          </div>
          {/* ======================== 右側エリア ======================== */}
          <div className={`relative flex h-full w-7/12 flex-col items-center justify-center ${styles.right_container}`}>
            <div className="z-10 mb-[-70px]">{windyDayIllustration}</div>
            <div className="z-0 mb-[100px] flex h-auto w-[70%] flex-col rounded-[8px] bg-[var(--color-modal-bg-side-c-second)] px-[24px] pb-[48px] pt-[58px] text-[var(--color-text-title)]">
              <p className={`text-[14px] font-bold`}>方法は以下の通りです。</p>
              <div className="mt-[12px] flex h-auto w-full text-[14px]">
                <p className="mr-[4px]">1.</p>
                <div className="flex w-full flex-col">
                  <p>減らしたい個数分、メンバーアカウントを未設定の状態にします。</p>
                  <p className="mt-[4px] text-[12px] text-[var(--color-text-sub)]">
                    メンバー管理画面から、アカウントに紐づいているメンバーを削除してアカウントを未設定の状態にします。
                  </p>
                </div>
              </div>
              <div className="mt-[16px] flex h-auto w-full text-[14px]">
                <p className="mr-[4px]">2.</p>
                <div className="flex w-full flex-col">
                  <p>削除するアカウント数を減らしたい個数に設定します</p>
                  {/* <p className="mt-[4px] text-[12px] text-[var(--color-text-sub)]">
                    任命された人は、このチーム、チームメンバー、チームコンテンツの新しい管理者権限を持つことになります。
                  </p> */}
                </div>
              </div>
              <div className="mt-[16px] flex h-auto w-full text-[14px]">
                <p className="mr-[4px]">3.</p>
                <div className="flex w-full flex-col">
                  <p>変更の確定ボタンをクリックすることで契約アカウント数の変更が完了します。</p>
                  <p className="mt-[4px] text-[12px] text-[var(--color-text-sub)]">
                    新たなアカウント数は、お客様の次のご請求期間の開始日（
                    {userProfileState ? format(new Date(userProfileState.current_period_end!), "yyyy年MM月dd日") : ``}
                    ）から適用されます。
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* ======================== 右側エリア ここまで ======================== */}
        </div>

        {/* ======================== アカウントを増やすモーダル ======================== */}
        {notEnoughAccount && (
          <>
            <div className={`${styles.modal_overlay}`} onClick={() => setNotEnoughAccount(false)}></div>
            <div className={`${styles.modal} relative flex flex-col`}>
              {/* クローズボタン */}
              <button
                className={`flex-center z-100 group absolute right-[-40px] top-0 h-[32px] w-[32px] rounded-full bg-[#00000090] hover:bg-[#000000c0]`}
                onClick={() => setNotEnoughAccount(false)}
              >
                <MdClose className="text-[20px] text-[#fff]" />
              </button>
              <div className={`relative h-[50%] w-full ${styles.modal_right_container}`}></div>
              <div className={`relative flex h-[50%] w-full flex-col items-center pt-[20px]`}>
                <div className="flex w-[80%] flex-col space-y-1 text-[16px]">
                  <div className="mb-[10px] flex w-full flex-col text-center text-[18px] font-bold">
                    <h2>削除できるアカウントがありません！</h2>
                    <h2>メンバーを削除して未設定アカウントを作りましょう</h2>
                  </div>

                  <p>
                    現在の未設定アカウントは
                    <span className="text-[16px] font-bold text-[var(--color-text-brand-f)] underline">
                      {notSetAccounts.length}個
                    </span>
                    です。
                  </p>
                  {notSetAccounts.length === 0 && <p>アカウント数を減らすために、先にメンバー削除を行いましょう。</p>}

                  <div className={`flex w-full items-center justify-around space-x-5 pt-[30px]`}>
                    <button
                      className={`w-[50%] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[15px] py-[10px] text-[14px] font-bold text-[var(--color-text-sub)] hover:bg-[var(--setting-side-bg-select-hover)]`}
                      onClick={() => setNotEnoughAccount(false)}
                    >
                      戻る
                    </button>
                    <button
                      className="w-[50%] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[15px] py-[10px] text-[14px] font-bold text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]"
                      onClick={() => {
                        setNotEnoughAccount(false);
                        setIsOpenChangeAccountCountsModal(null);
                        setSelectedSettingAccountMenu("Member");
                      }}
                    >
                      管理画面にいく
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        {/* ======================== アカウントを増やすモーダル ここまで ======================== */}
      </div>
    </>
  );
};

export const DecreaseAccountCountsModal = memo(DecreaseAccountCountsModalMemo);
