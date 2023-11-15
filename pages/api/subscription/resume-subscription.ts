import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";
import jwt from "jsonwebtoken";
import { EmailTemplateChangeTeamOwner } from "@/components/Email/EmailTemplateChangeTeamOwner/EmailTemplateChangeTeamOwner";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/database.types";
import Stripe from "stripe";

const resend = new Resend(process.env.RESEND_API_KEY);

const resumeSubscriptionHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    console.log("❌POSTメソッドで受信できず");
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }

  const supabase = createServerSupabaseClient<Database>({
    req,
    res,
  });

  try {
    console.log("🌟Stripeメンバーシップ再開ステップ1 APIルートリクエスト取得");
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
    console.log("🌟Stripeメンバーシップ再開ステップ2 jwt.verify認証完了 payload", payload);
    const userId = payload.sub; // 'sub' field usually contains the user id.

    // axios.post()メソッドのリクエストボディから変数を取得
    const {
      stripeCustomerId,
      planId,
      quantity,
      companyId,
      dbSubscriptionId,
      paymentMethodId,
      isRequiredDeletion,
      deletedMemberSubscribedAccountIdsArray,
      deletedNotSetAccountQuantity,
    } = req.body;

    console.log(
      "🌟Stripeメンバーシップ再開ステップ3 追加するアカウント数とStripe顧客IDをリクエストボディから取得",
      "✅Stripe顧客ID",
      stripeCustomerId,
      "✅planId",
      planId,
      "✅quantity",
      quantity,
      "✅paymentMethodId",
      paymentMethodId,
      "✅companyId",
      companyId,
      "✅supabaseのdbSubscriptionId",
      dbSubscriptionId,
      "✅メンバーアカウント削除処理が必要か否か",
      isRequiredDeletion,
      "✅削除するメンバーのアカウントID(subscribed_accountsのid)",
      deletedMemberSubscribedAccountIdsArray,
      "✅削除が必要な余分な未設定アカウント数",
      deletedNotSetAccountQuantity
    );

    // Ensure stripeCustomerId is a string stripeCustomerIdが文字列であることを確認する。
    if (typeof stripeCustomerId !== "string") {
      console.log("❌Stripeメンバーシップ再開ステップ3-2 エラー: Invalid stripeCustomerId");
      res.status(400).json({ error: "❌Stripeメンバーシップ再開ステップ3-2 Invalid stripeCustomerId" });
      return;
    }
    // Ensure planId is a string planIdが文字列であることを確認する。
    if (typeof planId !== "string") {
      console.log("❌Stripeメンバーシップ再開ステップ3-2 エラー: Invalid planId");
      res.status(400).json({ error: "❌Stripeメンバーシップ再開ステップ3-2 Invalid planId" });
      return;
    }

    // Ensure newQuantity is a number newQuantityが存在し、newQuantityが数値型であることを確認する。
    if (!quantity || typeof quantity !== "number") {
      console.log("❌Stripeメンバーシップ再開ステップ3-2 エラー: Invalid quantity");
      return res.status(400).json({ error: "❌Stripeメンバーシップ再開ステップ3-2 Invalid quantity" });
    }

    // Ensure deletedNotSetAccountQuantity is a number deletedNotSetAccountQuantityが存在し、deletedNotSetAccountQuantityが数値型であることを確認する。
    if (typeof deletedNotSetAccountQuantity !== "number") {
      console.log("❌Stripeメンバーシップ再開ステップ3-2 エラー: Invalid deletedNotSetAccountQuantity");
      return res
        .status(400)
        .json({ error: "❌Stripeメンバーシップ再開ステップ3-2 Invalid deletedNotSetAccountQuantity" });
    }

    // Ensure paymentMethodId is a number paymentMethodIdが存在し、paymentMethodIdが数値型であることを確認する。
    if (!paymentMethodId || typeof paymentMethodId !== "string") {
      console.log("❌Stripeメンバーシップ再開ステップ3-2 エラー: Invalid paymentMethodId");
      return res.status(400).json({ error: "❌Stripeメンバーシップ再開ステップ3-2 Invalid paymentMethodId" });
    }

    // ==================== 🌟メンバーアカウントの削除が必要な場合 ====================
    // isRequiredDeletionがtrueの場合にのみ処理を実行
    if (isRequiredDeletion) {
      // 削除対象メンバーのprofilesのidに紐づくuser_idを持つsubscribed_accountsテーブルのデータを全て削除する
      // まずは削除するメンバーのsubscribed_accountsテーブルのidを保持する配列の全てのidがUUIDかどうかをチェックする
      const isValidUUIDv4 = (uuid: string): boolean => {
        return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(uuid);
      };
      if ((deletedMemberSubscribedAccountIdsArray as string[]).every((id) => id && isValidUUIDv4(id)) === false) {
        console.log("❌Stripeメンバーシップ再開ステップ4 エラー: Invalid deletedMemberSubscribedAccountIdsArray");
        return res
          .status(400)
          .json({ error: "❌Stripeメンバーシップ再開ステップ4 Invalid deletedMemberSubscribedAccountIdsArray" });
      }
      // 配列内の全てのidがUUIDのチェックが完了したら、削除対象となるメンバーのsubscribed_accountsテーブルデータを全て削除する
      // これをすることで、今回契約するアカウント数とsubscribed_accountsに紐づいているメンバーの数が揃うので、
      // subscriptionsテーブルのstripe_subscription_idをstripeで新たに作成するサブスクリプションオブジェクトのidをセットするだけで紐付けが完了する
      console.log(
        "🌟Stripeメンバーシップ再開ステップ4 今回はチームからメンバーの削除が必要 削除対象のメンバーのidを保持する配列のUUIDチェックも完了",
        deletedMemberSubscribedAccountIdsArray
      );
      const payload = {
        subscribed_account_ids_to_delete: deletedMemberSubscribedAccountIdsArray,
      };
      console.log(
        "🌟Stripeメンバーシップ再開ステップ5 rpcでメンバーアカウントの削除を実行 パラメータに渡すpayload",
        payload
      );
      const { error: deleteMEmberAccountError } = await supabase.rpc("delete_member_subscribed_accounts", payload);

      if (deleteMEmberAccountError) {
        console.log(
          "❌Stripeメンバーシップ再開ステップ5 メンバーアカウント削除失敗 エラー: ",
          deleteMEmberAccountError
        );
        return res
          .status(400)
          .json({
            error: `❌Stripeメンバーシップ再開ステップ5 メンバーアカウント削除失敗 ${deleteMEmberAccountError.message}`,
          });
      }
      console.log("🌟Stripeメンバーシップ再開ステップ5の結果 メンバーアカウントの削除が無事に成功");
    }
    // ==================== ✅メンバーアカウントの削除が必要な場合 ここまで ====================

    // ==================== 🌟今回の契約数を超えた未設定アカウントを全て削除 ====================
    // チーム所有者のsubscription_idに一致するuser_idがnullのsubscribed_accountsテーブルのデータを全て削除する
    // subscriptionテーブルのidに一致するsubscription_idを持つuser_idがnullのアカウントを全て削除
    if (deletedNotSetAccountQuantity > 0) {
      const deletePayload = {
        _subscription_id: dbSubscriptionId, // subscriptionsテーブルのid
        _delete_quantity: deletedNotSetAccountQuantity,
      };
      console.log(
        "🌟Stripeメンバーシップ再開ステップ6 契約数を超過した数量分の未設定のアカウントを全て削除する rpcに渡すpayload",
        deletePayload
      );
      const { error: deleteNotSetAccountError } = await supabase.rpc("delete_not_set_accounts", deletePayload);

      if (deleteNotSetAccountError) {
        console.log(
          "❌Stripeメンバーシップ再開ステップ6 メンバーアカウント削除失敗 エラー: ",
          deleteNotSetAccountError
        );
        return res.status(400).json({
          error: `❌Stripeメンバーシップ再開ステップ6の結果 未設定アカウント削除失敗 ${deleteNotSetAccountError.message}`,
        });
      }
      console.log("🌟Stripeメンバーシップ再開ステップ6の結果 未設定アカウントの削除が無事に成功");
    }

    // ==================== ✅今回の契約数を超えた未設定アカウントを全て削除 ここまで ====================

    // stripeインスタンスを作成
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2022-11-15",
    });

    // 顧客の以前の支払い方法リストを取得
    // const paymentMethods = await stripe.paymentMethods.list({
    //     customer: stripeCustomerId,
    //     type: 'card'
    // })

    // 新たなサブスクリプションを作成
    const newSubscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [
        {
          price: planId,
          quantity: quantity,
        },
      ],
      default_payment_method: paymentMethodId,
      proration_behavior: "none",
    });
    console.log("🌟Stripeサブスク再開ステップ4 新しいサブスクリプションの作成完了 newSubscription", newSubscription);

    const response = {
      data: newSubscription,
      error: null,
    };

    console.log("🌟Stripeサブスク再開ステップ5 全ての処理完了 200でAPIルートへ返却");

    res.status(200).json(response);
  } catch (error) {
    if ((error as Error).name === "JsonWebTokenError") {
      console.log("❌Invalid token");
      const response = {
        subscriptionItem: null,
        error: "Invalid token",
      };
      res.status(401).json(response);
    } else if ((error as Error).name === "TokenExpiredError") {
      console.log("❌Token has expired");

      const response = {
        subscriptionItem: null,
        error: "Token has expired",
      };
      res.status(401).json(response);
    } else {
      console.log(`❌予期せぬエラー: ${(error as Error).message}`);
      console.log(`❌エラーオブジェクト: ${error as Error}`);

      const response = {
        subscriptionItem: null,
        error: (error as Error).message,
      };
      res.status(401).json(response);
    }
  }
};

export default resumeSubscriptionHandler;
