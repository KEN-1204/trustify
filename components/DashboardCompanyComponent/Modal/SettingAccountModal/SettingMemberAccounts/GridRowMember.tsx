import React, { Dispatch, FC, SetStateAction, memo, useEffect, useState } from "react";
import styles from "./SettingMemberAccounts.module.css";
import { useDownloadUrl } from "@/hooks/useDownloadUrl";
import { MemberAccounts } from "@/types";
import Image from "next/image";
import useRootStore from "@/store/useRootStore";
import useThemeStore from "@/store/useThemeStore";
import { RippleButton } from "@/components/Parts/RippleButton/RippleButton";
import useDashboardStore from "@/store/useDashboardStore";
import { BsCheck2, BsChevronDown } from "react-icons/bs";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import useStore from "@/store";
import { MdClose, MdOutlineEdit } from "react-icons/md";
import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import { DropDownMenuUpdateMember } from "./DropdownMenuUpdateMember/DropdownMenuUpdateMember";
import { CiEdit } from "react-icons/ci";
import { SpinnerComet } from "@/components/Parts/SpinnerComet/SpinnerComet";

// type Props = {
//   id: string;
//   profile_name: string;
//   email: string;
//   account_company_role: string;
// };
type Props = {
  memberAccount: MemberAccounts;
  // checkedMembersArray: boolean[];
  // setCheckedMembersArray: Dispatch<SetStateAction<any[]>>;
  checkedMembersArray: (string | null)[];
  setCheckedMembersArray: Dispatch<SetStateAction<(string | null)[]>>;
  index: number;
};

