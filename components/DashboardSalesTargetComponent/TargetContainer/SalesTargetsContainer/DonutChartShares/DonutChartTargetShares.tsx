import { memo, useEffect, useMemo, useRef, useState } from "react";
import styles from "../../../DashboardSalesTargetComponent.module.css";
import { SpinnerX } from "@/components/Parts/SpinnerX/SpinnerX";
import { DonutChartComponent } from "@/components/Parts/Charts/DonutChart/DonutChart";
import { subDays } from "date-fns";
import {
  COLORS,
  COLORS_BRAND,
  COLORS_BRAND_SHEER,
  COLORS_DEAL,
  COLORS_DEAL_SHEER,
  COLORS_GRD,
  COLORS_GRD_SHEER,
  COLORS_SHEER,
} from "@/components/Parts/Charts/Seeds/seedData";
import { useMedia } from "react-use";
import { formatToJapaneseYen } from "@/utils/Helpers/formatToJapaneseYen";
import { mappingSalesProbablyShort } from "@/utils/selectOptions";
import useStore from "@/store";
import { useQuerySalesProbability } from "@/hooks/useQuerySalesProbability";
import { isValidNumber } from "@/utils/Helpers/isValidNumber";
import { useQuerySalesTargetsShare } from "@/hooks/useQuerySalesTargetsShare";
import { EntityLevelNames, EntityObjForChart, FiscalYearAllKeys } from "@/types";
import { DonutChartCustomComponent } from "@/components/Parts/Charts/DonutChart/DonutChartCustom";
import { mappingEntityName } from "@/utils/mappings";

type Props = {
  companyId: string;
  parentEntityId: string; // queryKey用
  parentEntityTotalMainTarget: number;
  entityLevel: EntityLevelNames;
  entityLevelId: string;
  fiscalYearId: string;
  entities: EntityObjForChart[];
  // entityId: string;
  periodTitle: string;
  // periodType: "fiscal_year" | "half_year" | "quarter" | "year_month";
  periodType: FiscalYearAllKeys;
  basePeriod: number;
  fetchEnabled?: boolean;
  fallbackHeight?: string;
  fallbackPadding?: string;
  fontSize?: string;
  errorText?: string;
  noDataText?: string;
};

