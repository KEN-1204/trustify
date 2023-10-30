import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import jwt from "jsonwebtoken";

// profileテーブルがINSERTされた時にSupabaseのトリガー関数が実行され、リクエストがこのルートハンドラーに送信される
// リクエスト受信後、Stripeのcustomer.create()でStripeダッシュボードにカスタマーを作成し、
// 同時にsupabaseのprofileテーブルの該当ユーザーのstripe_customerの値をUPDATEクエリでStripeダッシュボードのカスタマーidと同期させる
const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  try {
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
    /**
      jwt.verify()メソッドは、トークンの検証に失敗した場合、例外（エラー）をスローします。そのため、成功した場合にはpayloadにデコードされたJWTのペイロードが返されますが、失敗した場合は特定の返り値を返すのではなく、エラーが発生します。

      したがって、トークンの検証が失敗した場合のハンドリングを行いたい場合は、try...catch構文を使用して例外をキャッチする
     */
    // トークンが有効なら payload にはトークンのペイロードが含まれます。
    // ここでユーザー情報や他のセッション情報を取得することができます。

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

    // res.send({ plans: sortedPlans });
    res.status(200).json({ plans: sortedPlans, error: null });
  } catch (error) {
    if ((error as Error).name === "JsonWebTokenError") {
      console.log("Invalid token");
      res.status(401).json({ plans: null, error: "Invalid token" });
    } else if ((error as Error).name === "TokenExpiredError") {
      console.log("Token has expired");
      res.status(401).json({ plans: null, error: "Token has expired" });
    } else {
      console.log(`stripe plans取得失敗 予期せぬエラー: ${(error as Error).message}`);
      res.status(500).json({ plans: null, error: (error as Error).message });
    }
  }
};

export default handler;
