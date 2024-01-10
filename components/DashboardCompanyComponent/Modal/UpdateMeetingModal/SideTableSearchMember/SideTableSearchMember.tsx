import { RippleButton } from "@/components/Parts/RippleButton/RippleButton";
import { neonSearchIcon } from "@/components/assets";
import { Dispatch, FormEvent, SetStateAction, memo, useCallback, useEffect, useRef, useState } from "react";
import { BsChevronRight } from "react-icons/bs";
import { MdOutlineDataSaverOff } from "react-icons/md";
import styles from "../UpdateMeetingModal.module.css";
import { Contact_row_data, Department, MemberAccounts, Office, Unit } from "@/types";
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

type NewMemberObj = { newMemberId: string; newMemberName: string } | null;

type Props = {
  isOpenSearchMemberSideTable: boolean;
  setIsOpenSearchMemberSideTable: Dispatch<SetStateAction<boolean>>;
  currentMemberId: string;
  currentMemberName: string;
  currentMemberDepartmentId: string | null;
  setChangedMemberObj: Dispatch<SetStateAction<NewMemberObj>>;
  setMeetingMemberName: Dispatch<SetStateAction<string>>;
  // searchMemberInputFields: {
  //   title: string;
  //   inputValue: string;
  //   setInputValue: React.Dispatch<React.SetStateAction<string>>;
  // }[];
  // selectedAttendeesArray: Contact_row_data[];
  // setSelectedAttendeesArray: Dispatch<SetStateAction<Contact_row_data[]>>;
};

type SearchMemberParams = {
  _subscription_id: string | null;
  _company_id: string | null;
  _user_name: string | null;
  _employee_id_name: string | null;
  _department_id: string | null;
  _unit_id: string | null;
  _office_id: string | null;
};

