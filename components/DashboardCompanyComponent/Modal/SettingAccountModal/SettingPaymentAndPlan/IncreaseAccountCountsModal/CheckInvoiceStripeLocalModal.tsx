import { getPrice } from "@/utils/Helpers/getPrice";
import React, { FC, memo } from "react";

type Props = {
  currentPeriodState: number | null;
  remainingDaysState: number | null;
  newDailyRateWithThreeDecimalPoints: number | null;
  stripeNewDailyRateWithThreeDecimalPoints: number | null;
  newUsageAmountForRemainingPeriodWithThreeDecimalPoints: number | null;
  stripeNewUsageAmountForRemainingPeriodWithThreeDecimalPoints: number | null;
  oldDailyRateWithThreeDecimalPoints: number | null;
  stripeOldDailyRateWithThreeDecimalPoints: number | null;
  oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints: number | null;
  stripeOldUnusedAmountForRemainingPeriodWithThreeDecimalPoints: number | null;
  additionalCostState: number | null;
  stripeAdditionalCostState: number | null;
  subscription_plan: string | null | undefined;
  totalAccountQuantity: number | null;
  nextInvoiceAmountState: number | null;
  stripeNextInvoiceAmountState: number | null;
};
// ====================== 🌟StripeのInvoiceとローカルのチェックコンポーネント ======================
const CheckInvoiceStripeLocalModalMemo: FC<Props> = ({
  currentPeriodState,
  remainingDaysState,
  newDailyRateWithThreeDecimalPoints,
  stripeNewDailyRateWithThreeDecimalPoints,
  newUsageAmountForRemainingPeriodWithThreeDecimalPoints,
  stripeNewUsageAmountForRemainingPeriodWithThreeDecimalPoints,
  oldDailyRateWithThreeDecimalPoints,
  stripeOldDailyRateWithThreeDecimalPoints,
  oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints,
  stripeOldUnusedAmountForRemainingPeriodWithThreeDecimalPoints,
  additionalCostState,
  stripeAdditionalCostState,
  subscription_plan,
  totalAccountQuantity,
  nextInvoiceAmountState,
  stripeNextInvoiceAmountState,
}) => {
  return (
    <div className="absolute right-0 top-0 z-[29] flex min-h-[100%] w-7/12 flex-col rounded-r-[8px] border-l border-solid border-[var(--color-border-base)] bg-[var(--color-bg-base)]">
      <div className="relative flex w-full items-center border-b border-solid border-[--color-border-base] py-[20px] text-[13px] text-[var(--color-text-title)]">
        <div className="flex-center w-[50%] border-r border-solid border-[--color-border-base]">
          <span className="mr-[20px]">請求期間：{currentPeriodState}</span>
          <span>プラン期間残り日数：{remainingDaysState}</span>
        </div>
        <div className="flex-center w-[25%] border-x border-solid border-[--color-border-base]">ローカル算出結果</div>
        <div className="flex-center w-[25%]">StripeのInvoice</div>
      </div>

      <div className="relative flex w-full items-center border-b border-solid border-[--color-border-base] py-[20px] text-[13px] text-[var(--color-text-title)]">
        <div className="flex-center w-[50%] border-r border-solid border-[--color-border-base]">
          新プランの1日当たり料金
        </div>
        <div className="flex-center w-[25%] border-x border-solid border-[--color-border-base]">
          {newDailyRateWithThreeDecimalPoints}
        </div>
        <div className="flex-center w-[25%]">{stripeNewDailyRateWithThreeDecimalPoints ?? `-`}</div>
      </div>
      <div className="relative flex w-full items-center border-b border-solid border-[--color-border-base] py-[20px] text-[13px] text-[var(--color-text-title)]">
        <div className="flex-center w-[50%] border-r border-solid border-[--color-border-base]">
          新プランの残り期間までの利用分の金額
        </div>
        <div className="flex-center w-[25%] border-x border-solid border-[--color-border-base]">
          {newUsageAmountForRemainingPeriodWithThreeDecimalPoints}
        </div>
        <div className="flex-center w-[25%]">{stripeNewUsageAmountForRemainingPeriodWithThreeDecimalPoints ?? `-`}</div>
      </div>
      <div className="relative flex w-full items-center border-b border-solid border-[--color-border-base] py-[20px] text-[13px] text-[var(--color-text-title)]">
        <div className="flex-center w-[50%] border-r border-solid border-[--color-border-base]">
          旧プランの月額料金の1日あたりの料金
        </div>
        <div className="flex-center w-[25%] border-x border-solid border-[--color-border-base]">
          {oldDailyRateWithThreeDecimalPoints}
        </div>
        <div className="flex-center w-[25%]">{stripeOldDailyRateWithThreeDecimalPoints ?? `-`}</div>
      </div>
      <div className="relative flex w-full items-center border-b border-solid border-[--color-border-base] py-[20px] text-[13px] text-[var(--color-text-title)]">
        <div className="flex-center w-[50%] border-r border-solid border-[--color-border-base]">
          旧プランの残り期間までの未使用分の金額
        </div>
        <div className="flex-center w-[25%] border-x border-solid border-[--color-border-base]">
          {oldUnusedAmountForRemainingPeriodWithThreeDecimalPoints}
        </div>
        <div className="flex-center w-[25%]">
          {stripeOldUnusedAmountForRemainingPeriodWithThreeDecimalPoints ?? `-`}
        </div>
      </div>

      <div className="relative flex w-full items-center border-b border-solid border-[--color-border-base] py-[20px] text-[13px] text-[var(--color-text-title)]">
        <div className="flex-center w-[50%] border-r border-solid border-[--color-border-base]">追加費用</div>
        <div className="flex-center w-[25%] border-x border-solid border-[--color-border-base]">
          {additionalCostState}
        </div>
        <div className="flex-center w-[25%]">{stripeAdditionalCostState ?? `-`}</div>
      </div>
      <div className="relative flex w-full items-center border-b border-solid border-[--color-border-base] py-[20px] text-[13px] text-[var(--color-text-title)]">
        <div className="flex-center w-[50%] border-r border-solid border-[--color-border-base]">新プランの価格</div>
        <div className="flex-center w-[25%] border-x border-solid border-[--color-border-base]">
          {!!subscription_plan && !!totalAccountQuantity ? getPrice(subscription_plan) * totalAccountQuantity : `-`}
        </div>
        <div className="flex-center w-[25%]">
          {!!subscription_plan && !!totalAccountQuantity ? getPrice(subscription_plan) * totalAccountQuantity : `-`}
        </div>
      </div>
      <div className="relative flex w-full items-center border-b border-solid border-[--color-border-base] py-[20px] text-[13px] text-[var(--color-text-title)]">
        <div className="flex-center w-[50%] border-r border-solid border-[--color-border-base]">
          次回の支払額(追加費用上乗せ済み)
        </div>
        <div className="flex-center w-[25%] border-x border-solid border-[--color-border-base]">
          {nextInvoiceAmountState ?? "-"}
        </div>
        <div className="flex-center w-[25%]">{stripeNextInvoiceAmountState ?? `-`}</div>
      </div>
    </div>
  );
};

export const CheckInvoiceStripeLocalModal = memo(CheckInvoiceStripeLocalModalMemo);
