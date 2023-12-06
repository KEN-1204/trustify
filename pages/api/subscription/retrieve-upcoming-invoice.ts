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
    const { stripeCustomerId, stripeSubscriptionId, changeQuantity, changePlanName, currentQuantity } = req.body;

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

    console.log("🌟Stripe将来のインボイス取得ステップ3 req.bodyから取得");
    console.log("💡stripe顧客id", stripeCustomerId);
    console.log("💡stripeサブスクリプションid", stripeSubscriptionId);
    console.log("💡changeQuantity", changeQuantity);
    console.log("💡changePlanName", changePlanName);
    console.log("💡プラン変更用 currentQuantity", currentQuantity);

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2022-11-15",
    });

    console.log("🌟Stripe将来のインボイス取得ステップ3 stripe.subscriptions.retrieve()実行");
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
    console.log("🔥Stripe将来のインボイス取得ステップ3 retrieve()結果 subscription", subscription);

    const priceId = (subscription as Stripe.Subscription).items.data[0].price.id;
    console.log("💡契約中のサブスクリプション価格id", priceId);

    // ======================= 🌟current_period_endの時間分秒を一緒にしてからproration_dateに渡すパターン
    // 時間分秒を揃えないとStripeの比例配分は秒割りのため
    // const current = new Date(); // 現在の日付
    // const timeClockCurrentDate = new Date(2023, 11, 19); // JavaScriptの月は0から始まるため、12月は11となります
    // const timeClockCurrentDate = new Date(2025, 3, 27); // JavaScriptの月は0から始まるため、12月は11となります 1月は0月
    const timeClockCurrentDate = new Date("2025-9-20"); // テストクロック JavaScriptの月は0から始まるため、12月は11となります 1月は0月
    console.log(
      "💡タイムクロックの現在の日付 timeClockCurrentDate",
      format(timeClockCurrentDate, "yyyy/MM/dd HH:mm:ss")
    ); // 出力: 2023-12-19T00:00:00.000Z（タイムゾーンによっては異なる表示になる場合があります）

    const currentEndTime = new Date(subscription.current_period_end * 1000); // サブスクリプション期間終了時の日時 「* 1000」はUNIXタイムスタンプ（秒単位）に変換

    // 現在の請求期間の終了日 2023/12/19 20:57:49
    // 日付までは現在の日付で、時間分秒はcurrent_period_endの終了日の時間分秒で置換するパターン
    const prorationDate = new Date(
      timeClockCurrentDate.getFullYear(),
      timeClockCurrentDate.getMonth(),
      timeClockCurrentDate.getDate(),
      currentEndTime.getHours(),
      currentEndTime.getMinutes(),
      currentEndTime.getSeconds()
    );

    const prorationTimestamp = Math.floor(prorationDate.getTime() / 1000);

    console.log(
      "💡比例配分の日付 現在の日付に期間終了日の時間分秒を渡したprorationTimestamp",
      format(new Date(prorationTimestamp * 1000), "yyyy/MM/dd HH:mm:ss"),
      prorationTimestamp
    );

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
          "❌Stripe将来のインボイス取得ステップ4実行エラー 数量変更ルート invoices.retrieveUpcoming()でインボイス取得できず",
          invoice
        );
        const response = {
          data: null,
          error:
            "❌Stripe将来のインボイス取得ステップ4実行エラー 数量変更ルート invoices.retrieveUpcoming()でインボイス取得できず",
        };
        return res.status(400).json(response);
      }
      console.log("🔥Stripe将来のインボイス取得ステップ5 数量変更ルート retrieveUpcoming()成功結果", invoice);
      // テスト確認用
      invoice.lines.data.forEach((item, i) => console.log(`💡retrieveUpcoming()結果 invoice.lines.data[${i}]`, item));
      // const resultRetrieveUpcoming = async (item: Stripe.InvoiceLineItem, i: number) =>
      //   new Promise((resolve) =>
      //     setTimeout(() => {
      //       console.log(`💡retrieveUpcoming()結果 invoice.lines.data[${i}]`, item);
      //       resolve(item);
      //     }, 10)
      //   );
      // const promises = invoice.lines.data.map((item, i) => resultRetrieveUpcoming(item, i));
      // await Promise.all(promises);
      // テスト確認用 ここまで
      console.log(
        "💡retrieveUpcoming()結果 invoice.period_start",
        format(new Date(invoice.period_start * 1000), "yyyy/MM/dd HH:mm:ss"),
        invoice.period_start
      );
      console.log(
        "💡retrieveUpcoming()結果 invoice.period_end",
        format(new Date(invoice.period_end * 1000), "yyyy/MM/dd HH:mm:ss"),
        invoice.period_end
      );
      console.log(
        "💡比例配分の日付 subscription_proration_date",
        format(new Date(prorationTimestamp * 1000), "yyyy/MM/dd HH:mm:ss"),
        prorationTimestamp
      );
      // 🌟２回目以上のアップデートだった場合は分岐させる
      const invoiceItemList = invoice.lines.data.filter((item) => item.type === "invoiceitem");
      console.log(
        "🌟invoiceのline_itemのinvoiceitemの数量で初回変更か否かを分岐 invoiceitem個数 invoiceItemList.length",
        invoiceItemList.length
      );
      // ========================= 🌟初回変更 =========================
      if (invoiceItemList.length === 2) {
        console.log("🌟Stripe将来のインボイス取得ステップ5 数量変更ルート invoiceitem個数2個 初回変更");
        console.log(
          "※プランダウングレードスケジュールが存在する場合には数量は現在のアカウント数の状態でinvoiceが取得される"
        );
        console.log(
          "💡新プランの料金:invoice?.lines?.data[invoice?.lines?.data.length - 1]?.amount",
          invoice?.lines?.data[invoice?.lines?.data.length - 1]?.amount
        );
        console.log(
          "💡新プランの数量:invoice?.lines?.data[invoice?.lines?.data.length - 1]?.quantity",
          invoice?.lines?.data[invoice?.lines?.data.length - 1]?.quantity
        );
        console.log(
          "💡新プランの単価:invoice?.lines?.data[invoice?.lines?.data.length - 1]?.plan?.amount",
          invoice?.lines?.data[invoice?.lines?.data.length - 1]?.plan?.amount
        );
        console.log(
          "💡残り期間までの旧プラン未使用分:invoice?.lines?.data[0]?.amount",
          invoice?.lines?.data[0]?.amount
        );
        console.log("💡残り期間までの新プラン使用料金", invoice?.lines?.data[1]?.amount);
        console.log(
          `追加料金の合計 ${invoice?.lines?.data[1]?.amount} ${invoice?.lines?.data[0]?.amount < 0 ? `` : `+`} ${
            invoice?.lines?.data[0]?.amount
          } =`,
          invoice?.lines?.data[1]?.amount + invoice?.lines?.data[0]?.amount
        );
        console.log(`💡次回請求総額:invoice?.amount_due`, invoice?.amount_due);
      }
      // ========================= 🌟変更2回目以上 =========================
      else if (invoiceItemList.length > 2) {
        console.log("🌟Stripe将来のインボイス取得ステップ5 数量変更ルート invoiceitem個数2個以上 変更2回目以上");
        console.log(
          "※プランダウングレードスケジュールが存在する場合には数量は現在のアカウント数の状態でinvoiceが取得される"
        );
        // ======================= 配列分割テスト =======================
        // const middleIndex = invoiceItemList.length / 2; // 真ん中のインデックスを把握
        // const firstHalfInvoiceItemList = invoiceItemList.slice(0, middleIndex);
        // const secondHalfInvoiceItemList = invoiceItemList.slice(middleIndex);
        const firstHalfInvoiceItemList = invoiceItemList
          .filter((item) => item.description?.startsWith("Unused"))
          .sort((a, b) => (a.quantity ?? 0) - (b.quantity ?? 0));
        const secondHalfInvoiceItemList = invoiceItemList
          .filter((item) => item.description?.startsWith("Remaining"))
          .sort((a, b) => (a.quantity ?? 0) - (b.quantity ?? 0));
        // ======================= 配列分割テスト =======================
        const sumOldUnused = firstHalfInvoiceItemList.reduce(
          (accumulator, currentValue) => accumulator + currentValue.amount,
          0
        );
        const sumNewUsage = secondHalfInvoiceItemList.reduce(
          (accumulator, currentValue) => accumulator + currentValue.amount,
          0
        );
        console.log(
          "💡新プランの料金:invoice?.lines?.data[invoice?.lines?.data.length - 1]?.amount",
          invoice?.lines?.data[invoice?.lines?.data.length - 1]?.amount
        );
        console.log(
          "💡新プランの数量:invoice?.lines?.data[invoice?.lines?.data.length - 1]?.quantity",
          invoice?.lines?.data[invoice?.lines?.data.length - 1]?.quantity
        );
        console.log(
          "💡新プランの単価:invoice?.lines?.data[invoice?.lines?.data.length - 1]?.plan?.amount",
          invoice?.lines?.data[invoice?.lines?.data.length - 1]?.plan?.amount
        );
        console.log("💡残り期間までの旧プラン未使用分の合計(2回目以上のアップデート) sumOldUnused", sumOldUnused);
        console.log("💡残り期間までの新プラン使用料金の合計(2回目以上のアップデート) sumNewUsage", sumNewUsage);
        const sumExtraCharge = sumNewUsage + sumOldUnused;
        console.log(`💡追加料金の合計:sumExtraCharge`, sumExtraCharge);
        console.log(`💡次回請求総額:invoice?.amount_due`, invoice?.amount_due);
      }

      console.log("✅Stripe将来のインボイス取得ステップ6 数量変更ルート 次回のインボイス取得完了 200で返す");

      res.status(200).json({ data: invoice, error: null });
    }
    // ======================= ✅数量変更ルート ここまで =======================
    // ======================= 🌟プラン変更ルート =======================
    else if (changeQuantity === null && !!changePlanName) {
      const newPlanId = (changePlanName: string) => {
        switch (changePlanName) {
          case "business_plan":
            return process.env.STRIPE_BUSINESS_PLAN_PRICE_ID;
            break;
          case "premium_plan":
            return process.env.STRIPE_PREMIUM_PLAN_PRICE_ID;
            break;
        }
      };
      // 🔹プランアップグレードルート
      if (changePlanName === "premium_plan") {
        // See what the next invoice would look like with a price switch
        // and proration set:
        const items = [
          {
            id: subscription.items.data[0].id,
            price: newPlanId(changePlanName), // Switch to new price
            quantity: currentQuantity,
          },
        ];
        console.log("🌟Stripe将来のインボイス取得ステップ4 プランアップグレードルート retrieveUpcoming()を実行 ");
        console.log("💡subscription_itemsに渡すitems", items);
        console.log("💡prorationTimestamp", prorationTimestamp);
        const invoice = await stripe.invoices.retrieveUpcoming({
          customer: stripeCustomerId,
          subscription: subscription.id,
          subscription_items: items,
          subscription_proration_date: prorationTimestamp, // 現在の時間でプレビューを取得 => サブスクリプションを変更する際にプレビューした時に適用した比例配分と同じ日付をsubscription.update()のproration_dateに渡す
        });

        if (!invoice) {
          console.log(
            "❌Stripe将来のインボイス取得ステップ5実行エラー プランアップグレードルート invoices.retrieveUpcoming()でインボイス取得できず",
            invoice
          );
          const response = {
            data: null,
            error:
              "❌Stripe将来のインボイス取得ステップ5実行エラー プランアップグレードルート invoices.retrieveUpcoming()でインボイス取得できず",
          };
          return res.status(400).json(response);
        }
        console.log(
          "🔥Stripe将来のインボイス取得ステップ5 プランアップグレードルート retrieveUpcoming()実行成功 invoices.retrieveUpcoming()で取得したインボイス",
          invoice
        );
        invoice.lines.data.forEach((item, i) => console.log(`💡retrieveUpcoming()結果 invoice.lines.data[${i}]`, item));
        console.log(
          "💡取得した次回のinvoice.period_start",
          format(new Date(invoice.period_start * 1000), "yyyy/MM/dd HH:mm:ss")
        );
        console.log(
          "💡取得した次回のinvoice.period_end",
          format(new Date(invoice.period_end * 1000), "yyyy/MM/dd HH:mm:ss")
        );
        console.log(
          "💡比例配分の日付 subscription_proration_date",
          format(new Date(prorationTimestamp * 1000), "yyyy/MM/dd HH:mm:ss")
        );
        console.log(
          "✅Stripe将来のインボイス取得ステップ6 プランアップグレードルート 次回のインボイス取得完了 200で返す"
        );

        res.status(200).json({ data: invoice, error: null });
      }
      // 🔹プランダウングレードルート
      else if (changePlanName === "business_plan") {
        // See what the next invoice would look like with a price switch
        // and proration set:
        const items = [
          {
            id: subscription.items.data[0].id,
            price: newPlanId(changePlanName), // Switch to new price
            quantity: currentQuantity,
          },
        ];
        console.log("🌟Stripe将来のインボイス取得ステップ4 プランダウングレードルート retrieveUpcoming()を実行 ");
        console.log("💡subscription_itemsに渡すitems", items);
        console.log("💡prorationTimestamp", prorationTimestamp);
        const invoice = await stripe.invoices.retrieveUpcoming({
          customer: stripeCustomerId,
          subscription: subscription.id,
          subscription_items: items,
          // subscription_proration_date: prorationTimestamp, //
          subscription_proration_behavior: "none",
        });

        if (!invoice) {
          console.log(
            "❌Stripe将来のインボイス取得ステップ5実行エラー プランダウングレードルート invoices.retrieveUpcoming()でインボイス取得できず",
            invoice
          );
          const response = {
            data: null,
            error:
              "❌Stripe将来のインボイス取得ステップ5実行エラー プランダウングレードルート invoices.retrieveUpcoming()でインボイス取得できず",
          };
          return res.status(400).json(response);
        }
        console.log(
          "🔥Stripe将来のインボイス取得ステップ5 プランダウングレードルート retrieveUpcoming()実行成功 invoices.retrieveUpcoming()で取得したインボイス",
          invoice
        );
        invoice.lines.data.forEach((item, i) => console.log(`💡retrieveUpcoming()結果 invoice.lines.data[${i}]`, item));
        console.log(
          "💡retrieveUpcoming()結果 新プランinvoice.lines.data[invoice.lines.data.length - 1]",
          invoice.lines.data[invoice.lines.data.length - 1]
        );
        console.log(
          "💡retrieveUpcoming()結果 invoice.period_start",
          format(new Date(invoice.period_start * 1000), "yyyy/MM/dd HH:mm:ss")
        );
        console.log(
          "💡retrieveUpcoming()結果 invoice.period_end",
          format(new Date(invoice.period_end * 1000), "yyyy/MM/dd HH:mm:ss")
        );
        console.log(
          "💡比例配分の日付 subscription_proration_date",
          format(new Date(prorationTimestamp * 1000), "yyyy/MM/dd HH:mm:ss")
        );
        console.log(
          "✅Stripe将来のインボイス取得ステップ6 プランダウングレードルート 次回のインボイス取得完了 200で返す"
        );

        res.status(200).json({ data: invoice, error: null });
      }
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
