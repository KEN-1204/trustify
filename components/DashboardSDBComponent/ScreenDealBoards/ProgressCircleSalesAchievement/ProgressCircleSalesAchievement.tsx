import { memo, useEffect, useMemo, useRef, useState } from "react";
import styles from "../../DashboardSDBComponent.module.css";
import { SpinnerX } from "@/components/Parts/SpinnerX/SpinnerX";
import { DonutChartComponent } from "@/components/Parts/Charts/DonutChart/DonutChart";
import { subDays } from "date-fns";
import { colorsHEXTrend } from "@/components/Parts/Charts/Seeds/seedData";
import { useMedia } from "react-use";
import { formatToJapaneseYen } from "@/utils/Helpers/formatToJapaneseYen";
import useStore from "@/store";
import { isValidNumber } from "@/utils/Helpers/isValidNumber";
import {
  EntityLevelNames,
  EntityObjForChart,
  FiscalYearAllKeys,
  PropertiesPeriodKey,
  SalesProcessesForSDB,
} from "@/types";
import { mappingEntityName } from "@/utils/mappings";
import { roundTo } from "@/utils/Helpers/PercentHelpers/roundTo";
import { ProgressCircle } from "@/components/Parts/Charts/ProgressCircle/ProgressCircle";
import { ProgressNumber } from "@/components/Parts/Charts/ProgressNumber/ProgressNumber";
import { useQuerySDBSalesProcessesForProgress } from "@/hooks/useQuerySDBSalesProcessesForProgress";
import useDashboardStore from "@/store/useDashboardStore";

type Props = {
  fiscalYear: number;
  fiscalYearId: string;
  companyId: string;
  entityId: string;
  entityName: string;
  entityLevel: EntityLevelNames;
  entityLevelId: string;
  entityStructureId: string;
  // periodType: FiscalYearAllKeys;
  periodTypeForTarget: FiscalYearAllKeys | null;
  periodTypeForProperty: PropertiesPeriodKey;
  basePeriod: number;
  // halfYearPeriod: number;
  // halfYearPeriodTypeForTarget: "first_half" | "second_half";
  current_sales_amount: number | null;
  current_sales_target: number | null;
  current_achievement_rate: number | null;
  fetchEnabled?: boolean;
  fallbackHeight?: string;
  fallbackPadding?: string;
  fontSize?: string;
  errorText?: string;
  noDataText?: string;
  isRenderProgress: boolean;
};

