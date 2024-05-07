import { ErrorFallback } from "@/components/ErrorFallback/ErrorFallback";
import { SpinnerX } from "@/components/Parts/SpinnerX/SpinnerX";
import { Suspense, memo, useEffect, useMemo, useState } from "react";
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

  // -------------------------- state関連 --------------------------
  // stickyを付与するrow
  const [stickyRow, setStickyRow] = useState<string | null>(null);

  // ========================= 🌟事業部・課・係・事業所リスト取得useQuery キャッシュ🌟 =========================
  const departmentDataArray: Department[] | undefined = queryClient.getQueryData(["departments"]);
  const sectionDataArray: Section[] | undefined = queryClient.getQueryData(["sections"]);
  const unitDataArray: Unit[] | undefined = queryClient.getQueryData(["units"]);
  const officeDataArray: Office[] | undefined = queryClient.getQueryData(["offices"]);
  // ========================= 🌟事業部・課・係・事業所リスト取得useQuery キャッシュ🌟 =========================

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
  // ===================== 🌠エンティティuseQuery🌠 =====================

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
  // const parentEntityObj = useMemo(() => {
  //   if (!mainEntityTarget) return null;
  //   if (!entitiesHierarchyQueryData) return null;
  //   if (!entityLevelToChildLevelMap) return null;
  //   if (mainEntityTarget.parentEntityLevel === "company") return null;
  //   if (!["department", "section", "unit"].includes(mainEntityTarget.parentEntityLevel)) return null;
  //   const parentEntityGroups = entitiesHierarchyQueryData[mainEntityTarget.parentEntityLevel];
  //   const parentAllEntityGroup = parentEntityGroups.map((group) => group.entities).flatMap((entities) => entities);
  //   const parentAllEntityGroupMap = new Map(parentAllEntityGroup.map((entities) => [entities.entity_id, entities]));
  //   const newParentEntityObj = parentAllEntityGroupMap.get(mainEntityTarget.parentEntityId);
  //   return newParentEntityObj ?? null;
  // }, [mainEntityTarget, entitiesHierarchyQueryData]);
  // -------------------------- 親エンティティのEntityオブジェクト --------------------------

  // -------------------------- Zustand上位エンティティグループをセット --------------------------
  useEffect(() => {
    if (mainEntityTarget !== null) return;
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
      console.log("🌠🌠🌠 childLevel", childLevel, "entitiesHierarchyQueryData", entitiesHierarchyQueryData);
      if (childLevel) {
        const childEntityGroups = entitiesHierarchyMap.get(childLevel);
        console.log("🌠🌠🌠🔥🔥🔥 childEntityGroups", childEntityGroups, "entitiesHierarchyMap", entitiesHierarchyMap);
        if (childEntityGroups) {
          // 会社エンティティidに紐づくエンティティグループ
          const childEntityGroup = childEntityGroups.find((group) => group.parent_entity_id === companyEntityId);
          console.log("🌠🌠🌠🔥🔥🔥🌠🌠🌠 childEntityGroup", childEntityGroup);
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

            console.log("🌠🌠🌠🔥🔥🔥🌠🌠🌠🔥🔥🔥 newMainEntityTarget", newMainEntityTarget);

            setMainEntityTarget(newMainEntityTarget);
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
  // useEffect(() => {
  //   // サブ目標リストよりactiveIndexが大きくなった場合、全てフェッチが完了
  //   if (currentActiveIndex >= subTargetList.length) {
  //     setAllFetched(true);
  //   }
  //   if (upsertSettingEntitiesObj.entityLevel === "company") {
  //     if (currentActiveIndex >= upsertSettingEntitiesObj.entities.length) {
  //       setAllFetched(true);
  //     }
  //   }
  // }, [currentActiveIndex]);

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
    parentEntityObj
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
          className={`${styles.grid_row} ${styles.col1} ${
            stickyRow === userProfileState.company_id ? styles.sticky_row : ``
          }`}
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
                        entityLevel={mainEntityTarget.entities[0].entity_level}
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
                <div className={`${styles.card_wrapper} fade08_forward`}>
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
                </div>
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

        <div className={`${styles.grid_row} ${styles.col2}`}>
          <div className={`${styles.grid_content_card}`}>
            <div className={`${styles.card_wrapper} fade08_forward`}>
              <div className={`${styles.card_title_area}`}>
                <div className={`${styles.card_title}`}>
                  <span>売上推移</span>
                </div>
              </div>
              <div className={`${styles.main_container}`}></div>
            </div>
          </div>

          <div className={`${styles.grid_content_card}`}>
            <div className={`${styles.card_wrapper} fade08_forward`}>
              <div className={`${styles.card_title_area}`}>
                <div className={`${styles.card_title}`}>
                  <span>売上目標シェア</span>
                </div>
              </div>
              <div className={`${styles.main_container}`}></div>
            </div>
          </div>
        </div>

        {/* ---------- */}

        {/* ---------- */}
        {/* {!!entityLevelList?.length && entityLevelList.map((obj) => {
          return (
            <div key={`${obj.title}_row_card`} className={`${styles.grid_row} ${styles.col1}`}>
              <div className={`${styles.grid_content_card}`}>
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <Suspense fallback={<FallbackScrollContainer title={obj.name[language]} />}>
                    <SalesTargetGridTable title={obj.name[language]} entityLevel={obj.title} fiscalYear={2023} isMain={false} />
                  </Suspense>
                </ErrorBoundary>
              </div>
            </div>
          );
        })} */}
        {/* ---------- */}

        {/* ---------- */}
        <div className={`${styles.grid_row} ${styles.col1} ${stickyRow === "sub_targets" ? styles.sticky_row : ``}`}>
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
            {mainEntityTarget &&
              !(mainEntityTarget.parentEntityLevel === "company" && mainEntityTarget.entityLevel === "company") &&
              parentEntityObj && (
                <div className={`${styles.card_wrapper} fade08_forward`}>
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
                </div>
              )}
          </div>
        </div>
        <div className={`${styles.grid_row} ${styles.col1}`}>
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
        </div>
        {/* <div className={`${styles.grid_row} ${styles.col1}`}>
          <div className={`${styles.grid_content_card}`}>
            <div className={`${styles.card_title_area}`}>
              <div className={`${styles.card_title}`}>
                <span>事業部</span>
              </div>
            </div>
          </div>
        </div> */}
        {/* ---------- */}
      </div>
    </>
  );
};

export const SalesTargetsContainer = memo(SalesTargetsContainerMemo);
