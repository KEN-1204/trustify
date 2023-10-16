import type { NextApiRequest, NextApiResponse } from "next";
import { EmailTemplateInvitationToTeamForLoggedInUser } from "@/components/Email/EmailTemplateInvitationToTeamForLoggedInUser";
import { Resend } from "resend";
import jwt from "jsonwebtoken";

const resend = new Resend(process.env.RESEND_API_KEY);

const inviteToTeamHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    console.log("❌POSTメソッドで受信できず");
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }

  // Resendを使ってメールを送信
  try {
    // リクエストからJWT、認証ヘッダーの取り出し
    const authHeader = req.headers.authorization;

    // 認証ヘッダー、Bearerから始まるヘッダーが存在しなければreturn
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("エラー: Authorization header is missing");
      return res.status(401).json({ error: "Authorization header is missing" });
    }

    // Bearerとaccess_token(JWT)をsplitしてアクセストークンを取り出し
    const token = authHeader.split(" ")[1];

    // アクセストークンがsupabaseで発行したものかどうか認証
    // JWTを検証
    const payload = jwt.verify(token, process.env.SUPABASE_JWT_SECRET!);
    //   const userId = payload.sub; // 'sub' field usually contains the user id.

    console.log("🌟jwt.verify認証完了 payload", payload);

    // axios.post()メソッドのリクエストボディから変数を取得
    const { email, handleName, siteUrl } = req.body;

    console.log("🌟APIルート 招待 email", email);
    console.log("🌟APIルート 招待 handleName", handleName);
    console.log("🌟APIルート 招待 siteUrl", siteUrl);

    // Ensure email is a string emailが存在し、emailが文字列であることを確認する。
    if (!email || typeof email !== "string") {
      console.log("エラー: Invalid email");
      return res.status(400).json({ error: "Invalid email" });
    }
    // Ensure handleName is a string handleNameが存在し、handleNameが文字列であることを確認する。
    if (!handleName || typeof handleName !== "string") {
      console.log("エラー: Invalid handleName");
      return res.status(400).json({ error: "Invalid handleName" });
    }
    // Ensure siteUrl is a string siteUrlが存在し、siteUrlが文字列であることを確認する。
    if (!siteUrl || typeof siteUrl !== "string") {
      console.log("エラー: Invalid siteUrl");
      return res.status(400).json({ error: "Invalid siteUrl" });
    }

    // reactのEmailテンプレートが使用できなかった場合のプレーンテキスト
    const plainTextContent = `
${handleName}さんは、あなたがTRUSTiFYのチームに参加するのを待っています

こんにちは。

${handleName}さんがあなたをメンバーとしてTRUSTiFYのチームに参加するよう招待しています。招待を受け入れて、チームに参加しましょう。

招待を受ける: ${siteUrl}

---

このメールは、TRUSTiFYユーザーを代表してお客様にお送りしています。誤って送信されたと思われる場合は報告してください。

TRUSTiFYチームより
TRUSTiFYは全ての企業の営業と開発を強化し、「最小の資本と人で最大の経済効果を上げる」ためのデータベースです。
`;

    const data = await resend.emails.send({
      //   from: "TRUSTiFY <team@thetrustify.com>",
      from: `${handleName}（TRUSTiFY経由） <team@thetrustify.com>`,
      to: [`${email}`],
      subject: `リマインダー：${handleName}さんがあなたをTRUSTiFYのチームに招待しています`,
      react: EmailTemplateInvitationToTeamForLoggedInUser({ handleName: handleName, siteUrl: siteUrl }),
      text: plainTextContent,
    });

    console.log("🌟resend送信完了 data", data);

    res.status(200).json(data);
  } catch (error) {
    if ((error as Error).name === "JsonWebTokenError") {
      console.log("Invalid token");
      res.status(401).json({ error: "Invalid token" });
    } else if ((error as Error).name === "TokenExpiredError") {
      console.log("Token has expired");
      res.status(401).json({ error: "Token has expired" });
    } else {
      console.log(`予期せぬエラー: ${(error as Error).message}`);
      res.status(500).json({ error: (error as Error).message });
    }
    // res.status(400).json(error);
  }
};

export default inviteToTeamHandler;
