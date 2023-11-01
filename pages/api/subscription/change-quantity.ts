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

  const supabaseServerClient = createServerSupabaseClient<Database>({
    req,
    res,
  });

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
    const { stripeCustomerId, newQuantity, changeType, companyId, subscriptionId, userProfileId } = req.body;

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
    const stripeSubscriptionId = subscriptions.data[0].id;
    // 次の請求日を取得
    const nextInvoiceTimestamp = subscriptions.data[0].current_period_end;
    // ユーザーが現在契約しているサブスクリップションアイテムのidを取得
    const subscriptionItemId = subscriptions.data[0].items.data[0].id;
    // ユーザーが現在契約しているサブスクリップションの価格idを取得
    const subscriptionCurrentPriceId = subscriptions.data[0].items.data[0].price.id;
    // ユーザーが現在契約しているサブスクリップションのプランの価格を取得
    const subscriptionCurrentPriceUnitAmount = subscriptions.data[0].items.data[0].price.unit_amount;
    // ユーザーが現在契約しているサブスクリップションの数量
    const subscriptionCurrentQuantity = subscriptions.data[0].items.data[0].quantity;
    // サブスクリプションに紐づくスケジュール 存在していない場合はcreate()で新たに作成する
    const scheduleId = subscriptions.data[0].schedule;

    console.log(
      "🌟Stripeステップ4 Stripeの顧客IDから各アイテム取得",
      "サブスクリプションID",
      stripeSubscriptionId,
      "サブスクアイテムID",
      subscriptionItemId,
      "現在契約中の価格ID",
      subscriptionCurrentPriceId,
      "現在契約中の数量",
      subscriptionCurrentQuantity,
      "次の請求日",
      nextInvoiceTimestamp,
      "スケジュールID",
      scheduleId
    );

    // =================== 比例配分なし 数量ダウンルート ===================
    // 🌟サブスクリプションの数量を増やすルート
    // ・新しいプランは即座に適用される。
    // ・請求タイミング（請求日）は、現在の請求日より早くなる。（これは必須ではないため現段階では現在の請求日のまま早めず）
    // ・アカウントを増やすから実行したとしても、前回数量を減らすスケジュールを作成していて現在契約しているアカウント数が今回アカウントを増やす個数の合計よりも低い場合は、前のスケジュールをキャンセルして新たに減らすルートに移行して次回請求日に今回のアカウントを増やすアカウントの合計値に更新するようにスケジュールを作成する
    // 例：現在アカウント数:3(11/1), => 1にダウン(12/1に適用) => 2にアップ(即時ではなく12/1に適用させる)
    // Point：アカウントを増やした時の合計値が、現在のアカウント数を超えているか
    if (changeType === "increase") {
      const subscription = await stripe.subscriptions.update(stripeSubscriptionId, {
        items: [
          {
            id: subscriptionItemId,
            quantity: newQuantity,
          },
        ],
        proration_behavior: "none",
      });
      console.log("🌟Stripeステップ5 数量アップルート UPDATE完了 subscription", subscription);

      const response = {
        subscriptionItem: subscription,
        error: null,
      };

      console.log("🌟Stripeステップ6 APIルートへ返却");

      res.status(200).json(response);
    }
    // 🌟サブスクリプションの数量を減らすルート
    // ・新しいプランは即座に適用されない。
    // ・ダウングレードが実際に適用されるのは、現在のプランの次回請求が確定した後。
    // ・次回請求日には、現在の（ダウングレードする前の）プランの金額で請求される。
    // ・アカウントを増やすから実行したとしても、前回数量を減らすスケジュールを作成していて現在契約しているアカウント数が今回アカウントを増やす個数の合計よりも低い場合は、減らすルートに移行して次回請求日に今回のアカウントを増やすアカウントの合計値に更新するようにスケジュールを作成する
    else if (changeType === "decrease") {
      // スケジュール動作確認用
      const currentTimestamp = Math.floor(Date.now() / 1000); // 現在のUNIXタイムスタンプを取得
      const fiveMinutesLater = currentTimestamp + 600; // 10分後のUNIXタイムスタンプを計算
      console.log("🌟Stripeステップ5-0 数量ダウンルート 動作確認用に10分後のタイムスタンプを取得", fiveMinutesLater);

      // Create a subscription schedule with the existing subscription
      let schedule;
      if (!scheduleId) {
        schedule = await stripe.subscriptionSchedules.create({
          from_subscription: stripeSubscriptionId, // "sub_ERf72J8Sc7qx7D"
        });
      } else {
        const releaseSchedule = await stripe.subscriptionSchedules.release(scheduleId as string);
        // schedule = await stripe.subscriptionSchedules.retrieve(scheduleId as string);
        console.log("🌟Stripeステップ5-01 スケジュールを開放 releaseSchedule", releaseSchedule);
        schedule = await stripe.subscriptionSchedules.create({
          from_subscription: stripeSubscriptionId, // "sub_ERf72J8Sc7qx7D"
        });
      }
      console.log(
        "🌟Stripeステップ5-1 数量ダウンルート 契約中のサブスクリプションIDでサブスクリプションスケジュールを作成",
        schedule
      );

      // Update the schedule with the new phase
      // 動作確認用 今月の終了日をend_dateで5分後に設定し、翌月の開始日をstart_dateで5分後に設定してすぐに動作確認できるようにする
      const subscriptionSchedule = await stripe.subscriptionSchedules.update(schedule.id, {
        phases: [
          {
            items: [
              {
                // price: schedule.phases[0].items[0].price,
                // quantity: schedule.phases[0].items[0].quantity,
                price: subscriptionCurrentPriceId, // 現在の価格プラン
                quantity: subscriptionCurrentQuantity, // 更新前の現在の数量
              },
            ],
            start_date: schedule.phases[0].start_date,
            end_date: schedule.phases[0].end_date, // 本番はこっち
            // end_date: fiveMinutesLater, // 動作確認用 今月のサブスクを5分後に終了させ翌月のサブスクに更新する
            proration_behavior: "none",
          },
          {
            items: [
              {
                price: subscriptionCurrentPriceId, // 現在の価格プラン
                quantity: newQuantity, // 新たにダウンした数量
              },
            ],
            // start_date: fiveMinutesLater, // 動作確認用 翌月のサブスクを5分後に設定 本番は省略
            iterations: 1, // 省略
            proration_behavior: "none",
          },
        ],
      });

      console.log(
        "🌟Stripeステップ5-2 数量ダウンルート 作成したサブスクリプションスケジュールをupdate",
        "現在の価格プラン",
        subscriptionCurrentPriceId,
        "現在の数量",
        subscriptionCurrentQuantity,
        "更新後の数量",
        newQuantity
      );

      console.log(
        "🌟Stripeステップ5-3 数量ダウンルート サブスクリプションスケジュールUPDATE完了 subscriptionSchedule",
        subscriptionSchedule,
        "現在のフェーズのアイテム",
        subscriptionSchedule.phases[0].items,
        "翌月のフェーズのアイテム",
        subscriptionSchedule.phases[1].items
      );

      // Stripeのサブスクリプションスケジュールのキャンセル、更新用にスケジュールidなどをsupabaseのstripe_schedulesテーブルにINSERT
      const insertPayload = {
        stripe_customer_id: stripeCustomerId,
        stripe_schedule_id: subscriptionSchedule.id,
        schedule_status: subscriptionSchedule.status,
        stripe_subscription_id: stripeSubscriptionId,
        stripe_subscription_item_id: subscriptionItemId,
        current_price_id: subscriptionCurrentPriceId,
        scheduled_price_id: null,
        current_quantity: subscriptionCurrentQuantity,
        scheduled_quantity: newQuantity,
        note: null,
        update_reason: null,
        canceled_at: subscriptionSchedule.canceled_at,
        company_id: companyId,
        subscription_id: subscriptionId,
        current_price: subscriptionCurrentPriceUnitAmount,
        scheduled_price: null,
        completed_at: subscriptionSchedule.completed_at,
        stripe_created: new Date(subscriptionSchedule.created * 1000).toISOString(),
        user_id: userProfileId,
        current_start_date: new Date(schedule.phases[0].start_date * 1000).toISOString(),
        current_end_date: new Date(schedule.phases[0].end_date * 1000).toISOString(),
        released_at: subscriptionSchedule.released_at,
        end_behavior: subscriptionSchedule.end_behavior,
        released_subscription: subscriptionSchedule.released_subscription,
      };
      console.log("🌟Stripeステップ5-4 数量ダウンルート stripe_schedulesテーブルにINSERTするペイロード", insertPayload);

      // UNIXタイムスタンプをJavaScriptのDateオブジェクトに変換する際には、ミリ秒単位に変換する必要があります。そのため、タイムスタンプを1000倍にしなければなりません。その後、.toISOString()を使用してISO形式の文字列に変換します。
      const { data: insertScheduleData, error: insertScheduleError } = await supabaseServerClient
        .from("stripe_schedules")
        .insert(insertPayload);

      if (insertScheduleError) {
        console.error("❌supabaseのクエリ失敗error", insertScheduleError);
        // throw new Error(insertScheduleError.message);
      }

      console.log(
        "🌟Stripeステップ5-4 数量ダウンルート Supabaseのstripe_schedulesテーブルにINSERT完了 insertScheduleData",
        insertScheduleData
      );

      const response = {
        subscriptionItem: subscriptionSchedule,
        error: null,
      };

      console.log("🌟Stripeステップ6 APIルートへ返却");

      res.status(200).json(response);
    } else {
      console.log("🌟Stripeステップ6 エラー: Invalid changeType");
      return res.status(400).json({ error: "Invalid changeType" });
    }

    // =================== 比例配分なし 数量ダウンルート ここまで ===================

    // // =========================== 比例配分なしルート ===========================
    // // サブスクリプションの数量を増やすルート
    // // proration_behavior を none に設定してサブスクリプションの数量を増やし、billing_cycle_anchorの変更は不要
    // if (changeType === "increase") {
    //   const subscriptionItem = await stripe.subscriptionItems.update(subscriptionItemId, {
    //     quantity: newQuantity,
    //     proration_behavior: "none",
    //   });

    //   console.log("🌟Stripeステップ5 アカウント数量アップルート UPDATE完了 subscriptionItem", subscriptionItem);

    //   const response = {
    //     subscriptionItem: subscriptionItem,
    //     error: null,
    //   };

    //   console.log("🌟Stripeステップ6 APIルートへ返却");

    //   res.status(200).json(response);
    // }
    // // サブスクリプションの数量を減らすルート
    // // 取得した次の請求日をbilling_cycle_anchorとして設定し、サブスクリプションの数量を減少させます。
    // // これにより、次の請求日までの間、変更前の数量が請求され、その後の請求からは新しい数量が請求されます。
    // else if (changeType === "decrease") {
    //   const subscriptionItem = await stripe.subscriptionItems.update(subscriptionItemId, {
    //     quantity: newQuantity,
    //     proration_behavior: "none",
    //   });
    //   // const subscriptionItem = await stripe.subscriptions.update(subscriptionId, {
    //   //   items: [
    //   //     {
    //   //       id: subscriptionItemId,
    //   //       quantity: newQuantity,
    //   //       clear_usage: true,
    //   //     },
    //   //   ],
    //   // });
    //   // const subscriptionItem = await stripe.subscriptions.update(subscriptionId, {
    //   //   items: [
    //   //     {
    //   //       id: subscriptionItemId,
    //   //       quantity: newQuantity,
    //   //     },
    //   //   ],
    //   //   proration_behavior: "none",
    //   //   // billing_cycle_anchor: nextInvoiceTimestamp as any,
    //   // });

    //   console.log("🌟Stripeステップ5 アカウント数量ダウンルート UPDATE完了 subscriptionItem", subscriptionItem);

    //   const response = {
    //     subscriptionItem: subscriptionItem,
    //     error: null,
    //   };

    //   console.log("🌟Stripeステップ6 APIルートへ返却");

    //   res.status(200).json(response);
    // } else {
    //   console.log("🌟Stripeステップ6 エラー: Invalid changeType");
    //   return res.status(400).json({ error: "Invalid changeType" });
    // }
    // // =========================== 比例配分なしルート ここまで ===========================

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
