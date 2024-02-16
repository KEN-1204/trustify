// ローカルエリアの時間で日付をフォーマット
export function formatDateToYYYYMMDD(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // getMonth()は0から始まるため+1する
  const day = date.getDate();
  // 月と日が1桁の場合は先頭に0を追加して2桁にする
  const formattedMonth = month < 10 ? `0${month}` : month;
  const formattedDay = day < 10 ? `0${day}` : day;
  return `${year}-${formattedMonth}-${formattedDay}`;
}
