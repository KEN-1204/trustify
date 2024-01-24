import { RippleButton } from "@/components/Parts/RippleButton/RippleButton";
import { neonSearchIcon } from "@/components/assets";
import { Dispatch, FormEvent, SetStateAction, memo, useCallback, useEffect, useRef, useState } from "react";
import { BsChevronRight } from "react-icons/bs";
import { MdOutlineDataSaverOff } from "react-icons/md";
import styles from "../UpdateMeetingModal.module.css";
import { Contact_row_data, Department, Office, SignatureStamp, Unit, UserProfileCompanySubscription } from "@/types";
import { useMedia } from "react-use";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import useDashboardStore from "@/store/useDashboardStore";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { getInitial } from "@/utils/Helpers/getInitial";
import { SpinnerComet } from "@/components/Parts/SpinnerComet/SpinnerComet";
import { GrPowerReset } from "react-icons/gr";
import useStore from "@/store";
import { TooltipSideTable } from "@/components/Parts/Tooltip/TooltipSideTable";
import { ImInfo } from "react-icons/im";
import { toast } from "react-toastify";
import { StampListitem } from "./StampListitem";

type StampObj = {
  signature_stamp_id: string | null;
  signature_stamp_url: string | null;
};
type SearchStampParams = {
  _kanji: string | null;
  _furigana: string | null;
  _romaji: string | null;
};

type Props = {
  isOpenSearchStampSideTable: boolean;
  // setIsOpenSearchStampSideTable: Dispatch<SetStateAction<boolean>>;
  isOpenSearchStampSideTableBefore: boolean;
  // setIsOpenSearchStampSideTableBefore: Dispatch<SetStateAction<boolean>>;
  // prevStampObj: StampObj;
  // setPrevStampObj: Dispatch<SetStateAction<StampObj>>;
  // stampObj: StampObj;
  // setStampObj: Dispatch<SetStateAction<StampObj>>;
};

