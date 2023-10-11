import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
// @ts-ignore
import { createClient } from "@supabase/supabase-js";
import { Profile } from "@/types";

// サーバーサイド用supabaseクライアント
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, // パブリックURL
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // サーバーサイド専用ロールキー
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Access auth admin api
const supabaseAdminAuthClient = supabase.auth.admin;

const inviteHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log("🔥リクエスト受信");
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

    const userId = payload.sub; // 'sub' field usually contains the user id.

    // 認証済みのユーザーidでSupabaseからユーザー情報を取得
    const { data: userData, error: selectError } = await supabase.from("profiles").select().eq("id", userId).single();

    if (selectError) {
      console.log("❌supabaseのクエリ失敗selectError", selectError);
      throw new Error(selectError.message);
    }

    console.log("🌟supabaseからユーザー情報取得してレスポンス", userData);

    // ダイナミックAPIルートを使用して、クエリからemailアドレスを取得
    const { email } = req.query;

    // Ensure email is a string emailが存在し、emailが文字列であることを確認する。
    if (!email || typeof email !== "string") {
      console.log("エラー: Invalid email");
      return res.status(400).json({ error: "Invalid email" });
    }

    // 招待メールを送信
    const { data: inviteData, error } = await supabaseAdminAuthClient.inviteUserByEmail(email, {
      data: {
        handle_name: (userData as Profile).profile_name,
      },
    });

    if (error) {
      console.log(`Error while inviting user by email: ${error.message}`);
      res.status(500).json({ error: `Error while inviting user by email: ${error.message}` });
      return;
    }

    console.log("Successful invitation response:", inviteData);

    // 成功
    res.status(200).json(inviteData);
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
  }
};

export default inviteHandler;
