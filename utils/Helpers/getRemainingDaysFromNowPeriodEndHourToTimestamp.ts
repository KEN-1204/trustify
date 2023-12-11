// 現在から期間終了日まであと何日かを取得する関数(現在の時間、分、秒はcurrent_period_endに合わせる)

type Response = {
  remainingDays: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export const getRemainingDaysFromNowPeriodEndHourToTimestamp = (periodEndTimestamp: number): Response => {
  // UNIXタイムスタンプ(10桁の秒単位)の場合
  if (periodEndTimestamp.toString().length === 10) {
    // サブスクリプションの開始日(UNIXタイムスタンプ)
    const endTimestamp = periodEndTimestamp;
    // new Date()関数で扱うミリ秒に変換
    const endDate: Date = new Date(endTimestamp * 1000);

    // 現在の日付、時間を取得
    const nowDate = new Date();
    // 現在の請求期間の終了日のDateオブジェクトを生成 2023/12/19 20:57:49
    // const currentEndTime = new Date(periodEndTimestamp * 1000);
    // 特定の日付でDateオブジェクトを作成(タイムクロック使用中 現在は2024/1/20)
    const testClockCurrentDate: Date = new Date("2026-7-20"); // テストクロック

    // 特定の日付にcurrent_period_endの時間、分、秒を設定
    testClockCurrentDate.setHours(endDate.getHours(), endDate.getMinutes(), endDate.getSeconds());
    // console.log("残り何日か testClockCurrentDate", testClockCurrentDate);

    // 日付の差を計算(ミリ秒単位) Date.getTime()で日付をミリ秒単位で取得してから引き算する
    const differenceInMilliseconds = endDate.getTime() - testClockCurrentDate.getTime();

    // 日付の差を日単位に変換
    const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);
    // console.log("残り何日か differenceInDays", differenceInDays);

    // 経過日数(小数点以下を切り捨て)
    const truncatedDifferenceInDays = Math.floor(differenceInDays);
    // console.log("残り何日か truncatedDifferenceInDays", truncatedDifferenceInDays);

    // 経過日数(小数点あり) 0.84782...
    const daysRemaining = differenceInDays; // 小数点あり経過日数
    const hours = Math.floor(daysRemaining * 24); // 経過日数の時間
    const minutes = Math.floor((daysRemaining * 24 - hours) * 60); // 経過日数の分
    const seconds = Math.floor(((daysRemaining * 24 - hours) * 60 - minutes) * 60); // 経過日数の秒

    const response = {
      remainingDays: truncatedDifferenceInDays,
      hours: hours,
      minutes: minutes,
      seconds: seconds,
    };

    // console.log(`残り${truncatedDifferenceInDays}日${hours}時間${minutes}分${seconds}秒`);

    return response;
  }
  // timestampがミリ秒単位の場合
  else {
    // サブスクリプションの開始日(ミリ秒のタイムスタンプ)
    const endTimestamp = periodEndTimestamp;
    // new Date()関数で扱うミリ秒に変換
    const endDate: Date = new Date(endTimestamp);

    // 現在の日付、時間を取得
    const now = new Date();
    // 現在の請求期間の終了日のDateオブジェクトを生成 2023/12/19 20:57:49
    // const currentEndTime = new Date(currentPeriodEnd * 1000);
    // 特定の日付でDateオブジェクトを作成(タイムクロック使用中 現在は2024/1/20)
    const testClockCurrentDate: Date = new Date("2026-7-20"); // テストクロック

    // 特定の日付に現在の時間、分、秒を設定
    testClockCurrentDate.setHours(endDate.getHours(), endDate.getMinutes(), endDate.getSeconds());

    // 日付の差を計算(ミリ秒単位) Date.getTime()で日付をミリ秒単位で取得してから引き算する
    const differenceInMilliseconds = endDate.getTime() - testClockCurrentDate.getTime();

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
      remainingDays: truncatedDifferenceInDays,
      hours: hours,
      minutes: minutes,
      seconds: seconds,
    };

    return response;
  }
};
