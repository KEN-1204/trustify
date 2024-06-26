import { zenkakuToHankaku } from "./zenkakuToHankaku";

// 「兆」「億」「万」「円」を万円単位の数字に変換する関数
export function convertToMillions(inputString: string, isDecimalPoint: boolean = false): number | null {
  // 小数点なし
  if (!isDecimalPoint) {
    // 入力文字列が空の場合にはnullを返す
    if (inputString.trim() === "") return null;

    // 全角数字を半角に変換
    inputString = zenkakuToHankaku(inputString);

    // 「兆」「億」「万」「円」が含まれていなければ変換をスキップ 1250 => 1250万円
    if (
      !inputString.includes("兆") &&
      !inputString.includes("億") &&
      !inputString.includes("万") &&
      !inputString.includes("円") &&
      !inputString.includes(",")
    ) {
      return parseInt(inputString, 10);
    }

    // 数値をクリーンアップ(カンマや非数値文字を取り除く) => 円単位の入力の場合に使用
    //   let numericValue = inputString.replace(/,/g, "").replace(/[^\d]/g, "");

    // 兆、億、万、円で分割して数値を計算
    let total = 0;
    const trillionMatch = inputString.match(/(\d+(,\d+)*)兆/); // 数字一つ以上とカンマ数字一つ以上か、カンマ無し数字
    const billionMatch = inputString.match(/(\d+(,\d+)*)億/);
    const millionMatch = inputString.match(/(\d+(,\d+)*)万/);
    // const trillionMatch = inputString.match(/(\d+)兆/);
    // const billionMatch = inputString.match(/(\d+)億/);
    // const millionMatch = inputString.match(/(\d+)万/);

    // 1,000や1,000,000のように単位無しで区切り文字のみ存在する場合は区切り文字を取り除いてそのまま返す
    if (!trillionMatch && !billionMatch && !millionMatch && inputString.includes(","))
      return parseInt(inputString.replace(/,/g, "").replace(/[^\d]/g, ""), 10);

    // trillionMatch[1]はキャプチャグループによって抽出された値 => 今回は\dで任意の数値、+で\dが一回以上の連続した数字
    if (trillionMatch) total += parseInt(trillionMatch[1].replace(/,/g, ""), 10) * 100000000; // 兆の計算
    if (billionMatch) total += parseInt(billionMatch[1].replace(/,/g, ""), 10) * 10000; // 億の計算
    if (millionMatch) total += parseInt(millionMatch[1].replace(/,/g, ""), 10); // 万の計算
    // if (trillionMatch) total += parseInt(trillionMatch[1], 10) * 100000000; // 兆の計算
    // if (billionMatch) total += parseInt(billionMatch[1], 10) * 10000; // 億の計算
    // if (millionMatch) total += parseInt(millionMatch[1], 10); // 万の計算
    //   if (!trillionMatch && !billionMatch && numericValue) total += Math.floor(parseInt(numericValue, 10)) / 10000; //「万」単位がなく数値が存在する場合(円単位の処理) 万単位の入力ではなく円単位でユーザーに入力してもらう場合に使用

    return total;
  } else {
    // 入力文字列が空の場合にはnullを返す
    if (inputString.trim() === "") return null;

    // 全角数字を半角に変換
    inputString = zenkakuToHankaku(inputString);

    // 「兆」「億」「万」「円」が含まれていなければ変換をスキップ 1250 => 1250万円
    if (
      !inputString.includes("兆") &&
      !inputString.includes("億") &&
      !inputString.includes("万") &&
      !inputString.includes("円") &&
      !inputString.includes(",")
    ) {
      return parseFloat(inputString);
    }

    // 兆、億、万、円で分割して数値を計算
    let total = 0;
    const trillionMatch = inputString.match(/(\d+(,\d+)*)兆/); // 数字一つ以上とカンマ数字一つ以上か、カンマ無し数字
    const billionMatch = inputString.match(/(\d+(,\d+)*)億/);
    const millionMatch = inputString.match(/(\d+(,\d+)*)万/);

    // 1,000や1,000,000のように単位無しで区切り文字のみ存在する場合は区切り文字を取り除いてそのまま返す
    if (!trillionMatch && !billionMatch && !millionMatch && inputString.includes(","))
      return parseFloat(inputString.replace(/,/g, "").replace(/[^\d]/g, ""));

    // trillionMatch[1]はキャプチャグループによって抽出された値 => 今回は\dで任意の数値、+で\dが一回以上の連続した数字
    if (trillionMatch) total += parseFloat(trillionMatch[1].replace(/,/g, "")) * 100000000; // 兆の計算
    if (billionMatch) total += parseFloat(billionMatch[1].replace(/,/g, "")) * 10000; // 億の計算
    if (millionMatch) total += parseFloat(millionMatch[1].replace(/,/g, "")); // 万の計算

    return total;
  }
}

