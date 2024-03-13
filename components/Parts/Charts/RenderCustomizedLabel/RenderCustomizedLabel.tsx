import { CustomizedLabelProps } from "@/types";
import { wrapJapaneseText } from "@/utils/Helpers/wrapJapaneseSVGText";
import { JSXElementConstructor, ReactElement, ReactNode, memo, useEffect, useRef, useState } from "react";

// type CustomizedLabelProps = {
//   cx: number;
//   cy: number;
//   midAngle: number;
//   innerRadius: number;
//   outerRadius: number;
//   percent: number;
//   index: number;
// };

type CustomProps = { isHovering: boolean; labelName: string; fillColor: string };

type Props = {
  props: CustomizedLabelProps;
  customProps: CustomProps;
};

const RenderCustomizeLabelMemo = ({
  props,
  customProps,
}: Props): ReactNode | ReactElement<SVGElement, string | JSXElementConstructor<any>> => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, index } = props;
  const { isHovering, fillColor, labelName } = customProps;

  const RADIAN = Math.PI / 180;
  // const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  // const x = cx + radius * Math.cos(-midAngle * RADIAN);
  // const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // まずパイチャートの中心座標からセクターの端点（開始点）を求める *3, 4
  // SVGでは、画面の左上が(0, 0)の座標として扱われ、Y座標は下向きに正となります。従って、通常の数学的な座標系（Y座標が上向きに正）とは異なります。しかし、Math.sin関数自体の振る舞いは変わらず、角度が正の場合は正のY座標（数学的な座標系での上方向）を返します。
  // -RADIAN * midAngleで角度にマイナス符号を使用すると、この振る舞いが反転します。つまり、本来上半分（数学的な座標系での上方向）に対応する正のsin値が、下半分に対応するようになり、その逆もまた同様です。これは、角度を反時計回りではなく時計回りに解釈することに相当します。
  const sin = Math.sin(-RADIAN * midAngle); // パイチャートの中心x座標からセクターまでの水平方向（x方向）の距離
  const cos = Math.cos(-RADIAN * midAngle); // パイチャートの中心y座標からセクターまでの垂直方向（y方向）の距離

  const sx = cx + outerRadius * cos;
  const sy = cy + outerRadius * sin;
  const mx = cx + (outerRadius + 15) * cos; // 「+ 10」はセクター半径からどれだけ外側にオフセットさせるか
  const my = cy + (outerRadius + 15) * sin;

  // 🔹テキストの位置オフセットの設定
  // let offsetTextX = 0;
  // let offsetTextY = 0;

  // // 🔹上下のオフセット
  // if (0 <= sin) {
  //   offsetTextY = 0 <= cos ? 20 : 15; // 上側 右側の場合下に20 左側の場合下に15
  // } else {
  //   offsetTextY = -10; // 下側 上に10オフセット
  // }

  // マイナスしているため時計回り const cos = Math.cos(-RADIAN * midAngle);
  let offsetTextX = cos <= 0 ? 12 : -10;
  // マイナスしてるため数学と上下反転
  let offsetTextY = sin <= 0 ? -10 : 10;

  // 🔹textAnchorの設定 // 🔹左右のオフセットも同時に設定
  // 水平方向 0.3 ~ cos textAnchorをstart
  let textAnchorVal = "start"; // 初期値はstartでテキスト左端を起点とする
  if (-0.3 <= cos && cos <= 0.3) {
    textAnchorVal = "middle"; // 中心から左右に30%の中央の範囲まではmiddleに設定
    offsetTextX = 0;
    if (0 <= sin) offsetTextY += 3; // 中央範囲でかつ、下にあるセクターは少し他よりも多めに下げる
  } else if (cos <= -0.3) {
    textAnchorVal = "end"; // 左に30%以上はendを設定
  }

  // 🔹dominantBaselineの設定 // 🔹左右のオフセットも同時に設定
  // svgで-RADIANで上下反転しているため、sinが負の値、下半分の場合はauto、上半分の場合はhangingを設定
  let dominantBaselineVal = "hanging";
  if (sin <= 0) {
    dominantBaselineVal = "auto";
  }

  // 真下
  // if (0 <= cos && cos <= 0.2) offsetTextX = 5;

  const fill = fillColor;

  const textRef = useRef<SVGTextElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  // const [isWrap, setIsWrap] = useState(false)

  // max-widthは115px
  let displayName = labelName;

  useEffect(() => {
    if (isMounted) return;
    // textEl = document.querySelector(`#customized_label_${labelName}`);
    if (textRef.current) {
      const textWidth = textRef.current.getComputedTextLength();
      // console.log("textWidth", textWidth);

      if ((cos < -0.3 || 0.3 < cos) && textWidth > 118) {
        // setIsWrap(true);
        console.log("超過 textWidth", textWidth, "textRef.current", textRef.current);
        wrapJapaneseText({
          textElement: textRef.current,
          maxWidth: 118,
          dyDirection: sin <= 0 ? "up" : "down", // -RADIANで上下反転している
          dySize: "10px",
        });
      }

      setIsMounted(true);
    }
  }, []);

  return (
    <>
      {/* <g className={`${isMountedChart ? `` : `fade_chart05_d03`}`}> */}
      {isHovering && <g className={``}></g>}
      {!isHovering && (
        <g className={`fade05`}>
          <path d={`M${sx},${sy}L${mx},${my}`} stroke={fill} fill="none" />
          <circle cx={mx} cy={my} r={2} fill={fill} stroke="none" />
          <text
            // id={`customized_label_${labelName}`}
            ref={textRef}
            x={mx}
            y={my}
            dx={offsetTextX}
            dy={offsetTextY}
            fill={fillColor}
            fontSize="10px"
            // textAnchor={"middle"}
            textAnchor={textAnchorVal}
            dominantBaseline={dominantBaselineVal}
          >
            <tspan>{displayName}</tspan>
          </text>
          {/* <text
          x={mx}
          y={my}
          dx={offsetTextX}
          dy={offsetTextY + 12}
          fill={COLORS[index]}
          fontSize="10px"
          textAnchor={"middle"}
        >
          <tspan>{departmentDataArray[index]?.department_name}</tspan>
        </text> */}
        </g>
      )}
    </>
  );
};

