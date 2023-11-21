// 任意のタイムスタンプ同士の期間を算出する関数

type Response = {
  period: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export const getDaysFromTimestampToTimestamp = (timestamp1: number, timestamp2: number): Response => {
  // UNIXタイムスタンプ(10桁の秒単位)をミリ秒変換する
  const timestamp1InMillisec = timestamp1.toString().length === 10 ? timestamp1 * 1000 : timestamp1;
  const timestamp2InMillisec = timestamp2.toString().length === 10 ? timestamp2 * 1000 : timestamp2;

  const minTimestamp = Math.min(timestamp1InMillisec, timestamp2InMillisec);
  const maxTimestamp = Math.max(timestamp1InMillisec, timestamp2InMillisec);

  const startDate = new Date(minTimestamp);
  const endDate = new Date(maxTimestamp);

  // 日付の差を計算(ミリ秒単位) Date.getTime()で日付をミリ秒単位で取得してから引き算する
  const differenceInMilliseconds = endDate.getTime() - startDate.getTime();

  // 日付の差を日単位に変換
  const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);
  console.log("小数点あり differenceInDays", differenceInDays);

  // 経過日数(小数点以下を切り捨て)
  const truncatedDifferenceInDays = Math.floor(differenceInDays);
  console.log("四捨五入 truncatedDifferenceInDays", truncatedDifferenceInDays);

  // 日数が0以下だった時用に、期間が残り何時間何分何秒かを算出
  const differenceInSeconds = differenceInMilliseconds / 1000;
  const hours = Math.floor(differenceInSeconds / 3600); // 秒数を時間単位に変換して小数点を切り捨て
  const remainingSeconds = differenceInSeconds - hours * 3600; // 切り捨て後の時間を秒数に戻してから切り捨て無しの秒数を引くことで残り秒数を取得
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds - minutes * 60;

  const response = {
    period: truncatedDifferenceInDays,
    hours: hours,
    minutes: minutes,
    seconds: seconds,
  };

  console.log(`期間${truncatedDifferenceInDays}日 1日以下の場合は残り${hours}時間${minutes}分${seconds}秒`);

  return response;
};
