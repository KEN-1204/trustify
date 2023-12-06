import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import Stripe from "stripe";
import { format } from "date-fns";

// 削除リクエストをキャンセルするルートハンドラー

const getScheduleDowngradePlanHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    console.log("❌POSTメソッドで受信できず");
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }

  try {
    console.log("🌟Stripe数量アップ前プランダウングレードスケジュールステップ1 APIルートリクエスト取得");
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
    console.log("🌟Stripe数量アップ前プランダウングレードスケジュールステップ2 jwt.verify認証完了");
    const userId = payload.sub; // 'sub' field usually contains the user id.

    // axios.post()メソッドのリクエストボディから変数を取得
    const { stripeSubscriptionId } = req.body;

    // Ensure stripeSubscriptionId is a string stripeSubscriptionIdが文字列であることを確認する。
    if (typeof stripeSubscriptionId !== "string") {
      console.log(
        "❌Stripe数量アップ前プランダウングレードスケジュールステップ3-2 エラー: Invalid stripeSubscriptionId"
      );
      res.status(400).json({ error: "❌Invalid stripeSubscriptionId" });
      return;
    }

    // stripeインスタンスを作成
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2022-11-15",
    });

    console.log(
      "🌟Stripe数量アップ前のプランダウングレードスケジュール取得ステップ3-2 stripe.subscriptions.retrieve()実行"
    );
    // サブスクリプションオブジェクトを取得
    const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

    console.log(
      "🔥Stripe数量アップ前のプランダウングレードスケジュール取得ステップ3-2 stripe.subscriptions.retrieve()成功"
    );

    // サブスクリプションに紐づくスケジュール 存在していない場合はcreate()で新たに作成する
    const scheduleId = subscription.schedule;

    if (!scheduleId) {
      console.log("エラー: scheduleId is not exist");
      return res.status(400).json({ error: "scheduleId is not exist" });
    }

    console.log(
      "🌟Stripe数量アップ前のプランダウングレードスケジュール取得ステップ5 stripe.subscriptionSchedules.retrieve()実行"
    );
    const scheduleData = await stripe.subscriptionSchedules.retrieve(scheduleId as string);

    const response = {
      data: scheduleData,
      error: null,
    };

    console.log(
      "✅Stripe数量アップ前のプランダウングレードスケジュール取得ステップ8 無事完了したため200でAPIルートへ返却"
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

export default getScheduleDowngradePlanHandler;
