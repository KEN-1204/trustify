import {
  Dispatch,
  DragEvent,
  FormEvent,
  Fragment,
  MouseEvent,
  SetStateAction,
  Suspense,
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";
import styles from "./ScreenDealBoards.module.css";
import { DealBoard } from "./DealBoard/DealBoard";
import { AvatarIcon } from "@/components/Parts/AvatarIcon/AvatarIcon";
import {
  Entity,
  EntityGroupByParent,
  EntityLevelNames,
  FiscalYearMonthKey,
  FiscalYears,
  MemberAccounts,
  MemberAccountsDealBoard,
} from "@/types";
import useDashboardStore from "@/store/useDashboardStore";
import { SpinnerBrand } from "@/components/Parts/SpinnerBrand/SpinnerBrand";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/ErrorFallback/ErrorFallback";
import { ProgressCircle } from "@/components/Parts/Charts/ProgressCircle/ProgressCircle";
import { ProgressNumber } from "@/components/Parts/Charts/ProgressNumber/ProgressNumber";
import { GradientModal } from "@/components/Parts/GradientModal/GradientModal";
import { EditModalDealCard } from "./EditModalDealCard/EditModalDealCard";
import { formatDisplayPrice } from "@/utils/Helpers/formatDisplayPrice";
import { SpinnerX } from "@/components/Parts/SpinnerX/SpinnerX";
import { TbSnowflake, TbSnowflakeOff } from "react-icons/tb";
import useStore from "@/store";
import { useQueryMemberListByParentEntity } from "@/hooks/useQueryMemberListByParentEntity";
import { useQueryClient } from "@tanstack/react-query";
import { mappingEntityName } from "@/utils/mappings";
import { AreaChartTrend } from "@/components/DashboardSalesTargetComponent/TargetContainer/UpsertTargetEntity/UpsertSettingTargetEntityGroup/AreaChartTrend/AreaChartTrend";
import { FallbackDealBoard } from "./DealBoard/FallbackDealBoard";
import { HiOutlineSelector } from "react-icons/hi";

type Props = {
  // memberList: Entity[];
  displayEntityGroup:
    | (EntityGroupByParent & { parent_entity_level: string; parent_entity_level_id: string; entity_level: string })
    | null;
  monthKey: FiscalYearMonthKey | null;
  // periodType: string;
  // period: number;
};

// 🌠各メンバーのネタ表を一覧で表示するコンポーネント
const ScreenDealBoardsMemo = ({ displayEntityGroup, monthKey }: Props) => {
  const language = useStore((state) => state.language);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const isOpenCongratulationsModal = useDashboardStore((state) => state.isOpenCongratulationsModal);
  const setIsOpenCongratulationsModal = useDashboardStore((state) => state.setIsOpenCongratulationsModal);
  const setIsRequiredInputSoldProduct = useDashboardStore((state) => state.setIsRequiredInputSoldProduct);
  const setSelectedRowDataProperty = useDashboardStore((state) => state.setSelectedRowDataProperty);
  const setIsOpenUpdatePropertyModal = useDashboardStore((state) => state.setIsOpenUpdatePropertyModal);
  // 期間
  const activePeriodSDB = useDashboardStore((state) => state.activePeriodSDB);
  // 上期か下期か
  const selectedPeriodTypeHalfDetailSDB = useDashboardStore((state) => state.selectedPeriodTypeHalfDetailSDB);
  // 🔹表示中の会計年度(グローバル)(SDB用)
  const selectedFiscalYearTargetSDB = useDashboardStore((state) => state.selectedFiscalYearTargetSDB);

  // 選択中のネタカード
  const selectedDealCard = useDashboardStore((state) => state.selectedDealCard);
  // ネタカードクリック時に表示する概要モーダル
  const isOpenDealCardModal = useDashboardStore((state) => state.isOpenDealCardModal);
  // 選択されたメンバーのidをDealBoardにpropsで渡す
  const activeThemeColor = useDashboardStore((state) => state.activeThemeColor);

  // stickyを付与するrow
  const [stickyRow, setStickyRow] = useState<string | null>(null);

  // 売上推移を表示する対象の切り替え用state 総合目標かサブ目標
  const [displayTypeForTrend, setDisplayTypeForTrend] = useState<"sub_entities" | "main_entity">("sub_entities");

  // 部門別の名称
  const getDivName = (level: EntityLevelNames) => {
    switch (level) {
      case "company":
        return language === "ja" ? `全社` : `Company`;
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

  // displayTypeForTrendがサブエンティティの時に、売上目標チャート(達成率)を表示するメンバー
  const [displaySubEntityForAchievement, setDisplaySubEntityForAchievement] = useState<{
    entity_id: string;
    entity_name: string;
    entity_level: string;
    entity_level_id: string;
  } | null>(() => {
    if (!displayEntityGroup) return null;
    if (!displayEntityGroup.parent_entity_id) return null;
    if (!displayEntityGroup.entities.length) return null;
    return {
      entity_id: displayEntityGroup.parent_entity_id,
      entity_name:
        displayEntityGroup.parent_entity_level === "company"
          ? getDivName("company")
          : displayEntityGroup.parent_entity_name,
      entity_level: displayEntityGroup.parent_entity_level,
      entity_level_id: displayEntityGroup.parent_entity_level_id,
    };
    // return displayEntityGroup.entities[0];
  });

  if (selectedFiscalYearTargetSDB === null) return null;

  if (!userProfileState || !userProfileState?.company_id) return null;

  // if (!periodType || !period) {
  if (!activePeriodSDB) {
    return (
      <div className="flex-center h-[80dvh] w-[100vw]">
        <span></span>
      </div>
    );
  }

  const queryClient = useQueryClient();

  const fiscalYearQueryData: FiscalYears | undefined = queryClient.getQueryData([
    "fiscal_year",
    "sales_target",
    selectedFiscalYearTargetSDB,
  ]);

  const entityIds = useMemo(() => {
    if (!displayEntityGroup) return null;
    return displayEntityGroup.entities.map((entity) => entity.entity_id);
  }, []);

  // 🔹売上目標が設定されている場合にはエンティティグループ内の各エンティティのメンバーアカウントデータを取得
  const {
    data: queryDataObjMemberGroupAndParentEntity,
    error: isErrorQueryMemberList,
    isLoading: IsLoadingQueryMemberList,
  } = useQueryMemberListByParentEntity({
    entityIds: entityIds,
    parentEntityLevelId: displayEntityGroup?.parent_entity_level_id ?? null,
    parentEntityLevel: displayEntityGroup?.parent_entity_level ?? null,
    parentEntityId: displayEntityGroup?.parent_entity_id ?? null,
    periodTypeForTarget: monthKey,
    periodTypeForSales: activePeriodSDB.periodType,
    period: activePeriodSDB.period,
    fiscalYearId: fiscalYearQueryData?.id ?? null,
    isReady: !!entityIds?.length && !!monthKey,
  });

  // // メンバーエンティティ
  // const selectedObjSectionSDBMember = useDashboardStore((state) => state.selectedObjSectionSDBMember);
  // const setSelectedObjSectionSDBMember = useDashboardStore((state) => state.setSelectedObjSectionSDBMember);

  const [memberList, setMemberList] = useState<
    // | (MemberAccounts & {
    | (MemberAccountsDealBoard & {
        company_id: string;
        company_name: string;
        current_sales_amount: number | null;
        current_sales_target: number | null;
        current_achievement_rate: number | null;
      })[]
    | null
  >(null);

  const displayMemberList = useMemo(() => {
    return queryDataObjMemberGroupAndParentEntity
      ? queryDataObjMemberGroupAndParentEntity.members_sales_data
      : memberList ?? null;
  }, [queryDataObjMemberGroupAndParentEntity, memberList]);

  // ネタ表ボードに渡すid配列に変換
  // const memberListSectionMember: MemberAccounts[] = useMemo(() => {
  //   if (!selectedObjSectionSDBMember) return [];
  //   const newIdList = [selectedObjSectionSDBMember];
  //   return newIdList;
  // }, [selectedObjSectionSDBMember]);

  // ------------------------- ✅初回マウント時✅ -------------------------
  // 売上目標と組織構成が未設定の場合には、自身のデータのみ表示する
  useEffect(() => {
    if (!userProfileState) return;
    // メンバーデータを取得できている場合はmemberListにセット
    if (queryDataObjMemberGroupAndParentEntity) return;

    if (
      displayEntityGroup === null ||
      (!!entityIds?.length && !!monthKey && queryDataObjMemberGroupAndParentEntity === null)
    ) {
      // 売上目標と組織構成が未設定の場合には、自身のデータのみ表示する
      // ユーザー自身を初期値にセット
      const u = userProfileState;
      const initialMemberObj = {
        id: u.id,
        created_at: u.created_at,
        updated_at: u.updated_at,
        avatar_url: u.avatar_url,
        is_subscriber: u.is_subscriber,
        company_role: u.company_role,
        role: u.role,
        stripe_customer_id: u.stripe_customer_id,
        last_name: u.last_name,
        first_name: u.first_name,
        email: u.email,
        department: u.department,
        position_name: u.position_name,
        position_class: u.position_class,
        direct_line: u.direct_line,
        company_cell_phone: u.company_cell_phone,
        personal_cell_phone: u.personal_cell_phone,
        occupation: u.occupation,
        direct_fax: u.direct_fax,
        signature_stamp_id: u.signature_stamp_id,
        employee_id: u.employee_id,
        is_active: u.is_active,
        profile_name: u.profile_name,
        accept_notification: u.accept_notification,
        first_time_login: u.first_time_login,
        office: u.office,
        section: u.section,
        unit: u.unit,
        usage: u.usage,
        purpose_of_use: u.purpose_of_use,
        subscribed_account_id: u.subscribed_account_id,
        account_created_at: u.account_created_at,
        account_company_role: u.account_company_role,
        account_state: u.account_state,
        account_invited_email: null,
        assigned_department_id: u.assigned_department_id,
        assigned_department_name: u.assigned_department_name,
        assigned_section_id: u.assigned_section_id,
        assigned_section_name: u.assigned_section_name,
        assigned_unit_id: u.assigned_unit_id,
        assigned_unit_name: u.assigned_unit_name,
        assigned_office_id: u.assigned_office_id,
        assigned_office_name: u.assigned_office_name,
        assigned_employee_id: u.assigned_employee_id,
        assigned_employee_id_name: u.assigned_employee_id_name,
        assigned_signature_stamp_id: u.assigned_signature_stamp_id,
        assigned_signature_stamp_url: u.assigned_signature_stamp_url,
        company_id: u.company_id,
        company_name: u.customer_name,
        target_type: u.target_type,
        current_sales_amount: null,
        current_sales_target: null,
        current_achievement_rate: null,
      } as MemberAccountsDealBoard & {
        company_id: string;
        company_name: string;
        current_sales_amount: number | null;
        current_sales_target: number | null;
        current_achievement_rate: number | null;
      };
      setMemberList([initialMemberObj]);
    }
  }, [displayEntityGroup]);
  // ------------------------- ✅初回マウント時✅ ここまで -------------------------

  // useEffectでメンバーリストが取得できた状態でJSXをレンダリングする
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isMounted) return;

    setIsMounted(true);
  }, []);

  // const FallbackDealBoard = () => {
  //   return (
  //     <div className={`flex-center h-[288px] w-full px-[24px] py-[12px]`}>
  //       <SpinnerX />
  //     </div>
  //   );
  // };

  // 受注済みに変更後に表示するモーダルの「反映する」ボタンクリック時に実行される関数
  const handleClickActiveSoldModal = () => {
    setIsOpenUpdatePropertyModal(true); // 案件編集モーダルを開く
    setIsRequiredInputSoldProduct(true); // 案件編集モーダルに受注後売上入力ステータスを渡す
    setIsOpenCongratulationsModal(false); // お祝いモーダルを閉じる
  };
  // 受注済みに変更後に表示するモーダルの「反映する」ボタンクリック時に実行される関数
  const handleClickCancelSoldModal = () => {
    setSelectedRowDataProperty(null); // 選択中のRowDataをリセット
    setIsOpenCongratulationsModal(false); // お祝いモーダルを閉じる
  };

  // -------------------------- 売上推移 --------------------------
  // 🌟売上推移で表示するperiodType テーブルの年度・上期・下期の表示期間のdisplayTargetPeriodTypeとは切り離して期間タイプ全てで管理する
  // 遡る年数
  const [yearsBack, setYearsBack] = useState(3); // SDBでは3年間遡り、目標は入れずに全て売上実績を表示する

  const trendPeriodTitle = useMemo(() => {
    if (!activePeriodSDB) return null;

    if (activePeriodSDB.periodType === "fiscal_year") {
      return {
        periodStart: `${activePeriodSDB.period - yearsBack}年度`,
        periodEnd: `${activePeriodSDB.period}年度`,
      };
    } else {
      const year = Number(activePeriodSDB.period.toString().substring(0, 4));
      const period = activePeriodSDB.period.toString().substring(4);
      // 04 => 4, 1 => 1
      let periodWithoutZero = period;
      if (activePeriodSDB.periodType === "year_month") {
        periodWithoutZero = String(parseInt(period, 10));
      }
      const back = yearsBack;
      return {
        periodStart:
          activePeriodSDB.periodType === "half_year"
            ? `${year - back}H${period}`
            : activePeriodSDB.periodType === "quarter"
            ? `${year - back}Q${period}`
            : activePeriodSDB.periodType === "year_month"
            ? `${year - back}年${periodWithoutZero}月度`
            : `${activePeriodSDB.period - yearsBack}年度`,
        periodEnd:
          activePeriodSDB.periodType === "half_year"
            ? `${year}H${period}`
            : activePeriodSDB.periodType === "quarter"
            ? `${year}Q${period}`
            : activePeriodSDB.periodType === "year_month"
            ? `${year}年${periodWithoutZero}月度`
            : `${activePeriodSDB.period}年度`,
      };
    }
  }, [activePeriodSDB, yearsBack]);

  // -------------------------- 売上推移 --------------------------
  // -------------------------- 売上総額・達成率 --------------------------
  // 売上総額・達成率の「2021H1」表示用
  const salesAchievementPeriodTitle = useMemo(() => {
    if (!activePeriodSDB) return `-`;

    if (activePeriodSDB.periodType === "fiscal_year") {
      return `${activePeriodSDB.period}年度`;
    } else {
      const year = Number(activePeriodSDB.period.toString().substring(0, 4));
      const period = parseInt(activePeriodSDB.period.toString().substring(4), 10);
      return activePeriodSDB.periodType === "half_year"
        ? `${year}H${period}`
        : activePeriodSDB.periodType === "quarter"
        ? `${year}Q${period}`
        : activePeriodSDB.periodType === "year_month"
        ? `${year}年${period}月度`
        : `-`;
    }
  }, [activePeriodSDB?.period]);
  // -------------------------- 売上総額・達成率 --------------------------

  // ===================== 🌟ツールチップ 3点リーダーの時にツールチップ表示🌟 =====================
  const hoveredItemPos = useStore((state) => state.hoveredItemPos);
  const setHoveredItemPos = useStore((state) => state.setHoveredItemPos);
  type TooltipParams = {
    // e: MouseEvent<HTMLDivElement, MouseEvent>;
    e: MouseEvent<HTMLDivElement | HTMLSpanElement, globalThis.MouseEvent>;
    // e: MouseEvent<HTMLElement, MouseEvent<Element, globalThis.MouseEvent>> | MouseEvent<HTMLDivElement, MouseEvent>;
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

  // --------------------------- 🌠子コンポーネントを順番にフェッチさせる🌠 ---------------------------
  const [currentActiveIndex, setCurrentActiveIndex] = useState(0); // 順番にフェッチを許可
  const [allFetched, setAllFetched] = useState(false); // サブ目標コンポーネントのフェッチが全て完了したらtrueに変更

  // 全子コンポーネントがフェッチ完了したかを監視
  useEffect(() => {
    if (!displayMemberList) return;
    // メンバーリストよりactiveIndexが大きくなった場合、全てフェッチが完了
    if (currentActiveIndex >= displayMemberList.length) {
      setAllFetched(true);
    }
  }, [currentActiveIndex]);

  // ネタ表を順番にフェッチ許可する
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

  // 全てのボードがマウントした後にProgressCircleをマウントさせる
  const [isRenderProgress, setIsRenderProgress] = useState(false);

  useEffect(() => {
    if (isRenderProgress) return;
    if (allFetched) {
      setTimeout(() => {
        setIsRenderProgress(true);
        console.log("ProgressCircleレンダリング");
      }, 1500);
    }
  }, [allFetched]);

  if (!isMounted)
    return (
      <div className={`flex-center w-full`} style={{ minHeight: `calc(732px - 87px)`, paddingBottom: `87px` }}>
        <SpinnerBrand withBorder withShadow />
      </div>
    );

  const getStyleTheme = () => {
    switch (activeThemeColor) {
      case "theme-brand-f":
        return ``;
      case "theme-brand-f-gradient":
        return `${styles.theme_f_gradient}`;
      case "theme-black-gradient":
        return `${styles.theme_black}`;
      case "theme-simple17":
        return `${styles.theme_simple17}`;
      case "theme-simple12":
        return `${styles.theme_simple12}`;
        break;
      default:
        return ``;
        break;
    }
  };

  console.log(
    "ScreenDealBoardsコンポーネントレンダリング",
    "displayEntityGroup",
    displayEntityGroup,
    "queryDataObjMemberGroupAndParentEntity",
    queryDataObjMemberGroupAndParentEntity,
    "memberList",
    memberList,
    "displayMemberList",
    displayMemberList,
    "entityIds",
    entityIds,
    "monthKey",
    monthKey,
    "activePeriodSDB",
    activePeriodSDB
  );

  return (
    <>
      {/* <section className={`${styles.company_table_screen} h-screen w-full bg-neutral-900 text-neutral-50`}> */}
      <section
        className={`${styles.screen_deal_boards} transition-bg05 w-full ${getStyleTheme()} ${
          stickyRow !== null ? `${styles.is_sticky}` : ``
        }`}
      >
        {/* ------------------- Row 売上推移・達成率チャートエリア ------------------- */}
        {!allFetched && (
          <div className={`flex-center fade08_forward mb-[20px] max-h-[369px] min-h-[369px] w-full`}>
            <SpinnerX />
          </div>
        )}
        {allFetched && (
          <div
            className={`${styles.grid_row} ${styles.col2} fade15_forward mb-[20px] min-h-[369px] w-full ${
              stickyRow === "row_trend" ? `${styles.sticky_row}` : ``
            }`}
          >
            <div className={`${styles.grid_content_card}`} style={{ minHeight: `369px` }}>
              <div className={`${styles.card_title_area}`}>
                <div className={`${styles.card_title}`}>
                  {/* <span>売上推移</span> */}
                  <div className={`flex flex-col`}>
                    <div className={`flex items-center`}>
                      <span>売上推移</span>
                      <span className={`ml-[18px]`}>
                        {displayEntityGroup && displayEntityGroup.parent_entity_id
                          ? displayTypeForTrend === "sub_entities"
                            ? `${mappingEntityName[displayEntityGroup.entity_level][language]}別`
                            : `${
                                displayEntityGroup.parent_entity_name === "company"
                                  ? getDivName("company")
                                  : displayEntityGroup.parent_entity_name
                              }`
                          : `${userProfileState.profile_name}`}
                      </span>
                    </div>
                    <span className={`text-[12px] text-[var(--color-text-sub)]`}>
                      {trendPeriodTitle ? (
                        <>
                          {trendPeriodTitle.periodStart} ~ {trendPeriodTitle.periodEnd}
                        </>
                      ) : (
                        <>{`-`}</>
                      )}
                    </span>
                  </div>
                </div>

                <div className={`flex h-full items-start justify-end pt-[3px]`}>
                  {displayEntityGroup && displayEntityGroup?.parent_entity_id && (
                    <div
                      className={`${styles.select_btn_wrapper} relative flex items-center text-[var(--color-text-title-g)]`}
                      onMouseEnter={(e) => {
                        let tooltipContent = `チャート表示対象を切り替える`;
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
                        <option value={"sub_entities"}>
                          {mappingEntityName[displayEntityGroup.entity_level][language]}別
                        </option>
                        <option value={"main_entity"}>
                          {displayEntityGroup.parent_entity_level === "company"
                            ? getDivName("company")
                            : displayEntityGroup.parent_entity_name}
                        </option>
                      </select>
                      <div className={`${styles.select_arrow}`}>
                        {/* <IoChevronDownOutline className={`text-[12px]`} /> */}
                        <HiOutlineSelector className="stroke-[2] text-[16px]" />
                      </div>
                    </div>
                  )}
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
                  <AreaChartTrend
                    companyId={userProfileState.company_id}
                    entityLevel={
                      displayEntityGroup && displayEntityGroup.parent_entity_id
                        ? displayTypeForTrend === "main_entity"
                          ? displayEntityGroup.parent_entity_level
                          : displayEntityGroup.entity_level
                        : "member"
                    }
                    entityIdsArray={
                      displayTypeForTrend === "main_entity" && displayEntityGroup?.parent_entity_id
                        ? [displayEntityGroup.parent_entity_id]
                        : entityIds
                        ? entityIds
                        : [userProfileState.id]
                    }
                    periodType={activePeriodSDB.periodType}
                    basePeriod={activePeriodSDB.period}
                    yearsBack={yearsBack} // デフォルトはbasePeriodの年から2年遡って過去3年分を表示する
                    fetchEnabled={true}
                    selectedFiscalYear={selectedFiscalYearTargetSDB}
                    hoveringLegendBg={`var(--sdb-card-bg-chart-legend)`}
                  />
                </Suspense>
              </ErrorBoundary>
              {/* <div className={`${styles.main_container} flex-center`}>
                  <div
                    className={`flex h-full w-full items-center justify-center text-[13px] text-[var(--color-text-sub)]`}
                  >
                    <span>売上目標が設定されていません。</span>
                  </div>
                </div> */}
            </div>

            {/* 売上進捗・達成率チャート */}
            {/* 選択中の月度が上期の場合には上期の売上目標が設定済みであること・月度が下期の場合には下期の売上目標が設定済みであることをチェックし、trueなら売上目標チャートを表示 */}
            {displayEntityGroup !== null &&
            !!queryDataObjMemberGroupAndParentEntity &&
            !!fiscalYearQueryData &&
            ((selectedPeriodTypeHalfDetailSDB === "first_half_details" &&
              fiscalYearQueryData.is_confirmed_first_half_details) ||
              (selectedPeriodTypeHalfDetailSDB === "second_half_details" &&
                fiscalYearQueryData.is_confirmed_second_half_details)) ? (
              <div className={`${styles.grid_content_card}`} style={{ minHeight: `300px` }}>
                <div className={`${styles.card_title_area} !items-start`}>
                  <div className={`${styles.card_title}`}>
                    <div className={`flex flex-col`}>
                      <div className={`flex items-center`}>
                        <span>売上進捗・達成率</span>
                        <span className={`ml-[18px]`}>
                          {queryDataObjMemberGroupAndParentEntity && displaySubEntityForAchievement
                            ? displaySubEntityForAchievement.entity_name
                            : userProfileState.profile_name}
                        </span>
                      </div>
                      <span className={`text-[12px] text-[var(--color-text-sub)]`}>{salesAchievementPeriodTitle}</span>
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
                      const entityId = "row_trend";
                      if (!entityId) return;
                      if (entityId === stickyRow) {
                        setStickyRow(null);
                      } else {
                        setStickyRow(entityId);
                      }
                      handleCloseTooltip();
                    }}
                  >
                    {stickyRow === "row_trend" && <TbSnowflakeOff />}
                    {stickyRow !== "row_trend" && <TbSnowflake />}
                    {stickyRow === "row_trend" && <span>解除</span>}
                    {stickyRow !== "row_trend" && <span>固定</span>}
                  </div>
                </div>
                <div className={`${styles.main_container} flex-center`}>
                  <div
                    className={`flex h-full w-full items-center justify-center text-[13px] text-[var(--color-text-sub)]`}
                  >
                    <span>売上目標が設定されていません。</span>
                  </div>
                </div>
                {/* <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <Suspense
                    fallback={
                      <div className={`flex-center w-full`} style={{ minHeight: `302px`, padding: `0px 0px 6px` }}>
                        <SpinnerX />
                      </div>
                    }
                  >
                    <ProgressCircleSalesAchievement
                      fiscalYear={selectedFiscalYearTargetSDB}
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
                </ErrorBoundary> */}
              </div>
            ) : (
              <div className={`${styles.grid_content_card}`}>
                <div className={`${styles.card_wrapper} fade08_forward`}>
                  <div className={`${styles.card_title_area}`}>
                    <div className={`${styles.card_title}`}>
                      <span>売上目標シェア</span>
                    </div>

                    <div className={`${styles.btn} ${styles.basic} space-x-[4px]`}>
                      <span>固定</span>
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
            )}
          </div>
        )}
        {/* ------------------- Row 売上推移・達成率チャートエリア ------------------- */}

        {/* ------------------- ネタ表ボード ------------------- */}
        {displayMemberList &&
          displayMemberList.map((memberObj, tableIndex) => {
            return (
              <Fragment key={`${memberObj.id}_${tableIndex}_board`}>
                {(tableIndex <= currentActiveIndex || allFetched) && (
                  <div
                    // className={`${styles.entity_board_container} bg-[red]/[0]`}
                    className={`${styles.entity_board_container} fade15_forward bg-[red]/[0] ${
                      stickyRow === `deal_board_${memberObj.id}` ? `${styles.sticky_row}` : ``
                    }`}
                    // className={`${styles.entity_board_container} bg-[red]/[0] ${isRenderProgress ? `${styles.fade_bg}` : ``}
                    //  ${activeThemeColor === "theme-brand-f" ? `` : ``}
                    //  ${activeThemeColor === "theme-brand-f-gradient" ? `${styles.theme_f_gradient}` : ``}
                    //  ${activeThemeColor === "theme-black-gradient" ? `${styles.theme_black}` : ``}
                    // ${activeThemeColor === "theme-simple17" ? `${styles.theme_simple17}` : ``} ${
                    //   activeThemeColor === "theme-simple12" ? `${styles.theme_simple12}` : ``
                    // } ${stickyRow === `deal_board_${index}` ? `${styles.sticky_row}` : ``}`}
                  >
                    {/* <div className={`${styles.entity_detail_container} fade08_forward bg-[green]/[0]`}>
                    <div className={`${styles.entity_detail_wrapper}`}>
                      <div className={`${styles.entity_detail} space-x-[12px] text-[12px]`}>
                        <AvatarIcon
                          // size={33}
                          size={36}
                          name={memberObj.profile_name ?? "未設定"}
                          withCircle={false}
                          hoverEffect={false}
                          textSize={16}
                          // imgUrl={memberObj.avatar_url ?? null}
                        />
                        <div className={`${styles.entity_name} text-[19px] font-bold`}>
                          <span>{memberObj.profile_name}</span>
                        </div>
                        <div className={`${styles.sub_info} pt-[6px]`}>{memberObj.position_name ?? "役職未設定"}</div>
                        <div className={`${styles.sub_info} pt-[6px]`}>{memberObj.assigned_employee_id_name ?? ""}</div>
                        <div
                          className={`relative !ml-[24px] !mr-[12px] flex h-full min-h-[56px] w-auto items-end bg-[red]/[0]`}
                        >
                          <div className="flex h-full min-w-[150px] items-end justify-end">
                            <ProgressNumber
                              targetNumber={6200000}
                              // targetNumber={0}
                              // startNumber={Math.round(68000 / 2)}
                              // startNumber={Number((68000 * 0.1).toFixed(0))}
                              startNumber={0}
                              duration={3000}
                              easeFn="Quintic"
                              fontSize={27}
                              fontWeight={500}
                              margin="0 0 -3px 0"
                              isReady={isRenderProgress}
                              fade={`fade08_forward`}
                            />
                          </div>
                          <div className="relative h-full min-w-[33px]">
                            <div className="absolute left-[66%] top-[68%] min-h-[2px] w-[30px] translate-x-[-50%] translate-y-[-50%] rotate-[120deg] bg-[var(--color-text-title)]"></div>
                          </div>
                          <div className="mr-[12px] flex h-full min-w-max items-end justify-start">
                            <span className="text-[16px]">9,000,000</span>
                          </div>
                        </div>
                        <div className={`relative h-[56px] w-[56px]`} style={{ margin: `0` }}>
                          <div className="absolute bottom-[-6px] right-0">
                            <ProgressCircle
                              circleId={`${memberObj.id}_${tableIndex}_board`}
                              textId={`${memberObj.id}_${tableIndex}_board`}
                              progress={78}
                              // progress={100}
                              // progress={0}
                              duration={5000}
                              easeFn="Quartic"
                              size={56}
                              strokeWidth={6}
                              fontSize={11}
                              textColor="var(--color-text-title)"
                              isReady={isRenderProgress}
                              fade={`fade08_forward`}
                              // fade={`fade10_forward`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={`${styles.status_col_wrapper}`}>
                      <div className={`flex h-full items-start pt-[10px]`}>
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
                            const entityId = `deal_board_${memberObj.id}`;
                            if (!entityId) return;
                            if (entityId === stickyRow) {
                              setStickyRow(null);
                            } else {
                              setStickyRow(entityId);
                            }
                            handleCloseTooltip();
                          }}
                        >
                          {stickyRow === `deal_board_${memberObj.id}` && <TbSnowflakeOff />}
                          {stickyRow !== `deal_board_${memberObj.id}` && <TbSnowflake />}
                          {stickyRow === `deal_board_${memberObj.id}` && <span>解除</span>}
                          {stickyRow !== `deal_board_${memberObj.id}` && <span>固定</span>}
                        </div>
                      </div>
                    </div>
                  </div> */}
                    <ErrorBoundary FallbackComponent={ErrorFallback}>
                      <Suspense fallback={<FallbackDealBoard memberObj={memberObj} isFade={true} />}>
                        <DealBoard
                          companyId={userProfileState.company_id!}
                          userId={memberObj.id}
                          memberObj={memberObj}
                          stickyRow={stickyRow}
                          setStickyRow={setStickyRow}
                          // periodType={activePeriodSDB.periodType}
                          // period={activePeriodSDB.period}
                          onFetchComplete={() => onFetchComplete(tableIndex)} // ネタ表ボードのindexを渡す
                          fetchEnabled={tableIndex === currentActiveIndex || allFetched} // インデックスが一致しているか、全てフェッチが完了している時のみフェッチを許可
                          isRenderProgress={isRenderProgress}
                        />
                      </Suspense>
                    </ErrorBoundary>
                    {/* <FallbackDealBoard /> */}
                  </div>
                )}
                {/* {isRenderProgress && (
                <div className="flex-center fade08_forward my-[12px] w-full px-[24px]">
                  <hr className="min-h-[1px] w-full bg-[var(--color-border-base)]" />
                </div>
              )} */}
              </Fragment>
            );
          })}

        {/* ------------------- ネタ表ボードここまで ------------------- */}

        {/* ------------------- テスト ------------------- */}
        {/* {Array(3)
          .fill(null)
          .map((_, index) => (
            <div key={`${index}_board`} className={`${styles.entity_board_container} bg-[red]/[0]`}>
              <div className={`${styles.entity_detail_container} bg-[green]/[0]`}>
                <div className={`${styles.entity_detail_wrapper}`}>
                  <div className={`${styles.entity_detail} space-x-[12px] text-[12px]`}>
                    <AvatarIcon size={33} name="伊藤謙太" withCircle={false} hoverEffect={false} />
                    <div className={`${styles.entity_name} text-[19px] font-bold`}>
                      <span>伊藤 謙太</span>
                    </div>
                    <div className={`${styles.sub_info} pt-[6px]`}>代表取締役</div>
                    <div className={`${styles.sub_info} pt-[6px]`}>216088</div>
                  </div>
                </div>
              </div>
              <DealBoard />
            </div>
          ))} */}
        {/* ------------------- テストここまで ------------------- */}
      </section>
      {/* ------------------- ネタ表 詳細・編集モーダル ------------------- */}
      {/* {isOpenDealCardModal && selectedDealCard && <EditModalDealCard />} */}
      {/* ------------------- ネタ表 詳細・編集モーダル ここまで ------------------- */}
      {/* ------------------- 受注済みに変更後の売上入力モーダル ------------------- */}
      {isOpenCongratulationsModal && (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<div></div>}>
            <GradientModal
              title1="受注おめでとう🎉"
              title2="ダッシュボードに売上を反映させましょう！"
              tagText="受注"
              contentText="受注済みの案件に「売上商品・売上価格・売上日付」を記録することでダッシュボード上に売上実績と達成率が反映されます。"
              btnActiveText="反映する"
              btnCancelText="閉じる"
              illustText="受注おめでとうございます！"
              handleClickActive={handleClickActiveSoldModal}
              handleClickCancel={handleClickCancelSoldModal}
            />
          </Suspense>
        </ErrorBoundary>
      )}
      {/* ------------------- 受注済みに変更後の売上入力モーダル ここまで ------------------- */}
    </>
  );
};

export const ScreenDealBoards = memo(ScreenDealBoardsMemo);
