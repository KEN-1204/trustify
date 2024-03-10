import { memo } from "react";
import styles from "./SettingSalesTargets.module.css";

function formatSalesTarget(num: number): string {
  let unit = "";
  let dividedNum = num;

  if (num >= 1000000000000) {
    dividedNum = num / 1000000000000;
    unit = "兆";
  } else if (num >= 100000000) {
    dividedNum = num / 100000000;
    unit = "億";
  } else if (num >= 10000) {
    dividedNum = num / 10000;
    unit = "万";
  } else {
    return num.toString();
  }

  let formattedNumber = dividedNum.toFixed(3); // 小数点以下3桁まで保持する
  // 末尾の不要な0を削除
  const formattedNumberWithoutZero = parseFloat(formattedNumber).toString();

  console.log(
    "formattedNumber",
    formattedNumber,
    "formattedNumberWithoutZero",
    formattedNumberWithoutZero,
    "dividedNum",
    dividedNum
  );

  return `${formattedNumberWithoutZero}${unit}`;
  //   return `${formattedNumber}${unit}`;
}

const formatPeriodType = (periodType: string) => {
  switch (periodType) {
    case "fiscalYear":
      return "年度";
    case "half":
      return "半期";
    case "quarter":
      return "四半期";
    case "monthly":
      return "月度";
    default:
      break;
  }
};
const formatPeriodValue = (periodType: string, periodValue: number) => {
  let displayValue = periodValue.toString();
  switch (periodType) {
    case "fiscalYear":
      return displayValue;
    case "half":
      let yearH = displayValue.substring(0, 4);
      let half = displayValue.substring(4);
      return `${yearH}H${half}`;
    case "quarter":
      let yearQ = displayValue.substring(0, 4);
      let quarter = displayValue.substring(4);
      return `${yearQ}Q${quarter}`;
    case "monthly":
      // let yearM = displayValue.substring(0, 4);
      let month = displayValue.substring(4);
      month = month[0] === "0" ? month.substring(1) : month;
      return `${month}月`;

    default:
      break;
  }
};

type Props = {
  periodType: string;
  periodValue: number;
  salesTargetValue: number;
  yearOnYear: number;
  growthResultLastYearOnLastYear: number;
};

const SalesTargetGridContainerMemo = ({
  periodType,
  periodValue,
  salesTargetValue,
  yearOnYear,
  growthResultLastYearOnLastYear,
}: Props) => {
  // 期間タイプ
  const displayPeriodType = formatPeriodType(periodType);
  // 期間
  const displayPeriodValue = formatPeriodValue(periodType, periodValue);
  // 売上目標値
  const displaySalesTargetValue = formatSalesTarget(salesTargetValue);
  // 前年伸び
  const displayYearOnYear = `${(yearOnYear * 100).toFixed(2)}%`;
  // 前年伸び実績
  const displayGrowthResultLastYearOnLastYear = `${(growthResultLastYearOnLastYear * 100).toFixed(2)}%`;

  return (
    <div role="grid" className={`w-full ${styles.grid_container_target}`}>
      <div role="row" aria-rowindex={1} className={`${styles.row} w-full`}>
        <div role="rowheader" aria-colindex={1} className={`${styles.row_title}`}>
          {displayPeriodType}
        </div>
        <div role="gridcell" aria-colindex={2} className={`${styles.col_title}`}>
          {displayPeriodValue}
        </div>
      </div>
      <div role="row" aria-rowindex={2} className={`${styles.row_contents} w-full`}>
        <div role="rowheader" aria-colindex={1} className={`${styles.row_title}`}>
          目標
        </div>
        <div role="gridcell" aria-colindex={2} className={`${styles.cell_value}`}>
          {/* 404.2億 */}
          {displaySalesTargetValue}
        </div>
        <div role="gridcell" aria-colindex={3} className={`${styles.row_title}`}>
          前年比
        </div>
        <div role="gridcell" aria-colindex={4} className={`${styles.cell_value}`}>
          24.7%
          {/* {displayYearOnYear} */}
        </div>
        <div role="gridcell" aria-colindex={5} className={`${styles.row_title}`}>
          前年伸び実績
        </div>
        <div role="gridcell" aria-colindex={6} className={`${styles.cell_value}`}>
          25.0%
          {/* {displayGrowthResultLastYearOnLastYear} */}
        </div>
      </div>
    </div>
  );
};

type MonthlySalesTarget = {
  // periodValue: number;
  // salesTargetValue: number;
  // yearOnYear: number;
  // growthResultLastYearOnLastYear: number;
  sales_target_period_value: number;
  sales_target: number;
  sales_target_last_year: number;
  sales_target_two_year_ago: number;
};

type MonthlyProps = {
  periodType: string;
  monthlySalesTargetsArray: MonthlySalesTarget[];
};

