import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { buffer } from "micro";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/database.types";

// Next.js の API ルートでは、ボディパーサーがデフォルトで有効化されています。
// そのため、上記のコードを正しく動作させるためには、ボディパーサーを無効化する必要があるため、
// ここでは、Next.jsのAPIルートのbodyParserをfalseに変更します。
export const config = { api: { bodyParser: false } };

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const supabase = createServerSupabaseClient<Database>({
      req,
      res,
    });
    console.log("🌟stripe-hooksハンドラーリクエスト受信");
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
      console.log("stripe-hooksハンドラー stripe.webhooks.constructEventエラー❌", error);
      return res.status(400).send(`Webhook error: ${(error as Error).message}`);
    }
    console.log("🌟stripe-hooksハンドラー Stripe Webhook stripeEvent取得成功", stripeEvent);

    //   テーブルトリガーを使ったsupabaseの自動更新ルート
    try {
      // Check event timestamp 過去のWebhookエラー再送リクエストかどうかをチェック
      const eventAge = Math.floor(Date.now() / 1000) - stripeEvent.created;
      if (eventAge > 60 * 60) {
        // Ignore events older than 1 hour 1時間以上前に作成されたevent分なら returnしてend()でリクエスト処理をここで終了
        console.log(`✅Ignoring old event with id ${stripeEvent.id}`);
        return res.status(200).end();
      }

      // 型アサーションでobjectがStripe.Subscription型であることを示して、customerプロパティへのアクセスを可能にする
      const subscription = stripeEvent.data.object as Stripe.Subscription; // ※2

      // サブスクプランを変数に格納
      let _subscription_plan;
      switch (subscription.items.data[0].plan.id) {
        case "price_1NmPoFFTgtnGFAcpw1jRtcQs":
          _subscription_plan = "business_plan";
          break;
        case "price_1NmQAeFTgtnGFAcpFX60R4YY":
          _subscription_plan = "premium_plan";
          break;
        default:
          _subscription_plan = null;
      }

      // Webhookイベント毎に処理 Process the event
      switch (stripeEvent.type) {
        // handle specific stripeEvent types as needed
        // サブスクリプションの新規契約
        // サブスクリプションのアップグレード、ダウングレード
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.pending_update_applied":
          console.log(`🌟${stripeEvent.type}イベント customer`, subscription.customer);
          console.log(`🌟${stripeEvent.type}イベント interval`, subscription.items.data[0].plan.interval);

          // Fetch the latest state of the subscription from Stripe's API
          // Stripe APIから最新のsubscriptionオブジェクトを取得
          const latestSubscription = await stripe.subscriptions.retrieve(subscription.id);
          console.log("🌟StripeAPIから最新のサブスクリプションオブジェクトを取得", latestSubscription);

          // Stripeカスタマーidを使って、supabaseから契約者のidを取得する
          const { data: subscriberProfileData, error: selectProfileError } = await supabase
            .from("profiles")
            .select()
            .match({ stripe_customer_id: subscription.customer })
            .limit(1)
            .single();
          if (selectProfileError) {
            console.log(
              "❌stripe-hooksハンドラー supabaseのselect()メソッドでprofilesテーブル情報取得エラー",
              selectProfileError
            );
            return res.status(500).json({ error: selectProfileError.message });
          }
          // Stripeカスタマーidを使って、Subscriptionsテーブルからサブスクリプションデータがあるかどうかと
          // なければ初回契約(null)、あればsubscription_stageの値で、契約済み(is_subscribed)と解約済み(is_canceled)を取得
          const { data: subscriptionDataDB, error: subscriptionErrorDB } = await supabase
            .from("subscriptions")
            .select()
            .match({ stripe_customer_id: subscription.customer })
            .limit(1)
            .single();
          if (subscriptionErrorDB) {
            console.log(
              "❌stripe-hooksハンドラー supabaseのselect()メソッドでサブスクリプションテーブル情報取得エラー",
              subscriptionErrorDB
            );
            return res.status(500).json({ error: subscriptionErrorDB.message });
          }
          // Insert the Stripe Webhook event into the database
          const { error: insertError } = await supabase.from("stripe_webhook_events").insert([
            {
              // is_subscribed: true,
              accounts_to_create: subscription.items.data[0].quantity,
              subscriber_id: subscriberProfileData?.id,
              stripe_subscription_id: subscription.id, // 今回のstripeのサブスクリプションid
              stripe_customer_id: subscription.customer as string, // stripe_customerと紐付け
              status: subscription.status, // サブスクリプションの現在の状態(active, past_duw, canceledなど)
              interval: subscription.items.data[0].plan.interval,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(), // 課金開始時間
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(), // 課金終了時間
              subscription_plan: _subscription_plan,
              subscription_stage: subscriptionDataDB.subscription_stage ? subscriptionDataDB.subscription_stage : null,
              webhook_id: stripeEvent.id,
              webhook_event_type: stripeEvent.type, // createdかupdated
              webhook_created: new Date(stripeEvent.created * 1000).toISOString(), // Webhookの作成日時 createdとupdatedは別
              interval_count: subscription.items.data[0].plan.interval_count,
              cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
              cancel_at_period_end: subscription.cancel_at_period_end,
              canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
              cancel_comment: subscription.cancellation_details && subscription.cancellation_details.comment,
              cancel_feedback: subscription.cancellation_details && subscription.cancellation_details.feedback,
              cancel_reason: subscription.cancellation_details && subscription.cancellation_details.reason,
              user_role: _subscription_plan === "business_plan" ? "business_user" : "premium_user", // プラン内容によって格納するroleを変更、トリガー関数内でprofilesのUPDATE用に用意
              subscription_id: subscriptionDataDB.id ? subscriptionDataDB.id : null, // subscriptionsテーブルのid
            },
          ]);
          if (insertError) {
            console.log(
              "❌stripe-hooksハンドラー サブスクリプション契約created, updated, pending_update_appliedのINSERTクエリエラー",
              insertError
            );
            return res.status(500).json({ error: insertError.message });
          }
          break;

        // サブスクリプションの解約
        case "customer.subscription.paused":
        case "customer.subscription.deleted":
        case "customer.subscription.pending_update_expired":
          console.log(`🌟${stripeEvent.type}イベント customer`, subscription.customer);
          console.log(`🌟${stripeEvent.type}イベント interval`, subscription.items.data[0].plan.interval);
          if (stripeEvent.data.previous_attributes && "items" in stripeEvent.data.previous_attributes) {
            console.log(
              `🌟${stripeEvent.type}イベント stripeEvent.data.previous_attributes.items`,
              stripeEvent.data.previous_attributes.items
            );
          }
          if (stripeEvent.data.previous_attributes && "plan" in stripeEvent.data.previous_attributes) {
            console.log(
              `🌟${stripeEvent.type}イベント stripeEvent.data.previous_attributes.plan`,
              stripeEvent.data.previous_attributes.plan
            );
          }
          console.log(
            `🌟${stripeEvent.type}イベント subscription.cancellation_details`,
            subscription.cancellation_details
          );
          // Stripeカスタマーidを使って、supabaseから契約者のidを取得する
          const { data: subscriberProfileDataDelete, error: selectProfileErrorD } = await supabase
            .from("profiles")
            .select()
            .match({ stripe_customer_id: subscription.customer })
            .limit(1)
            .single();
          if (selectProfileErrorD) {
            console.log(
              "❌stripe-hooksハンドラー supabaseのselect()メソッドでprofilesテーブル情報取得エラー",
              selectProfileErrorD
            );
            return res.status(500).json({ error: selectProfileErrorD.message });
          }
          // Stripeカスタマーidを使って、Subscriptionsテーブルからサブスクリプションデータがあるかどうかと
          // なければ初回契約(null)、あればsubscription_stageの値で、契約済み(is_subscribed)と解約済み(is_canceled)を取得
          const { data: subscriptionDataDBDelete, error: subscriptionErrorDBD } = await supabase
            .from("subscriptions")
            .select()
            .match({ stripe_customer_id: subscription.customer })
            .limit(1)
            .single();
          if (subscriptionErrorDBD) {
            console.log(
              "❌stripe-hooksハンドラー supabaseのselect()メソッドでサブスクリプションテーブル情報取得エラー",
              subscriptionErrorDBD
            );
            return res.status(500).json({ error: subscriptionErrorDBD.message });
          }
          const { error } = await supabase.from("stripe_webhook_events").insert([
            {
              // is_subscribed: false,
              accounts_to_create: subscription.items.data[0].quantity,
              subscriber_id: subscriberProfileDataDelete?.id,
              stripe_subscription_id: subscription.id, // 今回のstripeのサブスクリプションid
              stripe_customer_id: subscription.customer as string, // stripe_customerと紐付け
              status: subscription.status, // サブスクリプションの現在の状態 canceled
              interval: null,
              current_period_start: null, // 課金開始時間
              current_period_end: null, // 課金終了時間
              subscription_plan: _subscription_plan,
              subscription_stage: subscriptionDataDBDelete.subscription_stage
                ? subscriptionDataDBDelete.subscription_stage
                : null,
              webhook_id: stripeEvent.id,
              webhook_event_type: stripeEvent.type, // createdかupdated
              webhook_created: new Date(stripeEvent.created * 1000).toISOString(), // Webhookの作成日時 createdとupdatedは別
              interval_count: subscription.items.data[0].plan.interval_count
                ? subscription.items.data[0].plan.interval_count
                : null,
              cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
              cancel_at_period_end: subscription.cancel_at_period_end,
              canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
              cancel_comment: subscription.cancellation_details && subscription.cancellation_details.comment,
              cancel_feedback: subscription.cancellation_details && subscription.cancellation_details.feedback,
              cancel_reason: subscription.cancellation_details && subscription.cancellation_details.reason,
              user_role: "free_user", // キャンセルされた場合には、free_userに変更
              subscription_id: subscriptionDataDBDelete.id, // subscriptionsテーブルのid
            },
          ]);

          if (error) {
            console.log(
              "❌stripe-hooksハンドラー サブスクリプション契約が解約、停止、契約期限切れの場合のINSERTクエリエラー",
              error
            );
            return res.status(500).json({ error: error.message });
          }

          break;

        default:
          console.log(`Unhandled event type: ${stripeEvent.type}`);
      }

      // All done! Respond with a 200 status code APIルート処理全て完了
      res.status(200).send({ received: "complete" });
      //   return res.status(400).send(`Unhandled event type: ${stripeEvent.type}`);
    } catch (error) {
      // Error while processing the event
      console.log("❌stripe-hooksハンドラー supabaseのINSERTクエリ失敗", error);
      // Respond with a 500 status code, causing Stripe to retry the webhook
      // 500のステータスコードで応答し、StripeがWebhookを再試行
      return res.status(500).send({ received: "supabase INSERT Failed" });
      //   return res.status(400).send(`Webhook error: ${(error as Error).message}`);
    }

    // res.send({ received: true });
  } else {
    console.log("❌stripe-hooksハンドラーリクエスト受信できず");
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
};

export default handler;

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
