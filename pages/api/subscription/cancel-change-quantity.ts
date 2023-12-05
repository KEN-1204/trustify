import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/database.types";
import Stripe from "stripe";
import { format } from "date-fns";

// 削除リクエストをキャンセルするルートハンドラー

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
    console.log("🌟Stripe数量ダウンキャンセルステップ1 APIルートリクエスト取得");
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
    console.log("🌟Stripe数量ダウンキャンセルステップ2 jwt.verify認証完了 payload", payload);
    const userId = payload.sub; // 'sub' field usually contains the user id.

    // axios.post()メソッドのリクエストボディから変数を取得
    const { stripeCustomerId, cancelDeleteRequestQuantity, subscriptionId } = req.body;

    console.log(
      "🌟Stripe数量ダウンキャンセルステップ3 削除リクエストをキャンセルするアカウント数とStripe顧客IDをリクエストボディから取得"
    );
    console.log("✅Stripe顧客ID", stripeCustomerId);
    console.log("✅削除リクエスト済みをキャンセルする数", cancelDeleteRequestQuantity);
    // console.log("✅削除リクエスト済みをキャンセルするアカウントidをもつ配列", cancelDeleteRequestedAccountIds);

    // Ensure stripeCustomerId is a string stripeCustomerIdが文字列であることを確認する。
    if (typeof stripeCustomerId !== "string") {
      console.log("❌Stripe数量ダウンキャンセルステップ3-2 エラー: Invalid stripeCustomerId");
      res.status(400).json({ error: "❌Invalid stripeCustomerId" });
      return;
    }

    // Ensure newQuantity is a number newQuantityが存在し、newQuantityが数値型であることを確認する。
    if (!cancelDeleteRequestQuantity || typeof cancelDeleteRequestQuantity !== "number") {
      console.log("❌Stripe数量ダウンキャンセルステップ3-2 エラー: Invalid cancelDeleteRequestQuantity");
      return res.status(400).json({ error: "❌Invalid newQuantity" });
    }

    // Ensure cancelDeleteRequestedAccountIds is uuids of Array cancelDeleteRequestedAccountIdsが全てUUIDを持つ配列であることを確認する。
    // const isValidUUIDv4 = (uuid: string): boolean => {
    //   return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(uuid);
    // };
    // if (
    //   !cancelDeleteRequestedAccountIds ||
    //   cancelDeleteRequestedAccountIds.length === 0 ||
    //   cancelDeleteRequestedAccountIds.every((id: string) => id && isValidUUIDv4(id)) === false
    // ) {
    //   console.log("❌Stripe数量ダウンキャンセルステップ3-2 エラー: Invalid cancelDeleteRequestedAccountIds");
    //   return res.status(400).json({ error: "❌Invalid cancelDeleteRequestedAccountIds" });
    // }

    // stripeインスタンスを作成
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2022-11-15",
    });

    // Stripe顧客IDからサブスクリプションを取得
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
    });

    console.log("🌟Stripe数量ダウンキャンセルステップ3-2 Stripeから取得したsubscriptions", subscriptions);

    // サブスクリプションID
    const stripeSubscriptionId = subscriptions.data[0].id;
    // 現在のプランの開始日
    const currentPeriodStart = subscriptions.data[0].current_period_start;
    // 次の請求日を取得
    const nextInvoiceTimestamp = subscriptions.data[0].current_period_end;
    // ユーザーが現在契約しているサブスクリップションアイテムのidを取得
    const subscriptionItemId = subscriptions.data[0].items.data[0].id;
    // ユーザーが現在契約しているサブスクリップションのプランの価格を取得
    const subscriptionCurrentPriceUnitAmount = subscriptions.data[0].items.data[0].price.unit_amount;
    // ユーザーが現在契約しているサブスクリップションの数量
    const subscriptionCurrentQuantity = subscriptions.data[0].items.data[0].quantity;
    // サブスクリプションに紐づくスケジュール 存在していない場合はcreate()で新たに作成する
    const scheduleId = subscriptions.data[0].schedule;

    if (!scheduleId) {
      console.log("エラー: scheduleId is not exist");
      return res.status(400).json({ error: "scheduleId is not exist" });
    }

    console.log("🌟Stripe数量ダウンキャンセルステップ4 Stripeのサブスクリプションから各アイテム取得");
    console.log("💡サブスクリプションID", stripeSubscriptionId);
    console.log("💡サブスクアイテムID subscriptions.data[0].items.data[0].id", subscriptions.data[0].items.data[0].id);
    console.log(
      "💡現在契約中の数量subscriptions.data[0].items.data[0].quantity",
      subscriptions.data[0].items.data[0].quantity
    );
    console.log(
      "💡現在のプランの開始日subscriptions.data[0].current_period_start",
      format(new Date(subscriptions.data[0].current_period_start * 1000), "yyyy年MM月dd日 HH:mm:ss"),
      subscriptions.data[0].current_period_start
    );
    console.log(
      "💡現在のプランの終了日subscriptions.data[0].current_period_end",
      format(new Date(subscriptions.data[0].current_period_end * 1000), "yyyy年MM月dd日 HH:mm:ss"),
      subscriptions.data[0].current_period_end
    );
    console.log("💡スケジュールID: subscriptions.data[0].schedule", subscriptions.data[0].schedule);

    // 現在のフェーズのプラン(priceId)と翌月のフェーズのプラン(priceId)が異なるなら、数量変更スケジュール以外にプラン変更スケジュールも予約されてるので、
    // releaseではなく、数量のみ現在のフェーズの数量に戻す形でupdate()する

    const scheduleData = await stripe.subscriptionSchedules.retrieve(scheduleId as string);

    const currentPhasePriceId = scheduleData.phases[0].items[0].price;
    const upcomingPhaseNewPriceId = scheduleData.phases[1].items[0].price;
    const currentPhaseQuantity = scheduleData.phases[0].items[0].quantity;
    const upcomingPhaseQuantity = scheduleData.phases[1].items[0].quantity;

    let subscriptionSchedule;
    // ========================= プラン変更が無いため数量変更スケジュールリリースルート =========================
    if (currentPhasePriceId === upcomingPhaseNewPriceId) {
      subscriptionSchedule = await stripe.subscriptionSchedules.release(scheduleId as string);
      console.log(
        "🌟Stripe数量ダウンキャンセルステップ5 スケジュールリリース完了 subscriptionSchedule",
        subscriptionSchedule
      );
    }
    // ========================= プラン変更は残し、数量変更のみキャンセルするルート =========================
    else {
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
                price: upcomingPhaseNewPriceId as string,
                quantity: currentPhaseQuantity, // 数量を現在のフェーズに戻す => 数量減少をキャンセル
              },
            ],
            iterations: 1,
            proration_behavior: "none",
          },
        ],
      });
      console.log(
        "🌟Stripe数量ダウンキャンセルステップ5 スケジュールupdate完了 プラン変更スケジュールが存在しているためリリースではなくupdate subscriptionSchedule",
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
      .eq("type", "change_quantity");

    if (updateScheduleError) {
      console.error("❌supabaseのstripe_scheduleテーブルUPDATEクエリ失敗error", updateScheduleError);
      // throw new Error(insertScheduleError.message);
    }

    console.log("🌟Stripe数量ダウンキャンセルステップ6 Supabaseのstripe_schedulesテーブルにUPDATE完了");

    const response = {
      subscriptionItem: subscriptionSchedule,
      error: null,
    };

    console.log("🌟Stripe数量ダウンキャンセルステップ7 APIルートへ返却");

    res.status(200).json(response);
  } catch (error) {
    if ((error as Error).name === "JsonWebTokenError") {
      console.log("❌Invalid token");
      const response = {
        subscriptionItem: null,
        error: "Invalid token",
      };
      res.status(401).json(response);
      //   res.status(401).json({ error: "Invalid token" });
    } else if ((error as Error).name === "TokenExpiredError") {
      console.log("❌Token has expired");

      const response = {
        subscriptionItem: null,
        error: "Token has expired",
      };
      res.status(401).json(response);
      //   res.status(401).json({ error: "Token has expired" });
    } else {
      console.log(`❌予期せぬエラー: ${(error as Error).message}`);
      console.log(`❌エラーオブジェクト: ${error as Error}`);

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
