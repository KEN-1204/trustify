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

  // -------------------------- Zustand上位エンティティグループをセット --------------------------
  useEffect(() => {
    if (mainEntityTarget !== null) return;
    if (!userProfileState) return;
    if (!userProfileState.company_id) return;
    if (!userProfileState.customer_name) return;

    // 初期値はroot-companyのエンティティグループをセット
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
        parentEntityLevel: companyLevelObj.entities[0].parent_entity_level,
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
        parent_entity_name: "",
        fiscal_year: selectedFiscalYearTarget,
        entity_level: "company",
        parent_entity_level: "root",
      } as Entity;
      const newMainEntityTarget = {
        periodType: "year_half", // 初回は年度(全て)をセット
        entityLevel: "company",
        entities: [initialEntity],
        parentEntityLevelId: "",
        parentEntityLevel: "root",
        parentEntityId: "",
        parentEntityName: "",
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
    entitiesHierarchyQueryData
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
          <div className={`${styles.grid_content_card}`}>
            {/* タイトルエリア */}
            {/* <div className={`${styles.card_title_area}`}>
              <div className={`${styles.card_title}`}>
                <span>全社</span>
              </div>
            </div> */}
            {/* コンテンツエリア */}
            {mainEntityTarget && mainEntityTarget.entityLevel === "company" && (
              <>
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <Suspense fallback={<FallbackScrollContainer title={mainEntityTarget.entities[0].entity_name} />}>
                    <SalesTargetGridTable
                      entityLevel={mainEntityTarget.entities[0].entity_level}
                      entityNameTitle={mainEntityTarget.entities[0].entity_name}
                      entityId={mainEntityTarget.entities[0].entity_id}
                      companyId={userProfileState.company_id}
                      fiscalYear={selectedFiscalYearTarget}
                      isMain={true}
                      stickyRow={stickyRow}
                      setStickyRow={setStickyRow}
                    />
                  </Suspense>
                </ErrorBoundary>
              </>
            )}
            {/* <FallbackScrollContainer title="全社" /> */}
          </div>
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
        <div className={`${styles.grid_row} ${styles.col1}`}>
          <div className={`${styles.grid_content_card}`}>
            <div className={`${styles.card_title_area}`}>
              <div className={`${styles.card_title}`}>
                <span>事業部別</span>
              </div>
            </div>
            <div className={`${styles.main_container}`}></div>
          </div>
        </div>
        <div className={`${styles.grid_row} ${styles.col1}`}>
          <div className={`${styles.grid_content_card}`}>
            <div className={`${styles.card_title_area}`}>
              <div className={`${styles.card_title}`}>
                <span>スローガン・重点方針</span>
              </div>
            </div>
            <div className={`${styles.main_container}`}></div>
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
