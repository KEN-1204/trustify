import React, { memo, useEffect, useRef, useState } from "react";
import styles from "./DecreaseAccountCountsModal.module.css";
import { MdClose } from "react-icons/md";
import { windyDayIllustration } from "@/components/assets";
import { SkeletonLoading } from "@/components/Parts/SkeletonLoading/SkeletonLoading";
import { SkeletonLoadingLineLong } from "@/components/Parts/SkeletonLoading/SkeletonLoadingLineLong";
import { SkeletonLoadingLineShort } from "@/components/Parts/SkeletonLoading/SkeletonLoadingLineShort";

export const FallbackDecreaseAccountCountsModal = () => {
  return (
    <>
      <div className={`${styles.overlay} `} />

      <div className={`${styles.container} `}>
        {/* クローズボタン */}
        <button
          className={`flex-center group absolute right-[-40px] top-0 z-10 h-[32px] w-[32px] rounded-full bg-[#00000090] hover:bg-[#000000c0]`}
        >
          <MdClose className="text-[20px] text-[#fff]" />
        </button>
        {/* メインコンテンツ コンテナ */}
        <div className={`${styles.main_contents_container}`}>
          <div className={`${styles.left_container} relative h-full w-5/12`}>
            <div className="relative w-full overflow-y-auto px-[40px] pb-[calc(116px+20px)] pt-[40px]">
              <h1 className={`mt-[10px] w-full text-[24px] font-bold`}>いくつアカウントを減らしますか？</h1>
              <div className={`flex w-full flex-col space-y-[2px] py-[20px] text-[15px] text-[var(--color-text-sub)]`}>
                <p>チーム全体で共同作業して、TRSUSTiFYの機能を最大限に活用しましょう。</p>
              </div>
              <div className="mt-[0px] flex  w-full flex-col text-[var(--color-text-title)]">
                {Array(3)
                  .fill(null)
                  .map((_, index) => (
                    <React.Fragment key={index}>
                      <SkeletonLoading />
                    </React.Fragment>
                  ))}
              </div>
            </div>

            {/* 変更の確定を送信するボタンエリア */}
            <div className="shadow-top-md absolute bottom-0 left-0 w-full space-y-4  rounded-bl-[8px] bg-[var(--color-edit-bg-solid)] px-[32px] pb-[32px] pt-[18px]">
              <div className="flex w-full flex-col  text-[13px] text-[var(--color-text-title)]">
                <div className="flex flex-col space-y-3">
                  <div className="mb-[10px] flex w-full flex-col items-start space-y-[10px]">
                    <SkeletonLoadingLineLong />
                    <SkeletonLoadingLineShort />
                  </div>
                </div>
              </div>
              <button
                className={`flex-center h-[40px] w-full cursor-pointer rounded-[6px] bg-[var(--color-bg-brand-f)]  font-bold text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`}
              >
                <span>変更の確定</span>
              </button>
            </div>
          </div>
          {/* ======================== 右側エリア ======================== */}
          <div className={`relative flex h-full w-7/12 flex-col items-center justify-center ${styles.right_container}`}>
            <div className="z-10 mb-[-70px]">{windyDayIllustration}</div>
            <div className="z-0 mb-[100px] flex h-auto w-[70%] flex-col rounded-[8px] bg-[var(--color-modal-bg-side-c-second)] px-[24px] pb-[48px] pt-[58px] text-[var(--color-text-title)]">
              <p className={`text-[14px] font-bold`}>方法は以下の通りです。</p>
              <div className="mt-[12px] flex h-auto w-full text-[14px]">
                <p className="mr-[4px]">1.</p>
                <div className="flex w-full flex-col">
                  <p>減らしたい個数分、メンバーアカウントを未設定の状態にします。</p>
                  <p className="mt-[4px] text-[12px] text-[var(--color-text-sub)]">
                    メンバー管理画面から、アカウントに紐づいているメンバーを削除してアカウントを未設定の状態にします。
                  </p>
                </div>
              </div>
              <div className="mt-[16px] flex h-auto w-full text-[14px]">
                <p className="mr-[4px]">2.</p>
                <div className="flex w-full flex-col">
                  <p>削除するアカウント数を減らしたい個数に設定します</p>
                </div>
              </div>
              <div className="mt-[16px] flex h-auto w-full text-[14px]">
                <p className="mr-[4px]">3.</p>
                <div className="flex w-full flex-col">
                  <p>変更の確定ボタンをクリックすることで契約アカウント数の変更が完了します。</p>
                  <p className="mt-[4px] text-[12px] text-[var(--color-text-sub)]">
                    変更したアカウント数での請求内容は次回請求の次から反映されます。
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* ======================== 右側エリア ここまで ======================== */}
        </div>
      </div>
    </>
  );
};
