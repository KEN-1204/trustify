import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import useDashboardStore from "@/store/useDashboardStore";
import React, { useEffect, useState } from "react";
import styles from "./SettingInvitationModal.module.css";
import { BsCheck2 } from "react-icons/bs";
import useStore from "@/store";
import Image from "next/image";
import { MdClose } from "react-icons/md";
import Vertical_SlideCards from "@/components/Parts/Vertical_SlideCards/Vertical_SlideCards";

export const SettingInvitationModal = () => {
  const [loading, setIsLoading] = useState(false);
  const [accountQuantity, setAccountQuantity] = useState<number | null>(1);
  const [selectedRadioButton, setSelectedRadioButton] = useState("business_plan");
  const sessionState = useStore((state) => state.sessionState);

  // 招待メールモーダル
  const setIsOpenSettingInvitationModal = useDashboardStore((state) => state.setIsOpenSettingInvitationModal);

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

  // ラジオボタン切り替え用state
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedRadioButton(e.target.value);
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
            <div className={`w-full py-[20px]`}></div>

            {/* メンバーシップを開始するボタン */}
            <div className="absolute bottom-0 left-0 w-full bg-white px-[32px] pb-[52px] pt-[24px]">
              <button
                className={`flex-center h-[40px] w-full cursor-pointer rounded-[6px] bg-[var(--color-bg-brand-f)] font-bold text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`}
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
