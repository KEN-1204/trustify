export const splitYearAndPeriod = (yearPeriod: number | null) => {
  if (!yearPeriod) return ["", ""];
  const _year = String(yearPeriod).substring(0, 4);
  const _period = String(yearPeriod).substring(4); // 1~2, 1~4, 01~12
  return [_year, _period];
};
