import { AreaChartComponent } from "@/components/Parts/Charts/AreaChart/AreaChart";
import styles from "../../../DashboardSalesTargetComponent.module.css";
import { Dispatch, SetStateAction, memo, useEffect, useMemo, useState } from "react";
import { useQuerySalesTrends } from "@/hooks/useQuerySalesTrends";
import { SpinnerX } from "@/components/Parts/SpinnerX/SpinnerX";
import useDashboardStore from "@/store/useDashboardStore";
import { AreaChartObj, FiscalYearAllKeys, FiscalYearMonthKey, LabelValue, LabelValueGroupByPeriod } from "@/types";

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
  displayTypeForTrend: "sub_entities" | "main_entity";
  selectedPeriodForChart: FiscalYearAllKeys;
  periodEndTrend: string | null;
  setPeriodEndTrend: Dispatch<SetStateAction<string | null>>;
  selectedFiscalYear: number;
};

// 過去3年分の売上実績に今回の売上目標を追加して4つ分のデータをエリアチャートに表示する

const AreaChartTrendWithTargetMemo = ({
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
  displayTypeForTrend,
  selectedPeriodForChart,
  periodEndTrend,
  setPeriodEndTrend,
  selectedFiscalYear,
}: Props) => {
  // 選択中の会計年度
  const selectedFiscalYearTarget = useDashboardStore((state) => state.selectedFiscalYearTarget);

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

  // console.log("エリアチャートトレンドコンポーネント data", data, "isError", isError, "isLoading", isLoading);

  if (isLoading)
    return (
      <div className={`flex-center w-full`} style={{ minHeight: fallbackHeight, padding: fallbackPadding }}>
        <SpinnerX />
      </div>
    );

  if (!data || isError)
    return (
      // <div className={`flex-center w-full`} style={{ minHeight: fallbackHeight, padding: fallbackPadding }}>
      <div className={`flex-center `} style={{ minHeight: fallbackHeight, padding: fallbackPadding }}>
        <span style={{ fontSize: fontSize }}>
          {(!data || !data.chartData?.length) && !isError && noDataText}
          {isError && errorText}
        </span>
      </div>
    );

  // useQueryで取得した結果を分割代入
  const {
    chartData,
    labelValueGroupByPeriod,
    salesTrends,
    legendList,
    groupedByPeriod,
    labelType,
    entityIdToNameMapping,
  } = data;

  // ------------- 売上目標を追加 -------------
  const mainTotalTargets = useDashboardStore((state) => state.mainTotalTargets);
  const subEntitiesSalesTargets = useDashboardStore((state) => state.subEntitiesSalesTargets);
  // 🔹売上目標フェッチ時の年月度の12ヶ月分の配列
  const annualFiscalMonths = useDashboardStore((state) => state.annualFiscalMonths);

  const [convertedChartData, setConvertedChartData] = useState<AreaChartObj[]>(chartData);
  const [convertedLabelValueGroupByPeriod, setConvertedLabelValueGroupByPeriod] =
    useState<LabelValueGroupByPeriod[]>(labelValueGroupByPeriod);

  const [isLoadingAddedTarget, setIsLoadingAddedTarget] = useState(true); // 初期値をtrueに

  // サブ目標 エンティティidからエンティティの売上目標オブジェクトを取得するMapオブジェクト
  const subEntityIdToObjMap = useMemo(() => {
    if (!subEntitiesSalesTargets) return null;
    return new Map(subEntitiesSalesTargets.map((subEntity) => [subEntity.entity_id, subEntity]));
  }, [subEntitiesSalesTargets]);

  const salesTargetDate = useMemo(() => {
    if (!chartData || !chartData?.length) return undefined;

    return `${periodType === "year_month" ? Number(chartData[2].date) + 100 : Number(chartData[2].date) + 10}`;
    // const month = String(chartData[0].date).substring(4); // 年度以降の文字列を抜き出し
    // return `${selectedFiscalYearTarget}${month}`;
  }, [chartData]);

  useEffect(() => {
    if (!chartData || !labelValueGroupByPeriod || !annualFiscalMonths) {
      setIsLoadingAddedTarget(false);
      return;
    }
    // ローディング開始
    setIsLoadingAddedTarget(true);

    const month = String(chartData[0].date).substring(4); // 年度以降の文字列を抜き出し
    const _date = `${periodType === "year_month" ? Number(chartData[2].date) + 100 : Number(chartData[2].date) + 10}`;
    // const monthKey = `month_${month}`; // month_01, ... month_12

    // 🔹メイン目標を追加
    if (displayTypeForTrend === "main_entity" && mainTotalTargets) {
      // entityIdsArrayの売上目標が設定されている場合は末尾に売上目標を追加
      try {
        //  const _date = `${selectedFiscalYearTarget}${month}`
        const newTargetChartObj = {
          date: _date, // 現在選択中の期間の選択年度でセットして売上目標を追加
          value1: mainTotalTargets.sales_targets[selectedPeriodForChart],
        } as AreaChartObj;

        const newLabelValueGroupByPeriodObj = {
          // date: `${selectedFiscalYearTarget}${month}`,
          date: _date,
          label_list: labelValueGroupByPeriod[0].label_list.map(
            (labelList) =>
              ({
                id: labelList.id,
                label: labelList.label,
                value: mainTotalTargets.sales_targets[selectedPeriodForChart],
                prev_value: mainTotalTargets.last_year_sales[selectedPeriodForChart],
                growth_rate: mainTotalTargets.yoy_growth[selectedPeriodForChart],
              } as LabelValue)
          ),
        } as LabelValueGroupByPeriod;

        const newChartData = [...chartData];
        const newLabelValueGroupByPeriod = [...labelValueGroupByPeriod];

        if (newChartData.length === 3) {
          newChartData.push(newTargetChartObj);
          newLabelValueGroupByPeriod.push(newLabelValueGroupByPeriodObj);
        } else if (newChartData.length === 4) {
          newChartData.splice(-1, 1, newTargetChartObj);
          newLabelValueGroupByPeriod.splice(-1, 1, newLabelValueGroupByPeriodObj);
        }

        const targetYearMonthYear = String(_date).substring(0, 4);
        const targetYearMonthMonth = String(parseInt(String(_date).substring(4), 10));

        console.log(
          "🌠🌠🌠🌠🌠🌠🌠🌠売上推移 メイン目標追加",
          "newChartData",
          newChartData,
          "newLabelValueGroupByPeriod",
          newLabelValueGroupByPeriod,
          "monthKey",
          `month_${month}`,
          "_date",
          _date,
          "targetYearMonthYear",
          targetYearMonthYear,
          "targetYearMonthMonth",
          targetYearMonthMonth
        );

        setConvertedChartData(newChartData);
        setConvertedLabelValueGroupByPeriod(newLabelValueGroupByPeriod);

        // 04 => 4, 1 => 1
        const periodWithoutZero = String(parseInt(month, 10));

        const newPeriodEndTrend =
          periodType === "fiscal_year"
            ? `${selectedFiscalYearTarget}年度`
            : periodType === "half_year"
            ? `${selectedFiscalYearTarget}H${periodWithoutZero}`
            : periodType === "quarter"
            ? `${selectedFiscalYearTarget}Q${periodWithoutZero}`
            : periodType === "year_month"
            ? `${targetYearMonthYear}年${targetYearMonthMonth}月度`
            : `-`;
        setPeriodEndTrend(newPeriodEndTrend);
      } catch (e: any) {
        console.error("売上推移 main 追加エラー", e);
      }
    }
    // 🔹メインエンティティを表示の時にmainTotalTargets?.sales_targetsが存在しない場合には過去3年分の売上実績のみ表示
    else if (displayTypeForTrend === "sub_entities" && !mainTotalTargets) {
      console.log("🌠🌠🌠🌠✅✅✅✅売上推移 メイン目標削除");
      // 既に売上目標が追加されている状態かチェック(3年分の実績+目標1年分の計４つ)
      if (convertedChartData.length > 3) setConvertedChartData(chartData);
      if (convertedLabelValueGroupByPeriod.length > 3) setConvertedLabelValueGroupByPeriod(labelValueGroupByPeriod);
      if (periodEndTrend) setPeriodEndTrend(null);
    }

    // 🔹各エンティティのサブ目標を追加
    if (
      displayTypeForTrend === "sub_entities" &&
      subEntitiesSalesTargets &&
      entityIdToNameMapping &&
      subEntityIdToObjMap
    ) {
      // entityIdsArrayの売上目標が設定されている場合は末尾に売上目標を追加
      const month = String(chartData[0].date).substring(4); // 年度以降の文字列を抜き出し
      const monthKey = `month_${month}`; // month_01, ... month_12
      console.log(
        "ここchartData[0].date",
        chartData[0].date,
        "month",
        month,
        `月: ${selectedFiscalYearTarget}${month}`
      );
      // entityIdsArrayの売上目標が設定されている場合は末尾に売上目標を追加
      try {
        // 現在のvalue1, value2の個数がentitiesのエンティティ数と一致、
        // なので、売上目標を入れた4つのdateの回数分, forEachでvalueXXとエンティティidに対応した目標をセットする
        let newTargetChartObj: AreaChartObj = {} as AreaChartObj;

        const valueToEntityIdMap = new Map(Object.entries(entityIdToNameMapping).map(([key, value]) => [value, key]));

        // 新たなチャートデータ:「{date: xxx, value1: xxx, value2: xxx, ...}」を作成 valueXXはエンティティ数と同じ個数
        Object.keys(chartData[0]).forEach((key) => {
          if (key === "date") {
            // const _date = `${selectedFiscalYearTarget}${month}`;
            newTargetChartObj["date"] = _date;
            console.log("ここここnewTargetChartObj", newTargetChartObj, "_date", _date);
          } else {
            // keyがvalueXXのルート valueXXに対応するエンティティidを取得してからidに対応する売上目標をセット

            const entityId = valueToEntityIdMap.get(key); // エンティティidを取得
            if (!entityId) throw new Error("売上推移 chartData entityId is undefined エラー:007");
            const subEntitySalesTarget = subEntityIdToObjMap.get(entityId);
            if (!subEntitySalesTarget)
              throw new Error("売上推移 chartData 売上目標データが見つかりませんでした。 エラー:008");
            const newSalesTarget = subEntitySalesTarget.sales_target_obj.sales_targets[selectedPeriodForChart];
            if (newSalesTarget === null) throw new Error("売上推移 chartData newSalesTarget is null エラー:009");
            newTargetChartObj[key] = newSalesTarget;

            // console.log(
            //   "ここここnewTargetChartObj",
            //   newTargetChartObj,
            //   "valueToEntityIdMap",
            //   valueToEntityIdMap,
            //   "key",
            //   key,
            //   "entityIdToNameMapping",
            //   entityIdToNameMapping,
            //   "chartData",
            //   chartData,
            //   "chartData[0]",
            //   chartData[0],
            //   "subEntityIdToObjMap",
            //   subEntityIdToObjMap,
            //   "entityId",
            //   entityId,
            //   "subEntitySalesTarget",
            //   subEntitySalesTarget,
            //   "selectedPeriodForChart",
            //   selectedPeriodForChart,
            //   "newSalesTarget",
            //   newSalesTarget
            // );
          }
        });

        // 新たなラベルデータを作成
        const newLabelValueGroupByPeriodObj = {
          // date: `${selectedFiscalYearTarget}${month}`,
          date: _date,
          label_list: labelValueGroupByPeriod[0].label_list.map((labelList) => {
            const subEntitySalesTargetObj = subEntityIdToObjMap.get(labelList.id);
            if (!subEntitySalesTargetObj) throw new Error("売上推移 label entityId is undefined エラー:010");
            const subObj = subEntitySalesTargetObj.sales_target_obj;
            return {
              id: labelList.id,
              label: labelList.label,
              value: subObj.sales_targets[selectedPeriodForChart],
              prev_value: subObj.last_year_sales[selectedPeriodForChart],
              growth_rate: subObj.yoy_growth[selectedPeriodForChart],
            } as LabelValue;
          }),
        } as LabelValueGroupByPeriod;

        const newChartData = [...chartData];
        const newLabelValueGroupByPeriod = [...labelValueGroupByPeriod];

        if (newChartData.length === 3) {
          newChartData.push(newTargetChartObj);
          newLabelValueGroupByPeriod.push(newLabelValueGroupByPeriodObj);
        } else if (newChartData.length === 4) {
          newChartData.splice(-1, 1, newTargetChartObj);
          newLabelValueGroupByPeriod.splice(-1, 1, newLabelValueGroupByPeriodObj);
        }

        const targetYearMonthYear = String(_date).substring(0, 4);
        const targetYearMonthMonth = String(parseInt(String(_date).substring(4), 10));

        console.log(
          "🌠🌠🌠🌠🌠🌠🌠🌠売上推移 サブ目標追加",
          "newChartData",
          newChartData,
          "newLabelValueGroupByPeriod",
          newLabelValueGroupByPeriod,
          "monthKey",
          `month_${month}`,
          "_date",
          _date,
          "targetYearMonthYear",
          targetYearMonthYear,
          "targetYearMonthMonth",
          targetYearMonthMonth
        );

        setConvertedChartData(newChartData);
        setConvertedLabelValueGroupByPeriod(newLabelValueGroupByPeriod);

        // 04 => 4, 1 => 1
        const periodWithoutZero = String(parseInt(month, 10));
        const newPeriodEndTrend =
          periodType === "fiscal_year"
            ? `${selectedFiscalYearTarget}年度`
            : periodType === "half_year"
            ? `${selectedFiscalYearTarget}H${periodWithoutZero}`
            : periodType === "quarter"
            ? `${selectedFiscalYearTarget}Q${periodWithoutZero}`
            : periodType === "year_month"
            ? `${targetYearMonthYear}年${targetYearMonthMonth}月度`
            : `-`;
        setPeriodEndTrend(newPeriodEndTrend);
      } catch (e: any) {
        console.error("売上推移 sub 追加エラー", e);
      }
    }
    // 🔹各サブエンティティを表示の時にsubEntitiesSalesTargetsが存在しない場合には過去3年分の売上実績のみ表示
    else if (displayTypeForTrend === "sub_entities" && !subEntitiesSalesTargets) {
      console.log("🌠🌠🌠🌠✅✅✅✅売上推移 メイン目標削除");
      if (convertedChartData.length > 3) setConvertedChartData(chartData);
      if (convertedLabelValueGroupByPeriod.length > 3) setConvertedLabelValueGroupByPeriod(labelValueGroupByPeriod);

      if (periodEndTrend) setPeriodEndTrend(null);
    }

    // ローディング終了
    setIsLoadingAddedTarget(false);
  }, [chartData, labelValueGroupByPeriod, mainTotalTargets, subEntitiesSalesTargets]);

  // ------------- 売上目標を追加 ここまで -------------

  if (isLoadingAddedTarget)
    return (
      <div className={`flex-center w-full`} style={{ minHeight: fallbackHeight, padding: fallbackPadding }}>
        <SpinnerX />
      </div>
    );

  console.log(
    "エリアチャートトレンドコンポーネント data",
    data
    // "convertedChartData",
    // convertedChartData,
    // "convertedLabelValueGroupByPeriod",
    // convertedLabelValueGroupByPeriod,
    // "mainTotalTargets",
    // mainTotalTargets,
    // "subEntitiesSalesTargets",
    // subEntitiesSalesTargets,
    // "displayTypeForTrend",
    // displayTypeForTrend,
    // "selectedPeriodForChart",
    // selectedPeriodForChart,
    // "salesTargetDate",
    // salesTargetDate
  );

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
        // chartData={chartData}
        chartData={convertedChartData}
        periodType={periodType}
        labelType={labelType}
        // labelValueGroupByPeriod={labelValueGroupByPeriod}
        labelValueGroupByPeriod={convertedLabelValueGroupByPeriod}
        legendList={legendList}
        fallbackHeight={fallbackHeight}
        fallbackPadding={`0px 6px 8px 24px`}
        salesTargetDate={salesTargetDate}
      />
      {/* エリアチャート ここまで */}
    </div>
  );
};

export const AreaChartTrendWithTarget = memo(AreaChartTrendWithTargetMemo);
