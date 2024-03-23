// 1万円未満の場合はそのまま円単位で表示し、1万円以上の場合は千円以下（万円未満）を省略して表示
export function convertToJapaneseCurrencyFormatInYen(
  amountInYen: number,
  showCurrencySign: boolean = true,
  showOnlyHighestUnit: boolean = false
): string {
  // 兆、億、万の単位で分割
  const trillion = Math.floor(amountInYen / 1000000000000); // 1兆円
  const billion = Math.floor((amountInYen % 1000000000000) / 100000000); // 1億円
  const million = Math.floor((amountInYen % 100000000) / 10000); // 1万円

  // 金額をフォーマットする
  let formattedString = "";

  // 最上位の単位のみ残すルート
  if (showOnlyHighestUnit) {
    if (trillion > 0) {
      // 1兆円以上の場合は兆の単位のみ表示
      formattedString += `${trillion.toLocaleString()}兆`;
    } else if (billion > 0) {
      // 1億円以上の場合は億の単位のみ表示
      formattedString += `${billion.toLocaleString()}億`;
    } else if (million > 0) {
      // 1万円以上の場合は万の単位のみ表示
      formattedString += `${million.toLocaleString()}万`;
    } else {
      // 万円未満の場合、円単位で表示
      formattedString = amountInYen.toLocaleString();
    }
  } else {
    // 各単位の金額も省略せずに表示するルート
    if (trillion > 0) {
      formattedString += `${trillion.toLocaleString()}兆`;
    }
    if (billion > 0) {
      formattedString += `${billion.toLocaleString()}億`;
    }
    if (million > 0) {
      formattedString += `${million.toLocaleString()}万`;
    }

    // 万円未満の場合、千円単位以下（円）を表示
    if (amountInYen < 10000) {
      formattedString = amountInYen.toLocaleString(); // 千円以下（万円未満）の場合はそのまま円単位で表示
    }
  }

  formattedString = `${formattedString}${showCurrencySign ? `円` : ``}`;

  return formattedString;
}
