import React, { FC, memo, useState } from "react";
import styles from "./SettingMemberAccounts.module.css";
import { useDownloadUrl } from "@/hooks/useDownloadUrl";
import { MemberAccounts } from "@/types";
import Image from "next/image";
import useRootStore from "@/store/useRootStore";
import useThemeStore from "@/store/useThemeStore";
import { RippleButton } from "@/components/Parts/RippleButton/RippleButton";
import useDashboardStore from "@/store/useDashboardStore";

// type Props = {
//   id: string;
//   profile_name: string;
//   email: string;
//   account_company_role: string;
// };
type Props = {
  memberAccount: MemberAccounts;
};

export const GridRowMemberMemo: FC<Props> = ({ memberAccount }) => {
  const theme = useRootStore(useThemeStore, (state) => state.theme);
  // 招待メールモーダル
  const setIsOpenSettingInvitationModal = useDashboardStore((state) => state.setIsOpenSettingInvitationModal);
  // チェックボックス
  const [checked, setChecked] = useState(false);

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

  console.log("🌟memberAccount", memberAccount, "memberAccount.avatar_url", memberAccount.avatar_url);
  return (
    <>
      <div role="row" className={`${styles.grid_row}`}>
        <div role="gridcell" className={`${styles.grid_cell} flex items-center`}>
          {!avatarUrl && memberAccount.id && (
            <div
              className={`flex-center h-[40px] w-[40px] cursor-pointer rounded-full bg-[var(--color-bg-brand-sub)] text-[#fff] hover:bg-[var(--color-bg-brand-sub-hover)] ${styles.tooltip} mr-[15px]`}
            >
              <span className={`text-[20px]`}>
                {memberAccount?.profile_name ? getInitial(memberAccount.profile_name) : `${getInitial("NoName")}`}
              </span>
            </div>
          )}
          {!avatarUrl && !memberAccount.id && (
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
          <span>{memberAccount.profile_name ? memberAccount.profile_name : "メンバー未設定"}</span>
        </div>
        <div role="gridcell" className={styles.grid_cell}>
          {memberAccount.email ? memberAccount.email : ""}
        </div>
        <div role="gridcell" className={styles.grid_cell}>
          {memberAccount.is_subscriber ? "所有者" : getCompanyRole(memberAccount.account_company_role)}
        </div>
        <div role="gridcell" className={styles.grid_cell}>
          {memberAccount.id ? (
            <div className={`${styles.grid_select_cell_header}`}>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => setChecked(!checked)}
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
