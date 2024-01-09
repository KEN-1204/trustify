import { RippleButton } from "@/components/Parts/RippleButton/RippleButton";
import { neonSearchIcon } from "@/components/assets";
import { Dispatch, FormEvent, SetStateAction, memo, useCallback, useEffect, useRef, useState } from "react";
import { BsChevronRight } from "react-icons/bs";
import { MdOutlineDataSaverOff } from "react-icons/md";
import styles from "../UpdateMeetingModal.module.css";
import { Contact_row_data } from "@/types";
import { useMedia } from "react-use";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import useDashboardStore from "@/store/useDashboardStore";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getInitial } from "@/utils/Helpers/getInitial";
import { SpinnerComet } from "@/components/Parts/SpinnerComet/SpinnerComet";
import { GrPowerReset } from "react-icons/gr";
import useStore from "@/store";
import { TooltipSideTable } from "@/components/Parts/Tooltip/TooltipSideTable";

type Props = {
  isOpenSearchAttendeesSideTable: boolean;
  setIsOpenSearchAttendeesSideTable: Dispatch<SetStateAction<boolean>>;
  // searchAttendeeFields: {
  //   title: string;
  //   inputValue: string;
  //   setInputValue: React.Dispatch<React.SetStateAction<string>>;
  // }[];
  selectedAttendeesArray: Contact_row_data[];
  setSelectedAttendeesArray: Dispatch<SetStateAction<Contact_row_data[]>>;
};

type SearchAttendeesParams = {
  "client_companies.name": string | null;
  department_name: string | null;
  "contacts.name": string | null;
  position_name: string | null;
  main_phone_number: string | null;
  direct_line: string | null;
  company_cell_phone: string | null;
  "contacts.email": string | null;
  address: string | null;
};

