import React, { memo, useEffect, useRef, useState } from "react";
import styles from "./IncreaseAccountCountsModal.module.css";
import { BsCheck2 } from "react-icons/bs";
import { MdClose } from "react-icons/md";
import Vertical_SlideCards from "@/components/Parts/Vertical_SlideCards/Vertical_SlideCards";
import { HiOutlineLink, HiPlus } from "react-icons/hi2";
import { SkeletonLoading } from "@/components/Parts/SkeletonLoading/SkeletonLoading";
import { SkeletonLoadingLines } from "@/components/Parts/SkeletonLoading/SkeletonLoadingLines";
import { SkeletonLoadingLineShort } from "@/components/Parts/SkeletonLoading/SkeletonLoadingLineShort";
import { SkeletonLoadingLineLong } from "@/components/Parts/SkeletonLoading/SkeletonLoadingLineLong";
import { SkeletonLoadingLineMedium } from "@/components/Parts/SkeletonLoading/SkeletonLoadingLineMedium";

export const FallbackIncreaseAccountCountsModal = () => {
  return (
    <>
      <div className={`${styles.overlay} `} />

      <div className={`${styles.container} `}>
        {/* クローズボタン */}
        {/* <button
          className={`flex-center group absolute right-[-40px] top-0 z-10 h-[32px] w-[32px] rounded-full bg-[#00000090] hover:bg-[#000000c0]`}
        >
          <MdClose className="text-[20px] text-[#fff]" />
        </button> */}
        {/* メインコンテンツ コンテナ */}
        <div className={`${styles.main_contents_container}`}>
          <div className={`${styles.left_container} relative h-full w-5/12`}>
            <div className="relative w-full overflow-y-auto px-[40px] pb-[calc(116px+20px)] pt-[40px]">
              <h1 className={`mt-[10px] w-full text-[24px] font-bold`}>いくつアカウントを増やしますか？</h1>
              <div
                className={`flex min-h-[109px] w-full flex-col space-y-[2px] py-[20px] text-[15px] text-[var(--color-text-sub)]`}
              >
                <p>メンバー1人当たり月額￥の追加料金のみで利用可能</p>
                {/* <p className="min-h-[20px]  w-full"></p> */}
                <p>チーム全体で共同作業して、TRSUSTiFYの機能を最大限に活用しましょう。</p>
              </div>

              {/* <div className="mt-[10px] flex max-h-[35px] min-h-[35px] w-full items-center justify-between text-[15px]">
                <h4 className="flex space-x-3">
                  <BsCheck2 className="min-h-[24px] min-w-[24px] stroke-1 text-[24px] text-[#00d436]" />
                  <span>ビシネスプラン：</span>
                </h4>
                <div className="flex flex-col items-end text-[13px] font-bold">
                  <span className="">円</span>
                  <span className="">/アカウント</span>
                </div>
              </div>
              <div className="mt-[20px] flex max-h-[35px] min-h-[35px] w-full items-center justify-between text-[15px]">
                <h4 className="flex space-x-3">
                  <BsCheck2 className="min-h-[24px] min-w-[24px] stroke-1 text-[24px] text-[#00d436]" />
                  <span>現在契約中のアカウント数：</span>
                </h4>
                <span className="font-bold">個</span>
              </div>

              
              <div className="mt-[20px] flex w-full items-center justify-between text-[var(--color-text-title)]">
                <h4 className="relative flex min-w-max items-center space-x-3 text-[15px]">
                  <HiPlus className="min-h-[24px] min-w-[24px] stroke-[1.5] text-[24px] text-[var(--color-bg-brand-f)]" />
                  <span>新たに増やすアカウント数：</span>
                </h4>
                <div className="flex items-center justify-end space-x-2">
                  <div className="font-bold">個</div>
                </div>
              </div> */}
              <div className="ml-[-24px] mt-[0px] flex  w-full flex-col text-[var(--color-text-title)]">
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
            <div className="shadow-top-md absolute bottom-0 left-0 min-h-[293px] w-full space-y-4  rounded-bl-[8px] bg-[var(--color-edit-bg-solid)] px-[32px] pb-[32px] pt-[18px]">
              <div className="flex min-h-[112px]  w-full max-w-[415px] flex-col text-[13px] text-[var(--color-text-title)]">
                <div className="mt-[10px] flex flex-col space-y-3">
                  {/* <div className="flex w-full items-start justify-between">
                    <span className="max-w-[290px]">アカウントを増やした場合に次回請求で発生する追加費用</span>
                    <span className="">￥</span>
                  </div>
                  <div className="flex w-full items-start justify-between font-bold">
                    <span>本日のお支払い</span>
                    <span>￥0</span>
                  </div> */}
                  <div className="mb-[24px] flex w-full flex-col items-start space-y-[18px]">
                    <SkeletonLoadingLineLong />
                    <SkeletonLoadingLineMedium />
                    <SkeletonLoadingLineShort />
                  </div>
                </div>
              </div>
              <button
                className={`flex-center h-[40px] w-full cursor-not-allowed rounded-[6px] bg-[var(--color-bg-brand-f)] font-bold text-[#fff]`}
              >
                <span>変更の確定</span>
              </button>
              <div className="flex w-full flex-col  text-[13px] text-[var(--color-text-sub)]">
                <p>
                  確定することにより、キャンセルするまで更新後の料金が請求されることに同意したものとみなされます。お好きな時にいつでもキャンセルでき、それ以降は請求されません。
                </p>
              </div>
            </div>
          </div>
          <div className={`${styles.right_container} flex-col-center h-full w-7/12`}>
            <Vertical_SlideCards />
            <div className={`mb-[-30px] flex max-w-[500px] flex-col justify-center space-y-5 py-[30px]`}>
              <div className="flex space-x-3">
                <BsCheck2 className="min-h-[24px] min-w-[24px] stroke-1 text-[24px] text-[#00d436]" />
                <p>全メンバーの活動データを１ヶ所に集約</p>
              </div>
              <div className="flex space-x-3">
                <BsCheck2 className="min-h-[24px] min-w-[24px] stroke-1 text-[24px] text-[#00d436]" />
                <p>データを分析・活用可能にして資産を構築</p>
              </div>
              <div className="flex space-x-3">
                <BsCheck2 className="min-h-[24px] min-w-[24px] stroke-1 text-[24px] text-[#00d436]" />
                <p>全メンバーがいつでもリアルタイムにデータにアクセス・追加・編集が可能に</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
