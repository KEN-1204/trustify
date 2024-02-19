import { CustomerBusinessCalendars } from "@/types";
import { formatDateToYYYYMMDD } from "./formatDateLocalToYYYYMMDD";

// 🔹ユーザーの会計年度に基づいた１年間のカレンダーベースのカレンダーを生成(全ての月を1日から末日まで)
export function generateFiscalYearCalendar(
  closingDaysData: {
    fiscal_year_month: string;
    start_date: string;
    end_date: string;
    closing_days: CustomerBusinessCalendars[];
  }[]
  // closingDaysData: {
  //   fiscal_year_month: string; // 2024-4
  //   start_date: string; // 2024-4-1(年月度の開始日)営業日を追加する時に使用
  //   end_date: string; // 2024-5-1(翌月度の月初)営業日を追加する時に使用
  //   closing_days: CustomerBusinessCalendars[]; // 休業日の日付オブジェクトの配列
  //   closing_days_count: number; // 各月度ごとの休業日の数
  // }[]
): {
  daysCountInYear: number;
  completeAnnualFiscalCalendar: {
    fiscalYearMonth: string;
    monthlyDays: { date: string; day_of_week: number; status: string | null }[];
  }[];
} | null {
  console.time("generateFiscalYearCalendar関数");

  let daysCountInYear = 0;

  const completeAnnualFiscalCalendar = closingDaysData.map((monthData) => {
    const { fiscal_year_month, closing_days } = monthData;

    // 月度の開始日と終了日を取得 fiscal_year_month: 2024-4
    const year = parseInt(fiscal_year_month.split("-")[0], 10); // 2024
    const month = parseInt(fiscal_year_month.split("-")[1], 10) - 1; // 3 月は0から始まる
    // カレンダーベース 会計月度の1日から末日まで
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0); // 翌月の0日は当月の最終日なので <= 以下でループ処理

    // 月度内の全ての日付リスト
    const monthlyDays: { date: string; day_of_week: number; status: string | null }[] = [];
    let d = new Date(startDate);
    while (d <= endDate) {
      console.log(`🔥generateFiscalYearCalendar関数 whileループ ${fiscal_year_month} - ${d.getDate()}`);
      // const formattedDate = d.toISOString().split("T")[0]; // 日付情報のみ取得
      const formattedDateNotZeroPad = formatDateToYYYYMMDD(d); // 日付情報のみ取得
      const formattedDate = formatDateToYYYYMMDD(d, true); // 0詰め日付情報のみ取得
      const dayOfWeek = d.getDay();
      const isClosed = closing_days.some((cd) => cd.date === formattedDate);

      monthlyDays.push({ date: formattedDateNotZeroPad, day_of_week: dayOfWeek, status: isClosed ? "closed" : null }); // リスト末尾に追加
      d.setDate(d.getDate() + 1); // 翌日に更新
    }

    // 年間日数変数にmonthlyDaysの要素数を加算する
    daysCountInYear += monthlyDays.length;

    return { fiscalYearMonth: fiscal_year_month, monthlyDays: monthlyDays };
  });

  const completeAnnualFiscalCalendarObj = {
    daysCountInYear: daysCountInYear,
    completeAnnualFiscalCalendar: completeAnnualFiscalCalendar,
  };

  console.timeEnd("generateFiscalYearCalendar関数");
  return completeAnnualFiscalCalendarObj;
}
