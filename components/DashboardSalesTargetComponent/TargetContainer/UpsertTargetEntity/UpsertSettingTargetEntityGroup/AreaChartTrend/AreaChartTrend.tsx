import { AreaChartComponent } from "@/components/Parts/Charts/AreaChart/AreaChart";
import styles from "../../../../DashboardSalesTargetComponent.module.css";
import { memo, useMemo } from "react";
import { useQuerySalesTrends } from "@/hooks/useQuerySalesTrends";
import { SpinnerX } from "@/components/Parts/SpinnerX/SpinnerX";

type Props = {
  companyId: string;
  entityLevel: string;
  entityIdsArray: string[];
  // periodType: string;
  periodType: "fiscal_year" | "half_year" | "quarter" | "year_month";
  basePeriod: number;
  yearsBack: number;
  fetchEnabled?: boolean;
  fallbackHeight?: string;
  fallbackPadding?: string;
  fontSize?: string;
  errorText?: string;
  noDataText?: string;
  selectedFiscalYear: number;
};

const AreaChartTrendMemo = ({
  companyId,
  entityLevel,
  entityIdsArray,
  periodType,
  basePeriod,
  yearsBack,
  fetchEnabled,
  fallbackHeight = "302px",
  fallbackPadding = `0px 0px 6px`,
  fontSize = `13px`,
  errorText = `エラーが発生しました`,
  noDataText = `データがありません`,
  selectedFiscalYear,
}: Props) => {
  // キャッシュ用エンティティidをstringに
  const entityIdsStrKey = useMemo(() => {
    return !!entityIdsArray?.length ? entityIdsArray.join(", ") : "";
  }, []);
  const { data, isLoading, isError } = useQuerySalesTrends({
    companyId,
    entityLevel,
    entityIdsArray,
    entityIdsStrKey, // キャッシュ用エンティティidをstringに
    periodType,
    basePeriod,
    yearsBack,
    fetchEnabled: fetchEnabled,
    selectedFiscalYear,
  });

  console.log("エリアチャートトレンドコンポーネント data", data, "isError", isError, "isLoading", isLoading);

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

  // useQueryで取得した結果を分割代入
  const { chartData, labelValueGroupByPeriod, salesTrends, legendList, groupedByPeriod, labelType } = data;

  return (
    <div
      // className={`${styles.area_chart_container} mt-[16px] h-[288px] w-full bg-[red]/[0]`}
      className={`${styles.area_chart_container}  w-full bg-[red]/[0]`}
      style={{ padding: `0px 24px 16px 6px` }}
    >
      {/* エリアチャート */}
      <AreaChartComponent
        chartHeight={286}
        delay={600}
        chartData={chartData}
        periodType={periodType}
        labelType={labelType}
        labelValueGroupByPeriod={labelValueGroupByPeriod}
        legendList={legendList}
        fallbackHeight={fallbackHeight}
        fallbackPadding={`0px 6px 8px 24px`}
      />
      {/* エリアチャート ここまで */}
    </div>
  );
};

export const AreaChartTrend = memo(AreaChartTrendMemo);
