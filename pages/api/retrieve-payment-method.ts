import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import jwt from "jsonwebtoken";

// profileテーブルがINSERTされた時にSupabaseのトリガー関数が実行され、リクエストがこのルートハンドラーに送信される
// リクエスト受信後、Stripeのcustomer.create()でStripeダッシュボードにカスタマーを作成し、
// 同時にsupabaseのprofileテーブルの該当ユーザーのstripe_customerの値をUPDATEクエリでStripeダッシュボードのカスタマーidと同期させる
const retrievePaymentMethodHandler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  if (req.method !== "POST") {
    console.log("❌POSTメソッドで受信できず");
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
  try {
    console.log("🌟Stripe支払い方法取得ステップ1 APIルートリクエスト取得");
    // リクエストからJWT、認証ヘッダーの取り出し
    const authHeader = req.headers.authorization;
    // const authHeader = req.headers["authorization"];

    // 認証ヘッダー、Bearerから始まるヘッダーが存在しなければreturn
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization header is missing" });
    }

    // Bearerとaccess_token(JWT)をsplitしてアクセストークンを取り出し
    const token = authHeader.split(" ")[1];

    // アクセストークンがsupabaseで発行したものかどうか認証
    // 認証が通れば認証情報をpayloadで返し、payloadの中から'sub'にsupabaseのuser_idが入っているので、
    // これを使ってsupabaseにユーザー情報をSELECTクエリで取得して
    // どのユーザーがstripeにサブスクリプション希望かを識別する

    // JWTを検証
    const payload = jwt.verify(token, process.env.SUPABASE_JWT_SECRET!);
    console.log("🌟Stripe支払い方法取得ステップ2 jwt.verify認証完了");
    /**
      jwt.verify()メソッドは、トークンの検証に失敗した場合、例外（エラー）をスローします。そのため、成功した場合にはpayloadにデコードされたJWTのペイロードが返されますが、失敗した場合は特定の返り値を返すのではなく、エラーが発生します。

      したがって、トークンの検証が失敗した場合のハンドリングを行いたい場合は、try...catch構文を使用して例外をキャッチする
     */
    // トークンが有効なら payload にはトークンのペイロードが含まれます。
    // ここでユーザー情報や他のセッション情報を取得することができます。

    // axios.post()メソッドのリクエストボディから変数を取得
    const { stripeCustomerId, stripeSubscriptionId } = req.body;

    // Ensure stripeCustomerId is a string stripeCustomerIdが文字列であることを確認する。
    if (typeof stripeCustomerId !== "string") {
      res.status(400).json({ error: "Invalid stripeCustomerId" });
      return;
    }
    // Ensure stripeSubscriptionId is a string stripeSubscriptionIdが文字列であることを確認する。
    if (typeof stripeSubscriptionId !== "string") {
      res.status(400).json({ error: "Invalid stripeSubscriptionId" });
      return;
    }

    console.log("🌟Stripe支払い方法取得ステップ2 req.bodyからstripe顧客IDを取得成功");

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2022-11-15",
    });

    // stripeから顧客オブジェクトを取得してデフォルト支払い方法を取得
    const stripeCustomer = (await stripe.customers.retrieve(stripeCustomerId)) as Stripe.Customer;
    console.log(
      "🌟Stripe支払い方法取得ステップ3 stripe.customers.retrieveでstripeの顧客オブジェクトを取得 stripeCustomer",
      stripeCustomer
    );

    let defaultPaymentMethodId = stripeCustomer.invoice_settings.default_payment_method ?? null;

    // 顧客オブジェクトのinvoice_settingsのdefault_payment_methodがnullだった場合にはsubscriptionオブジェクトからデフォルトの支払い方法を取得する
    if (defaultPaymentMethodId === null) {
      console.log(
        "🌟Stripe支払い方法取得ステップ3-2 顧客オブジェクトにデフォルトの支払い方法が無いため以前契約していたサブスクリプションオブジェクトからデフォルトの支払い方法を取得する defaultPaymentMethod",
        defaultPaymentMethodId
      );
      const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
      console.log("🌟Stripe支払い方法取得ステップ3-3 サブスクリプションオブジェクトを取得 subscription", subscription);

      const subscriptionDefaultPaymentMethod = subscription.default_payment_method;

      defaultPaymentMethodId = subscriptionDefaultPaymentMethod ?? null;

      if (subscriptionDefaultPaymentMethod === null) {
        console.log(
          "🌟Stripe支払い方法取得ステップ3-4 サブスクリプションオブジェクトからデフォルト支払い方法の取得失敗 defaultPaymentMethod",
          defaultPaymentMethodId
        );
      } else {
        console.log(
          "🌟Stripe支払い方法取得ステップ3-4 サブスクリプションオブジェクトからデフォルト支払い方法の取得成功 defaultPaymentMethod",
          defaultPaymentMethodId
        );
      }
    }

    if (defaultPaymentMethodId === null) {
      res.status(400).json({ data: null, error: "デフォルトのお支払い方法の取得に失敗しました" });
      return;
    }

    console.log("🌟Stripe支払い方法取得ステップ4 デフォルトの支払い方法のidを取得成功", defaultPaymentMethodId);

    const defaultPaymentMethod = await stripe.customers.retrievePaymentMethod(
      stripeCustomerId,
      defaultPaymentMethodId as string
    );

    if (!defaultPaymentMethod) {
      console.log(
        "🌟Stripe支払い方法取得ステップ5 stripe.customers.retrievePaymentMethodで取得できず",
        defaultPaymentMethod
      );
      const response = { data: null, error: "デフォルトのお支払い方法の取得に失敗しました" };
      res.status(400).json(response);
      return;
    }

    console.log("🌟Stripe支払い方法取得ステップ5 デフォルトの支払い方法の取得成功 200で返す", defaultPaymentMethod);

    res.status(200).json({ data: defaultPaymentMethod, error: null });
  } catch (error) {
    if ((error as Error).name === "JsonWebTokenError") {
      console.log("Invalid token");
      res.status(401).json({ data: null, error: "Invalid token" });
    } else if ((error as Error).name === "TokenExpiredError") {
      console.log("Token has expired");
      res.status(401).json({ data: null, error: "Token has expired" });
    } else {
      console.log(`stripe data取得失敗 予期せぬエラー: ${(error as Error).message}`);
      console.log(`stripe data取得失敗 予期せぬエラーオブジェクト: `, error);
      res.status(500).json({ data: null, error: (error as Error).message });
    }
  }
};

export default retrievePaymentMethodHandler;
