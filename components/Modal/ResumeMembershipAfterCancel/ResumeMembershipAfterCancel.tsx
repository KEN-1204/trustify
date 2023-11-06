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
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  // ステップ
  const [resumeStep, setResumeStep] = useState("");
  const [accountQuantity, setAccountQuantity] = useState<number | null>(1);
  const [selectedRadioButton, setSelectedRadioButton] = useState("business_plan");
  const [planBusiness, setPlanBusiness] = useState<Plans | null>(null);
  const [planPremium, setPlanPremium] = useState<Plans | null>(null);

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

  // ラジオボタン切り替え用state
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedRadioButton(e.target.value);
  };

  // メンバーシップを再開
  const handleResume = async () => {
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

  // 【サブスクリプションの開始、登録、Stripe支払いチェックアウトページにリダイレクト】
  // const processSubscription = async (planId: string) => {
  //   const processSubscription = async (planId: string, quantity: number | null) => {
  //     if (!sessionState) return;
  //     if (!accountQuantity) return alert("メンバーの人数を入力してください");
  //     setIsLoading(true);

  //     // const response = await axios.get(`/api/subscription/${planId}`, {
  //     const response = await axios.get(`/api/subscription/${planId}?quantity=${quantity}`, {
  //       headers: {
  //         Authorization: `Bearer ${sessionState.access_token}`,
  //       },
  //     });
  //     console.log(`🔥Pricingコンポーネント Apiからのresponse`, response);

  //     // クライアントStripeインスタンスをロード
  //     const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);
  //     // Stripeのチェックアウトページにリダイレクト
  //     await stripe?.redirectToCheckout({ sessionId: response.data.id });
  //   };

  console.log("ResumeMembershipAfterCancelレンダリング");
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
                className={`transition-base02 flex-center relative max-h-[41px] w-full cursor-pointer rounded-[8px] bg-[#0d99ff] px-[25px] py-[10px] text-[14px] font-bold  text-[#fff]  hover:text-[#fff] ${
                  isLoadingPortal ? `` : `hover:bg-[var(--color-bg-brand-f-hover)]`
                }`}
                onClick={() => setResumeStep("resume")}
              >
                {!isLoadingPortal && <span>再開する</span>}
                {isLoadingPortal && <SpinnerIDS scale={"scale-[0.4]"} />}
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
              <div className={`${styles.left_container} h-full w-6/12 `}>
                {/* 戻るボタン */}
                <div
                  className="flex-center absolute left-[20px] top-[20px] z-0 h-[35px] w-[35px] cursor-pointer rounded-full hover:bg-[var(--color-bg-sub-icon)]"
                  data-text="戻る"
                  onMouseEnter={(e) => handleOpenTooltip(e, "top")}
                  onMouseLeave={handleCloseTooltip}
                  onClick={() => {
                    setResumeStep("");
                    handleCloseTooltip();
                  }}
                >
                  <FiArrowLeft className="pointer-events-none text-[26px]" />
                </div>
                {/* <div className={`${styles.left_container} h-full w-full`}> */}
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
                <h1 className={`mt-[10px] w-full text-center text-[24px] font-bold`}>
                  プランを選んで再び始めましょう！
                </h1>
                {/* <h1 className={`w-full text-[24px] font-bold`}>プランを選んで早速始めましょう！</h1> */}
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
                        className="relative cursor-pointer pl-[40px] text-[20px] font-bold text-[var(--color-text)]"
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
                        className="relative cursor-pointer pl-[40px] text-[20px] font-bold text-[var(--color-text)]"
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
                  <div className="relative cursor-pointer text-[20px] font-bold text-[var(--color-text)]">
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
                    //     processSubscription(planBusiness.id, accountQuantity);
                    //   if (selectedRadioButton === "premium_plan" && !!planPremium)
                    //     processSubscription(planPremium.id, accountQuantity);
                    // }}
                    onClick={() => setResumeStep("")}
                  >
                    <span>メンバーシップを開始する</span>
                    {/* {!loading && <span>メンバーシップを開始する</span>}
                    {loading && <SpinnerIDS scale={"scale-[0.4]"} />} */}
                  </button>
                </div>
              </div>
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
