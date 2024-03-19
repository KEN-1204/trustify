// 売上目標の月度のカラム名のmonth_01~month_12を
// ユーザーの年度初めの開始月からに変換する => month_04 ~ month_12, month_01 ~ month_03
export function transformMonthKeys(data: { [key: string]: number }, startMonth: number) {
  const transformed: { [key: string]: number } = {};
  Object.keys(data).forEach((key: string) => {
    // キーから月の部分を抽出し、数値に変換
    const monthOffset = parseInt(key.substring(6)) - 1; // month_01 から開始するため、-1する
    let newMonth = ((startMonth % 100) + monthOffset) % 12 || 12; // 12を超える場合は1から再計算、0の場合は12にする
    let newYear = Math.floor(startMonth / 100) + Math.floor(((startMonth % 100) + monthOffset - 1) / 12);
    const newKey = `month_${newMonth.toString().padStart(2, "0")}`; // 新しいキー名を生成
    transformed[newKey] = data[key];
  });
  return transformed;
}
