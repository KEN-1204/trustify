import { CustomerBusinessCalendars } from "@/types";
import useDashboardStore from "@/store/useDashboardStore";
import { formatDateToYYYYMMDD } from "./formatDateLocalToYYYYMMDD";

// 🔹休業日以外の日付を営業日として追加してユーザーの月初日から始まるカレンダーリストを生成する関数
export function fillWorkingDaysForEachFiscalMonth(
  closingDaysData: {
    fiscal_year_month: string;
    start_date: string;
    end_date: string;
    closing_days: CustomerBusinessCalendars[];
  }[]
): { fiscalYearMonth: string; allDays: CustomerBusinessCalendars[] }[] | null {
  console.log("🔥fillWorkingDaysForEachFiscalMonth関数 実行");
  console.time("fillWorkingDaysForEachFiscalMonth関数");
  const UserProfileState = useDashboardStore((state) => state.userProfileState);
  if (!UserProfileState?.company_id) return null;

  const completeAnnualFiscalCalendar = closingDaysData.map((monthData, index) => {
    const { fiscal_year_month, closing_days, start_date, end_date } = monthData;

    const startDate = new Date(start_date);
    const endDate = new Date(end_date); // 翌月度の月初なので < の未満までループ処理

    // 月度内の全ての日付リスト
    const allDays: CustomerBusinessCalendars[] = [];
    let d = new Date(startDate);
    while (d < endDate) {
      console.log(`🔥fillWorkingDaysForEachFiscalMonth関数 forループ ${fiscal_year_month} - ${d.getDate()}`);
      // const formattedDate = d.toISOString().split("T")[0]; // 日付情報のみ取得
      const formattedDate = formatDateToYYYYMMDD(d); // 日付情報のみ取得

      // 既存の休業日かどうかをチェック(既に配列内に存在する日付の場合は休業日のため営業日はpushしない)
      const isClosingDay = closing_days.some((cd) => cd.date === formattedDate);

      // 休業日でない場合はpush
      if (!isClosingDay) {
        // 営業日として追加
        allDays.push({
          id: "", // 適宜生成または割り当て
          created_at: "", // 適宜生成または割り当て new Date().toISOString()
          updated_at: null,
          customer_id: UserProfileState.company_id,
          date: formattedDate,
          status: "working_day",
          working_hours: 480,
        });
      } else {
        // 既存の休業日を追加
        allDays.push(closing_days.find((cd) => cd.date === formattedDate) as CustomerBusinessCalendars);
      }

      d.setDate(d.getDate() + 1); // 翌日に更新
    }

    console.timeEnd("fillWorkingDaysForEachFiscalMonth関数");
    return { fiscalYearMonth: fiscal_year_month, allDays: allDays };
  });

  return completeAnnualFiscalCalendar;
}
