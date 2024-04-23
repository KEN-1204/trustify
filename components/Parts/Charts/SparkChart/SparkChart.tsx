import { convertToJapaneseCurrencyFormatInYen } from "@/utils/Helpers/Currency/convertToJapaneseCurrencyFormatInYen";
import { formatSalesTarget } from "@/utils/Helpers/formatSalesTarget";
import { subDays } from "date-fns";
import { memo, useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, AreaChart, XAxis, YAxis, Area, Tooltip, CartesianGrid } from "recharts";

// const _data = useMemo(() => {
//   const data: { [K in "date" | "value"]: any }[] = [];
//   // for (let num = 30; num >= 0; num--) {
//   //   data.push({
//   //     date: subDays(new Date(), num).toISOString().substring(0, 10),
//   //     value: 1 + Math.random(),
//   //   });
//   // }
//   for (let num = 4; num >= 0; num--) {
//     data.push({
//       date: subDays(new Date(), num).toISOString().substring(0, 10),
//       value: 1 + Math.random(),
//     });
//   }
//   return data;
// }, []);

type Props = {
  id: string | number;
  title?: string;
  subTitle?: string;
  mainValue: number | null;
  growthRate?: number | null;
  data: { date: string | number | null; value: number | null }[];
  dataUpdateAt: number;
  height: number;
  width: number;
  chartHeight?: number;
  chartWidth?: number;
  //   stroke?: string;
  borderColor?: string;
  delay?: number;
  requireFormat4Letter?: boolean;
};

