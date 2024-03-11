import { formatSalesTarget } from "@/utils/Helpers/formatSalesTarget";
import { useEffect, useRef, useState } from "react";
import { Sector } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";
import { ActiveShape } from "recharts/types/util/types";

export const renderActiveShape = (props: PieSectorDataItem): any => {
  // <rect>のサイズ計算用に使用
  const textRef = useRef<SVGTextElement | null>(null);
  const [rectProps, setRectProps] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // useEffect(() => {
  //   if (textRef.current) {
  //     const bbox = textRef.current.getBBox();
  //     const padding = 5; // テキスト周囲のパディング
  //     // テキストサイズ + パディングで背景サイズを計算
  //     const newRect = {
  //       x: bbox.x - padding,
  //       y: bbox.y - padding,
  //       width: bbox.width + 2 * padding, // 左右なので*2
  //       height: bbox.height + 2 * padding, // 上下なので*2
  //     };
  //     console.log("newRect", newRect);
  //     setRectProps(newRect);
  //   }
  // }, [textRef.current]);

  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  if (!midAngle) return;
  if (!cx) return;
  if (!cy) return;
  if (!outerRadius) return;
  if (!RADIAN) return;
  if (!payload) return;
  if (!percent) return;
  if (!value) return;
  // if (!payload?.name) return;
  console.log("🌠renderActiveShape props", props, "rectProps", rectProps);

  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const mx = cx + (outerRadius + 10) * cos;
  const my = cy + (outerRadius + 10) * sin;
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  // const mx = cx + (outerRadius + 30) * cos;
  // const my = cy + (outerRadius + 30) * sin;
  const px = cx + (outerRadius + 20) * cos;
  const py = cy + (outerRadius + 20) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  // valueを4文字以内に整形 123億4500万 => 123.4
  const formattedValue = formatSalesTarget(value, "floor");

  // テキストのサイズを計算（仮の値。実際には.getComputedTextLength()で計算する）
  const fontSize = 9;
  const padding = 5;
  const rateText = `(Rate ${(percent * 100).toFixed(2)}%)`;
  const displayValueText = `目標 ${formattedValue}`;
  // const textWidth = Math.max(formattedValue.length, rateText.length) * fontSize * 0.6; // 0.6はおおよその比率
  const textWidth = Math.max(displayValueText.length, rateText.length) * fontSize * 0.6; // 0.6はおおよその比率
  const textHeight = fontSize + 10 * 2; // 2行分のテキスト高さ 上下padding 5 * 2

  // `<rect>`のサイズと位置
  const rectWidth = textWidth + padding * 2;
  const rectHeight = textHeight + padding * 2;
  // const rectX = cx - rectWidth / 2;
  // const rectY = cy - outerRadius - rectHeight - 10; // 10は追加のマージン

  const rectX = mx + (cos >= 0 ? 1 : -1) * 12 - (textAnchor === "end" ? rectWidth : 0);
  const rectY = my - rectHeight / 2;

  return (
    <g>
      <text x={cx} y={cy} dy={8} style={{ maxWidth: `80px` }} fontSize="9px" textAnchor="middle" fill={fill}>
        {/* {payload.name} */}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      {/* 描画順が早いほどz-indexが下に位置するため、上に表示したい場合は後ろに配置する */}
      {/* <rect
        x={mx + (cos >= 0 ? 1 : -1) * 12 + rectProps.x}
        y={my + rectProps.y}
        width={rectProps.width}
        height={rectProps.height}
        fill="white"
        fillOpacity={0.75}
      /> */}
      {/* <rect x={bgRect.x} y={bgRect.y} width={bgRect.width} height={bgRect.height} fill="white" opacity="0.75" /> */}
      <rect x={rectX} y={rectY} width={rectWidth} height={rectHeight} fill="white" fillOpacity={0.75} />
      <text
        ref={textRef}
        x={mx + (cos >= 0 ? 1 : -1) * 12}
        y={my}
        fontSize="9px"
        textAnchor={textAnchor}
        fill="#333"
      >{`目標 ${formattedValue}`}</text>
      {/* 9(fontSize) + 5(padding) */}
      <text x={mx + (cos >= 0 ? 1 : -1) * 12} y={my} dy={14} fontSize="9px" textAnchor={textAnchor} fill="#999">
        {`(Rate ${(percent * 100).toFixed(2)}%)`}
      </text>
      {/* <text x={mx + (cos >= 0 ? 1 : -1) * 12} y={my} dy={18} fontSize="9px" textAnchor={textAnchor} fill="#999">
        {`(Rate ${(percent * 100).toFixed(2)}%)`}
      </text> */}
    </g>
  );

  // return (
  //   <g>
  //     <text x={cx} y={cy} dy={8} style={{ maxWidth: `80px` }} fontSize="9px" textAnchor="middle" fill={fill}>
  //       {payload.name}
  //     </text>
  //     <Sector
  //       cx={cx}
  //       cy={cy}
  //       innerRadius={innerRadius}
  //       outerRadius={outerRadius}
  //       startAngle={startAngle}
  //       endAngle={endAngle}
  //       fill={fill}
  //     />
  //     <Sector
  //       cx={cx}
  //       cy={cy}
  //       startAngle={startAngle}
  //       endAngle={endAngle}
  //       innerRadius={outerRadius + 6}
  //       outerRadius={outerRadius + 10}
  //       fill={fill}
  //     />
  //     {/* <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" /> */}
  //     {/* <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" /> */}
  //     {/* <path d={`M${sx},${sy}L${mx},${my}`} stroke={fill} fill="none" /> */}
  //     {/* <circle cx={mx} cy={my} r={2} fill={fill} stroke="none" /> */}
  //     {/* <text
  //       x={ex + (cos >= 0 ? 1 : -1) * 12}
  //       y={ey}
  //       fontSize="9px"
  //       textAnchor={textAnchor}
  //       fill="#333"
  //     >{`PV ${value}`}</text>
  //     <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} fontSize="9px" textAnchor={textAnchor} fill="#999">
  //       {`(Rate ${(percent * 100).toFixed(2)}%)`}
  //     </text> */}
  //     {/* <path d={`M${sx},${sy}L${px},${py}`} stroke={fill} fill="none" />
  //     <circle cx={px} cy={py} r={2} fill={fill} stroke="none" /> */}
  //     <text
  //       x={mx + (cos >= 0 ? 1 : -1) * 12}
  //       y={my}
  //       fontSize="9px"
  //       textAnchor={textAnchor}
  //       fill="#333"
  //     >{`目標 ${formattedValue}`}</text>
  //     <text x={mx + (cos >= 0 ? 1 : -1) * 12} y={my} dy={18} fontSize="9px" textAnchor={textAnchor} fill="#999">
  //       {`(Rate ${(percent * 100).toFixed(2)}%)`}
  //     </text>
  //   </g>
  // );
};
