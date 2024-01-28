import { RippleButton } from "@/components/Parts/RippleButton/RippleButton";
import { neonSearchIcon } from "@/components/assets";
import { Dispatch, FormEvent, SetStateAction, memo, useCallback, useEffect, useRef, useState } from "react";
import { BsChevronRight } from "react-icons/bs";
import { MdOutlineDataSaverOff } from "react-icons/md";
import styles from "../UpdateMeetingModal.module.css";
import { AttendeeInfo, Contact_row_data, Destination } from "@/types";
import { useMedia } from "react-use";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import useDashboardStore from "@/store/useDashboardStore";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getInitial } from "@/utils/Helpers/getInitial";
import { SpinnerComet } from "@/components/Parts/SpinnerComet/SpinnerComet";
import { GrPowerReset } from "react-icons/gr";
import useStore from "@/store";
import { TooltipSideTable } from "@/components/Parts/Tooltip/TooltipSideTable";
import { ImInfo } from "react-icons/im";
import { toast } from "react-toastify";

type Props = {
  isOpenSearchSideTable: boolean;
  setIsOpenSearchSideTable: Dispatch<SetStateAction<boolean>>;
  isOpenSearchSideTableBefore: boolean;
  setIsOpenSearchSideTableBefore: Dispatch<SetStateAction<boolean>>;
  selectedContactObj: Destination;
  setSelectedContactObj: Dispatch<SetStateAction<Destination>>;
  searchTitle: string;
};

type SearchParams = {
  "client_companies.name": string | null;
  "client_companies.department_name": string | null;
  "contacts.name": string | null;
  position_name: string | null;
  main_phone_number: string | null;
  direct_line: string | null;
  company_cell_phone: string | null;
  "contacts.email": string | null;
  address: string | null;
};

