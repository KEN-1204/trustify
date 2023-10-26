import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import useDashboardStore from "@/store/useDashboardStore";
import React, { useEffect, useRef, useState } from "react";
import styles from "./SubscriptionPlanModalForFreeUser.module.css";
import axios from "axios";
import { BsCheck2 } from "react-icons/bs";
import useStore from "@/store";
import { loadStripe } from "@stripe/stripe-js";
import Spinner from "@/components/Parts/Spinner/Spinner";
import Image from "next/image";
import { MdClose } from "react-icons/md";
import { TooltipModal } from "@/components/Parts/Tooltip/TooltipModal";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { IoLogOutOutline } from "react-icons/io5";
import { toast } from "react-toastify";

type Plans = {
  id: string;
  name: string;
  price: number;
  interval: string;
  currency: string;
};

export const SubscriptionPlanModalForFreeUser = () => {
  const supabase = useSupabaseClient();
  const [loading, setIsLoading] = useState(false);
  const [plansState, setPlansState] = useState<Plans[] | null[]>([]);
  const [accountQuantity, setAccountQuantity] = useState<number | null>(1);
  const [selectedRadioButton, setSelectedRadioButton] = useState("business_plan");
  const sessionState = useStore((state) => state.sessionState);

  //   useEffect(() => {
  //     const getPlansFromStripe = async () => {
  //       if (!!plansState.length) return console.log("既にプラン取得済み", plansState, !!plansState.length);
  //       const { data: plans } = await axios.get("/api/get-stripe-plans");
  //       console.log("stripe-plansモーダル getPlansFromStripe plans", plans);

  //       setPlansState(plans);
  //     };

  //     getPlansFromStripe();
  //   }, []);

  // キャンセルでモーダルを閉じる
  const handleCancelAndReset = () => {
    // setIsOpenSettingAccountModal(false);
  };

  // ラジオボタン切り替え用state
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedRadioButton(e.target.value);
  };

  // 【サブスクリプションの開始、登録、Stripe支払いチェックアウトページにリダイレクト】
  // const processSubscription = async (planId: string) => {
  const processSubscription = async (planId: string, quantity: number | null) => {
    if (!sessionState) return;
    if (!accountQuantity) return alert("メンバーの人数を入力してください");
    setIsLoading(true);

    // const response = await axios.get(`/api/subscription/${planId}`, {
    const response = await axios.get(`/api/subscription/${planId}?quantity=${quantity}`, {
      headers: {
        Authorization: `Bearer ${sessionState.access_token}`,
      },
    });
    console.log(`🔥Pricingコンポーネント Apiからのresponse`, response);

    // クライアントStripeインスタンスをロード
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);
    // Stripeのチェックアウトページにリダイレクト
    await stripe?.redirectToCheckout({ sessionId: response.data.id });
  };

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

  return (
    <>
      <div className={`${styles.overlay} `} onClick={handleCancelAndReset} />
      {/* {loadingGlobalState && (
        <div className={`${styles.loading_overlay} `}>
          <SpinnerIDS scale={"scale-[0.5]"} />
        </div>
      )} */}
      <div className={`${styles.container} `} ref={modalContainerRef}>
        {hoveredItemPosModal && <TooltipModal />}
        {/* クローズボタン */}
        <button
          className={`flex-center z-100 shadow-all-md absolute bottom-[-23px] right-[-60px] h-[35px] w-[35px] rounded-full bg-[var(--color-sign-out-bg)] hover:bg-[var(--color-sign-out-bg-hover)]`}
          // className={`flex-center z-100 group absolute right-[-45px] top-[5px] h-[35px] w-[35px] rounded-full bg-[#00000090] hover:bg-[#000000c0]`}
          data-text="ログアウトする"
          onMouseEnter={(e) => handleOpenTooltip(e, "top")}
          onMouseLeave={handleCloseTooltip}
          onClick={handleSignOut}
        >
          <IoLogOutOutline className="mr-[-3px] text-[20px] text-[#fff]" />
        </button>
        {/* メインコンテンツ コンテナ */}
        <div className={`${styles.main_contents_container}`}>
          <div className={`${styles.left_container} h-full w-6/12 `}>
            <div className={`flex-center h-[40px] w-full`}>
              <div className="relative flex h-[60px] w-[145px] select-none items-center justify-center">
                <Image
                  src={`/assets/images/Trustify_Logo_icon_bg-black@3x.png`}
                  alt=""
                  className="h-full w-[90%] object-contain"
                  fill
                  priority={true}
                  // sizes="10vw"
                />
              </div>
            </div>
            <h1 className={`mt-[10px] w-full text-center text-[24px] font-bold`}>プランを選んで早速始めましょう！</h1>
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
                    //   onChange={(e) => console.log(e)}
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
                    //   onChange={(e) => console.log(e)}
                    checked={selectedRadioButton === "premium_plan"}
                    className="peer/premium_plan invisible absolute"
                  />
                  <label
                    htmlFor="premium_plan"
                    className="relative cursor-pointer pl-[40px] text-[20px] font-bold text-[var(--color-text)]"
                    //   className="relative cursor-pointer pl-[40px] text-[20px] font-bold text-[var(--color-text)]  peer-checked/id:text-[var(--color-bg-brand-f)] peer-checked/premium_plan:text-[var(--color-bg-brand-f)]"
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
              <div className="relative cursor-pointer text-[20px] font-bold text-[var(--color-text)]">メンバー人数</div>
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
                      // 入力値がマイナスかチェック
                      if (numValue <= 0) {
                        setAccountQuantity(1);
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
                onClick={() => {
                  if (selectedRadioButton === "business_plan")
                    processSubscription("price_1NmPoFFTgtnGFAcpw1jRtcQs", accountQuantity);
                  if (selectedRadioButton === "premium_plan")
                    processSubscription("price_1NmQAeFTgtnGFAcpFX60R4YY", accountQuantity);
                }}
              >
                {!loading && <span>メンバーシップを開始する</span>}
                {loading && <SpinnerIDS scale={"scale-[0.4]"} />}
                {/* {!loading && <Spinner />} */}
              </button>
            </div>
          </div>
          <div className={`${styles.right_container} flex h-full w-6/12 `}></div>
          {/* <div className={`${styles.right_container_a} flex h-full w-6/12 overflow-hidden`}>
            <Image
              src={"/assets/images/team/annie-spratt-MChSQHxGZrQ-unsplash.jpg"}
              alt=
              fill
              className="object-contain object-center"
            />
          </div> */}
        </div>
      </div>
    </>
  );
};
