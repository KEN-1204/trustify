import { formatSalesTarget } from "@/utils/Helpers/formatSalesTarget";
import { format, parseISO, subDays } from "date-fns";
import { Fragment, memo, useEffect, useMemo, useRef, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  XAxis,
  YAxis,
  Area,
  Tooltip,
  CartesianGrid,
  TooltipProps,
  Legend,
  LegendProps,
  DefaultLegendContentProps,
} from "recharts";
import styles from "./AreaChart.module.css";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { ja } from "date-fns/locale";
import useStore from "@/store";
import { LabelValue } from "@/types";

type Props = {
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
  labelValueArray: LabelValue[];
};

const colorsArrayHEX = [
  "var(--main-color-f)", // stripe
  "#14b8a6", // teal
  "#625afa", // stripe
  //   "rgba(98, 90, 250)", // stripe
  //   "#6366f1",
  "#d946ef",
  "#f43f5e",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#a855f7",
  "#0ea5e9",
  "#ec4899",
  "#8b5cf6",
  "#f97316",
  "#22c55e",
  "#ef4444",
  "#84cc16",
];
const colorsArrayHEXSheer = [
  "var(--main-color-f90)", // stripe
  "#14b8a690", // teal
  "#625afa90", // stripe
  "#d946ef90",
  "#f43f5e90",
  "#f59e0b90",
  "#10b98190",
  "#3b82f690",
  "#a855f790",
  "#0ea5e990",
  "#ec489990",
  "#8b5cf690",
  "#f9731690",
  "#22c55e90",
  "#ef444490",
  "#84cc1690",
];

