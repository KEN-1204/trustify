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
import styles from "../ResumeMembershipAfterCancel/ResumeMembershipAfterCancel.module.css";
import { BsCheck2 } from "react-icons/bs";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { FiArrowLeft } from "react-icons/fi";
import { loadStripe } from "@stripe/stripe-js";
import Stripe from "stripe";
// import { FallbackResumeMembershipAfterCancel } from "./FallbackResumeMembershipAfterCancel";
import { runFireworks } from "@/utils/confetti";
import { UserProfileCompanySubscription } from "@/types";

type Plans = {
  id: string;
  name: string;
  price: number;
  interval: string;
  currency: string;
};

const RestartAfterCancelForMemberMemo = () => {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const sessionState = useStore((state) => state.sessionState);
  const theme = useRootStore(useThemeStore, (state) => state.theme);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const setUserProfileState = useDashboardStore((state) => state.setUserProfileState);
  // ローディング
  const [isLoadingReset, setIsLoadingReset] = useState(false);

  // // ================================ ツールチップ ================================
  // const modalContainerRef = useRef<HTMLDivElement | null>(null);
  // const hoveredItemPosModal = useStore((state) => state.hoveredItemPosModal);
  // const setHoveredItemPosModal = useStore((state) => state.setHoveredItemPosModal);
  // const handleOpenTooltip = (e: React.MouseEvent<HTMLElement, MouseEvent>, display: string) => {
  //   // モーダルコンテナのleftを取得する
  //   if (!modalContainerRef.current) return;
  //   const containerLeft = modalContainerRef.current?.getBoundingClientRect().left;
  //   const containerTop = modalContainerRef.current?.getBoundingClientRect().top;
  //   // ホバーしたアイテムにツールチップを表示
  //   const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
  //   // console.log("ツールチップx, y width , height", x, y, width, height);
  //   const content2 = ((e.target as HTMLDivElement).dataset.text2 as string)
  //     ? ((e.target as HTMLDivElement).dataset.text2 as string)
  //     : "";
  //   const content3 = ((e.target as HTMLDivElement).dataset.text3 as string)
  //     ? ((e.target as HTMLDivElement).dataset.text3 as string)
  //     : "";
  //   setHoveredItemPosModal({
  //     x: x - containerLeft,
  //     y: y - containerTop,
  //     itemWidth: width,
  //     itemHeight: height,
  //     content: (e.target as HTMLDivElement).dataset.text as string,
  //     content2: content2,
  //     content3: content3,
  //     display: display,
  //   });
  // };
  // // ============================================================================================
  // // ================================ ツールチップを非表示 ================================
  // const handleCloseTooltip = () => {
  //   setHoveredItemPosModal(null);
  // };
  // // ============================================================================================
  // ===================== 🌟ツールチップ 3点リーダーの時にツールチップ表示🌟 =====================
  const hoveredItemPos = useStore((state) => state.hoveredItemPos);
  const setHoveredItemPos = useStore((state) => state.setHoveredItemPos);
  type TooltipParams = {
    e: React.MouseEvent<HTMLElement, MouseEvent>;
    display: string;
    content: string;
    content2?: string | undefined | null;
    marginTop?: number;
    itemsPosition?: string;
  };
  const handleOpenTooltip = ({
    e,
    display,
    content,
    content2,
    marginTop = 0,
    itemsPosition = "center",
  }: TooltipParams) => {
    // ホバーしたアイテムにツールチップを表示
    const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
    // console.log("ツールチップx, y width , height", x, y, width, height);

    setHoveredItemPos({
      x: x,
      y: y,
      itemWidth: width,
      itemHeight: height,
      content: content,
      content2: content2,
      display: display,
      marginTop: marginTop,
      itemsPosition: itemsPosition,
    });
  };
  // ツールチップを非表示
  const handleCloseTooltip = () => {
    if (hoveredItemPos) setHoveredItemPos(null);
  };
  // ==================================================================================

  const [isLoadingSignOut, setIsLoadingSignOut] = useState(false);
  // ログアウト関数
  const handleSignOut = async () => {
    setIsLoadingSignOut(true);
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
      setIsLoadingSignOut(false);
    }
  };

  // 「チームを抜けて新しく始める」をクリックして実行
  // 1. subscribed_accountsテーブルのuser_idとcompany_roleをnullに更新
  // 2. profilesテーブルはfirst_time_loginをtrueに変更して、profile_name以外リセット
  const handleResetStart = async () => {
    if (!userProfileState) return alert("エラー：ユーザー情報が見つかりませんでした。");
    setIsLoadingReset(true);
    try {
      const payload = {
        _deleted_user_id: userProfileState.id,
        _company_id: userProfileState.company_id,
        _subscription_id: userProfileState.subscription_id,
        _profile_name: userProfileState.profile_name,
        _email: userProfileState.email,
        _department: userProfileState.department,
        _position_name: userProfileState.position_name,
        _company_cell_phone: userProfileState.company_cell_phone,
        _personal_cell_phone: userProfileState.personal_cell_phone,
        _occupation: userProfileState.occupation,
        _office: userProfileState.office,
        _section: userProfileState.section,
        _unit: userProfileState.unit,
        _position_class: userProfileState.position_class,
      };
      console.log("archive_and_reset_user_profile関数を実行 rpcに渡すpayload", payload);
      const { data: newUserData, error } = await supabase.rpc("restart_for_member_after_cancel", payload);

      if (error) {
        // エラーオブジェクト全体を再スローする throw new Error(error.message)はメッセージのみ引き継ぐ
        throw error;
      }
      console.log("archive_and_reset_user_profile関数を実行 リセット後のユーザーデータ", newUserData[0]);

      // ZustandのStateを更新
      setUserProfileState(newUserData[0] as UserProfileCompanySubscription);

      toast.success(`リセットが完了しました! リスタートを始めます。`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      if (
        (newUserData[0] as UserProfileCompanySubscription).subscription_plan === null ||
        (newUserData[0] as UserProfileCompanySubscription).subscription_plan === "free_plan"
      ) {
        setTimeout(() => {
          router.reload();
        }, 100);
      }
    } catch (e: any) {
      console.error(`archive_and_reset_user_profile関数エラー`, e);
      toast.error(`リセットに失敗しました!`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }

    setIsLoadingReset(false);
  };

  // <div className={`fixed inset-0 z-[2000] ${styles.bg_image}`} ref={modalContainerRef}>
  return (
    <div className={`fixed inset-0 z-[2000] ${styles.bg_image}`}>
      {/* {!isLoadingReset && (
        <div className={`${styles.loading_overlay} `}>
          <SpinnerIDS scale={"scale-[0.5]"} />
        </div>
      )} */}
      {/* {hoveredItemPosModal && <TooltipModal />} */}
      <button
        className={`flex-center shadow-all-md transition-base03 fixed bottom-[2%] right-[6%] z-[3000] h-[35px] w-[35px] rounded-full bg-[#555] hover:bg-[#999]`}
        data-text="ログアウトする"
        // onMouseEnter={(e) => handleOpenTooltip(e, "top")}
        onMouseEnter={(e) => {
          handleOpenTooltip({
            e: e,
            display: "top",
            content: "ログアウトする",
            marginTop: 0,
            itemsPosition: "center",
            // whiteSpace: "nowrap",
          });
        }}
        onMouseLeave={handleCloseTooltip}
        onClick={handleSignOut}
      >
        <IoLogOutOutline className="mr-[-3px] text-[20px] text-[#fff]" />
      </button>
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
      {/* シャドウグラデーション */}
      <div className="shadow-gradient-tb-md pointer-events-none absolute z-10 h-full w-full select-none"></div>
      {/* <div className="pointer-events-none absolute z-10 h-full w-full"></div> */}

      {/* モーダル */}
      <div
        className={`shadow-all-md transition-base03 absolute left-[50%] top-[45%] z-20 flex h-auto w-[380px] translate-x-[-50%] translate-y-[-50%] flex-col rounded-[8px] bg-[var(--color-bg-light)] px-[32px] py-[24px] text-[#37352f]`}
      >
        <>
          <h2 className="h-auto w-full text-[26px] font-bold">おかえりなさい。</h2>

          <div className={`mt-[15px] w-full space-y-[5px] text-[15px] text-[#19171199]`}>
            <p>
              <span className="font-bold text-[#37352f]">{userProfileState?.customer_name ?? ""}</span>
              のメンバーシップがキャンセルされました。
            </p>
            <p>チームの所有者がメンバーシップを再開するのを待つか、チームを抜けて新しく始めてください。</p>
          </div>

          {/* ボタンエリア */}
          <div className={`mt-[20px] flex w-full flex-col space-y-[15px]`}>
            <button
              className={`transition-base02 flex-center relative max-h-[41px] w-full rounded-[8px] bg-[#0d99ff] px-[25px] py-[10px] text-[14px] font-bold  text-[#fff]  ${
                isLoadingReset ? `cursor-wait` : `cursor-pointer hover:bg-[var(--color-bg-brand-f-hover)]`
              }`}
              onClick={handleResetStart}
            >
              {/* <span>チームを抜けて新しく始める</span> */}
              {!isLoadingReset && <span>チームを抜けて新しく始める</span>}
              {isLoadingReset && <SpinnerIDS scale={"scale-[0.4]"} />}
            </button>
            <button
              className={`transition-base02 flex-center relative max-h-[41px] w-full rounded-[8px] bg-[#40576d12] px-[25px] py-[10px] text-[14px] font-bold ${
                isLoadingSignOut ? `cursor-wait` : `cursor-pointer hover:bg-[var(--color-bg-sub-deep)]`
              }`}
              onClick={handleSignOut}
            >
              {/* <span>メンバーシップの再開を待つ</span> */}
              {!isLoadingSignOut && <span>メンバーシップの再開を待つ</span>}
              {isLoadingSignOut && <SpinnerIDS scale={"scale-[0.4]"} />}
            </button>
          </div>

          {/* 注意書きエリア */}
          <div className={`mt-[20px] w-full space-y-[5px] text-[12px] text-[#19171199]`}>
            <p>
              「チームを抜けて新しく始める」をクリックすることで、以前に保存したデータに一切アクセスが不可となり、現在のユーザー情報をリセットして新たに始めます。
            </p>
          </div>
        </>
      </div>
    </div>
  );
};

export const RestartAfterCancelForMember = memo(RestartAfterCancelForMemberMemo);
