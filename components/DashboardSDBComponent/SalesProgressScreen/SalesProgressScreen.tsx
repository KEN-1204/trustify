import {
  Dispatch,
  DragEvent,
  FormEvent,
  MouseEvent,
  SetStateAction,
  Suspense,
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "../DashboardSDBComponent.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { IoCaretDownOutline, IoChevronDownOutline } from "react-icons/io5";
import { MdOutlineDataSaverOff } from "react-icons/md";
import { BsCheck2 } from "react-icons/bs";
import useStore from "@/store";
import {
  PeriodOption,
  getOptionsCalendarYear,
  getOptionsFiscalYear,
  mappingSdbTabName,
  mappingSectionName,
  optionsFiscalHalf,
  optionsFiscalMonth,
  optionsFiscalQuarter,
  periodList,
  sdbTabsList,
  sectionList,
} from "@/utils/selectOptions";
import { ScreenDealBoards } from "../ScreenDealBoards/ScreenDealBoards";
import { calculateDateToYearMonth } from "@/utils/Helpers/calculateDateToYearMonth";
import {
  EntityGroupByParent,
  FiscalYearAllKeys,
  FiscalYearMonthKey,
  HalfYearKey,
  MemberAccounts,
  PeriodSDB,
  PopupDescMenuParams,
  PropertiesPeriodKey,
  QuarterKey,
  SectionMenuParams,
} from "@/types";
import { ImInfo } from "react-icons/im";
import { calculateFiscalYearStart } from "@/utils/Helpers/calculateFiscalYearStart";
import { SpinnerBrand } from "@/components/Parts/SpinnerBrand/SpinnerBrand";
import { FaExchangeAlt } from "react-icons/fa";
import { GrPowerReset } from "react-icons/gr";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/ErrorFallback/ErrorFallback";
import { calculateFiscalYearMonths } from "@/utils/Helpers/CalendarHelpers/calculateFiscalMonths";
import { calculateCurrentFiscalYear } from "@/utils/Helpers/calculateCurrentFiscalYear";
import { calculateCurrentFiscalYearEndDate } from "@/utils/Helpers/calcurateCurrentFiscalYearEndDate";
import { useQueryFiscalYear } from "@/hooks/useQueryFiscalYear";
import { useQueryEntityLevels } from "@/hooks/useQueryEntityLevels";
import { useQueryEntities } from "@/hooks/useQueryEntities";
import { FallbackSalesProgressScreen } from "./FallbackSalesProgressScreen";
import { useQueryClient } from "@tanstack/react-query";

const SalesProgressScreenMemo = () => {
  const language = useStore((state) => state.language);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  // ダッシュボード
  const activeTabSDB = useDashboardStore((state) => state.activeTabSDB);
  const setActiveTabSDB = useDashboardStore((state) => state.setActiveTabSDB);
  // エンティティセクション
  const activeSectionSDB = useDashboardStore((state) => state.activeSectionSDB);
  const setActiveSectionSDB = useDashboardStore((state) => state.setActiveSectionSDB);
  // 期間
  const activePeriodSDB = useDashboardStore((state) => state.activePeriodSDB);
  const setActivePeriodSDB = useDashboardStore((state) => state.setActivePeriodSDB);
  // 選択中の期間が上期か下期か(SDB用)
  const selectedPeriodTypeHalfDetailSDB = useDashboardStore((state) => state.selectedPeriodTypeHalfDetailSDB);
  const setSelectedPeriodTypeHalfDetailSDB = useDashboardStore((state) => state.setSelectedPeriodTypeHalfDetailSDB);

  const [activePeriodSDBLocal, setActivePeriodSDBLocal] = useState<{
    // periodType: FiscalYearAllKeys;
    // periodType: PropertiesPeriodKey;
    periodType: "fiscal_year" | "half_year" | "quarter" | "year_month";
    period: number;
  } | null>(null);

  // ローディングリフレッシュ
  const [isLoadingRefresh, setIsLoadingRefresh] = useState(false);

  // // 半期のSetオブジェクト
  // const halfYearKeySet = useMemo(() => new Set<HalfYearKey>(["first_half", "second_half"]), []);
  // // 四半期のSetオブジェクト
  // const quarterKeySet = useMemo(
  //   () => new Set<QuarterKey>(["first_quarter", "second_quarter", "third_quarter", "fourth_quarter"]),
  //   []
  // );
  // // month_xxのSetオブジェクト
  // const monthKeySet = useMemo(
  //   () =>
  //     new Set<FiscalYearMonthKey>([
  //       "month_01",
  //       "month_02",
  //       "month_03",
  //       "month_04",
  //       "month_05",
  //       "month_06",
  //       "month_07",
  //       "month_08",
  //       "month_09",
  //       "month_10",
  //       "month_11",
  //       "month_12",
  //     ]),
  //   []
  // );

  // infoアイコン
  const infoIconProgressRef = useRef<HTMLDivElement | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleErrorReturn = () => {
    // setUpsertSettingEntitiesObj(null);
    // setUpsertTargetMode(null);
    return null;
  };

  if (!userProfileState) return handleErrorReturn();
  if (!userProfileState.company_id) return handleErrorReturn();

  const queryClient = useQueryClient();

  // --------------------------- 変数定義 ---------------------------

  // 🔹表示中の会計年度(グローバル)(SDB用)
  const selectedFiscalYearTargetSDB = useDashboardStore((state) => state.selectedFiscalYearTargetSDB);
  const setSelectedFiscalYearTargetSDB = useDashboardStore((state) => state.setSelectedFiscalYearTargetSDB);

  // 🔹現在の会計年度
  const currentFiscalYear = useMemo(
    () =>
      calculateCurrentFiscalYear({
        fiscalYearEnd: userProfileState?.customer_fiscal_end_month ?? null,
        fiscalYearBasis: userProfileState?.customer_fiscal_year_basis ?? null,
      }),
    []
  );

  // 🔹初回マウント時に現在の会計年度をZustandにセット
  useEffect(() => {
    // 🔸会計年度をセット
    setSelectedFiscalYearTargetSDB(currentFiscalYear);
  }, []);

  // 🔹現在の日付の会計年度の決算日Dateオブジェクト(現在の会計年度の決算日Date) 決算日を取得して変数に格納
  const currentFiscalYearEndDate = useMemo(() => {
    return (
      calculateCurrentFiscalYearEndDate({
        fiscalYearEnd: userProfileState?.customer_fiscal_end_month ?? null,
        selectedYear: currentFiscalYear,
      }) ?? new Date(new Date().getFullYear(), 2, 31)
    );
  }, [userProfileState?.customer_fiscal_end_month]);
  // 🔹選択した会計年度の決算日Dateオブジェクト(現在の会計年度の決算日Date) 決算日を取得して変数に格納
  const fiscalYearEndDate = useMemo(() => {
    return (
      calculateCurrentFiscalYearEndDate({
        fiscalYearEnd: userProfileState?.customer_fiscal_end_month ?? null,
        selectedYear: selectedFiscalYearTargetSDB ?? currentFiscalYear,
      }) ?? new Date(new Date().getFullYear(), 2, 31)
    );
  }, [userProfileState?.customer_fiscal_end_month, selectedFiscalYearTargetSDB]);

  // // 決算日を取得して変数に格納
  // const fiscalYearEndDate = useMemo(() => {
  //   return userProfileState?.customer_fiscal_end_month
  //     ? new Date(userProfileState.customer_fiscal_end_month)
  //     : new Date(new Date().getFullYear(), 2, 31);
  // }, [userProfileState?.customer_fiscal_end_month]);

  // 🔹現在の会計年度の期首のDateオブジェクト(現在の日付からユーザーの会計年度を取得)
  const fiscalYearStartDateObj = useMemo(() => {
    return (
      calculateFiscalYearStart({
        fiscalYearEnd: fiscalYearEndDate,
        fiscalYearBasis: userProfileState?.customer_fiscal_year_basis ?? "firstDayBasis",
        selectedYear: selectedFiscalYearTargetSDB ?? currentFiscalYear,
      }) ?? new Date()
    );
  }, [fiscalYearEndDate]);

  // 🔹現在の顧客の会計年月度 202303(SDB用)
  const currentFiscalStartYearMonthSDB = useDashboardStore((state) => state.currentFiscalStartYearMonthSDB);
  const setCurrentFiscalStartYearMonthSDB = useDashboardStore((state) => state.setCurrentFiscalStartYearMonthSDB);
  // 🔹売上目標・前年度売上フェッチ時の年月度の12ヶ月分の配列(SDB用)
  const annualFiscalMonthsSDB = useDashboardStore((state) => state.annualFiscalMonthsSDB);
  const setAnnualFiscalMonthsSDB = useDashboardStore((state) => state.setAnnualFiscalMonthsSDB);

  // 年月度のカレンダー年を除く月部分のみをvalueにセットしたannualFiscalMonthsSDBを生成
  const annualFiscalMonthWithoutYearToMonthKeyMap = useMemo(() => {
    if (!annualFiscalMonthsSDB) return null;
    const _newMonths = new Map(
      Object.entries(annualFiscalMonthsSDB).map(([monthKey, value]) => {
        const firstYearMonthStr = String(value);
        const _month = firstYearMonthStr.substring(4); // 月部分のみ取得
        return [_month, monthKey as FiscalYearMonthKey];
        // return { [_month]: monthKey as FiscalYearMonthKey };
      })
    );
    return _newMonths;
  }, [annualFiscalMonthsSDB]);

  // 🔹ユーザーの会計年度の期首と期末のDateオブジェクト(SDB用)
  const fiscalYearStartEndDateSDB = useDashboardStore((state) => state.fiscalYearStartEndDateSDB);
  const setFiscalYearStartEndDateSDB = useDashboardStore((state) => state.setFiscalYearStartEndDateSDB);

  // ユーザーの会計基準の現在の月度を初期値にセットする
  useEffect(() => {
    // 🔸顧客の期首と期末のDateオブジェクトをセット
    setFiscalYearStartEndDateSDB({ startDate: fiscalYearStartDateObj, endDate: fiscalYearEndDate });

    // 🔸顧客の選択している会計年度の開始年月度 期首の年月度を6桁の数値で取得 202404
    const newStartYearMonth = calculateDateToYearMonth(fiscalYearStartDateObj, fiscalYearEndDate.getDate());
    setCurrentFiscalStartYearMonthSDB(newStartYearMonth);

    // 🔸年度初めから12ヶ月分の年月度の配列
    const fiscalMonths = calculateFiscalYearMonths(newStartYearMonth);
    setAnnualFiscalMonthsSDB(fiscalMonths);
    // // 🔸前年度の年度初めから12ヶ月分の年月度の配列
    // const lastStartYearMonth = newStartYearMonth - 100;
    // const lastFiscalMonths = calculateFiscalYearMonths(lastStartYearMonth);
    // setLastAnnualFiscalMonthsSDB(lastFiscalMonths);

    // 現在の日付からユーザーの財務サイクルに応じた年月度を取得(年月度の年はカレンダー年)
    const currentFiscalYearMonth = calculateDateToYearMonth(new Date(), fiscalYearEndDate.getDate());
    // 現在のカレンダー年月度を表示するため、currentFiscalYearMonthの月度を取り出してmonth_xxに結合してperiodTypeにセット
    // const currentFiscalMonth = `month_${String(currentFiscalYearMonth).substring(4)}` as FiscalYearMonthKey; // 0あり month_04, month_12
    // if (monthKeySet.has(currentFiscalMonth)) {
    if (String(currentFiscalYearMonth).length === 6) {
      const newCurrentPeriod = {
        // periodType: currentFiscalMonth as FiscalYearAllKeys,
        periodType: "year_month",
        period: currentFiscalYearMonth,
      } as PeriodSDB;
      console.log("✅newCurrentPeriod", newCurrentPeriod, "決算日Date", fiscalYearEndDate);
      setActivePeriodSDB(newCurrentPeriod);

      // 上期と下期どちらを選択中か更新
      const firstHalfDetailSet = new Set([
        String(fiscalMonths.month_01).substring(4),
        String(fiscalMonths.month_02).substring(4),
        String(fiscalMonths.month_03).substring(4),
        String(fiscalMonths.month_04).substring(4),
        String(fiscalMonths.month_05).substring(4),
        String(fiscalMonths.month_06).substring(4),
      ]);
      const _newMonth = String(currentFiscalYearMonth).substring(4);
      const newHalfDetail = firstHalfDetailSet.has(_newMonth) ? "first_half_details" : "second_half_details";
      setSelectedPeriodTypeHalfDetailSDB(newHalfDetail);
    } else {
      setErrorMsg("エラー：会計年月度が取得できませんでした...🙇‍♀️");
    }
    // const newCurrentPeriod = { periodType: "monthly", period: currentFiscalYearMonth } as PeriodSDB;
  }, [fiscalYearStartDateObj]);

  // 月度用カレンダー年の選択年(ローカル)
  const [selectedCalendarYear, setSelectedCalendarYear] = useState<number>(new Date().getFullYear());
  // 四半期、半期用の会計年度の選択年(ローカル)
  const [selectedFiscalYearLocal, setSelectedFiscalYearLocal] = useState<number>(fiscalYearStartDateObj.getFullYear());

  // 会計年度の選択肢
  const optionsFiscalYear = useMemo(() => {
    if (!userProfileState?.customer_fiscal_end_month) return [];

    return getOptionsFiscalYear({
      fiscalYearEnd: userProfileState.customer_fiscal_end_month,
      fiscalYearBasis: userProfileState?.customer_fiscal_year_basis ?? "firstDayBasis",
      currentFiscalYearEndDate: currentFiscalYearEndDate,
    });
  }, [userProfileState?.customer_fiscal_end_month, userProfileState?.customer_fiscal_year_basis]);

  // カレンダー年の選択肢 202304始まりの2023年度が会計年度なら202403の決算月の2024も年月度に含まれるため現在の会計年度の年月度のカレンダー年を選択肢にセットする
  const optionsCalendarYear = useMemo(() => {
    return getOptionsCalendarYear({ currentFiscalYearEndDate: currentFiscalYearEndDate });
  }, [currentFiscalYearEndDate]);

  const selectedPeriodWithoutYear = useMemo(() => {
    if (!activePeriodSDBLocal) return null;
    return activePeriodSDBLocal.periodType === "fiscal_year"
      ? activePeriodSDBLocal.period.toString().slice(0, 4)
      : activePeriodSDBLocal.period.toString().slice(4);
  }, [activePeriodSDBLocal]);

  // 期間選択メニューの選択肢を期間タイプに応じて取得する関数
  // const getPeriodTimeValue = (period: FiscalYearAllKeys): PeriodOption[] => {
  const getPeriodTimeValue = (period: "fiscal_year" | "half_year" | "quarter" | "year_month"): PeriodOption[] => {
    switch (period) {
      // case "fiscal_year":
      //   return optionsFiscalYear;
      // case "first_half":
      // case "second_half":
      //   return optionsFiscalHalf;
      // case "first_quarter":
      // case "second_quarter":
      // case "third_quarter":
      // case "fourth_quarter":
      //   return optionsFiscalQuarter;
      // case "month_01":
      // case "month_02":
      // case "month_03":
      // case "month_04":
      // case "month_05":
      // case "month_06":
      // case "month_07":
      // case "month_08":
      // case "month_09":
      // case "month_10":
      // case "month_11":
      // case "month_12":
      //   return optionsFiscalMonth;
      case "fiscal_year":
        return optionsFiscalYear;
      case "half_year":
        return optionsFiscalHalf;
      case "quarter":
        return optionsFiscalQuarter;
      case "year_month":
        return optionsFiscalMonth;

      default:
        return [];
        break;
    }
  };

  // ------------------------- 🌟useQuery売上目標 年度・レベル・エンティティ🌟 -------------------------
  // ================================ 🌟設定済み年度useQuery🌟 ================================
  // const fiscalYearsQueryData = queryClient.getQueriesData(["fiscal_years", "sales_target"]);
  const {
    data: fiscalYearQueryData,
    isLoading: isLoadingQueryFiscalYear,
    isError: isErrorQueryFiscalYear,
  } = useQueryFiscalYear(
    userProfileState.company_id,
    "sales_target",
    selectedFiscalYearTargetSDB ?? currentFiscalYear,
    true
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
    selectedFiscalYearTargetSDB ?? currentFiscalYear,
    "sales_target",
    true
  );
  // { エンティティレベル名: エンティティレベルオブジェクト }のMapオブジェクト
  const entityLevelsMap = useMemo(() => {
    if (!entityLevelsQueryData) return null;
    return new Map(entityLevelsQueryData.map((levelObj) => [levelObj.entity_level, levelObj]));
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
    selectedFiscalYearTargetSDB ?? currentFiscalYear,
    "sales_target",
    entityLevelIds,
    isSuccessQueryLevel
  );
  // ===================== 🌠エンティティuseQuery🌠 =====================
  // ------------------------- 🌟useQuery売上目標 年度・レベル・エンティティ🌟 ここまで -------------------------

  // 🔹entitiesHierarchyQueryDataからメンバーレベルの全てのエンティティグループから自分が所属する親エンティティグループを取得
  const initialMemberGroupByParentEntity = useMemo(() => {
    if (!fiscalYearQueryData) return null;
    // 上期詳細、下期詳細の売上目標がどちらも未設定の場合はnullを返し、ユーザー自身のみの売上推移とネタ表を表示し、売上目標チャートは非表示
    if (!fiscalYearQueryData.is_confirmed_first_half_details && !fiscalYearQueryData.is_confirmed_second_half_details)
      return null;
    if (!entitiesHierarchyQueryData) return null;
    const memberGroups = entitiesHierarchyQueryData.member;
    if (!memberGroups?.length) return null;
    const flattenedMemberGroups = memberGroups.map((group) => group.entities).flatMap((array) => array);
    if (!flattenedMemberGroups?.length) return null;
    const myEntityObj = flattenedMemberGroups.find((member) => member.entity_id === userProfileState.id);
    if (!myEntityObj) return null;
    const myMemberGroup = memberGroups.find((group) => group.parent_entity_id === myEntityObj.parent_entity_id);
    if (!myMemberGroup) return null;
    return {
      ...myMemberGroup,
      parent_entity_level: myEntityObj.parent_entity_level,
      parent_entity_level_id: myEntityObj.parent_entity_level_id,
      entity_level: myEntityObj.entity_level,
    } as EntityGroupByParent & { parent_entity_level: string; parent_entity_level_id: string; entity_level: string };
  }, [entitiesHierarchyQueryData]);

  const [displayEntityGroup, setDisplayEntityGroup] = useState<
    (EntityGroupByParent & { parent_entity_level: string; parent_entity_level_id: string; entity_level: string }) | null
  >(null);

  // ✅初回マウント時 現在の会計年度の売上目標とエンティティ構成が設定されている場合はZustandにセット
  useEffect(() => {
    if (!initialMemberGroupByParentEntity) return;

    setDisplayEntityGroup(initialMemberGroupByParentEntity);
  }, []);

  // --------------------------- 変数定義 ここまで ---------------------------

  const [openSectionMenu, setOpenSectionMenu] = useState<{
    x?: number;
    y: number;
    title?: string;
    displayX?: string;
    maxWidth?: number;
    fadeType?: string;
  } | null>(null);

  // 説明メニュー(onClickイベントで開いてホバー可能な状態はisHoverableをtrueにする)
  const [openPopupMenu, setOpenPopupMenu] = useState<{
    x?: number;
    y: number;
    title: string;
    displayX?: string;
    maxWidth?: number;
    fadeType?: string;
    isHoverable?: boolean;
  } | null>(null);

  const sectionMenuRef = useRef<HTMLDivElement | null>(null);

  // -------------------------- 🌟セクションメニュー🌟 --------------------------
  const handleOpenSectionMenu = ({ e, title, displayX, maxWidth, fadeType }: SectionMenuParams) => {
    if (!displayX || displayX === "center") {
      const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
      const positionY = y + height + 6;
      let positionX = x;
      if (displayX === "center") positionX = x + width / 2;
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
      positionX = displayX === "right" ? -18 - 50 - (maxWidth ?? 400) : 0;
      positionX = displayX === "left" ? window.innerWidth - x : 0;
      //   positionX = displayX === "center" ? x + width / 2 : 0;
      console.log("クリック", displayX, e, x, y, width, height);

      setOpenSectionMenu({
        x: positionX,
        y: y,
        title: title,
        displayX: displayX,
        maxWidth: maxWidth,
        fadeType: fadeType,
      });
    }
  };

  // メニューを開いた時に左下、真ん中、右下に表示する位置を動的に変更
  useEffect(() => {
    if (!openSectionMenu?.displayX || openSectionMenu?.displayX !== "center") return;
    if (openSectionMenu?.displayX === "center" && sectionMenuRef.current && openSectionMenu.x) {
      const menuWith = sectionMenuRef.current.getBoundingClientRect().width;
      const newX = openSectionMenu.x - menuWith / 2;
      console.log("🔥newX", newX, menuWith, openSectionMenu.x);
      setOpenSectionMenu({ ...openSectionMenu, x: newX });
    }
  }, [openSectionMenu?.displayX]);

  // 🔹メニューを閉じる
  const handleCloseSectionMenu = () => {
    if (openSectionMenu?.title === "period") {
      setActivePeriodSDBLocal(null);
    }
    setOpenSectionMenu(null);
  };
  // -------------------------- 🌟セクションメニュー🌟 --------------------------

  // -------------------------- 🌟説明ポップアップメニュー🌟 --------------------------
  const handleOpenPopupMenu = ({ e, title, displayX, maxWidth, fadeType, isHoverable }: PopupDescMenuParams) => {
    if (!displayX) {
      const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
      const positionY = y + height + 6;
      const positionCenter = x;
      console.log("クリック", y);
      setOpenPopupMenu({
        y: positionY,
        x: positionCenter,
        title: title,
        fadeType: fadeType,
        isHoverable: isHoverable,
      });
    } else {
      const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
      let positionX = 0;
      positionX = displayX === "right" ? -18 - 50 - (maxWidth ?? 400) : 0;
      positionX = displayX === "left" ? window.innerWidth - x : 0;
      console.log("クリック", displayX, e, x, y, width, height);

      setOpenPopupMenu({
        x: positionX,
        y: y,
        title: title,
        displayX: displayX,
        maxWidth: maxWidth,
        fadeType: fadeType,
        isHoverable: isHoverable,
      });
    }
  };

  // メニューを閉じる
  const handleClosePopupMenu = () => {
    setOpenPopupMenu(null);
  };
  // -------------------------- ✅説明ポップアップメニュー✅ --------------------------

  // // ==================================== 🌟ツールチップ🌟 ====================================
  // const hoveredItemPosWrap = useStore((state) => state.hoveredItemPosWrap);
  // const setHoveredItemPosWrap = useStore((state) => state.setHoveredItemPosWrap);
  // type TooltipParams = {
  //   e: React.MouseEvent<HTMLElement, MouseEvent | globalThis.MouseEvent>;
  //   display?: "top" | "right" | "bottom" | "left" | "";
  //   marginTop?: number;
  //   itemsPosition?: string;
  //   whiteSpace?: "normal" | "pre" | "nowrap" | "pre-wrap" | "pre-line" | "break-spaces" | undefined;
  //   content?: string;
  //   content2?: string;
  //   content3?: string;
  //   content4?: string;
  // };
  // const handleOpenTooltip = ({
  //   e,
  //   display = "",
  //   marginTop,
  //   itemsPosition,
  //   whiteSpace,
  //   content,
  //   content2,
  //   content3,
  //   content4,
  // }: TooltipParams) => {
  //   // ホバーしたアイテムにツールチップを表示
  //   const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
  //   // console.log("ツールチップx, y width , height", x, y, width, height);
  //   const dataText2 = ((e.target as HTMLDivElement).dataset.text2 as string)
  //     ? ((e.target as HTMLDivElement).dataset.text2 as string)
  //     : "";
  //   const dataText3 = ((e.target as HTMLDivElement).dataset.text3 as string)
  //     ? ((e.target as HTMLDivElement).dataset.text3 as string)
  //     : "";
  //   const dataText4 = ((e.target as HTMLDivElement).dataset.text4 as string)
  //     ? ((e.target as HTMLDivElement).dataset.text4 as string)
  //     : "";
  //   setHoveredItemPosWrap({
  //     x: x,
  //     y: y,
  //     itemWidth: width,
  //     itemHeight: height,
  //     content: ((e.target as HTMLDivElement).dataset.text as string) || (content ?? ""),
  //     content2: dataText2 || content2 || "",
  //     content3: dataText3 || content3 || "",
  //     content4: dataText4 || content4 || "",
  //     display: display,
  //     marginTop: marginTop,
  //     itemsPosition: itemsPosition,
  //     whiteSpace: whiteSpace,
  //   });
  // };
  // // ツールチップを非表示
  // const handleCloseTooltip = () => {
  //   setHoveredItemPosWrap(null);
  // };
  // // ==================================== ✅ツールチップ✅ ====================================

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

  // ポップアップのフェードタイプ
  const getFadeTypeClass = (fadeType: string) => {
    if (fadeType === "fade_down") return styles.fade_down;
    if (fadeType === "fade_up") return styles.fade_up;
    if (fadeType === "fade") return styles.fade;
  };

  // 期間をメニューから適用ボタンで変更する関数
  const handleChangePeriod = () => {
    if (
      !activePeriodSDBLocal ||
      !activePeriodSDB ||
      !annualFiscalMonthWithoutYearToMonthKeyMap ||
      !annualFiscalMonthsSDB
    )
      return handleCloseSectionMenu();
    if (
      activePeriodSDB.periodType === activePeriodSDBLocal.periodType &&
      activePeriodSDB.period === activePeriodSDBLocal.period
    ) {
      handleCloseSectionMenu(); // リセットしてメニューを閉じる
      return;
    }

    // 変更したのが期間が現在の年度と異なる場合は年度のstateも同時に更新する
    if (activePeriodSDBLocal.periodType === "year_month") {
      // 年月度の場合にはカレンダー年を会計年度基準に変換してから選択年度stateを更新
      // 月の部分を取得
      const _month = String(activePeriodSDBLocal.period).substring(4);
      if (!annualFiscalMonthWithoutYearToMonthKeyMap.has(_month)) return handleCloseSectionMenu();
      const _monthKey = annualFiscalMonthWithoutYearToMonthKeyMap.get(_month);
      if (!_monthKey) return handleCloseSectionMenu();

      // 取得した月と期首の月の両者のカレンダー年を比較して新たなカレンダー年から新たな会計年度を算出して更新する
      const newMonthYear = String(annualFiscalMonthsSDB[_monthKey]).substring(0, 4);
      const firstMonthYear = String(annualFiscalMonthsSDB.month_01).substring(0, 4);
      if (!newMonthYear || !firstMonthYear) return handleCloseSectionMenu();

      if (firstMonthYear === newMonthYear) {
        setSelectedFiscalYearTargetSDB(selectedCalendarYear);
      }
      // カレンダー年より会計年度が1年小さい場合には選択中のカレンダー年から1年引いた値を新たに選択中の会計年度として更新する
      else if (firstMonthYear < newMonthYear) {
        setSelectedFiscalYearTargetSDB(selectedCalendarYear - 1);
      } else {
        console.error("エラー：会計年度が算出できませんでした。 E09");
        return handleCloseSectionMenu(); // 上記2つに当てはまらない場合にはエラー
      }
    }
    // 年月度以外はselectedFiscalYearLocalをそのままセットして選択中の会計年度として更新
    else {
      if (selectedFiscalYearLocal !== selectedFiscalYearTargetSDB) {
        setSelectedFiscalYearTargetSDB(selectedFiscalYearLocal);
      }
    }

    const newPeriod = { periodType: activePeriodSDBLocal.periodType, period: activePeriodSDBLocal.period };
    setActivePeriodSDB(newPeriod);

    // 上期と下期どちらを選択中か更新
    const firstHalfDetailSet = new Set([
      String(annualFiscalMonthsSDB.month_01).substring(4),
      String(annualFiscalMonthsSDB.month_02).substring(4),
      String(annualFiscalMonthsSDB.month_03).substring(4),
      String(annualFiscalMonthsSDB.month_04).substring(4),
      String(annualFiscalMonthsSDB.month_05).substring(4),
      String(annualFiscalMonthsSDB.month_06).substring(4),
    ]);

    const _month = String(activePeriodSDBLocal.period).substring(4);

    const newHalfDetail = firstHalfDetailSet.has(_month) ? "first_half_details" : "second_half_details";
    setSelectedPeriodTypeHalfDetailSDB(newHalfDetail);

    handleCloseSectionMenu(); // リセットしてメニューを閉じる
  };

  const handleEnterInfoIcon = (
    e: MouseEvent<HTMLDivElement, MouseEvent | globalThis.MouseEvent>,
    infoIconRef: HTMLDivElement | null
  ) => {
    if (infoIconProgressRef.current && infoIconProgressRef.current.classList.contains(styles.animate_ping)) {
      infoIconProgressRef.current.classList.remove(styles.animate_ping);
    }
  };

  // 年月度の年と月を分けて取得する(ディスプレイ用)
  const displayYearPeriod = useMemo(() => {
    if (!activePeriodSDB) return null;
    const periodStr = String(activePeriodSDB.period);
    if (activePeriodSDB.periodType === "year_month") {
      const year = periodStr.length >= 4 ? periodStr.slice(0, 4) : "-"; // 1文字目~4文字目
      const month = periodStr.length >= 4 ? String(parseInt(periodStr.slice(4, 6), 10)) : "-"; // 5文字目~6文字目 parseIntで0を除去
      return { year: year, period: month };
    } else if (["half_year", "quarter"].includes(activePeriodSDB.periodType)) {
      const year = periodStr.length >= 4 ? periodStr.substring(0, 4) : "-"; // 1文字目~4文字目
      const _period = periodStr.length >= 4 ? String(periodStr.substring(4)) : "-"; // 20241, 20242の5文字目
      const sign = activePeriodSDB.periodType === "half_year" ? `H` : `Q`;
      return { year: year, period: `${sign}${_period}` };
    } else if (activePeriodSDB.periodType === "fiscal_year") {
      return { year: periodStr, period: "-" }; // 年度 2024
    } else {
      return null;
    }
  }, [activePeriodSDB?.period]);

  // ------------------- 🌟リフレッシュ🌟 -------------------

  // ------------------- 🌟リフレッシュ🌟 -------------------

  // ------------------- ✅初回マウント✅ -------------------
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    if (isMounted) return;

    setIsMounted(true);
  }, []);
  // ------------------- ✅初回マウント✅ -------------------

  console.log(
    "SalesProgressScreenコンポーネントレンダリング"
    // "entityLevelsMap",
    // entityLevelsMap,
    // "annualFiscalMonthsSDB",
    // annualFiscalMonthsSDB,
    // "fiscalYearQueryData",
    // fiscalYearQueryData,
    // "entityLevelsQueryData",
    // entityLevelsQueryData,
    // "entitiesHierarchyQueryData",
    // entitiesHierarchyQueryData
  );

  if (!isMounted || activePeriodSDB === null) return <FallbackSalesProgressScreen />;

  if (!annualFiscalMonthsSDB || !currentFiscalStartYearMonthSDB)
    return (
      <FallbackSalesProgressScreen
        errorMsg={`会計年度データが見つかりませんでした。\n設定画面の「会社・チーム」タブから決算日の設定をしてください。`}
      />
    );
  if (errorMsg) return <FallbackSalesProgressScreen errorMsg={errorMsg} />;

  return (
    <>
      {/* <div className={`${styles.menu_overlay} flex-center`}>
        <SpinnerBrand bgColor="#fff" />
      </div> */}
      {/* -------------------------------- 売上進捗スクリーン -------------------------------- */}
      <div className={`${styles.sales_progress_screen}`}>
        {/* ------------------- 🌟セクションタイトル🌟 ------------------- */}

        <div className={`${styles.section_container} bg-[green]/[0]`}>
          <div className={`${styles.section_wrapper} fade08_forward`}>
            <div className={`${styles.left_wrapper} flex items-end`}>
              <div
                className={`${styles.section_title}`}
                onClick={(e) => {
                  handleOpenSectionMenu({ e, title: "dashboard", fadeType: "fade_down", maxWidth: 310 });
                  handleCloseTooltip();
                }}
                onMouseEnter={(e) => {
                  console.log(e);
                  handleOpenTooltip({
                    e: e,
                    display: "top",
                    content: `売上進捗・営業指数・プロセス・期間ごとの案件一覧・エリア毎の売上マップなど`,
                    content2: `各用途毎のダッシュボードの表示切り替えが可能です。`,
                    marginTop: 27,
                    itemsPosition: "left",
                  });
                }}
                onMouseLeave={handleCloseTooltip}
              >
                <div className={`${styles.div_wrapper} flex-center gap-[6px]`}>
                  <span className={``}>{mappingSdbTabName[activeTabSDB][language]}</span>
                  <div className={`${styles.down_icon} flex-center`}>
                    <IoCaretDownOutline className={``} />
                  </div>
                </div>
              </div>

              <div
                className={`${styles.entity_level} ${openSectionMenu?.title === "entity" ? `${styles.active}` : ``}`}
              >
                <div
                  className={`underline_area mb-[-1px] flex cursor-pointer flex-col hover:text-[var(--main-color-f)]`}
                  onClick={(e) => {
                    if (!entityLevelsMap || entityLevelsMap.size <= 2) {
                      return alert(
                        `売上目標に「全社・メンバー」以外のレイヤーが含まれている場合、\nレイヤーごとに表示を切り替えることが可能です。`
                      );
                    }
                    handleOpenSectionMenu({
                      e,
                      title: "entity",
                      displayX: "center",
                      fadeType: "fade_down",
                      maxWidth: 310,
                    });
                    handleCloseTooltip();
                  }}
                  onMouseEnter={(e) => {
                    let tooltipContent = ``;
                    if (activeTabSDB === "sales_progress") {
                      if (!entityLevelsMap) {
                        tooltipContent = `「目標」タブから売上目標を設定することで\n「全社・事業部・課・係・メンバー」ごとに売上進捗や営業プロセス指数をダッシュボードで確認できます。`;
                      } else {
                        if (entityLevelsMap.has("unit")) {
                          tooltipContent = `「全社・事業部・課・係」のレイヤーを変更することで\n各レイヤーごとの売上進捗をダッシュボードに反映します。`;
                        } else if (entityLevelsMap.has("section")) {
                          tooltipContent = `「全社・事業部・課」のレイヤーを変更することで\n各レイヤーごとの売上進捗をダッシュボードに反映します。`;
                        } else if (entityLevelsMap.has("department")) {
                          tooltipContent = `「全社・事業部」のレイヤーを変更することで\n各レイヤーごとの売上進捗をダッシュボードに反映します。`;
                        } else if (entityLevelsMap.size <= 2) {
                          tooltipContent = ``; // 全社・メンバーのみの場合には変更は不可
                        }
                      }
                    }
                    if (tooltipContent !== "")
                      handleOpenTooltip({
                        e: e,
                        display: "top",
                        content: tooltipContent,
                        marginTop: 27,
                        itemsPosition: "left",
                      });
                  }}
                  onMouseLeave={handleCloseTooltip}
                >
                  <div className={`flex items-center space-x-[3px]`}>
                    {/* <span>{mappingSectionName[activeSectionSDB][language]}</span> */}
                    <span>
                      {displayEntityGroup
                        ? displayEntityGroup.parent_entity_level === "company"
                          ? mappingSectionName["company"][language]
                          : displayEntityGroup.parent_entity_name
                        : userProfileState.profile_name}
                    </span>
                    <IoChevronDownOutline className={`text-[18px]`} />
                  </div>
                  <div className={`flow_underline brand_light one_px w-full`} />
                </div>
              </div>
              <div className={`${styles.period_type} ${openSectionMenu?.title === "period" ? `${styles.active}` : ``}`}>
                <div
                  className={`underline_area mb-[-1px] flex cursor-pointer flex-col hover:text-[var(--main-color-f)]`}
                  onClick={(e) => {
                    console.log(
                      "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥 activePeriodSDB.period.toString().slice(0, 4)",
                      activePeriodSDB.period.toString().slice(0, 4),
                      activePeriodSDB
                    );
                    // 月度のみ年が会計年度ではなくカレンダーなので別途年月度のperiodの年の部分をselectedCalendarYearにセットする
                    // if (monthKeySet.has(activePeriodSDB.periodType as FiscalYearMonthKey)) {
                    if (activePeriodSDB.periodType === "year_month") {
                      setSelectedCalendarYear(Number(activePeriodSDB.period.toString().slice(0, 4)));
                    }
                    setActivePeriodSDBLocal({
                      periodType: activePeriodSDB.periodType,
                      period: activePeriodSDB.period,
                    });
                    handleOpenSectionMenu({
                      e,
                      title: "period",
                      displayX: "center",
                      fadeType: "fade_down",
                      maxWidth: 330,
                    });
                    handleCloseTooltip();
                  }}
                  onMouseEnter={(e) => {
                    handleOpenTooltip({
                      e: e,
                      display: "top",
                      content: `選択した年月度のデータをダッシュボードに反映します。`,
                      marginTop: 9,
                      // content: `期間を「月次・四半期・半期・年度」のタイプと期間を選択することで`,
                      // content2: `その期間内でフィルターしたデータをダッシュボードに反映します。`,
                      // marginTop: 27,
                      itemsPosition: "left",
                    });
                  }}
                  onMouseLeave={handleCloseTooltip}
                >
                  <div className={`flex items-center`}>
                    {displayYearPeriod && (
                      <>
                        {activePeriodSDB.periodType === "year_month" && (
                          <span>
                            {displayYearPeriod.year} / {displayYearPeriod.period}月度
                          </span>
                        )}
                        {["half_year", "quarter"].includes(activePeriodSDB.periodType) && (
                          <span>
                            {displayYearPeriod.year}
                            {displayYearPeriod.period}
                          </span>
                        )}
                        {activePeriodSDB.periodType === "fiscal_year" && <span>{displayYearPeriod.year}年度</span>}
                      </>
                    )}
                    <IoChevronDownOutline className={`ml-[3px] text-[18px]`} />
                  </div>
                  <div className={`flow_underline brand_light one_px w-full`} />
                </div>
              </div>
              <div className={`${styles.info_area} flex-center ml-[3px] min-h-[36px] px-[3px] py-[6px]`}>
                <div
                  className="flex-center relative h-[18px] w-[18px] rounded-full"
                  onMouseEnter={(e) => handleEnterInfoIcon(e, infoIconProgressRef.current)}
                  onMouseLeave={handleCloseTooltip}
                >
                  <div
                    ref={infoIconProgressRef}
                    className={`flex-center absolute left-0 top-0 h-[18px] w-[18px] rounded-full border border-solid border-[var(--color-bg-brand-f)] ${styles.animate_ping}`}
                  ></div>
                  <ImInfo className={`min-h-[18px] min-w-[18px] text-[var(--color-bg-brand-f)]`} />
                </div>
              </div>

              <div className={`flex-center ml-[6px] min-h-[36px] min-w-[36px]`}>
                <div
                  className={`refresh_icon flex-center transition-bg02 min-h-[27px] min-w-[27px]`}
                  onMouseEnter={(e) => {
                    handleOpenTooltip({
                      e: e,
                      display: "top",
                      content: `リフレッシュ`,
                      marginTop: 6,
                    });
                  }}
                  onMouseLeave={() => {
                    handleCloseTooltip();
                  }}
                  onClick={async () => {
                    setIsLoadingRefresh(true);
                    // ローディングを挟んでDealBoardsコンポーネントを再マウントしてcurrentActiveIndexのstateをリセットする
                    await queryClient.invalidateQueries(["fiscal_year", "sales_target"]);
                    await queryClient.invalidateQueries(["entity_levels", "sales_target"]);
                    await queryClient.invalidateQueries(["entities", "sales_target"]);
                    await queryClient.invalidateQueries(["member_accounts", "sdb"]);
                    await queryClient.invalidateQueries(["deals"]);

                    await new Promise((resolve) => setTimeout(resolve, 800));
                    setIsLoadingRefresh(false);
                    handleCloseTooltip();
                  }}
                >
                  <GrPowerReset className="" />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* ------------------- 🌟セクションタイトル🌟 ここまで ------------------- */}

        {/* ------------------- 売上目標+現売実績ホワイトボード ------------------- */}

        {/* ------------------- 売上目標+現売実績ホワイトボード ここまで ------------------- */}

        {/* ------------------- 🌟ネタ表ボードスクリーン🌟 ------------------- */}
        {isLoadingRefresh && (
          <div
            className={`flex-center w-full`}
            // style={{ minHeight: `calc(732px - 87px)`, paddingBottom: `87px` }}
            style={{ minHeight: `calc(100vh - 87px - 56px)`, paddingBottom: `87px` }}
          >
            <SpinnerBrand withBorder withShadow />
          </div>
        )}
        {isMounted && activeTabSDB === "sales_progress" && activePeriodSDB !== null && !isLoadingRefresh && (
          <>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <Suspense
                fallback={
                  <div
                    className={`flex-center w-full`}
                    // style={{ minHeight: `calc(732px - 87px)`, paddingBottom: `87px` }}
                    style={{ minHeight: `calc(100vh - 87px - 56px)`, paddingBottom: `87px` }}
                  >
                    <SpinnerBrand withBorder withShadow />
                  </div>
                }
              >
                <ScreenDealBoards
                  // memberList={memberListSectionMember}
                  displayEntityGroup={displayEntityGroup}
                  // periodType={activePeriodSDB.periodType}
                  // period={activePeriodSDB.period}
                />
              </Suspense>
            </ErrorBoundary>
            {/* <div className={`flex-center w-full`} style={{ minHeight: `calc(732px - 87px)`, paddingBottom: `87px` }}>
              <SpinnerBrand withBorder withShadow />
            </div> */}
          </>
        )}
        {/* ------------------- 🌟ネタ表ボードスクリーン🌟 ここまで ------------------- */}
      </div>
      {/* -------------------------------- 売上進捗スクリーン ここまで -------------------------------- */}

      {/* ---------------------------- 🌟セッティングメニュー🌟 ---------------------------- */}
      {/* エディット時のメニュー上オーバーレイ */}
      {/* {isOpenPopupOverlay && (
        <div
        className={`${styles.menu_overlay} ${styles.above_setting_menu} bg-[#ffffff00]`}
        onClick={handleCloseClickPopup}
        ></div>
        )} */}
      {/* クリック時のオーバーレイ */}
      {openSectionMenu && <div className={`${styles.menu_overlay}`} onClick={handleCloseSectionMenu}></div>}
      {openSectionMenu && (
        <div
          ref={sectionMenuRef}
          className={`${styles.settings_menu} fixed z-[3000] h-auto rounded-[6px] ${
            openSectionMenu.fadeType ? getFadeTypeClass(openSectionMenu.fadeType) : ``
          }`}
          style={{
            top: `${openSectionMenu.y}px`,
            ...((openSectionMenu.displayX === "center" || !openSectionMenu.displayX) && {
              left: `${openSectionMenu.x}px`,
              maxWidth: `${openSectionMenu.maxWidth}px`,
            }),
            ...(openSectionMenu.displayX === "right" && {
              right: `${openSectionMenu.x}px`,
              maxWidth: `${openSectionMenu.maxWidth}px`,
            }),
            ...(openSectionMenu.displayX === "left" && {
              right: `${openSectionMenu.x}px`,
              maxWidth: `${openSectionMenu.maxWidth}px`,
            }),
          }}
        >
          {openSectionMenu.title === "dashboard" && (
            <>
              <h3 className={`w-full px-[20px] pt-[20px] text-[15px] font-bold`}>
                <div className="flex max-w-max flex-col">
                  <span>ダッシュボードメニュー</span>
                  <div className={`${styles.section_underline} w-full`} />
                </div>
              </h3>

              <p className={`w-full px-[20px] pb-[12px] pt-[10px] text-[11px]`}>
                下記メニューから選択したダッシュボードを表示します。
              </p>

              <hr className="min-h-[1px] w-full bg-[#999]" />

              {/* -------- メニューコンテンツエリア -------- */}
              <div className={`${styles.scroll_container} flex max-h-[240px] w-full flex-col overflow-y-auto`}>
                <ul className={`flex h-full w-full flex-col`}>
                  {/* ------------------------------------ */}
                  {sdbTabsList.map((obj, index) => {
                    const isActive = obj.title === activeTabSDB;
                    return (
                      <li
                        key={obj.title}
                        className={`${styles.list} ${styles.select_list} ${isActive ? styles.active : ``}`}
                        onClick={(e) => {
                          if (isActive) return;
                          setActiveTabSDB(obj.title);
                          handleClosePopupMenu();
                        }}
                        // onMouseEnter={(e) => {
                        //   handleOpenPopupMenu({ e, title: "deals_status", displayX: "right", maxWidth: 360 });
                        // }}
                        // onMouseLeave={handleClosePopupMenu}
                      >
                        <div className="pointer-events-none flex min-w-[110px] items-center">
                          <MdOutlineDataSaverOff
                            className={`${styles.list_icon} mr-[16px] min-h-[20px] min-w-[20px] text-[20px]`}
                          />
                          <div className="flex select-none items-center space-x-[2px]">
                            <span className={`${styles.select_item}`}>{obj.name[language]}</span>
                            {/* <span className={``}>：</span> */}
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
                  {/* ------------------------------------ */}
                </ul>
              </div>
            </>
          )}

          {/* ------------------------ エンティティ選択メニュー ------------------------ */}
          {openSectionMenu.title === "entity" && (
            <>
              <h3 className={`w-full px-[20px] pt-[20px] text-[15px] font-bold`}>
                <div className="flex max-w-max flex-col">
                  <span>セクションメニュー</span>
                  <div className={`${styles.section_underline} w-full`} />
                </div>
              </h3>

              <p className={`w-full px-[20px] pb-[12px] pt-[10px] text-[11px]`}>
                下記メニューから「全社・事業部・係/チーム・メンバー個人」を変更することで、各セクションに応じたデータを反映します。
              </p>

              <hr className="min-h-[1px] w-full bg-[#999]" />

              {/* -------- メニューコンテンツエリア -------- */}
              <div className={`${styles.scroll_container} flex max-h-[240px] w-full flex-col overflow-y-auto`}>
                <ul className={`flex h-full w-full flex-col`}>
                  {/* ------------------------------------ */}
                  {sectionList.map((obj, index) => {
                    const isActive = obj.title === activeSectionSDB;
                    return (
                      <li
                        key={obj.title}
                        className={`${styles.list} ${styles.select_list} ${isActive ? styles.active : ``}`}
                        onClick={(e) => {
                          if (isActive) return;
                          setActiveSectionSDB(obj.title);
                          handleClosePopupMenu();
                        }}
                      >
                        <div className="pointer-events-none flex min-w-[110px] items-center">
                          <MdOutlineDataSaverOff
                            className={`${styles.list_icon} mr-[16px] min-h-[20px] min-w-[20px] text-[20px]`}
                          />
                          <div className="flex select-none items-center space-x-[2px]">
                            <span className={`${styles.select_item}`}>{obj.name[language]}</span>
                            {/* <span className={``}>：</span> */}
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
                  {/* ------------------------------------ */}
                </ul>
              </div>
              {/* 右サイドエンティティ詳細メニュー 適用・戻るエリア */}
              <div
                className={`${styles.settings_menu} ${styles.edit_mode}  z-[3000] h-auto w-[330px] overflow-hidden rounded-[6px] ${styles.fade_up}`}
                style={{
                  // position: "absolute",
                  // bottom: "-168px",
                  // left: 0,
                  position: "absolute",
                  // ...(sectionMenuRef.current?.offsetWidth
                  //   ? { bottom: "0px", left: sectionMenuRef.current?.offsetWidth + 10 }
                  //   : { bottom: "-168px", left: 0 }),
                  ...(sectionMenuRef.current?.offsetWidth
                    ? { top: "0px", left: sectionMenuRef.current?.offsetWidth + 10 }
                    : { bottom: "-168px", left: 0 }),
                  animationDelay: `0.2s`,
                  animationDuration: `0.5s`,
                  ...(openSectionMenu.maxWidth && { maxWidth: `${openSectionMenu.maxWidth}px` }),
                }}
              >
                {/* ------------------------------------ */}
                <li className={`${styles.section_title} flex min-h-max w-full font-bold`}>
                  <div className="flex max-w-max flex-col">
                    <span>{mappingSectionName[activeSectionSDB][language]}</span>
                    <div className={`${styles.underline} w-full`} />
                  </div>
                </li>
                {/* ------------------------------------ */}
                {/* ------------------------------------ */}
                <li
                  className={`${styles.list}`}
                  onMouseEnter={(e) => {
                    // handleOpenPopupMenu({ e, title: "compressionRatio" });
                  }}
                  onMouseLeave={handleClosePopupMenu}
                >
                  <div className="pointer-events-none flex min-w-[70px] items-center">
                    {/* <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" /> */}
                    <div className="flex select-none items-center space-x-[2px]">
                      <span className={`${styles.list_title}`}>表示中</span>
                      <span className={``}>：</span>
                    </div>
                  </div>
                  {/* <select
                      className={`${styles.select_box} truncate`}
                      value={compressionRatio}
                      onChange={(e) => setCompressionRatio(e.target.value as CompressionRatio)}
                    >
                      {optionsCompressionRatio.map((value) => (
                        <option key={value} value={value}>
                          {getCompressionRatio(value, language)}
                        </option>
                      ))}
                    </select> */}

                  <div className="flex w-full items-center justify-end">
                    <div className="mb-[-1px] flex min-w-max  flex-col space-y-[3px]">
                      <div className="flex max-w-[160px] items-center px-[12px]">
                        <span
                          className="truncate text-[14px]"
                          onMouseEnter={(e) => {
                            const el = e.currentTarget;
                            if (el.offsetWidth < el.scrollWidth) {
                              const tooltipContent = "伊藤 謙太";
                              handleOpenTooltip({
                                e: e,
                                display: "top",
                                content: tooltipContent,
                                marginTop: 12,
                                itemsPosition: "center",
                                // whiteSpace: "nowrap",
                              });
                            }
                          }}
                          onMouseLeave={() => {
                            handleCloseTooltip();
                          }}
                        >
                          伊藤 謙太
                        </span>
                      </div>
                      <div className="min-h-[1px] w-full bg-[var(--color-bg-brand-f)]" />
                    </div>
                    <div
                      className={`${styles.icon_path_stroke} ${styles.icon_btn} flex-center transition-bg03 ml-[13px]`}
                      onMouseEnter={(e) => {
                        const tooltipContent = "メンバーを変更";
                        handleOpenTooltip({
                          e: e,
                          display: "top",
                          content: tooltipContent,
                          marginTop: 12,
                          itemsPosition: "center",
                          // whiteSpace: "nowrap",
                        });
                      }}
                      onMouseLeave={() => {
                        handleCloseTooltip();
                      }}
                      // onClick={() => {
                      //   setSelectedMemberObj(null);
                      //   if (hoveredItemPosSideTable) handleCloseTooltip();
                      // }}
                    >
                      <FaExchangeAlt className="text-[13px]" />
                    </div>
                  </div>
                </li>
                {/* ------------------------------------ */}
                <hr className="min-h-[1px] w-full bg-[#999]" />
                {/* ------------------------------------ */}
                <li className={`${styles.list} ${styles.btn_area} space-x-[20px]`}>
                  <div
                    className={`transition-bg02 ${styles.edit_btn} ${styles.brand} ${styles.active}`}
                    // onClick={handleChangePeriod}
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
              {/* 右サイドエンティティ詳細メニュー 適用・戻るエリア */}
            </>
          )}
          {/* ------------------------ エンティティ選択メニュー ------------------------ */}

          {/* ------------------------ 期間選択メニュー ------------------------ */}
          {openSectionMenu.title === "period" && activePeriodSDBLocal && selectedPeriodWithoutYear && (
            <>
              <h3 className={`w-full px-[20px] pt-[20px] text-[15px] font-bold`}>
                <div className="flex max-w-max flex-col">
                  <span>期間選択メニュー</span>
                  <div className={`${styles.section_underline} w-full`} />
                </div>
              </h3>

              <p className={`w-full px-[20px] pb-[12px] pt-[10px] text-[11px]`}>
                下記メニューの期間から「月次・四半期・半期・年度」のいずれかを選択してから、後に表示される各期間ごとの選択肢を選択することで、各期間に応じたデータをダッシュボードに反映します。
              </p>

              <hr className="min-h-[1px] w-full bg-[#999]" />

              {/* -------- メニューコンテンツエリア -------- */}
              <div className={`${styles.scroll_container} flex max-h-[240px] w-full flex-col overflow-y-auto`}>
                <ul className={`flex h-full w-full flex-col`}>
                  {/* ------------------------------------ */}
                  <li className={`${styles.section_title} flex min-h-max w-full font-bold`}>
                    <div className="flex max-w-max flex-col">
                      <span>会計年度</span>
                      <div className={`${styles.underline} w-full`} />
                    </div>
                  </li>
                  {/* ------------------------------------ */}
                  <li className={`${styles.list}`}>
                    <div className="pointer-events-none flex min-w-[130px] items-center">
                      <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                      <div className="flex select-none items-center space-x-[2px]">
                        <span className={`${styles.list_title}`}>期間</span>
                        <span className={``}>：</span>
                      </div>
                    </div>
                    {/* 期間タイプの変更 */}
                    <select
                      className={`${styles.select_box} truncate`}
                      value={activePeriodSDBLocal.periodType}
                      onChange={(e) => {
                        if (e.target.value === "year_month") {
                          const initialCurrentMonth = String(currentFiscalStartYearMonthSDB).substring(4);
                          const initialPeriod = Number(`${selectedCalendarYear}${initialCurrentMonth}`);
                          setActivePeriodSDBLocal({ periodType: e.target.value, period: initialPeriod });
                        } else if (e.target.value === "fiscal_year") {
                          setActivePeriodSDBLocal({ periodType: e.target.value, period: selectedFiscalYearLocal });
                        } else if (["half_year", "quarter"].includes(e.target.value)) {
                          // 四半期と半期は両方1をセットして、1QとH1を初期値として更新する
                          const initialPeriod = Number(`${selectedFiscalYearLocal}1`);
                          setActivePeriodSDBLocal({
                            periodType: e.target.value as "half_year" | "quarter",
                            period: initialPeriod,
                          });
                        }
                      }}
                    >
                      <>
                        {activeTabSDB === "sales_progress" && (
                          <option value={`year_month`}>{{ ja: "月度", en: "Monthly" }[language]}</option>
                        )}
                        {activeTabSDB !== "sales_progress" &&
                          periodList.map((option) => (
                            <option key={option.title} value={option.title}>
                              {option.name[language]}
                            </option>
                          ))}
                      </>
                    </select>
                  </li>
                  {/* ------------------------------------ */}
                  {/* ------------------------------------ 年度以外は必ず同時に年も選択 */}
                  {activePeriodSDBLocal.periodType !== "fiscal_year" && (
                    <li className={`${styles.list}`}>
                      <div className="pointer-events-none flex min-w-[130px] items-center">
                        <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                        <div className="flex select-none items-center space-x-[2px]">
                          <span className={`${styles.list_title}`}>年</span>
                          <span className={``}>：</span>
                        </div>
                      </div>
                      {/* {monthKeySet.has(activePeriodSDBLocal.periodType as FiscalYearMonthKey) && ( */}
                      {activePeriodSDBLocal.periodType === "year_month" && (
                        <select
                          className={`${styles.select_box} truncate`}
                          value={selectedCalendarYear.toString()}
                          onChange={(e) => {
                            const _year = e.target.value;
                            setSelectedCalendarYear(Number(_year));
                            // 月度は202403の6桁なので-2
                            const _month = activePeriodSDBLocal.period.toString().slice(-2);
                            // 年と現在の月度か四半期か半期の値を結合して数値型に変換
                            const newPeriod = Number(`${_year}${_month}`);
                            console.log("newPeriod", newPeriod, "_month", _month);
                            setActivePeriodSDBLocal({ ...activePeriodSDBLocal, period: newPeriod });
                          }}
                        >
                          {/* カレンダー年 */}
                          {optionsCalendarYear.map((option) => (
                            <option key={option.key} value={option.value}>
                              {option.name[language]}
                            </option>
                          ))}
                        </select>
                      )}
                      {/* {(halfYearKeySet.has(activePeriodSDBLocal.periodType as HalfYearKey) ||
                        quarterKeySet.has(activePeriodSDBLocal.periodType as QuarterKey)) && ( */}
                      {["half_year", "quarter"].includes(activePeriodSDBLocal.periodType) && (
                        <select
                          className={`${styles.select_box} truncate`}
                          value={selectedFiscalYearLocal.toString()}
                          onChange={(e) => {
                            const _year = e.target.value;
                            setSelectedFiscalYearLocal(Number(_year));
                            // 四半期、半期は20243や20241の5桁なので-1
                            const _period = activePeriodSDBLocal.period.toString().slice(-1);
                            // 年と現在の月度か四半期か半期の値を結合して数値型に変換
                            const newPeriod = Number(`${_year}${_period}`);
                            console.log("newPeriod", newPeriod, "_period", _period);
                            setActivePeriodSDBLocal({ ...activePeriodSDBLocal, period: newPeriod });
                          }}
                        >
                          {/* 会計基準年 */}
                          {optionsFiscalYear.map((option) => (
                            <option key={option.key} value={option.value}>
                              {option.name[language]}
                            </option>
                          ))}
                        </select>
                      )}
                    </li>
                  )}
                  {/* ------------------------------------ */}
                  {/* ------------------------------------ */}
                  <li
                    className={`${styles.list}`}
                    // onMouseEnter={(e) => {
                    //   handleOpenPopupMenu({ e, title: "displayFiscalYear", displayX: "right" });
                    // }}
                    // onMouseLeave={() => {
                    //   if (openPopupMenu) handleClosePopupMenu();
                    // }}
                  >
                    <div className="pointer-events-none flex min-w-[130px] items-center">
                      <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                      <div className="flex select-none items-center space-x-[2px]">
                        <span className={`${styles.list_title}`}>
                          {activePeriodSDBLocal.periodType === "fiscal_year" && "年度"}
                          {activePeriodSDBLocal.periodType === "half_year" && "半期"}
                          {activePeriodSDBLocal.periodType === "quarter" && "四半期"}
                          {activePeriodSDBLocal.periodType === "year_month" && "月度"}
                        </span>
                        <span className={``}>：</span>
                      </div>
                    </div>
                    <select
                      className={`${styles.select_box} truncate`}
                      value={selectedPeriodWithoutYear}
                      onChange={(e) => {
                        if (activePeriodSDBLocal.periodType === "fiscal_year") {
                          setActivePeriodSDBLocal({ ...activePeriodSDBLocal, period: Number(e.target.value) });
                        } else {
                          // 月度、四半期、半期は年と結合してstateを更新
                          // 月度はカレンダー年と結合 / 半期・四半期は会計基準年と結合
                          const _year =
                            activePeriodSDBLocal.periodType === "year_month"
                              ? selectedCalendarYear
                              : ["half_year", "quarter"].includes(activePeriodSDBLocal.periodType)
                              ? selectedFiscalYearLocal
                              : null;
                          if (!_year) return;
                          // 年と現在の月度の値を結合して数値型に変換
                          const newPeriod = Number(`${_year}${e.target.value}`);
                          console.log("newPeriod", newPeriod, "e.target.value", e.target.value);
                          setActivePeriodSDBLocal({ ...activePeriodSDBLocal, period: newPeriod });
                        }
                      }}
                    >
                      {getPeriodTimeValue(activePeriodSDBLocal.periodType).map((option) => (
                        <option key={option.key} value={option.value}>
                          {option.name[language]}
                        </option>
                      ))}
                    </select>
                  </li>
                  {/* ------------------------------------ */}
                </ul>
              </div>
              {/* 適用・戻るエリア(期間メニュー) */}
              <div
                className={`${styles.settings_menu} ${styles.edit_mode}  z-[3000] h-auto w-[330px] overflow-hidden rounded-[6px] ${styles.fade_up}`}
                style={{
                  position: "absolute",
                  bottom: "-70px",
                  left: 0,
                  animationDelay: `0.2s`,
                  animationDuration: `0.5s`,
                  ...(openSectionMenu.maxWidth && { maxWidth: `${openSectionMenu.maxWidth}px` }),
                }}
              >
                {/* ------------------------------------ */}
                <li className={`${styles.list} ${styles.btn_area} space-x-[20px]`}>
                  <div
                    className={`transition-bg02 ${styles.edit_btn} ${styles.brand} ${styles.active}`}
                    onClick={handleChangePeriod}
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
              {/* 適用・戻るエリア(期間メニュー) */}
            </>
          )}
          {/* ------------------------ 期間選択メニュー ------------------------ */}
        </div>
      )}
      {/* ---------------------------- 🌟セッティングメニュー🌟 ここまで ---------------------------- */}
    </>
  );
};

export const SalesProgressScreen = memo(SalesProgressScreenMemo);