// 使用例
// console.log(convertToMillions("18億9,190万円")); // 18190
// console.log(convertToMillions("12,500,000円")); // 1250
// console.log(convertToMillions("1兆2億3,400万円")); // 10002340

/**
 * 
 * inputString.match(/(\d+)兆/) の正規表現 /(\d+)兆/ は、「兆」という文字の前にある一つ以上の数字にマッチするように設計されています。具体的には次のように機能します：

\d: これは任意の数字（0-9）にマッチします。

+: これは直前の文字（この場合は \d）が一回以上繰り返されることを意味します。つまり、\d+ は一つ以上の連続した数字にマッチします。

(): これはキャプチャグループを作成します。キャプチャグループはマッチした部分を別に抽出して後で参照するために使われます。

兆: これは文字通りの「兆」という文字にマッチします。

例えば、inputString が「1兆2345万円」という値の場合、inputString.match(/(\d+)兆/) は「1兆」の部分にマッチし、キャプチャグループ () は「1」という数字を抽出します。この正規表現により、兆単位の数値を文字列から抽出することができます。

match メソッドはマッチした部分を含む配列を返します。この場合、返される配列の最初の要素（インデックス0）はマッチした全体の文字列（例：「1兆」）、2番目の要素（インデックス1）はキャプチャグループによって抽出された数字（例：「1」）です。

 match メソッドを正規表現とともに使用し、キャプチャグループ（() で囲まれた部分）を含む場合、match メソッドが返す配列には以下の要素が含まれます：

配列の最初の要素（インデックス0）は、正規表現にマッチした全体の文字列です。例えば、"1兆2345万円".match(/(\d+)兆/) では、「1兆」がこの要素になります。

その後の要素は、正規表現内の各キャプチャグループに対応しています。最初のキャプチャグループにマッチした文字列がインデックス1、次のキャプチャグループがインデックス2、というように続きます。例えば、"1兆2345万円".match(/(\d+)兆/) の場合、インデックス1の要素は「1」になります。

キャプチャグループは、正規表現によるマッチングで特定の部分を抽出しやすくするためによく使用されます。上記の例では、金額から「兆」の単位に対応する数値部分を抽出するためにキャプチャグループを使用しています。

インデックス2が生成されるのは、正規表現に2つのキャプチャグループがある場合です。キャプチャグループは () で表され、正規表現内で括弧で囲まれた部分にマッチした文字列を抽出します。もし正規表現に2つのキャプチャグループがあれば、match メソッドが返す配列には次のような要素が含まれます：

インデックス0: 正規表現全体にマッチした文字列。
インデックス1: 最初のキャプチャグループにマッチした部分。
インデックス2: 二番目のキャプチャグループにマッチした部分。
例えば、次のような正規表現と文字列を考えます：

const regex = /(\d+)兆(\d+)万/;
const string = "1兆2345万円";

const match = string.match(regex);

この場合、match の結果は次のようになります：

インデックス0: "1兆2345万"（全体にマッチした部分）
インデックス1: "1"（最初のキャプチャグループにマッチした部分）
インデックス2: "2345"（二番目のキャプチャグループにマッチした部分）
このように、正規表現内で複数のキャプチャグループが定義されている場合、match メソッドはそれぞれのキャプチャグループに対応する部分を追加のインデックスとして配列に追加します。

 */
