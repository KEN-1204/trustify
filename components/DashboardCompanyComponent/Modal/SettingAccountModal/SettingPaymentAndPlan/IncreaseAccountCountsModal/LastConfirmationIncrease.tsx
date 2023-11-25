import useDashboardStore from "@/store/useDashboardStore";
import React from "react";
import { MdClose } from "react-icons/md";

type Props = {
  totalQuantity: number;
  newPlanAmount: number;
  nextInvoiceAmount: number;
};

export const LastConfirmationIncrease = () => {
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  return (
    <div className={`clear_overlay_absolute fade02 z-[2000] rounded-[7px] bg-[var(--color-overlay-black-md)]`}>
      <div className="absolute left-[50%] top-[50%] z-[100] min-w-[576px] translate-x-[-50%] translate-y-[-50%] rounded-[8px] bg-[var(--color-bg-notification-modal)] p-[32px] text-[var(--color-text-title)]">
        {/* クローズボタン */}
        <button
          className={`flex-center z-100 group absolute right-[-40px] top-0 h-[32px] w-[32px] rounded-full bg-[#00000090] hover:bg-[#000000c0]`}
          //   onClick={() => {
          //     setOpenNotificationChangeTeamOwnerModal(false);
          //   }}
        >
          <MdClose className="text-[20px] text-[#fff]" />
        </button>
        <h3 className={`flex min-h-[32px] w-full items-center text-[22px] font-bold`}>
          この内容でアカウントを増やしてもよろしいですか？
        </h3>
        <section className={`flex h-auto w-full flex-col text-[14px]`}>
          <ul className="mt-[20px] flex w-full list-disc flex-col space-y-3 pl-[15px]">
            <li className="">アカウントの数量：３個</li>
            <li className="">更新後の月額料金：1480円</li>
            <li className="">次回ご請求時のお支払額：1000円</li>
          </ul>
          <p className="mt-[15px] text-[13px] text-[var(--color-text-sub)] ">
            「アカウントを増やす」をクリックすることで、あなたは
            <span className="font-bold">{userProfileState?.customer_name ?? `チーム`}</span>
            の所有者としてキャンセルするまで更新後の料金が請求されることに同意したものとみなされます。
          </p>
        </section>
        <section className="flex w-full items-start justify-end">
          <div className={`flex w-[100%] items-center justify-around space-x-5 pt-[24px]`}>
            <button
              className={`w-[50%] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[15px] py-[10px] text-[14px] font-bold text-[var(--color-text-title)] hover:bg-[var(--setting-side-bg-select-hover)]`}
              //   onClick={handleDeclineChangeTeamOwner}
            >
              戻る
            </button>
            <button
              className="w-[50%] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[15px] py-[10px] text-[14px] font-bold text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]"
              //   onClick={() => {
              //     handleAcceptChangeTeamOwner();
              //   }}
            >
              アカウントを増やす
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
