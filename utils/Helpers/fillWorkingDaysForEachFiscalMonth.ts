import { CustomerBusinessCalendars } from "@/types";
import useDashboardStore from "@/store/useDashboardStore";
import { formatDateToYYYYMMDD } from "./formatDateLocalToYYYYMMDD";

// 🔹休業日以外の日付を営業日として追加してユーザーの月初日から始まるカレンダーリストを生成する関数
export function fillWorkingDaysForEachFiscalMonth(
  closingDaysData: {
    fiscal_year_month: string;
    start_date: string;
    // end_date: string;
    next_month_start_date: string;
    closing_days: CustomerBusinessCalendars[];
  }[],
  // closingDaysData: {
  //   fiscal_year_month: string; // 2024-4
  //   start_date: string; // 2024-4-1(年月度の開始日)営業日を追加する時に使用
  //   end_date: string; // 2024-5-1(翌月度の月初)営業日を追加する時に使用
  //   closing_days: CustomerBusinessCalendars[]; // 休業日の日付オブジェクトの配列
  //   closing_days_count: number; // 各月度ごとの休業日の数
  // }[],
  company_id: string
): {
  daysCountInYear: number;
  completeAnnualFiscalCalendar: {
    fiscalYearMonth: string;
    monthlyDays: CustomerBusinessCalendars[];
    monthlyWorkingDaysCount: number;
  }[];
} | null {
  console.log("🔥fillWorkingDaysForEachFiscalMonth関数 実行");
  // console.time("fillWorkingDaysForEachFiscalMonth関数");

  // 年間日数計算用
  let daysCountInYear = 0;

  // 期首の月初のカレンダー月 2023-03-21 => 03 => 3
  const firstMonthStartDateCalendar = parseInt(closingDaysData[0].start_date.split("-")[1], 10);

  const completeAnnualFiscalCalendar = closingDaysData.map((monthData, index) => {
    const { fiscal_year_month, closing_days, start_date, next_month_start_date } = monthData;

    // 月度の開始日と終了日を取得 fiscal_year_month: 2024-4
    const startDate = new Date(start_date);
    // const endDate = new Date(end_date); // 翌月度の月初なので < の未満までループ処理
    const nextMonthStartDate = new Date(next_month_start_date); // 翌月度の月初なので < の未満までループ処理

    // 月度内の全ての日付リスト
    const monthlyDays: CustomerBusinessCalendars[] = [];
    let workingDaysCount = 0;
    let d = new Date(startDate);
    // while (d < endDate) {
    while (d < nextMonthStartDate) {
      console.log(`🔥fillWorkingDaysForEachFiscalMonth関数 forループ ${fiscal_year_month} - ${d.getDate()}`);
      // const formattedDate = d.toISOString().split("T")[0]; // 日付情報のみ取得
      const formattedDateNotZeroPad = formatDateToYYYYMMDD(d); // 日付情報のみ取得
      const formattedDate = formatDateToYYYYMMDD(d, true); // 左0詰め日付情報のみ取得
      const dayOfWeek = d.getDay();

      // 既存の休業日かどうかをチェック(既に配列内に存在する日付の場合は休業日のため営業日はpushしない)
      // const isClosingDay = closing_days.some((cd) => cd.date === formattedDate);
      const isClosingDay = closing_days.some((cd) => cd.date === formattedDate);

      // 休業日でない場合はpush
      if (!isClosingDay) {
        // 営業日として追加
        monthlyDays.push({
          id: "", // 適宜生成または割り当て
          created_at: "", // 適宜生成または割り当て new Date().toISOString()
          updated_at: null,
          customer_id: company_id,
          // date: formattedDate,
          date: formattedDateNotZeroPad,
          day_of_week: dayOfWeek,
          status: "working_day",
          working_hours: 480,
        });
        // 営業日数カウントを１追加
        workingDaysCount += 1;
      } else {
        // 既存の休業日を追加
        // monthlyDays.push(closing_days.find((cd) => cd.date === formattedDate) as CustomerBusinessCalendars);
        const dateObj = closing_days.find((cd) => cd.date === formattedDate) as CustomerBusinessCalendars;
        const newDate = { ...dateObj, date: formattedDateNotZeroPad } as CustomerBusinessCalendars;
        monthlyDays.push(newDate);
      }

      d.setDate(d.getDate() + 1); // 翌日に更新
    }

    // 年間日数変数にmonthlyDaysの要素数を加算する
    daysCountInYear += monthlyDays.length;

    return { fiscalYearMonth: fiscal_year_month, monthlyDays: monthlyDays, monthlyWorkingDaysCount: workingDaysCount };
  });

  const completeAnnualFiscalCalendarObj = {
    daysCountInYear: daysCountInYear,
    completeAnnualFiscalCalendar: completeAnnualFiscalCalendar,
  };

  console.timeEnd("fillWorkingDaysForEachFiscalMonth関数");
  return completeAnnualFiscalCalendarObj;
}
