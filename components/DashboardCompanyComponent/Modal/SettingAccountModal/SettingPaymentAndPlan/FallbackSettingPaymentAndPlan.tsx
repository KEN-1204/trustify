import { SkeletonLoading } from "@/components/Parts/SkeletonLoading/SkeletonLoading";
import { SkeletonLoadingLineLong } from "@/components/Parts/SkeletonLoading/SkeletonLoadingLineLong";
import { SkeletonLoadingLineShort } from "@/components/Parts/SkeletonLoading/SkeletonLoadingLineShort";

export const FallbackSettingPaymentAndPlan = () => {
  return (
    <>
      <div className={`flex h-full w-full flex-col overflow-y-scroll py-[20px] pl-[20px] pr-[80px]`}>
        <h2 className={`text-[18px] font-bold !text-[var(--color-text-title)]`}>支払いとプラン</h2>

        <div className="mt-[20px] min-h-[55px] w-full">
          <h4 className="text-[18px] font-bold !text-[var(--color-text-title)]">
            会社・チームのサブスクリプション：
            {/* <span>{userProfileState?.profile_name}さんのチーム</span> */}
          </h4>
          <div
            className={`mt-[24px] flex w-full flex-col rounded-[4px] border border-solid border-[var(--color-border-deep)] p-[16px]`}
          >
            <div className="flex w-full">
              {/* <div className="flex-center min-h-[56px] min-w-[56px] rounded-[4px] border border-solid border-[var(--color-border-deep)]">
                <Image width="35" height="35" src="/assets/images/icons/icons8-crown-48.png" alt="crown" />
              </div> */}

              <div
                className={`ml-[-20px] flex h-[56px] w-full items-center text-[18px] font-bold !text-[var(--color-text-title)]`}
              >
                {/* <h4>{columnNameToJapanese(userProfileState?.subscription_plan)}</h4> */}
                <SkeletonLoading />
              </div>
            </div>

            <div>
              <div className="mt-[16px] flex w-full items-center text-[15px] text-[var(--color-text-sub)]">
                <p className="min-w-fit">次回請求予定日：</p>
                <SkeletonLoadingLineLong />
              </div>
              <div className="mt-[8px] flex w-full items-center text-[15px] text-[var(--color-text-sub)]">
                <p>メンバーアカウント：</p>
                <SkeletonLoadingLineShort />
              </div>
            </div>

            <div className="mt-[16px] flex w-full">
              <button
                className={`transition-base01 flex-center max-h-[41px] w-full min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] text-[14px] font-bold !text-[var(--color-text-title)]`}
              >
                <span>プランを変更</span>
              </button>
            </div>
            <div className="mt-[16px] flex w-full space-x-8">
              <div className="relative w-[50%] min-w-[78px]">
                <button
                  className={`transition-base02 flex-center relative max-h-[41px] w-full cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[25px] py-[10px] text-[14px] font-bold !text-[#fff]`}
                >
                  <span>アカウントを増やす</span>
                </button>
              </div>
              <button
                className={`transition-base01 flex-center max-h-[41px] w-[50%] min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--color-bg-sub)] px-[25px] py-[10px] text-[14px] font-bold !text-[var(--color-text-title)]`}
              >
                <span>アカウントを減らす</span>
              </button>
            </div>
          </div>

          <div className={`mt-[12px] flex w-full flex-col space-y-2 text-[15px] text-[var(--color-text-sub)]`}>
            <div className="flex w-full items-center justify-end">
              <span className="ml-auto cursor-pointer hover:text-[var(--color-text-brand-f)] hover:underline">
                お支払い方法の設定
              </span>
            </div>
            <div className="flex w-full items-center justify-end">
              <span className="ml-auto cursor-pointer hover:text-[var(--color-text-brand-f)] hover:underline">
                メンバーシップのキャンセル
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