export const SideTableSearchAttendeesMemo = ({
  isOpenSearchAttendeesSideTable,
  setIsOpenSearchAttendeesSideTable,
  // searchAttendeeFields,
  selectedAttendeesArray,
  setSelectedAttendeesArray,
}: Props) => {
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  // メディアクエリState
  // デスクトップモニター
  const isDesktopGTE1600Media = useMedia("(min-width: 1600px)", false);
  const [isDesktopGTE1600, setIsDesktopGTE1600] = useState(isDesktopGTE1600Media);
  useEffect(() => {
    setIsDesktopGTE1600(isDesktopGTE1600Media);
  }, [isDesktopGTE1600Media]);

  // 同席者検索時のparams
  const [searchAttendeesParams, setSearchAttendeesParams] = useState<SearchAttendeesParams>({
    "client_companies.name": null,
    department_name: null,
    "contacts.name": null,
    position_name: null,
    main_phone_number: null,
    direct_line: null,
    company_cell_phone: null,
    "contacts.email": null,
    address: null,
  });

  // 同席者検索フィールド用input
  const [searchInputCompany, setSearchInputCompany] = useState(""); //会社名
  const [searchInputDepartment, setSearchInputDepartment] = useState(""); //部署名
  const [searchInputContact, setSearchInputContact] = useState(""); //担当者名
  const [searchInputPositionName, setSearchInputPositionName] = useState(""); //役職名
  const [searchInputTel, setSearchInputTel] = useState(""); //代表TEL
  const [searchInputDirectLine, setSearchInputDirectLine] = useState(""); //直通TEL
  const [searchInputCompanyCellPhone, setSearchInputCompanyCellPhone] = useState(""); //社用携帯
  const [searchInputEmail, setSearchInputEmail] = useState(""); //Email
  const [searchInputAddress, setSearchInputAddress] = useState(""); //住所
  // モーダルの同席者カードに追加前のテーブル内で選択中の同席者オブジェクトを保持するstate
  const [selectedSearchAttendeesArray, setSelectedSearchAttendeesArray] = useState<Contact_row_data[]>([]);

  const searchAttendeeFields = [
    {
      title: "会社名",
      inputValue: searchInputCompany,
      setInputValue: setSearchInputCompany,
    },
    {
      title: "部署名",
      inputValue: searchInputDepartment,
      setInputValue: setSearchInputDepartment,
    },
    {
      title: "担当者名",
      inputValue: searchInputContact,
      setInputValue: setSearchInputContact,
    },
    {
      title: "役職名",
      inputValue: searchInputPositionName,
      setInputValue: setSearchInputPositionName,
    },
    {
      title: "代表TEL",
      inputValue: searchInputTel,
      setInputValue: setSearchInputTel,
    },
    {
      title: "直通TEL",
      inputValue: searchInputDirectLine,
      setInputValue: setSearchInputDirectLine,
    },
    {
      title: "社用携帯",
      inputValue: searchInputCompanyCellPhone,
      setInputValue: setSearchInputCompanyCellPhone,
    },
    {
      title: "Email",
      inputValue: searchInputEmail,
      setInputValue: setSearchInputEmail,
    },
    {
      title: "住所",
      inputValue: searchInputAddress,
      setInputValue: setSearchInputAddress,
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
    console.log("🔥onnSubmit発火");
    e.preventDefault();

    // 何も入力せず検索した場合はalertを出す
    if (
      [
        searchInputCompany,
        searchInputDepartment,
        searchInputContact,
        searchInputPositionName,
        searchInputTel,
        searchInputDirectLine,
        searchInputCompanyCellPhone,
        searchInputEmail,
        searchInputAddress,
      ].every((value) => value === "")
    ) {
      return alert(
        "少なくとも一つの項目は条件を入力してください。条件を入力して検索することで効率的に目的の同席者を見つけ出すことができます。"
      );
    }

    let params = {
      "client_companies.name": adjustFieldValue(searchInputCompany),
      department_name: adjustFieldValue(searchInputDepartment),
      "contacts.name": adjustFieldValue(searchInputContact),
      position_name: adjustFieldValue(searchInputPositionName),
      main_phone_number: adjustFieldValue(searchInputTel),
      direct_line: adjustFieldValue(searchInputDirectLine),
      company_cell_phone: adjustFieldValue(searchInputCompanyCellPhone),
      "contacts.email": adjustFieldValue(searchInputEmail),
      address: adjustFieldValue(searchInputAddress),
    };
    console.log("✅ 条件 params", params);

    // 現在の入力値と同じかチェック
    if (
      params["client_companies.name"] === searchAttendeesParams["client_companies.name"] &&
      params.department_name === searchAttendeesParams.department_name &&
      params["contacts.name"] === searchAttendeesParams["contacts.name"] &&
      params.position_name === searchAttendeesParams.position_name &&
      params.main_phone_number === searchAttendeesParams.main_phone_number &&
      params.direct_line === searchAttendeesParams.direct_line &&
      params.company_cell_phone === searchAttendeesParams.company_cell_phone &&
      params["contacts.email"] === searchAttendeesParams["contacts.email"] &&
      params.address === searchAttendeesParams.address
    ) {
      return console.log("✅params同じためリターン");
    }

    setSearchAttendeesParams(params);
  };
  // ------------- ✅検索ボタンクリックかエンターでonSubmitイベント発火✅ -------------

  let fetchNewSearchServerPage: any;

  fetchNewSearchServerPage = async (
    limit: number,
    offset: number = 0
  ): Promise<{ rows: Contact_row_data[] | null; nextOffset: number; isLastPage: boolean; count: number | null }> => {
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
    if (Object.values(searchAttendeesParams).every((value) => value === null)) {
      let rows: null = null;
      const isLastPage = rows === null;
      let count: null = null;
      await new Promise((resolve) => setTimeout(resolve, 500));

      return { rows, nextOffset: offset + 1, isLastPage, count };
    }

    const from = offset * limit;
    const to = from + limit - 1;

    let params = searchAttendeesParams;

    // 会社名、部署名で並び替え
    const {
      data: rows,
      error,
      count,
    } = await supabase
      .rpc("search_companies_and_contacts", { params }, { count: "exact" })
      .eq("created_by_company_id", userProfileState.company_id)
      .range(from, to)
      .order("company_name", { ascending: true })
      .order("department_name", { ascending: true });
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
  console.log("キャッシュに割り当てるparamsキー searchAttendeesParams", searchAttendeesParams);

  if (searchAttendeesParams) {
    queryKeySearchParamsStringRef.current = Object.entries(searchAttendeesParams)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([key, value]) => `${key}:${value === null ? `null` : `${value}`}`)
      .join(", ");
    queryKeySearchParamsStringRef.current = [
      ["client_companies.name", searchAttendeesParams["client_companies.name"]],
      ["department_name", searchAttendeesParams["department_name"]],
      ["contacts.name", searchAttendeesParams["contacts.name"]],
      ["position_name", searchAttendeesParams["position_name"]],
      ["main_phone_number", searchAttendeesParams["main_phone_number"]],
      ["direct_line", searchAttendeesParams["direct_line"]],
      ["company_cell_phone", searchAttendeesParams["company_cell_phone"]],
      ["contacts.email", searchAttendeesParams["contacts.email"]],
      ["address", searchAttendeesParams["address"]],
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
    queryKey: ["attendees", queryKeySearchParamsStringRef.current],
    // queryKey: ["contacts"],
    queryFn: async (ctx) => {
      console.log("サーチフェッチ queryFn✅✅✅ searchAttendeesParams", searchAttendeesParams);
      return fetchNewSearchServerPage(20, ctx.pageParam); // 20個ずつ取得
    },
    getNextPageParam: (lastGroup, allGroups) => {
      // lastGroup.isLastPageがtrueならundefinedを返す
      return lastGroup.isLastPage ? undefined : allGroups.length;
    },
    staleTime: Infinity,
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
        rows: Contact_row_data[] | null;
        nextOffset: number;
        isLastPage: boolean;
        count: number | null;
      }
    )?.rows
      ? queryDataObj.pages.flatMap((d) => d?.rows)
      : [];
  const attendeeRows = Rows.map((obj, index) => {
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
    "attendeeRows",
    attendeeRows,
    "selectedSearchAttendeesArray",
    selectedSearchAttendeesArray,
    "searchAttendeesParams",
    searchAttendeesParams,
    "selectedAttendeesArray",
    selectedAttendeesArray
  );
  // -------------------------- ✅useInfiniteQuery無限スクロール✅ --------------------------

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
    marginTop?: number;
    itemsPosition?: string;
    whiteSpace?: "normal" | "pre" | "nowrap" | "pre-wrap" | "pre-line" | "break-spaces" | undefined;
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
    marginTop,
    itemsPosition = "center",
    whiteSpace,
  }: TooltipParams) => {
    // モーダルコンテナのleftを取得する
    if (!modalContainerRef.current) return;
    const containerLeft = modalContainerRef.current?.getBoundingClientRect().left;
    const containerTop = modalContainerRef.current?.getBoundingClientRect().top;
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
      content: content,
      content2: content2,
      content3: content3,
      display: display,
      marginTop: marginTop,
      itemsPosition: itemsPosition,
      whiteSpace: whiteSpace,
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
      {isOpenSearchAttendeesSideTable && (
        <div
          // className={`absolute left-0 top-0 z-[1100] h-full w-full bg-[#00800030]`}
          className={`absolute left-0 top-0 z-[1100] h-full w-full bg-[#00000000]`}
          onClick={() => setIsOpenSearchAttendeesSideTable(false)}
        ></div>
      )}
      {/* サイドテーブル */}
      <div
        ref={modalContainerRef}
        className={`${styles.side_table} z-[1200] pt-[30px] ${
          isOpenSearchAttendeesSideTable
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
                <span>同席者を検索</span>
                <span>{neonSearchIcon("30px")}</span>
              </div>
              <div className="min-h-[1px] w-full bg-[var(--color-bg-brand-f)]"></div>
              {/* <div className="brand-gradient-underline-light min-h-[1px] w-full"></div> */}
            </h3>
            <div
              // className={`flex-center h-[36px] w-[36px] cursor-pointer rounded-full hover:bg-[#666]`}
              className={`z-1 flex-center absolute right-[-10px] top-[50%]  h-[36px] w-[36px] translate-y-[-50%] cursor-pointer rounded-full hover:bg-[#666]`}
              onClick={() => setIsOpenSearchAttendeesSideTable(false)}
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
              <h3 className="flex min-h-[30px] max-w-max items-end space-y-[1px] text-[14px] font-bold ">
                <span>条件を入力して同席者を検索</span>
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
              {searchAttendeeFields.map((item, index) => (
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
                    onBlur={() => item.setInputValue(item.inputValue.trim())}
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
                <span>同席者を選択して追加</span>
                {/* <div className="min-h-[1px] w-auto bg-[#999]"></div> */}
                {selectedSearchAttendeesArray.length > 0 && (
                  <div
                    className={`${styles.icon_path_stroke} ${styles.icon_btn} flex-center transition-bg03`}
                    onMouseEnter={(e) => {
                      // if (isOpenDropdownMenuFilterProducts) return;
                      handleOpenTooltip({
                        e: e,
                        display: "top",
                        content: "選択中の同席者をリセット",
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
                      setSelectedSearchAttendeesArray([]);
                      if (hoveredItemPosSideTable) handleCloseTooltip();
                    }}
                  >
                    <GrPowerReset />
                  </div>
                )}
              </h3>
              <div className="flex">
                <RippleButton
                  title={`追加`}
                  minHeight="30px"
                  minWidth="78px"
                  fontSize="13px"
                  textColor={`${selectedSearchAttendeesArray?.length > 0 ? `#fff` : `#666`}`}
                  bgColor={`${selectedSearchAttendeesArray?.length > 0 ? `var(--color-bg-brand50)` : `#33333390`}`}
                  bgColorHover={`${selectedSearchAttendeesArray?.length > 0 ? `var(--color-bg-brand)` : `#33333390`}`}
                  border={`${
                    selectedSearchAttendeesArray?.length > 0 ? `var(--color-bg-brand)` : `var(--color-bg-brandc0)`
                  }`}
                  borderRadius="6px"
                  classText={`select-none ${
                    selectedSearchAttendeesArray?.length > 0 ? `` : `hover:cursor-not-allowed`
                  }`}
                  clickEventHandler={() => {
                    // setIsOpenSettingInvitationModal(true);
                  }}
                />
              </div>
            </div>
            {/* 担当者一覧エリア */}
            <ul className={`flex h-auto w-full flex-col space-y-[12px]`}>
              {/* Rowsが存在する場合 */}
              {attendeeRows &&
                attendeeRows.length > 0 &&
                attendeeRows.map((attendee: Contact_row_data, index) => (
                  <li
                    key={attendee.contact_id}
                    // onMouseEnter={(e) => {
                    //   handleOpenTooltip({
                    //     e: e,
                    //     display: "top",
                    //     content: `${attendee.company_name ? `${attendee.company_name} / ` : ``}${
                    //       attendee.contact_name ? `${attendee.contact_name} / ` : ``
                    //     }${attendee.department_name ? `${attendee.department_name} / ` : ``}${
                    //       attendee.position_name ? `${attendee.position_name}` : ``
                    //     }`,
                    //     content2: `${attendee.address ? `住所: ${attendee.address} / ` : ``}${
                    //       attendee.main_phone_number ? `代表TEL: ${attendee.main_phone_number} / ` : ``
                    //     }${attendee.direct_line ? `直通TEL: ${attendee.direct_line} / ` : ``}${
                    //       attendee.contact_email ? `担当者Email: ${attendee.contact_email}` : ``
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
                    className={`${
                      styles.attendees_list
                    } flex min-h-[44px] w-full cursor-pointer items-center truncate ${
                      selectedSearchAttendeesArray.some((obj) => obj.contact_id === attendee.contact_id)
                        ? styles.active
                        : ``
                    }`}
                    onClick={() => {
                      // 存在の確認のみなので、findではなくsome
                      if (selectedSearchAttendeesArray.some((obj) => obj.contact_id === attendee.contact_id)) {
                        // 既に配列に存在している場合は取り除く
                        const filteredAttendees = selectedSearchAttendeesArray.filter(
                          (obj) => obj.contact_id !== attendee.contact_id
                        );
                        setSelectedSearchAttendeesArray(filteredAttendees);
                        return;
                      } else {
                        // 存在しない場合は配列に入れる スプレッドで不変性を保つ
                        const newAttendees = [...selectedSearchAttendeesArray, attendee];
                        setSelectedSearchAttendeesArray(newAttendees);
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
                        {getInitial(attendee.contact_name ? attendee.contact_name : "N")}
                      </span>
                    </div>
                    <div
                      className={`${styles.attendees_list_item_lines_group} flex h-full flex-col space-y-[3px] pl-[5px] text-[12px]`}
                    >
                      {/* 会社・部署 */}
                      <div className={`${styles.attendees_list_item_line} flex text-[13px]`}>
                        {attendee.company_name && <span className="mr-[4px]">{attendee.company_name}</span>}
                        {/* <span>{attendee.department_name ?? ""}</span> */}
                      </div>
                      {/* <div className={`text-[var(--color-text-sub)]`}>{member.email ? member.email : ""}</div> */}
                      {/* 役職・名前 */}
                      <div className={`${styles.attendees_list_item_line} flex`}>
                        {attendee.contact_name && (
                          <>
                            <span className="mr-[12px]">{attendee.contact_name}</span>
                            {/* {attendee.department_name && <span className="mr-[10px]">/</span>} */}
                          </>
                        )}
                        {attendee.department_name && (
                          <>
                            <span className="mr-[12px]">{attendee.department_name}</span>
                            {/* {attendee.position_name && <span className="mr-[10px]">/</span>} */}
                          </>
                        )}
                        {attendee.position_name && <span className="mr-[10px]">{attendee.position_name}</span>}
                      </div>
                      {/* 住所・Email・1600以上で直通TEL */}
                      <div className={`${styles.attendees_list_item_line} flex`}>
                        {attendee.address && (
                          <>
                            <span className="mr-[10px] text-[#ccc]">{attendee.address}</span>
                            {((isDesktopGTE1600 && attendee.direct_line) || attendee.contact_email) && (
                              <span className="mr-[10px]">/</span>
                            )}
                          </>
                        )}
                        {isDesktopGTE1600 && attendee.direct_line && (
                          <>
                            <span className="mr-[10px] text-[#ccc]">{attendee.direct_line}</span>
                            {attendee.contact_email && <span className="mr-[10px]">/</span>}
                          </>
                        )}
                        {attendee.contact_email && <div className={`text-[#ccc]`}>{attendee.contact_email}</div>}
                      </div>
                    </div>
                  </li>
                ))}
              {/* 条件検索結果が1件も無い場合 */}
              {/* 初回マウント時ではなく検索結果で行が0の場合 countがnullではなく0の場合 data.pages[0].row  */}
              {queryCount === 0 && (
                <div className={`flex-center h-full min-h-[100px] w-full bg-[#ffffff00] text-[13px] text-[#fff]`}>
                  <span>該当する担当者は見つかりませんでした。</span>
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
              {Array(12)
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
                ))}
            </ul>
          </div>
        </div>
        {/* 担当者一覧エリア ここまで */}
      </div>
    </>
  );
};

export const SideTableSearchAttendees = memo(SideTableSearchAttendeesMemo);
