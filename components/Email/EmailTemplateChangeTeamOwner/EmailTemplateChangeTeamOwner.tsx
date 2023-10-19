import * as React from "react";

interface EmailTemplateProps {
  toUserName: string;
  fromUserName: string;
  fromEmail: string;
  teamName: string;
  siteUrl: string;
}

export const EmailTemplateChangeTeamOwner: React.FC<Readonly<EmailTemplateProps>> = ({
  toUserName,
  fromUserName,
  fromEmail,
  teamName,
  siteUrl,
}) => (
  <div style={{ width: "100%", height: "auto", padding: "0 30px", maxWidth: "600px", margin: "0 auto" }}>
    <div
      style={{
        width: "100%",
        height: "80px",
        marginTop: "46px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      {/* <img
        height="60"
        width="60"
        alt="logo"
        src="https://pmmazevauhmntblygzcx.supabase.co/storage/v1/object/public/company_logos/Trustify_Logo_icon%20bg-white@0.5x.png"
        style={{ margin: "auto" }}
      /> */}
      <img
        height="80"
        width="80"
        alt="logo"
        src="https://pmmazevauhmntblygzcx.supabase.co/storage/v1/object/public/company_logos/Trustify_Logo_icon_bg-black@0.5.png"
        style={{ margin: "auto" }}
        // className="light-mode-email"
      />
      {/* <img
        height="60"
        alt="logo"
        src="https://pmmazevauhmntblygzcx.supabase.co/storage/v1/object/public/company_logos/Trustify_logo_bg-black-main_last0.5.png"
        style={{ margin: "auto" }}
        className="dark-mode-email"
      /> */}
    </div>

    <h1 style={{ color: "#37352f", fontSize: "28px", marginTop: "30px" }}>
      {teamName}のチーム所有権を受け入れますか？
    </h1>

    <p style={{ color: "#37352f", lineHeight: "150%", fontSize: "17px", marginTop: "30px" }}>こんにちは。</p>

    <p style={{ color: "#37352f", lineHeight: "150%", fontSize: "17px", marginTop: "20px" }}>
      {fromUserName}
      さん（{fromEmail}）が{teamName}
      のチーム所有者として、代わりにあなたを任命しました。この任命を受け入れると、以下に同意したものとになされます。
    </p>

    <div style={{ marginTop: "30px", height: "45px", width: "100%", display: "flex" }}>
      <div style={{ paddingTop: "6px", paddingLeft: "8px", paddingRight: "15px" }}>
        <div style={{ width: "8px", height: "8px", borderRadius: "8px", backgroundColor: "#0d99ff" }}></div>
      </div>

      <div style={{ width: "100%", height: "45px", color: "#37352f", lineHeight: "150%", fontSize: "17px" }}>
        このチーム、チームメンバー、チームのコンテンツを管理する管理者権限を新たに受け入れます。
      </div>
    </div>

    <div style={{ marginTop: "20px", height: "45px", width: "100%", display: "flex" }}>
      <div style={{ paddingTop: "6px", paddingLeft: "8px", paddingRight: "15px" }}>
        <div style={{ width: "8px", height: "8px", borderRadius: "8px", backgroundColor: "#0d99ff" }}></div>
      </div>

      <div style={{ width: "100%", height: "45px", color: "#37352f", lineHeight: "150%", fontSize: "17px" }}>
        このチームのメンバーが作成し、このチーム内に保存される、既存および今後のコンテンツ全てに対する責任を負います。
      </div>
    </div>

    <div style={{ marginTop: "20px", height: "45px", width: "100%", display: "flex" }}>
      <div style={{ paddingTop: "6px", paddingLeft: "8px", paddingRight: "15px" }}>
        <div style={{ width: "8px", height: "8px", borderRadius: "8px", backgroundColor: "#0d99ff" }}></div>
      </div>

      <div style={{ width: "100%", height: "45px", color: "#37352f", lineHeight: "150%", fontSize: "17px" }}>
        TRUSTiFYの利用規約がこのチームの所有権に適用されることに同意し、プライバシーポリシーを読みました。
      </div>
    </div>

    <p style={{ color: "#37352f", lineHeight: "150%", fontSize: "17px", marginTop: "30px", marginBottom: "30px" }}>
      任命の有効期限は30日間です
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
        任命を受ける
      </div>
    </a>

    {/* <br /> */}
    <hr style={{ color: "#37352fa6", marginTop: "65px", marginBottom: "30px" }}></hr>

    <p style={{ color: "#37352fa6", marginBottom: "40px", lineHeight: "150%", fontSize: "14px" }}>
      このメールは、TRUSTiFYアカウントをお持ちのお客様にTRUSTiFYユーザーを代表してお送りしています。これは、マーケティングやプロモーション用のメールではありません。このため、このメールには配信停止のリンクが含まれていません。Canvaのマーケティングメールの配信を停止されている場合でも、このメールが送信されます。誤って送信されたと思われる場合は報告してください。
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
