import useStore from "@/store";
import { Dispatch, SetStateAction, memo, useEffect, useState } from "react";
import { SpinnerX } from "../../SpinnerX/SpinnerX";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { DonutChartObj } from "@/types";
import { COLORS_GRD, COLORS_GRD_SHEER } from "../Seeds/seedData";

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
  delay?: number;
  chartData: DonutChartObj[];
  periodType?: string;
  labelType: string;
  //   labelValueGroupByPeriod: LabelValueGroupByPeriod[];
  //   legendList: LegendNameId[];
  tickCount?: number;
  fallbackHeight: string;
  fallbackPadding: string;
};

const DonutChartComponentMemo = ({
  colors = COLORS_GRD,
  colorsSheer = COLORS_GRD_SHEER,
  chartCenterX = 124,
  chartHeight = 286,
  delay,
  chartData,
  periodType,
  labelType = "date",
  //   labelValueGroupByPeriod,
  //   legendList,
  tickCount = 5,
  fallbackHeight,
  fallbackPadding,
}: Props) => {
  const language = useStore((state) => state.language);

  // チャート マウントを0.6s遅らせる
  const [isMounted, setIsMounted] = useState(delay ? false : true);
  useEffect(() => {
    if (isMounted) return;
    setTimeout(() => {
      setIsMounted(true);
    }, delay);
  }, []);

  console.log("DonutChartコンポーネントレンダリング");
  return (
    <>
      {!isMounted && (
        <div className={`flex-center w-full`} style={{ minHeight: fallbackHeight, padding: fallbackPadding }}>
          <SpinnerX />
        </div>
      )}
      {isMounted && !!chartData?.length && (
        <ResponsiveContainer width="100%" height={chartHeight} className={`fade08_forward`}>
          <PieChart margin={{ top: 0, bottom: 0, right: 0, left: 0 }}>
            <Pie
              data={chartData}
              dataKey="value"
              // cx="50%"
              cx={chartCenterX} // 78(半径) + 56(padding-left)
              cy="50%"
              // innerRadius={45}
              // outerRadius={60}
              innerRadius={60}
              outerRadius={78}
              paddingAngle={chartData?.length === 1 ? 0 : 3} // セクター間の間隔 lengthが1の場合は間隔は0にする
              // Rechartsでは、3時の方角が開始点で反時計回りが前提となるため、450度反時計回りの0時を開始点、そこから90度まで逆行(つまり、Rechartsでは時計回りに12時の方角までを描画する)
              startAngle={450}
              endAngle={90}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`donut_chart_cell_${index}`}
                  // fill={COLORS_SHEER[index % COLORS.length]}
                  // stroke={COLORS[index % COLORS.length]}
                  fill={colorsSheer[index % colorsSheer.length]}
                  stroke={colors[index % colors.length]}
                  strokeWidth={`1px`}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      )}
    </>
  );
};

export const DonutChartComponent = memo(DonutChartComponentMemo);
