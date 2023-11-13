import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { buffer } from "micro";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/database.types";
import { Subscription, UserProfileCompanySubscription } from "@/types";
import { format } from "date-fns";

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
    console.log("🌟Stripe_Webhookステップ1 stripe-hooksハンドラーリクエスト受信");
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
    // 型アサーションでobjectがStripe.Subscription型であることを示して、customerプロパティへのアクセスを可能にする
    const subscription = stripeEvent.data.object as Stripe.Subscription; // ※2

    const stripeEventCreated = stripeEvent.created;
    const billingCycleAnchor = subscription.billing_cycle_anchor;
    const currentPeriodStart = subscription.current_period_start;
    const currentPeriodEnd = subscription.current_period_end;
    const cancelAt = subscription.cancel_at;
    const canceledAt = subscription.canceled_at;
    console.log("🌟Stripe_Webhookステップ2 署名検証成功 stripeEvent取得成功", stripeEvent);
    console.log(
      "🌟Stripe_Webhookステップ2-1 stripeEvent.created",
      format(new Date(stripeEventCreated * 1000), "yyyy/MM/dd HH:mm:ss")
    );
    console.log(
      "🌟Stripe_Webhookステップ2-1 billing_cycle_anchor",
      format(new Date(billingCycleAnchor * 1000), "yyyy/MM/dd HH:mm:ss")
    );
    console.log(
      "🌟Stripe_Webhookステップ2-2 current_period_start",
      format(new Date(currentPeriodStart * 1000), "yyyy/MM/dd HH:mm:ss")
    );
    console.log(
      "🌟Stripe_Webhookステップ2-3 current_period_end",
      format(new Date(currentPeriodEnd * 1000), "yyyy/MM/dd HH:mm:ss")
    );
    if (!!cancelAt)
      console.log("🌟Stripe_Webhookステップ2-3 cancel_at", format(new Date(cancelAt * 1000), "yyyy/MM/dd HH:mm:ss"));
    if (!!canceledAt)
      console.log(
        "🌟Stripe_Webhookステップ2-3 canceled_at",
        format(new Date(canceledAt * 1000), "yyyy/MM/dd HH:mm:ss")
      );

    //   テーブルトリガーを使ったsupabaseの自動更新ルート
    try {
      // Check event timestamp 過去のWebhookエラー再送リクエストかどうかをチェック
      const eventAge = Math.floor(Date.now() / 1000) - stripeEvent.created;
      if (eventAge > 60 * 60) {
        // Ignore events older than 1 hour 1時間以上前に作成されたevent分なら returnしてend()でリクエスト処理をここで終了
        console.log(`✅Ignoring old event with id ${stripeEvent.id}`);
        return res.status(200).end();
      }

      // ===================== previous_attributesがscheduleのみ場合はリターンする =====================
      // updatedタイプのWebhookの更新内容がサブスクスケジュールの変更だった場合には、stripe_schedulesテーブルの指定のidのみ更新だけしてリターンさせることで後続の処理をさせないことで負担を軽減させる
      const previousAttributes = stripeEvent.data.previous_attributes;
      // previous_attributesのオブジェクトがscheduleのみかどうかを判定する関数
      const isOnlySchedule = (obj: Object | undefined) => {
        if (typeof obj === "undefined") return false;
        const keys = Object.keys(obj);
        return keys.length === 1 && keys[0] === "schedule";
      };
      if (isOnlySchedule(previousAttributes)) {
        /* サブスクにアタッチされてるスケジュールの変更によるサブスクリプションの更新Webhookに関しては、
         * スケジュールはプランと数量のダウンでINSERTでactive、サブスクのダウンの適用タイミングで送られてくる
         * Webhookによってstripe_webhook_eventsテーブルへのINSERTを起点に実行されるトリガー関数によって、
         * subscriptionsテーブルのaccounts_to_create、planが更新され、
         * それに合わせてsubscribed_accountsを減らす数量分削除が完了したタイミングでサブスクにアタッチされてる
         * スケジュールをリリースするため、ダウンルートでの更新はsubscriptionsテーブルのリアルタイムの関数内で
         * スケジュールのリリースとstripe_schedulesテーブルのUPDATEを行えばOK
         * スケジュールのキャンセルに関しては、ダウングレードユーザーが能動的にキャンセルしときの処理で同時に行うため、
         * ここでは、そのままリターンでレスポンスしてOK */
        console.log(
          "🌟✅Ignoring unnecessary Stripe_Webhook ステップ3 サブスクにアタッチされてるスケジュールのreleaseとcreateによるWebhookなのでそのままリターン isOnlySchedule(previousAttributes)",
          isOnlySchedule(previousAttributes)
        );
        return res.status(200).send({ received: "complete" });
        // return res.status(200).end();
      }
      // ================== previous_attributesがscheduleのみ場合はリターンする ここまで ==================

      // ======================== statusがincompleteの場合はリターンする ========================
      const subscriptionStatus = (stripeEvent.data.object as Subscription).status ?? null;
      if (!subscriptionStatus || subscriptionStatus === "incomplete") {
        console.log(
          "🌟✅Ignoring incomplete Stripe_Webhook ステップ3 サブスクリプションがまだincompleteかnullのためリターン subscriptionStatus",
          subscriptionStatus
        );
        return res.status(200).send({ received: "incomplete" });
      }

      // ================== サブスクキャンセルリクエストの場合 次回請求期間終了時にキャンセル ==================
      // previous_attributesがcancellation_detailsのみのupdatedタイプのwebhookの場合はここでレスポンスする
      const subscriptionCancelAtPeriodEnd = (stripeEvent.data.object as Subscription).cancel_at_period_end ?? null;
      const includeCancellationDetails = (obj: Object | undefined) => {
        if (typeof obj === "undefined") return false;
        const keys = Object.keys(obj);
        return keys.includes("cancellation_details");
      };
      if (subscriptionCancelAtPeriodEnd === true) {
        console.log("キャンセルリクエストがtrue");
        const previousAttributes = stripeEvent.data.previous_attributes;
        if (includeCancellationDetails(previousAttributes)) {
          console.log("🌟cancellation_details", (previousAttributes! as any).cancellation_details);
          return res.status(200).send({ received: "previous_attributesがcancellation_detailsのみのためリターン" });
        }
      }
      // ============ サブスクキャンセルリクエストの場合 次回請求期間終了時にキャンセル ここまで ============

      // サブスクプランを変数に格納
      let _subscription_plan;
      switch (subscription.items.data[0].plan.id) {
        case `${process.env.STRIPE_BUSINESS_PLAN_PRICE_ID}`:
          _subscription_plan = "business_plan";
          break;
        case `${process.env.STRIPE_PREMIUM_PLAN_PRICE_ID}`:
          _subscription_plan = "premium_plan";
          break;
        default:
          _subscription_plan = null;
      }

      let currentSubscriptionDBData: UserProfileCompanySubscription | null = null;

      // Webhookイベント毎に処理 Process the event
      switch (stripeEvent.type) {
        // handle specific stripeEvent types as needed
        // サブスクリプションの新規契約
        // サブスクリプションのアップグレード、ダウングレード
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.pending_update_applied":
          console.log(`🌟Stripe_Webhookステップ3 ${stripeEvent.type}イベント customer`, subscription.customer);

          // ============ 🌟deletedタイプwebhookの後のupdatedタイプでprevious_attributesがcancellation_detailsプロパティのみのwebhookの処理 ============
          // previous_attributesのオブジェクトがcancellation_detailsのみかどうかを判定する関数
          const isOnlyCancellationDetails = (obj: Object | undefined) => {
            if (typeof obj === "undefined") return false;
            const keys = Object.keys(obj);
            return keys.length === 1 && keys[0] === "cancellation_details";
          };
          /* deletedタイプwebhookの後のupdatedタイプwebhookはcancellation_detailsしか変更がないので、
          cancel_reasonsテーブルにキャンセル理由をINSERTしてここでレスポンスする */
          if (isOnlyCancellationDetails(previousAttributes)) {
            const insertCancelPayload = {
              _stripe_customer_id: subscription.customer,
              _stripe_subscription_id: subscription.id,
              _stripe_event_id: stripeEvent.id,
              _cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
              _canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
              _comment: subscription.cancellation_details?.comment ?? null,
              _feedback: subscription.cancellation_details?.feedback ?? null,
              _reason: subscription.cancellation_details?.feedback ?? null,
            };
            console.log("insert_cancel_reasons関数実行 payload", insertCancelPayload);
            const { error: insertCancelReason } = await supabase.rpc("insert_cancel_reasons", insertCancelPayload);
            // stripe_webhook_eventsテーブルのwebhookにキャンセル詳細がUPDATEがエラーした場合
            if (insertCancelReason) {
              console.log(
                "❌cancellation_detailsのキャンセル理由をcancel_reasonsテーブルへINSERTエラー",
                previousAttributes
              );
              return res.status(500).send(`insert_cancel_reasons関数 error: ${(insertCancelReason as Error).message}`);
            }
            // 正常にstripe_webhook_eventsテーブルのwebhookにキャンセル詳細がUPDATEできた場合
            console.log("✅キャンセル詳細を更新するのみでリターン", previousAttributes);
            return res.status(200).send({ received: "insert_cancel_reasons FUNCTION complete" });
            // return res.status(200).end();
          }
          // ============ 🌟deletedタイプwebhookの後のupdatedタイプでprevious_attributesがcancellation_detailsプロパティのみのwebhookの処理 ここまで ============

          // ============ 🌟初回契約時の支払い完了後に支払い方法をデフォルトに設定する ============
          /* previous_attributesが「default_payment_method: null」、「status: incomplete」で、
             今回のwebhookが「status: active」、「default_payment_methodがnullでない」場合に
             ユーザーのstripe顧客オブジェクトのinvoice_settingsのdefault_payment_methodに紐付けする */
          if (
            previousAttributes &&
            "default_payment_method" in previousAttributes &&
            "status" in previousAttributes &&
            previousAttributes.default_payment_method === null &&
            previousAttributes.status === "incomplete" &&
            subscription.status === "active" &&
            subscription.default_payment_method !== null
          ) {
            // 顧客オブジェクトの invoice_settings の default_payment_method を更新する
            const subscriptionDefaultPaymentMethodId = subscription.default_payment_method;
            if (subscriptionDefaultPaymentMethodId) {
              try {
                const customer = await stripe.customers.update(subscription.customer as string, {
                  invoice_settings: {
                    default_payment_method: subscriptionDefaultPaymentMethodId as string,
                  },
                });
                console.log(
                  "🌟Stripe_Webhookステップ3-1 サブスクリプションオブジェクトの支払い方法を顧客オブジェクトのinvoice_settingsのdefault_payment_methodのデフォルトに更新 stripe.customers.updateの実行結果 customer",
                  customer
                );
              } catch (e: any) {
                console.log(
                  "❌🌟Stripe_Webhookステップ3-1 サブスクリプション初回契約時の支払い方法をデフォルトにセットする処理でエラー、リターンはせずにそのまま後続の処理を続行 stripe.customers.updateのエラーオブジェクト",
                  e
                );
                // return res.status(400).send(`Webhook e: ${(e as Error).message}`);
              }
            }
          }
          // ============ 初回契約時の支払い完了後に支払い方法をデフォルトに設定する ここまで ============

          // 🌟Fetch the latest state of the subscription from Stripe's API
          // Stripe APIから最新のsubscriptionオブジェクトを取得
          const latestSubscription = await stripe.subscriptions.retrieve(subscription.id);
          console.log(
            "🌟Stripe_Webhookステップ4 StripeAPIから最新のサブスクリプションオブジェクトを取得",
            latestSubscription
          );

          // 🌟Stripeカスタマーidを使って、supabaseから契約者のidを取得する
          // これは契約者IDにセットするために取得している
          // そのため、初回契約以外の更新の場合は不要
          const { data: subscriberProfileData, error: selectProfileError } = await supabase
            .from("profiles")
            .select()
            .match({ stripe_customer_id: subscription.customer })
            .limit(1)
            .single();
          console.log(
            "🌟Stripe_Webhookステップ5 supabaseのprofilesテーブルからプロフィールデータ取得OK subscriberProfileData",
            subscriberProfileData
          );
          if (selectProfileError) {
            console.log(
              "❌stripe-hooksハンドラー 契約ルート supabaseのselect()メソッドでprofilesテーブル情報取得エラー",
              selectProfileError
            );
            return res.status(500).json({ error: selectProfileError.message });
          }
          // ================ 🌟subscriptionsテーブルデータのみ取得パターン
          // Stripeカスタマーidを使って、Subscriptionsテーブルからサブスクリプションデータがあるかどうかと
          // なければ初回契約(null)、あればsubscription_stageの値で、契約済み(is_subscribed)と解約済み(is_canceled)を取得
          // const { data: subscriptionDataDB, error: subscriptionErrorDB } = await supabase
          //   .from("subscriptions")
          //   .select()
          //   .match({ stripe_customer_id: subscription.customer })
          //   .limit(1);
          // if (subscriptionErrorDB) {
          //   console.log(
          //     "❌stripe-hooksハンドラー 契約ルート supabaseのselect()メソッドでサブスクリプションテーブル情報取得エラー",
          //     subscriptionErrorDB
          //   );
          //   return res.status(500).json({ error: subscriptionErrorDB.message });
          // }
          // if (subscriptionDataDB && subscriptionDataDB.length > 0) {
          //   console.log(
          //     "🌟Stripe_Webhookステップ6 supabaseのsubscriptionsテーブルからサブスクデータ取得OK subscriptionDataDB[0]",
          //     subscriptionDataDB[0]
          //   );
          //   currentSubscriptionDBData = subscriptionDataDB[0];
          // } else {
          //   console.log("🙆🥺stripe-hooksハンドラー サブスクリプションデータが存在しない");
          //   currentSubscriptionDBData = null;
          // }
          // ================ subscriptionsテーブルデータのみ取得パターン ここまで
          // ================ 🌟ユーザー全データ取得からDBサブスクデータ取得パターン
          const { data: userCompanySubscriptionDataDB, error: userCompanySubscriptionErrorDB } = await supabase
            .rpc("get_user_data", { _user_id: subscriberProfileData.id })
            .limit(1);
          if (userCompanySubscriptionErrorDB) {
            console.log(
              "❌stripe-hooksハンドラー 契約ルート ユーザー全データ取得エラー",
              userCompanySubscriptionErrorDB
            );
            return res.status(500).json({ error: userCompanySubscriptionErrorDB.message });
          }
          if (userCompanySubscriptionDataDB[0].subscription_id && userCompanySubscriptionDataDB.length > 0) {
            console.log(
              "🌟Stripe_Webhookステップ6 supabaseのsubscriptionsテーブルからサブスクデータ取得OK userCompanySubscriptionDataDB[0]",
              userCompanySubscriptionDataDB[0]
            );
            currentSubscriptionDBData = userCompanySubscriptionDataDB[0];
          } else {
            console.log("🙆🥺stripe-hooksハンドラー サブスクリプションデータが存在しない");
            currentSubscriptionDBData = null;
          }
          // ================ ユーザー全データ取得からDBサブスクデータ取得パターン ここまで
          // 🌟Insert the Stripe Webhook event into the database
          // パターン1
          const insertPayload = {
            // is_subscribed: true,
            accounts_to_create: subscription.items.data[0].quantity,
            subscriber_id: subscriberProfileData?.id ?? null,
            stripe_subscription_id: subscription.id, // 今回のstripeのサブスクリプションid
            stripe_customer_id: subscription.customer as string, // stripe_customerと紐付け
            status: subscription.status, // サブスクリプションの現在の状態(active, past_due, canceledなど)
            subscription_interval: subscription.items.data[0].plan.interval,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(), // 課金開始時間
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(), // 課金終了時間
            subscription_plan: subscription.status === "canceled" ? "free_plan" : _subscription_plan,
            subscription_stage:
              currentSubscriptionDBData && currentSubscriptionDBData.subscription_stage
                ? currentSubscriptionDBData.subscription_stage
                : null,
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
            subscription_id:
              currentSubscriptionDBData && currentSubscriptionDBData.subscription_id
                ? currentSubscriptionDBData.subscription_id
                : null, // subscriptionsテーブルのid
            number_of_active_subscribed_accounts: subscription.items.data[0].quantity,
          };
          console.log("🌟Stripe_Webhookステップ7 stripe_webhook_eventsにINSERT insertに渡す引数", insertPayload);
          const { error: insertError } = await supabase.from("stripe_webhook_events").insert(insertPayload);
          if (insertError) {
            console.log(
              "❌🌟Stripe_Webhookステップ7 サブスクリプション契約created, updated, pending_update_appliedのINSERTクエリエラー",
              insertError
            );
            return res.status(500).json({ error: insertError.message });
          }
          break;

        // 🌟サブスクリプションの解約
        case "customer.subscription.paused":
        case "customer.subscription.deleted":
        case "customer.subscription.pending_update_expired":
          console.log(`🌟Stripe_Webhookステップ3 ${stripeEvent.type}イベント subscription`, subscription);
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
              "❌🌟Stripe_Webhookステップ4 stripe-hooksハンドラー supabaseのselect()メソッドでprofilesテーブル情報取得エラー",
              selectProfileErrorD
            );
            return res.status(500).json({ error: selectProfileErrorD.message });
          }
          console.log(
            `🌟Stripe_Webhookステップ4 解約ルート 契約者idをprofileテーブルから取得 subscriberProfileDataDelete`,
            subscriberProfileDataDelete
          );

          // Stripeカスタマーidを使って、Subscriptionsテーブルからサブスクリプションデータがあるかどうかと
          // なければ初回契約(null)、あればsubscription_stageの値で、契約済み(is_subscribed)と解約済み(is_canceled)を取得
          // ================ subscriptionsテーブルデータのみ取得パターン
          // const { data: subscriptionDataDBDelete, error: subscriptionErrorDBD } = await supabase
          //   .from("subscriptions")
          //   .select()
          //   .match({ stripe_customer_id: subscription.customer })
          //   .limit(1);
          // if (subscriptionErrorDBD) {
          //   console.log(
          //     "❌🌟Stripe_Webhookステップ5 stripe-hooksハンドラー 解約ルート customer.subscription.deletedルート supabaseのselect()メソッドでサブスクリプションテーブル情報取得エラー",
          //     subscriptionErrorDBD
          //   );
          //   return res.status(500).json({ error: subscriptionErrorDBD.message });
          // }
          // if (subscriptionDataDBDelete && subscriptionDataDBDelete.length > 0) {
          //   console.log(
          //     "🙆🌟Stripe_Webhookステップ5 stripe-hooksハンドラー 解約ルート supabaseのsubscriptionsテーブルからサブスクデータ取得OK subscriptionDataDB",
          //     subscriptionDataDBDelete[0]
          //   );
          //   currentSubscriptionDBData = subscriptionDataDBDelete[0];
          // } else {
          //   console.log(
          //     "🙆🥺🌟Stripe_Webhookステップ5 stripe-hooksハンドラー 解約ルート サブスクリプションデータが存在しない, currentSubscriptionDBDataにnullを格納"
          //   );
          //   currentSubscriptionDBData = null;
          // }
          // ================ subscriptionsテーブルデータのみ取得パターン ここまで
          // ================ ユーザー全データ取得からDBサブスクデータ取得パターン
          const { data: userCompanySubscriptionDataDBDelete, error: userCompanySubscriptionErrorDBDelete } =
            await supabase.rpc("get_user_data", { _user_id: subscriberProfileDataDelete.id }).limit(1);
          if (userCompanySubscriptionErrorDBDelete) {
            console.log(
              "❌stripe-hooksハンドラー 解約ルート ユーザー全データ取得エラー",
              userCompanySubscriptionErrorDBDelete
            );
            return res.status(500).json({ error: userCompanySubscriptionErrorDBDelete.message });
          }
          if (
            userCompanySubscriptionDataDBDelete[0].subscription_id &&
            userCompanySubscriptionDataDBDelete.length > 0
          ) {
            console.log(
              "🌟Stripe_Webhookステップ6 supabaseのsubscriptionsテーブルからサブスクデータ取得OK userCompanySubscriptionDataDBDelete[0]",
              userCompanySubscriptionDataDBDelete[0]
            );
            currentSubscriptionDBData = userCompanySubscriptionDataDBDelete[0];
          } else {
            console.log("🙆🥺stripe-hooksハンドラー 解約ルート サブスクリプションデータが存在しない");
            currentSubscriptionDBData = null;
          }
          // ================ ユーザー全データ取得からDBサブスクデータ取得パターン ここまで
          // ======================== 解約ルート stripe_webhook_eventsテーブルにINSERTするpayload
          // Insert the Stripe Webhook event into the database
          // パターン2
          const insertPayloadForDeleteRoute = {
            // is_subscribed: true,
            accounts_to_create: subscription.items.data[0].quantity,
            subscriber_id: subscriberProfileDataDelete?.id ?? null,
            stripe_subscription_id: subscription.id, // 今回のstripeのサブスクリプションid
            stripe_customer_id: subscription.customer as string, // stripe_customerと紐付け
            status: subscription.status, // サブスクリプションの現在の状態(active, past_due, canceledなど)
            subscription_interval: subscription.items.data[0].plan.interval,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(), // 課金開始時間
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(), // 課金終了時間
            subscription_plan: "free_plan",
            subscription_stage:
              currentSubscriptionDBData && currentSubscriptionDBData.subscription_stage
                ? currentSubscriptionDBData.subscription_stage
                : null,
            webhook_id: stripeEvent.id,
            webhook_event_type: stripeEvent.type, // createdかupdated
            webhook_created: new Date(stripeEvent.created * 1000).toISOString(), // Webhookの作成日時 createdとupdatedは別
            interval_count: subscription.items.data[0].plan.interval_count
              ? subscription.items.data[0].plan.interval_count
              : null,
            cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
            cancel_at_period_end: subscription.cancel_at_period_end ?? null, // この属性がtrueならステータスがアクティブであるサブスクが現在の期間の終わりにキャンセルされる予定を表す
            canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
            cancel_comment: subscription.cancellation_details?.comment ?? null,
            cancel_feedback: subscription.cancellation_details?.feedback ?? null,
            cancel_reason: subscription.cancellation_details?.reason ?? null,
            user_role: "free_user", // プラン内容によって格納するroleを変更、トリガー関数内でprofilesのUPDATE用に用意
            subscription_id:
              currentSubscriptionDBData && currentSubscriptionDBData.subscription_id
                ? currentSubscriptionDBData.subscription_id
                : null, // subscriptionsテーブルのid
            number_of_active_subscribed_accounts: subscription.items.data[0].quantity ?? null,
          };
          console.log(
            "🌟Stripe_Webhookステップ6 解約ルート stripe_webhook_eventsにINSERT insertに渡す引数 insertPayloadForDeleteRoute",
            insertPayloadForDeleteRoute
          );
          // ======================== 解約ルート stripe_webhook_eventsテーブルにINSERTするpayload ここまで
          //
          const { error } = await supabase.from("stripe_webhook_events").insert(insertPayloadForDeleteRoute);
          // const { error } = await supabase.from("stripe_webhook_events").insert({
          //   // is_subscribed: false,
          //   accounts_to_create: subscription.items.data[0].quantity,
          //   subscriber_id: subscriberProfileData?.id ?? null,
          //   stripe_subscription_id: subscription.id, // 今回のstripeのサブスクリプションid
          //   stripe_customer_id: subscription.customer as string, // stripe_customerと紐付け
          //   status: subscription.status, // サブスクリプションの現在の状態 canceled
          //   subscription_interval: null,
          //   current_period_start: null, // 課金開始時間
          //   current_period_end: null, // 課金終了時間
          //   subscription_plan: _subscription_plan ?? 'free_plan',
          //   subscription_stage:
          //     currentSubscriptionDBData && currentSubscriptionDBData.subscription_stage
          //       ? currentSubscriptionDBData.subscription_stage
          //       : null,
          //   webhook_id: stripeEvent.id,
          //   webhook_event_type: stripeEvent.type, // createdかupdated
          //   webhook_created: new Date(stripeEvent.created * 1000).toISOString(), // Webhookの作成日時 createdとupdatedは別
          //   interval_count: subscription.items.data[0].plan.interval_count
          //     ? subscription.items.data[0].plan.interval_count
          //     : null,
          //   cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
          //   cancel_at_period_end: subscription.cancel_at_period_end,
          //   canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
          //   cancel_comment: subscription.cancellation_details ? subscription.cancellation_details.comment : null,
          //   cancel_feedback: subscription.cancellation_details ? subscription.cancellation_details.feedback : null,
          //   cancel_reason: subscription.cancellation_details ? subscription.cancellation_details.reason : null,
          //   user_role: "free_user", // キャンセルされた場合には、free_userに変更
          //   subscription_id:
          //     currentSubscriptionDBData && currentSubscriptionDBData.id ? currentSubscriptionDBData.id : null, // subscriptionsテーブルのid
          //   number_of_active_subscribed_accounts: subscription.items.data[0].quantity,
          // });

          if (error) {
            console.log(
              "❌🌟Stripe_Webhookステップ7 stripe-hooksハンドラー サブスクリプション契約が解約、停止、契約期限切れの場合のINSERTクエリエラー",
              error
            );
            return res.status(500).json({ error: error.message });
          }

          break;

        default:
          console.log(`Unhandled event type: ${stripeEvent.type}`);
      }

      // All done! Respond with a 200 status code APIルート処理全て完了
      console.log("🌟Stripe_Webhookステップ8 全ての処理成功 200で返す");
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
