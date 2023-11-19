import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import jwt from "jsonwebtoken";

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

    // Set proration date to this moment:
    const proration_date = Math.floor(Date.now() / 1000);
    console.log("💡比例配分の日付 proration_date", proration_date);

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
        subscription_proration_date: proration_date, // 現在の時間でプレビューを取得 => サブスクリプションを変更する際にプレビューした時に適用した比例配分と同じ日付をsubscription.update()のproration_dateに渡す
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
        subscription_proration_date: proration_date, // 現在の時間でプレビューを取得 => サブスクリプションを変更する際にプレビューした時に適用した比例配分と同じ日付をsubscription.update()のproration_dateに渡す
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
