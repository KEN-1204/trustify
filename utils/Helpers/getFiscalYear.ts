// 日本：［2021年4月～2022年3月］を期間とする場合は2021年度
// アメリカ：［2021年4月～2022年3月］の期間であれば "FY 2022"

// const currentDate = new Date(); // 現在の日付
// const fiscalEndMonth = 3; // 決算月（例：3月）
// const language = 'ja'; // または 'en'

type Months = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
type DayOfMonth =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31;

// export function getFiscalYear(date: Date, fiscalEndMonth: number, fiscalEndDate: number, language: string): number {
export function getFiscalYear(
  date: Date,
  fiscalEndMonth: number,
  fiscalEndDate: number,
  fiscalYearBasis: string
): number {
  let year = date.getFullYear();
  let month = date.getMonth() + 1; // JavaScriptの月は0から始まるため、+1する
  let day = date.getDate();

  // 決算月以降の場合、年度を1増やす
  if (month > fiscalEndMonth || (month === fiscalEndMonth && day > fiscalEndDate)) {
    year += 1;
  }

  // if (language === "ja") {
  if (fiscalYearBasis === "firstDayBasis") {
    // 日本語の場合、前年の年数に「年度」を付ける
    // return `${year - 1}年度`;
    return year - 1;
  } else {
    // 英語の場合、FYと年数を表示
    // return `FY ${year}`;
    return year;
  }
}

/**
ユーザーの決算月を基に年度を計算します。例えば、決算月が3月の場合、4月1日以降は新しい年度として計算されます。言語設定に応じて、日本語または英語で適切な形式の年度を表示します。

この方法を使用することで、ユーザーの決算月がいつであっても正確な年度を計算し、ローカライズされた形式で表示できます。
 */
