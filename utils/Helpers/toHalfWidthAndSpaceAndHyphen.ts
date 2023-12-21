// 全角文字、スペース、ハイフンを半角に変換(!,?なども含む)
export const toHalfWidthAndSpaceAndHyphen = (strVal: string) => {
  // 全角文字コードの範囲は65281 - 65374、スペースの全角文字コードは12288
  return strVal
    .replace(/[！-～]/g, (match) => {
      return String.fromCharCode(match.charCodeAt(0) - 0xfee0);
    })
    .replace(/　/g, " ") // 全角スペースを半角スペースに
    .replace(/ー/g, "-") // 全角ハイフンを半角ハイフンに
    .replace(/−/g, "-"); // 全角ハイフンを半角ハイフンに
};
