// 年と四半期の数値20231, 20232を生成する関数

export const generateYearQuarters = (): number[] => {
  const startYear = 2010;
  const endYear = new Date().getFullYear();

  let yearQuarters: number[] = [];

  for (let year = startYear; year < endYear; year++) {
    for (let i = 1; i <= 4; i++) {
      const yearQuarter = parseInt(`${year}${i}`, 10); // 20201, 20203
      yearQuarters.push(yearQuarter);
    }
  }

  return yearQuarters;
};
