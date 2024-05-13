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
  FiscalYearMonthKey,
  FiscalYears,
  MainEntityTarget,
  Office,
  SalesTargetFHRowData,
  SalesTargetFYRowData,
  SalesTargetSHRowData,
  SalesTargetsRowDataWithYoY,
  Section,
  SectionMenuParams,
  SparkChartObj,
  Unit,
} from "@/types";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
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
import { useQuerySalesSummaryAndGrowth } from "@/hooks/useQuerySalesSummaryAndGrowth";
import { SparkChart } from "@/components/Parts/Charts/SparkChart/SparkChart";
import { checkNotFalsyExcludeZero } from "@/utils/Helpers/checkNotFalsyExcludeZero";
import { HiOutlineSelector } from "react-icons/hi";
import { enUS } from "date-fns/locale";

// entityLevel: company / department...
type Props = {
  // entityLevel: string;
  entityLevel: "company" | "department" | "section" | "unit"; // 総合目標のみで使用のためmemberはなし
  // entityNameTitle: string;
  // entityId: string;
  entities: Entity[];
  parentEntityLevel?: string;
  parentEntityId?: string;
  parentEntityNameTitle?: string;
  divName: string;
  isMain: boolean;
  fetchEnabled?: boolean; // メイン目標でない場合はfetchEnabledがtrueに変更されたらフェッチを許可する
  onFetchComplete?: () => void;
  onResetFetchComplete?: () => void;
  currentActiveIndex: number;
  companyId: string;
  stickyRow: string | null;
  setStickyRow: Dispatch<SetStateAction<string | null>>;
};

