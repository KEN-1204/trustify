import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
// @ts-ignore
import { createClient } from "@supabase/supabase-js";

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

const cancelInvitationForUnregisteredUserHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log("🔥cancelInvitationForUnregisteredUserHandlerリクエスト受信");
  try {
    // リクエストからJWT、認証ヘッダーの取り出し
    const authHeader = req.headers.authorization;

    // 認証ヘッダー、Bearerから始まるヘッダーが存在しなければreturn
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("エラー: Authorization header is missing");
      const response = { data: null, error: "Authorization header is missing" };
      return res.status(401).json(response);
    }

    // Bearerとaccess_token(JWT)をsplitしてアクセストークンを取り出し
    const token = authHeader.split(" ")[1];

    // アクセストークンがsupabaseで発行したものかどうか認証
    // JWTを検証
    const payload = jwt.verify(token, process.env.SUPABASE_JWT_SECRET!);

    const userId = payload.sub; // 'sub' field usually contains the user id.

    console.log("🌟未登録ユーザー招待キャンセルステップ1 jwt認証完了");

    // axios.post()メソッドのリクエストボディから変数を取得
    const { deleteUserId, email } = req.body;

    // Ensure deleteUserId is a string deleteUserIdが存在し、deleteUserIdが文字列であることを確認する。
    if (!deleteUserId || typeof deleteUserId !== "string") {
      console.log("エラー: Invalid deleteUserId");
      const response = { data: null, error: "Invalid deleteUserId" };
      return res.status(400).json(response);
    }
    // Ensure email is a string emailが存在し、emailが文字列であることを確認する。
    if (!email || typeof email !== "string") {
      console.log("エラー: Invalid email");
      const response = { data: null, error: "Invalid email" };
      return res.status(400).json(response);
    }

    console.log("🌟未登録ユーザー招待キャンセルステップ1-2 削除対象のidとemailの取得に成功", deleteUserId, email);

    // AuthのUsersからユーザーデータを削除する カスケードデリートになってるので同時にprofilesテーブルも削除される
    const { data: authUser, error: authError } = await supabaseAdminAuthClient.deleteUser(deleteUserId);

    if (authError) {
      console.log("❌🌟未登録ユーザー招待キャンセルステップ2エラー: ", authError);
      const response = { data: null, error: authError };
      return res.status(401).json(response);
    }
    console.log("🌟未登録ユーザー招待キャンセルステップ2 AuthのUsersからユーザーデータ削除完了 authUser", authUser);

    // 認証済みのユーザーidでSupabaseからユーザー情報を取得 Usersのidとprofilesテーブルのidは一緒
    // const { error: deleteUserError } = await supabase.from("profiles").delete().eq("id", deleteUserId);

    // if (deleteUserError) {
    //   console.log(
    //     "❌🌟未登録ユーザー招待キャンセルステップ3エラー: profilesテーブルからユーザーデータ削除失敗",
    //     deleteUserError
    //   );
    //   const response = { data: null, error: deleteUserError };
    //   return res.status(401).json(response);
    // }
    // console.log("🌟未登録ユーザー招待キャンセルステップ3 profilesテーブルからユーザーデータ削除完了");

    console.log("全て完了 200で返す");
    const response = { data: "削除成功", error: null };
    // 成功
    res.status(200).json(response);
  } catch (error) {
    if ((error as Error).name === "JsonWebTokenError") {
      console.log("Invalid token");
      const response = { data: null, error: "Invalid token" };
      res.status(401).json(response);
    } else if ((error as Error).name === "TokenExpiredError") {
      console.log("Token has expired");
      const response = { data: null, error: "Token has expired" };
      res.status(401).json(response);
    } else {
      console.log(`予期せぬエラー: ${(error as Error).message}`);
      const response = { data: null, error: (error as Error).message };
      res.status(500).json(response);
    }
  }
};

export default cancelInvitationForUnregisteredUserHandler;
