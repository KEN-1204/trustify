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

  // ユーザー名
  const [inputUserName, setInputUserName] = useState("");
  const [focussingInputUserName, setFocussingInputUserName] = useState(false);
  const [checkedUserName, setCheckedUserName] = useState(false);
  // 職種
  const [inputOccupation, setInputOccupation] = useState("");
  const [checkedOccupation, setCheckedOccupation] = useState(false);
  // 利用用途
  const [inputPurpose, setInputPurpose] = useState("");
  const [checkedPurpose, setCheckedPurpose] = useState(false);
  // 会社
  const [inputCompany, setInputCompany] = useState("");
  const [focussingInputCompany, setFocussingInputCompany] = useState(false);
  const [checkedCompany, setCheckedCompany] = useState(false);
  // 部署
  const [inputDepartment, setInputDepartment] = useState("");
  const [focussingInputDepartment, setFocussingInputDepartment] = useState(false);
  const [checkedDepartment, setCheckedDepartment] = useState(false);
  // 役職
  const [inputPosition, setInputPosition] = useState("");
  const [checkedPosition, setCheckedPosition] = useState(false);
  // 規模・従業員数
  const [inputNumberOfEmployeeClass, setInputNumberOfEmployeeClass] = useState("");
  const [checkedNumberOfEmployeeClass, setCheckedNumberOfEmployeeClass] = useState(false);
  // 電話番号
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

  const toHalfWidthAndSpace = (strVal: string) => {
    // 全角文字コードの範囲は65281 - 65374、スペースの全角文字コードは12288
    return strVal
      .replace(/[！-～]/g, (match) => {
        return String.fromCharCode(match.charCodeAt(0) - 0xfee0);
      })
      .replace(/　/g, " "); // 全角スペースを半角スペースに
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
          <div
            className={`${pages === 1 ? `${styles.left_container}` : ``} ${
              pages === 2 ? `${styles.left_container2}` : ``
            } ${pages === 3 ? `${styles.left_container3}` : ``} transition-base03 z-10 flex h-full w-5/12`}
          ></div>
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
                  <p>あなた専用に体験をカスタマイズします。</p>
                </div>
              </div>

              <div className={`${styles.right_x_scroll_container} h-full w-full`}>
                {/* 1ステップ目 プロフィール入力 用途確認 */}
                <div
                  className={`${styles.right_scroll_contents_container} transition-base03 h-full min-w-[100%] ${
                    pages === 2 ? `ml-[-100%]` : ``
                  } ${pages === 3 ? `ml-[-200%]` : ``}`}
                >
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
                        {checkedUserName && !inputUserName && (
                          <span className="ml-[3px] font-bold text-[#ff4444]">未入力です</span>
                        )}
                        {inputUserName && !focussingInputUserName && (
                          <BsCheck2 className="ml-[3px]  text-[19px] text-[var(--color-bg-brand-f)]" />
                        )}
                      </div>
                      <input
                        type="text"
                        className={`${styles.input_box} ${checkedUserName && !inputUserName ? `${styles.error}` : ``}`}
                        placeholder="例：山田 花子、花子、山田"
                        value={inputUserName}
                        onChange={(e) => setInputUserName(e.target.value)}
                        onFocus={() => setFocussingInputUserName(true)}
                        onBlur={() => {
                          setInputUserName(toHalfWidthAndSpace(inputUserName.trim()));
                          setFocussingInputUserName(false);
                          if (checkedUserName && !!inputUserName) setCheckedUserName(false);
                        }}
                      />
                    </div>
                    {/* 仕事、職種 */}
                    <div className="relative flex w-full flex-col items-start justify-start space-y-1">
                      <div className="flex w-full text-[13px] font-bold">
                        <span className="text-[var(--color-text-sub)]">どのようなお仕事をされていますか？</span>
                        {!inputOccupation && <span className="ml-[3px] font-bold text-[#ff4444]">※</span>}
                        {inputOccupation && (
                          <BsCheck2 className="ml-[5px] text-[19px] text-[var(--color-bg-brand-f)]" />
                        )}
                        {checkedOccupation && !inputOccupation && (
                          <span className="ml-[3px] font-bold text-[#ff4444]">未選択です</span>
                        )}
                      </div>
                      <select
                        className={`${styles.select_box} ${!inputOccupation ? `text-[#9ca3af]` : ``} ${
                          checkedOccupation && !inputOccupation ? `${styles.error}` : ``
                        }`}
                        placeholder="例：代表取締役CEO、営業部"
                        value={inputOccupation}
                        onChange={(e) => {
                          setInputOccupation(e.target.value);
                          if (checkedOccupation && !!inputOccupation) setCheckedOccupation(false);
                        }}
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
                      {/* 上下矢印アイコン */}
                      <div className={`${styles.close_btn_number}`}>
                        <HiOutlineSelector className="text-[24px] " />
                      </div>
                    </div>
                    {/* 利用用途 */}
                    <div className="relative flex w-full flex-col items-start justify-start space-y-1">
                      <div className="flex w-full text-[13px] font-bold">
                        <span className="text-[var(--color-text-sub)]">どんな用途でご利用ですか？</span>
                        {!inputPurpose && <span className="ml-[3px] font-bold text-[#ff4444]">※</span>}
                        {inputPurpose && <BsCheck2 className="ml-[5px]  text-[19px] text-[var(--color-bg-brand-f)]" />}
                        {checkedPurpose && !inputPurpose && (
                          <span className="ml-[3px] font-bold text-[#ff4444]">未選択です</span>
                        )}
                      </div>
                      <select
                        className={`${styles.select_box} ${!inputPurpose ? `text-[#9ca3af]` : ``} ${
                          checkedPurpose && !inputPurpose ? `${styles.error}` : ``
                        }`}
                        placeholder="例：代表取締役CEO、営業部"
                        value={inputPurpose}
                        // onChange={(e) => setInputPurpose(e.target.value)}
                        onChange={(e) => {
                          setInputPurpose(e.target.value);
                          if (checkedPurpose && !!inputPurpose) setCheckedPurpose(false);
                          if (e.target.value === "会社・チームで利用") setInputDepartment("");
                          if (e.target.value === "個人で利用") setInputDepartment(".");
                        }}
                      >
                        <option value="">回答を選択してください</option>
                        <option value="会社・チームで利用">会社・チームで利用</option>
                        <option value="個人で利用">個人で利用</option>
                      </select>
                      {/* 上下矢印アイコン */}
                      <div className={`${styles.close_btn_number}`}>
                        <HiOutlineSelector className="text-[24px] " />
                      </div>
                    </div>
                  </div>

                  {/* メンバーシップを開始するボタン */}
                  <div className="w-full pt-[30px]">
                    <button
                      // className={`flex-center h-[40px] w-full cursor-pointer rounded-[6px] bg-[var(--color-bg-brand-f)] font-bold text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`}
                      className={`flex-center h-[40px] w-full cursor-pointer rounded-[6px] font-bold  ${
                        !!inputUserName && !!inputOccupation && !!inputPurpose
                          ? `bg-[var(--color-bg-brand-f)] text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`
                          : `bg-[var(--color-bg-brand-f-disabled)] text-[#ffffffc0]`
                      }`}
                      // disabled={!inputUserName && !inputOccupation && !inputPurpose}
                      onClick={() => {
                        if (!inputUserName) setCheckedUserName(true);
                        if (!inputOccupation) setCheckedOccupation(true);
                        if (!inputPurpose) setCheckedPurpose(true);
                        if (!inputUserName || !inputOccupation || !inputPurpose) return;
                        setPages((prev) => prev + 1);
                      }}
                    >
                      {!loading && <span>続ける</span>}
                      {loading && <SpinnerIDS scale={"scale-[0.4]"} />}
                      {/* {!loading && <Spinner />} */}
                    </button>
                  </div>
                </div>
                {/* 2ステップ目 会社・チーム入力 */}
                <div className={`${styles.right_scroll_contents_container} h-full min-w-[100%]`}>
                  <div className="flex w-full flex-col items-center justify-start space-y-[20px] py-[20px]">
                    {/* 会社名 */}
                    <div className="flex w-full flex-col items-start justify-start space-y-1">
                      <div className="flex w-full text-[13px] font-bold">
                        <span className="text-[var(--color-text-sub)]">
                          あなたの会社名（正式名称・個人名や屋号）を入力してください。
                        </span>
                        {(!inputCompany || focussingInputCompany) && (
                          <span className="ml-[3px] font-bold text-[#ff4444]">※</span>
                        )}
                        {checkedCompany && !inputCompany && (
                          <span className="ml-[3px] font-bold text-[#ff4444]">未入力です</span>
                        )}
                        {inputCompany && !focussingInputCompany && (
                          <BsCheck2 className="ml-[3px]  text-[19px] text-[var(--color-bg-brand-f)]" />
                        )}
                      </div>
                      <input
                        type="text"
                        className={`${styles.input_box} ${checkedCompany && !inputCompany ? `${styles.error}` : ``}`}
                        placeholder="例：株式会社〇〇、〇〇株式会社"
                        value={inputCompany}
                        onChange={(e) => setInputCompany(e.target.value)}
                        onFocus={() => setFocussingInputCompany(true)}
                        // onBlur={() => setFocussingInputCompany(false)}
                        onBlur={() => {
                          setInputCompany(toHalfWidthAndSpace(inputCompany.trim()));
                          setFocussingInputCompany(false);
                          if (checkedCompany && !!inputCompany) setCheckedCompany(false);
                        }}
                      />
                    </div>
                    {/* 部署名 */}
                    {inputPurpose === "会社・チームで利用" && (
                      <div className="flex w-full flex-col items-start justify-start space-y-1">
                        <div className="flex w-full text-[13px] font-bold">
                          <span className="text-[var(--color-text-sub)]">あなたの部署を教えてください。</span>
                          {(!inputDepartment || focussingInputDepartment) && (
                            <span className="ml-[3px] font-bold text-[#ff4444]">※</span>
                          )}
                          {checkedDepartment && !inputDepartment && (
                            <span className="ml-[3px] font-bold text-[#ff4444]">未入力です</span>
                          )}
                          {inputDepartment && !focussingInputDepartment && (
                            <BsCheck2 className="ml-[3px]  text-[19px] text-[var(--color-bg-brand-f)]" />
                          )}
                        </div>
                        <input
                          type="text"
                          className={`${styles.input_box} ${
                            checkedDepartment && !inputDepartment ? `${styles.error}` : ``
                          }`}
                          placeholder="例：代表取締役CEO、営業部"
                          value={inputDepartment}
                          onChange={(e) => setInputDepartment(e.target.value)}
                          onFocus={() => setFocussingInputDepartment(true)}
                          // onBlur={() => setFocussingInputDepartment(false)}
                          onBlur={() => {
                            setInputDepartment(toHalfWidthAndSpace(inputDepartment.trim()));
                            setFocussingInputDepartment(false);
                            if (checkedDepartment && !!inputDepartment) setCheckedDepartment(false);
                          }}
                        />
                      </div>
                    )}
                    {/* 役職 */}
                    <div className="relative flex w-full flex-col items-start justify-start space-y-1">
                      <div className="flex w-full text-[13px] font-bold">
                        <span className="text-[var(--color-text-sub)]">あなたの役職を教えてください。</span>
                        {!inputPosition && <span className="ml-[3px] font-bold text-[#ff4444]">※</span>}
                        {checkedPosition && !inputPosition && (
                          <span className="ml-[3px] font-bold text-[#ff4444]">未入力です</span>
                        )}
                        {inputPosition && <BsCheck2 className="ml-[3px]  text-[19px] text-[var(--color-bg-brand-f)]" />}
                      </div>
                      <select
                        className={`${styles.select_box} ${!inputPosition ? `text-[#9ca3af]` : ``} ${
                          checkedPosition && !inputPosition ? `${styles.error}` : ``
                        }`}
                        placeholder="例：代表取締役CEO、営業部"
                        value={inputPosition}
                        // onChange={(e) => setInputPosition(e.target.value)}
                        onChange={(e) => {
                          setInputPosition(e.target.value);
                          if (checkedPosition && !!inputPosition) setCheckedPosition(false);
                        }}
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
                      {/* 上下矢印アイコン */}
                      <div className={`${styles.close_btn_number}`}>
                        <HiOutlineSelector className="text-[24px] " />
                      </div>
                    </div>

                    {/* 規模・従業員数 */}
                    <div className="relative flex w-full flex-col items-start justify-start space-y-1">
                      <div className="flex w-full text-[13px] font-bold">
                        <span className="text-[var(--color-text-sub)]">会社の規模を教えてください。</span>
                        {!inputNumberOfEmployeeClass && <span className="ml-[3px] font-bold text-[#ff4444]">※</span>}
                        {checkedNumberOfEmployeeClass && !inputNumberOfEmployeeClass && (
                          <span className="ml-[3px] font-bold text-[#ff4444]">未入力です</span>
                        )}
                        {inputNumberOfEmployeeClass && (
                          <BsCheck2 className="ml-[3px]  text-[19px] text-[var(--color-bg-brand-f)]" />
                        )}
                      </div>
                      <select
                        className={`${styles.select_box} ${!inputNumberOfEmployeeClass ? `text-[#9ca3af]` : ``} ${
                          checkedNumberOfEmployeeClass && !inputNumberOfEmployeeClass ? `${styles.error}` : ``
                        }`}
                        placeholder="例：代表取締役CEO、営業部"
                        value={inputNumberOfEmployeeClass}
                        // onChange={(e) => setInputNumberOfEmployeeClass(e.target.value)}
                        onChange={(e) => {
                          setInputNumberOfEmployeeClass(e.target.value);
                          if (checkedNumberOfEmployeeClass && !!inputNumberOfEmployeeClass)
                            setCheckedNumberOfEmployeeClass(false);
                        }}
                      >
                        <option value="">回答を選択してください</option>
                        <option value="G 1〜49名">1〜49名</option>
                        <option value="F 50〜99名">50〜99名</option>
                        <option value="E 100〜199名">100〜199名</option>
                        <option value="D 200〜299名">200〜299名</option>
                        <option value="C 300〜499名">300〜499名</option>
                        <option value="B 500〜999名">500〜999名</option>
                        <option value="A 1000名以上">1000名以上</option>
                        {/* <option value="G 50名未満">50名未満</option> */}
                      </select>
                      {/* 上下矢印アイコン */}
                      <div className={`${styles.close_btn_number}`}>
                        <HiOutlineSelector className="text-[24px] " />
                      </div>
                    </div>
                  </div>

                  {/* メンバーシップを開始するボタン */}
                  <div className="w-full pt-[30px]">
                    <button
                      className={`flex-center h-[40px] w-full cursor-pointer rounded-[6px] font-bold  ${
                        !!inputCompany && !!inputDepartment && !!inputPosition && !!inputNumberOfEmployeeClass
                          ? `bg-[var(--color-bg-brand-f)] text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`
                          : `bg-[var(--color-bg-brand-f-disabled)] text-[#ffffffc0]`
                      }`}
                      onClick={() => {
                        if (inputPurpose === "会社・チームで利用") {
                          if (!inputCompany) setCheckedCompany(true);
                          if (!inputDepartment) setCheckedDepartment(true);
                          if (!inputPosition) setCheckedPosition(true);
                          if (!inputNumberOfEmployeeClass) setCheckedNumberOfEmployeeClass(true);
                          if (!inputCompany || !inputDepartment || !inputPosition || !inputNumberOfEmployeeClass)
                            return;
                        } else {
                          if (!inputCompany) setCheckedCompany(true);
                          if (!inputPosition) setCheckedPosition(true);
                          if (!inputNumberOfEmployeeClass) setCheckedNumberOfEmployeeClass(true);
                          if (!inputCompany || !inputPosition || !inputNumberOfEmployeeClass) return;
                        }
                        setPages((prev) => prev + 1);
                      }}
                      // disabled={!inputCompany && !inputDepartment && !inputPosition}
                    >
                      {!loading && <span>続ける</span>}
                      {loading && <SpinnerIDS scale={"scale-[0.4]"} />}
                      {/* {!loading && <Spinner />} */}
                    </button>
                    <div className="flex-center mt-[20px] w-full text-[var(--color-text-sub)]">
                      <span className="cursor-pointer" onClick={() => setPages((prev) => prev - 1)}>
                        戻る
                      </span>
                    </div>
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