// export const SparkChart = ({
const SparkChartMemo = ({
  id,
  title = "売上",
  subTitle = "前年比",
  mainValue,
  growthRate,
  data,
  dataUpdateAt,
  height = 68,
  width = 270,
  //   chartHeight = 33,
  chartHeight = 30,
  //   chartWidth = 120,
  chartWidth = 100,
  borderColor = "var(--color-border-base)",
  delay,
  requireFormat4Letter = true,
}: //   stroke = "var(--bright-green)",
Props) => {
  // const [chartData, setChartData] = useState(data);

  // useEffect(() => {
  //   // 配列内のオブジェクトのdateプロパティかvalueプロパティが変更されたことをdataUpdateAtのタイムスタンプで検知
  //   // 通常は配列内の各オブジェクトの要素を全てJSON文字列化して深い監視を行うが、これだとプロパティ数や要素数が多くなった場合にパフォーマンスが低下する可能性があるので、タイムスタンプで変更時に手動で最新のタイムスタンプに更新する形で運用する
  //   console.log("🔥🔥🔥🔥🔥🔥 スパークチャート変更検知", "data", data, "dataUpdateAt", dataUpdateAt);
  //   setChartData(data);
  // }, [dataUpdateAt]);

  // メインvalueフォーマット
  const displayMainValue = useMemo(() => {
    if (mainValue === null) return null;
    if (requireFormat4Letter) {
      const _value = formatSalesTarget(mainValue, "round");
      // const _value = convertToJapaneseCurrencyFormatInYen(mainValue, false, true);
      console.log("スパークチャート displayMainValue useMemo", "_value", _value, "mainValue", mainValue, "data", data);
      return _value;
    } else {
      return mainValue;
    }
  }, [mainValue]);

  // 前々年から前年が上昇傾向かどうか取得
  const isUpwardTrend = useMemo(() => {
    console.log("スパークチャート isUpwardTrend useMemo growthRate", growthRate, "data.length", data.length);
    if (growthRate !== undefined) {
      if (growthRate === null) {
        if (data.length >= 2) {
          const lastValue = data[data.length - 1].value;
          const lastLastValue = data[data.length - 2].value;
          if (lastLastValue === 0 && lastValue && lastValue > 0) {
            return true;
          } else if (lastLastValue === lastValue) {
            return null;
          } else if (lastLastValue === null || lastValue === null) {
            return null;
          } else if (lastLastValue < lastValue) {
            return true;
          } else if (lastLastValue > lastValue) {
            return false;
          } else {
            return null;
          }
        } else {
          return null;
        }
      } else if (growthRate > 0) {
        return true;
      } else if (growthRate < 0) {
        return false;
      } else {
        return null;
      }
    } else {
      // 2つ以下ならnull
      if (data.length < 2) return null;
      const lastValue = data[data.length - 1].value;
      const lastLastValue = data[data.length - 2].value;
      if (lastValue === null || lastLastValue === null) return null;
      if (lastValue > lastLastValue) {
        return true;
      } else if (lastValue < lastLastValue) {
        return false;
      } else {
        return null; // 同じ場合
      }
    }
  }, [growthRate, data]);

  const trendColor = isUpwardTrend
    ? `var(--bright-green)`
    : isUpwardTrend === false
    ? `var(--bright-red)`
    : `var(--color-bg-brand-f)`;

  // チャート マウントを0.6s遅らせる
  const [isMounted, setIsMounted] = useState(delay ? false : true);
  useEffect(() => {
    if (isMounted) return;
    setTimeout(() => {
      setIsMounted(true);
    }, delay);
  }, []);

  // console.log("チャート ", "isUpwardTrend", isUpwardTrend, "growthRate", growthRate, "data", data);

  return (
    <>
      <div
        className={`flex min-h-[48px] w-full max-w-[270px] items-center justify-between rounded-[9px] px-[12px]`}
        style={{ minHeight: `${height}px`, maxWidth: `${width}px`, border: `1px solid ${borderColor}` }}
      >
        <div className="flex max-w-[72px] flex-col justify-center">
          {/* <div className="flex flex-col justify-center"> */}
          <span className={`truncate text-[12px] font-bold text-[var(--color-text-title)]`}>{title}</span>
          <span className={`truncate text-[8px] text-[var(--color-text-sub)]`}>{subTitle}</span>
        </div>
        <div className={`flex items-center`}>
          <div
            className={`relative flex h-full min-h-[40px] w-full min-w-[120px] items-center`}
            style={{ minWidth: `${chartWidth}px`, maxWidth: `${chartWidth}px` }}
          >
            {isMounted && !!data?.length && (
              <ResponsiveContainer width="100%" height={chartHeight}>
                <AreaChart data={data} margin={{ top: 0, bottom: 0, right: 0, left: 0 }}>
                  <defs>
                    <linearGradient id={`spark_chart_gradient_${id}`} x1="0" y1="0" x2="0" y2="1">
                      {/* <stop offset="0%" stopColor={trendColor} stopOpacity={0.5} />
                    <stop offset="78%" stopColor={trendColor} stopOpacity={0.05} /> */}
                      {/* <stop offset="5%" stopColor={trendColor} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={trendColor} stopOpacity={0} /> */}
                      <stop offset="12%" stopColor={trendColor} stopOpacity={0.4} />
                      <stop offset="98%" stopColor={trendColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area dataKey={`value`} stroke={trendColor} fill={`url(#spark_chart_gradient_${id})`} />
                  {/* <XAxis dataKey="date" /> */}
                  {/* <YAxis dataKey="value" /> */}
                </AreaChart>
              </ResponsiveContainer>
            )}
            {!data?.length && <div className={`text-[9px]`}>データがありません</div>}
          </div>
          <div className={`flex min-w-[48px]  flex-col items-end justify-center`}>
            {/* <span className={`text-[12px] font-bold text-[var(--color-text-title)]`}>123.26億</span> */}
            <span className={`text-[12px] font-bold text-[var(--color-text-title)]`}>{displayMainValue}</span>
            {/* <pre>{JSON.stringify(data, null,2)}</pre> */}
            <div
              className={`flex-center max-w-max rounded-[4px] bg-[var(--bright-green)] px-[5px] py-[1px] text-[8px] text-[#fff]`}
              style={{
                background: trendColor,
                // ...(isUpwardTrend && { background: `var(--bright-green)` }),
                // ...(isUpwardTrend === false && { background: `var(--bright-red)` }),
                // ...(isUpwardTrend === null && { background: `var(--color-bg-brand-sub)` }),
              }}
            >
              {growthRate === undefined && isUpwardTrend !== null && <span>{isUpwardTrend ? `+` : `-`}1.72%</span>}
              {growthRate === undefined && isUpwardTrend === null && <span>- %</span>}
              {growthRate !== undefined && growthRate !== null && isUpwardTrend !== null && (
                <span>
                  {isUpwardTrend && !growthRate.toString().includes("+")
                    ? `+`
                    : !growthRate.toString().includes("-")
                    ? `-`
                    : ``}
                  {growthRate.toFixed(1)}%
                </span>
              )}
              {growthRate !== undefined && growthRate === null && <span>- %</span>}
              {growthRate === 0 && <span>{growthRate}%</span>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const SparkChart = memo(SparkChartMemo);
