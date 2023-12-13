import { UserProfileCompanySubscription } from "@/types";
import axios from "axios";
import { format } from "date-fns";
import Stripe from "stripe";

export const releaseStripeSchedule = async (getStripeScheduleStateId: string, sessionState: any) => {
  if (!sessionState) {
    console.error("エラー：ユーザー情報が見つかりませんでした。");
    return;
  }

  try {
    const payload = {
      scheduleId: getStripeScheduleStateId,
    };

    const {
      data: { data: releasedScheduleData, error: releasedScheduleError },
    } = await axios.post(`/api/subscription/release-schedule`, payload, {
      headers: {
        Authorization: `Bearer ${sessionState.access_token}`,
      },
    });
    if (releasedScheduleError) {
      console.log("❌releaseStripeSchedule取得エラー", releasedScheduleError);
      throw new Error(releasedScheduleError);
    }
    console.log("🌟releaseStripeSchedule取得完了", releasedScheduleData);
    console.log(
      "スケジュール各項目 created",
      format(new Date((releasedScheduleData as Stripe.SubscriptionSchedule).created * 1000), "yyyy年MM月dd日 HH:mm:ss")
    );
    console.log(
      "今月フェーズstart_date",
      format(
        new Date((releasedScheduleData as Stripe.SubscriptionSchedule).phases[0].start_date * 1000),
        "yyyy年MM月dd日 HH:mm:ss"
      )
    );
    console.log(
      "今月フェーズend_date",
      format(
        new Date((releasedScheduleData as Stripe.SubscriptionSchedule).phases[0].end_date * 1000),
        "yyyy年MM月dd日 HH:mm:ss"
      )
    );
    console.log(
      "今月フェーズのプランid",
      (releasedScheduleData as Stripe.SubscriptionSchedule).phases[0].items[0].price
    );
    console.log(
      "来月フェーズstart_date",
      format(
        new Date((releasedScheduleData as Stripe.SubscriptionSchedule).phases[1].start_date * 1000),
        "yyyy年MM月dd日 HH:mm:ss"
      )
    );
    console.log(
      "来月フェーズend_date",
      format(
        new Date((releasedScheduleData as Stripe.SubscriptionSchedule).phases[1].end_date * 1000),
        "yyyy年MM月dd日 HH:mm:ss"
      )
    );
    console.log("来月フェーズプランid", (releasedScheduleData as Stripe.SubscriptionSchedule).phases[1].items[0].price);

    return;
  } catch (e: any) {
    console.log("❌スケジュール削除エラー", e);
    return;
  }
};
