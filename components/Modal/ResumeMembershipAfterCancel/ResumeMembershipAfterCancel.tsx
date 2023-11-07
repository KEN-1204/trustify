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
  // ローディング
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  // ステップ 再開するか、チーム削除して新しく作るか
  const [resumeStep, setResumeStep] = useState("");
  // プラン選択、決済手段選択ステップ
  const [stepContents, setStepContents] = useState("");
  const [accountQuantity, setAccountQuantity] = useState<number | null>(1);
  const [selectedRadioButton, setSelectedRadioButton] = useState("business_plan");
  const [planBusiness, setPlanBusiness] = useState<Plans | null>(null);
  const [planPremium, setPlanPremium] = useState<Plans | null>(null);
  // ユーザーのデフォルトの支払い方法
  // const [defaultPaymentMethod, setDefaultPaymentMethod] = useState(null);
  const defaultPaymentMethodState = useDashboardStore((state) => state.defaultPaymentMethodState);
  const setDefaultPaymentMethodState = useDashboardStore((state) => state.setDefaultPaymentMethodState);

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
        // theme: `${theme === "light" ? "light" : "dark"}`,
      });
    }
  };

  // 初回マウント時にStripeのプラン2つのpriceIdを取得する
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

  // 初回マウント時にStripeの現在のデフォルト支払い方法を取得する
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

  // メンバーシップを再開
  const handleResume = async (planId: string, quantity: number | null) => {
    if (!userProfileState) return alert("エラー：ユーザー情報が確認できませんでした");
    if (!sessionState) return alert("エラー：セッション情報が確認できませんでした");
    if (!accountQuantity) return alert("メンバーの人数を入力してください");
    setIsLoadingSubmit(true);

    try {
      const payload = {
        stripeCustomerId: userProfileState.stripe_customer_id,
        planId: planId,
        quantity: quantity,
        companyId: userProfileState.company_id,
        dbSubscriptionId: userProfileState.subscription_id,
      };
      const {
        data: { subscriptionItem, error: axiosStripeError },
      } = await axios.post(`/api/subscription/resume-subscription`, payload, {
        headers: {
          Authorization: `Bearer ${sessionState.access_token}`,
        },
      });
      console.log(
        `🔥handleChangeQUantity Apiからのdata subscriptionItem`,
        subscriptionItem,
        "axiosStripeError",
        axiosStripeError
      );
    } catch (e: any) {
      console.error("サブスク再開エラー", e);
      alert(`エラーが発生しました: ${e.message}`);
    }
    setIsLoadingSubmit(false);
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

  // カードブランドURL
  const cardBrandURL = () => {
    switch (defaultPaymentMethodState.card.brand) {
      case "visa":
        return "/assets/images/icons/cards/icons8-visa-60.png";

      case "amex":
        return "/assets/images/icons/cards/AXP_BlueBoxLogo_Alternate_SMALLscale_RGB_DIGITAL_80x80.png";

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

  console.log(
    "ResumeMembershipAfterCancelレンダリング",
    "✅selectedRadioButton",
    selectedRadioButton,
    "✅accountQuantity",
    accountQuantity,
    "✅planBusiness",
    planBusiness,
    "✅planPremium",
    planPremium,
    "✅userProfileState",
    userProfileState,
    "✅defaultPaymentMethodState",
    defaultPaymentMethodState
    // "✅defaultPaymentMethod",
    // defaultPaymentMethod,
    // "✅defaultPaymentMethodError",
    // defaultPaymentMethodError,
    // "✅isLoadingPayment",
    // isLoadingPayment
  );

  if (!userProfileState) return <FallbackResumeMembershipAfterCancel />;

  return (
    <div className={`fixed inset-0 z-[2000] ${styles.bg_image}`} ref={modalContainerRef}>
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
                className={`transition-base02 flex-center relative max-h-[41px] w-full cursor-pointer rounded-[8px] bg-[#40576d12] px-[25px] py-[10px] text-[14px] font-bold  hover:bg-[var(--bright-green)] hover:text-[#fff]`}
                onClick={() => setResumeStep("")}
              >
                <span>チームを削除して新しく始める</span>
                {/* {isLoadingPortal && <SpinnerIDS scale={"scale-[0.4]"} />} */}
              </button>
            </div>

            {/* 注意書きエリア */}
            <div className={`mt-[20px] w-full space-y-[5px] text-[12px] text-[#19171199]`}>
              <p>
                「チームを削除して新しく始める」をクリックすることで、以前に保存したデータに一切アクセスができなくなります。
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
                    if (stepContents === "resume_2") {
                      setStepContents("");
                    } else {
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
                  </div>
                </div>
                {/* ロゴからチェックエリアまで */}

                {/* 左スライドスクロールコンテナ */}
                <div
                  className={`relative h-full w-full min-w-[40vw] max-w-[40vw] ${
                    styles.left_slide_scroll_container
                  } transition-base03 ${stepContents === "resume_2" ? `ml-[-100%]` : ``}`}
                >
                  {/* 左スライドコンテンツラッパー */}
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

                    {/* ラジオボタン */}
                    <div className="flex w-full flex-col items-center justify-start space-y-[20px] py-[20px]">
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

                    {/* メンバー人数選択 */}
                    <div className="flex w-full items-center justify-between pt-[20px]">
                      <div className="relative cursor-pointer text-[20px] font-bold text-[var(--color-text-title)]">
                        メンバー人数
                      </div>
                      <div className="flex items-center justify-end space-x-2 font-semibold">
                        <input
                          type="number"
                          min="1"
                          className={`${styles.input_box}`}
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

                    {/* メンバーシップを開始するボタン */}
                    <div className="w-full pt-[30px]">
                      <button
                        className={`flex-center h-[40px] w-full cursor-pointer rounded-[6px] bg-[var(--color-bg-brand-f)] font-bold text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`}
                        // onClick={() => {
                        //   if (selectedRadioButton === "business_plan" && !!planBusiness)
                        //     handleResume(planBusiness.id, accountQuantity);
                        //   if (selectedRadioButton === "premium_plan" && !!planPremium)
                        //     handleResume(planPremium.id, accountQuantity);
                        // }}
                        onClick={() => setStepContents("resume_2")}
                      >
                        {/* {!isLoading && <span>メンバーシップを開始する</span>} */}
                        {!isLoadingSubmit && <span>続ける</span>}
                        {isLoadingSubmit && <SpinnerIDS scale={"scale-[0.4]"} />}
                      </button>
                    </div>
                  </div>
                  <div className={`${styles.left_slide_scroll_right}`}>
                    <div className="mt-[20px] h-auto w-full text-[20px] font-bold text-[var(--color-text-title)]">
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

                    {/* カード情報 */}
                    <div className="flex w-full items-center justify-between pt-[30px]">
                      {defaultPaymentMethodState && (
                        <div className="flex h-[30px] items-center">
                          <div
                            className={`relative mb-[-5px] ${
                              defaultPaymentMethodState === "amex" ? `h-[28px] w-[28px]` : `h-[25px] w-[25px]`
                            }`}
                          >
                            <Image
                              src={cardBrandURL()}
                              alt="card-brand"
                              fill
                              sizes="64px"
                              className="z-[1] h-full w-full object-contain object-center"
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
                    </div>
                    {/* メンバーシップを開始するボタン */}
                    <div className="mt-[45px] w-full">
                      <button
                        className={`flex-center h-[40px] w-full cursor-pointer rounded-[6px] bg-[var(--color-bg-brand-f)] font-bold text-[#fff] ${
                          isLoadingPortal ? `` : `hover:bg-[var(--color-bg-brand-f-deep)]`
                        }`}
                        // onClick={() => {
                        //   if (selectedRadioButton === "business_plan" && !!planBusiness)
                        //     handleResume(planBusiness.id, accountQuantity);
                        //   if (selectedRadioButton === "premium_plan" && !!planPremium)
                        //     handleResume(planPremium.id, accountQuantity);
                        // }}
                        // onClick={loadPortal}
                        // onClick={getPaymentMethodFromStripe}
                      >
                        {/* {!isLoading && <span>メンバーシップを開始する</span>} */}
                        {!isLoadingPortal && <span>メンバーシップを始める</span>}
                        {isLoadingPortal && <SpinnerIDS scale={"scale-[0.4]"} />}
                      </button>
                    </div>
                    <div className="mb-[30px] w-full pt-[15px]">
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
                {/* 左スライドスクロールコンテナ ここまで */}
              </div>
              {/* 左コンテナ ここまで */}
              {/* 右コンテナ */}
              <div className={`${styles.right_container} relative flex h-full w-6/12`}>
                <Image
                  //   src={`/assets/images/team/team1.jpg`}
                  src={`/assets/images/beautiful/balloon1.jpg`}
                  alt=""
                  blurDataURL={`/assets/images/hero/placeholder/bg_slide_black1x_placeholder.png`}
                  placeholder="blur"
                  className="z-[-1] h-full w-full object-cover object-center"
                  fill
                  sizes="10vw"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export const ResumeMembershipAfterCancel = memo(ResumeMembershipAfterCancelMemo);
