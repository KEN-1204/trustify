import { utcToZonedTime } from "date-fns-tz";

export const dateJST = (timestampValue: number) => {
  let timestamp: number;
  // 10桁のUNIXタイムスタンプか13桁のタイムスタンプか確認してUNIXタイムスタンプなら1000倍してミリ秒に変換
  // UNIXタイムスタンプは10桁の数字（秒単位）で、JavaScriptのDateオブジェクトは13桁の数字（ミリ秒単位）である
  if (String(timestampValue).length === 13) {
    timestamp = timestampValue * 1000;
  } else {
    timestamp = timestampValue;
  }

  const japanTimezone = "Asia/Tokyo";

  // Dateオブジェクトを生成
  const utcDate = new Date(timestamp);
  //=> 2000-01-01T00:00:00.000Z

  // 現在のUTC時刻を日本時間に変換
  const dateInJapan = utcToZonedTime(utcDate, japanTimezone);
  //=> 2000-01-01T09:00:00.000Z

  return dateInJapan;

  //   // Intl.DateTimeFormatを使用して日本時間で日時を表示
  //   const options: Intl.DateTimeFormatOptions = {
  //     timeZone: "Asia/Tokyo",
  //     year: "numeric", // 'numeric' または '2-digit'
  //     month: "2-digit", // 'numeric', '2-digit', 'long', 'short', 'narrow'
  //     day: "2-digit", // 'numeric' または '2-digit'
  //     hour: "2-digit", // 'numeric' または '2-digit'
  //     minute: "2-digit", // 'numeric' または '2-digit'
  //     second: "2-digit", // 'numeric' または '2-digit'
  //   };
  //   const options: Intl.DateTimeFormatOptions = {
  //     timeZone: "Asia/Tokyo",
  //     year: "numeric",
  //     month: "long",
  //     day: "numeric",
  //     hour: "2-digit",
  //     minute: "2-digit",
  //     second: "2-digit",
  //   };

  // return new Intl.DateTimeFormat("ja-JP", options).format(date);
};
