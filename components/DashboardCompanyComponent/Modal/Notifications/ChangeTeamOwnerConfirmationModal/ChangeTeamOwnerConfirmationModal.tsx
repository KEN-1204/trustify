import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import useDashboardStore from "@/store/useDashboardStore";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQueryClient } from "@tanstack/react-query";
import React, { FC, memo, useState } from "react";
import { MdClose } from "react-icons/md";
import { toast } from "react-toastify";

const ChangeTeamOwnerConfirmationModalMemo: FC = () => {
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();
  // 【お知らせの所有者変更モーダル開閉状態】
  const setOpenNotificationChangeTeamOwnerModal = useDashboardStore(
    (state) => state.setOpenNotificationChangeTeamOwnerModal
  );
  // 【お知らせの所有者変更モーダルをクリック時にお知らせの情報を保持するState】
  const notificationDataState = useDashboardStore((state) => state.notificationDataState);
  const setNotificationDataState = useDashboardStore((state) => state.setNotificationDataState);
  const [loading, setLoading] = useState(false);
  // ================================ お知らせ 「所有者を受け入れる」クリック時の関数
  // ステップ１：自分をチームの所有者にする subscribed_accountsテーブルのcompany_roleをcompany_ownerに変更する
  // ステップ２：招待者を所有者から管理者へ移行する subscribed_accountsテーブルのcompany_roleをcompany_adminに変更する
  // ステップ３：notificationsテーブルの所有権変更のデータのresultをaccepted, completedをtrue, completed_atを現在の時刻に変更してUPDATE
  // ステップ4：React-Queryのキャッシュを最新状態に反映 validate
  const handleAcceptChangeTeamOwner = async () => {
    setLoading(true);
    try {
      // // ステップ１
      // const {data: newOwnerData, error: newOwnerError} = await supabase.from('subscribed_accounts').update({
      //     company_role: 'company_owner'
      // }).eq('id', notificationDataState?.to_subscribed_account_id).select()

      // if (newOwnerError) {
      //     console.error(`新たな所有者のUPDATEエラー`, newOwnerError)
      //     throw new Error(newOwnerError.message)
      // }
      // console.log('新たな所有者のUPDATE成功', newOwnerData[0])

      // // ステップ２
      // const {data: oldOwnerData, error: oldOwnerError} = await supabase.from('subscribed_accounts').updata({
      //     company_role: 'company_admin'
      // }).eq('user_id', notificationDataState?.from_user_id).eq('from_company_id', notificationDataState?.from_company_id).select()

      // if (oldOwnerError) {
      //     console.error(`前の所有者の管理者へのUPDATEエラー`, oldOwnerError);
      //     throw new Error(oldOwnerError.message);
      // }
      // console.log("前の所有者の管理者へのUPDATE成功", oldOwnerData[0]);

      // // ステップ３
      // const {data: newNotification, error: newNotificationError} = await supabase

      const { data, error } = await supabase.rpc("change_team_owner", {
        new_owner_account_id: notificationDataState?.to_subscribed_account_id,
        prev_owner_user_id: notificationDataState?.from_user_id,
        from_company_id: notificationDataState?.from_company_id,
        notification_id: notificationDataState?.id,
      });

      if (error) throw new Error(error.message);
      console.log("チームの所有者変更に成功", data);

      // キャッシュを最新状態に反映
      await queryClient.invalidateQueries({ queryKey: ["change_team_owner_notifications"] });
      await queryClient.invalidateQueries({ queryKey: ["my_notifications"] });
      await queryClient.invalidateQueries({ queryKey: ["member_accounts"] });

      toast.success("チームの所有者変更に成功しました！", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        //   theme: `${theme === "light" ? "light" : "dark"}`,
      });
      setOpenNotificationChangeTeamOwnerModal(false);
      setNotificationDataState(null);
    } catch (error: any) {
      console.error("チームの所有者変更に失敗", error);
      toast.error("チームの所有者変更に失敗しました！", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        //   theme: `${theme === "light" ? "light" : "dark"}`,
      });
    }
    setLoading(false);
  };

  console.log("ChangeTeamOwnerModalレンダリング", notificationDataState);

  /**
   * .loading_overlay {
  position: fixed;
  z-index: 2000;
  inset: 0;
  background: #00000090;
  display: flex;
  justify-content: center;
  align-items: center;
}
   */
  return (
    <>
      {loading && (
        <div className={`flex-center fixed inset-0 z-[3000] bg-[#00000090]`}>
          <SpinnerIDS scale={"scale-[0.5]"} />
        </div>
      )}
      {/* オーバーレイ */}
      <div
        className="fixed left-0 top-0 z-[1000] h-[100vh] w-[100vw] bg-[var(--color-overlay)] backdrop-blur-sm"
        onClick={() => {
          console.log("オーバーレイ クリック");
          setOpenNotificationChangeTeamOwnerModal(false);
          setNotificationDataState(null);
        }}
      ></div>
      <div className="fixed left-[50%] top-[50%] z-[2000] h-[52vh] w-[40vw] translate-x-[-50%] translate-y-[-50%] rounded-[8px] bg-[var(--color-bg-notification-modal)] p-[32px] text-[var(--color-text-title)]">
        {/* クローズボタン */}
        <button
          className={`flex-center z-100 group absolute right-[-40px] top-0 h-[32px] w-[32px] rounded-full bg-[#00000090] hover:bg-[#000000c0]`}
          onClick={() => {
            setOpenNotificationChangeTeamOwnerModal(false);
            setNotificationDataState(null);
          }}
        >
          <MdClose className="text-[20px] text-[#fff]" />
        </button>
        <h3 className={`flex min-h-[32px] w-full items-center text-[22px] font-bold`}>
          このチームの所有権を受け入れますか？
        </h3>
        <section className={`mt-[15px] flex h-auto w-full flex-col text-[14px]`}>
          <p>
            <span className="font-bold">{notificationDataState?.from_user_name}</span>（
            <span className="font-bold">{notificationDataState?.from_user_email}</span>
            ）が<span className="font-bold">{notificationDataState?.from_company_name}</span>
            の所有者として、代わりにあなたを任命しました。この任命を受け入れると、いかに同意したものとみなされます。
          </p>
          <ul className="mt-[20px] flex w-full list-disc flex-col space-y-3 pl-[15px]">
            <li className="">
              このチーム、チームメンバー、チームのコンテンツを管理する管理者権限を新たに受け入れます。
            </li>
            <li className="">
              このチームのメンバーが作成し、このチーム内に保存される、既存および今後のコンテンツ全てに対する責任を負います。
            </li>
            <li className="">
              TRUSTiFYの利用規約がこのチームの所有権に適用されることに同意し、プライバシーポリシーを読みました。
            </li>
          </ul>
        </section>
        <section className="flex w-full items-start justify-end">
          <div className={`flex w-[100%] items-center justify-around space-x-5 pt-[30px]`}>
            <button
              className={`w-[50%] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[15px] py-[10px] text-[14px] font-bold text-[var(--color-text-sub)] hover:bg-[var(--setting-side-bg-select-hover)]`}
            >
              所有権を拒否する
            </button>
            <button
              className="w-[50%] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[15px] py-[10px] text-[14px] font-bold text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]"
              onClick={() => {
                handleAcceptChangeTeamOwner();
              }}
            >
              所有権を受け入れる
            </button>
          </div>
        </section>
      </div>
    </>
  );
};

export const ChangeTeamOwnerConfirmationModal = memo(ChangeTeamOwnerConfirmationModalMemo);
