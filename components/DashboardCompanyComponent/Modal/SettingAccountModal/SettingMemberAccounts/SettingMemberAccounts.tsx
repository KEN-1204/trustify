import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import useStore from "@/store";
import useDashboardStore from "@/store/useDashboardStore";
import useThemeStore from "@/store/useThemeStore";
import axios from "axios";
import { format } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { FC, memo, useEffect, useRef, useState } from "react";
import styles from "./SettingMemberAccounts.module.css";
import { GridRowMember } from "./GridRowMember";
import { useQueryMemberAccounts } from "@/hooks/useQueryMemberAccounts";
import { FiRefreshCw, FiTrash2 } from "react-icons/fi";
import { RippleButton } from "@/components/Parts/RippleButton/RippleButton";
import SpinnerIDS2 from "@/components/Parts/SpinnerIDS/SpinnerIDS2";
import { TestRowData } from "./TestRowData";
import { HiOutlineUsers } from "react-icons/hi2";
import { MdClose } from "react-icons/md";
import { TooltipModal } from "@/components/Parts/Tooltip/TooltipModal";

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
  // メンバー招待ボタンローディング
  const [loading, setLoading] = useState(false);
  // リフェッチローディング
  const [refetchLoading, setRefetchLoading] = useState(false);
  // 未設定アカウントを保持するグローバルState
  const notSetAccounts = useDashboardStore((state) => state.notSetAccounts);
  const setNotSetAccounts = useDashboardStore((state) => state.setNotSetAccounts);
  // ツールチップ
  const setHoveredItemPosModalTooltip = useStore((state) => state.setHoveredItemPosHorizon);
  // // 未設定アカウント数を保持するグローバルState
  // const notSetAccountsCount = useDashboardStore((state) => state.notSetAccountsCount);
  // const setNotSetAccountsCount = useDashboardStore((state) => state.setNotSetAccountsCount);

  const {
    data: memberAccountsDataArray,
    error: useQueryError,
    isLoading: useQueryIsLoading,
    refetch: refetchMemberAccounts,
  } = useQueryMemberAccounts();

  // メンバー数分チェックするStateの配列
  const [checkedMembersArray, setCheckedMembersArray] = useState(
    memberAccountsDataArray
      ? Array(!!memberAccountsDataArray.length ? memberAccountsDataArray.length : 1).fill(false)
      : []
  );

  useEffect(() => {
    if (typeof memberAccountsDataArray === "undefined") return;
    if (!memberAccountsDataArray) {
      setNotSetAccounts([]);
      // setNotSetAccountsCount(null);
      return;
    }
    // // 全メンバーアカウントの数
    // const allAccountsCount = memberAccountsDataArray ? memberAccountsDataArray.length : 0;
    // アカウントの配列からprofilesのidがnullのアカウントのみをフィルタリング
    const nullIdAccounts = memberAccountsDataArray.filter((account) => account.id === null);
    // idがnullのアカウントの数をカウント
    const nullIdCount = nullIdAccounts ? nullIdAccounts.length : 0;
    // // アカウントの配列からidがnullでないアカウントのみをフィルタリング
    // const notNullIdAccounts = memberAccountsDataArray?.filter((account) => account.id !== null);
    // // idがnullでないアカウントの数をカウント
    // const notNullIdCount = notNullIdAccounts ? notNullIdAccounts.length : 0;
    // // 全アカウント数からnullでないアカウントを引いた数
    // const nullIdCount2 = Math.abs(allAccountsCount - notNullIdCount);
    console.log(
      "nullIdAccounts",
      nullIdAccounts,
      "未設定のアカウント数",
      nullIdCount,
      "memberAccountsDataArray",
      memberAccountsDataArray
    );
    // グローバルStateに格納
    // setNotSetAccountsCount(nullIdCount);
    setNotSetAccounts(nullIdAccounts);
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
    useQueryIsLoading,
    "各チェック配列",
    checkedMembersArray
  );

  // ================================ ツールチップ ================================
  const modalContainerRef = useRef<HTMLDivElement | null>(null);
  const hoveredItemPosModal = useStore((state) => state.hoveredItemPosModal);
  const setHoveredItemPosModal = useStore((state) => state.setHoveredItemPosModal);
  const handleOpenTooltip = (e: React.MouseEvent<HTMLElement, MouseEvent>, display: string) => {
    // モーダルコンテナのleftを取得する
    if (!modalContainerRef.current) return;
    const containerLeft = modalContainerRef.current?.getBoundingClientRect().left;
    const containerTop = modalContainerRef.current?.getBoundingClientRect().top;
    // ホバーしたアイテムにツールチップを表示
    const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
    // console.log("ツールチップx, y width , height", x, y, width, height);
    const content2 = ((e.target as HTMLDivElement).dataset.text2 as string)
      ? ((e.target as HTMLDivElement).dataset.text2 as string)
      : "";
    const content3 = ((e.target as HTMLDivElement).dataset.text3 as string)
      ? ((e.target as HTMLDivElement).dataset.text3 as string)
      : "";
    setHoveredItemPosModal({
      x: x - containerLeft,
      y: y - containerTop,
      itemWidth: width,
      itemHeight: height,
      content: (e.target as HTMLDivElement).dataset.text as string,
      content2: content2,
      content3: content3,
      display: display,
    });
  };
  // ============================================================================================
  // ================================ ツールチップを非表示 ================================
  const handleCloseTooltip = () => {
    setHoveredItemPosModal(null);
  };
  // ============================================================================================

  return (
    <>
      {/* 右側メインエリア プロフィール */}
      {selectedSettingAccountMenu === "Member" && (
        <div className={`relative flex h-full w-full flex-col overflow-y-scroll pb-[20px] pl-[20px] pr-[80px]`}>
          <h2 className={`mt-[20px] text-[18px] font-bold`}>
            メンバーアカウント（<span>{userProfileState?.accounts_to_create}</span>）
          </h2>

          <div className="mt-[20px] flex min-h-[168px] w-full items-center justify-between overflow-hidden rounded-[8px] bg-[var(--setting-bg-sub)]">
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

          {/* リフレッシュ・並び替えエリア mtの20px入れたらtop188px、mt覗くと168px hは43 */}
          {/* <div className="relative z-0 mt-[20px] h-[50px] w-full border-b border-[var()] bg-red-100"></div> */}
          <div
            className={`sticky top-[0px] z-10 mt-[10px] flex w-full items-center border-b border-solid border-[var(--color-border-deep)] bg-[var(--color-edit-bg-solid)] py-[8px] pt-[18px]`}
            // className={`sticky top-[168px] z-10 mt-[20px] flex w-full items-center border-b border-solid border-[var(--color-border-deep)] bg-[var(--color-edit-bg-solid)] py-[8px]`}
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
            {!!notSetAccounts.length && (
              <span className="ml-auto mr-[10px] text-[12px] text-[var(--color-text-sub)]">
                メンバー未設定アカウント数：{notSetAccounts.length}
              </span>
            )}
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
              <div role="rowgroup">
                {/* Row2 */}
                {memberAccountsDataArray &&
                  memberAccountsDataArray.map((account, index) => (
                    <React.Fragment key={account.subscribed_account_id}>
                      <GridRowMember
                        memberAccount={account}
                        checkedMembersArray={checkedMembersArray}
                        setCheckedMembersArray={setCheckedMembersArray}
                        index={index}
                      />
                    </React.Fragment>
                  ))}
                {/* <GridRowMember /> */}
                <TestRowData />
                <TestRowData />
                <TestRowData />
                <TestRowData />
                <TestRowData />
                <TestRowData />
                <TestRowData />

                {/* ここまで */}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 右側メインエリア プロフィール ここまで */}
      {/* =================== チェックボックス選択時の一括変更エリア =================== */}
      <div
        className={`shadow-top-sm transition-base03 sticky bottom-0 left-0 z-0 flex h-[80px] w-full  origin-bottom items-center justify-between bg-[var(--color-edit-bg-solid)] px-[24px] py-[8px] text-[13px] ${
          checkedMembersArray.includes(true) ? `scale-y-100` : `mb-[-80px] scale-y-0`
        } `}
        ref={modalContainerRef}
      >
        {hoveredItemPosModal && <TooltipModal />}
        <div className="flex items-center justify-start">
          <p>（{checkedMembersArray.filter((value) => value === true).length}件）選択済み</p>
        </div>
        <div className="flex-center">
          <div className="flex-center space-x-3">
            <div
              className="flex-center relative h-[35px] w-[35px] cursor-pointer rounded-[4px] text-[20px] hover:bg-[var(--setting-bg-sub)]"
              data-text="役割を変更"
              onMouseEnter={(e) => handleOpenTooltip(e, "top")}
              onMouseLeave={handleCloseTooltip}
            >
              <HiOutlineUsers className="stroke-2" />
            </div>
            <div
              className="flex-center relative h-[35px] w-[35px] cursor-pointer rounded-[4px] text-[20px] hover:bg-[var(--setting-bg-sub)]"
              data-text="メンバーをチームから削除"
              onMouseEnter={(e) => handleOpenTooltip(e, "top")}
              onMouseLeave={handleCloseTooltip}
            >
              <FiTrash2 />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end">
          <div className="flex-center space-x-3">
            <div className="flex-center h-[35px] w-[35px]">
              <div
                className={`${styles.grid_select_cell_header} ${styles.checked_area_input_cell}`}
                data-text="全てのメンバーを選択"
                onMouseEnter={(e) => handleOpenTooltip(e, "top")}
                onMouseLeave={handleCloseTooltip}
              >
                <input
                  type="checkbox"
                  // checked={checkedMembersArray[index]}
                  // onChange={() => {
                  //   const newCheckedArray = [...checkedMembersArray];
                  //   newCheckedArray[index] = !checkedMembersArray[index];
                  //   setCheckedMembersArray(newCheckedArray);
                  checked={true}
                  onChange={() => {
                    console.log("クリック");
                  }}
                  // checked={checked}
                  // onChange={() => setChecked(!checked)}
                  className={`${styles.checked_area_input} relative`}
                />
                <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                </svg>
              </div>
            </div>
            <div
              className="flex-center h-[35px] w-[35px] cursor-pointer rounded-[4px] text-[24px] hover:bg-[var(--setting-bg-sub)]"
              onClick={() => {
                const newCheckArray = checkedMembersArray.map((value) => false);
                console.log("クローズクリック", newCheckArray);
                setCheckedMembersArray(newCheckArray);
              }}
            >
              <MdClose className="" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const SettingMemberAccounts = memo(SettingMemberAccountsMemo);
