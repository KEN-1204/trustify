import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import useStore from "@/store";
import useDashboardStore from "@/store/useDashboardStore";
import useThemeStore from "@/store/useThemeStore";
import axios from "axios";
import { format } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { FC, memo, useEffect, useState } from "react";
import { AiOutlineMinusCircle, AiOutlinePlusCircle } from "react-icons/ai";

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
  // アカウントを増やす・減らすモーダル開閉状態
  const isOpenChangeAccountCountsModal = useDashboardStore((state) => state.isOpenChangeAccountCountsModal);
  const setIsOpenChangeAccountCountsModal = useDashboardStore((state) => state.setIsOpenChangeAccountCountsModal);

  // useQueryPaymentAndPlanで製品テーブルからデータ一覧を取得
  console.log(
    "useQuery前 ",
    "userProfileState?.company_id",
    userProfileState?.company_id,
    "userProfileState?.id",
    userProfileState?.id
  );

  // Stripeポータルへ移行させるためのURLをAPIルートにGETリクエスト
  // APIルートからurlを取得したらrouter.push()でStipeカスタマーポータルへページ遷移
  const loadPortal = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get("/api/portal", {
        headers: {
          Authorization: `Bearer ${sessionState.access_token}`,
        },
      });
      console.log("stripe billingPortalのurlを取得成功", data);
      router.push(data.url);
      //   setIsLoading(false);
    } catch (e: any) {
      setIsLoading(false);
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
          <h2 className={`text-[18px] font-bold !text-[var(--color-text-title)]`}>支払いとプラン</h2>

          <div className="mt-[20px] min-h-[55px] w-full">
            <h4 className="text-[18px] font-bold !text-[var(--color-text-title)]">
              会社・チームのサブスクリプション：<span>{userProfileState?.profile_name}さんのチーム</span>
            </h4>
            <div
              className={`mt-[24px] flex w-full flex-col rounded-[4px] border border-solid border-[var(--color-border-deep)] p-[16px]`}
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
                  <div className="mt-[16px] flex w-full text-[15px] text-[var(--color-text-sub)]">
                    <p>
                      次回請求予定日：
                      <span>
                        {userProfileState?.current_period_end
                          ? format(new Date(userProfileState.current_period_end), "yyyy年MM月dd日")
                          : ""}
                      </span>
                    </p>
                  </div>
                  <div className="mt-[8px] flex w-full text-[15px] text-[var(--color-text-sub)]">
                    <p>
                      ￥<span>{planToPrice(userProfileState?.subscription_plan)}</span>/月　×　メンバーアカウント：
                      <span>{userProfileState?.accounts_to_create}</span>
                    </p>
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
                  onClick={loadPortal}
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
                  className={`transition-base01 flex-center max-h-[41px] w-[50%] min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--color-bg-sub)] px-[25px] py-[10px] text-[14px] font-bold !text-[var(--color-text-title)] ${
                    isLoading ? `` : `hover:bg-[var(--bright-red)] hover:!text-[#fff]`
                  }`}
                  onClick={() => {
                    console.log("アカウント数を減らすクリック");
                    setIsOpenChangeAccountCountsModal("decrease");
                  }}
                >
                  {userProfileState?.subscription_plan !== "free_plan" && !isLoading && <span>アカウントを減らす</span>}
                  {isLoading && <SpinnerIDS scale={"scale-[0.4]"} />}
                </button>
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
    </>
  );
};

export const SettingPaymentAndPlan = memo(SettingPaymentAndPlanMemo);
