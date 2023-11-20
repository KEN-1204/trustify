import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import jwt from "jsonwebtoken";
import { format } from "date-fns";

// profileテーブルがINSERTされた時にSupabaseのトリガー関数が実行され、リクエストがこのルートハンドラーに送信される
// リクエスト受信後、Stripeのcustomer.create()でStripeダッシュボードにカスタマーを作成し、
// 同時にsupabaseのprofileテーブルの該当ユーザーのstripe_customerの値をUPDATEクエリでStripeダッシュボードのカスタマーidと同期させる
const retrieveUpcomingInvoiceHandler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  if (req.method !== "POST") {
    console.log("❌POSTメソッドで受信できず");
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
  try {
    console.log("🌟Stripe将来のインボイス取得ステップ1 APIルートリクエスト取得");
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
    console.log("🌟Stripe将来のインボイス取得ステップ2 jwt.verify認証完了");
    /**
      jwt.verify()メソッドは、トークンの検証に失敗した場合、例外（エラー）をスローします。そのため、成功した場合にはpayloadにデコードされたJWTのペイロードが返されますが、失敗した場合は特定の返り値を返すのではなく、エラーが発生します。

      したがって、トークンの検証が失敗した場合のハンドリングを行いたい場合は、try...catch構文を使用して例外をキャッチする
     */
    // トークンが有効なら payload にはトークンのペイロードが含まれます。
    // ここでユーザー情報や他のセッション情報を取得することができます。

    // axios.post()メソッドのリクエストボディから変数を取得
    const { stripeCustomerId, stripeSubscriptionId, changeQuantity, changePlanName } = req.body;

    // Ensure stripeCustomerId is a string stripeCustomerIdが文字列であることを確認する。
    if (typeof stripeCustomerId !== "string") {
      console.log("❌Stripe将来のインボイス取得ステップ2-2 エラー: Invalid stripeCustomerId");
      return res
        .status(400)
        .json({ error: "❌Stripe将来のインボイス取得ステップ2-2 エラー: Invalid stripeCustomerId" });
    }
    if (typeof stripeSubscriptionId !== "string") {
      console.log("❌Stripe将来のインボイス取得ステップ2-2 エラー: Invalid stripeSubscriptionId");
      return res
        .status(400)
        .json({ error: "❌Stripe将来のインボイス取得ステップ2-2 エラー: Invalid stripeSubscriptionId" });
    }

    console.log(
      "🌟Stripe将来のインボイス取得ステップ2 req.bodyからstripe顧客IDとstripeサブスクリプションidを取得",
      stripeCustomerId,
      stripeSubscriptionId
    );
    console.log("💡stripe顧客id", stripeCustomerId);
    console.log("💡stripeサブスクリプションid", stripeSubscriptionId);
    console.log("💡changeQuantity", changeQuantity);
    console.log("💡changePlanName", changePlanName);

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2022-11-15",
    });

    const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    if (!subscription) {
      console.log(
        "❌Stripe将来のインボイス取得ステップ3エラー subscriptions.retrieve()でサブスクオブジェクト取得できず",
        subscription
      );
      const response = {
        data: null,
        error: "❌Stripe将来のインボイス取得ステップ3エラー subscriptions.retrieve()でサブスクオブジェクト取得できず",
      };
      return res.status(400).json(response);
    }
    console.log(
      "🌟Stripe将来のインボイス取得ステップ3 サブスクリプションオブジェクトを取得 subscription",
      subscription
    );

    const priceId = (subscription as Stripe.Subscription).items.data[0].price.id;
    console.log("💡契約中のサブスクリプション価格id", priceId);

    // ======================= 🌟current_period_endの時間分秒を一緒にしてからproration_dateに渡すパターン
    // 時間分秒を揃えないとStripeの比例配分は秒割りのため
    // const current = new Date(); // 現在の日付
    const timeClockCurrentDate = new Date(2023, 11, 19); // JavaScriptの月は0から始まるため、12月は11となります
    console.log("💡タイムクロックの現在の日付 timeClockCurrentDate", timeClockCurrentDate); // 出力: 2023-12-19T00:00:00.000Z（タイムゾーンによっては異なる表示になる場合があります）

    const currentEndTime = new Date(subscription.current_period_end * 1000); // サブスクリプション期間終了時の日時 「* 1000」はUNIXタイムスタンプ（秒単位）に変換

    // proration_dateの計算 次回終了日の1分49秒前をsubscription_proration_dateに渡す
    const prorationDate = new Date(
      timeClockCurrentDate.getFullYear(),
      timeClockCurrentDate.getMonth(),
      timeClockCurrentDate.getDate(),
      currentEndTime.getHours(),
      56, // 分を56分に設定,
      0 // 秒を0秒に設定
    );

    const prorationTimestamp = Math.floor(prorationDate.getTime() / 1000);

    console.log(
      "💡比例配分の日付 期間終了日からちょうど1分前のprorationTimestamp",
      prorationTimestamp,
      format(new Date(prorationTimestamp * 1000), "yyyy/MM/dd HH:mm:ss")
    );

    // 日付までは現在の日付で、時間分秒はcurrent_period_endの終了日の時間分秒で置換するパターン
    // const prorationDate = new Date(
    //   timeClockCurrentDate.getFullYear(),
    //   timeClockCurrentDate.getMonth(),
    //   timeClockCurrentDate.getDate(),
    //   currentEndTime.getHours(),
    //   currentEndTime.getMinutes(),
    //   currentEndTime.getSeconds()
    // );

    // // 全て現在時刻のタイムスタンプをsubscription_proration_dateに渡して比例計算をするパターン
    // const prorationDate = new Date(
    //   timeClockCurrentDate.getFullYear(),
    //   timeClockCurrentDate.getMonth(),
    //   timeClockCurrentDate.getDate(),
    //   timeClockCurrentDate.getFullYear(),
    //   timeClockCurrentDate.getMonth(),
    //   timeClockCurrentDate.getDate()
    // );

    // ======= billing_period_dateで時間、分、秒を取得してsubscription_proration_dateに渡した場合
    // const subscriptionTime = new Date(subscription.billing_cycle_anchor * 1000); // サブスクリプション作成時の日時 「* 1000」はUNIXタイムスタンプ（秒単位）に変換
    // console.log(
    //   "💡比例配分の日付 billing_cycle_anchorの時間分秒を置換 prorationTimestamp",
    //   prorationTimestamp,
    //   format(new Date(prorationTimestamp * 1000), "yyyy/MM/dd HH:mm:ss")
    // );
    // // proration_dateの計算
    // const prorationDate = new Date(
    //   timeClockCurrentDate.getFullYear(),
    //   timeClockCurrentDate.getMonth(),
    //   timeClockCurrentDate.getDate(),
    //   // current.getFullYear(),
    //   // current.getMonth(),
    //   // current.getDate(),
    //   subscriptionTime.getHours(),
    //   // subscriptionTime.getMinutes(),
    //   56, // 分を00分に設定
    //   // subscriptionTime.getSeconds()
    //   49 // 秒を00秒に設定
    // );
    // const prorationTimestampFromCurrentTime = Math.floor(prorationDate.getTime() / 1000);
    // console.log(
    //   "💡比例配分の日付 期間終了日からちょうど1分前prorationDate billing_anchor_dateで時間分秒を置換",
    //   prorationDate,
    //   format(new Date(prorationTimestamp * 1000), "yyyy/MM/dd HH:mm:ss")
    // );
    // ======================= ✅billing_cycle_anchorの時間分秒を一緒にしてからproration_dateに渡すパターン
    // ======================= 🌟現在の時間をそのままproration_dateに渡すパターン
    // Set proration date to this moment:
    // const prorationTimestamp = Math.floor(Date.now() / 1000);
    // console.log("💡比例配分の日付 prorationTimestamp", prorationTimestamp);
    // ======================= ✅現在の時間をそのままproration_dateに渡すパターン

    // ======================= 🌟数量変更ルート =======================
    if (!!changeQuantity && changePlanName === null) {
      // See what the next invoice would look like with a price switch
      // and proration set:
      const items = [
        {
          id: subscription.items.data[0].id,
          quantity: changeQuantity,
        },
      ];
      console.log(
        "🌟Stripe将来のインボイス取得ステップ4 数量変更ルート retrieveUpcoming()を実行 subscription_itemsに渡すitems",
        items
      );
      const invoice = await stripe.invoices.retrieveUpcoming({
        customer: stripeCustomerId,
        subscription: subscription.id,
        subscription_items: items,
        subscription_proration_date: prorationTimestamp, // 現在の時間でプレビューを取得 => サブスクリプションを変更する際にプレビューした時に適用した比例配分と同じ日付をsubscription.update()のproration_dateに渡す
      });

      if (!invoice) {
        console.log(
          "❌Stripe将来のインボイス取得ステップ5実行エラー 数量変更ルート invoices.retrieveUpcoming()でインボイス取得できず",
          invoice
        );
        const response = {
          data: null,
          error:
            "❌Stripe将来のインボイス取得ステップ5実行エラー 数量変更ルート invoices.retrieveUpcoming()でインボイス取得できず",
        };
        return res.status(400).json(response);
      }
      console.log(
        "🌟Stripe将来のインボイス取得ステップ5 数量変更ルート retrieveUpcoming()実行成功 invoices.retrieveUpcoming()で取得したインボイス",
        invoice
      );
      console.log(
        "💡取得した次回のinvoice period_start",
        invoice.period_start,
        format(new Date(invoice.period_start * 1000), "yyyy/MM/dd HH:mm:ss")
      );
      console.log(
        "💡取得した次回のinvoice period_end",
        invoice.period_end,
        format(new Date(invoice.period_end * 1000), "yyyy/MM/dd HH:mm:ss")
      );
      console.log(
        "💡比例配分の日付 subscription_proration_date",
        prorationTimestamp,
        format(new Date(prorationTimestamp * 1000), "yyyy/MM/dd HH:mm:ss")
      );
      console.log("期間終了日からちょうど1分前のタイムスタンプをsubscription_proration_dateに渡す");
      console.log("✅Stripe将来のインボイス取得ステップ6 数量変更ルート 次回のインボイス取得完了 200で返す");

      res.status(200).json({ data: invoice, error: null });
    }
    // ======================= ✅数量変更ルート ここまで =======================
    // ======================= 🌟プラン変更ルート =======================
    else if (changeQuantity === null && !!changePlanName) {
      const newPlanId = () => {
        switch (changePlanName) {
          case "business_plan":
            return process.env.STRIPE_BUSINESS_PLAN_PRICE_ID;
            break;
          case "premium_plan":
            return process.env.STRIPE_PREMIUM_PLAN_PRICE_ID;
            break;
        }
      };
      // See what the next invoice would look like with a price switch
      // and proration set:
      const items = [
        {
          id: subscription.items.data[0].id,
          price: newPlanId(), // Switch to new price
        },
      ];
      console.log(
        "🌟Stripe将来のインボイス取得ステップ4 プラン変更ルート retrieveUpcoming()を実行 subscription_itemsに渡すitems",
        items
      );
      const invoice = await stripe.invoices.retrieveUpcoming({
        customer: stripeCustomerId,
        subscription: subscription.id,
        subscription_items: items,
        subscription_proration_date: prorationTimestamp, // 現在の時間でプレビューを取得 => サブスクリプションを変更する際にプレビューした時に適用した比例配分と同じ日付をsubscription.update()のproration_dateに渡す
      });

      if (!invoice) {
        console.log(
          "❌Stripe将来のインボイス取得ステップ5実行エラー プラン変更ルート invoices.retrieveUpcoming()でインボイス取得できず",
          invoice
        );
        const response = {
          data: null,
          error:
            "❌Stripe将来のインボイス取得ステップ5実行エラー プラン変更ルート invoices.retrieveUpcoming()でインボイス取得できず",
        };
        return res.status(400).json(response);
      }
      console.log(
        "🌟Stripe将来のインボイス取得ステップ5 プラン変更ルート retrieveUpcoming()実行成功 invoices.retrieveUpcoming()で取得したインボイス",
        invoice
      );
      console.log("✅Stripe将来のインボイス取得ステップ6 プラン変更ルート 次回のインボイス取得完了 200で返す");

      res.status(200).json({ data: invoice, error: null });
    }
    // ======================= ✅プラン変更ルート ここまで =======================
    // ======================= 🌟例外ルート =======================
    else {
      console.log(
        "❌Stripe支払い方法取得ステップ4エラー 数量変更、プラン変更の両ルートどちらも当てはまらず",
        changeQuantity,
        changePlanName
      );
      throw new Error(`❌Stripe支払い方法取得ステップ4エラー 数量変更、プラン変更の両ルートどちらも当てはまらず`);
    }
    // ======================= ✅例外ルート ここまで =======================
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

export default retrieveUpcomingInvoiceHandler;
