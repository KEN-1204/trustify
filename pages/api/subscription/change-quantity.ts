import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";
import jwt from "jsonwebtoken";
import { EmailTemplateChangeTeamOwner } from "@/components/Email/EmailTemplateChangeTeamOwner/EmailTemplateChangeTeamOwner";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/database.types";
import Stripe from "stripe";

const resend = new Resend(process.env.RESEND_API_KEY);

const changeTeamOwnerHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    console.log("❌POSTメソッドで受信できず");
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }

  try {
    console.log("🌟Stripeステップ1 APIルートリクエスト取得");
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
    // トークンが有効なら payload にはトークンのペイロードが含まれます。
    // ここでユーザー情報や他のセッション情報を取得することができます。
    console.log("🌟Stripeステップ2 jwt.verify認証完了 payload", payload);
    const userId = payload.sub; // 'sub' field usually contains the user id.

    // axios.post()メソッドのリクエストボディから変数を取得
    const { stripeCustomerId, newQuantity, changeType } = req.body;

    console.log(
      "🌟Stripeステップ3 追加するアカウント数とStripe顧客IDをリクエストボディから取得 newQuantity",
      newQuantity,
      "Stripe顧客ID",
      stripeCustomerId,
      "増やすか減らすかchangeType",
      changeType
    );

    // Ensure stripeCustomerId is a string stripeCustomerIdが文字列であることを確認する。
    if (typeof stripeCustomerId !== "string") {
      res.status(400).json({ error: "Invalid stripeCustomerId" });
      return;
    }

    // Ensure newQuantity is a number newQuantityが存在し、newQuantityが数値型であることを確認する。
    if (!newQuantity || typeof newQuantity !== "number") {
      console.log("エラー: Invalid newQuantity");
      return res.status(400).json({ error: "Invalid newQuantity" });
    }

    // stripeインスタンスを作成
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2022-11-15",
    });

    // Stripe顧客IDからサブスクリプションを取得
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
    });

    console.log("🌟Stripeステップ3-2 Stripeから取得したsubscriptions", subscriptions);

    // サブスクリプションID
    const subscriptionId = subscriptions.data[0].id;
    // 次の請求日を取得
    const nextInvoiceTimestamp = subscriptions.data[0].current_period_end;

    // ユーザーが現在契約しているサブスクリップションアイテムのidを取得
    const subscriptionItemId = subscriptions.data[0].items.data[0].id;

    console.log(
      "🌟Stripeステップ4 Stripeの顧客IDからサブスクアイテムIDを取得",
      subscriptionItemId,
      "次の請求日",
      nextInvoiceTimestamp
    );

    // =========================== 比例配分なしルート ===========================
    // サブスクリプションの数量を増やすルート
    // proration_behavior を none に設定してサブスクリプションの数量を増やし、billing_cycle_anchorの変更は不要
    if (changeType === "increase") {
      const subscriptionItem = await stripe.subscriptionItems.update(subscriptionItemId, {
        quantity: newQuantity,
        proration_behavior: "none",
      });

      console.log("🌟Stripeステップ5 アカウント数量アップルート UPDATE完了 subscriptionItem", subscriptionItem);

      const response = {
        subscriptionItem: subscriptionItem,
        error: null,
      };

      console.log("🌟Stripeステップ6 APIルートへ返却");

      res.status(200).json(response);
    }
    // サブスクリプションの数量を減らすルート
    // 取得した次の請求日をbilling_cycle_anchorとして設定し、サブスクリプションの数量を減少させます。
    // これにより、次の請求日までの間、変更前の数量が請求され、その後の請求からは新しい数量が請求されます。
    else if (changeType === "decrease") {
      const subscriptionItem = await stripe.subscriptionItems.update(subscriptionItemId, {
        quantity: newQuantity,
        proration_behavior: "none",
      });
      // const subscriptionItem = await stripe.subscriptions.update(subscriptionId, {
      //   items: [
      //     {
      //       id: subscriptionItemId,
      //       quantity: newQuantity,
      //       clear_usage: true,
      //     },
      //   ],
      // });
      // const subscriptionItem = await stripe.subscriptions.update(subscriptionId, {
      //   items: [
      //     {
      //       id: subscriptionItemId,
      //       quantity: newQuantity,
      //     },
      //   ],
      //   proration_behavior: "none",
      //   // billing_cycle_anchor: nextInvoiceTimestamp as any,
      // });

      console.log("🌟Stripeステップ5 アカウント数量ダウンルート UPDATE完了 subscriptionItem", subscriptionItem);

      const response = {
        subscriptionItem: subscriptionItem,
        error: null,
      };

      console.log("🌟Stripeステップ6 APIルートへ返却");

      res.status(200).json(response);
    } else {
      console.log("🌟Stripeステップ6 エラー: Invalid changeType");
      return res.status(400).json({ error: "Invalid changeType" });
    }
    // =========================== 比例配分なしルート ここまで ===========================

    // =========================== 比例配分ありルート ===========================
    // const subscriptionItem = await stripe.subscriptionItems.update(subscriptionItemId, {
    //   quantity: newQuantity,
    //   proration_behavior: "none",
    // });

    // console.log("🌟Stripeステップ5 アカウント数量UPDATE完了 subscriptionItem", subscriptionItem);

    // const response = {
    //   subscriptionItem: subscriptionItem,
    //   error: null,
    // };

    // console.log("🌟Stripeステップ6 APIルートへ返却");

    // res.status(200).json(response);
    // =========================== 比例配分ありルート ここまで ===========================
  } catch (error) {
    if ((error as Error).name === "JsonWebTokenError") {
      console.log("Invalid token");
      const response = {
        subscriptionItem: null,
        error: "Invalid token",
      };
      res.status(401).json(response);
      //   res.status(401).json({ error: "Invalid token" });
    } else if ((error as Error).name === "TokenExpiredError") {
      console.log("Token has expired");

      const response = {
        subscriptionItem: null,
        error: "Token has expired",
      };
      res.status(401).json(response);
      //   res.status(401).json({ error: "Token has expired" });
    } else {
      console.log(`予期せぬエラー: ${(error as Error).message}`);

      const response = {
        subscriptionItem: null,
        error: (error as Error).message,
      };
      res.status(401).json(response);
      //   res.status(500).json({ error: (error as Error).message });
    }
    // res.status(400).json(error);
  }
};

export default changeTeamOwnerHandler;
