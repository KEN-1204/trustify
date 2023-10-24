import React, { Dispatch, FC, SetStateAction, memo, useEffect, useRef, useState } from "react";
import styles from "../SettingCompany.module.css";
import { MdClose } from "react-icons/md";
import { teamIllustration } from "@/components/assets";
import { useDownloadUrl } from "@/hooks/useDownloadUrl";
import Image from "next/image";
import useDashboardStore from "@/store/useDashboardStore";
import { HiOutlineSearch } from "react-icons/hi";
import { FiSearch } from "react-icons/fi";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { MemberAccounts } from "@/types";
import { SpinnerComet } from "@/components/Parts/SpinnerComet/SpinnerComet";
import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import { useEffectOnce } from "react-use";
import { BsChevronLeft } from "react-icons/bs";
import axios from "axios";
import useStore from "@/store";
import { toast } from "react-toastify";

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
  const queryClient = useQueryClient();
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const sessionState = useStore((state) => state.sessionState);

  // 入力値を保持するState
  const [input, setInput] = useState("");
  // 送信されたデータ
  const [searchedInput, setSearchedInput] = useState("");
  // 入力値が空かどうかを保持するState
  const [emptyInput, setEmptyInput] = useState(true);
  // トータルメンバーカウント 初期フェッチで全メンバーを取得できるため、そこでStateに格納
  const [totalMemberCount, setTotalMemberCount] = useState(0);
  // 選択済みのメンバーState
  const [selectedMember, setSelectedMember] = useState<MemberAccounts | null>(null);
  // ローディング
  const [loading, setLoading] = useState(false);

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

  // ダミーデータ取得用のデータ型
  // type DummyType = {
  //   id: number;
  //   name: string;
  //   email: string;
  // };

  let fetchNewSearchServerPage: any;

  fetchNewSearchServerPage = async (
    limit: number,
    offset: number = 0
  ): Promise<{ rows: MemberAccounts[] | null; nextOffset: number; isLastPage: boolean; count: number | null }> => {
    // ): Promise<{ rows: DummyType[] | null; nextOffset: number; isLastPage: boolean; count: number | null }> => {
    const from = offset * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .rpc(
        "get_members_searched_name",
        {
          _subscription_id: userProfileState?.subscription_id,
          _name: input,
        },
        { count: "exact" }
      )
      .range(from, to)
      .order("profile_name", { ascending: true });

    console.log("フェッチ後 count", count, "data", data, "offset, limit", offset, limit, "from, to", from, to);

    if (error) throw error;

    const rows = ensureMemberAccounts(data);

    // ====================== ダミーデータを生成するヘルパー関数 ======================
    // const generateDummyData = (start: number, end: number) => {
    //   const dummyData = [];
    //   for (let i = start; i <= end; i++) {
    //     dummyData.push({
    //       id: i,
    //       name: `Dummy Name ${i}`,
    //       email: `dummy${i}@example.com`,
    //     });
    //   }
    //   return dummyData;
    // };
    // // ダミーデータの生成
    // const rows = generateDummyData(from, to);
    // const count = 200;
    // ====================== ダミーデータを生成するヘルパー関数 ここまで ======================

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

  // inputの入力値が空文字になったら、searchedInputも空文字にして、全てのデータを保持するキャッシュのデータを表示する
  useEffect(() => {
    if (input === "" && searchedInput !== "") {
      console.log("空文字をセット");
      return setSearchedInput(input);
    }
  }, [emptyInput]);

  // 初回マウント時のみ全メンバー数をStateに格納
  useEffectOnce(() => {
    if (!data && input !== "") return;
    console.log("初回マウント時に全メンバー数をセット");
    setTotalMemberCount(data?.pages[0].count);
  });

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
  const count = data?.pages[0].count;
  const isLastPage = data?.pages[data.pages.length - 1].isLastPage;

  console.log(
    "count",
    count,
    "isLastPage",
    isLastPage,
    "memberRows",
    memberRows,
    "totalMemberCount",
    totalMemberCount,
    "selectedMember",
    selectedMember,
    "searchedInput",
    searchedInput,
    "input",
    input
  );
  // ===================================== 無限スクロール ここまで =====================================

  let memberAvatarUrl = false;

  // サーチアイコンをクリックして検索値Stateを更新
  const handleSearchMemberName = () => {
    if (input === searchedInput) return console.log("既に検索済みのためリターン");
    setSearchedInput(input);
  };

  // 「このメンバーを任命する」ボタンクリック Resendで任命したメンバーに所有者変更メールを送信
  const handleSendChangeOwnerEmail = async () => {
    // ローディングを開始
    setLoading(true);
    // ステップ1 Resendで作成したカスタム所有者変更メールを送信
    try {
      const payload = {
        email: selectedMember?.email,
        toUserName: selectedMember?.profile_name,
        fromUserName: userProfileState?.profile_name,
        fromEmail: userProfileState?.email,
        teamName: userProfileState?.customer_name,
        siteUrl: `${process.env.CLIENT_URL ?? `http://localhost:3000`}`,
      };
      const { data } = await axios.post(`/api/send/change-team-owner`, payload, {
        headers: {
          Authorization: `Bearer ${sessionState.access_token}`,
        },
      });

      // 有効期限を今から30日後で生成してISOStringで返す
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 30);

      console.log(
        "axios.post()、resend.emails.send()の返り値: ",
        data,
        "expirationDate",
        expirationDate,
        "expirationDate.toISOString()",
        expirationDate.toISOString()
      );

      // ステップ2 notificationsテーブルにINSERT、invitationsテーブルには、招待先ユーザーid、紹介元のチーム名、紹介者をセットする
      const newNotification = {
        to_user_id: selectedMember?.id,
        to_user_name: selectedMember?.profile_name,
        to_user_email: selectedMember?.email,
        to_subscribed_account_id: selectedMember?.subscribed_account_id,
        from_user_id: userProfileState?.id,
        from_user_name: userProfileState?.profile_name,
        from_user_email: userProfileState?.email,
        from_user_avatar_url: userProfileState?.avatar_url,
        from_company_name: userProfileState?.customer_name,
        from_company_id: userProfileState?.company_id,
        already_read: false,
        already_read_at: null,
        completed: false,
        completed_at: null,
        result: "pending",
        type: "change_team_owner",
        content: null,
        from_provider: false,
        expiration_date: expirationDate.toISOString(),
      };
      const { error: notificationError } = await supabase.from("notifications").insert(newNotification);

      if (notificationError) {
        console.log(
          `${selectedMember?.profile_name}さんへの所有者の任命に失敗しました! notificationsテーブルのinsertエラー: `,
          notificationError
        );
        throw new Error(notificationError.message);
      }

      // キャッシュを最新状態に反映
      await queryClient.invalidateQueries({ queryKey: ["change_team_owner_notifications"] });

      // 招待状の送信完了
      toast.success(`${selectedMember?.profile_name}さんへ${userProfileState?.customer_name}の所有者を依頼しました!`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      // 所有者移行のメール送信に成功したら、Stateをリセットする
      setChangeTeamOwnerStep(null);
      // const newEmails = [...emailInputs];
      // newEmails[i] = "";
      // setEmailInputs(newEmails);
    } catch (e: any) {
      console.error(selectedMember?.profile_name, selectedMember?.email, "送信エラー", e, e.message);
      toast.error(
        `${selectedMember?.profile_name}さんへ${userProfileState?.customer_name}の所有者の依頼に失敗しました!`,
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        }
      );
    }
    // ローディングを終了
    setLoading(false);
  };

  return (
    <>
      <div className={`${styles.modal_overlay}`} onClick={() => setChangeTeamOwnerStep(null)}></div>
      <div className={`${styles.modal} relative flex`}>
        {loading && (
          <div className={`${styles.loading_overlay} !rounded-[8px]`}>
            <SpinnerIDS scale={"scale-[0.5]"} />
          </div>
        )}
        {/* クローズボタン */}
        <button
          className={`flex-center z-100 group absolute right-[-40px] top-0 h-[32px] w-[32px] rounded-full bg-[#00000090] hover:bg-[#000000c0]`}
          onClick={() => setChangeTeamOwnerStep(null)}
        >
          <MdClose className="text-[20px] text-[#fff]" />
        </button>

        {/* =========================== 左側エリア ステップ1 =========================== */}
        {changeTeamOwnerStep === 1 && (
          <div className={`relative flex h-full w-[42%] flex-col items-center p-[32px]`}>
            <div className="flex h-auto w-[100%] flex-col text-[16px]">
              <div className="relative flex h-[25px] w-full items-center">
                {/* プログレスライン */}
                <div className="absolute left-0 top-[50%] z-[-1] h-[1px] w-[65px] bg-[var(--color-progress-bg)]"></div>
                {/* ○ */}
                <div
                  className={`flex-center mr-[15px] h-[25px] w-[25px] cursor-pointer rounded-full border border-solid ${
                    changeTeamOwnerStep === 1
                      ? `border-[var(--color-bg-brand-f)] bg-[var(--color-bg-brand-f)] text-[#fff]`
                      : `border-[var(--color-border-light)] bg-[var(--color-edit-bg-solid)] text-[var(--color-text-sub)]`
                  }`}
                >
                  <span className={`text-[12px] font-bold`}>1</span>
                </div>
                {/* ○ */}
                <div
                  className={`flex-center text-[var(--color-text-sub)]} mr-[15px] h-[25px] w-[25px] cursor-not-allowed rounded-full border border-solid border-[var(--color-border-light)] bg-[var(--color-edit-bg-solid)]`}
                >
                  <span className={`text-[12px] font-bold`}>2</span>
                </div>
              </div>
              {/*  */}
              <div className="mt-[15px] flex w-full flex-col text-[22px] font-bold">
                <h2>チームの所有者の変更</h2>
              </div>

              {/* ======= アバター、名前、説明エリア ステップ1 ここまで ======= */}
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
                  <div className={`text-[var(--color-text-sub)]`}>
                    チーム・{totalMemberCount ? `${totalMemberCount}人のメンバー` : ""}
                  </div>
                </div>
              </div>
              {/* ======= アバター、名前、説明エリア ステップ1 ここまで ======= */}

              {/* ======= 入力、検索エリア ステップ1 ====== */}
              <div className={`relative mt-[15px] flex w-full items-center`}>
                {/* <FiSearch className="absolute left-[8px] top-[50%] translate-y-[-50%] text-[22px]" / */}
                <HiOutlineSearch className="absolute left-[8px] top-[50%] translate-y-[-50%] text-[24px] text-[var(--color-text-sub)]" />
                <input
                  type="text"
                  placeholder={`${selectedMember === null ? "チームメンバーの検索" : ``}`}
                  // required
                  // autoFocus
                  className={`${styles.input_box} !pl-[40px]`}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    if (e.target.value === "" && !emptyInput) return setEmptyInput(true);
                    if (emptyInput) return setEmptyInput(false);
                  }}
                  //   onBlur={() => setEditedName(toHalfWidth(editedName.trim()))}
                  // onBlur={() => setEditedCompanyName(toHalfWidthAndSpace(editedCompanyName.trim()))}
                />
                {/* バツボタン */}
                {input !== "" && selectedMember === null && (
                  <div
                    className={`${styles.close_btn_number}`}
                    onClick={() => {
                      setInput("");
                      if (!emptyInput) return setEmptyInput(true);
                    }}
                  >
                    <MdClose className="text-[20px] " />
                  </div>
                )}
                {/* 検索ボタン */}
                {input !== "" && selectedMember === null && (
                  <div
                    className="flex-center transition-base03 shadow-all-md group absolute right-[10px] top-[50%] min-h-[32px] min-w-[32px] translate-y-[-50%] cursor-pointer rounded-full border border-solid border-[var(--color-bg-brand-f)] bg-[var(--color-modal-bg-side-c-second)] hover:bg-[var(--color-bg-brand-f90)]"
                    onClick={handleSearchMemberName}
                  >
                    <HiOutlineSearch className="text-[20px] text-[var(--color-text-title)] group-hover:text-[#fff]" />
                  </div>
                )}
                {/* 選択されたメンバーカード */}
                {selectedMember !== null && (
                  <div
                    className={`absolute left-[40px] top-[50%] flex min-h-[24px] max-w-[calc(100%-40px)] translate-y-[-50%] items-center justify-between rounded-[4px] bg-[var(--member-card)] px-[8px] py-[4px]`}
                  >
                    {/* 選択メンバー アバター画像 */}
                    {!selectedMember.avatar_url && (
                      <div
                        // data-text="ユーザー名"
                        className={`flex-center h-[24px] w-[24px] cursor-pointer rounded-full bg-[var(--color-bg-brand-sub)] text-[#fff] hover:bg-[var(--color-bg-brand-sub-hover)] ${styles.tooltip}`}
                        // onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                        // onMouseLeave={handleCloseTooltip}
                      >
                        {/* <span>K</span> */}
                        <span className={`text-[12px]`}>
                          {selectedMember?.profile_name
                            ? getCompanyInitial(selectedMember.profile_name)
                            : `${getCompanyInitial("NoName")}`}
                        </span>
                      </div>
                    )}
                    {selectedMember.avatar_url && (
                      <div
                        className={`flex-center h-[24px] w-[24px] cursor-pointer overflow-hidden rounded-full hover:bg-[#00000020]`}
                      >
                        <Image
                          src={selectedMember.avatar_url}
                          alt="logo"
                          className={`h-full w-full object-cover text-[#fff]`}
                          width={75}
                          height={75}
                        />
                      </div>
                    )}
                    {/* 選択メンバー 名前 */}
                    <p className={`max-w-[80%] px-[8px] text-[13px]`}>{selectedMember.profile_name}</p>
                    {/* クローズボタン */}
                    <div
                      className={`cursor-pointer`}
                      onClick={() => {
                        setSelectedMember(null);
                        setSearchedInput("");
                        setInput("");
                        if (!emptyInput) return setEmptyInput(true);
                      }}
                    >
                      <MdClose className="text-[16px] " />
                    </div>
                  </div>
                )}
              </div>
              {/* ======= 入力、検索エリア ステップ1 ここまで ====== */}

              {/* ======= メンバー一覧エリア ステップ1 ======= */}
              {selectedMember === null && (
                <div className={`relative mt-[10px] flex max-h-[290px] w-full flex-col overflow-y-scroll`}>
                  <div className={`relative flex w-full flex-col `}>
                    {memberRows.map((member, index) => {
                      if (member.id === userProfileState?.id) return;
                      return (
                        <div
                          key={member.id}
                          className={`flex min-h-[44px] w-full cursor-pointer items-center truncate rounded-[8px] py-[12px] pl-[24px] hover:bg-[var(--setting-side-bg-select)]`}
                          onClick={() => {
                            if (selectedMember === member)
                              return console.log("既にそのメンバーは選択済みのためリターン");
                            setSelectedMember(member);
                          }}
                        >
                          {!memberAvatarUrl && (
                            <div
                              // data-text="ユーザー名"
                              className={`flex-center h-[40px] w-[40px] cursor-pointer rounded-full bg-[var(--color-bg-brand-sub)] text-[#fff] hover:bg-[var(--color-bg-brand-sub-hover)] ${styles.tooltip} mr-[15px]`}
                              // onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                              // onMouseLeave={handleCloseTooltip}
                            >
                              <span className={`text-[20px]`}>
                                {getInitial(member.profile_name ? member.profile_name : "")}
                              </span>
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
                              <span>{member.profile_name ? member.profile_name : ""}</span>
                            </div>
                            <div className={`text-[var(--color-text-sub)]`}>{member.email ? member.email : ""}</div>
                          </div>
                        </div>
                      );
                    })}
                    {/* 条件検索結果が1件も無い場合 ステップ1 */}
                    {memberRows.length === 0 && count === 0 && isLastPage && (
                      <div
                        className={`flex min-h-[44px] w-full items-center rounded-[8px] px-[24px] py-[12px] text-[13px] text-[var(--color-text-sub)]`}
                      >
                        <p className=" text-center">該当する名前のチームメンバーは見つかりませんでした。</p>
                      </div>
                    )}
                    {/* 条件検索結果が1件も無い場合 ステップ1 ここまで */}

                    {/* もっと見る ステップ1 */}

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
                    {/* もっと見る ステップ1 ここまで */}
                  </div>
                </div>
              )}
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

            {/* ボタンエリア ステップ1 */}
            <div
              className={`flex w-full items-center space-x-5  ${
                selectedMember === null ? `absolute bottom-0 left-0 px-[32px] pb-[32px] pt-[15px]` : `mt-[30px]`
              }`}
            >
              <button
                className={`w-[100%] rounded-[8px] px-[15px] py-[10px] text-[14px] font-bold ${
                  selectedMember === null
                    ? `cursor-not-allowed bg-[var(--color-bg-sub)] text-[var(--color-text-disabled)]`
                    : `cursor-pointer bg-[var(--color-bg-brand-f)] text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`
                }`}
                onClick={() => {
                  if (selectedMember === null) return;
                  setChangeTeamOwnerStep(2);
                }}
              >
                続行
              </button>
            </div>
            {/* <div
            className={`flex w-full items-center justify-around space-x-5  ${
              selectedMember === null ? `absolute bottom-0 left-0 px-[32px] pb-[32px] pt-[15px]` : `mt-[30px]`
            }`}
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
          </div> */}
          </div>
        )}
        {/* =========================== 左側エリア ステップ1 ここまで =========================== */}

        {/* =========================== 左側エリア ステップ2 =========================== */}
        {changeTeamOwnerStep === 2 && (
          <div className={`relative flex h-full w-[42%] flex-col items-center p-[32px]`}>
            <div className="flex h-auto w-[100%] flex-col text-[16px]">
              <div className="relative flex h-[25px] w-full items-center">
                {/* プログレスライン */}
                <div className="absolute left-0 top-[50%] z-[-1] h-[1px] w-[65px] bg-[var(--color-progress-bg)]"></div>
                {/* ○ */}
                <div
                  className={`flex-center mr-[15px] h-[25px] w-[25px] cursor-pointer rounded-full border border-solid border-[var(--color-bg-brand-f)] bg-[var(--color-bg-brand-f)] text-[#fff]`}
                  onClick={() => {
                    setChangeTeamOwnerStep(1);
                  }}
                >
                  <span className={`text-[12px] font-bold`}>1</span>
                </div>
                {/* ○ */}
                <div
                  className={`flex-center mr-[15px] h-[25px] w-[25px] cursor-pointer rounded-full border border-solid ${
                    changeTeamOwnerStep === 2
                      ? `border-[var(--color-bg-brand-f)] bg-[var(--color-bg-brand-f)] text-[#fff]`
                      : `border-[var(--color-border-light)] bg-[var(--color-edit-bg-solid)] text-[var(--color-text-sub)]`
                  }`}
                >
                  <span className={`text-[12px] font-bold`}>2</span>
                </div>
              </div>
              {/*  */}
              <div className="mt-[15px] flex w-full items-start text-[22px] font-bold">
                <button
                  className="flex-center mr-[15px] min-h-[33px] min-w-[24px] cursor-pointer"
                  onClick={() => setChangeTeamOwnerStep(1)}
                >
                  <BsChevronLeft className="text-[24px]" />
                </button>
                <h2>所有者を変更してもよろしいですか？</h2>
              </div>

              {/* ======= アバター、名前、説明エリア ここまで ======= */}
              <div className={`mt-[15px] flex min-h-[44px] w-full items-center truncate pl-[4px]`}>
                {!selectedMember?.avatar_url && (
                  <div
                    // data-text="ユーザー名"
                    className={`flex-center h-[40px] w-[40px] cursor-pointer rounded-full bg-[var(--color-bg-brand-sub)] text-[#fff] hover:bg-[var(--color-bg-brand-sub-hover)] ${styles.tooltip} mr-[15px]`}
                    // onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                    // onMouseLeave={handleCloseTooltip}
                  >
                    {/* <span>K</span> */}
                    <span className={`text-[20px]`}>
                      {selectedMember?.profile_name
                        ? getCompanyInitial(selectedMember.profile_name)
                        : `${getCompanyInitial("NoName")}`}
                    </span>
                  </div>
                )}
                {selectedMember?.avatar_url && (
                  <div
                    className={`flex-center mr-[15px] h-[40px] w-[40px] cursor-pointer overflow-hidden rounded-full hover:bg-[#00000020]`}
                  >
                    <Image
                      src={selectedMember?.avatar_url}
                      alt="logo"
                      className={`h-full w-full object-cover text-[#fff]`}
                      width={75}
                      height={75}
                    />
                  </div>
                )}
                <div className={`flex h-full flex-col pt-[4px] text-[12px]`}>
                  <div className={`text-[13px] font-semibold`}>
                    <span>{selectedMember?.profile_name}</span>
                  </div>
                  <div className={`text-[var(--color-text-sub)]`}>メンバー・{selectedMember?.email}</div>
                </div>
              </div>
              {/* ======= アバター、名前、説明エリア ここまで ======= */}

              {/* ======= 説明エリア ======= */}
              <div className={`mt-[25px] flex h-auto w-full flex-col text-[14px] leading-6`}>
                <p>
                  あなたの代わりとして、
                  <span className="font-bold">{selectedMember?.profile_name}</span>
                  さんに
                  <span className="font-bold">{userProfileState?.customer_name ?? "チーム"}</span>
                  の所有者を依頼しようとしています。
                </p>
                <p className="mt-[20px]">
                  返答期間は<span className="font-bold">30日</span>
                  です。新しい所有者が承諾するまでは引き続きあなたが所有者です。
                </p>
              </div>
            </div>

            {/* ボタンエリア */}
            <div
              className={`flex w-full items-center space-x-5  ${
                selectedMember === null ? `absolute bottom-0 left-0 px-[32px] pb-[32px] pt-[15px]` : `mt-[30px]`
              }`}
            >
              <button
                className={`w-[100%] cursor-pointer rounded-[8px] px-[15px] py-[10px] text-[14px] font-bold ${
                  selectedMember === null
                    ? `bg-[var(--color-bg-sub)] text-[var(--color-text-disabled)]`
                    : `bg-[var(--color-bg-brand-f)] text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`
                }`}
                onClick={handleSendChangeOwnerEmail}
              >
                このメンバーを任命する
              </button>
            </div>
            {/* <div
            className={`flex w-full items-center justify-around space-x-5  ${
              selectedMember === null ? `absolute bottom-0 left-0 px-[32px] pb-[32px] pt-[15px]` : `mt-[30px]`
            }`}
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
          </div> */}
          </div>
        )}
        {/* =========================== 左側エリア ステップ2 ここまで =========================== */}
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
