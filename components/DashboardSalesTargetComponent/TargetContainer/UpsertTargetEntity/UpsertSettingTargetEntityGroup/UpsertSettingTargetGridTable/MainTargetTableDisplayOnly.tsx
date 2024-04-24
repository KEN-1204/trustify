import { CSSProperties, Dispatch, SetStateAction, memo, useCallback, useEffect, useMemo, useState } from "react";
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
import { convertToJapaneseCurrencyFormatInYen } from "@/utils/Helpers/Currency/convertToJapaneseCurrencyFormatInYen";
import { convertToJapaneseCurrencyFormat } from "@/utils/Helpers/convertToJapaneseCurrencyFormat";
import { useQuerySalesTargetsMain } from "@/hooks/useQuerySalesTargetsMain";

/**
 * //   // 売上目標input 「年度・上半期・下半期」
//   const [inputSalesTargetYear, setInputSalesTargetYear] = useState("");
//   const [inputSalesTargetFirstHalf, setInputSalesTargetFirstHalf] = useState("");
//   const [inputSalesTargetSecondHalf, setInputSalesTargetSecondHalf] = useState("");

//   // 前年比input 「年度・上半期・下半期」
//   const [inputYoYGrowthYear, setInputYoYGrowthYear] = useState<string>("");
//   const [inputYoYGrowthFirstHalf, setInputYoYGrowthFirstHalf] = useState<string>("");
//   const [inputYoYGrowthSecondHalf, setInputYoYGrowthSecondHalf] = useState<string>("");
 */

type Props = {
  // isMemberLevelSetting: boolean;
  entityLevel: string;
  entityNameTitle: string;
  entityId: string;
  stickyRow: string | null;
  setStickyRow: Dispatch<SetStateAction<string | null>>;
  annualFiscalMonths: FiscalYearMonthObjForTarget | null;
  fetchEnabled?: boolean; // メイン目標でない場合はfetchEnabledがtrueに変更されたらフェッチを許可する
  // salesTargetsYearHalf: {
  //   salesTargetYear: number;
  //   salesTargetFirstHalf: number;
  //   salesTargetSecondHalf: number;
  // };
};

