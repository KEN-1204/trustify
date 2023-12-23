// ローカルエリアでの年月日のみを比較する関数

export function isSameDateLocal(date1: string | Date | null, date2: string | Date | null) {
  if (!date1 || !date2) return false;
  const parsedDate1 = typeof date1 === "string" ? new Date(date1) : date1;
  const parsedDate2 = typeof date2 === "string" ? new Date(date2) : date2;

  return (
    parsedDate1.getFullYear() === parsedDate2.getFullYear() &&
    parsedDate1.getMonth() === parsedDate2.getMonth() &&
    parsedDate1.getDate() === parsedDate2.getDate()
  );
}

// 使用例
// const result = isSameLocalDate("2023-12-26T15:00:00+00:00", "Wed Dec 27 2023 00:00:00 GMT+0900 (日本標準時)");
// console.log(result); // これは true を返すはずです。

// オリジナル 2023-12-26T15:00:00+00:00

/**
「2023-12-26T15:00:00+00:00」と「Wed Dec 27 2023 00:00:00 GMT+0900 (日本標準時)」の日付は、タイムゾーンが異なることで異なる日付と時間を示していますが、実際には同じ瞬間を指しています。

🌟「2023-12-26T15:00:00+00:00」の解釈：
これは協定世界時 (UTC) での日時を示しており、2023年12月26日の15時00分00秒です。

🌟「Wed Dec 27 2023 00:00:00 GMT+0900 (日本標準時)」の解釈：
これは日本標準時 (JST) での日時を示しており、2023年12月27日の00時00分00秒です。日本標準時はUTCより9時間進んでいるので、UTCでの「2023-12-26T15:00:00+00:00」と同じ瞬間を表しています。
 */
