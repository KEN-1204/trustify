import { dataIllustration } from "@/components/assets";
import React from "react";
import { FiRefreshCw } from "react-icons/fi";
import styles from "./SettingMemberAccounts.module.css";
import { SkeletonLoading } from "@/components/Parts/SkeletonLoading/SkeletonLoading";

export const FallbackSettingMemberAccounts = () => {
  return (
    <>
      <div className={`relative flex h-full w-full flex-col overflow-y-scroll pb-[20px] pl-[20px] pr-[80px]`}>
        <h2 className={`mt-[20px] text-[18px] font-bold`}>メンバーアカウント</h2>

        <div className="mt-[20px] flex min-h-[168px] w-full items-center justify-between overflow-hidden rounded-[8px] bg-[var(--setting-bg-sub)]">
          {/* <div className="sticky top-0 z-10 mt-[20px] flex min-h-[168px] w-full items-center justify-between overflow-hidden rounded-[8px] bg-[var(--setting-bg-sub)]"> */}
          <div className="flex flex-col space-y-3 p-[24px] pr-[0px]">
            <h4 className="font-bold">チーム全員がデータを残すかどうかが勝負の分かれ目</h4>
            <p className="text-[13px]">
              <span>コラボレーションとデータサイエンスを駆使して、仕事を素早く終わらせましょう</span>
            </p>
            <div className="w-full">
              <button
                className={`transition-base01 flex-center mt-[10px] max-h-[41px] w-[138px] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[15px] py-[10px] text-[14px] font-bold text-[#fff]`}
              >
                <span>メンバーを招待</span>
              </button>
            </div>
          </div>

          {/* <div className={`flex-center h-full w-[30%]`}>
              <Image src={`/assets/images/icons/icons8-share-64.png`} alt="share-icon" width={70} height={70} />
            </div> */}
          <div className={`flex h-full w-[30%] items-center`}>
            <div className="ml-[10px]">{dataIllustration}</div>
          </div>
        </div>

        {/* リフレッシュ・並び替えエリア mtの20px入れたらtop188px、mt覗くと168px hは43 */}
        {/* <div className="relative z-0 mt-[20px] h-[50px] w-full border-b border-[var()] bg-red-100"></div> */}
        <div
          className={`sticky top-[0px] z-10 mt-[10px] flex w-full items-center border-b border-solid border-[var(--color-border-deep)] bg-[var(--color-edit-bg-solid)] py-[8px] pt-[18px]`}
          // className={`sticky top-[168px] z-10 mt-[20px] flex w-full items-center border-b border-solid border-[var(--color-border-deep)] bg-[var(--color-edit-bg-solid)] py-[8px]`}
        >
          <button
            className={`flex-center transition-base03 relative  h-[26px] min-w-[118px]  cursor-pointer space-x-1  rounded-[4px] border border-solid border-transparent px-[15px] text-[12px] text-[var(--color-text-sub)] hover:border-[var(--color-bg-brand-f)] hover:bg-[var(--setting-bg-sub)] hover:text-[var(--color-text)] ${styles.fh_text_btn}`}
          >
            <div className="flex-center mr-[2px]">
              <FiRefreshCw />
            </div>
            <span className="whitespace-nowrap">リフレッシュ</span>
          </button>
          <div className="ml-auto mr-[10px] text-[12px] text-[var(--color-text-sub)]"></div>
        </div>

        {/* メンバーテーブル sticky mtありでtop231、なしで211 */}
        <div className="relative z-0 mt-[0px] w-full">
          <div role="grid" className="w-full">
            <div role="row" className={`${styles.grid_row} sticky top-[53px] z-10 bg-[var(--color-edit-bg-solid)]`}>
              {/* <div role="row" className={`${styles.grid_row} sticky top-[211px]`}> */}
              <div role="columnheader" className={styles.column_header}>
                氏名
              </div>
              <div role="columnheader" className={styles.column_header}>
                メールアドレス
              </div>
              <div role="columnheader" className={styles.column_header}>
                チームでの役割
              </div>
              <div role="columnheader" className={styles.column_header}></div>
            </div>
            <div role="rowgroup" className="pb-[calc(74px*7)]">
              {Array(4)
                .fill(null)
                .map((_, index) => (
                  <div role="row" key={index} className={`${styles.fallback_grid_row}`}>
                    <SkeletonLoading />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
      {/* 右側メインエリア プロフィール ここまで */}
    </>
  );
};
