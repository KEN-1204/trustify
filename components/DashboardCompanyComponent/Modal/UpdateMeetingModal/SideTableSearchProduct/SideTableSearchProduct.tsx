import { RippleButton } from "@/components/Parts/RippleButton/RippleButton";
import { neonSearchIcon } from "@/components/assets";
import { Dispatch, FormEvent, SetStateAction, memo, useCallback, useEffect, useRef, useState } from "react";
import { BsChevronRight } from "react-icons/bs";
import { MdOutlineDataSaverOff } from "react-icons/md";
import styles from "../UpdateMeetingModal.module.css";
import { Department, Product, Office, QuotationProductsDetail, Unit } from "@/types";
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
import { formatToJapaneseYen } from "@/utils/Helpers/formatToJapaneseYen";

type Props = {
  isOpenSearchProductSideTable: boolean;
  setIsOpenSearchProductSideTable: Dispatch<SetStateAction<boolean>>;
  isOpenSearchProductSideTableBefore?: boolean;
  setIsOpenSearchProductSideTableBefore?: Dispatch<SetStateAction<boolean>>;
  selectedProductsArray: QuotationProductsDetail[];
  setSelectedProductsArray: Dispatch<SetStateAction<QuotationProductsDetail[]>>;
};

type SearchProductParams = {
  _company_id: string | null;
  _product_name: string | null;
  _outside_short_name: string | null;
  _inside_short_name: string | null;
  _department_id: string | null;
  _unit_id: string | null;
  _office_id: string | null;
};

