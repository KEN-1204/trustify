// 全角文字、スペースを半角に変換(!,?なども含む) => ハイフンは含まない
export const toHalfWidthAndSpace = (strVal: string) => {
  // 全角文字コードの範囲は65281 - 65374、スペースの全角文字コードは12288
  return strVal
    .replace(/[！-～]/g, (match) => {
      return String.fromCharCode(match.charCodeAt(0) - 0xfee0);
    })
    .replace(/　/g, " "); // 全角スペースを半角スペースに
};
