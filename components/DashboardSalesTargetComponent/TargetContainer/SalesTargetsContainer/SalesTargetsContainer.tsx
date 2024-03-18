import { ErrorFallback } from "@/components/ErrorFallback/ErrorFallback";
import { SpinnerX } from "@/components/Parts/SpinnerX/SpinnerX";
import { Suspense, memo, useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import styles from "./SalesTargetsContainer.module.css";
import { SalesTargetGridTable } from "./SalesTargetGridTable/SalesTargetGridTable";
import { FallbackScrollContainer } from "./SalesTargetGridTable/FallbackScrollContainer";
import { Department, Office, Section, Unit } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { mappingSectionName } from "@/utils/selectOptions";
import useDashboardStore from "@/store/useDashboardStore";
import useStore from "@/store";

const SalesTargetsContainerMemo = () => {
  const language = useStore((state) => state.language);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const queryClient = useQueryClient();
  // メイン目標
  const mainEntityTarget = useDashboardStore((state) => state.mainEntityTarget);

  if (!userProfileState?.company_id) return null;

  // ========================= 🌟事業部・課・係・事業所リスト取得useQuery キャッシュ🌟 =========================
  const departmentDataArray: Department[] | undefined = queryClient.getQueryData(["departments"]);
  const sectionDataArray: Section[] | undefined = queryClient.getQueryData(["sections"]);
  const unitDataArray: Unit[] | undefined = queryClient.getQueryData(["units"]);
  const officeDataArray: Office[] | undefined = queryClient.getQueryData(["offices"]);
  // ========================= 🌟事業部・課・係・事業所リスト取得useQuery キャッシュ🌟 =========================

  // ---------------------- 変数 ----------------------
  // 🔹ユーザーが作成したエンティティのみのセクションリストを再生成
  const entityTypeList: {
    title: string;
    name: {
      [key: string]: string;
    };
  }[] = useMemo(() => {
    let newEntityList = [{ title: "company", name: { ja: "全社", en: "Company" } }];
    if (departmentDataArray && departmentDataArray.length > 0) {
      newEntityList.push({ title: "department", name: { ja: "事業部", en: "Department" } });
    }
    if (sectionDataArray && sectionDataArray.length > 0) {
      newEntityList.push({ title: "section", name: { ja: "課・セクション", en: "Section" } });
    }
    if (unitDataArray && unitDataArray.length > 0) {
      newEntityList.push({ title: "unit", name: { ja: "係・チーム", en: "Unit" } });
    }
    // メンバーは必ず追加
    newEntityList.push({ title: "member", name: { ja: "メンバー", en: "Member" } });
    if (officeDataArray && officeDataArray.length > 0) {
      newEntityList.push({ title: "office", name: { ja: "事業所", en: "Office" } });
    }
    return newEntityList;
  }, [departmentDataArray, sectionDataArray, unitDataArray, officeDataArray]);

  // 目標カードのタイトルを割り当てる関数
  const getTitle = () => {
    if (!mainEntityTarget || mainEntityTarget?.entityType === "company") return language === "ja" ? `全社` : "Company";
    switch (mainEntityTarget.entityType) {
      case "department":
        return mainEntityTarget.entityName || "事業部";
        break;
      case "section":
        return mainEntityTarget.entityName || "課・セクション";
        break;
      case "unit":
        return mainEntityTarget.entityName || "係・チーム";
        break;
      case "office":
        return mainEntityTarget.entityName || "事業所";
        break;

      default:
        return "-";
        break;
    }
  };

  console.log(
    "SalesTargetsContainerコンポーネントレンダリング",
    "mainEntityTarget",
    mainEntityTarget,
    "entityTypeList",
    entityTypeList,
    departmentDataArray,
    sectionDataArray,
    unitDataArray,
    officeDataArray
  );

  return (
    <>
      {/* コンテンツエリア */}
      <div className={`${styles.contents_area}`}>
        {/* ---------- */}
        <div className={`${styles.grid_row} ${styles.col3}`}>
          <div className={`${styles.grid_content_card}`}>
            {/* タイトルエリア */}
            <div className={`${styles.card_title_area}`}>
              <div className={`${styles.card_title}`}>
                <span>売上目標</span>
              </div>
            </div>
            {/* コンテンツエリア */}
            <div className={`${styles.main_container}`}></div>
          </div>
          <div className={`${styles.grid_content_card}`}>
            {/* タイトルエリア */}
            <div className={`${styles.card_title_area}`}>
              <div className={`${styles.card_title}`}>
                <span>売上目標シェア</span>
              </div>
            </div>
            {/* コンテンツエリア */}
            <div className={`${styles.main_container}`}></div>
          </div>
          <div className={`${styles.grid_content_card}`}>
            {/* タイトルエリア */}
            <div className={`${styles.card_title_area}`}>
              <div className={`${styles.card_title}`}>
                <span>スローガン・重点方針</span>
              </div>
            </div>
            {/* コンテンツエリア */}
            <div className={`${styles.main_container}`}></div>
          </div>
        </div>
        {/* ---------- */}
        {/* ---------- */}
        <div className={`${styles.grid_row} ${styles.col1}`}>
          <div className={`${styles.grid_content_card}`}>
            {/* タイトルエリア */}
            {/* <div className={`${styles.card_title_area}`}>
              <div className={`${styles.card_title}`}>
                <span>全社</span>
              </div>
            </div> */}
            {/* コンテンツエリア */}
            {mainEntityTarget && (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Suspense fallback={<FallbackScrollContainer title={getTitle()} />}>
                  <SalesTargetGridTable
                    title={getTitle()}
                    companyId={userProfileState.company_id}
                    entityType={mainEntityTarget.entityType}
                    entityId={userProfileState.company_id}
                    fiscalYear={2023}
                    isMain={true}
                  />
                </Suspense>
              </ErrorBoundary>
            )}
            {/* <FallbackScrollContainer title="全社" /> */}
          </div>
        </div>
        {/* ---------- */}

        {/* ---------- */}
        {/* {!!entityTypeList?.length && entityTypeList.map((obj) => {
          return (
            <div key={`${obj.title}_row_card`} className={`${styles.grid_row} ${styles.col1}`}>
              <div className={`${styles.grid_content_card}`}>
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <Suspense fallback={<FallbackScrollContainer title={obj.name[language]} />}>
                    <SalesTargetGridTable title={obj.name[language]} entityType={obj.title} fiscalYear={2023} isMain={false} />
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
