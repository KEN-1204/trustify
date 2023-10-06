import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import useDashboardStore from "@/store/useDashboardStore";
import React, { useEffect, useState } from "react";
import styles from "./SettingInvitationModal.module.css";
import { BsCheck2 } from "react-icons/bs";
import useStore from "@/store";
import Image from "next/image";
import { MdClose } from "react-icons/md";
import Vertical_SlideCards from "@/components/Parts/Vertical_SlideCards/Vertical_SlideCards";
import { HiOutlineLink } from "react-icons/hi2";
import { ImLink } from "react-icons/im";
import { AiOutlinePlus } from "react-icons/ai";

export const SettingInvitationModal = () => {
  const [loading, setIsLoading] = useState(false);
  const [accountQuantity, setAccountQuantity] = useState<number | null>(1);
  const [selectedRadioButton, setSelectedRadioButton] = useState("business_plan");
  const sessionState = useStore((state) => state.sessionState);

  // 招待メールモーダル
  const setIsOpenSettingInvitationModal = useDashboardStore((state) => state.setIsOpenSettingInvitationModal);

  // メールアドレス入力値を保持するState 初期状態で5つのメールアドレス入力欄を持つ
  const [emailInputs, setEmailInputs] = useState<string[]>(Array(3).fill(""));

  // 送信準備の状態
  const [isReadyToSubmit, setIsReadyToSubmit] = useState(false);

  // 入力値が変更された場合に呼ばれる関数
  const handleInputChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmails = [...emailInputs];
    newEmails[index] = e.target.value;
    setEmailInputs(newEmails);
  };

  // 「他メンバーを追加」ボタンを押下した場合の処理
  const addMoreEmailInput = () => {
    setEmailInputs((prev) => [...prev, ""]);
  };

  // 「招待状を送信」ボタンを押下した場合の処理
  const handleSubmit = () => {
    console.log(emailInputs);
  };

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
    setIsOpenSettingInvitationModal(false);
  };

  console.log("🌟Email", emailInputs);

  return (
    <>
      <div className={`${styles.overlay} `} onClick={handleCancelAndReset} />
      {/* {loadingGlobalState && (
        <div className={`${styles.loading_overlay} `}>
          <SpinnerIDS scale={"scale-[0.5]"} />
        </div>
      )} */}

      <div className={`${styles.container} `}>
        {/* クローズボタン */}
        <button
          className={`flex-center group absolute right-[-40px] top-0 z-10 h-[32px] w-[32px] rounded-full bg-[#00000090] hover:bg-[#000000c0]`}
          onClick={() => setIsOpenSettingInvitationModal(false)}
        >
          <MdClose className="text-[20px] text-[#fff]" />
        </button>
        {/* メインコンテンツ コンテナ */}
        <div className={`${styles.main_contents_container}`}>
          <div className={`${styles.left_container} relative h-full w-5/12`}>
            <div className="relative w-full overflow-y-auto px-[40px] pb-[calc(116px+20px)] pt-[40px]">
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
              <h1 className={`mt-[10px] w-full text-center text-[24px] font-bold`}>チームメンバーを招待しましょう！</h1>
              {/* <h1 className={`w-full text-[24px] font-bold`}>プランを選んで早速始めましょう！</h1> */}
              <div className={`w-full py-[20px] text-[15px] text-[var(--color-text-sub)]`}>
                <p>チーム全体で共同作業して、TRSUSTiFYの機能を最大限に活用しましょう。</p>
              </div>
              <div className="mt-[0px] flex w-full">
                <button
                  className={`transition-base01 flex-center max-h-[41px] w-full min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] text-[14px] font-bold hover:bg-[var(--setting-side-bg-select-hover)]`}
                  //   onClick={loadPortal}
                >
                  <p className="flex items-center space-x-3">
                    {/* <span>
                    <Image width="20" height="20" src="/assets/images/icons/icons8-crown-48.png" alt="crown" />
                  </span> */}
                    <ImLink className="text-[20px]" />
                    <span>招待リンクを取得する</span>
                  </p>
                </button>
              </div>
              {/* メールアドレス入力エリア */}
              <div className="mt-[20px] flex w-full flex-col items-center space-y-3">
                {emailInputs.map((email, index) => (
                  <input
                    key={index}
                    type="email"
                    placeholder="メールアドレスを入力してください..."
                    className={`${styles.input_box}`}
                    value={email}
                    onChange={(e) => handleInputChange(index, e)}
                    // onBlur={() => setMainPhoneNumber(toHalfWidth(mainPhoneNumber.trim()))}
                  />
                ))}
              </div>
              <div className="mt-[16px] w-full">
                <div
                  className="flex max-w-fit cursor-pointer items-center space-x-2 text-[var(--color-text-sub)] hover:text-[var(--color-text-brand-f)] hover:underline"
                  onClick={addMoreEmailInput}
                >
                  <AiOutlinePlus className="h-[14px] w-[14px] stroke-2 text-[14px]" />
                  <span>他のメンバーを追加</span>
                </div>
              </div>
            </div>

            {/* メンバーシップを開始するボタン */}
            <div className="absolute bottom-0 left-0 w-full bg-[var(--color-edit-bg-solid)] px-[32px] pb-[52px] pt-[24px]">
              <button
                className={`flex-center h-[40px] w-full rounded-[6px]  font-bold text-[#fff]  ${
                  isReadyToSubmit
                    ? `cursor-pointer bg-[var(--color-bg-brand-f)] hover:bg-[var(--color-bg-brand-f-deep)]`
                    : `cursor-not-allowed bg-[var(--setting-side-bg-select)] text-[var(--setting-side-bg-select-hover)]`
                }`}
                disabled={!isReadyToSubmit}
                // onClick={() => {
                //   if (selectedRadioButton === "business_plan")
                //     processSubscription("price_1NmPoFFTgtnGFAcpw1jRtcQs", accountQuantity);
                //   if (selectedRadioButton === "premium_plan")
                //     processSubscription("price_1NmQAeFTgtnGFAcpFX60R4YY", accountQuantity);
                // }}
              >
                {!loading && <span>招待状メールを送信</span>}
                {loading && <SpinnerIDS scale={"scale-[0.4]"} />}
                {/* {!loading && <Spinner />} */}
              </button>
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