const formatMonths = (periodType: string, monthlySalesTargetsArray: MonthlySalesTarget[]) => {
  const monthsArray = monthlySalesTargetsArray.map((obj) => {
    // 期間
    const displayPeriodValue = formatPeriodValue(periodType, obj.sales_target_period_value);
    // 売上目標値
    const displaySalesTargetValue = formatSalesTarget(obj.sales_target);
    // 前年伸び
    const displayYearOnYear = `${(obj.sales_target_last_year * 100).toFixed(2)}%`;
    // 前年伸び実績
    const displayGrowthResultLastYearOnLastYear = `${(obj.sales_target_two_year_ago * 100).toFixed(2)}%`;

    const displayMonthlyTargetObj = {
      displayPeriodValue,
      displaySalesTargetValue,
      displayYearOnYear,
      displayGrowthResultLastYearOnLastYear,
    };

    console.log("displayMonthlyTargetObj", displayMonthlyTargetObj);
    return displayMonthlyTargetObj;
  });

  return monthsArray;
};

const SalesTargetGridContainerForMonthlyMemo = ({ periodType, monthlySalesTargetsArray }: MonthlyProps) => {
  console.log("monthlySalesTargetsArray", monthlySalesTargetsArray);
  const monthlySalesTargetsForDisplay = formatMonths(periodType, monthlySalesTargetsArray);

  return (
    <>
      {/* 月度タイトル */}
      {/* <div className={`mt-[10px] flex min-h-[25px] min-w-max max-w-max flex-col text-[13px]`}>
        <span className={`mx-[6px]`}>月度</span>
        <div className={`min-h-[2px] w-full bg-[var(--color-bg-brand-f)]`}></div>
      </div> */}
      {/* 12ヶ月間 */}
      <div role="grid" className={`w-full ${styles.grid_container_target} ${styles.monthly}`}>
        {monthlySalesTargetsForDisplay.map((obj, index) => {
          return (
            <div key={index} role="row" aria-rowindex={2 + index} className={`${styles.row_contents} w-full`}>
              <div role="rowheader" aria-colindex={1} className={`${styles.row_title}`}>
                {/* 4月 */}
                {obj.displayPeriodValue}
              </div>
              <div role="gridcell" aria-colindex={2} className={`${styles.cell_value}`}>
                {/* 404.2億 */}
                {obj.displaySalesTargetValue}
              </div>
              <div role="gridcell" aria-colindex={3} className={`${styles.row_title}`}>
                前年比
              </div>
              <div role="gridcell" aria-colindex={4} className={`${styles.cell_value}`}>
                24.7%
                {/* {obj.displayYearOnYear} */}
              </div>
              <div role="gridcell" aria-colindex={5} className={`${styles.row_title}`}>
                前年伸び実績
              </div>
              <div role="gridcell" aria-colindex={6} className={`${styles.cell_value}`}>
                25.0%
                {/* {obj.displayGrowthResultLastYearOnLastYear} */}
              </div>
            </div>
          );
        })}
      </div>
      {/* <div role="grid" className={`w-full ${styles.grid_container_target}`}>
        <div role="row" aria-rowindex={2} className={`${styles.row_contents} w-full`}>
          <div role="rowheader" aria-colindex={1} className={`${styles.row_title}`}>
            4月
          </div>
          <div role="gridcell" aria-colindex={2} className={`${styles.cell_value}`}>
            404.2億
          </div>
          <div role="gridcell" aria-colindex={3} className={`${styles.row_title}`}>
            前年比
          </div>
          <div role="gridcell" aria-colindex={4} className={`${styles.cell_value}`}>
            24.7%
          </div>
          <div role="gridcell" aria-colindex={5} className={`${styles.row_title}`}>
            前年伸び実績
          </div>
          <div role="gridcell" aria-colindex={6} className={`${styles.cell_value}`}>
            25.0%
          </div>
        </div>
        <div role="row" aria-rowindex={2} className={`${styles.row_contents} w-full`}>
          <div role="rowheader" aria-colindex={1} className={`${styles.row_title}`}>
            5月
          </div>
          <div role="gridcell" aria-colindex={2} className={`${styles.cell_value}`}>
            404.2億
          </div>
          <div role="gridcell" aria-colindex={3} className={`${styles.row_title}`}>
            前年比
          </div>
          <div role="gridcell" aria-colindex={4} className={`${styles.cell_value}`}>
            24.7%
          </div>
          <div role="gridcell" aria-colindex={5} className={`${styles.row_title}`}>
            前年伸び実績
          </div>
          <div role="gridcell" aria-colindex={6} className={`${styles.cell_value}`}>
            25.0%
          </div>
        </div>
      </div> */}
      {/* -------------------------- 月度 ここまで -------------------------- */}
    </>
  );
};

export const SalesTargetGridContainer = memo(SalesTargetGridContainerMemo);
export const SalesTargetGridContainerForMonthly = memo(SalesTargetGridContainerForMonthlyMemo);
