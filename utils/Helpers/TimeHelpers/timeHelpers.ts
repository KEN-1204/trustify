export const validateTimePart = (part: string | null, type: "hour" | "minute") => {
  const regex = type === "hour" ? /^(2[0-3]|[01][0-9])$/ : /^[0-5][0-9]$/;
  return part && regex.test(part);
};

// exact: 完全一致・部分一致、range: HH:mmかnullのみ
export const combineTime = (
  hour: string | null,
  minute: string | null,
  searchType: "range" | "exact",
  language: string = "ja"
) => {
  const hourValid = validateTimePart(hour, "hour");
  const minuteValid = validateTimePart(minute, "minute");

  // Range の場合、完全な時間 "HH:mm" か null を返す
  if (searchType === "range") {
    if (hourValid && minuteValid) {
      return `${hour}:${minute}`; // WHERE time_column BETWEEN '08:30' AND '10:00
    } else if (hour === "" && minute === "") {
      return null; // 入力されていない場合はnullを返す
    } else {
      const errorMsg = language === "ja" ? "時間の入力値が適切ではありません。正確な時間を入力してください。" : "";
      throw new Error(errorMsg); // 不完全な入力はエラーを返す
    }
  }

  // Exact の場合、"HH:mm", "HH:", ":mm", または null を返す
  if (searchType === "exact") {
    if (hourValid && minuteValid) return `${hour}:${minute}`; // WHERE time_column = '08:30'
    if (hourValid) return `${hour}:`; // WHERE EXTRACT(HOUR FROM time_column) = '08';
    if (minuteValid) return `:${minute}`; // WHERE EXTRACT(MINUTE FROM time_column) = '30';
    return null; // 入力がない場合はnullを返す
  }

  // 念の為
  return null;
};

export const validateTime = (time: string | null) => {
  return !!time && /^(2[0-3]|[01][0-9]):[0-5][0-9]$/.test(time);
};
