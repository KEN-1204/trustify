import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import useDashboardStore from "@/store/useDashboardStore";
import React, { useEffect, useState } from "react";
import styles from "./FirstLoginSettingUserProfileCompanyModal.module.css";
import axios from "axios";
import { BsCheck2 } from "react-icons/bs";
import { HiOutlineSelector } from "react-icons/hi";
import useStore from "@/store";
import { loadStripe } from "@stripe/stripe-js";
import Spinner from "@/components/Parts/Spinner/Spinner";
import Image from "next/image";
import useRootStore from "@/store/useRootStore";
import useThemeStore from "@/store/useThemeStore";

type Plans = {
  id: string;
  name: string;
  price: number;
  interval: string;
  currency: string;
};

export const FirstLoginSettingUserProfileCompanyModal = () => {
  const [loading, setIsLoading] = useState(false);
  const [plansState, setPlansState] = useState<Plans[] | null[]>([]);
  const [accountQuantity, setAccountQuantity] = useState<number | null>(1);
  const [selectedRadioButton, setSelectedRadioButton] = useState("business_plan");
  const sessionState = useStore((state) => state.sessionState);
  // const theme = useRootStore(useThemeStore, (state) => state.theme);

  const [pages, setPages] = useState(1);

  const [inputUserName, setInputUserName] = useState("");
  const [focussingInputUserName, setFocussingInputUserName] = useState(false);
  const [inputOccupation, setInputOccupation] = useState("");
  const [inputPurpose, setInputPurpose] = useState("");
  const [inputCompany, setInputCompany] = useState("");
  const [focussingInputCompany, setFocussingInputCompany] = useState(false);
  const [inputPosition, setInputPosition] = useState("");
  const [focussingInputPosition, setFocussingInputPosition] = useState(false);
  const [inputDepartment, setInputDepartment] = useState("");
  const [focussingInputDepartment, setFocussingInputDepartment] = useState(false);
  const [inputTEL, setInputTEL] = useState("");
  const [input, setInput] = useState("");

  // const logoSrc =
  //   theme === "light" ? "/assets/images/Trustify_Logo_icon_bg-black@3x.png" : "/assets/images/Trustify_logo_black.png";

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

  return (
    <>
      <div className={`${styles.overlay} `} onClick={handleCancelAndReset} />
      {/* {loadingGlobalState && (
        <div className={`${styles.loading_overlay} `}>
          <SpinnerIDS scale={"scale-[0.5]"} />
        </div>
      )} */}
      <div className={`${styles.container} `}>
        {/* メインコンテンツ コンテナ */}
        <div className={`${styles.main_contents_container}`}>
          {/* 左コンテナ */}
          <div className={`${styles.left_container} z-10 flex h-full w-5/12`}></div>
          {/* 右コンテナ */}
          <div className={`${styles.right_container} z-5 relative h-full w-7/12`}>
            <div className={`${styles.right_contents_container} min-w-[100%]  `}>
              <div className={`flex-center h-[50px] w-full`}>
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
              <h1 className={`mt-[8px] w-full text-center text-[24px] font-bold`}>TRUSTiFYへようこそ！</h1>
              <div className={`w-full space-y-2 py-[5px]`}>
                <div className="flex-center w-full flex-col text-[var(--color-text-sub)]">
                  <p>あともう少しで完了！</p>
                  <p>始める前にあなたについていくつか教えてください。</p>
                </div>
              </div>

              <div className={`${styles.right_x_scroll_container} h-full w-full`}>
                {/* 1ステップ目 用途確認 */}
                <div
                  className={`${styles.right_scroll_contents_container} transition-base03 h-full min-w-[100%] ${
                    pages === 2 ? `ml-[-100%]` : ``
                  } ${pages === 3 ? `ml-[-200%]` : ``}`}
                >
                  {/* プロフィール入力エリア */}
                  <div className="flex w-full flex-col items-center justify-start space-y-[20px] py-[20px]">
                    {/* 名前 */}
                    <div className="flex w-full flex-col items-start justify-start space-y-1">
                      <div className="flex w-full text-[13px] ">
                        <span className="font-[600] text-[var(--color-text-sub)]">
                          あなたのお名前を入力してください。
                        </span>
                        {(!inputUserName || focussingInputUserName) && (
                          <span className="ml-[3px] font-bold text-[#ff4444]">※</span>
                        )}
                        {inputUserName && !focussingInputUserName && (
                          <BsCheck2 className="ml-[3px]  text-[19px] text-[var(--color-bg-brand-f)]" />
                        )}
                      </div>
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        placeholder="例：山田 花子、花子、山田"
                        value={inputUserName}
                        onChange={(e) => setInputUserName(e.target.value)}
                        onFocus={() => setFocussingInputUserName(true)}
                        onBlur={() => setFocussingInputUserName(false)}
                      />
                    </div>
                    {/* 仕事、職種 */}
                    <div className="relative flex w-full flex-col items-start justify-start space-y-1">
                      <div className="flex w-full text-[13px] font-bold">
                        <span className="text-[var(--color-text-sub)]">どのようなお仕事をされていますか？</span>
                        {!inputOccupation && <span className="ml-[3px] font-bold text-[#ff4444]">※</span>}
                        {inputOccupation && (
                          <BsCheck2 className="ml-[3px] text-[19px] text-[var(--color-bg-brand-f)]" />
                        )}
                      </div>
                      <select
                        className={`${styles.select_box} ${!inputOccupation ? `text-[#9ca3af]` : ``}`}
                        placeholder="例：代表取締役CEO、営業部"
                        value={inputOccupation}
                        onChange={(e) => setInputOccupation(e.target.value)}
                      >
                        <option value="">回答を選択してください</option>
                        <option value="社長/CEO">社長/CEO</option>
                        <option value="取締役・役員">取締役・役員</option>
                        <option value="プロジェクト/プログラム管理">プロジェクト/プログラム管理</option>
                        <option value="営業">営業</option>
                        <option value="マーケティング">マーケティング</option>
                        <option value="クリエイティブ">クリエイティブ</option>
                        <option value="ソフトウェア開発">ソフトウェア開発</option>
                        <option value="開発・設計">開発・設計</option>
                        <option value="生産技術">生産技術</option>
                        <option value="製造">製造</option>
                        <option value="品質管理・品質保証">品質管理・品質保証</option>
                        <option value="人事">人事</option>
                        <option value="経理">経理</option>
                        <option value="総務">総務</option>
                        <option value="法務">法務</option>
                        <option value="財務">財務</option>
                        <option value="情報システム/IT管理者">情報システム/IT管理者</option>
                        <option value="CS/カスタマーサービス">CS/カスタマーサービス</option>
                        <option value="購買">購買</option>
                        <option value="その他">その他</option>
                      </select>
                      {/* selectタグアイコン */}
                      <div className={`${styles.close_btn_number}`}>
                        <HiOutlineSelector className="text-[24px] " />
                      </div>
                    </div>
                    {/* 部署名 */}
                    <div className="flex w-full flex-col items-start justify-start space-y-1">
                      <div className="flex w-full text-[13px] font-bold">
                        <span className="text-[var(--color-text-sub)]">あなたの部署を教えてください。</span>
                        {(!inputDepartment || focussingInputDepartment) && (
                          <span className="ml-[3px] font-bold text-[#ff4444]">※</span>
                        )}
                        {inputDepartment && !focussingInputDepartment && (
                          <BsCheck2 className="ml-[3px]  text-[19px] text-[var(--color-bg-brand-f)]" />
                        )}
                      </div>
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        placeholder="例：代表取締役CEO、営業部"
                        value={inputDepartment}
                        onChange={(e) => setInputDepartment(e.target.value)}
                        onFocus={() => setFocussingInputDepartment(true)}
                        onBlur={() => setFocussingInputDepartment(false)}
                      />
                    </div>
                  </div>

                  {/* メンバーシップを開始するボタン */}
                  <div className="w-full pt-[30px]">
                    <button
                      className={`flex-center h-[40px] w-full cursor-pointer rounded-[6px] bg-[var(--color-bg-brand-f)] font-bold text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`}
                      onClick={() => setPages((prev) => prev + 1)}
                      // onClick={() => {
                      //   if (selectedRadioButton === "business_plan")
                      //     processSubscription("price_1NmPoFFTgtnGFAcpw1jRtcQs", accountQuantity);
                      //   if (selectedRadioButton === "premium_plan")
                      //     processSubscription("price_1NmQAeFTgtnGFAcpFX60R4YY", accountQuantity);
                      // }}
                    >
                      {!loading && <span>続ける</span>}
                      {loading && <SpinnerIDS scale={"scale-[0.4]"} />}
                      {/* {!loading && <Spinner />} */}
                    </button>
                  </div>
                </div>
                {/* 2ステップ目 */}
                <div className={`${styles.right_scroll_contents_container} h-full min-w-[100%]`}>
                  {/* プロフィール入力エリア */}
                  <div className="flex w-full flex-col items-center justify-start space-y-[20px] py-[20px]">
                    {/* 名前 */}
                    <div className="flex w-full flex-col items-start justify-start space-y-1">
                      <div className="flex w-full text-[13px] ">
                        <span className="font-[600] text-[var(--color-text-sub)]">
                          あなたのお名前を入力してください。
                        </span>
                        {(!inputUserName || focussingInputUserName) && (
                          <span className="ml-[3px] font-bold text-[#ff4444]">※</span>
                        )}
                        {inputUserName && !focussingInputUserName && (
                          <BsCheck2 className="ml-[3px]  text-[19px] text-[var(--color-bg-brand-f)]" />
                        )}
                      </div>
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        placeholder="例：山田 花子、花子、山田"
                        value={inputUserName}
                        onChange={(e) => setInputUserName(e.target.value)}
                        onFocus={() => setFocussingInputUserName(true)}
                        onBlur={() => setFocussingInputUserName(false)}
                      />
                    </div>
                    {/* 会社名 */}
                    <div className="flex w-full flex-col items-start justify-start space-y-1">
                      <div className="flex w-full text-[13px] font-bold">
                        <span className="text-[var(--color-text-sub)]">
                          あなたの会社名（正式名称・個人名や屋号）を入力してください。
                        </span>
                        {(!inputCompany || focussingInputCompany) && (
                          <span className="ml-[3px] font-bold text-[#ff4444]">※</span>
                        )}
                        {inputCompany && !focussingInputCompany && (
                          <BsCheck2 className="ml-[3px]  text-[19px] text-[var(--color-bg-brand-f)]" />
                        )}
                      </div>
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        placeholder="例：株式会社〇〇、〇〇株式会社"
                        value={inputCompany}
                        onChange={(e) => setInputCompany(e.target.value)}
                        onFocus={() => setFocussingInputCompany(true)}
                        onBlur={() => setFocussingInputCompany(false)}
                      />
                    </div>
                    {/* 部署名 */}
                    <div className="flex w-full flex-col items-start justify-start space-y-1">
                      <div className="flex w-full text-[13px] font-bold">
                        <span className="text-[var(--color-text-sub)]">あなたの部署を教えてください。</span>
                        {(!inputDepartment || focussingInputDepartment) && (
                          <span className="ml-[3px] font-bold text-[#ff4444]">※</span>
                        )}
                        {inputDepartment && !focussingInputDepartment && (
                          <BsCheck2 className="ml-[3px]  text-[19px] text-[var(--color-bg-brand-f)]" />
                        )}
                      </div>
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        placeholder="例：代表取締役CEO、営業部"
                        value={inputDepartment}
                        onChange={(e) => setInputDepartment(e.target.value)}
                        onFocus={() => setFocussingInputDepartment(true)}
                        onBlur={() => setFocussingInputDepartment(false)}
                      />
                    </div>
                    {/* 役職 */}
                    <div className="flex w-full flex-col items-start justify-start space-y-1">
                      <div className="flex w-full text-[13px] font-bold">
                        <span className="text-[var(--color-text-sub)]">あなたの役職を教えてください。</span>
                        {(!inputPosition || focussingInputPosition) && (
                          <span className="ml-[3px] font-bold text-[#ff4444]">※</span>
                        )}
                        {inputPosition && !focussingInputPosition && (
                          <BsCheck2 className="ml-[3px]  text-[19px] text-[var(--color-bg-brand-f)]" />
                        )}
                      </div>
                      <select
                        className={`${styles.select_box} ${!inputPosition ? `text-[#9ca3af]` : ``}`}
                        placeholder="例：代表取締役CEO、営業部"
                        value={inputPosition}
                        onChange={(e) => setInputPosition(e.target.value)}
                      >
                        <option value="">回答を選択してください</option>
                        <option value="1 代表者">代表者</option>
                        <option value="2 取締役/役員">取締役/役員</option>
                        <option value="3 部長">部長</option>
                        <option value="4 課長">課長</option>
                        <option value="5 課長未満">課長未満</option>
                        <option value="6 所長・工場長">所長・工場長</option>
                        <option value="7 フリーランス・個人事業主">フリーランス・個人事業主</option>
                        {/* <option value="8 不明">不明</option> */}
                      </select>
                    </div>
                  </div>

                  {/* メンバーシップを開始するボタン */}
                  <div className="w-full pt-[30px]">
                    <button
                      className={`flex-center h-[40px] w-full cursor-pointer rounded-[6px] bg-[var(--color-bg-brand-f)] font-bold text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`}
                      onClick={() => setPages((prev) => prev + 1)}
                      // onClick={() => {
                      //   if (selectedRadioButton === "business_plan")
                      //     processSubscription("price_1NmPoFFTgtnGFAcpw1jRtcQs", accountQuantity);
                      //   if (selectedRadioButton === "premium_plan")
                      //     processSubscription("price_1NmQAeFTgtnGFAcpFX60R4YY", accountQuantity);
                      // }}
                    >
                      {!loading && <span>続ける</span>}
                      {loading && <SpinnerIDS scale={"scale-[0.4]"} />}
                      {/* {!loading && <Spinner />} */}
                    </button>
                  </div>
                </div>
                {/* 3ステップ目 */}
                <div className={`${styles.right_scroll_contents_container} h-full min-w-[100%]`}>
                  {/* メンバーシップを開始するボタン */}
                  <div className="w-full pt-[30px]">
                    <button
                      className={`flex-center h-[40px] w-full cursor-pointer rounded-[6px] bg-[var(--color-bg-brand-f)] font-bold text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`}
                      onClick={() => setPages(1)}
                      // onClick={() => {
                      //   if (selectedRadioButton === "business_plan")
                      //     processSubscription("price_1NmPoFFTgtnGFAcpw1jRtcQs", accountQuantity);
                      //   if (selectedRadioButton === "premium_plan")
                      //     processSubscription("price_1NmQAeFTgtnGFAcpFX60R4YY", accountQuantity);
                      // }}
                    >
                      {!loading && <span>メンバーシップを開始する</span>}
                      {loading && <SpinnerIDS scale={"scale-[0.4]"} />}
                      {/* {!loading && <Spinner />} */}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
