// OAuth認証(サードパーティプロバイダを使用した認証)で、プロバイダの認証完了後にコールバック、リダイレクトされるURLを
// Supabaseのデフォルトの「https://...supabase.co/auth/v1/callback」のSupabaseサーバーのリダイレクトURLではなく、
// プロバイダ（Google、github）から送られてくる一時的なトークン交換用コードをアクセストークンとリフレッシュトークンに
// 交換してCookieにセットするプロセスを自分自身でカスタムして実装したい場合には、このAPIルートを使用する

import { NextApiHandler } from "next";
// import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

const handler: NextApiHandler = async (req, res) => {
  const { code } = req.query;

  if (code) {
    // const supabase = createPagesServerClient({ req, res });
    const supabase = createServerSupabaseClient({ req, res });
    await supabase.auth.exchangeCodeForSession(String(code));
  }

  res.redirect("/");
  // res.redirect("/222");
};

export default handler;
