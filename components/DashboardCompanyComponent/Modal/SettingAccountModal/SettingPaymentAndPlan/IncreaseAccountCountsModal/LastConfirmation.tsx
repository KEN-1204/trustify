import React from "react";
import { MdClose } from "react-icons/md";

export const LastConfirmation = () => {
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
        <section className={`mt-[15px] flex h-auto w-full flex-col text-[14px]`}>
          <p>
            <span className="font-bold">ユーザー名</span>（<span className="font-bold">email</span>
            ）が<span className="font-bold">会社名</span>
            の所有者として、代わりにあなたを任命しました。この任命を受け入れると、以下に同意したものとみなされます。
          </p>
          <ul className="mt-[20px] flex w-full list-disc flex-col space-y-3 pl-[15px]">
            <li className="">
              このチーム、チームメンバー、チームのコンテンツを管理する管理者権限を新たに受け入れます。
            </li>
            <li className="">
              このチームのメンバーが作成し、このチーム内に保存される、既存および今後のコンテンツ全てに対する責任を負います。
            </li>
            <li className="">
              TRUSTiFYの利用規約がこのチームの所有権に適用されることに同意し、プライバシーポリシーを読みました。
            </li>
          </ul>
        </section>
        <section className="flex w-full items-start justify-end">
          <div className={`flex w-[100%] items-center justify-around space-x-5 pt-[30px]`}>
            <button
              className={`w-[50%] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[15px] py-[10px] text-[14px] font-bold text-[var(--color-text-title)] hover:bg-[var(--setting-side-bg-select-hover)]`}
              //   onClick={handleDeclineChangeTeamOwner}
            >
              所有権を拒否する
            </button>
            <button
              className="w-[50%] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[15px] py-[10px] text-[14px] font-bold text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]"
              //   onClick={() => {
              //     handleAcceptChangeTeamOwner();
              //   }}
            >
              所有権を受け入れる
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
