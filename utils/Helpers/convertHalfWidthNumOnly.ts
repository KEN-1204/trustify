// 半角数字のみで、小数点は四捨五入する

export function convertHalfWidthNumOnly(input: string) {
  // 全角数字を半角に変換する関数
  const fullWidthToHalfWidth = (str: string) =>
    str.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0));

  // 1. 全角数字を半角に変換
  let result = fullWidthToHalfWidth(input);

  // 2. 数字以外を除去
  result = result.replace(/[^\d.]/g, "");

  // 3. 数字が含まれていない場合は空文字を返す
  if (!/\d/.test(result)) {
    return "";
  }

  // 4. 小数点が含まれている場合は四捨五入
  if (result.includes(".")) {
    return String(Math.round(parseFloat(result)));
  }

  return result;
}

// 使用例
// console.log(convertAndProcessInput('１２３４.５６７８'));  // "1235"
// console.log(convertAndProcessInput('テスト'));           // ""
// console.log(convertAndProcessInput('１２３４円'));       // "1234"
