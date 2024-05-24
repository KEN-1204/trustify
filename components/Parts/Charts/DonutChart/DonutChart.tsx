import useStore from "@/store";
import { Dispatch, Fragment, SetStateAction, memo, useEffect, useMemo, useRef, useState } from "react";
import { SpinnerX } from "../../SpinnerX/SpinnerX";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, TooltipProps } from "recharts";
import { DonutChartObj, LabelDataSalesProbability } from "@/types";
import { COLORS_GRD, COLORS_GRD_SHEER } from "../Seeds/seedData";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { getOrderCertaintyStartOfMonth, getOrderCertaintyStartOfMonthZenkaku } from "@/utils/selectOptions";
import styles from "../Charts.module.css";
import { isValidNumber } from "@/utils/Helpers/isValidNumber";
import { formatToJapaneseYen } from "@/utils/Helpers/formatToJapaneseYen";
import { formatSalesTarget } from "@/utils/Helpers/formatSalesTarget";

type Props = {
  //   data: { date: string | number | null; value: number | null }[];
  //   dataUpdateAt: number;
  //   height: number;
  //   width: number;
  //   chartWidth?: number;
  //   borderColor?: string;
  //   requireFormat4Letter?: boolean;
  colors?: string[];
  colorsSheer?: string[];
  chartCenterX?: number;
  chartHeight?: number;
  centerTextFontSize?: number;
  delay?: number;
  chartData: DonutChartObj[];
  totalAmount: number;
  labelListSalesProbabilities?: LabelDataSalesProbability[];
  periodType?: string;
  labelType: string;
  //   labelValueGroupByPeriod: LabelValueGroupByPeriod[];
  //   legendList: LegendNameId[];
  tickCount?: number;
  fallbackHeight: string;
  fallbackPadding: string;
  activeIndexParent: number;
  setActiveIndexParent: Dispatch<SetStateAction<number>>;
};