export const GridRowMemberMemo: FC<Props> = ({ memberAccount, checkedMembersArray, setCheckedMembersArray, index }) => {
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();
  const theme = useRootStore(useThemeStore, (state) => state.theme);
  const settingModalProperties = useDashboardStore((state) => state.settingModalProperties);
  const [loading, setLoading] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);
  // チームから削除を選択した場合に削除ターゲットを保持するState
  // const removeTeamMember = useDashboardStore((state) => state.removeTeamMember);
  // const setRemoveTeamMember = useDashboardStore((state) => state.setRemoveTeamMember);
  const [removeTeamMember, setRemoveTeamMember] = useState<MemberAccounts | null>(null);
  // 招待キャンセル（未登録ユーザー向け）
  const [cancelInvitationForUnregisteredUser, setCancelInvitationForUnregisteredUser] = useState(false);

  // 招待メールモーダル
  const setIsOpenSettingInvitationModal = useDashboardStore((state) => state.setIsOpenSettingInvitationModal);
  // ログイン中のユーザープロフィール
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  // ログイン中のユーザーのセッション情報
  const sessionState = useStore((state) => state.sessionState);
  // チェックボックス
  // const [checked, setChecked] = useState(false);
  // チームロールドロップダウンメニュー
  const [isOpenRoleMenu, setIsOpenRoleMenu] = useState(false);
  // メンバーデータ編集ドロップダウンメニュー
  const [isOpenDropdownMenuUpdateMember, setIsOpenDropdownMenuUpdateMember] = useState(false);
  const [isLoadingUpsertMember, setIsLoadingUpsertMember] = useState(false);
  // const isOpenRoleMenu = useDashboardStore((state) => state.isOpenRoleMenu);
  // const setIsOpenRoleMenu = useDashboardStore((state) => state.setIsOpenRoleMenu);
  // チームでの役割を保持するState
  const [roleAtTeam, setRoleAtTeam] = useState(
    memberAccount.account_company_role ? memberAccount.account_company_role : ""
  );
  // チームの役割クリック時の位置を保持するState
  const [clickedItemPosition, setClickedItemPosition] = useState<string | null>(null);
  type ClickedItemPos = { displayPos: "up" | "center" | "down"; clickedItemWidth: number | null };
  const [clickedItemPositionMember, setClickedItemPositionMember] = useState<ClickedItemPos>({
    displayPos: "up",
    clickedItemWidth: null,
  });

  // 一つの投稿に紐づいた画像のフルパスをダウンロードするためのuseDownloadUrlフックをpostsバケット用の切り替え用キーワードを渡して実行
  // 第一引数には、propsで受け取ったpost_urlを渡してpostUrlという名前をつけてfullUrlを取得
  const { fullUrl: avatarUrl, isLoading: isLoadingAvatar } = useDownloadUrl(memberAccount.avatar_url, "avatars");

  // 頭文字のみ抽出
  const getInitial = (name: string) => name[0];

  // company_roll：所有者(契約者)、管理者、マネージャー、メンバー、ゲスト
  const getCompanyRole = (company_role: string | null) => {
    switch (company_role) {
      case "company_admin":
        return "管理者";
        break;
      case "company_manager":
        return "マネージャー";
      case "company_member":
        return "メンバー";
      case "guest":
        return "ゲスト";
      default:
        return "未設定";
        break;
    }
  };

  // =============================== チームへのメンバー参加、削除時に役割Stateを変更する
  useEffect(() => {
    if (roleAtTeam === memberAccount.account_company_role) return;
    setRoleAtTeam(memberAccount.account_company_role ? memberAccount.account_company_role : "");
  }, [memberAccount.account_company_role]);

  // =============================== 役割の変更
  const handleChangeRole = async (companyRole: string) => {
    // setLoadingGlobalState(true);
    const { data, error } = await supabase
      .from("subscribed_accounts")
      .update({ company_role: companyRole })
      .eq("id", memberAccount.subscribed_account_id)
      .select("company_role")
      .single();

    if (error) {
      // setLoadingGlobalState(false);
      // setEditNameMode(false);
      alert(error.message);
      console.log("UPDATEエラー", error.message);
      toast.error("役割の変更に失敗しました!");

      return;
    }

    console.log("UPDATE成功 data", data);
    console.log("UPDATE成功 data.company_role", data.company_role);
    // アカウントと招待ユーザーの紐付け完了後はMemberAccountsキャッシュをリフレッシュ
    // await queryClient.invalidateQueries({ queryKey: ["member_accounts"] });
    let previousMemberAccounts = queryClient.getQueryData<MemberAccounts[]>(["member_accounts"]);
    if (typeof previousMemberAccounts === "undefined") return;
    console.log(
      "更新前アカウント",
      previousMemberAccounts,
      "更新対象 previousMemberAccounts[index].account_company_role",
      previousMemberAccounts[index].account_company_role,
      "更新後の値 data.company_role",
      data.company_role
    );
    previousMemberAccounts[index].account_company_role = data.company_role;
    console.log("更新後", previousMemberAccounts);
    queryClient.setQueryData(["member_accounts"], [...previousMemberAccounts]);
    setRoleAtTeam(data.company_role);
    toast.success("役割の変更が完了しました!");
  };

  // =============================== チームから削除する
  const removeFromTeam = async () => {
    setLoading(true);
    console.log("delete_from_team関数実行 削除するユーザーのid", memberAccount.id);
    // subscribed_accountsのuser_idカラムをnullにして契約アカウントとの紐付けを解除して、削除対象のユーザーのprofilesテーブルのデータをリセット(stripe顧客idとprofile_nameを除く)
    const { error: accountUpdateError } = await supabase.rpc("delete_from_team", {
      delete_user_id: memberAccount.id,
    });

    // const { data: newAccountData, error: accountUpdateError } = await supabase
    //   .from("subscribed_accounts")
    //   .update({
    //     user_id: null,
    //     company_role: null,
    //   })
    //   .eq("id", memberAccount.subscribed_account_id)
    //   .select();

    if (accountUpdateError) {
      console.log("アカウントのuser_idの解除に失敗", accountUpdateError);
      toast.error(`チームからメンバーの削除に失敗しました!`);
      return;
    }
    toast.success(`チームからメンバーの削除が完了しました!`);
    console.log("チームから削除成功");

    // アカウントとユーザーの紐付け解除完了後はMemberAccountsキャッシュをリフレッシュ
    await queryClient.invalidateQueries({ queryKey: ["member_accounts"] });

    setLoading(false);

    setIsOpenRoleMenu(false);
    setRemoveTeamMember(null);
  };

  // =============================== 招待を再送信する(既にサインアップしてるユーザー向け)
  const resendInvitationEmail = async () => {
    setLoading(true);
    try {
      const payload = {
        email: memberAccount.account_invited_email,
        handleName: userProfileState?.profile_name,
        siteUrl: `${process.env.CLIENT_URL ?? `http://localhost:3000`}`,
      };
      const { data } = await axios.post(`/api/send/invite-to-team`, payload, {
        headers: {
          Authorization: `Bearer ${sessionState.access_token}`,
        },
      });
      // 招待状の送信完了
      toast.success(`${memberAccount.account_invited_email}の招待の送信が完了しました!`);
    } catch (error: any) {
      console.error(`${memberAccount.account_invited_email}の招待にエラーが発生しました：${error.message}`);
      toast.error(`${memberAccount.account_invited_email}の招待に失敗しました!`);
    }
    setLoading(false);
  };

  // =============================== 招待をキャンセルする(既にサインアップしてるユーザー向け)
  const cancelInvitation = async () => {
    setLoadingCancel(true);
    // Invitationsテーブルのsubscribed_account_idカラムとfrom_company_idカラムに一致するinvitationデータをキャンセル
    // resultがpendingのみ条件で絞る
    try {
      // invitationをキャンセル
      const { error } = await supabase
        .from("subscribed_accounts")
        .update({ user_id: null })
        .from("invitations")
        .update({
          result: "canceled",
        })
        .eq("result", "pending")
        .eq("from_company_id", userProfileState?.company_id);

      if (error) {
        console.log(`招待キャンセル invitationsテーブルへのupdateでエラー`, error.message);
        throw new Error(error.message);
      }
      // アカウントのinvited_emailを削除、NULLに更新
      const { error: accountError } = await supabase
        .from("subscribed_accounts")
        .update({
          account_company_role: null,
          invited_email: null,
        })
        .eq("id", memberAccount.subscribed_account_id);

      if (accountError) {
        console.log(`招待キャンセル subscribed_accountsテーブルへのupdateでエラー`, accountError.message);
        throw new Error(accountError.message);
      }

      toast.success(`${memberAccount.account_invited_email}の招待キャンセルが完了しました!`);
      // 招待キャンセル完了後はMemberAccountsキャッシュをリフレッシュ
      await queryClient.invalidateQueries({ queryKey: ["member_accounts"] });
    } catch (error: any) {
      console.error(`招待キャンセルでエラー`, error);
      toast.error(`${memberAccount.account_invited_email}の招待キャンセルに失敗しました!`);
    }
    setLoadingCancel(false);
  };

  // 招待を再送信する（未登録ユーザー向け）
  const handleResendInvitationEmailForUnregisteredUser = async () => {
    setLoading(true);
    if (!memberAccount.email) {
      console.log("memberAccount.emailなしのためリターン", memberAccount.email);
      toast.error(`招待の再送信に失敗しました...`, {
        position: "top-right",
        autoClose: 5000,
      });
    }
    const email = memberAccount.email;
    try {
      const { data } = await axios.get(`/api/invitation/${email}`, {
        headers: {
          Authorization: `Bearer ${sessionState.access_token}`,
        },
      });
      const invitedUserId = data.user.id;
      const invitedUserEmail = data.user.email;
      console.log(
        "送信したメール",
        email,
        "axios.get()の返り値: ",
        data,
        "招待したユーザーのid",
        invitedUserId,
        "招待したユーザーのEmail",
        invitedUserEmail
      );
      toast.success(`${email}の送信が完了しました!`, {
        position: "top-right",
        autoClose: 5000,
      });
    } catch (e: any) {
      console.error("送信エラー", email, e);
      toast.error(`${email}の送信に失敗しました!`, {
        position: "top-right",
        autoClose: 5000,
      });
    }
    setLoading(false);
    setIsOpenRoleMenu(false);
  };

  // 招待をキャンセルする（未登録ユーザー向け）
  const handleCancelInvitationEmailForUnregisteredUser = async () => {
    setLoadingCancel(true);
    if (!memberAccount.id) {
      console.log("memberAccount.idなしのためリターン", memberAccount.id);
      toast.error(`招待の再送信に失敗しました...`, {
        position: "top-right",
        autoClose: 5000,
      });
    }
    const email = memberAccount.email;
    const deleteUserId = memberAccount.id;
    console.log("招待をキャンセルする未登録ユーザーのidとemail", deleteUserId, email);
    try {
      // subscribed_accountsテーブルからuser_idの紐付けを解除できたらUsersとprofilesから削除する
      const { data: updateAccount, error: updateError } = await supabase
        .from("subscribed_accounts")
        .update({
          user_id: null,
          company_role: null,
        })
        .eq("user_id", deleteUserId)
        .select()
        .single();

      if (updateError) {
        console.log("subscribed_accountsのuser_idの紐付け解除に失敗 updateError", updateError);
        throw updateError;
      }
      console.log("subscribed_accountsのuser_idの紐付け解除の成功 updateAccount", updateAccount);
      const payload = {
        deleteUserId: deleteUserId,
        email: email,
      };
      const { data } = await axios.post(`/api/invitation/cancel-invitation-for-unregistered-user`, payload, {
        headers: {
          Authorization: `Bearer ${sessionState.access_token}`,
        },
      });

      console.log("Usersとprofilesの削除に成功 招待のキャンセルに完了 data", data);

      // アカウントとユーザーの紐付け解除完了後はMemberAccountsキャッシュをリフレッシュ
      await queryClient.invalidateQueries({ queryKey: ["member_accounts"] });

      toast.success(`${email}の招待のキャンセルが完了しました!`, {
        position: "top-right",
        autoClose: 5000,
      });
    } catch (e: any) {
      console.error("送信エラー", email, e);
      toast.error(`${email}の招待のキャンセルに失敗しました...`, {
        position: "top-right",
        autoClose: 5000,
      });
    }
    setLoadingCancel(false);
    setCancelInvitationForUnregisteredUser(false);
    setIsOpenRoleMenu(false);
  };

  // console.log("🌟memberAccount", memberAccount, "memberAccount.avatar_url", memberAccount.avatar_url);

  return (
    <>
      {/* メンバーデータ編集ドロップダウンメニュー オーバーレイ */}
      {isOpenDropdownMenuUpdateMember && (
        <div
          className="fixed left-[-100vw] top-[-50%] z-[10000] h-[200vh] w-[300vw] bg-[#00000000]"
          onClick={() => {
            setIsOpenDropdownMenuUpdateMember(false);
          }}
        ></div>
      )}
      {/* ローディング用 */}
      {isOpenDropdownMenuUpdateMember && isLoadingUpsertMember && (
        <div className="flex-center fixed left-[-100vw] top-[-50%] z-[21000] h-[200vh] w-[300vw] bg-[#00000000]">
          <div
            className={`flex-center fixed left-0 top-0 z-[6000] h-[100%] w-[100%] rounded-[8px] bg-[var(--overlay-relight)]`}
          >
            <SpinnerComet h="60px" w="60px" s="5px" />
          </div>
        </div>
      )}
      {/* ローディング */}
      {loading && (
        <div className={`flex-center fixed left-0 top-0 z-[6000] h-[100%] w-[100%] rounded-[8px] bg-[#00000090]`}>
          <SpinnerIDS scale={"scale-[0.5]"} />
        </div>
      )}
      <div role="row" className={`${styles.grid_row} ${styles.grid_row_member}`}>
        <div role="gridcell" className={`${styles.grid_cell} flex items-center`}>
          {/* アバターアイコン画像 */}
          {!avatarUrl && memberAccount.id && memberAccount.profile_name && (
            <div
              className={`flex-center max-h-[40px] min-h-[40px] min-w-[40px] max-w-[40px] rounded-full bg-[var(--color-bg-brand-sub)] text-[#fff] hover:bg-[var(--color-bg-brand-sub-hover)] ${styles.tooltip} mr-[15px]`}
            >
              <span className={`select-none text-[20px]`}>
                {memberAccount?.profile_name ? getInitial(memberAccount.profile_name) : `${getInitial("NoName")}`}
              </span>
            </div>
          )}
          {!avatarUrl && !memberAccount.profile_name && (
            <div
              className={`flex-center mr-[15px] max-h-[40px] min-h-[40px] min-w-[40px] max-w-[40px] overflow-hidden rounded-full hover:bg-[#00000020]`}
            >
              <Image
                src={`${
                  theme === "light"
                    ? // ? `/assets/images/icons/icons8-user-light78.png`
                      `/assets/images/icons/icons8-user-aaa.png`
                    : // : `/assets/images/icons/icons8-user-dark.png`
                      `/assets/images/icons/icons8-user-aaa.png`
                }`}
                alt="Avatar"
                className={`h-full w-full object-cover text-[#fff]`}
                width={75}
                height={75}
              />
            </div>
          )}
          {avatarUrl && (
            <div
              className={`flex-center mr-[15px] max-h-[40px] min-h-[40px] min-w-[40px] max-w-[40px] overflow-hidden rounded-full hover:bg-[#00000020]`}
            >
              <Image
                src={avatarUrl}
                alt="Avatar"
                className={`h-full w-full object-cover text-[#fff]`}
                width={75}
                height={75}
              />
            </div>
          )}
          {/* 氏名 */}
          {!memberAccount.account_company_role && memberAccount.account_state === "active" && (
            <span>{memberAccount.profile_name ? memberAccount.profile_name : "メンバー未設定"}</span>
          )}
          {!memberAccount.account_company_role && memberAccount.account_state === "delete_requested" && (
            <span className={`text-[var(--main-color-tk)]`}>削除リクエスト済み</span>
          )}
          {memberAccount.account_company_role && (
            <div
              // className={`relative flex max-h-[73px] max-w-[140px] flex-col justify-center hover:underline ${
              //   isOpenDropdownMenuUpdateMember ? `cursor-default` : `cursor-pointer`
              // }`}
              className={`relative flex max-h-[73px] max-w-[164px] flex-col justify-center hover:underline ${
                isOpenDropdownMenuUpdateMember ? `cursor-default` : `cursor-pointer`
              }`}
              onClick={(e) => {
                if (isOpenDropdownMenuUpdateMember) return;
                const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
                // const clickedPositionPlusItemHeight =
                //   y + 220 + 40 - 10 + (memberAccount.profile_name === null ? 43.5 : 0); // 40はmargin分 -10pxは微調整
                // const clickedPositionPlusItemHeight = y + 340 + (memberAccount.profile_name === null ? 43.5 : 0); // 340はメニューの最低高さ 40はmargin分 -10pxは微調整
                // const clickedPositionPlusItemHeight = y + 340 + 5; // 340はメニューの最低高さ 40はmargin分 -10pxは微調整
                const clickedPositionPlusItemHeight = y + 400 + 5; // 400はメニューの最低高さ 40はmargin分 -10pxは微調整
                // const clickedPositionMinusItemHeight = y - 400 - 5; // 400はメニューの最低高さ 40はmargin分 -10pxは微調整
                const clickedPositionMinusItemHeight = y - 400 + height - 25; // 400はメニューの最低高さ 40はmargin分 -10pxは微調整 heightは名前エリア高さ分メニューを下げているため
                // const modalHeight = window.innerHeight * 0.9;
                const modalHeight = settingModalProperties?.height ?? window.innerHeight * 0.9;
                const halfBlankSpaceWithoutModal = (window.innerHeight - modalHeight) / 2;
                const modalBottomPosition =
                  settingModalProperties?.bottom ?? window.innerHeight - halfBlankSpaceWithoutModal;
                const modalTopPosition = settingModalProperties?.top ?? halfBlankSpaceWithoutModal;
                // const oneThird = window.innerHeight - window.innerHeight / 3;
                if (
                  modalBottomPosition < clickedPositionPlusItemHeight &&
                  modalTopPosition < clickedPositionMinusItemHeight
                ) {
                  console.log(
                    "アップ",
                    "y",
                    y,
                    "width",
                    width,
                    "モーダル下部",
                    modalBottomPosition,
                    "クリック位置とメニューYの合計",
                    clickedPositionPlusItemHeight,
                    "height",
                    height,
                    "モーダル上部",
                    modalTopPosition,
                    "クリック位置とメニューYを引いた合計",
                    clickedPositionMinusItemHeight,
                    "window.innerHeight",
                    window.innerHeight,
                    "settingModalProperties?.top",
                    settingModalProperties?.top
                  );
                  setClickedItemPositionMember({ displayPos: "up", clickedItemWidth: width });
                } else if (
                  modalTopPosition > clickedPositionMinusItemHeight &&
                  modalBottomPosition < clickedPositionPlusItemHeight
                ) {
                  console.log(
                    "センター",
                    "y",
                    y,
                    "width",
                    width,
                    "モーダル下部",
                    modalBottomPosition,
                    "クリック位置とメニューYの合計",
                    clickedPositionPlusItemHeight,
                    "height",
                    height,
                    "モーダル上部",
                    modalTopPosition,
                    "クリック位置とメニューYを引いた合計",
                    clickedPositionMinusItemHeight,
                    "settingModalProperties?.top",
                    settingModalProperties?.top
                  );
                  setClickedItemPositionMember({ displayPos: "center", clickedItemWidth: width });
                } else {
                  console.log(
                    "ダウン",
                    "y",
                    y,
                    "width",
                    width,
                    "モーダル下部",
                    modalBottomPosition,
                    "クリック位置とメニューYの合計",
                    clickedPositionPlusItemHeight,
                    "height",
                    height,
                    "モーダル上部",
                    modalTopPosition,
                    "クリック位置とメニューYを引いた合計",
                    clickedPositionMinusItemHeight,
                    "window.innerHeight",
                    window.innerHeight,
                    "settingModalProperties?.top",
                    settingModalProperties?.top
                  );
                  setClickedItemPositionMember({ displayPos: "down", clickedItemWidth: width });
                }
                setIsOpenDropdownMenuUpdateMember(true);
              }}
            >
              <div className="flex items-center">
                <span className={`${!memberAccount.profile_name ? `text-[var(--color-text-sub)]` : ``}`}>
                  {memberAccount.profile_name ? memberAccount.profile_name : "招待済み"}{" "}
                </span>
                <MdOutlineEdit
                  className={`pointer-events-none ml-[6px] min-h-[16px] min-w-[16px] text-[16px] text-[var(--color-text-sub-light)] ${styles.edit_icon} mb-[2px]`}
                />
              </div>
              {memberAccount.profile_name && (
                <span className="truncate text-[10px] text-[var(--color-text-sub)]">
                  {memberAccount.assigned_department_name ? memberAccount.assigned_department_name : "事業部未設定"}{" "}
                  {memberAccount.assigned_unit_name ? memberAccount.assigned_unit_name : ""}
                </span>
              )}
              {memberAccount.profile_name && memberAccount.assigned_office_name && (
                <span className="truncate text-[10px] text-[var(--color-text-sub)]">
                  {memberAccount.assigned_employee_id_name ? memberAccount.assigned_employee_id_name : ""}{" "}
                  {memberAccount.assigned_office_name ? memberAccount.assigned_office_name : ""}
                </span>
              )}
              {/* メンバーデータ編集ドロップダウンメニュー */}
              {isOpenDropdownMenuUpdateMember && (
                <DropDownMenuUpdateMember
                  memberAccount={memberAccount}
                  setIsOpenDropdownMenuUpdateMember={setIsOpenDropdownMenuUpdateMember}
                  clickedItemPositionMember={clickedItemPositionMember}
                  setIsLoadingUpsertMember={setIsLoadingUpsertMember}
                />
              )}
              {/* メンバーデータ編集ドロップダウンメニューここまで */}
            </div>
          )}
        </div>
        {/* 氏名グリッドセル ここまで */}
        {/* メールアドレス */}
        <div
          role="gridcell"
          className={`${styles.grid_cell} ${
            !memberAccount.email && memberAccount.account_invited_email ? `text-[var(--color-text-sub)]` : ``
          }`}
        >
          {memberAccount.email ? memberAccount.email : memberAccount.account_invited_email ?? ""}
        </div>
        {/* チームでの役割 */}
        <div role="gridcell" className={`${styles.grid_cell} relative`}>
          <div
            className={`flex items-center ${
              // memberAccount.is_subscriber || !memberAccount.account_company_role
              memberAccount.account_company_role === "company_owner" || !memberAccount.account_company_role
                ? "cursor-not-allowed"
                : "cursor-pointer"
            }`}
            onClick={(e) => {
              // if (memberAccount.is_subscriber || !memberAccount.account_company_role) return;
              // if (memberAccount.account_company_role === "company_owner" || !memberAccount.account_company_role)
              //   return;

              // クリック位置を取得
              // const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
              const { x, y } = e.currentTarget.getBoundingClientRect();
              // const clickedPositionPlusItemHeight =
              //   y + 220 + 40 - 10 + (memberAccount.profile_name === null ? 43.5 : 0); // 40はmargin分 -10pxは微調整
              const clickedPositionPlusItemHeight =
                y + 220 + 20 + 40 + (memberAccount.profile_name === null ? 43.5 : 0); // 40はmargin分 -10pxは微調整
              // const modalHeight = window.innerHeight * 0.9;
              const modalHeight = settingModalProperties?.height ?? window.innerHeight * 0.9;
              const halfBlankSpaceWithoutModal = (window.innerHeight - modalHeight) / 2;
              const modalBottomPosition =
                settingModalProperties?.bottom ?? window.innerHeight - halfBlankSpaceWithoutModal;
              // const oneThird = window.innerHeight - window.innerHeight / 3;
              if (modalBottomPosition < clickedPositionPlusItemHeight) {
                console.log(
                  "アップ",
                  "y",
                  y,
                  "モーダル下部",
                  modalBottomPosition,
                  "クリック位置とメニューYの合計",
                  clickedPositionPlusItemHeight,
                  "window.innerHeight",
                  window.innerHeight
                );
                setClickedItemPosition("up");
              } else {
                console.log(
                  "ダウン",
                  "y",
                  y,
                  "モーダル下部",
                  modalBottomPosition,
                  "クリック位置とメニューYの合計",
                  clickedPositionPlusItemHeight,
                  "window.innerHeight",
                  window.innerHeight
                );
                setClickedItemPosition("down");
              }
              setIsOpenRoleMenu(true);
            }}
          >
            <span className="mr-[10px]">
              {/* {memberAccount.is_subscriber ? "所有者" : getCompanyRole(memberAccount.account_company_role)} */}
              {/* {memberAccount.is_subscriber ? "所有者" : getCompanyRole(roleAtTeam)} */}
              {memberAccount.account_company_role === "company_owner" ? "所有者" : getCompanyRole(roleAtTeam)}
            </span>
            {/* {!memberAccount.is_subscriber && memberAccount.account_company_role && <BsChevronDown />} */}
            {memberAccount.account_company_role !== "company_owner" && memberAccount.account_company_role && (
              <BsChevronDown />
            )}
          </div>

          {/* ==================== チームでの役割メニューポップアップ ==================== */}
          {isOpenRoleMenu && (
            <>
              {/* オーバーレイ */}
              <div
                className="fixed left-[-50%] top-[-50%] z-[10000] h-[200vh] w-[200vw] bg-[#00000000]"
                onClick={() => setIsOpenRoleMenu(false)}
              ></div>

              {/* 通常時 h-[152px] 招待中時 */}
              <div
                className={`shadow-all-md border-real absolute left-[0px]  z-[12000] h-auto w-[180px] rounded-[8px] bg-[var(--color-bg-dropdown-menu)] p-[1px] ${
                  clickedItemPosition === "down"
                    ? `top-[60px]`
                    : memberAccount.profile_name
                    ? `top-[-210px]`
                    : `top-[-250px]`
                }`}
              >
                {/* <ul className={`flex flex-col py-[8px]`}> */}
                <ul className={`flex flex-col`}>
                  <li
                    className={`flex min-h-[40px] w-full cursor-pointer items-center justify-between rounded-tl-[8px] rounded-tr-[8px] px-[14px] py-[12px] pr-[18px] hover:bg-[var(--color-bg-sub)]`}
                    onClick={() => {
                      if (userProfileState?.account_company_role !== "company_owner") {
                        return alert(`管理者権限を変更できるのはオーナー権限を持つユーザーのみです。`);
                      }
                      if (memberAccount.account_company_role === "company_admin") {
                        setIsOpenRoleMenu(false);
                        return;
                      }
                      handleChangeRole("company_admin");
                      setIsOpenRoleMenu(false);
                    }}
                  >
                    <span className="select-none">管理者</span>
                    {memberAccount.account_company_role === "company_admin" && (
                      <BsCheck2 className="min-h-[16px] min-w-[16px] stroke-[0.5] text-[16px]" />
                    )}
                  </li>
                  <li
                    className={`flex min-h-[40px] w-full cursor-pointer items-center justify-between px-[14px] py-[12px] pr-[18px] hover:bg-[var(--color-bg-sub)]`}
                    onClick={() => {
                      if (!["company_owner", "company_admin"].includes(userProfileState?.account_company_role ?? "")) {
                        return alert(`マネージャー権限を変更できるのはオーナーと管理者の権限を持つユーザーのみです。`);
                      }
                      if (memberAccount.account_company_role === "company_manager") {
                        setIsOpenRoleMenu(false);
                        return;
                      }
                      handleChangeRole("company_manager");
                      setIsOpenRoleMenu(false);
                    }}
                  >
                    <span className="select-none">マネージャー</span>
                    {memberAccount.account_company_role === "company_manager" && (
                      <BsCheck2 className="min-h-[16px] min-w-[16px] stroke-[0.5] text-[16px]" />
                    )}
                  </li>
                  <li
                    className={`flex min-h-[40px] w-full cursor-pointer items-center justify-between px-[14px] py-[12px] pr-[18px] hover:bg-[var(--color-bg-sub)]`}
                    onClick={() => {
                      if (memberAccount.account_company_role === "company_member") {
                        setIsOpenRoleMenu(false);
                        return;
                      }
                      handleChangeRole("company_member");
                      setIsOpenRoleMenu(false);
                    }}
                  >
                    <span className="select-none">メンバー</span>
                    {memberAccount.account_company_role === "company_member" && (
                      <BsCheck2 className="min-h-[16px] min-w-[16px] stroke-[0.5] text-[16px]" />
                    )}
                  </li>
                  <li
                    className={`flex min-h-[40px] w-full cursor-pointer items-center justify-between px-[14px] py-[12px] pr-[18px] hover:bg-[var(--color-bg-sub)]`}
                    onClick={() => {
                      if (memberAccount.account_company_role === "guest") {
                        setIsOpenRoleMenu(false);
                        return;
                      }
                      handleChangeRole("guest");
                      setIsOpenRoleMenu(false);
                    }}
                  >
                    <span className="select-none">ゲスト</span>
                    {memberAccount.account_company_role === "guest" && (
                      <BsCheck2 className="min-h-[16px] min-w-[16px] stroke-[0.5] text-[16px]" />
                    )}
                  </li>
                  <hr className="w-full border-t border-solid border-[var(--color-border-table)]" />
                  {/* <li className="flex-center h-[16px] w-full">
                    <hr className="w-full border-t border-solid border-[var(--color-border-table)]" />
                  </li> */}
                  {!memberAccount.account_invited_email && memberAccount.profile_name && (
                    <li
                      className={`flex min-h-[40px] w-full cursor-pointer items-center rounded-bl-[8px] rounded-br-[8px] px-[14px] py-[12px] hover:bg-[var(--color-bg-sub)]`}
                      // onClick={removeFromTeam}
                      onClick={() => setRemoveTeamMember(memberAccount)}
                    >
                      <span className="select-none">チームから削除</span>
                    </li>
                  )}
                  {/* 既に登録済みユーザーへの招待用 */}
                  {memberAccount.account_invited_email && (
                    <li
                      className={`flex min-h-[40px] w-full cursor-pointer items-center px-[14px] py-[12px] hover:bg-[var(--color-bg-sub)]`}
                      onClick={resendInvitationEmail}
                    >
                      <span className="select-none">招待を再送信</span>
                    </li>
                  )}
                  {memberAccount.account_invited_email && (
                    <li
                      className={`flex min-h-[40px] w-full cursor-pointer items-center rounded-bl-[8px] rounded-br-[8px] px-[14px] py-[12px] hover:bg-[var(--color-bg-sub)]`}
                      onClick={cancelInvitation}
                    >
                      <span className="select-none">招待をキャンセル</span>
                    </li>
                  )}
                  {/* 未登録ユーザーへの招待用 */}
                  {!memberAccount.profile_name && !memberAccount.account_invited_email && (
                    <li
                      className={`flex min-h-[40px] w-full cursor-pointer items-center px-[14px] py-[12px] hover:bg-[var(--color-bg-sub)]`}
                      onClick={handleResendInvitationEmailForUnregisteredUser}
                    >
                      <span className="select-none">招待を再送信する</span>
                    </li>
                  )}
                  {!memberAccount.profile_name && !memberAccount.account_invited_email && (
                    <li
                      className={`flex min-h-[40px] w-full cursor-pointer items-center rounded-bl-[8px] rounded-br-[8px] px-[14px] py-[12px] hover:bg-[var(--color-bg-sub)]`}
                      onClick={() => setCancelInvitationForUnregisteredUser(true)}
                    >
                      <span className="select-none">招待をキャンセルする</span>
                    </li>
                  )}
                </ul>
              </div>
            </>
          )}
        </div>
        {/* ==================== チームでの役割メニューポップアップ ここまで ==================== */}

        {/* チェックボックスと招待ボタン */}
        <div role="gridcell" className={styles.grid_cell}>
          {memberAccount.account_company_role && memberAccount.account_company_role !== "company_owner" && (
            <div className={`${styles.grid_select_cell_header}`}>
              <input
                type="checkbox"
                // checked={checkedMembersArray[index]}
                // checked={checkedMembersArray.includes(memberAccount.id)}
                checked={checkedMembersArray.includes(memberAccount.subscribed_account_id)}
                onChange={() => {
                  let newCheckedArray = [...checkedMembersArray];
                  // newCheckedArray[index] = !checkedMembersArray[index];
                  // チェックを外す
                  // if (checkedMembersArray.includes(memberAccount.id)) {
                  if (checkedMembersArray.includes(memberAccount.subscribed_account_id)) {
                    // newCheckedArray = newCheckedArray.filter((id) => id !== memberAccount.id);
                    // const removedIdIndex = newCheckedArray.findIndex((id) => id === memberAccount.id);
                    const removedIdIndex = newCheckedArray.findIndex(
                      (id) => id === memberAccount.subscribed_account_id
                    );
                    if (removedIdIndex !== -1) {
                      // newCheckedArray[removedIdIndex] = memberAccount.id;
                      newCheckedArray[removedIdIndex] = null;
                    }
                  }
                  // チェックを入れる
                  else {
                    const nullIndex = newCheckedArray.findIndex((id) => id === null);
                    if (nullIndex !== -1) {
                      // newCheckedArray[nullIndex] = memberAccount.id;
                      newCheckedArray[nullIndex] = memberAccount.subscribed_account_id;
                    }
                  }
                  // newCheckedArray[index] = !checkedMembersArray[index];
                  setCheckedMembersArray(newCheckedArray);
                }}
                // checked={checked}
                // onChange={() => setChecked(!checked)}
                className={`${styles.grid_select_cell_header_input}`}
              />
              <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
              </svg>
            </div>
          )}
          {!memberAccount.account_company_role && memberAccount.account_state === "active" && (
            <div className="flex-center h-full w-full">
              <RippleButton
                title={`招待`}
                // bgColor="var(--color-btn-brand-f-re)"
                border="var(--color-btn-brand-f-re-hover)"
                borderRadius="2px"
                classText={`select-none`}
                clickEventHandler={() => {
                  setIsOpenSettingInvitationModal(true);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* ============================== チームから削除の確認モーダル ============================== */}
      {removeTeamMember !== null && (
        <>
          {/* オーバーレイ */}
          <div
            className="fixed left-[-100vw] top-[-100vh] z-[1000] h-[200vh] w-[200vw] bg-[var(--color-overlay)] backdrop-blur-sm"
            onClick={() => {
              console.log("オーバーレイ クリック");
              setRemoveTeamMember(null);
              setIsOpenRoleMenu(false);
            }}
          ></div>
          <div className={`fade02 fixed ${styles.confirm_modal}`}>
            {loading && (
              <div className={`flex-center fixed left-0 top-0 z-[3000] h-[100%] w-[100%] rounded-[8px] bg-[#00000090]`}>
                <SpinnerIDS scale={"scale-[0.5]"} />
              </div>
            )}
            {/* クローズボタン */}
            <button
              className={`flex-center z-100 group absolute right-[-40px] top-0 h-[32px] w-[32px] rounded-full bg-[#00000090] hover:bg-[#000000c0]`}
              onClick={() => {
                setRemoveTeamMember(null);
                setIsOpenRoleMenu(false);
              }}
            >
              <MdClose className="text-[20px] text-[#fff]" />
            </button>
            <h3 className={`flex min-h-[32px] w-full items-center text-[22px] font-bold`}>
              {removeTeamMember.profile_name}さんを削除しますか？
            </h3>
            <section className={`mt-[20px] flex h-auto w-full flex-col space-y-3 text-[14px]`}>
              <p>チームから削除されたユーザーは、保存したデータやコンテンツにアクセスできなくなります。</p>
              <p className="font-bold">
                注：この操作により、該当ユーザーのデータは、他のチームメンバーと共有されていないものを含めて全てアクセスできなくなります。
              </p>
            </section>
            <section className="flex w-full items-start justify-end">
              <div className={`flex w-[100%] items-center justify-around space-x-5 pt-[30px]`}>
                <button
                  className={`w-[50%] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[15px] py-[10px] text-[14px] font-bold text-[var(--color-text-title)] hover:bg-[var(--setting-side-bg-select-hover)]`}
                  onClick={() => {
                    setRemoveTeamMember(null);
                    setIsOpenRoleMenu(false);
                  }}
                >
                  キャンセル
                </button>
                <button
                  className="w-[50%] cursor-pointer rounded-[8px] bg-[var(--color-red-tk)] px-[15px] py-[10px] text-[14px] font-bold text-[#fff] hover:bg-[var(--color-red-tk-hover)]"
                  onClick={removeFromTeam}
                >
                  チームから削除する
                </button>
              </div>
            </section>
          </div>
        </>
      )}
      {/* ============================== チームから削除の確認モーダル ここまで ============================== */}
      {/* ======================= 招待キャンセル確認モーダル（未登録ユーザー向け） ======================= */}
      {cancelInvitationForUnregisteredUser === true && (
        <>
          {/* オーバーレイ */}
          <div
            className="fixed left-[-100vw] top-[-100vh] z-[1000] h-[200vh] w-[200vw] bg-[var(--color-overlay)] backdrop-blur-sm"
            onClick={() => {
              setCancelInvitationForUnregisteredUser(false);
              setIsOpenRoleMenu(false);
            }}
          ></div>
          <div className="fade02 fixed left-[50%] top-[50%] z-[5000] h-auto w-[40vw] translate-x-[-50%] translate-y-[-50%] rounded-[8px] bg-[var(--color-bg-notification-modal)] p-[32px] text-[var(--color-text-title)]">
            {loadingCancel && (
              <div className={`flex-center fixed left-0 top-0 z-[3000] h-[100%] w-[100%] rounded-[8px] bg-[#00000090]`}>
                <SpinnerIDS scale={"scale-[0.5]"} />
              </div>
            )}
            {/* クローズボタン */}
            <button
              className={`flex-center z-100 group absolute right-[-40px] top-0 h-[32px] w-[32px] rounded-full bg-[#00000090] hover:bg-[#000000c0]`}
              onClick={() => {
                setCancelInvitationForUnregisteredUser(false);
                setIsOpenRoleMenu(false);
              }}
            >
              <MdClose className="text-[20px] text-[#fff]" />
            </button>
            <h3 className={`flex min-h-[32px] w-full items-center text-[22px] font-bold`}>
              招待をキャンセルしますか？
            </h3>
            <section className={`mt-[20px] flex h-auto w-full flex-col space-y-3 text-[14px]`}>
              <p>{memberAccount.email}への招待をキャンセルしてもよろしいですか？</p>
              {/* <p className="font-bold">
                注：この操作により、該当ユーザーのデータは、他のチームメンバーと共有されていないものを含めて全てアクセスできなくなります。
              </p> */}
            </section>
            <section className="flex w-full items-start justify-end">
              <div className={`flex w-[100%] items-center justify-around space-x-5 pt-[30px]`}>
                <button
                  className={`w-[50%] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[15px] py-[10px] text-[14px] font-bold text-[var(--color-text-title)] hover:bg-[var(--setting-side-bg-select-hover)]`}
                  onClick={() => {
                    setCancelInvitationForUnregisteredUser(false);
                    setIsOpenRoleMenu(false);
                  }}
                >
                  戻る
                </button>
                <button
                  className="w-[50%] cursor-pointer rounded-[8px] bg-[var(--color-red-tk)] px-[15px] py-[10px] text-[14px] font-bold text-[#fff] hover:bg-[var(--color-red-tk-hover)]"
                  onClick={handleCancelInvitationEmailForUnregisteredUser}
                >
                  招待をキャンセルする
                </button>
              </div>
            </section>
          </div>
        </>
      )}
      {/* ================== 招待キャンセル確認モーダル（未登録ユーザー向け） ここまで ================== */}
      {/* ローディング オーバーレイ */}
      {}
      {/* ローディング オーバーレイ ここまで */}
    </>
  );
};

export const GridRowMember = memo(GridRowMemberMemo);
