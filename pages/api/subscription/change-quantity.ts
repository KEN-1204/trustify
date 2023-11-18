import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/database.types";
import Stripe from "stripe";
import { dateJST } from "@/utils/Helpers/dateJST";
import { format } from "date-fns";
import { StripeSchedule } from "@/types";

const changeQuantityHandler = async (req: NextApiRequest, res: NextApiResponse) => {
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
    console.log("🌟Stripe数量変更ステップ1 APIルートリクエスト取得");
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
    console.log("🌟Stripe数量変更ステップ2 jwt.verify認証完了 payload", payload);
    const userId = payload.sub; // 'sub' field usually contains the user id.

    // axios.post()メソッドのリクエストボディから変数を取得
    const {
      stripeCustomerId,
      newQuantity,
      changeType,
      companyId,
      subscriptionId,
      userProfileId,
      alreadyHaveSchedule,
      deleteAccountRequestSchedule,
    } = req.body;

    console.log(
      "🌟Stripe数量変更ステップ3 追加するアカウント数とStripe顧客IDをリクエストボディから取得 ",

      "Stripe顧客ID",
      stripeCustomerId
    );
    console.log("✅changeType", changeType);
    console.log("✅削除リクエストスケジュールが既にあるかどうか", alreadyHaveSchedule);
    console.log("✅削除リクエストスケジュール", deleteAccountRequestSchedule);

    // Ensure stripeCustomerId is a string stripeCustomerIdが文字列であることを確認する。
    if (typeof stripeCustomerId !== "string") {
      res.status(400).json({ error: "Invalid stripeCustomerId" });
      return;
    }

    // Ensure newQuantity is a number newQuantityが存在し、newQuantityが数値型であることを確認する。
    if (!newQuantity || typeof newQuantity !== "number") {
      console.log("エラー: Invalid newQuantity");
      return res.status(400).json({ error: "Invalid newQuantity" });
    }

    // stripeインスタンスを作成
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2022-11-15",
    });

    // Stripe顧客IDからサブスクリプションを取得
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
    });

    console.log("🌟Stripe数量変更ステップ3-2 Stripeから取得したsubscriptions", subscriptions);

    // サブスクリプションID
    const stripeSubscriptionId = subscriptions.data[0].id;
    // 現在のプランの開始日
    const currentPeriodStart = subscriptions.data[0].current_period_start;
    // 次の請求日を取得
    const nextInvoiceTimestamp = subscriptions.data[0].current_period_end;
    // ユーザーが現在契約しているサブスクリップションアイテムのidを取得
    const subscriptionItemId = subscriptions.data[0].items.data[0].id;
    // ユーザーが現在契約しているサブスクリップションの価格idを取得
    const subscriptionCurrentPriceId = subscriptions.data[0].items.data[0].price.id;
    // ユーザーが現在契約しているサブスクリップションのプランの価格を取得
    const subscriptionCurrentPriceUnitAmount = subscriptions.data[0].items.data[0].price.unit_amount;
    // ユーザーが現在契約しているサブスクリップションの数量
    const subscriptionCurrentQuantity = subscriptions.data[0].items.data[0].quantity;

    console.log("🌟Stripe数量変更ステップ4 Stripeの顧客IDから各アイテム取得");
    console.log("💡changeType", changeType);
    console.log("💡サブスクリプションID", stripeSubscriptionId);
    console.log("💡サブスクアイテムID", subscriptionItemId);
    console.log("💡現在契約中の価格ID", subscriptionCurrentPriceId);
    console.log("💡現在契約中の数量", subscriptionCurrentQuantity);
    console.log("💡現在のプランの開始日", new Date(currentPeriodStart));
    console.log("💡現在のプランの終了日", new Date(nextInvoiceTimestamp));
    // console.log("✅スケジュールID", scheduleId);

    // =================== 比例配分なし 数量ダウンルート ===================
    // 🌟サブスクリプションの数量を増やすルート
    // ・新しいプランは即座に適用される。
    // ・請求タイミング（請求日）は、現在の請求日より早くなる。（これは必須ではないため現段階では現在の請求日のまま早めず）
    // ・アカウントを増やすから実行したとしても、前回数量を減らすスケジュールを作成していて現在契約しているアカウント数が今回アカウントを増やす個数の合計よりも低い場合は、前のスケジュールをキャンセルして新たに減らすルートに移行して次回請求日に今回のアカウントを増やすアカウントの合計値に更新するようにスケジュールを作成する
    // 例：現在アカウント数:3(11/1), => 1にダウン(12/1に適用) => 2にアップ(即時ではなく12/1に適用させる)
    // Point：アカウントを増やした時の合計値が、現在のアカウント数を超えているか

    // ✅クレジットカード支払いになるから即時請求しても顧客が実際に請求されるのは１ヶ月遅れのクレカ引き落とし日の26日になるので、即時請求してOK
    // なので、数量を増やした時にすぐに追加のアカウント980円分を請求できれば、減らす時に次の月はそのままproration: noneでOK
    if (changeType === "increase") {
      const subscription = await stripe.subscriptions.update(stripeSubscriptionId, {
        items: [
          {
            id: subscriptionItemId,
            quantity: newQuantity,
          },
        ],
        // proration_behavior: "none",
        proration_behavior: "create_prorations",
        billing_cycle_anchor: "unchanged",
      });
      console.log("🌟Stripeステップ数量アップルート5 UPDATE完了 subscription", subscription);

      const response = {
        subscriptionItem: subscription,
        error: null,
      };

      console.log("🌟Stripeステップ数量アップルート6 APIルートへ返却");

      res.status(200).json(response);
    }
    // 🌟サブスクリプションの数量を減らすルート
    // ・新しいプランは即座に適用されない。
    // ・ダウングレードが実際に適用されるのは、現在のプランの次回請求が確定した後。
    // ・次回請求日には、現在の（ダウングレードする前の）プランの金額で請求される。
    // ・アカウントを増やすから実行したとしても、前回数量を減らすスケジュールを作成していて現在契約しているアカウント数が今回アカウントを増やす個数の合計よりも低い場合は、減らすルートに移行して次回請求日に今回のアカウントを増やすアカウントの合計値に更新するようにスケジュールを作成する
    else if (changeType === "decrease") {
      // ============================ 🌟即時に数量を減らすルート ============================
      // const subscription = await stripe.subscriptions.update(stripeSubscriptionId, {
      //   items: [
      //     {
      //       id: subscriptionItemId,
      //       quantity: newQuantity,
      //     },
      //   ],
      //   proration_behavior: "none",
      //   // proration_date: nextInvoiceTimestamp,
      //   // proration_behavior: "create_prorations",
      //   // billing_cycle_anchor: "now",
      // });
      // console.log("🌟Stripeアカウント数量減らすステップ5 数量アップルート UPDATE完了 subscription", subscription);

      // const response = {
      //   subscriptionItem: subscription,
      //   error: null,
      // };

      // console.log("✅Stripeアカウント数量減らすステップ6 APIルートへ返却");

      // res.status(200).json(response);
      // ============================ ✅即時に数量を減らすルート ここまで ============================
      // ============================ 🌟スケジュール数量を減らすルート ============================
      // スケジュール動作確認用
      const currentTimestamp = Math.floor(Date.now() / 1000); // 現在のUNIXタイムスタンプを取得
      const fiveMinutesLater = currentTimestamp + 600; // 10分後のUNIXタイムスタンプを計算
      // console.log("🌟Stripeステップ5-0 数量ダウンルート 動作確認用に10分後のタイムスタンプを取得", fiveMinutesLater);
      // サブスクリプションに紐づくスケジュール 存在していない場合はcreate()で新たに作成する
      const scheduleId = subscriptions.data[0].schedule;
      // stripe.subscriptions.list()で取得した顧客が現在契約しているサブスクリプションオブジェクトが保持しているスケジュールid
      console.log("🌟Stripeアカウント数量減らすステップ5-0 数量ダウンルート スケジュールid", scheduleId);

      // Create a subscription schedule with the existing subscription
      let scheduleData; // create()で作成したスケジュールオブジェクトの保持用変数
      // 契約中のサブスクリプションオブジェクトにスケジュールオブジェクトがアタッチされていない場合はcreate()で作成
      if (!scheduleId) {
        scheduleData = await stripe.subscriptionSchedules.create({
          from_subscription: stripeSubscriptionId, // "sub_ERf72J8Sc7qx7D"
        });
      }
      // 契約中のサブスクリプションオブジェクトに既にスケジュールオブジェクトが存在するならリリースして解放してから新たにスケジュールオブジェクトを新しく作成
      else {
        const releaseSchedule = await stripe.subscriptionSchedules.release(scheduleId as string);
        // schedule = await stripe.subscriptionSchedules.retrieve(scheduleId as string);
        console.log(
          "🌟Stripeアカウント数量減らすステップ5-01 既にスケジュールidが存在したためスケジュールをリリース リリースしたスケジュールオブジェクト: ",
          releaseSchedule
        );
        scheduleData = await stripe.subscriptionSchedules.create({
          from_subscription: stripeSubscriptionId, // "sub_ERf72J8Sc7qx7D"
        });
      }
      console.log(
        "🌟Stripeアカウント数量減らすステップ5-1 数量ダウンルート 契約中のサブスクリプションIDでサブスクリプションスケジュールオブジェクトを作成",
        scheduleData
      );
      // console.log(JSON.stringify(scheduleData, null, 2));
      console.log(
        "💡スケジュールの現在のフェーズの開始日タイムスタンプ scheduleData.phases[0].start_date",
        scheduleData.phases[0].start_date
      );
      console.log(
        "💡スケジュールの現在のフェーズの終了日タイムスタンプ scheduleData.phases[0].end_date",
        scheduleData.phases[0].end_date
      );
      console.log(
        "💡現在のサブスクリプションに作成されたスケジュールの現在のフェーズの開始日: ",
        format(dateJST(scheduleData.phases[0].start_date), "yyyy/MM/dd HH:mm:ss")
      );
      console.log(
        "💡現在のサブスクリプションに作成されたスケジュールの現在のフェーズの終了日: ",
        format(dateJST(scheduleData.phases[0].end_date), "yyyy/MM/dd HH:mm:ss")
      );

      console.log(
        "🌟Stripeアカウント数量減らすステップ5-2 数量ダウンルート 作成したサブスクリプションスケジュールオブジェクトをstripe.subscriptionSchedules.update()で次回フェーズの開始日に新たな数量に変更されるようスケジュールを更新する"
      );
      // console.log("✅現在の価格プランid", subscriptionCurrentPriceId);
      // console.log("✅現在の数量", subscriptionCurrentQuantity);
      // console.log("✅更新後の数量", newQuantity);
      // Update the schedule with the new phase
      // 動作確認用 今月の終了日をend_dateで5分後に設定し、翌月の開始日をstart_dateで5分後に設定してすぐに動作確認できるようにする
      // const subscriptionSchedule = await stripe.subscriptionSchedules.update(schedule.id, {
      //   phases: [
      //     {
      //       items: [
      //         {
      //           // price: schedule.phases[0].items[0].price,
      //           // quantity: schedule.phases[0].items[0].quantity,
      //           price: subscriptionCurrentPriceId, // 現在の価格プラン
      //           quantity: subscriptionCurrentQuantity, // 更新前の現在の数量
      //         },
      //       ],
      //       start_date: schedule.phases[0].start_date,
      //       end_date: schedule.phases[0].end_date, // 本番はこっち
      //       // end_date: fiveMinutesLater, // 動作確認用 今月のサブスクを5分後に終了させ翌月のサブスクに更新する
      //       proration_behavior: "none",
      //     },
      //     {
      //       items: [
      //         {
      //           price: subscriptionCurrentPriceId, // 現在の価格プラン
      //           quantity: newQuantity, // 新たにダウンした数量
      //         },
      //       ],
      //       // start_date: fiveMinutesLater, // 動作確認用 翌月のサブスクを5分後に設定 本番は省略
      //       iterations: 1, // 省略
      //       proration_behavior: "none",
      //     },
      //   ],
      // });

      // 数量をダウングレードした際は、
      // ・次回請求日まで変更前の数量が適用される
      // ・次回請求日以降(次回請求期間開始日以降)は減らした新たな数量が適用され、
      // これを適用するか検討：(その料金は新数量適用後の次の支払日（現在から次の次）に適用される)

      const subscriptionSchedule = await stripe.subscriptionSchedules.update(scheduleData.id, {
        phases: [
          {
            items: [
              {
                price: subscriptionCurrentPriceId, // 現在の価格プラン
                quantity: subscriptionCurrentQuantity, // 更新前の現在の数量
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
                price: subscriptionCurrentPriceId, // 現在の価格プラン
                quantity: newQuantity, // 新たにダウンした数量
              },
            ],
            iterations: 1,
            proration_behavior: "none", // 新たに減らした数量を前払い(請求期間の開始日に支払い完了)
            // billing_cycle_anchor: "phase_start",
          },
        ],
      });

      console.log(
        "🌟Stripeアカウント数量減らすステップ5-3 数量ダウンルート サブスクリプションスケジュールのUPDATE完了 subscriptionSchedule",
        subscriptionSchedule
      );
      console.log("✅スケジュールのステータス", subscriptionSchedule.status);
      console.log(
        "💡スケジュールの初回フェーズの開始日",
        format(new Date(subscriptionSchedule.phases[0].start_date * 1000), "yyyy/MM/dd HH:mm:ss")
      );
      console.log(
        "💡スケジュールの初回フェーズの終了日",
        format(new Date(subscriptionSchedule.phases[0].end_date * 1000), "yyyy/MM/dd HH:mm:ss")
      );
      console.log(
        "💡スケジュールの次回フェーズの開始日",
        format(new Date(subscriptionSchedule.phases[1].start_date * 1000), "yyyy/MM/dd HH:mm:ss")
      );
      console.log(
        "💡スケジュールの次回フェーズの終了日",
        format(new Date(subscriptionSchedule.phases[1].end_date * 1000), "yyyy/MM/dd HH:mm:ss")
      );
      console.log("💡現在のフェーズのアイテム", subscriptionSchedule.phases[0].items);
      console.log("💡翌月のフェーズのアイテム", subscriptionSchedule.phases[1].items);

      // ======================== supabaseのスケジュールテーブルにまだ存在しない場合のルート
      if (!alreadyHaveSchedule) {
        // Stripeのサブスクリプションスケジュールの数量削減リクエスト、更新用にスケジュールidなどをsupabaseのstripe_schedulesテーブルにINSERT
        const insertPayload = {
          stripe_customer_id: stripeCustomerId,
          stripe_schedule_id: subscriptionSchedule.id,
          schedule_status: "active", // subscriptionSchedule.statusはnot_startedとactiveのタイミングが不明なので、stripe_schedulesテーブルには作成時からactiveをINSERT
          stripe_subscription_id: stripeSubscriptionId,
          stripe_subscription_item_id: subscriptionItemId,
          current_price_id: subscriptionCurrentPriceId,
          scheduled_price_id: null, // プラン(価格)は変わらないのでidも変わらずscheduledは無し
          current_quantity: subscriptionCurrentQuantity,
          scheduled_quantity: newQuantity, // 新たな数量をscheduledに渡す
          note: null, // 注意書きはなし
          update_reason: null,
          canceled_at: subscriptionSchedule.canceled_at,
          company_id: companyId,
          subscription_id: subscriptionId,
          current_price: subscriptionCurrentPriceUnitAmount,
          scheduled_price: null, // 数量変更なのでpriceは変わらず
          completed_at: subscriptionSchedule.completed_at
            ? new Date(subscriptionSchedule.completed_at * 1000).toISOString()
            : null,
          stripe_created: subscriptionSchedule.created
            ? new Date(subscriptionSchedule.created * 1000).toISOString()
            : null,
          user_id: userProfileId,
          current_start_date: subscriptionSchedule.phases[0].start_date
            ? new Date(subscriptionSchedule.phases[0].start_date * 1000).toISOString()
            : null,
          current_end_date: subscriptionSchedule.phases[0].end_date
            ? new Date(subscriptionSchedule.phases[0].end_date * 1000).toISOString()
            : null,
          released_at: subscriptionSchedule.released_at
            ? new Date(subscriptionSchedule.released_at * 1000).toISOString()
            : null,
          end_behavior: subscriptionSchedule.end_behavior,
          released_subscription: subscriptionSchedule.released_subscription,
          type: "change_quantity",
        };
        console.log(
          "🌟Stripeアカウント数量減らすステップ5-4 数量ダウンルート stripe_schedulesテーブルにINSERTするペイロード",
          insertPayload
        );

        // UNIXタイムスタンプをJavaScriptのDateオブジェクトに変換する際には、ミリ秒単位に変換する必要があります。そのため、タイムスタンプを1000倍にしなければなりません。その後、.toISOString()を使用してISO形式の文字列に変換します。
        const { data: insertScheduleData, error: insertScheduleError } = await supabaseServerClient
          .from("stripe_schedules")
          .insert(insertPayload)
          .select()
          .single();

        if (insertScheduleError) {
          console.error(
            "❌Stripeアカウント数量減らすステップ5-5 supabaseのstripe_schedulesテーブルへINSERTクエリ失敗error",
            insertScheduleError
          );
          return res.status(400).json({
            error: "❌Stripeアカウント数量減らすステップ5-5 supabaseのstripe_schedulesテーブルへINSERTクエリ失敗error",
          });
          // throw new Error(insertScheduleError.message);
        }

        console.log(
          "🌟Stripeアカウント数量減らすステップ5-5 数量ダウンルート Supabaseのstripe_schedulesテーブルにINSERT完了 insertScheduleData",
          insertScheduleData
        );

        const response = {
          subscriptionItem: subscriptionSchedule,
          error: null,
        };

        console.log("✅Stripeアカウント数量減らすステップ6 APIルートへ返却");

        res.status(200).json(response);
      }
      // ======================== supabaseのスケジュールテーブルにまだ存在しない場合のルート
      else if (alreadyHaveSchedule && (deleteAccountRequestSchedule as StripeSchedule) !== null) {
        // Ensure newQuantity is a number newQuantityが存在し、newQuantityが数値型であることを確認する。
        if (
          !deleteAccountRequestSchedule ||
          (deleteAccountRequestSchedule as StripeSchedule).scheduled_quantity !== null ||
          typeof (deleteAccountRequestSchedule as StripeSchedule).scheduled_quantity !== "number"
        ) {
          console.log("エラー: Invalid scheduled_quantity");
          return res.status(400).json({ error: "Invalid scheduled_quantity" });
        }
        // 既に数量削減リクエストのスケジュールが受付されている後に、追加で削減する数量を増やす場合に、
        // supabaseのstripe_schedulesテーブルのデータの削減後の数量を更新する
        const currentScheduledQuantity = (deleteAccountRequestSchedule as StripeSchedule).scheduled_quantity;
        const newQuantityAfterDelete = newQuantity + currentScheduledQuantity!;
        const updateSchedulePayload = {
          // stripe_customer_id: stripeCustomerId,
          // // stripe_schedule_id: subscriptionSchedule.id,
          // schedule_status: "active",
          // stripe_subscription_id: stripeSubscriptionId,
          // stripe_subscription_item_id: subscriptionItemId,
          // current_price_id: subscriptionCurrentPriceId,
          // scheduled_price_id: null,
          // current_quantity: subscriptionCurrentQuantity,
          scheduled_quantity: newQuantityAfterDelete, // 前回の削減後の数量に今回追加する削減する数量を加えた値
          // note: null, // 注意書きはなし
          // update_reason: null,
          // canceled_at: subscriptionSchedule.canceled_at,
          // company_id: companyId,
          // subscription_id: subscriptionId,
          // current_price: subscriptionCurrentPriceUnitAmount,
          // scheduled_price: null, // 数量変更なのでpriceは変わらず
          // completed_at: subscriptionSchedule.completed_at
          //   ? new Date(subscriptionSchedule.completed_at * 1000).toISOString()
          //   : null,
          // stripe_created: subscriptionSchedule.created
          //   ? new Date(subscriptionSchedule.created * 1000).toISOString()
          //   : null,
          // user_id: userProfileId,
          // current_start_date: subscriptionSchedule.phases[0].start_date
          //   ? new Date(subscriptionSchedule.phases[0].start_date * 1000).toISOString()
          //   : null,
          // current_end_date: subscriptionSchedule.phases[0].end_date
          //   ? new Date(subscriptionSchedule.phases[0].end_date * 1000).toISOString()
          //   : null,
          // released_at: subscriptionSchedule.released_at
          //   ? new Date(subscriptionSchedule.released_at * 1000).toISOString()
          //   : null,
          // end_behavior: subscriptionSchedule.end_behavior,
          // released_subscription: subscriptionSchedule.released_subscription,
          // type: "change_quantity",
        };
        console.log(
          "🌟Stripeアカウント数量減らすステップ5-4 数量ダウンルート 既にスケジュール済みのstripe_schedulesの行データの削減後の数量を更新するペイロード",
          updateSchedulePayload
        );

        const { data: updatedScheduleData, error: updatedScheduleError } = await supabaseServerClient
          .from("stripe_schedules")
          .update(updateSchedulePayload)
          .eq("id", (deleteAccountRequestSchedule as StripeSchedule).id)
          .select()
          .single();

        if (updatedScheduleError) {
          console.error(
            "❌Stripeアカウント数量減らすステップ5-5 既に存在するsupabaseのstripe_schedulesテーブルの行データのUPDATEクエリ失敗error",
            updatedScheduleError
          );
          return res.status(400).json({
            error:
              "❌Stripeアカウント数量減らすステップ5-5 既に存在するsupabaseのstripe_schedulesテーブルの行データのUPDATEクエリ失敗error",
          });
          // throw new Error(insertScheduleError.message);
        }

        console.log(
          "🌟Stripeアカウント数量減らすステップ5-5 数量ダウンルート 既に存在するsupabaseのstripe_schedulesテーブルの行データのUPDATEクエリ完了 insertScheduleData",
          updatedScheduleData
        );

        const response = {
          subscriptionItem: subscriptionSchedule,
          error: null,
        };

        console.log("✅Stripeアカウント数量減らすステップ6 APIルートへ返却");

        res.status(200).json(response);
      } else {
        console.log("✅Stripeアカウント数量減らすステップ6 スケジュールルートどちらも当てはまらず APIルートへ返却");
        res.status(200).json({
          message: "✅Stripeアカウント数量減らすステップ6 スケジュールルートどちらも当てはまらず APIルートへ返却",
        });
      }

      // ============================ ✅スケジュール数量を減らすルート ここまで ============================
    } else {
      console.log("❌Stripe数量変更ステップ6 エラー: Invalid changeType");
      return res.status(400).json({ error: "Invalid changeType" });
    }

    // =================== 比例配分なし 数量ダウンルート ここまで ===================

    // // =========================== 比例配分なしルート ===========================
    // // サブスクリプションの数量を増やすルート
    // // proration_behavior を none に設定してサブスクリプションの数量を増やし、billing_cycle_anchorの変更は不要
    // if (changeType === "increase") {
    //   const subscriptionItem = await stripe.subscriptionItems.update(subscriptionItemId, {
    //     quantity: newQuantity,
    //     proration_behavior: "none",
    //   });

    //   console.log("🌟Stripeステップ5 アカウント数量アップルート UPDATE完了 subscriptionItem", subscriptionItem);

    //   const response = {
    //     subscriptionItem: subscriptionItem,
    //     error: null,
    //   };

    //   console.log("🌟Stripeステップ6 APIルートへ返却");

    //   res.status(200).json(response);
    // }
    // // サブスクリプションの数量を減らすルート
    // // 取得した次の請求日をbilling_cycle_anchorとして設定し、サブスクリプションの数量を減少させます。
    // // これにより、次の請求日までの間、変更前の数量が請求され、その後の請求からは新しい数量が請求されます。
    // else if (changeType === "decrease") {
    //   const subscriptionItem = await stripe.subscriptionItems.update(subscriptionItemId, {
    //     quantity: newQuantity,
    //     proration_behavior: "none",
    //   });
    //   // const subscriptionItem = await stripe.subscriptions.update(subscriptionId, {
    //   //   items: [
    //   //     {
    //   //       id: subscriptionItemId,
    //   //       quantity: newQuantity,
    //   //       clear_usage: true,
    //   //     },
    //   //   ],
    //   // });
    //   // const subscriptionItem = await stripe.subscriptions.update(subscriptionId, {
    //   //   items: [
    //   //     {
    //   //       id: subscriptionItemId,
    //   //       quantity: newQuantity,
    //   //     },
    //   //   ],
    //   //   proration_behavior: "none",
    //   //   // billing_cycle_anchor: nextInvoiceTimestamp as any,
    //   // });

    //   console.log("🌟Stripeステップ5 アカウント数量ダウンルート UPDATE完了 subscriptionItem", subscriptionItem);

    //   const response = {
    //     subscriptionItem: subscriptionItem,
    //     error: null,
    //   };

    //   console.log("🌟Stripeステップ6 APIルートへ返却");

    //   res.status(200).json(response);
    // } else {
    //   console.log("🌟Stripeステップ6 エラー: Invalid changeType");
    //   return res.status(400).json({ error: "Invalid changeType" });
    // }
    // // =========================== 比例配分なしルート ここまで ===========================

    // =========================== 比例配分ありルート ===========================
    // const subscriptionItem = await stripe.subscriptionItems.update(subscriptionItemId, {
    //   quantity: newQuantity,
    //   proration_behavior: "none",
    // });

    // console.log("🌟Stripeステップ5 アカウント数量UPDATE完了 subscriptionItem", subscriptionItem);

    // const response = {
    //   subscriptionItem: subscriptionItem,
    //   error: null,
    // };

    // console.log("🌟Stripeステップ6 APIルートへ返却");

    // res.status(200).json(response);
    // =========================== 比例配分ありルート ここまで ===========================
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

export default changeQuantityHandler;
