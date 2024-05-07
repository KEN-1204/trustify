import { Dispatch, Fragment, SetStateAction, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./SalesTargetGridTable.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { columnNameToJapaneseSalesTarget } from "@/utils/columnNameToJapaneseSalesTarget";
import useStore from "@/store";
import {
  ColumnHeaderItemList,
  Department,
  DisplayKeys,
  EntitiesHierarchy,
  Entity,
  EntityGroupByParent,
  EntityLevelNames,
  EntityLevels,
  FiscalYears,
  Office,
  SalesTargetFYRowData,
  SalesTargetsRowDataWithYoY,
  Section,
  SectionMenuParams,
  Unit,
} from "@/types";
import { InfiniteData, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { formatToJapaneseYen } from "@/utils/Helpers/formatToJapaneseYen";
import { isValidNumber } from "@/utils/Helpers/isValidNumber";
import { testRowData, testRowDataLastYear, testRowDataPercent } from "./data";
import useRootStore from "@/store/useRootStore";
import useThemeStore from "@/store/useThemeStore";
import { ProgressCircle } from "@/components/Parts/Charts/ProgressCircle/ProgressCircle";
import { ProgressNumber } from "@/components/Parts/Charts/ProgressNumber/ProgressNumber";
import { IoCaretDownOutline, IoChevronDownOutline } from "react-icons/io5";
import { FaChevronDown } from "react-icons/fa";
import { ImInfo } from "react-icons/im";
import { MdOutlineDataSaverOff } from "react-icons/md";
import { BsCheck2 } from "react-icons/bs";
import { mappingSectionName } from "@/utils/selectOptions";
import { formatDisplayPrice } from "@/utils/Helpers/formatDisplayPrice";
import { generateMonthHeaders } from "@/utils/Helpers/CalendarHelpers/generateMonthHeaders";
import { format } from "date-fns";
import { calculateDateToYearMonth } from "@/utils/Helpers/calculateDateToYearMonth";
import Decimal from "decimal.js";
import { calculateGrowth } from "@/utils/Helpers/PercentHelpers/calculateGrowth";
import { calculateYearOverYear } from "@/utils/Helpers/PercentHelpers/calculateYearOverYear";
import { SpinnerX } from "@/components/Parts/SpinnerX/SpinnerX";
import { GrPowerReset } from "react-icons/gr";
import { TbSnowflake, TbSnowflakeOff } from "react-icons/tb";
import { mappingEntityName } from "@/utils/mappings";
import { convertToJapaneseCurrencyFormatInYen } from "@/utils/Helpers/Currency/convertToJapaneseCurrencyFormatInYen";

// entityLevel: company / department...
type Props = {
  entityLevel: string;
  // entityNameTitle: string;
  // entityId: string;
  entities: Entity[];
  parentEntityLevel?: string;
  parentEntityId?: string;
  parentEntityNameTitle?: string;
  divName: string;
  //   isMain: boolean;
  fetchEnabled?: boolean; // メイン目標でない場合はfetchEnabledがtrueに変更されたらフェッチを許可する
  onFetchComplete?: () => void;
  companyId: string;
  stickyRow: string | null;
  setStickyRow: Dispatch<SetStateAction<string | null>>;
};

// 事業部〜メンバーレベルを表示するためのサブ目標テーブル
const SalesTargetGridTableSubMemo = ({
  entityLevel,
  // entityNameTitle,
  // entityId,
  entities,
  parentEntityLevel,
  parentEntityId,
  parentEntityNameTitle,
  divName,
  fetchEnabled,
  onFetchComplete,
  companyId,
  stickyRow,
  setStickyRow,
}: Props) => {
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();
  const language = useStore((state) => state.language);
  const theme = useRootStore(useThemeStore, (state) => state.theme);

  //
  const salesTargetColumnHeaderItemList = useDashboardStore((state) => state.salesTargetColumnHeaderItemList);
  const setSalesTargetColumnHeaderItemList = useDashboardStore((state) => state.setSalesTargetColumnHeaderItemList);
  const mainEntityTarget = useDashboardStore((state) => state.mainEntityTarget);
  const setMainEntityTarget = useDashboardStore((state) => state.setMainEntityTarget);
  // 現在表示中の会計年度
  const selectedFiscalYearTarget = useDashboardStore((state) => state.selectedFiscalYearTarget);
  const setSelectedFiscalYearTarget = useDashboardStore((state) => state.setSelectedFiscalYearTarget);
  // 会計年度の選択肢 2020年度から現在まで
  const optionsFiscalYear = useDashboardStore((state) => state.optionsFiscalYear);
  // ユーザーの期首Dateと期末Date
  const fiscalYearStartEndDate = useDashboardStore((state) => state.fiscalYearStartEndDate);
  // 🔹現在の顧客の会計年月度 202303
  const currentFiscalStartYearMonth = useDashboardStore((state) => state.currentFiscalStartYearMonth);
  // 🔹売上目標フェッチ時の年月度の12ヶ月分の配列
  const annualFiscalMonths = useDashboardStore((state) => state.annualFiscalMonths);
  // 🔹前年度売上フェッチ時の年月度の前年度の12ヶ月分の配列
  const lastAnnualFiscalMonths = useDashboardStore((state) => state.lastAnnualFiscalMonths);
  // テーブルに表示するデータセットキー 「売上目標・前年度売上・前年比」: ["salesTargets", "lastYearSales", "yoyGrowth"]
  const displayKeys = useDashboardStore((state) => state.displayKeys);
  const setDisplayKeys = useDashboardStore((state) => state.setDisplayKeys);
  // 表示期間(年度全て・上期詳細・下期詳細)
  const displayTargetPeriodType = useDashboardStore((state) => state.displayTargetPeriodType);

  // const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  // const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  // const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  // const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Entity | null>(null);
  const [selectedSection, setSelectedSection] = useState<Entity | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Entity | null>(null);
  const [selectedOffice, setSelectedOffice] = useState<Entity | null>(null);

  if (!mainEntityTarget) return null;
  if (!fiscalYearStartEndDate) return null;
  if (!currentFiscalStartYearMonth) return null;
  if (!annualFiscalMonths) return null;
  if (!selectedFiscalYearTarget) return null;
  if (!lastAnnualFiscalMonths) return null;

  // エンティティMap
  const entitiesIdToObjMap = useMemo(() => {
    return new Map(entities.map((entity) => [entity.entity_id, entity]));
  }, [entities]);

  // ========================= 🌟事業部・課・係・事業所リスト取得useQuery キャッシュ🌟 =========================
  const departmentDataArray: Department[] | undefined = queryClient.getQueryData(["departments"]);
  const sectionDataArray: Section[] | undefined = queryClient.getQueryData(["sections"]);
  const unitDataArray: Unit[] | undefined = queryClient.getQueryData(["units"]);
  const officeDataArray: Office[] | undefined = queryClient.getQueryData(["offices"]);
  // ========================= 🌟事業部・課・係・事業所リスト取得useQuery キャッシュ🌟 =========================

  // 「事業部」「課・セクション」「係・チーム」「事業所」のid to objectオブジェクトマップ生成
  // 事業部マップ {id: 事業部オブジェクト}
  const departmentIdToObjMap = useMemo(() => {
    if (!departmentDataArray?.length) return null;
    const departmentMap = new Map(departmentDataArray.map((obj) => [obj.id, obj]));
    return departmentMap;
  }, [departmentDataArray]);
  // 課・セクションマップ {id: 課・セクションオブジェクト}
  const sectionIdToObjMap = useMemo(() => {
    if (!sectionDataArray?.length) return null;
    const sectionMap = new Map(sectionDataArray.map((obj) => [obj.id, obj]));
    return sectionMap;
  }, [sectionDataArray]);
  // 係マップ {id: 係オブジェクト}
  const unitIdToObjMap = useMemo(() => {
    if (!unitDataArray?.length) return null;
    const unitMap = new Map(unitDataArray.map((obj) => [obj.id, obj]));
    return unitMap;
  }, [unitDataArray]);
  // 事業所マップ {id: 事業所オブジェクト}
  const officeIdToObjMap = useMemo(() => {
    if (!officeDataArray?.length) return null;
    const officeMap = new Map(officeDataArray.map((obj) => [obj.id, obj]));
    return officeMap;
  }, [officeDataArray]);

  // ======================= 🌟現在の選択した事業部で課・セクションを絞り込むuseEffect🌟 =======================
  // const [filteredSectionBySelectedDepartment, setFilteredSectionBySelectedDepartment] = useState<Section[]>([]);
  const [filteredSectionBySelectedDepartment, setFilteredSectionBySelectedDepartment] = useState<Entity[]>([]);
  // ======================= ✅現在の選択した事業部でチームを絞り込むuseEffect✅ =======================
  // ======================= 🌟現在の選択した事業部で課・セクションを絞り込むuseEffect🌟 =======================
  // const [filteredUnitBySelectedDepartment, setFilteredUnitBySelectedDepartment] = useState<Unit[]>([]);
  // const [filteredUnitBySelectedSection, setFilteredUnitBySelectedSection] = useState<Unit[]>([]);
  const [filteredUnitBySelectedSection, setFilteredUnitBySelectedSection] = useState<Entity[]>([]);
  // ======================= ✅現在の選択した事業部でチームを絞り込むuseEffect✅ =======================

  // 🔹 ------------------------------------------ 🔹ローカルstate関連🔹 ------------------------------------------
  // 🌟売上目標テーブル専用
  const [salesTableContainerSize, setSalesTableContainerSize] = useState<string>("one_third");
  // ローディング
  const [isLoadingTarget, setIsLoadingTarget] = useState(false);
  // ローディングリフレッシュ
  const [isLoadingRefresh, setIsLoadingRefresh] = useState(false);
  // 🌟売上目標テーブル専用 ここまで
  // カードサイズ
  // 各カラムの横幅を管理
  const [colsWidth, setColsWidth] = useState<string[] | null>(null);
  // =================== 列入れ替え ===================
  // 列入れ替え用インデックス
  const [dragColumnIndex, setDragColumnIndex] = useState<number | null>(null);
  // 初回マウント時にdataがフェッチできたらtrueにしてuseEffectでカラム生成を実行するstate
  const [gotData, setGotData] = useState(false);
  // 総アイテムのチェック有り無しを保持するstate
  const [checkedRows, setCheckedRows] = useState<Record<string, boolean>>({});
  // ヘッダーチェック有無state
  const [checkedColumnHeader, setCheckedColumnHeader] = useState(false);
  // 現在のアイテム取得件数
  const [getItemCount, setGetItemCount] = useState(0);
  // ONとなったチェックボックスを保持する配列のstate
  const [selectedCheckBox, setSelectedCheckBox] = useState<string[]>([]);

  // 🔹 ------------------------------------------ 🔹ref関連🔹 ------------------------------------------
  const parentGridScrollContainer = useRef<HTMLDivElement | null>(null);
  // カラムヘッダーDOM
  const rowHeaderRef = useRef<HTMLDivElement | null>(null);
  // カラム列全てにindex付きのrefを渡す
  const colsRef = useRef<(HTMLDivElement | null)[]>([]);
  // ドラッグ要素用divRef
  const draggableColsRef = useRef<(HTMLDivElement | null)[]>([]);
  // isFrozenがtrueの個数を取得 初回はidの列をisFrozen: trueでカラム生成するため初期値は1にする
  const isFrozenCountRef = useRef<number>(1);
  // それぞれのカラムのLeftの位置を保持 isFrozenがtrueになったときにindexから値を取得してleftに付与 id列の2列目から
  const columnLeftPositions = useRef<number[]>([]);
  // カラムのテキストの3点リーダー適用有無確認のためのテキストサイズ保持Ref
  const columnHeaderInnerTextRef = useRef<(HTMLSpanElement | null)[]>([]);
  // カラムのリサイズ用オーバーレイ
  const draggableOverlaysRef = useRef<(HTMLDivElement | null)[]>([]);
  // 現在のカラムの横幅をrefで管理
  const currentColsWidths = useRef<string[]>([]);
  // Rowグループコンテナ(Virtualize収納用インナー)
  const gridRowGroupContainerRef = useRef<HTMLDivElement | null>(null);
  // フォーカス中、選択中のセルを保持
  const selectedGridCellRef = useRef<HTMLDivElement | null>(null);
  const [activeCell, setActiveCell] = useState<HTMLDivElement | null>(null);
  // 前回のアクティブセル
  const prevSelectedGridCellRef = useRef<HTMLDivElement | null>(null);
  // GridセルDOM
  const gridRowTracksRefs = useRef<(HTMLDivElement | null)[]>([]);
  // 年度select Ref
  const selectPeriodRef = useRef<HTMLSelectElement | null>(null);

  // infoアイコン
  const infoIconTitleRef = useRef<HTMLDivElement | null>(null);

  // 🔹 ------------------------------------------ 🔹変数関連🔹 ------------------------------------------
  // propsで受け取った会計年度の昨年度
  const lastFiscalYear = useMemo(() => selectedFiscalYearTarget - 1, [selectedFiscalYearTarget]);
  // propsで受け取った会計年度の昨年度の下2桁
  const lastFiscalYear2Digits = useMemo(() => lastFiscalYear.toString().slice(2), [selectedFiscalYearTarget]);
  // propsで受け取った会計年度の一昨年
  const lastLastFiscalYear = useMemo(() => selectedFiscalYearTarget - 2, [selectedFiscalYearTarget]);
  // propsで受け取った会計年度の一昨年の下2桁
  const lastLastFiscalYear2Digits = useMemo(() => lastLastFiscalYear.toString().slice(2), [selectedFiscalYearTarget]);
  // ユーザーの会計年度の開始年月度
  // const currentFiscalStartYearMonth = useMemo(
  //   () => calculateDateToYearMonth(fiscalYearStartEndDate.startDate, fiscalYearStartEndDate.endDate.getDate()),
  //   [fiscalYearStartEndDate]
  // );
  // ヘッダーに表示する会計月度の12ヶ月分の配列 ユーザーの年度初めが開始月度
  const fiscalStartMonthsArray = useMemo(
    () => generateMonthHeaders(Number(currentFiscalStartYearMonth.toString().slice(-2))),
    [fiscalYearStartEndDate]
  );

  // ========================= 🌟総合目標の目標と前年度売上を取得useQuery キャッシュ🌟 =========================
  // ========================= 🌟総合目標の目標と前年度売上を取得Zustand🌟 =========================
  const mainTotalTargets = useDashboardStore((state) => state.mainTotalTargets);
  // ========================= 🌟総合目標の目標と前年度売上を取得Zustand🌟 =========================
  // const mainEntityQueryData:
  //   | InfiniteData<{
  //       rows: SalesTargetsRowDataWithYoY[] | null;
  //       nextOffset: number;
  //       isLastPage: boolean;
  //       count: number | null;
  //     }>
  //   | undefined = queryClient.getQueryData([
  //   "sales_targets",
  //   `${selectedFiscalYearTarget}`,
  //   mainEntityTarget?.parentEntityLevel ?? null,
  //   mainEntityTarget?.entityLevel ?? null,
  //   mainEntityTarget?.parentEntityId ?? null,
  //   "main",
  // ]);
  // const mainSalesTargetRow = useMemo(() => {
  //   if (!mainEntityQueryData) return null;
  //   return mainEntityQueryData && !!mainEntityQueryData.pages?.length && !!mainEntityQueryData.pages[0]?.rows?.length
  //     ? mainEntityQueryData.pages[0].rows[0]
  //     : null;
  // }, [mainEntityQueryData]);
  // console.log(
  //   "✅🔥✅🔥✅🔥✅🔥✅🔥✅🔥 mainEntityQueryData",
  //   mainEntityQueryData,
  //   "mainSalesTargetRow",
  //   mainSalesTargetRow
  // );
  // ========================= 🌟総合目標の目標と前年度売上を取得useQuery キャッシュ🌟 =========================

  // ================== 🌟useInfiniteQueryフック🌟 ==================
  function ensureTargetsRowData(data: any): SalesTargetFYRowData[] {
    if (!Array.isArray(data) || !data?.length) {
      const placeholderSalesTargetArray = entities.map((entity) => {
        return {
          share: entityLevel === "company" ? 100 : 0,
          dataset_type: "sales_target",
          entity_id: entity.entity_id,
          entity_level: entity.entity_level,
          entity_name: entity.entity_name,
          // created_by_company_id: entity.entity_level === "company" ? entity.entity_id : null,
          // created_by_department_id: entity.entity_level === "department" ? entity.entity_id : null,
          // created_by_section_id: entity.entity_level === "section" ? entity.entity_id : null,
          // created_by_unit_id: entity.entity_level === "unit" ? entity.entity_id : null,
          // created_by_user_id: entity.entity_level === "member" ? entity.entity_id : null,
          // created_by_office_id: entity.entity_level === "office" ? entity.entity_id : null,
          fiscal_year: null,
          first_half: null,
          second_half: null,
          first_quarter: null,
          second_quarter: null,
          third_quarter: null,
          fourth_quarter: null,
          month_01: null,
          month_02: null,
          month_03: null,
          month_04: null,
          month_05: null,
          month_06: null,
          month_07: null,
          month_08: null,
          month_09: null,
          month_10: null,
          month_11: null,
          month_12: null,
        } as SalesTargetFYRowData;
      });

      console.log(
        "❌売上目標データ無し placeholderを返す",
        "placeholderSalesTargetArray",
        placeholderSalesTargetArray,
        "entities",
        entities
      );

      return placeholderSalesTargetArray;
      // throw new Error("売上目標の取得に失敗しました。data", data);
    }
    // `data` is `SalesTargetsRowDataWithYoY[] | null`
    if (entityLevel !== "member") {
      return data as SalesTargetFYRowData[];
    } else {
      const memberSalesTargetArray = (data as SalesTargetFYRowData[]).map((row) => {
        // メンバーエンティティで年度目標が取得できている場合はそのままrowをリターン
        if (Object.keys(row).includes("fiscal_year") && row?.fiscal_year !== null && row?.fiscal_year !== undefined) {
          return row;
        }
        // メンバーエンティティで年度目標が取得できていない場合は上期と下期の売上目標を合算して年度目標を追加
        let totalFiscalYear = 0;
        try {
          const firstHalfDecimal = new Decimal(row.first_half ?? 0);
          const secondHalfDecimal = new Decimal(row.second_half ?? 0);
          totalFiscalYear = firstHalfDecimal.plus(secondHalfDecimal).toNumber();
        } catch (error: any) {
          totalFiscalYear = (row.first_half ?? 0) + (row.second_half ?? 0);
          console.log("❌memberSalesTargetArray totalFiscalYear Decimalエラー", totalFiscalYear);
        }

        return {
          ...row,
          fiscal_year: totalFiscalYear,
        };
      });

      return memberSalesTargetArray;
    }
  }
  function ensureLastSalesRowData(data: any): SalesTargetFYRowData[] {
    if (!Array.isArray(data) || !data?.length) {
      const placeholderLastYearSalesArray = entities.map((entity) => {
        return {
          share: entityLevel === "company" ? 100 : 0,
          dataset_type: "last_year_sales",
          entity_id: entity.entity_id,
          entity_level: entity.entity_level,
          entity_name: entity.entity_name,
          // created_by_company_id: entity.entity_level === "company" ? entity.entity_id : null,
          // created_by_department_id: entity.entity_level === "department" ? entity.entity_id : null,
          // created_by_section_id: entity.entity_level === "section" ? entity.entity_id : null,
          // created_by_unit_id: entity.entity_level === "unit" ? entity.entity_id : null,
          // created_by_user_id: entity.entity_level === "member" ? entity.entity_id : null,
          // created_by_office_id: entity.entity_level === "office" ? entity.entity_id : null,
          fiscal_year: 0,
          first_half: 0,
          second_half: 0,
          first_quarter: 0,
          second_quarter: 0,
          third_quarter: 0,
          fourth_quarter: 0,
          month_01: 0,
          month_02: 0,
          month_03: 0,
          month_04: 0,
          month_05: 0,
          month_06: 0,
          month_07: 0,
          month_08: 0,
          month_09: 0,
          month_10: 0,
          month_11: 0,
          month_12: 0,
        } as SalesTargetFYRowData;
      });

      console.log(
        "❌前年度売上実績データ無し placeholderを返す",
        "placeholderLastYearSalesArray",
        placeholderLastYearSalesArray,
        "entities",
        entities
      );

      return placeholderLastYearSalesArray;
      // throw new Error("前年度売上の取得に失敗しました。data", data);
    }
    // `data` is `SalesTargetsRowDataWithYoY[] | null`
    return data as SalesTargetFYRowData[];
  }
  function ensureClientCompanies(data: any): SalesTargetsRowDataWithYoY[] | null {
    if (Array.isArray(data) && data.length > 0 && "error" in data[0]) {
      throw new Error("売上目標の取得に失敗しました。");
    }
    // `data` is `SalesTargetsRowDataWithYoY[] | null`
    return data as SalesTargetsRowDataWithYoY[] | null;
  }

  // ================== 🌟活動履歴を取得する関数🌟 ==================
  // let fetchServerPage: any;
  let fetchServerPage: (
    limit: number,
    offset: number
  ) => Promise<{
    rows: SalesTargetsRowDataWithYoY[] | null;
    nextOffset: number;
    isLastPage: boolean;
    count: number | null;
  }>;
  // ユーザーのcompany_idが見つからない、もしくは、上テーブルで行を選択していない場合には、右下活動テーブルは行データ無しでnullを返す
  // if (!entityLevel || !selectedFiscalYearTarget || !entityId) {
  if (!entityLevel || !selectedFiscalYearTarget || !entities || !entities?.length) {
    fetchServerPage = async (
      limit: number,
      offset: number = 0
    ): Promise<{
      rows: SalesTargetsRowDataWithYoY[] | null;
      nextOffset: number;
      isLastPage: boolean;
      count: number | null;
    }> => {
      const rows = null;
      const isLastPage = true;
      const count = null;

      console.log(
        "queryFn関数実行 fetchServerPage entityLevel",
        entityLevel,
        "entities",
        entities,
        // "entityId",
        // entityId,
        "selectedFiscalYearTarget",
        selectedFiscalYearTarget
      );

      // 0.5秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
      await new Promise((resolve) => setTimeout(resolve, 300));

      // 取得したrowsを返す（nextOffsetは、queryFnのctx.pageParamsが初回フェッチはundefinedで2回目が1のため+1でページ数と合わせる）
      return { rows, nextOffset: offset + 1, isLastPage, count };
    };
  }
  // 通常のフェッチ 選択中の会社への自社営業担当者の活動履歴のみ
  else {
    fetchServerPage = async (
      limit: number,
      offset: number = 0
    ): Promise<{
      rows: SalesTargetsRowDataWithYoY[] | null;
      nextOffset: number;
      isLastPage: boolean;
      count: number | null;
    }> => {
      // useInfiniteQueryのクエリ関数で渡すlimitの個数分でIndex番号を付けたRowの配列を生成
      const from = offset * limit;
      const to = from + limit - 1;

      let salesTargetRows: SalesTargetFYRowData[] = [];
      let lastYearSalesRows: SalesTargetFYRowData[] = [];
      let yoyGrowthRows: SalesTargetFYRowData[] = [];
      let rows = null;
      let isLastPage = false;
      let count = null;
      try {
        const entityIds = entities.map((entity) => entity.entity_id);
        const entityStructureIds = entities.map((entity) => entity.id);
        // 🔹メイン目標 特定のエンティティIDのみ取得
        // 🔸売上目標を取得するFUNCTIONの実行

        // 🔸売上目標と前年度売上実績を一緒に取得するFUNCTIONの実行
        const payload = {
          _company_id: companyId,
          _entity_level: entityLevel, // エンティティタイプ
          // _entity_id: entityId, // エンティティのid
          // _entity_name: entityNameTitle, // エンティティ名 マイクロスコープ事業部など
          _entity_ids: entityIds, // エンティティのid
          _entity_structure_ids: entityStructureIds, // エンティティテーブルのid
          _fiscal_year: selectedFiscalYearTarget, // 選択した会計年度
          // _start_year_month: currentFiscalStartYearMonth, // 202304の年度初めの年月度
          // _end_year_month:
          //   fiscalYearStartEndDate.endDate.getFullYear() * 100 + fiscalYearStartEndDate.endDate.getMonth() + 1, // 202403の決算日の年月度 ユーザーの会計年度のカレンダー年月
          _start_year_month: annualFiscalMonths.month_01, // annualから取得する
          _end_year_month: annualFiscalMonths.month_12, // annualから取得する
          // SELECTクエリで作成するカラム用
          _month_01: annualFiscalMonths.month_01,
          _month_02: annualFiscalMonths.month_02,
          _month_03: annualFiscalMonths.month_03,
          _month_04: annualFiscalMonths.month_04,
          _month_05: annualFiscalMonths.month_05,
          _month_06: annualFiscalMonths.month_06,
          _month_07: annualFiscalMonths.month_07,
          _month_08: annualFiscalMonths.month_08,
          _month_09: annualFiscalMonths.month_09,
          _month_10: annualFiscalMonths.month_10,
          _month_11: annualFiscalMonths.month_11,
          _month_12: annualFiscalMonths.month_12,
        };
        console.log(
          "🔥 queryFn関数実行 get_sales_targets_and_ly_sales_for_fy_all実行 payload",
          payload,
          "entityIds",
          entityIds,
          "entityStructureIds",
          entityStructureIds,
          "selectedFiscalYearTarget",
          selectedFiscalYearTarget
        );
        const {
          data: salesTargetData,
          error,
          count: fetchCount,
        } = await supabase
          .rpc("get_sales_targets_and_ly_sales_for_fy_all", payload, { count: "exact" })
          // .eq("created_by_company_id", companyId)
          .range(from, to);

        if (error) throw error;

        console.log("✅get_sales_targets_and_ly_sales_for_fy_all実行成功 salesTargetData", salesTargetData);

        // メンバーレベルの年度目標はここで上期と下期の目標を合算して補完
        salesTargetRows = ensureTargetsRowData(salesTargetData?.sales_targets); // SalesTargetFYRowData型チェック
        lastYearSalesRows = ensureLastSalesRowData(salesTargetData?.last_year_sales); // SalesTargetFYRowData型チェック

        const lastYearSalesRowsMap = new Map(lastYearSalesRows.map((row) => [row.entity_id, row]));

        // 🔸前年比の算出 「(今年の数値 - 去年の数値) / 去年の数値 * 100」の公式を使用して前年比を算出
        yoyGrowthRows = salesTargetRows.map((target, index) => {
          const sales_target_entityId = target.entity_id;
          // const lySales = lastYearSalesRows.find((lys) => lys.entity_id === sales_target_entityId);
          const lySales = lastYearSalesRowsMap.get(sales_target_entityId);
          // const lySales = lastYearSalesRows[index];

          const resultFY = calculateYearOverYear(target?.fiscal_year, lySales?.fiscal_year, 1);
          const result1H = calculateYearOverYear(target?.first_half, lySales?.first_half, 1);
          const result2H = calculateYearOverYear(target?.second_half, lySales?.second_half, 1);
          const result1Q = calculateYearOverYear(target?.first_quarter, lySales?.first_quarter, 1);
          const result2Q = calculateYearOverYear(target?.second_quarter, lySales?.second_quarter, 1);
          const result3Q = calculateYearOverYear(target?.third_quarter, lySales?.third_quarter, 1);
          const result4Q = calculateYearOverYear(target?.fourth_quarter, lySales?.fourth_quarter, 1);
          const resultMonth01 = calculateYearOverYear(target?.month_01, lySales?.month_01, 1);
          const resultMonth02 = calculateYearOverYear(target?.month_02, lySales?.month_02, 1);
          const resultMonth03 = calculateYearOverYear(target?.month_03, lySales?.month_03, 1);
          const resultMonth04 = calculateYearOverYear(target?.month_04, lySales?.month_04, 1);
          const resultMonth05 = calculateYearOverYear(target?.month_05, lySales?.month_05, 1);
          const resultMonth06 = calculateYearOverYear(target?.month_06, lySales?.month_06, 1);
          const resultMonth07 = calculateYearOverYear(target?.month_07, lySales?.month_07, 1);
          const resultMonth08 = calculateYearOverYear(target?.month_08, lySales?.month_08, 1);
          const resultMonth09 = calculateYearOverYear(target?.month_09, lySales?.month_09, 1);
          const resultMonth10 = calculateYearOverYear(target?.month_10, lySales?.month_10, 1);
          const resultMonth11 = calculateYearOverYear(target?.month_11, lySales?.month_11, 1);
          const resultMonth12 = calculateYearOverYear(target?.month_12, lySales?.month_12, 1);

          console.log(
            "result2H",
            result2H,
            "target?.second_half",
            target?.second_half,
            "lySales?.second_half",
            lySales?.second_half
          );
          console.log(
            "result4Q",
            result4Q,
            "target?.fourth_quarter",
            target?.fourth_quarter,
            "lySales?.fourth_quarter",
            lySales?.fourth_quarter
          );
          console.log(
            "resultMonth12",
            resultMonth12,
            "target?.month_12",
            target?.month_12,
            "lySales?.month_12",
            lySales?.month_12
          );

          return {
            ...target,
            share: null,
            dataset_type: "yoy_growth",
            // 前年比(伸び率) 25.7%の小数点第1位までの数値部分で算出してセット
            fiscal_year: !resultFY.error ? Number(resultFY.yearOverYear) : null, // 年度
            first_half: !result1H.error ? Number(result1H.yearOverYear) : null,
            second_half: !result2H.error ? Number(result2H.yearOverYear) : null,
            first_quarter: !result1Q.error ? Number(result1Q.yearOverYear) : null,
            second_quarter: !result2Q.error ? Number(result2Q.yearOverYear) : null,
            third_quarter: !result3Q.error ? Number(result3Q.yearOverYear) : null,
            fourth_quarter: !result4Q.error ? Number(result4Q.yearOverYear) : null,
            month_01: !resultMonth01.error ? Number(resultMonth01.yearOverYear) : null,
            month_02: !resultMonth02.error ? Number(resultMonth02.yearOverYear) : null,
            month_03: !resultMonth03.error ? Number(resultMonth03.yearOverYear) : null,
            month_04: !resultMonth04.error ? Number(resultMonth04.yearOverYear) : null,
            month_05: !resultMonth05.error ? Number(resultMonth05.yearOverYear) : null,
            month_06: !resultMonth06.error ? Number(resultMonth06.yearOverYear) : null,
            month_07: !resultMonth07.error ? Number(resultMonth07.yearOverYear) : null,
            month_08: !resultMonth08.error ? Number(resultMonth08.yearOverYear) : null,
            month_09: !resultMonth09.error ? Number(resultMonth09.yearOverYear) : null,
            month_10: !resultMonth10.error ? Number(resultMonth10.yearOverYear) : null,
            month_11: !resultMonth11.error ? Number(resultMonth11.yearOverYear) : null,
            month_12: !resultMonth12.error ? Number(resultMonth12.yearOverYear) : null,
          } as SalesTargetFYRowData;
        });

        console.log("✅前年比算出結果 yoyGrowthRows", yoyGrowthRows);

        const yoyGrowthRowsMap = new Map(yoyGrowthRows.map((row) => [row.entity_id, row]));

        // 売上目標と前年度売上は先頭にシェアを追加(メインのため100%)
        salesTargetRows = salesTargetRows?.length
          ? (salesTargetRows.map((obj) => {
              let _share = 0;
              try {
                if (!mainTotalTargets?.sales_targets) throw new Error("❌mainTotalTargets?.sales_targets無し");
                if (displayTargetPeriodType === "fiscal_year") {
                  const _totalTargetFY = mainTotalTargets?.sales_targets.fiscal_year;
                  if (!isValidNumber(_totalTargetFY)) throw new Error("❌総合目標金額無し");
                  const totalDecimalFY = new Decimal(_totalTargetFY!);
                  const subEntityDecimalFY = new Decimal(obj.fiscal_year ?? 0);
                  _share = Number(
                    subEntityDecimalFY.dividedBy(totalDecimalFY).times(100).toFixed(0, Decimal.ROUND_HALF_UP)
                  );
                }
                if (displayTargetPeriodType === "first_half") {
                  const _totalTargetFH = mainTotalTargets?.sales_targets.first_half;
                  if (!isValidNumber(_totalTargetFH)) throw new Error("❌総合目標金額無し");
                  const totalDecimalFH = new Decimal(_totalTargetFH!);
                  const subEntityDecimalFH = new Decimal(obj.first_half ?? 0);
                  _share = Number(
                    subEntityDecimalFH.dividedBy(totalDecimalFH).times(100).toFixed(0, Decimal.ROUND_HALF_UP)
                  );
                }
                if (displayTargetPeriodType === "second_half") {
                  const _totalTargetSH = mainTotalTargets?.sales_targets.second_half;
                  if (!isValidNumber(_totalTargetSH)) throw new Error("❌総合目標金額無し");
                  const totalDecimalSH = new Decimal(_totalTargetSH!);
                  const subEntityDecimalSH = new Decimal(obj.second_half ?? 0);
                  _share = Number(
                    subEntityDecimalSH.dividedBy(totalDecimalSH).times(100).toFixed(0, Decimal.ROUND_HALF_UP)
                  );
                }
              } catch (e: any) {
                console.log("queryFn内シェア算出", e);
              }

              console.log(
                "🌠🌠🌠🌠🌠🌠🌠🌠🌠🌠🌠シェア",
                _share,
                "mainTotalTargets",
                mainTotalTargets,
                "displayTargetPeriodType",
                displayTargetPeriodType
              );

              return {
                ...obj,
                share: _share,
              };
            }) as (SalesTargetFYRowData & { share: number })[])
          : [];
        lastYearSalesRows = lastYearSalesRows?.length
          ? (lastYearSalesRows.map((obj) => {
              let _share = 0;
              try {
                if (!mainTotalTargets?.last_year_sales) throw new Error("❌mainTotalTargets?.last_year_sales無し");
                if (displayTargetPeriodType === "fiscal_year") {
                  const _totalTargetFY = mainTotalTargets?.last_year_sales.fiscal_year;
                  if (!isValidNumber(_totalTargetFY)) throw new Error("❌総合目標金額無し");
                  const totalDecimalFY = new Decimal(_totalTargetFY!);
                  const subEntityDecimalFY = new Decimal(obj.fiscal_year ?? 0);
                  _share = subEntityDecimalFY.dividedBy(totalDecimalFY).toNumber();
                }
                if (displayTargetPeriodType === "first_half") {
                  const _totalTargetFH = mainTotalTargets?.last_year_sales.first_half;
                  if (!isValidNumber(_totalTargetFH)) throw new Error("❌総合目標金額無し");
                  const totalDecimalFH = new Decimal(_totalTargetFH!);
                  const subEntityDecimalFH = new Decimal(obj.first_half ?? 0);
                  _share = subEntityDecimalFH.dividedBy(totalDecimalFH).toNumber();
                }
                if (displayTargetPeriodType === "second_half") {
                  const _totalTargetSH = mainTotalTargets?.last_year_sales.second_half;
                  if (!isValidNumber(_totalTargetSH)) throw new Error("❌総合目標金額無し");
                  const totalDecimalSH = new Decimal(_totalTargetSH!);
                  const subEntityDecimalSH = new Decimal(obj.second_half ?? 0);
                  _share = subEntityDecimalSH.dividedBy(totalDecimalSH).toNumber();
                }
              } catch (e: any) {
                console.log("queryFn内シェア算出", e);
              }
              return {
                ...obj,
                share: _share,
                entity_name: entitiesIdToObjMap.get(obj?.entity_id) ?? "No Data", // propertiesテーブルから取得する前年度売上にはエンティティ名は取得できないので、ここでエンティティidに対応するエンティティ名を追加する
              };
            }) as (SalesTargetFYRowData & { share: number })[])
          : [];

        // １行３セット(３行)にまとめてrowsを生成して返す
        rows = salesTargetRows.map((target, index) => {
          const targetEntityId = target.entity_id;
          return {
            sales_targets: target,
            last_year_sales: lastYearSalesRowsMap.get(targetEntityId),
            yoy_growth: yoyGrowthRowsMap.get(targetEntityId),
            // last_year_sales: lastYearSalesRows[index],
            // yoy_growth: yoyGrowthRows[index],
          };
        }) as SalesTargetsRowDataWithYoY[];

        console.log("✅rows結果", rows);

        // rows = ensureClientCompanies(data);
        isLastPage = rows === null || rows.length < limit; // フェッチしたデータの数が期待される数より少なければ、それが最後のページであると判断します
        count = fetchCount;
        // 🔹サブ目標 メイン目標を100%として構成する個別のエンティティの目標
      } catch (e: any) {
        console.error(`fetchServerPage関数 DBからデータ取得に失敗、エラー: `, e);
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
  // ================== 🌟活動履歴を取得する関数🌟 ここまで ==================
  const {
    status,
    data,
    error,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isSuccess: isSuccessQuery,
    isError: isErrorQuery,
  } = useInfiniteQuery({
    // queryKey: ["sales_targets", entityLevel ?? null, `${fiscalYear}`],
    queryKey: [
      "sales_targets",
      `${selectedFiscalYearTarget}`,
      mainEntityTarget?.parentEntityLevel ?? null,
      mainEntityTarget?.entityLevel ?? null,
      mainEntityTarget?.parentEntityId ?? null,
      "sub",
    ],
    queryFn: async (ctx) => {
      console.log("🔥queryFn実行サブ mainTotalTargets", mainTotalTargets);
      const nextPage = await fetchServerPage(50, ctx.pageParam); // 50個ずつ取得
      // const nextPage = await fetchServerPageTest(50, ctx.pageParam); // 50個ずつ取得
      console.log("✅queryFn成功 nextPage", nextPage);
      return nextPage;
    },
    // getNextPageParam: (_lastGroup, groups) => groups.length,
    getNextPageParam: (lastGroup, allGroups) => {
      // lastGroup.isLastPageがtrueならundefinedを返す
      return lastGroup.isLastPage ? undefined : allGroups.length;
    },
    staleTime: Infinity,
    // enabled: isFetchingEnabled && fetchEnabledRef.current, // デバウンス後にフェッチを有効化(選択行が変更後3秒経過したらフェッチ許可)
    // enabled: !!entityId && !!entityLevel && isMain ? true : fetchEnabled,
    enabled: !!entities && !!entityLevel && fetchEnabled && !!mainTotalTargets, // 総合目標データの取得が完了したらフェッチを許可
  });
  // ================== 🌟useInfiniteQueryフック🌟 ここまで ==================

  // -------------------- 🌠useQueryでフェッチが完了したら次のテーブルをアクティブにする🌠 --------------------
  // useEffect(() => {
  //   // 総合目標のフェッチが完了したら、子エンティティのフェッチを許可する。=> 総合目標の各目標金額を子エンティティテーブルで取得してシェアを算出する
  //     if (isSuccessQuery || isErrorQuery) {
  //       if (onFetchComplete) onFetchComplete();
  //     }
  // }, [isSuccessQuery, isErrorQuery]);
  // -------------------- 🌠useQueryでフェッチが完了したら次のテーブルをアクティブにする🌠 --------------------

  const Rows = data && data.pages[0]?.rows ? data.pages.flatMap((d) => d?.rows) : [];
  const allRows = Rows.map((obj, index) => {
    return { index, ...obj };
  });
  // ================= 🔥🔥テスト🔥🔥ここまで==================

  const rowHeight = 48;

  // ============================= 🌟バーチャライザーのインスタンスを生成🌟 =============================
  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? allRows.length + 1 : allRows.length, // 次のページ有り lengthを１増やす
    getScrollElement: () => parentGridScrollContainer.current, // スクロール用コンテナ
    // estimateSize: () => 35, // 要素のサイズ
    // estimateSize: () => 30, // 要素のサイズ
    // estimateSize: () => 42, // 要素のサイズ
    // estimateSize: () => 48, // 要素のサイズ
    estimateSize: () => rowHeight, // 要素のサイズ
    // overscan: 20, // ビューポート外にレンダリングさせる個数
    overscan: 10, // ビューポート外にレンダリングさせる個数
  });
  // ======================== 🌟バーチャライザーのインスタンスを生成🌟 ここまで ========================

  // ============================= 🌟無限スクロールの処理 追加でフェッチ🌟 =============================
  useEffect(() => {
    if (!rowVirtualizer) return console.log("無限スクロール関数 rowVirtualizerインスタンス無し");
    // 現在保持している配列内の最後のアイテムをreverseで先頭にしてから分割代入で取得
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();
    console.log("無限スクロールuseEffect lastItem", lastItem);
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
    const localStorageColumnHeaderItemListJSON = localStorage.getItem(`grid_columns_sales_target_sub`);
    // const localStorageColumnHeaderItemListJSON = localStorage.getItem("grid_columns_contacts");
    if (localStorageColumnHeaderItemListJSON) {
      console.log("useEffect ローカルストレージルート🔥");
      // まずはローカルストレージから取得したColumnHeaderItemListのJSONをJSオブジェクトにパース
      const localStorageColumnHeaderItemList: ColumnHeaderItemList[] = JSON.parse(localStorageColumnHeaderItemListJSON);
      // まずはローカルストレージから取得したColumnHeaderItemListをローカルStateに格納
      setSalesTargetColumnHeaderItemList(localStorageColumnHeaderItemList);
      // isFrozenがtrueの個数をRefに格納
      isFrozenCountRef.current = localStorageColumnHeaderItemList.filter((obj) => obj.isFrozen === true).length;
      // console.log("ローカルストレージルート localStorageColumnHeaderItemList", localStorageColumnHeaderItemList);
      // contactColumnHeaderItemListからcolumnwidthのみを取得
      const newColsWidths = localStorageColumnHeaderItemList.map((item) => item.columnWidth);
      // console.log("ローカルストレージルート tempColsWidth", newColsWidths);
      // チェックボックスの65pxの文字列をnewColsWidthsの配列の手前に格納
      // newColsWidths.unshift("65px");
      // newColsWidths.unshift("42px");
      newColsWidths.unshift(`48px`);
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
      parentGridScrollContainer.current.style.setProperty("--header-row-height", "35px");
      // parentGridScrollContainer.current.style.setProperty("--grid-row-height", "42px");
      parentGridScrollContainer.current.style.setProperty("--grid-row-height", `${rowHeight}px`);
      // parentGridScrollContainer.current.style.setProperty("--header-row-height", "35px");
      parentGridScrollContainer.current.style.setProperty("--row-width", `${sumRowWidth}px`);
      parentGridScrollContainer.current.style.setProperty("--summary-row-height", "35px");
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
    // if (data?.pages[0].rows === null) return;
    // ================= 🔥🔥テスト🔥🔥==================
    // console.log(
    //   "🌟useEffect Object.keys(data?.pages[0].rows[0] as object",
    //   Object.keys(data?.pages[0].rows[0] as object)
    // );
    // const newColsWidths = new Array(Object.keys(data?.pages[0].rows[0] as object).length + 1).fill("120px");
    const newColsWidths = new Array(salesTargetColumnHeaderItemList.length + 1).fill("120px");
    // newColsWidths.fill("65px", 0, 1); // 1列目を65pxに変更
    // newColsWidths.fill("42px", 0, 1); // 1列目を42pxに変更
    newColsWidths.fill("48px", 0, 1); // 1列目を48pxに変更
    // newColsWidths.fill("100px", 1, 2); // 2列目を100pxに変更 id
    // companyの場合は100、それ以外は150
    if (entityLevel === "company") {
      newColsWidths.fill("100px", 1, 2); // 2列目を100pxに変更 id
    } else {
      newColsWidths.fill("150px", 1, 2); // 2列目を100pxに変更 id
    }
    // newColsWidths.fill("100px", 2, 3); // 2列目を100pxに変更 法人番号
    // newColsWidths.fill("200px", 3, 4); // 4列目を100pxに変更 会社名
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
    parentGridScrollContainer.current.style.setProperty("--header-row-height", "35px");
    // parentGridScrollContainer.current.style.setProperty("--grid-row-height", "42px");
    parentGridScrollContainer.current.style.setProperty("--grid-row-height", `${rowHeight}px`);
    // parentGridScrollContainer.current.style.setProperty("--header-row-height", "35px");
    parentGridScrollContainer.current.style.setProperty("--row-width", `${sumRowWidth}px`);
    parentGridScrollContainer.current.style.setProperty("--summary-row-height", "35px");
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
    const tempFirstColumnItemListArray = salesTargetColumnHeaderItemList.map((item) => item.columnName);
    const firstColumnItemListArray = tempFirstColumnItemListArray.map((item, index) => {
      // 初回カラム生成は最初の列（現在はid列）はisFrozenとisLastDrozenをtrueにする
      // displayKeysのデータセットが２つ以上の場合は３列目(シェア含む)のデータ種別までフローズンで固定にする
      if (index === 0 || (displayKeys.length >= 2 && index === 1)) {
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
    console.log(`初回ヘッダー生成 初期カラム配列`, tempFirstColumnItemListArray);
    console.log(`初回ヘッダー生成 整形後カラム配列`, firstColumnItemListArray);
    setSalesTargetColumnHeaderItemList(firstColumnItemListArray);
    // isFrozenがtrueの個数をRefに格納
    isFrozenCountRef.current = firstColumnItemListArray.filter((obj) => obj.isFrozen === true).length;

    // ================ ✅ローカルストレージにも更新後のカラムリストを保存 ================
    const salesTargetColumnHeaderItemListJSON = JSON.stringify(firstColumnItemListArray);
    localStorage.setItem(`grid_columns_sales_target_sub`, salesTargetColumnHeaderItemListJSON);
    // localStorage.setItem("grid_columns_contacts", contactColumnHeaderItemListJSON);
    // ================ ✅ローカルストレージにも更新後のカラムリストを保存 ここまで ================
  }, [gotData]); // gotDataのstateがtrueになったら再度実行
  // ========================== 🌟useEffect ヘッダーカラム生成🌟 ここまで ==========================

  // ================================== 🌟マウスイベント 列サイズ変更🌟 ==================================
  const handleMouseDown = (e: React.MouseEvent, index: number) => {
    e.preventDefault();

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

      console.log("マウスアップ✅ currentColsWidths.current", currentColsWidths.current);
      setColsWidth(currentColsWidths.current);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);

      // ================ salesTargetColumnHeaderItemListも合わせてサイズを更新 テスト ================
      let newColumnHeaderItemList: any[] = [];
      const copyColumnHeaderItemList = [...salesTargetColumnHeaderItemList];
      copyColumnHeaderItemList.forEach((item) => {
        item.columnWidth = currentColsWidths.current[item.columnIndex - 1];
        newColumnHeaderItemList.push(item);
        // return item;
      });
      console.log("🌟🔥 newColumnHeaderItemList", newColumnHeaderItemList);
      setSalesTargetColumnHeaderItemList(newColumnHeaderItemList);
      // ================ salesTargetColumnHeaderItemListも合わせてサイズを更新 テスト ================

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
      const salesTargetColumnHeaderItemListJSON = JSON.stringify(newColumnHeaderItemList);
      localStorage.setItem(`grid_columns_sales_target_sub`, salesTargetColumnHeaderItemListJSON);
      // localStorage.setItem("grid_columns_contacts", contactColumnHeaderItemListJSON);
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
      const filteredIsFrozenList = salesTargetColumnHeaderItemList.filter((item) => item.isFrozen === true);
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
  // ============================== 🌟マウスイベント 列サイズ変更🌟 ここまで ==============================

  // ================== 🌟セル シングルクリック、ダブルクリックイベント ==================
  // ================== 🌟GridCellクリックでセルを選択中アクティブセルstateに更新🌟 ==================
  const setTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [clickedActiveRow, setClickedActiveRow] = useState<number | null>(null);

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
      // setSelectedRowDataQuotation(allRows[Number(selectedGridCellRef.current?.parentElement?.ariaRowIndex) - 2]);
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
        // const text = e.currentTarget.innerHTML;
        // setTextareaInput(text);

        // setIsOpenEditModal(true);
      }
    },
    [allRows]
  );
  // ================== 🌟GridCellクリックでセルを選択中アクティブセルstateに更新🌟 ここまで ==================

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
      // setSelectedRowDataQuotation(allRows[Number(selectedGridCellRef.current.parentElement?.ariaRowIndex) - 2]);

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
      // setSelectedRowDataQuotation(allRows[Number(selectedGridCellRef.current.parentElement?.ariaRowIndex) - 2]);

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
  // ======================== 🌟セル選択時に上下矢印キーでセルを上下に移動可能にする🌟 ここまで ========================

  // ==================== 🌟チェックボックスクリックでstateに選択したアイテムのidを追加🌟 ====================
  // ================= 🔥🔥テスト🔥🔥==================
  // const handleSelectedCheckBox = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
  const handleSelectedCheckBox = (e: React.ChangeEvent<HTMLInputElement>, index: string) => {
    // ================= 🔥🔥テスト🔥🔥==================
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
  // ================= 🌟チェックボックスクリックでstateに選択したアイテムのidを追加🌟 ここまで =================

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
    const draggingElementColIndex = salesTargetColumnHeaderItemList[dragColumnIndex].columnIndex;
    const dropElementColIndex = salesTargetColumnHeaderItemList[dropIndex!].columnIndex;
    const draggingElementColWidth = salesTargetColumnHeaderItemList[dragColumnIndex].columnWidth;
    const dropElementColWidth = salesTargetColumnHeaderItemList[dropIndex!].columnWidth;
    const draggingElementName = draggingElement.dataset.handlerId;
    const dropElementColName = dropElement.dataset.handlerId;

    console.log(
      `🌟ドラッグ元name: ${draggingElementName} id: ${draggingElementColumnId}, colIndex: ${draggingElementColIndex}, width: ${draggingElementColWidth}`
    );
    console.log(
      `🌟ドロップ先のName: ${dropElementColName} id: ${dropElementColumnId}, colIndex: ${dropElementColIndex}, width: ${dropElementColWidth}`
    );

    console.log("🌟更新前 salesTargetColumnHeaderItemList全体", salesTargetColumnHeaderItemList);
    //  🌟順番を入れ替える salesTargetColumnHeaderItemList
    const copyListItems: ColumnHeaderItemList[] = JSON.parse(JSON.stringify(salesTargetColumnHeaderItemList)); // 一意性を守るため新たなカラムリストを生成
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
    setSalesTargetColumnHeaderItemList([...newListItemArray]);
    // setContactColumnHeaderItemList((prevArray) => {
    //   console.log("ここprevArray", prevArray);
    //   console.log("ここnewListItemArray", newListItemArray);
    //   return [...newListItemArray];
    // });
    // ================= 🔥🔥テスト🔥🔥==================
    // ================ ✅ローカルストレージにも更新後のカラムリストを保存 ================
    // const contactColumnHeaderItemListJSON = JSON.stringify(newListItemArray);
    // localStorage.setItem("grid_columns_company", contactColumnHeaderItemListJSON);
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
    const salesTargetColumnHeaderItemListJSON = JSON.stringify(salesTargetColumnHeaderItemList);
    localStorage.setItem(`grid_columns_sales_target_sub`, salesTargetColumnHeaderItemListJSON);
    // localStorage.setItem("grid_columns_contacts", contactColumnHeaderItemListJSON);
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
    const filteredIsFrozenList = salesTargetColumnHeaderItemList.filter((item) => item.isFrozen === true);
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
    if (salesTargetColumnHeaderItemList[index].isFrozen === false) {
      console.log("🔥フローズンを付与するルート ============================");
      // ✅順番を入れ替え処理 一意性を守るため新たなカラムリストを生成
      const copyColumnHeaderListItems: ColumnHeaderItemList[] = JSON.parse(
        JSON.stringify(salesTargetColumnHeaderItemList)
      );
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
      setSalesTargetColumnHeaderItemList(newColumnHeaderItemList);

      // ================ ✅ローカルストレージにも更新後のカラムリストを保存 ================
      const salesTargetColumnHeaderItemListJSON = JSON.stringify(newColumnHeaderItemList);
      localStorage.setItem(`grid_columns_sales_target_sub`, salesTargetColumnHeaderItemListJSON);
      // localStorage.setItem("grid_columns_contacts", contactColumnHeaderItemListJSON);
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
      // parentGridScrollContainer.current.style.setQuotation(
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
      const copyColumnHeaderListItems: ColumnHeaderItemList[] = JSON.parse(
        JSON.stringify(salesTargetColumnHeaderItemList)
      );
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
      setSalesTargetColumnHeaderItemList(newColumnHeaderItemList);

      // ================ ✅ローカルストレージにも更新後のカラムリストを保存 ================
      const salesTargetColumnHeaderItemListJSON = JSON.stringify(newColumnHeaderItemList);
      localStorage.setItem(`grid_columns_sales_target_sub`, salesTargetColumnHeaderItemListJSON);
      // localStorage.setItem("grid_columns_contacts", contactColumnHeaderItemListJSON);
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
      // parentGridScrollContainer.current.style.setQuotation(
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
  const hoveredItemPos = useStore((state) => state.hoveredItemPos);
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
    itemsPosition = "center",
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
    if (hoveredItemPos) setHoveredItemPos(null);
  };
  // ==================================================================================

  // 部門別の名称
  const getDivName = (entityLevel: EntityLevelNames) => {
    switch (entityLevel) {
      case "company":
        return language === "ja" ? `全社` : `Company`;
      // return language === "ja" ? `全社 - 部門別` : `Company - Sections`;
      case "department":
        return language === "ja" ? `事業部` : `Departments`;
      case "section":
        return language === "ja" ? `課・セクション` : `Sections`;
      case "unit":
        return language === "ja" ? `係・チーム` : `Units`;
      case "office":
        return language === "ja" ? `事業所` : `Offices`;
      case "member":
        return language === "ja" ? `メンバー` : `Members`;
      default:
        return language === "ja" ? `部門` : `Division`;
        break;
    }
  };

  // 🌟現在のカラム.map((obj) => Object.values(row)[obj.columnId])で展開してGridセルを表示する
  const columnOrder = [...salesTargetColumnHeaderItemList].map(
    (item, index) =>
      item.columnName as keyof Omit<
        SalesTargetFYRowData,
        | "entity_id"
        | "entity_level"
        | "share"
        | "created_by_company_id"
        | "created_by_department_id"
        | "created_by_section_id"
        | "created_by_unit_id"
        | "created_by_user_id"
        | "created_by_office_id"
      >
  ); // columnNameのみの配列を取得
  // 上半期のみ 売上目標のみ、前年比のみなどのフィルターはここで行う

  // ---------------------------- 🌠シェア🌠 ----------------------------
  // infiniteQueryで初回は年度に対するシェアを算出した結果をstateに格納 年度から上期 or 下期に変更した場合にはstateを更新
  type SharesData = {
    [K in "sales_targets" | "last_year_sales"]: number;
  };
  const [shares, setShares] = useState<SharesData[] | null>(
    !!allRows?.length
      ? Array(allRows.length)
          .fill(null)
          .map((_, index) => {
            return {
              sales_targets: allRows[index]?.sales_targets ? allRows[index].sales_targets[displayTargetPeriodType] : 0,
              last_year_sales: allRows[index]?.last_year_sales
                ? allRows[index]?.last_year_sales[displayTargetPeriodType]
                : 0,
            };
          })
      : null
  );
  useEffect(() => {
    if (!allRows) return;
    if (!mainTotalTargets) return;
  }, [mainTotalTargets, allRows]);
  // ---------------------------- 🌠シェア🌠 ----------------------------

  console.log(
    "✅SalesTargetGridTableSubコンポーネントレンダリング",
    "=============================================data",
    data,
    // "rowVirtualizer.getVirtualItems()",
    // rowVirtualizer.getVirtualItems(),
    "1年分の年月度annualFiscalMonths",
    annualFiscalMonths,
    "総合目標state mainTotalTargets",
    mainTotalTargets,
    "allRows",
    allRows
    // "前年度の1年分の年月度lastAnnualFiscalMonths",
    // lastAnnualFiscalMonths,
    // "会計月度カレンダー配列",
    // fiscalStartMonthsArray,
    // "startDate",
    // format(fiscalYearStartEndDate.startDate, "yyyy/MM/dd"),
    // "endDate",
    // format(fiscalYearStartEndDate.endDate, "yyyy/MM/dd"),
    // "開始年月度",
    // currentFiscalStartYearMonth,
    // "filteredSectionBySelectedDepartment",
    // filteredSectionBySelectedDepartment,
    // "filteredUnitBySelectedSection",
    // filteredUnitBySelectedSection,
    // "departmentDataArray",
    // departmentDataArray,
    // "sectionDataArray",
    // sectionDataArray,
    // "unitDataArray",
    // unitDataArray,
    // "officeDataArray",
    // officeDataArray,
    // "departmentIdToObjMap",
    // departmentIdToObjMap,
    // "sectionIdToObjMap",
    // sectionIdToObjMap,
    // "unitIdToObjMap",
    // unitIdToObjMap,
    // "officeIdToObjMap",
    // officeIdToObjMap,
    // "全てのカラムcolsRef",
    // colsRef,
    // "checkedRows個数, checkedRows",
    // Object.keys(checkedRows).length,
    // checkedRows,
    // "selectedCheckBox",
    // selectedCheckBox,

    // `virtualItems:${rowVirtualizer.getVirtualItems().length}`
    // "colsWidth",
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
    // clickedActiveRow
  );

  //
  // const [displayKeys, setDisplayKeys] = useState(["salesTargets", "lastYearSales", "yearOverYearGrowth"]);
  /**
  {
  rows: [
    {
      salesTargets: [...], // 売上目標のデータ配列
      lastYearSales: [...], // 前年度売上のデータ配列
      yoyGrowth: [...], // 前年比のデータ配列
    },
  ],
  nextOffset: ...,
  isLastPage: ...,
  count: ...
}
   */
  // ユーザーがデータセットを「売上目標・前年度売上・前年比・前々年度売上・前年度前年伸び率実績」の5行１セットからそれぞれの
  // ユーザーがデータセットを「売上目標・前年度売上・前年比」の3行１セットから前年度売上、前年比を表示するか否かを選択できるようにして、displayKeysで管理し、rowの表示はdisplayKeys.map(key => {})でrow[key]とすることでプロパティからインデックスシグネチャで表示するプロパティを指定して１回で最大３行を表示する
  // 取り出したrow[key]のそれぞれのデータセットのフォーマット方法に応じて通貨、％フォーマットを使い分けるようにformatDisplayValue関数にdisplayKeyを引数で受け取って、それぞれのデータセットに応じたフォーマットを行なってセルに表示す

  const formatDisplayValue = (displayKey: DisplayKeys, columnName: string, value: any) => {
    // 売上目標 or 前年度売上データセット用フォーマット
    if (displayKey === "sales_targets" || displayKey === "last_year_sales") {
      switch (columnName) {
        case "share":
          if (!isValidNumber(value)) return null;
          return `${value.toFixed(0)}%`;
          break;
        case "entity_name":
          const divName = entityLevel === "company" ? (language === "ja" ? `全社` : `Company`) : value;
          return divName ?? null;
          break;
        case "dataset_type":
          if (displayKey === "sales_targets") return "売上目標";
          if (displayKey === "last_year_sales") {
            return (
              <div className={`mb-[-3px] flex h-full w-full flex-col justify-center`}>
                <span>前年度売上</span>
                <span className={`text-[11px]`}>{selectedFiscalYearTarget - 1}年度</span>
              </div>
            );
          }
          if (displayKey === "last_last_year_sales") {
            return (
              <div className={`mb-[-3px] flex h-full w-full flex-col justify-center`}>
                <span>前々年度売上</span>
                <span className={`text-[11px]`}>{selectedFiscalYearTarget - 2}年度</span>
              </div>
            );
          }
          break;

        default:
          if (!isValidNumber(value)) return null;
          // return convertToJapaneseCurrencyFormatInYen(value, false);
          return formatDisplayPrice(value);
          break;
      }
    }
    // 前年比データセット用フォーマット
    if (displayKey === "yoy_growth" || displayKey === "yo2y_growth") {
      switch (columnName) {
        case "share":
          return null;
          break;
        case "entity_name":
          const divName = entityLevel === "company" ? (language === "ja" ? `全社` : `Company`) : value;
          return divName ?? null;
          break;
        case "dataset_type":
          if (displayKey === "yoy_growth") return "前年比";
          if (displayKey === "yo2y_growth") return "前年度前年比伸び率実績";
          break;

        default:
          if (!isValidNumber(value)) return `- %`;
          return `${value.toFixed(2)}%`;
          break;
      }
    }

    return value;
  };

  return (
    <>
      {/* タイトルエリア */}
      <div className={`${styles.card_title_area} fade08_forward`}>
        <div className={`${styles.title_left_wrapper}`}>
          <div className={`${styles.card_title}`}>
            {/* <span>{entityNameTitle}</span> */}
            <span>{entityLevel === "company" ? (language === "ja" ? `全社` : `Company`) : `${divName}`}</span>
          </div>
        </div>
        <div className={`${styles.title_right_wrapper} space-x-[12px]`}>
          <div
            className={`${styles.btn} ${styles.basic} space-x-[4px]`}
            onMouseEnter={(e) => {
              const entityId = "sub_targets";
              handleOpenTooltip({
                e: e,
                display: "top",
                content: stickyRow === entityId ? `固定を解除` : `画面内に固定`,
                marginTop: 9,
              });
            }}
            onMouseLeave={handleCloseTooltip}
            onClick={() => {
              const entityId = "sub_targets";
              if (!entityId) return;
              if (entityId === stickyRow) {
                setStickyRow(null);
              } else {
                setStickyRow(entityId);
              }
              handleCloseTooltip();
            }}
          >
            {stickyRow === "sub_targets" && <TbSnowflakeOff />}
            {stickyRow !== "sub_targets" && <TbSnowflake />}
            {stickyRow === "sub_targets" && <span>解除</span>}
            {stickyRow !== "sub_targets" && <span>固定</span>}
          </div>
        </div>
      </div>
      {/* コンテンツエリア */}
      <div
        className={`${styles.main_container} ${
          theme === "light" ? `${styles.theme_f_light}` : `${styles.theme_f_dark}`
        } fade08_forward`}
      >
        {/* スクロールコンテナ下のshadow padding-bottom: 24px; */}
        <div
          className={`absolute bottom-0 left-0 z-[100] min-h-[24px] w-full rounded-b-[13px]`}
          style={{ background: `var(--color-dashboard-table-under-shadow)` }}
        />
        {/* スクロールコンテナ下のshadow padding-bottom: 24px; */}
        {/* スクロールコンテナ右側shadow */}
        <div
          className={`absolute right-[9px] top-0 z-[100] h-full w-[33px]`}
          style={{ background: `var(--color-dashboard-table-right-shadow)` }}
        />
        {/* スクロールコンテナ右側shadow */}
        {/* ================== Gridスクロールコンテナ ================== */}
        <div
          ref={parentGridScrollContainer}
          role="grid"
          aria-multiselectable="true"
          style={{
            width: "100%",
            // ...(isMain && { maxHeight: `${36 + rowHeight * displayKeys.length + 24}px` }),
          }}
          className={`${styles.grid_scroll_container} ${styles.sub}`}
          // onKeyDown={(e) => {
          //   if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          //     e.preventDefault(); // セル移動時に上下矢印キーで移動しないようにする
          //   }
          // }}
        >
          {/* ======================== 🌟Grid列トラック Rowヘッダー🌟 ======================== */}
          <div role="row" tabIndex={-1} aria-rowindex={1} aria-selected={false} className={`${styles.grid_header_row}`}>
            {/* ======== ヘッダーセル チェックボックスColumn ======== */}
            <div
              ref={rowHeaderRef}
              role="columnheader"
              aria-colindex={1}
              aria-selected={false}
              tabIndex={-1}
              className={`${styles.grid_column_header_all} ${styles.grid_column_frozen} ${styles.grid_column_header_checkbox_column} ${styles.share}`}
              // style={{ gridColumnStart: 1, left: columnHeaderLeft(0), position: "sticky" }}
              style={{ gridColumnStart: 1, left: "0px", position: "sticky" }}
              onClick={(e) => handleClickGridCell(e)}
            >
              <div
                // className={styles.grid_select_cell_header}
                className={`${styles.grid_header_cell_share} flex flex-col items-center`}
              >
                {/* <span>シェア</span> */}
                <>
                  <span className={`pointer-events-none text-[12px] leading-[12px]`}>シェア</span>
                  <span className={`pointer-events-none text-[10px]`}>(年度)</span>
                </>
                {/* <input
                  type="checkbox"
                  aria-label="Select All"
                  checked={!!checkedColumnHeader} // 初期値
                  onChange={(e) => handleAllSelectCheckBox(e)}
                  className={`${styles.grid_select_cell_header_input}`}
                />
                <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                </svg> */}
              </div>
            </div>
            {/* ======== ヘッダーセル チェックボックスColumn ここまで ======== */}
            {!!salesTargetColumnHeaderItemList.length &&
              [...salesTargetColumnHeaderItemList]
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
                    data-text={`${columnNameToJapaneseSalesTarget(
                      key.columnName,
                      entityLevel,
                      fiscalStartMonthsArray,
                      language
                      // fiscalYearStartEndDate.startDate.getMonth() + 1 // 開始月
                      // fiscalYear,
                      // lastFiscalYear,
                      // lastFiscalYear2Digits,
                      // lastLastFiscalYear,
                      // lastLastFiscalYear2Digits
                    )}`}
                    aria-colindex={key.columnIndex}
                    // aria-colindex={index + 2}
                    aria-selected={false}
                    tabIndex={-1}
                    className={`${styles.grid_column_header_all} ${
                      key.isFrozen ? `${styles.grid_column_frozen} cursor-default` : "cursor-grab"
                    } ${isFrozenCountRef.current === 1 && index === 0 ? styles.grid_cell_frozen_last : ""} ${
                      isFrozenCountRef.current === index + 1 ? styles.grid_cell_frozen_last : ""
                    } ${styles.grid_cell_resizable} dropzone ${key.isOverflow ? `${styles.is_overflow}` : ""}`}
                    style={
                      key.isFrozen
                        ? { gridColumnStart: index + 2, left: `var(--frozen-left-${index})` }
                        : { gridColumnStart: index + 2 }
                    }
                    // onClick={(e) => handleClickGridCell(e)}
                    // onDoubleClick={(e) => {
                    //   handleFrozen(index);
                    //   //   handleFrozen(e, index);
                    //   // handleDoubleClick(e, index);
                    // }}
                    onMouseEnter={(e) => {
                      if (key.isOverflow) {
                        const columnNameData = key.columnName ? key.columnName : "";
                        handleOpenTooltip({
                          e,
                          display: "top",
                          content: columnNameToJapaneseSalesTarget(
                            key.columnName,
                            entityLevel,
                            fiscalStartMonthsArray,
                            language
                            // fiscalYearStartEndDate.startDate.getMonth() + 1 // 開始月
                            // fiscalYear,
                            // lastFiscalYear,
                            // lastFiscalYear2Digits,
                            // lastLastFiscalYear,
                            // lastLastFiscalYear2Digits
                          ),
                        });
                      }
                    }}
                    onMouseLeave={() => {
                      if (key.isOverflow) {
                        handleCloseTooltip();
                      }
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
                            {language === "ja" &&
                              columnNameToJapaneseSalesTarget(
                                key.columnName,
                                entityLevel,
                                fiscalStartMonthsArray,
                                language
                                // fiscalYear,
                                // lastFiscalYear,
                                // lastFiscalYear2Digits,
                                // lastLastFiscalYear,
                                // lastLastFiscalYear2Digits
                              )}
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
                ))}
            {/* ======== ヘッダーセル idを除く全てのプロパティ(フィールド)Column ここまで  ======== */}
          </div>
          {rowVirtualizer.getVirtualItems().length === 0 && (
            <div
              className={`flex min-h-[48px] w-full min-w-[calc(100vw-72px-62px-30px)] items-end justify-center pb-[6px] text-[12px] text-[var(--color-text-sub)]`}
            >
              <span>データがありません。</span>
            </div>
          )}
          {/* ======================== 🌟Grid列トラック Rowヘッダー🌟 ======================== */}
          {isLoadingTarget ? (
            <div
              className={`${
                salesTableContainerSize === "one_third" ? `${styles.search_mode_container_one_third}` : ``
              } ${salesTableContainerSize === "half" ? `${styles.search_mode_container_half}` : ``} ${
                salesTableContainerSize === "all" ? `${styles.search_mode_container_all}` : ``
              } flex-center w-[100vw]`}
            >
              {/* {loadingGlobalState && <SpinnerIDS />} */}
            </div>
          ) : (
            <>
              {/* ======================== 🌟Grid列トラック Rowグループコンテナ🌟 ======================== */}
              {/* Rowアイテム収納のためのインナー要素 */}
              <div
                ref={gridRowGroupContainerRef}
                role="rowgroup"
                style={
                  {
                    // 表示するキー個数分、行高さを加算
                    height: `${rowVirtualizer.getTotalSize() * displayKeys.length}px`,
                    // width: "100%",
                    width: `var(--row-width)`,
                    position: "relative",
                    // "--header-row-height": "35px",
                    "--header-row-height": "35px",
                    // "--grid-row-height": "42px",
                    "--grid-row-height": `${rowHeight}px`,
                    "--row-width": "",
                  } as any
                }
                className={`${styles.grid_rowgroup_virtualized_container}`}
              >
                {rowVirtualizer.getVirtualItems().length > 0 &&
                  rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const isLoaderRow = virtualRow.index > allRows.length - 1;
                    const rowData = allRows[virtualRow.index];

                    // console.log("rowData", rowData);

                    // ========= 🌟初回表示時はデータがindexしか取得できないのでnullを表示 =========
                    if ("index" in rowData && Object.keys(rowData).length === 1) {
                      console.log("🌟初回表示時はデータがindexしか取得できないのでnullを表示", rowData);
                      return null;
                    }

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

                    /* ======================== Grid列トラック Row ======================== */

                    // ========= 🌠各データセットを展開するためのループ🌠 =========
                    // 最大３行１セットで展開(売上目標・前年度売上・前年比)
                    return (
                      <Fragment key={"row" + virtualRow.index.toString()}>
                        {displayKeys.map((displayKey, displayIndex) => {
                          // 選択されたキーに対応するデータを展開
                          const displayRowData = rowData[displayKey];
                          // console.log(
                          //   "🌠displayRowData",
                          //   displayRowData,
                          //   "displayKeys",
                          //   displayKeys,
                          //   "rowData",
                          //   rowData,
                          //   "displayKey",
                          //   displayKey
                          // );

                          // 各行の実際のtop位置を動的に計算
                          // 仮想化した1行 * データセットの個数 * データセットのindex * １行の高さ
                          // 仮想化した1行の中にデータセットの個数分の行が展開される
                          const top = (virtualRow.index * displayKeys.length + displayIndex) * rowHeight;
                          const ariaRowIndex = virtualRow.index * displayKeys.length + 2 + displayIndex;

                          return (
                            <div
                              key={"row" + virtualRow.index.toString() + displayKey}
                              role="row"
                              tabIndex={-1}
                              // aria-rowindex={virtualRow.index + 2} // ヘッダーの次からで+1、indexは0からなので+1で、index0に+2
                              aria-rowindex={ariaRowIndex} // ヘッダーの次からで+1、indexは0からなので+1で、index0に+2
                              // aria-selected={false}
                              // チェックが入っているか、もしくは列内のセルがクリックされアクティブになっていた場合には該当のrowのaria-selectedをtrueにする
                              // aria-selected={
                              //   checkedRows[virtualRow.index.toString()] || clickedActiveRow === virtualRow.index + 2
                              // }
                              aria-selected={
                                checkedRows[(virtualRow.index * displayKeys.length + displayIndex).toString()] ||
                                clickedActiveRow === virtualRow.index * displayKeys.length + 2 + displayIndex
                              }
                              // className={`${styles.grid_row} ${evenRowColorChange ? `${styles.even_color_change}` : ``}`}
                              className={`${styles.grid_row}`}
                              style={{
                                // top: ((virtualRow.index + 0) * 48).toString() + "px", // +1か0か
                                top: `${top}px`,
                              }}
                            >
                              {/* ======== gridセル チェックボックスセル ======== */}
                              {displayRowData && (
                                <div
                                  ref={(ref) => (gridRowTracksRefs.current[virtualRow.index] = ref)}
                                  role="gridcell"
                                  aria-colindex={1}
                                  aria-selected={false}
                                  aria-readonly={true}
                                  tabIndex={-1}
                                  // className={`${styles.grid_cell} ${styles.grid_column_frozen} ${styles.checkbox_cell}`}
                                  className={`${styles.grid_cell} ${styles.grid_column_frozen} ${styles.share}`}
                                  // style={{ gridColumnStart: 1, left: columnHeaderLeft(0) }}
                                  style={{ gridColumnStart: 1, left: "0px" }}
                                  onClick={(e) => handleClickGridCell(e)}
                                >
                                  {(displayKey === "sales_targets" || displayKey === "last_year_sales") &&
                                    displayRowData && (
                                      <div
                                        className={`${styles.grid_header_cell_share} flex-center relative h-full w-full pb-[6px]`}
                                      >
                                        <ProgressCircle
                                          circleId="3"
                                          textId="3"
                                          progress={displayRowData.share ?? 0}
                                          // progress={0}
                                          duration={5000}
                                          easeFn="Quartic"
                                          size={24}
                                          strokeWidth={3}
                                          hiddenCenterText={true}
                                          oneColor="var(--main-color-f)"
                                          notGrad={true}
                                          isReady={true}
                                          withShadow={false}
                                          fade={`fade03_forward`}
                                        />
                                        <ProgressNumber
                                          targetNumber={displayRowData.share ?? 0}
                                          // startNumber={Math.round(68000 / 2)}
                                          // startNumber={Number((68000 * 0.1).toFixed(0))}
                                          startNumber={0}
                                          duration={5000}
                                          // easeFn="Quartic"
                                          easeFn="Quartic"
                                          fontSize={9}
                                          margin="0 0 0 0"
                                          isReady={true}
                                          isPrice={false}
                                          isPercent={true}
                                          fade={`fade03_forward`}
                                          customClass={`absolute bottom-0 left-[50%] translate-x-[-50%] text-[5px]`}
                                          textColor={`var(--color-text-sub)`}
                                        />
                                      </div>
                                    )}
                                </div>
                              )}
                              {/* ======== gridセル 全てのプロパティ(フィールド)セル  ======== */}

                              {/* {rowData ? ( */}
                              {displayRowData ? (
                                // カラム順番が変更されているなら順番を合わせてからmap()で展開 上はcolumnNameで呼び出し
                                columnOrder ? (
                                  columnOrder
                                    // .map((columnName) => rowData[columnName])
                                    .map((columnName) => displayRowData[columnName])
                                    .map((value, index) => {
                                      const columnName = salesTargetColumnHeaderItemList[index]?.columnName;
                                      // const columnName = Object.keys(displayRowData)[];
                                      let displayValue = value;

                                      displayValue = formatDisplayValue(displayKey, columnName, displayValue);

                                      if (columnName === "fiscal_year" && displayKey === "sales_targets") {
                                        console.log(
                                          "displayValue",
                                          displayValue,
                                          "value",
                                          value,
                                          "columnName",
                                          columnName,
                                          "displayKey",
                                          displayKey
                                        );
                                      }
                                      return (
                                        <div
                                          key={"row" + virtualRow.index.toString() + index.toString() + displayKey}
                                          role="gridcell"
                                          aria-colindex={
                                            salesTargetColumnHeaderItemList[index]
                                              ? salesTargetColumnHeaderItemList[index]?.columnIndex
                                              : index + 2
                                          } // カラムヘッダーの列StateのcolumnIndexと一致させる
                                          aria-selected={false}
                                          tabIndex={-1}
                                          className={`${styles.grid_cell} ${
                                            salesTargetColumnHeaderItemList[index].isFrozen
                                              ? styles.grid_column_frozen
                                              : ""
                                          } ${
                                            isFrozenCountRef.current === 1 && index === 0
                                              ? styles.grid_cell_frozen_last
                                              : ""
                                          } ${
                                            isFrozenCountRef.current === index + 1 ? styles.grid_cell_frozen_last : ""
                                          }  ${styles.grid_cell_resizable} ${
                                            columnName === "entity_name" ? `${styles.company_highlight}` : ``
                                          }`}
                                          style={
                                            salesTargetColumnHeaderItemList[index].isFrozen
                                              ? {
                                                  gridColumnStart: salesTargetColumnHeaderItemList[index]
                                                    ? salesTargetColumnHeaderItemList[index]?.columnIndex
                                                    : index + 2,
                                                  left: `var(--frozen-left-${index})`,
                                                }
                                              : {
                                                  gridColumnStart: salesTargetColumnHeaderItemList[index]
                                                    ? salesTargetColumnHeaderItemList[index]?.columnIndex
                                                    : index + 2,
                                                }
                                          }
                                          onClick={handleClickGridCell}
                                          onDoubleClick={(e) =>
                                            handleDoubleClick(
                                              e,
                                              index,
                                              salesTargetColumnHeaderItemList[index].columnName
                                            )
                                          }
                                          onKeyDown={handleKeyDown}
                                        >
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
                                        salesTargetColumnHeaderItemList[index]
                                          ? salesTargetColumnHeaderItemList[index]?.columnIndex
                                          : index + 2
                                      } // カラムヘッダーの列StateのcolumnIndexと一致させる
                                      aria-selected={false}
                                      tabIndex={-1}
                                      className={`${styles.grid_cell} ${index === 0 ? styles.grid_column_frozen : ""} ${
                                        index === 0 ? styles.grid_cell_frozen_last : ""
                                      } ${styles.grid_cell_resizable}`}
                                      // style={{ gridColumnStart: index + 2, left: columnHeaderLeft(index + 1) }}
                                      style={
                                        salesTargetColumnHeaderItemList[index].isFrozen
                                          ? {
                                              gridColumnStart: salesTargetColumnHeaderItemList[index]
                                                ? salesTargetColumnHeaderItemList[index]?.columnIndex
                                                : index + 2,
                                              left: columnLeftPositions.current[index],
                                            }
                                          : {
                                              gridColumnStart: salesTargetColumnHeaderItemList[index]
                                                ? salesTargetColumnHeaderItemList[index]?.columnIndex
                                                : index + 2,
                                            }
                                      }
                                      onClick={handleClickGridCell}
                                      onDoubleClick={(e) =>
                                        handleDoubleClick(e, index, salesTargetColumnHeaderItemList[index].columnName)
                                      }
                                      onKeyDown={handleKeyDown}
                                    >
                                      {value as any}
                                    </div>
                                  ))
                                )
                              ) : (
                                <>
                                  <div
                                    className={`flex h-[48px] w-full min-w-[calc(100vw-72px-62px-30px)] items-center justify-center text-[12px] text-[var(--color-text-sub)]`}
                                  >
                                    {displayKey === "sales_targets" && <span>売上目標データがありません。</span>}
                                    {displayKey === "yoy_growth" && <span>前年比データがありません。</span>}
                                    {displayKey === "last_year_sales" && <span>前年度売上データがありません。</span>}
                                  </div>
                                  {/* <div
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
                                </div> */}
                                </>
                              )}
                              {/* ======== ヘッダーセル idを除く全てのプロパティ(フィールド)Column  ======== */}
                            </div>
                          );
                        })}
                      </Fragment>
                    );
                  })}
              </div>
              {/* ======================== Grid列トラック Row ======================== */}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export const SalesTargetGridTableSub = memo(SalesTargetGridTableSubMemo);