const SideTableSearchProductMemo = ({
  isOpenSearchProductSideTable,
  setIsOpenSearchProductSideTable,
  isOpenSearchProductSideTableBefore,
  setIsOpenSearchProductSideTableBefore,
  selectedProductsArray,
  setSelectedProductsArray,
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

  const queryClient = useQueryClient();

  // 初回マウント時フェッチを防ぐ 検索をクリックした時に初めてqueryFnを実行
  const [isEnableFetch, setIsEnableFetch] = useState(false);

  // 同席者検索時のparams
  const initialSearchProductParams = {
    _company_id: userProfileState?.company_id ?? null,
    _product_name: null,
    _outside_short_name: null,
    _inside_short_name: null,
    _department_id: null,
    _unit_id: null,
    _office_id: null,
  };
  const [searchProductParams, setSearchProductParams] = useState<SearchProductParams>(initialSearchProductParams);

  // 同席者検索フィールド用input
  const [searchInputProductName, setSearchInputProductName] = useState(""); //メンバーの名前
  const [searchInputOutsideName, setSearchInputOutsideName] = useState(""); //メンバーの名前
  const [searchInputInsideName, setSearchInputInsideName] = useState(""); //メンバーの名前
  const [searchSelectedDepartmentId, setSearchSelectedDepartmentId] = useState<Department["id"] | null>(
    selectedProductsArray[0]?.product_created_by_department_of_user ?? null
  ); //事業部id
  const [searchSelectedUnitId, setSearchSelectedUnitId] = useState<Unit["id"] | null>(null); //係id
  const [searchSelectedOfficeId, setSearchSelectedOfficeId] = useState<Office["id"] | null>(null); //事業所id

  // const [selectedSearchProductsArray, setSelectedSearchProductsArray] = useState<QuotationProductsDetail[]>([]);
  const [selectedSearchProductsArray, setSelectedSearchProductsArray] = useState<Product[]>([]);

  const searchProductInputFields = [
    {
      key: "product_name",
      title: "商品名",
      inputValue: searchInputProductName,
      setInputValue: setSearchInputProductName,
    },
    {
      key: "outside_short_name",
      title: "型式(顧客向け)",
      inputValue: searchInputOutsideName,
      setInputValue: setSearchInputOutsideName,
    },
    {
      key: "inside_short_name",
      title: "型式・略称(社内向け)",
      inputValue: searchInputInsideName,
      setInputValue: setSearchInputInsideName,
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

  // ============================ 🌟事業部、係、事業所リスト取得useQuery🌟 ============================
  const departmentDataArray: Department[] | undefined = queryClient.getQueryData(["departments"]);
  const unitDataArray: Unit[] | undefined = queryClient.getQueryData(["units"]);
  const officeDataArray: Office[] | undefined = queryClient.getQueryData(["offices"]);
  // ============================ ✅事業部、係、事業所リスト取得useQuery✅ ============================
  // ======================= 🌟現在の選択した事業部で係・チームを絞り込むuseEffect🌟 =======================
  const [filteredUnitBySelectedDepartment, setFilteredUnitBySelectedDepartment] = useState<Unit[]>([]);
  useEffect(() => {
    // unitが存在せず、stateに要素が1つ以上存在しているなら空にする
    if (!unitDataArray || unitDataArray?.length === 0 || !searchSelectedDepartmentId)
      return setFilteredUnitBySelectedDepartment([]);

    // 選択中の事業部が変化するか、unitDataArrayの内容に変更があったら新たに絞り込んで更新する
    if (unitDataArray && unitDataArray.length >= 1 && searchSelectedDepartmentId) {
      const filteredUnitArray = unitDataArray.filter(
        (unit) => unit.created_by_department_id === searchSelectedDepartmentId
      );
      setFilteredUnitBySelectedDepartment(filteredUnitArray);
    }
  }, [unitDataArray, searchSelectedDepartmentId]);
  // ======================= ✅現在の選択した事業部でチームを絞り込むuseEffect✅ =======================

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

    // 何も入力せず検索した場合はalertを出す
    // if (
    //   [
    //     searchInputProductName,
    //     searchInputInsideName,
    //     searchInputOutsideName,
    //     searchSelectedDepartmentId,
    //     searchSelectedUnitId,
    //     searchSelectedOfficeId,
    //   ].every((value) => value === "")
    // ) {
    //   return alert(
    //     "少なくとも一つの項目は条件を入力してください。条件を入力して検索することで効率的に目的の同席者を見つけ出すことができます。"
    //   );
    // }

    let params: SearchProductParams = {
      _company_id: userProfileState.company_id,
      _product_name: adjustFieldValue(searchInputProductName),
      _outside_short_name: adjustFieldValue(searchInputOutsideName),
      _inside_short_name: adjustFieldValue(searchInputInsideName),
      _department_id: searchSelectedDepartmentId || null,
      _unit_id: searchSelectedUnitId || null,
      _office_id: searchSelectedOfficeId || null,
    };
    console.log("✅ 条件 params", params);

    // 現在の入力値と同じかチェック
    // if (
    //   params._user_name === searchProductParams._user_name &&
    //   params._employee_id_name === searchProductParams._employee_id_name &&
    //   params._department_id === searchProductParams._department_id &&
    //   params._unit_id === searchProductParams._unit_id &&
    //   params._office_id === searchProductParams._office_id
    // ) {
    //   return console.log("✅params同じためリターン");
    // }

    // paramsの結合した文字列をqueryKeyに渡しているため、検索条件の入力値が変わると（paramsが変わると）useInfiniteQueryのqueryFnが再度実行される
    console.log("🔥フェッチ");
    setSearchProductParams(params);

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
  ): Promise<{ rows: Product[] | null; nextOffset: number; isLastPage: boolean; count: number | null }> => {
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

    // 条件の値が全てnullなら、つまり何も入力せず検索されるか初回マウント時はnullを返す。
    // if (Object.values(searchProductParams).every((value) => value === null)) {
    // 社員名と社員番号どちらかは必ず入力 nullか空文字ならrowをnullで返す
    // if (!searchProductParams._user_name && !searchProductParams._employee_id_name) {
    //   let rows: null = null;
    //   const isLastPage = rows === null;
    //   let count: null = null;
    //   await new Promise((resolve) => setTimeout(resolve, 500));
    //   console.log("❌社員名と社員番号どちらかは必ず入力 nullか空文字ならrowをnullで返す");
    //   return { rows, nextOffset: offset + 1, isLastPage, count };
    // }

    const from = offset * limit;
    const to = from + limit - 1;

    let params = searchProductParams;

    // 商品名、型式は入力値をワイルドカードとILIKEで、事業部、係、事業所はidに一致で条件検索
    console.log("🔥rpc()実行", params);

    const {
      data: rows,
      error,
      count,
    } = await supabase
      .rpc("get_products_searched_name", params, { count: "exact" })
      .range(from, to)
      .order("created_by_department_of_user", { ascending: true })
      .order("product_name", { ascending: true });
    // .order("contact_created_at", { ascending: false }); // 担当者作成日 更新にすると更新の度に行が入れ替わるため

    if (error) {
      console.error("❌rpcエラー", error);
      throw error;
    }

    console.log("✅rpc()成功 data", rows);
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
  console.log("キャッシュに割り当てるparamsキー searchProductParams", searchProductParams);
  if (searchProductParams) {
    // queryKeySearchParamsStringRef.current = Object.entries(searchProductParams)
    //   .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    //   .map(([key, value]) => `${key}:${value === null ? `null` : `${value}`}`)
    //   .join(", ");
    queryKeySearchParamsStringRef.current = [
      ["_product_name", searchProductParams._product_name],
      ["_outside_short_name", searchProductParams._outside_short_name],
      ["_inside_short_name", searchProductParams._inside_short_name],
      ["_department_id", searchProductParams._department_id],
      ["_unit_id", searchProductParams._unit_id],
      ["_office_id", searchProductParams._office_id],
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
    queryKey: ["quotation_products", queryKeySearchParamsStringRef.current],
    // queryKey: ["contacts"],
    queryFn: async (ctx) => {
      console.log("サーチフェッチメンバー queryFn✅✅✅ searchProductParams", searchProductParams);
      return fetchNewSearchServerPage(20, ctx.pageParam); // 20個ずつ取得
    },
    getNextPageParam: (lastGroup, allGroups) => {
      // lastGroup.isLastPageがtrueならundefinedを返す
      return lastGroup.isLastPage ? undefined : allGroups.length;
    },
    staleTime: Infinity,
    enabled: isOpenSearchProductSideTable && isEnableFetch && !!userProfileState?.company_id,
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
        rows: Product[] | null;
        nextOffset: number;
        isLastPage: boolean;
        count: number | null;
      }
    )?.rows
      ? queryDataObj.pages.flatMap((d) => d?.rows)
      : [];
  const ProductRows = Rows.map((obj, index) => {
    return { index, ...obj };
  });
  const queryCount = queryDataObj?.pages[0].count; // 0: {rows: Array(9), nextOffset: 1, isLastPage: true, count: 9}
  const isLastPage = queryDataObj?.pages[queryDataObj.pages.length - 1].isLastPage;

  // ------------------------------- 🌟初回ブロックstateをtrueに🌟 -------------------------------
  // 初回マウント時に既に初期状態(入力なしで検索した全てのデータ)でRowsが存在するなら初回ブロックstateをtrueにする
  useEffect(() => {
    if (ProductRows && ProductRows.length > 0) {
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
    "ProductRows",
    ProductRows,
    "searchProductParams",
    searchProductParams,
    "selectedProductsArray",
    selectedProductsArray,
    "selectedSearchProductsArray",
    selectedSearchProductsArray,
    "status",
    status,
    "isLoadingQuery",
    isLoadingQuery
  );
  // -------------------------- ✅useInfiniteQuery無限スクロール✅ --------------------------

  // -------------------------- 🌟追加ボタンをクリック🌟 --------------------------
  const handleAddSelectedProductsList = () => {
    if (!selectedSearchProductsArray || selectedSearchProductsArray.length === 0) return;
    // 既に商品リストに選択中のリストが含まれているかチェックして含まれている場合はリターンする
    // 配列同士の配列内のオブジェクトで一致するオブジェクトがあるかをチェックするために
    // new Setオブジェクトとhasメソッドのハッシュテーブルでのチェック
    // 1. 選択中商品リストから商品idのみを取り出した配列をnew SetでSetオブジェクトを生成
    const selectedSearchProductsSetObj = new Set(selectedSearchProductsArray.map((product) => product.id));
    // 2. 商品リストをsomeで一つずつ商品オブジェクトを取り出し、obj.idがハッシュテーブルに含まれているかチェック
    const foundProduct = selectedProductsArray.find((product) =>
      // selectedSearchProductsSetObj.has(product.contact_id)
      selectedSearchProductsSetObj.has(product.quotation_product_id)
    );
    if (foundProduct) {
      alert(
        `${
          foundProduct.product_name
            ? `「${foundProduct.product_name}${
                foundProduct.outside_short_name ? ` / ${foundProduct.outside_short_name}` : ``
              }」は既に商品リストに含まれています。既に商品リストに含まれている商品は追加できません。`
            : `既に商品リストに含まれています。既に商品リストに含まれている商品は追加できません。`
        }`
      );
      return;
    } else {
      // 商品リストに一つも含まれていない場合はリストに追加
      const newQuotationProducts = selectedSearchProductsArray.map((product, index) => {
        const newProduct: QuotationProductsDetail = {
          quotation_product_id: product.id,
          product_name: product.product_name,
          outside_short_name: product.outside_short_name,
          inside_short_name: product.inside_short_name,
          unit_price: product.unit_price,
          product_created_by_user_id: product.created_by_user_id,
          product_created_by_company_id: product.created_by_company_id,
          product_created_by_department_of_user: product.created_by_department_of_user,
          product_created_by_unit_of_user: product.created_by_unit_of_user,
          product_created_by_office_of_user: product.created_by_office_of_user,
          quotation_product_name: product.product_name,
          quotation_product_outside_short_name: product.outside_short_name,
          quotation_product_inside_short_name: product.inside_short_name,
          quotation_product_unit_price: product.unit_price,
          quotation_product_quantity: 1,
          quotation_product_priority: selectedProductsArray.length + index + 1,
        };
        return newProduct;
      });
      // const newProductsList = [...selectedProductsArray, ...selectedSearchProductsArray];
      const newProductsList = [...selectedProductsArray, ...newQuotationProducts];
      // 商品リストの追加は30個までに一旦区切る
      // if (newProductsList.length >= 30 && userProfileState?.subscription_plan !== "premium_plan") {
      //   return toast.error(
      //     `30人以上の商品リストへの追加は現在のプランでは制限されています。制限の解除が必要な場合はサポートからご要望をお願い致します。`
      //   );
      // }
      setSelectedProductsArray(newProductsList);

      // 追加が完了したら選択中のリスト配列をリセットする
      setSelectedSearchProductsArray([]);

      // 変更確定確認モーダルを開く
      // setIsChangeConfirmationModal(true)

      // 再度開いた時のフェッチを防ぐ
      // setIsEnableFetch(false);

      // サイドテーブルを閉じる
      setIsOpenSearchProductSideTable(false);
      if (isOpenSearchProductSideTableBefore && setIsOpenSearchProductSideTableBefore) {
        setTimeout(() => {
          setIsOpenSearchProductSideTableBefore(false);
        }, 300);
      }

      // 変更が完了したら選択中のメンバーをリセット
      //   setSelectedProductsArray(null);

      // paramsをリセット
      //   setSearchProductParams(initialSearchProductParams);

      // 各検索条件もリセット
      //   if (searchInputProductName) setSearchInputProductName("");
      //   if (searchSelectedDepartmentId) setSearchSelectedDepartmentId(null);
      //   if (searchSelectedUnitId) setSearchSelectedUnitId(null);
      //   if (searchSelectedOfficeId) setSearchSelectedOfficeId(null);
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
    // 選択中のリスト配列をリセットする
    setSelectedSearchProductsArray([]);
    // サイドテーブルを閉じる
    setIsOpenSearchProductSideTable(false);
    // テーブルを閉じる
    setIsOpenSearchProductSideTable(false);
    if (isOpenSearchProductSideTableBefore && setIsOpenSearchProductSideTableBefore) {
      setTimeout(() => {
        setIsOpenSearchProductSideTableBefore(false);
      }, 300);
    }
  };
  // -------------------------- ✅サイドテーブルを閉じる✅ --------------------------

  return (
    <>
      {/* オーバーレイ */}
      {isOpenSearchProductSideTable && (
        <div className={`absolute left-0 top-0 z-[1100] h-full w-full bg-[#00000039]`} onClick={handleClose}></div>
      )}
      {/* サイドテーブル */}
      <div
        ref={modalContainerRef}
        className={`${styles.side_table} ${styles.change_member} z-[1200] pt-[30px] ${
          isOpenSearchProductSideTable
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
                <span>商品検索</span>
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
                      content: `○商品の名前、型式(顧客向け)、型式・略称(社内向け)、事業部、係・チーム、事業所を条件に入力して検索してください。\n例えば、商品名が「マイクロスコープ」で、その商品が「マイクロスコープ事業部」という事業部の商品なら、「商品名」に「マイクロスコープ」または「マイクロ＊」を入力し、「事業部」は「マイクロスコープ事業部」を選択して検索します。\n○「※ アスタリスク」は、「前方一致・後方一致・部分一致」を表します。\n○「項目を空欄のまま検索した場合は、その項目の「全てのデータ」を抽出します。\n○最低一つの項目は入力して検索してください。`,
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
                  <span>条件を入力して商品を検索</span>
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
                  searchInputProductName,
                  searchInputInsideName,
                  searchInputOutsideName,
                  searchSelectedDepartmentId,
                  searchSelectedUnitId,
                  searchSelectedOfficeId,
                ].some((value) => value !== "" && value !== null) && (
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
                      if (searchInputProductName) setSearchInputProductName("");
                      if (searchInputInsideName) setSearchInputInsideName("");
                      if (searchInputOutsideName) setSearchInputOutsideName("");
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
              {searchProductInputFields.map((item, index) => (
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
                      <span className={`${styles.list_title} ${styles.change_member}`}>{item.title}</span>
                      {/* <span className={``}>：</span> */}
                    </div>
                  </div>
                  <select
                    className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box} ${styles.change_member}`}
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
                      filteredUnitBySelectedDepartment &&
                      filteredUnitBySelectedDepartment.length >= 1 &&
                      filteredUnitBySelectedDepartment.map((unit) => (
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
                <span>商品を選択してリストに追加</span>
                {/* <div className="min-h-[1px] w-auto bg-[#999]"></div> */}
                {selectedSearchProductsArray && selectedSearchProductsArray.length > 0 && (
                  <>
                    <span className={`text-[11px] font-normal text-[#fff]`}>
                      {selectedSearchProductsArray.length}件選択中
                    </span>
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
                        setSelectedSearchProductsArray([]);
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
                  title={`追加`}
                  minHeight="30px"
                  minWidth="78px"
                  fontSize="13px"
                  textColor={`${selectedSearchProductsArray?.length > 0 ? `#fff` : `#666`}`}
                  bgColor={`${selectedSearchProductsArray?.length > 0 ? `var(--color-bg-brand50)` : `#33333390`}`}
                  bgColorHover={`${selectedSearchProductsArray?.length > 0 ? `var(--color-bg-brand)` : `#33333390`}`}
                  border={`${
                    selectedSearchProductsArray?.length > 0 ? `var(--color-bg-brand)` : `var(--color-bg-brandc0)`
                  }`}
                  borderRadius="6px"
                  classText={`select-none ${selectedSearchProductsArray?.length > 0 ? `` : `hover:cursor-not-allowed`}`}
                  clickEventHandler={() => {
                    // setIsOpenSettingInvitationModal(true);
                    handleAddSelectedProductsList();
                    handleCloseTooltip();
                  }}
                  onMouseEnterHandler={(e: React.MouseEvent<HTMLElement, MouseEvent>) => {
                    // if (isOpenDropdownMenuFilterProducts) return;
                    handleOpenTooltip({
                      e: e,
                      display: "top",
                      content: "担当者を選択してデータの所有者を変更する",
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
              {ProductRows &&
                ProductRows.length > 0 &&
                ProductRows.map((product: Product, index) => {
                  //   if (product.id === productObj.productId) return;
                  return (
                    <li
                      key={product.id}
                      // onMouseEnter={(e) => {
                      //   handleOpenTooltip({
                      //     e: e,
                      //     display: "top",
                      //     content: `${product.company_name ? `${product.company_name} / ` : ``}${
                      //       product.contact_name ? `${product.contact_name} / ` : ``
                      //     }${product.department_name ? `${product.department_name} / ` : ``}${
                      //       product.position_name ? `${product.position_name}` : ``
                      //     }`,
                      //     content2: `${product.address ? `住所: ${product.address} / ` : ``}${
                      //       product.main_phone_number ? `代表TEL: ${product.main_phone_number} / ` : ``
                      //     }${product.direct_line ? `直通TEL: ${product.direct_line} / ` : ``}${
                      //       product.contact_email ? `担当者Email: ${product.contact_email}` : ``
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
                        selectedSearchProductsArray.some((obj) => obj.id === product.id) ? styles.active : ``
                      }`}
                      onClick={() => {
                        // 存在の確認のみなので、findではなくsome
                        // if (selectedSearchProductsArray.some((obj) => obj.contact_id === product.contact_id)) {
                        if (selectedSearchProductsArray.some((obj) => obj.id === product.id)) {
                          // 既に配列に存在している場合は取り除く
                          // const filteredproducts = selectedSearchProductsArray.filter(
                          //   (obj) => obj.contact_id !== product.contact_id
                          // );
                          const filteredProducts = selectedSearchProductsArray.filter((obj) => obj.id !== product.id);
                          setSelectedSearchProductsArray(filteredProducts);
                          return;
                        } else {
                          // 存在しない場合は配列に入れる スプレッドで不変性を保つ
                          // const newProducts = [...selectedSearchProductsArray, product];
                          // const newProduct: QuotationProductsDetail = {
                          //   quotation_product_id: product.id ?? null,
                          //   product_name: product.product_name,
                          //   inside_short_name: product.inside_short_name ?? null,
                          //   outside_short_name: product.outside_short_name ?? null,
                          //   unit_price: product.unit_price ?? null,
                          //   product_created_by_user_id: product.created_by_user_id ?? null,
                          //   product_created_by_company_id: product.created_by_company_id ?? null,
                          //   product_created_by_department_of_user: product.created_by_department_of_user ?? null,
                          //   product_created_by_unit_of_user: product.created_by_unit_of_user ?? null,
                          //   product_created_by_office_of_user: product.created_by_office_of_user ?? null,
                          //   quotation_product_name: product.product_name ?? null,
                          //   quotation_inside_short_name: product.inside_short_name ?? null,
                          //   quotation_outside_short_name: product.outside_short_name ?? null,
                          //   quotation_unit_price: product.unit_price ?? null,
                          //   quotation_product_priority: selectedProductsArray.length + 1,
                          // };
                          // const newProducts = [...selectedSearchProductsArray, newProduct];
                          const newProducts = [...selectedSearchProductsArray, product];
                          setSelectedSearchProductsArray(newProducts);
                        }
                      }}
                    >
                      <div
                        // data-text="ユーザー名"
                        className={`${styles.attendees_list_item_Icon} flex-center h-[40px] w-[40px] cursor-pointer rounded-full bg-[var(--color-bg-brand-sub)] text-[#fff] hover:bg-[var(--color-bg-brand-sub-hover)] ${styles.tooltip} mr-[15px]`}
                        // onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                        // onMouseLeave={handleCloseTooltip}
                      >
                        <span className={`text-[20px]`}>
                          {product.inside_short_name &&
                            getInitial(product.inside_short_name ? product.inside_short_name : "N")}
                          {!product.inside_short_name && getInitial(product.product_name ? product.product_name : "N")}
                        </span>
                      </div>
                      <div
                        className={`${styles.attendees_list_item_lines_group} flex h-full flex-col space-y-[3px] pl-[5px] text-[12px]`}
                      >
                        {/* 型式・略称 */}
                        <div className={`${styles.attendees_list_item_line} flex`}>
                          {product.inside_short_name && (
                            <>
                              <span className="mr-[12px]">{product.inside_short_name}</span>
                            </>
                          )}
                        </div>
                        {/* 商品名 */}
                        <div className={`${styles.attendees_list_item_line} flex text-[13px]`}>
                          {product.product_name && <span className="mr-[4px]">{product.product_name}</span>}
                          <span>{product.outside_short_name ?? ""}</span>
                        </div>

                        {/* 住所・Email・1600以上で直通TEL */}
                        <div className={`${styles.attendees_list_item_line} flex`}>
                          {product.unit_price && (
                            // <span className="mr-[10px] text-[#ccc]">{product.unit_price.toLocaleString()}</span>
                            <span className="mr-[10px] text-[#ccc]">{formatToJapaneseYen(product.unit_price)}</span>
                          )}
                          {/* {product.assigned_employee_id_name && (
                            <div className={`text-[#ccc]`}>{product.assigned_employee_id_name}</div>
                          )} */}
                        </div>
                      </div>
                      {/* {searchSignatureStamp &&
                        (!product.assigned_signature_stamp_id || !product.assigned_signature_stamp_url) && (
                          <div className="ml-auto mr-[30px]">
                            <span
                              className="text-[13px]"
                              onMouseEnter={(e) => {
                                // if (isOpenDropdownMenuFilterProducts) return;
                                handleOpenTooltip({
                                  e: e,
                                  display: "top",
                                  content: "印鑑データが設定されていません。",
                                  content2: "先にプロフィール画面から印鑑データの設定が必要です",
                                  // marginTop: 57,
                                  marginTop: 38,
                                  // marginTop: 12,
                                  itemsPosition: "center",
                                  whiteSpace: "nowrap",
                                });
                              }}
                              onMouseLeave={() => {
                                if (hoveredItemPosSideTable) handleCloseTooltip();
                              }}
                            >
                              印鑑データなし
                            </span>
                          </div>
                        )} */}
                    </li>
                  );
                })}
              {/* 条件検索結果が1件も無い場合 */}
              {/* 初回マウント時ではなく検索結果で行が0の場合 countがnullではなく0の場合 data.pages[0].row  */}
              {queryCount === 0 && (
                <div className={`flex-center h-full min-h-[100px] w-full bg-[#ffffff00] text-[13px] text-[#fff]`}>
                  <span>該当する商品は見つかりませんでした。</span>
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

export const SideTableSearchProduct = memo(SideTableSearchProductMemo);