const SideTableSearchSignatureStampMemo = ({
  isOpenSearchStampSideTable,
  // setIsOpenSearchStampSideTable,
  isOpenSearchStampSideTableBefore,
}: // setIsOpenSearchStampSideTableBefore,
// prevStampObj,
// setPrevStampObj,
// stampObj,
// setStampObj,
Props) => {
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const setUserProfileState = useDashboardStore((state) => state.setUserProfileState);
  // 説明アイコンホバーで非アクティブ化
  const [hasBeenHoveredIcon, setHasBeenHoveredIcon] = useState(false);
  const [isLoadingUpsert, setIsLoadingUpsert] = useState(false);
  const setIsOpenSearchStampSideTable = useDashboardStore((state) => state.setIsOpenSearchStampSideTable);
  const setIsOpenSearchStampSideTableBefore = useDashboardStore((state) => state.setIsOpenSearchStampSideTableBefore);
  const prevStampObj = useDashboardStore((state) => state.prevStampObj);
  const setPrevStampObj = useDashboardStore((state) => state.setPrevStampObj);
  const stampObj = useDashboardStore((state) => state.stampObj);
  const setStampObj = useDashboardStore((state) => state.setStampObj);

  // メディアクエリState
  // デスクトップモニター
  const isDesktopGTE1600Media = useMedia("(min-width: 1600px)", false);
  const [isDesktopGTE1600, setIsDesktopGTE1600] = useState(isDesktopGTE1600Media);
  useEffect(() => {
    setIsDesktopGTE1600(isDesktopGTE1600Media);
  }, [isDesktopGTE1600Media]);

  const queryClient = useQueryClient();

  // 初回マウント時フェッチを防ぐ 検索をクリックした時に初めてqueryFnを実行
  const [isEnableFetch, setIsEnableFetch] = useState(false);
  // 自社担当の変更先の担当者オブジェクト, profile_nameを自社担当に割り当て、idをcreated_by_user_idに割り当てる
  const [selectedStampObj, setSelectedStampObj] = useState<SignatureStamp | null>(null);

  // 同席者検索時のparams
  const initialStampParams = {
    _kanji: null,
    _furigana: null,
    _romaji: null,
  };
  const [searchStampParams, setSearchStampParams] = useState<SearchStampParams>(initialStampParams);

  // 同席者検索フィールド用input
  const [searchInputKanji, setSearchInputKanji] = useState(""); // 漢字
  const [searchInputFurigana, setSearchInputFurigana] = useState(""); //ふりがな
  const [searchInputRomaji, setSearchInputRomaji] = useState(""); //ローマ字
  //   const [submitKanji, setSubmitKanji] = useState(""); // 漢字
  //   const [submitFurigana, setSubmitFurigana] = useState(""); //ふりがな
  //   const [submitRomaji, setSubmitRomaji] = useState(""); //ローマ字

  const searchStampInputFields = [
    {
      key: "kanji",
      title: "漢字",
      inputValue: searchInputKanji,
      setInputValue: setSearchInputKanji,
    },
    {
      key: "furigana",
      title: "ふりがな",
      inputValue: searchInputFurigana,
      setInputValue: setSearchInputFurigana,
    },
    {
      key: "romaji",
      title: "ローマ字",
      inputValue: searchInputRomaji,
      setInputValue: setSearchInputRomaji,
    },
  ];

  // -------------------------- 🌟useInfiniteQuery無限スクロール🌟 --------------------------
  const supabase = useSupabaseClient();

  function adjustFieldValue(value: string | null) {
    if (value === "") return null; // 全てのデータ
    if (value === null) return null; // 全てのデータ
    if (value.includes("*")) value = value.replace(/\*/g, "%");
    if (value.includes("＊")) value = value.replace(/\＊/g, "%");
    if (value === "is null") return "ISNULL"; // ISNULLパラメータを送信
    // if (value === "is not null") return "%%";
    if (value === "is not null") return "ISNOTNULL"; // ISNOTNULLパラメータを送信
    return value;
  }

  // ------------- 🌟検索ボタンクリックかエンターでonSubmitイベント発火🌟 -------------
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    if (isLoadingUpsert) return;
    if (!userProfileState) return alert("エラー：ユーザー情報が見つかりませんでした。");
    console.log("🔥onnSubmit発火");
    e.preventDefault();

    let params = {
      _kanji: adjustFieldValue(searchInputKanji),
      _furigana: adjustFieldValue(searchInputFurigana),
      _romaji: adjustFieldValue(searchInputRomaji),
    };
    console.log("✅ 条件 params", params);

    if (Object.values(params).every((value) => value === null)) {
      return alert("漢字・ふりがな・ローマ字のいづれかの条件を入力して検索してください。");
    }

    // paramsの結合した文字列をqueryKeyに渡しているため、検索条件の入力値が変わると（paramsが変わると）useInfiniteQueryのqueryFnが再度実行される
    console.log("🔥フェッチ");
    setSearchStampParams(params);

    // 初回変更ボタンクリックのみ isEnableFetchをtrueにして初めてフェッチを走らせる
    if (!isEnableFetch) {
      console.log("🔥初回フェッチ");
      setIsEnableFetch(true);
    }
  };
  // ------------- ✅検索ボタンクリックかエンターでonSubmitイベント発火✅ -------------

  let fetchNewSearchServerPage: any;

  fetchNewSearchServerPage = async (
    limit: number,
    offset: number = 0
  ): Promise<{ rows: SignatureStamp[] | null; nextOffset: number; isLastPage: boolean; count: number | null }> => {
    // ローディング開始
    // setIsLoadingQuery(true);
    if (!userProfileState?.company_id) {
      let rows: null = null;
      const isLastPage = rows === null;
      let count: null = null;
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log("❌会社データなしリターン");
      return { rows, nextOffset: offset + 1, isLastPage, count };
    }
    // // 全てのパラメータが未入力ならnullを返す
    // if (!searchStampParams.kanji && !searchStampParams.furigana && !searchStampParams.romaji) {
    //   let rows: null = null;
    //   const isLastPage = rows === null;
    //   let count: null = null;
    //   await new Promise((resolve) => setTimeout(resolve, 500));
    //   console.log("❌全て未入力のためnullをリターン", searchStampParams);
    //   return { rows, nextOffset: offset + 1, isLastPage, count };
    // }

    // 条件の値が全てnullなら、つまり何も入力せず検索されるか初回マウント時はnullを返す。
    if (Object.values(searchStampParams).every((value) => value === null)) {
      let rows: null = null;
      const isLastPage = rows === null;
      let count: null = null;
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log("❌全て未入力のためnullをリターン", searchStampParams);
      return { rows, nextOffset: offset + 1, isLastPage, count };
    }

    const from = offset * limit;
    const to = from + limit - 1;

    let params = searchStampParams;

    console.log("🔥rpc()実行", params);

    const {
      data: rows,
      error,
      count,
    } = await supabase
      .rpc("get_signature_stamp_list", params, { count: "exact" })
      .range(from, to)
      .order("romaji", { ascending: true });

    if (error) {
      console.error("❌rpcエラー", error);
      throw error;
    }

    console.log("✅rpc()成功 rows", rows);
    // const rows = ensureClientCompanies(data);

    // フェッチしたデータの数が期待される数より少なければ、それが最後のページであると判断します
    const isLastPage = rows === null || rows.length < limit;

    // 0.5秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // ローディング終了 => useQueryのisLoadingを使用

    return { rows, nextOffset: offset + 1, isLastPage, count };
  };

  // ------------------- 🌟queryKeyの生成🌟 -------------------
  const queryKeySearchParamsStringRef = useRef<string | null>(null);
  console.log("キャッシュに割り当てるparamsキー searchStampParams", searchStampParams);
  if (searchStampParams) {
    // queryKeySearchParamsStringRef.current = Object.entries(searchStampParams)
    //   .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    //   .map(([key, value]) => `${key}:${value === null ? `null` : `${value}`}`)
    //   .join(", ");
    queryKeySearchParamsStringRef.current = [
      ["_kanji", searchStampParams._kanji],
      ["_furigana", searchStampParams._furigana],
      ["_romaji", searchStampParams._romaji],
    ]
      .map(([key, value]) => `${key}:${value === null ? `null` : `${value}`}`)
      .join(", ");
  }
  // ------------------- ✅queryKeyの生成✅ -------------------

  // ------------------- 🌟useInfiniteQueryフック🌟 -------------------
  const {
    status,
    data: queryDataObj, // {pages: Array(1), pageParams: Array(1)}
    error,
    isLoading: isLoadingQuery,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    // queryKey: ["companies"],
    queryKey: ["signature_stamps", queryKeySearchParamsStringRef.current],
    // queryKey: ["contacts"],
    queryFn: async (ctx) => {
      if (isLoadingUpsert) return;
      console.log("サーチフェッチメンバー queryFn✅✅✅ searchStampParams", searchStampParams);
      return fetchNewSearchServerPage(20, ctx.pageParam); // 20個ずつ取得
    },
    getNextPageParam: (lastGroup, allGroups) => {
      // lastGroup.isLastPageがtrueならundefinedを返す
      return lastGroup.isLastPage ? undefined : allGroups.length;
    },
    staleTime: Infinity,
    enabled: isOpenSearchStampSideTable && isEnableFetch && !!userProfileState?.company_id,
  });

  // ------------------- ✅useInfiniteQueryフック✅ -------------------

  const handleNextFetch = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // 現在取得している全ての行 data.pagesのネストした配列を一つの配列にフラット化
  const Rows =
    queryDataObj &&
    (
      queryDataObj?.pages[0] as {
        rows: SignatureStamp[] | null;
        nextOffset: number;
        isLastPage: boolean;
        count: number | null;
      }
    )?.rows
      ? queryDataObj.pages.flatMap((d) => d?.rows)
      : [];
  const memberRows = Rows.map((obj, index) => {
    return { index, ...obj };
  });
  const queryCount = queryDataObj?.pages[0].count; // 0: {rows: Array(9), nextOffset: 1, isLastPage: true, count: 9}
  const isLastPage = queryDataObj?.pages[queryDataObj.pages.length - 1].isLastPage;

  // ------------------------------- 🌟初回ブロックstateをtrueに🌟 -------------------------------
  // 初回マウント時に既に初期状態(入力なしで検索した全てのデータ)でRowsが存在するなら初回ブロックstateをtrueにする
  useEffect(() => {
    if (memberRows && memberRows.length > 0) {
      if (!isEnableFetch) setIsEnableFetch(true);
    }
  }, []);
  // ------------------------------- ✅初回ブロックstateをtrueに✅ -------------------------------

  console.log(
    "=============================================メンバーqueryDataObj",
    queryDataObj,
    "queryCount",
    queryCount,
    "isLastPage",
    isLastPage,
    "hasNextPage",
    hasNextPage,
    "memberRows",
    memberRows,
    "searchStampParams",
    searchStampParams,
    "status",
    status,
    "isLoadingQuery",
    isLoadingQuery,
    "stampObj",
    stampObj
  );
  // -------------------------- ✅useInfiniteQuery無限スクロール✅ --------------------------

  // -------------------------- 🌟変更ボタンをクリック🌟 --------------------------

  const handleAddSelectedMember = async () => {
    // if (true) {
    //   toast.success("🌟");
    //   return;
    // }
    if (isLoadingUpsert) return;
    if (!selectedStampObj) return;
    if (!stampObj) return;
    if (!selectedStampObj.id) return alert("エラー：印鑑データが見つかりませんでした。");
    if (!userProfileState?.id) return alert("エラー：ユーザーデータが見つかりませんでした。");
    // 現在の印鑑idと選択した印鑑idが一致している場合はリターン
    const isEqualMember = selectedStampObj.id === stampObj.signature_stamp_id;
    if (isEqualMember) {
      alert(`同じ印鑑データです。変更が不要な場合は右上の矢印ボタンかテーブル以外をクリックして戻ってください。`);
      return;
    } else {
      // signature_stamp_assignmentsにuser_idとsignature_stamp_idをUPSERT
      // まだstampObj.signature_stamp_idが存在しない場合はINSERT
      try {
        setIsLoadingUpsert(true);

        const upsertPayload = {
          user_id: userProfileState.id,
          signature_stamp_id: selectedStampObj.id,
        };
        const { error } = await supabase
          .from("signature_stamp_assignments")
          .upsert(upsertPayload, { onConflict: "user_id" });

        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (error) throw error;
      } catch (e: any) {
        console.error(`upsert signature_stamp_assignments failed`, e);
        toast.error("印鑑データの変更に失敗しました...🙇‍♀️");
        setIsLoadingUpsert(false);
        return;
      }

      // UPSERT成功後、Zustandのユーザーデータを更新する
      const newUserData: UserProfileCompanySubscription = {
        ...userProfileState,
        assigned_signature_stamp_id: selectedStampObj.id,
        assigned_signature_stamp_url: selectedStampObj.image_url,
      };

      setUserProfileState(newUserData);

      // 現在の自社担当と異なる担当者の場合は自社担当を変更
      const newStampObj: StampObj = {
        signature_stamp_id: selectedStampObj.id,
        signature_stamp_url: selectedStampObj.image_url,
      };

      // 変更後のメンバーstateに追加
      // setChangedMemberObj(newStampObj);
      setStampObj(newStampObj);

      // 変更確定確認モーダルを開く
      // setIsChangeConfirmationModal(true)

      // ローディング終了
      setIsLoadingUpsert(false);

      // サイドテーブルを閉じる
      setIsOpenSearchStampSideTable(false);
      setTimeout(() => {
        setIsOpenSearchStampSideTableBefore(false);
      }, 300);

      // 変更が完了したら選択中のメンバーをリセット
      setSelectedStampObj(null);

      // paramsをリセット
      setSearchStampParams(initialStampParams);

      // 各検索条件もリセット
      if (searchInputKanji) setSearchInputKanji("");
      if (searchInputFurigana) setSearchInputFurigana("");
      if (searchInputRomaji) setSearchInputRomaji("");

      toast.success("印鑑データの変更が完了しました!🌟");
    }
  };
  // -------------------------- ✅変更ボタンをクリック✅ --------------------------

  // -------------------------- 🌟スクロールでヘッダー色変更🌟 --------------------------
  // サイドテーブルの同席者一覧エリアのスクロールアイテムRef
  const sideTableScrollHeaderRef = useRef<HTMLDivElement | null>(null);
  const sideTableScrollContainerRef = useRef<HTMLDivElement | null>(null);
  const sideTableScrollItemRef = useRef<HTMLDivElement | null>(null);
  const originalY = useRef<number | null>(null);

  // サイドテーブル スクロール監視イベント
  const handleScrollEvent = useCallback(() => {
    if (!sideTableScrollItemRef.current || !sideTableScrollHeaderRef.current || !originalY.current) return;
    const currentScrollY = sideTableScrollItemRef.current.getBoundingClientRect().y;
    // const currentScrollY = sideTableScrollItemRef.current.offsetTop;
    console.log("scrollイベント発火🔥 現在のscrollY, originalY.current", currentScrollY, originalY.current);
    if (originalY.current !== currentScrollY) {
      if (sideTableScrollHeaderRef.current.classList.contains(`${styles.active}`)) return;
      sideTableScrollHeaderRef.current.classList.add(`${styles.active}`);
      console.log("✅useEffect add");
    } else {
      if (!sideTableScrollHeaderRef.current.classList.contains(`${styles.active}`)) return;
      sideTableScrollHeaderRef.current.classList.remove(`${styles.active}`);
      console.log("✅useEffect remove");
    }
  }, []);
  useEffect(() => {
    if (!sideTableScrollContainerRef.current || !sideTableScrollItemRef.current) return;
    // 初期Y位置取得
    if (!originalY.current) {
      originalY.current = sideTableScrollItemRef.current.getBoundingClientRect().y;
    }
    sideTableScrollContainerRef.current.addEventListener(`scroll`, handleScrollEvent);
    console.log("✅useEffectスクロール開始");

    return () => {
      if (!sideTableScrollContainerRef.current)
        return console.log("✅useEffectクリーンアップ sideTableScrollContainerRef.currentは既に存在せず リターン");
      sideTableScrollContainerRef.current?.removeEventListener(`scroll`, handleScrollEvent);
      console.log("✅useEffectスクロール終了 リターン");
    };
  }, [handleScrollEvent]);
  // -------------------------- ✅スクロールでヘッダー色変更✅ --------------------------

  // -------------------------- 🌟ツールチップ🌟 --------------------------
  type TooltipParams = {
    e: React.MouseEvent<HTMLElement, MouseEvent>;
    display: string;
    content: string;
    content2?: string | undefined | null;
    content3?: string | undefined | null;
    content4?: string | undefined | null;
    marginTop?: number;
    itemsPosition?: string;
    whiteSpace?: "normal" | "pre" | "nowrap" | "pre-wrap" | "pre-line" | "break-spaces" | undefined;
    maxWidth?: number;
  };
  const modalContainerRef = useRef<HTMLDivElement | null>(null);
  const hoveredItemPosSideTable = useStore((state) => state.hoveredItemPosSideTable);
  const setHoveredItemPosSideTable = useStore((state) => state.setHoveredItemPosSideTable);
  // const handleOpenTooltip = (e: React.MouseEvent<HTMLElement, MouseEvent>, display: string) => {
  const handleOpenTooltip = ({
    e,
    display,
    content,
    content2,
    content3,
    content4,
    marginTop,
    itemsPosition = "center",
    whiteSpace,
    maxWidth,
  }: TooltipParams) => {
    // モーダルコンテナのleftを取得する
    if (!modalContainerRef.current) return;
    const containerLeft = modalContainerRef.current?.getBoundingClientRect().left;
    const containerTop = modalContainerRef.current?.getBoundingClientRect().top;
    const containerWidth = modalContainerRef.current?.getBoundingClientRect().width;
    const containerHeight = modalContainerRef.current?.getBoundingClientRect().height;
    // ホバーしたアイテムにツールチップを表示
    const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
    // const content2 = ((e.target as HTMLDivElement).dataset.text2 as string)
    //   ? ((e.target as HTMLDivElement).dataset.text2 as string)
    //   : "";
    // const content3 = ((e.target as HTMLDivElement).dataset.text3 as string)
    //   ? ((e.target as HTMLDivElement).dataset.text3 as string)
    //   : "";
    setHoveredItemPosSideTable({
      x: x - containerLeft,
      y: y - containerTop,
      itemWidth: width,
      itemHeight: height,
      containerLeft: containerLeft,
      containerTop: containerTop,
      containerWidth: containerWidth,
      containerHeight: containerHeight,
      content: content,
      content2: content2,
      content3: content3,
      content4: content4,
      display: display,
      marginTop: marginTop,
      itemsPosition: itemsPosition,
      whiteSpace: whiteSpace,
      maxWidth: maxWidth,
    });
  };
  // ================================ ツールチップを非表示 ================================
  const handleCloseTooltip = () => {
    setHoveredItemPosSideTable(null);
  };
  // -------------------------- ✅ツールチップ✅ --------------------------

  // -------------------------- 🌟サイドテーブルを閉じる🌟 --------------------------
  const handleClose = () => {
    if (isLoadingUpsert) return;
    // setMeetingMemberName(currentMemberName);

    // 元のメンバーデータに戻す
    setStampObj(prevStampObj);
    // paramsをリセット
    setSearchStampParams(initialStampParams);
    // 入力値をリセット
    if (searchInputKanji) setSearchInputKanji("");
    if (searchInputFurigana) setSearchInputFurigana("");
    if (searchInputRomaji) setSearchInputRomaji("");
    // 閉じたら再度初回フェッチをブロックする
    setIsEnableFetch(false);
    // 変更が完了したら選択中のメンバーをリセット
    setSelectedStampObj(null);
    // テーブルを閉じる
    setIsOpenSearchStampSideTable(false);
    setTimeout(() => {
      setIsOpenSearchStampSideTableBefore(false);
    }, 300);
  };
  // -------------------------- ✅サイドテーブルを閉じる✅ --------------------------

  // プレイスホルダー
  const getPlaceHolder = (title: string) => {
    switch (title) {
      case "漢字":
        return "漢字を入力 佐藤 => 佐藤";
        break;
      case "ふりがな":
        return "ふりがなを入力 例：佐藤 => さとう";
        break;
      case "ローマ字":
        return "ローマ字を入力 例：佐藤 => Sato";
        break;

      default:
        break;
    }
  };

  return (
    <>
      {/* オーバーレイ */}
      {isOpenSearchStampSideTable && (
        <div
          // className={`absolute left-0 top-0 z-[1100] h-full w-full bg-[#00800030]`}
          className={`absolute left-0 top-0 z-[1100] h-full w-full bg-[#00000039]`}
          onClick={handleClose}
        ></div>
      )}
      {/* サイドテーブル */}
      <div
        ref={modalContainerRef}
        className={`${styles.side_table} ${styles.change_member} z-[1200] pt-[30px] ${
          isOpenSearchStampSideTable ? `${styles.active} transition-transform02` : `transition-transform01`
        }`}
      >
        {/* ツールチップ */}
        {hoveredItemPosSideTable && <TooltipSideTable />}
        {/* タイトルエリア */}
        <div className="flex h-auto w-full flex-col px-[30px] 2xl:px-[30px]">
          <div className={`relative flex h-full w-full items-center justify-between`}>
            <h3 className="space-y-[1px] text-[22px] font-bold">
              <div className={`flex items-start space-x-[9px]`}>
                <span>印鑑データ検索</span>
                <span>{neonSearchIcon("30")}</span>
              </div>
              <div className="min-h-[1px] w-full bg-[var(--color-bg-brand-f)]"></div>
              {/* <div className="brand-gradient-underline-light min-h-[1px] w-full"></div> */}
            </h3>
            <div
              // className={`flex-center h-[36px] w-[36px] cursor-pointer rounded-full hover:bg-[#666]`}
              className={`z-1 flex-center absolute right-[-10px] top-[50%]  h-[36px] w-[36px] translate-y-[-50%] cursor-pointer rounded-full hover:bg-[#666]`}
              onClick={() => {
                // setMeetingMemberName(currentMemberName);
                handleClose();
              }}
            >
              {/* <BsChevronRight className="z-1 absolute left-[-15px] top-[50%] translate-y-[-50%] text-[24px]" /> */}
              <BsChevronRight className="text-[24px]" />
            </div>
          </div>
          {/* <div className="min-h-[1px] w-full bg-[var(--color-bg-brand-f)]"></div> */}
        </div>
        {/* 条件入力エリア */}
        <form
          className="mt-[20px] h-full max-h-[33vh] w-full overflow-y-scroll bg-[#ffffff00] pb-[90px]"
          onSubmit={handleSubmit}
          // onSubmit={(e) => console.log(e)}
        >
          {/* <div
          className="mt-[20px] h-full max-h-[33vh] w-full overflow-y-scroll bg-[#ffffff00] pb-[90px]"
          // onSubmit={(e) => console.log(e)}
        > */}
          <div className="flex h-auto w-full flex-col">
            {/* <div className={`sticky top-0 min-h-[60px] w-full`}></div> */}
            <div className={`flex min-h-[30px] items-end justify-between px-[30px]`}>
              <h3 className="flex min-h-[30px] max-w-max items-end space-x-[10px] space-y-[1px] text-[14px] font-bold ">
                <div
                  className="flex items-end space-x-[10px]"
                  onMouseEnter={(e) => {
                    handleOpenTooltip({
                      e: e,
                      display: "",
                      content: `○漢字・ふりがな・ローマ字を条件に入力して検索してください。\n例えば、「藤原」の印鑑データを取得する場合、漢字に「藤原」か、ふりがなに「ふじわら」、ローマ字に「Fujiwara」のどれかを入力します。\nもしくは、前方一致の検索で「藤＊」を入力すると「藤」が先頭に付く印鑑データを一覧で取得し、「＊原」は「原」が末尾に着く印鑑データを取得します。`,
                      // content2: "600万円と入力しても円単位に自動補完されます。",
                      // marginTop: 57,
                      marginTop: 39,
                      // marginTop: 10,
                      itemsPosition: "start",
                      // whiteSpace: "nowrap",
                      maxWidth: 550,
                    });
                    setHasBeenHoveredIcon(true);
                  }}
                  onMouseLeave={handleCloseTooltip}
                >
                  <span>条件を入力して印鑑データを検索</span>
                  {/* <div className="pointer-events-none flex min-h-[30px] items-end pb-[2px]">
                    <ImInfo className={`min-h-[18px] min-w-[18px] text-[var(--color-bg-brand-f)]`} />
                  </div> */}
                  <div className="pointer-events-none flex min-h-[30px] items-end pb-[2px]">
                    <div className="flex-center relative h-[18px] w-[18px] rounded-full">
                      <div
                        className={`flex-center absolute left-0 top-0 h-[18px] w-[18px] rounded-full border border-solid border-[var(--color-bg-brand-f)] ${
                          hasBeenHoveredIcon ? `` : `animate-ping`
                        }`}
                      ></div>
                      <ImInfo className={`min-h-[18px] min-w-[18px] text-[var(--color-bg-brand-f)]`} />
                    </div>
                  </div>
                </div>
                {[searchInputKanji, searchInputFurigana, searchInputRomaji].some(
                  (value) => value !== "" && value !== null
                ) && (
                  <div
                    className={`${styles.icon_path_stroke} ${styles.search_icon_btn} flex-center transition-bg03`}
                    onMouseEnter={(e) => {
                      // if (isOpenDropdownMenuFilterProducts) return;
                      handleOpenTooltip({
                        e: e,
                        display: "top",
                        content: "入力中の条件をリセット",
                        // content2: "フィルターの切り替えが可能です。",
                        // marginTop: 57,
                        // marginTop: 38,
                        marginTop: 12,
                        itemsPosition: "center",
                        whiteSpace: "nowrap",
                      });
                    }}
                    onMouseLeave={() => {
                      if (hoveredItemPosSideTable) handleCloseTooltip();
                    }}
                    onClick={() => {
                      // 入力値をリセット
                      if (searchInputKanji) setSearchInputKanji("");
                      if (searchInputFurigana) setSearchInputFurigana("");
                      if (searchInputRomaji) setSearchInputRomaji("");

                      if (hoveredItemPosSideTable) handleCloseTooltip();
                    }}
                  >
                    <GrPowerReset />
                  </div>
                )}
              </h3>
              <div className="flex pr-[0px]">
                <RippleButton
                  title={`検索`}
                  minHeight="30px"
                  minWidth="78px"
                  fontSize="13px"
                  bgColor="var(--color-bg-brand-f50)"
                  bgColorHover="var(--color-btn-brand-f-hover)"
                  border="var(--color-bg-brand-f)"
                  borderRadius="6px"
                  classText={`select-none`}
                  // clickEventHandler={() => {
                  //   // setIsOpenSettingInvitationModal(true);
                  //   console.log("ボタンクリック");
                  // }}
                  buttonType="submit"
                />
              </div>
            </div>
            {/* <ul className={`flex flex-col px-[1px] text-[13px] text-[var(--color-text-title)]`}>
                <li className="px-[30px]"></li>
              </ul> */}
            <ul className={`mt-[20px] flex flex-col text-[13px] text-[var(--color-text-title)]`}>
              {searchStampInputFields.map((item, index) => (
                <li
                  key={item.title + index.toString()}
                  className={`relative flex h-[56px] w-full min-w-max items-center justify-between px-[30px] py-[6px] text-[#fff] ${styles.side_table_search_list}`}
                >
                  <div className={`${styles.list_title_area} flex min-w-[120px] items-center`}>
                    <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                    <div className="flex select-none items-center space-x-[2px]">
                      <span className={`${styles.list_title} ${styles.change_member}`}>{item.title}</span>
                      {/* <span className={``}>：</span> */}
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder={getPlaceHolder(item.title)}
                    className={`${styles.input_box}`}
                    value={item.inputValue}
                    onChange={(e) => item.setInputValue(e.target.value)}
                    onBlur={() => !item.inputValue && item.setInputValue(item.inputValue.trim())}
                  />
                </li>
              ))}
            </ul>
            {/* {Array(20)
                .fill(null)
                .map((_, index) => (
                  <div
                    key={index}
                    className={`${index % 2 === 1 ? `bg-red-100` : `bg-blue-100`} min-h-[60px] w-full`}
                  ></div>
                ))} */}
          </div>
        </form>
        {/* 条件入力エリア ここまで */}

        <hr className="my-[0px] min-h-[1px] w-full bg-[var(--color-bg-brand-f)]" />

        {/* 担当者一覧エリア */}
        {/* <div className="h-[40vh] w-full bg-[#ffffff90] px-[30px] 2xl:px-[30px]"></div> */}
        <div
          ref={sideTableScrollContainerRef}
          className="flex h-full max-h-[calc(100vh-(30px+36px+20px+33vh+1px+0px))] w-full flex-col overflow-y-scroll bg-[#ffffff00] pb-[90px]"
        >
          <div ref={sideTableScrollItemRef} className="flex h-auto w-full flex-col">
            <div
              ref={sideTableScrollHeaderRef}
              className={`sticky top-0 flex min-h-[30px] items-end justify-between px-[30px] pb-[18px] pt-[18px] ${styles.side_table_attendees_header}`}
              // className={`sticky top-0 flex min-h-[30px] items-end justify-between bg-[var(--color-bg-brand-f-deep)] px-[30px] pb-[12px] pt-[12px]`}
            >
              <h3 className="flex min-h-[30px] max-w-max items-center space-x-[10px] space-y-[1px] text-[14px] font-bold">
                <span>選択して印鑑データの設定を変更</span>
                {/* <div className="min-h-[1px] w-auto bg-[#999]"></div> */}
                {!!selectedStampObj && (
                  <>
                    {/* <span className={`text-[11px] font-normal text-[#fff]`}>
                      {selectedSearchAttendeesArray.length}件選択中
                    </span> */}
                    <div
                      className={`${styles.icon_path_stroke} ${styles.icon_btn} flex-center transition-bg03`}
                      onMouseEnter={(e) => {
                        // if (isOpenDropdownMenuFilterProducts) return;
                        handleOpenTooltip({
                          e: e,
                          display: "top",
                          content: "選択中の印鑑データをリセット",
                          // content2: "フィルターの切り替えが可能です。",
                          // marginTop: 57,
                          // marginTop: 38,
                          marginTop: 12,
                          itemsPosition: "center",
                          whiteSpace: "nowrap",
                        });
                      }}
                      onMouseLeave={() => {
                        if (hoveredItemPosSideTable) handleCloseTooltip();
                      }}
                      onClick={() => {
                        setSelectedStampObj(null);
                        if (hoveredItemPosSideTable) handleCloseTooltip();
                      }}
                    >
                      <GrPowerReset />
                    </div>
                  </>
                )}
              </h3>
              <div className="flex">
                {!isLoadingUpsert && (
                  <RippleButton
                    title={`変更`}
                    minHeight="30px"
                    minWidth="78px"
                    fontSize="13px"
                    textColor={`${!!selectedStampObj ? `#fff` : `#666`}`}
                    bgColor={`${!!selectedStampObj ? `var(--color-bg-brand50)` : `#33333390`}`}
                    bgColorHover={`${!!selectedStampObj ? `var(--color-bg-brand)` : `#33333390`}`}
                    border={`${!!selectedStampObj ? `var(--color-bg-brand)` : `var(--color-bg-brandc0)`}`}
                    borderRadius="6px"
                    classText={`select-none ${!!selectedStampObj ? `` : `hover:cursor-not-allowed`}`}
                    clickEventHandler={() => {
                      // setIsOpenSettingInvitationModal(true);
                      handleAddSelectedMember();
                      handleCloseTooltip();
                    }}
                    onMouseEnterHandler={(e: React.MouseEvent<HTMLElement, MouseEvent>) => {
                      // if (isOpenDropdownMenuFilterProducts) return;
                      handleOpenTooltip({
                        e: e,
                        display: "top",
                        content: "データを選択して設定済みの印鑑データを変更する",
                        // content2: "フィルターの切り替えが可能です。",
                        // marginTop: 57,
                        // marginTop: 38,
                        marginTop: 12,
                        itemsPosition: "center",
                        // whiteSpace: "nowrap",
                      });
                    }}
                    onMouseLeaveHandler={() => {
                      if (hoveredItemPosSideTable) handleCloseTooltip();
                    }}
                  />
                )}
                {isLoadingUpsert && (
                  <div className="flex-center min-h-[30px] min-w-[78px]">
                    <SpinnerComet w="30px" h="30px" s="3px" />
                  </div>
                )}
              </div>
            </div>
            {/* 担当者一覧エリア */}
            <ul className={`flex h-auto w-full flex-col space-y-[12px]`}>
              {/* Rowsが存在する場合 */}

              {memberRows &&
                memberRows.length > 0 &&
                memberRows.map((stamp: SignatureStamp, index) => {
                  // if (stamp.id === currentstampId) return;
                  if (stamp.id === stampObj.signature_stamp_id) return;
                  if (!stamp.image_url) return;
                  return (
                    <StampListitem
                      key={stamp.id}
                      stamp={stamp}
                      selectedStampObj={selectedStampObj}
                      setSelectedStampObj={setSelectedStampObj}
                    />
                  );
                })}

              {/* <li className={`${styles.attendees_list} flex min-h-[44px] w-full cursor-pointer items-center truncate`}>
                <div
                  className={`${styles.stamp_list_item_Icon} flex-center h-[40px] w-[40px] cursor-pointer rounded-full bg-[var(--color-bg-brand-sub)] text-[#fff] hover:bg-[var(--color-bg-brand-sub-hover)] ${styles.tooltip} mr-[15px]`}
                >
                  <span className={`text-[27px]`}>N</span>
                </div>
                <div
                  className={`${styles.attendees_list_item_lines_group} flex h-full flex-col space-y-[3px] pl-[5px] text-[12px]`}
                >
                  <div className={`${styles.attendees_list_item_line} flex text-[13px]`}>
                    <span className="mr-[4px]">伊藤</span>
                  </div>
                </div>
              </li> */}

              {/* {memberRows &&
                memberRows.length > 0 &&
                memberRows.map((stamp: SignatureStamp, index) => {
                  // if (stamp.id === currentstampId) return;
                  if (stamp.id === stampObj.signature_stamp_id) return;
                  return (
                    <li
                      key={stamp.id}
                      className={`${
                        styles.attendees_list
                      } flex min-h-[44px] w-full cursor-pointer items-center truncate ${
                        selectedStampObj && selectedStampObj.id === stamp.id ? styles.active : ``
                      }`}
                      onClick={() => {
                        // 存在の確認のみなので、findではなくsome
                        if (selectedStampObj && selectedStampObj.id === stamp.id) {
                          // 既に選択している場合はリセット
                          setSelectedStampObj(null);
                          return;
                        } else {
                          // 存在しない場合は新たに選択中に追加する
                          setSelectedStampObj(stamp);
                        }
                      }}
                    >
                      <div
                        className={`${styles.attendees_list_item_Icon} flex-center h-[40px] w-[40px] cursor-pointer rounded-full bg-[var(--color-bg-brand-sub)] text-[#fff] hover:bg-[var(--color-bg-brand-sub-hover)] ${styles.tooltip} mr-[15px]`}
                      >
                        <span className={`text-[20px]`}>
                        </span>
                      </div>
                      <div
                        className={`${styles.attendees_list_item_lines_group} flex h-full flex-col space-y-[3px] pl-[5px] text-[12px]`}
                      >
                        <div className={`${styles.attendees_list_item_line} flex text-[13px]`}>
                          {stamp.kanji && <span className="mr-[4px]">{stamp.kanji}</span>}
                        </div>
                      </div>
                    </li>
                  );
                })} */}
              {/* 条件検索結果が1件も無い場合 */}
              {/* 初回マウント時ではなく検索結果で行が0の場合 countがnullではなく0の場合 data.pages[0].row  */}
              {queryCount === 0 && (
                <div className={`flex-center h-full min-h-[100px] w-full bg-[#ffffff00] text-[13px] text-[#fff]`}>
                  <span>該当する印鑑データは見つかりませんでした。</span>
                </div>
              )}
              {/* 条件検索結果が1件も無い場合 */}

              {/* もっと見る */}
              {hasNextPage && (
                <div className="flex-center relative min-h-[64.5px] w-full rounded-[8px] text-[14px]">
                  {isFetchingNextPage ? (
                    <SpinnerComet width="!w-[35px]" height="!h-[35px]" />
                  ) : (
                    <>
                      <div
                        className="flex-center transition-bg01 group z-[10] h-[57%] w-[58%] cursor-pointer rounded-full bg-[var(--color-text-brand-f)] text-[#fff] hover:bg-[var(--color-text-brand-f-deep)]"
                        onClick={handleNextFetch}
                      >
                        <span>もっと見る</span>
                      </div>
                      <div className="z-5 absolute left-0 top-[50%] h-[1px] w-full bg-[var(--color-text-brand-f)] "></div>
                    </>
                  )}
                </div>
              )}
              {/* もっと見る ここまで */}
            </ul>
          </div>
        </div>
        {/* 担当者一覧エリア ここまで */}
      </div>
    </>
  );
};

export const SideTableSearchSignatureStamp = memo(SideTableSearchSignatureStampMemo);