const SalesTargetGridTableMemo = ({
  entityLevel,
  // entityNameTitle,
  // entityId,
  entities,
  parentEntityLevel,
  parentEntityId,
  parentEntityNameTitle,
  divName,
  isMain,
  fetchEnabled,
  onFetchComplete,
  onResetFetchComplete,
  currentActiveIndex,
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

  // const [selectedDepartment, setSelectedDepartment] = useState<Entity | null>(null);
  // const [selectedSection, setSelectedSection] = useState<Entity | null>(null);
  // const [selectedUnit, setSelectedUnit] = useState<Entity | null>(null);
  // const [selectedOffice, setSelectedOffice] = useState<Entity | null>(null);

  if (isMain && !mainEntityTarget) return null;
  if (!fiscalYearStartEndDate) return null;
  if (!currentFiscalStartYearMonth) return null;
  if (!annualFiscalMonths) return null;
  if (!selectedFiscalYearTarget) return null;
  if (!lastAnnualFiscalMonths) return null;

  // エンティティMap
  const entitiesIdToObjMap = useMemo(() => {
    return new Map(entities.map((entity) => [entity.entity_id, entity]));
  }, [entities]);

  // 現在のエンティティのオブジェクト
  const mainEntityObj = useMemo(() => {
    if (!entitiesIdToObjMap) return null;
    if (!mainEntityTarget?.parentEntityId) return null;
    const mainEntityObj = entitiesIdToObjMap.get(mainEntityTarget.parentEntityId);
    if (!mainEntityObj) return null;
    return mainEntityObj;
  }, [entitiesIdToObjMap, mainEntityTarget?.parentEntityId]);

  // ========================= 🌟事業部・課・係・事業所リスト取得useQuery キャッシュ🌟 =========================
  const departmentDataArray: Department[] | undefined = queryClient.getQueryData(["departments"]);
  const sectionDataArray: Section[] | undefined = queryClient.getQueryData(["sections"]);
  const unitDataArray: Unit[] | undefined = queryClient.getQueryData(["units"]);
  const officeDataArray: Office[] | undefined = queryClient.getQueryData(["offices"]);
  // ========================= 🌟事業部・課・係・事業所リスト取得useQuery キャッシュ🌟 =========================

  // // 「事業部」「課・セクション」「係・チーム」「事業所」のid to objectオブジェクトマップ生成
  // // 事業部マップ {id: 事業部オブジェクト}
  // const departmentIdToObjMap = useMemo(() => {
  //   if (!departmentDataArray?.length) return null;
  //   const departmentMap = new Map(departmentDataArray.map((obj) => [obj.id, obj]));
  //   return departmentMap;
  // }, [departmentDataArray]);
  // // 課・セクションマップ {id: 課・セクションオブジェクト}
  // const sectionIdToObjMap = useMemo(() => {
  //   if (!sectionDataArray?.length) return null;
  //   const sectionMap = new Map(sectionDataArray.map((obj) => [obj.id, obj]));
  //   return sectionMap;
  // }, [sectionDataArray]);
  // // 係マップ {id: 係オブジェクト}
  // const unitIdToObjMap = useMemo(() => {
  //   if (!unitDataArray?.length) return null;
  //   const unitMap = new Map(unitDataArray.map((obj) => [obj.id, obj]));
  //   return unitMap;
  // }, [unitDataArray]);
  // // 事業所マップ {id: 事業所オブジェクト}
  // const officeIdToObjMap = useMemo(() => {
  //   if (!officeDataArray?.length) return null;
  //   const officeMap = new Map(officeDataArray.map((obj) => [obj.id, obj]));
  //   return officeMap;
  // }, [officeDataArray]);

  // ========================= 🌟年度・レベル・エンティティuseQuery キャッシュ🌟 =========================
  const fiscalYearQueryData: FiscalYears | undefined = queryClient.getQueryData([
    "fiscal_year",
    "sales_target",
    selectedFiscalYearTarget,
  ]);
  const entityLevelsQueryData: EntityLevels[] | undefined = queryClient.getQueryData([
    "entity_levels",
    "sales_target",
    selectedFiscalYearTarget,
  ]);
  // エンティティレベルのidのみで配列を作成(エンティティuseQuery用)
  const entityLevelIdsStr = useMemo(() => {
    if (!entityLevelsQueryData) return [];
    const entityLevelIds = entityLevelsQueryData.map((obj) => obj.id);
    const entityLevelIdsStr = entityLevelIds?.length > 0 ? entityLevelIds.join(", ") : "";
    return entityLevelIdsStr;
  }, [entityLevelsQueryData]);

  const entitiesHierarchyQueryData: EntitiesHierarchy | undefined = queryClient.getQueryData([
    "entities",
    "sales_target",
    selectedFiscalYearTarget,
    entityLevelIdsStr,
  ]);

  // key: エンティティレベル名, value: 上位エンティティグループ
  const entitiesHierarchyMap = useMemo(() => {
    if (!entitiesHierarchyQueryData) return null;
    return new Map(Object.entries(entitiesHierarchyQueryData).map(([key, value], index) => [key, value]));
  }, [entitiesHierarchyQueryData]);

  // key: エンティティレベル名, value: 上位エンティティレベル
  const entityLevelToParentLevelMap = useMemo(() => {
    if (!entityLevelsQueryData) return null;
    const getParentLevel = (level: EntityLevelNames) => {
      if (level === "company") return "company";
      const currentLevelIndex = entityLevelsQueryData.findIndex((obj) => obj.entity_level === level);
      return entityLevelsQueryData[currentLevelIndex - 1].entity_level as EntityLevelNames;
    };
    return new Map(
      entityLevelsQueryData.map((level) => [level.entity_level, getParentLevel(level.entity_level as EntityLevelNames)])
    );
  }, [entityLevelsQueryData]);
  // key: エンティティレベル名, value: 下位(子)エンティティレベル
  const entityLevelToChildLevelMap = useMemo(() => {
    if (!entityLevelsQueryData) return null;
    const getParentLevel = (level: EntityLevelNames) => {
      if (level === "member") return "member";
      const currentLevelIndex = entityLevelsQueryData.findIndex((obj) => obj.entity_level === level);
      if (currentLevelIndex + 1 === entityLevelsQueryData.length) return "member";
      return entityLevelsQueryData[currentLevelIndex + 1].entity_level as EntityLevelNames;
    };
    return new Map(
      entityLevelsQueryData.map((level) => [level.entity_level, getParentLevel(level.entity_level as EntityLevelNames)])
    );
  }, [entityLevelsQueryData]);
  // ========================= 🌟年度・レベル・エンティティuseQuery キャッシュ🌟 =========================

  // 事業部~事業所までは変更する際に、エンティティ名を選択した後にactiveDisplayTabsを更新するため一旦ローカルでエンティティタイプを保持するためのstate
  // const [activeEntityLocal, setActiveEntityLocal] = useState<{
  //   entityLevel: string;
  //   entityName: string;
  //   entityId: string;
  // } | null>(null);

  // 総合目標のエンティティレベルを保持
  const [activeEntityLocal, setActiveEntityLocal] = useState<{
    entityLevel: "company" | "department" | "section" | "unit";
    entityName: string;
    entityId: string;
  } | null>(null);

  // 総合目標変更時の選択中のレベルのエンティティグループの選択肢
  // const [optionsBySelectedLevel, setOptionsBySelectedLevel] = useState<EntityGroupByParent[]>([]);
  const [optionsEntities, setOptionsEntities] = useState<Entity[]>([]);

  const entityIdToEntityObjMap = useMemo(() => {
    if (!optionsEntities) return null;
    return new Map(optionsEntities.map((entity) => [entity.entity_id, entity]));
  }, [optionsEntities]);

  // 上位エンティティidからエンティティグループを取得するMapオブジェクト
  // const parentIdToChildEntityGroupsMap = useMemo(() => {
  //   if (!entitiesHierarchyQueryData) return null;
  //   if (!optionsEntities.length) return null;
  //   if (!entityLevelToChildLevelMap) return null;
  //   if (!activeEntityLocal) return null;
  //   const childLevelName = entityLevelToChildLevelMap.get(activeEntityLocal.entityLevel);
  //   if (!childLevelName) return null;
  //   if (!(childLevelName in entitiesHierarchyQueryData)) return null;
  //   const childEntityGroupsByParent = entitiesHierarchyQueryData[childLevelName];
  //   if (!childEntityGroupsByParent.length) return null;
  //   if (childEntityGroupsByParent.some((group) => group.parent_entity_id === null)) return null;
  //   const _parentIdToChildEntityGroupsMap = new Map(
  //     childEntityGroupsByParent.map((group) => [group.parent_entity_id!, group])
  //   );
  //   if (!_parentIdToChildEntityGroupsMap) return null;

  //   return _parentIdToChildEntityGroupsMap;
  // }, [optionsEntities, entitiesHierarchyQueryData, entityLevelToChildLevelMap, activeEntityLocal?.entityLevel]);

  // const parentIdToEntityGroupMap = useMemo(() => {
  //   if (!optionsBySelectedLevel.length) return null;
  //   return new Map(optionsBySelectedLevel.map((group) => [group.parent_entity_id, group]));
  // }, [optionsBySelectedLevel]);

  // ===================== 🌟ユーザーが作成したエンティティのみでレベル選択肢リストを再生成🌟 =====================
  // ✅ステップ1の選択肢で追加
  const initialOptionsEntityLevelList = (): {
    // title: EntityLevelNames;
    title: "company" | "department" | "section" | "unit";
    name: {
      [key: string]: string;
    };
  }[] => {
    let newEntityList: {
      // title: EntityLevelNames;
      title: "company" | "department" | "section" | "unit";
      name: {
        [key: string]: string;
      };
    }[] = [{ title: "company", name: { ja: "全社", en: "Company" } }];
    if (departmentDataArray && departmentDataArray.length > 0) {
      newEntityList.push({ title: "department", name: { ja: "事業部", en: "Department" } });
    }
    if (sectionDataArray && sectionDataArray.length > 0) {
      newEntityList.push({ title: "section", name: { ja: "課・セクション", en: "Section" } });
    }
    if (unitDataArray && unitDataArray.length > 0) {
      newEntityList.push({ title: "unit", name: { ja: "係・チーム", en: "Unit" } });
    }
    // 目標トップ画面は総合目標を基準に選択するため、メンバーレベルは選択肢に入れなくてOK
    // newEntityList.push({ title: "member", name: { ja: "メンバー", en: "Member" } });
    // 事業所は一旦見合わせ
    // if (officeDataArray && officeDataArray.length > 0) {
    //   newEntityList.push({ title: "office", name: { ja: "事業所", en: "Office" } });
    // }
    return newEntityList;
  };
  // const [optionsEntityLevelList, setOptionsEntityLevelList] = useState<
  const [mainEntityLevelList, setMainEntityLevelList] = useState<
    {
      // title: string;
      // title: EntityLevelNames;
      title: "company" | "department" | "section" | "unit";
      name: {
        [key: string]: string;
      };
    }[]
  >(initialOptionsEntityLevelList());

  // ✅初回マウント時に現在の選択年度のuseQueryで取得したエンティティレベルをセット
  useEffect(() => {
    // 目標年度が存在しない場合は、選択肢を空でセット
    if (!fiscalYearQueryData || !entityLevelsQueryData || entityLevelsQueryData.length === 0) {
      setMainEntityLevelList([]);
    }

    if (entityLevelsQueryData) {
      const addedLevelsMap = new Map(entityLevelsQueryData.map((level) => [level.entity_level, level]));

      let newOptionsLevelList = [...mainEntityLevelList];

      // 総合目標で親エンティティを表示するため、メンバーエンティティを除く
      if (addedLevelsMap.has("unit")) {
        newOptionsLevelList = newOptionsLevelList.filter((obj) =>
          ["company", "department", "section", "unit"].includes(obj.title)
        );
      } else if (addedLevelsMap.has("section")) {
        newOptionsLevelList = newOptionsLevelList.filter((obj) =>
          ["company", "department", "section"].includes(obj.title)
        );
      } else if (addedLevelsMap.has("department")) {
        newOptionsLevelList = newOptionsLevelList.filter((obj) => ["company", "department"].includes(obj.title));
      } else if (addedLevelsMap.has("company")) {
        newOptionsLevelList = newOptionsLevelList.filter((obj) => ["company"].includes(obj.title));
      }

      setMainEntityLevelList(newOptionsLevelList);
    }
  }, [fiscalYearQueryData, entityLevelsQueryData]);
  // ===================== 🌟ユーザーが作成したエンティティのみでレベル選択肢リストを再生成🌟 ここまで=====================

  // 🔹ユーザーが作成したエンティティのみのセクションリストを再生成
  // const mainEntityLevelList: {
  //   title: string;
  //   name: {
  //     [key: string]: string;
  //   };
  // }[] = useMemo(() => {
  //   let newEntityList = [{ title: "company", name: { ja: "全社", en: "Company" } }];
  //   if (departmentDataArray && departmentDataArray.length > 0) {
  //     newEntityList.push({ title: "department", name: { ja: "事業部", en: "Department" } });
  //   }
  //   if (sectionDataArray && sectionDataArray.length > 0) {
  //     newEntityList.push({ title: "section", name: { ja: "課・セクション", en: "Section" } });
  //   }
  //   if (unitDataArray && unitDataArray.length > 0) {
  //     newEntityList.push({ title: "unit", name: { ja: "係・チーム", en: "Unit" } });
  //   }
  //   // メンバーエンティティはサブ目標で表示するためメインエンティティリストには追加せず
  //   // newEntityList.push({ title: "member", name: { ja: "メンバー", en: "Member" } });
  //   if (officeDataArray && officeDataArray.length > 0) {
  //     newEntityList.push({ title: "office", name: { ja: "事業所", en: "Office" } });
  //   }
  //   return newEntityList;
  // }, [departmentDataArray, sectionDataArray, unitDataArray, officeDataArray]);

  // // ======================= 🌟現在の選択した事業部で課・セクションを絞り込むuseEffect🌟 =======================
  // // const [filteredSectionBySelectedDepartment, setFilteredSectionBySelectedDepartment] = useState<Section[]>([]);
  // const [filteredSectionBySelectedDepartment, setFilteredSectionBySelectedDepartment] = useState<Entity[]>([]);
  // // ======================= ✅現在の選択した事業部でチームを絞り込むuseEffect✅ =======================
  // // ======================= 🌟現在の選択した事業部で課・セクションを絞り込むuseEffect🌟 =======================
  // // const [filteredUnitBySelectedDepartment, setFilteredUnitBySelectedDepartment] = useState<Unit[]>([]);
  // // const [filteredUnitBySelectedSection, setFilteredUnitBySelectedSection] = useState<Unit[]>([]);
  // const [filteredUnitBySelectedSection, setFilteredUnitBySelectedSection] = useState<Entity[]>([]);
  // // ======================= ✅現在の選択した事業部でチームを絞り込むuseEffect✅ =======================

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

  // ================== 🌟疑似的なサーバーデータフェッチ用の関数🌟 ==================
  // const fetchServerPageTest = async (
  //   limit: number,
  //   offset: number = 0
  // ): Promise<{
  //   rows: SalesTargetsRowDataWithYoY[];
  //   nextOffset: number;
  //   isLastPage: boolean;
  //   count: number | null;
  // }> => {
  //   // useInfiniteQueryのクエリ関数で渡すlimitの個数分でIndex番号を付けたRowの配列を生成
  //   // const rows = new Array(limit).fill(0).map((e, index) => {
  //   //   const newData: TableDataType = {
  //   //     activityType: `TEL発信`,
  //   //     summary: "50ミクロンで測定したい",
  //   //     date: "2021/06/01",
  //   //     sales: "伊藤謙太",
  //   //     department: "メトロロジ",
  //   //     office: "東京営業所",
  //   //   };
  //   //   return newData;
  //   // });
  //   const quantity = (_entityLevel: string) => {
  //     switch (_entityLevel) {
  //       case "company":
  //         return 1;
  //         break;
  //       case "department":
  //         return 4;
  //         break;
  //       case "section":
  //         return 4;
  //         break;
  //       case "unit":
  //         return 6;
  //         break;
  //       case "":
  //         return 1;
  //         break;

  //       default:
  //         return 1;
  //         break;
  //     }
  //   };
  //   // const rows = testRowData("company", 1);
  //   const salesTargets = testRowData("company", quantity(entityLevel));
  //   const lastYearSales = testRowDataLastYear("company", quantity(entityLevel));
  //   const yoyGrowths = testRowDataPercent("company", quantity(entityLevel));
  //   const count = quantity(entityLevel);
  //   const isLastPage = true;

  //   const rows = salesTargets.map((target, index) => ({
  //     sales_targets: target,
  //     last_year_sales: lastYearSales[index],
  //     yoy_growth: yoyGrowths[index],
  //   })) as SalesTargetsRowDataWithYoY[];

  //   // 0.5秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
  //   await new Promise((resolve) => setTimeout(resolve, 1000));

  //   // 取得したrowsを返す（nextOffsetは、queryFnのctx.pageParamsが初回フェッチはundefinedで2回目が1のため+1でページ数と合わせる）
  //   return { rows, nextOffset: offset + 1, isLastPage, count };
  // };
  // ================== ✅疑似的なサーバーデータフェッチ用の関数✅ ==================

  // ================== 🌟useInfiniteQueryフック🌟 ==================
  function ensureTargetsRowData(data: any): SalesTargetFYRowData[] {
    console.log(
      "メイン目標 ensureTargetsRowData 売上目標の取得結果の個数とentitiesの個数が一致しているか",
      data?.length,
      entities.length
    );
    if (!Array.isArray(data) || !data?.length || data?.length !== entities.length) {
      // entitiesの全てのエンティティが取得できているわけではなく、一部のエンティティのみ売上があった場合は、取得できなかったエンティティのみプレイスホルダーで保管し、取得できたエンティティはそのまま取得できたデータを使用する
      let dataIdToObjMap: Map<string, SalesTargetFYRowData> | null = null;
      if (Array.isArray(data) && data.length > 0) {
        dataIdToObjMap = new Map(data.map((obj: SalesTargetFYRowData) => [obj.entity_id, obj]));
      }
      const placeholderSalesTargetArray = entities.map((entity) => {
        // 一部のエンティティのみ取得できている場合には、取得できているエンティティをチェックし、取得できているエンティティには取得済みのデータを返す
        if (Array.isArray(data) && data.length > 0 && dataIdToObjMap !== null) {
          if (dataIdToObjMap.has(entity.entity_id)) {
            const salesTargetRow = dataIdToObjMap.get(entity.entity_id);
            if (salesTargetRow) return salesTargetRow;
          }
        }
        return {
          // share: entityLevel === "company" ? 100 : 0,
          // share: 100, // 総合目標のため常に100
          share: 0, // 売上目標が未設定の場合には常に0
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

    return data as SalesTargetFYRowData[];
    // if (entityLevel !== "member") {
    //   return data as SalesTargetFYRowData[];
    // } else {
    //   const memberSalesTargetArray = (data as SalesTargetFYRowData[]).map((row) => {
    //     // メンバーエンティティで年度目標が取得できている場合はそのままrowをリターン
    //     if (Object.keys(row).includes("fiscal_year") && row?.fiscal_year !== null && row?.fiscal_year !== undefined) {
    //       return row;
    //     }
    //     // メンバーエンティティで年度目標が取得できていない場合は上期と下期の売上目標を合算して年度目標を追加
    //     let totalFiscalYear = 0;
    //     try {
    //       const firstHalfDecimal = new Decimal(row.first_half ?? 0);
    //       const secondHalfDecimal = new Decimal(row.second_half ?? 0);
    //       totalFiscalYear = firstHalfDecimal.plus(secondHalfDecimal).toNumber();
    //     } catch (error: any) {
    //       totalFiscalYear = (row.first_half ?? 0) + (row.second_half ?? 0);
    //       console.log("❌memberSalesTargetArray totalFiscalYear Decimalエラー", totalFiscalYear);
    //     }

    //     return {
    //       ...row,
    //       fiscal_year: totalFiscalYear,
    //     };
    //   });

    // return memberSalesTargetArray;
    // }
  }
  function ensureLastSalesRowData(data: any): SalesTargetFYRowData[] {
    console.log(
      "メイン目標 ensureTargetsRowData 前年度売上の取得結果の個数とentitiesの個数が一致しているか",
      data?.length,
      entities.length
    );
    if (!Array.isArray(data) || !data?.length || data?.length !== entities.length) {
      // entitiesの全てのエンティティが取得できているわけではなく、一部のエンティティのみ売上があった場合は、取得できなかったエンティティのみプレイスホルダーで保管し、取得できたエンティティはそのまま取得できたデータを使用する
      let dataIdToObjMap: Map<string, SalesTargetFYRowData> | null = null;
      if (Array.isArray(data) && data.length > 0) {
        dataIdToObjMap = new Map(data.map((obj: SalesTargetFYRowData) => [obj.entity_id, obj]));
      }
      const placeholderLastYearSalesArray = entities.map((entity) => {
        // 一部のエンティティのみ取得できている場合には、取得できているエンティティをチェックし、取得できているエンティティには取得済みのデータを返す
        if (Array.isArray(data) && data.length > 0 && dataIdToObjMap !== null) {
          if (dataIdToObjMap.has(entity.entity_id)) {
            const lastSalesRow = dataIdToObjMap.get(entity.entity_id);
            if (lastSalesRow) return lastSalesRow;
          }
        }
        return {
          // share: entityLevel === "company" ? 100 : 0,
          share: 100, // 総合目標のため常に100
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

        const isSetCompleteTarget = entityStructureIds.every((id) => !!id); // 空文字の場合には未設定でfalse
        // 🔹メイン目標 特定のエンティティIDのみ取得
        if (isMain) {
          // 🔸売上目標と前年度売上実績を一緒に取得するFUNCTIONの実行
          const payload = {
            _is_complete_target: isSetCompleteTarget,
            _company_id: companyId,
            _entity_level: entityLevel, // エンティティタイプ
            // _entity_id: entityId, // エンティティのid
            // _entity_name: entityNameTitle, // エンティティ名 マイクロスコープ事業部など
            _entity_ids: entityIds, // エンティティのid
            // _entity_structure_ids: entityStructureIds, // エンティティテーブルのid
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
            // オプショナルなプロパティは条件に応じて追加
            ...(isSetCompleteTarget && { _entity_structure_ids: entityStructureIds }), // エンティティテーブルのid(売上目標が設定されていない場合にはパラメータで定義したUUID[]のデータ型を満たせずにエラーとなるため、NULL値をオプショナルとして売上目標が設定されている時のみ_entity_structure_idsのパラメータを追加する)
            // _entity_structure_ids: isSetCompleteTarget ? entityStructureIds : null,
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

          let lastYearSalesRowsMap = new Map(lastYearSalesRows.map((row) => [row.entity_id, row]));

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
              // fiscal_year: calculateGrowth(target?.fiscal_year, lySales?.fiscal_year, 1), // 年度
              // first_half: calculateGrowth(target?.first_half, lySales?.first_half, 1),
              // second_half: calculateGrowth(target?.second_half, lySales?.second_half, 1),
              // first_quarter: calculateGrowth(target?.first_quarter, lySales?.first_quarter, 1),
              // second_quarter: calculateGrowth(target?.second_quarter, lySales?.second_quarter, 1),
              // third_quarter: calculateGrowth(target?.third_quarter, lySales?.third_quarter, 1),
              // fourth_quarter: calculateGrowth(target?.fourth_quarter, lySales?.fourth_quarter, 1),
              // month_01: calculateGrowth(target?.month_01, lySales?.month_01, 1),
              // month_02: calculateGrowth(target?.month_02, lySales?.month_02, 1),
              // month_03: calculateGrowth(target?.month_03, lySales?.month_03, 1),
              // month_04: calculateGrowth(target?.month_04, lySales?.month_04, 1),
              // month_05: calculateGrowth(target?.month_05, lySales?.month_05, 1),
              // month_06: calculateGrowth(target?.month_06, lySales?.month_06, 1),
              // month_07: calculateGrowth(target?.month_07, lySales?.month_07, 1),
              // month_08: calculateGrowth(target?.month_08, lySales?.month_08, 1),
              // month_09: calculateGrowth(target?.month_09, lySales?.month_09, 1),
              // month_10: calculateGrowth(target?.month_10, lySales?.month_10, 1),
              // month_11: calculateGrowth(target?.month_11, lySales?.month_11, 1),
              // month_12: calculateGrowth(target?.month_12, lySales?.month_12, 1),
            } as SalesTargetFYRowData;
          });

          console.log("✅前年比算出結果 yoyGrowthRows", yoyGrowthRows);

          const yoyGrowthRowsMap = new Map(yoyGrowthRows.map((row) => [row.entity_id, row]));

          // 売上目標と前年度売上は先頭にシェアを追加(メインのため100%)
          salesTargetRows = salesTargetRows?.length
            ? (salesTargetRows.map((obj) => ({
                ...obj,
                share: isSetCompleteTarget ? 100 : 0,
                share_first_half: isSetCompleteTarget ? 100 : 0,
                share_second_half: isSetCompleteTarget ? 100 : 0,
              })) as (SalesTargetFYRowData & { share: number })[])
            : [];
          lastYearSalesRows = lastYearSalesRows?.length
            ? (lastYearSalesRows.map((obj) => ({
                ...obj,
                share: 100,
                share_first_half: 100,
                share_second_half: 100,
                entity_name: entitiesIdToObjMap.get(obj?.entity_id)?.entity_name ?? "No Data", // propertiesテーブルから取得する前年度売上にはエンティティ名は取得できないので、ここでエンティティidに対応するエンティティ名を追加する
              })) as (SalesTargetFYRowData & { share: number })[])
            : [];

          // シェア挿入後のデータで新たにMapを生成して再代入
          lastYearSalesRowsMap = new Map(lastYearSalesRows.map((row) => [row.entity_id, row]));

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

          // if (true) {
          //   console.log("メインメインメイン", "mainEntityTarget", mainEntityTarget, "rows", rows);

          //   return { rows: null, nextOffset: offset + 1, isLastPage: true, count: null };
          // }

          // rows = ensureClientCompanies(data);
          isLastPage = rows === null || rows.length < limit; // フェッチしたデータの数が期待される数より少なければ、それが最後のページであると判断します
          count = fetchCount;
        }
        // 🔹サブ目標 メイン目標を100%として構成する個別のエンティティの目標
        // else {
        //   // 🔸売上目標と前年度売上実績を一緒に取得するFUNCTIONの実行
        //   const payload = {
        //     _company_id: companyId,
        //     _entity_level: entityLevel, // エンティティタイプ
        //     // _entity_id: entityId, // エンティティのid
        //     // _entity_name: entityNameTitle, // エンティティ名 マイクロスコープ事業部など
        //     _entity_ids: entityIds, // エンティティのid
        //     _entity_structure_ids: entityStructureIds, // エンティティテーブルのid
        //     _fiscal_year: selectedFiscalYearTarget, // 選択した会計年度
        //     // _start_year_month: currentFiscalStartYearMonth, // 202304の年度初めの年月度
        //     // _end_year_month:
        //     //   fiscalYearStartEndDate.endDate.getFullYear() * 100 + fiscalYearStartEndDate.endDate.getMonth() + 1, // 202403の決算日の年月度 ユーザーの会計年度のカレンダー年月
        //     _start_year_month: annualFiscalMonths.month_01, // annualから取得する
        //     _end_year_month: annualFiscalMonths.month_12, // annualから取得する
        //     // SELECTクエリで作成するカラム用
        //     _month_01: annualFiscalMonths.month_01,
        //     _month_02: annualFiscalMonths.month_02,
        //     _month_03: annualFiscalMonths.month_03,
        //     _month_04: annualFiscalMonths.month_04,
        //     _month_05: annualFiscalMonths.month_05,
        //     _month_06: annualFiscalMonths.month_06,
        //     _month_07: annualFiscalMonths.month_07,
        //     _month_08: annualFiscalMonths.month_08,
        //     _month_09: annualFiscalMonths.month_09,
        //     _month_10: annualFiscalMonths.month_10,
        //     _month_11: annualFiscalMonths.month_11,
        //     _month_12: annualFiscalMonths.month_12,
        //   };
        //   console.log(
        //     "🔥 queryFn関数実行 get_sales_targets_and_ly_sales_for_fy_all実行 payload",
        //     payload,
        //     "entityIds",
        //     entityIds,
        //     "entityStructureIds",
        //     entityStructureIds,
        //     "selectedFiscalYearTarget",
        //     selectedFiscalYearTarget
        //   );
        //   const {
        //     data: salesTargetData,
        //     error,
        //     count: fetchCount,
        //   } = await supabase
        //     .rpc("get_sales_targets_and_ly_sales_for_fy_all", payload, { count: "exact" })
        //     // .eq("created_by_company_id", companyId)
        //     .range(from, to);

        //   if (error) throw error;

        //   console.log("✅get_sales_targets_and_ly_sales_for_fy_all実行成功 salesTargetData", salesTargetData);

        //   // メンバーレベルの年度目標はここで上期と下期の目標を合算して補完
        //   salesTargetRows = ensureTargetsRowData(salesTargetData?.sales_targets); // SalesTargetFYRowData型チェック
        //   lastYearSalesRows = ensureLastSalesRowData(salesTargetData?.last_year_sales); // SalesTargetFYRowData型チェック

        //   const lastYearSalesRowsMap = new Map(lastYearSalesRows.map((row) => [row.entity_id, row]));

        //   // 🔸前年比の算出 「(今年の数値 - 去年の数値) / 去年の数値 * 100」の公式を使用して前年比を算出
        //   yoyGrowthRows = salesTargetRows.map((target, index) => {
        //     const sales_target_entityId = target.entity_id;
        //     // const lySales = lastYearSalesRows.find((lys) => lys.entity_id === sales_target_entityId);
        //     const lySales = lastYearSalesRowsMap.get(sales_target_entityId);
        //     // const lySales = lastYearSalesRows[index];

        //     const resultFY = calculateYearOverYear(target?.fiscal_year, lySales?.fiscal_year, 1);
        //     const result1H = calculateYearOverYear(target?.first_half, lySales?.first_half, 1);
        //     const result2H = calculateYearOverYear(target?.second_half, lySales?.second_half, 1);
        //     const result1Q = calculateYearOverYear(target?.first_quarter, lySales?.first_quarter, 1);
        //     const result2Q = calculateYearOverYear(target?.second_quarter, lySales?.second_quarter, 1);
        //     const result3Q = calculateYearOverYear(target?.third_quarter, lySales?.third_quarter, 1);
        //     const result4Q = calculateYearOverYear(target?.fourth_quarter, lySales?.fourth_quarter, 1);
        //     const resultMonth01 = calculateYearOverYear(target?.month_01, lySales?.month_01, 1);
        //     const resultMonth02 = calculateYearOverYear(target?.month_02, lySales?.month_02, 1);
        //     const resultMonth03 = calculateYearOverYear(target?.month_03, lySales?.month_03, 1);
        //     const resultMonth04 = calculateYearOverYear(target?.month_04, lySales?.month_04, 1);
        //     const resultMonth05 = calculateYearOverYear(target?.month_05, lySales?.month_05, 1);
        //     const resultMonth06 = calculateYearOverYear(target?.month_06, lySales?.month_06, 1);
        //     const resultMonth07 = calculateYearOverYear(target?.month_07, lySales?.month_07, 1);
        //     const resultMonth08 = calculateYearOverYear(target?.month_08, lySales?.month_08, 1);
        //     const resultMonth09 = calculateYearOverYear(target?.month_09, lySales?.month_09, 1);
        //     const resultMonth10 = calculateYearOverYear(target?.month_10, lySales?.month_10, 1);
        //     const resultMonth11 = calculateYearOverYear(target?.month_11, lySales?.month_11, 1);
        //     const resultMonth12 = calculateYearOverYear(target?.month_12, lySales?.month_12, 1);

        //     console.log(
        //       "result2H",
        //       result2H,
        //       "target?.second_half",
        //       target?.second_half,
        //       "lySales?.second_half",
        //       lySales?.second_half
        //     );
        //     console.log(
        //       "result4Q",
        //       result4Q,
        //       "target?.fourth_quarter",
        //       target?.fourth_quarter,
        //       "lySales?.fourth_quarter",
        //       lySales?.fourth_quarter
        //     );
        //     console.log(
        //       "resultMonth12",
        //       resultMonth12,
        //       "target?.month_12",
        //       target?.month_12,
        //       "lySales?.month_12",
        //       lySales?.month_12
        //     );

        //     return {
        //       ...target,
        //       share: null,
        //       dataset_type: "yoy_growth",
        //       // 前年比(伸び率) 25.7%の小数点第1位までの数値部分で算出してセット
        //       fiscal_year: !resultFY.error ? Number(resultFY.yearOverYear) : null, // 年度
        //       first_half: !result1H.error ? Number(result1H.yearOverYear) : null,
        //       second_half: !result2H.error ? Number(result2H.yearOverYear) : null,
        //       first_quarter: !result1Q.error ? Number(result1Q.yearOverYear) : null,
        //       second_quarter: !result2Q.error ? Number(result2Q.yearOverYear) : null,
        //       third_quarter: !result3Q.error ? Number(result3Q.yearOverYear) : null,
        //       fourth_quarter: !result4Q.error ? Number(result4Q.yearOverYear) : null,
        //       month_01: !resultMonth01.error ? Number(resultMonth01.yearOverYear) : null,
        //       month_02: !resultMonth02.error ? Number(resultMonth02.yearOverYear) : null,
        //       month_03: !resultMonth03.error ? Number(resultMonth03.yearOverYear) : null,
        //       month_04: !resultMonth04.error ? Number(resultMonth04.yearOverYear) : null,
        //       month_05: !resultMonth05.error ? Number(resultMonth05.yearOverYear) : null,
        //       month_06: !resultMonth06.error ? Number(resultMonth06.yearOverYear) : null,
        //       month_07: !resultMonth07.error ? Number(resultMonth07.yearOverYear) : null,
        //       month_08: !resultMonth08.error ? Number(resultMonth08.yearOverYear) : null,
        //       month_09: !resultMonth09.error ? Number(resultMonth09.yearOverYear) : null,
        //       month_10: !resultMonth10.error ? Number(resultMonth10.yearOverYear) : null,
        //       month_11: !resultMonth11.error ? Number(resultMonth11.yearOverYear) : null,
        //       month_12: !resultMonth12.error ? Number(resultMonth12.yearOverYear) : null,
        //     } as SalesTargetFYRowData;
        //   });

        //   console.log("✅前年比算出結果 yoyGrowthRows", yoyGrowthRows);

        //   const yoyGrowthRowsMap = new Map(yoyGrowthRows.map((row) => [row.entity_id, row]));

        //   // 売上目標と前年度売上は先頭にシェアを追加(メインのため100%)
        //   salesTargetRows = salesTargetRows?.length
        //     ? (salesTargetRows.map((obj) => ({
        //         ...obj,
        //         share: 100,
        //       })) as (SalesTargetFYRowData & { share: number })[])
        //     : [];
        //   lastYearSalesRows = lastYearSalesRows?.length
        //     ? (lastYearSalesRows.map((obj) => ({
        //         ...obj,
        //         share: 100,
        //         entity_name: entitiesIdToObjMap.get(obj?.entity_id) ?? "No Data", // propertiesテーブルから取得する前年度売上にはエンティティ名は取得できないので、ここでエンティティidに対応するエンティティ名を追加する
        //       })) as (SalesTargetFYRowData & { share: number })[])
        //     : [];

        //   // １行３セット(３行)にまとめてrowsを生成して返す
        //   rows = salesTargetRows.map((target, index) => {
        //     const targetEntityId = target.entity_id;
        //     return {
        //       sales_targets: target,
        //       last_year_sales: lastYearSalesRowsMap.get(targetEntityId),
        //       yoy_growth: yoyGrowthRowsMap.get(targetEntityId),
        //       // last_year_sales: lastYearSalesRows[index],
        //       // yoy_growth: yoyGrowthRows[index],
        //     };
        //   }) as SalesTargetsRowDataWithYoY[];

        //   console.log("✅rows結果", rows);

        //   // rows = ensureClientCompanies(data);
        //   isLastPage = rows === null || rows.length < limit; // フェッチしたデータの数が期待される数より少なければ、それが最後のページであると判断します
        //   count = fetchCount;

        //   // // 🔸売上目標を取得するFUNCTIONの実行
        //   // const payload = {
        //   //   _entity_level: entityLevel,
        //   //   // _entity_id: entityId,
        //   //   _entity_ids: entityIds,
        //   //   _fiscal_year: selectedFiscalYearTarget,
        //   // };
        //   // const {
        //   //   data,
        //   //   error,
        //   //   count: fetchCount,
        //   // } = await supabase
        //   //   .rpc("get_sales_targets_sub", payload, { count: "exact" })
        //   //   .eq("created_by_company_id", companyId)
        //   //   .range(from, to)
        //   //   .order("entity_name", { ascending: true });

        //   // if (error) throw error;

        //   // // メインの年度売上目標に対して、取得した年度目標がシェア何%かを算出して先頭に追加

        //   // // 🔸前年度売上を取得するFUNCTIONの実行

        //   // // メインの前年度の年度売上に対して、取得した年度売上がシェア何%かを算出して先頭に追加

        //   // // 🔸前年比の算出

        //   // rows = ensureClientCompanies(data);
        //   // isLastPage = rows === null || rows.length < limit; // フェッチしたデータの数が期待される数より少なければ、それが最後のページであると判断します
        //   // count = fetchCount;
        // }
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
      "main",
    ],
    queryFn: async (ctx) => {
      console.log("🔥queryFn実行");
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
    enabled: !!entities && !!entityLevel && isMain ? true : fetchEnabled,
  });
  // ================== 🌟useInfiniteQueryフック🌟 ここまで ==================

  // -------------------- 🌠useQueryでフェッチが完了したら次のテーブルをアクティブにする🌠 --------------------
  const setMainTotalTargets = useDashboardStore((state) => state.setMainTotalTargets);
  useEffect(() => {
    // 総合目標のフェッチが完了したら、子エンティティのフェッチを許可する。=> 総合目標の各目標金額を子エンティティテーブルで取得してシェアを算出する
    if (isMain) {
      if (1 <= currentActiveIndex) return;
      console.log(
        "✅✅✅✅✅✅✅✅✅✅✅✅総合目標をZustandに格納 isSuccessQuery",
        isSuccessQuery,
        "currentActiveIndex",
        currentActiveIndex
      );
      if (isSuccessQuery || isErrorQuery) {
        // 総合目標をZustandに格納
        const newQueryTarget = !!data?.pages?.length && !!data?.pages[0].rows?.length ? data?.pages[0].rows[0] : null;
        if (newQueryTarget) {
          const st = newQueryTarget.sales_targets;
          const lys = newQueryTarget.last_year_sales;
          const yoy = newQueryTarget.yoy_growth;
          setMainTotalTargets({
            sales_targets: {
              fiscal_year: st.fiscal_year ?? 0,
              first_half: st.first_half ?? 0,
              second_half: st.second_half ?? 0,
              first_quarter: st.first_quarter ?? 0,
              second_quarter: st.second_quarter ?? 0,
              third_quarter: st.third_quarter ?? 0,
              fourth_quarter: st.fourth_quarter ?? 0,
              month_01: st.month_01 ?? 0,
              month_02: st.month_02 ?? 0,
              month_03: st.month_03 ?? 0,
              month_04: st.month_04 ?? 0,
              month_05: st.month_05 ?? 0,
              month_06: st.month_06 ?? 0,
              month_07: st.month_07 ?? 0,
              month_08: st.month_08 ?? 0,
              month_09: st.month_09 ?? 0,
              month_10: st.month_10 ?? 0,
              month_11: st.month_11 ?? 0,
              month_12: st.month_12 ?? 0,
            },
            last_year_sales: {
              fiscal_year: lys.fiscal_year ?? 0,
              first_half: lys.first_half ?? 0,
              second_half: lys.second_half ?? 0,
              first_quarter: lys.first_quarter ?? 0,
              second_quarter: lys.second_quarter ?? 0,
              third_quarter: lys.third_quarter ?? 0,
              fourth_quarter: lys.fourth_quarter ?? 0,
              month_01: lys.month_01 ?? 0,
              month_02: lys.month_02 ?? 0,
              month_03: lys.month_03 ?? 0,
              month_04: lys.month_04 ?? 0,
              month_05: lys.month_05 ?? 0,
              month_06: lys.month_06 ?? 0,
              month_07: lys.month_07 ?? 0,
              month_08: lys.month_08 ?? 0,
              month_09: lys.month_09 ?? 0,
              month_10: lys.month_10 ?? 0,
              month_11: lys.month_11 ?? 0,
              month_12: lys.month_12 ?? 0,
            },
            yoy_growth: {
              fiscal_year: yoy.fiscal_year ?? null,
              first_half: yoy.first_half ?? null,
              second_half: yoy.second_half ?? null,
              first_quarter: yoy.first_quarter ?? null,
              second_quarter: yoy.second_quarter ?? null,
              third_quarter: yoy.third_quarter ?? null,
              fourth_quarter: yoy.fourth_quarter ?? null,
              month_01: yoy.month_01 ?? null,
              month_02: yoy.month_02 ?? null,
              month_03: yoy.month_03 ?? null,
              month_04: yoy.month_04 ?? null,
              month_05: yoy.month_05 ?? null,
              month_06: yoy.month_06 ?? null,
              month_07: yoy.month_07 ?? null,
              month_08: yoy.month_08 ?? null,
              month_09: yoy.month_09 ?? null,
              month_10: yoy.month_10 ?? null,
              month_11: yoy.month_11 ?? null,
              month_12: yoy.month_12 ?? null,
            },
          });
        }
        // フェッチ完了を通知
        console.log("✅✅✅✅✅✅✅✅✅✅✅✅総合目標をZustandに格納 フェッチ完了を通知");
        if (onFetchComplete) onFetchComplete();
      }
    }
  }, [isSuccessQuery, isErrorQuery, currentActiveIndex]);
  // -------------------- 🌠useQueryでフェッチが完了したら次のテーブルをアクティブにする🌠 --------------------

  const Rows = data && data.pages[0]?.rows ? data.pages.flatMap((d) => d?.rows) : [];
  const allRows = Rows.map((obj, index) => {
    return { index, ...obj };
  });

  // ================= 🔥🔥テスト🔥🔥ここまで==================

  // --------------------- 🌟過去3年分の売上と前年度の前年伸び率実績を取得するuseQuery🌟 ---------------------
  const {
    data: salesSummaryRowDataTrend,
    error: salesSummaryErrorTrend,
    isLoading: isLoadingQueryTrend,
    isSuccess: isSuccessQueryTrend,
    isError: isErrorQueryTrend,
  } = useQuerySalesSummaryAndGrowth({
    companyId: companyId,
    entityLevel: entityLevel,
    entityId: entities[0].entity_id,
    periodType: `year_half`, // 年度、上期、下期の３期間を取得
    fiscalYear: selectedFiscalYearTarget,
    annualFiscalMonths: annualFiscalMonths,
    fetchEnabled: isMain && isSuccessQuery, // メイン目標のみ売上推移をフェッチ
  });

  // 表示期間(年度全て・上期詳細・下期詳細)
  const displayTargetPeriodType = useDashboardStore((state) => state.displayTargetPeriodType);
  const setDisplayTargetPeriodType = useDashboardStore((state) => state.setDisplayTargetPeriodType);

  // 売上推移(年度・上期、下期)
  const [salesTrends, setSalesTrends] = useState<(SparkChartObj & { updateAt: number }) | null>(() => {
    // if (!salesSummaryRowDataTrend) return null;
    // // "fiscal_year" | "first_half" | "second_half"
    // // const initialData = salesSummaryRowDataTrend.find((obj) => obj.period_type === "fiscal_year")?.sales_trend ?? null;
    // const initialData =
    //   salesSummaryRowDataTrend.find((obj) => obj.period_type === displayTargetPeriodType)?.sales_trend ?? null;
    // return initialData ? { ...initialData, updateAt: Date.now() } : null;
    return null;
  });

  // -------------------------- 🌠売上推移スパークチャートに売上目標を追加(salesTrends) 🌠 --------------------------

  useEffect(() => {
    if (!isMain) return;
    if (!salesSummaryRowDataTrend) return;
    // 売上目標の追加はエンティティレベルテーブルのis_confirmed_xxxの状況に応じて追加
    if (!mainEntityTarget) return;
    if (!mainEntityObj) return;
    if (displayTargetPeriodType === "fiscal_year" && !mainEntityObj.is_confirmed_annual_half) return;
    if (displayTargetPeriodType === "first_half" && !mainEntityObj.is_confirmed_first_half_details) return;
    if (displayTargetPeriodType === "second_half" && !mainEntityObj.is_confirmed_second_half_details) return;

    let newTrendData =
      salesSummaryRowDataTrend.find((obj) => obj.period_type === displayTargetPeriodType)?.sales_trend ?? null;

    if (newTrendData && newTrendData.data) {
      let newDataArray = [...newTrendData.data];
      // 現在選択中の年度の年度・上期・下期の売上目標の期間
      const currentTargetDate =
        displayTargetPeriodType === "fiscal_year"
          ? selectedFiscalYearTarget
          : displayTargetPeriodType === "first_half"
          ? selectedFiscalYearTarget * 10 + 1
          : selectedFiscalYearTarget * 10 + 2;

      const newTitle =
        displayTargetPeriodType === "fiscal_year"
          ? `FY${selectedFiscalYearTarget}`
          : displayTargetPeriodType === "first_half"
          ? `${selectedFiscalYearTarget}H1`
          : `${selectedFiscalYearTarget}H2`;

      // クエリ結果がnullや0でない場合
      if (
        allRows.length > 0 &&
        allRows[0]?.sales_targets &&
        allRows[0]?.sales_targets.fiscal_year &&
        allRows[0]?.last_year_sales
      ) {
        const rowSales = allRows[0]?.sales_targets;
        const rowLastYearSales = allRows[0]?.last_year_sales;
        // 現在選択中の年度の年度・上期・下期の売上目標
        const currentPeriodSalesTarget =
          displayTargetPeriodType === "fiscal_year"
            ? rowSales.fiscal_year ?? 0
            : displayTargetPeriodType === "first_half"
            ? rowSales.first_half ?? 0
            : rowSales.second_half ?? 0;
        const newData = {
          date: currentTargetDate,
          value: currentPeriodSalesTarget,
        };

        if (newDataArray.length === 3) {
          newDataArray.push(newData);
        } else if (newDataArray.length === 4) {
          newDataArray.splice(-1, 1, newData);
        }

        // 前年度売上
        const lastYearSalesSamePeriod =
          displayTargetPeriodType === "fiscal_year"
            ? rowLastYearSales.fiscal_year ?? 0
            : displayTargetPeriodType === "first_half"
            ? rowLastYearSales.first_half ?? 0
            : rowLastYearSales.second_half ?? 0;

        // 前年比の計算
        const {
          yearOverYear,
          error: yoyError,
          isPositive,
        } = calculateYearOverYear(currentPeriodSalesTarget, lastYearSalesSamePeriod, 1, true, false);

        newTrendData = {
          ...newTrendData,
          title: newTitle,
          mainValue: currentPeriodSalesTarget, // SpartChart側でフォーマットするためこちらでフォーマット不要
          growthRate: yearOverYear !== null ? parseFloat(yearOverYear.replace(/%/g, "")) : null,
          data: newDataArray,
        };
      }
      // クエリ結果がnullや0の場合
      else {
        const newData = {
          date: currentTargetDate,
          value: 0,
        };
        if (newDataArray.length === 3) {
          newDataArray.push(newData);
        } else if (newDataArray.length === 4) {
          newDataArray.splice(-1, 1, newData);
        }

        newTrendData = {
          ...newTrendData,
          title: newTitle,
          mainValue: 0,
          growthRate: null,
          data: newDataArray,
        };
      }
    }

    console.log("新たなトレンドデータをセット", newTrendData, "salesSummaryRowDataTrend", salesSummaryRowDataTrend);

    setSalesTrends(newTrendData ? { ...newTrendData, updateAt: Date.now() } : null);
  }, [salesSummaryRowDataTrend, displayTargetPeriodType]);
  // -------------------------- 🌠売上推移スパークチャートに売上目標を追加(salesTrends) 🌠 --------------------------

  // const salesTrends = useMemo(() => {
  //   if (!salesSummaryRowDataTrend) return null;
  //   const salesTrendData =
  //     salesSummaryRowDataTrend.find((obj) => obj.period_type === displayTargetPeriodType)?.sales_trend ?? null;

  //   return salesTrendData ? { ...salesTrendData, updateAt: Date.now() } : null;
  // }, [salesSummaryRowDataTrend, displayTargetPeriodType]);
  // --------------------- 🌟過去3年分の売上と前年度の前年伸び率実績を取得するuseQuery🌟 ここまで ---------------------

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
    const localStorageColumnHeaderItemListJSON = localStorage.getItem(`grid_columns_sales_target_main`);
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
      newColsWidths.fill("100px", 1, 2); // 2列目を100pxに変更 id
      // newColsWidths.fill("150px", 1, 2); // 2列目を100pxに変更 id
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
    localStorage.setItem(`grid_columns_sales_target_main`, salesTargetColumnHeaderItemListJSON);
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
      localStorage.setItem(`grid_columns_sales_target_main`, salesTargetColumnHeaderItemListJSON);
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
    localStorage.setItem(`grid_columns_sales_target_main`, salesTargetColumnHeaderItemListJSON);
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
      localStorage.setItem(`grid_columns_sales_target_main`, salesTargetColumnHeaderItemListJSON);
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
      localStorage.setItem(`grid_columns_sales_target_main`, salesTargetColumnHeaderItemListJSON);
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

  // -------------------------- 🌟セクションメニュー🌟 --------------------------
  // モーダルのtop, left, width, height
  // const settingModalProperties = useDashboardStore((state) => state.settingModalProperties);
  const [openSectionMenu, setOpenSectionMenu] = useState<{
    x?: number;
    y: number;
    title?: string;
    displayX?: string;
    maxWidth?: number;
    minWidth?: number;
    fadeType?: string;
  } | null>(null);

  // 適用、戻るメニュー
  const [openSubMenu, setOpenSubMenu] = useState<{
    display: string;
    fadeType: string;
    sectionMenuWidth?: number;
  } | null>(null);

  // 説明メニュー(onClickイベントで開いてホバー可能な状態はisHoverableをtrueにする)
  const [openPopupMenu, setOpenPopupMenu] = useState<{
    x?: number;
    y: number;
    title: string;
    displayX?: string;
    maxWidth?: number;
    minWidth?: number;
    fadeType?: string;
    isHoverable?: boolean;
    sectionMenuWidth?: number;
  } | null>(null);

  const sectionMenuRef = useRef<HTMLDivElement | null>(null);

  // centerで位置が調整された時用のopacity
  // const [isAdjustedMenu, setIsAdjustedMenu] = useState(true);

  const handleOpenSectionMenu = ({ e, title, displayX, maxWidth, minWidth, fadeType }: SectionMenuParams) => {
    // if (!settingModalProperties) return;
    if (!displayX || displayX === "center") {
      const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
      let positionY = y + height + 6;
      let positionX = x;
      if (displayX === "center") positionX = x + width / 2;

      // モーダルのtopとleftを考慮
      // positionY -= settingModalProperties.top;
      // positionX -= settingModalProperties.left;

      // // centerの場合には位置の調整が入るため一旦透明にして調整後にopacityを1にする
      // setIsAdjustedMenu(false);

      console.log("クリック", y, x, positionX);
      setOpenSectionMenu({
        y: positionY,
        x: positionX,
        title: title,
        displayX: displayX,
        fadeType: fadeType,
        maxWidth: maxWidth,
      });
    } else {
      const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
      let positionX = 0;
      let positionY = y;
      if (displayX === "right") {
        positionX = -18 - 50 - (maxWidth ?? 400);
      } else if (displayX === "left") {
        positionX = window.innerWidth - x;
      } else if (displayX === "bottom_left") {
        positionX = window.innerWidth - x - width;
        positionY = y + height + 6;
      } else if (displayX === "bottom_right") {
        positionX = x;
        positionY = y + height + 6;
      } else if (displayX === "top_right") {
        positionX = x;
        positionY = window.innerHeight - y + 6;
      }
      // positionX = displayX === "right" ? -18 - 50 - (maxWidth ?? 400) : 0;
      // positionX = displayX === "left" ? window.innerWidth - x : 0;

      // let positionY = y - settingModalProperties.top;
      // positionX -= settingModalProperties.left;
      console.log("クリック", displayX, positionY, x, y, width, height);

      setOpenSectionMenu({
        x: positionX,
        y: positionY,
        title: title,
        displayX: displayX,
        maxWidth: maxWidth,
        minWidth: minWidth,
        fadeType: fadeType,
      });
    }
  };

  // useEffect(() => {
  //   if (!openSectionMenu?.displayX || openSectionMenu?.displayX !== "center") return;
  //   if (openSectionMenu?.displayX === "center" && sectionMenuRef.current && openSectionMenu.x) {
  //     const menuWith = sectionMenuRef.current.getBoundingClientRect().width;
  //     const newX = openSectionMenu.x - menuWith / 2;
  //     console.log("🔥newX", newX, menuWith, openSectionMenu.x);
  //     setOpenSectionMenu({ ...openSectionMenu, x: newX });

  //     // centerの場合には位置の調整が入るため一旦透明にして調整後にopacityを1にする
  //     setIsAdjustedMenu(true);
  //   }
  // }, [openSectionMenu?.displayX]);

  // メニューを閉じる
  const handleCloseSectionMenu = (
    errorMsg: string | undefined = undefined,
    alertMsg: string | undefined = undefined
  ) => {
    if (openSectionMenu && openSectionMenu.title === "entity") {
      setActiveEntityLocal(null);
    }

    // setOpenSectionMenu(null);
    if (openSectionMenu) setOpenSectionMenu(null);
    if (optionsEntities) setOptionsEntities([]);
    if (errorMsg) console.error(`${errorMsg}`);
    if (alertMsg) alert(alertMsg);
  };

  // ポップアップのフェードタイプ
  const getFadeTypeClass = (fadeType: string) => {
    if (fadeType === "fade_down") return styles.fade_down;
    if (fadeType === "fade_up") return styles.fade_up;
    if (fadeType === "fade") return styles.fade;
  };
  // -------------------------- 🌟セクションメニュー🌟 ここまで --------------------------

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

  const columnsSetFirstHalf = useMemo(
    () =>
      new Set([
        "entity_name",
        "dataset_type",
        "first_half",
        "first_quarter",
        "second_quarter",
        "month_01",
        "month_02",
        "month_03",
        "month_04",
        "month_05",
        "month_06",
      ]),
    []
  );
  const columnsSetSecondHalf = useMemo(
    () =>
      new Set([
        "entity_name",
        "dataset_type",
        "second_half",
        "third_quarter",
        "fourth_quarter",
        "month_07",
        "month_08",
        "month_09",
        "month_10",
        "month_11",
        "month_12",
      ]),
    []
  );

  const filteredSalesTargetColumnHeaderItemList = useMemo(() => {
    let copiedColumnHeaderList = [...salesTargetColumnHeaderItemList];

    if (displayTargetPeriodType === "first_half") {
      copiedColumnHeaderList = copiedColumnHeaderList.filter((column) => columnsSetFirstHalf.has(column.columnName));
      return copiedColumnHeaderList;
    } else if (displayTargetPeriodType === "second_half") {
      copiedColumnHeaderList = copiedColumnHeaderList.filter((column) => columnsSetSecondHalf.has(column.columnName));
      return copiedColumnHeaderList;
    } else {
      return copiedColumnHeaderList;
    }
  }, [salesTargetColumnHeaderItemList, displayTargetPeriodType]);

  // 🌟現在のカラム.map((obj) => Object.values(row)[obj.columnId])で展開してGridセルを表示する
  const columnOrder = useMemo(() => {
    let copiedColumnHeaderList = [...filteredSalesTargetColumnHeaderItemList];
    if (displayTargetPeriodType === "fiscal_year") {
      return [...copiedColumnHeaderList].map(
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
      );
    }
    if (displayTargetPeriodType === "first_half") {
      // copiedColumnHeaderList = copiedColumnHeaderList.filter((column) => columnsSetFirstHalf.has(column.columnName));
      return [...copiedColumnHeaderList].map(
        (item, index) =>
          item.columnName as keyof Omit<
            SalesTargetFHRowData,
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
      );
    }
    if (displayTargetPeriodType === "second_half") {
      // copiedColumnHeaderList = copiedColumnHeaderList.filter((column) => columnsSetSecondHalf.has(column.columnName));
      return [...copiedColumnHeaderList].map(
        (item, index) =>
          item.columnName as keyof Omit<
            SalesTargetSHRowData,
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
      );
    }

    // return [...salesTargetColumnHeaderItemList].map(
    //   (item, index) =>
    //     item.columnName as keyof Omit<
    //       SalesTargetFYRowData,
    //       | "entity_id"
    //       | "entity_level"
    //       | "share"
    //       | "created_by_company_id"
    //       | "created_by_department_id"
    //       | "created_by_section_id"
    //       | "created_by_unit_id"
    //       | "created_by_user_id"
    //       | "created_by_office_id"
    //     >
    // );
  }, [filteredSalesTargetColumnHeaderItemList, displayTargetPeriodType]); // columnNameのみの配列を取得
  // 上半期のみ 売上目標のみ、前年比のみなどのフィルターはここで行う

  console.log(
    "✅SalesTargetGridTableコンポーネントレンダリング",
    "=============================================data",
    data,
    "salesTrends",
    salesTrends,
    "displayTargetPeriodType",
    displayTargetPeriodType,
    "entityLevel",
    entityLevel,
    "mainEntityLevelList",
    mainEntityLevelList,
    "entityLevelsQueryData",
    entityLevelsQueryData,
    "entityLevelToChildLevelMap",
    entityLevelToChildLevelMap,
    "activeEntityLocal",
    activeEntityLocal,
    "optionsEntities",
    optionsEntities,
    "entityIdToEntityObjMap",
    entityIdToEntityObjMap
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
      <div className={`${styles.card_title_area} ${salesTrends ? `${styles.main}` : ``} fade08_forward`}>
        <div className={`${styles.title_left_wrapper}`}>
          {isMain && mainEntityTarget && (
            <>
              <div
                className={`${styles.card_title} relative z-[2000] space-x-[3px]`}
                onMouseEnter={(e) => {
                  const icon = infoIconTitleRef.current;
                  if (icon && icon.classList.contains(styles.animate_ping)) {
                    icon.classList.remove(styles.animate_ping);
                  }
                  handleOpenTooltip({
                    e: e,
                    display: "top",
                    content: `総合目標の変更`,
                    marginTop: 9,
                  });
                }}
                onMouseLeave={handleCloseTooltip}
                onClick={(e) => {
                  if (
                    !fiscalYearQueryData ||
                    !entityLevelsQueryData ||
                    entityLevelsQueryData.length === 0 ||
                    !(
                      fiscalYearQueryData.is_confirmed_first_half_details ||
                      fiscalYearQueryData.is_confirmed_second_half_details
                    )
                  ) {
                    // fiscal_yearsの半期詳細のどちらかがtrueでないなら(設定完了してないなら)リターン
                    return alert(
                      `${selectedFiscalYearTarget}年度の売上目標が未設定です。右上の「目標設定」から${selectedFiscalYearTarget}年度の売上目標を設定してください。`
                    );
                  }
                  // 会社・メンバーレベルの2つのみの場合、レベルの変更は無いためリターン
                  if (mainEntityLevelList.length <= 1)
                    return alert(
                      `${selectedFiscalYearTarget}年度の売上目標のレイヤーは「全社・メンバー」レイヤーの2つのみです。レイヤーが2つ以上の時のみ総合目標の表示切り替えが可能です。売上目標の作成・編集は右上の「目標設定」から可能です。`
                    );
                  // setActiveEntityLocal({
                  //   entityLevel: mainEntityTarget.entityLevel,
                  //   entityName: mainEntityTarget.entityName ?? "",
                  //   entityId: mainEntityTarget.entityId ?? "",
                  // });

                  // 上位エンティティレベルが総合目標になるためparentEntityをセットする
                  setActiveEntityLocal({
                    entityLevel: mainEntityTarget.parentEntityLevel,
                    entityName: mainEntityTarget.parentEntityName ?? "",
                    entityId: mainEntityTarget.parentEntityId ?? "",
                  });

                  if (["department", "section", "unit"].includes(mainEntityTarget.parentEntityLevel)) {
                    if (!entitiesHierarchyMap) return console.error(`entitiesHierarchyMap なし`);
                    if (!entitiesHierarchyQueryData) return console.error(`entitiesHierarchyQueryData なし`);
                    // if (!entityLevelToParentLevelMap) return console.error(`entityLevelToParentLevelMap なし`);

                    const entityGroupsByParent = entitiesHierarchyQueryData[mainEntityTarget.parentEntityLevel];

                    if (!entityGroupsByParent?.length)
                      return console.error(`entityGroupsByParent.lengthなし ${entityGroupsByParent.length}`);

                    const flattenedEntities = entityGroupsByParent
                      .map((group) => group.entities)
                      .flatMap((array) => array);

                    // 最初の親エンティティグループのオブジェクトを取得
                    // department: 全社-事業部エンティティ配列
                    // section: 事業部1-課エンティティ配列, 事業部2-課エンティティ配列, ...

                    if (!flattenedEntities.length) {
                      console.error(
                        "エラー：flattenedEntities.lengthなし firstEntityGroupByParent",
                        flattenedEntities,
                        "entityGroupsByParent",
                        entityGroupsByParent,
                        "flattenedEntities.length",
                        flattenedEntities.length
                      );
                      return;
                    }

                    // クリックしたレベルの選択肢をセット
                    setOptionsEntities(flattenedEntities);
                  }

                  // クリックした位置が上半分か下半分かで上下表示方向を出し分ける
                  const { x, y, width, height } = e.currentTarget.getBoundingClientRect();

                  // const isTopHalf = window.innerHeight / 2 > y;
                  const isUp = window.innerHeight < y + height + 386;

                  const sectionWidth = 330;
                  if (!isUp) {
                    handleOpenSectionMenu({
                      e,
                      title: "entity",
                      // displayX: "right",
                      displayX: "bottom_right",
                      fadeType: "fade_up",
                      maxWidth: sectionWidth,
                      minWidth: sectionWidth,
                    });
                  } else {
                    handleOpenSectionMenu({
                      e,
                      title: "entity",
                      // displayX: "right",
                      displayX: "top_right",
                      fadeType: "fade_up",
                      maxWidth: sectionWidth,
                      minWidth: sectionWidth,
                    });
                  }

                  setOpenSubMenu({ display: "right", fadeType: "fade_down", sectionMenuWidth: sectionWidth });
                  handleCloseTooltip();
                }}
              >
                {/* <div className={`absolute left-0 top-[100%] z-[2000] h-[500px] w-[300px] bg-red-100`}></div> */}
                <span>{entityLevel === "company" ? (language === "ja" ? `全社` : `Company`) : divName}</span>
                <IoChevronDownOutline className={` text-[18px]`} />
              </div>

              {isMain && (
                <>
                  <div
                    className={`flex-center ml-[15px] rounded-full border border-solid border-[var(--color-border-light)] px-[12px] py-[3px] text-[12px] font-bold text-[var(--color-text-sub)]`}
                  >
                    <span>総合目標</span>
                  </div>
                </>
              )}

              {optionsFiscalYear && selectedFiscalYearTarget && (
                <div
                  className={`${styles.select_text_wrapper} relative !ml-[15px] flex pl-[1px] text-[15px]`}
                  onMouseEnter={(e) => {
                    const tooltipText = `選択中の会計年度の目標を表示します。\n会計年度は2020年から現在まで選択可能で、翌年度はお客様の決算日から\n現在の日付が3ヶ月を切ると表示、設定、編集が可能となります。`;
                    handleOpenTooltip({
                      e: e,
                      display: "top",
                      content: tooltipText,
                      marginTop: 56,
                    });
                  }}
                  onMouseLeave={handleCloseTooltip}
                >
                  <select
                    ref={selectPeriodRef}
                    className={`${styles.select_text} ${styles.arrow_none} z-[1] truncate pr-[17px]`}
                    // className={`${styles.select_text} mr-[6px] truncate`}
                    value={selectedFiscalYearTarget ?? ""}
                    onChange={(e) => {
                      setSelectedFiscalYearTarget(Number(e.target.value));
                      if (onResetFetchComplete) onResetFetchComplete();
                    }}
                    onClick={handleCloseTooltip}
                  >
                    {optionsFiscalYear.map((year) => (
                      <option key={year} value={year}>
                        {language === "en" ? `FY ` : ``}
                        {year}
                        {language === "ja" ? `年度` : ``}
                      </option>
                    ))}
                  </select>
                  <div className={`flex-center absolute right-0 top-0 z-0 h-[24px] text-[14px]`}>
                    <IoChevronDownOutline className={` text-[14px]`} />
                  </div>
                </div>
              )}

              {/* {salesTrends && isMain && (
                <div className={`relative !ml-[15px] flex`}>
                  <SparkChart
                    key={`${entityLevel}_${salesTrends?.title}_${salesTrends?.mainValue}_${salesTrends?.data?.length}_${salesTrends.updateAt}_main`}
                    id={`${entityLevel}_${salesTrends?.title}_${salesTrends?.mainValue}_${salesTrends?.data?.length}_${salesTrends.updateAt}_main`}
                    title={salesTrends.title}
                    subTitle={salesTrends.subTitle}
                    mainValue={salesTrends.mainValue} // COALESCE関数で売上がなくても0が入るためnumber型になる
                    growthRate={salesTrends.growthRate}
                    data={salesTrends.data}
                    dataUpdateAt={salesTrends.updateAt}
                    height={48}
                    width={270}
                    delay={600}
                  />
                </div>
              )} */}

              <div
                className="flex-center relative !ml-[15px] h-[16px] w-[16px] rounded-full"
                onMouseEnter={(e) => {
                  const icon = infoIconTitleRef.current;
                  if (icon && icon.classList.contains(styles.animate_ping)) {
                    icon.classList.remove(styles.animate_ping);
                  }
                  if (!isMain) return;
                  handleOpenTooltip({
                    e: e,
                    display: "top",
                    content: isMain ? `下矢印から総合目標の区分や会計年度の切り替えが可能です。` : ``,
                    marginTop: 22,
                  });
                }}
                onMouseLeave={handleCloseTooltip}
              >
                <div
                  ref={infoIconTitleRef}
                  className={`flex-center absolute left-0 top-0 h-[16px] w-[16px] rounded-full border border-solid border-[var(--color-bg-brand-f)] ${styles.animate_ping}`}
                ></div>
                <ImInfo className={`min-h-[16px] min-w-[16px] text-[var(--color-bg-brand-f)]`} />
              </div>
              {!isLoadingRefresh && (
                <div
                  className={`${styles.icon_path_stroke} ${styles.icon_btn_refresh} flex-center transition-bg03 ml-[15px]`}
                  onMouseEnter={(e) => {
                    handleOpenTooltip({
                      e: e,
                      display: "top",
                      content: "リフレッシュ",
                      // content2: "フィルターの切り替えが可能です。",
                      // marginTop: 57,
                      // marginTop: 38,
                      marginTop: 6,
                      itemsPosition: "center",
                      // whiteSpace: "nowrap",
                    });
                  }}
                  onMouseLeave={handleCloseTooltip}
                  onClick={async () => {
                    setIsLoadingRefresh(true);
                    // 目標タブトップ画面の設定年度の売上目標を更新
                    await queryClient.invalidateQueries([
                      "sales_targets",
                      `${selectedFiscalYearTarget}`,
                      entityLevel ?? null,
                    ]);
                    await new Promise((resolve) => setTimeout(resolve, 300));
                    setIsLoadingRefresh(false);
                    handleCloseTooltip();
                  }}
                >
                  <GrPowerReset />
                </div>
              )}
              {isLoadingRefresh && (
                <div className={`flex-center ml-[15px] min-h-[28px] min-w-[28px]`}>
                  <SpinnerX h="h-[16px]" w="w-[16px]" />
                </div>
              )}

              {salesTrends && isMain && (
                <div className={`fade08_forward relative !ml-[18px] flex min-w-[232px]`}>
                  <SparkChart
                    key={`${entityLevel}_${salesTrends?.title}_${salesTrends?.mainValue}_${salesTrends?.data?.length}_${salesTrends.updateAt}_main`}
                    id={`${entityLevel}_${salesTrends?.title}_${salesTrends?.mainValue}_${salesTrends?.data?.length}_${salesTrends.updateAt}_main`}
                    title={salesTrends.title}
                    subTitle={salesTrends.subTitle}
                    mainValue={salesTrends.mainValue} // COALESCE関数で売上がなくても0が入るためnumber型になる
                    growthRate={salesTrends.growthRate}
                    data={salesTrends.data}
                    dataUpdateAt={salesTrends.updateAt}
                    height={48}
                    width={270}
                    delay={500}
                  />
                </div>
              )}
            </>
          )}
          {!isMain && (
            <div className={`${styles.card_title}`}>
              {/* <span>{entityNameTitle}</span> */}
              <span>
                {entityLevel === "company" ? (language === "ja" ? `全社` : `Company`) : `${divName}別 売上目標`}
              </span>
            </div>
          )}
        </div>
        <div className={`${styles.title_right_wrapper} relative space-x-[12px]`}>
          {isMain && (
            <>
              {/* <div
                className={`${styles.btn} ${styles.basic} space-x-[3px]`}
                onMouseEnter={(e) => {
                  handleOpenTooltip({
                    e: e,
                    display: "top",
                    content: `表示期間を変更`,
                    marginTop: 9,
                  });
                }}
                onMouseLeave={handleCloseTooltip}
                onClick={() => {
                  const entityId = mainEntityTarget?.parentEntityId;
                  if (!entityId) return;
                  if (entityId === stickyRow) {
                    setStickyRow(null);
                  } else {
                    setStickyRow(entityId);
                  }
                  handleCloseTooltip();
                }}
              >
                <span>全て</span>
                <IoCaretDownOutline className={``} />
              </div> */}
              <div
                className={`${styles.select_btn_wrapper} fade08_forward relative flex items-center text-[var(--color-text-title-g)]`}
                onMouseEnter={(e) => {
                  let tooltipContent = ``;
                  if (fiscalYearQueryData) {
                    if (
                      fiscalYearQueryData.is_confirmed_first_half_details &&
                      fiscalYearQueryData.is_confirmed_second_half_details
                    ) {
                      tooltipContent = `表示期間を変更`;
                    } else {
                      tooltipContent = `上期と下期の両期間の設定が完了すると\n表示期間を「全て・上期・下期」から変更が可能になります`;
                    }
                  } else {
                    tooltipContent = `売上目標の設定が完了すると\n表示期間を「全て・上期・下期」から変更が可能になります`;
                  }

                  if (!!tooltipContent)
                    handleOpenTooltip({
                      e: e,
                      display: "top",
                      content: tooltipContent,
                      marginTop: fiscalYearQueryData
                        ? fiscalYearQueryData.is_confirmed_first_half_details &&
                          fiscalYearQueryData.is_confirmed_second_half_details
                          ? 9
                          : 29
                        : 29,
                    });
                }}
                onMouseLeave={handleCloseTooltip}
              >
                <select
                  className={`z-10 cursor-pointer select-none  appearance-none truncate rounded-[6px] py-[4px] pl-[8px] pr-[24px]`}
                  value={displayTargetPeriodType}
                  onChange={(e) => {
                    setDisplayTargetPeriodType(e.target.value as "first_half" | "second_half" | "fiscal_year");
                    handleCloseTooltip();
                  }}
                >
                  {fiscalYearQueryData &&
                    fiscalYearQueryData.is_confirmed_first_half_details &&
                    fiscalYearQueryData.is_confirmed_second_half_details && (
                      <>
                        <option value="fiscal_year">全て</option>
                        <option value="first_half">上期</option>
                        <option value="second_half">下期</option>
                      </>
                    )}
                  {fiscalYearQueryData &&
                    fiscalYearQueryData.is_confirmed_first_half_details &&
                    !fiscalYearQueryData.is_confirmed_second_half_details && (
                      <>
                        <option value="fiscal_year">全て</option>
                        <option value="first_half">上期</option>
                      </>
                    )}
                  {fiscalYearQueryData &&
                    !fiscalYearQueryData.is_confirmed_first_half_details &&
                    fiscalYearQueryData.is_confirmed_second_half_details && (
                      <>
                        <option value="fiscal_year">全て</option>
                        <option value="second_half">下期</option>
                      </>
                    )}
                  {(!fiscalYearQueryData ||
                    (!fiscalYearQueryData.is_confirmed_first_half_details &&
                      !fiscalYearQueryData.is_confirmed_second_half_details)) && (
                    <option value="fiscal_year">全て</option>
                  )}
                </select>
                {/* 上下矢印アイコン */}
                <div className={`${styles.select_arrow}`}>
                  <HiOutlineSelector className="stroke-[2] text-[16px]" />
                </div>
              </div>

              <div
                className={`${styles.btn} ${styles.basic} space-x-[4px]`}
                onMouseEnter={(e) => {
                  // 売上目標が設定されていない状態ではエンティティidが存在せず、stickyが機能しなくなるので、main_entity_targetの文字列をセット
                  const entityId = "main_entity_target";
                  handleOpenTooltip({
                    e: e,
                    display: "top",
                    content: stickyRow === entityId ? `固定を解除` : `画面内に固定`,
                    marginTop: 9,
                  });
                }}
                onMouseLeave={handleCloseTooltip}
                onClick={() => {
                  const entityId = "main_entity_target";
                  if (!entityId) return;
                  if (entityId === stickyRow) {
                    setStickyRow(null);
                  } else {
                    setStickyRow(entityId);
                  }
                  handleCloseTooltip();
                }}
              >
                {stickyRow === "main_entity_target" && <TbSnowflakeOff />}
                {stickyRow !== "main_entity_target" && <TbSnowflake />}
                {stickyRow === "main_entity_target" && <span>解除</span>}
                {stickyRow !== "main_entity_target" && <span>固定</span>}
              </div>
            </>
          )}
        </div>
      </div>
      {/* コンテンツエリア */}
      <div
        className={`${styles.main_container} ${
          theme === "light" ? `${styles.theme_f_light}` : `${styles.theme_f_dark}`
        } fade08_forward`}
      >
        {/* 右側shadow */}
        <div
          className={`absolute right-[9px] top-0 z-[100] h-full w-[33px]`}
          style={{ background: `var(--color-dashboard-table-right-shadow)` }}
        />
        {/* 右側shadow */}
        {/* ================== Gridスクロールコンテナ ================== */}
        <div
          ref={parentGridScrollContainer}
          role="grid"
          aria-multiselectable="true"
          style={{
            width: "100%",
            ...(isMain && { maxHeight: `${36 + rowHeight * displayKeys.length + 24}px` }),
          }}
          className={`${styles.grid_scroll_container}`}
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
              className={`${styles.grid_column_header_all} ${styles.grid_column_frozen} ${
                styles.grid_column_header_checkbox_column
              } ${styles.share} ${displayTargetPeriodType !== "fiscal_year" ? `${styles.drag_disabled}` : ``}`}
              // style={{ gridColumnStart: 1, left: columnHeaderLeft(0), position: "sticky" }}
              style={{ gridColumnStart: 1, left: "0px", position: "sticky" }}
              // onClick={(e) => {
              //   // if (displayTargetPeriodType !== "fiscal_year") return;
              //   handleClickGridCell(e);
              // }}
            >
              <div
                // className={styles.grid_select_cell_header}
                className={`${styles.grid_header_cell_share} flex flex-col items-center`}
              >
                {/* <span>シェア</span> */}
                <>
                  <span className={`pointer-events-none text-[12px] leading-[12px]`}>シェア</span>
                  <span className={`pointer-events-none text-[10px]`}>
                    (
                    {displayTargetPeriodType === "fiscal_year"
                      ? `年度`
                      : displayTargetPeriodType === "first_half"
                      ? `上期`
                      : `下期`}
                    )
                  </span>
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
            {/* {!!salesTargetColumnHeaderItemList.length &&
              [...salesTargetColumnHeaderItemList] */}
            {!!filteredSalesTargetColumnHeaderItemList.length &&
              [...filteredSalesTargetColumnHeaderItemList]
                .sort((a, b) => a.columnIndex - b.columnIndex) // columnIndexで並び替え
                .map((key, index) => (
                  <div
                    // key={index}
                    // key={key.columnId}
                    key={key.columnName}
                    ref={(ref) => (colsRef.current[index] = ref)}
                    role="columnheader"
                    // draggable={displayTargetPeriodType === "fiscal_year" ? !key.isFrozen : false} // テスト
                    // draggable={!key.isFrozen} // テスト
                    draggable={false} // テスト
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
                    // aria-colindex={key.columnIndex}
                    aria-colindex={displayTargetPeriodType !== "fiscal_year" ? index + 2 : key.columnIndex} // colindexはフィルター関係なしに元々のカラムリストのindex通りにセットする colindexは1からスタートで、mapからのぞいたチェックボックスが1でmapの開始位置は2からのためindex+2
                    // aria-colindex={index + 2}
                    aria-selected={false}
                    tabIndex={-1}
                    className={`${styles.grid_column_header_all} ${
                      key.isFrozen ? `${styles.grid_column_frozen} cursor-default` : ""
                    } ${isFrozenCountRef.current === 1 && index === 0 ? styles.grid_cell_frozen_last : ""} ${
                      isFrozenCountRef.current === index + 1 ? styles.grid_cell_frozen_last : ""
                    } ${styles.grid_cell_resizable} dropzone ${key.isOverflow ? `${styles.is_overflow}` : ""}`}
                    // styles.drag_disabled
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
                    onDragStart={(e) => {
                      // if (displayTargetPeriodType !== "fiscal_year") return;
                      handleDragStart(e, index);
                    }} // テスト
                    onDragEnd={(e) => {
                      // if (displayTargetPeriodType !== "fiscal_year") return;
                      handleDragEnd(e);
                    }} // テスト
                    onDragOver={(e) => {
                      // if (displayTargetPeriodType !== "fiscal_year") return;
                      e.preventDefault(); // テスト
                      handleDragOver(e, index);
                    }}
                    // onDragEnter={debounce((e) => {
                    //   handleDragEnter(e, index); // デバウンス
                    // }, 300)}
                    onDragEnter={(e) => {
                      // if (displayTargetPeriodType !== "fiscal_year") return;
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
                      onMouseDown={(e) => {
                        // if (displayTargetPeriodType !== "fiscal_year") return;
                        handleMouseDown(e, index);
                      }}
                      onMouseEnter={() => {
                        // if (displayTargetPeriodType !== "fiscal_year") return;
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
                        // if (displayTargetPeriodType !== "fiscal_year") return;
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
                              // key={"row" + virtualRow.index.toString() + displayKey}
                              key={
                                "row" + virtualRow.index.toString() + displayKey + displayRowData?.entity_id ??
                                "no_entity" + displayRowData?.dataset_type ??
                                "no_dataset_type"
                              }
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
                                  // onClick={(e) => handleClickGridCell(e)}
                                >
                                  {(displayKey === "sales_targets" || displayKey === "last_year_sales") &&
                                    displayRowData && (
                                      <div
                                        className={`${styles.grid_header_cell_share} flex-center relative h-full w-full pb-[6px]`}
                                      >
                                        <ProgressCircle
                                          circleId="3"
                                          textId="3"
                                          // progress={100}
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
                                          // targetNumber={100}
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
                                      // const columnName = salesTargetColumnHeaderItemList[index]?.columnName;
                                      const columnName = filteredSalesTargetColumnHeaderItemList[index]?.columnName;
                                      // const columnName = Object.keys(displayRowData)[];
                                      let displayValue = value;

                                      displayValue = formatDisplayValue(displayKey, columnName, displayValue);

                                      if (columnName === "fiscal_year" && displayKey === "sales_targets") {
                                      }
                                      return (
                                        <div
                                          // key={"row" + virtualRow.index.toString() + index.toString() + displayKey}
                                          key={
                                            "gridcell" +
                                              virtualRow.index.toString() +
                                              index.toString() +
                                              displayKey +
                                              displayRowData?.entity_id ??
                                            "no_entity" + displayRowData?.dataset_type ??
                                            "no_dataset_type" + columnName
                                          }
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
                                              ? `${styles.grid_column_frozen}`
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
                                                  // backdropFilter: `blur(16px)`,
                                                }
                                              : {
                                                  gridColumnStart: salesTargetColumnHeaderItemList[index]
                                                    ? salesTargetColumnHeaderItemList[index]?.columnIndex
                                                    : index + 2,
                                                }
                                          }
                                          // onClick={handleClickGridCell}
                                          // onDoubleClick={(e) =>
                                          //   handleDoubleClick(
                                          //     e,
                                          //     index,
                                          //     salesTargetColumnHeaderItemList[index].columnName
                                          //   )
                                          // }
                                          // onKeyDown={handleKeyDown}
                                        >
                                          {displayValue}
                                          {/* <span className={`z-0`}>{displayValue}</span>
                                          <div
                                            className={`absolute left-0 top-0 z-10 h-full w-full backdrop-blur-md`}
                                          ></div> */}
                                        </div>
                                      );
                                    })
                                ) : (
                                  // カラム順番が変更されていない場合には、初期のallRows[0]のrowからmap()で展開
                                  Object.values(rowData).map((value, index) => (
                                    <div
                                      // key={"row" + virtualRow.index.toString() + index.toString()}
                                      key={
                                        "gridcell" +
                                          virtualRow.index.toString() +
                                          index.toString() +
                                          displayKey +
                                          displayRowData?.entity_id ??
                                        "no_entity" + displayRowData?.dataset_type ??
                                        "no_dataset_type" + filteredSalesTargetColumnHeaderItemList[index]?.columnName
                                      }
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

      {/* ---------------------------- 🌟セッティングメニュー🌟 ---------------------------- */}
      {/* クリック時のオーバーレイ */}
      {openSectionMenu && <div className={`${styles.menu_overlay}`} onClick={() => handleCloseSectionMenu()}></div>}
      {openSectionMenu && (
        <div
          ref={sectionMenuRef}
          className={`${styles.settings_menu} fixed z-[3000] h-auto rounded-[6px] ${
            openSectionMenu.fadeType ? getFadeTypeClass(openSectionMenu.fadeType) : ``
          }`}
          style={{
            ...(openSectionMenu.maxWidth && { maxWidth: `${openSectionMenu.maxWidth}px` }),
            ...(openSectionMenu.minWidth && { minWidth: `${openSectionMenu.minWidth}px` }),
            ...((openSectionMenu.displayX === "center" || !openSectionMenu.displayX) && {
              left: `${openSectionMenu.x}px`,
              top: `${openSectionMenu.y}px`,
            }),
            ...(openSectionMenu?.displayX &&
              ["left", "bottom_left"].includes(openSectionMenu?.displayX) && {
                right: `${openSectionMenu?.x ?? 0}px`,
                top: `${openSectionMenu.y}px`,
              }),
            ...(openSectionMenu?.displayX &&
              ["right", "bottom_right"].includes(openSectionMenu?.displayX) && {
                left: `${openSectionMenu?.x ?? 0}px`,
                top: `${openSectionMenu.y}px`,
              }),
            ...(openSectionMenu?.displayX === "top_left" && {
              right: `${openSectionMenu?.x ?? 0}px`,
              bottom: `${openSectionMenu.y}px`,
            }),
            ...(openSectionMenu?.displayX === "top_right" && {
              left: `${openSectionMenu?.x ?? 0}px`,
              bottom: `${openSectionMenu.y}px`,
            }),
          }}
        >
          {/* ------------------------ エンティティ選択メニュー ------------------------ */}
          {openSectionMenu.title === "entity" &&
            mainEntityTarget &&
            entityLevelsQueryData &&
            entitiesHierarchyQueryData && (
              <>
                <h3 className={`w-full px-[20px] pt-[20px] text-[15px] font-bold`}>
                  <div className="flex max-w-max flex-col">
                    <span>メイン目標</span>
                    <div className={`${styles.section_underline} w-full`} />
                  </div>
                </h3>

                <p className={`w-full px-[20px] pb-[12px] pt-[10px] text-[11px]`}>
                  下記メニューから「全社・事業部・課/セクション・係/チーム・事業所」を変更することで、各区分に応じたメイン目標を表示します。
                </p>

                <hr className="min-h-[1px] w-full bg-[#999]" />

                {/* -------- メニューコンテンツエリア -------- */}
                <div className={`${styles.scroll_container} flex max-h-[240px] w-full flex-col overflow-y-auto`}>
                  <ul className={`flex h-full w-full flex-col`}>
                    {/* ------------------------------------ */}
                    {mainEntityLevelList.map((obj, index) => {
                      const isActive = obj.title === activeEntityLocal?.entityLevel;
                      return (
                        <li
                          key={obj.title}
                          className={`${styles.list} ${styles.select_list} ${isActive ? styles.active : ``}`}
                          onClick={(e) => {
                            if (isActive) return console.log("リターン ", isActive, obj);
                            if (!entityLevelToChildLevelMap)
                              return handleCloseSectionMenu(`entityLevelToChildLevelMap なし`);
                            if (!entitiesHierarchyMap) return handleCloseSectionMenu(`entitiesHierarchyMap なし`);
                            // 全社の場合は、そのまま区分を変更
                            if (obj.title === "company") {
                              // setActiveDisplayTabs({ ...activeDisplayTabs, entity: obj.title });
                              //
                              const parentEntityGroups = entitiesHierarchyQueryData[obj.title];

                              if (parentEntityGroups.length !== 1)
                                return handleCloseSectionMenu(
                                  `parentEntityGroups.lengthが1ではない ${parentEntityGroups.length}`
                                );

                              const companyEntityGroupObj = parentEntityGroups[0];
                              if (companyEntityGroupObj.entities.length !== 1)
                                return handleCloseSectionMenu(
                                  `companyEntityGroupObj.entities.lengthが1ではない ${companyEntityGroupObj.entities.length}`
                                );

                              // 一番目のエンティティ
                              const companyEntityObj = companyEntityGroupObj.entities[0];

                              // １番目のエンティティidに紐づく子エンティティグループ
                              const childLevel = entityLevelToChildLevelMap.get(companyEntityObj.entity_level);

                              if (!childLevel) return handleCloseSectionMenu(`childLevel なし`);

                              const childEntityGroups = entitiesHierarchyMap.get(childLevel);

                              if (!childEntityGroups) return handleCloseSectionMenu(`childEntityGroups なし`);

                              // 親エンティティレベルの選択肢から一番上の親エンティティのidに紐づく子エンティティグループを取得
                              const childEntityGroup = childEntityGroups.find(
                                (group) => group.parent_entity_id === companyEntityObj.entity_id
                              );

                              if (!childEntityGroup) return handleCloseSectionMenu(`childEntityGroup なし`);
                              if (!childEntityGroup.entities.length)
                                return handleCloseSectionMenu(`childEntityGroup.entities.length なし`);

                              // 選択肢の一番上の親エンティティとそれに紐づくエンティティグループを初期値としてセット
                              // 全社エンティティは１つのみなのでそのままメインエンティティstateを更新
                              setMainEntityTarget({
                                ...mainEntityTarget,
                                entityLevel: childEntityGroup.entities[0].entity_level as EntityLevelNames,
                                entities: childEntityGroup.entities,
                                parentEntityId: companyEntityObj.entity_id ?? "",
                                parentEntityLevel: companyEntityObj.entity_level as
                                  | "company"
                                  | "department"
                                  | "section"
                                  | "unit", // company
                              });

                              // リセット
                              if (onResetFetchComplete) onResetFetchComplete();

                              handleCloseSectionMenu();
                              // setActiveEntityLocal(null);
                              // setOpenSectionMenu(null);
                            }
                            // 事業部~係までは、エンティティ区分タイプ+表示するエンティティ名が必要なため、一旦ローカルstateに区分タイプを保存して、右側の選択エリアでエンティティ名をセレクトで選択してもらう
                            else if (["department", "section", "unit"].includes(obj.title)) {
                              if (!entitiesHierarchyMap) return handleCloseSectionMenu(`entitiesHierarchyMap なし`);
                              if (!entityLevelToParentLevelMap)
                                return handleCloseSectionMenu(`entityLevelToParentLevelMap なし`);

                              const entityGroupsByParent = entitiesHierarchyQueryData[obj.title];

                              if (!entityGroupsByParent?.length)
                                return handleCloseSectionMenu(
                                  `entityGroupsByParent.lengthなし ${entityGroupsByParent.length}`
                                );

                              const flattenedEntities = entityGroupsByParent
                                .map((group) => group.entities)
                                .flatMap((array) => array);

                              // 最初の親エンティティグループのオブジェクトを取得
                              // department: 全社-事業部エンティティ配列
                              // section: 事業部1-課エンティティ配列, 事業部2-課エンティティ配列, ...

                              if (!flattenedEntities.length) {
                                console.error(
                                  "エラー：firstEntityGroupByParent",
                                  flattenedEntities,
                                  "entityGroupsByParent",
                                  entityGroupsByParent
                                );
                                return handleCloseSectionMenu(
                                  `flattenedEntities.lengthなし ${flattenedEntities.length}`
                                );
                              }

                              // 一番目のエンティティ(事業部1-課エンティティ配列)
                              const firstEntity = flattenedEntities[0];

                              setActiveEntityLocal({
                                entityLevel: firstEntity.entity_level as "company" | "department" | "section" | "unit",
                                entityName: firstEntity.entity_name,
                                entityId: firstEntity.entity_id,
                              });

                              // クリックしたレベルの選択肢をセット
                              // setOptionsBySelectedLevel(entityGroupsByParent);
                              setOptionsEntities(flattenedEntities);
                            }
                            // handleClosePopupMenu();
                          }}
                        >
                          <div className="pointer-events-none flex min-w-[110px] items-center">
                            <MdOutlineDataSaverOff
                              className={`${styles.list_icon} mr-[16px] min-h-[20px] min-w-[20px] text-[20px]`}
                            />
                            <div className="flex select-none items-center space-x-[2px]">
                              <span className={`${styles.select_item}`}>{obj.name[language]}</span>
                            </div>
                          </div>
                          {isActive && (
                            <div className={`${styles.icon_container}`}>
                              <BsCheck2 className="pointer-events-none min-h-[22px] min-w-[22px] stroke-1 text-[22px] text-[#00d436]" />
                            </div>
                          )}
                        </li>
                      );
                    })}
                    {/* {mainEntityLevelList.map((obj, index) => {
                      const isActive = obj.title === activeEntityLocal?.entityLevel;
                      return (
                        <li
                          key={obj.title}
                          className={`${styles.list} ${styles.select_list} ${isActive ? styles.active : ``}`}
                          onClick={(e) => {
                            if (isActive) return console.log("リターン ", isActive, obj);
                            // 全社の場合は、そのまま区分を変更
                            if (obj.title === "company") {
                              // setActiveDisplayTabs({ ...activeDisplayTabs, entity: obj.title });
                              // 親エンティティがcompanyのエンティティオブジェクトをセットする
                              const companyIndex = entityLevelsQueryData.findIndex(
                                (level) => level.entity_level === "company"
                              );
                              if (companyIndex === -1) return handleCloseSectionMenu();
                              const nextLevelObj = entityLevelsQueryData[companyIndex + 1];
                              if (!nextLevelObj) return handleCloseSectionMenu();
                              const nextLevel = nextLevelObj.entity_level;
                              if (!nextLevel || !(nextLevel in entitiesHierarchyQueryData))
                                return handleCloseSectionMenu();
                              if (
                                ["company", "department", "section", "unit", "member", "office"].includes(nextLevel) &&
                                nextLevel in entitiesHierarchyQueryData
                              ) {
                                // 現在取得済みのエンティティレベルの中でparentEntityLevelがcompanyのエンティティをentitiesにセット
                                // 親エンティティが全社エンティティの場合は上位グループ配列は全社1つ
                                if (entitiesHierarchyQueryData[nextLevel as EntityLevelNames].length !== 1)
                                  return handleCloseSectionMenu();
                                const entityGroupByParentCompany =
                                  entitiesHierarchyQueryData[nextLevel as EntityLevelNames][0];
                                console.log(
                                  "entityGroupByParentCompany",
                                  entityGroupByParentCompany,
                                  "nextLevelObj",
                                  nextLevelObj
                                );
                                setMainEntityTarget({
                                  ...mainEntityTarget,
                                  entityLevel: nextLevel as EntityLevelNames,
                                  entities: entityGroupByParentCompany.entities,
                                  parentEntityId: entityGroupByParentCompany.parent_entity_id ?? "",
                                  parentEntityLevel: "company",
                                });
                                // setMainEntityTarget({ ...mainEntityTarget, entityLevel: obj.title });
                                setActiveEntityLocal(null);
                                setOpenSectionMenu(null);
                              }
                            }
                            // 事業部~事業所までは、エンティティ区分タイプ+表示するエンティティ名が必要なため、一旦ローカルstateに区分タイプを保存して、右側の選択エリアでエンティティ名をセレクトで選択してもらう
                            else {
                              if (!entitiesHierarchyMap) return handleCloseSectionMenu(`entitiesHierarchyMapなし`);
                              if (!entityLevelToParentLevelMap)
                                return handleCloseSectionMenu(`entityLevelToParentLevelMapなし`);
                              if (obj.title === "department") {
                                if (!departmentDataArray || departmentDataArray?.length === 0) {
                                  alert("事業部リストがありません。先に「会社・チーム」から事業部を作成してください。");
                                  return;
                                }
                                const departmentId = departmentDataArray ? departmentDataArray[0].id : "";
                                const newDepartment = departmentIdToObjMap?.get(departmentId);
                                setSelectedDepartment(newDepartment ?? null);
                                setActiveEntityLocal({
                                  entityLevel: obj.title,
                                  entityName: newDepartment?.department_name ?? "",
                                  entityId: newDepartment?.id ?? "",
                                });
                                // const departmentEntitiesGroups = entitiesHierarchyMap.get("department");
                                // if (!departmentEntitiesGroups || !departmentEntitiesGroups[0].entities?.length)
                                //   return handleCloseSectionMenu(`departmentEntitiesGroupsなし`);
                                // const initialDepartmentObj = departmentEntitiesGroups[0].entities[0]
                                // setSelectedDepartment(departmentEntitiesGroups[0].entities[0])
                                // setActiveEntityLocal({
                                //   entityLevel: 'department',
                                //   entityName: initialDepartmentObj.entity_name ?? "",
                                //   entityId: initialDepartmentObj.entity_id ?? "",
                                // });
                              }
                              if (obj.title === "section") {
                                if (!departmentDataArray || departmentDataArray?.length === 0) {
                                  alert("事業部リストがありません。先に「会社・チーム」から事業部を作成してください。");
                                  return;
                                }
                                if (!sectionDataArray || sectionDataArray?.length === 0) {
                                  alert(
                                    "課・セクションリストがありません。先に「会社・チーム」から課・セクションを作成してください。"
                                  );
                                  return;
                                }
                                const departmentId = departmentDataArray ? departmentDataArray[0].id : "";
                                setSelectedDepartment(departmentIdToObjMap?.get(departmentId) ?? null);
                                // departmentIdに一致するセクションのみ絞り込んで選択肢リストを作成
                                // 🔹事業部リスト１番目の事業部に紐づく課・セクションリストの選択肢の１番目をstateにセット
                                const filteredSectionList = sectionDataArray.filter(
                                  (unit) => unit.created_by_department_id === departmentId
                                );
                                // 選択肢を１番目の事業部のidで絞り込み
                                setFilteredSectionBySelectedDepartment(filteredSectionList);
                                if (!filteredSectionList || filteredSectionList?.length === 0) {
                                  alert(
                                    "課・セクションリストがありません。先に「会社・チーム」から課・セクションを作成してください。"
                                  );
                                  setSelectedSection(null);
                                  return;
                                }
                                const firstSectionObj = [...filteredSectionList].sort((a, b) => {
                                  if (a.section_name === null) return 1; // null値をリストの最後に移動
                                  if (b.section_name === null) return -1;
                                  return a.section_name?.localeCompare(b.section_name, language === "ja" ? "ja" : "en");
                                })[0];
                                setSelectedSection(firstSectionObj);
                                setActiveEntityLocal({
                                  entityLevel: obj.title,
                                  entityName: firstSectionObj?.section_name ?? "",
                                  entityId: firstSectionObj?.id ?? "",
                                });
                              }
                              if (obj.title === "unit") {
                                if (!departmentDataArray || departmentDataArray?.length === 0) {
                                  alert("事業部リストがありません。先に「会社・チーム」から事業部を作成してください。");
                                  return;
                                }
                                if (!sectionDataArray || sectionDataArray?.length === 0) {
                                  alert(
                                    "課・セクションリストがありません。先に「会社・チーム」から課・セクションを作成してください。"
                                  );
                                  return;
                                }
                                if (!unitDataArray || unitDataArray?.length === 0) {
                                  alert(
                                    "係・チームリストがありません。先に「会社・チーム」から係・チームを作成してください。"
                                  );
                                  return;
                                }
                                const departmentId = departmentDataArray ? departmentDataArray[0].id : "";
                                setSelectedDepartment(departmentIdToObjMap?.get(departmentId) ?? null);
                                // departmentIdに一致するセクションのみ絞り込んで選択肢リストを作成
                                // 🔹事業部リスト１番目の事業部に紐づく課・セクションリストの選択肢の１番目をstateにセット
                                const filteredSectionList = sectionDataArray.filter(
                                  (unit) => unit.created_by_department_id === departmentId
                                );
                                // 選択肢を１番目の事業部のidで絞り込み
                                setFilteredSectionBySelectedDepartment(filteredSectionList);
                                if (!filteredSectionList || filteredSectionList?.length === 0) {
                                  alert(
                                    "課・セクションリストがありません。先に「会社・チーム」から課・セクションを作成してください。"
                                  );
                                  setSelectedSection(null);
                                  return;
                                }
                                const firstSectionObj = [...filteredSectionList].sort((a, b) => {
                                  if (a.section_name === null) return 1; // null値をリストの最後に移動
                                  if (b.section_name === null) return -1;
                                  return a.section_name?.localeCompare(b.section_name, language === "ja" ? "ja" : "en");
                                })[0];
                                setSelectedSection(firstSectionObj);

                                // 🔹事業部リスト１番目の事業部に紐づく課・セクションリストの選択肢の１番目の課に紐づく係リストの１番目をstateにセット
                                const filteredUnitList = unitDataArray.filter(
                                  (unit) => unit.created_by_section_id === firstSectionObj.id
                                );
                                setFilteredUnitBySelectedSection(filteredUnitList);
                                //
                                if (!filteredUnitList || filteredUnitList?.length === 0) {
                                  alert(
                                    "係・チームリストがありません。先に「会社・チーム」から係・チームを作成してください。"
                                  );
                                  return;
                                }
                                const firstUnitObj = [...filteredUnitList].sort((a, b) => {
                                  if (a.unit_name === null) return 1; // null値をリストの最後に移動
                                  if (b.unit_name === null) return -1;
                                  return a.unit_name?.localeCompare(b.unit_name, language === "ja" ? "ja" : "en");
                                })[0];
                                setSelectedUnit(firstUnitObj);
                                setActiveEntityLocal({
                                  entityLevel: obj.title,
                                  entityName: firstUnitObj?.unit_name ?? "",
                                  entityId: firstUnitObj?.id ?? "",
                                });
                                // setIsOpenConfirmUpsertModal("unit");

                                // const unitId = unitDataArray ? unitDataArray[0].id : "";
                                // setSelectedUnit(unitIdToObjMap?.get(unitId) ?? null);
                              }
                              if (obj.title === "office") {
                                if (!officeDataArray || officeDataArray?.length === 0) {
                                  alert("事業所リストがありません。先に「会社・チーム」から事業所を作成してください。");
                                  return;
                                }
                                const officeId = officeDataArray ? officeDataArray[0].id : "";
                                const newOffice = officeIdToObjMap?.get(officeId);
                                setSelectedOffice(newOffice ?? null);
                                setActiveEntityLocal({
                                  entityLevel: obj.title,
                                  entityName: newOffice?.office_name ?? "",
                                  entityId: newOffice?.id ?? "",
                                });
                              }
                            }
                            // handleClosePopupMenu();
                          }}
                        >
                          <div className="pointer-events-none flex min-w-[110px] items-center">
                            <MdOutlineDataSaverOff
                              className={`${styles.list_icon} mr-[16px] min-h-[20px] min-w-[20px] text-[20px]`}
                            />
                            <div className="flex select-none items-center space-x-[2px]">
                              <span className={`${styles.select_item}`}>{obj.name[language]}</span>
                            </div>
                          </div>
                          {isActive && (
                            <div className={`${styles.icon_container}`}>
                              <BsCheck2 className="pointer-events-none min-h-[22px] min-w-[22px] stroke-1 text-[22px] text-[#00d436]" />
                            </div>
                          )}
                        </li>
                      );
                    })} */}
                    {/* ------------------------------------ */}
                  </ul>
                </div>
                {/* ------------------ 🌟サイドエンティティ詳細メニュー🌟 適用・戻るエリア 全社以外で表示 */}
                {activeEntityLocal && activeEntityLocal.entityLevel !== "company" && openSubMenu && (
                  <div
                    className={`${styles.settings_menu} ${
                      styles.edit_mode
                    } left-[320px] z-[3000] h-auto w-full min-w-[330px] max-w-max overflow-hidden rounded-[6px] ${
                      openSubMenu.display === "fade_up" ? styles.fade_up : `${styles.fade_down}`
                    }`}
                    style={{
                      position: "absolute",
                      ...(openSectionMenu.maxWidth && { maxWidth: `${openSectionMenu.maxWidth}px` }),
                      ...(openSectionMenu.minWidth && { minWidth: `${openSectionMenu.minWidth}px` }),
                      ...(openSubMenu.display === "bottom" && { bottom: "-150px", left: 0 }),
                      ...(openSubMenu.display === "right" && {
                        top: "0px",
                        left: (openSubMenu.sectionMenuWidth ?? 0) + 10,
                      }),
                      animationDelay: `0.2s`,
                      animationDuration: `0.5s`,
                    }}
                  >
                    {/* ------------------------------------ */}
                    <li className={`${styles.section_title} flex min-h-max w-full font-bold`}>
                      <div className="flex max-w-max flex-col">
                        <span>{mappingSectionName[activeEntityLocal.entityLevel][language]}</span>
                        <div className={`${styles.underline} w-full`} />
                      </div>
                    </li>
                    {/* ------------------------------------ */}
                    {/* ------------------------ 事業部 ------------------------ */}
                    {/* {["department", "section", "unit"].includes(activeEntityLocal.entityLevel) && (
                      <li
                        className={`relative flex  w-full items-center justify-between px-[18px] py-[6px] pr-[18px] hover:text-[var(--color-dropdown-list-hover-text)] ${styles.dropdown_list}`}
                      >
                        <div className={`${styles.list_title_wrapper}`}>
                          <div className="flex select-none items-center space-x-[2px]">
                            <span className={`${styles.list_title}`}>事業部</span>
                            <span className={``}>：</span>
                          </div>
                        </div>
                        <div className={`${styles.list_item_content}`}>
                          {(!selectedDepartment || !departmentIdToObjMap) && (
                            <span className={`${styles.empty_text}`}>事業部が見つかりません</span>
                          )}
                          {selectedDepartment && departmentIdToObjMap && (
                            <select
                              className={`h-full ${styles.select_box} truncate`}
                              value={selectedDepartment.id}
                              onChange={(e) => {
                                const departmentId = e.target.value;
                                const newDepartment = departmentIdToObjMap.has(departmentId)
                                  ? departmentIdToObjMap.get(departmentId)
                                  : null;
                                setSelectedDepartment(newDepartment ?? null);
                                // 選択中のレベルが事業部の場合
                                if (activeEntityLocal.entityLevel === "department") {
                                  setActiveEntityLocal({
                                    ...activeEntityLocal,
                                    entityId: departmentId,
                                    entityName: newDepartment?.department_name ?? "",
                                  });
                                }

                                // 選択中のレベルが課 or 係の場合で、かつ、事業部を変更した場合には課と係を初期値にリセット
                                if (["section", "unit"].includes(activeEntityLocal.entityLevel)) {
                                  // セクションエンティティが存在するルート かつ、事業部を変更した場合
                                  if (activeEntityLocal.entityLevel === "section") {
                                    if (!sectionDataArray || sectionDataArray?.length === 0) {
                                      alert(
                                        "課・セクションリストがありません。先に「会社・チーム」から課・セクションを作成してください。"
                                      );
                                      return;
                                    }
                                    // 全ての課から新たに選択した事業部に含まれる課のみの選択肢を生成して、1番目を選択中の課にセット
                                    const sectionEntityGroups = entitiesHierarchyQueryData["section"];
                                    const filteredSectionList = sectionEntityGroups.find(
                                      (section) => section.parent_entity_id === departmentId
                                    );
                                    // const filteredSectionList = sectionDataArray.filter(
                                    //   (unit) => unit.created_by_department_id === departmentId
                                    // );

                                    if (!filteredSectionList)
                                      return alert("課・セクションリストが見つかりませんでした。E001");

                                    const sortedSectionList = [...filteredSectionList.entities].sort((a, b) => {
                                      if (a.entity_name === null) return 1; // null値をリストの最後に移動
                                      if (b.entity_name === null) return -1;
                                      return a.entity_name.localeCompare(
                                        b.entity_name,
                                        language === "ja" ? "ja" : "en"
                                      );
                                    });
                                    // const sortedSectionList = [...filteredSectionList].sort((a, b) => {
                                    //   if (a.section_name === null) return 1; // null値をリストの最後に移動
                                    //   if (b.section_name === null) return -1;
                                    //   return a.section_name.localeCompare(b.section_name, language === "ja" ? "ja" : "en");
                                    // });
                                    setFilteredSectionBySelectedDepartment(sortedSectionList);

                                    const firstSectionObj =
                                      sortedSectionList?.length >= 1 ? sortedSectionList[0] : null;
                                    setSelectedSection(firstSectionObj);
                                    if (activeEntityLocal.entityLevel === "section") {
                                      setActiveEntityLocal({
                                        ...activeEntityLocal,
                                        entityId: firstSectionObj?.id ?? "",
                                        entityName: firstSectionObj?.section_name ?? "",
                                      });
                                    }
                                  }

                                  if (activeEntityLocal.entityLevel === "unit") {
                                    if (!unitDataArray || unitDataArray?.length === 0) {
                                      alert(
                                        "係・チームリストがありません。先に「会社・チーム」から係・チームを作成してください。"
                                      );
                                      return;
                                    }
                                    if (!firstSectionObj) {
                                      setSelectedUnit(null);
                                      return;
                                    }
                                    // 全ての課から新たに選択した事業部に含まれる課のみの選択肢を生成して、1番目を選択中の課にセット
                                    const filteredUnitList = unitDataArray.filter(
                                      (unit) => unit.created_by_section_id === firstSectionObj.id
                                    );

                                    const sortedUnitList = [...filteredUnitList].sort((a, b) => {
                                      if (a.unit_name === null) return 1; // null値をリストの最後に移動
                                      if (b.unit_name === null) return -1;
                                      return a.unit_name.localeCompare(b.unit_name, language === "ja" ? "ja" : "en");
                                    });
                                    setFilteredUnitBySelectedSection(sortedUnitList);

                                    const firstUnitObj = sortedUnitList?.length >= 1 ? sortedUnitList[0] : null;
                                    setSelectedUnit(firstUnitObj);
                                    if (activeEntityLocal.entityLevel === "unit") {
                                      setActiveEntityLocal({
                                        ...activeEntityLocal,
                                        entityId: firstUnitObj?.id ?? "",
                                        entityName: firstUnitObj?.unit_name ?? "",
                                      });
                                    }
                                  }
                                }
                              }}
                            >
                              {!!departmentDataArray?.length &&
                                departmentDataArray.map(
                                  (department, index) =>
                                    !!department &&
                                    department.department_name && (
                                      <option key={department.id} value={department.id}>
                                        {department.department_name}
                                      </option>
                                    )
                                )}
                            </select>
                          )}
                        </div>
                      </li>
                    )} */}
                    {/* ------------------------ 事業部 ------------------------ */}
                    {/* ------------------------ 課・セクション ------------------------ */}
                    {/* {["section", "unit"].includes(activeEntityLocal.entityLevel) && (
                      <li
                        className={`relative flex  w-full items-center justify-between px-[18px] py-[6px] pr-[18px] hover:text-[var(--color-dropdown-list-hover-text)] ${styles.dropdown_list}`}
                      >
                        <div className={`${styles.list_title_wrapper}`}>
                          <div className="flex min-w-max select-none items-center space-x-[2px]">
                            <span className={`${styles.list_title}`}>課・セクション</span>
                            <span className={``}>：</span>
                          </div>
                        </div>
                        <div className={`${styles.list_item_content}`}>
                          {!selectedSection && (
                            <span className={`${styles.empty_text}`}>課・セクションが見つかりません</span>
                          )}
                          {selectedSection && sectionIdToObjMap && (
                            <select
                              className={` ${styles.select_box} truncate`}
                              value={selectedSection.id}
                              onChange={(e) => {
                                const sectionId = e.target.value;
                                const newSection = sectionIdToObjMap.has(sectionId)
                                  ? sectionIdToObjMap.get(sectionId)
                                  : null;
                                setSelectedSection(newSection ?? null);

                                if (activeEntityLocal.entityLevel === "section") {
                                  setActiveEntityLocal({
                                    ...activeEntityLocal,
                                    entityId: sectionId,
                                    entityName: newSection?.section_name ?? "",
                                  });
                                }

                                if (activeEntityLocal.entityLevel === "unit") {
                                  if (!unitDataArray || unitDataArray?.length === 0) {
                                    alert(
                                      "係・チームリストがありません。先に「会社・チーム」から係・チームを作成してください。"
                                    );
                                    return;
                                  }
                                  // 全ての課から新たに選択した事業部に含まれる課のみの選択肢を生成して、1番目を選択中の課にセット
                                  const filteredUnitList = unitDataArray.filter(
                                    (unit) => unit.created_by_section_id === sectionId
                                  );

                                  const sortedUnitList = [...filteredUnitList].sort((a, b) => {
                                    if (a.unit_name === null) return 1; // null値をリストの最後に移動
                                    if (b.unit_name === null) return -1;
                                    return a.unit_name.localeCompare(b.unit_name, language === "ja" ? "ja" : "en");
                                  });
                                  setFilteredUnitBySelectedSection(sortedUnitList);

                                  const firstUnitObj = sortedUnitList?.length >= 1 ? sortedUnitList[0] : null;
                                  setSelectedUnit(firstUnitObj);
                                  if (activeEntityLocal.entityLevel === "unit") {
                                    setActiveEntityLocal({
                                      ...activeEntityLocal,
                                      entityId: firstUnitObj?.id ?? "",
                                      entityName: firstUnitObj?.unit_name ?? "",
                                    });
                                  }
                                }
                              }}
                            >
                              {!!filteredSectionBySelectedDepartment?.length &&
                                filteredSectionBySelectedDepartment.map(
                                  (section, index) =>
                                    !!section &&
                                    section.section_name && (
                                      <option key={section.id} value={section.id}>
                                        {section.section_name}
                                      </option>
                                    )
                                )}
                            </select>
                          )}
                        </div>
                      </li>
                    )} */}
                    {/* ------------------------ 課・セクション ------------------------ */}
                    {/* ------------------------ 係・チーム ------------------------ */}
                    {/* {activeEntityLocal.entityLevel === "unit" && (
                      <li
                        className={`relative flex  w-full items-center justify-between px-[18px] py-[6px] pr-[18px] hover:text-[var(--color-dropdown-list-hover-text)] ${styles.dropdown_list}`}
                      >
                        <div className={`${styles.list_title_wrapper}`}>
                          <div className="flex select-none items-center space-x-[2px]">
                            <span className={`${styles.list_title}`}>係・チーム</span>
                            <span className={``}>：</span>
                          </div>
                        </div>
                        <div className={`${styles.list_item_content}`}>
                          {!selectedUnit && <span className={`${styles.empty_text}`}>係・チームが見つかりません</span>}
                          {selectedUnit && unitIdToObjMap && (
                            <select
                              className={`${styles.select_box} truncate`}
                              value={selectedUnit.id}
                              onChange={(e) => {
                                const unitId = e.target.value;
                                const newUnit = unitIdToObjMap.has(unitId) ? unitIdToObjMap.get(unitId) : null;
                                setSelectedUnit(newUnit ?? null);

                                setActiveEntityLocal({
                                  ...activeEntityLocal,
                                  entityId: unitId,
                                  entityName: newUnit?.unit_name ?? "",
                                });
                              }}
                            >
                              {!!filteredUnitBySelectedSection?.length &&
                                filteredUnitBySelectedSection.map(
                                  (unit, index) =>
                                    !!unit &&
                                    unit.unit_name && (
                                      <option key={unit.id} value={unit.id}>
                                        {unit.unit_name}
                                      </option>
                                    )
                                )}
                            </select>
                          )}
                        </div>
                      </li>
                    )} */}
                    {/* ------------------------ 係・チーム ------------------------ */}
                    {/* ------------------------ 事業所 ------------------------ */}
                    {/* {activeEntityLocal.entityLevel === "office" && (
                      <li
                        className={`relative flex  w-full items-center justify-between px-[18px] py-[6px] pr-[18px] hover:text-[var(--color-dropdown-list-hover-text)] ${styles.dropdown_list}`}
                      >
                        <div className={`${styles.list_title_wrapper}`}>
                          <div className="flex select-none items-center space-x-[2px]">
                            <span className={`${styles.list_title}`}>事業所</span>
                            <span className={``}>：</span>
                          </div>
                        </div>
                        <div className={`${styles.list_item_content}`}>
                          {!selectedOffice && <span className={`${styles.empty_text}`}>事業所が見つかりません</span>}
                          {selectedOffice && officeIdToObjMap && (
                            <select
                              className={` ${styles.select_box} truncate`}
                              value={selectedOffice.id}
                              onChange={(e) => {
                                const officeId = e.target.value;
                                const newOffice = officeIdToObjMap.has(officeId)
                                  ? officeIdToObjMap.get(officeId)
                                  : null;
                                setSelectedOffice(newOffice ?? null);

                                setActiveEntityLocal({
                                  ...activeEntityLocal,
                                  entityId: officeId,
                                  entityName: newOffice?.office_name ?? "",
                                });
                              }}
                            >
                              {!!officeDataArray?.length &&
                                officeDataArray.map(
                                  (office, index) =>
                                    !!office &&
                                    office.office_name && (
                                      <option key={office.id} value={office.id}>
                                        {office.office_name}
                                      </option>
                                    )
                                )}
                            </select>
                          )}
                        </div>
                      </li>
                    )} */}
                    {/* ------------------------ 事業所 ------------------------ */}
                    {/* ------------------------ 「事業部〜係」エンティティ ------------------------ */}
                    {["department", "section", "unit"].includes(activeEntityLocal.entityLevel) && (
                      <li
                        className={`relative flex  w-full items-center justify-between px-[18px] py-[6px] pr-[18px] hover:text-[var(--color-dropdown-list-hover-text)] ${styles.dropdown_list}`}
                      >
                        <div className={`${styles.list_title_wrapper}`}>
                          <div className="flex select-none items-center space-x-[2px]">
                            <span className={`${styles.list_title}`}>
                              {mappingEntityName[activeEntityLocal.entityLevel][language]}
                            </span>
                            <span className={``}>：</span>
                          </div>
                        </div>
                        <div className={`${styles.list_item_content}`}>
                          {activeEntityLocal && entityIdToEntityObjMap ? (
                            <select
                              className={`h-full ${styles.select_box} truncate`}
                              value={activeEntityLocal.entityId}
                              onChange={(e) => {
                                // const selectedChildEntityGroup = parentIdToChildEntityGroupsMap.get(e.target.value);
                                // if (!selectedChildEntityGroup)
                                //   return handleCloseSectionMenu(`selectedChildEntityGroup なし`);
                                // if (!selectedChildEntityGroup.parent_entity_id)
                                //   return handleCloseSectionMenu(`selectedChildEntityGroup.parent_entity_id なし`);

                                const newMainEntity = entityIdToEntityObjMap.get(e.target.value);
                                if (!newMainEntity) return handleCloseSectionMenu(`newMainEntity なし`);
                                setActiveEntityLocal({
                                  ...activeEntityLocal,
                                  entityName: newMainEntity.entity_name,
                                  entityId: newMainEntity.entity_id,
                                });
                              }}
                            >
                              {!!optionsEntities?.length &&
                                optionsEntities.map((entity, index) => (
                                  <option key={entity.entity_id} value={entity.entity_id ?? ""}>
                                    {entity.entity_name}
                                  </option>
                                ))}
                            </select>
                          ) : (
                            <>
                              <span className={`${styles.empty_text}`}>
                                {mappingEntityName[activeEntityLocal.entityLevel][language]}が見つかりません
                              </span>
                            </>
                          )}
                        </div>
                      </li>
                    )}
                    {/* ------------------------ 「事業部〜係」エンティティ ------------------------ */}
                    <hr className="mt-[3px] min-h-[1px] w-full bg-[#999]" />
                    {/* ------------------------------------ */}
                    <li className={`${styles.list} ${styles.btn_area} space-x-[20px]`}>
                      <div
                        className={`transition-bg02 ${styles.edit_btn} ${styles.brand} ${styles.active}`}
                        // onClick={() => {
                        //   if (!activeEntityLocal) return;
                        //   if (!activeEntityLocal.entityName) return;
                        //   if (!activeEntityLocal.entityId) return;
                        //   if (openSectionMenu.title === "entity") {
                        //     // 選択、確定するエンティティの子の配列をフィルター
                        //     if (activeEntityLocal.entityLevel === "department") {
                        //       const departmentId = activeEntityLocal.entityId;
                        //       if (sectionDataArray && sectionDataArray.length > 0) {
                        //         const filteredSectionList = sectionDataArray.filter(
                        //           (section) => section.created_by_department_id === departmentId
                        //         );
                        //         // 選択肢を１番目の事業部のidで絞り込み
                        //         setFilteredSectionBySelectedDepartment(filteredSectionList);
                        //       }
                        //     }
                        //     if (activeEntityLocal.entityLevel === "section") {
                        //       const sectionId = activeEntityLocal.entityId;
                        //       if (unitDataArray && unitDataArray.length > 0) {
                        //         const filteredUnitList = unitDataArray.filter(
                        //           (unit) => unit.created_by_section_id === sectionId
                        //         );
                        //         // 選択肢を１番目の事業部のidで絞り込み
                        //         setFilteredUnitBySelectedSection(filteredUnitList);
                        //       }
                        //     }
                        //     // 係・チームを選択した場合はメンバーリストをuseQueryで取得する
                        //     if (activeEntityLocal.entityLevel === "unit") {
                        //     }
                        //     // 事業所を選択した場合はメンバーリストをuseQueryで取得する
                        //     if (activeEntityLocal.entityLevel === "office") {
                        //     }
                        //   }

                        //   // setActiveDisplayTabs({
                        //   //   ...activeDisplayTabs,
                        //   //   entity: activeEntityLocal.entityLevel,
                        //   //   entityName: activeEntityLocal.entityName || null,
                        //   //   entityId: activeEntityLocal.entityId || null,
                        //   // });
                        //   // setMainEntityTarget({
                        //   //   entityLevel: activeEntityLocal.entityLevel,
                        //   //   entityName: activeEntityLocal.entityName,
                        //   //   entityId: activeEntityLocal.entityId,
                        //   // });
                        //   // setMainEntityTarget({
                        //   //   entityLevel: activeEntityLocal.entityLevel,
                        //   //   entityName: activeEntityLocal.entityName,
                        //   //   entityId: activeEntityLocal.entityId,
                        //   // });
                        //   setOpenSectionMenu(null);
                        // }}
                        onClick={() => {
                          if (openSectionMenu.title === "entity") {
                            if (!entityLevelsQueryData) return;
                            if (!entityLevelToChildLevelMap) return;
                            if (!entitiesHierarchyMap) return;
                            if (!activeEntityLocal) return;
                            if (!activeEntityLocal.entityName) return;
                            if (!activeEntityLocal.entityId) return;
                            if (!entityIdToEntityObjMap) return;

                            if (!entitiesHierarchyQueryData) return;
                            if (!optionsEntities.length) return;
                            if (!entityLevelToChildLevelMap) return;
                            if (!activeEntityLocal) return;

                            const childLevelName = entityLevelToChildLevelMap.get(activeEntityLocal.entityLevel);
                            if (!childLevelName) return handleCloseSectionMenu(`childLevelName なし`);

                            if (!(childLevelName in entitiesHierarchyQueryData)) return;

                            const childEntityGroupsByParent = entitiesHierarchyQueryData[childLevelName];

                            if (!childEntityGroupsByParent.length)
                              return handleCloseSectionMenu(`childEntityGroupsByParent なし`);
                            if (childEntityGroupsByParent.some((group) => group.parent_entity_id === null))
                              return handleCloseSectionMenu(`group なし`);

                            const parentIdToChildEntityGroupsMap = new Map(
                              childEntityGroupsByParent.map((group) => [group.parent_entity_id!, group])
                            );

                            if (!parentIdToChildEntityGroupsMap)
                              return handleCloseSectionMenu(`parentIdToChildEntityGroupsMap なし`);

                            const childEntitiesByMainEntity = parentIdToChildEntityGroupsMap.get(
                              activeEntityLocal.entityId
                            );

                            if (!childEntitiesByMainEntity)
                              return handleCloseSectionMenu(`childEntitiesByMainEntity なし`);
                            if (!childEntitiesByMainEntity.entities.length)
                              return handleCloseSectionMenu(`childEntitiesByMainEntity.entities.length なし`);

                            const newMainEntityObj = entityIdToEntityObjMap.get(activeEntityLocal.entityId);

                            if (!newMainEntityObj) return handleCloseSectionMenu(`newMainEntityObj なし`);

                            const newMainEntityTarget = {
                              ...mainEntityTarget,
                              entityLevel: childEntitiesByMainEntity.entities[0].entity_level,
                              entities: childEntitiesByMainEntity.entities,
                              parentEntityLevel: activeEntityLocal.entityLevel,
                              parentEntityLevelId: newMainEntityObj.entity_level_id,
                              parentEntityId: activeEntityLocal.entityId,
                              parentEntityName: activeEntityLocal.entityName,
                            } as MainEntityTarget;

                            setMainEntityTarget(newMainEntityTarget);

                            if (onResetFetchComplete) onResetFetchComplete();
                          }
                          // setOpenSectionMenu(null);
                          handleCloseSectionMenu();
                        }}
                      >
                        <span>適用</span>
                      </div>
                      <div
                        className={`transition-bg02 ${styles.edit_btn} ${styles.cancel}`}
                        onClick={() => {
                          handleCloseSectionMenu();
                        }}
                      >
                        <span>戻る</span>
                      </div>
                    </li>
                    {/* ------------------------------------ */}
                  </div>
                )}
                {/* 右サイドエンティティ詳細メニュー 適用・戻るエリア */}
              </>
            )}
          {/* ------------------------ エンティティ選択メニュー ------------------------ */}
        </div>
      )}
    </>
  );
};

export const SalesTargetGridTable = memo(SalesTargetGridTableMemo);
