// time型のplanned_start_time、result_start_time、result_end_timeを時間と分のみに変換する関数
// 13:00:00を13:00のみ取得
export function formatTime(timeStr: string) {
  const [hour, minute] = timeStr.split(":");
  return `${hour}:${minute}`;
}
