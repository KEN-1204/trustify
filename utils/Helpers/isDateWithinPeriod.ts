type Props = {
  targetDate: Date;
  startDate: Date;
  endDate: Date;
};
// 年月日のみを比較する関数
export function isDateWithinPeriod({ targetDate, startDate, endDate }: Props) {
  // 年月日のみを比較するため、時間情報をクリア
  const clearTime = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const target = clearTime(targetDate).getTime();
  const start = clearTime(startDate).getTime();
  const end = clearTime(endDate).getTime();

  // 指定した日付が期間内にあるかどうかを判定
  //   return target >= start && target <= end;
  return start <= target && target <= end;
}
