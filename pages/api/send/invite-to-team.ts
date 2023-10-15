import type { NextApiRequest, NextApiResponse } from "next";
import { EmailTemplateInvitationToTeamForLoggedInUser } from "@/components/Email/EmailTemplateInvitationToTeamForLoggedInUser";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const inviteToTeamHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  // axios.post()メソッドのリクエストボディから変数を取得
  const { email, handleName, siteUrl } = req.body;

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

  // Resendを使ってメールを送信
  try {
    const data = await resend.emails.send({
      from: "TRUSTiFY <team@thetrustify.com>",
      to: [`${email}`],
      subject: `リマインダー：${handleName}さんがあなたをTRUSTiFYのチームに招待しています`,
      react: EmailTemplateInvitationToTeamForLoggedInUser({ handleName: handleName, siteUrl: siteUrl }),
      text: plainTextContent,
    });

    res.status(200).json(data);
  } catch (error) {
    res.status(400).json(error);
  }
};

export default inviteToTeamHandler;