const DonutChartComponentMemo = ({
  colors = COLORS_GRD,
  colorsSheer = COLORS_GRD_SHEER,
  chartCenterX = 124,
  chartHeight = 286,
  centerTextFontSize = 15,
  delay = 0,
  chartData,
  totalAmount,
  labelListSalesProbabilities,
  periodType,
  labelType = "date",
  //   labelValueGroupByPeriod,
  //   legendList,
  tickCount = 5,
  fallbackHeight,
  fallbackPadding,
  activeIndexParent,
  setActiveIndexParent,
}: Props) => {
  const language = useStore((state) => state.language);

  // 売上目標チャート中央テキスト ホバー時にクラスを外す
  const textSalesChartRef = useRef<SVGTextElement | null>(null);

  const onPieEnter = (_: void, index: number) => {
    setActiveIndexParent(index);
    // 初回マウント時用のアニメーションを除去

    // if (!isMountedChart) {
    //   setIsMountedChart(true);
    // }
  };
  const onPieLeave = (_: void, index: number) => {
    setActiveIndexParent(1000);
  };

  // 🔹受注確度ごとのlabel(ツールチップ用)のMapオブジェクトを作成
  const probablyNameToObjMap = useMemo(() => {
    if (!labelListSalesProbabilities) return undefined;
    return new Map(labelListSalesProbabilities.map((obj) => [obj.name, obj]));
  }, [labelListSalesProbabilities ?? ""]);

  // チャート マウントを0.6s遅らせる
  // const [isMounted, setIsMounted] = useState(delay ? false : true);
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    if (isMounted) return;
    setTimeout(() => {
      setIsMounted(true);
      // setTimeout(() => {
      //   if (textSalesChartRef.current) {
      //     textSalesChartRef.current.classList.remove("fade_chart05_d5");
      //     textSalesChartRef.current.classList.add("fade05");
      //   }
      // }, 500);
    }, delay);
  }, []);

  // total_amountが0の場合はdisplayChartDataにダミーデータをセットしてグレー色のプレイスホルダーを表示
  const placeholderData = [{ name: "No Data", value: 100 }];
  const isNoData = totalAmount === 0;

  const displayChartData = totalAmount > 0 ? chartData : placeholderData;

  console.log("DonutChartコンポーネントレンダリング");
  return (
    <>
      {!isMounted && (
        <div className={`flex-center w-full`} style={{ minHeight: fallbackHeight, padding: fallbackPadding }}>
          <SpinnerX />
        </div>
      )}
      {isMounted && (
        <ResponsiveContainer width="100%" height={chartHeight} className={`fade08_forward relative z-[100]`}>
          <PieChart margin={{ top: 0, bottom: 0, right: 0, left: 0 }}>
            <Pie
              data={displayChartData}
              dataKey="value"
              // cx="50%"
              cx={chartCenterX} // 78(半径) + 56(padding-left)
              cy="50%"
              // innerRadius={45}
              // outerRadius={60}
              innerRadius={60}
              outerRadius={78}
              paddingAngle={displayChartData?.length === 1 ? 0 : 3} // セクター間の間隔 lengthが1の場合は間隔は0にする
              // Rechartsでは、3時の方角が開始点で反時計回りが前提となるため、450度反時計回りの0時を開始点、そこから90度まで逆行(つまり、Rechartsでは時計回りに12時の方角までを描画する)
              startAngle={450}
              endAngle={90}
              onMouseEnter={!isNoData ? onPieEnter : undefined}
              onMouseLeave={!isNoData ? onPieLeave : undefined}
            >
              {displayChartData.map((entry, index) => (
                <Cell
                  key={`donut_chart_cell_${entry.name}_${index}`}
                  // fill={COLORS_SHEER[index % COLORS.length]}
                  // stroke={COLORS[index % COLORS.length]}
                  // fill={!isNoData ? colorsSheer[index % colorsSheer.length] : "var(--color-progress-chart-bg)"}
                  fill={!isNoData ? colorsSheer[index % colorsSheer.length] : "var(--color-bg-sub)"}
                  stroke={!isNoData ? colors[index % colors.length] : "var(--color-bg-sub)"}
                  strokeWidth={`1px`}
                />
              ))}
            </Pie>
            {!isNoData && (
              <Tooltip
                content={(props) => (
                  <CustomTooltip
                    props={props}
                    labelType={labelType}
                    periodType={periodType}
                    language={language}
                    labelListSalesProbabilities={labelListSalesProbabilities}
                    probablyNameToObjMap={probablyNameToObjMap}
                    colors={colors}
                  />
                )}
              />
            )}
            {/* 中央にテキストを表示するためのカスタムSVG要素 */}
            {activeIndexParent === 1000 && isValidNumber(totalAmount) && (
              <text
                ref={textSalesChartRef}
                x={chartCenterX}
                y="50%"
                fontSize={centerTextFontSize}
                fontWeight={500}
                textAnchor="middle"
                dominantBaseline="central"
                fill={!isNoData ? `var(--color-text-title)` : `var(--color-text-sub)`}
                // fill={`var(--main-color-f)`}
                // className={`${isMounted ? `fade05` : `fade_chart05_d2`}`}
                className={`fade_chart05_d2`}
              >
                {!isNoData && <tspan>{`¥ ${formatSalesTarget(totalAmount)}`}</tspan>}
                {isNoData && (
                  <>
                    <tspan x={chartCenterX} y="50%" dy={-10}>{`¥ 0`}</tspan>
                    <tspan x={chartCenterX} y="50%" dy={10} fontSize={13}>{`No Data`}</tspan>
                  </>
                )}
              </text>
            )}
          </PieChart>
        </ResponsiveContainer>
      )}
    </>
  );
};

export const DonutChartComponent = memo(DonutChartComponentMemo);

// ------------------------------ 🌠カスタムTooltip🌠 ------------------------------
type TooltipCustomProps = {
  props: TooltipProps<ValueType, NameType>;
  labelType: string;
  periodType?: string;
  language: string;
  labelListSalesProbabilities?: LabelDataSalesProbability[];
  probablyNameToObjMap?: Map<string | number, LabelDataSalesProbability>;
  colors: string[];
};

