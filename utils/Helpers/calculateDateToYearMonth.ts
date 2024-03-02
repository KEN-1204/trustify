// 面談日付から面談年月度を算出する関数

export const calculateDateToYearMonth = (dateObj: Date, closingDay: number): number => {
  // 面談予定日の年と日を取得
  let year = dateObj.getFullYear(); // 例: 2023
  let month = dateObj.getMonth() + 1; // getMonth()は0から11で返されるため、+1して1から12に調整

  // 面談日が締め日の翌日以降の場合、次の月度とみなす
  if (dateObj.getDate() > closingDay) {
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  // 年月度を6桁の数値で表現
  const fiscalYearMonth = year * 100 + month;

  console.log(
    "✅年月度取得 fiscalYearMonth",
    fiscalYearMonth,
    "year",
    year,
    "month",
    month,
    "closingDay",
    closingDay,
    "dateObj",
    dateObj
  );

  return fiscalYearMonth;
};
