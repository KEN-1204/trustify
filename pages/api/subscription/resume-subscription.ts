import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";
import jwt from "jsonwebtoken";
import { EmailTemplateChangeTeamOwner } from "@/components/Email/EmailTemplateChangeTeamOwner/EmailTemplateChangeTeamOwner";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/database.types";
import Stripe from "stripe";
import { dateJST } from "@/utils/Helpers/dateJST";
import { format } from "date-fns";

const resend = new Resend(process.env.RESEND_API_KEY);

const resumeSubscriptionHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    console.log("❌POSTメソッドで受信できず");
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }

  const supabaseServerClient = createServerSupabaseClient<Database>({
    req,
    res,
  });

  try {
    console.log("🌟Stripeサブスク再開ステップ1 APIルートリクエスト取得");
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
    console.log("🌟Stripeサブスク再開ステップ2 jwt.verify認証完了 payload", payload);
    const userId = payload.sub; // 'sub' field usually contains the user id.

    // axios.post()メソッドのリクエストボディから変数を取得
    const { stripeCustomerId, planId, quantity, companyId, dbSubscriptionId, paymentMethodId } = req.body;

    console.log(
      "🌟Stripeサブスク再開ステップ3 追加するアカウント数とStripe顧客IDをリクエストボディから取得",
      "Stripe顧客ID",
      stripeCustomerId,
      "planId",
      planId,
      "quantity",
      quantity,
      "paymentMethodId",
      paymentMethodId,
      "companyId",
      companyId,
      "supabaseのdbSubscriptionId",
      dbSubscriptionId
    );

    // Ensure stripeCustomerId is a string stripeCustomerIdが文字列であることを確認する。
    if (typeof stripeCustomerId !== "string") {
      res.status(400).json({ error: "Invalid stripeCustomerId" });
      return;
    }
    // Ensure planId is a string planIdが文字列であることを確認する。
    if (typeof planId !== "string") {
      res.status(400).json({ error: "Invalid planId" });
      return;
    }

    // Ensure newQuantity is a number newQuantityが存在し、newQuantityが数値型であることを確認する。
    if (!quantity || typeof quantity !== "number") {
      console.log("エラー: Invalid quantity");
      return res.status(400).json({ error: "Invalid quantity" });
    }

    // Ensure paymentMethodId is a number paymentMethodIdが存在し、paymentMethodIdが数値型であることを確認する。
    if (!paymentMethodId || typeof paymentMethodId !== "string") {
      console.log("エラー: Invalid paymentMethodId");
      return res.status(400).json({ error: "Invalid paymentMethodId" });
    }

    // stripeインスタンスを作成
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2022-11-15",
    });

    // 顧客の以前の支払い方法リストを取得
    // const paymentMethods = await stripe.paymentMethods.list({
    //     customer: stripeCustomerId,
    //     type: 'card'
    // })

    // 新たなサブスクリプションを作成
    const newSubscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [
        {
          price: planId,
          quantity: quantity,
        },
      ],
      default_payment_method: paymentMethodId,
      proration_behavior: "none",
    });
    console.log("🌟Stripeサブスク再開ステップ4 新しいサブスクリプションの作成完了 newSubscription", newSubscription);

    const response = {
      data: newSubscription,
      error: null,
    };

    console.log("🌟Stripeサブスク再開ステップ5 全ての処理完了 200でAPIルートへ返却");

    res.status(200).json(response);
  } catch (error) {
    if ((error as Error).name === "JsonWebTokenError") {
      console.log("❌Invalid token");
      const response = {
        subscriptionItem: null,
        error: "Invalid token",
      };
      res.status(401).json(response);
    } else if ((error as Error).name === "TokenExpiredError") {
      console.log("❌Token has expired");

      const response = {
        subscriptionItem: null,
        error: "Token has expired",
      };
      res.status(401).json(response);
    } else {
      console.log(`❌予期せぬエラー: ${(error as Error).message}`);
      console.log(`❌エラーオブジェクト: ${error as Error}`);

      const response = {
        subscriptionItem: null,
        error: (error as Error).message,
      };
      res.status(401).json(response);
    }
  }
};

export default resumeSubscriptionHandler;
