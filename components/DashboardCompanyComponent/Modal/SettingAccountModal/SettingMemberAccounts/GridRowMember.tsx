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

// type Props = {
//   id: string;
//   profile_name: string;
//   email: string;
//   account_company_role: string;
// };
type Props = {
  memberAccount: MemberAccounts;
  checkedMembersArray: boolean[];
  setCheckedMembersArray: Dispatch<SetStateAction<any[]>>;
  index: number;
};

export const GridRowMemberMemo: FC<Props> = ({ memberAccount, checkedMembersArray, setCheckedMembersArray, index }) => {
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();
  const theme = useRootStore(useThemeStore, (state) => state.theme);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  // 招待メールモーダル
  const setIsOpenSettingInvitationModal = useDashboardStore((state) => state.setIsOpenSettingInvitationModal);
  // チェックボックス
  // const [checked, setChecked] = useState(false);
  // チームロールポップアップ
  const [isOpenRoleMenu, setIsOpenRoleMenu] = useState(false);
  // チームでの役割を保持するState
  const [roleAtTeam, setRoleAtTeam] = useState(
    memberAccount.account_company_role ? memberAccount.account_company_role : ""
  );

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

  // チームへのメンバー参加、削除時に役割Stateを変更する
  useEffect(() => {
    if (roleAtTeam === memberAccount.account_company_role) return;
    setRoleAtTeam(memberAccount.account_company_role ? memberAccount.account_company_role : "");
  }, [memberAccount.account_company_role]);

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
      toast.error("役割の変更に失敗しました!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        // theme: `${theme === "light" ? "light" : "dark"}`,
      });

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
    toast.success("役割の変更が完了しました!", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      // theme: `${theme === "light" ? "light" : "dark"}`,
    });
  };

  console.log("🌟memberAccount", memberAccount, "memberAccount.avatar_url", memberAccount.avatar_url);
  return (
    <>
      <div role="row" className={`${styles.grid_row}`}>
        <div role="gridcell" className={`${styles.grid_cell} flex items-center`}>
          {!avatarUrl && memberAccount.id && memberAccount.profile_name && (
            <div
              className={`flex-center h-[40px] w-[40px] cursor-pointer rounded-full bg-[var(--color-bg-brand-sub)] text-[#fff] hover:bg-[var(--color-bg-brand-sub-hover)] ${styles.tooltip} mr-[15px]`}
            >
              <span className={`text-[20px]`}>
                {memberAccount?.profile_name ? getInitial(memberAccount.profile_name) : `${getInitial("NoName")}`}
              </span>
            </div>
          )}
          {!avatarUrl && !memberAccount.profile_name && (
            <div
              className={`flex-center mr-[15px] h-[40px] w-[40px] cursor-pointer overflow-hidden rounded-full hover:bg-[#00000020]`}
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
              className={`flex-center mr-[15px] h-[40px] w-[40px] cursor-pointer overflow-hidden rounded-full hover:bg-[#00000020]`}
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
          {!memberAccount.account_company_role && (
            <span>{memberAccount.profile_name ? memberAccount.profile_name : "メンバー未設定"}</span>
          )}
          {memberAccount.account_company_role && (
            <span>{memberAccount.profile_name ? memberAccount.profile_name : "招待済み"}</span>
          )}
        </div>
        <div role="gridcell" className={styles.grid_cell}>
          {memberAccount.email ? memberAccount.email : ""}
        </div>
        <div role="gridcell" className={`${styles.grid_cell} relative`}>
          <div
            className={`flex items-center ${
              memberAccount.is_subscriber || !memberAccount.account_company_role
                ? "cursor-not-allowed"
                : "cursor-pointer"
            }`}
            onClick={() => {
              if (memberAccount.is_subscriber || !memberAccount.account_company_role) return;
              setIsOpenRoleMenu(true);
            }}
          >
            <span className="mr-[10px]">
              {/* {memberAccount.is_subscriber ? "所有者" : getCompanyRole(memberAccount.account_company_role)} */}
              {memberAccount.is_subscriber ? "所有者" : getCompanyRole(roleAtTeam)}
            </span>
            {!memberAccount.is_subscriber && memberAccount.account_company_role && <BsChevronDown />}
          </div>

          {/* ==================== チームでの役割メニューポップアップ ==================== */}
          {isOpenRoleMenu && (
            <>
              <div
                className="fixed left-[-50%] top-[-50%] z-[50] h-[200vh] w-[200vw]"
                onClick={() => setIsOpenRoleMenu(false)}
              ></div>

              <div className="shadow-all-md absolute left-[0px] top-[60px] z-[100] h-[152px] w-[180px] rounded-[8px] bg-[var(--color-edit-bg-solid)]">
                <ul className={`flex flex-col py-[8px]`}>
                  <li
                    className={`flex h-[40px] w-full cursor-pointer items-center justify-between px-[14px] py-[6px] pr-[18px] hover:bg-[var(--color-bg-sub)]`}
                    onClick={() => {
                      if (memberAccount.account_company_role === "company_admin") {
                        setIsOpenRoleMenu(false);
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
                    className={`flex h-[40px] w-full cursor-pointer items-center justify-between px-[14px] py-[6px] pr-[18px] hover:bg-[var(--color-bg-sub)]`}
                    onClick={() => {
                      if (memberAccount.account_company_role === "company_member") {
                        setIsOpenRoleMenu(false);
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
                  <li className="flex-center h-[16px] w-full">
                    <hr className="w-full border-t border-solid border-[var(--color-border-table)]" />
                  </li>
                  <li
                    className={`flex h-[40px] w-full cursor-pointer items-center px-[14px] py-[6px] hover:bg-[var(--color-bg-sub)]`}
                    onClick={async () => {
                      setLoadingGlobalState(true);
                      // subscribed_accountsのuser_idカラムをnullにして契約アカウントとの紐付けを解除する
                      const { data: newAccountData, error: accountUpdateError } = await supabase
                        .from("subscribed_accounts")
                        .update({
                          user_id: null,
                          company_role: null,
                        })
                        .eq("id", memberAccount.subscribed_account_id)
                        .select();

                      if (accountUpdateError) {
                        console.log("アカウントのuser_idの解除に失敗", accountUpdateError);
                        toast.error(`チームからメンバーの削除に失敗しました!`, {
                          position: "top-right",
                          autoClose: 3000,
                          hideProgressBar: false,
                          closeOnClick: true,
                          pauseOnHover: true,
                          draggable: true,
                          progress: undefined,
                        });
                      }
                      toast.success(`チームからメンバーの削除が完了しました!`, {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                      });
                      console.log("UPDATEが成功したアカウントデータ", newAccountData);

                      // アカウントとユーザーの紐付け解除完了後はMemberAccountsキャッシュをリフレッシュ
                      await queryClient.invalidateQueries({ queryKey: ["member_accounts"] });

                      setLoadingGlobalState(false);

                      setIsOpenRoleMenu(false);
                    }}
                  >
                    <span className="select-none">チームから削除</span>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
        <div role="gridcell" className={styles.grid_cell}>
          {memberAccount.id ? (
            <div className={`${styles.grid_select_cell_header}`}>
              <input
                type="checkbox"
                checked={checkedMembersArray[index]}
                onChange={() => {
                  const newCheckedArray = [...checkedMembersArray];
                  newCheckedArray[index] = !checkedMembersArray[index];
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
          ) : (
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
    </>
  );
};

export const GridRowMember = memo(GridRowMemberMemo);
