import { dataIllustration } from "@/components/assets";
import React from "react";
import { FiRefreshCw } from "react-icons/fi";
import styles from "./SettingMemberAccounts.module.css";
import { SkeletonLoading } from "@/components/Parts/SkeletonLoading/SkeletonLoading";
import { CiFilter } from "react-icons/ci";

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
              <span>コラボレーションとデータサイエンスを駆使して、付加価値を最大化させましょう</span>
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
            className={`flex-center transition-bg03 relative  h-[26px] min-w-[110px]  cursor-pointer space-x-1  rounded-[4px] border border-solid border-transparent px-[6px] text-[12px] text-[var(--color-text-sub)] hover:border-[var(--color-bg-brand-f)] hover:bg-[var(--setting-bg-sub)] hover:text-[var(--color-text)] ${styles.fh_text_btn}`}
          >
            {/* <FiRefreshCw /> */}
            {/* {!refetchLoading && <SpinnerIDS scale={"scale-[0.2]"} width={12} height={12} />} */}
            <div className="flex-center mr-[2px]">
              <FiRefreshCw />
            </div>
            <span className="whitespace-nowrap">リフレッシュ</span>
          </button>
          <button
            className={`flex-center transition-bg03 relative  ml-[4px] h-[26px]  min-w-[100px]  space-x-1 rounded-[4px] border border-solid border-transparent px-[6px] text-[12px] hover:border-[var(--color-bg-brand-f)] hover:bg-[var(--setting-bg-sub)] ${styles.fh_text_btn} hover:text-[var(--color-text)]} cursor-default text-[var(--color-text-sub)]`}
          >
            <div className="flex-center mr-[1px]">
              <CiFilter className="stroke-[0.5] text-[17px]" />
            </div>
            <span className="whitespace-nowrap">フィルター</span>
          </button>
          {/* <RippleButton
              title={`リフレッシュ`}
              // bgColor="var(--color-btn-brand-f-re)"
              border="var(--color-btn-brand-f-re-hover)"
              borderRadius="2px"
              classText={`select-none`}
              clickEventHandler={() => {
                //   if (tableContainerSize === "all") return;
                //   console.log("クリック コンテナ高さ変更 All");
                //   setTableContainerSize("all");
                console.log("新規サーチ クリック");
              }}
            /> */}
          <div className="ml-auto mr-[10px] text-[12px] text-[var(--color-text-sub)]">
            {/* {!!notSetAccounts.length && (
              // <span className={`${!!notSetAndDeleteRequestedAccounts.length ? `mr-[40px]` : ``}`}>
              <span className={`mr-[20px] ${!!notSetAndDeleteRequestedAccounts.length ? `mr-[40px]` : ``}`}>
                メンバー未設定アカウント数：{notSetAccounts.length}
              </span>
            )} */}

            {/* {!!notSetAndDeleteRequestedAccounts.length && (
              <span className="">削除リクエスト済みアカウント数：{notSetAndDeleteRequestedAccounts.length}</span>
            )} */}
            {/* <span className="">削除リクエスト済みアカウント数：6</span> */}
          </div>
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
                    <SkeletonLoading pl={`pl-[8px]`} />
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
