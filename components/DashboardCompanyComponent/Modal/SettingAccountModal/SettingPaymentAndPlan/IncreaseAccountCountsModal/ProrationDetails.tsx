import { formatToJapaneseYen } from "@/utils/Helpers/formatToJapaneseYen";
import { format } from "date-fns";
import { FC, memo } from "react";
import { MdClose } from "react-icons/md";
import Stripe from "stripe";

type Props = {
  planType: "new" | "old";
  nextInvoice: Stripe.UpcomingInvoice | null;
  currentPeriod: number | null;
  remainingDays: number | null;
  setIsOpenNewProrationDetail: React.Dispatch<React.SetStateAction<boolean>>;
  setIsOpenOldProrationDetail: React.Dispatch<React.SetStateAction<boolean>>;
};

const ProrationDetailsMemo: FC<Props> = ({
  planType,
  nextInvoice,
  currentPeriod,
  remainingDays,
  setIsOpenNewProrationDetail,
  setIsOpenOldProrationDetail,
}) => {
  if (!nextInvoice) return null;
  if (!nextInvoice.subscription_proration_date) return null;

  return (
    <>
      {/* オーバーレイ */}
      {planType === "new" && (
        <div
          className="absolute left-0 top-0 z-[100] h-full w-full cursor-pointer rounded-[8px]"
          onClick={() => setIsOpenNewProrationDetail(false)}
        ></div>
      )}
      {planType === "old" && (
        <div
          className="absolute left-0 top-0 z-[100] h-full w-full cursor-pointer rounded-[8px]"
          onClick={() => setIsOpenOldProrationDetail(false)}
        ></div>
      )}
      {/* ハイライト */}
      {planType === "new" && (
        <>
          <div className="absolute left-0 top-0 z-[99] h-full w-[34%] rounded-l-[7px] bg-[#00000030] backdrop-blur-sm"></div>
          <div className="absolute bottom-0 left-[34%] right-[37%] z-[99] h-[31%] bg-[#00000030] backdrop-blur-sm"></div>
          <div className="absolute right-0 top-0 z-[99] h-full w-[37%] rounded-r-[7px] bg-[#00000030] backdrop-blur-sm"></div>
        </>
      )}
      {planType === "old" && (
        <>
          <div className="absolute left-0 top-0 z-[99] h-full w-[66%] rounded-l-[7px] bg-[#00000030] backdrop-blur-sm"></div>
          <div className="absolute bottom-0 right-0 z-[99] h-[31%] w-[34%] rounded-br-[7px] bg-[#00000030] backdrop-blur-sm"></div>
        </>
      )}
      {/* ハイライト ここまで */}
      <div
        className={`fade02 shadow-all-md-center absolute left-[50%] top-[0] z-[150] flex max-h-[51%] min-h-[50%] min-w-[100%] translate-x-[-50%] flex-col rounded-[8px] border border-solid border-[var(--color-bg-brand-f)] bg-[var(--color-edit-bg-solid)] px-[24px] py-[16px]`}
      >
        {/* クローズボタン */}
        {planType === "new" && (
          <button
            className={`flex-center group absolute right-[20px] top-[10px] z-50 h-[32px] w-[32px] rounded-full bg-[#00000000] hover:bg-[var(--color-bg-sub-re-hover)]`}
            onClick={() => setIsOpenNewProrationDetail(false)}
          >
            <MdClose className="text-[20px] text-[var(--color-text-title)]" />
          </button>
        )}
        {planType === "old" && (
          <button
            className={`flex-center group absolute right-[20px] top-[10px] z-50 h-[32px] w-[32px] rounded-full bg-[#00000000] hover:bg-[var(--color-bg-sub-re-hover)]`}
            onClick={() => setIsOpenOldProrationDetail(false)}
          >
            <MdClose className="text-[20px] text-[var(--color-text-title)]" />
          </button>
        )}
        {/* クローズボタン ここまで */}
        <div className="flex w-full items-center">
          <h4 className="text-[16px] font-bold text-[var(--color-bg-brand-f)]">
            {planType === "new" ? `新プランの残り期間使用分の日割り料金の詳細` : `旧プランの未使用分の日割り料金の詳細`}
          </h4>
        </div>
        <div className="mt-[12px] flex w-full flex-col space-y-[12px] text-[14px] font-normal">
          <p className="flex items-center space-x-[8px]">
            <span className="text-[16px] font-bold">・</span>
            <span className="!ml-[4px]">今月の契約期間</span>
            <span>：</span>
            <span className="font-bold">
              {format(new Date(nextInvoice.period_start * 1000), "yyyy年MM月dd日")}〜
              {format(new Date(nextInvoice.period_end * 1000), "yyyy年MM月dd日")}
              {!!currentPeriod ? `（${currentPeriod}日間）` : ``}
            </span>
          </p>
          <div className="flex w-full items-center">
            {/* <p className="flex min-w-[50%] items-center space-x-[8px]">
              <span>契約期間の日数</span>
              <span>：</span>
              <span>{!!currentPeriod ? `${currentPeriod}日間` : `-`}</span>
            </p> */}
            <p className="flex min-w-[50%] items-center space-x-[8px]">
              <span className="text-[16px] font-bold">・</span>
              <span className="!ml-[4px]">終了日までの残り日数</span>
              <span>：</span>
              <span className="font-bold">
                {!!remainingDays ? `${remainingDays}日間` : `-`}
                {/* {!!elapsedDays ? `（開始日から${elapsedDays}日経過）` : `-`} */}
              </span>
            </p>
          </div>
          <p className="flex items-center space-x-[8px]">
            <span className="text-[16px] font-bold">・</span>
            <span className="!ml-[4px]">{planType === "new" ? `新プランの価格` : `旧プランの価格`}</span>
            <span>：</span>
            {planType === "new" && (
              <span className="font-bold">
                {!!nextInvoice?.lines?.data[2]?.amount ? `${nextInvoice.lines.data[2].amount}円` : `-`}
                {/* {!!nextInvoice?.lines?.data[2]?.amount
                    ? `${formatToJapaneseYen(nextInvoice.lines.data[2].amount, false)}円`
                    : `-`} */}
              </span>
            )}{" "}
            {planType === "old" && (
              <span className="font-bold">
                {!!nextInvoice?.lines?.data[0]?.plan?.amount && !!nextInvoice?.lines?.data[0]?.quantity
                  ? `${nextInvoice?.lines?.data[0]?.plan?.amount * nextInvoice?.lines?.data[0]?.quantity}円`
                  : `-`}
                {/* {!!nextInvoice?.lines?.data[0]?.plan?.amount && !!nextInvoice?.lines?.data[0]?.quantity
                    ? `${formatToJapaneseYen(
                        nextInvoice?.lines?.data[0]?.plan?.amount * nextInvoice?.lines?.data[0]?.quantity,
                        false
                      )}円`
                    : `-`} */}
              </span>
            )}
            <span>=</span>
            {planType === "new" && (
              <span>
                {!!nextInvoice?.lines?.data[2]?.plan?.amount ? `${nextInvoice.lines.data[2].plan?.amount}/月` : `-`}
                {/* {!!nextInvoice?.lines?.data[2]?.plan?.amount
                    ? `${formatToJapaneseYen(nextInvoice.lines.data[2].plan?.amount, true)}/月`
                    : `-`} */}
              </span>
            )}
            {planType === "old" && (
              <span>
                {!!nextInvoice?.lines?.data[0]?.plan?.amount ? `${nextInvoice.lines.data[0].plan?.amount}/月` : `-`}
                {/* {!!nextInvoice?.lines?.data[0]?.plan?.amount
                    ? `${formatToJapaneseYen(nextInvoice.lines.data[0].plan?.amount, true)}/月`
                    : `-`} */}
              </span>
            )}
            <span>×</span>
            {planType === "new" && (
              <span>
                {!!nextInvoice?.lines?.data[2]?.quantity ? `${nextInvoice.lines.data[2].quantity}個` : `-`}
                {/* {!!nextInvoice?.lines?.data[2]?.quantity
                    ? `${formatToJapaneseYen(nextInvoice.lines.data[2].quantity, false)}個`
                    : `-`} */}
              </span>
            )}
            {planType === "old" && (
              <span>
                {!!nextInvoice?.lines?.data[0]?.quantity ? `${nextInvoice.lines.data[0].quantity}個` : `-`}
                {/* {!!nextInvoice?.lines?.data[0]?.quantity
                    ? `${formatToJapaneseYen(nextInvoice.lines.data[0].quantity, false)}個`
                    : `-`} */}
              </span>
            )}
          </p>
          <p className="flex items-center space-x-[8px]">
            <span className="text-[16px] font-bold">・</span>
            <span className="!ml-[4px]">
              {planType === "new" ? `新プランの1日あたりの使用料` : `旧プランの1日あたりの使用料`}
            </span>
            <span>：</span>

            {planType === "new" && (
              <span className="font-bold">
                {!!nextInvoice?.lines?.data[2]?.amount && !!currentPeriod
                  ? `${Math.round((nextInvoice.lines.data[2].amount / currentPeriod) * 1000) / 1000}円/日`
                  : `-`}
                {/* {!!nextInvoice?.lines?.data[2]?.amount && !!currentPeriod
                    ? `${formatToJapaneseYen(
                        // Math.floor((nextInvoice.lines.data[2].amount / currentPeriod) * 1000) / 1000,
                        Math.round((nextInvoice.lines.data[2].amount / currentPeriod) * 1000) / 1000,
                        // nextInvoice.lines.data[2].amount / currentPeriod,
                        false
                      )}円/日`
                    : `-`} */}
              </span>
            )}
            {planType === "old" && (
              <span className="font-bold">
                {!!nextInvoice?.lines?.data[0]?.plan?.amount &&
                !!nextInvoice?.lines?.data[0]?.quantity &&
                !!currentPeriod
                  ? `${
                      Math.round(
                        ((nextInvoice?.lines?.data[0]?.plan?.amount * nextInvoice?.lines?.data[0]?.quantity) /
                          currentPeriod) *
                          1000
                      ) / 1000
                    }円/日`
                  : `-`}
                {/* {!!nextInvoice?.lines?.data[0]?.plan?.amount &&
                  !!nextInvoice?.lines?.data[0]?.quantity &&
                  !!currentPeriod
                    ? `${formatToJapaneseYen(
                        Math.round(
                          ((nextInvoice?.lines?.data[0]?.plan?.amount * nextInvoice?.lines?.data[0]?.quantity) /
                            currentPeriod) *
                            1000
                        ) / 1000,
                        false
                      )}円/日`
                    : `-`} */}
              </span>
            )}
            <span>=</span>
            {planType === "new" && (
              <span>
                {!!nextInvoice?.lines?.data[2]?.amount ? `${nextInvoice.lines.data[2].amount}円` : `-`}
                {/* {!!nextInvoice?.lines?.data[2]?.amount
                    ? `${formatToJapaneseYen(nextInvoice.lines.data[2].amount, false)}円`
                    : `-`} */}
              </span>
            )}
            {planType === "old" && (
              <span className="font-bold">
                {!!nextInvoice?.lines?.data[0]?.plan?.amount && !!nextInvoice?.lines?.data[0]?.quantity
                  ? `${nextInvoice?.lines?.data[0]?.plan?.amount * nextInvoice?.lines?.data[0]?.quantity}円`
                  : `-`}
                {/* {!!nextInvoice?.lines?.data[0]?.plan?.amount && !!nextInvoice?.lines?.data[0]?.quantity
                    ? `${formatToJapaneseYen(
                        nextInvoice?.lines?.data[0]?.plan?.amount * nextInvoice?.lines?.data[0]?.quantity,
                        false
                      )}円`
                    : `-`} */}
              </span>
            )}
            <span>÷</span>
            <span>{!!currentPeriod ? `${currentPeriod}日` : `-`}</span>
          </p>
          <p className="flex items-center space-x-[8px]">
            <span className="text-[16px] font-bold">・</span>
            <span className="!ml-[4px] min-w-[224px]">
              {planType === "new" ? `新プランの残り利用分の日割り料金` : `旧プランの未使用分の日割り料金`}
            </span>
            <span>：</span>
            {planType === "new" && (
              <span className="font-bold text-[var(--color-text-brand-f)] underline underline-offset-1">
                {!!nextInvoice?.lines?.data[2]?.amount && !!currentPeriod && !!remainingDays
                  ? `${formatToJapaneseYen(
                      Math.round(
                        (Math.round((nextInvoice.lines.data[2].amount / currentPeriod) * 1000) / 1000) * remainingDays
                      ),
                      false
                    )}円`
                  : `-`}
                {/* {!!nextInvoice?.lines?.data[2]?.amount && !!currentPeriod && !!remainingDays
                ? `${formatToJapaneseYen(
                    (Math.round((nextInvoice.lines.data[2].amount / currentPeriod) * 1000) / 1000) * remainingDays,
                    false
                  )}円`
                : `-`} */}
              </span>
            )}
            {planType === "old" && (
              <span className="font-bold text-[var(--bright-red)] underline underline-offset-1">
                {!!nextInvoice?.lines?.data[0]?.plan?.amount &&
                !!nextInvoice?.lines?.data[0]?.quantity &&
                !!currentPeriod &&
                !!remainingDays
                  ? `${formatToJapaneseYen(nextInvoice?.lines?.data[0].amount, false, false)}円`
                  : `-`}
              </span>
            )}
            <span>=</span>
            {planType === "new" && (
              <span>
                {!!nextInvoice?.lines?.data[2]?.amount && !!currentPeriod
                  ? `${Math.round((nextInvoice.lines.data[2].amount / currentPeriod) * 1000) / 1000}円/日`
                  : `-`}
                {/* {!!nextInvoice?.lines?.data[2]?.amount && !!currentPeriod
                    ? `${formatToJapaneseYen(
                        Math.round((nextInvoice.lines.data[2].amount / currentPeriod) * 1000) / 1000,
                        false
                      )}円/日`
                    : `-`} */}
              </span>
            )}
            {planType === "old" && (
              <span>
                {!!nextInvoice?.lines?.data[0]?.plan?.amount &&
                !!nextInvoice?.lines?.data[0]?.quantity &&
                !!currentPeriod
                  ? `${
                      Math.round(
                        ((nextInvoice?.lines?.data[0]?.plan?.amount * nextInvoice?.lines?.data[0]?.quantity) /
                          currentPeriod) *
                          1000
                      ) / 1000
                    }円/日`
                  : `-`}
                {/* {!!nextInvoice?.lines?.data[0]?.plan?.amount &&
                  !!nextInvoice?.lines?.data[0]?.quantity &&
                  !!currentPeriod
                    ? `${formatToJapaneseYen(
                        Math.round(
                          ((nextInvoice?.lines?.data[0]?.plan?.amount * nextInvoice?.lines?.data[0]?.quantity) /
                            currentPeriod) *
                            1000
                        ) / 1000,
                        false
                      )}円/日`
                    : `-`} */}
              </span>
            )}
            <span>×</span>

            {planType === "new" && <span>{!!remainingDays ? `残り${remainingDays}日` : `-`}</span>}
            {planType === "old" && <span>{!!remainingDays ? `残り${remainingDays}日` : `-`}</span>}
          </p>
          <p className="!mt-[2px] flex items-center space-x-[8px]">
            <span className="min-w-[210px]"></span>
            <span className=""></span>
            <span className="text-[13px] text-[var(--color-text-sub)]">
              （
              {planType === "new" &&
                `${
                  !!nextInvoice?.lines?.data[2]?.amount && !!currentPeriod && !!remainingDays
                    ? `${
                        (Math.round((nextInvoice.lines.data[2].amount / currentPeriod) * 1000) / 1000) * remainingDays
                      }円`
                    : `-`
                }`}
              {/* {planType === "new" &&
                  `${
                    !!nextInvoice?.lines?.data[2]?.amount && !!currentPeriod && !!remainingDays
                      ? `${formatToJapaneseYen(
                          (Math.round((nextInvoice.lines.data[2].amount / currentPeriod) * 1000) / 1000) *
                            remainingDays,
                          false
                        )}円`
                      : `-`
                  }`} */}
              {planType === "old" &&
                `${
                  !!nextInvoice?.lines?.data[0]?.plan?.amount &&
                  !!nextInvoice?.lines?.data[0]?.quantity &&
                  !!currentPeriod &&
                  !!remainingDays
                    ? `${
                        Math.round(
                          (Math.round(
                            ((nextInvoice?.lines?.data[0]?.plan?.amount * nextInvoice?.lines?.data[0]?.quantity) /
                              currentPeriod) *
                              1000
                          ) /
                            1000) *
                            remainingDays *
                            1000
                        ) / 1000
                      }円`
                    : `-`
                }`}
              {/* `${
                    !!nextInvoice?.lines?.data[0]?.plan?.amount &&
                    !!nextInvoice?.lines?.data[0]?.quantity &&
                    !!currentPeriod &&
                    !!remainingDays
                      ? `${formatToJapaneseYen(
                          Math.round(
                            (Math.round(
                              ((nextInvoice?.lines?.data[0]?.plan?.amount * nextInvoice?.lines?.data[0]?.quantity) /
                                currentPeriod) *
                                1000
                            ) /
                              1000) *
                              remainingDays *
                              1000
                          ) / 1000,
                          false
                        )}円`
                      : `-`
                  }`} */}
              を四捨五入）
            </span>
          </p>
        </div>
      </div>
    </>
  );
};

export const ProrationDetails = memo(ProrationDetailsMemo);
