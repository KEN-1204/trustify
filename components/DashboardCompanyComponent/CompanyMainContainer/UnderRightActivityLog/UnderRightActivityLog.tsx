import React, { FC, memo, useCallback, useEffect, useRef, useState } from "react";
import styles from "./UnderRightActivityLog.module.css";
import useStore from "@/store";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import useDashboardStore from "@/store/useDashboardStore";
import useRootStore from "@/store/useRootStore";
import { GridTableFooter } from "@/components/GridTable/GridTableFooter/GridTableFooter";
import { UnderRightGridTableFooter } from "./UnderRightGridTableFooter";
import { rightRowData } from "./data";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { format } from "date-fns";
import { debounce } from "lodash";
import { SkeletonLoadingLineFull } from "@/components/Parts/SkeletonLoading/SkeletonLoadingLineFull";
import { SkeletonLoadingLineMedium } from "@/components/Parts/SkeletonLoading/SkeletonLoadingLineMedium";
import { SkeletonLoadingLineLong } from "@/components/Parts/SkeletonLoading/SkeletonLoadingLineLong";
import { SkeletonLoadingLineShort } from "@/components/Parts/SkeletonLoading/SkeletonLoadingLineShort";
import { FiRefreshCw } from "react-icons/fi";
import SpinnerIDS2 from "@/components/Parts/SpinnerIDS/SpinnerIDS2";

type TableDataType = {
  activity_type: string;
  summary: string;
  activity_date: string;
  our_member_name: string;
  our_department: string;
  our_office: string;
};

// type ColumnHeaderList = {
//   activity_type: string;
//   summary: string;
//   date: string;
//   sales: string;
//   department: string;
//   office: string;
// };

