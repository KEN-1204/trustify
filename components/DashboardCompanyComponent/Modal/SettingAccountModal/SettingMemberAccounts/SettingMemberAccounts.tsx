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
import { dataIllustration } from "@/components/assets";
import { toast } from "react-toastify";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQueryClient } from "@tanstack/react-query";
import { MemberAccounts } from "@/types";
import { compareAccounts } from "@/utils/Helpers/getRoleRank";

const SettingMemberAccountsMemo: FC = () => {
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();
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
  // 未設定かつ削除予定アカウントを保持するグローバルState
  const notSetAndDeleteRequestedAccounts = useDashboardStore((state) => state.notSetAndDeleteRequestedAccounts);
  const setNotSetAndDeleteRequestedAccounts = useDashboardStore((state) => state.setNotSetAndDeleteRequestedAccounts);
  // ツールチップ
  const setHoveredItemPosModalTooltip = useStore((state) => state.setHoveredItemPosHorizon);
  // // 未設定アカウント数を保持するグローバルState
  // const notSetAccountsCount = useDashboardStore((state) => state.notSetAccountsCount);
  // const setNotSetAccountsCount = useDashboardStore((state) => state.setNotSetAccountsCount);
  // 一括役割変更ドロップダウンメニュー開閉状態
  const [openChangeRoleTogetherMenu, setOpenChangeRoleTogetherMenu] = useState(false);
  // // チームから削除を選択した場合に削除ターゲットを保持するState
  // const removeTeamMember = useDashboardStore((state) => state.removeTeamMember);
  // const setRemoveTeamMember = useDashboardStore((state) => state.setRemoveTeamMember);
  // // チームロールドロップダウンメニュー
  // const isOpenRoleMenu = useDashboardStore((state) => state.isOpenRoleMenu);
  // const setIsOpenRoleMenu = useDashboardStore((state) => state.setIsOpenRoleMenu);

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

  const [sortedMemberAccountsState, setSortedMemberAccountsState] = useState<MemberAccounts[]>([]);
  useEffect(() => {
    if (typeof memberAccountsDataArray === "undefined") return;
    if (!memberAccountsDataArray) {
      setNotSetAccounts([]);
      // setNotSetAccountsCount(null);
      return;
    }
    // // 全メンバーアカウントの数
    // const allAccountsCount = memberAccountsDataArray ? memberAccountsDataArray.length : 0;
    // アカウントの配列からprofilesのidがnull、かつ、invited_emailがnullで招待中でないアカウントのみをフィルタリング
    const nullIdAccounts = memberAccountsDataArray.filter(
      (account) => account.id === null && account.account_invited_email === null && account.account_state === "active"
    );

    // 削除予定のアカウントを取得してグローバルStateに格納
    const deleteRequestedAccounts = memberAccountsDataArray.filter(
      (account) =>
        account.id === null && account.account_invited_email === null && account.account_state === "delete_requested"
    );

    // idがnullのアカウントの数をカウント
    const nullIdCount = nullIdAccounts ? nullIdAccounts.length : 0;
    // // アカウントの配列からidがnullでないアカウントのみをフィルタリング
    // const notNullIdAccounts = memberAccountsDataArray?.filter((account) => account.id !== null);
    // // idがnullでないアカウントの数をカウント
    // const notNullIdCount = notNullIdAccounts ? notNullIdAccounts.length : 0;
    // // 全アカウント数からnullでないアカウントを引いた数
    // const nullIdCount2 = Math.abs(allAccountsCount - notNullIdCount);

    // メンバーアカウントを並び替え 全てのセクションであいうえお順
    // 1番上が所有者: account_company_role
    // 次が管理者: account_company_role
    // マネージャー: account_company_role
    // メンバー: account_company_role
    // ゲスト: account_company_role
    // 招待済み: id有りだが、profile_name無し
    // 未設定: id有りだが、profile_name無し

    const sortedMemberAccountsArray = memberAccountsDataArray.sort(compareAccounts);
    setSortedMemberAccountsState(sortedMemberAccountsArray);

    console.log(
      "nullIdAccounts",
      nullIdAccounts,
      "未設定のアクティブアカウント数",
      nullIdCount,
      "削除リクエスト済みアカウント数",
      deleteRequestedAccounts,
      "memberAccountsDataArray",
      memberAccountsDataArray,
      "sortedMemberAccountsArray",
      sortedMemberAccountsArray
    );
    // グローバルStateに格納
    // setNotSetAccountsCount(nullIdCount);
    setNotSetAccounts(nullIdAccounts);
    setNotSetAndDeleteRequestedAccounts(deleteRequestedAccounts);
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
    "並び替え後sortedMemberAccountsState",
    sortedMemberAccountsState,
    "useQueryError",
    useQueryError,
    "useQueryIsLoading",
    useQueryIsLoading,
    "各チェック配列checkedMembersArray",
    checkedMembersArray
  );

  // ================================ 一括で役割を変更する関数 ================================
  // 役割の変更関数
  const handleChangeRole = async (companyRole: string, subscribed_account_id: string) => {
    const { error } = await supabase
      .from("subscribed_accounts")
      .update({ company_role: companyRole })
      .eq("id", subscribed_account_id)
      .select("company_role");

    if (error) throw new Error(error.message);
    console.log("役割変更成功", subscribed_account_id);
  };

  // 一括役割変更関数
  const handleChangeRoleTogether = async (role: string) => {
    if (!memberAccountsDataArray || memberAccountsDataArray.length === 0) return;

    setLoading(true);
    try {
      const newMemberArray: MemberAccounts[] = [...memberAccountsDataArray];
      const promises = newMemberArray.map((member: MemberAccounts, i) => {
        if (checkedMembersArray[i] === true && member.account_company_role !== "company_owner") {
          console.log("役割変更 i", i);
          return handleChangeRole(role, member.subscribed_account_id!);
        }
        return null;
      });

      await Promise.all(promises);
      console.log("全ての非同期処理が完了 invalidateQueriesで再フェッチ");
      await queryClient.invalidateQueries({ queryKey: ["member_accounts"] });
      toast.success("すべての役割の変更が完了しました!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        // theme: `${theme === "light" ? "light" : "dark"}`,
      });
    } catch (error: any) {
      console.error("役割変更エラー", error.message);
      toast.error("役割の変更に失敗しました!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        // theme: `${theme === "light" ? "light" : "dark"}`,
      });
    }
    setLoading(false);
    setOpenChangeRoleTogetherMenu(false);
  };
  // ================================ 一括で役割を変更する関数 ここまで ================================

  // ================================ 一括でメンバーを削除する関数 ================================
  const [openRemoveTeamTogetherModal, setOpenRemoveTeamTogetherModal] = useState(false);
  // チームから削除する関数
  const removeFromTeam = async (subscribed_account_id: string) => {
    // subscribed_accountsのuser_idカラムをnullにして契約アカウントとの紐付けを解除する
    const { data: newAccountData, error: accountUpdateError } = await supabase
      .from("subscribed_accounts")
      .update({
        user_id: null,
        company_role: null,
      })
      .eq("id", subscribed_account_id)
      .select();

    if (accountUpdateError) throw new Error(accountUpdateError.message);

    console.log("紐付け削除UPDATEが成功したアカウントデータ", newAccountData);
  };
  // 一括メンバー削除関数
  const handleRemoveFromTeamTogether = async () => {
    if (!memberAccountsDataArray || memberAccountsDataArray.length === 0) return;

    setLoading(true);
    try {
      const newMemberArray: MemberAccounts[] = [...memberAccountsDataArray];
      const promises = newMemberArray.map((member: MemberAccounts, i) => {
        if (checkedMembersArray[i] === true && member.account_company_role !== "company_owner") {
          console.log("紐付け削除 i", i);
          return removeFromTeam(member.subscribed_account_id!);
        }
        return null;
      });

      await Promise.all(promises);
      console.log("全ての非同期処理が完了 invalidateQueriesで再フェッチ");
      await queryClient.invalidateQueries({ queryKey: ["member_accounts"] });
      toast.success("選択したメンバーをチームから削除しました!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        // theme: `${theme === "light" ? "light" : "dark"}`,
      });
    } catch (error: any) {
      console.error("役割変更エラー", error.message);
      toast.error("チームからの削除に失敗しました!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        // theme: `${theme === "light" ? "light" : "dark"}`,
      });
    }
    setLoading(false);
    setOpenRemoveTeamTogetherModal(false);
    // 全てのチェックをfalseにして外し、一括操作エリアを閉じる
    const newCheckArray = checkedMembersArray.map((value) => false);
    setCheckedMembersArray(newCheckArray);
  };
  // ================================ 一括でメンバーを削除する関数 ここまで ================================

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
      {/* オーバーレイ */}
      {loading && (
        <div className={`flex-center fixed inset-0 z-[3000] bg-[#00000090]`}>
          <SpinnerIDS scale={"scale-[0.5]"} />
        </div>
      )}
      {/* 右側メインエリア メンバーアカウント */}
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
            <div className="ml-auto mr-[10px] text-[12px] text-[var(--color-text-sub)]">
              {!!notSetAccounts.length && (
                <span className={`${!!notSetAndDeleteRequestedAccounts.length ? `mr-[40px]` : ``}`}>
                  メンバー未設定アカウント数：{notSetAccounts.length}
                </span>
              )}

              {!!notSetAndDeleteRequestedAccounts.length && (
                <span className="">削除リクエスト済みアカウント数：{notSetAndDeleteRequestedAccounts.length}</span>
              )}
            </div>
          </div>

          {/* メンバーテーブル sticky mtありでtop231、なしで211 */}
          <div className="z-5 relative mt-[0px] w-full">
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
                {/* Row2 */}
                {/* 並び替え有りバージョン */}
                {sortedMemberAccountsState &&
                  sortedMemberAccountsState.map((account, index) => (
                    <React.Fragment key={account.subscribed_account_id}>
                      <GridRowMember
                        memberAccount={account}
                        checkedMembersArray={checkedMembersArray}
                        setCheckedMembersArray={setCheckedMembersArray}
                        index={index}
                      />
                    </React.Fragment>
                  ))}
                {/* 並び替え無しバージョン */}
                {/* {memberAccountsDataArray &&
                  memberAccountsDataArray.map((account, index) => (
                    <React.Fragment key={account.subscribed_account_id}>
                      <GridRowMember
                        memberAccount={account}
                        checkedMembersArray={checkedMembersArray}
                        setCheckedMembersArray={setCheckedMembersArray}
                        index={index}
                      />
                    </React.Fragment>
                  ))} */}
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
      {/* =================== チェックボックス選択時の一括変更エリア =================== */}
      <div
        className={`shadow-top-md transition-base03 sticky bottom-0 left-0 z-[1000] flex h-[80px] w-full  origin-bottom items-center justify-between bg-[var(--color-edit-bg-solid)] px-[24px] py-[8px] text-[13px] ${
          checkedMembersArray.includes(true) ? `scale-y-100` : `mb-[-80px] scale-y-0`
        } `}
        ref={modalContainerRef}
      >
        {/* 一括処理オーバーレイ */}
        {openChangeRoleTogetherMenu && (
          <div
            className="fixed left-[-100vw] top-[-100vh] z-[100] h-[200vh] w-[200vw]"
            onClick={() => setOpenChangeRoleTogetherMenu(false)}
          ></div>
        )}
        {hoveredItemPosModal && <TooltipModal />}
        <div className="flex items-center justify-start">
          <p>（{checkedMembersArray.filter((value) => value === true).length}件）選択済み</p>
        </div>
        <div className="flex-center">
          <div className="flex-center space-x-3">
            <div
              className={`flex-center relative h-[35px] w-[35px] cursor-pointer rounded-[4px] text-[20px] hover:bg-[var(--setting-bg-sub)] ${
                openChangeRoleTogetherMenu ? `bg-[var(--setting-bg-sub)]` : ``
              }`}
              data-text="役割を変更"
              onMouseEnter={(e) => {
                if (openChangeRoleTogetherMenu) return;
                handleOpenTooltip(e, "top");
              }}
              onMouseLeave={handleCloseTooltip}
              onClick={() => setOpenChangeRoleTogetherMenu(true)}
            >
              <HiOutlineUsers className="stroke-2" />
              {/* =============== まとめて役割変更ドロップダウンメニュー =============== */}
              {openChangeRoleTogetherMenu && (
                <>
                  {/* <div
                    className="fixed left-[-100vw] top-[-100vh] z-[1000] h-[200vh] w-[200vw] bg-red-100"
                    onClick={() => setOpenChangeRoleTogetherMenu(false)}
                  ></div> */}

                  {/* 通常時 h-[152px] 招待中時 */}
                  <div className="shadow-all-md  absolute left-[-calc(200px-50%)] top-[-331px] z-[2000] h-auto min-w-[400px] rounded-[8px] bg-[var(--color-bg-dropdown-menu)]">
                    <ul className={`flex flex-col py-[0px]`}>
                      <li
                        className={`flex min-h-[78px] w-full cursor-pointer flex-col space-y-1 px-[14px] py-[10px] pr-[18px] text-[var(--color-text-title)] hover:bg-[var(--color-bg-sub)]`}
                        onClick={() => {
                          handleChangeRoleTogether("company_admin");
                        }}
                      >
                        <span className="select-none text-[14px] font-bold">管理者</span>
                        <p className="select-none text-[12px]">
                          会社・チームの編集、メンバーの管理、招待、製品の追加、編集ができます。
                        </p>
                      </li>
                      <li
                        className={`flex min-h-[78px] w-full cursor-pointer flex-col space-y-1 px-[14px] py-[10px] pr-[18px] text-[var(--color-text-title)] hover:bg-[var(--color-bg-sub)]`}
                        onClick={() => {
                          handleChangeRoleTogether("company_manager");
                        }}
                      >
                        <span className="select-none text-[14px] font-bold">マネージャー</span>
                        <p className="select-none text-[12px]">
                          製品の追加、編集、チーム全体の成果の確認、他メンバーの活動の編集、削除が可能です。
                        </p>
                      </li>
                      <li
                        className={`flex min-h-[78px] w-full cursor-pointer flex-col space-y-1 px-[14px] py-[10px] pr-[18px] text-[var(--color-text-title)] hover:bg-[var(--color-bg-sub)]`}
                        onClick={() => {
                          handleChangeRoleTogether("company_member");
                        }}
                      >
                        <span className="select-none text-[14px] font-bold">メンバー</span>
                        <p className="select-none text-[12px]">係、ユニット、メンバー自身の成果の確認が可能です。</p>
                      </li>
                      <li
                        className={`flex min-h-[78px] w-full cursor-pointer flex-col space-y-1 px-[14px] py-[10px] pr-[18px] text-[var(--color-text-title)] hover:bg-[var(--color-bg-sub)]`}
                        onClick={() => {
                          handleChangeRoleTogether("guest");
                        }}
                      >
                        <span className="select-none text-[14px] font-bold">ゲスト</span>
                        <p className="select-none text-[12px]">
                          通常の営業活動の記録、編集のみ行えます。一時的に営業活動に参画してもらう担当者に最適です。
                        </p>
                      </li>
                      {/* <li className="flex-center h-[16px] w-full">
                        <hr className="w-full border-t border-solid border-[var(--color-border-table)]" />
                      </li> */}
                    </ul>
                  </div>
                </>
              )}
              {/* まとめて役割変更ドロップダウンメニュー ここまで */}
            </div>
            <div
              className="flex-center relative h-[35px] w-[35px] cursor-pointer rounded-[4px] text-[20px] hover:bg-[var(--setting-bg-sub)]"
              data-text="メンバーをチームから削除"
              onMouseEnter={(e) => handleOpenTooltip(e, "top")}
              onMouseLeave={handleCloseTooltip}
              onClick={() => setOpenRemoveTeamTogetherModal(true)}
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
                // data-text="全てのメンバーを選択"
                data-text={`${
                  checkedMembersArray.includes(false) ? `全てのメンバーを選択` : `全てのメンバーのチェックを外す`
                }`}
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
                  // defaultChecked={true}
                  checked={!checkedMembersArray.includes(false)}
                  onChange={() => {
                    if (checkedMembersArray.includes(false)) {
                      const newCheckArray = checkedMembersArray.map((value) => true);
                      console.log("全てをチェック", newCheckArray);
                      setCheckedMembersArray(newCheckArray);
                    } else {
                      const newCheckArray = checkedMembersArray.map((value) => false);
                      console.log("全てのチェックを外す", newCheckArray);
                      setCheckedMembersArray(newCheckArray);
                    }
                  }}
                  onClick={() => {}}
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
      {/* ============================== 一括でチームから削除モーダル ============================== */}
      {openRemoveTeamTogetherModal && (
        <>
          {/* オーバーレイ */}
          <div
            className="fixed left-[-100vw] top-[-100vh] z-[1000] h-[200vh] w-[200vw] bg-[var(--color-overlay)] backdrop-blur-sm"
            onClick={() => {
              console.log("オーバーレイ クリック");
              setOpenRemoveTeamTogetherModal(false);
              //   setNotificationDataState(null);
            }}
          ></div>
          <div className="fade02 fixed left-[50%] top-[50%] z-[2000] h-auto w-[40vw] translate-x-[-50%] translate-y-[-50%] rounded-[8px] bg-[var(--color-bg-notification-modal)] p-[32px] text-[var(--color-text-title)]">
            {loading && (
              <div className={`flex-center fixed left-0 top-0 z-[3000] h-[100%] w-[100%] rounded-[8px] bg-[#00000090]`}>
                <SpinnerIDS scale={"scale-[0.5]"} />
              </div>
            )}
            {/* クローズボタン */}
            <button
              className={`flex-center z-100 group absolute right-[-40px] top-0 h-[32px] w-[32px] rounded-full bg-[#00000090] hover:bg-[#000000c0]`}
              onClick={() => {
                setOpenRemoveTeamTogetherModal(false);
                // setNotificationDataState(null);
              }}
            >
              <MdClose className="text-[20px] text-[#fff]" />
            </button>
            <h3 className={`flex min-h-[32px] w-full items-center text-[22px] font-bold`}>
              選択したチームのメンバーを削除しますか？
            </h3>
            <section className={`mt-[20px] flex h-auto w-full flex-col text-[14px]`}>
              <p>これらの人を削除すると、削除された人が保存したデータやコンテンツにアクセスできなくなります。</p>
            </section>
            <section className="flex w-full items-start justify-end">
              <div className={`flex w-[100%] items-center justify-around space-x-5 pt-[30px]`}>
                <button
                  className={`w-[50%] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[15px] py-[10px] text-[14px] font-bold text-[var(--color-text-title)] hover:bg-[var(--setting-side-bg-select-hover)]`}
                  onClick={() => setOpenRemoveTeamTogetherModal(false)}
                >
                  キャンセル
                </button>
                <button
                  className="w-[50%] cursor-pointer rounded-[8px] bg-[var(--color-red-tk)] px-[15px] py-[10px] text-[14px] font-bold text-[#fff] hover:bg-[var(--color-red-tk-hover)]"
                  onClick={handleRemoveFromTeamTogether}
                >
                  チームから削除する
                </button>
              </div>
            </section>
          </div>
        </>
      )}
      {/* ============================== 一括でチームから削除モーダル ここまで ============================== */}
    </>
  );
};

export const SettingMemberAccounts = memo(SettingMemberAccountsMemo);
