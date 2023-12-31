import { SkeletonLoading } from "@/components/Parts/SkeletonLoading/SkeletonLoading";
import { teamIllustration } from "@/components/assets";
import Image from "next/image";
import React, { FC, memo } from "react";
import { HiOutlineSearch } from "react-icons/hi";
import { MdClose } from "react-icons/md";
import styles from "./SettingCompany.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";

type Props = {
  changeTeamOwnerStep: number | null;
  logoUrl: string | null | undefined;
  getCompanyInitial: (payload: string) => string;
};

const FallbackChangeOwnerMemo: FC<Props> = ({ changeTeamOwnerStep, logoUrl, getCompanyInitial }) => {
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  return (
    <>
      <div className={`${styles.modal_overlay}`}></div>
      <div className={`${styles.modal} relative flex`}>
        {/* クローズボタン */}
        <button
          className={`flex-center z-100 group absolute right-[-40px] top-0 h-[32px] w-[32px] rounded-full bg-[#00000090] hover:bg-[#000000c0]`}
        >
          <MdClose className="text-[20px] text-[#fff]" />
        </button>
        <div className={`relative flex h-full w-[42%] flex-col items-center p-[32px]`}>
          <div className="flex h-auto w-[100%] flex-col text-[16px]">
            <div className="relative flex h-[25px] w-full items-center">
              {/* プログレスライン */}
              <div className="absolute left-0 top-[50%] z-[-1] h-[1px] w-[65px] bg-[var(--color-progress-bg)]"></div>
              {/* ○ */}
              <div
                className={`flex-center mr-[15px] h-[25px] w-[25px] rounded-full border border-solid  ${
                  changeTeamOwnerStep === 1
                    ? `border-[var(--color-bg-brand-f)] bg-[var(--color-bg-brand-f)] text-[#fff]`
                    : `border-[var(--color-border-light)] bg-[var(--color-edit-bg-solid)] text-[var(--color-text-sub)]`
                }`}
              >
                <span className={`text-[12px] font-bold`}>1</span>
              </div>
              {/* ○ */}
              <div
                className={`flex-center mr-[15px] h-[25px] w-[25px] rounded-full border border-solid  ${
                  changeTeamOwnerStep === 2
                    ? `border-[var(--color-bg-brand-f)] bg-[var(--color-bg-brand-f)] text-[#fff]`
                    : `border-[var(--color-border-light)] bg-[var(--color-edit-bg-solid)] text-[var(--color-text-sub)]`
                }`}
              >
                <span className={`text-[12px] font-bold`}>2</span>
              </div>
            </div>
            {/*  */}
            <div className="mt-[15px] flex w-full flex-col text-[22px] font-bold">
              <h2>チームの所有者の変更</h2>
            </div>
            {/* ======= アバター、名前、説明エリア ここまで ======= */}
            <div className={`mt-[15px] flex min-h-[44px] w-full items-center truncate pl-[4px]`}>
              {!logoUrl && (
                <div
                  // data-text="ユーザー名"
                  className={`flex-center h-[40px] w-[40px] cursor-pointer rounded-full bg-[var(--color-bg-brand-sub)] text-[#fff] hover:bg-[var(--color-bg-brand-sub-hover)] ${styles.tooltip} mr-[15px]`}
                  // onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                  // onMouseLeave={handleCloseTooltip}
                >
                  {/* <span>K</span> */}
                  <span className={`text-[20px]`}>
                    {userProfileState?.customer_name
                      ? getCompanyInitial(userProfileState.customer_name)
                      : `${getCompanyInitial("NoName")}`}
                  </span>
                </div>
              )}
              {logoUrl && (
                <div
                  className={`flex-center mr-[15px] h-[40px] w-[40px] cursor-pointer overflow-hidden rounded-full hover:bg-[#00000020]`}
                >
                  <Image
                    src={logoUrl}
                    alt="logo"
                    className={`h-full w-full object-cover text-[#fff]`}
                    width={75}
                    height={75}
                  />
                </div>
              )}
              <div className={`flex h-full flex-col pt-[4px] text-[12px]`}>
                <div className={`text-[13px]`}>
                  <span>{userProfileState?.customer_name}</span>
                </div>
                <div className={`text-[var(--color-text-sub)]`}>チーム・ 人のメンバー</div>
              </div>
            </div>
            {/* ======= アバター、名前、説明エリア ここまで ======= */}
            {/* ======= 入力、検索エリア ====== */}
            <div className={`relative mt-[15px] flex w-full items-center`}>
              <HiOutlineSearch className="absolute left-[8px] top-[50%] translate-y-[-50%] text-[24px] text-[var(--color-text-sub)]" />
              {/* <div className="flex-center absolute left-[28px] top-[50%] translate-y-[-50%]">
                <SpinnerIDS />
              </div> */}
              <input
                type="text"
                placeholder=""
                className={`${styles.input_box} !pl-[40px]`}
                // value={input}
                // onChange={(e) => setInput(e.target.value)}
              />
            </div>
            {/* ======= 入力、検索エリア ここまで ====== */}
            <div className="min--h-[290px] relative mt-[10px] flex w-full flex-col">
              <div className={`relative flex w-full flex-col`}>
                {/* <SkeletonLoading />
                <SkeletonLoading />
                <SkeletonLoading />
                <SkeletonLoading /> */}
                {Array(4)
                  .fill(null)
                  .map((_, index) => (
                    <React.Fragment key={index}>
                      <SkeletonLoading />
                    </React.Fragment>
                  ))}
              </div>
            </div>
            {/* ボタンエリア */}
            <div
              className={`absolute bottom-0 left-0 flex w-full items-center justify-around space-x-5 px-[32px] pb-[32px] pt-[15px]`}
            >
              {/* <button
                className={`w-[50%] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[15px] py-[10px] text-[14px] font-bold text-[var(--color-text-sub)] hover:bg-[var(--setting-side-bg-select-hover)]`}
              >
                戻る
              </button>
              <button className="w-[50%] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[15px] py-[10px] text-[14px] font-bold text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]">
                アカウントを増やす
              </button> */}
              <button
                className={`w-[100%] cursor-pointer rounded-[8px] bg-[var(--color-bg-sub)] px-[15px] py-[10px] text-[14px] font-bold text-[var(--color-text-disabled)]`}
              >
                続行
              </button>
            </div>
          </div>
        </div>
        <div
          className={`relative flex h-full w-[58%] flex-col items-center justify-center ${styles.modal_right_container}`}
        >
          <div className="z-10 mb-[-30px]">{teamIllustration}</div>
          <div className="z-0 flex min-h-[57%] w-[70%] flex-col rounded-[8px] bg-[var(--color-modal-bg-side-c-second)] px-[24px] pb-[8px] pt-[58px] text-[var(--color-text-title)]">
            <p className={`text-[14px] font-bold`}>方法は以下の通りです。</p>
            <div className="mt-[12px] flex h-auto w-full text-[14px]">
              <p className="mr-[4px]">1.</p>
              <p>あなたの代わりとして、チームの誰かを所有者に任命します。</p>
            </div>
            <div className="mt-[16px] flex h-auto w-full text-[14px]">
              <p className="mr-[4px]">2.</p>
              <div className="flex w-full flex-col">
                <p>任命されたメンバーが承諾するのを待ちます。</p>
                <p className="mt-[4px] text-[12px] text-[var(--color-text-sub)]">
                  任命された人は、このチーム、チームメンバー、チームコンテンツの新しい管理者権限を持つことになります。
                </p>
              </div>
            </div>
            <div className="mt-[16px] flex h-auto w-full text-[14px]">
              <p className="mr-[4px]">3.</p>
              <div className="flex w-full flex-col">
                <p>任命されたメンバーが承諾すると、あなたの役割は所有者から管理者に切り替わります。</p>
                <p className="mt-[4px] text-[12px] text-[var(--color-text-sub)]">
                  新しい所有者が承諾すると、この操作を元に戻すことはできません。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const FallbackChangeOwner = memo(FallbackChangeOwnerMemo);
