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
  <div style={{ width: "100%", height: "auto", padding: "0 30px", maxWidth: "600px", margin: "0 auto" }}>
    <div
      style={{
        width: "100%",
        height: "60px",
        marginTop: "46px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <img
        height="60"
        width="60"
        alt="logo"
        src="https://pmmazevauhmntblygzcx.supabase.co/storage/v1/object/public/company_logos/Trustify_Logo_icon%20bg-white@0.5x.png"
        style={{ margin: "auto" }}
      />
    </div>

    <h1 style={{ color: "#37352f", fontSize: "28px", marginTop: "30px" }}>
      {handleName}さんは、あなたがTRUSTiFYのチームに参加するのを待っています
    </h1>

    <p style={{ color: "#37352f", lineHeight: "150%", fontSize: "17px", marginTop: "30px" }}>こんにちは。</p>

    <p style={{ color: "#37352f", lineHeight: "150%", fontSize: "17px", marginTop: "20px", marginBottom: "30px" }}>
      {handleName}
      さんがあなたをメンバーとしてTRUSTiFYのチームに参加するよう招待しています。招待を受け入れて、チームに参加しましょう。
    </p>
    <a href={siteUrl} style={{ textDecoration: "none" }}>
      <div
        style={{
          cursor: "pointer",
          backgroundColor: "#0d99ff",
          color: "#ffffff",
          fontSize: "18px",
          fontWeight: 700,
          borderRadius: "8px",
          padding: "16px 20px",
          display: "inline-block",
          lineHeight: 1,
        }}
      >
        招待を受ける
      </div>
    </a>

    {/* <br /> */}
    <hr style={{ color: "#37352fa6", marginTop: "65px", marginBottom: "30px" }}></hr>

    <p style={{ color: "#37352fa6", marginBottom: "40px", lineHeight: "150%", fontSize: "14px" }}>
      このメールは、TRUSTiFYユーザーを代表してお客様にお送りしています。誤って送信されたと思われる場合は報告してください。
    </p>

    <h3 style={{ marginBottom: "8px", display: "flex", alignItems: "center" }}>
      <img
        height="50"
        width="50"
        alt="logo"
        src="https://pmmazevauhmntblygzcx.supabase.co/storage/v1/object/public/company_logos/Trustify_Logo_icon%20bg-white@0.5x.png"
      />
      <span style={{ fontWeight: 700, fontSize: "20px", marginLeft: "3px", marginTop: "25px", color: "#37352f" }}>
        {" "}
        TRUSTiFYチームより
      </span>
    </h3>

    {/* <p className={`mt-0 text-[15px] leading-[190%]`}> */}
    <p style={{ lineHeight: "190%", marginTop: "0", fontSize: "15px" }}>
      <a href={siteUrl}>TRUSTiFY</a>
      <span style={{ color: "#37352fd9" }}>は全ての企業の営業と開発を強化し</span>
      <br />
      <strong style={{ color: "#37352f" }}>「最小の資本と人で最大の経済効果を上げる」</strong>
      <span style={{ color: "#37352fd9" }}>ためのデータベースです。</span>
    </p>
  </div>
);
