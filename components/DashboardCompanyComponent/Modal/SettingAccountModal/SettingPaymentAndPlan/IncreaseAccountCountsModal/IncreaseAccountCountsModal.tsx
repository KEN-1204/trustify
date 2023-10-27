import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import useDashboardStore from "@/store/useDashboardStore";
import React, { memo, useEffect, useRef, useState } from "react";
import styles from "./IncreaseAccountCountsModal.module.css";
import { BsCheck2 } from "react-icons/bs";
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
import { FaPlus } from "react-icons/fa";
import { useQueryMemberAccounts } from "@/hooks/useQueryMemberAccounts";

const IncreaseAccountCountsModalMemo = () => {
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const setIsOpenChangeAccountCountsModal = useDashboardStore((state) => state.setIsOpenChangeAccountCountsModal);
  // ローディング
  const [loading, setLoading] = useState(false);
  const [accountQuantity, setAccountQuantity] = useState<number | null>(1);
  //   const supabase = useSupabaseClient();
  //   const queryClient = useQueryClient();

  const {
    data: memberAccountsDataArray,
    error: useQueryError,
    isLoading: useQueryIsLoading,
    refetch: refetchMemberAccounts,
  } = useQueryMemberAccounts();

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

  // 契約中のアカウント個数
  const currentAccountCounts = !!memberAccountsDataArray ? memberAccountsDataArray.length : 0;

  console.log(
    "🌟IncreaseAccountCountsModalコンポーネントレンダリング",

    "アカウント個数",
    currentAccountCounts,
    "useQueryメンバーアカウント",
    memberAccountsDataArray
  );

  return (
    <>
      {/* <div className={`${styles.overlay} `} onClick={handleCancelAndReset} /> */}
      <div className={`${styles.overlay} `} onClick={() => setIsOpenChangeAccountCountsModal(null)} />

      <div className={`${styles.container} `}>
        {/* {loading && (
          <div className={`${styles.loading_overlay} `}>
            <SpinnerIDS scale={"scale-[0.5]"} />
          </div>
        )} */}
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
                <p>メンバー1人当たり月額￥980の追加料金のみで利用可能</p>
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
                  <span>ビシネスプラン：</span>
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
            <div className="shadow-top-md2 absolute bottom-0 left-0 w-full space-y-4 rounded-bl-[8px]  bg-[var(--color-edit-bg-solid)] px-[32px] pb-[32px] pt-[18px]">
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
                    <span>￥0</span>
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
                onClick={() => {
                  if (!userProfileState || !userProfileState.subscription_plan) return;
                  console.log("変更の確定クリック プランと数量", userProfileState.subscription_plan, accountQuantity);
                  //   if (selectedRadioButton === "business_plan")
                  //     processSubscription("price_1NmPoFFTgtnGFAcpw1jRtcQs", accountQuantity);
                  //   if (selectedRadioButton === "premium_plan")
                  //     processSubscription("price_1NmQAeFTgtnGFAcpFX60R4YY", accountQuantity);
                }}
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

        {/* アカウントを増やすモーダル */}
        {false && (
          <>
            {/* <div className={`${styles.modal_overlay}`} onClick={() => setOverState(false)}></div> */}
            <div className={`${styles.modal_overlay}`}></div>
            <div className={`${styles.modal} relative flex flex-col`}>
              {/* クローズボタン */}
              <button
                className={`flex-center z-100 group absolute right-[-40px] top-0 h-[32px] w-[32px] rounded-full bg-[#00000090] hover:bg-[#000000c0]`}
                // onClick={() => setOverState(false)}
              >
                <MdClose className="text-[20px] text-[#fff]" />
              </button>
              <div className={`relative h-[50%] w-full ${styles.modal_right_container}`}></div>
              <div className={`relative flex h-[50%] w-full flex-col items-center pt-[20px]`}>
                <div className="flex w-[80%] flex-col space-y-1 text-[16px]">
                  <div className="mb-[10px] flex w-full flex-col text-center text-[20px] font-bold">
                    <h2>アカウントが足りません！</h2>
                    <h2>アカウントを増やしますか？</h2>
                  </div>

                  <p>
                    現在の未設定アカウントは
                    {/* <span className="text-[18px] font-bold text-[var(--color-text-brand-f)] underline">
                      {notSetAccounts.length}個
                    </span> */}
                    <span className="text-[18px] font-bold text-[var(--color-text-brand-f)] underline">個</span>
                    です。
                  </p>
                  {/* {notSetAccounts.length !== 0 && (
                    <p>
                      <span className="text-[18px] font-bold text-[var(--color-text-brand-f)] underline">
                        {notSetAccounts.length}人
                      </span>
                      以上のメンバーを招待する場合は、先に契約アカウントを増やしましょう。
                    </p>
                  )} */}
                  {/* {notSetAccounts.length === 0 && <p>メンバーを招待する場合は、先に契約アカウントを増やしましょう。</p>} */}

                  <div className={`flex w-full items-center justify-around space-x-5 pt-[30px]`}>
                    <button
                      className={`w-[50%] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[15px] py-[10px] text-[14px] font-bold text-[var(--color-text-sub)] hover:bg-[var(--setting-side-bg-select-hover)]`}
                      //   onClick={() => setOverState(false)}
                    >
                      戻る
                    </button>
                    <button
                      className="w-[50%] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[15px] py-[10px] text-[14px] font-bold text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]"
                      onClick={() => {
                        if (!userProfileState) return;
                        console.log("アカウント");
                      }}
                    >
                      アカウントを増やす
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export const IncreaseAccountCountsModal = memo(IncreaseAccountCountsModalMemo);
