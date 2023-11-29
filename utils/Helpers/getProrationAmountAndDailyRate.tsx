import Stripe from "stripe";

// 「残り使用分の1日当たりの料金と総額」と「未使用分の1日当たりの料金と総額」を算出
export const getProrationAmountAndDailyRate = (
  currentPeriod: number,
  remainingDays: number,
  planFeePerAccount: number,
  quantity: number
) => {
  const planFeePerMonth = planFeePerAccount * quantity;
  const newDailyRateWithThreeDecimalPoints = Math.round((planFeePerMonth / currentPeriod) * 1000) / 1000;
  const amountForRemainingPeriodWithThreeDecimalPoints =
    Math.round(newDailyRateWithThreeDecimalPoints * remainingDays * 1000) / 1000;

  const response = {
    newDailyRateWithThreeDecimalPoints: newDailyRateWithThreeDecimalPoints,
    amountForRemainingPeriodWithThreeDecimalPoints: amountForRemainingPeriodWithThreeDecimalPoints,
  };

  return response;
};