const MainTargetTableDisplayOnlyMemo = ({
  // isMemberLevelSetting,
  entityLevel,
  entityNameTitle,
  entityId,
  stickyRow,
  setStickyRow,
  // fiscalYearMonthsForThreeYear,
  annualFiscalMonths,
  fetchEnabled = true,
}: // salesTargetsYearHalf,
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
  // const settingPeriodTypeForMemberLevel = useDashboardStore((state) => state.settingPeriodTypeForMemberLevel);

  const [isLoading, setIsLoading] = useState(false);

  const validateInputSalesTargets = useCallback((salesTargetArray: string[]) => {
    // return salesTargetArray.every((target) => isValidNumber(target));
    return salesTargetArray.every((target) => isValidNumber(target.replace(/[^\d.]/g, "")));
  }, []);

  // if (!upsertTargetObj || !userProfileState || !userProfileState.company_id) return;
  if (!upsertSettingEntitiesObj || !userProfileState || !userProfileState.company_id) return;

  // 「半期〜月度」
  // if (isMemberLevelSetting && !annualFiscalMonths) return null;

  // --------------------- 🌟メイン目標の売上目標をsales_targetsテーブルから取得🌟 ---------------------
  const {
    data: salesTargetsYearHalf,
    error: salesTargetsYearHalfError,
    isLoading: isLoadingSalesTargetsYearHalf,
    isError: isErrorSalesTargetsYearHalf,
  } = useQuerySalesTargetsMain({
    companyId: userProfileState.company_id,
    entityLevel: entityLevel,
    entityId: entityId,
    periodType: "year_half",
    fiscalYear: upsertSettingEntitiesObj.fiscalYear,
    fetchEnabled: true,
  });
  // --------------------- 🌟メイン目標の売上目標をsales_targetsテーブルから取得🌟 ---------------------
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
    fetchEnabled: fetchEnabled, // メイン目標はtrue, でなければfetchEnabledに従う
  });
  // --------------------- 🌟過去3年分の売上と前年度の前年伸び率実績を取得するuseQuery🌟 ここまで ---------------------

  // ---------------- ローカルstate ----------------
  // 売上目標input 「年度・上半期・下半期」
  const [inputSalesTargetYear, setInputSalesTargetYear] = useState(() => {
    if (!salesTargetsYearHalf) return "";
    const target = salesTargetsYearHalf.sales_target_year;
    return isValidNumber(target) ? formatDisplayPrice(target) : "";
  });
  const [inputSalesTargetFirstHalf, setInputSalesTargetFirstHalf] = useState(() => {
    if (!salesTargetsYearHalf) return "";
    const target = salesTargetsYearHalf.sales_target_first_half;
    return isValidNumber(target) ? formatDisplayPrice(target) : "";
  });
  const [inputSalesTargetSecondHalf, setInputSalesTargetSecondHalf] = useState(() => {
    if (!salesTargetsYearHalf) return "";
    const target = salesTargetsYearHalf.sales_target_second_half;
    return isValidNumber(target) ? formatDisplayPrice(target) : "";
  });

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

  // --------------------- 過去3年分の売上実績が取得できた後に売上推移をセット ---------------------
  // useEffect(() => {
  //   if (salesSummaryRowData) {
  //     if (salesTrendsYear && salesTrendsFirstHalf && salesTrendsSecondHalf) return;
  //     const newSalesTrendsYear =
  //       salesSummaryRowData.find((obj) => obj.period_type === "fiscal_year")?.sales_trend ?? null;
  //     const newSalesTrendsFirstHalf =
  //       salesSummaryRowData.find((obj) => obj.period_type === "first_half")?.sales_trend ?? null;
  //     const newSalesTrendsSecondHalf =
  //       salesSummaryRowData.find((obj) => obj.period_type === "second_half")?.sales_trend ?? null;
  //     setSalesTrendsYear(newSalesTrendsYear ? { ...newSalesTrendsYear, updateAt: Date.now() } : null);
  //     setSalesTrendsFirstHalf(newSalesTrendsFirstHalf ? { ...newSalesTrendsFirstHalf, updateAt: Date.now() } : null);
  //     setSalesTrendsSecondHalf(newSalesTrendsSecondHalf ? { ...newSalesTrendsSecondHalf, updateAt: Date.now() } : null);
  //   }
  // }, [salesSummaryRowData]);
  // --------------------- 過去3年分の売上実績が取得できた後に売上推移をセット ---------------------

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

  // --------------------- 🌟初回マウント時売上目標、前年比、売上推移、シェアをセット🌟 ---------------------
  // 親から受け取った「年度・上半期・下半期」の売上目標をstateにセットし、シェアと前年比のstateを更新
  const [isSet, setIsSet] = useState(false);
  useEffect(() => {
    if (!salesTargetsYearHalf) return alert("総合目標の売上目標データがが見つかりませんでした。");
    if (!salesSummaryRowData) return alert("売上実績データが見つかりませんでした。");
    const result = validateInputSalesTargets(inputSalesTargetsList.map((obj) => obj.inputTarget));
    if (!result) return alert("総合目標の売上目標に無効なデータが存在します。");

    if (isSet) return console.log("メイン目標 設定済み");

    inputSalesTargetsList.forEach((obj) => {
      const {
        key,
        title,
        inputTarget: inputSalesTarget,
        inputYoYGrowth,
        salesTrends,
        setInputTarget: setInputSalesTarget,
        setInputYoYGrowth,
        setSalesTrends,
      } = obj;

      // 期間タイプに対応した過去3年分の売り上げ実績と前年度の前年伸び率実績
      const salesSummaryRow = salesSummaryRowData.find((obj) => obj.period_type === key) || null;

      if (!salesSummaryRow) return;

      // 現在の売上目標金額
      const salesTarget =
        key === "fiscal_year"
          ? salesTargetsYearHalf.sales_target_year
          : key === "first_half"
          ? salesTargetsYearHalf.sales_target_first_half
          : salesTargetsYearHalf.sales_target_second_half;
      // const replacedPrice = inputSalesTarget.replace(/[^\d.]/g, "");

      // const convertedSalesTarget = checkNotFalsyExcludeZero(inputSalesTarget) ? convertToYen(inputSalesTarget) : 0;
      const convertedSalesTarget = checkNotFalsyExcludeZero(salesTarget) ? salesTarget : 0;
      const newFormatSalesTarget = convertToJapaneseCurrencyFormatInYen(convertedSalesTarget || 0);
      // const newFormatDiscountAmount = formatDisplayPrice(convertedSalesTarget || "0");
      setInputSalesTarget(newFormatSalesTarget);

      // 前年比の計算
      const {
        yearOverYear,
        error: yoyError,
        isPositive,
      } = calculateYearOverYear(convertedSalesTarget, salesSummaryRow.last_year_sales, 1, true, false);
      if (yoyError) {
        console.log(`❌${salesSummaryRow.period_type} 値引率の取得に失敗`, yoyError);
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
          salesSummaryRow.period_type === "fiscal_year"
            ? upsertSettingEntitiesObj.fiscalYear
            : salesSummaryRow.period_type === "first_half"
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
          salesSummaryRow.period_type === "fiscal_year"
            ? `FY${upsertSettingEntitiesObj.fiscalYear}`
            : salesSummaryRow.period_type === "first_half"
            ? `${upsertSettingEntitiesObj.fiscalYear}H1`
            : `${upsertSettingEntitiesObj.fiscalYear}H2`;
        newTrend = {
          ...newTrend,
          title: newTitle,
          mainValue: convertedSalesTarget,
          growthRate: yearOverYear ? parseFloat(yearOverYear.replace(/%/g, "")) : null,
          data: newDataArray,
        };
        console.log("ここ🔥🔥🔥🔥🔥🔥 newTrend", newTrend, "row.period_type ", salesSummaryRow.period_type);
        setSalesTrends({ ...newTrend, updateAt: Date.now() });
      }

      // 下期の場合はシェアの計算は不要 前年比と売上推移のみ算出 ここでリターン
      if (key === "second_half") {
        return;
      }

      // 同時にシェア、下半期も計算して更新する
      if (salesSummaryRow.period_type === "first_half" || salesSummaryRow.period_type === "fiscal_year") {
        const convertedTotalTargetYear = inputSalesTargetYear.replace(/[^\d.]/g, "");
        const convertedFirstHalfTarget = inputSalesTargetFirstHalf.replace(/[^\d.]/g, "");
        if (
          (salesSummaryRow.period_type === "first_half" &&
            isValidNumber(convertedTotalTargetYear) &&
            isValidNumber(convertedSalesTarget) &&
            inputSalesTargetYear !== "0") ||
          (salesSummaryRow.period_type === "fiscal_year" &&
            isValidNumber(convertedSalesTarget) &&
            isValidNumber(convertedFirstHalfTarget) &&
            convertedFirstHalfTarget !== "0")
        ) {
          try {
            // 年度と上期の売上目標 Decimalオブジェクトの生成
            const totalTargetDecimal = new Decimal(
              salesSummaryRow.period_type === "first_half" ? convertedTotalTargetYear : convertedSalesTarget!
            );
            const firstHalfTargetDecimal = new Decimal(
              salesSummaryRow.period_type === "first_half" ? convertedSalesTarget! : convertedFirstHalfTarget
            );

            // 上期シェアを計算し、整数に丸める
            const firstHalfShare = firstHalfTargetDecimal
              .dividedBy(totalTargetDecimal)
              .times(100)
              .toFixed(0, Decimal.ROUND_HALF_UP);
            setShareFirstHalf(Number(firstHalfShare));
            // 下期シェアを計算する（100から上期シェアを引く）
            const secondHalfShare = 100 - Number(firstHalfShare);
            setShareSecondHalf(secondHalfShare);
          } catch (error: any) {
            toast.error("エラー：シェアの算出に失敗しました...🙇‍♀️");
            console.log(`❌入力値"${inputSalesTargetFirstHalf}"が無効です。`, error);
          }
        }
      }
    });

    setIsSet(true);
  }, []);
  // --------------------- 🌟初回マウント時売上目標、前年比、売上推移、シェアをセット🌟 ---------------------

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

  // チャート マウントを0.6s遅らせる
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    if (isMounted) return;
    setTimeout(() => {
      setIsMounted(true);
    }, 600);
  }, []);

  console.log(
    "メインMainTargetTableDisplayOnlyコンポーネントレンダリング",
    "entityNameTitle",
    entityNameTitle,
    "salesTargetsYearHalf",
    salesTargetsYearHalf
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

  if (isLoadingQuery) return <FallbackScrollContainer title={entityNameTitle} />;

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
            <div className={`${styles.card_title}`}>
              <span>{entityNameTitle}</span>
              <div
                className={`flex-center ml-[18px] rounded-full border border-solid border-[var(--color-border-light)] px-[12px] py-[3px] text-[12px] text-[var(--color-text-sub)]`}
              >
                <span>総合目標</span>
              </div>
            </div>

            <div className={`${styles.btn_area} flex items-center space-x-[12px]`}>
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
                              {/* {column === "sales_target" && row.period_type !== "second_half" && (
                                <input
                                  type="text"
                                  // placeholder="例：600万円 → 6000000　※半角で入力"
                                  className={`${styles.input_box} ${styles.upsert}`}
                                  // value={inputDiscountAmountEdit ? inputDiscountAmountEdit : ""}
                                  value={inputSalesTarget ? inputSalesTarget : ""}
                                  readOnly
                                  // onChange={(e) => {
                                  //   setInputSalesTarget(e.target.value);
                                  // }}
                                />
                              )} */}
                              {column === "sales_target" && row.period_type !== "second_half" && (
                                <span className={`px-[8px] text-[15px] font-bold`}>{inputSalesTarget ?? ""}</span>
                              )}
                              {column === "sales_target" && row.period_type === "second_half" && (
                                <span className={`px-[8px] text-[15px] font-bold`}>
                                  {inputSalesTargetSecondHalf ?? ""}
                                </span>
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

export const MainTargetTableDisplayOnly = memo(MainTargetTableDisplayOnlyMemo);
