import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { buffer } from "micro";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/database.types";
import { Subscription, UserProfileCompanySubscription } from "@/types";
import { format } from "date-fns";
import { checkPreviousAttributes } from "@/utils/Helpers/checkPreviousAttributes";
import { includesAllProperties } from "@/utils/Helpers/includesAllProperties";

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

    interface DecreaseAndDowngradePreviousAttributes {
      current_period_end: number;
      current_period_start: number;
      items: any;
      latest_invoice: string;
      plan: Object;
      quantity: number;
    }
    interface ExtendedSubscription extends Stripe.Subscription {
      quantity: number;
      plan: Stripe.Plan;
    }

    // 型アサーションでobjectがStripe.Subscription型であることを示して、customerプロパティへのアクセスを可能にする
    const subscription = stripeEvent.data.object as Stripe.Subscription; // ※2

    const stripeEventCreated = stripeEvent.created;
    const billingCycleAnchor = subscription.billing_cycle_anchor;
    const currentPeriodStart = subscription.current_period_start;
    const currentPeriodEnd = subscription.current_period_end;
    const cancelAt = subscription.cancel_at;
    const canceledAt = subscription.canceled_at;
    console.log(
      "🌟Stripe_Webhookステップ2 stripeEventの作成日時stripeEvent.created",
      format(new Date(stripeEvent.created * 1000), "yyyy年MM月dd日 HH:mm:ss")
    );
    console.log("🌟Stripe_Webhookステップ2 署名検証成功 stripeEvent取得成功", stripeEvent);
    console.log("🌟Stripe_Webhookステップ2-1 subscription.items", subscription.items);
    console.log("🌟Stripe_Webhookステップ2-1 subscription.plan", (subscription as any).plan);
    if (
      "previous_attributes" in stripeEvent.data &&
      typeof stripeEvent.data.previous_attributes !== "undefined" &&
      "plan" in stripeEvent.data.previous_attributes
    ) {
      console.log(
        "🌟Stripe_Webhookステップ2-1 stripeEvent.data.previous_attributes.plan",
        (stripeEvent.data.previous_attributes as DecreaseAndDowngradePreviousAttributes).plan
      );
    }
    if (
      "previous_attributes" in stripeEvent.data &&
      typeof stripeEvent.data.previous_attributes !== "undefined" &&
      "items" in stripeEvent.data.previous_attributes
    ) {
      console.log(
        "🌟Stripe_Webhookステップ2-1 stripeEvent.data.previous_attributes.items",
        (stripeEvent.data.previous_attributes as DecreaseAndDowngradePreviousAttributes).items
      );
    }

    console.log(
      "🌟Stripe_Webhookステップ2-1 stripeEvent.created",
      format(new Date(stripeEventCreated * 1000), "yyyy/MM/dd HH:mm:ss")
    );
    console.log(
      "🌟Stripe_Webhookステップ2-1 subscription.billing_cycle_anchor",
      format(new Date(billingCycleAnchor * 1000), "yyyy/MM/dd HH:mm:ss")
    );
    console.log(
      "🌟Stripe_Webhookステップ2-2 subscription.current_period_start",
      format(new Date(currentPeriodStart * 1000), "yyyy/MM/dd HH:mm:ss")
    );
    console.log(
      "🌟Stripe_Webhookステップ2-3 subscription.current_period_end",
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
      // イベント作成時間が現在から50分以上前なら200でレスポンス
      if (eventAge > 3000) {
        // Ignore events older than 50 minutes 50分以上前に作成されたevent分なら returnしてend()でリクエスト処理をここで終了
        console.log(
          `✅Ignoring old event with id ${stripeEvent.id} 50分以上前に作成されたeventのためリターン`,
          `eventAge: ${eventAge}、${eventAge / 60}分前`
        );
        return res.status(200).end();
      }
      // イベント作成時間が現在から1時間以上前なら200でレスポンス
      // if (eventAge > 60 * 60) {
      //   // Ignore events older than 1 hour 1時間以上前に作成されたevent分なら returnしてend()でリクエスト処理をここで終了
      //   console.log(`✅Ignoring old event with id ${stripeEvent.id} 1時間以上前に作成されたeventのためリターン`);
      //   return res.status(200).end();
      // }

      // ===================== previous_attributesがscheduleのみ場合はリターンする =====================
      // updatedタイプのWebhookの更新内容がサブスクスケジュールの変更だった場合には、stripe_schedulesテーブルの指定のidのみ更新だけしてリターンさせることで後続の処理をさせないことで負担を軽減させる
      // const previousAttributes = stripeEvent.data.previous_attributes;
      // previous_attributesのオブジェクトがscheduleのみかどうかを判定する関数
      const isOnlySchedule = (obj: Object | undefined) => {
        if (typeof obj === "undefined") return false;
        const keys = Object.keys(obj);
        return keys.length === 1 && keys[0] === "schedule";
      };
      if ("previous_attributes" in stripeEvent.data && isOnlySchedule(stripeEvent.data.previous_attributes)) {
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
          "🌟✅Ignoring unnecessary Stripe_Webhook ステップ3 サブスクにアタッチされてるスケジュールのreleaseとcreateによるWebhookなのでそのままリターン isOnlySchedule(stripeEvent.data.previous_attributes)",
          isOnlySchedule(stripeEvent.data.previous_attributes)
        );
        return res.status(200).send({ received: "complete" });
        // return res.status(200).end();
      }
      // ================== previous_attributesがscheduleのみ場合はリターンする ここまで ==================

      // ======================== statusがincompleteの場合はリターンする ========================
      // const subscriptionStatus = subscription.status ?? null;
      if (!subscription.status || subscription.status === "incomplete") {
        console.log(
          "🌟✅Ignoring incomplete Stripe_Webhook ステップ3 サブスクリプションがまだincompleteかnullのためリターン subscription.status",
          subscription.status
        );
        return res.status(200).send({ received: "incomplete" });
      }

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
          console.log(`🌟Stripe_Webhookステップ3 ${stripeEvent.type}イベントルート`);

          // ============== 🌟「数量アップ」ルート ==============
          // 数量ダウンスケジュール有りでプランアップグレードを実行した際のwebhookでそのままトリガー関数を実行させると、削除リクエストを除くアクティブアカウント数を示すnumber_of_active_subscribed_accountsに現在のアカウント数(数量ダウン前)がセットされてしまうため、別途ハンドリングする
          // 受診時にはダウングレードされていないので、subscriptionもprevious_attributesもプランは同じ

          if (
            "previous_attributes" in stripeEvent.data &&
            typeof stripeEvent.data.previous_attributes !== "undefined" &&
            "items" in stripeEvent.data.previous_attributes &&
            "quantity" in stripeEvent.data.previous_attributes &&
            Object.keys(stripeEvent.data.previous_attributes).length === 2 &&
            // subscription.items.data[0].price.id === process.env.STRIPE_PREMIUM_PLAN_PRICE_ID &&
            typeof ((stripeEvent.data.previous_attributes.items as any)?.data[0] as Stripe.SubscriptionItem)
              ?.quantity === "number" &&
            typeof subscription.items.data[0]?.quantity === "number" &&
            ((stripeEvent.data.previous_attributes.items as any).data[0] as Stripe.SubscriptionItem).quantity! <
              subscription.items.data[0].quantity!
          ) {
            console.log("🌟Stripe_Webhookステップ4 🌟「数量アップ」ルート");
            // やること
            // 1. subscriptionsテーブルのaccounts_to_create, number_of_active_subscribed_accountsを新たな数量にUPDATEすること
            const updatePayload = {
              accounts_to_create: subscription.items.data[0].quantity,
              number_of_active_subscribed_accounts: subscription.items.data[0].quantity,
            };
            console.log(
              "🌟Stripe_Webhookステップ4 🌟「数量アップ」ルート subscriptionsテーブルUPDATE実行 payload",
              updatePayload
            );
            const { data, error } = await supabase
              .from("subscriptions")
              .update(updatePayload)
              .eq("stripe_subscription_id", subscription.id)
              .eq("stripe_customer_id", subscription.customer)
              .eq("status", "active");

            if (error) {
              console.log(
                "❌Stripe_Webhookステップ4 🌟「数量アップ」ルート エラー: supabase.update()でsubscriptionsテーブルのプランを変更できず",
                "subscription.id",
                subscription.id,
                "subscription.customer",
                subscription.customer
              );
              return res.status(500).json({
                error:
                  "❌Stripe_Webhookステップ4 🌟「数量アップ」ルート エラー: supabase.update()でsubscriptionsテーブルのプランを変更できず",
              });
            }
            console.log("🔥Stripe_Webhookステップ4 🌟「数量アップ」ルート subscriptionsテーブルUPDATE成功 結果", data);

            console.log(
              "✅Stripe_Webhookステップ4 🌟「数量アップ」ルート 全て完了 200でリターン(subscriptionsテーブルのプラン変更OK)"
            );
            return res.status(200).send({
              received:
                "✅Stripe_Webhookステップ4 🌟「数量アップ」ルート 全て完了 200でリターン(subscriptionsテーブルのプラン変更OK)",
            });
          }
          // ============== ✅「プランダウンスケジュール有りの状態で数量アップ」ルート ==============

          // ============== 🌟「数量ダウンスケジュール有りの状態でプランアップグレード」ルート ==============
          // 数量ダウンスケジュール有りでプランアップグレードを実行した際のwebhookでそのままトリガー関数を実行させると、削除リクエストを除くアクティブアカウント数を示すnumber_of_active_subscribed_accountsに現在のアカウント数(数量ダウン前)がセットされてしまうため、別途ハンドリングする

          if (
            "previous_attributes" in stripeEvent.data &&
            typeof stripeEvent.data.previous_attributes !== "undefined" &&
            "items" in stripeEvent.data.previous_attributes &&
            "plan" in stripeEvent.data.previous_attributes &&
            Object.keys(stripeEvent.data.previous_attributes).length === 2 &&
            (stripeEvent.data.previous_attributes.plan as Stripe.Plan).id ===
              process.env.STRIPE_BUSINESS_PLAN_PRICE_ID &&
            (subscription as ExtendedSubscription).plan.id === process.env.STRIPE_PREMIUM_PLAN_PRICE_ID &&
            ((stripeEvent.data.previous_attributes.items as any).data[0] as Stripe.SubscriptionItem).quantity ===
              (subscription as ExtendedSubscription).items.data[0].quantity
          ) {
            console.log(
              "🌟Stripe_Webhookステップ4 🌟「数量ダウンスケジュール有りの状態か通常のプランアップグレード」ルート subscriptionsテーブルのsubscription_planのみをプレミアムプランにUPDATEする"
            );
            // やること
            // 1. subscriptionsテーブルのsubscription_planのみをプレミアムプランにUPDATEすること
            const updatePayload = { subscription_plan: "premium_plan" };
            console.log(
              "🌟Stripe_Webhookステップ4 🌟「数量ダウンスケジュール有りの状態か通常のプランアップグレード」ルート subscriptionsテーブルUPDATE実行 payload",
              updatePayload
            );
            const { error } = await supabase.from("subscriptions").update(updatePayload).match({
              stripe_subscription_id: subscription.id,
              stripe_customer_id: subscription.customer,
              status: "active",
            });
            if (error) {
              console.log(
                "❌Stripe_Webhookステップ4 🌟「数量ダウンスケジュール有りの状態か通常のプランアップグレード」ルート エラー: supabase.update()でsubscriptionsテーブルのプランを変更できず",
                "subscription.id",
                subscription.id,
                "subscription.customer",
                subscription.customer
              );
              return res.status(500).json({
                error:
                  "❌Stripe_Webhookステップ4 🌟「数量ダウンスケジュール有りの状態か通常のプランアップグレード」ルート エラー: supabase.update()でsubscriptionsテーブルのプランを変更できず",
              });
            }
            console.log(
              "🔥Stripe_Webhookステップ4 🌟「数量ダウンスケジュール有りの状態か通常のプランアップグレード」ルート subscriptionsテーブルUPDATE成功"
            );

            console.log(
              "✅Stripe_Webhookステップ4 🌟「数量ダウンスケジュール有りの状態か通常のプランアップグレード」ルート 全て完了 200でリターン(subscriptionsテーブルのプラン変更OK)"
            );
            return res.status(200).send({
              received:
                "✅Stripe_Webhookステップ4 🌟「数量ダウンスケジュール有りの状態か通常のプランアップグレード」ルート 全て完了 200でリターン(subscriptionsテーブルのプラン変更OK)",
            });
          }
          // ============== ✅「数量ダウンスケジュール有りの状態でプランアップグレード」ルート ==============

          //  🌟「アカウントを減らす」「プランダウングレード」両方スケジュール適用ルート 新たな請求期間へ =======
          // previous_attributesのquantityよりサブスクリプションオブジェクトのquantityの方が少なく、
          // previous_attributesのplan.idがサブスクリプションオブジェクトのplan.idが異なることを確認すれば
          // 間違いなく「アカウントを減らす」「プランダウングレード」両方スケジュールのwebhookとなる
          if (
            "previous_attributes" in stripeEvent.data &&
            includesAllProperties(stripeEvent.data.previous_attributes, [
              "current_period_end",
              "current_period_start",
              "items",
              "latest_invoice",
              "plan",
              "quantity",
            ]) &&
            typeof stripeEvent.data.previous_attributes !== "undefined" &&
            "quantity" in stripeEvent.data.previous_attributes &&
            "plan" in stripeEvent.data.previous_attributes &&
            (stripeEvent.data.previous_attributes as DecreaseAndDowngradePreviousAttributes).quantity >
              (subscription as ExtendedSubscription).quantity &&
            ((stripeEvent.data.previous_attributes as DecreaseAndDowngradePreviousAttributes).plan as Stripe.Plan)
              .id !== (subscription as ExtendedSubscription).plan.id
          ) {
            // やること
            // 「rpc()でsupabaseのアカウント削除、stripe_schedulesテーブルリリース、subscriptionsテーブルの更新」、stripeのスケジュールリリース
            // 1. previous_attributesのquantityからstripeEventオブジェクト内のdataに格納されてるsubscriptionオブジェクトの最新のquantityを差し引いて減らす個数を算出する
            // 1-2. ダウングレード先のbusinness_planを_new_planプロパティにセットする
            // 2. supabaseのsubscribed_accountsテーブルからaccount_stateフィールドがdelete_requestedの値の行データを減らす個数分DELETEする
            // 3. supabaseのstripe_schedulesテーブルのschedule_statusをactiveからreleasedに変更する
            // 4. supabaseのsubscriptionsテーブルのアカウント数、アクティブアカウント数、請求期間の開始日、終了日を更新する
            // 4. stripeのサブスクリプションオブジェクトにアタッチされてるスケジュールオブジェクトをリリースする

            // 2, 3, 4のsupabaseのDB処理はrpcで行い、成功したらstripeのスケジュールをリリースしてここでレスポンスする
            console.log(
              "🌟Stripe_Webhookステップ4 「アカウントを減らす」「プランダウングレード」両方スケジュール適用ルート"
            );
            console.log("💡subscription.schedule", subscription.schedule);
            console.log(
              "💡(subscription as ExtendedSubscription).quantity",
              (subscription as ExtendedSubscription).quantity
            );
            if (!("quantity" in subscription) || typeof subscription.quantity !== "number") {
              console.log(
                "❌Stripe_Webhookステップ4 「アカウントを減らす」「プランダウングレード」両方スケジュール適用ルート  エラー: Invalid subscription.quantity",
                subscription
              );
              return res.status(500).json({
                error:
                  "❌Stripe_Webhookステップ4 「アカウントを減らす」「プランダウングレード」両方スケジュール適用ルート  エラー: Invalid subscription.schedule",
              });
            }
            if (
              !("plan" in subscription) ||
              typeof subscription.plan !== "object" ||
              subscription.plan === null ||
              Array.isArray(subscription.plan)
            ) {
              console.log(
                "❌Stripe_Webhookステップ4 「アカウントを減らす」「プランダウングレード」両方スケジュール適用ルート  エラー: Invalid subscription.plan",
                subscription
              );
              return res.status(500).json({
                error:
                  "❌Stripe_Webhookステップ4 「アカウントを減らす」「プランダウングレード」両方スケジュール適用ルート  エラー: Invalid subscription.plan",
              });
            }

            // 1. 減らす個数を算出
            // interface DecreaseAndDowngradePreviousAttributes {
            //   current_period_end: number;
            //   current_period_start: number;
            //   items: any;
            //   latest_invoice: string;
            //   plan: Object;
            //   quantity: number;
            // }
            const previousQuantity = (stripeEvent.data.previous_attributes as DecreaseAndDowngradePreviousAttributes)
              ?.quantity;
            const newQuantityAfterDecrease = subscription.quantity;
            const decreaseQuantity = previousQuantity - newQuantityAfterDecrease; // 減らす個数
            console.log("💡前回の個数 stripeEvent.data.previous_attributes.quantity", previousQuantity);
            console.log("💡新たな個数 subscription.quantity", newQuantityAfterDecrease);
            console.log("💡減らす個数 decreaseQuantity", decreaseQuantity);

            // 2. supabase subscribed_accountsを減らす個数分削除、stripe_schedulesのスケジュールリリース、subscriptionsテーブルを新たな個数、請求期間に更新
            // rpc: execute_after_decrease_and_downgrade関数に渡す引数
            // ・減らす個数：decreaseQuantity
            // ・stripeのサブスクリプションオブジェクトid：subscription.id => subscriptionsテーブル特定、subscribed_accountsテーブルのsubscription_idで外部結合
            // ・stripeサブスクリプションスケジュールid：subscription.schedule
            const executeAfterDecreaseAndDowngradePayload = {
              _decrease_quantity: decreaseQuantity,
              _stripe_subscription_id: subscription.id,
              _stripe_subscription_schedule_id: subscription.schedule,
              _stripe_customer_id: subscription.customer,
              _new_quantity: newQuantityAfterDecrease,
              _new_plan: "business_plan",
              _current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              _current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            };
            console.log(
              "🌟Stripe_Webhookステップ4 「アカウントを減らす」「プランダウングレード」両方スケジュール適用ルート rpc()execute_after_decrease_and_downgrade関数実行 deleteAccountsAndReleaseSchedulePayload",
              executeAfterDecreaseAndDowngradePayload
            );
            const { error: executeAfterDecreaseAndDowngradeError } = await supabase.rpc(
              "execute_after_decrease_and_downgrade",
              executeAfterDecreaseAndDowngradePayload
            );

            if (executeAfterDecreaseAndDowngradeError) {
              console.log(
                "❌Stripe_Webhookステップ4 「アカウントを減らす」「プランダウングレード」両方スケジュール適用ルート delete_account_and_release_schedule関数実行エラー supabaseのsubscribed_accountsのdelete_requestedのアカウントの削除とstripe_schedulesテーブルのリリース、subscriptionsテーブルの更新に失敗",
                executeAfterDecreaseAndDowngradeError
              );
              return res
                .status(500)
                .send(`insert_cancel_reasons関数 error: ${executeAfterDecreaseAndDowngradeError.message}`);
            }
            console.log(
              "🔥Stripe_Webhookステップ4 「アカウントを減らす」「プランダウングレード」両方スケジュール適用ルート rpc()execute_after_decrease_and_downgrade関数実行 成功🙆"
            );
            // stripeのサブスクリプションスケジュールなし
            if (!subscription.schedule) {
              console.log(
                "✅「アカウントを減らす」「プランダウングレード」両方スケジュール適用ルート サブスクリプションスケジュール無しのため200で返却 subscription.schedule",
                subscription.schedule
              );
              return res.status(200).send({
                received:
                  "✅「アカウントを減らす」「プランダウングレード」両方スケジュール適用ルート サブスクリプションスケジュール無しのため200で返却",
              });
            }
            // stripeのサブスクリプションスケジュールをリリース
            try {
              console.log(
                "🌟Stripe_Webhookステップ4 「アカウントを減らす」「プランダウングレード」両方スケジュール適用ルート stripe.subscriptionSchedules.release()を実行 subscription.schedule",
                subscription.schedule
              );
              const subscriptionSchedule = await stripe.subscriptionSchedules.release(subscription.schedule as string);
              console.log(
                "🔥Stripe_Webhookステップ4 「アカウントを減らす」「プランダウングレード」両方スケジュール適用ルート stripe.subscriptionSchedules.release()成功🙆 subscriptionSchedule",
                subscriptionSchedule
              );
            } catch (e: any) {
              console.log(
                "❌Stripe_Webhookステップ4 「アカウントを減らす」「プランダウングレード」両方スケジュール適用ルート エラー：stripe.subscriptionSchedules.release()失敗 subscription.schedule",
                subscription.schedule,
                "error",
                e
              );
              return res.status(500).send({
                error:
                  "❌Stripe_Webhookステップ4 「アカウントを減らす」「プランダウングレード」両方スケジュール適用ルート エラー：stripe.subscriptionSchedules.release()失敗",
              });
            }

            // supabaseのアカウント削除、stripe_schedulesテーブルリリース、subscriptionsテーブルの更新、stripeのスケジュールリリース全て完了
            console.log(
              "✅「アカウントを減らす」「プランダウングレード」両方スケジュール適用後のwebhook処理全て完了 200でリターン（supabaseのアカウント削除、stripe_schedulesテーブルリリース、subscriptionsテーブルの更新、stripeのサブスクリプションスケジュールリリース"
            );
            return res.status(200).send({
              received:
                "✅「アカウントを減らす」「プランダウングレード」両方スケジュール適用後のwebhook処理全て完了 200でリターン（supabaseのアカウント削除、stripe_schedulesテーブルリリース、subscriptionsテーブルの更新、stripeのサブスクリプションスケジュールリリース",
            });
          }
          //  ✅「アカウントを減らす」「プランダウングレード」両方スケジュール適用ルート 新たな請求期間へ =======
          // ============== 🌟「プランダウングレード」スケジュール適用ルート 新たな請求期間へ ==============
          if (
            // "quantity" in subscription &&
            // typeof subscription.quantity === "number" &&
            "previous_attributes" in stripeEvent.data &&
            includesAllProperties(stripeEvent.data.previous_attributes, [
              "current_period_end",
              "current_period_start",
              "items",
              "latest_invoice",
              "plan",
            ]) &&
            typeof stripeEvent.data.previous_attributes !== "undefined" &&
            "plan" in stripeEvent.data.previous_attributes &&
            "id" in (stripeEvent.data.previous_attributes as DecreaseAndDowngradePreviousAttributes).plan &&
            ((stripeEvent.data.previous_attributes as DecreaseAndDowngradePreviousAttributes).plan as Stripe.Plan)
              .id !== (subscription as ExtendedSubscription).plan.id
          ) {
            // やること
            // 1. previous_attributesのquantityからstripeEventオブジェクト内のdataに格納されてるsubscriptionオブジェクトの最新のquantityを差し引いて減らす個数を算出する
            // 2. supabaseのsubscribed_accountsテーブルからaccount_stateフィールドがdelete_requestedの値の行データを減らす個数分DELETEする
            // 3. supabaseのstripe_schedulesテーブルのschedule_statusをactiveからreleasedに変更する
            // 4. supabaseのsubscriptionsテーブルのアカウント数、アクティブアカウント数、請求期間の開始日、終了日を更新する
            // 4. stripeのサブスクリプションオブジェクトにアタッチされてるスケジュールオブジェクトをリリースする

            // 2, 3, 4のsupabaseのDB処理はrpcで行い、成功したらstripeのスケジュールをリリースしてここでレスポンスする

            if (!subscription.schedule || typeof subscription.schedule !== "string") {
              console.log(
                "❌Stripe_Webhookステップ4 「プランダウングレード」スケジュール適用ルート  エラー: Invalid subscription.schedule",
                subscription
              );
              return res.status(500).json({
                error:
                  "❌Stripe_Webhookステップ4 「プランダウングレード」スケジュール適用ルート  エラー: Invalid subscription.schedule",
              });
            }
            if (
              !("plan" in subscription) ||
              typeof subscription.plan !== "object" ||
              subscription.plan === null ||
              Array.isArray(subscription.plan)
            ) {
              console.log(
                "❌Stripe_Webhookステップ4 「プランダウングレード」スケジュール適用ルート  エラー: Invalid subscription.plan",
                subscription
              );
              return res.status(500).json({
                error:
                  "❌Stripe_Webhookステップ4 「プランダウングレード」スケジュール適用ルート  エラー: Invalid subscription.plan",
              });
            }

            // 1.
            interface DowngradePreviousAttributes {
              current_period_end: number;
              current_period_start: number;
              items: any;
              latest_invoice: string;
              plan: string;
            }
            const previousPlan = (stripeEvent.data.previous_attributes as DowngradePreviousAttributes)?.plan;
            // const newPlanAfterDowngrade = subscription.plan;

            // 2. supabase change_planのstripe_schedulesのスケジュールリリース、subscriptionsテーブルを新たな個数、請求期間に更新
            const releaseScheduleAndUpdateSubscriptionPayload = {
              _stripe_subscription_id: subscription.id,
              _stripe_subscription_schedule_id: subscription.schedule,
              _stripe_customer_id: subscription.customer,
              _current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              _current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              _new_plan: "business_plan",
            };

            console.log(
              "Stripe_Webhookステップ4 「プランダウングレード」スケジュール適用ルート rpc()release_schedule_and_update_subscription関数に渡すpayload",
              releaseScheduleAndUpdateSubscriptionPayload
            );

            const { error: releaseScheduleAndUpdateSubscriptionError } = await supabase.rpc(
              "release_schedule_and_update_subscription",
              releaseScheduleAndUpdateSubscriptionPayload
            );

            if (releaseScheduleAndUpdateSubscriptionError) {
              console.log(
                "❌Stripe_Webhookステップ4 「プランダウングレード」スケジュール適用ルート release_schedule_and_update_subscription関数実行エラー supabaseのとスケジュールのリリース、subscriptionsテーブルの更新に失敗",
                releaseScheduleAndUpdateSubscriptionError
              );
              return res
                .status(500)
                .send(`insert_cancel_reasons関数 error: ${releaseScheduleAndUpdateSubscriptionError.message}`);
            }
            console.log(
              "Stripe_Webhookステップ4 「プランダウングレード」スケジュール適用ルート rpc()release_schedule_and_update_subscription関数実行 成功🙆"
            );
            // stripeのサブスクリプションスケジュールをリリース
            try {
              const subscriptionSchedule = await stripe.subscriptionSchedules.release(subscription.schedule);
              console.log(
                "Stripe_Webhookステップ4 「プランダウングレード」スケジュール適用ルート stripe.subscriptionSchedules.release()成功🙆 subscriptionSchedule",
                subscriptionSchedule
              );
            } catch (e: any) {
              console.log(
                "❌Stripe_Webhookステップ4 「プランダウングレード」スケジュール適用ルート エラー：stripe.subscriptionSchedules.release()失敗 subscription.schedule",
                subscription.schedule
              );
              throw new Error(
                `❌Stripe_Webhookステップ4 「プランダウングレード」スケジュール適用ルート エラー：stripe.subscriptionSchedules.release()失敗`
              );
            }

            // supabaseのアカウント削除、スケジュールリリース、stripeのスケジュールリリース全て完了
            console.log(
              "✅「プランダウングレード」スケジュール適用後のwebhook処理全て完了 200でリターン（supabaseのスケジュールリリース、subscriptionsテーブルの更新、stripeのサブスクリプションスケジュールリリース）"
            );
            return res.status(200).send({
              received:
                "✅「プランダウングレード」スケジュール適用後のwebhook処理全て完了 200でリターン（supabaseのスケジュールリリース、subscriptionsテーブルの更新、stripeのサブスクリプションスケジュールリリース）",
            });
          }
          // ============== ✅「プランダウングレード」スケジュール適用ルート 新たな請求期間へ ==============
          // ============== 🌟「アカウントを減らす」スケジュール適用ルート 新たな請求期間へ ==============
          // 請求期間が更新されアカウントを減らすスケジュールが適用された場合、下記のプロパティが変更されprevious?attributesのオブジェクトに入ってくる
          // 「current_period_start, current_period_end, items, latest_invoice, quantity」
          if (
            // "quantity" in subscription &&
            // typeof subscription.quantity === "number" &&
            "previous_attributes" in stripeEvent.data &&
            includesAllProperties(stripeEvent.data.previous_attributes, [
              "current_period_end",
              "current_period_start",
              "items",
              "latest_invoice",
              "quantity",
            ]) &&
            typeof stripeEvent.data.previous_attributes !== "undefined" &&
            (stripeEvent.data.previous_attributes as DecreaseAndDowngradePreviousAttributes).quantity >
              (subscription as ExtendedSubscription).quantity
          ) {
            // やること
            // 1. previous_attributesのquantityからstripeEventオブジェクト内のdataに格納されてるsubscriptionオブジェクトの最新のquantityを差し引いて減らす個数を算出する
            // 2. supabaseのsubscribed_accountsテーブルからaccount_stateフィールドがdelete_requestedの値の行データを減らす個数分DELETEする
            // 3. supabaseのstripe_schedulesテーブルのschedule_statusをactiveからreleasedに変更する
            // 4. supabaseのsubscriptionsテーブルのアカウント数、アクティブアカウント数、請求期間の開始日、終了日を更新する
            // 4. stripeのサブスクリプションオブジェクトにアタッチされてるスケジュールオブジェクトをリリースする

            // 2, 3, 4のsupabaseのDB処理はrpcで行い、成功したらstripeのスケジュールをリリースしてここでレスポンスする

            if (!subscription.schedule || typeof subscription.schedule !== "string") {
              console.log(
                "❌Stripe_Webhookステップ4 「アカウントを減らす」スケジュール適用ルート  エラー: Invalid subscription.schedule",
                subscription
              );
              return res.status(500).json({
                error:
                  "❌Stripe_Webhookステップ4 「アカウントを減らす」スケジュール適用ルート  エラー: Invalid subscription.schedule",
              });
            }
            if (!("quantity" in subscription) || typeof subscription.quantity !== "number") {
              console.log(
                "❌Stripe_Webhookステップ4 「アカウントを減らす」スケジュール適用ルート  エラー: Invalid subscription.quantity",
                subscription
              );
              return res.status(500).json({
                error:
                  "❌Stripe_Webhookステップ4 「アカウントを減らす」スケジュール適用ルート  エラー: Invalid subscription.schedule",
              });
            }

            // 1. 減らす個数を算出
            interface DecreasePreviousAttributes {
              current_period_end: number;
              current_period_start: number;
              items: any;
              latest_invoice: string;
              quantity: number;
            }
            const previousQuantity = (stripeEvent.data.previous_attributes as DecreasePreviousAttributes)?.quantity;
            const newQuantityAfterDecrease = subscription.quantity;
            const decreaseQuantity = previousQuantity - newQuantityAfterDecrease; // 減らす個数

            // 2. supabase subscribed_accountsを減らす個数分削除、stripe_schedulesのスケジュールリリース、subscriptionsテーブルを新たな個数、請求期間に更新
            // rpc: delete_accounts_and_release_schedule_and_update_subscription関数に渡す引数
            // ・減らす個数：decreaseQuantity
            // ・stripeのサブスクリプションオブジェクトid：subscription.id => subscriptionsテーブル特定、subscribed_accountsテーブルのsubscription_idで外部結合
            // ・stripeサブスクリプションスケジュールid：subscription.schedule
            const deleteAccountsAndReleaseSchedulePayload = {
              _decrease_quantity: decreaseQuantity,
              _stripe_subscription_id: subscription.id,
              _stripe_subscription_schedule_id: subscription.schedule,
              _stripe_customer_id: subscription.customer,
              _new_quantity: newQuantityAfterDecrease,
              _current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              _current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            };
            console.log(
              "Stripe_Webhookステップ4 「アカウントを減らす」スケジュール適用ルート rpc()delete_accounts_and_release_schedule_and_update_subscription関数実行 deleteAccountsAndReleaseSchedulePayload",
              deleteAccountsAndReleaseSchedulePayload
            );
            const { error: deleteAccountAndReleaseScheduleError } = await supabase.rpc(
              "delete_accounts_and_release_schedule_and_update_subscription",
              deleteAccountsAndReleaseSchedulePayload
            );

            if (deleteAccountAndReleaseScheduleError) {
              console.log(
                "❌Stripe_Webhookステップ4 「アカウントを減らす」スケジュール適用ルート delete_account_and_release_schedule関数実行エラー supabaseのsubscribed_accountsのdelete_requestedのアカウントの削除とスケジュールのリリース、subscriptionsテーブルの更新に失敗",
                deleteAccountAndReleaseScheduleError
              );
              return res
                .status(500)
                .send(`insert_cancel_reasons関数 error: ${deleteAccountAndReleaseScheduleError.message}`);
            }
            console.log(
              "Stripe_Webhookステップ4 「アカウントを減らす」スケジュール適用ルート rpc()delete_accounts_and_release_schedule_and_update_subscription関数実行 成功🙆"
            );
            // stripeのサブスクリプションスケジュールをリリース
            try {
              const subscriptionSchedule = await stripe.subscriptionSchedules.release(subscription.schedule);
              console.log(
                "Stripe_Webhookステップ4 「アカウントを減らす」スケジュール適用ルート stripe.subscriptionSchedules.release()成功🙆 subscriptionSchedule",
                subscriptionSchedule
              );
            } catch (e: any) {
              console.log(
                "❌Stripe_Webhookステップ4 「アカウントを減らす」スケジュール適用ルート エラー：stripe.subscriptionSchedules.release()失敗 subscription.schedule",
                subscription.schedule
              );
              throw new Error(
                `❌Stripe_Webhookステップ4 「アカウントを減らす」スケジュール適用ルート エラー：stripe.subscriptionSchedules.release()失敗`
              );
            }

            // supabaseのアカウント削除、スケジュールリリース、stripeのスケジュールリリース全て完了
            console.log(
              "✅「アカウントを減らす」スケジュール適用後のwebhook処理全て完了 200でリターン（supabaseのアカウント削除、スケジュールリリース、subscriptionsテーブルの更新、stripeのサブスクリプションスケジュールリリース）"
            );
            return res.status(200).send({
              received:
                "✅「アカウントを減らす」スケジュール適用後のwebhook処理全て完了 200でリターン（supabaseのアカウント削除、スケジュールリリース、subscriptionsテーブルの更新、stripeのサブスクリプションスケジュールリリース）",
            });
          }
          // ============== ✅「アカウントを減らす」スケジュール適用ルート 新たな請求期間へ ==============

          // ============== 🌟サブスクキャンセルリクエストルート 次回請求期間終了時にキャンセル ==============
          // previous_attributesがcancellation_detailsのみのupdatedタイプのwebhookの場合はここでレスポンスする
          // const subscriptionCancelAtPeriodEnd = subscription.cancel_at_period_end!
          //   ? subscription.cancel_at_period_end
          //   : null;
          // cancellation_detailsをprevious_attributesに含んでいるかどうかをチェックする関数
          const includeCancellationDetails = (obj: Object | undefined) => {
            if (typeof obj === "undefined") return false;
            const keys = Object.keys(obj);
            return keys.includes("cancellation_details");
          };
          // previous_attributesがcancellation_detailsのみかどうかをチェックする関数
          const isOnlyCancellationDetails = (obj: Object | undefined) => {
            if (typeof obj === "undefined") return false;
            const keys = Object.keys(obj);
            return keys.length === 1 && keys[0] === "cancellation_details";
          };
          // 請求期間終了時にキャンセルルートでキャンセルクリックした時には、サブスクリプションオブジェクトの
          // cancel_at_period_end, canceled_at, cancel_at, cancellation_detailsの4つが変更される(updated)
          // なので、1回目のwebhookでsubscriptionsテーブルのcancel_at_period_endをtrueに変更し、
          // 2回目のキャンセル理由を送信クリックで、cancel_reasonsテーブルにINSERTする
          // キャンセル理由送信クリック後のwebhook用(請求期間終了時) 2回目のupdatedタイプwebhook用 cancel_reasonsテーブルにINSERT
          if (
            subscription.cancel_at_period_end === true &&
            "previous_attributes" in stripeEvent.data &&
            isOnlyCancellationDetails(stripeEvent.data.previous_attributes)
          ) {
            console.log(
              `🌟Stripe_Webhookステップ4_${stripeEvent.type} キャンセルリクエストがtrue, キャンセル理由を送信により、cancellation_detailsのみが変更されたため、cancel_reasonsテーブルにキャンセル理由をINSERT`
            );
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
                "❌Stripe_Webhookステップ4 cancellation_detailsのキャンセル理由をcancel_reasonsテーブルへINSERTエラー",
                insertCancelReason
              );
              return res.status(500).send(`insert_cancel_reasons関数 error: ${(insertCancelReason as Error).message}`);
            }
            // 正常にstripe_webhook_eventsテーブルのwebhookにキャンセル詳細がUPDATEできた場合
            console.log(
              "✅キャンセル理由送信 キャンセル詳細を更新するのみ cancel_reasonsテーブルへINSERT完了 200でリターン",
              stripeEvent.data.previous_attributes
            );
            return res.status(200).send({ received: "insert_cancel_reasons FUNCTION complete" });
          }
          // キャンセルクリック後のwebhook用(請求期間終了時) 1回目のupdatedタイプwebhook用 subscriptionsテーブルのcancel_at_period_endをtrueにUPDATE
          if (
            subscription.cancel_at_period_end === true &&
            "previous_attributes" in stripeEvent.data &&
            includeCancellationDetails(stripeEvent.data.previous_attributes)
          ) {
            // キャンセルクリック後のwebhook用(請求期間終了時) 1回目のupdatedタイプwebhook用
            console.log(
              `🌟Stripe_Webhookステップ4_${stripeEvent.type} キャンセルリクエストがtrue、キャンセルクリックによりcancel_at_period_end, canceled_at, cancel_at, cancellation_detailsの4つが変更され、請求期間終了時にキャンセルがリクエストされたためsubscriptionsテーブルのcancel_at_period_endをtrueにUPDATE`,
              (stripeEvent.data.previous_attributes as any).cancellation_details
            );
            const { error: updateError } = await supabase
              .from("subscriptions")
              .update({
                cancel_at_period_end: true,
              })
              .match({
                stripe_subscription_id: subscription.id,
                stripe_customer_id: subscription.customer,
                status: subscription.status,
              });
            if (updateError) {
              console.log(
                "❌Stripe_Webhookステップ4 サブスクキャンセルクリックによるsubscriptionsテーブルのcancel_at_period_endをtrueにUPDATEエラー",
                updateError
              );
              return res
                .status(500)
                .send(`cancel_at_period_endをtrueへUPDATE error: ${(updateError as Error).message}`);
            }
            console.log(
              "✅キャンセルクリック キャンセルリクエストを受信し、subscriptionsテーブルのcancel_at_period_endをtrueに変更完了 200でリターン"
            );
            return res.status(200).send({
              received:
                "請求期間終了後にキャンセルリクエストが申し込まれたためsubscriptionsテーブルのcancel_at_period_endをtrueにUPDATEしてリターン",
            });
          }
          // ============ ✅サブスクキャンセルリクエストルート 次回請求期間終了時にキャンセル ここまで ============

          // ========== 🌟サブスクキャンセルリクエストのキャンセルルート 次回請求期間終了時にキャンセルを取り下げ ==========
          // キャンセル取り下げの場合はprevious_attributesのcancel_at_period_endがtrueで、今回のcancel_at_period_endがfalse、cancel_atがnullになる
          if (
            subscription.cancel_at_period_end === false &&
            "previous_attributes" in stripeEvent.data &&
            !!stripeEvent.data.previous_attributes &&
            "cancel_at_period_end" in stripeEvent.data.previous_attributes &&
            (stripeEvent.data.previous_attributes as any).cancel_at_period_end === true &&
            subscription.cancel_at === null
          ) {
            // キャンセルクリック後のwebhook用(請求期間終了時) 1回目のupdatedタイプwebhook用
            console.log(
              "🌟Stripe_Webhookステップ4 キャンセルリクエストの取り下げ subscriptionsテーブルのcancel_at_period_endをfalseに戻す"
            );
            const { error: updateError } = await supabase
              .from("subscriptions")
              .update({
                cancel_at_period_end: false,
              })
              .match({
                stripe_subscription_id: subscription.id,
                stripe_customer_id: subscription.customer,
                status: subscription.status,
              });
            if (updateError) {
              console.log(
                "❌Stripe_Webhookステップ4 キャンセルリクエストの取り下げによるsubscriptionsテーブルのcancel_at_period_endをfalseへのUPDATEエラー",
                updateError
              );
              return res
                .status(500)
                .send(
                  `❌Stripe_Webhookステップ4 キャンセルリクエストの取り下げによるsubscriptionsテーブルのcancel_at_period_endをfalseへのUPDATEエラー error: ${
                    (updateError as Error).message
                  }`
                );
            }
            console.log(
              "✅キャンセルリクエストの取り下げによるsubscriptionsテーブルのcancel_at_period_endをfalseへのUPDATE完了 200でリターン"
            );
            return res.status(200).send({
              received:
                "✅キャンセルリクエストの取り下げによるsubscriptionsテーブルのcancel_at_period_endをfalseへUPDATEしてリターン",
            });
          }
          // ========== ✅サブスクキャンセルリクエストルート 次回請求期間終了時にキャンセルを取り下げ ==========

          // ======================== 🌟即時サブスクキャンセルルート ========================
          //  deletedタイプwebhookの後のupdatedタイプでprevious_attributesがcancellation_detailsプロパティのみのwebhookの処理
          /* deletedタイプwebhookの後のupdatedタイプwebhookはcancellation_detailsしか変更がないので、
          cancel_reasonsテーブルにキャンセル理由をINSERTしてここでレスポンスする */
          if (
            subscription.status === "canceled" &&
            "previous_attributes" in stripeEvent.data &&
            isOnlyCancellationDetails(stripeEvent.data.previous_attributes)
          ) {
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
                stripeEvent.data.previous_attributes
              );
              return res.status(500).send(`insert_cancel_reasons関数 error: ${(insertCancelReason as Error).message}`);
            }
            // 正常にstripe_webhook_eventsテーブルのwebhookにキャンセル詳細がUPDATEできた場合
            console.log("✅キャンセル詳細を更新するのみでリターン", stripeEvent.data.previous_attributes);
            return res.status(200).send({ received: "insert_cancel_reasons FUNCTION complete" });
            // return res.status(200).end();
          }
          // ======================== ✅即時サブスクキャンセルルート ここまで ========================

          // ============ 🌟初回契約時の支払い完了後に支払い方法をデフォルトに設定する ============
          /* previous_attributesが「default_payment_method: null」、「status: incomplete」で、
             今回のwebhookが「status: active」、「default_payment_methodがnullでない」場合に
             ユーザーのstripe顧客オブジェクトのinvoice_settingsのdefault_payment_methodに紐付けする */
          if (
            "previous_attributes" in stripeEvent.data &&
            !!stripeEvent.data.previous_attributes &&
            "default_payment_method" in stripeEvent.data.previous_attributes &&
            "status" in stripeEvent.data.previous_attributes &&
            stripeEvent.data.previous_attributes.default_payment_method === null &&
            stripeEvent.data.previous_attributes.status === "incomplete" &&
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
          // ============ ✅初回契約時の支払い完了後に支払い方法をデフォルトに設定する ここまで ============

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
              "🌟Stripe_Webhookステップ6 get_user_data関数で全ユーザーデータを取得 サブスクデータも取得OK userCompanySubscriptionDataDB[0]",
              userCompanySubscriptionDataDB[0]
            );
            currentSubscriptionDBData = userCompanySubscriptionDataDB[0];
          } else {
            console.log(
              "🙆🥺stripe-hooksハンドラー サブスクリプションデータを含めたget_user_data関数のユーザー全データが存在しない"
            );
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
            cancel_at_period_end: subscription.cancel_at_period_end!,
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
          // All done! Respond with a 200 status code APIルート処理全て完了
          console.log(`✅Stripe_${stripeEvent.type}タイプ_Webhookステップ8 全ての処理成功 200で返す`);
          return res.status(200).send({
            received: `${stripeEvent.type}タイプ_Webhook stripe_webhook_eventsテーブルにINSERT成功 All complete!`,
          });
          break;

        // 🌟サブスクリプションの解約
        case "customer.subscription.paused":
        case "customer.subscription.deleted":
        case "customer.subscription.pending_update_expired":
          console.log(`🌟Stripe_Webhookステップ3 ${stripeEvent.type}ルート`);
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
              `❌🌟Stripe_Webhookステップ4 ${stripeEvent.type}ルート supabaseのselect()メソッドでprofilesテーブル情報取得エラー`,
              selectProfileErrorD
            );
            return res.status(500).json({ error: selectProfileErrorD.message });
          }
          console.log(
            `🌟Stripe_Webhookステップ4 ${stripeEvent.type}ルート 契約者idをprofileテーブルから取得 subscriberProfileDataDelete`,
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
              `❌stripe-hooksハンドラー ${stripeEvent.type}ルート ユーザー全データ取得エラー`,
              userCompanySubscriptionErrorDBDelete
            );
            return res.status(500).json({ error: userCompanySubscriptionErrorDBDelete.message });
          }
          if (
            userCompanySubscriptionDataDBDelete[0].subscription_id &&
            userCompanySubscriptionDataDBDelete.length > 0
          ) {
            console.log(
              `🌟Stripe_Webhookステップ6 ${stripeEvent.type}ルート get_user_data関数で全ユーザーデータを取得 サブスクデータも取得OK userCompanySubscriptionDataDBDelete[0]`,
              userCompanySubscriptionDataDBDelete[0]
            );
            currentSubscriptionDBData = userCompanySubscriptionDataDBDelete[0];
          } else {
            console.log(
              `🙆🥺stripe-hooksハンドラー ${stripeEvent.type}ルート サブスクリプションデータを含めたget_user_data関数のユーザー全データが存在しない`
            );
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
            cancel_at_period_end: subscription.cancel_at_period_end! ?? null, // この属性がtrueならステータスがアクティブであるサブスクが現在の期間の終わりにキャンセルされる予定を表す
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
            `🌟Stripe_Webhookステップ6 ${stripeEvent.type}ルート stripe_webhook_eventsにINSERT insertに渡す引数 insertPayloadForDeleteRoute`,
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
              `❌🌟Stripe_Webhookステップ7 ${stripeEvent.type}ルート サブスクリプション契約が解約、停止、契約期限切れの場合のINSERTクエリエラー`,
              error
            );
            return res.status(500).json({ error: error.message });
          }
          // All done! Respond with a 200 status code APIルート処理全て完了
          console.log(`✅Stripe_${stripeEvent.type}タイプ_Webhookステップ8 全ての処理成功 200で返す`);
          return res.status(200).send({
            received: `${stripeEvent.type}タイプ_Webhook stripe_webhook_eventsテーブルにINSERT成功 All complete!`,
          });
          break;

        default:
          console.log(`Unhandled event type: ${stripeEvent.type}`);
      }

      // All done! Respond with a 200 status code APIルート処理全て完了
      console.log("✅Stripe_Webhookステップ8 全ての処理成功 200で返す");
      res.status(200).send({ received: "complete" });
      //   return res.status(400).send(`Unhandled event type: ${stripeEvent.type}`);
    } catch (error) {
      // Error while processing the event
      console.log("❌stripe-hooksハンドラー エラー", error);
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
