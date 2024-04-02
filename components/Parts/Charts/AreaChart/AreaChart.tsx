import { formatSalesTarget } from "@/utils/Helpers/formatSalesTarget";
import { format, parseISO, subDays } from "date-fns";
import { Fragment, memo, useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, AreaChart, XAxis, YAxis, Area, Tooltip, CartesianGrid, TooltipProps } from "recharts";
import styles from "./AreaChart.module.css";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { ja } from "date-fns/locale";
import useStore from "@/store";

type Props = {
  id: string | number;
  //   title?: string;
  //   subTitle?: string;
  //   mainValue: number | null;
  //   growthRate?: number | null;
  //   data: { date: string | number | null; value: number | null }[];
  //   dataUpdateAt: number;
  //   height: number;
  //   width: number;
  chartHeight?: number;
  //   chartWidth?: number;
  //   borderColor?: string;
  delay?: number;
  //   requireFormat4Letter?: boolean;
  labelType: string;
};

const AreaChartComponentMemo = ({
  id = Math.random(),
  // chartHeight = 288,
  chartHeight = 270,
  delay,
  labelType = "date",
}: Props) => {
  const language = useStore((state) => state.language);
  const _data = useMemo(() => {
    const data: { [key: string]: any }[] = [];
    for (let num = 30; num >= 0; num--) {
      data.push({
        date: subDays(new Date(), num).toISOString().substring(0, 10),
        // value: 1 + Math.random(),
        value1: 1 + Math.random(),
        value2: 1 + Math.random(),
      });
    }
    // for (let num = 4; num >= 0; num--) {
    //   data.push({
    //     date: subDays(new Date(), num).toISOString().substring(0, 10),
    //     value: 1 + Math.random(),
    //   });
    // }
    return data;
  }, []);

  // dateを除いた全てのvalueを配列にまとめてAreaコンポーネントにmapで展開して渡す
  const valueQuantityArray = useMemo(() => {
    if (!_data) return [];
    // dateプロパティを除いたvalueの個数分で配列を生成
    return Array(Object.keys(_data[0]).length - 1).fill(null);
  }, [_data]);

  const isUpwardTrend = useMemo(() => {
    // 2つ以下ならnull
    if (_data.length < 2) return null;
    const lastValue = _data[_data.length - 1].value;
    const lastLastValue = _data[_data.length - 2].value;
    if (lastValue === null || lastLastValue === null) return null;
    if (lastValue > lastLastValue) {
      return true;
    } else if (lastValue < lastLastValue) {
      return false;
    } else {
      return null; // 同じ場合
    }
  }, []);

  const trendColor = isUpwardTrend
    ? `var(--bright-green)`
    : isUpwardTrend === false
    ? `var(--bright-red)`
    : `var(--color-bg-brand-f)`;

  // Y軸フォーマット関数
  const yAxisFormatter = (num: number) => {
    if (!num) return "0";
    const _value = formatSalesTarget(num, "round");
    // const formattedNum = Number.isInteger(Number(_value)) ? _value : Number(_value).toFixed(0);
    return `¥ ${_value}`;
    // const formattedNum = Number.isInteger(num) ? num : Number(num.toFixed(2)).toLocaleString();
    // return formattedNum
  };

  // X軸 日付時のフォーマット関数 Feb, 7 May, 21 など 7日刻み
  const xAxisFormatter = (str: string) => {
    const date = parseISO(str);
    // console.log("date", date, "date.getDate()", date.getDate(), 'format(date, "MMM, d")', format(date, "MMM, d"));
    // console.log(date.getDate() % 7 === 0 ? format(date, "MMM, d") : ``);
    if (date.getDate() % 7 === 0) {
      return format(date, "MMM, d");
    }
    return format(date, "MMM, d");
  };

  // チャート マウントを0.6s遅らせる
  const [isMounted, setIsMounted] = useState(delay ? false : true);
  useEffect(() => {
    if (isMounted) return;
    setTimeout(() => {
      setIsMounted(true);
    }, delay);
  }, []);

  const colorsArrayHEX = [
    "#6366f1",
    "#14b8a6", // teal
    "#f43f5e",
    "#d946ef",
    "#3b82f6",
    "#f59e0b",
    "#a855f7",
    "#0ea5e9",
    "#10b981",
    "#ec4899",
    "#8b5cf6",
    "#84cc16",
    "#f97316",
    "#ef4444",
    "#22c55e",
  ];

  return (
    <>
      {isMounted && !!_data?.length && (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <AreaChart data={_data} margin={{ top: 0, bottom: 0, right: 0, left: 0 }}>
            {/* <Area dataKey={`value`} stroke={trendColor} fill={`url(#spark_chart_gradient_${id})`} /> */}
            {valueQuantityArray.map((_, index) => (
              <Fragment key={`value_${index}`}>
                <defs>
                  <linearGradient id={`area_chart_gradient_${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="12%" stopColor={colorsArrayHEX[index]} stopOpacity={0.4} />
                    <stop offset="98%" stopColor={colorsArrayHEX[index]} stopOpacity={0} />
                  </linearGradient>
                </defs>

                <Area
                  dataKey={`value${index + 1}`}
                  stroke={colorsArrayHEX[index]}
                  fill={`url(#area_chart_gradient_${index})`}
                />
              </Fragment>
            ))}

            <XAxis dataKey="date" axisLine={false} tickLine={false} tickFormatter={xAxisFormatter} fontSize={12} />

            <YAxis dataKey="value1" axisLine={false} tickLine={false} tickCount={5} tickFormatter={yAxisFormatter} />

            <Tooltip
              content={(props) => (
                <CustomTooltip
                  props={props}
                  labelType={labelType}
                  language={language}
                  valueQuantityArray={valueQuantityArray}
                />
              )}
            />

            <CartesianGrid opacity={0.5} vertical={false} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </>
  );
};

export const AreaChartComponent = memo(AreaChartComponentMemo);

type TooltipCustomProps = {
  props: TooltipProps<ValueType, NameType>;
  labelType: string;
  language: string;
  valueQuantityArray: any[];
};

export const CustomTooltip = ({ props, labelType, language, valueQuantityArray }: TooltipCustomProps) => {
  const { active, payload, label } = props;
  if (!active) return null;
  if (payload === undefined) return null;
  if (payload[0].value === undefined) return null;

  return (
    <div className={`${styles.tooltip}`}>
      {labelType === "date" && (
        <h4 className={`text-[13px] font-bold`}>
          {label
            ? language === "ja"
              ? format(parseISO(label), "yyyy年M月d日 (E)", { locale: ja })
              : format(parseISO(label), "eeee, d MMM, yyyy")
            : "-"}
        </h4>
      )}
      {!!valueQuantityArray?.length &&
        valueQuantityArray.map((_, index) => {
          return (
            <p key={`area_chart_tooltip_${index}`} className={`text-[13px]`}>
              $ {Number(payload[index].value).toFixed(2)} CAD
            </p>
          );
        })}
      {/* <p>{JSON.stringify(payload, null, 2)}</p> */}
    </div>
  );
};
