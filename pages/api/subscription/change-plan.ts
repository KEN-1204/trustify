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
    console.log("🌟Stripeプラン変更ステップ1 APIルートリクエスト取得");
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
    console.log("🌟Stripeプラン変更ステップ2 jwt.verify認証完了 payload", payload);
    const userId = payload.sub; // 'sub' field usually contains the user id.

    // axios.post()メソッドのリクエストボディから変数を取得
    const {
      stripeCustomerId,
      changePlanType,
      newPlanName,
      companyId,
      subscriptionId,
      stripeSubscriptionId,
      userProfileId,
      alreadyHaveSchedule,
      deleteAccountRequestSchedule,
      prorationDate,
      currentQuantity,
    } = req.body;

    // Ensure stripeCustomerId is a string stripeCustomerIdが文字列であることを確認する。
    if (typeof stripeCustomerId !== "string") {
      res.status(400).json({ error: "Invalid stripeCustomerId" });
      return;
    }

    // Ensure newPlanName is a number newPlanNameが存在し、newPlanNameが数値型であることを確認する。
    if (!newPlanName || typeof newPlanName !== "string") {
      console.log("エラー: Invalid newPlanName");
      return res.status(400).json({ error: "Invalid newPlanName" });
    }
    // Ensure currentQuantity is a number currentQuantityが存在し、currentQuantityが数値型であることを確認する。
    if (!currentQuantity || typeof currentQuantity !== "number") {
      console.log("エラー: Invalid currentQuantity");
      return res.status(400).json({ error: "Invalid currentQuantity" });
    }

    // stripeインスタンスを作成
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2022-11-15",
    });

    // Stripe顧客IDからサブスクリプションを取得
    // const subscriptions = await stripe.subscriptions.list({
    //   customer: stripeCustomerId,
    // });
    // Stripeサブスクリプションオブジェクトのidでサブスクリプションオブジェクトを取得
    const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

    console.log("🌟Stripeプラン変更ステップ3-2 Stripeから取得したsubscription", subscription);

    // サブスクリプションID
    // const stripeSubscriptionId = subscriptions.data[0].id;
    // 現在のプランの開始日
    const currentPeriodStart = subscription.current_period_start;
    // 次の請求日を取得
    const currentPeriodEnd = subscription.current_period_end;
    // ユーザーが現在契約しているサブスクリップションアイテムのidを取得
    const subscriptionItemId = subscription.items.data[0].id;
    // ユーザーが現在契約しているサブスクリップションの価格idを取得
    const subscriptionCurrentPriceId = subscription.items.data[0].price.id;
    // ユーザーが現在契約しているサブスクリップションのプランの価格を取得
    const subscriptionCurrentPriceUnitAmount = subscription.items.data[0].price.unit_amount;
    // ユーザーが現在契約しているサブスクリップションの数量
    const subscriptionCurrentQuantity = subscription.items.data[0].quantity;

    // 新たなプラン名からstripeのprice_idを取得
    let _newPriceId;
    switch (newPlanName) {
      case "business_plan":
        _newPriceId = process.env.STRIPE_BUSINESS_PLAN_PRICE_ID;
        break;
      case "premium_plan":
        _newPriceId = process.env.STRIPE_PREMIUM_PLAN_PRICE_ID;
        break;
      default:
        _newPriceId = null;
    }

    // Ensure _newPriceId is a number _newPriceIdが存在し、_newPriceIdが数値型であることを確認する。
    if (!_newPriceId || typeof _newPriceId !== "string") {
      console.log("エラー: Invalid _newPriceId");
      return res.status(400).json({ error: "Invalid _newPriceId" });
    }

    console.log("🌟Stripeプラン変更ステップ4 Stripeの顧客IDから各アイテム取得");
    console.log("💡Stripe顧客ID", stripeCustomerId);
    console.log("💡削除リクエストスケジュールが既にあるかどうか alreadyHaveSchedule", alreadyHaveSchedule);
    console.log("💡削除リクエストスケジュール deleteAccountRequestSchedule", deleteAccountRequestSchedule);
    console.log(
      "💡アップデート用比例配分UNIXタイムスタンプと日付",
      prorationDate,
      format(new Date(prorationDate * 1000), "yyyy年MM月dd日 HH時mm分ss秒")
    );
    console.log("💡changePlanType", changePlanType);
    console.log("💡newPlanName", newPlanName);
    console.log("💡_newPriceId", _newPriceId);
    console.log("💡currentQuantity", currentQuantity);
    console.log("💡サブスクリプションID", stripeSubscriptionId);
    console.log("💡サブスクアイテムID:subscription.items.data[0].id", subscriptionItemId);
    console.log("💡現在契約中の価格ID:subscription.items.data[0].price.id", subscriptionCurrentPriceId);
    console.log("💡現在契約中の数量:subscription.items.data[0].quantity", subscriptionCurrentQuantity);
    console.log(
      "💡現在のプランの開始日:subscription.current_period_start",
      new Date(currentPeriodStart * 1000),
      format(new Date(currentPeriodStart * 1000), "yyyy年MM月dd日 HH時mm分ss秒")
    ),
      console.log(
        "💡現在のプランの終了日",
        new Date(currentPeriodEnd * 1000),
        format(new Date(currentPeriodEnd * 1000), "yyyy年MM月dd日 HH時mm分ss秒")
      );
    console.log(
      "✅アップデート用比例配分UNIXタイムスタンプと日付",
      prorationDate,
      format(new Date(prorationDate * 1000), "yyyy年MM月dd日 HH時mm分ss秒")
    );

    if (changePlanType === "upgrade") {
      // stripe.invoice.retrieveUpcoming()で取得したインボイスのsubscription_proration_datのUNIXタイムスタンプがnumber型かチェック
      if (typeof prorationDate !== "number") {
        console.log(
          "❌Stripeプラン変更ステップ5 プランアップグレードルート prorationDateがnumberではないためここでレスポンス",
          prorationDate
        );
        res.status(400).json({ error: "Invalid prorationDate" });
        return;
      }
      console.log(
        "🌟Stripeプラン変更ステップ5 プランアップグレードルート stripe.subscriptions.update()実行 数量を増やす"
      );
      const updatedSubscription = await stripe.subscriptions.update(stripeSubscriptionId, {
        items: [
          {
            id: subscriptionItemId,
            quantity: currentQuantity,
            price: _newPriceId,
          },
        ],
        // proration_behavior: "none",
        proration_behavior: "create_prorations",
        billing_cycle_anchor: "unchanged",
        proration_date: prorationDate,
      });
      console.log(
        "🌟Stripeプラン変更ステップ5 プランアップグレードルート stripeのサブスクリプションオブジェクト更新完了 subscription",
        subscription
      );
      console.log(
        "💡Stripeプラン変更ステップ5 プランアップグレードルート UPDATE前 プランの開始日 current_period_start",
        currentPeriodStart,
        format(new Date(currentPeriodStart * 1000), "yyyy年MM月dd日 HH時mm分ss秒")
      );
      console.log(
        "💡Stripeプラン変更ステップ5 プランアップグレードルート UPDATE前 プランの終了日 current_period_end",
        currentPeriodEnd,
        format(new Date(currentPeriodEnd * 1000), "yyyy年MM月dd日 HH時mm分ss秒")
      );
      console.log(
        "💡Stripeプラン変更ステップ5 プランアップグレードルート UPDATE後 プランの開始日 current_period_start",
        subscription.current_period_start,
        format(new Date(subscription.current_period_start * 1000), "yyyy年MM月dd日 HH時mm分ss秒")
      );
      console.log(
        "💡Stripeプラン変更ステップ5 プランアップグレードルート UPDATE後 プランの終了日 current_period_end",
        subscription.current_period_end,
        format(new Date(subscription.current_period_end * 1000), "yyyy年MM月dd日 HH時mm分ss秒")
      );
      console.log(
        "💡Stripeプラン変更ステップ5 プランアップグレードルート UPDATE後 引数に渡した比例配分日 proration_date",
        prorationDate,
        format(new Date(prorationDate * 1000), "yyyy年MM月dd日 HH時mm分ss秒")
      );

      // ========================== プランアップグレード後に数量ダウンスケジュールが存在する場合のルート
      // プランをアップグレードする前に、数量ダウンスケジュールが予約されている場合、
      // そのスケジュールのプランには、プランをアップグレードする前のビジネスプランがセットされているため、
      // プランをアップグレードした場合は、stripeとsupabaseのスケジュールのプランをプレミアムプランに変更する
      // 【手順】
      // 1. 数量ダウンのスケジュールが存在するか確認する(プランダウングレードのスケジュールに関しては、プランをアップグレードする場合、プランダウングレードのスケジュールをキャンセルしてからでないとプランをアップグレードすることはできないため、数量ダウンスケジュールのみ確認すればよい)
      // 2. stripeのサブスクリプションスケジュールの翌月のフェーズのplanをプレミアムプランのidに変更する
      // 3. supabaseのスケジュールのactiveで、typeがchange_quantityのcurrent_planをpremium_planに変更する

      // まずは、数量ダウンのスケジュールが存在するか確認する
      const scheduleId = subscription.schedule;
      if (!scheduleId) {
        // サブスクリプションスケジュールが存在しない場合には、そのままここでレスポンスする
        const response = {
          subscriptionItem: updatedSubscription,
          error: null,
        };

        console.log("✅Stripeプラン変更ステップ6 プランアップグレードルート 無事完了したため200でAPIルートへ返却");

        res.status(200).json(response);
      } else {
        // サブスクリプションスケジュールが存在する場合には、数量ダウンが存在するということなので、数量を変更する
        const scheduleData = await stripe.subscriptionSchedules.retrieve(scheduleId as string);
        console.log(
          "🌟Stripeプラン変更ステップ6-1 プランアップグレードルート 数量ダウンスケジュールが存在するため、スケジュールの次回フェーズのプランを今回プランをアップグレードさせたプレミアムプランに反映させる 更新前のスケジュールscheduleData",
          scheduleData
        );

        // 2. stripeのサブスクリプションスケジュールの翌月のフェーズのplanをプレミアムプランのidに変更する
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
                  price: _newPriceId,
                  quantity:
                    scheduleData.phases.length >= 2 ? scheduleData.phases[1].items[0].quantity : currentQuantity,
                },
              ],
              iterations: 1,
              proration_behavior: "none", // 新たに減らした数量を前払い(請求期間の開始日に支払い完了)
              // billing_cycle_anchor: "phase_start",
            },
          ],
        });
        console.log(
          "🌟Stripeプラン変更ステップ6-2 プランアップグレードルート 数量ダウンスケジュールが存在するため、スケジュールの次回フェーズのプランを今回プランをアップグレードさせたプレミアムプランに反映させる 更新後のスケジュールsubscriptionSchedule",
          subscriptionSchedule
        );

        // 3. supabaseのスケジュールのactiveで、typeがchange_quantityのcurrent_planをpremium_planに変更する
        const updateSchedulePayload = {
          current_price_id: _newPriceId,
          current_price: 19800,
        };
        console.log(
          "🌟Stripeプラン変更ステップ6-2 プランアップグレードルート stripeのスケジュール更新後にsupabaseのスケジュールを更新を実行 payload",
          updateSchedulePayload
        );

        const { data: updatedScheduleData, error: updatedScheduleError } = await supabaseServerClient
          .from("stripe_schedules")
          .update(updateSchedulePayload)
          .eq("stripe_schedule_id", scheduleId)
          .eq("schedule_status", "active")
          .eq("type", "change_quantity")
          .select();

        if (updatedScheduleError) {
          console.error(
            "❌Stripeプラン変更ステップ6-2 プランアップグレードルート stripeのスケジュール更新後にsupabaseのスケジュールを更新失敗error",
            updatedScheduleError
          );
          return res.status(400).json({
            error:
              "❌Stripeプラン変更ステップ6-2 プランアップグレードルート stripeのスケジュール更新後にsupabaseのスケジュールを更新失敗error",
          });
        }

        console.log(
          "🌟Stripeプラン変更ステップ6-2 プランアップグレードルート stripeのスケジュール更新後にsupabaseのスケジュールを更新成功 更新後のsupabaseのスケジュール updatedScheduleData",
          updatedScheduleData
        );

        const response = {
          subscriptionItem: subscriptionSchedule,
          error: null,
        };

        console.log("✅Stripeプラン変更ステップ7 プランアップグレードルート 無事完了したため200でAPIルートへ返却");

        res.status(200).json(response);
      }
      // ========================== 数量ダウンスケジュールが存在する場合のルート ここまで
    }
    // ============================ 🌟スケジュールプランダウングレードルート ============================
    else if (changePlanType === "downgrade") {
      // サブスクリプションに紐づくスケジュール 存在していない場合はcreate()で新たに作成する
      const scheduleId = subscription.schedule;
      // stripe.subscriptions.list()で取得した顧客が現在契約しているサブスクリプションオブジェクトが保持しているスケジュールid
      console.log("🌟Stripeプラン変更ステップ5-0 プランダウングレードルート スケジュールid", scheduleId);

      // Create a subscription schedule with the existing subscription
      let scheduleData; // create()で作成したスケジュールオブジェクトの保持用変数
      // 契約中のサブスクリプションオブジェクトにスケジュールオブジェクトがアタッチされていない場合はcreate()で作成
      if (!scheduleId) {
        scheduleData = await stripe.subscriptionSchedules.create({
          from_subscription: stripeSubscriptionId, // "sub_ERf72J8Sc7qx.."
        });
        console.log(
          "🌟Stripeプラン変更ステップ5-1 プランダウングレードルート 契約中のサブスクリプションIDでサブスクリプションスケジュールオブジェクトを作成",
          scheduleData
        );
      }
      // 契約中のサブスクリプションオブジェクトに既にスケジュールオブジェクトが存在するならリリースして解放してから新たにスケジュールオブジェクトを新しく作成
      else {
        // ====================== 🌟プランダウングレードスケジュール単体のみ ======================
        // const releaseSchedule = await stripe.subscriptionSchedules.release(scheduleId as string);
        // // schedule = await stripe.subscriptionSchedules.retrieve(scheduleId as string);
        // console.log(
        //   "🌟Stripeプラン変更ステップ5-01 プランダウングレードルート 既にスケジュールidが存在したためスケジュールをリリース リリースしたスケジュールオブジェクト: ",
        //   releaseSchedule
        // );
        // scheduleData = await stripe.subscriptionSchedules.create({
        //   from_subscription: stripeSubscriptionId, // "sub_ERf72J8Sc7qx7D"
        // });
        // ====================== ✅プランダウングレードスケジュール単体のみ ======================
        // =============== テスト アカウント減少とプランダウングレードの両方をスケジュール ===============
        scheduleData = await stripe.subscriptionSchedules.retrieve(scheduleId as string);
        console.log(
          "🔥stripeのスケジュールが既に存在するため、サブスクリプションオブジェクトのscheduleの値からスケジュールをretrieve 取得したスケジュール",
          scheduleData
        );
        // =============== テスト アカウント減少とプランダウングレードの両方をスケジュール ===============
      }

      console.log(
        "💡現在のサブスクリプションに作成されたスケジュールの現在のフェーズの開始日: scheduleData.phases[0].start_date",
        scheduleData.phases[0].start_date,
        format(dateJST(scheduleData.phases[0].start_date), "yyyy/MM/dd HH:mm:ss")
      );
      console.log(
        "💡現在のサブスクリプションに作成されたスケジュールの現在のフェーズの終了日: scheduleData.phases[0].end_date",
        scheduleData.phases[0].end_date,
        format(dateJST(scheduleData.phases[0].end_date), "yyyy/MM/dd HH:mm:ss")
      );

      console.log("🔥stripeスケジュールupdate() 既にアカウント減少スケジュールが存在するか確認 ");
      console.log("🔥scheduleData.phases.length", scheduleData.phases.length);
      console.log("🔥scheduleData.phases[1].items", scheduleData.phases.length >= 2 && scheduleData.phases[1].items);
      console.log(
        "🔥scheduleData.phases[1].items[0].quantity",
        scheduleData.phases.length >= 2 && scheduleData.phases[1].items[0].quantity
      );
      // スケジュールの現在のフェーズの開始日がサブスクリプションオブジェクトの開始日と異なる場合にはスケジュールをリリースして、新たにスケジュールをcreateする
      const subscriptionCurrentPeriodStartDate = new Date(currentPeriodStart * 1000);
      const scheduleCurrentPhaseStartDate = new Date(scheduleData.phases[0].start_date * 1000);
      // scheduleData.phases.lengthが３以上なら一度スケジュールをリリースして新たなスケジュールを作成してからupdateする
      // または、スケジュールの現在のフェーズのstart_dateの月が、サブスクリプションオブジェクトのcurrent_period_startの月よりも低い場合
      if (
        scheduleData.phases.length >= 3 ||
        (subscriptionCurrentPeriodStartDate.getFullYear() === scheduleCurrentPhaseStartDate.getFullYear() &&
          subscriptionCurrentPeriodStartDate.getMonth() > scheduleCurrentPhaseStartDate.getMonth())
      ) {
        const releaseSchedule = await stripe.subscriptionSchedules.release(scheduleId as string);
        if (scheduleData.phases.length >= 3) {
          console.log(
            "🔥scheduleData.phases.lengthが3つのルート 一旦スケジュールリリース releaseSchedule",
            scheduleData.phases.length,
            releaseSchedule
          );
        } else if (
          subscriptionCurrentPeriodStartDate.getFullYear() === scheduleCurrentPhaseStartDate.getFullYear() &&
          subscriptionCurrentPeriodStartDate.getMonth() > scheduleCurrentPhaseStartDate.getMonth()
        ) {
          console.log(
            "🔥スケジュールの現在のフェーズのstart_dateの月が、サブスクリプションオブジェクトのcurrent_period_startの月よりも低いためスケジュールを一旦スケジュールリリースするルート",
            "サブスクリプションのcurrent_period_start",
            subscriptionCurrentPeriodStartDate,
            "スケジュールの現在のフェーズのstart_date scheduleData.phases[0].start_date",
            scheduleCurrentPhaseStartDate
          );
        }

        scheduleData = await stripe.subscriptionSchedules.create({
          from_subscription: stripeSubscriptionId, // "sub_ERf72J8Sc7qx.."
        });
        console.log(
          "🔥scheduleData.phases.lengthが3つのルート リリース後にスケジュールcreate scheduleData",
          scheduleData
        );
      }
      // =========================== 通常 ===========================
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
                // price: subscriptionCurrentPriceId, // 現在の価格プラン
                // quantity: newQuantity, // 新たにダウンした数量
                price: _newPriceId,
                quantity: scheduleData.phases.length >= 2 ? scheduleData.phases[1].items[0].quantity : currentQuantity,
              },
            ],
            iterations: 1,
            proration_behavior: "none", // 新たに減らした数量を前払い(請求期間の開始日に支払い完了)
            // billing_cycle_anchor: "phase_start",
          },
        ],
      });
      // =========================== 通常 ===========================
      console.log(
        "🌟Stripeプラン変更ステップ5 プランダウングレードルート stripe.subscriptionSchedules.update()実行 プランをビジネスプランに変更するスケジュールへとスケジュールを更新 items",
        "currentQuantity",
        currentQuantity,
        "_newPriceId",
        _newPriceId
      );
      console.log(
        "🌟Stripeプラン変更ステップ5-3 プランダウングレードルート サブスクリプションスケジュールのUPDATE完了 subscriptionSchedule",
        subscriptionSchedule
      );
      console.log(
        "🔥Stripeプラン変更ステップ5-3 プランダウングレードルート subscriptionSchedule.phases[0].items[0]",
        subscriptionSchedule.phases[0].items[0]
      );
      console.log(
        "🔥Stripeプラン変更ステップ5-3 プランダウングレードルート subscriptionSchedule.phases[1].items[0]",
        subscriptionSchedule.phases[1].items[0]
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

      const newPrice = subscriptionCurrentPriceUnitAmount === 980 ? 19800 : 980;

      // =========================== supabaseのスケジュールテーブルにINSERT ===========================
      // Stripeのサブスクリプションスケジュールの数量削減リクエスト、更新用にスケジュールidなどをsupabaseのstripe_schedulesテーブルにINSERT
      const insertPayload = {
        stripe_customer_id: stripeCustomerId,
        stripe_schedule_id: subscriptionSchedule.id,
        schedule_status: "active", // subscriptionSchedule.statusはnot_startedとactiveのタイミングが不明なので、stripe_schedulesテーブルには作成時からactiveをINSERT
        stripe_subscription_id: stripeSubscriptionId,
        stripe_subscription_item_id: subscriptionItemId,
        current_price_id: subscriptionCurrentPriceId,
        scheduled_price_id: _newPriceId, // プラン(価格)は変わらないのでidも変わらずscheduledは無し
        current_quantity: currentQuantity,
        scheduled_quantity: null, // プラン変更なので数量は変わらずnull
        note: null, // 注意書きはなし
        update_reason: null,
        canceled_at: subscriptionSchedule.canceled_at,
        company_id: companyId,
        subscription_id: subscriptionId,
        current_price: subscriptionCurrentPriceUnitAmount,
        scheduled_price: newPrice,
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
        type: "change_plan",
      };
      console.log(
        "🌟Stripeプラン変更ステップ5-4 プランダウングレードルート stripe_schedulesテーブルにINSERTするペイロード",
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
          "❌Stripeプラン変更ステップ5-5 supabaseのstripe_schedulesテーブルへINSERTクエリ失敗error",
          insertScheduleError
        );
        return res.status(400).json({
          error: "❌Stripeプラン変更ステップ5-5 supabaseのstripe_schedulesテーブルへINSERTクエリ失敗error",
        });
        // throw new Error(insertScheduleError.message);
      }

      console.log(
        "🌟Stripeプラン変更ステップ5-5 プランダウングレードルート Supabaseのstripe_schedulesテーブルにINSERT完了 insertScheduleData",
        insertScheduleData
      );

      const response = {
        subscriptionItem: subscriptionSchedule,
        error: null,
      };

      console.log("✅Stripeプラン変更ステップ6 プランダウングレードルート 無事完了したため200でAPIルートへ返却");

      res.status(200).json(response);
    }
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