const ProgressCircleSalesAchievementMemo = ({
  fiscalYear,
  fiscalYearId,
  companyId,
  entityId,
  entityName,
  entityLevel,
  entityLevelId,
  entityStructureId,
  periodTypeForTarget,
  periodTypeForProperty,
  basePeriod,
  // halfYearPeriod,
  // halfYearPeriodTypeForTarget,
  fetchEnabled,
  fallbackHeight = "302px",
  fallbackPadding = `0px 0px 6px`,
  fontSize = `13px`,
  errorText = `エラーが発生しました`,
  noDataText = `データがありません`,
  current_sales_amount,
  current_sales_target,
  current_achievement_rate,
  isRenderProgress,
}: Props) => {
  const language = useStore((state) => state.language);
  // デスクトップモニター
  const isDesktopGTE1600Media = useMedia("(min-width: 1600px)", false);
  const [isDesktopGTE1600, setIsDesktopGTE1600] = useState(isDesktopGTE1600Media);
  useEffect(() => {
    setIsDesktopGTE1600(isDesktopGTE1600Media);
  }, [isDesktopGTE1600Media]);

  // 🔹表示中の会計年度(グローバル)(SDB用)
  const selectedFiscalYearTargetSDB = useDashboardStore((state) => state.selectedFiscalYearTargetSDB);
  // 選択中の期間が上期か下期か(SDB用)
  const selectedPeriodTypeHalfDetailSDB = useDashboardStore((state) => state.selectedPeriodTypeHalfDetailSDB);

  const halfYearPeriodValue = useMemo(() => {
    if (!selectedFiscalYearTargetSDB) return null;
    const periodValue = selectedPeriodTypeHalfDetailSDB === "first_half_details" ? 1 : 2;
    return selectedFiscalYearTargetSDB * 10 + periodValue;
  }, [selectedFiscalYearTargetSDB, selectedPeriodTypeHalfDetailSDB]);

  // ------------------------- useQuery各プロセスの進捗を取得 -------------------------
  const { data, isLoading, isError } = useQuerySDBSalesProcessesForProgress({
    fiscalYear,
    fiscalYearId,
    entityLevelId,
    entityStructureId,
    companyId,
    entityId,
    entityLevel,
    periodTypeForTarget,
    periodTypeForProperty,
    basePeriod,
    halfYearPeriod: halfYearPeriodValue,
    halfYearPeriodTypeForTarget:
      selectedPeriodTypeHalfDetailSDB === "first_half_details" ? "first_half" : "second_half",
    fetchEnabled: halfYearPeriodValue !== null && !!periodTypeForTarget,
  });
  // ------------------------- useQuery各プロセスの進捗を取得 ここまで -------------------------

  // プロセスに関しては、企業ごとにやり方が異なるので、目標と達成率は売上のみ管理する
  // テスト TELPRと面談は別途最初に表示 CV率は表示しない fiscal_year 今期 next_fiscal_year 来期

  // 【TEL関連】は一旦無し => メール・TEL・訪問中のダイレクトなど面談にこぎつける手法はなんでも良いため
  // TELタイトル：TEL発信/PR(通電)/アポ率/PR(通電) (アポ率に総架電は含めない 理由は売り前フォロー時やサポート時のTEL不在が含まれ、正確なTELPR目的のみのTEL発信を表さないため)
  // TEL発信：不在、能動、受動、売り前フォロー、売り後フォロー、アポ組、TEL発信の全ての件数(総架電件数)
  // PR(通電)：活動タイプのTEL発信(能動)とTEL発信(受動)

  // 【TEL関連】
  // TELPR件数：活動タイプ：「TEL発信(能動)」「TEL発信(受動)」「TEL発信()

  // ✅【面談関連】
  // 面談：総面談(全ての面談)・新規面談(面談目的の能動と受動のみ)

  // 展開/A：展開・展開F・展開F獲得数・A数

  // 標準プロセス 結果(メンバーの場合は親エンティティAveを表示)

  if (isLoading)
    return (
      <div className={`flex-center w-full`} style={{ minHeight: fallbackHeight, padding: fallbackPadding }}>
        <SpinnerX />
      </div>
    );

  if (!halfYearPeriodValue)
    return <div className={`flex-center w-full`} style={{ minHeight: fallbackHeight, padding: fallbackPadding }}></div>;

  if (!data || isError)
    return (
      <div className={`flex-center w-full`} style={{ minHeight: fallbackHeight, padding: fallbackPadding }}>
        <span style={{ fontSize: fontSize }}>
          {(!data || !data.length) && !isError && noDataText}
          {isError && errorText}
        </span>
      </div>
    );

  // // const chartHeight = 286;
  // const chartHeight = 286;
  // const pieChartRadius = 78;
  // const paddingX = 60;
  // //   const chartContainerWidth = 248;
  const chartContainerWidth = 224;
  // //   const chartCenterX = 124;
  // const chartCenterX = 112;

  const labelType = "sales_target_share";

  // const colors = colorsHEXTrend; // COLORS_DEAL
  // const colorsSheer = colorsHEXTrend;

  // const processArrayTest = [
  //   // { category: `call_pr`, result: 30 },
  //   // { category: `call_all`, result: 30 },
  //   // { category: `meeting_new`, result: 25.4 }, // 事前にCTEで作成
  //   // { category: `meeting_all`, result: 30 },
  //   // { category: `expansion_all`, result: 25.4 }, // 事前にCTEで作成
  //   // { category: `expansion_rate`, result: 25.4 }, // 事前にCTEで作成
  //   // { category: `f_expansion`, result: 25.4 }, // 事前にCTEで作成
  //   // { category: `f_expansion_rate`, result: 25.4 }, // 事前にCTEで作成
  //   // { category: `half_year_f_expansion`, result: 25.4 }, // 事前にCTEで作成
  //   // { category: `half_year_f_expansion_award`, result: 25.4 }, // 事前にCTEで作成
  //   // { category: `half_year_f_expansion_award_rate`, result: 25.4 }, // 事前にCTEで作成
  //   // { category: `award`, result: 25.4 },
  //   // { category: `sales_total_amount`, result: 25.4 }, // 事前にCTEで作成
  //   // { category: `sales_target`, result: 25.4 }, // 事前にCTEで作成
  //   // { category: `achievement_rate`, result: 25.4 }, // 事前にCTEで作成
  //   // { category: `half_year_sales_total_amount`, result: 25.4 }, // 事前にCTEで作成
  //   // { category: `half_year_sales_target`, result: 25.4 }, // 事前にCTEで作成
  //   // { category: `half_year_achievement_rate`, result: 25.4 }, // 事前にCTEで作成
  //   { category: `TEL発信PR`, result: 25.4 },
  //   { category: `TEL発信All`, result: 25.4 },
  //   { category: `新規面談`, result: 25.4 }, // 事前にCTEで作成
  //   { category: `面談All`, result: 30 },
  //   { category: `展開`, result: 25.4 }, // 事前にCTEで作成
  //   { category: `展開率`, result: 25.4 }, // 事前にCTEで作成
  //   { category: `展開F`, result: 25.4 }, // 事前にCTEで作成
  //   { category: `展開F率`, result: 25.4 }, // 事前にCTEで作成
  //   { category: `A数(6月度)`, result: 25.4 },
  //   { category: `展開F(半期)`, result: 25.4 }, // 事前にCTEで作成
  //   { category: `F獲得(半期)`, result: 25.4 }, // 事前にCTEで作成
  //   { category: `F獲得率(半期)`, result: 25.4 }, // 事前にCTEで作成
  //   { category: `売上総額(6月度)`, result: 25.4 }, // 事前にCTEで作成
  //   { category: `目標(6月度)`, result: 25.4 }, // 事前にCTEで作成
  //   { category: `達成率(6月度)`, result: 25.4 }, // 事前にCTEで作成
  //   { category: `売上総額(半期)`, result: 25.4 }, // 事前にCTEで作成
  //   { category: `目標(半期)`, result: 25.4 }, // 事前にCTEで作成
  //   { category: `達成率(半期)`, result: 25.4 }, // 事前にCTEで作成
  // ];

  // ProgressCircle用売上(今月度)
  // const formattedTotalAmount = useMemo(
  //   () => (current_sales_amount !== null ? formatToJapaneseYen(current_sales_amount, true) : 0),
  //   [current_sales_amount]
  // );

  // key: category, value: objのMapオブジェクト
  const salesProcessesMap = useMemo(() => {
    if (!data) return null;
    return new Map(data.map((obj) => [obj.category, obj]));
  }, [data]);

  // 売上目標(今月度)
  const formattedSalesTarget = useMemo(
    () => (current_sales_target !== null ? formatToJapaneseYen(current_sales_target, false) : `-`),
    [current_sales_target]
  );

  // 売上実績(今月度)
  const formattedSalesAmount = useMemo(() => {
    if (!salesProcessesMap) return 0;
    return salesProcessesMap.get("sales_total_amount")?.result ?? 0;
  }, [salesProcessesMap]);

  // ProgressCircle用売上(今月度)
  const formattedAchievementRate = useMemo(() => {
    if (salesProcessesMap === null) return 0;
    const _achievement_rate = salesProcessesMap.get("achievement_rate")?.result;
    if (_achievement_rate === undefined || _achievement_rate === null) return 0;
    // 達成率が100以上なら100%で留める
    return 100 <= _achievement_rate ? 100 : Number(_achievement_rate.toFixed(0));
  }, [salesProcessesMap]);
  // const formattedAchievementRate = useMemo(() => {
  //   if (current_achievement_rate === null) return 0;
  //   // 達成率が100以上なら100%で留める
  //   return 100 <= current_achievement_rate ? 100 : Number(current_achievement_rate.toFixed(0));
  // }, [current_achievement_rate]);

  // 右側プロセス詳細
  const formattedResultArray = useMemo(() => {
    return data.map((obj) => {
      const getFormatResult = (processObj: SalesProcessesForSDB) => {
        if (!processObj) return `-`;

        switch (processObj.category) {
          case "call_pr":
          case "call_all":
          case "meeting_all":
          case "meeting_new":
          case "expansion_all":
          case "f_expansion":
          case "half_year_f_expansion":
          case "half_year_f_expansion_award":
          case "award":
          case "f_expansion":
            return processObj.result !== null ? `${processObj.result}件` : `- 件`;
            break;

          case "expansion_rate":
          case "f_expansion_rate":
          case "half_year_f_expansion_award_rate":
          case "f_expansion_rate":
          case "achievement_rate":
          case "half_year_achievement_rate":
            return processObj.result !== null ? `${processObj.result}%` : `- %`;
            break;

          case "sales_total_amount":
          case "sales_target":
          case "half_year_sales_total_amount":
          case "half_year_sales_target":
            return processObj.result !== null ? `${formatToJapaneseYen(processObj.result, true)}` : `-`;
            break;

          default:
            return `${processObj.result}`;
            break;
        }
      };
      const getFormatCategory = (processObj: SalesProcessesForSDB) => {
        if (!processObj) return `-`;

        const isJa = language === "ja";

        const isFirstHalf = selectedPeriodTypeHalfDetailSDB === "first_half_details";

        switch (processObj.category) {
          case "call_pr":
            return isJa ? `TEL PR` : `PR Call`;
          case "call_all":
            return isJa ? `TEL All` : `All Call`;

          case "meeting_all":
            return isJa ? `面談All` : `All Meeting`;
          case "meeting_new":
            return isJa ? `新規面談` : `New Meeting`;

          case "expansion_all":
            return isJa ? `展開数` : `All Expansion`;
          case "expansion_rate":
            return isJa ? `展開率` : `Expansion Rate`;

          case "f_expansion":
            return isJa ? `展開F` : `F Expansion`;
          case "f_expansion_rate":
            return isJa ? `展開F率` : `F Expansion Rate`;

          case "award":
            return isJa ? `A数` : `Award`;

          case "half_year_f_expansion":
            return isJa
              ? `展開F（${isFirstHalf ? `上期` : `下期`}）`
              : `${isFirstHalf ? `First` : `Second`} Half F Expansion`;
          case "half_year_f_expansion_award":
            return isJa
              ? `F獲得数（${isFirstHalf ? `上期` : `下期`}）`
              : `${isFirstHalf ? `First` : `Second`} Half F Expansion Award`;
          case "half_year_f_expansion_award_rate":
            return isJa
              ? `F獲得率（${isFirstHalf ? `上期` : `下期`}）`
              : `${isFirstHalf ? `First` : `Second`} Half F Expansion Award rate`;

          case "sales_total_amount":
            return isJa ? `売上` : `Sales Total Amount`;
          case "sales_target":
            return isJa ? `目標` : `Sales Target`;
          case "achievement_rate":
            return isJa ? `達成率` : `Achievement Rate`;

          case "half_year_sales_total_amount":
            return isJa
              ? `${isFirstHalf ? `上期` : `下期`}売上`
              : `${isFirstHalf ? `First` : `Second`} Half Sales Total Amount`;
          case "half_year_sales_target":
            return isJa
              ? `${isFirstHalf ? `上期` : `下期`}目標`
              : `${isFirstHalf ? `First` : `Second`} Half Sales Target`;
          case "half_year_achievement_rate":
            return isJa
              ? `${isFirstHalf ? `上期` : `下期`}達成率`
              : `${isFirstHalf ? `First` : `Second`} Half Achievement Rate`;
          default:
            return `${processObj.category}`;
            break;
        }
      };

      const formattedCategory = getFormatCategory(obj);
      const formattedResult = getFormatResult(obj);

      return {
        category: formattedCategory,
        result: formattedResult,
      };
    });
  }, [data]);

  console.log(
    "ProgressCircleSalesAchievementレンダリング data",
    data
    // "current_sales_amount",
    // current_sales_amount,
    // "current_sales_target",
    // current_sales_target,
    // "current_achievement_rate",
    // current_achievement_rate,
    // "formattedSalesTarget",
    // formattedSalesTarget,
    // "formattedAchievementRate",
    // formattedAchievementRate,
    // "formattedResultArray",
    // formattedResultArray
  );

  // チャート マウントを0.6s遅らせる
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    if (isMounted) return;
    setTimeout(() => {
      setIsMounted(true);
    }, 600);
  }, []);

  return (
    <div
      className={`${styles.area_chart_container} flex w-full flex-col ${
        isDesktopGTE1600 ? `` : `max-w-[686px]`
      } bg-[red]/[0]`}
      style={{ padding: `0px 24px 6px 6px`, minHeight: `304px` }}
    >
      {!isMounted && (
        <div className={`flex-center w-full`} style={{ minHeight: fallbackHeight, padding: `0px 6px 8px 24px` }}>
          <SpinnerX />
        </div>
      )}
      {isMounted && (
        <>
          <div className={`flex w-full`}>
            <div
              className={`flex-center relative`}
              style={{
                minWidth: chartContainerWidth,
                // height: `219px`,
                // height: `236px`,
                height: `226px`,
                // minWidth: chartContainerWidth ? chartContainerWidth : `calc(${pieChartRadius * 2 + paddingX * 2})`,
              }}
            >
              {/* <div className={`absolute left-0 top-0 flex h-auto w-full items-center bg-[blue]/[0]`}> */}
              <div className={`absolute left-0 top-0 flex h-auto w-full flex-col justify-center bg-[blue]/[0]`}>
                {/* <div className={`min-h-[57px] w-full`}></div> */}
                <div className={`min-h-[57px] w-full`}></div>
                <div className="flex h-full w-full pl-[30px]">
                  <div
                    // className={`relative z-[100] mb-[5px] flex w-full items-center pl-[34px]`}
                    className={`relative z-[100] mb-[5px] flex w-full items-center`}
                    // style={{ height: `${chartHeight}px` }}
                    style={{ height: `156px`, width: `156px` }}
                    // style={{ height: `269px` }}
                  >
                    <ProgressCircle
                      circleId={`${entityId}_achievement_board`}
                      textId={`${entityId}_achievement_board`}
                      // progress={78}
                      // progress={69}
                      progress={formattedAchievementRate}
                      // progress={110}
                      // progress={100}
                      // progress={0}
                      duration={5000}
                      easeFn="Quartic"
                      size={156}
                      strokeWidth={14}
                      fontSize={33}
                      // fontSize={28}
                      // fontWeight={600}
                      fontWeight={500}
                      fontFamily="var(--font-family-str)"
                      textColor="var(--color-text-title)"
                      isReady={true}
                      // withShadow={true}
                      withShadow={false}
                      // boxShadow={`0 0 1px 1px #ffffff90, 0 0 3px 2px #ffffff36, 0 0 3px 3px #ffffff15`}
                      // boxShadow={`0 0 1px 1px #ffffff90, 0 0 3px 2px #ffffff24, 0 0 3px 3px #ffffff12`}
                      fade={`fade08_forward`}
                      // fade={`fade10_forward`}
                      customText="達成率"
                      customFontSize={12}
                      customTextTop={`calc(50% + 28px)`}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`fade08_forward flex h-full min-h-full w-full flex-col bg-[gray]/[0]`}
              // style={{ minHeight: chartHeight }}
            >
              <div
                // className={`mt-[10px] flex h-auto w-full`}
                className={`mt-[0px] flex h-auto w-full`}
              >
                <h4 className={`text-[14px] font-bold`}>営業プロセス 結果</h4>
              </div>
              <div className={`mt-[5px] flex w-full justify-between text-[12px] text-[var(--color-text-sub)]`}></div>
              {/* <div className={`mt-[0px] flex w-full justify-between text-[12px] text-[var(--color-text-sub)]`}>
              <div>
                <span>カテゴリー</span>
              </div>
              <div className={`flex space-x-[6px]`}>
                <span>目標</span>
                <span>/</span>
                <span>結果</span>
                <span>/</span>
                <span>達成率</span>
              </div>
            </div> */}

              {/* <div className={`flex- relative max-h-[187px] w-full flex-col overflow-y-auto`}> */}
              {/* <div className={`relative flex max-h-[200px] w-full flex-col overflow-y-auto`}> */}
              <div className={`relative flex max-h-[200px] w-full max-w-[432px] flex-col overflow-auto`}>
                <div
                  className={`relative w-full`}
                  // style={{ display: `grid`, gridTemplateColumns: `repeat(2, minmax(196px, 1fr))`, columnGap: `20px` }}
                  style={{ display: `grid`, gridTemplateColumns: `repeat(2, 1fr)`, columnGap: `20px` }}
                >
                  {/* {formattedLabelDataArray &&
                  formattedLabelDataArray.map((shareObj, index) => {
                    return (
                      <li
                        key={`share_${index}`}
                        //   className={`flex w-full justify-between border-b border-solid border-[var(--color-border-base)] pb-[9px] pt-[12px]`}
                        className={`w-full border-b border-solid border-[var(--color-border-base)] pb-[9px] pt-[12px] ${
                          styles.deal_list
                        } ${activeIndex === 1000 ? `` : activeIndex === index ? `` : `${styles.inactive}`}`}
                        style={{ display: `grid`, gridTemplateColumns: `200px 1fr` }}
                      >
                        <div className={`flex items-center`}>
                          <div
                            className={`mr-[9px] min-h-[9px] min-w-[9px] rounded-[12px]`}
                            style={{
                              background:
                                activeIndex === 1000
                                  ? `${colors[index]}`
                                  : activeIndex === index
                                  ? `${colors[index]}`
                                  : `var(--color-text-disabled)`,
                            }}
                          />
                          <div className="text-[13px]">
                            <span>{chartData[index].name}</span>
                          </div>
                        </div>
                        <div
                          className={`flex items-center justify-end text-[13px]`}
                          style={{ ...(!isDesktopGTE1600 && { maxWidth: `312px` }) }}
                          // style={{
                          //   display: `grid`,
                          //   gridTemplateColumns: isDesktopGTE1600 ? `repeat(4, max-content)` : `97px 54px 47px 114px`,
                          //   //   gridTemplateColumns: `repeat(4, max-content)`,
                          // }}
                        >
                          <div className={`flex justify-end  ${isDesktopGTE1600 ? `pl-[15px]` : ` pl-[12px]`}`}>
                            <span className={`${isDesktopGTE1600 ? `` : ``} min-w-[85px] truncate text-end`}>
                              {shareObj.amount}
                            </span>
                          </div>
                          <div className={`flex justify-end ${isDesktopGTE1600 ? `pl-[15px]` : `pl-[12px]`}`}>
                            <div
                              className={`${
                                isDesktopGTE1600 ? `` : `max-w-[42px]`
                              } min-w-[35px] rounded-[4px] bg-[var(--color-sales-card-label-bg)] px-[6px] py-[2px] text-[10px]`}
                            >
                              <span className={`${isDesktopGTE1600 ? `` : `max-w-[42px]`} min-w-[35px]`}>
                                {shareObj.share}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })} */}
                  {/*  */}
                  {formattedResultArray.map((obj, index) => {
                    return (
                      <div
                        key={`standard_process_${index}_test`}
                        className={`w-full border-b border-solid border-[var(--color-border-base)] pb-[7px] pt-[9px] text-[var(--color-text-title)] `}
                        // style={{ display: `grid`, gridTemplateColumns: `90px 1fr` }}
                        style={{ display: `grid`, gridTemplateColumns: `max-content 1fr`, columnGap: `10px` }}
                      >
                        <div className={`flex items-center`}>
                          {/* <div className={`mr-[9px] min-h-[9px] min-w-[9px] rounded-[12px]`} /> */}
                          {/* {index % 2 === 0 && (
                            <div
                              className={`mr-[9px] min-h-[9px] min-w-[9px] rounded-[12px]`}
                              style={{
                                background: `${colors[Math.floor(index / 2)]}`,
                                // background: `var(--color-bg-brand-f)`,
                              }}
                            />
                          )} */}
                          <div className="text-[13px] font-bold">
                            <span>{obj.category}</span>
                          </div>
                        </div>
                        <div
                          className={`flex items-center justify-end text-[13px]`}
                          // style={{ ...(!isDesktopGTE1600 && { maxWidth: `312px` }) }}
                        >
                          <div className={`flex justify-end text-end`}>
                            {/* <span>{obj.category === "meeting_new" ? `${obj.result}` : `${obj.result}%`}</span> */}
                            <span>{obj.result}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {/*  */}
                </div>
              </div>
              {/* <li className={` flex w-full justify-between pb-[9px] pt-[12px]`}>
              <div className={`flex items-center`}>
                <div
                  className={`mr-[9px] min-h-[9px] min-w-[9px] rounded-[12px]`}
                  // style={{ background: `${COLORS_DEAL[index]}` }}
                />
                <div className="text-[13px] font-bold text-[var(--color-text-title)]">
                  <span>合計金額</span>
                </div>
              </div>
              <div className={`flex items-center space-x-[12px] text-[13px] text-[var(--color-text-title)]`}>
                <div
                  className={`flex items-center justify-end font-bold`}
                  style={{ ...(!isDesktopGTE1600 && { maxWidth: `312px` }) }}
                >
                  <div className={`flex justify-end  ${isDesktopGTE1600 ? `pl-[15px]` : ` pl-[12px]`}`}>
                    <span className={`${isDesktopGTE1600 ? `` : ``} min-w-[85px] truncate text-end`}>
                      <span>{formattedTotalAmount}</span>
                    </span>
                  </div>
                  <div className={`flex justify-end text-end ${isDesktopGTE1600 ? `pl-[15px]` : `pl-[12px]`}`}>
                    <div
                      className={`${
                        isDesktopGTE1600 ? `` : `max-w-[42px]`
                      } min-w-[35px] rounded-[4px] bg-[var(--color-sales-card-label-bg)] px-[5px] py-[2px] text-[11px] font-normal`}
                    >
                      <span className={`${isDesktopGTE1600 ? `` : `max-w-[42px]`} min-w-[35px]`}>100%</span>
                    </div>
                  </div>
                </div>
              </div>
            </li> */}

              {/* <div className={`flex h-full w-full items-end justify-end`}>
              <div className={`relative !ml-[24px] !mr-[12px] flex h-full min-h-[56px] w-auto items-end bg-[red]/[0]`}>
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
                  {<span className="text-[16px]">9,000,000</span>}
                </div>
              </div>
            </div> */}
            </div>
          </div>

          {isRenderProgress && (
            <div
              // className={`fade_forward08 flex h-full min-h-[58px] w-full items-end justify-start`}
              className={`fade_forward08 flex h-full min-h-[48px] w-full items-end justify-start`}
            >
              <div
                // className={`relative !ml-[24px] flex h-full min-h-[56px] w-auto items-end bg-[red]/[0]`}
                className={`relative !ml-[24px] flex h-full min-h-[40px] w-auto items-end bg-[red]/[0]`}
              >
                {/* <div className="flex h-full min-w-[150px] items-end justify-end"> */}
                <div className="relative flex h-full min-w-[66px] items-end justify-end">
                  {formattedSalesAmount !== null && formattedSalesAmount !== 0 ? (
                    <ProgressNumber
                      targetNumber={formattedSalesAmount}
                      // targetNumber={6200000}
                      // targetNumber={0}
                      // startNumber={Math.round(68000 / 2)}
                      // startNumber={Number((68000 * 0.1).toFixed(0))}
                      startNumber={0}
                      duration={3000}
                      easeFn="Quintic"
                      fontSize={29}
                      fontWeight={500}
                      // margin="0 0 -3px 0"
                      margin="0 0 -5px 0"
                      // isReady={isRenderProgress}
                      isReady={true}
                      fade={`fade08_forward`}
                    />
                  ) : (
                    <span
                      style={{
                        fontSize: `29px`,
                        fontWeight: 500,
                        color: `var(--color-text-title)`,
                        margin: `0 0 -5px 0`,
                      }}
                      className={`fade08_forward`}
                    >
                      {formatToJapaneseYen(0, true)}
                    </span>
                  )}

                  <div
                    className={`absolute bottom-[-18px] right-[0] flex min-w-max space-x-[6px] text-[10px] text-[var(--color-text-sub)]`}
                  >
                    <div className={`min-w-max whitespace-nowrap`}>売上</div>
                  </div>
                </div>
                <div className="relative h-full min-w-[33px]">
                  <div className="absolute bottom-[15px] left-[66%] min-h-[2px] w-[30px] translate-x-[-50%] translate-y-[-50%] rotate-[120deg] bg-[var(--color-text-title)]"></div>
                </div>
                <div className="relative mr-[12px] flex h-full min-w-max items-end justify-start">
                  <span className="ml-[6px] text-[18px]">{formattedSalesTarget}</span>
                  {/* <span className="ml-[6px] text-[18px]">9,000,000</span> */}
                  {/* <span className="ml-[12px] text-[18px]">-</span> */}
                  <div
                    // className={`absolute right-[0] top-[-18px] flex min-w-max space-x-[6px] text-[10px] text-[var(--color-text-sub)]`}
                    className={`absolute bottom-[-18px] right-[0] flex min-w-max space-x-[6px] text-[10px] text-[var(--color-text-sub)]`}
                  >
                    {/* <div className={`min-w-max whitespace-nowrap`}>売上</div> */}
                    {/* <div className={`min-w-max whitespace-nowrap`}>/</div> */}
                    <div className={`min-w-max whitespace-nowrap`}>目標</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export const ProgressCircleSalesAchievement = memo(ProgressCircleSalesAchievementMemo);
