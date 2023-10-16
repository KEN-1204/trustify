import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import useDashboardStore from "@/store/useDashboardStore";
import React, { Dispatch, FC, SetStateAction, memo, useEffect, useState } from "react";
import styles from "./InvitationForLoggedInUser.module.css";
import useStore from "@/store";
import Spinner from "@/components/Parts/Spinner/Spinner";
import Image from "next/image";
import { MdClose } from "react-icons/md";
import { Invitation, UserProfileCompanySubscription } from "@/types";
import useRootStore from "@/store/useRootStore";
import useThemeStore from "@/store/useThemeStore";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { runFireworks } from "@/utils/confetti";
import { toast } from "react-toastify";

type Prop = {
  invitationData: Invitation;
  setInvitationData: Dispatch<SetStateAction<Invitation | null>>;
};

const InvitationForLoggedInUserMemo: FC<Prop> = ({ invitationData, setInvitationData }) => {
  const supabase = useSupabaseClient();
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const setUserProfileState = useDashboardStore((state) => state.setUserProfileState);
  const [loading, setLoading] = useState(false);
  //   const sessionState = useStore((state) => state.sessionState);
  //   const theme = useRootStore(useThemeStore, (state) => state.theme);

  //   const logoSrc =
  //     theme === "light" ? "/assets/images/Trustify_logo_white1.png" : "/assets/images/Trustify_logo_black.png";

  // キャンセルでモーダルを閉じる
  const handleCancelAndReset = () => {
    // setIsOpenSettingAccountModal(false);
  };

  // 招待を受ける
  const acceptInvitation = async () => {
    // ステップ4 招待される側 ユーザーはメールからアクセスして、ログイン時に招待モーダルを表示
    // ステップ5 招待される側 その招待モーダルで「招待を受ける」ボタンを押下
    // ステップ6 招待される側 subscribed_accountsテーブルのuser_idにidを紐付けする invited_emailをnullにする
    if (!userProfileState) return alert("ユーザー情報が存在しません エラー:01");

    setLoading(true);
    try {
      const { data: subscribedAccountData, error: subscribedAccountError } = await supabase
        .from("subscribed_accounts")
        .update({
          user_id: userProfileState.id,
          invited_email: null,
        })
        .eq("id", invitationData.subscribed_account_id);
      if (subscribedAccountError) {
        console.log("subscribed_accountsテーブルのupdate時にエラー", subscribedAccountError);
        throw new Error(subscribedAccountError.message);
      }

      // Invitationsテーブルの招待データのresultをacceptedに変更する
      const { error: invitationUpdateError } = await supabase
        .from("invitations")
        .update({
          result: "accepted",
        })
        .eq("id", invitationData.id);
      if (invitationUpdateError) {
        console.log("invitationsテーブルのupdate時にエラー", invitationUpdateError);
        throw new Error(invitationUpdateError.message);
      }

      // 更新後、最新のユーザー情報を取得してZustandに格納
      const { data: userProfileCompanySubscriptionData, error: getUserDataError } = await supabase
        .rpc("get_user_data", { _user_id: userProfileState.id })
        .single();
      if (getUserDataError) {
        console.log("get_user_data時にエラー", getUserDataError);
        throw new Error(getUserDataError.message);
      }

      // ZustandのStateを更新
      setUserProfileState(userProfileCompanySubscriptionData as UserProfileCompanySubscription);

      // モーダルを閉じる
      setInvitationData(null);

      // チーム参加完了
      toast.success(`${invitationData.from_company_name}への参加が完了しました!`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      setTimeout(() => {
        runFireworks();
      }, 300);
    } catch (error: any) {
      console.error(error.message);
      toast.error(`${invitationData.from_company_name}への参加に失敗しました!`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }

    setLoading(false);
  };

  // 招待を断る
  const declineInvitation = async () => {
    //   if (!userProfileState) return alert("ユーザー情報が存在しません エラー:01");
    setLoading(true);

    try {
      const { data: subscribedAccountData, error: subscribedAccountError } = await supabase
        .from("subscribed_accounts")
        .update({
          // user_id: userProfileState.id,
          company_role: null,
          invited_email: null,
        })
        .eq("id", invitationData.subscribed_account_id);
      if (subscribedAccountError) {
        console.log("subscribed_accountsテーブルのupdate時にエラー", subscribedAccountError);
        throw new Error(subscribedAccountError.message);
      }

      // Invitationsテーブルの招待データのresultをacceptedに変更する
      const { error: invitationUpdateError } = await supabase.from("invitations").update({
        result: "declined",
      });
      if (invitationUpdateError) {
        console.log("invitationsテーブルのupdate時にエラー", invitationUpdateError);
        throw new Error(invitationUpdateError.message);
      }

      // モーダルを閉じる
      setInvitationData(null);

      // チーム参加完了
      toast.success(`${invitationData.from_company_name}への参加を辞退しました!`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (error: any) {
      console.error(error.message);
      toast.error(`${invitationData.from_company_name}への参加の辞退が失敗しました!`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }

    setLoading(false);
  };

  return (
    <>
      <div className={`${styles.modal_overlay} `} />
      {loading && (
        <div className={`${styles.loading_overlay} `}>
          <SpinnerIDS scale={"scale-[0.5]"} />
        </div>
      )}
      <div className={`${styles.modal} relative flex flex-col`}>
        {/* クローズボタン */}
        {/* <button
          className={`flex-center z-100 group absolute right-[-40px] top-0 h-[32px] w-[32px] rounded-full bg-[#00000090] hover:bg-[#000000c0]`}
          //   onClick={() => setOverState(false)}
        >
          <MdClose className="text-[20px] text-[#fff]" />
        </button> */}
        <div className={`relative h-[50%] w-full ${styles.modal_right_container}`}></div>
        <div className={`relative flex h-[50%] w-full flex-col items-center pt-[20px]`}>
          <div className="flex w-[80%] flex-col space-y-1 text-[16px]">
            {/* <div className="relative mb-[3px] flex h-[55px] w-full items-center justify-center">
              <div className="relative ml-[-15px] flex h-full w-[245px] select-none items-center justify-center">
                <Image src={logoSrc} alt="" className="h-full w-[100%] object-contain" fill priority={true} />
              </div>
            </div> */}
            <div className={`flex-center mb-[10px] mt-[10px] h-[40px] w-full`}>
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
            <div className="mb-[10px] flex w-full flex-col text-center text-[20px] font-bold">
              <h2 className="break-all leading-[165%] text-[var(--color-text-title)]">
                {invitationData.from_company_name ?? "TRUSTiFY"}の{invitationData.from_user_name}さんから、
                チーム参加のご招待を頂いております
              </h2>
              {/* <h2 className="mb-[5px] text-[var(--color-text-title)]">
                {invitationData.from_company_name ?? "TRUSTiFY"}の{invitationData.from_user_name}さんから、
              </h2>
              <h2 className="text-[var(--color-text-title)]">チーム参加のご招待を頂いております</h2> */}
              {/* <h2 className="break-all">
                {invitationData.from_user_name}さんは、あなたが{invitationData.from_company_name ?? "TRUSTiFY"}
                のチームに参加するのを待っています
              </h2> */}
              {/* <h2>アカウントを増やしますか？</h2> */}
            </div>

            <p className="!mt-[15px] text-[15px] text-[var(--color-text-sub)]">
              {invitationData.from_user_name}さんは、あなたが
              {invitationData.from_company_name ?? "TRUSTiFY"}
              のチームに参加するのを待っています。招待を受け入れて、チームに参加しましょう。
            </p>
            {/* <p className="text-[15px] text-[var(--color-text-sub)]">
              {invitationData.from_user_name}さんがあなたをメンバーとして、
              {invitationData.from_company_name ?? "TRUSTiFY"}
              のチームに参加するよう招待しています。招待を受け入れて、チームに参加しましょう。
            </p> */}

            <div className={`flex w-full items-center justify-around space-x-5 pt-[20px]`}>
              <button
                className={`w-[50%] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[15px] py-[10px] text-[14px] font-bold text-[var(--color-text-sub)] hover:bg-[var(--setting-side-bg-select-hover)]`}
                onClick={declineInvitation}
              >
                断る
              </button>
              <button
                className="w-[50%] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[15px] py-[10px] text-[14px] font-bold text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]"
                onClick={acceptInvitation}
              >
                招待を受ける
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const InvitationForLoggedInUser = memo(InvitationForLoggedInUserMemo);
