import next from "next/types";

// svg内の<tspan></tspan>の要素の最大幅を超えたタイミングで次の行に折り返す関数
type Props = {
  textElement: SVGTextElement;
  maxWidth: number;
  dyDirection: "up" | "down";
  dySize: string;
  isCenter?: boolean;
};

export function wrapJapaneseText({ textElement, maxWidth, dyDirection, dySize, isCenter = false }: Props) {
  // <text>要素のテキストコンテンツ
  const text = textElement.textContent ?? "";
  // createElementの第一引数に渡すSVGの名前空間URL
  const svgNS = "http://www.w3.org/2000/svg";

  // テキストをクリアし、1文字ずつ処理する準備
  textElement.textContent = "";

  // tspan要素を生成
  let currentLine = document.createElementNS(svgNS, "tspan");
  // <text>要素のx属性の値をtspanにも同様にセット yはtext要素から位置を継承しているためxの位置がtext要素と一緒でよければ次の行のyの一致をオフセットさせるdy属性のみsetAttributeを実行すればO

  // 下や上の行にオフセット
  if (!isCenter) {
    if (dyDirection === "down") currentLine.setAttribute("dy", dySize);
    if (dyDirection === "up") currentLine.setAttribute("dy", dySize);
  }

  // <text></text>の中に子要素として先ほど生成した<tspan>要素を挿入
  textElement.appendChild(currentLine);

  for (let i = 0; i < text.length; i++) {
    // 現在の行に次の文字を追加
    currentLine.textContent += text[i];

    // 現在の行の長さをチェック
    if (currentLine.getComputedTextLength() > maxWidth && currentLine.textContent && textElement) {
      // maxWidthを超えたタイミングで追加されてしまった超過文字の最後の文字を削除し、残った文字列をその行に再代入して既存の行を完成させる
      currentLine.textContent = currentLine.textContent.slice(0, -1);

      // その後次の行を生成して、次の行の処理に移行 // 次の行のためのtspanを作成
      // currentLine = document.createElementNS(svgNS, "tspan");
      let nextLine = document.createElementNS(svgNS, "tspan");

      // dominantBaselineがendの場合はxの位置を左側に揃える
      if (textElement.getAttribute("text-anchor") === "end") {
        // テキストアンカーendのため2行目は左寄せ
        nextLine.setAttribute("text-anchor", "start");

        // 1行目のテキストの全幅を取得
        const textWidth = currentLine.getComputedTextLength();
        // 1行目の右端のX座標から全幅を引いて、2行目以降のの開始X座標を算出
        const startX = parseFloat(textElement.getAttribute("x") ?? "0") - textWidth;

        // 1行目の左端の位置を2行目の開始位置に設定
        nextLine.setAttribute("x", startX.toString());
        // オフセット量は親要素に合わせる
        nextLine.setAttribute("dx", textElement.getAttribute("dx") ?? "0");
      } else {
        // textAnchorがstartのルート <text>要素のx属性とdx属性をtspanにも適用してテキスト開始位置を合わせる
        nextLine.setAttribute("x", textElement.getAttribute("x") ?? "0");
        nextLine.setAttribute("dx", textElement.getAttribute("dx") ?? "0");
      }

      // テキストアンカーがmiddleとdominantBaseLineがcentralならそれに合わせる
      if (textElement.getAttribute("text-anchor") === "middle") {
        nextLine.setAttribute("text-anchor", "middle");
      }
      if (textElement.getAttribute("dominant-baseline") === "central") {
        nextLine.setAttribute("dominant-baseline", "central");
      }

      // 次の行に移行する前にcurrentLineを更新
      currentLine = nextLine;

      // 新しい行の垂直位置を下や上の段落にオフセットして調整
      // currentLine.setAttribute("dy", "1.2em");
      currentLine.setAttribute("dy", dySize);
      // 新たな行に移ったため、先ほど削除した文字を新たに次の行の開始文字として追加
      currentLine.textContent = text[i]; // 折り返した文字を新しい行に追加
      // <text>要素に次の行を挿入
      textElement.appendChild(currentLine);
    }
  }
}

// // 第1引数のインデックスから第2引数のインデックスの直前までの範囲が抽出されます。第2引数が負の値の場合、文字列の終わりからの位置を指定することになります。
// テキストの幅が指定された最大幅を超えることが確認された時点で、既に追加されてしまった最後の文字（超過分）を取り除き、その文字を新しい行の開始文字として設定するために使用されます。これにより、テキストが適切に折り返され、指定された幅を超えないようになります。
