// Stripe 顧客オブジェクトのupdate時に送信するWebhookの受信用

import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { buffer } from "micro";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/database.types";

// Next.js の API ルートでは、ボディパーサーがデフォルトで有効化されています。
// そのため、上記のコードを正しく動作させるためには、ボディパーサーを無効化する必要があるため、
// ここでは、Next.jsのAPIルートのbodyParserをfalseに変更します。
export const config = { api: { bodyParser: false } };

const stripeCustomerHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const supabase = createServerSupabaseClient<Database>({
      req,
      res,
    });
    console.log("🌟stripeCustomerHandler_Webhookステップ1 stripe-hooksハンドラーリクエスト受信");
    // Stripeインスタンス作成
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2022-11-15",
    });

    // StripeのWebhookからのリクエストヘッダーからsignatureを取得
    const signature = req.headers["stripe-signature"];

    // Stripeダッシュボードで有効化したWebhookの署名シークレットを環境変数から取得
    const signingSecret = process.env.STRIPE_SIGNING_SECRET;

    // stripe.webhooks.constructEvent()格納用変数
    let stripeEvent;

    try {
      // StripeのWebhookから送られてくるリクエストボディは、そのままではNode.jsの標準的なリクエストハンドリングでは、
      // 処理できない形式(署名付きのエンコード済みのデータ)であるため、buffer関数を使用して生のバイナリデータに変換
      const rawBody = await buffer(req);
      // その後、rawBody.toString()でバイナリデータを文字列に変換しこれをstripe.webhooks.constructEventメソッドに渡すことで
      // StripeがWebhookで送信した元のリクエストボディの内容を再現し、署名を検証することができる
      stripeEvent = stripe.webhooks.constructEvent(rawBody.toString(), signature!, signingSecret!);
    } catch (error) {
      console.log("❌🌟stripeCustomerHandler stripe.webhooks.constructEventエラー", error);
      return res.status(400).send(`Webhook error: ${(error as Error).message}`);
    }
    console.log("🌟stripeCustomerHandler_Webhookステップ2 署名検証成功 stripeEvent取得成功", stripeEvent);

    // テーブルトリガーを使ったstripe顧客オブジェクトの自動更新ルート
    // 例えば、デフォルトの支払い方法が更新されたら、
    try {
      // Check event timestamp 過去のWebhookエラー再送リクエストかどうかをチェック
      const eventAge = Math.floor(Date.now() / 1000) - stripeEvent.created;
      if (eventAge > 60 * 60) {
        // Ignore events older than 1 hour 1時間以上前に作成されたevent分なら returnしてend()でリクエスト処理をここで終了
        console.log(`✅Ignoring old event with id ${stripeEvent.id}`);
        return res.status(200).end();
      }

      // All done! Respond with a 200 status code APIルート処理全て完了
      console.log("🌟stripeCustomerHandler_Webhookステップ3 全ての処理成功 200で返す");
      res.status(200).send({ received: "complete" });
      //   return res.status(400).send(`Unhandled event type: ${stripeEvent.type}`);
    } catch (error) {
      // Error while processing the event
      console.log("❌🌟stripeCustomerHandler_Webhookエラー ", error);
      // Respond with a 500 status code, causing Stripe to retry the webhook
      // 500のステータスコードで応答し、StripeがWebhookを再試行
      return res.status(500).send({ received: "stripe-customer-handler error" });
      //   return res.status(400).send(`Webhook error: ${(error as Error).message}`);
    }

    // res.send({ received: true });
  } else {
    console.log("❌🌟stripeCustomerHandler リクエスト受信できず");
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
};

export default stripeCustomerHandler;

/** ※1
 microは、非常に小さくて効率的な非同期HTTPサーバーを作成するためのモジュールで、Node.jsのhttpモジュールに基づいています。このライブラリは、非同期関数を使用したHTTPルーティングとミドルウェアの作成を容易にします。

buffer関数は、microライブラリに含まれるユーティリティ関数の1つで、HTTPリクエストボディをバッファとして取得します。バッファは、一般的にはバイナリデータを表現するためのデータ型で、ここではHTTPリクエストボディの生のバイナリデータを表します。

具体的には、buffer(req)はHTTPリクエストオブジェクトを引数に取り、そのリクエストボディをBufferオブジェクトとして返します。これにより、バイナリ形式で送られてきたリクエストボディ（たとえば画像データやファイルデータなど）をそのままの形で扱うことができます。

この場合、StripeのWebhookから送られてくるリクエストボディは、そのままではNode.jsの標準的なリクエストハンドリングでは処理できない形式（署名付きのエンコード済みデータ）であるため、buffer関数を使用して生のバイナリデータとして扱っています。

その後、rawBody.toString()でバイナリデータを文字列に変換し、これをstripe.webhooks.constructEventメソッドに渡しています。これにより、StripeがWebhookで送信した元のリクエストボディの内容を再現し、署名を検証することができます。
 */

/** ※2
  // 型アサーション（Type Assertion）を使用して
  // TypeScriptに対してobjectがStripe.Subscription型であることを伝えて、
  // objectプロパティがcustomerプロパティやitemsプロパティを持つことを明示する
  // これにより、customerプロパティへのアクセスはTypeScriptによって許可されます。

event.data.objectはStripeのWebhookイベントのペイロードを含むオブジェクトで、その形状はイベントのタイプにより異なります。そのため、TypeScriptはobjectの具体的な形状を知らないため、そのプロパティcustomerにアクセスできることを保証できません。
しかし、"customer.subscription.created"イベントの場合、event.data.objectはSubscriptionオブジェクトで、これはcustomerプロパティを持っています。したがって、このプロパティに安全にアクセスするには、TypeScriptに対してobjectがSubscriptionオブジェクトであることを伝える必要があります。これは型アサーション（Type Assertion）を使用して行います。
ここではevent.data.object as Stripe.Subscriptionという形式の型アサーションを使用して、objectがStripe.Subscription型であることを示しています。これにより、customerプロパティへのアクセスはTypeScriptによって許可されます。
 */
