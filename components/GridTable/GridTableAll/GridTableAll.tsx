import React, { FC, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./GridTableAll.module.css";
import useStore from "@/store";
import { GridTableFooter } from "../GridTableFooter/GridTableFooter";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import useDashboardStore from "@/store/useDashboardStore";
import useThemeStore from "@/store/useThemeStore";
import useRootStore from "@/store/useRootStore";
import { RippleButton } from "@/components/Parts/RippleButton/RippleButton";
import { ChangeSizeBtn } from "@/components/Parts/ChangeSizeBtn/ChangeSizeBtn";
import { FiLock, FiRefreshCw, FiSearch } from "react-icons/fi";
import { columnNameToJapanese } from "@/utils/columnNameToJapanese";
import { Client_company, Client_company_row_data, ProductCategoriesLarge, ProductCategoriesMedium } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { EditColumnsModalDisplayOnly } from "../EditColumns/EditColumnsModalDisplayOnly";
import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import SpinnerIDS2 from "@/components/Parts/SpinnerIDS/SpinnerIDS2";
import { BsCheck2 } from "react-icons/bs";
import { DropDownMenuSearchMode } from "./DropDownMenuSearchMode/DropDownMenuSearchMode";
import {
  getNumberOfEmployeesClass,
  mappingIndustryType,
  mappingProductL,
  optionsProductLNameOnlySet,
  productCategoriesLargeIdsSet,
} from "@/utils/selectOptions";
import { SpinnerX } from "@/components/Parts/SpinnerX/SpinnerX";
import { toast } from "react-toastify";
import { MdDeleteOutline } from "react-icons/md";
import { ConfirmationModal } from "@/components/DashboardCompanyComponent/Modal/SettingAccountModal/SettingCompany/ConfirmationModal/ConfirmationModal";
import { SpinnerBrand } from "@/components/Parts/SpinnerBrand/SpinnerBrand";
import { SlCloudUpload } from "react-icons/sl";
import { RiSortDesc } from "react-icons/ri";
import { mappingProductCategoriesMedium, productCategoriesMediumNameOnlySet } from "@/utils/productCategoryM";
import {
  ProductCategoriesSmall,
  mappingProductCategoriesSmall,
  productCategoriesSmallNameOnlySet,
} from "@/utils/productCategoryS";
import { convertObjToText, searchObjectColumnsSetCompany } from "@/utils/Helpers/MainContainer/commonHelper";

type TableDataType = {
  id: number;
  // id: string;
  rowIndex: string;
  name: string;
  gender: string;
  dob: string;
  country: string;
  summary: string;
};

// Client_companyのデータ型にindexを加えたタイプ
interface ExtendedClient_company extends Client_company {
  index: number;
}

type ColumnHeaderItemList = {
  columnId: number;
  columnName: string;
  columnIndex: number;
  columnWidth: string;
  isOverflow: boolean;
  isFrozen: boolean;
};

type Props = {
  title: string;
};

const GridTableAllMemo: FC<Props> = ({ title }) => {
  const queryClient = useQueryClient();
  const theme = useRootStore(useThemeStore, (state) => state.theme);
  // --------------- CSVインポート ---------------
  // const setActiveMenuTab = useDashboardStore((state) => state.setActiveMenuTab);
  // const setIsOpenSidebar = useDashboardStore((state) => state.setIsOpenSidebar);

  const setIsOpenImportModal = useDashboardStore((state) => state.setIsOpenImportModal);
  // --------------- CSVインポート ---------------
  // const theme = useThemeStore((state) => state.theme);
  // const theme = useStore((state) => state.theme);
  const language = useStore((state) => state.language);
  // カラム入れ替えモーダルで更新した内容を取得
  const editedColumnHeaderItemList = useDashboardStore((state) => state.editedColumnHeaderItemList);
  const setEditedColumnHeaderItemList = useDashboardStore((state) => state.setEditedColumnHeaderItemList);
  // console.log(
  //   "🔥GridTableHomeコンポーネント 入れ替え後のカラム editedColumnHeaderItemList ",
  //   editedColumnHeaderItemList
  // );
  const loadingGlobalState = useDashboardStore((state) => state.loadingGlobalState); // グローバルローディング
  const [refetchLoading, setRefetchLoading] = useState(false); // refetchローディング
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  // 行レコード削除確認モーダル開閉state
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);

  // UPDATEクエリ後にinvalidateQueryでキャッシュ更新された選択中の行データをselectedRowDataCompanyに反映するために発火通知するか否かのstate(発火通知してDOMクリックで更新する)
  const isUpdateRequiredForLatestSelectedRowDataCompany = useDashboardStore(
    (state) => state.isUpdateRequiredForLatestSelectedRowDataCompany
  );
  const setIsUpdateRequiredForLatestSelectedRowDataCompany = useDashboardStore(
    (state) => state.setIsUpdateRequiredForLatestSelectedRowDataCompany
  );
  // 下メインコンテナサーチモード用Zustand =================
  // 「条件に一致する全ての会社をフェッチするか」、「条件に一致する自社で作成した会社のみをフェッチするか」の抽出条件を保持
  const isFetchAllCompanies = useDashboardStore((state) => state.isFetchAllCompanies);
  const [isOpenDropdownMenuSearchMode, setIsOpenDropdownMenuSearchMode] = useState(false);
  const searchMode = useDashboardStore((state) => state.searchMode);
  const setSearchMode = useDashboardStore((state) => state.setSearchMode);
  const editSearchMode = useDashboardStore((state) => state.editSearchMode);
  const setEditSearchMode = useDashboardStore((state) => state.setEditSearchMode);
  // 下メインコンテナサーチモード用Zustand ここまで =================
  // --------------- 🔹モード設定 ---------------
  const evenRowColorChange = useDashboardStore((state) => state.evenRowColorChange);
  // 検索タイプ(デフォルトは部分一致検索)
  const searchType = useDashboardStore((state) => state.searchType);
  // --------------- 🔹モード設定ここまで ---------------

  // const [colsWidth, setColsWidth] = useState(
  //   new Array(Object.keys(tableBodyDataArray[0]).length + 1).fill("minmax(50px, 1fr)")
  // );
  // 初回マウント時にdataがフェッチできたらtrueにしてuseEffectでカラム生成を実行するstate
  const [gotData, setGotData] = useState(false);
  // 総アイテムのチェック有り無しを保持するstate
  const [checkedRows, setCheckedRows] = useState<Record<string, boolean>>({});
  // ヘッダーチェック有無state
  const [checkedColumnHeader, setCheckedColumnHeader] = useState(false);
  // =================== 列入れ替え ===================
  // 列入れ替え用インデックス
  const [dragColumnIndex, setDragColumnIndex] = useState<number | null>(null);
  // ================= 🔥🔥テスト🔥🔥==================
  // 列アイテムリスト カラムidとカラム名、カラムインデックス、カラム横幅を格納する 🌟🌟ローカル
  // const [columnHeaderItemList, setColumnHeaderItemList] = useState<ColumnHeaderItemList[]>([]);
  // 🌟🌟Zustandから指定したカラムを最初から表示
  const columnHeaderItemList = useDashboardStore((state) => state.columnHeaderItemList);
  const setColumnHeaderItemList = useDashboardStore((state) => state.setColumnHeaderItemList);
  // key: columnIndex, value: objのMapオブジェクト
  const columnIndexToHeaderObjMap = useMemo(() => {
    return new Map(columnHeaderItemList.map((obj) => [obj.columnIndex, obj]));
  }, [columnHeaderItemList]);
  // ================= 🔥🔥テスト🔥🔥==================
  // 各カラムの横幅を管理
  const [colsWidth, setColsWidth] = useState<string[] | null>(null);
  // 現在のカラムの横幅をrefで管理
  const currentColsWidths = useRef<string[]>([]);

  // カラム列全てにindex付きのrefを渡す
  const colsRef = useRef<(HTMLDivElement | null)[]>([]);
  // ドラッグ要素用divRef
  const draggableColsRef = useRef<(HTMLDivElement | null)[]>([]);
  // カラムのテキストの3点リーダー適用有無確認のためのテキストサイズ保持Ref
  const columnHeaderInnerTextRef = useRef<(HTMLSpanElement | null)[]>([]);
  // カラムのリサイズ用オーバーレイ
  const draggableOverlaysRef = useRef<(HTMLDivElement | null)[]>([]);
  // スクロールコンテナDOM
  const parentGridScrollContainer = useRef<HTMLDivElement | null>(null);
  // カラムヘッダーDOM
  const rowHeaderRef = useRef<HTMLDivElement | null>(null);
  // Rowグループコンテナ(Virtualize収納用インナー)
  const gridRowGroupContainerRef = useRef<HTMLDivElement | null>(null);
  // GridセルDOM
  const gridRowTracksRefs = useRef<(HTMLDivElement | null)[]>([]);
  // フォーカス中、選択中のセルを保持
  const selectedGridCellRef = useRef<HTMLDivElement | null>(null);
  const [activeCell, setActiveCell] = useState<HTMLDivElement | null>(null);
  // 前回のアクティブセル
  const prevSelectedGridCellRef = useRef<HTMLDivElement | null>(null);
  // カラム3点リーダー表示時のツールチップ表示State 各カラムでoverflowになったintIdかuuid(string)を格納する
  // const [isOverflowColumnHeader, setIsOverflowColumnHeader] = useState<(string | null)[]>([]);

  // ONとなったチェックボックスを保持する配列のstate
  // ================= 🔥🔥テスト🔥🔥==================
  // const [selectedCheckBox, setSelectedCheckBox] = useState<number[]>([]);
  const [selectedCheckBox, setSelectedCheckBox] = useState<string[]>([]);
  // ================= 🔥🔥テスト🔥🔥==================
  // 現在のアイテム取得件数
  const [getItemCount, setGetItemCount] = useState(0);
  // isFrozenがtrueの個数を取得 初回はidの列をisFrozen: trueでカラム生成するため初期値は1にする
  const isFrozenCountRef = useRef<number>(1);
  // それぞれのカラムのLeftの位置を保持 isFrozenがtrueになったときにindexから値を取得してleftに付与 id列の2列目から
  const columnLeftPositions = useRef<number[]>([]);
  // コンテナのサイズを全体と半分で更新するためのState
  //   const [tableContainerSize, setTableContainerSize] = useState("all");
  const tableContainerSize = useDashboardStore((state) => state.tableContainerSize);

  // ============================== 🌟カラム編集モーダルで並び替え後🌟 ==============================
  // テーブルカラム編集モーダル
  const isOpenEditColumns = useDashboardStore((state) => state.isOpenEditColumns);
  const setIsOpenEditColumns = useDashboardStore((state) => state.setIsOpenEditColumns);
  // カラム順番リセット用State カラム編集モーダルを開いた時に保持
  const resetColumnHeaderItemList = useDashboardStore((state) => state.resetColumnHeaderItemList);
  const setResetColumnHeaderItemList = useDashboardStore((state) => state.setResetColumnHeaderItemList);
  // カラム並び替えモーダルで編集後にカラムヘッダーリストを更新してZustandのStateを空にする
  useEffect(() => {
    if (!editedColumnHeaderItemList.length) return console.log("編集中のカラムリストが存在しないためリターン");
    // ================ Zustandに格納した並び替え後のカラムリストをローカルのStateに格納する
    setColumnHeaderItemList([...editedColumnHeaderItemList]);
    // ================ ✅ローカルストレージにも更新後のカラムリストを保存 ================
    const columnHeaderItemListJSON = JSON.stringify(editedColumnHeaderItemList);
    localStorage.setItem("grid_columns_companies", columnHeaderItemListJSON);
    // localStorage.setItem("grid_columns_contacts", columnHeaderItemListJSON);
    // ================ ✅ローカルストレージにも更新後のカラムリストを保存 ここまで ================
    // colsWidthの配列内の各カラムのサイズも更新する
    let newColsWidth: string[] = [];
    if (colsWidth !== null) {
      const copyColsWidth = [...colsWidth];
      copyColsWidth.forEach((width, index) => {
        if (index === 0) return newColsWidth.push(width);
        width = editedColumnHeaderItemList[index - 1].columnWidth;
        newColsWidth.push(width);
      });
    }

    // =========== CSSカスタムプロパティに反映
    // newColsWidthの各値のpxの文字を削除
    // ['65px', '100px', '250px', '250px', '250px', '250px']から
    // ['65', '100', '250', '250', '250', '250']へ置換 同時に数値型に変換もしておく
    const newColsWidthNum = newColsWidth.map((col) => {
      return +col.replace("px", "");
    });

    console.log("🔥ヘッダーカラム生成🌟 カラム編集モーダルで並び替え後 新たなnewColsWidthNum", newColsWidthNum);

    // それぞれのカラムの合計値を取得 +aで文字列から数値型に変換して合計値を取得
    let sumRowWidth = newColsWidthNum.reduce((a, b) => {
      return a + b;
    });
    console.log("🔥ヘッダーカラム生成🌟 カラム編集モーダルで並び替え後 width合計値 sumRowWidth", sumRowWidth);
    // それぞれのCSSカスタムプロパティをセット
    // grid-template-columnsの値となるCSSカスタムプロパティをセット
    if (!parentGridScrollContainer.current) return;
    const GridScrollContainer = parentGridScrollContainer.current;
    GridScrollContainer.style.setProperty("--template-columns", `${newColsWidth.join(" ")}`);
    GridScrollContainer.style.setProperty("--row-width", `${sumRowWidth}px`);

    console.log(
      "カラム編集モーダルで並び替え後 更新後--template-columns",
      GridScrollContainer.style.getPropertyValue("--template-columns")
    );
    console.log(
      "カラム編集モーダルで並び替え後 更新後--row-width",
      GridScrollContainer.style.getPropertyValue("--row-width")
    );
    console.log("🔥カラム編集モーダルで並び替え後 ここnewColsWidth", newColsWidth);
    setColsWidth(newColsWidth);
    currentColsWidths.current = newColsWidth;

    // setColsWidth()
    // 更新したらZustandのカラム編集リストを空にする
    setEditedColumnHeaderItemList([]);

    // =============== フローズン用 各カラムのLeft位置、レフトポジションを取得 ===============
    // colsWidth ['65px', '100px', '250px', '250px', '250px', '250px', '250px', '250px']から
    // accumulatedLeftPosition:  [65, 165, 415, 665, 915, 1165, 1415, 1665]
    // if (!colsWidth) return;
    // 現在のcolsWidthをコピー
    const widthArray = JSON.parse(JSON.stringify(newColsWidth));

    // 各要素の累積和を計算し、新しい配列を作る
    const accumulatedArray = widthArray.reduce((acc: number[], value: string) => {
      // parseIntを使って数値部分を抽出する
      const number = parseInt(value, 10);
      // 配列の最後の要素（現在の累積和）に数値を加える
      const newSum = acc.length > 0 ? acc[acc.length - 1] + number : number;
      // 新しい累積和を配列に追加する
      acc.push(newSum);
      return acc;
    }, []);
    // [65, 165, 415, 665, 915, 1165, 1415, 1665]
    // refオブジェクトにレフトポジションを格納
    columnLeftPositions.current = accumulatedArray;
    // ===================================================== 🔥テスト フローズンカスタムプロパティ
    const filteredIsFrozenList = editedColumnHeaderItemList.filter((item) => item.isFrozen === true);
    filteredIsFrozenList.forEach((item, index) => {
      parentGridScrollContainer.current!.style.setProperty(`--frozen-left-${index}`, `${accumulatedArray[index]}px`);
    });
    // ===================================================== 🔥テスト フローズンカスタムプロパティ
    // =============== フローズン用 各カラムのLeft位置、レフトポジションを取得 ここまで ===============
  }, [editedColumnHeaderItemList]);
  // ============================== 🌟カラム編集モーダルで並び替え後🌟 ここまで ==============================

  // ================== 🌟supabase本番サーバーデータフェッチ用の関数🌟 ==================
  // ================= 🔥🔥テスト🔥🔥==================
  // Supabaseからの応答を確実に Client_company[] | null 型に変換するか、あるいはエラーをスローするような関数を作成すると良いでしょう。
  function ensureClientCompanies(data: any): Client_company[] | null {
    if (Array.isArray(data) && data.length > 0 && "error" in data[0]) {
      // `data` is `GenericStringError[]`
      throw new Error("Failed to fetch client companies");
    }
    // `data` is `Client_company[] | null`
    return data as Client_company[] | null;
  }
  // ================== 🌟supabase本番サーバーデータフェッチ用の関数🌟 ==================
  const supabase = useSupabaseClient();

  // 初回表示(条件なし)でフェッチするフィールド テスト 先頭にidのカラム名を入れる これで、columnHeaderItemListにidを含めずに初回表示時でもidフィールドをフェッチできる。=> これをしないと、selectedRowDataCompanyにidが無くなるので、右下の活動履歴が表示されなくなる
  // idを加えないとDBフェッチ時にidフィールドが含まれない
  // const columnNamesObj = [...columnHeaderItemList]
  // const columnNamesObj = [
  //   "id",
  //   [...columnHeaderItemList].map((item, index) => item.columnName as keyof Client_company),
  // ].join(", "); // columnNameのみの配列をオブジェクトに変換して取得 { column1, column2, ... }
  const columnNamesObj = [
    "id",
    [...columnHeaderItemList].map((item, index) => item.columnName as keyof Client_company),
    "created_by_user_id",
    "created_by_department_of_user",
    "created_by_unit_of_user",
    "created_by_office_of_user",
    "budget_request_month1",
    "budget_request_month2",
    "country_id",
    "region_id",
    "city_id",
    "street_address",
    "building_name",
  ].join(", "); // columnNameのみの配列をオブジェクトに変換して取得 { column1, column2, ... }

  // ユーザーState
  const userProfileState = useDashboardStore((state) => state.userProfileState);

  // 新規サーチした時のrpc()に渡す検索項目params
  const newSearchCompanyParams = useDashboardStore((state) => state.newSearchCompanyParams);

  // 検索タイプ デフォルトでは部分一致検索で、マニュアル検索では＊を使ったマニュアル検索
  // const functionName = searchType === "partial_match" ? "search_companies_by_partial_match" : "search_companies";
  const functionName =
    searchType === "partial_match" ? "search_companies_categories_by_partial_match" : "search_companies_categories";

  // 🔸サーチ時の並び替えの対象カラムとASC or DESC
  type SortableColumn =
    | "name"
    | "department_name"
    | "email"
    | "main_phone_number"
    | "main_fax"
    | "zipcode"
    | "address"
    | "department_contacts"
    | "industry_large"
    | "industry_small"
    | "industry_type_id"
    | "number_of_employee_class"
    | "number_of_employee"
    | "fiscal_end_month"
    | "capital"
    | "budget_request_month1"
    | "budget_request_month2"
    | "website_url"
    | "clients"
    | "supplier"
    | "business_content"
    | "established_in"
    | "representative_name"
    | "chairperson"
    | "senior_vice_president"
    | "senior_managing_director"
    | "director"
    | "auditor"
    | "board_member"
    | "manager"
    | "member"
    | "facility"
    | "business_sites"
    | "overseas_bases"
    | "corporate_number";
  // | "product_categories_large_array" // 配列を並び替えする意味がないためアンセット
  // | "product_categories_medium_array"
  // | "product_categories_small_array"
  const [orderByColumnData, setOrderByColumnData] = useState<{ columnName: SortableColumn; isAsc: boolean }>({
    columnName: "name",
    isAsc: true,
  });

  // ================== 🌟初回表示時の条件なしサーバーデータフェッチ用の関数🌟 ==================
  // 取得カウント保持用state
  const [getTotalCount, setGetTotalCount] = useState<number | null>(null);
  // let getTotalCount;
  // ユーザーが会社idを持っていない場合にはcreated_by_company_idはnullのみを取得する関数を定義
  // 初回表示時のフェッチ(条件検索無し)
  let fetchServerPage: any;
  // let fetchServerPage: (
  //   limit: number,
  //   offset: number
  // ) => Promise<{ rows: Client_company[] | null; nextOffset: number; isLastPage: boolean; count: number | null }>;
  // ユーザーが会社に所属していない場合には、created_byがNULLの会社のみ取得 新規サーチはなし
  if (userProfileState?.company_id === null) {
    fetchServerPage = async (
      limit: number,
      offset: number = 0
      // =================テスト==================
    ): Promise<{ rows: Client_company[] | null; nextOffset: number; isLastPage: boolean; count: number | null }> => {
      // ): Promise<{ rows: Client_company[] | null; nextOffset: number; isLastPage: boolean }> => {
      // =================テスト==================
      // ): Promise<{ rows: Client_company[] | null; nextOffset: number; }> => {
      // ): Promise<{ rows: TableDataType[]; nextOffset: number }> => {
      // useInfiniteQueryのクエリ関数で渡すlimitの個数分でIndex番号を付けたRowの配列を生成

      const from = offset * limit;
      const to = from + limit - 1;
      console.log(
        "🔥初回表示時条件なしselectクエリ(client_companies)フェッチ実行 ユーザー会社未所属ルート",
        "offset, limit",
        offset,
        limit,
        "from, to",
        from,
        to
      );

      // ------------------- 🔸製品分類あり/なしテスト関連(フィルタ条件なし for_freeルート)🔸 -------------------
      // 🔸製品分類ありver userProfileState?.company_id === nullでfor freeルート (フィルター条件なし初期画面フェッチ) created_by_company_idがNULLのみ抽出
      const { data, error, count } = await supabase
        .rpc("search_companies_categories_no_filter_for_free", {}, { count: "estimated" })
        .range(from, to)
        .order(orderByColumnData.columnName, { ascending: orderByColumnData.isAsc });
      // 🔸製品分類なしver userProfileState?.company_id === nullでfor freeルート (フィルター条件なし初期画面フェッチ) created_by_company_idがNULLのみ抽出
      // const { data, error, count } = await supabase
      //   .from("client_companies")
      //   .select(`${columnNamesObj}`, { count: "estimated" })
      //   .is("created_by_company_id", null)
      //   .or(`created_by_user_id.eq.${userProfileState.id},created_by_user_id.is.null`)
      //   .range(from, to)
      //   .order("name", { ascending: true });

      // ------------------- 🔸製品分類あり/なしテスト関連(フィルタ条件なし for_freeルート)🔸 ここまで -------------------

      // const { data, error, count } = await supabase
      //   .from("client_companies")
      //   // .select(`${columnNamesObj}`)
      //   .select(`${columnNamesObj}`, { count: "exact" })
      //   .is("created_by_company_id", null)
      //   .range(from, to)
      //   .order("name", { ascending: true });

      // const { data, error } = await supabase
      //   .from("client_companies")
      //   .select(`${columnNamesObj}`)
      //   .or(`created_by_company_id.is.null`)
      //   .range(from, to);
      // const { data, error } = await supabase.from("client_companies").select(`*`).eq(``).range(from, to);

      if (error) throw error;

      const rows = ensureClientCompanies(data);

      // const rows = data as Client_company[] | null;

      // フェッチしたデータの数が期待される数より少なければ、それが最後のページであると判断します
      const isLastPage = rows === null || rows.length < limit;

      console.log(
        "🔥初回表示時条件なしrpc(client_companies)結果: ",
        "rows",
        rows,
        "count data",
        count,
        data,
        "isLastPage",
        isLastPage
      );

      // 0.5秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
      // await new Promise((resolve) => setTimeout(resolve, 1000));
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 取得したrowsを返す（nextOffsetは、queryFnのctx.pageParamsが初回フェッチはundefinedで2回目が1のため+1でページ数と合わせる）
      // return { rows, nextOffset: offset + 1, isLastPage };
      return { rows, nextOffset: offset + 1, isLastPage, count };
    };
  }
  // ユーザーが会社idを持っている場合にはcreated_by_company_idはnullと自社で作成した会社両方を取得する関数を定義 新規サーチなし
  // 初回表示時条件なし 会社所属ルート
  if (userProfileState?.company_id) {
    fetchServerPage = async (
      limit: number,
      offset: number = 0
      // =================テスト==================
    ): Promise<{ rows: Client_company[] | null; nextOffset: number; isLastPage: boolean; count: number | null }> => {
      // ): Promise<{ rows: Client_company[] | null; nextOffset: number; isLastPage: boolean }> => {
      // =================テスト==================
      // ): Promise<{ rows: Client_company[] | null; nextOffset: number; }> => {
      // ): Promise<{ rows: TableDataType[]; nextOffset: number }> => {
      // useInfiniteQueryのクエリ関数で渡すlimitの個数分でIndex番号を付けたRowの配列を生成
      const from = offset * limit;
      const to = from + limit - 1;
      console.log(
        "🔥初回表示時条件なしselectクエリ(client_companies)フェッチ実行 ユーザー会社所属ルート",
        "offset, limit",
        offset,
        limit,
        "from, to",
        from,
        to,
        "selectするフィールドcolumnNamesObj",
        columnNamesObj
      );
      // const { data, error } = await supabase.from("client_companies").select(`${columnNamesObj}`).range(from, to);
      // =====================成功 全ての会社(created_by_company_idの有無両方)切り替え無し=====================
      // const { data, error, count } = await supabase
      //   .from("client_companies")
      //   .select(`${columnNamesObj}`, { count: "exact" })
      //   // .is("created_by_company_id", userProfileState.company_id)
      //   // .eq("created_by_company_id", userProfileState.company_id)
      //   .or(`created_by_company_id.eq.${userProfileState.company_id},created_by_company_id.is.null`)
      //   .or(`created_by_user_id.eq.${userProfileState.id},created_by_user_id.is.null`)
      //   .range(from, to)
      //   .order("name", { ascending: true });
      // =====================成功 全ての会社(created_by_company_idの有無両方)切り替え無し=====================
      // 条件に一致する「全ての会社」、「自社専用のみ」のどちらでフェッチするか分岐させる 初期値はtrue => 全て会社
      let data;
      let error;
      let count;

      // ----------------- 🔸製品分類あり/なしテスト関連(フィルタ条件なし 有料会員ルート)🔸 -----------------
      // 🔸製品分類ありver 有料会員ルート (フィルター条件なし初期画面フェッチ)
      const {
        data: fetchData,
        error: fetchError,
        count: fetchCount,
      } = await supabase
        .rpc(
          "search_companies_categories_no_filter",
          {
            _company_id: userProfileState.company_id,
            _is_fetch_own_companies: !isFetchAllCompanies, // 共有(null)と自社専用両方 or 自社専用のみ
          },
          { count: "estimated" }
        )
        .range(from, to)
        .order(orderByColumnData.columnName, { ascending: orderByColumnData.isAsc });
      // .order("name", { ascending: true });

      data = fetchData;
      error = fetchError;
      count = fetchCount;
      // 🔸製品分類ありver 有料会員ルート (フィルター条件なし初期画面フェッチ) ここまで
      // 🔸製品分類なしver 有料会員ルート (フィルター条件なし初期画面フェッチ)
      // if (isFetchAllCompanies) {
      //   // テスト 共有(null)と自社専用両方
      //   const {
      //     data: fetchData,
      //     error: fetchError,
      //     count: fetchCount,
      //   } = await supabase
      //     .from("client_companies")
      //     // .select(`${columnNamesObj}`, { count: "exact" })
      //     .select(`${columnNamesObj}`, { count: "estimated" })
      //     // .eq("created_by_company_id", userProfileState.company_id)
      //     .or(`created_by_company_id.eq.${userProfileState.company_id},created_by_company_id.is.null`)
      //     .or(`created_by_user_id.eq.${userProfileState.id},created_by_user_id.is.null`)
      //     .range(from, to)
      //     .order("name", { ascending: true });
      //   data = fetchData;
      //   error = fetchError;
      //   count = fetchCount;
      //   // テスト 共有(null)と自社専用両方
      // } else {
      //   // テスト自社専用のみ
      //   // const { data, error, count } = await supabase
      //   const {
      //     data: fetchData,
      //     error: fetchError,
      //     count: fetchCount,
      //   } = await supabase
      //     .from("client_companies")
      //     // .select(`${columnNamesObj}`, { count: "exact" })
      //     .select(`${columnNamesObj}`, { count: "estimated" })
      //     .eq("created_by_company_id", userProfileState.company_id)
      //     // .or(`created_by_company_id.eq.${userProfileState.company_id},created_by_company_id.is.null`)
      //     .or(`created_by_user_id.eq.${userProfileState.id},created_by_user_id.is.null`)
      //     .range(from, to)
      //     .order("name", { ascending: true });
      //   data = fetchData;
      //   error = fetchError;
      //   count = fetchCount;
      //   // テスト自社専用のみ
      // }
      // 🔸製品分類なしver 有料会員ルート (フィルター条件なし初期画面フェッチ) ここまで
      // ----------------- 🔸製品分類あり/なしテスト関連(フィルタ条件なし 有料会員ルート)🔸 ここまで -----------------
      // =====================テスト 共有(null)と自社専用を切り替え ここまで=====================
      // const { data, error, count } = await supabase
      //   .from("client_companies")
      //   .select(`${columnNamesObj}`, { count: "exact" })
      //   .or(`created_by_company_id.is.null,created_by_company_id.eq.${userProfileState.company_id}`)
      //   .range(from, to)
      //   .order("name", { ascending: true });
      // const { data, error } = await supabase.from("client_companies").select(`*`).eq(``).range(from, to);

      if (error) throw error;

      const rows = ensureClientCompanies(data);

      // const rows = data as Client_company[] | null;

      // フェッチしたデータの数が期待される数より少なければ、それが最後のページであると判断します
      const isLastPage = rows === null || rows.length < limit;

      console.log(
        "🔥初回表示時条件なしrpc(client_companies)結果: ",
        "rows",
        rows,
        "count data",
        count,
        data,
        "isLastPage",
        isLastPage
      );

      // 0.5秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
      // await new Promise((resolve) => setTimeout(resolve, 1000));
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 取得したrowsを返す（nextOffsetは、queryFnのctx.pageParamsが初回フェッチはundefinedで2回目が1のため+1でページ数と合わせる）
      // return { rows, nextOffset: offset + 1, isLastPage };
      return { rows, nextOffset: offset + 1, isLastPage, count };
    };
  }
  // ================== ✅初回表示時の条件なしサーバーデータフェッチ用の関数✅ ここまで ==================

  // ================== 🌟条件あり新規サーチサーバーデータフェッチ用の関数🌟 ==================
  // const queryClient = useQueryClient()
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  let fetchNewSearchServerPage: any;
  // let fetchNewSearchServerPage: (
  //   limit: number,
  //   offset: number
  // ) => Promise<{ rows: Client_company[] | null; nextOffset: number; isLastPage: boolean; count: number | null }>;
  // 条件あり新規サーチ ユーザーが会社に所属していない場合には、created_byがNULLの会社のみ取得
  if (userProfileState?.company_id === null) {
    fetchNewSearchServerPage = async (
      limit: number,
      offset: number = 0
    ): Promise<{ rows: Client_company[] | null; nextOffset: number; isLastPage: boolean; count: number | null }> => {
      // ): Promise<{ rows: Client_company[] | null; nextOffset: number; isLastPage: boolean }> => {
      const from = offset * limit;
      const to = from + limit - 1;
      let params = newSearchCompanyParams;
      console.log(
        "🔥条件ありrpc(search_companies)フェッチ実行 ユーザー会社未所属ルート",
        "offset, limit",
        offset,
        limit,
        "from, to",
        from,
        to,
        "params",
        params
      );

      // ------------------ 🔸製品分類あり/なしテスト関連(フィルタ条件あり for_freeルート)🔸 ------------------
      // 🔸製品分類ありver for_freeルート (フィルター条件ありルート)
      const { data, error, count } = await supabase
        .rpc(functionName, { params }, { count: "estimated" })
        .is("created_by_company_id", null) // 共有データのみ
        .range(from, to)
        .order(orderByColumnData.columnName, { ascending: orderByColumnData.isAsc });
      // .order("name", { ascending: true });

      // 🔸製品分類なしver for_freeルート (フィルター条件ありルート)
      // const { data, error, count } = await supabase
      //   // .rpc("search_companies", { params }, { count: "exact" })
      //   // .rpc(functionName, { params }, { count: "exact" })
      //   .rpc(functionName, { params }, { count: "estimated" })
      //   .is("created_by_company_id", null)
      //   .or(`created_by_user_id.eq.${userProfileState.id},created_by_user_id.is.null`)
      //   .range(from, to)
      //   .order("name", { ascending: true });
      // // const { data, error, count } = await supabase
      // //   .rpc("search_companies", { params }, { count: "exact" })
      // //   .is("created_by_company_id", null)
      // //   .range(from, to)
      // //   .order("name", { ascending: true });
      // ------------------ 🔸製品分類あり/なしテスト関連(フィルタ条件あり for_freeルート)🔸 ここまで ------------------

      if (error) {
        alert(error.message);
        throw error;
      }
      const rows = ensureClientCompanies(data);

      // フェッチしたデータの数が期待される数より少なければ、それが最後のページであると判断します
      const isLastPage = rows === null || rows.length < limit;

      console.log("🔥条件ありrpc(search_companies)結果: ", "rows", rows, "count data", count, data);

      // 1秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
      // await new Promise((resolve) => setTimeout(resolve, 1000));
      await new Promise((resolve) => setTimeout(resolve, 500));

      // ローディング終了
      setLoadingGlobalState(false);

      // 取得したrowsを返す（nextOffsetは、queryFnのctx.pageParamsが初回フェッチはundefinedで2回目が1のため+1でページ数と合わせる）
      // return { rows, nextOffset: offset + 1, isLastPage };
      return { rows, nextOffset: offset + 1, isLastPage, count };
    };
  }
  // 条件あり新規サーチ ユーザーが会社に所属している場合には、created_byがNULLか、ユーザーの所属会社idに合致する会社のみ取得
  if (userProfileState?.company_id) {
    fetchNewSearchServerPage = async (
      limit: number,
      offset: number = 0
    ): Promise<{ rows: Client_company[] | null; nextOffset: number; isLastPage: boolean; count: number | null }> => {
      // ): Promise<{ rows: Client_company[] | null; nextOffset: number; isLastPage: boolean }> => {
      const from = offset * limit;
      const to = from + limit - 1;
      // パラメータはparamsの名前でrpc()に渡す
      let params = newSearchCompanyParams;
      console.log(
        "🔥条件ありrpc(search_companies)フェッチ実行 ユーザー会社所属ルート",
        "isFetchAllCompanies",
        isFetchAllCompanies,
        "offset, limit",
        offset,
        limit,
        "from, to",
        from,
        to,
        "params",
        params
      );
      // =====================成功 共有(null)と自社専用両方=====================
      // const { data, error, count } = await supabase
      //   .rpc("search_companies", { params }, { count: "exact" })
      //   // .eq("created_by_company_id", userProfileState.company_id)
      //   .or(`created_by_company_id.eq.${userProfileState.company_id},created_by_company_id.is.null`)
      //   .or(`created_by_user_id.eq.${userProfileState.id},created_by_user_id.is.null`)
      //   .range(from, to)
      //   .order("name", { ascending: true });
      // =====================成功 共有(null)と自社専用両方=====================

      // =====================テスト 共有(null)と自社専用を切り替え=====================
      // 条件に一致する「全ての会社」、「自社専用のみ」のどちらでフェッチするか分岐させる 初期値はtrue => 全て会社
      let data;
      let error;
      let count;

      // const {
      //   data: fetchData,
      //   error: fetchError,
      //   count: fetchCount,
      // } = await supabase
      //   .rpc("search_companies_categories_no_filter", {
      //     _company_id: userProfileState.company_id,
      //     is_fetch_own_companies: false, // 共有(null)と自社専用両方
      //   })
      //   .range(from, to)
      //   .order(orderByColumnData.columnName, { ascending: orderByColumnData.isAsc });

      // ------------------- 🔸製品分類あり/なしテスト関連(フィルタ条件あり 有料会員ルート)🔸 -------------------

      // 🔸製品分類ありver 有料会員ルート (フィルター条件ありルート)
      if (isFetchAllCompanies) {
        // テスト 共有(null)と自社専用両方
        // const { data, error, count } = await supabase
        const {
          data: fetchData,
          error: fetchError,
          count: fetchCount,
        } = await supabase
          .rpc(functionName, { params }, { count: "estimated" })
          .or(`created_by_company_id.eq.${userProfileState.company_id},created_by_company_id.is.null`)
          // .or(`created_by_user_id.eq.${userProfileState.id},created_by_user_id.is.null`)
          .range(from, to)
          .order(orderByColumnData.columnName, { ascending: orderByColumnData.isAsc });
        // .order("name", { ascending: true });
        data = fetchData;
        error = fetchError;
        count = fetchCount;
        // テスト 共有(null)と自社専用両方
      } else {
        // テスト自社専用のみ
        const {
          data: fetchData,
          error: fetchError,
          count: fetchCount,
        } = await supabase
          .rpc(functionName, { params }, { count: "estimated" })
          .eq("created_by_company_id", userProfileState.company_id)
          // .or(`created_by_user_id.eq.${userProfileState.id},created_by_user_id.is.null`)
          .range(from, to)
          .order(orderByColumnData.columnName, { ascending: orderByColumnData.isAsc });
        // .order("name", { ascending: true });
        data = fetchData;
        error = fetchError;
        count = fetchCount;
        // テスト自社専用のみ
      }
      // 🔸製品分類なしver 有料会員ルート (フィルター条件ありルート)
      // if (isFetchAllCompanies) {
      //   // テスト 共有(null)と自社専用両方
      //   // const { data, error, count } = await supabase

      //   const {
      //     data: fetchData,
      //     error: fetchError,
      //     count: fetchCount,
      //   } = await supabase
      //     // .rpc("search_companies", { params }, { count: "exact" })
      //     // .rpc(functionName, { params }, { count: "exact" })
      //     .rpc(functionName, { params }, { count: "estimated" })
      //     // .eq("created_by_company_id", userProfileState.company_id)
      //     .or(`created_by_company_id.eq.${userProfileState.company_id},created_by_company_id.is.null`)
      //     .or(`created_by_user_id.eq.${userProfileState.id},created_by_user_id.is.null`)
      //     .range(from, to)
      //     .order("name", { ascending: true });
      //   data = fetchData;
      //   error = fetchError;
      //   count = fetchCount;
      //   // テスト 共有(null)と自社専用両方
      // } else {
      //   // テスト自社専用のみ
      //   // const { data, error, count } = await supabase
      //   const {
      //     data: fetchData,
      //     error: fetchError,
      //     count: fetchCount,
      //   } = await supabase
      //     // .rpc("search_companies", { params }, { count: "exact" })
      //     // .rpc(functionName, { params }, { count: "exact" })
      //     .rpc(functionName, { params }, { count: "estimated" })
      //     .eq("created_by_company_id", userProfileState.company_id)
      //     // .or(`created_by_company_id.eq.${userProfileState.company_id},created_by_company_id.is.null`)
      //     .or(`created_by_user_id.eq.${userProfileState.id},created_by_user_id.is.null`)
      //     .range(from, to)
      //     .order("name", { ascending: true });
      //   data = fetchData;
      //   error = fetchError;
      //   count = fetchCount;
      //   // テスト自社専用のみ
      // }
      // ------------------- 🔸製品分類あり/なしテスト関連(フィルタ条件あり 有料会員ルート)🔸 ここまで -------------------
      // =====================テスト 共有(null)と自社専用を切り替え ここまで=====================
      // const { data, error, count } = await supabase
      //   .rpc("search_companies", { params }, { count: "exact" })
      //   .is("created_by_company_id", null)
      //   .range(from, to)
      //   .order("name", { ascending: true });

      if (error) throw error;

      const rows = ensureClientCompanies(data);

      console.log("🔥条件ありrpc(search_companies)結果: ", "rows", rows, "count data", count, data);
      // フェッチしたデータの数が期待される数より少なければ、それが最後のページであると判断します
      const isLastPage = rows === null || rows.length < limit;

      // 0.5秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
      // await new Promise((resolve) => setTimeout(resolve, 1000));
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 取得したrowsを返す（nextOffsetは、queryFnのctx.pageParamsが初回フェッチはundefinedで2回目が1のため+1でページ数と合わせる）
      // return { rows, nextOffset: offset + 1, isLastPage };
      return { rows, nextOffset: offset + 1, isLastPage, count };
    };
  }

  // ================= 🔥🔥テスト🔥🔥==================
  // 新規サーチで検索した条件のnewSearchCompanyParamsのオブジェクトを全てa-zで並べ替えた状態で文字列にすることで、
  // 次回に同じ検索をした場合にもキャッシュを使用できるようにする
  // useInfiniteQueryのキャッシュのクエリキーの第二引数に割り当てる
  // const [newSearchParamsString, setNewSearchParamsString] = useState<string | null>(null);
  // -------------------------- 🔸サーチ条件をstringに変換 変更前 useRefバージョン🔸 --------------------------
  // const newSearchParamsStringRef = useRef<string | null>(null);
  // // console.log("キャッシュに割り当てるparamsキー newSearchCompanyParams", newSearchCompanyParams);
  // if (newSearchCompanyParams) {
  //   const convertObjToText = (obj: Object) => {
  //     let objText = ``;
  //     Object.entries(obj).forEach(([key, value]) => {
  //       objText += `${key}:${value}`;
  //     });
  //     return objText;
  //   };
  //   newSearchParamsStringRef.current = Object.entries(newSearchCompanyParams)
  //     .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
  //     .map(([key, value]) =>
  //       key === "capital" ? convertObjToText(value) : `${key}:${value === null ? `null` : `${value}`}`
  //     )
  //     // .map((key, index) => `${key}:${key[index]} `)
  //     .join(", ");
  //   // .join("");
  //   // console.log("キャッシュに割り当てるparamsキー newSearchParamsStringRef.current", newSearchParamsStringRef.current);
  // }
  // -------------------------- 🔸サーチ条件をstringに変換 変更前 useRefバージョン🔸 --------------------------ここまで

  // -------------------------- 🔸サーチ条件をstringに変換 テスト useMemo🔸 --------------------------
  const searchParamsString = useMemo(() => {
    if (newSearchCompanyParams) {
      return Object.entries(newSearchCompanyParams)
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
        .map(([key, value]) =>
          searchObjectColumnsSetCompany.has(key)
            ? convertObjToText(key, value)
            : `${key}:${value === null ? `null` : `${value}`}`
        )
        .join(", ");
    } else {
      return null;
    }
  }, [newSearchCompanyParams]);
  // -------------------------- 🔸サーチ条件をstringに変換 テスト useMemo🔸 -------------------------- ここまで

  // console.log(
  //   "✅🔥newSearchCompanyParams",
  //   newSearchCompanyParams,
  //   "NewSearchParamsString",
  //   newSearchParamsStringRef.current
  // );
  // ================== 🌟useInfiniteQueryフック🌟 ==================
  const { status, data, error, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage, refetch } = useInfiniteQuery(
    {
      // queryKey: ["companies"],
      // queryKey: ["companies", newSearchParamsStringRef.current], // 全ての会社 自社専用のみの切り替えなし
      // queryKey: ["companies", newSearchParamsStringRef.current, isFetchAllCompanies, functionName], // 全ての会社、自社専用のみの切り替えあり, オート検索/マニュアル検索
      queryKey: ["companies", searchParamsString, isFetchAllCompanies, functionName], // 全ての会社、自社専用のみの切り替えあり, オート検索/マニュアル検索
      queryFn: async (ctx) => {
        console.log("useInfiniteQuery queryFn関数内 引数ctx", ctx);

        // return fetchServerPage(35, ctx.pageParam); // 50個ずつ取得
        // 新規サーチなしの通常モード
        if (newSearchCompanyParams === null) {
          // 初回表示時のフェッチ(条件検索無し)
          console.log("通常フェッチ queryFn✅✅✅", newSearchCompanyParams);
          const newPage = await fetchServerPage(50, ctx.pageParam); // 50個ずつ取得
          if (loadingGlobalState) setLoadingGlobalState(false);
          return newPage;
        } else {
          // 条件あり新規サーチ;
          console.log("サーチフェッチ queryFn✅✅✅", newSearchCompanyParams);
          // return fetchNewSearchServerPage(50, ctx.pageParam); // 50個ずつ取得
          const newPage = await fetchNewSearchServerPage(50, ctx.pageParam); // 50個ずつ取得
          if (loadingGlobalState) setLoadingGlobalState(false);
          return newPage;
        }
      },
      // ================= 🔥🔥テスト🔥🔥==================
      // getNextPageParam: (_lastGroup, groups) => groups.length,
      getNextPageParam: (lastGroup, allGroups) => {
        // lastGroup.isLastPageがtrueならundefinedを返す
        return lastGroup.isLastPage ? undefined : allGroups.length;
      },
      // ================= 🔥🔥テスト🔥🔥==================
      staleTime: Infinity,
    }
  );
  // ================== 🌟useInfiniteQueryフック🌟 ここまで ==================
  // ================= 🔥🔥テスト🔥🔥ここまで==================
  // useEffect(() => {
  //   if (newSearchCompanyParams === null) setNewSearchParamsString(null);
  //   if (newSearchCompanyParams) {
  //     let paramsString = Object.entries(newSearchCompanyParams)
  //       .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
  //       .map((key, value) => `${key}: ${value === null ? `null` : `${value}`}`)
  //       .join(", ");
  //     setNewSearchParamsString(paramsString);
  //     console.log("キャッシュに割り当てるparamsキー paramsString", paramsString);
  //   }
  // }, [newSearchCompanyParams]);

  // ================= 🔥🔥テスト🔥🔥ここから==================

  // interface extendedClient_companyAddedIndex extends Client_company {
  //   index?: number | null;
  // }
  // 現在取得している全ての行 data.pagesのネストした配列を一つの配列にフラット化
  // const allRows = data ? data.pages.flatMap((d) => d?.rows) : [];
  console.log("=============================================data", data);
  // const Rows = data ? data.pages.flatMap((d) => d?.rows) : [];
  const Rows = data ? data.pages.flatMap((d) => d?.rows) : [];
  const allRows = Rows.map((obj, index) => {
    return { index, ...obj };
  });
  // const allRows: (extendedClient_companyAddedIndex)[] = Rows.map((obj, index) => {
  //   return { index, ...obj };
  // });
  // ================= 🔥🔥テスト🔥🔥ここまで==================

  // ============================= 🌟バーチャライザーのインスタンスを生成🌟 =============================
  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? allRows.length + 1 : allRows.length, // 次のページ有り lengthを１増やす
    getScrollElement: () => parentGridScrollContainer.current, // スクロール用コンテナ
    // estimateSize: () => 35, // 要素のサイズ
    estimateSize: () => 30, // 要素のサイズ
    // overscan: 20, // ビューポート外にレンダリングさせる個数
    overscan: 10, // ビューポート外にレンダリングさせる個数
  });
  // ======================== 🌟バーチャライザーのインスタンスを生成🌟 ここまで ========================

  // ============================= 🌟無限スクロールの処理 追加でフェッチ🌟 =============================
  useEffect(() => {
    if (!rowVirtualizer) return console.log("無限スクロール関数 rowVirtualizerインスタンス無し");
    // 現在保持している配列内の最後のアイテムをreverseで先頭にしてから分割代入で取得
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();
    console.log("lastItem", lastItem);
    if (!lastItem) {
      return;
    }

    // ================= lastItem.indexに到達 追加フェッチ =================
    console.log(`lastItem.index:${lastItem.index} allRows.length:${allRows.length}`);
    // 最後のアイテムindexが総数-1を超え、まだフェッチできるページがあり、フェッチ中でないなら
    if (lastItem.index >= allRows.length - 1 && hasNextPage && !isFetchingNextPage) {
      // queryFnで設定した関数 limitは10で10個ずつフェッチで設定
      console.log(
        `無限スクロール追加フェッチ実行 現在の状態 lastItem.index:${lastItem.index} allRows.length:${allRows.length}`
      );
      // ================= 🔥🔥テスト🔥🔥==================
      console.log("🔥🔥テスト🔥🔥status", status);
      console.log("🔥🔥テスト🔥🔥data", data);
      console.log("🔥🔥テスト🔥🔥error", error);
      console.log("🔥🔥テスト🔥🔥isFetching", isFetching);
      console.log("🔥🔥テスト🔥🔥isFetchingNextPage", isFetchingNextPage);
      console.log("🔥🔥テスト🔥🔥hasNextPage", hasNextPage);
      fetchNextPage(); // 追加でフェッチ
      // ================= 🔥🔥テスト🔥🔥==================
    }
    // ================= lastItem.indexに到達 追加フェッチ ここまで =================
  }, [hasNextPage, fetchNextPage, allRows.length, isFetchingNextPage, rowVirtualizer.getVirtualItems()]);
  // ======================= 🌟無限スクロールの処理 追加でフェッチ🌟 ここまで =======================

  // ============================== 🌟無限スクロールの処理 追加でフェッチ ==============================
  // ========== 🌟useEffect 取得データ総数が変わったタイミングで発火 チェック有無のStateの数を合わせる🌟 ==========
  useEffect(() => {
    // =========== チェック有無Stateの数を新たに取得したデータ数と一緒にする
    console.log("🔥総数変化を検知 追加フェッチしたdata分 チェック有無Stateを追加 ====================");
    // ================= 🔥🔥テスト🔥🔥ここから==================
    if (!allRows) return console.log("data undefined or nullリターン", allRows);
    const newDataArray = allRows;
    // if (!data) return console.log("data undefined or nullリターン", data);
    // const newDataArray = data?.pages.flatMap((d) => d.rows);
    // ================= 🔥🔥テスト🔥🔥==================
    if (!newDataArray.length) return;
    // ================= 🔥🔥テスト🔥🔥==================
    console.log(`lastIndexに到達しDBに追加フェッチ結果 newDataArray ${newDataArray.length}`, newDataArray);
    console.log(`lastIndexに到達しDBに追加フェッチ結果 checkedRows ${Object.keys(checkedRows).length}`, checkedRows);
    // DBから取得した配列をオブジェクトに変換 {id: boolean}にallRowsを変換
    // ================= 🔥🔥テスト🔥🔥==================

    // ================= 🔥🔥テスト🔥🔥ここから==================

    // const allRowsBooleanArray = newDataArray.map((obj) => {
    //   let newObj: Record<string, boolean> = {};
    //   if (obj === null) return newObj;
    //   if (obj?.id === null) return newObj;
    //   newObj[obj.id] = false
    //   return newObj;
    // });
    // const allRowsBooleanObject = newDataArray.reduce((obj: { [key: number]: boolean }, item) => {
    const allRowsBooleanObject = newDataArray.reduce((obj: { [key: string]: boolean }, item) => {
      if (item === null) return obj;
      obj[item.index.toString()] = false;
      // obj[checkedCount] = false;
      // obj[item.id] = false; // id：falseにする場合はこっち
      // obj[Number(item.id)] = false;
      return obj;
    }, {});
    // ================= 🔥🔥テスト🔥🔥ここまで==================
    console.log(
      `配列をidとbooleanオブジェクトに変換 allRowsBooleanObject ${Object.keys(allRowsBooleanObject).length}`,
      allRowsBooleanObject
    );
    // 配列同士を結合
    const newObject = { ...allRowsBooleanObject, ...checkedRows };
    console.log(`結合して既存チェックState数を総アイテム数と合わせる ${Object.keys(newObject).length}`, newObject);
    setCheckedRows(newObject);

    // 現在の取得件数をStateに格納
    setGetItemCount(Object.keys(newObject).length);
  }, [allRows.length]);

  // ========== 🌟useEffect 取得データ総数が変わったタイミングで発火 チェック有無のStateの数を合わせる🌟 ここまで

  // ========================= 🌟useEffect 初回DBからフェッチ完了を通知する🌟 =========================
  useEffect(() => {
    if (gotData) return;
    // 初回マウント データ取得完了後Stateをtrueに変更通知して、カラム生成useEffectを実行
    if (data) {
      setGotData(true);
      // 取得したアイテムの総数分idとbooleanでチェック有り無しをStateで管理 最初はチェック無しなので、全てfalse
      let idObject = allRows.reduce((obj: { [key: string]: boolean } | undefined, item) => {
        if (typeof item === "undefined" || typeof obj === "undefined") return;
        // ================= 🔥🔥テスト🔥🔥ここから==================
        if (item === null) return;
        // if ((typeof item.id === "undefined") === null) return;
        // if (typeof item.id === "undefined") return;
        // obj[item.id.toString()] = false;
        obj[item.index.toString()] = false;

        return obj;
        // ================= 🔥🔥テスト🔥🔥ここまで==================
      }, {});
      if (typeof idObject === "undefined") return;
      setCheckedRows(idObject);
      return;
    }
  }, [data]);
  // ======================= 🌟useEffect 初回DBからフェッチ完了を通知する🌟 ここまで =======================

  // =============================== 🌟useEffect ヘッダーカラム生成🌟 ===============================
  // 取得したデータが変更された場合、プロパティ(フィールド)の数が変わる場合があるので、
  // 変更があった場合には再度カラム列の数とサイズを現在取得しているデータでリセット
  useEffect(() => {
    if (!data?.pages[0]) return console.log("useEffect実行もまだdata無し リターン");
    console.log("🌟ヘッダーカラム生成 gotData ===========================", gotData);

    // ========================= 🔥テスト ローカルストレージ ルート =========================
    const localStorageColumnHeaderItemListJSON = localStorage.getItem("grid_columns_companies");
    // const localStorageColumnHeaderItemListJSON = localStorage.getItem("grid_columns_contacts");
    if (localStorageColumnHeaderItemListJSON) {
      console.log("useEffect ローカルストレージルート🔥");
      // まずはローカルストレージから取得したColumnHeaderItemListのJSONをJSオブジェクトにパース
      const localStorageColumnHeaderItemList: ColumnHeaderItemList[] = JSON.parse(localStorageColumnHeaderItemListJSON);
      // まずはローカルストレージから取得したColumnHeaderItemListをローカルStateに格納
      setColumnHeaderItemList(localStorageColumnHeaderItemList);
      // isFrozenがtrueの個数をRefに格納
      isFrozenCountRef.current = localStorageColumnHeaderItemList.filter((obj) => obj.isFrozen === true).length;
      // console.log("ローカルストレージルート localStorageColumnHeaderItemList", localStorageColumnHeaderItemList);
      // columnHeaderItemListからcolumnwidthのみを取得
      const newColsWidths = localStorageColumnHeaderItemList.map((item) => item.columnWidth);
      // console.log("ローカルストレージルート tempColsWidth", newColsWidths);
      // チェックボックスの65pxの文字列をnewColsWidthsの配列の手前に格納
      newColsWidths.unshift("65px");
      // console.log("ローカルストレージルート unshift後のnewColsWidth Stateにカラムwidthを保存", newColsWidths);
      // 全てのカラムWidthをローカルStateに格納
      setColsWidth(newColsWidths);
      currentColsWidths.current = newColsWidths;
      // 全てのカラムWidthをRefオブジェクトに格納
      currentColsWidths.current = newColsWidths;

      // =============== フローズン用 各カラムのLeft位置、レフトポジションを取得 ===============
      // colsWidth ['65px', '100px', '250px', '250px', '250px', '250px', '250px', '250px']から
      // accumulatedLeftPosition:  [65, 165, 415, 665, 915, 1165, 1415, 1665]
      // if (!colsWidth) return;
      // 現在のcolsWidthをコピー
      const widthArray = JSON.parse(JSON.stringify(newColsWidths));

      // 各要素の累積和を計算し、新しい配列を作る
      const accumulatedArray = widthArray.reduce((acc: number[], value: string) => {
        // parseIntを使って数値部分を抽出する
        const number = parseInt(value, 10);
        // 配列の最後の要素（現在の累積和）に数値を加える
        const newSum = acc.length > 0 ? acc[acc.length - 1] + number : number;
        // 新しい累積和を配列に追加する
        acc.push(newSum);
        return acc;
      }, []);
      // [65, 165, 415, 665, 915, 1165, 1415, 1665]
      // refオブジェクトにレフトポジションを格納
      columnLeftPositions.current = accumulatedArray;
      // console.log("ローカルストレージルート レフトポジション accumulatedArray", accumulatedArray);
      // ===================================================== 🔥テスト フローズンカスタムプロパティ
      const filteredIsFrozenList = localStorageColumnHeaderItemList.filter((item) => item.isFrozen === true);
      filteredIsFrozenList.forEach((item, index) => {
        parentGridScrollContainer.current!.style.setProperty(`--frozen-left-${index}`, `${accumulatedArray[index]}px`);
      });
      // ===================================================== 🔥テスト フローズンカスタムプロパティ
      // =============== フローズン用 各カラムのLeft位置、レフトポジションを取得 ここまで ===============

      // ====================== CSSカスタムプロパティに反映 ======================
      if (parentGridScrollContainer.current === null) return;
      const newColsWidthNum = newColsWidths.map((col) => {
        const newValue = col.replace("px", "");
        return Number(newValue);
      });
      // console.log("ローカルストレージルート ヘッダーカラム生成 newColsWidthNum", newColsWidthNum);
      // それぞれのカラムの合計値を取得 +aで文字列から数値型に変換して合計値を取得
      let sumRowWidth = newColsWidthNum.reduce((a, b) => {
        return a + b;
      });
      // console.log("ローカルストレージルート ヘッダーカラム生成 sumRowWidth", sumRowWidth);
      // それぞれのCSSカスタムプロパティをセット
      // grid-template-columnsの値となるCSSカスタムプロパティをセット
      parentGridScrollContainer.current.style.setProperty("--template-columns", `${newColsWidths.join(" ")}`);
      parentGridScrollContainer.current.style.setProperty("--header-row-height", "30px");
      // parentGridScrollContainer.current.style.setProperty("--header-row-height", "35px");
      parentGridScrollContainer.current.style.setProperty("--row-width", `${sumRowWidth}px`);
      parentGridScrollContainer.current.style.setProperty("--summary-row-height", "30px");
      // parentGridScrollContainer.current.style.setProperty("--summary-row-height", "35px");

      // console.log(
      //   "ローカルストレージルート 更新後--template-columns",
      //   parentGridScrollContainer.current.style.getPropertyValue("--template-columns")
      // );
      // console.log(
      //   "ローカルストレージルート 更新後--row-width",
      //   parentGridScrollContainer.current.style.getPropertyValue("--row-width")
      // );

      return console.log("useEffectはここでリターン ローカルストレージルート");
    }
    // ========================= 🔥テスト ローカルストレージ ルート ここまで =========================
    // ========================= 🔥初回ヘッダー生成ルート ルート ここまで =========================
    console.log("useEffect ローカルストレージ無し 初回ヘッダー生成ルート🔥");

    // マウント時に各フィールド分のカラムを生成 サイズはデフォルト値を65px, 100px, 3列目以降は250pxに設定
    // ================= 🔥🔥テスト🔥🔥==================
    if (data?.pages[0].rows === null) return;
    // ================= 🔥🔥テスト🔥🔥==================
    console.log(
      "🌟useEffect Object.keys(data?.pages[0].rows[0] as object",
      Object.keys(data?.pages[0].rows[0] as object)
    );
    // 初回カラム生成時には必ずidフィールドもフェッチするためidカラムが含まれてしまうが、idフィールドはフェッチしてselectedRowDataにはidフィールドを保持しつつ、テーブルにはidカラムは表示しないようにするためにfilterメソッドでカラム生成時にidをとり除く
    // const filteredArrayOmitId = Object.keys(data?.pages[0].rows[0] as object).filter((field) => field !== "id");
    // -------------------------- ✅初回カラム生成 テスト✅ --------------------------
    // 🔸変更前
    // const excludeKeys = new Set([
    //   "id",
    //   "created_by_user_id",
    //   "created_by_department_of_user",
    //   "created_by_unit_of_user",
    //   "created_by_office_of_user",
    //   "budget_request_month1",
    //   "budget_request_month2",
    // ]);
    // const filteredArrayOmitId = Object.keys(data?.pages[0].rows[0] as object).filter((key) => !excludeKeys.has(key));
    // 🔸変更前 ここまで
    // 🔸変更後 最初からカラムとして表示するもののみをセット
    const filteredArrayOmitId = [...columnHeaderItemList].map((item, index) => item.columnName as keyof Client_company);
    console.log("✅初回ヘッダー生成 初回に表示するカラムを生成 filteredArrayOmitId", filteredArrayOmitId);
    // 🔸変更後 ここまで
    // -------------------------- ✅初回カラム生成 テスト✅ ここまで --------------------------
    const newColsWidths = new Array(filteredArrayOmitId.length + 1).fill("120px"); //チェックボックス用に+1個
    // const newColsWidths = new Array(Object.keys(data?.pages[0].rows[0] as object).length + 1).fill("120px");
    // newColsWidths.fill("65px", 0, 1); // 1列目を65pxに変更 チェックボックス
    // newColsWidths.fill("50px", 1, 2); // 2列目を100pxに変更 id
    // newColsWidths.fill("100px", 2, 3); // 2列目を100pxに変更 法人番号
    // newColsWidths.fill("200px", 3, 4); // 4列目を100pxに変更 会社名
    // ==================== 会社名が最初でフローズン ====================
    newColsWidths.fill("65px", 0, 1); // 1列目を65pxに変更 チェックボックス
    newColsWidths.fill("280px", 1, 2); // 2列目を100pxに変更 会社名
    // ==================== 会社名が最初でフローズン ここまで ====================
    console.log("Stateにカラムwidthを保存", newColsWidths);
    // ['65px', '100px', '250px', '50px', '119px', '142px', '250px', '250px']
    // stateに現在の全てのカラムのwidthを保存
    setColsWidth(newColsWidths);
    currentColsWidths.current = newColsWidths;
    // refオブジェクトに保存
    currentColsWidths.current = newColsWidths;
    console.log("currentColsWidths.current", currentColsWidths.current);

    // =============== フローズン用 各カラムのLeft位置、レフトポジションを取得 ===============
    // colsWidth ['65px', '100px', '250px', '250px', '250px', '250px', '250px', '250px']から
    // accumulatedLeftPosition:  [65, 165, 415, 665, 915, 1165, 1415, 1665]
    // if (!colsWidth) return;
    // 現在のcolsWidthをコピー
    const widthArray = JSON.parse(JSON.stringify(newColsWidths));

    // 各要素の累積和を計算し、新しい配列を作る
    const accumulatedArray = widthArray.reduce((acc: number[], value: string) => {
      // parseIntを使って数値部分を抽出する
      const number = parseInt(value, 10);
      // 配列の最後の要素（現在の累積和）に数値を加える
      const newSum = acc.length > 0 ? acc[acc.length - 1] + number : number;
      // 新しい累積和を配列に追加する
      acc.push(newSum);
      return acc;
    }, []);
    // [65, 165, 415, 665, 915, 1165, 1415, 1665]
    // refオブジェクトにレフトポジションを格納
    columnLeftPositions.current = accumulatedArray;
    // =============== フローズン用 各カラムのLeft位置、レフトポジションを取得 ここまで ===============

    if (parentGridScrollContainer.current === null) return;

    // ====================== CSSカスタムプロパティに反映 ======================
    // newColsWidthの各値のpxの文字を削除
    // ['65px', '100px', '250px', '250px', '250px', '250px']から
    // ['65', '100', '250', '250', '250', '250']へ置換
    const newColsWidthNum = newColsWidths.map((col) => {
      return col.replace("px", "");
    });

    console.log("初回ヘッダー生成 ヘッダーカラム生成 newColsWidthNum", newColsWidthNum);

    // それぞれのカラムの合計値を取得 +aで文字列から数値型に変換して合計値を取得
    let sumRowWidth = newColsWidthNum.reduce((a, b) => {
      return +a + +b;
    });
    console.log("初回ヘッダー生成 ヘッダーカラム生成 sumRowWidth", sumRowWidth);

    // それぞれのCSSカスタムプロパティをセット
    // grid-template-columnsの値となるCSSカスタムプロパティをセット
    parentGridScrollContainer.current.style.setProperty("--template-columns", `${newColsWidths.join(" ")}`);
    parentGridScrollContainer.current.style.setProperty("--header-row-height", "30px");
    // parentGridScrollContainer.current.style.setProperty("--header-row-height", "35px");
    parentGridScrollContainer.current.style.setProperty("--row-width", `${sumRowWidth}px`);
    parentGridScrollContainer.current.style.setProperty("--summary-row-height", "30px");
    // parentGridScrollContainer.current.style.setProperty("--summary-row-height", "35px");

    console.log(
      "初回ヘッダー生成 更新後--template-columns",
      parentGridScrollContainer.current.style.getPropertyValue("--template-columns")
    );
    console.log(
      "初回ヘッダー生成 更新後--row-width",
      parentGridScrollContainer.current.style.getPropertyValue("--row-width")
    );

    // ====================== カラム順番入れ替え用の列アイテムリストに格納 ======================
    // colsWidthsの最初2つはcheckboxとidの列なので、最初から3つ目で入れ替え
    // const tempFirstColumnItemListArray = Object.keys(data?.pages[0].rows[0] as object);
    // const firstColumnItemListArray = tempFirstColumnItemListArray.map((item, index) => {
    // id無しバージョン
    const firstColumnItemListArray = filteredArrayOmitId.map((item, index) => {
      // 初回カラム生成は最初の列（現在はid列）はisFrozenとisLastDrozenをtrueにする
      if (index === 0) {
        return {
          columnId: index,
          columnName: item,
          columnIndex: index + 2,
          columnWidth: newColsWidths[index + 1],
          isOverflow: false,
          isFrozen: true,
        };
      }
      // 0列目以外はisFrozenとisLastFrozenはfalseにする
      return {
        columnId: index,
        columnName: item,
        columnIndex: index + 2,
        columnWidth: newColsWidths[index + 1],
        isOverflow: false,
        isFrozen: false,
      };
    });
    // console.log(`初回ヘッダー生成 初期カラム配列`, tempFirstColumnItemListArray);
    console.log(`初回ヘッダー生成 初期カラム配列`, filteredArrayOmitId);
    console.log(`初回ヘッダー生成 整形後カラム配列`, firstColumnItemListArray);
    setColumnHeaderItemList(firstColumnItemListArray);
    // isFrozenがtrueの個数をRefに格納
    isFrozenCountRef.current = firstColumnItemListArray.filter((obj) => obj.isFrozen === true).length;

    // ================ ✅ローカルストレージにも更新後のカラムリストを保存 ================
    const columnHeaderItemListJSON = JSON.stringify(firstColumnItemListArray);
    localStorage.setItem("grid_columns_companies", columnHeaderItemListJSON);
    // localStorage.setItem("grid_columns_contacts", columnHeaderItemListJSON);
    // ================ ✅ローカルストレージにも更新後のカラムリストを保存 ここまで ================
  }, [gotData]); // gotDataのstateがtrueになったら再度実行
  // ========================== ✅useEffect ヘッダーカラム生成✅ ここまで ==========================

  // ================================== 🌟マウスイベント 列サイズ変更🌟 ==================================
  const handleMouseDown = (e: React.MouseEvent, index: number) => {
    e.preventDefault();

    // 🔸カーソルをリサイズに変更(カラムヘッダー全てにis_resizingクラスを付与)
    if (colsRef.current) {
      colsRef.current.forEach((header) => {
        if (header instanceof HTMLDivElement) {
          header.classList.add(`${styles.is_resizing}`);
        }
      });
    }

    if (!parentGridScrollContainer.current) return;
    const gridContainer = parentGridScrollContainer.current;
    // ドラッグ中の列と同じ列全てのborder-right-colorをハイライトする
    const colsLine = gridContainer.querySelectorAll(`[role=row] [aria-colindex="${index + 2}"]`);
    colsLine.forEach((col) => {
      if (col instanceof HTMLDivElement) {
        // col.style.borderRightColor = `#24b47e`;
        col.classList.add(`${styles.is_dragging}`);
      }
    });

    const startX = e.pageX;
    const startWidth = colsRef.current[index + 1]?.getBoundingClientRect().width || 0;

    console.log("handleMouseDown", startX, startWidth);

    const handleMouseUp = () => {
      console.log("マウスアップ✅✅✅✅✅✅✅ ");
      // 🔸カーソルを元に戻す(カラムヘッダー全てにis_resizingクラスを削除)
      if (colsRef.current) {
        colsRef.current.forEach((header) => {
          if (header instanceof HTMLDivElement) {
            header.classList.remove(`${styles.is_resizing}`);
          }
        });
      }

      const gridScrollContainer = parentGridScrollContainer.current;
      if (!gridScrollContainer) return;
      // ドラッグ中の列と同じ列全てのborder-right-colorをハイライトを元のボーダーカラーに戻す
      const colsLine = gridScrollContainer.querySelectorAll(`[role=row] [aria-colindex="${index + 2}"]`);
      colsLine.forEach((col) => {
        if (col instanceof HTMLDivElement) {
          // col.style.borderRightColor = `#444`;
          col.classList.remove(`${styles.is_dragging}`);
        }
      });

      setColsWidth(currentColsWidths.current);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);

      // ================ columnHeaderItemListも合わせてサイズを更新 テスト ================
      let newColumnHeaderItemList: any[] = [];
      const copyColumnHeaderItemList = [...columnHeaderItemList];
      copyColumnHeaderItemList.forEach((item) => {
        item.columnWidth = currentColsWidths.current[item.columnIndex - 1];
        newColumnHeaderItemList.push(item);
        // return item;
      });
      console.log("🌟🔥 newColumnHeaderItemList", newColumnHeaderItemList);
      setColumnHeaderItemList(newColumnHeaderItemList);
      // ================ columnHeaderItemListも合わせてサイズを更新 テスト ================

      // // =============== フローズン用 各カラムのLeft位置、レフトポジションを取得 ===============
      // colsWidth ['65px', '100px', '250px', '250px', '250px', '250px', '250px', '250px']から
      // accumulatedLeftPosition:  [65, 165, 415, 665, 915, 1165, 1415, 1665]
      // if (!colsWidth) return;
      // 現在のcolsWidthをコピー
      //   const widthArray = JSON.parse(JSON.stringify(colsWidth));
      const widthArray = JSON.parse(JSON.stringify(currentColsWidths.current));

      // 各要素の累積和を計算し、新しい配列を作る
      const accumulatedArray = widthArray.reduce((acc: number[], value: string) => {
        // parseIntを使って数値部分を抽出する
        const number = parseInt(value, 10);
        // 配列の最後の要素（現在の累積和）に数値を加える
        const newSum = acc.length > 0 ? acc[acc.length - 1] + number : number;
        // 新しい累積和を配列に追加する
        acc.push(newSum);
        return acc;
      }, []);
      // [65, 165, 415, 665, 915, 1165, 1415, 1665]
      // refオブジェクトにレフトポジションを格納
      columnLeftPositions.current = accumulatedArray;
      console.log("列サイズ変更 レフトポジション accumulatedArray", accumulatedArray);
      // ===================================================== 🔥テスト フローズンカスタムプロパティ
      const filteredIsFrozenList = newColumnHeaderItemList.filter((item) => item.isFrozen === true);
      filteredIsFrozenList.forEach((item, index) => {
        parentGridScrollContainer.current!.style.setProperty(`--frozen-left-${index}`, `${accumulatedArray[index]}px`);
      });
      // ===================================================== 🔥テスト フローズンカスタムプロパティ
      // // =============== フローズン用 各カラムのLeft位置、レフトポジションを取得 ここまで ===============

      // 🌟3点リーダーがtrueになったらカラムホバー時にツールチップを表示
      const targetText = columnHeaderInnerTextRef.current[index] as HTMLDivElement;
      console.log(
        "列サイズ変更 3点リーダーがtrueになったらカラムホバー時にツールチップを表示 カラムヘッダーインナーテキスト",
        columnHeaderInnerTextRef.current[index]?.scrollWidth,
        columnHeaderInnerTextRef.current[index]?.clientWidth,
        targetText.scrollWidth > targetText.clientWidth,
        targetText
      );
      if (targetText.scrollWidth > targetText.clientWidth) {
        // if (isOverflowColumnHeader.includes(colsRef.current[index]!.ariaColIndex))
        if ((newColumnHeaderItemList as ColumnHeaderItemList[])[index].isOverflow)
          return console.log("既にオンのためリターン");
        (newColumnHeaderItemList as ColumnHeaderItemList[])[index].isOverflow = true;

        // if (isOverflowColumnHeader.includes(colsRef.current[index]!.dataset.columnId!.toString()))
        //   return console.log("既にオンのためリターン");
        // 3点リーダーがオンの時
        // setIsOverflowColumnHeader((prevArray) => {
        //   console.log("targetText", targetText);
        //   const newArray = [...prevArray];
        //   newArray.push(colsRef.current[index]!.dataset.columnId!.toString());
        //   return newArray;
        // });
      } else {
        // 3点リーダーがオフの時
        (newColumnHeaderItemList as ColumnHeaderItemList[])[index].isOverflow = false;

        // setIsOverflowColumnHeader((prevArray) => {
        //   console.log("targetText", targetText);
        //   const newArray = [...prevArray];
        //   console.log("🌟ここ", newArray, colsRef.current[index]!.dataset.columnId!.toString());
        //   const filteredArray = newArray.filter(
        //     (item) => item !== colsRef.current[index]!.dataset.columnId!.toString()
        //   );
        //   return filteredArray;
        // });
      }
      // ================ ✅ローカルストレージにも更新後のカラムリストを保存 ================
      const columnHeaderItemListJSON = JSON.stringify(newColumnHeaderItemList);
      localStorage.setItem("grid_columns_companies", columnHeaderItemListJSON);
      // localStorage.setItem("grid_columns_contacts", columnHeaderItemListJSON);
      // ================ ✅ローカルストレージにも更新後のカラムリストを保存 ここまで ================
    };

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const newWidth = e.pageX - colsRef.current[index]!.getBoundingClientRect().left;
      console.log("newWidth", newWidth);
      console.log("currentColsWidths.current", currentColsWidths.current);
      if (colsWidth === null) return;
      const newColsWidths = [...colsWidth];
      // const newColsWidths = [...currentColsWidths.current];
      newColsWidths[index + 1] = Math.max(newWidth, 50) + "px";
      // gridコンテナのCSSカスタムプロパティに新たなwidthを設定したwidthsをセット
      parentGridScrollContainer.current!.style.setProperty("--template-columns", `${newColsWidths.join(" ")}`);
      // setColsWidth(newColsWidths);
      currentColsWidths.current = newColsWidths;

      console.log("newColsWidths", newColsWidths);
      console.log(
        "更新後--template-columns",
        parentGridScrollContainer.current!.style.getPropertyValue("--template-columns")
      );

      // 列の合計値をセット
      // newColsWidthの各値のpxの文字を削除
      // ['65px', '100px', '250px', '250px', '250px', '250px']から
      // ['65', '100', '250', '250', '250', '250']へ置換
      const newColsWidthNum = newColsWidths.map((col) => {
        return col.replace("px", "");
      });

      // それぞれのカラムの合計値を取得 +aで文字列から数値型に変換して合計値を取得
      let sumRowWidth = newColsWidthNum.reduce((a, b) => {
        return +a + +b;
      }, 0);
      parentGridScrollContainer.current!.style.setProperty("--row-width", `${sumRowWidth}px`);
      console.log("更新後--row-width", parentGridScrollContainer.current!.style.getPropertyValue("--row-width"));

      // // =============== フローズン用 各カラムのLeft位置、レフトポジションを取得 ===============
      // colsWidth ['65px', '100px', '250px', '250px', '250px', '250px', '250px', '250px']から
      // accumulatedLeftPosition:  [65, 165, 415, 665, 915, 1165, 1415, 1665]
      // if (!colsWidth) return;
      // 現在のcolsWidthをコピー
      //   const widthArrayMove = JSON.parse(JSON.stringify(newColsWidths));
      const widthArrayMove = JSON.parse(JSON.stringify(currentColsWidths.current));

      // 各要素の累積和を計算し、新しい配列を作る
      const accumulatedArrayMove = widthArrayMove.reduce((acc: number[], value: string) => {
        // parseIntを使って数値部分を抽出する
        const number = parseInt(value, 10);
        // 配列の最後の要素（現在の累積和）に数値を加える
        const newSum = acc.length > 0 ? acc[acc.length - 1] + number : number;
        // 新しい累積和を配列に追加する
        acc.push(newSum);
        return acc;
      }, []);
      // [65, 165, 415, 665, 915, 1165, 1415, 1665]
      // refオブジェクトにレフトポジションを格納
      columnLeftPositions.current = accumulatedArrayMove;
      console.log("columnLeftPositions.current", columnLeftPositions.current);
      // ===================================================== 🔥テスト フローズンカスタムプロパティ
      const filteredIsFrozenList = columnHeaderItemList.filter((item) => item.isFrozen === true);
      filteredIsFrozenList.forEach((item, index) => {
        parentGridScrollContainer.current!.style.setProperty(
          `--frozen-left-${index}`,
          `${accumulatedArrayMove[index]}px`
        );
      });
      // ===================================================== 🔥テスト フローズンカスタムプロパティ
      // =============== フローズン用 各カラムのLeft位置、レフトポジションを取得 ここまで ===============
    };

    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);
  };
  // ============================== ✅マウスイベント 列サイズ変更✅ ここまで ==============================

  // ====================== 🌟１行目と２行目のインラインスタイルのleftに渡す用の関数 ======================
  const columnHeaderLeft = (index: number) => {
    // indexが0のid列は65pxでreturn
    // if (index === 0) return 65;
    // console.log("✅ フローズンの個数isFrozenCountRef.current", isFrozenCountRef.current);
    // console.log("✅ レフトポジションcolumnLeftPositions.current", columnLeftPositions.current);
    // isFrozenがtrueなら
    if (columnHeaderItemList[index].isFrozen) {
      return columnLeftPositions.current[index];
    }

    // console.log("レフト計算関数 widthArray", widthArray);
    // // コピーした配列から現在isFrozenがtrueのwidthを先頭から個数分取得
    // const isFrozenCountWidthArray = widthArray.slice(0, isFrozenCountRef.current);
    // console.log("レフト計算関数 isFrozenCountWidthArray", isFrozenCountWidthArray);
    // // 各要素を数値に変換し、それらの合計を計算して取得
    // const TotalWidth = isFrozenCountWidthArray.reduce((sum: number, value: string) => {
    //   // parseIntを使って数値部分のみを10進法の形で抽出して取得する
    //   const number = parseInt(value, 10);
    //   return sum + number;
    // }, 0);

    // switch (index) {
    //   case 0:
    //     return 65;
    //   case 1:
    //     return 65;
    //   default:
    //     // if ()
    //     null;
    //     break;
    // }
    // switch (index) {
    //   case 0:
    //     return 0;
    //     break;
    //   case 1:
    //     return 65;
    //   default:
    //     // if ()
    //     null;
    //     break;
    // }
  };
  // ========= ✅１行目と２行目のインラインスタイルのleftに渡す用の関数✅ ここまで =========

  // ========= 🌟各Grid行トラックのtopからの位置を返す関数 インラインスタイル内で実行 =========
  const gridRowTrackTopPosition = (index: number) => {
    // const topPosition = ((index + 1) * 35).toString() + "px";
    const topPosition = ((index + 1) * 30).toString() + "px";
    console.log("topPosition", topPosition);
    return topPosition;
  };
  // ================================================================

  // ================== 🌟セル シングルクリック、ダブルクリックイベント ==================
  // ================== 🌟GridCellクリックでセルを選択中アクティブセルstateに更新🌟 ==================
  const setTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const setIsOpenEditModal = useDashboardStore((state) => state.setIsOpenEditModal);
  const setTextareaInput = useDashboardStore((state) => state.setTextareaInput);
  const [clickedActiveRow, setClickedActiveRow] = useState<number | null>(null);
  // ================= 🔥🔥テスト🔥🔥==================
  const selectedRowDataCompany = useDashboardStore((state) => state.selectedRowDataCompany);
  const setSelectedRowDataCompany = useDashboardStore((state) => state.setSelectedRowDataCompany);
  // ================= 🔥🔥テスト🔥🔥==================

  const handleClickGridCell = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (setTimeoutRef.current !== null) return;

      setTimeoutRef.current = setTimeout(() => {
        setTimeoutRef.current = null;
        // シングルクリック時に実行したい処理
        // 0.2秒後に実行されてしまうためここには書かない
      }, 200);

      console.log("シングルクリック");
      // すでにselectedセル(アクティブセル)のrefが存在するなら、一度aria-selectedをfalseに変更
      if (selectedGridCellRef.current?.getAttribute("aria-selected") === "true") {
        // 保持していたアクティブセルを前回のアクティブセルprevSelectedGridCellRefに格納
        prevSelectedGridCellRef.current = selectedGridCellRef.current;

        selectedGridCellRef.current.setAttribute("aria-selected", "false");
        selectedGridCellRef.current.setAttribute("tabindex", "-1");
      }
      // クリックしたセルの属性setAttributeでクリックしたセルのaria-selectedをtrueに変更
      e.currentTarget.setAttribute("aria-selected", "true");
      e.currentTarget.setAttribute("tabindex", "0");

      // クリックしたセルを新たなアクティブセルとしてrefに格納して更新
      selectedGridCellRef.current = e.currentTarget;
      setActiveCell(e.currentTarget);

      console.log(
        `前回アクティブセルの行と列: ${prevSelectedGridCellRef.current?.ariaColIndex}, ${prevSelectedGridCellRef.current?.parentElement?.ariaRowIndex}, 今回アクティブの行と列: ${selectedGridCellRef.current?.ariaColIndex}, ${selectedGridCellRef.current?.parentElement?.ariaRowIndex}`
      );
      // クリックした列を選択中の状態の色に変更する aria-selectedをtrueにする
      if (typeof selectedGridCellRef.current?.parentElement?.ariaRowIndex === "undefined") return;
      if (Number(selectedGridCellRef.current?.parentElement?.ariaRowIndex) === 1) {
        setClickedActiveRow(null);
        return;
      }
      setClickedActiveRow(Number(selectedGridCellRef.current?.parentElement?.ariaRowIndex));
      // クリックした列要素の列データをZustandに挿入 indexは0から rowIndexは2から
      setSelectedRowDataCompany(allRows[Number(selectedGridCellRef.current?.parentElement?.ariaRowIndex) - 2]);
    },
    [allRows]
  );

  // セルダブルクリック
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, index: number, columnName: string) => {
      console.log("ダブルクリック index", index);
      if (columnName === "id") return console.log("ダブルクリック idのためリターン");
      // if (index === 0) return console.log("リターン");
      if (setTimeoutRef.current) {
        clearTimeout(setTimeoutRef.current);

        // console.log(e.detail);
        setTimeoutRef.current = null;
        // ダブルクリック時に実行したい処理
        console.log("ダブルクリック", e.currentTarget);
        // クリックした要素のテキストを格納
        // const text = e.currentTarget.innerText;
        const text = e.currentTarget.innerHTML;
        setTextareaInput(text);
        setIsOpenEditModal(true);
      }
    },
    [allRows]
  );
  // ================== ✅GridCellクリックでセルを選択中アクティブセルstateに更新✅ ここまで ==================

  // ======================== 🌟セル選択時に上下矢印キーでセルを上下に移動可能にする🌟 ========================
  // 1. スクロールコンテナのRefを作成：スクロールコンテナのDOM要素にアクセスするために、useRefを使用してRefオブジェクトを作成します。
  // 2. キーボードイベントの処理を更新：上下矢印キーが押された際に、スクロールコンテナのスクロール位置を更新するロジックを追加します。
  // 3. スクロール位置の調整：選択中のセルが移動した際に、スクロールコンテナのスクロール位置を30px分(セルheight分)移動させます。

  // 1. rowgroupコンテナ => gridRowGroupContainerRef
  // 2.
  // キーダウン関数
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // アクティブセルStateがnull、または、選択中のセルのaria-selectedがtrueでないならリターン
    if (activeCell === null) return console.log("セルが選択されていないためリターン", activeCell);
    if (selectedGridCellRef.current?.getAttribute("aria-selected") !== "true")
      return console.log("aria-selectedがtrueではないためリターン", selectedGridCellRef);

    // 選択中のセルのRowノード取得：giridcellの親要素ノードのroleがrowのdivタグ
    const currentSelectedRow = e.currentTarget.parentElement;
    if (!currentSelectedRow) return console.log("選択中のセルの親Rowノード取得できずリターン");
    // 選択中のセルのRowのaria-rowindexを取得
    const ariaRowIndexAttr = currentSelectedRow.getAttribute("aria-rowindex");
    if (ariaRowIndexAttr === null) return console.log("ariaRowIndexが取得できないためリターン");
    // aria-rowindexを数値に変換, 基数に10進数を渡す、第一引数にnullが渡ったらNaNが返るので、inNaN()関数でチェック
    const ariaRowIndex = parseInt(ariaRowIndexAttr, 10);
    if (isNaN(ariaRowIndex)) return console.log("ariaRowIndex数値変換できずリターン");

    // キーダウンが上矢印か下矢印かチェック
    // 🔹キーボードイベントが上矢印キー、かつ、選択中のセルのRowの上にまだRowノードが存在する時のみ実行
    if (e.key === "ArrowUp") {
      console.log("上矢印キーダウン ariaRowIndex", ariaRowIndex);
      // 列順を表すaria-rowindexが2(rowgroupの一番上)で上矢印キーが押された場合、それ以上上にはいけないのでリターンする
      if (ariaRowIndex === 2) return console.log("リターン: rowgroupの一番上です", ariaRowIndex, currentSelectedRow, e);
      if (!currentSelectedRow.previousElementSibling)
        return console.log("リターン: 上のRowが存在しません", currentSelectedRow.previousElementSibling);
      // 流れ：選択中のセルをprevSelectedGridCellRefに格納してから、選択中のセルのRowのaria-rowindexを−１した値のRowノードを取得し、そのRowノードから選択中のセルと同じaria-colindexのセルノードを取得してactiveCellとselectedGridCellRef.currentに格納する
      // 1. 保持していたアクティブセルを前回のアクティブセルprevSelectedGridCellRefに格納
      // 1-2. まずはaria-selected, tabindexを初期化
      selectedGridCellRef.current.setAttribute("aria-selected", "false");
      selectedGridCellRef.current.setAttribute("tabindex", "-1");
      prevSelectedGridCellRef.current = selectedGridCellRef.current;
      // 2. 選択中のセルのRowのaria-rowindexを−１した(上に移動した)値のRowノードを取得
      const upRowElement = currentSelectedRow.previousElementSibling;
      if (!upRowElement) return console.log("上の行データ無しのためリターン");
      // 選択中のセルのariaColIndexを取得
      const targetAriaColIndex = selectedGridCellRef.current.getAttribute("aria-colindex");
      if (!targetAriaColIndex) return console.log("ariaColIndexが取得できないためリターン");
      // 3. Rowノードから選択中のセルと同じaria-colindexのセルノードを取得
      const targetCell = upRowElement.querySelector(`[aria-colindex="${targetAriaColIndex}"`);
      if (!(targetCell instanceof HTMLDivElement))
        return console.log("リターン：一つ上のtargetCellがHTMLDivElementではありません"); // nullでないことと同時にHTMLDivElementであることも同時に確認
      // 5-1. 現在選択中のセルを非選択状態に変更
      // selectedGridCellRef.current.setAttribute("aria-selected", "false");
      // selectedGridCellRef.current.setAttribute("tabindex", "-1");
      // 5-1. 上矢印キーダウンで移動した先のセルの属性setAttributeでクリックしたセルのaria-selectedをtrueに変更
      targetCell.setAttribute("aria-selected", "true");
      targetCell.setAttribute("tabindex", "0"); // tabindexを0にすることでフォーカス可能にしてキーボードイベントのターゲットにする
      targetCell.focus(); // focusをセルに当て直さないと最初のクリックしたセルでonKeyDown()が発火してしまうため新たなセルにフォーカスする
      // 4. 取得したセルノードをactiveCellとselectedGridCellRef.currentに格納する => 新たなアクティブセルとしてrefに格納して更新
      selectedGridCellRef.current = targetCell;
      setActiveCell(selectedGridCellRef.current);

      // 移動した上のRowを選択中の状態の色に変更する aria-selectedをtrueにする
      if (!selectedGridCellRef.current?.parentElement?.ariaRowIndex)
        return console.log("リターン: 上に移動したセルのRowが存在しません");
      if (Number(selectedGridCellRef.current?.parentElement?.ariaRowIndex) === 1) {
        setClickedActiveRow(null);
        return console.log("リターン: 選択中のセルがヘッダーRowのためリターン");
      }
      // 選択中のRowのindexを移動したセルのRowのaria-rowindexに変更する
      // setClickedActiveRow(Number(selectedGridCellRef.current?.parentElement?.ariaRowIndex));
      setClickedActiveRow(Number(selectedGridCellRef.current.parentElement?.ariaRowIndex));
      // 移動した先のRow要素のRowデータをZustandに挿入 -2は、indexは0から rowIndexは2から始まるため、ヘッダーRowのaria-rowindexが1
      // setSelectedRowDataCompany(allRows[Number(selectedGridCellRef.current?.parentElement?.ariaRowIndex) - 2]);
      setSelectedRowDataCompany(allRows[Number(selectedGridCellRef.current.parentElement?.ariaRowIndex) - 2]);

      // セルを移動後にrowgroupのコンテナを上に30pxスクロールする
      // console.log("gridRowGroupContainerRef.current", gridRowGroupContainerRef.current);
      parentGridScrollContainer.current?.scrollBy(0, -30); // 上に30px分スクロール

      console.log(
        `前回アクティブセルの列と行: ${prevSelectedGridCellRef.current?.ariaColIndex}, ${prevSelectedGridCellRef.current?.parentElement?.ariaRowIndex}, 今回アクティブの列と行: ${selectedGridCellRef.current?.ariaColIndex}, ${selectedGridCellRef.current?.parentElement?.ariaRowIndex}`
      );
      return;
    }
    // 🔹キーボードイベントが下矢印キー、かつ、選択中のセルのRowの下にまだRowノードが存在する時のみ実行
    else if (e.key === "ArrowDown") {
      console.log("下矢印キーダウン ariaRowIndex", ariaRowIndex);
      // 列順を表すaria-rowindexが2(rowgroupの一番上)で上矢印キーが押された場合、それ以上上にはいけないのでリターンする
      if (!currentSelectedRow.nextElementSibling)
        return console.log("リターン: 下のRowが存在しません", currentSelectedRow.nextElementSibling);
      // 流れ：選択中のセルをprevSelectedGridCellRefに格納してから、選択中のセルのRowのaria-rowindexを−１した値のRowノードを取得し、そのRowノードから選択中のセルと同じaria-colindexのセルノードを取得してactiveCellとselectedGridCellRef.currentに格納する
      // 1. 保持していたアクティブセルを前回のアクティブセルprevSelectedGridCellRefに格納
      // 1-2. まずはaria-selected, tabindexを初期化
      selectedGridCellRef.current.setAttribute("aria-selected", "false");
      selectedGridCellRef.current.setAttribute("tabindex", "-1");
      prevSelectedGridCellRef.current = selectedGridCellRef.current;
      // 2. 選択中のセルのRowのaria-rowindexを−１した(下に移動した)値のRowノードを取得
      const downRowElement = currentSelectedRow.nextElementSibling;
      if (!downRowElement) return console.log("下の行データ無しのためリターン");
      // 選択中のセルのariaColIndexを取得
      const targetAriaColIndex = selectedGridCellRef.current.getAttribute("aria-colindex");
      if (!targetAriaColIndex) return console.log("ariaColIndexが取得できないためリターン");
      // 3. Rowノードから選択中のセルと同じaria-colindexのセルノードを取得
      const targetCell = downRowElement.querySelector(`[aria-colindex="${targetAriaColIndex}"`);
      if (!(targetCell instanceof HTMLDivElement))
        return console.log("リターン：一つ下のtargetCellがHTMLDivElementではありません"); // nullでないことと同時にHTMLDivElementであることも同時に確認
      // 5-1. 現在選択中のセルを非選択状態に変更
      // selectedGridCellRef.current.setAttribute("aria-selected", "false");
      // selectedGridCellRef.current.setAttribute("tabindex", "-1");
      // 5-1. 下矢印キーダウンで移動した先のセルの属性setAttributeでクリックしたセルのaria-selectedをtrueに変更
      targetCell.setAttribute("aria-selected", "true");
      targetCell.setAttribute("tabindex", "0"); // tabindexを0にすることでフォーカス可能にしてキーボードイベントのターゲットにする
      targetCell.focus(); // focusをセルに当て直さないと最初のクリックしたセルでonKeyDown()が発火してしまうため新たなセルにフォーカスする
      // 4. 取得したセルノードをactiveCellとselectedGridCellRef.currentに格納する => 新たなアクティブセルとしてrefに格納して更新
      selectedGridCellRef.current = targetCell;
      setActiveCell(selectedGridCellRef.current);

      // 移動した下のRowを選択中の状態の色に変更する aria-selectedをtrueにする
      if (!selectedGridCellRef.current?.parentElement?.ariaRowIndex)
        return console.log("リターン: 下に移動したセルのRowが存在しません");
      if (Number(selectedGridCellRef.current?.parentElement?.ariaRowIndex) === 1) {
        setClickedActiveRow(null);
        return console.log("リターン: 選択中のセルがヘッダーRowのためリターン");
      }
      // 選択中のRowのindexを移動したセルのRowのaria-rowindexに変更する
      // setClickedActiveRow(Number(selectedGridCellRef.current?.parentElement?.ariaRowIndex));
      setClickedActiveRow(Number(selectedGridCellRef.current.parentElement?.ariaRowIndex));
      // 移動した先のRow要素のRowデータをZustandに挿入 -2は、indexは0から rowIndexは2から始まるため、ヘッダーRowのaria-rowindexが1
      // setSelectedRowDataCompany(allRows[Number(selectedGridCellRef.current?.parentElement?.ariaRowIndex) - 2]);
      setSelectedRowDataCompany(allRows[Number(selectedGridCellRef.current.parentElement?.ariaRowIndex) - 2]);

      // セルを移動後にrowgroupのコンテナを下に30pxスクロールする
      // console.log("gridRowGroupContainerRef.current", gridRowGroupContainerRef.current);
      parentGridScrollContainer.current?.scrollBy(0, 30); // 下に30px分スクロール

      console.log(
        `前回アクティブセルの列と行: ${prevSelectedGridCellRef.current?.ariaColIndex}, ${prevSelectedGridCellRef.current?.parentElement?.ariaRowIndex}, 今回アクティブの列と行: ${selectedGridCellRef.current?.ariaColIndex}, ${selectedGridCellRef.current?.parentElement?.ariaRowIndex}`
      );
      return;
    } else {
      return console.log(
        "リターン: キーダウンイベント上下矢印キーではないためリターン",
        e.key,
        "currentSelectedRow.previousElementSibling",
        currentSelectedRow.previousElementSibling,
        "currentSelectedRow.nextElementSibling",
        currentSelectedRow.nextElementSibling
      );
    }
  };
  // ======================== ✅セル選択時に上下矢印キーでセルを上下に移動可能にする✅ ========================

  // ==================== 🌟チェックボックスクリックでstateに選択したアイテムのidを追加🌟 ====================
  // ================= 🔥🔥テスト🔥🔥==================
  // const handleSelectedCheckBox = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
  const handleSelectedCheckBox = (e: React.ChangeEvent<HTMLInputElement>, index: string) => {
    // ================= 🔥🔥テスト🔥🔥==================
    console.log("🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥テスト index", index);
    console.log(
      "前回のアクティブセル親列RowトラックのRowIndex",
      prevSelectedGridCellRef.current?.parentElement?.ariaRowIndex
    );
    console.log("今回のアクティブセル親列トラックのRowIndex", selectedGridCellRef.current?.parentElement?.ariaRowIndex);
    const targetRowIndex = e.target.parentElement?.parentElement?.parentElement?.ariaRowIndex;
    console.log("handleSelectedCheckBox targetRowIndex", targetRowIndex);

    const gridScrollContainer = parentGridScrollContainer.current;
    if (!gridScrollContainer) return;

    // PointerEventsを明示することでtypescriptのエラー回避
    if (e.nativeEvent instanceof PointerEvent) {
      // ================ ルート１：そのままチェック (シフトキーがfalseの場合) ======================
      if (e.nativeEvent.shiftKey === false) {
        let newSelectedCheckBoxArray = [...selectedCheckBox];
        // ======= ルート１ー１ チェックした時
        if (e.target.checked === true) {
          // ================= 🔥🔥テスト🔥🔥ここから==================
          newSelectedCheckBoxArray.push(index);
          // newSelectedCheckBoxArray.sort((a, b) => a - b);
          newSelectedCheckBoxArray.sort((a, b) => +a - +b);
          // ================= 🔥🔥テスト🔥🔥ここまで==================
          setSelectedCheckBox(newSelectedCheckBoxArray);
          // チェックされた行をハイライト
          // const selectedRow = document.querySelector(`[aria-rowindex="${id + 1}"]`);
          const selectedRow = gridScrollContainer.querySelector(`[role=row][aria-rowindex="${targetRowIndex}"]`);
          selectedRow?.setAttribute(`aria-selected`, "true");
          // チェックした行要素Rowのチェック有無をStateに更新
          // ================= 🔥🔥テスト🔥🔥ここから==================
          setCheckedRows((prev) => ({
            ...prev,
            [index]: true, // プロパティ名に変数を指定するにはブラケット記法を使用する
          }));
          // setCheckedRows((prev) => ({
          //   ...prev,
          //   [id]: true, // プロパティ名に変数を指定するにはブラケット記法を使用する
          // }));
          // ================= 🔥🔥テスト🔥🔥ここまで==================
        }
        // ======= ルート１−２ チェックが外れた時
        else {
          // ================= 🔥🔥テスト🔥🔥ここから==================
          // const filteredArray = newSelectedCheckBoxArray.filter((itemId) => itemId !== id);
          const filteredArray = newSelectedCheckBoxArray.filter((itemId) => itemId !== index);
          filteredArray.sort((a, b) => +a - +b);
          // filteredArray.sort((a, b) => a - b);
          // ================= 🔥🔥テスト🔥🔥ここまで==================
          setSelectedCheckBox(filteredArray);
          // チェックでハイライトされた行を戻す
          // const selectedRow = document.querySelector(`[aria-rowindex="${id + 1}"]`);
          const selectedRow = gridScrollContainer.querySelector(`[role=row][aria-rowindex="${targetRowIndex}"]`);
          selectedRow?.setAttribute(`aria-selected`, "false");
          // チェックが外れた行要素Rowのチェック有無をStateに更新
          // ================= 🔥🔥テスト🔥🔥ここから==================
          // setCheckedRows((prev) => ({
          //   ...prev,
          //   [id]: false, // プロパティ名に変数を指定するにはブラケット記法を使用する
          // }));
          setCheckedRows((prev) => ({
            ...prev,
            [index]: false, // プロパティ名に変数を指定するにはブラケット記法を使用する
          }));
          // ================= 🔥🔥テスト🔥🔥ここまで==================
        }
      }

      // ====================== ルート２：シフトキーが押された状態でチェック ======================
      else {
        // ルート２−１ シフトキーが押された状態で、かつチェックが入っておらず今回チェックを入れた場合のルート
        if (e.target.checked === true) {
          // もし他のチェックボックスのセルがaria-selected=trueで選択中となっているならば
          // クリックしたチェックボックスと前回アクティブだったチェックボックスのセルとの間のチェックボックスを全てtrueにかえる
          // まずはgridcellのcolindexが1のセルを全て取得
          const checkBoxCells = gridScrollContainer.querySelectorAll('[role=gridcell][aria-colindex="1"]');
          console.log("シフト有りクリック");
          // 前回のアクティブセルがcheckboxのセルで、かつ、シフトキーを押された状態でチェックされたら
          if (prevSelectedGridCellRef.current?.ariaColIndex === "1") {
            // 前回のアクティブセルの親のRowIndexと今回チェックしたセルの親のRowIndexまでを全てtrueに変更
            if (!prevSelectedGridCellRef.current?.parentElement?.ariaRowIndex)
              return console.log("prevアクティブセル無し リターン");
            if (!selectedGridCellRef.current?.parentElement?.ariaRowIndex)
              return console.log("アクティブセル無し リターン");
            // 前回と今回の行インデックスで小さい値を取得(セルの親要素をparentElementでアクセス)
            const minNum = Math.min(
              +prevSelectedGridCellRef.current?.parentElement?.ariaRowIndex,
              +selectedGridCellRef.current?.parentElement?.ariaRowIndex
            );
            // 前回と今回の行インデックスのを小さい値を取得(セルの親要素をparentElementでアクセス)
            const maxNum = Math.max(
              +prevSelectedGridCellRef.current?.parentElement?.ariaRowIndex,
              +selectedGridCellRef.current?.parentElement?.ariaRowIndex
            );
            console.log(`行インデックス最小値${minNum}, 最大値${maxNum}`);

            // チェック列Stateを複数選択した列で更新
            setCheckedRows((prevState) => {
              const newState = Object.entries(prevState).reduce((acc: Record<string, boolean>, [key, value]) => {
                // checkedRowsは0から値が始まり、RowGroupのrowIndexは2行目からなのでstateに2を加算する
                const rowIndex = +key + 2;
                if (minNum <= rowIndex && rowIndex <= maxNum) {
                  acc[key] = true; // チェックを入れたtrueのルートなのでtrueにする
                  // acc[key] = !value;
                } else {
                  acc[key] = value; // シフトキーで選択されていないキーはそのままのvalueで返す
                }
                return acc;
              }, {});
              console.log("🔥newState", newState);
              return newState;
            });

            // SelectedCheckBoxを現在選択中のチェックボックスに反映
            const currentCheckId = Object.entries(checkedRows).reduce((acc: Record<string, boolean>, [key, value]) => {
              // checkedRowsは0から値が始まり、RowGroupのrowIndexは2行目からなのでstateに2を加算する
              const rowIndex = +key + 2;
              if (minNum <= rowIndex && rowIndex <= maxNum) {
                acc[key] = true; // チェックを入れたtrueのルートなのでtrueにする
              }
              // selectedCheckBoxは選択中のidのみなので、チェックしたkeyとvalueのみを返す
              return acc;
            }, {});
            // {0: true, 1: true...}からキーのみを取得して配列を生成
            const keys = Object.keys(currentCheckId);
            // idが数値型の場合にはキーを数値型に変換
            // ================= 🔥🔥テスト🔥🔥==================
            // let newSelectedCheck: number[] = [];
            let newSelectedCheck: string[] = [];
            // ================= 🔥🔥テスト🔥🔥==================
            // ================= 🔥🔥テスト🔥🔥==================
            // keys.forEach((item) => newSelectedCheck.push(Number(item)));
            keys.forEach((item) => newSelectedCheck.push(item));
            // ================= 🔥🔥テスト🔥🔥==================
            // 選択中の行要素を保持するstateを更新
            const copySelectedCheckBox = [...selectedCheckBox];
            // 元々のチェックしているStateと新しくチェックした配列を結合
            const combinedArray = [...newSelectedCheck, ...copySelectedCheckBox];
            // 重複した値を一意にする
            const uniqueArray = [...new Set(combinedArray)];
            // idが数値の場合には順番をソートする
            // ================= 🔥🔥テスト🔥🔥==================
            // uniqueArray.sort((a, b) => a - b);
            // ================= 🔥🔥テスト🔥🔥==================
            console.log("🔥ソート後 uniqueArray", uniqueArray);
            setSelectedCheckBox(uniqueArray);
          }
        }
        // ルート２−２ シフトキーが押された状態で、かつチェックが既に入っていて今回チェックをfalseにして複数チェックを外すルート
        else {
          const checkBoxCells = gridScrollContainer.querySelectorAll('[role=gridcell][aria-colindex="1"]');
          console.log("シフト有りクリック");
          // 前回のアクティブセルがcheckboxのセルで、シフトキーを押された状態でチェックが外されたら
          if (prevSelectedGridCellRef.current?.ariaColIndex === "1") {
            // 前回のアクティブセルの親のRowIndexと今回チェックしたセルの親のRowIndexまでを全てfalseに変更
            if (!prevSelectedGridCellRef.current?.parentElement?.ariaRowIndex)
              return console.log("prevアクティブセル無し リターン");
            if (!selectedGridCellRef.current?.parentElement?.ariaRowIndex)
              return console.log("アクティブセル無し リターン");
            // 前回と今回の行インデックスで小さい値を取得(セルの親要素をparentElementでアクセス)
            const minNum = Math.min(
              +prevSelectedGridCellRef.current?.parentElement?.ariaRowIndex,
              +selectedGridCellRef.current?.parentElement?.ariaRowIndex
            );
            // 前回と今回の行インデックスのを小さい値を取得(セルの親要素をparentElementでアクセス)
            const maxNum = Math.max(
              +prevSelectedGridCellRef.current?.parentElement?.ariaRowIndex,
              +selectedGridCellRef.current?.parentElement?.ariaRowIndex
            );
            console.log(`行インデックス最小値${minNum}, 最大値${maxNum}`);
            // ================ 🌟複数チェックを外す checkedRowsとselectedCheckBox ================
            // チェック列Stateを複数選択した列で更新
            setCheckedRows((prevState) => {
              const newState = Object.entries(prevState).reduce((acc: Record<string, boolean>, [key, value]) => {
                // checkedRowsは0から値が始まり、RowGroupのrowIndexは2行目からなのでstateに2を加算する
                const rowIndex = +key + 2;
                if (minNum <= rowIndex && rowIndex <= maxNum) {
                  acc[key] = false; // チェックを入れたtrueのルートなのでtrueにする
                  // acc[key] = !value;
                } else {
                  acc[key] = value; // シフトキーで選択されていないキーはそのままのvalueで返す
                }
                return acc;
              }, {});
              console.log("🔥setCheckedRows newState", newState);
              return newState;
            });

            // SelectedCheckBoxを現在選択中のチェックボックスに反映
            const unCheckId = Object.entries(checkedRows).reduce((acc: Record<string, boolean>, [key, value]) => {
              // checkedRowsは0から値が始まり、RowGroupのrowIndexは2行目からなのでstateに2を加算する
              const rowIndex = +key + 2;
              if (minNum <= rowIndex && rowIndex <= maxNum) {
                acc[key] = false; // チェックを外したfalseのルートなのでfalseにする
              }
              // selectedCheckBoxは選択中のidのみなので、チェックしたkeyとvalueのみを返す
              return acc;
            }, {});
            // {0: true, 1: true...}からキーのみを取得して配列を生成
            const unCheckedKeys = Object.keys(unCheckId);
            console.log("🔥 unCheckedKeys", unCheckedKeys);
            // idが数値型の場合にはキーを数値型に変換
            // ================= 🔥🔥テスト🔥🔥==================
            // let newUnCheckedIdArray: number[] = [];
            let newUnCheckedIdArray: string[] = [];
            // ================= 🔥🔥テスト🔥🔥==================
            // ================= 🔥🔥テスト🔥🔥==================
            // unCheckedKeys.forEach((item) => newUnCheckedIdArray.push(Number(item)));
            unCheckedKeys.forEach((item) => newUnCheckedIdArray.push(item));
            // ================= 🔥🔥テスト🔥🔥==================
            // 選択中の行要素を保持するstateを更新
            const copySelectedCheckBox = [...selectedCheckBox];
            console.log("🔥 copySelectedCheckBox", copySelectedCheckBox);
            // 範囲選択でチェックが外れたセルを全てフィルターで除外して新たな配列を生成してセレクトStateに格納
            const filteredNewArray = copySelectedCheckBox.filter((item) => {
              return !newUnCheckedIdArray.includes(item);
            });
            console.log("🔥 filteredNewArray 更新後", filteredNewArray);
            console.log("🔥 newUnCheckedIdArray 更新後", newUnCheckedIdArray);
            setSelectedCheckBox(filteredNewArray);
            // ================ 🌟複数チェックを外す checkedRowsとselectedCheckBox ここまで ================
          }
        }
      }
    }
  };
  // ================= ✅チェックボックスクリックでstateに選択したアイテムのidを追加✅ ここまで =================

  // ================================= 🌟チェックボックス全選択🌟 =================================
  // チェックボックスヘッダーのON/OFFで全てのチェックボックスをtrue/false切り替え後、全てのidを選択中stateに反映
  const handleAllSelectCheckBox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const gridScrollContainer = parentGridScrollContainer.current;
    if (!gridScrollContainer) return;

    // ============================= 全チェックした時 =============================
    if (e.target.checked === true) {
      // カラムヘッダーのチェックボックスStateをtrueに変更
      setCheckedColumnHeader(true);

      // 現在取得している総アイテムを全てtrueに変更
      setCheckedRows((prevState) => {
        console.log("Object.entries(prevState)", Object.entries(prevState));
        return Object.entries(prevState).reduce((acc: { [key: string]: boolean }, [key, value]) => {
          acc[key] = true;
          // acc[key] = !value;
          return acc;
        }, {});
      });

      // SelectedCheckBoxを全てのRowのIDを追加する
      const allCheckedIdArray = Object.entries(checkedRows).reduce((acc: Record<string, boolean>, [key, value]) => {
        acc[key] = true; // チェックを入れたtrueのルートなのでtrueにする
        return acc;
      }, {});
      // {0: true, 1: true...}からキーのみを取得して配列を生成
      const allKeys = Object.keys(allCheckedIdArray);
      // idが数値型の場合にはキーを数値型に変換
      // ================= 🔥🔥テスト🔥🔥==================
      // let newAllSelectedCheckArray: number[] = [];
      let newAllSelectedCheckArray: string[] = [];
      // ================= 🔥🔥テスト🔥🔥==================
      // ================= 🔥🔥テスト🔥🔥==================
      // allKeys.forEach((item) => newAllSelectedCheckArray.push(Number(item)));
      allKeys.forEach((item) => newAllSelectedCheckArray.push(item));
      // ================= 🔥🔥テスト🔥🔥==================
      // idが数値の場合には順番をソートする
      // ================= 🔥🔥テスト🔥🔥==================
      // newAllSelectedCheckArray.sort((a, b) => a - b);
      // ================= 🔥🔥テスト🔥🔥==================
      console.log("🔥ソート後 uniqueArray", newAllSelectedCheckArray);
      setSelectedCheckBox(newAllSelectedCheckArray);
    }
    // ======================= 全チェックが外れた時 =======================
    else {
      // カラムヘッダーのチェックボックスStateをfalseに変更
      setCheckedColumnHeader(false);

      // 現在取得している総アイテムを全てfalseに変更
      setCheckedRows((prevState) => {
        // console.log("Object.entries(prevState)", Object.entries(prevState));
        return Object.entries(prevState).reduce((acc: { [key: string]: boolean }, [key, value]) => {
          acc[key] = false;
          // acc[key] = !value;
          return acc;
        }, {});
      });

      // 全てのチェックボックスの値をfalseに変更後、stateの中身を空の配列に更新
      setSelectedCheckBox([]);
    }
  };
  // ================================= 🌟チェックボックス全選択🌟 =================================

  // ================================== 🌟カラム順番入れ替え🌟 ==================================
  const [leftBorderLine, setLeftBorderLine] = useState<number | null>(null);
  const [rightBorderLine, setRightBorderLine] = useState<number | null>(null);
  const [rightDropElement, setRightDropElement] = useState<Element | null>(null);
  const [leftDropElement, setLeftDropElement] = useState<Element | null>(null);

  // ============ ✅onDragStartイベント ドラッグ可能なターゲット上で発生するイベント✅ ============
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    console.log("dragstart🔥 index", index);
    setDragColumnIndex(index);

    // 順番入れ替え中はリサイズオーバーレイのpointer-eventsはnoneにする
    draggableOverlaysRef.current.forEach((div) => {
      div?.classList.add(`pointer-events-none`);
    });
    // const gridCells = document.querySelectorAll(`[role="gridcell"]`);
    // console.log("gridCells", gridCells);
    // gridCells.forEach((div) => {
    //   div?.classList.add(`pointer-events-none`);
    // });

    // ドラッグ要素を半透明にして色を付ける
    e.currentTarget.classList.add(`${styles.dragging_change_order}`);

    // テスト 🌟 onDragOverイベント
    // 右の要素
    console.log("🔥右", e.currentTarget.nextElementSibling?.role);

    const rightItem: Element | null =
      !e.currentTarget.nextElementSibling || e.currentTarget.nextElementSibling?.role === null
        ? null
        : e.currentTarget.nextElementSibling;
    const rightItemLeft = rightItem?.getBoundingClientRect().left;
    const rightItemWidth = rightItem?.getBoundingClientRect().width;
    // 左の要素
    console.log("🔥左", e.currentTarget.previousElementSibling?.role);
    const leftItem: Element | null =
      !e.currentTarget.previousElementSibling || e.currentTarget.previousElementSibling?.role === null
        ? null
        : e.currentTarget.previousElementSibling;
    const leftItemLeft = leftItem?.getBoundingClientRect().left;
    const leftItemWidth = leftItem?.getBoundingClientRect().width;

    // if (!rightItemLeft || !rightItemWidth) return;
    const rightBorderLine = rightItemLeft! + rightItemWidth! / 2; // 右要素ボーダーライン

    // if (!leftItemLeft || !leftItemWidth) return;
    const leftBorderLine = leftItemLeft! + leftItemWidth! / 2; // 左要素ボーダーライン
    const newBorderLine = {
      leftBorderLine: leftBorderLine ? leftBorderLine : null,
      rightBorderLine: rightBorderLine ? rightBorderLine : null,
    };
    console.log("rightBorderLine, e.clientX, leftBorderLine", leftBorderLine, e.clientX, rightBorderLine);

    setLeftBorderLine(leftBorderLine);
    setRightBorderLine(rightBorderLine);
    setRightDropElement(rightItem);
    setLeftDropElement(leftItem);
  };
  // ============ ✅onDragStartイベント ドラッグ可能なターゲット上で発生するイベント✅ ここまで ============

  //  ============ ✅onDragEnterイベント ドロップ対象に発生するイベント✅ ============
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    // console.log("handleDragEnterドラッグエンター e.target🔥", e.target);
    // console.log("colsRef.current[index]🔥", colsRef.current[index]);
  };
  // ============== ✅onDragEnterイベント ドロップ対象に発生するイベント✅ ここまで ==============

  // ============== ✅onDragOverイベント ドロップ対象に発生するイベント✅ ==============
  // ドラッグ対象がドロップ対象の半分を超えたらonDragEnterイベントを発火させる制御関数
  const [isReadyDragEnter, setIsReadyDragEnter] = useState("");
  let lastHalf: string | null = null;
  const [dropIndex, setDropIndex] = useState<number>();
  const [targetElement, setTargetElement] = useState<Element | null>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    // if (isReadyDragEnter) return;

    const dragItem: HTMLDivElement = e.target as HTMLDivElement; // ドラッグしている要素

    const targetEl = colsRef.current[index];

    // 左要素のロジック ドラッグ位置が左隣の要素の中心を超えたら
    if (leftBorderLine) {
      if (e.clientX < leftBorderLine) {
        // if (isReadyDragEnterRef.current !== "left")
        if (isReadyDragEnter !== "left") {
          console.log("ドラッグ要素が左半分に入った！！！🌟");
          console.log("左隣要素の中央を突破🔥, ドロップ要素targetElement", colsRef.current[index]?.dataset.columnId);
          setIsReadyDragEnter("left");
          // isReadyDragEnterRef.current = "left";
          setDropIndex(index);

          setTargetElement(colsRef.current[index]); // 本番
          // setTargetElement() // テスト
        }
      }
    }

    // 右要素のロジック ドラッグ位置が右隣の要素の中心を超えたら
    if (rightBorderLine) {
      if (e.clientX > rightBorderLine) {
        // if (isReadyDragEnterRef.current !== "right")
        if (isReadyDragEnter !== "right") {
          console.log("ドラッグ要素が右半分に入った！！！🌟");
          console.log("右隣要素の中央を突破🔥, ドロップ要素targetElement", colsRef.current[index]?.dataset.columnId);
          setIsReadyDragEnter("right");
          // isReadyDragEnterRef.current = "right";
          setDropIndex(index);
          setTargetElement(colsRef.current[index]);
        }
      }
    }
  };
  // ============== ✅onDragOverイベント ドロップ対象に発生するイベント ここまで ==============

  // ================== ✅useEffect onDragEnterイベントの役割✅ ==================
  useEffect(() => {
    console.log("dragEnter ドラッグIndex, ドロップIndex", dragColumnIndex, dropIndex);
    if (!dragColumnIndex) return;
    if (dropIndex === dragColumnIndex) return;
    if (!targetElement) return;

    console.log("(targetElement as HTMLDivElement).draggable", (targetElement as HTMLDivElement).draggable);
    if ((targetElement as HTMLDivElement).draggable === false)
      return console.log(
        "idカラムには入れ替え不可リターン (e.target as HTMLDivElement).draggable",
        (targetElement as HTMLDivElement).draggable
      );

    // 各要素の取得と要素のcolumnIdをdata属性から取得
    const draggingElement = colsRef.current[dragColumnIndex];
    const dropElement = targetElement as HTMLDivElement;
    const draggingElementColumnId = draggingElement?.dataset.columnId;
    const dropElementColumnId = dropElement?.dataset.columnId;

    if (!draggingElementColumnId || !dropElementColumnId) return;

    // ドラッグ、ドロップ2つの要素のcolIndexとwidthを取得
    const draggingElementColIndex = columnHeaderItemList[dragColumnIndex].columnIndex;
    const dropElementColIndex = columnHeaderItemList[dropIndex!].columnIndex;
    const draggingElementColWidth = columnHeaderItemList[dragColumnIndex].columnWidth;
    const dropElementColWidth = columnHeaderItemList[dropIndex!].columnWidth;
    const draggingElementName = draggingElement.dataset.handlerId;
    const dropElementColName = dropElement.dataset.handlerId;

    console.log(
      `🌟ドラッグ元name: ${draggingElementName} id: ${draggingElementColumnId}, colIndex: ${draggingElementColIndex}, width: ${draggingElementColWidth}`
    );
    console.log(
      `🌟ドロップ先のName: ${dropElementColName} id: ${dropElementColumnId}, colIndex: ${dropElementColIndex}, width: ${dropElementColWidth}`
    );

    console.log("🌟更新前 columnHeaderItemList全体", columnHeaderItemList);
    //  🌟順番を入れ替える columnHeaderItemList
    const copyListItems: ColumnHeaderItemList[] = JSON.parse(JSON.stringify(columnHeaderItemList)); // 一意性を守るため新たなカラムリストを生成
    // 入れ替え前にwidthを更新する CSSカスタムプロパティに反映 grid-template-columnsの場所も入れ替える
    const copyTemplateColumnsWidth: string[] = JSON.parse(JSON.stringify(colsWidth));
    console.log("🔥copyTemplateColumnsWidth, colsWidth", copyTemplateColumnsWidth, colsWidth);
    const columnWidthsOmitCheckbox = copyTemplateColumnsWidth.slice(1); // checkboxを除いたwidthを取得

    console.log("🔥columnWidthsOmitCheckbox", columnWidthsOmitCheckbox);
    const newWidthListItems = copyListItems.map((item, index) => {
      // console.log("item.columnWidth, columnWidthsOmitCheckbox[index]", item.columnWidth, columnWidthsOmitCheckbox[index]);
      console.log(
        "index, id, column名, columnIndex, columnWidth",
        index,
        item.columnId,
        item.columnName,
        item.columnIndex,
        item.columnWidth,
        columnWidthsOmitCheckbox[index]
      );
      return { ...item, columnWidth: columnWidthsOmitCheckbox[index] };
    });
    // columnIndexを入れ替え
    console.log("🌟移動前のカラムリスト width更新後", newWidthListItems);
    let prevListItemArray = JSON.parse(JSON.stringify(newWidthListItems));
    // // ドラッグ要素をドロップ先の要素のインデックスに変更
    // newListItemArray[dragColumnIndex].columnIndex = dropElementColIndex;
    // // ドラッグ先のカラムのcolumnIndexをドラッグ元のカラムのインデックスに変更
    // newListItemArray[dropIndex!].columnIndex = draggingElementColIndex;
    // colIndexの順番を現在の配列のindexの順番に入れ替える
    // const deleteElement = newListItemArray.splice(dragColumnIndex, 1)[0];
    // newListItemArray.splice(dropIndex!, 0, deleteElement);

    const transferredItem = prevListItemArray.splice(dragColumnIndex, 1)[0];
    console.log("transferredItem, dropElementColIndex", transferredItem, dropElementColIndex);
    prevListItemArray.splice(dropElementColIndex - 2, 0, transferredItem); // colindexとindexの差が2あるので-2引いた位置に挿入する
    const newListItemArray: ColumnHeaderItemList[] = prevListItemArray.map(
      (item: ColumnHeaderItemList, index: number) => {
        const newItem = { ...item, columnIndex: index + 2 };
        console.log("🌟ここ", newItem);
        return newItem;
      }
    );
    // const newListItemArray = JSON.parse(JSON.stringify(prevListItemArray));
    // const newListItemArray = [...prevListItemArray];
    console.log("移動前のカラムリスト", prevListItemArray);
    console.log("移動前のカラムリスト", newListItemArray);

    // let transferredElement = newListItemArray.splice()
    // ================= 🔥🔥テスト🔥🔥==================
    setColumnHeaderItemList([...newListItemArray]);
    // setColumnHeaderItemList((prevArray) => {
    //   console.log("ここprevArray", prevArray);
    //   console.log("ここnewListItemArray", newListItemArray);
    //   return [...newListItemArray];
    // });
    // ================= 🔥🔥テスト🔥🔥==================
    // ================ ✅ローカルストレージにも更新後のカラムリストを保存 ================
    // const columnHeaderItemListJSON = JSON.stringify(newListItemArray);
    // localStorage.setItem("grid_columns_company", columnHeaderItemListJSON);
    // ================ ✅ローカルストレージにも更新後のカラムリストを保存 ここまで ================

    // --template-columnsも更新
    console.log("copyTemplateColumnsWidth", copyTemplateColumnsWidth);
    // const newTemplateColumnsWidth = copyTemplateColumnsWidth.map((item, index) => {
    //   return index === 0 ? item : newListItemArray[index - 1].columnWidth;
    // });
    const transferredWidth = copyTemplateColumnsWidth.splice(dragColumnIndex + 1, 1)[0]; // checkbox分で1増やす
    copyTemplateColumnsWidth.splice(dropElementColIndex - 1, 0, transferredWidth);
    console.log("transferredWidth", transferredWidth);
    const newTemplateColumnsWidth = JSON.parse(JSON.stringify(copyTemplateColumnsWidth));
    console.log("copyTemplateColumnsWidth, newTemplateColumns", copyTemplateColumnsWidth, newTemplateColumnsWidth);

    // grid-template-columnsの値となるCSSカスタムプロパティをセット
    if (!parentGridScrollContainer.current) return;
    parentGridScrollContainer.current.style.setProperty("--template-columns", `${newTemplateColumnsWidth.join(" ")}`);
    console.log(
      "更新後--template-columns",
      parentGridScrollContainer.current.style.getPropertyValue("--template-columns")
    );

    // =========== 🌟colsWidthを更新
    setColsWidth(newTemplateColumnsWidth);
    currentColsWidths.current = newTemplateColumnsWidth;

    setDragColumnIndex(dropIndex!);

    // =========== 🌟isReadyDragEnterをfalseにして再度両隣を中央超えた場合に発火を許可する

    // =============================== 右にドラッグで入ってくるルート ===============================
    if (isReadyDragEnter === "right") {
      // 右の要素
      const rightItem: Element | null = colsRef.current[dropIndex!]!.nextElementSibling!
        ? colsRef.current[dropIndex!]!.nextElementSibling!
        : null;
      const rightItemLeft = rightItem?.getBoundingClientRect().left;
      const rightItemWidth = rightItem?.getBoundingClientRect().width;
      // if (!rightItemLeft || !rightItemWidth) return;
      const rightBorderLine = rightItemLeft! + rightItemWidth! / 2; // 右要素ボーダーライン

      // 新たなドラッグアイテム
      const newDraggingItem = draggingElement ? draggingElement : null;

      // 左の要素
      const leftItem: Element | null = colsRef.current[dropIndex!]!.previousElementSibling
        ? colsRef.current[dropIndex!]!.previousElementSibling
        : null;
      const leftItemLeft = leftItem?.getBoundingClientRect().left;
      const leftItemWidth = leftItem?.getBoundingClientRect().width;
      // if (!leftItemLeft || !leftItemWidth) return;
      const leftBorderLine = leftItemLeft! + leftItemWidth! / 2; // 左要素ボーダーライン
      const newBorderLine = {
        leftBorderLine: leftBorderLine,
        rightBorderLine: rightBorderLine,
      };
      // setBorderLine(newBorderLine);
      setLeftBorderLine(leftBorderLine); // 入れ替え後の次の左のボーダーラインをStateに格納
      setRightBorderLine(rightBorderLine); // 入れ替え後の次の右のボーダーラインをStateに格納
      setRightDropElement(rightItem); // 入れ替え後の次の左の要素をStateに格納
      setLeftDropElement(leftItem); // 入れ替え後の次の左の要素をStateに格納
    }
    // =============================== 左にドラッグで入ってくるルート ===============================
    if (isReadyDragEnter === "left") {
      // 右の要素
      const rightItem: Element | null = colsRef.current[dropIndex!]!.nextElementSibling
        ? colsRef.current[dropIndex!]!.nextElementSibling
        : null;
      const rightItemLeft = rightItem?.getBoundingClientRect().left;
      const rightItemWidth = rightItem?.getBoundingClientRect().width;
      // if (!rightItemLeft || !rightItemWidth) return;
      const rightBorderLine = rightItemLeft! + rightItemWidth! / 2; // 右要素ボーダーライン

      // 新たなドラッグアイテム
      const newDraggingItem = draggingElement ? draggingElement : null;

      // 左の要素
      const leftItem: Element | null = colsRef.current[dropIndex!]!.previousElementSibling!
        ? colsRef.current[dropIndex!]!.previousElementSibling!
        : null;
      const leftItemLeft = leftItem?.getBoundingClientRect().left;
      const leftItemWidth = leftItem?.getBoundingClientRect().width;
      // if (!leftItemLeft || !leftItemWidth) return;
      const leftBorderLine = leftItemLeft! + leftItemWidth! / 2; // 左要素ボーダーライン
      const newBorderLine = {
        leftBorderLine: leftBorderLine,
        rightBorderLine: rightBorderLine,
      };
      console.log("🔥 leftItem", leftItem);
      console.log("🔥 newDraggingItem", newDraggingItem);
      console.log("🔥 rightItem", rightItem);
      // setBorderLine(newBorderLine);
      setLeftBorderLine(leftBorderLine);
      setRightBorderLine(rightBorderLine);
      setRightDropElement(rightItem);
      setLeftDropElement(leftItem);
    }

    setTargetElement(null);
    setIsReadyDragEnter("");
  }, [targetElement]);
  // ================== ✅useEffect onDragEnterの役割✅ ここまで ==================
  // ============== ✅onDragEndイベント ドラッグ可能なターゲット上で発生するイベント✅ ==============
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    console.log("Drop✅");
    // ================ ✅ローカルストレージにも更新後のカラムリストを保存 ================
    const columnHeaderItemListJSON = JSON.stringify(columnHeaderItemList);
    localStorage.setItem("grid_columns_companies", columnHeaderItemListJSON);
    // localStorage.setItem("grid_columns_contacts", columnHeaderItemListJSON);
    // ================ ✅ローカルストレージにも更新後のカラムリストを保存 ここまで ================
    // =============== フローズン用 各カラムのLeft位置、レフトポジションを取得 ===============
    // colsWidth ['65px', '100px', '250px', '250px', '250px', '250px', '250px', '250px']から
    // accumulatedLeftPosition:  [65, 165, 415, 665, 915, 1165, 1415, 1665]
    if (!colsWidth) return;
    // 現在のcolsWidthをコピー
    const widthArray = JSON.parse(JSON.stringify(colsWidth));

    // 各要素の累積和を計算し、新しい配列を作る
    const accumulatedArray = widthArray.reduce((acc: number[], value: string) => {
      // parseIntを使って数値部分を抽出する
      const number = parseInt(value, 10);
      // 配列の最後の要素（現在の累積和）に数値を加える
      const newSum = acc.length > 0 ? acc[acc.length - 1] + number : number;
      // 新しい累積和を配列に追加する
      acc.push(newSum);
      return acc;
    }, []);
    // [65, 165, 415, 665, 915, 1165, 1415, 1665]
    // refオブジェクトにレフトポジションを格納
    columnLeftPositions.current = accumulatedArray;
    console.log("カラム入れ替えonDragEndイベント レフトポジション accumulatedArray", accumulatedArray);
    // ===================================================== 🔥テスト フローズンカスタムプロパティ
    const filteredIsFrozenList = columnHeaderItemList.filter((item) => item.isFrozen === true);
    filteredIsFrozenList.forEach((item, index) => {
      parentGridScrollContainer.current!.style.setProperty(`--frozen-left-${index}`, `${accumulatedArray[index]}px`);
    });
    // ===================================================== 🔥テスト フローズンカスタムプロパティ
    // =============== フローズン用 各カラムのLeft位置、レフトポジションを取得 ここまで ===============
    // 順番入れ替え中はリサイズオーバーレイのpointer-eventsはnoneにする
    draggableOverlaysRef.current.forEach((div) => {
      div?.classList.remove(`pointer-events-none`);
    });
    // ドラッグ要素をスタイルを戻す
    e.currentTarget.classList.remove(`${styles.dragging_change_order}`);
    // ドラッグインデックスを空にする
    setDragColumnIndex(null);
  };
  // ============== ✅onDragEndイベント ドラッグ可能なターゲット上で発生するイベント✅ ここまで ==============
  // ================================== 🌟カラム順番入れ替え🌟 ここまで ==================================

  // ============== 🌟フローズンイベント leftとstickyとz-indexを加えて、columnIndexを変更する🌟 ==============
  //   const handleFrozen = (e: React.MouseEvent<HTMLElement, MouseEvent>, index: number) => {
  const handleFrozen = (index: number) => {
    console.log("🌟カラムヘッダー ダブルクリック フローズンイベント ========================");
    console.log(index);
    console.log("✅ フローズンの個数isFrozenCountRef.current", isFrozenCountRef.current);
    console.log("✅ レフトポジションcolumnLeftPositions.current", columnLeftPositions.current);

    // 🔥フローズンを付与するルート =================================
    if (columnHeaderItemList[index].isFrozen === false) {
      console.log("🔥フローズンを付与するルート ============================");
      // ✅順番を入れ替え処理 一意性を守るため新たなカラムリストを生成
      const copyColumnHeaderListItems: ColumnHeaderItemList[] = JSON.parse(JSON.stringify(columnHeaderItemList));
      // クリックされたカラムヘッダーをリストから取り出す 配列内に一つのみ取得されるので、[0]をつけてオブジェクトで取得
      const targetFrozenColumn = copyColumnHeaderListItems.splice(index, 1)[0]; // 破壊的
      console.log("フローズンイベント 今回取り出したフローズンをつけるカラム", targetFrozenColumn);
      // ターゲットカラムのisFrozenプロパティをtrueに変更する
      targetFrozenColumn.isFrozen = true;
      // 残りのリストから現在のisFrozenが付いているリストと付いていないリストに分ける
      const filteredIsFrozenColumnList = copyColumnHeaderListItems.filter((item) => item.isFrozen === true);
      const filteredNotFrozenColumnList = copyColumnHeaderListItems.filter((item) => item.isFrozen === false);
      console.log(
        "フローズンイベント フローズンが付いているカラムリスト filteredIsFrozenColumnList",
        filteredIsFrozenColumnList
      );
      console.log(
        "フローズンイベント フローズンが付いていないカラムリスト filteredNotFrozenColumnList",
        filteredNotFrozenColumnList
      );
      // 順番入れ替え
      // フローズンが付いているリストの後に今回フローズンがついたターゲットカラムを配置し、その後に残りのカラムリストを展開する
      const newColumnHeaderItemList = [
        ...filteredIsFrozenColumnList,
        targetFrozenColumn,
        ...filteredNotFrozenColumnList,
      ];
      // 順番入れ替え後のカラムリストのcolumnIndexを現在の順番に揃える
      newColumnHeaderItemList.forEach((item, index) => (item.columnIndex = index + 2));
      console.log("フローズンイベント 順番入れ替えとcolumnIndex整形後のカラムリスト", newColumnHeaderItemList);
      // カラムリストのStateを更新
      setColumnHeaderItemList(newColumnHeaderItemList);

      // ================ ✅ローカルストレージにも更新後のカラムリストを保存 ================
      const columnHeaderItemListJSON = JSON.stringify(newColumnHeaderItemList);
      localStorage.setItem("grid_columns_companies", columnHeaderItemListJSON);
      // localStorage.setItem("grid_columns_contacts", columnHeaderItemListJSON);
      // ================ ✅ローカルストレージにも更新後のカラムリストを保存 ここまで ================

      // 現在のフローズンの総個数を更新する filteredIsFrozenColumnListの+1
      isFrozenCountRef.current = isFrozenCountRef.current + 1;
      // isFrozenCountRef.current = filteredIsFrozenColumnList.length + 1;
      // アクティブセルを再度Stateに格納する
      //   setActiveCell(colsRef.current[isFrozenCountRef.current - 1]);

      // ✅--template-columnsも更新する [65px, 100px, 250px,...]の配列を作成してjoinで' 'を付けて結合する
      const newColumnWidthList = newColumnHeaderItemList.map((item) => item.columnWidth);
      // カラムWidthListにチェックボックスカラムの65pxを配列に追加する
      newColumnWidthList.unshift("65px");
      console.log("チェックボックス65pxを追加したColumnWidthリスト", newColumnWidthList);
      console.log('ColumnWidthリストのjoin(" ")後', newColumnWidthList.join(" "));

      if (!parentGridScrollContainer.current) return;
      parentGridScrollContainer.current.style.setProperty("--template-columns", `${newColumnWidthList.join(" ")}`);
      console.log(
        "フローズンイベント 更新後--template-columns",
        parentGridScrollContainer.current.style.getPropertyValue("--template-columns")
      );
      // colsWidthのStateを更新
      setColsWidth(newColumnWidthList);
      currentColsWidths.current = newColumnWidthList;

      // =============== フローズン用 各カラムのLeft位置、レフトポジションを取得 ===============
      // colsWidth ['65px', '100px', '250px', '250px', '250px', '250px', '250px', '250px']から
      // accumulatedLeftPosition:  [65, 165, 415, 665, 915, 1165, 1415, 1665]
      // if (!colsWidth) return;
      // 現在のcolsWidthをコピー
      const widthArray = JSON.parse(JSON.stringify(newColumnWidthList));

      // 各要素の累積和を計算し、新しい配列を作る
      const accumulatedArray = widthArray.reduce((acc: number[], value: string) => {
        // parseIntを使って数値部分を抽出する
        const number = parseInt(value, 10);
        // 配列の最後の要素（現在の累積和）に数値を加える
        const newSum = acc.length > 0 ? acc[acc.length - 1] + number : number;
        // 新しい累積和を配列に追加する
        acc.push(newSum);
        return acc;
      }, []);
      // [65, 165, 415, 665, 915, 1165, 1415, 1665]
      // refオブジェクトにレフトポジションを格納
      columnLeftPositions.current = accumulatedArray;
      // ===================================================== 🔥テスト フローズンカスタムプロパティ
      const filteredIsFrozenList = newColumnHeaderItemList.filter((item) => item.isFrozen === true);
      filteredIsFrozenList.forEach((item, index) => {
        parentGridScrollContainer.current!.style.setProperty(`--frozen-left-${index}`, `${accumulatedArray[index]}px`);
      });
      // ===================================================== 🔥テスト フローズンカスタムプロパティ

      // レフトポジションをカスタムプロパティに追加 =============================== テスト 🔥
      // parentGridScrollContainer.current.style.setProperty(
      //   `--frozen-left-${isFrozenCountRef.current - 1}`,
      //   columnLeftPositions.current[isFrozenCountRef.current - 1].toString() + "px"
      // );
      // console.log(
      //   `フローズンイベント カスタムプロパティ作成--frozen-left-${isFrozenCountRef.current - 1}`,
      //   parentGridScrollContainer.current.style.getPropertyValue(`--frozen-left-${isFrozenCountRef.current - 1}`)
      // );
      // レフトポジションをカスタムプロパティに追加 =============================== テスト 🔥
      // =============== フローズン用 各カラムのLeft位置、レフトポジションを取得 ここまで ===============
    }
    // 🔥フローズンを外すルート ====================
    else {
      console.log("🔥フローズンを外すルート ============================");
      // ✅順番を入れ替え処理 一意性を守るため新たなカラムリストを生成
      const copyColumnHeaderListItems: ColumnHeaderItemList[] = JSON.parse(JSON.stringify(columnHeaderItemList));
      // クリックされたカラムヘッダーをリストから取り出す 配列内に一つのみ取得されるので、[0]をつけてオブジェクトで取得
      const targetNotFrozenColumn = copyColumnHeaderListItems.splice(index, 1)[0]; // 破壊的
      console.log("フローズンイベント 今回取り出したフローズンを外すカラム", targetNotFrozenColumn);
      // ターゲットカラムのisFrozenプロパティをtrueに変更する
      targetNotFrozenColumn.isFrozen = false;
      // 残りのリストから現在のisFrozenが付いているリストと付いていないリストに分ける
      const filteredIsFrozenColumnList = copyColumnHeaderListItems.filter((item) => item.isFrozen === true);
      const filteredNotFrozenColumnList = copyColumnHeaderListItems.filter((item) => item.isFrozen === false);
      console.log(
        "フローズンイベント フローズンが付いているカラムリスト filteredIsFrozenColumnList",
        filteredIsFrozenColumnList
      );
      console.log(
        "フローズンイベント フローズンが付いていないカラムリスト filteredNotFrozenColumnList",
        filteredNotFrozenColumnList
      );
      // 順番入れ替え
      // フローズンが付いているリストの後に今回フローズンがついたターゲットカラムを配置し、その後に残りのカラムリストを展開する
      const newColumnHeaderItemList = [
        ...filteredIsFrozenColumnList,
        targetNotFrozenColumn,
        ...filteredNotFrozenColumnList,
      ];
      // 順番入れ替え後のカラムリストのcolumnIndexを現在の順番に揃える
      newColumnHeaderItemList.forEach((item, index) => (item.columnIndex = index + 2));
      console.log("フローズンイベント 順番入れ替えとcolumnIndex整形後のカラムリスト", newColumnHeaderItemList);
      // カラムリストのStateを更新
      setColumnHeaderItemList(newColumnHeaderItemList);

      // ================ ✅ローカルストレージにも更新後のカラムリストを保存 ================
      const columnHeaderItemListJSON = JSON.stringify(newColumnHeaderItemList);
      localStorage.setItem("grid_columns_companies", columnHeaderItemListJSON);
      // localStorage.setItem("grid_columns_contacts", columnHeaderItemListJSON);
      // ================ ✅ローカルストレージにも更新後のカラムリストを保存 ここまで ================

      // 現在のフローズンの総個数を更新する filteredIsFrozenColumnListの-1
      isFrozenCountRef.current = isFrozenCountRef.current - 1;
      // isFrozenCountRef.current = filteredIsFrozenColumnList.length - 1;
      // アクティブセルを再度Stateに格納する
      //   setActiveCell(colsRef.current[isFrozenCountRef.current]);

      // ✅--template-columnsも更新する [65px, 100px, 250px,...]の配列を作成してjoinで' 'を付けて結合する
      const newColumnWidthList = newColumnHeaderItemList.map((item) => item.columnWidth);
      // カラムWidthListにチェックボックスカラムの65pxを配列に追加する
      newColumnWidthList.unshift("65px");
      console.log("チェックボックス65pxを追加したColumnWidthリスト", newColumnWidthList);
      console.log('ColumnWidthリストのjoin(" ")後', newColumnWidthList.join(" "));

      if (!parentGridScrollContainer.current) return;
      parentGridScrollContainer.current.style.setProperty("--template-columns", `${newColumnWidthList.join(" ")}`);
      console.log(
        "フローズンイベント 更新後--template-columns",
        parentGridScrollContainer.current.style.getPropertyValue("--template-columns")
      );
      // colsWidthのStateを更新
      setColsWidth(newColumnWidthList);
      currentColsWidths.current = newColumnWidthList;

      // =============== フローズン用 各カラムのLeft位置、レフトポジションを取得 ===============
      // colsWidth ['65px', '100px', '250px', '250px', '250px', '250px', '250px', '250px']から
      // accumulatedLeftPosition:  [65, 165, 415, 665, 915, 1165, 1415, 1665]
      // if (!colsWidth) return;
      // 現在のcolsWidthをコピー
      const widthArray = JSON.parse(JSON.stringify(newColumnWidthList));

      // 各要素の累積和を計算し、新しい配列を作る
      const accumulatedArray = widthArray.reduce((acc: number[], value: string) => {
        // parseIntを使って数値部分を抽出する
        const number = parseInt(value, 10);
        // 配列の最後の要素（現在の累積和）に数値を加える
        const newSum = acc.length > 0 ? acc[acc.length - 1] + number : number;
        // 新しい累積和を配列に追加する
        acc.push(newSum);
        return acc;
      }, []);
      // [65, 165, 415, 665, 915, 1165, 1415, 1665]
      // refオブジェクトにレフトポジションを格納
      columnLeftPositions.current = accumulatedArray;

      // レフトポジションをカスタムプロパティから削除 -1された状態なので、そのままの個数で指定 =========== テスト🔥
      parentGridScrollContainer.current.style.removeProperty(`--frozen-left-${isFrozenCountRef.current}`);
      // // 位置が入れ替わってLeftポジションが再計算された状態でセットし直す
      // parentGridScrollContainer.current.style.setProperty(
      //   `--frozen-left-${isFrozenCountRef.current - 1}`,
      //   columnLeftPositions.current[isFrozenCountRef.current - 1].toString() + "px"
      // );
      // レフトポジションをカスタムプロパティから削除 -1された状態なので、そのままの個数で指定 =========== テスト🔥
      // ===================================================== 🔥テスト フローズンカスタムプロパティ
      const filteredIsFrozenList = newColumnHeaderItemList.filter((item) => item.isFrozen === true);
      filteredIsFrozenList.forEach((item, index) => {
        parentGridScrollContainer.current!.style.setProperty(`--frozen-left-${index}`, `${accumulatedArray[index]}px`);
      });
      // ===================================================== 🔥テスト フローズンカスタムプロパティ
      // =============== フローズン用 各カラムのLeft位置、レフトポジションを取得 ここまで ===============
    }
  };
  // ============== 🌟フローズンイベント ドラッグ可能なターゲット上で発生するイベント🌟 ここまで ==============

  // ===================== 🌟ツールチップ 3点リーダーの時にツールチップ表示🌟 =====================
  // const handleOpenTooltip = (
  //   e: React.MouseEvent<HTMLElement, MouseEvent>,
  //   display: string,
  //   columnName: string,
  //   marginTop: number = 0
  // ) => {
  const hoveredItemPos = useStore((state) => state.hoveredItemPos);
  const setHoveredItemPos = useStore((state) => state.setHoveredItemPos);
  type TooltipParams = {
    e: React.MouseEvent<HTMLElement, MouseEvent>;
    display: string;
    content: string;
    content2?: string | undefined | null;
    content3?: string | undefined | null;
    marginTop?: number;
    maxWidth?: number;
    itemsPosition?: string;
  };
  const handleOpenTooltip = ({
    e,
    display,
    content,
    content2,
    content3,
    marginTop = 0,
    // itemsPosition = "start",
    itemsPosition = "center",
    maxWidth,
  }: TooltipParams) => {
    // ホバーしたアイテムにツールチップを表示
    const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
    // console.log("ツールチップx, y width , height", x, y, width, height);

    setHoveredItemPos({
      x: x,
      y: y,
      itemWidth: width,
      itemHeight: height,
      content: content,
      content2: content2,
      content3: content3,
      display: display,
      marginTop: marginTop,
      itemsPosition: itemsPosition,
      maxWidth: maxWidth,
    });
  };
  // ツールチップを非表示
  const handleCloseTooltip = () => {
    if (hoveredItemPos) setHoveredItemPos(null);
  };
  // ==================================================================================

  // ======= 🌟会社編集モーダルでUPDATE後に選択中のセルをクリックさせてselectedRowDataPropertyを最新に更新する🌟
  // UPDATEクエリでDB更新後にinvalidateQueries()でキャッシュは更新するがZustandは更新できていないため、UPDATEクエリ成功時にisUpdateRequiredForLatestSelectedRowDataPropertyをtrueにして発火通知をすることで、選択中のセルを再度クリックさせてselectedRowDataPropertyを再度更新する
  useEffect(() => {
    if (!isUpdateRequiredForLatestSelectedRowDataCompany) return;
    if (!selectedGridCellRef.current) return;

    console.log("会社UPDATE検知🔥 選択セルクリックで下メインコンテナを最新状態に反映", selectedGridCellRef.current);
    selectedGridCellRef.current.click(); // セルクリック

    setIsUpdateRequiredForLatestSelectedRowDataCompany(false);
  }, [isUpdateRequiredForLatestSelectedRowDataCompany, setIsUpdateRequiredForLatestSelectedRowDataCompany]);
  // ======= ✅会社編集モーダルでUPDATE後に選択中のセルをクリックさせてselectedRowDataPropertyを最新に更新する✅

  // 🌟現在のカラム.map((obj) => Object.values(row)[obj.columnId])で展開してGridセルを表示する
  // カラムNameの値のみ配列バージョンで順番入れ替え
  // ================= 🌟並び替え🌟成功 ==================
  const columnOrder = [...columnHeaderItemList].map((item, index) => item.columnName as keyof Client_company); // columnNameのみの配列を取得 keyof型演算子：https://typescriptbook.jp/reference/type-reuse/keyof-type-operator
  // const columnOrder = [...columnHeaderItemList].map((item, index) => item.columnName as keyof TableDataType); // columnNameのみの配列を取得
  // ================= 🌟並び替え🌟成功 ==================
  // // カラムName配列バージョンで順番入れ替え
  // const columnOrder = [...columnHeaderItemList].map((item, index) => ({
  //   columnName: item.columnName as keyof TableDataType,
  // })); // columnNameのみの配列を取得
  // 🌟現在のカラム順、.map((obj) => Object.values(row)[obj.columnId])で展開してGridセルを表示する
  // const columnOrder = [...columnHeaderItemList].map((item, index) => ({ columnId: item.columnId })); // columnIdのみの配列を取得
  // 🌟現在のisFrozenの数を取得 isFrozenの個数の総数と同じindex+1のアイテムにborder-right: 4pxを付与する
  // const currentIsFrozenCount = columnHeaderItemList.filter(obj => obj.isFrozen === true).length
  // console.log("✅ clickedActiveRow", clickedActiveRow);
  // console.log("✅ checkedRows個数, checkedRows", Object.keys(checkedRows).length, checkedRows);
  // console.log("✅ selectedCheckBox", selectedCheckBox);
  // console.log("✅ allRows個数 allRows", allRows);
  // console.log(`✅ virtualItems:${rowVirtualizer.getVirtualItems().length}`);
  // console.log("✅ columnHeaderItemList, columnOrder", columnHeaderItemList, columnOrder);
  // console.log("✅ colsWidth                ", colsWidth);
  // console.log("✅ currentColsWidths.current", currentColsWidths.current);
  // console.log("✅ フローズンの個数isFrozenCountRef.current", isFrozenCountRef.current);
  // console.log("✅ レフトポジションcolumnLeftPositions.current", columnLeftPositions.current);
  // console.log("✅ 選択中のアクティブセルselectedGridCellRef", selectedGridCellRef);
  // console.log("✅ 選択中のアクティブセルactiveCell", activeCell);
  // console.log("✅ 全てのカラムcolsRef", colsRef);
  console.log(
    "GridTableAllコンポーネントレンダリング"
    // columnHeaderItemList,
    // "searchParamsString",
    // searchParamsString
    // "✅ 全てのカラムcolsRef",
    // colsRef,
    // "checkedRows個数, checkedRows",
    // Object.keys(checkedRows).length,
    // checkedRows,
    // "selectedCheckBox",
    // selectedCheckBox,
    // "allRows",
    // allRows,
    // `virtualItems:${rowVirtualizer.getVirtualItems().length}`,
    // "columnHeaderItemList, columnOrder",
    // columnHeaderItemList,
    // columnOrder,
    // "colsWidth                ",
    // colsWidth,
    // "currentColsWidths.current",
    // currentColsWidths.current,
    // "フローズンの個数isFrozenCountRef.current",
    // isFrozenCountRef.current,
    // "レフトポジションcolumnLeftPositions.current",
    // columnLeftPositions.current,
    // "選択中のアクティブセルselectedGridCellRef",
    // selectedGridCellRef,
    // "選択中のアクティブセルactiveCell",
    // activeCell,
    // "clickedActiveRow",
    // clickedActiveRow,
    // "選択中のRowデータselectedRowDataCompany",
    // selectedRowDataCompany
  );
  //   console.log("✅ window", window.innerHeight);

  // 🌟カラム3点リーダー表示中はホバー時にツールチップを有効化
  // console.log("✅isOverflowColumnHeader", isOverflowColumnHeader);

  const formatDisplayValue = (columnName: string, value: any, created_by_company_id: string | null | undefined) => {
    switch (columnName) {
      // 決算月 日本語は月を追加する
      case "fiscal_end_month":
      case "budget_request_month1":
      case "budget_request_month2":
        if (!!value && language === "ja") return `${value}月`;
        if (!!value && language === "en") return value;
        if (!value) return value;
        break;
      case "created_by_company_id":
        if (created_by_company_id === userProfileState?.company_id) {
          return (
            <div className="flex-center h-full w-full">
              <BsCheck2 className="pointer-events-none min-h-[22px] min-w-[22px] stroke-1 text-[22px] text-[#00d436]" />
            </div>
          );
        }

      // 規模(ランク)
      case "number_of_employees_class":
        if (!value) return null;
        return getNumberOfEmployeesClass(value);
      // 業種
      case "industry_type_id":
        if (!value) return null;
        if (typeof value !== "number") return value;
        return mappingIndustryType[value][language];

      // 製品分類(大中小): 配列内のnameをjaに変換してjoinで「' '」で繋げる ※行を50行程度でバーチャライズしているため、このレベルのデータ量ではフォーマットにおけるJavascriptの配列操作mapやjoinは非常に高速のため、大幅なパフォーマンスの問題がない限りはこの実装で行う
      case "product_categories_large_array":
      case "product_categories_medium_array":
      case "product_categories_small_array":
        if (!value?.length || !Array.isArray(value)) return "";
        if (columnName === "product_categories_large_array") {
          return value
            .map((name) =>
              optionsProductLNameOnlySet.has(name)
                ? `#${mappingProductL[name as ProductCategoriesLarge][language]}`
                : `#-`
            )
            .join("　"); // #text1 #text2
        }
        if (columnName === "product_categories_medium_array") {
          return value
            .map((name) =>
              productCategoriesMediumNameOnlySet.has(name)
                ? `#${mappingProductCategoriesMedium[name as ProductCategoriesMedium][language]}`
                : `#-`
            )
            .join("　"); // #text1 #text2
        }
        if (columnName === "product_categories_small_array") {
          return value
            .map((name) =>
              productCategoriesSmallNameOnlySet.has(name)
                ? `#${mappingProductCategoriesSmall[name as ProductCategoriesSmall][language]}`
                : `#-`
            )
            .join("　"); // #text1 #text2
        }

      default:
        return value;
        break;
    }
  };

  /**
   * {columnHeaderItemList[index].columnName === "created_by_company_id" &&
      rowData.created_by_company_id === userProfileState?.company_id && (
        <div className="flex-center h-full w-full">
          <BsCheck2 className="pointer-events-none min-h-[22px] min-w-[22px] stroke-1 text-[22px] text-[#00d436]" />
        </div>
      )}
   */

  return (
    <>
      {/* ローディング */}
      {isLoadingDelete && (
        <div
          className={`flex-center fixed left-0 top-0 z-[5000] h-full w-full bg-[var(--overlay-loading-modal-inside)]`}
        >
          <SpinnerBrand withBorder withShadow />
        </div>
      )}
      {/* ================== メインコンテナ ================== */}
      <div
        className={`${styles.main_container} ${
          tableContainerSize === "one_third" ? `${styles.main_container_one_third}` : ``
        } ${tableContainerSize === "half" ? `${styles.main_container_half}` : ``} ${
          theme === "light" ? `${styles.theme_f_light}` : `${styles.theme_f_dark}`
        } ${searchMode ? `${styles.is_search_mode}` : ``}`}
      >
        {/* ================== Gridテーブルヘッダー ================== */}
        {/* <GridTableHeader /> */}
        <div className={`${styles.grid_header}`}>
          {/* <div className={`${styles.table_tab} min-h-[22px]`}></div> */}
          <div className={`${styles.table_tab} min-h-[22px]`}>{title}</div>
        </div>
        {/* ================== Gridメインコンテナ ================== */}
        <div className={`${styles.grid_main_container}`}>
          {/* ================== Gridファンクションヘッダー ボタンでページ遷移 ================== */}
          <div className={`${styles.grid_function_header}`}>
            <div className={`flex max-h-[26px] w-full items-center justify-start space-x-[6px]`}>
              {/* ========== ボタンエリア テスト ========== */}
              {/* <button
                className={`flex-center transition-color03 relative h-[26px] min-w-[118px] cursor-pointer space-x-1 rounded-[4px] border border-solid border-[var(--color-btn-brand-f-hover)] bg-[var(--color-btn-brand-f)] px-[10px] text-[12px] text-[#fff]`}
                onClick={async () => {
                  console.log("リフレッシュ クリック");
                  setRefetchLoading(true);
                  await queryClient.invalidateQueries({ queryKey: ["companies"] });
                  setRefetchLoading(false);
                }}
                data-text={`最新の状態にリフレッシュ`}
                onMouseEnter={(e) =>
                  handleOpenTooltip({
                    e: e,
                    display: "top",
                    content: "最新の状態にリフレッシュ",
                    marginTop: 5,
                  })
                }
                onMouseLeave={handleCloseTooltip}
              >
                {refetchLoading && (
                  <div className="relative">
                    <div className="mr-[2px] h-[12px] w-[12px]"></div>
                    <SpinnerIDS2 fontSize={20} width={20} height={20} />
                  </div>
                )}
                {!refetchLoading && (
                  <div className="flex-center mr-[2px]">
                    <FiRefreshCw className="stroke-[2.2]" />
                  </div>
                )}
                <span className="whitespace-nowrap">リフレッシュ</span>
              </button> */}
              {/* <button
                className={`flex-center transition-base03 h-[26px]  space-x-2 rounded-[4px]  px-[15px] text-[12px]  ${
                  activeCell?.role === "columnheader" && Number(activeCell?.ariaColIndex) !== 1
                    ? `cursor-pointer  text-[var(--color-bg-brand-f)] ${styles.fh_text_btn}`
                    : "cursor-not-allowed text-[#999]"
                }`}
                onClick={() => {
                  if (!activeCell) return;
                  if (activeCell.ariaColIndex === null) return;
                  // カラムヘッダーでかつ、チェックボックスでないなら
                  if (activeCell.role === "columnheader" && Number(activeCell.ariaColIndex) !== 1) {
                    handleFrozen(Number(activeCell.ariaColIndex) - 2);
                    console.log("クリック フローズン");
                  }
                }}
                onMouseEnter={(e) =>
                  handleOpenTooltip({
                    e: e,
                    display: "top",
                    content: `${
                      activeCell?.role === "columnheader" && Number(activeCell?.ariaColIndex) !== 1
                        ? `選択中のカラムを左端に固定`
                        : `カラムを選択することで、`
                    }`,
                    content2: `${
                      activeCell?.role === "columnheader" && Number(activeCell?.ariaColIndex)
                        ? ``
                        : `左右スクロール時にカラムを左端に固定できます`
                    }`,
                    marginTop: activeCell?.role === "columnheader" && Number(activeCell?.ariaColIndex) ? 5 : 20,
                    itemsPosition: "center",
                  })
                }
                onMouseLeave={handleCloseTooltip}
              >
                <FiLock className="pointer-events-none" />
                <span className="pointer-events-none">固定</span>
              </button> */}
              {/* ========== ボタンエリア テスト ========== */}
              {/* <RippleButton
                title={`カラム編集`}
                classText="select-none"
                clickEventHandler={() => {
                  const newResetColumnHeaderItemList = JSON.parse(JSON.stringify(columnHeaderItemList));
                  console.log(
                    "🔥🔥🔥モーダル開いた ZustandのリセットStateにパースして格納newResetColumnHeaderItemList",
                    newResetColumnHeaderItemList
                  );
                  setResetColumnHeaderItemList(newResetColumnHeaderItemList);
                  setIsOpenEditColumns(true);
                }}
                onMouseEnterHandler={(e) =>
                  handleOpenTooltip({
                    e: e,
                    display: "top",
                    content: `カラムをまとめて並び替えが可能です`,
                    // content2: `直近売れ先の仕入れ先や、売れ先と同じ取引先を持つ同業他社で導入実績が響く会社など`,
                    // marginTop: 48,
                    // marginTop: 28,
                    marginTop: 9,
                  })
                }
                onMouseLeaveHandler={handleCloseTooltip}
              />
              <ChangeSizeBtn /> */}
              <RippleButton
                title={`${searchMode ? `サーチ中止` : `新規サーチ`}`}
                // bgColor="var(--color-btn-brand-f-re)"
                classText={`select-none`}
                clickEventHandler={() => {
                  console.log("新規サーチ クリック");
                  if (searchMode) {
                    // SELECTメソッド
                    setSearchMode(false);
                    if (loadingGlobalState) setLoadingGlobalState(false);
                    // 編集モード中止
                    if (editSearchMode) setEditSearchMode(false);
                  } else {
                    // 新規サーチクリック
                    if (loadingGlobalState) setLoadingGlobalState(false);
                    setSearchMode(true);
                    // setLoadingGlobalState(true);
                  }
                  if (hoveredItemPos) handleCloseTooltip();
                }}
                onMouseEnterHandler={(e) =>
                  handleOpenTooltip({
                    e: e,
                    display: "top",
                    content: `現在の好調業界や決算が近い会社で税制優遇や余り予算を狙える会社、`,
                    content2: `直近売れ先の仕入れ先や、売れ先と同じ取引先を持つ同業他社で導入実績が響く会社など`,
                    content3: `会社名、住所、規模、業種、決算月、取引先など複数の項目を組み合わせて売れる会社の検索が可能です。`,
                    marginTop: 48,
                    maxWidth: 660,
                  })
                }
                onMouseLeaveHandler={() => {
                  if (hoveredItemPos) handleCloseTooltip();
                }}
              />
              <RippleButton
                title={`${searchMode ? `サーチ編集` : `サーチ編集`}`}
                classText={`select-none ${searchMode || !newSearchCompanyParams ? `cursor-not-allowed` : ``}`}
                clickEventHandler={() => {
                  console.log("サーチ編集 クリック");
                  if (searchMode) return;
                  if (!newSearchCompanyParams) return alert("新規サーチから検索を行なってください。");
                  console.log("サーチ編集 クリック");
                  // 編集モードとして開く
                  setEditSearchMode(true);
                  setSearchMode(true);
                }}
              />
              <button
                // className={`flex-center transition-color03 relative  h-[25px] min-w-[118px]  cursor-pointer space-x-1  rounded-[4px] px-[15px] text-[12px] text-[var(--color-bg-brand-f)] active:bg-[var(--color-function-header-text-btn-active)] ${styles.fh_text_btn}`}
                className={`flex-center transition-bg03 func_btn_green  relative h-[25px] max-h-[25px]  min-h-[25px] min-w-[118px] cursor-pointer space-x-1 rounded-[4px] px-[15px] text-[12px] text-[var(--color-bg-brand-f)]`}
                onClick={async () => {
                  console.log("リフレッシュ クリック");
                  setRefetchLoading(true);
                  await queryClient.invalidateQueries({ queryKey: ["companies"] });
                  // 再度テーブルの選択セルのDOMをクリックしてselectedRowDataCompanyを最新状態にする
                  setIsUpdateRequiredForLatestSelectedRowDataCompany(true);
                  // await refetch();
                  setRefetchLoading(false);
                }}
                data-text={`最新の状態にリフレッシュ`}
                onMouseEnter={(e) =>
                  handleOpenTooltip({
                    e: e,
                    display: "top",
                    content: "最新の状態にリフレッシュ",
                    marginTop: 8,
                  })
                }
                onMouseLeave={handleCloseTooltip}
              >
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
            </div>
            <div className={`flex max-h-[26px] w-full min-w-max items-center justify-end space-x-[6px]`}>
              {activeCell?.role === "columnheader" && Number(activeCell?.ariaColIndex) !== 1 && (
                <>
                  <button
                    className={`flex-center transition-bg03 func_btn_green h-[26px] max-h-[25px] min-h-[25px] space-x-2 rounded-[4px] px-[12px] text-[12px]`}
                    onClick={async () => {
                      handleCloseTooltip();
                    }}
                    onMouseEnter={(e) => {
                      handleOpenTooltip({
                        e: e,
                        display: "top",
                        content: `選択中のカラムで行を並び替え`,
                        marginTop: 9,
                        itemsPosition: "center",
                      });
                    }}
                    onMouseLeave={handleCloseTooltip}
                  >
                    <RiSortDesc className="pointer-events-none text-[16px]" />
                    <span className="pointer-events-none">並び替え</span>
                  </button>
                </>
              )}

              {isLoadingDelete && (
                <div className={`flex-center min-h-[25px] min-w-[72px]`}>
                  <SpinnerX w="w-[20px]" h="h-[20px]" />
                </div>
              )}
              {activeCell?.role !== "columnheader" &&
                selectedRowDataCompany &&
                selectedRowDataCompany.created_by_company_id === userProfileState?.company_id && (
                  <>
                    {!isLoadingDelete && (
                      <button
                        className={`flex-center transition-bg03 func_btn_red h-[26px] max-h-[25px] min-h-[25px] space-x-2 rounded-[4px] px-[12px] text-[12px]`}
                        onClick={async () => {
                          handleCloseTooltip();

                          if (!userProfileState) return alert("ユーザーデータが見つかりませんでした。エラー：GTA020");
                          if (!userProfileState.account_company_role)
                            return alert("ユーザーデータが見つかりませんでした。エラー：GTA021");
                          // 自分が作成した行か確認 or 自分以外の行を削除できるのはマネージャークラス以上
                          if (selectedRowDataCompany.created_by_user_id !== userProfileState.id) {
                            if (
                              !["company_owner", "company_admin", "company_manager"].includes(
                                userProfileState.account_company_role
                              )
                            ) {
                              return alert(
                                "レコードデータを削除できるのはレコード所有者(自社担当)かマネージャークラス以上の権限を持つユーザーのみです。"
                              );
                            }
                          }

                          // 削除モーダルを開く
                          setIsOpenDeleteModal(true);
                        }}
                        onMouseEnter={(e) => {
                          if (isLoadingDelete) return;
                          handleOpenTooltip({
                            e: e,
                            display: "top",
                            content: `選択中の行レコードデータを削除`,
                            marginTop: 9,
                            itemsPosition: "center",
                          });
                        }}
                        onMouseLeave={handleCloseTooltip}
                      >
                        <MdDeleteOutline className="pointer-events-none text-[16px]" />
                        <span className="pointer-events-none">削除</span>
                      </button>
                    )}
                  </>
                )}

              <button
                className={`flex-center transition-base03 func_btn_green fade08_forward relative h-[25px] max-h-[25px]  min-h-[25px] cursor-pointer space-x-[6px]  rounded-[4px] px-[12px] text-[12px] text-[var(--color-bg-brand-f)]`}
                onClick={() => {
                  if (searchMode) setSearchMode(false); // サーチモード中止
                  if (editSearchMode) setEditSearchMode(false); // 編集モード中止
                  // if (!isOpenDropdownMenuSearchMode) setIsOpenDropdownMenuSearchMode(true);

                  // ----------- インポート画面ルート -----------
                  // // インポート画面を表示
                  // setIsOpenSidebar(false);
                  // setActiveMenuTab("Import");
                  // ----------- インポート画面ルート ここまで -----------

                  // setSelectedRowDataCompany(null);
                  setIsOpenImportModal(true);
                  if (hoveredItemPos) handleCloseTooltip();
                }}
                onMouseEnter={(e) =>
                  handleOpenTooltip({
                    e: e,
                    display: "top",
                    content: `CSVデータから自社専用の会社情報をインポート`,
                    // content2: `「全ての会社」に切り替えが可能です`,
                    // marginTop: 28,
                    marginTop: 9,
                    itemsPosition: "center",
                  })
                }
                onMouseLeave={handleCloseTooltip}
              >
                <SlCloudUpload className="pointer-events-none text-[15px]" />
                <span>インポート</span>
              </button>

              <button
                className={`flex-center transition-base03 h-[26px]  space-x-2 rounded-[4px]  px-[12px] text-[12px]  ${
                  activeCell?.role === "columnheader" && Number(activeCell?.ariaColIndex) !== 1
                    ? `func_btn_green relative h-[25px] max-h-[25px] min-h-[25px] cursor-pointer text-[var(--color-bg-brand-f)]`
                    : "cursor-not-allowed text-[#999]"
                }`}
                onClick={() => {
                  if (!activeCell) return;
                  if (activeCell.ariaColIndex === null) return;
                  // カラムヘッダーでかつ、チェックボックスでないなら
                  if (activeCell.role === "columnheader" && Number(activeCell.ariaColIndex) !== 1) {
                    handleFrozen(Number(activeCell.ariaColIndex) - 2);
                    console.log("クリック フローズン");
                  }
                }}
                onMouseEnter={(e) => {
                  let isColumnHeader = false;
                  let selectedColumn = undefined;
                  let tooltipContent = `カラムヘッダーを選択することで、\n左右スクロール時にカラムを左端に固定できます`;
                  if (activeCell?.ariaColIndex) {
                    isColumnHeader = activeCell?.role === "columnheader";
                    selectedColumn = columnIndexToHeaderObjMap.get(Number(activeCell?.ariaColIndex));
                    if (isColumnHeader && selectedColumn) {
                      if (selectedColumn.isFrozen) tooltipContent = `選択中のカラムの固定を解除`;
                      if (!selectedColumn.isFrozen) tooltipContent = `選択中のカラムを左端に固定`;
                    }
                  }
                  handleOpenTooltip({
                    e: e,
                    display: "top",
                    content: tooltipContent,
                    marginTop: isColumnHeader && selectedColumn ? 8 : 22,
                    itemsPosition: "center",
                  });
                }}
                // onMouseEnter={(e) =>
                //   handleOpenTooltip({
                //     e: e,
                //     display: "top",
                //     content: `${
                //       activeCell?.role === "columnheader" && Number(activeCell?.ariaColIndex) !== 1
                //         ? `選択中のカラムを左端に固定`
                //         : `カラムヘッダーを選択することで、`
                //     }`,
                //     content2: `${
                //       activeCell?.role === "columnheader" && Number(activeCell?.ariaColIndex)
                //         ? ``
                //         : `左右スクロール時にカラムを左端に固定できます`
                //     }`,
                //     marginTop: activeCell?.role === "columnheader" && Number(activeCell?.ariaColIndex) ? 8 : 22,
                //     itemsPosition: "center",
                //   })
                // }
                onMouseLeave={handleCloseTooltip}
              >
                <FiLock className="pointer-events-none" />
                <span className="pointer-events-none">固定</span>
                {/* <span>
                  {activeCell?.classList.contains(`${styles.grid_column_frozen}`) &&
                  activeCell?.role === "columnheader" &&
                  Number(activeCell?.ariaColIndex) !== 1
                    ? "解除"
                    : "固定"}
                </span> */}
              </button>
              {/* <button
                className={`flex-center transition-base03 h-[26px]  cursor-pointer space-x-2  rounded-[4px] px-[15px] text-[12px]  text-[var(--color-bg-brand-f)] ${styles.fh_text_btn}`}
                onClick={() => {
                  console.log("クリック");
                }}
              >
                <span className="pointer-events-none">検索タイプ</span>
              </button> */}
              <button
                // className={`flex-center transition-base03 space-x-[6px] rounded-[4px] px-[12px] text-[12px]  text-[var(--color-bg-brand-f)]  ${
                //   styles.fh_text_btn
                // } relative ${
                //   isOpenDropdownMenuSearchMode
                //     ? `cursor-default active:!bg-[var(--color-btn-brand-f)]`
                //     : `cursor-pointer active:bg-[var(--color-function-header-text-btn-active)]`
                // }`}
                className={`flex-center transition-bg03 func_btn_green relative h-[25px] max-h-[25px] min-h-[25px]  space-x-[6px] rounded-[4px] px-[12px]  text-[12px] text-[var(--color-bg-brand-f)] ${
                  isOpenDropdownMenuSearchMode ? `!cursor-default` : `cursor-pointer`
                }`}
                onClick={() => {
                  if (searchMode) setSearchMode(false); // サーチモード中止
                  if (editSearchMode) setEditSearchMode(false); // 編集モード中止
                  if (!isOpenDropdownMenuSearchMode) setIsOpenDropdownMenuSearchMode(true);
                  if (hoveredItemPos) handleCloseTooltip();
                }}
                onMouseEnter={(e) =>
                  handleOpenTooltip({
                    e: e,
                    display: "top",
                    content: `検索結果を「自社専用会社のみ」`,
                    content2: `「全ての会社」に切り替えが可能です`,
                    marginTop: 28,
                    itemsPosition: "center",
                  })
                }
                onMouseLeave={handleCloseTooltip}
              >
                <FiSearch className="pointer-events-none text-[14px]" />
                {/* <span>サーチモード</span> */}
                <span>モード設定</span>
                {isOpenDropdownMenuSearchMode && (
                  <DropDownMenuSearchMode
                    setIsOpenDropdownMenuSearchMode={setIsOpenDropdownMenuSearchMode}
                    setSelectedRowData={setSelectedRowDataCompany}
                  />
                )}
              </button>
              <RippleButton
                title={`カラム編集`}
                classText="select-none"
                clickEventHandler={() => {
                  const newResetColumnHeaderItemList = JSON.parse(JSON.stringify(columnHeaderItemList));
                  console.log(
                    "🔥🔥🔥モーダル開いた ZustandのリセットStateにパースして格納newResetColumnHeaderItemList",
                    newResetColumnHeaderItemList
                  );
                  setResetColumnHeaderItemList(newResetColumnHeaderItemList);
                  setIsOpenEditColumns(true);
                }}
                onMouseEnterHandler={(e) =>
                  handleOpenTooltip({
                    e: e,
                    display: "top",
                    content: `カラムをまとめて並び替えが可能です`,
                    // content2: `直近売れ先の仕入れ先や、売れ先と同じ取引先を持つ同業他社で導入実績が響く会社など`,
                    // marginTop: 48,
                    // marginTop: 28,
                    marginTop: 9,
                  })
                }
                onMouseLeaveHandler={handleCloseTooltip}
              />
              <ChangeSizeBtn />
              {/* <RippleButton
                title={`ホバーモード`}
                
                classText="select-none"
                clickEventHandler={() => {
                  //   if (tableContainerSize === "one_third") return;
                  //   console.log("クリック コンテナ高さ変更 3分の1");
                  //   setTableContainerSize("one_third");
                  console.log("ホバーモード クリック");
                }}
              /> */}
            </div>
          </div>
          {/* ================== Gridスクロールコンテナ ================== */}
          <div
            ref={parentGridScrollContainer}
            role="grid"
            aria-multiselectable="true"
            style={{ width: "100%" }}
            // style={{ height: "100%", "--header-row-height": "35px" } as any}
            className={`${styles.grid_scroll_container} ${
              tableContainerSize === "one_third" ? `${styles.grid_scroll_container_one_third}` : ``
            } ${tableContainerSize === "half" ? `${styles.grid_scroll_container_half}` : ``}`}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                e.preventDefault(); // セル移動時に上下矢印キーで移動しないようにする
              }
            }}
          >
            {/* ======================== 🌟Grid列トラック Rowヘッダー🌟 ======================== */}
            <div
              role="row"
              tabIndex={-1}
              aria-rowindex={1}
              aria-selected={false}
              className={`${styles.grid_header_row}`}
            >
              {/* ======== ヘッダーセル チェックボックスColumn ======== */}
              <div
                ref={rowHeaderRef}
                role="columnheader"
                aria-colindex={1}
                aria-selected={false}
                tabIndex={-1}
                className={`${styles.grid_column_header_all} ${styles.grid_column_frozen} ${styles.grid_column_header_checkbox_column}`}
                // style={{ gridColumnStart: 1, left: columnHeaderLeft(0), position: "sticky" }}
                style={{ gridColumnStart: 1, left: "0px", position: "sticky" }}
                onClick={(e) => handleClickGridCell(e)}
              >
                <div className={styles.grid_select_cell_header}>
                  <input
                    type="checkbox"
                    aria-label="Select All"
                    checked={!!checkedColumnHeader} // 初期値
                    onChange={(e) => handleAllSelectCheckBox(e)}
                    className={`${styles.grid_select_cell_header_input}`}
                  />
                  <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                  </svg>
                </div>
              </div>
              {/* ======== ヘッダーセル 全てのプロパティ(フィールド)Column ここから  ======== */}

              {
                // allRows[0] &&
                //   Object.keys(allRows[0]).map((key, index) => (
                // !!columnHeaderItemList.length &&
                //   columnHeaderItemList
                !!columnHeaderItemList.length &&
                  [...columnHeaderItemList]
                    .sort((a, b) => a.columnIndex - b.columnIndex) // columnIndexで並び替え
                    .map((key, index) => (
                      <div
                        // key={index}
                        // key={key.columnId}
                        key={key.columnName}
                        ref={(ref) => (colsRef.current[index] = ref)}
                        role="columnheader"
                        draggable={!key.isFrozen} // テスト
                        // draggable={index === 0 ? false : true} // テスト
                        data-column-id={`${key.columnId}`}
                        data-handler-id={`T${key.columnId}${key.columnName}`}
                        data-text={`${key.columnName}`}
                        aria-colindex={key.columnIndex}
                        // aria-colindex={index + 2}
                        aria-selected={false}
                        tabIndex={-1}
                        className={`${styles.grid_column_header_all} ${
                          key.isFrozen ? `${styles.grid_column_frozen} cursor-default` : "cursor-grab"
                        } ${isFrozenCountRef.current === 1 && index === 0 ? styles.grid_cell_frozen_last : ""} ${
                          isFrozenCountRef.current === index + 1 ? styles.grid_cell_frozen_last : ""
                        } ${styles.grid_cell_resizable} dropzone ${key.isOverflow ? `${styles.is_overflow}` : ""}`}
                        // className={`${styles.grid_column_header_all} ${index === 0 && styles.grid_column_frozen} ${
                        //   index === 0 && styles.grid_cell_frozen_last
                        // } ${styles.grid_cell_resizable} dropzone cursor-grab ${
                        //   key.isOverflow ? `${styles.is_overflow}` : ""
                        // }`}
                        style={
                          key.isFrozen
                            ? { gridColumnStart: index + 2, left: `var(--frozen-left-${index})` }
                            : { gridColumnStart: index + 2 }
                        }
                        // style={
                        //   key.isFrozen
                        //     ? { gridColumnStart: index + 2, left: columnLeftPositions.current[index] }
                        //     : { gridColumnStart: index + 2 }
                        // }
                        // style={
                        //   key.isFrozen
                        //     ? { gridColumnStart: index + 2, left: columnHeaderLeft(index) }
                        //     : { gridColumnStart: index + 2 }
                        // }
                        // style={{ gridColumnStart: index + 2, left: columnHeaderLeft(index + 1) }}
                        onClick={(e) => handleClickGridCell(e)}
                        // onDoubleClick={(e) => {
                        //   handleFrozen(index);
                        //   //   handleFrozen(e, index);
                        //   // handleDoubleClick(e, index);
                        // }}
                        onMouseEnter={(e) => {
                          // if (isOverflowColumnHeader.includes(key.columnId.toString())) {
                          // 自社専用会社データのみ詳細説明をツールチップで表示する
                          if (key.columnName === "created_by_company_id") {
                            handleOpenTooltip({
                              e: e,
                              display: "top",
                              content: columnNameToJapanese(key.columnName),
                              content2: "自社で作成した会社データは編集が可能です。",
                              marginTop: 20,
                              itemsPosition: "center",
                            });
                            return;
                          }
                          // 3点リーダーがtrueになっているカラムのみツールチップ表示
                          const el = columnHeaderInnerTextRef.current[index];
                          if (key.isOverflow || (el && el.scrollWidth > el.offsetWidth)) {
                            const columnNameData = key.columnName ? key.columnName : "";
                            handleOpenTooltip({
                              e: e,
                              display: "top",
                              content: columnNameToJapanese(columnNameData),
                            });
                          }
                        }}
                        onMouseLeave={() => {
                          handleCloseTooltip();
                        }}
                        onDragStart={(e) => handleDragStart(e, index)} // テスト
                        onDragEnd={(e) => handleDragEnd(e)} // テスト
                        onDragOver={(e) => {
                          e.preventDefault(); // テスト
                          handleDragOver(e, index);
                        }}
                        // onDragEnter={debounce((e) => {
                        //   handleDragEnter(e, index); // デバウンス
                        // }, 300)}
                        onDragEnter={(e) => {
                          handleDragEnter(e, index);
                        }}
                      >
                        {/* カラム順番入れ替えdraggable用ラッパー(padding 8px除く全体) */}
                        <div
                          ref={(ref) => (draggableColsRef.current[index] = ref)}
                          // draggable={true}
                          className={`draggable_column_header pointer-events-none w-full`}
                          data-handler-id={`T${key.columnId}${key.columnName}`}
                          // className="w-full"
                          // data-handler-id="T1127"
                          // style={{ opacity: 1, cursor: "grab" }}
                        >
                          <div
                            className={`${styles.grid_column_header} ${
                              index === 0 && styles.grid_column_header_cursor
                            } pointer-events-none touch-none select-none`}
                          >
                            <div className={`${styles.grid_column_header_inner} pointer-events-none`}>
                              <span
                                className={`${styles.grid_column_header_inner_name} pointer-events-none`}
                                ref={(ref) => (columnHeaderInnerTextRef.current[index] = ref)}
                              >
                                {language === "en" && key.columnName}
                                {language === "ja" && columnNameToJapanese(key.columnName)}
                              </span>
                            </div>
                          </div>
                        </div>
                        {/* ドラッグ用overlay */}
                        <div
                          ref={(ref) => (draggableOverlaysRef.current[index] = ref)}
                          role="draggable_overlay"
                          className={styles.draggable_overlay}
                          onMouseDown={(e) => handleMouseDown(e, index)}
                          onMouseEnter={() => {
                            const gridScrollContainer = parentGridScrollContainer.current;
                            if (!gridScrollContainer) return;
                            const colsLines = gridScrollContainer.querySelectorAll(`[aria-colindex="${index + 2}"]`);
                            colsLines.forEach((col) => {
                              if (col instanceof HTMLDivElement) {
                                // col.style.borderRightColor = `#24b47e`;
                                col.classList.add(`${styles.is_dragging_hover}`);
                              }
                            });
                          }}
                          onMouseLeave={() => {
                            const gridScrollContainer = parentGridScrollContainer.current;
                            if (!gridScrollContainer) return;
                            const colsLines = gridScrollContainer.querySelectorAll(`[aria-colindex="${index + 2}"]`);
                            colsLines.forEach((col) => {
                              if (col instanceof HTMLDivElement) {
                                // col.style.borderRightColor = `#444`;
                                col.classList.remove(`${styles.is_dragging_hover}`);
                              }
                            });
                          }}
                        ></div>
                      </div>
                    ))
              }
              {/* ======== ヘッダーセル idを除く全てのプロパティ(フィールド)Column ここまで  ======== */}
            </div>
            {/* ======================== 🌟GridRowトラック Rowヘッダー🌟 ======================== */}
            {/* サーチモード中は空のdivを表示 */}
            {searchMode ? (
              <div
                className={`${tableContainerSize === "one_third" ? `${styles.search_mode_container_one_third}` : ``} ${
                  tableContainerSize === "half" ? `${styles.search_mode_container_half}` : ``
                } ${tableContainerSize === "all" ? `${styles.search_mode_container_all}` : ``} flex-center w-[100vw]`}
              >
                {/* {loadingGlobalState && <SpinnerComet />} */}
                {loadingGlobalState && <SpinnerIDS />}
              </div>
            ) : (
              <>
                {/* ======================== 🌟GridRowトラック Rowグループコンテナ🌟 ======================== */}
                {/* Rowアイテム収納のためのインナー要素 */}
                <div
                  ref={gridRowGroupContainerRef}
                  role="rowgroup"
                  style={
                    {
                      height: `${rowVirtualizer.getTotalSize()}px`,
                      // width: "100%",
                      width: `var(--row-width)`,
                      position: "relative",
                      // "--header-row-height": "35px",
                      "--header-row-height": "30px",
                      "--row-width": "",
                    } as any
                  }
                  className={`${styles.grid_rowgroup_virtualized_container}`}
                >
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const isLoaderRow = virtualRow.index > allRows.length - 1;
                    // const rowData = allRows[virtualRow.index];
                    const rowData: ExtendedClient_company = allRows[virtualRow.index];
                    // console.log("rowData.name", rowData.name);

                    // console.log(`rowData`, rowData);
                    // console.log(`rowData.name`, rowData.name);
                    // console.log(
                    //   `${columnOrder.map((obj) => Object.values(rowData)[obj.columnId])}`,
                    //   columnOrder.map((obj) => Object.values(rowData)[obj.columnId])
                    // );

                    // ========= 🌟ローディング中の行トラック =========
                    // if (isLoaderRow) return hasNextPage ? "Loading more" : "Nothing more to load";
                    if (isLoaderRow) {
                      return (
                        <div
                          key={virtualRow.index.toString() + "Loading"}
                          role="row"
                          tabIndex={-1}
                          // aria-rowindex={virtualRow.index + 1} // ヘッダーの次からなのでindex0+2
                          aria-selected={false}
                          className={`${styles.loading_reflection} flex-center mx-auto h-[30px] w-full text-center font-bold`}
                          // className={`${styles.loading_reflection} flex-center mx-auto h-[35px] w-full text-center font-bold`}
                        >
                          <span className={`${styles.reflection}`}></span>
                          <div className={styles.spinner78}></div>
                        </div>
                      );
                    }
                    // ========= 🌟ローディング中の行トラック ここまで =========
                    /* ======================== Grid行トラック Row ======================== */
                    return (
                      <div
                        key={"row" + virtualRow.index.toString()}
                        role="row"
                        tabIndex={-1}
                        aria-rowindex={virtualRow.index + 2} // ヘッダーの次からで+1、indexは0からなので+1で、index0に+2
                        // aria-selected={false}
                        // チェックが入っているか、もしくは列内のセルがクリックされアクティブになっていた場合には該当のrowのaria-selectedをtrueにする
                        aria-selected={
                          checkedRows[virtualRow.index.toString()] || clickedActiveRow === virtualRow.index + 2
                        }
                        // // ================= 🔥🔥テスト🔥🔥==================
                        // className={`${styles.grid_row} ${rowData.id === 1 ? "first" : ""}`}
                        className={`${styles.grid_row} ${evenRowColorChange ? `${styles.even_color_change}` : ``}`}
                        // ================= 🔥🔥テスト🔥🔥==================
                        style={{
                          // gridTemplateColumns: colsWidth.join(" "),
                          // top: gridRowTrackTopPosition(index),
                          // top: ((virtualRow.index + 0) * 35).toString() + "px", // +1か0か
                          top: ((virtualRow.index + 0) * 30).toString() + "px", // +1か0か
                        }}
                      >
                        {/* ======== gridセル チェックボックスセル ======== */}
                        <div
                          ref={(ref) => (gridRowTracksRefs.current[virtualRow.index] = ref)}
                          role="gridcell"
                          aria-colindex={1}
                          aria-selected={false}
                          aria-readonly={true}
                          tabIndex={-1}
                          className={`${styles.grid_cell} ${styles.grid_column_frozen} ${styles.checkbox_cell}`}
                          // style={{ gridColumnStart: 1, left: columnHeaderLeft(0) }}
                          style={{ gridColumnStart: 1, left: "0px" }}
                          onClick={(e) => handleClickGridCell(e)}
                        >
                          <div className={styles.grid_select_cell_header}>
                            <input
                              id="checkbox"
                              type="checkbox"
                              aria-label="Select"
                              // ================= 🔥🔥テスト🔥🔥==================
                              value={rowData?.id}
                              // value={rowData?.id ? rowData?.id : null}
                              // ================= 🔥🔥テスト🔥🔥==================
                              checked={!!checkedRows[virtualRow.index.toString()]} // !!で初期状態でstateがundefinedでもfalseになるようにして、初期エラーを回避する
                              onChange={(e) => {
                                if (typeof rowData?.id === "undefined") return;
                                if (rowData?.id === null) return;
                                console.log(`クリック VirtualRow.index: ${virtualRow.index} row.id${rowData.id}`);
                                handleSelectedCheckBox(e, rowData?.index.toString());
                                // handleSelectedCheckBox(e, rowData?.id);
                              }}
                              // className={`${styles.grid_select_cell_header_input}`}
                            />
                            <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                            </svg>
                          </div>
                        </div>
                        {/* ======== gridセル 全てのプロパティ(フィールド)セル  ======== */}

                        {rowData ? (
                          // カラム順番が変更されているなら順番を合わせてからmap()で展開 上はcolumnNameで呼び出し
                          columnOrder ? (
                            columnOrder
                              .map((columnName) => rowData[columnName])
                              // columnOrder
                              //   .map((obj) => {
                              //     // return { [obj.columnName]: rowData[obj.columnName] };
                              //     return rowData[obj.columnName];
                              //   })
                              // columnOrder
                              //   .map((obj) => Object.values(rowData)[obj.columnId])
                              .map((value, index) => {
                                const columnName = columnHeaderItemList[index]?.columnName;
                                let displayValue = value;
                                displayValue = formatDisplayValue(
                                  columnName,
                                  displayValue,
                                  rowData.created_by_company_id
                                );
                                return (
                                  <div
                                    key={"row" + virtualRow.index.toString() + index.toString()}
                                    role="gridcell"
                                    // ref={(ref) => (colsRef.current[index] = ref)}
                                    // aria-colindex={index + 2}
                                    aria-colindex={
                                      columnHeaderItemList[index] ? columnHeaderItemList[index]?.columnIndex : index + 2
                                    } // カラムヘッダーの列StateのcolumnIndexと一致させる
                                    aria-selected={false}
                                    // variant="contained"
                                    tabIndex={-1}
                                    className={`${styles.grid_cell} ${
                                      columnHeaderItemList[index].isFrozen ? styles.grid_column_frozen : ""
                                    } ${
                                      isFrozenCountRef.current === 1 && index === 0 ? styles.grid_cell_frozen_last : ""
                                    } ${isFrozenCountRef.current === index + 1 ? styles.grid_cell_frozen_last : ""}  ${
                                      styles.grid_cell_resizable
                                    } ${columnName === "name" ? `${styles.company_highlight}` : ``} ${
                                      columnName === "product_categories_large_array" ||
                                      columnName === "product_categories_medium_array" ||
                                      columnName === "product_categories_small_array"
                                        ? `${styles.hashtag}`
                                        : ``
                                    }`}
                                    // className={`${styles.grid_cell} ${index === 0 ? styles.grid_column_frozen : ""}  ${index === 0 ? styles.grid_cell_frozen_last : ""} ${styles.grid_cell_resizable}`}
                                    // style={{ gridColumnStart: index + 2, left: columnHeaderLeft(index + 1) }}
                                    style={
                                      columnHeaderItemList[index].isFrozen
                                        ? {
                                            gridColumnStart: columnHeaderItemList[index]
                                              ? columnHeaderItemList[index]?.columnIndex
                                              : index + 2,
                                            left: `var(--frozen-left-${index})`,
                                          }
                                        : {
                                            gridColumnStart: columnHeaderItemList[index]
                                              ? columnHeaderItemList[index]?.columnIndex
                                              : index + 2,
                                          }
                                    }
                                    // style={
                                    //   columnHeaderItemList[index].isFrozen
                                    //     ? {
                                    //         gridColumnStart: columnHeaderItemList[index]
                                    //           ? columnHeaderItemList[index]?.columnIndex
                                    //           : index + 2,
                                    //         left: columnLeftPositions.current[index],
                                    //       }
                                    //     : {
                                    //         gridColumnStart: columnHeaderItemList[index]
                                    //           ? columnHeaderItemList[index]?.columnIndex
                                    //           : index + 2,
                                    //       }
                                    // }
                                    // style={
                                    //   columnHeaderItemList[index].isFrozen
                                    //     ? {
                                    //         gridColumnStart: columnHeaderItemList[index]
                                    //           ? columnHeaderItemList[index]?.columnIndex
                                    //           : index + 2,
                                    //         left: columnHeaderLeft(index),
                                    //       }
                                    //     : {
                                    //         gridColumnStart: columnHeaderItemList[index]
                                    //           ? columnHeaderItemList[index]?.columnIndex
                                    //           : index + 2,
                                    //       }
                                    // }
                                    // style={{
                                    //   gridColumnStart: columnHeaderItemList[index]
                                    //     ? columnHeaderItemList[index]?.columnIndex
                                    //     : index + 2,
                                    //   left: columnHeaderLeft(index + 1),
                                    // }}
                                    onClick={handleClickGridCell}
                                    onDoubleClick={(e) =>
                                      handleDoubleClick(e, index, columnHeaderItemList[index].columnName)
                                    }
                                    onKeyDown={handleKeyDown}
                                  >
                                    {/* {value} */}
                                    {/* {columnHeaderItemList[index].columnName !== "created_by_company_id" && value} */}
                                    {/* {!["created_by_company_id", "fiscal_end_month"].includes(
                                      columnHeaderItemList[index].columnName
                                    ) && value}
                                    {columnHeaderItemList[index].columnName === "created_by_company_id" &&
                                      rowData.created_by_company_id === userProfileState?.company_id && (
                                        <div className="flex-center h-full w-full">
                                          <BsCheck2 className="pointer-events-none min-h-[22px] min-w-[22px] stroke-1 text-[22px] text-[#00d436]" />
                                        </div>
                                      )}
                                    {columnHeaderItemList[index].columnName === "fiscal_end_month" &&
                                      !!value &&
                                      language === "ja" &&
                                      `${value}月`}
                                    {columnHeaderItemList[index].columnName === "fiscal_end_month" &&
                                      !!value &&
                                      language === "en" &&
                                      `${value}`}
                                    {columnHeaderItemList[index].columnName === "fiscal_end_month" && !value && value} */}
                                    {displayValue}
                                  </div>
                                );
                              })
                          ) : (
                            // カラム順番が変更されていない場合には、初期のallRows[0]のrowからmap()で展開
                            Object.values(rowData).map((value, index) => (
                              <div
                                key={"row" + virtualRow.index.toString() + index.toString()}
                                // ref={(ref) => (colsRef.current[index] = ref)}
                                role="gridcell"
                                // aria-colindex={index + 2}
                                aria-colindex={
                                  columnHeaderItemList[index] ? columnHeaderItemList[index]?.columnIndex : index + 2
                                } // カラムヘッダーの列StateのcolumnIndexと一致させる
                                aria-selected={false}
                                tabIndex={-1}
                                className={`${styles.grid_cell} ${index === 0 ? styles.grid_column_frozen : ""} ${
                                  index === 0 ? styles.grid_cell_frozen_last : ""
                                } ${styles.grid_cell_resizable}`}
                                // style={{ gridColumnStart: index + 2, left: columnHeaderLeft(index + 1) }}
                                style={
                                  columnHeaderItemList[index].isFrozen
                                    ? {
                                        gridColumnStart: columnHeaderItemList[index]
                                          ? columnHeaderItemList[index]?.columnIndex
                                          : index + 2,
                                        left: columnLeftPositions.current[index],
                                      }
                                    : {
                                        gridColumnStart: columnHeaderItemList[index]
                                          ? columnHeaderItemList[index]?.columnIndex
                                          : index + 2,
                                      }
                                }
                                // style={
                                //   columnHeaderItemList[index].isFrozen
                                //     ? {
                                //         gridColumnStart: columnHeaderItemList[index]
                                //           ? columnHeaderItemList[index]?.columnIndex
                                //           : index + 2,
                                //         left: columnHeaderLeft(index),
                                //       }
                                //     : {
                                //         gridColumnStart: columnHeaderItemList[index]
                                //           ? columnHeaderItemList[index]?.columnIndex
                                //           : index + 2,
                                //       }
                                // }
                                // style={{
                                //   gridColumnStart: columnHeaderItemList[index]
                                //     ? columnHeaderItemList[index]?.columnIndex
                                //     : index + 2,
                                //   left: columnHeaderLeft(index + 1),
                                // }}
                                onClick={handleClickGridCell}
                                onDoubleClick={(e) =>
                                  handleDoubleClick(e, index, columnHeaderItemList[index].columnName)
                                }
                              >
                                {value as any}
                              </div>
                            ))
                          )
                        ) : (
                          <div
                            key={virtualRow.index.toString() + "Loading..."}
                            role="row"
                            tabIndex={-1}
                            // aria-rowindex={virtualRow.index + 1} // ヘッダーの次からなのでindex0+2
                            aria-selected={false}
                            className={`${styles.grid_row} z-index absolute w-full bg-slate-300 text-center font-bold text-[red]`}
                            style={{
                              // gridTemplateColumns: colsWidth.join(" "),
                              // top: gridRowTrackTopPosition(index),
                              // top: (virtualRow.index * 35).toString() + "px",
                              bottom: "2.5rem",
                            }}
                          >
                            Loading...
                          </div>
                        )}

                        {/* {rowData &&
                      Object.values(rowData).map((value, index) => (
                        <div
                          key={"row" + virtualRow.index.toString() + index.toString()}
                          role="gridcell"
                          // aria-colindex={index + 2}
                          aria-colindex={
                            columnHeaderItemList[index] ? columnHeaderItemList[index]?.columnIndex : index + 2
                          } // カラムヘッダーの列StateのcolumnIndexと一致させる
                          aria-selected={false}
                          tabIndex={-1}
                          className={`${styles.grid_cell} ${index === 0 ? styles.grid_column_frozen : ""} ${
                            index === 0 ? styles.grid_cell_frozen_last : ""
                          } ${styles.grid_cell_resizable}`}
                          // style={{ gridColumnStart: index + 2, left: columnHeaderLeft(index + 1) }}
                          style={{
                            gridColumnStart: columnHeaderItemList[index]
                              ? columnHeaderItemList[index]?.columnIndex
                              : index + 2,
                            left: columnHeaderLeft(index + 1),
                          }}
                          onClick={(e) => handleClickGridCell(e)}
                          onDoubleClick={(e) => handleDoubleClick(e, index)}
                        >
                          {value}
                        </div>
                      ))} */}
                        {/* ======== ヘッダーセル idを除く全てのプロパティ(フィールド)Column  ======== */}
                      </div>
                    );
                  })}
                </div>
                {/* ======================== GridRowトラック Row ======================== */}
              </>
            )}
          </div>
          {/* ================== Gridスクロールコンテナ ここまで ================== */}
          {/* =============== Gridフッター ここから スクロールコンテナと同列で配置 =============== */}
          <GridTableFooter
            getItemCount={allRows.length}
            // getTotalCount={!!data?.pages[0]?.count ? data.pages[0].count : 0}
            // getTotalCount={!!data?.pages[0]?.count ? data.pages[0].count : null}
            getTotalCount={
              data?.pages[0]?.count !== null && data?.pages[0]?.count !== undefined ? data.pages[0].count : null
            }
          />
          {/* ================== Gridフッター ここまで ================== */}
        </div>
        {/* ================== Gridメインコンテナ ここまで ================== */}
      </div>
      {/* ================== 🌟カラム編集モーダル🌟 ================== */}
      {/* カラム入れ替え編集モーダルボタン */}
      {/* <div className="flex-center fixed bottom-[2%] right-[13%] z-[1000] h-[50px] w-[50px] cursor-pointer">
        <div
          className="h-[50px] w-[50px] rounded-full bg-[var(--color-bg-brand)]"
          onClick={() => {
            const newResetColumnHeaderItemList = JSON.parse(JSON.stringify(columnHeaderItemList));
            console.log(
              "🔥🔥🔥モーダル開いた ZustandのリセットStateにパースして格納newResetColumnHeaderItemList",
              newResetColumnHeaderItemList
            );
            setResetColumnHeaderItemList(newResetColumnHeaderItemList);
            setIsOpenEditColumns(true);
          }}
        ></div>
      </div> */}
      {/* カラム編集モーダル */}
      {/* {isOpenEditColumns && <EditColumnsModal columnHeaderItemList={columnHeaderItemList} />} */}
      {isOpenEditColumns && <EditColumnsModalDisplayOnly columnHeaderItemList={columnHeaderItemList} />}
      {/* ================== 🌟カラム編集モーダル🌟 ここまで ================== */}
      {/* ================== メインコンテナ ここまで ================== */}

      {/* ================== 行レコード削除時の確認モーダル ================== */}
      {isOpenDeleteModal &&
        selectedRowDataCompany &&
        userProfileState &&
        selectedRowDataCompany.created_by_company_id === userProfileState?.company_id && (
          <ConfirmationModal
            titleText={`削除してもよろしいですか？`}
            sectionP1={`確定することで${selectedRowDataCompany.name}は完全に削除され、この会社データに紐づく全ての営業データも確認できなくなります。\nこの操作は確定後、取り消すことができません。`}
            cancelText="戻る"
            submitText="削除を確定"
            buttonColor="red"
            zIndex="3000px"
            zIndexOverlay="2800px"
            withAnnotation={false}
            // annotationText="注：この操作は少し時間がかかります。画面を閉じずにお待ちください。"
            // clickEventSubmit={handleResetA}
            withSelect={false}
            isOverlayBgBlack={true}
            clickEventClose={() => {
              setIsOpenDeleteModal(false);
            }}
            clickEventSubmit={async () => {
              // ローディング開始
              setIsLoadingDelete(true);

              try {
                const companyId = selectedRowDataCompany.id;

                console.log("🔥削除実行 companyId", companyId, "selectedRowDataCompany", selectedRowDataCompany);

                // activitiesテーブルにはmeeting_idでカスケードデリートが設定済みでactivitiesの行も同時に削除されるため、別途DELETEクエリの必要なし
                const { error } = await supabase.from("client_companies").delete().eq("id", companyId);

                if (error) throw error;

                // 削除後にキャッシュをリフレッシュ
                await queryClient.invalidateQueries({ queryKey: ["companies"] });

                // 選択行を空にリセット
                setSelectedRowDataCompany(null);

                toast.success("レコードデータの削除が完了しました！🌠");

                // ローディング終了
                setIsLoadingDelete(false);

                // 削除モーダルを閉じる
                setIsOpenDeleteModal(false);
              } catch (error: any) {
                console.error("削除エラー： GTA022", error);
                toast.error("レコードデータの削除に失敗しました...🙇‍♀️");

                // ローディング終了
                setIsLoadingDelete(false);

                // 削除モーダルを閉じる
                setIsOpenDeleteModal(false);
              }
            }}
          />
        )}
      {/* ================== 行レコード削除時の確認モーダル ここまで ================== */}
    </>
  );
};

export const GridTableAll = memo(GridTableAllMemo);
