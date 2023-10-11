import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import useStore from "@/store";
import useDashboardStore from "@/store/useDashboardStore";
import useThemeStore from "@/store/useThemeStore";
import axios from "axios";
import { format } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { FC, memo, useEffect, useState } from "react";
import styles from "./SettingMemberAccounts.module.css";
import { GridRowMember } from "./GridRowMember";
import { useQueryMemberAccounts } from "@/hooks/useQueryMemberAccounts";
import { FiRefreshCw } from "react-icons/fi";
import { RippleButton } from "@/components/Parts/RippleButton/RippleButton";
import SpinnerIDS2 from "@/components/Parts/SpinnerIDS/SpinnerIDS2";

const SettingMemberAccountsMemo: FC = () => {
  const theme = useThemeStore((state) => state.theme);
  const selectedSettingAccountMenu = useDashboardStore((state) => state.selectedSettingAccountMenu);
  // 上画面の選択中の列データ会社
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  // 招待メールモーダル
  const setIsOpenSettingInvitationModal = useDashboardStore((state) => state.setIsOpenSettingInvitationModal);
  // セッション情報
  const sessionState = useStore((state) => state.sessionState);
  // router
  const router = useRouter();
  // チェックボックス
  const [checked, setChecked] = useState(false);
  // メンバー招待ボタンローディング
  const [loading, setLoading] = useState(false);
  // リフェッチローディング
  const [refetchLoading, setRefetchLoading] = useState(false);
  // 未設定アカウント数を保持するグローバルState
  const notSetAccounts = useDashboardStore((state) => state.notSetAccounts);
  const setNotSetAccounts = useDashboardStore((state) => state.setNotSetAccounts);

  const {
    data: memberAccountsDataArray,
    error: useQueryError,
    isLoading: useQueryIsLoading,
    refetch: refetchMemberAccounts,
  } = useQueryMemberAccounts();

  useEffect(() => {
    if (typeof memberAccountsDataArray === "undefined") return;
    // // 全メンバーアカウントの数
    // const allAccountsCount = memberAccountsDataArray ? memberAccountsDataArray.length : 0;
    // アカウントの配列からidがnullのアカウントのみをフィルタリング
    const nullIdAccounts = memberAccountsDataArray?.filter((account) => account.id === null);
    // idがnullのアカウントの数をカウント
    const nullIdCount = nullIdAccounts ? nullIdAccounts.length : 0;
    // // アカウントの配列からidがnullでないアカウントのみをフィルタリング
    // const notNullIdAccounts = memberAccountsDataArray?.filter((account) => account.id !== null);
    // // idがnullでないアカウントの数をカウント
    // const notNullIdCount = notNullIdAccounts ? notNullIdAccounts.length : 0;
    // // 全アカウント数からnullでないアカウントを引いた数
    // const nullIdCount2 = Math.abs(allAccountsCount - notNullIdCount);
    console.log("未設定のアカウント数", nullIdCount);
    // グローバルStateに格納
    setNotSetAccounts(nullIdCount);
    // console.log(
    //   "nullIdCount",
    //   nullIdCount,
    //   "引いた数nullIdCount2",
    //   nullIdCount2,
    //   "全アカウント数",
    //   memberAccountsDataArray?.length,
    //   "nullでないアカウント数",
    //   notNullIdCount
    // );
  }, [memberAccountsDataArray, setNotSetAccounts]);

  // useQueryMemberAccountsで製品テーブルからデータ一覧を取得
  console.log(
    "useQuery前 ",
    "userProfileState?.subscription_id",
    userProfileState?.subscription_id,
    "memberAccountsDataArray",
    memberAccountsDataArray,
    "useQueryError",
    useQueryError,
    "useQueryIsLoading",
    useQueryIsLoading
  );

  return (
    <>
      {/* 右側メインエリア プロフィール */}
      {selectedSettingAccountMenu === "Member" && (
        <div className={`relative flex h-full w-full flex-col overflow-y-scroll py-[20px] pl-[20px]`}>
          <h2 className={`text-[18px] font-bold`}>
            メンバーアカウント（<span>{userProfileState?.accounts_to_create}</span>）
          </h2>

          <div className="sticky top-0 z-10 mt-[20px] flex min-h-[168px] w-full items-center justify-between overflow-hidden rounded-[8px] bg-[var(--setting-bg-sub)]">
            {/* <div className="sticky top-0 z-10 mt-[20px] flex min-h-[168px] w-full items-center justify-between overflow-hidden rounded-[8px] bg-[var(--setting-bg-sub)]"> */}
            <div className="flex flex-col space-y-3 p-[24px] pr-[0px]">
              <h4 className="font-bold">チーム全員がデータを残すかどうかが勝負の分かれ目</h4>
              <p className="text-[13px]">
                <span>コラボレーションとデータサイエンスを駆使して、仕事を素早く終わらせましょう</span>
              </p>
              <div className="w-full">
                <button
                  className={`transition-base01 flex-center max-h-[41px] w-[138px] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[15px] py-[10px] text-[14px] font-bold text-[#fff]  ${
                    loading ? `` : `hover:bg-[var(--color-bg-brand-f-deep)]`
                  } mt-[10px]`}
                  onClick={() => setIsOpenSettingInvitationModal(true)}
                >
                  <span>メンバーを招待</span>
                  {loading && <SpinnerIDS scale={"scale-[0.4]"} />}
                </button>
              </div>
            </div>
            {/* <div className={`${styles.left_container} h-full w-[30%]`}></div> */}
            <div className={`flex-center h-full w-[30%]`}>
              <Image src={`/assets/images/icons/icons8-share-64.png`} alt="share-icon" width={70} height={70} />
            </div>
          </div>

          {/* リフレッシュ・並び替えエリア */}
          {/* <div className="relative z-0 mt-[20px] h-[50px] w-full border-b border-[var()] bg-red-100"></div> */}
          <div
            className={`mt-[20px] flex w-full items-center border-b border-solid border-[var(--color-border-deep)] py-[8px]`}
          >
            <button
              className={`flex-center transition-base03 relative  h-[26px] min-w-[118px]  cursor-pointer space-x-1  rounded-[4px] border border-solid border-transparent px-[15px] text-[12px] text-[var(--color-text-sub)] hover:border-[var(--color-bg-brand-f)] hover:bg-[var(--setting-bg-sub)] hover:text-[var(--color-text)] ${styles.fh_text_btn}`}
              onClick={async () => {
                console.log("リフレッシュ クリック");
                setRefetchLoading(true);
                //   await queryClient.invalidateQueries({ queryKey: ["companies"] });
                await refetchMemberAccounts();
                setRefetchLoading(false);
              }}
            >
              {/* <FiRefreshCw /> */}
              {/* {!refetchLoading && <SpinnerIDS scale={"scale-[0.2]"} width={12} height={12} />} */}
              {refetchLoading && (
                <div className="relative">
                  <div className="mr-[2px] h-[12px] w-[12px]"></div>
                  <SpinnerIDS2 fontSize={20} width={20} height={20} />
                </div>
              )}
              {!refetchLoading && (
                <div className="flex-center mr-[2px]">
                  <FiRefreshCw />
                </div>
              )}
              <span className="whitespace-nowrap">リフレッシュ</span>
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
            {notSetAccounts && (
              <span className="ml-auto mr-[10px] text-[12px] text-[var(--color-text-sub)]">
                メンバー未設定アカウント数：{notSetAccounts}
              </span>
            )}
          </div>

          {/* メンバーテーブル */}
          <div className="relative z-0 mt-[0px] w-full">
            <div role="grid" className="w-full">
              <div role="row" className={`${styles.grid_row}`}>
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
              <div role="rowgroup">
                {/* Row2 */}
                {memberAccountsDataArray &&
                  memberAccountsDataArray.map((account, index) => (
                    <React.Fragment key={account.subscribed_account_id}>
                      <GridRowMember memberAccount={account} />
                    </React.Fragment>
                  ))}
                {/* <GridRowMember /> */}
                {/* <TestRowData />
                <TestRowData />
                <TestRowData />
                <TestRowData />
                <TestRowData />
                <TestRowData />
                <TestRowData /> */}

                {/* ここまで */}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 右側メインエリア プロフィール ここまで */}
    </>
  );
};

export const SettingMemberAccounts = memo(SettingMemberAccountsMemo);
