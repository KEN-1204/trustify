import { calculateCurrentFiscalYear } from "./calculateCurrentFiscalYear";

// 期首の日付を決算日から計算する関数
type Props = {
  fiscalYearEnd: Date | string | null;
  selectedYear?: number;
};
export const calculateFiscalYearStart = ({ fiscalYearEnd, selectedYear }: Props) => {
  if (!fiscalYearEnd) return null;
  // 決算日を設定するときにクライアントサイドで「fiscalEndDate.setHours(23, 59, 59, 999);」のようにミリ秒単位で決算日の終わりを設定してからtoISOStringでUTC時間文字列に変換してデータベースに保存しているため、
  // Supabaseデータベースから取得した決算日のUTC時間文字列を使って翌日の期首のDateオブジェクトを生成するときには、時間情報は全て0にリセットして期首のDateオブジェクトを生成する
  // まずはUTC文字列からDateオブジェクトを生成
  const fiscalYearEndDateObj = new Date(fiscalYearEnd);
  // 現在の会計年度を取得
  const currentFiscalYear = calculateCurrentFiscalYear(fiscalYearEnd);
  // 23:59:59:999の時間情報を0:0:0:000にリセット
  const fiscalYearEndDateOnly = new Date(
    // fiscalYearEndDateObj.getFullYear(),
    selectedYear ? selectedYear : currentFiscalYear,
    fiscalYearEndDateObj.getMonth(),
    fiscalYearEndDateObj.getDate()
  );
  // 期末から翌日に進めることで期首のDateオブジェクトを生成(時間情報はミリ秒単位で全て0)
  fiscalYearEndDateOnly.setDate(fiscalYearEndDateOnly.getDate() + 1);

  // console.log("🌠fiscalYearEnd", fiscalYearEnd, "fiscalYearEndDateOnly", fiscalYearEndDateOnly);

  // 月末が決算日だった場合は次の月の1日が期首になる
  return fiscalYearEndDateOnly;
};