const DonutChartTargetSharesMemo = ({
  companyId,
  parentEntityId,
  parentEntityTotalMainTarget,
  entityLevel,
  entityLevelId,
  fiscalYearId,
  entities,
  // entityId,
  periodTitle,
  periodType,
  basePeriod,
  fetchEnabled,
  fallbackHeight = "302px",
  fallbackPadding = `0px 0px 6px`,
  fontSize = `13px`,
  errorText = `エラーが発生しました`,
  noDataText = `データがありません`,
}: Props) => {
  const language = useStore((state) => state.language);
  // デスクトップモニター
  const isDesktopGTE1600Media = useMedia("(min-width: 1600px)", false);
  const [isDesktopGTE1600, setIsDesktopGTE1600] = useState(isDesktopGTE1600Media);
  useEffect(() => {
    setIsDesktopGTE1600(isDesktopGTE1600Media);
  }, [isDesktopGTE1600Media]);

  // useQueryでcreated_by_XXXの各確度別の台数と%を掛けた合計予定売上金額を算出してname, value(予定合計金額), total_countを取得
  // ------------------------- テストデータ -------------------------
  //   const chartData = useMemo(() => {
  //     const data: { [key: string]: any; name: string; value: number }[] = [];
  //     // for (let num = 30; num >= 0; num--) {
  //     //   data.push({
  //     //     date: subDays(new Date(), num).toISOString().substring(0, 10),
  //     //     // value: 1 + Math.random(),
  //     //     value1: 1 + Math.random(),
  //     //     value2: 1 + Math.random(),
  //     //   });
  //     // }
  //     for (let num = 3; num >= 0; num--) {
  //       data.push({
  //         name: `name_${num}`,
  //         value: 1 + Math.random(),
  //       });
  //     }
  //     return data;
  //   }, []);
  // ------------------------- テストデータ ここまで -------------------------

  // ------------------------- useQuery残ネタ取得 -------------------------
  const { data, isLoading, isError } = useQuerySalesTargetsShare({
    companyId,
    parentEntityId,
    parentEntityTotalMainTarget,
    entityLevel,
    entityLevelId,
    fiscalYearId,
    entities,
    periodType, // 期間タイプ FiscalYearAllKeysの全ての期間タイプ
    basePeriod, // 起点となる時点
    fetchEnabled,
  });
  // ------------------------- useQuery残ネタ取得 ここまで -------------------------

  console.log("DonutChartTargetSharesレンダリング data", data, "isError", isError, "isLoading", isLoading);

  if (isLoading)
    return (
      <div className={`flex-center w-full`} style={{ minHeight: fallbackHeight, padding: fallbackPadding }}>
        <SpinnerX />
      </div>
    );

  if (!data || isError)
    return (
      <div className={`flex-center w-full`} style={{ minHeight: fallbackHeight, padding: fallbackPadding }}>
        <span style={{ fontSize: fontSize }}>
          {(!data || !data.chartData?.length) && !isError && noDataText}
          {isError && errorText}
        </span>
      </div>
    );

  // ホバー中のセクター
  const [activeIndex, setActiveIndex] = useState(1000);

  const chartData = data.chartData;
  const totalAmount = data.total_amount;
  const donutLabelData = data.labelListShareSalesTargets;
  // const donutLabelData = data.labelListSalesProbabilities;

  const chartHeight = 286;
  const pieChartRadius = 78;
  const paddingX = 60;
  //   const chartContainerWidth = 248;
  const chartContainerWidth = 224;
  //   const chartCenterX = 124;
  const chartCenterX = 112;

  const labelType = "sales_target_share";

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
      className={`${styles.area_chart_container} flex w-full ${isDesktopGTE1600 ? `` : `max-w-[643px]`} bg-[red]/[0]`}
      style={{ padding: `0px 24px 16px 6px` }}
    >
      {!isMounted && (
        <div className={`flex-center w-full`} style={{ minHeight: fallbackHeight, padding: `0px 6px 8px 24px` }}>
          <SpinnerX />
        </div>
      )}
      {isMounted && (
        <>
          <div
            className={`flex-center relative`}
            style={{
              minWidth: chartContainerWidth ? chartContainerWidth : `calc(${pieChartRadius * 2 + paddingX * 2})`,
            }}
          >
            <div className={`absolute left-0 top-0 flex h-full w-[448px] items-center bg-[blue]/[0]`}>
              <DonutChartCustomComponent
                colors={COLORS_DEAL}
                colorsSheer={COLORS_DEAL_SHEER}
                chartHeight={chartHeight}
                chartCenterX={chartCenterX}
                chartData={chartData}
                labelListSalesTargetShare={donutLabelData}
                totalAmount={totalAmount}
                periodType={periodType}
                labelType={labelType}
                fallbackHeight={fallbackHeight}
                fallbackPadding={`0px 6px 8px 24px`}
                activeIndexParent={activeIndex}
                setActiveIndexParent={setActiveIndex}
              />
            </div>
          </div>
          <div
            className={`fade08_forward flex h-full min-h-full w-full flex-col bg-[gray]/[0]`}
            style={{ minHeight: chartHeight }}
          >
            <div className={`w-full`}>{/* <h4 className={`text-[14px]`}>残ネタ獲得・売上予測</h4> */}</div>
            <div className={`mt-[15px] flex w-full justify-between text-[12px] text-[var(--color-text-sub)]`}>
              <div>
                {/* <span>Category</span> */}
                <span>{mappingEntityName[entityLevel][language]}</span>
              </div>
              <div className={`flex space-x-[6px]`}>
                <span>目標金額</span>
                <span>/</span>
                <span>シェア</span>
              </div>
            </div>
            <ul className={`flex w-full flex-col`}>
              {donutLabelData.map((shareObj, index) => {
                return (
                  <li
                    key={`share_${index}`}
                    //   className={`flex w-full justify-between border-b border-solid border-[var(--color-border-base)] pb-[9px] pt-[12px]`}
                    className={`w-full border-b border-solid border-[var(--color-border-base)] pb-[9px] pt-[12px] ${
                      styles.deal_list
                    } ${activeIndex === 1000 ? `` : activeIndex === index ? `` : `${styles.inactive}`}`}
                    style={{ display: `grid`, gridTemplateColumns: `80px 1fr` }}
                  >
                    <div className={`flex items-center`}>
                      <div
                        className={`mr-[9px] min-h-[9px] min-w-[9px] rounded-[12px]`}
                        style={{
                          background:
                            activeIndex === 1000
                              ? `${COLORS_DEAL[index]}`
                              : activeIndex === index
                              ? `${COLORS_DEAL[index]}`
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
                        {/* <span className={`${isDesktopGTE1600 ? `` : `max-w-[85px]`} truncate`}>¥ 2,240,000</span> */}
                        <span className={`${isDesktopGTE1600 ? `` : `max-w-[85px]`} min-w-[85px] truncate text-end`}>
                          {isValidNumber(shareObj.average_price) ? formatToJapaneseYen(shareObj.amount) : `¥ -`}
                        </span>
                      </div>
                      <div className={`flex justify-end ${isDesktopGTE1600 ? `pl-[15px]` : `pl-[12px]`}`}>
                        <span className={`${isDesktopGTE1600 ? `` : `max-w-[35px]`} min-w-[35px] truncate text-end`}>
                          {shareObj.share}%
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
              {/* <li className={`flex w-full justify-between pb-[9px] pt-[12px]`}>
                <div className={`flex items-center`}>
                  <div
                    className={`mr-[9px] min-h-[9px] min-w-[9px] rounded-[12px]`}
                    // style={{ background: `${COLORS_DEAL[index]}` }}
                  />
                  <div className="text-[13px] font-bold text-[var(--color-text-title)]">
                    <span>残ネタ獲得 合計予測</span>
                  </div>
                </div>
                <div className={`flex items-center space-x-[12px] text-[13px] text-[var(--color-text-title)]`}>
                  <div className={`font-bold`}>
                    <span>{formatToJapaneseYen(totalAmount, true)}</span>
                  </div>
                </div>
              </li> */}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export const DonutChartTargetShares = memo(DonutChartTargetSharesMemo);
