import React, { Dispatch, FC, SetStateAction, memo, useRef, useState } from "react";
import styles from "../SettingCompany.module.css";
import { MdClose } from "react-icons/md";
import { teamIllustration } from "@/components/assets";
import { useDownloadUrl } from "@/hooks/useDownloadUrl";
import Image from "next/image";
import useDashboardStore from "@/store/useDashboardStore";
import { HiOutlineSearch } from "react-icons/hi";
import { FiSearch } from "react-icons/fi";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { MemberAccounts } from "@/types";
import { SpinnerComet } from "@/components/Parts/SpinnerComet/SpinnerComet";
import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";

type Props = {
  changeTeamOwnerStep: number | null;
  setChangeTeamOwnerStep: Dispatch<SetStateAction<number | null>>;
  logoUrl: string | null | undefined;
  getCompanyInitial: (value: string) => string;
};

const ChangeTeamOwnerModalMemo: FC<Props> = ({
  changeTeamOwnerStep,
  setChangeTeamOwnerStep,
  logoUrl,
  getCompanyInitial,
}) => {
  const supabase = useSupabaseClient();
  const userProfileState = useDashboardStore((state) => state.userProfileState);

  // 入力値を保持するState
  const [input, setInput] = useState("");
  // 送信されたデータ
  const [searchedInput, setSearchedInput] = useState("");

  // 頭文字のみ抽出
  const getInitial = (name: string) => name[0];

  // ===================================== 無限スクロール =====================================
  // Supabaseからの応答を確実に MemberAccounts[] | null 型に変換するか、あるいはエラーをスローするような関数を作成すると良いでしょう。
  function ensureMemberAccounts(data: any): MemberAccounts[] | null {
    if (Array.isArray(data) && data.length > 0 && "error" in data[0]) {
      // `data` is `GenericStringError[]`
      throw new Error("Failed to fetch member accounts");
    }
    // `data` is `Client_company[] | null`
    return data as MemberAccounts[] | null;
  }

  let fetchNewSearchServerPage: any;

  type DummyType = {
    id: number;
    name: string;
    email: string;
  };

  fetchNewSearchServerPage = async (
    limit: number,
    offset: number = 0
    //   ): Promise<{ rows: MemberAccounts[] | null; nextOffset: number; isLastPage: boolean; count: number | null }> => {
  ): Promise<{ rows: DummyType[] | null; nextOffset: number; isLastPage: boolean; count: number | null }> => {
    const from = offset * limit;
    const to = from + limit - 1;

    // const { data, error, count } = await supabase
    //   .rpc(
    //     "get_members_searched_name",
    //     {
    //       _subscription_id: userProfileState?.subscription_id,
    //       _name: input,
    //     },
    //     { count: "exact" }
    //   )
    //   .range(from, to)
    //   .order("profile_name", { ascending: true });

    // console.log("フェッチ後 count data, from, to, offset, limit", count, data, from, to, offset, limit);

    // if (error) throw error;

    // const rows = ensureMemberAccounts(data);

    // ダミーデータを生成するヘルパー関数
    const generateDummyData = (start: number, end: number) => {
      const dummyData = [];
      for (let i = start; i <= end; i++) {
        dummyData.push({
          id: i,
          name: `Dummy Name ${i}`,
          email: `dummy${i}@example.com`,
        });
      }
      return dummyData;
    };

    // ダミーデータの生成
    const rows = generateDummyData(from, to);

    const count = 200;

    // フェッチしたデータの数が期待される数より少なければ、それが最後のページであると判断します
    const isLastPage = rows === null || rows.length < limit;

    // 0.5秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 取得したrowsを返す（nextOffsetは、queryFnのctx.pageParamsが初回フェッチはundefinedで2回目が1のため+1でページ数と合わせる）
    // return { rows, nextOffset: offset + 1, isLastPage };
    return { rows, nextOffset: offset + 1, isLastPage, count };
  };

  // ================== 🌟useInfiniteQueryフック🌟 ==================
  const { status, data, error, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage, refetch } = useInfiniteQuery(
    {
      // queryKey: ["companies"],
      queryKey: ["members", searchedInput],
      queryFn: async (ctx) => {
        return fetchNewSearchServerPage(10, ctx.pageParam); // 10個ずつ取得
      },

      getNextPageParam: (lastGroup, allGroups) => {
        // lastGroup.isLastPageがtrueならundefinedを返す
        return lastGroup.isLastPage ? undefined : allGroups.length;
      },
      staleTime: Infinity,
    }
  );

  const handleNextFetch = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // 現在取得している全ての行 data.pagesのネストした配列を一つの配列にフラット化
  const Rows = data ? data.pages.flatMap((d) => d?.rows) : [];
  const memberRows = Rows.map((obj, index) => {
    return { index, ...obj };
  });

  console.log("data", data, "allRows", memberRows, "searchedInput", searchedInput, "input", input);
  // ===================================== 無限スクロール ここまで =====================================

  let memberAvatarUrl = false;

  // サーチアイコンをクリックして検索値Stateを更新
  const handleSearchMemberName = () => {
    setSearchedInput(input);
  };

  //   const SkeletonLoading = () => {
  //     return (
  //       <div
  //         className={`flex min-h-[44px] w-full cursor-pointer items-center truncate rounded-[8px] py-[12px] pl-[24px] hover:bg-[var(--setting-side-bg-select)]`}
  //       >
  //         <div
  //           className={`flex-center min-h-[40px] min-w-[40px] cursor-pointer rounded-full text-[#fff] hover:bg-[var(--color-bg-brand-sub-hover)] ${styles.tooltip} mr-[15px] ${styles.skeleton}`}
  //         ></div>
  //         <div className={`flex h-full w-full flex-col space-y-[10px] pl-[5px] text-[12px]`}>
  //           <div className={`h-[13px] w-[90%] rounded-full ${styles.skeleton_delay}`}>
  //             <span></span>
  //           </div>
  //           <div className={`h-[13px] w-[60%] rounded-full ${styles.skeleton_delay}`}></div>
  //         </div>
  //       </div>
  //     );
  //   };

  return (
    <>
      <div className={`${styles.modal_overlay}`} onClick={() => setChangeTeamOwnerStep(null)}></div>
      <div className={`${styles.modal} relative flex`}>
        {/* クローズボタン */}
        <button
          className={`flex-center z-100 group absolute right-[-40px] top-0 h-[32px] w-[32px] rounded-full bg-[#00000090] hover:bg-[#000000c0]`}
          onClick={() => setChangeTeamOwnerStep(null)}
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
                <div className={`text-[var(--color-text-sub)]`}>チーム・2人のメンバー</div>
              </div>
            </div>
            {/* ======= アバター、名前、説明エリア ここまで ======= */}

            {/* ======= 入力、検索エリア ====== */}
            <div className={`relative mt-[15px] flex w-full items-center`}>
              {/* <FiSearch className="absolute left-[8px] top-[50%] translate-y-[-50%] text-[22px]" / */}
              <HiOutlineSearch className="absolute left-[8px] top-[50%] translate-y-[-50%] text-[24px] text-[var(--color-text-sub)]" />
              <input
                type="text"
                placeholder="チームメンバーの検索"
                // required
                // autoFocus
                className={`${styles.input_box} !pl-[40px]`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                //   onBlur={() => setEditedName(toHalfWidth(editedName.trim()))}
                // onBlur={() => setEditedCompanyName(toHalfWidthAndSpace(editedCompanyName.trim()))}
              />
              {input !== "" && (
                <div
                  className="flex-center transition-base03 shadow-all-md group absolute right-[10px] top-[50%] min-h-[32px] min-w-[32px] translate-y-[-50%] cursor-pointer rounded-full border border-solid border-[var(--color-bg-brand-f)] bg-[var(--color-modal-bg-side-c-second)] hover:bg-[var(--color-bg-brand-f90)]"
                  onClick={handleSearchMemberName}
                >
                  <HiOutlineSearch className=" text-[20px] text-[var(--color-text-title)] group-hover:text-[#fff]" />
                </div>
              )}
            </div>
            {/* ======= 入力、検索エリア ここまで ====== */}

            {/* ======= メンバー一覧エリア ======= */}
            <div className={`relative mt-[10px] flex max-h-[290px] w-full flex-col overflow-y-scroll`}>
              <div className={`relative flex w-full flex-col `}>
                {memberRows.map((member, index) => (
                  <div
                    key={member.id}
                    className={`flex min-h-[44px] w-full cursor-pointer items-center truncate rounded-[8px] py-[12px] pl-[24px] hover:bg-[var(--setting-side-bg-select)]`}
                  >
                    {!memberAvatarUrl && (
                      <div
                        // data-text="ユーザー名"
                        className={`flex-center h-[40px] w-[40px] cursor-pointer rounded-full bg-[var(--color-bg-brand-sub)] text-[#fff] hover:bg-[var(--color-bg-brand-sub-hover)] ${styles.tooltip} mr-[15px]`}
                        // onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                        // onMouseLeave={handleCloseTooltip}
                      >
                        <span className={`text-[20px]`}>{getInitial(member.name)}</span>
                      </div>
                    )}
                    {memberAvatarUrl && (
                      <div
                        className={`flex-center mr-[15px] h-[40px] w-[40px] cursor-pointer overflow-hidden rounded-full hover:bg-[#00000020]`}
                      >
                        <Image
                          src=""
                          alt="logo"
                          className={`h-full w-full object-cover text-[#fff]`}
                          width={75}
                          height={75}
                        />
                      </div>
                    )}
                    <div className={`flex h-full flex-col space-y-[3px] pl-[5px] text-[12px]`}>
                      <div className={`text-[13px]`}>
                        <span>{member.name}</span>
                      </div>
                      <div className={`text-[var(--color-text-sub)]`}>{member.email}</div>
                    </div>
                  </div>
                ))}
                {hasNextPage && (
                  <div className="flex-center relative min-h-[64.5px] w-full rounded-[8px] text-[14px]">
                    {isFetchingNextPage ? (
                      <SpinnerComet width="!w-[35px]" height="!h-[35px]" />
                    ) : (
                      <>
                        <div
                          className="flex-center transition-base01 group z-[10] h-[57%] w-[58%] cursor-pointer rounded-full bg-[var(--setting-bg-sub)] text-[var(--color-text-brand-f)] hover:bg-[var(--setting-bg-sub-hover)]"
                          onClick={handleNextFetch}
                        >
                          <span>もっと見る</span>
                        </div>
                        <div className="z-5 absolute left-0 top-[50%] h-[1px] w-full bg-[var(--color-border-light)] "></div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            {/* ======= メンバー一覧エリア ここまで ======= */}
            {/* ======= メンバー一覧エリア ローディングテスト ======= */}
            {/* <div className={`relative mt-[10px] flex min-h-[290px] w-full flex-col`}>
              <div className={`relative flex w-full flex-col `}>
                <SkeletonLoading />
                <SkeletonLoading />
                <SkeletonLoading />
                <SkeletonLoading />
              </div>
            </div> */}
            {/* ======= メンバー一覧エリア ここまで ======= */}
          </div>

          {/* ボタンエリア */}
          <div
            className={`absolute bottom-0 left-0 flex w-full items-center justify-around space-x-5 px-[32px] pb-[32px] pt-[15px]`}
          >
            <button
              className={`w-[50%] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[15px] py-[10px] text-[14px] font-bold text-[var(--color-text-sub)] hover:bg-[var(--setting-side-bg-select-hover)]`}
              onClick={() => setChangeTeamOwnerStep(null)}
            >
              戻る
            </button>
            <button
              className="w-[50%] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[15px] py-[10px] text-[14px] font-bold text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]"
              // onClick={() => {
              //   setChangeTeamOwnerStep(null);
              //   setIsOpenSettingInvitationModal(false);
              //   setSelectedSettingAccountMenu("PaymentAndPlan");
              // }}
            >
              アカウントを増やす
            </button>
          </div>
        </div>
        {/* ======================== データ取得後の左側エリア ここまで ======================== */}

        {/* ======================== 右側エリア ======================== */}
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

export const ChangeTeamOwnerModal = memo(ChangeTeamOwnerModalMemo);
