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
import React, { FC, memo, useEffect, useState } from "react";
import { AiFillExclamationCircle, AiFillInfoCircle, AiOutlineMinusCircle, AiOutlinePlusCircle } from "react-icons/ai";
import { BsCheck2 } from "react-icons/bs";
import { MdClose } from "react-icons/md";
import { toast } from "react-toastify";

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
  const [showConfirmModal, setShowConfirmModal] = useState<string | null>(null);
  // プランを変更確認モーダル
  const [isOpenChangePlanModal, setIsOpenChangePlanModal] = useState(false);
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();

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
    "✅userProfileState",
    userProfileState,
    "✅Stripeのサブスクスケジュール stripeSchedulesDataArray",
    stripeSchedulesDataArray,
    "✅削除リクエストスケジュール",
    deleteAccountRequestSchedule,
    "✅プランダウングレードリクエストスケジュール",
    downgradePlanSchedule,
    "✅全メンバーアカウント",
    memberAccountsDataArray,
    "✅未設定アクティブアカウント",
    notSetAccounts,
    "✅削除リクエスト済みアカウント",
    notSetAndDeleteRequestedAccounts
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

    setShowConfirmModal(null); // 確認モーダルを閉じる
    setLoadingCancelDeleteRequest(false);
  };
  // ===================== ✅アカウントの削除リクエストをキャンセルする関数 =====================

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
                            {/* {format(new Date(stripeSchedulesDataArray[0].current_end_date), "yyyy/MM/dd")} */}
                          </span>
                          に、ご利用のアカウント数は{deleteAccountRequestSchedule.scheduled_quantity}
                          個に変更されます。）
                          {/* に、ご利用のアカウント数は{stripeSchedulesDataArray[0].scheduled_quantity}個に変更されます。） */}
                        </p>
                      )}
                  </div>

                  <div className="mt-[8px] flex w-full space-x-2 text-[15px] text-[var(--color-text-sub)]">
                    <p>
                      ￥<span>{planToPrice(userProfileState?.subscription_plan)}</span>/月　×　メンバーアカウント：
                      <span>{userProfileState?.accounts_to_create}</span>
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
                  onClick={() => {
                    console.log("プランを変更クリック");
                    setIsOpenChangePlanModal(true);
                  }}
                >
                  {userProfileState?.subscription_plan === "free_plan" && !isLoading && (
                    <p className="flex space-x-2">
                      <span>
                        <Image width="20" height="20" src="/assets/images/icons/icons8-crown-48.png" alt="crown" />
                      </span>
                      <span>プランをアップグレード</span>
                    </p>
                  )}
                  {userProfileState?.subscription_plan !== "free_plan" && !isLoading && <span>プランを変更</span>}
                  {isLoading && <SpinnerIDS scale={"scale-[0.4]"} />}
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
                  className={`transition-base02 flex-center max-h-[41px] w-[50%] min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--color-bg-sub)] px-[25px] py-[10px] text-[14px] font-bold !text-[var(--color-text-title)] ${
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
                    onClick={() => setShowConfirmModal("delete_request")}
                  >
                    アカウントの削減リクエストをキャンセル
                  </span>
                </div>
              )}
              {!!downgradePlanSchedule && (
                <div className="flex w-full items-center justify-end">
                  <span
                    className="ml-auto cursor-pointer hover:text-[var(--color-text-brand-f)] hover:underline"
                    onClick={() => console.log("クリック")}
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
      {showConfirmModal !== null && (
        <>
          {/* オーバーレイ */}
          <div
            className="fixed left-[-100vw] top-[-100vh] z-[1000] h-[200vh] w-[200vw] bg-[var(--color-overlay)] backdrop-blur-sm"
            onClick={() => {
              console.log("オーバーレイ クリック");
              setShowConfirmModal(null);
            }}
          ></div>
          <div className="fade02 fixed left-[50%] top-[50%] z-[2000] h-auto w-[40vw] translate-x-[-50%] translate-y-[-50%] rounded-[8px] bg-[var(--color-bg-notification-modal)] p-[32px] text-[var(--color-text-title)]">
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
                setShowConfirmModal(null);
              }}
            >
              <MdClose className="text-[20px] text-[#fff]" />
            </button>
            <h3 className={`flex min-h-[32px] w-full items-center text-[22px] font-bold`}>
              {showConfirmModal === "delete_request" && "削除リクエストをキャンセルしますか？"}
            </h3>
            <section className={`mt-[20px] flex h-auto w-full flex-col space-y-3 text-[14px]`}>
              <p>この操作を実行した後にキャンセルすることはできません。</p>
              {/* <p className="font-bold">
                注：この操作により、該当ユーザーのデータは、他のチームメンバーと共有されていないものを含めて全てアクセスできなくなります。
              </p> */}
            </section>
            <section className="flex w-full items-start justify-end">
              <div className={`flex w-[100%] items-center justify-around space-x-5 pt-[30px]`}>
                <button
                  className={`w-[50%] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[15px] py-[10px] text-[14px] font-bold text-[var(--color-text-title)] hover:bg-[var(--setting-side-bg-select-hover)]`}
                  onClick={() => {
                    setShowConfirmModal(null);
                  }}
                >
                  キャンセル
                </button>
                <button
                  className="w-[50%] cursor-pointer rounded-[8px] bg-[var(--color-red-tk)] px-[15px] py-[10px] text-[14px] font-bold text-[#fff] hover:bg-[var(--color-red-tk-hover)]"
                  onClick={handleCancelDeleteAccountRequestSchedule}
                >
                  削除リクエストをキャンセルする
                </button>
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
            }}
          ></div>
          <div className="fade02 shadow-all-md fixed left-[50%] top-[50%] z-[2000] h-[75vh] max-h-[600px] w-[68vw] max-w-[940px] translate-x-[-50%] translate-y-[-50%] rounded-[8px] bg-[var(--color-bg-notification-modal)] text-[var(--color-text-title)]">
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
                setIsOpenChangePlanModal(false);
              }}
            >
              <MdClose className="text-[20px] text-[#fff]" />
            </button>
            <h3 className={`flex min-h-[32px] w-full items-center text-[22px] font-bold`}>
              {showConfirmModal === "delete_request" && "削除リクエストをキャンセルしますか？"}
            </h3>
            <section className={`mt-[20px] flex h-auto w-full flex-col space-y-3 text-[14px]`}>
              <p>この操作を実行した後にキャンセルすることはできません。</p>
              {/* <p className="font-bold">
                注：この操作により、該当ユーザーのデータは、他のチームメンバーと共有されていないものを含めて全てアクセスできなくなります。
              </p> */}
            </section>
            <section className="flex w-full items-start justify-end">
              <div className={`flex w-[100%] items-center justify-around space-x-5 pt-[30px]`}>
                <button
                  className={`w-[50%] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[15px] py-[10px] text-[14px] font-bold text-[var(--color-text-title)] hover:bg-[var(--setting-side-bg-select-hover)]`}
                  onClick={() => {
                    setIsOpenChangePlanModal(false);
                  }}
                >
                  キャンセル
                </button>
                <button
                  className="w-[50%] cursor-pointer rounded-[8px] bg-[var(--color-red-tk)] px-[15px] py-[10px] text-[14px] font-bold text-[#fff] hover:bg-[var(--color-red-tk-hover)]"
                  // onClick={handleCancelDeleteAccountRequestSchedule}
                >
                  削除リクエストをキャンセルする
                </button>
              </div>
            </section>
          </div>
        </>
      )}
      {/* ============================== ✅プランを変更モーダル ここまで ============================== */}
    </>
  );
};

export const SettingPaymentAndPlan = memo(SettingPaymentAndPlanMemo);
