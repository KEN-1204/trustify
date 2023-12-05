import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/database.types";
import Stripe from "stripe";
import { format } from "date-fns";

// 削除リクエストをキャンセルするルートハンドラー

const cancelChangePlanHandler = async (req: NextApiRequest, res: NextApiResponse) => {
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
    console.log("🌟Stripeプランダウングレードキャンセルステップ1 APIルートリクエスト取得");
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
    console.log("🌟Stripeプランダウングレードキャンセルステップ2 jwt.verify認証完了 payload", payload);
    const userId = payload.sub; // 'sub' field usually contains the user id.

    // axios.post()メソッドのリクエストボディから変数を取得
    const { stripeCustomerId, subscriptionId, stripeSubscriptionId } = req.body;

    // Ensure stripeCustomerId is a string stripeCustomerIdが文字列であることを確認する。
    if (typeof stripeCustomerId !== "string") {
      console.log("❌Stripeプランダウングレードキャンセルステップ3-2 エラー: Invalid stripeCustomerId");
      res.status(400).json({ error: "❌Invalid stripeCustomerId" });
      return;
    }
    // Ensure stripeSubscriptionId is a string stripeSubscriptionIdが文字列であることを確認する。
    if (typeof stripeSubscriptionId !== "string") {
      console.log("❌Stripeプランダウングレードキャンセルステップ3-2 エラー: Invalid stripeSubscriptionId");
      res.status(400).json({ error: "❌Invalid stripeSubscriptionId" });
      return;
    }

    // stripeインスタンスを作成
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2022-11-15",
    });

    // Stripe顧客IDからサブスクリプションを取得
    // const subscriptions = await stripe.subscriptions.list({
    //   customer: stripeCustomerId,
    // });
    const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

    console.log("🌟Stripeプランダウングレードキャンセルステップ3-2 Stripeから取得したsubscription", subscription);

    // サブスクリプションに紐づくスケジュール 存在していない場合はcreate()で新たに作成する
    const scheduleId = subscription.schedule;

    if (!scheduleId) {
      console.log("エラー: scheduleId is not exist");
      return res.status(400).json({ error: "scheduleId is not exist" });
    }

    console.log("🌟Stripeプランダウングレードキャンセルステップ4 StripeのサブスクリプションDから各アイテム取得");
    console.log("💡サブスクリプションID", stripeSubscriptionId);
    console.log("💡サブスクアイテムID subscription.items.data[0].id", subscription.items.data[0].id);
    console.log("💡現在契約中の数量subscription.items.data[0].quantity", subscription.items.data[0].quantity);
    console.log(
      "💡現在のプランの開始日subscription.current_period_start",
      format(new Date(subscription.current_period_start * 1000), "yyyy年MM月dd日 HH:mm:ss"),
      subscription.current_period_start
    );
    console.log(
      "💡現在のプランの終了日subscription.current_period_end",
      format(new Date(subscription.current_period_end * 1000), "yyyy年MM月dd日 HH:mm:ss"),
      subscription.current_period_end
    );
    console.log("💡スケジュールIDsubscription.schedule", subscription.schedule);

    // 現在のフェーズのプラン(priceId)と翌月のフェーズのプラン(priceId)が異なるなら、数量変更スケジュール以外にプラン変更スケジュールも予約されてるので、
    // releaseではなく、数量のみ現在のフェーズの数量に戻す形でupdate()する

    const scheduleData = await stripe.subscriptionSchedules.retrieve(scheduleId as string);

    const currentPhasePriceId = scheduleData.phases[0].items[0].price;
    const upcomingPhaseNewPriceId = scheduleData.phases[1].items[0].price;
    const currentPhaseQuantity = scheduleData.phases[0].items[0].quantity;
    const upcomingPhaseNewQuantity = scheduleData.phases[1].items[0].quantity;

    if (typeof currentPhaseQuantity !== "number") {
      console.log("❌Stripeプランダウングレードキャンセルステップ5 Invalid currentPhaseQuantity");
      const response = {
        subscriptionItem: null,
        error: "❌Stripeプランダウングレードキャンセルステップ5 Invalid currentPhaseQuantity",
      };
      return res.status(401).json(response);
    }
    if (typeof upcomingPhaseNewQuantity !== "number") {
      console.log("❌Stripeプランダウングレードキャンセルステップ5 Invalid upcomingPhaseNewQuantity");
      const response = {
        subscriptionItem: null,
        error: "❌Stripeプランダウングレードキャンセルステップ5 Invalid upcomingPhaseNewQuantity",
      };
      return res.status(401).json(response);
    }

    let subscriptionSchedule;
    // ========================= プラン変更が無いため数量変更スケジュールリリースルート =========================
    // 現在のフェーズより来月のフェーズの方が数量が同じかそれ以上というのは、今回のプランダウングレードスケジュールキャンセルにおいて、数量ダウングレードスケジュールが既に予約されている場合にはあり得ないため、リリースする。唯一プランキャンセル時に取り得るのは数量ダウンスケジュールの現在のフェーズの数量が来月のフェーズの数量より少ない場合のみ
    if (currentPhaseQuantity <= upcomingPhaseNewQuantity) {
      console.log(
        "🌟Stripeプランダウングレードキャンセルステップ5 プランダウングレードキャンセル時に現在のフェーズが来月のフェーズの数量より同じかそれ以上のためリリースを実行 currentPhaseQuantity",
        currentPhaseQuantity,
        "upcomingPhaseNewQuantity",
        upcomingPhaseNewQuantity
      );
      subscriptionSchedule = await stripe.subscriptionSchedules.release(scheduleId as string);
      console.log(
        "🌟Stripeプランダウングレードキャンセルステップ5 スケジュールリリース完了 subscriptionSchedule",
        subscriptionSchedule
      );
    }
    // ========================= プラン変更は残し、数量変更のみキャンセルするルート =========================
    else {
      console.log(
        "🌟Stripe数量ダウンキャンセルステップ5 数量変更スケジュールが存在しているためリリースではなくupdateルート retrieveで取得したスケジュールの今月と来月のフェーズの数量を比較 scheduleData.phases[0].items[0].quantityとscheduleData.phases[1].items[0].quantity",
        scheduleData.phases[0].items[0].quantity,
        scheduleData.phases[1].items[0].quantity
      );
      subscriptionSchedule = await stripe.subscriptionSchedules.update(scheduleId as string, {
        phases: [
          {
            items: [
              {
                price: currentPhasePriceId as string,
                quantity: currentPhaseQuantity,
              },
            ],
            start_date: scheduleData.phases[0].start_date,
            end_date: scheduleData.phases[0].end_date, // 本番はこっち
            proration_behavior: "none", // そのまま
            billing_cycle_anchor: "phase_start", // 現在の請求期間の開始日のまま
          },
          {
            items: [
              {
                price: currentPhasePriceId as string, // プランを現在のフェーズに戻す => プランダウングレードをキャンセル
                quantity: upcomingPhaseNewQuantity,
              },
            ],
            iterations: 1,
            proration_behavior: "none",
          },
        ],
      });
      console.log(
        "🌟Stripe数量ダウンキャンセルステップ5 スケジュールupdate完了 数量変更スケジュールが存在しているためリリースではなくupdate subscriptionSchedule",
        subscriptionSchedule
      );
    }

    // stripe_schedulesテーブルのスケジュールをcanceledに更新する
    const updateStripeSchedulesPayload = {
      schedule_status: "canceled",
      released_at: subscriptionSchedule.released_at
        ? new Date(subscriptionSchedule.released_at * 1000).toISOString()
        : null,
      released_subscription: subscriptionSchedule.released_subscription,
    };
    const { error: updateScheduleError } = await supabaseServerClient
      .from("stripe_schedules")
      .update(updateStripeSchedulesPayload)
      .eq("stripe_schedule_id", scheduleId)
      .eq("type", "change_plan");

    if (updateScheduleError) {
      console.error("❌supabaseのstripe_scheduleテーブルUPDATEクエリ失敗error", updateScheduleError);
      // throw new Error(insertScheduleError.message);
    }

    console.log("🌟Stripeプランダウングレードキャンセルステップ6 Supabaseのstripe_schedulesテーブルにUPDATE完了");

    const response = {
      subscriptionItem: subscriptionSchedule,
      error: null,
    };

    console.log("✅Stripeプランダウングレードキャンセルステップ7 APIルートへ返却");

    res.status(200).json(response);
  } catch (error) {
    if ((error as Error).name === "JsonWebTokenError") {
      console.log("❌Invalid token");
      const response = {
        subscriptionItem: null,
        error: "Invalid token",
      };
      return res.status(401).json(response);
      //   res.status(401).json({ error: "Invalid token" });
    } else if ((error as Error).name === "TokenExpiredError") {
      console.log("❌Token has expired");

      const response = {
        subscriptionItem: null,
        error: "Token has expired",
      };
      return res.status(401).json(response);
      //   res.status(401).json({ error: "Token has expired" });
    } else {
      console.log(`❌予期せぬエラー: ${(error as Error).message}`);
      console.log(`❌エラーオブジェクト: ${error as Error}`);

      const response = {
        subscriptionItem: null,
        error: (error as Error).message,
      };
      return res.status(401).json(response);
      //   res.status(500).json({ error: (error as Error).message });
    }
    // res.status(400).json(error);
  }
};

export default cancelChangePlanHandler;
