import {
  CSSProperties,
  Dispatch,
  SetStateAction,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "../../../../DashboardSalesTargetComponent.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import {
  columnHeaderListTarget,
  formatColumnName,
  formatRowName,
  formatRowNameShort,
  rowHeaderListTarget,
} from "../UpsertSettingTargetEntityGroup";
import { ProgressCircle } from "@/components/Parts/Charts/ProgressCircle/ProgressCircle";
import { ProgressNumber } from "@/components/Parts/Charts/ProgressNumber/ProgressNumber";
import { SparkChart } from "@/components/Parts/Charts/SparkChart/SparkChart";
import useStore from "@/store";
import { formatDisplayPrice } from "@/utils/Helpers/formatDisplayPrice";
import { isValidNumber } from "@/utils/Helpers/isValidNumber";
import { checkNotFalsyExcludeZero } from "@/utils/Helpers/checkNotFalsyExcludeZero";
import { convertToYen } from "@/utils/Helpers/convertToYen";
import { calculateYearOverYear } from "@/utils/Helpers/PercentHelpers/calculateYearOverYear";
import { TbSnowflake, TbSnowflakeOff } from "react-icons/tb";
import {
  Department,
  EntityInputSalesTargetObj,
  FiscalYearMonthObjForTarget,
  InputSalesTargets,
  MemberAccounts,
  Office,
  SalesSummaryYearHalf,
  SalesTargetUpsertColumns,
  SalesTargetsYearHalf,
  Section,
  SparkChartObj,
  Unit,
  inputSalesData,
} from "@/types";
import { useQuerySalesSummaryAndGrowth } from "@/hooks/useQuerySalesSummaryAndGrowth";
import { toast } from "react-toastify";
import Decimal from "decimal.js";
import { cloneDeep } from "lodash";
import { HiOutlineSwitchHorizontal } from "react-icons/hi";
import { useQueryClient } from "@tanstack/react-query";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { SpinnerX } from "@/components/Parts/SpinnerX/SpinnerX";
import { FallbackScrollContainer } from "../../../SalesTargetsContainer/SalesTargetGridTable/FallbackScrollContainer";
import { ImInfo } from "react-icons/im";

/**
 *   "period_type",
  "sales_target",
  "share",
  "yoy_growth",
  "yo2y_growth",
  "last_year_sales",
  "two_years_ago_sales",
  "three_years_ago_sales",
  "sales_trend",
 */

type Props = {
  // isMemberLevelSetting: boolean;
  entityLevel: string;
  entityNameTitle: string;
  entityId: string;
  parentEntityLevel?: string;
  parentEntityId?: string;
  parentEntityNameTitle?: string;
  stickyRow: string | null;
  setStickyRow: Dispatch<SetStateAction<string | null>>;
  annualFiscalMonths: FiscalYearMonthObjForTarget | null;
  isMainTarget: boolean; // メイン目標かどうか
  fetchEnabled?: boolean; // メイン目標でない場合はfetchEnabledがtrueに変更されたらフェッチを許可する
  onFetchComplete?: () => void;
  saveEnabled?: boolean;
  onSaveComplete?: () => void;
  allSaved: boolean;
  // subTargetList?: Department[] | Section[] | Unit[] | Office[] | MemberAccounts[];
  // setSubTargetList?: Dispatch<SetStateAction<Department[] | Section[] | Unit[] | Office[] | MemberAccounts[]>>;
};

