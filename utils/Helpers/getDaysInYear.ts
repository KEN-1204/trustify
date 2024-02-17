export function getDaysInYear(year: number) {
  const startOfYear = new Date(year, 0, 1); // その年の1月1日
  const endOfYear = new Date(year + 1, 0, 1); // 翌年の1月1日
  const diff = endOfYear.getTime() - startOfYear.getTime(); // ミリ秒での差分
  const daysInYear = diff / (1000 * 60 * 60 * 24); // 日数に変換
  return daysInYear;
}
