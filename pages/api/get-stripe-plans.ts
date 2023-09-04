import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

// サーバーサイド用supabaseクライアント
// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!, // パブリックURL
//   process.env.SUPABASE_SERVICE_ROLE_KEY! // サーバーサイド専用ロールキー
// );

// profileテーブルがINSERTされた時にSupabaseのトリガー関数が実行され、リクエストがこのルートハンドラーに送信される
// リクエスト受信後、Stripeのcustomer.create()でStripeダッシュボードにカスタマーを作成し、
// 同時にsupabaseのprofileテーブルの該当ユーザーのstripe_customerの値をUPDATEクエリでStripeダッシュボードのカスタマーidと同期させる
const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2022-11-15",
    });

    const { data: prices } = await stripe.prices.list();

    const plans = await Promise.all(
      prices.map(async (price: any) => {
        const product = await stripe.products.retrieve(price.product);
        return {
          id: price.id,
          name: product.name,
          price: price.unit_amount,
          interval: price.recurring?.interval,
          currency: price.currency,
        };
      })
    );

    const sortedPlans = plans.sort((a, b) => a.price - b.price);

    console.log(
      "🌟apiルート get-stripe-plansハンドラー",
      //   "stripe",
      //   stripe,
      "prices",
      prices,
      //   "plans",
      //   plans,
      "sortedPlans",
      sortedPlans
    );

    res.send({ plans: sortedPlans });
  } catch (error) {
    console.log("❌stripe plans取得失敗", error);
    return res.status(400).send(`stripe plans取得 error: ${(error as Error).message}`);
  }
  //   res.status(200).json({ name: "KEN" });
};

export default handler;