const AreaChartComponentMemo = ({
  // chartHeight = 288,
  //   chartHeight = 270,
  chartHeight = 286,
  delay,
  labelType = "date",
  labelValueArray,
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
  //   const valueQuantityArray = useMemo(() => {
  //     if (!_data) return [];
  //     // dateプロパティを除いたvalueの個数分で配列を生成
  //     return Array(Object.keys(_data[0]).length - 1).fill(null);
  //   }, [_data]);

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

  return (
    <>
      {isMounted && !!_data?.length && (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <AreaChart data={_data} margin={{ top: 0, bottom: 0, right: 0, left: 0 }}>
            {/* <Area dataKey={`value`} stroke={trendColor} fill={`url(#spark_chart_gradient_${id})`} /> */}
            {labelValueArray.map((obj, index) => (
              <Fragment key={`value_${obj.id}`}>
                <defs>
                  <linearGradient id={`area_chart_gradient_${obj.id}_${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="12%" stopColor={colorsArrayHEX[index]} stopOpacity={0.4} />
                    <stop offset="98%" stopColor={colorsArrayHEX[index]} stopOpacity={0} />
                  </linearGradient>
                </defs>

                <Area
                  dataKey={`value${index + 1}`}
                  stroke={colorsArrayHEX[index]}
                  fill={`url(#area_chart_gradient_${obj.id}_${index})`}
                  activeDot={{ strokeWidth: 2, r: 5, stroke: `var(--color-chart-dot-stroke)` }}
                />
              </Fragment>
            ))}

            <XAxis dataKey="date" axisLine={false} tickLine={false} tickFormatter={xAxisFormatter} fontSize={12} />

            <YAxis
              dataKey="value1"
              axisLine={false}
              tickLine={false}
              tickCount={5}
              tickFormatter={yAxisFormatter}
              fontSize={13}
            />

            <Tooltip
              content={(props) => (
                <CustomTooltip
                  props={props}
                  labelType={labelType}
                  language={language}
                  labelValueArray={labelValueArray}
                  trendColor={trendColor}
                />
              )}
            />

            <Legend
              verticalAlign="top"
              height={36}
              content={(props) => (
                <CustomLegend
                  props={props}
                  labelType={labelType}
                  language={language}
                  labelValueArray={labelValueArray}
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

// ------------------------------ 🌠カスタムTooltip🌠 ------------------------------
type TooltipCustomProps = {
  props: TooltipProps<ValueType, NameType>;
  labelType: string;
  language: string;
  labelValueArray: LabelValue[];
  trendColor: string | null;
};

export const CustomTooltip = ({ props, labelType, language, labelValueArray, trendColor }: TooltipCustomProps) => {
  const { active, payload, label } = props;
  if (!active) return null;
  if (payload === undefined) return null;
  if (payload[0].value === undefined) return null;

  return (
    <div className={`${styles.tooltip} pointer-events-none min-w-[240px]`}>
      {labelType === "date" && (
        <h4 className={`px-[12px] pb-[4px] pt-[6px] text-[14px] font-bold`}>
          {label
            ? language === "ja"
              ? format(parseISO(label), "yyyy年M月d日 (E)", { locale: ja })
              : format(parseISO(label), "eeee, d MMM, yyyy")
            : "-"}
        </h4>
      )}
      {labelType !== "date" && <h4 className={`px-[12px] pb-[4px] pt-[6px] text-[14px] font-bold`}>{label}</h4>}

      <hr className={`min-h-[1px] w-full bg-[var(--color-border-light)]`} />

      <ul className={`flex flex-col space-y-[4px]`}>
        {!!labelValueArray?.length &&
          labelValueArray.map((obj, index) => {
            const growthRate = obj.growthRate;
            return (
              <li
                key={`area_chart_tooltip_${obj.id}_${index}`}
                className={`flex items-center justify-between px-[12px] text-[13px]`}
                style={{
                  ...(index === 0 && { paddingTop: `6px` }),
                  ...(labelValueArray.length - 1 === index && { paddingBottom: `6px` }),
                }}
              >
                <div className={`mr-[24px] flex items-center`}>
                  <div
                    className={`mr-[6px] h-[8px] w-[8px] rounded-full`}
                    style={{ background: `${colorsArrayHEX[index]}` }}
                  />
                  {/* <span>$ {Number(payload[index].value).toFixed(2)} CAD</span> */}
                  <span>{obj.label}</span>
                </div>

                <div className={`flex items-center`}>
                  {growthRate !== null && growthRate !== undefined && (
                    <div
                      className={`flex-center mr-[6px] max-w-max rounded-[4px] bg-[var(--bright-green)] px-[5px] py-[1px] text-[8px] text-[#fff]`}
                      style={{
                        ...(trendColor && {
                          background: trendColor,
                        }),
                      }}
                    >
                      {growthRate !== 0 && (
                        <span>
                          {growthRate > 0 && !growthRate.toString().includes("+")
                            ? `+`
                            : !growthRate.toString().includes("-")
                            ? `-`
                            : ``}
                          {growthRate.toFixed(1)}%
                        </span>
                      )}
                      {growthRate === 0 && <span>{growthRate}%</span>}
                    </div>
                  )}
                  <div className={`font-bold`}>
                    <span>$ {Number(payload[index].value).toFixed(2)}</span>
                  </div>
                </div>
              </li>
            );
          })}
      </ul>
      {/* <p>{JSON.stringify(payload, null, 2)}</p> */}
    </div>
  );
};
// ------------------------------ 🌠カスタムTooltip🌠 ここまで ------------------------------

// ------------------------------ 🌠カスタムLegend🌠 ------------------------------
type LegendCustomProps = {
  props: DefaultLegendContentProps;
  labelType: string;
  language: string;
  labelValueArray: LabelValue[];
};

export const CustomLegend = ({ props, labelType, language, labelValueArray }: LegendCustomProps) => {
  const { payload } = props;

  const [isHoveringLegend, setIsHoveringLegend] = useState(false);
  const [isOverflow, setIsOverflow] = useState(false);
  const legendsRef = useRef<HTMLDivElement | null>(null);
  const legendUListRef = useRef<HTMLUListElement | null>(null);

  //   useEffect(() => {
  //     if (legendUListRef.current) {
  //       console.log(
  //         "legendUListRef.current.scrollWidth > legendUListRef.current.offsetWidth",
  //         (legendUListRef.current?.scrollWidth ?? 0) > (legendUListRef.current?.offsetWidth ?? 0),
  //         "legendUListRef.current?.scrollWidth",
  //         legendUListRef.current?.scrollWidth,
  //         "legendUListRef.current?.offsetWidth",
  //         legendUListRef.current?.offsetWidth
  //       );
  //       if (legendUListRef.current.scrollWidth > legendUListRef.current.offsetWidth) {
  //         console.log("🌠🌠🌠🌠🌠🌠🌠🌠🌠🌠🌠🌠🌠🌠🌠🌠🌠🌠🌠🌠🌠🌠🌠🌠");
  //         legendUListRef.current.classList.remove(`${styles.ul_flex}`);
  //         legendUListRef.current.classList.add(`${styles.ul_grid}`);
  //         setIsOverflow(true);
  //       }
  //     }
  //   }, []);

  const handleEnterLegend = () => {
    setIsHoveringLegend(true);
  };
  const handleLeaveLegend = () => {
    if (isHoveringLegend) {
      if (legendsRef.current) legendsRef.current.classList.add(`fadeout08_forward`);
      setTimeout(() => {
        if (legendsRef.current) legendsRef.current.classList.remove(`fadeout08_forward`);
        setIsHoveringLegend(false);
      }, 800);
    }
  };

  return (
    <div className={`relative flex w-full max-w-[calc(100vw-72px-62px-6px-24px)] items-start pl-[60px]`}>
      {isHoveringLegend && (
        <div
          ref={legendsRef}
          className={`${styles.list_legends} fade08_forward absolute left-[60px] top-[0] z-10 flex  max-w-[calc(100vw-72px-62px-6px-24px)] flex-wrap items-center justify-start leading-[24px]`}
          onMouseLeave={handleLeaveLegend}
        >
          {Array(8)
            .fill(null)
            .map((_, index) => (
              <li
                key={`legend-item-${index}`}
                className={`mr-[18px] flex items-center truncate text-[13px]`}
                style={{ gridColumnStart: `${index + 1}` }}
              >
                <div
                  className={`mr-[6px] min-h-[8px] min-w-[8px] rounded-full`}
                  style={{ background: `${colorsArrayHEX[index]}` }}
                />
                {/* <span>$ {Number(payload[index].value).toFixed(2)} CAD</span> */}
                <span className={`truncate`}>マイクロスコープ事業部</span>
              </li>
            ))}
        </div>
      )}
      <ul
        ref={legendUListRef}
        className={`w-full  overflow-x-hidden ${styles.ul_flex}`}
        // style={{ gridTemplateColumns: `repeat(auto-fit, minmax(max-content, 1fr))` }}
        // style={{ gridTemplateColumns: `repeat(4, 1fr)` }}
        onMouseEnter={handleEnterLegend}
      >
        {/* {payload && payload.map((entry, index) => <li key={`legend-item-${index}`}>{entry.value}</li>)} */}
        {Array(8)
          .fill(null)
          .map((_, index) => (
            <li
              key={`legend-item-${index}`}
              //   className={`mr-[18px] flex items-center text-[13px] ${isOverflow ? `truncate` : `whitespace-nowrap`}`}
              className={`mr-[18px] flex items-center truncate text-[13px]`}
              style={{ gridColumnStart: `${index + 1}` }}
            >
              <div
                className={`mr-[6px] min-h-[8px] min-w-[8px] rounded-full`}
                style={{ background: `${colorsArrayHEX[index]}` }}
              />
              {/* <span>$ {Number(payload[index].value).toFixed(2)} CAD</span> */}
              {/* <span className={`${isOverflow ? `truncate` : `whitespace-nowrap`}`}>マイクロスコープ事業部</span> */}
              <span className={`truncate`}>マイクロスコープ事業部</span>
            </li>
          ))}
      </ul>
    </div>
  );
};
// ------------------------------ 🌠カスタムLegend🌠 ここまで ------------------------------