export const CustomTooltip = ({
  props,
  labelType,
  periodType,
  language,
  labelListSalesProbabilities,
  probablyNameToObjMap,
  colors,
}: TooltipCustomProps) => {
  const { active, payload } = props;
  if (!active) return null;
  if (payload === undefined) return null;
  if (payload[0].value === undefined) return null;

  // console.log("ドーナツチャートツールチップ payload", payload, "props", props);

  if (labelType === "sales_probability") {
    if (!labelListSalesProbabilities) return null;
    if (!probablyNameToObjMap) return null;

    const labelName = payload[0].name as number;
    const labelValue = payload[0].value;
    const activeColor = payload[0].payload.fill ?? "var(--color-bg-brand-f)";

    if (!probablyNameToObjMap.has(labelName)) return null;

    const dealObj = probablyNameToObjMap.get(labelName);

    if (!dealObj) return null;

    //並び替える順序を定義
    const desiredOrder = ["average_price", "quantity", "probably", "amount"];

    const orderedKeys = useMemo(() => desiredOrder.filter((key) => key in dealObj), []);

    // console.log("ドーナツチャートツールチップ dealObj", dealObj);

    const mappingRowTitle: { [key: string]: { [key: string]: string } } = {
      average_price: { ja: "平均単価", en: "Average Price" },
      quantity: { ja: "件数", en: "Quantity" },
      probably: { ja: "受注確度", en: "Ordered Probably" },
      amount: { ja: "合計（確度込み）", en: "Amount" },
    };

    return (
      <div
        className={`${styles.tooltip} pointer-events-none z-[1000] min-w-[240px]`}
        // style={{ background: `var(--color-chart-tooltip-bg-solid)` }}
      >
        <h4 className={`rounded-t-[6px] px-[12px] pb-[4px] pt-[6px] text-[14px] font-bold backdrop-blur-[3px]`}>
          <div className={`mr-[24px] flex items-center`}>
            <div className={`mr-[6px] h-[9px] w-[9px] rounded-full`} style={{ background: `${activeColor}` }} />
            <span className="label_name">{getOrderCertaintyStartOfMonthZenkaku(dealObj.name, language, true)}</span>
          </div>
        </h4>

        <hr className={`min-h-[1px] w-full bg-[var(--color-border-light)]`} />

        <ul className={`flex flex-col space-y-[6px] rounded-b-[6px] backdrop-blur-[3px]`}>
          {!!orderedKeys?.length &&
            orderedKeys.map((key, index) => {
              const value = dealObj[key];
              return (
                <Fragment key={`area_chart_tooltip_${value}_${index}`}>
                  {orderedKeys.length - 1 === index && (
                    <hr className="min-h-[1px] w-full bg-[var(--color-border-light)]" />
                  )}
                  <li
                    className={`flex items-center justify-between px-[12px] text-[12px]`}
                    style={{
                      ...(index === 0 && { paddingTop: `6px` }),
                      ...(orderedKeys.length - 1 === index && { paddingBottom: `6px` }),
                    }}
                  >
                    <div className={`mr-[24px] flex items-center`}>
                      {/* <div
                    className={`mr-[6px] h-[8px] w-[8px] rounded-full`}
                    style={{ background: `${colors[index]}` }}
                  /> */}
                      <span className="label_name">{mappingRowTitle[key][language]}</span>
                    </div>

                    <div className={`flex items-center text-[13px]`}>
                      {isValidNumber(value) && (
                        <div className={`${orderedKeys.length - 1 === index ? `font-bold` : ``}`}>
                          <span>
                            {(key === "amount" || key === "average_price") && formatToJapaneseYen(value, true)}
                            {key === "quantity" && `${value}件`}
                            {key === "probably" && `${value}%`}
                          </span>
                        </div>
                      )}
                      {/* {isValidNumber(Number(payload[index].value)) && (
                      <div className={`font-bold`}>
                        <span>{formatToJapaneseYen(Number(payload[index].value), true)}</span>
                      </div>
                    )} */}
                    </div>
                  </li>
                </Fragment>
              );
            })}
        </ul>
        {/* <p>{JSON.stringify(payload, null, 2)}</p> */}
      </div>
    );
  }
};
// ------------------------------ 🌠カスタムTooltip🌠 ここまで ------------------------------
