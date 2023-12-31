// 起点となる開始日から現在まで何日経過しているかの経過日数を算出する関数

type Response = {
  elapsedDays: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export const getDaysElapsedFromTimestampToNow = (timestamp: number): Response => {
  // console.log("timestamp", timestamp, "timestamp.toString().length", timestamp.toString().length);
  // UNIXタイムスタンプ(10桁の秒単位)の場合
  if (timestamp.toString().length === 10) {
    // サブスクリプションの開始日(UNIXタイムスタンプ)
    const startTimestamp = timestamp;
    // new Date()関数で扱うミリ秒に変換
    const startDate: Date = new Date(startTimestamp * 1000);
    // console.log("startDate", startDate);

    // 現在の日付、時間を取得
    const now = new Date();
    // 特定の日付でDateオブジェクトを作成(タイムクロック使用中 現在は2024/1/20)
    const testClockCurrentDate: Date = new Date("2024-1-1"); // テストクロック

    // 特定の日付に現在の時間、分、秒を設定
    testClockCurrentDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
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

    // console.log(`${truncatedDifferenceInDays}日${hours}時間${minutes}分${seconds}秒`);

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
    // 特定の日付でDateオブジェクトを作成(タイムクロック使用中 現在は2024/1/20)
    const testClockCurrentDate: Date = new Date("2024-1-1"); // テストクロック

    // 特定の日付に現在の時間、分、秒を設定
    testClockCurrentDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

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

// 1000を乗算することで、ミリ秒を秒単位のUNIXタイムスタンプへ変換
// 「60 * 60 * 24」は、秒を日単位に変換している。
// 1分は60秒、1時間は60分、1日は24時間なので、これらを乗算すると、1日は「60秒 × 60分 × 24時間 = 86400秒」となる。
// 従って、秒単位の時間を日単位に変換するには、この数値に(86400)で徐算する。
// 例：7200秒は、「7200 ÷ 3600 = 2」で2時間という形で割り出す。

/**
 * 🌟Date.now()とnew Date()との違い

🔹Date.now():
・現在の日時をミリ秒単位の数値として返します。
・この数値は、UNIXエポック(1970年1月1日0時0分0秒 UTC)からの経過時間を表します。
・Date.now()はDateオブジェクトを生成せず、直接数値を返します。

🔹new Date():
・新しいDateオブジェクトを生成します。
・引数を指定しない場合、現在の日時でDateオブジェクトが生成されます。
・引数として特定の日付や時刻を渡すことができ、その日時を表すDateオブジェクトが生成されます。
・Dateオブジェクトは、日時と時刻に関連するさまざまなメソッドを持ち、より複雑な日付処理を可能にします。
 */
