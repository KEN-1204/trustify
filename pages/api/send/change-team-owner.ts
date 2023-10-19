import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";
import jwt from "jsonwebtoken";
import { EmailTemplateChangeTeamOwner } from "@/components/Email/EmailTemplateChangeTeamOwner/EmailTemplateChangeTeamOwner";

const resend = new Resend(process.env.RESEND_API_KEY);

const changeTeamOwnerHandler = async (req: NextApiRequest, res: NextApiResponse) => {
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
    const { email, toUserName, fromUserName, fromEmail, teamName, siteUrl } = req.body;

    console.log("🌟APIルート 招待 email", email);
    console.log("🌟APIルート 招待 toUserName", toUserName);
    console.log("🌟APIルート 招待 fromUserName", fromUserName);
    console.log("🌟APIルート 招待 fromEmail", fromEmail);
    console.log("🌟APIルート 招待 teamName", teamName);
    console.log("🌟APIルート 招待 siteUrl", siteUrl);

    // Ensure email is a string emailが存在し、emailが文字列であることを確認する。
    if (!email || typeof email !== "string") {
      console.log("エラー: Invalid email");
      return res.status(400).json({ error: "Invalid email" });
    }
    // Ensure toUserName is a string toUserNameが存在し、toUserNameが文字列であることを確認する。
    if (!toUserName || typeof toUserName !== "string") {
      console.log("エラー: Invalid handleName");
      return res.status(400).json({ error: "Invalid handleName" });
    }
    // Ensure fromUserName is a string fromUserNameが存在し、fromUserNameが文字列であることを確認する。
    if (!fromUserName || typeof fromUserName !== "string") {
      console.log("エラー: Invalid fromUserName");
      return res.status(400).json({ error: "Invalid fromUserName" });
    }
    // Ensure fromEmail is a string fromEmailが存在し、fromEmailが文字列であることを確認する。
    if (!fromEmail || typeof fromEmail !== "string") {
      console.log("エラー: Invalid fromEmail");
      return res.status(400).json({ error: "Invalid fromEmail" });
    }
    // Ensure teamName is a string teamNameが存在し、teamNameが文字列であることを確認する。
    if (!teamName || typeof teamName !== "string") {
      console.log("エラー: Invalid teamName");
      return res.status(400).json({ error: "Invalid teamName" });
    }
    // Ensure siteUrl is a string siteUrlが存在し、siteUrlが文字列であることを確認する。
    if (!siteUrl || typeof siteUrl !== "string") {
      console.log("エラー: Invalid siteUrl");
      return res.status(400).json({ error: "Invalid siteUrl" });
    }

    // reactのEmailテンプレートが使用できなかった場合のプレーンテキスト
    const plainTextContent = `
${teamName}のチーム所有権を受け入れますか？

こんにちは。

${fromUserName}さん（${fromEmail}）が${teamName}のチーム所有者として、代わりにあなたを任命しました。この任命を受け入れると、以下に同意したものとになされます。

・このチーム、チームメンバー、チームのコンテンツを管理する管理者権限を新たに受け入れます。

・このチームのメンバーが作成し、このチーム内に保存される、既存および今後のコンテンツ全てに対する責任を負います。

・TRUSTiFYの利用規約がこのチームの所有権に適用されることに同意し、プライバシーポリシーを読みました。

任命の有効期限は30日間です。

招待を受ける: ${siteUrl}

---

このメールは、TRUSTiFYアカウントをお持ちのお客様にTRUSTiFYユーザーを代表してお送りしています。これは、マーケティングやプロモーション用のメールではありません。このため、このメールには配信停止のリンクが含まれていません。Canvaのマーケティングメールの配信を停止されている場合でも、このメールが送信されます。誤って送信されたと思われる場合は報告してください。

TRUSTiFYチームより
TRUSTiFYは全ての企業の営業と開発を強化し、「最小の資本と人で最大の経済効果を上げる」ためのデータベースです。
`;

    const data = await resend.emails.send({
      //   from: "TRUSTiFY <team@thetrustify.com>",
      from: `${fromUserName}（TRUSTiFY経由） <team@thetrustify.com>`,
      to: [`${email}`],
      subject: `リマインダー：${fromUserName}さんがあなたに${teamName}のチーム所有権を移行しようとしています`,
      react: EmailTemplateChangeTeamOwner({
        toUserName: toUserName,
        fromUserName: fromUserName,
        fromEmail: fromEmail,
        teamName: teamName,
        siteUrl: siteUrl,
      }),
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

export default changeTeamOwnerHandler;