export const SideTableSearchContactMemo = ({
  isOpenSearchSideTable,
  setIsOpenSearchSideTable,
  isOpenSearchSideTableBefore,
  setIsOpenSearchSideTableBefore,
  selectedContactObj,
  setSelectedContactObj,
  searchTitle,
}: Props) => {
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  // 説明アイコンホバーで非アクティブ化
  const [hasBeenHoveredIcon, setHasBeenHoveredIcon] = useState(false);
  // メディアクエリState
  // デスクトップモニター
  const isDesktopGTE1600Media = useMedia("(min-width: 1600px)", false);
  const [isDesktopGTE1600, setIsDesktopGTE1600] = useState(isDesktopGTE1600Media);
  useEffect(() => {
    setIsDesktopGTE1600(isDesktopGTE1600Media);
  }, [isDesktopGTE1600Media]);

  // 担当者検索時のparams
  const [searchParams, setSearchParams] = useState<SearchParams>({
    "client_companies.name": null,
    "client_companies.department_name": null,
    "contacts.name": null,
    position_name: null,
    main_phone_number: null,
    direct_line: null,
    company_cell_phone: null,
    "contacts.email": null,
    address: null,
  });

  // 担当者検索フィールド用input
  const [searchInputCompany, setSearchInputCompany] = useState(""); //会社名
  const [searchInputDepartment, setSearchInputDepartment] = useState(""); //部署名
  const [searchInputContact, setSearchInputContact] = useState(""); //担当者名
  const [searchInputPositionName, setSearchInputPositionName] = useState(""); //役職名
  const [searchInputTel, setSearchInputTel] = useState(""); //代表TEL
  const [searchInputDirectLine, setSearchInputDirectLine] = useState(""); //直通TEL
  const [searchInputCompanyCellPhone, setSearchInputCompanyCellPhone] = useState(""); //社用携帯
  const [searchInputEmail, setSearchInputEmail] = useState(""); //Email
  const [searchInputAddress, setSearchInputAddress] = useState(""); //住所
  // モーダルの担当者カードに追加前のテーブル内で選択中の担当者オブジェクトを保持するstate
  const initialDestinationObj = {
    // 送付先会社
    destination_company_id: null,
    destination_company_name: null,
    destination_company_department_name: null,
    destination_company_zipcode: null,
    destination_company_address: null,
    // 送付先担当者
    destination_contact_id: null,
    destination_contact_name: null,
    destination_contact_direct_line: null,
    destination_contact_direct_fax: null,
    destination_contact_email: null,
  };
  const [prevDestination, setPrevDestination] = useState<Destination>(selectedContactObj);
  const [selectedSearchDestination, setSelectedSearchDestination] = useState<Destination | null>(null);

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
        "少なくとも一つの項目は条件を入力してください。条件を入力して検索することで効率的に目的の担当者を見つけ出すことができます。"
      );
    }

    let params = {
      "client_companies.name": adjustFieldValue(searchInputCompany),
      "client_companies.department_name": adjustFieldValue(searchInputDepartment),
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
    // if (
    //   params["client_companies.name"] === searchParams["client_companies.name"] &&
    //   params.department_name === searchParams.department_name &&
    //   params["contacts.name"] === searchParams["contacts.name"] &&
    //   params.position_name === searchParams.position_name &&
    //   params.main_phone_number === searchParams.main_phone_number &&
    //   params.direct_line === searchParams.direct_line &&
    //   params.company_cell_phone === searchParams.company_cell_phone &&
    //   params["contacts.email"] === searchParams["contacts.email"] &&
    //   params.address === searchParams.address
    // ) {
    //   return console.log("✅params同じためリターン");
    // }

    setSearchParams(params);
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
    if (Object.values(searchParams).every((value) => value === null)) {
      let rows: null = null;
      const isLastPage = rows === null;
      let count: null = null;
      await new Promise((resolve) => setTimeout(resolve, 500));

      return { rows, nextOffset: offset + 1, isLastPage, count };
    }

    const from = offset * limit;
    const to = from + limit - 1;

    let params = searchParams;

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
      .order("company_department_name", { ascending: true });
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
  console.log("キャッシュに割り当てるparamsキー searchParams", searchParams);
  if (searchParams) {
    // queryKeySearchParamsStringRef.current = Object.entries(searchParams)
    //   .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    //   .map(([key, value]) => `${key}:${value === null ? `null` : `${value}`}`)
    //   .join(", ");
    queryKeySearchParamsStringRef.current = [
      ["client_companies.name", searchParams["client_companies.name"]],
      ["client_companies.department_name", searchParams["client_companies.department_name"]],
      ["contacts.name", searchParams["contacts.name"]],
      ["position_name", searchParams["position_name"]],
      ["main_phone_number", searchParams["main_phone_number"]],
      ["direct_line", searchParams["direct_line"]],
      ["company_cell_phone", searchParams["company_cell_phone"]],
      ["contacts.email", searchParams["contacts.email"]],
      ["address", searchParams["address"]],
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
      console.log("サーチフェッチ担当者 queryFn✅✅✅ searchParams", searchParams);
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
  const contactRows = Rows.map((obj, index) => {
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
    "contactRows",
    contactRows,
    "selectedSearchDestination",
    selectedSearchDestination,
    "searchParams",
    searchParams,
    "selectedContactObj",
    selectedContactObj
  );
  // -------------------------- ✅useInfiniteQuery無限スクロール✅ --------------------------

  // -------------------------- 🌟変更ボタンをクリック 担当者リストに追加🌟 --------------------------
  const handleChangeContact = () => {
    if (!selectedSearchDestination) return;

    const result = selectedSearchDestination.destination_contact_id === prevDestination.destination_contact_id;

    // 現在の同じ担当者と同じ場合はリターン
    if (result) {
      alert(`同じ担当者です。`);
      return;
    }
    // 現在の担当者と違う場合は変更する
    else {
      setSelectedContactObj(selectedSearchDestination);

      // 変更が完了したら選択中のstateを元々のstateにリセットする
      setSelectedSearchDestination(null);

      // サイドテーブルを閉じる
      setIsOpenSearchSideTable(false);
      if (isOpenSearchSideTableBefore && setIsOpenSearchSideTableBefore) {
        setTimeout(() => {
          setIsOpenSearchSideTableBefore(false);
        }, 300);
      }
    }
  };
  // -------------------------- ✅変更ボタンをクリック 担当者リストに追加✅ --------------------------

  // -------------------------- 🌟スクロールでヘッダー色変更🌟 --------------------------
  // サイドテーブルの担当者一覧エリアのスクロールアイテムRef
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

  // スクロールイベント監視
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

  // -------------------------- 🌟サイドテーブルを閉じる🌟 --------------------------
  const handleClose = () => {
    // 選択中のリスト配列をリセットする
    setSelectedSearchDestination(null);

    // サイドテーブルを閉じる
    setIsOpenSearchSideTable(false);
    if (isOpenSearchSideTableBefore && setIsOpenSearchSideTableBefore) {
      setTimeout(() => {
        setIsOpenSearchSideTableBefore(false);
      }, 300);
    }
  };
  // -------------------------- ✅サイドテーブルを閉じる✅ --------------------------

  console.log(
    '["destination"].includes(searchTitle)',
    ["destination"].includes(searchTitle),
    "searchTitle",
    searchTitle
  );

  return (
    <>
      {/* オーバーレイ */}
      {isOpenSearchSideTable && (
        <div className={`absolute left-0 top-0 z-[1100] h-full w-full bg-[#00000000]`} onClick={handleClose}></div>
      )}
      {/* サイドテーブル */}
      <div
        ref={modalContainerRef}
        className={`${styles.side_table} z-[1200] pt-[30px] ${
          isOpenSearchSideTable ? `${styles.active} transition-transform02 !delay-[0.1s]` : `transition-transform01`
        }`}
      >
        {/* ツールチップ */}
        {hoveredItemPosSideTable && <TooltipSideTable />}
        {/* タイトルエリア */}
        <div className="flex h-auto w-full flex-col px-[30px] 2xl:px-[30px]">
          <div className={`relative flex h-full w-full items-center justify-between`}>
            <h3 className="space-y-[1px] text-[22px] font-bold">
              <div className={`flex items-start space-x-[9px]`}>
                {["destination"].includes(searchTitle) && <span>送付先変更</span>}
                {/* {[""].includes(searchTitle) && <span>担当者を検索</span>} */}
                <span>{neonSearchIcon("30")}</span>
              </div>
              <div className="min-h-[1px] w-full bg-[var(--color-bg-brand-f)]"></div>
            </h3>
            <div
              className={`z-1 flex-center absolute right-[-10px] top-[50%]  h-[36px] w-[36px] translate-y-[-50%] cursor-pointer rounded-full hover:bg-[#666]`}
              onClick={handleClose}
            >
              <BsChevronRight className="text-[24px]" />
            </div>
          </div>
        </div>
        {/* 条件入力エリア */}
        <form
          className="mt-[20px] h-full max-h-[33vh] w-full overflow-y-scroll bg-[#ffffff00] pb-[90px]"
          onSubmit={handleSubmit}
          // onSubmit={(e) => console.log(e)}
        >
          <div className="flex h-auto w-full flex-col">
            <div className={`flex min-h-[30px] items-end justify-between px-[30px]`}>
              <h3 className="flex min-h-[30px] max-w-max items-end space-x-[10px] space-y-[1px] text-[14px] font-bold ">
                <div
                  className="flex items-end space-x-[10px]"
                  onMouseEnter={(e) => {
                    handleOpenTooltip({
                      e: e,
                      display: "",
                      content: `○担当者が所属する会社名や部署名など条件を入力して検索してください。\n例えば、会社名で「株式会社データベース」で会社住所が「"東京都大田区"」の「"佐藤"」という担当者を検索する場合は、「会社名」に「株式会社データベース」または「＊データベース＊」を入力し、「住所」に「東京都大田区※」と入力、担当者名に「＊佐藤＊」を入力してください。\n○「※ アスタリスク」は、「前方一致・後方一致・部分一致」を表します。\n例えば、会社名に「"工業"」と付く会社を検索したい場合に、「※工業※」、「"製作所"」と付く会社は「※製作所※」と検索することで、指定した文字が付くデータを検索可能です\n○「○項目を空欄のまま検索した場合は、その項目の「全てのデータ」を抽出します。\n○最低一つの項目は入力して検索してください。`,
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
                  {["destination"].includes(searchTitle) && <span>条件を入力して担当者を検索</span>}
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
                {[
                  searchInputCompany,
                  searchInputDepartment,
                  searchInputContact,
                  searchInputPositionName,
                  searchInputTel,
                  searchInputDirectLine,
                  searchInputCompanyCellPhone,
                  searchInputEmail,
                  searchInputAddress,
                ].some((value) => value !== "") && (
                  <div
                    className={`${styles.icon_path_stroke} ${styles.search_icon_btn} flex-center transition-bg03`}
                    onMouseEnter={(e) => {
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
                      if (searchInputCompany) setSearchInputCompany("");
                      if (searchInputDepartment) setSearchInputDepartment("");
                      if (searchInputContact) setSearchInputContact("");
                      if (searchInputPositionName) setSearchInputPositionName("");
                      if (searchInputTel) setSearchInputTel("");
                      if (searchInputDirectLine) setSearchInputDirectLine("");
                      if (searchInputCompanyCellPhone) setSearchInputCompanyCellPhone("");
                      if (searchInputEmail) setSearchInputEmail("");
                      if (searchInputAddress) setSearchInputAddress("");

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
        <div
          ref={sideTableScrollContainerRef}
          className="flex h-full max-h-[calc(100vh-(30px+36px+20px+33vh+1px+0px))] w-full flex-col overflow-y-scroll bg-[#ffffff00] pb-[90px]"
        >
          <div ref={sideTableScrollItemRef} className="flex h-auto w-full flex-col">
            <div
              ref={sideTableScrollHeaderRef}
              className={`sticky top-0 flex min-h-[30px] items-end justify-between px-[30px] pb-[18px] pt-[18px] ${styles.side_table_attendees_header}`}
            >
              <h3 className="flex min-h-[30px] max-w-max items-center space-x-[10px] space-y-[1px] text-[14px] font-bold">
                {["destination"].includes(searchTitle) && <span>担当者を選択して変更</span>}
                {selectedSearchDestination && (
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
                          content: "選択中の担当者をリセット",
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
                        setSelectedSearchDestination(null);
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
                  textColor={`${selectedSearchDestination ? `#fff` : `#666`}`}
                  bgColor={`${selectedSearchDestination ? `var(--color-bg-brand50)` : `#33333390`}`}
                  bgColorHover={`${selectedSearchDestination ? `var(--color-bg-brand)` : `#33333390`}`}
                  border={`${selectedSearchDestination ? `var(--color-bg-brand)` : `var(--color-bg-brandc0)`}`}
                  borderRadius="6px"
                  classText={`select-none ${selectedSearchDestination ? `` : `hover:cursor-not-allowed`}`}
                  clickEventHandler={() => {
                    // setIsOpenSettingInvitationModal(true);
                    handleChangeContact();
                    handleCloseTooltip();
                  }}
                  onMouseEnterHandler={(e: React.MouseEvent<HTMLElement, MouseEvent>) => {
                    // if (isOpenDropdownMenuFilterProducts) return;
                    handleOpenTooltip({
                      e: e,
                      display: "top",
                      content: "選択した担当者に変更する",
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
              {contactRows &&
                contactRows.length > 0 &&
                contactRows.map((contact: Contact_row_data, index) => {
                  if (contact.contact_id === selectedContactObj.destination_contact_id) return;
                  return (
                    <li
                      key={contact.contact_id}
                      className={`${
                        styles.attendees_list
                      } flex min-h-[44px] w-full cursor-pointer items-center truncate ${
                        selectedSearchDestination?.destination_contact_id === contact.contact_id ? styles.active : ``
                      }`}
                      onClick={() => {
                        if (
                          selectedSearchDestination &&
                          selectedSearchDestination.destination_contact_id === contact.contact_id
                        ) {
                          setSelectedSearchDestination(null);
                          return;
                        } else {
                          const newDestination: Destination = {
                            // 🔹送付先会社
                            destination_company_id: contact.company_id,
                            destination_company_name: contact.company_name,
                            destination_company_department_name: contact.company_department_name,
                            destination_company_zipcode: contact.zipcode,
                            destination_company_address: contact.address,
                            // 🔹送付先担当者
                            destination_contact_id: contact.contact_id,
                            destination_contact_name: contact.contact_name,
                            destination_contact_direct_line: contact.direct_line,
                            destination_contact_direct_fax: contact.direct_fax,
                            destination_contact_email: contact.contact_email,
                          };
                          setSelectedSearchDestination(newDestination);
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
                          {getInitial(contact.contact_name ? contact.contact_name : "N")}
                        </span>
                      </div>
                      <div
                        className={`${styles.attendees_list_item_lines_group} flex h-full flex-col space-y-[3px] pl-[5px] text-[12px]`}
                      >
                        {/* 会社・部署 */}
                        <div className={`${styles.attendees_list_item_line} flex text-[13px]`}>
                          {contact.company_name && <span className="mr-[4px]">{contact.company_name}</span>}
                          {/* <span>{contact.department_name ?? ""}</span> */}
                        </div>
                        {/* <div className={`text-[var(--color-text-sub)]`}>{member.email ? member.email : ""}</div> */}
                        {/* 役職・名前 */}
                        <div className={`${styles.attendees_list_item_line} flex`}>
                          {contact.contact_name && (
                            <>
                              <span className="mr-[12px]">{contact.contact_name}</span>
                              {/* {contact.department_name && <span className="mr-[10px]">/</span>} */}
                            </>
                          )}
                          {contact.company_department_name && (
                            <>
                              <span className="mr-[12px]">{contact.company_department_name}</span>
                              {/* {contact.position_name && <span className="mr-[10px]">/</span>} */}
                            </>
                          )}
                          {contact.position_name && <span className="mr-[10px]">{contact.position_name}</span>}
                        </div>
                        {/* 住所・Email・1600以上で直通TEL */}
                        <div className={`${styles.attendees_list_item_line} flex`}>
                          {contact.address && (
                            <>
                              <span className="mr-[10px] text-[#ccc]">{contact.address}</span>
                              {((isDesktopGTE1600 && contact.direct_line) || contact.contact_email) && (
                                <span className="mr-[10px]">/</span>
                              )}
                            </>
                          )}
                          {isDesktopGTE1600 && contact.direct_line && (
                            <>
                              <span className="mr-[10px] text-[#ccc]">{contact.direct_line}</span>
                              {contact.contact_email && <span className="mr-[10px]">/</span>}
                            </>
                          )}
                          {contact.contact_email && <div className={`text-[#ccc]`}>{contact.contact_email}</div>}
                        </div>
                      </div>
                    </li>
                  );
                })}
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
            </ul>
          </div>
        </div>
        {/* 担当者一覧エリア ここまで */}
      </div>
    </>
  );
};

export const SideTableSearchContact = memo(SideTableSearchContactMemo);
