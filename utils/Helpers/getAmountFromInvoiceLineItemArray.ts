import Stripe from "stripe";

// 4-1. 新プランの残り使用分配列の最後を取り除き、残った今までのinvoiceItemのamountを合計して今までの残り使用分の総額を算出
export const getAmountFromInvoiceLineItemArray = (
  copiedInvoiceItemArray: Stripe.InvoiceLineItem[],
  newPlanAmount: number,
  currentPeriodState: number,
  remainingDaysState: number
) => {
  // 新たな数量が変更されたため、今ユーザーが選択している数量と違う新プランのアイテムは取り除く(最後のアイテム)
  const lastInvoiceItem = copiedInvoiceItemArray.pop();
  // 残った今までアップグレードしてきた残り使用分の金額を合算する
  const previousRemainingUsageAmountSum = copiedInvoiceItemArray.reduce(
    (accumulator, currentValue) => accumulator + currentValue.amount,
    0
  );
  // 4-2. 今ユーザーが選択している数量新プランの1日当たりの金額を算出(最後の要素となる)
  const _newDailyRateThreeDecimalPoints = Math.round((newPlanAmount / currentPeriodState) * 1000) / 1000;
  // 4-3. 1日あたりの金額と残り日数を掛けて今ユーザーが選択している数量新プランの残り使用分の総額を算出
  // 今ユーザーが選択している数量新プランの残り期間までの使用量の金額
  const _newUsage = _newDailyRateThreeDecimalPoints * remainingDaysState;
  const _newUsageThreeDecimalPoints = Math.round(_newUsage * 1000) / 1000;
  // 4-4. 今までの残り使用分の合計と新たなプランの残り使用分の金額を合算して総額を算出
  const _newRemainingUsageSum = previousRemainingUsageAmountSum + Math.round(_newUsageThreeDecimalPoints);

  return {
    newRemainingUsageSum: _newRemainingUsageSum,
    newDailyRateThreeDecimalPoints: _newDailyRateThreeDecimalPoints,
  };
};
