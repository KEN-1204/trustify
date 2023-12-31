import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
// import { supabase } from "@/utils/supabase";
// import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/database.types";

// サーバーサイド用supabaseクライアント
// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!, // パブリックURL
//   process.env.SUPABASE_SERVICE_ROLE_KEY! // サーバーサイド専用ロールキー
// );

// profileテーブルがINSERTされた時にSupabaseのトリガー関数が実行され、リクエストがこのルートハンドラーに送信される
// リクエスト受信後、Stripeのcustomer.create()でStripeダッシュボードにカスタマーを作成し、
// 同時にsupabaseのprofileテーブルの該当ユーザーのstripe_customerの値をUPDATEクエリでStripeダッシュボードのカスタマーidと同期させる
const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  const supabase = createServerSupabaseClient<Database>({
    req,
    res,
  });
  console.log("🌟APIルート create-stripe-customer req.body", req.body);
  // リクエストのAPI_ROUTE_SECRETの値がカスタムAPIキーの値と一致しなければリターン
  if (req.query.API_ROUTE_SECRET !== process.env.API_ROUTE_SECRET) {
    return res.status(401).send("You are not authorized to call this API");
  }

  // stripeインスタンスを作成
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2022-11-15",
    // apiVersion: "2023-08-16",
  });

  // =============== 本番ルート ===============
  // Stripeの顧客を新しく作成 email情報をreq.bodyから取り出して設定
  // const customer = await stripe.customers.create({
  //   email: req.body.record.email,
  // });
  // =============== テストクロック顧客オブジェクトルート ===============
  console.log("🌟🔥stripe.customers.create テストクロックで作成 ");
  console.log("🌟🔥email", req.body.record.email);
  const customer = await stripe.customers.create({
    email: req.body.record.email,
    test_clock: `clock_1OTR93FTgtnGFAcpKUhxVRMF`,
  });
  console.log("🌟🔥結果 customer", customer);
  // =============== テストクロック顧客オブジェクトルート ここまで ===============

  // 新たに顧客となったユーザーのprofileテーブルのstripe_customerカラムの値に
  // stripe顧客のidを設定してStripe登録時にSupabaseも自動的に同期、連携させる
  await supabase
    .from("profiles")
    .update({
      stripe_customer_id: customer.id,
    })
    .eq("id", req.body.record.id); // リクエスト中のユーザーidに一致するデータ

  res.send({ message: `stripe customer created: ${customer.id}` });
  //   res.status(200).json({ name: "KEN" });
};

export default handler;
