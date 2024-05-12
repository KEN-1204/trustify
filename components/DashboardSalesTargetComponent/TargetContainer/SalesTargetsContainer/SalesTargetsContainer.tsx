import { ErrorFallback } from "@/components/ErrorFallback/ErrorFallback";
import { SpinnerX } from "@/components/Parts/SpinnerX/SpinnerX";
import { ChangeEvent, Suspense, memo, useEffect, useMemo, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import styles from "./SalesTargetsContainer.module.css";
import { SalesTargetGridTable } from "./SalesTargetGridTable/SalesTargetGridTable";
import { FallbackScrollContainer } from "./SalesTargetGridTable/FallbackScrollContainer";
import {
  Department,
  EntitiesHierarchy,
  Entity,
  EntityLevelNames,
  EntityLevels,
  EntityObjForChart,
  FiscalYearAllKeys,
  FiscalYearMonthKey,
  FiscalYears,
  MainEntityTarget,
  Office,
  Section,
  Unit,
} from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { mappingSectionName } from "@/utils/selectOptions";
import useDashboardStore from "@/store/useDashboardStore";
import useStore from "@/store";
import { useQueryFiscalYear } from "@/hooks/useQueryFiscalYear";
import { useQueryEntityLevels } from "@/hooks/useQueryEntityLevels";
import { useQueryEntities } from "@/hooks/useQueryEntities";
import { SalesTargetGridTableSub } from "./SalesTargetGridTable/SalesTargetGridTableSub";
import { HiOutlineSelector } from "react-icons/hi";
import { AreaChartTrend } from "../UpsertTargetEntity/UpsertSettingTargetEntityGroup/AreaChartTrend/AreaChartTrend";
import { DonutChartTargetShares } from "./DonutChartShares/DonutChartTargetShares";
import { AreaChartTrendWithTarget } from "./AreaChartTrendWithTarget/AreaChartTrendWithTarget";
import { mappingEntityName } from "@/utils/mappings";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { IoChevronDownOutline } from "react-icons/io5";

const SalesTargetsContainerMemo = () => {
  const language = useStore((state) => state.language);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const queryClient = useQueryClient();

  // 選択中の会計年度
  const selectedFiscalYearTarget = useDashboardStore((state) => state.selectedFiscalYearTarget);
  // 🔹目標テーブルに表示する上位エンティティグループ
  const mainEntityTarget = useDashboardStore((state) => state.mainEntityTarget);
  const setMainEntityTarget = useDashboardStore((state) => state.setMainEntityTarget);

  if (!userProfileState?.company_id) return null;
  if (!selectedFiscalYearTarget) return null;

  // 🌟総合目標の目標と前年度売上を取得Zustand🌟
  const mainTotalTargets = useDashboardStore((state) => state.mainTotalTargets);
  // 表示期間(年度全て・上期詳細・下期詳細)
  const displayTargetPeriodType = useDashboardStore((state) => state.displayTargetPeriodType);
  const setDisplayTargetPeriodType = useDashboardStore((state) => state.setDisplayTargetPeriodType);

  // 🔹売上目標フェッチ時の年月度の12ヶ月分の配列
  const annualFiscalMonths = useDashboardStore((state) => state.annualFiscalMonths);

  // 12ヶ月分の「202404」の年月度を「4月度」の値に変更した選択肢を作成
  const formattedAnnualFiscalMonths = useMemo(() => {
    if (!annualFiscalMonths) return null;
    let formattedMonths: { [K in FiscalYearMonthKey]: { [key: string]: string } } = {} as {
      [K in FiscalYearMonthKey]: { [key: string]: string };
    };
    Object.entries(annualFiscalMonths).forEach(([key, value], index) => {
      // 年月度から月度の部分だけを取り出す (文字列の下2桁を取得)
      const monthStr = String(value).slice(-2);
      // 月度が '08' のようになっている場合、先頭の '0' を削除して数値に変換
      const month = parseInt(monthStr, 10);
      // 年は任意で、月だけを指定して日付オブジェクトを生成
      const monthDate = new Date(2000, month - 1);
      // `${value.toString().substring(4)}月度`
      // 日本語と英語で月度を表記
      formattedMonths[key as FiscalYearMonthKey] = {
        ja: `${month}月度`,
        en: format(monthDate, "MMM", { locale: enUS }), // Jan, Feb, ... Dec
      };
    });
    return formattedMonths;
    // String(): null や undefined を引数に渡した場合、それぞれ "null" と "undefined" の文字列を返します。
    // toString(): null.toString() や undefined.toString() はエラーを引き起こします。
  }, [annualFiscalMonths]);

  // -------------------------- state関連 --------------------------
  // stickyを付与するrow
  const [stickyRow, setStickyRow] = useState<string | null>(null);

  // 売上推移を表示する対象の切り替え用state 総合目標かサブ目標
  const [displayTypeForTrend, setDisplayTypeForTrend] = useState<"sub_entities" | "main_entity">("sub_entities");

  // // ========================= 🌟事業部・課・係・事業所リスト取得useQuery キャッシュ🌟 =========================
  // const departmentDataArray: Department[] | undefined = queryClient.getQueryData(["departments"]);
  // const sectionDataArray: Section[] | undefined = queryClient.getQueryData(["sections"]);
  // const unitDataArray: Unit[] | undefined = queryClient.getQueryData(["units"]);
  // const officeDataArray: Office[] | undefined = queryClient.getQueryData(["offices"]);
  // // ========================= 🌟事業部・課・係・事業所リスト取得useQuery キャッシュ🌟 =========================

  // ================================ 🌟設定済み年度useQuery🌟 ================================
  // const fiscalYearsQueryData = queryClient.getQueriesData(["fiscal_years", "sales_target"]);
  const {
    data: fiscalYearQueryData,
    isLoading: isLoadingQueryFiscalYear,
    isError: isErrorQueryFiscalYear,
    isSuccess: isSuccessQueryFiscalYear,
  } = useQueryFiscalYear(
    userProfileState?.company_id,
    "sales_target",
    selectedFiscalYearTarget,
    !!selectedFiscalYearTarget
  );
  // ================================ 🌟設定済み年度useQuery🌟 ================================

  // ===================== 🌠エンティティレベルuseQuery🌠 =====================
  const {
    data: entityLevelsQueryData,
    isLoading: isLoadingQueryLevel,
    isError: isErrorQueryLevel,
    isSuccess: isSuccessQueryLevel,
  } = useQueryEntityLevels(
    userProfileState.company_id,
    selectedFiscalYearTarget,
    "sales_target",
    isSuccessQueryFiscalYear
  );

  // レベルMapオブジェクト key: レベル名, value: レベルオブジェクト
  const entityLevelMap = useMemo(() => {
    if (!entityLevelsQueryData) return null;
    return new Map(entityLevelsQueryData.map((levelObj) => [levelObj.entity_level as EntityLevelNames, levelObj]));
  }, [entityLevelsQueryData]);
  // ===================== 🌠エンティティレベルuseQuery🌠 =====================

  // ===================== 🌠エンティティuseQuery🌠 =====================
  // エンティティレベルのidのみで配列を作成(エンティティuseQuery用)
  const entityLevelIds = useMemo(() => {
    if (!entityLevelsQueryData) return [];
    return entityLevelsQueryData.map((obj) => obj.id);
  }, [entityLevelsQueryData]);

  // 現在追加済みの全てのレベルidに紐づくそれぞれのエンティティ
  const {
    data: entitiesHierarchyQueryData,
    isLoading: isLoadingQueryEntities,
    isError: isErrorQueryEntities,
  } = useQueryEntities(
    userProfileState.company_id,
    selectedFiscalYearTarget,
    "sales_target",
    entityLevelIds,
    isSuccessQueryLevel
  );

  // key: エンティティレベル名, value: 上位エンティティグループ
  const entitiesHierarchyMap = useMemo(() => {
    if (!entitiesHierarchyQueryData) return null;
    return new Map(Object.entries(entitiesHierarchyQueryData).map(([key, value], index) => [key, value]));
  }, [entitiesHierarchyQueryData]);

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
  // ===================== 🌠エンティティuseQuery🌠 =====================

  // -------------------------- 親エンティティのEntityオブジェクト --------------------------
  const [parentEntityObj, setParentEntityObj] = useState<Entity | null>(null);

  const parentAllEntityGroupMap = useMemo(() => {
    if (!mainEntityTarget) return null;
    if (!entitiesHierarchyQueryData) return null;
    const parentEntityGroups = entitiesHierarchyQueryData[mainEntityTarget.parentEntityLevel];
    const parentAllEntityGroup = parentEntityGroups.map((group) => group.entities).flatMap((entities) => entities);
    const _parentAllEntityGroupMap = new Map(parentAllEntityGroup.map((entities) => [entities.entity_id, entities]));
    return _parentAllEntityGroupMap;
  }, [entitiesHierarchyQueryData, mainEntityTarget?.parentEntityLevel]);

  useEffect(() => {
    if (!mainEntityTarget) return;
    if (!mainEntityTarget?.parentEntityId) return;
    if (!parentAllEntityGroupMap) return;

    const newParentEntityObj = parentAllEntityGroupMap.get(mainEntityTarget.parentEntityId);
    setParentEntityObj(newParentEntityObj ?? null);
  }, [mainEntityTarget?.parentEntityId]);
  // -------------------------- 親エンティティのEntityオブジェクト --------------------------

  // -------------------------- Zustand上位エンティティグループをセット --------------------------
  useEffect(() => {
    // if (mainEntityTarget !== null) return;
    if (!userProfileState) return;
    if (!userProfileState.company_id) return;
    if (!userProfileState.customer_name) return;

    // fiscal_yearsのis_confirmed_xxx_half_detailsのどちらかが完了していればcompany-xxxを表示
    // 次をelse ifにせず ifにすることで、childLevelが存在しなかった場合はroot-companyをセットする
    if (
      fiscalYearQueryData &&
      (fiscalYearQueryData.is_confirmed_first_half_details || fiscalYearQueryData.is_confirmed_second_half_details) &&
      entitiesHierarchyQueryData &&
      entityLevelToChildLevelMap &&
      entitiesHierarchyMap &&
      "company" in entitiesHierarchyQueryData &&
      entitiesHierarchyQueryData["company"].length > 0 &&
      !!entitiesHierarchyQueryData["company"][0].entities.length
    ) {
      const companyLevelObj = entitiesHierarchyQueryData["company"][0];
      const companyEntityId = companyLevelObj.entities[0].entity_id;
      // 全社エンティティidに紐づく子エンティティグループ
      const childLevel = entityLevelToChildLevelMap.get("company");

      if (childLevel) {
        const childEntityGroups = entitiesHierarchyMap.get(childLevel);

        if (childEntityGroups) {
          // 会社エンティティidに紐づくエンティティグループ
          const childEntityGroup = childEntityGroups.find((group) => group.parent_entity_id === companyEntityId);

          if (childEntityGroup && childEntityGroup?.entities?.length > 0) {
            const newMainEntityTarget = {
              periodType: "year_half", // 初回は年度(全て)をセット
              entityLevel: childEntityGroup.entities[0].entity_level,
              entities: childEntityGroup.entities,
              parentEntityLevelId: childEntityGroup.entities[0].parent_entity_level_id,
              parentEntityLevel: "company",
              parentEntityId: childEntityGroup.parent_entity_id,
              parentEntityName: childEntityGroup.parent_entity_name,
            } as MainEntityTarget;

            setMainEntityTarget(newMainEntityTarget);

            // 子エンティティのレベルがメンバーレベルだった場合には「上期か下期」の設定済みの方に変更する
            if (childEntityGroup.entities[0].entity_level === "member") {
              if (
                fiscalYearQueryData.is_confirmed_first_half_details &&
                fiscalYearQueryData.is_confirmed_second_half_details
              ) {
                if (displayTargetPeriodType !== "fiscal_year") setDisplayTargetPeriodType("fiscal_year");
              } else if (
                fiscalYearQueryData.is_confirmed_first_half_details &&
                !fiscalYearQueryData.is_confirmed_second_half_details
              ) {
                setDisplayTargetPeriodType("first_half");
              } else if (
                !fiscalYearQueryData.is_confirmed_first_half_details &&
                fiscalYearQueryData.is_confirmed_second_half_details
              ) {
                setDisplayTargetPeriodType("second_half");
              }
            }
            return;
          }
        }
      }
    }

    // fiscal_yearsのis_confirmed_xxx_half_detailsのどちらも未完了で、
    // かつ、companyレベルは存在していれば初期値はroot-companyのエンティティグループをセット
    if (
      entitiesHierarchyQueryData &&
      "company" in entitiesHierarchyQueryData &&
      entitiesHierarchyQueryData["company"].length > 0 &&
      !!entitiesHierarchyQueryData["company"][0].entities.length
    ) {
      const companyLevelObj = entitiesHierarchyQueryData["company"][0];
      const newMainEntityTarget = {
        periodType: "year_half", // 初回は年度(全て)をセット
        entityLevel: companyLevelObj.entities[0].entity_level,
        entities: companyLevelObj.entities,
        parentEntityLevelId: companyLevelObj.entities[0].parent_entity_level_id,
        parentEntityLevel: companyLevelObj.entities[0].parent_entity_level ?? "company",
        parentEntityId: companyLevelObj.parent_entity_id,
        parentEntityName: companyLevelObj.parent_entity_name,
      } as MainEntityTarget;

      setMainEntityTarget(newMainEntityTarget);

      setDisplayTypeForTrend("main_entity");
    }
    // まだエンティティが設定されていない場合は、ユーザーの会社データからセット
    else {
      const initialEntity = {
        id: "",
        created_at: "",
        updated_at: "",
        fiscal_year_id: "",
        entity_level_id: "",
        parent_entity_level_id: "",
        target_type: "sales_target",
        entity_id: userProfileState.company_id,
        parent_entity_id: "",
        is_confirmed_annual_half: false,
        is_confirmed_first_half_details: false,
        is_confirmed_second_half_details: false,
        entity_name: userProfileState.customer_name,
        parent_entity_name: "root",
        fiscal_year: selectedFiscalYearTarget,
        entity_level: "company",
        parent_entity_level: "company",
      } as Entity;
      const newMainEntityTarget = {
        periodType: "year_half", // 初回は年度(全て)をセット
        entityLevel: "company",
        entities: [initialEntity],
        parentEntityLevelId: "",
        parentEntityLevel: "company",
        parentEntityId: "",
        parentEntityName: "company",
      } as MainEntityTarget;
      setMainEntityTarget(newMainEntityTarget);

      setDisplayTypeForTrend("main_entity");
    }
  }, []);
  // -------------------------- Zustand上位エンティティグループをセット ここまで --------------------------

  // ========================= 🌟目標年度・レベル・エンティティuseQuery キャッシュ🌟 =========================
  // const fiscalYearQueryData: FiscalYears | undefined = queryClient.getQueryData([
  //   "fiscal_year",
  //   "sales_target",
  //   selectedFiscalYearTarget,
  // ]);
  // const entityLevelsQueryData: EntityLevels[] | undefined = queryClient.getQueryData([
  //   "entity_levels",
  //   "sales_target",
  //   selectedFiscalYearTarget,
  // ]);
  // const entityLevelIdsStr = useMemo(() => {
  //   if (!entityLevelsQueryData) return [];
  //   const entityLevelIds = entityLevelsQueryData.map((obj) => obj.id);
  //   return entityLevelIds?.length > 0 ? entityLevelIds.join(", ") : "";
  // }, [entityLevelsQueryData]);
  // const entitiesHierarchyQueryData: EntitiesHierarchy | undefined = queryClient.getQueryData([
  //   "entities",
  //   "sales_target",
  //   selectedFiscalYearTarget,
  //   entityLevelIdsStr,
  // ]);
  // ========================= 🌟目標年度・レベル・エンティティuseQuery キャッシュ🌟 =========================

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

  // -------------------------- 売上推移 部門別 --------------------------

  // 🌟目標設定対象のエンティティ配列からエンティティidのみ取り出しSetオブジェクトに変換
  const targetEntityIdsSet = useMemo(
    () =>
      !!mainEntityTarget?.entities?.length ? new Set(mainEntityTarget?.entities.map((obj) => obj.entity_id)) : null,
    [mainEntityTarget?.entities]
  );
  // Mapオブジェクト エンティティid => エンティティオブジェクト
  const targetEntityIdToObjMap = useMemo(
    () =>
      !!mainEntityTarget?.entities?.length
        ? new Map(mainEntityTarget.entities.map((obj) => [obj.entity_id, obj]))
        : null,
    [mainEntityTarget?.entities]
  );

  // 🌟売上推移で表示するperiodType テーブルの年度・上期・下期の表示期間のdisplayTargetPeriodTypeとは切り離して期間タイプ全てで管理する
  // 遡る年数
  const [yearsBack, setYearsBack] = useState(2);
  // デフォルト：(期間タイプ: fiscal_year, half_year, quarter, year_month),
  // エリアチャートに渡す期間タイプ (半期、四半期、月次) propertiesテーブルから取得のため期間タイプはhalf_year, quarterのように詳細を絞らず指定
  // const [periodTypeTrend, setPeriodTypeTrend] = useState<
  //   ("fiscal_year" | "half_year" | "quarter" | "year_month") | null
  // >(null);

  // 🔹両チャートの期間を切り替えるための選択中の期間 セレクトボックスで使用 全ての期間 エリア・ドーナツ両チャートのperiodと連動
  const [selectedPeriodForChart, setSelectedPeriodForChart] = useState<FiscalYearAllKeys | null>(null);

  // 🔹エリアチャートに渡す期間
  const [selectedPeriodDetailTrend, setSelectedPeriodDetailTrend] = useState<{
    period: "fiscal_year" | "half_year" | "quarter" | "year_month";
    value: number;
  } | null>(null);
  // 🔹ドーナツチャートに渡す期間
  const [selectedPeriodDetailShare, setSelectedPeriodDetailShare] = useState<{
    // period: string;
    period: FiscalYearAllKeys;
    value: number;
  } | null>(null);

  // ドーナツチャート用のentities
  const entitiesForShareChart: EntityObjForChart[] | null = useMemo(() => {
    if (!mainEntityTarget?.entities) return null;
    return mainEntityTarget.entities.map((entity) => ({
      entity_name: entity.entity_name,
      entity_id: entity.entity_id,
      entity_structure_id: entity.id,
    }));
  }, [mainEntityTarget?.entities]);

  // ドーナツチャート用 選択中の表示期間タイプ別 総合売上目標金額(parentEntityTotalMainTarget)
  const parentEntityTotalMainTarget = useMemo(() => {
    if (!mainTotalTargets) return null;
    if (!selectedPeriodDetailShare) return null;
    return mainTotalTargets.sales_targets[selectedPeriodDetailShare.period];
  }, [mainTotalTargets, selectedPeriodDetailShare?.period]);

  const getInitialPeriodForChart = (): FiscalYearAllKeys | null => {
    // fiscal_yearsテーブル is_confirmed_xxx_half_detailsカラムがtrueの期間を初期表示期間にセット
    // メンバーレベルの設定と集約まで完了している場合のみチャートを表示可能にする
    if (!fiscalYearQueryData) return null;
    if (!mainEntityTarget) return null;
    if (!fiscalYearQueryData.is_confirmed_first_half_details && !fiscalYearQueryData.is_confirmed_second_half_details)
      return null;
    // 上期詳細と下期詳細がどちらもtrueなら年度を初期表示
    if (fiscalYearQueryData.is_confirmed_first_half_details && fiscalYearQueryData.is_confirmed_second_half_details) {
      return "fiscal_year";
    }
    // 上期詳細のみtrueなら上期を初期表示
    if (fiscalYearQueryData.is_confirmed_first_half_details) return "first_half";
    // 下期詳細のみtrueなら下期を初期表示
    if (fiscalYearQueryData.is_confirmed_second_half_details) return "second_half";
    return null;
  };

  // 売上推移は過去3年分の売上実績をpropertiesテーブルから取得するため、periodTypeは年度、半期、四半期、月次のみで区別する(全て "xxx_fiscal_year" | "xxx_half_year" | "xxx_quarter" | "xxx_year_month"で管理しているため)
  const getInitialTrend = (): {
    period: "fiscal_year" | "half_year" | "quarter" | "year_month";
    value: number;
  } | null => {
    if (!mainEntityTarget) return null;
    if (!fiscalYearQueryData) return null;
    if (!fiscalYearQueryData.is_confirmed_first_half_details && !fiscalYearQueryData.is_confirmed_second_half_details)
      return null;

    // 上期詳細と下期詳細がどちらもtrueなら年度を初期表示
    if (fiscalYearQueryData.is_confirmed_first_half_details && fiscalYearQueryData.is_confirmed_second_half_details) {
      return {
        period: "fiscal_year",
        value: selectedFiscalYearTarget - 1,
      };
    }
    // 上期詳細のみtrueなら上期を初期表示(メンバー) メンバーレベル以外は年度を表示
    else if (fiscalYearQueryData.is_confirmed_first_half_details) {
      if (mainEntityTarget.entityLevel !== "member") {
        return {
          period: "fiscal_year",
          value: selectedFiscalYearTarget - 1,
        };
      } else {
        return {
          period: "half_year", // propertiesテーブルから取得のため上期・下期の詳細は分けずにセット
          value: (selectedFiscalYearTarget - 1) * 10 + 1,
        }; // 1が上期、2が下期
      }
    }
    // 下期詳細のみtrueなら下期を初期表示(メンバー) メンバーレベル以外は年度を表示
    else if (fiscalYearQueryData.is_confirmed_second_half_details) {
      if (mainEntityTarget.entityLevel !== "member") {
        return {
          period: "fiscal_year",
          value: selectedFiscalYearTarget - 1,
        };
      } else {
        return {
          period: "half_year", // propertiesテーブルから取得のため上期・下期の詳細は分けずにセット
          value: (selectedFiscalYearTarget - 1) * 10 + 2,
        }; // 1が上期、2が下期
      }
    }
    return null;
  };

  const getInitialShare = (): { period: FiscalYearAllKeys; value: number } | null => {
    if (!mainEntityTarget) return null;
    if (!fiscalYearQueryData) return null;
    if (!fiscalYearQueryData.is_confirmed_first_half_details && !fiscalYearQueryData.is_confirmed_second_half_details)
      return null;

    // 上期詳細と下期詳細がどちらもtrueなら年度を初期表示
    if (fiscalYearQueryData.is_confirmed_first_half_details && fiscalYearQueryData.is_confirmed_second_half_details) {
      return {
        period: "fiscal_year",
        value: selectedFiscalYearTarget,
      };
    }
    // 上期詳細のみtrueなら上期を初期表示
    else if (fiscalYearQueryData.is_confirmed_first_half_details) {
      if (mainEntityTarget.entityLevel !== "member") {
        return {
          period: "fiscal_year",
          value: selectedFiscalYearTarget,
        };
      } else {
        return {
          period: "first_half", // sales_targetsテーブルから取得のため上期・下期の詳細を分けてセット
          value: selectedFiscalYearTarget * 10 + 1,
        }; // 1が上期、2が下期
      }
    }
    // 下期詳細のみtrueなら下期を初期表示
    else if (fiscalYearQueryData.is_confirmed_second_half_details) {
      if (mainEntityTarget.entityLevel !== "member") {
        return {
          period: "fiscal_year",
          value: selectedFiscalYearTarget,
        };
      } else {
        return {
          period: "second_half", // sales_targetsテーブルから取得のため上期・下期の詳細を分けてセット
          value: selectedFiscalYearTarget * 10 + 2,
        }; // 1が上期、2が下期
      }
    }
    return null;
  };

  useEffect(() => {
    if (!mainEntityTarget) return;
    if (!!selectedPeriodForChart && !!selectedPeriodDetailTrend && !!selectedPeriodDetailShare) return;
    // 初期値セット
    // 売上推移 両チャートの表示切り替え セレクトボックスで使用
    setSelectedPeriodForChart(getInitialPeriodForChart());
    // 売上推移 選択中
    setSelectedPeriodDetailTrend(getInitialTrend());
    // 売上目標シェア 選択中
    setSelectedPeriodDetailShare(getInitialShare());
  }, [mainEntityTarget]);

  // 🔹売上推移の「2021H1 ~ 2023H1」表示用
  const trendPeriodTitle = useMemo(() => {
    if (!selectedPeriodDetailTrend) return null;

    if (selectedPeriodDetailTrend.period === "fiscal_year") {
      return {
        periodStart: `${selectedPeriodDetailTrend.value - yearsBack}年度`,
        periodEnd: `${selectedPeriodDetailTrend.value}年度`,
      };
    } else {
      const year = Number(selectedPeriodDetailTrend.value.toString().substring(0, 4));
      const period = selectedPeriodDetailTrend.value.toString().substring(4);
      // 04 => 4, 1 => 1
      let periodWithoutZero = period;
      if (selectedPeriodDetailTrend.period === "year_month") {
        periodWithoutZero = String(parseInt(period, 10));
      }
      const back = yearsBack;
      return {
        periodStart:
          selectedPeriodDetailTrend.period === "half_year"
            ? `${year - back}H${period}`
            : selectedPeriodDetailTrend.period === "quarter"
            ? `${year - back}Q${period}`
            : selectedPeriodDetailTrend.period === "year_month"
            ? `${year - back}年${periodWithoutZero}月度`
            : `${selectedPeriodDetailTrend.value - yearsBack}年度`,
        periodEnd:
          selectedPeriodDetailTrend.period === "half_year"
            ? `${year}H${period}`
            : selectedPeriodDetailTrend.period === "quarter"
            ? `${year}Q${period}`
            : selectedPeriodDetailTrend.period === "year_month"
            ? `${year}年${periodWithoutZero}月度`
            : `${selectedPeriodDetailTrend.value}年度`,
      };
    }
  }, [selectedPeriodDetailTrend, yearsBack]);

  // 売上推移に売上目標を追加した場合の期間タイトル置き換え用
  const [periodEndTrend, setPeriodEndTrend] = useState<string | null>(null);

  // 案件状況の「2021H1」表示用
  // const salesProbabilityPeriodTitle = useMemo(() => {
  //   if (!selectedPeriodDetailProbability) return null;
  //   if (periodTypeTrend === "fiscal_year") {
  //     return `${selectedPeriodDetailProbability.value}年度`;
  //   } else {
  //     const year = Number(selectedPeriodDetailProbability.value.toString().substring(0, 4));
  //     const period = selectedPeriodDetailProbability.value.toString().substring(4);
  //     return periodTypeTrend === "half_year"
  //       ? `${year}H${period}`
  //       : periodTypeTrend === "quarter"
  //       ? `${year}Q${period}`
  //       : periodTypeTrend === "year_month"
  //       ? `${year}年${period}月度`
  //       : `${selectedPeriodDetailProbability.value}年度`;
  //   }
  // }, [selectedPeriodDetailProbability]);

  // -------------------------- 売上推移 部門別 ここまで --------------------------

  // -------------------------- 売上目標シェア --------------------------

  // 売上目標シェアの「2021H1」表示用
  const salesTargetSharePeriodTitle = useMemo(() => {
    if (!selectedPeriodDetailShare) return null;

    if (selectedPeriodDetailShare.period === "fiscal_year") {
      return `${selectedPeriodDetailShare.value}年度`;
    } else {
      const year = Number(selectedPeriodDetailShare.value.toString().substring(0, 4));
      const period = selectedPeriodDetailShare.value.toString().substring(4);
      return ["first_half", "second_half"].includes(selectedPeriodDetailShare.period)
        ? `${year}H${period}`
        : ["first_quarter", "second_quarter", "third_quarter", "fourth_quarter"].includes(
            selectedPeriodDetailShare.period
          )
        ? `${year}Q${period}`
        : [
            "month_01",
            "month_02",
            "month_03",
            "month_04",
            "month_05",
            "month_06",
            "month_07",
            "month_08",
            "month_09",
            "month_10",
            "month_11",
            "month_12",
          ].includes(selectedPeriodDetailShare.period)
        ? `${year}年${period}月度`
        : `${selectedPeriodDetailShare.value}年度`;
    }
  }, [selectedPeriodDetailShare]);

  const handleChangePeriodChart = (e: ChangeEvent<HTMLSelectElement>) => {
    // 最新期間を一旦nullに 2021年4月度 ~ 2024H1 のように別々の期間が表示されるのを防ぐため
    if (periodEndTrend) setPeriodEndTrend(null);

    const periodDetail = e.target.value as FiscalYearAllKeys;
    let periodForTrend: "fiscal_year" | "half_year" | "quarter" | "year_month" = "fiscal_year";
    let currPeriodValue = selectedFiscalYearTarget; // 今年度
    let periodValue = selectedFiscalYearTarget - 1; // 前年度
    if (periodDetail === "first_half") {
      periodForTrend = "half_year";
      currPeriodValue = selectedFiscalYearTarget * 10 + 1; // 上期
      periodValue = (selectedFiscalYearTarget - 1) * 10 + 1; // 上期
    }
    if (periodDetail === "second_half") {
      periodForTrend = "half_year";
      currPeriodValue = selectedFiscalYearTarget * 10 + 2; // 下期
      periodValue = (selectedFiscalYearTarget - 1) * 10 + 2; // 下期
    }
    if (periodDetail === "first_quarter") {
      periodForTrend = "quarter";
      currPeriodValue = selectedFiscalYearTarget * 10 + 1; // Q1
      periodValue = (selectedFiscalYearTarget - 1) * 10 + 1; // Q1
    }
    if (periodDetail === "second_quarter") {
      periodForTrend = "quarter";
      currPeriodValue = selectedFiscalYearTarget * 10 + 2; // Q2
      periodValue = (selectedFiscalYearTarget - 1) * 10 + 2; // Q2
    }
    if (periodDetail === "third_quarter") {
      periodForTrend = "quarter";
      currPeriodValue = selectedFiscalYearTarget * 10 + 3; // Q3
      periodValue = (selectedFiscalYearTarget - 1) * 10 + 3; // Q3
    }
    if (periodDetail === "fourth_quarter") {
      periodForTrend = "quarter";
      currPeriodValue = selectedFiscalYearTarget * 10 + 4; // Q4
      periodValue = (selectedFiscalYearTarget - 1) * 10 + 4; // Q4
    }
    if (
      [
        "month_01",
        "month_02",
        "month_03",
        "month_04",
        "month_05",
        "month_06",
        "month_07",
        "month_08",
        "month_09",
        "month_10",
        "month_11",
        "month_12",
      ].includes(periodDetail) &&
      annualFiscalMonths
    ) {
      periodForTrend = "year_month";
      const monthValue = Number(annualFiscalMonths[periodDetail as FiscalYearMonthKey].toString().substring(4)); // 5文字目以降の月次
      currPeriodValue = selectedFiscalYearTarget * 100 + monthValue;
      periodValue = (selectedFiscalYearTarget - 1) * 100 + monthValue;
    }
    // 両チャート表示期間選択用
    setSelectedPeriodForChart(periodDetail);
    // 売上推移用 propertiesテーブルから取得のためperiodは「"fiscal_year" | "half_year" | "quarter" | "year_month"」の期間タイプをセット 目標年度の1年前をbasePeriodとしてセット
    setSelectedPeriodDetailTrend({
      period: periodForTrend,
      value: periodValue,
    });
    // 売上目標シェア sales_targetsテーブルから取得のためperiodはFiscalYearAllKeysをセット
    setSelectedPeriodDetailShare({
      period: periodDetail,
      value: currPeriodValue,
    });
    handleCloseTooltip();
  };

  // 売上目標シェア タイトル
  // const shareChartPeriodTitle = useMemo(() => {
  //   if (!selectedPeriodDetailTrend) return null;
  //   const year = selectedFiscalYearTarget;
  //   if (periodTypeTrend === "fiscal_year") {
  //     return `${year}年度`;
  //   } else {
  //     const period = selectedPeriodDetailTrend.value.toString().substring(4);
  //     return periodTypeTrend === "half_year"
  //       ? `${year}H${period}`
  //       : periodTypeTrend === "quarter"
  //       ? `${year}Q${period}`
  //       : periodTypeTrend === "year_month"
  //       ? `${year}年${period}月度`
  //       : `${selectedPeriodDetailTrend.value}年度`;
  //   }
  // }, [selectedPeriodDetailTrend]);
  // -------------------------- 売上目標シェア ここまで --------------------------

  // ---------------------- 変数 ----------------------
  // 🔹ユーザーが作成したエンティティのみのセクションリストを再生成
  // const entityLevelList: {
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
  //   // メンバーは必ず追加
  //   newEntityList.push({ title: "member", name: { ja: "メンバー", en: "Member" } });
  //   if (officeDataArray && officeDataArray.length > 0) {
  //     newEntityList.push({ title: "office", name: { ja: "事業所", en: "Office" } });
  //   }
  //   return newEntityList;
  // }, [departmentDataArray, sectionDataArray, unitDataArray, officeDataArray]);

  // --------------------------- 🌠子コンポーネントを順番にフェッチさせる🌠 ---------------------------
  const [currentActiveIndex, setCurrentActiveIndex] = useState(0); // 順番にフェッチを許可
  const [allFetched, setAllFetched] = useState(false); // サブ目標コンポーネントのフェッチが全て完了したらtrueに変更

  // // 全子コンポーネントがフェッチ完了したかを監視
  useEffect(() => {
    if (allFetched) return;
    // サブ目標リストよりactiveIndexが大きくなった場合、全てフェッチが完了
    if (currentActiveIndex >= 1) {
      setAllFetched(true);
    }
    if (mainEntityTarget?.parentEntityLevel === "company" && mainEntityTarget.entityLevel === "company") {
      setAllFetched(true);
      // if (currentActiveIndex >= upsertSettingEntitiesObj.entities.length) {
      //   setAllFetched(true);
      // }
    }
  }, [currentActiveIndex]);

  // 総合目標のエンティティの変更か、選択年度の変更があった場合にフェッチ完了状態をリセットする
  const onResetFetchComplete = () => {
    setCurrentActiveIndex(0);
  };

  // 総合目標のフェッチが完了したら
  const onFetchComplete = (tableIndex: number) => {
    // 既に現在のテーブルのindexよりcurrentActiveIndexが大きければリターン
    if (tableIndex < currentActiveIndex || allFetched) return;
    console.log(
      "onFetchComplete関数実行 tableIndex",
      tableIndex,
      "currentActiveIndex",
      currentActiveIndex,
      tableIndex < currentActiveIndex
    );
    setCurrentActiveIndex((prevIndex) => prevIndex + 1); // activeIndexを+1して次のコンポーネントのフェッチを許可
  };
  // --------------------------- 🌠子コンポーネントを順番にフェッチさせる🌠 ---------------------------

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

  console.log(
    "🌟SalesTargetsContainerコンポーネントレンダリング",
    "mainEntityTarget",
    mainEntityTarget,
    "selectedFiscalYearTarget",
    selectedFiscalYearTarget,
    "fiscalYearQueryData",
    fiscalYearQueryData,
    "entityLevelsQueryData",
    entityLevelsQueryData,
    "entitiesHierarchyQueryData",
    entitiesHierarchyQueryData,
    "parentEntityObj",
    parentEntityObj,
    "selectedPeriodDetailTrend",
    selectedPeriodDetailTrend,
    "selectedPeriodForChart",
    selectedPeriodForChart,
    "selectedPeriodDetailTrend",
    selectedPeriodDetailTrend,
    "selectedPeriodDetailShare",
    selectedPeriodDetailShare,
    "entitiesForShareChart",
    entitiesForShareChart,
    "parentEntityTotalMainTarget",
    parentEntityTotalMainTarget,
    "allFetched",
    allFetched,
    "stickyRow",
    stickyRow
    // "entityLevelList",
    // entityLevelList,
    // departmentDataArray,
    // sectionDataArray,
    // unitDataArray,
    // officeDataArray
  );

  return (
    <>
      {/* コンテンツエリア */}
      <div className={`${styles.contents_area}`}>
        {/* ---------- */}
        <div
          className={`${styles.grid_row} ${styles.col1} ${stickyRow === "main_entity_target" ? styles.sticky_row : ``}`}
        >
          <div className={`${styles.grid_content_card} `}>
            {mainEntityTarget &&
              mainEntityTarget.parentEntityLevel === "company" &&
              mainEntityTarget.entityLevel === "company" && (
                <div className={`${styles.card_wrapper} fade08_forward`}>
                  <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <Suspense
                      fallback={
                        <FallbackScrollContainer
                          title={
                            mainEntityTarget.entityLevel === "company"
                              ? language === "ja"
                                ? `全社`
                                : `Company`
                              : mainEntityTarget.entities[0].entity_name
                          }
                        />
                      }
                    >
                      <SalesTargetGridTable
                        entityLevel={mainEntityTarget.entities[0].entity_level as "company"}
                        // entityNameTitle={mainEntityTarget.entities[0].entity_name}
                        // entityId={mainEntityTarget.entities[0].entity_id}
                        entities={mainEntityTarget.entities}
                        divName={getDivName("company")}
                        companyId={userProfileState.company_id}
                        isMain={true}
                        stickyRow={stickyRow}
                        setStickyRow={setStickyRow}
                        onFetchComplete={() => onFetchComplete(0)} // メイン目標は0をセット
                        onResetFetchComplete={onResetFetchComplete}
                      />
                    </Suspense>
                  </ErrorBoundary>
                </div>
              )}
            {mainEntityTarget &&
              !(mainEntityTarget.parentEntityLevel === "company" && mainEntityTarget.entityLevel === "company") &&
              parentEntityObj && (
                <>
                  <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <Suspense
                      fallback={
                        <FallbackScrollContainer
                          title={
                            mainEntityTarget.parentEntityLevel === "company"
                              ? getDivName("company")
                              : mainEntityTarget.parentEntityName
                          }
                        />
                      }
                    >
                      <SalesTargetGridTable
                        entityLevel={mainEntityTarget.parentEntityLevel}
                        // entityNameTitle={mainEntityTarget.entities[0].entity_name}
                        // entityId={mainEntityTarget.entities[0].entity_id}
                        entities={[parentEntityObj]} // 総合目標は親エンティティ一つ
                        // divName={getDivName(mainEntityTarget.parentEntityLevel)}
                        divName={
                          mainEntityTarget.parentEntityLevel === "company"
                            ? getDivName("company")
                            : mainEntityTarget.parentEntityName
                        }
                        companyId={userProfileState.company_id}
                        isMain={true}
                        stickyRow={stickyRow}
                        setStickyRow={setStickyRow}
                        onFetchComplete={() => onFetchComplete(0)} // メイン目標は0をセット
                        onResetFetchComplete={onResetFetchComplete}
                      />
                    </Suspense>
                  </ErrorBoundary>
                </>
                // <div className={`${styles.card_wrapper} fade08_forward`}>

                // </div>
              )}
            {/* {mainEntityTarget &&
              !(mainEntityTarget.parentEntityLevel === "company" && mainEntityTarget.entityLevel === "company") &&
              !parentEntityObj && (
                <>
                  <div className={`${styles.card_title_area}`}>
                    <div className={`${styles.card_title}`}>
                      <span>
                        {mainEntityTarget.parentEntityLevel === "company"
                          ? getDivName("company")
                          : mainEntityTarget.parentEntityLevel}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`flex min-h-[66px] w-full min-w-[calc(100vw-72px-62px-30px)] items-end justify-center pb-[33px] text-[12px] text-[var(--color-text-sub)]`}
                  >
                    <span>データがありません。</span>
                  </div>
                </>
              )} */}
          </div>
          {/* <FallbackScrollContainer title="全社" /> */}
        </div>
        {/* ---------- */}

        {/* ---------- */}

        {/* <div className={`${styles.grid_row} ${styles.col3}`}>
          <div className={`${styles.grid_content_card}`}>
            <div className={`${styles.card_title_area}`}>
              <div className={`${styles.card_title}`}>
                <span>売上目標</span>
              </div>
            </div>
            <div className={`${styles.main_container}`}></div>
          </div>

          <div className={`${styles.grid_content_card}`}>
            <div className={`${styles.card_title_area}`}>
              <div className={`${styles.card_title}`}>
                <span>売上推移</span>
              </div>
            </div>
            <div className={`${styles.main_container}`}></div>
          </div>

          <div className={`${styles.grid_content_card}`}>
            <div className={`${styles.card_title_area}`}>
              <div className={`${styles.card_title}`}>
                <span>売上目標シェア</span>
              </div>
            </div>
            <div className={`${styles.main_container}`}></div>
          </div>
        </div> */}

        {/* --------------------------- 売上推移・売上目標シェア --------------------------- */}
        {!allFetched && (
          <div className={`flex-center fade08_forward h-full max-h-[300px] min-h-[300px] w-full`}>
            <SpinnerX />
          </div>
        )}

        {/* 上下どちらも未設定 */}
        {allFetched &&
          !(
            (fiscalYearQueryData?.is_confirmed_first_half_details ||
              fiscalYearQueryData?.is_confirmed_second_half_details) &&
            trendPeriodTitle &&
            selectedPeriodDetailTrend &&
            targetEntityIdsSet &&
            mainEntityTarget &&
            mainTotalTargets
          ) && (
            <>
              <div
                className={`${styles.grid_row} ${styles.col2} fade08_forward`}
                //  style={{ marginBottom: `13px` }}
              >
                <div className={`${styles.grid_content_card}`}>
                  <div className={`${styles.card_wrapper} fade08_forward`}>
                    <div className={`${styles.card_title_area}`}>
                      <div className={`${styles.card_title}`}>
                        <span>売上推移</span>
                      </div>
                    </div>
                    <div className={`${styles.main_container} flex-center`}>
                      <div
                        className={`flex h-full w-full items-center justify-center text-[13px] text-[var(--color-text-sub)]`}
                      >
                        <span>売上目標が設定されていません。</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`${styles.grid_content_card}`}>
                  <div className={`${styles.card_wrapper} fade08_forward`}>
                    <div className={`${styles.card_title_area}`}>
                      <div className={`${styles.card_title}`}>
                        <span>売上目標シェア</span>
                      </div>
                    </div>
                    <div className={`${styles.main_container} flex-center`}>
                      <div
                        className={`flex h-full w-full items-center justify-center text-[13px] text-[var(--color-text-sub)]`}
                      >
                        {/* <span>データがありません。</span> */}
                        <span>売上目標が設定されていません。</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

        {/* 上期or下期を設定済み */}
        {allFetched &&
          !!(
            (fiscalYearQueryData?.is_confirmed_first_half_details ||
              fiscalYearQueryData?.is_confirmed_second_half_details) &&
            trendPeriodTitle &&
            selectedPeriodDetailTrend !== null &&
            selectedPeriodForChart !== null &&
            targetEntityIdsSet &&
            mainEntityTarget &&
            mainTotalTargets
          ) && (
            <>
              <div className={`${styles.grid_row} ${styles.col2} fade08_forward`}>
                <div className={`${styles.grid_content_card}`} style={{ minHeight: `369px` }}>
                  <div className={`${styles.card_title_area}`}>
                    <div className={`${styles.card_title}`}>
                      <div className={`flex flex-col`}>
                        {/* <span>売上推移 {mappingEntityName[mainEntityTarget.entityLevel][language]}別</span> */}
                        <div className={`flex items-center`}>
                          <span>売上推移</span>
                          <span className={`ml-[18px]`}>
                            {displayTypeForTrend === "sub_entities"
                              ? `${mappingEntityName[mainEntityTarget.entityLevel][language]}別`
                              : `${
                                  mainEntityTarget.parentEntityLevel === "company"
                                    ? getDivName("company")
                                    : mainEntityTarget.parentEntityName
                                }`}
                          </span>
                        </div>
                        <span className={`text-[12px] text-[var(--color-text-sub)]`}>
                          {trendPeriodTitle.periodStart} ~{" "}
                          {periodEndTrend !== null ? periodEndTrend : trendPeriodTitle.periodEnd}
                        </span>
                      </div>
                    </div>

                    <div className={`flex h-full items-start justify-end pt-[3px]`}>
                      <div
                        className={`${styles.select_btn_wrapper} relative flex items-center text-[var(--color-text-title-g)]`}
                        onMouseEnter={(e) => {
                          let tooltipContent = ``;
                          if (
                            fiscalYearQueryData.is_confirmed_first_half_details ||
                            fiscalYearQueryData.is_confirmed_second_half_details
                          ) {
                            tooltipContent = `チャート表示対象を切り替える`;
                          }
                          if (tooltipContent)
                            handleOpenTooltip({
                              e: e,
                              display: "top",
                              content: tooltipContent,
                              marginTop: 9,
                            });
                        }}
                        onMouseLeave={handleCloseTooltip}
                      >
                        <select
                          className={`z-10 cursor-pointer select-none  appearance-none truncate rounded-[6px] py-[4px] pl-[8px] pr-[24px] text-[12px]`}
                          // style={{ boxShadow: `0 0 0 1px var(--color-border-base)` }}
                          value={displayTypeForTrend}
                          onChange={(e) => {
                            setDisplayTypeForTrend(e.target.value as "sub_entities" | "main_entity");
                          }}
                        >
                          {(fiscalYearQueryData.is_confirmed_first_half_details ||
                            fiscalYearQueryData.is_confirmed_second_half_details) && (
                            <option value={"sub_entities"}>
                              {mappingEntityName[mainEntityTarget.entityLevel][language]}別
                            </option>
                          )}
                          <option value={"main_entity"}>
                            {mainEntityTarget.parentEntityLevel === "company"
                              ? getDivName("company")
                              : mainEntityTarget.parentEntityName}
                          </option>
                        </select>
                        <div className={`${styles.select_arrow}`}>
                          {/* <IoChevronDownOutline className={`text-[12px]`} /> */}
                          <HiOutlineSelector className="stroke-[2] text-[16px]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <Suspense
                      fallback={
                        <div className={`flex-center w-full`} style={{ minHeight: `302px`, padding: `0px 0px 6px` }}>
                          <SpinnerX />
                        </div>
                      }
                    >
                      <AreaChartTrendWithTarget
                        companyId={userProfileState.company_id}
                        entityLevel={
                          !(
                            mainEntityTarget?.parentEntityLevel === "company" &&
                            mainEntityTarget.entityLevel === "company"
                          ) && displayTypeForTrend === "sub_entities"
                            ? mainEntityTarget.entityLevel
                            : mainEntityTarget.parentEntityLevel
                        }
                        entityIdsArray={
                          !(
                            mainEntityTarget?.parentEntityLevel === "company" &&
                            mainEntityTarget.entityLevel === "company"
                          ) && displayTypeForTrend === "sub_entities"
                            ? Array.from(targetEntityIdsSet)
                            : [mainEntityTarget.parentEntityId]
                        }
                        periodType={selectedPeriodDetailTrend.period}
                        basePeriod={selectedPeriodDetailTrend.value}
                        yearsBack={yearsBack} // デフォルトはbasePeriodの年から2年遡って過去3年分を表示する
                        fetchEnabled={true}
                        displayTypeForTrend={displayTypeForTrend}
                        selectedPeriodForChart={selectedPeriodForChart}
                        periodEndTrend={periodEndTrend}
                        setPeriodEndTrend={setPeriodEndTrend}
                      />
                    </Suspense>
                  </ErrorBoundary>
                </div>
                {!(mainEntityTarget?.parentEntityLevel === "company" && mainEntityTarget.entityLevel === "company") &&
                selectedPeriodDetailShare &&
                entitiesForShareChart &&
                parentEntityTotalMainTarget !== null &&
                salesTargetSharePeriodTitle !== null &&
                fiscalYearQueryData &&
                mainEntityTarget &&
                entityLevelMap &&
                entityLevelMap.has(mainEntityTarget.entityLevel) ? (
                  <div className={`${styles.grid_content_card}`} style={{ minHeight: `300px` }}>
                    <div className={`${styles.card_title_area} !items-start`}>
                      <div className={`${styles.card_title}`}>
                        <div className={`flex flex-col`}>
                          {/* <span>売上目標シェア {`${mappingEntityName[mainEntityTarget.entityLevel][language]}別`}</span> */}
                          <div className={`flex items-center`}>
                            <span>売上目標シェア</span>
                            <span className={`ml-[18px]`}>
                              {`${mappingEntityName[mainEntityTarget.entityLevel][language]}別`}
                            </span>
                          </div>
                          <span className={`text-[12px] text-[var(--color-text-sub)]`}>
                            {salesTargetSharePeriodTitle}
                          </span>
                        </div>
                      </div>
                      <div className={`flex h-full items-start justify-end pt-[3px]`}>
                        {mainEntityTarget.entityLevel &&
                        allFetched &&
                        selectedPeriodDetailTrend &&
                        fiscalYearQueryData &&
                        selectedPeriodForChart &&
                        (fiscalYearQueryData.is_confirmed_first_half_details ||
                          fiscalYearQueryData.is_confirmed_second_half_details) ? (
                          <div
                            className={`${styles.select_btn_wrapper} relative flex items-center text-[var(--color-text-title-g)]`}
                            onMouseEnter={(e) => {
                              handleOpenTooltip({
                                e: e,
                                display: "top",
                                content: `チャートの表示期間を変更`,
                                marginTop: 6,
                              });
                            }}
                            onMouseLeave={handleCloseTooltip}
                          >
                            <select
                              className={`z-10 cursor-pointer select-none  appearance-none truncate rounded-[6px] py-[4px] pl-[8px] pr-[24px] text-[12px]`}
                              value={selectedPeriodForChart}
                              onChange={handleChangePeriodChart}
                            >
                              {/* 上期下期どちらも設定完了済み */}
                              {fiscalYearQueryData.is_confirmed_first_half_details &&
                                fiscalYearQueryData.is_confirmed_second_half_details && (
                                  <>
                                    <option value="fiscal_year">年度</option>
                                    <option value="first_half">上期</option>
                                    <option value="second_half">下期</option>
                                    <option value="first_quarter">Q1</option>
                                    <option value="second_quarter">Q2</option>
                                    <option value="third_quarter">Q3</option>
                                    <option value="fourth_quarter">Q4</option>
                                    {formattedAnnualFiscalMonths && (
                                      <>
                                        <option value="month_01">
                                          {formattedAnnualFiscalMonths.month_01[language]}
                                        </option>
                                        <option value="month_02">
                                          {formattedAnnualFiscalMonths.month_02[language]}
                                        </option>
                                        <option value="month_03">
                                          {formattedAnnualFiscalMonths.month_03[language]}
                                        </option>
                                        <option value="month_04">
                                          {formattedAnnualFiscalMonths.month_04[language]}
                                        </option>
                                        <option value="month_05">
                                          {formattedAnnualFiscalMonths.month_05[language]}
                                        </option>
                                        <option value="month_06">
                                          {formattedAnnualFiscalMonths.month_06[language]}
                                        </option>
                                        <option value="month_07">
                                          {formattedAnnualFiscalMonths.month_07[language]}
                                        </option>
                                        <option value="month_08">
                                          {formattedAnnualFiscalMonths.month_08[language]}
                                        </option>
                                        <option value="month_09">
                                          {formattedAnnualFiscalMonths.month_09[language]}
                                        </option>
                                        <option value="month_10">
                                          {formattedAnnualFiscalMonths.month_10[language]}
                                        </option>
                                        <option value="month_11">
                                          {formattedAnnualFiscalMonths.month_11[language]}
                                        </option>
                                        <option value="month_12">
                                          {formattedAnnualFiscalMonths.month_12[language]}
                                        </option>
                                      </>
                                    )}
                                  </>
                                )}
                              {/* 上期のみ設定完了済みの場合 */}
                              {fiscalYearQueryData.is_confirmed_first_half_details &&
                                !fiscalYearQueryData.is_confirmed_second_half_details && (
                                  <>
                                    {/* メンバーレベル以外は年度・下期を入れる */}
                                    {mainEntityTarget.entityLevel !== "member" && (
                                      <>
                                        <option value="fiscal_year">年度</option>
                                        <option value="second_half">下期</option>
                                      </>
                                    )}
                                    <option value="first_half">上期</option>
                                    <option value="first_quarter">Q1</option>
                                    <option value="second_quarter">Q2</option>
                                    {formattedAnnualFiscalMonths && (
                                      <>
                                        <option value="month_01">
                                          {formattedAnnualFiscalMonths.month_01[language]}
                                        </option>
                                        <option value="month_02">
                                          {formattedAnnualFiscalMonths.month_02[language]}
                                        </option>
                                        <option value="month_03">
                                          {formattedAnnualFiscalMonths.month_03[language]}
                                        </option>
                                        <option value="month_04">
                                          {formattedAnnualFiscalMonths.month_04[language]}
                                        </option>
                                        <option value="month_05">
                                          {formattedAnnualFiscalMonths.month_05[language]}
                                        </option>
                                        <option value="month_06">
                                          {formattedAnnualFiscalMonths.month_06[language]}
                                        </option>
                                      </>
                                    )}
                                  </>
                                )}
                              {/* 下期のみ設定完了済みの場合 */}
                              {!fiscalYearQueryData.is_confirmed_first_half_details &&
                                fiscalYearQueryData.is_confirmed_second_half_details && (
                                  <>
                                    {/* メンバーレベル以外は年度・上期を入れる */}
                                    {mainEntityTarget.entityLevel !== "member" && (
                                      <>
                                        <option value="fiscal_year">年度</option>
                                        <option value="first_half">上期</option>
                                      </>
                                    )}
                                    <option value="second_half">下期</option>
                                    <option value="third_quarter">Q3</option>
                                    <option value="fourth_quarter">Q4</option>
                                    {formattedAnnualFiscalMonths && (
                                      <>
                                        <option value="month_07">
                                          {formattedAnnualFiscalMonths.month_07[language]}
                                        </option>
                                        <option value="month_08">
                                          {formattedAnnualFiscalMonths.month_08[language]}
                                        </option>
                                        <option value="month_09">
                                          {formattedAnnualFiscalMonths.month_09[language]}
                                        </option>
                                        <option value="month_10">
                                          {formattedAnnualFiscalMonths.month_10[language]}
                                        </option>
                                        <option value="month_11">
                                          {formattedAnnualFiscalMonths.month_11[language]}
                                        </option>
                                        <option value="month_12">
                                          {formattedAnnualFiscalMonths.month_12[language]}
                                        </option>
                                      </>
                                    )}
                                  </>
                                )}
                            </select>
                            <div className={`${styles.select_arrow}`}>
                              <HiOutlineSelector className="stroke-[2] text-[16px]" />
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* セレクトボックス プレイスホルダー */}
                            <div
                              className={`${styles.select_btn_wrapper} relative flex items-center text-[var(--color-text-title-g)]`}
                              onMouseEnter={(e) => {
                                handleOpenTooltip({
                                  e: e,
                                  display: "top",
                                  content: `売上目標の設定完了後\nチャート表示期間の変更が可能です。`,
                                  marginTop: 24,
                                });
                              }}
                              onMouseLeave={handleCloseTooltip}
                            >
                              <select
                                className={`z-10 cursor-pointer select-none  appearance-none truncate rounded-[6px] py-[4px] pl-[8px] pr-[24px] text-[12px]`}
                                defaultValue={"fiscal_year"}
                              >
                                <option value="fiscal_year">年度</option>
                              </select>
                              {/* 上下矢印アイコン */}
                              <div className={`${styles.select_arrow}`}>
                                <HiOutlineSelector className="stroke-[2] text-[16px]" />
                              </div>
                            </div>
                          </>
                        )}
                        {/* <div
                          className={`${styles.select_btn_wrapper} relative flex items-center text-[var(--color-text-title-g)]`}
                          // onMouseEnter={(e) => {
                          //   handleOpenTooltip({
                          //     e: e,
                          //     display: "top",
                          //     content: stickyRow === entityId ? `固定を解除` : `画面内に固定`,
                          //     marginTop: 9,
                          //   });
                          // }}
                          // onMouseLeave={handleCloseTooltip}
                        >
                          <select
                            className={`z-10 min-h-[30px] cursor-pointer select-none  appearance-none truncate rounded-[6px] py-[4px] pl-[8px] pr-[24px] text-[13px]`}
                            // style={{ boxShadow: `0 0 0 1px var(--color-border-base)` }}
                            value={selectedEntityIdForDonut}
                            onChange={(e) => {
                              setSelectedEntityIdForDonut(e.target.value);
                            }}
                          >
                            {optionsEntity.map((obj, index) => (
                              <option key={`option_${obj.id}`} value={obj.id}>
                                {obj.entityName}
                              </option>
                            ))}
                          </select>
                          <div className={`${styles.select_arrow}`}>
                            <IoChevronDownOutline className={`text-[12px]`} />
                          </div>
                        </div> */}
                      </div>
                    </div>
                    {/* <div className={`${styles.main_container}`}></div> */}
                    <ErrorBoundary FallbackComponent={ErrorFallback}>
                      <Suspense
                        fallback={
                          <div className={`flex-center w-full`} style={{ minHeight: `302px`, padding: `0px 0px 6px` }}>
                            <SpinnerX />
                          </div>
                        }
                      >
                        <DonutChartTargetShares
                          fiscalYear={selectedFiscalYearTarget}
                          companyId={userProfileState.company_id}
                          parentEntityId={mainEntityTarget.parentEntityId}
                          parentEntityTotalMainTarget={parentEntityTotalMainTarget}
                          entityLevel={mainEntityTarget.entityLevel}
                          entityLevelId={entityLevelMap.get(mainEntityTarget.entityLevel)!.id}
                          fiscalYearId={fiscalYearQueryData.id}
                          entities={entitiesForShareChart}
                          periodTitle={salesTargetSharePeriodTitle}
                          periodType={selectedPeriodDetailShare.period}
                          basePeriod={selectedPeriodDetailShare.value}
                          fetchEnabled={true}
                          // periodType={periodTypeTrend}
                        />
                      </Suspense>
                    </ErrorBoundary>
                  </div>
                ) : (
                  <div className={`${styles.grid_content_card}`}>
                    <div className={`${styles.card_wrapper} fade08_forward`}>
                      <div className={`${styles.card_title_area}`}>
                        <div className={`${styles.card_title}`}>
                          <span>売上目標シェア</span>
                        </div>
                      </div>
                      <div className={`${styles.main_container} flex-center`}>
                        <div
                          className={`flex h-full w-full items-center justify-center text-[13px] text-[var(--color-text-sub)]`}
                        >
                          <span>データがありません。</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

        {/* --------------------------- 売上推移・売上目標シェア --------------------------- */}

        {/* ----------- サブ目標タイトルエリア ----------- */}
        {mainEntityTarget &&
          !(mainEntityTarget.parentEntityLevel === "company" && mainEntityTarget.entityLevel === "company") && (
            <div
              className={`${styles.section_title_area} mb-[15px] flex w-full items-end justify-between`}
              // style={{ marginBottom: `13px` }}
            >
              <h1 className={`${styles.title} ${styles.upsert}`}>
                {/* <span>部門別</span> */}
                {!(mainEntityTarget?.parentEntityLevel === "company" && mainEntityTarget.entityLevel === "company") && (
                  <span>{getDivName(mainEntityTarget.entityLevel)}別</span>
                )}
                {mainEntityTarget?.parentEntityLevel === "company" && mainEntityTarget.entityLevel === "company" && (
                  <span>{getDivName("company")}</span>
                )}

                <span className="ml-[12px]">売上目標</span>

                {/* {upsertSettingEntitiesObj.entityLevel === "member" && (
              <>
                {upsertSettingEntitiesObj.periodType === "first_half_details" && (
                  <span className="ml-[12px]">上期詳細目標</span>
                )}
                {upsertSettingEntitiesObj.periodType === "second_half_details" && (
                  <span className="ml-[12px]">下期詳細目標</span>
                )}
              </>
            )} */}
              </h1>

              <div className={`${styles.btn_area} flex h-full items-center space-x-[12px]`}>
                {/* セレクトボックス 上期か下期どちらか設定が完了している場合 */}
                {mainEntityTarget.entityLevel &&
                allFetched &&
                selectedPeriodDetailTrend &&
                fiscalYearQueryData &&
                selectedPeriodForChart &&
                (fiscalYearQueryData.is_confirmed_first_half_details ||
                  fiscalYearQueryData.is_confirmed_second_half_details) ? (
                  <div
                    className={`${styles.select_btn_wrapper} fade08_forward relative flex items-center text-[var(--color-text-title-g)]`}
                    onMouseEnter={(e) => {
                      handleOpenTooltip({
                        e: e,
                        display: "top",
                        content: `チャートの表示期間を変更`,
                        marginTop: 6,
                      });
                    }}
                    onMouseLeave={handleCloseTooltip}
                  >
                    <select
                      className={`z-10 min-h-[30px] cursor-pointer select-none  appearance-none truncate rounded-[6px] py-[4px] pl-[8px] pr-[24px] text-[14px] font-bold`}
                      value={selectedPeriodForChart}
                      onChange={handleChangePeriodChart}
                    >
                      {/* 上期下期どちらも設定完了済み */}
                      {fiscalYearQueryData.is_confirmed_first_half_details &&
                        fiscalYearQueryData.is_confirmed_second_half_details && (
                          <>
                            <option value="fiscal_year">年度</option>
                            <option value="first_half">上期</option>
                            <option value="second_half">下期</option>
                            <option value="first_quarter">Q1</option>
                            <option value="second_quarter">Q2</option>
                            <option value="third_quarter">Q3</option>
                            <option value="fourth_quarter">Q4</option>
                            {formattedAnnualFiscalMonths && (
                              <>
                                <option value="month_01">{formattedAnnualFiscalMonths.month_01[language]}</option>
                                <option value="month_02">{formattedAnnualFiscalMonths.month_02[language]}</option>
                                <option value="month_03">{formattedAnnualFiscalMonths.month_03[language]}</option>
                                <option value="month_04">{formattedAnnualFiscalMonths.month_04[language]}</option>
                                <option value="month_05">{formattedAnnualFiscalMonths.month_05[language]}</option>
                                <option value="month_06">{formattedAnnualFiscalMonths.month_06[language]}</option>
                                <option value="month_07">{formattedAnnualFiscalMonths.month_07[language]}</option>
                                <option value="month_08">{formattedAnnualFiscalMonths.month_08[language]}</option>
                                <option value="month_09">{formattedAnnualFiscalMonths.month_09[language]}</option>
                                <option value="month_10">{formattedAnnualFiscalMonths.month_10[language]}</option>
                                <option value="month_11">{formattedAnnualFiscalMonths.month_11[language]}</option>
                                <option value="month_12">{formattedAnnualFiscalMonths.month_12[language]}</option>
                              </>
                            )}
                          </>
                        )}
                      {/* 上期のみ設定完了済みの場合 */}
                      {fiscalYearQueryData.is_confirmed_first_half_details &&
                        !fiscalYearQueryData.is_confirmed_second_half_details && (
                          <>
                            {/* メンバーレベル以外は年度・下期を入れる */}
                            {mainEntityTarget.entityLevel !== "member" && (
                              <>
                                <option value="fiscal_year">年度</option>
                                <option value="second_half">下期</option>
                              </>
                            )}
                            <option value="first_half">上期</option>
                            <option value="first_quarter">Q1</option>
                            <option value="second_quarter">Q2</option>
                            {formattedAnnualFiscalMonths && (
                              <>
                                <option value="month_01">{formattedAnnualFiscalMonths.month_01[language]}</option>
                                <option value="month_02">{formattedAnnualFiscalMonths.month_02[language]}</option>
                                <option value="month_03">{formattedAnnualFiscalMonths.month_03[language]}</option>
                                <option value="month_04">{formattedAnnualFiscalMonths.month_04[language]}</option>
                                <option value="month_05">{formattedAnnualFiscalMonths.month_05[language]}</option>
                                <option value="month_06">{formattedAnnualFiscalMonths.month_06[language]}</option>
                              </>
                            )}
                          </>
                        )}
                      {/* 下期のみ設定完了済みの場合 */}
                      {!fiscalYearQueryData.is_confirmed_first_half_details &&
                        fiscalYearQueryData.is_confirmed_second_half_details && (
                          <>
                            {/* メンバーレベル以外は年度・上期を入れる */}
                            {mainEntityTarget.entityLevel !== "member" && (
                              <>
                                <option value="fiscal_year">年度</option>
                                <option value="first_half">上期</option>
                              </>
                            )}
                            <option value="second_half">下期</option>
                            <option value="third_quarter">Q3</option>
                            <option value="fourth_quarter">Q4</option>
                            {formattedAnnualFiscalMonths && (
                              <>
                                <option value="month_07">{formattedAnnualFiscalMonths.month_07[language]}</option>
                                <option value="month_08">{formattedAnnualFiscalMonths.month_08[language]}</option>
                                <option value="month_09">{formattedAnnualFiscalMonths.month_09[language]}</option>
                                <option value="month_10">{formattedAnnualFiscalMonths.month_10[language]}</option>
                                <option value="month_11">{formattedAnnualFiscalMonths.month_11[language]}</option>
                                <option value="month_12">{formattedAnnualFiscalMonths.month_12[language]}</option>
                              </>
                            )}
                          </>
                        )}
                    </select>
                    {/* 上下矢印アイコン */}
                    <div className={`${styles.select_arrow}`}>
                      <HiOutlineSelector className="stroke-[2] text-[16px]" />
                    </div>
                  </div>
                ) : (
                  <>
                    {/* セレクトボックス プレイスホルダー */}
                    <div
                      className={`${styles.select_btn_wrapper} fade08_forward relative flex items-center text-[var(--color-text-title-g)]`}
                      onMouseEnter={(e) => {
                        handleOpenTooltip({
                          e: e,
                          display: "top",
                          content: `売上目標の設定完了後\nチャート表示期間の変更が可能です。`,
                          marginTop: 24,
                        });
                      }}
                      onMouseLeave={handleCloseTooltip}
                    >
                      <select
                        className={`z-10 min-h-[30px] cursor-pointer select-none  appearance-none truncate rounded-[6px] py-[4px] pl-[8px] pr-[24px] text-[14px] font-bold`}
                        defaultValue={"fiscal_year"}
                      >
                        <option value="fiscal_year">年度</option>
                      </select>
                      {/* 上下矢印アイコン */}
                      <div className={`${styles.select_arrow}`}>
                        <HiOutlineSelector className="stroke-[2] text-[16px]" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        {/* ----------- サブ目標タイトルエリア ここまで ----------- */}

        {/* ----------------------------------- サブ目標 ----------------------------------- */}
        {mainEntityTarget &&
          !(mainEntityTarget.parentEntityLevel === "company" && mainEntityTarget.entityLevel === "company") && (
            <div
              className={`${styles.grid_row} ${styles.col1} ${stickyRow === "sub_targets" ? styles.sticky_row : ``}`}
            >
              <div className={`${styles.grid_content_card} fade08_forward`}>
                {/* {mainEntityTarget &&
              !(mainEntityTarget.parentEntityLevel === "company" && mainEntityTarget.entityLevel === "company") &&
              !parentEntityObj && (
                <>
                  <div className={`${styles.card_title_area}`}>
                    <div className={`${styles.card_title}`}>
                      <span>{`${getDivName(mainEntityTarget.entityLevel)}`}</span>
                    </div>
                  </div>
                  <div
                    className={`flex min-h-[66px] w-full min-w-[calc(100vw-72px-62px-30px)] items-end justify-center pb-[33px] text-[12px] text-[var(--color-text-sub)]`}
                  >
                    <span>データがありません。</span>
                  </div>
                </>
              )} */}
                {currentActiveIndex < 1 && (
                  <FallbackScrollContainer title={mainEntityTarget ? getDivName(mainEntityTarget.entityLevel) : ""} />
                )}
                {currentActiveIndex <= 1 && mainTotalTargets && parentEntityObj && (
                  <>
                    <ErrorBoundary FallbackComponent={ErrorFallback}>
                      <Suspense fallback={<FallbackScrollContainer title={getDivName(mainEntityTarget.entityLevel)} />}>
                        <SalesTargetGridTableSub
                          entityLevel={mainEntityTarget.entityLevel}
                          // entityNameTitle={mainEntityTarget.entities[0].entity_name}
                          // entityId={mainEntityTarget.entities[0].entity_id}
                          entities={mainEntityTarget.entities}
                          divName={getDivName(mainEntityTarget.entityLevel)}
                          companyId={userProfileState.company_id}
                          stickyRow={stickyRow}
                          setStickyRow={setStickyRow}
                          fetchEnabled={currentActiveIndex > 0} // 総合目標のフェッチが完了済みならフェッチを許可
                        />
                      </Suspense>
                    </ErrorBoundary>
                  </>
                )}
              </div>
            </div>
          )}
        {/* ----------------------------------- サブ目標 ----------------------------------- */}
        {/* <div className={`${styles.grid_row} ${styles.col1}`}>
          <div className={`${styles.grid_content_card}`}>
            <div className={`${styles.card_wrapper} fade08_forward`}>
              <div className={`${styles.card_title_area}`}>
                <div className={`${styles.card_title}`}>
                  <span>スローガン・重点方針</span>
                </div>
              </div>
              <div className={`${styles.main_container}`}></div>
            </div>
          </div>
        </div> */}
        {/* ---------- */}
      </div>
    </>
  );
};

export const SalesTargetsContainer = memo(SalesTargetsContainerMemo);
