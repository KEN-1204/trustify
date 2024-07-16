import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import Stripe from "stripe";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/database.types";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const supabaseServerClient = createServerSupabaseClient<Database>({
    req,
    res,
  });
  try {
    console.log("🔥ポータル リクエスト受信");
    // リクエストからJWT、認証ヘッダーの取り出し
    // const authHeader = req.headers.authorization;
    const authHeader = req.headers["authorization"];

    // console.log("🔥ポータル authHeader Bearerを抜いた値がtokenの値と一緒", authHeader);

    // 認証ヘッダー、Bearerから始まるヘッダーが存在しなければreturn
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization header is missing" });
      // return res.status(401).send("Unauthorized");
    }

    // Bearerとaccess_token(JWT)をsplitしてアクセストークンを取り出し
    const token = authHeader.split(" ")[1];

    // console.log("🔥ポータル token authHeaderのBearerを抜いた値と一緒", token);

    // アクセストークンがsupabaseで発行したものかどうか認証
    // 認証が通れば認証情報をpayloadで返し、payloadの中から'sub'にsupabaseのuser_idが入っているので、
    // これを使ってsupabaseにユーザー情報, stripe_customerの値をSELECTクエリで取得して
    // どのユーザーからのStripeカスタマーポータルへのアクセスかを取得

    // axiosの認証ヘッダーのaccess_tokenとSupabaseのJWT秘密鍵でJWTを検証
    const payload = jwt.verify(token, process.env.SUPABASE_JWT_SECRET!);
    // トークンが有効なら payload にはトークンのペイロードが含まれます。
    // ここでユーザー情報や他のセッション情報を取得することができます。

    console.log("🔥ポータル payload", payload);

    const userId = payload.sub; // 'sub' field usually contains the user id.

    console.log("🔥ポータル userId", userId);

    // =================== axios.getルート ===================
    // // 認証済みのユーザーidでSupabaseからユーザー情報を取得
    // // const { data: user, error } = await supabaseServerClient.from("profiles").select().eq("id", userId).single();
    // // 【rpcバージョン】rpcメソッドでStripeに渡すsubscriptionsテーブルのstripe_customer_idを取得する
    // const { data: userProfile, error } = await supabaseServerClient.rpc("get_user_data", { _user_id: userId }).single();

    // console.log("🔥ポータル supabaseのrpc()で取得したuserProfile", userProfile); // 【rpcバージョン】

    // if (error) {
    //   console.log("❌supabaseのクエリ失敗error", error);
    //   throw error;
    // }

    // // Stripeカスタマーidが存在するかチェック
    // // if (!user.stripe_customer_id) {
    // //   console.log("🔥ポータル user.stripe_customer_idが無しでエラー", user.stripe_customer_id);
    // //   return res.status(406).json({ error: "Not Acceptable" });
    // // }
    // if (!userProfile.stripe_customer_id) {
    //   console.log("🔥ポータル user.stripe_customer_idが無しでエラー", userProfile.stripe_customer_id);
    //   return res.status(406).json({ error: "Not Acceptable" });
    // } // 【rpcバージョン】
    // =================== axios.getルート ===================
    // =================== axios.postルート ここまで ===================
    const { stripeCustomerId } = req.body;
    // =================== axios.postルート ここまで ===================

    // stripeインスタンスを作成
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2022-11-15",
    });

    // console.log("🔥ポータル stripeインスタンス !!stripe", !!stripe, "user.stripe_customer_id", user.stripe_customer_id);
    console.log(
      "🔥ポータル stripeインスタンス !!stripe",
      !!stripe,
      // "Stripeの顧客ID userProfile.stripe_customer_id",
      // userProfile.stripe_customer_id
      "Stripeの顧客ID stripeCustomerId",
      stripeCustomerId
    ); // 【rpcバージョン】

    // カスタマーポータルbillingPortalセッションをcreate
    const session = await stripe.billingPortal.sessions.create({
      // customer: user.stripe_customer_id,
      // customer: userProfile.stripe_customer_id, // axios.getルート【rpcバージョン】
      customer: stripeCustomerId, // axios.postルート
      return_url: `${process.env.CLIENT_URL}/home`, // サーバー側で実行する際にはNEXT_PUBLIC_の接頭辞は不要
    });

    console.log("🔥ポータル stripe.billingPortal.sessions.create()で取得したsession", session);

    console.log("Stripe billingPortalのurlを取得成功🌟");
    // StripeのbillingPortalのurlをクライアントにレスポンス
    return res.status(200).json({
      url: session.url,
    });
  } catch (error) {
    // トークンが無効ならエラーがスローされます。
    return res.status(401).json({ error: (error as Error).message });
  }
};

export default handler;
