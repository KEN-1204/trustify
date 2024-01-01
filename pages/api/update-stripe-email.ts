import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
// import { supabase } from "@/utils/supabase";
// import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/database.types";
import jwt from "jsonwebtoken";

// サーバーサイド用supabaseクライアント
// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!, // パブリックURL
//   process.env.SUPABASE_SERVICE_ROLE_KEY! // サーバーサイド専用ロールキー
// );

// SettingProfileからemailを変更 => メール変更確認メールが新たなアドレスに届く =>
// => 変更を確定のリンククリック => 自動でログイン => Usersテーブルのemailが更新される =>
// => authスキーマのUsersテーブルの変更を検知して、自作のWebhook:trigger_email_updateトリガーが発火 =>
// => トリガー関数のsend_email_update_notification関数実行でpg_net拡張のhttp_request関数が実行されることで、予め設定したAPIルートのこのエンドポイントにPOSTメソッドでリクエストボディにJSONでidとnew_emailを含めた形でHTTPリクエストが送信される
// => この/update-stripe-emailで受信後、変更されたUsersのidとemailを取り出し、この内容をstripe.customers.update()でstripeに向けてリクエストを送信し、stripeの顧客オブジェクトを新たなemailで更新

const updateStripeCustomerEmailHandler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  console.log("🌟APIルート updateStripeCustomerEmailHandler req.body", req.body);
  if (req.method !== "POST") {
    console.log("❌POSTメソッドで受信できず");
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
  // リクエストのAPI_ROUTE_SECRETの値がカスタムAPIキーの値と一致しなければリターン
  // if (req.query.API_ROUTE_SECRET !== process.env.API_ROUTE_SECRET) {
  //   console.log("❌認証エラー", req.body);
  //   return res.status(401).send({ new_email: null, error: "認証エラー" });
  //   // return res.status(401).send("You are not authorized to call this API");
  // }

  const supabase = createServerSupabaseClient<Database>({
    req,
    res,
  });

  // リクエストからJWT、認証ヘッダーの取り出し
  console.log("🌟メール変更ルートハンドラー APIルートリクエスト取得");
  const authHeader = req.headers.authorization;

  // 認証ヘッダー、Bearerから始まるヘッダーが存在しなければreturn
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("❌エラー: Authorization header is missing");
    return res.status(401).json({ error: "Authorization header is missing" });
  }

  // Bearerとaccess_token(JWT)をsplitしてアクセストークンを取り出し
  const token = authHeader.split(" ")[1];

  // アクセストークンがsupabaseで発行したものかどうか認証
  // JWTを検証
  const payload = jwt.verify(token, process.env.SUPABASE_JWT_SECRET!);

  console.log("🌟メール変更ルートハンドラー jwt.verify認証完了 payload", payload);
  const userId = payload.sub; // 'sub' field usually contains the user id.

  const { profileId, newEmail, stripeCustomerId } = req.body;

  // stripeインスタンスを作成
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2022-11-15",
    // apiVersion: "2023-08-16",
  });

  // リクエストボディからJSONで格納されていたUsersテーブルのidと新しいメールnew_emailを取得
  // const { id, new_email } = req.body;
  // console.log("🔥リクエストボディからidとnew_email取得OK 🔥id,", id, "🔥new_email", new_email);

  console.log(
    "🔥リクエストボディからidとnew_email取得OK 🔥profileId,",
    profileId,
    "🔥newEmail",
    newEmail,
    "🔥stripeCustomerId",
    stripeCustomerId
  );

  // =============== Supabaseのprofilesテーブルのemailを更新 ===============
  let profileData;
  try {
    // const { data, error } = await supabase.from("profiles").select("stripe_customer_id").eq("id", id).single();
    const { data, error } = await supabase
      .from("profiles")
      .update({ email: newEmail })
      .eq("id", profileId)
      .select()
      .single();

    if (error) throw error;

    console.log("🔥profilesテーブルからstripe_customer_idを取得成功 data", data);
    profileData = data;
  } catch (error: any) {
    console.error("❌updateStripeCustomerEmailHandler profilesテーブルからstripe_customer_idの取得失敗", error);
    return res.status(500).send({ new_email: null, error: error });
    // return res.status(500).send("Internal Server Error");
  }
  // =============== Supabaseのprofilesテーブルのemailを更新 ===============

  // =============== 本番ルート ===============
  // Stripeの顧客を新しく作成 email情報をreq.bodyから取り出して設定
  // const customer = await stripe.customers.create({
  //   email: req.body.record.email,
  // });
  // =============== Stripe Customer Email更新ルート ===============
  console.log("🌟🔥newEmail", newEmail);
  // if (profileData && profileData.stripe_customer_id) {
  if (profileId && stripeCustomerId) {
    try {
      // const customer = await stripe.customers.update(profileData.stripe_customer_id, {
      //   email: new_email, // ”supabase_functions"."http_request”関数のリクエストボディに格納したnew_email
      // });
      const customer = await stripe.customers.update(stripeCustomerId, {
        email: newEmail, // ”supabase_functions"."http_request”関数のリクエストボディに格納したnew_email
      });
      console.log("🌟🔥stripe.customers.update実行成功 結果 customer", customer);
    } catch (error: any) {
      console.error("❌updateStripeCustomerEmailHandler Error updating Stripe customer", error);
      return res.status(500).send({ new_email: null, error: error });
      // return res.status(500).send("Internal Server Error");
    }

    console.log("✅Stripe Customer emailの更新無事完了 200で返す", profileData.email);
    const response = { new_email: profileData.email, error: null };
    res.status(200).send(response);
    // res.send({ message: `stripe customer's email updated: ${new_email}` });
  } else {
    console.error(
      "❌updateStripeCustomerEmailHandler profilesテーブルからstripe_customer_idが正常に取得できずリターン"
    );
    return res.status(500).send("Internal Server Error");
  }
  // =============== Stripe Customer Email更新ルート ここまで ===============

  // 新たに顧客となったユーザーのprofileテーブルのstripe_customerカラムの値に
  // stripe顧客のidを設定してStripe登録時にSupabaseも自動的に同期、連携させる
  // await supabase
  //   .from("profiles")
  //   .update({
  //     stripe_customer_id: customer.id,
  //   })
  //   .eq("id", req.body.record.id); // リクエスト中のユーザーidに一致するデータ

  // res.send({ message: `stripe customer created: ${customer.id}` });
  //   res.status(200).json({ name: "KEN" });
};

export default updateStripeCustomerEmailHandler;
