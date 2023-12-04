// 起点となる開始日から現在まで何日経過しているかの経過日数を算出する関数

type Response = {
  elapsedDays: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export const getDaysElapsedFromTimestampToNowPeriodEndHours = (
  timestamp: number,
  currentPeriodEnd: number
): Response => {
  // console.log("timestamp", timestamp, "timestamp.toString().length", timestamp.toString().length);
  // UNIXタイムスタンプ(10桁の秒単位)の場合
  if (timestamp.toString().length === 10) {
    // サブスクリプションの開始日(UNIXタイムスタンプ)
    const startTimestamp = timestamp;
    // new Date()関数で扱うミリ秒に変換
    const startDate: Date = new Date(startTimestamp * 1000);
    // console.log("startDate", startDate);

    // 現在の日付、時間を取得
    const nowDate = new Date();
    // 現在の請求期間の終了日のDateオブジェクトを生成 2023/12/19 20:57:49
    const currentEndTime = new Date(currentPeriodEnd * 1000);
    // 特定の日付でDateオブジェクトを作成(タイムクロック使用中 現在は2024/1/20)
    const testClockCurrentDate: Date = new Date("2025-9-20"); // テストクロック

    // 特定の日付に現在の時間、分、秒を設定
    testClockCurrentDate.setHours(currentEndTime.getHours(), currentEndTime.getMinutes(), currentEndTime.getSeconds());
    // console.log("testClockCurrentDate", testClockCurrentDate);

    // 日付の差を計算(ミリ秒単位) Date.getTime()で日付をミリ秒単位で取得してから引き算する
    const differenceInMilliseconds = testClockCurrentDate.getTime() - startDate.getTime();

    // 日付の差を日単位に変換
    const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);
    // console.log("differenceInDays", differenceInDays);

    // 経過日数(小数点以下を切り捨て)
    const truncatedDifferenceInDays = Math.floor(differenceInDays);
    // console.log("truncatedDifferenceInDays", truncatedDifferenceInDays);

    // 経過日数(小数点あり) 0.84782...
    const daysElapsed = differenceInDays; // 小数点あり経過日数
    const hours = Math.floor(daysElapsed * 24); // 経過日数の時間
    const minutes = Math.floor((daysElapsed * 24 - hours) * 60); // 経過日数の分
    const seconds = Math.floor(((daysElapsed * 24 - hours) * 60 - minutes) * 60); // 経過日数の秒

    const response = {
      elapsedDays: truncatedDifferenceInDays,
      hours: hours,
      minutes: minutes,
      seconds: seconds,
    };

    // console.log(`${truncatedDifferenceInDays}日 1日以下の場合は残り${hours}時間${minutes}分${seconds}秒`);

    return response;
  }
  // timestampがミリ秒単位の場合
  else {
    // サブスクリプションの開始日(ミリ秒のタイムスタンプ)
    const startTimestamp = timestamp;
    // new Date()関数で扱うミリ秒に変換
    const startDate: Date = new Date(startTimestamp);

    // 現在の日付、時間を取得
    const now = new Date();
    // 現在の請求期間の終了日のDateオブジェクトを生成 2023/12/19 20:57:49
    const currentEndTime = new Date(currentPeriodEnd * 1000);
    // 特定の日付でDateオブジェクトを作成(タイムクロック使用中 現在は2024/1/20)
    const testClockCurrentDate: Date = new Date("2025-9-20"); // テストクロック

    // 特定の日付に現在の時間、分、秒を設定
    testClockCurrentDate.setHours(currentEndTime.getHours(), currentEndTime.getMinutes(), currentEndTime.getSeconds());

    // 日付の差を計算(ミリ秒単位) Date.getTime()で日付をミリ秒単位で取得してから引き算する
    const differenceInMilliseconds = testClockCurrentDate.getTime() - startDate.getTime();

    // 日付の差を日単位に変換
    const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);

    // 経過日数(小数点以下を切り捨て)
    const truncatedDifferenceInDays = Math.floor(differenceInDays);

    // 経過日数(小数点あり) 0.84782...
    const daysElapsed = differenceInDays; // 小数点あり経過日数
    const hours = Math.floor(daysElapsed * 24); // 経過日数の時間
    const minutes = Math.floor((daysElapsed * 24 - hours) * 60); // 経過日数の分
    const seconds = Math.floor(((daysElapsed * 24 - hours) * 60 - minutes) * 60); // 経過日数の秒

    const response = {
      elapsedDays: truncatedDifferenceInDays,
      hours: hours,
      minutes: minutes,
      seconds: seconds,
    };

    return response;
  }
};
