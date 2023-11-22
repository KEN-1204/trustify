// 日付のみを比較して、正確な期間を取得する関数(年、月、日のみを取得して時刻情報を無視する)

export const getPeriodInDays = (timestamp1: number, timestamp2: number): number => {
  const date1 = new Date(timestamp1 * 1000);
  const date2 = new Date(timestamp2 * 1000);

  // 時刻情報をリセット
  const simplifiedDate1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const simplifiedDate2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());

  // 日付の差を計算
  const differenceInMilliseconds = Math.abs(simplifiedDate2.getTime() - simplifiedDate1.getTime());
  const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);

  // console.log("differenceInDays", differenceInDays);
  // console.log("date1", date1);
  // console.log("date2", date2);

  const accuratePeriod = Math.round(differenceInDays);
  // Math.round()を使用する理由は、日付の差の計算において時刻情報を無視しているためです。
  // 日付のみを比較する場合、それぞれの日付の時刻部分は0時0分0秒（つまり、その日の始まり）にリセットされます。このため、2つの日付の差をミリ秒単位で計算すると、正確には24時間未満の差が生じる可能性があります。
  // たとえば、1月1日の0時0分0秒と1月2日の0時0分0秒の差を計算すると、実際には1日の差があると考えますが、ミリ秒単位で見ると1日未満（23時間59分59秒）です。この場合、Math.round()を使用することで、このようなわずかな時刻の差を丸め、より直感的な「日数」の差を得ることができます。

  return accuratePeriod;
};
