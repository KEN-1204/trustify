import { useDownloadUrl } from "@/hooks/useDownloadUrl";
import { MemberAccounts } from "@/types";
import NextImage from "next/image";
import React, { memo } from "react";

const MemberCardMemo = ({ member }: { member: MemberAccounts }) => {
  const { fullUrl: avatarUrl, isLoading: isLoadingAvatar } = useDownloadUrl(member.avatar_url, "avatars");
  // 頭文字のみ抽出
  const getInitial = (name: string) => name[0];
  return (
    <div
      //   key={member.id}
      className={`flex min-h-[44px] w-full cursor-pointer items-center truncate rounded-[8px] py-[12px] pl-[24px] hover:bg-[var(--setting-side-bg-select)]`}
      // onClick={() => {
      //   if (selectedMember === member)
      //     return console.log("既にそのメンバーは選択済みのためリターン");
      //   setSelectedMember(member);
      // }}
    >
      {!avatarUrl && (
        <div
          // data-text="ユーザー名"
          className={`flex-center mr-[15px] h-[40px] w-[40px] cursor-pointer rounded-full bg-[var(--color-bg-brand-sub)] text-[#fff] hover:bg-[var(--color-bg-brand-sub-hover)]`}
          // onMouseEnter={(e) => handleOpenTooltip(e, "center")}
          // onMouseLeave={handleCloseTooltip}
        >
          <span className={`text-[20px]`}>{getInitial(member.profile_name ? member.profile_name : "")}</span>
        </div>
      )}
      {avatarUrl && (
        <div
          className={`flex-center mr-[15px] h-[40px] w-[40px] cursor-pointer overflow-hidden rounded-full hover:bg-[#00000020]`}
        >
          <NextImage
            src={avatarUrl}
            alt="logo"
            className={`h-full w-full object-cover text-[#fff]`}
            width={75}
            height={75}
          />
        </div>
      )}
      <div className={`flex h-full flex-col space-y-[3px] pl-[5px] text-[12px]`}>
        <div className={`text-[13px]`}>
          <span>{member.profile_name ? member.profile_name : ""}</span>
        </div>
        <div className={`text-[var(--color-text-sub)]`}>{member.email ? member.email : ""}</div>
      </div>
    </div>
  );
};

export const MemberCard = memo(MemberCardMemo);
