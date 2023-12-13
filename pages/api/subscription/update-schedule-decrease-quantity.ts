import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import Stripe from "stripe";
import { format } from "date-fns";

const updateScheduleDecreaseQuantityHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    console.log("❌POSTメソッドで受信できず");
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }

  try {
    console.log(
      "🌟Stripeプランアップグレード前の数量ダウンスケジュールを先にプレミアムプランに変更ステップ1 APIルートリクエスト取得"
    );
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
    console.log(
      "🌟Stripeプランアップグレード前の数量ダウンスケジュールを先にプレミアムプランに変更ステップ2 jwt.verify認証完了 payload",
      payload
    );
    const userId = payload.sub; // 'sub' field usually contains the user id.

    // axios.post()メソッドのリクエストボディから変数を取得
    const { stripeCustomerId, stripeSubscriptionId, newPlanName } = req.body;

    // Ensure stripeCustomerId is a string stripeCustomerIdが文字列であることを確認する。
    if (typeof stripeCustomerId !== "string") {
      console.log(
        "❌Stripeプランアップグレード前の数量ダウンスケジュールを先にプレミアムプランに変更ステップ3-2 エラー: Invalid stripeCustomerId"
      );
      res.status(400).json({ error: "❌Invalid stripeCustomerId" });
      return;
    }
    // Ensure stripeSubscriptionId is a string stripeSubscriptionIdが文字列であることを確認する。
    if (typeof stripeSubscriptionId !== "string") {
      console.log(
        "❌Stripeプランアップグレード前の数量ダウンスケジュールを先にプレミアムプランに変更ステップ3-2 エラー: Invalid stripeSubscriptionId"
      );
      res.status(400).json({ error: "❌Invalid stripeSubscriptionId" });
      return;
    }
    // Ensure newQuantity is a string newQuantityが文字列であることを確認する。
    if (typeof newPlanName !== "string") {
      console.log(
        "❌Stripeプランアップグレード前の数量ダウンスケジュールを先にプレミアムプランに変更ステップ3-2 エラー: Invalid newPlanName"
      );
      res.status(400).json({ error: "❌Invalid newPlanName" });
      return;
    }

    // stripeインスタンスを作成
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2022-11-15",
    });

    console.log(
      "🌟Stripeプランアップグレード前の数量ダウンスケジュールを先にプレミアムプランに変更ステップ3-2 stripe.subscriptions.retrieve()実行"
    );
    // サブスクリプションオブジェクトを取得
    const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

    console.log(
      "🔥Stripeプランアップグレード前の数量ダウンスケジュールを先にプレミアムプランに変更ステップ3-2 stripe.subscriptions.retrieve()結果 subscription",
      subscription
    );

    // ユーザーが現在契約しているサブスクリップションアイテムのidを取得
    const subscriptionItemId = subscription.items.data[0].id;
    // サブスクリプションに紐づくスケジュール 存在していない場合はcreate()で新たに作成する
    const scheduleId = subscription.schedule;

    if (!scheduleId) {
      console.log("エラー: scheduleId is not exist");
      return res.status(400).json({ error: "scheduleId is not exist" });
    }

    console.log(
      "🌟Stripeプランアップグレード前の数量ダウンスケジュールを先にプレミアムプランに変更ステップ4 サブスクリプション各アイテム取得"
    );
    console.log("💡サブスクリプションID", stripeSubscriptionId);
    console.log("💡サブスクアイテムID", subscriptionItemId);
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

    // 新たなプラン名からstripeのprice_idを取得
    // let _newPriceId;
    // switch (newPlanName) {
    //   case "business_plan":
    //     _newPriceId = process.env.STRIPE_BUSINESS_PLAN_PRICE_ID;
    //     break;
    //   case "premium_plan":
    //     _newPriceId = process.env.STRIPE_PREMIUM_PLAN_PRICE_ID;
    //     break;
    //   default:
    //     _newPriceId = null;
    // }

    // 現在のフェーズのプラン(priceId)と翌月のフェーズのプラン(priceId)が異なるなら、数量変更スケジュール以外にプラン変更スケジュールも予約されてるので、
    // releaseではなく、数量のみ現在のフェーズの数量に戻す形でupdate()する
    console.log(
      "🌟Stripeプランアップグレード前の数量ダウンスケジュールを先にプレミアムプランに変更ステップ5 stripe.subscriptionSchedules.retrieve()実行"
    );
    const scheduleData = await stripe.subscriptionSchedules.retrieve(scheduleId as string);
    // const releasedScheduleData = await stripe.subscriptionSchedules.release(scheduleId as string);
    // const scheduleData = await stripe.subscriptionSchedules.create({
    //   from_subscription: stripeSubscriptionId, // "sub_ERf72J8Sc7qx7D"
    // });
    console.log(
      "🔥Stripeプランアップグレード前の数量ダウンスケジュールを先にプレミアムプランに変更ステップ5 stripe.subscriptionSchedules.retrieve()結果 scheduleData",
      scheduleData
    );
    console.log(
      "💡Stripeプランアップグレード前の数量ダウンスケジュールを先にプレミアムプランに変更ステップ5 更新前 今月フェーズ scheduleData.phases[0].items[0]",
      scheduleData.phases[0].items[0]
    );
    console.log(
      "💡Stripeプランアップグレード前の数量ダウンスケジュールを先にプレミアムプランに変更ステップ5 更新前 翌月フェーズ scheduleData.phases[1].items[0]",
      scheduleData.phases[1].items[0]
    );
    console.log(
      "💡Stripeプランアップグレード前の数量ダウンスケジュールを先にプレミアムプランに変更ステップ5  更新前 scheduleData.phases.length",
      scheduleData.phases.length
    );

    console.log(
      "🌟Stripeプランアップグレード前の数量ダウンスケジュールを先にプレミアムプランに変更ステップ6  stripe.subscriptionSchedules.update()実行 引数一覧"
    );
    console.log(
      "💡引数 更新前 今月フェーズ価格scheduleData.phases[0].items[0].price",
      scheduleData.phases[0].items[0].price
    );
    console.log(
      "💡引数 更新前 今月フェーズ数量scheduleData.phases[0].items[0].quantity",
      scheduleData.phases[0].items[0].quantity
    );
    console.log(
      "💡引数 更新前 翌月フェーズ価格scheduleData.phases[1].items[0].price",
      scheduleData.phases[1].items[0].price
    );
    console.log(
      "💡引数には渡さない 更新前 翌月フェーズ数量scheduleData.phases[1].items[0].quantity",
      scheduleData.phases[1].items[0].quantity
    );
    console.log("💡引数 更新前 newPlanName", newPlanName);
    console.log(
      "💡引数 更新前 stripe.subscriptionSchedules.update 引数に渡す現在のフェーズのstart_date scheduleData.phases[0].start_date",
      format(new Date(scheduleData.phases[0].start_date * 1000), "yyyy年MM月dd日 HH:mm:ss"),
      scheduleData.phases[0].start_date
    );
    console.log(
      "💡引数 更新前 stripe.subscriptionSchedules.update 引数に渡す現在のフェーズのend_date scheduleData.phases[0].end_date",
      format(new Date(scheduleData.phases[0].end_date * 1000), "yyyy年MM月dd日 HH:mm:ss"),
      scheduleData.phases[0].end_date
    );

    // if (scheduleData.phases.length < 2) {
    //   console.log("エラー: scheduleData.phases.lengthが1以下 scheduleData.phases.length");
    //   return res.status(400).json({ error: "エラー: scheduleData.phases.lengthが1以下" });
    // }

    // 現在のフェーズは実際にsubscriptionオブジェクトのプランをアップグレードでupdateした直後に、スケジュールの現在のフェーズのプランをupdateする
    const subscriptionSchedule = await stripe.subscriptionSchedules.update(scheduleData.id as string, {
      phases: [
        {
          items: [
            {
              price: scheduleData.phases[0].items[0].price as string,
              quantity: scheduleData.phases[0].items[0].quantity,
            },
          ],
          start_date: scheduleData.phases[0].start_date,
          end_date: scheduleData.phases[0].end_date, // 本番はこっち
          //   proration_behavior: "none", // そのまま
          billing_cycle_anchor: "phase_start", // 現在の請求期間の開始日のまま
        },
        {
          items: [
            {
              price: process.env.STRIPE_PREMIUM_PLAN_PRICE_ID as string, // 今回アップグレードするプレミアムプランのidを渡す
              quantity: scheduleData.phases[1].items[0].quantity, // 数量ダウンスケジュールリクエストのプランのまま
            },
          ],
          iterations: 1,
          proration_behavior: "none",
        },
      ],
    });
    console.log(
      "🔥Stripeプランアップグレード前の数量ダウンスケジュールを先にプレミアムプランに変更ステップ6 stripe.subscriptionSchedules.update()完了 次回フェーズの数量を更新 subscriptionSchedule",
      subscriptionSchedule
    );
    console.log(
      "💡更新後 今月フェーズsubscriptionSchedule.phases[0].items[0]",
      subscriptionSchedule.phases[0].items[0]
    );
    console.log(
      "💡更新後 翌月フェーズsubscriptionSchedule.phases[1].items[0]",
      subscriptionSchedule.phases[1].items[0]
    );

    // stripe_schedulesテーブルのスケジュールをcanceledに更新する => サブスクリプションオブジェクトの更新に変更するから、ここでのsupabaseのUPDATEは不要かも
    // const updateStripeSchedulesPayload = {
    //   stripe_schedule_id: subscriptionSchedule.id,
    //   current_price_id: process.env.STRIPE_PREMIUM_PLAN_PRICE_ID, // ここで
    // };
    // console.log(
    //   "🌟Stripeプランアップグレード前の数量ダウンスケジュールを先にプレミアムプランに変更ステップ7 stripe_scheduleテーブルのchange_planタイプスケジュールのcurrent_quantityをUPDATEを実行 updateStripeSchedulesPayload",
    //   updateStripeSchedulesPayload
    // );
    // const { error: updateScheduleError } = await supabaseServerClient
    //   .from("stripe_schedules")
    //   .update(updateStripeSchedulesPayload)
    //   .eq("stripe_schedule_id", scheduleId)
    //   .eq("type", "change_plan")
    //   .eq("schedule_status", "active");

    // if (updateScheduleError) {
    //   console.log(
    //     "❌Stripeプランアップグレード前の数量ダウンスケジュールを先にプレミアムプランに変更ステップ6 supabaseのstripe_scheduleテーブルUPDATEクエリ失敗error",
    //     updateScheduleError
    //   );
    // }

    // console.log(
    //   "🔥Stripeプランアップグレード前の数量ダウンスケジュールを先にプレミアムプランに変更ステップ7 Supabaseのstripe_schedulesテーブルにUPDATE完了"
    // );

    const response = {
      data: subscriptionSchedule,
      error: null,
    };

    console.log(
      "✅Stripeプランアップグレード前の数量ダウンスケジュールを先にプレミアムプランに変更ステップ8 無事完了したため200でAPIルートへ返却"
    );

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

export default updateScheduleDecreaseQuantityHandler;