const UnderRightActivityLogMemo: FC = () => {
  const language = useStore((state) => state.language);
  //   const language = useRootStore(useStore, (state) => state.language);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const isOpenSidebar = useDashboardStore((state) => state.isOpenSidebar);
  const tableContainerSize = useDashboardStore((state) => state.tableContainerSize);
  // 初回マウント時にdataがフェッチできたらtrueにしてuseEffectでカラム生成を実行するstate
  const [gotData, setGotData] = useState(false);
  // 各カラムの横幅を管理
  const [colsWidth, setColsWidth] = useState<string[] | null>(null);
  // 現在のカラムの横幅をrefで管理
  const currentColsWidths = useRef<string[]>([]);
  // refetchローディング
  const [refetchLoading, setRefetchLoading] = useState(false);
  // 上画面の選択中の行データ会社
  const selectedRowDataCompany = useDashboardStore((state) => state.selectedRowDataCompany);
  // 選択中の行データのid保持用state => 行切り替え(selectedRowDataCompany更新)後に前と今でidが異なるかチェック
  const [currentRowDataCompanyId, setCurrentRowDataCompanyId] = useState<string | null>(null);
  // デバウンスとenableと組み合わせてqueryFnの実行を遅延させる
  const [isFetchingEnabled, setIsFetchingEnabled] = useState(false);
  const fetchEnabledRef = useRef(false);
  // フェッチカウント
  const fetchCountRef = useRef(0);
  // ダブルクリックでセルの詳細を確認
  const setIsOpenEditModal = useDashboardStore((state) => state.setIsOpenEditModal);
  const setTextareaInput = useDashboardStore((state) => state.setTextareaInput);

  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();

  // カラム列全てにindex付きのrefを渡す
  const colsRef = useRef<(HTMLDivElement | null)[]>([]);
  // カラムのテキストの3点リーダー適用有無確認のためのテキストサイズ保持Ref
  const columnHeaderInnerTextRef = useRef<(HTMLSpanElement | null)[]>([]);
  // カラムのリサイズ用オーバーレイ
  const draggableOverlaysRef = useRef<(HTMLDivElement | null)[]>([]);
  // スクロールコンテナDOM
  const parentGridScrollContainer = useRef<HTMLDivElement | null>(null);
  // Rowグループコンテナ(Virtualize収納用インナー)
  const gridRowGroupContainerRef = useRef<HTMLDivElement | null>(null);

  // デバウンス関数をuseRefで保持
  const debouncedEnableFetch = useRef(
    debounce((rowDataId) => {
      if (!rowDataId) return console.log("右下 debounceコールバック関数 selectedRowDataCompany無しのためリターン");
      console.log("右下 3秒後 debounceコールバック関数実行");
      setIsFetchingEnabled(true);
      fetchEnabledRef.current = true;
      setCurrentRowDataCompanyId(rowDataId as string);
    }, 3000)
  ).current;

  if (selectedRowDataCompany?.id !== currentRowDataCompanyId) {
    fetchEnabledRef.current = false;
    console.log(
      "右下 コンポーネント再レンダリング コンポーネントビジネスロジック 選択中の行データのidと保持してるローカルデータidが異なるためfetchEnabledRef.currentをfalseに",
      fetchEnabledRef.current
    );
  }

  // ================== 🌟選択行が変更後3秒デバウンスしてからデータフェッチの許可を通知🌟 ==================
  useEffect(() => {
    console.log("右下 selectedRowDataCompanyの切り替え検知🌟 debouncedEnableFetch実行");
    setIsFetchingEnabled(false); // データフェッチを無効化
    fetchEnabledRef.current = false;
    debouncedEnableFetch(selectedRowDataCompany?.id); // デバウンス処理 3秒後にisFetchingEnabledをtrueに変更

    return () => {
      debouncedEnableFetch.cancel(); // クリーンアップ
    };
  }, [selectedRowDataCompany]);
  // ================== ✅選択行が変更後3秒デバウンスしてからデータフェッチの許可を通知✅ ==================

  const columnNameToJapanese = (columnName: string) => {
    switch (columnName) {
      case "activity_type":
        return "活動タイプ";
        break;
      case "summary":
        return "概要";
        break;
      case "activity_date":
        return "日付";
        break;
      case "our_member_name":
        return "営業担当";
        break;
      case "our_department":
        return "部署";
        break;
      case "our_office":
        return "事業所";
        break;

      default:
        break;
    }
  };

  // 活動タイプ、概要、日付、営業担当、事業部、営業所
  const columnHeaderList = [
    "activity_type",
    "summary",
    "activity_date",
    "our_member_name",
    "our_department",
    "our_office",
  ];

  // ================== 🌟疑似的なサーバーデータフェッチ用の関数🌟 ==================
  const fetchServerPageTest = async (
    limit: number,
    offset: number = 0
  ): Promise<{ rows: TableDataType[]; nextOffset: number; isLastPage: boolean; count: number | null }> => {
    // useInfiniteQueryのクエリ関数で渡すlimitの個数分でIndex番号を付けたRowの配列を生成
    // const rows = new Array(limit).fill(0).map((e, index) => {
    //   const newData: TableDataType = {
    //     activity_type: `TEL発信`,
    //     summary: "50ミクロンで測定したい",
    //     date: "2021/06/01",
    //     sales: "伊藤謙太",
    //     department: "メトロロジ",
    //     office: "東京営業所",
    //   };
    //   return newData;
    // });
    const rows = rightRowData;
    const count = 300;
    const isLastPage = false;

    // 0.3秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
    await new Promise((resolve) => setTimeout(resolve, 300));

    // 取得したrowsを返す（nextOffsetは、queryFnのctx.pageParamsが初回フェッチはundefinedで2回目が1のため+1でページ数と合わせる）
    return { rows, nextOffset: offset + 1, isLastPage, count };
  };
  // ================== ✅疑似的なサーバーデータフェッチ用の関数✅ ==================

  function ensureClientCompanies(data: any): TableDataType[] | null {
    if (Array.isArray(data) && data.length > 0 && "error" in data[0]) {
      // `data` is `GenericStringError[]`
      throw new Error("Failed to fetch client companies at UnderRightActivityLog");
    }
    // `data` is `TableDataType[] | null`
    return data as TableDataType[] | null;
  }

  // .select('name, countries(*)')
  // const columnNameObj = {}

  // ================== 🌟活動履歴を取得する関数🌟 ==================
  let fetchServerPage: (
    limit: number,
    offset: number
  ) => Promise<{ rows: TableDataType[] | null; nextOffset: number; isLastPage: boolean; count: number | null }>;
  // ユーザーのcompany_idが見つからない、もしくは、上テーブルで行を選択していない場合には、右下活動テーブルは行データ無しでnullを返す
  if (!userProfileState?.company_id || !selectedRowDataCompany?.id) {
    fetchServerPage = async (
      limit: number,
      offset: number = 0
    ): Promise<{ rows: TableDataType[] | null; nextOffset: number; isLastPage: boolean; count: number | null }> => {
      const rows = null;
      const isLastPage = true;
      const count = null;

      console.log(
        "右下活動履歴 未選択 userProfileState?.company_id selectedRowDataCompany",
        userProfileState?.company_id,
        selectedRowDataCompany
      );

      // 0.3秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
      await new Promise((resolve) => setTimeout(resolve, 300));

      // 取得したrowsを返す（nextOffsetは、queryFnのctx.pageParamsが初回フェッチはundefinedで2回目が1のため+1でページ数と合わせる）
      return { rows, nextOffset: offset + 1, isLastPage, count };
    };
  }
  // 通常のフェッチ 選択中の会社への自社営業担当者の活動履歴のみ
  if (!!userProfileState?.company_id && !!selectedRowDataCompany?.id) {
    fetchServerPage = async (
      limit: number,
      offset: number = 0
    ): Promise<{ rows: TableDataType[] | null; nextOffset: number; isLastPage: boolean; count: number | null }> => {
      // useInfiniteQueryのクエリ関数で渡すlimitの個数分でIndex番号を付けたRowの配列を生成
      const from = offset * limit;
      const to = from + limit - 1;

      let rows = null;
      let isLastPage = false;
      let count = null;
      try {
        // 選択中の会社に紐づく自社営業担当の全ての活動履歴を取得(自社idと一致するcreated_by_company_idを持つActivities)
        const selectPayload = {
          _our_company_id: userProfileState.company_id,
          _client_company_id: selectedRowDataCompany.id,
        };
        const {
          data,
          error,
          count: fetchCount,
        } = await supabase
          .rpc("get_activities_and_client_companies", selectPayload, { count: "exact" })
          .range(from, to)
          // .order("activity_date", { ascending: true });
          .order("activity_date", { ascending: false });

        if (error) throw error;

        rows = ensureClientCompanies(data);
        // フェッチしたデータの数が期待される数より少なければ、それが最後のページであると判断します
        isLastPage = rows === null || rows.length < limit;
        count = fetchCount;
        console.log(
          "右下活動履歴 fetchServerPage関数フェッチ後 count data",
          count,
          data,
          "offset, limit",
          offset,
          limit,
          "from, to",
          from,
          to,
          "rows",
          rows
        );
      } catch (e: any) {
        console.error(`右下活動履歴 fetchServerPage関数 DBからデータ取得に失敗、エラー: `, e);
        rows = null;
        isLastPage = true;
        count = null;
        return { rows, nextOffset: offset + 1, isLastPage, count };
      }

      // 0.3秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
      await new Promise((resolve) => setTimeout(resolve, 300));

      // 取得したrowsを返す（nextOffsetは、queryFnのctx.pageParamsが初回フェッチはundefinedで2回目が1のため+1でページ数と合わせる）
      // return { rows, nextOffset: offset + 1, isLastPage };
      return { rows, nextOffset: offset + 1, isLastPage, count };
    };
  }
  // ================== ✅活動履歴を取得する関数✅ ==================

  // ================== 🌟useInfiniteQueryフック🌟 ==================
  const {
    status,
    data,
    error,
    isFetching: isFetchingQuery,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isLoading,
  } = useInfiniteQuery({
    // queryKey: ["under_right_activities", "選択した会社名"],
    queryKey: [
      "under_right_activities_companies",
      `${!!selectedRowDataCompany?.id ? selectedRowDataCompany.id : null}`,
    ],
    queryFn: async (ctx) => {
      // return fetchServerPageTest(50, ctx.pageParam); // 50個ずつ取得
      // return fetchServerPage(50, ctx.pageParam); // 50個ずつ取得
      fetchCountRef.current += 1;
      console.log(`右下 queryFn実行🔥🔥🔥 フェッチ${fetchCountRef.current}回目`, fetchCountRef.current);
      const nextPage = await fetchServerPage(50, ctx.pageParam); // 50個ずつ取得
      // const nextPage = await fetchServerPageTest(50, ctx.pageParam); // 50個ずつ取得 テスト
      // setIsFetchingEnabled(false);
      return nextPage;
    },
    // getNextPageParam: (_lastGroup, groups) => groups.length,
    getNextPageParam: (lastGroup, allGroups) => {
      // lastGroup.isLastPageがtrueならundefinedを返す
      return lastGroup.isLastPage ? undefined : allGroups.length;
    },
    staleTime: Infinity,
    enabled: isFetchingEnabled && fetchEnabledRef.current, // デバウンス後にフェッチを有効化(選択行が変更後3秒経過したらフェッチ許可)
  });
  // ================== 🌟useInfiniteQueryフック🌟 ここまで ==================

  // ------------------------ useInfiniteQueryカスタムフック ------------------------
  //   const { status, data, error, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteQueryData();

  // 現在取得している全ての行 data.pagesのネストした配列を一つの配列にフラット化
  const allRows = data ? data.pages.flatMap((d) => d?.rows) : [];

  // ============================= 🌟バーチャライザーのインスタンスを生成🌟 =============================
  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? allRows.length + 1 : allRows.length, // 次のページ有り lengthを１増やす
    getScrollElement: () => parentGridScrollContainer.current, // スクロール用コンテナ
    // estimateSize: () => 35, // 要素のサイズ
    estimateSize: () => 25, // 要素のサイズ
    overscan: 20, // ビューポート外にレンダリングさせる個数
  });
  // 🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟 高さ 🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟
  // ======================== 🌟バーチャライザーのインスタンスを生成🌟 ここまで ========================

  // ============================= 🌟無限スクロールの処理 追加でフェッチ🌟 =============================
  useEffect(() => {
    if (!rowVirtualizer) return;
    // 現在保持している配列内の最後のアイテムをreverseで先頭にしてから分割代入で取得
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();
    if (!lastItem) {
      return;
    }

    // ================= lastItem.indexに到達 追加フェッチ =================
    // 最後のアイテムindexが総数-1を超え、まだフェッチできるページがあり、フェッチ中でないなら
    if (lastItem.index >= allRows.length - 1 && hasNextPage && !isFetchingNextPage) {
      fetchEnabledRef.current = true; // 無限スクロールフェッチのためfetchEnabledRefをtrueに
      // queryFnで設定した関数 limitは10で10個ずつフェッチで設定
      fetchNextPage(); // 追加でフェッチ
    }
    // ================= lastItem.indexに到達 追加フェッチ ここまで =================
  }, [hasNextPage, fetchNextPage, allRows.length, isFetchingNextPage, rowVirtualizer.getVirtualItems()]);
  // ======================= 🌟無限スクロールの処理 追加でフェッチ🌟 ここまで =======================

  // ============================== 🌟無限スクロールの処理 追加でフェッチ ==============================

  // ========================= 🌟useEffect 初回DBからフェッチ完了を通知する🌟 =========================
  useEffect(() => {
    if (gotData) return;
    // 初回マウント データ取得完了後Stateをtrueに変更通知して、カラム生成useEffectを実行
    if (data) {
      setGotData(true);
      return;
    }
  }, [data]);
  // ======================= 🌟useEffect 初回DBからフェッチ完了を通知する🌟 ここまで =======================

  // =============================== 🌟useEffect ヘッダーカラム生成🌟 ===============================
  // // 取得したデータが変更された場合、プロパティ(フィールド)の数が変わる場合があるので、
  // // 変更があった場合には再度カラム列の数とサイズを現在取得しているデータでリセット
  // useEffect(() => {
  //   if (!data?.pages[0]) return;
  //   console.log("🌟ヘッダーカラム生成 gotData ===========================", gotData);

  //   // ========================= 🔥初回ヘッダー生成ルート ルート =========================

  //   // マウント時に各フィールド分のカラムを生成 サイズはデフォルト値を65px, 100px, 3列目以降は250pxに設定 チェックボックスは無いため + 1は不要
  //   // const newColsWidths = new Array(Object.keys(data?.pages[0].rows[0] as object).length + 1).fill("90px");
  //   // const newColsWidths = new Array(Object.keys(data?.pages[0].rows[0] as object).length).fill("90px");
  //   const newColsWidths = columnHeaderList.fill("90px");
  //   newColsWidths.fill("100px", 0, 1); // 1列目を65pxに変更
  //   // newColsWidths.fill("250px", 1, 2); // 2列目を100pxに変更
  //   // calc(100vw - var(--sidebar-width) - 20px - (50vw - var(--sidebar-mini-width)) - 10px - 2px)
  //   newColsWidths.fill(
  //     `${window.innerWidth - 72 - 20 - 20 - 4 - (window.innerWidth / 2 - 72 - 10 - 2) - 90 * 4 - 100}px`,
  //     1,
  //     2
  //   ); // 2列目を100pxに変更
  //   newColsWidths.fill("90px", 2, 3); // 3列目を100pxに変更
  //   newColsWidths.fill("90px", 3, 4); // 3列目を100pxに変更
  //   console.log("Stateにカラムwidthを保存", newColsWidths);
  //   // ['65px', '100px', '250px', '50px', '119px', '142px', '250px', '250px']
  //   // stateに現在の全てのカラムのwidthを保存
  //   setColsWidth(newColsWidths);
  //   currentColsWidths.current = newColsWidths;
  //   // refオブジェクトに保存
  //   currentColsWidths.current = newColsWidths;

  //   if (parentGridScrollContainer.current === null) return;

  //   // ====================== CSSカスタムプロパティに反映 ======================
  //   // newColsWidthの各値のpxの文字を削除
  //   // ['65px', '100px', '250px', '250px', '250px', '250px']から
  //   // ['65', '100', '250', '250', '250', '250']へ置換
  //   const newColsWidthNum = newColsWidths.map((col) => {
  //     const newValue = col.replace("px", "");
  //     return Number(newValue);
  //   });

  //   // それぞれのカラムの合計値を取得 +aで文字列から数値型に変換して合計値を取得
  //   let sumRowWidth = newColsWidthNum.reduce((a, b) => {
  //     // return +a + +b;
  //     return a + b;
  //   });

  //   // それぞれのCSSカスタムプロパティをセット
  //   // grid-template-columnsの値となるCSSカスタムプロパティをセット
  //   parentGridScrollContainer.current.style.setProperty("--template-columns", `${newColsWidths.join(" ")}`);

  //   parentGridScrollContainer.current.style.setProperty("--header-row-height", "25px");
  //   parentGridScrollContainer.current.style.setProperty("--row-width", `${sumRowWidth}px`);

  //   parentGridScrollContainer.current.style.setProperty("--summary-row-height", "25px");
  // }, [gotData]); // gotDataのstateがtrueになったら再度実行
  // ========================== 🌟useEffect ヘッダーカラム生成🌟 ここまで ==========================

  // ================== 🌟セル シングルクリック、ダブルクリックイベント ==================
  // クリックで概要の詳細を確認
  const setTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSingleClickGridCell = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (setTimeoutRef.current !== null) return;

    setTimeoutRef.current = setTimeout(() => {
      setTimeoutRef.current = null;
      // シングルクリック時に実行したい処理
      // 0.2秒後に実行されてしまうためここには書かない
    }, 200);

    console.log("シングルクリック");
  }, []);

  // セルダブルクリック
  const handleDoubleClickGridCell = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, index: number, columnName: string) => {
      console.log("ダブルクリック", e.currentTarget, "index", index);
      if (columnName !== "summary") return console.log("ダブルクリック summaryでないためリターン");

      if (setTimeoutRef.current) {
        clearTimeout(setTimeoutRef.current);

        // console.log(e.detail);
        setTimeoutRef.current = null;
        // ダブルクリック時に実行したい処理

        // クリックした要素のテキストを格納
        // const text = e.currentTarget.innerText;
        const text = e.currentTarget.innerHTML;
        setTextareaInput(text);
        setIsOpenEditModal(true);
      }
    },
    [setTextareaInput, setIsOpenEditModal]
  );
  // ================== 🌟セル シングルクリック、ダブルクリックイベント ここまで ==================

  // ===================== 🌟ツールチップ 3点リーダーの時にツールチップ表示🌟 =====================
  // const handleOpenTooltip = (
  //   e: React.MouseEvent<HTMLElement, MouseEvent>,
  //   display: string,
  //   columnName: string,
  //   marginTop: number = 0
  // ) => {
  const setHoveredItemPos = useStore((state) => state.setHoveredItemPos);
  type TooltipParams = {
    e: React.MouseEvent<HTMLElement, MouseEvent>;
    display: string;
    content: string;
    content2?: string | undefined | null;
    marginTop?: number;
    itemsPosition?: string;
  };
  const handleOpenTooltip = ({
    e,
    display,
    content,
    content2,
    marginTop = 0,
    itemsPosition = "start",
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
      display: display,
      marginTop: marginTop,
      itemsPosition: itemsPosition,
    });
  };
  // ツールチップを非表示
  const handleCloseTooltip = () => {
    setHoveredItemPos(null);
  };
  // ===================== ✅ツールチップ 3点リーダーの時にツールチップ表示✅ =====================

  // 🌟現在のカラム.map((obj) => Object.values(row)[obj.columnId])で展開してGridセルを表示する
  // カラムNameの値のみ配列バージョンで順番入れ替え
  const columnOrder = [...columnHeaderList].map((columnName, index) => columnName as keyof TableDataType); // columnNameのみの配列を取得

  // 「日付」カラムのセルはformat()関数を通してブラウザに表示する
  const formatMapping: {
    activity_date: string;
    // scheduled_follow_up_date: string;
    // activity_created_at: string;
    // activity_updated_at: string;
    [key: string]: string;
  } = {
    activity_date: "yyyy/MM/dd",
    // scheduled_follow_up_date: "yyyy/MM/dd",
    // activity_created_at: "yyyy/MM/dd HH:mm:ss",
    // activity_updated_at: "yyyy/MM/dd HH:mm:ss",
  };

  // console.log("右下 selectedRowDataCompany", selectedRowDataCompany);
  console.log(
    "右下 フェッチ回数",
    fetchCountRef.current,
    "selectedRowDataCompany.id",
    selectedRowDataCompany?.id,
    "selectedRowDataCompany",
    selectedRowDataCompany,
    "右下活動履歴 data",
    data,
    "allRows.length",
    allRows.length,
    "rowVirtualizer.getVirtualItems().length",
    rowVirtualizer.getVirtualItems().length
  );

  return (
    <>
      <div
        className={`${styles.right_activity_log_container}  w-full bg-[var(--color-bg-under-back)] ${
          isOpenSidebar ? `${styles.open} transition-base02` : `${styles.close} transition-base01`
        } ${tableContainerSize === "half" ? `${styles.company_table_screen_pr}` : ``} ${
          tableContainerSize === "all" ? `${styles.company_table_screen_pr}` : ``
        }`}
      >
        {/* ================== テーブルタブヘッダー ================== */}
        <div className={`${styles.right_table_tab_header}`}>
          <span>活動履歴</span>
          <div
            className={`flex-center transition-bg03 group ml-[22px] space-x-[9px] px-[10px] py-[2px] ${
              !!selectedRowDataCompany && !isLoading && status === "success" && !refetchLoading
                ? `cursor-pointer text-[var(--color-text-brand-f)] hover:bg-[var(--color-bg-brand-f)] hover:text-[#fff] active:bg-[var(--color-bg-brand-f-deep)]`
                : `cursor-not-allowed text-[#999]`
            }`}
            onMouseEnter={(e) => {
              if (isLoading) return;
              handleOpenTooltip({
                e: e,
                display: "top",
                content: `活動履歴を最新の状態に更新`,
                // content: `${
                //   !!selectedRowDataCompany?.name
                //     ? `${selectedRowDataCompany.name}の活動履歴を`
                //     : `活動履歴を最新の状態に更新`
                // }`,
                // content2: `${!!selectedRowDataCompany?.name ? `最新の状態に更新` : ``}`,
                // marginTop: 20,
                // marginTop: !!selectedRowDataCompany?.name ? 28 : 9,
                marginTop: 9,
                itemsPosition: "center",
              });
              return;
            }}
            onMouseLeave={handleCloseTooltip}
            onClick={async () => {
              if (!selectedRowDataCompany?.id) return;
              fetchEnabledRef.current = true;
              setRefetchLoading(true);
              await queryClient.invalidateQueries({
                queryKey: ["under_right_activities_companies", `${selectedRowDataCompany.id}`],
              });
              setRefetchLoading(false);
            }}
          >
            {refetchLoading && (
              <div className="relative">
                <div className="mr-[0px] h-[11px] w-[11px]"></div>
                <SpinnerIDS2 fontSize={14} width={14} height={14} left={2} top={2} />
              </div>
            )}
            {!refetchLoading && <FiRefreshCw className="text-[11px]" />}
            <span>リフレッシュ</span>
          </div>
        </div>
        {/* ================== Gridスクロールコンテナ ================== */}
        <div
          ref={parentGridScrollContainer}
          role="grid"
          aria-multiselectable="true"
          style={{ width: "100%" }}
          // style={{ height: "100%", "--header-row-height": "35px" } as any}
          className={`${styles.under_grid_scroll_container}`}
        >
          {/* ======================== 🌟Grid列トラック Rowヘッダー🌟 ======================== */}
          <div
            role="row"
            tabIndex={-1}
            aria-rowindex={1}
            aria-selected={false}
            className={`${styles.grid_header_row}`}
            style={{
              display: "grid",
              gridTemplateColumns: `1fr 3fr repeat(4, 1fr)`,
              minHeight: "25px",
              width: `100%`,
            }}
          >
            {/* ======== ヘッダーセル 全てのプロパティ(フィールド)Column ここから  ======== */}
            {columnHeaderList.map((key, index) => (
              <div
                // key={index}
                key={key}
                ref={(ref) => (colsRef.current[index] = ref)}
                role="columnheader"
                draggable={false}
                aria-colindex={index + 1}
                aria-selected={false}
                tabIndex={-1}
                className={`${styles.grid_column_header_all}`}
                style={{
                  gridColumnStart: index + 1,
                  ...(columnHeaderList.length - 1 === index && { borderRightStyle: "none" }),
                }}
              >
                <div className={`draggable_column_header pointer-events-none w-full`}>
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
                        {language === "en" && key}
                        {language === "ja" && columnNameToJapanese(key)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ======================== 🌟Grid列トラック Rowグループコンテナ🌟 ======================== */}
          {/* {rowVirtualizer.getVirtualItems().length === 0 && !!selectedRowDataCompany && (
            <div
              className={`flex-col-center h-[calc(100%-25px)] w-full ${
                isFetchingQuery && isFetchingEnabled ? `bg-red-100` : ``
              } ${isFetchingQuery && !isFetchingEnabled ? `bg-blue-100` : ``}  ${
                !isFetchingQuery && isFetchingEnabled ? `bg-green-100` : ``
              }  ${!isFetchingQuery && !isFetchingEnabled ? `bg-yellow-100` : ``}`}
            >
              <span className={`text-[var(--color-text-sub)]`}>この会社への活動履歴はまだありません。</span>
              {isFetchingQuery && (
                <span className={`text-[var(--color-text-sub)]`}>useInfiniteQuery queryFn実行中</span>
              )}
              {isFetchingQuery && (
                <span className={`text-[var(--color-text-sub)]`}>useInfiniteQuery queryFn停止中</span>
              )}
              {isFetchingEnabled && <span className={`text-[var(--color-text-sub)]`}>isFetchingEnabledはtrue</span>}
              {!isFetchingEnabled && <span className={`text-[var(--color-text-sub)]`}>isFetchingEnabledはfalse</span>}
            </div>
          )} */}
          {/* テスト用 */}
          {/* {!(allRows.length > 0) && (
            <div
              className={`flex-col-center h-[calc(100%-25px)] w-full ${
                isLoading && isFetchingEnabled ? `bg-red-100` : ``
              } ${isLoading && !isFetchingEnabled ? `bg-blue-100` : ``}  ${
                !isLoading && isFetchingEnabled ? `bg-green-100` : ``
              }  ${!isLoading && !isFetchingEnabled ? `bg-yellow-100` : ``}`}
            >
              <span>rowエリア</span>
              {status === "success" && rowVirtualizer.getVirtualItems().length === 0 && !!selectedRowDataCompany && (
                <span className={`text-[var(--color-text-sub)]`}>この会社への活動履歴はまだありません。</span>
              )}
              {status === "loading" && (
                <span className={`text-[var(--color-text-sub)]`}>フェッチローディング中...</span>
              )}
              {status === "error" && <span className={`text-[var(--color-text-sub)]`}>エラー...</span>}
              {isLoading && <span className={`text-[var(--color-text-sub)]`}>useInfiniteQuery isLoadingはtrue</span>}
              {!isLoading && <span className={`text-[var(--color-text-sub)]`}>useInfiniteQuery isLoadingはfalse</span>}
              {isFetchingEnabled && <span className={`text-[var(--color-text-sub)]`}>isFetchingEnabledはtrue</span>}
              {!isFetchingEnabled && <span className={`text-[var(--color-text-sub)]`}>isFetchingEnabledはfalse</span>}
            </div>
          )} */}
          {rowVirtualizer.getVirtualItems().length === 0 && !!selectedRowDataCompany && !isLoading && (
            <div className={`flex-col-center h-[calc(100%-25px)] w-full`}>
              <span className={`text-[var(--color-text-sub)]`}>この客先への活動履歴はまだありません。</span>
            </div>
          )}
          {!(allRows.length > 0) && !!selectedRowDataCompany && isLoading && (
            <div className={`flex h-[calc(100%-25px)] w-full flex-col space-y-[22px] px-[15px] py-[15px]`}>
              {/* <span>rowエリア</span> */}
              {/* <SpinnerIDS scale={"scale-[0.45]"} /> */}
              {/* <SpinnerComet w="48px" h="48px" /> */}
              {/* <SpinnerX w="w-[42px]" h="h-[42px]" /> */}
              <div className="flex flex-col space-y-[10px]">
                <SkeletonLoadingLineFull rounded="rounded-[6px]" />
                <SkeletonLoadingLineFull rounded="rounded-[6px]" />
                <SkeletonLoadingLineMedium rounded="rounded-[6px]" />
              </div>
              <div className="flex flex-col space-y-[10px]">
                <SkeletonLoadingLineLong rounded="rounded-[6px]" />
                <SkeletonLoadingLineShort rounded="rounded-[6px]" />
              </div>
            </div>
          )}

          {/* <div className="flex-col-center h-[calc(100%-25px)] w-full bg-blue-100">
              
            </div> */}

          {/* Rowアイテム収納のためのインナー要素 */}
          {allRows.length > 0 && rowVirtualizer.getVirtualItems().length > 0 && (
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
                  "--header-row-height": "25px",
                  "--row-width": "",
                } as any
              }
              // style={
              //   {
              //     height: `${rowVirtualizer.getTotalSize()}px`,
              //     // width: "100%",
              //     width: `var(--row-width)`,
              //     position: "relative",
              //     // "--header-row-height": "35px",
              //     "--header-row-height": "25px",
              //     "--row-width": "",
              //   } as any
              // }
              className={`${styles.grid_rowgroup_virtualized_container}`}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const isLoaderRow = virtualRow.index > allRows.length - 1;
                const rowData = allRows[virtualRow.index];

                // console.log(`右下 rowData`, rowData);
                // console.log(`rowData.name`, rowData.name);
                // console.log(
                //   `${columnOrder.map((obj) => Object.values(rowData)[obj.columnId])}`,
                //   columnOrder.map((obj) => Object.values(rowData)[obj.columnId])
                // );

                // ========= 🌟初回表示時は上テーブルのデータを選択していないため右下活動履歴にはnullで空を表示 =========
                if (!rowData) {
                  return null;
                }
                // if (!rowData || allRows.length === 0) {
                //   return (
                //     <div key={virtualRow.index.toString() + "nothing"} className="flex-center h-full w-full bg-red-100">
                //       <span>この会社への活動履歴はまだありません。</span>
                //     </div>
                //   );
                // }

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
                      className={`${styles.loading_reflection} h-[25px] w-full  text-center font-bold`}
                      // className={`${styles.loading_reflection} flex-center mx-auto h-[35px] w-full text-center font-bold`}
                    >
                      <span className={`${styles.reflection}`}></span>
                      <div className={styles.spinner78}></div>
                    </div>
                  );
                }
                // ========= 🌟ローディング中の行トラック ここまで =========
                /* ======================== Grid列トラック Row ======================== */
                return (
                  <div
                    key={"row" + virtualRow.index.toString()}
                    role="row"
                    tabIndex={-1}
                    aria-rowindex={virtualRow.index + 2} // ヘッダーの次からで+1、indexは0からなので+1で、index0に+2
                    aria-selected={false}
                    className={`${styles.grid_row}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: `1fr 3fr repeat(4, 1fr)`,
                      minHeight: "25px",
                      width: `100%`,
                      top: ((virtualRow.index + 0) * 25).toString() + "px", // +1か0か
                    }}
                    // style={{
                    //   top: ((virtualRow.index + 0) * 25).toString() + "px", // +1か0か
                    // }}
                  >
                    {/* ======== gridセル 全てのプロパティ(フィールド)セル  ======== */}

                    {rowData ? (
                      // カラム順番が変更されているなら順番を合わせてからmap()で展開 上はcolumnNameで呼び出し
                      columnOrder
                        .map((columnName) => rowData[columnName])
                        .map((value, index) => {
                          const columnName = columnHeaderList[index];
                          let displayValue = value;
                          // 「日付」のカラムのセルには、formatして表示する
                          if (columnName in formatMapping && !!value) {
                            displayValue = format(new Date(value), formatMapping[columnName]);
                          }
                          return (
                            <div
                              key={"row" + virtualRow.index.toString() + index.toString()}
                              role="gridcell"
                              aria-colindex={index + 1} // カラムヘッダーの列StateのcolumnIndexと一致させる
                              aria-selected={false}
                              tabIndex={-1}
                              className={`${styles.grid_cell} ${styles.grid_cell_resizable}`}
                              style={{
                                gridColumnStart: index + 1,
                                ...(columnHeaderList[index] === "summary" && { cursor: "pointer" }),
                              }}
                              onClick={handleSingleClickGridCell}
                              onDoubleClick={(e) => handleDoubleClickGridCell(e, index, columnHeaderList[index])}
                            >
                              {/* {value} */}
                              {displayValue}
                            </div>
                          );
                        })
                    ) : (
                      // カラム順番が変更されていない場合には、初期のallRows[0]のrowからmap()で展開
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

                    {/* ======== ヘッダーセル idを除く全てのプロパティ(フィールド)Column  ======== */}
                  </div>
                );
              })}
            </div>
          )}
          {/* ======================== Grid列トラック Row ======================== */}
        </div>
        {/* ================== Gridスクロールコンテナ ここまで ================== */}
        {/* =============== Gridフッター ここから スクロールコンテナと同列で配置 =============== */}
        <UnderRightGridTableFooter
          getItemCount={allRows.length}
          getTotalCount={
            data?.pages[0]?.count !== null && data?.pages[0]?.count !== undefined ? data.pages[0].count : null
          }
        />
        {/* ================== Gridフッター ここまで ================== */}
      </div>
    </>
  );
};

export const UnderRightActivityLog = memo(UnderRightActivityLogMemo);