const SideTableSearchMemberMemo = ({
  isOpenSearchMemberSideTable,
  setIsOpenSearchMemberSideTable,
  currentMemberId,
  currentMemberName,
  currentMemberDepartmentId,
  setChangedMemberObj,
  setMeetingMemberName,
}: // selectedAttendeesArray,
// setSelectedAttendeesArray,
Props) => {
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  // メディアクエリState
  // デスクトップモニター
  const isDesktopGTE1600Media = useMedia("(min-width: 1600px)", false);
  const [isDesktopGTE1600, setIsDesktopGTE1600] = useState(isDesktopGTE1600Media);
  useEffect(() => {
    setIsDesktopGTE1600(isDesktopGTE1600Media);
  }, [isDesktopGTE1600Media]);

  const queryClient = useQueryClient();

  // ============================ 🌟事業部、係、事業所リスト取得useQuery🌟 ============================
  const departmentDataArray: Department[] | undefined = queryClient.getQueryData(["departments"]);
  const unitDataArray: Unit[] | undefined = queryClient.getQueryData(["units"]);
  const officeDataArray: Office[] | undefined = queryClient.getQueryData(["offices"]);
  // ============================ ✅事業部、係、事業所リスト取得useQuery✅ ============================

  // 初回マウント時フェッチを防ぐ 検索をクリックした時に初めてqueryFnを実行
  const [isEnableFetch, setIsEnableFetch] = useState(false);
  // 自社担当の変更先の担当者オブジェクト, profile_nameを自社担当に割り当て、idをcreated_by_user_idに割り当てる
  const [selectedMemberObj, setSelectedMemberObj] = useState<MemberAccounts | null>(null);

  // 同席者検索時のparams
  const [searchMemberParams, setSearchMemberParams] = useState<SearchMemberParams>({
    _subscription_id: null,
    _company_id: null,
    _user_name: null,
    _employee_id_name: null,
    _department_id: null,
    _unit_id: null,
    _office_id: null,
  });

  // 同席者検索フィールド用input
  const [searchInputMemberName, setSearchInputMemberName] = useState(""); //メンバーの名前
  const [searchInputEmployeesIdName, setSearchInputEmployeesIdName] = useState(""); //社員番号
  const [searchSelectedDepartmentId, setSearchSelectedDepartmentId] = useState<Department["id"] | null>(
    currentMemberDepartmentId
  ); //事業部id
  const [searchSelectedUnitId, setSearchSelectedUnitId] = useState<Unit["id"] | null>(null); //係id
  const [searchSelectedOfficeId, setSearchSelectedOfficeId] = useState<Office["id"] | null>(null); //事業所id

  const searchMemberInputFields = [
    {
      title: "社員名",
      inputValue: searchInputMemberName,
      setInputValue: setSearchInputMemberName,
    },
    {
      title: "社員番号・ID",
      inputValue: searchInputEmployeesIdName,
      setInputValue: setSearchInputEmployeesIdName,
    },
  ];
  const searchMemberSelectFields = [
    {
      key: "department",
      title: "事業部",
      inputValue: searchSelectedDepartmentId,
      setInputValue: setSearchSelectedDepartmentId,
    },
    {
      key: "unit",
      title: "係・チーム",
      inputValue: searchSelectedUnitId,
      setInputValue: setSearchSelectedUnitId,
    },
    {
      key: "office",
      title: "事業所・営業所",
      inputValue: searchSelectedOfficeId,
      setInputValue: setSearchSelectedOfficeId,
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
    if (!userProfileState) return alert("エラー：ユーザー情報が見つかりませんでした。");
    console.log("🔥onnSubmit発火");
    e.preventDefault();

    let params = {
      _subscription_id: userProfileState.subscription_id,
      _company_id: userProfileState.company_id,
      _user_name: adjustFieldValue(searchInputMemberName),
      _employee_id_name: adjustFieldValue(searchInputEmployeesIdName),
      _department_id: searchSelectedDepartmentId || null,
      _unit_id: searchSelectedUnitId || null,
      _office_id: searchSelectedOfficeId || null,
    };
    console.log("✅ 条件 params", params);

    // 現在の入力値と同じかチェック
    if (
      params._user_name === searchMemberParams._user_name &&
      params._employee_id_name === searchMemberParams._employee_id_name &&
      params._department_id === searchMemberParams._department_id &&
      params._unit_id === searchMemberParams._unit_id &&
      params._office_id === searchMemberParams._office_id
    ) {
      return console.log("✅params同じためリターン");
    }

    // paramsの結合した文字列をqueryKeyに渡しているため、検索条件の入力値が変わると（paramsが変わると）useInfiniteQueryのqueryFnが再度実行される
    setSearchMemberParams(params);
  };
  // ------------- ✅検索ボタンクリックかエンターでonSubmitイベント発火✅ -------------

  let fetchNewSearchServerPage: any;

  fetchNewSearchServerPage = async (
    limit: number,
    offset: number = 0
  ): Promise<{ rows: MemberAccounts[] | null; nextOffset: number; isLastPage: boolean; count: number | null }> => {
    // ローディング開始
    // setIsLoadingQuery(true);
    if (!userProfileState?.company_id) {
      let rows: null = null;
      const isLastPage = rows === null;
      let count: null = null;
      // await new Promise((resolve) => setTimeout(resolve, 500));

      return { rows, nextOffset: offset + 1, isLastPage, count };
    }

    // 条件の値が全てnullなら、つまり何も入力せず検索されるか初回マウント時はnullを返す。
    // if (Object.values(searchMemberParams).every((value) => value === null)) {
    // 社員名と社員番号どちらかは必ず入力 nullか空文字ならrowをnullで返す
    if (!searchMemberParams._user_name || !searchMemberParams._employee_id_name) {
      let rows: null = null;
      const isLastPage = rows === null;
      let count: null = null;
      // await new Promise((resolve) => setTimeout(resolve, 500));

      return { rows, nextOffset: offset + 1, isLastPage, count };
    }

    const from = offset * limit;
    const to = from + limit - 1;

    let params = searchMemberParams;

    // 名前、社員番号は入力値をワイルドカードとILIKEで、事業部、係、事業所はidに一致で条件検索
    // 事業部、名前順に並び替え、activeのみに絞り込み
    const {
      data: rows,
      error,
      count,
    } = await supabase
      // .rpc("get_members_searched_name_employee_id_name", { params }, { count: "exact" })
      .rpc("get_members_searched_name_employee_id_name", params, { count: "exact" })
      .range(from, to)
      .order("assigned_department_name", { ascending: true })
      .order("profile_name", { ascending: true });
    // .order("contact_created_at", { ascending: false }); // 担当者作成日 更新にすると更新の度に行が入れ替わるため

    if (error) throw error;

    // const rows = ensureClientCompanies(data);

    // フェッチしたデータの数が期待される数より少なければ、それが最後のページであると判断します
    const isLastPage = rows === null || rows.length < limit;

    // 0.5秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // ローディング終了 => useQueryのisLoadingを使用
    // setIsLoadingQuery(false);
    // setLoadingGlobalState(false);

    return { rows, nextOffset: offset + 1, isLastPage, count };
  };

  // ------------------- 🌟queryKeyの生成🌟 -------------------
  const queryKeySearchParamsStringRef = useRef<string | null>(null);
  console.log("キャッシュに割り当てるparamsキー searchMemberParams", searchMemberParams);
  if (searchMemberParams) {
    // queryKeySearchParamsStringRef.current = Object.entries(searchMemberParams)
    //   .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    //   .map(([key, value]) => `${key}:${value === null ? `null` : `${value}`}`)
    //   .join(", ");
    queryKeySearchParamsStringRef.current = [
      ["_user_name", searchMemberParams._user_name],
      ["_employee_id_name", searchMemberParams._employee_id_name],
      ["_department_id", searchMemberParams._department_id],
      ["_unit_id", searchMemberParams._unit_id],
      ["_office_id", searchMemberParams._office_id],
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
    queryKey: ["members", queryKeySearchParamsStringRef.current],
    // queryKey: ["contacts"],
    queryFn: async (ctx) => {
      console.log("サーチフェッチ queryFn✅✅✅ searchMemberParams", searchMemberParams);
      return fetchNewSearchServerPage(20, ctx.pageParam); // 20個ずつ取得
    },
    getNextPageParam: (lastGroup, allGroups) => {
      // lastGroup.isLastPageがtrueならundefinedを返す
      return lastGroup.isLastPage ? undefined : allGroups.length;
    },
    staleTime: Infinity,
    enabled:
      isOpenSearchMemberSideTable &&
      isEnableFetch &&
      !!userProfileState?.company_id &&
      !!userProfileState?.subscription_id,
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
        rows: MemberAccounts[] | null;
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

  console.log(
    "=============================================queryDataObj",
    queryDataObj,
    "queryCount",
    queryCount,
    "isLastPage",
    isLastPage,
    "hasNextPage",
    hasNextPage,
    "memberRows",
    memberRows,
    "searchMemberParams",
    searchMemberParams
  );
  // -------------------------- ✅useInfiniteQuery無限スクロール✅ --------------------------

  // -------------------------- 🌟変更ボタンをクリック🌟 --------------------------
  const handleAddSelectedMember = () => {
    if (!selectedMemberObj) return;
    if (!selectedMemberObj.id) return alert("エラー：メンバーデータが見つかりませんでした。");
    if (!selectedMemberObj.profile_name) return alert("エラー：メンバー名が見つかりませんでした。");
    // 現在の自社担当と同じidの場合はリターンする idはprofiles.id
    const isEqualMember = selectedMemberObj.id === currentMemberId;
    if (isEqualMember) {
      alert(`同じ担当者です。変更が不要な場合は戻ってください。`);
      return;
    } else {
      // 同席者リストに一人も含まれていない場合はリストに追加
      const newMemberObj: NewMemberObj = {
        newMemberId: selectedMemberObj.id,
        newMemberName: selectedMemberObj.profile_name,
      };

      // 初回変更ボタンクリックのみ isEnableFetchをtrueにして初めてフェッチを走らせる
      if (!isEnableFetch) setIsEnableFetch(true);

      // 変更後のメンバーstateに追加
      setChangedMemberObj(newMemberObj);

      // 変更確定確認モーダルを開く
      // setIsChangeConfirmationModal(true)

      // サイドテーブルを閉じる
      setIsOpenSearchMemberSideTable(false);

      // 変更が完了したら選択中のメンバーをリセット
      setSelectedMemberObj(null);
    }
  };
  // -------------------------- ✅変更ボタンをクリック✅ --------------------------

  // -------------------------- 🌟変更確定ボタンをクリック🌟 --------------------------
  // const handleConfirmChangeMember = () => {

  // }
  // -------------------------- ✅変更確定ボタンをクリック✅ --------------------------

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
        return console.log("❌useEffectクリーンアップ sideTableScrollContainerRef.currentは既に存在せず リターン");
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

  return (
    <>
      {/* オーバーレイ */}
      {isOpenSearchMemberSideTable && (
        <div
          // className={`absolute left-0 top-0 z-[1100] h-full w-full bg-[#00800030]`}
          className={`absolute left-0 top-0 z-[1100] h-full w-full bg-[#00000000]`}
          onClick={() => {
            setMeetingMemberName(currentMemberName);
            setIsOpenSearchMemberSideTable(false);
          }}
        ></div>
      )}
      {/* サイドテーブル */}
      <div
        ref={modalContainerRef}
        className={`${styles.side_table} ${styles.change_member} z-[1200] pt-[30px] ${
          isOpenSearchMemberSideTable
            ? `${styles.active} transition-transform02 !delay-[0.1s]`
            : `transition-transform01`
        }`}
      >
        {/* ツールチップ */}
        {hoveredItemPosSideTable && <TooltipSideTable />}
        {/* タイトルエリア */}
        <div className="flex h-auto w-full flex-col px-[30px] 2xl:px-[30px]">
          <div className={`relative flex h-full w-full items-center justify-between`}>
            <h3 className="space-y-[1px] text-[22px] font-bold">
              <div className={`flex items-start space-x-[9px]`}>
                <span>メンバー検索</span>
                <span>{neonSearchIcon("30")}</span>
              </div>
              <div className="min-h-[1px] w-full bg-[var(--color-bg-brand-f)]"></div>
              {/* <div className="brand-gradient-underline-light min-h-[1px] w-full"></div> */}
            </h3>
            <div
              // className={`flex-center h-[36px] w-[36px] cursor-pointer rounded-full hover:bg-[#666]`}
              className={`z-1 flex-center absolute right-[-10px] top-[50%]  h-[36px] w-[36px] translate-y-[-50%] cursor-pointer rounded-full hover:bg-[#666]`}
              onClick={() => {
                setMeetingMemberName(currentMemberName);
                setIsOpenSearchMemberSideTable(false);
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
                  onMouseEnter={(e) =>
                    handleOpenTooltip({
                      e: e,
                      display: "",
                      content: `○同席者が所属する会社名や部署名など条件を入力して検索してください。\n例えば、会社名で「株式会社データベース」で会社住所が「"東京都大田区"」の「"佐藤"」という担当者を検索する場合は、「会社名」に「株式会社データベース」または「＊データベース＊」を入力し、「住所」に「東京都大田区※」と入力、担当者名に「＊佐藤＊」を入力してください。\n○「※ アスタリスク」は、「前方一致・後方一致・部分一致」を表します。\n例えば、会社名に「"工業"」と付く会社を検索したい場合に、「※工業※」、「"製作所"」と付く会社は「※製作所※」と検索することで、指定した文字が付くデータを検索可能です\n○「○項目を空欄のまま検索した場合は、その項目の「全てのデータ」を抽出します。\n○最低一つの項目は入力して検索してください。`,
                      // content2: "600万円と入力しても円単位に自動補完されます。",
                      // marginTop: 57,
                      marginTop: 39,
                      // marginTop: 10,
                      itemsPosition: "start",
                      // whiteSpace: "nowrap",
                      maxWidth: 550,
                    })
                  }
                  onMouseLeave={handleCloseTooltip}
                >
                  <span>条件を入力してメンバーを検索</span>
                  {/* <div className="min-h-[1px] w-auto bg-[#999]"></div> */}
                  {/* <RippleButton
                    title={`検索`}
                    bgColor="var(--color-bg-brand-f50)"
                    bgColorHover="var(--color-btn-brand-f-hover)"
                    classText={`select-none`}
                    clickEventHandler={() => {
                      // setIsOpenSettingInvitationModal(true);
                    }}
                  /> */}
                  <div className="pointer-events-none flex min-h-[30px] items-end pb-[2px]">
                    <ImInfo className={`min-h-[18px] min-w-[18px] text-[var(--color-bg-brand-f)]`} />
                  </div>
                </div>
                {[
                  searchInputMemberName,
                  searchInputEmployeesIdName,
                  searchSelectedDepartmentId,
                  searchSelectedUnitId,
                  searchSelectedOfficeId,
                ].some((value) => value !== "" || value !== null) && (
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
                      // [
                      //   [searchInputCompany, setSearchInputCompany],
                      //   [searchInputDepartment, setSearchInputDepartment],
                      //   [searchInputContact, setSearchInputContact],
                      //   [searchInputPositionName, setSearchInputPositionName],
                      //   [searchInputTel, setSearchInputTel],
                      //   [searchInputDirectLine, setSearchInputDirectLine],
                      //   [searchInputCompanyCellPhone, setSearchInputCompanyCellPhone],
                      //   [searchInputEmail, setSearchInputEmail],
                      //   [searchInputAddress, setSearchInputAddress],
                      // ].forEach(([state, setDispatch]) => !!state && setDispatch(""));
                      if (searchInputMemberName) setSearchInputMemberName("");
                      if (searchInputEmployeesIdName) setSearchInputEmployeesIdName("");
                      if (searchSelectedDepartmentId) setSearchSelectedDepartmentId(null);
                      if (searchSelectedUnitId) setSearchSelectedUnitId(null);
                      if (searchSelectedOfficeId) setSearchSelectedOfficeId(null);

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
              {searchMemberInputFields.map((item, index) => (
                <li
                  key={item.title + index.toString()}
                  className={`relative flex h-[56px] w-full min-w-max items-center justify-between px-[30px] py-[6px] text-[#fff] ${styles.side_table_search_list}`}
                >
                  <div className={`${styles.list_title_area} flex min-w-[120px] items-center`}>
                    <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                    <div className="flex select-none items-center space-x-[2px]">
                      <span className={`${styles.list_title}`}>{item.title}</span>
                      <span className={``}>：</span>
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder=""
                    className={`${styles.input_box}`}
                    value={item.inputValue}
                    onChange={(e) => item.setInputValue(e.target.value)}
                    onBlur={() => !item.inputValue && item.setInputValue(item.inputValue.trim())}
                  />
                </li>
              ))}
              {searchMemberSelectFields.map((item, index) => (
                <li
                  key={item.title + index.toString()}
                  className={`relative flex h-[56px] w-full min-w-max items-center justify-between px-[30px] py-[6px] text-[#fff] ${styles.side_table_search_list}`}
                >
                  <div className={`${styles.list_title_area} flex min-w-[120px] items-center`}>
                    <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                    <div className="flex select-none items-center space-x-[2px]">
                      <span className={`${styles.list_title}`}>{item.title}</span>
                      <span className={``}>：</span>
                    </div>
                  </div>
                  <select
                    className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                    value={item.inputValue ? item.inputValue : ""}
                    onChange={(e) => item.setInputValue(e.target.value)}
                  >
                    <option value=""></option>
                    {item.key === "department" &&
                      departmentDataArray &&
                      departmentDataArray.length >= 1 &&
                      departmentDataArray.map((department) => (
                        <option key={department.id} value={department.id}>
                          {department.department_name}
                        </option>
                      ))}
                    {item.key === "unit" &&
                      unitDataArray &&
                      unitDataArray.length >= 1 &&
                      unitDataArray.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.unit_name}
                        </option>
                      ))}
                    {item.key === "office" &&
                      officeDataArray &&
                      officeDataArray.length >= 1 &&
                      officeDataArray.map((office) => (
                        <option key={office.id} value={office.id}>
                          {office.office_name}
                        </option>
                      ))}
                  </select>
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
                <span>メンバーを選択してデータの所有者を変更</span>
                {/* <div className="min-h-[1px] w-auto bg-[#999]"></div> */}
                {!!selectedMemberObj && (
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
                          content: "選択中のメンバーをリセット",
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
                        setSelectedMemberObj(null);
                        if (hoveredItemPosSideTable) handleCloseTooltip();
                      }}
                    >
                      <GrPowerReset />
                    </div>
                  </>
                )}
              </h3>
              <div className="flex">
                <RippleButton
                  title={`変更`}
                  minHeight="30px"
                  minWidth="78px"
                  fontSize="13px"
                  textColor={`${!!selectedMemberObj ? `#fff` : `#666`}`}
                  bgColor={`${!!selectedMemberObj ? `var(--color-bg-brand50)` : `#33333390`}`}
                  bgColorHover={`${!!selectedMemberObj ? `var(--color-bg-brand)` : `#33333390`}`}
                  border={`${!!selectedMemberObj ? `var(--color-bg-brand)` : `var(--color-bg-brandc0)`}`}
                  borderRadius="6px"
                  classText={`select-none ${!!selectedMemberObj ? `` : `hover:cursor-not-allowed`}`}
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
                      content: "担当者を選択してメンバーを変更する",
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
              </div>
            </div>
            {/* 担当者一覧エリア */}
            <ul className={`flex h-auto w-full flex-col space-y-[12px]`}>
              {/* Rowsが存在する場合 */}
              {memberRows &&
                memberRows.length > 0 &&
                memberRows.map((member: MemberAccounts, index) => (
                  <li
                    key={member.id}
                    // onMouseEnter={(e) => {
                    //   handleOpenTooltip({
                    //     e: e,
                    //     display: "top",
                    //     content: `${member.company_name ? `${member.company_name} / ` : ``}${
                    //       member.contact_name ? `${member.contact_name} / ` : ``
                    //     }${member.department_name ? `${member.department_name} / ` : ``}${
                    //       member.position_name ? `${member.position_name}` : ``
                    //     }`,
                    //     content2: `${member.address ? `住所: ${member.address} / ` : ``}${
                    //       member.main_phone_number ? `代表TEL: ${member.main_phone_number} / ` : ``
                    //     }${member.direct_line ? `直通TEL: ${member.direct_line} / ` : ``}${
                    //       member.contact_email ? `担当者Email: ${member.contact_email}` : ``
                    //     }`,
                    //     // marginTop: 57,
                    //     // marginTop: 38,
                    //     // marginTop: 12,
                    //     marginTop: -32,
                    //     itemsPosition: "start",
                    //     whiteSpace: "nowrap",
                    //   });
                    // }}
                    // onMouseLeave={() => {
                    //   if (hoveredItemPosSideTable) handleCloseTooltip();
                    // }}
                    className={`${styles.members_list} flex min-h-[44px] w-full cursor-pointer items-center truncate ${
                      selectedMemberObj && selectedMemberObj.id === member.id ? styles.active : ``
                    }`}
                    onClick={() => {
                      // 存在の確認のみなので、findではなくsome
                      if (selectedMemberObj && selectedMemberObj.id === member.id) {
                        // 既に選択している場合はリセット
                        setSelectedMemberObj(null);
                        return;
                      } else {
                        // 存在しない場合は新たに選択中に追加する
                        setSelectedMemberObj(member);
                      }
                    }}
                  >
                    <div
                      // data-text="ユーザー名"
                      className={`${styles.attendees_list_item_Icon} flex-center h-[40px] w-[40px] cursor-pointer rounded-full bg-[var(--color-bg-brand-sub)] text-[#fff] hover:bg-[var(--color-bg-brand-sub-hover)] ${styles.tooltip} mr-[15px]`}
                      // onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                      // onMouseLeave={handleCloseTooltip}
                    >
                      {/* <span className={`text-[20px]`}>
                          {getInitial(member.profile_name ? member.profile_name : "")}
                        </span> */}
                      <span className={`text-[20px]`}>
                        {getInitial(member.profile_name ? member.profile_name : "N")}
                      </span>
                    </div>
                    <div
                      className={`${styles.attendees_list_item_lines_group} flex h-full flex-col space-y-[3px] pl-[5px] text-[12px]`}
                    >
                      {/* 会社・部署 */}
                      <div className={`${styles.attendees_list_item_line} flex text-[13px]`}>
                        {member.profile_name && <span className="mr-[4px]">{member.profile_name}</span>}
                        {/* <span>{attendee.department_name ?? ""}</span> */}
                      </div>
                      {/* <div className={`text-[var(--color-text-sub)]`}>{member.email ? member.email : ""}</div> */}
                      {/* 役職・名前 */}
                      <div className={`${styles.attendees_list_item_line} flex`}>
                        {/* {member.profile_name && (
                          <>
                            <span className="mr-[12px]">{member.profile_name}</span>
                          </>
                        )} */}
                        {member.assigned_department_name && (
                          <>
                            <span className="mr-[12px]">{member.assigned_department_name}</span>
                            {/* {member.position_name && <span className="mr-[10px]">/</span>} */}
                          </>
                        )}
                        {member.assigned_unit_name && <span className="mr-[10px]">{member.assigned_unit_name}</span>}
                      </div>
                      {/* 住所・Email・1600以上で直通TEL */}
                      <div className={`${styles.attendees_list_item_line} flex`}>
                        {/* {attendee.address && (
                          <>
                            <span className="mr-[10px] text-[#ccc]">{attendee.address}</span>
                            {((isDesktopGTE1600 && attendee.direct_line) || attendee.contact_email) && (
                              <span className="mr-[10px]">/</span>
                            )}
                          </>
                        )} */}
                        {isDesktopGTE1600 && member.assigned_office_name && (
                          <>
                            <span className="mr-[10px] text-[#ccc]">{member.assigned_office_name}</span>
                            {member.assigned_employee_id_name && <span className="mr-[10px]">/</span>}
                          </>
                        )}
                        {member.assigned_employee_id_name && (
                          <div className={`text-[#ccc]`}>{member.assigned_employee_id_name}</div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              {/* 条件検索結果が1件も無い場合 */}
              {/* 初回マウント時ではなく検索結果で行が0の場合 countがnullではなく0の場合 data.pages[0].row  */}
              {queryCount === 0 && (
                <div className={`flex-center h-full min-h-[100px] w-full bg-[#ffffff00] text-[13px] text-[#fff]`}>
                  <span>該当するメンバーは見つかりませんでした。</span>
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

              {/* <div className="flex-center relative min-h-[64.5px] w-full rounded-[8px] text-[14px]">
                <div className="flex-center transition-bg01 group z-[10] h-[57%] w-[58%] cursor-pointer rounded-full bg-[var(--color-text-brand-f)] text-[#fff] hover:bg-[var(--color-text-brand-f-deep)]">
                  <span>もっと見る</span>
                </div>
                <div className="z-5 absolute left-0 top-[50%] h-[1px] w-full bg-[var(--color-text-brand-f)] "></div>
              </div> */}
              {/* <div className="flex-center relative min-h-[64.5px] w-full rounded-[8px] text-[14px]">
                <SpinnerComet width="!w-[35px]" height="!h-[35px]" />
              </div> */}
              {/* {Array(12)
                .fill(null)
                .map((_, index) => (
                  <li
                    key={index}
                    className={`${styles.attendees_list} flex min-h-[44px] w-full cursor-pointer items-center truncate rounded-[8px] py-[12px] pl-[24px] hover:bg-[var(--color-bg-brand-f30)]`}
                    // onClick={() => {
                    // }}
                  >
                    <div
                      // data-text="ユーザー名"
                      className={`${styles.attendees_list_item_Icon} flex-center h-[40px] w-[40px] cursor-pointer rounded-full bg-[var(--color-bg-brand-sub)] text-[#fff] hover:bg-[var(--color-bg-brand-sub-hover)] ${styles.tooltip} mr-[15px]`}
                      // onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                      // onMouseLeave={handleCloseTooltip}
                    >
                      <span className={`text-[20px]`}>伊</span>
                    </div>
                    <div
                      className={`${styles.attendees_list_item_lines_group} flex h-full flex-col space-y-[3px] pl-[5px] text-[12px]`}
                    >
                      <div className={`${styles.attendees_list_item_line} flex text-[13px]`}>
                        <span className="mr-[12px]">株式会社トラスティファイ</span>
                      </div>
                      <div className={`${styles.attendees_list_item_line} flex`}>
                        <span className="mr-[12px]">伊藤 謙太</span>
                        <span className="mr-[12px]">事業推進本部事業推進グループ</span>
                        <span className="mr-[12px]">エグゼクティブマネージャー兼チーフエバンジェリストCEO</span>
                      </div>
                      <div className={`${styles.attendees_list_item_line} flex space-x-[10px]`}>
                        <div className="flex text-[#ccc]">
                          <span>東京都港区芝浦4-20-2 ローズスクエア12F</span>
                        </div>
                        <span>/</span>
                        {isDesktopGTE1600 && (
                          <>
                            <div className="flex text-[#ccc]">
                              <span>01-4567-8900</span>
                            </div>
                            <span>/</span>
                          </>
                        )}
                        <div className={`text-[#ccc]`}>cieletoile.1204@gmail.com</div>
                      </div>
                    </div>
                  </li>
                ))} */}
            </ul>
          </div>
        </div>
        {/* 担当者一覧エリア ここまで */}
      </div>
    </>
  );
};

export const SideTableSearchMember = memo(SideTableSearchMemberMemo);