const UpsertSettingTargetGridTableMemo = ({
  // isMemberLevelSetting,
  entityLevel,
  entityNameTitle,
  entityId,
  parentEntityLevel,
  parentEntityId,
  parentEntityNameTitle,
  stickyRow,
  setStickyRow,
  // fiscalYearMonthsForThreeYear,
  annualFiscalMonths,
  isMainTarget = false,
  fetchEnabled,
  onFetchComplete,
  saveEnabled,
  onSaveComplete,
  allSaved,
}: // subTargetList,
// setSubTargetList,
// startYearMonth,
// endYearMonth,
Props) => {
  const queryClient = useQueryClient();
  const supabase = useSupabaseClient();
  const language = useStore((state) => state.language);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  // const upsertTargetObj = useDashboardStore((state) => state.upsertTargetObj);
  const upsertSettingEntitiesObj = useDashboardStore((state) => state.upsertSettingEntitiesObj);

  // メンバーレベル設定時の上期詳細か下期詳細
  const settingPeriodTypeForMemberLevel = useDashboardStore((state) => state.settingPeriodTypeForMemberLevel);

  const [isLoading, setIsLoading] = useState(false);

  // if (!upsertTargetObj || !userProfileState || !userProfileState.company_id) return;
  if (!upsertSettingEntitiesObj || !userProfileState || !userProfileState.company_id) return;

  // 会社レベル以外のエンティティが設定対象の場合には、親エンティティレベルとIdが取得できているかを確認する
  if (!isMainTarget && (!parentEntityLevel || !parentEntityId)) {
    return;
  }

  // 「半期〜月度」
  // if (isMemberLevelSetting && !annualFiscalMonths) return null;

  // --------------------- 🌟メイン目標の売上目標をキャッシュから取得🌟 ---------------------
  const salesTargetsYearHalf: SalesTargetsYearHalf | undefined = queryClient.getQueryData([
    "sales_target_main_year_half",
    parentEntityLevel,
    parentEntityId,
    `year_half`,
    upsertSettingEntitiesObj.fiscalYear,
  ]);
  // --------------------- 🌟メイン目標の売上目標をキャッシュから取得🌟 ---------------------
  // --------------------- 🌟過去3年分の売上と前年度の前年伸び率実績を取得するuseQuery🌟 ---------------------
  const {
    data: salesSummaryRowData,
    error: salesSummaryError,
    isLoading: isLoadingQuery,
    isSuccess: isSuccessQuery,
    isError: isErrorQuery,
  } = useQuerySalesSummaryAndGrowth({
    companyId: userProfileState.company_id,
    entityLevel: entityLevel,
    entityId: entityId,
    periodType: `year_half`,
    fiscalYear: upsertSettingEntitiesObj.fiscalYear,
    annualFiscalMonths: annualFiscalMonths,
    fetchEnabled: isMainTarget ? true : fetchEnabled && !!salesTargetsYearHalf, // メイン目標はtrue, でなければfetchEnabledがtrue、かつ、メインの売上目標が取得できてからフェッチを行う
  });
  // --------------------- 🌟過去3年分の売上と前年度の前年伸び率実績を取得するuseQuery🌟 ここまで ---------------------

  // -------------------- 🌠useQueryでフェッチが完了したら次のテーブルをアクティブにする🌠 --------------------
  useEffect(() => {
    if (isSuccessQuery || isErrorQuery) {
      if (onFetchComplete) onFetchComplete();
    }
  }, [isSuccessQuery, isErrorQuery]);
  // -------------------- 🌠useQueryでフェッチが完了したら次のテーブルをアクティブにする🌠 --------------------

  // ---------------- ローカルstate ----------------
  // 売上目標input 「年度・上半期・下半期」
  const [inputSalesTargetYear, setInputSalesTargetYear] = useState("");
  const [inputSalesTargetFirstHalf, setInputSalesTargetFirstHalf] = useState("");
  const [inputSalesTargetSecondHalf, setInputSalesTargetSecondHalf] = useState("");

  // 前年比input 「年度・上半期・下半期」
  const [inputYoYGrowthYear, setInputYoYGrowthYear] = useState<string>("");
  const [inputYoYGrowthFirstHalf, setInputYoYGrowthFirstHalf] = useState<string>("");
  const [inputYoYGrowthSecondHalf, setInputYoYGrowthSecondHalf] = useState<string>("");
  // 上半期のシェア
  const [shareFirstHalf, setShareFirstHalf] = useState<number>(0);
  // 下半期のシェア
  const [shareSecondHalf, setShareSecondHalf] = useState<number>(0);
  // 売上推移(年度・上期、下期)
  const [salesTrendsYear, setSalesTrendsYear] = useState<(SparkChartObj & { updateAt: number }) | null>(() => {
    if (!salesSummaryRowData) return null;
    const initialData = salesSummaryRowData.find((obj) => obj.period_type === "fiscal_year")?.sales_trend ?? null;
    return initialData ? { ...initialData, updateAt: Date.now() } : null;
  });
  const [salesTrendsFirstHalf, setSalesTrendsFirstHalf] = useState(() => {
    if (!salesSummaryRowData) return null;
    const initialData = salesSummaryRowData.find((obj) => obj.period_type === "first_half")?.sales_trend ?? null;
    return initialData ? { ...initialData, updateAt: Date.now() } : null;
  });
  const [salesTrendsSecondHalf, setSalesTrendsSecondHalf] = useState(() => {
    if (!salesSummaryRowData) return null;
    const initialData = salesSummaryRowData.find((obj) => obj.period_type === "second_half")?.sales_trend ?? null;
    return initialData ? { ...initialData, updateAt: Date.now() } : null;
  });

  useEffect(() => {
    if (salesSummaryRowData) {
      if (salesTrendsYear && salesTrendsFirstHalf && salesTrendsSecondHalf) return;
      const newSalesTrendsYear =
        salesSummaryRowData.find((obj) => obj.period_type === "fiscal_year")?.sales_trend ?? null;
      const newSalesTrendsFirstHalf =
        salesSummaryRowData.find((obj) => obj.period_type === "first_half")?.sales_trend ?? null;
      const newSalesTrendsSecondHalf =
        salesSummaryRowData.find((obj) => obj.period_type === "second_half")?.sales_trend ?? null;
      setSalesTrendsYear(newSalesTrendsYear ? { ...newSalesTrendsYear, updateAt: Date.now() } : null);
      setSalesTrendsFirstHalf(newSalesTrendsFirstHalf ? { ...newSalesTrendsFirstHalf, updateAt: Date.now() } : null);
      setSalesTrendsSecondHalf(newSalesTrendsSecondHalf ? { ...newSalesTrendsSecondHalf, updateAt: Date.now() } : null);
    }
  }, [salesSummaryRowData]);

  const inputSalesTargetsList = [
    {
      key: "fiscal_year",
      title: { ja: "年度", en: "Fiscal Year" },
      inputTarget: inputSalesTargetYear,
      setInputTarget: setInputSalesTargetYear,
      inputYoYGrowth: inputYoYGrowthYear,
      setInputYoYGrowth: setInputYoYGrowthYear,
      salesTrends: salesTrendsYear,
      setSalesTrends: setSalesTrendsYear,
    },
    {
      key: "first_half",
      title: { ja: "上半期", en: "H1" },
      inputTarget: inputSalesTargetFirstHalf,
      setInputTarget: setInputSalesTargetFirstHalf,
      inputYoYGrowth: inputYoYGrowthFirstHalf,
      setInputYoYGrowth: setInputYoYGrowthFirstHalf,
      salesTrends: salesTrendsFirstHalf,
      setSalesTrends: setSalesTrendsFirstHalf,
    },
    {
      key: "second_half",
      title: { ja: "下半期", en: "H2" },
      inputTarget: inputSalesTargetSecondHalf,
      setInputTarget: setInputSalesTargetSecondHalf,
      inputYoYGrowth: inputYoYGrowthSecondHalf,
      setInputYoYGrowth: setInputYoYGrowthSecondHalf,
      salesTrends: salesTrendsSecondHalf,
      setSalesTrends: setSalesTrendsSecondHalf,
    },
  ];
  type RowHeaderNameYearHalf = "fiscal_year" | "first_half" | "second_half";

  // 🌠このテーブルが総合目標で、かつ、エンティティレベルが全社の場合は入力値をZustandに格納する
  const saveTriggerSalesTarget = useDashboardStore((state) => state.saveTriggerSalesTarget);
  const inputSalesTargetsIdToDataMap = useDashboardStore((state) => state.inputSalesTargetsIdToDataMap);
  const setInputSalesTargetsIdToDataMap = useDashboardStore((state) => state.setInputSalesTargetsIdToDataMap);

  const validateInputSalesTargets = useCallback((salesTargetArray: string[]) => {
    return salesTargetArray.every((target) => isValidNumber(target.replace(/[^\d.]/g, "")));
  }, []);

  // 🌠「保存クリック」データ収集
  useEffect(() => {
    if (!saveTriggerSalesTarget)
      return console.log(`❌${entityNameTitle}テーブル リターン トリガーがfalse`, saveTriggerSalesTarget);
    if (!saveEnabled) return console.log(`❌${entityNameTitle}テーブル saveEnabledがfalseのためリターン`, saveEnabled);
    if (allSaved) return console.log(`${entityNameTitle}テーブル ✅全てデータ収集ずみリターン`, allSaved);
    // トリガーがtrueの場合か、isCollectedでない(もしくは存在しない)場合のみ目標stateの収集を実行
    console.log(
      `🔥🔥🔥🔥🔥${entityNameTitle}テーブル データ収集トリガー検知`,
      saveTriggerSalesTarget,
      "isCollected",
      (inputSalesTargetsIdToDataMap[entityId] as EntityInputSalesTargetObj)?.isCollected,
      "saveEnabled",
      saveEnabled
    );
    if ((inputSalesTargetsIdToDataMap[entityId] as EntityInputSalesTargetObj)?.isCollected)
      return console.log(
        `✅${entityNameTitle}テーブル リターン isCollected`,
        (inputSalesTargetsIdToDataMap[entityId] as EntityInputSalesTargetObj)?.isCollected
      );

    const getPeriod = (key: string) => {
      if (key === "fiscal_year") return upsertSettingEntitiesObj.fiscalYear;
      if (key === "first_half") return upsertSettingEntitiesObj.fiscalYear * 10 + 1;
      if (key === "second_half") return upsertSettingEntitiesObj.fiscalYear * 10 + 2;
      if (key === "first_quarter") return upsertSettingEntitiesObj.fiscalYear * 10 + 1;
      if (key === "second_quarter") return upsertSettingEntitiesObj.fiscalYear * 10 + 2;
      if (key === "third_quarter") return upsertSettingEntitiesObj.fiscalYear * 10 + 3;
      if (key === "fourth_quarter") return upsertSettingEntitiesObj.fiscalYear * 10 + 4;
      if (key === "month_01") return upsertSettingEntitiesObj.fiscalYear * 100 + 1;
      if (key === "month_02") return upsertSettingEntitiesObj.fiscalYear * 100 + 2;
      if (key === "month_03") return upsertSettingEntitiesObj.fiscalYear * 100 + 3;
      if (key === "month_04") return upsertSettingEntitiesObj.fiscalYear * 100 + 4;
      if (key === "month_05") return upsertSettingEntitiesObj.fiscalYear * 100 + 5;
      if (key === "month_06") return upsertSettingEntitiesObj.fiscalYear * 100 + 6;
      if (key === "month_07") return upsertSettingEntitiesObj.fiscalYear * 100 + 7;
      if (key === "month_08") return upsertSettingEntitiesObj.fiscalYear * 100 + 8;
      if (key === "month_09") return upsertSettingEntitiesObj.fiscalYear * 100 + 9;
      if (key === "month_10") return upsertSettingEntitiesObj.fiscalYear * 100 + 10;
      if (key === "month_11") return upsertSettingEntitiesObj.fiscalYear * 100 + 11;
      if (key === "month_12") return upsertSettingEntitiesObj.fiscalYear * 100 + 12;
      return upsertSettingEntitiesObj.fiscalYear;
    };

    let salesTargets: inputSalesData[] = [];

    if (entityLevel !== "member") {
      salesTargets = inputSalesTargetsList.map((obj, index) => {
        return {
          period_type: obj.key, // 年度~半期："fiscal_year" | "first_half" | "second_half" | first_quarter | second_quarter | ...
          period: getPeriod(obj.key),
          sales_target: Number(obj.inputTarget.replace(/[^\d.]/g, "")),
        } as inputSalesData;
      });
    }
    if (entityLevel === "member") {
    }

    // Zustandのオブジェクトのstateの不変性を保つためcloneDeepでオブジェクトをコピー
    const copyInputMap = cloneDeep(inputSalesTargetsIdToDataMap);
    const newTarget = {
      entity_id: entityId,
      entity_name: entityNameTitle,
      sales_targets: salesTargets,
    } as InputSalesTargets;

    const isAllValid = validateInputSalesTargets(inputSalesTargetsList.map((obj) => obj.inputTarget));

    if (!isAllValid) {
      copyInputMap[entityId] = { data: newTarget, isCollected: true, error: "データが有効ではありません" };
    } else {
      copyInputMap[entityId] = { data: newTarget, isCollected: true, error: null };
    }

    console.log(
      `🔥🔥🔥✅✅✅✅✅✅✅✅✅✅${entityNameTitle}テーブル 子コンポーネント Zustandを更新`,
      "isAllValid",
      isAllValid,
      "copyInputMap",
      copyInputMap
    );

    // Zustandを更新
    setInputSalesTargetsIdToDataMap(copyInputMap);
    if (onSaveComplete) onSaveComplete();
  }, [saveTriggerSalesTarget, saveEnabled]);

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

  // ---------------- 関数 ----------------
  // rowの値に応じて適切なシェアを返す関数
  const getShare = (row: string) => {
    switch (row) {
      case "fiscal_year":
        return 100;
      case "first_half":
        return shareFirstHalf;
      case "second_half":
        return shareSecondHalf;
      default:
        return 0;
        break;
    }
  };

  // 行ヘッダーの値(期間タイプ)とと列ヘッダーの値に応じて表示する値をフォーマットする
  const formatDisplayValue = (row: SalesSummaryYearHalf, column: string) => {
    switch (column) {
      case "last_year_sales":
      case "two_years_ago_sales":
      case "three_years_ago_sales":
        return formatDisplayPrice(row[column]);
        break;
      //   // 売上目標
      // case 'sales_target':
      //   if (isRowHeaderNameYearHalf(row.period_type)) return;

      // case "yoy_growth":
      //   if (isRowHeaderNameYearHalf(row.period_type)) return mappingInputSalesTargets[row.period_type].inputYoYGrowth;
      //   break
      case "yo2y_growth":
        if (row.yo2y_growth === null || !isValidNumber(row.yo2y_growth)) return `- %`;
        return `${row.yo2y_growth.toFixed(1)}%`;
        break;

      default:
        break;
    }
  };

  // サブ目標リストから部門エンティティを削除(target_typeをnullに変更)
  // const handleRemoveFromTargetList = async () => {
  //   if (!subTargetList) return;
  //   if (!setSubTargetList) return;
  //   // エンティティタイプからupdateするテーブルを確定
  //   let updatedTable = "";
  //   if (entityLevel === "department") updatedTable = "departments";
  //   if (entityLevel === "section") updatedTable = "sections";
  //   if (entityLevel === "unit") updatedTable = "units";
  //   if (entityLevel === "office") updatedTable = "offices";
  //   if (entityLevel === "member") updatedTable = "profiles";
  //   if (entityLevel === "") return alert("部門データが見つかりませんでした。");

  //   const updatedPayload = { target_type: null };

  //   setIsLoading(true); // ローディング開始

  //   try {
  //     console.log("削除実行🔥 updatedTable", updatedTable, entityId);
  //     const { error } = await supabase.from(updatedTable).update(updatedPayload).eq("id", entityId);

  //     if (error) throw error;

  //     // キャッシュのサブ目標リストから部門を削除
  //     // const periodType = isMemberLevelSetting ? `first_half_details` : `year_half`;
  //     // const fiscalYear = upsertTargetObj.fiscalYear;
  //     // const queryKey = ["sales_summary_and_growth", entityLevel, entityId, periodType, fiscalYear, isFirstHalf];

  //     // キャッシュの部門からsales_targetをnullに更新する
  //     let queryKey = "departments";
  //     if (entityLevel === "department") queryKey = "departments";
  //     if (entityLevel === "section") queryKey = "sections";
  //     if (entityLevel === "unit") queryKey = "units";
  //     if (entityLevel === "office") queryKey = "offices";
  //     if (entityLevel === "member") queryKey = "member_accounts";
  //     const prevCache = queryClient.getQueryData([queryKey]) as
  //       | Department[]
  //       | Section[]
  //       | Unit[]
  //       | Office[]
  //       | MemberAccounts[];
  //     const newCache = [...prevCache]; // キャッシュのシャローコピーを作成
  //     // 更新対象のオブジェクトのtarget_typeをnullに変更
  //     const updateIndex = newCache.findIndex((obj) => obj.id === entityId);
  //     if (updateIndex !== -1) {
  //       // 更新対象の配列内のインデックスを変えずに対象のプロパティのみ変更
  //       newCache.splice(updateIndex, 1, { ...prevCache[updateIndex], target_type: null });
  //       queryClient.setQueryData([queryKey], newCache); // キャッシュを更新
  //     }

  //     // 固定していた場合は固定を解除
  //     if (stickyRow === entityId) {
  //       setStickyRow(null);
  //     }

  //     setIsLoading(false); // ローディング終了

  //     // サブ目標リストから削除
  //     const newList = [...subTargetList].filter((obj) => obj.id !== entityId) as
  //       | Department[]
  //       | Section[]
  //       | Unit[]
  //       | Office[]
  //       | MemberAccounts[];
  //     setSubTargetList(newList);

  //     toast.success(`${entityNameTitle}を目標リストから削除しました🌟`);
  //   } catch (error: any) {
  //     console.error("エラー：", error);
  //     toast.error("目標リストからの削除に失敗しました...🙇‍♀️");
  //   }
  // };

  // チャート マウントを0.6s遅らせる
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    if (isMounted) return;
    setTimeout(() => {
      setIsMounted(true);
    }, 600);
  }, []);

  console.log(
    "UpsertSettingTargetGridTableコンポーネントレンダリング",
    "entityNameTitle",
    entityNameTitle
    // "salesTargetsYearHalf",
    // salesTargetsYearHalf
    // "entityLevel",
    // entityLevel,
    // "annualFiscalMonths",
    // annualFiscalMonths,
    // "isFirstHalf",
    // isFirstHalf,
    // "salesSummaryRowData",
    // salesSummaryRowData,
    // "inputSalesTargetsList",
    // inputSalesTargetsList,
    // "salesSummaryError",
    // salesSummaryError,
    // "isLoadingQuery",
    // isLoadingQuery
  );

  const infoIconStepRef = useRef<HTMLDivElement | null>(null);

  // 過去3年分の実績の取得中、または、メイン目標の売上目標をキャッシュから未取得の場合にはローディングを表示する
  if (isLoadingQuery) return <FallbackScrollContainer title={entityNameTitle} />;
  // if (isLoadingQuery || !salesTargetsYearHalf) return <FallbackScrollContainer title={entityNameTitle} />;

  return (
    <>
      <div className={`${styles.grid_row} ${styles.col1} fade08_forward`}>
        <div className={`${styles.grid_content_card} relative`}>
          {isLoading && (
            <div className={`flex-center absolute left-0 top-0 z-[50] h-full w-full rounded-[12px] bg-[#00000090]`}>
              <SpinnerX />
            </div>
          )}
          <div className={`${styles.card_title_area}`}>
            {/* <div className={`${styles.card_title_wrapper} space-x-[24px]`}>
                <div className={`${styles.card_title}`}>
                  <span>総合目標</span>
                </div>
                <div className={`${styles.card_title} pb-[1px]`}>
                  <span>{upsertTargetObj.entityName}</span>
                  <div className={`absolute bottom-0 left-0 min-h-[2px] w-full bg-[var(--color-bg-brand-f)]`} />
                </div>
              </div> */}
            <div className={`${styles.card_title} flex items-center`}>
              <span>{entityNameTitle}</span>
              <div className={`ml-[12px] flex h-full items-center`}>
                <div
                  className="flex-center relative h-[16px] w-[16px] rounded-full"
                  onMouseEnter={(e) => {
                    const icon = infoIconStepRef.current;
                    if (icon && icon.classList.contains(styles.animate_ping)) {
                      icon.classList.remove(styles.animate_ping);
                    }
                    const parentName = parentEntityLevel === "company" ? `全社` : `${parentEntityNameTitle}`;
                    const mainContent = ``;
                    const subContent1 = parentEntityNameTitle
                      ? `${entityNameTitle}のシェアは総合目標となる${parentName}の`
                      : `${entityNameTitle}のシェアは総合目標の`;
                    const subContent2 = `それぞれ期間の売上目標を100%とした場合のシェアを表しています。`;
                    // handleOpenPopupMenu({ e, title: "step", displayX: "right", maxWidth: 360 });
                    handleOpenTooltip({
                      e: e,
                      display: "top",
                      content: isMainTarget ? mainContent : subContent1,
                      content2: isMainTarget ? undefined : subContent2,
                      marginTop: isMainTarget ? 9 : 39,
                      itemsPosition: `left`,
                    });
                  }}
                  onMouseLeave={handleCloseTooltip}
                  // onMouseLeave={handleClosePopupMenu}
                >
                  <div
                    ref={infoIconStepRef}
                    className={`flex-center absolute left-0 top-0 h-[16px] w-[16px] rounded-full border border-solid border-[var(--color-bg-brand-f)] ${styles.animate_ping}`}
                  ></div>
                  <ImInfo className={`min-h-[16px] min-w-[16px] text-[var(--color-bg-brand-f)]`} />
                </div>
              </div>
            </div>

            <div className={`${styles.btn_area} flex items-center space-x-[12px]`}>
              {/* {!isMainTarget && (
                <div
                  className={`${styles.btn} ${styles.basic} space-x-[4px]`}
                  onMouseEnter={(e) => {
                    handleOpenTooltip({
                      e: e,
                      display: "top",
                      content: `目標リストから削除`,
                      marginTop: 9,
                    });
                  }}
                  onMouseLeave={handleCloseTooltip}
                  onClick={handleRemoveFromTargetList}
                >
                  <HiOutlineSwitchHorizontal />
                  <span>削除</span>
                </div>
              )} */}
              <div
                className={`${styles.btn} ${styles.basic} space-x-[4px]`}
                onMouseEnter={(e) => {
                  handleOpenTooltip({
                    e: e,
                    display: "top",
                    content: stickyRow === entityId ? `固定を解除` : `画面内に固定`,
                    marginTop: 9,
                  });
                }}
                onMouseLeave={handleCloseTooltip}
                onClick={() => {
                  if (entityId === stickyRow) {
                    setStickyRow(null);
                  } else {
                    setStickyRow(entityId);
                  }
                  handleCloseTooltip();
                }}
              >
                {stickyRow === entityId && <TbSnowflakeOff />}
                {stickyRow !== entityId && <TbSnowflake />}
                {stickyRow === entityId && <span>解除</span>}
                {stickyRow !== entityId && <span>固定</span>}
              </div>
            </div>
          </div>
          {/* ------------------ メインコンテナ ------------------ */}
          <div className={`${styles.main_container}`}>
            {/* ------------------ Gridコンテナ ------------------ */}
            <div
              role="grid"
              className={`${styles.grid_scroll_container}`}
              style={
                {
                  "--template-columns": `80px 240px 48px repeat(2, 100px) repeat(3, 150px) minmax(180px, 1fr)`,
                  "--header-row-height": `35px`,
                  "--grid-row-height": `56px`,
                  "--row-width": `100%`,
                } as CSSProperties
              }
            >
              {/* ----------- ヘッダー ----------- */}
              <div
                role="row"
                tabIndex={-1}
                aria-rowindex={1}
                aria-selected={false}
                className={`${styles.grid_header_row}`}
              >
                {columnHeaderListTarget.map((column, colIndex) => {
                  let displayValue = formatColumnName(column, upsertSettingEntitiesObj.fiscalYear)[language];
                  return (
                    <div
                      key={colIndex}
                      role="columnheader"
                      aria-colindex={colIndex + 1}
                      aria-selected={false}
                      tabIndex={-1}
                      className={`${styles.grid_column_header_all}`}
                      style={{ gridColumnStart: colIndex + 1, ...(column === "share" && { padding: `0px` }) }}
                    >
                      <div className={`${styles.grid_column_header_inner} pointer-events-none`}>
                        {!(column === "yo2y_growth" && language === "ja") && (
                          <span
                            className={`${styles.grid_column_header_inner_name} pointer-events-none ${
                              column === "sales_target" && `${styles.sales_target}`
                            }`}
                          >
                            {displayValue}
                          </span>
                        )}
                        {column === "yo2y_growth" && language === "ja" && (
                          <>
                            <span className={`${styles.grid_column_header_inner_name} pointer-events-none`}>
                              前年度
                            </span>
                            <span className={`${styles.grid_column_header_inner_name} pointer-events-none`}>
                              前年伸び率実績
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* ----------- ヘッダー ここまで ----------- */}
              {/* ----------- rowgroup ----------- */}
              <div role="rowgroup">
                {/* ----------- Row 年度・半期リスト ----------- */}
                {/* {rowHeaderListTarget.map((row, rowIndex) => { */}
                {salesSummaryRowData &&
                  salesSummaryRowData.map((row, rowIndex) => {
                    // const rowHeaderName = formatRowName(row, upsertTargetObj.fiscalYear)[language];
                    const rowHeaderName = formatRowName(row.period_type, upsertSettingEntitiesObj.fiscalYear)[language];
                    return (
                      <div key={`grid_row_${rowIndex}`} role="row" className={`${styles.row}`}>
                        {columnHeaderListTarget.map((column, colIndex) => {
                          // let displayValue = formatRowCell(column, upsertTargetObj.fiscalYear)[language];
                          // 売上目標
                          const inputSalesTarget = inputSalesTargetsList[rowIndex].inputTarget;
                          const setInputSalesTarget = inputSalesTargetsList[rowIndex].setInputTarget;
                          // 前年比
                          const inputYoYGrowth = inputSalesTargetsList[rowIndex].inputYoYGrowth;
                          const setInputYoYGrowth = inputSalesTargetsList[rowIndex].setInputYoYGrowth;
                          // 売上推移
                          const salesTrends = inputSalesTargetsList[rowIndex].salesTrends;
                          const setSalesTrends = inputSalesTargetsList[rowIndex].setSalesTrends;

                          // 行の期間タイプとカラムの値に応じて表示するデータをフォーマット
                          const displayCellValue = formatDisplayValue(row, column);
                          return (
                            <div
                              key={colIndex}
                              role="gridcell"
                              aria-colindex={colIndex + 1}
                              aria-selected={false}
                              tabIndex={-1}
                              className={`${styles.grid_cell}`}
                              style={{
                                gridColumnStart: colIndex + 1,
                                ...(column === "share" && { padding: `0px` }),
                              }}
                            >
                              {column === "period_type" && <span>{rowHeaderName}</span>}
                              {column === "sales_target" && row.period_type !== "second_half" && (
                                <input
                                  type="text"
                                  // placeholder="例：600万円 → 6000000　※半角で入力"
                                  className={`${styles.input_box} ${styles.upsert}`}
                                  // value={inputDiscountAmountEdit ? inputDiscountAmountEdit : ""}
                                  value={inputSalesTarget ? inputSalesTarget : ""}
                                  onChange={(e) => {
                                    setInputSalesTarget(e.target.value);
                                  }}
                                  onFocus={() => {
                                    // 売上目標が0以外のfalsyならリターン
                                    if (!isValidNumber(inputSalesTarget.replace(/[^\d.]/g, ""))) {
                                      console.log(
                                        "リターンinputSalesTarget",
                                        inputSalesTarget,
                                        !isValidNumber(inputSalesTarget)
                                      );
                                      return;
                                    }
                                    console.log("こここinputSalesTarget", inputSalesTarget);
                                    // フォーカス時は数字と小数点以外除去
                                    setInputSalesTarget(inputSalesTarget.replace(/[^\d.]/g, ""));
                                  }}
                                  onBlur={(e) => {
                                    // 現在の売上目標金額
                                    const replacedPrice = inputSalesTarget.replace(/[^\d.]/g, "");

                                    // 売上目標が空文字の場合は売上推移から目標を取り除いてリターンする
                                    if (!checkNotFalsyExcludeZero(replacedPrice)) {
                                      console.log("売上推移をリセット", replacedPrice);
                                      // 売上推移をリセット
                                      setSalesTrends({
                                        ...salesSummaryRowData[rowIndex].sales_trend,
                                        updateAt: Date.now(),
                                      });
                                      // 年度の売上目標が空文字になった場合には、上期と下期のシェアと売上推移をリセット
                                      // 下期の売上目標をリセット
                                      setInputSalesTargetSecondHalf("");
                                      // 下期の売上推移をリセット
                                      setSalesTrendsSecondHalf({
                                        ...salesSummaryRowData[2].sales_trend,
                                        updateAt: Date.now(),
                                      });
                                      // 下期の前年比をリセット
                                      setInputYoYGrowthSecondHalf("");
                                      // 上期下期のシェアをリセット
                                      setShareFirstHalf(0);
                                      setShareSecondHalf(0);
                                      return;
                                    }
                                    // フォーマット後の目標金額
                                    // const convertedDiscountPrice = checkNotFalsyExcludeZero(inputSalesTarget)
                                    //   ? convertToYen(inputSalesTarget.trim())
                                    //   : null;
                                    const convertedSalesTarget = checkNotFalsyExcludeZero(inputSalesTarget)
                                      ? convertToYen(inputSalesTarget)
                                      : null;
                                    const newFormatDiscountAmount = formatDisplayPrice(convertedSalesTarget || 0);
                                    setInputSalesTarget(newFormatDiscountAmount);

                                    // 前年比の計算
                                    const {
                                      yearOverYear,
                                      error: yoyError,
                                      isPositive,
                                    } = calculateYearOverYear(
                                      convertedSalesTarget,
                                      row.last_year_sales,
                                      1,
                                      true,
                                      false
                                    );
                                    if (yoyError) {
                                      console.log(`❌${row.period_type} 値引率の取得に失敗`, yoyError);
                                      setInputYoYGrowth("");
                                    } else if (yearOverYear) {
                                      setInputYoYGrowth(yearOverYear);
                                    }

                                    // 売上推移に追加
                                    if (salesTrends) {
                                      // ディープコピー
                                      let newTrend = cloneDeep(salesTrends) as SparkChartObj;
                                      let newDataArray = [...newTrend.data];
                                      const newDate =
                                        row.period_type === "fiscal_year"
                                          ? upsertSettingEntitiesObj.fiscalYear
                                          : row.period_type === "first_half"
                                          ? upsertSettingEntitiesObj.fiscalYear * 10 + 1
                                          : upsertSettingEntitiesObj.fiscalYear * 10 + 2;
                                      const newData = {
                                        date: newDate,
                                        value: convertedSalesTarget,
                                      };
                                      if (newDataArray.length === 3) {
                                        newDataArray.push(newData);
                                      } else if (newDataArray.length === 4) {
                                        newDataArray.splice(-1, 1, newData);
                                      }
                                      const newTitle =
                                        row.period_type === "fiscal_year"
                                          ? `FY${upsertSettingEntitiesObj.fiscalYear}`
                                          : row.period_type === "first_half"
                                          ? `${upsertSettingEntitiesObj.fiscalYear}H1`
                                          : `${upsertSettingEntitiesObj.fiscalYear}H2`;
                                      newTrend = {
                                        ...newTrend,
                                        title: newTitle,
                                        mainValue: convertedSalesTarget,
                                        growthRate: yearOverYear ? parseFloat(yearOverYear.replace(/%/g, "")) : null,
                                        data: newDataArray,
                                      };
                                      console.log(
                                        "ここ🔥🔥🔥🔥🔥🔥 newTrend",
                                        newTrend,
                                        "row.period_type ",
                                        row.period_type
                                      );
                                      setSalesTrends({ ...newTrend, updateAt: Date.now() });
                                    }

                                    // 同時にシェア、下半期も計算して更新する
                                    if (row.period_type === "first_half" || row.period_type === "fiscal_year") {
                                      const convertedTotalTargetYear = inputSalesTargetYear.replace(/[^\d.]/g, "");
                                      const convertedFirstHalfTarget = inputSalesTargetFirstHalf.replace(/[^\d.]/g, "");
                                      if (
                                        (row.period_type === "first_half" &&
                                          isValidNumber(convertedTotalTargetYear) &&
                                          isValidNumber(convertedSalesTarget) &&
                                          inputSalesTargetYear !== "0") ||
                                        (row.period_type === "fiscal_year" &&
                                          isValidNumber(convertedSalesTarget) &&
                                          isValidNumber(convertedFirstHalfTarget) &&
                                          convertedFirstHalfTarget !== "0")
                                      ) {
                                        try {
                                          // 🔹年度と上期の売上目標 Decimalオブジェクトの生成
                                          const totalTargetDecimal = new Decimal(
                                            row.period_type === "first_half"
                                              ? convertedTotalTargetYear
                                              : convertedSalesTarget!
                                          );
                                          const firstHalfTargetDecimal = new Decimal(
                                            row.period_type === "first_half"
                                              ? convertedSalesTarget!
                                              : convertedFirstHalfTarget
                                          );
                                          // 🔸上半期が年度を上回っていた場合は、他方をリセット
                                          // 年度入力で年度が上半期を下回った場合は上半期をリセット
                                          if (
                                            row.period_type === "fiscal_year" &&
                                            totalTargetDecimal.lessThan(firstHalfTargetDecimal)
                                          ) {
                                            // 上期・下期 売上目標をリセット
                                            setInputSalesTargetFirstHalf("");
                                            setInputSalesTargetSecondHalf("");
                                            // 上期・下期 シェアをリセット
                                            setShareFirstHalf(0);
                                            setShareSecondHalf(0);
                                            // 上期・下期 前年比をリセット
                                            setInputYoYGrowthFirstHalf("");
                                            setInputYoYGrowthSecondHalf("");
                                            // 上期・下期 売上推移をリセット
                                            setSalesTrendsFirstHalf({
                                              ...salesSummaryRowData[1].sales_trend,
                                              updateAt: Date.now(),
                                            });
                                            setSalesTrendsSecondHalf({
                                              ...salesSummaryRowData[2].sales_trend,
                                              updateAt: Date.now(),
                                            });
                                            // 年度が上期を下回った場合にはここでリターン
                                            return;
                                          }
                                          // 上期入力で上期が年度を上回っていた場合は年度をリセット
                                          else if (
                                            row.period_type === "first_half" &&
                                            totalTargetDecimal.lessThan(firstHalfTargetDecimal)
                                          ) {
                                            // 年度・下期 売上目標をリセット
                                            setInputSalesTargetYear("");
                                            setInputSalesTargetSecondHalf("");
                                            // 上期・下期 シェアをリセット(上期は年度売上目標がリセットされるためシェアもリセット)
                                            setShareFirstHalf(0);
                                            setShareSecondHalf(0);
                                            // 年度・下期 前年比をリセット
                                            setInputYoYGrowthYear("");
                                            setInputYoYGrowthSecondHalf("");
                                            // 年度・下期 売上推移をリセット
                                            setSalesTrendsYear({
                                              ...salesSummaryRowData[0].sales_trend,
                                              updateAt: Date.now(),
                                            });
                                            setSalesTrendsSecondHalf({
                                              ...salesSummaryRowData[2].sales_trend,
                                              updateAt: Date.now(),
                                            });
                                            // 年度が上期を下回った場合にはここでリターン
                                            return;
                                          }

                                          // 🔸シェアの算出
                                          // ---------- 🔹companyレベル以外でのサブターゲットの場合 ----------
                                          // 全社以外はメイン目標に対してシェア割を算出
                                          if (entityLevel !== "company") {
                                            // 年度が入力され、かつ、上半期が入力されている場合
                                            // 🔹上期シェアを計算し、整数に丸める
                                            const firstHalfShare = firstHalfTargetDecimal
                                              .dividedBy(totalTargetDecimal)
                                              .times(100)
                                              .toFixed(0, Decimal.ROUND_HALF_UP);
                                            setShareFirstHalf(Number(firstHalfShare));
                                            // 下期シェアを計算する（100から上期シェアを引く）
                                            const secondHalfShare = 100 - Number(firstHalfShare);
                                            setShareSecondHalf(secondHalfShare);
                                          }
                                          // ---------- 🔹companyレベルでのメインターゲットの場合 ----------
                                          // 全社内の期間でシェア割を算出
                                          else {
                                            // 🔹上期シェアを計算し、整数に丸める
                                            const firstHalfShare = firstHalfTargetDecimal
                                              .dividedBy(totalTargetDecimal)
                                              .times(100)
                                              .toFixed(0, Decimal.ROUND_HALF_UP);
                                            setShareFirstHalf(Number(firstHalfShare));
                                            // 下期シェアを計算する（100から上期シェアを引く）
                                            const secondHalfShare = 100 - Number(firstHalfShare);
                                            setShareSecondHalf(secondHalfShare);
                                          }

                                          // 🔸下期売上目標を計算して更新
                                          const newSecondHalfTarget = totalTargetDecimal
                                            .minus(firstHalfTargetDecimal)
                                            .toNumber();
                                          const formattedSecondHalfTarget = formatDisplayPrice(newSecondHalfTarget);
                                          setInputSalesTargetSecondHalf(formattedSecondHalfTarget);
                                          // 下期前年比を算出
                                          // 前年比
                                          const secondHalfResult = calculateYearOverYear(
                                            newSecondHalfTarget,
                                            salesSummaryRowData[salesSummaryRowData.length - 1].last_year_sales,
                                            1,
                                            true,
                                            false
                                          );
                                          if (secondHalfResult.error) {
                                            // toast.error(`エラー：${secondHalfResult.error}🙇‍♀️`);
                                            console.log(
                                              `❌${
                                                salesSummaryRowData[salesSummaryRowData.length - 1].period_type
                                              } 値引率の取得に失敗`,
                                              secondHalfResult.error
                                            );
                                            setInputYoYGrowthSecondHalf("");
                                          } else if (secondHalfResult.yearOverYear) {
                                            setInputYoYGrowthSecondHalf(secondHalfResult.yearOverYear);
                                          }

                                          // 🔹下期の売上推移に追加
                                          if (salesTrendsSecondHalf && isValidNumber(newSecondHalfTarget)) {
                                            // ディープコピー
                                            let newTrend = cloneDeep(salesTrendsSecondHalf) as SparkChartObj;
                                            let newDataArray = [...newTrend.data];
                                            const newDate = upsertSettingEntitiesObj.fiscalYear * 10 + 2; // 下期
                                            const newData = {
                                              date: newDate,
                                              value: newSecondHalfTarget,
                                            };
                                            if (newDataArray.length === 3) {
                                              newDataArray.push(newData);
                                            } else if (newDataArray.length === 4) {
                                              newDataArray.splice(-1, 1, newData);
                                            }
                                            const newTitle = `${upsertSettingEntitiesObj.fiscalYear}H2`;
                                            newTrend = {
                                              ...newTrend,
                                              title: newTitle,
                                              mainValue: newSecondHalfTarget,
                                              growthRate: secondHalfResult.yearOverYear
                                                ? parseFloat(secondHalfResult.yearOverYear.replace(/%/g, ""))
                                                : null,
                                              data: newDataArray,
                                            };
                                            console.log(
                                              "ここ🔥🔥🔥🔥🔥🔥 newTrend",
                                              newTrend,
                                              "row.period_type ",
                                              row.period_type
                                            );
                                            setSalesTrendsSecondHalf({ ...newTrend, updateAt: Date.now() });
                                          }
                                        } catch (error: any) {
                                          toast.error("エラー：シェアの算出に失敗しました...🙇‍♀️");
                                          console.log(`❌入力値"${inputSalesTargetFirstHalf}"が無効です。`, error);
                                        }
                                      }
                                    }
                                  }}
                                />
                              )}
                              {column === "sales_target" && row.period_type === "second_half" && (
                                <span className={`px-[8px] text-[15px]`}>{inputSalesTargetSecondHalf ?? ""}</span>
                              )}
                              {column === "share" && (
                                <>
                                  <div
                                    className={`${styles.grid_header_cell_share} flex-center relative h-full w-full pb-[12px]`}
                                  >
                                    {isMounted && (
                                      <>
                                        <ProgressCircle
                                          circleId="3"
                                          textId="3"
                                          progress={getShare(row.period_type)}
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
                                          targetNumber={getShare(row.period_type)}
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
                                          customClass={`absolute bottom-[7px] left-[50%] translate-x-[-50%] text-[5px]`}
                                          textColor={`var(--color-text-sub)`}
                                        />
                                      </>
                                    )}
                                  </div>
                                </>
                              )}
                              {["yoy_growth", "yo2y_growth"].includes(column) && (
                                <div className="flex h-full w-full items-center whitespace-pre-wrap">
                                  {/* <span>{displayCellValue}</span> */}
                                  {/* <span>{inputYoYGrowth}</span> */}
                                  {column === "yoy_growth" && <span>{inputYoYGrowth || "- %"}</span>}
                                  {column === "yo2y_growth" && <span>{displayCellValue}</span>}
                                </div>
                              )}
                              {["last_year_sales", "two_years_ago_sales", "three_years_ago_sales"].includes(column) && (
                                <div className="flex h-full w-full items-center whitespace-pre-wrap">
                                  {/* 10兆5256億2430万2100円 */}
                                  {displayCellValue}
                                </div>
                              )}
                              {column === "sales_trend" && salesTrends && (
                                <SparkChart
                                  key={`${row.period_type}_${salesTrends?.title}_${salesTrends?.mainValue}_${salesTrends?.data?.length}_${salesTrends.updateAt}`}
                                  id={`${row.period_type}_${salesTrends?.title}_${salesTrends?.mainValue}_${salesTrends?.data?.length}_${salesTrends.updateAt}`}
                                  title={salesTrends.title}
                                  subTitle={salesTrends.subTitle}
                                  mainValue={salesTrends.mainValue} // COALESCE関数で売上がなくても0が入るためnumber型になる
                                  growthRate={salesTrends.growthRate}
                                  data={salesTrends.data}
                                  dataUpdateAt={salesTrends.updateAt}
                                  // title={row.sales_trend.title}
                                  // subTitle={row.sales_trend.subTitle}
                                  // mainValue={row.sales_trend.mainValue} // COALESCE関数で売上がなくても0が入るためnumber型になる
                                  // growthRate={row.sales_trend.growthRate}
                                  // data={row.sales_trend.data}
                                  // title={`${upsertTargetObj.fiscalYear - rowIndex}年度`}
                                  height={48}
                                  width={270}
                                  delay={600}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                {/* ----------- Row 年度・半期リスト ここまで ----------- */}
              </div>
              {/* ----------- rowgroup ここまで ----------- */}
            </div>
            {/* ------------------ Gridコンテナ ここまで ------------------ */}
          </div>
          {/* ------------------ メインコンテナ ここまで ------------------ */}
        </div>
      </div>
    </>
  );
};

export const UpsertSettingTargetGridTable = memo(UpsertSettingTargetGridTableMemo);
