import { memo, useEffect, useMemo, useState } from "react";
import styles from "../../../../DashboardSalesTargetComponent.module.css";
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
import { donutChartData, donutLabelData, salesProbabilityList } from "./dataDonutChart";
import { useMedia } from "react-use";
import { formatToJapaneseYen } from "@/utils/Helpers/formatToJapaneseYen";
import { mappingSalesProbablyShort } from "@/utils/selectOptions";
import useStore from "@/store";

type Props = {
  companyId: string;
  entityLevel: string;
  entityIdsArray: string[];
  periodTitle: string;
  periodType: string;
  basePeriod: number;
  yearsBack: number;
  fetchEnabled?: boolean;
  fallbackHeight?: string;
  fallbackPadding?: string;
  fontSize?: string;
  errorText?: string;
  noDataText?: string;
};

const DonutChartDealsMemo = ({
  companyId,
  entityLevel,
  entityIdsArray,
  periodTitle,
  periodType,
  basePeriod,
  yearsBack,
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

  const chartData = donutChartData;

  const chartHeight = 286;
  const pieChartRadius = 78;
  const paddingX = 60;
  //   const chartContainerWidth = 248;
  const chartContainerWidth = 224;
  //   const chartCenterX = 124;
  const chartCenterX = 112;

  const labelType = "date";

  // チャート マウントを0.6s遅らせる
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    if (isMounted) return;
    setTimeout(() => {
      setIsMounted(true);
    }, 600);
  }, []);

  console.log("DonutChartDealsレンダリング");

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
            <DonutChartComponent
              // colors={COLORS}
              // colorsSheer={COLORS_SHEER}
              colors={COLORS_DEAL}
              colorsSheer={COLORS_DEAL_SHEER}
              // colors={COLORS_GRD}
              // colorsSheer={COLORS_GRD_SHEER}
              chartHeight={chartHeight}
              chartCenterX={chartCenterX}
              chartData={chartData}
              periodType={periodType}
              labelType={labelType}
              // labelValueGroupByPeriod={labelValueGroupByPeriod}
              // legendList={legendList}
              fallbackHeight={fallbackHeight}
              fallbackPadding={`0px 6px 8px 24px`}
            />
          </div>
          <div
            className={`fade08_forward flex h-full min-h-full w-full flex-col bg-[gray]/[0]`}
            style={{ minHeight: chartHeight }}
          >
            <div className={`w-full`}>
              <h4 className={`text-[14px]`}>残ネタ獲得・売上予測</h4>
            </div>
            <div className={`mt-[15px] flex w-full justify-between text-[12px] text-[var(--color-text-sub)]`}>
              <div>
                {/* <span>Category</span> */}
                <span>受注確度</span>
              </div>
              <div className={`flex space-x-[6px]`}>
                {/* <span>Average Price</span> */}
                <span>平均単価</span>
                <span>/</span>
                {/* <span>Quantity</span> */}
                <span>件数</span>
                <span>/</span>
                {/* <span>Quantity</span> */}
                <span>確度</span>
                <span>/</span>
                {/* <span>Amount</span> */}
                {/* <span>合計 (確度込み)</span> */}
                <span>合計（確度込み）</span>
              </div>
            </div>
            <ul className={`flex w-full flex-col`}>
              {donutLabelData.map((deal, index) => {
                return (
                  <li
                    key={`deal_status_${index}`}
                    //   className={`flex w-full justify-between border-b border-solid border-[var(--color-border-base)] pb-[9px] pt-[12px]`}
                    className={`w-full border-b border-solid border-[var(--color-border-base)] pb-[9px] pt-[12px]`}
                    style={{ display: `grid`, gridTemplateColumns: `80px 1fr` }}
                  >
                    <div className={`flex items-center`}>
                      <div
                        className={`mr-[9px] min-h-[9px] min-w-[9px] rounded-[12px]`}
                        style={{ background: `${COLORS_DEAL[index]}` }}
                      />
                      <div className="text-[13px] text-[var(--color-text-title)]">
                        {/* <span>A</span> */}
                        {/* <span>⚪️</span> */}
                        <span>
                          {mappingSalesProbablyShort[chartData[index].name][language]}
                          {index !== 0 ? `ネタ` : ``}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`flex items-center justify-end text-[13px] text-[var(--color-text-title)]`}
                      style={{ ...(!isDesktopGTE1600 && { maxWidth: `312px` }) }}
                      // style={{
                      //   display: `grid`,
                      //   gridTemplateColumns: isDesktopGTE1600 ? `repeat(4, max-content)` : `97px 54px 47px 114px`,
                      //   //   gridTemplateColumns: `repeat(4, max-content)`,
                      // }}
                    >
                      <div className={`flex justify-end  ${isDesktopGTE1600 ? `pl-[15px]` : ` pl-[12px]`}`}>
                        {/* <span className={`${isDesktopGTE1600 ? `` : `max-w-[85px]`} truncate`}>¥ 2,240,000</span> */}
                        <span className={`${isDesktopGTE1600 ? `` : `max-w-[85px]`} truncate`}>
                          {formatToJapaneseYen(deal.average_price)}
                        </span>
                      </div>
                      <div className={`flex justify-end ${isDesktopGTE1600 ? `pl-[15px]` : ` pl-[12px]`}`}>
                        <span className={`${isDesktopGTE1600 ? `` : `max-w-[42px]`} truncate`}>{deal.quantity}件</span>
                      </div>
                      <div className={`flex justify-end ${isDesktopGTE1600 ? `pl-[15px]` : `pl-[12px]`}`}>
                        <span className={`${isDesktopGTE1600 ? `` : `max-w-[35px]`} truncate`}>100%</span>
                      </div>
                      <div className={`flex justify-end ${isDesktopGTE1600 ? `pl-[15px]` : `pl-[12px]`}`}>
                        <span className={`${isDesktopGTE1600 ? `` : `max-w-[102px]`} truncate`}>
                          {/* ¥ 32,650,000,000 */}
                          {formatToJapaneseYen(deal.average_price)}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
              <li className={`flex w-full justify-between pb-[9px] pt-[12px]`}>
                <div className={`flex items-center`}>
                  <div
                    className={`mr-[9px] min-h-[9px] min-w-[9px] rounded-[12px]`}
                    // style={{ background: `${COLORS_DEAL[index]}` }}
                  />
                  <div className="text-[13px] font-bold text-[var(--color-text-title)]">
                    <span>合計予測</span>
                  </div>
                </div>
                <div className={`flex items-center space-x-[12px] text-[13px] text-[var(--color-text-title)]`}>
                  {/* <div className={``}>
                <span>¥ 3,240,000</span>
              </div> */}
                  {/* <div className={``}>
                <span>12件</span>
              </div> */}
                  <div className={`font-bold`}>
                    <span>¥ 12,950,000,000,000</span>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export const DonutChartDeals = memo(DonutChartDealsMemo);
