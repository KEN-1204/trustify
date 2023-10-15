import * as React from "react";
import styles from "./EmailTemplateInvitationToTeamForLoggedInUser.module.css";
import Image from "next/image";

interface EmailTemplateProps {
  handleName: string;
  // confirmationUrl: string;
  siteUrl: string;
}

export const EmailTemplateInvitationToTeamForLoggedInUser: React.FC<Readonly<EmailTemplateProps>> = ({
  handleName,
  // confirmationUrl,
  siteUrl,
}) => (
  <div className={`mx-auto my-0 h-auto w-full max-w-[600px] px-[30px] py-0`}>
    <h1 className={`mt-[40px] font-[28px] text-[#37352f]`}>
      {handleName}さんは、あなたがTRUSTiFYのチームに参加するのを待っています
    </h1>

    <p className={`mt-[30px] text-[17px] leading-[150%] text-[#37352f]`}>こんにちは。</p>

    <p className={`mb-[30px] mt-[20px] text-[17px] leading-[150%] text-[#37352f]`}>
      {handleName}
      さんがあなたをメンバーとしてTRUSTiFYのチームに参加するよう招待しています。招待を受け入れて、チームに参加しましょう。
    </p>

    <a href={siteUrl} className="no-underline">
      <div
        className={`inline-block cursor-pointer rounded-[8px] bg-[#0d99ff] px-[20px] py-[16px] text-[18px] font-bold leading-[1] text-[#fff]`}
      >
        招待を受ける
      </div>
    </a>

    {/* <br /> */}
    <hr className={`mb-[30px] mt-[65px] text-[#37352fa6]`}></hr>

    <p className={`mb-[40px] text-[14px] leading-[150%] text-[#37352fa6]`}>
      このメールは、TRUSTiFYユーザーを代表してお客様にお送りしています。誤って送信されたと思われる場合は報告してください。
    </p>

    <h3 className={`mb-[8px] flex items-center`}>
      <Image
        height={50}
        width={50}
        alt="logo"
        src="https://pmmazevauhmntblygzcx.supabase.co/storage/v1/object/public/company_logos/Trustify_Logo_icon%20bg-white@0.5x.png"
      />
      <span className={`ml-[3px] mt-[25px] text-[20px] font-[700] text-[#37352f]`}> TRUSTiFYチームより</span>
    </h3>

    <p className={`mt-0 text-[15px] leading-[190%]`}>
      <a href={siteUrl}>TRUSTiFY</a>
      <span className={`text-[#37352fd9]`}>は全ての企業の営業と開発を強化し</span>
      <br />
      <strong className={`text-[#37352f]`}>「最小の資本と人で最大の経済効果を上げる」</strong>
      <span className={`text-[#37352fd9]`}>ためのデータベースです。</span>
    </p>
  </div>
);
