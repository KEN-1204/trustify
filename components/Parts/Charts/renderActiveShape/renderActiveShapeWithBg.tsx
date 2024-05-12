import { formatSalesTarget } from "@/utils/Helpers/formatSalesTarget";
import { wrapJapaneseText } from "@/utils/Helpers/wrapJapaneseSVGText";
import { mappingEntityName } from "@/utils/mappings";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Sector } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";
import { ActiveShape } from "recharts/types/util/types";

type CustomData = {
  mainEntity: string;
  mainSalesTarget: number;
  isHovering: boolean;
  disabledTooltip?: boolean;
};

type Props = {
  props: PieSectorDataItem;
  customProps: CustomData;
};

// // 背景あり
// export const RenderActiveShapeWithBg = (props: PieSectorDataItem, customData: CustomData): any => {
// 背景あり
const RenderActiveShapeWithBgMemo = ({ props, customProps }: Props): any => {
  // <rect>のサイズ計算用に使用
  const textRef = useRef<SVGTextElement | null>(null);

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

  const disabledTooltip = customProps.disabledTooltip;

  const [isMounted, setIsMounted] = useState(false);
  const centerTextRef = useRef<SVGTextElement | null>(null);

  const sectorName = props.name;

  if (disabledTooltip === true) {
    return (
      <g>
        {/* 中央のテキスト */}
        <text
          ref={centerTextRef}
          x={cx}
          y={cy}
          // dy={8}
          // style={{ maxWidth: `80px` }}
          fontSize="11px"
          fontWeight={700}
          textAnchor="middle"
          dominantBaseline="central"
          fill={fill}
          className={`fade05`}
        >
          {sectorName ?? ""}
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
          className={`fade05`}
        />
      </g>
    );
  }

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
  const formattedValue = useMemo(() => formatSalesTarget(value, "floor"), [value]);
  // メインエンティティの売上目標 中央に配置
  // const formattedMainValue = useMemo(
  //   () => formatSalesTarget(customProps.mainSalesTarget, "floor"),
  //   [customProps.mainSalesTarget]
  // );

  // テキストのサイズを計算（仮の値。実際には.getComputedTextLength()で計算する）
  // const fontSize = 9;
  const fontSize = 10;
  const paddingX = 6;
  const paddingY = 10;
  const rateText = `シェア：${(percent * 100).toFixed(2)}%`;
  // const rateOnlyText = `${(percent * 100).toFixed(2)}%`;
  const displayValueText = `目標：${formattedValue}`;
  // const textWidth = Math.max(formattedValue.length, rateText.length) * fontSize * 0.6; // 0.6はおおよその比率
  // 小数点一つの大きさX方向の幅が狭いため1文字分加算
  const textWidth = Math.max(displayValueText.length, rateText.length) * fontSize * 0.8; // 0.6はおおよその比率*2 Tips
  // const textHeight = fontSize + 10 * 2; // 2行分のテキスト高さ 上下padding 5 * 2
  const textHeight = fontSize * 2; // 2行分のテキスト高さ

  // <text>の位置
  // const textX = mx + (cos >= 0 ? 1 : -1) * 12 ;
  const textX = mx + (cos >= 0 ? 1 : -1) * 12 + (textAnchor === "end" ? 15 : 0);
  const textY = my;

  // `<rect>`のサイズと位置
  const rectWidth = textWidth + paddingX * 2; //  左右padding 5 * 2
  const rectHeight = textHeight + paddingY * 2; // 上下padding 5 * 2
  // const rectX = cx - rectWidth / 2;
  // const rectY = cy - outerRadius - rectHeight - 10; // 10は追加のマージン

  // const rectX = mx + (cos >= 0 ? 1 : -1) * 12 - (textAnchor === "end" ? rectWidth : 0);
  // const rectX = mx + (cos >= 0 ? 1 : -1) * 12 - (textAnchor === "end" ? rectWidth - 6 : 0 + 6);
  const rectX = mx + (cos >= 0 ? 1 : -1) * 12 - (textAnchor === "end" ? rectWidth - 24 : 0 + 6);
  const rectY = my - rectHeight / 2 + 3; // +3は下方向にオフセットで調整

  // id
  const descId = customProps.mainEntity;
  const isHovering = customProps.isHovering;
  const mainSalesTarget = customProps.mainSalesTarget;

  // 中央のセクター名が68pxを超えていたら折り返す

  useEffect(() => {
    if (disabledTooltip === false) return;
    // if (isMounted) return;
    if (centerTextRef.current) {
      const centerTextWidth = centerTextRef.current.getComputedTextLength();

      if (centerTextWidth > 68) {
        console.log("超過 centerTextWidth", centerTextWidth, "centerTextRef.current", centerTextRef.current);
        wrapJapaneseText({
          textElement: centerTextRef.current,
          maxWidth: 68,
          dyDirection: "down", // -RADIANで上下反転している
          dySize: "13px",
          isCenter: true,
        });
        // 折り返し後に全体を少し上にオフセット
        centerTextRef.current.setAttribute("dy", "-3px");
      }

      // setIsMounted(true);
    }
  }, []);

  // グラデーション
  let x1 = "100%";
  let y1 = "0%";
  let x2 = "0%";
  let y2 = "100%";

  console.log(
    "🌠renderActiveShape props",
    props,

    "customProps",
    customProps,
    "isHovering",
    isHovering
  );

  // <g></g>はsvgのグループ要素として機能
  return (
    <g>
      {/* 中央のテキスト */}
      <text
        ref={centerTextRef}
        x={cx}
        y={cy}
        // dy={8}
        // style={{ maxWidth: `80px` }}
        fontSize="11px"
        fontWeight={700}
        textAnchor="middle"
        dominantBaseline="central"
        fill={fill}
        className={`fade05`}
      >
        {/* {payload.name} */}
        {/* {!isHovering && mainSalesTarget}
        {isHovering && formattedMainValue} */}
        {/* {formattedMainValue} */}
        {/* {rateOnlyText} */}
        {sectorName ?? ""}
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
        className={`fade05`}
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

      <defs>
        <linearGradient id={`sales_Target_${customProps.mainEntity}`} x1={x1} y1={y1} x2={x2} y2={y2}>
          {/* <stop offset="0%" stopColor="#27272ac0" />
          <stop offset="100%" stopColor="#18181bc0" /> */}
          <stop offset="0%" stopColor="#666" />
          <stop offset="30%" stopColor="#484848" />
          <stop offset="70%" stopColor="#333" />
          <stop offset="100%" stopColor="#121212" />
        </linearGradient>
        {/* <linearGradient id={`circleLinearGradient_${circleId}`} x1={x1} y1={y1} x2={x2} y2={y2}>
          <stop offset="56%" stopColor={oneColor} />
        </linearGradient> */}
        {/* box-shadowシャドウ */}
        <filter id="shadow" height="130%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity={0.6} />
        </filter>
      </defs>
      {/* <rect x={bgRect.x} y={bgRect.y} width={bgRect.width} height={bgRect.height} fill="white" opacity="0.75" /> */}
      <rect
        x={rectX}
        y={rectY}
        width={rectWidth}
        height={rectHeight}
        // fill="white"
        fill={`url(#sales_Target_${customProps.mainEntity})`}
        fillOpacity={0.9}
        filter="url(#shadow)"
        stroke="var(--box-shadow-tooltip-border-inside)"
        strokeWidth="1px"
        rx={6}
        ry={6}
        className={`fade05`}
      />
      {/* 二重目ボーダー用 */}
      <rect
        x={rectX - 1}
        y={rectY - 1}
        width={rectWidth + 2}
        height={rectHeight + 2}
        // fill="white"
        fill={`none`}
        stroke="var(--box-shadow-tooltip-border-outside)"
        strokeWidth="1px"
        rx={6}
        ry={6}
        className={`fade05`}
      />
      {/* <text
        ref={textRef}
        x={textX}
        y={textY}
        dy={-14}
        fontSize={fontSize}
        textAnchor={textAnchor}
        fill="#fff"
        className={`fade05`}
      >{`マイクロスコープ事業部`}</text> */}
      {/* 目標 */}
      <text
        ref={textRef}
        // x={mx + (cos >= 0 ? 1 : -1) * 12}
        // y={my}
        x={textX}
        y={textY}
        // fontSize="9px"
        fontSize={fontSize}
        textAnchor={textAnchor}
        // fill="#333"
        fill="#fff"
        className={`fade05`}
      >{`目標：${formattedValue}`}</text>
      {/* シェア */}
      <text
        // x={mx + (cos >= 0 ? 1 : -1) * 12}
        // y={my}
        x={textX}
        y={textY}
        dy={14}
        fontSize={fontSize}
        textAnchor={textAnchor}
        // fill="#999"
        fill="#ccc"
        className={`fade05`}
      >
        {/* {`シェア：${(percent * 100).toFixed(2)}%`} */}
        {rateText}
      </text>
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

export const RenderActiveShapeWithBg = memo(RenderActiveShapeWithBgMemo);
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
