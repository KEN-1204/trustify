import { UserProfileCompanySubscription } from "@/types";
import axios from "axios";
import { format } from "date-fns";
import Stripe from "stripe";

export const getStripeSchedule = async (userProfileState: UserProfileCompanySubscription | null, sessionState: any) => {
  if (!userProfileState) {
    console.error("エラー：ユーザー情報が見つかりませんでした。");
    return null;
  }
  if (!sessionState) {
    console.error("エラー：ユーザー情報が見つかりませんでした。");
    return null;
  }

  try {
    const payload = {
      stripeSubscriptionId: userProfileState.stripe_subscription_id,
    };

    const {
      data: { data: gotScheduleData, error: getScheduleError },
    } = await axios.post(`/api/subscription/get-schedule`, payload, {
      headers: {
        Authorization: `Bearer ${sessionState.access_token}`,
      },
    });
    if (getScheduleError) {
      console.log("❌getStripeSchedule取得エラー", getScheduleError);
      throw new Error(getScheduleError);
    }
    if (gotScheduleData === null) return console.log("✅スケジュール無し", gotScheduleData);
    console.log("🌟getStripeSchedule取得完了", gotScheduleData);
    console.log(
      "スケジュール各項目 created",
      format(new Date((gotScheduleData as Stripe.SubscriptionSchedule).created * 1000), "yyyy年MM月dd日 HH:mm:ss")
    );
    console.log(
      "今月フェーズstart_date",
      format(
        new Date((gotScheduleData as Stripe.SubscriptionSchedule).phases[0].start_date * 1000),
        "yyyy年MM月dd日 HH:mm:ss"
      )
    );
    console.log(
      "今月フェーズend_date",
      format(
        new Date((gotScheduleData as Stripe.SubscriptionSchedule).phases[0].end_date * 1000),
        "yyyy年MM月dd日 HH:mm:ss"
      )
    );
    console.log("今月フェーズのプランid", (gotScheduleData as Stripe.SubscriptionSchedule).phases[0].items[0].price);
    console.log("今月フェーズの数量", (gotScheduleData as Stripe.SubscriptionSchedule).phases[0].items[0].quantity);
    console.log(
      "来月フェーズstart_date",
      format(
        new Date((gotScheduleData as Stripe.SubscriptionSchedule).phases[1].start_date * 1000),
        "yyyy年MM月dd日 HH:mm:ss"
      )
    );
    console.log(
      "来月フェーズend_date",
      format(
        new Date((gotScheduleData as Stripe.SubscriptionSchedule).phases[1].end_date * 1000),
        "yyyy年MM月dd日 HH:mm:ss"
      )
    );
    console.log("来月フェーズプランid", (gotScheduleData as Stripe.SubscriptionSchedule).phases[1].items[0].price);
    console.log("来月フェーズ数量", (gotScheduleData as Stripe.SubscriptionSchedule).phases[1].items[0].quantity);

    return gotScheduleData as Stripe.SubscriptionSchedule;
  } catch (e: any) {
    console.error("❌スケジュール取得エラー：", e);
    return null;
  }
};
