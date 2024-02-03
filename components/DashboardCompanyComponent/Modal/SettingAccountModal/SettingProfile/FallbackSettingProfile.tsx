import { Fragment } from "react";
import styles from "../SettingAccountModal.module.css";
import { SkeletonLoadingRound } from "@/components/Parts/SkeletonLoading/SkeletonLoadingRound";
import { SkeletonLoadingLineCustom } from "@/components/Parts/SkeletonLoading/SkeletonLoadingLineCustom";

type Props = {
  title?: string;
};

export const FallbackSettingProfile = ({ title = "プロフィール" }: Props) => {
  return (
    <>
      <div className={`relative flex h-full w-full flex-col overflow-y-scroll py-[20px] pl-[20px] pr-[80px]`}>
        {/* <div className={`text-[18px] font-bold`}>{title}</div> */}
        <div className="flex max-h-[27px] min-h-[27px] items-center">
          <SkeletonLoadingLineCustom w="250px" h="21px" rounded="3px" />
        </div>

        {/* プロフィール画像エリア */}
        <div className={`mt-[30px] flex min-h-[120px] w-full flex-col `}>
          {/* <div className={`${styles.section_title}`}>プロフィール画像</div> */}
          <div className={`${styles.section_title} max-h-[21px]`}>
            <div className="flex min-h-[21px] items-center">
              <SkeletonLoadingLineCustom w="150px" h="13px" rounded="3px" />
            </div>
          </div>
          <div className={`flex h-full max-h-[99px] w-full items-center justify-between`}>
            <div className="">
              {/* <label
                data-text="ユーザー名"
                htmlFor="avatar"
                className={`flex-center h-[75px] w-[75px] cursor-pointer rounded-full bg-[var(--color-bg-brand-sub)] text-[#fff] hover:bg-[var(--color-bg-brand-sub-hover)] ${styles.tooltip} mr-[15px]`}
              >
                <span className={`text-[30px]`}>N</span>
              </label> */}
              <SkeletonLoadingRound size={75} />
            </div>
            <div className="flex">
              <label htmlFor="avatar">
                {/* <div
                  className={`transition-base01 flex-center max-h-[41px] max-w-[120px] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                >
                  <span>画像を変更</span>
                </div> */}
                <SkeletonLoadingLineCustom w="120px" h="41px" rounded="8px" />
              </label>
            </div>
          </div>
        </div>
        {/* プロフィール画像エリア */}

        <div className={`min-h-[1px] w-full bg-[var(--color-border-deep)]`}></div>

        {/* コンテンツエリア */}
        {/* Row */}
        {Array(5)
          .fill(null)
          .map((_, index) => (
            <Fragment key={index}>
              <div className={`mt-[20px] flex max-h-[95px] min-h-[95px] w-full flex-col`}>
                {/* <div className={`${styles.section_title}`}>名前</div> */}
                <div className={`${styles.section_title}`}>
                  <SkeletonLoadingLineCustom w="200px" rounded="3px" />
                </div>
                <div className={`flex h-full w-full items-center justify-between`}>
                  {/* <div className={`${styles.section_value}`}>未設定</div> */}
                  <div className={`${styles.section_value}`}>
                    <SkeletonLoadingLineCustom w="300px" h="27px" rounded="3px" />
                  </div>
                  <div>
                    {/* <div
                      className={`transition-base01 min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    >
                      編集
                    </div> */}
                    <SkeletonLoadingLineCustom w="78px" h="41px" rounded="8px" />
                  </div>
                </div>
              </div>
              <div className={`min-h-[1px] w-full bg-[var(--color-border-deep)]`}></div>
            </Fragment>
          ))}
        {/* Row */}
      </div>
      {/* 右側メインエリア プロフィール ここまで */}
    </>
  );
};
