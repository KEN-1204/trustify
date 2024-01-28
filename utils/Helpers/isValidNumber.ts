// 数値に変換可能かをチェックする関数

export const isValidNumber = (value: any) => {
  // isNaN('10')やisNaN('0')は10や0で数値に変換してから判定するためfalseになるため、それの否定でtrueになる
  return !isNaN(value) && value !== "" && value !== null && value !== undefined;
};
