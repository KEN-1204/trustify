import { formatSalesTarget } from "@/utils/Helpers/formatSalesTarget";
import { useEffect, useRef, useState } from "react";
import { Sector } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";
import { ActiveShape } from "recharts/types/util/types";

// 背景なしテキストのみ
export const renderActiveShape = (props: PieSectorDataItem): any => {
  // <rect>のサイズ計算用に使用
  const textRef = useRef<SVGTextElement | null>(null);
  const [rectProps, setRectProps] = useState({ x: 0, y: 0, width: 0, height: 0 });

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

  // まずパイチャートの中心座標からセクターの端点（開始点）を求める *3
  const sin = Math.sin(-RADIAN * midAngle); // パイチャートの中心x座標からセクターまでの水平方向（x方向）の距離
  const cos = Math.cos(-RADIAN * midAngle); // パイチャートの中心y座標からセクターまでの垂直方向（y方向）の距離
  // (X, Y) => (cx + r * cos, cy + r * sin)のX部分 「cx + r * cos」
  // cx: パイチャートの中心X座標,
  // r: セクターの半径(radius)、
  // cos: 原点(チャート中心点)から点P(セクター端点)までの距離のX座標の値(左右方向の距離)
  // sin: 原点(チャート中心点)から点P(セクター端点)までの距離のY座標の値(上方向の距離)
  const mx = cx + (outerRadius + 10) * cos; // 「+ 10」はセクター半径からどれだけ外側にオフセットさせるか
  const my = cy + (outerRadius + 10) * sin;
  // const sx = cx + (outerRadius + 10) * cos;
  // const sy = cy + (outerRadius + 10) * sin;
  // const mx = cx + (outerRadius + 30) * cos;
  // const my = cy + (outerRadius + 30) * sin;
  // const px = cx + (outerRadius + 20) * cos;
  // const py = cy + (outerRadius + 20) * sin;

  // cosが0より大きいなら単位円の右側で第一象限(0~90°, 270~360°)
  const ex = mx + (cos >= 0 ? 1 : -1) * 22; // 左右どちらにどの程度オフセットさせてテキストを表示するか
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  // valueを4文字以内に整形 123億4500万 => 123.4
  const formattedValue = formatSalesTarget(value, "floor");

  // テキストのサイズを計算（仮の値。実際には.getComputedTextLength()で計算する）
  const fontSize = 9;
  const paddingX = 6;
  const paddingY = 10;
  const rateText = `シェア：${(percent * 100).toFixed(2)}%`;
  const displayValueText = `目標：${formattedValue}`;
  // const textWidth = Math.max(formattedValue.length, rateText.length) * fontSize * 0.6; // 0.6はおおよその比率
  // 小数点一つの大きさX方向の幅が狭いため1文字分加算
  const textWidth = Math.max(displayValueText.length, rateText.length) * fontSize * 0.8; // 0.6はおおよその比率*2 Tips
  // const textHeight = fontSize + 10 * 2; // 2行分のテキスト高さ 上下padding 5 * 2
  const textHeight = fontSize * 2; // 2行分のテキスト高さ

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
      <text
        ref={textRef}
        x={mx + (cos >= 0 ? 1 : -1) * 12}
        y={my}
        // fontSize="9px"
        fontSize={fontSize}
        textAnchor={textAnchor}
        fill="#333"
      >{`目標：${formattedValue}`}</text>
      {/* 9(fontSize) + 5(padding) */}
      <text x={mx + (cos >= 0 ? 1 : -1) * 12} y={my} dy={14} fontSize={fontSize} textAnchor={textAnchor} fill="#999">
        {`シェア：${(percent * 100).toFixed(2)}%`}
      </text>
      {/* <text x={mx + (cos >= 0 ? 1 : -1) * 12} y={my} dy={18} fontSize="9px" textAnchor={textAnchor} fill="#999">
        {`(Rate ${(percent * 100).toFixed(2)}%)`}
      </text> */}
    </g>
  );
};

/**
 * 
 *2
 0.6という係数は、フォントの平均的な文字幅をピクセル単位で推定するために用いられます。フォントや文字によって実際の幅は異なるため、この値は一般的な近似値として使用されます。具体的には、フォントサイズ（fontSize）にこの係数を乗算することで、様々な文字の平均的な幅を得ることができるという考え方です。

SVGやHTMLのテキスト要素では、テキストの長さや幅を事前に正確に知ることは難しく、特にSVGではテキストのレンダリング後にしかサイズを測定できません。そのため、テキスト背景の<rect>を描画する際に、あらかじめテキストの長さを推定する必要がある場合があります。

この0.6という係数は、特定のフォントや文字サイズにおける経験則から導かれたものであり、多くのケースにおいて十分な精度でテキストの長さを推定することができます。しかし、使用するフォントの種類やスタイル、または特定の文字（例えばiやmのように幅が大きく異なる文字）によっては、この係数を調整する必要があります。

テキストの長さを計算する際にこの係数を使用することで、以下のような目的を達成できます：

テキストを囲む<rect>の適切な初期サイズを設定し、テキストが視覚的に収まるようにする。
テキストの動的なサイズ変更や内容の更新があった場合にも、背景サイズを適切に調整するための基準を提供する。
最終的に、テキストの実際のサイズを測定して背景サイズを調整するのが最も正確ですが、描画前の推定値としてこの係数を使用することで、ユーザーインターフェイスの設計や初期レンダリング時の見栄えを改善することができます。

 */

/** *3
   * セクターの座標を求める
cos（コサイン） の値は、セクターの中心角に対応する単位円上の点のx座標を表します。これを使って、パイチャートの中心からセクターまでの水平方向の距離を計算できます。
sin（サイン） の値は、同じくセクターの中心角に対応する単位円上の点のy座標を表します。これにより、垂直方向の距離を計算できます。
これらの値を使用して、パイチャートの中心からのオフセットを計算し、セクターの正確な位置を決定できます。
   */
