// 値引率の半角変換とパーセント記号の除去

export function normalizeDiscountRate(input: string) {
  // 全角数字を半角数字に変換
  const fullWidthToHalfWidth = (str: string) =>
    str.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0));

  // 数字、小数点、パーセント記号以外を除去 *1
  let sanitizedInput = input.replace(/[^\d.%％]/g, "");

  // 小数点が2つ以上含まれている場合は無効な値として扱う
  if ((sanitizedInput.match(/\./g) || []).length > 1) {
    return "";
  }

  sanitizedInput = fullWidthToHalfWidth(sanitizedInput);

  // 小数点が先頭にある場合、0を追加
  if (sanitizedInput.startsWith(".")) {
    sanitizedInput = "0" + sanitizedInput;
  }

  // // 全角数字を半角に変換し、パーセント記号を取り除く
  //     return sanitizedInput.replace(/[%％]/g, "");

  // パーセント記号の処理
  const hasPercent = /[%％]/.test(sanitizedInput);
  if (hasPercent) {
    sanitizedInput = sanitizedInput.replace(/[%％]/g, "");
  }

  // パーセント記号がない場合は、半角パーセントを追加
  //   if (!hasPercent) {
  //     sanitizedInput += "%";
  //   }
  sanitizedInput += "%";

  return sanitizedInput;
}

// 使用例
// console.log(normalizeDiscountRate("3.5%")); // "3.5"
// console.log(normalizeDiscountRate("３.５％")); // "3.5"
// console.log(normalizeDiscountRate("abc3.5%def")); // "3.5"

// replace メソッドは、指定された正規表現に一致する文字列を探して置換する機能を持ちますが、一致するものが見つからない場合は単に何も置換せずに元の文字列をそのまま返します。

/**
if ((sanitizedInput.match(/\./g) || []).length > 1) について

指定された行 if ((sanitizedInput.match(/\./g) || []).length > 1) は、文字列 sanitizedInput 内の小数点（.）の数を確認し、それが1つより多いかどうかをチェックしています。この処理は、以下の手順で行われます：

sanitizedInput.match(/\./g): この部分は、sanitizedInput 内で正規表現 /\./g に一致するすべてのインスタンスを探します。正規表現 /\./g は、文字列内のすべての小数点（.）を意味します。g フラグはグローバル検索を表し、文字列内のすべての一致を見つけるようにします。

|| []: JavaScriptでは、match メソッドが一致するものを見つけられなかった場合、null を返します。この || [] は、match から null が返された場合に空の配列 [] を使用するためのフォールバックです。これにより、一致するものがない場合にエラーが発生するのを防ぎます。

.length > 1: 最後に、match メソッド（またはフォールバックの空配列）から返された配列の長さを確認します。この長さが1より大きい場合、つまり2つ以上の小数点が存在する場合、条件文は true と評価されます。

この行の目的は、入力文字列が2つ以上の小数点を含んでいる場合（つまり、無効な数値形式である場合）を検出し、それに応じて処理を行うことです。この場合、関数は空文字列を返し、無効な入力を示します。
 */

/**
String.fromCharCode(s.charCodeAt(0) - 0xfee0)について

fromCharCode(s.charCodeAt(0) - 0xfee0) の部分は、全角の日本語数字を半角の数字に変換するための処理です。このコードは、JavaScriptの String オブジェクトのメソッドを使用しています。具体的には、以下の手順で処理が行われます。

s.charCodeAt(0): 文字列 s の最初の文字のUnicodeコードポイント（数値）を取得します。例えば、"１"（全角の1）のコードポイントは 65297 です。

0xfee0: これは16進数で 65248 を表します。全角数字と半角数字の間の差分です。

s.charCodeAt(0) - 0xfee0: 全角数字のコードポイントから 65248 を引くと、対応する半角数字のコードポイントになります。例えば、全角の "１" から 65248 を引くと、半角の "1" のコードポイントである 49 になります。

String.fromCharCode(...): 指定されたUnicodeコードポイントに対応する文字を生成します。この例では、49 から文字 "1" が生成されます。

結果として、この処理は全角の日本語数字を対応する半角数字に変換します。例えば、全角の "１２３４５" は半角の "12345" に変換されます。

この変換は、全角数字と半角数字のUnicodeコードポイントの差を利用しているため、日本語の全角数字に特化した処理です。他の文字や記号には適用できないので注意が必要です。また、この方法は他の全角文字（例えばアルファベットや中国語の文字など）には適用できません。
 */