export const RenderCustomizeLabel = memo(RenderCustomizeLabelMemo);

/**
*4

はい、その通りです。const sin = Math.sin(-RADIAN * midAngle);でマイナス符号を使用しているため、結果が反転しています。通常、三角関数のsin関数は、角度が正の値の場合、単位円上でのY座標を返します。角度が0から180度の範囲では正の値を、180度から360度の範囲では負の値を取ります。これは、単位円（円の半径が1の円）上での角度の標準的な解釈に基づきます。

SVGでは、画面の左上が(0, 0)の座標として扱われ、Y座標は下向きに正となります。従って、通常の数学的な座標系（Y座標が上向きに正）とは異なります。しかし、Math.sin関数自体の振る舞いは変わらず、角度が正の場合は正のY座標（数学的な座標系での上方向）を返します。

-RADIAN * midAngleで角度にマイナス符号を使用すると、この振る舞いが反転します。つまり、本来上半分（数学的な座標系での上方向）に対応する正のsin値が、下半分に対応するようになり、その逆もまた同様です。これは、角度を反時計回りではなく時計回りに解釈することに相当します。

したがって、sin <= 0 ? "下半分" : "上半分"という条件で「下半分」「上半分」を判断する際には、マイナス符号の使用によって、本来の期待とは逆の結果が得られてしまいます。sinの値が正であれば通常はパイチャートの上半分に対応しますが、マイナス符号を乗算することでその解釈が反転しているのです。
 */
