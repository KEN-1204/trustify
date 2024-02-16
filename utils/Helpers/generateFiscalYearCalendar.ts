import { CustomerBusinessCalendars } from "@/types";
import useDashboardStore from "@/store/useDashboardStore";
import { formatDateToYYYYMMDD } from "./formatDateLocalToYYYYMMDD";

// 🔹ユーザーの会計年度に基づいた１年間のカレンダーベースのカレンダーを生成(全ての月を1日から末日まで)
export function generateFiscalYearCalendar(
  closingDaysData: {
    fiscal_year_month: string;
    start_date: string;
    end_date: string;
    closing_days: CustomerBusinessCalendars[];
  }[]
): { fiscalYearMonth: string; allDays: { date: string }[] }[] | null {
  console.time("generateFiscalYearCalendar関数");

  const completeAnnualFiscalCalendar = closingDaysData.map((monthData) => {
    const { fiscal_year_month } = monthData;

    // 月度の開始日と終了日を取得 fiscal_year_month: 2024-4
    const year = parseInt(fiscal_year_month.split("-")[0], 10); // 2024
    const month = parseInt(fiscal_year_month.split("-")[1], 10) - 1; // 3 月は0から始まる
    // カレンダーベース 会計月度の1日から末日まで
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0); // 翌月の0日は当月の最終日なので <= 以下でループ処理

    // 月度内の全ての日付リスト
    const allDays: { date: string }[] = [];
    let d = new Date(startDate);
    while (d <= endDate) {
      console.log(`🔥generateFiscalYearCalendar関数 whileループ ${fiscal_year_month} - ${d.getDate()}`);
      // const formattedDate = d.toISOString().split("T")[0]; // 日付情報のみ取得
      const formattedDate = formatDateToYYYYMMDD(d); // 日付情報のみ取得

      allDays.push({ date: formattedDate }); // リスト末尾に追加

      d.setDate(d.getDate() + 1); // 翌日に更新
    }

    console.timeEnd("generateFiscalYearCalendar関数");

    return { fiscalYearMonth: fiscal_year_month, allDays: allDays };
  });

  return completeAnnualFiscalCalendar;
}
