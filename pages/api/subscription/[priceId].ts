import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
// import { createClient } from "@supabase/supabase-js";
import cookie from "cookie";
import Stripe from "stripe";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/database.types";

// https://egghead.io/lessons/supabase-pass-supabase-session-cookie-to-api-route-to-identify-user

// サーバーサイド用supabaseクライアント
// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!, // パブリックURL
//   process.env.SUPABASE_SERVICE_ROLE_KEY! // サーバーサイド専用ロールキー
// );

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const supabaseServerClient = createServerSupabaseClient<Database>({
    req,
    res,
  });
  try {
    // リクエストからJWT、認証ヘッダーの取り出し
    const authHeader = req.headers.authorization;
    // const authHeader = req.headers["authorization"];

    // 認証ヘッダー、Bearerから始まるヘッダーが存在しなければreturn
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization header is missing" });
      // return res.status(401).send("Unauthorized");
    }

    // Bearerとaccess_token(JWT)をsplitしてアクセストークンを取り出し
    const token = authHeader.split(" ")[1];

    // アクセストークンがsupabaseで発行したものかどうか認証
    // 認証が通れば認証情報をpayloadで返し、payloadの中から'sub'にsupabaseのuser_idが入っているので、
    // これを使ってsupabaseにユーザー情報をSELECTクエリで取得して
    // どのユーザーがstripeにサブスクリプション希望かを識別する

    // JWTを検証
    const payload = jwt.verify(token, process.env.SUPABASE_JWT_SECRET!);
    // トークンが有効なら payload にはトークンのペイロードが含まれます。
    // ここでユーザー情報や他のセッション情報を取得することができます。
    console.log("🌟認証成功 payload", payload);
    const userId = payload.sub; // 'sub' field usually contains the user id.

    // 認証済みのユーザーidでSupabaseからユーザー情報を取得
    const { data: user, error } = await supabaseServerClient.from("profiles").select().eq("id", userId).single();

    console.log("🌟supabaseからユーザー情報取得してレスポンス", user);

    if (error) {
      console.log("❌supabaseのクエリ失敗error", error);
      throw error;
    }

    // stripeインスタンスを作成
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2022-11-15",
    });

    console.log("🌟req.query", req.query);

    const { priceId } = req.query;
    const quantity = Number(req.query.quantity) || 1;
    console.log("🔥quantity", quantity);

    // Ensure priceId is a string priceIdが文字列であることを確認する。
    if (typeof priceId !== "string") {
      res.status(400).json({ error: "Invalid priceId" });
      return;
    }

    const lineItems = [
      {
        price: priceId,
        // quantity: 1,
        quantity: quantity,
      },
    ];

    if (!user.stripe_customer_id) {
      res.status(400).json({ error: "❌stripe_customerをsupabaseから取得できず" });
      return;
    }

    // stripeチェックアウト
    const stripeSession = await stripe.checkout.sessions.create({
      customer: user.stripe_customer_id,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: lineItems,
      // success_url: `${process.env.CLIENT_URL}/payment/success`,
      success_url: `${process.env.CLIENT_URL}/home`,
      //   cancel_url: `${process.env.CLIENT_URL}/payment/cancelled`,
      cancel_url: `${process.env.CLIENT_URL}/home`,
    });
    console.log("🌟Stripeチェックアウト成功", stripeSession);

    // ユーザー情報をクライアントにレスポンス
    res.status(200).json({
      id: stripeSession.id,
    });
  } catch (error) {
    // トークンが無効ならエラーがスローされます。
    res.status(401).json({ error: (error as Error).message });
  }
  //   res.status(200).json({ name: "K" });
};

export default handler;
